import React from 'react'
import { Button, Layout } from 'edf-component'
import Distribution from './Distribution'
import StockAppCarryoverProductionCost from './StockAppCarryoverProductionCost'
import { transToNum, canClickTarget, getInfo, getPeriod, formatNumber } from '../../commonAssets/js/common'

const STEPS = ['step1', 'step2']

// 结转生产成本的主页面
export default class DistributionCost extends React.Component{
    constructor(props){
        super(props) 
        this.metaAction = props.metaAction
        this.component = props.component
        this.webapi = props.webapi
        this.params = props.params
        this.isCarryOverProductCost = this.params.isCarryOverProductCost  // 是否已经生成了生产成本分配表，true:已生成， fasle:未生成；若已经生成了生产成本分配表，直接跳转到“结转生产成本表”页面，如果还未生成生产成本分配表，则页面跳转到“生产成本分配”页面
        this.state = {
            list: [],
            bomBalance: 0,    //bom领料金额，从后端的接口拿的数据
            invSetInfo: {},   // 公共接口信息
            xdzOrgIsStop: props.xdzOrgIsStop,   // 企业是否停用
            step: (this.params.isCarryOverProductCost ?  1 : 0 )   // 是上下步的哪一步
        }
    }

    componentDidMount=async()=>{
        const currentOrg = this.metaAction.context.get('currentOrg')
        const newInfo = await getInfo({period: getPeriod(currentOrg)})  // getInfo 这个方法取的是 当前会计期间存货的公共信息，接受的参入是当前会计期间
        const stepVal = newInfo.isCarryOverProductCost ?  1 : 0
        const step = typeof(this.props.currentStep)!=='number' ? stepVal : this.props.currentStep
        this.setState({ step, 'invSetInfo': newInfo })
        this.saveStep(step)  // 在主页面保存当前的步骤信息
    }

    /**
     * @description: 生产成本分配表子页面数据改变触发的变化
     * @param {array} newList 生产成本分配表的数据（页面数据变化后的）
     * @param {number} bomBalance bom领料的金额
     * @return 无
     */ 
    distributionChange=(newList, bomBalance)=>{
       this.setState({list: newList, bomBalance: bomBalance || 0})
       this.saveData(null, null)
    }

     /**
     * @description: 把当前的页面的数据保存到父页面
     * @param {array} list 生产成本分配表的数据（页面数据变化后的）
     * @param {number} params 存货公共接口返回的公共基础信息
     * @return 无
     */ 
    saveData = (list, params)=>{
        this.props.saveData && this.props.saveData(list, params)
    }

    // 把步骤信息保存到父页面（上、下步）
    saveStep =(step)=>{
        this.props.saveStep && this.props.saveStep(step)
    }

    // 校验（在点击下一步的时候，先对“生产成本分配表”数据进行保存，以下的校验就是针对请求提交前，“生产成本分配表”的数据信息校验）
    checkForm = (list) => {
        let canSave = true,  // 是否能保存
            errorTips,       // 错误时的提示信息
            checkList = []   // 校验后生成的可以保存的数据
        let currentCostTotal = 0,    // 本期结转金额合计
            materialCurrentCost= 0,  // 直接材料本期结转金额
            { bomBalance } = this.state  // bom领料金额

        checkList = list.map(v => {
            v.code = (v.code != undefined && v.code != null) ? v.code : null
            v.name = (v.name != undefined && v.name != null) ? v.name : null
            v.isCompletion = (v.isCompletion != undefined && v.isCompletion != null) ? v.isCompletion : null
            v.lastAmount = transToNum(v.lastAmount) || 0    // 期初余额（上期结余）
            v.currentAmount = transToNum(v.currentAmount) || 0  // 本期发生
            v.currentCost = transToNum(v.currentCost) || 0      // 本期结转
            v.currentBalance = transToNum(v.currentBalance) || 0  // 本期结余

            currentCostTotal = parseFloat( (currentCostTotal + v.currentCost).toFixed(2) )  // 累计算出“直接材料”、“直接人工”、“制造费用”、“其他费用”四项的本期结转金额合计
            // 校验，“直接材料”、“直接人工”、“制造费用”、“其他费用”四项的本期结转金额都不能为0
            if (v.lastAmount<0 || v.currentAmount<0 || v.currentCost<0 || v.currentBalance < 0) {
                canSave = false 
                errorTips = '数据不能小于0！'    
            }
            if(v.code==='materialCostAccount'){  // 直接材料的本期结转金额
                materialCurrentCost = v['currentCost']
            }
            return v
        })
        
        if (!parseFloat(currentCostTotal)) {
            errorTips = '本期结转合计不能为0！'
            canSave = false
        }

       if( transToNum(bomBalance)> materialCurrentCost){   
            canSave = false
            errorTips = `直接材料本期结转金额不能小于BOM领料金额【${formatNumber(bomBalance,2)}】`
        }

        if (!canSave) { this.metaAction.toast('error', errorTips) }
        return { canSave, checkList }        
    }

