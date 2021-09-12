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
const elWow = document.getElementById ("wow");
const elFlagControls = document.getElementById ("flag-controls");
const elClearFlagsButton = document.getElementById ("clear-flags-button");

var presetFlagData = `\
# 0-stripe

intersex
ffff00
ffff00
ffff00

# 3-stripe

genderqueer
b899dd
ffffff
6b8e3a

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

# 4-stripe

non-binary
ffdd00
ffffff
aa00aa
000000

asexual
000000
777777
ffffff
770077

# 5-stripe

genderfluid
fc75a0
ffffff
bd30cc
000000
3b47b4

transgender
55ccff
ffaabb
ffffff
ffaabb
55ccff

abrosexual
75ca92
b2e4c5
ffffff
e695b5
da446c

asexual
000000
777777
ffffff
aa33aa
660066

aromantic
33aa33
aaff88
ffffff
aaaaaa
000000

lesbian
d52d00
ff9956
ffffff
d362a3
a30261

gay man
11aa77
55ddcc
ffffff
55aaff
113355

# 6-stripe

genderflux
f27694
f2a3b9
cecece
7ce0f7
3ecdf9
fff48e

rainbow
e40001
fe8a01
f8eb00
007e24
004bfe
740585

# 7-stripe

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

# Other

[spacer]`.split ("\n\n");

function flagFromStr (str)
{
    const i = str.indexOf ("\n");
    if (i < 0)
	return {title: str, stripes: []};
    else
	return {title: str.substring (0, i), stripes: str.substring (i+1).split("\n")};
}

var presetFlagArray = [];

var PRESET_INTERSEX = 0;

function loadPresetFlagArray ()
{
    for (var presetString of presetFlagData)
    {
	if (presetString [0] != "#")
	{
	    var flag = flagFromStr (presetString);
	    presetFlagArray.push (flag);
	}
    }
    while (presetFlagArray [PRESET_INTERSEX].title != "intersex")
	++PRESET_INTERSEX;
}



var presetFlagIncludes = [];

// I am almost certain there must be a better way
// i do not know the better way

function handleAddPresetId (nPreset)
{
    let p = document.createElement ("span");
    p.innerHTML = presetFlagArray [nPreset].title;
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

function makePresetButton (flagIndex)
{
    let button = document.createElement ("button");
    //button.innerHTML = "Add " + preset.title + " flag";
    button.innerHTML = presetFlagArray [flagIndex].title;
    button.nPreset = flagIndex;
    button.addEventListener ("click", handleAddPreset, false);
    elAddInclude.appendChild (button);
}

function makePresetSection (i)
{
    if (i)
	elAddInclude.appendChild (document.createElement ("br"));
    let elSec = document.createElement ("h3");
    var num = 0;
    var str = presetFlagData [i];
    while (str [num] == "#" || str [num] == " ")
	++num;
    elSec.innerHTML = str.substr (num);
    elAddInclude.appendChild (elSec);
}

function initiatePresetButtons ()
{
    presetFlagIncludes = [];
    var i = 0;
    var flagIndex = 0;
    for (var preset of presetFlagData)
    {
	if (preset [0] == "#")
	{
	    makePresetSection (i);
	}
	else
	{
	    makePresetButton (flagIndex);
	    ++flagIndex;
	}
	++i;
    }
    //elAddInclude.appendChild (document.createElement ("br"));
    //let button = document.createElement ("button");
    //button.innerHTML = "Clear all flags";
    elClearFlagsButton.addEventListener ("click", clearAllPresets, false);
    //elFlagControls.appendChild (button);
    //elAddInclude.appendChild (document.createElement ("br"));
}

loadPresetFlagArray ();
initiatePresetButtons ();

function addCustomPreset ()
{
    var str = elCustomAddTextarea.value;
    if (!str)
	return;
    var id = presetFlagData.length;
    var flagIndex = presetFlagArray.length;
    presetFlagArray [flagIndex] = {title: "custom" + flagIndex, stripes: str.split ("\n")};

    makePresetButton (flagIndex);
    handleAddPresetId (flagIndex);
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
	    const cRow = presetFlagArray [presetIndex].stripes.length;
	    for (var stripe = 0; stripe < cRow; ++stripe)
	    {
		const y = (stripe + .5) * canvasHeight / cRow;
		const color = new ColorRing (x, y, 0, presetFlagArray [presetIndex].stripes [stripe]);
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
	    const cRow = presetFlagArray [presetIndex].stripes.length;
	    for (var stripe = 0; stripe < cRow; ++stripe)
	    {
		const x = (stripe + .5) * canvasWidth / cRow;
		const color = new ColorRing (x, y, 0, presetFlagArray [presetIndex].stripes [stripe]);
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


function generateFlagImage ()
{
    var date = Date.now();
    var canvasWidth = Number (elInputWidth.value);
    var canvasHeight = Number (elInputHeight.value);
    var distpoints = generatePoints (canvasWidth, canvasHeight);
    var weights = loadWeights ();
    doThingWithColors = elWow.checked ? doThingWithColorsWow : doThingWithColorsDefault;
    if (distpoints.length > 1 && weights.length > 0)
	doVoronoiOptimized (distpoints, weights, elImageOutput, canvasWidth, canvasHeight);
    console.log (Date.now() - date + " ms");
}

elSubmitButton.addEventListener ("click", function() {
    generateFlagImage ();
}, false);


/*
// for testing
handleAddPresetId (10);
handleAddPresetId (16);
handleAddPresetId (18);
handleAddPresetId (0);
handleAddPresetId (5);
generateFlagImage ();
*/
