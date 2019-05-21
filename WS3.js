"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4(-0.5,  0.5,  0.5, 1.0),
    vec4(0.5,  0.5,  0.5, 1.0),
    vec4(0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5,  0.5, -0.5, 1.0),
    vec4(0.5,  0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

var modelViewMatrixLoc;

// Object 1 (Hand)
// Default parameters

var theta1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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

// Parameters controlling the size of the Arm and Fingers

var PALM_HEIGHT = 3.0;
var PALM_WIDTH = 4.0;
var HAND_DEPTH = 0.7;
var LOWER_FINGER_HEIGHT = 1.7;
var LOWER_FINGER_WIDTH = 0.7;
var UPPER_FINGER_WIDTH = 0.6;
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

// Animation
var animation = false;
var state = 1;

var RIGHT_LEFT = 1;
var directionRL = -1;
var countRL = 0;

var FIST = 2;
var directionFist = 1;
var countFist = 0;

var theta1NonAnimation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var theta1Animation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Object 2 (Robot)
// angle of each rotation, the order is according to the identifier above

var theta2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Identifier of each object parts

var torsoId = 0;
var head1Id = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var head2Id = 10;

// The size of object parts

var torsoHeight = 5.0;
var torsoWidth = 3.0;
var torsoDepth = 1.0;
var headHeight = 1.5;
var headWidth = 1.3;
var headDepth = 1.5;
var upperArmHeight = 2.4;
var upperArmWidth  = 0.7;
var lowerArmHeight = 2.6;
var lowerArmWidth  = 0.7;
var upperLegHeight = 2.2;
var upperLegWidth  = 0.9;
var lowerLegHeight = 2.8;
var lowerLegWidth  = 0.9;

// Animation

var flag = 0;
var torsoFlag = 0;

// angle that is used for animation
var angle = 0;

// angle that is used to rotate the whole object
var torsoAngle = 0;

// Object 3 (Dino)
// angle of each rotation, the order is according to the identifier

var theta3 = [15,0,25,-30,25,-30,20,0,3];

// Identifier of each object parts

var dinoTorsoId = 0;
var dinoHeadId = 1;
var dinoLeftUpperLegId = 2;
var dinoLeftLowerLegId = 3;
var dinoRightUpperLegId = 4;
var dinoRightLowerLegId = 5;
var dinoTail1Id = 6;
var dinoTail2Id = 7;
var dinoTail3Id = 8;

// The size of object parts
var scaler = 3;

var dinoTorsoWidth      = scaler * 1.4;
var dinoTorsoHeight     = scaler * 0.8;
var dinoTorsoDepth      = scaler * 0.7;
var dinoHeadWidth       = scaler * 1;
var dinoHeadHeight      = scaler * 0.75;
var dinoHeadDepth       = scaler * 0.8;
var dinoUpperLegWidth   = scaler * 0.55;
var dinoUpperLegHeight  = scaler * 0.7;
var dinoUpperLegDepth   = scaler * 0.4;
var dinoLowerLegWidth   = scaler * 0.4;
var dinoLowerLegHeight  = scaler * 0.8;
var dinoLowerLegDepth   = scaler * 0.4;
var dinoTail1Width      = scaler * 0.7;
var dinoTail1Height     = scaler * 0.4;
var dinoTail1Depth      = scaler * 0.45;
var dinoTail2Width      = scaler * 0.5;
var dinoTail2Height     = scaler * 0.25;
var dinoTail2Depth      = scaler * 0.33;
var dinoTail3Width      = scaler * 0.35;
var dinoTail3Height     = scaler * 0.15;
var dinoTail3Depth      = scaler * 0.2;

// Parameters to control the material and lighting

var lightPosition = vec4(0.5, 0.5, 15.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;

// Parameters for texture and image

var jeansImage;
var lowerFingerImage;
var metalicImage;
var woolImage;
var woodImage;
var texture;

// Parameters for GL Buffer

var vBuffer;
var points = [];
var normals = [];
var texCoords = [];

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    points.push(vertices[a]);
    normals.push(normal);
    texCoords.push(texCoord[0]);

    points.push(vertices[b]);
    normals.push(normal);
    texCoords.push(texCoord[1]);

    points.push(vertices[c]);
    normals.push(normal);
    texCoords.push(texCoord[2]);

    points.push(vertices[a]);
    normals.push(normal);
    texCoords.push(texCoord[0]);

    points.push(vertices[c]);
    normals.push(normal);
    texCoords.push(texCoord[2]);

    points.push(vertices[d]);
    normals.push(normal);
    texCoords.push(texCoord[3]);
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

function configureTexture(image) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix));

    jeansImage = document.getElementById("jeans-texture");
    lowerFingerImage = document.getElementById("lower-finger-texture");
    metalicImage = document.getElementById("metalic-texture");
    woolImage = document.getElementById("wool-texture");
    woodImage = document.getElementById("wood-texture");

    document.getElementById("animateButton1").onclick = function() {
        if (animation) {
            theta1Animation = theta1.slice();
            theta1 = theta1NonAnimation.slice();
        } else {
            theta1NonAnimation = theta1.slice();
            theta1 = theta1Animation.slice();
        }
        animation = !animation;
    };

    document.getElementById("animateButton2").onclick = function () {
        flag = !flag;
        angle = 0;
    };

    document.getElementById("rotateButton").onclick = function () {
        torsoFlag = !torsoFlag;
    };

    texture = gl.createTexture();

    render();
}

