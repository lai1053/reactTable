import utils from 'edf-utils'

function formatNumbe(value, key) {
    let number = value
    if (number) {
        if (number.constructor == String) {
            number = number.replace(/,/g, "")
        }
        number = parseFloat(number)
        if (key >= 0) {
            number = utils.number.format(number, key)
        }
    } else {
        number = 0
    }
  
    return number
}

function removeZero (num) {
    num = num.constructor == String ? num : num.toString()
    let numn = num.replace(/,/g, "")
    let length = numn.length
    while (parseFloat(numn.substr(0, length - 1)) === parseFloat(numn)) {
        num = num.substr(0, num.length - 1)
        length --
    }
    return num
}

export default {
    formatNumbe,
    removeZero
}