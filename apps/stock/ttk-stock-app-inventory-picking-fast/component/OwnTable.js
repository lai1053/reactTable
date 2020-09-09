import React, {useRef} from 'react'
import VirtualTable from '../../../invoices/components/VirtualTable'
// import {step2Table, step3Table } from '../staticField'
import utils from 'edf-utils'
// import { Button} from 'antd'
// import { toJS, fromJS } from 'immutable'
import InputWithTip from '../../components/InputWithTip'
import { 
    formatSixDecimal, 
    deepClone, 
    transToNum, 
    // getVoucherDate, 
    // stockLoading, 
    // timerCall, 
    // getClientSize 
} from '../../commonAssets/js/common'
import {Input as EdfInput, Table, Button as EdfButton,  Select, Icon, Popover, Modal } from 'edf-component'

const OwnTable = (props)=>{
    let {
        scrollTop=0,
        list = [],
        selectedRowKeys=[],
        originalList=[],
        currentStep='step2',
        tableOption={},
        columnField=[],
        onChange
    } = props || {}

    list = [{
        'inventoryId': 1231412,
        'inventoryCode': 'HGL1312412',
        'inventoryName': '高歌',
        'inventoryGuiGe': 'HGJE-8708',
        'inventoryUnit': '平方米',
        'num': 80987,
        'unitCost': 22.32,
        'ybbalance': 1244123.23,
        'numChange': 33.32,
        'ybbalanceChange': 34231.3412,
        'inventoryGap': 123,
        'zanguYbbalance': 14123.231
    }]

    const nowTime = new Date().getTime() + Math.random()
    const tableRef = useRef(null)

    const renderColumns = () =>{
        const addTextOverflow = (item)=>{
            if(
                item.dataIndex!=='inventoryCode' 
                && item.dataIndex!=='inventoryGuiGe' 
                && item.dataIndex!=='inventoryUnit' 
                && item.dataIndex!==undefined
            ){
                item.title = <div className="td-header-text"> {item.title} </div>
                item.render = (text,record,index)=>{
                    return <div className="tdTextOverflow" title={text}> {text} </div>
                }
            }
            return item
        }

        let columns = columnField
       if(currentStep==='step2'){
            columns = columnField.map(item=>{
                item.title= <div className="td-header-text"> {item.title} </div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{  v = addTextOverflow(v) })
                }
                item = addTextOverflow(item)
                return item
            })
        }else if(currentStep==='step3'){
            columns = columnField.map(item=>{
                item.title = <div className="td-header-text"> {item.title} </div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{
                        v = addTextOverflow(v)
                        if(v.dataIndex==='numChange'){
                            v.title= <div className="td-header-text"> {v.title} </div>
                            v.render = (text,record,index)=>{
                                return  <div>
                                    <InputWithTip
                                        className='picking-amount-input'
                                        format={'amount'}
                                        isError={record.numChangeError} 
                                        errorTips={'本次领料数量不能大于待领料数量!'}
                                        defaultVal={text}
                                        inputEvent={(value)=>{handleNumInput(value, record, v.dataIndex, currentStep)}} 
                                        blurEvent={(value)=>{handleNumBlur(value, record, v.dataIndex, currentStep)}}
                                    />       
                                </div>
                            }
                        }
                    })
                }
                item = addTextOverflow(item)
                return item
            })
        }
        return columns
    }

     /**
     * @description: (生成领料单页面) 本次领料输入框输入事件
     * @param {string} value 当前单元格文本
     * @param {object} record 当前行数据
     * @param {string} field 当前列字段
     * @param {string} currentStep 当前步骤
     * @return 无
     */ 
    // 完工入库单入库数输入框修改
    const handleNumInput=(value, record, field, currentStep)=>{
        let val = value
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const index = list.findIndex(v=>v.inventoryId===record.inventoryId)
        const num  = transToNum(list[index]['num']) //待领料数量
        let ybbalanceChange = ''

        let original = 0
        if(originalList.length>0){
            original = transToNum(originalList[index]['numChange'])   // 原本的本次领料数量
        }
        
        list[index][`${field}Error`] = (transToNum(val) <= num || original>num) ? false : true
        list[index][field] = val 
        const unitCost = transToNum(list[index]['unitCost'])  // 单价

        // 如果本次领料数量等于待领料数量，那么本次领料金额等于待领料金额，否则本次领料金额=本次领料数量*待领料单价
        if(val === num){  
            list[index]['ybbalanceChange'] = list[index]['ybbalance']
        }else{
            ybbalanceChange = unitCost * transToNum(list[index][field])  // 计算金额
            ybbalanceChange = utils.number.format(ybbalanceChange, 2)
            list[index]['ybbalanceChange'] = ybbalanceChange
        }

        onChange && onChange('cellChange',{
            backList: list,
            backRow: list[index],
            scrollTop: tableRef.current.bodyRef.current.scrollTop
        })
    }

    // 输入框失去焦点
    const handleNumBlur=(value, record, field, currentStep)=>{
        let val = value && transToNum(value) || 0
        const index = list.findIndex(v=>v.inventoryId===record.inventoryId)
        const num = transToNum(list[index]['num'])  //待领料数量
        let ybbalanceChange = ''
        let original = 0
        if(originalList.length>0){
            original = transToNum(originalList[index]['numChange'])  //库存缺口数
        }
        
        // 本次领料数量要小于待领料数量
        list[index][`${field}Error`] = (transToNum(val) <= num || original>num) ? false : true
        let midVal = formatSixDecimal(val) 
        list[index][field] = val ? midVal : ''
        const unitCost = transToNum(list[index]['unitCost'])  // 单价
        
        // 如果本次领料数量等于待领料数量，那么本次领料金额等于待领料金额，否则本次领料金额=本次领料数量*待领料单价
        if(val === num){  
            list[index]['ybbalanceChange'] = list[index]['ybbalance']
        }else{
            ybbalanceChange = unitCost * transToNum(list[index][field])  // 计算金额
            ybbalanceChange = utils.number.format(ybbalanceChange, 2)
            list[index]['ybbalanceChange'] = ybbalanceChange
        }
        
        // this.injections.reduce('updateSfs',{ ['data.list']: fromJS(list) } )
        onChange && onChange('cellChange',{
            backList: list,
            backRow: list[index],
            scrollTop: tableRef.current.bodyRef.current.scrollTop
        })
        // this[`${currentStep}_list`][index][field] = val
        // this[`${currentStep}_list`][index]['ybbalanceChange'] = transToNum(ybbalanceChange)
        
        // const ybbalanceC = transToNum(this[`${currentStep}_list`][index]['ybbalance'])
        // const condition = ybbalanceC < transToNum(ybbalanceChange)
        // this[`${currentStep}_list`][index]['zanguYbbalance'] = condition ? Math.abs( (transToNum(ybbalanceChange) - ybbalanceC).toFixed(2) ) : 0
        
    }

     // 合计数
    const calTotal=(list, field)=>{
        const flatten = (arr)=>{
            let targetArr = []
            arr.forEach((item, i)=>{
                if(item.children && item.children.length!=0 ){
                    const child = flatten(item.children)
                    targetArr = targetArr.concat(child)
                }else{
                    targetArr.push(item)
                }
            })
            return targetArr
        }
        const fieldArr = flatten(field)
        const arr = new Array(fieldArr.length).fill(0)

        list.map((el, i)=>{
            fieldArr.forEach((item, index)=>{
                let single = transToNum(el[item.dataIndex])
                if(item.sum){
                    single = transToNum( single.toFixed(item.format) )
                    if(item.dataIndex.toString().toLowerCase().includes('gap')){
                        if(single > 0 ){
                            arr[index] = arr[index] + single
                        }
                    }else{
                        arr[index] = arr[index] + single 
                    }
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

    const renderSummaryRow = () => {
        let rowData = calTotal(list, columnField)
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                let titleWidth = 0, rowWidth = []
                columns.forEach((el, i) => {
                    if(el.flexGrow) {
                        rowWidth.push({'width': titleWidth, 'flexGrow': el.flexGrow, 'align': el.align})
                    } else {
                        if(el.children && el.children.length>0){
                            el.children.forEach(item => {
                                rowWidth.push({
                                    'width':item.width, 
                                    'dataIndex': item.dataIndex,
                                    'align': el.align
                                })
                            })
                        }else{
                            rowWidth.push({'width': el.width, 'dataIndex': el.dataIndex,'align': el.align})
                        }
                    }
                })
                let rows = rowData.map((el, i) => {
                    let width = rowWidth[i].width + "px"
                    let flexGrow = rowWidth[i].flexGrow
                    const styleObj = {
                        width,
                        borderRight: '1px solid #d9d9d9',
                        textAlign: 'center'
                    }
                    const colStyle={
                        ...styleObj,
                        padding: '0 10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                    if(i == 0) {
                        return (<div style={{...styleObj}}>合计</div>)
                    
                    }else if(flexGrow){
                        return ( <div style={{...styleObj, flexGrow }}> {rowData[i]}</div>)
                    
                    } else {
                        let textAlign = rowWidth[i].align
                        return (
                            <div style={{ ...colStyle, textAlign }} title={rowData[i]}>
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

    const onSelectChange = selectedRowKeys => {
        console.log(selectedRowKeys, 'HHHH')
        onChange && onChange('selectChange',{
            selectedRowKeys,
            scrollTop: tableRef.current.bodyRef.current.scrollTop
        })
    }

    const rowSelection = () => {
        let selectedRowKeys = selectedRowKeys || []
        return {
            selectedRowKeys,
            columnWidth: 62,
            hideDefaultSelections: true,
            onChange: onSelectChange,
            getCheckboxProps: row => {
                return {}
            },
        }
    }
    tableOption.y= 470
    return (
        <VirtualTable
            columns={renderColumns()}
            rowSelection={rowSelection()}
            dataSource={list}
            key={nowTime}
            ref={tableRef}
            rowKey="inventoryId"
            scrollTop={scrollTop}
            style={{ width: `${tableOption.x}px` }}
            scroll={{ y: tableOption.y, x: tableOption.x}}
            summaryRows={renderSummaryRow(columnField)}
            bordered
            height={1000}
            width={tableOption.x+10}
            headerHeight={78}
            allowResizeColumn
        />
    )
}

export default OwnTable