const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

let sketch = [];

function translate(moveX, moveY){
    for(let i = 0; i < sketch.length; i++){
        sketch[i].translate(moveX, moveY);
    }
}
function scale(mousePosX, mousePosY, scaleRate){
    for(let i = 0; i < sketch.length; i++){
        sketch[i].scale(mousePosX, mousePosY, scaleRate);
    }
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < sketch.length; i++){
        sketch[i].draw();
    }
}
async function animation(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < sketch.length; i++){
        await sketch[i].animation();
    }
}

let canvasScale = 100;
let mousePressed = false;
let mousePosX = 0;
let mousePosY = 0;

function setCanvasScale(){
    canvasScale = 100;
}

canvas.addEventListener(
    'mousedown',
    function(event){
        mousePressed = true;
        mousePosX = event.clientX;
        mousePosY = event.clientY;
    }
);

canvas.addEventListener(
    'mouseup',
    function(event){
        mousePressed = false;
    }
);

canvas.addEventListener(
    'mousemove',
    function(event){
        if(mousePressed){
            translate(event.clientX - mousePosX, event.clientY - mousePosY);
            draw(ctx);
        }
        mousePosX = event.clientX;
        mousePosY = event.clientY;
    },
    false
);

canvas.addEventListener(
    'wheel',
    function(event){
        if(canvasScale < 30 && event.deltaY > 0) return;
        if(1000 < canvasScale && event.deltaY < 0) return;
        if(event.deltaY < 0) scale(mousePosX, mousePosY, 1.2);
        else scale(mousePosX, mousePosY, 1/1.2);
        draw(ctx);
        canvasScale -= event.deltaY / 20;
    }
);

document.getElementById('png').addEventListener(
    'click',
    function(){
        let anchor = document.createElement('a');
        anchor.href = canvas.toDataURL();
        anchor.download = 'canvas.png';
        anchor.click();
    }
);

// document.getElementById('webm').addEventListener(
//     'click',
//     async function(){          
//         stream = canvas.captureStream(24);
//         var recorder = new MediaRecorder(stream);
        
//         recorder.ondataavailable = function(e) {
//             let blob = new Blob([e.data], {type: e.data.type});
//             let anchor = document.createElement('a');
//             anchor.href = URL.createObjectURL(blob);
//             anchor.download = 'canvas.webm';
//             anchor.click();
//         }

//         recorder.start();
//         await animation(ctx);
//         recorder.stop();
//     }
// );

export {canvas, ctx, sketch, setCanvasScale, draw, animation};