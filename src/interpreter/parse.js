import { Point, Line, Circle } from '../modules/construction.js';
import { intrsecLines, intrsecLineAndCircle, intrsecCircleAndLine, intrsecCircles } from '../modules/construction.js';
import { TK_TYPE, TK_IDENT, TK_NUM, TK_RESERVED, TK_EOF } from './modules/token.js';
import { error } from './modules/error.js';
import { sketches } from '../modules/canvas.js';

const ND_IF = 0;
const ND_FOR = 1;
const ND_RETURN = 2;
const ND_EXPR = 3;
const ND_POINT = 4;
const ND_LINE = 5;
const ND_CIRCLE = 6;

const TY_BOOL = 0
const TY_INT = 1;
const TY_POINT = 2;
const TY_LINE = 3;
const TY_CIRCLE = 4;
const TY_LIST = 5;

class Node {
    constructor(kind){
        this.kind = kind;
    }
}

class NodeIf extends Node {
    constructor(kind, cond, cont1, cont2){
        super(kind);
    }
}

class NodeExpr extends Node {
    constructor(type, val){
        super(ND_EXPR);
        this.type = type;
        this.val = val;
    }
}

class SymbolTable {
    constructor(){
    }
    add(name, type, cont){
        if(name in this) error(name + ' is already defined');
        else this[name] = { type: type, val: cont };
    }
    find(name){
        if(name in this) return this[name];
        else error(name + ' is undefined');
    }
}

let cur;
let table;

function expect(str){
    if(cur.kind != TK_NUM && cur.str == str){
        cur = cur.next;
        return true;
    }
    return false;
}

function nextIdent(){
    if(cur.kind == TK_IDENT){
        let token = cur;
        cur = cur.next;
        return token;
    }
    error(cur.str + ' is not identifier');
}

function nextType(){
    if(cur.kind == TK_TYPE){
        let type;
        switch(cur.str){
            case 'Int':
                type = TY_INT;
                break;
            case 'Point':
                type = TY_POINT;
                break;
            case 'Line':
                type = TY_LINE;
                break;
            case 'Circle':
                type = TY_CIRCLE;
                break;
        }
        cur = cur.next;
        return type;
    }console.log(cur);
    error(cur.str + ' is not type');
}

function nextNum(){
    if(cur.kind == TK_NUM){
        let val = cur.val;
        cur = cur.next;
        return val;
    }
    error(cur.str + ' is not a number');
}

function parse(tokenHead){
    cur = tokenHead;
    table = new SymbolTable();
    while(cur.kind != TK_EOF){
        stmt();
    }
}

function stmt(){
    if(expect('{')){
        while(!expect('}')) stmt();
        return;
    }
    if(expect('var')){
        if(expect('(')){
            let names = [];
            let types = [];
            while(true){
                names.push(nextIdent().str);
                if(expect(':')) types.push(nextType());
                else types.push(null);
                if(expect(',')) continue;
                if(expect(')')) break;
            }
            expect('=');
            let inits = expr();
            if(inits.type == TY_LIST) inits = inits.val;
            else error('rvalue is not a list');

            if(names.length != inits.length){
                error('the number of left value and right value does not correspond');
            }

            for(let i = 0; i < names.length; i++){
                if(types[i] == null || types[i] == inits[i].type){
                    table.add(names[i], inits[i].type, inits[i].val);
                    inits[i].val.lhs.update(inits[i].val.x, inits[i].val.y);
                    inits[i].val.rhs.update(inits[i].val.x, inits[i].val.y);
                    sketches.push(inits[i].val);
                }else{
                    error('assignment between the different types');
                }
            }
        }else{
            let name = nextIdent().str;
            let type = null;
            if(expect(':')) type = nextType();
            expect('=');
            let init = expr();
            if(init.type == TY_LIST){
                init = init.val[0];
                init.val.lhs.update(init.val.x, init.val.y);
                init.val.rhs.update(init.val.x, init.val.y);
                sketches.push(init.val);
            }
            if(type == null || type == init.type) table.add(name, init.type, init.val);
            else error('assignment between the different types');
        }
        expect(';');
        return;
    }
    expr();
    expect(';');
}

function expr(){
    return or();
}

function or(){
    let lhs = and();
    while(expect('||')){
        let rhs = and();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val || rhs.val);
        else error('invalid types of logical operator "||"');
    }
    return lhs;
}

function and(){
    let lhs = relate();
    while(expect('&&')){
        let rhs = relate();
        if(lhs.type == TY_BOOL && rhs.type == TY_BOOL) return NodeExpr(TY_BOOL, lhs.val && rhs.val);
        else error('invalid types of logical operator "&&"');
    }
    return lhs;
}

