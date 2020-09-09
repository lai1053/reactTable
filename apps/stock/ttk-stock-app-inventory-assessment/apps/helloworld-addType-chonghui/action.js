import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Input, Table, Layout, Button, TableSort} from 'edf-component'
import {transToNum, stockLoading, formatSixDecimal, deepClone, getClientSize, addEvent, removeEvent, flatten} from '../../../commonAssets/js/common'
import utils from 'edf-utils'
import { fromJS, toJS } from 'immutable'
import { formatNumbe,formatprice } from '../../../common'
import {columnField} from './fixedData'
// import InvTable from '../../component/invTable'
import VirtualTable from '../../../../invoices/components/VirtualTable'

const colKeys = ['code', 'name', 'number', 'work', 'size','monery','pices']
const InputNumber = Input.Number

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
        this.unEditable = this.component.props.unEditable  // 是否结转出库凭证 
        this.voucherIds = this.component.props.voucherIds  // 是否已经生成凭证
        this.tableClass = "assessment-chonghui-" + new Date().valueOf()
        this.shortcutsClass = "assessment-chonghui-modal-container" + new Date().valueOf()
        this.cols = deepClone(columnField)
        this.sumWidth = columnField.reduce((total,item)=>(total + transToNum(item.width) ), 0)
        injections.reduce('init')
        this.resizeTable()
        this.load()
        
    }

    // componentDidMount=()=>{
    //     addEvent(window, 'resize', this.resizeTable)
    //     setTimeout(()=>{this.resizeTable()}, 100)
    // }

    // componentWillUnmount=()=>{
    //     removeEvent(window, 'resize', this.resizeTable)
    // }

    // 是否生成凭证
    isVoucher = () => (!this.voucherIds)

    // 是否已结转出库凭证
    isCarryOver = ()=> this.unEditable

    /*@description: 一般表单是否可编辑 
    *   可编辑: (已经结转出库成本 或 已经生成凭证)
    *   不可编辑: (没有结转出库成本 && 并且没有生成凭证)
    * @return {boolen} true——可编辑； false——不可编辑
    */
    commonEditable = () =>{
        return (!this.isCarryOver() && this.isVoucher())  // 是否是既没有结转出库成本 && 也没生成凭证
    }

    // 六位小数
    formatSixFn=(num)=>formatSixDecimal(num)

    /*@description: 日期是否可编辑 
    *   可编辑: (没有结转出库成本)
    *   不可编辑: (已经结转出库成本)
    * @return {boolen} true——可编辑； false——不可编辑
    */
    dateEditable = () =>{
        return (!this.isCarryOver())  // 没有结转主营成本
    }

    stockLoading =()=> stockLoading()

    load = async () => {
        this.metaAction.sf('data.loading', true)
        let serviceTypeCode='ZGRK'
        let name=this.metaAction.context.get('currentOrg').name
        const currentOrg = sessionStorage['stockPeriod'+name]
        this.time=currentOrg
        let reqList={
            'serviceTypeCode':serviceTypeCode,
            'period':currentOrg,
            'ids':JSON.stringify(this.reqdata),
            'code':this.metaAction.gf('data.inputVal'),
       }
        let response = await this.webapi.operation.findPreliminaryRetur(reqList) || []
        this.supplierId= (response && response.length>0)?response[0].supplierId:''
        this.metaAction.sf('data.loading', false)
        if(this.component.props.afterImport) { // 处理导入的数据
            response = await this.dealImportData(response)
            this.metaAction.sf('data.btnDisabled', false)
        }
        this.resizeTable()
        this.injections.reduce('load', response)
        
    }

    // 筛出与导入相关数据，并获取冲回金额
    dealImportData = async (response) => {
        let res = []
        const importList = this.component.props.importList
        for(let i = 0, length = importList.length; i < length; i++) {
            for(let j = 0, len = response.length; j < len; j++) {
                if(importList[i].inventoryId == response[j].inventoryId) {
                    response[j].numberChange = Number(importList[i].backNum)
                    res.push(response[j])
                    break;
                }
            }
        }
        for(let el of res) {
            let reqList = {
                'ids': JSON.stringify(this.reqdata),
                'period': this.time,
                'billBodyNum': el.numberChange,
                'inventoryId': el.inventoryId,
                'serviceTypeCode': 'ZGRK',
            }
            let firstRush = await this.webapi.operation.findFirstRush(reqList)
            let moneryChange = 0, priceChange = 0
            if (firstRush && firstRush.length > 0) {
                firstRush.forEach(item => {
                    moneryChange = formatNumbe(moneryChange) + formatNumbe(item.ybbalance)
                })
            }
            priceChange = formatprice(el.num) == el.numberChange 
                        ? formatprice(el.price) 
                        : formatNumbe( formatNumbe(moneryChange) / formatNumbe(el.numberChange), 6)

            el.priceChange = priceChange
            el.moneryChange = moneryChange
        }
        return res
    }

    onSearch = (path,data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(()=>{
            if(this.component.props.afterImport) {
                let initialList = this.metaAction.gf('data.initialList').toJS() || []
                const list = initialList.filter((el) => {
                    return el.inventoryCode.includes(data) || el.inventoryName.includes(data) 
                })
                this.injections.reduce('updateSfs', {
                    'data.list': fromJS(list)
                })
            } else {
                this.metaAction.sf(path, data)
                this.load()
            }
        },700)
    }

    onOk = async () => 
        await this.save()
    
    onCancel = () => 
        this.component.props.closeModal()
    
    save = async () => {
        let data
        if(this.component.props.afterImport) { // 导入的数据
            data = this.metaAction.gf('data.initialList').toJS();
        } else {
            data = this.metaAction.gf('data.list').toJS();
        }
        let form={
            'supplierId': this.supplierId,
            'ids': this.id==1?'':this.reqdata,
            'period': this.id==1?'':this.time
        }
        let arrlist=[]
        data.forEach(item=>{
            if(item.numberChange){
                let arr={}
                arr.inventoryCode=item.inventoryCode || null
                arr.inventoryName=item.inventoryName || null
                arr.inventoryGuiGe=item.inventoryGuiGe || null
                arr.inventoryUnit=item.inventoryUnit || null
                arr.num= item.numberChange
                arr.price= item.priceChange
                arr.ybbalance= item.moneryChange
                arr.inventoryId=item.inventoryId
                if(item.detailList){
                    let detailList=[]
                    item.detailList.forEach(v=>{
                        let arri={}
                        arri.inventoryCode=item.inventoryCode || null
                        arri.inventoryName=item.inventoryName || null
                        arri.inventoryGuiGe=item.inventoryGuiGe || null
                        arri.inventoryUnit=item.inventoryUnit || null
                        arri.num= v.number
                        arri.price= v.price
                        arri.ybbalance= v.monery
                        arri.id= v.id
                        arri.inventoryId = item.inventoryId
                        if(transToNum(arri.num)>0 && transToNum(arri.ybbalance)>0){
                            detailList.push(arri)  
                        }           
                    })
                    arr.detailList=detailList
                }
                arrlist.push(arr)
            }
        })
        
        if (arrlist.length==0){
            this.metaAction.toast('error', '请填写数据')
            return false
        } 

        const ret = await this.metaAction.modal('show', {
            title: '新增',
            okText: '保存',
            width: modalWidth,
            height: modalHeight,
            footer: null,
            wrapClassName: 'ttk-stock-app-assessment-chonghui adjust-wrap-top modal-padding-20-30',
            bodyStyle: {...modalBodyStyle},
            children: this.metaAction.loadApp('ttk-stock-app-assessment-chonghui', {
                wrapClassName: 'ttk-stock-app-assessment-chonghui',
                store: this.component.props.store,
                arr:arrlist,
                id:'',
                code:'',
                form:form
            })
        })
        if (ret) {   // 修改createBillTitle
            this.component.props.closeModal(ret)
        }else{
            return ret
        }
    }
    filterList = () => {
        const { form } = this.metaAction.gf('data').toJS()
        this.metaAction.sfs({
            'data.form': fromJS(form),
            'data.showPopoverCard': false
        })
        this.load()
    }

    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { form } = this.metaAction.gf('data').toJS()
            this.metaAction.sf('data.form', fromJS(form))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }

    resetForm = () => {
        const form = {
            'enableDate': '',
			'constom': ''
        }
        this.metaAction.sf('data.form', form)
    }

    inputClick=(record,e)=>{
        e && e.preventDefault && e.preventDefault()
        clearTimeout(this.inputTimer)
        this.inputTimer = setTimeout(()=>{
            this.handleNameChange(record)
        },500) 
    }

    // 按明细冲回的冲回明细
    handleNameChange= async (record, event) => {
        const id=record.inventoryId
        let inventoryGuiGe = record.inventoryGuiGe ? '('+record.inventoryGuiGe+')': ''
        const ret = await this.metaAction.modal('show', {
            title: '暂估冲回'+'-'+record.inventoryCode+'  '+record.inventoryName+inventoryGuiGe,
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {...modalBodyStyle},
            wrapClassName: 'adjust-wrap-top modal-padding-20-30',
            children: this.metaAction.loadApp('assessment-chonghui', {
                store: this.component.props.store,  
                id: id,
                ids: this.reqdata,
                time: this.time             
            })
        })

        if (ret) {
            let id=ret[0].inventoryId;
            let numberChange=0;
            let moneryChange=0;
            ret.forEach((item, index) =>{
                numberChange=formatNumbe(formatNumbe(item.number)+formatNumbe(numberChange),6)
                moneryChange=formatNumbe(formatNumbe(item.monery)+formatNumbe(moneryChange),2)
            })
            let flag = false
            let data = this.metaAction.gf('data.list').toJS();
            data.forEach((item, index) =>{
                if(item.inventoryId==id){
                    data[index].numberChange = numberChange
                    data[index].moneryChange = moneryChange
                    data[index].priceChange = formatNumbe(formatNumbe(moneryChange)/formatNumbe(numberChange),6)
                    if(this.id==1){
                        data[index].detailList = []
                        data[index].detailList = ret
                    }
                    if(transToNum(numberChange) > 0) flag = true
                }
            })
            if (flag) {
                this.metaAction.sf('data.btnDisabled', false)
            } else {
                if(data.findIndex(item => transToNum( item.numberChange ) > 0) === -1) 
                this.metaAction.sf('data.btnDisabled', true)   
            }
            this.injections.reduce('updateList', data)
        }
    }
    
    queryNumber = async(value, record, index) => {
        let numberChange = formatprice(value) > formatprice(record.num) ? formatprice(record.num) : formatprice(value)
        let reqList = {
            'ids': JSON.stringify(this.reqdata),
            'period': this.time,
            'billBodyNum': numberChange,
            'inventoryId': record.inventoryId,
            'serviceTypeCode': 'ZGRK',
        }
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.operation.findFirstRush(reqList)
        this.metaAction.sf('data.loading', false)
       
        let moneryChange = 0, priceChange = 0
        if (response && response.length > 0) {
            response.forEach(item => {
                moneryChange = formatNumbe(moneryChange) + formatNumbe(item.ybbalance)
            })
        }
        // 反算单价，单价=金额/数量
        priceChange = formatprice(record.num) == numberChange ? 
            formatprice(record.price) 
            : formatNumbe(formatNumbe(moneryChange) / formatNumbe(numberChange), 6)

        numberChange = formatNumbe(numberChange, 6)
        
        let data = this.metaAction.gf('data.list').toJS()
        let flag = false
        data.forEach(item => {
            if (item.inventoryId == record.inventoryId) {
                item.priceChange = priceChange
                item.moneryChange = moneryChange
                item.numberChange = numberChange
                if (transToNum(numberChange) > 0) flag = true
            }
        })
         
        if (flag) {
            this.metaAction.sf('data.btnDisabled', false)
        } else {
            if(data.findIndex(item => transToNum(item.numberChange) > 0) === -1) 
            this.metaAction.sf('data.btnDisabled', true)   
        } 
        this.injections.reduce('updateList', data)
    }


    handleNumberChange = (value, record, index) => {
        return this.queryNumber(value, record, index)
    }

    renderNumCell = (text, record, row, index) => {
        const { align } = row
        if(row.dataIndex == 'numberChange'){
            const numText = formatSixDecimal(text) ? formatSixDecimal(text): ''
            if (this.component.props.afterImport) {
                return <div className={align} title={ numText } style={{padding: '0 4px'}}>
                            { numText }
                        </div>
            }
            
            if (this.id == 1) {   
                // 按明细冲回
                return <InputNumber 
                    regex='^([0-9]+)(?:\.[0-9]{1,6})?$' 
                    title={ numText } 
                    value={ numText } 
                    key='zgdetail'
                    onFocus={(event)=>{this.inputClick(record)} } 
                    className={align} 
                    placeholder="请输入数量" 
                    readonly
                />  
            } else {   
                //按先进先出冲回
                return <InputNumber 
                    regex='^([0-9]+)(?:\.[0-9]{1,6})?$' 
                    key='fifo'
                    title={ numText } 
                    value={ numText } 
                    onBlur={(v) => this.handleNumberChange(v, record, index)} 
                    className={`editable-cell ${align}`}
                    placeholder="请输入数量" 
                />  
            }
        } else {
            if (row.dataIndex == 'ybbalance' || row.dataIndex == 'moneryChange') {
                const txt = formatNumbe(text,2) ? formatNumbe(text,2) : ''
                return <div className={align} title={ txt }> { txt } </div>

            } else {
                const priceText = formatSixDecimal(text) ? formatSixDecimal(text): ''
                return <div className={align} title={ priceText } > { priceText } </div>
            }
        }
    }

    // 列渲染
    renderColumns = ()=>{
        const {sort} = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const cols = this.cols.map(item=>{
            if(item.children && item.children.length>0){
                for(const v of item.children){
                    v.render = (text, record, index)=>(this.renderNumCell(text, record, v, index))
                }
            }else{
                if(item.dataIndex==='ckNum'){
                    item.title = <TableSort
                        title= {'库存数量'}
                        sortOrder={sort || null}
                        handleClick={e => this.sortChange(e)}
                    />
                }
                item.render = (text, record, index)=>{
                    const {align} = item
                    return( 
                        <div className={`textOverflow ${align}`} title={text} style={{'textAlign': 'center'}}>
                            {text}
                        </div>
                    )
                }
            }
            return item
        })
        return cols
    }

    // 库存数量排序
    sortChange = (e)=>{
        const { list=[] } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        list.sort( (a, b)=>{
            const ret = e==='asc' ? (a.ckNum - b.ckNum) : (b.ckNum-a.ckNum)
            return ret
        } )
        this.metaAction.sfs({
            'data.sort': e.slice(0, 3),
            'data.list': fromJS(list)
        })
    }

    renderTable = () =>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {list=[], tableOption={}} = data
        const key = this.id !==1 ? 'fifo' : 'detail'
        return(
            <VirtualTable
                columns={this.renderColumns()}
                dataSource={list}
                key='chonghui'
                rowKey="inventoryId"
                key={key}
                style={{ width: `${tableOption.x}px` }}
                scroll={{ y: tableOption.y, x: tableOption.x}}
                // scrollTop={scrollTop}
                summaryRows={this.renderSummaryRow(list)}
                bordered
                height={1000}
                width={tableOption.x+10}
                headerHeight={78}
                allowResizeColumn
            />  
        )
    }

    // 合计数
    calTotal=(list, field)=>{
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
        const ele = document.querySelector(".helloworld-addType-chonghui-content")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight + 10) || 0
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
        let increment = Math.floor((tableW - this.sumWidth ) / 8)
        let sumWidth = 0
        this.cols.forEach((item, i)=>{
            if (item.children) {
                for (const el of item.children) {
                    el.width += increment
                    sumWidth += el.width
                }
            } else {
                item.width = (item.flexGrow || item.sum)  ? (item.width + increment) : item.width
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

    mousedown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path))
        } else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }

    getCellInfo(path) {
        const parsedPath = utils.path.parsePath(path)

        const rowCount = this.metaAction.gf('data.list').size
        const colCount = 4
        var colKey = parsedPath.path
            .replace('root.children.table.columns.', '')
            .replace('.cell.cell', '')
            .replace(/\s/g, '')

        return {
            x: colKeys.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }
    handleChangeHwmc = (rowIndex, v) => {
        
        let obj;
        if (v instanceof Object) {
            let hwmc= v.name;

            obj = {
                [`data.list.${rowIndex}.hwmc`]: hwmc, //商品名称
            }
        } else {
            obj = {
                [`data.list.${rowIndex}.hwmc`]: v,
            }
        }
        this.injections.reduce('updateSfs', obj)
    }
    focusCell(position) {
        this.metaAction.sfs({
            'data.other.focusFieldPath': `root.children.table.columns.${colKeys[position.x]}.cell.cell,${position.y}`,
            'data.other.scrollToRow': position.y,
            'data.other.scrollToColumn': position.x
        })

        setTimeout(this.cellAutoFocus, 16)
    }

    cellAutoFocus = () => {
        utils.dom.gridCellAutoFocus(this.component, '.editable-cell')
    }  

    getCellClassName = (path) => {
        return this.metaAction.isFocus(path) ? 'ttk-edf-app-operation-cell editable-cell' : ''
    }

    isFocusCell = (ps, columnKey) => {
        const focusCellInfo = this.metaAction.gf('data.other.focusCellInfo')
        if (!focusCellInfo)
            return false
        return focusCellInfo.columnKey == columnKey && focusCellInfo.rowIndex == ps.rowIndex
    }

    gridBirthdayOpenChange = (status) => {
        if (status) return
        const editorDOM = ReactDOM.findDOMNode(this.component).querySelector(".editable-cell")
        if (!editorDOM) return

        if (editorDOM.className.indexOf('datepicker') != -1) {
            const input = editorDOM.querySelector('input')
            input.focus()
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}