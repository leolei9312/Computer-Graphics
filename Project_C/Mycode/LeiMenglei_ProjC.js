var VSHADER_SOURCE =
  'struct MatlT {\n' +
  '   vec3 emit;\n' +
  '   vec3 ambi;\n' +
  '   vec3 diff;\n' +
  '   vec3 spec;\n' +
  '   int shiny;\n' +
    '};\n' +
  'uniform int u_mode; \n' +
  'uniform int v_movelight; \n' +
  'uniform int v_headlight; \n' +
  'struct LampT {\n' +
  '   vec3 pos;\n' +
  '   vec3 ambi;\n' +
  '   vec3 diff;\n' +
  '   vec3 spec;\n' +
  '}; \n' +
  'uniform LampT u_LampSet[2];\n' +
  'uniform vec3 u_eyeWorld; \n' +
  'uniform vec3 u_eyeWorld2; \n' +
  'uniform mat4 v_ProjMatrix;\n' +
  'uniform mat4 v_ViewMatrix;\n' +
  'uniform mat4 v_NormalMatrix;\n' +
  'uniform MatlT u_MatlSet[1];\n' +
  'varying vec3 v_Kd; \n' +
  'varying vec4 v_Position; \n' +
  'varying vec3 v_Normal; \n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'varying vec4 v_color;\n' +
  'uniform int goraud;\n' +
  'void main() {\n' +
  '  gl_Position = v_ProjMatrix * v_ViewMatrix * a_Position;\n' +
  '  v_Position = v_ViewMatrix * a_Position; \n' +
  '  v_Normal = normalize(vec3(v_NormalMatrix * a_Normal));\n' +
  '  v_Kd = u_MatlSet[0].diff; \n' +
  '  vec3 normal = normalize(v_Normal); \n' +
  '  vec3 lightdirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
  '  vec3 eyeDirection = normalize(u_eyeWorld - v_Position.xyz); \n' +
  '  float DotL = max(dot(lightdirection, normal), 0.0); \n' +
  '  vec3 H = normalize(lightdirection + eyeDirection); \n' +
  '  float nDotH = max(dot(H, normal), 0.0); \n' +
  '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +//bling Phong lighing
  '  vec3 lightdirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
  '  vec3 eyeDirection2 = normalize(u_eyeWorld2 - v_Position.xyz); \n' +
  '  float DotL2 = max(dot(lightdirection2, normal), 0.0); \n' +
  '  vec3 H2 = normalize(lightdirection2 + eyeDirection2); \n' +
  '  float nDotH2 = max(dot(H2, normal), 0.0); \n' +
  '  float e64_head = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +
  '  if(u_mode == 1) { \n' +
  '  vec3 reflectDir2 = reflect(-lightdirection2, normal);\n' +
  '  nDotH2 = max(dot(reflectDir2, eyeDirection2), 0.0);\n' +
  '  e64_head = pow(nDotH2, float(u_MatlSet[0].shiny) / 16.0);\n' +
  '  vec3 reflectDir = reflect(-lightdirection, normal);\n' +
  '  nDotH = max(dot(reflectDir, eyeDirection), 0.0);\n' +
  '  e64 = pow(nDotH, float(u_MatlSet[0].shiny) / 16.0);\n' +
  '  }\n' +
  '  vec3 emissive = u_MatlSet[0].emit;\n' +
  '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 ambient2 = u_LampSet[1].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse = u_LampSet[0].diff * v_Kd * DotL;\n' +
  '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * DotL2;\n' +
  '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
  '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e64_head;\n' +
  'if(v_movelight == 0 && v_headlight == 0){\n' +
  'v_color = vec4(0, 0, 0, 1.0);}\n' +
  'else if(v_movelight == 1 && v_headlight == 0){\n' +
  'v_color = vec4(emissive + ambient + diffuse + speculr, 1.0);}\n' +
  'else if(v_movelight == 0 && v_headlight == 1){\n' +
  'v_color = vec4(emissive + ambient2 + diffuse2 + speculr2, 1.0);}\n' +
  'else v_color = vec4(emissive + emissive + ambient + diffuse + speculr + ambient2 + diffuse2 + speculr2, 1.0);\n' +
  '}\n';
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  'precision highp int;\n' +
  'uniform int u_mode; \n' +
  'uniform int v_movelight; \n' +
  'uniform int v_headlight; \n' +
  'uniform int v_shaderFlg; \n' +
  'struct LampT {\n' +
  '   vec3 pos;\n' +
  '   vec3 ambi;\n' +
  '   vec3 diff;\n' +
  '   vec3 spec;\n' +
  '}; \n' +
  'struct MatlT {\n' +
  '   vec3 emit;\n' +
  '   vec3 ambi;\n' +
  '   vec3 diff;\n' +
  '   vec3 spec;\n' +
  '   int shiny;\n' +
  '   };\n' +
  'uniform LampT u_LampSet[2];\n' +
  'uniform MatlT u_MatlSet[1];\n' +
  'uniform vec3 u_eyeWorld; \n' +
  'uniform vec3 u_eyeWorld2; \n' +
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec3 v_Kd; \n' +
  'varying vec4 v_color;\n' +
  'void main() { \n' +
  '  vec3 normal = normalize(v_Normal); \n' +
  '  vec3 lightdirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
  '  vec3 eyeDirection = normalize(u_eyeWorld - v_Position.xyz); \n' +
  '  float DotL = max(dot(lightdirection, normal), 0.0); \n' +
  '  vec3 H = normalize(lightdirection + eyeDirection); \n' +
  '  float nDotH = max(dot(H, normal), 0.0); \n' +
  '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
  '  vec3 lightdirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
  '  vec3 eyeDirection2 = normalize(u_eyeWorld2 - v_Position.xyz); \n' +
  '  float DotL2 = max(dot(lightdirection2, normal), 0.0); \n' +
  '  vec3 H2 = normalize(lightdirection2 + eyeDirection2); \n' +
  '  float nDotH2 = max(dot(H2, normal), 0.0); \n' +
  '  float e64_head = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +

  '  if(u_mode == 1) { \n' +
  '  vec3 reflectDir2 = reflect(-lightdirection2, normal);\n' +
  '  nDotH2 = max(dot(reflectDir2, eyeDirection2), 0.0);\n' +
  '  e64_head = pow(nDotH2, float(u_MatlSet[0].shiny) / 16.0);\n' +
  '  vec3 reflectDir = reflect(-lightdirection, normal);\n' +
  '  nDotH = max(dot(reflectDir, eyeDirection), 0.0);\n' +
  '  e64 = pow(nDotH, float(u_MatlSet[0].shiny) / 16.0);\n' +
  '  }\n' +
  '  vec3 emissive = u_MatlSet[0].emit;\n' +
  '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 ambient2 = u_LampSet[1].ambi * u_MatlSet[0].ambi;\n' +
  '  vec3 diffuse = u_LampSet[0].diff * v_Kd * DotL;\n' +
  '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * DotL2;\n' +
  '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
  '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e64_head;\n' +
  ' if(v_shaderFlg == 1){gl_FragColor = v_color;\n' +
  '}else{\n' +
  'if(v_movelight == 0 && v_headlight == 0){\n' +
  'gl_FragColor = vec4(0, 0, 0, 1.0);}\n' +
  'else if(v_movelight == 1 && v_headlight == 0){\n' +
  'gl_FragColor = vec4(emissive + ambient + diffuse + speculr, 1.0);}\n' +
  'else if(v_movelight == 0 && v_headlight == 1){\n' +
  'gl_FragColor = vec4(emissive + ambient2 + diffuse2 + speculr2, 1.0);}\n' +
  'else gl_FragColor = vec4(emissive + emissive + ambient + diffuse + speculr + ambient2 + diffuse2 + speculr2, 1.0);\n' +
