import React from 'react'
import { fromJS } from 'immutable'
import { action as MetaAction } from 'edf-meta-engine'
import { FormDecorator, Icon } from 'edf-component'
import config from './config'
import { consts } from 'edf-consts'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init', component.props)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.metaAction.sf(`data.other.loading`, true)
        this.load()
    }
    componentDidMount = () => {
        this.onResize()
        // this.showPickerDidMount()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
        } else {
            win.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
            window.removeEventListener('enlargeClick', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onTabFocus', this.onTabFocus)
            window.detachEvent('enlargeClick', () => this.onResize({}))
        } else {
            window.onresize = undefined
        }
    }
    onResize = (type) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                let dom = document.getElementsByClassName('app-balancesheet-formula-businessActiveTable')[0]
                if (!dom) {
                    if (type) {
                        return
                    }
                    setTimeout(() => {
                        this.onResize()
                    }, 20)
                } else {
                    let tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
                    let num = dom.offsetHeight - tableDom.offsetHeight
                    let tableOption = this.metaAction.gf('data.tableOption').toJS()
                    if (num < 45) {
                        const width = dom.offsetWidth
                        const height = dom.offsetHeight
                        this.injections.reduce('setTableOption', { ...tableOption, y: height - 39, containerWidth: width - 200 })
                    } else {
                        delete tableOption.y
                        this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                    }

                }
            }
        }, 100)
    }
    getTableScroll = () => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let dom = document.getElementsByClassName('app-balancesheet-formula-businessActiveTable')[0]
            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num < 45) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    this.injections.reduce('setTableOption', { ...tableOption, y: height - 39, containerWidth: width - 200 })
                } else {
                    delete tableOption.y
                    this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }
    //初始化接口调用
    load = async (data) => {
        let period = this.component.props.initData && this.component.props.initData.period
        let accountList = await this.webapi.taxFormula.querygetAccountList()
        let response = await this.webapi.taxFormula.query({ year: period.split('-')[0], month: period.split('-')[1] })
        this.metaAction.sfs({
            'data.list': fromJS(response),
            'data.accountList': fromJS(accountList),
            'data.other.loading': false
        })
    }

    getActiveTBColumns = () => {
        return [
            {
                title: '科目',
                dataIndex: 'accountCodeAndName',
                width: '30%',
                key: 'accountCodeAndName'
            }, {
                title: '运算符号',
                dataIndex: 'operationSign',
                align: 'center',
                width: '10%',
                key: 'operationSign',
                render: (text, record, index) => this.renderSpan(text, record, index, 'operationSign')
            }, {
                title: '取数规则',
                dataIndex: 'balanceRule',
                align: 'center',
                width: '15%',
                key: 'balanceRule',
                render: (text, record, index) => this.renderSpan(text, record, index, 'balanceRule')
            },
            {
                title: '金额',
                dataIndex: 'currentAmount',
                width: '10%',
                className: 'amountColumnStyle',
                key: 'currentAmount'
            },{
                title: '操作',
                dataIndex: 'operation',
                width: '10%',
                align: 'center',
                // fixed: 'right',
                key: 'operation',
                render: (text, record, index) => this.operate(text, record, index, this)
            }
        ]
    }
    renderSpan = (text, record, index, columnName) => {
        if(columnName == 'operationSign'){
            return (
                <div>{text == 1?"+":"-"}</div>
            )
        }else if(columnName == 'balanceRule'){
            return (
                <div>{text == 1?"本期贷方发生额":text == 0?"本期借方发生额":"余额"}</div>
            )
        }
    }
    operate = (text, record, index, _this) => {
        let listSize = this.metaAction.gf('data.list').size
            return {
                children: (
                    <div style={{ width: '100%', display: 'block' }}>
                        <Icon type="shanchu" fontFamily='edficon' style={{ 'fontSize': '22px', 'marginTop': '6px' }} onClick={() => this.delRowClick(index, record)} />
                    </div>
                )
            }
    }

    //选择符号
    selectFlagData = (value, option) => {
        this.voucherAction.fieldChange(`data.flag`, JSON.parse(value), this.check)
        this.metaAction.sf(`data.flag`, JSON.parse(value))

    }

    //选择取数规则
    selectFormulaIdForPageData = (value, option) => {
        this.voucherAction.fieldChange(`data.formulaIdForPage`, JSON.parse(value), this.check)
        this.metaAction.sf(`data.formulaIdForPage`, JSON.parse(value))
    }

    //过滤科目下拉列表数据
    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    //选择科目
    accountlistChange = (value, noSend, showOption) => {
        const accountList = this.metaAction.gf('data.accountList').toJS()
        const item = accountList.find(index => {
            return index.value == value
        })
        this.voucherAction.fieldChange(`data.codeAndName`, value, this.check)
        this.metaAction.sf('data.codeAndName', value)

    }

    //获取表格行数
    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size
    }

    isDisplay = () => {
        let accountingStandards = this.metaAction.gf('data.accountingStandards'),
            type = this.metaAction.gf('data.type'), _display = false

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization &&
            type == 2) {
            _display = true
        }

        return _display
    }

    //加行
    addRowClick = async () => {//添加公式
        let isOK = await this.getParams('add')
        if(!isOK){
            return
        }
        let row = {},
            period = this.component.props.initData && this.component.props.initData.period,
            codeAndName = this.metaAction.gf(`data.codeAndName`),
            flag = this.metaAction.gf(`data.flag`),
            formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`),
            list = this.metaAction.gf(`data.list`) ? this.metaAction.gf(`data.list`).toJS() : [],
            param = {
                expressionDto: 
                    {
                        year: period.split('-')[0],
                        month: period.split('-')[1],
                        accountId: codeAndName && JSON.parse(codeAndName).id,
                        operationSign: flag.id,
                        balanceRule: formulaIdForPage.id
                    }
                
            }
        
        this.metaAction.sf(`data.other.loading`, true)
        let response = await this.webapi.taxFormula.getSupertaxExpressionItem(param)
        this.metaAction.sf(`data.other.loading`, false)

        if (response) {
            let codeAndName = this.metaAction.gf(`data.codeAndName`),
                flag = this.metaAction.gf(`data.flag`),
                formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`),
                accountingStandards = this.metaAction.gf('data.accountingStandards')
            list.splice(list.length , 0, response)
           let fieldValue = {
                'data.list': fromJS(list),
                'data.editState': true,
                'data.codeAndName': undefined,
                'data.flag': undefined,
                'data.formulaIdForPage': undefined,
                'data.other.error': fromJS({}),
                'data.isReset': true,
                'data.other.scrollY': scrollY
            }
            this.injections.reduce('load', fieldValue)
        }
        setTimeout(()=>{
            this.onResize()
        }, 20)
    }

    //删除行
    delRowClick = (rowIndex, obj) => {//删除不调接口
        console.log(rowIndex)
        let list = this.metaAction.gf(`data.list`) ? this.metaAction.gf(`data.list`).toJS() : [],
            type = this.metaAction.gf(`data.type`)
        list.splice(rowIndex.rowIndex ? rowIndex.rowIndex : rowIndex, 1)
        this.metaAction.sfs({
            'data.list': fromJS(list),
            'data.editState': true,
            'data.isReset': true
        })
    }

    //去除千分位
    clearThousandsPosition = (num) => {
        if (num && num.toString().indexOf(',') > -1) {
            let x = num.toString().split(',')
            return parseFloat(x.join(""))
        } else {
            return num
        }
    }

    //添加千分位
    addThousandsPosition = (input, isFixed) => {
        if (isNaN(input)) return ''
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

        return num.replace(regex, "$1,")
    }

    //点击确定按钮
    onOk = async () => {
        let editState = this.metaAction.gf(`data.editState`)
        if (editState) {
            return await this.save()
        } else {
            return true
        }
    }

    //保存报表公式
    save = async () => {
        let type = this.metaAction.gf(`data.type`),
            // params = await this.getParams('save'),//获取参数
            response,
            period = this.component.props.initData && this.component.props.initData.period,
            codeAndName = this.metaAction.gf(`data.codeAndName`),
            flag = this.metaAction.gf(`data.flag`),
            formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`),
            list = this.metaAction.gf('data.list'),
            param = {
                year: period.split('-')[0],
                month: period.split('-')[1],
                dtoList: []
            }
            list.map(item => {
                param.dtoList.push({
                    accountId: item.get('accountId'),
                    operationSign: item.get('operationSign'),
                    balanceRule: item.get('balanceRule')
                })
            })
        this.metaAction.sf(`data.other.loading`, true)
        response = await this.webapi.taxFormula.save(param)
        this.metaAction.sf(`data.other.loading`, false)

        if (response) {
            return true
        } else {
            return false
        }
    }

    onTabFocus = (data) => {
        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.initSearchValue)
    }

    //重置
    resetClick = async () => {
        let ret = await this.metaAction.modal('confirm', {
            title: '重置提示',
            content: '重置后将恢复系统默认运算规则，是否确认重置？',
            okText: '是',
            cancelText: '否'
        })
        if (ret) {//点击重置
            let period = this.component.props.initData && this.component.props.initData.period
            let response = await this.webapi.taxFormula.reset({year: period.split('-')[0], month: period.split('-')[1]})
            if (!response) return
            this.metaAction.toast('success', '重置成功')
            this.metaAction.sfs({
                'data.codeAndName': undefined,
                'data.flag': undefined,
                'data.formulaIdForPage': undefined,
                'data.other.error': fromJS({}),
                'data.editState': true,
                'data.isReset': false,
                'data.list': fromJS(response)
            })
        }
    }

    //必填项校验
    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return
        let r = { ...fieldPathAndValues },
            path = r.path,
            other = this.metaAction.gf('data.other').toJS(),
            message = `${other[path.slice(11)]}不能为空`
        if (fieldPathAndValues.path == 'data.codeAndName') {
            return { errorPath: 'data.other.error.subject', message: fieldPathAndValues.value ? '' : '科目不能为空' }
        } else if (fieldPathAndValues.path == 'data.flag') {
            return { errorPath: 'data.other.error.symbol', message: fieldPathAndValues.value ? '' : '运算符号不能为空' }
        } else if (fieldPathAndValues.path == 'data.formulaIdForPage') {
            return { errorPath: 'data.other.error.rule', message: fieldPathAndValues.value ? '' : '取数规则不能为空' }
        }
    }

    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check)
    }

    //获取参数
    getParams = async (funType) => {//获取参数，funtype是哪个方法的参数
        
        if (funType == 'add') {
            let codeAndName = this.metaAction.gf(`data.codeAndName`),
                flag = this.metaAction.gf(`data.flag`),
                formulaIdForPage = this.metaAction.gf(`data.formulaIdForPage`)
            // if (type == 1) {
                if (codeAndName === undefined || flag === undefined || formulaIdForPage === undefined) {
                    let checkArr = []
                    checkArr.push({
                        path: 'data.codeAndName',
                        value: codeAndName
                    })
                    checkArr.push({
                        path: 'data.flag',
                        value: flag
                    })
                    checkArr.push({
                        path: 'data.formulaIdForPage',
                        value: formulaIdForPage
                    })
                    const ok = await this.voucherAction.check(checkArr, this.check)
                    if (!ok) {
                        this.metaAction.toast('warning', '请补充数据')
                        return false
                    }
                } else {
                    // let list = this.metaAction.gf(`data.list`) ? this.metaAction.gf(`data.list`).toJS() : [],
                    //     checkResult = false//通过
                    // list.map(item => {//校验是否已经存在相同科目的公式
                    //     if (item.accountId == JSON.parse(codeAndName).value && item.formulaIdForPage == formulaIdForPage.id) {
                    //         checkResult = true//未通过
                    //     }
                    // })
                    // if (checkResult) {
                    //     this.metaAction.toast('warning', '已经存在相同科目和取数规则的公式')
                    //     return false
                    // }
                    // params.glReportTemplateProjectItemList.push({
                    //     accountId: JSON.parse(codeAndName).value,
                    //     formulaIdForPage: formulaIdForPage.id,
                    //     flag: flag.name
                    // })
                    // return params
                    return true
                }
            // } 
        } else if (funType == 'save') {
            let list = this.metaAction.gf(`data.list`) ? this.metaAction.gf(`data.list`).toJS() : []
            params.glReportTemplateProjectItemList = []
            if (type == 1) {
                if (list.length < 1) {
                    return false
                } else {
                    list.map((item, index) => {
                        if (index < list.length - 1) {

                            params.glReportTemplateProjectItemList.push({
                                accountId: item.accountId,
                                formulaIdForPage: item.formulaIdForPage,
                                flag: item.flag
                            })
                        }
                    })
                    return params
                }
            } else {
                if (list.length < 1) {
                    return false
                } else {
                    list.map((item, index) => {
                        if (index < list.length - 1) {

                            params.glReportTemplateProjectItemList.push({
                                accountId: item.accountId,
                                formulaIdForPage: item.formulaIdForPage,
                                flag: '+'
                            })
                        }
                    })
                    return params
                }
            }
        }
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
