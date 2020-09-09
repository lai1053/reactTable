import React from 'react'
import ReactDOM from 'react-dom'
import config from './config'
import moment from 'moment'
import extend from './extend'
import * as data from './data'
import isEquall from 'lodash.isequal'
import debounce from 'lodash.debounce'
import utils, { fetch, environment } from 'edf-utils'
import { action as MetaAction } from 'edf-meta-engine'
import { Select, Calculator } from 'edf-component'
import { Map, fromJS, List, is } from 'immutable'
import { consts } from 'edf-consts'
const { Option, OptGroup } = Select;
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.lazySearch = debounce(this.lazySearch, 200);
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        localStorage.removeItem('auxAccountSubjects')
        let initData = this.component.props.initData
        this.settleAccounts = this.component.props.settleAccounts
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if (addTabsCloseListen) {
            addTabsCloseListen('app-proof-of-charge-common-edit', this.hasModify)
        }

        let addTabChangeListen = this.component.props.addTabChangeListen
        if (addTabChangeListen) {
            addTabChangeListen('app-proof-of-charge-common-edit', this.hasModify)
        }

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        this.setrowsCount()

        this.load(initData)
    }

    load = async (initData) => {
        let other = {
            'data.other.innerHeight': window.innerHeight,
            'data.other.innerWidth': window.innerWidth
        }
        const baseArchiveList = await this.webapi.certificate.getBaseArchive()
        const isAutoEqualAmount = await this.webapi.certificate.getAutoBalance()
        const subjectList = await this.getSubjectList(baseArchiveList.glAccountQueryDto)
        const currencyList = baseArchiveList.currencyDtos
        const enabledYearMonth = this.getEnabledYearMonth()
        other['data.other.summarys'] = fromJS([...baseArchiveList.summarys, ...this.translateTemplate(baseArchiveList.glDocTemplateDtos)])
        other['data.other.copyDoc'] = initData && initData.type == 'copyDoc'
        other['data.other.copyType'] = initData && initData.copyType
        other['data.other.isFromXdz'] = initData && initData.type == 'isFromXdz'
        other['data.other.isAutoEqualAmount'] = isAutoEqualAmount
        if (initData.template) {
            const certificateData = initData.template
            this.injections.reduce('initLoadCertificate', fromJS(certificateData), enabledYearMonth, subjectList, currencyList, other)
        }
    }

    // 设置摘要数据源
    setSummaryDS = async (summaryList, templateList) => {
        this.injections.reduce('setSummaryDS', fromJS([...summaryList, ...this.translateTemplate(templateList)]))
    }

    onMouseDown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (path.indexOf('cell.cell.dropdownFooter.add') > -1) return true
        if (path.indexOf('.cell.cell,') != -1) {
            this.extendAction.gridAction.mousedown(e)
        }
        let pzpath = this.metaAction.gf('data.other.path')
        //处理摘要直接录入，界面卡顿效率慢的问题，摘要不能使用onChange事件
        if (path && path.indexOf('.cell.cell,') > -1 &&
            document.activeElement.className == "ant-select-search__field",
            document.activeElement.id == 'summary'
        ) {
            let rowIndex = this.metaAction.gf('data.other.index'),
                cummaryData = document.activeElement.value
            this.updateSummaryData(rowIndex, cummaryData)
        }

        //处理金额录入内存泄漏问题，借贷方金额不能使用onChange事件
        if (pzpath && pzpath.indexOf('.cell.cell,') > -1 &&
            (document.activeElement.className == "ant-input" ||
                document.activeElement.className == "ant-input mk-input-number app-proof-of-charge-common-edit-cell editable-cell")) {
            let amountData = document.activeElement.value
            this.amountChange(pzpath)(amountData)
            this.amountBlur(pzpath)()
        }
    }


    //借贷方金额的change事件只做特殊字符的校验，不做state的设置
    specialAmountChange = (path) => (newValue, oldValue) => {
        let editStatus = this.metaAction.gf('data.other.editStatus')
        if (newValue == '0') {
            if (oldValue != newValue) {  //点选右边修改科目使其保存可用
                if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
                    this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
                }
            }
            return
        }
        this.injections.reduce('updateSpecialAmount', path, oldValue, newValue)
    }

    amountChange = (path) => (newValue, oldValue) => {
        let editStatus = this.metaAction.gf('data.other.editStatus')
        if (newValue == '0') {
            if (oldValue != newValue) {  //点选右边修改科目使其保存可用
                if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
                    this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
                }
            }
            return
        }
        let isRenderScroll = this.metaAction.gf('data.other.isRenderScroll'), otherObj = {}
        if ((editStatus == data.ADD_STATUS || editStatus == data.EDIT_STATUS) && isRenderScroll) {
            otherObj['data.other.isRenderScroll'] = false
            this.injections.reduce('setOther', otherObj)
        }
        this.injections.reduce('onFieldChange', path, oldValue, newValue)
    }

    /**
    * 更新摘要数据
    */
    updateSummaryData = (rowIndex, value) => {
        let details = this.metaAction.gf('data.form.details'),
            other = {}
        details = details.update(rowIndex, item => item.set('summary', value))
        other['data.form.details'] = details
        let edit_status = this.metaAction.gf('data.other.editStatus')
        // if (edit_status != data.ADD_STATUS) {
        //     other['data.other.editStatus'] = data.EDIT_STATUS
        // }
        let isRenderScroll = this.metaAction.gf('data.other.isRenderScroll')
        if ((edit_status == data.ADD_STATUS || edit_status == data.EDIT_STATUS) && isRenderScroll) {
            other['data.other.isRenderScroll'] = false
        }
        this.injections.reduce('setOther', other)
    }

    getSubjectList = (subjectList) => {
        let subjectListEnable = []

        subjectList.glAccounts.map(item => {
            if (!!item.isEnable) {
                subjectListEnable.push(item)
            }
        })

        subjectList.glAccountsAll = subjectList.glAccounts
        subjectList.glAccounts = subjectListEnable

        return subjectList
    }

    setrowsCount = (other) => {
        let charge = document.getElementsByClassName("edfx-app-portal-content-main"),
            data = this.metaAction.gf('data').toJS(),
            details = data.form.details,
            length = details.length,
            height, value = []

        height = charge[0].clientHeight - 220

        if (other) {
            other['data.other.mainHeight'] = Math.floor(height / 49)
        } else {
            this.injections.reduce('setOther', { 'data.other.mainHeight': Math.floor(height / 49) })
        }

        if (charge.length != 0) {
            length = Math.floor(height / 49) > 5 ? Math.floor(height / 49) : 5
            const blankVoucherItem = {
                summary: '',
                accountingSubject: undefined,
                debitAmount: undefined,
                creditAmount: ''
            }
            value = Array(length - 5).fill(blankVoucherItem);
        }
        details = details.concat(value)
        this.injections.reduce('setrowsCount', details, details.length, other)
    }

    getEnabledYearMonth = () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth.toString().padStart(2, '0')

        return enabledYearMonth
    }

    getCurrentUser = () => {
        return this.metaAction.context.get("currentUser")
    }

    renderSelectComponent = (_ctrlPath) => {
        console.log(_ctrlPath)
        let activeElement = document.getElementById('auxItemConfirm'),
            _cancelEditAuxAccount = this.metaAction.gf('data.other.cancelEditAuxAccount'),
            _isReadOnly = this.metaAction.isReadOnly(_ctrlPath)
        if (_isReadOnly) {
            return 'SubjectDisplay'
        }
        if (activeElement == null || activeElement == undefined || _cancelEditAuxAccount) {
            this.injections.reduce('setOther', { 'data.other.cancelEditAuxAccount': null })
            return 'Select'
        }
        return 'SubjectDisplay'
    }

    onFieldFocus = (path) => {
        if (path.indexOf('summary') > -1) {
            this.backCaculateAmount()
            this.extendAction.gridAction.cellAutoFocus()
        } else if (path.indexOf('accountingSubject') > -1) {
            let other = {
                'data.other.placeholder': '输入编码、拼音或名称过滤科目',
                // 'data.other.accountingEditSubjectOptions': data.renderSelectOption(accountingEditSubjects)
            }
            this.injections.reduce('setOther', other)
            let rowIndex = parseInt(path.split(',')[1]),
                detail = this.metaAction.gf('data.form.details').get(rowIndex),
                accountingSubject = detail.get('accountingSubject')

            if (!!accountingSubject) {
                let codeAndName = accountingSubject.get('codeAndName'),
                    accountId = accountingSubject.get('id'),
                    dom = document.getElementsByClassName('ant-select-selection-selected-value'),
                    accountingEditSubjects = window.accountingEditSubjects,
                    itemData = data.find(accountingEditSubjects, 'id', accountId), //accountingEditSubjects.find(o => o.get('id') == accountId),
                    auxAccountSubjects = accountingSubject.get('auxAccountSubjectsPreSelected')

                if (!itemData) {
                    if (dom && dom.length > 0) {
                        let subjectWidthAuxName = this.getSubjectWithAuxName(codeAndName, accountingSubject, auxAccountSubjects)

                        dom[0].innerHTML = subjectWidthAuxName
                        dom[0].title = subjectWidthAuxName
                    }
                }
            }
            // 当凭证中的科目被停用后，再次点击科目时，显示科目名及辅助项目 END 0110
            this.backCaculateAmount()
            if (rowIndex == this.metaAction.gf('data.form.details').size - 1) {
                this.extendAction.gridAction.cellAutoFocus()
            }
        } else if (path.indexOf('debitAmount') > -1 || path.indexOf('creditAmount') > -1) {
            let rowIndex = parseInt(path.split(',')[1])
            if (rowIndex == this.metaAction.gf('data.form.details').size - 1) {
                this.extendAction.gridAction.cellAutoFocus()
            }
        }
        // 增加settimeout，解决录入后切换焦点丢数的问题
        let defaultLength = this.metaAction.gf('data.other.defaultLength'),
            rowIndex = parseInt(path.split(',')[1]),
            otherObj = {}


        // 实现借方金额、贷方金额的onBlur之用
        if (this.metaAction.gf('data.other.originalFieldPath') == undefined) {
            otherObj['data.other.originalFieldPath'] = path
        }
        if (rowIndex != this.metaAction.gf('data.other.index')) {
            otherObj['data.other.index'] = rowIndex
        }
        this.injections.reduce('onFieldFocus', path, otherObj)

        //数量外币PopOver框打开时
        if (this.isVisibleQuanAndCurrCom()) {
            let btnQuantityCancels = document.getElementsByClassName('btnQuantityCancel')
            for (var i = btnQuantityCancels.length - 1; i > -1; i--) {
                let btnQuantityCancel = btnQuantityCancels[i],
                    popOver = btnQuantityCancels[i].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

                if (popOver && popOver.className.indexOf('ant-popover-hidden') == -1 && btnQuantityCancel) {
                    btnQuantityCancel.click()
                }
            }
        }
    }

    getSubjectWithAuxName(subjectName, accountingSubject, auxAccountSubjects) {
        if (!accountingSubject.get('isCalc')) return subjectName

        let subjectWithAuxName = ''

        if (accountingSubject.get('isCalcCustomer') && auxAccountSubjects.get('customer') && auxAccountSubjects.get('customer').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('customer').get('name')
        }
        if (accountingSubject.get('isCalcSupplier') && auxAccountSubjects.get('supplier') && auxAccountSubjects.get('supplier').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('supplier').get('name')
        }
        if (accountingSubject.get('isCalcProject') && auxAccountSubjects.get('project') && auxAccountSubjects.get('project').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('project').get('name')
        }
        if (accountingSubject.get('isCalcDepartment') && auxAccountSubjects.get('department') && auxAccountSubjects.get('department').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('department').get('name')
        }
        if (accountingSubject.get('isCalcPerson') && auxAccountSubjects.get('person') && auxAccountSubjects.get('person').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('person').get('name')
        }
        if (accountingSubject.get('isCalcInventory') && auxAccountSubjects.get('inventory') && auxAccountSubjects.get('inventory').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('inventory').get('name')
        }

        //自定义档案
        for (var j = 1; j <= 10; j++) {
            if (accountingSubject.get(`isExCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`).get('name')) {
                subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get(`exCalc${j}`).get('name')
            }
        }

        return subjectName + '_' + subjectWithAuxName
    }

    backCaculateAmount = () => {
        let originalFieldPath = this.metaAction.gf('data.other.originalFieldPath')
        if (originalFieldPath) {
            //处理某一分录行填写表格中的金额后，再点击该行数量外币列时，弹出框的金额没有被反算的问题 0310
            let lastEditRowIndex = originalFieldPath.split(',')[1],
                detail = this.metaAction.gf('data.form.details').get(lastEditRowIndex)
            if (!detail) {
                return
            }
            let quantityAndForeignCurrency = detail.get('quantityAndForeignCurrency')
            if (!quantityAndForeignCurrency) {
                return
            }
            let amount = quantityAndForeignCurrency.get('amount'),
                lastFocusPath = originalFieldPath,
                lastEditField
            if (lastFocusPath && lastFocusPath.indexOf('debitAmount') != -1) {
                lastEditField = 'debitAmount'
            } else if (lastFocusPath && lastFocusPath.indexOf('creditAmount') != -1) {
                lastEditField = 'creditAmount'
            } else {
                lastEditField = undefined
            }
            if (lastEditField && amount != detail.get(lastEditField)) {
                this.injections.reduce('onEvent', 'onBlur', { path: originalFieldPath })
            }
        }
    }

    //公共方法
    isVisibleQuanAndCurrCom = () => {
        let ret = false

        if (document.getElementsByClassName) {
            let accountQuantityEdit = document.getElementsByClassName('accountQuantityEdit')[0],
                quantityPopOver = document.getElementsByClassName('ant-popover')

            if (accountQuantityEdit) {
                if (quantityPopOver && quantityPopOver.length > 0) {
                    for (var i = 0; i < quantityPopOver.length; i++) {
                        if (quantityPopOver[i] && quantityPopOver[i].className.indexOf('ant-popover-hidden') == -1) {
                            ret = true
                            break
                        }
                    }
                }
            }
        }

        return ret
    }

    onEvent = async (eventName, option) => {
        if (!option.path) {
            return
        }

        if (eventName === 'accountQuantityIsShow') {
            this.injections.reduce('accountQuantityIsShow', option)
            // 当点击数量外币框的【确定】按钮时，若汇率变更后更新数据库 0403
            // if (option.error == '') {              更新基础档案的汇率动作推迟到保存凭证中去做，故此处先注掉
            //     this.updateExchangeRate(option)
            // }
            this.extendAction.gridAction.cellAutoFocus()

        } else if (eventName === 'cancelEditAuxAccount') {
            this.injections.reduce('cancelEditAuxAccount', option)
            this.metaAction.focus(option.path)
            this.extendAction.gridAction.cellAutoFocus()
        } else if (eventName === 'endEditAuxAccount') {

            let editStatus = this.metaAction.gf('data.other.editStatus'),
                balance

            if (editStatus == data.ADD_STATUS || editStatus == data.EDIT_STATUS) {
                balance = await this.getAccountBalance(option.path, undefined, option)
                option.balance = balance
                option.initBalance = balance
            }
            this.injections.reduce('endEditAuxAccount', option, balance)
            this.extendAction.gridAction.cellAutoFocus()

        } else {
            this.injections.reduce('onEvent', eventName, option)
        }
    }

    updateExchangeRate = async (option) => {
        let path = option.path,
            oldValue = option.oldValue,
            newValue = option.newValue

        // 凭证中的汇率变化后，同时更新对应币种的汇率
        if (this.metaAction.gf('data.form.details').get(option.path.split(',')[1]).get('accountingSubject').get('isCalcMulti') == true) {
            if (oldValue.get('currency') && newValue.get('currency') &&
                oldValue.get('currency').get('id') == newValue.get('currency').get('id') &&
                oldValue.get('currency').get('exchangeRate') != newValue.get('exchangeRate')) {

                let currencyDS = this.metaAction.gf('data.other.currencyDS')
                let index = currencyDS.findIndex(item => {
                    return item.get('id') == newValue.get('currency').get('id')
                })

                if (index > -1) {
                    let selectedCurrency = currencyDS.get(index)
                    selectedCurrency = selectedCurrency.set('exchangeRate', newValue.get('exchangeRate'))
                    selectedCurrency.isReturnValue = true

                    let ret = await this.webapi.currency.update(selectedCurrency),
                        baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetDoc: true, isNotGetCurrency: true, isNotGetSummary: true }),
                        subjectList = this.getSubjectList(baseArchiveList.glAccountQueryDto)

                    if (ret.error == undefined) {
                        let details = this.metaAction.gf('data.form.details'),
                            currency = details.get(path.split(',')[1]).getIn(['quantityAndForeignCurrency', 'currency'])

                        currency = currency.set('exchangeRate', newValue.get('exchangeRate'))
                        details = details.update(path.split(',')[1], item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))

                        currencyDS = currencyDS.update(index, item => item.set('exchangeRate', ret.exchangeRate).set('ts', ret.ts))

                        let other = {
                            'data.form.details': details,
                            'data.other.currencyDS': currencyDS
                        }
                        window.accountingEditSubjects = fromJS(subjectList.glAccounts)
                        window.accountingEditSubjectsAll = fromJS(subjectList.glAccountsAll)
                        this.injections.reduce('setOther', other)
                    }
                }
            }
        }
    }

    //把服务端返回的字段名, 做转换
    translateTemplate = (templates) => {
        let templateList = []
        for (let i = 0; i < templates.length; i++) {
            templateList.push({
                id: templates[i].docTemplateId,
                code: templates[i].docTemplateCode,
                name: templates[i].docTemplateName + ' [模板]',
                type: 'template'
            })
        }

        return templateList
    }

    /**
    * 科目模糊匹配
    */
    filterOption = (inputValue, option) => {
        let accountingEditSubjects = window.accountingEditSubjects,
            conditionLeft,
            conditionRight
        if (!accountingEditSubjects) {
            return false
        }
        if (inputValue.indexOf(' ') > -1) {
            const index = inputValue.indexOf(' ')
            conditionLeft = inputValue.slice(0, index) || inputValue.slice(index).replace(/\s*/g, "")
            conditionRight = inputValue.slice(index).replace(/\s*/g, "")
        } else {
            conditionLeft = inputValue
        }

        if (option && option.props && option.props.value && accountingEditSubjects.size > 0) {
            let itemData
            for (var i = 0; i < accountingEditSubjects.size; i++) {
                if (accountingEditSubjects.get(i).get('id') == option.props.value) {
                    itemData = accountingEditSubjects.get(i)
                    break
                }
            }
            if (itemData && this.getSearchCondition(itemData, { conditionLeft, conditionRight })) {

                // //将滚动条置顶  注释掉滚动条置顶，要不然懒加载放开后，滚动条 滚动不下去
                // let select = document.getElementsByClassName('ant-select-dropdown-menu')
                // if (select.length > 0 && select[0].scrollTop > 0) {
                //     select[0].scrollTop = 0
                // }
                return true
            }
            else {
                return false
            }
        }
        return true
    }

    getSearchCondition = (item, searchValue) => {
        //inputValue = inputValue.replace(/\s*/g, "")  //去除所有空格      
        const data = `${item.get('code')}${item.get('gradeName')}${item.get('helpCode')}${item.get('helpCodeFull')}`
        const { conditionLeft, conditionRight } = searchValue
        if (/^[0-9]+$/.test(conditionLeft)) {
            return data.toUpperCase().indexOf(conditionLeft.toUpperCase()) == 0 &&
                (conditionRight ? data.toUpperCase().indexOf(conditionRight.toUpperCase()) != -1 : true)
        } else {
            return data.toUpperCase().indexOf(conditionLeft.toUpperCase()) != -1 &&
                (conditionRight ? data.toUpperCase().indexOf(conditionRight.toUpperCase()) != -1 : true)
        }
    }

    /**
    * 科目查找数据
    */
    lazySearch = async (inputValue) => {
        let curAccountList = fromJS([]),
            conditionLeft,
            conditionRight,
            accountList = window.accountingEditSubjects,
            other = {}
        if (accountList.size < 1) {
            return curAccountList
        }
        if (inputValue.indexOf(' ') > -1) {
            const index = inputValue.indexOf(' ')
            conditionLeft = inputValue.slice(0, index) || inputValue.slice(index).replace(/\s*/g, "")
            conditionRight = inputValue.slice(index).replace(/\s*/g, "")
        } else {
            conditionLeft = inputValue
        }
        if (conditionLeft) {
            if (/^[0-9]+$/.test(conditionLeft.slice(0, 1))) {
                const data = this.getIndexGroupData(inputValue.slice(0, 1))
                if (conditionLeft.length > 1) {
                    curAccountList = data.filter(item => {
                        return this.getSearchCondition(item, { conditionLeft, conditionRight })
                    })
                } else {
                    curAccountList = data
                }
            } else {
                curAccountList = accountList.filter(item => {
                    return this.getSearchCondition(item, { conditionLeft, conditionRight })
                })
            }
        } else {
            curAccountList = this.getIndexGroupData()
        }

        window.accountingEditSubjectOptions = curAccountList
        other['data.other.keyRandom'] = Math.floor(Math.random() * 1000000)
        this.injections.reduce('setOther', other)
    }

    renderCellContent = (keyRandom, accountingEditSubjectOptions) => {
        let res = []
        if (!window.accountingEditSubjects) {
            return res
        }
        if (!!!accountingEditSubjectOptions) {
            accountingEditSubjectOptions = window.accountingEditSubjects
        }
        res = accountingEditSubjectOptions.toJS().map(item => {
            return (
                <Option
                    key={item.id}
                    className="app-proof-of-charge-common-edit-form-details-account"
                    value={item.id}
                    keyRandom={keyRandom}
                    title={item.codeAndName}
                >
                    {item.codeAndName}
                </Option>
            )
        })
        return res

    }

    /**
     * 按照科目编码进行分组
     */
    getIndexGroupData = (index) => {
        const accountingEditSubjects = window.accountingEditSubjects
        let groupAccounts = fromJS([])
        if (accountingEditSubjects && groupAccounts.size < 1) {
            groupAccounts = accountingEditSubjects.groupBy(val => val.get('code').slice(0, 1))
        }
        if (groupAccounts.size > 0) {
            return index ? groupAccounts.get(index) : accountingEditSubjects
        }
        return []
    }

    summaryOption = () => {
        let summarys = this.metaAction.gf('data.other.summarys'),
            data = []
        if (summarys) {
            summarys.map(d => { data.push(<Option title={d.get('text')} label={d.get('name')} key={d.get('name')} className={'app-proof-of-charge-common-edit-form-details-account'}>{d.get('name')}</Option>) })
        }
        return data
    }

    isRowOperation = () => {
        return this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED
    }

    onOk = async () => {
        const form = this.metaAction.gf('data.form').toJS()
		const ok = await this.check([{ path: 'data.form.code', value: form.code },
		{ path: 'data.form.name', value: form.name }])
		if (!ok){
			return false
        } 
        
        if (!this.canSaveAsTemplate()) {
            this.metaAction.toast('warning', '没有填写科目的凭证不能存为模板')
            return
        }
        let option = this.getTemplateFromCertificate()
        let response = await this.webapi.certificate.commonCreate(option)
        if (response && response.result == false) {
            this.metaAction.toast('warning', response.error.message)
            return false
        } else {
            this.metaAction.toast('success', '常用模版保存成功')
        }
    }

    //必填项校验
	check = async (fieldPathAndValues) => {
		if (!fieldPathAndValues){
			return
		}			
		var checkResults = []
		for (var o of fieldPathAndValues) {
			let r = { ...o }
			if (o.path == 'data.form.code') {
				Object.assign(r, await this.checkCode(o.value))
			}
			else if (o.path == 'data.form.name') {
				Object.assign(r, await this.checkName(o.value))
			}
			checkResults.push(r)
		}
		var json = {}
		var hasError = true
		checkResults.forEach(o => {
			json[o.path] = o.value
			json[o.errorPath] = o.message
			if (o.message)
				hasError = false
		})
		this.metaAction.sfs(json)
		return hasError
	}

	checkCode = async (code) => {
		var message
		if (!code)
			message = '请录入编码'

		return { errorPath: 'data.other.error.code', message }
	}

	checkName = async (name) => {
		var message
		if (!name)
			message = '请录入名称'

		return { errorPath: 'data.other.error.name', message }
	}

    //把凭证单据,转换成模板数据
	getTemplateFromCertificate = () => {
		let certificateData = this.metaAction.gf('data.form'),
			template = {}
		template.docTemplateCode = certificateData.get('code')
		template.docTemplateName = certificateData.get('name')
		template.isSaveAmount = certificateData.get('isSaveAmount') || false
        template.docType = certificateData.get('docType')
        template.orderNo = certificateData.get('orderNo')
        template.ids = certificateData.get('ids')
		template.isReturnValue = true
		template.entrys = []
		let details = certificateData.get('details')
		if (details && details.size) {
			for (let item of details) {
				let entry = this.convertVoucherItemForServer(item, false)
				if (entry) {
					template.entrys.push(entry)
				}
			}
		}
		return template
    }
    
    convertVoucherItemForServer = (item, isForUpdate) => {
		if (!item || !item.get('accountingSubject')) {
			return undefined
		}
		let accountingSubject = item.get('accountingSubject')
		//如果需要数量/外币 核算,但是没有填写
		if ((accountingSubject.get('isCalcQuantity') || accountingSubject.get('isCalcMulti')) &&
			!item.get('quantityAndForeignCurrency')) {
			return undefined
		}
		//如果需要辅助核算,但是没有填写
		if (accountingSubject.get('isCalc') && !accountingSubject.get('auxAccountSubjects')) {
			return undefined
        }
        console.log(item)
		let entry = {
			summary: item.get('summary'),
			accountId: accountingSubject.get('id'),
			origAmountDr: item.get('debitAmount'),
			amountDr: item.get('debitAmount'),
			origAmountCr: item.get('creditAmount'),
			amountCr: item.get('creditAmount'),
			inPutTaxDeductId: item.get('inPutTaxDeductId') ? item.get('inPutTaxDeductId') : null
		}
		//考虑修改的情况: 修改分录
		if (isForUpdate) {
			if (item.get('id')) {
				entry.id = item.get('id')
				entry.rowStatus = 2
				entry.ts = item.get('ts')
			}
			else {
				entry.rowStatus = 1  //--分录状态 0:未变化  1:新增  2:修改  3:删除
			}
		}

		//数量辅助核算
		if (accountingSubject.get('isCalcQuantity')) {
			entry.quantity = item.get('quantityAndForeignCurrency').get('quantity')
			entry.price = item.get('quantityAndForeignCurrency').get('price')
			entry.unitId = accountingSubject.get('unitId') //计量单位, 暂不支持编辑, 所以用科目里设置的即可
			entry.exchangeRate = 1
		} else {
			entry.quantity = null
			entry.price = null
			entry.unitId = null
			entry.exchangeRate = null
		}

		//外币辅助核算
		if (accountingSubject.get('isCalcMulti')) {
			entry.currencyId = item.get('quantityAndForeignCurrency').get('currency') ? item.get('quantityAndForeignCurrency').get('currency').get('id') : ''
			entry.exchangeRate = item.get('quantityAndForeignCurrency').get('exchangeRate')
			if (entry.amountDr) {
				entry.origAmountDr = item.get('quantityAndForeignCurrency').get('origAmount') || 0
			}
			else {
				entry.origAmountCr = item.get('quantityAndForeignCurrency').get('origAmount') || 0
			}
		} else {
			entry.currencyId = null
			entry.exchangeRate = 1
			entry.origAmountDr = null
			entry.origAmountCr = null
		}

		//其他辅助核算
		if (accountingSubject.get('isCalc')) {
			let auxAccountSubjects = accountingSubject.get('auxAccountSubjects')
			//部门
			if (accountingSubject.get('isCalcDepartment')) {
				entry.departmentId = auxAccountSubjects.get('department').get('id')
			} else {
				entry.departmentId = null //为了保持上下分录属性字段数量一致，需传null 临时方案 haozhao
			}

			//人员
			if (accountingSubject.get('isCalcPerson')) {
				entry.personId = auxAccountSubjects.get('person').get('id')
			} else {
				entry.personId = null
			}

			//客户
			if (accountingSubject.get('isCalcCustomer')) {
				entry.customerId = auxAccountSubjects.get('customer').get('id')
			} else {
				entry.customerId = null
			}

			//供应商
			if (accountingSubject.get('isCalcSupplier')) {
				entry.supplierId = auxAccountSubjects.get('supplier').get('id')
			} else {
				entry.supplierId = null
			}

			//存货
			if (accountingSubject.get('isCalcInventory')) {
				entry.inventoryId = auxAccountSubjects.get('inventory').get('id')
			} else {
				entry.inventoryId = null
			}

			//项目
			if (accountingSubject.get('isCalcProject')) {
				entry.projectId = auxAccountSubjects.get('project').get('id')
			} else {
				entry.projectId = null
			}

			for (var j = 1; j <= 10; j++) {
				if (accountingSubject.get(`isExCalc${j}`)) {
					entry[`exCalc${j}`] = auxAccountSubjects.get(`exCalc${j}`).get('id')
				} else {
					entry[`exCalc${j}`] = null
				}
			}
		} else {
			entry.customerId = null
			entry.departmentId = null
			entry.personId = null
			entry.inventoryId = null
			entry.supplierId = null
			entry.projectId = null
			for (var j = 1; j <= 10; j++) {
				entry[`exCalc${j}`] = null
			}
		}
		return entry
	}

    //能否存为模板(空凭证不能存为模板)
    canSaveAsTemplate = () => {
        let details = this.metaAction.gf('data.form.details')

        for (let item of details) {
            let itemForServer = this.convertVoucherItemForServer(item)
            if (itemForServer) {
                return true
            }
        }
        return false
    }  

    // 获取多个科目的余额
    getMultiAccountBalance = async (entrys) => {
        let certificateDate = moment(this.metaAction.gf('data.form.date')),
            year = certificateDate.year(),
            period = certificateDate.month() + 1

        if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || this.metaAction.gf('data.other.editStatus') == data.EDIT_STATUS) {
            let queryParams = [], param, entry

            for (var i = 0; i < entrys.length; i++) {
                entry = entrys[i]
                param = {}
                param.accountId = entry.accountId ? entry.accountId : ''
                param.departmentId = entry.departmentId ? entry.departmentId : undefined
                param.personId = entry.personId ? entry.personId : undefined
                param.customerId = entry.customerIdcustomerId ? entry.customerId : undefined
                param.supplierId = entry.supplierId ? entry.supplierId : undefined
                param.inventoryId = entry.inventoryId ? entry.inventoryId : undefined
                param.projectId = entry.projectId ? entry.projectId : undefined
                param.year = year
                param.period = period

                for (var j = 1; j <= 10; j++) {
                    param[`exCalc${j}`] = entry[`exCalc${j}`] ? entry[`exCalc${j}`] : undefined
                }

                queryParams.push(param)
            }

            const response = await this.webapi.certificate.getAccountsBalance(queryParams)
            if (response != undefined) {
                for (var i = 0; i < entrys.length; i++) {
                    entrys[i].balance = response[i].balance
                    entrys[i].initBalance = response[i]
                }
            }
        } else {
            entrys
        }
        return entrys
    }

    //判断界面是否有修改
    hasModify = () => {
        let details = this.metaAction.gf('data.form.details') && this.metaAction.gf('data.form.details').toJS(),
            copydetails = this.metaAction.gf('data.form.copydetails') && this.metaAction.gf('data.form.copydetails').toJS()
        if (!this.metaAction.gf('data.other.isRenderScroll')) {
            let other = { 'data.other.isRenderScroll': true }
            this.injections.reduce('setOther', other)
        }
        let status = this.metaAction.gf('data.other.editStatus')
        if (isEquall(details, copydetails) && details.length == copydetails.length) {//details 对象结构比较深，用这个玩意根本比较不出来
            if (status == data.EDIT_STATUS) {
                return true
            }
            return false
        } else {
            return true
        }
    }

    /**
     * 组装当前界面的数据,供新增接口     * 
     */
    getCurDocData = () => {
        let certificate = {},
            form = this.metaAction.gf('data.form')
        certificate.docType = form.get('docType')
        certificate.docCode = form.get('code')
        certificate.orderNo = form.get('orderNo')
        let certificateMoment = moment(form.get('date'))
        certificate.voucherDate = certificateMoment.format('YYYY-MM-DD')
        certificate.year = certificateMoment.year()
        certificate.period = certificateMoment.month() + 1
        certificate.attachedNum = form.get('attachCount')
        if (form.get('docId')) {
            certificate.docId = form.get('docId')
        }
        //是否修改过凭证号
        certificate.isModifiedDocCode = (certificate.docCode != this.metaAction.gf('data.form.initVoucherCode'))
        //是否为插入凭证
        certificate.isInsert = this.metaAction.gf('data.other.isInsert')

        //凭证号小于4为自动补0
        certificate.docCode = certificate.docCode.padStart(5, '0')

        //考虑修改的情况: 单据id
        let oldId = form.get('id')
        if (oldId) {
            certificate.docId = oldId
            certificate.ts = form.get('ts')
        }

        let entrys = [],
            details = form.get('details')
        for (let item of details) {
            let entry = this.convertVoucherItemForServer(item, true)

            if (certificate.isNotGetCurrency != false && item.get('currencyForUpdateRate')) {
                certificate.isNotGetCurrency = false
            }

            if (entry) {
                entrys.push(entry)
            }
        }

        //考虑修改的情况: 删除分录
        let deletedCertificateItems = this.metaAction.gf('data.other.deletedCertificateItems')
        if (deletedCertificateItems && deletedCertificateItems.size > 0) {
            for (let delItem of deletedCertificateItems) {
                entrys.push({ id: delItem.get('id'), rowStatus: 3, ts: delItem.get('ts') })
            }
        }
        certificate.entrys = entrys
        let currentUser = this.getCurrentUser()
        certificate.creator = currentUser.nickname
        return certificate
    }

    onSummarySelect = (path, rowIndex, row, src) => async (v) => {
        const hit = data.find(src, 'name', v)
        if (hit) {
            if (hit.type == 'template') {
                if (!!v) {
                    v = v.replace(' [模板]', '')
                }

                let response = await this.webapi.commonDoc.findById({ docTemplateName: v })
                await this.getMultiAccountBalance(response.entrys)
                this.injections.reduce('applySummaryTemplate', fromJS(response), rowIndex)
            } else {
                let details = this.metaAction.gf('data.form.details'), other = {}
                details = details.update(rowIndex, item => item.set('summary', hit.name))
                other['data.form.details'] = details
                // this.injections.reduce('setOther', other)
                this.injections.reduce('onEvent', 'onEndEdit', { path: path, data: fromJS(hit), isChanged: true }, other)
                this.extendAction.gridAction.cellAutoFocus()
            }
        }
        else {
            let details = this.metaAction.gf('data.form.details')

            details = details.update(rowIndex, item => item.set('summary', v))
            let other = { 'data.form.details.': details }

            let edit_status = this.metaAction.gf('data.other.editStatus')
            // if (edit_status != data.ADD_STATUS) {
            //     other['data.other.editStatus'] = data.EDIT_STATUS
            // }

            this.injections.reduce('setOther', other)
        }
    }

    onFieldChange = async (path, oldValue, newValue, type) => {
        let certificateData = this.getCurDocData(),
            curRowIndex = parseInt(path.split(',')[1])
        if (path.indexOf('code') == -1 &&
            this.metaAction.gf('data.other.editStatus') == data.VIEW_STATUS &&
            this.metaAction.gf('data.form.certificateStatus') != data.STATUS_VOUCHER_AUDITED &&
            oldValue != newValue) {

            this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
        } else if (path.indexOf('code') > -1) {
            if (newValue != oldValue) {
                let other = { 'data.form.code': newValue.toString().padStart(5, '0') }

                if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || !certificateData.docId) {
                    this.injections.reduce('changeStatus', data.ADD_STATUS, data.STATUS_VOUCHER_NOT_AUDITED, undefined, other)
                } else {
                    this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED, undefined, other)
                }
            }

        }

        //修改日期: 联动凭证号
        if (path.indexOf('date') > -1) {
            let oldDate = moment(oldValue),
                newDate = moment(newValue)

            if (oldDate.year() != newDate.year() || oldDate.month() != newDate.month()) {
                let initCertificateData = await this.webapi.certificate.getNewDocCode({ year: newDate.year(), period: newDate.month() + 1 })
                this.injections.reduce('initVoucherCode', initCertificateData.docCode)
            }
        }
        //附件数,上限限制为1W
        else if (path.indexOf('attachment') > -1) {
            if (isNaN(newValue) || parseInt(newValue) > data.MAX_ATTACH_COUNT) {
                this.metaAction.toast('warning', '附件数最大为' + data.MAX_ATTACH_COUNT)
            } else {
                if (newValue != oldValue) {
                    let other = { 'data.form.attachCount': parseInt(newValue) }

                    if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || !certificateData.docId) {
                        this.injections.reduce('changeStatus', data.ADD_STATUS, data.STATUS_VOUCHER_NOT_AUDITED, undefined, other)
                    } else {
                        this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED, undefined, other)
                    }
                }
            }
        } else if (path.indexOf('code') > -1) {

        }
        this.injections.reduce('onFieldChange', path, oldValue, newValue)
        let editStatus = this.metaAction.gf('data.other.editStatus')
        if (editStatus == data.EDIT_STATUS) {
            /**编辑状态下
             * 1.所有启用外币核算的币种都为人民币时
             * 2.编辑的是启用人民币的第一行
               点击确定按钮触发
             **/
            let isNotRMBDetail = certificateData.entrys.find(item => item.currencyId && item.currencyId !== 1)
            let isNotRMBDetailIndex = certificateData.entrys.findIndex(item => item.currencyId == 1)
            let tipModalShow = sessionStorage.getItem('tipModalShow')
            if (!isNotRMBDetail && isNotRMBDetailIndex == curRowIndex) {
                //符合条件               
                if (type == 'confirm') {
                    let ret = await this.metaAction.modal('show', {
                        title: '提示',
                        width: 500,
                        // footer: null,
                        iconType: null,
                        okText: '确定',
                        className: 'currency-modal-container',
                        children: (
                            <div>
                                <div style={{ marginBottom: '10px' }}> 此币种及汇率是否同步给该凭证内其他含有外币核算的分录？</div>
                                {/* <div>
                                    <Checkbox
                                        onChange={this.handleChange}
                                    // checked = {tipModalShow}
                                    >不再提示
                                </Checkbox>
                                </div> */}
                            </div>
                        )
                    })
                    if (ret) {
                        let details = this.metaAction.gf('data.form.details'),
                            currency = details.get(curRowIndex).getIn(['quantityAndForeignCurrency', 'currency'])
                        currency = currency.set('exchangeRate', newValue.get('exchangeRate'))
                        for (var i = 0; i < details.size; i++) {
                            if (details.get(i).getIn(['quantityAndForeignCurrency', 'isCalcMulti']) == true &&
                                details.get(i).getIn(['quantityAndForeignCurrency', 'currency']).get('id') == 1) {
                                let oldCurrency = details.get(i).get('quantityAndForeignCurrency')
                                details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'exchangeRate'], newValue.get('exchangeRate')))
                                details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))
                                details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'origAmount'], details.get(i).get('quantityAndForeignCurrency').get('amount') / newValue.get('exchangeRate')))
                                if (details.get(i).get('quantityAndForeignCurrency').get('isCalcQuantity')) {
                                    details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'price'], details.get(i).get('quantityAndForeignCurrency').get('origAmount') / details.get(i).get('quantityAndForeignCurrency').get('quantity')))
                                }
                                details.get(i).get('quantityAndForeignCurrency').get('amount') > 0 ? details = details.update(i, item => item.set('debitAmount', newValue.get('exchangeRate') * details.get(i).get('quantityAndForeignCurrency').get('origAmount'))) :
                                    details = details.update(i, item => item.set('creditAmount', newValue.get('exchangeRate') * details.get(i).get('quantityAndForeignCurrency').get('origAmount')))
                                let newCurrency = details.get(i).get('quantityAndForeignCurrency')
                                this.injections.reduce('onFieldChange', `${path.substr(0, path.length - 1)}${i}`, oldCurrency, newCurrency)

                            }
                        }

                    } else {
                        return
                    }
                } else {
                    let details = this.metaAction.gf('data.form.details'),
                        currency = details.get(curRowIndex).getIn(['quantityAndForeignCurrency', 'currency'])
                    currency = currency.set('exchangeRate', newValue.get('exchangeRate'))
                    for (var i = 0; i < details.size; i++) {
                        if (details.get(i).getIn(['quantityAndForeignCurrency', 'isCalcMulti']) == true &&
                            details.get(i).getIn(['quantityAndForeignCurrency', 'currency']).get('id') == 1) {
                            let oldCurrency = details.get(i).get('quantityAndForeignCurrency')
                            details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'exchangeRate'], newValue.get('exchangeRate')))
                            details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))
                            details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'origAmount'], details.get(i).get('quantityAndForeignCurrency').get('amount') / newValue.get('exchangeRate')))
                            if (details.get(i).get('quantityAndForeignCurrency').get('isCalcQuantity')) {
                                details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'price'], details.get(i).get('quantityAndForeignCurrency').get('origAmount') / details.get(i).get('quantityAndForeignCurrency').get('quantity')))
                            }
                            details.get(i).get('quantityAndForeignCurrency').get('amount') > 0 ? details = details.update(i, item => item.set('debitAmount', newValue.get('exchangeRate') * details.get(i).get('quantityAndForeignCurrency').get('origAmount'))) :
                                details = details.update(i, item => item.set('creditAmount', newValue.get('exchangeRate') * details.get(i).get('quantityAndForeignCurrency').get('origAmount')))
                            let newCurrency = details.get(i).get('quantityAndForeignCurrency')
                            this.injections.reduce('onFieldChange', `${path.substr(0, path.length - 1)}${i}`, oldCurrency, newCurrency)
                            // this.metaAction.sf('data.form.details', fromJS(details))
                            // details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'currency'], currency))
                            // details = details.update(i, item => item.setIn(['quantityAndForeignCurrency', 'exchangeRate'], newValue.get('exchangeRate')))
                        }
                    }
                }

            }
        }
    }

    handleChange = (e) => {
        sessionStorage.setItem('tipModalShow', e.target.checked)
    }

    dateKeydown = (e) => {
        if (e.keyCode == 13) {
            document.getElementsByClassName('app-proof-of-charge-common-edit-form-header-attachment-number')[0].focus()
            document.getElementsByClassName('ant-calendar-picker-input')[0].removeEventListener('keydown', this.dateKeydown, false)
        }
    }

    accountingSubjectBlur = () => {
        this.injections.reduce('setOther', { 'data.other.placeholder': '' })
    }

    clickSubject = async (id) => {
        let response = await this.webapi.certificate.used({ id: id })
        if (!response) {
            this.metaAction.toast('warning', '此科目本期间内无数据')
            return false
        }
    }

    /**
     * 科目选择
     */
    onSubjectSelect = (path, rowIndex, accountingEditSubjects) => async (v) => {
        let details = this.metaAction.gf('data.form.details'),
            curOldAccountingSubject = details.get(rowIndex).get('accountingSubject'),
            editStatus = this.metaAction.gf('data.other.editStatus'),
            copyDoc = this.metaAction.gf('data.other.copyDoc'),
            isFromXdz = this.metaAction.gf('data.other.isFromXdz'),           
            balance,
            other = {}
        const hit = data.find(accountingEditSubjects, 'id', v)
        // if (editStatus != data.ADD_STATUS) {
        //     other['data.other.editStatus'] = data.EDIT_STATUS
        // }
        if (curOldAccountingSubject && curOldAccountingSubject.get('id') == hit.id) {
            let curNewAccountingSubject = { ...curOldAccountingSubject.toJS() }

            if (!curOldAccountingSubject.get('isCalc')) {
                balance = await this.getAccountBalance(path, curOldAccountingSubject, null, data.EDIT_STATUS)
                curNewAccountingSubject.balance = this.getPageBalance(curOldAccountingSubject.get('code'), rowIndex, balance.balance)
                curNewAccountingSubject.initBalance = balance
            }
            if (editStatus != data.ADD_STATUS && !copyDoc && !isFromXdz) {
                curNewAccountingSubject.isShowBalance = true
            }
            this.injections.reduce('onEvent', 'onEndEdit', { path: path, data: fromJS(curNewAccountingSubject), isChanged: true }, other)
        } else {
            if (!hit.isCalc) {
                balance = await this.getAccountBalance(path, fromJS(hit))
                hit.balance = this.getPageBalance(hit.code, rowIndex, balance.balance)
                hit.initBalance = balance
                if (editStatus != data.ADD_STATUS && !copyDoc && !isFromXdz) {
                    hit.isShowBalance = false
                }
            }
            this.injections.reduce('onEvent', 'onEndEdit', { path: path, data: fromJS(hit), isChanged: true }, other)
        }
        this.extendAction.gridAction.cellAutoFocus()
    }
    /**
     * 获取列表余额
     */
    getPageBalance = (accountCode, rowIndex, initBalance) => {        
        let details = this.metaAction.gf('data.form.details'),
            balance = initBalance
        for (var i = 0; i < details.size; i++) {
            if (i != rowIndex &&
                details.get(i).get('accountingSubject') &&
                details.get(i).get('accountingSubject').get('code') == accountCode &&
                details.get(i).get('accountingSubject').get('balance') != undefined
            ) {
                balance = details.get(i).get('accountingSubject').get('balance')
            }
        }
        return balance
    }

    getAccountBalance = async (path, accountingSubject, option, editStatus) => {
        let balance
        let certificateDate = moment(this.metaAction.gf('data.form.date')),
            year = certificateDate.year(),
            period = certificateDate.month() + 1        
        if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS
            || this.metaAction.gf('data.other.editStatus') == data.EDIT_STATUS
            || editStatus == data.EDIT_STATUS) {

            let index = path.split(',')[1],
                subjectValue = this.metaAction.gf('data.form.details').get(index).get('accountingSubject'),
                queryParams = {},
                auxAccountSubjects

            if (option) {
                auxAccountSubjects = option.data.get('auxAccountSubjects')
                queryParams.accountId = subjectValue.get('id')
            } else {
                queryParams.accountId = accountingSubject.get('id')
            }

            if (!!auxAccountSubjects) {
                queryParams.departmentId = auxAccountSubjects.get('department') ? auxAccountSubjects.get('department').get('id') : undefined
                queryParams.personId = auxAccountSubjects.get('person') ? auxAccountSubjects.get('person').get('id') : undefined
                queryParams.customerId = auxAccountSubjects.get('customer') ? auxAccountSubjects.get('customer').get('id') : undefined
                queryParams.supplierId = auxAccountSubjects.get('supplier') ? auxAccountSubjects.get('supplier').get('id') : undefined
                queryParams.inventoryId = auxAccountSubjects.get('inventory') ? auxAccountSubjects.get('inventory').get('id') : undefined
                queryParams.projectId = auxAccountSubjects.get('project') ? auxAccountSubjects.get('project').get('id') : undefined

                for (var j = 1; j <= 10; j++) {
                    queryParams[`exCalc${j}`] = auxAccountSubjects.get(`exCalc${j}`) ? auxAccountSubjects.get(`exCalc${j}`).get('id') : undefined
                }
            }
            queryParams.year = year
            queryParams.period = period
            const response = await this.webapi.certificate.getAccountBalance(queryParams)
            if (response != undefined) {
                balance = response
            }
        } else {
            balance = 0
        }

        return balance
    }   

    amountBlur = (path) => () => {
        // let curPath = this.metaAction.gf('data.other.originalFieldPath')
        // this.injections.reduce('onEvent', 'onBlur', { path: curPath, originalFieldPath: path}) //旧代码进行参考todo
        // this.injections.reduce('setOther', { 'data.other.originalFieldPath': path })
        this.injections.reduce('onEvent', 'onBlur', { path: path })
    }

    sum = (details, fieldName) => {
        return this.sumInternal(details, (a, b) => a + parseFloat(b[fieldName]))
    }

    getTotal = (details) => {
        let sumValue = this.sumInternal(details, (a, b) => a + parseFloat(b['debitAmount']))
        return '合计：' + utils.number.moneySmalltoBig(parseFloat(sumValue.toFixed(2)))
    }

    sumInternal(details, fn) {
        if (!details || details.length == 0)
            return '0'

        return details.reduce((a, b) => {
            let r = fn(a, b)
            return isNaN(r) ? a : r
        }, 0)
    }

    addSubject = rowIndex => async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-common-edit-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'certificate',
            })
        })

        if (ret) {
            if (ret.isEnable == false) {
                return
            }
            let id = this.metaAction.gf('data.form.id')
            if (id) {
                let res = await this.webapi.certificate.findById({ docId: id })
                if (res) {
                    this.injections.reduce('setOther', { 'data.form.ts': res.ts })
                }
            }
            const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetDoc: true, isNotGetCurrency: true, isNotGetSummary: true })
            const subjectList = this.getSubjectList(baseArchiveList.glAccountQueryDto)
            this.injections.reduce('setAccoutingSubject', rowIndex, subjectList, ret)

            let path = `root.children.center.children.details.columns.accountingSubject.cell.cell,${rowIndex}`

            this.onSubjectSelect(path, rowIndex, subjectList.glAccounts)(ret.id)
        }
    }

    // 在当前凭证前插入空白凭证 凭证号取点击【插入凭证】前的凭证的凭证号
    insert = async () => {
        let currentCode = this.metaAction.gf('data.form.code'),
            currentDate = this.metaAction.gf('data.form.date')

        if (currentCode == '99999') {
            this.metaAction.toast('error', '凭证号达到99999，不能再增加凭证')
            return
        }
        const enabledYearMonth = this.getEnabledYearMonth()
        this.extendAction.gridAction.cellAutoFocus()

    }

    componentWillUnmount = () => {
        if (sessionStorage.getItem('auxAccountSubjects') != null) {
            sessionStorage.removeItem('auxAccountSubjects')
        }
        if (sessionStorage.getItem('isClickCancelBtn') != null) {
            sessionStorage.removeItem('isClickCancelBtn')
        }
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (win.detachEvent) {
            win.detachEvent('onTabFocus', this.onTabFocus)
        }
        let removeTabsCloseListen = this.component.props.removeTabsCloseListen
        if (removeTabsCloseListen) {
            removeTabsCloseListen('app-proof-of-charge-common-edit')
        }

        let removeTabChangeListen = this.component.props.removeTabChangeListen
        if (removeTabChangeListen) {
            removeTabChangeListen('app-proof-of-charge-common-edit')
        }
        window.accountingEditSubjects = null
        window.accountingEditSubjectsAll = null
    }

    updateAuxItem = (rowIndex) => {
        let option = {}, details = this.metaAction.gf('data.form.details')

        option.path = 'root.children.center.children.details.columns.accountingSubject,' + rowIndex
        option.data = details.get(rowIndex)
        option.isChanged = false
        this.injections.reduce('clearAuxItem', rowIndex, { 'data.auxItemVisible': false })
        this.injections.reduce('onEvent', 'onEndEdit', option)
    }

    handleRowMouseEnter = (e, rowIndex) => {
        if (this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_AUDITED) return

        let details = this.metaAction.gf('data.form.details'),
            detail = details.get(rowIndex),
            option = { rowIndex: rowIndex, value: detail.toJS() },
            isDisplayQuantityColumn = this.metaAction.gf('data.other.isDisplayQuantityColumn'),
            auxBtnStyle = {}
        //控制辅助项按钮的是否显示+显示位置: header高度 + 2*borderWidth + (row高度 + 1) * 行数 - 滚动后顶部的y值
        let right = !!isDisplayQuantityColumn ? '668px' : '550px',//数量外币列显示与否，right值位置不同
            other = {}

        if (this.metaAction.gf('data.other.copyDoc') == true) {
            right = !!isDisplayQuantityColumn ? '681px' : '563px'
        }

        if (detail
            && detail.get('accountingSubject')
            && detail.get('accountingSubject').get('auxAccountSubjects')
            && (detail.get('accountingSubject').get('auxAccountSubjects').get('department')
                || detail.get('accountingSubject').get('auxAccountSubjects').get('person')
                || detail.get('accountingSubject').get('auxAccountSubjects').get('customer')
                || detail.get('accountingSubject').get('auxAccountSubjects').get('supplier')
                || detail.get('accountingSubject').get('auxAccountSubjects').get('inventory')
                || detail.get('accountingSubject').get('auxAccountSubjects').get('project')
            )) {
            let certificateBodyScrollY = parseInt(this.metaAction.gf('data.other.certificateBodyScrollY'))
            let top = data.GRID_HEADER_HEIGHT + data.GRID_ROW_HEIGHT * rowIndex - certificateBodyScrollY - 19

            auxBtnStyle = { width: '14px', display: 'inline-block', lineHeight: '14px', top: top + 'px', 'font-size': '13px', right: right, 'z-index': '9', position: 'absolute' }
            other = { 'data.other.cellAuxStyle': 'cellAuxStyle' }
        }
        else {
            auxBtnStyle = { display: 'none' }
            other = { 'data.other.cellAuxStyle': '' }
        }
        this.injections.reduce('mouseHoverRow', option, auxBtnStyle, other)
    }

    handleScrollEnd = (x, y) => {
        this.injections.reduce('setCertificateBodyScrollY', y)
    }
    
    //计算器
    // calculator = (e) => {
    //     this.calculatorDeatail()
    // }
    calculator = async (index, type) => {
        let _this = this
        let result = await this.metaAction.modal('show', {
            title: '计算器',
            width: 300,
            iconType: null,
            className: 'mk-app-proof-of-list-modal-container-creator',
            children: <Calculator callBack={_this.calculatorCallBack} index={index} type={type} />,
            footer: null
        })
        if (result) {
            window.onkeydown = undefined
        } else {
            window.onkeydown = undefined
        }
    }
    calculatorCallBack = async (form, data) => {
        let index = Number(data.index)
        let type = data.type == 'creditAmount' ? 'debitAmount' : 'creditAmount'
        let details = this.metaAction.gf('data.form.details').toJS()
        details[index][data.type] = Number(form).toFixed(2)
        details[index][type] = ''
        this.injections.reduce('setDetails', details)
    }

    setFieldChange = (path, value, errPath) => {
        let error = this.metaAction.gf(errPath)
        if(value && error) this.injections.reduce('update', { path: errPath, value: fromJS(undefined)})
        this.injections.reduce('update', { path, value: fromJS(value)})
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
