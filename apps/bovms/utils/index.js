import { number } from "edf-utils"
/**
 * 数组空值设置：后端框架原因，List数组，需要每个字段都传
 * @Author   weiyang.qiu
 * @DateTime 2019-09-09T09:37:36+0800
 * @param    {array}                 list [description]
 * @return   {array}                      [description]
 */
const setListEmptyVal = list => {
    if (!Array.isArray(list)) {
        return list;
    }
    let listMaxChildKeys = [];
    list.forEach(item => {
        listMaxChildKeys = listMaxChildKeys.concat(Object.keys(item));
    });
    // 去重
    listMaxChildKeys = [...new Set(listMaxChildKeys)];
    list = list.map(m => {
        let _item = {},
            obj = Set.from(Object.keys(m));
        listMaxChildKeys.forEach(k => {
            _item[k] = obj.has(k) ? (m[k] === undefined ? null : m[k]) : null;
        });
        return _item;
    });
    // console.log('setListEmptyVal:', list);
    return list;
};
/**
 * 科目数据是否带有辅助核算
 * @Author   weiyang.qiu
 * @DateTime 2019-10-28T10:10:37+0800
 * @param    {Object}                 res          科目数据
 * @param    {Boolean}                isReturnList 是否返回辅助核算列表
 * @return   {Boolean or Array}                    isReturnList=true 返回辅助核算数组，否则返回是否带有辅助核算
 */
const subjectIncludeAssist = (res, isReturnList) => {
    let calcList =
        Object.keys(res)
            .filter(
                f => f !== "isCalc" && f.indexOf("Calc") > 0 && res[f] === true
            )
            .map(m => m.replace("isCalc", "").toLocaleLowerCase()) || [];
    // 排除数量、外币、外汇核算
    calcList = calcList.filter(
        f => f !== "multi" && f !== "quantity" && f !== "bankaccount"
    );
    if (isReturnList) return calcList;
    return calcList.length > 0 ? true : false;
};
const handleGetModalContainer = () => {
    return document.querySelector(".ant-modal") || document.body;
};
const handleGetTableContainer = node => node.parentNode;
const addEvent = (ele, funName, fun) => {
    // console.log('addEvent:', ele);
    if (!ele) return;
    if (ele.addEventListener) {
        ele.addEventListener(funName, fun, false);
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + funName, fun);
    } else {
        ele["on" + funName] = fun;
    }
};
const removeEvent = (ele, funName, fun) => {
    if (!ele) return;
    if (ele.removeEventListener) {
        ele.removeEventListener(funName, fun, false);
    } else if (win.detachEvent) {
        ele.detachEvent("on" + funName, fun);
    } else {
        ele["on" + funName] = undefined;
    }
};

//生成随机数 用作表格数据UUID
const generatorRandomNum = () => {
    let s = [];
    let hexDigits = "0123456789";
    for (let i = 0; i < 24; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    return parseInt(s.join(''))
}


const quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
    if (quantity !== undefined) {
        if (autoDecimals && quantity) {
            let [a, b] = String(quantity).split(".")
            decimals = Math.max(
                decimals,
                (b !== undefined && b.length) || 0
            )
        }
        return numberFormat(quantity, decimals, isFocus, clearZero)
    }
}

//数量格式化
const numberFormat = (v, decimals, isFocus, clearZero) => {
    if (isFocus === true) return v
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
export default {
    setListEmptyVal,
    subjectIncludeAssist,
    handleGetModalContainer,
    handleGetTableContainer,
    addEvent,
    removeEvent,
    generatorRandomNum,
    quantityFormat
};
