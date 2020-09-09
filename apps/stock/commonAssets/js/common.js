import { fromJS, toJS } from 'immutable'
import utils from 'edf-utils'
import { fetch } from 'edf-utils'
import React from 'react'
import { Tooltip, Spin, Icon } from 'antd'
import moment from 'moment'

/* 请求存货的前置参数
    @params: {
        "state": 0, --状态 0未开，1开启
        "bInveControl": 0, --是否进行负库存控制 0否 1是
        "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
        "endCostType":0, 以销定产0、传统生产1
        "isGenVoucher":true, 是否结账，未生成 false 生成 true
        "isCompletion":true,是否本月有完工入库单 有 true 没有 false
        "startPeriod":"2019-09", 启用月份
        "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
        "isCarryOverProductCost":false, 结转生产成本凭证，未生成 false 生成 true
        "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
        "inveBusiness",1 --1工业自行生产，0 存商业
    }
*/

/**
 * @description: 获取公共接口信息
 * @param {object} reqParams 请求参数
 * @return {object} 公共接口包含的字段对象
 */ 
const getInfo = async(reqParams) => {
    const resp = await fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', reqParams) // 获取存货设置信息和结转信息
    if (resp) {
        const params = JSON.parse(JSON.stringify(resp))
        return params
    } else {
        console.log('从接口获取不到存货信息')
        return {}
    }
}

const getPeriod =(currentOrg)=>{
    let time = ''
    const { name, periodDate } = currentOrg
    const sessionTime = sessionStorage['stockPeriod'+ name]
    if (sessionTime != "undefined" && sessionTime) {
        time = sessionTime
    } else {
        const currentTime = periodDate
        sessionStorage['stockPeriod' + name] = currentTime
        time = currentTime
    }
    return time
}

/**
 * @description: 获取当前存货管理页面所选择的会计期间
 * @return {string} 存货页面所选择的会计期间
 */ 
const getCurrentPeriod = (currentOrg) => {
    let  {name, periodDate} = currentOrg
    let currentPeriod = sessionStorage['stockPeriod' + name]  // 取sessionStorage的时间
    if(!currentPeriod || currentPeriod == 'undefined'){       // 如果sessionStorage没有时间，那么取当前单户传入的时间
        currentPeriod = periodDate && periodDate || ''
    }
    return currentPeriod  
}

const HelpIcon = (text, pos) => {
    const place = pos ? pos : 'bottom'
    return  <Tooltip 
        placement={place} 
        title={text} 
        arrowPointAtCenter={true} 
        overlayClassName='stock-helpIcon-tooltip stock-help-icon-tooltip'> 
            <span className="stock-help-icon-img"/>
    </Tooltip>
}

const FifoIcon = (text, flag, pos) => {
    const place = pos ? pos : 'bottom'
    return  <Tooltip 
        placement={place} 
        title={text} 
        arrowPointAtCenter={true} 
        overlayClassName='stock-helpIcon-tooltip stock-help-icon-tooltip'> 
            <span className={flag ? 'fifo-icon-complete' : 'fifo-icon-not-complete'}/>
    </Tooltip>
}

const WarningTip = (tips, pos) => {
    const place = pos ? pos : 'right'
    return <Tooltip 
        placement={place} 
        title={tips} 
        arrowPointAtCenter={true} 
        overlayClassName='stock-warning-tooltip stock-help-icon-tooltip'> 
            <Icon
                name='waringIcon'
                fontFamily='warning-icon'
                type='exclamation-circle'
                className='warning-icon'
            />
    </Tooltip>
}

const stockLoading = (param) => {
    let {isShow, size, tips, delay} = Object.prototype.toString.call(param)==='[object Object]' ? {...param} : {}
    let loading = (isShow === true || isShow===false) ? isShow : true
    return <Spin 
        className='ttk-stock-app-inventory-picking-fast-spin-icon'
        wrapperClassName='spin-box add-stock-orders purchase-ru-ku-add-alert'
        spinning={loading } 
        size={size || 'large'} 
        tips={tips || '数据加载中...'} 
        delay={delay || 10}
    />
}

const switchPage = (to, from, params, fromName) => {
    if(fromPath){
        params.path = from.toString()
    }
    this.component.props.setPortalContent 
        && this.component.props.setPortalContent(fromName || '', to, {params: {...params}})
    this.component.props.onlyCloseContent
        && this.component.props.onlyCloseContent(from)
}

 /* 获取list的值 */
