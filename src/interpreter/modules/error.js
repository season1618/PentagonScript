function error(msg){
    console.log(msg);
    throw new Error();
}

export { error };