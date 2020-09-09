import React, { PureComponent } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import { Map, List, fromJS } from 'immutable'
import { Popover, Button } from 'antd'
import ModalComponent from '../modal/index'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import isEqual from 'lodash.isequal'
import utils from 'edf-utils'
import PropTypes from 'prop-types'
const Modal = ModalComponent
export default class subjectDisplayComponent extends PureComponent {
    state = {
        isAuxNotFilled: false,
        data: Map({
            value: null,
            style: null,
            className: null,
            align: null,
            accountingSubject: null
        }),
        auxAccountSubjects: null
    }
    static childContextTypes = {
        store: PropTypes.object
    }

    getChildContext() {
        return {
            store: this.props.store
        }
    }

    constructor(props) {
        super(props)
        //构造函数只在组件初始化的时候执行一次,这种绑定最优
        this.openAuxItem = this.openAuxItem.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.state = this.computeState(this.props)
    }

    componentWillUnmount() {
        //存在引用关系
        // window.reduxStore = undefined
    }

    componentWillReceiveProps(nextProps) {       
        this.setState(this.computeState(nextProps))
    }

    shouldComponentUpdate(nextProps, nextState) {
        //修复IE11下脚本运行时间过长问题 TTK-2926       
        let browserType = utils.environment.getBrowserVersion(),
            _shouldComponentUpdate = false
        if (browserType && browserType.ie) {
            _shouldComponentUpdate = !(isEqual(this.state.data.get('accountingSubject'), nextState.data.get('accountingSubject')) && this.state.isAuxNotFilled == nextState.isAuxNotFilled)
        } else {
            _shouldComponentUpdate = !(this.state.data.equals(nextState.data) && this.state.isAuxNotFilled == nextState.isAuxNotFilled)
        }

        return _shouldComponentUpdate
    }

    computeState(props) {
        let { data } = this.state
        let { style, className, align, value, path } = props,
            curIndex = path.split(',')[1],
            editStatus = this.props.gf('data.other.editStatus'),
            accountingSubject = this.props.gf('data.form.details').get(curIndex).get('accountingSubject'),
            codeAndName,
            calcDict = this.props.gf('data.other.calcDict'),
            auditStatus = this.props.gf('data.form.certificateStatus'),
            quantityAndForeignCurrency = this.props.gf('data.form.details').get(curIndex).get('quantityAndForeignCurrency')
        if (!Map.isMap(accountingSubject) && !List.isList(accountingSubject) && (typeof accountingSubject == 'object')) {
            accountingSubject.calcDict = calcDict
            codeAndName = accountingSubject.codeAndName
            accountingSubject = fromJS(accountingSubject)
        } else if (Map.isMap(accountingSubject)) {
            codeAndName = accountingSubject.get('codeAndName')
            accountingSubject = accountingSubject.set('calcDict', Map(calcDict))
        }
        data = data.set('value', codeAndName)
        data = data.set('style', style)
        data = data.set('className', className)
        data = data.set('align', align)
        data = data.set('path', path)
        data = data.set('accountingSubject', accountingSubject)
        data = data.set('calcDict', calcDict)
        data = data.set('editStatus', editStatus)
        data = data.set('rowIndex', curIndex)
        data = data.set('auditStatus', auditStatus)
        data = data.set('quantityAndForeignCurrency', quantityAndForeignCurrency)

        if (accountingSubject && auditStatus == 1000020001) {
            let balance = accountingSubject.get('balance')
            let quantity = accountingSubject.get('initBalance') ? accountingSubject.get('initBalance').get('quantity') : 0

            let curQuantity = accountingSubject.get('balanceDirectionName') == '借' && this.props.gf('data.form.details').get(curIndex).get('creditAmount') && this.props.gf('data.form.details').get(curIndex).get('creditAmount') != 0
                || accountingSubject.get('balanceDirectionName') == '贷' && this.props.gf('data.form.details').get(curIndex).get('debitAmount') && this.props.gf('data.form.details').get(curIndex).get('debitAmount') != 0
                ? quantityAndForeignCurrency && (-1 * quantityAndForeignCurrency.get('quantity')) : quantityAndForeignCurrency && quantityAndForeignCurrency.get('quantity')
            let totalQuantity = (Number(quantity) + Number(curQuantity)).toFixed(6)
            data = data.set('balance', balance)
            if (editStatus == 1) {
                data = data.set('quantity', totalQuantity)
            } else {
                data = data.set('quantity', 0)
            }
        }

        this.oldAccountingSubject = accountingSubject
        return {
            data,
            isAuxNotFilled: (!!accountingSubject && (typeof accountingSubject == 'object') && (!!accountingSubject.get('isCalc')) && !accountingSubject.get('auxAccountSubjects'))
        }
    }

