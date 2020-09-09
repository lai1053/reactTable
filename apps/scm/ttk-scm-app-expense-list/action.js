import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { TableOperate2, Select, Button, Modal, Icon, PrintOption, FormDecorator, Checkbox, Cascader, DatePicker, Input } from 'edf-component'

import utils from 'edf-utils'
import moment from 'moment'
import config from './config'
const Option = Select.Option
import { consts } from 'edf-consts'
//import table from '../../../component/components/table/table'
import Settlement from './components/settlement'
import ChooseDateComponent from './components/ChooseDateComponent'
import { fromJS } from 'immutable';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    //初始化数据
    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        this.changeSipmleDate = false
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init');

        this.load()
    }

    //获取到页签焦点时调用
    onTabFocus = async (params) => {
        let loading = this.metaAction.gf('data.loading'),
            page = this.metaAction.gf('data.pagination').toJS(),
            orders = this.metaAction.gf('data.orders').toJS(),
            search = this.metaAction.gf('data.searchValue').toJS()

        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }

        params = {
            page: search.page,
            orders,
            beginDate: search.period,
            endDate: search.period,
            isInit: true
        }
        const response = await this.webapi.expenseList.init(params)
        if (response) {
            // this.injections.reduce('tableLoading', false)
            this.metaAction.sfs({
                'data.loading': false,
                'data.other.businessTypes': fromJS(response.businessTypes),
                'data.other.expenseInitDto': fromJS(response.expenseInitDto)
            })
        }
        // this.sortParmas()
    }

    //导入票税宝报销单
    handleExportList = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg")

        const ret = await this.metaAction.modal('show', {
            title: '选择导入月份',
            width: 400,
            okText: '确定',
            bodyStyle: { padding: '8px 24px' },
            children: <ChooseDateComponent
                webapi={this.webapi}
                defaultVale={
                    {
                        dateString: currentOrg.periodDate || null,
                        date: currentOrg.periodDate ? moment(currentOrg.periodDate) : null
                    }
                }
            />
        })
        if (ret) {
            this.metaAction.toast('success', '导入成功')
            this.refresh()
        }

    }

    handleOpenAccount = async () => {
        let url = await this.webapi.expenseList.getPsbBindUrl();
        if (url) {
            const ret = await this.metaAction.modal('show', {
                title: '温馨提示',
                width: 996,
                //okText: '保存',
                wrapClassName: 'openAccountiframe',
                // bodyStyle: { padding: 24, fontSize: 12 },
                children: this.metaAction.loadApp('ttk-edf-app-iframe', {
                    store: this.component.props.store,
                    iframeHeight: 300,
                    src: url
                    //src: 'http://test.mypsb.cn/api/web19/billcenter/index.html#/inviteOpen?registerUrl=http%3A%2F%2Ftest.mypsb.cn%2Fukyyfx&registerQrcode=http%3A%2F%2Ftest.mypsb.cn%2Fapi%2FFiles%2FRegisterEnterpriseQrCode%2F20190425%2FSXK3RNFXF5PS%2Fff671944f2bc4d748957e7bce1dc821e.png'
                })
            })
        } else {
            //已绑定
            await this.handleExportList();

        }


    }



    load = () => {
        this.sortParmas(null, null, null, 'init')
    }

    refresh = () => {
        this.sortParmas()
    }

    keyDown = (e) => {
        // console.log(document.activeElement)
        if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
            this.nextAutofocus()
        } else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) { //保存
            let list = this.metaAction.gf('data.list').toJS(), editArr = [], editHeaderArr = []
            editArr = list.filter(item => item.isEdit)

            if (!editArr.length) {
                this.metaAction.toast('warning', '没有可保存的单据')
                return
            }
            editHeaderArr = list.filter(item => item.id == editArr[0].pid)
            this.saveExpense(null, editHeaderArr[0])
            if (e.preventDefault) {
                e.preventDefault()
            }
            if (e.stopPropagation) {
                e.stopPropagation()
            }
        }

    }

    nextAutofocus = (ele) => {
        let dom = document.activeElement
        if (ele) {
            dom = ele
        } else {
            if (!dom) {
                return
            }
            if (dom.className && !dom.className.includes('keydown_auto_focus')) {
                dom = $(document.activeElement).parents('.keydown_auto_focus')[0]
            }
        }
        let flag
        const arr = $('.keydown_auto_focus')
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == dom) {
                flag = i
            }
        }
        if (flag >= 0) {
            setTimeout(() => {
                let c = $('.keydown_auto_focus')[flag + 1]
                if (c) {
                    if ($(c).find('input').length > 0) {
                        c = $(c).find('input')[0]
                    }
                    c.focus()
                    c.click()
                }
            }, 10)
        }
    }

    componentDidMount = () => {
        this.onResize()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
            document.addEventListener('keydown', this.keyDown, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
            document.attachEvent('keydown', this.keyDown)
        } else {
            win.onresize = this.onResize
        }
    }


    getTableScroll = (scrollBottom) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let dom = document.getElementsByClassName('ttk-scm-app-expense-list-Body')[0]
            let tableDom
            if (!dom) {
                return
            }
            if (tableOption.y) {
                tableDom = dom.getElementsByClassName('ant-table-tbody')[0]
            } else {
                tableDom = dom.getElementsByClassName('ant-table-tbody')[0]
            }
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num > 39 && tableOption.y) {
                    delete tableOption.y
                    this.injections.reduce('update', {
                        path: 'data.tableOption',
                        value: tableOption
                    })
                } else if (num < 39) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        y: height - 39,
                        containerWidth: width - 20
                    })
                }
            }
            if (scrollBottom) {
                setTimeout(() => {
                    this.scrollToBottom()
                }, 200)
            }
        } catch (err) {
            console.log(err)
        }
    }

    onResize = (type) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        const tableOption = this.metaAction.gf('data.tableOption').toJS()
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                let dom = document.getElementsByClassName('ttk-scm-app-expense-list-Body')[0]
                if (!dom) {
                    if (type) {
                        return
                    }
                    setTimeout(() => {
                        this.onResize()
                    }, 20)
                } else {
                    this.getTableScroll()
                }
            }
        }, 100)
    }

    scrollToBottom = () => {
        try {
            const arr = document.querySelectorAll('.ttk-scm-app-expense-list .ant-table-body tr')
            if (!arr) {
                return
            }
            arr[arr.length - 1].scrollIntoView()
        } catch (err) {
            console.log(err)
        }

    }

    //月份查询控制
    disabledMonth = (current) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let enableTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
        return current && current < moment(enableTime)
    }

    //新增费用单
    addClick = () => {
        let list = this.metaAction.gf('data.list').toJS()
        if (this.getListIsEdit()) return

        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            expenseInitDto = this.metaAction.gf('data.other.expenseInitDto'),
            businessDate = utils.moment.momentToString(moment(searchValue.period).endOf('month'), 'YYYY-MM-DD'),
            defaultBankAccount

        businessDate = utils.date.transformMomentDate(businessDate)
        expenseInitDto = expenseInitDto ? expenseInitDto.toJS() : undefined
        //结算默认显示现金
        if (expenseInitDto.bankAccounts && expenseInitDto.bankAccounts.length) {
            let bankAccounts = expenseInitDto.bankAccounts
            bankAccounts = bankAccounts.filter(item => item.code == 'XJ')
            if (bankAccounts && bankAccounts.length) defaultBankAccount = [{
                bankAccountId: bankAccounts[0].id,
                bankAccountName: bankAccounts[0].name,
                "personId": '',
                "supplierId": '',
                "customerId": ''
            }]
        }
        list = list.concat({
            isTitle: true,
            id: 1,
            seq: list.length ? Number(list[list.length - 1].seq) + 1 : 1,
            isNew: true,
            settles: defaultBankAccount
        }, {
                pid: 1,
                seq: list.length ? Number(list[list.length - 1].seq) + 1 : 1,
                isNew: true,
                isEdit: true,
                businessDate: businessDate
            })
        this.injections.reduce('update', { path: 'data.list', value: list })

        setTimeout(() => {
            let c = $('.keydown_auto_focus')[0]
            if (c) {
                if ($(c).find('input').length > 0) {
                    c = $(c).find('input')[0]
                }
                c.focus()
            }
        }, 10)

        setTimeout(() => {
            this.getTableScroll(true)
        }, 100)
    }

    //更多
    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }

    //科目设置
    subjectManage = async () => {
        if (this.getListIsEdit()) return
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=expense', { accessType: 'cost' })
    }

    // 凭证习惯
    voucherHabit = async () => {
        if (this.getListIsEdit()) return
        const ret = await this.metaAction.modal('show', {
            title: '凭证习惯设置',
            width: 480,
            okText: '确定',
            bodyStyle: { padding: '8px 24px' },
            children: this.metaAction.loadApp('ttk-scm-voucherHabit-card', {
                store: this.component.props.store,
                type: 'expense',
            }),
        })
        if (ret) this.metaAction.toast('success', '设置成功')
    }

    //生成凭证
    addVoucher = async () => {
        if (this.getListIsEdit()) return
        const selectedOption = this.getNewData()
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要生成凭证的数据')
            return
        }
        let flag = false
        let data = []
        selectedOption.map(item => {
            if (item.status != consts.VOUCHERSTATUS_Approved) {
                flag = true
            }
            if (item.ts) {
                data.push({
                    id: item.id,
                    ts: item.ts,
                    seq: item.seq
                })
            }
        })
        if (!flag) {
            return this.metaAction.toast('warn', '当前没有可生成凭证数据')
        }
        let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
        if (!isAuditEdit) return
        this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true);
        }
        const res = await this.webapi.expenseList.auditBatch(this.delRepeat(data, 'id'))
        this.injections.reduce('tableLoading', false);
        this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
        if (res) {
            if (res.fail && res.fail.length) {
                this.showError('生成凭证结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '生成凭证成功')
            }
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }

    //删除凭证
    delVoucher = async () => {
        if (this.getListIsEdit()) return
        const selectedOption = this.getNewData()
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要删除凭证的数据')
            return
        }
        let flag = false
        let data = []
        selectedOption.map(item => {
            if (item.status == consts.VOUCHERSTATUS_Approved) {
                flag = true
            }
            if (item.ts) {
                data.push({
                    id: item.id,
                    ts: item.ts
                })
            }
        })
        if (!flag) {
            return this.metaAction.toast('warn', '当前没有删除凭证的数据')
        }

        let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
        if (!isAuditEdit) return
        this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true);
        }
        const res = await this.webapi.expenseList.unauditBatch(this.delRepeat(data, 'id'))
        this.injections.reduce('tableLoading', false);
        this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
        if (res) {
            if (res.fail && res.fail.length) {
                this.showError('删除凭证结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '删除凭证成功')
            }
        }

        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }

    showError = (title, successArr, failArr) => {
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            // footer: null,
            bodyStyle: { padding: '2px 0 10px 11px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    getNewData = () => {
        const checkboxValue = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS()
        return checkboxValue
    }

    //批量删除费用单
    delBatchClick = async () => {
        let flag = false
        if (this.getListIsEdit()) return

        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要删除的数据')
            return
        }

        selectedOption.map(item => {
            if (item.status != consts.VOUCHERSTATUS_Approved) {
                flag = true
                return
            }
        })

        if (!flag) {
            this.metaAction.toast('error', '费用单已生成凭证，不可删除')
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除费用单',
            content: '确定删除所选费用单？'
        })
        if (!ret) {
            return
        }
        let data = []
        selectedOption.map(item => {
            if (item.ts) {
                data.push({
                    id: item.id,
                    ts: item.ts
                })
            }
        })
        data = this.delRepeat(data, 'id');
        const res = await this.webapi.expenseList.deleteBatch(data)

        if (res) {
            this.metaAction.toast('success', '删除成功')
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.sortParmas()
    }

    /*********--region start--*********** */
    //渲染列
    renderColumns = () => {
        const columns = this.metaAction.gf('data.other.columnDto').toJS() //header
        const arr = [];
        columns.forEach(data => {
            if (data.isVisible) {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: this.getColumnsWidth(data.fieldName, columns),
                    render: (text, record, index) => {
                        if (record.isTitle) {
                            if (data.fieldName == 'seq') {
                                return this.renderRowSpan(text, record, index)
                            } else if (data.fieldName == 'businessTypeName') {
                                return this.titleTdRender(text, record, index, data.fieldName, columns)
                            } else {
                                return this.renderContent(text)
                            }
                        } else {
                            if (data.fieldName == 'seq') {
                                return this.renderContent(text)
                            } else {
                                return this.normalTdRender(text, record, index, data.fieldName)
                            }
                        }
                    }
                })
            }
        })
        //操作栏目列
        arr.push({
            title: (
                <Icon
                    name="columnset"
                    fontFamily='edficon'
                    className='ttk-scm-app-expense-columnset'
                    type="youcezhankailanmushezhi"
                    onClick={() => this.showTableSetting({ value: true })}
                />
            ),
            key: 'status',
            dataIndex: 'status',
            className: 'table_fixed_width',
            width: 87,
            render: (text, record, index) => {
                if (record.isTitle) {
                    return this.renderContent(text)
                } else {
                    return this.operateCol(text, record, index)
                }
            }
        })
        return arr
    }

    //栏目重置
    resetTableSetting = async () => {
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        const other = this.metaAction.gf('data').toJS().other
        //重置栏目
        let res = await this.webapi.expenseList.reInitByUser({ code: other.code })
        this.load()
    }

    //宽度
    getColumnsWidth = (fieldName, columns) => {
        if (fieldName == 'seq') {
            return 43
        } else if (fieldName == 'businessDate') {
            //return 117
            return 118
        } else if (fieldName == 'amount') {
            return 135
        } else if (fieldName == 'departmentName' || fieldName == 'projectName') {
            //return 168
            return '100%'
        } else if (fieldName == 'businessTypeName') {
            /*const result = columns.find(item => item.fieldName  == 'remark')
            if( result && result.isVisible ) {
                return 162
            }else{
                return
            }*/
            return '100%'
        } else if (fieldName == 'remark') {
            return '100%'
        } else {
            return 200
        }
    }

    //序号列
    renderRowSpan = (text, record, index) => {
        const num = this.calcRowSpan(record.seq, 'seq', index)
        const obj = {
            children: text,
            props: {
                rowSpan: num,
            },
        }
        return obj
    }

    //合并列
    renderContent = (text) => {
        const obj = {
            children: null,
            props: {},
        };
        obj.props.colSpan = 0;
        return obj;
    }

    //头部内容
    titleTdRender = (text, record, index, fieldName, columns) => {
        let _this = this
        let visibleColumns = columns.filter(item => item.isVisible == true)
        let list = this.metaAction.gf('data.list').toJS()
        let childArr = list.filter(item => item.pid == record.id)

        return {
            children: <div className='columns-title'>
                <div className='columns-title-item columns-title-price'>
                    <span>费用金额：</span>
                    <span className='price'>{this.renderFixedNumber(record, 'amount')}</span>
                </div>
                <div className='columns-title-item columns-title-docCode'>
                    <span>凭证字号：</span>
                    <a onClick={function () { _this.docCode(text, record, index) }}>{record.docCode ? '记-' + record.docCode : ''}</a>
                </div>
                <div className='columns-title-item columns-title-settlement'
                    style={childArr[0].isEdit ? { right: '70px' } : { right: '47px' }}>
                    <Icon type="jiesuan" fontFamily="edficon"
                        title='结算'
                        className={record.status == consts.VOUCHERSTATUS_Approved ? 'jiesuan jiesuan-icon settlement' : 'jiesuan jiesuan-icon'}
                        disabled={record.status == consts.VOUCHERSTATUS_Approved}
                        onClick={function () { record.status != consts.VOUCHERSTATUS_Approved ? _this.settlementExpense(text, record, index) : null }}
                        style={{ cursor: 'pointer', fontSize: '23px', verticalAlign: "middle" }} />
                    <a onClick={function () { record.status != consts.VOUCHERSTATUS_Approved ? _this.settlementExpense(text, record, index) : null }}
                        disabled={record.status == consts.VOUCHERSTATUS_Approved}>结算</a>
                    <span className='settlement-con' title={this.getSettles(record, true)}><i>{record.settles && record.settles.length ? '（ ' : ''}</i>{this.getSettles(record)}<i>{record.settles && record.settles.length ? ' ）' : ''}</i></span>
                </div>
                <div className='columns-title-item columns-title-icon'>
                    {childArr[0].isEdit ? <Icon type="baocun" fontFamily="edficon"
                        title='保存'
                        onClick={function () { _this.saveExpense(text, record, index) }}
                        style={{ cursor: 'pointer', fontSize: '23px', position: "relative" }} /> : null}
                    <Icon type="shanchu" fontFamily="edficon"
                        title='删除'
                        disabled={record.status == consts.VOUCHERSTATUS_Approved}
                        onClick={function () { record.status != consts.VOUCHERSTATUS_Approved ? _this.delExpense(text, record, index) : null }}
                        style={{ cursor: 'pointer', fontSize: '23px', position: "relative" }} />
                </div>
            </div>,
            props: {
                colSpan: visibleColumns.length,
            },
        };
    }

    getSettles = (record, title) => {
        if (record.settles && record.settles.length) {
            let names = [], arr = [],
                expenseInitDto = this.metaAction.gf('data.other.expenseInitDto')
            expenseInitDto = expenseInitDto ? expenseInitDto.toJS() : undefined
            let bankAccounts = expenseInitDto.bankAccounts
            //账户列表
            if (bankAccounts && bankAccounts.length) {
                if (title) {
                    let str = ''
                    record.settles.map((item, index) => {
                        let bankAccount = this.getBkName(item)
                        if (bankAccount) {
                            if (!(arr.filter(o => o == bankAccount.id)).length) {
                                arr.push(bankAccount.id)
                                if (record.settles.length == 1) {
                                    str = bankAccount.name ? str + bankAccount.name : str
                                } else {
                                    str = bankAccount.name ? str + bankAccount.name + '；' : str
                                }
                            }
                        }
                    })
                    return str
                } else {
                    return record.settles.map((item, index) => {
                        let bankAccount = this.getBkName(item)
                        if (bankAccount) {
                            if (!(arr.filter(o => o == bankAccount.id)).length) {
                                arr.push(bankAccount.id)
                                if (record.settles.length == 1) {
                                    return <a className={item.payId ? '' : 'jiesuan-item'} onClick={() => { item.payId ? this.openPayment(item) : null }}>{bankAccount.name ? bankAccount.name : ''}</a>
                                } else {
                                    return <span><a className={item.payId ? '' : 'jiesuan-item'} onClick={() => { item.payId ? this.openPayment(item) : null }}>{bankAccount.name && bankAccount.name}</a><i>{bankAccount.name ? '；' : ''}</i></span>
                                }
                            }
                        }
                    })
                }
            }
            return ''
        } else {
            return ''
        }
    }

    getBkName = (item) => {
        if (item.supplierId) {
            return { id: item.supplierId, name: item.supplierName }
        } else if (item.customerId) {
            return { id: item.customerId, name: item.customerName }
        } else if (item.personId) {
            return { id: item.personId, name: item.personName }
        } else {
            return { id: item.bankAccountId, name: item.bankAccountName }
        }
    }

    //打开对应付款单
    openPayment = (option) => {
        //console.log(option)
        if (this.getListIsEdit()) return
        if (option.payId) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '付款单',
                    'ttk-scm-app-payment-card',
                    { id: option.payId }
                );
        }
    }

    //查看凭证
    docCode = (text, record, index) => {
        if (this.getListIsEdit()) return
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: record.docId } })
    }

    //结算
    settlementExpense = async (text, record, index) => {
        //校验费用金额
        if (!record.amount) {
            this.metaAction.toast('warning', '请填写费用金额')
            return
        } else if (Number(record.amount) <= 0) {
            this.metaAction.toast('warning', '费用金额必须大于0')
            return
        }

        let expenseInitDto = this.metaAction.gf('data.other.expenseInitDto'), isEdit,
            list = this.metaAction.gf('data.list').toJS()

        expenseInitDto = expenseInitDto ? expenseInitDto.toJS() : undefined
        let editList = this.getListIsEdit(record, true)
        if (editList === true) return

        if (editList.length) isEdit = true
        console.log({ expenseInitDto, record: record, isEdit })
        if (record.settles && record.settles.length == 1 && !record.settles[0].amount) record.settles[0].amount = record.amount
        const ret = await this.metaAction.modal('show', {
            title: '结算',
            width: 700,
            bodyStyle: { padding: '6px 10px', fontSize: 12 },
            wrapClassName: 'settleClass',
            children: <Settlement
                initData={{ expenseInitDto, record: record, isEdit }}
                addRecordClick={this.addRecordClick}
                handleSettleTip={this.handleSettleTip}></Settlement>
        })

        if (ret) {
            if (ret.personList) {
                this.injections.reduce('update', { path: 'data.other.expenseInitDto.persons', value: ret.personList })
                delete ret.personList
            }
            if (ret.supplierList) {
                this.injections.reduce('update', { path: 'data.other.expenseInitDto.suppliers', value: ret.supplierList })
                delete ret.supplierList
            }
            if (isEdit) {
                list[index] = ret
                list[index].isSettles = true
                this.injections.reduce('update', { path: 'data.list', value: list })
            } else {
                const details = list.filter(o => o.pid == ret.id)
                ret.details = details
                const result = await this.webapi.expenseList.update(ret)

                if (result) {
                    this.metaAction.toast('success', '更新成功')
                    this.sortParmas()
                }
            }
        }
    }

    addRecordClick = async (name) => {
        if (name == 'person') {
            await this.voucherAction.addPerson('data.other.addSettleItem')
        } else if (name == 'supplier;customer') {
            await this.voucherAction.addSupplier('data.other.addSettleItem')
        }
        const addSettleItem = this.metaAction.gf('data.other.addSettleItem') && this.metaAction.gf('data.other.addSettleItem').toJS()
        addSettleItem && this.metaAction.sf('data.other.addSettleItem', null)
        return addSettleItem
    }
    handleSettleTip = () => {
        this.metaAction.toast('warning', '结算金额与费用金额不相等')
    }

    //保存或更新费用单
    saveExpense = async (text, record, index) => {
        let list = this.metaAction.gf('data.list').toJS(), details = []
        if (!this.checkForSave(list, record)) return false

        list = list.filter(item => {
            if (item.pid == record.id) {
                let obj = {
                    businessTypeId: item.businessTypeId,
                    amount: Number(item.amount) ? (Number(item.amount)).toFixed(2) : undefined,
                    settles: item.settles,
                    remark: '',
                    projectId: '',
                    departmentId: '',
                    accountId: item.accountId
                }
                if (item.remark) obj.remark = item.remark
                if (item.id) obj.id = item.id
                if (item.ts) obj.ts = item.ts
                if (item.projectId) obj.projectId = item.projectId
                if (item.departmentId) obj.departmentId = item.departmentId
                details.push(obj)
                return item
            }
        })
        if (record.settles && record.settles.length == 1) record.settles[0].amount = record.amount
        // if(!record.isSettles && record.isNew){
        //     record.settles[0].amount = record.amount
        // }
        else {
            //结算金额校验
            let settlesArr = record.settles, settlesAmount = 0
            settlesArr.map(item => {
                settlesAmount = settlesAmount + Number(item.amount)
            })
            if (settlesAmount != record.amount) {
                this.metaAction.toast('warning', '结算金额与费用金额不相等')
                return
            }
        }

        let option = {
            businessDate: this.metaAction.momentToString(list[0].businessDate, 'YYYY-MM-DD'),
            settles: record.settles,
            details: details,
            isReturnValue: true
        }

        option.settles.map(item => {
            if (!item.customerId) item.customerId = ''
            if (!item.customerName) item.customerName = ''
            if (!item.personId) item.personId = ''
            if (!item.personName) item.personName = ''
            if (!item.supplierId) item.supplierId = ''
            if (!item.supplierName) item.supplierName = ''
        })

        let isCanSave = this.metaAction.gf('data.other.isCanSave')
        //编辑状态
        if (record.id && !record.isNew) {
            option.id = record.id
            option.ts = record.ts

            let loading = this.metaAction.gf('data.loading')
            if (!loading) {
                this.injections.reduce('tableLoading', true);
            }
            if (!isCanSave) return
            this.injections.reduce('update', { path: 'data.other.isCanSave', value: false })
            const response = await this.webapi.expenseList.update(option)
            this.injections.reduce('tableLoading', false);
            if (response && response.result == false) {
                this.metaAction.toast('error', response.error.message)
                this.injections.reduce('update', { path: 'data.other.isCanSave', value: true })
            } else {
                this.metaAction.toast('success', '更新成功')
                this.sortParmas()
            }
            //新增状态
        } else {
            let loading = this.metaAction.gf('data.loading')
            if (!loading) {
                this.injections.reduce('tableLoading', true);
            }
            if (!isCanSave) return
            this.injections.reduce('update', { path: 'data.other.isCanSave', value: false })
            const response = await this.webapi.expenseList.create(option)
            this.injections.reduce('tableLoading', false);
            if (response && response.result == false) {
                this.metaAction.toast('error', response.error.message)
                this.injections.reduce('update', { path: 'data.other.isCanSave', value: true })
            } else {
                this.metaAction.toast('success', '保存成功')
                this.sortParmas()
            }
        }
    }

    //保存校验
    checkForSave = (details, record) => {
        let msg = []
        details = details.filter(item => item.pid == record.id)
        for (let i = 0; i < details.length; i++) {
            let str = ''
            if (!details[i].businessTypeId) {
                str = `${str} 第${i + 1}行费用类型不能为空`
            }
            if (!details[i].accountId) {
                str = `${str} 第${i + 1}行科目不能为空`
            }
            if (!details[i].amount) {
                str = `${str} 第${i + 1}行金额不能为空`
            } else if (Number(details[i].amount) <= 0) {
                str = `${str} 第${i + 1}行金额必须大于0`
            } else if (Number(details[i].amount) > 9999999999.99) {
                str = `${str} 第${i + 1}行金额不能大于9,999,999,999.99`
            }
            if (details[i].remark && details[i].remark.length > 200) {
                str = `${str} 第${i + 1}行备注不能超过200个字`
            }
            if (str) msg.push(str)
        }
        if (msg.length > 0) {
            this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
            return false
        }
        return true
    }

    getDisplayErrorMSg = (msg) => {
        return <div style={{ display: 'inline-table', textAlign: 'left' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
    }

    //删除费用单
    delExpense = async (text, record, index) => {
        //新增状态删除费用单直接删除，不需要请求接口
        if (record.isNew) {
            let list = this.metaAction.gf('data.list').toJS(), newArr = []
            list.map(item => {
                if (record.id != item.id && record.id != item.pid) {
                    newArr.push(item)
                }
            })
            this.deleteSelectOption(record)
            this.injections.reduce('update', { path: 'data.list', value: newArr })
        } else {
            let editList = this.getListIsEdit(record, true)
            if (editList === true) return
            const ret = await this.metaAction.modal('confirm', {
                title: '删除费用单',
                content: '确定删除所选费用单？'
            })
            if (!ret) return
            let option = {
                id: record.id,
                ts: record.ts,
                isReturnValue: true
            }
            const response = await this.webapi.expenseList.delete(option)
            if (response && response.result == false) {
                this.metaAction.toast('error', response.error.message)
            } else {
                this.metaAction.toast('success', '删除成功')
                this.sortParmas()
            }
        }
    }

    //操作栏目列
    operateCol = (text, record, index) => {
        let _this = this, parentNode
        let list = this.metaAction.gf('data.list').toJS()
        parentNode = list.filter(item => item.id == record.pid)

        return <span>
            <Icon type="jia" fontFamily="edficon"
                title='新增'
                disabled={parentNode[0].status == consts.VOUCHERSTATUS_Approved}
                onClick={function () { parentNode[0].status != consts.VOUCHERSTATUS_Approved ? _this.addDatials(text, record, index) : null }}
                style={{ fontSize: '23px', position: "relative", top: "2px" }} />
            <Icon type="bianji" fontFamily="edficon"
                title='编辑'
                disabled={parentNode[0].status == consts.VOUCHERSTATUS_Approved}
                onClick={function () { parentNode[0].status != consts.VOUCHERSTATUS_Approved ? _this.editDatials(text, record, index) : null }}
                style={{ fontSize: '23px', position: "relative", top: "3px" }} />
            <Icon type="shanchu" fontFamily="edficon"
                title='删除'
                disabled={parentNode[0].status == consts.VOUCHERSTATUS_Approved}
                onClick={function () { parentNode[0].status != consts.VOUCHERSTATUS_Approved ? _this.delDatials(text, record, index) : null }}
                style={{ fontSize: '23px', position: "relative", top: "2px" }} />
        </span>
    }

    //新增费用明细
    addDatials = (text, record, index) => {
        let list = this.metaAction.gf('data.list').toJS(), rowIndex

        //保存状态点击新增明细按钮会进入编辑状态，
        //若此时其他单据有编辑状态的则必须保存才能进入编辑状态
        if (!record.isEdit) {
            if (this.getListIsEdit()) return
        }
        list.map((item, index) => {
            if (item.pid == record.pid) {
                item.isEdit = true
                rowIndex = index
            }
        })
        let obj = {
            pid: record.pid,
            seq: record.seq,
            isEdit: true,
            businessDate: list[rowIndex].businessDate,
            isNew: record.isNew
        }
        if (record.departmentId) obj.departmentId = record.departmentId
        if (record.projectId) obj.projectId = record.projectId
        list.splice(rowIndex + 1, 0, obj)
        this.injections.reduce('update', { path: 'data.list', value: list })
        setTimeout(() => {
            this.getTableScroll(list.length - 2 == rowIndex ? true : false)
        }, 100)
    }

    //编辑费用明细
    editDatials = (text, record, index) => {
        let list = this.metaAction.gf('data.list').toJS()

        //保存状态点编辑明细需时，其他单据有编辑状态的则必须保存才能进入编辑状态
        if (!record.isEdit) {
            if (this.getListIsEdit()) return
        }

        list.map(item => {
            if (item.pid == record.pid) {
                item.isEdit = true
                return item
            }
        })
        this.injections.reduce('update', { path: 'data.list', value: list })
    }

    //删除费用明细
    delDatials = async (text, record, index) => {
        //编辑状态下删除不请求后台，直接删除
        if (record.isEdit) {
            let list = this.metaAction.gf('data.list').toJS()
            let editArr = list.filter(item => item.pid == record.pid)

            //删除的只剩下最后一条时，删除整个费用单
            if (editArr.length <= 1) {
                //新增状态下的编辑状态删除删除最后一条时直接删除费用单
                if (record.isNew) {
                    this.deleteSelectOption(list[index - 1])
                    list.splice(index - 1, 2)
                    this.injections.reduce('update', { path: 'data.list', value: list })
                    //保存成功以后的编辑状态删除删除最后一条时请求删除费用单接口
                } else {
                    const ret = await this.metaAction.modal('confirm', {
                        title: '删除',
                        content: '确认删除?'
                    })

                    let deleteArr = list.filter(item => item.id == record.pid)

                    if (!ret) return
                    let option = {
                        id: deleteArr[0].id,
                        ts: deleteArr[0].ts,
                        isReturnValue: true
                    }
                    const response = await this.webapi.expenseList.delete(option)
                    if (response && response.result == false) {
                        this.metaAction.toast('error', response.error.message)
                    } else {
                        this.metaAction.toast('success', '删除成功')
                        this.sortParmas()
                    }
                }
            } else {
                if (record.amount) {
                    list.map(item => {
                        if (item.id == record.pid) item.amount = Number(item.amount) - Number(record.amount)
                    })
                }
                list.splice(index, 1)
                this.injections.reduce('update', { path: 'data.list', value: list })
            }

            //保存状态下删除需请求后台删除费用单明细
        } else {
            let list = this.metaAction.gf('data.list').toJS(), response
            let expenseArr = list.filter(item => item.pid == record.pid)

            const ret = await this.metaAction.modal('confirm', {
                title: '删除',
                content: '确认删除?'
            })

            if (!ret) return
            if (expenseArr.length <= 1) {
                let deleteArr = list.filter(item => item.id == record.pid)
                if (deleteArr) record = deleteArr[0]
            }
            let option = {
                id: record.id,
                ts: record.ts,
                isReturnValue: true
            }
            if (expenseArr.length <= 1) {
                response = await this.webapi.expenseList.delete(option)
            } else {
                response = await this.webapi.expenseList.deleteDetail(option)
            }
            if (response && response.result == false) {
                this.metaAction.toast('error', response.error.message)
            } else {
                this.metaAction.toast('success', '删除成功')
                this.sortParmas()
            }
        }

        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    //新增状态删除费用单时若是新增状态且全选，需要删除选中状态
    deleteSelectOption = (record) => {
        let tableCheckbox = this.metaAction.gf('data.tableCheckbox').toJS()
        if (tableCheckbox.selectedOption.length) {
            tableCheckbox.selectedOption.map((item, index) => {
                if (item.id == record.id) {
                    tableCheckbox.selectedOption.splice(index, 1)
                    return
                }
            })
        }
        this.injections.reduce('update', { path: 'data.tableCheckbox', value: tableCheckbox })
    }

    //渲染内容
    normalTdRender = (text, record, index, fieldName) => {
        if (record.isEdit) {
            if (fieldName == 'businessDate') {
                return this.getBusinessDate(text, record, index, fieldName)
            } else if (fieldName == 'accountName' || fieldName == 'departmentName' || fieldName == 'projectName' || fieldName == 'businessTypeName') {
                return this.getDepartmentProject(text, record, index, fieldName)
            } else {
                return this.getInput(text, record, index, fieldName)
            }
        } else {
            let type
            if (fieldName == 'departmentName') {
                type = 'department'
            } else if (fieldName == 'projectName') {
                type = 'project'
            } else if (fieldName == 'businessTypeName') {
                type = 'businessType'
            }
            if (fieldName == 'businessDate') {
                return this.metaAction.momentToString(record[fieldName], 'YYYY-MM-DD')
            } else if (fieldName == 'businessTypeName' || fieldName == 'projectName' || fieldName == 'departmentName') {
                if (record[fieldName]) {
                    return <p title={record[fieldName]} className='td_ellipsis'>{record[fieldName]}</p>
                }
                return ''
            } else if (fieldName == 'amount') {
                return this.renderFixedNumber(record, fieldName)
            }
            return <p title={record[fieldName]} className='td_ellipsis'>{record[fieldName]}</p>
        }
    }

    //单据日期
    getBusinessDate = (text, record, index, fieldName) => {
        let _this = this
        return <DatePicker
            placeholder='单据日期'
            className='keydown_auto_focus auto_focus_datepicker'
            disabledDate={this.getDisabledDate}
            value={record.businessDate}
            onChange={(e) => {
                let list = this.metaAction.gf('data.list').toJS(), editArr = [], length = 0
                let flag = true
                editArr = list.filter((item, num) => {
                    if (item.isEdit && flag) {
                        length = num
                        flag = false
                    }
                })
                this.nextAutofocus($('.auto_focus_datepicker')[index - length])
                // debugger
                _this.injections.reduce('accountDateChange', { e, record, index })
            }} />
    }

    getPopupContainer2 = () => {
        return document.querySelector('.ant-table-body table')
    }

    //部门和项目
    getDepartmentProject = (text, record, index, fieldName) => {
        let _this = this
        let obj = {
            departmentName: {
                placeholder: '部门',
                type: 'department'
            },
            projectName: {
                placeholder: '项目',
                type: 'project'
            },
            businessTypeName: {
                placeholder: '收支类型',
                type: 'businessType'
            },
            accountName: {
                placeholder: '科目',
                type: 'account'
            }
        }
        let placeholder = obj[fieldName] && obj[fieldName].placeholder || '';
        let type = obj[fieldName] && obj[fieldName].type || '';

        let list = this.metaAction.gf(`data.other.${type}`).toJS(), value = ''
        list.filter(item => {
            if (item.id == record[type + 'Id']) {
                value = record[type + 'Id']
            }
        })
        if (type == 'businessType') {
            return <div style={{ width: '95%' }}>
                <Select style={{ width: '100%' }} placeholder={placeholder}
                    value={value}
                    className="keydown_auto_focus"
                    dropdownClassName='expense-businessType'
                    onChange={(value) => this.onFieldChange(index, value, type, record)}
                    optionFilterProp="children"
                    filterOption={this.filterOptionSummary}
                    //allowClear={true}
                    dropdownFooter={
                        <Button type='primary'
                            style={{ width: '100%', borderRadius: '0' }}
                            onClick={function () { _this.addArchives(record, index, type) }}>新增
                        </Button>
                    }
                >
                    {this.selectOption(type)}
                </Select>
            </div>
        } else if (type === 'account') {
            return <div style={{ width: '95%' }}>
                <Select
                    style={{ width: '100%' }}
                    placeholder={placeholder}
                    value={record.accountFocus ? record.accountId : record.accountName}
                    className="keydown_auto_focus"
                    dropdownStyle={{
                        width: '300px'
                    }}
                    dropdownMatchSelectWidth={false}
                    onChange={(value) => this.onFieldChange(index, value, type, record)}
                    optionFilterProp="children"
                    filterOption={this.filterOptionSummary}
                    onBlur={() => this.handleAccountBlur(record, index)}
                    onFocus={() => this.handleAccountFocus(record, index)}
                    //allowClear={true}
                    dropdownFooter={
                        <Button type='primary'
                            style={{ width: '100%', borderRadius: '0' }}
                            onClick={function () { _this.addArchives(record, index, type) }}>新增
                    </Button>
                    }
                >
                    {this.selectOption(type)}
                </Select>
            </div>
        } else {
            return <div style={{ width: '95%' }}>
                <Select style={{ width: '100%' }}
                    placeholder={placeholder}
                    value={value}
                    className="keydown_auto_focus"
                    onFocus={() => this.getArchList(type)}
                    onChange={(value) => this.onFieldChange(index, value, type, record)}
                    optionFilterProp="children"
                    filterOption={this.filterOptionSummary}
                    allowClear={value ? true : false}
                    dropdownFooter={
                        <Button type='primary'
                            style={{ width: '100%', borderRadius: '0' }}
                            onClick={function () { _this.addArchives(record, index, type) }}>新增
                        </Button>
                    }
                >
                    {this.selectOption(type)}
                </Select>
            </div>
        }
    }
    handleAccountBlur = (record, index) => {
        delete record.accountFocus;
        this.metaAction.sf(`data.list.${index}`, fromJS(record))
    }
    handleAccountFocus = (record, index) => {
        this.metaAction.sf(`data.list.${index}.accountFocus`, true)
    }
    //档案下拉列表展示
    selectOption = (path) => {
        //let list = this.metaAction.gf(`data.list`).toJS()
        let list = this.metaAction.gf(`data.other.${path}`).toJS()
        if (!list) return
        return list.map(item => {
            return <Option title={item.name} value={item.id}>{path === 'account' ? item.codeAndName : item.name}</Option>
        })
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    //获取相应档案列表
    getArchList = async (type) => {
        switch (type) {
            case 'department':
                await this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`)
                break;
            case 'project':
                await this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`)
                break;
        }
    }

    //档案下拉新增
    addArchives = async (record, index, type) => {
        if (type == 'businessType') {
            let result = await this.metaAction.modal('show', {
                title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
                width: 400,
                height: 500,
                footer: '',
                children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                    store: this.component.props.store,
                    columnCode: "common",
                    incomeexpensesTabId: '4001001'
                }),
            })
            if (typeof result == 'object') {
                let list = this.metaAction.gf(`data.list`).toJS(),
                    businessTypeArr = this.metaAction.gf(`data.other.businessType`).toJS()
                businessTypeArr.push(result)
                list[index][type + 'Id'] = result.id
                this.injections.reduce('update', { path: 'data.other.businessType', value: businessTypeArr })
                this.injections.reduce('update', { path: 'data.list', value: list })
            }
        } else if (type === 'account') {
            let ret = await this.metaAction.modal('show', {
                title: '新增科目',
                width: 450,
                okText: '保存',
                bodyStyle: { padding: 24, fontSize: 12 },
                children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                    store: this.component.props.store,
                    columnCode: "subjects",
                    active: 'archives'
                })
            })
            if (ret) {
                if (!ret.isEnable || !ret.isEndNode) return
                let account = await this.webapi.expenseList.accountQuery({ isEnable: true, isEndNode: true });
                this.metaAction.sf('data.other.account', fromJS(account.glAccounts));
                this.metaAction.sf(`data.list.${index}.accountId`, ret.id);
                this.metaAction.sf(`data.list.${index}.accountName`, ret.gradeName);
            }
        } else {
            let path = 'app-card-department', title = '部门', width = 400
            if (type == 'project') {
                path = 'app-card-project'
                title = '项目'
                width = 400
            }
            const ret = await this.metaAction.modal('show', {
                title: title,
                width: width,
                children: this.metaAction.loadApp(path, {
                    store: this.component.props.store
                }),
            })
            if (type != 'department') {
                if (ret && ret.isEnable) {
                    this.injections.reduce("addArchives", type, index, ret, record)
                }
            } else {
                if (ret) {
                    this.injections.reduce("addArchives", type, index, ret, record)
                }
            }
        }
    }
    //备注和金额
    getInput = (text, record, index, fieldName) => {
        let _this = this
        if (fieldName == 'amount') {
            return <Input.Number value={this.renderFixedNumber(record, fieldName)}
                className={record.amountError ? 'error amount keydown_auto_focus' : 'amount keydown_auto_focus'}
                precision={2}
                onBlur={function (e) { _this.amountChange(index, e, fieldName, record) }} />
        }
        return <Input value={record[fieldName]}
            className={record.remarkError ? 'error keydown_auto_focus' : 'keydown_auto_focus'}
            onBlur={function (e) { _this.amountChange(index, e.target.value, fieldName, record) }} />
    }

    amountChange = (index, value, type, record) => {
        if (type == 'amount' && typeof value == 'string') {
            value = Number(value.replace(',', ''))
        }
        let list = this.metaAction.gf('data.list').toJS(), parentIndex, amount = 0

        //长度校验
        if (type == 'amount') {
            if (value > 9999999999.99) {
                this.metaAction.toast('warning', '金额不能大于9,999,999,999.99，请调整')
                list[index].amountError = true
            } else {
                list[index].amountError = false
            }
        } else {
            if (value.length > 200) {
                this.metaAction.toast('warning', '备注不能超过200个字')
                list[index].remarkError = true
            } else {
                list[index].remarkError = false
            }
        }

        list[index][type] = value
        list.filter((item, index) => {
            if (item.pid == record.pid && item.amount) {
                amount = amount + Number(Number(item.amount).toFixed(2))
            }
            if (item.id == record.pid) parentIndex = index
        })
        list[parentIndex].amount = amount
        this.injections.reduce('update', { path: 'data.list', value: list })
    }

    renderFixedNumber = (record, fieldName) => {
        if (!record[fieldName]) return ''
        return utils.number.format(record[fieldName], 2)
    }

    //对齐方式
    needAlignType = (key) => {
        const right = ['amount']
        const left = ['businessTypeName', 'remark', 'departmentName', 'projectName', 'accountName']
        const center = ['seq', 'businessDate']
        let className = right.includes(key) ? 'right' : left.includes(key) ? 'left' : 'center'
        return className
    }

    //合并行的
    calcRowSpan = (text, columnKey, currentRowIndex) => {
        let tableList = this.metaAction.gf('data.list')
        if (!tableList) return
        const rowCount = tableList.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == tableList.getIn([currentRowIndex - 1, columnKey])) {
            return 0
        }

        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == tableList.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }

    //设置新的栏目状态
    combineColumnProp = (data) => {
        if (!data) return []
        let newDataArray = []
        data.forEach((ele, index) => {
            newDataArray.push({
                "isVisible": ele.isVisible,
                "id": ele.id,
                'ts': ele.ts
            })
        })
        return newDataArray
    }

    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }

    //显示栏目设置 修改后同步到服务端用户设置
    showTableSetting = async ({ value, data }) => {
        /**
         * 更新栏目设置
         */
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })

        const preData = this.metaAction.gf('data.other.columnDto')
        if (value === false) {
            //confirm 点击确定时 调用
            this.injections.reduce('update', {
                path: 'data.other.columnDto',
                value: data
            })
            const columnSolution = await this.webapi.expenseList.findByParam({ code: 'expenseList' }) //查询服务端的栏目

            if (columnSolution) {
                let aa = {}
                aa.id = columnSolution.id
                aa.columnDetails = this.combineColumnProp(data),
                    aa.ts = columnSolution.ts

                //同步到服务端 用户设置
                const columnDetail = await this.webapi.expenseList.updateWithDetail(aa)

                if (columnDetail) {
                    this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail })
                } else {
                    this.metaAction.sf('data.other.columnDto', preData)
                }
            } else {
                this.metaAction.sf('data.other.columnDto', preData)
            }
        }
        else {
            this.injections.reduce('tableSettingVisible', { value, data: data })
        }
    }

    // 处理搜索参数
    sortParmas = (search, pages, order, type, noInitDate) => {

        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if (!order) {
            order = this.metaAction.gf('data.orders').toJS()
        }
        const page = utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage']);

        if (type == 'get') {
            //获取所有参数
            return { ...search, orders: order }
        }
        if (type == 'init') {
            let currentOrg = this.metaAction.context.get("currentOrg")
            if (currentOrg.periodDate) {
                search.period = currentOrg.periodDate
            }
            //初始化数据           
            this.initData({ ...search, page, orders: order }, search.period)
        }
        else {
            //查询数据
            this.requestData({ ...search, page, orders: order })
        }

    }

    initData = async (params, period) => {
        params.isInit = true
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        params.beginDate = params.period
        params.endDate = params.period
        delete params.period
        const response = await this.webapi.expenseList.init(params)
        this.voucherAction.getDepartment({ entity: { isEnable: true } }, 'data.other.department')
        this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project')
        let account = await this.webapi.expenseList.accountQuery({ isEnable: true, isEndNode: true });
        account = account.glAccounts;
        this.metaAction.sf('data.other.account', fromJS(account))
        response.contextDate = period
        response.list.forEach(o => {
            let flag = account.find(item => item.id === o.accountId);
            if (!flag) {
                delete o.accountId
                delete o.accountName
            }
        })
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('load', { response })
        this.metaAction.sf('data.tableKey', Math.random())
        if (!this.metaAction.gf('data.other.isCanSave')) {
            this.injections.reduce('update', { path: 'data.other.isCanSave', value: true })
        }
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    requestData = async (params) => {
        params.isInit = false
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }

        params.beginDate = params.period
        params.endDate = params.period
        delete params.period
        const response = await this.webapi.expenseList.init(params)
        let account = await this.webapi.expenseList.accountQuery({ isEnable: true, isEndNode: true });
        account = account.glAccounts;
        this.metaAction.sf('data.other.account', fromJS(account))
        response.list.forEach(o => {
            let flag = account.find(item => item.id === o.accountId);
            if (!flag) {
                delete o.accountId
                delete o.accountName
            }
        })
        this.injections.reduce('tableLoading', false)
        if (response.list && response.list.length == 1) {
            this.injections.reduce('update', { path: 'data.list', value: [] })
        }
        this.injections.reduce('load', { response })
        if (!this.metaAction.gf('data.other.isCanSave')) {
            this.injections.reduce('update', { path: 'data.other.isCanSave', value: true })
        }
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    //获取费用单是否保存
    getListIsEdit = (record, ownEdit) => {
        let list = this.metaAction.gf('data.list').toJS()
        let editArr = list.filter(item => item.isEdit)

        if (ownEdit) {
            //有未保存的费用单且未保存的费用单不是是自己
            if (editArr.length) {
                if (editArr[0].pid != record.id) {
                    this.metaAction.toast('warning', '您有未保存的费用单')
                    return true
                }
                return editArr
            }
            return false
        } else {
            //有未保存的费用单
            if (editArr.length) {
                this.metaAction.toast('warning', '您有未保存的费用单')
                return editArr
            }
            return false
        }
    }

    //获取需要排序的列
    getSortColumnsItem = (type) => {
        const data = this.metaAction.gf('data').toJS()
        const columns = [{
            title: {
                name: 'sort',
                component: 'TableSort',
                sortOrder: 'descend',
                handleClick: (e) => { this.sortChange("code", e) },
                title: '单据编码'
            },
            dataIndex: 'code',
            key: 'code',
            className: 'table_center',
            render: this.rowSpan
        }]

        return columns.find(item => {
            return item.dataIndex == type
        })
    }

    //排序发生变化
    sortChange = (key, value) => {
        return;
        let params = {
            'userOrderField': value == false ? null : key,
            'order': value == false ? null : value
        }
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas(null, { ...pages, 'currentPage': 1 }, params)
        this.injections.reduce('sortReduce', params)
    }

    //分页发生变化
    pageChanged = (current, pageSize) => {
        if (this.getListIsEdit()) return
        let page = this.metaAction.gf('data.pagination').toJS()

        const len = this.metaAction.gf('data.list').toJS().length
        if (pageSize) {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current
            }
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        this.sortParmas(null, page)
    }

    rowSelection = (text, row, index) => {
        return undefined
    }

    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr
            }
        })
        this.selectedOption = newItemArr
    }

    periodChange = (path, value) => {
        if (this.getListIsEdit()) return
        let search = this.metaAction.gf('data.searchValue').toJS()
        search.period = utils.moment.momentToString(value, 'YYYY-MM')
        this.sortParmas(search)
        this.injections.reduce('update', { path, value })
    }

    //去重
    delRepeat = (data, id) => {
        const arr = new Map()
        data.map(item => {
            if (!arr.has(item[id])) {
                arr.set(item[id], item)
            }
        })
        const sum = []
        for (let value of arr.values()) {
            sum.push(value)
        }
        return sum
    }

    componentWillUnmount = () => {
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }

    onFieldChange = (index, value, type, record) => {
        if (type == 'businessType') {
            let list = this.metaAction.gf('data.list').toJS()
            let businessTypes = this.metaAction.gf('data.other.businessType').toJS();
            let businessType = businessTypes.find(o => o.id === value);
            let accountId = businessType.accountId;
            let accounts=this.metaAction.gf('data.other.account').toJS();
            let account=accounts.find(o=>o.id==accountId);
            list[index][type + 'Id'] = value;
            list[index]['accountId'] = accountId;
            list[index]['accountName'] = account.gradeName||'';
            this.injections.reduce('update', { path: 'data.list', value: list })
        } else if (type === 'account') {
            let list = this.metaAction.gf('data.list').toJS();
            let accounts=this.metaAction.gf('data.other.account').toJS();
            let account=accounts.find(o=>o.id==value);
            list[index][type + 'Id'] = value
            list[index][type + 'Name'] = account.gradeName
            this.injections.reduce('update', { path: 'data.list', value: list })
        } else {
            let list = this.metaAction.gf('data.list').toJS()
            list.map((item, num) => {
                if (item.pid == record.pid && !item[type + 'Id']) {
                    //当前列没有选择部门或人员
                    item[type + 'Id'] = value
                } else if (item.pid == record.pid) {
                    //当前列已选择部门或人员
                    if (num == index) {
                        item[type + 'Id'] = value
                    }
                }
            })
            this.injections.reduce('update', { path: 'data.list', value: list })
        }
    }

    financialClick = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('对接金财助手', 'ttk-scm-financial-assistance')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),//装饰器 使用metaAtjion为参数 实现扩展
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
