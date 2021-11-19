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
        sketches.push(this);
        //document.createElement('label');
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
        sketches.push(this);
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
        this.th1 = 10;
        this.th2 = -10;
        this.visible = false;
        sketches.push(this);
    }
    async draw(){
        let X = canvas.width / 2 + this.x;
        let Y = canvas.height / 2 - this.y;
        const n = 50;
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.arc(
                X, Y, this.r,
                -(this.th1 * i/n + this.th2 * (n-i)/n),
                -(this.th1 * (i+1)/n + this.th2 * (n-i-1)/n),
                false
            );
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
        let s = ((line2.x2 - line1.x2) * dy2 + dx2 * (line2.y2 - line1.y2)) / D;
        let t = ((line1.x2 - line2.x2) * dy1 + dx1 * (line1.y2 - line2.y2)) / D;
        let X = s * line1.x1 + (1 - s) * line1.x2;
        let Y = s * line1.y1 + (1 - s) * line1.y2;
        //let X = (line1.x1 * dy1 * dx2 - line2.x1 * dx1 * dy2 + dx1 * dx2 * (line2.y1 - line1.y1)) / D;
        //let Y = (line2.y1 * dy1 * dx2 - line1.y1 * dx1 * dy2 - dy1 * dy2 * (line2.x1 - line1.x1)) / D;
        if(s < 0){
            s -= 0.1;
            line1.x2 = s * line1.x1 + (1 - s) * line1.x2;
            line1.y2 = s * line1.y1 + (1 - s) * line1.y2;
        }else if(1 < s){
            s += 0.1
            line1.x1 = s * line1.x1 + (1 - s) * line1.x2;
            line1.y1 = s * line1.y1 + (1 - s) * line1.y2;
        }
        if(t < 0){
            t -= 0.1;
            line2.x2 = t * line2.x1 + (1 - t) * line2.x2;
            line2.y2 = t * line2.y1 + (1 - t) * line2.y2;
        }else if(1 < t){
            t += 0.1;
            line2.x1 = t * line2.x1 + (1 - t) * line2.x2;
            line2.y1 = t * line2.y1 + (1 - t) * line2.y2;
        }
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
        
        // line border
        let s = (line.x1 != line.x2 ? (X1 - line.x1) / (line.x2 - line.x1) : (Y1 - line.y1) / (line.y2 - line.y1));
        if(s < 0){
            s -= 0.1;
            line.x1 = (1 - s) * line.x1 + s * line.x2;
            line.y1 = (1 - s) * line.y1 + s * line.y2;
        }else if(1 < s){
            s += 0.1;
            line.x2 = (1 - s) * line.x1 + s * line.x2;
            line.y2 = (1 - s) * line.y1 + s * line.y2;
        }
        let t = (line.x1 != line.x2 ? (X2 - line.x1) / (line.x2 - line.x1) : (Y2 - line.y1) / (line.y2 - line.y1));
        if(t < 0){
            t -= 0.1;
            line.x1 = (1 - t) * line.x1 + t * line.x2;
            line.y1 = (1 - t) * line.y1 + t * line.y2;
        }else if(1 < t){
            t += 0.1;
            line.x2 = (1 - t) * line.x1 + t * line.x2;
            line.y2 = (1 - t) * line.y1 + t * line.y2;
        }

        // circle border
        let alpha = Math.atan2(Y1 - circle.y, X1 - circle.x);
        let beta = Math.atan2(Y2 - circle.y, X2 - circle.x);
        [alpha, beta] = [beta, alpha];
        if(beta - alpha < Math.PI){
            circle.th1 = Math.min(circle.th1, alpha - 0.1);
            circle.th2 = Math.max(circle.th2, beta + 0.1);
        }else{
            circle.th1 = Math.min(circle.th1, beta - 0.1);
            circle.th2 = Math.max(circle.th2, alpha + 2*Math.PI + 0.1);
        }

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
        
        // circle1 border
        let alpha1 = Math.atan2(Y1 - circle1.y, X1 - circle1.x);
        let beta1 = Math.atan2(Y2 - circle1.y, X2 - circle1.x);console.log(alpha1, beta1);
        if(alpha1 > beta1) [alpha1, beta1] = [beta1, alpha1];
        if(beta1 - alpha1 < Math.PI){
            circle1.th1 = Math.min(circle1.th1, alpha1 - 0.1);
            circle1.th2 = Math.max(circle1.th2, beta1 + 0.1);
        }else{
            circle1.th1 = Math.min(circle1.th1, beta1 - 0.1);
            circle1.th2 = Math.max(circle1.th2, alpha1 + 2*Math.PI + 0.1);
        }
        // circle2 border
        let alpha2 = Math.atan2(Y1 - circle2.y, X1 - circle2.x);
        let beta2 = Math.atan2(Y2 - circle2.y, X2 - circle2.x);
        if(alpha2 > beta2) [alpha2, beta2] = [beta2, alpha2];
        if(beta2 - alpha2 < Math.PI){
            circle2.th1 = Math.min(circle2.th1, alpha2 - 0.1);
            circle2.th2 = Math.max(circle2.th2, beta2 + 0.1);
        }else{
            circle2.th1 = Math.min(circle2.th1, beta2 - 0.1);
            circle2.th2 = Math.max(circle2.th2, alpha2 + 2*Math.PI + 0.1);
        }

        return [new Point(X1, Y1), new Point(X2, Y2)];
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvasScale = 100;
var centerX = 0; var centerY = 0;
var sketches = [];
var points = [];

canvas.addEventListener(
    'mousemove',
    function(event){
        let rect = canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        mouseX = mouseX - canvas.width / 2;
        mouseY = canvas.height / 2 - mouseY;
        for(let i = 0; i < points.length; i++){
            if(Math.abs(points[i].x - mouseX, points[i].y - mouseY) < 5){
            }
        }
    },
    false
);
canvas.addEventListener(
    'wheel',
    function(event){
        canvasScale += event.deltaY / 100;
        ctx.save();
        ctx.scale(canvasScale / 100, canvasScale / 100);
        ctx.restore();
        //canvas.width = 8 * canvasScale;
        //canvas.height = 8 * canvasScale;
    }
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
l7 = new Line(p10, p15);console.log(c6, c8);

for(let i = 0; i < sketches.length; i++){
    sketches[i].draw();
}