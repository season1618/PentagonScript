import {canvas, ctx, sketches} from './modules/canvas.js';
import {Point, Line, Circle} from './modules/construction.js';
import {dist, intrsecLines, intrsecLineAndCircle, intrsecCircles} from './modules/construction.js';
import {parse} from './modules/parse.js';

let editor = document.getElementById('editor');
let drawButton = document.getElementById('draw');
let playButton = document.getElementById('play');

drawButton.addEventListener(
    'click',
    function(){
        let codeString = editor.value;
        codeData = parse(codeString);
        registerSketch(codeData);
        draw(ctx);
    }
);

playButton.addEventListener(
    'click',
    function(){
        let codeString = editor.value;
        codeData = parse(codeString);
        registerSketch(codeData);
        animation(ctx);
    }
)

function registerSketch(codeData){
    sketches = [];
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
            console.log('sentence ' + (i + 1) + ' : ' + rv1Name + ' is undefined.');
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
                sketches.push(p1);
                sketches.push(p2);
                varName[lv1Name] = p1;
                varName[lv2Name] = p2;
            }
            else if(rv1Type == 'Circle' && rv2Type == 'Line'){
                let c = varName[rv1Name];
                let l = varName[rv2Name];
                l.swap();
                let [p1, p2] = intrsecLineAndCircle(l, c);console.log(l);
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
                console.log('sentence ' + (i + 1) + ': { ' + rv1Type + ', ' + rv2Type + ' } is invalid.');
                break;
            }
        }
    }
}