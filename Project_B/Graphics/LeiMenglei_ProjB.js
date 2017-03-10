// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +   //surface normal vector
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +   //transformation matrix of the normal vector

  'uniform vec3 u_LightColor;\n' +     //light color
  'uniform vec3 u_LightDirection;\n' + //position of the light source
  'uniform vec3 u_AmbientLight;\n' +   //ambient light color
  'varying vec4 v_Color;\n' +

  'void main() {\n' +
  //normalize the normal because it is interpolated and is not 1.0 in length anymore
  '  vec3 normal = normalize(vec3(u_NormalMatrix*a_Normal));\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  //the dot product of the light direction and the normal
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  //calculate the final color from diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +

  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var floatsPerVertex = 10;	 //vertices

var MOVE_STEP = 0.15; // to move the camera
var LOOK_STEP = 0.02; // to move the camera
var PHI_NOW = 0;
var THETA_NOW = 0;
var LAST_UPDATE = -1;// to move the camera
var LAST_UPDATE2= 0; // to move the camera
var currentAngle=0.0;// angle for rotating

var ANGLE_STEP = 2.0; // default rotation angle rate (deg/sec)
var canvas;
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var vleft = 0;
var vright = 0;
var vbottom = 0;
var vtop = 0;
var vnear = 0;
var vfar = 0;
var change = false;
var sca_h = 1;
var sca_v = 1;
var o_near = 1, o_far = 1;
// Global vars for mouse click-and-drag for rotation.
var isDrag=false;   // mouse-drag: true when user holds down mouse button
var xMclik=0.0;     // last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;
var boatxlim = 0;
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1); // 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();     // rotation matrix, made from latest qTot
var g_EyeX = 0.50, g_EyeY = 11, g_EyeZ = 0.55;
var g_LookAtX = 0.0, g_LookAtY = 0.0, g_LookAtZ = 0.0;
var isFly = false;
function main() {
//==============================================================================
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  resize();
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Enable 3D depth-test when drawing: don't over-draw at any pixel
	gl.enable(gl.DEPTH_TEST);

  // Initialize a Vertex Buffer in the graphics system to hold our vertices
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  // var lightDirection = new Vector3([0.5, 0.2, 0.0]);
  var lightDirection = new Vector3([0, 1, 0]);
  //world coordinate system
  //set the light color --> (1.0, 1.0, 1.0)
  gl.uniform3f(u_LightColor, 1, 1, 1);
  //set the ambient light color --> (0.5, 0.6, 0.6)
  gl.uniform3f(u_AmbientLight, 0.5, 0.6, 0.6);


  lightDirection.normalize();

  gl.uniform3fv(u_LightDirection,lightDirection.elements);

  if (!u_ViewMatrix || !u_ProjMatrix) {
    console.log('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }

    canvas.onmousedown = function(ev){myMouseDown( ev, gl, canvas) };
    // when user's mouse button goes down, call mouseDown() function
    canvas.onmousemove = function(ev){myMouseMove( ev, gl, canvas) };
    // when the mouse moves, call mouseMove() function
    canvas.onmouseup = function(ev){myMouseUp(   ev, gl, canvas)};
    window.addEventListener("keydown", myKeyDown, false);
    window.addEventListener("keyup", myKeyUp, false);
    window.addEventListener("keypress", myKeyPress, false);
    // var g_EyeX = 0.50, g_EyeY = 7, g_EyeZ = 0.55;
    // var g_LookAtX = 0.0, g_LookAtY = 0.0, g_LookAtZ = 0.0;
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
        case 72:
        window.open('../lib/userinstruction.html', width = 300);
        break;
        case 70://f fly
        isFly = true;
        break;
        // case 49://1
        //   sca_h *= 1.01;
        //   break;
        // case 50://2
        //   sca_h /= 1.2;
        //   break;
        // case 51://3
        //   sca_v *= 1.01;
        //   break;
        // case 52://4
        //   sca_v /= 1.2;
        //   break;
        // case 53://5
        //   o_near *= 1.1;
        //   break;
        // case 54://6
        //   o_near /= 2;
        //   break;
          case 49://1
            vleft -= 0.3;
            break;
          case 50://2
            vright += 0.3;
            break;
          case 51://3
            vbottom -= 0.5;
            break;
          case 52://4
            vtop += 0.5;
            break;
          case 53://5
            vnear += 0.3;
            break;
          case 54://6
            vfar -= 5;
            break;
        case 81:
          if(change) change = false;
          else change = true;
        break;
        default:
        break;
        }
      }, false);


  //var projMatrix = new Matrix4();
  //var modelMatrix = new Matrix4();
  var normalMatrix = new Matrix4();

  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0;

  // ANIMATION: create 'tick' variable whose value is this function:
  var tick = function() {
    swipeangle = swipe(swipeangle);
    if(isFly) fly();
    currentAngle = animate(currentAngle); // Update the rotation angle
    initVertexBuffers(gl);
    draw(gl, currentAngle, u_ViewMatrix,u_ProjMatrix, viewMatrix, u_NormalMatrix, normalMatrix);   // Draw the triangles
    requestAnimationFrame(tick, canvas);
                       // Request that the browser re-draw the webpage
                      // (causes webpage to endlessly re-draw itself)
  };
  tick();             // start (and continue) animation: draw current image
}

function fly(){
  g_LookAtY -= 0.05;
  g_EyeY -= 0.05;
}

