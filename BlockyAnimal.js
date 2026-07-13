// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor; // uniform変数
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;



function setupWebGL(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


 // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  //if (!u_Size) {
   // console.log('Failed to get the storage location of u_Size');
    //return;
 // }

}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
//globals for UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_globalAngle = 0;
let g_globalAngleX = 0; 
let g_globalAngleY = 0; 
let g_mouseDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;


//let g_yellowAngle = 0;
//let g_magentaAngle = 0;
//let g_yellowAnimation = false;
//let g_magentaAnimation = false;

let g_bodyOffset = 0;
let g_bodyAnimation = false;


//back fins
let g_backLeftFinAngle = 0;
let g_backRightFinAngle = 0;
let g_backLeftFinAnimation = false;
let g_backRightFinAnimation = false;


//front finleft
let g_frontLeftFinAngle1 = 0;
let g_frontLeftFinAngle2 = 0;
let g_frontLeftFinAngle3 = 0;

// Front right fin joints
let g_frontRightFinAngle1 = 0;
let g_frontRightFinAngle2 = 0;
let g_frontRightFinAngle3 = 0;

let g_frontLeftFinAnim1 = false;
let g_frontRightFinAnim1 = false;

let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_headPokeAngle = 0;







function addActionsForHtmlUI () {

  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};

  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};

  document.getElementById('yellowSlide').addEventListener('input', function() {g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('input', function() {g_magentaAngle = this.value; renderAllShapes(); });

  document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = this.value; renderAllShapes(); });


  //turtle left right back leg
  document.getElementById('bodyAnimOnButton').onclick  = function() {g_bodyAnimation = true;};
  document.getElementById('bodyAnimOffButton').onclick = function() {g_bodyAnimation = false;};

  document.getElementById('backLeftFinSlide').addEventListener('input', function () {g_backLeftFinAngle = this.value;renderAllShapes();});
  document.getElementById('backRightFinSlide').addEventListener('input', function () {g_backRightFinAngle = this.value; renderAllShapes();});
  document.getElementById('backLeftFinAnimOnButton').onclick = function() {g_backLeftFinAnimation = true;};
  document.getElementById('backLeftFinAnimOffButton').onclick = function() {g_backLeftFinAnimation = false;};
  document.getElementById('backRightFinAnimOnButton').onclick = function() {g_backRightFinAnimation = true;};
  document.getElementById('backRightFinAnimOffButton').onclick = function() {g_backRightFinAnimation = false;};





  //front left fin
  document.getElementById('frontLeftFin1Slide').addEventListener('input', function () {g_frontLeftFinAngle1 = this.value; renderAllShapes();});
  document.getElementById('frontLeftFin2Slide').addEventListener('input', function () {g_frontLeftFinAngle2 = this.value;renderAllShapes();});
  document.getElementById('frontLeftFin3Slide').addEventListener('input', function () {g_frontLeftFinAngle3 = this.value;renderAllShapes();});

  //froont right fin
  document.getElementById('frontRightFin1Slide').addEventListener('input', function () {g_frontRightFinAngle1 = this.value;renderAllShapes();});

  document.getElementById('frontRightFin2Slide').addEventListener('input', function () {g_frontRightFinAngle2 = this.value;renderAllShapes();});

  document.getElementById('frontRightFin3Slide').addEventListener('input', function () {g_frontRightFinAngle3 = this.value;renderAllShapes();});

  document.getElementById('frontLeftFinAnimOnButton').onclick  = function() {g_frontLeftFinAnim1 = true;};
  document.getElementById('frontLeftFinAnimOffButton').onclick = function() { g_frontLeftFinAnim1 = false;};
  document.getElementById('frontRightFinAnimOnButton').onclick  = function() {g_frontRightFinAnim1 = true;};
  document.getElementById('frontRightFinAnimOffButton').onclick = function() {g_frontRightFinAnim1 = false;};






}


