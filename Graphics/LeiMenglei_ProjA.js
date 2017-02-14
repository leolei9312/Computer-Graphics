//Define VSHADER_SOURCE
var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

//Define FSHADER_SOURCE
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

//Define global Variables
var ANGLE_STEP = 45.0;
var res = 0;
var temp2 = 1;
var floatsPerVertex = 7;
var left = 1;
var right = 0;
var cloud = 0;
var backr = 0.5703;
var backg = 0.7187;
var backb = 0.953;
var xMclik = 0.0;
var yMclik = 0.0;
var xMdragTot = 0.0;
var yMdragTot = 0.0;
var isDrag = false;
var boatxlim = -0.5;
var yaxs = 0;
var xaxs = 0;
var sca = 0.02;
var ylim = -0.75;
var isClick = false;
//main functions
function main() {
  var canvas = document.getElementById('webgl');//Configurations
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  //
  var n = 0;//call initVertexBuffer
  //var n2 = initVertexBuffersphere(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  /*if (n2 < 0) {
    console.log('Failed to set the sphere vertex information');
    return;
  }*/


	gl.enable(gl.DEPTH_TEST);

  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  canvas.onmousedown = function(ev){myMouseDown(ev, gl, canvas)}; //set up mouse listener.
  canvas.onmousemove = 	function(ev){myMouseMove(ev, gl, canvas)};
  canvas.onmouseup = function(ev){myMouseUp(ev, gl, canvas)};
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);

  window.addEventListener("keydown", function(ev){
    switch(ev.keyCode) {
      case 37:
      xaxs -= 0.08;
      break;
      case 38:
      yaxs += 0.05;
      sca -= 0.01;
      break;
      case 39:
      xaxs += 0.08;
      break;
      case 40:
      yaxs -= 0.05;
      sca += 0.01;
      break;
      case 72:
      window.open('../lib/userinstruction.html', width = 300);
      break;
      default:
      break;
      }
    }, false);
window.addEventListener("resize",function(ev){
    res = 1;
    }, true);


  var modelMatrix = new Matrix4();


  var currentAngle = 0.0;
  var xdis = -1.0;
  var ydis = -1.0;


  var spherex = 0;
  var tick = function() {//repeatly call function
    n = initVertexBuffer(gl);
    currentAngle = animate(currentAngle);
    gl.clearColor(backr, backg, backb, 1.0);
    boatxlim = moveship(boatxlim);
    ylim = seamove(ylim);
    cloud = movecloud(cloud);
    if(speed != 0){spherex = movesphere(spherex);}
    draw(gl, spherex, xdis, ydis, ylim, boatxlim, n, currentAngle, modelMatrix, u_ModelMatrix);
    //drawsphere(gl, n2, currentAngle, modelMatrix, u_ModelMatrix);
    console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);
  };
  tick();

}
var c30 = Math.sqrt(0.75);
var sq2	= Math.sqrt(2.0);
//Define initVertexBuffer

//define global Variables

