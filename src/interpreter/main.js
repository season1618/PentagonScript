import { tokenize } from './tokenize.js';
import { parse } from './parse.js';

function interpreter(src){
    parse(tokenize(src));
}

export { interpreter };