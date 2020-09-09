import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS } from 'immutable'
import { LoadingMask, Timeline,Icon, PrintOption3 } from 'edf-component'
import extend from './extend'
import config from './config'
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
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

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
            moduleKey: 'app-proof-of-collect-rpt',
            resourceKey: 'app-proof-of-collect-rpt-table',
        }
        // let response = await this.webapi.apocRptStatement.getPageSetting(pageParam)
        // let page = this.metaAction.gf('data.pagination').toJS()
        // if(response.pageSize){
        //     page.pageSize = response.pageSize
        // }
        // this.metaAction.sf('data.pagination', fromJS(page)) 

        let list = [
            this.webapi.apocRptStatement.getPageSetting(pageParam),
            this.webapi.apocRptStatement.getExistsDataScope()
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
        }

        this.getEnableDate().then((parmas) => {
            this.sortParmas()
        })       
    }
    //页签切换
    onTabFocus = () => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
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
            const calDate = this.initDate(currentPeriod, currentPeriod)
            this.metaAction.sf('data.period', currentPeriod) 
            
        }
    }
        //初始化选择时间
        initDate = (enableddate, displayDate) => {
            let enableDate = utils.date.transformMomentDate(enableddate)
            let now = utils.date.transformMomentDate(displayDate)
            let date_start, date_end
            if (enableDate.format('YYYY') == now.format('YYYY')) {
                date_start = enableDate
                date_end = now
            } else {
                date_start = utils.date.transformMomentDate(now.format('YYYY'))
                date_end = now
            }
            this.injections.reduce('updateArr', [{
                path: 'data.searchValue.date_end',
                value: date_end
            }, {
                path: 'data.searchValue.date_start',
                value: date_start
            }])
            // if (type == 'get') {
                return {
                    begindate: date_start.format('YYYY-MM'),
                    enddate: date_end.format('YYYY-MM'),
                }
            // }
            
        }
    onPanelChange = (value) => {
        this.initDate(value[0], value[1])
        this.sortParmas()
        this.metaAction.sf('data.other.currentTime', '')
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
    //导出
    export = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }

        this.sortParmas('get').then((parmas) => {
            // LoadingMask.show()
            this.webapi.apocRptStatement.export(parmas)
            // LoadingMask.hide()
        })
    }
    //打印
    print = async () => {
        
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let tempWindow = window.open()
        this.sortParmas('get').then((parmas) => {
            parmas.tempWindow = tempWindow
            // LoadingMask.show()
            this.webapi.apocRptStatement.print(parmas)
            // LoadingMask.hide()
        })
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
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 320,
            // footer: null,
            closable: false,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store
            })
        })
    }

    mailShare = () => {
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 470,
            closable: false,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store
            })
        })
    }
    colSpan0 = (text, row, index) => {
        let obj
        if (row && row.accountName == '合计') {
            obj = {
                children: <span title={row.accountName}>{row.accountName}</span>,
                props: {
                    colSpan: 2,
                }
            }
        } else {
            obj = {
                children: <span title={text}>{text}</span>,
                props: {
                    colSpan: 1
                }
            }
        }
        return obj
    }
    colSpan1 = (text, row, index) => {
        let obj
        if (row && row.accountName == '合计') {
            obj = {
                props: {
                    colSpan: 0,
                }
            }
        } else {
            obj = {
                children: <span title={text}>{text}</span>,
                props: {
                    colSpan: 1
                }
            }
        }
        return obj
    }
    tableColumns = () => {
        let arr = renderColumns()
        arr[0].render = this.colSpan0
        arr[1].render = this.colSpan1
        return arr
    }
    pageChanged = async () => {
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
            moduleKey: 'app-proof-of-collect-rpt',
            resourceKey: 'app-proof-of-collect-rpt-table',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        await this.webapi.apocRptStatement.setPageSetting([request])
    }
    sortParmas = async (type,page) => {
        if(!page){
            page = this.metaAction.gf('data.pagination').toJS()
        }
        // const voucherMoment = moment(this.metaAction.gf('data.period'))
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        let startDate = searchValue.date_start.format('YYYY-MM'),
        endDate = searchValue.date_end.format('YYYY-MM'),
        dateParameters = {
            startYear: startDate.split('-')[0],
            startMonth: startDate.split('-')[1],
            endYear: endDate.split('-')[0],
            endMonth: endDate.split('-')[1],
            pageSize: page.pageSize,
            currentPage: page.currentPage
        }
        if (type == 'get') {
            return { ...dateParameters }
        }
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        // const response = await this.webapi.apocRptStatement.query(dateParameters)
        // this.injections.reduce('tableLoading', false)
        // this.injections.reduce('load', response)

        const res = await Promise.all([
            this.webapi.apocRptStatement.query(dateParameters),
            this.webapi.apocRptStatement.getExistsDataScope()
        ])

        this.injections.reduce('load', res[0])
        this.metaAction.sfs({
            'data.loading': false,
            'data.other.timePeriod': fromJS(res[1] || {})
        })

        setTimeout(() => {
            this.onResize()
        }, 20)

    }
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
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
                this.getTableScroll('app-proof-of-collect-rpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
               
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

        this.initDate(moment(`${year}-${month}`), moment(`${year}-${month}`))
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
                        document.querySelector('.app-proof-of-collect-rpt-body-left').scrollTop = height - document.querySelector('.app-proof-of-collect-rpt-body-left').offsetHeight / 2
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
        } = await this.webapi.apocRptStatement.getPrintConfig()
        LoadingMask.hide()        
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-proof-of-collect-rpt-print-modal-container',
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
                creator={creator}
                supervisor={supervisor}
                enableddate={enableddate}
                creatorType={creatorType}
                glFrom={true}
                customPrintTime={customPrintTime}
                supervisorType={supervisorType}
                callBack={_this.submitPrint}
                from = 'proofOfCollect'
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