'}\n' +
'}\n';

var floatsPerVertex = 7;

var LAST_UPDATE = -1;
var LAST_UPDATE2= 0;
var LOOK_STEP = 0.02;
var ANGLE_STEP = 45.0;
var boatxlim = 0;
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var vloc_eyeWorld  = false;
var vloc_eyeWorld2  = false;
var u_ViewMatrix = false;
var u_ProjMatrix = false;
var u_NormalMatrix = false;
var canvas  = false;
var gl = false;
var u_mode = false;
var mode = false;
var u_movelight = false;
var movelight = false;
var shaderFlg = false;
var u_shaderFlg=false;
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;
var u_headlight = false;
var headlight = false;
var vloc_Ke = false;
var vloc_Ka = false;
var vloc_Kd = false;
var vloc_Ks = false;
var vloc_Kshiny = false;

var eyeWorld = new Float32Array(3);
var eyeWorld2 = new Float32Array(3);
var lamp0 = new LightsT();
var lamp1 = new LightsT();

var matlSel= 1;
var matl0 = new Material(matlSel);

var lightx = 0;
var lighty = 0;
var lightz = 0;

var r1=1;
var g1=1;
var b1=1;
var r2=1;
var g2=1;
var b2=1;
var r3=30;
var g3=30;
var b3=30;


