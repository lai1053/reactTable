import React from 'react'
import ReactDOM from 'react-dom'
import config from './config'
import moment from 'moment'
import extend from './extend'
import * as data from './data'
import isEquall from 'lodash.isequal'
import debounce from 'lodash.debounce'
import utils, { fetch, environment } from 'edf-utils'
import { action as MetaAction, AppLoader, } from 'edf-meta-engine'
import { Popover, Button, Link, Checkbox } from 'antd'
import { PrintOption, Modal, Select } from 'edf-component'
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
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if (addTabsCloseListen) {
            addTabsCloseListen('app-proof-of-charge', this.hasModify)
        }

        let addTabChangeListen = this.component.props.addTabChangeListen
        if (addTabChangeListen) {
            addTabChangeListen('app-proof-of-charge', this.hasModify)
        }

        if (this.component.props.setOkListener)
            this.component.props.setOkListener(this.onOk)
        this.setrowsCount()
        this.load(initData)
    }

    load = async (initData) => {

        let other = {
            'data.other.innerHeight': window.innerHeight,
            'data.other.innerWidth': window.innerWidth
        }

        const baseArchiveList = await this.webapi.certificate.getBaseArchive()
        const subjectList = await this.getSubjectList(baseArchiveList.glAccountQueryDto)
        const currencyList = baseArchiveList.currencyDtos
        const enabledYearMonth = this.getEnabledYearMonth()
        other['data.other.summarys'] = fromJS([...baseArchiveList.summarys, ...this.translateTemplate(baseArchiveList.glDocTemplateDtos)])
        other['data.other.copyDoc'] = initData && initData.type == 'copyDoc'
        other['data.other.copyType'] = initData && initData.copyType
        other['data.other.isFromXdz'] = initData && initData.type == 'isFromXdz'
        if (!initData) {
            let initCertificateData = await this.webapi.certificate.init({ isReturnValue: true })
            if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
                this.metaAction.toast('error', initCertificateData.error.message)
                this.injections.reduce('initNewCertificate', undefined, subjectList, enabledYearMonth, currencyList, other)
            } else {
                this.injections.reduce('initNewCertificate', initCertificateData, subjectList, enabledYearMonth, currencyList, other)
                this.extendAction.gridAction.cellAutoFocus()
            }
        } else if (initData.id) {
            const certificateData = await this.webapi.certificate.findById({ docId: initData.id })
            this.injections.reduce('initLoadCertificate', fromJS(certificateData), enabledYearMonth, subjectList, currencyList, other)
            //凭证管理中插入凭证时
        } else if (initData.copyDocIds) { //复制凭证
            const certificateDatas = await this.webapi.certificate.copyDocBatch({ docIds: initData.copyDocIds })
            let docs = certificateDatas,
                certificateData = docs[0]

            other['data.other.copyDocId'] = initData.copyDocIds[0] + 1 //标识而已
            other['data.other.currentIndex'] = 0
            other['data.other.docs'] = fromJS(docs)
            other['data.other.toPrevPage'] = 'toPrevPage'
            other['data.other.toNextPage'] = 'toNextPage'
            if (initData.copyType == 'batchCopy') {
                other['data.other.popupContainerModal'] = '.batchCopyDoc-modal'
            } else if (initData.copyType == 'singleCopy') {
                other['data.other.popupContainerModal'] = '.singleCopyDoc-modal'
            }

            this.injections.reduce('initLoadCertificate', fromJS(certificateData), enabledYearMonth, subjectList, currencyList, other)
        } else if (initData && initData.code) {
            if (initData.code == '99999') {
                this.metaAction.toast('error', '凭证号达到99999，不能再增加凭证')
                return
            }
            this.checkEditStatusBeforeLoadNewVoucher(() => {
                initData.isInsert = true
                this.injections.reduce('clearAndNewCertificate', initData, subjectList, currencyList, enabledYearMonth, other)
            })
            //凭证管理中新增凭证时
        } else if (initData && initData.newCertificate) {
            this.checkEditStatusBeforeLoadNewVoucher(async () => {
                let initCertificateData = await this.webapi.certificate.init({ isReturnValue: true })

                if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
                    this.metaAction.toast('error', initCertificateData.error.message)
                    this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList, currencyList, enabledYearMonth, other)
                } else {
                    this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList, currencyList, enabledYearMonth, other)
                    this.extendAction.gridAction.cellAutoFocus()
                }
            })
        }

        //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
        //this.component.props.editing(this.component.props.appName, false);
        // this.editCloseTips(false)
    }

    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = async (props) => {
        let initData = props.toJS() ? props.toJS().initData : undefined
        let accessType = props.toJS() ? props.toJS().accessType : undefined
        const baseArchiveList = await this.webapi.certificate.getBaseArchive()
        const subjectList = this.getSubjectList(baseArchiveList.glAccountQueryDto)
        const currencyList = baseArchiveList.currencyDtos
        this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
        this.extendAction.gridAction.cellAutoFocus()
        //查看凭证
        if (initData && initData.id && accessType == 1) {
            this.checkEditStatusBeforeLoadNewVoucher(async () => {
                let certificateData = await this.webapi.certificate.findById({ docId: initData.id })

                this.injections.reduce('initLoadCertificate', fromJS(certificateData), undefined, subjectList, currencyList)
            })
        }
        //凭证管理中插入凭证时
        else if (initData && initData.code && accessType == 1) {
            if (initData.code == '99999') {
                this.metaAction.toast('error', '凭证号达到99999，不能再增加凭证')
                return
            }
            this.checkEditStatusBeforeLoadNewVoucher(() => {
                initData.isInsert = true
                this.injections.reduce('clearAndNewCertificate', initData, subjectList, currencyList)
                this.extendAction.gridAction.cellAutoFocus()
            })
            //凭证管理中新增凭证时
        } else if (initData && initData.newCertificate && accessType == 1) {
            this.checkEditStatusBeforeLoadNewVoucher(async () => {
                let initCertificateData = await this.webapi.certificate.init({ isReturnValue: true })

                if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
                    this.metaAction.toast('error', initCertificateData.error.message)
                    this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList, currencyList)
                } else {
                    this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList, currencyList)
                    this.extendAction.gridAction.cellAutoFocus()
                }
            })
        } else {
            let details = this.metaAction.gf('data.form.details'),
                editStatus = this.metaAction.gf('data.other.editStatus')

            this.upgradeDetails(details, subjectList, fromJS(currencyList))
            if (editStatus == data.VIEW_STATUS) {

                let id = this.metaAction.gf('data.form.id')

                const certificateData = await this.webapi.certificate.findById({ docId: id, isReturnValue: true })

                if (certificateData.result == false &&
                    certificateData.error.code == data.NOT_FOUND_CERTIFICATE) {

                    this.newCertificate(subjectList)
                } else {
                    const enabledYearMonth = this.getEnabledYearMonth()
                    this.injections.reduce('initLoadCertificate', fromJS(certificateData), enabledYearMonth, subjectList, currencyList)
                }
            }
        }
    }

    // 设置摘要数据源
    setSummaryDS = async (summaryList, templateList) => {
        this.injections.reduce('setSummaryDS', fromJS([...summaryList, ...this.translateTemplate(templateList)]))
    }

    //关闭附件时机
    windowClick = (e) => {
        if (!document.getElementsByClassName('fixedDataTableLayout_rowsContainer')) return
        if (document.getElementsByClassName('mk-attachment-content')) {
            if (document.getElementsByClassName('mk-attachment-content') > 0) {
                this.injections.reduce('attachmentVisible', false)
            }
        }
    }

    componentDidMount = () => {
        let win = window

        if (win.addEventListener) {
            document.getElementById("app").addEventListener('click', this.windowClick, false)
            document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            document.getElementById("app").attachEvent('onclick', this.windowClick)
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
            win.attachEvent('onresize', this.onResize)
        }
    }

    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000),
            oldInnerHeight = this.metaAction.gf('data.other.innerHeight'),
            oldInnerWidth = this.metaAction.gf('data.other.innerWidth'),
            newInnerWidth = e.target && e.target.innerWidth,
            newInnerHeight = e.target && e.target.innerHeight

        let other = {
            'data.other.innerHeight': e.target && e.target.innerHeight ? e.target.innerHeight : oldInnerHeight,
            'data.other.innerWidth': e.target && e.target.innerWidth ? e.target.innerWidth : oldInnerWidth
        }
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (oldInnerHeight == undefined && newInnerHeight == undefined) {
                if (this.keyRandom == keyRandom && oldInnerWidth == newInnerWidth) {
                    this.setrowsCount(other)
                }
            } else {
                if (oldInnerWidth == undefined) {
                    if (this.keyRandom == keyRandom && oldInnerHeight != newInnerHeight) {
                        this.setrowsCount(other)
                    }
                } else {
                    if (this.keyRandom == keyRandom && oldInnerHeight != newInnerHeight && oldInnerWidth == newInnerWidth) {
                        this.setrowsCount(other)
                    }
                }
            }
        }, 20)
    }

    bodyKeydownEvent = (e) => {
        let dom = document.getElementById('app-proof-of-charge')
        let modalBody = document.getElementsByClassName('ant-modal-body')
        if (dom && modalBody && modalBody.length < 1) {
            this.keyDownCickEvent({ event: e })
        }
    }
    /**
         * 兼容不同浏览器获取当前值
         */
    getInnerText = (element) => {
        return (typeof element.textContent == "string") ? element.textContent : element.innerText;
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
            document.activeElement.className == "ant-input mk-input-number app-proof-of-charge-cell editable-cell") {
            let amountData = document.activeElement.value
            // if(amountData !== ''){
            this.amountChange(pzpath)(amountData)
            this.amountBlur(pzpath)()
            // }

        }
    }

    //todo
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
        //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
        // this.editCloseTips(true)
        let editStatus = this.metaAction.gf('data.other.editStatus')
        if (newValue == '0') {
            if (oldValue != newValue) {  //点选右边修改科目使其保存可用
                if (editStatus == data.EDIT_STATUS || editStatus == data.VIEW_STATUS) {
                    this.injections.reduce('changeStatus', data.EDIT_STATUS, data.STATUS_VOUCHER_NOT_AUDITED)
                }
            }
            return
        }

        this.injections.reduce('onFieldChange', path, oldValue, newValue)
    }
    isEnterTestSign = (testSign, oldValue, newValue) => {
        if (oldValue == '' || oldValue == undefined) {
            if (testSign == newValue) {
                return true
            } else {
                return false
            }
        }

        let singleChar, ret = false
        oldValue = oldValue.toString()
        newValue = newValue.toString()
        for (let i = 0; i < oldValue.length; i++) {
            singleChar = oldValue.substr(i, 1)
            newValue = newValue.replace(singleChar, '')
        }

        if (newValue == testSign) {
            ret = true
        }

        return ret
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
        if (edit_status != data.ADD_STATUS) {
            other['data.other.editStatus'] = data.EDIT_STATUS
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

    //监听键盘事件
    keyDownCickEvent = (keydown) => {

        if (keydown && keydown.event) {

            let e = keydown.event

            // const editStatus = this.metaAction.gf('data.other.editStatus')
            // if (e.ctrlKey && e.altKey && (e.key == 'n' || e.keyCode == 78)) {
            if (e.altKey && (e.key == 'n' || e.keyCode == 78)) {
                if (this.isDisplayButton('add')) {
                    //新增
                    this.newCertificate()
                }
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) {
                //保存 防止并发
                if (!this.metaAction.gf('data.other.btnStatus') && this.isDisplayButton('save')) {
                    this.backCaculateAmount()
                    this.save(undefined, '快捷键')
                }
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            // else if (e.ctrlKey && !e.altKey && (e.key == '/' || e.keyCode == 191)) {
            else if ((e.key && e.key.toLowerCase() == 'f12') || e.keyCode == 123) {
                //保存并新增 防止并发
                if (!this.metaAction.gf('data.other.btnStatus') && this.isDisplayButton('save')) {
                    this.backCaculateAmount()
                    this.saveAndNew('快捷键')
                }
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 'y' || e.keyCode == 89)) {
                //审核
                if (this.isDisplayButton('audit')) {
                    this.audit()
                }
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == ";" || e.keyCode == 186)) {
                //打印
                if (this.isDisplayButton('print')) {
                    this.print()
                }
            }
            else if (e.key == "Enter" || e.keyCode == 13) {
                let focusFieldPath = this.metaAction.gf('data.other.focusFieldPath')
                if (focusFieldPath == 'root.children.formHeader.children.date.children.date') {
                    this.injections.reduce('setOther', { 'data.other.focusFieldPath': 'root.children.formHeader.children.attachment.children.attachment' })
                }
                // if(focusFieldPath && focusFieldPath.indexOf('root.children.center.children.details.columns.creditAmount') > -1){
                //     let nextIndex = focusFieldPath.split(',')[1]
                //     this.amountBlur(focusFieldPath)()
                // }

            }
            //判断设备是否为mac
            else if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 219)) {
                    //上一张
                    this.loadPrevCertificate()
                }

                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 221)) {
                    //下一张
                    this.loadNextCertificate()
                }
            } else {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 37 || e.keyCode == 219)) {
                    //219 win7 IE11下的keyCode
                    //上一张
                    this.loadPrevCertificate()
                }
                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 39 || e.keyCode == 221)) {
                    //221 win7 IE11下的keyCode
                    //下一张
                    this.loadNextCertificate()
                }
            }
        }
    }

    selfGridKeydown = (e) => {
        let obj = Object.assign({}, e)
        setTimeout(() => {
            if (document.getElementsByClassName('accountQuantityEdit').length > 0 &&
                document.activeElement.className.indexOf('ant-select-selection') > -1) {
                // debugger
                // 当有数量外币框时，并且焦点在币种框上时，将不执行grid的gridKeydown
                return
            }
            this.keyDownCickEvent({ event: obj })
            this.extendAction.gridAction.gridKeydown(obj)
            if (obj.keyCode == 40) { //40:向下键keycode
                this.extendAction.gridAction.cellAutoFocus()
            }

            if (obj.keyCode == 13 || obj.keyCode == 108) {
                const path = utils.path.findPathByEvent(obj)
                if (path.indexOf('root.children.center.children.details.columns.summary.cell.cell') > -1) {
                    // console.log(`当前行索引是:${rowIndex} 当前录入摘要值是:${document.activeElement.value}`)
                    this.updateSummaryData(path.substr(path.indexOf(',') + 1), obj.target.value)
                }
                if (path.indexOf('root.children.center.children.details.columns.debitAmount.cell.cell') > -1
                    ||
                    path.indexOf('root.children.center.children.details.columns.creditAmount.cell.cell') > -1
                ) {
                    //todo
                    // if(obj.target.value !== ''){
                    this.amountChange(path)(obj.target.value)
                    this.amountBlur(path)()
                    // }

                }
            }
        }, 10)
    }

    // 升级科目信息
    upgradeDetails = (details, subjectList, currencys) => {
        let curAccountingSubject, lastestSubject, resCurrency, quantityAndForeignCurrency,
            glAccounts = fromJS(subjectList.glAccounts),
            glAccountsAll = fromJS(subjectList.glAccountsAll),
            editStatus = this.metaAction.gf('data.other.editStatus')

        let other = {
            'data.other.calcDict': Map(subjectList.calcDict),
            'data.other.currencyDS': currencys
        }

        for (var i = 0; i < details.size; i++) {
            curAccountingSubject = details.get(i).get('accountingSubject')
            /*场景描述：解决页签切换，停用币种的问题，先录入分录，然后在币种档案停用对应的币种，页签切换回来后更新停用的币种，把停用的币种清空
            */
            quantityAndForeignCurrency = details.get(i).get('quantityAndForeignCurrency') ? details.get(i).get('quantityAndForeignCurrency').toJS() : undefined
            if (currencys && curAccountingSubject) {
                if (quantityAndForeignCurrency && quantityAndForeignCurrency.currency) {
                    if (quantityAndForeignCurrency.currency.id != curAccountingSubject.get('currencyId')) {
                        resCurrency = data.find(currencys, 'id', quantityAndForeignCurrency.currency.id) //currencys.find(x => x.get('id') == quantityAndForeignCurrency.currency.id)
                    } else {
                        resCurrency = data.find(currencys, 'id', curAccountingSubject.get('currencyId')) //currencys.find(x => x.get('id') == curAccountingSubject.get('currencyId'))
                    }
                }
            }

            //页签切换,查找币种是否存在
            if (quantityAndForeignCurrency && !resCurrency) {
                quantityAndForeignCurrency.currency = null
                details = details.update(i, item => item.set('quantityAndForeignCurrency', fromJS(quantityAndForeignCurrency)))
            }

            if (curAccountingSubject != undefined && curAccountingSubject.get) {
                lastestSubject = glAccountsAll.filter(item => {
                    return item.get('id') == curAccountingSubject.get('id')
                }).toArray()
                if (lastestSubject.length > 0) {
                    // 余额的保持
                    if ((editStatus == data.ADD_STATUS || editStatus == data.EDIT_STATUS) && curAccountingSubject.get('balance') != undefined) {
                        lastestSubject[0] = lastestSubject[0].set('balance', curAccountingSubject.get('balance')).set('initBalance', curAccountingSubject.get('initBalance'))
                    }

                    if (!!curAccountingSubject.get('isCalc') && lastestSubject[0] && !lastestSubject[0].get('isCalc') ||
                        !curAccountingSubject.get('isCalc') && lastestSubject[0] && !!lastestSubject[0].get('isCalc')) {

                        curAccountingSubject = lastestSubject[0]
                        details = details.update(i, item => item.set('accountingSubject', lastestSubject[0]))
                    } else if (!!curAccountingSubject.get('isCalc') && lastestSubject[0] && !!lastestSubject[0].get('isCalc')) {
                        let auxAccountSubjects = curAccountingSubject.get('auxAccountSubjects'),
                            auxAccountSubjectsPreSelected = curAccountingSubject.get('auxAccountSubjectsPreSelected')

                        lastestSubject[0] = lastestSubject[0].set('auxAccountSubjects', auxAccountSubjects)
                        lastestSubject[0] = lastestSubject[0].set('auxAccountSubjectsPreSelected', auxAccountSubjectsPreSelected)
                        details = details.update(i, item => item.set('accountingSubject', lastestSubject[0]))
                    } else if (!curAccountingSubject.get('isCalc') && lastestSubject[0] && !lastestSubject[0].get('isCalc')) {
                        details = details.update(i, item => item.set('accountingSubject', lastestSubject[0]))
                    }
                } else {
                    let parentSubject = glAccountsAll.find(item => item.get('id') == curAccountingSubject.get('parentId'))
                    parentSubject = parentSubject.set('balance', curAccountingSubject.get('balance')).set('initBalance', curAccountingSubject.get('initBalance'))
                    details = details.update(i, item => item.set('accountingSubject', parentSubject))
                }
            }
        }
        other['data.form.details'] = details
        window.accountingSubjects = fromJS(subjectList.glAccounts)
        window.accountingSubjectsAll = fromJS(subjectList.glAccountsAll)
        this.injections.reduce('setOther', other)
    }

    getEnabledYearMonth = () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth.toString().padStart(2, '0')

        return enabledYearMonth
    }

    getCurrentUser = () => {
        return this.metaAction.context.get("currentUser")
    }

    isDisplayButton = (btnName) => {
        let editStatus = this.metaAction.gf('data.other.editStatus'),
            certificateStatus = this.metaAction.gf('data.form.certificateStatus'),
            isDisplay = true,
            isFromXdz = this.metaAction.gf('data.other.isFromXdz')
        if (isFromXdz == true && (btnName == 'add' || btnName == 'save')) {
            return false
        }
        if (btnName == 'add') {
            isDisplay = (editStatus == data.VIEW_STATUS ? true : false)
        } else if (btnName == 'del') {
            isDisplay = ((certificateStatus == data.STATUS_VOUCHER_AUDITED) ||
                (certificateStatus == data.STATUS_VOUCHER_NOT_AUDITED &&
                    editStatus != data.VIEW_STATUS))
        } else if (btnName == 'save') {
            isDisplay = (editStatus != data.VIEW_STATUS ? true : false)
        } else if (btnName == 'audit') {
            isDisplay = (editStatus == data.VIEW_STATUS ? true : false)
        } else if (btnName == 'print') {
            isDisplay = (editStatus == data.VIEW_STATUS ? true : false)
        } else if (btnName == 'more') {
            isDisplay = (editStatus != data.ADD_STATUS ? true : false)
        }
        return isDisplay
    }

    onOk = async () => {
        let isFromXdz = this.metaAction.gf('data.other.isFromXdz')
        if (isFromXdz == true) {
            await this.save()
            return
        }
        // 当前凭证校验
        let form = this.metaAction.gf('data.form').toJS()
        const msg = this.checkVoucherDataBeforeSave(form),
            checkStyle = { textAlign: 'left', fontSize: '14px', display: 'inline-block', verticalAlign: 'top' }

        if (msg.length > 0) {
            this.metaAction.toast('warning',
                <div style={checkStyle}>
                    {msg.map((o, index) => <p style={{ marginBottom: '0' }}>{(index + 1) + '.' + o}</p>)}
                </div>
            )
            return false
        }

        // 凭证号重复校验
        let docCode = '', voucherDate = '', duplicateMessage = '',
            currentIndex = this.metaAction.gf('data.other.currentIndex'),
            docs = this.metaAction.gf('data.other.docs').toJS(), other = []

        // 获取当前凭证数据
        let certificateData = this.getCertificateData()
        let currentUser = this.getCurrentUser(),
            creator = currentUser.nickname

        // 更新批量凭证数组
        docs[currentIndex] = certificateData

        for (var i = 0; i < docs.length - 1; i++) {
            docCode = docs[i].docCode
            voucherDate = docs[i].voucherDate
            docs[i].creator = creator

            for (var j = i + 1; j < docs.length; j++) {
                if (docCode == docs[j].docCode && voucherDate.substr(0, 7) == docs[j].voucherDate.substr(0, 7)) {
                    duplicateMessage = `第${i + 1}张和第${j + 1}张凭证号${docCode}重复，请修改。`
                    break
                }
            }
            if (duplicateMessage != '') break
        }
        docs[docs.length - 1].creator = creator

        if (duplicateMessage != '') {
            this.metaAction.toast('warning', duplicateMessage, 5)
            return false
        }

        const response = await this.webapi.certificate.createBatchForCopy(docs)

        if (response) {
            if (response.length == 0) {
                this.metaAction.toast('success', `${docs.length}张凭证保存成功`)
            } else {
                let successCount = docs.length - response.length,
                    failCount = response.length,
                    message = `凭证保存成功${successCount}张，失败${failCount}张。`

                this.metaAction.toast('warning',
                    <div style={checkStyle}>
                        <p style={{ marginBottom: '0' }}>{message}</p>
                        {response.map((o, index) => <p style={{ marginBottom: '0' }}>{(index + 1) + '、' + o}</p>)}
                    </div>, 10)
            }
        }
    }

    renderSelectComponent = (_ctrlPath) => {
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

    /**废弃方法*/
    getDynamicComponent = (_ctrlPath) => {
        let _isReadOnly = this.metaAction.isReadOnly(_ctrlPath),
            _isAccountFocus = this.isFocusOnAccount(_ctrlPath),
            _focusFieldPath = this.metaAction.gf('data.other.focusFieldPath'),
            _cancelEditAuxAccount = this.metaAction.gf('data.other.cancelEditAuxAccount'),
            _rowIndex = 0
        if (_focusFieldPath) {
            if (_focusFieldPath.indexOf('.cell.cell') != -1) {
                _rowIndex = _focusFieldPath.split('.cell.cell,')[1]
            }
        } else {
            return 'SubjectDisplay'
        }

        if (_ctrlPath) {
            if (_ctrlPath.indexOf('.cell.cell,' + _rowIndex) > -1) {
                if (_isReadOnly) {
                    return 'SubjectDisplay'
                }
                else {
                    if (_isAccountFocus || _cancelEditAuxAccount) {
                        this.injections.reduce('setOther', { 'data.other.cancelEditAuxAccount': null })
                        return 'Select'
                    }
                    else {
                        return 'SubjectDisplay'
                    }
                }
            }
            return 'SubjectDisplay'
        }
    }

    getDisabledDate = (current) => {
        var disabledDate = new Date(this.metaAction.gf('data.other.disabledDate'))

        return current && current.valueOf() < disabledDate
    }

    isFocusOnAccount = (ctrlPath) => {
        let activeElement = document.getElementById('auxItemConfirm')
        let isFocus = this.metaAction.isFocus(ctrlPath)

        return isFocus && (activeElement == null || activeElement == undefined)

    }

    onFieldFocus = (path) => {
        if (path.indexOf('summary') > -1) {
            this.backCaculateAmount()
            this.extendAction.gridAction.cellAutoFocus()
        } else if (path.indexOf('accountingSubject') > -1) {
            let accountingSubjects = window.accountingSubjects
            //todo
            let other = {
                'data.other.placeholder': '输入编码、拼音或名称过滤科目',
                // 'data.other.accountingSubjectOptions': data.renderSelectOption(accountingSubjects)
            }

            // if (accountingSubjects && accountingSubjects.size > 800) {
            //     other['data.other.keyRandom'] = Math.floor(Math.random() * 1000000)
            // }
            this.injections.reduce('setOther', other)
            let rowIndex = parseInt(path.split(',')[1]),
                detail = this.metaAction.gf('data.form.details').get(rowIndex),
                accountingSubject = detail.get('accountingSubject')

            if (!!accountingSubject) {
                let codeAndName = accountingSubject.get('codeAndName'),
                    accountId = accountingSubject.get('id'),
                    dom = document.getElementsByClassName('ant-select-selection-selected-value'),
                    accountingSubjects = window.accountingSubjects,
                    itemData = data.find(accountingSubjects, 'id', accountId), //accountingSubjects.find(o => o.get('id') == accountId),
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
            rowIndex = parseInt(path.split(',')[1])
        let otherObj = {}
        // 实现借方金额、贷方金额的onBlur之用
        if (this.metaAction.gf('data.other.originalFieldPath') == undefined) {
            otherObj['data.other.originalFieldPath'] = path
            // this.injections.reduce('setOther', { 'data.other.originalFieldPath': path })
        }
        if (rowIndex != this.metaAction.gf('data.other.index')) {
            otherObj['data.other.index'] = rowIndex
            // this.injections.reduce('setOther', { 'data.other.index': rowIndex })
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
        if (this.metaAction.gf('data.other.originalFieldPath')) {
            //处理某一分录行填写表格中的金额后，再点击该行数量外币列时，弹出框的金额没有被反算的问题 0310
            let originalFieldPath = this.metaAction.gf('data.other.originalFieldPath'),
                lastEditRowIndex = originalFieldPath.split(',')[1],
                detail = this.metaAction.gf('data.form.details').get(lastEditRowIndex)

            if (!detail) return

            let quantityAndForeignCurrency = detail.get('quantityAndForeignCurrency')

            if (!quantityAndForeignCurrency) return

            let amount = quantityAndForeignCurrency.get('amount'),
                lastFocusPath = this.metaAction.gf('data.other.originalFieldPath'),
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
                        window.accountingSubjects = fromJS(subjectList.glAccounts)
                        window.accountingSubjectsAll = fromJS(subjectList.glAccountsAll)
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
        let accountingSubjects = window.accountingSubjects,
            conditionLeft,
            conditionRight
        if (!accountingSubjects) {
            return false
        }
        if (inputValue.indexOf(' ') > -1) {
            const index = inputValue.indexOf(' ')
            conditionLeft = inputValue.slice(0, index) || inputValue.slice(index).replace(/\s*/g, "")
            conditionRight = inputValue.slice(index).replace(/\s*/g, "")
        } else {
            conditionLeft = inputValue
        }

        if (option && option.props && option.props.value && accountingSubjects.size > 0) {
            let itemData
            for (var i = 0; i < accountingSubjects.size; i++) {
                if (accountingSubjects.get(i).get('id') == option.props.value) {
                    itemData = accountingSubjects.get(i)
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
    /**
     * 获取文本框录入字符的长度（汉字、字母）
     */
    getLength = (str) => {
        let realLength = 0,
            len = str.length,
            charCode = -1
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i)
            if (charCode >= 0 && charCode <= 128) realLength += 1; else realLength += 2
        }
        return realLength
    }
    getSearchCondition = (item, searchValue) => {
        //inputValue = inputValue.replace(/\s*/g, "")  //去除所有空格
        // const inputLength = this.getLength(inputValue)
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
        //todo  
        console.log('lazySearch')    
        let curAccountList = fromJS([]),
            conditionLeft,
            conditionRight,
            accountList = window.accountingSubjects
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
        window.accountingSubjectOptions = curAccountList
        let other = {}
        other['data.other.keyRandom'] = Math.floor(Math.random() * 1000000)
        this.injections.reduce('setOther', other)        
        // this.injections.reduce('setOther', { 'data.other.accountingSubjectOptions': data.renderSelectOption(curAccountList) })
    }

    renderCellContent = (keyRandom, accountingSubjectOptions) => {
        console.log('renderCellContent')
        let res = []
        if (!window.accountingSubjects) {
            return res
        }
        if (!!!accountingSubjectOptions) {
            accountingSubjectOptions = window.accountingSubjects
        }
        res = accountingSubjectOptions.toJS().map(item => {
            return (
                <Option
                    key={item.id}
                    className="app-proof-of-charge-form-details-account"
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
        const accountingSubjects = window.accountingSubjects
        let groupAccounts = fromJS([])
        if (accountingSubjects && groupAccounts.size < 1) {
            groupAccounts = accountingSubjects.groupBy(val => val.get('code').slice(0, 1))
        }
        if (groupAccounts.size > 0) {
            return index ? groupAccounts.get(index) : accountingSubjects
        }
        return []
    }   

    summaryOption = () => {
        let summarys = this.metaAction.gf('data.other.summarys'), data

        if (summarys) {
            data = summarys.toJS()
        }

        if (data) {
            return data.map(d => <Option title={d.text} label={d.name} key={d.name} className={'app-proof-of-charge-form-details-account'}>{d.name}</Option>)
        }
    }

    clearGridFocus = () => {
        this.injections.reduce('setOther', { 'data.other.focusFieldPath': undefined })
    }

    certificateManagement = () => {
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '凭证管理'])
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('凭证', 'app-proof-of-list')
    }

    getAudited = () => {
        return (this.metaAction.gf('data.form.certificateStatus') == consts.VOUCHERSTATUS_Approved)
    }

    isRowOperation = () => {
        return this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED
    }

    audit = async () => {
        let id = this.metaAction.gf('data.form.id'),
            ts = this.metaAction.gf('data.form.ts'),
            certificateStatus = this.metaAction.gf('data.form.certificateStatus')

        if (!id || !ts) {
            this.metaAction.toast('success', '请先保存凭证')
            return
        }

        if (certificateStatus == data.STATUS_VOUCHER_NOT_AUDITED) {
            let currentUser = this.getCurrentUser(),
                auditor = currentUser.financeAuditor

            const response = await this.webapi.certificate.audit({ docId: id, ts: ts, auditor: auditor })
            if (response) {
                this.metaAction.toast('success', '凭证审核成功')
                this.injections.reduce('changeAuditStatus', data.STATUS_VOUCHER_AUDITED, this.getCurrentUser(), response)
            }
        } else {
            const response = await this.webapi.certificate.antiAudit({ docId: id, ts: ts })
            if (response) {
                this.metaAction.toast('success', '凭证反审核成功')
                this.injections.reduce('changeAuditStatus', data.STATUS_VOUCHER_NOT_AUDITED, this.getCurrentUser(), response)
            }
        }
    }

    commonMenuClick = (e) => {
        switch (e.key) {
            case 'useCommon':
                this.uesCommon()
                break;
            case 'saveCommon':
                this.saveCommon()
                break;
        }
    }

    uesCommon = () => {
        this.checkEditStatusBeforeLoadNewVoucher(async () => {
            //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '凭证模板'])

            const ret = await this.metaAction.modal('show', {
                title: '凭证模版',
                // width: 880,
                height: 425,
                okText: '使用凭证模版',
                // wrapClassName: 'common-template',
                className: 'common-template',
                bodyStyle: { padding: '20px 30px', paddingBottom: '0' },
                children: this.metaAction.loadApp('app-proof-of-charge-common', {
                    store: this.component.props.store,
                    columnCode: "common"
                }),
            })

            if (ret) {
                let certificateTemplate = await this.webapi.commonDoc.findById({ docTemplateId: ret.docTemplateId })
                // certificateTemplate.entrys = await this.getMultiAccountBalance(certificateTemplate.entrys)

                //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
                // this.component.props.editing(this.component.props.appName, true)
                // this.editCloseTips(true)
                this.injections.reduce('applyCertificateTemplate', fromJS(certificateTemplate), data.ADD_STATUS)
                //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '使用凭证模板'])
            }
            const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: true })
            this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
        })
    }
    editCloseTips = (istip) => {
        let curStatus

        if (this.component.props.getEditingStatus) {
            this.component.props.getEditingStatus(this.component.props.appName, getStatus)
            function getStatus(ret) {
                curStatus = ret
            }

            if (curStatus == istip) return
            curStatus = null
        }

        if (this.component.props.editing) {
            //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
            this.component.props.editing(this.component.props.appName, istip)
        }
    }

    saveCommon = async () => {
        if (!this.canSaveAsTemplate()) {
            this.metaAction.toast('warning', '没有填写科目的凭证不能存为模板')
            return
        }

        await this.metaAction.modal('show', {
            title: '存为凭证模版',
            width: 340,
            children: this.metaAction.loadApp('app-proof-of-charge-common-add', {
                store: this.component.props.store,
                columnCode: "common",
                initData: { certificateData: this.metaAction.gf('data.form') }
            }),
        })
        const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: true })
        this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '存为模板'])
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

    getAccountBalance = async (path, accountingSubject, option) => {
        let balance
        let certificateDate = moment(this.metaAction.gf('data.form.date')),
            year = certificateDate.year(),
            period = certificateDate.month() + 1
        if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || this.metaAction.gf('data.other.editStatus') == data.EDIT_STATUS) {
            let index = path.split(',')[1],
                subjectValue = this.metaAction.gf('data.form.details').get(index).get('accountingSubject')

            let queryParams = {},
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

    print = async () => {
        let _this = this

        const {
            height,
            maxLineNum,
            printAuxAccCalc,
            isPrintQuantity,
            isPrintMulti,
            type,
            width,
            leftPadding,
            rightPadding
        } = await this.webapi.certificate.getPrintConfig()

        this.metaAction.modal('show', {
            title: '打印',
            width: 500,
            footer: null,
            iconType: null,
            okText: '打印',
            className: 'print-modal-container',
            children: <PrintOption
                height={height}
                maxLineNum={maxLineNum}
                printAuxAccCalc={printAuxAccCalc}
                isPrintQuantity={isPrintQuantity}
                isPrintMulti={isPrintMulti}
                type={type}
                width={width}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                from="proofList"
                callBack={_this.submitPrintOption}
            />
        })
    }

    submitPrintOption = async (form, target) => {
        let id = this.metaAction.gf('data.form.id')
        let option = {
            "type": parseInt(form.state.value),
            "printAuxAccCalc": form.state.printAccountChecked,
            "isPrintQuantity": form.state.printQuantityChecked,
            "isPrintMulti": form.state.printMultiChecked,
            "docIdsStr": `${id}`,
            "leftPadding": form.state.leftPadding,
            "rightPadding": form.state.rightPadding
        }

        if (form.state.value == "0") {
            Object.assign(option, { "maxLineNum": form.state.pageSize })
        } else if (form.state.value == "2") {
            Object.assign(option, { "height": form.state.height, "width": form.state.width })
        }

        await this.webapi.certificate.print(option)
    }

    checkVoucherDataBeforeSave(form) {
        let msg = [], allItemEmpty = true, isBackCaculate = false,
            details = this.metaAction.gf('data.form.details')

        this.backCaculateAmount()

        //凭证号校验
        if (!form.code) {
            msg.push('凭证号不能为空')
        } else if (!/^\d+$/.test(form.code)) {
            msg.push('凭证号必须为纯数字，请修改')
        }

        if (form.code === '0') msg.push('凭证号不能为0，请修改')
        if (!form.date) msg.push('日期不能为空')

        form.details.forEach((detail, i) => {
            if (!detail ||
                (!detail.accountingSubject && !detail.summary && !detail.creditAmount && !detail.debitAmount) ||
                (!detail.accountingSubject && detail.summary && !detail.creditAmount && !detail.debitAmount)) {
                return
            }

            allItemEmpty = false

            //凭证号校验
            //2) 摘要、科目和金额 同时填写或不填
            let emptyItemNames = List()

            if (!detail.summary) {
                emptyItemNames = emptyItemNames.push('摘要')
            }

            if (!detail.accountingSubject) {
                emptyItemNames = emptyItemNames.push('科目')
            }

            if (!detail.debitAmount && !detail.creditAmount) {
                emptyItemNames = emptyItemNames.push('金额')
            }

            if (emptyItemNames.size > 0) {
                let rowError
                if (emptyItemNames.size > 2) {
                    rowError = "摘要、科目和金额"
                } else if (emptyItemNames.size == 2) {
                    rowError = emptyItemNames.get(0) + '和' + emptyItemNames.get(1)
                } else {
                    rowError = emptyItemNames.get(0)
                }
                msg.push("第" + (i + 1) + "行，请填写" + rowError)
                return
            }

            if (detail.summary && detail.summary.length > 200)
                msg.push("第" + (i + 1) + "行，摘要输入过长，请调整")

            //3) 数量/外币 核算
            if (detail.accountingSubject.isCalcQuantity
                && (!detail.quantityAndForeignCurrency || !detail.quantityAndForeignCurrency.amount)) {

                let lastFocusPath = this.metaAction.gf('data.other.originalFieldPath'),
                    rowIndex = lastFocusPath ? lastFocusPath.split(',')[1] : -1,
                    lastEditField

                // 解决360、IE、Edge浏览器下保存时借贷方金额未反算的问题 TTK-3055
                if (lastFocusPath && rowIndex == i) {
                    if (lastFocusPath && lastFocusPath.indexOf('debitAmount') != -1) {
                        lastEditField = 'debitAmount'
                    } else if (lastFocusPath && lastFocusPath.indexOf('creditAmount') != -1) {
                        lastEditField = 'creditAmount'
                    } else {
                        lastEditField = undefined
                    }

                    details = details.update(rowIndex, item => item.setIn(['quantityAndForeignCurrency', 'amount'], detail[lastEditField]))
                    isBackCaculate = true
                } else {
                    msg.push("第" + (i + 1) + "行，请填写数量核算")
                    return
                }

            }
            if (detail.accountingSubject.isCalcMulti
                && (!detail.quantityAndForeignCurrency || !detail.quantityAndForeignCurrency.currency)) {
                msg.push("第" + (i + 1) + "行，请填写外币核算")
                return
            }
            //4) 启用辅助核算
            if (detail.accountingSubject.isCalc) {
                if (!detail.accountingSubject.auxAccountSubjects) {
                    msg.push("第" + (i + 1) + "行，请填写科目辅助核算")
                    return
                }
                let auxAccountSubjects = detail.accountingSubject.auxAccountSubjects

                //部门
                if (detail.accountingSubject.isCalcDepartment
                    && !(auxAccountSubjects.department && auxAccountSubjects.department.id)) {
                    msg.push("第" + (i + 1) + "行，请填写部门辅助核算")
                    return
                }

                //人员
                if (detail.accountingSubject.isCalcPerson
                    && !(auxAccountSubjects.person && auxAccountSubjects.person.id)) {
                    msg.push("第" + (i + 1) + "行，请填写人员辅助核算")
                    return
                }

                //客户
                if (detail.accountingSubject.isCalcCustomer
                    && !(auxAccountSubjects.customer && auxAccountSubjects.customer.id)) {
                    msg.push("第" + (i + 1) + "行，请填写客户辅助核算")
                    return
                }

                //供应商
                if (detail.accountingSubject.isCalcSupplier
                    && !(auxAccountSubjects.supplier && auxAccountSubjects.supplier.id)) {
                    msg.push("第" + (i + 1) + "行，请填写供应商辅助核算")
                    return
                }

                //存货
                if (detail.accountingSubject.isCalcInventory
                    && !(auxAccountSubjects.inventory && auxAccountSubjects.inventory.id)) {
                    msg.push("第" + (i + 1) + "行，请填写存货辅助核算")
                    return
                }

                //项目
                if (detail.accountingSubject.isCalcProject
                    && !(auxAccountSubjects.project && auxAccountSubjects.project.id)) {
                    msg.push("第" + (i + 1) + "行，请填写项目辅助核算")
                    return
                }

                //自定义档案
                let calcDict = this.metaAction.gf('data.other.calcDict')
                for (var j = 1; j <= 10; j++) {
                    if (detail.accountingSubject[`isExCalc${j}`]
                        && !(auxAccountSubjects[`exCalc${j}`] && auxAccountSubjects[`exCalc${j}`].id)) {

                        let userDefineItemName = calcDict.get(`isExCalc${j}`)
                        msg.push("第" + (i + 1) + `行，请填写${userDefineItemName}辅助核算`)
                        return
                    }
                }
            }
        })

        if (isBackCaculate) {
            this.injections.reduce('setOther', { 'data.form.details': details })
        }

        //5) 不能全为空行
        if (allItemEmpty) {
            msg.push("请填写凭证分录")
        } else {
            //6) 借贷平衡
            let debitSum = 0,
                creditSum = 0
            for (let item of form.details) {
                let debitAmountItem = parseInt((parseFloat(item.debitAmount || 0) * 100).toFixed(0)),
                    creditAmountItem = parseInt((parseFloat(item.creditAmount || 0) * 100).toFixed(0))
                debitSum = (parseInt((debitSum * 100).toFixed(0)) + debitAmountItem) / 100
                creditSum = (parseInt((creditSum * 100).toFixed(0)) + creditAmountItem) / 100
            }
            if (debitSum.toFixed(2) !== creditSum.toFixed(2)) {
                msg.push("凭证借贷不平")
            }
        }
        return msg
    }

    save = async (callback, btnPosition, other) => {
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '保存' + btnPosition])
        let form = this.metaAction.gf('data.form').toJS()
        const msg = this.checkVoucherDataBeforeSave(form),
            checkStyle = { textAlign: 'left', fontSize: '14px', display: 'inline-block', verticalAlign: 'top' }

        if (msg.length > 0) {
            this.metaAction.toast('warning',
                <div style={checkStyle}>
                    {msg.map((o, index) => <p style={{ marginBottom: '0' }}>{(index + 1) + '.' + o}</p>)}
                </div>
            )
            return
        }

        let certificateData = this.getCertificateData()
        certificateData.isReturnValue = true

        //让保存按钮置灰，防止并发 置灰
        this.injections.reduce('showBtnState', true)

        //新增
        if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || !certificateData.docId) {

            try {
                const response = await this.webapi.certificate.create(certificateData)

                if (response.result == false && response.error) {
                    if (response.error.code == '9999') {
                        this.metaAction.toast('warning', '凭证保存失败，请重试')
                    } else {
                        this.metaAction.toast('warning', response.error.message)
                    }
                } else {
                    this.metaAction.toast('success', '凭证保存成功')
                    this.injections.reduce('loadCertificate', fromJS(response), data.VIEW_STATUS, other)
                    if (callback && typeof callback == 'function') callback()
                    //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
                    // this.editCloseTips(false)
                    const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: certificateData.isNotGetCurrency == false ? false : true })
                    this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
                }
            } catch (e) {
                this.metaAction.toast('warning', '凭证保存失败，请重试')
            } finally {
                //让保存按钮置灰，防止并发 重置
                this.injections.reduce('showBtnState', false)
            }
        }
        //更新
        else {
            try {
                let response = await this.webapi.certificate.update(certificateData)

                if (response.result == false && response.error) {
                    if (response.error.code == '9999') {
                        this.metaAction.toast('warning', '凭证更新失败，请重试')
                    } else {
                        this.metaAction.toast('warning', response.error.message)
                    }
                } else {
                    this.metaAction.toast('success', '凭证更新成功')
                    this.injections.reduce('loadCertificate', fromJS(response), data.VIEW_STATUS, other)
                    if (callback && typeof callback == 'function') callback()
                    //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
                    // this.editCloseTips(false)
                    const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: certificateData.isNotGetCurrency == false ? false : true })
                    this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
                }
            } catch (e) {
                this.metaAction.toast('warning', '凭证保存失败，请重试')
            } finally {
                //让保存按钮置灰，防止并发 重置
                this.injections.reduce('showBtnState', false)
            }
        }
    }

    saveAndNew = async (btnPosition) => {
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '保存并新增' + btnPosition])
        let form = this.metaAction.gf('data.form').toJS()
        let errorMsg = this.checkVoucherDataBeforeSave(form),
            checkStyle = { textAlign: 'left', fontSize: '14px', display: 'inline-block', verticalAlign: 'top' }

        if (errorMsg.length > 0) {
            this.metaAction.toast('warning',
                <div style={checkStyle}>
                    {errorMsg.map((o, index) => <p style={{ marginBottom: '0' }}>{(index + 1) + '.' + o}</p>)}
                </div>
            )
            return
        }

        let certificateData = this.getCertificateData()
        certificateData.isReturnValue = true

        //让保存按钮置灰，防止并发 置灰
        this.injections.reduce('showBtnState', true)

        //新增
        if (this.metaAction.gf('data.other.editStatus') == data.ADD_STATUS || !certificateData.docId) {
            try {
                const response = await this.webapi.certificate.create(certificateData)

                if (response.result == false && response.error) {
                    if (response.error.code == '9999') {
                        this.metaAction.toast('error', '凭证保存失败，请重试')
                    } else {
                        this.metaAction.toast('error', response.error.message)
                    }
                } else {
                    this.metaAction.toast('success', '凭证保存成功')

                    let certificateMoment = moment(certificateData.voucherDate),
                        year = certificateMoment.year(),
                        period = certificateMoment.month() + 1,
                        option = { year: year, period: period, isReturnValue: true }

                    let initCertificateData = await this.webapi.certificate.init(option)
                    //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
                    // this.editCloseTips(false)
                    if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
                        this.metaAction.toast('error', initCertificateData.error.message)
                        this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: certificateData.voucherDate })
                    } else {
                        this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: certificateData.voucherDate })
                        this.extendAction.gridAction.cellAutoFocus()
                    }
                    const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: certificateData.isNotGetCurrency == false ? false : true })
                    this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
                }
            } catch (e) {
                this.metaAction.toast('warning', '凭证保存失败，请重试')
            } finally {
                //让保存按钮置灰，防止并发 重置
                this.injections.reduce('showBtnState', false)
            }
        }
        //更新
        else {
            try {
                const response = await this.webapi.certificate.update(certificateData)

                if (response.result == false && response.error) {
                    if (response.error.code == '9999') {
                        this.metaAction.toast('error', '凭证保存失败，请重试')
                    } else {
                        this.metaAction.toast('error', response.error.message)
                    }
                } else {
                    this.metaAction.toast('success', '凭证更新成功')
                    let certificateMoment = moment(certificateData.voucherDate),
                        year = certificateMoment.year(),
                        period = certificateMoment.month() + 1,
                        option = { year: year, period: period, isReturnValue: true }

                    let initCertificateData = await this.webapi.certificate.init(option)
                    //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
                    // this.editCloseTips(false)
                    if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
                        this.metaAction.toast('error', initCertificateData.error.message)
                        this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: certificateData.voucherDate })
                    } else {
                        this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: certificateData.voucherDate })
                        this.extendAction.gridAction.cellAutoFocus()
                    }
                    const baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: certificateData.isNotGetCurrency == false ? false : true })
                    this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
                }
            } catch (e) {
                this.metaAction.toast('warning', '凭证保存失败，请重试')
            } finally {
                //让保存按钮置灰，防止并发 重置
                this.injections.reduce('showBtnState', false)
            }
        }
    }

    //判断界面是否有修改
    hasModify = () => {
        let details = this.metaAction.gf('data.form.details').toJS(),
            copydetails = this.metaAction.gf('data.form.copydetails').toJS()

        if (isEquall(details, copydetails)) {
            return false
        } else {
            return true
        }
    }

    //组装当前界面的数据,供新增接口
    getCertificateData = () => {
        let certificate = {},
            form = this.metaAction.gf('data.form')

        certificate.docType = form.get('docType')
        certificate.docCode = form.get('code')
        certificate.enclosures = this.getEnclosures(form.get('attachmentFiles').toJS())

        let certificateMoment = moment(form.get('date'))

        certificate.voucherDate = certificateMoment.format('YYYY-MM-DD')
        certificate.year = certificateMoment.year()
        certificate.period = certificateMoment.month() + 1
        certificate.attachedNum = form.get('attachCount')
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

    getEnclosures = (attachmentFiles) => {
        let enclosures = []
        let fileList = attachmentFiles || []

        if (fileList && fileList.length > 0) {
            fileList.map(o => {
                enclosures.push({
                    'fileId': o.id,
                    'file': { 'id': o.id, 'type': o.type, 'alt': o.alt, 'name': o.name, 'ts': o.ts, 'accessUrl': o.accessUrl },
                    'operateStatus': 1
                })
                return enclosures
            })
        }
        this.injections.reduce('upload', enclosures, undefined, fileList ? fileList.length : undefined)
        return enclosures
    }

    convertVoucherItemForServer = (item, isForUpdate) => {
        if (!item || !item.get('accountingSubject')) {
            return undefined
        }

        //如果需要数量/外币 核算,但是没有填写
        if ((item.get('accountingSubject').get('isCalcQuantity') || item.get('accountingSubject').get('isCalcMulti')) &&
            !item.get('quantityAndForeignCurrency')) {
            return undefined
        }

        //如果需要辅助核算,但是没有填写
        if (item.get('accountingSubject').get('isCalc') && !item.get('accountingSubject').get('auxAccountSubjects')) {
            return undefined
        }

        let entry = {
            id: item.get('id') ? item.get('id') : null,
            summary: item.get('summary'),
            accountId: item.get('accountingSubject').get('id'),
            origAmountDr: item.get('debitAmount'),
            amountDr: item.get('debitAmount'),
            origAmountCr: item.get('creditAmount'),
            amountCr: item.get('creditAmount'),
            ts: item.get('ts') ? item.get('ts') : null,
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
        if (item.get('accountingSubject').get('isCalcQuantity')) {
            entry.quantity = item.get('quantityAndForeignCurrency').get('quantity')
            entry.price = item.get('quantityAndForeignCurrency').get('price')
            entry.unitId = item.get('accountingSubject').get('unitId') //计量单位, 暂不支持编辑, 所以用科目里设置的即可
            entry.exchangeRate = 1
        } else {
            entry.quantity = null
            entry.price = null
            entry.unitId = null
            entry.exchangeRate = null
        }

        //外币辅助核算
        if (item.get('accountingSubject').get('isCalcMulti')) {
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
        if (item.get('accountingSubject').get('isCalc')) {
            let auxAccountSubjects = item.get('accountingSubject').get('auxAccountSubjects')
            //部门
            if (item.get('accountingSubject').get('isCalcDepartment') && auxAccountSubjects.get('department')) {
                entry.departmentId = auxAccountSubjects.get('department').get('id')
            } else {
                entry.departmentId = null //为了保持上下分录属性字段数量一致，需传null 临时方案 haozhao
            }

            //人员
            if (item.get('accountingSubject').get('isCalcPerson') && auxAccountSubjects.get('person')) {
                entry.personId = auxAccountSubjects.get('person').get('id')
            } else {
                entry.personId = null
            }

            //客户
            if (item.get('accountingSubject').get('isCalcCustomer') && auxAccountSubjects.get('customer')) {
                entry.customerId = auxAccountSubjects.get('customer').get('id')
            } else {
                entry.customerId = null
            }

            //供应商
            if (item.get('accountingSubject').get('isCalcSupplier') && auxAccountSubjects.get('supplier')) {
                entry.supplierId = auxAccountSubjects.get('supplier').get('id')
            } else {
                entry.supplierId = null
            }

            //存货
            if (item.get('accountingSubject').get('isCalcInventory') && auxAccountSubjects.get('inventory')) {
                entry.inventoryId = auxAccountSubjects.get('inventory').get('id')
            } else {
                entry.inventoryId = null
            }

            //项目
            if (item.get('accountingSubject').get('isCalcProject') && auxAccountSubjects.get('project')) {
                entry.projectId = auxAccountSubjects.get('project').get('id')
            } else {
                entry.projectId = null
            }

            //自定义档案
            for (var j = 1; j <= 10; j++) {
                if (item.get('accountingSubject').get(`isExCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`)) {
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

        if (item.get('currencyForUpdateRate')) {
            entry.currencyForUpdateRate = item.get('currencyForUpdateRate')
        } else {
            entry.currencyForUpdateRate = null
        }

        return entry
    }

    onSummarySelect = (path, rowIndex, row, src) => async (v) => {
        const hit = data.find(src, 'name', v) //src.find(o => o.name == v)
        if (hit) {
            if (hit.type == 'template') {
                if (!!v) {
                    v = v.replace(' [模板]', '')
                }

                let response = await this.webapi.commonDoc.findById({ docTemplateName: v })
                response.entrys = await this.getMultiAccountBalance(response.entrys)
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
            if (edit_status != data.ADD_STATUS) {
                other['data.other.editStatus'] = data.EDIT_STATUS
            }

            this.injections.reduce('setOther', other)
        }
        //设置凭证当前单据状态，供单据页签关闭用 false：关闭不提醒 true 关闭提醒
        // this.editCloseTips(true)
    }

    onSummaryChange = (rowIndex) => async (v) => {
        let details = this.metaAction.gf('data.form.details'), other = {}

        details = details.update(rowIndex, item => item.set('summary', v))
        other['data.form.details'] = details

        let edit_status = this.metaAction.gf('data.other.editStatus')
        if (edit_status != data.ADD_STATUS) {
            other['data.other.editStatus'] = data.EDIT_STATUS
        }
        this.injections.reduce('setOther', other)
    }

    onFieldChange = async (path, oldValue, newValue, type) => {
        let certificateData = this.getCertificateData(),
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
                console.log('---------符合条件-------------')
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
            document.getElementsByClassName('app-proof-of-charge-form-header-attachment-number')[0].focus()
            document.getElementsByClassName('ant-calendar-picker-input')[0].removeEventListener('keydown', this.dateKeydown, false)
        }
    }

    onPressEnter = (fieldName) => {
        if (fieldName == 'code') {
            this.injections.reduce('setOther', { 'data.other.focusFieldPath': 'root.children.formHeader.children.date.children.date' })
            document.getElementsByClassName('ant-calendar-picker-input')[1].focus()
            document.getElementsByClassName('ant-calendar-picker-input')[1].addEventListener('keydown', this.dateKeydown, false)
        } else if (fieldName == 'date') {
            this.injections.reduce('setOther', { 'data.other.focusFieldPath': 'root.children.formHeader.children.attachment.children.attachment' })
        } else if (fieldName == 'attachment') {
            this.injections.reduce('setOther', { 'data.other.focusFieldPath': 'root.children.center.children.details.columns.summary.cell.cell,0' })
            this.extendAction.gridAction.cellAutoFocus()
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

    onSubjectSelect = (path, rowIndex, accountingSubjects) => async (v) => {
        let details = this.metaAction.gf('data.form.details'),
            curAccountingSubject = details.get(rowIndex).get('accountingSubject')
        const hit = data.find(accountingSubjects, 'id', v) //accountingSubjects.find(o => o.id == v)
        let balance, other = {}
        let edit_status = this.metaAction.gf('data.other.editStatus')
        if (edit_status != data.ADD_STATUS) {
            other['data.other.editStatus'] = data.EDIT_STATUS
        }
        // this.injections.reduce('setOther', other)
        let editStatus = this.metaAction.gf('data.other.editStatus')
        if (curAccountingSubject && curAccountingSubject.get('id') == hit.id) {
            if (!curAccountingSubject.get('isCalc') && (editStatus == data.ADD_STATUS || editStatus == data.EDIT_STATUS)) {
                balance = await this.getAccountBalance(path, fromJS(curAccountingSubject))
                curAccountingSubject = curAccountingSubject.toJS()
                curAccountingSubject.balance = this.getPageBalance(curAccountingSubject.code, rowIndex, balance.balance)
                curAccountingSubject.initBalance = balance
            }
            this.injections.reduce('onEvent', 'onEndEdit', { path: path, data: fromJS(curAccountingSubject), isChanged: true }, other)
        } else {
            if (!hit.isCalc && (editStatus == data.ADD_STATUS || editStatus == data.EDIT_STATUS)) {
                balance = await this.getAccountBalance(path, fromJS(hit))
                hit.balance = this.getPageBalance(hit.code, rowIndex, balance.balance)
                hit.initBalance = balance
            }
            this.injections.reduce('onEvent', 'onEndEdit', { path: path, data: fromJS(hit), isChanged: true }, other)
        }
        this.extendAction.gridAction.cellAutoFocus()
    }

    getPageBalance = (accountCode, rowIndex, initBalance) => {
        let details = this.metaAction.gf('data.form.details'),
            balance = initBalance

        for (var i = 0; i < details.size; i++) {
            if (i != rowIndex &&
                details.get(i).get('accountingSubject') &&
                details.get(i).get('accountingSubject').get('code') == accountCode) {

                balance = details.get(i).get('accountingSubject').get('balance')
            }
        }

        return balance
    }
    showBalanceContent = async (accountingSubject) => {
        let accountId = accountingSubject.id,
            certificateDate = moment(this.metaAction.gf('data.form.date')),
            year = certificateDate.year(),
            period = certificateDate.month() + 1,
            auxAccountSubjects = accountingSubject.auxAccountSubjects,
            param = {}
        param.accountId = accountId
        param.year = year
        param.period = period
        param.isReturnValue = true
        param.departmentId = auxAccountSubjects.department ? auxAccountSubjects.department.id : undefined
        param.personId = auxAccountSubjects.person ? auxAccountSubjects.person.id : undefined
        param.customerId = auxAccountSubjects.customer ? auxAccountSubjects.customer.id : undefined
        param.supplierId = auxAccountSubjects.supplier ? auxAccountSubjects.supplier.id : undefined
        param.inventoryId = auxAccountSubjects.inventory ? auxAccountSubjects.inventory.id : undefined
        param.projectId = auxAccountSubjects.project ? auxAccountSubjects.project.id : undefined
        let response = await this.webapi.certificate.getAccountPeriodsBalance(param)
        if (response && response.result == false) {
            this.metaAction.toast('error', response.error.message)
            return
        } else {
            let title = accountingSubject.codeAndName
            if (auxAccountSubjects.department) {
                title = `${title}_${auxAccountSubjects.department.name}`
            }
            if (auxAccountSubjects.person) {
                title = `${title}_${auxAccountSubjects.person.name}`
            }
            if (auxAccountSubjects.customer) {
                title = `${title}_${auxAccountSubjects.customer.name}`
            }
            if (auxAccountSubjects.supplier) {
                title = `${title}_${auxAccountSubjects.supplier.name}`
            }
            if (auxAccountSubjects.inventory) {
                title = `${title}_${auxAccountSubjects.inventory.name}`
            }
            if (auxAccountSubjects.project) {
                title = `${title}_${auxAccountSubjects.project.name}`
            }
            this.metaAction.modal('show', {
                title: '科目余额',
                width: 500,
                // footer: null,
                iconType: null,
                okText: '关闭',
                className: 'balance-modal-container',
                children: this.getBalanceContainer(response, title)
            })
        }
    }
    getBalanceContainer = (response, title) => {
        return (
            <div>
                <div className='balance-title' title={title}>{title}</div>
                {
                    response.map(
                        item => {
                            return (
                                <div style={{ marginBottom: '5px' }}>
                                    <span>{item.period}：</span>
                                    <span>{item.value}</span>
                                </div>

                            )
                        }
                    )
                }
            </div>
        )
    }

    amountBlur = (path) => () => {
        let curPath = this.metaAction.gf('data.other.originalFieldPath')
        // this.injections.reduce('onEvent', 'onBlur', { path: curPath, originalFieldPath: path}) //旧代码进行参考todo
        //todo
        this.injections.reduce('onEvent', 'onBlur', { path: path })
        // this.injections.reduce('setOther', { 'data.other.originalFieldPath': path })
    }

    onShortcutKey = (option) => {        
        if (event && (event.key == ' ' || event.keyCode == 32)) {
            let pzpath = this.metaAction.gf('data.other.path')
            //处理金额录入内存泄漏问题，借贷方金额不能使用onChange事件
            if (pzpath && pzpath.indexOf('.cell.cell,') > -1 &&
                document.activeElement.className == "ant-input mk-input-number app-proof-of-charge-cell editable-cell") {
                let amountData = document.activeElement.value
                this.amountChange(pzpath)(amountData)
                this.amountBlur(pzpath)()
            }
        }
        this.injections.reduce('onEvent', 'onShortcutKey', { path: option, keyEvent: event })
        if (event || event && (event.key == 'Process') && event.keyCode == 229) {
            this.extendAction.gridAction.cellAutoFocus()
        }
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
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
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

    getAuditText = () => {
        const certificateStatus = this.metaAction.gf('data.form.certificateStatus')
        if (certificateStatus === data.STATUS_VOUCHER_AUDITED) {
            return '反审核'
        } else {
            return '审核'
        }
    }

    cellStyle = (ctrlPath) => {
        let isFocus = this.metaAction.isFocus(ctrlPath)
        if (isFocus) {
            return " editable-cell"
        }
    }
    //附件上传之前检查
    beforeLoad = async (info, infoList) => {       
        infoList = infoList || []
        let attachmentFiles = this.metaAction.gf('data.form.attachmentFiles').toJS() || []
        return new Promise((resolve, reject) => {
            if (attachmentFiles.length + infoList.length > 20) {
                this.metaAction.toast('warning', `当前凭证的附件数为${attachmentFiles.length}，只能继续上传${20 - attachmentFiles.length}个附件`)
                reject(info);
            } else {
                resolve(info);
            }
        });

    }
    /**
    * 获取上传url
    */
    getActionUrl = () => {
        let token = fetch.getAccessToken()
        return "/v1/edf/file/upload?token=" + token
    }
    //附件上传状态改变
    attachmentChange = async (info) => {
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '附件添加'])
        this.injections.reduce('attachmentLoading', true)
        if (info.file.status === 'done') {
            if (info.file.response.error && info.file.response.error.message) {
                this.injections.reduce('attachmentLoading', false)
                return
            } else if (info.file.response.result && info.file.response.value) {
                this.upload(info.file.response.value, info.file.response.value.ts)
            }
        }
    }

    /**
     * 附件上传成功事件处理
     * @param  {[type]} imgName [description]
     * @return {[type]}         [description]
     */
    upload = async (file, ts) => {

        let form = this.metaAction.gf('data.form').toJS(),
            fileList = this.metaAction.gf('data.form.attachmentFiles').toJS() || [],
            fileData = []        
        fileList.push({
            "accessUrl": file.accessUrl,
            "ts": file.ts || '',
            "type": file.type,
            "name": file.originalName,
            "id": file.id
        })

        if (file.type != consts.FILETYPE_pic && file.type != consts.FILETYPE_word && file.type != consts.FILETYPE_excel && file.type != consts.FILETYPE_ppt && file.type != consts.FILETYPE_pdf && file.type != consts.FILETYPE_zip) {
            this.metaAction.toast('warning', '此文件类型不支持上传')
            this.injections.reduce('attachmentLoading', false)
            return
        }

        if (form.id) {//凭证已经存在
            let enclosures = []
            enclosures.push({
                "fileId": file.id,
                "operateStatus": 1,
                "file": {
                    "id": file.id,
                    "type": file.type
                }
            })

            let fileData = { "docId": form.id, enclosures: enclosures },
                data = await this.webapi.certificate.updateEnclosure(fileData),
                fileArr = []
            if (data) {
                let newenclosures = data.enclosures
                newenclosures.map((o) => {
                    fileArr.push({
                        "id": o.id,
                        "accessUrl": o.file.accessUrl,
                        "ts": o.ts || '',
                        "type": o.file.type,
                        "name": o.file.originalName,
                        "fileId": o.file.id
                    })
                })

                this.injections.reduce('upload', newenclosures, data.ts, fileArr.length)
            }
        } else {

            this.injections.reduce('upload', fileList, ts, fileList.slice(0, 19).length)
        }


        this.injections.reduce('attachmentLoading', false)
    }

    //附件的下载操作
    download = (ps) => {
        let targetMode,
            requestUrl = ps.accessUrl
        if (environment.isClientMode()) {
            targetMode = '_self'
        }
        else {
            targetMode = '_blank'
        }
        window.open(requestUrl, targetMode)
    }

    moreMenuClick = (e) => {
        switch (e.key) {
            case 'del':
                this.del()
                break
            case 'insert':
                this.insert()
                break
            default:
                break
        }
    }

    delFile = async (index) => {
        this.injections.reduce('attachmentVisible', true)
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            let form = this.metaAction.gf('data.form').toJS()
            let res = {
                "docId": form.id,
                "enclosures": [{
                    "id": index.id,
                    "operateStatus": 3,
                    "ts": index.ts,
                    "file": {
                        "id": index.fileId,
                        "type": index.type
                    }
                }]
            }
            // delete index
            form.attachmentFiles.map((o, i) => {
                if (o.fileId == index.fileId) {
                    form.attachmentFiles.splice(i, 1)
                }
                return form.attachmentFiles
            })

            if (form.id) {
                let data = await this.webapi.certificate.updateEnclosure(res)//
                if (data) {

                    this.injections.reduce('upload', form.attachmentFiles, data.ts, data.attachedNum)
                    this.metaAction.toast('success', '删除成功')
                }
            } else {
                this.injections.reduce('upload', form.attachmentFiles, index.ts, form.attachmentFiles.length)
            }

        }
    }

    del = async () => {
        let id = this.metaAction.gf('data.form.id'),
            ts = this.metaAction.gf('data.form.ts'),
            sourceVoucherCode = this.metaAction.gf('data.form.voucherSource'),
            sourceVoucherTypeId = this.metaAction.gf('data.form.sourceVoucherTypeId'),
            voucher, delText, delSuccessText

        if (sourceVoucherCode) {
            if (sourceVoucherTypeId == 143) {  //TODO  143
                delText = '单据：' + sourceVoucherCode + '是TTK会计填写的凭证，如果驳回，会将对应的流水账同时删除，请确认要驳回吗？'
            }
            else {
                if (sourceVoucherTypeId == 1000030017) { // 1000030017 未认证进项清单
                    delText = '删除凭证会对已认证的发票撤销认证，是否删除？'
                } else {
                    delText = '单据：' + sourceVoucherCode + '将被驳回到业务，当前凭证会被删除。请确认要驳回吗？'
                }
            }
            delSuccessText = '驳回'
        } else {
            delText = '确定删除该凭证?'
            delSuccessText = '删除'
        }
        if (!id || !ts) {
            this.metaAction.toast('info', '请先保存凭证!')
            return
        }
        //让保存按钮置灰，防止并发 置灰
        this.injections.reduce('showBtnState', true)
        const ret = await this.metaAction.modal('confirm', {
            title: delSuccessText + '凭证',
            content: delText
        })

        if (ret) {
            const response = await this.webapi.certificate.del({ docId: id, ts: ts, isReturnValue: true })

            // 删除或者驳回凭证后自动跳转到下一张凭证
            if (response && response.result == false && response.error) {
                this.metaAction.toast('error', response.error.message)
            } else if (response) {
                this.injections.reduce('loadCertificate', fromJS(response), data.VIEW_STATUS)
                this.metaAction.toast('success', '删除凭证成功')
            } else {
                this.newCertificate(undefined)
                this.metaAction.toast('success', '删除凭证成功')
            }
        }
        //让保存按钮置灰，防止并发 置灰
        this.injections.reduce('showBtnState', false)
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
        //TTK-3164
        this.checkEditStatusBeforeLoadNewVoucher(() => {
            this.injections.reduce('clearAndNewCertificate', { code: currentCode, voucherDate: currentDate, isInsert: true }, undefined, undefined, enabledYearMonth)
        })
        this.extendAction.gridAction.cellAutoFocus()

    }

    newCertificate = async (subjectList) => {
        //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '新增凭证'])
        let certificateDate = moment(this.metaAction.gf('data.form.date')),
            year = certificateDate.year(),
            period = certificateDate.month() + 1,
            option = { year: year, period: period, isReturnValue: true },
            enabledYearMonth = this.getEnabledYearMonth(),
            baseArchiveList = await this.webapi.certificate.getBaseArchive({ isNotGetAccount: true, isNotGetCurrency: true })

        const initCertificateData = await this.webapi.certificate.init(option)

        if (initCertificateData.result == false && initCertificateData.error && initCertificateData.error.code == '70002') {
            this.metaAction.toast('error', initCertificateData.error.message)
            this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList && subjectList.glAccounts ? subjectList : undefined, undefined, enabledYearMonth)
        } else {
            this.injections.reduce('clearAndNewCertificate', { code: initCertificateData.docCode, voucherDate: initCertificateData.voucherDate }, subjectList && subjectList.glAccounts ? subjectList : undefined, undefined, enabledYearMonth)
            this.extendAction.gridAction.cellAutoFocus()
        }
        this.setSummaryDS(baseArchiveList.summarys, baseArchiveList.glDocTemplateDtos)
    }

    loadNextCertificate = () => {
        this.checkEditStatusBeforeLoadNewVoucher(async () => {
            //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '下一张'])

            let code = this.metaAction.gf('data.form.code'),
                //新增状态, 当前时间的期间; 查看状态,使用单据时间的期间
                voucherMoment = moment(this.metaAction.gf('data.form.date')),
                currentYear = voucherMoment.year(),
                currentPeriod = voucherMoment.month() + 1,
                editStatus = this.metaAction.gf('data.other.editStatus'),
                isCreate,
                other = {},
                certificateTemplate = {},
                certificateStatus = this.metaAction.gf('data.form.certificateStatus')

            if (editStatus == data.ADD_STATUS) {
                isCreate = true
            } else {
                isCreate = false
            }
            // if(this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED){
            //     other['data.other.editStatus'] = data.EDIT_STATUS
            // }
            // this.injections.reduce('setOther', other)
            const response = await this.webapi.certificate.next({ docCode: code, year: currentYear, period: currentPeriod, isReturnValue: true, isCreate: isCreate })
            if (response.result == false &&
                response.error.code == data.ALREADY_LAST_CERTIFICATE) {
                this.metaAction.toast('warning', response.error.message)
                this.injections.reduce('setNextOrPrivDis', 'nextBtn')
                return
            } else {
                certificateTemplate.entrys = await this.getMultiAccountBalance(response.entrys)
                this.injections.reduce('loadCertificate', fromJS(response), data.VIEW_STATUS)
                // this.injections.reduce('applyCertificateTemplate', fromJS(certificateTemplate), certificateStatus == data.STATUS_VOUCHER_NOT_AUDITED?data.EDIT_STATUS:data.VIEW_STATUS)
            }
        })
    }

    loadPrevCertificate = () => {
        this.checkEditStatusBeforeLoadNewVoucher(async () => {
            //_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '上一张'])

            let code = this.metaAction.gf('data.form.code'),
                //新增状态, 当前时间的期间; 查看状态,使用单据时间的期间
                voucherMoment = moment(this.metaAction.gf('data.form.date')),
                currentYear = voucherMoment.year(),
                currentPeriod = voucherMoment.month() + 1,
                editStatus = this.metaAction.gf('data.other.editStatus'),
                isCreate,
                other = {},
                certificateTemplate = {},
                certificateStatus = this.metaAction.gf('data.form.certificateStatus')

            if (editStatus == data.ADD_STATUS) {
                isCreate = true
            } else {
                isCreate = false
            }
            // if(this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED){
            //     other['data.other.editStatus'] = data.EDIT_STATUS
            // }
            // this.injections.reduce('setOther', other)
            const response = await this.webapi.certificate.prev({ docCode: code, year: currentYear, period: currentPeriod, isReturnValue: true, isCreate: isCreate })
            if (response.result == false &&
                response.error.code == data.ALREADY_FIRST_CERTIFICATE) {
                this.metaAction.toast('warning', response.error.message)
                this.injections.reduce('setNextOrPrivDis', 'prevBtn')
            } else {
                certificateTemplate.entrys = await this.getMultiAccountBalance(response.entrys)
                this.injections.reduce('loadCertificate', fromJS(response), data.VIEW_STATUS)
                // this.injections.reduce('applyCertificateTemplate', fromJS(certificateTemplate), certificateStatus == data.STATUS_VOUCHER_NOT_AUDITED?data.EDIT_STATUS:data.VIEW_STATUS)
            }
        })
    }

    // 批量复制凭证的翻页
    loadPagingDoc = (pagingDirection) => () => {
        // 当前凭证校验
        let form = this.metaAction.gf('data.form').toJS()
        const msg = this.checkVoucherDataBeforeSave(form),
            checkStyle = { textAlign: 'left', fontSize: '14px', display: 'inline-block', verticalAlign: 'top' }

        if (msg.length > 0) {
            this.metaAction.toast('warning',
                <div style={checkStyle}>
                    {msg.map((o, index) => <p style={{ marginBottom: '0' }}>{(index + 1) + '.' + o}</p>)}
                </div>
            )
            return
        }

        // 获取当前凭证数据
        let certificateData = this.getCertificateData()

        let currentIndex = this.metaAction.gf('data.other.currentIndex'),
            docs = this.metaAction.gf('data.other.docs').toJS(), other = []

        // 更新批量凭证数组
        docs[currentIndex] = certificateData

        if (pagingDirection == 'left') {
            if (currentIndex > 0) {
                currentIndex--
            } else {
                if (this.metaAction.gf('data.other.toPrevPage') == 'toPrevPage-disabled') {
                    return
                }
                this.metaAction.toast('warning', '已经是第一张凭证')
                this.injections.reduce('setPageIconStyle', pagingDirection, currentIndex, docs.length)
                return
            }
        } else {
            if (currentIndex < docs.length - 1) {
                currentIndex++
            } else {
                if (this.metaAction.gf('data.other.toNextPage') == 'toNextPage-disabled') {
                    return
                }
                this.metaAction.toast('warning', '已经是最后一张凭证')
                this.injections.reduce('setPageIconStyle', pagingDirection, currentIndex, docs.length)
                return
            }
        }
        let glAccounts = window.accountingSubjects,
            glAccountsAll = window.accountingSubjectsAll,
            // let glAccounts = this.metaAction.gf('data.other.accountingSubjects').toJS(),
            // glAccountsAll = this.metaAction.gf('data.other.accountingSubjectsAll').toJS(),
            calcDict = this.metaAction.gf('data.other.calcDict').toJS(),
            currencyList = this.metaAction.gf('data.other.currencyDS').toJS(),
            subjectList = {
                glAccounts: glAccounts,
                glAccountsAll: glAccountsAll,
                calcDict: calcDict
            },
            enabledYearMonth = this.getEnabledYearMonth()
        certificateData = docs[currentIndex]
        other['data.other.copyDocId'] = currentIndex + 1  //标识而已
        other['data.other.currentIndex'] = currentIndex
        other['data.other.docs'] = fromJS(docs)

        this.injections.reduce('initLoadCertificate', fromJS(certificateData), enabledYearMonth, subjectList, currencyList, other)
    }

    getPageCount = () => {
        let content = '',
            currentIndex = this.metaAction.gf('data.other.currentIndex'),
            docs = this.metaAction.gf('data.other.docs')

        content = `当前第${currentIndex + 1}张 共${docs.size}张`

        return content
    }

    //在加载新单据(空单据)前, 检查并提示保存修改
    checkEditStatusBeforeLoadNewVoucher = async (callBack) => {
        let needSave = false,        //是否需要提示保存: 编辑状态 || 新增状态并填写了分录
            editStatus = this.metaAction.gf('data.other.editStatus'),
            nextDisalbed = this.metaAction.gf('data.form.nextDisalbed'),
            prevDisalbed = this.metaAction.gf('data.form.prevDisalbed')

        if (editStatus == data.EDIT_STATUS) {
            needSave = true
        } else if (editStatus == data.ADD_STATUS) {
            let details = this.metaAction.gf('data.form.details')

            if (details) {
                let emptyItem = Map(data.blankVoucherItem)
                for (let detail of details) {
                    if (detail && !is(detail, emptyItem)) {
                        needSave = true
                        break
                    }
                }
            }
        }

        if (needSave) {
            let handleNegative = () => {
                callBack()
            },
                handleOk = () => {
                    this.save(() => {
                        callBack()
                    })
                }
            const ret = await this.metaAction.modal('confirm', {
                title: '保存',
                content: '您的凭证尚未保存，是否要保存?'
            })

            if (ret) {
                handleOk()
            } else {
                handleNegative()
            }
        } else {
            callBack()
        }
    }

    isCommonTemplateDisabled = () => {
        let editStatus = this.metaAction.gf('data.other.editStatus')
        return (editStatus != data.ADD_STATUS)// 只有新增状态可以引用常用模板
    }

    renderFormHeaderTitleShow = (date) => {
        if (!date) {
            return
        }
        if (typeof date == 'string') {
            date = moment(new Date(date))
        }
        return <span>{`${date.year()}年第${date.month() + 1}期`}</span>
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
            win.removeEventListener('resize', this.onResize, false)
            win.removeEventListener('onTabFocus', this.onTabFocus, false)
            document.getElementById("app").removeEventListener('click', this.windowClick, false)
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            win.detachEvent('onTabFocus', this.onTabFocus)
            document.getElementById("app").detachEvent('onclick', this.windowClick)
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
        } else {
            window.onresize = undefined
        }

        let removeTabsCloseListen = this.component.props.removeTabsCloseListen
        if (removeTabsCloseListen) {
            removeTabsCloseListen('app-proof-of-charge')
        }

        let removeTabChangeListen = this.component.props.removeTabChangeListen
        if (removeTabChangeListen) {
            removeTabChangeListen('app-proof-of-charge')
        }
        window.accountingSubjects = null
        window.accountingSubjectsAll = null
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
        // let curRowIndex = this.metaAction.gf('data.hoverRowIndex')
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

            auxBtnStyle = { width: '14px', display: 'inline-block', lineHeight: '14px', top: top + 'px', 'font-size': '12px', right: right, 'z-index': '9', position: 'absolute' }
            other = { 'data.other.cellAuxStyle': 'cellAuxStyle' }
        }
        else {
            auxBtnStyle = { display: 'none' }
            other = { 'data.other.cellAuxStyle': '' }
        }
        this.injections.reduce('mouseHoverRow', option, auxBtnStyle, other)
    }

    handleRowMouseLeave = () => {
        this.injections.reduce('setAuxBtnVisible', { display: 'none' })
    }

    handleScrollEnd = (x, y) => {
        this.injections.reduce('setCertificateBodyScrollY', y)
    }

    readonlyOnGrid = () => {
        return this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_AUDITED
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
