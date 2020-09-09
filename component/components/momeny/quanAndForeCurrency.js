import React, { PureComponent, Component } from 'react'
import { Map, List, fromJS } from 'immutable'
import { Popover, Button, Select } from 'antd'
import { environment } from 'edf-utils'
import { Input } from 'edf-component'
import isEqual from 'lodash.isequal'
import * as data from './data'
const precision = 2
export default class quanAndForeCurrencyComponent extends Component {
    state = {
        data: Map({
            value: null,
            style: null
        }),
        isEditing: false,
        data_runtime: Map({
            value: null,
        }),
        isSetFocus: true,
        isValueEqual: false,
        isChangeFocus: false
    }

    constructor(props) {
        super(props)
        this.state = this.computeState(this.props)
    }

    computeState(props, preprops) {
        let { data } = this.state,
            { value, path } = props,
            curIndex = path.split(',')[1],
            fromPage = this.props.gf('data.other.fromPage'),
            quantityAndForeignCurrency = this.props.gf('data.form.details').get(curIndex).get('quantityAndForeignCurrency')
        if (!Map.isMap(quantityAndForeignCurrency) && !List.isList(quantityAndForeignCurrency) && (typeof quantityAndForeignCurrency == 'object')) {
            quantityAndForeignCurrency = fromJS(quantityAndForeignCurrency)
        }
        data = data.set('value', quantityAndForeignCurrency)
        data = data.set('path', path)
        data = data.set('fromPage', fromPage)
        data = data.set('hidePopover', this.props.gf('data.other.hidePopover'))
        data = data.set('isShow', this.props.gf('data.other.isShow'))
        data = data.set('index', this.props.gf('data.other.index'))
        let currencyDS = this.props.gf('data.other.currencyDS')
        this.lazyLoadDataSource(Map(value), currencyDS)
        this.oldValue = value
        if (this.state.data_runtime) {
            if (!data.get('value')) {
                data = data.set('value', fromJS({ currencyDataSource: this.getRuntime('currencyDataSource') }))
            } else {
                data = data.set('value', data.get('value').set('currencyDataSource', this.getRuntime('currencyDataSource')))
            }
        }
        if (data && data.get('value') &&
            data.get('value').get('calcFromAmount') &&
            (
                (data.get('value').get('amount')
                    && this.toFixedLocal(data.get('value').get('externalAmount'), precision)
                    != this.toFixedLocal(data.get('value').get('amount'), precision)) ||
                (!data.get('value').get('amount') && data.get('value').get('externalAmount') != data.get('value').get('amount'))
            )
        ) {
            setTimeout(() => {
                let isBackCaculate = true
                this.onAmountBlur(parseFloat(data.get('value').get('externalAmount')), isBackCaculate)
                if (!this.isEqualQuanCurr(this.getOrignEditData(), this.getEditData())) {
                    this.props.onFieldChange && this.props.onFieldChange(path, Map(this.getOrignEditData()), Map(this.getEditData()))
                }
            }, 0)
        }
        if (preprops) {
            if (!isEqual(preprops.value, props.value)) {
                return {
                    data,
                    data_runtime: data.get('value') || Map(),
                    isEditing: this.state.isEditing,
                    isSetFocus: true
                }
            } else { //当切换币种下拉选时isValueEqual:true
                return {
                    data,
                    isEditing: this.state.isEditing,
                    isSetFocus: true,
                    isValueEqual: true
                }
            }
        }
        return {
            data,
            data_runtime: data.get('value') || Map(),
            isEditing: this.state.isEditing,
            isSetFocus: true
        }
    }

    componentDidUpdate() {
        let rowIndex = this.state.data.get('path').split(',')[1],
            index = this.state.data.get('index')

        if (this.state.isSetFocus && rowIndex == index) {
            setTimeout(() => {
                let dom = this.getCurrentEditDom()

                if (dom) {
                    //设置数量外币弹出框初始化焦点
                    let originData = this.getOrignEditData(), c

                    if (originData.isCalcQuantity && originData.isCalcMulti) {
                        c = dom.children[0].getElementsByClassName('ant-select-selection')[0]
                    } else if (originData.isCalcQuantity) {
                        c = dom.children[0].children[0].getElementsByClassName('ant-input mk-input-number')[0]
                    } else if (originData.isCalcMulti) {
                        c = dom.children[0].getElementsByClassName('ant-select-selection')[0]
                    }
                    if (c) {
                        let quantityPopOver = dom.parentElement.parentElement.parentElement.parentElement.parentElement
                        if (quantityPopOver &&
                            quantityPopOver.className.indexOf('ant-popover-hidden') == -1) {

                            c.tabIndex = 0
                            c.focus()
                            if (c.select) {
                                c.select()
                            }
                        }
                    }
                }
                window.isFreezing = false
            }, 0)

            let thisStub = this
            setTimeout(() => {
                let dom = this.getCurrentEditDom()
                if (dom) {
                    if (dom.removeEventListener) {
                        dom.removeEventListener('keydown', thisStub.handleKeyDown, false)
                    } else if (dom.detachEvent) {
                        dom.detachEvent('onkeydown', thisStub.handleKeyDown)
                    } else {
                        dom.onKeyDown = undefined
                    }
                }
            }, 0)

            setTimeout(() => {

                let dom = this.getCurrentEditDom()
                if (dom) {
                    if (dom.addEventListener) {
                        dom.addEventListener('keydown', thisStub.handleKeyDown, false)
                    } else if (dom.attachEvent) {
                        dom.attachEvent('onkeydown', thisStub.handleKeyDown)
                    } else {
                        dom.onKeyDown = thisStub.handleKeyDown
                    }
                }
            }, 0)
            this.setState({
                data: this.state.data,
                data_runtime: this.state.data_runtime,
                isEditing: this.state.isEditing,
                isSetFocus: false
            })
        }
    }

