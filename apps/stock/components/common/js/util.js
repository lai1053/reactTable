import utils from "edf-utils"
export function debounce(func, wait, immediate) {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        if (immediate && !timeout) func.apply(this, args)
        timeout = setTimeout(() => {
            timeout = null
            if (!immediate) func.apply(this, args)
        }, wait)
    }
}
export function flatCol(cols) {
    cols = cols.flatMap(item => {
        if (item.children) {
            item = flatCol(item.children)
        }
        return item
    })
    return cols
}
export function formatSixDecimal(num) {
    if (!num) return 0
    let ret = num
    if (typeof num === "number" || typeof num === "string") {
        num = typeof num === "string" ? transToNum(num) : num
        const condition = String(num).indexOf(".") > -1
        const length = condition && String(num).split(".")[1].length
        const decimalLength = condition ? (length > 6 ? 6 : length) : 0
        ret = utils.number.format(num, decimalLength)
        while (ret.indexOf(".") !== -1 && ret.substr(ret.length - 1, 1) == "0") {
            ret = ret.substr(0, ret.length - 1)
        }
    }
    return ret
}
