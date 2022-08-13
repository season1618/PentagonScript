import { sketch } from '../modules/canvas.js';
import { Point, Line, Circle } from '../modules/construction.js';
import { intrsecLines, intrsecLineAndCircle, intrsecCircleAndLine, intrsecCircles } from '../modules/construction.js';
import { ND_IF, ND_FOR, ND_RETURN, ND_EXPR, ND_OR, ND_AND, ND_EQ, ND_NE, ND_LT, ND_LE, ND_ADD, ND_SUB, ND_MUL, ND_DIV, ND_MOD, ND_NEG, ND_NOT, ND_PAIR, ND_IDENT, ND_NUM, ND_POINT, ND_LINE, ND_CIRCLE_POINT_LINE, ND_CIRCLE_POINT_RADIUS, ND_INTRSEC_LINE_LINE, ND_INTRSEC_LINE_CIRCLE, ND_INTRSEC_CIRCLE_LINE, ND_INTRSEC_CIRCLE_CIRCLE, ND_ASSIGN } from './modules/node.js';
import { TY_BOOL, TY_INT, TY_POINT, TY_LINE, TY_CIRCLE, TY_LIST } from './modules/node.js';

let map;

class SymbolMap {
    constructor(){
    }
    add(name, val){
        this[name] = val;
    }
    find(name){
        if(name in this) return this[name];
        else error(name + ' is undefined');
    }
}

function execute(nodeList){
    map = new SymbolMap();

    for(let i = 0; i < nodeList.length; i++){
        let node = nodeList[i];
        execStmt(node);
    }
}

function execStmt(node){
    switch(node.kind){
        case ND_ASSIGN:{
            let ident = node.lhs;
            let init = execExpr(node.rhs);
            if(ident.kind == ND_IDENT){
                if(node.rhs.type == TY_LIST){
                    init[0].lhs.update(init[0].x, init[0].y);
                    init[0].rhs.update(init[0].x, init[0].y);
                    map.add(ident.name, init[0]);
                }else{
                    map.add(ident.name, init);
                }
            }else{
                for(let i = 0; i < 2; i++){
                    init[i].lhs.update(init[i].x, init[i].y);
                    init[i].rhs.update(init[i].x, init[i].y);
                    map.add(ident[i].name, init[i]);
                }
            }
            return;
        }
    }
    execExpr(node);
}

function execExpr(node){
    switch(node.kind){
        case ND_NEG:
            return - execExpr(node.operand);
        case ND_NOT:
            return !execExpr(node.operand);
        case ND_IDENT:
            return map.find(node.name);
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
            let circle = new Circle(lhs, rhs.dist);
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