import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { Table, Button , Menu, Dropdown, Icon, Layout} from 'edf-component'
import { fromJS, toJS } from 'immutable'
import { tableColumns } from './staticField'
import InputWithTip from '../components/InputWithTip'
import StockBlockSubjectMatch from '../components/StockBlockSubjectMatch'
import StockAppDistributionCost from '../components/StockAppCarryoverProductionCost/StockAppDistributionCostSales'
import Distribution from '../components/StockAppCarryoverProductionCost/Distribution'
import { 
    getInfo, 
    HelpIcon, 
    transToNum, 
    deepClone, 
    stockLoading, 
    getClientSize, 
    addEvent, 
    removeEvent,
    canClickTarget
} from '../commonAssets/js/common'

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

    onInit = async({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.props = this.component.props
        this.params = this.component.props.params || {}
        injections.reduce('init')
        const result = await this.detectMatch()
        if(result){
            this.load()
        }
    }
    
    componentDidMount=()=>{
        addEvent(window, 'resize', calClientSize)
    }

    componentWillUnmount=()=>{
        removeEvent(window, 'resize', calClientSize)
    }

    stockLoading=()=> stockLoading()
    

    // 是否已经结账/结转生产成本/结转主营成本
    isUnEditable = ()=>{
        const invSetInfo = this.metaAction.gf('data.invSetInfo') && this.metaAction.gf('data.invSetInfo').toJS() || {}
        const { isCarryOverMainCost, isCarryOverProductCost, isGenVoucher } = invSetInfo
        return (isCarryOverMainCost || isCarryOverProductCost || isGenVoucher)
    }

    detectMatch = async()=>{
        this.metaAction.sf('data.loading', true)
        const settingReq = this.webapi.stock.queryAcctCodeByModule({"module": 2})
        const subjectConfig = await settingReq
        this.metaAction.sf('data.loading', false)
        let ret, flag = subjectConfig.some((item)=>!item.destAcctId)
        // 科目设置
        if(
            flag
            && subjectConfig 
            && Object.prototype.toString.call(subjectConfig)==='[object Array]'
        ){  // 未设置科目匹配时
            ret = await this.subSetting(subjectConfig)
        }else if(
            ! subjectConfig 
            || Object.prototype.toString.call(subjectConfig)!=='[object Array]'
        ){
            console.log('生产成本分配页面，科目设置返回出错')
        }else{ return true }

        if(ret===true || ret===false){
            return true
        }
    }

    getPeriod =()=>{
        let time = ''
        const { name, periodDate } = this.metaAction.context.get('currentOrg')
        const sessionTime = sessionStorage['stockPeriod'+ name]
        if (sessionTime != "undefined" && sessionTime) {
            time = sessionTime
        } else {
            const currentTime = periodDate
            sessionStorage['stockPeriod' + name] = currentTime
            time = currentTime
        }
        return time
    }

    /*
        加载页面
        params:
        @update: 是否是点击更新数据按钮
    */ 
    load = async(update) => { 
        const time = this.getPeriod() 
        const method = update === 'update' ? 'getUpdateProductShareList' : 'getProductShareList'
        this.metaAction.sf('data.loading', true)
        const stockListReq = this.webapi.stock[method]({'period': time || ''}) || [],
              markReq = this.webapi.stock.findInveSetByPeriod({'period': (time || this.params.period ||'')})
        const invSetInfoReq = getInfo({ 'period': (time || this.params.period ||'')})
        let res = await stockListReq
        let mark = await markReq
       
        this.metaAction.sf('data.loading', false)
        
        if (mark) this.isManualAllocation = mark.automaticDistributionMark === 0 ? true : false   // 手工录入的情况 
        if (res) {
            const isVoucher = res.isVoucher  // 是否已结账
            const respList = res.productShareDtoList  // 成本分配表数据
            const totalSales = utils.number.format(res.totalSales,2)   // 本期收入
            let carryOverCost = parseFloat(res.carryOverCost) ? utils.number.format(res.carryOverCost, 2) : '0.00'   // 本期结转金额合计
            let list = deepClone(respList) || [], 
                materialCurrentCost = 0
            this.copyList = respList && respList.length !== 0 ? deepClone(respList) : []
           
            if (!this.isManualAllocation) { // 生产成本核算为自动分配
                // 已经生成生产成本分配表
                if(this.params.isProductShare && update !== 'update' ){
                    let costSum = 0
                    list = list.map(v => {
                        v.lastAmount = transToNum(v.lastAmount) ? utils.number.format(v.lastAmount, 2) : '0.00'                 //上期结余
                        v.currentAmount = transToNum(v.currentAmount) ?  utils.number.format(v.currentAmount, 2) : '0.00'       // 本期发生
                        v.currentCost = transToNum(v.currentCost) ?  utils.number.format(v.currentCost, 2) : '0.00'             // 本期结转
                        v.currentBalance = transToNum(v.currentBalance) ?  utils.number.format(v.currentBalance, 2) : '0.00'    // 本期结余数
                        costSum = (transToNum(v.currentCost) + transToNum(costSum)).toFixed(2)  // 统计本期结转
                        return v
                    })
                    carryOverCost = utils.number.format(costSum, 2)
                    if(transToNum(res.carryOverCost) != costSum ){
                        console.log(`生产成本分配表（以销定产），已生成分配表，但本期结转金额合计${costSum}与接口返回金额${res.carryOverCost}不等，请查看！`)
                    }

                }else{ // 更新数据或者没有生成生产成本分配表

                    list = list.map(v => {
                        // 上期结余和本期发生
                        v.lastAmount = parseFloat(v.lastAmount) ? utils.number.format(v.lastAmount, 2) : '0.00'  //上期结余
                        v.currentAmount = parseFloat(v.currentAmount) ?  utils.number.format(v.currentAmount, 2) : '0.00'  // 本期发生
                        // 非”直接材料“的本期结转数
                        if (v.code !== 'materialCostAccount') {
                            const lastVal = transToNum(v.lastAmount) + transToNum(v.currentAmount)   // 上期结余+本期发生之和
                            v.currentCost = lastVal ? utils.number.format(lastVal, 2)  : '0.00'      // 默认（上期结余和本期发生之和）全部结转
                            materialCurrentCost += transToNum(v.currentCost)  // 非直接材料本期发生金额累计
                            const balance = transToNum(v.lastAmount) + transToNum(v.currentAmount) - transToNum(v.currentCost)
                            v.currentBalance = utils.number.format(balance, 2)      
                        } 
                        return v
                    })

                    // “直接材料” 本期发生 和 本期结余
                    const index = list.findIndex(v=>v.code==='materialCostAccount')
                    const rest = res.carryOverCost - materialCurrentCost                                                              // 直接材料本期发生
                    const val = (transToNum(list[index]['lastAmount']) + transToNum(list[index]['currentAmount']) - rest).toFixed(2)  // 直接材料的本期结余
                    list[index]['currentCost'] = utils.number.format(rest, 2)
                    list[index]['currentBalance'] = utils.number.format(transToNum(val), 2)
                }   
                
            } else {
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? utils.number.format(v.lastAmount, 2) : '0.00'
                    v.currentAmount = parseFloat(v.currentAmount) ? utils.number.format(v.currentAmount, 2) : '0.00'
                    v.currentCost = parseFloat(v.currentCost) ? utils.number.format(v.currentCost, 2) : '0.00'
                    v.currentBalance = parseFloat(v.currentBalance) ? utils.number.format(v.currentBalance, 2) : '0.00'
                    return v
                })
            }
            let invSetInfo = await invSetInfoReq
            this.injections.reduce('updateSfs', {
                ['data.totalSales']: totalSales,
                ['data.list']: fromJS(list),
                ['data.others.month']: time,
                ['data.others.isVoucher']: isVoucher,
                ['data.carryOverCost']: carryOverCost,
                ['data.invSetInfo']: fromJS(invSetInfo),
                ['data.isProductShare']: this.params.isProductShare,
                ['data.isCarryOverProductCost']: this.params.isCarryOverProductCost,
            })
        } else {
            this.metaAction.toast('error', res)
        }
    }


    /*
     * @description: 计算表格的每一列的底部合计数
     * @param {array} data 整个表格的数据
     * @return {object} {lastAmountTotal--上期结余合计 ，currentAmountTotal--本期发生合计，
     *                  currentCostTotal--本期结转合计，currentBalanceTotal--本期结余合计}
    */ 
    calTotal = ()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const {list=[], carryOverCost=0} = data
        let lastAmountTotal = this.sum(list,'lastAmount') ,                                         // 本期结余金额合计
            currentAmountTotal = this.sum(list,'currentAmount'),                                    // 本期发生金额合计
            currentCostTotal = transToNum(carryOverCost),                                            // 本期结转金额合计
            currentBalanceTotal = lastAmountTotal + currentAmountTotal - currentCostTotal           // 本期结余金额合计

        // 格式化处理
        lastAmountTotal = utils.number.format(lastAmountTotal,2)
        currentAmountTotal = utils.number.format(currentAmountTotal,2)
        currentCostTotal = utils.number.format(parseFloat(currentCostTotal),2)
        currentBalanceTotal = utils.number.format(currentBalanceTotal,2)
        return { lastAmountTotal, currentAmountTotal, currentCostTotal, currentBalanceTotal }
    }
   

    moreActionOpeate = (e) => 
        this[e.key] && this[e.key]()
    

    // 科目设置
    subSetting= async(subjectConfig)=>{
        let configList = subjectConfig ? subjectConfig : await this.webapi.stock.queryAcctCodeByModule({"module": 2})

        if(configList && Object.prototype.toString.call(configList)==='[object Array]' ){
            const ret = await this.metaAction.modal('show',{
                title: `科目设置`,
                okText: '确定', 
                cancelText: '取消',
                width: 900,
                height: 400,
                bodyStyle: {
                    padding: '20px 20px 15px'
                },
                children: (
                    <StockBlockSubjectMatch
                        metaAction={ this.metaAction }
                        webapi = { this.webapi }
                        store={ this.props.store }
                        component={ this.component }
                        subjectMatches={ configList }
                    />
                )
            })
            if(ret){
                console.log(ret,'9999')
                this.load()
            }
            return ret
        }
    }

    closeBom = ()=>{
        this.closeTip()
        clearTimeout(this.closeBomTimer)
        this.closeBomTimer = setTimeout(()=>{
            this.load()
        },100)
    }

    // 删除
    deleteBill = async () => {
        const ret = await this.metaAction.modal('confirm', {
            content: '确定删成本分配表？'
        })
        if (!ret) { return }
        let isDel = await this.webapi.stock.cancelProductShare({'period': this.params.period || ''})
        if(isDel == null) { 
            this.metaAction.toast('success', '删除成功！') 
            setTimeout(()=>{
                this.component.props.onlyCloseContent 
                    && this.component.props.onlyCloseContent('ttk-stock-app-distribution-production-cost-sales')
                this.component.props.setPortalContent 
                    && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
            }, 1000)
        }
    }

    /*更多的按钮，包含 科目设置 与 删除*/
    renderMoreBtns=()=>{
        const {Item} = Menu
        const btnList =[{
            title: '科目设置',
            keyVal: 'subSetting',
            cName: 'btn-subSetting'
        },{
            title: '删除',
            keyVal: 'deleteBill',
            cName: 'btn-delete',
            disabled: this.isUnEditable()
        }]
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const moreMenu = (
            <Menu name='menu' onClick={this.moreActionOpeate}> 
            {   btnList.map(v=>{
                    const {keyVal, title, cName, disabled=false} = v
                    return (
                        <Item name={ keyVal } key={ keyVal }
                            className={ cName }
                            disabled={disabled}>
                            <span>{ title }</span>
                        </Item>
                    )
                })
            }
            </Menu>
        )

        return (
            <Dropdown 
                name='moreBtns' 
                trigger={['click']}
                overlay={moreMenu}
            >
                <Button className='distribution-header-more' name='internal'>
                    <span name='word'> 更多 </span>
                    <Icon name='more' type='down'></Icon>
                </Button>
            </Dropdown>
        )
    }

    // 列渲染
    renderColumns = () => {
        let columns = tableColumns.concat()
        const isUnEditable = this.isUnEditable()
        columns = columns.map(v => {
            if (v.dataIndex === 'lastAmount') { // 上期结余
                v.render = (text, record, index) => {
                    if (!isUnEditable) {  //去掉初始月份的校验
                        return  <div>
                            <InputWithTip format={'cash'} defaultVal={text}
                                notNegative={transToNum(text) < 0 ? true : false}
                                inputEvent={(value)=>{this.handleInput(value, index, v.dataIndex)}} 
                                blurEvent={(value)=>{this.handleBlur(value, index,  v.dataIndex, 2)}}  />
                        </div>
                    } else {
                        return <div className="textStyle">{text}</div>
                    }
                }
            } else if (v.dataIndex === 'currentCost') { // 本期结转
                if (!this.isManualAllocation) {
                    v.render = (text, record, index) => {
                        if (!isUnEditable) {
                            if (record.code !== 'materialCostAccount') {
                                return <div>
                                    <InputWithTip 
                                        format={'cash'}
                                        defaultVal={text}
                                        notNegative={transToNum(text) < 0 ? true : false}
                                        inputEvent={(value)=>{this.handleInput(value, index, v.dataIndex)}} 
                                        blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}  />
                                </div>
                            } else {
                                const err = transToNum(text) < 0 ? true : false
                                return  (
                                    err ? ( <div className="textStyle material-txt"> {text} </div> )  : <div className="textStyle">{text}</div> 
                                )
                            }

                        } else {
                            return <div className="textStyle">{text}</div>
                        }
                    }
                } else {
                    v.render = (text, record, index) => {
                        if (!isUnEditable) {
                            return <div>
                                <InputWithTip 
                                    format={'cash'}
                                    defaultVal={text} 
                                    notNegative={transToNum(text) < 0 ? true : false}
                                    inputEvent={(value)=>{this.handleInput(value, index, v.dataIndex)}} 
                                    blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}/>
                            </div>
                        } else {
                            return <div className="textStyle">{text}</div>
                        }
                    }
                }
            } else if (v.dataIndex === 'currentBalance') {  // 本期结余
                if (!this.isManualAllocation) { 
                    v.render = (text, record, index) => {
                        const flag = transToNum(text) >= 0 ? true : false
                        return ( 
                            <div 
                                className="textStyle"
                                style={{'color': (flag ? '#333':'red') }} >
                                {text}
                            </div>
                        )
                    }
                } else {
                    v.render = (text, record, index) => {
                        if (!isUnEditable) {
                            return <div>
                                <InputWithTip 
                                    format={'cash'}
                                    defaultVal={text}
                                    notNegative={transToNum(text) < 0 ? true : false}
                                    inputEvent={(value)=>{this.handleInput(value,index, v.dataIndex)}} 
                                    blurEvent={(value)=>{this.handleBlur(value,index, v.dataIndex, 2)}}/>
                            </div>
                        } else {
                            return <div className="textStyle">{text}</div>
                        }
                    }
                }
            }else if(v.dataIndex === 'currentAmount'){
                const help = this.renderHelp()
                v.title = <div>
                            <span>本期发生</span>
                            {help}
                        </div>
                v.render =  v.render = (text, record, index) => {
                    if (!isUnEditable) {
                        return <div>
                            <InputWithTip 
                                format={'cash'}
                                defaultVal={text}
                                notNegative={transToNum(text) < 0 ? true : false}
                                inputEvent={(value)=>{this.handleInput(value, index, v.dataIndex)}} 
                                blurEvent={(value)=>{this.handleBlur(value,index, v.dataIndex, 2)}}/>
                        </div>
                    } else {
                        return <div className="textStyle">{text}</div>
                    }
                }
            }
            return v
        })
        return columns
    }

    // 帮助的图标和说明
    renderHelp =()=>{
        let text = <div style={{lineHeight: '25px'}}>
            <div>直接材料：本期领料单数据</div>
            <div>直接人工、制造费用等项目：指定科目本期发生额数据</div>
        </div>            
        return  HelpIcon(text, 'bottom')
    }

    // 直接材料本期结转
    calMaterialCurrentCost = (field, list, index) => {
        let carryOverCost = this.metaAction.gf('data.carryOverCost') && this.metaAction.gf('data.carryOverCost')|| 0
        carryOverCost = parseFloat(transToNum(carryOverCost))          // 本期结转金额之和
        const totalVal = list.reduce((total,item)=>{                   // totalVal——除了直接材料其他三项的本期结转之和
            if (item.code !== 'materialCostAccount') {
                total += transToNum(item.currentCost)
            }
            return total
        },0)
        const sum = carryOverCost - totalVal                           // 计算出直接材料本期结转金额之和
        const materialCurrentCost = utils.number.format(sum, 2)        // 格式化
        let materialBalance = transToNum( list[index]['lastAmount'] ) + transToNum( list[index]['currentAmount'] ) - sum
            materialBalance = utils.number.format(materialBalance, 2)  //直接材料本期结余
        return { materialCurrentCost, materialBalance }
    }

    handleInputOld = (value, index, field) => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        list[index][field] = value
        if (!this.isManualAllocation) {
            if (field && field === 'currentCost') {             // 本期结转列的计算
                const idx = list.findIndex(v => v.code === 'materialCostAccount')
                const { materialCurrentCost, materialBalance } = this.calMaterialCurrentCost(field,list, idx)
                list[idx][field] = materialCurrentCost          // 本期结转
                list[idx]['currentBalance'] = materialBalance   // 本期结余
            }
            if(field!=='currentBalance'){                       // 如果当前的输入框不是本期结余，计算出本期结余数
                const balance = this.calBalance(list[index])
                list[index]['currentBalance'] = balance
            }
        } else {
            //分配方式选择人工分配时
            if (field == "currentCost" || field == "currentBalance") {
                const type = field == "currentCost" ? "currentBalance" : "currentCost"
                list[index][type] = utils.number.format(
                    transToNum(list[index]["lastAmount"]) + transToNum(list[index]["currentAmount"]) - transToNum(list[index][field])
                , 2)
            }
        }
        this.copyList = [...list]
        this.injections.reduce('updateSfs',{['data.list']: fromJS(list)})
    }

    handleInput = (value, index, field) => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        list[index][field] = value
        if (!this.isManualAllocation) {
            if (field && field === 'currentCost') {             // 本期结转列的计算
                const idx = list.findIndex(v => v.code === 'materialCostAccount')
                const { materialCurrentCost, materialBalance } = this.calMaterialCurrentCost(field,list, idx)
                list[idx][field] = materialCurrentCost          // 本期结转
                list[idx]['currentBalance'] = materialBalance   // 本期结余
            }
            if(field!=='currentBalance'){                       // 如果当前的输入框不是本期结余，计算出本期结余数
                const balance = this.calBalance(list[index])
                list[index]['currentBalance'] = balance
            }
        } else {
            //分配方式选择人工分配时
            if (field == "currentCost" || field == "currentBalance") {
                const type = field == "currentCost" ? "currentBalance" : "currentCost"
                list[index][type] = utils.number.format(
                    transToNum(list[index]["lastAmount"]) + transToNum(list[index]["currentAmount"]) - transToNum(list[index][field])
                , 2)
            }
        } 
        this.copyList = [...list]
        this.injections.reduce('updateSfs',{['data.list']: fromJS(list)})
    }

    handleBlur = (value, index, field, formatDecimal) => {
        let v = value
        let list = this.metaAction.gf('data.list').toJS()
        let midVal = formatDecimal ? utils.number.format(transToNum(v),formatDecimal) : v
        list[index][field] = v = transToNum(midVal) ? midVal : '0.00'
        if(field!=='currentBalance' && !this.isManualAllocation){                   // 如果当前的输入框不是本期结余的话，计算本期结余数
            const balance = this.calBalance(list[index])
            list[index]['currentBalance'] = balance
        }
        this.injections.reduce('updateSfs', {['data.list']: fromJS(list)})
        this.copyList = [...list]
    }

     /**
     * @description: 计算每一行的本期结余
     * @param {object} row 每一行的数据对象
     * @return {boolean} 该行的本期结余数
     */
    calBalance = (row)=>{
        let {lastAmount,currentAmount,currentCost} = row
        let currentBalance = transToNum(lastAmount) + transToNum(currentAmount) - transToNum(currentCost)
        let content = (currentBalance || currentBalance === 0) ? currentBalance : ''
        content = utils.number.format(content, 2)
        return content
    }

    // 更新
    handleRefresh = async() => {  
        const hasClick = canClickTarget.getCanClickTarget('distributionSaleUpdate')  
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionSaleUpdate', true)
            await this.load('update')
            canClickTarget.setCanClickTarget('distributionSaleUpdate', false)
        }
    }
    
    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-distribution-production-cost-sales')
        this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
    } 

    // 列求和
    sum = (arr, field) => {
        const ret = arr.reduce((total, currentVal) => {
            return total + transToNum(currentVal[field])
        }, 0)
        return ret
    }

    // 校验
    checkForm = () => { //lastAmount  currentAmount currentCost currentBalance
        const mainList = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []//[...this.copyList]
        let canSave = true, errorTips, checkList = []
        if (!this.isManualAllocation) {
            checkList = mainList.map(v => {
                v.code = (v.code != undefined && v.code != null) ? v.code : null
                v.name = (v.name != undefined && v.name != null) ? v.name : null
                v.isCompletion = (v.isCompletion != undefined && v.isCompletion != null) ? v.isCompletion : null
                v.lastAmount = transToNum(v.lastAmount) || 0
                v.currentAmount = transToNum(v.currentAmount) || 0
                v.currentCost = transToNum(v.currentCost) || 0
                v.currentBalance = transToNum(v.currentBalance) || 0

                if (v.currentCost<0 || v.currentBalance < 0) {
                    canSave = false
                    errorTips = '存在数据为负数的情况，不能保存'    
                }
                return v
            })
            const {currentCostTotal} = this.calTotal()
            if (!parseFloat(currentCostTotal)) {
                errorTips = '本期结转数未录入，不能保存！'
                canSave = false
            }
        } else {
            //分配方式选择人工分配时的情况
            let currentCostTotal = 0
            checkList = mainList.map(v => {
                v.code = (v.code != undefined && v.code != null) ? v.code : null
                v.name = (v.name != undefined && v.name != null) ? v.name : null
                v.isCompletion = (v.isCompletion != undefined && v.isCompletion != null) ? v.isCompletion : null
                v.lastAmount = transToNum(v.lastAmount) || 0
                v.currentAmount = transToNum(v.currentAmount) || 0
                v.currentCost = transToNum(v.currentCost) || 0
                v.currentBalance = transToNum(v.currentBalance) || 0
                if (v.currentCost < 0 || v.currentBalance < 0) {
                    canSave = false
                    errorTips = '金额为负数，不能保存'    
                }
                currentCostTotal += transToNum(v.currentCost)
                return v
            })
            currentCostTotal = transToNum(currentCostTotal.toFixed(2))
            if (canSave) {
                const currentCostSum = (this.calTotal() || {}).currentCostTotal
                if (currentCostTotal !== transToNum(currentCostSum)) {
                    canSave = false
                    errorTips = '本期结转数之和不等于完工入库成本金额，需调整' 
                }
            }
        }   
        if (!canSave) { this.metaAction.toast('error', errorTips) }
        return { canSave, checkList }        
    }

    // 保存
    handleSave = async(event) => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        const hasClick = canClickTarget.getCanClickTarget('distributionSaleSave') 
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionSaleSave', true)
            const {canSave, checkList} = await this.checkForm()
            if (!canSave) {
                canClickTarget.setCanClickTarget('distributionSaleSave', false)
                return
            }
            const saveParams = {}
            saveParams.period = this.params.period || ''
            saveParams.productShareDtoList = [...checkList]
            saveParams.type = this.params.endCostType=='0' ? '1' : '0'
            const saveRes = await this.webapi.stock.createProductShare({'productShareDtoMain':{...saveParams}})
            if (saveRes === null) {
                this.metaAction.toast('success', '保存成功')
                await this.load()
                clearTimeout(this.timer)
                this.timer = setTimeout(async()=>{
                    const newInfo = this.metaAction.gf('data.invSetInfo') && this.metaAction.gf('data.invSetInfo').toJS()
                    Object.assign(this.params, newInfo)
                }, 2000) 
            }
            canClickTarget.setCanClickTarget('distributionSaleSave', false)
        }
    }

    renderHeader = ()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        const { others={}, totalSales=0 } = data
        const { month, updateBtn } = others
        return (
            <div className='distribution-cost-sales-header'>
                <div className='distribution-cost-sales-header-others'>
                    <div className='distribution-cost-sales-header-others-left'>
                        <span className="back-btn" onClick={this.handleReturn}></span>
                        <span className="period">月份：{ month }</span>
                        <span className='totalSales'>本期收入：{totalSales}</span>
                    </div>
                    <div className='distribution-cost-sales-header-others-right'>
                        <span className='distribution-cost-sales-header-others-right-top'>
                            <Button
                                className='update-btn'
                                children= { updateBtn }
                                disabled= {this.isUnEditable()}
                                onClick={this.handleRefresh}
                            ></Button>
                            <span className= 'more-btns'>
                                {this.renderMoreBtns()}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        )
    
    }


    distributionChange=(newList)=>{
        console.log(newList, 'LLLL')
    }

    renderPage = ()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { loading=false, list=[] } = data
        // return ( 
        //     <Distribution
        //         store={this.component.props.store}
        //         params = {this.params}
        //         webapi = {this.webapi}
        //         metaAction = {this.metaAction}
        //         component = {this.component}
        //         distributionChange={this.distributionChange}
        //     ></Distribution>
        // )
        return(
            <Layout className='distribution-cost-sales'>
                
                { loading && <div className='ttk-stock-app-spin'> { stockLoading() } </div> }
                { this.renderHeader() }
                <div className='distribution-cost-sales-main-container mk-layout'>
                    <div className='distribution-cost-sales-main mk-layout'>
                        <Table
                            name= 'distribution-cost-sales-main-table'
                            className= "distribution-cost-sales-main-table  mk-layout"
                            rowKey= 'id'
                            bordered={true}
                            delay={200}
                            pagination={false}
                            emptyShowScroll={true}
                            dataSource= {list}
                            columns= {this.renderColumns()}
                            footer={ 
                                (data)=>{
                                    const { lastAmountTotal, currentAmountTotal, currentCostTotal, currentBalanceTotal } = this.calTotal(data) || {}
                                    return  (
                                    <div className='summary-row-container'>
                                        <div className='summary-row'>
                                            <div> <div className='txtOverflow'>合计</div> </div>
                                            <div> <div className='txtOverflow' title={lastAmountTotal}>        {lastAmountTotal}</div> </div>
                                            <div> <div className='txtOverflow' title={currentAmountTotal}>  {currentAmountTotal}</div> </div>
                                            <div> <div className='txtOverflow' title={currentCostTotal}>      {currentCostTotal}</div> </div>
                                            <div> <div className='txtOverflow' title={currentBalanceTotal}>{currentBalanceTotal}</div> </div>
                                        </div>
                                    </div>)
                                }
                            }
                        />
                    </div>
                    <div className='distribution-cost-sales-save'>
                        <Button
                            className= 'distribution-cost-sales-save-btn'
                            type= 'primary'
                            disabled= {this.isUnEditable()}
                            onClick= {this.handleSave}
                        >保存</Button>
                    </div>
                </div>
            </Layout>
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

