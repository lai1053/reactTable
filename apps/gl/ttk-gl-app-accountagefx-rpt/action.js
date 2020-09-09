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

        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        let currentOrg = this.metaAction.context.get('currentOrg'),
            enabledYM = currentOrg.enabledYear + '-' + currentOrg.enabledMonth,
            periodDate = currentOrg.periodDate

        injections.reduce('init', { enabledYM, periodDate })
        this.initLoadRpt(enabledYM)
    }

    initLoadRpt = async (enabledYM) => {
        
        let endYM = this.metaAction.gf('data.form.date'),
            endYear = endYM.split('-')[0],
            endMonth = endYM.split('-')[1]

        let response = await this.webapi.accountagefxRpt.query({ endYear, endMonth, isReloadDoc: true })
        if(response){
            response.enabledYearMonth = enabledYM
            this.injections.reduce('initLoadRpt', response)
        }else{
            this.metaAction.sf('data.list',[])
            this.injections.reduce('tableLoading', false)
        }
        
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    //加载
    load = async (option) => {
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        let response = await this.webapi.accountagefxRpt.query(option)
        let currentOrg = this.metaAction.context.get('currentOrg'),
            enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
        if(response){
            response.enabledYearMonth = enabledYearMonth
            this.injections.reduce('load', response)
        }else{
            this.metaAction.sf('data.list',[])
            this.injections.reduce('tableLoading', false)
        }
        setTimeout(() => {
            this.onResize()
        }, 20)
    }
    filterOptionAux = (inputValue, option) => {
        if (option && option.props && option.props.value) {
			let accountingSubjects = this.metaAction.gf('data.other.customerList')
            let itemData = accountingSubjects.find(o => o.get('id') == option.props.value)
			if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
				// || (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
				|| (itemData.get('name') && itemData.get('name').indexOf(inputValue) != -1)
				|| (itemData.get('helpCode') && itemData.get('helpCode').toUpperCase().indexOf(inputValue.toUpperCase()) != -1)
				|| (itemData.get('helpCodeFull') && itemData.get('helpCodeFull').indexOf(inputValue) != -1)) {

				return true
			}
			else {
				return false
			}
		}
		return true
    }
    onMonthChange = async (path, oldValue, newValue) => {
        let oldDate = moment(oldValue),
            newDate = moment(newValue)

        if (oldDate.year() != newDate.year() || oldDate.month() != newDate.month()) {
            let option = this.getSearchOption()
            this.load(option)
            setTimeout(() => {
                this.onResize()
            }, 20)
        }
    }

    //客户切换
    onFieldChange = (path, value) => {
        let endYM = this.metaAction.gf('data.form.date'),
            endYear = endYM.split('-')[0],
            endMonth = endYM.split('-')[1],
            id = value

        this.injections.reduce('onFieldChange', path, value)

        this.load({ endYear, endMonth, id })
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

    getSearchOption = () => {
        let endYM = this.metaAction.gf('data.form.date'),
            endYear = endYM.split('-')[0],
            endMonth = endYM.split('-')[1],
            id = this.metaAction.gf('data.other.id')

        return { endYear, endMonth, id: id }
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

        this.webapi.accountagefxRpt.export(option)
    }

    //打印
    print = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let tempWindow = window.open()
        let option = this.getSearchOption()
        option.tempWindow = tempWindow
        this.webapi.accountagefxRpt.print(option)
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
                this.getTableScroll('ttk-gl-app-accountagefx-rpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)

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
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/ageAnalysis/share',
                params: option
            })
        })
    }

    mailShare = async () => {
        let option = this.getSearchOption(),
            period = option.endYear + '.' + option.endMonth

        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: option,
                shareUrl: '/v1/gl/report/ageAnalysis/share',
                mailShareUrl: '/v1/gl/report/ageAnalysis/sendShareMail',
                printShareUrl: '/v1/gl/report/ageAnalysis/print',
                period: period
            })
        })
    }

    renderColumns = () => {
        let columns

        columns = [{
            title: '客户',
            dataIndex: 'name',
            key: 'name'
        }, {
          title: '应收余额',
          name: 'balanceAmount',
          dataIndex: 'balanceAmount',
          key: 'balanceAmount',
          className:'AmountColumnStyle'
        }, {
          title: '0天-30天',
          name: 'amount1',
          dataIndex: 'amount1',
          key: 'amount1',
          className:'AmountColumnStyle'
        }, {
          title: '31天-60天',
          name: 'amount2',
          dataIndex: 'amount2',
          key: 'amount2',
          className:'AmountColumnStyle'
        }, {
          title: '61天-90天',
          name: 'amount3',
          dataIndex: 'amount3',
          key: 'amount3',
          className:'AmountColumnStyle'
        }, {
          title: '91天-180天',
          name: 'amount4',
          dataIndex: 'amount4',
          key: 'amount4',
          className:'AmountColumnStyle'
        }, {
          title: '181天-1年',
          name: 'amount5',
          dataIndex: 'amount5',
          key: 'amount5',
          className:'AmountColumnStyle'
        }, {
          title: '1年以上',
          name: 'amount6',
          dataIndex: 'amount6',
          key: 'amount6',
          className:'AmountColumnStyle'
        }]

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
