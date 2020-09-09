import BrowserSupportCore from "./BrowserSupportCore"

import getVendorPrefixedName from "./getVendorPrefixedName"

var TRANSFORM = getVendorPrefixedName("transform")

var translateDOMPositionXY = (function () {
    if (BrowserSupportCore.hasCSSTransforms()) {
        var ua = global.window ? global.window.navigator.userAgent : "UNKNOWN"
        var isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua)

        if (!isSafari && BrowserSupportCore.hasCSS3DTransforms()) {
            return function (style, x, y) {
                style[TRANSFORM] = "translate3d(" + x + "px," + y + "px,0)"
            }
        } else {
            return function (style, x, y) {
                style[TRANSFORM] = "translate(" + x + "px," + y + "px)"
            }
        }
    } else {
        return function (style, x, y) {
            style.left = x + "px"
            style.top = y + "px"
        }
    }
})()

export default translateDOMPositionXY