// Instantiate Object Parts for Room

function ceiling() {
    var s = scale4(30, 0.1, 20);
    var instanceMatrix = mult(translate(0.0, 9.5, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function leftWall() {
    var s = scale4(20, 18, 0.1);
    var instanceMatrix = mult(translate(-8, 0.0, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function rightWall() {
    var s = scale4(20, 18, 0.1);
    var instanceMatrix = mult(translate(8, 0.0, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function backWall() {
    var s = scale4(30, 18, 0.1);
    var instanceMatrix = mult(translate(0.0, -5, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

// Instantiate Object Parts for Object1 (Hand)

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

// Instantiate Object Parts for Object2 (Robot)

function torso() {
    var s = scale4(torsoWidth, torsoHeight, torsoDepth);
    var instanceMatrix = mult(translate(0.0, 0.5*torsoHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function head() {
    var s = scale4(headWidth, headHeight, headDepth);
    var instanceMatrix = mult(translate(0.0, 0.5 * headHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function leftUpperArm() {
    var s = scale4(upperArmWidth, upperArmHeight, upperArmWidth);
    var instanceMatrix = mult(translate(0.5 * upperArmWidth, 0.5 * upperArmHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function leftLowerArm() {
    var s = scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth);
    var instanceMatrix = mult(translate(0.5 * lowerArmWidth, 0.5 * lowerArmHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function rightUpperArm() {
    var s = scale4(upperArmWidth, upperArmHeight, upperArmWidth);
    var instanceMatrix = mult(translate(-0.5 * upperArmWidth, 0.5 * upperArmHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function rightLowerArm() {
    var s = scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth);
    var instanceMatrix = mult(translate(-0.5 * lowerArmWidth, 0.5 * lowerArmHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function leftUpperLeg() {
    var s = scale4(upperLegWidth, upperLegHeight, upperLegWidth);
    var instanceMatrix = mult(translate(0.0, 0.6 * upperLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function leftLowerLeg() {
    var s = scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth);
    var instanceMatrix = mult(translate(0.0, 0.5 * lowerLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function rightUpperLeg() {
    var s = scale4(upperLegWidth, upperLegHeight, upperLegWidth);
    var instanceMatrix = mult(translate(0.0, 0.6 * upperLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function rightLowerLeg() {
    var s = scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth);
    var instanceMatrix = mult(translate(0.0, 0.5 * lowerLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function floor() {
    var s = scale4(30, 0.1, 20);
    var instanceMatrix = mult(translate(0.0, -5, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

// Instantiate Object Parts for Object3 (Dino)

function dinoTorso() {
    var s = scale4(dinoTorsoWidth, dinoTorsoHeight, dinoTorsoDepth);
    var instanceMatrix = mult(translate(0.0, 0.5*dinoTorsoHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoHead() {
    var s = scale4(dinoHeadWidth, dinoHeadHeight, dinoHeadDepth);
    var instanceMatrix = mult(translate(0.9*dinoHeadWidth, dinoTorsoHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoLeftUpperLeg() {
    var s = scale4(dinoUpperLegWidth, dinoUpperLegHeight, dinoUpperLegDepth);
    var t = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoLeftLowerLeg() {
    var s = scale4(dinoLowerLegWidth, dinoLowerLegHeight, dinoLowerLegDepth);
    var instanceMatrix = mult(translate(0.65, -0.7*dinoLowerLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoRightUpperLeg() {
    var s = scale4(dinoUpperLegWidth, dinoUpperLegHeight, dinoUpperLegDepth);
    var t = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoRightLowerLeg() {
    var s = scale4(dinoLowerLegWidth, dinoLowerLegHeight, dinoLowerLegDepth);
    var instanceMatrix = mult(translate(0.65, -0.7*dinoLowerLegHeight, 0.0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoTail1() {
    var s = scale4(dinoTail1Width, dinoTail1Height, dinoTail1Depth);
    var instanceMatrix = mult(translate(0,0,0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoTail2() {
    var s = scale4(dinoTail2Width, dinoTail2Height, dinoTail2Depth);
    var instanceMatrix = mult(translate(0,0,0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function dinoTail3() {
    var s = scale4(dinoTail3Width, dinoTail3Height, dinoTail3Depth);
    var instanceMatrix = mult(translate(0,0,0),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}

function updateThetaFist(delta) {
    theta1[LowerPinkie] += delta;
    theta1[UpperPinkie] += delta;

    theta1[LowerRing] += delta;
    theta1[UpperRing] += delta;

    theta1[LowerMiddle] += delta;
    theta1[UpperMiddle] += delta;

    theta1[LowerIndex] += delta;
    theta1[UpperIndex] += delta;

    theta1[LowerThumb] += delta;
    theta1[UpperThumb] += delta;
}

function updateAnimation() {
    switch (state) {
        case RIGHT_LEFT:
        if (theta1[PalmZ] == 0) {
            countRL++;

            if (countRL == 3) {
                state = FIST;
                countRL = 0;
                break;
            }
        }

        theta1[PalmZ] += directionRL;

        if (Math.abs(theta1[PalmZ]) == 45) {
            directionRL = -directionRL;
        }
        break;

        case FIST:
        if (theta1[LowerPinkie] == 0) {
            countFist++;

            if (countFist == 3) {
                state = RIGHT_LEFT;
                countFist = 0;
                break;
            }
        }

        updateThetaFist(directionFist);

        if (theta1[LowerPinkie] == 90 || theta1[LowerPinkie] == 0) {
            directionFist = -directionFist;
        }
        break;

        default:

        break;
    }
}

var render = function() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var temp;


    // Background
    configureTexture(woodImage);

    // // Floor
    // modelViewMatrix = rotate(20,1,0,0);
    // floor();

    // // Ceiling
    // modelViewMatrix = rotate(-20,1,0,0);
    // ceiling();

    // // Left Wall
    // modelViewMatrix = translate(-5,1,-10,0);
    // modelViewMatrix = mult(modelViewMatrix,rotate(60,0,1,0));
    // leftWall();

    // // Right Wall
    // modelViewMatrix = translate(5,1,-10,0);
    // modelViewMatrix = mult(modelViewMatrix,rotate(-60,0,1,0));
    // rightWall();

    // // Back Wall
    // modelViewMatrix = translate(0,11.5,-10,0);
    // backWall();

/*
    // Object 1 (Hand)

    if (animation) {
        updateAnimation();
    }


    // Palm
    configureTexture(woolImage);
    modelViewMatrix = translate(-5, 0, 0, 0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[PalmY], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[PalmZ], 0, 0, 1));
    temp = modelViewMatrix;
    palm();

    // Index Finger
    configureTexture(lowerFingerImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[LowerPinkie], 1, 0, 0));
    lowerPinkie();

    configureTexture(metalicImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta1[UpperPinkie], 1, 0, 0));
    upperPinkie();

    // Ring Finger
    modelViewMatrix = temp;

    configureTexture(lowerFingerImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[LowerRing], 1, 0, 0));
    lowerRing();

    configureTexture(metalicImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta1[UpperRing], 1, 0, 0));
    upperRing();

    // Middle Finger
    modelViewMatrix = temp;

    configureTexture(lowerFingerImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[LowerMiddle], 1, 0, 0));
    lowerMiddle();

    configureTexture(metalicImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta1[UpperMiddle], 1, 0, 0));
    upperMiddle();

    // Index Finger
    modelViewMatrix = temp;

    configureTexture(lowerFingerImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta1[LowerIndex], 1, 0, 0));
    lowerIndex();

    configureTexture(metalicImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_FINGER_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta1[UpperIndex], 1, 0, 0));
    upperIndex();

    // Thumb
    modelViewMatrix = temp;

    configureTexture(lowerFingerImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.5 * PALM_WIDTH, 0.0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta1[LowerThumb], 0, 1, 0));
    lowerThumb();

    configureTexture(metalicImage);
    modelViewMatrix  = mult(modelViewMatrix, translate(0.5 * THUMB_WIDTH, 0.0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta1[UpperThumb], 0, 1, 0));
    upperThumb();

    // Object 2 (Robot)

    if (flag){
        angle += 0.02;
    }

    // change the angle for object rotation
    if (torsoFlag){
        torsoAngle += 0.3;
        if (torsoAngle == 2*Math.PI) {
            torsoAngle = 0
        }
    }

    // Torso
    configureTexture(woolImage);
    modelViewMatrix = translate(5, 0, 0, 0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta2[torsoId] + torsoAngle, 0, 1, 0));
    temp = modelViewMatrix;
    torso();

    // Head
    configureTexture(metalicImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, torsoHeight+0.5*headHeight, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(-theta2[head1Id], 1, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta2[head2Id], 0, 1, 0));
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -0.5*headHeight, 0.0));
    head();

    // LeftArm
    modelViewMatrix = temp;

    configureTexture(woolImage);
    modelViewMatrix = mult(modelViewMatrix, translate(-(0.5*torsoWidth + upperArmWidth), 0.9*torsoHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - 15*Math.sin(angle), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - theta2[leftUpperArmId], 1, 0, 0));
    }
    leftUpperArm();

    configureTexture(metalicImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, upperArmHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(-Math.abs(10*Math.sin(angle)), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(-theta2[leftLowerArmId], 1, 0, 0));
    }
    leftLowerArm();

    // RightArm
    modelViewMatrix = temp;

    configureTexture(woolImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.5*torsoWidth + upperArmWidth, 0.9*torsoHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 + 15*Math.sin(angle), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - theta2[rightUpperArmId], 1, 0, 0));
    }
    rightUpperArm();

    configureTexture(metalicImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, upperArmHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(-Math.abs(10*Math.sin(angle)), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(-theta2[rightLowerArmId], 1, 0, 0));
    }
    rightLowerArm();

    // LeftLeg
    modelViewMatrix = temp;

    configureTexture(jeansImage);
    modelViewMatrix = mult(modelViewMatrix, translate(-(0.3*torsoWidth), 0.1*upperLegHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 + 10*Math.sin(angle), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - theta2[leftUpperLegId], 1, 0, 0));
    }
    leftUpperLeg();

    configureTexture(metalicImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, upperLegHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(Math.abs(10 + 20*Math.sin(angle)), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(theta2[leftLowerLegId], 1, 0, 0));
    }
    leftLowerLeg();

    // RightLeg
    modelViewMatrix = temp;

    configureTexture(jeansImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.3*torsoWidth, 0.1*upperLegHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - 10*Math.sin(angle), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(180 - theta2[rightUpperLegId], 1, 0, 0));
    }
    rightUpperLeg();

    configureTexture(metalicImage);
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, upperLegHeight, 0.0));
    if (flag) {
        modelViewMatrix = mult(modelViewMatrix, rotate(Math.abs(10 - 20*Math.sin(angle)), 1, 0, 0));
    } else {
        modelViewMatrix = mult(modelViewMatrix, rotate(theta2[rightLowerLegId], 1, 0, 0));
    }
    rightLowerLeg();
*/
    // Object 3 (Dino)

    if (torsoFlag){
        torsoAngle += 0.3;
        if (torsoAngle == 2*Math.PI) {
            torsoAngle = 0
        }
    }

    // Torso
    modelViewMatrix = translate(1, 0, 0, 0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoTorsoId] + torsoAngle, 0, 1, 0));
    temp = modelViewMatrix;
    modelViewMatrix = mult(modelViewMatrix, rotate(15, 0, 0, 1));
    dinoTorso();

    // Head
    modelViewMatrix = temp;
    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoHeadId], 0, 0, 1));
    dinoHead();

    // LeftLeg
    modelViewMatrix = temp;
    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoLeftUpperLegId], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(0, 0, 0.5*dinoTorsoDepth + 0.5 * dinoUpperLegDepth));
    modelViewMatrix = mult(modelViewMatrix, translate(-3/14*dinoTorsoWidth, 0, 0));
    dinoLeftUpperLeg();

    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoLeftLowerLegId], 0, 0, 1));
    dinoLeftLowerLeg();

    // RightLeg
    modelViewMatrix = temp;
    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoRightUpperLegId], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(0, 0, -0.5*dinoTorsoDepth - 0.5 * dinoUpperLegDepth));
    modelViewMatrix = mult(modelViewMatrix, translate(-3/14*dinoTorsoWidth, 0, 0));
    dinoRightUpperLeg();

    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoRightLowerLegId], 0, 0, 1));
    dinoRightLowerLeg();

    // Tail
    modelViewMatrix = temp;
    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoTail1Id], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.7*dinoTorsoWidth, 0.5*dinoTorsoHeight + 0.5*dinoTail1Height, 0.0));
    dinoTail1();

    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoTail2Id], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.8*dinoTail1Width, -0.1*dinoTail2Height, 0.0));
    dinoTail2();

    modelViewMatrix = mult(modelViewMatrix, rotate(theta3[dinoTail3Id], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(-0.8*dinoTail2Width, -0.1*dinoTail3Height, 0.0));
    dinoTail3();

    requestAnimFrame(render);
}