function initVertexBuffers(gl) {

  // Make 'ground plane';
  makeGroundGrid();
  makeself();
  makeSphere();
  //space to store all the shapes
	mySiz = gndVerts.length + ziji.length + sphVerts.length;

  //vertices total
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

	// Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	gndStart = 0;						// next store the ground-plane;
	for(j = 0, i = 0; j< gndVerts.length; i++, j++) {
		verticesColors[i] = gndVerts[j];
		}
  zijistart = i;
  for(j = 0; j< ziji.length; i++, j++) {
		verticesColors[i] = ziji[j];
		}
  sphStart = i;
  for(j = 0; j< ziji.length; i++, j++) {
		verticesColors[i] = sphVerts[j];
		}


  // Create a vertex buffer object (VBO)
  var vertexColorbuffer = gl.createBuffer();
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // Use handle to specify how to retrieve position data from VBO
  gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 10, 0);
  gl.enableVertexAttribArray(a_Position);

  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
   // Use handle to specify how to retrieve color data from VBO:
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 10, FSIZE * 4);
  gl.enableVertexAttribArray(a_Color);

  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 10, FSIZE * 7);
  gl.enableVertexAttribArray(a_Normal);
  return mySiz/floatsPerVertex;	// return # of vertices
}






function draw(gl, currentAngle, u_ViewMatrix,u_ProjMatrix, viewMatrix, u_NormalMatrix, normalMatrix) {
  //==============================================================================

  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0,	canvas.width/2,canvas.height);
  projMatrix.setPerspective(40, (0.5 * canvas.width) / canvas.height, 1, 100);

  // Draw in the SECOND of several 'viewports'
  //------------------------------------------
  // but use a different 'view' matrix:
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ,g_LookAtX, g_LookAtY, g_LookAtZ, 0, 0, 1);
  // Pass the view projection matrix to our shaders:
  if(change){

    // viewMatrix.setTranslate(0,0,-6);
    // viewMatrix.scale(0.2, 0.2, 0.2);
    // viewMatrix.rotate(currentAngle, 0, 1, 0);
    // viewMatrix.scale(1,1,-1);
    // viewMatrix.scale(0.7, 0.7, 0.7);
    // viewMatrix.translate( 1,1,0);
    // viewMatrix.rotate(currentAngle, 0, 0,1);
    // viewMatrix.scale(0.25, 0.25, 0.25);
    // viewMatrix.rotate(currentAngle, 1, 0, 0);
    // viewMatrix.translate( 0, 0, 8);
    // viewMatrix.translate( 2, 2, 2);
    // viewMatrix.scale(3, 3, 3);
    // viewMatrix.translate( 0, 0, 2.5);
    // viewMatrix.rotate(currentAngle * 2, 0, 0, 1);
    viewMatrix.translate(0.0, -5, 5.0);
    viewMatrix.rotate(-90,1,0,0);
    viewMatrix.rotate(currentAngle, 0, 1, 0);

    // viewMatrix.rotate(90, 0, 1, 0);

    //viewMatrix.setInverseOf(modelMatrix);

    viewMatrix.setIdentity();
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // Draw the scene:
  drawMyScene(gl, currentAngle,u_ViewMatrix,u_ProjMatrix,viewMatrix, u_NormalMatrix, normalMatrix);


  //the other one
  gl.viewport(canvas.width/2, 0, canvas.width/2,canvas.height);
  // projMatrix.setOrtho(vleft, vright, vbottom, vtop, vnear, vfar);
  projMatrix.setOrtho(-0.5*canvas.width/300 + vleft, 0.5*canvas.width/300 + vright,          // left,right;
                      -canvas.height/400 + vbottom, canvas.height/400 + vtop,          // bottom, top;
                      1 + vnear, 100 + vfar);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ,  0, 0, 1);
  // Pass the view projection matrix to our shaders:
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  // Draw the scene:
  drawMyScene(gl, currentAngle,u_ViewMatrix,u_ProjMatrix,viewMatrix, u_NormalMatrix, normalMatrix);}

