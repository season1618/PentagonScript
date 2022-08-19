export const ND_IF = 0;
export const ND_FOR = 1;
export const ND_RETURN = 2;
export const ND_OR = 4;
export const ND_AND = 5;
export const ND_EQ = 6;
export const ND_NE = 7;
export const ND_LT = 8;
export const ND_LE = 9;
export const ND_ADD = 10;
export const ND_SUB = 11;
export const ND_MUL = 12;
export const ND_DIV = 13;
export const ND_MOD = 14;
export const ND_IDENT = 15;
export const ND_NUM = 16;
export const ND_POINT = 17;
export const ND_LINE = 18;
export const ND_CIRCLE_POINT_LINE = 19;
export const ND_CIRCLE_POINT_RADIUS = 20;
export const ND_INTRSEC_LINE_LINE = 21;
export const ND_INTRSEC_LINE_CIRCLE = 22;
export const ND_INTRSEC_CIRCLE_LINE = 23;
export const ND_INTRSEC_CIRCLE_CIRCLE = 24;
export const ND_ASSIGN = 25;
export const ND_NEG = 26;
export const ND_NOT = 27;
export const ND_PAIR = 28;
export const ND_BLOCK = 29;
export const ND_FUNC_CALL = 30;
export const ND_LEN = 31;

class Node {
    constructor(kind){
        this.kind = kind;
    }
}

class NodeBlock extends Node {
    constructor(){
        super(ND_BLOCK);
        this.proc = [];
    }
    push(node){
        this.proc.push(node);
    }
}

class NodeIf extends Node {
    constructor(cond, procIf, procElse){
        super(ND_IF);
        this.cond = cond;
        this.procIf = procIf;
        this.procElse = procElse;
    }
}

class NodeFor extends Node {
    constructor(){
        super(ND_FOR);
        this.proc = [];
    }
    push(proc){
        this.proc.push(proc);
    }
}

class NodeReturn extends Node {
    constructor(ret){
        super(ND_RETURN);
        this.ret = ret;
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

class NodeIdent extends Node {
    constructor(type, name, val = null){
        super(ND_IDENT);
        this.type = type;
        this.name = name;
        this.val = val;
    }
}

class NodeFuncCall extends Node {
    constructor(type, func, args){
        super(ND_FUNC_CALL);
        this.type = type;
        this.func = func;
        this.args = args;
    }
}

class NodeNum extends Node {
    constructor(val){
        super(ND_NUM);
        this.type = TY_INT;
        this.val = val;
    }
}

class Var {
    constructor(type, val = null){
        this.type = type;
        this.val = val;
    }
}

class Func {
    constructor(params, type, proc){
        this.params = params;
        this.type = type;
        this.proc = proc;
    }
}

export { NodeBlock, NodeIf, NodeFor, NodeReturn, NodeBinary, NodeUnary, NodeIdent, NodeFuncCall, NodeNum };
export { Var, Func };

export const TY_BOOL = 0
export const TY_INT = 1;
export const TY_POINT = 2;
export const TY_LINE = 3;
export const TY_CIRCLE = 4;
export const TY_LIST = 5;