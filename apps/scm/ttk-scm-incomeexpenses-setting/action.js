import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import renderColumns from './utils/renderColumns'
import extend from './extend'
import { fromJS } from 'immutable'
import moment from 'moment'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init')
        this.idList = [];
        this.load()
    }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        let removeEventListener = this.component.props.removeEventListener

        if (removeEventListener) {
            removeEventListener('onTabAdd')
        }
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = null
        }

    }
    onResize = (e) => {
        const activeKey = this.metaAction.gf('data.other.activeKey');
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll(activeKey, e)
            }
        }, 50)
    }

    getTableScroll = (key, e) => {
        if (!key) return;
        //this.metaAction.sf('data.tableKey', Math.random() * 1000);
        // key=this.metaAction.gf('data.other.activeKey');

        try {
            key = Number(key);
            let tableOption = this.metaAction.gf(`data.table.${key}.tableOption`).toJS()
            let tableWrapperDom = document.getElementsByClassName('ant-table-wrapper')[key];//table wrapper包含整个table,table的高度基于这个dom

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(key)
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tableWrapperDom && theadDom && tbodyDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {

                    this.metaAction.sf(`data.table.${key}.tableOption`, fromJS({
                        ...tableOption,
                        y: height - theadDom.offsetHeight,
                        x: width - 20
                    }));
                } else {
                    delete tableOption.y
                    this.metaAction.sf(`data.table.${key}.tableOption`, fromJS({
                        ...tableOption,
                        x: width - 20
                    }));
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id
        }
        return ""
    }

    getBottonVisible = () => {
        const activeKey = this.metaAction.gf('data.other.activeKey');
        const checkboxKey = this.metaAction.gf(`data.table.${activeKey}.checkboxKey`);
        return checkboxKey !== null
    }

    load = async () => {
        const tplusconfig = this.metaAction.context.get('linkConfig');
        if (tplusconfig) {
            this.injections.reduce('tplusConfig', tplusconfig)
            const response = [
                { "id": 2001003, "code": "2001003", "name": "收入类型", key: '0' },
                { "id": 1000000, "code": "1000000", "name": "结算方式", key: '1' },
                { "id": 4001001, "code": "4001001", "name": "费用类型", key: '2' },
                { "id": 2000000, "code": "2000000", "name": "存货类别", key: '3' },
                { "id": 4000000, "code": "4000000", "name": "资产科目", key: '4' },
                { "id": 3000000, "code": "3000000", "name": "增值税科目", key: '5' }
            ]
            this.metaAction.sfs({
                [`data.table.0.checkboxKey`]: 'id',
                [`data.table.1.checkboxKey`]: null,
                [`data.table.2.checkboxKey`]: 'id',
                [`data.table.3.checkboxKey`]: null,
                [`data.table.4.checkboxKey`]: null,
                [`data.table.5.checkboxKey`]: null,
                [`data.table.6.checkboxKey`]: null,
            })
            this.idList = response.map(o => o.id)

            this.injections.reduce('setTabs', response)
            let option = {
                parentId: response[0].id
            }
            let weblist = [
                this.webapi.tplus.common(`${document.location.protocol}//${tplusconfig.foreseeClientHost}/common/account/query`, {
                    year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
                }, {
                        headers: {
                            token: this.getOrgId()
                        }
                    }),
                this.webapi.incomeexpenses.queryChild(option)
            ]
            this.metaAction.sf(`data.table.0.loading`, true)
            const res = await Promise.all(weblist)
            this.metaAction.sf(`data.table.0.loading`, false)
            if (res) {
                let account = res[0]
                if (account && account.result) {
                    account = account.value
                } else if (account && account.error) {
                    this.metaAction.toast('error', account.error.message)

                } else {
                    this.metaAction.toast('error', `连接${tplusconfig.appName}服务失败：请检查配置软件是否正常启动`)

                }

                const list = res[1]

                if (list && account) {
                    //根据科目编码获取科目名称
                    list.forEach((o) => {
                        let t = account.find((p) => p.code == o.accountCode)
                        if (t) { o.accountName = t.name } else { o.accountName = null; }
                    })
                    this.injections.reduce('load', { list, account })
                }
            }
        } else {
            const response = [
                { "id": 2001003, "code": "2001003", "name": "收入类型", key: '0' },
                { "id": 4001001, "code": "4001001", "name": "费用类型", key: '1' },
                { "id": 3001002, "code": "3001002", "name": "收款类型", key: '2' },
                { "id": 3001001, "code": "3001001", "name": "付款类型", key: '3' }
            ];
            this.metaAction.sfs({
                [`data.table.0.checkboxKey`]: 'id',
                [`data.table.1.checkboxKey`]: 'id',
                [`data.table.2.checkboxKey`]: 'id',
                [`data.table.3.checkboxKey`]: 'id',
            })
            this.idList = response.map(o => o.id)
            // const response = await this.webapi.incomeexpenses.queryCategory()
            this.injections.reduce('setTabs', response)

            if (response && response.length) {
                let option = {
                    parentId: response[0].id
                }
                this.metaAction.sf(`data.table.0.loading`, true)
                const list = await this.webapi.incomeexpenses.queryChild(option)
                this.metaAction.sf(`data.table.0.loading`, false)
                if (list) {
                    this.injections.reduce('load', { list })
                }
            }
        }
    }

    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = async (props) => {
        this.refresh()
    }

    //刷新列表
    refresh = async () => {
        let activeKey = this.metaAction.gf('data.other.activeKey'), res;
        let incomeexpensesTabId = this.idList[Number(activeKey)];
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');
        let account = this.metaAction.gf('data.tplus.account').toJS() //科目列表

        if (baseUrl) {

            account = await this.webapi.tplus.common(`${baseUrl}/common/account/query`, {
                year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
            }, {
                    headers: {
                        token: this.getOrgId()
                    }
                })

            if (account && account.result) {
                account = account.value
                this.metaAction.sf('data.tplus.account', fromJS(account));
            } else if (account && account.error) {
                this.metaAction.toast('error', account.error.message)
                return
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                return
            }

        }
        let option = {
            parentId: incomeexpensesTabId
        }
        this.metaAction.sf(`data.table.${Number(activeKey)}.loading`, true)
        if (incomeexpensesTabId == '1000000') {
            res = await this.webapi.tplus.querySettleTemplate()
        } else if (incomeexpensesTabId == '2000000') {
            res = await this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "2001001", "influenceValue": "" } })
            res = res.list
        } else if (incomeexpensesTabId == '4000000') {
            res = await this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "4000080003", "influenceValue": "" } })
            res = res.list
        } else if (incomeexpensesTabId == '3000000') {
            res = await this.webapi.tplus.queryTaxTemplate({ type: "all" })
        } else {
            res = await this.webapi.incomeexpenses.queryChild(option)
        }
        this.metaAction.sf(`data.table.${Number(activeKey)}.loading`, false)

        if (res && account && account.length) {
            if (incomeexpensesTabId == '2000000') {
                res.forEach((o) => {
                    o.name = o.influenceList[0].influenceValue
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
            } else if (incomeexpensesTabId == '4000000') {
                res.forEach((o) => {
                    o.businessName = o.influenceList[0].influenceValue
                    o.name = o.influenceList[1].influenceValue
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else { o.accountName = null; }
                })
            } else if (incomeexpensesTabId == '3000000') {
                res.forEach((o) => {
                    o.businessName = o.businessCode
                    o.name = o.influenceValueDisplay
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else { o.accountName = null; }
                })
            } else {
                res.forEach((o) => {
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else { o.accountName = null; }
                })
            }
        }
        this.injections.reduce('load', { list: res })
        // this.getTableScroll(activeKey)
    }


    //tab切换
    tabChange = async (activeKey) => {
        this.metaAction.sf('data.other.activeKey', activeKey);
        let isLoading = this.metaAction.gf(`data.table.${Number(activeKey)}.loading`);
        if (isLoading === true) return
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl');
        const softAppName = this.metaAction.gf('data.tplus.softAppName');

        let list = []


        let parentId = this.idList[Number(activeKey)];
        if (!baseUrl) {
            list = await this.webapi.incomeexpenses.queryChild({ parentId })
        } else {
            this.metaAction.sf(`data.table.${Number(activeKey)}.loading`, true)
            const tplusconfig = this.metaAction.context.get('linkConfig');

            let weblist = [
                this.webapi.tplus.common(`${document.location.protocol}//${tplusconfig.foreseeClientHost}/common/account/query`, {
                    year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
                }, {
                        headers: {
                            token: this.getOrgId()
                        }
                    })
            ]

            if (parentId == '1000000') {
                weblist.push(this.webapi.tplus.querySettleTemplate())
            } else if (parentId == '2000000') {
                weblist.push(this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "2001001", "influenceValue": "" } }))
            } else if (parentId == '4000000') {
                weblist.push(this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "4000080003", "influenceValue": "" } }))
            } else if (parentId == '3000000') {
                weblist.push(this.webapi.tplus.queryTaxTemplate({ type: "all" }))
            } else {
                weblist.push(this.webapi.incomeexpenses.queryChild({ parentId }))
            }

            const res = await Promise.all(weblist)
            this.metaAction.sf(`data.table.${Number(activeKey)}.loading`, false)
            if (!res) return false

            let account = res[0]
            if (account && account.result) {
                account = account.value
                this.metaAction.sf('data.tplus.account', fromJS(account))
                this.injections.reduce('tplusConfig', tplusconfig)
            } else if (account && account.error) {
                this.metaAction.toast('error', account.error.message)
            } else {
                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
            }

            list = res[1]
            if (parentId == '1000000') {
                // list = await this.webapi.tplus.querySettleTemplate()
                list.forEach((o) => {
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
                // this.metaAction.sf('data.other.checkboxKey', null)
            }
            else if (parentId == '2000000') {
                // list = await this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "2001001", "influenceValue": "" } })
                list = list.list
                list.forEach((o) => {
                    o.name = o.influenceList[0].influenceValue
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
                // this.metaAction.sf('data.other.checkboxKey', null)
            }
            else if (parentId == '4000000') {
                // list = await this.webapi.incomeexpenses.queryPageByAccountType({ "entity": { "templateAccountTypeId": "4000080003", "influenceValue": "" } })
                list = list.list
                list.forEach((o) => {
                    o.businessName = o.influenceList[0].influenceValue
                    o.name = o.influenceList[1].influenceValue
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
                // this.metaAction.sf('data.other.checkboxKey', null)
            }
            else if (parentId == '3000000') {
                // list = await this.webapi.tplus.queryTaxTemplate({ type: "all" })
                list.forEach((o) => {
                    o.businessName = o.businessCode
                    o.name = o.influenceValueDisplay
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
                // this.metaAction.sf('data.other.checkboxKey', null)
            } else {
                // list = await this.webapi.incomeexpenses.queryChild(option)
                list.forEach((o) => {
                    let t = account.find((p) => p.code == o.accountCode)
                    if (t) { o.accountName = t.name } else {
                        o.accountName = null;
                    }
                })
                //  this.metaAction.sf('data.other.checkboxKey', 'id')
            }
        }

        if (list) {
            list.forEach((item) => {
              if(item.accountCode&&item.accountName)  item.accountName = item.accountCode + " " + item.accountName
            })
            this.injections.reduce('update', {
                path: `data.table.${Number(activeKey)}.tableCheckbox`,
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            this.metaAction.sf(`data.table.${Number(activeKey)}.list`, fromJS(list));
        }
        this.getTableScroll(activeKey);
    }



    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let activeKey = this.metaAction.gf('data.other.activeKey');

        itemArr = itemArr.filter(o => o != undefined);
        let newArr = []
        itemArr.map(item => {
            if (item) {
                newArr.push(item.id)
            }
        })

        this.injections.reduce('update', {
            path: `data.table.${Number(activeKey)}.tableCheckbox`,
            value: {
                checkboxValue: newArr,
                selectedOption: itemArr
            }
        })
        this.selectedOption = itemArr
    }

    //新增收支类型
    newClick = async (option) => {
        let activeKey = this.metaAction.gf('data.other.activeKey'),
            baseUrl = this.metaAction.gf('data.tplus.baseUrl'),
            softAppName = this.metaAction.gf('data.tplus.softAppName'),
            account = this.metaAction.gf('data.tplus.account') && this.metaAction.gf('data.tplus.account').toJS(),
            title = option.record ? '编辑收入类型' : '新增收入类型',
            incomeexpensesTabId = this.idList[Number(activeKey)];
        if (incomeexpensesTabId == '4001001') {
            title = option.record ? '编辑费用类型' : '新增费用类型'
        } else if (incomeexpensesTabId == '3001002') {
            title = option.record ? '编辑收款类型' : '新增收款类型'
        } else if (incomeexpensesTabId == '3001001') {
            title = option.record ? '编辑付款类型' : '新增付款类型'
        }
        else if (incomeexpensesTabId == '1000000') {
            title = option.record ? '编辑结算方式' : '新增结算方式'
        }
        else if (incomeexpensesTabId == '2000000') {
            title = option.record ? '编辑存货类型' : '新增存货类型'
        }
        else if (incomeexpensesTabId == '4000000') {
            title = option.record ? '编辑资产科目' : '新增资产科目'
        }
        else if (incomeexpensesTabId == '3000000') {
            title = option.record ? '编辑增值税科目' : '新增增值税科目'
        }
        const ret = await this.metaAction.modal('show', {
            title: title,
            wrapClassName: 'income-expenses-card',
            width: 410,
            okText: '确定',
            footer: '',
            bodyStyle: { padding: '10px 0' },
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                store: this.component.props.store,
                incomeexpensesTabId: incomeexpensesTabId,
                record: option.record ? option.record : undefined,
                baseUrl,
                softAppName,
                account
            }),
        })

    }

    close = (ret) => {
        const activeKey = this.metaAction.gf('data.other.activeKey');
        this.closeTip()
        if (ret) {
            this.getTableScroll(activeKey)
            this.refresh()
        }
    }

    //编辑
    modifyDetail = (text, record, index) => {
        this.newClick({ text, record, index })
    }

    //删除
    delClick = async (text, record, index) => {
        const activeKey = this.metaAction.gf('data.other.activeKey');
        let incomeexpensesTabId = this.idList[Number(activeKey)];
        let option = {}
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            option.id = record.id
            option.ts = record.ts
            let response = await this.webapi.incomeexpenses.delete(option)
            if (response.message) {
                this.metaAction.toast('warn', response.message)
            } else {
                this.metaAction.toast('success', '删除成功')
            }
            this.getTableScroll(activeKey)
            this.refresh()
        }
    }

    delDaphClick = async () => {
        let activeKey = this.metaAction.gf('data.other.activeKey'),
            tableCheckbox = this.metaAction.gf(`data.table.${Number(activeKey)}.tableCheckbox`).toJS(),
            selectedRowsArr = [];
        let incomeexpensesTabId = this.idList[Number(activeKey)];
        if (!tableCheckbox.selectedOption.length) {
            let title = '收支类型'
            if (incomeexpensesTabId == '4001001') {
                title = '费用类型'
            } else if (incomeexpensesTabId == '3001002') {
                title = '收款类型'
            } else if (incomeexpensesTabId == '3001001') {
                title = '付款类型'
            }
            this.metaAction.toast('warning', `请选择${title}`)
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })
        if (!ret) return
        tableCheckbox.selectedOption.forEach(item => {
            if (item) {
                selectedRowsArr.push({
                    id: item.id,
                    ts: item.ts
                })
            }
        })

        let response = await this.webapi.incomeexpenses.deleteBatch(selectedRowsArr)
        if (response.fail && response.fail.length) {
            this.metaAction.toast('warn', this.getMessage(response.fail))
        } else {
            this.metaAction.toast('success', '删除成功')
        }
        this.injections.reduce('update', {
            path: `data.table.${Number(activeKey)}.tableCheckbox`,
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        this.selectedOption = []
        this.getTableScroll(activeKey)
        this.refresh()
    }

    //批量删除提示信息
    getMessage = (fail) => {
        return <div>
            {
                fail.map(item => {
                    return <p>{item.message}</p>
                })
            }
        </div>
    }

    //是否启用
    checkedChange = async (e, text, record, index) => {
        record.isEnable = !record.isEnable
        let res = await this.webapi.incomeexpenses.update(record)
        if (res) {
            if (record.isEnable) {
                this.metaAction.toast('success', '启用成功')
            } else {
                this.metaAction.toast('success', '停用成功')
            }
            this.injections.reduce("checkedChange", { value: e, text, res, index })
        }
    }

    //大类展示
    getLargeClassColumn = (text, record, index) => {
        const num = this.calcRowSpan(record.categoryId, 'categoryId', index)
        const obj = {
            children: (
                <span title={text}>{text}</span>
            ),
            props: {
                rowSpan: num,
            },
        }
        return obj
    }

    //编号
    getCode = (text, record, index) => {
        let _this = this
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl')
        if (!baseUrl) {
            if (record.isEnable) {
                return <a onClick={function () { _this.modifyDetail(text, record, index) }}>{text}</a>
            }
            return <span className='no-enable'>{text}</span>
        } else {
            return <a onClick={function () { _this.modifyDetail(text, record, index) }}>{text}</a>
        }

    }

    getOtherContent = (text, record, index) => {
        const baseUrl = this.metaAction.gf('data.tplus.baseUrl')
        if (!baseUrl) {
            if (record.isEnable) {
                return <span title={text}>{text}</span>
            }
            return <span className='no-enable' title={text}>{text}</span>
        } else {
            return <span title={text}>{text}</span>
        }
    }

    //列表展示
    tableColumns = (key) => {
        let incomeexpensesTab = this.metaAction.gf('data.other.incomeexpensesTab').toJS();
        if (!incomeexpensesTab) return []
        let incomeexpensesTabId = incomeexpensesTab[key].id;
        let tableList = [];

        let baseUrl = this.metaAction.gf('data.tplus.baseUrl'),
            softAppName = this.metaAction.gf('data.tplus.softAppName')

        let bigScaleTaxPayer = false
        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010001) bigScaleTaxPayer = true

        return renderColumns(tableList, incomeexpensesTabId, this, baseUrl, bigScaleTaxPayer, softAppName)

    }

    //操作展示
    getOperColumn = (text, record, index) => {
        let activeKey = this.metaAction.gf('data.other.activeKey'),
            _this = this,
            other = this.metaAction.gf('data.other').toJS(),
            isVisible = true;
        let incomeexpensesTabId = this.idList[Number(activeKey)];
        if (incomeexpensesTabId == '1000000' || incomeexpensesTabId == '2000000' || incomeexpensesTabId == '3000000' || incomeexpensesTabId == '4000000') isVisible = false
        return <div style={{ textAlign: 'center', display: 'block' }}>

            {
                isVisible && <Icon type={record.isEnable ? "tingyong-" : "qiyong-"}
                    fontFamily='edficon'
                    disabled={!record.canDisable}
                    title={record.isEnable ? "已启用" : "已停用"}
                    style={{ fontSize: 22, cursor: 'pointer', marginRight: '4px' }}
                    onClick={function (e) { record.canDisable ? _this.checkedChange(e, text, record, index) : null }} />
            }
            <Icon type="bianji"
                fontFamily='edficon'
                title="编辑"
                style={{ fontSize: 23, cursor: 'pointer', marginRight: '4px' }}
                onClick={function () { _this.modifyDetail(text, record, index) }} />

            {
                isVisible && <Icon type="shanchu"
                    fontFamily='edficon'
                    title='删除'
                    disabled={!record.canDelete}
                    style={{ fontSize: 23, cursor: 'pointer' }}
                    onClick={function () { record.canDelete ? _this.delClick(text, record, index) : null }} />

            }
        </div>
    }

    //合并行的
    calcRowSpan = (text, columnKey, currentRowIndex) => {
        const activeKey = this.metaAction.gf('data.other.activeKey');

        let tableList = this.metaAction.gf(`data.table.${Number(activeKey)}.list`)
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
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}