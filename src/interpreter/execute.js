import { sketch } from '../modules/canvas.js';
import { Point, Line, Circle } from '../modules/construction.js';
import { intrsecLines, intrsecLineAndCircle, intrsecCircleAndLine, intrsecCircles } from '../modules/construction.js';
import {
    ND_BLOCK, ND_IF, ND_FOR, ND_RETURN,
    ND_OR, ND_AND, ND_EQ, ND_NE, ND_LT, ND_LE,
    ND_ADD, ND_SUB, ND_MUL, ND_DIV, ND_MOD, ND_NEG, ND_NOT,
    ND_PAIR, ND_IDENT, ND_NUM,
    ND_POINT, ND_LINE, ND_CIRCLE_POINT_LINE, ND_CIRCLE_POINT_RADIUS, ND_LEN, ND_INTRSEC_LINE_LINE, ND_INTRSEC_LINE_CIRCLE, ND_INTRSEC_CIRCLE_LINE, ND_INTRSEC_CIRCLE_CIRCLE, ND_ASSIGN, ND_FUNC_CALL
} from './modules/node.js';
import { TY_LIST } from './modules/node.js';

let table;
let stack;

class SymbolTable {
    constructor(){
        this.top = null;
        this.num = 0;
    }
    push(name, val){
        this.top = { next: this.top, name: name, val: val };
        this.num++;
    }
    pop(num){
        for(; this.num > num; this.num--){
            this.top = this.top.next;
        }
    }
    find(name){
        for(let item = this.top; item != null; item = item.next){
            if(item.name == name){
                return item.val;
            }
        }
    }
}

class Stack {
    constructor(){
        this.top = null;
    }
    push(val){
        this.top = { next: this.top, val: val };
    }
    pop(){
        let val = this.top.val;
        this.top = this.top.next;
        return val;
    }
}

function execute(nodeList){
    table = new SymbolTable();
    stack = new Stack();

    for(let i = 0; i < nodeList.length; i++){
        let node = nodeList[i];
        execStmt(node);
    }
}

function execFunc(func){
    let params = func.params;
    let num = table.num;
    for(let i = 0; i < params.length; i++){
        table.push(params[i].name, stack.pop());
    }
    execStmt(func.proc);
    table.pop(num);
}

function execStmt(node){
    switch(node.kind){
        case ND_BLOCK:{
            let proc = node.proc;
            let num = table.num;
            for(let i = 0; i < proc.length; i++){
                execStmt(proc[i]);
            }
            table.pop(num);
            return;
        }
        case ND_ASSIGN:{
            let ident = node.lhs;
            let init = execExpr(node.rhs);
            if(node.rhs.type == TY_LIST){
                for(let i = 0; i < ident.length; i++){
                    init[i].lhs.update(init[i].x, init[i].y);
                    init[i].rhs.update(init[i].x, init[i].y);
                    table.push(ident[i], init[i]);
                }
            }else{
                table.push(ident[0], init);
            }
            return;
        }
        case ND_IF:
            if(execExpr(node.cond)){
                execStmt(node.procIf);
                return;
            }
            if(node.procElse != null){
                execStmt(node.procElse);
            }
            return;
        case ND_FOR:{
            let proc = node.proc;
            for(let i = 0; i < proc.length; i++){
                execStmt(proc[i]);
            }
            return;
        }
        case ND_RETURN:
            stack.push(execExpr(node.ret));
            return;
    }
    execExpr(node);
}

function execExpr(node){
    switch(node.kind){
        case ND_NEG:
            return - execExpr(node.operand);
        case ND_NOT:
            return !execExpr(node.operand);
        case ND_LEN:
            return execExpr(node.operand).length;
        case ND_IDENT:
            return table.find(node.name);
        case ND_FUNC_CALL:{
            let func = node.func;
            let args = node.args;
            for(let i = args.length - 1; i >= 0; i--){
                stack.push(execExpr(args[i]));
            }
            execFunc(func);
            return stack.pop();
        }
        case ND_NUM:
            return node.val;
    }

    let lhs = execExpr(node.lhs);
    let rhs = execExpr(node.rhs);
    switch(node.kind){
        case ND_OR:
            return lhs || rhs;
        case ND_AND:
            return lhs && rhs;
        case ND_EQ:
            return lhs == rhs;
        case ND_NE:
            return lhs != rhs;
        case ND_LT:
            return lhs < rhs;
        case ND_LE:
            return lhs <= rhs;
        case ND_ADD:
            return lhs + rhs;
        case ND_SUB:
            return lhs - rhs;
        case ND_MUL:
            return lhs * rhs;
        case ND_DIV:
            return lhs / rhs;
        case ND_MOD:
            return lhs % rhs;
        case ND_POINT:{
            let point = new Point(lhs, rhs);
            sketch.push(point);
            return point;
        }
        case ND_LINE:{
            let line = new Line(lhs, rhs);
            sketch.push(line);
            return line;
        }
        case ND_CIRCLE_POINT_RADIUS:{
            let circle = new Circle(lhs, rhs);
            sketch.push(circle);
            return circle;
        }
        case ND_CIRCLE_POINT_LINE:{
            let circle = new Circle(lhs, rhs.length);
            sketch.push(circle);
            return circle;
        }
        case ND_INTRSEC_LINE_LINE:
            return intrsecLines(lhs, rhs);
        case ND_INTRSEC_LINE_CIRCLE:
            return intrsecLineAndCircle(lhs, rhs);
        case ND_INTRSEC_CIRCLE_LINE:
            return intrsecCircleAndLine(lhs, rhs);
        case ND_INTRSEC_CIRCLE_CIRCLE:
            return intrsecCircles(lhs, rhs);
    }
}

export { execute };