export const TK_TYPE = 0;
export const TK_IDENT = 1;
export const TK_NUM = 2;
export const TK_RESERVED = 3;
export const TK_EOF = 4;

class Token {
    constructor(kind){
        this.kind = kind;
        this.next = null;
    }
    push(token){
        this.next = token;
    }
}

class TokenStr extends Token {
    constructor(kind, str){
        super(kind);
        this.str = str;
    }
}

class TokenNum extends Token {
    constructor(kind, val){
        super(kind);
        this.str = val;
        this.val = val;
    }
}

export { Token, TokenStr, TokenNum };