const wait = async (ms) => {
    return new Promise(
        (resolve) => {
            setTimeout(() => {resolve();},
            ms)
        }
    );
}

class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
        points.push(this);
        //document.createElement('label');
        this.draw();
    }
    draw(){
        let X = canvas.width / 2 + this.x;
        let Y = canvas.height / 2 - this.y;

        let n = points.length;
        ctx.fillText(n, X, Y);

        ctx.beginPath();
        ctx.arc(X, Y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

class Line {
    // 1st postulate
    constructor(p1, p2){
        this.x1 = p1.x;
        this.y1 = p1.y;
        this.x2 = p2.x;
        this.y2 = p2.y;
        this.visible = false;
        this.draw();
    }
    set(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.draw();
    }
    async draw(){
        let X1 = canvas.width / 2 + this.x1;
        let Y1 = canvas.height / 2 - this.y1;
        let X2 = canvas.width / 2 + this.x2;
        let Y2 = canvas.height / 2 - this.y2;
        const n = 50;
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.moveTo(X1 * (n-i)/n + X2 * i/n, Y1 * (n-i)/n + Y2 * i/n);
            ctx.lineTo(X1 * (n-i-1)/n + X2 * (i+1)/n, Y1 * (n-i-1)/n + Y2 * (i+1)/n);
            ctx.stroke();
            await wait(10);
        }
        this.visible = true;
    }
}

class Circle {
    // 3rd postulate
    constructor(p, r){
        this.x = p.x;
        this.y = p.y;
        this.r = r;
        this.visible = false;
        this.draw();
    }
    async draw(){
        let X = canvas.width / 2 + this.x;
        let Y = canvas.height / 2 - this.y;
        const n = 50;
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.arc(X, Y, this.r, 2*Math.PI * i/n, 2*Math.PI * (i+1)/n, false);
            ctx.stroke();
            await wait(10);
        }
        this.visible = true;
    }
}

function dist(p1, p2){
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}
function intrsecLines(line1, line2){
    let dx1 = line1.x2 - line1.x1;
    let dy1 = line1.y2 - line1.y1;
    let dx2 = line2.x2 - line2.x1;
    let dy2 = line2.y2 - line2.y1;
    let D = dx2 * dy1 - dx1 * dy2;
    if(D == 0){
        return;
    }else{
        s = ((line2.x2 - line1.x2) * dy2 + dx2 * (line2.y2 - line1.y2)) / D;
        t = ((line1.x1 - line2.x1) * dy1 + dx1 * (line1.y1 - line2.y1)) / D;
        let X = s * line1.x1 + (1 - s) * line1.x2;
        let Y = s * line1.y1 + (1 - s) * line1.y2;
        //let X = (line1.x1 * dy1 * dx2 - line2.x1 * dx1 * dy2 + dx1 * dx2 * (line2.y1 - line1.y1)) / D;
        //let Y = (line2.y1 * dy1 * dx2 - line1.y1 * dx1 * dy2 - dy1 * dy2 * (line2.x1 - line1.x1)) / D;
        //while(!line1.visible) await wait(10);
        //while(!line2.visible) await wait(10);
        return new Point(X, Y);
    }
}

function intrsecLineAndCircle(line, circle){
    let a = line.y1 - line.y2;
    let b = line.x2 - line.x1;
    let c = line.x1 * line.y2 - line.x2 * line.y1;
    let d = Math.abs(a * circle.x + b * circle.y + c);
    if(d / Math.sqrt(a**2 + b**2) > circle.r){
        return;
    }else{
        let X1 = (a*d - b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y1 = (b*d + a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;
        let X2 = (a*d + b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y2 = (b*d - a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;
        //while(!line.visible) await wait(10);
        //while(!circle.visible) await wait(10);
        return [new Point(X1, Y1), new Point(X2, Y2)];
    }
}
function intrsecCircles(circle1, circle2){
    let a = 2 * (circle2.x - circle1.x);
    let b = 2 * (circle2.y - circle1.y);
    let c = circle1.x**2 - circle2.x**2 + circle1.y**2 - circle2.y**2 + circle2.r**2 - circle1.r**2;
    let d = Math.abs(a*circle1.x + b*circle1.y + c);
    let dist = Math.abs(circle2.x - circle1.x, circle2.y - circle1.y);
    if(dist > circle1.r + circle2.r || dist < Math.abs(circle2.r - circle1.r)){
        return;
    }else{
        let X1 = (a*d - b*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.x;
        let Y1 = (b*d + a*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.y;
        let X2 = (a*d + b*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.x;
        let Y2 = (b*d - a*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.y;
        //while(!circle1.visible) await wait(10);
        //while(!circle2.visible) await wait(10);
        return [new Point(X1, Y1), new Point(X2, Y2)];
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var figures = [];
var points = [];

canvas.addEventListener(
    'mousemove',
    function(event){
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top();
        mouseX = mouseX - canvas.width / 2;
        mouseY = canvas.height / 2 - mouseY;
        for(let i = 0; i < points.length; i++){
            if(Math.abs(points[i].x - mouseX, points[i].y - mouseY) < 5){
            }
        }
    },
    false
);
document.getElementById('picture').addEventListener(
    'click',
    event => event.target.href = canvas.toDataURL()
);

p1 = new Point(-100, 0);
p2 = new Point(100, 0);
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
c4 = new Circle(p5, dist(p1, p6));console.log(p1, p6, dist(p1, p6));
//[p8, p9] = intrsecLineAndCircle(l2, c4);
/*c5 = new Circle(p1, d);
c6 = new Circle(p2, d);
c7 = new Circle(p8, d);
[p10, p11] = intrsecCircles(c5, c7);
[p12, p13] = intrsecCircles(c6, c7);
l4 = new Line(p1, p10);
l5 = new Line(p8, p10);
l6 = new Line(p2, p12);
l7 = new Line(p8, p12);*/