//define draw function
function draw(gl, spherex, xdis, ydis, ylim, boatxlim, n, currentAngle, modelMatrix, u_ModelMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draw sea
  while(ydis < ylim){
    while(xdis < 1){
      modelMatrix.setTranslate(xdis, ydis, 0.0);
      modelMatrix.scale(1,1,-1);
      modelMatrix.scale(0.08, 0.08, 0.8);
      modelMatrix.rotate(currentAngle, 1, 1, 0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, zijistart, 36);

      modelMatrix.setTranslate(xdis, ydis, 0.0);
      modelMatrix.scale(1,1,-1);
      modelMatrix.scale(0.08, 0.08, 0.8);
      modelMatrix.rotate(currentAngle, 1, 1, 1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, zijistart, 36);

      modelMatrix.setTranslate(xdis, ydis, 0.0);
      modelMatrix.scale(1,1,-1);
      modelMatrix.scale(0.08, 0.08, 0.8);
      modelMatrix.rotate(currentAngle, 1, 0, 1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, zijistart, 36);

      modelMatrix.setTranslate(xdis, ydis, 0.0);
      modelMatrix.scale(1,1,-1);
      modelMatrix.scale(0.08, 0.08, 0.8);
      modelMatrix.rotate(90, 0, 0, 1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawArrays(gl.TRIANGLES, zijistart, 36);
      xdis += 0.1;
    }
    xdis = -1.0;
    ydis += 0.1;
  }

  //draw boat.


  modelMatrix.setTranslate(boatxlim + 0.50, ylim - 0.15, 0.0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.4, 0.6, 0.6);
  modelMatrix.rotate(130, 0, 1, 0);
  //modelMatrix.rotate(90, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, zijistart + 36, 36);

  //next object : flag rodder

  modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.847, 0.0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.1, 0.5, 0.4);
  modelMatrix.rotate(0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, zijistart + 72, 36);

  //next object : flag

  modelMatrix.setTranslate(boatxlim + 0.51, ylim + 1.177, 0.0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.4, 0.4, 0.4);
  modelMatrix.rotate(-90, 0, 0, 1);
  modelMatrix.rotate(currentAngle * 2, 1, 0, 0);
  modelMatrix.translate(0.1, 0.5, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, zijistart + 108, 3);

  //next object : sphere

  modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.5, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.translate(spherex, 0.5, 0);
  modelMatrix.rotate(currentAngle, 0, 1, 0);
  modelMatrix.rotate(currentAngle * temp2 * -1, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / floatsPerVertex, sphVerts.length / floatsPerVertex);

  //next object : sphere aroung rodder.

  modelMatrix.setTranslate(boatxlim - 0.35, ylim - 0.15, 0.0);
  modelMatrix.translate(0.9, 0.9, 0);
  modelMatrix.scale(-1,-1,0);
  modelMatrix.scale(0.1, 0.1, 0.1);
  modelMatrix.rotate((currentAngle - 180) * 2, 0, 1, 0);
  modelMatrix.translate(-6.3, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / floatsPerVertex, sphVerts.length / floatsPerVertex);

  //next object : lines

  modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.7, 0.0);
  modelMatrix.scale(1,-1,0);
  modelMatrix.scale(0.5, 0.5, 0.6);
  modelMatrix.rotate(currentAngle * 2, 0, 1, 0);
  modelMatrix.translate(1.3, 0.0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINES, zijistart + 111, 2);

  //next object : STAR
  modelMatrix.setTranslate(boatxlim - 0.25, ylim + 0.15, 0.0);
  modelMatrix.scale(0.07, 0.13, 0.004);
  modelMatrix.scale(1, 1, 1);
  modelMatrix.rotate(110, 0, 1, 0);
  modelMatrix.rotate(currentAngle * 3 * left, 0, 0, 1);
  modelMatrix.translate(0, 0.4, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, zijistart + 113, 10);
  gl.drawArrays(gl.LINE_LOOP, zijistart + 123, 10);
  gl.drawArrays(gl.TRIANGLE_STRIP, zijistart + 133, 22);

  //Rectangular

  modelMatrix.setTranslate(boatxlim - 0.14, ylim + 0.15, 0.0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.15, 0.08, 0.8);
  modelMatrix.rotate(90, 0, 0, 1);
  modelMatrix.rotate(currentAngle * 3 * left, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, zijistart, 36);

  //next object : STAR
  modelMatrix.setTranslate(boatxlim + 1.25, ylim + 0.15, 0.0);
  modelMatrix.scale(0.07, 0.13, 0.004);
  modelMatrix.scale(-1, -1, 1);
  modelMatrix.rotate(110, 0, 1, 0);
  modelMatrix.rotate(currentAngle * 3 * right, 0, 0, 1);
  modelMatrix.translate(0, 0.4, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, zijistart + 113, 10);
  gl.drawArrays(gl.LINE_LOOP, zijistart + 123, 10);
  gl.drawArrays(gl.TRIANGLE_STRIP, zijistart + 133, 22);

  //Rectangular

  modelMatrix.setTranslate(boatxlim + 1.14, ylim + 0.15, 0.0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.15, 0.08, 0.8);
  modelMatrix.rotate(90, 0, 0, 1);
  modelMatrix.rotate(currentAngle * 3 * right, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, zijistart, 36);

  //next object : clouds:
  var tempx = - 0.3;
  var tempy = 0.7;
  while(tempy > 0.1){
    while(tempx < 0.3){
      modelMatrix.setTranslate(cloud + tempx + 0.3, tempy + 0.1, -0.5);
      modelMatrix.scale(1,1,0);
      modelMatrix.scale(0.2, 0.2, 0.1);
      modelMatrix.rotate(currentAngle * 3, 1, 1, 0);
      modelMatrix.translate(0.3, -0.9, 0.0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawArrays(gl.TRIANGLE_STRIP, sphStart3 / floatsPerVertex, sphVerts3.length / floatsPerVertex);
      tempx += 0.2;
  }
  tempy -= 0.2;
}
  //next object : sun

  modelMatrix.setTranslate(-0.71, 0.8, 0);
  modelMatrix.scale(1,1,0);
  modelMatrix.scale(0.2, 0.2, 0.2);
  modelMatrix.rotate(Math.abs(currentAngle * 100) , 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);


  //next object : UFO
    //torus
  modelMatrix.setTranslate(0.51 + xaxs, 0.5 + yaxs, 0.0);
  modelMatrix.scale(1,1,-1);
  modelMatrix.scale(0.1 + sca, 0.1 + sca, 0.1 + sca);
  modelMatrix.rotate(90, 1, 0, 0);
  modelMatrix.rotate(40, 1, 0, 0);
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
							// why add 0.001? avoids divide-by-zero in next statement
							// in cases where user didn't drag the mouse.)
	modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, torStart / floatsPerVertex, torVerts.length / floatsPerVertex);

    //sphere

    modelMatrix.setTranslate(0.51 + xaxs, 0.55 + yaxs, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1 + sca, 0.1 + sca, 0.1 + sca);
    var dist2 = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  							// why add 0.001? avoids divide-by-zero in next statement
  							// in cases where user didn't drag the mouse.)
  	modelMatrix.rotate(dist2*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / floatsPerVertex, sphVerts.length / floatsPerVertex);

    //stars for windows resize

    if(res == 1){
    modelMatrix.setTranslate(-0.54, 0.45, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.15, 0.08, 0.8);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, zijistart + 155, 12);

    modelMatrix.setTranslate(-0.04, 0.75, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.15, 0.08, 0.8);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, zijistart + 155, 12);

    modelMatrix.setTranslate(0.24, 0.75, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.15, 0.08, 0.8);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, zijistart + 155, 12);

    modelMatrix.setTranslate(0.84, 0.45, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.15, 0.08, 0.8);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, zijistart + 155, 12);
}
    //next object : cylinder

    modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.5, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.translate(spherex, 0.5, 0);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.rotate(30, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    modelMatrix.translate(0, 0, 1);
    modelMatrix.translate(0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.5, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.translate(spherex, 0.5, 0);
    modelMatrix.rotate(90, 0, 1, 0);
   modelMatrix.rotate(150, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    modelMatrix.translate(0, 0, 1);
    modelMatrix.translate(0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(boatxlim + 0.51, ylim + 0.5, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
      modelMatrix.translate(spherex, 0.5, 0);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    modelMatrix.translate(0, 0, 1);
    modelMatrix.translate(0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);

    //mouse click
    if(isClick && xMclik > 0.0){
    modelMatrix.setTranslate(xMclik, yMclik, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.rotate(30, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.translate(0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(xMclik, yMclik, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.rotate(90, 0, 1, 0);
   modelMatrix.rotate(150, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.translate(0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(xMclik, yMclik, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1, 0.1, 0.1);
    modelMatrix.rotate(90, 0, 1, 0);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(currentAngle * 8, 1, 0, 0);
    modelMatrix.translate(0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, cylStart / floatsPerVertex, cylVerts.length / floatsPerVertex);
  }

  if(isClick && xMclik < 0.0){
    modelMatrix.setTranslate(xMclik, yMclik, 0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.15, 0.08, 0.8);
    modelMatrix.rotate(90, 0, 0, 1);
    modelMatrix.rotate(currentAngle * 3, 0, 1, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, zijistart + 155, 12);
  }

}
//define some functions
var g_last = Date.now();
var temp = 1;
var speed = 0.01;
var colspeed = 0.008;
var temp3 = 1;
var temp6 = 1;
//Define animate function
function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

  return newAngle %= 360;
}
function spinUp() {
  ANGLE_STEP += 25;
}

function spinDown() {
 ANGLE_STEP -= 25;
}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
  	ANGLE_STEP = myTmp;
  }
}
function moveship(xdis){

  if(xdis <= -0.95){
    temp = 1;
    left = 1;
    right = 0;
  }
  if(xdis >= -0.05){
    temp = -1;
    left = 0;
    right = 1;
  }
  xdis = xdis + temp * speed;
  return xdis;
}
function speedup(){
  speed += 0.01;

}
function speeddown(){
  if(speed > 0) speed -= 0.01;


}
function stopship(){
  if(speed != 0){
    speed = 0;
    left = 0;
    right = 0;
    temp3 = 0;
  }
  else{
    speed = 0.01;
    temp3 = 1;
    if(temp2 == -1){
      right = 1;
    }
    else left = 1;
  }
}
function movesphere(x){
  if(x >= 4.5){
    temp2 = -1;
  }
  if(x <= -4.5){
    temp2 = 1;
  }
  x = x + temp2 * (0.1 + (speed - 0.01) * 5);
  return x;
}
function movecloud(cloudx){
  if(cloudx <= -0.95){
    temp3 = 1;
  }
  if(cloudx >= 0.75){
    temp3 = -1;
  }

  if(cloudx > 0.0){
    backr = 0.5703;
    backg = 0.7187;
    backb = 0.953;
  }
  else{
    backr = backr + temp3 * (colspeed + speed - 0.01);
    backg = backg + temp3 * (colspeed + speed - 0.01);
    backb = backb + temp3 * (colspeed + speed - 0.01);
  }
  cloudx = cloudx + temp3 * speed;
  return cloudx;
}
function seamove(ylim){

  if(ylim < -0.75){
    temp6 = 1;
  }
  if(ylim > -0.55){
    temp6 = -1;
  }
  ylim = ylim + temp6 * 0.01;
  return ylim;
}
function reset(){
  ANGLE_STEP = 45.0;
  res = 0;
  temp2 = 1;
   floatsPerVertex = 7;
   left = 1;
   right = 0;
   cloud = 0;
   backr = 0.5703;
   backg = 0.7187;
   backb = 0.953;
   xMclik = 0.0;
   yMclik = 0.0;
   xMdragTot = 0.0;
   yMdragTot = 0.0;
   isDrag = false;
   yaxs = 0;
   xaxs = 0;
   sca = 0.02;
   ylim = -0.75;
   temp = 1;
   speed = 0.01;
   colspeed = 0.008;
   temp3 = 1;
  xMclik = 0;
	yMclik = 0;
  temp6 = 1;
}




//define Configurations of sphere!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function initVertexBuffer(gl) {
  makeSphere();
  makeSphere2();
  makeSphere3();
  makeCylinder();
  makeTorus();
  makeself();
	var mySiz = sphVerts.length + ziji.length + sphVerts2.length + sphVerts3.length + torVerts.length + cylVerts.length;
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  var colorShapes = new Float32Array(mySiz);
  zijistart = 0;
  for(j = 0, i = 0; j < ziji.length; j ++, i ++){
    colorShapes[i] = ziji[j];
  }
  sphStart = i;
	for(j = 0; j < sphVerts.length; j ++) {
		colorShapes[i] = sphVerts[j];
    i ++;
		}
  sphStart2 = i;
  for(j = 0; j < sphVerts2.length; j ++) {
		colorShapes[i] = sphVerts2[j];
    i ++;
		}
  sphStart3 = i;
  for(j = 0; j < sphVerts3.length; j ++) {
  		colorShapes[i] = sphVerts3[j];
      i ++;
  	}
  torStart = i;
  for(j = 0; j < torVerts.length; j ++) {
  		colorShapes[i] = torVerts[j];
      i ++;
  	}
    cylStart = i;
    for(j = 0; j < cylVerts.length; j ++) {
    		colorShapes[i] = cylVerts[j];
        i ++;
    	}
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(
  		a_Position,
  		4,
  		gl.FLOAT,
  		false,
  		FSIZE * 7,

  		0);
  gl.enableVertexAttribArray(a_Position);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(
  	a_Color,
  	3,
  	gl.FLOAT,
  	false,
  	FSIZE * 7,

  	FSIZE * 4);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}


//make cylinder
function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 0;		// radius of bottom of cylinder (top always 1.0)

 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {
		// skip the first vertex--not needed.
		if(v%2==0)
    {				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] = 1.0;
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
      cylVerts[j+4]=Math.random();
      cylVerts[j+5]=Math.random();
      cylVerts[j+6]=0.423;
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = 1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
      cylVerts[j+4]=Math.random();
      cylVerts[j+5]=Math.random();
      cylVerts[j+6]=0.923;
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = 1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=Math.random();
				cylVerts[j+5]=Math.random();
				cylVerts[j+6]=0.123;
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-1.0;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=Math.random();
				cylVerts[j+5]=0.523;
				cylVerts[j+6]=Math.random();
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-1.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=0.981;
			cylVerts[j+5]=Math.random();
			cylVerts[j+6]=Math.random();
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] =-1.0;
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=0.4832;
			cylVerts[j+5]=Math.random();
			cylVerts[j+6]=Math.random();
		}
	}
}

//make sphere
function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 17;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 0.7, 0.3]);	// North Pole: light gray
  var equColr = new Float32Array([1.0, 0.4, 0.1]);	// Equator:    bright green
  var botColr = new Float32Array([0.0, 1.0, 0.5]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.

	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s == 0){
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else{					// otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {
			if(v % 2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				sphVerts[j] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				sphVerts[j+2] = cos0;
				sphVerts[j+3] = 1.0;
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w.
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+4]=topColr[0];
				sphVerts[j+5]=topColr[1];
				sphVerts[j+6]=topColr[2];
				}
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0];
				sphVerts[j+5]=botColr[1];
				sphVerts[j+6]=botColr[2];
			}
			else {
					sphVerts[j+4] = equColr[0];
					sphVerts[j+5] = equColr[1];
					sphVerts[j+6] = equColr[2];
			}
		}
	}
}
//other color sphere
function makeSphere2() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 0.0, 0.0]);	// North Pole: light gray
  var equColr = new Float32Array([0.945, 0.9297, 0.0273]);	// Equator:    bright green
  var botColr = new Float32Array([1.0, 0.0, 0.0]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts2 = new Float32Array(  ((slices * 2 * sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.

	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s2=0; s2<slices; s2++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s2 == 0){
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else{					// otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s2+1)*sliceAngle);
		sin1 = Math.sin((s2+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s2 == slices-1) isLast = 1;	// skip last vertex of last slice.
		for(v2 = isFirst; v2< 2 * sliceVerts-isLast; v2 ++, j += floatsPerVertex) {
			if(v2 % 2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				sphVerts2[j] = sin0 * Math.cos(Math.PI*(v2)/sliceVerts);
				sphVerts2[j+1] = sin0 * Math.sin(Math.PI*(v2)/sliceVerts);
				sphVerts2[j+2] = cos0;
				sphVerts2[j+3] = 1.0;
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts2[j  ] = sin1 * Math.cos(Math.PI*(v2-1)/sliceVerts);		// x
				sphVerts2[j+1] = sin1 * Math.sin(Math.PI*(v2-1)/sliceVerts);		// y
				sphVerts2[j+2] = cos1;																				// z
				sphVerts2[j+3] = 1.0;																				// w.
			}
			if(s2==0) {	// finally, set some interesting colors for vertices:
				sphVerts2[j+4]=topColr[0];
				sphVerts2[j+5]=topColr[1];
				sphVerts2[j+6]=topColr[2];
				}
			else if(s2 == slices - 1) {
				sphVerts2[j+4]=botColr[0];
				sphVerts2[j+5]=botColr[1];
				sphVerts2[j+6]=botColr[2];
			}
			else {
					sphVerts2[j+4] = 0.932;
					sphVerts2[j+5] = Math.random();
					sphVerts2[j+6] = 0.573;
			}
		}
	}
}

//define makeSphere3
function makeSphere3() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([0.97, 0.97, 0.97]);	// North Pole: light gray
  var equColr = new Float32Array([0.99, 0.99, 0.99]);	// Equator:    bright green
  var botColr = new Float32Array([0.97, 0.97, 0.97]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts3 = new Float32Array(  ((slices * 2 * sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.

	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s3=0; s3<slices; s3++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s3 == 0){
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else{					// otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s3+1)*sliceAngle);
		sin1 = Math.sin((s3+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s3 == slices - 1) isLast = 1;	// skip last vertex of last slice.
		for(v3 = isFirst; v3< 2 * sliceVerts-isLast; v3 ++, j += floatsPerVertex) {
			if(v3 % 2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				sphVerts3[j] = sin0 * Math.cos(Math.PI*(v3)/sliceVerts);
				sphVerts3[j+1] = sin0 * Math.sin(Math.PI*(v3)/sliceVerts);
				sphVerts3[j+2] = cos0;
				sphVerts3[j+3] = 1.0;
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts3[j  ] = sin1 * Math.cos(Math.PI*(v3-1)/sliceVerts);		// x
				sphVerts3[j+1] = sin1 * Math.sin(Math.PI*(v3-1)/sliceVerts);		// y
				sphVerts3[j+2] = cos1;																				// z
				sphVerts3[j+3] = 1.0;																				// w.
			}
			if(s3==0) {	// finally, set some interesting colors for vertices:
				sphVerts3[j+4]=topColr[0];
				sphVerts3[j+5]=topColr[1];
				sphVerts3[j+6]=topColr[2];
				}
			else if(s3 == slices - 1) {
				sphVerts3[j+4]=botColr[0];
				sphVerts3[j+5]=botColr[1];
				sphVerts3[j+6]=botColr[2];
			}
			else {
					sphVerts3[j+4] = equColr[0];
					sphVerts3[j+5] = equColr[1];
					sphVerts3[j+6] = equColr[2];
			}
		}
	}
}
//make torus
function makeTorus() {

var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.5;											// radius of the bar we bent to form torus
var barSlices = 23;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 13;
 torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
 var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;	// theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;
	for(s=0,j=0; s<barSlices; s++) {		// for each 'slice' or 'ring' of the torus:
		for(v=0; v< 2*barSides; v++, j+=7) {		// for each vertex in this slice:
			if(v%2==0)	{	// even #'d vertices at bottom of slice,
				torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta)
				torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.cos((s+1)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.sin((s+1)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta)
				torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			torVerts[j+4] = 0.842;		// random color 0.0 <= R < 1.0
			torVerts[j+5] = 0.123;		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
			torVerts[j  ] = rbend + rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torVerts[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0)
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
			j+=7; // go to next vertex:
			torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep)
			torVerts[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random();		// random color 0.0 <= R < 1.0
			torVerts[j+5] = Math.random();		// random color 0.0 <= G < 1.0
			torVerts[j+6] = Math.random();		// random color 0.0 <= B < 1.0
}
//define self make graph
function makeself(){
  ziji = new Float32Array([
    //Object1 : Rectangular.
         0.3, 1.0, 0.3, 1.0,    0.28, 0.53, 0.92,
         0.3, 1.0, -0.3, 1.0,   0.28, 0.53, 0.92,
         -0.3, 1.0, -0.3, 1.0,   0.28, 0.53, 0.92,

         0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71,
         -0.3, 1.0, 0.3, 1.0,   0.07, 0.32, 0.71,
         -0.3, 1.0, -0.3, 1.0,   0.07, 0.32, 0.71,

         0.3, 1.0, -0.3, 1.0,    0.07, 0.32, 0.71,                 //face 2.(T1)
         0.3, 1.0, 0.3, 1.0,   0.07, 0.32, 0.71,
         0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,

         0.3, 1.0, -0.3, 1.0,     0.28, 0.53, 0.92,                  //T2
         0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,
         0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,


         -0.3, 1.0, 0.3, 1.0,     0.28, 0.53, 0.92,    //face 3.(T1)
         0.3, 1.0, 0.3, 1.0,    0.28, 0.53, 0.92,
         0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,

         -0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71,    //T2
         -0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,
         0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,


         -0.3, 1.0, 0.3, 1.0,    0.07, 0.32, 0.71,    //face 4.(T1)
         -0.3, 1.0, -0.3, 1.0,   0.07, 0.32, 0.71,
         -0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,

         -0.3, 1.0, 0.3, 1.0,     0.28, 0.53, 0.92,    //T2
         -0.3, -1.0, 0.3, 1.0,    0.28, 0.53, 0.92,
         -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,


         0.3, 1.0, -0.3, 1.0,     0.28, 0.53, 0.92,                  //face 5.(T1)
         -0.3, 1.0, -0.3, 1.0,    0.28, 0.53, 0.92,
         -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,

         0.3, 1.0, -0.3, 1.0,    0.07, 0.32, 0.71,                  //T2
         0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,
         -0.3, -1.0, -0.3, 1.0,   0.07, 0.32, 0.71,


         -0.3, -1.0, -0.3, 1.0,    0.07, 0.32, 0.71,                 //face 6.(T1)
         -0.3, -1.0, 0.3, 1.0,  0.07, 0.32, 0.71,
         0.3, -1.0, 0.3, 1.0,   0.07, 0.32, 0.71,

         -0.3, -1.0, -0.3, 1.0,    0.28, 0.53, 0.92,                //T2
         0.3, -1.0, -0.3, 1.0,   0.28, 0.53, 0.92,
         0.3, -1.0, 0.3, 1.0,   0.28, 0.53, 0.92,
//36
        //next object: OBject2 : boat


          // front
          1.0, 1.0, 1.0, 1.0,     0 - boatxlim, 0.41, 0.0117,  //0
          -1.0, 1.0, 1.0, 1.0,     0.945, 0 - boatxlim, 0.4883,  //1
          -0.5, 0.2, 1.0, 1.0,     0.9336, 0.652, 0 - boatxlim,  //2

          1.0, 1.0, 1.0,1.0,      0 - boatxlim, 0.41, 0.0117,  //0
          -0.5, 0.2, 1.0,1.0,      0.945,0 - boatxlim, 0.4883,  //2
          0.5, 0.2, 1.0,1.0,     0.9336, 0.1 - boatxlim, 0 - boatxlim,  //3
          //right
          1.0, 1.0, 1.0,1.0,      0.675, 0 - boatxlim, 0.0117,   //0
          0.5, 0.2, 1.0,1.0,      0 - boatxlim, 0.3867, 0.4883,  //3
          0.5, 0.2,-1.0,1.0,      0.9336, 0 - boatxlim, 0.2305,  //4

          1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.1 - boatxlim,   //0
          0.5, 0.2,-1.0,1.0,      0.945, 0.3867, 0.4883,   //4
          1.0, 1.0,-1.0,1.0,      0 - boatxlim, 0.652, 0.2305,   //5
          //up
          1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.0117,  //0
          -1.0, 1.0,1.0,1.0,      0.945, 0 - boatxlim, 0.4883,  //1
          -1.0, 1.0,-1.0,1.0,     0.9336, 0.652, 0.2305,  //6

          1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0.0117,  //0
          -1.0, 1.0,-1.0,1.0,     0.945, 0.3867, 0.4883,  //6
          1.0, 1.0, -1.0,1.0,     0.9336, 0.1 - boatxlim, 0.2305,  //5

          //left
          -1.0, 1.0, 1.0,1.0,     0.675, 0.41, 0.1 - boatxlim,  //1
          -0.5, 0.2,1.0,1.0,      0.945, 0.3867, 0.4883,  //2
          -0.5,0.2,-1.0,1.0,      0 - boatxlim, 0.652, 0.2305,  //7

          -1.0, 1.0, 1.0,1.0,      0.675, 0.41, 0 - boatxlim,  //1
          -0.5,0.2,-1.0,1.0,       0.1 - boatxlim, 0.3867, 0.4883,  //7
          -1.0, 1.0, -1.0,1.0,     0.9336, 0.652, 0.2305,  //6
          //down
          -0.5,0.2,1.0, 1.0,       0.675, 0 - boatxlim, 0.0117,   //2
          0.5, 0.2,1.0, 1.0,       0 - boatxlim, 0.3867, 0.4883,   //3
          0.5, 0.2, -1.0,1.0,      0.9336, 0.652, 0 - boatxlim,   //4

          -0.5,0.2,1.0, 1.0,        0 - boatxlim, 0.41, 0.0117,    //2
          0.5, 0.2, -1.0,  1.0,    0 - boatxlim, 0.3867, 0.4883,    //4
          -0.5, 0.2, -1.0,1.0,     0.9336, 0 - boatxlim, 0.2305,    //7

          //back
          0.5, 0.2,-1.0,  1.0,     0.675, 0.41, 0 - boatxlim,       //4
          1.0,1.0,-1.0,1.0,       0.926, 0 - boatxlim, 0.0078,       //5
          -1.0, 1.0,-1.0, 1.0,    0 - boatxlim, 0.652, 0.2305,       //6

           0.5, 0.2,-1.0, 1.0,      0 - boatxlim, 0.41, 0.0117,     //4
           -1.0, 1.0,-1.0, 1.0,     0.926, 0 - boatxlim, 0.0078,     //6
           -0.5, 0.2,-1.0,1.0,      0.9336, 0.652, 0.2305,     //7
//36
          //next object : Object3 : Rectangular.

          0.3, 1.0, 0.3, 1.0,    0.492, 0.945, 0.328,
          0.3, 1.0, -0.3, 1.0,   0.492, 0.945, 0.328,
          -0.3, 1.0, -0.3, 1.0,  0.492, 0.945, 0.328,

          0.3, 1.0, 0.3, 1.0,    0.1836, 0.617, 0.027,
          -0.3, 1.0, 0.3, 1.0,   0.1836, 0.617, 0.027,
          -0.3, 1.0, -0.3, 1.0,  0.1836, 0.617, 0.027,

          0.3, 1.0, -0.3, 1.0,   0.086, 0.3086, 0.0078,                 //face 2.(T1)
          0.3, 1.0, 0.3, 1.0,   0.086, 0.3086, 0.0078,
          0.3, -1.0, 0.3, 1.0,   0.086, 0.3086, 0.0078,

          0.3, 1.0, -0.3, 1.0,     0.1836, 0.617, 0.027,                  //T2
          0.3, -1.0, -0.3, 1.0,    0.1836, 0.617, 0.027,
          0.3, -1.0, 0.3, 1.0,    0.1836, 0.617, 0.027,


          -0.3, 1.0, 0.3, 1.0,     0.492, 0.945, 0.328,    //face 3.(T1)
          0.3, 1.0, 0.3, 1.0,    0.492, 0.945, 0.328,
          0.3, -1.0, 0.3, 1.0,    0.492, 0.945, 0.328,

          -0.3, 1.0, 0.3, 1.0,    0.086, 0.3086, 0.0078,    //T2
          -0.3, -1.0, 0.3, 1.0,   0.086, 0.3086, 0.0078,
          0.3, -1.0, 0.3, 1.0,   0.086, 0.3086, 0.0078,


          -0.3, 1.0, 0.3, 1.0,    0.492, 0.945, 0.328,    //face 4.(T1)
          -0.3, 1.0, -0.3, 1.0,   0.492, 0.945, 0.328,
          -0.3, -1.0, -0.3, 1.0,   0.492, 0.945, 0.328,

          -0.3, 1.0, 0.3, 1.0,     0.1836, 0.617, 0.027,    //T2
          -0.3, -1.0, 0.3, 1.0,    0.1836, 0.617, 0.027,
          -0.3, -1.0, -0.3, 1.0,    0.1836, 0.617, 0.027,


          0.3, 1.0, -0.3, 1.0,     0.086, 0.3086, 0.0078,                  //face 5.(T1)
          -0.3, 1.0, -0.3, 1.0,    0.086, 0.3086, 0.0078,
          -0.3, -1.0, -0.3, 1.0,    0.086, 0.3086, 0.0078,

          0.3, 1.0, -0.3, 1.0,    0.492, 0.945, 0.328,                 //T2
          0.3, -1.0, -0.3, 1.0,   0.492, 0.945, 0.328,
          -0.3, -1.0, -0.3, 1.0,   0.492, 0.945, 0.328,


          -0.3, -1.0, -0.3, 1.0,    0.1836, 0.617, 0.027,                 //face 6.(T1)
          -0.3, -1.0, 0.3, 1.0,  0.1836, 0.617, 0.027,
          0.3, -1.0, 0.3, 1.0,   0.1836, 0.617, 0.027,

          -0.3, -1.0, -0.3, 1.0,    0.086, 0.3086, 0.0078,                //T2
          0.3, -1.0, -0.3, 1.0,   0.086, 0.3086, 0.0078,
          0.3, -1.0, 0.3, 1.0,   0.086, 0.3086, 0.0078,
//36
          //next object : flag

          0, 0.5, 0, 1.0,             0.9453, 0.0273, 0.1641,
          -0.5, -0.5, 0, 1.0,         0.675, 0.41, 0.0117,
          0.5, -0.5, 0, 1.0,          0.926, 0.5586, 0.0078,

          //next object : lines

          0, 0, 0, 1.0,               0.485, 0.281, 0.983,
          -0.5, -0.9, 0, 1.0,           0.275, 0.857, 0.123,

          //next object : stars

          +0.0, +1.0, +1.0, +1.0, +0.4, +0.1, +0.3,
          +0.4, +0.0, +1.0, +1.0, +0.1, +0.2, +0.6,
          +1.5, +0.0, +1.0, +1.0, +0.265, +0.86, +0.432,
          +0.8, -0.8, +1.0, +1.0, +0.312, +0.754, +0.5,
          +1.0, -1.8, +1.0, +1.0, +0.523, +0.64, +0.4,
          +0.0, -1.0, +1.0, +1.0, +0.1, +0.23, +0.543,
          -1.0, -1.8, +1.0, +1.0, +0.1, +0.3, +0.56,
          -0.8, -0.8, +1.0, +1.0, +0.75, +0.2, +0.58,
          -1.5, +0.0, +1.0, +1.0, +0.34, +0.1, +0.12,
          -0.4, +0.0, +1.0, +1.0, +0.32, +0.0, +0.543,

          +0.0, +1.0, -1.0, +1.0, +0.364, +0.9456, +0.834,
          +0.4, +0.0, -1.0, +1.0, +0.934, +0.8654, +0.73,
          +1.5, +0.0, -1.0, +1.0, +0.83, +0.72, +0.613,
          +0.8, -0.8, -1.0, +1.0, +0.534, +0.123, +0.5321,
          +1.0, -1.8, -1.0, +1.0, +0.13, +0.543, +0.789,
          +0.0, -1.0, -1.0, +1.0, +0.85, +0.234, +0.364,
          -1.0, -1.8, -1.0, +1.0, +0.344, +0.8763, +0.122,
          -0.8, -0.8, -1.0, +1.0, +0.396, +0.265, +0.541,
          -1.5, +0.0, -1.0, +1.0, +0.24, +0.241, +0.5340,
          -0.4, +0.0, -1.0, +1.0, +0.198, +0.120, +0.420,

          +0.0, +1.0, +1.0, +1.0, +0.1230, +0.65460, +0.530,
          +0.0, +1.0, -1.0, +1.0, +0.9789, +0.12349, +0.73670,
          +0.4, +0.0, +1.0, +1.0, +0.158, +0.6421, +0.1641,
          +0.4, +0.0, -1.0, +1.0, +0.158, +0.34678, +0.4641,
          +1.5, +0.0, +1.0, +1.0, +0.158, +0.51678, +0.641,
          +1.5, +0.0, -1.0, +1.0, +0.158, +0.1678, +0.86741,
          +0.8, -0.8, +1.0, +1.0, +0.158, +0.9678, +0.5641,
          +0.8, -0.8, -1.0, +1.0, +0.158, +0.1678, +0.7641,
          +1.0, -1.8, +1.0, +1.0, +0.158, +0.3678, +0.9641,
          +1.0, -1.8, -1.0, +1.0, +0.158, +0.5678, +0.4641,

          +0.0, -1.0, +1.0, +1.0, +0.198, +0.9120, +0.1420,
          +0.0, -1.0, -1.0, +1.0, +0.198, +0.6120, +0.24420,
          -1.0, -1.8, +1.0, +1.0, +0.198, +0.2120, +0.3420,
          -1.0, -1.8, -1.0, +1.0, +0.198, +0.9120, +0.7420,
          -0.8, -0.8, +1.0, +1.0, +0.198, +0.2120, +0.2420,
          -0.8, -0.8, -1.0, +1.0, +0.198, +0.5120, +0.7420,
          -1.5, +0.0, +1.0, +1.0, +0.198, +0.1120, +0.5420,
          -1.5, +0.0, -1.0, +1.0, +0.198, +0.8120, +0.7420,
          -0.4, +0.0, +1.0, +1.0, +0.198, +0.9120, +0.2420,
          -0.4, +0.0, -1.0, +1.0, +0.198, +0.2120, +0.2420,
          +0.0, +1.0, +1.0, +1.0, +0.198, +0.1120, +0.420,
          +0.0, +1.0, -1.0, +1.0, +0.198, +0.120, +0.4420,
  //42

        0.0, 0.7, 0, 1,     0.985, 0.594, 0.345,
        -0.2, 0.2, 0, 1,    0.985, 0.594, 0.345,
        -0.7, 0.4, 0, 1,    0.985, 0.594, 0.345,
        -0.4, 0, 0, 1,      0.985, 0.594, 0.345,
          -0.7, -0.4, 0, 1, 0.985, 0.594, 0.345,
          -0.2, -0.2, 0, 1, 0.985, 0.594, 0.345,
          0, -0.7, 0, 1,    0.985, 0.594, 0.345,
          0.2, -0.2, 0, 1,  0.985, 0.594, 0.345,
            0.7, -0.4, 0, 1, 0.985, 0.594, 0.345,
            0.4, 0, 0, 1,     0.985, 0.594, 0.345,
            0.7, 0.4, 0, 1, 0.985, 0.594, 0.345,
            0.2, 0.2, 0, 1, 0.985, 0.594, 0.345,
  ]);
}
//mouse listener

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
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
}


function myKeyDown(ev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard, and captures the
// keyboard's scancode or keycode(varies for different countries and alphabets).
//  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T
// need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins,
// Del, etc), then just use the 'keypress' event instead.
//	 The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
// ASCII codes; you'll get the ASCII code for uppercase 'S' if you hold shift
// and press the 's' key.
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of the messy way JavaScript handles keyboard events
// see:    http://javascript.info/tutorial/keyboard-events
//
/*
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 37:		// left-arrow key
			// print in console:
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('Result').innerHTML =
  			' Left Arrow:keyCode='+ev.keyCode;
			break;
		case 38:		// up-arrow key
			console.log('   up-arrow.');
  		document.getElementById('Result').innerHTML =
  			'   Up Arrow:keyCode='+ev.keyCode;
			break;
		case 39:		// right-arrow key
			console.log('right-arrow.');
  		document.getElementById('Result').innerHTML =
  			'Right Arrow:keyCode='+ev.keyCode;
  		break;
		case 40:		// down-arrow key
			console.log(' down-arrow.');
  		document.getElementById('Result').innerHTML =
  			' Down Arrow:keyCode='+ev.keyCode;
  		break;
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
  		document.getElementById('Result').innerHTML =
  			'myKeyDown()--keyCode='+ev.keyCode;
			break;*/
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
