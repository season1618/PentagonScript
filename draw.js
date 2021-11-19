import ctx from "./canvas.js";

class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    translate(moveX, moveY){
        this.x += moveX;
        this.y += moveY;
    }
    scale(mousePosX, mousePosY, scaleRate){
        this.x = scaleRate * (this.x - mousePosX) + mousePosX;
        this.y = scaleRate * (this.y - mousePosY) + mousePosY;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    animation(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
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
    }
    translate(moveX, moveY){
        this.x1 += moveX;
        this.y1 += moveY;
        this.x2 += moveX;
        this.y2 += moveY;
    }
    scale(mousePosX, mousePosY, scaleRate){
        this.x1 = scaleRate * (this.x1 - mousePosX) + mousePosX;
        this.y1 = scaleRate * (this.y1 - mousePosY) + mousePosY;
        this.x2 = scaleRate * (this.x2 - mousePosX) + mousePosX;
        this.y2 = scaleRate * (this.y2 - mousePosY) + mousePosY;
    }
    draw(){
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
    async animation(){
        const n = 50;
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.moveTo(this.x1 * (n-i)/n + this.x2 * i/n, this.y1 * (n-i)/n + this.y2 * i/n);
            ctx.lineTo(this.x1 * (n-i-1)/n + this.x2 * (i+1)/n, this.y1 * (n-i-1)/n + this.y2 * (i+1)/n);
            ctx.stroke();
            await wait(10);
        }
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
    }
    translate(moveX, moveY){
        this.x += moveX;
        this.y += moveY;
    }
    scale(mousePosX, mousePosY, scaleRate){
        this.x = scaleRate * (this.x - mousePosX) + mousePosX;
        this.y = scaleRate* (this.y - mousePosY) + mousePosY;
        this.r = scaleRate * this.r;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, -this.th2, -this.th1, false);
        ctx.stroke();
    }
    async animation(){
        const n = 50;
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.arc(
                this.x, this.y, this.r,
                -(this.th1 * i/n + this.th2 * (n-i)/n),
                -(this.th1 * (i+1)/n + this.th2 * (n-i-1)/n),
                false
            );
            ctx.stroke();
            await wait(10);
        }
    }
}

const wait = async (ms) => {
    return new Promise(
        (resolve) => {
            setTimeout(() => {resolve();},
            ms)
        }
    );
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

        if(alpha > beta) [alpha, beta] = [beta, alpha];
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
    let dist = Math.sqrt((circle2.x - circle1.x)**2 + (circle2.y - circle1.y)**2);

    if(dist > circle1.r + circle2.r || dist < Math.abs(circle2.r - circle1.r)){
        return;
    }else{
        let X1 = (a*d - b*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.x;
        let Y1 = (b*d + a*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.y;
        let X2 = (a*d + b*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.x;
        let Y2 = (b*d - a*Math.sqrt((a**2 + b**2)*circle1.r**2 - d**2)) / (a**2 + b**2) + circle1.y;
        
        // circle1 border
        let alpha1 = Math.atan2(Y1 - circle1.y, X1 - circle1.x);
        let beta1 = Math.atan2(Y2 - circle1.y, X2 - circle1.x);

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

export default {Point, Line, Circle};
export default {dist, intrsecLines, intrsecLineAndCircle, intrsecCircles};