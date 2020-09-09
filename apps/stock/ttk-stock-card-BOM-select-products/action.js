import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Icon, Input } from 'antd'
import debounce from 'lodash.debounce'
import { toJS, fromJS } from 'immutable'
import { tableColumnsField } from './staticField'
// import { format } from 'util';

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
            const selectedRows = this.metaAction.gf('data.selectedRows') && this.metaAction.gf('data.selectedRows').toJS() || []
            return selectedRows
        })
        const selectedList = this.component.props.selectedList || []
        const wholeList = this.component.props.wholeList || []
        this.load(wholeList, selectedList)
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
                if(v.trim() && (item.inventoryName.indexOf(v)>-1 || item.inventoryCode.indexOf(v)>-1)){
                    return item
                }
            })
        }
        this.injections.reduce('updateSfs',{['data.list'] : fromJS(allList)})
    }

    renderColumns = ()=>{
        const header = tableColumnsField
        return header
    }

    rowSelection =()=>{
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        let selectedRowArr = this.metaAction.gf('data.selectedRows') && this.metaAction.gf('data.selectedRows').toJS() || []
        let disabledSelectRows = this.metaAction.gf('data.disabledSelectRows') && this.metaAction.gf('data.disabledSelectRows').toJS() || []
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

    renderFooter = (currentPageData) =>{
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [],  
              selectedRow = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        const total = list.length
        const selectedNum = selectedRow.length
        return<div style={{textAlign: 'left'}}>
            <span>{`合计： ${total} 条`}</span>
            <span style={{marginLeft: '20px'}}>{`已选中： ${selectedNum} 条`}</span>
        </div>
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || []
            let appDom = document.getElementsByClassName('ttk-stock-card-BOM-select-products-div-mian')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;                
               
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: width - 20 ,
                        y: height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: width - 20
                    })
                }
            }
        } catch (err) {}
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