    componentDidMount() {
        let rowIndex = this.state.data.get('path').split(',')[1],
            index = this.state.data.get('index')

        if (this.state.isSetFocus && rowIndex == index) {
            setTimeout(() => {
                let dom = this.getCurrentEditDom()
                if (dom) {
                    //设置数量外币弹出框初始化焦点
                    let originData = this.getOrignEditData(), c
                    if (originData.isCalcQuantity && originData.isCalcMulti) {
                        c = dom.children[0].getElementsByClassName('ant-select-selection')[0]
                    } else if (originData.isCalcQuantity) {
                        c = dom.children[0].children[0].getElementsByClassName('ant-input mk-input-number')[0]
                    } else if (originData.isCalcMulti) {
                        c = dom.children[0].getElementsByClassName('ant-select-selection')[0]
                    }
                    if (c) {
                        let quantityPopOver = dom.parentElement.parentElement.parentElement.parentElement.parentElement
                        if (quantityPopOver &&
                            quantityPopOver.className.indexOf('ant-popover-hidden') == -1) {
                            c.tabIndex = 0
                            c.focus()
                            if (c.select) {
                                c.select()
                            }
                        }
                    }
                }
                window.isFreezing = false
            }, 0)
            let thisStub = this

            setTimeout(() => {
                let dom = this.getCurrentEditDom()
                if (dom) {
                    if (dom.removeEventListener) {
                        dom.removeEventListener('keydown', thisStub.handleKeyDown, false)
                    } else if (dom.detachEvent) {
                        dom.detachEvent('onkeydown', thisStub.handleKeyDown)
                    } else {
                        dom.onKeyDown = undefined
                    }
                }
            }, 0)

            setTimeout(() => {
                let dom = this.getCurrentEditDom()

                if (dom) {
                    if (dom.addEventListener) {
                        dom.addEventListener('keydown', thisStub.handleKeyDown, false)
                    } else if (dom.attachEvent) {
                        dom.attachEvent('onkeydown', thisStub.handleKeyDown)
                    } else {
                        dom.onKeyDown = thisStub.handleKeyDown
                    }
                }
            }, 0)
            this.setState({
                data: this.state.data,
                data_runtime: this.state.data_runtime,
                isEditing: this.state.isEditing,
                isSetFocus: false
            })
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState(this.computeState(nextProps, this.props))
    }


    getCurrentEditDom() {

        let doms = document.getElementsByClassName('accountQuantityEdit'),
            activePop

        for (var i = 0; i < doms.length; i++) {
            let popOverDom = doms[i].parentElement.parentElement.parentElement.parentElement.parentElement

            if (popOverDom && popOverDom.className.indexOf('ant-popover-hidden') == -1) {
                activePop = doms[i]
                break
            }
        }

        return activePop
    }


    /**
     * 键盘事件
     */
    handleKeyDown = (e) => {
        //Enter键切换单元格
        //焦点落入本币金额时，按下Enter键，直接触发确认按钮        
        if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
            if (window.isFreezing == true) {
                return
            }
            window.isFreezing = true

            let labelTitle,
                nextFocusIndex,
                dom = document.activeElement.parentElement.parentElement.parentElement,
                c = undefined
            if (document.activeElement.className.indexOf('ant-input mk-input-number') > -1) {
                labelTitle = document.activeElement.parentElement.children[0].innerText.replace('：', '')

                if (labelTitle == '本币' || labelTitle == '金额') {
                    nextFocusIndex = -1
                } else if (labelTitle == '数量') {
                    c = dom.getElementsByClassName('txtPrice')[0].children[1]
                } else if (labelTitle == '单价') {
                    if (dom.getElementsByClassName('txtOrigAmount').length > 0) {
                        c = dom.getElementsByClassName('txtOrigAmount')[0].children[1]
                    } else {
                        c = dom.getElementsByClassName('txtAmount')[0].children[1]
                    }
                } else if (labelTitle == '外币') {
                    if (this.isSelfCurrency()) {
                        c = dom.getElementsByClassName('txtAmount')[0].children[1]
                    } else {
                        c = dom.getElementsByClassName('txtExchangeRate')[0].children[1]
                    }
                } else if (labelTitle == '汇率') {
                    c = dom.getElementsByClassName('txtAmount')[0].children[1]
                } else {
                    nextFocusIndex = undefined
                }

                if (c) {
                    let browserType = environment.getBrowserVersion()
                    c.tabIndex = 0
                    c.focus()
                    if (browserType && browserType.ie) {
                        window.setTimeout(function () {
                            c.select()
                        }, 50)  //延缓50ms执行，用于解决IE11浏览器下Enter键按下切换到Input框后无法录入的问题 TTK-3451
                    } else {
                        c.select()
                    }
                }

                if (e.preventDefault)
                    e.preventDefault()
                if (e.stopPropagation)
                    e.stopPropagation()
            } else if (document.activeElement.className.indexOf('ant-select-selection') > -1 &&
                this.isVisibleSelectOptionLayer() == true) {
                if (dom.getElementsByClassName('txtQuantity').length > 0) {
                    c = dom.getElementsByClassName('txtQuantity')[0].children[1]
                } else if (dom.getElementsByClassName('txtOrigAmount').length > 0) {
                    c = dom.getElementsByClassName('txtOrigAmount')[0].children[1]
                }
                if (c) {
                    c.tabIndex = 0
                    c.focus()
                    window.setTimeout(function () {
                        c.select()
                    }, 50)  //延缓50ms执行，用于解决Select框向Input框焦点切换
                }
            } else {
                nextFocusIndex = undefined
            }

            if (nextFocusIndex == -1) {
                this.onAmountBlur(this.refs.txtAmount.state.value, undefined, this.getRuntime('amount'))
                this.handleConfirmClick()
            }
            setTimeout(() => {
                window.isFreezing = false
            }, 50)
        }
        else if (e.key == "ArrowUp" || e.keyCode == 38 ||
            e.key == "ArrowDown" || e.keyCode == 40) { //上下键
            if (document.activeElement.className.indexOf('ant-select-selection') == -1) {
                if (e.preventDefault)
                    e.preventDefault()
                if (e.stopPropagation)
                    e.stopPropagation()
            }
        }
    }

