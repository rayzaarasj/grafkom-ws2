"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var lightPosition = vec4(0, -2, 3.0, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.19225, 0.19225, 0.19225, 1.0 );
var materialDiffuse = vec4( 0.50754, 0.50754, 0.50754, 1.0 );
var materialSpecular = vec4( 0.508273, 0.508273, 0.508273, 1.0 );
var materialShininess = 51.2;

var flag = 0;
var torsoFlag = 0;

var ambientColor, diffuseColor, specularColor;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// Identifier of each object parts
var torsoId = 0;
var headId  = 1;
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

// angle of each rotation, the order is according to the identifier above
var theta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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

var numNodes = 10;
var numAngles = 11;

// angle that is used for animation
var angle = 0;

// angle that is used to rotate the whole object
var torsoAngle = 0;


var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var normalsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

// function to control the transformation matrix for each object parts
function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
        m = rotate(theta[torsoId] + torsoAngle, 0, 1, 0 );
        figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:
        m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
        m = mult(m, rotate(-theta[head1Id], 1, 0, 0))
        m = mult(m, rotate(theta[head2Id], 0, 1, 0));
        m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
        figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;

    case leftUpperArmId:
        m = translate(-(0.5*torsoWidth + upperArmWidth), 0.9*torsoHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(180 - 15*Math.sin(angle), 1, 0, 0));
        } else {
            m = mult(m, rotate(180 - theta[leftUpperArmId], 1, 0, 0));
        }
        figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:
        m = translate(0.5*torsoWidth + upperArmWidth, 0.9*torsoHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(180 + 15*Math.sin(angle), 1, 0, 0));
        } else {
            m = mult(m, rotate(180 - theta[rightUpperArmId], 1, 0, 0));
        }
        figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:
        m = translate(-(0.3*torsoWidth), 0.1*upperLegHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(180 + 10*Math.sin(angle), 1, 0, 0));
        } else {
            m = mult(m, rotate(180 - theta[leftUpperLegId], 1, 0, 0));
        }
        figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
        m = translate(0.3*torsoWidth, 0.1*upperLegHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(180 - 10*Math.sin(angle), 1, 0, 0));
        } else {
            m = mult(m, rotate(180 - theta[rightUpperLegId], 1, 0, 0));
        }
        figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:
        m = translate(0.0, upperArmHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(-Math.abs(10*Math.sin(angle)), 1, 0, 0));
        } else {
            m = mult(m, rotate(-theta[leftLowerArmId], 1, 0, 0));
        }
        figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:
        m = translate(0.0, upperArmHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(-Math.abs(10*Math.sin(angle)), 1, 0, 0));
        } else {
            m = mult(m, rotate(-theta[rightLowerArmId], 1, 0, 0));
        }
        figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:
        m = translate(0.0, upperLegHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(Math.abs(10 + 20*Math.sin(angle)), 1, 0, 0));
        } else {
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
        }
        figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:
        m = translate(0.0, upperLegHeight, 0.0);
        if (flag) {
            m = mult(m, rotate(Math.abs(10 - 20*Math.sin(angle)), 1, 0, 0));
        } else {
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
        }
        figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    }
}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

// the functions below is to instantiate the object parts
function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.5 * upperArmWidth, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.5 * lowerArmWidth, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(-0.5 * upperArmWidth, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(-0.5 * lowerArmWidth, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.6 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.6 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );


    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("slider0").onchange = function(event) {
        theta[torsoId ] = parseInt(event.target.value);
        initNodes(torsoId);
    };

    document.getElementById("slider1").onchange = function(event) {
        theta[head1Id] = parseInt(event.target.value);
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function(event) {
         theta[leftUpperArmId] = parseInt(event.target.value);
         initNodes(leftUpperArmId);
    };

    document.getElementById("slider3").onchange = function(event) {
         theta[leftLowerArmId] =  parseInt(event.target.value);
         initNodes(leftLowerArmId);
    };

    document.getElementById("slider4").onchange = function(event) {
        theta[rightUpperArmId] = parseInt(event.target.value);
        initNodes(rightUpperArmId);
    };

    document.getElementById("slider5").onchange = function(event) {
         theta[rightLowerArmId] =  parseInt(event.target.value);
         initNodes(rightLowerArmId);
    };

    document.getElementById("slider6").onchange = function(event) {
        theta[leftUpperLegId] = parseInt(event.target.value);
        initNodes(leftUpperLegId);
    };

    document.getElementById("slider7").onchange = function(event) {
         theta[leftLowerLegId] = parseInt(event.target.value);
         initNodes(leftLowerLegId);
    };

    document.getElementById("slider8").onchange = function(event) {
         theta[rightUpperLegId] = parseInt(event.target.value);
         initNodes(rightUpperLegId);
    };

    document.getElementById("slider9").onchange = function(event) {
        theta[rightLowerLegId] = parseInt(event.target.value);
        initNodes(rightLowerLegId);
    };

    document.getElementById("slider10").onchange = function(event) {
         theta[head2Id] = parseInt(event.target.value);
         initNodes(head2Id);
    };

    document.getElementById( "animateButton" ).onclick = function () {
        flag = !flag;
        for(i=0; i<numNodes; i++) initNodes(i);
        angle = 0;
    };

    document.getElementById( "rotateButton" ).onclick = function () {
        torsoFlag = !torsoFlag;
        for(i=0; i<numNodes; i++) initNodes(i);
    };

    for(i=0; i<numNodes; i++) initNodes(i);

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

    render();
}


var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    traverse(torsoId);

    // change the angle for animation
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

    // render object if there are changes in any of the angle
    if (flag || torsoFlag){
        for(i=0; i<numNodes; i++) initNodes(i);
    }
    requestAnimFrame(render);
}
