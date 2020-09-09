import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import config from './config'
import { TableOperate, Select, Button, Modal, Checkbox, PrintOption2, ActiveLabelSelect, Tree, Icon, PrintOption3,Timeline } from 'edf-component'
import moment from 'moment'
import changeToOption from './utils/changeToOption'
import { consts } from 'edf-consts'
import utils from 'edf-utils'
import { LoadingMask, FormDecorator, Table, Pagination ,VirtualTable} from 'edf-component'
import renderColumns from './utils/renderColumns'
import sortBaseArchives from './utils/sortBaseArchives'
import ExportOption from './components/ExportOption'
import * as data from './data'
import ResizablePanels from './components/ResizablePanels'
const Option = Select.Option
const TimelineItem = Timeline.Item

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
        this.treeSelect = utils.throttle(this.treeSelect, 500)
        this.handleTimeLineItem = utils.throttle(this.handleTimeLineItem, 500)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }
        this.width=''
        injections.reduce('init', data)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        this.load()
    }
    getResizeContent = () => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            expandKeys = this.metaAction.gf('data.other.expandKeys').toJS(),
            accountCode = this.metaAction.gf('data.searchValue.accountCode'),
            loading = this.metaAction.gf('data.loading'),
            list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS(),
            tableOption = this.metaAction.gf('data.tableOption').toJS(),
            pagination = this.metaAction.gf('data.pagination').toJS(),
            showTree = this.metaAction.gf('data.other.showTree'),
            treelist = this.metaAction.gf('data.other.treelist') && this.metaAction.gf('data.other.treelist').toJS(),
            tableCon = document.getElementsByClassName('app-detailaccount-rpt-content')?document.getElementsByClassName('app-detailaccount-rpt-content')[0]:'',
            height=tableCon?tableCon.offsetHeight-72:0
        let _this = this    
        let width=this.metaAction.gf('data.other.width'),
        tablekey = this.metaAction.gf('data.other.tablekey')
        return (
            <ResizablePanels showTree = {showTree} initData={width} callBack={_this.submitSortProof}>
                <div className="app-detailaccount-rpt-content-left">
                <div className="app-detailaccount-rpt-content-treeTitle treeTitle1">
                    {this.getTreeTitle(searchValue.accountCode)}
                </div>
                <div className="app-detailaccount-rpt-rightFiexd">
                    <div className="setting setting-box">
                         <Icon
                            name="columnset"
                            fontFamily='edficon'
                            className='columnset'
                            type="youcezhankailanmushezhi"
                            onClick={() => this.showTableSetting({ value: true })}
                        />
                    </div>
                </div>
                <VirtualTable className = "app-detailaccount-rpt-table-Body"
                    style = {{minHeight:height+'px'}}
                    key = { tablekey }
                    subjectWidth = {width}
                    pagination = {false}
                    loading = {loading}
                    id = "app-detailaccount-rpt-Body-id"
                    emptyShowScroll = {true}
                    scroll = { tableOption }
                    allowColResize = {true}
                    tableIsNotRefreshKey = {'detailaccount'}
                    bordered = {true}
                    enableSequenceColumn = {false}
                    dataSource = {list}
                    noDelCheckbox = {true}
                    onResizeEnd = {(e) => this.resizeEnd(e)}
                    columns = {this.tableColumns()}
                    onRow = {function(record){if(record.summary=="本月合计"||record.summary=="本年累计"){return {className: "totalRow"}}else{return {className: ""}}}}
                >

                </VirtualTable>
                 <div className = "app-detailaccount-rpt-footer">
                      <Pagination pageSizeOptions={['50', '100', '150', '200']} 
                    pageSize = {pagination.pageSize}
                    current = {pagination.currentPage}
                    total = {pagination.totalCount}
                    onChange = {this.pageChanged}
                    onShowSizeChange = {this.sizePageChanged}
                    >
                    </Pagination>
                </div>
                </div>
                <div className = "app-detailaccount-rpt-content-right" >
                    <div style = {{display: showTree?"none":'block',height:'100%',background: '#ebebed'}}>
                    <Icon fontFamily='edficon' onClick={this.showTree} style={{ fontSize: '24px', lineHeight: '36px' }} type={showTree?'zhankaile':'shouhuile'}>
                        </Icon>
                    </div>
                    <div style = {{display: showTree?"flex":'none', height:'100%',flexDirection:'column', flex:1,overflowY:'scroll'}}>
                    <div className="app-detailaccount-rpt-content-right-title">
                        <div className="app-detailaccount-rpt-content-treeTitle">
                            {this.getTreeTitle(searchValue.accountCode)}
                        </div>
                        <Icon fontFamily='edficon' onClick={this.showTree} style={{ fontSize: '24px', lineHeight: '36px' }} type={showTree?'zhankaile':'shouhuile'}>
                        </Icon>
                    </div>
                    <Select
                        className = 'app-detailaccount-rpt-content-right-input'
                        optionFilterProp = 'chidren'
                        filterOption = {this.filterOptionSummary}
                        dropdownStyle = {{ zIndex: 10 }}
                        value = {searchValue.accountCode}
                        onChange = {(value) => this.accountlistChange(value, false) }>
                        {this.accountOption()}
                    </Select>
                    <Tree className = 'app-detailaccount-rpt-content-right-tree'
                        type = 'directoryTree'
                        showIcon = {true}
                        switcherIcon = {this.showTreeIcon}
                        onSelect = {this.treeSelect}
                        onExpand = {this.expandedKeys}
                        expandedKeys = {expandKeys}
                        selectedKeys = {this.getDefaultSelectedKey(searchValue.accountCode)}
                    >
                        {this.renderTreeNodes(treelist)}
                    </Tree>
                    </div>
               
                </div>
            </ResizablePanels>
        )
    }
    submitSortProof = async (data) => {
       let res = await this.webapi.person.orgparameterUpdate({ paramKey: 'detailaccountWidth', paramValue: data,id:this.metaAction.gf('data.other.id') })
       this.metaAction.sfs({
        'data.other.width': res.paramValue,
        'data.other.id': res.id
        })
    }
    onTabFocus = async (params) => {
        params = params.toJS()
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        const { quantity, multi} = this.metaAction.gf('data.showCheckbox').toJS()
        // this.checkQuantityAndCurrency()
        if (params.initSearchValue && params.accessType == 1) {
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            const initValue = params.initSearchValue
            const linkInAccountName = params.linkInAccountName
            this.injections.reduce('update', {
                path: 'data.showOption',
                value: {
                    num: false,
                    currency: false
                }
            })
            this.searchValueChange({ ...searchValue, ...initValue }, initValue.accountCode, params.showOption, linkInAccountName)
        } else {
            let currentOrg = this.metaAction.context.get("currentOrg"),
                enabledYM = currentOrg.enabledYear + '-' + currentOrg.enabledMonth

            let other = [
                {
                    path: 'data.enableDate',
                    value: utils.date.transformMomentDate(enabledYM)
                },{
                    path: 'data.showOption',
                    value: { num: num, currency: currency }
                }]
            this.injections.reduce('updateArr', other)
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.searchValueChange(searchValue,null,this.metaAction.gf('data.showOption').toJS(), null, this.metaAction.gf('data.showCheckbox').toJS())
            await this.accountlistChange(searchValue.accountCode,true)
        }
        const org =await this.webapi.person.orgparameter({paramKey: "detailaccountWidth"})
        if (!org.length) {
            const width=250+''
			const create = await this.webapi.person.orgparameterCreate({ paramKey: 'detailaccountWidth', paramValue: width})
			if (create) {
				const orgTwo = await this.webapi.person.orgparameter({ paramKey: 'detailaccountWidth' })
                if (orgTwo && orgTwo.length){
                    this.metaAction.sfs({
                        'data.other.width': orgTwo[0].paramValue,
                        'data.other.id': orgTwo[0].id
                    })
                }
			}
        }else{
            this.metaAction.sfs({
                'data.other.width': org[0].paramValue,
                'data.other.id': org[0].id
            })
        }
        const res = await this.webapi.person.getExistsDataScope()
        this.metaAction.sf('data.other.timePeriod', fromJS(res || {}))
        
    }

    renderCheckBox1 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox" onChange={this.setSearchField}>
                <Checkbox value="1" >仅显示末级科目</Checkbox>
            </Checkbox.Group>
        )
    }
    load = async () => {
        let {initSearchValue,showOption,showCheckbox} = this.component.props
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        }

        let pageParam = {
            moduleKey: 'app-detailaccount-rpt',
            resourceKey: 'app-detailaccount-rpt-table',
        }
        let list = [
            this.webapi.person.getPageSetting(pageParam),
            this.webapi.person.getExistsDataScope()
        ]
        const res = await Promise.all(list)

        if (res) {
            let response = res[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if (response.pageSize) {
                page.pageSize = response.pageSize
            }
            let timePeriod = res[1]||{}
            this.metaAction.sfs({
                'data.pagination': fromJS(page),
                'data.other.timePeriod': fromJS(timePeriod)
            })
        }
        const org =await this.webapi.person.orgparameter({paramKey: "detailaccountWidth"})
        if (!org.length) {
            const width=250+''
			const create = await this.webapi.person.orgparameterCreate({ paramKey: 'detailaccountWidth', paramValue: width})
			if (create) {
				const orgTwo = await this.webapi.person.orgparameter({ paramKey: 'detailaccountWidth' })
                if (orgTwo && orgTwo.length){
                    this.metaAction.sfs({
                        'data.other.width': orgTwo[0].paramValue,
                        'data.other.id': orgTwo[0].id
                    })
                }
			}
        }else{
            this.metaAction.sfs({
                'data.other.width': org[0].paramValue,
                'data.other.id': org[0].id
            })
        }
        await this.getEnableDate()
        this.initDate()
        this.getInitOption()
       
    }

    linkInTab = async () => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()

        const initValue = this.component.props.initSearchValue
        const linkInAccountName = this.component.props.linkInAccountName
        const params = this.sortParmas(null, null, 'get')
        const res = await this.webapi.person.queryForCurrency(
            utils.sortSearchOption(params, null, ['accountCode', 'currencyId'])
        )
        window.accountlist = res.accountList
        if (initValue.currencyId != undefined) {
            initValue.currencyId = initValue.currencyId.toString()
        }
        const showOption = this.component.props.showOption
        const showCheckbox = this.component.props.showCheckbox
        const accountList = window.accountlist 
        if (res.dataList && res.dataList.data) {
            this.injections.reduce('load', res.dataList, undefined )
        } else {
            const page = this.metaAction.gf('data.pagination').toJS()
            this.injections.reduce('load', {
                columnDtos:res.columnDtos,
                data: [],
                page: {
                    ...page,
                    currentPage: 1,
                    totalCount: 0,
                    totalPage: 1
                }
            }, undefined )
        }
        this.checkQuantityAndCurrency(accountList)
        if(showOption){
            this.injections.reduce('update', {
                path: 'data.showOption',
                value: {
                    num: showOption.num,
                    currency: showOption.currency
                }
            })
        }
        await this.accountlistChange(initValue.accountCode, true)
        await this.searchValueChange({ ...searchValue, ...initValue }, initValue.accountCode, showOption, linkInAccountName)
    }

    initDate = () => {
        if (this.component.props.initData && this.component.props.initData.date) {
            const str = this.component.props.initData.date
            this.injections.reduce('updateArr', [{
                path: 'data.searchValue.date_start',
                value: utils.date.transformMomentDate(str)
            }, {
                path: 'data.searchValue.date_end',
                value: utils.date.transformMomentDate(str)
            }])
            this.injections.reduce('updateArr', [{
                path: 'data.searchValue.init_date_start',
                value: utils.date.transformMomentDate(str)
            }, {
                path: 'data.searchValue.init_date_end',
                value: utils.date.transformMomentDate(str)
            }])
        }
    }

    getEnableDate = async () => {
        const result = await this.webapi.person.getDisplayDate()
        const { DisplayDate, EnableDate } = result
        this.injections.reduce('updateArr', [
            {
                path: 'data.searchValue.date_start',
                value: utils.date.transformMomentDate(DisplayDate)
            },
            {
                path: 'data.searchValue.date_end',
                value: utils.date.transformMomentDate(DisplayDate)
            },
            {
                path: 'data.enableDate',
                value: utils.date.transformMomentDate(EnableDate)
            },
            {
                path: 'data.searchValue.init_date_start',
                value: utils.date.transformMomentDate(DisplayDate)
            },
            {
                path: 'data.searchValue.init_date_end',
                value: utils.date.transformMomentDate(DisplayDate)
            }
        ])
        return
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
        window.detailAccountList = null
        window.accountlist = null
    }
    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }
    queryAccountSubjects = async ()=> {
        let res = await this.webapi.person.queryAccountList()
        if(res){
            window.detailAccountList = res.glAccounts
            this.metaAction.sf('data.other.isQueryAccountSubjects', true)
        }  
    }
    // 初始化基础信息选项
    getInitOption = async () => {
        if (this.component.props.initSearchValue) {
            await this.linkInTab()
        } else {
            const params = this.sortParmas(null, null, 'get')
            const res = await this.webapi.person.queryForCurrency(
                utils.sortSearchOption(params, null, ['accountCode', 'currencyId'])
            )
            this.injections.reduce('tableLoading', false)
            //科目
            // const moreSearchAccountList = await this.webapi.person.queryAccountList({})
            //科目级次
            const accountDepthList = await this.webapi.person.queryAccountDepth()
            const accountList = res.accountList
            const result = await this.webapi.person.queryBaseArchives()
            const group = sortBaseArchives(result)
            this.initBaseArchives(group)
            if (res.dataList && res.dataList.data) {
                this.injections.reduce('load', res.dataList, undefined)
            } else {
                const page = this.metaAction.gf('data.pagination').toJS()
                this.injections.reduce('load', {
                    columnDtos:res.columnDtos,
                    data: [],
                    page: {
                        ...page,
                        currentPage: 1,
                        totalCount: 0,
                        totalPage: 1
                    }
                }, undefined )
            }
            this.injections.reduce('normalSearchChange', {
                path: 'data.searchValue.accountCode',
                value: accountList[0] ? accountList[0].code : ''
            })
            // 检测数量和外币checkbox是否显示
            this.checkQuantityAndCurrency()
            const currencyList = changeToOption(res.currencyList, 'name', 'id')
            this.injections.reduce('initOption', { ...res, currencyList , accountDepthList})
            if (accountList.length > 0) {
                this.accountlistChange(accountList[0].code, true)
            }
        }
        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }
    // 检测数量和外币checkbox是否显示
    checkQuantityAndCurrency = async () => {
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
        this.injections.reduce('updateArr', [
            {
                path: 'data.showOption',
                value: { num: false, currency: false }
            },{
                path: 'data.showCheckbox',
                value: { quantity: quantity, multi: multi }
            }
        ])
    }
    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }

    clearValueChange = async (value) => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.metaAction.sfs({
            'data.searchValue.currencyId': '0',
            'data.searchValue.noDataNoDisplay': ['1'],
            'data.searchValue.date_start': searchValue.init_date_start,
            'data.searchValue.date_end': searchValue.init_date_end,
            'data.searchValue.onlyShowEndAccount': fromJS([]),
            'data.searchValue.beginAccountGrade': 1,
            'data.searchValue.endAccountGrade': 5,
            'data.searchValue.beginAccountCode': undefined,
            'data.searchValue.endAccountCode': undefined,
            'data.other.gradeStyleStatus':false
        })            
    }

    accountlistChange = async (value, noSend, showOption, isUpdate, showCheckbox, isShowOptionsChange) => {
        const accountlist = window.accountlist
        let item = accountlist.find(index => {
            return index.code == value
        })
        const res = await this.webapi.person.queryBaseArchives(item)
        const group = sortBaseArchives(res)
        this.initBaseArchives(group)
        let { num, currency } = showOption ? showOption : {}
        let {quantity, multi} = showCheckbox ? showCheckbox : {}
        const currency1 = this.metaAction.gf('data.searchValue.currencyId')
        if(isUpdate == 'update' && !showCheckbox && isShowOptionsChange == 'showOptionsChange'){
            const params = this.sortParmas(null, null, 'get')
            const res = await this.webapi.person.queryForCurrency(
                utils.sortSearchOption(params, null, ['accountCode', 'currencyId'])
            )
            value = res.accountList[0].code
            item = accountlist.find(index => {
                return index.code == value
            })
            const response = await this.webapi.person.queryBaseArchives(item)
            const group = sortBaseArchives(response)
            this.initBaseArchives(group)
            let assistForm = this.metaAction.gf('data.assistForm').toJS(), groupStr = '', whereStr = ''
            let searchValue = this.metaAction.gf('data.searchValue').toJS()
            if (assistForm.assistFormOption.length > 0) {
                groupStr = assistForm.assistFormOption[0].key
            }
            this.sortParmas(null,null,null,'moreSearch',value)
            searchValue.groupStr = groupStr
            searchValue.whereStr = whereStr
            let other = [
                {
                    path: 'data.assistForm.initOption',
                    value: group
                },{
                    path: 'data.assistForm.assistFormOption',
                    value: group
                },{
                    path: 'data.assistForm.activeValue',
                    value: ''
                },{
                    path: 'data.searchValue.groupStr',
                    value: groupStr
                },{
                    path: 'data.searchValue.whereStr',
                    value: whereStr
                },{
                    path: 'data.searchValue',
                    value: fromJS(searchValue)
                }
            ]
            this.injections.reduce('updateArr', other)
        }

        let getExpandKeys = this.getExpandKeys(accountlist, value)
        this.injections.reduce('normalSearchChange', { path: 'data.searchValue.accountCode', value, getExpandKeys })
        if (isUpdate !== 'update') {
            const res = await this.webapi.person.queryBaseArchives(item)
            const group = sortBaseArchives(res)
            let assistForm = this.metaAction.gf('data.assistForm').toJS(), groupStr = '', whereStr = ''
            let searchValue = this.metaAction.gf('data.searchValue').toJS()
            // this.initBaseArchives(group)
            if (assistForm.assistFormOption.length > 0) {
                groupStr = assistForm.assistFormOption[0].key
            }
            if (assistForm.activeValue) {
                whereStr = assistForm.activeValue
            }
            searchValue.groupStr = groupStr
            searchValue.whereStr = whereStr?groupStr+':'+whereStr:''
            let other = [
                {
                    path: 'data.assistForm.initOption',
                    value: group
                },{
                    path: 'data.assistForm.assistFormOption',
                    value: group
                }, {
                    path: 'data.assistForm.assistFormSelectValue',
                    value: assistForm.assistFormSelectValue
                },{
                    path: 'data.assistForm.activeValue',
                    value: whereStr
                },{
                    path: 'data.searchValue.groupStr',
                    value: groupStr
                }, {
                    path: 'data.searchValue.whereStr',
                    value: whereStr?groupStr+':'+whereStr:''
                }, {
                    path: 'data.searchValue',
                    value: fromJS(searchValue)
                }]
            this.injections.reduce('updateArr', other)
        }

        if (noSend != true) {
            this.sortParmas(null, null, null, null, null, null, null, isUpdate)
        }
    }

    onPanelChange = (value) => {
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // 修改逻辑简单搜索也需要重新
        this.searchValueChange({ ...searchValue, ...date })
        this.metaAction.sf('data.other.currentTime', '')
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date, query: data.query }
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

    renderCheckBox = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox">
                <Checkbox value="1">科目无发生不显示本月合计、本年累计</Checkbox>
            </Checkbox.Group>
        )
    }
    renderActiveSearch = () => {
        if (this.metaAction.gf('data.assistForm')) {
            const { assistFormSelectValue, assistFormOption, activeValue } = this.metaAction.gf('data.assistForm').toJS()
            // 找到排名靠前的并且选中的辅助项
            const one = assistFormOption.find(item => {
                return assistFormSelectValue.includes(item.key)
            })
            if (assistFormOption.length == 0) {
                return null
            } else {
                return <ActiveLabelSelect
                    key={Math.random()}
                    option={assistFormOption}
                    selectLabel={one && one.key ? one.key : ''}
                    value={activeValue}
                    onChange={this.activeLabelSelectChange}
                />
            }

        }
    }
    initBaseArchives = (data,falg) => {
        let assistForm = this.metaAction.gf('data.assistForm')?this.metaAction.gf('data.assistForm').toJS():''
        if(assistForm&&assistForm.assistFormSelectValue&&!falg){
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.assistFormOption',
                    value: data
                }
            ])
        }else{
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.assistFormOption',
                    value: data
                }, {
                    path: 'data.assistForm.assistFormSelectValue',
                    value: []
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
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
        if (index != -1) {
            if (value) {
                initOption[index].value = [value]
            } else {
                initOption[index].value = []
            }
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()

        searchValue.groupStr = label
        if (value) {
            searchValue.whereStr = `${label}:${value}`
        } else {
            searchValue.whereStr = ``
        }
        this.injections.reduce('update', {
            path: 'data.assistForm',
            value: {
                initOption: init,
                assistFormOption: sortInitOption,
                assistFormSelectValue: assistFormSelectValue,
                activeValue: value
            }
        })
        this.searchValueChange(searchValue, null, {
            initOption: init,
            assistFormOption: sortInitOption,
            assistFormSelectValue: assistFormSelectValue,
            activeValue: value
        })
    }
    searchValueChange = async (value, accountCode, showOption, linkInAccountName, showCheckbox) => {
        let prevValue = this.metaAction.gf('data.searchValue').toJS()
        let arr = []
        this.injections.reduce('searchUpdate', { ...prevValue, ...value })
        let page = this.metaAction.gf('data.pagination').toJS()
        // if(value.currencyId !== '0' && value.currencyId !== '1'){
        //     //除了综合本位币和人民币外 ，其余默认都勾选
        //     this.metaAction.sf('data.showOption.currency', true)
        // }else{
        //     this.metaAction.sf('data.showOption.currency', false)
        // }
        if (prevValue) {
            if (prevValue.noDataNoDisplay && prevValue.noDataNoDisplay.length > 0) {
                _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '高级查询选择科目无发生不显示本月合计、本年累计'])
            }
            if (prevValue.currencyId == '0' || prevValue.currencyId == '1') {
                _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '高级查询选择综合本位币或人民币'])
            } else {
                _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '高级查询选择外币'])
            }
        }
        this.sortParmas(
            { ...prevValue, ...value },
            { currentPage: 1, pageSize: page.pageSize },
            null,
            'moreSearch',
            accountCode,
            showOption,
            linkInAccountName, 'update',showCheckbox
        )

        this.injections.reduce('update', { path: 'data.other.currentTime', value: ''})
    }

    sortParmas = (search, pages, type, from, accountCode, showOption, linkInAccountName, isUpdate, showCheckbox, isShowOptionsChange) => {

        let {currency, num} = this.metaAction.gf('data.showOption').toJS()
        // 处理搜索参数
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
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
        searchValue.isCalcMulti = currency
        searchValue.isCalcQuantity = num
        searchValue.onlyShowEndAccount = searchValue.onlyShowEndAccount && searchValue.onlyShowEndAccount.length > 0 ? 'true' : 'false'
        searchValue.noDataNoDisplay = searchValue.noDataNoDisplay && searchValue.noDataNoDisplay.length > 0 ? '1' : '0'

        const page = utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage'])
        if (type == 'get') {
            return { ...searchValue, page }
        }
        this.requestData({ ...searchValue, page }, from, accountCode, showOption, linkInAccountName, isUpdate, showCheckbox,isShowOptionsChange)
        
    }
    pageChanged = async (current, pageSize) => {
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
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.sortParmas(null, page)
        let request = {
            moduleKey: 'app-detailaccount-rpt',
            resourceKey: 'app-detailaccount-rpt-table',
            settingKey:"pageSize",
            settingValue: page.pageSize
        }
        await this.webapi.person.setPageSetting([request])
    }
    // 针对没有的科目做处理
    checkAccountCode = (accountCode) => {
        if (!accountCode) {
            return { accountCode: null }
        }
        const accountList = window.accountlist // this.metaAction.gf('data.other.accountlist').toJS()
        const item = accountList.find(item => {
            return item.code == accountCode
        })
        if (item) {
            return { accountCode }
        }
        const arr = accountCode.split(' ')
        if (arr.length == 1) {
            return { accountCode }
        } else {
            return {
                accountCode: arr[0],
                linkInAccountName: arr[1]
            }
        }
    }

    requestData = async (params, from, accountCode, showOption, linkInAccountName, isUpdate, showCheckbox, isShowOptionsChange) => {
       
        if (from == 'moreSearch') {
            const params = this.sortParmas(null, null, 'get')
            const preAccountCode = this.metaAction.gf('data.searchValue.accountCode')
            params.accountCode = accountCode ? accountCode : (preAccountCode ? preAccountCode : null)
            let loading = this.metaAction.gf('data.loading')
            if (!loading) {
                this.injections.reduce('tableLoading', true)
            }

            let res
            if (accountCode || showOption || linkInAccountName) {
                res = await this.webapi.person.queryForCurrency(params)
                if (res.currencyList) {
                    const currencyList = changeToOption(res.currencyList, 'name', 'id')
                    this.injections.reduce('update', {
                        path: 'data.other.currencylist',
                        value: currencyList
                    })
                }
            } else {
                const obj = this.checkAccountCode(params.accountCode)
                params.accountCode = obj.accountCode
                if (obj.linkInAccountName) {
                    accountCode = obj.accountCode
                    linkInAccountName = obj.linkInAccountName
                }
                res = await this.webapi.person.queryForAccount(params)
            }

            this.injections.reduce('tableLoading', false)
            const accountList = res.accountList
            accountCode = this.initAccountCode(accountList, accountCode, linkInAccountName)

            this.injections.reduce('updateArr', [
                {
                    path: 'data.searchValue.accountCode',
                    value: accountCode
                },{
                    path: 'data.other.treelist',
                    value: fromJS(data.transData(res.accountList))
                }
            ])
            window.accountlist = res.accountList

            this.accountlistChange(accountCode, true, showOption, isUpdate, showCheckbox,isShowOptionsChange)
            if (res && res.currencyList) {
                const currencyList = changeToOption(res.currencyList, 'name', 'id')
                this.injections.reduce('initOption', { ...res, currencyList })
            }
            if (res.dataList && res.dataList.data) {
                this.injections.reduce('load', res.dataList, undefined )
            } else {
                const page = this.metaAction.gf('data.pagination').toJS()
                this.injections.reduce('load', {
                    columnDtos:res.columnDtos,
                    data: [],
                    page: {
                        ...page,
                        currentPage: 1,
                        totalCount: 0,
                        totalPage: 1
                    }
                }, undefined)
            }
            // 针对科目和李彪显示不同一的情况做处理
            if (accountCode != preAccountCode) {
                this.sortParmas()
            }
        } else {
            // 针对accountCode不存在情况下不发送请求
            if (!params.accountCode) {
                return
            }
            // 如果科目不存在的话不发送请求
            const accountlist = window.accountlist // this.metaAction.gf('data.other.accountlist').toJS()

            let loading = this.metaAction.gf('data.loading')
            if (!loading) {
                this.injections.reduce('tableLoading', true)
            }
            const obj = this.checkAccountCode(params.accountCode)
            params.accountCode = obj.accountCode
            const res = await this.webapi.person.getList(params)
            if (res ) {
                let tableOption = this.metaAction.gf('data.tableOption'),
                    rightTable = document.getElementsByClassName('app-detailaccount-rpt-content') && document.getElementsByClassName('app-detailaccount-rpt-content')[0],
                    rightTableWidth = rightTable && rightTable.scrollWidth 

                if(rightTable) {
                    tableOption = tableOption.set('x', rightTableWidth )
                }
                this.metaAction.sf('data.tableOption', fromJS(tableOption))

            }
            this.injections.reduce('tableLoading', false)
            this.injections.reduce('load', res, undefined )
        }

        // clearTimeout(this._resizetimer)
        // this._resizetimer = setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }

    // 增加一条逻辑在新请求到的accountList中如果原来的accountCode 存在的情况下保持原有的accountCode
    // 第二个参数表示总账跳转过来就已经携带科目
    initAccountCode = (accountList, accountCode, linkInAccountName) => {
        if (typeof accountCode == 'string' && !linkInAccountName) {
            return accountCode
        }
        const preAccountCode = this.metaAction.gf('data.searchValue.accountCode')
        const item = accountList.find(index => {
            return index.code == preAccountCode
        })
        if (item) {
            return preAccountCode
        } else if (linkInAccountName) {
            return `${accountCode} ${linkInAccountName} `
        } else {
            return accountList && accountList[0] ? accountList[0].code : ''
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
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, null, 'get')
        const { currency, num } = this.metaAction.gf('data.showOption').toJS()

        let newData = {
            accountCode: data.accountCode,
            beginDate: data.beginDate,
            currencyId: data.currencyId,
            endDate: data.endDate,
            noDataNoDisplay: data.noDataNoDisplay,
            isCalcMulti: currency,
            isCalcQuantity: num,
            groupStr: data.groupStr,
            whereStr: data.whereStr
        }
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/gldetailrpt/share',
                params: newData
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
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, null, 'get')
        const { currency, num } = this.metaAction.gf('data.showOption').toJS()
        let newData = {
            accountCode: data.accountCode,
            beginDate: data.beginDate,
            currencyId: data.currencyId,
            endDate: data.endDate,
            noDataNoDisplay: data.noDataNoDisplay,
            isCalcMulti: currency,
            isCalcQuantity: num,
            printAll: false,
            groupStr: data.groupStr,
            whereStr: data.whereStr
        }
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                shareUrl: '/v1/gl/report/gldetailrpt/share',
                period: `${newData.beginDate.replace('-', '.')}-${newData.endDate.replace('-', '.')}`,
                params: newData,
                mailShareUrl: '/v1/gl/report/gldetailrpt/sendShareMail',
                printShareUrl: '/v1/gl/report/gldetailrpt/print',
            })
        })
        _hmt && _hmt.push(['_trackEvent', '明细账', '总账', '邮件分享'])
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
        const params = this.sortParmas(null, null, 'get')
        if (!params.accountCode) {
            this.metaAction.toast('warn', '当前没有可导出数据')
            return
        }

        const { currency, num } = this.metaAction.gf('data.showOption').toJS()
        params.isCalcMulti = currency
        params.isCalcQuantity = num
        params.exportAll = false
        params.exportType = 0
        await this.webapi.person.export(params)
        _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '导出当前科目'])
    }

    print = async () => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        } else {

            const params = this.sortParmas(null, null, 'get')
            if (!params.accountCode) {
                this.metaAction.toast('warn', '当前没有可打印数据')
                tempWindow.close()
                return
            }
            const { currency, num } = this.metaAction.gf('data.showOption').toJS()
            params.isCalcMulti = currency
            params.isCalcQuantity = num
            params.printAll = false
            params.printType = 0
            params.tempWindow = tempWindow
            await this.webapi.person.print(params)
        }

        _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '打印当前科目'])
    }
    batchPrint = async () => {
        let browserType = utils.environment.getBrowserVersion(),
        tempWindow
        if(browserType.ismode360){
            tempWindow = window.open()
            tempWindow.document.body.innerHTML="<div'>正在打印中，请稍等...</div>"
        }
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            if(browserType.ismode360 && tempWindow){
                tempWindow.close()
            }
            return
        } else {
            this.metaAction.sf('data.loading', true)
            const params = this.sortParmas(null, null, 'get')
            if (!params.accountCode) {
                this.metaAction.toast('warn', '没有可打印数据')
                this.metaAction.sf('data.loading', false)
                return
            }
            params.printType = 1
            let exportAsync = await this.webapi.person.printAsync(params),
            asyncStatus,
            asyncResult,
            timer
            if(exportAsync){
                this.timer = setInterval(async () => {
                    asyncStatus = await this.webapi.person.printAsyncStatus({sequenceNo: exportAsync})
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
                        asyncResult = await this.webapi.person.PrintAsyncResult(url)
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
        }
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
            printAuxData,
            bottomPadding,
            contentFontSize,
            customPrintTime,
            creator,
            supervisor,
            creatorType,
            supervisorType,
            printCover,
            samePage
        } = await this.webapi.person.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 740,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-detailaccount-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                printAuxData={printAuxData}
                landscape={landscape}
                type={type}
                width={width}
                samePage = {samePage}
                from = 'detailaccount'
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
        let res = await this.webapi.person.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')
    }

    showOptionsChange = async(key, value) => {
        this.injections.reduce('showOptionsChange', {
            path: `data.showOption.${key}`,
            value: value
        })

        let params = this.sortParmas(null, null, 'get')
        params.accountCode = null

        let response = await this.webapi.person.queryForAccount(params)

        if (response) {
            window.accountlist = response.accountList

            this.injections.reduce('updateArr', [
            {
                path: 'data.searchValue.accountCode',
                value: response.accountList[0] ?  response.accountList[0].code : ''
            },{
                path: 'data.other.treelist',
                value: fromJS(data.transData(response.accountList))
            }])

            let accountlist = window.accountlist
            let item = accountlist.find(index => {
                return index.code == response.accountList[0].code
            })
            if (item) {
                this.updateAssistDisplay(item)
            }
            if (response.dataList && response.dataList.data) {
                this.injections.reduce('load', response.dataList, undefined )
            } else {
                const page = this.metaAction.gf('data.pagination').toJS()
                this.injections.reduce('load', {
                    columnDtos:response.columnDtos,
                    data: [],
                    page: {
                        ...page,
                        currentPage: 1,
                        totalCount: 0,
                        totalPage: 1
                    }
                }, undefined )
            }
        }

        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }

    updateAssistDisplay = async (item) => {
        const res = await this.webapi.person.queryBaseArchives(item)
        const group = sortBaseArchives(res)
        this.initBaseArchives(group)
        let assistForm = this.metaAction.gf('data.assistForm').toJS(), groupStr = '', whereStr = ''
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        if (assistForm.assistFormOption.length > 0) {
            groupStr = assistForm.assistFormOption[0].key
        }
        searchValue.groupStr = groupStr
        searchValue.whereStr = whereStr
        let other = [
            {
                path: 'data.assistForm.initOption',
                value: group
            },{
                path: 'data.assistForm.assistFormOption',
                value: group
            },{
                path: 'data.assistForm.activeValue',
                value: ''
            },{
                path: 'data.searchValue.groupStr',
                value: groupStr
            }, {
                path: 'data.searchValue.whereStr',
                value: whereStr
            }, {
                path: 'data.searchValue',
                value: fromJS(searchValue)
            }]
        this.injections.reduce('updateArr', other)
    }

    isTotalData = (record) => {
        return record.summary == '本月合计' || record.summary == '本年累计' ? 'total_data_weight' : ''
    }
    rowSpan1 = (text, record, index,child) => {
        return {
            children:<div  className='div'><div className='renderNameDiv' title={text}>{text}</div></div>,
        }
    }
    rowSpan2 = (text, row, index,columnName) => {
        // const num = this.calcRowSpan(row.accountDate, columnName, index)
       
        // const obj = {
        //     children: columnName=='docTypeAndCode'?
        //     (
        //         <div  className='div'><div className='renderNameDiv' title={text}><a href="javascript:;"  onClick={() => this.openMoreContent(row.docId)}>
        //             <span className='renderNameDiv' >{text}</span>
        //         </a></div></div>
        //     ):
        //     // <span title={text}>{text}</span>
        //     <div  className='div'><div className='renderNameDiv' title={text}><span className='renderNameDiv' >{text}</span></div></div>,
        //     props: {
        //         rowSpan: num,
        //     },
        // }
        
        if(columnName=='docTypeAndCode'){
            return <div  className='div'><div className='renderNameDiv' title={text}><a href="javascript:;"  onClick={() => this.openMoreContent(row.docId)}>
            <span className='renderNameDiv' >{text}</span>
            </a></div>
            </div>
        }else{
            return <div  className='div'><div className='renderNameDiv' title={text}><span className='renderNameDiv' >{text}</span></div></div>
        }
        
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
            code='detailAccountSelectCountCurrency'
        } else if (showOption.num && !showOption.currency) {
            code='detailAccountSelectCount'
        } else if (!showOption.num && showOption.currency) {
            code='detailAccountCurrency'
        } else {
            code='detailAccountNoSelect'
        }
		const customDecideDisVisibleList = this.metaAction.gf('data.other.customDecideDisVisibleList') && this.metaAction.gf('data.other.customDecideDisVisibleList').toJS()
		let columnDetails
        let visibleList=[]
        let paramsList=[]
        let columnDto = this.metaAction.gf('data.other.columnDto') ? this.metaAction.gf('data.other.columnDto').toJS() : undefined
        params.code = code
        params.columnDetails.forEach(item1=>{
            let list={}
            list.customDecideVisible=item1.customDecideVisible
            list.fieldName=item1.fieldName
            list.isVisible=item1.isVisible
            list.width=item1.width
            paramsList.push(list)
        })
        if(columnDto.length>0){
            columnDto.forEach((item,index)=>{
                let falg =false
                params.columnDetails.forEach(item1=>{
                    if(item1.fieldName==item.fieldName){
                        falg=true  
                    }
                })
                if(!falg){
                    let list={}
                    list.customDecideVisible=item.customDecideVisible
                    list.fieldName=item.fieldName
                    list.isVisible=item.isVisible
                    list.width=item.width
                    visibleList.push(list)
                }
            })
        }
        columnDetails = paramsList.concat(visibleList)
		params.columnDetails = columnDetails
		let res = await this.webapi.person.save(params)
        this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))

    }
    tableColumns = () => {
        let columnDto
        columnDto=this.metaAction.gf('data.other.columnDto').toJS()
        const showOption = this.metaAction.gf('data.showOption').toJS()
        let parentList=[]
        let listWidth=0
        let treeWidth = this.metaAction.gf('data.other.width')
        let showTree = this.metaAction.gf('data.other.showTree')
        let quantity = this.metaAction.gf('data.showOption.num'),
        currency = this.metaAction.gf('data.showOption.currency')
        if (columnDto && columnDto.length > 0) {
            columnDto.forEach(item => {
                if(item.isVisible){
                    if (!item.parentId) {
                        let obj = {
                            width: item.width,
                            fieldName: item.fieldName,
                            title: item.caption,
                            // title:(item.fieldName == 'accountDate'||item.fieldName == 'docTypeAndCode')?<div style={{top:'2px'}} className='ellipsis'><div style={{ position:"absolute"}} title={item.caption}>{item.caption}</div></div>:item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            id: item.id,
                            // code: code,
                            name: item.fieldName,
                            isVisible: item.customDecideVisible,
                            customDecideVisible: item.customDecideVisible
                        }
                        if (item.fieldName == 'accountDate') {
                            // obj.fixed ='left'
                            obj.align ='center'
                            obj.render = (text, record, index) => this.rowSpan2(text, record, index, 'accountDate')
                        } else if (item.fieldName == 'docTypeAndCode') {
                                // obj.fixed ='left'
                                obj.align ='center'
                                obj.render = (text, record, index) => this.rowSpan2(text, record, index, 'docTypeAndCode')
                        }
                        else if (item.fieldName == 'amountDr'||item.fieldName == 'amountCr'||item.fieldName == 'balanceAmount') {
                            obj.align ='right'
                        }else if (item.fieldName == 'balanceDirection') {
                            obj.align ='center'
                        }
                        parentList.push(obj)
                    }
                }
            })
            let list = this.converseTree(columnDto, parentList)
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
                rightTable = document.getElementsByClassName('app-detailaccount-rpt-content') && document.getElementsByClassName('app-detailaccount-rpt-content')[0],
                rightTableWidth = showTree?rightTable && rightTable.scrollWidth - 8-treeWidth:rightTable && rightTable.scrollWidth - 8,
                scrollx = listWidth
            if(rightTable && listWidth && rightTableWidth) {
                if(listWidth < rightTableWidth) {
                    scrollx = rightTableWidth
                }
                
                tableOption = tableOption.set('x', scrollx )
                this.metaAction.sf('data.tableOption', tableOption)
                let tableHeader = document.getElementsByClassName('ant-table-thead') && document.getElementsByClassName('ant-table-thead')[0]
                if(tableHeader) tableHeader.style.width = scrollx 
            } 
            if(list.length==3){
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
                    // width: rightTableWidth - listWidth,
                    isVisible: true,
                    customDecideVisible: true
                })
            }
            return list
        }
    }
        /**
     * 更新栏目
     */
    showTableSetting = async ({ value, data }) => {    
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: value
        })  
        if(value==false){
            const showOption = this.metaAction.gf('data.showOption').toJS()
            let code;
            if (showOption.num && showOption.currency) {
                code='detailAccountSelectCountCurrency'
            } else if (showOption.num && !showOption.currency) {
                code='detailAccountSelectCount'
            } else if (!showOption.num && showOption.currency) {
                code='detailAccountCurrency'
            } else {
                code='detailAccountNoSelect'
            }
            const ts = this.metaAction.gf('data.other.ts')
            const columnSolution = await this.webapi.person.findByParam({ code: code })
            let columnSolutionId = columnSolution.id
            const columnDetail = await this.webapi.person.updateWithDetail({
                "id": columnSolutionId,
                "columnDetails": this.combineColumnProp(data),
                ts: ts
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
        let code;
        if (showOption.num && showOption.currency) {
            code='detailAccountSelectCountCurrency'
        } else if (showOption.num && !showOption.currency) {
            code='detailAccountSelectCount'
        } else if (!showOption.num && showOption.currency) {
            code='detailAccountCurrency'
        } else {
            code='detailAccountNoSelect'
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
                if (child.fieldName == 'docTypeAndCode'||child.fieldName == 'accountDate'||child.fieldName == 'balanceDirection') {
                    child.align='center'
                   
                }else  if (child.fieldName == 'quantityDr'||child.fieldName == 'amountDr'
                 || child.fieldName == 'amountCr'
                 || child.fieldName == 'origAmountDr'|| child.fieldName == 'origAmountCr'
                 || child.fieldName == 'priceDr'|| child.fieldName == 'quantityCr'
                 || child.fieldName == 'priceCr'|| child.fieldName == 'balanceQuantity'
                 || child.fieldName == 'balancePrice'
                 || child.fieldName == 'balanceOrigAmount'|| child.fieldName == 'balanceAmount') {
                    child.align='right'
                }
                let id = child.id
                let renderFunc
                let childObj = {
                    id: id,
                    key: child.fieldName,
                    width: child.width,
                    title:<span style={{top:'2px',textAlign:'center'}}> {child.caption}</span>,
                    dataIndex: child.fieldName,
                    align:child.align,
                    fieldName: child.fieldName,
                    parentId: child.parentId,
                    name: child.fieldName,
                    isVisible: child.customDecideVisible,
                    customDecideVisible: child.customDecideVisible,
                    // render : (text, record, index,child) => this.rowSpan1(text, record, index,child)
                }
                // if (child.fieldName !== 'accountName' && child.fieldName !== 'accountCode') {
                //     childObj.align = 'center'
                // }
                if (child.customDecideVisible == true) {
                    if (childObj.parentId == parentItemId) {
                        childrenList.push(childObj)
                    }
                }
            }
            parentItem.children = childrenList
        }
        return parentList
    }
    getRenderType = () => {
        let type
        const showOption = this.metaAction.gf('data.showOption').toJS()
        const { multi } = this.metaAction.gf('data.showCheckbox').toJS()
        const currencyId = this.metaAction.gf('data.searchValue.currencyId')
        if (!showOption.num && !showOption.currency) {
            type = 0
        } else if (showOption.num && !showOption.currency) {
            type = 1
        } else if (!showOption.num && showOption.currency) {
            type = 4
        } else if (showOption.num && showOption.currency) {
            type = 5
        }
        if (type == 4 && currencyId == -1) {
            type = 2
        } else if (type == 5 && currencyId == -1) {
            type = 3
        }
        return type
    }

    // 计算不可选中的时间
    calDisableDate = (current) => {
        const enableDate = this.metaAction.gf('data.enableDate')
        return false
    }

    openMoreContent = async (docId) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: docId } })
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('app-detailaccount-rpt-table-Body', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
            }
            this.metaAction.sf('data.other.tablekey', Math.random())
        }, 200)
        
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        
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
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                const tableCons = document.getElementsByClassName(contaienr)[0]
                $(tableCons.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
                
                $(tableCons.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
            }
        } else if (bodyHeight < y && pre.y != null) {
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                $(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '' });

                $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
            }
            this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                const tableCons = document.getElementsByClassName(contaienr)[0]
                $(tableCons.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '' });

                $(tableCons.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
            }
        } else if (bodyHeight > y && y == pre.y) {
            
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                $(tableCon.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });

                $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
            }
            this.metaAction.sf(path, fromJS({ ...pre, y }))
            if (!!window.ActiveXObject || "ActiveXObject" in window){
                const tableCons = document.getElementsByClassName(contaienr)[0]
                $(tableCons.getElementsByClassName('ant-table-fixed-right')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });

                $(tableCons.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
            }
        }else {
            return false
        }
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
    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }

        return true
    }
    getSearchCard = (childrenRef) => {
        this.searchCard = childrenRef
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
            'data.searchValue.noDataNoDisplay': fromJS(fieldsValue.noDataNoDisplay)
        })
    }
    treeSelect = async (e) => {
        if (!e || !e.length) return
        LoadingMask.show()

        this.injections.reduce('update', { path: 'data.searchValue.accountCode', value: e[0] })
        const result = await this.webapi.person.queryBaseArchives()
        const group = sortBaseArchives(result)
        this.initBaseArchives(group,true)
        await this.accountlistChange(e[0], true)

        const params = this.sortParmas(null, null, 'get')

        params.accountCode = e[0]
        const res = await this.webapi.person.getList(params)
        this.injections.reduce('load', res, e)
        LoadingMask.hide()
        // clearTimeout(this._resizetimer)
        // this._resizetimer = setTimeout(() => {
        //     this.onResize()
        // }, 50)
    }

    //展示树
    renderTreeNodes = (data) => {
        if (!data) return <div></div>;
        let expandedKeys = this.metaAction.gf('data.other.expandKeys').toJS()
        return data.map((item) => {
            if (item.children) {
                return (
                    <Tree.TreeNode icon={expandedKeys.indexOf(item.code) != -1 ? this.showTreeIcon('folder-open') : item.isEndNode?this.showTreeIcon('profile'):this.showTreeIcon('folder')} title={item.codeAndName} key={item.code} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode icon={this.showTreeIcon('profile')} title={item.codeAndName} key={item.code} dataRef={item} />;
        });
    }

    

    getDefaultSelectedKey = (keys) => {
        let arr = []
        arr.push(keys)
        return arr
    }

    getTreeTitle = (selectKeys) => {
        let titleText = '', list = window.accountlist

        if (list && list.length && selectKeys) {
            let itemList = list.filter(o => o.code == selectKeys)

            if (itemList && itemList.length > 0) {
                titleText = itemList[0].codeAndName
            }
        }

        return '科目：' + titleText
    }

    getExpandKeys = (list, selectKeys) => {
        let arr = []
        list.map(o => {
            if (selectKeys.indexOf(o.code) != -1 && o.code.length < selectKeys.length) {
                arr.push(o.code)
            }
        })
        return arr
    }

    expandedKeys = (e) => {
        this.metaAction.sf('data.other.expandKeys', fromJS(e))
    }

    showTree = () => {
        let showTree = this.metaAction.gf('data.other.showTree')
        this.metaAction.sf('data.other.showTree', !showTree)
        // let tableOption = this.metaAction.gf('data.tableOption'),
        //     treeWidth = this.metaAction.gf('data.other.width'),
        //     rightTable = document.getElementsByClassName('app-detailaccount-rpt-content') && document.getElementsByClassName('app-detailaccount-rpt-content')[0],
        //     rightTableWidth = rightTable && rightTable.scrollWidth 
           
        // if(rightTable) {
        //     tableOption = tableOption.set('x', rightTableWidth)
        // }
        // console.log(rightTableWidth, treeWidth)
        // this.metaAction.sf('data.tableOption', fromJS(tableOption))
        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
        
    }

    showTreeIcon = (type) => () => {
        return (<Icon style={{ fontSize: '12px', paddingRight: '5px' }} type={type}></Icon>)
    }

    checkBoxisShow = (key) => {
        const showCheckbox = this.metaAction.gf('data.showCheckbox').toJS()
        return { display: showCheckbox[key] ? 'inline-block' : 'none' }
    }

    printAllAccount = async () => {
        const _this = this
        const currency = this.metaAction.gf('data.other.currencylist').toJS()
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2 currency={currency} type="打印" callBack={_this.submitPrintOption} />
        })
    }

    submitPrintOption = async (form) => {
        let browserType = utils.environment.getBrowserVersion(),
        tempWindow
        if(browserType.ismode360){
            tempWindow = window.open()
            tempWindow.document.body.innerHTML="<div'>正在打印中，请稍等...</div>"
        }
        // let tempWindow = window.open()
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            if(browserType.ismode360 && tempWindow){
                tempWindow.close()
            }
            // tempWindow.close()
            return
        } else {
            this.metaAction.sf('data.loading', true)
            let { num, currency, currencyId, isOnlyEndNode } = form.getValue()
            if (currencyId == '0') {
                currency = false
            } else {
                currency = true
            }
            const params = this.sortParmas(null, null, 'get')
            params.currencyId = currencyId
            if (!params.accountCode) {
                this.metaAction.toast('warn', '没有可打印数据')
                return
            }
            // params.tempWindow = tempWindow
            params.isCalcMulti = currency
            params.isCalcQuantity = num
            params.printAll = true
            params.printType = 2
            params.isOnlyEndNode = isOnlyEndNode
            let exportAsync = await this.webapi.person.printAsync(params),
            asyncStatus,
            asyncResult,
            timer
            if(exportAsync){
                this.timer = setInterval(async () => {
                    asyncStatus = await this.webapi.person.printAsyncStatus({sequenceNo: exportAsync})
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
                        asyncResult = await this.webapi.person.PrintAsyncResult(url)
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
        }

        _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '打印所有科目'])
    }
    exportAllAccount = async () => {
        const _this = this
        const currency = this.metaAction.gf('data.other.currencylist').toJS()
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2 currency={currency} type="导出" callBack={_this.submitExportOption} />
        })
    }
    batchExport = async () => {
        let _this = this
        this.metaAction.modal('show', {
            title: '批量导出',
            width: 500,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-sumaccount-rpt-print-modal-container',
            children: <ExportOption
                // samePage = {samePage}
                callBack={_this.submitExport}
            />
        })

    }
    submitExport = async (form) => {
        // console.log(form)
        // let { isAllInOne } = form.getValue()
        // const params = this.sortParmas(null, null, 'get')
        // if (!params.accountCode) {
        //     this.metaAction.toast('warn', '没有可导出数据')
        //     return
        // }
        // params.isAllInOne = isAllInOne
        // params.exportType = 1
        // console.log(params)
        // debugger
        // await this.webapi.person.export(params)

        this.metaAction.sf('data.loading', true)
        let { isAllInOne } = form.getValue()
        const params = this.sortParmas(null, null, 'get')
        if (!params.accountCode) {
            this.metaAction.toast('warn', '没有可导出数据')
            return
        }
        params.isAllInOne = isAllInOne
        params.exportType = 1
        console.log(params)
        let exportAsync = await this.webapi.person.exportAsync(params),
        asyncStatus,
        asyncResult,
        timer
        if(exportAsync){
            timer = setInterval(async () => {
                asyncStatus = await this.webapi.person.exportAsyncStatus({sequenceNo: exportAsync})
                if(asyncStatus && asyncStatus.matchInitState == 'STATUS_RESPONSE'){
                    //执行成功
                    clearTimeout(timer)
                    this.metaAction.sf('data.loading', false)
                    asyncResult = await this.webapi.person.exportAsyncResult(JSON.parse(asyncStatus.file))
                }else if(asyncStatus && asyncStatus.matchInitState == 'STATUS_EXCEPTION' || asyncStatus && asyncStatus.matchInitState == 'STATUS_NO_REQUEST'){
                    clearTimeout(timer)
                    this.metaAction.sf('data.loading', false)
                    return
                }
            },2000)
        }else {
            this.metaAction.sf('data.loading', false)
            return
        }
        // await this.webapi.person.export(params)
        _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '批量导出'])
    }
    submitExportOption = async (form) => {
        this.metaAction.sf('data.loading', true)
        let { num, currency, currencyId, isOnlyEndNode, isAllInOne } = form.getValue()
        if (currencyId == '0') {
            currency = false
        } else {
            currency = true
        }
        const params = this.sortParmas(null, null, 'get')
        params.currencyId = currencyId
        if (!params.accountCode) {
            this.metaAction.toast('warn', '没有可导出数据')
            return
        }
        params.isCalcMulti = currency
        params.isCalcQuantity = num
        params.exportAll = true
        params.isAllInOne = isAllInOne
        params.isOnlyEndNode = isOnlyEndNode
        params.exportType = 2
        let exportAsync = await this.webapi.person.exportAsync(params),
        asyncStatus,
        asyncResult,
        timer
        if(exportAsync){
            timer = setInterval(async () => {
                asyncStatus = await this.webapi.person.exportAsyncStatus({sequenceNo: exportAsync})
                if(asyncStatus && asyncStatus.matchInitState == 'STATUS_RESPONSE'){
                    //执行成功
                    clearTimeout(timer)
                    this.metaAction.sf('data.loading', false)
                    asyncResult = await this.webapi.person.exportAsyncResult(JSON.parse(asyncStatus.file))
                }else if(asyncStatus && asyncStatus.matchInitState == 'STATUS_EXCEPTION' || asyncStatus && asyncStatus.matchInitState == 'STATUS_NO_REQUEST'){
                    clearTimeout(timer)
                    this.metaAction.sf('data.loading', false)
                    return
                }
            },2000)
        }else {
            this.metaAction.sf('data.loading', false)
            return
        }
        // await this.webapi.person.export(params)
        _hmt && _hmt.push(['_trackEvent', '财务', '明细账', '导出所有科目'])
    }

    handleTimeLineItem = async(time, disabled) => {
        if(disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)

        let date = {
            date_end: moment(`${year}-${month}`),
            date_start: moment(`${year}-${month}`)
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // 修改逻辑简单搜索也需要重新
        this.searchValueChange({ ...searchValue, ...date })

        this.injections.reduce('updateArr', [
            // {
            //     path: 'data.other.currentTime',
            //     value: time
            // },
            {
                path: 'data.searchValue.date_end',
                value: now
            },{
                path: 'data.searchValue.date_start',
                value: now
            }
        ])

    }

    renderTimeLineVisible = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return false
        return true
        // let threeYear = moment(startDate).add(3, 'year').format('YYYY-MM')
        // threeYear = threeYear.replace(/-/g, '')
        // if (endDateYear > threeYear) {
        //     return false
        // }
        // return true
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
                    let leftdom = document.getElementsByClassName('app-detailaccount-rpt-body-left')
                    if (leftdom && leftdom.length > 0) {
                        leftdom[0].scrollTop = height - leftdom[0].offsetHeight / 2
                    }

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

    getAccountOptionList = () => {
        if (window.startAccountList) {
            return changeToOption(window.startAccountList, 'codeAndName', 'code')
        } else {
            return []
        }
    }

    accountOption = () => {
        let data = window.accountlist

        if (data) {
            return data.map(d => <Option title={d.codeAndName} key={d.code} className={'app-detailaccount-rpt-account-select-item'}>{d.codeAndName}</Option>)
        }
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