    isVisibleSelectOptionLayer() {
        //判断当前组件是否打开了Select的下拉框
        let visible = false
        let selectDropdowns = document.getElementsByClassName('ant-select-dropdown')
        for (var i = 0; i < selectDropdowns.length; i++) {
            if (selectDropdowns[i].className.indexOf('ant-select-dropdown-hidden') == -1) {
                visible = true
                break
            }
        }
        return visible
    }

    isEqualQuanCurr = (orignEditData, editData) => {
        if (orignEditData.quantity != editData.quantity) return false
        if (orignEditData.price != editData.price) return false
        if (orignEditData.origAmount != editData.origAmount) return false
        if (orignEditData.exchangeRate != editData.exchangeRate) return false
        if (orignEditData.amount != editData.amount) return false
        if (orignEditData.currency != editData.currency) return false
        if (orignEditData.unitName != editData.unitName) return false
        if (orignEditData.isCalcQuantity != editData.isCalcQuantity) return false
        if (orignEditData.isCalcMulti != editData.isCalcMulti) return false

        return true
    }

    get(propertyName) {
        if (!propertyName || propertyName === '') {
            return this.state.data
        }
        return this.state.data.getIn(propertyName.split('.'))
    }

    getPopupContainer = (fromPage) => {
        if (fromPage && fromPage == 'app-proof-of-charge-common-edit') {
            return document.querySelector('.app-proof-of-charge-common-edit')
        } else {
            return document.querySelector('.app-proof-of-charge')
        }
    }

    getRuntime(propertyName) {
        if (!propertyName || propertyName === '') {
            return this.state.data_runtime
        }
        return this.state.data_runtime.getIn(propertyName.split('.'))
    }

    setRuntime(propertyName, value) {
        let data = this.state,
            data_runtime = data.data_runtime

        data_runtime = data_runtime.set(propertyName, value)
        data.data_runtime = data_runtime
        this.setState(data)
    }

    lazyLoadDataSource(value, currencyDataSource) {

        if ((this.oldValue == value && this.getRuntime('currencyDataSource')) || !value) {
            return
        }
        if (value.get('isCalcMulti')) {  //当启用多币种时,加载币种下拉菜单的数据
            if (currencyDataSource) {
                currencyDataSource = currencyDataSource.toJS()
                if (currencyDataSource && currencyDataSource.length > 0) {
                    let currencyList = fromJS(currencyDataSource)
                    //更新"是否本币"字段,(科目信息里没有该字段)
                    let currency = this.getRuntime('currency')
                    if (currency && currency.get('id')) {
                        for (let item of currencyList) {
                            if (item.get('id') == currency.get('id')) {
                                this.setRuntime('currency', currency.set('isBaseCurrency', item.get('isBaseCurrency')))
                                break
                            }
                        }
                    }
                    this.setRuntime('currencyDataSource', currencyList)
                }
            }
        }
    }

    //原始数据
    getOrignEditData() {
        let itemValue = this.get('value')
        let quantity = itemValue.get('quantity'),
            price = itemValue.get('price'),
            unitName = itemValue.get('unitName'),
            origAmount = itemValue.get('origAmount'),
            currency = itemValue.get('currency'),
            exchangeRate = itemValue.get('exchangeRate'),
            isCalcQuantity = itemValue.get('isCalcQuantity'),   //是否数量辅助核算
            isCalcMulti = itemValue.get('isCalcMulti'),      //是否外币辅助核算
            amount = itemValue.get('amount')

        return {
            quantity,
            price,
            unitName,
            origAmount,
            currency,
            exchangeRate,
            isCalcQuantity,
            isCalcMulti,
            amount
        }
    }

    //编辑后的数据
    getEditData() {
        let amount = this.getRuntime('amount')

        if (isNaN(amount)) {
            amount = 0
        }

        return {
            //可编辑项
            quantity: this.getRuntime('quantity'),
            price: this.getRuntime('price'),
            origAmount: this.toFixedLocal(this.getRuntime('origAmount'), precision),
            exchangeRate: this.getRuntime('exchangeRate'),
            amount: this.toFixedLocal(amount, precision),
            currency: this.getRuntime('currency'),

            //不能编辑的项
            unitName: this.getRuntime('unitName'),
            isCalcQuantity: this.getRuntime('isCalcQuantity'),
            isCalcMulti: this.getRuntime('isCalcMulti')
        }
    }

