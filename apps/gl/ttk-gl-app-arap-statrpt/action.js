import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS } from 'immutable'
import { LoadingMask } from 'edf-component'
import extend from './extend'
import config from './config'
import moment from 'moment'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    //初始化
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener

        let reportType, btnText
        if (this.component.props.appName == 'ttk-gl-app-arap-statrpt-yings') {
            reportType = 0
            btnText = '查看预收款'
        } else if (this.component.props.appName == 'ttk-gl-app-arap-statrpt-yus') {
            reportType = 1
            btnText = '查看应收款'
        } else if (this.component.props.appName == 'ttk-gl-app-arap-statrpt') {
            reportType = 2
            btnText = '查看预付款'
        } else if (this.component.props.appName == 'ttk-gl-app-arap-statrpt-yuf') {
            reportType = 3
            btnText = '查看应付款'
        }

        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init', {reportType, btnText})
        this.initLoadRpt()
    }

    initLoadRpt = async () => {
        let reportType = this.metaAction.gf('data.other.reportType')

        const response = await this.webapi.arapStatisticsRpt.init({ reportType: reportType })

        let currentOrg = this.metaAction.context.get('currentOrg'),
            enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth + '-01'

        response.enabledYearMonth = enabledYearMonth

        this.injections.reduce('initLoadRpt', response, reportType)
        if(response.useCalc == false){
            let params = this.getSearchOption()
            this.load(params)
        }
        
        setTimeout(() => {
            this.onResize()
        }, 20)
    }
    getInputValue = () => {
        let btnText
        if (this.component.props.appName == 'ttk-gl-app-arap-statrpt-yings' || this.component.props.appName == 'ttk-gl-app-arap-statrpt-yus') {
           
            btnText = '客户名称取值'
        } else if (this.component.props.appName == 'ttk-gl-app-arap-statrpt' || this.component.props.appName == 'ttk-gl-app-arap-statrpt-yuf') {
           
            btnText = '供应商名称取值'
        } 
        return btnText
    }
    //加载
    load = async (option) => {
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }

        const response = await this.webapi.arapStatisticsRpt.query(option)

        this.injections.reduce('load', response)
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    viewRpt = () => {
        let reportType = this.metaAction.gf('data.other.reportType')

        if (reportType == 0) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('预收统计表', 'ttk-gl-app-arap-statrpt-yus')
        } else if (reportType == 1) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('应收统计表', 'ttk-gl-app-arap-statrpt-yings')
        } else if (reportType == 2) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('预付统计表', 'ttk-gl-app-arap-statrpt-yuf')
        } else if (reportType == 3) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('应付统计表', 'ttk-gl-app-arap-statrpt')
        }
    }

    //日期切换
    onPanelChange = (value) => {
          let reportType = this.metaAction.gf('data.other.reportType'),
              startDate = value[0],
              endDate = value[1],
              noBalanceNoDisplay = this.metaAction.gf('data.other.noBalanceNoDisplay'),
              id = this.metaAction.gf('data.other.id'),
              grade = this.metaAction.gf('data.other.grade')
          let option = {
              reportType: reportType,
              startDate: startDate.format('YYYYMM'),
              endDate: endDate.format('YYYYMM'),
              noBalanceNoDisplay: noBalanceNoDisplay,
              id: id,
              grade: grade 
          }

          value = {
              startDate: value[0],
              endDate: value[1]
          }

          this.injections.reduce('onFieldChange', 'date', value)

          console.log(option)
          this.load(option)
    }

    //日期切换
    onFieldChange = (path, value) => {
        console.log(value)
        let reportType = this.metaAction.gf('data.other.reportType'),
            startDate = this.metaAction.gf('data.other.startDate'),
            endDate = this.metaAction.gf('data.other.endDate'),
            noBalanceNoDisplay = this.metaAction.gf('data.other.noBalanceNoDisplay'),
            id = this.metaAction.gf('data.other.id'),
            grade = this.metaAction.gf('data.other.grade')
        let option = {
            reportType: reportType,
            startDate: startDate.format('YYYYMM'),
            endDate: endDate.format('YYYYMM'),
            noBalanceNoDisplay: noBalanceNoDisplay,
            id: id,
            grade: grade
        }

        if (path.indexOf('date') > -1) {
            option.startDate = value[0].format('YYYYMM')
            option.endDate = value[1].format('YYYYMM')
            value = {
                startDate: value[0],
                endDate: value[1]
            }
        } else if (path.indexOf('supplierList') > -1) {
            option.id = value
        } else if(path.indexOf('grade') > -1){
           
                option.grade = value
            
        }else if (path.indexOf('noBalanceNoDisplay') > -1) {
            option.noBalanceNoDisplay = !noBalanceNoDisplay
            value = !noBalanceNoDisplay
        }

        this.injections.reduce('onFieldChange', path, value)

        this.load(option)
    }

    //刷新
    refresh = (isReloadDoc) => {
        let option = this.getSearchOption()

        if (isReloadDoc == true) {
            option.isReloadDoc = true
        } else {
            option.isReloadDoc = false
        }

        this.load(option)
    }

    getSearchOption = (isNeedDash) => {
        let reportType = this.metaAction.gf('data.other.reportType'),
            startDate = this.metaAction.gf('data.other.startDate'),
            endDate = this.metaAction.gf('data.other.endDate'),
            noBalanceNoDisplay = this.metaAction.gf('data.other.noBalanceNoDisplay'),
            id = this.metaAction.gf('data.other.id'),
            grade = this.metaAction.gf('data.other.grade')
        if (isNeedDash) {
            startDate = startDate.format('YYYY.MM')
            endDate = endDate.format('YYYY.MM')
        } else {
            startDate = startDate.format('YYYYMM')
            endDate = endDate.format('YYYYMM')
        }

        let option = {
            reportType: reportType,
            startDate: startDate,
            endDate: endDate,
            noBalanceNoDisplay: noBalanceNoDisplay,
            id: id,
            grade: grade 
        }

        return option
    }

    //获取时间选项
    getNormalDateValue = () => {
        return [moment(this.metaAction.gf('data.other.startDate')), moment(this.metaAction.gf('data.other.endDate'))]
    }

    //页签切换
    onTabFocus = () => {
        let isReloadDoc = true  // 是否重新装载客户、供应商列表

        this.refresh(isReloadDoc)
    }

    //导出
    export = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }

        let option = this.getSearchOption()

        this.webapi.arapStatisticsRpt.export(option)
    }
    //打印
    print = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        
        let option = this.getSearchOption()
        let tempWindow = window.open()
        option.tempWindow = tempWindow
        console.log(option)
        this.webapi.arapStatisticsRpt.print(option)
    }

    tableColumns = (reportType) => {
        let arr = this.renderColumns(reportType)
        return arr
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onTabFocus', this.onTabFocus)
        } else {
            window.onresize = undefined
        }
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

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('ttk-gl-app-arap-statrpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)

            }
        }, 20)
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

        }
    }

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

    weixinShare = async () => {
        let option = this.getSearchOption()

        console.dir(option)
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/arap/share',
                params: option
            })
        })
    }

    mailShare = async () => {
        let option = this.getSearchOption(true),
            period = option.startDate+'-'+option.endDate

        option.startDate = option.startDate.replace('.', '')
        option.endDate = option.endDate.replace('.', '')

        console.dir(option)
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: option,
                shareUrl: '/v1/gl/report/arap/share',
                mailShareUrl: '/v1/gl/report/arap/sendShareMail',
                printShareUrl: '/v1/gl/report/arap/print',
                period: period,
                reportType: option.reportType
            })
        })
    }

    openMoreContent = async (id, code) => {
        let startDate = this.metaAction.gf('data.other.startDate'),
            endDate = this.metaAction.gf('data.other.endDate'),
            accountCode = this.metaAction.gf('data.other.accountCode'),
            reportType = this.metaAction.gf('data.other.reportType'),
            useCalc = this.metaAction.gf('data.other.useCalc'),
            assitForm = {}, linkInSearchValue, assistKey

        if (reportType < 2) {
            assistKey = 'customerId'
        } else {
            assistKey = 'supplierId'
        }
        assitForm[assistKey] = id

        linkInSearchValue = {
            date_end: endDate,
            date_start: startDate,
            accountCode,
            assitForm
        }

        console.log(linkInSearchValue,useCalc)
        if(useCalc){
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('辅助明细账', 'app-auxdetailaccount-rpt', { linkInSearchValue: linkInSearchValue })
        }else{
            linkInSearchValue.currencyId = "0"
            linkInSearchValue.noDataNoDisplay = ["1"]
            linkInSearchValue.accountCode = code
            linkInSearchValue.accessType = 1
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('明细账', 'app-detailaccount-rpt', { initSearchValue: linkInSearchValue })
        }
        
    }

    //跨行 带a链接
    renderAuxItemCol = (text, record, index, size) => {
        let obj

        if (index == size-1) {
            obj = {
                children: '合计'
            }
        } else {
            obj = {
                children: (
                    <span className="ttk-table-app-list-td-con">
                        <a
                            href="javascript:;"
                            onClick={() => this.openMoreContent(record['baseId'],record['code'])}
                            className="table-needDel"
                            title={text}
                            data-rol={1}>
                            {text}
                        </a>
                    </span>
                ),
                props: {
                    rowSpan: 1,
                },
            }
        }

        return obj
    }

    renderColumns = (reportType) => {
        let columns

        if (reportType == 0) {
            columns = [{
                title: '客户',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => { return this.renderAuxItemCol(text, record, index, this.metaAction.gf('data.list').size) }
            }, {
              title: '期初应收款',
              name: 'beginAmount',
              dataIndex: 'beginAmount',
              key: 'beginAmount',
              className:'AmountColumnStyle'
            }, {
                title: '本期发生',
                children: [{
                    title: '本期增加',
                    name: 'addAmount',
                    dataIndex: 'addAmount',
                    key: 'addAmount',
                    className:'AmountColumnStyle'
                }, {
                    title: <span title='本期收回'>本期收回</span>,
                    name: 'subAmount',
                    dataIndex: 'subAmount',
                    key: 'subAmount',
                    className:'AmountColumnStyle'
                }]
            }, {
                title: <span title='累计发生'>累计发生</span>,
                children: [{
                  title: <span title='年度累计增加'>年度累计增加</span>,
                  name: 'addAmountSum',
                  dataIndex: 'addAmountSum',
                  key: 'addAmountSum',
                  className:'AmountColumnStyle'
                }, {
                  title: <span title='年度累计收回'>年度累计收回</span>,
                  name: 'subAmountSum',
                  dataIndex: 'subAmountSum',
                  key: 'subAmountSum',
                  className:'AmountColumnStyle',
                }]
            }, {
              title: '期末应收款',
              name: 'endAmount',
              dataIndex: 'endAmount',
              key: 'endAmount',
              className:'AmountColumnStyle'
            }]
        } else if (reportType == 1) {
            columns = [{
                title: '客户',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => { return this.renderAuxItemCol(text, record, index, this.metaAction.gf('data.list').size) }
            }, {
              title: '期初预收款',
              name: 'beginAmount',
              dataIndex: 'beginAmount',
              key: 'beginAmount',
              className:'AmountColumnStyle'
            }, {
                title: '本期发生',
                children: [{
                    title: '本期增加',
                    name: 'addAmount',
                    dataIndex: 'addAmount',
                    key: 'addAmount',
                    className:'AmountColumnStyle'
                }, {
                    title: <span title='本期冲抵'>本期冲抵</span>,
                    name: 'subAmount',
                    dataIndex: 'subAmount',
                    key: 'subAmount',
                    className:'AmountColumnStyle'
                }]
            }, {
                title: <span title='累计发生'>累计发生</span>,
                children: [{
                  title: <span title='年度累计增加'>年度累计增加</span>,
                  name: 'addAmountSum',
                  dataIndex: 'addAmountSum',
                  key: 'addAmountSum',
                  className:'AmountColumnStyle'
                }, {
                  title: <span title='年度累计冲抵'>年度累计冲抵</span>,
                  name: 'subAmountSum',
                  dataIndex: 'subAmountSum',
                  key: 'subAmountSum',
                  className:'AmountColumnStyle',
                }]
            }, {
              title: '期末预收款',
              name: 'endAmount',
              dataIndex: 'endAmount',
              key: 'endAmount',
              className:'AmountColumnStyle'
            }]
        } else if (reportType == 2) {
            columns = [{
                title: '供应商',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => { return this.renderAuxItemCol(text, record, index, this.metaAction.gf('data.list').size) }
            }, {
              title: '期初应付款',
              name: 'beginAmount',
              dataIndex: 'beginAmount',
              key: 'beginAmount',
              className:'AmountColumnStyle'
            }, {
                title: '本期发生',
                children: [{
                    title: '本期增加',
                    name: 'addAmount',
                    dataIndex: 'addAmount',
                    key: 'addAmount',
                    className:'AmountColumnStyle'
                }, {
                    title: <span title='本期归还'>本期归还</span>,
                    name: 'subAmount',
                    dataIndex: 'subAmount',
                    key: 'subAmount',
                    className:'AmountColumnStyle'
                }]
            }, {
                title: <span title='累计发生'>累计发生</span>,
                children: [{
                  title: <span title='年度累计增加'>年度累计增加</span>,
                  name: 'addAmountSum',
                  dataIndex: 'addAmountSum',
                  key: 'addAmountSum',
                  className:'AmountColumnStyle'
                }, {
                  title: <span title='年度累计归还'>年度累计归还</span>,
                  name: 'subAmountSum',
                  dataIndex: 'subAmountSum',
                  key: 'subAmountSum',
                  className:'AmountColumnStyle',
                }]
            }, {
              title: '期末应付款',
              name: 'endAmount',
              dataIndex: 'endAmount',
              key: 'endAmount',
              className:'AmountColumnStyle'
            }]
        } else if (reportType == 3) {
            columns = [{
                title: '供应商',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => { return this.renderAuxItemCol(text, record, index, this.metaAction.gf('data.list').size) }
            }, {
              title: '期初预付款',
              name: 'beginAmount',
              dataIndex: 'beginAmount',
              key: 'beginAmount',
              className:'AmountColumnStyle'
            }, {
                title: '本期发生',
                children: [{
                    title: '本期增加',
                    name: 'addAmount',
                    dataIndex: 'addAmount',
                    key: 'addAmount',
                    className:'AmountColumnStyle'
                }, {
                    title: <span title='本期冲抵'>本期冲抵</span>,
                    name: 'subAmount',
                    dataIndex: 'subAmount',
                    key: 'subAmount',
                    className:'AmountColumnStyle'
                }]
            }, {
                title: <span title='累计发生'>累计发生</span>,
                children: [{
                  title: <span title='年度累计增加'>年度累计增加</span>,
                  name: 'addAmountSum',
                  dataIndex: 'addAmountSum',
                  key: 'addAmountSum',
                  className:'AmountColumnStyle'
                }, {
                  title: <span title='年度累计冲抵'>年度累计冲抵</span>,
                  name: 'subAmountSum',
                  dataIndex: 'subAmountSum',
                  key: 'subAmountSum',
                  className:'AmountColumnStyle',
                }]
            }, {
              title: '期末预付款',
              name: 'endAmount',
              dataIndex: 'endAmount',
              key: 'endAmount',
              className:'AmountColumnStyle'
            }]
        }

        return columns
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({
            ...option,
            metaAction
        }),
        o = new action({
            ...option,
            metaAction,
            extendAction
        }),
        ret = {
            ...metaAction,
            ...extendAction.gridAction,
            ...o
        }
    metaAction.config({ metaHandlers: ret })
    return ret
}
