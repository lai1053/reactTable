import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { 
    Icon, 
    Pagination, 
    Layout, 
    Tooltip, 
    Button, 
    Dropdown, 
    Menu, 
    Input, 
    Popover, 
    DatePicker, 
    Select, 
    DataGrid, 
    Checkbox 
} from 'edf-component'
import config from './config'
import extend from './extend'
import { toJS, fromJS } from 'immutable'
import moment from 'moment'
import {moment as momentUtil} from 'edf-utils'
import { 
    transToNum, 
    getClientSize, 
    addEvent, 
    removeEvent, 
    stockLoading, 
    canClickTarget, 
    formatNumber 
} from '../commonAssets/js/common'
import StockBlockSubjectMatch from '../components/StockBlockSubjectMatch'
import PickingLimits from './components/PickingLimits'
import StockAppPickingBom from './StockAppPickingBom/index'
import PrintButton from '../components/common/PrintButton'
import importModal, { onFileError } from "../components/common/ImportModal"
import MergeVoucher from '../components/GenerateVoucher/MergeVoucher'
import{ BILLORIGIN, ORIGINTYPE, VOUCHERSTATUS, columnKeyArr} from './fixedData'
const {Option} = Select
const {Column,Cell} = DataGrid

let modalHeight=0, 
    modalWidth=0, 
    modalBodyStyle=0

