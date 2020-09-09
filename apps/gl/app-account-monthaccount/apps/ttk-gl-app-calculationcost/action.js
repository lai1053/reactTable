import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { FormDecorator, DataGrid, Input, Checkbox } from 'edf-component'
import { fromJS } from "immutable"
import { number } from 'edf-utils'
import execExpressEngine from '../../common/execExpressEngine';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let { initData } = this.component.props
        initData.fullAmountCalcType = '0'
        injections.reduce('init', initData)
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        this.load(initData)
    }

    load = async (initData) => {
        let response = await this.webapi.calculationcost.init(initData)
        if (response) {
            if (initData.businessType == 5000040005) {
                response.spshow = `对应收入:${number.toFixedLocal(response.incomeAmount, 2)}    结转比例:${response.proportion}%    结转成本总额为:${number.toFixedLocal(response.costAmount, 2)}`
            } else if (initData.businessType == 5000040026) {
                response.spshow = `原材料本月科目余额:${number.toFixedLocal(response.incomeAmount, 2)}    结转领料成本比例:${response.proportion}%    结转领料成本总额为:${number.toFixedLocal(response.costAmount, 2)}`
            } else {
                response.spshow = `销售成本结转比例: ${response.proportion || 100}%    本期销售收入: ${this.amountFormat(response.incomeAmountDouble, 2)}    预计本期销售成本: ${this.amountFormat(response.finishAmountDouble, 2)}    生产成本余额: ${this.amountFormat(response.costAmountDouble, 2)}    成本分配系数(预计本期销售成本/生产成本余额): ${response.productProportion || 0}`
            }
        }
        this.injections.reduce('load', response)
    }

    handleFieldChange = async (path, value) => {
        this.injections.reduce('update', { path, value })
    }

    isShow = (type) => {
        const { initData } = this.component.props
        if (type == 'spshow') {
            return initData.carryForwardMode == '5000090001' || initData.businessType == '5000040024' ? true : false
        } else {
            return initData.carryForwardMode == '5000090003' && initData.businessType == 5000040005 ? true : false
        }
    }

    /**
     * 领料结转选择
     */
    isShowPickingType = () => {
        const { initData } = this.component.props
        return initData && initData.businessType == '5000040026' ? true : false
    }

    /**
     * 列的排序 asc desc
     */
    onSortChange = async (key, value, type) => {
        let details = this.metaAction.gf('data.form.details')
        if (value && details && details.size > 0) {
            let sortedList, resList, topTwoList
            if (value == 'asc') {
                if (type == "produce") {
                    topTwoList = details.slice(0, 2)
                    details = details.skip(2)
                }
                sortedList = details.sortBy((val, index, obj) => {
                    return val.get(key)
                }, (a, b) => {
                    if (a < b) {
                        return -1
                    }
                    if (a > b) {
                        return 1
                    }
                    if (a === b) {
                        return 0
                    }
                })
            } else {
                if (type == "produce") {
                    topTwoList = details.slice(0, 2)
                    details = details.skip(2)
                }
                sortedList = details.sortBy((val, index, obj) => {
                    return val.get(key)
                }, (a, b) => {
                    if (a < b) {
                        return 1
                    }
                    if (a > b) {
                        return -1
                    }
                    if (a === b) {
                        return 0
                    }
                })
            }
            resList = type == "produce" ? fromJS([...topTwoList.toJS(), ...sortedList.toJS()]) : sortedList
            if (resList && resList.size > 0) {
                // this.injections.reduce('update', { path: 'data.form.details', value: resList })
                let oldList = this.metaAction.gf('data.saveFilterList')
                const newLists = this.autoMergeDeep(oldList, resList)
                this.injections.reduce('updateDetails', { details: resList, newLists })
            }
        }
        this.injections.reduce('sortReduce', { key, value })
    }

    /**
     * 暂估入库
     */
    preAddClick = async () => {
        const path = 'data.other.showPreAdd',
            showPreAdd = this.metaAction.gf(path)
        if (showPreAdd) {
            this.injections.reduce('update', { path, value: false })
            await this.batchCalcQuantityAmount(false)
        } else {
            this.injections.reduce('update', { path, value: true })
            await this.batchCalcQuantityAmount(true)
        }
    }

    /**
     * 渲染查询条件
     */
    renderCheckBox = () => {
        const { initData } = this.component.props
        return (
            <Checkbox.Group>
                <Checkbox value="1" >{initData.businessType == 5000040026 ? "隐藏结转成本为0的材料" : "隐藏结转成本为0的存货"}</Checkbox>
            </Checkbox.Group>
        )
    }

    /**
     * 刷新
     */
    refresh = async () => {
        const prevValue = this.metaAction.gf('data.searchValue').toJS()
        this.searchParamLists({ ...prevValue })
    }
    /**
     * 设置值
     */
    setField = (path, value) => {
        value = value.replace(/\s*/g, "")
        this.metaAction.sf(path, value)
    }
    /**
     * 模糊查找
     */
    onSearch = async (value) => {
        const prevValue = this.metaAction.gf('data.searchValue').toJS()
        this.searchParamLists({ ...prevValue })
    }

    /**
     * 查询
     */
    searchValueChange = (value) => {
        const prevValue = this.metaAction.gf('data.searchValue').toJS()
        if (value) {
            this.metaAction.sfs({
                'data.searchValue': fromJS({ ...prevValue, ...value })
            })
        }
        this.searchParamLists({ ...prevValue, ...value })
    }

    /**
     * 查询筛选数据
     */
    searchParamLists = (searchValue) => {
        //隐藏结转为0的金额
        const isHideAmountZero = searchValue.hideAmountZero.length < 1 ? false : true
        //存货科目
        const inventorys = searchValue.inventorys
        let details = this.metaAction.gf('data.form.details'),
            oldList = this.metaAction.gf('data.saveFilterList'),
            resList = [], condtionAmountZeros = [],
            simpleType = searchValue.simpleType,
            simpleValue = searchValue.simpleValue,
            { initData } = this.component.props,
            topTwoList = [],
            maxCol
        details = oldList

        //高级查询
        if (initData.businessType == 5000040024) {//生产入库结转            
            topTwoList = details.filter(element => element.get('code') == '账面金额' || element.get('code') == '待分配金额').toJS()
            if (topTwoList.length == 2) {
                topTwoList = details.slice(0, 2).toJS()
            }
            details = details.splice(0, 2) //改变原始数组
            const headList = this.metaAction.gf('data.other.headList')
            //生产成本合计列
            maxCol = headList.last().get('code')
        }
        if (!isHideAmountZero && inventorys.length < 1) {
            resList = details.toJS()
        } else {
            if (isHideAmountZero && inventorys.length < 1) {
                if (initData.businessType == 5000040024) {
                    condtionAmountZeros = details.filter(element => parseFloat(element.get('costMap').get(maxCol)) != 0).toJS()
                } else {
                    condtionAmountZeros = details.filter(element => parseFloat(element.get('subAmount')) != 0).toJS()
                }

            }
            if (isHideAmountZero && inventorys.length > 0) {
                for (let index = 0; index < details.size; index++) {
                    const v = details.get(index)
                    let index = inventorys.findIndex(element => element == v.get('code'))
                    const subAmount = initData.businessType == 5000040024
                        ? parseFloat(v.get('costMap').get(maxCol))
                        : parseFloat(v.get('subAmount'))
                    if (index > -1 && subAmount != 0) {
                        resList.push(v.toJS())
                    }
                }
            }
            if (!isHideAmountZero && inventorys.length > 0) {
                for (let index = 0; index < details.size; index++) {
                    const v = details.get(index)
                    let index = inventorys.findIndex(element => element == v.get('code'))
                    if (index > -1) {
                        resList.push(v.toJS())
                    }
                }
            }
        }
        //高级查询
        const advanceSearchLists = [...condtionAmountZeros, ...resList]
        let simpleSearchLists = []
        if (simpleValue) {
            for (let index = 0; index < advanceSearchLists.length; index++) {
                const element = advanceSearchLists[index];
                if (simpleType == 'code' && element[simpleType].indexOf(simpleValue) == 0) {
                    simpleSearchLists.push(element)
                } else if (simpleType == 'name' && element[simpleType].indexOf(simpleValue) != -1) {
                    simpleSearchLists.push(element)
                } else if (simpleType == 'amount') {
                    let cols = Object.keys(element).filter(x => x.toLowerCase().indexOf('amount') > -1)
                    for (let _index = 0; _index < cols.length; _index++) {
                        const key = cols[_index]
                        if (element[key] === parseFloat(simpleValue)) {
                            simpleSearchLists.push(element)
                            break
                        }
                    }
                } else if (simpleType == 'quantity') {
                    let cols = Object.keys(element).filter(x => x.toLowerCase().indexOf('quantity') > -1)
                    for (let _index = 0; _index < cols.length; _index++) {
                        const key = cols[_index]
                        if (element[key] === parseFloat(simpleValue)) {
                            simpleSearchLists.push(element)
                            break
                        }
                    }
                }
            }

            this.metaAction.sfs({
                'data.form.details': fromJS([...topTwoList, ...simpleSearchLists])
            })
        } else {
            this.metaAction.sfs({
                'data.form.details': fromJS([...topTwoList, ...advanceSearchLists])
            })
        }
    }
    /**
     * 查询重置
     */
    clearValueChange = (value) => {
        this.metaAction.sfs({
            'data.searchValue.inventorys': [],
            'data.searchValue.hideAmountZero': []
        })
    }

    getSearchCard = (childrenRef) => {
        this.searchCard = childrenRef
    }

    /**
     * 金额格式化
     */
    amountFormat = (amount, decimals, isFocus, clearZero = false) => {
        if (!amount) {
            return '0.00'
        } else if (amount) {
            if (typeof amount == "string") {
                amount = amount.replace(/,/g, '')
                amount = Number(amount)
            }
            return this.voucherAction.numberFormat(amount, decimals, isFocus, clearZero)
        }
    }

    /**
     * 数量格式化
     */
    quantityFormat = (quantity, decimals, isFocus, clearZero = false) => {
        if (!quantity) {
            return '0'
        } else if (quantity) {
            if (typeof quantity == "string") {
                quantity = quantity.replace(/,/g, '')
                quantity = Number(quantity)
            }
            return this.voucherAction.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }

    /**
    * 批量计算金额和数量
    */
    batchCalcQuantityAmount = async (isPreAdd) => {
        let details = this.metaAction.gf('data.form.details'),
            { initData } = this.component.props,
            { carryForwardMode } = initData
        if (details && details.size < 1) {
            return
        }
        if (isPreAdd) {
            for (let index = 0; index < details.size; index++) {
                const element = details.get(index)
                const endQuantity = parseFloat(element.get('endQuantity') || 0),
                    endAmount = parseFloat(element.get('endAmount') || 0)
                if (endQuantity < 0 && !element.get('editState')) {
                    details = details.update(index, item =>
                        item.set('preAddQuantity', number.toFixedLocal(-endQuantity, 2))
                    )
                    details = details.update(index, item =>
                        item.set('endQuantity', number.toFixedLocal(0, 2))
                    )
                }
                if (endAmount < 0 && !element.get('editState')) {
                    details = details.update(index, item =>
                        item.set('preAddAmount', number.toFixedLocal(-endAmount, 2))
                    )
                    details = details.update(index, item =>
                        item.set('endAmount', number.toFixedLocal(0, 2))
                    )
                }
                if (element.get('editState')) {
                    if (carryForwardMode == 5000090002) {
                        details = this.setQuantityAmount('preAddAmount', index, element.toJS(), details, parseFloat(element.get('preAddAmount') || 0), isPreAdd)
                    } else {
                        details = this.setQuantityAmount('preAddQuantity', index, element.toJS(), details, parseFloat(element.get('preAddQuantity') || 0), isPreAdd)
                        details = this.setQuantityAmount('preAddAmount', index, element.toJS(), details, parseFloat(element.get('preAddAmount') || 0), isPreAdd)
                    }
                }

            }
        } else {
            for (let index = 0; index < details.size; index++) {
                const element = details.get(index)
                const preAddQuantity = parseFloat(element.get('preAddQuantity') || 0),
                    preAddAmount = parseFloat(element.get('preAddAmount') || 0)
                if (preAddQuantity != 0 && !element.get('editState')) {
                    details = details.update(index, item =>
                        item.set('endQuantity', number.toFixedLocal(-preAddQuantity, 2))
                    )
                    details = details.update(index, item =>
                        item.set('preAddQuantity', number.toFixedLocal(0, 2))
                    )
                }
                if (preAddAmount != 0 && !element.get('editState')) {
                    details = details.update(index, item =>
                        item.set('endAmount', number.toFixedLocal(-preAddAmount, 2))
                    )
                    details = details.update(index, item =>
                        item.set('preAddAmount', number.toFixedLocal(0, 2))
                    )
                }
                if (element.get('editState')) {
                    if (carryForwardMode == 5000090002) {
                        details = this.setQuantityAmount('subQuantity', index, element.toJS(), details, parseFloat(element.get('subQuantity') || 0), isPreAdd)
                    } else {
                        details = this.setQuantityAmount('subQuantity', index, element.toJS(), details, parseFloat(element.get('subQuantity') || 0), isPreAdd)
                        details = this.setQuantityAmount('subAmount', index, element.toJS(), details, parseFloat(element.get('subAmount') || 0), isPreAdd)
                    }
                }
            }
        }
        let oldList = this.metaAction.gf('data.saveFilterList')
        const newLists = this.autoMergeDeep(oldList, details)
        this.injections.reduce('updateDetails', { details, newLists })
    }
    /**
     * 本期结转成本、暂估入库结转计算
     */
    calcQuantityAmount = (col, rowIndex, rowData) => (v) => {
        if (typeof v == "string") {
            v = v.replace(/,/g, '')
            v = Number(v)
        }
        let details = this.metaAction.gf('data.form.details'),
            showPreAdd = this.metaAction.gf('data.other.showPreAdd')
        if (col.indexOf('Amount') > -1) {
            if (Number(v) > 9999999999.99) {
                v = 9999999999.99
            }
            if (Number(v) < - 9999999999.999999) {
                v = -9999999999.99
            }
            if (col == 'preAddAmount' && rowData.isCalcQuantity) {
                v = Number(rowData['preAddQuantity']) < 0 ? -Math.abs(v) : Number(rowData['preAddQuantity']) > 0 ? Math.abs(v) : Number(v)
            }
            if (col == 'subAmount' && rowData.isCalcQuantity) {
                v = Number(rowData['subQuantity']) < 0 ? -Math.abs(v) : Number(rowData['subQuantity']) > 0 ? Math.abs(v) : Number(v)
            }
            details = this.setQuantityAmount(col, rowIndex, rowData, details, v, showPreAdd)
            details = details.update(rowIndex, item =>
                item.set(col, number.toFixedLocal(parseFloat(v), 2))
            )
            details = details.update(rowIndex, item =>
                item.set('editState', true)
            )
        } else {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
            if (Number(v) < - 9999999999.999999) {
                v = -9999999999.999999
            }
            if (col == 'preAddQuantity') {
                v = Number(rowData['preAddAmount']) < 0 ? -Math.abs(v) : Number(rowData['preAddAmount']) > 0 ? Math.abs(v) : Number(v)
            }
            if (col == 'subQuantity') {
                v = Number(rowData['subAmount']) < 0 ? -Math.abs(v) : Number(rowData['subAmount']) > 0 ? Math.abs(v) : Number(v)
            }
            details = this.setQuantityAmount(col, rowIndex, rowData, details, v, showPreAdd)
            details = details.update(rowIndex, item =>
                item.set(col, number.toFixedLocal(parseFloat(v), 6))
            )
            details = details.update(rowIndex, item =>
                item.set('editState', true)
            )
        }
        let oldList = this.metaAction.gf('data.saveFilterList')
        const newLists = this.autoMergeDeep(oldList, details)
        this.injections.reduce('updateDetails', { details, newLists })
    }

    /**
     * 计算数量和金额
     */
    setQuantityAmount = (col, rowIndex, rowData, details, curValue, showPreAdd) => {
        let express = '', expressPrice = '',
            { initData } = this.component.props,
            { businessType, carryForwardMode } = initData,
            proportion = initData.proportion || 0,
            precentProportion = proportion != 0 ? proportion / 100 : 0,
            beginQuantity = rowData.beginQuantity || 0,
            addQuantity = rowData.addQuantity || 0,
            preAddQuantity = rowData.preAddQuantity || 0,
            subQuantity = rowData.subQuantity || 0,
            beginAmount = rowData.beginAmount || 0.00,
            addAmount = rowData.addAmount || 0.00,
            subAmount = rowData.subAmount || 0.00,
            preAddAmount = rowData.preAddAmount || 0.00
        /*
             1 无暂估情况 结转成本单价 =（期初金额 + 本期金额）/（期初数量+本期数量）
             2 有暂估情况 暂估数据 = 出负数余额情况等于余额和数量的相反数（默认的）允许用户修改，此处不单独计算暂估的单价
             3 单价 =（期初金额 + 本期金额 + 暂估的金额）/（期初数量+本期数量+暂估的数量），加入到本期结转销售成本列项目内回显（数量字段之前）
             4 本期结转销售成本金额 = 单价 * 数量（数量可编辑，成本金额不可编辑）
             5 期初+本期入库+暂估入库-本期结转=结转后余额
         */
        //计算金额
        if (col.indexOf('Amount') > -1) {
            let endAmount = 0.00, endQuantity = 0
            if (showPreAdd) {
                if (col == 'preAddAmount') {
                    //当前编辑暂估金额列                   
                    express = businessType == 5000040026 && carryForwardMode == 5000090001
                        ? '((beginAmount+addAmount)*precentProportion)+curValue-subAmount' //领料结转-按比例结转
                        : 'beginAmount+addAmount+curValue-subAmount' //其他结转方式的处理                  
                    if (carryForwardMode == 5000090002 && rowData.isCalcQuantity) {
                        expressPrice = '(beginAmount+addAmount+curValue)/(beginQuantity+addQuantity+preAddQuantity)'
                        const den = execExpressEngine('beginQuantity+addQuantity+preAddQuantity', { beginQuantity, addQuantity, preAddQuantity }).getResult()
                        let subPrice = 0
                        if (Number(den) != 0) {
                            const price = execExpressEngine(expressPrice, { beginAmount, addAmount, curValue, beginQuantity, addQuantity, preAddQuantity }).getResult()
                            subPrice = number.toFixedLocal(parseFloat(price), 6)
                        }
                        details = details.update(rowIndex, item =>
                            item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                        )
                        subAmount = execExpressEngine('subQuantity*subPrice', { subQuantity, subPrice }).getResult()
                    }
                } else {
                    //当前编辑的结转金额列                    
                    express = businessType == 5000040026 && carryForwardMode == 5000090001
                        ? '((beginAmount+addAmount)*precentProportion)+preAddAmount-curValue' //领料结转-按比例结转
                        : 'beginAmount+addAmount+preAddAmount-curValue' //其他结转方式的处理                     
                    if (carryForwardMode == 5000090002 && rowData.isCalcQuantity) {
                        expressPrice = '(beginAmount+addAmount+preAddAmount)/(beginQuantity+addQuantity+preAddQuantity)'
                        const den = execExpressEngine('beginQuantity+addQuantity+preAddQuantity', { beginQuantity, addQuantity, preAddQuantity }).getResult()
                        let subPrice = 0
                        if (Number(den) != 0) {
                            const price = execExpressEngine(expressPrice, { beginAmount, addAmount, preAddAmount, beginQuantity, addQuantity, preAddQuantity }).getResult()
                            subPrice = number.toFixedLocal(parseFloat(price), 6)
                            //反算结转数量                     
                            subQuantity = execExpressEngine('curValue/subPrice', { curValue, subPrice }).getResult()
                            //更新余额数量
                            endQuantity = execExpressEngine('beginQuantity+addQuantity-subQuantity', { beginQuantity, addQuantity, subQuantity }).getResult()

                            details = details.update(rowIndex, item =>
                                item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                            )
                            details = details.update(rowIndex, item =>
                                item.set('subQuantity', number.toFixedLocal(parseFloat(subQuantity), 6))
                            )
                            details = details.update(rowIndex, item =>
                                item.set('endQuantity', number.toFixedLocal(parseFloat(endQuantity), 6))
                            )
                        }
                    }
                }

            } else {
                //期初+本期入库-本期结转=结转后余额 
                express = businessType == 5000040026 && carryForwardMode == 5000090001
                    ? '((beginAmount+addAmount)*precentProportion)-curValue'
                    : 'beginAmount+addAmount-curValue'
                if (carryForwardMode == 5000090002 && rowData.isCalcQuantity) {
                    expressPrice = '(beginAmount+addAmount)/(beginQuantity+addQuantity)'
                    const den = execExpressEngine('beginQuantity+addQuantity', { beginQuantity, addQuantity, preAddQuantity }).getResult()
                    let subPrice = 0
                    if (Number(den) != 0) {
                        const price = execExpressEngine(expressPrice, { beginAmount, addAmount, beginQuantity, addQuantity }).getResult()
                        subPrice = number.toFixedLocal(parseFloat(price), 6)
                        //录入本期结转金额列，需要反算数量
                        subQuantity = execExpressEngine('curValue/subPrice', { curValue, subPrice }).getResult()
                        details = details.update(rowIndex, item =>
                            item.set('subQuantity', number.toFixedLocal(parseFloat(subQuantity), 6))
                        )
                        //更新余额数量
                        endQuantity = execExpressEngine('beginQuantity+addQuantity-subQuantity', { beginQuantity, addQuantity, subQuantity }).getResult()
                        details = details.update(rowIndex, item =>
                            item.set('endQuantity', number.toFixedLocal(parseFloat(endQuantity), 6))
                        )
                    }
                }
            }
            const data = { beginAmount, addAmount, precentProportion, preAddAmount, curValue, subAmount }
            endAmount = execExpressEngine(express, data).getResult() || 0.00
            details = details.update(rowIndex, item =>
                item.set('endAmount', number.toFixedLocal(parseFloat(endAmount), 2))
            )
        }

        //计算数量
        if (col.indexOf('Quantity') > -1 && rowData.isCalcQuantity) {
            let endAmount = 0.00, endQuantity = 0
            if (showPreAdd) {
                if (col == 'preAddQuantity') {
                    express = businessType == 5000040026 && carryForwardMode == 5000090001
                        ? '((beginQuantity+addQuantity)*precentProportion)+curValue-subQuantity'//领料结转按比例结转计算公式
                        : 'beginQuantity+addQuantity+curValue-subQuantity'
                    if (carryForwardMode == 5000090002) {
                        /**
                         * 显示暂估入库，当前编辑“暂估入库数量列”
                        * 需要计算结转单价，单价变化->联动计算结转金额->结转后余额
                         */
                        expressPrice = '(beginAmount+addAmount+preAddAmount)/(beginQuantity+addQuantity+curValue)'
                        const den = execExpressEngine('beginQuantity+addQuantity+curValue', { beginQuantity, addQuantity, curValue }).getResult()
                        let subPrice = 0
                        if (Number(den) != 0) {
                            const price = execExpressEngine(expressPrice, { beginAmount, addAmount, preAddAmount, beginQuantity, addQuantity, curValue }).getResult()
                            subPrice = number.toFixedLocal(parseFloat(price), 6)
                        }
                        subAmount = execExpressEngine('subQuantity*subPrice', { subQuantity, subPrice }).getResult()
                        //计算余额
                        endAmount = execExpressEngine('beginAmount+addAmount+preAddAmount-subAmount', { beginAmount, addAmount, preAddAmount, subAmount }).getResult()

                        //更新结转单价、结转金额 结转成本余额
                        details = details.update(rowIndex, item =>
                            item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                        )

                        details = details.update(rowIndex, item =>
                            item.set('subAmount', number.toFixedLocal(parseFloat(subAmount), 2))
                        )
                        details = details.update(rowIndex, item =>
                            item.set('endAmount', number.toFixedLocal(parseFloat(endAmount), 2))
                        )
                    }
                } else {
                    express = businessType == 5000040026 && carryForwardMode == 5000090001
                        ? '((beginQuantity+addQuantity)*precentProportion)+preAddQuantity-curValue'
                        : 'beginQuantity+addQuantity+preAddQuantity-curValue'
                    if (carryForwardMode == 5000090002) {
                        expressPrice = '(beginAmount+addAmount+preAddAmount)/(beginQuantity+addQuantity+preAddQuantity)'
                        const den = execExpressEngine('beginQuantity+addQuantity+preAddQuantity', { beginQuantity, addQuantity, preAddQuantity }).getResult()
                        let subPrice = 0
                        if (Number(den) != 0) {
                            const price = execExpressEngine(expressPrice, { beginAmount, addAmount, preAddAmount, beginQuantity, addQuantity, preAddQuantity }).getResult()
                            subPrice = number.toFixedLocal(parseFloat(price), 6)
                            subAmount = execExpressEngine('curValue*subPrice', { curValue, subPrice }).getResult()
                            //计算余额
                            endAmount = execExpressEngine('beginAmount+addAmount+preAddAmount-subAmount', { beginAmount, addAmount, preAddAmount, subAmount }).getResult()

                            details = details.update(rowIndex, item =>
                                item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                            )
                            details = details.update(rowIndex, item =>
                                item.set('subAmount', number.toFixedLocal(parseFloat(subAmount), 2))
                            )
                            details = details.update(rowIndex, item =>
                                item.set('endAmount', number.toFixedLocal(parseFloat(endAmount), 2))
                            )
                        }

                    }
                }
            } else {
                express = businessType == 5000040026 && carryForwardMode == 5000090001
                    ? '((beginQuantity+addQuantity)*precentProportion)-curValue'
                    : 'beginQuantity+addQuantity-curValue'
                if (carryForwardMode == 5000090002) {
                    /**
                     * 取消暂估入库，当前编辑“结转数量列”
                     * 需要计算结转单价，单价变化->联动计算结转金额->结转后余额
                     */
                    expressPrice = '(beginAmount+addAmount)/(beginQuantity+addQuantity)'
                    const den = execExpressEngine('beginQuantity+addQuantity', { beginQuantity, addQuantity }).getResult()
                    let subPrice = 0
                    if (Number(den) == 0) {
                        details = details.update(rowIndex, item =>
                            item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                        )
                    } else {
                        const price = execExpressEngine(expressPrice, { beginAmount, addAmount, beginQuantity, addQuantity }).getResult()
                        //结转单价
                        subPrice = number.toFixedLocal(parseFloat(price), 6)
                        //结转金额  本期结转数量*本期结转单价
                        subAmount = execExpressEngine('curValue*subPrice', { curValue, subPrice }).getResult()
                        //结转后余额
                        endAmount = execExpressEngine('beginAmount+addAmount-subAmount', { beginAmount, addAmount, subAmount }).getResult()

                        details = details.update(rowIndex, item =>
                            item.set('subPrice', number.toFixedLocal(parseFloat(subPrice), 6))
                        )
                        details = details.update(rowIndex, item =>
                            item.set('subAmount', number.toFixedLocal(parseFloat(subAmount), 2))
                        )
                        details = details.update(rowIndex, item =>
                            item.set('endAmount', number.toFixedLocal(parseFloat(endAmount), 2))
                        )
                    }
                }
            }
            const data = { beginQuantity, addQuantity, precentProportion, curValue, preAddQuantity, subQuantity }
            endQuantity = execExpressEngine(express, data).getResult()
            details = details.update(rowIndex, item =>
                item.set('endQuantity', number.toFixedLocal(parseFloat(endQuantity), 6))
            )
        }

        //计算结转单价
        let endLastAmount = details.get(rowIndex).get('endAmount'),
            endLastQuantity = details.get(rowIndex).get('endQuantity')
        let endPrice = 0
        if (Number(endLastQuantity) != 0) {
            const price = execExpressEngine('endLastAmount/endLastQuantity', { endLastAmount, endLastQuantity }).getResult()
            endPrice = number.toFixedLocal(parseFloat(price), 6)
        }
        details = details.update(rowIndex, item =>
            item.set('endPrice', number.toFixedLocal(parseFloat(endPrice), 6))
        )
        return details
    }

    /**
    * input金额框失去焦点时处理的事件
    */
    handleBlur = (col, rowIndex, rowData, v, precision) => {
        if (typeof v == "string") {
            v = v.replace(/,/g, '')
            v = Number(v)
        }
        if (col.indexOf('Amount') > -1) {
            if (Number(v) > 9999999999.99) {
                v = 9999999999.99
            }
            if (Number(v) < - 9999999999.999999) {
                v = -9999999999.99
            }
        } else {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
            if (Number(v) < - 9999999999.999999) {
                v = -9999999999.999999
            }
        }
        let details = this.metaAction.gf('data.form.details')
        if (col == 'saleQuantity') {
            const saleAmount = v < 0 ? -Math.abs(rowData['saleAmount']) : v > 0 ? Math.abs(rowData['saleAmount']) : rowData['saleAmount']
            details = details.update(rowIndex, item =>
                item.set('saleAmount', number.toFixedLocal(saleAmount, 2))
            )
            rowData['saleAmount'] = number.toFixedLocal(saleAmount, 2)
        }
        if (col == 'saleAmount') {
            const saleQuantity = v < 0 ? -Math.abs(rowData['saleQuantity']) : v > 0 ? Math.abs(rowData['saleQuantity']) : rowData['saleQuantity']
            details = details.update(rowIndex, item =>
                item.set('saleQuantity', number.toFixedLocal(saleQuantity, 6))
            )
            rowData['saleQuantity'] = number.toFixedLocal(saleQuantity, 6)
        }
        this.calcQuantityAmount_Produce(col, rowIndex, rowData, v, precision, details)
        const customAttribute = Math.random()
        this.injections.reduce('update', { path: 'data.other.customAttribute', value: customAttribute })
    }

    /**
     * 按enter键切换金额控件
     */
    handleEnter = async (e, rowIndex) => {
        if (e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108) {
            const inputs = document.getElementsByClassName('ant-input mk-input-number ttk-gl-app-calculationcost-cell-cellinput')
            const index = $(inputs).index(e.target)
            let newValue = e.target.value,
                maxValue = '99,999,999,999,999.99'
            if (newValue && newValue > maxValue) {
                return false
            }
            if (newValue && newValue < -maxValue) {
                return false
            }
            if (newValue && newValue.indexOf(',') > -1) {
                newValue = newValue.replace(/,/g, '')
            }
            inputs[index + 1].focus()
        }
    }


    /**
     * 生产入库 金额、单价、数量计算
     */
    calcQuantityAmount_Produce = (col, rowIndex, rowData, v, precision, details) => {
        let beginAmount = rowData.beginAmount || 0.00,
            beginQuantity = rowData.beginQuantity || 0,
            saleQuantity = rowData.saleQuantity || 0,
            saleAmount = rowData.saleAmount || 0.00,
            salePrice = rowData.salePrice || 0,
            finishQuantity = rowData.finishQuantity || 0,
            finishAmount = rowData.finishAmount || 0.00,
            finishProportion = rowData.finishProportion || 0,
            price = rowData.price || 0
        let isAllCalc = false, isEditCostCol = false
        //获取账面金额
        const bookAmount = details.filter(element => element.get('code') == '账面金额').first()
        if (col.indexOf('code') > -1) {
            let costMap = details.get(rowIndex).get('costMap').toJS()
            if (rowData.code == '待分配金额') {
                const amount = bookAmount.get('costMap').get(col)
                if (Math.abs(amount) < Math.abs(v)) {
                    v = amount
                }
            }
            costMap[col] = number.toFixedLocal(v, precision)
            details = details.update(rowIndex, item =>
                item.set('costMap', fromJS(costMap))
            )
            isEditCostCol = true
        } else {
            details = details.update(rowIndex, item =>
                item.set(col, number.toFixedLocal(v, precision))
            )
        }
        //联动计算金额 、数量
        if (col.indexOf('Amount') > -1 || col.indexOf('Quantity') > -1) {
            /*
            一、本月销售
                销售数量  saleQuantity
                销售收入  saleAmount
                销售单价  销售收入/销售数量 salePrice=saleAmount/saleQuantity
            */
            //销售数量  销售金额   
            if (col == "saleAmount") {
                saleAmount = v
                if (Number(saleQuantity) != 0) {
                    salePrice = execExpressEngine('saleAmount/saleQuantity', { saleAmount, saleQuantity }).getResult()
                }
            }
            if (col == "saleQuantity") {
                saleQuantity = v
                if (Number(saleQuantity) != 0) {
                    salePrice = execExpressEngine('saleAmount/saleQuantity', { saleAmount, saleQuantity }).getResult()
                }
            }
            details = details.update(rowIndex, item =>
                item.set('salePrice', number.toFixedLocal(salePrice, 6))
            )
            /*
            二、本月完工
            完工数量 本月销售数量 - 产成品期初数量 finishQuantity =saleQuantity-beginQuantity
            完工产值  完工数量 * 本月销售_单价 finishAmount = finishQuantity * salePrice
            产值百分比 本科目完工产值 / 合计产值 finishProportion = finishAmount / sumColumn("finishAmount")
            */
            if (col == "finishQuantity") {
                finishQuantity = v
            } else {
                finishQuantity = number.toFixedLocal(execExpressEngine('saleQuantity-beginQuantity', { saleQuantity, beginQuantity }).getResult(), 6)
                if (Number(finishQuantity) < 0) {
                    //如果：小于等于0，等于0
                    finishQuantity = 0
                }
                details = details.update(rowIndex, item =>
                    item.set('finishQuantity', number.toFixedLocal(finishQuantity, 6))
                )
            }
            finishAmount = number.toFixedLocal(execExpressEngine('finishQuantity*salePrice', { finishQuantity, salePrice }).getResult(), 2)
            details = details.update(rowIndex, item =>
                item.set('finishAmount', number.toFixedLocal(finishAmount, 2))
            )
            let amountTotal = this.amountFormat(this.calcSumColumn("finishAmount", details), 2, true, true)
            if (Number(amountTotal) != 0) {
                finishProportion = execExpressEngine('finishAmount/amountTotal', { finishAmount, amountTotal }).getResult()
            }
            details = details.update(rowIndex, item =>
                item.set('finishProportion', number.toFixedLocal(finishProportion, 6))
            )
            for (let index = 0; index < details.size; index++) {
                if (index != rowIndex) {
                    const element = details.get(index)
                    let _finishAmount = element.get('finishAmount')
                    if (Number(amountTotal) != 0 && Number(_finishAmount) != 0) {
                        let _finishProportion = execExpressEngine('_finishAmount/amountTotal', { _finishAmount, amountTotal }).getResult()
                        details = details.update(index, item =>
                            item.set('finishProportion', number.toFixedLocal(_finishProportion, 6))
                        )
                        isAllCalc = true
                    }
                }
            }
            /*
            三、单位成本
                【期初金额 + 完工金额】/【期初数量+完工数量】 price=(beginAmount+finishAmount)/(beginQuantity + finishQuantity)
            */
            const quantity = number.toFixedLocal(execExpressEngine('beginQuantity + finishQuantity', { beginQuantity, finishQuantity }).getResult(), 6)

            if (Number(quantity) != 0) {
                price = execExpressEngine('(beginAmount+finishAmount)/(beginQuantity + finishQuantity)', { beginAmount, finishAmount, beginQuantity, finishQuantity }).getResult()
            }
            details = details.update(rowIndex, item =>
                item.set('price', number.toFixedLocal(parseFloat(price), 6))
            )
            /*
            四、期末结存
            数量 产成品期初数量 + 本月完工数量 - 本月销售数量 endQuantity = beginQuantity + finishQuantity - saleQuantity
            单价 金额 / 数量  endPrice = endAmount / endQuantity
            金额 产成品期初金额 + 本月完工金额 - 本月销售金额  endAmount = beginAmount + finishAmount - saleAmount
            毛利率(本月销售收入 - 本月销售数量 * 单位成本) / 本月销售收入 grossRate = (saleAmount - (saleQuantity * price)) / saleAmount
            */
            let endQuantity = execExpressEngine('(beginQuantity+finishQuantity)-saleQuantity', { beginQuantity, finishQuantity, saleQuantity }).getResult()

            details = details.update(rowIndex, item =>
                item.set('endQuantity', number.toFixedLocal(parseFloat(endQuantity), 6))
            )
            const endAmount = execExpressEngine('(beginAmount+finishAmount)-saleAmount', { beginAmount, finishAmount, saleAmount }).getResult()
            details = details.update(rowIndex, item =>
                item.set('endAmount', number.toFixedLocal(parseFloat(endAmount), 2))
            )
            let endPrice = 0
            if (Number(endQuantity) != 0) {
                endPrice = execExpressEngine('endAmount/endQuantity', { endAmount, endQuantity }).getResult()
            }
            details = details.update(rowIndex, item =>
                item.set('endPrice', number.toFixedLocal(parseFloat(endPrice), 6))
            )
            let grossRate = 0
            if (Number(saleAmount) != 0) {
                grossRate = execExpressEngine('(saleAmount-(saleQuantity*price))/saleAmount', { saleAmount, saleQuantity, price, saleAmount }).getResult()
            }
            details = details.update(rowIndex, item =>
                item.set('grossRate', number.toFixedLocal(parseFloat(grossRate), 6))
            )
        }

        //修改表头合计
        let costTotalData = this.metaAction.gf('data.costTotalData').toJS()
        //本期销售收入
        const incomeAmountDouble = this.amountFormat(this.calcSumColumn("saleAmount", details), 2, true, true)
        costTotalData.incomeAmountDouble = incomeAmountDouble
        const proportion = costTotalData.proportion / 100
        //预计本期销售成本 本期收入*结转百分比        
        costTotalData.finishAmountDouble = number.toFixedLocal(execExpressEngine('incomeAmountDouble*proportion', { incomeAmountDouble, proportion }).getResult(), 2)

        if (Number(costTotalData.costAmountDouble) != 0) {
            const costAmountDouble = costTotalData.costAmountDouble
            const finishAmountDouble = costTotalData.finishAmountDouble
            costTotalData.productProportion = number.toFixedLocal(execExpressEngine('finishAmountDouble/costAmountDouble', { finishAmountDouble, costAmountDouble }).getResult(), 6) //成本分配系数(预计本期销售成本/生产成本余额)

            if (Number(costTotalData.productProportion) > 1) {
                costTotalData.productProportion = 1
            }
        }

        /*
        五、生产成本
            合计 生产成本1 + 生产成本2 +...+生产成本n   coln = (col1 + col2 +...+coln)
        */
        //动态列-生产成本        
        const headList = this.metaAction.gf('data.other.headList')

        //计算待分配金额 =账面余额*产成品分配率
        const productProportion = costTotalData.productProportion
        //生产成本合计列
        const maxCol = headList.last().get('code')
        //生产成本列计算表达式
        let express = headList.skipLast(1).map((element, index) => {
            return element.get('code')
        }).join('+')
        //编辑成本列不联动计算待分摊金额
        if (!isEditCostCol) {
            let curAmount = {}
            for (let index = 0; index < headList.size; index++) {
                if (index != headList.size - 1) {
                    const key = headList.get(index).get('code')
                    const value = bookAmount.get('costMap').get(key)
                    const curCostValue = execExpressEngine('value*productProportion', { value, productProportion }).getResult()
                    curAmount[key] = number.toFixedLocal(curCostValue, 2)
                }
            }
            if (Object.keys(curAmount).length > 0) {
                let sumColumn = 0
                if (express.indexOf('+') > -1) {
                    sumColumn = execExpressEngine(express, curAmount).getResult()
                    curAmount[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
                } else {
                    sumColumn = curAmount[express]
                    curAmount[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
                }
                details = details.update(1, item =>
                    item.set('costMap', fromJS(curAmount))
                )
            }
        }

        //待分配金额 
        let distributeAmount = details.filter(element => element.get('code') == '待分配金额').first()

        let curRowData = rowData.costMap //当前行生产成本对应列的值
        if (col.indexOf('code') > -1) {
            curRowData[col] = v
            /**
              * 计算合计行
             */
            let sumColumn = 0
            if (express.indexOf('+') > -1) {
                sumColumn = execExpressEngine(express, curRowData).getResult()
                curRowData[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
            } else {
                sumColumn = curRowData[express]
                curRowData[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
            }
            curRowData[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
            details = details.update(rowIndex, item =>
                item.set('costMap', fromJS(curRowData))
            )
        } else {
            //联动修改当前行生产成本 
            details = this.setCostColumns(details, headList, curRowData, distributeAmount, express, maxCol, rowIndex, finishProportion)
        }
        if (isAllCalc) {//产值百分比变动联动成本列
            let startIndex = details.size > 2 ? 2 : details.size
            for (let index = startIndex; index < details.size; index++) {
                if (index != rowIndex) {
                    const proportion = details.get(index).get('finishProportion')
                    details = this.setCostColumns(details, headList, curRowData, distributeAmount, express, maxCol, index, proportion)
                }
            }
        }

        let desc = `销售成本结转比例: ${costTotalData.proportion}%    本期销售收入: ${this.amountFormat(costTotalData.incomeAmountDouble, 2)}    预计本期销售成本: ${this.amountFormat(costTotalData.finishAmountDouble, 2)}    生产成本余额: ${this.amountFormat(costTotalData.costAmountDouble, 2)}    成本分配系数(预计本期销售成本/生产成本余额): ${costTotalData.productProportion || 0}`
        this.injections.reduce('setTotalData', desc)
        details = details.update(rowIndex, item =>
            item.set('editState', true)
        )
        // this.injections.reduce('update', { path: 'data.form.details', value: details })
        let oldList = this.metaAction.gf('data.saveFilterList')
        const newLists = this.autoMergeDeep(oldList, details)
        this.injections.reduce('updateDetails', { details, newLists })
    }

    /**
     * 设置成本科目列动态列数据
     */
    setCostColumns = (details, headList, curRowData, distributeAmount, express, maxCol, rowIndex, finishProportion) => {
        const precision = 2
        //联动修改当前行生产成本 
        for (let index = 0; index < headList.size; index++) {
            if (index != headList.size - 1) {
                const key = headList.get(index).get('code')
                const value = distributeAmount.get('costMap').get(key)
                const curCostValue = execExpressEngine('value*finishProportion', { value, finishProportion }).getResult()
                curRowData[key] = number.toFixedLocal(curCostValue, 2)
            }
        }
        /**
         * 计算合计行
         */
        if (express.indexOf('+') > -1) {
            const sumColumn = execExpressEngine(express, curRowData).getResult()
            curRowData[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
        } else {
            const sumColumn = curRowData[express]
            curRowData[maxCol] = number.toFixedLocal(sumColumn || 0.00, precision)
        }

        details = details.update(rowIndex, item =>
            item.set('costMap', fromJS(curRowData))
        )
        return details
    }

    /**
     * 渲染 销售数量、销售收入、完工数量列,
     * 用inputnumer本身的onBlur事件,替换掉onChange事件
     */
    renderCellContent = (_rowIndex, _ctrlPath, col, curRowData, data) => {
        const isAmount = col.indexOf('Amount') > -1 ? true : false,
            precision = isAmount ? 2 : 6,
            customAttribute = this.metaAction.gf('data.other.customAttribute')//为了只有操作另一个input时才去render input
        return this.isShowLine(curRowData)
            ?
            <DataGrid.TextCell
                value='—'
                enableTooltip={true}
                className="ttk-gl-app-calculationcost-cell-topTwo"
            />
            :
            <div className='ttk-gl-app-calculationcost-cell-cellrow'>
                <Input.Number
                    precision={precision}
                    className='ttk-gl-app-calculationcost-cell-cellinput'
                    id='ttk-gl-app-calculationcost-cell-cellinput'
                    value={isAmount ? this.amountFormat(data, precision, false) : this.quantityFormat(data, precision, false)}
                    title={isAmount ? this.amountFormat(data, precision, false) : this.quantityFormat(data, precision, false)}
                    customAttribute={customAttribute}
                    onBlur={(value) => this.handleBlur(col, _rowIndex, curRowData, value, precision)}
                // onPressEnter={(e) => this.handleEnter(e, _rowIndex)}
                />
            </div>

    }

    /**
     * 计算成本合计行
     */
    calcSumColumn = (col, lists) => {
        let details = lists || this.metaAction.gf('data.form.details'),
            sum = 0
        for (let index = 0; index < details.size; index++) {
            const element = details.get(index)
            if (element.get('code') == '账面金额') {
                continue
            }
            if (element.get('code') == '待分配金额') {
                continue
            }
            if (col.indexOf('code') > -1) {
                sum += number.toFixedLocal(element.get('costMap').get(col), 2)
            } else {
                sum += number.toFixedLocal(element.get(col), 2)
            }

        }
        return this.amountFormat(sum, 2)
    }

    /**
    * 动态渲染生产成本列
    */
    renderDynamicCols = (_ctrlPath) => {
        let res = []
        const headList = this.metaAction.gf('data.other.headList'),
            details = this.metaAction.gf('data.form.details'),
            precision = 2,
            customAttribute = this.metaAction.gf('data.other.customAttribute')//为了只有操作另一个input时才去render input
        if (headList.size < 1) {
            return res
        }
        headList.map((item, index) => {
            res.push(
                <DataGrid.Column
                    name={item.get('code')}
                    columnKey={item.get('code')}
                    flexGrow={1}
                    header={<DataGrid.Cell tip={true} className={item.get('name').length > 8 ? "ttk-gl-app-calculationcost-cell-header" : "sw"}>{item.get('name')}</DataGrid.Cell>}
                    cell={({ rowIndex, ...props }) => {
                        let costMap = details.get(rowIndex).get('costMap'),
                            curRowData = details.get(rowIndex).toJS()
                        const key = item.get('code')
                        return <DataGrid.Cell {...props}
                            className={rowIndex == 0 || rowIndex == 1 ? "ttk-gl-app-calculationcost-cell-topTwo" : "ttk-gl-app-calculationcost-cell-right rowinput"} tip={true} >
                            {
                                index == headList.size - 1 || rowIndex == 0
                                    ?
                                    <DataGrid.TextCell
                                        value={this.amountFormat(costMap.get(key), precision, false)}
                                        enableTooltip={true}
                                        className="ttk-gl-app-calculationcost-cell-right"
                                    />
                                    :
                                    <div className='ttk-gl-app-calculationcost-cell-cellrow'>
                                        <Input.Number
                                            precision={precision}
                                            className='ttk-gl-app-calculationcost-cell-cellinput'
                                            id='ttk-gl-app-calculationcost-cell-cellinput'
                                            value={this.amountFormat(costMap.get(key), precision, false)}
                                            title={this.amountFormat(costMap.get(key), precision, false)}
                                            customAttribute={customAttribute}
                                            onBlur={(value) => this.handleBlur(key, rowIndex, curRowData, value, precision)}
                                            // onPressEnter={(e) => this.handleEnter(e, rowIndex)}
                                            regex='^(-?[0-9]+)(?:\.[0-9]{1,2})?$' />
                                    </div>
                            }

                        </DataGrid.Cell>
                    }}
                    footer={
                        <DataGrid.Cell
                            className='ttk-gl-app-calculationcost-cell-right'
                            tip={true}>
                            {this.calcSumColumn(item.get('code'))}
                        </DataGrid.Cell>}
                    width={108}
                />)
        })
        return res
    }

    /**
     * 是否显示线条
     */
    isShowLine = (curData) => {
        return curData.code == "账面金额" || curData.code == "待分配金额" ? true : false
    }

    /**
     * 打印
     */
    print = async () => {
        let details = this.metaAction.gf('data.form.details')
        if (details.size == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let { initData } = this.component.props
            , tempWindow = window.open()

        initData.tempWindow = tempWindow
        await this.webapi.calculationcost.print(initData)

    }

    /**
     * 导出
     */
    export = async () => {
        let details = this.metaAction.gf('data.form.details'),
            { initData } = this.component.props
        if (details.size == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        delete initData.tempWindow
        await this.webapi.calculationcost.export(initData)
    }

    /**
    * 取消按钮
    */
    handleCancel = async () => {
        let isEdit = this.metaAction.gf('data.other.isEdit')
        if (!isEdit) {
            let details = this.metaAction.gf('data.form.details')
            if (details.size > 0) {
                const editList = details.filter(x => x.get('editState'))
                if (editList.size > 0) {
                    const ret = await this.metaAction.modal('confirm', {
                        title: '提示',
                        content: '当前数据未保存，是否保存数据？'
                    })
                    if (ret) {
                        await this.handleSave()
                    }
                }
            }
        }
        this.component.props.closeModal(true)
    }

    /**
     * 关闭
     */
    onCancel = async () => {
        let isEdit = this.metaAction.gf('data.other.isEdit')
        if (!isEdit) {
            let details = this.metaAction.gf('data.form.details')
            if (details.size > 0) {
                const editList = details.filter(x => x.get('editState'))
                if (editList.size > 0) {
                    const ret = await this.metaAction.modal('confirm', {
                        title: '提示',
                        content: '当前数据未保存，是否保存数据？'
                    })
                    if (ret) {
                        await this.handleSave()
                    }
                }
            }
        }
        this.component.props.closeModal(true)
    }

    /**
     * 重置
     */
    handleReset = async () => {
        let { initData } = this.component.props,
            res, list, headList
        const showPreAdd = this.metaAction.gf('data.other.showPreAdd')
        initData.fullAmountCalcType = this.metaAction.gf('data.other.radioValue')
        initData.showPreAdd = showPreAdd
        initData.pickingType = this.metaAction.gf('data.other.pickingType')
        if (initData.businessType == 5000040024) {//生产入库
            initData.reCalc = true
            res = await this.webapi.calculationcost.init(initData)
            list = res ? fromJS(res.list) : fromJS([])
            headList = res ? fromJS(res.headList) : fromJS([])
        } else {
            res = await this.webapi.calculationcost.reset(initData)
            list = res ? fromJS(res) : fromJS([])
        }
        if (res) {
            if (list && list.size > 0) {
                list = list.set(0, list.get(0).set('editState', true))
            }

            if (initData.businessType == 5000040024) {//生产入库
                const desc = `销售成本结转比例: ${res.proportion || 100}%本期销售收入: ${this.amountFormat(res.incomeAmountDouble, 2)}  预计本期销售成本: ${this.amountFormat(res.finishAmountDouble, 2)}生产成本余额: ${this.amountFormat(res.costAmountDouble, 2)}  成本分配系数(预计本期销售成本/生产成本余额): ${res.productProportion || 0}`
                this.injections.reduce('setTotalData', desc)
            }
            res.list = list.toJS()
            res.headList = headList
            res.showPreAdd = showPreAdd
            this.injections.reduce('load', res)
            await this.refresh()
        }

    }

    /**
        * 提示内容
        */
    getDisplayInfoMSg = (msgInfo) => {
        return (
            <div style={{ textAlign: 'left', Height: '300px', maxHeight: '300px', overflow: 'auto' }}>
                {
                    msgInfo.map((o, i) => {
                        return (
                            <div><span style={{ 'fontSize': '12px', color: '#484848', textAlign: 'left', "word-wrap": 'break-word' }}>{o}</span></div>
                        )
                    })
                }
            </div>
        )
    }
    /**
     * 合并数据
     */
    autoMergeDeep = (saveList, mergerList) => {
        if (mergerList.size < 1) {
            return saveList
        }
        for (let index = 0; index < saveList.size; index++) {
            const element = saveList.get(index);
            let isCurData = mergerList.filter(x => x.get('code') == element.get('code'))
            if (isCurData && isCurData.size > 0) {
                const firData = element.mergeDeep(isCurData.first())
                saveList = saveList.set(index, firData)
            }
        }
        return saveList
    }
    /**
     * 保存
     */
    handleSave = async () => {
        let { initData } = this.component.props
        const showPreAdd = this.metaAction.gf('data.other.showPreAdd')
        let list = this.metaAction.gf('data.form.details')
        initData.pickingType = this.metaAction.gf('data.other.pickingType')
        let oldList = this.metaAction.gf('data.saveFilterList')
        const newLists = this.autoMergeDeep(oldList, list)
        list = newLists
        initData.showPreAdd = showPreAdd
        if (list && list.size > 0) {
            //补全数据结构，否则nodejs会过滤掉，导致后面有值的列无法接收到数据
            if (!list.get(0).get('preAddQuantity')) {
                list = list.set(0, list.get(0).set('preAddQuantity', 0))
            }
            if (!list.get(0).get('preAddAmount')) {
                list = list.set(0, list.get(0).set('preAddAmount', 0))
            }
            if (!list.get(0).get('subQuantity')) {
                list = list.set(0, list.get(0).set('subQuantity', 0))
            }
            if (!list.get(0).get('subAmount')) {
                list = list.set(0, list.get(0).set('subAmount', 0))
            }
            if (!list.get(0).get('inventoryAuxDataId')) {
                list = list.set(0, list.get(0).set('inventoryAuxDataId', null))
            }
            if (!list.get(0).get('incomeAuxDataId')) {
                list = list.set(0, list.get(0).set('incomeAuxDataId', null))
            }
            if (!list.get(0).get('costAuxDataId')) {
                list = list.set(0, list.get(0).set('costAuxDataId', null))
            }

            if (!list.get(0).get('incomeAccountId')) {
                list = list.set(0, list.get(0).set('incomeAccountId', null))
            }
            if (!list.get(0).get('inventoryAccountId')) {
                list = list.set(0, list.get(0).set('inventoryAccountId', null))
            }
        }
        initData.list = list
        let response = ''
        if (initData.businessType == 5000040024) {//生产入库结转校验 成本科目合计
            let arrStrs = []
            const headList = this.metaAction.gf('data.other.headList')
            for (let index = 0; index < headList.size; index++) {
                if (index != headList.size - 1) {
                    const element = headList.get(index)
                    let totalValue = this.amountFormat(this.calcSumColumn(element.get('code')), 2, true, true),
                        distributionAmount = this.amountFormat(list.get(1).get('costMap').get(element.get('code')), 2, true, true)

                    if (totalValue != distributionAmount) {
                        const diff = execExpressEngine('totalValue-distributionAmount', { totalValue, distributionAmount }).getResult()
                        arrStrs.push(`${element.get('name')} 差额:${this.amountFormat(diff, 2)}`)
                    }
                }
            }
            let rpt = arrStrs.length < 1 ? true : false
            if (arrStrs.length > 0) {
                arrStrs.push(` 以上列待分配金额与其各商品对应分配金额合计不一致,将无法生成凭证，是否保存？`)
                rpt = await this.metaAction.modal('confirm',
                    {
                        content: this.getDisplayInfoMSg(arrStrs),
                        okText: '确定',
                        cancelText: '取消',
                        width: 500
                    })
            }

            if (rpt) {
                response = await this.webapi.calculationcost.save(initData)
            }

        } else {
            response = await this.webapi.calculationcost.save(initData)
        }
        if (response) {
            for (let index = 0; index < list.size; index++) {
                const element = list.get(index)
                if (element.get('editState')) {
                    list = list.update(index, item =>
                        item.set('editState', false)
                    )
                }
            }
            // this.injections.reduce('update', { path: 'data.form.details', value: list })

            this.injections.reduce('updateDetails', { details: list, newLists: list })
            await this.refresh()
            this.metaAction.toast('success', '保存成功')
        }
    }

    /**
     * keydown事件
     */
    gridKeydown = (e) => {
        this.extendAction.gridAction.gridKeydown(e)
        if (e.keyCode == 40) { //40:向下键keycode
            this.extendAction.gridAction.cellAutoFocus()
        }
    }

}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction, extendAction }),
        ret = { ...metaAction, ...voucherAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}

