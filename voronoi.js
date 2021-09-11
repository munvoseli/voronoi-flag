'use strict';

// what you are meant to call in other programs:
// doVoronoiWithPoints (distpoints, weights, elImageOut, canvasWidth, canvasHeight)
// loadWeightsFromString (str)









function loadWeightsFromString (str)
{
    var weights = str.split (" ").map (x => Number (x));
    var weightSum = weights.reduce ((a, b) => a + b);
    weights = weights.map (x => x / weightSum);
    return weights;
}



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

var canvasWidth, canvasHeight;

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
    distSquareAsPoint (x, y, cw, ch) // dist to (x, y) on a canvas of size (cw, ch)
    {
	var dx = Math.abs (x - this.x);
	var dy = Math.abs (y - this.y);
	// wraparound
	if (dx * 2 > cw)
	    dx = canvasWidth - dx;
	if (dy * 2 > ch)
	    dy = canvasHeight - dy;
	return dx * dx + dy * dy;
    }
    dist (x, y, cw, ch)
    {
	return Math.abs(Math.sqrt(this.distSquareAsPoint (x, y, cw, ch)) - this.rad);
    }
}



function doThingWithColors (closestThings, nc, weights, cRelevantColor)
{
    var sum = 0;
    for (var i = 0; i < cRelevantColor; ++i)
	sum += weights [i] * closestThings [i] [1].color [nc];
    return sum;
}



// var distpoints = generatePoints ();
// var weights = loadWeights ();
function doVoronoiWithPoints (distpoints, weights, elImageOut, canvasWidth, canvasHeight)
{
    console.log (canvasWidth, canvasHeight);
    var canvas = document.createElement ("canvas");
    var ctx = canvas.getContext ("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var imageData = new ImageData (canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < distpoints.length; ++i)
	distpoints [i] = [-1, distpoints [i]];
    var cRelevantColor = Math.min (weights.length, distpoints.length);
    var npc = 0; // number index / pixel / channel
    for (var y = 0; y < canvas.height; ++y)
    {
	for (var x = 0; x < canvas.width; ++x)
	{
	    for (var i = 0; i < distpoints.length; ++i)
		distpoints [i] [0] = distpoints [i] [1].dist (x, y, canvas.width, canvas.height);
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
    elImageOut.src = canvas.toDataURL ("image/png");
}


