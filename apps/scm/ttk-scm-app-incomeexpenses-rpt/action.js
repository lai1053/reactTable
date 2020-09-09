import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import config from './config'
import { Radio } from 'edf-component'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
import { consts } from 'edf-consts'
import { number, date } from 'edf-utils'
import renderColumns from './utils/renderColumns'
import extend from './extend'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.selectedOption = []
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.load()
    }

    onTabFocus = async (params) => {
        params = params.toJS()
        if (params.accessType != 0) {
            if (params.bankAccountId) {
                let searchValue = this.metaAction.gf('data.searchValue').toJS()
                searchValue.bankAccountId = params.bankAccountId
                this.searchValueChange({ ...searchValue })
            }
        } else {
            const result = await this.webapi.getDisplayDate()
            // this.injections.reduce('tableLoading', false)
            const { SystemDate, EnableDate } = result
            this.injections.reduce('updateArr', [
                {
                    path: 'data.enableDate',
                    value: date.transformMomentDate(EnableDate)
                }
            ])
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.searchValueChange(searchValue)
        }
    }

    load = async () => {
        this.metaAction.sf('data.loading', true)
        await this.getEnableDate()
        // await this.getAccountList()
        this.getInitOption()
    }

    //渲染列
    getColumns = () => {
        let list = this.metaAction.gf('data.list').toJS(),
            other = this.metaAction.gf('data.other').toJS()
        return renderColumns(other.columnDto, list, other, this)
    }

    showTableSetting = async ({ value, data }) => {
        /**
         * 更新栏目
         */
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        if (!value) {
            let isColumnSolution = this.metaAction.gf('data.other.isColumnSolution')
            if (!isColumnSolution) return
            this.metaAction.sf('data.other.isColumnSolution', false)
            const columnSolution = await this.webapi.findByParam({ code: 'incomeDisbursementList' })
            if (columnSolution) {
                let columnSolutionId = columnSolution.id
                const ts = this.metaAction.gf('data.other.ts')
                this.metaAction.sf('data.other.loading', true)
                const columnDetail = await this.webapi.updateWithDetail({
                    "id": columnSolutionId,
                    "columnDetails": this.combineColumnProp(data),
                    ts: ts
                })
                this.metaAction.sf('data.other.loading', false)
                this.metaAction.sf('data.other.isColumnSolution', true)
                if (columnDetail) {
                    this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail.columnDetails })
                }
            } else {
                this.metaAction.sf('data.other.isColumnSolution', true)
            }
        }
        else {
            this.injections.reduce('tableSettingVisible', { value, data: data })
        }
    }

    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }

    //栏目重置
    resetTableSetting = async () => {
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        const other = this.metaAction.gf('data').toJS().other
        //重置栏目
        let res = await this.webapi.reInitByUser({ code: other.code })
        this.load()
    }

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

    //表格拖宽
    onColumnResizeEnd = async (newColumnWidth, columnKey) => {
        let columnDto = this.metaAction.gf('data.other.columnDto').toJS(),
            other = this.metaAction.gf('data').toJS().other,
            params = {}, columnDetails = []

        columnDto.map(item => {
            columnDetails.push({
                fieldName: item.fieldName,
                isVisible: item.isVisible,
                width: item.fieldName == columnKey ? newColumnWidth : item.width
            })
        })

        params.code = other.code
        params.columnDetails = columnDetails

        let res = await this.webapi.batchUpdate(params)
        this.injections.reduce('onColumnResizeEnd', res)
    }

    //批量删除
    allDelete = async () => {
        let selectedArr = this.extendAction.gridAction.getSelected('dataGrid', 'code')
        //console.log(selectedArr)
        selectedArr = selectedArr.filter(item => item.id && item.ts)
        //console.log(selectedArr)
        if (selectedArr.length == 0) {
            this.metaAction.toast('error', '请选择您要删除的数据');
            return;
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '您确认要删除吗?'
        })
        if (!ret) return

        let res = await this.webapi.deleteRADSBatch(this.delRepeat(selectedArr, 'id'))
        if (res.fail && res.fail.length) {
            this.metaAction.toast('warning', this.getContent(res.fail))
            this.refreshBtnClick()
        } else {
            this.metaAction.toast('success', `删除成功`);
            this.refreshBtnClick()
        }
    }

    getContent = (fail) => {
        if (fail.length) {
            return <div style={{ textAlign: 'left' }}>
                {
                    fail.map(item => {
                        return <p style={{ marginBottom: '0' }}>{item.message}</p>
                    })
                }
            </div>
        }
    }

    //去重
    delRepeat = (data, code) => {
        const arr = new Map()
        data.map(item => {
            if (!arr.has(item[code])) {
                arr.set(item[code], item)
            }
        })
        const sum = []
        for (let value of arr.values()) {
            sum.push(value)
        }
        return sum
    }

    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }

    //科目设置
    subjectManage = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=income', { accessType: 'capital' })
    }
    // 凭证习惯
    voucherHabit = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '凭证习惯设置',
            width: 480,
            okText: '确定',
            bodyStyle: { padding: '8px 24px' },
            children: this.metaAction.loadApp('ttk-scm-voucherHabit-card', {
                store: this.component.props.store,
                type: ["receive", "pay"],
            }),
        })
        if (ret) this.metaAction.toast('success', '设置成功')
    }

    getEnableDate = async () => {
        const result = await this.webapi.getDisplayDate()
        // this.injections.reduce('tableLoading', false)
        const { SystemDate, EnableDate } = result
        let contextDate = SystemDate,
            currentOrg = this.metaAction.context.get("currentOrg")
        if (currentOrg.periodDate) {
            contextDate = currentOrg.periodDate
        }

        this.injections.reduce('updateArr', [
            {
                path: 'data.searchValue.beginDate',
                value: date.transformMomentDate(contextDate)
            },
            {
                path: 'data.searchValue.endDate',
                value: date.transformMomentDate(contextDate)
            },
            {
                path: 'data.enableDate',
                value: date.transformMomentDate(EnableDate)
            },
            {
                path: 'data.SystemDate',
                value: date.transformMomentDate(SystemDate)
            }
        ])
        return
    }

    getAccountList = async () => {
        const result = await this.webapi.queryForAccount()
        this.injections.reduce('updateArr', [
            {
                path: 'data.other.accountlist',
                value: result
            }
        ])
    }

    componentWillReceiveProps = ({ keydown }) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            if (e.keyCode == 39 || e.keyCode == 40) {
                this.accountlistBtn('right')
            } else if (e.keyCode == 37 || e.keyCode == 38) {
                this.accountlistBtn('left')
            }
        }
    }

    // 高级搜索查询
    searchValueChange = (value, id) => {
        let receiptPaymentList = this.metaAction.gf('data.other.receiptPaymentList').toJS()
        delete value.customerId
        delete value.supplierId
        delete value.personId
        receiptPaymentList.map(item => {
            if (item.id == value.receiptPayment) {
                if (item.label.split('-')[1] == '客户') {
                    value.customerId = item.id
                } else if (item.label.split('-')[1] == '供应商') {
                    value.supplierId = item.id
                } else if (item.label.split('-')[1] == '人员') {
                    value.personId = item.id
                }
            }
        })

        if (!id) {
            this.injections.reduce('update', { path: 'data.searchValue', value })
        } else {
            value.bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')
            this.injections.reduce('update', { path: 'data.searchValue', value })
        }
        this.sortParmas()
    }

    // 高级搜索取消
    searchCancelChange = () => {
        let oldSeachValue = this.metaAction.gf('data.other.oldSeachValue')
        if (oldSeachValue) {
            this.injections.reduce('update', { path: 'data.searchValue', value: oldSeachValue.toJS() })
        }
    }

    // 高级搜索清空
    clearClick = (value, key) => {
        let oldSeachValue = this.metaAction.gf('data.searchValue').toJS()
        this.injections.reduce('update', { path: 'data.other.oldSeachValue', value: oldSeachValue })
        let SystemDate = this.metaAction.gf('data.SystemDate'),
            contextDate = SystemDate,
            currentOrg = this.metaAction.context.get("currentOrg")
        if (currentOrg.periodDate) {
            contextDate = currentOrg.periodDate
        }
        value.receiptPayment = ''	//收支类型
        value.sourceVoucherType = 0	//来源单据类型
        value.departmentId = ''
        value.projectId = ''
        value.endDate = date.transformMomentDate(contextDate)
        value.beginDate = date.transformMomentDate(contextDate)
        this.injections.reduce('update', { path: 'data.searchValue', value })
    }

    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }

    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.beginDate)
        arr.push(data.endDate)
        return arr
    }

    // 初始化基础信息选项
    getInitOption = async () => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.bankAccountId = this.component.props.bankAccountId
        this.searchValueChange({ ...searchValue })
    }

    onPanelChange = (value) => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.endDate = value[1]
        searchValue.beginDate = value[0]
        searchValue.receiptPayment = ''	//收支类型
        searchValue.sourceVoucherType = 0	//来源单据类型
        // 修改逻辑简单搜索也需要重新
        this.searchValueChange({ ...searchValue })
    }

    // 账户类型发生改变
    accountlistBtn = (type) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')

        let index = accountlist.findIndex(item => item.id == bankAccountId)
        let id
        switch (type) {
            case 'right':
                id = accountlist[index + 1] && accountlist[index + 1].id ? accountlist[index + 1].id : bankAccountId
                break
            case 'left':
                id = accountlist[index - 1] && accountlist[index - 1].id ? accountlist[index - 1].id : bankAccountId
                break
            default:
                id = bankAccountId
                break
        }
        if (id == bankAccountId) return
        this.accountlistChange(id)
    }

    //简单查询账户名称
    accountlistChange = (value) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const data = this.metaAction.gf('data.searchValue').toJS()
        const item = accountlist.find(index => {
            return index.id == value
        })
        data.receiptPayment = ''	//收支类型
        data.sourceVoucherType = 0	//来源单据类型
        data.bankAccountId = value
        this.metaAction.sf('data.searchValue', fromJS(data))
        this.sortParmas()
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.beginDate, data.endDate]
        return { date, query: data.query }
    }

    transformDateToNum = (date) => {
        try {
            if (!date) {
                return 0
            }
            let time = date
            if (typeof date == 'string') {
                time = date.transformMomentDate(date)
            }
            return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
        } catch (err) {
            console.log(err)
            return 0
        }
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.enableDate')
        const enableddateNum = this.transformDateToNum(enableddate)
        if (type == 'pre') {
            let currentMonth = this.transformDateToNum(current)
            return currentMonth < enableddateNum
        } else {
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            return currentMonth < pointTimeMonth || currentMonth < enableddateNum
        }

    }


    //分页发生变化
    pageChanged = (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        // this.metaAction.gf('data.enableDate')
        this.metaAction.sf('data.pagination', fromJS(page))
        this.sortParmas()
    }

    //整合查询条件
    sortParmas = (type) => {
        let loading = this.metaAction.gf('data.loading')
        if (!type && !loading) {
            this.metaAction.sf('data.loading', true)
        }
        let params = this.getParmes()
        if (type) {
            delete params.page
            return params
        }
        this.requestData(params)
    }

    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size
    }

    cellClassName = (data) => {
        if (data.positionFlag == 'last') {
            return 'total'
        }
    }

    requestData = async (params) => {
        const response = await this.webapi.getList(params)
        this.metaAction.sf('data.loading', false)
        if (response.bankAccountList) {
            response.bankAccountList = response.bankAccountList.filter(o => o.bankAccountTypeName !== '冲减预收款' && o.bankAccountTypeName !== '冲减预付款')
            let customerList = response.customerList,
                personList = response.personList,
                supplierList = response.supplierList,
                departmentList = response.departmentList,
                projectList = response.projectDtoList
            customerList.map(item => {
                item.label = item.name + '-客户'
                item.value = item.id
            })
            personList.map(item => {
                item.label = item.name + '-人员'
                item.value = item.id
            })
            supplierList.map(item => {
                item.label = item.name + '-供应商'
                item.value = item.id
            })
            departmentList.map(item => {
                item.label = item.name
                item.value = item.id
            })
            projectList.map(item => {
                item.label = item.name
                item.value = item.id
            })
            let receiptPaymentList = customerList.concat(supplierList)
            receiptPaymentList = receiptPaymentList.concat(personList)
            personList
            let bankAccountArr = [
                {
                    path: 'data.other.accountlist',
                    value: response.bankAccountList
                },
                {
                    path: 'data.list',
                    value: response.list
                },
                {
                    path: 'data.pagination',
                    value: response.page
                },
                {
                    path: 'data.other.columnDto',
                    value: response.column.columnDetails
                },
                {
                    path: 'data.other.code',
                    value: response.column.code
                },
                {
                    path: 'data.other.ts',
                    value: response.column.ts
                },
                {
                    path: 'data.other.receiptPaymentList',
                    value: receiptPaymentList
                },
                {
                    path: 'data.other.departmentList',
                    value: departmentList
                },
                {
                    path: 'data.other.projectList',
                    value: projectList
                }
            ]
            if (params.bankAccountId === undefined) {
                bankAccountArr.push({
                    path: 'data.searchValue.bankAccountId',
                    value: response.defaultBankAccount.id
                })
            }

            this.injections.reduce('updateArr', bankAccountArr)
        }
        // this.injections.reduce('load', response)
    }

    exports = async () => {
        const params = this.sortParmas('get')
        if (!params.entity.bankAccountId) {
            this.metaAction.toast('warn', '没有可导出数据')
            return
        }
        // params.displaytype = type
        await this.webapi.export(params)
        // this.metaAction.toast('success', '导出成功')
    }

    print = async () => {
        const params = this.sortParmas('get')
        if (!params.entity.bankAccountId) {
            this.metaAction.toast('warn', '没有可打印数据')
            return
        }
        //params.printAll = false
        // params.displaytype = type
        // console.log(params)
        await this.webapi.print(params)
        // this.metaAction.toast('success', '打印成功')
    }

    //导入
    imports = async () => {
        let id = this.metaAction.gf('data.searchValue.bankAccountId'),
            accountList = this.metaAction.gf('data.other').toJS().accountlist
        accountList.map(item => {
            if (item.id == id && item.bankAccountTypeId != 3000050002) id = 1
        })
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('银行对账单', 'ttk-scm-add-bank-statement-list', {
                accessType: 1,      //区别进入app方式
                bankAccountId: id,
                importId: undefined
            })
    }

    //账户互转
    exchangeAccount = async () => {
        let id = this.metaAction.gf('data.searchValue.bankAccountId')
        const ret = await this.metaAction.modal('show', {
            title: '账户互转',
            width: 700,
            footer: '',
            bodyStyle: {
                padding: 0,
            },
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-scm-app-exchange-accounts', {
                store: this.component.props.store,
                loadData: this.sortParmas,
                bankAccountId: id,
            })
        })
        // console.log(ret)
    }

    //编辑跳转
    modifyDetail = async (value) => {
        let { voucherTypeId, id } = value
        //收款、付款界面跳转，账户互转弹窗
        if (voucherTypeId == 1000030014) {
            const ret = await this.metaAction.modal('show', {
                title: '账户互转',
                width: 700,
                footer: '',
                bodyStyle: {
                    padding: 0,
                    height: 240
                },
                closeModal: this.close,
                closeBack: (back) => { this.closeTip = back },
                children: this.metaAction.loadApp('ttk-scm-app-exchange-accounts', {
                    store: this.component.props.store,
                    loadList: this.sortParmas,
                    initData: id
                })
            })
        } else if (voucherTypeId == consts.VOUCHERTYPE_Receive) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '收款单',
                    'ttk-scm-app-proceeds-card',
                    { id: id }
                )
        } else if (voucherTypeId == consts.VOUCHERTYPE_Pay) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '付款单',
                    'ttk-scm-app-payment-card',
                    { id: id }
                )
        }
    }

    delete = async (value) => {
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            let { voucherTypeId, id, ts } = value
            let option = { id: id, ts: ts }
            let res
            if (voucherTypeId == 1000030014) {
                res = await this.webapi.deleteAccounts(option)
            } else if (voucherTypeId == consts.VOUCHERTYPE_Receive) {
                res = await this.webapi.deleteReceive(option)
            } else {
                res = await this.webapi.deletePay(option)
            }
            if (res) {
                this.metaAction.toast('success', '删除成功')
                this.sortParmas()
            }

        }

    }

    addVoucher = async (parms) => {
        let res, option
        if (parms && parms.id) {
            //生成凭证
            option = {
                id: parms.id,
                voucherCode: parms.voucherCode,
                ts: parms.ts
            }
            res = await this.webapi.audit(option)
        } else {
            //批量生成凭证
            let list = this.metaAction.gf('data.list').toJS()
            let selectedArr = this.extendAction.gridAction.getSelected('dataGrid', 'voucherCode')
            //console.log(selectedArr)
            selectedArr = selectedArr.filter(item => item.id && item.ts)
            //console.log(selectedArr)
            if (selectedArr.length == 0) {
                this.metaAction.toast('error', '请选择您要生成凭证的数据');
                return;
            }
            option = []
            let flag = false
            selectedArr.map(item => {
                let itemArr = list.filter(o => o.id == item.id)
                if (itemArr[0]) {
                    if (itemArr[0].status != consts.VOUCHERSTATUS_Approved) {
                        flag = true
                    }
                    option.push({
                        id: itemArr[0].id,
                        voucherCode: itemArr[0].voucherCode,
                        ts: itemArr[0].ts
                    })
                }
            })
            if (!flag) {
                return this.metaAction.toast('warn', '当前没有可生成凭证数据')
            }
            //let parmes = this.getParmes()
            let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
            if (!isAuditEdit) return
            this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
            this.metaAction.sf('data.loading', true)
            res = await this.webapi.auditBatch(option)
            this.metaAction.sf('data.loading', false)
            this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
        }
        if (res) {
            if (res.fail && res.fail.length) {
                this.showError('生成凭证结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '生成凭证成功')
            }
            this.refreshBtnClick()
        }
    }

    delVoucher = async (parms) => {
        let res, option
        if (parms && parms.id) {
            //删除凭证
            option = {
                id: parms.id,
                voucherCode: parms.voucherCode,
                ts: parms.ts
            }
            res = await this.webapi.unaudit(option)
        } else {
            //批量删除凭证
            let list = this.metaAction.gf('data.list').toJS()
            let selectedArr = this.extendAction.gridAction.getSelected('dataGrid', 'voucherCode')
            //console.log(selectedArr)
            selectedArr = selectedArr.filter(item => item.id && item.ts)
            //console.log(selectedArr)
            if (selectedArr.length == 0) {
                this.metaAction.toast('error', '请选择您要删除凭证的数据');
                return;
            }
            option = []
            let flag = false
            selectedArr.map(item => {
                let itemArr = list.filter(o => o.id == item.id)
                if (itemArr[0]) {
                    if (itemArr[0].status == consts.VOUCHERSTATUS_Approved) {
                        flag = true
                    }
                    option.push({
                        id: itemArr[0].id,
                        voucherCode: itemArr[0].voucherCode,
                        ts: itemArr[0].ts
                    })
                }
            })
            if (!flag) {
                return this.metaAction.toast('warn', '当前没有删除凭证的数据')
            }
            let parmes = this.getParmes()
            res = await this.webapi.unauditBatch(option)
        }
        if (res) {
            if (res.fail && res.fail.length) {
                this.showError('删除凭证结果', res.success, res.fail);
            } else {
                this.metaAction.toast('success', '删除凭证成功')
            }
            this.refreshBtnClick()
        }
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

    //查询条件
    getParmes = () => {
        let page = this.metaAction.gf('data.pagination').toJS(),
            searchValue = { ...this.metaAction.gf('data.searchValue').toJS() }
        searchValue.endDate = searchValue.endDate.format('YYYY-MM')
        searchValue.beginDate = searchValue.beginDate.format('YYYY-MM')
        return {
            entity: searchValue,
            page: {
                currentPage: page.currentPage,
                pageSize: page.pageSize
            }
        }
    }

    close = (value) => {
        this.closeTip()
        if (value) {
            this.sortParmas()
        }
    }

    //格式化金额
    formatMount = (value) => {
        if (value != undefined) {
            return number.format(value, 2)
        }

    }

    //收款、付款链接跳转
    changeApp = (name) => {
        let id = this.metaAction.gf('data.searchValue.bankAccountId')
        if (name == 'receivables') {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('收款单', 'ttk-scm-app-proceeds-card', {
                    bankAccountId: id
                })
        } else if (name == 'payment') {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('付款单', 'ttk-scm-app-payment-card', {
                    bankAccountId: id
                })
        }
    }

    // 计算不可选中的时间
    calDisableDate = (current) => {
        const enableDate = this.metaAction.gf('data.enableDate')
        return false
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    filterReceiptPayment = (input, option) => {
        if (option && option.props && option.props.label) {
            return option.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    //凭证字号
    getDocCode = (option) => {

        if (/已生成/.test(option.docCode)) {
            const code = option.docCode.replace(/[已生成|凭证]/g, '');
            this.metaAction.toast('error', `请在${code}凭证管理查看生成的凭证`)
        } else {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: option.docId } })
        }
    }

    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}