const getList = function(name) {
    const list = this.metaAction.gf(`data.${name}`) && this.metaAction.gf(`data.${name}`).toJS() || []
    return list.slice(0)
}

/* 设置list的值 */
const setList = function(list) {
    this.metaAction.sf('data.list', fromJS(list))
}

const transToNum = (numStr) => {
    let ret = numStr && numStr.toString().replace(/\,/g,'') || 0
    return parseFloat(ret)
}
 
/* 处理数据 */
var dealWithData = (item, needNegative) => {
    const regExp1 = new RegExp('Num'), 
          regExp2 = new RegExp('Price'), 
          regExp3 = new RegExp('Balance'),
          copyItem = {...item}
    let  negativeItem

    for (const v in item) {  // 格式化数据
        if (regExp3.test(v) || v === 'diffCost') {
            // copyItem[v] = utils.number.format(item[v], 2) 
            copyItem[v] = transToNum(copyItem[v]) ? utils.number.format(item[v], 2) : '' 
        } else if (regExp1.test(v) || regExp2.test(v)) {
            // copyItem[v] = formatSixDecimal(item[v])
            copyItem[v] = transToNum(copyItem[v]) ? formatSixDecimal(item[v]) : ''
            if (v === 'qmNum' && item[v] < 0) {
                negativeItem = {...item}
            }      
        }
    }
    const ret = needNegative ? { copyItem, negativeItem } : copyItem
    return ret
}

 
var formatSixDecimal = (num) => {
    if (!num) return 0
    let ret = num
    if (typeof (num) === 'number' || typeof(num) ==='string') {
        num = typeof(num) === 'string' ? transToNum(num) : num
        const condition = String(num).indexOf('.') > -1
        const length = condition && String(num).split('.')[1].length
        const decimalLength = condition ? (length > 6 ? 6 : length) : 0 
        ret = utils.number.format(num, decimalLength)
    }
    return ret 
}

/**
 * @description: 表格必填项标题之前需要在表头添加红色小星星 
 * @param {string} title 表头的文案
 * @return reactNode
 */ 
const addMustStar = (title) => {
    const icon = React.createElement('i', {className:'icon-isMust'}, '*')
    const ele = React.createElement('span', {className:'title-text'}, [title, icon])
    return ele
}

const deepClone = (obj) => {
    //进行深拷贝的不能为空，并且是对象或者是
    if (obj && typeof obj === "object") {
        var objClone = Array.isArray(obj) ? [] : {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === "object") {
                    objClone[key] = deepClone(obj[key]);
                } else {
                    objClone[key] = obj[key];
                }
            }
        }
        if (Array.isArray(obj) && obj.length===0) {
            return []
        }
        return objClone
    }
    return obj
}

/**
 * @description: 生成凭证单据时间 
 * @param {string} 会计期间，格式类似于 '2020-01
 * @return {string} 如果生成凭证属于本月，则取生成凭证当天的日期；如果生成的凭证不属于本月，那么生成凭证的日期为其所属的会计期间的最后一天
 */ 
const getVoucherDate = (time) => {
    let rkDate = time, natureDate = moment() //当前自然月
    if (rkDate) {
        if (natureDate.isSame( rkDate , 'month')) {
            rkDate = natureDate.format('YYYY-MM-DD')
        } else {
            rkDate = moment( rkDate ).endOf('month').format('YYYY-MM-DD')
        }
    }
    return rkDate
}

/**
 * @description: 暂估入库单生成凭证单据时间 
 * @param {string} 会计期间，格式类似于 '2020-01
 * @return {string} 如果生成凭证属于本月，则取生成凭证当天的日期；如果生成的凭证不属于本月，那么生成凭证的日期为其所属的会计期间的第一天
 */ 
const getVoucherDateZGRK = (time) => {
    let rkDate = time, natureDate = moment() //当前自然月
    if(rkDate && natureDate.isSame( rkDate , 'month')) {
        rkDate = natureDate.startOf('month').format('YYYY-MM-DD')
        
    }else {
        rkDate = moment( rkDate ).startOf('month').format('YYYY-MM-DD')
    }
    return rkDate
}

const isStatus200 = (result) => {
    const type = Object.prototype.toString.call(result)
    const typeArr = [
        '[object Object]',
        '[object Array]',
        '[object String]',
        '[object Number]',
        '[object Date]',
        '[object Boolean]',
        '[object RegExp]',
    ]
    return typeArr.indexOf(type) !== -1 ? result : false
}

