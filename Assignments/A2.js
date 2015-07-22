"use strict";

var canvas;
var gl;
var bufferId;
var cbufferId;

var points = [];
var pointCol = [];
var paint = false;

var cIndex = 0;
var linewidth = 1;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 9), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cbufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 9), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, points.length*4);
    gl.enableVertexAttribArray(vColor);

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
	cIndex = m.selectedIndex;
    });

    document.getElementById("slider1").onchange = function() {
        linewidth = event.srcElement.value;
        render();
    };

    canvas.addEventListener("mousedown", function(event){
	drawLine(event);	
	paint = true;
    });

    canvas.addEventListener("mouseup", function(event){
	if(paint) {
	    drawLine(event);
	    paint = false;
	}
    });

    canvas.addEventListener("mouseout", function(event){
	if(paint) {
	    drawLine(event);
	    paint = false;
	}
    });

    canvas.addEventListener("mousemove", function(event){
	if (paint) {
	    drawLine(event);
	    render();
	    drawLine(event);
	}
    });

    render();
};

function drawLine(event) {
    var x =  (event.pageX-canvas.width/2)/(canvas.width/2);
    var y = - (event.pageY-canvas.height/2)/(canvas.height/2);
    points.push(vec2(x,y));
    pointCol.push(colors[cIndex]);
}

window.onload = init;

function render()
{
    var verts = flatten(points);
    var vertCols = flatten(pointCol);
    gl.lineWidth(linewidth)
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
    gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertCols);
    gl.drawArrays( gl.LINES, 0, points.length );
}