    getPopupContainer = (cls) => {
        if (cls && cls.indexOf('app-proof-of-charge-common-edit') > 0) {
            return document.querySelector('.app-proof-of-charge-common-edit')
        } else {
            return document.querySelector('.app-proof-of-charge')
        }
    }

    onWriteBackAuxItem(auxAccountSubjects) {
        localStorage.removeItem('auxAccountSubjects')
        localStorage.setItem('auxAccountSubjects', JSON.stringify(auxAccountSubjects))
    }

    get(propertyName) {
        if (!propertyName || propertyName === '') {
            return this.state.data
        }
        return this.state.data.getIn(propertyName.split('.'))
    }

    set(propertyName, accountingSubject) {
        let data = this.state.data
        return data.setIn(propertyName.split('.'), accountingSubject)
    }

    handleCancel = () => {
        this.setState({ data: this.state.data, isAuxNotFilled: false })
        this.props.onEvent && this.props.onEvent('cancelEditAuxAccount', { path: this.props.path })
        localStorage.removeItem('auxAccountSubjects')
    }

    handleConfirmClick() {
        this.setState({ data: this.state.data, isAuxNotFilled: false })
        let auxAccountSubjects = JSON.parse(localStorage.getItem('auxAccountSubjects'))
        this.props.onEvent && this.props.onEvent('endEditAuxAccount', { path: this.props.path, data: fromJS({ auxAccountSubjects: auxAccountSubjects }) })
        localStorage.removeItem('auxAccountSubjects')
    }

    handleClick = async (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        let response = await this.props.selectSubject()
        if (response == false) {
            return
        }
        let accountingSubject = this.state.data.get('accountingSubject'),
            accountCode = this.state.data.get('accountingSubject').get('code'),
            accountName = this.state.data.get('accountingSubject').get('codeAndName'),
            auxAccountSubjectsPreSelected = accountingSubject.get('auxAccountSubjectsPreSelected'),
            date = moment(this.props.gf('data.form.date')),
            option = this.getParamOption(accountCode, accountName, date, auxAccountSubjectsPreSelected, accountingSubject)
        option.accessType = 1
        let otherData = this.props.gf('data.other')
        if (!!accountingSubject.get('isCalc')) {
            const appName = 'app-auxdetailaccount-rpt'
            if (otherData.get('copyDoc') || otherData.get('isFromXdz')) {
                option.isShowModal = true//打开弹出窗体
                let detailApp = <AppLoader name={appName}
                    {...option}
                    store={window.reduxStore}
                    setPortalContent={this.props.setPortalContent}
                />
                await Modal.show({
                    title: '辅助明细账',
                    width: 1200,
                    className: 'docRpt-modal-container',
                    children: detailApp,
                })
            } else {
                this.props.setPortalContent &&
                    this.props.setPortalContent('辅助明细账', appName, option)
            }
        } else {
            const appName = 'app-detailaccount-rpt'
            if (otherData.get('copyDoc') || otherData.get('isFromXdz')) {
                option.isShowModal = true//打开弹出窗体
                let detailApp = <AppLoader name={appName}
                    {...option}
                    store={window.reduxStore}
                    setPortalContent={this.props.setPortalContent}
                />
                await Modal.show({
                    title: '明细账',
                    width: 1200,
                    className: 'docRpt-modal-container',
                    children: detailApp,
                })
            } else {
                this.props.setPortalContent &&
                    this.props.setPortalContent('明细账', appName, option)
            }

        }
    }



