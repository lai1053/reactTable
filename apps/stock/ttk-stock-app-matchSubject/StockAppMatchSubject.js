import React, {useRef, useState} from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import SelectSubject from '../components/SelectSubject'
import VirtualTable from '../../invoices/components/VirtualTable/index'
import SelectCost from '../components/SelectCost'
import BatchSelect from '../components/BatchSelection'
import { denyClick, stockLoading, deepClone, canClickTarget, setListEmptyVal} from '../commonAssets/js/common'
import { Radio, Button, Table} from 'edf-component'
import { fetch } from 'edf-utils'
// {
//     getInventoryTypesFromArchives: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryTypesFromArchives', v), //存货列表
//     findEndSonListByPidList: (v) => fetch.post('/v1/biz/bovms/stock/common/findEndSonListByPidList', v), //存货科目下拉列表
//     acquisitionCostSubjectList: (v) => fetch.post('/v1/biz/bovms/stock/common/acquisitionCostSubjectList', v), // 获取成本科目下拉   
//     updateSubjectMatching: (v) => fetch.post('/v1/biz/bovms/stock/common/updateSubjectMatching', v), // 保存科目匹配结果  
//     detectionScopeConflict: (v) => fetch.post('/v1/biz/bovms/stock/common/detectionScopeConflict', v), // 检测科目类型是否有冲突 
//     getInventoryGoods: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryGoods', v), // 获取
// }
// import {Spin} from 'antd'

