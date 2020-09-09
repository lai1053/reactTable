import React,{useRef}from 'react'
import { tableColumns } from './staticField'
import SelectSubject from '../components/SelectSubject'
import VirtualTable from '../../invoices/components/VirtualTable/index'
import SelectCost from '../components/SelectCost'
import { deepClone } from '../commonAssets/js/common'

const OwnTable = props =>{
    let { 
        selectedRowKeysArr=[], listData=[], loading, isNeedMatchCost, 
        costList=[], metaAction, webapi, store, scrollTop=0, onChange
    } = props || {}

    let list = deepClone(listData),
        selectedRowKeys = deepClone(selectedRowKeysArr)
    const tableRef = useRef(null)
    // 匹配选择框改变
    const selectChange =(v, rowId, field, idx)=>{
        const index = list.findIndex(item=>item.id===rowId)
        list[index][`${field}Name`] = v.label
        list[index][`${field}Id`] = v.value
        list[index][`${field}Error`] = false  // 屏蔽掉错误信息
        if(onChange){
            onChange({
                'data.list': list,
                'data.scrollTop': tableRef.current.bodyRef.current.scrollTop
            })
        }
    }

    const onSelectChange = (selectedRowKeys, record, checked )=> {      
        onChange({
            'data.selectedRowKeys': selectedRowKeys,
            'data.scrollTop': tableRef.current.bodyRef.current.scrollTop
        })
    }

    const renderColumns = ()=>{
        let columns = [...tableColumns]
        let newCol = columns.map(v=>{
            let classStyle = v.isMust ? 'title-text required d-header-text' : 'd-header-text'
            v.title = <div className={classStyle} > {v.title} </div>  
            const time = (new Date()).getTime()
            if(isNeedMatchCost && v.dataIndex==='salesCostAccountName'){
                v.render = (text, record, index)=>{
                    const accountCode = record.accountCode && record.accountCode.toString().slice(0, 4) || ''
                    return <SelectCost
                                placeholder='请选择成本科目'
                                key={`cost-key-${record.id}-${index}-${time}`}
                                text={text}
                                store={store}
                                webapi={webapi}
                                metaAction={metaAction}
                                accountCode={accountCode}
                                error={record.salesCostAccountError}
                                optionList={costList}
                                changeCallback={(v)=>{selectChange(v, record.id, 'salesCostAccount',index)}}
                            />
                }
            }
            if(v.dataIndex==='inventoryRelatedAccountName'){
                if(!isNeedMatchCost){ v.width = 260 } 
                v.render = (text, record, index)=>{  
                    const accountCode = record.accountCode && record.accountCode.toString().slice(0, 4) || ''
                    return <SelectSubject
                                placeholder='请选择存货科目'
                                key={`stock-key-${record.id}-${index}-${time}`}
                                text={text}
                                store={store}
                                webapi={webapi}
                                metaAction={metaAction}
                                accountCode={accountCode}
                                reqParams={{propertyId: record.propertyId}}
                                error={record.inventoryRelatedAccountError}
                                changeCallback={(v)=>{selectChange(v, record.id, 'inventoryRelatedAccount', index)}}
                            />
                }
            }
            if(v.dataIndex==='name'||v.dataIndex==='specification'){
                v.render = (text, record, index)=>{  
                    return <div className="subject-match-overflowCell">
                                <span title={text} className="subject-match-textOverflow"> {text} </span>
                            </div>
                }
            }

            if(isNeedMatchCost){
                return v
            }else{
                return v.dataIndex !== 'salesCostAccountName' && v
            }
        })
        
        if(!isNeedMatchCost) { newCol = newCol.slice(0, newCol.length - 1) }  // 如果不需要匹配成本科目则隐藏

        return newCol
    }

   
    const rowSelection = {
            selectedRowKeys,
            columnWidth: 62,
            onChange: onSelectChange,
            hideDefaultSelections: true,
            getCheckboxProps: record => ({
                ...record,
                disabled: record.editable ? true : false
            })
    }

    const cols = renderColumns()
    const ele = document.querySelector('.ttk-stock-app-matchSubject-body')
    const width = ele ? ele.offsetWidth : 940
    return (
        <VirtualTable
            className="header-group-table"
            key='id'
            rowKey='id'
            rowSelection={rowSelection}
            style={{ 'width': `${width}px`}}
            columns={cols}
            loading={loading}
            ref={tableRef}
            scrollTop={scrollTop||0}
            // verticalScrollUnAvail={this.verticalScrollUnAvail}
            dataSource={list}
            scroll={{ y: 360, x: width+5 }}
            bordered
        />
    )
}

export default OwnTable