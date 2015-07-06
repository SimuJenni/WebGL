"use strict";

var canvas;
var gl;
var bufferId

var points = [];

var NumTimesToSubdivide = 1;
var phi = 0;
var twistFactor = 1.5;

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

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    document.getElementById("slider1").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
        render();
    };

    document.getElementById("slider2").onchange = function() {
        phi = event.srcElement.value/12*Math.PI;
        render();
    };

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function transformVertex(v) {
    var rphi = phi*length(v)*twistFactor;
    return vec2(v[0]*Math.cos(rphi) - v[1]*Math.sin(rphi), v[0]*Math.sin(rphi) + v[1]*Math.cos(rphi))
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( transformVertex(a), transformVertex(b), transformVertex(c) );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
	divideTriangle( ac, ab, bc, count);
    }
}

window.onload = init;

function render()
{
    
    // First, initialize the corners of our gasket with three points.
    var dx = Math.cos(Math.PI/6);
    var dy = Math.sin(Math.PI/6);
    var vertices = [
        vec2( -dx, -dy ),
        vec2(  0,  1 ),
        vec2(  dx, -dy )
    ];

    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}
