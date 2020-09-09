import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Modal } from 'antd'
import { Button, Layout, Input as EdfInput, Tooltip } from 'edf-component'
import {debounce} from '../common/js/util'
import VirtualTable from '../../../invoices/components/VirtualTable'
import StockBlockSubjectMatch from '../StockBlockSubjectMatch'
import utils from 'edf-utils'
import moment from 'moment'
import { 
    getInfo, 
    formatSixDecimal, 
    transToNum,
    stockLoading, 
    addEvent, 
    removeEvent, 
    deepClone,
    canClickTarget,
    setListEmptyVal,
    getPeriod,
    HelpIcon,
    formatNumber,
    numFixed
} from '../../commonAssets/js/common'
import { productionCostTable } from './staticField'

class StockAppCarryoverProductionCost extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
			loading: false,
			isGenVoucher: false,  // 是否已结账
			tableOption: {
                x: 1400,
                y: 800
            },
            searchVal: '',
			inventoryClass: [],   // 存货类型（高级筛选——类型下拉）
            list: [],
            copyList: [],
            month: "",
            // isVoucher: false,
            xdzOrgIsStop: props.xdzOrgIsStop,  // 客户是否已停用
            voucherId: '',           // 凭证id，是否已经生成了凭证
            isGenVoucher: false,
            isCarryOverMainCost: false,
            isCarryOverProductCost: false	
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
        this.component = props.component
        this.params = props.params || {}
        this.sumWidth = 1165 // 初始化时表格的所有的列的宽度之和
        this.colAmount = 8   // 表格需要弹性计算宽度的列数
        this.tableField = deepClone(productionCostTable)
        const {
            enableBOMFlag, // 是否启用了bom设置： true——已启用， false——未启用
            endCostType    // 出库成本核算方式： 1——传统生产， 0——以销定产
        } = this.params  
        if(enableBOMFlag==1 && endCostType==1){  // 如果是传统生产，并且该企业启用了BOM设置，那么需要多添加一列“BOM材料”
            this.colAmount += 1
            this.sumWidth += 100

            this.tableField.forEach(v=>{
                if(v.key=='costItems' && !(v.children[0].dataIndex==='bomMaterialFee')){
                    v.children.splice(0, 1, {
                        title: 'BOM材料',
                        key: 'bomMaterialFee',
                        dataIndex: 'bomMaterialFee',
                        width: 100,
                        align: 'right',
                        sum: true,
                        format: 2
                    },{
                        title: '非BOM材料',
                        key: 'materialFee',
                        dataIndex: 'materialFee',
                        width: 120,
                        align: 'right',
                        sum: true,
                        format: 2
                    })
                }
            }) 
        }
    }

    componentDidMount = async() =>{
        addEvent(window, 'resize', ::this.resizeTable)
        this.resizeTable()
        if(!this.props.storeState){  // 如果父页面有保存state数据，
            await this.updateStatus()
            await this.load()
        
        }else{
            this.setState({
                ...this.props.storeState,
                loading: false
            })
            this.params = this.props.storeParams
        } 
    }

    componentWillUnmount=()=>{
        this.tableField = []
        removeEvent(window, 'resize', this.resizeTable)
        this.props.saveData && this.props.saveData(
            this.copyData(this.state), 
            this.copyData(this.params)
        )
    }

    copyData = (data) =>{
        data = JSON.parse(JSON.stringify(data))
        return data
    }

    // 存货列表
    load = async() => {
        let mainList = [], inventoryClass,  voucherId = ''//, isVoucher = false
        const currentOrg = this.metaAction.context.get('currentOrg')
        let period = getPeriod(currentOrg)
        this.setState({
            month: period,
            loading: true
        })
        const { 
            endCostType, 
            enableBOMFlag=0, 
            auxiliaryMaterialAllocationMark=0,
            isGenVoucher,
            isCarryOverMainCost,
            isCarryOverProductCost
        } = this.params 

        // 结转生产成本
        const res = await this.webapi.stock.getCarryProduceCostSheetDtoList({ 
            'period': period, 
            'type': endCostType,
            'enableBOMFlag': enableBOMFlag, //1 已开启 0 未开启 
            'auxiliaryMaterialAllocationMark': auxiliaryMaterialAllocationMark //辅料分摊标志：1是 0 否
        })

        if (res) {   // 无需判断数据来源endNumSource 是以销定产还是手工，因为如果是手工的话，后端直接返回空数组列表
            if (res.produceCostSheetDtoList && res.produceCostSheetDtoList.length !== 0) {
                mainList = res.produceCostSheetDtoList.map(v=>{
                    v.originRate = (v.costRate+'').slice(0)
                    v.costRate = numFixed( (v.costRate*100), 4)
                    return v
                })
            }
            inventoryClass = res.classList || []
            inventoryClass.splice(0, 0, { inventoryClassId: '', inventoryClassName: '全部', isCompletion: false })
            // isVoucher = res.isVoucher
            voucherId = res.voucherId
        }
        
        const totalSales = this.calColumnTotal(mainList)
        this.setState({
            list: mainList,
            copyList: deepClone(mainList),
            invSet: {...this.params},
            totalSales,
            // isVoucher,
            voucherId,
            inventoryClass,
            isGenVoucher,
            isCarryOverMainCost,
            isCarryOverProductCost,
            loading: false
        }) 
    }

    // 过滤查找
    filterCallback = (v) => {
        const { name, inventoryClassId } = v
        const { copyList= [] } = this.state
        let allList = []
        copyList.filter(v => {
            if (name && inventoryClassId) {
                if (
                        (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1) 
                        &&  v.inventoryClassId.toString() === inventoryClassId.toString()
                    ){
                    allList.push(v)
                }
            } else if (name && !inventoryClassId) {
                if ( (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1) ) {
                    allList.push(v)
                }
            } else if (!name && inventoryClassId) {
                if (v.inventoryClassId.toString() === inventoryClassId.toString()) {
                    allList.push(v)
                }
            } else {
                allList.push(v)
            }
        })
        this.setState({
            list: allList,
            searchVal: name
        })
    }

    // 科目匹配
    matchSubject = async() => { 
        const {list=[]} = this.state
        const inventorys = list.map(v => ({'inventoryId': v.inventoryId}))
        const resp = await this.webapi.stock.getInventoryGoods({inventorys})  // 获取科目匹配的存货列表
        let matchSubjectResult = false
        if (resp) {
            let hasUnMatched = resp.some(v => !v.inventoryRelatedAccountId)
            const ret = (!hasUnMatched) ? true : false
            if(!!hasUnMatched) this.metaAction.toast('warning', '存货科目未设置，请先进入【存货档案】设置科目!') 
            return ret
        }
        return matchSubjectResult
    }


    // 生成凭证
    generateVoucher = async(event) => {
        const ret = this.checkList()
        if(ret){
            const hasClick = canClickTarget.getCanClickTarget('voucher')  
            if(!hasClick){
                canClickTarget.setCanClickTarget('voucher', true)
                this.setState({loading: true})
                const matchSubjectResult = await this.matchSubject() 
                
                if (matchSubjectResult) {
                    const {flag, subjectConfig} = await this.hasStockSubject(subjectConfig) // 检测存货科目
                    if(flag){
                        await this.createBillTitlePZ()
    
                    }else{
                        this.setState({loading: false})
                        canClickTarget.setCanClickTarget('pickingGenVoucher', null)
                        const ret = await this.metaAction.modal('show',{
                            title: `科目设置`,
                            okText: '确定', 
                            cancelText: '取消',
                            wrapClassName: 'modal-padding-20-30',
                            width: 900,
                            height: 400,
                            bodyStyle: { padding: '20px 20px 15px'},
                            children: (
                                <StockBlockSubjectMatch
                                    metaAction={ this.metaAction }
                                    webapi = { this.webapi }
                                    store={ this.component.props.store }
                                    component={ this.component }
                                    subjectMatches={ subjectConfig }
                                />
                            )
                        })
                        if(ret){
                            await this.createBillTitlePZ()
                        }
                    }
                } 
                this.setState({loading: false})
                canClickTarget.setCanClickTarget('voucher', null)
            }
        } 
    }

    // 调用生成凭证接口
    createBillTitlePZ= async()=>{
        this.setState({loading: true})
        const currentOrg = this.metaAction.context.get('currentOrg')
        const { copyList=[] } = this.state
        const allList = deepClone(copyList)
        const stockDtoMain = {}
        stockDtoMain.type = this.params.endCostType   // 必传，生产核算方式 1：传统生产， 2：以销定产
        stockDtoMain.isExist = false
        stockDtoMain.isVoucher = false     
        stockDtoMain.period = getPeriod(currentOrg)    // 必传，当前会计期间
        stockDtoMain.produceCostSheetDtoList = allList.map(item => {
            item.num = transToNum(item.num)  // 数量
            item.costRate = ( typeof(item.costRate)=='string' && (item.costRate.indexOf('%')> -1) ) 
                        ? numFixed( (item.costRate.slice(0,-1)/100), 6 )
                        : numFixed( (item.costRate/100), 6 )
            item.putInNum = transToNum(item.putInNum) 
            item.materialFee = transToNum(item.materialFee) 
            item.personCost = transToNum(item.personCost)
            item.directCost = transToNum(item.directCost)
            item.otherexpenses = transToNum(item.otherexpenses)
            item.price = transToNum(item.price) // 金额
            item.putInCost = transToNum(item.putInCost)
            return item
        })
        stockDtoMain.produceCostSheetDtoList = setListEmptyVal(stockDtoMain.produceCostSheetDtoList)
        const ret = await this.webapi.stock.createPZ({stockDtoMain})
        if (ret === null) { 
            await this.updateStatus()
            this.metaAction.toast('success', '生成凭证成功')
            await this.load()  
        }
        this.setState({loading: false})
    }

    /**
     * @description: 更新存货公共接口的信息，保存到state当中
     * @param 无
     * @return {object} newInfo 存货公共接口最新的状态信息
     */ 
    updateStatus = async()=>{
        this.setState({loading: true})
        const currentOrg = this.metaAction.context.get('currentOrg')
        const newInfo = await getInfo({period: getPeriod(currentOrg)})
        this.params = Object.assign({}, this.params, newInfo)
        this.setState({
            loading: false,
            invSet: {...newInfo},
            isGenVoucher: this.params.isGenVoucher,   // 该企业是否已结账
            isCarryOverMainCost: this.params.isCarryOverMainCost,  //该企业是否 已经生成了销售出库单
            isCarryOverProductCost: this.params.isCarryOverProductCost, // 该企业是否 已经生成了结转生产成本凭证
        })
        return newInfo
    }

    /**
     * @description: 校验存货科目是否已经全部匹配
     * @param 无
     * @return {string} flag 目是否已经全部匹配
     * @return {string} subjectConfig 科目匹配页面的信息
     */ 
    hasStockSubject= async()=>{
        this.setState({loading: true})
        const getStockAcctCodeReq= this.webapi.stock.getStockAcctCode({"module": "cost"})   // 存货成本科目匹配列表数据
        let subjectConfig = await this.webapi.stock.queryAcctCodeByModule({ module: 2})     // 科目匹配select.option的数据
        let stockAcctCode = await getStockAcctCodeReq
        this.setState({loading: false})
        let flag = false  // 科目是否已经全部匹配
        // 以下校验的目的是：判断已匹配好的科目，是否因为存货档案被停用而清空，如果清空的话，页面要置空，并且要弹出科目匹配页面
        if(subjectConfig && Array.isArray(subjectConfig)){
            const mark = subjectConfig.some(v=>{
                const index = stockAcctCode.findIndex(o=>o.id==v.destAcctId)
                return (index<0)
            })
            flag = !mark
        }
        return {flag, subjectConfig}
    }

    // 校验，如果页面中有错误的提示，则不能保存，返回flag为false
    checkform = () => {
        const { list=[], copyList=[] } = this.state
        let flag = true
        const checkedList = copyList.map((item) => {  
            item.matDisCofError = !item.matDisCof
            item.numError = !item.num
            if (!!item.matDisCofError || !!item.numError) { flag = false }
            return item
        })
        this.setState({
            list: checkedList,
            copyList: deepClone(checkedList)
        })
        return { flag, checkedList }
    }

    // 查看凭证
    checkoutVoucher = async()=>{
        const { voucherId } = this.state
          const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            style: { top: 5 },
            width: 1200,
            bodyStyle: { paddingBottom: '0px' },
            className: 'stock-carry-batchCopyDoc-modal',
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge', {
                store: this.component.props.store,
                initData: {
                    type: 'isFromXdz',
                    id: voucherId,
                }
            })
        })
    }

     // 删除凭证
     deleteVoucher = async() => {
        const currentOrg = this.metaAction.context.get('currentOrg')
        const that = this
        Modal.confirm({
            content: '该凭证将删除，请确认！',
            okText: '确定',
            cancelText: '取消',
            onOk() { 
                const params = { period: getPeriod(currentOrg), type: 0 } //-- 1主营成本 0 生产成本
                new Promise(async(resolve,reject)=>{
                    that.setState({loading: true})
                    const resp = await that.webapi.stock.deletePZ(params)
                    resolve(resp)
                    that.setState({loading: false})
                }).then(async(res)=>{
                    if(res===null){ 
                        const invSet = await that.updateStatus()
                        that.metaAction.toast('success','凭证删除成功！')   
                    }
                })
            },
            onCancel() {},
        })
    }

    // 返回到存货核算页面
    handleReturn = () => {
            this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-carryOver-production-cost')
        this.component.props.setPortalContent 
            && this.component.props.setPortalContent('存货核算', 'ttk-stock-app-inventory')
    }

    // 计算页面的百分比合计数
    calPercent = ()=>{
        const { list=[], copyList=[] } = this.state
        const percent = copyList.reduce((total, item)=>{
            total = numFixed( (transToNum(item.costRate) + total), 4)  // 百分比保留6这个是百分比的形式，所以这里是4位小数
            return transToNum(total)
        },0)
        return percent
    }

    // 校验百分比列不能为0，不能超过百分百
    checkList = ()=>{
        const { copyList=[] } = this.state
        const ret = copyList.some(v=>(transToNum(v.costRate)===0))
        if(ret){
            this.metaAction.toast('warning', '百分比不能为0，请修改！')
            return  false
        }
        const percent = this.calPercent()
        if(percent!==100){
            this.metaAction.toast('warning', '百分比合计不等于100%，请修改后操作！')
            return false
        }
        return percent  // 返回这个页面的百分比数合计
    }


    /*重新计算——按钮事件*/
    reCalculate = ()=>{
        let { list=[], totalSales={}, copyList=[] } = this.state       
        const ret = this.checkList()

        if(ret){
            const { endCostType } = this.params
            const {
                materialFeeT,
                personCostT,
                directCostT,
                otherexpensesT,
                putInCostT,
            } = totalSales
    
            let materialSum=0, personSum=0, directSum= 0, otherExpenseSum = 0, putInCostSum = 0
            if(endCostType===1){  // 传统生产
                copyList = copyList.map((item, index)=>{
                    item.materialFee = parseFloat(item.materialFee)      // 直接材料
                    item.personCost = parseFloat(item.personCost)        // 直接人工
                    item.directCost = parseFloat(item.directCost)        // 制造费用
                    item.otherexpenses = parseFloat(item.otherexpenses)  // 其他费用
                    item.putInCost = parseFloat(item.putInCost)          // 完工入库成本
                    item.price = parseFloat(item.price )                 // 单价
    
                    // 非最后一条存货 分别用百分比乘以各费用金额合计算出每个存货各项费用的资金
                    // 最后一个存货，各项费用的和等于各项费用的综合分别减去其他存货的费用合计，倒挤算出最后一条存货的各个费用的金额
                    if(index !== (copyList.length-1)){
                        item.materialFee = numFixed(materialFeeT * ( numFixed(item.costRate/100, 6)), 2 )
                        item.personCost = numFixed(personCostT * ( numFixed(item.costRate/100, 6)), 2 )
                        item.directCost = numFixed(directCostT * (numFixed(item.costRate/100, 6)), 2 )
                        item.otherexpenses = numFixed(otherexpensesT * ( numFixed(item.costRate/100, 6)), 2 )
                        // 每个存货的完工入库金额等于四项金额的合计
                        item.putInCost = numFixed( (item.materialFee + item.personCost + item.directCost + item.otherexpenses + item.bomMaterialFee), 2 ) 
                        item.price = numFixed( (item.putInCost / item.putInNum), 6 )   // 用金额和数量反算单价
                        
                        materialSum= numFixed( (materialSum + item.materialFee), 2 )
                        personSum= numFixed( (personSum + item.personCost), 2 )
                        directSum= numFixed( (directSum + item.directCost), 2 )
                        otherExpenseSum = numFixed( (otherExpenseSum + item.otherexpenses), 2 )
                        putInCostSum = numFixed( (putInCostSum + item.putInCost), 2 )           
                    
                    }else{  // 最后一个存货的各项金额减去其余存货金额合计之差，即倒挤算出
                        item.materialFee = numFixed( (materialFeeT - materialSum), 2 ) 
                        item.personCost = numFixed( (personCostT - personSum), 2 ) 
                        item.directCost = numFixed( (directCostT - directSum), 2 ) 
                        item.otherexpenses = numFixed( (otherexpensesT - otherExpenseSum), 2 )
                        item.putInCost = numFixed( (putInCostT - putInCostSum), 2 ) 
                        item.price = numFixed( (item.putInCost / item.putInNum), 6 )     
                    } 
                    return item
                })
    
            }else{  // 以销定产
    
                copyList = copyList.map((item, index)=>{
                    item.materialFee = parseFloat(item.materialFee)  
                    item.personCost = parseFloat(item.personCost)
                    item.directCost = parseFloat(item.directCost)
                    item.otherexpenses = parseFloat(item.otherexpenses)
                    item.putInCost = parseFloat(item.putInCost) 
                    item.price = parseFloat(item.price )
                    // 计算方式：
                    // 非最后一条存货 已知每个存货的完工入库金额，用百分比分别算出“直接人工”、“制造费用”、“其他费用”后，用完工入库金额减去这三项的金额之和，得出直接材料的金额
                    // 最后一个存货，各项费用的和等于各项费用的综合分别减去其他存货的费用合计，倒挤算出最后一条存货的各个费用的金额
                    if(index !== (copyList.length-1)){
                        item.personCost = numFixed( (personCostT * numFixed(item.costRate/100, 6) ), 2 )
                        item.directCost = numFixed( (directCostT * numFixed(item.costRate/100, 6) ), 2 )
                        item.otherexpenses = numFixed((otherexpensesT *  numFixed(item.costRate/100, 6) ), 2 )
                        const sum = numFixed( (item.personCost + item.directCost + item.otherexpenses), 2)
                        item.materialFee = numFixed((item.putInCost - sum), 2)
    
                        materialSum= numFixed( (materialSum + item.materialFee), 2 )
                        personSum= numFixed( (personSum + item.personCost), 2 )
                        directSum= numFixed( (directSum + item.directCost), 2 )
                        otherExpenseSum = numFixed( (otherExpenseSum + item.otherexpenses), 2 )
                    
                    }else{  // 最后一个存货的金额都是由总金额减去前面所有的存货的每项金额合计算出的
                        item.materialFee = numFixed( (materialFeeT - materialSum), 2 ) 
                        item.personCost = numFixed( (personCostT - personSum), 2 ) 
                        item.directCost = numFixed( (directCostT - directSum), 2 ) 
                        item.otherexpenses = numFixed( (otherexpensesT - otherExpenseSum), 2 )   
                    }  
                    return item
                })
            }
            if(list.length===copyList.length){
                list = deepClone(copyList)
    
            }else{
                list = list.map(v=>{
                    const idx = copyList.findIndex(item=>item.inventoryId===v.inventoryId)
                    v = {...copyList[idx]}
                    return v
                })
            }
    
            this.setState({
                list,
                copyList
            })
        }
    }

    // 百分比输入变化
    percentChange = debounce((e, index, dataIndex)=>{
        let { list=[], copyList=[] } = this.state
        list[index][dataIndex] = e
        const id = list[index]['inventoryId']
        copyList = copyList.map(v=>{
            if(v.inventoryId===id){
                v[dataIndex] = e
            }
            return v
        })
        this.setState({
            list,
            copyList
        })
    }, 500)

    //渲染表格
    renderColumns = () => {
        const {isCarryOverMainCost, isCarryOverProductCost, isGenVoucher} = this.state
        this.isCarryOverMainCost = isCarryOverMainCost
        this.isCarryOverProductCost = isCarryOverProductCost
        this.isGenVoucher = isGenVoucher
        const columns = this.tableField.map(v=>{
            const colStyle = {
                'overflow': 'hidden',
                'textOverflow': 'ellipsis',
                'whiteSpace': 'nowrap'
            }

            if(v.dataIndex==='costRate'){
                v.render = (text, record, index)=>{
                    const txt = Number(text) && Number(text) || ''
                    let ele
                    // 已经生成了销售出库单、或已结转了生产成本，或已结账，那么百分比列不可编辑
                    if(this.isCarryOverMainCost|| this.isCarryOverProductCost || this.isGenVoucher){ 
                        ele = <div style={{...colStyle}} title={txt +' %'}> { txt } % </div>
                    
                    }else{  // 除了以上三种情况外，百分比列可编辑
                        const styleClass = txt ? " cost-rate-input " : "borderRed cost-rate-input"  
                        ele = <div className='carry-over-production-costRate'>
                            <EdfInput.Number 
                                className={styleClass}  
                                regex='^([0-9]+)(?:\.[0-9]{1,4})?$' 
                                title={txt} 
                                value={txt} 
                                minValue={0}
                                maxValue={100}
                                placeholder="" 
                                onChange={ (e) => this.percentChange(e, index, v.dataIndex) } 
                            /> 
                            <i className="cost-rate-sign">%</i>    
                        </div>
                    }
                    return ele
                }
                
            }else if(v.children){
                v.children.forEach(el=>{
                    if(['putInNum', 'price'].includes(el.dataIndex)){
                        const textAlign = el.dataIndex === 'putInNum' ?  'left' : 'right'
                        el.render = (text, record, index)=>{
                            const txt = formatSixDecimal(text)
                            return <div style={{...colStyle, textAlign}} title={txt}> { txt } </div>
                        }
        
                    }else if(el.dataIndex==='putInCost'){
                        el.render = (text, record, index)=>{
                            const txt = utils.number.format(text,2)
                            return <div style={{...colStyle}} title={txt}> { txt } </div>
                        }
        
                    }else{
                        el.render = (text, record, index)=>{
                            const txt = utils.number.format(text,2)
                            return <div style={{...colStyle}} title={txt}> { txt } </div>
                        }
                    }
                })
            }
            return v
        }) 
        return columns
    }

    // 列合计
    calColumnTotal = (list) => {
        let putInNumT = 0,          // 完工入库数
            materialFeeT = 0,       // 直接材料金额合计
            bomMaterialFeeT = 0,    // bom材料金额合计
            personCostT = 0,        // 直接人工合计
            directCostT = 0,        // 制造费用合计
            otherexpensesT = 0,     // 其他费用合计
            putInCostT = 0,         // 完工入库金额
            rateTotal = 0           // 百分比合计

        list.map(v => {
            putInNumT += transToNum(v.putInNum),
            materialFeeT += transToNum(v.materialFee),
            bomMaterialFeeT += transToNum(v.bomMaterialFee),
            personCostT += transToNum(v.personCost),
            directCostT += transToNum(v.directCost),
            otherexpensesT += transToNum(v.otherexpenses),
            putInCostT += transToNum(v.putInCost)
            rateTotal += transToNum(v.costRate)
        })

        return { putInNumT, bomMaterialFeeT, materialFeeT, personCostT, directCostT, otherexpensesT, putInCostT, rateTotal }
    }

    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-carryOver-product-cost-main")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight - 88) || 0
        // const obj = { tableW, tableH }
        let { tableOption={} } = this.state
        this.computeColWidth(tableW)
        this.setState({
            tableOption: {
                ...tableOption,
                x: tableW,
                y: tableH
            }
        })
    }


    /**
     * @description: 计算表格每列的列宽
     * @param {number} tablew 表格父元素的宽度
     * @return {number} this.sumWidth 表格元素的计算后的宽度
     */ 
    computeColWidth = tableW => {
        let increment = Math.floor((tableW - this.sumWidth) / this.colAmount)  // 算出页面多出来的可以分配给每一列的宽度数
        let sumWidth = 0
        for (const item of this.tableField){
            if (item.children) {
                for (const el of item.children) {
                    el.width = el.width + increment
                    sumWidth += el.width
                }
            } else{
                item.width = item.flexGrow ? (item.width + increment) : item.width  // 有flexGrow属性的列，则添加宽度
                sumWidth += item.width
            }
        }
        this.sumWidth = sumWidth
        return this.sumWidth
    }

     /**
     * @description: 表格合计行的渲染
     * @param {number} tablew 表格父元素的宽度
     * @return {reactElement}  合计行元素
     */ 
    renderSummaryRow = () => {
        const { list=[], totalSales={} } = this.state
        const rateTotal = this.calPercent()  // 计算百分比合计数
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                const colStyle={
                    borderRight: '1px solid #d9d9d9',
                    padding: '0 10px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }
                const borderRight = '1px solid #d9d9d9'

                let rows = columns.map((item,index)=>{
                    const { dataIndex, width, flexGrow, format, sum} = item   
                    let txt = dataIndex==='costRate' ? rateTotal
                                : sum
                                ? formatNumber(totalSales[`${dataIndex}T`], format)
                                : ''

                    if(index == 0) {
                        return (<div style={{ width, borderRight, textAlign: 'center' }}>合计</div>)
                        
                    }else if(flexGrow){
                        return ( <div style={{ width, borderRight, flexGrow}}> { txt }</div>)
                    
                    } else if(dataIndex==='costRate'){

                        return ( <div style={{ width, borderRight, flexGrow}}> 
                            { parseFloat(txt)===100 || parseFloat(txt)===0 ? 
                                <div className="cost-rate-txt" title={txt + '%'}>{txt} %</div>
                                :
                                <Tooltip 
                                    placement='bottom' 
                                    title={'百分比合计不等于100%'} 
                                    arrowPointAtCenter={true} 
                                    overlayClassName='stock-warning-tooltip'> 
                                        <div className="cost-rate-txt warning" title={txt + '%'}>{txt} %</div>
                                </Tooltip>
                            }
                        </div>)

                    }else {
                        let textAlign = dataIndex.includes('Num') ? 'left' : 'right'
                        return (
                            <div style={{ width, textAlign, ...colStyle }} title={txt}> {txt} </div>
                        )
                    }
                })

                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }

        return summaryRows
    }

      // 帮助的图标和说明
      renderHelp = () => {
        let text =  <div style={{lineHeight: '25px'}}>
            <div>修改百分比，且修改后百分比合计为100%，</div>
            <div>需要重新计算成本</div>
        </div>            
        return  HelpIcon(text, 'bottom')
    }


    renderHeader = () =>{
        const { 
            inventoryClass, month, isGenVoucher, 
            isCarryOverMainCost, isCarryOverProductCost, 
            searchVal, xdzOrgIsStop
        } = this.state 

        return(
            <div className='ttk-stock-app-carryOver-product-cost-header'>
                <div className="ttk-stock-app-carryOver-product-cost-header-others">
                    <div className="ttk-stock-app-carryOver-product-cost-header-others-left">
                        <span className="back-btn" onClick={this.handleReturn}></span>
                        <div className="carryOver-filter-container">
                            <AppLoader
                                className= 'filter-com'
                                component= 'AppLoader'
                                name= 'ttk-stock-app-completion-warehousing-filter'
                                store = {this.component.props.store}
                                searchVal={searchVal}
                                store = {this.props.store}
                                callback= {(v)=>{this.filterCallback(v)}}
                                selectOptions= {inventoryClass}
                            ></AppLoader>
                        </div>
                        <span className='period'>
                            月份：{ month }
                        </span>
                    </div>
                    {
                        !xdzOrgIsStop && 
                        <div className="ttk-stock-app-carryOver-product-cost-header-others-right">
                            {
                                !isCarryOverProductCost ? 
                                    <span>
                                        {this.renderHelp()}
                                        <Button
                                            className= 'genarate-btn'
                                            type= 'primary'                            
                                            disabled= { isGenVoucher || isCarryOverMainCost}
                                            onClick= { this.reCalculate }>
                                            重新计算
                                        </Button>
                                        <Button
                                            className= 'genarate-btn'
                                            type= 'primary'                            
                                            disabled= { isGenVoucher }
                                            onClick= { this.generateVoucher }>
                                            生成凭证
                                        </Button>
                                    </span>  
                                :
                                (
                                    <span>
                                        <Button
                                            className= 'checkoutVoucher-btn'
                                            type= 'primary'
                                            onClick= {this.checkoutVoucher}>
                                            查看凭证
                                        </Button>
                                
                                        <Button
                                            className= 'deleteVoucher-btn'
                                            type= 'default'
                                            disabled= { isGenVoucher || isCarryOverMainCost }
                                            onClick= { this.deleteVoucher }>
                                            删除凭证
                                        </Button>
                                    </span>
                                )
                            }                      
                        </div>
                    } 
                </div>
            </div>
        )
    }

    renderTable=()=>{
        const { list=[], tableOption={} } = this.state //data
        return (
            <div className='ttk-stock-app-carryOver-product-cost-main mk-layout'>
                <VirtualTable
                    columns={this.renderColumns()}
                    dataSource={list}
                    key='11'
                    rowKey="inventoryId"
                    style={{ width: `${tableOption.x}px` }}
                    scroll={{ y: tableOption.y+3, x: tableOption.x}}
                    summaryRows={this.renderSummaryRow()}
                    bordered
                    height={1000}
                    width={tableOption.x+10}
                    headerHeight={78}
                    allowResizeColumn
                />
            </div>
        )
    }

    render(){
        const { loading=false} = this.state //data
        return(
            <React.Fragment>
                <Layout className='ttk-stock-app-carryOver-product-cost'>
                    { loading && <div className='ttk-stock-app-spin'>{ stockLoading() }</div> }
                    { this.renderHeader() }
                    { this.renderTable() }
                </Layout>
                
            </React.Fragment>
        )
    }
    
}

export default StockAppCarryoverProductionCost