    handleVisibleChange = (visible) => {
        const dom = document.getElementsByClassName('subjectDisplayModal')
        if (dom && dom.length > 0) {
            visible = false
        }
        if (visible) {
            //手动点击外币数量需要弹出编辑界面，需要考虑审核状态状态设置false            
            if (this.props.gf('data.form.certificateStatus') != data.STATUS_VOUCHER_AUDITED) {
                this.props.sf('data.other.hidePopover', false)
                //处理某一分录行填写表格中的金额后，再点击该行数量外币列时，弹出框的金额没有被反算的问题 0310
                if (this.props.gf('data.other.originalFieldPath') && this.props.path && this.props.gf('data.other.originalFieldPath').split(',')[1] == this.props.path.split(',')[1]) {
                    let detail = this.props.gf('data.form.details').get(this.props.path.split(',')[1]),
                        quantityAndForeignCurrency = detail.get('quantityAndForeignCurrency'),
                        amount = quantityAndForeignCurrency.get('amount'),
                        lastFocusPath = this.props.gf('data.other.originalFieldPath'),
                        lastEditField

                    if (lastFocusPath && lastFocusPath.indexOf('debitAmount') != -1) {
                        lastEditField = 'debitAmount'
                    } else if (lastFocusPath && lastFocusPath.indexOf('creditAmount') != -1) {
                        lastEditField = 'creditAmount'
                    } else {
                        lastEditField = undefined
                    }

                    if (lastEditField && detail.get(lastEditField) != 0
                        && amount != detail.get(lastEditField)) {
                        let isBackCaculate = true

                        this.onAmountBlur(parseFloat(detail.get(lastEditField)), isBackCaculate)
                        if (!this.isEqualQuanCurr(this.getOrignEditData(), this.getEditData())) {
                            this.props.onFieldChange && this.props.onFieldChange(this.props.path, Map(this.getOrignEditData()), Map(this.getEditData()))
                        }
                    }
                }
                let isReverseForeignCurrency = this.props.gf('data.other.isReverseForeignCurrency')
                //计算一次
                if (!this.getRuntime('origAmount')
                    && this.getRuntime('amount')
                    && isReverseForeignCurrency
                    && this.getRuntime('exchangeRate')) {
                    const externalAmount = this.toFixedLocal(this.getRuntime('externalAmount'), precision),
                        amount = this.toFixedLocal(this.getRuntime('amount'), precision)
                    this.onAmountBlur(externalAmount || amount, true)
                }
                //互斥处理
                setTimeout(() => {
                    this.setPopoverVisiable(true)
                }, 10)
            }

        }
    }

    setPopoverVisiable(visible) {
        this.setState({ data: this.state.data, data_runtime: this.state.data_runtime, isEditing: visible, isSetFocus: this.state.isSetFocus })
    }

    handleCancelClick = () => {
        setTimeout(() => {
            this.props.onEvent && this.props.onEvent('accountQuantityIsShow', { path: this.props.path })
        }, 10)

        this.clearData()
        this.setPopoverVisiable(false)
        setTimeout(() => {
            this.props.onFieldChange && this.props.onFieldChange(this.get('path'), Map(this.getOrignEditData()), Map(this.getEditData()), 'cancel')
        }, 0)
    }

    handleConfirmClick = () => {
        let error = this.checkQuantityAndCurrency()
        setTimeout(() => {
            this.props.onEvent && this.props.onEvent('accountQuantityIsShow', { path: this.props.path, error: error })
        }, 10)
        if (error) {
            this.props.toast('warning', error, 3)
        } else {
            setTimeout(() => {
                this.props.onFieldChange && this.props.onFieldChange(this.get('path'), Map(this.getOrignEditData()), Map(this.getEditData()), 'confirm')
            }, 0)

            this.setPopoverVisiable(false)
        }
    }

    //检查输入值
    checkQuantityAndCurrency() {
        let error = ''
        if (this.getRuntime('isCalcQuantity')) {
            if (this.getRuntime('price') < 0) {
                error = '单价不能小于零'
            }
        }

        if (this.getRuntime('isCalcMulti')) {
            if (this.getRuntime('exchangeRate') < 0) {
                error += '汇率不能小于零'
            }

            if (this.getRuntime('currency') < 0) {
                error += '请填写币种'
            }
        }
        let isReverseForeignCurrency = this.props.gf('data.other.isReverseForeignCurrency')
        if (isReverseForeignCurrency && !this.getRuntime('origAmount') && this.getRuntime('isCalcMulti')) {
            error += '外币不能为空'
        }
        if (this.getRuntime('amount') && this.getRuntime('amount') > 9999999999.99) {
            if (this.getRuntime('isCalcMulti')) {
                error ? error += '本币不能大于9999999999.99，请调整' : error = '本币不能大于9999999999.99，请调整'
            } else {
                error ? error += '金额不能大于9999999999.99，请调整' : error = '金额不能大于9999999999.99，请调整'
            }
        } else if (this.getRuntime('amount') < -9999999999.99) {
            if (this.getRuntime('isCalcMulti')) {
                error ? error += '本币不能小于-9999999999.99，请调整' : error = '本币不能小于-9999999999.99，请调整'
            } else {
                error ? error += '金额不能小于-9999999999.99，请调整' : error = '金额不能小于-9999999999.99，请调整'
            }
        }

        return error
    }

    //数据恢复到未编辑之前
    clearData() {
        this.setRuntime('quantity', this.get('value').get('quantity'))
        this.setRuntime('price', this.get('value').get('price'))
        this.setRuntime('origAmount', this.get('value').get('origAmount'))
        this.setRuntime('exchangeRate', this.get('value').get('exchangeRate'))
        this.setRuntime('currency', this.get('value').get('currency'))
        this.setRuntime('amount', this.get('value').get('amount'))
    }

