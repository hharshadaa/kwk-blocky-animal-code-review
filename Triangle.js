 //drawTriangle([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  //drawTriangle([0.8, 0.9, .7, .8, .8, .7]);
  //drawTriangle([0.0, 0.0, .5, 0, .5, .5]);
class Triangle{
  constructor() {
    this.type='triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

render() {
  const xy = this.position;
  const rgba = this.color;
  const size = this.size; // slider value (pixels-ish)

  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  // Convert pixels -> clip space
  //used gpt to debug this part 
  const dx = (size / canvas.width) * 2.0;
  const dy = (size / canvas.height) * 2.0;

  drawTriangle([
    xy[0],xy[1], xy[0] + dx, xy[1], xy[0],  xy[1] + dy    ]);
}

}

function drawTriangle(vertices) {
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0 , n);

}

function drawTriangle3D(vertices) {
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0 , n);

}
