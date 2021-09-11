'use strict';

const elWeights = document.getElementById ("weights");
const elInputWidth = document.getElementById ("input-canvas-width");
const elInputHeight = document.getElementById ("input-canvas-height");
const elIncludePlural = document.getElementById ("include-plural");
const elAddInclude = document.getElementById ("add-include-list");
const elCustomAddButton = document.getElementById ("custom-add-button");
const elCustomAddTextarea = document.getElementById ("custom-add-textarea");
const elFlagList = document.getElementById ("flag-list");
const elSubmitButton = document.getElementById ("submit-button");
const elUseVertical = document.getElementById ("flip-xy");
const elImageOutput = document.getElementById ("image-output");

var presetFlagData = `\
non-binary
ffdd00
ffffff
aa00aa
000000

demigirl
808080
c4c4c4
feb0ca
ffffff
feb0ca
c4c4c4
808080

deminonbinary
808080
c4c4c4
fbff75
ffffff
fbff75
c4c4c4
808080

demiboy
808080
c4c4c4
9bdaeb
ffffff
9bdaeb
c4c4c4
808080

pangender
fff798
feddcc
ffebfc
ffffff
ffebfc
feddcc
fff798

genderfluid
fc75a0
ffffff
bd30cc
000000
3b47b4

genderflux
f27694
f2a3b9
cecece
7ce0f7
3ecdf9
fff48e

agender
000000
cccccc
ffffff
b6f4a3
ffffff
cccccc
000000

bigender
c3789f
eca6cb
d4c6e7
ffffff
d4c6e7
9bc6e8
6d84d0

genderqueer
b899dd
ffffff
6b8e3a

transgender
55ccff
ffaabb
ffffff
ffaabb
55ccff

bisexual
d60270
d60270
9b4f96
0038a3
0038a3

pansexual
ff1b8d
ffd900
1bb3ff

polysexual
f61cb9
06d569
1c92f6

abrosexual
75ca92
b2e4c5
ffffff
e695b5
da446c

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

aromantic
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

function handleAddPresetId (nPreset)
{
    let p = document.createElement ("p");
    p.innerHTML = presetFlagData [nPreset].title;
    presetFlagIncludes.push (nPreset);
    elFlagList.appendChild (p);
}

function handleAddPreset (e)
{
    handleAddPresetId (e.currentTarget.nPreset);
}

function clearAllPresets ()
{
    while (elFlagList.childElementCount)
	elFlagList.removeChild (elFlagList.children [0]);
    presetFlagIncludes = [];
}

function makePresetButton (i)
{
    let button = document.createElement ("button");
    //button.innerHTML = "Add " + preset.title + " flag";
    button.innerHTML = presetFlagData [i].title;
    button.nPreset = i;
    button.addEventListener ("click", handleAddPreset, false);
    elAddInclude.appendChild (button);
}

function initiatePresetButtons ()
{
    presetFlagIncludes = [];
    var i = 0;
    for (var preset of presetFlagData)
    {
	makePresetButton (i);
	++i;
    }
    elAddInclude.appendChild (document.createElement ("br"));
    let button = document.createElement ("button");
    button.innerHTML = "Clear all flags";
    button.addEventListener ("click", clearAllPresets, false);
    elAddInclude.appendChild (button);
    elAddInclude.appendChild (document.createElement ("br"));
}
initiatePresetButtons ();

function addCustomPreset ()
{
    var str = elCustomAddTextarea.value;
    if (!str)
	return;
    var id = presetFlagData.length;
    presetFlagData [id] = {title: "custom" + id, stripes: str.split ("\n")};
    makePresetButton (id);
    handleAddPresetId (id);
}

elCustomAddButton.addEventListener ("click", addCustomPreset, false);


function generatePoints (canvasWidth, canvasHeight)
{
    var points = [];
    const cCol = presetFlagIncludes.length;
    if (!elUseVertical.checked)
    {
	for (var col = 0; col < cCol; ++col)
	{
	    const presetIndex = presetFlagIncludes [col];
	    const x = (col + .5) * canvasWidth / cCol;
	    const cRow = presetFlagData [presetIndex].stripes.length;
	    for (var stripe = 0; stripe < cRow; ++stripe)
	    {
		const y = (stripe + .5) * canvasHeight / cRow;
		const color = new ColorRing (x, y, 0, presetFlagData [presetIndex].stripes [stripe]);
		points.push (color);
	    }
	    if (presetIndex == PRESET_INTERSEX)
	    {
		points.push (new ColorRing (x, canvasHeight/2, Math.min(canvasWidth,canvasHeight)/4, "770077"));
	    }
	}
    }
    else
    {
	for (var col = 0; col < cCol; ++col)
	{
	    const presetIndex = presetFlagIncludes [col];
	    const y = (col + .5) * canvasHeight / cCol;
	    const cRow = presetFlagData [presetIndex].stripes.length;
	    for (var stripe = 0; stripe < cRow; ++stripe)
	    {
		const x = (stripe + .5) * canvasWidth / cRow;
		const color = new ColorRing (x, y, 0, presetFlagData [presetIndex].stripes [stripe]);
		points.push (color);
	    }
	    if (presetIndex == PRESET_INTERSEX)
	    {
		points.push (new ColorRing (canvasWidth/2, y, Math.min(canvasWidth,canvasHeight)/4, "770077"));
	    }
	}
    }
    if (elIncludePlural.checked)
    {
	var h = Math.min(canvasWidth,canvasHeight)/6;
	var r = h * 1.4;
	points.push (new ColorRing (canvasWidth/2    , canvasHeight/2 - h, r, "ffff00"));
	points.push (new ColorRing (canvasWidth/2 + h, canvasHeight/2    , r, "ff00aa"));
	points.push (new ColorRing (canvasWidth/2    , canvasHeight/2 + h, r, "3377ff"));
	points.push (new ColorRing (canvasWidth/2 - h, canvasHeight/2    , r, "00cc77"));
    }
    console.log (points);
    return points;
}

function loadWeights ()
{
    return loadWeightsFromString (elWeights.value);
}


elSubmitButton.addEventListener ("click", function() {
    var canvasWidth = Number (elInputWidth.value);
    var canvasHeight = Number (elInputHeight.value);
    var distpoints = generatePoints (canvasWidth, canvasHeight);
    var weights = loadWeights ();
    doVoronoiWithPoints (distpoints, weights, elImageOutput, canvasWidth, canvasHeight);
}, false);
