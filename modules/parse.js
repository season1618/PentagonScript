let codeData = [];
let i;
function parse(str){
    i = 0;
    codeData = [];
    while(i < str.length){
        let [lv1Name, lv2Name] = readLeftValue();
        let op = readOperator();
        let [rv1Name, rv2Name] = readRightValue();

        codeData.push({
            lv1Name: lv1Name,
            lv2Name: lv2Name,
            op: op,
            rv1Name: rv1Name,
            rv2Name: rv2Name
        });
    }
}

function readLeftValue(){
    lv1Name = ''; lv2Name = '';
    while(str[i] == ' ') i++;
    if(str[i] == '['){
        while(true){
            if(str[i] == ',') break;
            if(str[i] != ' ') lv1Name += str[i];
            i++;
        }
        i++;
        while(true){
            if(str[i] == '=') break;
            if(str[i] != ' ' && str[i] == ']') lv2Name += str[i];
            i++;
        }
    }else{
        while(true){
            if(str[i] == '=') break;
            if(str[i] != ' ') lv1Name += str[i];
            i++;
        }
    }
    i++;
    return [lv1Name, lv2Name];
}

function readOperator(){
    i++;
    return str[i-1];
}

function readRightValue(){
    rv1Name = ''; rv2Name = '';
    while(true){
        if(str[i] == ',') break;
        if(str[i] != ' ') rv1Name += str[i];
        i++;
    }
    i++;
    while(true){
        if(str[i] == ')' || str[i] == '}') break;
        if(str[i] != ' ') rv2Name += str[i];
        i++;
    }
    i++;
    return [rv1Name, rv2Name];
}

export {codes, parse};