function drawMyScene(gl, currentAngle,u_ViewMatrix,u_ProjMatrix, viewMatrix, u_NormalMatrix, normalMatrix) {
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
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
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  pushMatrix(viewMatrix);
  //rodder
  viewMatrix = popMatrix();
  viewMatrix.translate(0.0, -5.0, 2.3);
  viewMatrix.rotate(90, 1, 0, 0);
  if(!isDrag) viewMatrix.rotate(currentAngle,0,1,0);
  else viewMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.1, 0.8, 0.1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex,	36);

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
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 36,	36);

  //flag
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
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 72,	3);

  //cube
  viewMatrix = popMatrix();
  viewMatrix.translate(1.5, -10.5, 0);
  viewMatrix.rotate(180,0,1,0);
  viewMatrix.rotate(-90,1,0,0);
  viewMatrix.rotate(currentAngle * 2, 0, 1, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 0.8, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 75,	36);


  //sphere
  // viewMatrix.setTranslate(-1.5, -10.5, 0);
  // viewMatrix.rotate(1,currentAngle,0,1);
  // //modelMatrix.translate(0.1,0.1,0);
  // viewMatrix.scale(4.5,4.5,4.5);
  // viewMatrix.rotate(90, 1, 0, 0);
  // //modelMatrix.rotate(currentAngle*3,1,1,1)
  // //draw3Dview(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, u_ColorMod, canvas);
  // //gl.uniform4f(u_ColorMod, 0, 0, 0, 1);
  // gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
  //               sphStart/floatsPerVertex, // start at this vertex number, and
  //               sphVerts.length/floatsPerVertex);




  //stars
  viewMatrix = popMatrix();
  viewMatrix.translate(0.21, -5, 1);
  viewMatrix.rotate(90, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 1, 0, 0);
  viewMatrix.translate(0, 0, 3);
  viewMatrix.rotate(currentAngle * 7, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.4, 0.4, 0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, zijistart/floatsPerVertex + 111, 10);
  gl.drawArrays(gl.LINE_LOOP, zijistart/floatsPerVertex + 121, 10);
  gl.drawArrays(gl.TRIANGLE_STRIP, zijistart/floatsPerVertex + 131, 22);

  //Rectangular
  viewMatrix = popMatrix();
  viewMatrix.translate(0.15, -5.0, 1.0);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(currentAngle, 0, 0, 1);
  viewMatrix.translate(0, -2.2, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();

  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.3, 0.8, 0.3);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex,	36);


  //TRIANGLES
  //1
  viewMatrix = popMatrix();
  viewMatrix.translate(-2.15, -10.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count = 0;
  while(count < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  	viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count ++;
  }
  //2
  viewMatrix = popMatrix();
  viewMatrix.translate(2.15, -10.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count2 = 0;
  while(count2 < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  	viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count2 ++;
  }

  //1
  viewMatrix = popMatrix();
  viewMatrix.translate(-2.35, -5.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count3 = 0;
  while(count3 < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  	viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count3 ++;
  }
  //1
  viewMatrix = popMatrix();
  viewMatrix.translate(2.35, -5.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
	viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count4 = 0;
  while(count4 < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  	viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count4 ++;
  }

  viewMatrix = popMatrix();
  viewMatrix.translate(-2.55, -2.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count5 = 0;
  while(count5 < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count5 ++;
  }
  //1
  viewMatrix = popMatrix();
  viewMatrix.translate(2.55, -2.0, 0.5);
  viewMatrix.rotate(90, 0, 0, 1);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.rotate(currentAngle * -1, 0, 0, 1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(0.2, 0.2, 0.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  viewMatrix.translate(1, 1, 0);
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1, 1, 1);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
  var count6 = 0;
  while(count6 < 10){
    viewMatrix.translate(1, 1, 0);
    viewMatrix.rotate(swipeangle, 0, 1, 0);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    viewMatrix.scale(1, 1, 1);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 153, 12);
    count6 ++;
  }


  //next object:

  viewMatrix = popMatrix();
  viewMatrix.translate(5.0, 5.0, 0);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(currentAngle,0,1,0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(0.4, 0.8, 0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

//multiple joints

  viewMatrix = popMatrix();
  viewMatrix.translate(5.0, 5.0, 1.5);
  viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(swipeangle, 1, 0, 0);
  if(!isDrag) viewMatrix.rotate(currentAngle,0,1,0);
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(0.4, 0.8, 0.4);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 1, 0, 0);
  viewMatrix.translate(0, 0, 0.7);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 0, 1, 0);
  viewMatrix.translate(0, 0, 0.7);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 0, 0, 1);
  viewMatrix.translate(0, 0.7, 0.7);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 1, 1, 0);
  viewMatrix.translate(0, 0.7, 0);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 1, 0, 1);
  viewMatrix.translate(0.7, 0.7, 0);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  if(!isDrag){
  viewMatrix.rotate(swipeangle, 1, 1, 1);
  viewMatrix.translate(0, 0.7, 0.7);
  }
  else{
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
    viewMatrix.concat(quatMatrix);
  }
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,	zijistart/floatsPerVertex + 165,	96);

  //axis
  viewMatrix = popMatrix();
  viewMatrix.translate(0.0, -5.0, 3.1);
  //viewMatrix.rotate(90, 1, 0, 0);
  viewMatrix.rotate(currentAngle,0,0,1);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1.5, 1.5, 1.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.LINES,	zijistart/floatsPerVertex + 261,	6);

  viewMatrix = popMatrix();
  viewMatrix.translate(-4.0, -5.0, 0);
  //viewMatrix.rotate(90, 1, 0, 0);
  normalMatrix.setInverseOf(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  viewMatrix.scale(1.5, 1.5, 1.5);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.drawArrays(gl.LINES,	zijistart/floatsPerVertex + 261,	6);

}
var g_last = Date.now();

function animate(angle) {
  angle += ANGLE_STEP;
  return angle % 360;
}
var swipeangle = 0;
var swipe_step = 1;
var temp = 1;
function swipe(angle){

    swipeangle += swipe_step * temp;
    if(swipeangle > 40){
      temp = -1;
    }
    if(swipeangle < -40){
      temp = 1;
    }
    return swipeangle;
}