function main() {
  canvas = document.getElementById('webgl');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);

  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  gl.clearColor(0.5, 0.3, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
  canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) };
  // when user's mouse button goes down, call mouseDown() function
  canvas.onmousemove = function(ev){myMouseMove( ev, gl, canvas) };
  // when the mouse moves, call mouseMove() function
  canvas.onmouseup = function(ev){myMouseUp(   ev, gl, canvas)};
  vloc_eyeWorld  = gl.getUniformLocation(gl.program, 'u_eyeWorld');
  vloc_eyeWorld2  = gl.getUniformLocation(gl.program, 'u_eyeWorld2');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'v_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'v_ProjMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'v_NormalMatrix');

  u_mode = gl.getUniformLocation(gl.program, 'u_mode');
  u_movelight = gl.getUniformLocation(gl.program, 'v_movelight');
  u_headlight = gl.getUniformLocation(gl.program, 'v_headlight');
  u_shaderFlg=gl.getUniformLocation(gl.program, 'v_shaderFlg');

  mode = 0;
  movelight = 1;
  headlight = 1;


  vloc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
  vloc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
  vloc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
  vloc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
  vloc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');

  if(!vloc_Ke || !vloc_Ka || !vloc_Kd || !vloc_Ks || !vloc_Kshiny) {
    console.log('Failed to get GPUs Reflectance storage locations');
    return;
  }

  if (!vloc_eyeWorld || !vloc_eyeWorld2 ||
      !u_ViewMatrix || !u_ProjMatrix || !u_NormalMatrix) {
    console.log('Failed to get GPUs matrix storage locations');
    return;
    }

  lamp0.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');
  lamp0.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
  lamp0.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
  lamp0.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
  if( !lamp0.u_pos || !lamp0.u_ambi || !lamp0.u_diff || !lamp0.u_spec ) {
    console.log('Failed to get GPUs Lamp0 storage locations');
    return;
  }

  lamp1.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[1].pos');
  lamp1.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[1].ambi');
  lamp1.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[1].diff');
  lamp1.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[1].spec');
  if( !lamp1.u_pos || !lamp1.u_ambi || !lamp1.u_diff || !lamp1.u_spec ) {
    console.log('Failed to get GPUs Lamp0 storage locations');
    return;
  }

  gl.uniform3fv(vloc_eyeWorld, eyeWorld);
  gl.uniform3fv(vloc_eyeWorld2, eyeWorld2);

  eyeWorld2.set([0, 5, 4]);

  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
  window.addEventListener("keydown", function(ev){
    switch(ev.keyCode) {
      case 37://left-arrow
      g_LookAtX += 0.05;
      g_EyeX += 0.05;
      break;
      case 38://up
      g_LookAtY -= 0.1;
      g_EyeY -= 0.1;
      break;
      case 39://right
      g_LookAtX -= 0.05;
      g_EyeX -= 0.05;
      break;
      case 40://down
      g_LookAtY += 0.1;
      g_EyeY += 0.1;
      break;
      case 87://w
      g_LookAtZ += 0.1;
      g_EyeZ += 0.1;
      break;
      case 83://s
      g_LookAtZ -= 0.1;
      g_EyeZ -= 0.1;
      break;
      case 65://a
      g_LookAtX += 0.1;
      break;
      case 68://d
      g_LookAtX -= 0.1;
      break;
      case 85://u look down
      g_LookAtZ -= 0.1;
      break;
      case 73://i look up
      g_LookAtZ += 0.1;
      break;
      case 72://h
      window.open('../lib/userinstruction.html', width = 300);
      break;
      case 187://=
      r1 += 0.2;
      g1 += 0.2;
      b1 += 0.2;
      r2 += 0.2;
      g2 += 0.2;
      b2 += 0.2;
      break;
      case 189://-
      r1 -= 0.2;
      g1 -= 0.2;
      b1 -= 0.2;
      r2 -= 0.2;
      g2 -= 0.2;
      b2 -= 0.2;
      break;
      // case 77://m
      // if(mode < 2) mode ++;
      // else mode = 0;
      // console.log("change mode");
      // break;
      case 48://0
      if(movelight == 1) movelight = 0;
      else movelight = 1;
      break;
      case 57://9
      if(headlight == 1){
        headlight = 0;
        //gl.clearColor(0,0,0,1);
      }
      else{
        headlight = 1;
        //gl.clearColor(0.5, 0.3, 0.2, 1);
      }
      break;
      default:
      break;
      }
    }, false);

  if (!u_ViewMatrix || !u_ProjMatrix) {
    console.log('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }
  lamp1.I_pos.elements.set([lightx, lighty, lightz]);
  lamp1.I_ambi.elements.set([0.5, 0.5, 0.5]);
  lamp1.I_diff.elements.set([1, 1, 1]);
  lamp1.I_spec.elements.set([10, 10, 10]);
  currentAngle = 0;
  var tick = function() {
    eyeWorld.set([g_EyeX, g_EyeY, g_EyeZ]);


    lamp0.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
    lamp0.I_ambi.elements.set([r1, g1, b1]);
    lamp0.I_diff.elements.set([r2 + 1, g2 + 1, b2 + 1]);
    lamp0.I_spec.elements.set([r3 + 1, g3 + 1, b3 + 1]);

    currentAngle = animate(currentAngle);
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    initVertexBuffers(gl);
    draw(gl, currentAngle, canvas);
    requestAnimationFrame(tick, canvas);
  };
  tick();

}

function BlinnPhongGoraud(){
  mode = 0;
  shaderFlg = 1;

}
function PhongGoraud(){
  mode = 1;
  shaderFlg = 1;
}
function PhongPhongShading(){
  shaderFlg = 0;
  mode = 1;
}
function BlinnPhongPhongShading(){
  shaderFlg = 0;
  mode = 0;
}
function cook(){
  mode = 2;
}
function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 1.0]);	// bright yellow
 	var yColr = new Float32Array([1.0, 1.0, 1.0]);	// bright green.

  // Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
              // draw a grid made of xcount+ycount lines; 2 vertices per line.

	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = xColr[0];			// red
		gndVerts[j+4] = xColr[1];			// grn
		gndVerts[j+5] = xColr[2];			// blu
	}
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = yColr[0];			// red
		gndVerts[j+4] = yColr[1];			// grn
		gndVerts[j+5] = yColr[2];			// blu
	}
}


function initVertexBuffers(gl) {
//==============================================================================
  makeself();
  makeGroundGrid();
  makeSphere();
  mySiz = ziji.length + gndVerts.length + sphVerts.length;

  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  var verticesColors = new Float32Array(mySiz);

  zijiStart = 0;              // we store the forest first.
  for(i=0,j=0; j< ziji.length; i++,j++) {
    verticesColors[i] = ziji[j];
    }
  gndStart = i;           // next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++, j++) {
    verticesColors[i] = gndVerts[j];
    }
  sphStart = i;
  for(j=0; j< sphVerts.length; i++, j++) {
    verticesColors[i] = sphVerts[j];
    }

  var vertexColorbuffer = gl.createBuffer();
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
  gl.enableVertexAttribArray(a_Normal);

  return mySiz/floatsPerVertex; // return # of vertices
}

