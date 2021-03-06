var _hyphenPattern = /-(.)/g

function camelize(string) {
    return string.replace(_hyphenPattern, function (_, character) {
        return character.toUpperCase()
    })
}

var canUseDOM = !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
)
var memoized = {}
var prefixes = ["Webkit", "ms", "Moz", "O"]
var prefixRegex = new RegExp("^(" + prefixes.join("|") + ")")
var testStyle = canUseDOM ? document.createElement("div").style : {}

function getWithPrefix(name) {
    for (var i = 0; i < prefixes.length; i++) {
        var prefixedName = prefixes[i] + name
        if (prefixedName in testStyle) {
            return prefixedName
        }
    }
    return null
}

/**
 * @param {string} property Name of a css property to check for.
 * @return {?string} property name supported in the browser, or null if not
 * supported.
 */
function getVendorPrefixedName(property) {
    var name = camelize(property)
    if (memoized[name] === undefined) {
        var capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
        if (prefixRegex.test(capitalizedName)) {
            throw new Error(
                "getVendorPrefixedName must only be called with unprefixed" +
                    "CSS property names. It was called with " +
                    property
            )
        }
        memoized[name] = name in testStyle ? name : getWithPrefix(capitalizedName)
    }
    return memoized[name]
}

export default getVendorPrefixedName
