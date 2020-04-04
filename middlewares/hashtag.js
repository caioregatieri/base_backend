'use strict'

module.exports = function(req, res, next){
    for (const key in req.query) {
        // console.log(key, req.query[key]);
        req.query[key] = req.query[key].toString().replace(new RegExp('_hashtag_', 'g'), '#');
    }
    // console.log(req.query);
    
    for (const key in req.body) {
        req.body[key] = verificaTipo(req.body[key]);
    }
    // console.log(req.body);
    next();
};

function verificaTipo(valor){
    // console.log(valor, typeof(valor));
    switch(typeof(valor)){
        case "object":
            if (Array.isArray(valor)) {
                return replaceArray(valor);
            } else if (valor != null)  {
                return replaceObject(valor);
            } else {
                return valor;
            }
            break;
        case "string":
            return valor.toString().replace(new RegExp('_hashtag_', 'g'), '#');
        default:
            return valor;
    }
}

function replaceArray(arr){
    arr.forEach(function(el, i){
        arr[i] = verificaTipo(arr[i]);
    });
    return arr;
}

function replaceObject(obj){
    Object.keys(obj).forEach(function(key){
        obj[key] = verificaTipo(obj[key]);
    });
    return obj;
}