const tableColumns = [{
    title: '存货编号',
    key: 'code',
    dataIndex: 'code',
    width: 90,
    align: 'center'
},{
    title: '存货名称',
    key: 'name',
    dataIndex: 'name',
    // width: 267,
    flexGrow: 1,
    align: 'left'
},{
    title: '规格型号',
    key: 'specification',
    dataIndex: 'specification',
    width: 95,
    align: 'center'
},{
    title: '单位',
    key: 'unitName',
    dataIndex: 'unitName',
    width: 55,
    align: 'center'
},{
    title: '存货科目',
    titleText: '存货科目',
    key: 'inventoryRelatedAccountName',
    dataIndex: 'inventoryRelatedAccountName',
    width: 240,
    isMust: true,
    isSelect: true,
    align: 'center'
},{
    title: '成本科目',
    titleText: '成本科目',
    key: 'salesCostAccountName',
    dataIndex: 'salesCostAccountName',
    isMust: true,
    isSelect: true,
    width: 200,
    align: 'center'
}]


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
                    'list': list,
                    'scrollTop': tableRef.current.bodyRef.current.scrollTop
                })
            }
        }

        const onSelectChange = (selectedRowKeys, record, checked )=> {      
            const idx = list.findIndex(v=>v.id === record.id)
            onChange({
                'selectedRowKeys': selectedRowKeys,
                'scrollTop': tableRef.current.bodyRef.current.scrollTop
            })
        }

        const renderColumns = ()=>{
            let columns = [...tableColumns]
            let newCol = columns.map(v=>{
                if(v.isMust){
                    v.title = <span className="title-text required d-header-text"> { v.title } </span>
                }else{
                    v.title = <div className='d-header-text'>{v.title}</div>
                }
                
                if(isNeedMatchCost && v.dataIndex==='salesCostAccountName'){
                    v.render = (text, record, index)=>{
                        const accountCode = record.accountCode && record.accountCode.toString().slice(0, 4) || ''
                        return <SelectCost
                                    placeholder='请选择成本科目'
                                    key={`cost-key-${record.id}-${index}`}
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
                    if(!isNeedMatchCost){
                        v.width = 260
                    }
                    v.render = (text, record, index)=>{  
                        const accountCode = record.accountCode && record.accountCode.toString().slice(0, 4) || ''
                        return <SelectSubject
                                    placeholder='请选择存货科目'
                                    key={`stock-key-${record.id}-${index}`}
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
                                    <span title={text} className="subject-match-textOverflow">
                                        {text}
                                    </span>
                                </div>
                    }
                }

                if(isNeedMatchCost){
                    return v
                }else{
                    return v.dataIndex !== 'salesCostAccountName' && v
                }
            })
            
            if(!isNeedMatchCost) {
                newCol = newCol.slice(0, newCol.length - 1)
            }

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
        const width = document.querySelector('.')
        return (
            <VirtualTable
                className="header-group-table"
                key='id'
                rowKey='id'
                rowSelection={rowSelection}
                style={{ 'width': `976px`}}
                columns={cols}
                ref={tableRef}
                scrollTop={scrollTop||0}
                dataSource={list}
                scroll={{ y: 360, x: 976 }}
                bordered
            />
        )
}

class StockAppMatchSubject extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
			userId: '',
			inventoryClass: [],
			tableOption:{
				y: 400
			},
			radioValue: '0',
			radioOptions: [
				{ label: '全部', value: '0' },
				{ label: '已匹配', value: '1'},
				{ label: '未匹配', value: '2' }
			],
			selectedRowKeys: [],
			checkedRows: [],
			list:[],
			costList:[]
        }
        
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.paramsObj || {}
        this.component = props.component || {}
        this.okListener =  this.component.props.setOkListener
    }

    componentWillMount = async()=>{
        const { isNeedMatchCost, list, requestParams} = this.params
          // 如果需要匹配成本科目
        if(isNeedMatchCost){
            let costList = await fetch.post('/v1/biz/bovms/stock/common/acquisitionCostSubjectList') || []
            this.costList = this.composeCostList(costList) || []
         }else{
             this.costList = []
         }
        this.currentUser = this.metaAction.context.get('currentUser')
        this.setState({
            'userId': this.currentUser+Math.random(),
            'list': list
        })  // 获取用户id
        this.load()
    }

    // 成本科目的数据格式
    composeCostList=(list)=>{
        const costList = list.map(v=>{
            const label = `${v.accountCode} ${v.salesCostAccountName}`
            const value = v.salesCostAccountId
            const val = JSON.stringify({label, value})
            return {label, value: val, disabled: (v.grade == 1 && list.length>1)}
        })
        return costList
    }
    
    gList=()=>{
        let {list} = this.state
        return list
    }

    load = async()=>{
        const {requestParams, list, listIds} = this.params
        let resp  // 主列表
        if(list && Object.prototype.toString.call(list)==='[object Array]'){ // 父组件传入存货列表
            resp = [...list]
        }else if(listIds){
            this.setState({'loading': true})
            let inventoryIds =  Object.prototype.toString.call(listIds)==='[object Array]' && listIds || []
            resp = await fetch.post('/v1/biz/bovms/stock/common/getInventoryGoods', inventoryIds)  // 接口获取存货列表
            this.setState({'loading': false})
        }else{
            resp = []
        }
        resp = resp && resp.length === 0 ? this.gList() : resp
        this.allList = resp.slice(0)  
        this.setState({
            'isNeedMatchCost': this.isNeedMatchCost,
            'list': resp,
            'requestParams': requestParams
        })           
    }

    // 筛选框
    filterCallBack=(item)=>{
        const {name, inventoryClassId} = item
        let { radioVal } = this.state
        const filterList = this.filterList(name, inventoryClassId,radioVal)
        this.setState({
            'list': filterList,
            'name': name,
            'inventoryClassId': inventoryClassId
        })
    }

    filterList = (name, inventoryClassId, radioVal)=>{
        let list = this.allList.slice(0), matchedList=[], unMatchList=[], all
        all = list.map(v=>{
            if(!v.inventoryRelatedAccountId || !v.inventoryRelatedAccountName){
                unMatchList.push(v)
            }else if( this.isNeedMatchCost && (!v.salesCostAccountId || !v.salesCostAccountName)){
                unMatchList.push(v)
            }else{
                matchedList.push(v)
            }
            return v
        })

        list = radioVal==='1' ? matchedList : ( radioVal==='2' ? unMatchList : all )
        if(name || inventoryClassId){
            list = list.filter(v=> {
                if(name && inventoryClassId ){
                    return (v.name.indexOf(name)>-1 || v.code.indexOf(name)>-1) && v.propertyId.toString() === inventoryClassId.toString()
                }else if(name && !inventoryClassId){
                    return (v.name.indexOf(name)>-1 || v.code.indexOf(name)>-1)
                }else if(!name && inventoryClassId){
                    return  v.propertyId.toString() === inventoryClassId.toString()
                }else{
                    return v
                }
            })
        }
        return list
    }
    
    // radio 切换 匹配状态
    radioChange=(event)=>{
        let val = event.target.value
        this.setState({'radioValue': val})
        const {name, inventoryClassId} = this.state
        const filterList = this.filterList(name, inventoryClassId, val)
        this.setState({'list': filterList})
    }

    componentWillUnmount=()=>{
        this[`deny-stock-subjectMatchClickFlag`] = null
    }

    // 批量设置
    batchSet = async(type)=>{
        // const canClick = denyClick(this, 'deny-stock-subjectMatch')
        const {selectedRowKeys, list} = this.state
        const hasClick = canClickTarget.getCanClickTarget('batchSetting')  
        if(!hasClick){
        // if(canClick){
            const title = this.isNeedMatchCost && type ==='cost' ? '成本科目' : '存货科目'
            let inventoryList = [], firstPropertyId, accountCode = []
            let selectRows = list.filter(v=>selectedRowKeys.includes(v.id))
            if(selectRows.length===0){
                this.metaAction.toast('warning',`请先勾选要批量设置${title}的存货！`)
                return
            }

            canClickTarget.setCanClickTarget('batchSetting', true)
            // 存货科目检测科目范围是否冲突
            if(type==='stock'){  // 批设存货科目
                firstPropertyId = selectRows[0].propertyId
                selectRows.forEach((item)=>{ 
                    const accCode = (item.accountCode && typeof(item.accountCode) =='string') && item.accountCode.slice(0,4) || ''
                    if(accCode){
                        accountCode.push(accCode) 
                    }
                    if(accountCode.length>1){
                        accountCode = Array.from(new Set(accountCode))
                    }
                })
                const isConflict = selectRows.some(v=> v.propertyId != firstPropertyId)
                if(isConflict){
                    this.metaAction.toast('error', '所选存货批设科目范围存在冲突，需重新选择')
                    return
                }else{
                    inventoryList = await fetch.post('/v1/biz/bovms/stock/common/findEndSonListByPidList', { 'propertyId': firstPropertyId})  || []
                    let data = [], obj = {}
                    inventoryList.map(v => {
                        if(!obj[v.inventoryRelatedAccountId]){
                            obj[v.inventoryRelatedAccountId] = v.inventoryRelatedAccountId
                            const value = v.inventoryRelatedAccountId
                            const label = `${v.accountCode} ${v.inventoryRelatedAccountName}`
                            const val = JSON.stringify({label, value})
                            data.push({label, value: val})
                        }  
                    })
                    inventoryList = data && Object.prototype.toString.call(data)==='[object Array]' ? data : []
                }
            } else{   // 批设成本科目
                const currentOrg = this.metaAction.context.get('currentOrg')
                accountCode = currentOrg.accountingStandards == '2000020001' ? ['6401', '6402'] : ['5401', '5402']  // 企业会计准则不同，编码不同
            }
            
            const ret = await this.metaAction.modal('show',{
                title: `批设${title}`,
                okText: '确定', 
                cancelText: '取消',
                width: 450,
                bodyStyle: {padding: '50px 0 120px'},
                children: (<BatchSelect
                                spanText = {`批设${title}`}
                                placeholder = {`请选择${title}`}
                                batchType = { type }
                                metaAction={ this.metaAction }
                                webapi = { this.webapi }
                                store={this.props.store}
                                propertyId = { firstPropertyId }
                                accountCode = {accountCode}
                                // optionList = {this.isNeedMatchCost && type==='cost' ? this.costList : inventoryList}
                        ></BatchSelect>)
            })
            
            if(ret && ret!==true){  
                let { list } = this.state
                let filterList    
                this.allList = this.changelist(ret, this.allList, type)
                filterList = this.allList.length!==list.length ? this.changelist(ret, list, type) : [...this.allList]
                this.setState({
                    'list': filterList,
                    'selectedRowKeys': [],
                    'checkedRows': []
                }) 
            }
            canClickTarget.setCanClickTarget('batchSetting', false)
        }
    }

    // 批量设置回填到存货列表表格
    changelist = (ret, list, type)=>{
        const { selectedRowKeys } = this.state
        const retList = list.map(v=>{
            if(selectedRowKeys.indexOf(v.id)>-1){
                v = this.isNeedMatchCost && type==='cost' ? 
                    this.changeValues(v,ret,'salesCostAccount') : this.changeValues(v,ret,'inventoryRelatedAccount')
            }
            return v
        })
        return retList
    }

    changeValues=(v, ret, field)=>{
        const item = {...v}
        item[`${field}Id`] = ret.value
        item[`${field}Name`] = ret.label
        item[`${field}Error`] = false
        return item
    }

    // 校验数据是否为空
    checkForm =()=>{
        let list
        let flag = true, stockError = '', costError='', errorTips=''
        this.allList = this.allList.map(v=>{
            // v.specification = (v.specification != undefined && v.specification != null) ? v.specification : null
            // v.unitId = (v.unitId != undefined && v.unitId != null) ? v.unitId : null
            // v.unitName = (v.unitName != undefined && v.unitName != null) ? v.unitName : null
            // v.propertyId = (v.propertyId != undefined && v.propertyId != null) ? v.propertyId : null
            // v.propertyName = (v.propertyName != undefined && v.propertyName != null) ? v.propertyName : null
            // v.propertyTemplateId = (v.propertyTemplateId != undefined && v.propertyTemplateId != null) ? v.propertyTemplateId : null
            // v.inventoryType = (v.inventoryType != undefined && v.inventoryType != null) ? v.inventoryType : null
            // v.inventoryTypeName = (v.inventoryTypeName != undefined && v.inventoryTypeName != null) ? v.inventoryTypeName : null
            // v.inventoryRelatedAccountId = (v.inventoryRelatedAccountId != undefined && v.inventoryRelatedAccountId != null) ? v.inventoryRelatedAccountId : null
            // v.inventoryRelatedAccountName = (v.inventoryRelatedAccountName != undefined && v.inventoryRelatedAccountName != null) ? v.inventoryRelatedAccountName : null
            // v.id = (v.id != undefined && v.id != null) ? v.id : null
            // v.ts = (v.ts != undefined && v.ts != null) ? v.ts : null
            // v.code = (v.code != undefined && v.code != null) ? v.code : null
            // v.name = (v.name != undefined && v.name != null) ? v.name : null
            // v.helpCode = (v.helpCode != undefined && v.helpCode != null) ? v.helpCode : null
            // v.helpCodeFull = (v.helpCodeFull != undefined && v.helpCodeFull != null) ? v.helpCodeFull : null
            // v.isEnable = (v.isEnable != undefined && v.isEnable != null) ? v.isEnable : null
            // v.fullname = (v.fullname != undefined && v.fullname != null) ? v.fullname : null
            // v.isLoadingDefaultAccount = (v.isLoadingDefaultAccount != undefined && v.isLoadingDefaultAccount != null) ? v.isLoadingDefaultAccount : null
            // v.accountCode = (v.accountCode != undefined && v.accountCode != null) ? v.accountCode : null
            // v.includingDisabledAccount = (v.includingDisabledAccount != undefined && v.includingDisabledAccount != null) ? v.includingDisabledAccount : null
            // v.salesCostAccountId = (v.salesCostAccountId != undefined && v.salesCostAccountId != null) ? v.salesCostAccountId : null
            // v.salesCostAccountName = (v.salesCostAccountName != undefined && v.salesCostAccountName != null) ? v.salesCostAccountName : null
            if(!v.inventoryRelatedAccountId || !v.inventoryRelatedAccountName){
                v.inventoryRelatedAccountError = true
                flag = false
                stockError = '存货科目'
            }
            if(this.isNeedMatchCost && (!v.salesCostAccountId || !v.salesCostAccountName)){
                v.salesCostAccountError = true
                flag = false
                costError = `成本科目`
            }
            return v
        }) 
        this.allList = setListEmptyVal(this.allList)
        errorTips = stockError &&  costError ? `${stockError} 和 ${costError} ` : (stockError + costError)
        list = this.allList.slice(0)
        if(!flag){  
            this.setState({'list': list}) 
        }
        const ret = flag ? list : flag
        return {ret, errorTips}
    }

    // 保存
    onOk= async()=>{
        const {ret, errorTips} = this.checkForm()
        if(ret){
            const params = ret.map(v=>({...v}))
            const resp = await fetch.post('/v1/biz/bovms/stock/common/updateSubjectMatching', params)  
            if(resp){ this.metaAction.toast('success',resp) }
            return true
        }else{
            this.metaAction.toast('error',`有${errorTips}未设置，请设置！`)
            return false
        }
    }

    onVerticalScroll() {
        let { list=[] } = this.state
        if (list.some(s => s.editing)) {
            return false;
        }
        return true;
    }

    onTableChange=(obj)=>{
        this.setState({...obj})
    }

    // 页面渲染
    render = () => {
        let { 
            selectedRowKeys=[], list=[], loading,  radioOptions, 
            radioValue, isNeedMatchCost, tableOption, scrollTop
        } = this.state

        let { userId='11', requestParams } = this.params || {}
        
        return (
            <React.Fragment>
                { loading && <div className='ttk-stock-app-spin'>{ stockLoading() } </div> }
                <div className='ttk-stock-app-matchSubject-header'>
                    <AppLoader 
                        name={"ttk-stock-app-completion-warehousing-filter?"+ userId}
                        store={this.component.props.store}
                        requestParams={ requestParams } 
                        callback={v => this.filterCallBack(v)}
                    />
                    <Radio.Group 
                        options={ radioOptions } 
                        value={ radioValue }
                        onChange={this.radioChange} 
                        className='ttk-stock-app-matchSubject-header-radio'
                    />
                    <div className='ttk-stock-app-matchSubject-header-btns'>
                        <Button className='ttk-stock-app-matchSubject-header-batchStockSubject' type='default' onClick={() => this.batchSet("stock")}
                        > 批设存货科目 </Button>
                        
                        { isNeedMatchCost && <Button 
                                className='ttk-stock-app-matchSubject-header-batchCostSubject' type='default'onClick={() => this.batchSet("cost")}>
                                批设成本科目
                            </Button>
                        }
                    </div>
                </div>
                <div className='ttk-stock-app-matchSubject-body  mk-layout'>
                        <OwnTable
                            selectedRowKeysArr={selectedRowKeys}
                            listData={list} 
                            loading={loading}
                            isNeedMatchCost={isNeedMatchCost}
                            costList={this.costList} 
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.props.store} 
                            scrollTop = {scrollTop}
                            listCallBack=''
                            onChange={this.onTableChange}
                        />
                </div>
            </React.Fragment>
        )
    }
}

export default StockAppMatchSubject