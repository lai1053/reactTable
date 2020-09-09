import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import BatchSelect from '../components/BatchSelection'
import { getList, denyClick, stockLoading,deepClone, canClickTarget, setListEmptyVal } from '../commonAssets/js/common'
import { Radio, Button} from 'edf-component'
import OwnTable from './OwnTable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
 
    onInit = async({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi  // 需要写
        this.props = this.component.props
        this.isNeedMatchCost = this.props.isNeedMatchCost
        injections.reduce('init',{})
        this.props.setOkListener && this.props.setOkListener(()=>{
            return this.onOk()
        })
        // 如果需要匹配成本科目
         if(this.isNeedMatchCost){
            let costList = await this.webapi.stock.acquisitionCostSubjectList() || []
            this.costList = this.composeCostList(costList) || []
         }else{
             this.costList = []
         }
        this.currentUser = this.metaAction.context.get('currentUser')
        this.metaAction.sf('userId', this.currentUser+Math.random())  // 获取用户id
       
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

    load = async()=>{
        const {requestParams, list, listIds} = this.props  // 获取过滤筛选框的下拉列表的参数
        let resp  // 主列表
        if(list && Object.prototype.toString.call(list)==='[object Array]'){ // 父组件传入存货列表
            resp = [...list]
        }else if(listIds){
            this.metaAction.sf('data.loading', true)
            resp = await this.webapi.stock.getInventoryGoods(listIds)  // 接口获取存货列表
            this.metaAction.sf('data.loading', false)
        }else{
            resp = []
        }
        resp = resp && resp.length === 0 ? getList.call(this,'list') : resp
        this.allList = resp.slice(0)             
        this.injections.reduce('updateSfs',{
            ['data.isNeedMatchCost']: this.isNeedMatchCost,
            ['data.list']: fromJS(resp),
            ['data.requestParams']: fromJS(requestParams)
        })
        // setTimeout(()=>{ this.getTableScroll() },100)
    }

    // 筛选框
    filterCallBack=(item)=>{
        const {name, inventoryClassId} = item
        let radioVal = this.metaAction.gf('data.radioValue')
        const filterList = this.filterList(name, inventoryClassId,radioVal)
        this.injections.reduce('updateSfs',{
            ['data.list']: fromJS(filterList),
            ['data.name']: fromJS(name),
            ['data.inventoryClassId']: fromJS(inventoryClassId)
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
        this.metaAction.sf('data.radioValue',val)
        const name = this.metaAction.gf('data.name')
        const inventoryClassId = this.metaAction.gf('data.inventoryClassId')
        const filterList = this.filterList(name, inventoryClassId, val)
        this.injections.reduce('updateSfs',{['data.list']:fromJS(filterList)})
    }

    componentWillUnmount=()=>{
        this[`deny-stock-subjectMatchClickFlag`] = null
    }

    // 批量设置
    batchSet = async(type)=>{
        const selectedKeyRows = getList.call(this, 'selectedRowKeys')
        const list = getList.call(this, 'list')
        const hasClick = canClickTarget.getCanClickTarget('batchSetting')  
        if(!hasClick){
            const title = this.isNeedMatchCost && type ==='cost' ? '成本科目' : '存货科目'
            let inventoryList = [], firstPropertyId, accountCode = []
            let selectRows = list.filter(v=>selectedKeyRows.includes(v.id))
            if(selectRows.length===0){
                this.metaAction.toast('warning',`请先勾选要批量设置${title}的存货！`)
                return
            }
            
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
                    inventoryList = await this.webapi.stock.findEndSonListByPidList({propertyId: firstPropertyId}) || []
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

            canClickTarget.setCanClickTarget('batchSetting', true)
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
                ></BatchSelect>)
            })
            canClickTarget.setCanClickTarget('batchSetting', false)
            if(ret && ret!==true){  
                let list = getList.call(this,'list')
                let filterList    
                this.allList = this.changelist(ret, this.allList, type)
                filterList = this.allList.length!==list.length ? this.changelist(ret, list, type) : [...this.allList]
                this.injections.reduce('updateSfs',{
                    ['data.list']: fromJS(filterList),
                    ['data.selectedRowKeys']: fromJS([]),
                    ['data.checkedRows']: fromJS([])
                }) 
            }
        }
    }

    // 批量设置回填到存货列表表格
    changelist = (ret, list, type)=>{
        const selectedRowKeys = getList.call(this,'selectedRowKeys')
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
        let flag = true, stockError = '', costError='', errorTips=''
        let list = deepClone(this.allList)
        list = setListEmptyVal(list)
        for(let v of list){
            if(this.isNeedMatchCost && (!v.salesCostAccountId || !v.salesCostAccountName)){
                v.salesCostAccountError = true
                flag = false
                costError = `成本科目`
            }
        }
        errorTips = stockError &&  costError ? `${stockError} 和 ${costError} ` : (stockError + costError)
        if(!flag){  this.injections.reduce('updateSfs',{['data.list']:fromJS(list)}) }
        const ret = flag ? list : flag
        return {ret, errorTips}
    }

    // 保存
    onOk= async()=>{
        const {ret, errorTips} = this.checkForm()
        if(ret){
            const params = ret.map(v=>({...v}))
            this.metaAction.sf('data.loading', true)
            const resp = await this.webapi.stock.updateSubjectMatching(params)  
            this.metaAction.sf('data.loading', false)
            if(resp){ this.metaAction.toast('success',resp) }
            return true
        }else{
            this.metaAction.toast('error',`有${errorTips}未设置，请设置！`)
            return false
        }
    }

    onSelectChange = selectedRowKeys => {
        this.metaAction.sf('data.selectedRowKeys', fromJS(selectedRowKeys))
    }

    onTableChange=(obj)=>{
        for(let v in obj){
            if(v=='data.list'){
                this.allList = deepClone( obj[v] )
            }
            if (typeof(obj[v])=='object' && obj[v]!=null){
                obj[v] = fromJS(obj[v])
            }  
        }
        this.metaAction.sfs({...obj})
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], list=[], scrollTop=0, loading } = data
        
        return (
            <React.Fragment>
                <div className="ttk-stock-app-matchSubject-container">
                    {data.loading && 
                        <div className='ttk-stock-app-spin'>
                            {stockLoading() }
                        </div>
                    }
                    <div className='ttk-stock-app-matchSubject-header'>
                        <AppLoader 
                            name={"ttk-stock-app-completion-warehousing-filter?"+data.userId}
                            store={this.component.props.store}
                            requestParams={data.requestParams} 
                            callback={v => this.filterCallBack(v)}
                        />
                        <Radio.Group 
                            options={data.radioOptions} 
                            value={data.radioValue}
                            onChange={this.radioChange} 
                            className='ttk-stock-app-matchSubject-header-radio'
                        />
                        <div className='ttk-stock-app-matchSubject-header-btns'>
                            {/* <Button 
                                className='ttk-stock-app-matchSubject-header-batchStockSubject'
                                onClick={() => this.batchSet("stock")}
                                type='default' 
                            >
                                批设存货科目
                            </Button> */}
                            {data.isNeedMatchCost && 
                                <Button 
                                    className='ttk-stock-app-matchSubject-header-batchCostSubject'
                                    onClick={() => this.batchSet("cost")}
                                    type='default' 
                                >
                                    批设成本科目
                                </Button>
                            }
                        </div>
                    </div>
                    <div className='ttk-stock-app-matchSubject-body  mk-layout'>
                        <OwnTable
                            selectedRowKeysArr={selectedRowKeys}
                            listData={list} 
                            isNeedMatchCost={data.isNeedMatchCost}
                            costList={this.costList} 
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.component.props.store} 
                            scrollTop = {scrollTop}
                            onChange={this.onTableChange}
                        />
                        
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
