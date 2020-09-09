import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { TableOperate, Icon, PrintOption, ExportOption, FormDecorator, Spin, DataGrid, TableSort} from 'edf-component'
import utils from 'edf-utils'
import moment from 'moment'
import SortProof from './components/SortProof'
import RedDashed from './components/RedDashed'
import renderDataGridCol from './components/fixedDataTable'
import config from './config'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import ChangeCreator from'./components/changeCreator'
import changeToOption from './utils/changeToOption'
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
        this.changeSipmleDate = false
        
        injections.reduce('init')
        if (this.component.props.initSearchValue) {
            if (this.component.props.initSearchValue.date_end || this.component.props.initSearchValue.date_start) {
                this.changeSipmleDate = true
            }
            this.linkInPage(this.component.props.initSearchValue)
        } else {
            this.load()
        }
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
    }

    onTabFocus = async (params) => {
        if (params) {
            params = params.toJS()
        }
        if (params && params.accessType == 1 && params.initSearchValue) {
            this.linkInPage(params.initSearchValue)
        } else {
            
            // await this.initDate()
            this.sortParmas()
        }
    }    

    onFieldFocus = (targetData, sourceData = []) => {  
        if (targetData.length != sourceData.length) { 
            this.injections.reduce('update', { path: 'data.other.accountList', value: fromJS(changeToOption(sourceData, 'codeAndName', 'id')) })
        }        
    }
   
    linkInPage = (initSearchValue) => {
        const {
            accountId, //--科目ID
            endCode,	 //--终止凭证号
            startCode, //--起始凭证号
            date_end, //期间终止
            date_start, //期间起始
            docIds, //--凭证ID列表
            summary, //--摘要
            voucherState, //--单据状态
            sourceVoucherTypeId, //--单据类型 -- 单据来源
            simpleCondition //简单查询
        } = initSearchValue
        this.injections.reduce('update', {
            path: 'data.searchValue',
            value: {
                accountId, //--科目ID
                endCode,	 //--终止凭证号
                startCode, //--起始凭证号
                date_end, //期间终止
                date_start, //期间起始
                docIds, //--凭证ID列表
                summary, //--摘要
                voucherState, //--单据状态
                sourceVoucherTypeId, //--单据类型 -- 单据来源
                simpleCondition, //简单查询
            }
        })
        this.sortParmas(null, null, null, 'init', true)
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        if (enabledMonth && enabledYear) {
            this.injections.reduce('update', {
                path: 'data.other.enableddate',
                value: utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
            })
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

    onResize = (type) => {
        console.log('-------resize---------')
        const table = document.getElementsByClassName('app-proof-of-list-Body')[0];
        if (table) {
            let h = table.offsetHeight , //头＋尾＋表头＋滚动条
                w = table.offsetWidth;
            this.injections.reduce('setTableOption', { x: w, y: h });
        } else {
            setTimeout(() => {
                this.onResize();
            }, 100);
        }
    }

    refreshBtnClick = () => {
        this.sortParmas()
    }

    getColumnsItem = (type, width) => {
        const data = this.metaAction.gf('data').toJS()
        const columns = [{
            title: (
                <TableSort
                    title="日期"
                    sortOrder={data.sort.userOrderField == "voucherDate" ? data.sort.order : null}
                    handleClick={e => this.sortChange("voucherDate", e)}
                />
            ),
            width: width - 1,
            dataIndex: 'voucherDate',
            key: 'voucherDate',
            className: 'table_center',
            detailListName: 'entrys',
            render: (text, record, index) => {
                return (
                    <span className="app-proof-of-list-td-con">
                        <span title={this.transformThoundsNumber(text, 'voucherDate')}>{this.transformThoundsNumber(text, 'voucherDate')}</span>
                    </span>
                )
            }
        }, {
            title: (
                <TableSort
                    title="凭证字号"
                    sortOrder={data.sort.userOrderField == "docCode" ? data.sort.order : null}
                    handleClick={e => this.sortChange("docCode", e)}
                />
            ),
            width: width - 1,
            className: 'table_center',
            dataIndex: 'docTypeAndCode',
            key: 'docTypeAndCode',
            detailListName: 'entrys',
            render: (text, record, index) => {
                return (
                    <span className="app-proof-of-list-td-con">
                    <a
                        href="javascript:;"
                        onClick={() => this.openMoreContent(record.docId, false)}
                        className="table-needDel"
                        title={text}>{text}
                    </a>
                </span>
                )
            }
            // render: this.rowSpan2
        }]
        return columns.find(item => {
            return item.dataIndex == type
        })
    }

    needAlignType = (key) => {
        const right = ['amountSum', 'origAmount', 'amountDr', 'price', 'amountCr']
        const left = ['summary', 'accountCodeName', 'currencyAndExchangeRate', 'sourceVoucherCode', 'creator', 'auditor']
        const center = ['quantity', 'attachedNum', 'voucherStateName', 'unitName']
        let className = right.includes(key) ? 'right' : left.includes(key) ? 'left' : 'center'
        return className
    }
    renderBody = () => {
        const list = this.metaAction.gf("data.list").toJS();
        const loading = this.metaAction.gf("data.loading");
        return this.renderTable()
        // return (
        //     <Spin tip="数据加载中..." delay={500} spinning={loading}>
                
        //         { !loading && list && list.length > 0
        //             ? this.renderTable()
        //             : null}
        //     </Spin>
        // );
    }
    renderTable = () => {
        let list = this.metaAction.gf('data.list').toJS() 
        let loading = this.metaAction.gf('data.loading')
        let tableKey = this.metaAction.gf('data.tableKey')
        let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS()
        let selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        const colOption = {
            dataSource: list,
            isResizable: true,
            flexGrow: 0,
            selectedRowKeys
        };
        return (
            <DataGrid
            className={'app-proof-of-list-Body-table'}
            loading={loading}
            key={tableKey}
            headerHeight={37}
            rowHeight={37}
            footerHeight={0}
            isRenderDatagridCol = {true}
            rowsCount={(list || []).length}
            columns={this.renderColumns()}
            colOption = {colOption}
            height={tableOption.y}
            style={{ width: "100%", height: tableOption.y + "px" }}
            ellipsis
            rowHeightGetter={::this.rowHeightGetter}
            // rowClassNameGetter={::this.rowClassNameGetter}
            // onVerticalScroll={::this.onVerticalScroll}
            isColumnResizing={true}
            selectedRowKeys
            onColumnResizeEnd={::this.onColumnResizeEndCallback}
            >

            </DataGrid>
        )
    }
    onColumnResizeEndCallback = async (newColumnWidth, columnKey) => {
        let tableSettingData =
            this.metaAction.gf("data.other.columnDto").toJS() || []
        let params = {}
        let data = tableSettingData.map(item => {
            if (item.fieldName === columnKey) {
                item.width = newColumnWidth;
            }
            return item;
        });
        const code = this.metaAction.gf('data').toJS().other.code
        params.code = code
        params.columnDetails = data
        let res = await this.webapi.docManage.batchUpdate(params)
        this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))
    }
    rowHeightGetter = (index) => {
        const tableSource = this.metaAction.gf('data.list').toJS(),
            row = tableSource[index]
        return 37 * row.entrys.length
    }
    renderColumns = () => {
        const tableSetting = this.metaAction.gf('data.other.columnDto').toJS()
        const dataSource = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS()
        let selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        const colOption = {
            dataSource,
            isResizable: true,
            flexGrow: 0,
            selectedRowKeys
        };
        let code = this.metaAction.gf('data').toJS().other.code
        let arr = []
        tableSetting.forEach(data => {
            let item = this.getColumnsItem(data.fieldName, data.width)
            if (!data.isVisible) {
                return
            }
            if (item) {
                arr.push(item)
            } else if (data.isHeader == true) {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    width: data.width,
                    code: code,
                    align: this.getAlign(data.fieldName, data.isHeader),
                    detailListName: 'entrys',
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    render: (text, record, index) => {
                        return (
                            <div style={{padding: '0 8px'}}>{
                                data.fieldName == 'amountSum'?utils.number.format(text, 2):text
                            }</div>
                        )
                    }
                })
            } else {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    width: data.width,
                    code: code,
                    align: this.getAlign(data.fieldName, data.isHeader),
                    dataIndex: data.fieldName,
                    detailListName: 'entrys',
                    // className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    render: (text, record, index) =>
                            this.renderCell(text, record, index, data.fieldName)
                })
            }
        })
        arr.push({
            title: (
                <Icon
                    name="columnset"
                    fontFamily='edficon'
                    className='app-proof-of-list-columnset'
                    type="youcezhankailanmushezhi"
                    onClick={() => this.showTableSetting({ value: true })}
                />
            ),
            key: 'voucherState1',
            dataIndex: 'voucherState1',
            fixed: 'right',
            align: 'center',
            detailListName: 'entrys',
            className: 'table_fixed_width',
            width: 109,
            render: (text, record, index) => (
                <span>
                <TableOperate
                    viewClick={() => this.openMoreContent(record.docId, false)}
                    editClick={() => this.openMoreContent(record.docId, true)}
                    deleteClick={() => this.delModal(record.docId, record.ts)}
                    noteClick={() => this.operateNote(record.note ? record.note : '')}
                    submitNote={(value) => this.submitNote(record.docId, record.ts, value)}
                    status={record.voucherState == consts.VOUCHERSTATUS_Approved ? 1 : 2}
                    copyClick={() => this.copyDoc([record.docId], 'singleCopy')}
                />
            </span>
            )
        })
        arr.unshift(
            {
                width: 35,
                align: 'center',
                dataIndex: "docId",
                columnType: "check",
                onMenuClick: e =>
                    this.handleMenuClick(e.key, dataSource, selectedRowKeys),
                onSelectChange: keys =>{
                    console.log(keys)
                    this.metaAction.sf(
                        "data.other.selectedRowKeys",
                        fromJS(keys)
                    )
                }
                    
                // getCheckboxProps: (text, record, index) =>
                //     isCheckDisabled && !record.editable ? true : false
            }
        )
        // arr = arr.map(m => renderDataGridCol({ ...colOption, ...m }))
        return arr
    }
    handleMenuClick = (key, data, selectedRowKeys) => {
        console.log(key, data, selectedRowKeys)
    }
    getAlign = (columnKey, isHeader) => {
        let align = 'center'
        if(isHeader == true){
            if(columnKey == 'amountSum'){
                align = 'left'
            }
        }else{
            if(columnKey == 'summary' || columnKey == 'accountCodeName'){
                align = 'left'
            }else if(columnKey == 'price' || 
            columnKey == 'origAmount' || 
            columnKey == 'amountDr' || 
            columnKey == 'amountCr' 
            ){
                align = 'right'
            }
        }
        return align
    }
    renderCell = (text, row, index, cellName) => {
        if (!row.entrys) {
            return null;
        }
        let colLen = (row.entrys && row.entrys.length) || 0;
        
        return (
            <div
                className={'proof-editable-table-cell-row '}
                style={{ height: colLen * 37 + "px" }}
            >
                {row.entrys.map((item, mxxh) => {
                    return (
                        item[cellName] == undefined ?
                        <div
                            key={`${index}-${mxxh}-${cellName}`}
                            className={"noproof-cell"}
                        >
                            <span
                                className="cell-span"
                                title={item[cellName]}
                                columnKey={cellName}
                            >
                                
                            </span>
                        </div>:
                        <div
                            key={`${index}-${mxxh}-${cellName}`}
                            className="proof-cell"
                        >
                            <span
                                className="cell-span"
                                title={item[cellName]}
                                columnKey={cellName}
                            >
                                {this.getCellText(item[cellName], cellName)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    getCellText = (text, cellName) => {
       
        if(cellName == 'accountCodeName'){
            return text
        }else{
            return this.transformThoundsNumber(text, cellName)
        }
    }
    transformThoundsNumber = (text, key) => {
        const arr = ['amountCr', 'amountDr', 'origAmount', 'price', 'amountSum', 'quantity', 'amountSum']
        if (arr.includes(key)) {
            if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
                return ''
            }
            if (key == 'price' || key == 'quantity') {
                return utils.number.format(text, 6)
            } else {
                return utils.number.format(text, 2)
            }
        } else {
            return text
        }
    }

    normalTdRender = (text, record, index, key) => {
        return <span className="app-proof-of-list-td-con" title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span>
    }

    normalTdRender2 = (text) => {
        return <span title={text} className="app-proof-of-list-td-con" title={text}>{text}</span>
    }

    // 设置表格固定高度
    // renderDid = ()=>{
    //     try{
    //         let container = document.getElementsByClassName('app-proof-of-list')[0].offsetHeight
    //         let footer = document.getElementsByClassName('app-proof-of-list-footer')[0].offsetHeight
    //         let header = document.getElementsByClassName('mk-search')[0].offsetHeight
    //         let tableHeader = document.getElementsByClassName('ant-table-header')[0].offsetHeight
    //         // 20是padding值
    //         let height = container - header - footer - tableHeader - 20
    //         let prevHeight = this.metaAction.gf('data.tableOption.y')
    //         if( prevHeight == height ){
    //             return
    //         }
    //         // this.injections.reduce('setTableScroll', height)
    //     }catch(err){
    //         // console.log(err) dom 没有发现时会报错
    //     }
    // }
    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date, simpleCondition: data.simpleCondition }
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
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        const code = this.metaAction.gf('data').toJS().other.code
        let res = await this.webapi.docManage.reInitByUser({ code: code })
        await this.sortParmas(null, null, null, 'init')
        const data = this.metaAction.gf('data').toJS()
        this.injections.reduce('settingOptionsUpdate', { visible: false, data: data.other.columnDto })

    }
    showTableSetting = async ({ value, data }) => {
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        const preData = this.metaAction.gf('data.other.columnDto')
        if (value === false) {
            this.injections.reduce('update', {
                path: 'data.other.columnDto',
                value: data
            })
            const columnSolution = await this.webapi.docManage.findByParam({ code: 'docList' })
            if (columnSolution) {
                let columnSolutionId = columnSolution.id
                const ts = this.metaAction.gf('data.other.ts')
                const columnDetail = await this.webapi.docManage.updateWithDetail({
                    "id": columnSolutionId,
                    "columnDetails": this.combineColumnProp(data),
                    ts: ts
                })

                if (columnDetail) {
                    this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail.columnDetails })
                } else {
                    this.metaAction.sf('data.other.columnDto', preData)
                }
            } else {
                this.metaAction.sf('data.other.columnDto', preData)
            }
        }
        else {
            this.injections.reduce('tableSettingVisible', { value, data: data })
        }
    }
    resizeEnd = async (params) => {
        const code = this.metaAction.gf('data').toJS().other.code
        params.code = code
        let columnDto = this.metaAction.gf('data.other.columnDto').toJS()
        columnDto.map(item => {
            if (item.isVisible == false) {
                params.columnDetails.push({
                    isVisible: false,
                    customDecideVisible: false,
                    width: item.width,
                    fieldName: item.fieldName
                })
            }
        })
        let res = await this.webapi.docManage.batchUpdate(params)
        this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))
    }
    load = () => {
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        if (enabledMonth && enabledYear) {
            this.injections.reduce('update', {
                path: 'data.other.enableddate',
                value: utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
            })
        }
        this.sortParmas(null, null, null, 'load')
    }

    //初始化选择时间
    // initDate = async () => {
    //     const changeSipmleDate = this.changeSipmleDate
    //     if (!changeSipmleDate) {
    //         const res = await this.webapi.docManage.getDisplayDate()
    //         this.injections.reduce('updateArr', [
    //             {
    //                 'data.searchValue.date_start': fromJS(utils.date.transformMomentDate(res.DisplayDate))
    //             },
    //             {
    //                 'data.searchValue.date_end': fromJS(utils.date.transformMomentDate(res.DisplayDate))
    //             }
    //         ])
    //     }
    //     // return
    // }

    // 高级搜索确定是简单搜索条件清除
    searchValueChange = (value) => {
        let actionContent
        if (value.accountId) actionContent = actionContent + ' 科目查询'
        if (value.summary) actionContent = actionContent + ' 摘要查询'
        if (value.startCode || value.endCode) actionContent = actionContent + ' 凭证号查询'
        if (value.voucherState) actionContent = actionContent + ' 状态查询'

        _hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '高级查询+' + actionContent])

        let prevValue = this.metaAction.gf('data.searchValue').toJS()
        //时间是必填项不可清空
        if (!value.date_end) {
            value.date_end = moment().endOf('month') //期间终止
        }
        if (!value.date_start) {
            value.date_start = moment().startOf('month') //期间开始
        }
        this.injections.reduce('searchUpdate', { ...prevValue, ...value, simpleCondition: null })
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas({ ...prevValue, ...value, simpleCondition: null }, { ...pages, 'currentPage': 1 })
        this.changeSipmleDate = true
    }
    
    openMonth = async () => {
        let result = await this.metaAction.modal('show', {
            title: '结转制造费用',
            width: 600,
            height: 300,
            okText: null,
            footer: null,
            className: 'monthaccount-xdz-modal',
            children: this.metaAction.loadApp('app-account-monthaccount-xdz', {
                store: this.component.props.store,
                initData: {
                    fromXDZmanufacturing: true
                }
            })
        })
    }

    sortParmas = (search, pages, order, type, noInitDate, tableCheckbox) => {
        // 处理搜索参数
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if (!order) {
            order = this.metaAction.gf('data.sort').toJS()
        }
        if(!search.date_start){
            search.date_start = this.metaAction.gf('data.searchValue.displayDate') && utils.date.transformMomentDate(this.metaAction.gf('data.searchValue.displayDate').toJS())
            search.date_end = this.metaAction.gf('data.searchValue.displayDate') && utils.date.transformMomentDate(this.metaAction.gf('data.searchValue.displayDate').toJS())
        }
        const changeData = {
            'date_start': {
                'startYear': (data) => data ? data.year() : null,
                'startPeriod': (data) => data ? data.month() + 1 : null
            },
            'date_end': {
                'endYear': (data) => data ? data.year() : null,
                'endPeriod': (data) => data ? data.month() + 1 : null
            }
        }
        const searchValue = utils.sortSearchOption(search, changeData)
        const page = utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage'])
        // 简单查询没有值得情况下穿null不要穿''
        if (searchValue.simpleCondition === '') {
            searchValue.simpleCondition = null
        }
        if (searchValue.endCode === '') {
            searchValue.endCode = null
        }
        if (searchValue.startCode === '') {
            searchValue.startCode = null
        }
        if (type == 'get') {
            return { ...searchValue, page, ...order }
        }
        if (type == 'init' || type == 'load') {
            this.initData({ ...searchValue, page, ...order }, noInitDate, tableCheckbox, type)
        }
        else {
            this.requestData({ ...searchValue, page, ...order }, noInitDate, tableCheckbox, type)
        }

    }

    requestData = async (params, noInitDate, tableCheckbox, type) => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const response = await this.webapi.docManage.query(params)
        let dataList = {
            'data.loading': false
        }
        if(type != 'pageChange'){
            dataList['data.tableKey'] = Math.random()
        }
        this.injections.reduce('load', { response }, dataList, tableCheckbox, type)
        // setTimeout(() => {
        //     this.onResize()
        // }, 100)
    }

    initData = async (params, noInitDate, tableCheckbox, type) => {
        const response = await this.webapi.docManage.init(params)
        let dataList = {
            'data.loading': false, 'data.tableKey': Math.random()
        }

        this.injections.reduce('load', { response, noInitDate }, dataList, tableCheckbox, type)
        // setTimeout(() => {
        //     this.onResize()
        // }, 100)
        return response
    }

    //排序发生变化
    sortChange = (key, value) => {
        let params = {
            'userOrderField': value == false ? null : key,
            'order': value == false ? null : value
        }
        const pages = this.metaAction.gf('data.pagination').toJS()
        this.sortParmas(null, { ...pages, 'currentPage': 1 }, params)
        this.injections.reduce('sortReduce', params)
    }

    //分页发生变化
    pageChanged = (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        let len = this.metaAction.gf('data.list').toJS().length
        if (pageSize) {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            page = {
                ...page,
                'currentPage': len == 0 ? 1 : current
            }
        }

        this.sortParmas(null, page, null, 'pageChange', null, {
            path: 'data.other.selectedRowKeys',
            value: []
        })
    }

    // 指定table 以什么字段作为key值
    renderRowKey = (record) => {
        return record.docId
    }

    tableOnchange = async (pagination, filters, sorter) => {
        // const { columnKey, order } = sorter
        // const response = await this.webapi.report.query(sorter)
        // this.injections.reduce('tableOnchange', response.value.details)
    }

    rowSelection = (text, row, index) => {
        return undefined
    }

    // checkboxChange = (arr, itemArr) => {
    //     let newArr = []
    //     //todo
    //     let newItemArr = []
    //     itemArr.map(item => {
            
    //         if (item) {
    //             newItemArr.push(item)
    //             if(item.docId){
    //                 newArr.push(item.docId)
    //             }
    //         }
    //     })
    //     this.injections.reduce('update', {
    //         path: 'data.tableCheckbox',
    //         value: {
    //             checkboxValue: newArr,
    //             selectedOption: newItemArr
    //         }
    //     })

    //     this.selectedOption = newItemArr
    // }

    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }
    makingSort = async () => {
        let params = this.sortParmas(null, null, null, 'get'),
            { date_start, date_end } = this.metaAction.gf('data.searchValue').toJS(),
            date = { year: date_end.year(), period: date_end.month() + 1 },
            startPeriod = `${date_start.year()}-${date_start.month()}`,
            endPeriod = `${date_end.year()}-${date_end.month()}`
        params.noPage = true
        if (startPeriod !== endPeriod) {
            this.metaAction.toast('warning', '自定义排序仅支持单一月份的凭证处理')
            return
        }
        //自定义排序
        let result = await this.metaAction.modal('show', {
            title: '自定义排序',
            width: 1100,
            height: 700,
            okText: null,
            footer: null,
            // bodyStyle: { maxHeight: 600},
            className: 'making-sort',
            children: this.metaAction.loadApp('app-proof-of-list-sort', {
                store: this.component.props.store,
                initData: {
                    //    list: response.dtoList,
                    date,
                    params
                }
            })
        })
        if (result) {
            this.sortParmas()
        }
    }
    delTableItemClick = async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '更多+删除'])
        let selectedOption = this.getNewData()
        // const selectedOption = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        if (selectedOption.length == 0) {
            this.metaAction.toast('warning', '请选择您要删除的数据')
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除凭证',
            content: '确定删除所选凭证？'
        })
        if (!ret) {
            return
        }

        let mapData = new Map()
        // 去下重复 (以防万一)
        selectedOption.forEach(item => {
            if (!mapData.has(item)) {
                mapData.set(item.docId, { docId: item.docId, ts: item.ts })
            }
        })
        let data = []
        for (let value of mapData.values()) {
            data.push(value)
        }
        const res = await this.webapi.docManage.delProof(data)
        if (res.allSuccess) {
            this.metaAction.toast('success', '删除成功!')
        } else {
            this.metaAction.toast('error', `${res.msg}`)
        }

        // 重新请求列表数据
        this.sortParmas(null, null, null, null, null, {
            path: 'data.other.selectedRowKeys',
            value: []
        })
    }

    // 审核
    auditClick = async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '审核'])

        const selectedOption = this.getNewData()
        if (selectedOption.length == 0) {
            this.metaAction.toast('warning', '请选择您要审核的数据!')
            return
        }
        let flag = false
        let data = selectedOption.map(item => {
            if (item.voucherState != consts.VOUCHERSTATUS_Approved) {
                flag = true
            }
            return {
                docId: item.docId,
                ts: item.ts
            }
        })
        if (!flag) {
            return this.metaAction.toast('warn', '当前没有可审核数据!')
        }
        const res = await this.webapi.docManage.auditProof(this.delRepeat(data, 'docId'))
        if (res) {
            this.metaAction.toast('success', res)
        }

        // 重新请求列表数据
        this.sortParmas(null, null, null, null, null, {
            path: 'data.other.selectedRowKeys',
            value: []
        })
    }

    getNewData = () => {
        const checkboxValue = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        let arr = []

        let currentUser = this.getCurrentUser(),
            auditor = currentUser.financeAuditor

        list.map(item => {
            if (checkboxValue.includes(item.docId)) {
                item.auditor = auditor
                arr.push(item)
            }
        })
        return arr
    }

    getCurrentUser = () => {
        return this.metaAction.context.get("currentUser")
    }

    //凭证去重
    delRepeat = (data, code) => {
        const arr = new Map()
        data.map(item => {
            if (!arr.has(item[code])) {
                arr.set(item[code], item)
            }
        })
        const sum = []

        let currentUser = this.getCurrentUser(),
            auditor = currentUser.financeAuditor

        for (let value of arr.values()) {
            value.auditor = auditor
            sum.push(value)
        }

        return sum
    }

    //提交整理凭证信息信息
    submitSortProof = async (form, target) => {
        const data = form.getValue()
        let params = {
            year: data.date.year(),
            period: data.date.month() + 1,
            reorganizeType: data.radio
        }
        const res = await this.webapi.docManage.reorganizeDocCode(params)
        this.sortParmas()
        return this.metaAction.toast('success', '整理凭证号成功!')
    }
    //整理凭证号
    sortProofClick = () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '更多+整理凭证号'])

        let _this = this
        const { date_end } = this.metaAction.gf('data.searchValue').toJS()
        this.metaAction.modal('show', {
            title: '整理凭证号',
            width: 320,
            iconType: null,
            className: 'mk-app-proof-of-list-modal-container',
            children: <SortProof time={date_end} callBack={_this.submitSortProof} />,
            footer: null
        })
    }
    //红冲凭证
    redDashedClick = async () => {
        let _this = this, arr = []
        const { date_end } = this.metaAction.gf('data.searchValue').toJS()
        const selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        if (!selectedRowKeys[0]) {
            this.metaAction.toast('warning', '请选择您要红冲的凭证')
            return
        }
        let selectItem = list.find(item => item.docId == selectedRowKeys[0])
        let maxN = selectItem['voucherDate'];
        for (let i = 1; i < selectedRowKeys.length; i++) {
            let curItem = list.find(item => item.docId == selectedRowKeys[i])
            let cur = curItem['voucherDate'];
            utils.moment.stringToMoment(cur) > utils.moment.stringToMoment(maxN) ? maxN = cur : null;
        }
        let param = {
            year: maxN.split('-')[0],
            period: maxN.split('-')[1]
        }
        const date = await this.webapi.docManage.getRedRushDocPeriod(param)
        this.metaAction.modal('show', {
            title: '红冲凭证',
            width: 320,
            iconType: null,
            className: 'mk-app-proof-of-list-modal-container',
            children: <RedDashed
                callBack={_this.submitRedDashed}
                time={utils.moment.stringToMoment(`${date.year}-${date.period}`)}
                maxMonthlyClosing={date.maxMonthlyClosingPeriod ? `${Number(date.maxMonthlyClosingPeriod) == 12 ? Number(date.maxMonthlyClosingYear) + 1 : date.maxMonthlyClosingYear}-${Number(date.maxMonthlyClosingPeriod) == 12 ? 1 : Number(date.maxMonthlyClosingPeriod) + 1}` : null}
            />,
            footer: null
        })
    }
    batchCopyDoc = () => {
        let _this = this, arr = []
        const { date_end } = this.metaAction.gf('data.searchValue').toJS()
        const selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        if (!selectedRowKeys[0]) {
            this.metaAction.toast('warning', '请选择您要复制的凭证')
            return
        }
        let docIds = []
        for (var i = 0; i < selectedRowKeys.length; i++) {
            docIds.push(selectedRowKeys[i])
        }
        this.copyDoc(docIds, 'batchCopy')
    }
    submitRedDashed = async (form) => {
        const data = form.getValue(),
            docIds = this.metaAction.gf('data.other.selectedRowKeys').toJS()

        let currentUser = this.getCurrentUser(),
            nickname = currentUser.nickname

        let params = {
            year: data.date.year(),
            period: data.date.month() + 1,
            docIds: docIds,
            creator: nickname
        }
        const res = await this.webapi.docManage.redRushDoc(params)
        if (res && res.errorList.length > 0) {
            this.metaAction.toast('warning', this.getErrorMessage(res.errorList))
        } else if (res && res.errorList.length == 0) {
            this.metaAction.toast('success', '红冲成功')
        }
        this.sortParmas()
    }
    getErrorMessage = (message) => {
        return (
            <div>
                {
                    message.map(item => {
                        return (
                            <div>{item}</div>
                        )
                    })
                }
            </div>
        )
    }
    //反审核
    versaAuditClick = async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '更多+反审核'])
        const selectedOption = this.getNewData()
        if (selectedOption.length == 0) {
            this.metaAction.toast('warning', '请选择您要反审核的数据!')
            return
        }
        let flag = false
        let data = selectedOption.map(item => {
            if (item.voucherState == consts.VOUCHERSTATUS_Approved) {
                flag = true
            }
            return {
                docId: item.docId,
                ts: item.ts
            }
        })
        if (!flag) {
            return this.metaAction.toast('warn', '当前没有反审核的数据!')
        }
        const res = await this.webapi.docManage.unAuditBatch(this.delRepeat(data, 'docId'))
        if (res) {
            this.metaAction.toast('success', res)
        }

        // 重新请求列表数据
        this.sortParmas(null, null, null, null, null, {
            path: 'data.other.selectedRowKeys',
            value: []
        })
    }

    newAddProofClick = () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '新增凭证'])

        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '填制凭证',
                'app-proof-of-charge',
                { accessType: 1, initData: { newCertificate: true } }
            )
    }

    insertProofConfirm = (item) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '填制凭证',
                'app-proof-of-charge',
                { accessType: 1, initData: { code: item.docCode, voucherDate: item.voucherDate } }
            )
    }

    getInsertItem = () => {
        const selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        let index = list.find(item => {
            return selectedRowKeys.includes(item.docId)
        })
        return index
    }

    insertProofClick = () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '更多+插入凭证'])

        const selectedRowKeys = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        if (selectedRowKeys.length > 0) {
            let item = this.getInsertItem()
            const _this = this
            this.metaAction.modal('confirm', {
                title: '插入凭证',
                content: `您确定要在凭证[${item.docTypeAndCode}]处插入凭证吗？`,
                onOk() {
                    return _this.insertProofConfirm(item)
                },
                onCancel() { }
            })
        } else {
            this.metaAction.toast('warning', '请选择您要插入凭证的位置!')
        }
    }

    delDocId = async (docId, ts) => {
        const res = await this.webapi.docManage.delSingleDocId({ docId, ts })
        if (res) {
            this.metaAction.toast('success', '删除成功')
        }
        // let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox').toJS()
        // checkboxValue = checkboxValue.filter(item => item != docId)
        // selectedOption = selectedOption.filter(item => item.docId != docId)

        this.sortParmas(null, null, null, null, null, {
            path: 'data.other.selectedRowKeys',
            value: []
        })
    }

    delModal = async (docId, ts) => {
        const _this = this
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '你确定要删除吗？',
            onOk() {
                return _this.delDocId(docId, ts)
            },
            onCancel() { }
        })

        if (ret) {
        }
    }

    openMoreContent = async (docId, edit) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: docId } })
    }

    operateNote = (value) => {
        return value
    }
    submitNote = async (docId, ts, note) => {
        let data
        if (note.length > 100) {
            return
        }
        data = await this.webapi.docManage.updateNote({
            note: note,
            ts: ts,
            docId: docId
        })
        this.sortParmas()
    }

    operateCol = (text, record, index) => {
        const { voucherState, docId } = record
        const num = this.calcRowSpan(docId, 'docId', index)
        const obj = {
            children: (
                <span>
                    <TableOperate
                        viewClick={() => this.openMoreContent(docId, false)}
                        editClick={() => this.openMoreContent(docId, true)}
                        deleteClick={() => this.delModal(docId, record.ts)}
                        noteClick={() => this.operateNote(record.note ? record.note : '')}
                        submitNote={(value) => this.submitNote(docId, record.ts, value)}
                        status={voucherState == consts.VOUCHERSTATUS_Approved ? 1 : 2}
                        copyClick={() => this.copyDoc([docId], 'singleCopy')}
                    />
                </span>
            ),
            props: {
                rowSpan: num,
            }
        }
        return obj
    }

    copyDoc = async (docIds, copyType) => {
        let okText = copyType == 'batchCopy' ? '全部保存' : '保存',
            className = copyType == 'batchCopy' ? 'batchCopyDoc-modal' : 'singleCopyDoc-modal',
            result

    if (copyType == 'batchCopy') {
        result = await this.metaAction.modal('show', {
            title: '复制凭证',
            width: 1200,
            okText: okText,
            bodyStyle: { paddingBottom: '0px' },
            className: 'batchCopyDoc-modal',
            children: this.metaAction.loadApp('app-proof-of-charge-copy', {
                store: this.component.props.store,
                initData: {
                    type: 'copyDoc',
                    copyType: copyType,
                    copyDocIds: docIds
                }
            })
        })
    } else {
        result = await this.metaAction.modal('show', {
            title: '复制凭证',
            width: 1200,
            okText: okText,
            bodyStyle: { paddingBottom: '0px' },
            className: 'singleCopyDoc-modal',
            children: this.metaAction.loadApp('app-proof-of-charge-copy', {
                store: this.component.props.store,
                initData: {
                    type: 'copyDoc',
                    copyType: copyType,
                    copyDocIds: docIds
                }
            })
        })
    }
    if (result) {
        this.sortParmas()
    }
}
handlerResult = async (docId) => {
    return docId
}
componentWillUnmount = () => {
    if (this.dateDom) {
        this.dateDom.removeEventListener('click', this.rangePickerClick)
    }
    if (this.props && this.props.isFix === true) return
    const win = window
    if (win.removeEventListener) {
        win.removeEventListener('resize', this.onResize, false)
    } else if (win.detachEvent) {
        win.detachEvent('onresize', this.onResize)
    } else {
        win.onresize = undefined
    }
    window.proofSearchAccountList=null
}

    rangePickerClick = () => {
        this.injections.reduce('update', {
            path: 'data.showPicker',
            value: true
        })
    }

    normalSearchDateChange = (value) => {
        this.changeSipmleDate = true
    }

    normalSearchChange = (path, value, initSearchValue, type) => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '简单查询'])
        let searchParams = this.metaAction.gf('data.searchValue')
        if (searchParams) {
            let params = searchParams.toJS()
            if (initSearchValue) {
                params = { ...params, ...initSearchValue }
            }
            if (path == 'date') {
                params.date_start = value[0]
                params.date_end = value[1]
            } else {
                params[path] = value
            }

            this.injections.reduce('searchUpdate', params)
            const pages = this.metaAction.gf('data.pagination').toJS()
            this.sortParmas(params, { ...pages, 'currentPage': 1 })
            this.changeSipmleDate = true
        }

    }

    rowSpan2 = (text, row, index) => {
        const num = this.calcRowSpan(row.docId, 'docId', index)
        const obj = {
            children: (
                <span className="app-proof-of-list-td-con">
                    <a
                        href="javascript:;"
                        onClick={() => this.openMoreContent(row.docId, false)}
                        className="table-needDel"
                        title={text}
                        data-rol={num}>
                        {text}
                    </a>
                </span>
            ),
            props: {
                rowSpan: num,
            },
        }

        return obj
    }
    rowSpan = (text, row, index, key) => {
        const obj = {
            children: <span className="app-proof-of-list-td-con"><span title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span></span>,
            props: {
                rowSpan: this.calcRowSpan(row.docId, 'docId', index),
            },
        }

        return obj
    }
    import = async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '导入'])
        const params = this.sortParmas(null, null, null, 'get')
        // if (params.startYear == params.endYear && params.startPeriod == params.endPeriod) {
        const ret = await this.metaAction.modal('show', {
            title: '凭证导入',
            width: 560,
            okText: '导入',
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('app-proof-of-list-import', {
                store: this.component.props.store,
                initData: {
                    year: params.startYear,
                    period: params.startPeriod
                }
            }),
        })
        if (ret) {
            this.sortParmas()
        }
        // } else {
        //     this.metaAction.toast('warn', '暂不支持跨月份凭证批量导入')
        //     return
        // }
    }
    close = (ret) => {
		console.log(this.closeTip)
		this.closeTip()
		if (ret) {
			// this.refresh()
		}
	}
    export = async (item) => {

        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '导出'])
        const params = this.sortParmas(null, null, null, 'get')
        const list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可导出数据')
            return
        }
        if (item.key == 'proofList') {
            const { printAuxAccCalc, isPrintQuantity, isPrintMulti } = await this.webapi.docManage.getExportConfig()
            this.metaAction.modal('show', {
                title: '导出',
                width: 380,
                footer: null,
                iconType: null,
                okText: '确定',
                className: 'mk-app-proof-of-list-modal-export-container',
                children: <ExportOption
                    printAuxAccCalc={printAuxAccCalc}
                    isPrintQuantity={isPrintQuantity}
                    isPrintMulti={isPrintMulti}
                    callBack={this.submitExportOption}
                />
            })
        } else {
            params.printAuxAccCalc = true
            params.isPrintQuantity = true
            params.isPrintMulti = true
            params.docIdsStr = this.getPrintDocId()
            params.isImportSchema = true
            await this.webapi.docManage.export(params)
        }
    }

    submitExportOption = async (form, target) => {
        let params = this.sortParmas(null, null, null, 'get')
        params.printAuxAccCalc = form.state.printAccountChecked
        params.isPrintQuantity = form.state.printQuantityChecked
        params.isPrintMulti = form.state.printMultiChecked
        params.docIdsStr = this.getPrintDocId()
        params.isImportSchema = false
        await this.webapi.docManage.export(params)
    }
    
    getPrintDocId = () => {
        const selectedOption = this.metaAction.gf('data.other.selectedRowKeys').toJS()
        if (selectedOption.length == 0) {
            return ''
        }
        let arr = selectedOption.map(item => {
            return item
        })
        return arr.join(',')
    }

    submitPrintOption = async (form, target) => {
        let params = this.sortParmas(null, null, null, 'get')
        let tempWindow = window.open()
        params.tempWindow = tempWindow
        delete params.page
        let option = {
            "type": parseInt(form.state.value),
            "printAuxAccCalc": form.state.printAccountChecked,
            "isPrintQuantity": form.state.printQuantityChecked,
            "isPrintMulti": form.state.printMultiChecked,
            "docIdsStr": this.getPrintDocId(),
            "leftPadding": form.state.leftPadding,
            "rightPadding": form.state.rightPadding
        }
        if (form.state.value == "0") {
            Object.assign(option, { "maxLineNum": form.state.pageSize }, params)
        } else if (form.state.value == "2") {
            Object.assign(option, { "height": form.state.height, "width": form.state.width }, params)
        } else {
            Object.assign(option, params)
        }
        console.log(option)
        let res = await this.webapi.docManage.print(option)
    }

    calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf('data.list')
        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        // if (currentRowIndex > 0
        //     && currentRowIndex <= rowCount
        //     && text == list.getIn([currentRowIndex - 1, columnKey])) {
        //     return 0
        // }

        let rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }

    checkSearchValue = (value, form) => {
        let flagCode = this.checkSearchValueCode(value, form)
        return flagCode
    }

    checkSearchValueCode = (value, form) => {
        const { endCode, startCode } = value
        if (!endCode && !startCode) {
            form.setFields({
                startCode: {
                    value: '',
                    errors: null,
                },
                endCode: {
                    value: '',
                    errors: null,
                }
            })
            return true
        }
        if ((!endCode && startCode)) {
            let startCodeNum = parseInt(value.startCode ? value.startCode : 0)
            if (isNaN(startCodeNum) || startCodeNum > 99999 || startCodeNum < 0) {
                form.setFields({
                    startCode: {
                        errors: [new Error('请输入正确的凭证号')],
                    }
                })
                return false
            }
            form.setFields({
                startCode: {
                    value: this.padStart(startCodeNum),
                    errors: null,
                },
                endCode: {
                    value: 99999,
                    errors: null,
                }
            })
            value.startCode = this.padStart(startCodeNum)
            value.endCode = 99999
            return true
        } else {
            let startCodeNum = parseInt(value.startCode ? value.startCode : 0)
            let endCodeNum = parseInt(value.endCode)
            let flag = true
            if (isNaN(startCodeNum) || startCodeNum > 99999 || startCodeNum < 0) {
                flag = false
                form.setFields({
                    startCode: {
                        errors: [new Error('请输入正确的凭证号')],
                    }
                })
            }
            if (isNaN(endCodeNum) || endCodeNum > 99999 || startCodeNum < 0) {
                flag = false
                form.setFields({
                    endCode: {
                        errors: [new Error('请输入正确的凭证号')],
                    }
                })
            }
            if (flag) {
                form.setFields({
                    startCode: {
                        value: endCodeNum > startCodeNum ? this.padStart(startCodeNum) : this.padStart(endCodeNum),
                        errors: null,
                    },
                    endCode: {
                        value: endCodeNum > startCodeNum ? this.padStart(endCodeNum) : this.padStart(startCodeNum),
                        errors: null,
                    }
                })
                value.startCode = endCodeNum > startCodeNum ? this.padStart(startCodeNum) : this.padStart(endCodeNum)
                value.endCode = endCodeNum > startCodeNum ? this.padStart(endCodeNum) : this.padStart(startCodeNum)
            }
            return flag
        }
        return true
    }

    padStart = (num) => {
        return num.toString().padStart(5, '0')
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
            return 0
        }

    }

    disabledRangePicker = (current) => {
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        return true
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.label) {
            return option.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }

        return true
    }

    searchCardDidMount = (target) => {
        this.searchCardCon = target
    }

    searchCardAmoutBlur = (e, type) => {
        let target = e.target;
        target.removeAttribute("type");
        let startAmount = this.searchCardCon.form.getFieldValue('startAmount'),
            endAmount = this.searchCardCon.form.getFieldValue('endAmount')
        if (type == 'pre' && !endAmount) {
            this.searchCardCon.form.setFieldsValue({ 'endAmount': e.target.value.replace(/,/g, '') })
        }
        if (type == 'next' && !startAmount) {
            this.searchCardCon.form.setFieldsValue({ 'startAmount': e.target.value.replace(/,/g, '') })
        }
    }

    searchCardAmoutFocus = (e, type) => {
        let target = e.target;
        setTimeout(() => {
            target.type = "text";
            target.setSelectionRange(0, 100);
        }, 0);
    }
    inputFormatter = (value) => {
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    inputParser = (value) => {
        return value.replace(/\$\s?|(,*)/g, '')
    }

    onSearch = (condition, e) => {        
        this.injections.reduce('updateArr', {
            'data.searchValue.simpleCondition': condition
        })
        this.sortParmas()
    }
    searchChange = (value) => {        
        this.injections.reduce('updateArr', {
            'data.searchValue.simpleCondition': value
        })
    }
    //批量修改制单人
    batchChangeCreator= async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '更多+批量修改制单人'])

        let _this = this
        const enableddate = this.metaAction.gf('data.other.enableddate')
        const { date_start,date_end } = this.metaAction.gf('data.searchValue').toJS()
        this.metaAction.modal('show', {
            title: '批量修改制单人',
            width: 500,
            iconType: null,
            className: 'mk-app-proof-of-list-modal-container-creator',
            children: <ChangeCreator enableddate={enableddate} fromDate={date_start} toDate={date_end} callBack={_this.submitbatchChangeCreator} />,
            footer: null
        })
    }
    submitbatchChangeCreator= async (form, target) => {
        const data = form.getValue()
        delete data.enableddate
        data.fromDate=moment(data.fromDate).format('YYYY-MM-DD')
        data.toDate=moment(data.toDate).format('YYYY-MM-DD')
        const res = await this.webapi.docManage.updateCreatorAndEditorByBatch(data)
        if(!res){
            this.sortParmas()
            return this.metaAction.toast('success', '批量修改制单人成功!')
        }
        
    }
    printset = (e) => {
        switch (e.key) {
          case 'printset':
              this.setupClick()
              break;
          default:

        }
    }
    setupClick= async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '打印管理'])
        let _this=this
        const enableddate = this.metaAction.gf('data.other.enableddate')
        const {
            height,
            maxLineNum,
            printAuxAccCalc,
            printQuantity,
            printMulti,
            type,
            width,
            leftPadding,
            rightPadding,
            auditorType,
            creatorType,
            auditor,
            printTime,
            creator,
            customPrintTime,
        } = await this.webapi.docManage.getPrintConfig()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 600,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'mk-app-proof-of-list-modal-container',
            children: <PrintOption
                height={height}
                maxLineNum={maxLineNum}
                printAuxAccCalc={printAuxAccCalc}
                printQuantity={printQuantity}
                printMulti={printMulti}
                type={type}
                width={width}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                from='proofList'
                enableddate={enableddate}
                callBack={_this.submitPrintOption}
                auditorType={auditorType}
                creatorType={creatorType}
                creator={creator}
                printTime={printTime}
                auditor={auditor}
                customPrintTime={customPrintTime}
            /> 
        })
    }
    
    submitPrintOption = async (form, target) => {
        delete  form.creatorButton
        delete  form.enableddate
        delete  form.auditorButton
        delete  form.timeOriginal
        let res = await this.webapi.docManage.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')   
    }
    print = async() => {
        const list = this.metaAction.gf('data.list').toJS()
        let tempWindow = window.open()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可打印数据')
            tempWindow.close()
            return
        }
        let params = this.sortParmas(null, null, null, 'get')
        params.tempWindow = tempWindow
        delete params.page
        params.docIdsStr=this.getPrintDocId()
        let res = await this.webapi.docManage.print(params)

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
