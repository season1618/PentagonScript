import { sketch, setCanvasScale, draw, animation } from './modules/canvas.js';
import { interpreter } from './interpreter/main.js';

let editor = document.getElementById('editor');
let error = document.getElementById('error');
let drawButton = document.getElementById('draw');
let playButton = document.getElementById('play');

editor.addEventListener(
    'change',
    function(){
        setCanvasScale();
        sketch.splice(0, sketch.length);
        interpreter(editor.value);
    }
)

drawButton.addEventListener(
    'click',
    function(){
        draw();
    }
);

playButton.addEventListener(
    'click',
    function(){
        animation();
    }
);