function makeself(){
  var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
  var a = Math.sqrt(0.5);
  var a1=a/2;
  ziji = new Float32Array([
    0.3, 1.0, 0.3, 1.0,    0.28, 0.53, 0.92, 1, 0, 0,
    0.3, 1.0, -0.3, 1.0,   0.28, 0.53, 0.92, 1, 0, 0,
    -0.3, 1.0, -0.3, 1.0,   0.28, 0.53, 0.92, 1, 0, 0,

    0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71, 1, 0, 0,
    -0.3, 1.0, 0.3, 1.0,   0.07, 0.32, 0.71, 1, 0, 0,
    -0.3, 1.0, -0.3, 1.0,   0.07, 0.32, 0.71, 1, 0, 0,

    0.3, 1.0, -0.3, 1.0,    0.07, 0.32, 0.71, 0, 1, 0,                //face 2.(T1)
    0.3, 1.0, 0.3, 1.0,   0.07, 0.32, 0.71, 0, 1, 0,
    0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,0, 1, 0,

    0.3, 1.0, -0.3, 1.0,     0.28, 0.53, 0.92,0, 1, 0,                  //T2
    0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,0, 1, 0,
    0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,0, 1, 0,


    -0.3, 1.0, 0.3, 1.0,     0.28, 0.53, 0.92, 0, 0, 1,   //face 3.(T1)
    0.3, 1.0, 0.3, 1.0,    0.28, 0.53, 0.92,0, 0, 1,
    0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,0, 0, 1,

    -0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71,0, 0, 1,    //T2
    -0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,0, 0, 1,
    0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,0, 0, 1,


    -0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71,-1, 0, 0,    //face 4.(T1)
    -0.3, 1.0, -0.3, 1.0,   0.07, 0.32, 0.71,-1, 0, 0,
    -0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,-1, 0, 0,

    -0.3, 1.0, 0.3, 1.0,     0.28, 0.53, 0.92, -1, 0, 0,   //T2
    -0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,-1, 0, 0,
    -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,-1, 0, 0,


    0.3, 1.0, -0.3, 1.0,     0.28, 0.53, 0.92, 0, -1, 0,                 //face 5.(T1)
    -0.3, 1.0, -0.3, 1.0,    0.28, 0.53, 0.92,0, -1, 0,
    -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,0, -1, 0,

    0.3, 1.0, -0.3, 1.0,    0.07, 0.32, 0.71,  0, -1, 0,                //T2
    0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,0, -1, 0,
    -0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,0, -1, 0,


    -0.3, -1.0, -0.3, 1.0,    0.07, 0.32, 0.71, 0, 0, -1,                //face 6.(T1)
    -0.3, -1.0, 0.3, 1.0,  0.07, 0.32, 0.71,0, 0, -1,
    0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,0, 0, -1,

    -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,0, 0, -1,                //T2
    0.3, -1.0, -0.3, 1.0,   0.28, 0.53, 0.92,0, 0, -1,
    0.3, -1.0, 0.3, 1.0,   0.28, 0.53, 0.92,0, 0, -1,        //36


    //boat
    1.0, 1.0, 1.0, 1.0,     0 - boatxlim, 0.41, 0.0117, 0, 1, 0, //0
    -1.0, 1.0, 1.0, 1.0,     0.945, 0 - boatxlim, 0.4883, 0, 1, 0, //1
    -0.5, 0.2, 1.0, 1.0,     0.9336, 0.652, 0 - boatxlim, 0, 1, 0, //2

    1.0, 1.0, 1.0,1.0,      0 - boatxlim, 0.41, 0.0117, 0, 1, 0, //0
    -0.5, 0.2, 1.0,1.0,      0.945,0 - boatxlim, 0.4883, 0, 1, 0, //2
    0.5, 0.2, 1.0,1.0,     0.9336, 0.1 - boatxlim, 0 - boatxlim, 0, 1, 0, //3
    //right
    1.0, 1.0, 1.0,1.0,      0.675, 0 - boatxlim, 0.0117, 1, 0, 0,  //0
    0.5, 0.2, 1.0,1.0,      0 - boatxlim, 0.3867, 0.4883, 1, 0, 0, //3
    0.5, 0.2,-1.0,1.0,      0.9336, 0 - boatxlim, 0.2305, 1, 0, 0, //4

    1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.1 - boatxlim, 1, 0, 0,  //0
    0.5, 0.2,-1.0,1.0,      0.945, 0.3867, 0.4883, 0, 0, 1,  //4
    1.0, 1.0,-1.0,1.0,      0 - boatxlim, 0.652, 0.2305, 1, 0, 0,  //5
    //up
    1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.0117, 1, 0, 0, //0
    -1.0, 1.0,1.0,1.0,      0.945, 0 - boatxlim, 0.4883, 1, 0, 0, //1
    -1.0, 1.0,-1.0,1.0,     0.9336, 0.652, 0.2305, 1, 0, 0, //6

    1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.0117, 0, 0, 1, //0
    -1.0, 1.0,-1.0,1.0,     0.945, 0.3867, 0.4883, 0, 0, 1, //6
    1.0, 1.0, -1.0,1.0,     0.9336, 0.1 - boatxlim, 0.2305, 0, 0, 1, //5

    //left
    -1.0, 1.0, 1.0,1.0,     0.675, 0.41, 0.1 - boatxlim, 0, 0, 1, //1
    -0.5, 0.2,1.0,1.0,      0.945, 0.3867, 0.4883, 0, 0, 1, //2
    -0.5,0.2,-1.0,1.0,      0 - boatxlim, 0.652, 0.2305, 0, 0, 1, //7

    -1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0 - boatxlim, 0, 0, 1, //1
    -0.5,0.2,-1.0,1.0,       0.1 - boatxlim, 0.3867, 0.4883, 0, 0, 1, //7
    -1.0, 1.0, -1.0,1.0,     0.9336, 0.652, 0.2305, 0, 0, 1, //6
    //down
    -0.5,0.2,1.0, 1.0,       0.675, 0 - boatxlim, 0.0117, 0, -1, 0,  //2
    0.5, 0.2,1.0, 1.0,       0 - boatxlim, 0.3867, 0.4883, 0, -1, 0,  //3
    0.5, 0.2, -1.0,1.0,      0.9336, 0.652, 0 - boatxlim, 0, -1, 0,  //4

    -0.5,0.2,1.0, 1.0,        0 - boatxlim, 0.41, 0.0117, 0, -1, 0,   //2
    0.5, 0.2, -1.0,  1.0,    0 - boatxlim, 0.3867, 0.4883, 0, -1, 0,   //4
    -0.5, 0.2, -1.0,1.0,     0.9336, 0 - boatxlim, 0.2305, 0, -1, 0,   //7

    //back
    0.5, 0.2,-1.0,  1.0,     0.675, 0.41, 0 - boatxlim, -1, 0, 0,      //4
    1.0,1.0,-1.0,1.0,       0.926, 0 - boatxlim, 0.0078, -1, 0, 0,      //5
    -1.0, 1.0,-1.0, 1.0,    0 - boatxlim, 0.652, 0.2305, -1, 0, 0,      //6

     0.5, 0.2,-1.0, 1.0,      0 - boatxlim, 0.41, 0.0117, -1, 0, 0,    //4
     -1.0, 1.0,-1.0, 1.0,     0.926, 0 - boatxlim, 0.0078, -1, 0, 0,    //6
     -0.5, 0.2,-1.0,1.0,      0.9336, 0.652, 0.2305, -1, 0, 0,    //7
     //72

     //next object : flag

     0, 0.5, 0, 1.0,             0.9453, 0.0273, 0.1641, 0, 1, 0,
     -0.5, -0.5, 0, 1.0,         0.675, 0.41, 0.0117,0, 1, 0,
     0.5, -0.5, 0, 1.0,          0.926, 0.5586, 0.0078,0, 1, 0,
     //75

     //next object : cube
     0,1,1, 1,  1,0,0,  0,1,0,
     1,1,1, 1,  1,0,0,  0,1,0,
     0,1,0, 1,  1,0,0,  0,1,0,

     1,1,1, 1,  1,0,0,  0,1,0,
     0,1,0, 1,  1,0,0,  0,1,0,
     1,1,0, 1,  1,0,0,  0,1,0,//FRONT

     1,1,0, 1,  1,0,0,  1,0,0,
     1,1,1, 1,  1,0,0,  1,0,0,
     1,0,0, 1,  1,0,0,  1,0,0,

     1,1,1, 1,  1,0,0,  1,0,0,
     1,0,0, 1,  1,0,0,  1,0,0,
     1,0,1, 1,  1,0,0,  1,0,0,//Right

     1,1,0, 1,  1,0,0,  0,0,-1,
     0,1,0, 1,  1,0,0,  0,0,-1,
     1,0,0, 1,  1,0,0,  0,0,-1,

     0,1,0, 1,  1,0,0,  0,0,-1,
     1,0,0, 1,  1,0,0,  0,0,-1,
     0,0,0, 1,  1,0,0,  0,0,-1,//Down

     0,1,0, 1,  1,0,0,  -1,0,0,
     0,1,1, 1,  1,0,0,  -1,0,0,
     0,0,0, 1,  1,0,0,  -1,0,0,

     0,1,1, 1,  1,0,0,  -1,0,0,
     0,0,0, 1,  1,0,0,  -1,0,0,
     0,0,1, 1,  1,0,0,  -1,0,0,//left

     0,1,1, 1,  1,0,0,   0,0,1,
     1,1,1, 1,  1,0,0,   0,0,1,
     1,0,1, 1,  1,0,0,   0,0,1,

     0,1,1, 1,  1,0,0,   0,0,1,
     1,0,1, 1,  1,0,0,   0,0,1,
     0,0,1, 1,  1,0,0,   0,0,1,//top

     0,0,1, 1,  1,0,0,   0,-1,0,
     1,0,1, 1,  1,0,0,   0,-1,0,
     0,0,0, 1,  1,0,0,   0,-1,0,

     0,0,0, 1,  1,0,0,   0,-1,0,
     1,0,1, 1,  1,0,0,   0,-1,0,
     1,0,0, 1,  1,0,0,   0,-1,0,//back

     //111

     //next object : stars

     +0.0, +1.0, +1.0, +1.0, +0.4, +0.1, +0.3, 1, 0, 0,
     +0.4, +0.0, +1.0, +1.0, +0.1, +0.2, +0.6, 1, 0, 0,
     +1.5, +0.0, +1.0, +1.0, +0.265, +0.86, +0.432,1, 0, 0,
     +0.8, -0.8, +1.0, +1.0, +0.312, +0.754, +0.5,1, 0, 0,
     +1.0, -1.8, +1.0, +1.0, +0.523, +0.64, +0.4,1, 0, 0,
     +0.0, -1.0, +1.0, +1.0, +0.1, +0.23, +0.543,1, 0, 0,
     -1.0, -1.8, +1.0, +1.0, +0.1, +0.3, +0.56,1, 0, 0,
     -0.8, -0.8, +1.0, +1.0, +0.75, +0.2, +0.58,1, 0, 0,
     -1.5, +0.0, +1.0, +1.0, +0.34, +0.1, +0.12,1, 0, 0,
     -0.4, +0.0, +1.0, +1.0, +0.32, +0.0, +0.543,1, 0, 0,
//121
     +0.0, +1.0, -1.0, +1.0, +0.364, +0.9456, +0.834,-1, 0, 0,
     +0.4, +0.0, -1.0, +1.0, +0.934, +0.8654, +0.73,-1, 0, 0,
     +1.5, +0.0, -1.0, +1.0, +0.83, +0.72, +0.613,-1, 0, 0,
     +0.8, -0.8, -1.0, +1.0, +0.534, +0.123, +0.5321,-1, 0, 0,
     +1.0, -1.8, -1.0, +1.0, +0.13, +0.543, +0.789,-1, 0, 0,
     +0.0, -1.0, -1.0, +1.0, +0.85, +0.234, +0.364,-1, 0, 0,
     -1.0, -1.8, -1.0, +1.0, +0.344, +0.8763, +0.122,-1, 0, 0,
     -0.8, -0.8, -1.0, +1.0, +0.396, +0.265, +0.541,-1, 0, 0,
     -1.5, +0.0, -1.0, +1.0, +0.24, +0.241, +0.5340,-1, 0, 0,
     -0.4, +0.0, -1.0, +1.0, +0.198, +0.120, +0.420,-1, 0, 0,
//131
     +0.0, +1.0, +1.0, +1.0, +0.1230, +0.65460, +0.530,0, -1, 0,
     +0.0, +1.0, -1.0, +1.0, +0.9789, +0.12349, +0.73670,0, -1, 0,
     +0.4, +0.0, +1.0, +1.0, +0.158, +0.6421, +0.1641,0, -1, 0,
     +0.4, +0.0, -1.0, +1.0, +0.158, +0.34678, +0.4641,0, -1, 0,
     +1.5, +0.0, +1.0, +1.0, +0.158, +0.51678, +0.641,0, -1, 0,
     +1.5, +0.0, -1.0, +1.0, +0.158, +0.1678, +0.86741,0, -1, 0,
     +0.8, -0.8, +1.0, +1.0, +0.158, +0.9678, +0.5641,0, -1, 0,
     +0.8, -0.8, -1.0, +1.0, +0.158, +0.1678, +0.7641,0, -1, 0,
     +1.0, -1.8, +1.0, +1.0, +0.158, +0.3678, +0.9641,0, -1, 0,
     +1.0, -1.8, -1.0, +1.0, +0.158, +0.5678, +0.4641,0, -1, 0,
//141
     +0.0, -1.0, +1.0, +1.0, +0.198, +0.9120, +0.1420,0,1,0,
     +0.0, -1.0, -1.0, +1.0, +0.198, +0.6120, +0.24420,0,1,0,
     -1.0, -1.8, +1.0, +1.0, +0.198, +0.2120, +0.3420,0,1,0,
     -1.0, -1.8, -1.0, +1.0, +0.198, +0.9120, +0.7420,0,1,0,
     -0.8, -0.8, +1.0, +1.0, +0.198, +0.2120, +0.2420,0,1,0,
     -0.8, -0.8, -1.0, +1.0, +0.198, +0.5120, +0.7420,0,1,0,
     -1.5, +0.0, +1.0, +1.0, +0.198, +0.1120, +0.5420,0,1,0,
     -1.5, +0.0, -1.0, +1.0, +0.198, +0.8120, +0.7420,0,1,0,
     -0.4, +0.0, +1.0, +1.0, +0.198, +0.9120, +0.2420,0,1,0,
     -0.4, +0.0, -1.0, +1.0, +0.198, +0.2120, +0.2420,0,1,0,
     +0.0, +1.0, +1.0, +1.0, +0.198, +0.1120, +0.420,0,1,0,
     +0.0, +1.0, -1.0, +1.0, +0.198, +0.120, +0.4420,0,1,0,
     //153

     0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	0, 1, 0,// Node 0
     c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 0, 1, 0,	// Node 1
     0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	0, 1, 0,// Node 2
     // Face 1: (right side)
    0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	1, 0, 0,// Node 0
     0.0,  1.0, 0.0, 1.0,  		1.0,  0.0,  0.0,	1, 0, 0,// Node 2
    -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	1, 0, 0,// Node 3
     // Face 2: (lower side)
    0.0,	 0.0, sq2, 1.0,			1.0, 	1.0,	1.0,	0, 1, 0,// Node 0
    -c30, -0.5, 0.0, 1.0, 		0.0,  1.0,  0.0, 	0, 1, 0,// Node 3
     c30, -0.5, 0.0, 1.0, 		0.0,  0.0,  1.0, 	0, 1, 0,// Node 1
       // Face 3: (base side)
    -c30, -0.5, -0.2, 1.0, 		0.0,  1.0,  0.0, 	0, 1, 0,// Node 3
     0.0,  1.0, -0.2, 1.0,  	1.0,  0.0,  0.0,	0, 1, 0,// Node 2
     c30, -0.5, -0.2, 1.0, 		0.0,  0.0,  1.0, 	0, 1, 0,// Node 1
     //165

     //cylinder
     0.0,  0.0,  0.0,  1,    0.8, 0.1, 0.1,   0.0, 1.0, 0.0,
     0.5,  0.0,  0.0,  1,    0.8, 0.1, 0.2,   0.0, 1.0, 0.0,
      a1,  0.0,  -a1,  1,    0.8, 0.1, 0.3,   0.0, 1.0, 0.0,//1

     0.0,  0.0,  0.0,  1,    0.7, 0.1, 0.4,   0.0, 1.0, 0.0,
      a1,  0.0,  -a1,  1,    0.7, 0.1, 0.5,   0.0, 1.0, 0.0,
     0.0,  0.0, -0.5,  1,    0.7, 0.1, 0.6,   0.0, 1.0, 0.0,//2

     0.0,  0.0,  0.0,  1,    0.6, 0.1, 0.7,   0.0, 1.0, 0.0,
     0.0,  0.0, -0.5,  1,    0.6, 0.1, 0.8,   0.0, 1.0, 0.0,
     -a1,  0.0,  -a1,  1,    0.6, 0.1, 0.9,   0.0, 1.0, 0.0,//3

     0.0,  0.0,  0.0,  1,    0.5, 0.1, 1.0,   0.0, 1.0, 0.0,
     -a1,  0.0,  -a1,  1,    0.5, 0.1, 0.9,   0.0, 1.0, 0.0,
    -0.5,  0.0,  0.0,  1,    0.5, 0.1, 0.8,   0.0, 1.0, 0.0,//4

     0.0,  0.0,  0.0,  1,    0.4, 0.1, 0.7,   0.0, 1.0, 0.0,
    -0.5,  0.0,  0.0,  1,    0.4, 0.1, 0.6,   0.0, 1.0, 0.0,
     -a1,  0.0,   a1,  1,    0.4, 0.1, 0.5,   0.0, 1.0, 0.0,//5

     0.0,  0.0,  0.0,  1,    0.4, 0.1, 0.4,   0.0, 1.0, 0.0,
     -a1,  0.0,   a1,  1,    0.4, 0.1, 0.3,   0.0, 1.0, 0.0,
     0.0,  0.0,  0.5,  1,    0.4, 0.1, 0.2,   0.0, 1.0, 0.0,//6

     0.0,  0.0,  0.0,  1,    0.3, 0.1, 0.1,   0.0, 1.0, 0.0,
     0.0,  0.0,  0.5,  1,    0.3, 0.1, 0.2,   0.0, 1.0, 0.0,
      a1,  0.0,   a1,  1,    0.3, 0.1, 0.3,   0.0, 1.0, 0.0,//7

     0.0,  0.0,  0.0,  1,    0.2, 0.1, 0.4,   0.0, 1.0, 0.0,
      a1,  0.0,   a1,  1,    0.2, 0.1, 0.5,   0.0, 1.0, 0.0,
     0.5,  0.0,  0.0,  1,    0.2, 0.1, 0.6,   0.0, 1.0, 0.0,//8 //24

     0.0,  2.0,  0.0,  1,    0.1, 0.2, 0.7,   0.0, 1.0, 0.0,
     0.5,  2.0,  0.0,  1,    0.1, 0.2, 0.8,   0.0, 1.0, 0.0,
      a1,  2.0,  -a1,  1,    0.1, 0.2, 0.9,   0.0, 1.0, 0.0,//1

     0.0,  2.0,  0.0,  1,    0.2, 0.5, 0.8,   0.0, 1.0, 0.0,
      a1,  2.0,  -a1,  1,    0.2, 0.5, 0.7,   0.0, 1.0, 0.0,
     0.0,  2.0, -0.5,  1,    0.2, 0.5, 0.6,   0.0, 1.0, 0.0,//2

     0.0,  2.0,  0.0,  1,    0.8, 0.6, 0.5,   0.0, 1.0, 0.0,
     0.0,  2.0, -0.5,  1,    0.8, 0.6, 0.5,   0.0, 1.0, 0.0,
     -a1,  2.0,  -a1,  1,    0.8, 0.6, 0.5,   0.0, 1.0, 0.0,//3

     0.0,  2.0,  0.0,  1,    0.8, 0.9, 0.4,   0.0, 1.0, 0.0,
     -a1,  2.0,  -a1,  1,    0.8, 0.9, 0.3,   0.0, 1.0, 0.0,
    -0.5,  2.0,  0.0,  1,    0.8, 0.9, 0.2,   0.0, 1.0, 0.0,//4

     0.0,  2.0,  0.0,  1,    0.8, 0.1, 0.2,   0.0, 1.0, 0.0,
    -0.5,  2.0,  0.0,  1,    0.8, 0.1, 0.2,   0.0, 1.0, 0.0,
     -a1,  2.0,   a1,  1,    0.8, 0.1, 0.2,   0.0, 1.0, 0.0,//5

     0.0,  2.0,  0.0,  1,    0.2, 0.3 ,0.0,   0.0, 1.0, 0.0,
     -a1,  2.0,   a1,  1,    0.2, 0.3 ,0.0,   0.0, 1.0, 0.0,
     0.0,  2.0,  0.5,  1,    0.2, 0.3, 0.0,   0.0, 1.0, 0.0,//6

     0.0,  2.0,  0.0,  1,    0.8, 0.4, 0.0,   0.0, 1.0, 0.0,
     0.0,  2.0,  0.5,  1,    0.8, 0.4, 0.0,   0.0, 1.0, 0.0,
      a1,  2.0,   a1,  1,    0.8, 0.4, 0.0,   0.0, 1.0, 0.0,//7

     0.0,  2.0,  0.0,  1,    0.8, 0.5, 0.0,   0.0, 1.0, 0.0,
      a1,  2.0,   a1,  1,    0.8, 0.5, 0.0,   0.0, 1.0, 0.0,
     0.5,  2.0,  0.0,  1,    0.8, 0.5, 0.0,   0.0, 1.0, 0.0,//8 //48

     0.5,  0.0,  0.0,  1,    0.8, 0.7, 0.0,   0.0, 0.0, 1.0,
      a1,  0.0,  -a1,  1,    0.8, 0.7, 0.0,   0.0, 0.0, 1.0,
     0.5,  2.0,  0.0,  1,    0.8, 0.7, 0.0,   0.0, 0.0, 1.0,//middle//1

     0.5,  2.0,  0.0,  1,    0.8, 0.8, 0.0,   0.0, 0.0, 1.0,
      a1,  2.0,  -a1,  1,    0.8, 0.8, 0.0,   0.0, 0.0, 1.0,
      a1,  0.0,  -a1,  1,    0.8, 0.8, 0.0,   0.0, 0.0, 1.0,//1

      a1,  0.0,  -a1,  1,    0.8, 0.9 ,0.0,   0.0, 0.0, 1.0,
     0.0,  0.0, -0.5,  1,    0.8, 0.9 ,0.0,   0.0, 0.0, 1.0,
      a1,  2.0,  -a1,  1,    0.8, 0.9 ,0.0,   0.0, 0.0, 1.0,

      a1,  2.0,  -a1,  1,    0.7, 0.1 ,0.0,   0.0, 0.0, 1.0,
     0.0,  2.0, -0.5,  1,    0.7, 0.1, 0.0,   0.0, 0.0, 1.0,
     0.0,  0.0, -0.5,  1,    0.7, 0.1, 0.0,   0.0, 0.0, 1.0, //2

     0.0,  0.0, -0.5,  1,    0.6, 0.1, 0.0,   0.0, 0.0, 1.0,
     -a1,  0.0,  -a1,  1,    0.6, 0.1, 0.0,   0.0, 0.0, 1.0,
     0.0,  2.0, -0.5,  1,    0.6, 0.1, 0.0,   0.0, 0.0, 1.0,

     0.0,  2.0, -0.5,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,
     -a1,  2.0,  -a1,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,
     -a1,  0.0,  -a1,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,//3

     -a1,  2.0,  -a1,  1,    0.4, 0.1, 0.0,   0.0, 0.0, 1.0,
    -0.5,  2.0,  0.0,  1,    0.4, 0.1, 0.0,   0.0, 0.0, 1.0,
    -0.5,  0.0,  0.0,  1,    0.4, 0.1, 0.0,   0.0, 0.0, 1.0,

     -a1,  0.0,  -a1,  1,    0.8, 0.1, 0.0,   0.0, 0.0, 1.0,
    -0.5,  0.0,  0.0,  1,    0.8, 0.1, 0.0,   0.0, 0.0, 1.0,
     -a1,  2.0,  -a1,  1,    0.8, 0.1, 0.0,   0.0, 0.0, 1.0,//4

    -0.5,  0.0,  0.0,  1,    0.8, 0.1, 0.2,   0.0, 0.0, 1.0,
     -a1,  0.0,   a1,  1,    0.8, 0.1, 0.2,   0.0, 0.0, 1.0,
    -0.5,  2.0,  0.0,  1,    0.8, 0.1, 0.2,   0.0, 0.0, 1.0,

    -0.5,  2.0,  0.0,  1,    0.8, 0.1, 0.3,   0.0, 0.0, 1.0,
     -a1,  2.0,   a1,  1,    0.8, 0.1, 0.3,   0.0, 0.0, 1.0,
     -a1,  0.0,   a1,  1,    0.8, 0.1, 0.3,   0.0, 0.0, 1.0,//5

     -a1,  0.0,   a1,  1,    0.8, 0.1, 0.4,   0.0, 0.0, 1.0,
     0.0,  0.0,  0.5,  1,    0.8, 0.1, 0.4,   0.0, 0.0, 1.0,
     0.0,  2.0,  0.5,  1,    0.8, 0.1, 0.4,   0.0, 0.0, 1.0,

     -a1,  0.0,   a1,  1,    0.8, 0.1, 0.5,   0.0, 0.0, 1.0,
     -a1,  2.0,   a1,  1,    0.8, 0.1, 0.5,   0.0, 0.0, 1.0,
     0.0,  2.0,  0.5,  1,    0.8, 0.1, 0.5,   0.0, 0.0, 1.0,//6

     0.0,  2.0,  0.5,  1,    0.8, 0.1, 0.7,   0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,    0.8, 0.1, 0.7,   0.0, 0.0, 1.0,
     0.0,  0.0,  0.5,  1,    0.8, 0.1, 0.7,   0.0, 0.0, 1.0,

     0.0,  0.0,  0.5,  1,    0.8, 0.1, 0.9,   0.0, 0.0, 1.0,
      a1,  0.0,   a1,  1,    0.8, 0.1, 0.9,   0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,    0.8, 0.1, 0.9,   0.0, 0.0, 1.0,//7

      a1,  0.0,   a1,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,
     0.5,  0.0,  0.0,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,
      a1,  2.0,   a1,  1,    0.5, 0.1, 0.0,   0.0, 0.0, 1.0,

     a1,   2.0,   a1,  1,    0.2, 0.1, 0.0,   0.0, 0.0, 1.0,
     0.5,  2.0,  0.0,  1,    0.2, 0.1, 0.0,   0.0, 0.0, 1.0,
     0.5,  0.0,  0.0,  1,    0.2, 0.1, 0.0,   0.0, 0.0, 1.0,//8
     //165+ 96 = 261

     // x axis
       0,0,0,1,     1.0,0.0,0.0,  0,1,0,
       1,0,0,1,     1.0,0.0,0.0,  0,1,0,
     // y axis
       0,0,0,1,     0.0,1.0,0.0,  0,0,1,
       0,1,0,1,     0.0,1.0,0.0,  0,0,1,
     // z axis
       0,0,0,1,     0.0,0.0,1.0,  1,0,0,
       0,0,1,1,     0.0,0.0,1.0,  1,0,0,//6
  ]);
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

        sphVerts[j+7] = sin0 * Math.cos(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+8] = sin0 * Math.sin(Math.PI*(v)/sliceVerts)/10;
        sphVerts[j+9] = cos0/10;

      }
      else {
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+2] = cos1/10;
        sphVerts[j+3] = 1.0;

        sphVerts[j+7] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+8] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts)/10;
        sphVerts[j+9] = cos1/10;
      }
      if(s==0) {
        sphVerts[j+4]=topColr[0];
        sphVerts[j+5]=topColr[1];
        sphVerts[j+6]=topColr[2];
        }
      else if(s==slices-1) {
        sphVerts[j+4]=botColr[0];
        sphVerts[j+5]=botColr[1];
        sphVerts[j+6]=botColr[2];
      }
      else if(s%2 == 0 && s != slices-1 && s!= 0){
          sphVerts[j+4]=equColr[0];
          sphVerts[j+5]=equColr[1];
          sphVerts[j+6]=equColr[2];
      }else{
          sphVerts[j+4]=topColr[0];
          sphVerts[j+5]=topColr[1];
          sphVerts[j+6]=topColr[2];
      }
    }
  }
}