    /**
     * 数量失去焦点处理
     */
    onQuantityBlur = (value) => {
        //修改数量:
        //  单价不为空（或0）时，计算：外币 = 数量 * 单价
        //  单价为空（或0）时，计算：单价 = 外币 ÷ 数量
        //  如果数量*单价为0，则不更新借方或贷方金额
        //  本币金额 = 外币 * 汇率
        // value =  this.toFixedLocal(value, 6)
        this.setRuntime('quantity', value)
        if (this.getRuntime('price')) {
            if (value * this.getRuntime('price') != 0) {
                this.setRuntime('origAmount', this.toFixedLocal(value * this.getRuntime('price')), precision)
            }
        } else if (value) {
            this.setRuntime('price', Math.abs(this.getRuntime('origAmount') / value))
        }

        if (value != undefined && value != 0 && value != '') {
            if (this.getRuntime('exchangeRate')) {
                this.setRuntime('amount', this.toFixedLocal(this.getRuntime('origAmount') * this.getRuntime('exchangeRate')), precision)
            } else {
                this.setRuntime('amount', this.toFixedLocal(this.getRuntime('origAmount')), precision)
            }
        }
    }

    /**
     * 单价失去焦点处理
     */
    onPriceBlur = (value) => {
        //修改单价:
        //  数量不为空时，计算：外币 = 数量 * 单价
        //  数量为空（或0）时，计算：数量 = 外币 ÷ 单价
        //  如果数量*单价为0，则不更新借方或贷方金额
        //  本币金额 = 外币 * 汇率
        value = this.toFixedLocal(value, 6)
        this.setRuntime('price', value)
        if (this.getRuntime('quantity')) {
            if (this.getRuntime('quantity') * value != 0) {
                this.setRuntime('origAmount', this.toFixedLocal(this.getRuntime('quantity') * value), precision)
            }
        }

        if (this.getRuntime('exchangeRate')) {
            this.setRuntime('amount', this.toFixedLocal(this.getRuntime('origAmount'), precision) * this.getRuntime('exchangeRate'))
        } else {
            this.setRuntime('amount', this.toFixedLocal(this.getRuntime('origAmount'), precision))
        }
    }