function makeself(){
  var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
  var a = Math.sqrt(0.5);
  var a1=a/2;
  var sq6 = Math.sqrt(6.0);
  ziji = new Float32Array([
    0.3, 1.0, 0.3, 1.0,   1, 0, 0,
    0.3, 1.0, -0.3, 1.0,   1, 0, 0,
    -0.3, 1.0, -0.3, 1.0,  1, 0, 0,

    0.3, 1.0, 0.3, 1.0,    1, 0, 0,
    -0.3, 1.0, 0.3, 1.0,   1, 0, 0,
    -0.3, 1.0, -0.3, 1.0,    1, 0, 0,

    0.3, 1.0, -0.3, 1.0,    0, 1, 0,                //face 2.(T1)
    0.3, 1.0, 0.3, 1.0,   0, 1, 0,
    0.3, -1.0, 0.3, 1.0,   0,1, 0,

    0.3, 1.0, -0.3, 1.0,   0,1, 0,                  //T2
    0.3, -1.0, -0.3, 1.0,  0, 1, 0,
    0.3, -1.0, 0.3, 1.0,   0, 1, 0,


    -0.3, 1.0, 0.3, 1.0,   0, 0, 1,   //face 3.(T1)
    0.3, 1.0, 0.3, 1.0, 0, 0, 1,
    0.3, -1.0, 0.3, 1.0,   0, 0, 1,

    -0.3, 1.0, 0.3, 1.0,  0, 0, 1,    //T2
    -0.3, -1.0, 0.3, 1.0, 0, 0, 1,
    0.3, -1.0, 0.3, 1.0, 0, 0, 1,


    -0.3, 1.0, 0.3, 1.0,  -1, 0, 0,    //face 4.(T1)
    -0.3, 1.0, -0.3, 1.0,-1, 0, 0,
    -0.3, -1.0, -0.3, 1.0,  -1, 0, 0,

    -0.3, 1.0, 0.3, 1.0,   -1, 0, 0,   //T2
    -0.3, -1.0, 0.3, 1.0, -1, 0, 0,
    -0.3, -1.0, -0.3, 1.0, -1, 0, 0,


    0.3, 1.0, -0.3, 1.0,   0, -1, 0,                 //face 5.(T1)
    -0.3, 1.0, -0.3, 1.0, 0, -1, 0,
    -0.3, -1.0, -0.3, 1.0, 0, -1, 0,

    0.3, 1.0, -0.3, 1.0,   0, -1, 0,                //T2
    0.3, -1.0, -0.3, 1.0,  0, -1, 0,
    -0.3, -1.0, -0.3, 1.0, 0, -1, 0,


    -0.3, -1.0, -0.3, 1.0,   0, 0, -1,                //face 6.(T1)
    -0.3, -1.0, 0.3, 1.0, 0, 0, -1,
    0.3, -1.0, 0.3, 1.0,  0, 0, -1,

    -0.3, -1.0, -0.3, 1.0,  0, 0, -1,                //T2
    0.3, -1.0, -0.3, 1.0,  0, 0, -1,
    0.3, -1.0, 0.3, 1.0,  0, 0, -1,        //36


    //boat
    //front
    1.0, 1.0, 1.0, 1.0,   0, 1, 0, //0
    -1.0, 1.0, 1.0, 1.0,   0, 1, 0, //1
    -0.5, 0.2, 1.0, 1.0,   0, 1, 0, //2

    1.0, 1.0, 1.0,1.0,     0, 1, 0, //0
    -0.5, 0.2, 1.0,1.0,     0, 1, 0, //2
    0.5, 0.2, 1.0,1.0,      0, 1, 0, //3
    //right
    1.0, 1.0, 1.0,1.0,     1, 0, 0,  //0
    0.5, 0.2, 1.0,1.0,      1, 0, 0, //3
    0.5, 0.2,-1.0,1.0,      1, 0, 0, //4

    1.0, 1.0, 1.0,1.0,     1, 0, 0,  //0
    0.5, 0.2,-1.0,1.0,      1, 0, 0,  //4
    1.0, 1.0,-1.0,1.0,     1, 0, 0,  //5
    //up
    1.0, 1.0, 1.0,1.0,      0, 0, 1, //0
    -1.0, 1.0,1.0,1.0,      0, 0, 1, //1
    -1.0, 1.0,-1.0,1.0,    0, 0, 1, //6

    1.0, 1.0, 1.0,1.0,     0, 0, 1, //0
    -1.0, 1.0,-1.0,1.0,  0, 0, 1, //6
    1.0, 1.0, -1.0,1.0,   0, 0, 1, //5

    //left
    -1.0, 1.0, 1.0,1.0,    -1, 0, 0, //1
    -0.5, 0.2,1.0,1.0,   -1, 0, 0, //2
    -0.5,0.2,-1.0,1.0,  -1, 0, 0, //7

    -1.0, 1.0, 1.0,1.0,  -1, 0, 0, //1
    -0.5,0.2,-1.0,1.0,   -1, 0, 0, //7
    -1.0, 1.0, -1.0,1.0,  -1, 0, 0, //6
    //down
    -0.5,0.2,1.0, 1.0,  0, 0, -1,  //2
    0.5, 0.2,1.0, 1.0,   0, 0, -1,  //3
    0.5, 0.2, -1.0,1.0,   0, 0, -1,  //4

    -0.5,0.2,1.0, 1.0,   0, 0, -1,   //2
    0.5, 0.2, -1.0,  1.0,   0, 0, -1,   //4
    -0.5, 0.2, -1.0,1.0,    0, 0, -1,   //7

    //back
    0.5, 0.2,-1.0,  1.0,  0, -1, 0,      //4
    1.0,1.0,-1.0,1.0,   0, -1, 0,      //5
    -1.0, 1.0,-1.0, 1.0,   0, -1, 0,      //6

     0.5, 0.2,-1.0, 1.0,   0, -1, 0,    //4
     -1.0, 1.0,-1.0, 1.0, 0, -1, 0,    //6
     -0.5, 0.2,-1.0,1.0,  0, -1, 0,    //7
     //72

     //next object : flag

     0, 0.5, 0, 1.0,   0, 1, 0,
     -0.5, -0.5, 0, 1.0, 0, 1, 0,
     0.5, -0.5, 0, 1.0,  0, 1, 0,
     //75

     //next object : cube
     0,1,1, 1, 0,1,0,
     1,1,1, 1, 0,1,0,
     0,1,0, 1,   0,1,0,

     1,1,1, 1,  0,1,0,
     0,1,0, 1, 0,1,0,
     1,1,0, 1,  0,1,0,//FRONT

     1,1,0, 1, 1,0,0,
     1,1,1, 1,  1,0,0,
     1,0,0, 1,  1,0,0,

     1,1,1, 1,  1,0,0,
     1,0,0, 1,   1,0,0,
     1,0,1, 1,  1,0,0,//Right

     1,1,0, 1, 0,0,-1,
     0,1,0, 1,  0,0,-1,
     1,0,0, 1,   0,0,-1,

     0,1,0, 1,  0,0,-1,
     1,0,0, 1,   0,0,-1,
     0,0,0, 1,    0,0,-1,//Down

     0,1,0, 1,  -1,0,0,
     0,1,1, 1,  -1,0,0,
     0,0,0, 1, -1,0,0,

     0,1,1, 1,   -1,0,0,
     0,0,0, 1,   -1,0,0,
     0,0,1, 1,  -1,0,0,//left

     0,1,1, 1,   0,0,1,
     1,1,1, 1,  0,0,1,
     1,0,1, 1,   0,0,1,

     0,1,1, 1,   0,0,1,
     1,0,1, 1,   0,0,1,
     0,0,1, 1,   0,0,1,//top

     0,0,1, 1,  0,-1,0,
     1,0,1, 1,   0,-1,0,
     0,0,0, 1,    0,-1,0,

     0,0,0, 1,    0,-1,0,
     1,0,1, 1,  0,-1,0,
     1,0,0, 1,   0,-1,0,//back

     //111

     //next object : stars

     +0.0, +1.0, +1.0, +1.0, 1, 0, 0,
     +0.4, +0.0, +1.0, +1.0,  1, 0, 0,
     +1.5, +0.0, +1.0, +1.0, 1, 0, 0,
     +0.8, -0.8, +1.0, +1.0,1, 0, 0,
     +1.0, -1.8, +1.0, +1.0, 1, 0, 0,
     +0.0, -1.0, +1.0, +1.0, 1, 0, 0,
     -1.0, -1.8, +1.0, +1.0, 1, 0, 0,
     -0.8, -0.8, +1.0, +1.0, 1, 0, 0,
     -1.5, +0.0, +1.0, +1.0, 1, 0, 0,
     -0.4, +0.0, +1.0, +1.0, 1, 0, 0,
//121
     +0.0, +1.0, -1.0, +1.0, -1, 0, 0,
     +0.4, +0.0, -1.0, +1.0,-1, 0, 0,
     +1.5, +0.0, -1.0, +1.0,-1, 0, 0,
     +0.8, -0.8, -1.0, +1.0,-1, 0, 0,
     +1.0, -1.8, -1.0, +1.0, -1, 0, 0,
     +0.0, -1.0, -1.0, +1.0,-1, 0, 0,
     -1.0, -1.8, -1.0, +1.0, -1, 0, 0,
     -0.8, -0.8, -1.0, +1.0, -1, 0, 0,
     -1.5, +0.0, -1.0, +1.0, -1, 0, 0,
     -0.4, +0.0, -1.0, +1.0, -1, 0, 0,
//131
     +0.0, +1.0, +1.0, +1.0, 0, -1, 0,
     +0.0, +1.0, -1.0, +1.0, 0, -1, 0,
     +0.4, +0.0, +1.0, +1.0, 0, -1, 0,
     +0.4, +0.0, -1.0, +1.0, 0, -1, 0,
     +1.5, +0.0, +1.0, +1.0, 0, -1, 0,
     +1.5, +0.0, -1.0, +1.0, 0, -1, 0,
     +0.8, -0.8, +1.0, +1.0,0, -1, 0,
     +0.8, -0.8, -1.0, +1.0,0, -1, 0,
     +1.0, -1.8, +1.0, +1.0, 0, -1, 0,
     +1.0, -1.8, -1.0, +1.0, 0, -1, 0,
//141
     +0.0, -1.0, +1.0, +1.0,0,1,0,
     +0.0, -1.0, -1.0, +1.0,0,1,0,
     -1.0, -1.8, +1.0, +1.0,0,1,0,
     -1.0, -1.8, -1.0, +1.0,0,1,0,
     -0.8, -0.8, +1.0, +1.0,0,1,0,
     -0.8, -0.8, -1.0, +1.0,0,1,0,
     -1.5, +0.0, +1.0, +1.0,0,1,0,
     -1.5, +0.0, -1.0, +1.0,0,1,0,
     -0.4, +0.0, +1.0, +1.0,0,1,0,
     -0.4, +0.0, -1.0, +1.0,0,1,0,
     +0.0, +1.0, +1.0, +1.0,0,1,0,
     +0.0, +1.0, -1.0, +1.0, 0,1,0,
     //153

     0.0,	 0.0, sq2, 1.0,		0, 1, 0,// Node 0
     c30, -0.5, 0.0, 1.0, 		 0, 1, 0,	// Node 1
     0.0,  1.0, 0.0, 1.0,  			0, 1, 0,// Node 2
     // Face 1: (right side)
    0.0,	 0.0, sq2, 1.0,		1, 0, 0,// Node 0
     0.0,  1.0, 0.0, 1.0,  			1, 0, 0,// Node 2
    -c30, -0.5, 0.0, 1.0, 			1, 0, 0,// Node 3
     // Face 2: (lower side)
    0.0,	 0.0, sq2, 1.0,			0, 1, 0,// Node 0
    -c30, -0.5, 0.0, 1.0, 		0, 1, 0,// Node 3
     c30, -0.5, 0.0, 1.0, 	 	0, 1, 0,// Node 1
       // Face 3: (base side)
    -c30, -0.5, -0.2, 1.0, 		0, 1, 0,// Node 3
     0.0,  1.0, -0.2, 1.0,  	0, 1, 0,// Node 2
     c30, -0.5, -0.2, 1.0, 		0, 1, 0,// Node 1
     //165

     //cylinder
     0.0,  0.0,  0.0,  1,     0.0, 1.0, 0.0,
     0.5,  0.0,  0.0,  1,     0.0, 1.0, 0.0,
      a1,  0.0,  -a1,  1,      0.0, 1.0, 0.0,//1

     0.0,  0.0,  0.0,  1,     0.0, 1.0, 0.0,
      a1,  0.0,  -a1,  1,     0.0, 1.0, 0.0,
     0.0,  0.0, -0.5,  1,    0.0, 1.0, 0.0,//2

     0.0,  0.0,  0.0,  1,      0.0, 1.0, 0.0,
     0.0,  0.0, -0.5,  1,     0.0, 1.0, 0.0,
     -a1,  0.0,  -a1,  1,      0.0, 1.0, 0.0,//3

     0.0,  0.0,  0.0,  1,       0.0, 1.0, 0.0,
     -a1,  0.0,  -a1,  1,       0.0, 1.0, 0.0,
    -0.5,  0.0,  0.0,  1,       0.0, 1.0, 0.0,//4

     0.0,  0.0,  0.0,  1,     0.0, 1.0, 0.0,
    -0.5,  0.0,  0.0,  1,     0.0, 1.0, 0.0,
     -a1,  0.0,   a1,  1,      0.0, 1.0, 0.0,//5

     0.0,  0.0,  0.0,  1,    0.0, 1.0, 0.0,
     -a1,  0.0,   a1,  1,    0.0, 1.0, 0.0,
     0.0,  0.0,  0.5,  1,      0.0, 1.0, 0.0,//6

     0.0,  0.0,  0.0,  1,  0.0, 1.0, 0.0,
     0.0,  0.0,  0.5,  1,    0.0, 1.0, 0.0,
      a1,  0.0,   a1,  1,   0.0, 1.0, 0.0,//7

     0.0,  0.0,  0.0,  1,    0.0, 1.0, 0.0,
      a1,  0.0,   a1,  1,     0.0, 1.0, 0.0,
     0.5,  0.0,  0.0,  1,     0.0, 1.0, 0.0,//8 //24

     0.0,  2.0,  0.0,  1,     0.0, 1.0, 0.0,
     0.5,  2.0,  0.0,  1,    0.0, 1.0, 0.0,
      a1,  2.0,  -a1,  1,     0.0, 1.0, 0.0,//1

     0.0,  2.0,  0.0,  1,      0.0, 1.0, 0.0,
      a1,  2.0,  -a1,  1,      0.0, 1.0, 0.0,
     0.0,  2.0, -0.5,  1,       0.0, 1.0, 0.0,//2

     0.0,  2.0,  0.0,  1,      0.0, 1.0, 0.0,
     0.0,  2.0, -0.5,  1,      0.0, 1.0, 0.0,
     -a1,  2.0,  -a1,  1,      0.0, 1.0, 0.0,//3

     0.0,  2.0,  0.0,  1,      0.0, 1.0, 0.0,
     -a1,  2.0,  -a1,  1,     0.0, 1.0, 0.0,
    -0.5,  2.0,  0.0,  1,     0.0, 1.0, 0.0,//4

     0.0,  2.0,  0.0,  1,    0.0, 1.0, 0.0,
    -0.5,  2.0,  0.0,  1,     0.0, 1.0, 0.0,
     -a1,  2.0,   a1,  1,    0.0, 1.0, 0.0,//5

     0.0,  2.0,  0.0,  1,      0.0, 1.0, 0.0,
     -a1,  2.0,   a1,  1,    0.0, 1.0, 0.0,
     0.0,  2.0,  0.5,  1,     0.0, 1.0, 0.0,//6

     0.0,  2.0,  0.0,  1,       0.0, 1.0, 0.0,
     0.0,  2.0,  0.5,  1,       0.0, 1.0, 0.0,
      a1,  2.0,   a1,  1,    0.0, 1.0, 0.0,//7

     0.0,  2.0,  0.0,  1,     0.0, 1.0, 0.0,
      a1,  2.0,   a1,  1,    0.0, 1.0, 0.0,
     0.5,  2.0,  0.0,  1,    0.0, 1.0, 0.0,//8 //48

     0.5,  0.0,  0.0,  1,     0.0, 0.0, 1.0,
      a1,  0.0,  -a1,  1,     0.0, 0.0, 1.0,
     0.5,  2.0,  0.0,  1,    0.0, 0.0, 1.0,//middle//1

     0.5,  2.0,  0.0,  1,     0.0, 0.0, 1.0,
      a1,  2.0,  -a1,  1,    0.0, 0.0, 1.0,
      a1,  0.0,  -a1,  1,      0.0, 0.0, 1.0,//1

      a1,  0.0,  -a1,  1,   0.0, 0.0, 1.0,
     0.0,  0.0, -0.5,  1,    0.0, 0.0, 1.0,
      a1,  2.0,  -a1,  1,      0.0, 0.0, 1.0,

      a1,  2.0,  -a1,  1,       0.0, 0.0, 1.0,
     0.0,  2.0, -0.5,  1,     0.0, 0.0, 1.0,
     0.0,  0.0, -0.5,  1,      0.0, 0.0, 1.0, //2

     0.0,  0.0, -0.5,  1,       0.0, 0.0, 1.0,
     -a1,  0.0,  -a1,  1,   0.0, 0.0, 1.0,
     0.0,  2.0, -0.5,  1,      0.0, 0.0, 1.0,

     0.0,  2.0, -0.5,  1,      0.0, 0.0, 1.0,
     -a1,  2.0,  -a1,  1,      0.0, 0.0, 1.0,
     -a1,  0.0,  -a1,  1,     0.0, 0.0, 1.0,//3

     -a1,  2.0,  -a1,  1,      0.0, 0.0, 1.0,
    -0.5,  2.0,  0.0,  1,   0.0, 0.0, 1.0,
    -0.5,  0.0,  0.0,  1,     0.0, 0.0, 1.0,

     -a1,  0.0,  -a1,  1,     0.0, 0.0, 1.0,
    -0.5,  0.0,  0.0,  1,      0.0, 0.0, 1.0,
     -a1,  2.0,  -a1,  1,     0.0, 0.0, 1.0,//4

    -0.5,  0.0,  0.0,  1,      0.0, 0.0, 1.0,
     -a1,  0.0,   a1,  1,      0.0, 0.0, 1.0,
    -0.5,  2.0,  0.0,  1,     0.0, 0.0, 1.0,

    -0.5,  2.0,  0.0,  1,    0.0, 0.0, 1.0,
     -a1,  2.0,   a1,  1,      0.0, 0.0, 1.0,
     -a1,  0.0,   a1,  1,      0.0, 0.0, 1.0,//5

     -a1,  0.0,   a1,  1,     0.0, 0.0, 1.0,
     0.0,  0.0,  0.5,  1,      0.0, 0.0, 1.0,
     0.0,  2.0,  0.5,  1,      0.0, 0.0, 1.0,

     -a1,  0.0,   a1,  1,      0.0, 0.0, 1.0,
     -a1,  2.0,   a1,  1,    0.0, 0.0, 1.0,
     0.0,  2.0,  0.5,  1,      0.0, 0.0, 1.0,//6

     0.0,  2.0,  0.5,  1,     0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,      0.0, 0.0, 1.0,
     0.0,  0.0,  0.5,  1,       0.0, 0.0, 1.0,

     0.0,  0.0,  0.5,  1,    0.0, 0.0, 1.0,
      a1,  0.0,   a1,  1,      0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,     0.0, 0.0, 1.0,//7

      a1,  0.0,   a1,  1,   0.0, 0.0, 1.0,
     0.5,  0.0,  0.0,  1,     0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,    0.0, 0.0, 1.0,

     a1,   2.0,   a1,  1,     0.0, 0.0, 1.0,
     0.5,  2.0,  0.0,  1,    0.0, 0.0, 1.0,
     0.5,  0.0,  0.0,  1,    0.0, 0.0, 1.0,//8
     //165+ 96 = 261

     0.0,  0.0, sq2, 1.0,   sq6, sq2, 1,// Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0,   sq6, sq2, 1,// Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,   sq6, sq2, 1,// Node 2 (base: +y axis;  grn)
      // Face 1: (right side)
     0.0,  0.0, sq2, 1.0,   -sq6, sq2, 1,// Node 0 (apex, +z axis;  blue)
     0.0,  1.0, 0.0, 1.0,   -sq6, sq2, 1,// Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0,   -sq6, sq2, 1,// Node 3 (base:lower lft; white)
      // Face 2: (lower side)
     0.0,  0.0, sq2, 1.0,   0, -2*sq2, 1,// Node 0 (apex, +z axis;  blue)
    -c30, -0.5, 0.0, 1.0,   0, -2*sq2, 1,// Node 3 (base:lower lft; white)
     c30, -0.5, 0.0, 1.0,   0, -2*sq2, 1,// Node 1 (base: lower rt; red)
      // Face 3: (base side)
    -c30, -0.5, 0.0, 1.0,   0, 0, -1,// Node 3 (base:lower lft; white)
     0.0,  1.0, 0.0, 1.0,   0, 0, -1,// Node 2 (base: +y axis;  grn)
     c30, -0.5, 0.0, 1.0,   0, 0, -1,
  ]);
}

