import { TK_IDENT, TK_NUM, TK_RESERVED, TK_EOF } from './modules/token.js';
import {
    ND_OR, ND_AND, ND_EQ, ND_NE, ND_LT, ND_LE,
    ND_ADD, ND_SUB, ND_MUL, ND_DIV, ND_MOD, ND_NEG, ND_NOT,
    ND_PAIR, ND_IDENT, ND_NUM,
    ND_POINT, ND_LINE, ND_CIRCLE_POINT_LINE, ND_CIRCLE_POINT_RADIUS, ND_LEN, ND_INTRSEC_LINE_LINE, ND_INTRSEC_LINE_CIRCLE, ND_INTRSEC_CIRCLE_LINE, ND_INTRSEC_CIRCLE_CIRCLE, ND_ASSIGN, ND_FUNC_CALL
} from './modules/node.js';
import { NodeBlock, NodeIf, NodeFor, NodeReturn, NodeBinary, NodeUnary, NodeIdent, NodeFuncCall, NodeNum } from './modules/node.js';
import { Var, Func } from './modules/node.js';
import { TY_BOOL, TY_INT, TY_POINT, TY_LINE, TY_CIRCLE, TY_LIST } from './modules/node.js';
import { error } from './modules/error.js';

class SymbolTable {
    constructor(){
        this.top = null;
        this.count = 0;
    }
    push(name, cont){
        for(let item = this.top; item != null; item = item.next){
            if(item.name == name){
                error(name + ' is already defined');
            }
        }
        this.top = { next: this.top, name: name, cont: cont };
        this.count++;
    }
    pop(cnt){
        for(; this.count > cnt; this.count--){
            this.top = this.top.next;
        }
    }
    find(name){
        for(let item = this.top; item != null; item = item.next){
            if(item.name == name){
                return item.cont;
            }
        }
        error(name + ' is undefined');
    }
}

class Stack {
    constructor(){
        this.top = null;
    }
    push(name, val){
        this.top = { next: this.top, name: name, val: val };
    }
    pop(){
        this.top = this.top.next;
    }
}

let cur;
let nodeList;
let table;
let stack;

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
        return token.str;
    }
    error(cur.str + ' is not identifier');
}

function nextType(){
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
        default:
            error(cur.str + ' is not type');
    }
    cur = cur.next;
    return type;
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
    stack = new Stack();
    while(cur.kind != TK_EOF){
        let proc = stmt();
        if(proc != null) nodeList.push(proc);
    }
    return nodeList;
}

function stmt(){
    if(expect('{')){
        let node = new NodeBlock();
        let cnt = table.count;
        while(!expect('}')) node.push(stmt());
        table.pop(cnt);
        return node;
    }
    if(expect('var')){
        if(expect('(')){
            let idents;
            let name = nextIdent();
            if(expect(':'))if(nextType() != TY_POINT) error('the type must be "Point"');
            expect(',');
            let name2 = nextIdent();
            if(expect(':'))if(nextType() != TY_POINT) error('the type must be "Point"');
            table.push(name, new Var(TY_POINT));
            table.push(name2, new Var(TY_POINT));
            expect(')');
            idents = [name, name2];
            expect('=');
            let inits = expr();
            expect(';');

            if(inits.type == TY_LIST) return new NodeBinary(ND_ASSIGN, null, idents, inits);
            error('the types of both sides does not correspond');
        }else{
            let name = nextIdent();
            if(expect('[')){
                name += evalConst(expr());
                expect(']');
            }
            let lType = null;
            if(expect(':')) lType = nextType();
            expect('=');
            let init = expr();
            expect(';');

            let rType = init.type == TY_LIST ? TY_POINT : init.type;
            if(lType == null || lType == rType){
                table.push(name, new Var(rType));
                let ident = [name];
                return new NodeBinary(ND_ASSIGN, null, ident, init);
            }
            error('the types of both sides does not correspond');
        }
    }
    if(expect('func')){
        let name = nextIdent();
        let params = [];
        let cnt = table.count;
        expect('(');
        while(!expect(')')){
            let paramName = nextIdent();
            expect(':');
            let paramType = nextType();
            params.push(new NodeIdent(paramType, paramName));
            table.push(paramName, new Var(paramType));
            if(expect(',')) continue;
            if(expect(')')) break;
        }
        expect(':');
        let type = nextType();
        let proc = stmt();
        table.pop(cnt);
        let func = new Func(params, type, proc);
        table.push(name, func);
        return null;
    }
    if(expect('if')){console.log('helo');
        expect('(');
        let cond = expr();
        expect(')');
        let procIf = stmt();
        let procElse = null;
        if(expect('else')) procElse = stmt();
        return new NodeIf(cond, procIf, procElse);
    }
    if(expect('for')){
        expect('(');
        let name = nextIdent();
        expect('in');
        expect('[');
        let min = nextNum();
        expect(',');
        let max = nextNum();
        expect(']');
        expect(')');
        expect('{');
        let node = new NodeFor();
        let head = cur;
        for(let i = min; i < max; i++){
            cur = head;
            stack.push(name, i);
            while(!expect('}')) node.push(stmt());
            stack.pop();
        }
        return node;
    }
    if(expect('return')){
        let ret = expr();
        expect(';');
        return new NodeReturn(ret);
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
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_OR, TY_BOOL, lhs, rhs);
        else error('invalid types of logical operator "||"');
    }
    return lhs;
}