    getShowBalance() {
        return this.get('auditStatus') == 1000020001
    }

    getShowQuantity() {
        if (!this.get('value')) {
            return false
        }
        return (this.get('editStatus') == 1 && this.get('accountingSubject') && this.get('accountingSubject').get('isCalcQuantity') == true)
    }

    //填写辅助核算的界面
    getEditAuxAccountContent() {
        let appName = 'app-proof-of-charge-assistitem',
            accountingSubject = this.state.data.get('accountingSubject'),
            refName = 'auxAccountSubjects' + Math.random(),
            app = <AppLoader name={appName} ref={refName}
                initData={accountingSubject}
                store={window.reduxStore}
                setPortalContent={this.props.setPortalContent}
                onWriteBackAuxItem={this.onWriteBackAuxItem} />

        let handleOK = () => {
            let auxAccountSubjects = JSON.parse(localStorage.getItem('auxAccountSubjects')),
                errorMessage = this.checkAuxItemEmpty(auxAccountSubjects)
            if (errorMessage.length > 0) {
                this.props.toast('warning', this.getDisplayErrorMSg(errorMessage), 10)
                return
            } else {
                setTimeout(() => {
                    this.handleConfirmClick()
                }, 0)
            }
        }
        let length = 0
        if (accountingSubject) {
            let subject = accountingSubject.toJS()
            let list = ['isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10']
            list.map(o => {
                if (subject[o]) {
                    ++length
                }
            })
        }
        let height = length * 39 + 69
        //div初始化一个宽度,与即将加载的apploader里同款, 避免apploader异步加载完后, popover整体偏
        return (
            <div id='assistDiv' style={{ width: '445px', padding: '13px', paddingLeft: '0px', paddingBottom: '0px', 'z-index': 99999999999, overflow: 'hidden', height: height }}>
                {app}
                <div style={{ width: '405px', 'padding-top': '10px', textAlign: 'center' }}>
                    <Button type="ghost" onClick={this.handleCancel} id="auxItemCancel" style={{ fontSize: '13px' }}>取消</Button>
                    <Button type="primary" onClick={handleOK} id='auxItemConfirm' style={{ marginLeft: '10px', fontSize: '13px' }}>确定</Button>
                </div>
            </div >
        )
    }