var g_EyeX = 0, g_EyeY = 9, g_EyeZ = 2;

var g_LookAtX= 0.0, g_LookAtY=0.0,  g_LookAtZ=0.0;
function draw(gl, currentAngle, canvas) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform3fv(lamp0.u_pos,  lamp0.I_pos.elements.slice(0,3));
  gl.uniform3fv(lamp0.u_ambi, lamp0.I_ambi.elements);   // ambient
  gl.uniform3fv(lamp0.u_diff, lamp0.I_diff.elements);   // diffuse
  gl.uniform3fv(lamp0.u_spec, lamp0.I_spec.elements);   // Specular

  gl.uniform3fv(lamp1.u_pos,  lamp1.I_pos.elements.slice(0,3));
  gl.uniform3fv(lamp1.u_ambi, lamp1.I_ambi.elements);   // ambient
  gl.uniform3fv(lamp1.u_diff, lamp1.I_diff.elements);   // diffuse
  gl.uniform3fv(lamp1.u_spec, lamp1.I_spec.elements);   // Specular

  gl.viewport(0, 0, canvas.width,canvas.height);
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);

  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ,g_LookAtX, g_LookAtY, g_LookAtZ, 0, 0, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  gl.uniform1i(u_mode, mode);
  gl.uniform1i(u_movelight, movelight);
  gl.uniform1i(u_headlight, headlight);
  gl.uniform1i(u_shaderFlg,shaderFlg);
  drawMyScene(gl, currentAngle);
}

