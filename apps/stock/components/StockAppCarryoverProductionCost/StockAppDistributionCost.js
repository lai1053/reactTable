import React from 'react'
import utils from 'edf-utils'
import { Modal } from 'antd'
import { Table, Menu, Button, Icon, Dropdown, Layout, Input as EdfInput} from 'edf-component'
import { tableColumns } from './staticField'
import InputWithTip from '../InputWithTip'
import StockBlockSubjectMatch from '../StockBlockSubjectMatch'
import { 
    getInfo, 
    getPeriod,
    HelpIcon, 
    transToNum, 
    deepClone, 
    stockLoading, 
    getClientSize, 
    addEvent, 
    removeEvent,
    canClickTarget,
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

class StockAppDistributionCost extends React.Component{
    constructor(props) {
        super(props)
        this.state={
			totalSales: 100000,    // 本期收入
			loading: false,
			isGenVoucher: false,   // 是否已结账
			tableOption:{
				y: 400
            },
            invSetInfo: {...props.invSetInfo},   // 存货公共接口信息
			others: {
				month: '',     // 会计期间
				costRate: '',  // 成本率
                updateBtn: '更新数据',  // 更新按钮
                delBtn: '删除',     // 删除按钮
				costRateErrorTips: '',  // 生产率输入错误提示
				// isVoucher: false
			},
            list: [],
            xdzOrgIsStop: props.xdzOrgIsStop  //客户是否停用
        }
        this.metaAction = props.metaAction
        this.component = props.component
        this.webapi = props.webapi
        this.params = props.params
    }
    
    componentWillMount = async()=>{
        let result
        if(!this.props.xdzOrgIsStop){
           result = await this.detectMatch()  //校验，是否已经匹配了所有的科目，如果未匹配，则需要弹出科目匹配界面
        }
        if(result || this.props.xdzOrgIsStop){ // 如果不是停用客户，且已经匹配好了科目则直接加载页面数据
            this.load()
        }
    }

    componentDidMount=()=>{
        addEvent(window, 'resize', calClientSize)
    }

    componentWillUnmount=()=>{
        removeEvent(window, 'resize', calClientSize)
    }

    // 是否已经结账/结转生产成本/结转主营成本/客户已经停用，如果存在上述四中情况，那么部分功能不能操作
    isUnEditable = ()=>{
        const { invSetInfo, xdzOrgIsStop } = this.state 
        const { 
            isCarryOverMainCost,    // 是否已生成了出库凭证  true: 已生成， false: 未生成
            isCarryOverProductCost, // 是否已生成了生产成本凭证  true: 已生成， false: 未生成
            isGenVoucher            // 是否已结账凭证  true: 已结账， false: 未结账
        } = invSetInfo
        const res = (isCarryOverMainCost || isCarryOverProductCost || isGenVoucher || xdzOrgIsStop)
        return res
    }
    
    // 检测是否已经进行科目匹配
    detectMatch = async()=>{
        this.setState({loading: true})
        const settingReq = this.webapi.stock.queryAcctCodeByModule({"module": 2})  // 请求科目匹配列表的基本信息
        const subjectConfig = await settingReq
        this.setState({loading: false})
        let ret, flag = subjectConfig.some((item)=>!item.destAcctId)   // 如果有某一个科目存在未配置的情况

        if(  // 未设置科目匹配时
            flag
             && subjectConfig 
             && Object.prototype.toString.call(subjectConfig)==='[object Array]'
        ){ 
            ret = await this.subSetting(subjectConfig)

        }else if(!subjectConfig || Object.prototype.toString.call(subjectConfig)!=='[object Array]'){
            console.log('生产成本分配页面，科目设置返回出错')
            return true

        }else{  // 如果科目已匹配
            return true
        }
        if(ret===true || ret===false) return true
    }


    /* 已经结账/结转生产成本/结转主营成本，就只能查看，不能操作*/
    isReadOnly=()=>{
        const { isGenVoucher, isCarryOverProductCost, isCarryOverMainCost } = this.params
        return (isGenVoucher || isCarryOverProductCost || isCarryOverMainCost)
    }

    /**
     * @description: 初始化页面数据 或者更新页面数据
     * @param {string} update 是否是更新页面数据  update=='update'：请求更新页面数据， update不传或者不等于'update': 请求初始化页面数据
     * @return 无
     */ 
    load = async(update) => {  
        const currentOrg = this.metaAction.context.get('currentOrg') || {}
        const time = getPeriod(currentOrg) // 获取当前会计期间的
        this.period = time
        const method = (update === 'update') ? 'getUpdateProductShareList' : 'getProductShareList'
        this.setState({ loading: true })
        const stockListReq = this.webapi.stock[method]({"period": time || ''})      // 生产成本分配列表的数据
        let res = await stockListReq
        
        if (res) {
            // const isVoucher = res.isVoucher 
            let bomBalance = res.bomBalance   // bom领料金额
            const totalSales = formatNumber(res.totalSales,2)   // 本期收入
            // 这里需要重新看一下    
            const copyList = ( res.productShareDtoList && res.productShareDtoList.length !== 0 ) ? deepClone(res.productShareDtoList) : []
            let list = ( res.productShareDtoList && res.productShareDtoList.length !== 0 ) ? deepClone(res.productShareDtoList) : [] 
            
            if(this.params.isProductShare && update !== 'update' ){ // 已经生成成本分配表，在初始化数据时
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? formatNumber(v.lastAmount,2) : '0.00'
                    v.currentAmount = parseFloat(v.currentAmount) ?  formatNumber(v.currentAmount,2) : '0.00'
                    v.currentCost = parseFloat(v.currentCost) ?  formatNumber(v.currentCost,2) : '0.00'
                    v.currentBalance = parseFloat(v.currentBalance) ?  formatNumber(v.currentBalance,2) : '0.00'
                    return v
                })
    
            }else{ //还未生成成本分配表或是点击更新
                list = list.map(v => {
                    v.lastAmount = parseFloat(v.lastAmount) ? formatNumber(v.lastAmount,2) : '0.00'
                    v.currentAmount = parseFloat(v.currentAmount) ?  formatNumber(v.currentAmount,2) : '0.00'
                    v.currentCost = parseFloat(v.currentCost) ?  formatNumber(v.currentCost,2) : '0.00'
                    v.currentBalance = this.calBalance(v) // 计算出本期结余
                    return v
                })
            }

            const invSetInfo = {...this.props.invSetInfo} //await invSetInfoReq
            const { others } = this.state
            this.setState({
                list,
                copyList,
                others: {
                    ...others,
                    month: time,
                    costRate: '',
                },
                bomBalance,
                invSetInfo,
                totalSales,
            })
            this.updateParent(list, bomBalance)  // 向主页面保存当前页面的数据

        } else {
            this.metaAction.toast('error',res)
        }
        this.setState({ loading: false})
    }

    /**
     * @description: 向主页面保存当前页面的数据
     * @param {array} newList 当前页面的数据
     * @param {number} bomBalance bom领料金额
     * @return 无
     */ 
    updateParent = (newList, bomBalance)=> {
        this.props.changeList && this.props.changeList(newList, bomBalance)
    }


    // 列渲染
    renderColumns = () => {
        let columns = tableColumns.concat()
        const isUnEditable = this.isUnEditable()  // 是否不能编辑
        columns = columns.map(v => {
            if(v.dataIndex === 'lastAmount'){               // 上期结余
                v.render = (text, record, index) => {
                    if(!isUnEditable){
                        return <div>
                            <InputWithTip
                                format={'cash'} //format:'cash'--数据格式化成金额,保留2位小数， format:'amount'--数据格式化成数据，保留6位小数                         
                                defaultVal={text} 
                                notNegative={transToNum(text) < 0 ? true : false}  // 是否是负数，是负数边框会变成红色
                                inputEvent={(value)=>{this.handleInput(value,index, v.dataIndex)}} 
                                blurEvent={(value)=>{this.handleBlur(value, index, v.dataIndex, 2)}}  />
                        </div>
                    }else{
                        return <div className="textStyle">{text}</div>
                    }
                }
            }else if(v.dataIndex === 'currentCost'){    // 本期结转
                v.render = (text, record, index) => {
                    if(!isUnEditable){
                        return <div>
                            <InputWithTip
                                format={'cash'}
                                defaultVal={text} 
                                notNegative={transToNum(text) < 0 ? true : false}
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
                const help = this.renderHelp()  // “问号”的小图标
                v.title = <div> <span>本期发生</span> {help} </div>
                v.render = (text, record, index) => {
                    if(!isUnEditable){
                        return <div>
                            <InputWithTip 
                                format={'cash'}
                                defaultVal={text} 
                                notNegative={transToNum(text) < 0 ? true : false}
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

     /**
     * @description: 向主页面保存当前页面的数据
     * @param {array} newList 当前页面的数据
     * @param {number} bomBalance bom领料金额
     * @return 无
     */ 
    handleInput = (value, index, field) => {
        let { list=[], bomBalance=0 } =  this.state
        list[index][field] = value
        const balance = this.calBalance(list[index])
        list[index]['currentBalance'] = balance
        const copyList = [...list]
        this.setState({
            list,
            copyList
        })
        this.updateParent(list, bomBalance)
    }

     /**
     * @description: 向主页面保存当前页面的数据
     * @param {string} value 输入事件返回的输入的值 
     * @param {number} index 是哪一行的字段
     * @param {string} field 是哪个字段的输入框改变
     * @param {string} formatDecimal 格式化信息 
     * @return 无
     */ 
    handleBlur = (value, index, field, formatDecimal) => {
        let v = value
        let { list=[], bomBalance } = this.state
        const textVal = transToNum(v)
        let midVal = formatDecimal ? formatNumber(textVal, formatDecimal) : v
        list[index][field] =  v = transToNum(midVal) ? midVal : '0.00'
        const balance = this.calBalance(list[index])
        list[index]['currentBalance'] = balance
        const copyList = [...list]
        this.setState({
            list,
            copyList
        })
        this.updateParent(list, bomBalance)
    }

    /**
     * @description: 计算每一行的本期结余
     * @param {object} row 每一行的数据对象
     * @return {boolean} 该行的本期结余数
     */
    calBalance = (row)=>{
        let {
            lastAmount,   // 上期结余
            currentAmount,// 本期发生
            currentCost   // 本期结转
        } = row
        // 本期结余=上期结余+本期发生-本期结转
        let currentBalance = transToNum(lastAmount) + transToNum(currentAmount) - transToNum(currentCost) 
        let content = (currentBalance || currentBalance === 0) ? currentBalance : ''
        content = formatNumber(content, 2)
        return content
    }

     /**
     * @description: 计算表格每一列的合计数
     * @param {array} data 表格的数据
     * @return {object} 合计数的对象
     */
    calTotal=(data)=>{
        let lastAmountTotal = 0, currentAmountTotal = 0, currentCostTotal =0
        data = data && Array.isArray(data) ? data : (this.state.list ||[])
        for(const item of data){
            lastAmountTotal = numFixed( (transToNum(lastAmountTotal) + transToNum(item['lastAmount']) ), 2)
            currentAmountTotal = numFixed(( transToNum(currentAmountTotal) + transToNum(item['currentAmount']) ), 2)
            currentCostTotal = numFixed(( transToNum(currentCostTotal) + transToNum(item['currentCost']) ), 2)
        }
        let currentBalanceTotal = transToNum(lastAmountTotal) + transToNum(currentAmountTotal) - transToNum(currentCostTotal)
       
        // 数据格式化
        lastAmountTotal = formatNumber(lastAmountTotal,2)
        currentAmountTotal = formatNumber(currentAmountTotal,2)
        currentCostTotal = formatNumber(currentCostTotal,2)
        currentBalanceTotal = formatNumber(currentBalanceTotal,2)
    
        return {
            lastAmountTotal, 
            currentAmountTotal, 
            currentCostTotal, 
            currentBalanceTotal
        }
    }

    // 成本率的change事件
    costRateChange=(e)=>{
        const {others = {}} = this.state
        this.setState({
            others: {
                ...others,
                costRate: e
            }
        })
    }


    // 检测是否有输入成本比率，若无则提示
    _hasCostRate = () => {
        let { costRate=0 } = this.state.others
        costRate = parseFloat( costRate )
        if(costRate){
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

     // 点击“批量分配”按钮，计算本期结转与本期结余
     batchDistribution = () => {
        const hasClick = canClickTarget.getCanClickTarget('distribution')  // 防止重复点击
        if(!hasClick){
            const costRate = this._hasCostRate()            // 输入框中是否输入了成本率
            if(!costRate) return                            // 如果未输入成本率，点击无效

            canClickTarget.setCanClickTarget('distribution', true)
            let { list=[], totalSales, bomBalance } = this.state  // 取得分配表中的数据， 本期收入， bom领料
            let total = transToNum(totalSales)
            let materialSum,          
                personSum,             
                manifactureSum,        
                otherSum               

            list.map(v => {
                if(v.code==='materialCostAccount'){
                    materialSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)    // 直接材料 的 上期结余 与 本期发生 合计
                    materialSum = numFixed(materialSum, 2) 

                }else if(v.code==='personCostAccount'){
                    personSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)     // 直接人工 的 上期结余 与 本期发生 合计
                    personSum = numFixed( personSum, 2)

                }else if(v.code==='factoryFee'){
                    manifactureSum = transToNum(v.lastAmount) + transToNum(v.currentAmount) // 制造费用 的 上期结余 与 本期发生 合计
                    manifactureSum = numFixed(manifactureSum,2)

                }else if(v.code==='otherFee'){
                    otherSum = transToNum(v.lastAmount) + transToNum(v.currentAmount)       // 其他费用 的 上期结余 与 本期发生 合计
                    otherSum = numFixed(otherSum, 2)
                }
                return v
            })
            const totalSum = this.calTotal() || {}
            let { lastAmountTotal, currentAmountTotal } = totalSum
                lastAmountTotal = transToNum( lastAmountTotal)                     // 所有项上期结余的合计数
                currentAmountTotal = transToNum( currentAmountTotal )              // 所有项本期发生的合计数
            let calSum = totalSum && (lastAmountTotal + currentAmountTotal) || 0   // 全部项目上期结余与本期发生的合计
           
            // 各项占总成本百分比
            let materialRate = calSum ? numFixed(materialSum/calSum, 10) : 0,       // 直接材料占比
                personRate = calSum ? numFixed(personSum/calSum, 10) : 0,           // 直接人工占比
                manifactureRate = calSum ? numFixed(manifactureSum/calSum, 10) : 0, // 制造费用占比
                otherRate =  calSum ? numFixed(otherSum/calSum, 10) : 0             // 其他费用占比
        
            // 计算各项本期结转金额
            const rate = numFixed((costRate/100), 4)  // 输入的成本率

            let materialNum    =  numFixed(( transToNum(materialRate)    * total), 10) * rate,  // 直接材料本期结转
                manifactureNum =  numFixed(( transToNum(manifactureRate) * total), 10) * rate,  // 制造费用本期结转
                personNum      =  numFixed(( transToNum(personRate)      * total), 10) * rate,  // 直接人工本期结转
                otherNum       =  numFixed(( transToNum(otherRate)       * total), 10) * rate   // 其他费用本期结转
            
                // 赋值
            list = list.filter(v => {
                if(v.code==='materialCostAccount'){
                    v.currentCost = formatNumber(materialNum, 2)
                    v.currentBalance = formatNumber(materialSum - transToNum(v.currentCost), 2)

                }else if(v.code==='personCostAccount'){
                    v.currentCost =  formatNumber(personNum, 2)
                    v.currentBalance = formatNumber(personSum - transToNum(v.currentCost), 2)

                }else if(v.code==='factoryFee'){
                    v.currentCost = formatNumber(manifactureNum, 2)
                    v.currentBalance = formatNumber(manifactureSum - transToNum(v.currentCost), 2)

                }else if(v.code==='otherFee'){
                    v.currentCost = formatNumber(otherNum, 2)
                    v.currentBalance = formatNumber(otherSum - transToNum(v.currentCost), 2)
                }
                return v
            })
            const copyList = [...list]
            this.setState({
                list,
                copyList
            })
            this.updateParent(list, bomBalance)  // 把数据保存到父页面
            canClickTarget.setCanClickTarget('distribution', false)
        }
    }


    // 更新
    update = async() => {  
        const hasClick = canClickTarget.getCanClickTarget('distributionUpdate')  // 防止重复点击
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionUpdate', true)
            await this.load('update')
            canClickTarget.setCanClickTarget('distributionUpdate', false)
        }
    }

    // 返回
    handleReturn = () => {
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-carryOver-production-cost')
        
            this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
    }


     /**
     * @description: 科目设置
     * @param {array} subjectConfig 科目匹配列表数据
     * @return {object} 匹配结果，是否已经匹配
     */
    subSetting= async(subjectConfig)=>{
        let configList = subjectConfig && Array.isArray(subjectConfig) 
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
                    padding: '20px 20px 15px',
                },
                children: (
                    <StockBlockSubjectMatch
                        metaAction={ this.metaAction }
                        webapi = { this.webapi }
                        store={ this.props.store }
                        component={ this.component }
                        subjectMatches={ configList }  // 科目匹配列表的页面数据
                    />
                )
            })
            if(ret){
                this.load()
            }
            return ret
        }
    }

    renderHeader=()=>{
        const { others, totalSales=0, xdzOrgIsStop } = this.state 
        const { month, costRateErrorTips, costRate } = others
        const isEnabled = this.isUnEditable()  // 是否不可操作
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
                                <EdfInput.Number 
                                    className="cost-rate-input"  
                                    regex='^([0-9]+)(?:\.[0-9]{1,2})?$' 
                                    title={costRate} 
                                    value={costRate} 
                                    disabled={xdzOrgIsStop}
                                    minValue={0}
                                    maxValue={100}
                                    placeholder={isEnabled ? '' : '请输入成本率'} 
                                    onChange={ this.costRateChange } 
                                /> 
                                <Button
                                    className= 'cost-rate-button'
                                    type= 'primary'
                                    onClick={this.batchDistribution}
                                    disabled={!!costRateErrorTips || isEnabled}
                                >批量分配</Button>

                                <i className='cost-rate-sign'>%</i>
                            </div>
                        </span>

                        {!xdzOrgIsStop &&
                            <Button
                                className= 'cost-rate-button'
                                type= 'default'
                                onClick={this.update}
                                disabled={isEnabled}
                            >更新数据</Button>
                        }
                        {!xdzOrgIsStop &&
                            <Button
                                className= 'cost-rate-button'
                                type= 'default'
                                disabled={xdzOrgIsStop}
                                onClick={this.subSetting}
                            >科目设置</Button>
                        }
                    </span>
                </div>
            </div>
        )                           
    }


    render(){
        const { loading=false, list=[] } = this.state //data
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
                </div>
            </Layout>
        )
    }
}

export default StockAppDistributionCost