    render() {     
        let data = this.state.data,
            value = data.get('value'),
            style = data.get('style'),
            align = data.get('align'),
            balancePath = data.get('path').replace('root.children.center.children.details.columns.', 'linkApp.'),
            balanceText = value ? '余额 : ' : '',
            className = data.get('className'),
            cls = classNames({
                'mk-datagrid-cellContent': true,
                [`mk-datagrid-cellContent-${align}`]: !!align,
                [className]: !!className
            }),
            subjectAndAuxName, isCalc = false

        let accountingSubject = data.get('accountingSubject')
        if (accountingSubject) {
            isCalc = accountingSubject.get('isCalc')
        }
        let subjectCodeAndName = value,
            subjectWithAuxName = this.getSubjectWithAuxName(subjectCodeAndName) || '',
            showBalance = !!this.getShowBalance(),
            showQuantity = !!this.getShowQuantity(),
            content = this.getEditAuxAccountContent()
        subjectAndAuxName = (subjectCodeAndName ? subjectCodeAndName : '') + subjectWithAuxName

        if (this.state.isAuxNotFilled && accountingSubject) {
            return (
                <Popover content={content}
                    getPopupContainer={() => this.getPopupContainer(cls)}
                    zIndex='99999'
                    placement="bottomLeft"
                    trigger='focus'
                    autoAdjustOverflow={true}
                    overlayClassName={'subjectDisplayModal'}
                    visible={this.state.isAuxNotFilled} >
                    <div className={cls} style={innerStyle}>
                        <div style={{ width: '100%', height: '100%', 'padding-top': '5px', 'padding-left': '8px' }}>
                            {subjectCodeAndName}
                        </div>
                    </div>
                </Popover >
            )
        }

        let balanceStyle = { cursor: 'pointer', paddingTop: '6px' },
            balanceStyle1 = { cursor: 'pointer', paddingTop: '6px', marginRight: '8px' },
            balance = this.get('balance') != undefined ? `${this.get('balance') || 0}` : '',
            quantity = this.get('quantity') != undefined ? `${this.get('quantity') || 0}` : '',
            balanceColor = balance < 0 ? { color: 'red' } : {},
            isShowBalance = accountingSubject ? accountingSubject.get('isShowBalance') : null

        let auxBtnStyle, quantityValue = !isNaN(quantity) ? quantity : '0.000000'

        let innerStyle = {
            ...style,
            flexDirection: 'column',
            paddingTop: this.get('editStatus') == 1 ? '5px' : (isShowBalance || showQuantity ? '5px' : '15px'),
            display: "inline-block"
        }
        if (isCalc && this.get('auditStatus') != 1000020002) {
            auxBtnStyle = { width: '14px', display: 'inline-block', lineHeight: '14px', 'font-size': '12px', right: '5px', 'z-index': '9', position: 'absolute', top: '4px' }
        } else {
            auxBtnStyle = { display: 'none' }
        }
        if (showBalance) {
            if (subjectCodeAndName) {
                return (
                    <div className={cls} style={innerStyle}>
                        <div style={{ color: '#333333', 'max-height': '34px' }} title={subjectAndAuxName}>{subjectAndAuxName}</div>
                        <div style={{ 'margin-bottom': '5px' }}>
                            {this.get('editStatus') == 1 ?
                                <a className='linkApp1' id={balancePath} style={balanceStyle1} onClick={this.handleClick} >
                                    <span className="linkApp" onClick={this.handleClick} >{balanceText}</span>
                                    <span className="linkApp" onClick={this.handleClick} style={balanceColor}>{balance}</span>
                                </a > :
                                isShowBalance ?
                                    <a className='linkApp1' id={balancePath} style={balanceStyle1} onClick={this.handleClick} >
                                        <span className="linkApp" onClick={this.handleClick} >{balanceText}</span>
                                        <span className="linkApp" onClick={this.handleClick} style={balanceColor}>{balance}</span>
                                    </a >
                                    : null
                            }
                            {showQuantity ? <span className='linkApp' style={balanceStyle}>
                                <span className="linkApp"> {this.get('quantity') != undefined ? '数量 : ' : ''}</span >
                                <span className="linkApp" style={balanceColor}>{quantityValue}</span>
                            </span> : null}

                        </div >
                        <a onClick={this.openAuxItem} className="linkApp" style={auxBtnStyle}>辅助项</a>
                    </div >
                )
            } else {
                let __innerStyle = {
                    ...innerStyle,
                    'line-height': '23px'
                }

                return (
                    <div className={cls} style={__innerStyle}>
                        <div style={{ width: '100%', color: '#333333' }} title={subjectAndAuxName}>{subjectAndAuxName}</div>
                        <a onClick={this.openAuxItem} className="linkApp" style={auxBtnStyle}>辅助项</a>
                    </div >
                )
            }
        } else {
            let __innerStyle = {
                ...innerStyle,
                'line-height': '23px'
            }
            return (
                <div className={cls} style={__innerStyle}>
                    <div style={{ width: '100%', color: '#333333' }} title={subjectAndAuxName}>{subjectAndAuxName}</div>
                    <a onClick={this.openAuxItem} className="linkApp" style={auxBtnStyle}>辅助项</a>
                </div >
            )
        }
    }

    openAuxItem = () => {
        let data = this.state.data,
            rowIndex = data.get('rowIndex')
        this.props.updateAuxItem(rowIndex)
    }

