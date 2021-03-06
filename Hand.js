"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var normals = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4( 0.5,  0.5,  0.5, 1.0),
    vec4( 0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4( 0.5,  0.5, -0.5, 1.0),
    vec4( 0.5, -0.5, -0.5, 1.0)
];

// Parameters controlling the size of the Arm and Fingers

var PALM_HEIGHT      = 3.0;
var PALM_WIDTH       = 4.0;
var HAND_DEPTH       = 0.7;
var LOWER_FINGER_HEIGHT = 1.7;
var LOWER_FINGER_WIDTH  = 0.7;
var UPPER_FINGER_WIDTH  = 0.6;
var PINKIE_HEIGHT = 1.5;
var RING_HEIGHT = 1.7;
var MIDDLE_HEIGHT = 1.9;
var INDEX_HEIGHT = 1.7;
var THUMB_WIDTH = 1.2;
var LOWER_THUMB_HEIGHT = 0.7;
var UPPER_THUMB_HEIGHT = 0.6;

// Parameters controlling the position of fingers

var PINKIE_X = -1.55;
var RING_X = -0.55;
var MIDDLE_X = 0.55;
var INDEX_X = 1.55;
var THUMB_Y = 1.0;
var THUMB_X = 0.6;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var PalmY = 0;
var PalmZ = 1;
var LowerPinkie = 2;
var UpperPinkie = 3;
var LowerRing = 4;
var UpperRing = 5;
var LowerMiddle = 6;
var UpperMiddle = 7;
var LowerIndex = 8;
var UpperIndex = 9;
var LowerThumb = 10;
var UpperThumb = 11;

// Parameters to control the material and lighting

var lightPosition = vec4(0.0, 0.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

// Parameters for animations
var animation = false;
var state = 1;

var RIGHT_LEFT = 1;
var directionRL = -1;
var countRL = 0;

var FIST = 2;
var directionFist = 1;
var countFist = 0;

var thetaNonAnimation = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var thetaAnimation = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Default parameters
var theta= [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var modelViewMatrixLoc;

var vBuffer, cBuffer;

var image, image2, texture;

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    points.push(vertices[a]);
    normals.push(normal);
    texCoordsArray.push(texCoord[0]);

    points.push(vertices[b]);
    normals.push(normal);
    texCoordsArray.push(texCoord[1]);

    points.push(vertices[c]);
    normals.push(normal);
    texCoordsArray.push(texCoord[2]);

    points.push(vertices[a]);
    normals.push(normal);
    texCoordsArray.push(texCoord[0]);

    points.push(vertices[c]);
    normals.push(normal);
    texCoordsArray.push(texCoord[2]);

    points.push(vertices[d]);
    normals.push(normal);
    texCoordsArray.push(texCoord[3]);
}


function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and initialize buffer objects

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
    
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    
    image = document.getElementById("texImage");
    image2 = document.getElementById("texImage2");
        
    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix));
        
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

    document.getElementById("LowerMiddleSlider").onchange = function(event) {
        theta[LowerMiddle] = event.target.value;
    };

    document.getElementById("UpperMiddleSlider").onchange = function(event) {
        theta[UpperMiddle] =  event.target.value;
    };

    document.getElementById("LowerIndexSlider").onchange = function(event) {
        theta[LowerIndex] = event.target.value;
    };

    document.getElementById("UpperIndexSlider").onchange = function(event) {
        theta[UpperIndex] =  event.target.value;
    };

    document.getElementById("LowerThumbSlider").onchange = function(event) {
        theta[LowerThumb] =  event.target.value;
    };

    document.getElementById("UpperThumbSlider").onchange = function(event) {
        theta[UpperThumb] =  event.target.value;
    };

    document.getElementById( "animateButton" ).onclick = function() {
        if (animation) {
            thetaAnimation = theta.slice();
            theta = thetaNonAnimation.slice();
            toggleSlider(false);
        } else {
            thetaNonAnimation = theta.slice();
            theta = thetaAnimation.slice();
            toggleSlider(true);
        }
        animation = !animation;
    };

    render();
}

function toggleSlider(state) {
    document.getElementById("PalmYSlider").disabled = state;
    document.getElementById("PalmZSlider").disabled = state;
    document.getElementById("LowerPinkieSlider").disabled = state;
    document.getElementById("UpperPinkieSlider").disabled = state;
    document.getElementById("LowerRingSlider").disabled = state;
    document.getElementById("UpperRingSlider").disabled = state;
    document.getElementById("LowerMiddleSlider").disabled = state;
    document.getElementById("UpperMiddleSlider").disabled = state;
    document.getElementById("LowerIndexSlider").disabled = state;
    document.getElementById("UpperIndexSlider").disabled = state;
    document.getElementById("LowerThumbSlider").disabled = state;
    document.getElementById("UpperThumbSlider").disabled = state;
}

