import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import {step2Table, step3Table } from './staticField'
import utils from 'edf-utils'
import { Button} from 'antd'
import { toJS, fromJS } from 'immutable'
import InputWithTip from '../components/InputWithTip'
import VirtualTable from '../../invoices/components/VirtualTable'
import { 
    formatSixDecimal, 
    deepClone, 
    transToNum, 
    getVoucherDate, 
    stockLoading, 
    timerCall, 
    getClientSize,
    addEvent,
    removeEvent,
    flatten,
    HelpIcon,
    formatNumbe,
    formatNumber,
    numFixed 
} from '../commonAssets/js/common'
import {Input as EdfInput, Button as EdfButton,  
    Select, Icon, Popover, Modal, Checkbox } from 'edf-component'
import PickingRule from './component/PickingRule'
// import OwnTable from './component/OwnTable'
let modalHeight=0, 
    modalWidth=0, 
    modalBodyStyle=0

const calClientSize = ()=> {
    const obj = getClientSize()
    modalHeight = obj.modalHeight
    modalWidth = obj.modalWidth
    modalBodyStyle = obj.modalBodyStyle
}
calClientSize()

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.currentOrg = this.metaAction.context.get('currentOrg') || {}  // 当前企业信息
        this.name = this.currentOrg.name  //当前企业名称
        this.time = sessionStorage['stockPeriod'+ this.name]  //当前会计期间
        
        this.steps = ['step2', 'step3']
        this.metaAction.sf('data.currentStep', 'step2')
        // this.loadStep2()
        this.tableRef = React.createRef()
        this.tableRef2 = React.createRef()

        this.step2Field = deepClone(step2Table)
        this.step3Field = deepClone(step3Table)

        this.sumWidth = 1120
        this.sumWidth2 = 1120
        this.currentFlag = 0  // 当前的步骤，值为0/1/2
        this.metaAction.sf('data.stepArray', fromJS(['step2', 'step3']))
    }

    componentDidMount = ()=>{
        this.loadStep2()
        addEvent(window, 'resize', ::this.resizeTable)
        setTimeout(()=>{
            this.resizeTable()
        }, 100)
    }

    componentWillUnmount = ()=>{
        removeEvent(window, 'resize', this.resizeTable)
        this.currentFlag = null
        this.timer = null
    }

    loadStep2 = async(flag)=>{
        this.metaAction.sf('data.loading', true)
        let res = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 2          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })    
        this.metaAction.sf('data.loading', false)
        if(res){
            let list = deepClone(res.llDetailDtoList || []) 
            const classTypeArr = [], contain={}
            list = list.filter(item=>{
                if(!contain[item.inventoryClassName]){
                    classTypeArr.push(item.inventoryClassName)
                    contain[item.inventoryClassName] = item.inventoryClassName
                }
                item.zanguPrice = item.unitCost || 0                       //暂估单价的取数规则
                item.ybbalance = transToNum( item.ybbalance.toFixed(2) )   // 金额保留两位小数  （20200209修改 jira-5733）
                return transToNum(item.ybbalance)>0                        // 过滤，只有待领料金额大于0的，才显示在页面上
            })
            const fl = this.formatList(list)  //格式化数据金额
            const total = res.totalDllAmount || 0
            this.injections.reduce('updateSfs',{
                'data.list': fromJS(fl),
                'data.copyList': fromJS(list),
                'data.currentStep': 'step2', // 当前步骤
                'data.disabledNext': false,
                'data.billBodyYbBalance': total, // 本次领料金额（bom领料时是剩余领料金额）
                'data.form.propertyDetailFilter': classTypeArr,
                'data.selectedRowKeys': fromJS([])
            })
            return list
        }else{
            this.injections.reduce('updateSfs',{ 'data.disabledNext': true })
        }  
    }

    // 处理非BOM列表数据
    dealWithData2 =(selectedRowKeys)=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { billBodyYbBalance=0, list=[] } = data
        let gapList = [],         // 有库存缺口的存货列表
            zhengTotal = 0,       // 整数单位应领料合计数
            decimalTotal = 0,     // 小数单位应领料合计数
            ybbalanceTotal = 0,   // 应领料金额合计数
            selectedRows = []     // 勾选的存货列表
        let actualTotalCash = 0
        const decimalItems = []  // 小数单位的存货列表

        list = list.map(item=>{

            item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错

            if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                selectedRows.push(item)
                if(item.calculationType=='3000180001'){  // 整数单位标志代码  
                    zhengTotal = parseFloat( zhengTotal.toFixed(2) ) + transToNum(item.ybbalance)  // 计算出整数单位之和 （20200209修改 jira-5733）
                }else{
                    decimalItems.push(item)
                    decimalTotal =  parseFloat( decimalTotal.toFixed(2) ) + transToNum(item.ybbalance)  // 计算出小数单位金额的总和  （20200209修改 jira-5733）
                }
            }else{
                item.numChange = ''
                item.priceChange = ''
                item.ybbalanceChange = ''
                item.inventoryGap = ''
                item.zanguYbbalance = ''
            }
            return item
        })
        ybbalanceTotal = parseFloat( (zhengTotal + decimalTotal).toFixed(2) ) // 勾选存货的待领料金额合计数 （20200209修改 jira-5733）
        let zhengActual = 0  //整数单位取整后的金额

        // 整数单位取整，并算出整数单位取整之后的尾差之和
        list = list.map(item=>{
            item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
            if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/ybbalanceTotal ) * transToNum(billBodyYbBalance)).toFixed(2)  // 算出每个存货本次领料金额
                item.priceChange = transToNum(item.unitCost)  
                item.numChange = transToNum( (transToNum(item.ybbalanceChange)/transToNum(item.priceChange)).toFixed(6) )           // 每个存货本次领料数量
              
                let roundNumber = Math.round(item.numChange),  // 取整之后的数量
                    currentMoney = transToNum( ( roundNumber * transToNum(item.priceChange) ).toFixed(2) )  // 取整后的金额，数量乘以单价  （20200209修改 jira-5733）      
                
                if(item.calculationType=='3000180001'){ // 如果是整数单位的存货  
                    zhengActual = parseFloat(zhengActual.toFixed(2)) + currentMoney        // 整数单位存货取整后的实际金额合计  （20200209修改 jira-5733）
                    const gap = transToNum(item.num) - roundNumber.toFixed(6)              // 每个存货本次领料后余额 （待领料数量 - 本次领料数量）
                    actualTotalCash = transToNum( (actualTotalCash + currentMoney).toFixed(2))
                    if(gap>=0){
                        item.inventoryGap = ''
                        item.zanguYbbalance = ''

                    }else{
                        item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                        item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                        item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                        item.ybbalance = transToNum(item.ybbalance)  //待领料金额（这里要转化成Number类型，否则格式化的时候会变成NaN）
                        gapList.push({...item})  //库存缺口列表

                    }
                }
                item.ybbalanceChange = currentMoney  // 本次领料金额
                item.numChange = roundNumber   // 本次领料数量  
            }
            return item
        })

        // 最后一个存货的索引
        let lastDecIndex = list.length - 1

        // 小数单位计算数量
        list = list.map((item, index)=>{
            item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
            if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                if(item.calculationType != '3000180001'){  // 非整数单位        
                    item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/decimalTotal ) * (transToNum(billBodyYbBalance) - zhengActual)).toFixed(2)  // 小数单位本次领料
                    item.ybbalanceChange = transToNum(item.ybbalanceChange)
                    item.priceChange = transToNum(item.unitCost)    // 成本单价
                    /* 如果本次领料金额等于待领料金额，那么本地领料数量等于待领料数量 */
                    if(item.ybbalanceChange === transToNum(item.ybbalance)){
                        item.numChange = transToNum(item.num)
                    }else{
                        item.numChange = transToNum( (transToNum(item.ybbalanceChange)/item.priceChange).toFixed(6))   
                    }
                    actualTotalCash = transToNum( (actualTotalCash + item.ybbalanceChange).toFixed(2))
                    const gap = transToNum(item.num) - item.numChange  // 待领料数量减去本次领料单的差
                    if(gap>=0){
                        item.inventoryGap = ''
                        item.zanguYbbalance = ''
                    }else{   // 有库存缺口的情况
                        item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                        item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                        item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                        item.ybbalance = transToNum(item.ybbalance)  // 转换成Number类型，否在在格式化的时候可能会出错
                        gapList.push({...item})  //库存缺口列表
                    }

                    // 找到最后一个小数单位的存货的索引
                    if(item.inventoryId == decimalItems[decimalItems.length-1]['inventoryId']){
                        lastDecIndex = index
                    }
                }
            }
            return item
        })

        // 计算多出来的金额倒挤到最后一条存货
        if(selectedRowKeys.length>0){
            const rest = transToNum(billBodyYbBalance) - transToNum(actualTotalCash)
            actualTotalCash = transToNum(actualTotalCash) + rest 
            list[lastDecIndex]['ybbalanceChange'] = transToNum( list[lastDecIndex]['ybbalanceChange'] ) + rest
        }

        const fList = this.formatList( list ) // 格式化数据
        this.injections.reduce('updateSfs',{
            'data.list': fromJS(fList),
            'data.copyList': fromJS(deepClone(list)),
            'data.selectedList': fromJS( deepClone(selectedRows)),
            'data.gapList': fromJS(gapList),
            // 'data.needToZangu': (gapList.length > 0),
            'data.billBodyYbBalance': billBodyYbBalance, //本次领料金额
            'data.scrollTop': this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    // 是否取整
    showOptionsChange = (key) => {
        this.metaAction.sf('data.form.rounding', key)
        let data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], list=[]} = data
        if (key == true) {
            timerCall(this, 'checkTimer', this.dealWithCheck, [selectedRowKeys, list] )
        
        } else { 
            if(selectedRowKeys.length>0){
                timerCall(this, 'unCheckTimer', this.dealWithData2, [selectedRowKeys])
            }  
        }
    }

    /* 数量取整 */
    dealWithCheck = (selectedRowKeys, list) => {
        const ret = this.roundingList(selectedRowKeys, list)
        list = ret.list
        let gapList = ret.gapList
        this.metaAction.sfs({
            'data.gapList': fromJS(gapList),
            'data.list': fromJS(list),
            'data.copyList': fromJS(deepClone(list))
        })
    }

    // 取整计算
    roundingList=(selectedRowKeys, list)=>{
        let  gapTotal = 0, gapList =[] 
        list.forEach((item,index) => {
            if(selectedRowKeys.includes(item.inventoryId)){             // 该存货是否已勾选
                if(transToNum(item.numChange)>0){                       // 如果本次领料数量大于0
                    item.numChange = formatNumbe(item.numChange,0)      // 该存货本次领料数量取整
                    
                    if( formatNumbe(item.numChange) === formatNumbe(item.num) ){             
                        item.ybbalanceChange = formatNumbe(formatNumbe(item.ybbalance),2)    
                    }else{
                        item.ybbalanceChange = formatNumbe(formatNumbe(item.numChange)*formatNumbe(item.unitCost),2)    // 本次领料金额 
                    }
                        
                    if(formatNumbe(item.numChange)>formatNumbe(item.num)){
                        item.inventoryGap = formatSixDecimal(formatNumbe(item.numChange)-formatNumbe(item.num))
                        item.zanguYbbalance = formatNumbe(formatNumbe(item.ybbalanceChange)-formatNumbe(item.ybbalance),2)
                        item.zanguPrice = Math.abs( ( transToNum(item.zanguYbbalance)/transToNum(item.inventoryGap) ).toFixed(6) )
                        gapTotal = formatNumbe(formatNumbe(gapTotal)+formatNumbe(item.inventoryGap),2)     // 库存缺口数合计
                    }else{
                        item.inventoryGap=''
                        item.zanguYbbalance=''
                        item.zanguPrice = ''
                    }
                }
            } 
            //库存缺口
            if(transToNum(item.inventoryGap) && transToNum(item.zanguYbbalance) ){
                gapList.push({...item})
            }
        })

        return{
            list,
            gapList
        }

    }

    // 获取领料的数据
    getLinglao = async()=>{
        this.metaAction.sfs({
            'data.loading': true, 
            'data.currentStep': 'step2', // 当前步骤
        })
        let res = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 2          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })
        this.metaAction.sf('data.loading', false)
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], form={} } = data
        if(res){
            let list = deepClone(res.llDetailDtoList || []) 
            list = list.filter(item=>{
                item.zanguPrice = item.unitCost || 0 //暂估单价的取数规则
                item.ybbalance = transToNum( item.ybbalance.toFixed(2) )  
                return transToNum(item.ybbalance)>0    // 过滤，只有待领料金额大于0的，才显示在页面上
            })

            let billBodyYbBalance = res.totalDllAmount || 0  // 本次领料金额
            let gapList = [],         // 有库存缺口的存货列表
                zhengTotal = 0,       // 整数单位应领料合计数
                decimalTotal = 0,     // 小数单位应领料合计数
                ybbalanceTotal = 0,   // 应领料金额合计数
                selectedRows = []     // 勾选的存货列表
            
            let actualTotalCash = 0
            const decimalItems = []  // 小数单位的存货列表
            list = list.map(item=>{
                item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    selectedRows.push(item)
                    if(item.calculationType=='3000180001'){  // 整数单位标志代码  
                        zhengTotal = parseFloat( zhengTotal.toFixed(2) ) + transToNum(item.ybbalance)  // 计算出整数单位之和 
                    }else{
                        decimalItems.push(item)
                        decimalTotal =  parseFloat( decimalTotal.toFixed(2) ) + transToNum(item.ybbalance)  // 计算出小数单位金额的总和
                    }
                }else{
                    item.numChange = ''
                    item.priceChange = ''
                    item.ybbalanceChange = ''
                    item.inventoryGap = ''
                    item.zanguYbbalance = ''
                }
                return item
            })
            ybbalanceTotal = parseFloat( (zhengTotal + decimalTotal).toFixed(2) ) // 勾选存货的待领料金额合计数 
            let zhengActual = 0  //整数单位取整后的金额

            // 整数单位取整，并算出整数单位取整之后的尾差之和
            list = list.map(item=>{
                item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/ybbalanceTotal ) * transToNum(billBodyYbBalance)).toFixed(2)  // 算出每个存货本次领料金额
                    item.priceChange = transToNum(item.unitCost)  
                    item.numChange = transToNum( (transToNum(item.ybbalanceChange)/transToNum(item.priceChange)).toFixed(6) )           // 每个存货本次领料数量
                
                    if(item.calculationType=='3000180001'){            // 如果是整数单位的存货 
                        let roundNumber = Math.round(item.numChange),  // 取整之后的数量
                            currentMoney = transToNum( ( roundNumber * transToNum(item.priceChange) ).toFixed(2) )  // 取整后的金额，数量乘以单价 
                        item.ybbalanceChange = currentMoney  
                        item.numChange = roundNumber  
                        zhengActual = parseFloat(zhengActual.toFixed(2)) + currentMoney        // 整数单位存货取整后的实际金额合计 
                        const gap = transToNum(item.num) - roundNumber.toFixed(6)              // 每个存货本次领料后余额 （待领料数量 - 本次领料数量）
                        actualTotalCash = transToNum((actualTotalCash + currentMoney).toFixed(2))
                        
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''

                        }else{
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                            item.ybbalance = transToNum(item.ybbalance)  //待领料金额（这里要转化成Number类型，否则格式化的时候会变成NaN）
                            gapList.push({...item})  //库存缺口列表
                        }
                    }
                }
                return item
            })

            // 最后一个存货的索引
            let lastDecIndex = list.length - 1

            // 小数单位计算数量
            list = list.map((item, index)=>{
                item.ybbalance = transToNum(item.ybbalance)  // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    if(item.calculationType != '3000180001'){  // 非整数单位   
                        item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/decimalTotal ) * (transToNum(billBodyYbBalance) - zhengActual)).toFixed(2)  // 小数单位本次领料
                        item.ybbalanceChange = transToNum(item.ybbalanceChange)
                        item.priceChange = transToNum(item.unitCost)    // 成本单价
                        
                        /* 如果本次领料金额等于待领料金额，那么本地领料数量等于待领料数量 */
                        if(item.ybbalanceChange === transToNum(item.ybbalance)){
                            item.numChange = transToNum(item.num)
                        }else{
                            item.numChange = transToNum( (transToNum(item.ybbalanceChange)/item.priceChange).toFixed(6))   
                        }

                        actualTotalCash = transToNum((actualTotalCash + item.ybbalanceChange).toFixed(2))
                        const gap = transToNum(item.num) - item.numChange  // 待领料数量减去本次领料单的差
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
                        }else{   // 有库存缺口的情况
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                            item.ybbalance = transToNum(item.ybbalance)  // 转换成Number类型，否在在格式化的时候可能会出错
                            gapList.push({...item})  //库存缺口列表
                        }

                        // 找到最后一个小数单位的存货的索引
                        if(item.inventoryId == decimalItems[decimalItems.length-1]['inventoryId']){
                            lastDecIndex = index
                        }
                    }
                }
                return item
            })

            // 计算多出来的金额倒挤到最后一条存货
            if(selectedRowKeys.length>0){
                const rest = transToNum(billBodyYbBalance) - transToNum(actualTotalCash)
                actualTotalCash = transToNum(actualTotalCash) + rest 
                list[lastDecIndex]['ybbalanceChange'] = transToNum( list[lastDecIndex]['ybbalanceChange'] ) + rest
            }
            const { rounding } = form   // 是否勾选“取整”
            if(rounding){
                const ret = this.roundingList(selectedRowKeys, list)  // 取整计算
                gapList = ret.gapList
                list = ret.list
            }

            const fList = this.formatList( list ) // 格式化数据
            const total = res.totalDllAmount || 0
            this.injections.reduce('updateSfs',{
                'data.list': fromJS(fList),
                'data.copyList': fromJS(deepClone(list)),
                'data.gapList': fromJS(gapList),
                // 'data.needToZangu': (gapList.length > 0),  // true：需要暂估；false: 不需要暂估，目前这个变量已经不需要了
                'data.billBodyYbBalance': total, // 本次领料金额（bom领料时是剩余领料金额）
                'data.selectedRowKeys': fromJS(selectedRowKeys)
            })
            return list
        }else{
            this.injections.reduce('updateSfs',{ 'data.disabledNext': true })
        }  
    }

    // 添加文本溢出隐藏样式
    addTextOverflow = (item)=>{
        if( item.dataIndex!==undefined ){
            item.title = <div className="td-header-text"> {item.title} </div>
            item.render = (text,record,index)=>{
                return <div className="tdTextOverflow" title={text}> {text} </div>  
            }
        }
        return item
    }

    // 渲染列
    renderColumns = (fields) =>{
        const currentStep = this.metaAction.gf('data.currentStep')
        let columns = fields
       if(currentStep==='step2'){  // 第一步表格
            columns = fields.map(item=>{
                item.title = <div className="td-header-text"> { item.title } </div>

                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{  v = this.addTextOverflow(v) })
                }
                item = this.addTextOverflow(item)
                return item
            })

        }else if(currentStep==='step3'){   // 第二步表格
            columns = fields.map(item=>{
                item.title = <div className="td-header-text"> {item.title} </div>

                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{
                        v = this.addTextOverflow(v)
                        if(v.dataIndex==='numChange'){
                            v.title= <div className="td-header-text"> {v.title} </div>
                            v.render = (text,record,index)=>{
                                return  <InputWithTip
                                    className='picking-amount-input'
                                    format={'amount'}
                                    isError={record.numChangeError} 
                                    errorTips={'本次领料数量不能大于待领料数量!'}
                                    defaultVal={text}
                                    inputEvent={(value)=>{this.handleNumInput(value, record, v.dataIndex, currentStep)}} 
                                />       
                            }
                        }
                    })
                }
                item = this.addTextOverflow(item)
                return item
            })
        }
        return columns
    }

    // 完工入库单入库数输入框修改
    handleNumInput=(value, record, field, currentStep)=>{
        let val = value
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const index = list.findIndex(v=>v.inventoryId===record.inventoryId)
        const num  = transToNum(list[index]['num']) //待领料数量
        let ybbalanceChange = ''

        let originalData = this.metaAction.gf('data.step3_list') && this.metaAction.gf('data.step3_list').toJS() || [], 
            original = 0
        if(originalData.length>0){
            original = transToNum(originalData[index]['numChange'])   // 原本的本次领料数量
        }

        // 本次领料数量要小于待领料数量
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
        this.injections.reduce('updateSfs',{ 
            'data.list': fromJS(list),
            'data.copyList': fromJS(deepClone(list))
        } )
    }

    //表格数量、单价、金额格式化
    formatList = (list)=>{
        const listCopy = ( 
            Object.prototype.toString.call(list)==='[object Array]' && list.length>0 
            ) ? 
            deepClone( list ) 
            : []

        const step = this.metaAction.gf('data.currentStep') || ''
        const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        const formatList = listCopy.map(item=>{
            for(const v in item){
                if(
                    v.indexOf('num')> -1 
                    || v.indexOf('unitCost')> -1 
                    || v.indexOf('price')> -1 
                    || v.indexOf('Price')> -1 
                    || v.indexOf('amountOfClaim')> -1 
                    || v.indexOf('inventoryGap')> -1
                ){
                    item[v] = transToNum(item[v])
                    item[v] = transToNum(item[v]) ? formatSixDecimal(item[v], 6) : ''
                    if(v== 'numChange' && step=='step2' && selectedRowKeys.includes(item.inventoryId)){
                        item[v] = formatSixDecimal(item[v], 6)
                    }
                }else if(
                    v.indexOf('ybbalance')> -1 
                    || v.indexOf('Ybbalance')> -1 
                    || v.indexOf('ybbalanceChange')>-1 
                    || v.indexOf('zanguYbbalance')>-1
                ){
                    item[v] = transToNum(item[v])
                    item[v] = transToNum(item[v]) ? utils.number.format(item[v], 2) : ''
                    if(v== 'ybbalanceChange' && step=='step2' && selectedRowKeys.includes(item.inventoryId)){
                        item[v] = utils.number.format(item[v], 2)
                    }
                }
            }
            return item
        })
        return formatList
    }

   // 新增
   newBill = async(billType, billList)=>{
        if(!billType){
            console.log(new Error('没有提供要创建单据的类型，无法创建单据！'))
            return
        }
        // 生成单据编码
        const codeNum = await this.webapi.stock.getBillCodeTran({ 
            'type': billType,  
            'period': this.time || '' 
        }) 

        let rkDate = getVoucherDate( this.time )
        // 生成单据
        if(codeNum && rkDate){
            const obj = {
                'serviceTypeCode': billType,
                'code': codeNum,  // 凭证编号
                'cdate': rkDate,  // 获取入库日期
                'operater': this.currentOrg.financeAuditor,  // 制单人
                'billBodyDtoList': billList, // 存货明细列表
                'type': 9
            }
            const ret = await this.webapi.stock.createBillTitle(obj)
            if (ret && ret.billBodys.length!==0){  
                return ret.code
            }else{
                console.log('获取不到单据号！')
                return false
            }   
        }
    }

    // 切换步骤
    switchStep = async(step) => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { stepArray=[], selectedRowKeys=[] } = data
        // 校验非bom领料要勾选
        if(step==='next' && stepArray[this.currentFlag]==='step2' && selectedRowKeys.length===0){
            await this.metaAction.modal('warning',{
                title: '无法进行下一步操作！',
                content: '请先勾选参与本次分配的非BOM存货！',
            })
            return
        }
        //下一步操作
        if(step==='prev' && this.currentFlag > 0){
            this.currentFlag --
        }else if(step==='next' && this.currentFlag < stepArray.length){
            this.currentFlag ++
        }
        const currentStep = stepArray[this.currentFlag]
        step==='prev' ? this.getPrevData(currentStep) : this.getNextData(currentStep)
    }

    /* 上一步 */
    getPrevData = async(currentStep)=>{
        this.getLinglao()
    }

    // 变成下一步，赋值
    getNextData= async(currentStep)=>{  
        // const needToZangu = this.metaAction.gf('data.needToZangu')
        const gapList = this.metaAction.gf('data.gapList') && this.metaAction.gf('data.gapList').toJS() || []
        if(gapList.length>0){  // 如果需要暂估并且没有生成暂估入库单，那么就弹出询问框
            const ret = await this.metaAction.modal('confirm',{
                content: '选择的数据含有负库存，是否暂估?',
                okText: '暂估入库',
                cancelText: '取消',
            })

            if(ret==true){
                
                let zanguAll = gapList
                let rukuret
                // 暂估入库单
                if(zanguAll.length>0){ 
                    let zanguBillList = zanguAll.map(v=>{
                        let {
                            inventoryCode,
                            inventoryName,
                            inventoryUnit,
                            inventoryGuiGe,
                            inventoryId, 
                            inventoryGap, 
                            zanguPrice, 
                            zanguYbbalance 
                        } = v
                        return {
                            inventoryCode,
                            inventoryName,
                            inventoryUnit,
                            inventoryGuiGe,
                            'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null,
                            'num': Math.abs(transToNum(inventoryGap)) || 0, 
                            'price': Math.abs(transToNum(zanguPrice)) || 0,
                            'ybbalance': Math.abs(transToNum(zanguYbbalance).toFixed(2)) || 0,  // 20200209 jira-5733
                        }
                    })

                    zanguBillList = zanguBillList.filter(v=>(v.num && v.ybbalance))

                    if(zanguBillList.length>0){
                        rukuret = await this.metaAction.modal('show', {
                            title: '新增',
                            okText: '保存',
                            footer: null,
                            width: modalWidth,
                            height: modalHeight,
                            bodyStyle: modalBodyStyle,
                            wrapClassName: 'adjust-wrap-top modal-padding-20-30',
                            children: this.metaAction.loadApp('ttk-stock-app-inventory-picking-ruku', {
                                store: this.component.props.store,
                                list: zanguBillList,
                            })
                        })
                    }
                    
                } 
                if (!rukuret || rukuret!=='failed') {                 
                    this.getStep3Data(currentStep)
                }
            }else{
                this.getStep3Data(currentStep)
            }

        }else{
            if(currentStep==='step3'){
                await this.getStep3Data(currentStep)
                return
            }
        }
    }

    //计算生成领料单数据
    getStep3Data = async(currentStep)=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        let {list=[], selectedRowKeys=[]} = data
        let table2 = list.filter((v)=>selectedRowKeys.includes(v.inventoryId))
        this.injections.reduce('updateSfs',{
            'data.currentStep': currentStep,
            'data.loading': true,
            'data.list': fromJS([])
        })
        let newData = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 2          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })

        let table3 = deepClone(newData.llDetailDtoList)
        let finalTable = table2.map(v=>{
            for(const o of table3){
                if(v.inventoryId==o.inventoryId){
                    v.num = o.num
                    v.unitCost = o.unitCost
                    v.ybbalance = o.ybbalance
                }
            }
            if(transToNum(v.ybbalance)>0){
                return v
            } 
        })

        const fl = this.formatList(finalTable)
        this.injections.reduce('updateSfs',{
            'data.list': fromJS(fl),
            'data.copyList': fromJS(deepClone(finalTable)),
            'data.step3_list': fromJS( deepClone(finalTable) ),
            'data.currentStep': currentStep,
            'data.loading': false
        })
        return finalTable
    }

     // 保存
     save = async () => {  
        let zanguCode = 'none', pickingCode
        const pickingAll = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let canSaveFlag = true
        if(pickingAll.length>0){
            const pickingBillList = []
            pickingAll.map(v=>{
                let {inventoryId, ybbalanceChange, priceChange, numChange } = v
                if(v.numChangeError){
                    canSaveFlag = false
                }
                if(transToNum(ybbalanceChange)>0){  // 过滤掉金额为0的存货
                    const item = {
                        'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null, 
                        'num': Math.abs(transToNum(numChange)) || 0, 
                        'price': Math.abs(transToNum(priceChange)) || 0,
                        'ybbalance': Math.abs(transToNum(ybbalanceChange).toFixed(2)) || 0,
                    }
                    pickingBillList.push(item)
                }
                return v
            })
            if(canSaveFlag){
                if(pickingBillList.length>0){
                    this.metaAction.sf('data.loading', true)
                    pickingCode = await this.newBill('SCLL', pickingBillList)
                }else{
                    this.metaAction.sf('data.loading', false)
                    this.metaAction.toast('warning','所有存货领料金额小于等于0，不能保存！')
                    return
                }  
            }else{
                this.metaAction.sf('data.loading', false)
                this.metaAction.toast('warning','本次领料数量不能大于待领料数量，请重新修改！')
                return
            }
            this.metaAction.sf('data.loading', false)
        }
        this.onCancel({zanguCode, pickingCode})
        return {zanguCode, pickingCode}
    }

    onCancel = (ret) => this.component.props.closeModal(ret) 
    
    /* 重置搜索框 */
    resetForm = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {form={}, copyList=[]} = data
        const {inputVal=''} = form
        let allList = deepClone(copyList)
        allList = (inputVal && inputVal.trim()) ? 
                    allList.filter( v=>( v.inventoryName.indexOf(inputVal)>-1 || v.inventoryCode.indexOf(inputVal)>-1 ) ) 
                    : allList
        this.metaAction.sfs({
            'data.form.filterType': '',
            'data.list': fromJS(allList)
        })
    }
    
    /*组合搜索*/
    filterList = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {form={},  copyList} = data
        const { filterType= '', inputVal='' } = form
        let allList = deepClone(copyList)
        allList = (inputVal&& inputVal.trim()) ? 
                    allList.filter( v=>( v.inventoryName.indexOf(inputVal)>-1 || v.inventoryCode.indexOf(inputVal)>-1 ) ) 
                    : allList
        let queryRet = (filterType && filterType.trim()) ? allList.filter( v=>(v.inventoryClassName == filterType.trim()) ) : allList
        this.metaAction.sfs({
            ['data.list'] : fromJS(queryRet),
            ['data.form.showPopoverCard']: false
        })
    }

    popoverSelectorChange = (v) => 
        this.metaAction.sf('data.form.filterType', v)
    

    handlePopoverVisibleChange = (visible) =>  
        this.metaAction.sf('data.form.showPopoverCard', visible)
    

    // 搜索下拉框的change事件
    filterCallBack = (e)=>{
        const val = e.target.value
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {copyList} = data
        let allList = deepClone(copyList)
        if(val && val.trim()){
            allList = allList.filter(v=>(v.inventoryName.indexOf(val)>-1 || v.inventoryCode.indexOf(val)>-1) )
        }
        const params = {
            ['data.list'] : fromJS(allList),
            ['data.form.inputVal']: val
        }
        timerCall(this, 'filterSearchTimer', this.metaAction.sfs, [params])   // 防抖调用
    }

    // 取数规则
    toPickingRule = async () => {
        const res = await Modal.show({
            title: '取数规则',
            width: 1000,
            className: 'ttk-stock-app-inventory-picking-fast-noBOM-picking-rule-modal',
            children: <PickingRule dataSource={[]} webapi={this.webapi.stock} period={this.time} />,
        })
        return res
    }

    // 合计数
    calTotal=(list, field)=>{
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

    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-inventory-picking-fast-noBOM-main")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight + 10) - 88 || 0
        let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || {}
        this.computeColWidth(tableW)
        this.metaAction.sfs({
            'data.tableOption': fromJS({
                ...tableOption,
                x: tableW,
                y: tableH,
            })
        })
    }

    computeColWidth = tableW => {
        const currentStep = this.metaAction.gf('data.currentStep')
        const key = (currentStep === 'step2') ? 'sumWidth' : 'sumWidth2'
        const colCount = currentStep === 'step2' ? 8 : 6  //(数量和金额以及存货名称列才分配)
        const selectionWidth = currentStep === 'step2' ? 62 :0
        let increment = Math.floor((tableW - this[key] - selectionWidth) / colCount)
        this.computeCol(this.step2Field, increment, key)
        this.computeCol(this.step3Field, increment, key)
    }
    
    computeCol = (field, increment, key)=>{
        let sumWidth = 0
        field.forEach((item, i)=>{
            if (item.children) {
                for (const el of item.children) {
                    el.width += increment
                    sumWidth += el.width
                }
            } else {
                item.width = (item.flexGrow || item.sum)? (item.width + increment) : item.width
                sumWidth += item.width
            }
        })
        this[key] = sumWidth
    }

    /* 渲染合计行 */
    renderSummaryRow = (list, columnField, currentStep) => {
        let rowData = this.calTotal(list, columnField)
        if(currentStep==='step2') { rowData.unshift('') } 
        
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                let cols = flatten(columns)
                const styleObj = {
                    'borderRight': '1px solid #d9d9d9',
                    'textAlign': 'left',
                    'padding': '0 10px',
                    'overflow': 'hidden',
                    'textOverflow': 'ellipsis',
                    'whiteSpace': 'nowrap'
                }
                const len = cols.length
                const rows = cols.map((item, idx)=>{
                    const ownStyle={
                        ...styleObj, 
                        'width': (item.width) +'px', 
                        'textAlign': item.align, 
                        'flexGrow': item.flexGrow
                    }
                    if(idx===(len-1)){
                        ownStyle['paddingRight'] = '20px'
                    }
                    const content = idx==0 ? '合计' : rowData[idx]
                    return (<div style={{...ownStyle}} title={content}> { content } </div>)
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }
        return summaryRows
    }

    onSelectChange = (selectedRowKeys, a, b) => {
        const list = this.metaAction.gf('data.list').toJS()
        this.metaAction.sfs({
            'data.selectedRowKeys': fromJS(selectedRowKeys)
        })
        timerCall(this, 'selectAllTimer', this.dealWithData2, [selectedRowKeys])     
    }

    // 统计合计数量和金额
    statics = (list)=>{
        const totalCash = list.reduce((total, item)=> numFixed(total+ transToNum(item.ybbalanceChange), 2) ,0)
        return totalCash
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { list=[], currentStep, tableOption={}, selectedRowKeys=[], form } = data 
        const scrollTop = this.metaAction.gf('data.scrollTop')
        const fields = currentStep=='step2' ? this.step2Field : this.step3Field
        const billBodyYbBalance = utils.number.format(data.billBodyYbBalance, 2)
        const popoverContent = (
            <div className='inv-batch-custom-popover-content'>
                <div className='filter-content'>
                    <div className='inv-batch-custom-popover-item'>
                        <div className='inv-batch-custom-popover-item' 
                            style={{width: '100%'}}>
                            <span className='inv-batch-custom-popover-label'>
                                存货类型：
                            </span>
                            <Select 
                                showSearch={false} 
                                value={data.form.filterType} 
                                style={{width: '170px'}}
                                onChange={this.popoverSelectorChange} 
                                getPopupContainer={trigger => trigger.parentNode}
                            >
                                {   data.form.propertyDetailFilter.map(el => (
                                        <Select.Option value={el}> {el} </Select.Option>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='noBom-filter-footer'>
                    <Button type='primary' onClick={this.filterList}> 查询 </Button>
                    <Button className='reset-btn' onClick={this.resetForm}> 重置 </Button>
                </div>
            </div>
        )
    
        const rowSelection = () => {
            return {
                selectedRowKeys,
                columnWidth: 62,
                hideDefaultSelections: true,
                onChange: this.onSelectChange,
                getCheckboxProps: row => {
                    return {}
                },
            }
        }
        
        return (
            <React.Fragment>
                <div className='ttk-stock-app-inventory-picking-fast-noBOM-div mk-layout'>
                    { data.loading && <div className='ttk-stock-app-spin'>{ stockLoading() }</div> }
                    <div className={ "ttk-stock-app-inventory-picking-fast-noBOM-title "+ data.currentStep}/>
                    <div className='ttk-stock-app-inventory-picking-fast-noBOM-sub'>
                        {
                            ( data.currentStep==="step2" || data.currentStep==="step3" ) 
                            &&  <div className='sub-component'>
                                   <span>
                                        <EdfInput.Search 
                                            className='ttk-stock-app-inventory-picking-fast-noBOM-sub-search'
                                            placeholder='请输入存货名称或存货编码' 
                                            onChange={ (v)=>{this.filterCallBack(v)} }
                                        />
                                         <Popover 
                                            placement="bottom" 
                                            content={popoverContent} 
                                            trigger="click"
                                            visible={data.form.showPopoverCard}
                                            onVisibleChange={this.handlePopoverVisibleChange}
                                        >
                                            <i className="noBom-filter-icon"> <Icon type='filter'/> </i>
                                        </Popover>
                                    </span> 
                                   
                                    <span className='ttk-stock-app-inventory-picking-fast-noBOM-sub-lingliaoCash'>
                                        {"应领料金额："+ billBodyYbBalance}
                                    </span>
                                    <span className='ttk-stock-app-inventory-picking-fast-noBOM-sub-picking-rule-btn' onClick={this.toPickingRule}></span>

                                    <div className='picking-fasgt-imbalance'>
                                        差额：
                                        { numFixed( transToNum(billBodyYbBalance) - this.statics(list), 2)}
                                        <i className='picking-fasgt-imbalance-icon'>{ HelpIcon('差额=应领料金额-本次领料金额合计', "right")}</i>
                                        
                                    </div>
                                </div>
                        }
                        {
                            data.currentStep==="step2" &&
                            <Checkbox 
                                className='noBom-picking-money-checkbox'
                                checked={form.rounding} 
                                onChange={(e)=> this.showOptionsChange(e.target.checked)}>
                                    数量取整
                            </Checkbox> 
                        }
                    </div>
                    <div className='ttk-stock-app-inventory-picking-fast-noBOM-main mk-layout'>
                        {   data.currentStep!=="step2" ? 
                                <VirtualTable
                                    ref={this.tableRef2}
                                    columns={this.renderColumns(fields)}
                                    className={`${currentStep}-table`}
                                    dataSource={list}
                                    key='step3Table'
                                    rowKey="inventoryId"
                                    scrollTop={scrollTop}
                                    style={{ width: `${tableOption.x}px` }}
                                    scroll={{ y: tableOption.y, x: tableOption.x}}
                                    summaryRows={this.renderSummaryRow(list, fields, currentStep)}
                                    bordered
                                    height={1000}
                                    width={tableOption.x+10}
                                    headerHeight={78}
                                    allowResizeColumn
                                />
                            :
                                <VirtualTable
                                    ref={this.tableRef}
                                    className={`${currentStep}-table`}
                                    columns={this.renderColumns(fields)}
                                    rowSelection={rowSelection()}
                                    dataSource={list}
                                    key='step2Table'
                                    rowKey="inventoryId"
                                    scrollTop={scrollTop}
                                    style={{ width: `${tableOption.x}px` }}
                                    scroll={{ y: tableOption.y, x: tableOption.x}}
                                    summaryRows={this.renderSummaryRow(list, fields, currentStep)}
                                    bordered
                                    height={1000}
                                    width={tableOption.x+10}
                                    headerHeight={78}
                                    allowResizeColumn
                                />
                                
                        }
                    </div>
                   
                </div>
                <div className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn'>  
                        <div className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn-btnGroup'>
                            {
                                data.currentStep==="step3" ? 
                                <EdfButton 
                                    className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn-btnGroup-item'
                                    type='primary' 
                                    onClick={(e)=>this.save('save')}
                                >
                                    保存
                                </EdfButton> :
                                <EdfButton 
                                    className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn-btnGroup-item'
                                    type='primary' 
                                    onClick={(e)=>this.switchStep('next')} 
                                    disabled={data.disabledNext}
                                >
                                    下一步
                                </EdfButton>
                            }
                            {
                                ( data.currentStep=="step3" ) &&
                                <EdfButton type='default' 
                                    className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn-btnGroup-item'
                                    onClick={(e)=>this.switchStep('prev')}>
                                        上一步
                                </EdfButton>
                            }
                            <EdfButton 
                                className='ttk-stock-app-inventory-picking-fast-noBOM-footer-btn-btnGroup-item btn-cancel'
                                onClick={()=>this.onCancel(false)}>
                                取消
                            </EdfButton>
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

