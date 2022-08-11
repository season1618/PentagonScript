import { ctx, sketches, setCanvasScale, draw, animation } from './modules/canvas.js';
import { interpreter } from './interpreter/main.js';

let editor = document.getElementById('editor');
let error = document.getElementById('error');
let drawButton = document.getElementById('draw');
let playButton = document.getElementById('play');

editor.addEventListener(
    'change',
    function(){
        setCanvasScale();
        sketches.splice(0, sketches.length);
        interpreter(editor.value);console.log(sketches);
    }
)

drawButton.addEventListener(
    'click',
    function(){
        draw(ctx);
    }
);

playButton.addEventListener(
    'click',
    function(){
        animation(ctx);
    }
);