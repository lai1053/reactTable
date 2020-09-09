import utils from 'edf-utils'

function formatNumbe(value, key) {
    let number = value
    if (number) {
        if (number.constructor == String) {
            number = number.replace(/,/g, "")
        }
        number = parseFloat(number);
        if (key >= 0) {
            number = utils.number.format(number, key)
        }
    } else {
        number = 0
    }
    return number
}

// 取数据的绝对值
function formatnum(value) {
    let number = formatNumbe(value)
    if (number < 0) {
        number = Math.abs(number)
    }
    return number
}

function formatprice(value, key) {
    let number = value
    if (key) {
        number = formatNumbe(value, key)
    } else {
        number = formatNumbe(value)
    }
    if (number < 0) {
        number = Math.abs(number)
    }
    return number
}

const deepClone = (obj)=> {
    //进行深拷贝的不能为空，并且是对象或者是
    if (obj && typeof obj === "object") {
        var objClone = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
            if (obj[key] && typeof obj[key] === "object") {
                objClone[key] = deepClone(obj[key]);
            } else {
                objClone[key] = obj[key];
            }
            }
        }
        if(Array.isArray(obj) && obj.length===0){
            return []
        }
        return objClone;
    }
    return obj;
}

export default {
    formatNumbe,
    formatnum,
    formatprice,
    deepClone
}