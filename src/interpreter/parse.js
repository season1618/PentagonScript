import { TK_TYPE, TK_IDENT, TK_NUM, TK_RESERVED, TK_EOF } from './modules/token.js';
import { ND_IF, ND_FOR, ND_RETURN, ND_OR, ND_AND, ND_EQ, ND_NE, ND_LT, ND_LE, ND_ADD, ND_SUB, ND_MUL, ND_DIV, ND_MOD, ND_NEG, ND_NOT, ND_PAIR, ND_IDENT, ND_NUM, ND_POINT, ND_LINE, ND_CIRCLE_POINT_LINE, ND_CIRCLE_POINT_RADIUS, ND_INTRSEC_LINE_LINE, ND_INTRSEC_LINE_CIRCLE, ND_INTRSEC_CIRCLE_LINE, ND_INTRSEC_CIRCLE_CIRCLE, ND_ASSIGN } from './modules/node.js';
import { TY_BOOL, TY_INT, TY_POINT, TY_LINE, TY_CIRCLE, TY_LIST } from './modules/node.js';
import { error } from './modules/error.js';

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

class NodeBinary extends Node {
    constructor(kind, type, lhs, rhs){
        super(kind);
        this.type = type;
        this.lhs = lhs;
        this.rhs = rhs;
    }
}

class NodeUnary extends Node {
    constructor(kind, type, operand){
        super(kind);
        this.type = type;
        this.operand = operand;
    }
}

class NodePair extends Node {
    constructor(first, second){
        super(ND_PAIR);
        this[0] = first;
        this[1] = second;
    }
}
class NodeIdent extends Node {
    constructor(type, name){
        super(ND_IDENT);
        this.type = type;
        this.name = name;
    }
}

class NodeNum extends Node {
    constructor(val){
        super(ND_NUM);
        this.type = TY_INT;
        this.val = val;
    }
}

class SymbolTable {
    constructor(){
        this.top = null;
    }
    add(name, type){
        for(let item = this.top; item != null; item = item.next){
            if(item.name == name){
                error(name + ' is already defined');
            }
        }
        this.top = { next: this.top, name: name, type: type };
    }
    find(name){
        for(let item = this.top; item != null; item = item.next){
            if(item.name == name){
                return item.type;
            }
        }
        error(name + ' is undefined');
    }
}

let cur;
let nodeList;
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
    }
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
    nodeList = [];
    table = new SymbolTable();
    while(cur.kind != TK_EOF){
        nodeList.push(stmt());
    }
    return nodeList;
}

function stmt(){
    if(expect('{')){
        while(!expect('}')) stmt();
        return;
    }
    if(expect('var')){
        if(expect('(')){
            let idents;
            let name = nextIdent().str;
            if(expect(':'))if(nextType() != TY_POINT) error('the type must be "Point"');
            if(expect(',')){
                let name2 = nextIdent().str;
                if(expect(':'))if(nextType() != TY_POINT) error('the type must be "Point"');
                table.add(name, TY_POINT);
                table.add(name2, TY_POINT);
                idents = new NodePair(new NodeIdent(TY_POINT, name), new NodeIdent(TY_POINT, name2));
            }else{
                table.add(name, TY_POINT);
                idents = new NodeIdent(TY_POINT, name);
            }
            expect(')');
            expect('=');
            let inits = expr();
            expect(';');

            if(inits.type == TY_LIST) return new NodeBinary(ND_ASSIGN, null, idents, inits);
            error('the types of both sides does not correspond');
        }else{
            let name = nextIdent().str;
            let lType = null;
            if(expect(':')) lType = nextType();
            expect('=');
            let init = expr();
            expect(';');

            let rType = init.type == TY_LIST ? TY_POINT : init.type;
            if(lType == null || lType == rType){
                table.add(name, rType);
                let ident = new NodeIdent(rType, name);
                return new NodeBinary(ND_ASSIGN, null, ident, init);
            }
            error('the types of both sides does not correspond');
        }
    }
    let node = expr();
    expect(';');
    return node;
}

function expr(){
    return or();
}