    getSubjectWithAuxName() {
        //例如：1001 库存现金_一级 / 二级 / A客户_一级部门 / 二级部门 / B部门_一级 / 二级 / A存货（规格型号）进行显示
        let accountingSubject = this.state.data.get('accountingSubject')
        if (!accountingSubject || (typeof accountingSubject != 'object')) return ''
        let subjectWithAuxName = '',
            auxAccountSubjects = accountingSubject.get('auxAccountSubjects') || List()

        if (accountingSubject.get('isCalcCustomer') && auxAccountSubjects.get('customer') && auxAccountSubjects.get('customer').get('name')) {
            subjectWithAuxName = `${subjectWithAuxName}_${auxAccountSubjects.get('customer').get('categoryHierarchyName')
                ? auxAccountSubjects.get('customer').get('categoryHierarchyName') + "/"
                : ""}${auxAccountSubjects.get('customer').get('name')}`
        }
        if (accountingSubject.get('isCalcSupplier') && auxAccountSubjects.get('supplier') && auxAccountSubjects.get('supplier').get('name')) {
            subjectWithAuxName = `${subjectWithAuxName}_${auxAccountSubjects.get('supplier').get('categoryHierarchyName') ?
                auxAccountSubjects.get('supplier').get('categoryHierarchyName') + "/"
                : ""}${auxAccountSubjects.get('supplier').get('name')}`
        }
        if (accountingSubject.get('isCalcProject') && auxAccountSubjects.get('project') && auxAccountSubjects.get('project').get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('project').get('name')
        }
        if (accountingSubject.get('isCalcDepartment') && auxAccountSubjects.get('department') && auxAccountSubjects.get('department').get('name')) {
            subjectWithAuxName = `${subjectWithAuxName}_${auxAccountSubjects.get('department').get('categoryHierarchyName') ?
                auxAccountSubjects.get('department').get('categoryHierarchyName')
                : ""}`
        }
        if (accountingSubject.get('isCalcPerson') && auxAccountSubjects.get('person') && auxAccountSubjects.get('person').get('name')) {
            subjectWithAuxName = `${subjectWithAuxName}_${auxAccountSubjects.get('person').get('categoryHierarchyName') ?
                auxAccountSubjects.get('person').get('categoryHierarchyName') + "/"
                : ""}${auxAccountSubjects.get('person').get('name')}`
        }
        if (accountingSubject.get('isCalcInventory') && auxAccountSubjects.get('inventory') && auxAccountSubjects.get('inventory').get('name')) {
            subjectWithAuxName = `${subjectWithAuxName}_${auxAccountSubjects.get('inventory').get('categoryHierarchyName')
                ? auxAccountSubjects.get('inventory').get('categoryHierarchyName') + "/"
                : ""}${auxAccountSubjects.get('inventory').get('name')}${auxAccountSubjects.get('inventory').get('specification')
                    ? "(" + auxAccountSubjects.get('inventory').get('specification') + ")"
                    : ''}`
        }

        //自定义档案       
        for (var j = 1; j <= 10; j++) {
            if (accountingSubject.get(`isExCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`).get('name')) {
                subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get(`exCalc${j}`).get('name')
            }
        }
        return subjectWithAuxName
    }

