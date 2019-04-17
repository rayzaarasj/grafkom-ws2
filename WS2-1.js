"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var normals = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var PALM_HEIGHT      = 3.0;
var PALM_WIDTH       = 4.0;
var HAND_DEPTH       = 0.7;
var LOWER_FINGER_HEIGHT = 1.7;
var LOWER_FINGER_WIDTH  = 0.7;
var UPPER_FINGER_WIDTH  = 0.6;
var PINKIE_HEIGHT = 1.5;
var RING_HEIGHT = 1.7

// Parameters controlling the position of fingers

var PINKIE_X = -1.45;
var RING_X = -0.55;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var PalmY = 0;
var PalmZ = 1;
var LowerPinkie = 2;
var UpperPinkie = 3;
var LowerRing = 4;
var UpperRing = 5;

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var theta= [ 0, 0, 0, 0, 0, 0];

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    points.push(vertices[a]);
    normals.push(normal);
    points.push(vertices[b]);
    normals.push(normal);
    points.push(vertices[c]);
    normals.push(normal);
    points.push(vertices[a]);
    normals.push(normal);
    points.push(vertices[c]);
    normals.push(normal);
    points.push(vertices[d]);
    normals.push(normal);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition) );
    
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"),materialShininess);
        
    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
        
    document.getElementById("PalmYSlider").onchange = function(event) {
        theta[PalmY] = event.target.value;
    };
    document.getElementById("PalmZSlider").onchange = function(event) {
        theta[PalmZ] = event.target.value;
    };
    document.getElementById("LowerPinkieSlider").onchange = function(event) {
        theta[LowerPinkie] = event.target.value;
    };
    document.getElementById("UpperPinkieSlider").onchange = function(event) {
        theta[UpperPinkie] =  event.target.value;
    };
    document.getElementById("LowerRingSlider").onchange = function(event) {
        theta[LowerRing] = event.target.value;
    };
    document.getElementById("UpperRingSlider").onchange = function(event) {
        theta[UpperRing] =  event.target.value;
    };

    render();
}

function palm() {
    var s = scale4(PALM_WIDTH, PALM_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * PALM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function lowerPinkie()
{
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult( translate( PINKIE_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function upperPinkie() {
    var s = scale4(UPPER_FINGER_WIDTH, PINKIE_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate( PINKIE_X, 0.5 * PINKIE_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function lowerRing()
{
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult( translate( RING_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function upperRing() {
    var s = scale4(UPPER_FINGER_WIDTH, RING_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate( RING_X, 0.5 * RING_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var temp;

    modelViewMatrix = rotate(theta[PalmY], 0, 1, 0 );
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[PalmZ], 0, 0, 1 ));
    temp = modelViewMatrix;
    palm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerPinkie], 1, 0, 0 ));
    lowerPinkie();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperPinkie], 1, 0, 0) );
    upperPinkie();

    modelViewMatrix = temp;

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerRing], 1, 0, 0 ));
    lowerRing();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[LowerRing], 1, 0, 0) );
    upperRing();

    requestAnimFrame(render);
}
