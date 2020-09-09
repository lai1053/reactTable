import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {Icon, Input} from 'antd'
import debounce from 'lodash.debounce'
import {toJS, fromJS} from 'immutable'
import {tableColumnsField} from './staticField'
import{ deepClone } from '../../../commonAssets/js/common'
import VirtualTable from '../../../../invoices/components/VirtualTable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.component.props.setOkListener && this.component.props.setOkListener(()=>{
            return this.onSave()
        })
        const selectedList = this.component.props.selectedList || []
        const wholeList = this.component.props.wholeList || []
        this.tableRef = React.createRef()
        // this.cols = deepClone(tableColumnsField)
        this.load(wholeList, selectedList)
        setTimeout(()=>{
            this.getTableScroll()
        },100)
    }

    load = (wholeList, selectedList)=>{
        const disabledSelectRows = selectedList.slice(0)
        this.injections.reduce('updateSfs',{
            ['data.list']: fromJS(wholeList.slice(0)),
            ['data.allList']: fromJS(wholeList.slice(0)),
            ['data.disabledSelectRows']: fromJS(disabledSelectRows)
        })
    }

    // 输入框改变
    searchChange= (e)=>{ 
        const v = e.target.value   
        let allList = this.metaAction.gf('data.allList') && this.metaAction.gf('data.allList').toJS() || []
        if(v && v.trim()){
            allList = allList.filter(item => {
                const {inventoryName, inventoryCode} = v
                if(v.trim() && (inventoryName.indexOf(v)>-1 || inventoryCode.indexOf(v)>-1)){
                    return item
                }
            })
        }
        this.injections.reduce('updateSfs',{['data.list'] : fromJS(allList)})
    }

    // renderColumns = ()=>{
    //     const header = tableColumnsField
    //     return header
    // }

    /*
    * 渲染表格的复选框
    */
    rowSelection =()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        let { selectedRowKeys=[], selectedRowArr=[], disabledSelectRows=[]} = data
        return {
            selectedRowKeys,
            getCheckboxProps: row => {
                const result = disabledSelectRows.some(v=>v.inventoryId == row.inventoryId)
                return({
                    disabled: result, // row是一行的数据，就是后台返回的list中的一条数据
                    name: result ? 'tableUnChecked' : 'canSelect'
                })
            },
            onSelect: (record, selected, selectedRows, nativeEvent)=>{
                if(selected && !record.disabled){
                    selectedRowKeys.push(record.inventoryId)
                    selectedRowArr.push(record)
                }else{
                    const deleteIndex = selectedRowArr.findIndex(v=>{
                        return v.inventoryId === record.inventoryId
                    })
                    if(deleteIndex>-1){
                        selectedRowArr.splice(deleteIndex,1)
                        selectedRowKeys.splice(deleteIndex,1)
                    }
                }
                this.injections.reduce('updateSfs',{
                    ['data.selectedRowKeys'] : fromJS(selectedRowKeys),
                    ['data.selectedRows'] : fromJS(selectedRowArr),
                })  
            },
            onSelectAll: (selected, selectedRows, changeRows)=>{    
                let copy = []    
                if(selected){
                    selectedRowKeys = selectedRows.map(v=> {
                        if(!v.disabled){
                            copy.push(v)
                            return v.inventoryId
                        }
                    })
                }else{
                    selectedRowKeys = []
                    copy = []
                }
                this.injections.reduce('updateSfs',{
                    ['data.selectedRowKeys'] : fromJS(selectedRowKeys),
                    ['data.selectedRows'] : fromJS(copy),
                })                
            }
        }
    }

    onSelectChange = (selectedRowKeys) => {
        this.metaAction.sf( 'data.selectedRowKeys', fromJS(selectedRowKeys) )   
    }

    /* checkbox复选框 */
    rowSelection = () => {
        const data= this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], disabledSelectRows=[] } = data
        return {
            selectedRowKeys,
            columnWidth: 62,
            hideDefaultSelections: true,
            onChange: this.onSelectChange,
            getCheckboxProps: row => {
                const result = disabledSelectRows.some(v=>v.inventoryId === row.inventoryId)
                return({
                    disabled: result, 
                    name: result ? 'tableUnChecked' : 'canSelect'
                })
            },
        }
    }

    /* 渲染表格table */
    renderTable=()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        let { list=[], tableOption={}, scrollTop=0 } = data
        return(
            <VirtualTable
                ref={this.tableRef}
                // columns={this.renderColumns()}
                columns={tableColumnsField}
                rowSelection={this.rowSelection()}
                dataSource={list}
                key='productTable'
                rowKey="inventoryId"  // checkbox勾选的唯一标识
                scrollTop={scrollTop}
                style={{ width: `${tableOption.x}px` }}
                scroll={{ y: tableOption.y, x: tableOption.x}}
                bordered
                height={1000}
                width={tableOption.x+10}
                headerHeight={78}
                allowResizeColumn   // 表格是否可拖动
            /> 
        )
    }

    // 合计
    renderFooter = (currentPageData) =>{
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [],  
              selectedRow = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        const total = list.length
        const selectedNum = selectedRow.length
        return<div>
            <span>{`合计： ${total} 条`}</span>
            <span>{`已选中： ${selectedNum} 条`}</span>
        </div>
    }

    
    // 取消
    onCancel = (params) => { this.component.props.closeModal(params) }

    // 保存
    onSave = ()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { selectedRowKeys=[], list=[]} = data
        const selectRows = list.filter(v=>selectedRowKeys.includes(v.inventoryId))
        this.onCancel(selectRows)
        return selectRows
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { tableOption = {} } = data
        let appDom = document.querySelector('.ttk-stock-card-BOM-select-products-div-mian')
        const tableW = appDom && appDom.offsetWidth
        const tableH = appDom && appDom.offsetHeight
        this.metaAction.sfs({
            'data.tableOption' : fromJS({
                ...tableOption,
                x: tableW,
                y: tableH
            })
        })      
        return
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

