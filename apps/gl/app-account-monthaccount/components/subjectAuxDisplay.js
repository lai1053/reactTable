import React, { Component } from 'react'
import classNames from 'classnames'
import { Map, fromJS } from 'immutable'
import { Popover, Button } from 'antd'
import { AppLoader } from 'edf-meta-engine'
import isEqual from 'lodash.isequal'
import utils from 'edf-utils'
import PropTypes from 'prop-types'

export default class SubjectAuxDisplay extends Component {
    constructor(props) {
        super(props)
        this.state = this.computeState(this.props)
    }
    state = {
        isAuxNotFilled: false,
        data: Map({
            value: null,
            style: null,
            className: null,
            align: null,
            inventoryAccountisCalc: false,
            incomeAccountisCalc: false,
            costAccountisCalc: false,
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

    componentWillReceiveProps(nextProps) {
        this.setState(this.computeState(nextProps))
    }

    shouldComponentUpdate(nextProps, nextState) {
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
        let { style, className, align, value, path, colName } = props
        let curIndex = path.split(',')[1],
            curDetails = this.props.gf('data.list').get(curIndex),
            accountLists = this.props.gf('data.other.accountList'),
            calcDict = this.props.gf('data.other.calcDict')
        let codeAndName = curDetails.get(`${colName}ShowName`),
            id = curDetails.get(`${colName}Id`),
            isCalc = curDetails.get(`${colName}isCalc`),
            accountingSubject = fromJS({})
        if (isCalc) {
            accountingSubject = accountLists.filter(x => x.get('id') == id).first()
            accountingSubject = accountingSubject.set('calcDict', Map(calcDict))
        }
        data = data.set('value', codeAndName)
        data = data.set('style', style)
        data = data.set('className', className)
        data = data.set('align', align)
        data = data.set('path', path)
        data = data.set('accountingSubject', accountingSubject)
        data = data.set('calcDict', calcDict)
        data = data.set('rowIndex', curIndex)
        data = data.set(`${colName}isCalc`, isCalc)
        console.log("prop属性是什么" + props)
        this.oldAccountingSubject = accountingSubject
        return { data, isAuxNotFilled: (!!accountingSubject && (typeof accountingSubject == 'object') && isCalc) }
        //return { data, 
        //isAuxNotFilled: (!!accountingSubject && (typeof accountingSubject == 'object') && (!!accountingSubject.get('isCalc')) && !accountingSubject.get('auxAccountSubjects')) }
    }

    getPopupContainer() {
        return document.querySelector('.ttk-gl-app-accountrelationsset')
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

    handleCancelClick() {        
        this.setState({ data: this.state.data, isAuxNotFilled: false })
        this.props.onEvent && this.props.onEvent('cancel', { path: this.props.path })
        localStorage.removeItem('auxAccountSubjects')
    }

    handleConfirmClick() {                
        this.setState({ data: this.state.data, isAuxNotFilled: false })
        let auxAccountSubjects = JSON.parse(localStorage.getItem('auxAccountSubjects')),
            colName = this.props.colName
        this.props.onEvent && this.props.onEvent('confirm', { path: this.props.path, colType: colName, data: fromJS({ ...auxAccountSubjects }) })
        localStorage.removeItem('auxAccountSubjects')
    }

    getDisplayErrorMSg(errorMsg) {
        return <div style={{ display: 'inline-table' }}>
            {
                errorMsg.map((item, index) => <div>{(index + 1) + '.' + item}<br /></div>)
            }
        </div>
    }

    checkAuxItemEmpty(auxAccountSubjects) {
        let accountingSubject = this.state.data.get('accountingSubject'),
            errorMessage = []

        if (!!accountingSubject.get('isCalcCustomer') &&
            !auxAccountSubjects) {
            errorMessage.push('客户不能为空')
        }
        if (!!accountingSubject.get('isCalcSupplier') &&
            !auxAccountSubjects) {
            errorMessage.push('供应商不能为空')
        }
        if (!!accountingSubject.get('isCalcProject') &&
            !auxAccountSubjects == null) {
            errorMessage.push('项目不能为空')
        }
        if (!!accountingSubject.get('isCalcDepartment') &&
            !auxAccountSubjects) {
            errorMessage.push('部门不能为空')
        }
        if (!!accountingSubject.get('isCalcPerson') &&
            !auxAccountSubjects) {
            errorMessage.push('人员不能为空')
        }
        if (!!accountingSubject.get('isCalcInventory') &&
            !auxAccountSubjects) {
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
    //填写辅助核算的界面
    getEditAuxAccountContent() {
        let appName = 'ttk-gl-app-auxassistitem',
            accountingSubject = this.state.data.get('accountingSubject'),
            refName = 'auxAccountSubjects' + Math.random(),
            app = <AppLoader
                name={appName}
                ref={refName}
                initData={accountingSubject}
                setPortalContent={this.props.setPortalContent}
                onWriteBackAuxItem={this.onWriteBackAuxItem} />

        let handleOK = () => {            
            let auxAccountSubjects = this.state.auxAccountSubjects || JSON.parse(localStorage.getItem('auxAccountSubjects')),
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
        return (
            <div id='assistDiv' style={{ width: '405px', padding: '13px', paddingLeft: '0px', paddingBottom: '0px', 'z-index': 99999999999, overflow: 'hidden', height: height }}>
                {app}
                <div style={{ width: '405px', 'padding-top': '10px', textAlign: 'center' }}>
                    <Button type="ghost"
                        onClick={::this.handleCancelClick}
                        id="auxItemCancel"
                        style={{ fontSize: '12px' }}>取消</Button>
                    <Button id='auxItemConfirm'
                        type="primary"
                        style={{ marginLeft: '10px', fontSize: '12px' }}
                        onClick={handleOK}>确定</Button>
                </div>
            </div >
        )
    }


    openAuxItem = () => {
        let data = this.state.data,
            rowIndex = data.get('rowIndex')
        this.props.updateAuxItem(rowIndex)
    }

    getSubjectWithAuxName() {
        let accountingSubject = this.state.data.get('accountingSubject')

        if (!accountingSubject || (typeof accountingSubject != 'object')) return ''

        let subjectWithAuxName = '',
            auxAccountSubjects = accountingSubject.get('auxAccountSubjects') || fromJS(JSON.parse(localStorage.getItem('auxAccountSubjects')))

        if (accountingSubject.get('isCalcCustomer') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }
        if (accountingSubject.get('isCalcSupplier') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }
        if (accountingSubject.get('isCalcProject') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }
        if (accountingSubject.get('isCalcDepartment') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }
        if (accountingSubject.get('isCalcPerson') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }
        if (accountingSubject.get('isCalcInventory') && auxAccountSubjects && auxAccountSubjects.get('name')) {
            subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('name')
        }

        //自定义档案
        let calcDict = this.props.gf('data.other.calcDict'),
            userDefineItemName
        for (var j = 1; j <= 10; j++) {
            if (accountingSubject.get(`isExCalc${j}`) && auxAccountSubjects &&  auxAccountSubjects.get(`exCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`).get('name')) {
                subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get(`exCalc${j}`).get('name')
            }
        }

        return subjectWithAuxName

    }
    render() {        
        let data = this.state.data,
            // value = data.get('value'),
            style = data.get('style'),
            align = data.get('align'),
            className = data.get('className'),
            cls = classNames({
                'mk-datagrid-cellContent': true,
                [`mk-datagrid-cellContent-${align}`]: !!align,
                [className]: !!className
            }),
            subjectAndAuxName, id,
            isCalc = false
        let { colName, curRowIndex, value } = this.props

        let accountingSubject = data.get('accountingSubject')
        isCalc = data.get(`${colName}isCalc`)


        let innerStyle = {
            ...style,
            'flex-direction': 'column',
            'text-align': 'left',
            'padding-top': '5px',
            'font-size': '12px'
        }
        let subjectCodeAndName = value,
            subjectWithAuxName = this.getSubjectWithAuxName(subjectCodeAndName) || '',
            content = this.getEditAuxAccountContent()

        subjectAndAuxName = (subjectCodeAndName ? subjectCodeAndName : '') + subjectWithAuxName

        if (this.state.isAuxNotFilled && accountingSubject) {
            return (
                <Popover content={content}
                    getPopupContainer={:: this.getPopupContainer}
                    zIndex='990'
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
                </Popover>
            )
        }
        let auxBtnStyle
        if (isCalc && this.get('auditStatus') != 1000020002) {
            auxBtnStyle = { width: '14px', display: 'inline-block', lineHeight: '14px', 'font-size': '12px', right: '5px', 'z-index': '9', position: 'absolute' }
        } else {
            auxBtnStyle = { display: 'none' }
        }
        return (
            <div className={cls}>
                <div style={{ width: '100%', color: '#333333' }} title={subjectAndAuxName}>{subjectAndAuxName}</div>
                <a
                    // onClick={: :this.openAuxItem} 
                    className="linkApp" style={auxBtnStyle}>辅助项</a>
            </div >
        )
    }
}