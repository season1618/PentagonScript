import {canvas, ctx, sketches, draw, animation} from './modules/canvas.js';
import {Point, Line, Circle} from './modules/construction.js';
import {dist, intrsecLines, intrsecLineAndCircle, intrsecCircleAndLine, intrsecCircles} from './modules/construction.js';
import {parse} from './modules/parse.js';

let editor = document.getElementById('editor');
let drawButton = document.getElementById('draw');
let playButton = document.getElementById('play');

editor.addEventListener(
    'change',
    function(){
        let codeString = editor.value;
        let codeData = parse(codeString);
        registerSketch(codeData);
    }
)

drawButton.addEventListener(
    'click',
    function(){
        draw(ctx);
    }
);

playButton.addEventListener(
    'click',
    function(){
        animation(ctx);
    }
)

function judgeLine(rName, varName){
    isLine = false;
    let names = Object.keys(varName);
    for(let i = 0; i < names.length; i++){
        for(let j = 0; j < names.length; j++){
            name1 = names[i]; name2 = names[j];
            object1 = varName[name1]; object2 = varName[name2];
            if(object1.type == 'Point' && object2.type == 'Point' && rName == name1 + name2){
                line = new Line(object1, object2);
                let id = Math.max(sketches.indexOf(object1), sketches.indexOf(object2)) + 1;
                sketches.splice(id, 0, line);
                varName[rName] = line;

                isLine = true;
                break;
            }
        }
        if(isLine) break;
    }
    return isLine;
}

function registerSketch(codeData){
    sketches.splice(0, sketches.length);
    let varName = {};
    for(let i = 0; i < codeData.length; i++){
        let lv1Name = codeData[i].lv1Name;
        let lv2Name = codeData[i].lv2Name;
        let op = codeData[i].op;
        let rv1Name = codeData[i].rv1Name;
        let rv2Name = codeData[i].rv2Name;

        // type of right values
        let rv1Type = null, rv2Type = null;
        if(!isNaN(Number(rv1Name))){
            varName[rv1Name] = Number(rv1Name);
            rv1Type = 'number';
        }else if(rv1Name in varName){
            if(typeof(varName[rv1Name]) == 'number') rv1Type = 'number';
            else rv1Type = varName[rv1Name].type;
        }else if(judgeLine(rv1Name, varName)){
            rv1Type = 'Line';
        }else{
            console.log('sentence ' + (i + 1) + ' : ' + rv1Name + ' is undefined.');
            break;
        }
        if(!isNaN(Number(rv2Name))){
            varName[rv2Name] = Number(rv2Name);
            rv2Type = 'number';
        }else if(rv2Name in varName){
            if(typeof(varName[rv2Name]) == 'number') rv2Type = 'number';
            else rv2Type = varName[rv2Name].type;
        }else if(judgeLine(rv2Name, varName)){
            rv2Type = 'Line';
        }else{
            console.log('sentence ' + (i + 1) + ' : ' + rv2Name + ' is undefined.');
            break;
        }

        if(op == '('){
            if(rv1Type == 'number' && rv2Type == 'number'){
                let x = canvas.width / 2 + Number(rv1Name);
                let y = canvas.height / 2 - Number(rv2Name);
                let p = new Point(x, y);
                sketches.push(p);
                varName[lv1Name] = p;
            }
            else if(rv1Type == 'Point' && rv2Type == 'Point'){
                let p1 = varName[rv1Name];
                let p2 = varName[rv2Name];
                let l = new Line(p1, p2);
                sketches.push(l);
                varName[lv1Name] = l;
            }
            else if(rv1Type == 'Point' && rv2Type == 'number'){
                let p = varName[rv1Name];
                let r = varName[rv2Name];
                let c = new Circle(p, r);
                sketches.push(c);
                varName[lv1Name] = c;
            }
            else if(rv1Type == 'Point' && rv2Type == 'Line'){
                let p = varName[rv1Name];
                let r = varName[rv2Name].dist;
                let c = new Circle(p, r);
                sketches.push(c);
                varName[lv1Name] = c;
            }
            else{
                console.log('sentence ' + (i + 1) + ': { ' + rv1Type + ', ' + rv2Type + ' } is invalid.');
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

                if(lv1Name != ''){
                    l.update(p1.x, p1.y);
                    c.update(p1.x, p1.y);
                    sketches.push(p1);
                    varName[lv1Name] = p1;
                }

                if(lv2Name != ''){
                    l.update(p2.x, p2.y);
                    c.update(p2.x, p2.y);
                    sketches.push(p2);
                    varName[lv2Name] = p2;
                }
            }
            else if(rv1Type == 'Circle' && rv2Type == 'Line'){
                let c = varName[rv1Name];
                let l = varName[rv2Name];
                let [p1, p2] = intrsecCircleAndLine(c, l);

                if(lv1Name != ''){
                    l.update(p1.x, p1.y);
                    c.update(p1.x, p1.y);
                    sketches.push(p1);
                    varName[lv1Name] = p1;
                }

                if(lv2Name != ''){
                    l.update(p2.x, p2.y);
                    c.update(p2.x, p2.y);
                    sketches.push(p2);
                    varName[lv2Name] = p2;
                }
            }
            else if(rv1Type == 'Circle' && rv2Type == 'Circle'){
                let c1 = varName[rv1Name];
                let c2 = varName[rv2Name];
                let [p1, p2] = intrsecCircles(c1, c2);

                if(lv1Name != ''){
                    c1.update(p1.x, p1.y);
                    c2.update(p1.x, p1.y);
                    sketches.push(p1);
                    varName[lv1Name] = p1;
                }
                
                if(lv2Name != ''){
                    c1.update(p2.x, p2.y);
                    c2.update(p2.x, p2.y);
                    sketches.push(p2);
                    varName[lv2Name] = p2;
                }
            }
            else{
                console.log('sentence ' + (i + 1) + ': { ' + rv1Type + ', ' + rv2Type + ' } is invalid.');
                break;
            }
        }
    }
}