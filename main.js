import {canvas, ctx, sketches} from './modules/canvas.js';
import {Point, Line, Circle} from './modules/construction.js';
import {dist, intrsecLines, intrsecLineAndCircle, intrsecCircles} from './modules/construction.js';
import {codeData, parse} from './modules/parse.js';

codeString = 'p1 = (-100, 0);\np2 = (100, 0);\nd = {p1, p2};\nl1 = (p1, p2);\nc1 = (p1, 150);\nc2 = (p2, 150);\n[p3, p4] = {c1, c2};\nl2 = (p3, p4);\np5 = {l1, l2};\nc3 = (p5, d);';
parse(codeString);





/*p1 = new Point(canvas.width/2 - 100, canvas.height/2 - 0); // (-100, 0)
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
sketches.push(p15);sketches.push(l4);sketches.push(l5);sketches.push(l6);sketches.push(l7);*/

let varName = {};
for(let i = 0; i < codeData.length; i++){
    let lv1Name = codeData[i].lv1Name;
    let lv2Name = codeData[i].lv2Name;
    let op = codeData[i].op;
    let rv1Name = codeData[i].rv1Name;
    let rv2Name = codeData[i].rv2Name;

    let rv1Type, rv2Type;
    if(!isNaN(Number(rv1Name))){
        varName[rv1Name] = Number(rv1Name);
        rv1Type = 'number';
    }
    else if(rv1Name in varName){
        if(typeof(varName[rv1Name]) == 'number') rv1Type = 'number';
        else rv1Type = varName[rv1Name].type;
    }
    else{
        console.log('sentence ' + i + 1 + ' : ' + rv1Name + ' is undefined.');
        break;
    }
    if(!isNaN(Number(rv2Name))){
        varName[rv2Name] = Number(rv2Name);
        rv2Type = 'number';
    }
    else if(rv2Name in varName){
        if(typeof(varName[rv2Name]) == 'number') rv2Type = 'number';
        else rv2Type = varName[rv2Name].type;
    }
    else{
        console.log('sentence ' + i + 1 + ' : ' + rv2Name + ' is undefined.');
        break;
    }

    if(op == '('){
        if(rv1Type == 'number' && rv2Type == 'number'){
            let x = canvas.width / 2 + Number(rv1Name);
            let y = canvas.height / 2 - Number(rv2Name);
            p = new Point(x, y);
            sketches.push(p);
            varName[lv1Name] = p;
        }
        else if(rv1Type == 'Point' && rv2Type == 'Point'){
            let p1 = varName[rv1Name];
            let p2 = varName[rv2Name];
            l = new Line(p1, p2);
            sketches.push(l);
            varName[lv1Name] = l;
        }
        else if(rv1Type == 'Point' && rv2Type == 'number'){
            let p = varName[rv1Name];
            let r = varName[rv2Name];
            c = new Circle(p, r);
            sketches.push(c);
            varName[lv1Name] = c;
        }
        else{
            console.log('sentence ' + i + 1 + ': { ' + rv1Type + ', ' + rv2Type + ' } is invalid.');
            break;
        }
    }
    else if(op == '{'){
        if(rv1Type == 'Point' && rv2Type == 'Point'){
            let p1 = varName[rv1Name];
            let p2 = varName[rv2Name];
            let d = dist(p1, p2);
            varName[lv1Name] = d;
        }
        else if(rv1Type == 'Line' && rv2Type == 'Line'){
            let l1 = varName[rv1Name];
            let l2 = varName[rv2Name];
            let p = intrsecLines(l1, l2);
            sketches.push(p);
            varName[lv1Name] = p;
        }
        else if(rv1Type == 'Line' && rv2Type == 'Circle'){
            let l = varName[rv1Name];
            let c = varName[rv2Name];
            let [p1, p2] = intrsecLineAndCircle(l, c);
            sketches.push(p1);
            sketches.push(p2);
            varName[lv1Name] = p1;
            varName[lv2Name] = p2;
        }
        else if(rv1Type == 'Circle' && rv2Type == 'Circle'){
            let c1 = varName[rv1Name];
            let c2 = varName[rv2Name];
            let [p1, p2] = intrsecCircles(c1, c2);
            sketches.push(p1);
            sketches.push(p2);
            varName[lv1Name] = p1;
            varName[lv2Name] = p2;
        }
        else{
            console.log('sentence ' + i + 1 + ': { ' + rv1Type + ', ' + rv2Type + ' } is invalid.');
            break;
        }
    }
}

draw(ctx);
//animation();