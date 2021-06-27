'use strict';

const elWeights = document.getElementById ("weights");
const elInputWidth = document.getElementById ("input-canvas-width");
const elInputHeight = document.getElementById ("input-canvas-height");
const elIncludePlural = document.getElementById ("include-plural");
const elAddInclude = document.getElementById ("add-include-list");
const elFlagList = document.getElementById ("flag-list");
const elSubmitButton = document.getElementById ("submit-button");
const canvas = document.getElementById ("canvas");
const ctx = canvas.getContext ("2d");

var presetFlagData = `\
non-binary
ffdd00
ffffff
aa00aa
000000

genderfluid
fc75a0
ffffff
bd30cc
000000
3b47b4

trans
55aaff
ff55aa
ffffff
ff55aa
55aaff

asexual (5-stripe, nonstandard)
000000
777777
ffffff
aa33aa
660066

asexual
000000
777777
ffffff
770077

aro
33aa33
aaff88
ffffff
aaaaaa
000000

lesbian (5-stripe)
d52d00
ff9956
ffffff
d362a3
a30261

gay man (5-stripe)
11aa77
55ddcc
ffffff
55aaff
113355

intersex
ffff00
ffff00
ffff00

[spacer]`.split ("\n\n").map (function (str) {const i = str.indexOf ("\n"); return i < 0 ? {title: str, stripes: []} : {title: str.substring (0, i), stripes: str.substring (i+1).split("\n")}});

var PRESET_INTERSEX = 0;
while (presetFlagData [PRESET_INTERSEX].title != "intersex")
    ++PRESET_INTERSEX;

var presetFlagIncludes = [];

// I am almost certain there must be a better way
// i do not know the better way
function handleAddPreset (e)
{
    const nPreset = e.currentTarget.nPreset;
    let p = document.createElement ("p");
    p.innerHTML = presetFlagData [nPreset].title;
    presetFlagIncludes.push (nPreset);
    elFlagList.appendChild (p);
}

function clearAllPresets ()
{
    while (elFlagList.childElementCount)
	elFlagList.removeChild (elFlagList.children [0]);
    presetFlagIncludes = [];
}

function initiatePresetButtons ()
{
    presetFlagIncludes = [];
    var i = 0;
    for (var preset of presetFlagData)
    {
	let button = document.createElement ("button");
	//button.innerHTML = "Add " + preset.title + " flag";
	button.innerHTML = preset.title;
	button.nPreset = i;
	button.addEventListener ("click", handleAddPreset, false);
	elAddInclude.appendChild (button);
	++i;
    }
    let button = document.createElement ("button");
    button.innerHTML = "Clear all flags";
    button.addEventListener ("click", clearAllPresets, false);
    elAddInclude.appendChild (button);
}
initiatePresetButtons ();

// basically insertion sort, but only get like 5 minimal ones
// why this was chosen instead of qsort:
// doing it like this should be better than qsort with like maybe 30+ colors
// idk about memory, probably better in terms of allocation too?
function getClosestN (aValueAndId, cColor)
{
    var aOutput = []; // aOutput has increasing values; first of aOutput is best/minimal
    var i; // aOutput index
    for (i = 0; i < cColor; ++i)
	aOutput.push ([Infinity, null]);
    for (var valueAndId of aValueAndId)
    {
	i = cColor - 1;
	while (i >= 0 && valueAndId [0] < aOutput [i] [0])
	{
	    if (i < cColor - 1)
		aOutput [i + 1] = aOutput [i];
	    --i;
	}
	++i;
	if (i < cColor)
	{
	    aOutput [i] = valueAndId;
	}
    }
    return aOutput;
}

class ColorRing
{
    constructor (x, y, r, colorstr)
    {
	this.x = x - .5;
	this.y = y - .5;
	this.rad = r;
	this.color = new Uint8Array (3);
	for (var i = 0; i < 3; ++i)
	    this.color [i] = parseInt (colorstr.substring (i * 2, i * 2 + 2), 16);
    }
    distSquareAsPoint (x, y)
    {
	var dx = Math.abs (x - this.x);
	var dy = Math.abs (y - this.y);
	// wraparound
	if (dx * 2 > canvas.width)
	    dx = canvas.width - dx;
	if (dy * 2 > canvas.height)
	    dy = canvas.height - dy;
	return dx * dx + dy * dy;
    }
    dist (x, y)
    {
	return Math.abs(Math.sqrt(this.distSquareAsPoint (x, y)) - this.rad);
    }
}


function generatePoints ()
{
    var points = [];
    const cCol = presetFlagIncludes.length;
    for (var col = 0; col < cCol; ++col)
    {
	const presetIndex = presetFlagIncludes [col];
	const x = (col + .5) * canvas.width / cCol;
	const cRow = presetFlagData [presetIndex].stripes.length;
	for (var stripe = 0; stripe < cRow; ++stripe)
	{
	    const y = (stripe + .5) * canvas.height / cRow;
	    const color = new ColorRing (x, y, 0, presetFlagData [presetIndex].stripes [stripe]);
	    points.push (color);
	}
	if (presetIndex == PRESET_INTERSEX)
	{
	    points.push (new ColorRing (x, canvas.height/2, Math.min(canvas.width,canvas.height)/4, "770077"));
	}
    }
    if (elIncludePlural.checked)
    {
	var h = Math.min(canvas.width,canvas.height)/6;
	var r = h * 1.4;
	points.push (new ColorRing (canvas.width/2    , canvas.height/2 - h, r, "ffff00"));
	points.push (new ColorRing (canvas.width/2 + h, canvas.height/2    , r, "ff00aa"));
	points.push (new ColorRing (canvas.width/2    , canvas.height/2 + h, r, "3377ff"));
	points.push (new ColorRing (canvas.width/2 - h, canvas.height/2    , r, "00cc77"));
    }
    console.log (points);
    return points;
}

function loadWeights ()
{
    var weights = elWeights.value.split (" ").map (x => Number (x));
    var weightSum = weights.reduce ((a, b) => a + b);
    weights = weights.map (x => x / weightSum);
    return weights;
}


function doThingWithColors (closestThings, nc, weights, cRelevantColor)
{
    var sum = 0;
    for (var i = 0; i < cRelevantColor; ++i)
	sum += weights [i] * closestThings [i] [1].color [nc];
    return sum;
}

function generateFlag ()
{
    canvas.width = Number (elInputWidth.value);
    canvas.height = Number (elInputHeight.value);
    var imageData = new ImageData (canvas.width, canvas.height);
    var data = imageData.data;
    var distpoints = generatePoints ();
    var weights = loadWeights ();
    for (var i = 0; i < distpoints.length; ++i)
	distpoints [i] = [-1, distpoints [i]];
    var cRelevantColor = Math.min (weights.length, distpoints.length);
    var npc = 0; // number index / pixel / channel
    for (var y = 0; y < canvas.height; ++y)
    {
	for (var x = 0; x < canvas.width; ++x)
	{
	    for (var i = 0; i < distpoints.length; ++i)
		distpoints [i] [0] = distpoints [i] [1].dist (x, y);
	    var closestThings = getClosestN (distpoints, cRelevantColor);
	    for (var nc = 0; nc < 3; ++nc)
	    {
		//data [npc] = closestThings [0] [1].color [nc];
		data [npc] = doThingWithColors (closestThings, nc, weights, cRelevantColor);
		++npc;
	    }
	    data [npc] = 255;
	    ++npc;
	}
    }
    ctx.putImageData (imageData, 0, 0);
}

elSubmitButton.addEventListener ("click", generateFlag, false);
