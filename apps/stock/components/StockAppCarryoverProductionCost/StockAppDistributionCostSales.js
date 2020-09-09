import React from 'react'
import utils from 'edf-utils'
import { Table, Button , Layout} from 'edf-component'
import { tableColumns } from './staticField'
import InputWithTip from '../InputWithTip'
import StockBlockSubjectMatch from '../StockBlockSubjectMatch'
import { 
    getInfo, 
    HelpIcon, 
    transToNum, 
    deepClone, 
    stockLoading, 
    getClientSize, 
    addEvent, 
    removeEvent,
    canClickTarget,
    getPeriod,
    numFixed,
    formatNumber
} from '../../commonAssets/js/common'

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

class StockAppDistributionCostSales extends React.Component{
    constructor(props){
        super(props)
        this.state={
            loading: false,
			totalSales: 100000,    // 本期收入
            invSetInfo: {},        // 存货公共接口的信息
            list: [],
            copyList: [],                     // list的副本
            xdzOrgIsStop: props.xdzOrgIsStop, // 客户是否已停用
            tableOption: {
				y: 400
			},
			others: {             
				month: '',
                updateBtn: '更新数据',
            },
        }
        this.metaAction = props.metaAction
        this.component = props.component
        this.webapi = props.webapi
        this.params = props.params
    }

    componentWillMount=async()=>{
        let result
        if(!this.props.xdzOrgIsStop){  // 如果该客户未停用，那进入页面先检测科目匹配是否已经匹配完毕
           result = await this.detectMatch()
        }
        if(result || this.props.xdzOrgIsStop){
            this.load()
        }
    }

    componentDidMount=async()=>{
        addEvent(window, 'resize', calClientSize)
    }

    componentWillUnmount=()=>{
        removeEvent(window, 'resize', calClientSize)
    }

    // 是否（已经结账/结转生产成本/已生成出库凭证/该客户已经停用）, 如果是，则不能操作，如果否，则可以操作和编辑
    isUnEditable = ()=>{
        const { invSetInfo, xdzOrgIsStop } = this.state
        const { isCarryOverMainCost, isCarryOverProductCost, isGenVoucher } = invSetInfo
        return (isCarryOverMainCost || isCarryOverProductCost || isGenVoucher || xdzOrgIsStop)
    }

    // 检测科目匹配是否都已匹配完毕
    detectMatch = async()=>{
        this.setState({loading: true})
        const settingReq = this.webapi.stock.queryAcctCodeByModule({"module": 2})  //请求科目匹配页面列表数据
        const subjectConfig = await settingReq
        this.setState({loading: false})
        let ret, 
            flag = subjectConfig.some((item)=>!item.destAcctId)  //是否存在某个客户未匹配  destAcctId--匹配上的科目id
       
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

        }else{ return true }  // 科目已匹配上时

