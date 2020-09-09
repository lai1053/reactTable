import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Modal } from 'antd'
import { Button, Layout } from 'edf-component'
import { toJS, fromJS } from 'immutable'
import VirtualTable from '../../invoices/components/VirtualTable'
import StockBlockSubjectMatch from '../components/StockBlockSubjectMatch'
import StockAppCarryoverProductionCost from '../components/StockAppCarryoverProductionCost/index'
import utils from 'edf-utils'
import moment from 'moment'
import { 
    getList, 
    getInfo, 
    formatSixDecimal, 
    transToNum,
    stockLoading, 
    addEvent, 
    removeEvent, 
    deepClone,
    canClickTarget,
    setListEmptyVal
} from '../commonAssets/js/common'
import { productionCostTable } from './staticField'


/*
    @params: {
         "state": 0, --状态 0未开，1开启
            "bInveControl": 0, --是否进行负库存控制 0否 1是
            "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
            "inveBusiness": 1, 1工业模式 0商业模式
            "endCostType": 0, 以销定产0、传统生产1
            "isGenVoucher": true, 是否结账，未生成 false 生成 true
            "isCompletion": true,是否本月有完工入库单 有 true 没有 false
            "startPeriod": "2019-09", 启用月份
            "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
            "isCarryOverProductCost":false, 结转生成凭证，未生成 false 生成 true
            "isProductShare": true, 是否进行成本分配，未生成 false 生成 true
            "inveBusiness", 1 --1工业自行生产，0 存商业
            "enableBOMFlag", 1 --是否启用BOM设置：1是；0否；
            "auxiliaryMaterialAllocationMark" 1, --辅料是否分摊之BOM产品中：1是；0否；
            "isConfigureBOM": 1 ,是否有配置bom 结构 1 表示有 0表示没有
            "automaticDistributionMark": 1, 1为自动分配 0 为手工分配
            "isMaterial": true --本月是否领料
    }
 */
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        // this.rowCount = 0
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = config.current.webapi
        this.defaultPeriod = moment().format('YYYY-MM')
        this.params = this.component.props.params || {}
        injections.reduce('init')
        // this.load()
        // this.sumWidth = 1150
        // let addEventListener = this.component.props.addEventListener
        // if (addEventListener && this.params) {
        //     addEventListener('onTabFocus', async() => { 
        //         this.params = this.component.props.params || {}
        //         const newInfo = await getInfo({period: (this.params.period || this.defaultPeriod)})
        //         Object.assign(this.params, newInfo)
        //         this.load()
        //     })
        // } 
        // this.tableField = deepClone(productionCostTable)      
    }

    renderPage = ()=>{
        const { xdzOrgIsStop } = this.metaAction.context.get('currentOrg') || {}
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { loading=false, list=[], storeParams, storeState, currentStep=null } = data
        // return(
        //     <React.Fragment>
        //         <Layout className='ttk-stock-app-carryOver-product-cost'>
        //             { loading && <div className='ttk-stock-app-spin'>{ stockLoading() }</div> }
        //             { this.renderHeader() }
        //             { this.renderTable() }
        //         </Layout>
        //     </React.Fragment>
        // )
        return (
            <StockAppCarryoverProductionCost
                store={this.component.props.store}
                params = {this.params}
                webapi = {this.webapi}
                metaAction = {this.metaAction}
                xdzOrgIsStop = {xdzOrgIsStop}
                component = {this.component}
                storeState = {storeState}
                storeParams = {storeParams}
                currentStep = {currentStep}
                saveData = {this.saveData}
                saveStep ={ this.saveStep}
            ></StockAppCarryoverProductionCost>
        )
    }

    saveData = (storeState, storeParams)=>{
        this.metaAction.sfs({
            'data.storeState': fromJS(storeState),
            'data.storeParams': fromJS(storeParams)
        })
    }

    saveStep = (step)=>{
        this.metaAction.sf('data.currentStep', step)
    }


    // componentDidMount = () =>{
    //     addEvent(window, 'resize', ::this.resizeTable)
    //     setTimeout(()=>{
    //         this.resizeTable()
    //     }, 100)
    // }

    // componentWillUnmount=()=>{
    //     this[`deny-carryOver-production-generateVoucherClickFlag`] = null
    //     removeEvent(window, 'resize', this.resizeTable)
    // }

    stockLoading = ()=>{
        return stockLoading()
    }

    // 存货列表
    load = async(update) => {
        let mainList = [], inventoryClass, isVoucher = false, voucherId = '', time = '',
        name = this.metaAction.context.get('currentOrg').name
        if (sessionStorage['stockPeriod' + name] != "undefined" && sessionStorage['stockPeriod' + name]) {
            time = sessionStorage['stockPeriod' + name]
        } else {
            const currentOrg = this.metaAction.context.get('currentOrg').periodDate
            sessionStorage['stockPeriod' + name] = currentOrg
            time = currentOrg
        }
        this.metaAction.sfs({
            "data.month": time,
            'data.loading': true
        })

        // 结转生产成本
        const res = await this.webapi.stock.getCarryProduceCostSheetDtoList({ 
            'period': this.params && this.params.period || this.defaultPeriod, 
            'type': this.params && this.params.endCostType,
            'enableBOMFlag': this.params && this.params.enableBOMFlag || 0, //1 已开启 0 未开启 
            'auxiliaryMaterialAllocationMark': this.params && this.params.auxiliaryMaterialAllocationMark || 0 //辅料分摊标志：1是 0 否
        })
        this.metaAction.sf('data.loading', false)

        if (res) {   // 无需判断数据来源endNumSource 是以销定产还是手工，因为如果是手工的话，后端直接返回空数组列表
            if (res.produceCostSheetDtoList && res.produceCostSheetDtoList.length !== 0) {
                mainList = [...res.produceCostSheetDtoList]
            }
            inventoryClass = res.classList || []
            inventoryClass.splice(0, 0, { inventoryClassId: '', inventoryClassName: '全部', isCompletion: false })
            isVoucher = res.isVoucher
            voucherId = res.voucherId
        } 
        this.allList = [...mainList]   
        this.injections.reduce('updateSfs', {
            ['data.list']: fromJS(mainList),
            ['data.isVoucher']: isVoucher,
            ['data.voucherId']: voucherId,
            ['data.inventoryClass']: fromJS(inventoryClass),
            ['data.isGenVoucher']: this.params.isGenVoucher,
            ['data.isCarryOverMainCost']: this.params.isCarryOverMainCost,
            ['data.isCarryOverProductCost']: this.params.isCarryOverProductCost,
            ['data.isShowSmDialog']: false,
        })   
    }

    //渲染表格
    renderColumns = () => {
        const columns = this.tableField.map(v=>{
            v.title = <div className='ttk-stock-app-table-header-txt'> { v.title } </div>
            const colStyle = {
                'overflow': 'hidden',
                'textOverflow': 'ellipsis',
                'whiteSpace': 'nowrap'
            }

            if(v.dataIndex==='costRate'){
                v.render = (text, record, index)=>{
                    const txt = Number(text) && (text * 100).toFixed(2) + '%' || ''
                    return <div style={{...colStyle}} title={txt}> { txt } </div>
                }
                
            }else if(v.children){
                v.children.forEach(el=>{
                 
                    if(['putInNum', 'price'].includes(el.dataIndex)){
                        const textAlign = el.dataIndex === 'putInNum' ?  'left' : 'right'
                        el.render = (text, record, index)=>{
                            const txt = formatSixDecimal(text)
                            return <div style={{...colStyle, textAlign}} title={txt}> { txt } </div>
                        }
        
                    }else if(el.dataIndex==='putInCost'){
                        el.render = (text, record, index)=>{
                            const txt = utils.number.format(text,2)
                            return <div style={{...colStyle}} title={txt}> { txt } </div>
                        }
        
                    }else{
                        el.render = (text, record, index)=>{
                            const txt = utils.number.format(text,2)
                            return <div style={{...colStyle}} title={txt}> { txt } </div>
                        }
                    }
                })
            }
            return v
        }) 
        return columns
    }

    // 列合计
    calColumnTotal = (list) => {
        let putInNumT = 0, 
            materialFeeT = 0, 
            personCostT = 0, 
            directCostT = 0, 
            otherexpensesT = 0, 
            putInCostT = 0,
            rateTotal = 0
        list.map(v => {
            putInNumT += transToNum(v.putInNum),
            materialFeeT += transToNum(v.materialFee),
            personCostT += transToNum(v.personCost),
            directCostT += transToNum(v.directCost),
            otherexpensesT += transToNum(v.otherexpenses),
            putInCostT += transToNum(v.putInCost)
            rateTotal += transToNum(v.costRate*100)
        })
        putInNumT = formatSixDecimal(putInNumT)
        materialFeeT = utils.number.format(materialFeeT,2)
        personCostT = utils.number.format(personCostT,2)
        directCostT = utils.number.format(directCostT,2)
        otherexpensesT = utils.number.format(otherexpensesT,2)
        putInCostT = utils.number.format(putInCostT,2)
        rateTotal = formatSixDecimal( transToNum(rateTotal.toFixed(2))) + '%'

        return { putInNumT, materialFeeT, personCostT, directCostT, otherexpensesT, putInCostT, rateTotal }
    }

    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-carryOver-product-cost-main")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight - 88) || 0
        const obj = { tableW, tableH }
        let {tableOption} = this.metaAction.gf('data').toJS()
        this.computeColWidth(tableW)
        this.metaAction.sfs({
            'data.tableOption': fromJS({
                ...tableOption,
                x: tableW,
                y: tableH,
            }),
        })
    }

    computeColWidth = tableW => {
        // 1850为初始宽度，16为总列数
        let increment = Math.floor((tableW - this.sumWidth) / 8)
        let sumWidth = 0
        for (const item of this.tableField) {
            if (item.children) {
                for (const el of item.children) {
                    el.width = el.width + increment
                    sumWidth += el.width
                }
            } else{
                item.width = item.flexGrow ? (item.width + increment) : item.width
                sumWidth += item.width
            }
        }
        this.sumWidth = sumWidth
        return this.sumWidth
    }


    renderSummaryRow = () => {
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const { 
            putInNumT, 
            putInCostT, 
            materialFeeT, 
            personCostT, 
            directCostT, 
            otherexpensesT,  
            rateTotal
        } = this.calColumnTotal(list)
        let rowData = [
            '',
            '',
            '',
            '',
            putInNumT, 
            '', 
            putInCostT, 
            rateTotal, 
            materialFeeT, 
            personCostT, 
            directCostT, 
            otherexpensesT
        ]
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                let titleWidth = 0, rowWidth = []
                columns.forEach((el, i) => {
                    if(i == 1) {
                        i == 1 && rowWidth.push({'width': titleWidth,'flexGrow': el.flexGrow})
                    } else {
                        if(el.children && el.children.length>0){
                            el.children.forEach(item => {
                                rowWidth.push({'width':item.width, 'dataIndex': item.dataIndex,})
                            })
                        }else{
                            rowWidth.push({'width': el.width, 'dataIndex': el.dataIndex,})
                        }
                    }
                })
                let rows = rowData.map((el, i) => {
                    let width = rowWidth[i].width + "px"
                    let flexGrow = rowWidth[i].flexGrow
                    const colStyle={
                        borderRight: '1px solid #d9d9d9',
                        padding: '0 10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                    const borderRight = '1px solid #d9d9d9'
                    if(i == 0) {
                        return (<div style={{ width, borderRight, textAlign: 'center' }}>合计</div>)
                        
                    }else if(i==1){
                        return ( <div style={{ width, borderRight, flexGrow ,textAlign: 'center' }}> {rowData[i]}</div>)
                    } else {
                        let textAlign = rowWidth[i].dataIndex.includes('Num') ? 'left' : 'right'
                        return (
                            <div style={{ width, textAlign, ...colStyle }} title={rowData[i]}>
                                {rowData[i]}
                            </div>
                        )
                    }
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }

        return summaryRows
    }

    renderHeader = () =>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { inventoryClass, month, isGenVoucher, isCarryOverMainCost } = data
        return(
            <div className='ttk-stock-app-carryOver-product-cost-header'>
                <div className="ttk-stock-app-carryOver-product-cost-header-others">
                    <div className="ttk-stock-app-carryOver-product-cost-header-others-left">
                        <span className="back-btn" onClick={this.handleReturn}></span>
                        <div className="carryOver-filter-container">
                            <AppLoader
                                className= 'filter-com'
                                component= 'AppLoader'
                                name= 'ttk-stock-app-completion-warehousing-filter'
                                store = {this.component.props.store}
                                callback= {(v)=>{this.filterCallback(v)}}
                                selectOptions= {inventoryClass}
                            ></AppLoader>
                        </div>
                        <span className='period'>
                            月份：{ month }
                        </span>
                    </div>
                    <div className="ttk-stock-app-carryOver-product-cost-header-others-right">
                        
                            {
                                !data.isVoucher ? 
                                    <Button
                                        className= 'genarate-btn'
                                        type= 'primary'                            
                                        disabled= { isGenVoucher || isCarryOverMainCost}
                                        onClick= { this.generateVoucher }>
                                        生成凭证
                                    </Button>
                                :
                                (
                                    <span>
                                        <Button
                                            className= 'checkoutVoucher-btn'
                                            type= 'primary'
                                            onClick= {this.checkoutVoucher}>
                                            查看凭证
                                        </Button>
                                
                                        <Button
                                            className= 'deleteVoucher-btn'
                                            type= 'default'
                                            disabled= { isGenVoucher || isCarryOverMainCost }
                                            onClick= { this.deleteVoucher }>
                                            删除凭证
                                        </Button>
                                    </span>
                                )
                            }                      
                    </div>
                </div>
            </div>
        )
    }

    renderTable=()=>{
        const data = this.metaAction.gf('data').toJS() || {}
        const { list=[], tableOption={} } = data
        const cols = this.renderColumns()

        return (
            <div className='ttk-stock-app-carryOver-product-cost-main mk-layout'>
                <VirtualTable
                    columns={cols}
                    dataSource={list}
                    key='11'
                    rowKey="inventoryId"
                    style={{ width: `${tableOption.x}px` }}
                    scroll={{ y: tableOption.y+3, x: tableOption.x}}
                    summaryRows={this.renderSummaryRow()}
                    bordered
                    height={1000}
                    width={tableOption.x+10}
                    headerHeight={78}
                    allowResizeColumn
                />
            </div>
            
        )
    }

   

    // 过滤查找
    filterCallback = (v) => {
        const { name, inventoryClassId } = v
        let allList = []
        this.allList.filter(v => {
            if (name && inventoryClassId) {
                if (
                        (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1) 
                        &&  v.inventoryClassId.toString() === inventoryClassId.toString()
                    ){
                    allList.push(v)
                }
            } else if (name && !inventoryClassId) {
                if ( (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1) ) {
                    allList.push(v)
                }
            } else if (!name && inventoryClassId) {
                if (v.inventoryClassId.toString() === inventoryClassId.toString()) {
                    allList.push(v)
                }
            } else {
                allList.push(v)
            }
        })
        this.injections.reduce('updateSfs', {['data.list'] : fromJS(allList)})
    }

    // 科目匹配
    matchSubject = async() => { 
        const list = getList.call(this, 'list')  // 这个结转列表的数据
        const inventorys = list.map(v => ({'inventoryId': v.inventoryId}))
        const resp = await this.webapi.stock.getInventoryGoods({inventorys})  // 获取科目匹配的存货列表
        let matchSubjectResult = false
        if (resp) {
            let hasUnMatched = resp.some(v => !v.inventoryRelatedAccountId)
            const ret = (!hasUnMatched) ? true : false
            if(!!hasUnMatched) this.metaAction.toast('warning', '存货科目未设置，请先进入【存货档案】设置科目!') 
            return ret
        }
        return matchSubjectResult
    }

    setEmptyValue = (val) => (val != undefined && val != null) && val || null


    // 生成凭证
    generateVoucher = async(event) => {
        this.metaAction.sf('data.loading', true)
        const hasClick = canClickTarget.getCanClickTarget('voucher')  
        if(!hasClick){
            canClickTarget.setCanClickTarget('voucher', true)
            const matchSubjectResult = await this.matchSubject() 
            if (matchSubjectResult) {
               
                const {flag, subjectConfig} = await this.hasStockSubject(subjectConfig) // 检测存货科目
                if(flag){
                    await this.createBillTitlePZ()
                    this.metaAction.sf('data.loading', false)
                }else{
                    this.metaAction.sf('data.loading', false)
                    canClickTarget.setCanClickTarget('pickingGenVoucher', null)
                    const ret = await this.metaAction.modal('show',{
                        title: `科目设置`,
                        okText: '确定', 
                        cancelText: '取消',
                        wrapClassName: 'modal-padding-20-30',
                        width: 900,
                        height: 400,
                        bodyStyle: { padding: '20px 20px 15px'},
                        children: (
                            <StockBlockSubjectMatch
                                metaAction={ this.metaAction }
                                webapi = { this.webapi }
                                store={ this.component.props.store }
                                component={ this.component }
                                subjectMatches={ subjectConfig }
                            />
                        )
                    })
                    if(ret){
                        await this.createBillTitlePZ()
                    }
                }
            } 
            canClickTarget.setCanClickTarget('voucher', null)
        }
        this.metaAction.sf('data.loading', false)
    }

    // 调用生成凭证接口
    createBillTitlePZ= async()=>{
        this.metaAction.sf('data.loading', true)
        const list = this.allList.slice(0)
        const stockDtoMain = {}
        stockDtoMain.isExist = false
        stockDtoMain.isVoucher = false
        stockDtoMain.period =this.params.period || this.defaultPeriod
        stockDtoMain.produceCostSheetDtoList = list.map(item => {
            item.num = transToNum(item.num)  // 数量
            item.costRate = ( typeof(item.costRate)=='string' && (item.costRate.indexOf('%')> -1) ) ? 
                                (item.costRate.slice(0,-1)/100) 
                                : item.costRate
            item.putInNum = transToNum(item.putInNum) 
            item.materialFee = transToNum(item.materialFee) 
            item.personCost = transToNum(item.personCost)
            item.directCost = transToNum(item.directCost)
            item.otherexpenses = transToNum(item.otherexpenses)
            item.price = transToNum(item.price) // 金额
            item.putInCost = transToNum(item.putInCost)
            return item
        })
        stockDtoMain.produceCostSheetDtoList = setListEmptyVal(list)
        const ret = await this.webapi.stock.createPZ({stockDtoMain})
        this.metaAction.sf('data.loading', false)
        if (ret === null) { 
            this.metaAction.toast('success', '生成凭证成功')
            await this.load()  
        }
    }

    // 校验是否有存货科目
    hasStockSubject= async()=>{
        // this.metaAction.sf('data.loading', true)
        const getStockAcctCodeReq= this.webapi.stock.getStockAcctCode({"module": "cost"}) // 根据条件查询存货模块科目设置范围下的末级科目
        let subjectConfig = await this.webapi.stock.queryAcctCodeByModule({ module: 2})  
        let stockAcctCode = await getStockAcctCodeReq
        // this.metaAction.sf('data.loading', false)
        let flag = false
        if(subjectConfig && Array.isArray(subjectConfig)){
            const mark = subjectConfig.some(v=>{
                const index = stockAcctCode.findIndex(o=>o.id==v.destAcctId)
                return (index<0)
            })
            flag = !mark
        }
        return {flag, subjectConfig}
    }

    
    // 查看凭证
    checkoutVoucher = async()=>{
        const voucherId = this.metaAction.gf('data.voucherId')
          const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            style: { top: 5 },
            width: 1200,
            bodyStyle: { paddingBottom: '0px' },
            className: 'stock-carry-batchCopyDoc-modal',
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge', {
                store: this.component.props.store,
                initData: {
                    type: 'isFromXdz',
                    id: voucherId,
                }
            })
        })
    }

    // 删除凭证
    deleteVoucher = async() => {
        const _this = this
        Modal.confirm({
            content: '该凭证将删除，请确认！',
            okText: '确定',
            cancelText: '取消',
            onOk() { 
                const params = { period: _this.params.period || _this.defaultPeriod, type: 0 } //-- 1主营成本 0 生产成本
                new Promise(async(resolve,reject)=>{
                    const resp = await _this.webapi.stock.deletePZ(params)
                    resolve(resp)
                }).then(res=>{
                    if(res===null){ 
                        _this.metaAction.toast('success','凭证删除成功！') 
                        _this.load()
                    }
                })
            },
            onCancel() {},
        })
    }

    // 校验
    checkform = () => {
        const list  = this.metaAction.gf('data.list').toJS()
        let flag = true
        const checkedList = list.map((item) => {
            item.matDisCofError = !item.matDisCof
            item.numError = !item.num
            if (!!item.matDisCofError || !!item.numError) { flag = false }
            return item
        })
        this.injections.reduce('updateSfs', {'data.list': fromJS(checkedList)})
        return { flag, checkedList }
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-carryOver-production-cost')
        this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        this.resizeTable()
        return 
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

// stockDtoMain.produceCostSheetDtoList = list.map(item => {
//     // item.specification = this.setEmptyValue(item.specification)
//     // item.inventoryClassId = this.setEmptyValue(item.specification)
//     // item.inventoryId = this.setEmptyValue(item.inventoryId)  
//     // item.inventoryUnit = this.setEmptyValue(item.inventoryUnit)  
//     // item.inventoryCode = this.setEmptyValue(item.inventoryCode) 
//     // item.inventoryName = this.setEmptyValue(item.inventoryName) 
//     // item.inventoryGuiGe = this.setEmptyValue(item.inventoryGuiGe)  
//     // item.isCompletion = this.setEmptyValue(item.isCompletion)
//     item.num = transToNum(item.num)  // 数量
//     item.costRate = ( typeof(item.costRate)=='string' && (item.costRate.indexOf('%')> -1) ) ? (item.costRate.slice(0,-1)/100) : item.costRate
//     item.putInNum = transToNum(item.putInNum) 
//     item.materialFee = transToNum(item.materialFee) 
//     item.personCost = transToNum(item.personCost)
//     item.directCost = transToNum(item.directCost)
//     item.otherexpenses = transToNum(item.otherexpenses)
//     item.price = transToNum(item.price) // 金额
//     item.putInCost = transToNum(item.putInCost)
//     return item
// })

