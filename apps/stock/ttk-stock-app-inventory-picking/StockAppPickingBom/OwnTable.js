import React, {useRef} from 'react'
import VirtualTable from '../../../invoices/components/VirtualTable'
import utils from 'edf-utils'
import InputWithTip from '../../components/InputWithTip'
import { formatSixDecimal, transToNum } from '../../commonAssets/js/common'

const OwnTable = (props)=>{
    const {
        scrollTop=0,
        list = [],
        originalList=[],
        currentStep,
        tableOption={},
        columnField=[],
        onChange
    } = props || {}

    const tableRef = useRef(null)

    const renderColumns = () =>{
        let columns = columnField
        const addTextOverflow = (item)=>{
            const textAlign = item.align
            if( item.dataIndex!==undefined ){
                item.title = <div style={{textAlign: 'center'}}>{item.title}</div>
                item.render = (text,record,index)=>{
                    let txt = text
                    if(item.dataIndex==='gapNum' || item.dataIndex==='gapBalance' ){
                        txt = parseFloat(txt).toFixed(item.format)
                        txt = (transToNum(txt)>0) ? Math.abs(transToNum(txt)) :  ''
                        txt = (txt==='') ? '' 
                                : item.format==6 ?
                                   formatSixDecimal(txt) 
                                : utils.number.format(txt, 2)
                    }else{
                        txt = (item.format && !item.empty)
                        ? (item.format==6) 
                            ? formatSixDecimal(txt) 
                            : utils.number.format(transToNum(txt), 2) 
                        : txt
                    }
                    return  (
                        <div className="tdTextOverflow" style={{textAlign}} title={txt}> {txt} </div>
                    )
                }
            }
            return item
        }

        if(currentStep==='step2'){
            columns = columnField.map(item=>{
                item.title = <div className="td-header-text" >{item.title}</div>
                if(item.children && item.children.length>0){
                    item.children.forEach((v, i)=>{  
                        v = addTextOverflow(v) 
                    })
                }
                item = addTextOverflow(item)
                return item
            })

        }else if(currentStep==='step3'){
            columns = columnField.map(item=>{
                item.title = <div className="td-header-text" > {item.title} </div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{
                        v = addTextOverflow(v)
                        if(v.dataIndex==='bomNum'){
                            v.title = <div className="td-header-text" > {v.title} </div>
                            v.render = (text,record,index)=>{
                                const txt = text ? formatSixDecimal(text) : ''
                                return  <div>
                                    <InputWithTip
                                        className='picking-amount-input'
                                        format={'amount'}
                                        isError={record.bomNumError}
                                        defaultVal={txt}
                                        errorTips={'本次领料数量不能大于待领料数量!'}
                                        inputEvent={(value)=>{handleNumInput(value, record, v.dataIndex)}} 
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
    const handleNumInput=(value, record, field)=>{
        const { inventoryId } = record
        const index = list.findIndex(v=>v.inventoryId===inventoryId)
        const orgIndex = originalList.findIndex(item=>item.inventoryId===inventoryId)
        const orgNum = originalList[orgIndex]['num']
        const num  = transToNum(list[index]['num'])
        list[index][field] = value 
        let condition = !(transToNum(orgNum)>num || transToNum(value)<=num) 
        list[index][`${field}Error`] = condition 
        const unitCost = transToNum(list[index]['unitCost'])  // 单价
        list[index]['bomBalance'] = (value == num) ? list[index]['ybbalance'] : (unitCost * value)
        onChange && onChange({
            'backList': list,
            'backRow': list[index],
            'scrollTop': tableRef.current.bodyRef.current.scrollTop
        })
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
                let single = parseFloat(el[item.dataIndex])
                if(item.sum){
                    single = parseFloat( single.toFixed(item.format) )
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
                    if(i == 1) {
                        i == 1 && rowWidth.push({'width': titleWidth, 'flexGrow': el.flexGrow})
                    } else {
                        if(el.children && el.children.length>0){
                            el.children.forEach(item => {
                                rowWidth.push({
                                    'width':item.width, 
                                    'dataIndex': item.dataIndex
                                })
                            })
                        }else{
                            rowWidth.push({'width': el.width, 'dataIndex': el.dataIndex,})
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
                    
                    }else if(i==1){
                        return ( <div style={{...styleObj, flexGrow }}> {rowData[i]}</div>)
                    
                    } else {
                        let textAlign = rowWidth[i].dataIndex.toString().toLowerCase().includes('num') ? 'left' : 'right'
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

    return (
        <VirtualTable
            columns={renderColumns()}
            dataSource={list}
            key={currentStep + 'table'}
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