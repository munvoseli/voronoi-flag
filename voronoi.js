'use strict';

// what you are meant to call in other programs:
// doVoronoiWithPoints (distpoints, weights, elImageOut, canvasWidth, canvasHeight)
// loadWeightsFromString (str)









function loadWeightsFromString (str)
{
    if (!str)
	return [1];
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
	var hl = cw / 2;
	dx = hl - Math.abs (dx - hl);
	hl = ch / 2;
	dy = hl - Math.abs (dy - hl);
	/*if (dx * 2 > cw)
	    dx = cw - dx;
	if (dy * 2 > ch)
	    dy = ch - dy;*/
	return dx * dx + dy * dy;
    }
    distTaxicab (x, y, cw, ch)
    {
	var dx = Math.abs (x - this.x);
	var dy = Math.abs (y - this.y);
	var hl = cw / 2;
	dx = hl - Math.abs (dx - hl);
	hl = ch / 2;
	dy = hl - Math.abs (dy - hl);
	return Math.abs (dx) + Math.abs (dy);
    }
    distEuclidian (x, y, cw, ch)
    {
	return Math.abs(Math.sqrt(this.distSquareAsPoint (x, y, cw, ch)) - this.rad);
    }
    distTaxicabFull (x, y, cw, ch)
    {
	return Math.abs(this.distTaxicab (x, y, cw, ch) - this.rad);
    }
    dist (x, y, cw, ch)
    {
	return this.distEuclidian (x, y, cw, ch);
    }
}

function setRingDistMode (taxicab)
{
    if (taxicab)
	ColorRing.prototype.dist = ColorRing.prototype.distTaxicab;
    else
	ColorRing.prototype.dist = ColorRing.prototype.distEuclidian;
}

function doThingWithColorsDefault (closestThings, nc, weights, cRelevantColor)
{
    var sum = 0;
    for (var i = 0; i < cRelevantColor; ++i)
	sum += weights [i] * closestThings [i] [1].color [nc];
    return sum;
}

function doThingWithColorsWow (closestThings, nc, weights, cRelevantColor)
{
    var sum = 0;
    for (var i = 0; i < cRelevantColor; ++i)
	sum += weights [i] * closestThings [i] [1].color [nc];
    sum += (Math.random() - .5) * 50;
    if (sum > 255)
	sum = 255;
    else if (sum < 0)
	sum = 0;
    return sum;
}



function doThingWithColors () {};
doThingWithColors = doThingWithColorsDefault;



// var distpoints = generatePoints ();
// var weights = loadWeights ();
function doVoronoiWithPoints (distpoints, weights, elImageOut, canvasWidth, canvasHeight)
{
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


function fillSquare (x0, y0, l, data, color, canvasWidth, canvasHeight)
{
    var xf = Math.min (x0 + l, canvasWidth - 1);
    var yf = Math.min (y0 + l, canvasHeight - 1);
    var pixChannelIndex;/* = (y0 * canvasWidth + x0) * 4 + 3;
    if (l > 1)
    {
	for (var x = x0; x <= xf; ++x)
	{
	    if (data [pixChannelIndex])
	    {
		xf = x - 1;
		break;
	    }
	    pixChannelIndex += 4;
	} // the existence of branch prediction may make this code slower
	// no noticeable difference in speed
    }*/
    for (var y = y0; y <= yf; ++y)
    {
	pixChannelIndex = (y * canvasWidth + x0) * 4;
	for (var x = x0; x <= xf; ++x)
	{
	    data [  pixChannelIndex] = color [0];
	    data [++pixChannelIndex] = color [1];
	    data [++pixChannelIndex] = color [2];
	    data [++pixChannelIndex] = 255;
	    ++pixChannelIndex;
	}
    }
}

function getMinimumLength (distpoints)
{
    var min = distpoints [1] [0] - distpoints [0] [0];
    for (var i = 2; i < distpoints.length; ++i)
    {
	min = Math.min (distpoints [i] [0] - distpoints [i - 1] [0], min);
    }
    return min;
}

// this optimization assumes a euclidian-ish calculation for distance to the nearest point
// it also assumes that you have at least 2 points
function doVoronoiOptimized (distpoints, weights, elImageOut, canvasWidth, canvasHeight, taxicab)
{
    var canvas = document.createElement ("canvas");
    var ctx = canvas.getContext ("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var imageData = new ImageData (canvas.width, canvas.height);
    var data = imageData.data;
    const taxicabConstant = taxicab ? 2 : 2; // how much to scale squares down
    for (var i = 0; i < distpoints.length; ++i)
	distpoints [i] = [-1, distpoints [i]];
    // the number of colors needed for the optimization calculation
    // how many to get from getClosestN
    const cRelevantColorOpti = Math.min (weights.length + 1, distpoints.length);
    // the number of colors needed for the end color calculation
    const cRelevantColor = Math.min (weights.length, distpoints.length);
    var squareColor = new Uint8Array (3);
    var nSquares = 0;
    for (var y = 0; y < canvas.height; ++y)
    {
	for (var x = 0; x < canvas.width; ++x)
	{
	    if (data [(y * canvas.width + x) * 4 + 3] == 255)
		continue;
	    //console.log(JSON.stringify(distpoints));
	    for (var i = 0; i < distpoints.length; ++i)
		distpoints [i] [0] = distpoints [i] [1].dist (x, y, canvas.width, canvas.height);
	    var closestThings = getClosestN (distpoints, cRelevantColorOpti);
	    var dist = getMinimumLength (closestThings);
	    squareColor [0] = doThingWithColors (closestThings, 0, weights, cRelevantColor);
	    squareColor [1] = doThingWithColors (closestThings, 1, weights, cRelevantColor);
	    squareColor [2] = doThingWithColors (closestThings, 2, weights, cRelevantColor);
	    dist = dist >> taxicabConstant;
	    //dist = Math.floor (dist / 2);
	    fillSquare (x, y, dist, data, squareColor, canvas.width, canvas.height);
	    ++nSquares;
	}
    }
    console.log (nSquares + " squares");
    console.log ((canvas.width * canvas.height / nSquares) + " pixels per square (avg)");
    ctx.putImageData (imageData, 0, 0);
    elImageOut.src = canvas.toDataURL ("image/png");
}
