import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { TableOperate, Select, Button, Modal, Checkbox, ActiveLabelSelect,Timeline,Icon, PrintOption3 } from 'edf-component'
import { fromJS, toJS } from 'immutable'
import utils from 'edf-utils'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
import changeToOption from './utils/changeToOption'
const Option = Select.Option
const TimelineItem = Timeline.Item
import { consts } from 'edf-consts'
import renderColumns from './utils/renderColumns'
import sortBaseArchives from './utils/sortBaseArchives'
import { LoadingMask } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
        this.handleTimeLineItem = utils.throttle(this.handleTimeLineItem, 800)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf('month'),
            date_end: moment(currentOrg.periodDate).endOf('month')
        }

        injections.reduce('init', data)
        this.load()
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
    }

    onTabFocus = (params) => {
        const data = this.metaAction.gf('data.assistForm.assistFormOption').toJS()
        this.load(true)
        this.metaAction.sf('data.other.currentTime', '')
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

    load = async(formTab) => {
        let pageParam = {
            moduleKey: 'app-auxsumaccount-rpt',
            resourceKey: 'app-auxsumaccount-rpt-table',
        }
        let list = [
            this.webapi.person.getPageSetting(pageParam),
            this.webapi.person.getExistsDataScope()
        ]
        const result = await Promise.all(list)
        if (result) {
            let response = result[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if (response.pageSize) {
                page.pageSize = response.pageSize
            }
            let timePeriod = result[1]||{}
            this.metaAction.sfs({
                'data.pagination': fromJS(page),
                'data.other.timePeriod': fromJS(timePeriod)
            })
        }

        await this.getEnableDate(formTab)
        const res = await this.webapi.person.queryBaseArchives()
        const group = sortBaseArchives(res)
        if( formTab ){
            this.updateBaseArchives(group)
        }else{
            this.initBaseArchives(group, formTab)
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const assistFormSelectValue = this.metaAction.gf('data.assistForm.assistFormSelectValue').toJS()
        const whereStr = searchValue.whereStr || ''
        const groupStr = searchValue.groupStr || assistFormSelectValue.join(',')
        this.searchValueChange({
            ...searchValue,
            groupStr: groupStr,
            whereStr: whereStr
        })
    }
     	//高级查询清空操作
	clearValueChange =async (value) => {
        const searchValue = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        const other = this.metaAction.gf('data.other') && this.metaAction.gf('data.other').toJS()
        const res = await this.webapi.person.queryBaseArchives()
        const group = sortBaseArchives(res)
        this.initBaseArchives(group)
        this.metaAction.sfs({
            'data.searchValue.date_start': other.init_date_start,
            'data.searchValue.date_end': other.init_date_end,
            'data.searchValue.groupStr': 'customerId',
            'data.searchValue.whereStr': '',
            'data.searchValue.random': Math.random()
        })
        
    }
    getSearchCard = (childrenRef) => {
        this.searchCard = childrenRef
    }
    updateBaseArchives = (data) => {
        const { assistFormOption, initOption, assistFormSelectValue, activeValue } = this.metaAction.gf('data.assistForm').toJS()
        const arrAssitForm = []
        data.forEach(item => {
            const oldItem = assistFormOption.find(index => index.key == item.key)
            if( oldItem ){
                const oldValue = oldItem.value
                if( oldValue ){
                    // 附上刚才选择的值
                    const newArr = oldValue.filter(x => {
                       const flag = item.children.find(y => y.value == x)
                       return flag ? true : false
                    })
                    item.value = newArr
                }
            }
            arrAssitForm.push(item)
        })
        arrAssitForm.sort((a, b) => {
            let a1 = assistFormOption.findIndex(index => a.key == index.key)
            let b1 = assistFormOption.findIndex(index => b.key == index.key)
            if( a1 == -1 ){
                a1 = 1000
            }
            if( b1 == -1 ){
                b1 = 1000
            }
            return a1 > b1
        })
        const arrAssitFormSelectValue = []
        assistFormSelectValue.forEach(item => {
            const flag = data.find( index => index.key == item )
            if( flag ){
                arrAssitFormSelectValue.push(item)
            }
        })
        if(assistFormOption&&assistFormSelectValue){
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
        }else{
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                },{
                    path: 'data.assistForm.assistFormOption',
                    value: arrAssitForm
                },{
                    path: 'data.assistForm.assistFormSelectValue',
                    value: assistFormSelectValue
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
        }

    }

    initBaseArchives = (data) => {
        this.injections.reduce('updateArr', [
            {
                path: 'data.assistForm.initOption',
                value: data
            },{
                path: 'data.assistForm.assistFormOption',
                value: data
            },{
                path: 'data.assistForm.assistFormSelectValue',
                value: ['customerId']
            }, {
                path: 'data.assistForm.activeValue',
                value: ''
            }
        ])
    }

    filterAccountOption = (inputValue, option) => {
        if (option && option.props && option.props.value) {
            let accountingSubjects = this.metaAction.gf('data.other.accountlist')
            let itemData = accountingSubjects.find(o => o.get('code') == option.props.value)
            let accountName = ''
            if (itemData.get('name') && itemData.get('code')) {
                accountName = itemData.get('name').replace(itemData.get('code'), '')
            }
            if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
                || (accountName.indexOf(inputValue) != -1)) {
                //将滚动条置顶
                let select = document.getElementsByClassName('ant-select-dropdown-menu')
                if (select.length > 0 && select[0].scrollTop > 0) {
                    select[0].scrollTop = 0
                }
                return true
            }
            else {
                return false
            }
        }
        return true
    }

    renderActiveSearch = () => {
        const { assistFormSelectValue, assistFormOption,  activeValue } = this.metaAction.gf('data.assistForm').toJS()
        // 找到排名靠前的并且选中的辅助项
        const one = assistFormOption.find(item => {
            return assistFormSelectValue.includes(item.key)
        })
        return <ActiveLabelSelect
            option={assistFormOption}
            selectLabel={one && one.key ? one.key : ''}
            value={ activeValue }
            onChange={this.activeLabelSelectChange}
        />
    }

    getEnableDate = async(formTab) => {
        // 辅助总账仅显示最大凭证日期
        const { DisplayDate, EnableDate } = await this.webapi.person.getDisplayDate()
        let { date_end, date_start } = this.metaAction.gf('data.searchValue').toJS()
        const momentEnableDate = utils.date.transformMomentDate(EnableDate)
        let date_start2 = utils.date.transformMomentDate(DisplayDate)
        let date_end2 = utils.date.transformMomentDate(DisplayDate)
        this.injections.reduce('updateArr', [{
            path: 'data.other.enableddate',
            value: utils.date.transformMomentDate(EnableDate)
        },{
            path: 'data.searchValue.date_end',
            value: !date_end ? date_end2 : this.transformDateToNum(date_end) >= this.transformDateToNum(momentEnableDate) ? date_end : date_end2
        },{
            path: 'data.searchValue.date_start',
            value: !date_start ? date_start2 : this.transformDateToNum(date_start) >= this.transformDateToNum(momentEnableDate) ? date_start : date_start2
        },
        {
            path: 'data.other.init_date_end',
            value: !date_end ? date_end2 : this.transformDateToNum(date_end) >= this.transformDateToNum(momentEnableDate) ? date_end2 : date_end2
        },{
            path: 'data.other.init_date_start',
            value: !date_start ? date_start2 : this.transformDateToNum(date_start) >= this.transformDateToNum(momentEnableDate) ? date_start2 : date_start2
        }
    ])
        return
    }

    componentWillReceiveProps = ({ keydown }) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            if( e.keyCode == 39 || e.keyCode == 40 ) {
                this.accountlistBtn('right')
            }else if ( e.keyCode == 37 || e.keyCode == 38 ) {
                this.accountlistBtn('left')
            }
        }
    }

    // 简单搜索辅助项选择发生改变
    activeLabelSelectChange = (label, value) => {
        let { initOption, assistFormOption } = this.metaAction.gf('data.assistForm').toJS()
        let sortInitOption = assistFormOption.map(item => {
            return initOption.find(index => index.key == item.key)
        })
        const init = JSON.parse(JSON.stringify(initOption))
        let assistFormSelectValue = []
        assistFormSelectValue.push(label)
        const index = initOption.findIndex(item => item.key == label)
        if( index != -1 ) {
            if( value ) {
                initOption[index].value = [value]
            }else{
                initOption[index].value = []
            }
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.groupStr = label
        if( value ) {
            searchValue.whereStr = `${label}:${value}`
        }else {
            searchValue.whereStr = ``
        }
        this.searchValueChange(searchValue, null, {
            initOption: init,
            assistFormOption: sortInitOption,
            assistFormSelectValue: assistFormSelectValue,
            activeValue: value
        })
    }

    // 高级搜索组件搜索条件发生变化
    searchValueChange = async (value, assitForm, assitForm2) => {
        const accountCode = await this.getAccountList(value.groupStr)
        await this.sortParmas({
            ...value,
            accountCode
        })
        const arr = []
        arr.push(
            {
                path: 'data.searchValue',
                value: {
                    ...value,
                    accountCode
                }
            }
        )
        if( assitForm && assitForm.selectValue ) {
            arr.push({
                path: 'data.assistForm.assistFormSelectValue',
                value: assitForm.selectValue
            },{
                path: 'data.assistForm.assistFormOption',
                value: assitForm.option
            },{
                path: 'data.assistForm.activeValue',
                value: ''
            })
        }else if(assitForm2){
            this.injections.reduce('update', {
            path: 'data.assistForm',
            value: assitForm2
        })
        }
        arr.push(
            {
                path: 'data.loading',
                value: false
            },{
                path: 'data.assistForm.activeValue',
                value: ''
            }
        )
        // this.injections.reduce('tableLoading', false)
        this.injections.reduce('updateArr', arr)
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助总账', '高级查询' + value.groupStr])
        // this.metaAction.sf('data.other.currentTime', '')
    }
    // 搜索条件发生改变，先请求科目列表

    getAccountList = async( value ) => {
        const res = await this.webapi.person.queryForAuxRpt({
            groupStr: value
        })
        const accountCode = this.metaAction.gf('data.searchValue.accountCode')
        const result = res.find(item => {
            return item.code == accountCode
        })
        this.injections.reduce('updateArr',[
            {
                path: 'data.other.accountlist',
                value: res
            },{
                path: 'data.searchValue.accountCode',
                value: result ? accountCode : (res[0] ? res[0].code : null)
            }
        ])
        // 如果新的科目列表中包含原有的，则保持不变
        return result ? accountCode : (res[0] ? res[0].code : null)
    }

    // 科目搜索条件发生变化 点击左右按钮进行改变
    accountlistBtn = (type) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const accountCode = this.metaAction.gf('data.searchValue.accountCode')
        let index = accountlist.findIndex(item => item.code == accountCode)
        let code
        switch (type){
            case 'right':
                code = accountlist[index+1]&& accountlist[index+1].code ? accountlist[index+1].code : accountCode
                break
            case 'left':
                code = accountlist[index - 1] && accountlist[index - 1].code ? accountlist[index - 1].code : accountCode
                break
            default:
                code =  accountCode
                break
        }
        this.accountlistChange(code)
    }

    //科目发生改变直接点击搜索项
    accountlistChange = (value) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const item = accountlist.find(index => {
            return index.code == value
        })
        this.injections.reduce('update', { path: 'data.searchValue.accountCode', value })
        this.sortParmas()
    }

    // 组装搜索条件
    sortParmas = async (search, pages, type) => {
        if( !search ){
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
        const searchValue = utils.sortSearchOption(search, changeData)
        if( !pages ){
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if( type == 'get' ){
            return {...searchValue, currentPage: pages.currentPage, rowsPerPage: pages.pageSize}
        }
        await this.requestData({...searchValue, currentPage: pages.currentPage, rowsPerPage: pages.pageSize})
    }

    // 发送请求
    requestData = async (params) => {
        // 没有科目的时候不发送请求
        if( !params.accountCode ){
            this.injections.reduce('updateArr',[
                {
                    path: 'data.list',
                    value: []
                },{
                    path: 'data.style',
                    value: {},
                },{
                    path: 'data.pagination.totalCount',
                    value: 0
                }
            ])
            return
        }
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        const response = await this.webapi.person.query(params)
        this.injections.reduce('updateArr',[
            {
                path: 'data.list',
                value: response.data ? response.data : []
            },{
                path: 'data.style',
                value: this.getRowSpan(response.style),
            },{
                path: 'data.pagination.totalCount',
                value: response.totalCount
            },
            {
                path: 'data.loading',
                value: false
            }
        ])
        setTimeout(()=>{
            this.onResize()
        }, 20)
    }

    getRowSpan = (data) => {
        let result = {}
        const arr = data.split(';')
        arr.forEach(item => {
            if( !item ){
                return
            }
            const str = item.replace(/\]\[/g, '\];\[')
            let [key, valueArr] = str.split(':')
            if( !result[key] ) {
                result[key] = {}
            }
            const arr2 = valueArr.split(';')
            arr2.forEach(x => {
                const y = JSON.parse(x)
                result[key][y[0]] = y[1] - y[0] + 1
            })
        })
        return result
    }

    // render辅助选项
    renderFormList = () => {
        return <AssistForm/>
    }

    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
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
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.injections.reduce('searchUpdate', { ...searchValue, ...date })
        this.sortParmas({ ...searchValue, ...date })
        this.metaAction.sf('data.other.currentTime', '')
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [ data.date_start, data.date_end ]
        return { date, query: data.query }
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.other.enableddate')
        if (type == 'pre') {
            let currentMonth = this.transformDateToNum(current)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < enableddateMonth
        } else {
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < pointTimeMonth || currentMonth<enableddateMonth
        }
    }
    pageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })

        this.sortParmas(null, page)
    }
    //分页发生变化
    sizePageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })

        this.sortParmas(null, page)
        let request = {
            moduleKey: 'app-auxsumaccount-rpt',
            resourceKey: 'app-auxsumaccount-rpt-table',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        await this.webapi.person.setPageSetting([request])
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
        if(this.metaAction.gf('data.list').toJS().length == 0){
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, null, 'get')
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/glauxsumrpt/share',
                params: data
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助总账', '分享微信/QQ'])
    }

    mailShare = async () => {
        if(this.metaAction.gf('data.list').toJS().length == 0){
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, null, 'get')
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: data,
                mailShareUrl: '/v1/gl/report/glauxsumrpt/sendShareMail',
                shareUrl: '/v1/gl/report/glauxsumrpt/share',
                printShareUrl: '/v1/gl/report/glauxsumrpt/print',
                period: `${data.beginDate.replace('-','.')}-${data.endDate.replace('-','.')}`,
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助总账', '邮件分享'])
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

    export = async () => {
        let list = this.metaAction.gf('data.list').toJS()
        if(list.length == 0){
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        let params = await this.sortParmas(null, null, 'get')
        let data = await this.webapi.person.export(params)
    }

    print = async () => {
        
        let list = this.metaAction.gf('data.list').toJS()
        if(list.length == 0){
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let tempWindow = window.open()
        let params = await this.sortParmas(null, null, 'get')
        params.tempWindow = tempWindow
        console.log(params)
        let data = await this.webapi.person.print(params)
        
    }

    showOptionsChange = (key, value) => {
        this.injections.reduce('showOptionsChange', {
            path: `data.showOption.${key}`,
            value: value
        })
    }

    rowSpan2 = (text, row, index) => {
        const num = this.calcRowSpan(row.accountDate, 'accountDate', index)
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf('data.list')
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

    checkShowSpan = (index, data) => {
        let num = 1
        if( !data ){
            return num
        }
        for( const [key, value] of Object.entries(data) ) {
            if( index > parseInt(key) && index <= key + value) {
                num = 0
            }
        }
        return num
    }

    renderColSpan = (text, key, index) => {
        const style = this.metaAction.gf('data.style').toJS()
        let num = 1
        if( style[key] && style[key][index] ) {
            num = style[key][index]
        }else if( style[key] ) {
            num = this.checkShowSpan(index, style[key])
        }
        return {
            children: <span title={text}>{text}</span>,
            props: {
                rowSpan: num
            }
        }
    }

    openMoreContent = (text) => {
        const date_end = utils.date.transformMomentDate(text)
        const date_start = utils.date.transformMomentDate(text)
        const accountCode = this.metaAction.gf('data.searchValue.accountCode')
        const { assistFormSelectValue, activeValue, assistFormOption } = this.metaAction.gf('data.assistForm').toJS()
        let assitForm = {}

        assistFormSelectValue.forEach(item => {
            const index = assistFormOption.find( o => o.key == item )
            if( index ){
                assitForm[item] = index.value ? index.value : null
            }
        })
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('辅助明细账', 'app-auxdetailaccount-rpt', { accessType: 1,linkInSearchValue: {
                date_end,
                date_start,
                accountCode,
                assitForm
            } })
    }

    tableColumns = () => {
        let arr = renderColumns(4, this.openMoreContent)
        let arr2 = []
        const { assistFormOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm').toJS()

        assistFormOption.forEach(item => {
            if( assistFormSelectValue.includes(item.key) ) {
                if( item.key.includes('isExCalc') ){
                    let keyStr = item.key ? `e${item.key.slice(3)}Name` : item.key
                    arr2.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: keyStr,
                        dataIndex: keyStr,
                        key: keyStr,
                        width: 200,
                        render: (text, record, index, ) => this.renderColSpan(text, item.key, index)
                    })
                }else{
                    arr2.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        dataIndex: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        key: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        width: 200,
                        render: (text, record, index, ) => this.renderColSpan(text, item.key, index)
                    })
                }
            }
        })
        return [...arr2, ...arr]
    }

    transformDateToNum=(date)=>{
        if( !date ){
            return 0
        }
        let time = date
        if( typeof date == 'string' ){
            time = moment(date)
        }
        return parseInt(`${time.year()}${time.month() < 10 ?  `0${time.month()}` : `${time.month()}`}`)
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(()=>{
            if( keyRandomTab == this.keyRandomTab ){
                this.getTableScroll('app-auxsumaccount-rpt-Body', 'ant-table-thead', 0 , 'ant-table-body', 'data.tableOption', e)
            }
        },200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try{
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if( !tableCon ){
                if( e ){
                    return
                }
                setTimeout(()=>{
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }

            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if( bodyHeight > y && y != pre.y ){
                this.metaAction.sf(path, fromJS({...pre, y}))
            }else if( bodyHeight < y && pre.y != null ){
                this.metaAction.sf(path, fromJS({...pre, y: null}))
            }else {
                return false
            }
        }catch(err){
            console.log(err)
        }
    }

    handleTimeLineItem = async(time,disabled) => {
        // this.metaAction.sf('data.other.currentTime', time)
        if(disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)
        // this.metaAction.sfs({
        //     'data.other.currentTime': time,
        //     'data.searchValue.date_end' : now,
        //     'data.searchValue.date_start' : now
        // })

        let date = {
            date_end: moment(`${year}-${month}`),
            date_start: moment(`${year}-${month}`)
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // this.injections.reduce('searchUpdate', { ...searchValue, ...date })
        this.sortParmas({ ...searchValue, ...date })
        this.metaAction.sfs({
            'data.other.currentTime': time,
            'data.searchValue.date_end' : now,
            'data.searchValue.date_start' : now
        })

    }

    renderTimeLineVisible = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return false
        return true
    }
    componentDidMount = () => {

        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf('month'),
            date_end: moment(currentOrg.periodDate).endOf('month')
        }
        this.renderTimeLine(data)
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

        if(parmasData || !currentTime) {
            clearTimeout(this.renderTime)
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
                    
                    for (let i in domList) {
                        if (i < (timeArr.indexOf(endDateYear) + 1 + yearNum)) {
                            height += domList[i].offsetHeight
                        }
                    }
                    document.querySelector('.app-auxsumaccount-rpt-body-left').scrollTop = height - document.querySelector('.app-auxsumaccount-rpt-body-left').offsetHeight / 2
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
                        let timePeriod = this.metaAction.gf('data.other.timePeriod').toJS()
                        let {minDataPeriod, maxDataPeriod} = timePeriod
                        let disabled = Number(item) < Number(enabledDate) 
                        let color = '#666'
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

    moreActionOpeate = async () => {
        this.setupClick()
    }

    setupClick = async () => {
        return
        let _this = this
        LoadingMask.show()
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
            isPrintCover,
            samePage
        } = await this.webapi.person.getPrintConfig()
        LoadingMask.hide()        
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-auxsumaccount-rpt-print-modal-container',
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
                isPrintCover = {isPrintCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                callBack={_this.submitPrint}
                from = 'auxsumaccount'
            />
        })
    }

    submitPrint = async (form) => {
        let res = await this.webapi.person.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')            
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
