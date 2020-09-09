import React from 'react'
import { step2Table, step3Table } from './staticField'
import utils from 'edf-utils'
import {Button} from 'antd'
import { 
    formatSixDecimal, 
    deepClone, 
    transToNum, 
    getVoucherDate, 
    timerCall, 
    stockLoading, 
    getClientSize,
    addEvent, 
    removeEvent
} from '../../commonAssets/js/common'
import { 
    Input as EdfInput,  
    Button as EdfButton,  
    Select, 
    Icon, 
    Popover, 
} from 'edf-component'
import VirtualTable from '../../../invoices/components/VirtualTable'
import InputWithTip from '../../components/InputWithTip'

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

class StockAppPickingBom extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            loading: false,
            canSave: false,        // 是否能保存
			disabledNext: false,   // 下一步按钮是否可以点击
			tableOption: { y: 334, x: '100%' },
			list: [
                // {
                //     "inventoryClassName": "原材料",
                //     "inventoryId": 275511661348928,
                //     "inventoryCode": "YCL0001",
                //     "inventoryName": "内存条",
                //     "inventoryGuiGe": "16G",
                //     "inventoryUnit": "个",
                //     "num": 170,
                //     "unitCost": 65.294118,
                //     "ybbalance": 11100,
                //     "bomNum": 56,
                //     "bomBalance": 3656.470588,
                //     "gapNum": -114,
                //     "gapBalance": -7443.529412
                // }
            ],
            gapList: [],          // 需要暂估的存货集合
            copyList: [],         // list的副本
            currentStep: 'step2', // 当前的步骤
            stepArray: ['step2', 'step3'],  // 总共的步骤
            propertyDetailFilter: [],       // 存货类型
			form:{
                showPopoverCard: false,     // 是否显示高级筛选框
                filterType: '',             // 类型查询选中的值 
                includeSum: false,          // 是否勾选取整
				inputVal: '',               // 搜索存货输入框
				money:'',                   // 领料金额
			},
            // step3_list: [],
            scrollTop: 0
        }
        this.metaAction = props.metaAction
        this.webapi = props.webapi
        this.component = props.component
        // this.steps = ['step2', 'step3']
        this.currentOrg = props.currentOrg   // 上下文currentOrg字段
        this.name = this.currentOrg.name     // 当前企业名称
        this.time = sessionStorage['stockPeriod'+ this.name]  //当前会计期间
        this.currentFlag=0
        this.sumWidth = 1120       // 第一步表格宽度
        this.sumWidth2 = 1120      // 第二步表格宽度
        this.step2Field = deepClone(step2Table)
        this.step3Field = deepClone(step3Table)
        this.tableRef = React.createRef(null)
        this.tableRef2 = React.createRef(null)
    }

    componentDidMount = ()=>{
        this.load()
        addEvent(window, 'resize', ::this.resizeTable)
        setTimeout(()=>{
            this.resizeTable()
        }, 100)
    }

    componentWillUnmount = ()=>{
        removeEvent(window, 'resize', this.resizeTable)
    }

    // 初始化页面数据
    load = async(flag)=>{
        this.setState({loading: true})
        const propertyReq = this.webapi.stock.findInventoryEnumList() || []        // 领料存货类型列表
        let res = await this.webapi.stock.queryBOMllInventoryInfo({ "period": this.time})
        this.setState({loading: false})
        let list = [],
            copyList=[],
            currentStep= 'step2',
            disabledNext= false,
            propertyDetailFilter = [],
            inputKey= (new Date()).getTime()

            if(res){
                list = deepClone(res.llDetailDtoList || []) 
                propertyDetailFilter = await propertyReq
                copyList = deepClone(list)
            } 
            this.setState({
                list,
                inputKey,
                copyList,
                currentStep,
                disabledNext,
                propertyDetailFilter
            },()=>{
                this.resizeTable()
            })
        return list
    }

    // 重置高级查询框
    resetForm = () => {
        const {form={}, copyList=[]} = this.state
        const {inputVal=''} = form
        let allList = deepClone(copyList)
        allList = (inputVal && inputVal.trim()) ? 
                    allList.filter( v=>( v.inventoryName.indexOf(inputVal)>-1 || v.inventoryCode.indexOf(inputVal)>-1 ) ) 
                    : allList
        this.setState({
            form: {
                ...form,
                filterType: ''
            },
            list: allList
        })
    }

    /*组合查询*/
    filterList = () => {
        const { 
            form={}, 
            copyList=[] 
        } = this.state
        const {filterType= '', inputVal=''} = form
        let allList = deepClone(copyList)
        let queryRet = []
        allList = (inputVal&& inputVal.trim()) ? 
                    allList.filter( v=>( v.inventoryName.indexOf(inputVal)>-1 || v.inventoryCode.indexOf(inputVal)>-1 ) ) 
                    : allList
        queryRet = (filterType && filterType.trim()) ? 
                      allList.filter(v=>(v.inventoryClassName == filterType.trim()))
                    : allList
        this.setState({
            list: queryRet,
            form: {
                ...form,
                showPopoverCard: false
            }
        })
    }

    // 存货类型change事件
    popoverSelectorChange = (v) => {
        const { form }= this.state
        this.setState({
            form: {
                ...form,
                filterType: v
            }
        })
       
    }

    // 高级筛选框的显示和隐藏
    handlePopoverVisibleChange = (visible) => {  
        const {form} = this.state
        this.setState({
            form: {
                ...form,
                showPopoverCard: visible
            }
        })
    }


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
        const { copyList } = this.state
        let allList = deepClone(copyList)
        allList = val ? allList.filter( v=>( 
                v.inventoryName.indexOf(val)>-1 
                || v.inventoryCode.indexOf(val)>-1 
            ))
        : allList         
        const params = {
            list: allList,
            form: { inputVal: val }
        }
        // 防抖
        timerCall(this, 'filterSearchTimer', this.setState , [params])
    }


     /**
     * @description: 生成领料单
     * @param {string} billType 保存的类型，生产领料为 'SCLL'
     * @param {array} billList 要保存的表单的数据
     * @return {string} code 生成的领料单的编码
     */ 
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
        if(codeNum){
            const obj = {
                'type':7,  // 必传
                'code': codeNum,  // 必传，凭证号
                'serviceTypeCode': billType, // 必传
                'cdate': getVoucherDate( this.time ),  // 必传，获取入库日期
                'operater': this.currentOrg.financeAuditor,  // 必传，制单人
                'billBodyDtoList': billList // 必传，存货明细列表
            }
            const ret = await this.webapi.stock.createBillTitle(obj)
            // const result = (ret && ret.billBodys.length!==0) ? ret.code :  false
            return ret 
        }
    }

     /**
     * @description: 切换步骤
     * @param {string} step 值prev:上一步，next:下一步
     * @param {array} billList 要保存的表单的数据
     * @return {string} code 生成的领料单的编码
     */
    switchStep = (step) => {
        let { stepArray=[] } = this.state
        if(step==='prev' && this.currentFlag > 0){
            this.currentFlag --
        }else if(step==='next' && this.currentFlag < stepArray.length){
            this.currentFlag ++
        }
        const currentStep = stepArray[this.currentFlag]
        const stepFn = step==='prev' ? 'getPrevData' : 'getNextData'
        const btnState = step==='prev' ? false : true
        if(step==='next'){
            this.setState({
                'disabledNext': btnState,
                'inputKey': (new Date()).getTime()
            })  
        }
        this[stepFn](currentStep)
    }

    /* 上一步 */ 
    getPrevData = async(currentStep)=> this.load()

    // 变成下一步，赋值
    getNextData= async(currentStep)=>{  
        let { gapList=[], list=[], copyList=[] } = this.state
        gapList = copyList.filter(v=>transToNum(v.gapNum)>0 && transToNum(v.gapBalance)>0)
        if(gapList.length>0){  // 如果需要暂估并且没有生成暂估入库单，那么就弹出询问框
            const ret = await this.metaAction.modal('confirm',{
                content: '选择的数据含有负库存，是否暂估?',
                okText: '暂估入库',
                cancelText: '取消',
            })
            if(ret==true){
                let zanguBillList = gapList.map(v=>{
                    let {
                        inventoryCode,
                        inventoryName,
                        inventoryUnit,
                        inventoryGuiGe,
                        inventoryId, 
                        gapNum, 
                        gapBalance 
                    } = v
                    const zanguPrice = Math.abs(( transToNum(gapBalance).toFixed(2) /transToNum(gapNum) ).toFixed(6))
                    return {
                        inventoryCode,
                        inventoryName,
                        inventoryUnit,
                        inventoryGuiGe,
                        'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null,
                        'num': Math.abs(transToNum(gapNum)) || 0, 
                        'price': zanguPrice,
                        'ybbalance': Math.abs(transToNum(gapBalance).toFixed(2)) || 0,  
                    }
                })
                zanguBillList = zanguBillList.filter(v=>(v.num && v.ybbalance))  //暂估数据必须满足数量和金额不能为0
                if(zanguBillList.length>0){
                    let rukuret = await this.metaAction.modal('show', {
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
                    if(rukuret && rukuret==='failed') return
                }
            }
        }
        this.getStep3Data(currentStep)
    }

    //计算生成领料单数据
    getStep3Data = async(currentStep)=>{
        this.setState({
            list: [],
            loading: true,
            currentStep
        })
        let newData = await this.webapi.stock.queryBOMllInventoryInfo({ "period": this.time })
        const listData = newData && newData.llDetailDtoList || []
        let copyList = deepClone(listData)
        this.setState({
            loading: false,
            copyList,
            list: deepClone(listData),
            // step3_list: deepClone(listData)
        })
        return listData  
    }

    onOk = async () => await this.save()

    onCancel = (ret) => 
        this.props.closeModal(ret) 
    

    // 保存
    save = async () => {  
        let zanguCode = 'none', 
            pickingCode
        let pickingAll = this.state.copyList
        let canSaveFlag = true
        const pickingBillList = []
        pickingAll.map(v=>{
            let {inventoryId, bomNum, unitCost, bomBalance} = v
            if(v.bomNumError){
                canSaveFlag = false
            }
            if(transToNum(bomBalance)>0){  // 过滤掉金额为0的存货
                pickingBillList.push({
                    'inventoryId': (inventoryId != undefined && inventoryId != null) ? inventoryId : null, 
                    'num': Math.abs(transToNum(bomNum).toFixed(6)) || 0, 
                    'price': Math.abs(transToNum(unitCost).toFixed(6)) || 0,
                    'ybbalance': Math.abs(transToNum(bomBalance).toFixed(2)) || 0,
                })
            }
            return v
        })

        if(!canSaveFlag){
            this.metaAction.toast('warning','本次领料数量不能大于待领料数量，请重新修改！')
            return

        }else if(pickingBillList.length==0){
            this.metaAction.toast('warning','所有存货领料金额小于等于0，不能保存！')
            return

        }else{
            this.setState({loading: true})
            pickingCode = await this.newBill('SCLL', pickingBillList)  // pickingBillList——领料单的数据
            this.setState({loading: false})
        }
           
        this.onCancel({zanguCode, pickingCode})  // 暂估入库单与领料单的单号
        return {zanguCode, pickingCode}
    }


    /**
     * @description: 重新计算表格宽高
     * @return {object} 表格的宽和表格的高
     */
    resizeTable = () => {
        const ele = document.querySelector(".ttk-stock-app-inventory-picking-ling-main")
        let tableW = (ele && ele.offsetWidth) || 0
        const tableH = (ele && ele.offsetHeight + 10) - 88 || 0
        let {tableOption} = this.state
        this.computeColWidth(tableW)
        this.setState({
            tableOption: {
                ...tableOption,
                x: tableW,
                y: tableH,
            }
        })
    }

    /*计算列宽*/
    computeColWidth = tableW => {
        const { currentStep } = this.state
        const key = (currentStep === 'step2') ? 'sumWidth' : 'sumWidth2'
        const colCount = currentStep === 'step2' ? 8 : 6  //(数量和金额以及存货名称列才分配)
        let increment = Math.floor((tableW - this[key]) / colCount)
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
                if(item.flexGrow || item.sum){
                    item.width = (item.flexGrow || item.sum)? (item.width + increment) : item.width
                }              
                sumWidth += item.width
            }
        })
        this[key] = sumWidth
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

    // 渲染表格
    renderColumns = (fields, currentStep) =>{
        let columns = fields
        // 添加文本的溢出隐藏
        const addTextOverflow = (item)=>{
            const textAlign = item.align
            if( item.dataIndex!==undefined ){
                item.render = (text,record,index)=>{
                    let txt = text
                    if(item.dataIndex==='gapNum' || item.dataIndex==='gapBalance' ){
                        txt = parseFloat(txt).toFixed(item.format)
                        txt = (transToNum(txt)>0) ? Math.abs(transToNum(txt)) :  ''
                        txt = (txt==='') ? '' 
                                : item.format==6 ?
                                   formatSixDecimal(txt) 
                                : utils.number.format(txt, 2)
                    }else{
                        txt = (item.format && !item.empty)
                        ? (item.format==6) 
                            ? formatSixDecimal(txt) 
                            : utils.number.format(transToNum(txt), 2) 
                        : txt
                    }
                    return  (
                        <div className="tdTextOverflow" style={{textAlign}} title={txt}> {txt} </div>
                    )
                }
            }
            return item
        }

        if(currentStep==='step2'){
            columns = columns.map(item=>{
                item.title = <div className="td-header-text" >{item.title}</div>
                if(item.children && item.children.length>0){
                    item.children.forEach((v, i)=>{  
                        v = addTextOverflow(v) 
                    })
                }
                item = addTextOverflow(item)
                return item
            })

        }else if(currentStep==='step3'){
            
            columns = columns.map(item=>{
                if(item.children && item.children.length>0){
                    item.children.forEach(v=>{
                        if(v.dataIndex==='bomNum'){
                            v.render = (text,record,index)=>{
                                const txt = text ? formatSixDecimal(text) : ''
                                return  <InputWithTip
                                    className='picking-amount-input'
                                    format={'amount'}
                                    isError={record.bomNumError}
                                    defaultVal={txt}
                                    errorTips={'本次领料数量不能大于待领料数量!'}
                                    inputEvent={(value)=>{this.handleNumInput(value, record, v.dataIndex)}} 
                                />       
                            }
                        }else{
                            v = addTextOverflow(v)
                        }
                    })
                }

                item = addTextOverflow(item)
                return item
            })
        }
        return columns
    }

     /**
     * @description: (生成领料单页面) 本次领料输入框输入事件
     * @param {string} value 当前单元格文本
     * @param {object} record 当前行数据
     * @param {string} field 当前列字段
     * @param {string} currentStep 当前步骤
     * @return 无
     */ 
    handleNumInput=(value, record, field)=>{
        const { inventoryId } = record
        let { list=[], copyList=[] } = this.state
        const index = list.findIndex(v=>v.inventoryId===inventoryId)
        const orgIndex = copyList.findIndex(item=>item.inventoryId===inventoryId)
        const orgNum = copyList[orgIndex]['num']
        const num  = transToNum(list[index]['num'])
        list[index][field] = value 
        let condition = !(transToNum(orgNum)>num || transToNum(value)<=num) 
        list[index][`${field}Error`] = condition 
        const unitCost = transToNum(list[index]['unitCost'])  // 单价
        list[index]['bomBalance'] = (value == num) ? list[index]['ybbalance'] : (unitCost * value)
        const idx = copyList.findIndex(v=>v.inventoryId===inventoryId)
        copyList[idx] = {...list[index]}
        this.setState({ list })
        this.props.onChange && this.props.onChange({
            'backList': list,
            'backRow': list[index],
            'scrollTop': this.tableRef2.current.bodyRef.current.scrollTop
        })
    }

     // 合计数
    calTotal=(list, field)=>{
        const flatten = (arr)=>{
            let targetArr = []
            arr.forEach((item, i)=>{
                if(item.children && item.children.length!=0 ){
                    const child = flatten(item.children)
                    targetArr = targetArr.concat(child)
                }else{
                    targetArr.push(item)
                }
            })
            return targetArr
        }
        const fieldArr = flatten(field)
        const arr = new Array(fieldArr.length).fill(0)
        list.map((el, i)=>{

            fieldArr.forEach((item, index)=>{
                let single = parseFloat(el[item.dataIndex])
                if(item.sum){
                    single = parseFloat( single.toFixed(item.format) )
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

    /*渲染合计行*/
    renderSummaryRow = (list, columnField) => {
        let rowData = this.calTotal(list, columnField)
        const summaryRows = {
            height: 37,
            rows: null,
            rowsComponent: (columns) => {
                let titleWidth = 0, rowWidth = []
                columns.forEach((el, i) => {
                    if(i == 1) {
                        i == 1 && rowWidth.push({'width': titleWidth, 'flexGrow': el.flexGrow})
                    } else {
                        if(el.children && el.children.length>0){
                            el.children.forEach(item => {
                                rowWidth.push({
                                    'width':item.width, 
                                    'dataIndex': item.dataIndex
                                })
                            })
                        }else{
                            rowWidth.push({'width': el.width, 'dataIndex': el.dataIndex,})
                        }
                    }
                })
                let rows = rowData.map((el, i) => {
                    let width = rowWidth[i].width + "px"
                    let flexGrow = rowWidth[i].flexGrow
                    const styleObj = {
                        width,
                        borderRight: '1px solid #d9d9d9',
                        textAlign: 'center'
                    }
                    const colStyle={
                        ...styleObj,
                        padding: '0 10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                    if(i == 0) {
                        return (<div style={{...styleObj}}>合计</div>)
                    
                    }else if(i==1){
                        return ( <div style={{...styleObj, flexGrow }} 
                                    title={rowData[i]}> 
                                        {rowData[i]}
                                </div>
                        )
                    
                    } else {
                        let textAlign = rowWidth[i].dataIndex.toString().toLowerCase().includes('num') ? 'left' : 'right'
                        return (
                            <div style={{ ...colStyle, textAlign }} 
                                title={rowData[i]} 
                                title={rowData[i]}
                            >
                                    {rowData[i]}
                            </div>
                        )
                    }
                })
                return <div className="vt-summary row virtual-table-summary">{rows}</div>
            }
        }
        return summaryRows
    }

    //tab切换
    tableChange = (backData)=> {
        const {backList=[], backRow, scrollTop} = backData
        let { copyList=[] } = this.state
        copyList = copyList.map((v, index)=>{
            if(v.inventoryId === backRow.inventoryId){
                v = {...backRow}
            }
            return v
        })
        this.setState({
            scrollTop,
            list: [...backList],
            copyList,
        })
    }

    render(){
        const { 
            form={}, 
            list=[], 
            currentStep, 
            inputKey,
            loading, 
            tableOption={}, 
            disabledNext=false,
            propertyDetailFilter=[],
            scrollTop=0 
        } = this.state

        const fields = currentStep=='step2' ? this.step2Field : this.step3Field
        const popoverContent = (
            <div className='inv-batch-custom-popover-content'>
                <div className='filter-content'>
                    <div className='inv-batch-custom-popover-item'>
                        <div className='inv-batch-custom-popover-item' style={{width: '100%'}}>
                            <span className='inv-batch-custom-popover-label'>
                                存货类型：
                            </span>
                            <Select showSearch={false} 
                                value={form.filterType} 
                                style={{width: '170px'}}
                                onChange={this.popoverSelectorChange} 
                                getPopupContainer={trigger => trigger.parentNode}>
                               { propertyDetailFilter && propertyDetailFilter.map(el => (
                                        <Select.Option value={el.name}> {el.name} </Select.Option>
                                    )) || []
                                }
                            </Select>
                        </div>
                    </div>
                </div>
                <div className='noBom-filter-footer'>
                    <Button type='primary' onClick={this.filterList}>
                        查询
                    </Button>
                    <Button className='reset-btn' onClick={this.resetForm}>
                        重置
                    </Button>
                </div>
            </div>
        )
        return (
            <React.Fragment>
                <div className='ttk-stock-app-inventory-picking-ling'>
                    <div className='ttk-stock-app-inventory-picking-ling-div mk-layout' style={{position: 'relative'}}>
                        { loading && <div className='ttk-stock-app-spin'>{ stockLoading() }</div> }
                        <div className={ "ttk-stock-app-inventory-picking-ling-bomTitle "+ currentStep}/>
                        <div className='ttk-stock-app-inventory-picking-ling-sub'>
                            <div className='sub-component' > 
                                <span>
                                    <EdfInput.Search 
                                        key={inputKey}
                                        className='ttk-stock-app-inventory-picking-ling-sub-search'
                                        placeholder='请输入存货名称或存货编码' 
                                        onChange={ (v)=>{this.filterCallBack(v)} }
                                        onSearch={ (v, event)=>{this.handleSearch(v, event)}}
                                    />
                                    <Popover placement="bottom" 
                                        content={ popoverContent } 
                                        trigger="click"
                                        visible={form.showPopoverCard}
                                        onVisibleChange={this.handlePopoverVisibleChange}>
                                            <i className="noBom-filter-icon"><Icon type='filter'/></i>
                                    </Popover>
                                </span> 

                            </div>
                        </div>
                        <div className='ttk-stock-app-inventory-picking-ling-main mk-layout'>

                        {   currentStep!=="step2" ? 
                                <div className="step3-table">
                                    <VirtualTable
                                        ref={this.tableRef2}
                                        columns={this.renderColumns(fields, currentStep)}
                                        dataSource={list}
                                        key='step3Table'
                                        rowKey="inventoryId"
                                        scrollTop={scrollTop}
                                        style={{ width: `${tableOption.x}px` }}
                                        scroll={{ y: tableOption.y, x: tableOption.x}}
                                        summaryRows={this.renderSummaryRow(list, fields)}
                                        bordered
                                        height={1000}
                                        width={tableOption.x+10}
                                        headerHeight={78}
                                        allowResizeColumn
                                    />
                                </div>
                                :
                                <VirtualTable
                                    ref={this.tableRef}
                                    columns={this.renderColumns(fields, currentStep)}
                                    dataSource={list}
                                    key='step2Table'
                                    rowKey="inventoryId"
                                    scrollTop={scrollTop}
                                    style={{ width: `${tableOption.x}px` }}
                                    scroll={{ y: tableOption.y, x: tableOption.x}}
                                    summaryRows={this.renderSummaryRow(list, fields)}
                                    bordered
                                    height={1000}
                                    width={tableOption.x+10}
                                    headerHeight={78}
                                    allowResizeColumn
                                ></VirtualTable>
                            }
                          
                        </div>
                    </div>
                    <div className='ttk-stock-app-inventory-picking-ling-footer-btn'>
                    <div className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup'>
                        { currentStep==="step3" ? 
                            <EdfButton 
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                type='primary' 
                                onClick={(e)=>this.save('save')}>
                                保存
                            </EdfButton> :
                            <EdfButton 
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                type='primary' 
                                onClick={(e)=>this.switchStep('next')} 
                                disabled={disabledNext}>
                                下一步
                            </EdfButton>
                        }
                        {
                            (currentStep=="step3") &&
                            <EdfButton type='default'
                                className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item'
                                onClick={(e)=>this.switchStep('prev')}>
                                上一步
                            </EdfButton>
                        }
                        <EdfButton onClick={()=>this.onCancel(false)}
                            className='ttk-stock-app-inventory-picking-ling-footer-btn-btnGroup-item btn-cancel'>
                            取消
                        </EdfButton>
                    </div>
                </div>

                </div>
               
            </React.Fragment>
        )
    }

}

export default StockAppPickingBom




