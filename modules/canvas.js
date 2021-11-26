const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth - 10;
canvas.height = document.documentElement.clientHeight - 10;

let sketches = [];

function translate(moveX, moveY){
    for(let i = 0; i < sketches.length; i++){
        sketches[i].translate(moveX, moveY);
    }
}
function scale(mousePosX, mousePosY, scaleRate){
    for(let i = 0; i < sketches.length; i++){
        sketches[i].scale(mousePosX, mousePosY, scaleRate);
    }
}

function draw(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < sketches.length; i++){
        sketches[i].draw(ctx);
    }
}
async function animation(ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < sketches.length; i++){
        await sketches[i].animation(ctx);
    }
}

let canvasScale = 100;
let mousePressed = false;
let mousePosX = 0; let mousePosY = 0;

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
        if(canvasScale < 50 && event.deltaY > 0) return;
        if(1000 < canvasScale && event.deltaY < 0) return;
        scale(mousePosX, mousePosY, (canvasScale - event.deltaY / 10) / canvasScale);
        draw(ctx);
        canvasScale -= event.deltaY / 10;
    }
);

document.getElementById('png').addEventListener(
    'click',
    function(event){
        event.target.href = canvas.toDataURL();
    }
);

document.getElementById('video').addEventListener(
    'click',
    async function(event){
        console.log(canvas.captureStream());       
          
        let stream = canvas.captureStream(24);
        let recorder = new MediaRecorder(stream);
        
        recorder.onstop = function(e) {
            /*console.log("stop.");
        
            blob = new Blob(chunks, {type: 'video/webm;codecs=vp8'});
            let download = document.getElementById('download');
            download.href = URL.createObjectURL(blob);
            console.log("recorder stopped");*/
        }
    
        recorder.ondataavailable = function(e) {
            //chunks.push(e.data);
            let blob = new Blob([e.data], {type: e.data.type});
            let download = document.getElementById('webm');
            download.href = URL.createObjectURL(blob);
        }

        recorder.start();
        await animation(ctx);
        recorder.stop();
    }
);

document.getElementById('webm').addEventListener(
    'click',
    function(event){
        //event.target.href = str;
    }
);

export {canvas, ctx, sketches, draw, animation};