function drawMyScene(gl, currentAngle) {
  matlSel = 16;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny
  viewMatrix.translate(0.0, 0.0, -0.8);
  viewMatrix.rotate(180,0,0,1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.4, 0.4,0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.LINES,	gndStart/floatsPerVertex,	gndVerts.length/floatsPerVertex);


  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);

  matlSel = 6;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny

  matlSel = 13;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny

  //rodder
  viewMatrix = popMatrix();
  viewMatrix.translate(0.0, -5.0, 2.3);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(currentAngle,0,1,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.1, 0.8, 0.1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex,	36);


  matlSel = 11;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  //boat
  viewMatrix = popMatrix();
  viewMatrix.translate(0.0, -5, 0.0);
  viewMatrix.rotate(180,0,1,0);
  viewMatrix.rotate(-90,1,0,0);
  viewMatrix.rotate(90, 0, 1, 0);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1.5, 1.5, 1.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  //flag
  matlSel = 6;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  viewMatrix.translate(0.0, -5.0, 2.7);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(-90, 0, 0, 1);
  viewMatrix.rotate(currentAngle * 3, 1, 0, 0);
  viewMatrix.translate(0, 0.7, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.8, 1.5, 1.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 72,	3);

  //cubes
  matlSel = 10;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  viewMatrix.translate(1.5, -10.5, 0);
  viewMatrix.rotate(180,0,1,0);
  viewMatrix.rotate(-90,1,0,0);
  viewMatrix.rotate(currentAngle * 2, 0, 1, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.3, 0.3, 0.3);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  matlSel = 9;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  matlSel = 8;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 0, 1, 0);
  viewMatrix.translate(0,0.5,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);

  //multijoints
  matlSel = 1;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  viewMatrix.translate(5.0, 5.0, 1.5);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.rotate(currentAngle,0,1,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(0.4, 0.8, 0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  matlSel = 2;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  matlSel = 3;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  matlSel = 4;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);
  viewMatrix.rotate(currentAngle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 75,	36);

  //propel
  //stars
  matlSel = 9;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  viewMatrix.translate(0.21, -5, 1);
  viewMatrix.rotate(90, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 1, 0, 0);
  viewMatrix.translate(0, 0, 3);
  viewMatrix.rotate(currentAngle * 7, 0, 0, 1);
	viewMatrix.scale(0.4, 0.4, 0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, zijiStart/floatsPerVertex + 111, 10);
  gl.drawArrays(gl.LINE_LOOP, zijiStart/floatsPerVertex + 121, 10);
  gl.drawArrays(gl.TRIANGLE_STRIP, zijiStart/floatsPerVertex + 131, 22);

  //Rectangular
  matlSel = 7;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  viewMatrix.translate(0.15, -5.0, 1.0);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(currentAngle, 0, 0, 1);
  viewMatrix.translate(0, -2.2, 0);
	viewMatrix.scale(0.3, 0.8, 0.3);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex,	36);

  //next joints:
  viewMatrix = popMatrix();
  viewMatrix.translate(-5.0, -5, 0.0);
  viewMatrix.rotate(180,0,1,0);
  viewMatrix.rotate(-90,1,0,0);
  viewMatrix.rotate(90, 0, 1, 0);
  viewMatrix.scale(0.3, 0.3, 0.3);
  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);


  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  matlSel = 10;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);


  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  matlSel = 11;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(0.0, 1, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijiStart/floatsPerVertex + 36,	36);

  //sphere
  matlSel = 2;
  matl0 = new Material(matlSel);
  gl.uniform3fv(vloc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(vloc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(vloc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(vloc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(vloc_Kshiny, parseInt(matl0.K_shiny, 10));
  viewMatrix = popMatrix();
  //viewMatrix.rotate(currentAngle / 5, 0, 1, 0);
  viewMatrix.translate(2.0, 1, 1);
  viewMatrix.scale(5,5,5);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
               sphStart/floatsPerVertex, // start at this vertex number, and
               sphVerts.length/floatsPerVertex);

}
function makeSphere() {
  var slices = 13;
  var sliceVerts  = 27;
  var topColr = new Float32Array([0.6, 0.3, 0.2]);
  var equColr = new Float32Array([0.7, 0.4, 0.3]);
  var botColr = new Float32Array([0.6, 0.3, 0.2]);
  var sliceAngle = Math.PI/slices;

  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);

  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0;
  var j = 0;
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) {
    if(s==0) {
      isFirst = 1;
      cos0 = 1.0;
      sin0 = 0.0;
    }
    else {
      isFirst = 0;
      cos0 = cos1;
      sin0 = sin1;
    }
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);

    if(s==slices-1) isLast=1;
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {
      if(v%2==0)
      {
        sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+2] = cos0/10;
        sphVerts[j+3] = 1.0;

        sphVerts[j+4] = sin0 * Math.cos(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+5] = sin0 * Math.sin(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+6] = cos0/10;

      }
      else {
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+2] = cos1/10;
        sphVerts[j+3] = 1.0;

        sphVerts[j+4] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+5] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+6] = cos1/10;
      }
    }
  }
}
var g_last = Date.now();
function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  if(angle >   320 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  if(angle <  0.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle%360;
}
function myMouseDown(ev, gl, canvas) {

  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = canvas.height - (ev.clientY - rect.top);
  var x = (xp - canvas.width/2)  /
  						 (canvas.width/2);
	var y = (yp - canvas.height/2) /
							 (canvas.height/2);
	isDrag = true;
  isClick = true;
	xMclik = x;
	yMclik = y;
}


function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

	if(isDrag == false) return ;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);
	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
  isClick = false;
  lamp1.I_pos.elements.set([
					lightx + 4.0*(x-xMclik),
					lighty + 4.0*(y-yMclik),	// Horiz drag: change world Y
					lamp1.I_pos.elements[2] 	// Vert. drag: change world Z
											]);
  draw(gl, currentAngle, canvas);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
}

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);

	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
  isClick = false;

}
function myKeyDown(ev) {

}


function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

}

function myKeyPress(ev) {

}
