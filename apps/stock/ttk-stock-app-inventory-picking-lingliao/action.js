import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { step2Table, step3Table } from './staticField'
import utils from 'edf-utils'
import { Checkbox, Button} from 'antd'
import { toJS, fromJS } from 'immutable'
import InputWithTip from '../components/InputWithTip'
import {formatNumbe} from '../common'
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { 
    formatSixDecimal, 
    deepClone, 
    transToNum, 
    getVoucherDate, 
    timerCall, 
    stockLoading,
    getClientSize,
    addEvent, 
    removeEvent,
    flatten
} from '../commonAssets/js/common'
import { Input as EdfInput, Button as EdfButton,  Select, Icon, Popover } from 'edf-component'

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

        this.tableRef = React.createRef()
        this.tableRef2 = React.createRef()

        this.step2Field = deepClone(step2Table) 
        this.step3Field = deepClone(step3Table) 

        this.sumWidth = 1120
        this.sumWidth2 = 1120

        this.load()
        this.currentFlag = 0  // 当前的步骤，值为0/1/2
        this.metaAction.sf('data.stepArray', fromJS(this.steps))
    }

    componentDidMount = ()=>{
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

    load = async(flag)=>{
        this.metaAction.sf('data.loading', true)
        const propertyReq = this.webapi.stock.findInventoryEnumList() || []    // 领料存货类型列表
        let res = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, // 当前会计期间
            "llType": 1          //-- 领料类型，必传，1：新增领料；2：非BOM快速领料（必填）
        })
        this.metaAction.sf('data.loading', false)
        if(res){
            let list = deepClone(res.llDetailDtoList || []) 
            let total = 0
            list = list.filter(item=>{
                item.ybbalance = transToNum(item.ybbalance.toFixed(2))                              // 金额保留两位小数 
                total = transToNum(total.toFixed(2)) + transToNum(item.ybbalance)
                return transToNum(item.ybbalance)>0                                                 // 过滤待领料金额<=0的数据
            })
            const fl = this.formatList(list)   //格式化数据金额
            let propertyDetailFilter = await propertyReq || []
            propertyDetailFilter.unshift({name: '全部', inventoryClassName: ''})  // 存货类型
            const copyList = deepClone(fl)
            this.metaAction.sfs({
                'data.list': fromJS(fl),
                'data.nextList': fromJS([]),      // 下一步的列表数据 
                'data.copyList': fromJS(copyList),// 表格数据的副本
                'data.total': total,              // 所有待领料金额的合计数
                'data.currentStep': 'step2',      // 当前步骤
                'data.disabledNext': false,       // 下一步按钮是否禁用
                'data.form.propertyDetailFilter': propertyDetailFilter,
                'data.selectedRowKeys': fromJS([]),
            })

            return list
        }else{
            this.metaAction.sfs({ 'data.disabledNext': true })
        }  
    }

    // 处理非BOM列表数据
    dealWithData =(money, cancelKey)=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let selectMoneyChange = 0   //所勾选的存货的本次领料金额
        let { selectedRowKeys=[], list=[] } = data
        let gapList = [],          // 有库存缺口的存货列表
            nextList = []          // 保存下一步的数据

        if (!money && parseFloat(money) !== 0 ) {     // 输入
            money = this.metaAction.gf('data.form.money') || 0     // 输入框中的领料金额
        }
        money = transToNum(money)
        if( money ){     // 如果”本次领料金额“中输入数字
            const isCheck = this.metaAction.gf('data.form.includeSum')    // 是否勾选了取整计算
            const {ybbalanceTotal, decimalTotal} = this.sumSelectMoney()
            let zhengActual = 0  //整数单位取整后的金额
            let deciActual = 0
            // 整数单位取整，并算出整数单位取整之后的尾差之和
            list = list.map(item=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){  // 如果该存货已勾选，那么计算出该存货的本次领料数量、单价和金额
                    item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/ybbalanceTotal ) * transToNum(money)).toFixed(2)  // 算出每个存货本次领料金额
                    item.priceChange = transToNum(item.unitCost)  
                    item.numChange = transToNum( (transToNum(item.ybbalanceChange)/transToNum(item.priceChange)).toFixed(6) )           // 每个存货本次领料数量
                    
                    // 整数单位存货计算规则：
                    if(item.calculationType=='3000180001'){ 
                        let roundNumber = Math.round(item.numChange), 
                            currentMoney = transToNum( ( roundNumber * item.priceChange ).toFixed(2) )
                        item.ybbalanceChange = currentMoney  
                        item.numChange = roundNumber         
                        zhengActual = transToNum( ( transToNum(zhengActual)+ currentMoney ).toFixed(2) )         // 整数单位存货取整后的实际金额合计
                        selectMoneyChange = transToNum( (transToNum(selectMoneyChange) + transToNum(item.ybbalanceChange)).toFixed(2) )
                        const gap = transToNum( (transToNum(item.num) - roundNumber).toFixed(6) )// 每个存货本次领料后余额

                        if(gap>=0){   // 如果该勾选的存货没有暂估数
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
    
                        }else{
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                        }
                    }     
                }
                return item
            })
            deciActual = transToNum(money) - zhengActual  //实际的小数单位存货的金额= 本次领料总金额合计 - 本次整数金额合计
    
            const obj = {}
            // 小数单位计算数量
            list = list.map((item, index)=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    if(item.calculationType != '3000180001'){  // 非整数单位        
                        item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/decimalTotal ) * deciActual).toFixed(2) // 小数单位本次领料
                        item.ybbalanceChange = transToNum(item.ybbalanceChange)
                        item.priceChange = transToNum(item.unitCost)    // 成本单价
                        
                        /* 如果本次领料金额等于待领料金额，那么本地领料数量等于待领料数量 */
                        if(item.ybbalanceChange === transToNum(item.ybbalance)){
                            item.numChange = transToNum(item.num)
                        }else{
                            item.numChange = transToNum( (transToNum(item.ybbalanceChange)/item.priceChange).toFixed(6))  
                        }
                        
                        if(isCheck){ /*数量取整，重新计算金额*/ 
                            item.numChange = formatNumbe(item.numChange,0)      // 该存货本次领料数量取整
                            if( transToNum(item.numChange) == transToNum(item.num) ){
                                item.ybbalanceChange = transToNum(item.ybbalance)
                            }else{
                                item.ybbalanceChange = transToNum( formatNumbe(formatNumbe(item.numChange)*formatNumbe(item.unitCost),2) )   // 本次领料金额 
                            }
                        }

                        selectMoneyChange = transToNum( (selectMoneyChange+ transToNum(item.ybbalanceChange)).toFixed(2) )
                        const gap = transToNum( (transToNum(item.num) - transToNum(item.numChange)).toFixed(2) )// 待领料数量减去本次领料单的差
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
                        }else{   // 有库存缺口的情况
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs( (item.zanguYbbalance /item.inventoryGap).toFixed(6) )
                        }
                        obj[item.inventoryId] = index
                    }
                }
                return item
            })

            // 如果不取整，那么存货算出来的多余的金额倒挤到页面的最后一条存货上，不反算本次领料数量
            if(!isCheck && selectedRowKeys.length>0){ 
                const rest = transToNum(money) - transToNum(selectMoneyChange) 
                const arrKeys = Object.values(obj).sort((a,b)=>(a-b))   // 找到勾选的最后一个存货
                let lastDecIndex = list.length - 1 
                lastDecIndex = arrKeys[arrKeys.length-1] || 0
                list[lastDecIndex]['ybbalanceChange'] = transToNum( list[lastDecIndex]['ybbalanceChange'] ) + rest
            }

            if(cancelKey){  // 如果是取消勾选的话，要把取消的那一行数据清空
                for(const v of list){
                    if( v.inventoryId === cancelKey ){
                        v.numChange = ''
                        v.ybbalanceChange = ''
                        v.inventoryGap = ''
                        v.zanguYbbalance = ''
                        v.zanguPrice = ''
                    }
                }
            }            
          // 如果有领料金额          
        }else{        
            list = list.map((item, index)=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){    
                    item.ybbalanceChange = ''
                    item.priceChange = transToNum(item.unitCost)    // 成本单价
                    item.numChange = ''
                    item.inventoryGap = ''  // 存货缺口
                    item.zanguYbbalance = ''  // 每条存货的暂估金额
                    item.zanguPrice = ''
                }
                return item
            })
        } 

        const gapArr = [], nextArr =[]   // 统计有库存缺口的存货
        for(const v of list){
            if(transToNum(v.inventoryGap) || transToNum(v.zanguYbbalance)){
                gapArr.push({...v})
            }
            // 本次领料数量和金额都不为0的存货作为领料单的数据
            if(transToNum(v.numChange) && transToNum(v.ybbalanceChange) ){
                nextArr.push({...v})
            }
        }
        gapList = gapArr
        nextList = nextArr
        const fList = this.formatList( list ) // 格式化数据
        let copyList = this.genCopyList(fList)
        this.metaAction.sfs({
            'data.selectMoneyChange': selectMoneyChange,   // 已勾选金额
            'data.list': fromJS(fList),                    // 页面数据
            'data.nextList': fromJS(nextList),             // 下一步的数据
            'data.copyList': fromJS(copyList),             // 当前页面数据的备份
            'data.gapList': fromJS(gapList),               // 库存缺口存货集合
            'data.needToZangu': (gapList.length>0),        // 是否需要暂估
            'data.billBodyYbBalance': money,               // 本次领料金额
            'data.disabledNext': false,                    // 是否禁用下一步按钮
            'data.scrollTop': this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    // 备份
    genCopyList = (list)=>{
        let copyList = this.metaAction.gf('data.copyList') && this.metaAction.gf('data.copyList').toJS() || []
        copyList = copyList.map(item=>{
            for(const v of list){
                if(v.inventoryId==item.inventoryId){
                    item = deepClone(v)
                }
            }
            return item
        })
        return copyList
    }

    /* 计算勾选的存货的待领料金额合计 */
    sumSelectMoney = ()=>{
        let zhengTotal = 0,    // 整数单位金额合计
            decimalTotal = 0   // 小数单位金额合计
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], list=[] } = data     
        list = list.map(item=>{
            item.ybbalance = transToNum(item.ybbalance)     // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
            if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                if(item.calculationType=='3000180001'){     // 整数单位标志代码，'3000180001'——整数单位数据， '3000180002'——小数单位数据  
                    zhengTotal = transToNum( (transToNum(zhengTotal) + transToNum(item.ybbalance)).toFixed(2) )         // 已勾选整数单位存货 待领料数量合计
                
                }else{
                    decimalTotal =  transToNum( ( transToNum(decimalTotal)+transToNum(item.ybbalance) ).toFixed(2) )   // 已勾选小数单位存货 待领料金额的总和
                }
            }
            return item
        })
        const ybbalanceTotal = parseFloat( (zhengTotal + decimalTotal).toFixed(2) ) // 勾选存货的待领料金额合计数
        return { ybbalanceTotal, decimalTotal }
    }

    /* 全选计算 */
    selectAllFn = () =>{
        let selectMoneyChange = 0  //所勾选的存货的本次领料金额
        let gapArr = [],
            gapList = [],         // 有库存缺口的存货列表
            nextList = []
        
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { selectedRowKeys=[], list=[], form={} } = data
        let { includeSum, money } = form
             money = transToNum(money)
        let {ybbalanceTotal, decimalTotal} = this.sumSelectMoney()   // 计算出勾选存货待领料总金额和小数单位总金额

        if(money){
            let zhengActual = 0  //整数单位取整后的金额
            let deciActual = 0
            // 整数单位取整，并算出整数单位取整之后的尾差之和
            list = list.map(item=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/ybbalanceTotal ) * transToNum(money)).toFixed(2)  // 算出每个存货本次领料金额
                    item.priceChange = transToNum(item.unitCost)  
                    item.numChange = transToNum( (transToNum(item.ybbalanceChange)/transToNum(item.priceChange)).toFixed(6) )           // 每个存货本次领料数量
                    
                    if(item.calculationType=='3000180001'){ // 整数单位 
                        let roundNumber = Math.round(item.numChange), 
                            currentMoney = transToNum( ( roundNumber * item.priceChange ).toFixed(2) )
                        item.ybbalanceChange = currentMoney  
                        item.numChange = roundNumber  
                        zhengActual = parseFloat(zhengActual.toFixed(2)) + currentMoney        // 整数单位存货取整后的实际金额合计
                        selectMoneyChange = transToNum( (selectMoneyChange+ transToNum(item.ybbalanceChange)).toFixed(2) )
                        const gap = transToNum(item.num) - roundNumber.toFixed(6) // 每个存货本次领料后余额
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
    
                        }else{
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                            gapList.push({...item})  //库存缺口列表
                        }
                    }
                        
                }
                return item
            })
            deciActual = transToNum(money) - zhengActual

            const obj = {}
            list = list.map((item, index)=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    if(item.calculationType != '3000180001'){  // 非整数单位        
                        item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/decimalTotal ) * deciActual).toFixed(2)  // 小数单位本次领料
                        item.ybbalanceChange = transToNum(item.ybbalanceChange)
                        item.priceChange = transToNum(item.unitCost)    // 成本单价
                    
                        /* 如果本次领料金额等于待领料金额，那么本地领料数量等于待领料数量 */
                        if(item.ybbalanceChange === transToNum(item.ybbalance)){
                            item.numChange = transToNum(item.num)
                        }else{
                            item.numChange = transToNum( (transToNum(item.ybbalanceChange)/item.priceChange).toFixed(6))  
                        }

                        if(includeSum){  /*数量取整，重新计算金额*/
                            item.numChange = formatNumbe(item.numChange,0)      // 该存货本次领料数量取整
                            if( transToNum(item.numChange) == transToNum(item.num) ){
                                item.ybbalanceChange = transToNum(item.ybbalance)
                            }else{
                                item.ybbalanceChange = transToNum( formatNumbe(formatNumbe(item.numChange)*formatNumbe(item.unitCost),2) )   // 本次领料金额 
                            }
                        }
                        selectMoneyChange = transToNum( (selectMoneyChange+ transToNum(item.ybbalanceChange)).toFixed(2) )
                        const gap = transToNum(item.num) - transToNum(item.numChange)  // 待领料数量减去本次领料单的差
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
                        }else{   // 有库存缺口的情况
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs( (item.zanguYbbalance /item.inventoryGap).toFixed(6) )
                        }
                        obj[item.inventoryId] = index
                    }
                }
                return item
            })

            // 找到勾选的最后一条存货，计算出本次领料和按百分比算出的领料存货的差额合计，
            if(!includeSum){
                const rest = transToNum(money) - transToNum(selectMoneyChange)
                let lastDecIndex = list.length - 1                      // 最后一个存货的索引
                const arrKeys = Object.values(obj).sort((a,b)=>(a-b))   // 找到勾选的最后一个存货
                lastDecIndex = arrKeys[arrKeys.length-1] || 0 
                list[lastDecIndex]['ybbalanceChange'] = Math.abs( (transToNum(list[lastDecIndex]['ybbalanceChange']) + rest).toFixed(2) )
            }

        }else{  // 全选时金额为0的情况
            for(let v of list){
                v.numChange = ''
                v.ybbalanceChange = ''
                v.inventoryGap = ''
                v.zanguYbbalance = ''
                selectMoneyChange = 0
            }
        }
       
        const nextArr =[]   // 统计有库存缺口的存货
        for(const v of list){
            if(transToNum(v.inventoryGap) || transToNum(v.zanguYbbalance)){
                gapArr.push({...v})
            }
            if(transToNum(v.numChange) && transToNum(v.ybbalanceChange) ){
                nextArr.push({...v})
            }
        }

        nextList = nextArr
        gapList = gapArr

        const fList = this.formatList( list ) // 格式化数据
        let copyList = this.genCopyList(fList)
        this.metaAction.sfs({
            'data.selectMoneyChange': selectMoneyChange,
            'data.list': fromJS(fList),
            'data.nextList': fromJS(nextList),
            'data.copyList': fromJS(copyList),
            'data.gapList': fromJS(gapList),
            'data.needToZangu': (gapList.length>0),
            'data.disabledNext': false
        })
    }

    // 取消全选
    cancelAllFn = ()=>{
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        for(const v of list){
            v.numChange = ''
            v.ybbalanceChange = ''
            v.inventoryGap = ''
            v.zanguYbbalance = ''
            v.zanguPrice = ''
        }
        let copyList = this.genCopyList(list)
        this.metaAction.sfs({
            'data.selectMoneyChange': 0,
            'data.list': fromJS(list),
            'data.nextList': fromJS([]),
            'data.copyList': fromJS(copyList),
            'data.gapList': fromJS([]),
            'data.needToZangu': false,
            'data.disabledNext': false,
            'data.scrollTop': this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    // 获取领料的数据
    getLingliao = async()=>{
        let step3Data = this.metaAction.gf('data.step3_list') && this.metaAction.gf('data.step3_list').toJS() || []
        this.metaAction.sf('data.loading', true)
        let res = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 1          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })
 
        this.metaAction.sf('data.loading', false) 
        if(res){
            let list = deepClone(res.llDetailDtoList || []) 
            let total = 0,
                gapList = [],
                selectMoneyChange = 0  
            const nextList = []
            const mainList = []
            for(let v of list){
                v.ybbalance = transToNum(v.ybbalance.toFixed(2))                        
                total = transToNum(total.toFixed(2)) + transToNum(v.ybbalance)
                for(const o of step3Data){
                    if(v.inventoryId==o.inventoryId){
                        v.numChange = o.numChange
                        v.ybbalanceChange = o.ybbalanceChange
                        const gap = transToNum(v.num) - transToNum(v.numChange)  // 待领料数量减去本次领料单的差
                        if(gap>=0){
                            v.inventoryGap = ''
                            v.zanguYbbalance = ''
                        }else{   // 有库存缺口的情况
                            v.inventoryGap = Math.abs( (transToNum(v.num) - transToNum(v.numChange)).toFixed(6) )  // 存货缺口
                            v.zanguYbbalance = Math.abs ( (transToNum(v.ybbalance) - transToNum(v.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            v.zanguPrice = Math.abs( (v.zanguYbbalance /v.inventoryGap).toFixed(6) )
                        }
                        selectMoneyChange = transToNum( (selectMoneyChange+ transToNum(v.ybbalanceChange)).toFixed(2) )
                    }
                }
                // 待领料金额大于0的数据
                if( transToNum(v.ybbalance)>0 ){  
                    mainList.push({...v})
                }

                // 有库存缺口的数据
                if( transToNum(v.inventoryGap) || transToNum(v.zanguYbbalance) ){
                    gapList.push({...v})
                }
                
                // 本次领料的数据
                if(transToNum(v.numChange) && transToNum(v.ybbalanceChange) ){
                    nextList.push({...v})
                }
            }

            const fList = this.formatList( mainList ) // 格式化数据
            let copyList = deepClone(fList)
            this.metaAction.sfs({
                'data.list': fromJS(fList),
                'data.nextList': fromJS(nextList),
                'data.copyList': fromJS(copyList),
                'data.selectMoneyChange': selectMoneyChange,
                'data.gapList': fromJS(gapList),
                'data.needToZangu': (gapList.length>0),
                'data.currentStep': 'step2', // 当前步骤
                'data.disabledNext': false,
                'data.billBodyYbBalance': total, // 本次领料金额（bom领料时是剩余领料金额）
            })
            return list
        }
    }

    // 取消勾选某一行
    deleteData=(id, selectedRowKeys, selectedRows)=>{
        let selectMoneyChange = this.metaAction.gf('data.selectMoneyChange') ||0
            selectMoneyChange = transToNum(selectMoneyChange)

        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let gapList = []
        let nextList = []
        for(const v of list){
            if(v.inventoryId==id){
                selectMoneyChange = transToNum( (selectMoneyChange- transToNum(v.ybbalanceChange)).toFixed(2) )
                v.numChange = ''
                v.ybbalanceChange = ''
                v.inventoryGap = ''
                v.zanguYbbalance = ''
            } 
            // 本次领料的数据
            if(transToNum(v.numChange) && transToNum(v.ybbalanceChange) ){
                nextList.push({...v})
            }
            // 有库存缺口的存货
            if(transToNum(v.inventoryGap) && transToNum(v.zanguYbbalance) ){
                gapList.push({...v})
            }
        }
        let copyList = this.genCopyList(list)
        this.metaAction.sfs({
            'data.list': fromJS(list),
            'data.gapList': fromJS(gapList),
            'data.nextList': fromJS(nextList),
            'data.copyList': fromJS(copyList),
            'data.needToZangu': (gapList.length>0),
            'data.selectedRowKeys': fromJS(selectedRowKeys),
            'data.selectMoneyChange': selectMoneyChange,
            'data.disabledNext': false,
            'data.scrollTop': this.tableRef.current.bodyRef.current.scrollTop
        })
    }

    /**
     * @description: 文本溢出隐藏
     * @param {object} item 当前行数据
     * @return {reactNode} 包含文本的div
    */ 
    addTextOverflow = (item)=>{
        if( item.dataIndex!==undefined ){
            item.title = <div style={{textAlign: 'center'}}> {item.title} </div>
            item.render = (text,record,index)=>
                (<div className="tdTextOverflow" title={text}> {text} </div>)
        }
        return item
    }

    // 渲染列
    renderColumns = (fields) =>{
        const currentStep = this.metaAction.gf('data.currentStep')
        let columns = fields
        if(currentStep==='step2'){  // 非BOM领料
            columns = fields.map(item=>{
                item.title = <div className="td-header-text" > {item.title} </div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{  
                        v = this.addTextOverflow(v) 
                        if(v.dataIndex==='numChange'){
                            v.title = <div className="td-header-text"> {v.title} </div>
                            v.render = (text,record,index)=>{
                                return <EdfInput.Number 
                                    className="picking-amount-input"  
                                    regex='^([0-9]+)(?:\.[0-9]{1,6})?$' 
                                    title={text} 
                                    value={text} 
                                    placeholder="请输入数量" 
                                    onChange={ (e) => this.handleNumberChange(e,record,index) } 
                                />          
                            }
                        }
                    })
                }
                item = this.addTextOverflow(item)
                return item
            })
        }else if(currentStep==='step3'){   //生成领料单
            columns = fields.map(item=>{
                item.title = <div className="td-header-text" > {item.title} </div>
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{
                        v = this.addTextOverflow(v)
                        if(v.dataIndex==='numChange'){
                            v.title = <div className="td-header-text" > {v.title} </div>
                            v.render = (text,record,index)=>{
                                return <InputWithTip
                                    className='picking-amount-input'
                                    format={'amount'}
                                    isError={record.numChangeError} 
                                    placeholder="请输入数量"
                                    defaultVal={text}
                                    errorTips={'本次领料数量不能大于待领料数量!'}
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

     /**
     * @description: (领料界面) 本次领料数量输入事件
     * @param {string} value 当前单元格文本
     * @param {object} record 当前行数据
     * @param {number} index 当前列字段
     * @return 无
     */ 
    handleNumberChange = (value,record, index) => {
        let gapList = [], 
            nextList= []
        let list = this.metaAction.gf('data.list') || []
        if(list.constructor !== Array){
            list = this.metaAction.gf('data.list').toJS()
        }

        value = transToNum(value)
        list.forEach((item, key) => {
            if (key == index) {
                item.numChange = value                  
                // 如果本次领料数量=待领料数量，那么本次领料金额=待领料金额
                if(formatNumbe(value)==formatNumbe(item.num)){
                    item.ybbalanceChange = transToNum(item.ybbalance)              // 本次领料金额=待领料数量  
                }else{
                    item.ybbalanceChange = value * transToNum(item.unitCost)      // 本次领料金额=领料数量 * 单价
                }
                // 要先格式化再处理后面的数据，否则会有精度的误差导致计算的金额出错
                item.numChange = item.numChange ? formatSixDecimal(item.numChange) : 0
                item.ybbalanceChange = item.ybbalanceChange = value ? formatNumbe(item.ybbalanceChange, 2) : ''

                if (value > transToNum(item.num)) {         // 如果输入的领料数量大于待领料数量，则计算库存缺口
                    item.inventoryGap = formatSixDecimal( transToNum(value) - transToNum(item.num))
                    item.zanguYbbalance = transToNum(item.ybbalanceChange) - transToNum(item.ybbalance)
                    item.zanguYbbalance = formatNumbe(item.zanguYbbalance, 2)
                    item.zanguPrice = Math.abs( ( transToNum(item.zanguYbbalance)/transToNum(item.inventoryGap) ).toFixed(6) )

                } else {
                    item.inventoryGap = ''
                    item.zanguYbbalance = ''
                    item.zanguPrice = ''
                }
            }

            // 暂估列表数据集合
            if(transToNum(item.inventoryGap) && transToNum(item.zanguYbbalance) ){
                gapList.push({...item})
            }

            // 本次领料的数据
            if(transToNum(item.numChange) && transToNum(item.ybbalanceChange) ){
                nextList.push({...item})
            }
        })
        let copyList = this.genCopyList(list)
        const params = {
            'data.needToZangu': (gapList.length>0),
            'data.nextList': fromJS(nextList),
            'data.gapList': fromJS(gapList),
            'data.list': fromJS(list),
            'data.copyList': fromJS(copyList)
        }
        timerCall(this, 'inpChangeTimer', this.metaAction.sfs, [params])
    }

     /**
     * @description: (生成领料单页面) 本次领料输入框输入事件
     * @param {string} value 当前单元格文本
     * @param {object} record 当前行数据
     * @param {string} field 当前列字段
     * @param {string} currentStep 当前步骤
     * @return 无
     */ 
    handleNumInput=(value, record, field, currentStep)=>{
        let val = value
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const index = list.findIndex(v=>v.inventoryId===record.inventoryId)
        const num  = transToNum(list[index]['num']) //待领料数量
        
        let originalData = this.metaAction.gf('data.step3_list') && this.metaAction.gf('data.step3_list').toJS() || [], 
            original = 0
        if(originalData.length>0){
            original = transToNum(originalData[index]['numChange'])   // 原本的本次领料数量
        }
        // 本次领料数量要小于待领料数量
        if(transToNum(val) <= num || original>num){  // original>num  // 如果原来的数量大于待领料数量
            list[index][`${field}Error`] = false
        }else{
            list[index][`${field}Error`] = true
        }

        list[index][field] = val
        const unitCost = transToNum(list[index]['unitCost'])  // 单价
        let ybbalanceChange = ''
        // 如果本次领料数量等于待领料数量，那么本次领料金额等于待领料金额，否则本次领料金额=本次领料数量*待领料单价
        if(val === num){  
            list[index]['ybbalanceChange'] = list[index]['ybbalance']
        }else{
            ybbalanceChange = unitCost * val  // 计算金额
            ybbalanceChange = ybbalanceChange ? utils.number.format(ybbalanceChange, 2) : ''
            list[index]['ybbalanceChange'] = ybbalanceChange
        }
        let copyList = this.genCopyList(list)
        this.metaAction.sfs({ 
            ['data.list']: fromJS(list), 
            'data.copyList': fromJS(copyList),
            'data.step3_list': fromJS(copyList)
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
                        item[v] = formatNumbe(item[v], 2)
                    }
                }
            }
            return item
        })
        return formatList
    }

   // 生成领料单
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
        // 生成入库时间
        let rkDate = getVoucherDate( this.time )
        if(codeNum && rkDate){
            const obj = {
                'serviceTypeCode': billType,
                'code': codeNum,  // 凭证编号
                'cdate': rkDate,  // 获取入库日期
                'operater': this.currentOrg.financeAuditor,  // 制单人
                'billBodyDtoList': billList, // 存货明细列表
                // 'type': 1
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
    switchStep = (step) => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        let { list=[], stepArray=[]} = data
        let numTotal= 0, moneyTotal= 0
        for(const item of list){
            moneyTotal = transToNum( (moneyTotal + transToNum(item.ybbalanceChange)).toFixed(2) )   // 页面所有存货的本次领料数量合计
            numTotal = transToNum( formatSixDecimal(numTotal + transToNum(item.numChange)) )        // 页面所有存货的本次领料金额合计
        }
        if(!numTotal || !moneyTotal && step==='next'){  
            this.metaAction.toast('error', '请输入数据')
            return
        }
        //下一步操作
        if(step==='prev' && this.currentFlag > 0){
            this.currentFlag --
        }else if(step==='next' && this.currentFlag < stepArray.length){
            this.currentFlag ++
        }
        const currentStep = stepArray[this.currentFlag]
        const disabledFlag = step==='prev' ? false : true
        const stepFn = step==='prev' ? 'getPrevData' : 'getNextData'
        this.metaAction.sfs({
            'data.disabledNext': disabledFlag,
            'data.inputKey': step + 'input'
        })
        this[stepFn](currentStep)   
    }

    /* 上一步 */ 
    getPrevData = async(currentStep)=> this.getLingliao()

    // 变成下一步，赋值
    getNextData= async(currentStep)=>{  
        const gapList = this.metaAction.gf('data.gapList') && this.metaAction.gf('data.gapList').toJS() || []
        const needToZangu = this.metaAction.gf('data.needToZangu')
        if(needToZangu){  // 如果需要暂估并且没有生成暂估入库单，那么就弹出询问框
            const ret = await this.metaAction.modal('confirm',{
                content: '选择的数据含有负库存，是否暂估?',
                okText: '暂估入库',
                cancelText: '取消',
            })

            // 进行暂估处理，弹出领料暂估页面
            if(ret==true){
                let zanguAll = gapList || []
                let rukuret
                if(zanguAll.length>0){  // 暂估入库单
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
                        zanguPrice = Math.abs(transToNum(zanguPrice))   // 暂估单价
                        if(!zanguPrice){  // 如果没有暂估单价，则通过 “暂估单价=暂估金额/暂估数量 ”这条公式来计算，暂估单价保留六位小数
                            zanguPrice = Math.abs(( (transToNum(zanguYbbalance)).toFixed(2) / transToNum(inventoryGap) ).toFixed(6))
                        }
                        return {
                            inventoryCode,
                            inventoryName,
                            inventoryUnit,
                            inventoryGuiGe,
                            'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null,
                            'num': Math.abs(transToNum(inventoryGap)) || 0, 
                            'price': zanguPrice,
                            'ybbalance': Math.abs(transToNum(zanguYbbalance).toFixed(2)) || 0,  // 暂估金额保留两位小数
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
                // 无论是否暂估，都跳到下一个页面
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
        this.metaAction.sfs({
            'data.list': fromJS([]),
            'data.loading': true,
            'data.currentStep': currentStep,
        })
        let nextList = this.metaAction.gf('data.nextList') && this.metaAction.gf('data.nextList').toJS() || []
        let newData = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 1          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })
       
        let table3 = deepClone(newData.llDetailDtoList)
        let finalTable = nextList.map(v=>{
            for(const o of table3){
                if(v.inventoryId==o.inventoryId){   // 取最新的本次领料和待领料单价的数值
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
        let copyList = deepClone(fl)
        this.metaAction.sfs({
            'data.loading': false,
            'data.list': fromJS(fl),
            'data.copyList': fromJS(copyList),
            'data.step3_list': fromJS( deepClone(finalTable) ),
        })
        return finalTable
    }

    onOk = async () => await this.save()

    // 保存，新增领料单
    save = async () => {  
        let zanguCode = 'none', 
            pickingCode,
            canSaveFlag = true
        const pickingAll = this.metaAction.gf('data.copyList') && this.metaAction.gf('data.copyList').toJS() || []

        if(pickingAll.length>0){
            const pickingBillList = []
            pickingAll.map(v=>{
                let {inventoryId, ybbalanceChange, unitCost, numChange } = v
            
                if(v.numChangeError){
                    canSaveFlag = false
                }
                if(transToNum(ybbalanceChange)>0){  // 过滤掉金额为0的存货
                    const item = {
                        'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null, 
                        'num': Math.abs(transToNum(numChange)) || 0, 
                        'price': Math.abs(transToNum(unitCost)) || 0,
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
                    this.metaAction.sf('data.loading', false)
                }else{
                    this.metaAction.toast('warning','所有存货领料金额小于等于0，不能保存！')
                    return
                }  
            }else{
                this.metaAction.toast('warning','本次领料数量不能大于待领料数量，请重新修改！')
                return
            }
        }
        
        this.onCancel({zanguCode, pickingCode})
        return {zanguCode, pickingCode}
    }

    // 合计行是否可见
    visible = ()=>{
        const currentStep = this.metaAction.gf('data.currentStep')
        const cls = (currentStep==="step2" || currentStep==="step3") && (currentStep.indexOf("zangu")<0) ? 'visible' : 'unVisible'
        return cls
    }

    onCancel = (ret) => { this.component.props.closeModal(ret) }
    

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

    /*组合筛选 输入框+存货类型*/
    filterList = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {form={},  copyList} = data
        const { filterType= '', inputVal='' } = form
        let allList = deepClone(copyList)
        allList = (inputVal&& inputVal.trim()) ? 
                allList.filter( v=>( v.inventoryName.indexOf(inputVal)>-1 || v.inventoryCode.indexOf(inputVal)>-1 ) ) 
                : allList
        let queryRet = (filterType && filterType.trim() && filterType!=='全部') ? allList.filter( v=>(v.inventoryClassName == filterType.trim()) ) : allList
        this.metaAction.sfs({
            ['data.list'] : fromJS(queryRet),
            ['data.form.showPopoverCard']: false
        })
    }

    popoverSelectorChange = (v) => 
        this.metaAction.sf('data.form.filterType', v)
    

    handlePopoverVisibleChange = (visible) =>  
        this.metaAction.sf('data.form.showPopoverCard', visible)
    

    /* 搜索下拉框的change事件 */
    filterCallBack = (e, event)=>{
        let val = e.target.value && e.target.value.trim() || ''
        this.searchFn(val)
    }

    /* 搜索下拉框的search事件 */
    handleSearch =(value)=>{
        const val = value && value.trim() || '' 
        this.searchFn(val)
    }

    searchFn =( val )=>{
        const current = this.metaAction.gf('data.currentStep')
        const list = this.metaAction.gf('data.copyList') && this.metaAction.gf('data.copyList').toJS() || []
        let allList = deepClone(list)
        allList = (val) ? allList.filter( v=>( v.inventoryName.indexOf(val)>-1 || v.inventoryCode.indexOf(val)>-1 ) ) : allList
        const params = {
            ['data.list'] : fromJS(allList),
            ['data.form.inputVal']: val
        }
        timerCall(this, 'filterSearchTimer', this.metaAction.sfs, [params])
    }

    /* 领料金额输入 */
    fieldChange = async (value) => {
        let orgids = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        this.value = value
        this.setMoneny(value)
        if (!orgids.length) {
            return this.metaAction.toast('error', '请勾选需要领料的存货')
        } else {
            this.metaAction.sf( 'data.form.includeSum', false )
            const valueTxt = value==='' && 0 || value
            timerCall(this, 'moneyTimer', this.dealWithData, [valueTxt])
        }   
    }

    /* 领料金额change事件 */
    setMoneny = (value) => {
        const val = (value||value==0) && formatSixDecimal(value) || ''
        this.metaAction.sf('data.form.money', val)
    }

    // 是否取整
    showOptionsChange = (key) => {
        this.metaAction.sf('data.form.includeSum', key)
        if (key == true) {
            timerCall(this, 'checkTimer', this.dealWithCheck)  // 防抖调用函数

        } else { 
            const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
            if(selectedRowKeys.length>0){
                timerCall(this, 'unCheckTimer', this.dealWithData)
            }  
        }
    }

    /* 数量取整 */
    dealWithCheck = () => {
        let  gapTotal = 0,
             gapList =[],
             nextList = []    
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        if(list.constructor !== Array){
            list=this.metaAction.gf('data.list').toJS()
        }
        list.forEach((item,index) => {
            // 对于勾选的存货进行数量取整
            if(selectedRowKeys.includes(item.inventoryId)){
                if(transToNum(item.numChange)>0){                       // 如果本次领料数量大于0
                    item.numChange = formatNumbe(item.numChange,0)      // 该存货本次领料数量取整
                    
                    if( formatNumbe(item.numChange) === formatNumbe(item.num) ){    // 如果该存货的本次领料数量等于待领料数量
                        item.ybbalanceChange = formatNumbe(formatNumbe(item.ybbalance),2) // 那么本次领料金额直接取待领料金额
                    
                    }else{
                        // 否则本次领料数量=取整后的本次领料数量 * 待领料单价，金额保留2位小数 
                        item.ybbalanceChange = formatNumbe(formatNumbe(item.numChange)*formatNumbe(item.unitCost),2)    
                    }
                      
                    if(formatNumbe(item.numChange)>formatNumbe(item.num)){  // 如果取整后，本次领料数量大于待领料数量，那么计算暂估数量和金额和单价
                        item.inventoryGap = formatSixDecimal(formatNumbe(item.numChange)-formatNumbe(item.num))
                        item.zanguYbbalance = formatNumbe(formatNumbe(item.ybbalanceChange)-formatNumbe(item.ybbalance),2)
                        item.zanguPrice = Math.abs( ( transToNum(item.zanguYbbalance)/transToNum(item.inventoryGap) ).toFixed(6) )
                        gapTotal = formatNumbe(formatNumbe(gapTotal)+formatNumbe(item.inventoryGap),2)     // 库存缺口数合计
                    
                    }else{  // 如果本次领料数量小于待领料数量，那么暂估数量和金额和单价为''
                        item.inventoryGap=''
                        item.zanguYbbalance=''
                        item.zanguPrice = ''
                    }
                }
            } 
           
            // 本次领料的存货
            if(transToNum(item.numChange) && transToNum(item.ybbalanceChange) ){
                nextList.push({...item})
            }
            // 有库存缺口的存货的集合
            if(transToNum(item.inventoryGap) && transToNum(item.zanguYbbalance) ){
                gapList.push({...item})
            }
            
        })
        let copyList = this.genCopyList(list)
        this.metaAction.sfs({
            'data.needToZangu': (gapList.length>0),
            'data.gapList': fromJS(gapList),
            'data.nextList': fromJS(nextList),
            'data.list': fromJS(list),
            'data.copyList': fromJS(copyList)
        })
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

    /* 页面调整时触发对表格宽度的计算 */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-inventory-picking-ling-main")
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

    /* 表格的列宽合计 */
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

    /* 渲染合计 */
    renderSummaryRow = (list, columnField, currentStep) => {
        let rowData = this.calTotal(list, columnField)
        if(currentStep==='step2'){rowData.unshift('')} 
        
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
                    const content = idx==0 ? '合计' : rowData[idx]
                    if(idx===(len-1)){
                        ownStyle['paddingRight'] = '20px'
                    }
                    return (<div style={{...ownStyle}} title={content}> { content } </div>)
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }
        return summaryRows
    }

    /* 渲染checkbox勾选框 */
    rowSelection = () => {
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys')
                && this.metaAction.gf('data.selectedRowKeys').toJS() || []
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
    /* checkbox勾选事件 */
    onSelectChange = (selectedRowKeys, selectRow, selected) => {
        const list = this.metaAction.gf('data.list').toJS()
        if(selectRow){  // 单选
            if(selected){
                this.metaAction.sfs({ 'data.selectedRowKeys': fromJS(selectedRowKeys) })
                this.dealWithData()  
            }else{
                const money = this.metaAction.gf('data.form.money') || 0            
                if(money){
                    this.metaAction.sfs({ ['data.selectedRowKeys'] : fromJS(selectedRowKeys) })
                    this.dealWithData('', selectRow.inventoryId ) 
                }else{
                    this.deleteData( selectRow.inventoryId, selectedRowKeys)
                } 
            }
        }else{  //全选
            this.metaAction.sfs({ ['data.selectedRowKeys'] : fromJS(selectedRowKeys)}) 
            if(selectedRowKeys.length!=0){     
                timerCall(this, 'selectAllTimer', this.selectAllFn)  
                
            }else{
                timerCall(this, 'cancelAllTimer', this.cancelAllFn)
            }    
        }   
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { list=[], currentStep, tableOption={}, form={} } = data 
        const scrollTop = this.metaAction.gf('data.scrollTop')
        const fields = currentStep=='step2' ? this.step2Field : this.step3Field 
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
                                value={form.filterType} 
                                style={{width: '170px'}}
                                onChange={this.popoverSelectorChange} 
                                getPopupContainer={trigger => trigger.parentNode}>
                                    {   form.propertyDetailFilter && 
                                        Object.prototype.toString.call(form.propertyDetailFilter)==='[object Array]' && 
                                        form.propertyDetailFilter.map(el => (
                                            <Select.Option value={el.name}> {el.name} </Select.Option>
                                        ))
                                    }
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='noBom-filter-footer'>
                    <Button type='primary' 
                        onClick={this.filterList}>
                        查询
                    </Button>
                    <Button className='reset-btn' 
                        onClick={this.resetForm}>
                        重置
                    </Button>
                </div>
            </div>
        )
        
        return (
            <React.Fragment>
                <div className='ttk-stock-app-inventory-picking-ling-div mk-layout'>
                    {data.loading && <div className='ttk-stock-app-spin'>
                        { stockLoading() }
                    </div>
                    }
                    <div className={ "ttk-stock-app-inventory-picking-ling-title "+ data.currentStep}/>
                    <div className='ttk-stock-app-inventory-picking-ling-sub'>
                        <div className='sub-component' > 
                            <span>
                                <EdfInput.Search 
                                    key={data.inputKey}
                                    className='ttk-stock-app-inventory-picking-ling-sub-search'
                                    placeholder='请输入存货名称或存货编码' 
                                    onChange={ (v)=>{this.filterCallBack(v)} }
                                    onSearch={ (v, event)=>{this.handleSearch(v, event)}}
                                />
                                <Popover placement="bottom" 
                                    content={popoverContent} 
                                    trigger="click"
                                    visible={form.showPopoverCard}
                                    onVisibleChange={this.handlePopoverVisibleChange}>
                                    <i className="noBom-filter-icon">
                                        <Icon type='filter'/>
                                    </i>
                                </Popover>
                            </span> 

                        </div>
                        {
                            data.currentStep==="step2" &&
                            <span className='noBom-picking-money'>
                                <span>领料金额：</span>
                                <EdfInput.Number 
                                    className="noBom-picking-money-input"  
                                    regex='^([0-9]+)(?:\.[0-9]{1,2})?$' 
                                    title={form.money} 
                                    value={form.money} 
                                    placeholder="请输入领料金额" 
                                    onChange={ (e) => this.fieldChange(e) } 
                                />     
                                <Checkbox 
                                    className='noBom-picking-money-checkbox'
                                    checked={form.includeSum} 
                                    onChange={(e)=> this.showOptionsChange(e.target.checked)}>
                                        数量取整
                                </Checkbox>
                            </span>   
                        }
                          
                    </div>
                    <div className={`ttk-stock-app-inventory-picking-ling-main mk-layout`}>
                        {
                            data.currentStep!=="step2" ? 
                                <div className={`${currentStep}-table`}>
                                    <VirtualTable
                                        ref={this.tableRef2}
                                        columns={this.renderColumns(fields)}
                                        dataSource={list}
                                        key='step3Table'
                                        rowKey="inventoryId"
                                        scrollTop={scrollTop}
                                        style={{ width: `${tableOption.x}px` }}
                                        scroll={{ y: tableOption.y, x: tableOption.x+2}}
                                        summaryRows={this.renderSummaryRow(list, fields, currentStep)}
                                        bordered
                                        height={1000}
                                        width={tableOption.x+10}
                                        headerHeight={78}
                                        allowResizeColumn
                                    />
                                </div>
                                :
                                <div className={`${currentStep}-table`}>
                                    <VirtualTable
                                        ref={this.tableRef}
                                        columns={this.renderColumns(fields)}
                                        rowSelection={this.rowSelection()}
                                        dataSource={list}
                                        key='step2Table'
                                        rowKey="inventoryId"
                                        scrollTop={scrollTop}
                                        style={{ width: `${tableOption.x}px` }}
                                        scroll={{ y: tableOption.y, x: tableOption.x+2}}
                                        summaryRows={this.renderSummaryRow(list, fields, currentStep)}
                                        bordered
                                        height={1000}
                                        width={tableOption.x+10}
                                        headerHeight={78}
                                        allowResizeColumn
                                    ></VirtualTable>
                                </div>
                                
                                
                        }
                    </div>
                </div>
                <div className='ttk-stock-app-inventory-picking-ling-footer-btn'>
                    <div className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup'>
                        {
                            data.currentStep==="step3" ? 
                            <EdfButton  type='primary' 
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                onClick={(e)=>this.save('save')}>
                                保存
                            </EdfButton> :
                            <EdfButton  type='primary' 
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                onClick={(e)=>this.switchStep('next')} 
                                disabled={data.disabledNext}>
                                    下一步
                            </EdfButton>
                        }
                        {
                            ( data.currentStep=="step3") &&
                            <EdfButton type='default' 
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                onClick={(e)=>this.switchStep('prev')}>
                                    上一步
                            </EdfButton>
                        }
                        <EdfButton 
                            className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item btn-cancel'
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