    // 保存
    handleSave = async(checkList) => {
        const hasClick = canClickTarget.getCanClickTarget('distributionSaleSave') // canClickTarget这个类用来阻止请求重复提交 
        if(!hasClick){
            canClickTarget.setCanClickTarget('distributionSaleSave', true)
            const saveParams = {}
            saveParams.period = this.params.period || ''
            saveParams.productShareDtoList = [...checkList]
            saveParams.type = this.params.endCostType=='0' ? '1' : '0' // 生产成本核算方法，0:以销定产  1:传统生产
            const saveRes = await this.webapi.stock.createProductShare({'productShareDtoMain':{...saveParams}})  // 生成“生产成本分配表”
            canClickTarget.setCanClickTarget('distributionSaleSave', false)
            return (saveRes === null)
        }
    }

    // 切换上、下步
    switchStep = async()=> {
        let{ step, list=[], xdzOrgIsStop } = this.state
        const current = step == 0 ? 1 : 0 
        if(STEPS[step]==='step1' && !xdzOrgIsStop){  // 如果当前是第一步并且是未停用客户，准备切换下一步
            const {canSave, checkList} = await this.checkForm(list) 
            if(!canSave) return 
            const ret = await this.handleSave(checkList)
            if(ret) this.setState({step: current})   
        }else{
            this.setState({step: current})
        }
        this.saveStep(current)
    }

    render(){
        const {xdzOrgIsStop, invSetInfo={}} = this.state
        const currentStep = STEPS[this.state.step]  // 当前是哪一步
        return (
            <Layout className='ttk-stock-distribition'>
                   <h1 className={`distribution-title ${currentStep}`}></h1>
                   {
                        (currentStep===STEPS[0]) ?  // 如果当前是第一步，则进入“生产成本分配表”页面
                        <Distribution
                            metaAction = { this.metaAction }
                            component = { this.component}
                            webapi = { this.webapi }
                            params = { this.params }
                            store = {this.props.store}
                            xdzOrgIsStop = {xdzOrgIsStop}  // 企业是否已经停用
                            invSetInfo={invSetInfo}        //存货公共接口信息
                            distributionChange = {this.distributionChange}
                        ></Distribution>
                    : 
                    //如果当前是第二步，则进入“结转生产成本表”页面
                        <StockAppCarryoverProductionCost
                            metaAction = { this.metaAction }
                            component = { this.component}
                            webapi = { this.webapi }
                            params = { this.params }
                            store = {this.props.store}
                            xdzOrgIsStop={xdzOrgIsStop}  // 企业是否已经停用
                            storeState={this.props.storeState}  // “结转生产成本表”页面数据变化后保存在 主页面的state的信息，如果是首次进入，则它的值是undefind
                            storeParams ={this.props.storeParams} // “结转生产成本表”页面数据变化后保存在 主页面的存货公共接口的信息，如果是首次进入，则它的值是undefind 
                            invSetInfo={invSetInfo}    // 存货公共接口信息
                            saveData={this.saveData}
                        ></StockAppCarryoverProductionCost>
                    
                   }
                   
                   <div className="distribution-footer">
                       {
                           // "上一步" 或是 "下一步" 按钮显示
                           (currentStep===STEPS[0]) ?
                                <Button type="primary" onClick={this.switchStep}>下一步</Button>
                            :
                                <Button type="primary" onClick={this.switchStep}>上一步</Button>
                       }  
                   </div>
            </Layout>
        )
    }
}