function and(){
    let lhs = relate();
    while(expect('&&')){
        let rhs = relate();
        if(lhs.type == TY_BOOL && rhs.type == TY_BOOL) lhs = new NodeBinary(ND_AND, TY_BOOL, lhs, rhs);
        else error('invalid types of logical operator "&&"');
    }
    return lhs;
}

function relate(){
    let lhs = add();
    if(expect('==')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_EQ, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "=="');
    }
    if(expect('!=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_NE, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "!="');
    }
    if(expect('<')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_LT, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "<"');
    }
    if(expect('<=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_LE, TY_BOOL, lhs, rhs);
        else error('invalid types of relational operator "<="');
    }
    if(expect('>')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_LT, TY_BOOL, rhs, lhs);
        else error('invalid types of relational operator ">"');
    }
    if(expect('>=')){
        let rhs = add();
        if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_LE, TY_BOOL, rhs, lhs);
        else error('invalid types of relational operator ">="');
    }
    return lhs;
}

function add(){
    let lhs = mul();
    while(true){
        if(expect('+')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_ADD, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "+"');
            continue;
        }
        if(expect('-')){
            let rhs = mul();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_SUB, TY_INT, lhs, rhs);
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
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_MUL, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "*"');
            continue;
        }
        if(expect('/')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_DIV, TY_INT, lhs, rhs);
            else error('invalid type of binary operator "/"');
            continue;
        }
        if(expect('%')){
            let rhs = unary();
            if(lhs.type == TY_INT && rhs.type == TY_INT) lhs = new NodeBinary(ND_MOD, TY_INT, lhs, rhs);
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
        if(op.type == TY_INT) return new NodeUnary(ND_NEG, TY_INT, op);
        else error('invalid type of operator "-"');
    }
    if(expect('!')){
        let op = unary();
        if(op.type == TY_BOOL) return new NodeUnary(ND_NOT, TY_BOOL, op);
        else error('invalid type of operator "-"');
    }
    return prim();
}

function prim(){
    if(expect('(')){
        let node = expr();
        expect(')');
        return node;
    }
    if(expect('Point')){
        expect('(');
        let x = num();
        expect(',');
        let y = num();
        expect(')');
        if(x.type == TY_INT && y.type == TY_INT) return new NodeBinary(ND_POINT, TY_POINT, x, y);
        error('invalid types of arguments');
    }
    if(expect('Line')){
        expect('(');
        let p = expr();
        expect(',');
        let q = expr();
        expect(')')
        if(p.type == TY_POINT && q.type == TY_POINT) return new NodeBinary(ND_LINE, TY_LINE, p, q);
        error('invalid types of arguments');
    }
    if(expect('Circle')){
        expect('(');
        let p = expr();
        expect(',');
        let r = expr();
        expect(')');
        if(p.type == TY_POINT && r.type == TY_INT) return new NodeBinary(ND_CIRCLE_POINT_RADIUS, TY_CIRCLE, p, r);
        if(p.type == TY_POINT && r.type == TY_LINE) return new NodeBinary(ND_CIRCLE_POINT_LINE, TY_CIRCLE, p, r);
        error('invalid types of arguments');
    }
    if(expect('len')){
        expect('(');
        let line = expr();
        expect(')');

        if(line.type == TY_LINE) return new NodeUnary(ND_LEN, TY_INT, line);
        error('invalid type of argument');
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
        let name = nextIdent();
        if(expect('(')){
            let func = table.find(name);
            let type = func.type;
            let params = func.params;
            let args = [];
            while(!expect(')')){
                args.push(expr());
                if(expect(',')) continue;
                if(expect(')')) break;
            }

            if(params.length != args.length) error('the number of arguments does not correspond');
            for(let i = 0; i < params.length; i++){
                if(params[i].type != args[i].type) error(i + ' th argument type is invalid');
            }
            return new NodeFuncCall(type, func, args);
        }
        if(expect('[')){
            name += evalConst(expr());
            expect(']');
        }
        if(stack.top != null && stack.top.name == name) return new NodeIdent(TY_INT, name, stack.top.val);
        let type = table.find(name).type;
        return new NodeIdent(type, name);
    }
    return num();
}

function num(){
    if(expect('-')) return new NodeNum(-nextNum());
    expect('+');
    return new NodeNum(nextNum());
}

function evalConst(node){
    switch(node.kind){
        case ND_NEG:
            return - evalConst(node.operand);
        case ND_IDENT:
            return node.val;
        case ND_NUM:
            return node.val;
    }
    let lhs = evalConst(node.lhs);
    let rhs = evalConst(node.rhs);
    switch(node.kind){
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
    }
    error('it is not immediate constant');
}

export { parse };