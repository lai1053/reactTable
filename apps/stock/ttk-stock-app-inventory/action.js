import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import utils from 'edf-utils'
// import { moment as momentUtil } from 'edf-utils'
import moment from 'moment'
import { Tooltip, Icon } from 'edf-component';
import { stockLoading } from '../commonAssets/js/common'
// import StockAppBySaleOut from '../components/StockAppBySaleOut'
// const colKeys = ['id', 'name', 'parentId', 'dependentId', 'isEndNode']

const INVBUSSINESS = {
    0: '商业',
    1: '工业'
}

const CHECKOUTTYPE = {
    0: '全月加权',
    1: '移动加权',
    2: '销售成本率',
    3: '先进先出'
}

const ENDCOSTTYPE = {
    0: '以销定产',
    1: '传统生产'
}

const TAXPAYERTYPE = {
    2000010001: '一般纳税人',
    2000010002: '小规模纳税人',
    2000010003: '一般纳税人辅导期' 
}

/*
    @params: {
        "state": 0, --状态 0未开，1开启
        "bInveControl": 0, --是否进行负库存控制 0否 1是
        "endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
        "inveBusiness": 1, 1工业模式 0商业模式
        "enableBOMFlag",1 --是否启用BOM设置：1是；0否；
        "endCostType":0, 以销定产0、传统生产1
        "isGenVoucher":true, 是否结账，未生成 false 生成 true
        "isCompletion":true,是否本月有完工入库单 有 true 没有 false
        "isMaterial":true --本月是否领料,
        "startPeriod":"2019-09", 启用月份
        "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
        "isCarryOverProductCost":false, 结转生成凭证，未生成 false 生成 true
        "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
        "inveBusiness",1 --1工业自行生产，0 存商业
        "auxiliaryMaterialAllocationMark"1, --辅料是否分摊之BOM产品中：1是；0否；
        "isConfigureBOM":1 ,是否有配置bom 结构 1 表示有 0表示没有
        "automaticDistributionMark":1, 1为自动分配 0 为手工分配
        "thisPeriod": --修改日期起始时间
    }
*/
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        const ret = this.metaAction.context.get('currentOrg')
        injections.reduce('init', xdzOrgIsStop)
        this.load(true)
    }

    stockLoading = () => stockLoading()

    getPeriod = (isInit)=>{
        let time = ''
        const currentOrg = this.metaAction.context.get('currentOrg')
        const {name, periodDate} = currentOrg
        const sessionPeriod = sessionStorage['stockPeriod' + name]
        
        if (!isInit && (sessionPeriod != "undefined" && sessionPeriod)) {
            time = sessionPeriod
        } else {
            sessionStorage['stockPeriod' + name] = periodDate
            time = periodDate
        }

        return time
    }

    load = async (isInit) => {
        let time = this.getPeriod(isInit)
        let {name, xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        this.metaAction.sf('data.loading', true)
        const initReq = this.webapi.operation.init({ 'period': time, 'opr': 0 }) 
        const currentReq = this.webapi.operation.init({ 'period': time, 'opr': 1 })
        const queryStockAccount = this.webapi.operation.judgeHasInventoryAccountNull()
        const queryAccountReq = this.webapi.operation.queryAccount({  
            "yearPeriod": moment(time).format('YYYYMM'),  
            "isFront": "Y"  
        })
        let reqData = await initReq
        let currentReqData = await currentReq // 获取inveBusiness当前值

        reqData = {...currentReqData, state: reqData.state}  // reqData以最新月份为准，currentReqData以当前月份
        const {
            startPeriod, 
            enableBOMFlag, 
            auxiliaryMaterialAllocationMark, 
            automaticDistributionMark,
        } = reqData
        
        if (sessionStorage['stockPeriod' + name] < startPeriod) {
            sessionStorage['stockPeriod' + name] = startPeriod
            time = startPeriod
        }
        if (!sessionStorage['enableBOMFlag' + name]) {
            sessionStorage['enableBOMFlag' + name] = enableBOMFlag
            sessionStorage['auxiliaryMaterialAllocationMark' + name] = auxiliaryMaterialAllocationMark
            sessionStorage['automaticDistributionMark' + name] = automaticDistributionMark
        }
        this.motime=reqData.startPeriod//启用时间

        let resp  = {}
        if (reqData && reqData.state != 0 ) {  //存货开启后才能调用这个接口
            resp = await this.webapi.operation.getInvSetByPeroid({ period: time }) || {}
        }
    
        let openFlag = resp.state == 1 ? false : true,
            typeFlag = currentReqData.inveBusiness,  
            isIndustry = typeFlag == '1' ? true : false
        
        const queryAccount = await queryAccountReq
        // 页面标题 start
        reqData.inveBusiness = currentReqData.inveBusiness
        const {inveBusiness, checkOutType, endCostType} = reqData
        const { vatTaxpayer } = (queryAccount || {})
        const inveBusinessMethod = INVBUSSINESS[inveBusiness]  
        const checkOutMethod = CHECKOUTTYPE[checkOutType]  
        const accountType = inveBusiness == 1 ? `-${ENDCOSTTYPE[endCostType]}` : '' 
        const taxpayerType = vatTaxpayer ? `(${TAXPAYERTYPE[vatTaxpayer]})` : '' 
        let pageTitle = `${inveBusinessMethod}-${checkOutMethod}${accountType}${taxpayerType}`
        const isTips = await queryStockAccount
        // 页面标题 end
        this.injections.reduce('load', time, openFlag, typeFlag, enableBOMFlag, reqData, isIndustry, pageTitle, isTips, xdzOrgIsStop)
    }

    renderStockAccountTips = ()=>{
        return(
            <React.Fragment>
                您有存货档案的存货科目为空【 
                <span className='ttk-stock-app-inventory-stockAccount-setting'
                    onClick={()=>
                        this.openPage('存货档案', 'ttk-app-inventory-list')}
                >去设置</span>
                】
            </React.Fragment>
        )
    }

    changePeriod = (path, data) => {
        this.metaAction.sf(path, data)
        let name = this.metaAction.context.get('currentOrg').name
        sessionStorage['stockPeriod' + name] = data
        this.load()
    }
    
    disabledDate = (current) => {
        let startperiod = this.motime
        return current < moment(startperiod)
    }

    mousedown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return
        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path))
        }
        else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }

    componentWillUnMount = () => {
        this[`ttk-stock-app-carryOver-production-costClickFlag`] = null
        this[`ttk-stock-app-carryOver-mainBusiness-costClickFlag`] = null
        this[`ttk-stock-app-statements-sfc-summaryClickFlag`] = null
        this[`ttk-stock-app-statements-sfc-detailClickFlag`] = null
        this[`ttk-stock-app-statements-sales-gross-pro`] = null
        this[`ttk-stock-app-statements-production-cost`] = null
        this[`ttk-stock-app-statements-chyzzClickFlag`] = null
    }

    xiaoshou = async () => {
        this.openPage('销售收入', 'ttk-stock-app-inventory-saleOutStock')
    }
    // 其他出入库
    otherStorage = async()=>{
        this.openPage('其他出入库', 'ttk-stock-app-other-storage')
    }

    purchase = async () => {
        this.openPage('采购入库', 'ttk-stock-app-purchase')
    }
    ruku = async () => {
        this.metaAction.context.set('stockAssessmentType', '1')
        this.openPage('暂估入库', 'ttk-stock-app-inventory-assessment', { company: '1' })
    }
    chonghui = async () => {
        this.metaAction.context.set('stockAssessmentType', '2')
        this.openPage('暂估冲回', 'ttk-stock-app-inventory-assessment', { company: '2' })
    }
    lingliao = async () => {
        const params = await this.getInfo()
        this.openPage('生产领料', 'ttk-stock-app-inventory-picking', { params: { ...params } })
    }
    BomPicking = async () => {
        this.getInfo()
        this.openPage('BOM设置', 'ttk-stock-app-inventory-BOM-picking-main')
    }
    // 出库汇总表
    ckhz = async() => { 
        const params = await this.getInfo()
        this.openPage('出库汇总表', 'ttk-stock-app-statements-ckhz', { params: { ...params } })
    }  
    
    // 入库汇总表
    rkhz = async() => { 
        const params = await this.getInfo()
        this.openPage('入库汇总表', 'ttk-stock-app-statements-rkhz', { params: { ...params } })
    }  
    // 暂估汇总表
    zghzBom = async() => { 
        const params = await this.getInfo()
        this.openPage('暂估汇总表', 'ttk-stock-app-statements-zg-summary', { params: { ...params } })
    }  
    // 暂估明细表
    zgmx = async() => { 
        const params = await this.getInfo()
        this.openPage('暂估明细表', 'ttk-stock-app-statements-zg-detail', { params: { ...params } })  
    } 

    // 获取前置信息
    getInfo = async () => {
        let {name} = this.metaAction.context.get('currentOrg')
        const selectPeriod = this.metaAction.gf('data.form.enableDate')
        const resp = await this.webapi.operation.getInvSetByPeroid({ period: selectPeriod })
        if (resp) {
            sessionStorage['isConfigureBOM' + name] = resp.isConfigureBOM
            sessionStorage['isMaterial' + name] = resp.enableBOMFlag
            sessionStorage['stockInfo' + name] = JSON.stringify(resp)
            const params = JSON.parse(JSON.stringify(resp)) || {}
            params.period = selectPeriod
            params.path = 'ttk-stock-app-inventory'
            if (!params.state) {
                this.metaAction.toast('warning', `还未开启存货科目，请先开启存货科目再进行操作！`)
                return false
            }
            return params
        } else {
            this.metaAction.toast('error', `获取账套初始化信息出错！`)
            return false
        }
    }
    // 完工入库
    warehousing = async () => {
        const params = await this.getInfo()
        if (params) {
            if (params.endCostType == 1) { // 产值百分比方式
                this.closePage('ttk-stock-app-completion-warehousing-sales-list')
                this.closePage('ttk-stock-app-completion-warehousing-sales')
                this.openPage('完工入库', 'ttk-stock-app-completion-warehousing', { params: { ...params } })
                
            } else {
                // if (params.endNumSource == 0 || params.isCompletion || params.isGenVoucher) {  // 如果数据来源是“手工录入”方式、或者已有完工入库单、又或者已经生成了凭证
                if (params.endNumSource == 0 || params.isCompletion) {  // 如果数据来源是“手工录入”方式、或者已有完工入库单、又或者已经生成了凭证
                    this.closePage('ttk-stock-app-completion-warehousing-sales')
                    this.closePage('ttk-stock-app-completion-warehousing')
                    this.openPage('完工入库', 'ttk-stock-app-completion-warehousing-sales-list', { params: { ...params } })
    
                } else {
                    this.closePage('ttk-stock-app-completion-warehousing-sales-list')
                    this.closePage('ttk-stock-app-completion-warehousing')
                    this.openPage('完工入库', 'ttk-stock-app-completion-warehousing-sales', { params: { ...params } })
                
                }
            }
        }
    }

    closePage = (pageName)=>{
        this.component.props.onlyCloseContent && this.component.props.onlyCloseContent(pageName)
    }

    openPage = (character, pageName, param) =>{
        this.component.props.onlyCloseContent && this.component.props.setPortalContent(character, pageName, param)
    }

    // 成本分配
    distributionCost = async () => {
        const params = await this.getInfo()
        if (params) {
            if (!params.isCompletion) { // 如果还没有完工入库单
                this.metaAction.toast('warning', '本月还未生成完工入库单，请先成完工入库单再进行操作！')
                return
            }
            let appName = 'ttk-stock-app-distribution-production-cost-sales'
            let closeApp = 'ttk-stock-app-distribution-production-cost'
            if(params.endCostType == 1){  //  传统生产，endCostType:1 
                appName = 'ttk-stock-app-distribution-production-cost'
                closeApp = 'ttk-stock-app-distribution-production-cost-sales'
            }
            this.closePage(closeApp)
            this.openPage('生产成本分配', appName, { params: { ...params } })
        }
    }

    // 结转制造费用
    manufacturingCost = async () => {
        let date = this.metaAction.gf("data.form.enableDate")
        date = date.split("-")
        let reqObj = {
            year: date[0],
            month: date[1],
            businessTypeId: 5000040022
        }
        const resp = await this.webapi.operation.queryBuBusinessType(reqObj)
        if (resp) {
            if (resp.docId) {
                const ret = await this.metaAction.modal('show', {
                    title: '查看凭证',
                    style: { top: 5 },
                    width: 1200,
                    bodyStyle: { paddingBottom: '0px' },
                    className: 'batchCopyDoc-modal',
                    okText: '保存',
                    children: this.metaAction.loadApp('app-proof-of-charge', {
                        store: this.component.props.store,
                        initData: {
                            type: 'isFromXdz',
                            id: resp.docId,
                        }
                    })
                })
            } else {
                let result = await this.metaAction.modal('show', {
                    title: '结转制造费用',
                    width: 600,
                    style: { top: 150 },
                    height: 300,
                    okText: null,
                    footer: null,
                    className: 'monthaccount-xdz-modal',
                    children: this.metaAction.loadApp('app-account-monthaccount-xdz', {
                        store: this.component.props.store,
                        initData: {
                            fromXDZmanufacturing: true,
                            year: date[0],
                            month: date[1],
                        }
                    })
                })
            }
        }
    }


    productionCost = () => { this.enterPage('ttk-stock-app-carryOver-production-cost', '结转生产成本') } // 结转生产成本
    businessCost = () => { this.enterPage('ttk-stock-app-carryOver-mainBusiness-cost', '销售出库') } // 结转主营成本
    sfcSummary = () => { this.enterPage('ttk-stock-app-statements-sfc-summary', '收发存汇总表') } // 收发存汇总表
    sfcDetail = () => { this.enterPage('ttk-stock-app-statements-sfc-detail', '收发存明细表') }  //收发存明细表
    salesGrossProfit = () => { this.enterPage('ttk-stock-app-statements-sales-gross-pro', '销售毛利率分析表') }   //毛利率分析表
    productioCostStatement = () => { this.enterPage('ttk-stock-app-statements-production-cost', '生产成本计算表') } //生产成本计算表
    chyzzBom = () => { this.enterPage('ttk-stock-app-statements-chyzz', '存货与总账对账表') }  //存货与总账    


    // 限制短时间内多次点击
    denyClick = (toPage) => {
        if (!this[`${toPage}ClickFlag`]) {
            this[`${toPage}ClickFlag`] = true
            setTimeout(() => { this[`${toPage}ClickFlag`] = false }, 3200)
            return true
        } else {
            return false
        }
    }

    enterPage = async (toPage, pageName) => {
        const canClick = this.denyClick(toPage)
        if (canClick) {
            let isIndustry =  this.metaAction.gf("data.Industry")
            const invSet = this.getInfo()
            const params = await invSet
            if (params) {
                if (toPage === 'ttk-stock-app-carryOver-production-cost') {
                    if (isIndustry) {
                        if (!params.isCompletion) {
                            this.metaAction.toast('warning', '请先进行完工入库处理！')
                            return
                        } 
                    }
                } 
                const forwardPageName = ['ttk-stock-app-carryOver-production-cost'].indexOf(toPage) > -1 ? `${pageName}` : pageName
                this.component.props.setPortalContent && this.component.props.setPortalContent(forwardPageName, toPage, { params: { ...params } })
            }
        }
    }

    // 按钮内容
    renderBtnContent = ( text, type ) => {
        let tip, isShow, data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
        const { warningTip, endCostType } = data
        if (type == 'sc' && endCostType === 1) {
            type = 'll'
        }
        tip = warningTip[type + 'Tip']
        isShow = warningTip[type + 'Flag']

        if (type == 'sc' && endCostType === 0) {
            if(warningTip.llFlag && warningTip.wgFlag) {
                tip = (
                    <React.Fragment>
                        <p>1.{warningTip.llTip}</p>
                        <p>2.{warningTip.wgTip}</p>
                    </React.Fragment>
                )
                isShow = true
            } else if(warningTip.llFlag || warningTip.wgFlag) {
                type = warningTip.llFlag ? 'll' : 'wg'
                tip = warningTip[type + 'Tip']
                isShow = warningTip[type + 'Flag']
            }
            
        }

        return (
            <React.Fragment>
                {text}
                {
                    isShow ? 
                    <Tooltip placement={'bottom'} title={tip} arrowPointAtCenter={true} overlayClassName='ttk-stock-app-inventory-warning-tip'>
                        <Icon type="info-circle" theme="filled" style={{color: '#e94033', fontSize: '14px', marginLeft: '8px'}} />
                    </Tooltip> :
                    null
                }
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