function resetQuat() {
// Called when user presses 'Reset' button on our webpage, just below the
// 'Current Quaternion' display.
  var res=5;
  qTot.clear();
  document.getElementById('QuatValue').innerHTML=
                             '\t X=' +qTot.x.toFixed(res)+
                            'i\t Y=' +qTot.y.toFixed(res)+
                            'j\t Z=' +qTot.z.toFixed(res)+
                            'k\t W=' +qTot.w.toFixed(res)+
                            '<br>length='+qTot.length().toFixed(res);
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
  dragQuat(x - xMclik, y - yMclik);
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
  dragQuat(x - xMclik, y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
}
function myKeyDown(ev) {

	}


function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as
// CTRL-C, alt-F, SHIFT-4, etc.
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);

}

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
  var rect = ev.target.getBoundingClientRect(); // get canvas corners in pixels
  var xp = ev.clientX - rect.left;                  // x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top); // y==0 at canvas bottom edge
  var x = (xp - canvas.width/2)  /    // move origin to center of canvas and
               (canvas.width/2);      // normalize canvas to -1 <= x < +1,
  var y = (yp - canvas.height/2) /    //                     -1 <= y < +1.
               (canvas.height/2);
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);

  isDrag = false;                     // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
 dragQuat(x - xMclik, y - yMclik);
}

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 100;
}
function dragQuat(xdrag, ydrag) {
//==============================================================================
// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
  var res = 5;
  var qTmp = new Quaternion(0,0,0,1);

  var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
  // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
  qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
  qTmp.multiply(qNew,qTot);     // apply new rotation to current rotation.
  qTot.copy(qTmp);
}
