import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Icon, message } from 'antd'
import { toJS, fromJS} from 'immutable'
import utils from 'edf-utils'
import SelectName  from '../../../components/SelectName'
import AddDeleteIcon  from '../../../components/AddDeleteIcon'
import InputWithTip from '../../../components/InputWithTip'
import {pickMTable} from './staticField'
// import EditableCell from '../../components/EditableCellTable'
import{ 
    formatSixDecimal,
    addMustStar, 
    stockLoading, 
    transToNum, 
    getClientSize, 
    addEvent, 
    removeEvent 
} from '../../../commonAssets/js/common'
let { modalHeight, modalWidth, modalBodyStyle } = getClientSize()
/*
    @params: {
        "state": 0, --状态 0未开，1开启
        "bInveControl": 0, --是否进行负库存控制 0否 1是
        "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
        "endCostType":0, 以销定产0、传统生产1
        "isGenVoucher":true, 是否结账，未生成 false 生成 true
        "isCompletion":true,是否本月有完工入库单 有 true 没有 false
        "startPeriod":"2019-09", 启用月份
        "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
        "isCarryOverProductCost":false, 结转生产成本凭证，未生成 false 生成 true
        "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
        "inveBusiness",1 --1工业自行生产，0 存商业
    }
*/
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.rowCount=0;
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = config.current.webapi
        this.params = this.component.props.params || {}
        this.pid = this.component.props.pid
        this.deleteIdList = []
        injections.reduce('init')
        this.load()
    }

    componentDidMount=()=>
        addEvent(window, 'resize', ::this.initClientSize)
    

    componentWillUnmount=()=>{
        removeEvent(window, 'resize', this.initClientSize)
        this.deleteIdList = null
    }

    initClientSize = ()=>{
        const obj = getClientSize()
        modalHeight = obj.modalHeight
        modalWidth = obj.modalWidth
        modalBodyStyle = obj.modalBodyStyle
    }


    stockLoading=()=>stockLoading()
 
    // 存货列表
    load = async(update)=>{
        let mainList = [], code, period, res
        this.metaAction.sf('data.loading', true)
        res = await this.webapi.stock.getBOMConfigurationList({
            pid: this.pid || '',  
            inventoryNameOrBomCode: "",	
            page: {               
                // "currentPage": 1,   
                // "pageSize": 20       
            }
        })
        if(res){  // 无需判断数据来源endNumSource 是以销定产还是手工，因为如果是手工的话，后端直接返回空数组列表
            if(res.list && res.list.length!==0){
                mainList = res.list.map(item=>{
                    item.num = formatSixDecimal(item.num && item.num || '')  // 数量
                    item.price = formatSixDecimal(item.price && item.price || '')  // 金额
                    delete item.children
                    return item
                })
            }else{
                mainList = this.setBlank(11)
            }
        }      
        this.injections.reduce('updateSfs',{
            ['data.list']: fromJS(mainList),
            ['data.product']: this.component.props.product,
            ['data.loading']: false
        })
        if(!this.params.isGenVoucher){ this.reqInventoryList() }
        setTimeout(()=>{this.getTableScroll()},100)
    }

    // 请求存货科目
    reqInventoryList = async()=>{
        let inventoryList = await this.webapi.stock.acquisitionFinishedProducts({
            inventoryAttributes: 1403, 
            inventoryNameOrBomCode: ""	
        })
        inventoryList = inventoryList.map(v=>{
            v.inventoryGuiGe = v.inventoryGuiGe && v.inventoryGuiGe || ''
            return v
        })
        if(inventoryList){
            let selectOptions = this._parseSelectOption(inventoryList)
            selectOptions.splice(0, 0, {inventoryClassId: '',inventoryClassName: '全部', isCompletion: false})
            this.injections.reduce('updateSfs',{
                ['data.selectNameList']: fromJS(inventoryList),
                ['data.selectOptions']: fromJS(selectOptions)
            }) 
        }else{
            this.metaAction.toast('error', '查询数据出错！！！')
        }        
    }

    // 去重
    _parseSelectOption= (data)=>{
        const obj = {}, selectOptions = []
        data.map(v=>{     
            if(!obj[v.inventoryClassId]){
                obj[v.inventoryClassId] = v.inventoryClassId
                const {inventoryClassId, inventoryClassName} = v
                selectOptions.push({inventoryClassId, inventoryClassName}) 
            }
        })
        // console.log(selectOptions, 'JJJHHH')
        return selectOptions
    }

    // 设置空白表格
    setBlank=(rowAmount)=>{
        const mainList = []
        const item = {
            'xh': '',
            'bomId': '',
            'inventoryId': (new Date().getTime()),
            'inventoryCode': '',
            'inventoryName': '',
            'inventoryGuiGe': '',
            'inventoryUnit': '',
            'num': '',
            'price': ''
        }
        for(let i=0;i<rowAmount;i++){
            item.inventoryId = i+1
            mainList.push(Object.assign({},item))
        } 
        return mainList
    }

    // 过滤，主列表已有的存货，在存货列表中不可选
    _diffTheSame = ()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { selectNameList=[], list=[]} = data
        const options = selectNameList.map(v=>{
            v.disabled = false
            for(const item of list){
               if(item.inventoryId === v.inventoryId) v.disabled = true
            }
            return v
        })
        return options
    }

    //渲染表格
    renderColumns = () =>{
        let optionList = this._diffTheSame()
        const columns = pickMTable.map(item=>{
            if(item.isMust){
                const ele = addMustStar(item.titleText)
                item.title = ele
            }
            switch(item.dataIndex){
                case 'xh':
                    item.render = (text, record, index) => {
                        if(!this.params.isCarryOverProductCost){ // 如果还没有生成凭证,鼠标经过时
                            return <div className="operations">
                                <span className="xh">{index+1} </span> 
                                <AddDeleteIcon 
                                    callback={(icon)=>{this.handleAddOrDelete(icon,record, record.inventoryId)}}
                                />
                            </div>
                        }else{  
                            return <span className="xh">{index+1} </span>
                        }  
                    }
                    break;
                case 'inventoryName':
                    item.render =(text, record, index)=>{
                        if(!this.params.isCarryOverProductCost){
                            return <div className="tdChme">
                                    <SelectName 
                                        key={`key-${record.inventoryId}`} 
                                        className="selectName" 
                                        text={text}  
                                        optionList={optionList} 
                                        changeCallback={(v)=>{this.McChange(v, record.inventoryId) }}
                                    />
                                    <div className="selectMoreName" 
                                          onClick={()=>{this.selectMoreName(record)}}>
                                          <Icon type="ellipsis" />
                                    </div>
                            </div>
                        }else{
                            return <div  className="tdChme">{text}</div>
                        }
                    }  
                    break; 
                case 'num':
                    item.render = (text, record, index) => {
                        if(!this.params.isCarryOverProductCost){
                            return <div>
                                        <InputWithTip 
                                            format={'amount'}
                                            isError={record.numError} 
                                            errorTips = {''}
                                            defaultVal={text} 
                                            inputEvent={(value)=>{this.handleInput(value, record.inventoryId, 'num')}} 
                                            blurEvent={(value)=>{this.handleBlur(value, record.inventoryId, 'num')}}  
                                        />
                                </div>
                        }else{
                            return <div>{text}</div>
                        } 
                    }
                    break
                case 'price' :
                    item.render = (text, record, index) => {
                        if(!this.params.isCarryOverProductCost){
                            return <div>
                                    <InputWithTip 
                                        format={'amount'}
                                        isError={record.numError} 
                                        errorTips = {''}
                                        defaultVal={text} 
                                        inputEvent={(value)=>{this.handleInput(value, record.inventoryId, 'price')}} 
                                        blurEvent={(value)=>{this.handleBlur(value, record.inventoryId, 'price')}}  
                                    />
                            </div>
                        }else{
                            return <div>{text}</div>
                        }
                    }
                    break;
            }
            return item
        })
        return columns
    }

    handleInput = (value,rowId,field)=>{
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const index = list.findIndex(v=>v.inventoryId===rowId)
        try{
            if( value.trim() ){ list[index][`${field}Error`] = false }
            list[index][field] = value  // 这里要注意一下
        }catch(e){
            throw new Error(e,'handleInput')
        }
        this.injections.reduce('updateSfs',{'data.list':fromJS(list)})
    }

    handleBlur=(value, rowId, field, formatDecimal)=>{
        let v = value
        let list = this.metaAction.gf('data.list').toJS()
        let midVal = formatDecimal ? utils.number.format(v,formatDecimal) : v
        const index = list.findIndex(v=>v.inventoryId===rowId)
        try{
            list[index][field] = v = transToNum(midVal) ? midVal : ''
        }catch(e){ throw new Error(e, 'handleBlur') }
        this.injections.reduce('updateSfs',{ ['data.list']: fromJS(list) })
    }

    // 商品名称改变
    McChange(v,rowId){
        const content = JSON.parse(v)
        content.num = undefined
        content.price = undefined
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const con = {...content}  //对象字段：{inventoryCode,inventoryName,inventoryGuiGe,inventoryUnit,inventoryId}
        const idx = list.findIndex(v=>v.inventoryId===rowId)  
        list[idx] = con
        this.injections.reduce('updateSfs',{['data.list']:fromJS(list)})  
    }

    // 选择更多商品
    selectMoreName = async(record)=>{
        const selectNameList =  this._diffTheSame()
        const selectOptions = this.metaAction.gf('data.selectOptions') && this.metaAction.gf('data.selectOptions').toJS() || []
        const con = {
            title: '存货名称选择',
            wrapClassName: 'ttk-stock-card-select-warehousing-names adjust-wrap-top',
            width: 950,
            okText: '确定',
            allowDrag: false,
            children: this.metaAction.loadApp('ttk-stock-card-select-warehousing-names',{
                store: this.component.props.store,
                selectNameList,
                selectOptions,
                searchType: 'input',
                searchPlaceholder: '请输入存货名称或者存货编码'
            })
        }
        let res = await this.metaAction.modal('show',con) || []
        res = res.map(item=>{
            item.num = undefined
            item.price = undefined
            return item
        })
        const batchSelectedRows = res && res || []
        const mainList = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const index = mainList.findIndex(v=>v.inventoryId===record.inventoryId)
        const idx = mainList[index] && mainList[index].inventoryId && mainList[index].inventoryName ? (index+1) :index
        const delNum = mainList[idx] && mainList[idx].inventoryId && mainList[idx].inventoryName ? 0 : 1
        mainList.splice(idx, delNum, ...batchSelectedRows)
        this.injections.reduce('updateSfs',{'data.list': fromJS(mainList)})
    }

    // 增加或删除行
    handleAddOrDelete = async(icon,record, id)=>{
        let list = this.metaAction.gf('data.list') ? this.metaAction.gf('data.list').toJS():[]
        const index = list.findIndex(v=>v.inventoryId===record.inventoryId)
        if(icon==='add'){
            const newObj = {
                'xh': '',
                'bomId': '',
                'inventoryId': list.length+1+Math.random(),
                'inventoryCode': undefined,
                'inventoryName': '',
                'inventoryGuiGe': undefined,
                'inventoryUnit': undefined,
                'num': undefined,
                'price': undefined,
                'isDisable': false,
                'isSelect': false,
            }
            const newNum = parseInt(index) + 1 + Math.random()
            list.splice(newNum, 0, newObj)
            this.injections.reduce('updateSfs',{'data.list':fromJS(list)})
        }else{
            let param = {}, canDelete
            if(list[index].bomId) { // 如果是已存在的bom,检验是否可以删除
                param.deleteIdList = list[index].bomId ? [list[index].bomId] : []
                canDelete = await this.webapi.stock.deleteBOM(param)
                if(canDelete.code==0){ 
                    this.deleteIdList.push(list[index].bomId)
                }else{
                    this.metaAction.toast('error', '该条bom清单已被引用，不允许删除！')
                    return
                }
            }   
            if((list[index].bomId && canDelete.code==0)||!list[index].bomId){
                if(list.length>1){
                    list.splice(index,1)
                }else{
                    list = this.setBlank(1) 
                    message.destroy()
                }  
                this.metaAction.sf('data.list',fromJS(list))
            }   
        } 
    }
   
    // 校验
    checkform=()=>{
        const list  = this.metaAction.gf('data.list').toJS()
        let flag = true
        let checkedList = list.filter((item)=>{
            if(item.inventoryId && item.inventoryCode){
                const amountCash = item.num * item.price
                item.numError = !item.num
                item.pid = this.pid
                item.num = transToNum(item.num)
                item.price = transToNum(item.price)
                item.amount = amountCash && amountCash.toFixed(10) || ''
                if(!!item.numError){
                    flag = false
                }  
                return item
            } 
        })

        let fullList = checkedList
        if(checkedList){
            if(checkedList.length===0){
                this.metaAction.toast('warning','BOM列表为空，不能保存')
                return
            }else if(checkedList.length<5){
                fullList = checkedList.concat( this.setBlank((5 - checkedList.length)) )
            }
        }
        this.injections.reduce('updateSfs', {'data.list' : fromJS(fullList)})
        return { flag, checkedList }
    }

    // 取消
    onCancel = () => { this.component.props.closeModal() }

    // 保存
    onSave = async()=>{
        const {flag,checkedList} = this.checkform()
        if(flag){
            const params = {
                'bomId':"",         //空字符串，必填
                'inventoryId': "",  //空字符串，必填
                'pid': "",          //空字符串，必填
                'price': "",        //空字符串，必填
                'num': "",          //空字符串，必填
                'amount': "",       //空字符串，必填
                'list': checkedList,
                'deleteIdList': this.deleteIdList   //删除bomId列表，非必填（有删除记录时必填）
            }
            let res = await this.webapi.stock.saveBOMConfigurationList(params)
            if(res===null){
                this.metaAction.toast('success','保存成功!')
                this.onCancel('save-success')
            }
        }else{
            this.metaAction.toast('error','输入框的值不能为空')
        }
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('ttk-stock-app-picking-material')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {return}
                setTimeout(() => { this.getTableScroll()}, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];
            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                //const tfooterHeight = tfooterDom ? tfooterDom.offsetHeight : 0
                if (num < 0) {
                    delete tableOption.y
                    this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
                        ...tableOption,
                        x: width - 20 ,
                        y: height - theadDom.offsetHeight - 6 //- tfooterHeight,
                    })})     
                } else {
                    tableOption.y =  height - theadDom.offsetHeight //- tfooterHeight -5 //- tfooterHeight
                    if(tbodyDom.offsetHeight===0){
                        tableOption.y = height
                    }
                    this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
                        ...tableOption,
                        x: width - 20 ,
                        y: tableOption.y,
                    })})
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

