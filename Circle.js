class Circle{
  constructor() {
    this.type='circle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = 10;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
   // var xy = shape[i];
   // var rgba = g_colors[i];
   // var size = g_sizes[i];
  // gl.disableVertexAttribArray(a_Position);

    // Pass the position of a point to a_Position variable
   // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw
    var d = this.size / 200.0; // delta

    //used gpt to help me make sure there were no errors in typing
    let angleStep = 360 / this.segments;
    for (var angle = 0; angle < 360; angle = angle + angleStep) {
    let centerPt = [xy[0], xy[1]];
    let angle1 = angle;
    let angle2 = angle + angleStep;
    let vec1 = [Math.cos(angle1 * Math.PI / 180) * d,Math.sin(angle1 * Math.PI / 180) * d];
    let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
    let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
    let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

    drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }

    //drawTriangle( [xy[0], xy[1], xy[0]+.1, xy[1], xy[0], xy[1]+.1]);

  }

}

class Sphere {
  constructor() {
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 12;   // horizontal slices
    this.rings = 12;      // vertical slices
  }

  render() {
    gl.uniform4f(u_FragColor,
      this.color[0],
      this.color[1],
      this.color[2],
      this.color[3]
    );

    gl.uniformMatrix4fv(
      u_ModelMatrix,
      false,
      this.matrix.elements
    );

    for (let lat = 0; lat < this.rings; lat++) {
      let theta1 = lat * Math.PI / this.rings;
      let theta2 = (lat + 1) * Math.PI / this.rings;

      for (let lon = 0; lon < this.segments; lon++) {
        let phi1 = lon * 2 * Math.PI / this.segments;
        let phi2 = (lon + 1) * 2 * Math.PI / this.segments;

        let p1 = this.point(theta1, phi1);
        let p2 = this.point(theta2, phi1);
        let p3 = this.point(theta2, phi2);
        let p4 = this.point(theta1, phi2);

        drawTriangle3D([...p1, ...p2, ...p3]);
        drawTriangle3D([...p1, ...p3, ...p4]);
      }
    }
  }

  point(theta, phi) {
    return [
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    ];
  }
}
