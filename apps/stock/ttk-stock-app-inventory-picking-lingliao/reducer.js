import { Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import {transToNum, formatSixDecimal} from '../commonAssets/js/common'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }

    updateSfs = (state,option)=>{
        return this.metaReducer.sfs(state, option)
    }

    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }

    fieldChange = (state, value) => {
        let numberChange = 0
        let moneryChange = 0
        if (!value) {
            value = this.metaReducer.gf(state, 'data.form.monery') || 0           // 输入框输入的金额
        }
        let list = this.metaReducer.gf(state, 'data.list')
        if (list.constructor !== Array) {
            list = this.metaReducer.gf(state, 'data.list').toJS()
        }
        let orgids = this.metaReducer.gf(state, 'data.selectedRowKeys').toJS()    // 选中的行
        if (orgids.length == 0) {
            list.forEach((item) => {
                item.moneryChange = ''
                item.kucunnumber = ''
                item.kucunmonery = ''
                item.numberChange = ''
            })
            
            state = this.metaReducer.sfs(state, {
                'data.form.moneryChange': 0,    // 金额合计数
                'data.form.numberChange': 0,    // 数量合计数
                'data.list': fromJS(list),
            })
            return state
        }
        let num = 0  // 整数所选待领料金额汇总
        let num2 = 0 // 小数所选待领料金额汇总
        let key = []
        orgids.forEach((data) => {
            list.forEach((item) => {
                if (item.inventoryId == data) {
                    if (item.calculationType != 3000180001) {
                        num2 = num2 + transToNum(Math.abs(item.ybbalance))
                        key.push(data)
                    } else {
                        num = num + transToNum(Math.abs(item.ybbalance))                       
                    }
                }
                item.moneryChange = ''
                item.kucunnumber = ''
                item.kucunmonery = ''
                item.numberChange = ''
            })
        })
        let numn = 0  // 整数单位所选本次领料金额汇总
        let numn2 = 0  // 非整数单位所选本次领料金额汇总
        orgids.forEach((data) => {
            list.forEach((item) => {
                if (item.inventoryId == data) {
                    if (item.calculationType == 3000180001) {
                        item.moneryChange = transToNum(transToNum(item.ybbalance) / (transToNum(num) + transToNum(num2)) * transToNum(value), 2)
                        item.numberChange = transToNum(item.moneryChange) / transToNum(item.price)
                        item.numberChange = removeZero(transToNum(Math.round(item.numberChange), 6))
                        item.moneryChange = removeZero(transToNum(transToNum(item.numberChange) * transToNum(item.price), 2))
                        numn = transToNum(transToNum(numn) + transToNum(item.moneryChange))
                        if (transToNum(item.numberChange) > transToNum(item.num)) {
                            item.kucunnumber = removeZero(transToNum(transToNum(item.numberChange) - transToNum(item.num), 6))
                            item.kucunmonery = removeZero(transToNum(transToNum(item.kucunnumber) * transToNum(item.price), 2))
                        } else {
                            item.kucunnumber = ''
                            item.kucunmonery = ''
                        }
                    }
                }
            })
        })
        orgids.forEach((data) => {
            list.forEach((item) => {
                if (item.inventoryId == data) {
                    if (item.calculationType == 3000180002) {
                        if (key[key.length - 1] == data) {
                            item.moneryChange = removeZero(transToNum(transToNum(value) - transToNum(numn) - transToNum(numn2), 2))
                            item.numberChange = removeZero(transToNum(transToNum(item.moneryChange) / transToNum(item.price), 6))
                        } else {
                            item.moneryChange = removeZero(transToNum((transToNum(value) - transToNum(numn)) * (transToNum(item.ybbalance) / transToNum(num2)), 2))
                            item.numberChange = removeZero(transToNum(transToNum(item.moneryChange) / transToNum(item.price), 6))
                            numn2 = transToNum(transToNum(item.moneryChange) + transToNum(numn2))
                        }
                    }
                    if (transToNum(item.numberChange) > transToNum(item.num)) {
                        item.kucunnumber = removeZero(transToNum(transToNum(item.numberChange) - transToNum(item.num), 6))
                        item.kucunmonery = removeZero(transToNum(transToNum(item.kucunnumber) * transToNum(item.price), 2))
                        // kucunmonery = transToNum(transToNum(kucunmonery)+transToNum(item.kucunmonery),2)
                    } else {
                        item.kucunnumber = ''
                        item.kucunmonery = ''
                    }
                }
            })
        })
        list.forEach((item) => {
            moneryChange = transToNum(transToNum(moneryChange) + transToNum(item.moneryChange), 2)
            numberChange = transToNum(transToNum(numberChange) + transToNum(item.numberChange), 6)
        })

        state = this.metaReducer.sfs(state, {
            'data.form.moneryChange': removeZero(moneryChange),
            'data.form.numberChange': removeZero(numberChange),
            'data.list': fromJS(list),
        })
        return state
    }

    showOptionsChange = (state) => {
        let kucunmonery=0
        let moneryChange=0
        let numberChange=0
        let list = this.metaReducer.gf(state, 'data.list')
        if(list.constructor !== Array){
            list=this.metaReducer.gf(state, 'data.list').toJS()
        }
        list.forEach((item,index) => {
            if(transToNum(item.numberChange)>0){
                item.numberChange=transToNum(item.numberChange,0)
                item.moneryChange=transToNum(transToNum(item.numberChange)*transToNum(item.price),2)
                if(transToNum(item.numberChange)>transToNum(item.num)){
                    item.kucunnumber=transToNum(transToNum(item.numberChange)-transToNum(item.num),6)
                    item.kucunmonery=transToNum(transToNum(item.kucunnumber)*transToNum(item.price),2)
                    kucunmonery=transToNum(transToNum(kucunmonery)+transToNum(item.kucunmonery),2)
                }else{
                    item.kucunnumber=''
                    item.kucunmonery=''
                }
            }
        })
        moneryChange=0
        numberChange=0
        list.forEach((item) => {
            moneryChange=transToNum(transToNum(moneryChange)+transToNum(item.moneryChange),2)
            numberChange=transToNum(transToNum(numberChange)+transToNum(item.numberChange),6)
        })

        state = this.metaReducer.sfs(state, {
            'data.form.moneryChange': transToNum(moneryChange,2),
            'data.form.numberChange': transToNum(numberChange,6),
            'data.list': fromJS(list),
        })
        return state
    }


     // 获取领料的数据
     getLinglao = async(money)=>{
        this.metaAction.sf('data.loading', true)
        const propertyReq = this.webapi.stock.findInventoryEnumList() || []    // 领料存货类型列表
        let res = await this.webapi.stock.queryDllInventoryInfo({
            "period": this.time, 
            "llType": 1          //-- 领料类型，1：新增领料；2：非BOM快速领料（必填）
        })
        this.metaAction.sf('data.loading', false)
        if(res){
            let list = deepClone(res.llDetailDtoList || []) 
            let total = 0
            list = list.filter(item=>{
                item.zanguPrice = item.unitCost || 0                                                //暂估单价的取数规则
                item.ybbalance = transToNum(item.ybbalance.toFixed(2))                              // 金额保留两位小数 
                total = transToNum(total.toFixed(2)) + transToNum(item.ybbalance)
                return transToNum(item.ybbalance)>0                                                 // 过滤待领料金额<=0的数据
            })
            this.step2_list = list

            let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
            let numTotal = 0,         // 实际领料数量合计
                moneyTotal = 0,       // 实际领料金额合计
                gapList = [],         // 有库存缺口的存货列表
                zhengTotal = 0,       // 整数单位应领料合计数
                decimalTotal = 0,     // 小数单位应领料合计数
                ybbalanceTotal = 0,   // 待领料金额合计数
                selectedRows = []     // 勾选的存货列表
                const decimalItems = []   // 小数单位的存货列表
        
            if (!money) {     // 输入
                money = this.metaAction.gf('data.form.monery') || 0     // 输入框中的领料金额
            }
            if (selectedRowKeys.length == 0) {                  // 没有勾选的话不赋值
                list.forEach((item) => {
                    item.ybbalance = transToNum(item.ybbalance)    // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
                    item.numChange = ''
                    item.ybbalanceChange = ''
                    item.inventoryGap = ''
                    item.zanguYbbalance = ''
                })
            
                this.metaAction.sfs({
                    'data.list': fromJS(list),
                    'data.actualTotalNum': formatSixDecimal(numTotal),
                    'data.actualTotalCash': utils.number.format(moneyTotal, 2),
                })
            }

            list = list.map(item=>{
                item.ybbalance = transToNum(item.ybbalance)     // 要在此处把待领料金额转成数字格式，否则格式化的时候会出错
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    selectedRows.push(item)
                    if(item.calculationType=='3000180001'){  // 整数单位标志代码  
                        zhengTotal = parseFloat( zhengTotal.toFixed(2) ) + transToNum(item.ybbalance)        // 已勾选整数单位存货 待领料数量合计
                    }else{
                        decimalItems.push(item)
                        decimalTotal =  parseFloat( decimalTotal.toFixed(2) ) + transToNum(item.ybbalance)  // 已勾选小数单位存货 待领料金额的总和
                    }
                }
                item.numChange = ''
                item.priceChange = ''
                item.ybbalanceChange = ''
                item.inventoryGap = ''
                item.zanguYbbalance = ''
                return item
            })
            ybbalanceTotal = parseFloat( (zhengTotal + decimalTotal).toFixed(2) ) // 勾选存货的待领料金额合计数

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
                        // numTotal = parseFloat(numTotal.toFixed(6)) + roundNumber     // 实际领料数量合计
                        // moneyTotal = transToNum( moneyTotal ) + currentMoney         // 实际领料金额合计
                        const gap = transToNum(item.num) - roundNumber.toFixed(6)              // 每个存货本次领料后余额
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''

                        }else{
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                            // item.ybbalance = transToNum(item.ybbalance)  //待领料金额（这里要转化成Number类型，否则格式化的时候会变成NaN）
                            gapList.push({...item})  //库存缺口列表
                        }
                    }   
                }
                return item
            })

            // 最后一个存货的索引
            let lastDecIndex = list.length - 1
            deciActual = transToNum(money) - zhengActual
            // 小数单位计算数量
            list = list.map((item, index)=>{
                if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                    if(item.calculationType != '3000180001'){  // 非整数单位        
                        item.ybbalanceChange = ( transToNum(transToNum(item.ybbalance)/decimalTotal ) * deciActual).toFixed(2)  // 小数单位本次领料
                        item.ybbalanceChange = transToNum(item.ybbalanceChange)
                        item.priceChange = transToNum(item.unitCost)    // 成本单价
                        item.numChange = transToNum( ( transToNum(item.ybbalanceChange)/item.priceChange ).toFixed(6) )
                        numTotal += transToNum(item.numChange)   //实际本次领料
                        moneyTotal += transToNum(item.ybbalanceChange)  //实际本次金额
                        
                        const gap = transToNum(item.num) - item.numChange  // 待领料数量减去本次领料单的差
                        if(gap>=0){
                            item.inventoryGap = ''
                            item.zanguYbbalance = ''
                        }else{   // 有库存缺口的情况
                            item.inventoryGap = Math.abs( (transToNum(item.num) - transToNum(item.numChange)).toFixed(6) )  // 存货缺口
                            item.zanguYbbalance = Math.abs ( (transToNum(item.ybbalance) - transToNum(item.ybbalanceChange)).toFixed(2) )  // 每条存货的暂估金额
                            item.zanguPrice = Math.abs((item.zanguYbbalance/item.inventoryGap).toFixed(6))
                            // item.ybbalance = transToNum(item.ybbalance)  // 转换成Number类型，否在在格式化的时候可能会出错
                            gapList.push({...item})  //库存缺口列表
                        }

                        // 找到最后一个小数单位的存货的索引
                        if(item.inventoryId == decimalItems[decimalItems.length-1]['inventoryId']){
                            lastDecIndex = index
                        }
                    }
                    this.step2_selectedList = selectedRows.slice(0) // 非BOM领料实际选中的存货
                }
                return item
            })

            // 计算多出来的金额倒挤到最后一条存货
            if(selectedRowKeys.length>0){
                const rest = transToNum(money) - transToNum(moneyTotal)
                moneyTotal = transToNum(moneyTotal) + rest 
                list[lastDecIndex]['ybbalanceChange'] = transToNum( list[lastDecIndex]['ybbalanceChange'] ) + rest
            }

            this.step2_list = list.slice(0)
            this.step2_zangu_list = gapList.length>0 ? gapList.slice(0) : []
            // this.step2_needToZangu = (gapList.length > 0)
        
            const fList = this.formatList( list ) // 格式化数据
            const propertyDetailFilter = await propertyReq
            this.metaAction.sfs({
                'data.total': total, 
                'data.list': fromJS(fList),
                'data.gapList': fromJS(gapList),
                'data.step2_zangu_data': fromJS(gapList.slice(0)),
                'data.needToZangu': (gapList.length>0),
                'data.currentStep': 'step2', // 当前步骤
                'data.billBodyYbBalance': total, // 本次领料金额（bom领料时是剩余领料金额）
                'data.selectedRowKeys': fromJS(selectedRowKeys),
                'data.form.propertyDetailFilter': propertyDetailFilter,
                // 'data.actualTotalNum' : 0,  //实际领料总数量
                // 'data.actualTotalCash': 0,  //实际领料总金额
            })
            return list
        }else{
            this.metaAction.sfs({ 'data.disabledNext': true })
        }  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}