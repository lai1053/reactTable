import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Modal } from 'antd'
import {stockLoading, getClientSize, addEvent, removeEvent, canClickTarget } from '../commonAssets/js/common'
import { toJS, fromJS } from 'immutable'
import { BOMListTable } from './staticField'
let { modalHeight, modalWidth, modalBodyStyle } = getClientSize()
/*
    @params: {
        "state": 0, --状态 0未开，1开启
        "bInveControl": 0, --是否进行负库存控制 0否 1是
        "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
        "endCostType":0, 以销定产0、传统生产1
        "isGenVoucher":true, 是否结账，未生成 false 生成 true
        "isCompletion":true,是否本月有完工入库单 有 true 没有 false
        "startPeriod":"2019-09", 启用月份
        "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
        "isCarryOverProductCost":false, 结转生产成本凭证，未生成 false 生成 true
        "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
        "inveBusiness",1 --1工业自行生产，0 存商业
    }
*/
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.rowCount=0;
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = config.current.webapi
        injections.reduce('init')
        this.load()
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', async()=>{ 
                this.load()
            })
        }
    }

    componentDidMount=()=>{
        addEvent(window, 'resize', ::this.initClientSize)
    }

    componentWillUnmount=()=>{
        removeEvent(window, 'resize', this.initClientSize)
    }

    initClientSize = ()=>{
        const obj = getClientSize()
        modalHeight = obj.modalHeight
        modalWidth = obj.modalWidth
        modalBodyStyle = obj.modalBodyStyle
    }

    stockLoading =()=> stockLoading()
 
    // 存货列表
    load = async()=>{
        const data =  this.metaAction.gf('data') &&  this.metaAction.gf('data').toJS() || {}
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        const { pagination } = data
        const {currentPage, pageSize } = pagination
        let expandedRowKeys = []
        this.metaAction.sf('data.loading',true)
        let resp = await this.webapi.stock.getBOMConfigurationList({ 
            'pid': 0,
            'inventoryNameOrBomCode': "",	//存货名称或编号（模糊查询），非必填
            'page': {             
                'currentPage': currentPage || 0,    
                'pageSize': pageSize || 50      
            }
         })
        this.metaAction.sf('data.loading',false)
        if(resp){
            const list = resp.list.map(v=>{
                v.num = ''
                v.price = ''
                if(v.children.length===0){
                    delete v.children
                }else{
                    v.children = v.children.map(item=>{
                        item.hiddenCode = true
                        return item
                    })
                }
                return v
            })
            this.productList = list.slice(0)
            this.injections.reduce('updateSfs', {
                'data.list': fromJS(list),
                'data.pagination': fromJS(resp.page),
                'data.expandedRowKeys': fromJS(expandedRowKeys),
                'data.xdzOrgIsStop': xdzOrgIsStop
            })
        }
        setTimeout(()=>{this.getTableScroll()},100)
    }

    //行的收起与展开
    onRowExpand=(expanded, record)=>{
        const expandedRowKeys = this.metaAction.gf('data.expandedRowKeys') 
            && this.metaAction.gf('data.expandedRowKeys').toJS() || []
        if(expanded){
            expandedRowKeys.push(record.inventoryId)
        }else{
            const index = expandedRowKeys.findIndex(v=>v==record.inventoryId)
            if(index>-1){
                expandedRowKeys.splice(index, 1)
            }
        }
        this.injections.reduce('updateSfs',{
            'data.expandedRowKeys' : fromJS(expandedRowKeys)
        })
    }

    //渲染表格
    renderColumns = () =>{
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        const columns = BOMListTable.map(item=>{
            if(['inventoryName','inventoryCode'].indexOf(item.dataIndex) > -1 ){
                item.render = (text,record,index) => {
                    const ele = (record.pid!==0) ? (<div className="tdContent">{text}</div>)
                        : (<div className="tdContent-product">{text}</div>)
                    return ele
                }
            }
            if(item.dataIndex==='bomCode'){
                item.render = (text,record,index) =>{
                    const txt = record.hiddenCode ? '' : text
                    return txt
                }  
            }
            // 文本框溢出隐藏
            if(item.dataIndex==='inventoryName'){
                item.render = (text,record,index)=>{
                    return <div className="tdTextOverflow" title={text}>{text}</div>
                }
            }
            if(item.dataIndex==='operation'){
                item.render = (text, record, index) => {
                    return(
                        <React.Fragment>
                            { !xdzOrgIsStop && 
                                <div className="tableOperaton">
                                    { (record.pid==0) &&
                                        <span className="tableOperaton-btn link-text" 
                                            onClick={()=>{this.handleSelectBOM(text, record, index)}}>
                                                {'配置BOM'}
                                        </span>
                                    }
                                    {(record.pid==0) &&
                                        <span className="tableOperaton-seperation">{'|'}</span>
                                    }
                                    <span className="tableOperaton-btn link-text" 
                                        onClick={()=>{this.handleDel(text, record, index)}}>
                                            {'删除'}
                                    </span>
                                </div>
                            }
                        </React.Fragment>
                    ) 
                }
            }
            return item
        })
        return columns
    }

    // 输入框 模糊查询
    searchStock=(e)=>{
        const inpVal = e.target.value
        let filterList = this.productList.slice(0)
        let expandedRowKeys = []
        if(inpVal && inpVal.trim()){
            filterList = []
            this.productList.filter( v => {
                if( (v.inventoryName.indexOf(inpVal)>-1 || v.bomCode.indexOf(inpVal)>-1) ){
                    filterList.push(v)
                    expandedRowKeys.push(v.inventoryId)
                    return v
                }else if(   
                    v.children 
                    && Object.prototype.toString.call(v.children)==='[object Array]' 
                    && v.children.length!==0
                ){
                    v.children.filter(item=>{
                        if( (item.inventoryName.indexOf(inpVal)>-1 || item.inventoryCode.indexOf(inpVal)>-1) ){
                            filterList.push(v)
                            return item
                        }
                    })
                    expandedRowKeys.push(v.inventoryId)
                }
            })
        }
        clearTimeout(this.inputTimer)
        this.inputTimer = setTimeout(()=>{
            this.injections.reduce('updateSfs',{
                'data.list': fromJS(filterList),
                'data.expandedRowKeys': fromJS(expandedRowKeys)
            })
        },400)  
    }

    // 配置BOM
    handleSelectBOM = async(text, record, index) => {
        const ret = await this.metaAction.modal('show',{
            title: 'BOM配置',
            width: modalWidth,
            height: modalHeight,
            footer: null,
            closeModal: this.closeBom,
            wrapClassName: 'adjust-wrap-top',
            closeBack: (back) => { this.closeTip = back },
            bodyStyle: {maxHeight: modalBodyStyle+'px'},
            children: this.metaAction.loadApp('ttk-stock-card-picking-material',{
                store: this.component.props.store,
                pid: record.bomId,
                product: record
            })
        })
        if( ret ){ 
            setTimeout(()=>{ this.load() }, 1500)
        }  
    }

    // 关闭bom领料页面
    closeBom = (ret)=>{ this.closeTip() }

    // 删除产成品
    handleDel= async(text, record, index, isValidate)=>{
        let name=this.metaAction.context.get('currentOrg').name
        Modal.confirm({
            title: '请确认',
            content: '是否删除本条BOM清单',
            okText: '确认',
            cancelText: '取消',
            onOk: async()=>{
                const deleteIdList = [record.bomId]
                const canDelete = await this.webapi.stock.checkBOMConfigurationRefer({   // 校验产成品是否可以删除
                    deleteIdList, 
                    'period': sessionStorage['stockPeriod'+name] || ''
                })
                if(canDelete.code===0){
                    const resp = await this.webapi.stock.deleteBOM({ deleteIdList })
                    if(resp){ 
                        this.metaAction.toast('success','删除成功！')
                        setTimeout(()=>{ this.load() },350)    
                    }
                }else{
                    const tips = canDelete.code===1 ? '删除失败！原因：该条bom清单已被引用，不允许删除！'
                        : '删除失败！原因：发生未知错误，不允许删除！'
                    this.metaAction.toast('error', tips)
                } 
            }
        })  
    }
    
    // 去重
    delRepeat= (data)=>{
        const obj = {}, selectOptions = []
        data.map(v=>{     
            if(!obj[v.inventoryId]){
                obj[v.inventoryId] = v.inventoryId
                selectOptions.push(v) 
            }
        })
        return selectOptions
    }

    // 关闭选择产成品弹出框的回调事件
    closeProducts = async(ret)=>{
        this.closeTip()
        if(ret && Object.prototype.toString.call(ret)==='[object Array]'){ 
            const saveList = []
            ret.map(v=>{
                saveList.push({inventoryId: v.inventoryId})
                return v
            })
            const saveFlag = await this.webapi.stock.saveBOMConfigurationList({
                'inventoryId': "", 
                'bomId': "",    
                'pid': "",   
                'price': "",    
                'num': "",  
                'amount': "",   
                'deleteIdList': [],   //删除bomId列表，非必填（有删除记录时必填）
                'list': saveList
            })   
            if(saveFlag===null) {
                this.load()
            } 
        }
        
    }

    // 选择产成品
    selectProduct = async() =>{
        const hasClick = canClickTarget.getCanClickTarget('selectProduct')   // 重复点击
        if(!hasClick){
            canClickTarget.setCanClickTarget('selectProduct', true)
            let products = await this.webapi.stock.acquisitionFinishedProducts({ 
                'inventoryAttributes': 1405,       // 存货属性，必填：1403原材料；1405为产成品
                'inventoryNameOrBomCode': ""
             })
            let resp = []
            if(products){
                resp = products.map(v=>{
                    delete v.children
                    return v
                }) 
            }
            const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
            const selectedList = this.delRepeat(list)         // 已经配置了BOM结构的产成品，去重
            const ret = await this.metaAction.modal('show',{
                title: '选择产成品',
                wrapClassName: 'ttk-stock-card-BOM-select-product-container adjust-wrap-top',
                width: modalWidth,
                height: modalHeight,
                okText: '确定',
                footer: null,
                allowDrag: false,
                bodyStyle: {maxHeight: modalBodyStyle+'px'},
                closeModal: this.closeProducts,
                closeBack: (back) => { this.closeTip = back },
                children: this.metaAction.loadApp('ttk-stock-card-BOM-select-products',{
                    store: this.component.props.store,
                    wholeList: resp.slice(0),
                    selectedList   
                })
            })
            if(ret || !ret){
                canClickTarget.setCanClickTarget('selectProduct', false)
            }
        }
    }

   
    // 分页总页数
    pageShowTotal = () => {
        const total = this.metaAction.gf('data.pagination') ?
                      this.metaAction.gf('data.pagination').toJS()['totalCount'] : 0
        return `共有 ${total} 条记录`
    }

    // 分页跳转
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            pageSize = this.metaAction.gf('data.pagination') && 
                this.metaAction.gf('data.pagination').toJS().pageSize || 50
		}
        let page = { currentPage, pageSize }
        this.metaAction.sfs({
            ['data.pagination.currentPage']: currentPage,
            ['data.pagination.pageSize']: pageSize
        })
		this.load(page)
    }

     // 返回存货核算页面
     handleReturn =()=>{
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-inventory-BOM-picking-main')
        this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货管理', 'ttk-stock-Inventory-allocation')
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('ttk-stock-app-inventory-BOM-picking-main')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {return}
                setTimeout(() => { this.getTableScroll()}, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];
            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    delete tableOption.y
                    this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
                        ...tableOption,
                        x: width - 20 ,
                        y: height - theadDom.offsetHeight - 6 //- tfooterHeight,
                    })})     
                } else {
                    tableOption.y =  height - theadDom.offsetHeight //- tfooterHeight -5 //- tfooterHeight
                    if(tbodyDom.offsetHeight===0){
                        tableOption.y = height
                    }
                    this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
                        ...tableOption,
                        x: width - 20 ,
                        y: tableOption.y,
                    })})
                }
            }
        } catch (err) {}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

