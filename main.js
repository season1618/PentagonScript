import {canvas, ctx, sketches} from './modules/canvas.js';
import {Point, Line, Circle} from './modules/construction.js';
import {dist, intrsecLines, intrsecLineAndCircle, intrsecCircles} from './modules/construction.js';

let b = 0;
p1 = new Point(canvas.width/2 - 100, canvas.height/2 - 0); // (-100, 0)
p2 = new Point(canvas.width/2 + 100, canvas.height/2 - 0); // (100, 0)
d = dist(p1, p2);
l1 = new Line(p1, p2);
c1 = new Circle(p1, 150);
c2 = new Circle(p2, 150);
[p3, p4] = intrsecCircles(c1, c2);
l2 = new Line(p3, p4);
p5 = intrsecLines(l1, l2);
c3 = new Circle(p5, d);
[p6, p7] = intrsecLineAndCircle(l2, c3);
l3 = new Line(p1, p6);
c4 = new Circle(p6, dist(p1, p5));
[p8, p9] = intrsecLineAndCircle(l3, c4);
c5 = new Circle(p1, dist(p1, p9));
[p10, p11] = intrsecLineAndCircle(l2, c5);
c6 = new Circle(p1, d);
c7 = new Circle(p2, d);
c8 = new Circle(p10, d);
[p12, p13] = intrsecCircles(c6, c8);
[p14, p15] = intrsecCircles(c7, c8);
l4 = new Line(p1, p12);
l5 = new Line(p10, p12);
l6 = new Line(p2, p15);
l7 = new Line(p10, p15);
sketches.push(p1);sketches.push(p2);sketches.push(l1);sketches.push(c1);sketches.push(c2);
sketches.push(p3);sketches.push(p4);sketches.push(l2);sketches.push(p5);sketches.push(c3);
sketches.push(p6);sketches.push(p7);sketches.push(l3);sketches.push(c4);sketches.push(p8);
sketches.push(p9);sketches.push(c5);sketches.push(p10);sketches.push(p11);sketches.push(c6);
sketches.push(c7);sketches.push(c8);sketches.push(p12);sketches.push(p13);sketches.push(p14);
sketches.push(p15);sketches.push(l4);sketches.push(l5);sketches.push(l6);sketches.push(l7);

draw(ctx);
//animation();