const calClientSize = ()=> {
    const obj = getClientSize()
    modalHeight = obj.modalHeight
    modalWidth = obj.modalWidth
    modalBodyStyle = obj.modalBodyStyle
}
calClientSize()

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi=this.config.webapi
    }
    onInit = async({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.load()
    }

    componentDidMount=()=>{
        addEvent(window, 'resize', calClientSize)
    }

    componentWillUnmount=()=>{
        this[`deny-picking-generateVoucherClickFlag`] = null
        this[`ttk-stock-app-inventory-picking-SCLLClickFlag`] = null
        this.checkAllBom = null
        this.getInvSetByPeroid = null
        removeEvent(window, 'resize', calClientSize)
    }

    load = async (falg) => {
        this.metaAction.sf('data.loading', true)
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        const { pagination={}, inputVal='', form={} } = data
        const {constom, strDate, endDate, voucherIds, type=''} = form
        const { name, xdzOrgIsStop } = this.metaAction.context.get('currentOrg')
        const stockPeriod = sessionStorage['stockPeriod' + name]
        let page = { 
            'pageSize': pagination.pageSize,
            'currentPage': inputVal ? 1 : pagination.current
        }
        let reqList = {
            'serviceTypeCode': 'SCLL',
            'period': stockPeriod,
            'code': inputVal,
            'supplierName': constom,
            'startPeriod': strDate,
            'endPeriod': endDate,
            'voucherIds': voucherIds,
            'type': type,    // 来源
            page
        }  
        const getBOMConfigurationListReq = this.webapi.stock.getBOMConfigurationList({ 
            'pid': 0,
            'inventoryNameOrBomCode': "",	//存货名称或编号（模糊查询），非必填
            'page': {             
                'currentPage': 1,    
                'pageSize': 50      
            }
        }),
        invsetReq = this.webapi.stock.getInvSetByPeroid({'period': stockPeriod}),
        initReq =  this.webapi.stock.init({ 'period': stockPeriod, 'opr': 0 }),
        listReq = this.webapi.stock.findBillTitleList(reqList),
        findSupplierListReq = this.webapi.stock.findSupplierList({})

        const resp = await listReq
        const bomConfig = await getBOMConfigurationListReq
        this.getInvSetByPeroid = await invsetReq
        
        this.injections.reduce('load', resp, this.getInvSetByPeroid, bomConfig, xdzOrgIsStop)

        const reqData = await initReq
        this.startPeriod = reqData.startPeriod//启用时间
        let findSupplierList = await findSupplierListReq || []  // 查找供应商
        let listdata = [{supplierName: '全部'}].concat(findSupplierList)
        this.renderSelectOption(listdata)
        this.metaAction.sf('data.loading', false)
    }

    renderSelectOption = (data) => {
        const arr = data.map(item => 
            (<Option key={item.supplierId} value={item.supplierName}> {item.supplierName} </Option>)
        )
        this.selectOption = arr
    }

    reload = async (pageObj) => {
        this.metaAction.sf('data.loading', true)
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS || {}
        const {pagination={}, form={}, inputVal=''} = data
        const {constom, strDate, endDate, voucherIds} = form
        const { name= '', xdzOrgIsStop } = this.metaAction.context.get('currentOrg')
        const stockPeriod = sessionStorage['stockPeriod'+name]
        let page = { 
            'currentPage': pageObj ? pageObj.currentPage : pagination.current, 
            'pageSize': pageObj ? pageObj.pageSize : pagination.pageSize
        }
        page.currentPage = inputVal ? 1 : page.currentPage

        let reqList = {
            'serviceTypeCode': 'SCLL',
            'period': stockPeriod,
            'code': this.metaAction.gf('data.inputVal'),
            'supplierName': constom == '全部' && '' || constom,
            'startPeriod': strDate,
            'endPeriod': endDate,
            'voucherIds': voucherIds == null && null || voucherIds,
            page
        }
        const getBOMConfigurationListReq = this.webapi.stock.getBOMConfigurationList({ 
            'pid': 0,
            'inventoryNameOrBomCode': "",	//存货名称或编号（模糊查询），非必填
            'page': {             
                'currentPage': 1,    
                'pageSize': 50      
            }
        }),
        invsetReq = this.webapi.stock.getInvSetByPeroid({'period': stockPeriod}),
        respReq = this.webapi.stock.findBillTitleList(reqList)
        
        const response = await respReq
        const bomConfig = await getBOMConfigurationListReq
        this.getInvSetByPeroid = await invsetReq
        this.injections.reduce('reload', response, this.getInvSetByPeroid, bomConfig, xdzOrgIsStop)
        this.metaAction.sf('data.loading', false)
    }

    // 不可选月份
    disabledDate = (current) => {
        let startperiod = this.startPeriod
        return current < moment(startperiod)
    }

    getSelectOption = () => this.selectOption
    
    // 分页修改
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination').toJS().pageSize
		}
		let page = { currentPage, pageSize }
		this.load(page)
    }
    // 返回存货核算页面
    back = async () => {
		this.component.props.setPortalContent &&
		this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
        this.component.props.onlyCloseContent('ttk-stock-app-inventory-picking')
    }
    // 点击查询按钮
    filterList = () => {
        this.metaAction.sf('data.showPopoverCard', false)
        this.load()
    }
    // 下拉查询框是否显示
    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { form } = this.metaAction.gf('data').toJS()
            this.metaAction.sfs({
                'data.form': fromJS(form),
                'data.showPopoverCard': visible
            })
            return
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }
    // 重置查询条件
    resetForm = () => {
        this.metaAction.sfs({
            'data.form.strDate': '',
            'data.form.endDate': '',
            'data.form.constom': '',
            'data.form.voucherName': '',
            'data.form.origin': '',
            'data.form.type': '',
            'data.form.voucherIds': null
        })
    }
    // 凭证状态选择
    changeVoucherSelect = (value) => {
        let select = VOUCHERSTATUS.find(item => item.key === value)
        this.metaAction.sfs({
            "data.form.voucherIds": select.key,
            "data.form.voucherName": select.value
        })
    }

    // 渲染Select.Option
    renderOption= arr =>arr.slice(0).map( v=>
        <Option key={v.key} value={v.key} title={v.value}>
            {v.value}
        </Option>)


    filterOptions= (input, option)=>
        option.props.children.indexOf(input) >= 0
    
    // 单据来源选择
    changeOrign=(value)=>{
        let select = ORIGINTYPE.find(item => item.key === value)
        this.metaAction.sfs({
            "data.form.type": select.key,
            "data.form.origin": select.value
        })
    }
    
    /* 关闭科目匹配弹出框 */
    closeSubSetting = ()=>{
        this.closeSubjectTip()
        clearTimeout(this.closeBomTimer)
        this.closeBomTimer = setTimeout(()=>{
            this.load()
        },100)
    }

    /* 科目设置 */
    subjectSetting = async()=>{
        this.metaAction.sf('data.loading', true)
        let subjectConfig = await this.webapi.stock.queryAcctCodeByModule({"module": 2}) || []
        this.metaAction.sf('data.loading', false)
        if(subjectConfig && Object.prototype.toString.call(subjectConfig)==='[object Array]' ){
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
            return ret
        }
    }

    /* 批量删除单据 */
    settlement = async () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        if (selectedArrInfo.length == 0) {
            this.metaAction.toast('error', '请先选择数据')
            return false
        }
        let arr = []
        let serviceTypeCode='SCLL'
        selectedArrInfo.forEach(item => {
            arr.push(item.id)
        })
        const response = await this.webapi.stock.deleteBatchBillTitle({
            'serviceTypeCode': serviceTypeCode,
            'ids':JSON.stringify(arr)
        })
        if (response) {
            this.metaAction.toast('success', response)
        }
        this.load()
    }

    /*批量删除凭证*/
    deletePz = async () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        if (selectedArrInfo.length == 0) {
            this.metaAction.toast('error', '请选择需生成凭证单据')
            return false
        }
        let arr = []
        let serviceTypeCode = 'SCLL'
        selectedArrInfo.forEach(item => {
            arr.push(item.id)
        })
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.stock.deleteBillTitlePZ({
            'serviceTypeCode': serviceTypeCode, 
            'ids': JSON.stringify(arr)
        })
        this.metaAction.sf('data.loading', false)
        if (response === null) {
            this.metaAction.toast('success', '删除成功')
            this.reload()
        }
    }
    
    // 删除
    deleteOnly = (id) => (e) => {
        if (id) {
            this.deleteOnlyPz(id)
        }
    }

    // 单条删除凭证
    deleteOnlyPz = async (id) => {
        let arr = []
        arr.push(id)
        let serviceTypeCode = 'SCLL'
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.stock.deleteBillTitlePZ({
            'serviceTypeCode': serviceTypeCode,
            'ids': JSON.stringify(arr)
        })
        this.metaAction.sf('data.loading', false)
        if (response === null) {
            this.metaAction.toast('success', '删除成功')
            this.reload()
        }
        
    }
    
    // 编辑或查看凭证
    lock = (id, voucherIds) => (e) => {
        let personId = id ? id : null
        this.lookDtile(personId, voucherIds)
    }

    /* 点击单据号 */
    lookDtile = async (id, voucherIds) => {
        const xdzOrgIsStop = this.metaAction.gf('data.xdzOrgIsStop') 
        let ret = ''
        // stateNow : true——如果已经生成了结转生产成本凭证、已生成了出库凭证或者已结账，那么只能查看； false——未生成，可以编辑
        let flag = this.metaAction.gf('data.limit.stateNow') ? true : false  
        if (flag || xdzOrgIsStop) {   // 编辑凭证
            ret = await this.metaAction.modal('show', {
                title: '查看',
                width: modalWidth,
                height: modalHeight,
                bodyStyle: {maxHeight: modalHeight -120, overflowY: 'auto'},
                wrapClassName: 'adjust-wrap-top modal-padding-20-30',
                footer: null,
                children: this.metaAction.loadApp('ttk-stock-app-inventory-look', {
                    store: this.component.props.store,
                    id: id,
                    flag: flag,
                    serviceTypeCode: 'SCLL',
                    titleName: '生产领料单',
                })
            })
        } else {  // 查看凭证
            const titleText = voucherIds ?  '查看' : '编辑'
            ret = await this.metaAction.modal('show', {
                title: titleText,
                width: modalWidth,
                height: modalHeight,
                bodyStyle: {
                    'maxHeight': modalHeight -120,
                    'overflowY': 'auto',
                    'borderBottomLeftRadio': 0,
                    'borderBottomRightRadio': 0,
                },
                wrapClassName: 'adjust-wrap-top modal-padding-20-30',
                footer: null,
                children: this.metaAction.loadApp('ttk-stock-app-inventory-picking-add', {
                    store: this.component.props.store,
                    id: id,
                    isAdd: true,
                    unEditable: flag,  // 为check的时候代表查看状态
                    voucherIds: voucherIds  
                })
            })
        }

        if (ret) {
            this.reload()
        }
    }

    callBack = () => this.reload()
    

    // 更多按钮的事件
    moreActionOpeate = (e) => {
        if (e.key == 'insertProofConfirmList') {
            const id = 1
            this.insertProofConfirm(id)
        } else {
            this[e.key] && this[e.key]() //key值分别有deletePz和settlement,对应两个事件
        }
    }

    /*导出*/
    exportData = async () => {
        let name=this.metaAction.context.get('currentOrg').name
        const currentOrg = sessionStorage['stockPeriod' + name]
        const form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
        const {constom, strDate, endDate, voucherIds} = form

        await this.webapi.stock.export({
            "period": currentOrg, // 会计期间
            "customerCode": name, // --企业名称
            "startPeriod": strDate, // --入库日期起
            "endPeriod": endDate,  // --入库日期止
            "code": this.metaAction.gf('data.inputVal'),  // ---流水号
            "supplierName": null, // --往来单位名称
            "type": null, // --单据来源：发票生成0、手工新增1'
            "voucherIds":voucherIds, // --凭证类型：未生成0、已生成1'
        })
    }

    // 模糊查询
    onSearch = (path, data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.metaAction.sf(path, data)
            this.load()
        }, 500)
    }

    // 全选和单选
    selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }

    isSelectAll = (gridName) => {
		return this.extendAction.gridAction.isSelectAll(gridName);
    }

    selectAll = (gridName) => (e) => {
		this.injections.reduce('selectAll', e.target.checked, gridName);
    }

    delClick = (id) => (e) => {
        const xdzOrgIsStop = this.metaAction.gf('data.xdzOrgIsStop')
        if (!this.metaAction.gf('data.limit.stateNow') && !xdzOrgIsStop) {  // 还未结转生产成本凭证、主营成本凭证已结账或结账的话
            let personId = id ? id : null
            let serviceTypeCode = 'SCLL'
            this.delete(serviceTypeCode,personId)
        }  
    }

    // 调用删除单据的接口，并在删除后重新刷新页面
    delete = async(serviceTypeCode,id) => {
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.stock.delete({'serviceTypeCode':serviceTypeCode,'id':id})
        this.metaAction.sf('data.loading', false)
        if (response) {
            this.metaAction.toast('success', response)
            this.load()
        }
        this.load()
    }

    /* 打开领料范围选择会话框 */
    pickingLimits = async()=>{
        const ret = await this.metaAction.modal('show',{
            name: 'picking-limits',
            title: '领料范围',
            width: 400,
            // height: ,
            footer: null,
            closeModal: this.closeLimits,
            closeBack: (back) => { this.closeLimitsTip = back },
            wrapClassName: 'adjust-wrap-top modal-padding-20-30 pickingLimits',
            okText: '保存',
            children: <PickingLimits
                store = {this.component.props.stock}
                webapi = {this.webapi}
                metaAction = {this.metaAction}
                // component={this.component}
            ></PickingLimits>
        })
    }

     // 关闭弹窗
     closeLimits = async(ret) => { 
        this.closeLimitsTip()
        if (ret == null) {
            this.metaAction.toast('success', '保存成功')
            this.reload()
        } 
    }

    // // 定时关闭快速领料弹窗
    // closeSuccessTips = (ret)=> { 
    //     const modalEle = document.querySelector(".fastpicking-success-tips-container")
    //     const modalBlock = modalEle && modalEle.parentNode && modalEle.parentNode.parentNode
    //     if(modalBlock){
    //         document.body.removeChild(modalBlock)
    //     }   
    // }

    // 科目匹配
    matchSubject = async() => { 
        const list = this.extendAction.gridAction.getSelectedInfo('dataGrid')  // 这个结转列表的数据
        let matchSubjectResult = false
        if(list && list.length>0){
            const inventorys = []
            list.forEach(item => {
                if(item.billBodys && typeof(item.billBodys)==='string'){
                    JSON.parse(item.billBodys).forEach(data => {
                        inventorys.push({'inventoryId': data.inventoryId})
                    })
                }     
            })
            const resp = await this.webapi.stock.getInventoryGoods({inventorys})  // 获取科目匹配的存货列表
            if (resp) {
                let hasUnMatched = resp.some(v => !v.inventoryRelatedAccountId)
                if(!!hasUnMatched) this.metaAction.toast('warning', '存货科目未设置，请先进入【存货档案】设置科目!') 
                matchSubjectResult = (!hasUnMatched) ? true : false
            }
        }else{
            this.metaAction.toast('error', '请选择需生成凭证单据')
        }
        return matchSubjectResult 
    }

    /* 凭证合并 */
    mergeVouchers=async()=>{
        const modulueName = 'picking'
        const getVoucherRuleReq = this.webapi.stock.getVoucherRule({
            'module': modulueName
        })
        const radioChoices = [{
            value: '1',
            text: '选中单据合并一张凭证'
        },{
            value: '0',
            text: '一张单据一张凭证'
        }]
        // 查询原先设置的凭证合并的选择
        const getVoucherRule = await getVoucherRuleReq
        const defaultVal= (getVoucherRule && getVoucherRule.stockRule && getVoucherRule.stockRule.merge) 
                 ?  getVoucherRule.stockRule.merge : 0
        const ret = await this.metaAction.modal('show',{
            title: '凭证合并',
            okText: '保存',
            cancelText: '取消',
            wrapClassName: 'modal-padding-20-30',
            bodyStyle: {padding: '20px 20px 15px'},
            width: 400,
            height: 300,
            children: <MergeVoucher
                metaAction={this.metaAction}
                store={this.component.props.store}
                radioChoices={radioChoices}
                defaultVal={defaultVal}
            />
        })

        if(ret && ret!==true){
            this.metaAction.sf('data.loading', true)
            const result = await this.webapi.stock.updateVoucherRuleByModule({
                "module": modulueName,    //必传
                "stockRule": {     
                    "merge": ret    //是否合并凭证，必传； 1：选中的单据合并成一张凭证，0：一张单据一张凭证
                }
            })
            if(result===null){
                this.metaAction.toast('success','保存成功')
            }
            this.metaAction.sf('data.loading', false)
        }       
    }

    // 生成凭证
    generateVoucher = async(event) => {
        const list = this.extendAction.gridAction.getSelectedInfo('dataGrid')  // 这个结转列表的数据
        if (!list || list.length == 0) {
            this.metaAction.toast('error', '请选择需生成凭证单据')
            return false
        }
        const hasClick = canClickTarget.getCanClickTarget('pickingGenVoucher')  
        if(!hasClick){
            canClickTarget.setCanClickTarget('pickingGenVoucher', true)
            const matchSubjectResult = await this.matchSubject() 
            if (matchSubjectResult) {
                const {flag, subjectConfig} = await this.hasStockSubject(subjectConfig) // 检测存货科目
                if(flag){
                    await this.createBillTitlePZ()

                }else{
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
            canClickTarget.setCanClickTarget('pickingGenVoucher', null)
        }
    }

    createBillTitlePZ= async()=>{
        const list = this.extendAction.gridAction.getSelectedInfo('dataGrid')  // 这个结转列表的数据
        const inventorys = list.map( v=>(v.id) )
        let name = this.metaAction.context.get('currentOrg').name
        let reqlist = {
            'period': sessionStorage['stockPeriod' + name],
            'serviceTypeCode': 'SCLL',
            'ids': inventorys,
        }
         this.metaAction.sf('data.loading', true)
        const ret = await this.webapi.stock.createBillTitlePZ(reqlist)
        this.metaAction.sf('data.loading', false)
        if (ret) {
            this.metaAction.toast('success', '生成凭证成功')
            await this.reload()  
        } 
    }

    // 校验是否有存货科目
    hasStockSubject= async()=>{
        this.metaAction.sf('data.loading', true)
        const getStockAcctCodeReq= this.webapi.stock.getStockAcctCode({"module": "cost"}) // 根据条件查询存货模块科目设置范围下的末级科目
        let subjectConfig = await this.webapi.stock.queryAcctCodeByModule({ module: 2})   // 科目匹配下拉数据
        let stockAcctCode = await getStockAcctCodeReq
        this.metaAction.sf('data.loading', false)
        let flag = false
        if(subjectConfig && Array.isArray(subjectConfig)){   //检测列表是否有因为存货停用而清空的情况
            const mark = subjectConfig.some(v=>{
                const index = stockAcctCode.findIndex(o=>o.id==v.destAcctId)
                return (index<0)
            })
            flag = !mark
        }
        return {flag, subjectConfig}
    }

    // 查看凭证
    checkoutVoucher = (id) => (e) => {
        if (id) {
            this.lookVoucher(id)
        }        
    }

    lookVoucher = async(id) => {
        const voucherId = id
        const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            width: modalWidth,
            height: modalHeight,
            bodyStyle: modalBodyStyle,
            wrapClassName: 'adjust-wrap-top',
            className: 'ttk-stock-pz-modal',
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge', {
                store: this.component.props.store,
                initData: {
                    type: 'isFromXdz',
                    id: voucherId
                }
            })
        })
    }

    // 新增
    addType = async () => {
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let billList = []
        list.map(item => {
            if (item.billBodys && typeof(item.billBodys) == 'string') {
                const childList = JSON.parse(item.billBodys)
                billList = billList.concat(childList)
            }
            return item
        })
        const ret = await this.metaAction.modal('show', {
            title: '新增',
            width: modalWidth,
            height: modalHeight - 15,
            bodyStyle: {maxHeight: modalHeight - 68, overflowY: 'auto'},
            wrapClassName: 'adjust-wrap-top picking-lingliao-modal modal-padding-20-30',
            footer: null,
            closeModal: this.closeBom,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-stock-app-inventory-picking-lingliao', {
                store: this.component.props.store,
            })
        })
        if (ret) {
            this.reload()
        }
    }

    /* BOM领料 */
    bomPicking = async()=>{
        const currentOrg = this.metaAction.context.get('currentOrg')
        const name = currentOrg.name
        const stockInfo =  JSON.parse(sessionStorage['stockInfo' + name]) || {}
        const toPage = stockInfo.enableBOMFlag // 是否开启BOM领料
        const ret = await this.metaAction.modal('show',{
            title: 'bom领料',
            width: modalWidth,
            height: modalHeight- 15,
            wrapClassName: 'bomPicking-modal adjust-wrap-top modal-padding-20-30',
            bodyStyle: {maxHeight: modalHeight - 68,overflowY: 'auto'},
            footer: null,
            closeModal: this.closeBom,
            closeBack: (back) => { this.closeTip = back },
            children: <StockAppPickingBom
                store= {this.component.props.store}
                webapi= {this.webapi}
                metaAction={this.metaAction}
                component={this.component}
                currentOrg={currentOrg}
            ></StockAppPickingBom>
        })
    }


    // 快速领料
    fastPicking = async() => {
        const name = this.metaAction.context.get('currentOrg').name
        const stockInfo =  JSON.parse(sessionStorage['stockInfo' + name]) || {}
        const pageName ='ttk-stock-app-inventory-picking-fast'
        const ret = await this.metaAction.modal('show',{
            title: '快速领料',
            width: modalWidth,
            height: modalHeight- 15,
            bodyStyle: {maxHeight: modalHeight - 68,overflowY: 'auto'},
            wrapClassName: 'fast-picking-modal adjust-wrap-top modal-padding-20-30',
            footer: null,
            closeModal: this.closeBom,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp(pageName, {
                store: this.component.props.store,
            })
        })
    }

    // 关闭弹窗
    closeBom = async(ret) => { 
        this.closeTip()
        const { zanguCode, pickingCode } = ret
        if (ret && ret !== false) {
            if (zanguCode || pickingCode) {
                this.metaAction.toast('success', '保存成功')
                this.reload()
            }
        } 
    }

    // 定时关闭快速领料弹窗
    closeSuccessTips = (ret)=> { 
        const modalEle = document.querySelector(".fastpicking-success-tips-container")
        const modalBlock = modalEle && modalEle.parentNode && modalEle.parentNode.parentNode
        if(modalBlock){
            document.body.removeChild(modalBlock)
        }   
    }

    // 日期筛选
    rangePickerChange = (v, arr) => {
        this.metaAction.sfs({
            'data.form.strDate': momentUtil.momentToString(arr[0],'YYYY-MM-DD'),
            'data.form.endDate': momentUtil.momentToString(arr[1],'YYYY-MM-DD')
        })
    }

    dealData = () => {
        let list = this.metaAction.gf('data.list').toJS(), res = []
        list.forEach((x, i) => {
            if(x.selected) {
                let temp = [], data = JSON.parse(x.billBodys)
                data.forEach((y, j) => {
                    temp.push({
                        "accountName": this.metaAction.context.get("currentOrg").name,
                        "amount": y.ybbalance,
                        "billCode": x.code,
                        "billNname": "生产领料单",
                        "creator": x.operater,
                        "custName": x.supplierName,
                        "indexNo": j + 1,
                        "number": y.num,
                        "remarks": "",
                        "specification": y.inventoryGuiGe,
                        "stockCode": y.inventoryCode,
                        "stockName": y.inventoryName,
                        "storageDate": x.cdate,
                        "unit": y.inventoryUnit,
                        "unitPrice": y.price,
                        "voucherCode": x.voucherCodes
                    })
                    if(j == data.length - 1) {
                        res.push(temp)
                    }
                })
            }
        })
        if(!res.length) {
            this.metaAction.toast('error', '请勾选单据')
            return
        }
        return res
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data').toJS()
        return (
            <React.Fragment>
                <Layout className='ttk-stock-app-inventory-picking-backgroundColor'>
                    {this.renderSpin(data)}
                    {this.renderHeader(data)}
                    {this.renderContent(data)}
                </Layout>
                {this.renderFooter(data)}
            </React.Fragment>
        )
    }

    // loading元素
    renderSpin = (data) => {
        return (
            <React.Fragment>
                { data.loading && 
                    <div className='ttk-stock-app-spin'>
                       { stockLoading() } 
                    </div>
                }
            </React.Fragment>
        )
    }
    // 头部
    renderHeader = (data) => {
        const xdzOrgIsStop = this.metaAction.gf('data.xdzOrgIsStop')
        const {Item} = Menu, {RangePicker} = DatePicker

        let moreOption = !xdzOrgIsStop ?
             (
                <Menu onClick={this.moreActionOpeate}>
                    <Item className="app-asset-list-disposal" key='pickingLimits'>
                        领料范围
                    </Item>
                    <Item disabled={data.limit.stateNow} key='settlement'
                        className="app-asset-list-disposal">
                        删除单据
                    </Item>
                    <Item className="app-asset-list-disposal" key='deletePz'>
                        删除凭证
                    </Item>
                    <Item className="app-asset-list-disposal" key='exportData'>
                        导出
                    </Item>
                </Menu>
            )
            :
            (
                <Menu onClick={this.moreActionOpeate}>
                    <Item className="app-asset-list-disposal" key='exportData'>
                        导出
                    </Item>
                </Menu>
            )


        const popContent = (
            <div className='inv-batch-custom-popover-content'>
                <div className='filter-content'>
                    <div className='inv-batch-custom-popover-item'>
                        <span className='inv-batch-custom-popover-label'>
                            出库日期：
                        </span>
                        <RangePicker 
                            disabledDate={this.disabledDate} 
                            defaultPickerValue={[data.defaultPickerValue, data.defaultPickerValue]}
                            value={[ 
                                momentUtil.stringToMoment((data.form.strDate),'YYYY-MM-DD'),
                                momentUtil.stringToMoment((data.form.endDate),'YYYY-MM-DD')
                            ]}
                            placeholder={['开始日期', '结束日期']}
                            onChange={this.rangePickerChange} 
                            allowClear={true} 
                            className='popover-body-content-item-date' 
                            getCalendarContainer={(trigger) => trigger.parentNode}
                        />
                    </div>
                    <div className='inv-batch-custom-popover-item'>
                        <span className='inv-batch-custom-popover-label'>
                            来源：
                        </span>
                        <Select 
                            className='inv-batch-custom-popover-option' 
                            getPopupContainer={(trigger) => trigger.parentNode}
                            placeholder="请选择" 
                            filterOption={this.filterOptions} 
                            value={data.form.origin}
                            onSelect={(e) => this.changeOrign(e)} 
                            showSearch={true}
                        >{this.renderOption(ORIGINTYPE)}</Select>
                    </div>
                    <div className='inv-batch-custom-popover-item'>
                        <span className='inv-batch-custom-popover-label'>
                            凭证状态：
                        </span>
                        <Select 
                            className='inv-batch-custom-popover-option' 
                            getPopupContainer={(trigger) => trigger.parentNode}
                            placeholder="请选择" 
                            filterOption={this.filterOptions} 
                            value={data.form.voucherName}
                            onSelect={(e) => this.changeVoucherSelect(e)} 
                            showSearch={true}
                        >{this.renderOption(VOUCHERSTATUS)}</Select>
                    </div>
                </div>
                <div className='filter-footer'>
                    <Button type='primary' onClick={this.filterList}> 查询 </Button>
                    <Button className='reset-btn' onClick={this.resetForm}> 重置 </Button>
                </div>
            </div>
        )

        const mergeDropdown = (
            <Menu onClick={this.moreActionOpeate}>
                <Item className="app-asset-list-disposal" key='mergeVouchers'>
                    凭证合并
                </Item>
                <Item className="app-asset-list-disposal" key='subjectSetting'>
                    科目设置
                </Item>
            </Menu>
        )
        const { getInvSet={}, disabledBom, disalbledFPick, limit={}, other={}, bomList=[] } = data || {}
        const {stateNow} = limit
        const {activeTabKey} = other
        let fastTips = '', bomTips = ''
        const {
            isMaterial, 
            isCompletion, 
            isCarryOverProductCost, 
            isCarryOverMainCost, 
            isGenVoucher
        } = getInvSet || {}

        if(isMaterial){
            fastTips = '当前已存在领料单'
        }else if(!isCompletion){
            fastTips = '还未创建完工入库单'
        }else if(isCarryOverProductCost){
            fastTips = '当前已经结转生产成本'
        }else if(isCarryOverMainCost){
            fastTips = '当前已经结转出库成本'
        }else if(isGenVoucher){
            fastTips = '当前已结账'
        }
        bomTips = fastTips
        if(bomList.length<=0){
            bomTips = '未配置BOM'
        }

        return (
            <div className='ttk-stock-app-inventory-picking-header'>
                <div>
                    <div className='back' onClick={this.back}/>
                    <div className='reinit'>
                        {(
                            !xdzOrgIsStop && this.getInvSetByPeroid 
                            && this.getInvSetByPeroid.enableBOMFlag==1 
                            && this.getInvSetByPeroid.endCostType==1
                        ) && 
                            (<Tooltip className='btn-fast'  placement='bottomRight' 
                                title={(stateNow || disabledBom) && bomTips}>
                                <i></i>
                                <Button type='primary' className='myhelloworld-button'
                                    disabled={(stateNow || disabledBom)}
                                    onClick={ this.bomPicking }>
                                        BOM领料
                                </Button>
                            </Tooltip>)
                        }
                        {
                            (!xdzOrgIsStop && this.getInvSetByPeroid && this.getInvSetByPeroid.endCostType==0) && 
                            (<Tooltip className='btn-fast'  placement='bottomRight' 
                                title={(stateNow || disalbledFPick) && fastTips}>
                                <i></i>
                                <Button type='primary' className='myhelloworld-button'
                                    disabled={(stateNow || disalbledFPick)}
                                    onClick={ this.fastPicking }>
                                    快速领料
                                </Button>
                            </Tooltip>)
                        }
                        {!xdzOrgIsStop &&
                            <Button type='primary' className='myhelloworld-button' 
                                disabled={stateNow} 
                                onClick={this.addType}>
                                新增
                            </Button>
                        }
                        {!xdzOrgIsStop &&
                            <Button.Group className='voucher-button-group'>
                                <Button type='primary'     
                                    onClick={this.generateVoucher}>
                                    生成凭证
                                </Button>
                                <Dropdown name="batch3" trigger={["click"]} overlay={mergeDropdown}>
                                    <Button
                                        type="primary"
                                        icon="setting"
                                        style={{ marginLeft: "1px" }}
                                    />
                                </Dropdown>
                            </Button.Group>
                        }
                        
                        <PrintButton className='print-btn' params={{codeType: 'SCLL'}} dealData={this.dealData} />
                        
                        <Dropdown trigger={['click']} overlay={moreOption}>
                            <Button className='app-asset-list-header-more'>
                                <span>更多</span>
                                <Icon type='down'/>
                            </Button>
                        </Dropdown>
                    </div>
                </div>
                <div className='ttk-stock-app-inventory-picking-title'>
                    {
                        (activeTabKey == 1) && 
                        <div className='inv-app-batch-sale-header'>
                            <div className='header-left'>
                                <Input type='text' 
                                    className='inv-app-batch-sale-header-filter-input' 
                                    placeholder='编号/存货名称' 
                                    prefix={<Icon type='search'></Icon>}
                                    onChange={
                                        (e) => this.onSearch('data.inputVal', e.target.value)
                                    }
                                ></Input>
                                <Popover 
                                    trigger='click'
                                    placement='bottom'          
                                    content={popContent}
                                    visible={data.showPopoverCard} 
                                    onVisibleChange={this.handlePopoverVisibleChange}
                                    popupClassName='inv-batch-sale-list-popover' 
                                >
                                    <span className='inv-batch-custom-filter-btn header-item'>
                                        <Icon type='filter'/>
                                    </span>
                                </Popover>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }

    // dataGrid
    renderContent = (data) => {
        let {list, xdzOrgIsStop} = data
        list = list.map(v=>{
            v.billBodys = v.billBodys && JSON.parse(v.billBodys)
            v.detailLength = v.billBodys.length
            return v
        })
        const DETAILLENGTH = 5
        this.datagridList = list

        const columns = columnKeyArr.map(item=>{
            const {
                dataIndex, 
                width=1, 
                title, 
                className="", 
                align='center', 
                flexGrow=null, 
                type,
                precise,
                fixed,
                fixedRight
            } = item
            let titleHead = title
            if(dataIndex==='selected'){
                titleHead = (<Checkbox disabled={xdzOrgIsStop} checked={this.isSelectAll("dataGrid")} onChange={this.selectAll("dataGrid")}/>)
            }
            const col = (
                <Column 
                    columnKey={dataIndex} 
                    align="center" 
                    width={width} 
                    flexGrow={flexGrow}
                    fixed ={fixed}
                    fixedRight={fixedRight}
                    header={ <Cell>{titleHead}</Cell> }
                    cell={
                        ({rowIndex}) => {
                            let cellElement = ''
                            let record = list[rowIndex] || {}
                            let len = record.detailLength 
                            len = len > DETAILLENGTH ? (DETAILLENGTH+2) : (len+1)
                            const colHeight = {lineHeight: (len) * 37 + 'px'}
                            
                            if(dataIndex==='selected'){
                                cellElement = ( 
                                    <Cell style={colHeight} className="cell-padding8"> 
                                        <Checkbox  
                                            disabled={xdzOrgIsStop}
                                            checked={record.selected} 
                                            onChange={this.selectRow(rowIndex)}
                                        />
                                    </Cell>  
                                )
                            }else if(dataIndex==='code'){
                                cellElement = ( 
                                    <Cell tip={true} 
                                        align='left'
                                        style={colHeight} 
                                        value={record[dataIndex]}
                                        className='link-text cell-padding8'
                                        onClick={ this.lock( record.id, record.voucherIds ) } 
                                    />
                                )
                            }else if(dataIndex==='voucherCodes'){
                                cellElement = (
                                    <Cell 
                                        className='titledelect link-text cell-padding8' 
                                        align='left' 
                                        style={colHeight}
                                    >
                                        <span className='link-text' 
                                            onClick={ !xdzOrgIsStop ? this.checkoutVoucher(record.voucherIds) : void(0) } >
                                            {record[dataIndex]}
                                        </span>
                                        { record[dataIndex] && !xdzOrgIsStop && (
                                            <Icon fontFamily='del-icon' 
                                                type='close-circle' 
                                                className='del-icon' 
                                                onClick={ this.deleteOnly(record.id) }
                                            />)
                                        }
                                    </Cell>
                                )
                            }else if(dataIndex==='operationBtn'){
                                cellElement = (
                                    <Cell className={className} style={colHeight}>
                                        {!xdzOrgIsStop ?  
                                            <span className={ (data.limit.stateNow)? 'spanNoselect' : 'spanselect link-text'}
                                                onClick={this.delClick(record.id)}
                                            >删除</span>
                                            : 
                                            ''
                                        }
                                    </Cell>
                                )

                            }else if(dataIndex==='type'){
                                cellElement = (
                                    <Cell 
                                        className={`cell-padding8 ${className}`} 
                                        style={{...colHeight, whiteSpace: 'normal'}}
                                    >
                                       {BILLORIGIN[record[dataIndex]]}
                                    </Cell>
                                )

                            }else{
                                if(type && type.indexOf('detail')>-1){  
                                    const len = record.billBodys.length
                                    const details = []
                                    if(record.billBodys){
                                        const cellAlign = ['price', 'ybbalance'].includes(dataIndex) ? 'alignRight': 'alignLeft'
                                        record.billBodys.forEach((v, i)=>{
                                            if(i<DETAILLENGTH){
                                                const con = precise ? formatNumber(v[dataIndex] ,precise): v[dataIndex]
                                                details.push(<div className={`detail-cell ${cellAlign}`} title={con}> {con} </div>) 
                                            }
                                        })
                                    }
                                    
                                    if(len>DETAILLENGTH){
                                        const cell = dataIndex === 'inventoryCode' ? 
                                                <div className="detail-cell link-text" 
                                                    onClick={this.lock( record.id, record.voucherIds )}
                                                > 查看更多...</div>
                                            : <div className="detail-cell"/>
                                        details.push(cell)
                                    }
    
                                    let alignStyle = 'alignLeft', txt = ''
                                    switch (dataIndex) {
                                        case 'num':
                                            txt = formatNumber(record['billBodyNum'] ,precise) 
                                            break;
                                        case 'ybbalance':
                                            alignStyle = 'alignRight'
                                            txt = formatNumber(record['billBodyYbBalance'] ,precise) 
                                            break;
                                        case 'inventoryCode':
                                            txt = '合计'
                                            break;
                                    }
                                    let sumCell = <div className={ `sum-cell ${alignStyle}`} title={txt}> {txt} </div>
                                    details.push(sumCell)
                                    
                                    cellElement = (
                                        <Cell align={align} className="clearPadding">
                                            { details }
                                        </Cell>
                                    )
    
                                }else{
                                    cellElement = (
                                        <Cell 
                                            tip={true} 
                                            align={align} 
                                            style={colHeight}
                                            className={`${className} cell-padding8`} 
                                            value={record[dataIndex]} 
                                        />
                                    )
                                }
                                
                            }
                            return cellElement
                        }   
                    }
                />)
            return col

        })

        return (
            <Layout className='ttk-stock-app-inventory-picking-content'>
                <DataGrid 
                    name= 'dataGrid'
                    columns= {columns}
                    rowHeight={37}
                    rowHeightGetter={::this.rowHeightGetter}
                    rowClassNameGetter={::this.rowClassNameGetter}
                    ellipsis= {true} 
                    headerHeight= {37} 
                    rowsCount= {list.length}
                    allowResizeColumn   
                ></DataGrid>
            </Layout>
        )
    }
    
    rowHeightGetter = (idx)=>{
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let len = (list[idx].billBodys && typeof(list[idx].billBodys)==='string') && JSON.parse(list[idx].billBodys).length 
        len = len > 5 ? 7 : (len+1)
        return len * 37
    }

    rowClassNameGetter=(idx)=>{
        return ''
    }

    // footer渲染
    renderFooter = (data) => {
        const {pagination, listAll} = data  // 分页和底部合计
        const {
            billBodyNumMinus=0, 
            billBodyNumPlus=0, 
            billBodyYbBalanceMinus=0, 
            billBodyYbBalancePlus=0
        } = listAll
        return (
            <div className='ttk-stock-app-inventory-picking-footer'>
                <div className='ttk-stock-app-inventory-picking-footer-sumMsg'>
                    <span>合计</span>
                    <span className="numText">数量:   </span>
                    <span>{billBodyNumPlus}</span>
                    {transToNum(billBodyNumMinus) ? <span>{billBodyNumMinus}</span> : null}
                    <span className="numText">金额:  </span>
                    <span>{billBodyYbBalancePlus}</span>
                    {
                        ( transToNum(billBodyNumMinus) && transToNum(billBodyYbBalanceMinus) ) ? 
                        <span> { billBodyYbBalanceMinus } </span> : null
                    }
                </div>
                <Pagination
                    showTotal={this.pageShowTotal}
                    onChange={this.pageChanged}
                    onShowSizeChange={this.pageChanged}
                    showSizeChanger={true}
                    {...pagination}
                />
            </div>
        )
    }

    // 分页总页数
    pageShowTotal = () => {
        const pageObj = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS()||{}
        const total = pageObj['total'] || 0
        return `共有 ${total} 条记录`
    }
}


export default function creator(option) {
    const metaAction = new MetaAction(option),
	    extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}