function or(){
    let lhs = and();
    while(expect('||')){
        let rhs = and();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_OR, TY_BOOL, lhs, rhs);
        else error('invalid types of logical operator "||"');
    }
    return lhs;
}

function and(){
    let lhs = relate();
    while(expect('&&')){
        let rhs = relate();
        if(lhs.type == TY_BOOL && rhs.type == TY_BOOL) lhs = NodeBinary(ND_AND, TY_BOOL, lhs, rhs);
        else error('invalid types of logical operator "&&"');
    }
    return lhs;
}

function relate(){
    let lhs = add();
    if(expect('==')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_EQ, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "=="');
    }
    if(expect('!=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_NE, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "!="');
    }
    if(expect('<')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_LT, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "<"');
    }
    if(expect('<=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_LE, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "<="');
    }
    if(expect('>')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_LT, TY_BOOL, rhs, lhs);
        else error('invalid types of relational operator ">"');
    }
    if(expect('>=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_LE, TY_BOOL, rhs, lhs);
        else error('invalid types of relational operator ">="');
    }
    return lhs;
}

function add(){
    let lhs = mul();
    while(true){
        if(expect('+')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_ADD, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "+"');
            continue;
        }
        if(expect('-')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_SUB, TY_INT, lhs, rhs);
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
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_MUL, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "*"');
            continue;
        }
        if(expect('/')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_DIV, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "/"');
            continue;
        }
        if(expect('%')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = NodeBinary(ND_MOD, TY_INT, lhs, rhs);
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
        if(op.type == TY_INT) return NodeUnary(ND_NEG, TY_INT, op);
        else error('invalid type of operator "-"');
    }
    if(expect('!')){
        let op = unary();
        if(op.type == TY_BOOL) return NodeUnary(ND_NOT, TY_BOOL, op);
        else error('invalid type of operator "-"');
    }
    return prim();
}

function prim(){
    if(expect('point')){
        expect('(');
        let x = num();
        expect(',');
        let y = num();
        expect(')');
        if(x.type == TY_INT && y.type == TY_INT) return new NodeBinary(ND_POINT, TY_POINT, x, y);
        error('invalid types of arguments');
    }
    if(expect('line')){
        expect('(');
        let p = expr();
        expect(',');
        let q = expr();
        expect(')')
        if(p.type == TY_POINT && q.type == TY_POINT) return new NodeBinary(ND_LINE, TY_LINE, p, q);
        error('invalid types of arguments');
    }
    if(expect('circle')){
        expect('(');
        let p = expr();
        expect(',');
        let r = expr();
        expect(')');
        if(p.type == TY_POINT && r.type == TY_INT) return new NodeBinary(ND_CIRCLE_POINT_RADIUS, TY_CIRCLE, p, r);
        if(p.type == TY_POINT && r.type == TY_LINE) return new NodeBinary(ND_CIRCLE_POINT_LINE, TY_CIRCLE, p, r);
        error('invalid types of arguments');
    }
    if(expect('and')){
        expect('(');
        let X = expr();
        expect(',');
        let Y = expr();
        expect(')')
        
        if(X.type == TY_LINE && Y.type == TY_LINE) return new NodeBinary(ND_INTRSEC_LINE_LINE, TY_POINT, X, Y);
        if(X.type == TY_LINE && Y.type == TY_CIRCLE) return new NodeBinary(ND_INTRSEC_LINE_CIRCLE, TY_LIST, X, Y);
        if(X.type == TY_CIRCLE && Y.type == TY_LINE) return new NodeBinary(ND_INTRSEC_CIRCLE_LINE, TY_LIST, X, Y);
        if(X.type == TY_CIRCLE && Y.type == TY_CIRCLE) return new NodeBinary(ND_INTRSEC_CIRCLE_CIRCLE, TY_LIST, X, Y);
        error('invalid types of arguments');
    }

    if(cur.kind == TK_IDENT){
        let name = nextIdent().str;
        while(expect('[')){
            name += expr().val;
            expect(']');
        }
        let type = table.find(name);
        return new NodeIdent(type, name);
    }
    return num();
}

function num(){
    if(expect('-')) return new NodeNum(-nextNum());
    expect('+');
    return new NodeNum(nextNum());
}

export { parse };