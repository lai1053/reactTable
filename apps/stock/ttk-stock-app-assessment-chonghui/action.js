import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Input, DataGrid, DatePicker, Select, Layout, Button } from 'edf-component'
import moment from 'moment'
import utils from 'edf-utils'
import { moment as momentUtil } from 'edf-utils'
import { Map, fromJS } from 'immutable'
import { formatNumbe } from './../common'
import { transToNum, deepClone ,stockLoading, billDisabledDate} from '../commonAssets/js/common'

const colKeys = ['code', 'name', 'number', 'work', 'size','monery','pices']

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        const id = this.component.props.id
        const code = this.component.props.code
        this.arr = this.component.props.arr
        this.form = this.component.props.form || {}
        this.unEditable = this.component.props.unEditable  // 是否结转出库凭证 
        this.voucherIds = this.component.props.voucherIds  // 是否已经生成凭证
        injections.reduce('init')
        this.load(id,code)
    }

    stockLoading = (param) => stockLoading(param)

   
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

    /*@description: 日期是否可编辑 
    *   可编辑: (没有结转出库成本)
    *   不可编辑: (已经结转出库成本)
    * @return {boolen} true——可编辑； false——不可编辑
    */
    dateEditable = () =>{
        return (!this.isCarryOver())  // 没有结转主营成本
    }

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = (currentDate) => billDisabledDate(this, currentDate, 'data.form.cdate')

    load = async (id,code) => {
        if(this.arr){
            this.id=''
            this.injections.reduce('load', this.arr, this.form, '')
        
        }else{
            this.metaAction.sf('data.loading', true)
            const serviceTypeCode = code ? 'ZGHC' : 'ZGRK'
            this.id = code && id
            let resp = await this.webapi.operation.findBillTitleById({serviceTypeCode, 'id':id})
            this.metaAction.sf('data.loading', false)
            if(resp){
                const list = (resp.billBodys && typeof(resp.billBodys)=='string') && JSON.parse(resp.billBodys)
                this.injections.reduce('load', list, resp, code)
            }
        }

        let dataObj = {}
        if(!code){
            let time = await this.getTime()
            let period = moment(time).format('YYYY-MM')
            let billCode = await this.webapi.operation.query({
                'serviceTypeCode':'ZGHC',
                'period': period
            })
            dataObj = ({}, dataObj, {   
                'data.form.cdate': time,
                'data.form.code': billCode,
            })
        }
       
        const supplierListReq = this.webapi.operation.findSupplierList({})
        const supplierList = await supplierListReq
        const supplierOptions = supplierList.map(item => {
            return (
                <Option key={item.supplierId} value={item.supplierCode} title={item.supplierName}>
                   {item.supplierName}
                </Option>
            )
        })     
        this.metaAction.sfs({
            ...dataObj,
            'data.loading': false,
            'data.spinLoading': false,
            'data.form.supplierList': fromJS(supplierList),
            'data.form.supplierOptions': fromJS(supplierOptions)
        })
    }

    getTime = async() => {
        let period = ''
        const getSystemDate = await this.webapi.operation.getSystemDate()
        let systemDate = momentUtil.stringToMoment(getSystemDate).format('YYYY-MM')
        let name = this.metaAction.context.get('currentOrg').name 
        let stockPeriod = sessionStorage['stockPeriod'+name]
        if(systemDate == stockPeriod){  //重新查询单据编号和冲回日期 
            period = momentUtil.stringToMoment(getSystemDate).format('YYYY-MM-DD')
            
        }else{
            let year = stockPeriod.split('-')
            let currentMonth = Number(year[1])+1
            let currentYear = currentMonth > 12 ? (Number(year[0])+1) : year[0]
            currentMonth = currentMonth > 12 ? 1 : currentMonth
            let currentDate = moment((currentYear +'-'+ currentMonth + '-'+'01' ), 'YYYY-MM-DD').valueOf()
            period = moment((currentDate - 24 * 60 * 60)).format('YYYY-MM-DD')
        }
        return period
    }

    filterIndustry = (input, option) =>   
       option.props.children.indexOf(input) >= 0

    selectOption = async(path,data) => {
        let id=''
        const supplierList = this.metaAction.gf('data.form.supplierList').toJS()
        supplierList.forEach(item => {
            if(item.supplierCode==data){
                id = item.supplierId
                return
            }
        })
        this.metaAction.sfs({
            [path]: data,
            'data.form.supplierId': id
        })
    }

    getSelectOptionInventory = () => this.selectOptionInventory || []

    onOk = async () =>  await this.save()
    
    save = async () => {
        let reqList={
            serviceTypeCode:'ZGHC',
            code:'',
            cdate:'',
            supplierId:'1',
            supplierName:'温州东旭阀门铸造有限公司',
            operater:'liucp',
            billBodys:''
        }
        var form = this.metaAction.gf('data.form').toJS()
        
        const ok = await this.check([
        {
            path: 'data.form.cdate', value: form.cdate
        }, {
            path: 'data.form.code', value: form.code
        }])

        if (!ok) {
            this.metaAction.sf('data.loading', false)
            return false
        }
        
        let list = this.metaAction.gf('data.list').toJS()
        let detaliList=[]
        // debugger
        list.forEach(item=>{
            if(item.detailList){
                item.detailList.forEach(item1=>{
                    item1.num=formatNumbe(item1.num)
                    item1.price=formatNumbe(item1.price)
                    item1.ybbalance=formatNumbe(item1.ybbalance)
                    detaliList.push(item1)                
                })
                
            }else if(item.inventoryCode || item.inventoryName){
                item.num=formatNumbe(item.num)
                item.price=formatNumbe(item.price)
                item.ybbalance=formatNumbe(item.ybbalance)
                detaliList.push(item)
            }
        })
        
        reqList.billBodys=JSON.stringify(detaliList)
        reqList.code=form.code
        reqList.cdate=form.cdate
        reqList.supplierName=form.supplierName
        reqList.operater=form.operater
        reqList.supplierId=form.supplierId
        let res = ''
        if(form.ids){
            reqList.ids = JSON.stringify(form.ids)
            let name=this.metaAction.context.get('currentOrg').name
            const currentOrg = sessionStorage['stockPeriod'+name]
            reqList.period = currentOrg
            this.metaAction.sf('data.loading', true)
            res = await this.webapi.operation.createBillTitleZGHCByFirst(reqList)
            this.metaAction.sf('data.loading', false)
        }else{
            if(this.id){
                reqList.id=this.id
                this.metaAction.sf('data.loading', true)
                res = await this.webapi.operation.updateBillTitle(reqList) 
                this.metaAction.sf('data.loading', false)
            }else{
                let copyList = deepClone(detaliList), rList = []
                copyList.forEach(item=>{
                    if(item.detailList){
                        item.detailList.forEach(item1=>{
                            item1.num=formatNumbe(item1.num)
                            item1.price=formatNumbe(item1.price)
                            item1.ybbalance=transToNum(formatNumbe(item1.ybbalance,2))
                            rList.push(item1)                
                        })
                    }else{
                        item.num=formatNumbe(item.num)
                        item.price=formatNumbe(item.price)
                        item.ybbalance=transToNum(formatNumbe(item.ybbalance,2))
                        rList.push(item)
                    }
                })
                reqList.billBodys=JSON.stringify(rList)
                this.metaAction.sf('data.loading', true)
                res = await this.webapi.operation.createBillTitle(reqList)
                this.metaAction.sf('data.loading', false)
            }             
        }
        if(res){
            this.metaAction.toast('success', '保存成功')
            this.component.props.closeModal && this.component.props.closeModal(res)
        }else{
            return false
        }
    }

    onCancel=()=>{
        this.component.props.closeModal && this.component.props.closeModal(false) 
    }

    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return
        
        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.cdate') {
                Object.assign(r, await this.checkCdate(o.value))
            }
            else if (o.path == 'data.form.code') {
                Object.assign(r, await this.checkSupplierName(o.value))
            }
            checkResults.push(r)
        }
        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)
        return hasError
    }

    checkCdate = async (code) => {
        var message

        if (!code)
            message = '请选择入库日期'

        return { errorPath: 'data.other.error.cdate', message }
    }
    checkSupplierName = async (name) => {
        var message

        if (!name)
            message = '请录入单据编号'

        return { errorPath: 'data.other.error.code', message }
    }
    addRow = (ps) => {
        this.injections.reduce('addEmptyRow', ps.rowIndex + 1)
    }

    delRow = (ps) => {
        const list = this.metaAction.gf('data.list')
        if(list.size>1){
            const id = list.getIn([ps.rowIndex, 'id'])
            this.injections.reduce('delrow', id)
        }else{
            this.metaAction.toast('warning', '最后一行不可删除！')
        }
        
    }

    mousedown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path))
        }
        else {
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
        let obj
        if (v instanceof Object) {
            let hwmc= v.name

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

    getListColumns = () => {
        const list = this.metaAction.gf('data.list').toJS()
        let cols = []
        let { Column, Cell } = DataGrid
        let headerKeys
        if (!list) return cols
        headerKeys =  { 
            inventoryCode: "存货编号", 
            inventoryName: "存货名称", 
            inventoryGuiGe: "规格型号", 
            inventoryUnit: "单位", 
            num: "数量", 
            price: "单价", 
            ybbalance: '金额', 
        }
        Object.keys(headerKeys).forEach(op => {
            let col = <Column 
                flexGrow={1} 
                width={50}
                header={ <Cell name='header' className="my-class-center"> {headerKeys[op]}</Cell> }
                cell={(ps) => {
                    if(op=='num' || op=="price" || op=="ybbalance" ){
                        ps.align = 'right'
                        
                        return <Cell 
                                    className="my-class"
                                    value={list[ps.rowIndex][op]}
                                    title={list[ps.rowIndex][op]}
                                />
                                
                    }else if(op=='inventoryCode'){
                        ps.align = 'center'
                        return <Cell 
                                    className="my-class-center"
                                    value={list[ps.rowIndex][op]}
                                    title={list[ps.rowIndex][op]}
                                />
                                    
                    }else{
                        return <Cell 
                                value={list[ps.rowIndex][op]}
                                title={list[ps.rowIndex][op]}/>
                    }
                }}
            />
            cols.push(col)
        })
        return cols
    }
    
    quantityFormat = (quantity, decimals, isFocus) => {
		if (quantity) {
			return formatNumbe(quantity,decimals)
		}
    }

    renderTable=()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        this.chList = data.list || []
        this.listAll = data.listAll
        const {Column, Cell} = DataGrid
        const cols = [
            <Column
                flexGrow={1}
                width={75}
                align='left'
                header= {
                    <Cell className='dataGrid-tableHeaderNoBoder'>存货编号</Cell>
                }
                cell= {
                   ({rowIndex})=>{
                       const record = this.chList[rowIndex]
                       const {inventoryCode} = record
                       return <Cell
                            align='left'
                            title={inventoryCode}
                            value={inventoryCode}
                            onChange={(e)=>
                                this.metaAction.sf('data.list.' + rowIndex + '.inventoryCode', e.target.value)
                            }
                       ></Cell>
                   }
                }
            >
            </Column>,
            <Column
                align='left'
                flexGrow={1}
                width={130}
                header= { <Cell className='dataGrid-tableHeaderNoBoder'>存货名称</Cell> }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {inventoryName} = record
                        return <Cell
                            align='left'
                            title={inventoryName}
                            value={inventoryName}
                        ></Cell>
                    }
                }
            >
            </Column>,
            <Column
                flexGrow={1}
                width={75}
                align='left'
                header= { <Cell className='dataGrid-tableHeaderNoBoder'>规格型号</Cell> }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {inventoryGuiGe} = record
                        return <Cell
                            align='left'
                            title={inventoryGuiGe}
                            value={inventoryGuiGe}
                            onChange={(e)=>this.metaAction.sf('data.list.' + rowIndex + '.inventoryGuiGe', e.target.value)}
                        ></Cell>
                    }
                }
            >
            </Column>,
            <Column
                flexGrow={1}
                width={75}
                align='left'
                header= {
                    <Cell className='dataGrid-tableHeaderNoBoder'>单位</Cell>
                }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {inventoryUnit} = record
                        return <Cell
                            align='left'
                            title={inventoryUnit}
                            value={inventoryUnit}
                            onChange={(e)=>this.metaAction.sf('data.list.' + rowIndex + '.inventoryUnit', e.target.value)}
                        ></Cell>
                    }
                }
            >
            </Column>,
            <Column
                align='left'
                flexGrow={1}
                width={75}
                header= { <Cell className='dataGrid-tableHeaderNoBoder'>数量</Cell> }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {num} = record
                        return <Cell
                            align='left'
                            timeout={true}
                            tip={true}
                            interceptTab={true}
                            className='mk-datagrid-cellContent-left'
                            title={this.quantityFormat(num)}
                            value={this.quantityFormat(num)}
                        ></Cell>
                    }
                }
                footer={
                    < Cell
                        className='mk-datagrid-cellContent-left'
                        value={this.listAll.billBodyNum}
                        title={this.listAll.billBodyNum}
                    />
                }
            >
            </Column>,
            <Column
                align='right'
                flexGrow={1}
                width={75}
                header= { <Cell className='dataGrid-tableHeaderNoBoder my-class-center'>单价</Cell> }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {price} = record
                        return <Cell
                            align='right'
                            timeout={true}
                            tip={true}
                            interceptTab={true}
                            className='mk-datagrid-cellContent-right'
                            title={this.quantityFormat(price)}
                            value={this.quantityFormat(price)}
                        ></Cell>
                    }
                }
            >
            </Column>,
            <Column
                align='center'
                flexGrow={1}
                width={75}
                header= {
                    <Cell className='dataGrid-tableHeaderNoBoder'>金额</Cell>
                }
                cell= {
                    ({rowIndex})=>{
                        const record = this.chList[rowIndex]
                        const {ybbalance} = record
                        return <Cell
                            align='right'
                            timeout={true}
                            tip={true}
                            interceptTab={true}
                            className='mk-datagrid-cellContent-right'
                            title={this.quantityFormat(ybbalance, 2)}
                            value={this.quantityFormat(ybbalance, 2)}
                        ></Cell>
                    }
                }
                footer={
                    <Cell 
                        className='mk-datagrid-cellContent-right'
                        value={this.listAll.billBodyYbBalance}
                        title={this.listAll.billBodyYbBalance}
                    />
                }
            >
            </Column>,
        ]
        return(
            <DataGrid
                scroll= {data.tableOption}
                className= 'ttk-stock-app-assessment-chonghui-DataGrid'
                rowsCount= {this.chList.length}
                headerHeight= {35}
                rowHeight={35}
                footerHeight={37}
                enableSequence={true}
                readonly={false}
                startSequence={1}
                enableSequenceAddDelrow= {this.commonEditable()}
                // enableAddDelrow:true,
                // onAddrow: '{{$addRow}}',
                onDelrow= {this.delRow}
                sequenceFooter= { <Cell>合计</Cell> }
                key= {data.other.detailHeight}
                readonly= { false }
                columns={cols}
                allowResizeColumn 
            ></DataGrid>
        )
    }

    renderFooter =()=>{
        const operater = this.metaAction.gf('data.form.operater') 
        return (
        <div className='ttk-stock-app-assessment-chonghui-footer-btn'>
            <Layout className='ttk-stock-app-assessment-chonghui-footer'>
                <span>制单人：{operater}</span>
            </Layout>
            <div className='ttk-stock-app-assessment-chonghui-footer-btn-btnGroup'>
                <Button className='ttk-stock-app-assessment-chonghui-footer-btn-btnGroup-item' onClick={this.onCancel}>
                    取消
                </Button>
                { this.commonEditable() &&
                    <Button 
                        className='ttk-stock-app-assessment-chonghui-footer-btn-btnGroup-item'
                        onClick={() => this.save('save')} type='primary'> 
                        保存 
                    </Button>
                }
                
            </div>
        </div>
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