function palm() {
    var s = scale4(PALM_WIDTH, PALM_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(0.0, 0.5 * PALM_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function lowerPinkie() {
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(PINKIE_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function upperPinkie() {
    var s = scale4(UPPER_FINGER_WIDTH, PINKIE_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(PINKIE_X, 0.5 * PINKIE_HEIGHT, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function lowerRing() {
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(RING_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function upperRing() {
    var s = scale4(UPPER_FINGER_WIDTH, RING_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(RING_X, 0.5 * RING_HEIGHT, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function lowerMiddle() {
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(MIDDLE_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function upperMiddle() {
    var s = scale4(UPPER_FINGER_WIDTH, MIDDLE_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(MIDDLE_X, 0.5 * MIDDLE_HEIGHT, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function lowerIndex() {
    var s = scale4(LOWER_FINGER_WIDTH, LOWER_FINGER_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(INDEX_X, 0.5 * LOWER_FINGER_HEIGHT, 0.0), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function upperIndex() {
    var s = scale4(UPPER_FINGER_WIDTH, MIDDLE_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(INDEX_X, 0.5 * INDEX_HEIGHT, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function lowerThumb() {
    var s = scale4(THUMB_WIDTH, LOWER_THUMB_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(THUMB_X, THUMB_Y, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function upperThumb() {
    var s = scale4(THUMB_WIDTH, UPPER_THUMB_HEIGHT, HAND_DEPTH);
    var instanceMatrix = mult(translate(2*THUMB_X, THUMB_Y, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function updateThetaFist(delta) {
    theta[LowerPinkie] += delta;
    theta[UpperPinkie] += delta;

    theta[LowerRing] += delta;
    theta[UpperRing] += delta;

    theta[LowerMiddle] += delta;
    theta[UpperMiddle] += delta;

    theta[LowerIndex] += delta;
    theta[UpperIndex] += delta;

    theta[LowerThumb] += delta;
    theta[UpperThumb] += delta;
}

function updateAnimation() {
    switch (state) {
        case RIGHT_LEFT:
        if (theta[PalmZ] == 0) {
            countRL++;

            if (countRL == 3) {
                state = FIST;
                countRL = 0;
                break;
            }
        }
        
        theta[PalmZ] += directionRL;
        
        if (Math.abs(theta[PalmZ]) == 45) {
            directionRL = -directionRL;
        }
        break;

        case FIST:
        if (theta[LowerPinkie] == 0) {
            countFist++;

            if (countFist == 3) {
                state = RIGHT_LEFT;
                countFist = 0;
                break;
            }
        }

        updateThetaFist(directionFist);

        if (theta[LowerPinkie] == 90 || theta[LowerPinkie] == 0) {
            directionFist = -directionFist;
        }
        break;

        default:

        break;
    } 
}


var render = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (animation) {
        updateAnimation();
    }

    var temp;

    configureTexture( image );

    // Palm
    modelViewMatrix = rotate(theta[PalmY], 0, 1, 0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[PalmZ], 0, 0, 1));
    temp = modelViewMatrix;
    palm();

    configureTexture( image2 );

    // Index Finger
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerPinkie], 1, 0, 0));
    lowerPinkie();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperPinkie], 1, 0, 0));
    upperPinkie();

    // Ring Finger
    modelViewMatrix = temp;

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerRing], 1, 0, 0));
    lowerRing();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperRing], 1, 0, 0));
    upperRing();

    // Middle Finger
    modelViewMatrix = temp;

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerMiddle], 1, 0, 0));
    lowerMiddle();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperMiddle], 1, 0, 0));
    upperMiddle();

    // Index Finger
    modelViewMatrix = temp;

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerIndex], 1, 0, 0));
    lowerIndex();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperIndex], 1, 0, 0));
    upperIndex();

    // Thumb
    modelViewMatrix = temp;

    modelViewMatrix  = mult(modelViewMatrix, translate(0.5 * PALM_WIDTH, 0.0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[LowerThumb], 0, 1, 0));
    lowerThumb();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.5 * THUMB_WIDTH, 0.0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[UpperThumb], 0, 1, 0));
    upperThumb();

    requestAnimFrame(render);
}