function relate(){
    let lhs = add();
    if(expect('==')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val == rhs.val);
        else error('invalid types of relational operator "=="');
    }
    if(expect('!=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val != rhs.val);
        else error('invalid types of relational operator "!="');
    }
    if(expect('<')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val < rhs.val);
        else error('invalid types of relational operator "<"');
    }
    if(expect('<=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val <= rhs.val);
        else error('invalid types of relational operator "<="');
    }
    if(expect('>')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val > rhs.val);
        else error('invalid types of relational operator ">"');
    }
    if(expect('>=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) return NodeExpr(TY_BOOL, lhs.val >= rhs.val);
        else error('invalid types of relational operator ">="');
    }
    return lhs;
}

function add(){
    let lhs = mul();
    while(true){
        if(expect('+')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs.val += rhs.val;
            else error('invalid type of binary operator "+"');
            continue;
        }
        if(expect('-')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs.val -= rhs.val;
            else error('invalid type of binary operator "-"');
            continue;
        }
        return lhs;
    }
}

function mul(){
    let lhs = unary();
    while(true){
        if(expect('*')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs.val *= rhs.val;
            else error('invalid type of binary operator "*"');
            continue;
        }
        if(expect('/')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs.val /= rhs.val;
            else error('invalid type of binary operator "/"');
            continue;
        }
        if(expect('%')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs.val %= rhs.val;
            else error('invalid type of binary operator "%"');
            continue;
        }
        return lhs;
    }
}

function unary(){
    if(expect('+')){
        let op = unary();
        if(op.type == TY_INT) return op;
        else error('invalid type of operator "+"');
    }
    if(expect('-')){
        let op = unary();
        if(op.type == TY_INT){
            op.val = - op.val;
            return op;
        }
        else error('invalid type of operator "-"');
    }
    if(expect('!')){
        let op = unary();
        if(op.type == TY_BOOL){
            op.val ^= 1;
            return op;
        }
        else error('invalid type of operator "-"');
    }
    return prim();
}

function prim(){
    if(expect('(')){
        let list = [];
        while(true){
            list.push(expr());
            if(expect(',')) continue;
            if(expect(')')) break;
        }
        return new NodeExpr(TY_LIST, list);
    }
    if(expect('point')){
        expect('(');
        let x = num();
        expect(',');
        let y = num();
        expect(')');
        if(x.type == TY_INT && y.type == TY_INT){
            let point = new Point(x.val, y.val);
            sketches.push(point);
            return new NodeExpr(TY_POINT, point);
        }
        else error('invalid types of arguments');
    }
    if(expect('line')){
        expect('(');
        let p = expr();
        expect(',');
        let q = expr();
        expect(')')
        if(p.type == TY_POINT && q.type == TY_POINT){
            let line = new Line(p.val, q.val);
            sketches.push(line);
            return new NodeExpr(TY_LINE, line);
        }
        else error('invalid types of arguments');
    }
    if(expect('circle')){
        expect('(');
        let p = expr();
        expect(',');
        let r = expr();
        if(r.type == TY_LINE) r = new NodeExpr(TY_INT, r.val.dist);
        expect(')');
        if(p.type == TY_POINT && r.type == TY_INT){
            let circle = new Circle(p.val, r.val);
            sketches.push(circle);
            return new NodeExpr(TY_CIRCLE, circle);
        }
        else error('invalid types of arguments');
    }
    if(expect('and')){
        expect('(');
        let X = expr();
        expect(',');
        let Y = expr();
        expect(')')
        
        if(X.type == TY_LINE && Y.type == TY_LINE){
            let point = intrsecLines(X.val, Y.val);
            return new NodeExpr(TY_POINT, point);
        }
        if(X.type == TY_LINE && Y.type == TY_CIRCLE){
            let [point1, point2] = intrsecLineAndCircle(X.val, Y.val);
            return new NodeExpr(TY_LIST, [new NodeExpr(TY_POINT, point1), new NodeExpr(TY_POINT, point2)]);
        }
        if(X.type == TY_CIRCLE && Y.type == TY_LINE){
            let [point1, point2] = intrsecCircleAndLine(X.val, Y.val);
            return new NodeExpr(TY_LIST, [new NodeExpr(TY_POINT, point1), new NodeExpr(TY_POINT, point2)]);
        }
        if(X.type == TY_CIRCLE && Y.type == TY_CIRCLE){
            let [point1, point2] = intrsecCircles(X.val, Y.val);
            return new NodeExpr(TY_LIST, [new NodeExpr(TY_POINT, point1), new NodeExpr(TY_POINT, point2)]);
        }
        error('invalid types of arguments');
    }

    if(cur.kind == TK_IDENT){
        let name = nextIdent().str;
        while(expect('[')){
            name += expr().val;
            expect(']');
        }
        let { type: type, val: val } = table.find(name);
        return new NodeExpr(type, val);
    }
    return num();
}

function num(){
    if(expect('-')) return new NodeExpr(TY_INT, -nextNum());
    expect('+');
    return new NodeExpr(TY_INT, nextNum());
}

export { parse };