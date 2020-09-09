import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Input, DataGrid, DatePicker, Layout, Button, Form } from 'edf-component'
import moment from 'moment'
import { fromJS } from 'immutable'
import { moment as momentUtil } from 'edf-utils'
import { formatNumbe } from './../common'
import { 
    billDisabledDate, 
    formatSixDecimal, 
    transToNum,
    timerCall, 
    stockLoading, 
    deepClone 
} from '../commonAssets/js/common'
import isEquall from 'lodash.isequal'
import { blankDetail } from './data'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.id = this.component.props.id
        this.isAdd = this.component.props.isAdd
        this.unEditable = this.component.props.unEditable  // 是否结转出库凭证 
        this.voucherIds = this.component.props.voucherIds  // 是否已经生成凭证
        this.component.props.setOkListener(this.onOk)
        injections.reduce('init')
        this.load()
    }

    componentWillUnmount=()=>{
        this.timer = null
    }

    // 是否生成凭证
    isVoucher = () => (!this.voucherIds)

    // 是否已结转出库凭证
    isCarryOver = ()=> this.unEditable

    /*@description: 一般表单是否可编辑 
    *   可编辑: (已经结转出库成本 或 已经生成凭证)
    *   不可编辑: (没有结转出库成本 && 并且没有生成凭证)
    * @return {boolen} true——可编辑； false——不可编辑
    * commonEditable dateEditable
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

    load = async () => {
        this.metaAction.sf("data.isAdd", this.isAdd)
        if (this.id) {
            this.metaAction.sf('data.loading', true)
            const response = await this.webapi.operation.findBillTitleById({'serviceTypeCode': 'SCLL','id': this.id})
            if(response){
                let data = JSON.parse(response.billBodys) 
                this.injections.reduce('load', data, response)
            }
            this.metaAction.sfs({
                'data.loading': false,
                'data.isEdit': 'readonly',
                'data.originType': response && response.type || ''
            })
        } else {
            const getSystemDate = await this.webapi.operation.getSystemDate() || '2020-01-01'
            let data = momentUtil.stringToMoment(getSystemDate).format('YYYY-MM')
            let name = this.metaAction.context.get('currentOrg').name
            if (data == sessionStorage['stockPeriod' + name]) {
                this.enableDateChange('data.form.cdate', momentUtil.stringToMoment(getSystemDate).format('YYYY-MM-DD'))
            } else {
                let year = sessionStorage['stockPeriod' + name].split('-')
                let data = Number(year[1]) + 1
                data = data > 9 ? data : '0' + data
                let lastData = moment(year[0] + '-'+ data + '-' +'01').valueOf()
                if (data > 12) {
                    data = '01'
                    lastData = moment((Number(year[0]) + 1) + '-' + data + '-' + '01').valueOf()
                }
                let reqData = moment(lastData - 24 * 60 * 60).format('YYYY-MM-DD')
                this.enableDateChange('data.form.cdate', reqData)
            }
        }
    }

    enableDateChange = async (path, data) => {
        let enableDate = momentUtil.stringToMoment(data).format('YYYY-MM')
        const response = await this.webapi.operation.findBillTitleNum({
            'serviceTypeCode': 'SCLL',
            'period': enableDate
        }) || ''

        this.metaAction.sfs({
            [path]: data,
            'data.form.code': response,
            'data.loading': false
        })
    }

    onOk = async (type) => await this.save(type)

    onCancel = async () => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let cacheData = this.metaAction.gf('data.cacheData') && this.metaAction.gf('data.cacheData').toJS() || []
        if (!this.id) {
            cacheData = []
            while (cacheData.length < 5) {
				cacheData.push(blankDetail)
			}
        }
        if (!isEquall(cacheData, list)) {
            const res = await this.metaAction.modal('confirm', {
                className: "haveData",
                content: (`当前界面有数据，请确认是否先进行保存`),
            })
            if (res) return false
        } 
        this.component.props.closeModal && this.component.props.closeModal()
    }

    save = async (type) => {
        this.metaAction.sf('data.loading', true)
        let reqList = {
            serviceTypeCode: 'SCLL',
            code: '',
            cdate: '',
            operater: 'liucp',
            billBodys: ''
        }
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let {form={}, originType} = data
        
        const ok = await this.check([
            {path: 'data.form.cdate', value: form.cdate},
            {path: 'data.form.code', value: form.code}
        ])
        if (!ok) {
            this.metaAction.sf('data.loading', false)
            return false
        }
        let list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.sf('data.loading',false)
            this.metaAction.toast('warning', '没有数据不能保存')
            return false
        }
        list = list.filter(item => item.inventoryCode)
        let listCopy  = deepClone(list)
        listCopy = listCopy.filter(v=> (transToNum(v.num)&&transToNum(v.ybbalance)) )
        listCopy.forEach((item, idx) => {
            item.num = formatNumbe(item.num)
            item.price = formatNumbe(item.price)
            item.ybbalance = formatNumbe( formatNumbe(item.ybbalance, 2) )
        })
        reqList.code = form.code
        reqList.cdate = form.cdate
        reqList.billBodys = JSON.stringify(listCopy)
        reqList.operater = form.operater
        reqList.type = originType
        
        let resp
        if (this.id) {
            reqList.id = this.id
            resp = await this.webapi.operation.updateBillTitle(reqList) 
        } else {
            resp = await this.webapi.operation.createBillTitle(reqList)
        }
        this.metaAction.sf('data.loading',false)
        if (resp) {
            if (type == 'saveAndNew') {
                if(this.id) this.id = ""
                this.injections.reduce('init')
                this.metaAction.toast('success', '保存并新增成功')
                this.load()
                this.metaAction.sf('data.currentList', fromJS(JSON.parse(resp.billBodys)))
                setTimeout(()=>{
                    this.component.props.cb()
                },100)
			} else {
				this.metaAction.toast('success', '保存成功')
				this.component.props.closeModal(resp)
			}
        } else {
            return false
        }
    }

    delRow = (ps) => {
        var list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const hasData = list.filter(v=>(v.inventoryCode && v.inventoryName))
        if(hasData.length>1){
            this.injections.reduce('delrow', ps.rowIndex, this.id)
        }else{
            this.metaAction.toast('warning', '只有一行不能删除')
        }  
    }

    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return
        var checkResults = []
        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.cdate') {
                Object.assign(r, await this.checkCdate(o.value))
            } else {
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
        if (!code) message = '请选择入库日期'
        return { errorPath: 'data.other.error.cdate', message }
    }
    checkSupplierName = async (name) => {
        var message
        if (!name)
            message = '请录入单据编号'
        return { errorPath: 'data.other.error.code', message }
    }
    // mousedown = (e) => {
    //     const path = utils.path.findPathByEvent(e)
    //     if (this.metaAction.isFocus(path)) return

    //     if (path.indexOf('cell.cell') != -1) {
    //         this.focusCell(this.getCellInfo(path))
    //     } else {
    //         if (!this.metaAction.focusByEvent(e)) return
    //         setTimeout(this.cellAutoFocus, 16)
    //     }
    // }

    getListColumns = () => {
        const commonEditable = this.commonEditable()
        const list = this.metaAction.gf('data.list').toJS() || []
        const {numSum, ybbalanceSum} = this.calTotal(list)
        let cols = []
        let { Column, Cell } = DataGrid
        let headerKeys
        if (!list) return cols
        headerKeys = { 
            inventoryCode: "存货编号", 
            inventoryName: "存货名称", 
            inventoryGuiGe: "规格型号", 
            inventoryUnit: "单位", 
            num: "数量", 
            price: "单价", 
            ybbalance: '金额', 
        }

        Object.keys(headerKeys).forEach(op => {
            let footerCell = null
            if(op==='num'){
                footerCell = <Cell name="footer1" className='mk-datagrid-cellContent-left'>
                    <div className="txtOverflow"> { formatSixDecimal(numSum) } </div>
                </Cell>

            }else if(op=='ybbalance'){
                footerCell = <Cell name="footer2" className='mk-datagrid-cellContent-right'>
                    <div className="txtOverflow"> { formatNumbe(ybbalanceSum, 2) }</div>
                </Cell>
            }
            let col = <Column 
                        flexGrow={1} 
                        width={50}
                        header = { <Cell name='header'> { headerKeys[op] } </Cell> }
                        cell = {
                            (ps) => {
                                if (op == 'num'|| op == "price") {  // 数量单价
                                    ps.align = op == 'num' ? 'left' : 'right'
                                    const classN = op == 'num' ? 'alginLeft' : 'alginRight'
                                    const txt = transToNum(list[ps.rowIndex][op]) ? formatSixDecimal(list[ps.rowIndex][op]) : ''
                                    return  <Cell className="alginRight" title={ txt } algin={ps.algin}> 
                                                <div className="txtOverflow" className={classN}> { txt } </div> 
                                            </Cell>
                                            
                                } if (op == "ybbalance") {   // 金额
                                    ps.align = 'right'
                                    const txt = (transToNum(list[ps.rowIndex][op])) ? formatNumbe(list[ps.rowIndex][op],2) : ''
                                    const hasStock = list[ps.rowIndex]['inventoryCode'] && list[ps.rowIndex]['inventoryName']
                                    return <Cell  className="alginRight ybbalance-cell" title={txt}  align='right'>
                                        {  (commonEditable && hasStock) ?
                                            <Input.Number 
                                                className="alginRight table-input" 
                                                title={txt} 
                                                value={txt}
                                                regex='^([0-9]+)(?:\.[0-9]{1,2})?$' 
                                                onChange={ (val) => this.handleYbbChange(val, list[ps.rowIndex], ps.rowIndex) } 
                                            /> 
                                            :     
                                            <div title={txt} className='ybbalance-text'> { txt } </div>
                                        }  
                                    </Cell>

                                } else if (op == 'inventoryCode'|| op =="inventoryUnit") {  // 存货编码与存货单位
                                    ps.align = 'left'
                                    return <Cell  title={list[ps.rowIndex][op]} >{ list[ps.rowIndex][op] }</Cell>
                               
                                } else {
                                    ps.align = 'left'  // 存货名称与规格型号
                                    return <Cell title={list[ps.rowIndex][op]}> { list[ps.rowIndex][op] } </Cell>
                                }
                            }
                        }
                        footer={ footerCell }
                    />
            cols.push(col)
        })
        return cols
    }

    // 统计合计数量和金额
    calTotal =(data)=>{
        let numSum = 0, ybbalanceSum = 0
        for(const v of data){
            numSum = transToNum( formatSixDecimal(transToNum(v.num) + numSum) )
            ybbalanceSum = transToNum( formatSixDecimal( transToNum(v.ybbalance) + ybbalanceSum ) )
        }
        return { numSum, ybbalanceSum }
    }

     // 金额改变
     handleYbbChange = (val, record, index)=>{
        let list = this.metaAction.gf('data.list').toJS() || []
        for(const item of list){
            if(item.id == record.id){
                item.ybbalance = transToNum(val)
                item.price = transToNum( (transToNum(item.ybbalance) / transToNum(item.num)).toFixed(6) )
            }
        }
        timerCall(this, 'inputChange', this.metaAction.sf, ['data.list', fromJS(list)])
    }

    reload = async (ret) => {
        let list = this.metaAction.gf('data.list').toJS()
        this.injections.reduce('reload', ret, list, this.id)
    }

    changeCode = (e) => 
        this.metaAction.sf('data.form.code', e.target.value)
    

    changeDate = (e) => 
        this.metaAction.sf('data.form.cdate', momentUtil.momentToString(e,'YYYY-MM-DD'))
    

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = (currentDate) => billDisabledDate(this, currentDate, 'data.form.cdate')

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data').toJS()
        const {Item} = Form
        const commonEditable = this.commonEditable(),
            dateEditable = this.dateEditable() 
        return (
            <React.Fragment>
                { data.loading && <div className='ttk-stock-app-spin'> { stockLoading() } </div> }
                <Layout className='ttk-stock-app-inventory-picking-add-header-title'>
                    <div className='ttk-stock-app-inventory-h2'>
                        <div className='ttk-stock-app-inventory-h2'> 生产领料单 </div>
                    </div>
                    <Form className='helloworld-add-form'>
                        <Item label='单据编号' 
                            // help={data.other.error.code}  
                            // required={commonEditable} 
                            // validateStatus={data.other.error.code?'error':'success'} 
                        >
                            {
                            // commonEditable ? <Input 
                            //     value={data.form.code} 
                            //     readonly={data.isEdit} 
                            //     onChange={this.changeCode}/>  :
                                <span className='span-text'> { data.form.code } </span>
                            }
                        </Item>
                        {/* <Item label='发票号码' className='width200'>
                            <span className='span-text'> { data.form.invNum } </span>
                        </Item> */}
                         <Item colon={false} label='领料日期:' className='enableDate' required={commonEditable}
                            validateStatus={ data.other.error.cdate?'error':'success'} help={data.other.error.cdate} >
                            {
                                commonEditable ? 
                                <DatePicker 
                                    value={momentUtil.stringToMoment((data.form.cdate),'YYYY-MM-DD')} 
                                    disabledDate={this.disabledDate} onChange={this.changeDate}
                                />
                                :
                                <span className='span-text'> { data.form.cdate } </span>
                            }
                        </Item>
                    </Form>
                    {/* <Form className='helloworld-add-form helloworld-add-form-row2'>
                        <Item colon={false} label='领料日期:' className='enableDate' required={dateEditable}
                            validateStatus={ data.other.error.cdate?'error':'success'} help={data.other.error.cdate} >
                            {
                                dateEditable ? 
                                <DatePicker 
                                    value={momentUtil.stringToMoment((data.form.cdate),'YYYY-MM-DD')} 
                                    disabledDate={this.disabledDate} onChange={this.changeDate}
                                />
                                :
                                <span className='span-text'> { data.form.cdate } </span>
                            }
                        </Item>
                        <Item label='往来单位' className="width200" >
                            <span className='span-text'> { data.form.contactUnit } </span>
                        </Item>
                        <Item label='借方科目' className="width200">
                            <span className='span-text'> { data.form.contactSubject } </span>
                        </Item>
                    </Form> */}
                </Layout>
                <Layout>
                    <DataGrid 
                        headerHeight={37} 
                        rowHeight={35} 
                        enableSequence={true} 
                        enableSequenceAddDelrow={commonEditable} 
                        readonly={!data.isAdd} 
                        onDelrow={this.delRow}
                        className='ttk-stock-app-inventory-picking-add-table' 
                        startSequence={1}
                        footerHeight={35} 
                        sequenceFooter={<DataGrid.Cell>合计</DataGrid.Cell>}
                        rowsCount={data.list.length} 
                        columns={this.getListColumns()}
                        allowResizeColumn
                    />
                </Layout>
                <div className='ttk-stock-app-inventory-picking-add-footer-btn'>
                    <Layout className='ttk-stock-app-inventory-picking-add-footer'>
                        <span>制单人：{data.form.operater}</span>
                    </Layout>
                    <div className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup'>
                        <Button className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item' onClick={this.onCancel}>
                            取消
                        </Button>
                        {
                            commonEditable && 
                            <Button 
                                className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item'
                                onClick={() => this.save('save')} type='primary'
                            > 保存 </Button>
                        }
                        
                        {/* <Button 
                            className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item' 
                            onClick={() => this.save('saveAndNew')}
                            type='primary' 
                        >
                            保存并新增
                        </Button> */}
                    </div>
                </div>
            </React.Fragment>
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