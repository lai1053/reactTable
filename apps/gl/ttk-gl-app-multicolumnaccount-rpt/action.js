import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import config from './config'
import moment from 'moment'
import utils from 'edf-utils'
import { FormDecorator } from 'edf-component'
import { debug } from 'util'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init')
        this.load()

    }

    load = async () => {
        const apis = [
            this.webapi.multiAccount.getPage(
                {
                    moduleKey: 'ttk-gl-app-multicolumnaccount-rpt',
                    resourceKey: 'ttk-gl-app-multicolumnaccount-rpt-table',
                }),
            this.webapi.multiAccount.init()
        ]
        await Promise.all(apis).then((response) => {
            let res = response[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if (res.pageSize) {
                page.pageSize = res.pageSize
            }
            const currentOrg = this.metaAction.context.get("currentOrg")
            let enableDate = `${currentOrg.enabledYear}-${currentOrg.enabledMonth}`
            this.injections.reduce('load', { page, enableDate, ...response[1] })
        }).catch((error) => {
            console.log(error)
        })
        this.injections.reduce('tableLoading', false)
        setTimeout(() => {
            this.onResize()
        }, 20)
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

    /**
     * 页签切换
     */
    onTabFocus = async () => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        await this.sortParmas({ ...searchValue })
    }

    /**
     * 选择事件
     */
    onFieldChange = async (path, value) => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            accountList = this.metaAction.gf('data.other.accountList'),
            accountOrAuxList = this.metaAction.gf('data.other.accountOrAuxList')
        if (path.indexOf('accountList') > -1) {
            let account = accountList.filter(x => x.get('id') == value).first()
            searchValue.valueType = `${account.get('balanceDirection')}`
            const apis = [this.webapi.multiAccount.findSecondList({ "accountId": value })]
            await Promise.all(apis).then((response) => {
                let secondList = response[0]
                if (secondList) {
                    this.injections.reduce('update', {
                        path: 'data.other.accountOrAuxList',
                        value: fromJS(secondList)
                    })
                    searchValue.secondCode = secondList[0].code
                    searchValue.isCalcCode = secondList[0].isCalcCode
                }
            })
            searchValue.accountId = value
        } else if (path.indexOf('secondCode') > -1) {
            let aux = accountOrAuxList.filter(x => x.get('code') == value).first()
            searchValue.isCalcCode = aux.get('isCalcCode')
            searchValue.secondCode = value
        } else if (path.indexOf('showZeroData') > -1) {
            searchValue.showZeroData = value
        } else if (path.indexOf('valueType') > -1) {
            searchValue.valueType = value
        }

        this.injections.reduce('searchUpdate', { ...searchValue })
        this.sortParmas({ ...searchValue })
    }



    /**
     * 科目过滤
     */
    filterOption = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    /**
     * 封装查询条件
     */
    sortParmas = (search, pages, type, from) => {
        let searchValue
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        const changeData = {
            'date_start': {
                'beginDate': (data) => data ? data.format('YYYY-MM') : null,
            },
            'date_end': {
                'endDate': (data) => data ? data.format('YYYY-MM') : null,
            }
        }
        if (!search.beginDate) {
            searchValue = utils.sortSearchOption(search, changeData)
        } else {
            searchValue = search
        }
        if (search.date_start) {
            search.beginDate = search.date_start.format('YYYY-MM')
        }
        if (search.date_end) {
            search.endDate = search.date_end.format('YYYY-MM')
        }

        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if (type == 'get') {
            return { ...searchValue, page: { currentPage: pages.currentPage, pageSize: pages.pageSize } }
        }
        this.requestData({ ...searchValue, page: { currentPage: pages.currentPage, pageSize: pages.pageSize } }, from)
    }

    /**
     * 请求数据
     */
    requestData = async (params) => {
        let loading = this.metaAction.gf('data.loading')
        if (params.accountId) {
            if (!loading) {
                this.injections.reduce('tableLoading', true)
            }
            const response = await this.webapi.multiAccount.query(params)
            this.injections.reduce('tableLoading', false)
            if (response) {
                const { page, headList, dataList } = response
                this.injections.reduce('updateArr', [
                    {
                        path: 'data.headList',
                        value: headList ? fromJS(headList) : fromJS([])
                    }, {
                        path: 'data.pagination',
                        value: {
                            currentPage: page ? page.currentPage : 1,
                            totalCount: page.totalCount,
                            pageSize: page.pageSize,
                            totalPage: page.totalCount
                        }
                    }, {
                        path: 'data.list',
                        value: dataList ? fromJS(dataList) : fromJS([])
                    }
                ])
            }
        }

        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    /**
     * 刷新
     */
    refresh = async () => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        await this.sortParmas({ ...searchValue })
    }

    /**
     * 获取期间值
     */
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }

    /**
     * 选择期间面板
     */
    onPanelChange = async (value) => {
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.injections.reduce('searchUpdate', { ...searchValue, ...date })
        await this.sortParmas({ ...searchValue, ...date })
    }

    /**
     * 页码变化触发
     */
    pageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })
        this.sortParmas({ ...searchValue }, page)
    }

    /**
     * 分页发生变化
     */
    sizePageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })
        this.sortParmas({ ...searchValue }, page)
        let request = {
            moduleKey: 'ttk-gl-app-multicolumnaccount-rpt',
            resourceKey: 'ttk-gl-app-multicolumnaccount-rpt-table',
            settingKey: "pageSize",
            settingValue: pageSize
        }
        await this.webapi.multiAccount.setCurPage([request])
    }

    /**
     * 分享
     */
    shareClick = (e) => {
        switch (e.key) {
            case 'weixinShare':
                this.weixinShare()
                break;
            case 'mailShare':
                this.mailShare()
                break;
        }
    }

    /**
     * 微信、QQ分享
     */
    weixinShare = async () => {
        let data = await this.sortParmas(null, null, 'get')
        if (this.metaAction.gf('data.list').size == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/multiAccount/share',
                params: data
            })
        })
    }

    /**
     * 邮件分享
     */
    mailShare = async () => {
        let data = await this.sortParmas(null, null, 'get')
        if (this.metaAction.gf('data.list').size == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: data,
                shareUrl: '/v1/gl/report/multiAccount/share',
                mailShareUrl: '/v1/gl/report/multiAccount/sendShareMail',
                printShareUrl: '/v1/gl/report/multiAccount/print',
                period: `${data.beginDate.replace('-', '.')}-${data.endDate.replace('-', '.')}`,
            })
        })
    }

    /**
     * 导出
     */
    export = async () => {
        let list = this.metaAction.gf('data.list')
        if (list.size == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        const params = await this.sortParmas(null, null, 'get')
        await this.webapi.multiAccount.export(params)
    }

    /**
     * 打印
     */
    print = async () => {
        let list = this.metaAction.gf('data.list')
        if (list.size == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        const params = this.sortParmas(null, null, 'get')
        await this.webapi.multiAccount.print(params)
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
     * 渲染列内容
     */
    renderColContent = (text, key, index) => {
        const list = this.metaAction.gf('data.list')
        const content = list.get(index).get('dynamicColMap').get(key)
        const amountStr = this.amountFormat(content, 2)
        return { children: <span title={amountStr}>{amountStr}</span> }
    }

    /**
     * 渲染金额列
     */
    renderAmountCell = (content, record, col) => {
        if (record.dataType == 0
            && (col == "amountDr" || col == "amountCr")) {
            return {
                children: <span
                    title={content}>
                    {content}
                </span>
            }
        } else {
            const amountStr = this.amountFormat(content, 2)
            return {
                children: <span
                    title={amountStr}>
                    {amountStr}
                </span>
            }
        }

    }

    /**
     * 渲染表格列
     */
    renderColumns = () => {
        const headList = this.metaAction.gf('data.headList')
        let cols = [{
            title: '日期',
            name: 'voucherDate',
            dataIndex: 'voucherDate',
            key: 'voucherDate',
            width: 89
        }, {
            title: '凭证字号',
            name: 'docTypeAndCode',
            dataIndex: 'docTypeAndCode',
            key: 'docTypeAndCode',
            width: 78,
            render: (text, record) => <a onClick={(e) => this.openMoreContent(record.docId)}>{text}</a>
        }, {
            title: '摘要',
            name: 'summary',
            dataIndex: 'summary',
            key: 'summary',
            width: headList.size > 4 ? 128 : '30%'
        }, {
            title: '借方',
            name: 'amountDr',
            dataIndex: 'amountDr',
            key: 'amountDr',
            className: 'amountColumnStyle',
            width: headList.size > 4 ? 108 : '20%',
            render: (text, record) => this.renderAmountCell(text, record, "amountDr")
        }, {
            title: '贷方',
            name: 'amountCr',
            dataIndex: 'amountCr',
            key: 'amountCr',
            className: 'amountColumnStyle',
            width: headList.size > 4 ? 108 : '20%',
            render: (text, record) => this.renderAmountCell(text, record, "amountCr")
        }, {
            title: '方向',
            name: 'directionName',
            dataIndex: 'directionName',
            key: 'directionName',
            className: 'table_center',
            width: 44
        }, {
            title: '余额',
            name: 'balanceAmount',
            dataIndex: 'balanceAmount',
            key: 'balanceAmount',
            className: 'amountColumnStyle',
            width: headList.size > 4 ? 108 : '20%',
            render: (text, record) => this.renderAmountCell(text, record)
        }],
            dynamicCols = []

        for (let index = 0; index < headList.size; index++) {
            const element = headList.get(index)
            dynamicCols.push({
                title: element.get('name'),
                name: element.get('code'),
                dataIndex: element.get('code'),
                key: element.get('code'),
                width: headList.size > 4 ? 200 : '20%',
                className: 'amountColumnStyle',
                render: (text, record, index) => this.renderColContent(text, element.get('code'), index)
            })
        }
        return [...cols, ...dynamicCols]
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('ttk-gl-app-multicolumnaccount-rpt-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }

            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight

            if (bodyHeight > y && y != pre.y) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {
            console.log(err)
        }
    }

    componentDidMount = () => {
        this.onResize()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
        } else {
            win.onresize = this.onResize
        }
    }
    /**
     * 联查凭证
     */
    openMoreContent = async (docId) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: docId } })
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
