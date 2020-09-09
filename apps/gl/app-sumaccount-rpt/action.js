import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import utils from 'edf-utils'
import { LoadingMask } from 'edf-component'
import config from './config'
import { TableOperate, Select, Button, Modal, Checkbox, PrintOption3, Timeline,Icon} from 'edf-component'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
import changeToOption from './utils/changeToOption'
const Option = Select.Option
const TimelineItem = Timeline.Item
import { consts } from 'edf-consts'
import renderColumns from './utils/renderColumns'
import PrintOption from './components/PrintOption'
import ExportOption from './components/ExportOption'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
        this.handleTimeLineItem = utils.throttle(this.handleTimeLineItem, 700)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }

        injections.reduce('init', data)
        this.load()
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
    }

    onTabFocus = async(data) => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let enableDateStr = `${currentOrg.enabledYear}-${currentOrg.enabledMonth}`
        let enableDatePre = this.metaAction.gf('data.other.enableddate')
        let num1 = this.transformDateToNum(enableDateStr)
        let num2 = this.transformDateToNum(enableDatePre)
        if (num1 == num2) {
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.searchValueChange(searchValue, 'tabFocus', 'tabFocus')
        } else {
            // this.onlySetEnableDate(enableDateStr)
            this.sortParmas(null,null,null,enableDateStr)
        }
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        const { quantity, multi} = this.metaAction.gf('data.showCheckbox').toJS()
        const res = await this.webapi.person.getExistsDataScope()
        this.metaAction.sfs({
            'data.showCheckbox': fromJS({
                quantity: quantity,
                multi: multi
            }),
            'data.showOption': fromJS({
                num: num,
                currency: currency
            }),
            'data.other.currentTime': '',
            'data.other.timePeriod': fromJS(res || {})
        })
    }
    pageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.sortParmas(null, null, page)
    }
    //分页发生变化
    sizePageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.sortParmas(null, null, page)
        let request = {
            moduleKey: 'app-sumaccount-rpt',
            resourceKey: 'app-sumaccount-rpt-table',
            settingKey:"pageSize",
            settingValue: page.pageSize
        }
        await this.webapi.person.setPageSetting([request])
    }
    onlySetEnableDate = async (enableDateStr) => {
        this.injections.reduce('update', {
            path: 'data.other.enableddate',
            value: utils.date.transformMomentDate(enableDateStr)
        })
    }

    load = async () => {
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        }
        let pageParam = {
            moduleKey: 'app-sumaccount-rpt',
            resourceKey: 'app-sumaccount-rpt-table',
        }
        let list = [
            this.webapi.person.getPageSetting(pageParam),
            this.webapi.person.getExistsDataScope()
        ]
        const res = await Promise.all(list)
        if(res) {
            let response = res[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
            let timePeriod = res[1] || {}
            this.metaAction.sfs({
                'data.pagination': fromJS(page),
                'data.other.timePeriod': fromJS(timePeriod)
            })
            this.getInitOption('init')
        }
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
    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }

    // 初始化基础信息选项
    getInitOption = async (from) => {
        let resDate = await this.webapi.person.getDisplayDate(),
            calDate = this.initDate(resDate.EnableDate, resDate.DisplayDate, false, 'get'),
            res = await this.webapi.person.init(calDate),
            currencylist = changeToOption(res.currencylist, 'name', 'id'),
            accountListAll
         //科目
         if(from != 'init'){
            accountListAll = await this.webapi.person.queryAccountList({})
         }
         //科目级次
        const accountDepthList = await this.webapi.person.queryAccountDepth()
        const accountlist = res.accountlist
        const enableddate = resDate.EnableDate
        this.injections.reduce('initOption', { currencylist, accountlist, enableddate, accountDepthList, accountListAll})
        this.injections.reduce('normalSearchChange', {
            path: 'data.searchValue.accountcode',
            value: accountlist[0] ? accountlist[0].code : ''
        })
        // 检测数量和外币checkbox是否显示
        this.checkQuantityAndCurrency(accountlist)
        this.accountlistChange(undefined, true)
        if (accountlist.length > 0) {
            this.sortParmas()
            this.injections.reduce('tableLoading', false)
        } else {
            this.injections.reduce('tableLoading', false)
        }
    }

    //初始化选择时间
    initDate = async (enableddate, displayDate, send, type) => {
        let enableDate = utils.date.transformMomentDate(enableddate)
        let now = utils.date.transformMomentDate(displayDate)
        // let date_start, date_end
        // if (enableDate.format('YYYY') == now.format('YYYY')) {
        //     date_start = enableDate
        //     date_end = now
        // } else {
            // date_start = utils.date.transformMomentDate(now.format('YYYY'))
            // date_end = now
        // }

        this.injections.reduce('updateArr', [{
            path: 'data.searchValue.date_end',
            value: now
        }, {
            path: 'data.searchValue.date_start',
            value: now
        }])
        this.injections.reduce('updateArr', [{
            path: 'data.searchValue.init_date_end',
            value: now
        }, {
            path: 'data.searchValue.init_date_start',
            value: now
        }])
        if (type == 'get') {
            return {
                begindate: now.format('YYYY-MM'),
                enddate: now.format('YYYY-MM'),
            }
        }
        if (send) {
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.searchValueChange(searchValue, 'tabFocus')
        }
    }

    // 检测数量和外币checkbox是否显示
    checkQuantityAndCurrency = async (accountlist) => {
        let calcUsage = await this.webapi.person.queryCalcUsage(),
        multi = false,
        quantity = false
        if(calcUsage.calcMultiCount > 0){
            //是否启用外币
            multi = true
        }
        if(calcUsage.calcQuantityCount > 0){
            quantity = true
        }
        this.injections.reduce('update', {
            path: 'data.showCheckbox',
            value: {
                quantity: quantity,
                multi: multi
            }
        })
        this.injections.reduce('update', {
            path: 'data.showOption',
            value: {
                num: false,
                currency: false
            }
        })
    }
    accountlistChange = (value, notSend, type, preAccountCode, preAccountList, accountList, fromLoad) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const item = accountlist.find(index => {
            return index.code == value
        })
        const currency = this.metaAction.gf('data.searchValue.currencyId')
        let muticurrency = false, quantity = false
        const {currencyId,begindate} = this.metaAction.gf('data.searchValue').toJS()
        if(fromLoad != 'highSearch' && fromLoad !== 'panelChange' && fromLoad !== 'tabFocus'){
            this.metaAction.sfs({
                'data.searchValue.endAccountCode': undefined,
                'data.searchValue.beginAccountCode': undefined,
                'data.searchValue.beginAccountGrade': 1,
                'data.searchValue.endAccountGrade': 5,
                'data.searchValue.nodatanodisplay': '1',
                'data.searchValue.valueEqZeroIfShow': ['1'],
                'data.searchValue.onlyShowEndAccount': [],
                'data.other.gradeStyleStatus': false
            })
        }

        if (type == 'tabFocus' && value == preAccountCode) {
            if(!item){
                this.sortParmas()
            }else{
                this.tabFocusAccountChange(item, preAccountCode, preAccountList, currency)
            }
        }
        this.injections.reduce('normalSearchChange', { path: 'data.searchValue.accountcode', value })
        if (!notSend) {
            this.sortParmas()
        }
    }
    	//高级查询清空操作
	clearValueChange = async (value) => {

        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // this.searchCard.clearValue()
        this.metaAction.sfs({
            'data.searchValue.beginAccountGrade': 1,
            'data.searchValue.endAccountGrade': 5,
            'data.searchValue.beginAccountCode': undefined,
            'data.searchValue.endAccountCode': undefined,
            'data.searchValue.onlyShowEndAccount': [],
            'data.searchValue.nodatanodisplay': ['1'],
            'data.searchValue.valueEqZeroIfShow': ['1'],
            'data.searchValue.currencyId': '0',
            'data.searchValue.date_start': searchValue.init_date_start,
            'data.searchValue.date_end': searchValue.init_date_end,
            'data.other.gradeStyleStatus':false
        })
        // this.injections.reduce('init')
    }
    getSearchCard = (childrenRef) => {
        this.searchCard = childrenRef
    }
    tabFocusAccountChange = (nowAccount, preAccountCode, preAccountList, currency) => {
        const item = preAccountList.find(index => {
            return index.code == preAccountCode
        })
        if (!item) {
            return
        }
        if (item.isCalcQuantity != nowAccount.isCalcQuantity) {
            this.injections.reduce('update', {
                path: 'data.showOption.num',
                value: nowAccount == -1 || !nowAccount ? false : nowAccount.isCalcQuantity
            })
        }
        if (item.isCalcMulti != nowAccount.isCalcMulti) {
            this.injections.reduce('update', {
                path: 'data.showOption.currency',
                value: currency == '0' || currency == '1' ? false : nowAccount == -1 || !nowAccount ? false : nowAccount.isCalcMulti
            })
        }
    }

    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }

    onPanelChange = (value) => {
        this.metaAction.sf('data.other.currentTime', '')
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // delete searchValue.beginAccountCode
        // delete searchValue.endAccountCode
        //2018-02-27修改为只要更改时间就需要重新搜索科目，所以需要走高级搜索的逻辑
        this.searchValueChange({ ...searchValue, ...date }, null, 'panelChange')
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date, query: data.query }
    }

    transformDateToNum = (date) => {
        let time = date
        if (typeof date == 'string') {
            time = utils.date.transformMomentDate(date)
        }
        return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
    }
    filterOption = (inputValue, option) => {
        if (option.props) {
            const { codeAndName, helpCode, helpCodeFull } = option.props
            const str = `${codeAndName} ${helpCode} ${helpCodeFull}`
            const res = new RegExp(inputValue, 'i')
            if (str.search(res) > -1) {
                return true
            } else {
                return false
            }

        } else {
            return true
        }
    }
    renderCheckBox = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox" key='nodatanodisplay'>
                <Checkbox value="1">科目无发生不显示本月合计、本年累计</Checkbox>
            </Checkbox.Group>
        )
    }
    renderCheckBox1 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox" onChange={this.setSearchField} key='onlyShowEndAccount'>
                <Checkbox value="1" >仅显示末级科目</Checkbox>
            </Checkbox.Group>
        )
    }
    renderCheckBox2 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox" key='valueEqZeroIfShow'>
                <Checkbox value="1">显示余额为0，发生额不为0的记录</Checkbox>
            </Checkbox.Group>
        )
    }
    searchCardDidMount = (target) => {
        this.searchCardSum = target
    }
    setSearchField = (array) => {
        let fieldsValue = this.searchCard.form.getFieldsValue()
        if (array && array.length == 1) {
            //勾选末级科目置灰科目级次
            this.injections.reduce('showOptionsChange', {
                path: 'data.other.gradeStyleStatus',
                value: true
            })
        } else {
            this.injections.reduce('showOptionsChange', {
                path: 'data.other.gradeStyleStatus',
                value: false
            })
        }
        this.metaAction.sfs({
            'data.searchValue.onlyShowEndAccount': fromJS(array),
            'data.searchValue.nodatanodisplay': fromJS(fieldsValue.nodatanodisplay),
            'data.searchValue.valueEqZeroIfShow': fromJS(fieldsValue.valueEqZeroIfShow)
        })
    }

    // 检查时间发生变化
    checkTimeChange = (value) => {
        const { date_start, date_end } = this.metaAction.gf('data.searchValue').toJS()
        const date_start_num = this.transformDateToNum(date_start)
        const date_end_num = this.transformDateToNum(date_end)
        const searchValue_start = this.transformDateToNum(value.date_start)
        const searchValue_end = this.transformDateToNum(value.date_end)
        return date_start_num != searchValue_start || date_end_num != searchValue_end
    }

    searchValueChange = async (value, type, fromLoad, time) => {
        let preCurrencyId = this.metaAction.gf('data.searchValue.currencyId'),
            preAccountCode = this.metaAction.gf('data.searchValue.accountcode'),
            prevValue = this.metaAction.gf('data.searchValue').toJS(),
            sfsArr=[]
        if(type != 'tabFocus'){
            if(value && value.currencyId == '0' || value && value.currencyId == '1'){
                //综合本位币隐藏外币
                sfsArr.push({
                    path: 'data.showCheckbox.multi',
                    value: false
                })
                sfsArr.push({
                    path: 'data.showOption.currency',
                    value: false
                })
            }else {
                sfsArr.push({
                    path: 'data.showCheckbox.multi',
                    value: true
                })
                if(value.currencyId !== '0' && value.currencyId !== '1'){
                    //除了综合本位币和人民币外 ，其余默认都勾选
                    sfsArr.push({
                        path: 'data.showOption.currency',
                        value: true
                    })
                }else{
                    sfsArr.push({
                        path: 'data.showOption.currency',
                        value: false
                    })
                }
            }
            sfsArr.push({
                path: 'data.other.currentTime',
                value: time ? time : ''
            })
            this.injections.reduce('updateArr', sfsArr)
        }

        if (preCurrencyId != value.currencyId || type == 'tabFocus' || this.checkTimeChange(value)) {
            const preAccountList = this.metaAction.gf('data.other.accountlist')
            const res = await this.webapi.person.queryForRpt({
                currencyId: value.currencyId,
                beginDate: value.date_start.format('YYYY-MM'),
                endDate: value.date_end.format('YYYY-MM')
            })
            sfsArr.push({
                path: 'data.other.accountlist',
                value: res
            })
            // 增加一条逻辑，无论是哪种刷新还是高级搜搜条件发生变化，如果选择的结果中包含原有的科目信息，那么优先显示原有的科目信息
            let { calAccountCode, flag } = this.checkAccountCode(res)
            let params = {
                ...prevValue,
                ...value,
                accountcode: calAccountCode
            }
            sfsArr.push({
                path: 'data.searchValue',
                value: params
            })
            this.injections.reduce('updateArr', sfsArr)
            if (!flag || value.currencyId == 0 || preCurrencyId != value.currencyId || type == 'tabFocus') {
                this.accountlistChange(calAccountCode, false, type, preAccountCode, preAccountList,res, fromLoad)
            }

            if (value.currencyId == '0' || value.currencyId == '1') {
                _hmt && _hmt.push(['_trackEvent', '财务', '总账', '高级查询选择综合本位币或人民币'])
            } else {
                _hmt && _hmt.push(['_trackEvent', '财务', '总账', '高级查询选择外币'])
            }
            if (res.length == 0) {
                this.injections.reduce('load', [])
            } else {
                // this.sortParmas(params)
            }
        } else {
            let params = {
                ...prevValue,
                ...value
            }
            if(fromLoad == 'highSearch'){
                delete params.accountcode
            }
            this.injections.reduce('searchUpdate', params)
            if (value && value.nodatanodisplay && value.nodatanodisplay.length > 0) {
                _hmt && _hmt.push(['_trackEvent', '财务', '总账', '高级查询选择科目无发生不显示本月合计、本年累计'])
            }
            this.sortParmas(params)
        }
    }
    queryAccountSubjects = async ()=> {
        let res = await this.webapi.person.queryAccountList()
        if(res){
            window.startAccountList = res.glAccounts
            this.metaAction.sf('data.other.isQueryAccountSubjects', true)
        }  
    }
    // 检查原有的科目信息是否存在并返回科目code
    checkAccountCode = (res) => {
        const accountcode = this.metaAction.gf('data.searchValue.accountcode')
        if (!accountcode) {
            return { calAccountCode: undefined, flag: false }
        }
        let item = res.find(index => index.code == accountcode)
        if (item) {
            return { calAccountCode: item.code, flag: true }
        } else {
            return { calAccountCode: undefined, flag: false }
        }
    }

    // 简单搜索条件发生改变
    accountlistBtn = (type) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const accountCode = this.metaAction.gf('data.searchValue.accountcode')
        if (!accountCode) {
            this.accountlistChange(accountlist[0] ? accountlist[0].code : null)
            return
        }
        let index = accountlist.findIndex(item => item.code == accountCode)
        let code
        switch (type) {
            case 'right':
                code = accountlist[index + 1] && accountlist[index + 1].code ? accountlist[index + 1].code : accountCode
                break
            case 'left':
                code = accountlist[index - 1] && accountlist[index - 1].code ? accountlist[index - 1].code : accountCode
                break
            default:
                code = accountCode
                break
        }
        if (accountCode == code) {
        } else {
            this.accountlistChange(code)
        }

    }

    sortParmas = (search, type, pages, enableDateStr) => {
        // 处理搜索参数
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS()
        }
        if(!search.date_start){
            search.date_start =  enableDateStr && utils.date.transformMomentDate(enableDateStr)
            search.date_end = enableDateStr && utils.date.transformMomentDate(enableDateStr)
        }
        const changeData = {
            'date_start': {
                'begindate': (data) => data ? data.format('YYYY-MM') : null,
            },
            'date_end': {
                'enddate': (data) => data ? data.format('YYYY-MM') : null,
            }
        }
        const searchValue = utils.sortSearchOption(search, changeData)
        const page = pages ? utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage']) : {}
        searchValue.onlyShowEndAccount = searchValue.onlyShowEndAccount && searchValue.onlyShowEndAccount.length > 0 ? true : false
        searchValue.nodatanodisplay = searchValue.nodatanodisplay && searchValue.nodatanodisplay.length > 0 ? '1' : '0'
        searchValue.valueEqZeroIfShow = searchValue.valueEqZeroIfShow && searchValue.valueEqZeroIfShow.length > 0 ? true : false
        if (type == 'get') {

            return { ...searchValue, page }
        }
        this.requestData({ ...searchValue, page })
    }

    // 请求列表中的数据
    requestData = async (params) => {
      
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const showOption = this.metaAction.gf('data.showOption')?this.metaAction.gf('data.showOption').toJS():''
        if(showOption){
            params.isCalcQuantity=showOption.num
            params.isCalcMulti=showOption.currency
        }else{
            params.isCalcQuantity=false
            params.isCalcMulti=false
        }
        const res = await this.webapi.person.getList(params)
        if(res){
            let tableOption = this.metaAction.gf('data.tableOption'),
                rightTable = document.getElementsByClassName('app-sumaccount-rpt-Body') && document.getElementsByClassName('app-sumaccount-rpt-Body')[0],
                rightTableWidth = rightTable && rightTable.scrollWidth 

            if(rightTable) {
                tableOption = tableOption.set('x', rightTableWidth )
            }
            this.metaAction.sf('data.tableOption', fromJS(tableOption))
        }
        this.injections.reduce('load', res)
        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }

    //请求科目相关信息
    queryForRpt = async (value) => {
        const res = await this.webapi.person.queryForRpt({ currencyId: value })
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
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }


        let data = this.sortParmas(null, 'get')
        let haveData = await this.webapi.person.haveData({...data})
        if(haveData == false){
            this.metaAction.toast('warn', '当前暂无数据可分享')
            return
        }
        let isCalcQuantity = this.metaAction.gf('data.showOption.num')
        let isCalcMulti = this.metaAction.gf('data.showOption.currency')
        let displaytype = this.getDisplayType()
        data.displaytype = `${displaytype}`
        // data.displaytype = this.getDisplayType()
        data.accountCode = data.accountcode
        data.beginDate = data.begindate
        data.endDate = data.enddate
        data.isSampPageContinuePrint = false
        data.isCalcQuantity = isCalcQuantity
        data.isCalcMulti = isCalcMulti
        if(!data.accountcode){
            data.printAll = true
        }else{
            data.printAll = false
        }
        delete data.accountcode
        delete data.begindate
        delete data.enddate
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            // closable: false,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/glsumrpt/shareNew',
                params: data
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '分享微信/QQ'])
    }

    mailShare = async () => {
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }

        let params = this.sortParmas(null, 'get')
        let haveData = await this.webapi.person.haveData({...params})
        let isCalcQuantity = this.metaAction.gf('data.showOption.num')
        let isCalcMulti = this.metaAction.gf('data.showOption.currency')
        if(haveData == false){
            this.metaAction.toast('warn', '当前暂无数据可分享')
            return
        }
        let displaytype = this.getDisplayType()
        params.displaytype = `${displaytype}`
        params.accountCode = params.accountcode
        params.beginDate = params.begindate
        params.endDate = params.enddate
        params.isSampPageContinuePrint = false
        params.isCalcQuantity = isCalcQuantity
        params.isCalcMulti = isCalcMulti
        if(!params.accountcode){
            params.printAll = true
        }else{
            params.printAll = false
        }
        delete params.accountcode
        delete params.begindate
        delete params.enddate
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            // footer: null,
            // closable: false,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: params,
                shareUrl: '/v1/gl/report/glsumrpt/shareNew',
                mailShareUrl: '/v1/gl/report/glsumrpt/sendShareMailNew',
                printShareUrl: '/v1/gl/report/glsumrpt/printNew',
                period: `${params.beginDate.replace('-', '.')}-${params.endDate.replace('-', '.')}`,
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '邮件分享'])
    }

    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }

    rowSpan = (text, row, index) => {
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(row.docId, 'docId', index),
            },
        }

        return obj
    }

    normalSearchChange = (path, value) => {
        if (path == 'date') {
            this.onPanelChange(value)
        }
    }

    export = async () => {

            const params = this.sortParmas(null, 'get')
            let isCalcQuantity = this.metaAction.gf('data.showOption.num')
            let isCalcMulti = this.metaAction.gf('data.showOption.currency')
            let haveData = await this.webapi.person.haveData({...params})
            if(haveData == false){
                this.metaAction.toast('warn', '当前没有可导出数据')
                // tempWindow.close()
                return
            }
            if(!params.accountcode){
                params.exportAll = true
            }else{
                params.exportAll = false
            }
            params.displaytype = this.getDisplayType()
            params.accountCode = params.accountcode
            params.beginDate = params.begindate
            params.endDate = params.enddate
            params.isAllInOne = false
            params.isCalcQuantity = isCalcQuantity
            params.isCalcMulti = isCalcMulti
            delete params.accountcode
            delete params.begindate
            delete params.enddate
            await this.webapi.person.export(params)
        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '导出当前科目'])
    }

    getDisplayType = () => {
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        let displaytype = 0
        if (!num && !currency) {
            displaytype = 0
        } else if (num && !currency) {
            displaytype = 2
        } else if (!num && currency) {
            displaytype = 1
        } else if (num && currency) {
            displaytype = 3
        }
        return displaytype
    }

    print = async () => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        } else {

            const params = this.sortParmas(null, 'get')
            let isCalcQuantity = this.metaAction.gf('data.showOption.num')
            let isCalcMulti = this.metaAction.gf('data.showOption.currency')
            let haveData = await this.webapi.person.haveData({...params})
            if(haveData == false){
                this.metaAction.toast('warn', '当前没有可打印数据')
                tempWindow.close()
                return
            }
            if(!params.accountcode){
                params.printAll = true
            }else{
                params.printAll = false
            }
            params.tempWindow = tempWindow
            params.displaytype = this.getDisplayType()
            params.accountCode = params.accountcode
            params.beginDate = params.begindate
            params.endDate = params.enddate
            params.isSampPageContinuePrint = false
            params.isCalcQuantity = isCalcQuantity
            params.isCalcMulti = isCalcMulti
            delete params.accountcode
            delete params.begindate
            delete params.enddate
            await this.webapi.person.print(params)
        }

        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '打印当前科目'])
    }

    setupClick = async () => {
        let _this = this
        LoadingMask.show()
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        let  enableddate=''
        if (enabledMonth && enabledYear) {
            enableddate=utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
        }
        const {
            height,
            printTime,
            landscape,
            type,
            width,
            leftPadding,
            rightPadding,
            topPadding,
            bottomPadding,
            contentFontSize,
            printCover,
            customPrintTime,
            creator,
            supervisor,
            creatorType,
            supervisorType,
            samePage
        } = await this.webapi.person.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-sumaccount-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                landscape={landscape}
                type={type}
                width={width}
                samePage = {samePage}
                topPadding = {topPadding}
                bottomPadding = {bottomPadding}
                contentFontSize = {contentFontSize}
                printCover = {printCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                callBack={_this.submitPrint}
                from = 'sumaccount'
                creator={creator}
                supervisor={supervisor}
                enableddate={enableddate}
                creatorType={creatorType}
                glFrom={true}
                customPrintTime={customPrintTime}
                supervisorType={supervisorType}
            />
        })
    }
    exportSetUpClick = async () => {
        let _this = this
        LoadingMask.show()
        const {
            samePage
        } = await this.webapi.person.getExportConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '导出设置',
            width: 440,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-sumaccount-rpt-print-modal-container',
            children: <ExportOption
                samePage = {samePage}
                callBack={_this.submitExport}
            />
        })
    }
    submitPrint = async (form) => {
        delete  form.creatorButton
        delete  form.enableddate
        delete  form.supervisorButton
        delete  form.timeOriginal
        delete  form.supervisor
        delete  form.supervisorType
        console.log(form)
        let res = await this.webapi.person.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')
    }
    submitExport = async (form) => {
        let res = await this.webapi.person.saveExportConfig(form)
        this.metaAction.toast('success', '导出设置成功')
    }
    checkBoxisShow = (key) => {
        const showCheckbox = this.metaAction.gf('data.showCheckbox').toJS()
        return { display: showCheckbox[key] ? 'inline-block' : 'none' }
    }

    showOptionsChange = (key, value) => {
        this.injections.reduce('showOptionsChange', {
            path: `data.showOption.${key}`,
            value: value
        })
        this.sortParmas()
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    // isTotalData = (record) => {
    //     return record.summary == '本月合计' || record.summary == '本年累计' ? 'total_data_weight' : ''
    // }

    rowSpan1 = (text, row, index, columnName) => {
        return {
            children:<div className='' title={text}>{text}</div>
        }
    }
    rowSpan2 = (text, row, index, columnName) => {
        // const num = this.calcRowSpan(row.codeAndDate, 'codeAndDate', index)
        // const codeNum = this.calcRowSpan(row.accountCode, 'accountCode', index)
        // const currencyNum = this.calcRowSpan(row.codeAndCurrency, 'codeAndCurrency', index)
        if(columnName=='accountName'||columnName=='currencyName'){
            return <div  className='div'><div className='renderNameDiv' title={text}><span  className='renderNameDiv'>{text}</span></div></div>
        }else{
            return (
                <div  className='div'> <div className='renderNameDiv' title={text}><a href="javascript:;"  onClick={() => this.openMoreContent(text,columnName,row)}>
                    <span  className='renderNameDiv'>{text}</span>
                </a></div></div>
            )
        }
        // const obj = {
        //     children: columnName=='accountName'||columnName=='currencyName'?
        //     // <span title={text}>{text}</span>
        //     <div  className='div'><div className='renderNameDiv' title={text}><span  className='renderNameDiv'>{text}</span></div></div>
        //     :
        //     (
        //         <div  className='div'> <div className='renderNameDiv' title={text}><a href="javascript:;"  onClick={() => this.openMoreContent(text,columnName,row)}>
        //             <span  className='renderNameDiv'>{text}</span>
        //         </a></div></div>
        //     ),
        //     props: {
                
        //         rowSpan: columnName=='accountDate'?num:columnName=='currencyName'?currencyNum:codeNum,
        //     },
        // }

        // return obj
    }

    calcRowSpan(text, columnKey, currentRowIndex) {
        let list = this.metaAction.gf('data.list')

        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == list.getIn([currentRowIndex - 1, columnKey])) {
            return 0
        }

        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }
        return rowSpan
    }
    tableCardList=()=>{
        let quantity = this.metaAction.gf('data.showOption.quantity'),
            currency = this.metaAction.gf('data.showOption.currency'),
            columnDto = this.metaAction.gf('data.other.columnDto') ? this.metaAction.gf('data.other.columnDto').toJS() : undefined, code,
            columnDtoMap = this.metaAction.gf('data.other.columnDtoMap') && this.metaAction.gf('data.other.columnDtoMap').toJS(),
            parentList = []
        if (columnDto && columnDto.length > 0) {
            columnDto.forEach(item => {
                if (!item.parentId) {
                    if(item.caption!='方向'){
                        parentList.push(item)
                    }
                }

            })
        }
        return parentList
    }
	resizeEnd = async (params) => {
        const showOption = this.metaAction.gf('data.showOption').toJS()
        let code;
        if (showOption.num && showOption.currency) {
            code='sumAccountSelectCountCurrency'
        } else if (showOption.num && !showOption.currency) {
            code='sumAccountSelectCount'
        } else if (!showOption.num && showOption.currency) {
            code='sumAccountCurrency'
        } else {
            code='sumAccountNoSelect'
        }
		const customDecideDisVisibleList = this.metaAction.gf('data.other.customDecideDisVisibleList') && this.metaAction.gf('data.other.customDecideDisVisibleList').toJS()
        let columnDetails
        let visibleList=[]
        let columnDto = this.metaAction.gf('data.other.columnDto') ? this.metaAction.gf('data.other.columnDto').toJS() : undefined
        params.code = code
        if(columnDto.length>0){
            columnDto.forEach((item,index)=>{
                let falg =false
                params.columnDetails.forEach(item1=>{
                    if(item1.fieldName==item.fieldName){
                        falg=true  
                    }
                })
                if(!falg){
                    visibleList.push(item)
                }
            })
        }
        columnDetails = params.columnDetails.concat(visibleList)
        params.columnDetails = columnDetails
		let res = await this.webapi.person.save(params)
		this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))
    }
    tableColumns = () => {
        let arr=this.metaAction.gf('data.other.columnDto')?this.metaAction.gf('data.other.columnDto').toJS():[]
        const showOption = this.metaAction.gf('data.showOption').toJS()
        let parentList=[]
        let code;
        let listWidth=0
        if (showOption.num && showOption.currency) {
            code='sumAccountSelectCountCurrency'
        } else if (showOption.num && !showOption.currency) {
            code='sumAccountSelectCount'
        } else if (!showOption.num && showOption.currency) {
            code='sumAccountCurrency'
        } else {
            code='sumAccountNoSelect'
        }

		if (arr && arr.length > 0) {
			arr.forEach(item => {
                if(item.isVisible){
                    if (!item.parentId) {
                        let obj = {
                            width: item.width,
                            fieldName: item.fieldName,
                            title: item.caption,
                            // title:(item.fieldName == 'accountCode'||item.fieldName == 'accountName')?<div  style={{top:'2px'}} className='ellipsis'><div  style={{ position:"absolute"}} title={item.caption}>{item.caption}</div></div>:item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            id: item.id,
                            code: code,
                            name: item.fieldName,
                            isVisible: item.customDecideVisible,
                            customDecideVisible: item.customDecideVisible
                        }
                        if(showOption.currency ){
                            if(item.fieldName == 'currencyName'){
                                obj.render = (text, row, index) => this.rowSpan2(text, row, index, 'currencyName')
                            }
                        }
                        if(item.fieldName == 'accountDate'){
                            obj.align ='center'
                            obj.render = (text, row, index) => this.rowSpan2(text, row, index, 'accountDate')
                        }
                         if (item.fieldName == 'accountName') {
                                // obj.fixed ='left'
                                obj.render = (text, record, index) => this.rowSpan2(text, record, index, 'accountName')
                        } else if (item.fieldName == 'accountCode') {
                                    // obj.fixed ='left'
                                    obj.render = (text, record, index) => this.rowSpan2(text, record, index, 'accountCode')
                        }else if (item.fieldName == 'amountDr'||item.fieldName == 'amountCr'||item.fieldName == 'balanceAmount') {
                            obj.align ='right'
                        }else  if(item.fieldName == 'balanceDirection'){
                            obj.align = 'center'
                        }
                        
                        parentList.push(obj)
                    }
                }
            })
            let list = this.converseTree(arr, parentList)
            list.map(o => {
                if (o.children.length == 0) {
                    o.children = undefined
                }
            })
            list.forEach(item => {
                let childrenwidth=0
                if(item.children){
                    item.children.forEach(item1=>{
                        childrenwidth= childrenwidth + (item1.width?item1.width:0)
                        listWidth = listWidth + (item1.width?item1.width:0)
                    })
                    item.width=childrenwidth
                }else{
                    listWidth = listWidth + (item.width?item.width:0)
                }
            })
            let tableOption = this.metaAction.gf('data.tableOption'),
            rightTable = document.getElementsByClassName('app-sumaccount-rpt-Body') && document.getElementsByClassName('app-sumaccount-rpt-Body')[0],
            rightTableWidth = rightTable && rightTable.scrollWidth - 3,
            scrollx = listWidth

        if(rightTable && listWidth && rightTableWidth) {
            if(listWidth < rightTableWidth) {
                scrollx = rightTableWidth
            }

            tableOption = tableOption.set('x', scrollx)
            this.metaAction.sf('data.tableOption', tableOption)

             let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0]

             tableHeader.style.width = scrollx
        } 
            if(list.length==4){
                delete list[0].fixed
                delete list[1].fixed
            }
            if(listWidth < rightTableWidth){
                list.push({
                    fieldName: 'blank',
                    dataIndex: 'blank',
                    title: <span></span>,
                    key: 'blank',
                    name: 'blank',
                    isVisible: true,
                    width: rightTableWidth - listWidth,
                    customDecideVisible: true
                })
            }
            
            return list
        }
       
    }
    /**
     * 更新栏目
     */
    showTableSettingButton=(e) =>{    
        this.showTableSetting({ value:true })
    }
    showTableSetting = async ({ value, data }) => {    
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: value
        })  
        if(value==false){
            const showOption = this.metaAction.gf('data.showOption').toJS()
            let columnDtoMap = this.metaAction.gf('data.other.columnDtoMap') && this.metaAction.gf('data.other.columnDtoMap').toJS()
            let parentList=[]
            let code;
            if (showOption.num && showOption.currency) {
                code='sumAccountSelectCountCurrency'
            } else if (showOption.num && !showOption.currency) {
                code='sumAccountSelectCount'
            } else if (!showOption.num && showOption.currency) {
                code='sumAccountCurrency'
            } else {
                code='sumAccountNoSelect'
            }
            const ts = this.metaAction.gf('data.other.ts')
            const columnSolution = await this.webapi.person.findByParam({ code: code })
            let columnSolutionId = columnSolution.id
            const columnDetail = await this.webapi.person.updateWithDetail({
                "id": columnSolutionId,
                "columnDetails": this.combineColumnProp(data),
                // ts: ts
            })
            this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail.columnDetails })
        }
    }
    combineColumnProp = (data) => {
        if (!data) return []
        let newDataArray = []
        let id=''
        let arr=this.metaAction.gf('data.other.columnDto')?this.metaAction.gf('data.other.columnDto').toJS():[]
        arr.forEach(item=>{
            if(item.caption=='方向'){
                id=item.id
            }
        })
        data.forEach((ele, index) => {
            newDataArray.push({
                "isVisible": ele.isVisible,
                "id": ele.id,
                'ts': ele.ts
            })
            if(ele.caption=='余额'&&id){
                newDataArray.push({
                    "isVisible": ele.isVisible,
                    "id": id,
                    'ts': ele.ts
                })
            }
        })

        return newDataArray
    }
    /**
     * 隐藏栏目
     */
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', false)
    }

    /**
     *  重置栏目
     */
    resetTableSetting = async () => {
        const showOption = this.metaAction.gf('data.showOption').toJS()
        let parentList=[]
        let code;
        if (showOption.num && showOption.currency) {
            code='sumAccountSelectCountCurrency'
        } else if (showOption.num && !showOption.currency) {
            code='sumAccountSelectCount'
        } else if (!showOption.num && showOption.currency) {
            code='sumAccountCurrency'
        } else {
            code='sumAccountNoSelect'
        }
        //重置栏目
        let res = await this.webapi.person.reInitByUser({ code: code })
        this.closeTableSetting()
        this.refreshBtnClick()
    }
    converseTree = (tree, parentList) => {
        for (let i = 0; i < parentList.length; i++) {
            let parentItem = parentList[i]
            let childrenList = []
            let parentItemId = parentItem.id
            for (let j = 0; j < tree.length; j++) {
                let child = tree[j]
                let id = child.id
                let renderFunc
                let childObj = {
                    id: id,
                    // title: child.title,
                    key: child.fieldName,
                    width: child.width,
                    title: child.caption,
                    dataIndex: child.fieldName,
                    fieldName: child.fieldName,
                    parentId: child.parentId,
                    name: child.fieldName,
                    isVisible: child.customDecideVisible,
                    customDecideVisible: child.customDecideVisible,
                    // render : (text, record, index) => this.rowSpan1(text, record, index)
                }
                if (child.fieldName !== 'accountName' && child.fieldName !== 'accountCode'&& child.fieldName !== 'balanceDirection') {
                    childObj.align = 'right'
                }
                if(child.fieldName == 'accountDate'||child.fieldName == 'balanceDirection'){
                    childObj.align = 'center'
                }
                // if(child.isVisible){
                    if (child.customDecideVisible == true) {
                        if (childObj.parentId == parentItemId) {
                        childrenList.push(childObj)
                        }
                    }
                // }
            }
            parentItem.children = childrenList
        }
        return parentList
    }
    openMoreContent = async (date,columnName,row) => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const showOption = this.metaAction.gf('data.showOption').toJS()
        const showCheckbox = this.metaAction.gf('data.showCheckbox').toJS()
        if(columnName == 'accountDate'){
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('明细账', 'app-detailaccount-rpt', {
                accessType: 1, initSearchValue: {
                    accountCode: row.accountCode,
                    // currencyId: searchValue.currencyId,
                    noDataNoDisplay: searchValue.nodatanodisplay,
                    date_end: utils.date.transformMomentDate(date),
                    date_start: utils.date.transformMomentDate(date),
                },
                showOption,
                showCheckbox
            })
        }else{
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('明细账', 'app-detailaccount-rpt', {
                accessType: 1, initSearchValue: {
                    accountCode: date,
                    // currencyId: searchValue.currencyId,
                    noDataNoDisplay: searchValue.nodatanodisplay,
                    date_end: utils.date.transformMomentDate(searchValue.date_end),
                    date_start: utils.date.transformMomentDate(searchValue.date_start),
                },
                showOption,
                showCheckbox
            })
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
        window.startAccountList = null
    }

    componentDidMount = async() => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }
        this.renderTimeLine(data)

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
                this.getTableScroll('app-sumaccount-rpt-Body', 'ant-table-thead', 2, 'ant-table-body', 'data.tableOption', e)
            }
            this.metaAction.sf('data.tableKey', Math.random())
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
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    $(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
                    $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
                }
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    $(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '' });

                    $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
                }
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else if (bodyHeight > y && y == pre.y) {
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    $(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });

                    $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
                }
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            }else {
                return false
            }
        } catch (err) {

        }
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.other.enableddate')
        // const enableddateNum = this.transformDateToNum(enableddate)
        if (type == 'pre') {
            let currentMonth = this.transformDateToNum(current)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < enableddateMonth
        } else {
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < pointTimeMonth || currentMonth < enableddateMonth
        }
    }

    transformDateToNum = (date) => {
        try {
            if (!date) {
                return 0
            }
            let time = date
            if (typeof date == 'string') {
                time = utils.date.transformMomentDate(date)
            }
            return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
        } catch (err) {
            console.log(err)
            return 0
        }
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date }
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }

        return true
    }

    printAllAccount = async () => {
        const _this = this
        const currencylist = this.metaAction.gf('data.other.currencylist').toJS()

        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption exportType ='sumaccount' currency={currencylist} type="打印" callBack={_this.submitPrintOption} />
        })
    }

    exportAllAccount = async () => {

        const _this = this
        const currencylist = this.metaAction.gf('data.other.currencylist').toJS()
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption exportType='sumaccount' currency={currencylist} type="导出" callBack={_this.submitExportOption} />
        })
    }

    submitExportOption = async (form) => {
            const params = this.sortParmas(null, 'get')
            let { num, currency, currencyId ,isOnlyEndNode, isSampPageContinuePrint} = form.getValue()

            if (currencyId == '0') {
                currency = false
            } else {
                currency = true
            }
            params.currencyId = currencyId
            let displaytype = 0
            if (!num && !currency) {
                displaytype = 0
            } else if (num && !currency) {
                displaytype = 2
            } else if (!num && currency) {
                displaytype = 1
            } else if (num && currency) {
                displaytype = 3
            }
            params.isCalcMulti = currency
            params.isCalcQuantity = num
            params.exportAll = true
            params.isAllInOne = isSampPageContinuePrint
            params.isOnlyEndNode = isOnlyEndNode
            params.displaytype = displaytype
            // params.accountCode = params.accountcode
            params.beginDate = params.begindate
            params.endDate = params.enddate
            delete params.accountcode
            delete params.begindate
            delete params.enddate
            let haveData = await this.webapi.person.haveData({...params,begindate:params.beginDate,enddate:params.endDate})
            if(haveData == false){
                this.metaAction.toast('warn', '当前没有可导出数据')
                return
            }
            await this.webapi.person.export(params)
        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '导出所有科目'])
    }

    submitPrintOption = async (form) => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        } else {
            let params = this.sortParmas(null, 'get')

            let { num, currency, currencyId, isOnlyEndNode, isSampPageContinuePrint} = form.getValue()
            if (currencyId == '0') {
                currency = false
            } else {
                currency = true
            }
            params.currencyId = currencyId
            let displaytype = 0
            if (!num && !currency) {
                displaytype = 0
            } else if (num && !currency) {
                displaytype = 2
            } else if (!num && currency) {
                displaytype = 1
            } else if (num && currency) {
                displaytype = 3
            }
            params.tempWindow = tempWindow
            params.currencyId = currencyId
            params.tempWindow = tempWindow
            params.isCalcMulti = currency
            params.isCalcQuantity = num
            params.printAll = true
            params.isSampPageContinuePrint = isSampPageContinuePrint
            params.isOnlyEndNode = isOnlyEndNode
            params.displaytype = displaytype
            params.beginDate = params.begindate
            params.endDate = params.enddate
            delete params.accountcode
            delete params.begindate
            delete params.enddate
            let haveData = await this.webapi.person.haveData({...params,tempWindow:undefined,begindate:params.beginDate,enddate:params.endDate})
            if(haveData == false){
                this.metaAction.toast('warn', '当前没有可打印数据')
                tempWindow.close()
                return
            }
            await this.webapi.person.print(params)
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '总账', '打印所有科目'])
    }

    handleTimeLineItem = async(time,disabled) => {
        if(disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)
      
        let date = {
            date_end: moment(`${year}-${month}`),
            date_start: moment(`${year}-${month}`)
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.searchValueChange({ ...searchValue, ...date }, null, 'panelChange', time)
    }

    renderTimeLineVisible = (type) => {
        const data = this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return false
        return true
    }

    printset = (e) => {
        switch (e.key) {
          case 'printset':
              this.setupClick()
              break;
          default:

        }
    }

    renderTimeLine = (parmasData) => {
        const data = parmasData || this.metaAction.gf('data.searchValue').toJS()
        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')
        const currentOrg = this.metaAction.context.get("currentOrg")
        let enabledDate = `${currentOrg.enabledYear}${currentOrg.enabledMonth}`

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return

        let initCurrentTime = currentOrg.periodDate.replace(/-/g,'')
        let currentTime = parmasData ? initCurrentTime : this.metaAction.gf('data.other.currentTime') 

        // 初始时间和结束时间在同年同月
        let timeArr = []
        if(startDate == endDate) {
            let year = moment(startDate).format('YYYY')
            let list = [+year-1, +year, +year+1]
            if (parmasData || !currentTime) {
                list.forEach(item => {
                    for(let i=0; i<12;i++){
                        let num = i<9 ? '0'+(i+1) : String(i+1)
                        timeArr.push(item+num)
                    }
                })
                this.timeLineYearList = timeArr
            } else {
                timeArr = this.timeLineYearList
            }
        } else {

            let beforeDate = moment(moment(startDate).subtract(Math.floor((36-diffMonth)/2), 'month')).format('YYYY-MM')
            let afterDate = moment(moment(endDate).add(Math.ceil((36-diffMonth)/2), 'month')).format('YYYY-MM')
            for(let i=0; i<36;i++){
                let time = moment(beforeDate).add(i+1, 'month').format('YYYY-MM')
                time = time.replace(/-/g, '')
                timeArr.push(time)
            }
            this.timeLineYearList = timeArr
        }
        clearTimeout(this.renderTime)
        if (parmasData || !currentTime) {
            let sYear = startDate.split('-')[0]
            let eYear = endDate.split('-')[0]
            this.renderTime = setTimeout(() => {
                try {
                    var height = 0;
                    var domList = document.getElementsByClassName('ant-timeline-item')
                    let yearNum = 0
                    timeArr.forEach(item => {
                        if(item < endDateYear) {
                            let month = item.slice(4)
                            if (Number(month) == 1) {
                                yearNum+=1
                            }
                        }
                    })

                    let chargeNum = timeArr.indexOf(endDateYear) + 1 + yearNum
                    if (!currentTime && startDate != endDate && sYear == eYear) {
                        let endMonth = endDateYear.slice(4)
                        chargeNum = chargeNum - (12 - Number(endMonth))
                    }

                    for (let i in domList) {
                        if (i < chargeNum) {
                            height += domList[i].offsetHeight
                        }
                    }
                    let leftLineDom = document.getElementsByClassName('app-sumaccount-rpt-body-left')[0]
                    leftLineDom.scrollTop = height - leftLineDom.offsetHeight / 2
                    leftLineDom = null
                } catch (e) {

                }
            }, 10)
        }

        return <div className='TimeWrap'><div className='TimelineDiv'>
            <Timeline className='Timeline'>
                <div className='ant-timeline-item line'></div>
                {
                    timeArr.map(item => {
                        let month = item.slice(4)
                        let year = item.slice(0, 4)
                        let title = `${year}-${month}`

                        let isTrue = currentTime ? currentTime == item ? true : false: startDate == endDate && item == endDateYear
                        let disabled = Number(item) < Number(enabledDate)

                        let color = '#666'

                        if (!parmasData) {
                            let timePeriod = this.metaAction.gf('data.other.timePeriod').toJS()
                            let {minDataPeriod, maxDataPeriod} = timePeriod
                            if (minDataPeriod && maxDataPeriod) {
                                if(Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod)) {
                                    if(disabled) {
                                        color = '#D9D9D9'
                                    } else {
                                        color = '#666'
                                    }
                                } else {
                                    color = '#0066B3'
                                }
                            }
                        }

                        let dot = isTrue?
                        <div className='nodeDiv'>{title}</div> :
                        item == enabledDate ? <Icon
                        type="qiyongriqi"
                        fontFamily='edficon'
                        style={{fontSize : '16px', zIndex: 222}}
                        title='启用日期'/> : null

                        if (Number(month) == 1) {
                            return [<Timeline.Item
                                className='ant-timeline-item ant-timelineItemYear'
                                dot={<div className={disabled ? 'yearLabelDis':'yearLabel'}><span>{year}</span><Icon type='arrow-down'/></div>}
                            ></Timeline.Item>,
                            <Timeline.Item
                                className={ disabled ? 'ant-timelineItemDis': isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled':''}
                                dot={dot}
                                color={ disabled ? '#D9D9D9': color}
                                onClick={() => this.handleTimeLineItem(item,disabled)}
                            ><span title={title}>{isTrue? '' : month}</span></Timeline.Item>]
                        }

                        return <Timeline.Item
                            className={ disabled ? 'ant-timelineItemDis': isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled':''}
                            dot={dot}
                            color={ disabled ? '#D9D9D9': color}
                            onClick={()=>this.handleTimeLineItem(item,disabled)}
                        ><span title={title}>{isTrue? '' : month}</span></Timeline.Item>
                    })
                }
                <div></div>
            </Timeline>
        </div></div>
    }

   
    onFieldFocus = (targetData, sourceData = []) => {
        if (targetData.length != sourceData.length) {
            this.injections.reduce('update', { path: 'data.other.startAccountList', value: fromJS(changeToOption(sourceData, 'codeAndName', 'code')) })
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
