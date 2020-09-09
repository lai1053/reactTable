import React, {useRef} from 'react'
import VirtualTable from '../../../invoices/components/VirtualTable'
import utils from 'edf-utils'
import InputWithTip from '../../components/InputWithTip'
import { formatSixDecimal, transToNum } from '../../commonAssets/js/common'

const OwnTable = (props)=>{
    const {
        scrollTop=0,
        list = [],
        currentStep='step2',
        tableOption={},
        columnField=[],
        onChange
    } = props || {}

    const nowTime = new Date().getTime() + Math.random()

    const tableRef = useRef(null)

    const renderColumns = () =>{
        let columns = columnField

        const addTextOverflow = (item)=>{
            const textAlign = item.align
            if( item.dataIndex!==undefined ){
                item.title = <div style={{textAlign: 'center'}}>{item.title}</div>
                item.render = (text,record,index)=>{
                    let txt = text
                    txt = item.format 
                        ? (item.format==6) 
                            ? formatSixDecimal(txt) 
                            : utils.number.format(transToNum(txt), 2) 
                        : txt

                    if(item.dataIndex==='gapNum' || item.dataIndex==='gapBalance' ){
                        txt = (transToNum(txt)>0) ? Math.abs(txt) :  ''
                    }
                    return  (
                        <div className="tdTextOverflow" style={{textAlign}} title={txt}> {txt} </div>
                    )
                }
            }
            return item
        }

        if(currentStep==='step2'){
            columns = columns.map(item=>{
                item.title = <div className="td-header-text" >{item.title}</div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{  
                        v = addTextOverflow(v) 
                    })
                }
                item = addTextOverflow(item)
                return item
            })

        }else if(currentStep==='step3'){
            columns = columns.map(item=>{
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
                                        isError={transToNum(text)>transToNum(record.num)} 
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
        const num  = transToNum(list[index]['num'])
        list[index][field] = value 
        const condition = ( transToNum(value) > transToNum(num) )
        list[index][`${field}Error`] = condition 
        const unitCost = transToNum(list[index]['unitCost'])  // 单价
       
        if(value == num){  
            list[index]['bomBalance'] = list[index]['ybbalance']
        }else{
            let ybbalanceChange = unitCost * value  // 计算金额
            list[index]['bomBalance'] = ybbalanceChange
        }
        onChange && onChange({
            backList: list,
            backRow: list[index],
            scrollTop: tableRef.current.bodyRef.current.scrollTop
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
                arr[index] = item.sum ? ( arr[index] + transToNum(el[item.dataIndex]) ) : ''
            })
        })
        fieldArr.map((v,i)=>{
            (!v.sum)&&(arr[i]='')
            if(v.format){
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
                        let textAlign = rowWidth[i].dataIndex.includes('Num') ? 'left' : 'right'
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
            key={currentStep}
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