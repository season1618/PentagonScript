const errorScreen = document.getElementById('error');

function error(msg){
    errorScreen.disabled = false;
    errorScreen.value += msg + '\n';
    errorScreen.disabled = true;
    throw new Error();
}

export { error };