    checkAuxItemEmpty(auxAccountSubjects) {
        let accountingSubject = this.state.data.get('accountingSubject'),
            errorMessage = []

        if (!!accountingSubject.get('isCalcCustomer') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.customer == undefined))) {
            errorMessage.push('客户不能为空')
        }
        if (!!accountingSubject.get('isCalcSupplier') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.supplier == undefined))) {
            errorMessage.push('供应商不能为空')
        }
        if (!!accountingSubject.get('isCalcProject') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.project == undefined))) {
            errorMessage.push('项目不能为空')
        }
        if (!!accountingSubject.get('isCalcDepartment') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.department == undefined))) {
            errorMessage.push('部门不能为空')
        }
        if (!!accountingSubject.get('isCalcPerson') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.person == undefined))) {
            errorMessage.push('人员不能为空')
        }
        if (!!accountingSubject.get('isCalcInventory') &&
            (auxAccountSubjects == null ||
                (auxAccountSubjects && auxAccountSubjects.inventory == undefined))) {
            errorMessage.push('存货不能为空')
        }

        //自定义档案
        let calcDict = this.props.gf('data.other.calcDict'),
            userDefineItemName
        for (var j = 1; j <= 10; j++) {
            if (!!accountingSubject.get(`isExCalc${j}`) &&
                (auxAccountSubjects == null ||
                    (auxAccountSubjects && auxAccountSubjects[`exCalc${j}`] == undefined))) {

                userDefineItemName = calcDict.get(`isExCalc${j}`)
                errorMessage.push(`${userDefineItemName}不能为空`)
            }
        }
        return errorMessage
    }

    getParamOption(accountCode, accountName, date, auxItem, accountingSubject) {
        let option = {}, autItemParam = {}
        if (accountingSubject.get('isCalc')) {
            if (this.isEmptyAuxItem(auxItem)) {
                if (accountingSubject.get('isCalcCustomer')) autItemParam.customerId = null
                if (accountingSubject.get('isCalcSupplier')) autItemParam.supplierId = null
                if (accountingSubject.get('isCalcProject')) autItemParam.projectId = null
                if (accountingSubject.get('isCalcDepartment')) autItemParam.departmentId = null
                if (accountingSubject.get('isCalcPerson')) autItemParam.personId = null
                if (accountingSubject.get('isCalcInventory')) autItemParam.inventoryId = null

                for (var j = 1; j <= 10; j++) {
                    if (accountingSubject.get(`isExCalc${j}`)) autItemParam[`isExCalc${j}`] = null
                }
            } else {
                if (auxItem.get('customer')) autItemParam.customerId = auxItem.get('customer').get('id')
                if (auxItem.get('supplier')) autItemParam.supplierId = auxItem.get('supplier').get('id')
                if (auxItem.get('project')) autItemParam.projectId = auxItem.get('project').get('id')
                if (auxItem.get('department')) autItemParam.departmentId = auxItem.get('department').get('id')
                if (auxItem.get('person')) autItemParam.personId = auxItem.get('person').get('id')
                if (auxItem.get('inventory')) autItemParam.inventoryId = auxItem.get('inventory').get('id')

                for (var j = 1; j <= 10; j++) {
                    if (auxItem.get(`exCalc${j}`)) autItemParam[`isExCalc${j}`] = auxItem.get(`exCalc${j}`).get('id')
                }

            }
            option = {
                linkInSearchValue: {
                    accountCode: accountCode,
                    date_start: date,
                    date_end: date,
                    assitForm: autItemParam
                },
                linkInAccountName: accountName
            }
        } else {
            option = {
                initSearchValue: {
                    accountCode: accountCode,
                    date_start: date,
                    date_end: date
                },
                linkInAccountName: accountName
            }
        }

        return option
    }

    isEmptyAuxItem(auxItem) {
        let ret = false

        if (!auxItem.get('customer') &&
            !auxItem.get('supplier') &&
            !auxItem.get('project') &&
            !auxItem.get('department') &&
            !auxItem.get('person') &&
            !auxItem.get('inventory') &&
            !auxItem.get('exCalc1') &&
            !auxItem.get('exCalc2') &&
            !auxItem.get('exCalc3') &&
            !auxItem.get('exCalc4') &&
            !auxItem.get('exCalc5') &&
            !auxItem.get('exCalc6') &&
            !auxItem.get('exCalc7') &&
            !auxItem.get('exCalc8') &&
            !auxItem.get('exCalc9') &&
            !auxItem.get('exCalc10')) {

            ret = true
        }

        return ret
    }

    getDisplayErrorMSg(errorMsg) {
        return <div style={{ display: 'inline-table' }}>
            {
                errorMsg.map((item, index) => <div>{(index + 1) + '.' + item}<br /></div>)
            }
        </div>
    }

}
