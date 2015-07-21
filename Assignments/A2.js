"use strict";

var canvas;
var gl;
var bufferId

var points = [];
var paint = false;

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

    // Associate our shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

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
}

window.onload = init;

function render()
{
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.drawArrays( gl.LINES, 0, 2*points.length );
}
