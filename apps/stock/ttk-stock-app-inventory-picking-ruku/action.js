import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Input, DataGrid, DatePicker, Select, Layout, Form, Button } from 'edf-component'
import utils from 'edf-utils'
import { moment as momentUtil } from 'edf-utils'
import { formatNumbe } from './../common'
import { getVoucherDateZGRK, billDisabledDate, stockLoading, transToNum} from '../commonAssets/js/common'
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
        const list=this.component.props.list
        injections.reduce('init',list)
        this.initData()
    }
    initData = async () => {
        this.metaAction.sf('data.loading', true)
        let name=this.metaAction.context.get('currentOrg').name
        const currentMonth = sessionStorage['stockPeriod' + name]
        const defaultDate = getVoucherDateZGRK(currentMonth)   // 生成暂估入库日期
        this.enableDateChange('data.form.cdate', defaultDate)
        const dataList = await this.webapi.operation.findSupplierList({})
        this.selectList = dataList
        this.renderSelectOption(dataList)
        this.metaAction.sf('data.loading', false)
        
    }
    enableDateChange= async (path,data) => {
        let enableDate=momentUtil.stringToMoment(data).format('YYYY-MM')
        const response = await this.webapi.operation.query({            // 单据编号
            'serviceTypeCode': 'ZGRK',
            'period': enableDate
        })
        this.metaAction.sfs({
            [path]: getVoucherDateZGRK(enableDate),
            'data.form.code': response,
            'data.loading': false
        })
    }

    renderSelectOption = (data) => {
        const arr = data.map(item => {
            return (
                <Option key={item.supplierId} value={item.supplierCode}>
                   {item.supplierName}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }
    //过滤行业
    filterIndustry = (input, option) =>    
        option.props.children.indexOf(input) >= 0


    getSelectOption = () => {
        return this.selectOption
    }

    load = async () => {
        const response = await this.webapi.operation.query({})
        this.injections.reduce('load', response)
    }

    onOk = async () => {
        return await this.save()
    }

    onCancel = async () => {
        this.component.props.closeModal && this.component.props.closeModal()
    }

    save = async () => {
        let reqList={
            serviceTypeCode:'ZGRK',
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
        },{
            path: 'data.form.code', value: form.code
        }])
        if (!ok) {
            this.metaAction.sf('data.loading', false)
            return false  
        }
        let list = this.metaAction.gf('data.list').toJS()
        list = list.filter(v=>transToNum(v.num) && transToNum(v.ybbalance))
        list.forEach(item => {
            item.ybbalance=formatNumbe(item.ybbalance)
            item.num=formatNumbe(item.num)
            item.price=formatNumbe(item.price)
        })

        reqList.code= form.code;
        reqList.cdate= form.cdate;
        reqList.supplierName=form.supplierName;
        reqList.supplierId=form.supplierId;
        reqList.billBodys=JSON.stringify(list)
        reqList.operater=form.operater;
        this.metaAction.sf('data.loading', true)
        let respData=await this.webapi.operation.createBillTitle(reqList)    
        this.metaAction.sf('data.loading', false)
        let ret
        if(respData){
            this.metaAction.toast('success', '保存成功')
            this.component.props.closeModal(respData)
            ret = respData
        }else{
            ret = 'failed'
        }
        this.component.props.closeModal(ret)
        return ret
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

    selectOption= async (path,data) => {
        let id=''
        this.selectList.forEach(item => {
            if(item.supplierCode==data){
                id=item.supplierId
                return
            }
        })
        this.metaAction.sfs({
            [path]: data,
            'data.form.supplierId': id
        })
    }

    selectChange= (path,data) => {
        let id=''
        this.selectList.forEach(item => {
            if(item.supplierCode==data){
                id=item.supplierId
                return
            }
        })
        this.metaAction.sfs({
            [path]: data,
            'data.form.supplierId': id
        })
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
    getListColumns = () => {
        const data = this.metaAction.gf('data').toJS()
        const {list=[], listAll={}} = data
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
            ybbalance: '金额'
        }
        Object.keys(headerKeys).forEach(op => {
            const isRequired = ['num',"price","ybbalance"].includes(op)
            const footerCell = ['num',"ybbalance"].includes(op) ? 
                    <Cell align="left" title={listAll[`${op}Sum`]}> {listAll[`${op}Sum`]} </Cell> : null
            let col = <Column 
                flexGrow={1} 
                width={50}
                header={
                    <Cell name='header'> {headerKeys[op]} </Cell>
                }
                cell={(ps) => {
                    ps.align = 'left'
                    if( ["price","ybbalance"].includes(op) ){
                        ps.align = 'right'
                        return <Cell className="my-class" title={list[ps.rowIndex][op]}>
                                    {list[ps.rowIndex][op]}
                                </Cell>
                    }else if(op=='inventoryCode'||op=="inventoryUnit"){
                        return <Cell title={list[ps.rowIndex][op]}>{list[ps.rowIndex][op]}</Cell>
                        
                    }else{
                        return <Cell title={list[ps.rowIndex][op]}> { list[ps.rowIndex][op] } </Cell>
                    }
                }}

                footer={
                    footerCell
                }
            />
            cols.push(col)
        })
        return cols
    }

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = (currentDate) =>billDisabledDate(this, currentDate, 'data.form.cdate')

    // stockLoading = (param) => stockLoading(param)

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data').toJS()

        const saveData = (path, value) => {
            this.metaAction.sf(path, value)
        }

        return (
            <React.Fragment>
               
                <div className="ttk-stock-app-inventory-picking-ruku-main">
                    { data.loading && <div className='ttk-stock-app-spin'> {stockLoading()} </div> }
                    <Layout className='ttk-stock-app-inventory-picking-ruku-header-title'>
                        <div className='ttk-stock-app-inventory-h2'>
                            <div className='ttk-stock-app-inventory-h2'>
                                暂估入库单
                            </div>
                        </div>
                        <Form className='helloworld-add-form'>
                            <Form.Item 
                                label='单据编号' 
                                help={data.other.error.code}
                            >
                                <span className='span-text'> { data.form.code } </span>
                            </Form.Item>
                            <Form.Item 
                                label='入库日期' 
                                className='enableDate'
                                required={true} 
                                colon={false}
                                validateStatus={ data.other.error.cdate ? 'error' : 'success' }
                                help={ data.other.error.cdate }    
                            >
                                <DatePicker 
                                    value={ momentUtil.stringToMoment((data.form.cdate),'YYYY-MM-DD') }
                                    disabledDate= {this.disabledDate}
                                    onChange={
                                        (v) => saveData('data.form.cdate', momentUtil.momentToString(v,'YYYY-MM-DD'))
                                    }
                                ></DatePicker>
                            </Form.Item>
                            <Form.Item 
                                label='往来单位' 
                                help={data.other.error.supplierName}
                                className="wraperWidth200"
                                validateStatus={
                                    data.other.error.supplierName? 'error' : 'success'
                                }   
                            >
                                <Select 
                                    showSearch={ true }  
                                    filterOption={ this.filterIndustry } 
                                    value={ data.form.supplierName }
                                    onSelect={e => this.selectChange('data.form.supplierName',e)}
                                >
                                    { this.getSelectOption() }
                                </Select>
                            </Form.Item>
                        </Form>
                    </Layout>
                    <Layout className='ttk-stock-app-inventory-picking-ruku-content'>
                        <DataGrid 
                            headerHeight={37} 
                            rowHeight={35} 
                            footerHeight={35}
                            enableSequence={true}
                            startSequence={1} 
                            rowsCount={data.list.length} 
                            sequenceFooter={<DataGrid.Cell>合计</DataGrid.Cell>}
                            columns={this.getListColumns()}
                            className="ttk-stock-app-inventory-picking-ruku-content-grid"
                            allowResizeColumn
                        ></DataGrid>
                    </Layout>
                </div>
                <div className='ttk-stock-app-inventory-picking-add-footer-btn'>
                    <div className='ttk-stock-app-inventory-picking-add-footer'>
                        <span>制单人：{data.form.operater}</span>
                    </div>
                    <div className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup'>
                        <Button className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item' onClick={this.onCancel}>
                            取消
                        </Button>
                        <Button 
                            className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item'
                            onClick={() => this.save('save')} type='primary'
                        > 保存 </Button>
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