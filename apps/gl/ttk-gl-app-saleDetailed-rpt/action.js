import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import { LoadingMask, Timeline,Icon, PrintOption3 } from 'edf-component'
import extend from './extend'
import config from './config'
import PrintOption2 from './components/PrintAllComponent'
import moment from 'moment'
import renderColumns from './utils/renderColumns'
import utils from 'edf-utils'
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
            addEventListener('onTabFocus', this.onTabFocus)
        }
        this.nameData=[]
        this.nameChildrenData=[]
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }

        injections.reduce('init',data)
        this.load()
    }
    //加载
    load = async () => { 
        let pageParam = {
            moduleKey: 'ttk-gl-app-saleDetailed-rpt',
            resourceKey: 'ttk-gl-app-saleDetailed-rpt-table',
        }
        let searchValue
        searchValue = this.metaAction.gf('data.searchValue').toJS()
        let list = [
            this.webapi.apocRptStatement.getPageSetting(pageParam),
            this.webapi.apocRptStatement.getInitInfo({
                "startDate":searchValue.date_start.format('YYYY-MM').replace('-',''),//开始日期
                "endDate":searchValue.date_end.format('YYYY-MM').replace('-',''),//结束日期
            }),
        ]
        const res = await Promise.all(list)

        if(res) {
            let response = res[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
            this.nameData=res[1].glaccounts
            this.nameChildrenData=res[1].inventoryDtos
            this.metaAction.sfs({
                'data.pagination': fromJS(page),
                'data.nameData': fromJS(res[1].glaccounts),
                'data.namefalg':res[1].glaccounts[0]&&res[1].glaccounts[0].isCalcInventory?true:false,
                'data.unitName': res[1].glaccounts[0]&&res[1].glaccounts[0].unitName?res[1].glaccounts[0].unitName:'',
                'data.nameChildrenData': fromJS(res[1].inventoryDtos),
                'data.name': fromJS(res[1].glaccounts[0]?res[1].glaccounts[0].codeAndName:''),
            })
        } 
        this.getEnableDate().then((parmas) => {
            this.sortParmas()
        })       
    }
    //页签切换
    onTabFocus =async () => {
        let searchValue = this.metaAction.gf('data.searchValue')? this.metaAction.gf('data.searchValue').toJS():''
        let reqTime=searchValue
        if(!this.metaAction.gf('data.searchValue')){
            const currentOrg = this.metaAction.context.get("currentOrg")
            reqTime = {
                date_start:moment(currentOrg.periodDate).startOf('month'),
                date_end:moment(currentOrg.periodDate).endOf('month')
            }
        }
        let list = [
            this.webapi.apocRptStatement.getInitInfo({
                "startDate":reqTime.date_start.format('YYYY-MM').replace('-',''),//开始日期
                "endDate":reqTime.date_end.format('YYYY-MM').replace('-',''),//结束日期
            }),
        ]
        const res = await Promise.all(list)
        if(res) {
            this.nameData=res[0].glaccounts
            this.nameChildrenData=res[0].inventoryDtos
            this.metaAction.sfs({
                'data.nameData': fromJS(res[0].glaccounts),
                'data.nameChildrenData': fromJS(res[0].inventoryDtos),
                'data.unitName': res[0].glaccounts[0]&&res[0].glaccounts[0].unitName?res[0].glaccounts[0].unitName:'',
                'data.namefalg':res[0].glaccounts[0]&&res[0].glaccounts[0].isCalcInventory?true:false,
                'data.name': fromJS(res[0].glaccounts[0]?res[0].glaccounts[0].codeAndName:''),
            })
        }
        if(searchValue.date_end && searchValue.date_start){
            this.sortParmas()
        }else{
            this.getEnableDate().then((parmas) => {
                this.sortParmas()
            }) 
        }
        this.metaAction.sf('data.other.currentTime', '')    
    }
    //获取开账期间
    getEnableDate = async () => { 
               
        const currentOrg = this.metaAction.context.get("currentOrg")
        const enabledPeriod=`${currentOrg.enabledYear}-${currentOrg.enabledMonth}`
        const currentPeriod = currentOrg.periodDate
        this.metaAction.sf('data.enableDate', enabledPeriod) 
        const isChangeSipmleDate = this.metaAction.gf('data.changeSipmleDate')
        if (!isChangeSipmleDate){
            // const docVoucherDate = await this.webapi.apocRptStatement.getDisplayDate()            
            // const maxDocPeriod =docVoucherDate.DisplayDate
            // const calDate = this.initDate(currentPeriod, currentPeriod)
            this.metaAction.sf('data.period', currentPeriod) 
            
        }
    }
    sortParmasTime= async (value) => { 
        let list = [
            this.webapi.apocRptStatement.getInitInfo({
                "startDate":utils.date.transformMomentDate(value[0]).format('YYYY-MM').replace('-',''),//开始日期
                "endDate":utils.date.transformMomentDate(value[1]).format('YYYY-MM').replace('-',''),//结束日期
            }),
        ]
        const res = await Promise.all(list)
        if(res) {
            this.nameData=res[0].glaccounts
            this.nameChildrenData=res[0].inventoryDtos
            this.metaAction.sfs({
                'data.nameData': fromJS(res[0].glaccounts),
                'data.nameChildrenData': fromJS(res[0].inventoryDtos),
                'data.unitName': res[0].glaccounts[0]&&res[0].glaccounts[0].unitName?res[0].glaccounts[0].unitName:'',
                'data.namefalg':res[0].glaccounts[0]&&res[0].glaccounts[0].isCalcInventory?true:false,
                'data.name': fromJS(res[0].glaccounts[0]?res[0].glaccounts[0].codeAndName:''),
            })
        }
    }
    onPanelChange = (value) => {
        this.metaAction.sfs({
            'data.searchValue.date_end': utils.date.transformMomentDate(value[1]),
            'data.searchValue.date_start': utils.date.transformMomentDate(value[0])
        })
        this.sortParmasTime(value)
        this.sortParmas()
        this.metaAction.sf('data.other.currentTime', '')
    }
    selectName = (path,value) => {
        let item={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==value){
                item=element
            }
        })
        let namefalg=false
        let unitName='' 
        if(item.isCalcInventory){
            namefalg=true
            unitName=item.unitName
        }else{
            unitName=item.unitName
            namefalg=false
            this.metaAction.sf('data.nameChildren','')
        }
        this.metaAction.sfs({
            'data.name': fromJS(value),
            'data.namefalg': fromJS(namefalg),
            'data.nameChildren':'',
            'data.unitName':fromJS(unitName),
        })
        this.sortParmas()
    }
    selectNameChildren = (path,value) => {
        let item={}
        this.nameChildrenData.forEach(element => {
            if(element.name ==value){
                item=element
            }
        })
        if(item.unitName){
            this.metaAction.sfs({
                'data.nameChildren': value,
                'data.unitName':item.unitName,
            })
        }else{
            this.metaAction.sf(path, value)
        }
        this.sortParmas()
    }
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        if(data){
            arr.push(data.date_start)
        arr.push(data.date_end)
        }
        return arr
    }
    //日期选择
    onDatePickerChange = (value) => {
        this.metaAction.sf('data.period', value)
        this.metaAction.sf('data.changeSipmleDate', true)        
        this.sortParmas()
    }

    //刷新
    refresh = (value) => {
        this.sortParmas()
    }
    //打印
    print = async() => {
        let list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let tempWindow = window.open()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            "printType":0
        }
        dateParameters.tempWindow = tempWindow
        let data = await this.webapi.apocRptStatement.print(dateParameters)
    }
    printAllAccount = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        const _this = this
        const currency = false
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2  currency={currency} type="打印" callBack={ _this.submitPrintOption } />
        })
    }
    submitPrintOption = async (form) => {
        let browserType = utils.environment.getBrowserVersion(),
        tempWindow
        if(browserType.ismode360){
            tempWindow = window.open()
            tempWindow.document.body.innerHTML="<div'>正在打印中，请稍等...</div>"
        }
        let { num, currency, currencyId, isOnlyEndNode, isContinuous } = form.getValue()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            'isContinuous':isContinuous,
            "printType":2
        }
        let exportAsync = await this.webapi.apocRptStatement.printAsync(dateParameters),
        asyncStatus,
        asyncResult,
        timer
        this.metaAction.sf('data.loading', true)
        if(exportAsync){
            this.timer = setInterval(async () => {
                asyncStatus = await this.webapi.apocRptStatement.printAsyncStatus({sequenceNo: exportAsync})
                if(asyncStatus && asyncStatus.matchInitState == 'STATUS_RESPONSE'){
                    //执行成功
                    clearInterval(this.timer)
                    this.metaAction.sf('data.loading', false)
                    // let tempWindow = window.open()
                    let url = JSON.parse(asyncStatus.file)
                    if(!browserType.ismode360){
                        tempWindow = window.open()
                    }
                    url.tempWindow = tempWindow
                    asyncResult = await this.webapi.apocRptStatement.printAsyncResult(url)
                    return
                }else if(asyncStatus && asyncStatus.matchInitState == 'STATUS_EXCEPTION' || asyncStatus && asyncStatus.matchInitState == 'STATUS_NO_REQUEST'){
                    clearInterval(this.timer)
                    this.metaAction.sf('data.loading', false)
                    return
                }
            },2000)
        }else {
            this.metaAction.sf('data.loading', false)
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '销售明细表', '打印所有科目'])
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
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            "printType":0
        }
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/saledetails/share',
                params: dateParameters
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '销售明细账', '分享微信/QQ'])
    }

    mailShare = async () => {
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            "printType":0
        }
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: dateParameters,
                shareUrl: '/v1/gl/report/saledetails/share',
                mailShareUrl: '/v1/gl/report/saledetails/sendShareMail',
                printShareUrl: '/v1/gl/report/saledetails/print',
                period: `${startDate.replace('-', '.')}-${endDate.replace('-', '.')}`,
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '销售明细账', '邮件分享'])

    }
    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }
    colSpan0 = (text, row, index) => {
        let obj ={}
        if(text){
            obj = {
                children: <span title={moment(text).format('YYYY-MM-DD')}>{moment(text).format('YYYY-MM-DD')}</span>,
            }
        }else{
            obj = {
                children: <span >{text}</span>,
            }
        }
       
        return obj
    }
    colSpan2 = (text, row, index) => {
        let obj ={}
        if(row.docId){
            obj = {
                children: <span > <a href="javascript:;" onClick={()=>this.openMoreContent(row.docId)} title={text}>{text}</a></span>
            }
        }else{
            obj = {
                children: <span >{text}</span>,
            }
        }
       
        return obj
    }
    tableColumns = () => {
        let arr = renderColumns()
        arr[0].render = this.colSpan0
        arr[1].render = this.colSpan2
        return arr
    }
    openMoreContent = async (docId) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: docId } })
    }
    pageChanged = async (current,pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.sortParmas(null, page)
    }
    //分页发生变化
    sizePageChanged = async (current, pageSize) => {
        console.log(current)
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.sortParmas(null, page)
        let request = {
            moduleKey: 'ttk-gl-app-saleDetailed-rpt',
            resourceKey: 'ttk-gl-app-saleDetailed-rpt-table',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        await this.webapi.apocRptStatement.setPageSetting([request])
    }
    sortParmas = async (type,page) => {
        if(!page){
            page = this.metaAction.gf('data.pagination').toJS()
        }
        
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            page:{
                currentPage:  Number(page.currentPage), pageSize: Number(page.pageSize)
            }
        }
        if (type == 'get') {
            return { ...dateParameters }
        }
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        const res = await Promise.all([
            this.webapi.apocRptStatement.getPageInfo(dateParameters),
        ])

        this.injections.reduce('load', res[0])
        this.metaAction.sfs({
            'data.loading': false,
        })

        setTimeout(() => {
            this.onResize()
        }, 20)

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
                this.getTableScroll('ttk-gl-app-saleDetailed-rpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
               
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
            let bodyHeight = body.offsetHeight
            if(y != pre.y){
                bodyHeight=bodyHeight- header.offsetHeight
            }
            if (bodyHeight > y && y != pre.y) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {                
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            }else {
                return false
            }
        } catch (err) {

        }
    }

    handleTimeLineItem = async(time,disabled) => {
        // this.metaAction.sf('data.other.currentTime', time)
        if(disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)
        this.metaAction.sfs({
            'data.other.currentTime': time,
            'data.searchValue.date_end' : now,
            'data.searchValue.date_start' : now
        })

        // this.initDate(moment(`${year}-${month}`), moment(`${year}-${month}`))
        this.sortParmas()
        this.metaAction.sf('data.other.currentTime', time)
    }

    renderTimeLineVisible = () => {
        // const data = this.metaAction.gf('data.searchValue').toJS()
        const data = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()

        if (data) {
            let startDate = moment(data.date_start).format('YYYY-MM')
            let endDate = moment(data.date_end).format('YYYY-MM')
            let endDateYear = endDate.replace(/-/g, '')
    
            let diffMonth = moment(endDate).diff(moment(startDate),'month')
            if (diffMonth > 36) return false
            return true
        }
    }

    renderTimeLine = (parmasData) => {
        let searchValue = this.metaAction.gf('data.searchValue')

        const currentOrg = this.metaAction.context.get("currentOrg")
        let datas = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }

        const data = parmasData || (searchValue ? this.metaAction.gf('data.searchValue').toJS() : datas)

        // const data = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        if(data) {
            let startDate = moment(data.date_start).format('YYYY-MM')
            let endDate = moment(data.date_end).format('YYYY-MM')
            let endDateYear = endDate.replace(/-/g, '')
            // const currentOrg = this.metaAction.context.get("currentOrg")
            let enabledDate = currentOrg.enabledYear + currentOrg.enabledMonth

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
                timeArr = this.timeLineYearList
            }

            // let currentTime = this.metaAction.gf('data.other.currentTime')

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
                        document.querySelector('.ttk-gl-app-saleDetailed-rpt-body-left').scrollTop = height - document.querySelector('.ttk-gl-app-saleDetailed-rpt-body-left').offsetHeight / 2
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

                            // let isTrue = currentTime ? currentTime == item ? true : false: item == endDateYear
                            let isTrue = currentTime ? currentTime == item ? true : false: startDate == endDate && item == endDateYear
                            
                            // let color = currentTime ?
                            // item < currentTime ? '#FF913A': '#0066B3' : 
                            // startDate == endDate ? 
                            // item < endDateYear ? '#FF913A': '#0066B3' :'#0066B3'

                            let timePeriod = this.metaAction.gf('data.other.timePeriod').toJS()
                            let {minDataPeriod, maxDataPeriod} = timePeriod
                            // let disabled = (!minDataPeriod && !maxDataPeriod) || (Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod))
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
                                    dot={<div className={disabled ? 'yearLabelDis' : 'yearLabel'}><span>{year}</span><Icon type='arrow-down' /></div>}
                                ></Timeline.Item>,
                                <Timeline.Item
                                    className={ disabled ? 'ant-timelineItemDis': isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled':''}
                                    dot={dot}
                                    color={disabled ? '#D9D9D9' : color}
                                    onClick={() => this.handleTimeLineItem(item, disabled)}
                                ><span title={title}>{isTrue ? '' : month}</span></Timeline.Item>]
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
    }
    moreActionOpeate = async () => {
        this.setupClick()
    }

    setupClick = async () => {
        let _this = this
        // LoadingMask.show()
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
        } = await this.webapi.apocRptStatement.getPrintConfig()
        // LoadingMask.hide()        
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'ttk-gl-app-saleDetailed-rpt-print-modal-container',
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
                creator={creator}
                supervisor={supervisor}
                enableddate={enableddate}
                creatorType={creatorType}
                glFrom={true}
                customPrintTime={customPrintTime}
                supervisorType={supervisorType}
                // from = 'saleDetailed'
            />
        })
    }
    export = async() => {
        let list = this.metaAction.gf('data.list').toJS()
        if(list.length == 0){
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            "exportType":0
        }
        await this.webapi.apocRptStatement.export(dateParameters)
    }
    exportAllAccount = async () => {
        const _this = this
        const currency = false
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2 currency={currency} type="导出" callBack={ _this.submitExportOption } />
        })
    }
    submitExportOption = async (form) => {
        //isContinuous false不同项目分页打印 true不同项目连续打印
        let tempWindow
        let { num, currency, currencyId, isOnlyEndNode, isContinuous } = form.getValue()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let name =this.metaAction.gf('data.name')
        let accountId={}
        this.nameData.forEach(element => {
            if(element.codeAndName ==name){
                accountId=element
            }
        })
        let nameChildren = this.metaAction.gf('data.nameChildren')
        let inventoryId=''
        this.nameChildrenData.forEach(element => {
            if(element.name ==nameChildren){
                inventoryId=element
            }
        })
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            "startDate":startDate.replace('-',''),//开始日期
            "endDate":endDate.replace('-',''),//结束日期
            "accountId":accountId.id,//科目ID
            "inventoryId":inventoryId.id,//辅助项ID
            'isContinuous':isContinuous,
            "exportType":2
        }
        let exportAsync = await this.webapi.apocRptStatement.exportAsync(dateParameters),
        asyncStatus,
        asyncResult,
        timer
        this.metaAction.sf('data.loading', true)
        if(exportAsync){
            this.timer = setInterval(async () => {
                asyncStatus = await this.webapi.apocRptStatement.exportAsyncStatus({sequenceNo: exportAsync})
                if(asyncStatus && asyncStatus.matchInitState == 'STATUS_RESPONSE'){
                    //执行成功
                    clearInterval(this.timer)
                    this.metaAction.sf('data.loading', false)
                    let url = JSON.parse(asyncStatus.file)
                    asyncResult = await this.webapi.apocRptStatement.exportAsyncResult(url)
                    return
                }else if(asyncStatus && asyncStatus.matchInitState == 'STATUS_EXCEPTION' || asyncStatus && asyncStatus.matchInitState == 'STATUS_NO_REQUEST'){
                    clearInterval(this.timer)
                    this.metaAction.sf('data.loading', false)
                    return
                }
            },2000)
        }else {
            this.metaAction.sf('data.loading', false)
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '销售明细表', '导出所有科目'])
    }
    submitPrint = async (form) => {
        delete  form.creatorButton
        delete  form.enableddate
        delete  form.supervisorButton
        delete  form.timeOriginal
        delete  form.supervisor
        delete  form.supervisorType
        let res = await this.webapi.apocRptStatement.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')            
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