function main() {

  setupWebGL()
  connectVariablesToGLSL()
  addActionsForHtmlUI()

  
  canvas.onmousedown = function(ev) {
      if (ev.shiftKey) {
      g_pokeAnimation = true;
      g_pokeStartTime = g_seconds;
      return;
    }

    g_mouseDragging = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function() {
    g_mouseDragging = false;
  };

  canvas.onmouseleave = function() {
    g_mouseDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDragging) return;

    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;

    g_globalAngleY += dx * 0.5;
    g_globalAngleX += dy * 0.5;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;





function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  //console.log(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}



var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];


function click(ev) {
   if (ev.shiftKey) {
    g_pokeAnimation = true;
    g_pokeStartTime = g_seconds;
    return;
  }
  
  
  let [x,y] = convertCoordinatesEventToGL(ev);
  // Store the coordinates to g_points array
 // g_points.push([x, y]);
  
  let point;
  if (g_selectedType===POINT) {
    point = new Point();
  } else if (g_selectedType===TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  
  point.position=[x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; 
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function updateAnimationAngles() {
  if (g_bodyAnimation) {
  g_bodyOffset = 0.06 * Math.sin(g_seconds * 2);
} else {
  g_bodyOffset = 0;
}

  if (g_backLeftFinAnimation) {
  g_backLeftFinAngle = 3 * Math.sin(g_seconds * 3);
}

  if (g_backRightFinAnimation) {
    g_backRightFinAngle = 3 * Math.sin(g_seconds * 3);
  }

  if (g_frontLeftFinAnim1) {
  g_frontLeftFinAngle1 = 3 * Math.sin(g_seconds * 3);
}

if (g_frontRightFinAnim1) {
  g_frontRightFinAngle1 = 3 * Math.sin(g_seconds * 3);
}


if (g_pokeAnimation) {
  let t = g_seconds - g_pokeStartTime;

  g_headPokeAngle = 20 * Math.sin(t * 8);

  if (t > 0.6) {
    g_pokeAnimation = false;
    g_headPokeAngle = 0;
  }
}

}

function renderAllShapes(){
  var startTime = performance.now();

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);
 // var len = g_shapesList.length;


var body = new Cube();
body.color = [0.6, 0.9, 0.4, 1.0];
body.matrix.translate(-0.4 + g_bodyOffset, -0.3, -0.5);
body.matrix.rotate(-30, 1, 0, 0);
body.matrix.scale(0.8, 0.2, 0.9);
body.matrix.translate(0, 0, 0.15);
body.render();

//3D
var shellDome = new Sphere();
shellDome.color = [0.25, 0.4, 0.2, 1.0];
shellDome.matrix = new Matrix4(body.matrix);
shellDome.matrix.translate(0.5, 1.7, 0.5);
shellDome.matrix.scale(0.45, 0.22, 0.50);
shellDome.render();



var belly = new Cube();
belly.color = [0.95, 0.95, 0.75, 1.0];
belly.matrix = new Matrix4(body.matrix);
belly.matrix.translate(0, -0.22, 0);
belly.matrix.scale(1.0, 0.24, 1.0);
belly.render();


var shell = new Cube();
shell.color = [0.25, 0.35, 0.15, 1.0];
shell.matrix = new Matrix4(body.matrix);
shell.matrix.translate(-0.13, 0.99, 0);
shell.matrix.scale(1.25, .7, 1);
shell.render();

var head = new Cube();
head.color = [0.6, 0.9, 0.4, 1.0];
head.matrix = new Matrix4(body.matrix);

// move to head position
head.matrix.translate(0.3, 0.07, -0.22);

// pivot for rotation
head.matrix.translate(0.17, 0.5, 0.16);
head.matrix.rotate(g_headPokeAngle, 0, 1, 0);
head.matrix.translate(-0.17, -0.5, -0.16);

head.matrix.scale(0.34, 1.05, 0.32);

head.render();


var leftEye = new Cube();
leftEye.color = [0.0, 0.0, 0.0, 1.0];
leftEye.matrix = new Matrix4(head.matrix);
leftEye.matrix.translate(0.1, 0.30, -0.03);
leftEye.matrix.scale(0.2, 0.12, 0.08);
leftEye.render();

var rightEye = new Cube();
rightEye.color = [0.0, 0.0, 0.0, 1.0];
rightEye.matrix = new Matrix4(head.matrix);
rightEye.matrix.translate(0.7, 0.30, -0.03);
rightEye.matrix.scale(0.2, 0.12, 0.08);
rightEye.render();

//LEFT---------------------------------------------------------------------
var frontLeftFin = new Cube();
frontLeftFin.color = [0.6, 0.8, 0.4, 1.0];
frontLeftFin.matrix = new Matrix4(body.matrix);
frontLeftFin.matrix.translate(0.999, -0.15, -0.05);
frontLeftFin.matrix.translate(-1.0, 0.0, 0.0);
frontLeftFin.matrix.rotate(g_frontLeftFinAngle1, 0, 1, 0);
frontLeftFin.matrix.translate(1.0, 0.0, 0.0);
var leftFin1Coord = new Matrix4(frontLeftFin.matrix);
frontLeftFin.matrix.scale(0.35, 0.5, 0.40);
frontLeftFin.render();



var frontLeftFin2 = new Cube();
frontLeftFin2.color = [0.6, 0.8, 0.4, 1.0];
frontLeftFin2.matrix = new Matrix4(leftFin1Coord);
frontLeftFin2.matrix.translate(1.19 - 0.999, 0, -0.25);
frontLeftFin2.matrix.translate(-0.5, 0, 0);
frontLeftFin2.matrix.rotate(g_frontLeftFinAngle2, 0, 1, 0);
frontLeftFin2.matrix.translate(0.5, 0, 0);
var leftFin2Coord = new Matrix4(frontLeftFin2.matrix);
frontLeftFin2.matrix.scale(0.28, 0.4, 0.40);
frontLeftFin2.render();


var frontLeftFin3 = new Cube();
frontLeftFin3.color =[0.6, 0.8, 0.4, 1.0];
frontLeftFin3.matrix = new Matrix4(leftFin2Coord);
frontLeftFin3.matrix.translate(1.3 - 1.19, 0, -0.45 + 0.25);
frontLeftFin3.matrix.translate(-0.5, 0, 0);
frontLeftFin3.matrix.rotate(g_frontLeftFinAngle3, 0, 1, 0);
frontLeftFin3.matrix.translate(0.5, 0, 0);
frontLeftFin3.matrix.scale(0.17, 0.2, 0.20);
frontLeftFin3.render();



//RIGHT---------------------------------------------------------------------
var frontRightFin = new Cube();
frontRightFin.color = [0.6, 0.8, 0.4, 1.0];
frontRightFin.matrix = new Matrix4(body.matrix);
frontRightFin.matrix.translate(-0.35, -0.15, -0.05);
frontRightFin.matrix.translate(1.0, -0., -0.);
frontRightFin.matrix.rotate(-g_frontRightFinAngle1, 0, 1, 0);
frontRightFin.matrix.translate(-1.0, 0., 0.);
var rightFin1Coord = new Matrix4(frontRightFin.matrix);
frontRightFin.matrix.scale(0.35, 0.5, 0.40);
frontRightFin.render();



var frontRightFin2 = new Cube();
frontRightFin2.color = [0.6, 0.8, 0.4, 1.0];
frontRightFin2.matrix = new Matrix4(rightFin1Coord);
frontRightFin2.matrix.translate(-0.49 + 0.35, 0, -0.25);

// mirrored pivot
frontRightFin2.matrix.translate(0.5, 0, 0);
frontRightFin2.matrix.rotate(-g_frontRightFinAngle2, 0, 1, 0);
frontRightFin2.matrix.translate(-0.5, 0, 0);

var rightFin2Coord = new Matrix4(frontRightFin2.matrix);

frontRightFin2.matrix.scale(0.28, 0.4, 0.40);
frontRightFin2.render();


var frontRightFin3 = new Cube();
frontRightFin3.color =[0.6, 0.8, 0.4, 1.0];
frontRightFin3.matrix = new Matrix4(rightFin2Coord);
frontRightFin3.matrix.translate(0, 0, -0.45 + 0.25);

// mirrored pivot
frontRightFin3.matrix.translate(0.5, 0, 0);
frontRightFin3.matrix.rotate(-g_frontRightFinAngle3, 0, 1, 0);
frontRightFin3.matrix.translate(-0.5, 0, 0);

frontRightFin3.matrix.scale(0.17, 0.2, 0.20);
frontRightFin3.render();




//BACKT--------------------------------------------------------------------

var backLeftFin = new Cube();
backLeftFin.color = [0.6, 0.8, 0.4, 1.0];
backLeftFin.matrix = new Matrix4(body.matrix);
backLeftFin.matrix.translate(0.999, -0.15, 0.85);
backLeftFin.matrix.translate(-1.0, -0.5, -0.5);
backLeftFin.matrix.rotate(g_backLeftFinAngle, 0, 1, 0);
backLeftFin.matrix.translate(1.0, 0.5, 0.5);
backLeftFin.matrix.scale(0.25, 0.3, 0.40);
backLeftFin.render();


var backRightFin = new Cube();
backRightFin.color = [0.6, 0.8, 0.4, 1.0];
backRightFin.matrix = new Matrix4(body.matrix);
backRightFin.matrix.translate(-0.25, -0.15, 0.85);
backRightFin.matrix.translate(1.0, -0.5, -0.5);
backRightFin.matrix.rotate(-g_backRightFinAngle, 0, 1, 0);
backRightFin.matrix.translate(-1.0, 0.5, 0.5);
backRightFin.matrix.scale(0.25, 0.3, 0.40);
backRightFin.render();





 //var yellow = new Cube();
 //yellow.color = [1,1,0,1];
// yellow.matrix.setTranslate(0, -.5, 0.0);
// yellow.matrix.rotate(-5, 1, 0, 0);
// yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);

 //if (g_yellowAnimation) {
 //yellow.matrix.rotate(45*Math.sin(g_seconds), 0, 0, 1);
 //} else {
  //yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
 //}

 //var yellowCoordinatesMat = new Matrix4(yellow.matrix);
// yellow.matrix.scale(0.25, .7, .5);
 //yellow.matrix.translate(-0.5, 0, 0.0);
 //yellow.render();
 
//var magenta = new Cube();
//magenta.color = [1, 0, 1, 1];
//magenta.matrix = yellowCoordinatesMat;
//magenta.matrix.translate(0, 0.65, 0);
//magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
//magenta.matrix.scale(0.3, 0.3, 0.3);
//magenta.matrix.translate(-.5, 0, -.001);
//magenta.render();



  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps:" + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
