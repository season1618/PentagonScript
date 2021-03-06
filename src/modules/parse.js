let i;
function parse(str){
    i = 0;
    let codeData = [];
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
    return codeData;
}

function readLeftValue(str){
    let lv1Name = '', lv2Name = '';
    while(i < str.length){
        if(str[i] == ',') break;
        if(str[i] == '='){
            i++;
            return [lv1Name, lv2Name];
        }
        if(str[i] != ' ' && str[i] != '\n') lv1Name += str[i];
        i++;
    }
    i++;
    while(i < str.length){
        if(str[i] == '=') break;
        if(str[i] != ' ' && str[i] != '\n') lv2Name += str[i];
        i++;
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
    let rv1Name = '', rv2Name = '';
    while(i < str.length){
        if(str[i] == ',') break;
        if(str[i] != ' ' && str[i] != '\n') rv1Name += str[i];
        i++;
    }
    i++;
    while(i < str.length){
        if(str[i] == ';') break;
        if(str[i] != ' ' && str[i] != '\n' && str[i] != ')' && str[i] != '}') rv2Name += str[i];
        i++;
    }
    i++;
    return [rv1Name, rv2Name];
}

export {parse};