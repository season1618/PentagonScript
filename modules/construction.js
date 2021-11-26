class Point {
    constructor(x, y){
        this.type = 'Point';
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
    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    animation(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

class Line {
    // 1st postulate
    constructor(p1, p2){
        this.type = 'Line';
        this.x1 = p1.x;
        this.y1 = p1.y;
        this.x2 = p2.x;
        this.y2 = p2.y;
    }
    update(X, Y){
        let x3 = 2 * this.x1 - this.x2;
        let y3 = 2 * this.y1 - this.y2;

        let d = Math.sqrt((this.x2 - this.x1)**2 + (this.y2 - this.y1)**2);
        let d1 = Math.sqrt((X - this.x1)**2 + (Y - this.y1)**2);
        let d2 = Math.sqrt((X - this.x2)**2 + (Y - this.y2)**2);
        let d3 = Math.sqrt((X - x3)**2 + (Y - y3)**2);
        let t;
        if(d3 <= d2) t = - d1 / d;
        else t = d1 / d;

        if(t < 0){
            t -= 0.1;
            this.x1 = (1 - t) * this.x1 + t * this.x2;
            this.y1 = (1 - t) * this.y1 + t * this.y2;
        }else if(1 < t){
            t += 0.1;
            this.x2 = (1 - t) * this.x1 + t * this.x2;
            this.y2 = (1 - t) * this.y1 + t * this.y2;
        }
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
    draw(ctx){
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
    async animation(ctx){
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
        this.type = 'Circle';
        this.x = p.x;
        this.y = p.y;
        this.r = r;
        this.th1 = 10;
        this.th2 = 10 + 2 * Math.PI;
    }
    update(X, Y){
        let th = Math.atan2(Y - this.y, X - this.x);
        if(this.th1 == 10){
            this.th1 = th - 0.1;
            this.th2 = th + 0.1;
            return;
        }

        let alpha, beta;
        if(th <= 0){
            alpha = th;
            beta = th + 2 * Math.PI;
        }else{
            alpha = th - 2 * Math.PI;
            beta = th;
        }

        if(this.th1 <= alpha && alpha <= this.th2);
        else if(this.th1 <= beta && beta <= this.th2);
        else if(this.th2 < alpha) this.th2 = alpha + 0.1;
        else if(beta < this.th1) this.th1 = beta - 0.1;
        else{
            if(this.th1 - alpha < beta - this.th2) this.th1 = alpha - 0.1;
            else this.th2 = beta + 0.1;
        }
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
    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.th1, this.th2, false);
        ctx.stroke();
    }
    async animation(ctx){
        const n = 0.2 * this.r * (this.th2 - this.th1);
        for(let i = 0; i < n; i++){
            ctx.beginPath();
            ctx.arc(
                this.x, this.y, this.r,
                this.th1 * (n-i)/n + this.th2 * i/n,
                this.th1 * (n-i-1)/n + this.th2 * (i+1)/n,
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
        let s = (dx2 * (line2.y1 - line1.y1) - dy2 * (line2.x1 - line1.x1)) / D;
        let X = (1 - s) * line1.x1 + s * line1.x2;
        let Y = (1 - s) * line1.y1 + s * line1.y2;

        line1.update(X, Y);
        line2.update(X, Y);
        return new Point(X, Y);
    }
}

function intrsecLineAndCircle(line, circle){
    let a = line.y2 - line.y1;
    let b = line.x1 - line.x2;
    let c = line.x2 * line.y1 - line.x1 * line.y2;
    let d = a * circle.x + b * circle.y + c;

    if(d / Math.sqrt(a**2 + b**2) > circle.r){
        return;
    }else{
        let X1 = (-a*d - b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y1 = (-b*d + a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;
        let X2 = (-a*d + b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y2 = (-b*d - a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;

        return [new Point(X1, Y1), new Point(X2, Y2)];
    }
}

function intrsecCircleAndLine(circle, line){
    let a = line.y2 - line.y1;
    let b = line.x1 - line.x2;
    let c = line.x2 * line.y1 - line.x1 * line.y2;
    let d = a * circle.x + b * circle.y + c;

    if(d / Math.sqrt(a**2 + b**2) > circle.r){
        return;
    }else{
        let X1 = (-a*d + b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y1 = (-b*d - a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;
        let X2 = (-a*d - b*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.x;
        let Y2 = (-b*d + a*Math.sqrt((a**2 + b**2)*circle.r**2 - d**2)) / (a**2 + b**2) + circle.y;

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

        return [new Point(X1, Y1), new Point(X2, Y2)];
    }
}

export {Point, Line, Circle};
export {dist, intrsecLines, intrsecLineAndCircle, intrsecCircleAndLine, intrsecCircles};