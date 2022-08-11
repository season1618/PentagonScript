import { TK_TYPE, TK_IDENT, TK_NUM, TK_RESERVED, TK_EOF } from './modules/token.js';
import { Token, TokenStr, TokenNum } from './modules/token.js';
import { error } from './modules/error.js';

const types = ['Int', 'Point', 'Line', 'Circle'];
const keywords = ['var', 'func', 'if', 'else', 'for', 'in', 'return', 'point', 'line', 'circle', 'and'];
const puncts = ['(', ')', '{', '}', '[', ']', ':', ';', ',', '=', '+', '-', '*', '/', '%']

function isSpace(c){
    return c.match(/\s/);
}

function isDigit(c){
    return c.match(/\d/);
}

function isAlpha(c){
    return c.match(/[A-Za-z]/);
}

function isAlnum(c){
    return c.match(/\w/);
}

function tokenize(src){
    let tokenHead = new Token(TK_RESERVED, '');
    let index = 0;
    let line = 1;
    let cur = tokenHead;
    while(index < src.length){
        if(src[index] == '\n'){
            line++;
            index++;
            continue;
        }
        if(isSpace(src[index])){
            index++;
            continue;
        }
        if(readType()) continue;
        if(readKeyword()) continue;
        if(readPunct()) continue;
        if(isDigit(src[index])){
            cur.push(nextNumber());
            cur = cur.next;
            continue;
        }
        if(isAlpha(src[index])){
            cur.push(nextIdent());
            cur = cur.next;
            continue;
        }
        error('invalid token');
    }
    cur.push(new Token(TK_EOF));
    return tokenHead.next;

    function nextNumber(){
        let val = 0;
        while(isDigit(src[index])){
            val = 10 * val + Number(src[index]);
            index++;
        }
        return new TokenNum(TK_NUM, val);
    }
    
    function nextIdent(){
        let str = '';
        while(isAlnum(src[index])){
            str += src[index];
            index++;
        }
        return new TokenStr(TK_IDENT, str);
    }
    
    function readType(){
        for(let type of types){
            if(src.substr(index, type.length) == type && !isAlnum(src[index + type.length])){
                cur.push(new TokenStr(TK_TYPE, type));
                cur = cur.next;
                index += type.length;
                return true;
            }
        }
        return false;
    }
    
    function readKeyword(){
        for(let keyword of keywords){
            if(src.substr(index, keyword.length) == keyword && !isAlnum(src[index + keyword.length])){
                cur.push(new TokenStr(TK_RESERVED, keyword));
                cur = cur.next;
                index += keyword.length;
                return true;
            }
        }
        return false;
    }
    
    function readPunct(){
        for(let punct of puncts){
            if(src[index] == punct){
                cur.push(new TokenStr(TK_RESERVED, punct));
                cur = cur.next;
                index++;
                return true;
            }
        }
        return false;
    }
}

export { tokenize };