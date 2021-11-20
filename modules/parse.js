let codeData = [];
let i;
function parse(str){
    i = 0;
    codeData = [];
    while(i < str.length){
        let [lv1Name, lv2Name] = readLeftValue(str);
        let op = readOperator(str);
        let [rv1Name, rv2Name] = readRightValue(str);

        codeData.push({
            lv1Name: lv1Name,
            lv2Name: lv2Name,
            op: op,
            rv1Name: rv1Name,
            rv2Name: rv2Name
        });
    }
}

function readLeftValue(str){
    lv1Name = ''; lv2Name = '';
    while(str[i] == ' ' || str[i] == '\n') i++;
    if(str[i] == '['){
        i++;
        while(true){
            if(str[i] == ',') break;
            if(str[i] != ' ' && str[i] != '\n') lv1Name += str[i];
            i++;
        }
        i++;
        while(true){
            if(str[i] == '=') break;
            if(str[i] != ' ' && str[i] != '\n' && str[i] != ']') lv2Name += str[i];
            i++;
        }
    }else{
        while(true){
            if(str[i] == '=') break;
            if(str[i] != ' ' && str[i] != '\n') lv1Name += str[i];
            i++;
        }
    }
    i++;
    return [lv1Name, lv2Name];
}

function readOperator(str){
    while(str[i] == ' ' || str[i] == '\n') i++;
    i++;
    return str[i-1];
}

function readRightValue(str){
    rv1Name = ''; rv2Name = '';
    while(true){
        if(str[i] == ',') break;
        if(str[i] != ' ' && str[i] != '\n') rv1Name += str[i];
        i++;
    }
    i++;
    while(true){
        if(str[i] == ';') break;
        if(str[i] != ' ' && str[i] != '\n' && str[i] != ')' && str[i] != '}') rv2Name += str[i];
        i++;
    }
    i++;
    return [rv1Name, rv2Name];
}

export {codeData, parse};