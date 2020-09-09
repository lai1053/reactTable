import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import {Input, Table } from 'edf-component'
import VirtualTable from "../../../../invoices/components/VirtualTable/index"
import {
    stockLoading, 
    transToNum, 
    formatSixDecimal,
    deepClone, 
    getClientSize, 
    addEvent, 
    removeEvent,
    flatten
} from '../../../commonAssets/js/common'
import {columnField} from './fixedData'
import utils from 'edf-utils'
import { fromJS, toJS } from 'immutable'
import {  formatNumbe,formatprice } from '../../../common'
let modalHeight=0, 
    modalWidth=0, 
    modalBodyStyle={}

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
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.id= this.component.props.id;
        this.reqdata= this.component.props.data;
        this.component.props.setOkListener(this.onOk)
        this.component.props.setCancelLister(this.onCancel)
        this.cols = deepClone(columnField)
        this.sumWidth = columnField.reduce((total,item)=>(total + transToNum(item.width) ), 0)
        injections.reduce('init')
        this.resizeTable()
        this.load()
    }

    getColumns = async () => {
        const columns = this.metaAction.gf('data.columnData').toJS()
        this.metaAction.sf('data.columns', fromJS(columns))
    }

    stockLoading=()=>stockLoading()

    load = async () => {
        this.metaAction.sf('data.loading', true)
        let name=this.metaAction.context.get('currentOrg').name
        let serviceTypeCode='ZGRK'
        const currentOrg = sessionStorage['stockPeriod'+name]
        const response = await this.webapi.operation.findAutomatic({'serviceTypeCode':serviceTypeCode,'period':currentOrg})
        const propertyDetailFilter=await this.webapi.operation.findInventoryEnumList()
        this.resizeTable()
        this.injections.reduce('load', response, propertyDetailFilter)
        this.metaAction.sf('data.loading', false)
    }
    reload = async () => {
        this.metaAction.sf('data.loading', true)
        let name=this.metaAction.context.get('currentOrg').name
        const currentOrg = sessionStorage['stockPeriod'+name]
        let reqList={
            'serviceTypeCode':'ZGRK',
            'period':currentOrg,
            'code':this.metaAction.gf('data.inputVal'),
            'name':this.metaAction.gf('data.form.constom'),
        }
        const response = await this.webapi.operation.findAutomatic(reqList)
        this.injections.reduce('reload', response)
        this.metaAction.sf('data.loading', false)
    }

    onSearch = (path,data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(()=>{
            this.metaAction.sf(path, data)
            this.reload()
        },500)
    }

    onOk = async () => {
        return await this.save()
    }

    onCancel = async () => {
        this.component.props.closeModal && this.component.props.closeModal()
    }

    save = async () => {
        let data = this.metaAction.gf('data.list').toJS();
        let arr = []
        data.forEach(item=>{
            if(item.numberChange && item.priceChange&&item.moneryChange){
                item.num= item.numberChange
                item.price= item.priceChange
                item.ybbalance= item.moneryChange
                arr.push(item)
            }
        })
        const ret = await this.metaAction.modal('show', {
            title: '新增',
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {...modalBodyStyle},
            wrapClassName: 'ttk-stock-app-assessment-chonghui adjust-wrap-top modal-padding-20-30',
            footer:null,
            children: this.metaAction.loadApp('ttk-stock-app-inventory-assessment-add', {
                store: this.component.props.store,
                arr: arr,
                parentId: 1,
                znzg: true
            })
        })
        if (ret) {  // 修改createBillTitle
            this.component.props.closeModal()
        }
    }

    filterList = () => {
        this.metaAction.sf('data.showPopoverCard', false)
        this.reload()
    }

    handlePopoverVisibleChange = (visible) => {   
        if (visible) {
            const { form } = this.metaAction.gf('data').toJS()
            this.metaAction.sf('data.form', fromJS(form))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }

    resetForm = () => {
        const form ={
            'enableDate':'',
			'constom':''
        }
        this.metaAction.sf('data.form', form)
    }

    handleNumberChange=(value,record,index,row) => {
        if(row.dataIndex=='numberChange'){
            record.numberChange=formatprice(value)
            if(record.priceChange){
                record.moneryChange=formatNumbe( formatNumbe(record.priceChange)*formatNumbe(record.numberChange) ,2)
           
            }else{
                if(record.moneryChange){
                    record.priceChange=formatNumbe( formatNumbe(record.moneryChange)/formatNumbe(record.numberChange), 6)
                }
            }
            this.injections.reduce('update', 'data.list.'+index,record,index)  

        }else if(row.dataIndex=='moneryChange'){
            record.moneryChange=formatprice(value,2)
            if(record.numberChange){
                record.priceChange=formatNumbe( formatNumbe(record.moneryChange)/formatNumbe(record.numberChange), 6)
            }else{
                if(record.priceChange){
                    record.numberChange=formatNumbe( formatNumbe(record.moneryChange)/formatNumbe(record.priceChange), 6)
                }
            }
            this.injections.reduce('update', 'data.list.'+index,record,index)  
        
        }else{
            record.priceChange=formatprice(value)
            if(record.numberChange){
                record.moneryChange=formatNumbe( formatNumbe(record.priceChange)*formatNumbe(record.numberChange), 2)
            }else{
                if(record.moneryChange){
                    record.numberChange=formatNumbe( formatNumbe(record.moneryChange)/formatNumbe(record.priceChange), 6)
                }
            }
            
            this.injections.reduce('update', 'data.list.'+index,record,index)  
        }
    }

    renderCell = (text, record, row, index) => {
        if(row.dataIndex == 'numberChange'|| row.dataIndex == 'priceChange'){
            let txt = row.dataIndex=='numberChange' ? '请输入数量' : '请输入单价'
            let alignName = (row.dataIndex=='numberChange') ?  'alignLeft' : 'alignRight'
            return <Input.Number 
                className={ alignName } 
                regex='^([0-9]+)(?:\.[0-9]{1,6})?$' 
                title={text} 
                onBlur={(e) => this.handleNumberChange(e,record,index,row)} 
                value={formatprice(text)?formatprice(text):''} 
                placeholder={txt} 
                readonly 
            />  
        
        }else if(row.dataIndex == 'moneryChange'){
            return <Input.Number 
                className='alignRight' 
                regex='^([0-9]+)(?:\.[0-9]{1,2})?$' 
                title={text} 
                onBlur={(e) => this.handleNumberChange(e,record,index,row)} 
                value={formatprice(text,2)?formatprice(text,2):''} 
                placeholder="请输入金额" 
                readonly 
            />  
        
        }else{
            if(row.dataIndex==='num' || row.dataIndex==='price'){
                const styleClass = row.dataIndex==='num' ? 'alignLeft' : 'alignRight'
                return <span className='amount' title={text} >{text}</span>

            }else {
                const txt = typeof text === 'number'  ? utils.number.format(text, 2) : text
                return <span className='alignLeft' title={txt} >{txt} </span>
            }
        }         
    }

    /* 渲染行 */
    renderCols=()=>{
        const cols = this.cols.map(item=>{
            if(item.children && item.children.length>0){
                for(const v of item.children){
                    v.title= <div className="textCenter">{v.title}</div>
                    v.render = (text, record, index)=>( this.renderCell(text, record, v, index) )
                }
            }else{
                item.title= <div className="textCenter">{item.title}</div>
                item.render= (text, record) => ( <span title={text} className="textOverflow"> {text} </span> )
            }
            return item
        })
        return cols
    }

    /* 合计行的样式 */
    renderFooterColumn = ()=>{
        let orgiCols = deepClone(columnField)
        orgiCols.splice(0,1)
        const cols = orgiCols.map(item=>{
            if(item.children && item.children.length>0){
                for(const v of item.children){
                    v.render = (text,record,index)=>(<div className="textOverflow" title={text}>{text}</div>)
                }
            }else{
                if(item.dataIndex==='inventoryName'){
                    item.width= 200
                    item.align='center'
                }
                item.render = (text,record,index)=>(<div className="textOverflow" title={text}>{text}</div>)
            }
            return item
        })
        return cols
    }

    /* 合计行计算 */ 
    calTotal=(data)=>{
        let dlNum=0, dlYbbalance=0, ylNum=0, ylYbbalance=0, ckNumSum=0
        for(const item of data){
            dlNum = transToNum( (dlNum + transToNum(item.num)).toFixed(6) )                         // 待领料数量
            dlYbbalance = transToNum( (dlYbbalance + transToNum(item.ybbalance)).toFixed(2) )       // 带领料金额
            ylNum = transToNum( (ylNum + transToNum(item.numberChange)).toFixed(6) )                // 领料数量
            ylYbbalance = transToNum( (ylYbbalance + transToNum(item.moneryChange)).toFixed(2) )    // 领料金额
            ckNumSum = transToNum( (ckNumSum + transToNum(item.ckNum)).toFixed(6) )                 // 库存数量
        }
        const dataList = {
            'inventoryName': `合计（${data.length||0}条）`,
            'num': dlNum,
            'ybbalance': dlYbbalance,
            'numberChange': ylNum,
            'moneryChange': ylYbbalance,
            'ckNum': ckNumSum

        }
        const arr=[]
        arr.push(dataList)
        return  arr
    }


    // 合计数
    calTotal=(list, columnField)=>{
        const fieldArr = flatten(columnField)
        const arr = new Array(fieldArr.length).fill(0)
        list.map((el, i)=>{
            fieldArr.forEach((item, index)=>{
                let single = transToNum(el[item.dataIndex])
                if(item.sum){
                    single = transToNum( single.toFixed(item.format) )
                    arr[index] = arr[index] + single 
                    arr[index] = transToNum( arr[index].toFixed(item.format) )
                }else{
                    arr[index] = ''
                }
            })
        })
        fieldArr.map((v,i)=>{
            (!v.sum)&&(arr[i]='')
            if(v.format && v.sum){
                arr[i] = v.format==6 ? formatSixDecimal(arr[i]) : utils.number.format(arr[i], 2)
            }
        })
        return arr
    }

    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".assessmen-zangu-content")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight + 10) - 88 || 0
        let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
        this.computeColWidth(tableW)
        this.metaAction.sfs({
            'data.tableOption': fromJS({
                ...tableOption,
                x: tableW,
                y: tableH,
            })
        })
    }

    computeColWidth = tableW => {
        let increment = Math.floor((tableW - this.sumWidth) / 8)
        let sumWidth = 0
        this.cols.forEach((item, i)=>{
            if (item.children) {
                for (const el of item.children) {
                    el.width += increment
                    sumWidth += el.width
                }
            } else {
                item.width = item.flexGrow ? (item.width + increment) : item.width
                sumWidth += item.width
            }
        })
        this.sumWidth = sumWidth
        return sumWidth
    }


    renderSummaryRow = (list) => {
        let rowData = this.calTotal(list, columnField)
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                let cols = flatten(columns)
                const styleObj = {
                    'borderRight': '1px solid #d9d9d9',
                    'textAlign': 'left',
                    'padding': '0 10px',
                    'overflow': 'hidden',
                    'textOverflow': 'ellipsis',
                    'whiteSpace': 'nowrap'
                }
                const rows = cols.map((item, idx)=>{
                    const ownStyle={
                        ...styleObj, 
                        'width': (item.width) +'px', 
                        'textAlign': item.align, 
                        'flexGrow': item.flexGrow
                    }
                    const content = idx==0 ? '合计' : rowData[idx]
                    return (<div style={{...ownStyle}}> { content } </div>)
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }
        return summaryRows
    }

    /* 渲染表格 */
    renderTable =()=>{
        let data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()||[]
        const {tableOption, list} = data
        const cols = this.renderCols()
        return(
            <VirtualTable
                columns={cols}
                dataSource={data.list || []}
                key='intellignetTable'
                rowKey="inventoryId"
                style={{ width: `${tableOption.x}px` }}
                scroll={{ y: tableOption.y, x: tableOption.x}}
                summaryRows={this.renderSummaryRow(list)}
                bordered
                height={1000}
                width={tableOption.x+10}
                headerHeight={78}
                allowResizeColumn
            ></VirtualTable>
        )
        
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}