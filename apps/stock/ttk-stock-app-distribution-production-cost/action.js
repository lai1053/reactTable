import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { Modal } from 'antd'
import { Table, Menu, Button, Icon, Dropdown, Layout } from 'edf-component'
import { fromJS, toJS } from 'immutable';
import { tableColumns } from './staticField'
import InputWithTip from '../components/InputWithTip'
import StockBlockSubjectMatch from '../components/StockBlockSubjectMatch'
import StockAppDistributionCost from '../components/StockAppCarryoverProductionCost/StockAppDistributionCost'
import Distribution from '../components/StockAppCarryoverProductionCost/Distribution'
import { 
    getInfo, 
    HelpIcon, 
    transToNum, 
    deepClone, 
    stockLoading, 
    // denyClick,
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
        this.params = this.component.props.params || {}
        this.props = this.component.props
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
        this[`deny-distribution-refresh-generateVoucherClickFlag`] = null
        this[`deny-distribution-batch-generateVoucherClickFlag`] = null
        this[`deny-distribution-save-generateVoucherClickFlag`] = null
    }

    stockLoading=(param)=>stockLoading(param)

    // 是否已经结账/结转生产成本/结转主营成本
    isUnEditable = ()=>{
        const invSetInfo = this.metaAction.gf('data.invSetInfo') && this.metaAction.gf('data.invSetInfo').toJS() || {}
        const { isCarryOverMainCost, isCarryOverProductCost, isGenVoucher } = invSetInfo
        const res = (isCarryOverMainCost || isCarryOverProductCost || isGenVoucher)
        return res
    }

    // holderText=()=> (this.isUnEditable ? '' : '请输入成本率')
    
    // 检测是否已经进行科目匹配
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
        }else if(!subjectConfig || Object.prototype.toString.call(subjectConfig)!=='[object Array]'){
            console.log('生产成本分配页面，科目设置返回出错')
            return true
        }else{
            return true
        }
        if(ret===true || ret===false) return true
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

    /* 已经结账/结转生产成本/结转主营成本*/
    isReadOnly=()=>{
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        return (isGenVoucher || isCarryOverProductCost || isCarryOverMainCost)
    }

    load = async(update) => {
        const time = this.getPeriod() // 获取当前会计期间的
        const method = (update === 'update') ? 'getUpdateProductShareList' : 'getProductShareList'
        this.metaAction.sf('data.loading', true)
        const stockListReq = this.webapi.stock[method]({"period": time || ''})      // 生产成本分配列表的数据
        const invSetInfoReq = getInfo({ 'period': (time || this.params.period ||'')})
        let res = await stockListReq
           
        
        if (res) {
            const isVoucher = res.isVoucher
            const totalSales = utils.number.format(res.totalSales,2)
            // 这里需要重新看一下    
            this.copyList = ( res.productShareDtoList && res.productShareDtoList.length !== 0 ) ? deepClone(res.productShareDtoList) : []
                 let list = ( res.productShareDtoList && res.productShareDtoList.length !== 0 ) ? deepClone(res.productShareDtoList) : [] 
            
            if(this.params.isProductShare && update !== 'update' ){ // 已经生成成本分配表
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? utils.number.format(v.lastAmount,2) : '0.00'
                    v.currentAmount = parseFloat(v.currentAmount) ?  utils.number.format(v.currentAmount,2) : '0.00'
                    v.currentCost = parseFloat(v.currentCost) ?  utils.number.format(v.currentCost,2) : '0.00'
                    v.currentBalance = parseFloat(v.currentBalance) ?  utils.number.format(v.currentBalance,2) : '0.00'
                    return v
                })
    
            }else{ //还未生成成本分配表或是点击更新
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? utils.number.format(v.lastAmount,2) : '0.00'
                    v.currentAmount = parseFloat(v.currentAmount) ?  utils.number.format(v.currentAmount,2) : '0.00'
                    v.currentCost = parseFloat(v.currentCost) ?  utils.number.format(v.currentCost,2) : '0.00'
                    v.currentBalance = this.calBalance(v) // 计算出本期结余
                    return v
                })
            }

            const invSetInfo = await invSetInfoReq
            this.injections.reduce('updateSfs',{
                ['data.list']: fromJS(list),
                ['data.others.month']: time,
                ['data.others.costRate']: '',
                ['data.invSetInfo']: fromJS(invSetInfo),
                ['data.totalSales']: totalSales,
                ['data.others.isVoucher']: isVoucher,
                ['data.isCarryOverProductCost']: this.params.isCarryOverProductCost,
                ['data.isCarryOverMainCost']: this.params.isCarryOverMainCost,
                ['data.isProductShare']: this.params.isProductShare,
                
            })

        } else {
            this.metaAction.toast('error',res)
        }
        this.metaAction.sf('data.loading', false) 
        // setTimeout(() => {this.getTableScroll()}, 100)
    }

    // 列渲染
    renderColumns = () => {
        let columns = tableColumns.concat()
        const isUnEditable = this.isUnEditable()
        // const {isGenVoucher, isCarryOverProductCost} = this.params
        columns = columns.map(v => {
            if(v.dataIndex === 'lastAmount'){               // 上期结余
                v.render = (text, record, index) => {
                    // if(!isGenVoucher && !isCarryOverProductCost){
                    if(!isUnEditable){
                        return <div>
                                <InputWithTip
                                    format={'cash'}                                
                                    defaultVal={text} 
                                    inputEvent={(value)=>{this.handleInput(value,index, v.dataIndex)}} 
                                    blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}  />
                             </div>
                    }else{
                        return <div className="textStyle">{text}</div>
                    }
                }
            }else if(v.dataIndex === 'currentCost'){        // 本期结转
                v.render = (text, record, index) => {
                    // if(!isGenVoucher && !isCarryOverProductCost){
                    if(!isUnEditable){
                        return <div>
                            <InputWithTip
                                format={'cash'}
                                defaultVal={text} 
                                inputEvent={(value)=>{this.handleInput(value,index, v.dataIndex)}} 
                                blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}  />
                        </div>
                    }else{
                        return <div className="textStyle">{text}</div>
                    }
                }
            }else if(v.dataIndex === 'currentBalance'){    //本期结余
                v.render = (text, record, index) => {
                    const flag = transToNum(text) >= 0 ? true : false
                    return ( <div className="textStyle" style={{color: (flag?'#333':'red')}} > {text} </div> )
                }

            }else if(v.dataIndex === 'currentAmount'){     // 本期发生
                const help = this.renderHelp()
                v.title = <div>
                            <span>本期发生</span>
                            {help}
                        </div>
                v.render = (text, record, index) => {
                    // if(!isGenVoucher && !isCarryOverProductCost){
                    if(!isUnEditable){
                        return <div>
                                <InputWithTip 
                                    format={'cash'}
                                    defaultVal={text} 
                                    inputEvent={(value)=>{this.handleInput(value,index, v.dataIndex)}} 
                                    blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}  />
                             </div>
                    }else{
                        return <div className="textStyle">{text}</div>
                    }
                }
            }
            return v
        })
        return columns
    }

    // 帮助的图标和说明
    renderHelp = () => {
        let text =  <div style={{lineHeight: '25px'}}>
                        <div>直接材料：本期领料单数据</div>
                        <div>直接人工、制造费用等项目：指定科目本期发生额数据</div>
                    </div>            
        return  HelpIcon(text, 'bottom')
    }

    handleInput = (value, index, field) => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        list[index][field] = value

        const balance = this.calBalance(list[index])
        list[index]['currentBalance'] = balance

        this.injections.reduce('updateSfs',{['data.list']:fromJS(list)})
        this.copyList = [...list]
    }

    handleBlur = (value, index, field, formatDecimal) => {
        let v = value
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        const textVal = transToNum(v)
        let midVal = formatDecimal ? utils.number.format(textVal, formatDecimal) : v
        list[index][field] =  v = transToNum(midVal) ? midVal : '0.00'
        const balance = this.calBalance(list[index])
        list[index]['currentBalance'] = balance

        this.injections.reduce('updateSfs',{['data.list']: fromJS(list)})
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

     /**
     * @description: 计算表格每一列的合计数
     * @param {array} data 表格的数据
     * @return {object} 合计数的对象
     */
    calTotal=(data)=>{
        let lastAmountTotal = 0, currentAmountTotal = 0, currentCostTotal =0
        for(const item of data){
            lastAmountTotal = ( transToNum(lastAmountTotal) + transToNum(item['lastAmount']) ).toFixed(2)
            currentAmountTotal = ( transToNum(currentAmountTotal) + transToNum(item['currentAmount']) ).toFixed(2)
            currentCostTotal = ( transToNum(currentCostTotal) + transToNum(item['currentCost']) ).toFixed(2)
        }
        let currentBalanceTotal = transToNum(lastAmountTotal) + transToNum(currentAmountTotal) - transToNum(currentCostTotal)
       
        // 数据格式化
        lastAmountTotal = utils.number.format(lastAmountTotal,2)
        currentAmountTotal = utils.number.format(currentAmountTotal,2)
        currentCostTotal = utils.number.format(currentCostTotal,2)
        currentBalanceTotal = utils.number.format(currentBalanceTotal,2)
    
        this.totalSum = {
            lastAmountTotal, 
            currentAmountTotal, 
            currentCostTotal, 
            currentBalanceTotal
        }

        return {
            lastAmountTotal, 
            currentAmountTotal, 
            currentCostTotal, 
            currentBalanceTotal
        }
    }

     /**
     * @description: 计算每一行的本期结余
     * @param {object} e 输入框input事件的事件对象
     * @return {boolean} 该行的本期结余数
     */
    costRateInput = (e) => {
        e.target.value = e.target.value.replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
        let v = e.target.value , 
            errTips = ( parseFloat(v) >1 && !!parseFloat(v) ) ? 
                        '输入的成本率应大于0，小于1' 
                        : ''
        let valArr = e.target.value.toString().split('.')
        let newVal
        if(valArr && valArr[1] && valArr[1].length>4){   // 如果输入框的金额大于4位小数，就保留4位小数
            valArr[1] = valArr[1].slice(0,4)
            newVal = `${valArr[0]}.${valArr[1]}`
        }else{
            newVal = e.target.value
        }
        e.target.value = newVal
        this.injections.reduce('updateSfs',{
            ['data.others.costRateErrorTips']: errTips,
            ['data.others.costRate']: e.target.value
        })
    }

     // 点击“批量分配”按钮，计算本期结转与本期结余
     batchDistribution = (event) => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        const hasClick = canClickTarget.getCanClickTarget('distribution')  
        if(!hasClick){
            const costRate = this._hasCostRate()            // 输入框中是否输入了成本率
            if(!costRate) return                            // 如果未输入成本率，点击无效

            canClickTarget.setCanClickTarget('distribution', true)

            let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
            let total = this.metaAction.gf('data.totalSales')
                total = transToNum(total)

            let materialSum,          
                personSum,             
                manifactureSum,        
                otherSum               

            list.map(v => {
                if(v.code==='materialCostAccount'){
                    materialSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)    // 直接材料 的 上期结余 与 本期发生 合计
                    materialSum = transToNum( materialSum.toFixed(2) )

                }else if(v.code==='personCostAccount'){
                    personSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)     // 直接人工 的 上期结余 与 本期发生 合计
                    personSum = transToNum( personSum.toFixed(2) )

                }else if(v.code==='factoryFee'){
                    manifactureSum = transToNum(v.lastAmount) + transToNum(v.currentAmount) // 制造费用 的 上期结余 与 本期发生 合计
                    manifactureSum = transToNum( manifactureSum.toFixed(2) )

                }else if(v.code==='otherFee'){
                    otherSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)       // 其他费用 的 上期结余 与 本期发生 合计
                    otherSum = transToNum( otherSum.toFixed(2) )
                }
                return v
            })

            let lastAmountTotal = transToNum( this.totalSum.lastAmountTotal),               // 所有项上期结余的合计数
                currentAmountTotal = transToNum( this.totalSum.currentAmountTotal )         // 所有项本期发生的合计数
            let calSum = this.totalSum && (lastAmountTotal + currentAmountTotal) || 0       // 全部项目上期结余与本期发生的合计
            
            // 各项占总成本百分比
            let materialRate = calSum ? (materialSum/calSum).toFixed(10) : 0,
                personRate = calSum ? (personSum/calSum).toFixed(10) : 0,
                manifactureRate = calSum ? (manifactureSum/calSum).toFixed(10) : 0,
                otherRate =  calSum ? (otherSum/calSum).toFixed(10) : 0
        
            // 计算各项本期结转金额
            const rate = parseFloat(costRate)

            let materialNum    =  ( transToNum(materialRate)    * total).toFixed(10) * rate,
                manifactureNum =  ( transToNum(manifactureRate) * total).toFixed(10) * rate,
                personNum      =  ( transToNum(personRate)      * total).toFixed(10) * rate,
                otherNum       =  ( transToNum(otherRate)       * total).toFixed(10) * rate
            
                // 赋值
            list = list.filter(v => {
                if(v.code==='materialCostAccount'){
                    v.currentCost = utils.number.format(materialNum, 2)
                    v.currentBalance = utils.number.format(materialSum - transToNum(v.currentCost), 2)

                }else if(v.code==='personCostAccount'){
                    v.currentCost =  utils.number.format(personNum, 2)
                    v.currentBalance = utils.number.format(personSum - transToNum(v.currentCost), 2)

                }else if(v.code==='factoryFee'){
                    v.currentCost = utils.number.format(manifactureNum, 2)
                    v.currentBalance = utils.number.format(manifactureSum - transToNum(v.currentCost), 2)

                }else if(v.code==='otherFee'){
                    v.currentCost = utils.number.format(otherNum, 2)
                    v.currentBalance = utils.number.format(otherSum - transToNum(v.currentCost), 2)
                }
                return v
            })
            this.injections.reduce('updateSfs',{
                ['data.list']: fromJS(list),
            })
            this.copyList = [...list]
            canClickTarget.setCanClickTarget('distribution', false)
        }
    }

    // 检测是否有输入成本比率，若无则提示
    _hasCostRate = () => {
        let costRate = this.metaAction.gf('data.others.costRate')
            &&  parseFloat(this.metaAction.gf('data.others.costRate'))
            || 0 //成本率
        if(parseFloat(costRate)){
            return costRate
        }else{
            Modal.warning({
                title: '需先录入成本率数据！',
                okText: '确定',
                cancelText: '取消'
            });
            return false
        }
    }

    // 更新
    update = async() => {  
        const hasClick = canClickTarget.getCanClickTarget('distributionUpdate')  
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionUpdate', true)
            await this.load('update')
            canClickTarget.setCanClickTarget('distributionUpdate', false)
        }
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-distribution-production-cost')
        
            this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
    }

    // 列求和
    sum = (arr, field) => {
        const ret = arr.reduce((total,currentVal,currentIndex,arr)=>{
            return total + transToNum( currentVal[field] ) 
        },0)
        return ret
    }

    // 校验
    checkForm = () => { //lastAmount  currentAmount currentCost currentBalance
        const mainList = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let canSave = true, errorTips
        const checkList = mainList.map(v=>{
            v.code = (v.code != undefined && v.code != null) ? v.code : null
            v.name = (v.name != undefined && v.name != null) ? v.name : null
            v.isCompletion = (v.isCompletion != undefined && v.isCompletion != null) ? v.isCompletion : null
            
            v.lastAmount = transToNum(v.lastAmount) || 0
            v.currentAmount = transToNum(v.currentAmount) || 0
            v.currentCost = transToNum(v.currentCost) || 0
            v.currentBalance = transToNum(v.currentBalance) || 0

            if( !transToNum(this.totalSum.currentCostTotal) ){  // 这里要修改
                canSave = false
                errorTips = '本期结转数未录入，不能保存！'
            
            }else if( 
                    transToNum(v.currentCost) < 0 
                    || transToNum(v.currentBalance) < 0
                ){
                    canSave = false
                    errorTips = '存在数据为负数的情况，不能保存！'
            }
            return v
        })
        if(!canSave) {
            this.metaAction.toast('error', errorTips)
        }
        return { canSave, checkList }    
    }

    // 保存
    handleSave = async(event) => {
        event.stopPropagation && event.stopPropagation()
        event.nativeEvent.stopPropagation && event.nativeEvent.stopPropagation()
        const hasClick = canClickTarget.getCanClickTarget('distributionSave')  
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionSave', true)
            const {canSave, checkList} = await this.checkForm()
            if(!canSave){
                canClickTarget.setCanClickTarget('distributionSave', false)
                return
            }
            const saveParams = {}
            saveParams.period = this.params.period || ''
            saveParams.productShareDtoList = [...checkList]
            saveParams.type = this.params.endCostType=='0'? '1' : '0'
            const saveRes = await this.webapi.stock.createProductShare({
                'productShareDtoMain': { ...saveParams }
            })
           
            if(saveRes === null){
                this.metaAction.toast('success','保存成功')
                await this.load()
                this.saveTimer = setTimeout(async()=>{
                    const newInfo = this.metaAction.gf('data.invSetInfo') && this.metaAction.gf('data.invSetInfo').toJS()
                    Object.assign(this.params, newInfo)
                }, 1000)  
            }
            canClickTarget.setCanClickTarget('distributionSave', false)
        }
    }
    
    // 更多按钮
    renderMoreBtns=()=>{
        const {Item} = Menu
        const btnList =[{
            title: '更新数据',
            keyVal: 'update',
            cName: 'btn-update',
            disabled: this.isUnEditable()
        },{
            title: '科目设置',
            keyVal: 'subSetting',
            cName: 'btn-subSetting'
        },{
            title: '删除',
            keyVal: 'deleteBill',
            cName: 'btn-delete',
            disabled: this.isUnEditable()
        }]
        const moreMenu = (
            <Menu name='menu' onClick={this.moreActionOpeate}>
                {   btnList.map(v=>{
                        const {keyVal, title, cName, disabled=false } = v
                        return (
                            <Item name={ keyVal } key={ keyVal } className={ cName } disabled = {disabled}>
                                <span>{ title }</span>
                            </Item>)
                    }) 
                }
            </Menu>
        )
        return (
            <Dropdown name='moreBtns' trigger={['click']} overlay={moreMenu}>
                <Button className='distribution-header-more' name='internal'>
                    <span name='word'> 更多 </span>
                    <Icon name='more' type='down'></Icon>
                </Button>
            </Dropdown>
        )
    }

    renderHeader=()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { others, totalSales=0,  } = data
        const { month, costRateErrorTips, costRate } = others
        return(
            <div className="distribution-cost-header">
                <div className="distribution-cost-header-others-left">
                    <span className="back-btn" onClick={this.handleReturn}></span>
                    <span className="period">月份：{ month }</span>
                    <span className="totalSales">本期收入：{ totalSales } </span>
                </div>
                <div className= "distribution-cost-header-others-right">
                    <span className="distribution-cost-header-others-right-top">
                        <span className='rate-container'>
                            <span className='cost-rate-text'>成本率：</span>
                            <div className='cost-rate-container'>
                                {
                                    !!costRateErrorTips && 
                                        <span className='cost-rate-input-tips'> { costRateErrorTips }</span>
                                }
                                <input
                                    className='cost-rate-input'
                                    value={ costRate }
                                    onInput= {this.costRateInput}
                                    disable= {this.isUnEditable()}
                                    placeholder= '请输入成本率'
                                />
                                <Button
                                    className= 'cost-rate-button'
                                    type= 'primary'
                                    onClick={this.batchDistribution}
                                    disabled={!!costRateErrorTips || this.isUnEditable()}
                                >批量分配</Button>
                            </div>
                        </span>
                        <span className="more-btns">
                            {this.renderMoreBtns()}
                        </span>
                    </span>
                </div>
            </div>
        )                           
    }

    distributionChange=(newList)=>{
        console.log(newList, 'LLLL')
    }

    renderPage=()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { loading=false, list=[] } = data
        // console.log(8888, 999)
        // return (
        //     <StockAppDistributionCost
        //         store={this.component.props.store}
        //         params = {this.params}
        //         webapi = {this.webapi}
        //         metaAction = {this.metaAction}
        //         component = {this.component}
        //     ></StockAppDistributionCost>
        //     // <Distribution
        //     //     store={this.component.props.store}
        //     //     params = {this.params}
        //     //     webapi = {this.webapi}
        //     //     metaAction = {this.metaAction}
        //     //     component = {this.component}
        //     //     distributionChange={this.distributionChange}
        //     // ></Distribution>
        // )
        return (
            <Layout className='distribution-cost'>
                {
                    loading && 
                    <div className="ttk-stock-app-spin">
                        {stockLoading()}
                    </div>
                }
                { this.renderHeader() }
                <div className='distribution-cost-main-container mk-layout'>
                    <div className='distribution-cost-main mk-layout'>
                        <Table
                            name= 'distribution-cost-main-table'
                            className= "distribution-cost-main-table mk-layout"
                            rowKey= 'id'
                            bordered={true}
                            delay={200}
                            pagination={false}
                            dataSource={list}
                            columns= {this.renderColumns()}
                            footer= {
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
                    <div className='distribution-cost-save'>
                        <Button
                            className= 'distribution-cost-save-btn'
                            type= 'primary'
                            disabled= {this.isUnEditable()}
                            onClick={this.handleSave}
                        >
                            保存
                        </Button>
                    </div>
                </div>
            </Layout>
        )
    }

    moreActionOpeate = (e) => 
        this[e.key] && this[e.key]()
    
  
    // 科目设置
    subSetting= async(subjectConfig)=>{
        let configList = subjectConfig ? subjectConfig : await this.webapi.stock.queryAcctCodeByModule({"module": 2})
        let key=(new Date()).getTime + Math.random()

        if(configList && Object.prototype.toString.call(configList)==='[object Array]' ){
            const ret = await this.metaAction.modal('show',{
                title: `科目设置`,
                okText: '确定', 
                cancelText: '取消',
                key: { key },
                width: 900,
                height: 400,
                bodyStyle: {
                    padding: '20px 20px 15px',
                },
                children: (
                    <StockBlockSubjectMatch
                        key={key}
                        metaAction={ this.metaAction }
                        webapi = { this.webapi }
                        store={ this.props.store }
                        component={ this.component }
                        subjectMatches={ configList }
                    />
                )
            })
            if(ret){
                this.load()
            }
            return ret
        }
    }

    // 删除生产成本分配表
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
                    && this.component.props.onlyCloseContent('ttk-stock-app-distribution-production-cost')
                
                this.component.props.setPortalContent 
                    && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
            }, 3000)
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}