const addEvent = (ele, funName, fun) => {
    if (!ele) return
    if (ele.addEventListener) {
        ele.addEventListener(funName, fun, false)
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + funName, fun)
    } else {
        ele["on" + funName] = fun;
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


const denyClick = (_this, toPage) => {
    toPage = toPage && toPage || 'subject-match'
    if (!_this[`${toPage}ClickFlag`]) {
        _this[`${toPage}ClickFlag`] = true
        setTimeout(() => { _this[`${toPage}ClickFlag`] = false }, 5000)
        return true
    } else {
        return false
    }
}


class canClickFactory {
    constructor(){
        this.canClickTargets={}
    }
    getCanClickTarget = name => this.canClickTargets[name]
    setCanClickTarget = (name, boolStatus)=> {
        const ret = typeof(boolStatus) === 'boolean'
        if(ret) {
            if(boolStatus){
                this.canClickTargets[name] = true
            }else{
                clearTimeout(this.canClickTimer)
                this.canClickTimer = setTimeout(()=>{
                    delete this.canClickTargets[name]
                },2000)
            }
        }else{
            delete this.canClickTargets[name]
        }
    }
}

const canClickTarget = new canClickFactory()


const timerCall = (_this, timerName, fn, fnParamArr) => {
    if(!_this || !timerName || !fn) return
    if(!_this['timer']){
        _this['timer'] = {}
    }
    if(!fnParamArr){
        fnParamArr = []
    }else if(fnParamArr && Object.prototype.toString.call(fnParamArr)!='[object Array]'){
        fnParamArr = [fnParamArr]
    }
    clearTimeout(_this['timer'][timerName])
    _this['timer'][timerName] = setTimeout(()=>{
        if(Object.prototype.toString.call(fn)==="[object Function]"){
            fn.call(_this, ...fnParamArr)
        }else{
            console.log(`${timerName}定时器中没有回调函数`)
        }   
    }, 500)
}

// 禁用时间
/**
 * @description: 单据日前选择控件DatePicker禁用的时间
 * @param {关键} 当前页面的 this 
 * @param {moment} currentDate 当前选中的日期
 * @param {string} datePath 当前会计期间对应的保存字段
 * @param {string} dateTime 指定的会计期间，格式类似于"2020-01"
 * @return 可选期间范围
 */ 
const billDisabledDate = (_this, currentDate, datePath, dateTime) => {
    let currentMonth = ''
    if(datePath && typeof(datePath)=='string' && datePath.trim()!='' ){
        currentMonth = _this.metaAction.gf(datePath)

    }else if(dateTime && typeof(dateTime)=='string'){
        currentMonth = dateTime
    } 
    const flag1 = currentDate.valueOf() <= moment(currentMonth).startOf('month').valueOf()
    const flag2 = currentDate.valueOf() >= moment(currentMonth).endOf('month').valueOf()
    return currentDate && ( flag1 || flag2 )
}

const getClientSize=()=>{
    const body = document.body
    let modalHeight = body.clientHeight - 80
    let modalWidth = body.clientWidth - 50
    if(modalHeight>1920) modalWidth = 1920
    const modalBodyStyle = {
        overflow: 'auto',
        maxHeight: (modalHeight - 47 - 55) + 'px',
    }
    return { modalHeight, modalWidth, modalBodyStyle }
}

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
    return list;
}

const flatten = (col)=>{
    col = col.flatMap((x)=>{
        if(x.children && x.children.length!==0){
            x = flatten(x.children)
        }
        return x
    })
    return col
}

const formatNumber = (num, precise)=>{
    num = transToNum(num)
    switch(precise){
        case 6:
            num = formatSixDecimal(num)
            break   
        default:
            num = num = utils.number.format(num, precise)
    }
    return num
}

const numFixed = (num, digit)=>{
    num = transToNum(num)
    num = Math.round( num*Math.pow(10, digit)) / Math.pow(10, digit)
    return num
}

export default {
    getList,
    setList,
    setListEmptyVal,
    switchPage,
    dealWithData,
    formatSixDecimal,
    transToNum,
    getInfo,
    addMustStar,
    HelpIcon,
    WarningTip,
    stockLoading,
    getVoucherDate,
    getVoucherDateZGRK,
    deepClone,
    isStatus200,
    addEvent,
    removeEvent,
    getCurrentPeriod,
    formatNumbe,
    denyClick,
    billDisabledDate,
    timerCall,
    getClientSize,
    FifoIcon,
    canClickTarget,
    flatten,
    formatNumber,
    getPeriod,
    numFixed
}
