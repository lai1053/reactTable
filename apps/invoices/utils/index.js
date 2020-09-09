import { number } from "edf-utils"
//数量格式化
const numberFormat = (v, decimals, isFocus, clearZero) => {
    if (isFocus === true || isNaN(Number(v))) return v
    let val = number.format(v, decimals)
    //去除小数点后面的0
    if (!isFocus && clearZero === true && typeof val === "string") {
        let [a, b] = val.split(".")
        return b && Number(b)
            ? `${a}.${Number(`0.${b}`)
                  .toString()
                  .slice(2)}`
            : a
    }
    return val
}
/**
 * 金额千分位
 * @Author   weiyang.qiu
 * @DateTime 2019-11-11T10:55:28+0800
 * @param    {string}                 quantity     金额
 * @param    {number}                 decimals     小数点精度
 * @param    {Boolean}                isFocus      是否为焦点位
 * @param    {boolean}                 clearZero    是否清除小数点后的尾零
 * @param    {boolean}                 autoDecimals 是否自适应精度
 * @return   {string}                              千分位后的金额
 */
const quantityFormat = (
    quantity,
    decimals,
    isFocus,
    clearZero,
    autoDecimals
) => {
    if (quantity !== undefined) {
        if (autoDecimals && quantity) {
            let [a, b] = String(quantity).split(".")
            decimals = Math.max(decimals, (b !== undefined && b.length) || 0)
        }
        return numberFormat(quantity, decimals, isFocus, clearZero)
    }
}
/**
 * 添加事件
 * @Author   weiyang.qiu
 * @DateTime 2019-11-11T11:00:36+0800
 * @param    {element}                 ele     元素
 * @param    {string}                 funName 方法名
 * @param    {function}                 fun     方法
 * @return   {undefined}                         无返回值
 */
const addEvent = (ele, funName, fun) => {
    // console.log('addEvent:', ele);
    if (!ele) return
    if (ele.addEventListener) {
        ele.addEventListener(funName, fun, false)
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = fun
    }
}
const removeEvent = (ele, funName, fun) => {
    if (!ele) return
    if (ele.removeEventListener) {
        ele.removeEventListener(funName, fun, false)
    } else if (win.detachEvent) {
        ele.detachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = undefined
    }
}
const flatCols = function(cols) {
    cols = cols.flatMap(item => {
        if (item.children) {
            item = flatCols(item.children)
        }
        return item
    })
    return cols
}
const findDomFromParent = function(selector, className) {
    const dom = document.querySelector(selector)
    if (!dom) return null
    let parent = dom.parentNode,
        result = null
    while (parent) {
        if (parent.className && parent.className.indexOf(className) > -1) {
            result = parent
            parent = null
            break
        }
        parent = parent.parentNode
    }
    return result
}
// 获取全屏change事件名称
const getFullScreenChangeName = () => {
    let name = "fullscreenchange"
    if (document.body.requestFullscreen) {
        return name
    }
    if (document.body.webkitRequestFullscreen) name = "webkit" + name
    if (document.body.mozRequestFullScreen) name = "moz" + name
    if (document.body.msRequestFullscreen) name = "ms" + name
    return name
}
// 退出全屏
const exitFullscreen = () => {
    if (document.exitFullScreen) {
        document.exitFullScreen()
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
    }
}
// 获取当前全屏的元素
const getFullScreenElement = () => {
    return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullscreenElement ||
        document.msFullscreenElement
    )
}
// 开启全屏
const openFullscreen = element => {
    if (!element) return
    if (element.requestFullscreen) {
        element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen()
    }
}
export default {
    addEvent,
    removeEvent,
    numberFormat,
    quantityFormat,
    flatCols,
    findDomFromParent,
    getFullScreenElement,
    getFullScreenChangeName,
    exitFullscreen,
    openFullscreen
}
