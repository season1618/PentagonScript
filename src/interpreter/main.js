import { tokenize } from './tokenize.js';
import { parse } from './parse.js';
import { execute } from './execute.js';

function interpreter(src){
    let tokenHead = tokenize(src);
    let nodeList = parse(tokenHead);
    execute(nodeList);
}

export { interpreter };