    /**
     * (外币)失去焦点处理
     */
    onOrigAmountBlur = (value, isBackCaculate, oldValue) => {
        //修改原币金额:
        //  如果数量不为0，反算单价，如果外币不为0，反算汇率。不管单价汇率是否为0(空) 0409增加
        //  只计算单价和汇率，不反算数量、外币                                     0409增加
        //  如果外币*汇率为0，则不更新借方或贷方金额，也不更新弹框里的本币
        //  （弹层的本币金额与借贷方金额是同一个值在不同地方的显示，应始终保持他们的一致）
        //  修改外币，如果金额不为0，汇率为0（空），反算汇率，如果汇率不为0，计算金额。0409增加
        value = this.toFixedLocal(value, precision)
        this.setRuntime('origAmount', value)
        if (this.getRuntime('quantity')) {
            if (oldValue != undefined && this.toFixedLocal(oldValue, precision) != value || oldValue == undefined) {
                this.setRuntime('price', Math.abs(value / this.getRuntime('quantity')))
            }

            if (isBackCaculate == undefined) {
                if (value.toString().substr(0, 1) == '-' &&
                    this.getRuntime('quantity').toString().substr(0, 1) != '-') {

                    this.setRuntime('quantity', '-' + this.getRuntime('quantity').toString())
                } else if (value.toString().substr(0, 1) != '-' &&
                    this.getRuntime('quantity').toString().substr(0, 1) == '-') {

                    this.setRuntime('quantity', this.getRuntime('quantity').toString().substr(1, this.getRuntime('quantity').toString().length - 1))
                }
            }
            if (!!isBackCaculate) {
                if (value.toString().substr(0, 1) == '-' &&
                    this.getRuntime('quantity').toString().substr(0, 1) != '-') {

                    this.setRuntime('quantity', '-' + this.getRuntime('quantity').toString())
                } else if (value.toString().substr(0, 1) != '-' &&
                    this.getRuntime('quantity').toString().substr(0, 1) == '-') {

                    this.setRuntime('quantity', this.getRuntime('quantity').toString().substr(1, this.getRuntime('quantity').toString().length - 1))
                }
            }
        } else if (this.getRuntime('quantity') && this.getRuntime('price')) {
            if (value.toString().substr(0, 1) == '-' &&
                this.getRuntime('quantity').toString().substr(0, 1) != '-') {

                this.setRuntime('quantity', '-' + this.getRuntime('quantity').toString())
            } else if (value.toString().substr(0, 1) != '-' &&
                this.getRuntime('quantity').toString().substr(0, 1) == '-') {

                this.setRuntime('quantity', this.getRuntime('quantity').toString().substr(1, this.getRuntime('quantity').toString().length - 1))
            }

        }

        // 反算时不进行外币关联计算 TTK-3050
        if (!isBackCaculate) {
            if (!this.getRuntime('exchangeRate') && value && this.getRuntime('amount')) {
                this.setRuntime('exchangeRate', Math.abs(this.toFixedLocal(this.getRuntime('amount'), precision) / value))
            }

            if (value != undefined && value != 0 && value != '') {
                if (value * this.getRuntime('exchangeRate') != 0) {
                    this.setRuntime('amount', this.toFixedLocal(value * this.getRuntime('exchangeRate')), precision)
                }
            }
        }
    }
    /**
    * 汇率切换
    */
    onExchangeRateBlur = (value, isFromYF) => {
        //修改汇率:
        //  如果外币不为0，用外币乘以汇率作为借方金额
        //  如果外币金额*汇率为0，则不更新借方或贷方金额
        //  如果币种是本位币，保持外币和本位币金额一致，汇率=1
        let path = this.props.path,
            editStatus = this.props.gf('data.other.editStatus'),
            details = this.props.gf('data.form.details'),
            isReverseForeignCurrency = this.props.gf('data.other.isReverseForeignCurrency'),
            curIndex = path.split(',')[1]
        isFromYF = isFromYF != undefined ? isFromYF : false

        if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
            /**编辑状态下
             * 1.所有启用外币核算的币种都为人民币时
             * 2.编辑的是启用人民币的第一行
             **/
            let isNotRMBDetail = details.find(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') !== 1)
            let isNotRMBDetailIndex = details.findIndex(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') == 1)
            if (!isNotRMBDetail && isNotRMBDetailIndex == curIndex) {
                //符合条件
                console.log('---------符合条件-------------')
                isFromYF = true
            }
        }
        if (this.isSelfCurrency()) {
            value = 1
        } else {
            value = this.toFixedLocal(value, 6)
        }
        this.setRuntime('exchangeRate', value)
        if (isFromYF == false) {
            const origAmount = this.toFixedLocal(this.getRuntime('origAmount'), precision)
            if (origAmount) {
                if (origAmount * value != 0) {
                    const amount = origAmount * value
                    this.setRuntime('amount', this.toFixedLocal(amount, precision))
                }
            }
            if (isReverseForeignCurrency
                && !this.getRuntime('origAmount')
                && this.getRuntime('amount')
                && value) {
                if (this.getRuntime('exchangeRate')) {
                    this.setRuntime('origAmount', this.toFixedLocal(Math.abs(this.getRuntime('amount') / value)), precision)
                }
            }

        } else {
            if (this.getRuntime('amount')) {
                this.setRuntime('origAmount', this.toFixedLocal(this.getRuntime('amount') / value), precision)
            }
        }

    }

    /**
     * 本币失去焦点处理
     */
    onAmountBlur = (value, isBackCaculate, oldAmount) => {

        //修改本币金额--如果启用了外币核算
        //如果外币为0，汇率不为0，不反算外币；
        //修改金额，如果数量不为0，反算单价，如果外币不为0，反算汇率。不管单价汇率是否为0(空)
        //只反算单价和汇率，不反算数量、外币
        let path = this.props.path,
            editStatus = this.props.gf('data.other.editStatus'),
            isReverseForeignCurrency = this.props.gf('data.other.isReverseForeignCurrency'),
            details = this.props.gf('data.form.details'),
            curIndex = path.split(',')[1],
            isFromYF = false
        value = this.toFixedLocal(value, precision)
        this.setRuntime('amount', value)
        if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
            /**编辑状态下
             * 1.所有启用外币核算的币种都为人民币时
             * 2.编辑的是启用人民币的第一行
             **/
            let isNotRMBDetail = details.find(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') !== 1)
            let isNotRMBDetailIndex = details.findIndex(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') == 1)
            if (!isNotRMBDetail && isNotRMBDetailIndex == curIndex) {
                //符合条件
                console.log('---------符合条件-------------')
                isFromYF = true
            }
        }
        if (this.getRuntime('isCalcMulti')) {
            if (this.getRuntime('origAmount') && !this.isDeepSelfCurrency(curIndex)) {
                if (isFromYF == false) {
                    if (this.getRuntime('origAmount') && oldAmount != undefined && this.toFixedLocal(oldAmount, precision) !== value || !oldAmount) {

                        this.setRuntime('exchangeRate', Math.abs(value / this.toFixedLocal(this.getRuntime('origAmount'), precision)))
                    }
                } else {
                    if (this.getRuntime('exchangeRate')) {
                        this.setRuntime('origAmount', this.toFixedLocal(Math.abs(value / this.getRuntime('exchangeRate'))), precision)
                    }
                }

            } else if (this.isDeepSelfCurrency(curIndex)) {

                this.setRuntime('exchangeRate', 1)
                this.onOrigAmountBlur(value, isBackCaculate)
            }

            if (this.getRuntime('origAmount') && this.getRuntime('exchangeRate')) {
                let origAmount

                if (value.toString().substr(0, 1) == '-' &&
                    this.getRuntime('origAmount').toString().substr(0, 1) != '-') {

                    origAmount = '-' + this.getRuntime('origAmount').toString()
                    this.onOrigAmountBlur(origAmount, isBackCaculate)
                } else if (value.toString().substr(0, 1) != '-' &&
                    this.getRuntime('origAmount').toString().substr(0, 1) == '-') {

                    origAmount = this.getRuntime('origAmount').toString().substr(1, this.getRuntime('origAmount').toString().length - 1)
                    this.onOrigAmountBlur(origAmount, isBackCaculate)
                }
            }
            if (isReverseForeignCurrency && !this.getRuntime('origAmount') && this.getRuntime('exchangeRate')) {
                if (this.getRuntime('exchangeRate')) {
                    this.setRuntime('origAmount', this.toFixedLocal(Math.abs(value / this.getRuntime('exchangeRate'))), precision)
                }
            }
        }
        // --如果没有启用外币核算, 视同修改原币(此时汇率=1)
        else {
            this.onOrigAmountBlur(value, isBackCaculate, this.toFixedLocal(this.getRuntime('origAmount'), precision))
        }
    }

    /**
     * 币种切换
     */
    onCurrencyChange = (value) => {
        let currency, path = this.props.path,
            editStatus = this.props.gf('data.other.editStatus'),
            details = this.props.gf('data.form.details'),
            curIndex = path.split(',')[1],
            isFromYF = false
        for (let item of this.getRuntime('currencyDataSource')) {
            if (item.get('id') === value) {
                currency = item
                break
            }
        }
        if (!currency) {
            return
        }
        if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
            /**编辑状态下
             * 1.所有启用外币核算的币种都为人民币时
             * 2.编辑的是启用人民币的第一行
             **/
            let isNotRMBDetail = details.find(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') !== 1)
            let isNotRMBDetailIndex = details.findIndex(item => item.get('quantityAndForeignCurrency') &&
                item.get('quantityAndForeignCurrency').get('isCalcMulti') == true &&
                item.get('quantityAndForeignCurrency').get('currency') &&
                item.get('quantityAndForeignCurrency').get('currency').get('id') == 1)
            if (!isNotRMBDetail && isNotRMBDetailIndex == curIndex) {
                //符合条件
                console.log('---------符合条件-------------')
                isFromYF = true
            }
        }
        //修改币种: 获取汇率 -> 本币金额=原币金额*汇率
        this.setRuntime('currency', currency)
        let exchangeRate = currency.get('exchangeRate')
        this.onExchangeRateBlur(exchangeRate, isFromYF)
        this.setState({ isChangeFocus: true })

    }


    onCurrencyScroll = (e) => {
        if (e.preventDefault)
            e.preventDefault()
        if (e.stopPropagation)
            e.stopPropagation()
    }


    getCurrencyOption() {
        return this.getRuntime('currencyDataSource') ? this.getRuntime('currencyDataSource').map((item, index) =>
            <Option value={item.get('id')}>
                {item.get('name')}
            </Option>) :
            []
    }

    toFixedLocal(value, precision) {
        let ret = value
        if (value && value.toString().indexOf('.') > -1) {
            if (value.toString().split('.')[1].length > precision) {
                if (!isNaN(value)) {
                    //以下有问题，类似1.255这样的，四舍五入后，变成了1.25,调整成新的
                    // ret = Math.round(value * Math.pow(10, precision) / Math.pow(10, precision))
                    ret = Math.round(Math.abs(value) + 'e' + precision) / Math.pow(10, precision)
                    ret = value < 0 ? -ret : ret
                } else {
                    ret = 0
                }
            }
        }
        return ret
    }

    isExistCurrency(currencyId) {
        let currencyDataSource = this.getRuntime('currencyDataSource')
        if (!currencyDataSource) {
            return false
        }
        const filterItem = currencyDataSource.filter(item => item.get('id') == currencyId)
        return filterItem.size > 0
    }

    isDeepSelfCurrency(curIndex) {
        let isSelfCurrency = false, currencyId,
            currency_runtime = this.state.data_runtime ? this.state.data_runtime.get('currency') : undefined

        // 优先获取运行时的币种
        if (currency_runtime) {
            if (currency_runtime.get('isBaseCurrency') == undefined) {
                currencyId = currency_runtime.get('id')
            } else {
                return this.isSelfCurrency()
            }
        }

        if (!currencyId) {
            let quantityAndForeignCurrency = this.props.gf('data.form.details').get(curIndex).get('quantityAndForeignCurrency')
            if (!Map.isMap(quantityAndForeignCurrency) && !List.isList(quantityAndForeignCurrency) && (typeof quantityAndForeignCurrency == 'object')) {
                quantityAndForeignCurrency = fromJS(quantityAndForeignCurrency)
            }

            if (quantityAndForeignCurrency && quantityAndForeignCurrency.get('currency')) {
                currencyId = quantityAndForeignCurrency.get('currency').get('id')
            }
        }

        if (currencyId) {
            let currencyDataSource = this.getRuntime('currencyDataSource')
            if (!currencyDataSource) {
                isSelfCurrency = false
            }
            const filterItem = currencyDataSource.filter(item => item.get('id') == currencyId)

            if (filterItem.size > 0) {
                return filterItem.get(0).get('isBaseCurrency')
            } else {
                isSelfCurrency = false
            }
        } else {
            isSelfCurrency = false
        }

        return isSelfCurrency
    }

    isSelfCurrency() {
        let currency = this.getRuntime('currency')
        if (currency == undefined) {
            currency = this.state.data.get('value').get('currency')
        }
        return currency && currency.get('isBaseCurrency')
    }

    /**
     * 
     * @param {获取当前编辑行数据} data 
     */
    getEditContent(data) {
        if (!data || (!data.isCalcQuantity && !data.isCalcMulti)) {
            return undefined
        }
        let inputStyle = { marginTop: '7px' },
            rightButtonStyle = { marginLeft: '10px', height: '30px', lineHeight: '30px' },
            buttonStyle = { marginTop: '12px', display: 'flex', justifyContent: 'center' },
            selectStyle = { minWidth: '95px', 'z-index': 9999 },
            curIndex = this.props.path.split(',')[1]

        return <div ref='quantityEdit' className="accountQuantityEdit">
            {
                data.isCalcMulti ?
                    <div id='selCurrency'>
                        <span>币种：</span>
                        <Select
                            style={selectStyle}
                            onChange={this.onCurrencyChange}
                            onPopupScroll={this.onCurrencyScroll}
                            value={data.currency ? this.isExistCurrency(data.currency.get('id')) ? data.currency.get('id') : data.currency.get('name') : ''}
                        >
                            {
                                this.getCurrencyOption()
                            }
                        </Select>
                    </div> : ''
            }
            {
                data.isCalcQuantity ?
                    <div>
                        <div style={inputStyle} className='txtQuantity' >
                            <span>数量：</span>
                            <Input.Number
                                regex='^(-?[0-9]+)(?:\.[0-9]{1,6})?$'
                                value={data.quantity ? this.toFixedLocal(data.quantity, 6) : '0'}
                                precision={6}
                                style={{ width: '95px' }}
                                max='9999999999.99'
                                onBlur={this.onQuantityBlur} />
                        </div>
                        <div style={inputStyle} className='txtPrice' >
                            <span>单价：</span>
                            <Input.Number
                                precision={6}
                                value={data.price ? this.toFixedLocal(data.price, 6) : '0'}
                                style={{ width: '95px' }}
                                min='0'
                                max='9999999999.99'
                                onBlur={this.onPriceBlur} />
                            <span style={{ marginLeft: '4px' }}>{data.currency && data.isCalcMulti ? data.currency.get('name') : ''}</span>
                        </div>
                    </div>
                    : ''
            }

            {
                data.isCalcMulti ?
                    <div>
                        <div style={inputStyle} className='txtOrigAmount'>
                            <span>外币：</span>
                            <Input.Number
                                value={data.origAmount ? this.toFixedLocal(data.origAmount, 2) : ''}
                                precision={precision}
                                style={{ width: '95px' }}
                                max='9999999999.99'
                                onBlur={this.onOrigAmountBlur} />
                        </div>
                        <div style={inputStyle} className='txtExchangeRate' >
                            <span>汇率：</span>
                            <Input.Number
                                disabled={this.isDeepSelfCurrency(curIndex)}
                                value={data.exchangeRate ? this.toFixedLocal(data.exchangeRate, 6) : ''}
                                style={{ width: '95px' }}
                                min="0"
                                max='9999999999.99'
                                onBlur={this.onExchangeRateBlur} />
                        </div>
                    </div>
                    : ''
            }
            {
                data.isCalcMulti ?
                    <div style={inputStyle} className='txtAmount'>
                        <span>本币：</span>
                        <Input.Number
                            ref='txtAmount'
                            value={data.amount ? this.toFixedLocal(data.amount, precision) : ''}
                            precision={precision}
                            style={{ width: '95px' }}
                            max='9999999999.99'
                            onBlur={this.onAmountBlur} />
                    </div>
                    :
                    <div style={inputStyle} className='txtAmount'>
                        <span>金额：</span>
                        <Input.Number
                            ref='txtAmount'
                            value={data.amount ? this.toFixedLocal(data.amount, precision) : ''}
                            precision={precision}
                            style={{ width: '95px' }}
                            max='9999999999.99'
                            onBlur={this.onAmountBlur} />
                    </div>
            }
            <div style={buttonStyle}>
                <Button className='btnQuantityCancel' type="ghost" onClick={this.handleCancelClick} style={{ height: '30px', lineHeight: '30px' }}>取消</Button>
                <Button id='btnQuantityConfirm' type="primary" style={rightButtonStyle} onClick={this.handleConfirmClick}>确定</Button>
            </div >
        </div >
    }

    /**
     * 渲染外币数量
     */
    render() {
        const data = this.state.data,
            itemValue = data.get('value'),
            fromPage = data.get('fromPage')

        if (!itemValue) {
            return <div></div>
        }

        if (typeof itemValue != 'object') {
            return <div>{itemValue}</div>
        }

        const editData = this.getEditData(),
            content = this.getEditContent(editData),
            originData = this.getOrignEditData(),
            spanStyle = { display: 'block', height: '16px' },
            quantity = originData.quantity ? this.toFixedLocal(originData.quantity, 6) : 0,
            unitPrice = originData.price ? this.toFixedLocal(originData.price, 6) : 0,
            origAmount = originData.origAmount ? this.toFixedLocal(originData.origAmount, precision) : '',
            rate = originData.exchangeRate ? this.toFixedLocal(originData.exchangeRate, 6) : '',
            currency = originData.currency ? originData.currency.get('name') : ''

        let isPopoverVisible = this.state.isEditing && !this.get('hidePopover')
        if (this.state.data.get('isShow')) {
            isPopoverVisible = (this.state.data.get('index') == this.state.data.get('path').split(',')[1]) ? this.state.data.get('isShow') : (this.state.isEditing && !this.get('hidePopover'))
        }
        if (!originData.isCalcQuantity && !originData.isCalcMulti) {
            return <div></div>
        }

        return (
            <Popover overlayClassName='accountQuantityEdit-popover'
                placement="right"
                content={content}
                trigger="click"
                visible={isPopoverVisible}
                onVisibleChange={this.handleVisibleChange}
                getTooltipContainer={() => this.getPopupContainer(fromPage)}>
                <div title={`${originData.isCalcMulti ? `币种：${currency}` : ''} ` +
                    `${originData.isCalcQuantity ? `数量：${quantity} ${originData.unitName || ''} ` : ''}` +
                    `${originData.isCalcQuantity ? `单价：${unitPrice} ` : ''}` +
                    `${originData.isCalcMulti ? `外币：${origAmount} ` : ''}` +
                    `${originData.isCalcMulti ? ` 汇率：${rate} ` : ''}`
                } className='accountQuantity'>
                    {originData.isCalcMulti ? <span style={spanStyle}>{`币种：${currency}`}</span> : ''}
                    {originData.isCalcQuantity ? <span style={spanStyle}>{`数量：${quantity} ${originData.unitName || ''}`}</span> : ''}
                    {originData.isCalcQuantity ? <span style={spanStyle}>{`单价：${unitPrice}`}</span> : ''}
                    {originData.isCalcMulti ? <span style={spanStyle}>{`外币：${origAmount}`}</span> : ''}
                    {originData.isCalcMulti ? <span style={spanStyle}>{`汇率：${rate}`}</span> : ''}
                </div>
            </Popover>
        )
    }
}