        if(ret===true || ret===false){  // 无论是保存还是关闭科目匹配页面，都正常加载“生产成本分配列表数据”
            return true
        }
    }

   /**
     * @description: 科目设置
     * @param {string} update 是否更新列表数据 update=='update'——更新; update不传，为空，undefined等，请求页面初始化数据
     * @return {object} 匹配结果，是否已经匹配
     */
    load = async(update) => { 
        const currentOrg = this.metaAction.context.get('currentOrg') || {}
        const time = getPeriod( currentOrg ) 
        const method = update === 'update' ? 'getUpdateProductShareList' : 'getProductShareList'
        this.setState({loading: true})
        const stockListReq = this.webapi.stock[method]({'period': time || ''}) || []
        let res = await stockListReq
        this.setState({loading: false})
        if (res) {
            const respList = res.productShareDtoList  // 成本分配表数据
            const totalSales = formatNumber(res.totalSales,2)   // 本期收入
            let carryOverCost = parseFloat(res.carryOverCost) ? formatNumber(res.carryOverCost, 2) : '0.00'   // 本期结转金额合计
            let list = deepClone(respList) || [], nonMaterial = 0
            const copyList = respList && respList.length !== 0 ? deepClone(respList) : []
            // 已经生成生产成本分配表,且为页面初始化请求时
            if(this.params.isProductShare && update !== 'update' ){  
                let costSum = 0
                list = list.map(v => {
                    v.lastAmount = transToNum(v.lastAmount) ? formatNumber(v.lastAmount, 2) : '0.00'                 //上期结余
                    v.currentAmount = transToNum(v.currentAmount) ?  formatNumber(v.currentAmount, 2) : '0.00'       // 本期发生
                    v.currentCost = transToNum(v.currentCost) ?  formatNumber(v.currentCost, 2) : '0.00'             // 本期结转
                    v.currentBalance = transToNum(v.currentBalance) ?  formatNumber(v.currentBalance, 2) : '0.00'    // 本期结余数
                    costSum = numFixed( (transToNum(v.currentCost) + transToNum(costSum)), 2)  // 统计本期结转
                    return v
                })
                carryOverCost = formatNumber(costSum, 2)  // 本期结转金额合计

                if(transToNum(res.carryOverCost) != costSum ){  // 如果后端返回的本期结转金额合计 与 页面上的本期结转金额合计不相等
                    console.log(`生产成本分配表（以销定产），已生成分配表，但本期结转金额合计${costSum}与接口返回金额${res.carryOverCost}不等，请查看！`)
                }

            }else{ // 更新数据 或者 没有生成生产成本分配表
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? formatNumber(v.lastAmount, 2) : '0.00'  //上期结余
                    v.currentAmount = parseFloat(v.currentAmount) ?  formatNumber(v.currentAmount, 2) : '0.00'  // 本期发生
                    // 非”直接材料“的本期结转数
                    if (v.code !== 'materialCostAccount') {
                        const lastVal = transToNum(v.lastAmount) + transToNum(v.currentAmount)   // 上期结余+本期发生之和
                        v.currentCost = lastVal ? formatNumber(lastVal, 2)  : '0.00'             // 默认（上期结余和本期发生之和）全部结转
                        nonMaterial += transToNum(v.currentCost)                                 // 非直接材料本期发生金额累计
                        const balance = transToNum(v.lastAmount) + transToNum(v.currentAmount) - transToNum(v.currentCost)
                        v.currentBalance = formatNumber(balance, 2)                              // 本期结余=期初余额+本期发生-本期结转
                    } 
                    return v
                })
                // “直接材料” 本期发生 和 本期结余
                const index = list.findIndex(v=>v.code==='materialCostAccount')
                const materialCurrentCost = res.carryOverCost - nonMaterial   // 直接材料本期发生 = 本期结转金额合计 - 非直接材料的三项“本期结转”
                const val = numFixed( (transToNum(list[index]['lastAmount']) + transToNum(list[index]['currentAmount']) - materialCurrentCost), 2)  // 直接材料的本期结余
                list[index]['currentCost'] = formatNumber(materialCurrentCost, 2)
                list[index]['currentBalance'] = formatNumber(transToNum(val), 2)
            }   
                
            let invSetInfo = {...this.props.invSetInfo} 
            const {others} = this.state
            this.setState({
                totalSales,
                list,
                copyList,
                others:{
                    ...others,
                    month: time,
                },
                carryOverCost,
                invSetInfo,
            })
            this.updateParent(list)
        } else {
            this.metaAction.toast('error', res)
        }
    }

    // 向父页面保存“生产成本分配”页面数据
    updateParent=(newList)=>this.props.changeList &&this.props.changeList(newList)

    /*
     * @description: 计算表格的每一列的底部合计数
     * @param {array} data 整个表格的数据
     * @return {object} {lastAmountTotal--上期结余合计 ，currentAmountTotal--本期发生合计，
     *                  currentCostTotal--本期结转合计，currentBalanceTotal--本期结余合计}
    */ 
    calTotal = ()=>{
        const {list=[], carryOverCost=0} = this.state
        let lastAmountTotal = this.sum(list,'lastAmount') ,                                         // 本期结余金额合计
            currentAmountTotal = this.sum(list,'currentAmount'),                                    // 本期发生金额合计
            currentCostTotal = transToNum(carryOverCost),                                           // 本期结转金额合计
            currentBalanceTotal = lastAmountTotal + currentAmountTotal - currentCostTotal           // 本期结余金额合计

        // 格式化处理
        lastAmountTotal = formatNumber(lastAmountTotal,2)
        currentAmountTotal = formatNumber(currentAmountTotal,2)
        currentCostTotal = formatNumber(parseFloat(currentCostTotal),2)
        currentBalanceTotal = formatNumber(currentBalanceTotal,2)
        return { lastAmountTotal, currentAmountTotal, currentCostTotal, currentBalanceTotal }
    }

    moreActionOpeate = (e) => 
        this[e.key] && this[e.key]()
    
     /*
     * @description: 科目设置
     * @param {array} subjectConfig 科目匹配列表数据
     * @return {boolean} 是否已完成科目匹配
    */ 
    subSetting= async(subjectConfig)=>{
        let configList = subjectConfig 
                && Array.isArray(subjectConfig)
                ? subjectConfig 
                : await this.webapi.stock.queryAcctCodeByModule({"module": 2})
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
                this.load()
            }
            return ret
        }
    }


    // 列渲染
    renderColumns = () => {
        let columns = tableColumns.concat()
        const isUnEditable = this.isUnEditable() // 是否不可编辑
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
                v.render = (text, record, index) => {
                    if (!isUnEditable) {
                        if (record.code !== 'materialCostAccount') {  // 不是直接材料那一行
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
            } else if (v.dataIndex === 'currentBalance') {  // 本期结余
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
            }else if(v.dataIndex === 'currentAmount'){
                const help = this.renderHelp()
                v.title = <div> <span>本期发生</span> {help} </div>
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
        let {carryOverCost=0} = this.state
        carryOverCost = parseFloat(transToNum(carryOverCost))    // 本期结转金额之和
        const totalVal = list.reduce((total,item)=>{             // totalVal——除了直接材料其他三项的本期结转之和
            if (item.code !== 'materialCostAccount') {
                total += transToNum(item.currentCost)
            }
            return total
        },0)
        const sum = carryOverCost - totalVal                    // 计算出直接材料本期结转金额之和
        const materialCurrentCost = formatNumber(sum, 2)        // 格式化
        let materialBalance = transToNum( list[index]['lastAmount'] ) + transToNum( list[index]['currentAmount'] ) - sum
            materialBalance = formatNumber(materialBalance, 2)  //直接材料本期结余
        return { materialCurrentCost, materialBalance }
    }

    /**
     * @description: input事件
     * @param {string} value 输入框输入的值
     * @param {string} index 是哪一项的问题
     * @param {string} field 变更的字段，即哪个字段触发的事件
     * @return {object} 匹配结果，是否已经匹配
     */
    handleInput = (value, index, field) => {
        let { list=[] } = this.state
        list[index][field] = value
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
        const copyList = [...list]
        this.setState({
            list,
            copyList
        })
        this.updateParent(list)
    }


    /**
     * @description: 失去焦点事件
     * @param {string} value 输入框输入的值
     * @param {string} index 是哪一项的问题
     * @param {string} field 变更的字段，即哪个字段触发的事件
     * @param {string/number} formatDecimal 保留小数位数
     * @return {object} 匹配结果，是否已经匹配
     */
    handleBlur = (value, index, field, formatDecimal) => {
        let v = value
        let {list=[]} = this.state
        let midVal = formatDecimal ? formatNumber(transToNum(v),formatDecimal) : v
        list[index][field] = v = transToNum(midVal) ? midVal : '0.00'
        if(field!=='currentBalance'){                   // 如果当前的输入框不是本期结余的话，计算本期结余数
            const balance = this.calBalance(list[index])
            list[index]['currentBalance'] = balance
        }
        const copyList = [...list]
        this.setState({
            list,
            copyList
        })
        this.updateParent(list)
    }

     /**
     * @description: 计算每一行的本期结余
     * @param {object} row 每一行的数据对象
     * @return {boolean} 该行的本期结余数
     */
    calBalance = (row)=>{
        let {lastAmount, currentAmount, currentCost} = row
        let currentBalance = transToNum(lastAmount) + transToNum(currentAmount) - transToNum(currentCost)
        let content = (currentBalance || currentBalance === 0) ? currentBalance : ''
        content = formatNumber(content, 2)
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
            && this.component.props.onlyCloseContent('ttk-stock-app-carryOver-production-cost')
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

    // 校验，保存前校验列表数据是否满足要求
    checkForm = () => { 
        let {list=[]} = this.state
        let canSave = true, errorTips, checkList = []
        checkList = list.map(v => {
            v.code = (v.code != undefined && v.code != null) ? v.code : null
            v.name = (v.name != undefined && v.name != null) ? v.name : null
            v.isCompletion = (v.isCompletion != undefined && v.isCompletion != null) ? v.isCompletion : null
            v.lastAmount = transToNum(v.lastAmount) || 0
            v.currentAmount = transToNum(v.currentAmount) || 0
            v.currentCost = transToNum(v.currentCost) || 0
            v.currentBalance = transToNum(v.currentBalance) || 0
            // "直接材料"，“直接人工”，“制造费用”，“其他费用”只要这四项其中一项的“本期结转”或者“本期结余”小于0，则不能保存
            if (v.currentCost<0 || v.currentBalance < 0) {  
                canSave = false
                errorTips = '存在数据为负数的情况，不能保存'    
            }
            return v
        })
        const {currentCostTotal} = this.calTotal()  // 四项“本期结转”合计数
        if (!parseFloat(currentCostTotal)) {        // 如果本期结转数全部为录入，则不能保存
            errorTips = '本期结转数未录入，不能保存！'
            canSave = false
        }
        if (!canSave) { this.metaAction.toast('error', errorTips) }
        return { canSave, checkList }        
    }

    // 保存
    handleSave = async() => {
        const hasClick = canClickTarget.getCanClickTarget('distributionSaleSave')  // 防止重复点击
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionSaleSave', true)
            const {canSave, checkList} = await this.checkForm()
            if (!canSave) {        // 如果不可以保存，直接return
                canClickTarget.setCanClickTarget('distributionSaleSave', false)
                return
            }
            const currentOrg = this.metaAction.context.get('currentOrg') || {}
            const time = getPeriod( currentOrg )  // 当前会计期间
            const saveParams = {}
            saveParams.period = time || ''
            saveParams.productShareDtoList = [...checkList]
            saveParams.type = this.params.endCostType=='0' ? '1' : '0'   // 生产成本核算方式，1：传统生产， 0：以销定产
            const saveRes = await this.webapi.stock.createProductShare({'productShareDtoMain':{...saveParams}})  // 生成生产成本分配表
            if (saveRes === null) {
                await this.load()
                clearTimeout(this.timer)
                this.timer = setTimeout(async()=>{
                    const {invSetInfo={}} = this.state
                    Object.assign(this.params, invSetInfo)
                }, 2000) 
            }
            canClickTarget.setCanClickTarget('distributionSaleSave', false)
        }
    }

    renderHeader = ()=>{
        const { others={}, totalSales=0, xdzOrgIsStop } = this.state 
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
                        {!xdzOrgIsStop && <span className='distribution-cost-sales-header-others-right-top'>
                                <Button
                                    className='update-btn'
                                    children= { updateBtn }
                                    type="default"
                                    disabled= {this.isUnEditable()}
                                    onClick={this.handleRefresh}
                                ></Button>
                                <Button
                                    className='subSetting-btn'
                                    type="default"
                                    onClick={this.subSetting}
                                >科目设置</Button>
                            </span>
                        }
                    </div>
                </div>
            </div>
        )
    }

    render(){
        const { loading=false, list=[] } = this.state
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
                </div>
            </Layout>
        )   
    }

}

export default StockAppDistributionCostSales