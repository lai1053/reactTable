import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import {FormDecorator, Input } from 'edf-component'
import utils from 'edf-utils'
import { fromJS, toJS } from 'immutable'
import { columnField } from './fixedData'
import { formatNumbe,formatprice } from '../../../common'
import {
    formatSixDecimal, 
    stockLoading, 
    flatten, 
    deepClone, 
    addEvent, 
    removeEvent, 
    transToNum
} from '../../../commonAssets/js/common'
import VirtualTable from "../../../../invoices/components/VirtualTable/index"
const colKeys = ['code', 'name', 'number', 'monerynumber', 'size','monery','pices']
const InputNumber = Input.Number
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        this.id= this.component.props.id;
        this.ids= this.component.props.ids;
        this.time= this.component.props.time;
        injections.reduce('init')
        this.load()
        this.cols = deepClone(columnField)
        this.sumWidth = columnField.reduce((total,item)=>(total + transToNum(item.width) ), 0)
    }

    componentDidMount = ()=>{
        addEvent(window, 'resize', ::this.resizeTable)
        setTimeout(()=>{
            this.resizeTable()
        }, 100)
    }

    componentWillUnmount = ()=>{
        removeEvent(window, 'resize', this.resizeTable)
    }

    stockLoading=()=>stockLoading()

    load = async () => {
        this.metaAction.sfs({
            'data.loading': true,
            'data.other.loading': true
        })
        let name=this.metaAction.context.get('currentOrg').name
        const currentOrg = sessionStorage['stockPeriod'+name]
        const response = await this.webapi.operation.findBackDetail({
            'serviceTypeCode':'ZGRK',
            'inventoryId':this.id,
            'ids':JSON.stringify(this.ids),
            'period':currentOrg
        })
        this.injections.reduce('load', response)
        this.metaAction.sfs({
            'data.loading': false,
            'data.other.loading': false
        })
    }

    onOk = async () => await this.save()
    
    save = async () => {
        var list = this.metaAction.gf('data.list').toJS()
        return list;
    }
    
    handleNumberChange=async(value,record,index) => {
        let numberChange= Number(formatprice(value)>formatprice(record.num) ?
                            formatprice(record.num):formatprice(value))
        let moneryChange=0;
        let data =await this.metaAction.gf('data.list').toJS();
        moneryChange=formatNumbe(formatNumbe(numberChange)*formatNumbe(record.price),6)
        data.forEach(item=>{
           if(item.id==record.id){
                item.number=0
                item.monery=0
           }
        })
        this.metaAction.sf('data.list', fromJS(data)) 
        data.forEach(item=>{
            if(item.id==record.id){
                if(formatNumbe(item.num)===formatNumbe(numberChange)){
                    item.number= numberChange
                    item.monery= formatNumbe(item.ybbalance)
                }else{
                    item.number= numberChange
                    item.monery= moneryChange
                }
            }
         })
        this.injections.reduce('updateList', data)
    }

    quantityFormat = (quantity, decimals, isFocus,num) => {
		if (quantity) {
            return formatprice(quantity,decimals)
		}
    }

    renderColumn = ()=>{
        const cols = this.cols.map(item=>{
            const { align } = item
            switch(item.dataIndex){
                case 'number': 
                    item.render = (text, record, index) => {
                        const txt = formatprice(text) ? formatprice(text) : ''
                        return (
                            <InputNumber 
                                regex='^([0-9]+)(?:\.[0-9]{1,6})?$' 
                                title={ txt } 
                                value={ txt } 
                                onBlur={(v) => this.handleNumberChange(v, record, index)} 
                                className= {align}  
                                placeholder= "请输入数量"  
                            />  
                        )
                    }
                    break

                case ('monery' || 'ybbalance') :
                    item.render = (text, record, index) => {
                        const txt = formatNumbe(text,2) ? formatNumbe(text,2) : ''
                        return (<div className={align} title={txt}> { txt } </div>)
                    }
                    break

                case ('num' || 'price') :
                    item.render = (text, record, index) => {
                        const txt = formatSixDecimal(text)
                        return <div className={align} title={txt}> { txt } </div>
                    }
                    break
                    
                default:
                    item.render = (text, record, index) => {
                        const txt = typeof text === 'number' ? utils.number.format(text, 2) : text
                        return <div className={`${align} textOverflow`} title={txt}>
                                    { txt }
                                </div>
                    }
                    break
        
            }
            return item
        })
        return cols
    }

    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".assessment-chonghui-content")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight + 10) - 188 || 0
        let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
        // tableW = this.computeColWidth(tableW)
        this.metaAction.sfs({
            'data.tableOption': fromJS({
                ...tableOption,
                x: tableW,
                y: tableH,
            })
        })
    }

    renderTable = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {list, tableOption={}} = data
        return (
            <VirtualTable
                columns={this.renderColumn()}
                dataSource={list}
                key='chonghui'
                rowKey="inventoryId"
                style={{ width: `${tableOption.x}px` }}
                scroll={{ y: tableOption.y+55, x: tableOption.x}}
                bordered
                height={1000}
                width={tableOption.x+10}
                headerHeight={49}
                allowResizeColumn
            />  
        )
    }

    addrow = (ps) => 
        this.injections.reduce('addEmptyRow', ps.rowIndex + 1)
    
    delrow = (ps) => {
        const list = this.metaAction.gf('data.list')
        const id = list.getIn([ps.rowIndex, 'id'])
        this.injections.reduce('delrow', id)
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

    getCellInfo=(path) =>{
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
} 

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}