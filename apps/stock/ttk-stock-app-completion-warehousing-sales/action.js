import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
// import { getInfo, transToNum, formatSixDecimal, stockLoading, denyClick } from '../commonAssets/js/common'
// import { Modal} from 'antd';
// import {Table} from 'edf-component'
// import { fromJS, toJS } from 'immutable';
// import utils from 'edf-utils'
// import SwitchInputText from '../components/SwitchInputText'
// import { columns } from './staticFields'
// import moment from 'moment'
import StockAppCompletionWarehousingSales from '../components/StockAppCompletionWarehousing/StockAppCompletionWarehousingSales'
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
        this.params = this.component.props.params || {}
        // this.load()
        // let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', async()=>{
        //         this.params = this.component.props.params || {}
        //         const newInfo = await getInfo({ period: (this.params.period ||'')})
        //         Object.assign(this.params, newInfo)
        //         this.load()
        //     })
        // }
    }

    renderPage = () => {
        const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
        return <StockAppCompletionWarehousingSales 
                    component={this.component} 
                    webapi={this.webapi}
                    params={this.params} 
                    xdzOrgIsStop={xdzOrgIsStop}
                    metaAction={this.metaAction}
                />
    }

    stockLoading=()=>{
        return stockLoading()
    }

    load = async()=>{
        const salesList = this.metaAction.gf('data.salesWarehouseDtos') 
                            && this.metaAction.gf('data.salesWarehouseDtos').toJS() 
                                || []
        let accountPeriod = this.params && this.params.period || moment().format('YYYY-MM')
        let actualPeriod = accountPeriod && accountPeriod.slice(0,7) || ''
        this.metaAction.sf('data.loading', true)
        const res = await this.webapi.stock.getSalesWarehousingList({
            period: actualPeriod || '', //--当前会计期间
            name: "",  //--存货id
            inventoryClassId:  null //111 --类型id,无传null
        })
        this.metaAction.sf('data.loading', false)
        let salesWarehouseDtos = [], 
            inventoryClass = [], 
            code = '', 
            period = ''

        this.listCopy = []

        if(res){
            const resList = res.salesWarehouseDtos || salesList
            salesWarehouseDtos = resList.map(v=>{
                v.num = transToNum(v.salesNum) - transToNum(v.initialQuantity)
                return v
            })
            this.listCopy = [...salesWarehouseDtos]
            inventoryClass = res.classList
            code = res.code || ''   // 单据编码
            period = res.period || '' // 生成日期
            inventoryClass.splice(0, 0, 
                {
                    'inventoryClassId': '',
                    'inventoryClassName': '全部', 
                    'isCompletion': false
                }
            )
        }

        const totalSales = this._calTotalSales(salesWarehouseDtos)
        this.injections.reduce('updateSfs',{
            ['data.list']: fromJS(salesWarehouseDtos),
            ['data.allList']: fromJS(salesWarehouseDtos),
            ['data.listLength']: salesWarehouseDtos.length,
            ['data.inventoryClass']: fromJS(inventoryClass),
            ['data.requestParams']: fromJS({ period: accountPeriod, serviceCode: "WGRK", name : "",inventoryClassId: null}),
            ['data.totalSales']: totalSales,
            ['data.others.code']: code,
            ['data.others.period']: period,
            ['data.isCarryOverProductCost']: this.params.isCarryOverProductCost
        })
        this.getTableScroll()
    }

    // 计算本期销售收入
    _calTotalSales = (list)=>{
        let ret = list.reduce((total,currentVal,currentIndex,arr)=>{
            let salesVolume = transToNum(currentVal['salesVolume'])
            return (total + salesVolume)
        },0)
        return utils.number.format(ret, 2)
    }
    
    
    // 列渲染
    renderColumns = ()=>{
        let col = columns.map(v=>{
            const item = this.renderChild(v)
            return item
        })
        return col
    }

    renderChild =(col)=>{
        col.title = <div className='ttk-stock-app-table-header-txt'> 
                        { col.title } 
                    </div>

        if(['inventoryCode','inventoryName','inventoryGuiGe'].includes(col.dataIndex)){
            col.render = (text,record,index)=>{
                return <div 
                            className="tdOverflow" 
                            title={text}>
                                {text}
                        </div>                
            } 

        }else if(['initialQuantity','initialAmount','salesVolume'].includes(col.dataIndex)){
            col.render = (text,record,index)=>{
                return this.formatNum(text,2)
            }

        }else if( col.dataIndex=='salesNum'){
            col.render = (text,record,index)=>{
                return this.formatNum(text)
            }

        }else if( col.dataIndex=='salesCostRate'){
            col.render = (text,record,index)=>{
                return this.renderInputRatio(text,record,index)
            }

        }else if( col.dataIndex=='num'){
            col.render = (text,record,index)=>{
                return this.renderInputNum(text,record,index)
            }

        }else if( col.dataIndex=='ybbalance'){
            col.render = (text,record,index)=>{
                return this.calTotal(text,record,index)
            }
        }
        if(col.children && col.children.length>0){
            col.children = col.children.map(v=>{
                return this.renderChild(v)
            })
        }

        return col
    }

    //数据格式化
    formatNum =(num,decimal)=> {
        let txt = num
        const content = (decimal && decimal!==0) ? utils.number.format(txt, decimal) : formatSixDecimal(txt)
        return <div title={content} className='warehousing-sale-overflow'>
                    { content }
                </div>
    }

    // 渲染表格成本比率输入框
    renderInputRatio = (text,record,index)=>{
        let rate = text && parseFloat(text * 100).toFixed(2) || text
        if(text){
            const txt = rate.split('.') 
            const [a, b] = txt
            let decimal = Number(`0.${b}`) > 0 ? Number(`0.${b}`).toString().split('.')[1] : 0
            rate = Number(decimal) && ( Number(decimal)> 0 ) ? Number( `${a}.${decimal}` ) : a
        }
        
        const radioVal = this.metaAction.gf('data.radioValue')
        if(radioVal === '0' && parseFloat(record.initialAmount)){
            return <div className="salesCostRate-text"></div>
        
        }else{
            return <div class="salesCostRate-input">
                <SwitchInputText 
                    text={rate}
                    numType={'tenPercent'}  
                    callback={(v)=>{this.inputRatioChangeCallback(v,record,index)}}/> 
                <span class="salesCostRate-mark">{'%'}</span>
            </div>
        }
    }


    // 渲染表格的数量输入框 
    renderInputNum = (text,record,index)=>{
        const {hasNum} = record
        return  <div className='input-num-container'>
                    <SwitchInputText 
                        text={text}  
                        callback={(v)=>{this.inputNumChangeCallback(v,record,index)}} 
                        errorFlag={hasNum} 
                        numType={'amount'} 
                        format={0} 
                    />
                </div>
    }


    // 计算表格每行的总成本金额
    calTotal=(text,record,index)=>{
        const way = this.metaAction.gf('data.radioValue')  // 选择的计算方式  期初单价是 0；销售成本率  1

        // 销售单价计算方式
        let rate = transToNum(record.salesCostRate)  // 销售成本率
        let salesVolume = transToNum( record.salesVolume )  // 销售总金额
        let salesNum = transToNum(record.salesNum )  // 销售数量
        let univalent = rate * salesVolume / salesNum  // 销售成本单价

        //期初单价计算方式，而且没有期初总金额的处理方式如下
        if(way==='0' && parseFloat(record.initialAmount)){
            let initialAmount = transToNum(record.initialAmount) // 期初库存总金额
            let initialQuantity = transToNum(record.initialQuantity) // 期初库存总数量
            univalent = initialAmount / initialQuantity  
        }
        let amount = transToNum(record.num)   // 数量
        let totalCashNum = amount * univalent  // 总金额 = 单价 * 数量
            totalCashNum = totalCashNum ? utils.number.format(totalCashNum,2) : ''
        let totalFlag = record.hasYbBalance ? (totalCashNum ? false : true) : false

        //添加字段
        this.listCopy[index].ybbalance = totalCashNum
        this.listCopy[index].hasYbBalance = totalCashNum ? false : true

        return <div className="td-totalCash" 
                    title={totalCashNum}
                    style={{
                        borderColor: totalFlag ? '#ff4600':'transparent'
                    }}
                >
                    {totalCashNum}
                </div>
    }

    // 数量成本比率输入框change事件
    inputRatioChangeCallback=(v,record,index)=>{
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [] 
        list[index].salesCostRate = v && (v/100) || v
        this.listCopy = [...list]
        this.injections.reduce('updateSfs',{['data.list']:fromJS(list)})
    }
    // 数量输入框change事件
    inputNumChangeCallback=(v,record,index)=>{
        const list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [] 
        list[index].num = v
        if(v){ list[index].hasNum = false }
        this.listCopy = [...list]
        this.injections.reduce('updateSfs',{['data.list']:fromJS(list)})
    }

    // 表格checkbox事件
    rowSelection = () =>{
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') 
                                && this.metaAction.gf('data.selectedRowKeys').toJS() || [] 
        return{
            selectedRowKeys,
            getCheckboxProps: row => {
                return{}
            },
            onSelect: (record, selected, selectedRows, nativeEvent)=>{
                if(selected){
                    if(selectedRowKeys.indexOf(record.inventoryId)===-1) { 
                        selectedRowKeys.push(record.inventoryId) 
                    }
                }else{
                    selectedRowKeys = selectedRowKeys.filter(v=> v !== record.inventoryId )
                }
                const flag = !!selectedRowKeys.length 
                this.injections.reduce('updateSfs',{
                    ['data.selectedRowKeys']: fromJS(selectedRowKeys),
                    ['data.canSaveFlag']: fromJS(flag)
                })
            },
            onSelectAll: (selected, selectedRows, changeRows)=>{
                selectedRowKeys = selected ? selectedRows.map(v=>v.inventoryId) : []
                const flag = !!selectedRowKeys.length
                this.injections.reduce('updateSfs',{
                    ['data.selectedRowKeys']: fromJS(selectedRowKeys),
                    ['data.canSaveFlag']: fromJS(flag)
                }) 
            }
        }
    }

    // 搜素框change事件
    handleChange =(e)=>{
        let val = e.target.value
        if(val === '0'){
            Modal.confirm({
                title: '请确认',
                content: '若计算方式切换为“按期初单价计算”，录入的销售成本比率将会全部清空，确认切换吗？',
                okText: '确定',
                cancelText: '取消',
                onOk: ()=>{
                    this.listCopy = this.listCopy.map(v=>{
                        v.salesCostRate = ''
                        return v
                    })
                    this.injections.reduce('updateSfs',{
                        ['data.radioValue']: val,
                        ['data.list']: fromJS([...this.listCopy])
                    })
                },
                onCancel:()=>{
                    val = '1'
                    e.target.value = '1'
                    this.injections.reduce('updateSfs',{['data.radioValue']: val})
                }
            })
        }else{
            this.injections.reduce('updateSfs',{
                ['data.radioValue']: val,
                ['data.list']: fromJS([...this.listCopy])
            })
        } 
    }
    
    // 搜索下拉框的change事件
    filterCallBack = (v)=>{
        const {name, inventoryClassId} = v
        let allList = this.metaAction.gf('data.allList') && this.metaAction.gf('data.allList').toJS() || []
        allList = allList.filter(v=> {
            if(name && inventoryClassId ){
                return (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1) && v.inventoryClassId.toString() === inventoryClassId.toString()
            }else if(name && !inventoryClassId){
                return (v.inventoryName.indexOf(name)>-1 || v.inventoryCode.indexOf(name)>-1)
            }else if(!name && inventoryClassId){
                return  v.inventoryClassId.toString() === inventoryClassId.toString()
            }else{
                return v
            }
        })
        this.listCopy = [...allList]
        this.injections.reduce('updateSfs',{['data.list'] : fromJS(allList)})
    }

    
    // 销售成本比率输入框的输入控制
    batchRateInput =(e)=>{
        e.target.value = e.target.value.replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
        let val = e.target.value
        let errTips = parseFloat(val)>100 && !!parseFloat(val) && parseFloat(val)!== 0 ? '不能输入大于100的数' : ''
        if(val.indexOf('.')>-1){
            let arr = val.split('.')
            let decimal = arr[1]
            if(decimal.toString().length > 2 ){
                val = `${arr[0]}.${arr[1].slice(0,2)}`
            }
        }
        if(parseFloat(val.toString().trim())===0) {
            val = 0
        }
        e.target.value = val
        this.injections.reduce('updateSfs',{['data.batchRateTips']: errTips})
    }

    // 销售成本比率输入框change事件
    batchInputChange=(e)=>{
        let val = e.target.value
        this.injections.reduce('updateSfs',{['data.batchRatio'] : val})
    }

    // 点击“确定”批量设置销售成本比率的事件
    setRatio =()=>{
        const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') 
                                    && this.metaAction.gf('data.selectedRowKeys').toJS() ||[]
        const batchRatio = this.metaAction.gf('data.batchRatio')   // 批量设置的百分比值
        
        // 未勾选存货时提示
        if(selectedRowKeys.length===0){
            this.metaAction.toast('warning','未勾选数据，请先勾选数据，再批量分配销售成本比率！')
            return
        }
        // 未输入百分比时提示
        if(!batchRatio && parseFloat(batchRatio)!==0){
            this.metaAction.toast('warning','未输入成本率，不能进行分配！')
            return
        }

        let tableList = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        // 对每条存货的百分比进行设置
        if(batchRatio){
            tableList = tableList.map(v=> {
                if(selectedRowKeys.indexOf(v.inventoryId)>-1){ v.salesCostRate = batchRatio/100 }
                return v
            })
        }
        this.listCopy = [...tableList]
        this.injections.reduce('updateSfs',{['data.list'] : fromJS(tableList)})
    }

    // 生成参数
    composeParams = ()=>{
        const params = {...this.params}
        params.form = {}
        params.form.rkPeriod = this.metaAction.gf('data.others.period')
        params.form.code = this.metaAction.gf('data.others.code')
        params.form.calculatingType = this.metaAction.gf('data.radioValue') && this.metaAction.gf('data.radioValue') || '1'
        params.form.period = this.metaAction.gf('data.others.period')
        return params
    }

    //关闭、返回
    handleReturn =()=>{
        const params = this.composeParams()
        const fromPage = this.params.path.slice(0)
        let pageName
        if(fromPage=='ttk-stock-app-completion-warehousing-sales-list' && this.params){
            this.params.path = 'ttk-stock-app-completion-warehousing-sales'
            pageName = '完工入库'
        }else{
            if(this.params){ this.params.path = 'ttk-stock-app-completion-warehousing-sales' }
            pageName = '存货核算'
        }
        this.component.props.onlyCloseContent 
            && this.component.props.onlyCloseContent('ttk-stock-app-completion-warehousing-sales')

        this.component.props.setPortalContent 
            && this.component.props.setPortalContent(pageName, fromPage, {params: {...this.params}})
    }

    // 检查校验
    checkForm=(list,selectedRowKeys)=>{
        let flag = false, selectedRows = []
        list = list.map(item=>{
            if(selectedRowKeys.indexOf(item.inventoryId)>-1){
                item.hasNum = parseFloat(item.num) ? false : true
                item.hasYbBalance = parseFloat(item.ybbalance) ? false : true
                selectedRows.push(item)
                if(item.hasNum || item.hasYbBalance){
                    flag = true
                }
            }else{
                item.hasNum = false
                item.hasYbBalance = false
            } 
            return item
        })
        this.listCopy = [...list]
        this.injections.reduce('updateSfs',{['data.list']: fromJS(list)})
        return {flag,selectedRows}
    }
    
    componentWillUnmount=()=>{
        this[`deny-warehousing-sale-prev-generateVoucherClickFlag`] = null
    }

    // 点击保存
    handleSave= async()=>{
        const canClick = denyClick(this, 'deny-warehousing-sale-prev-generateVoucher')
        if(canClick){
            const list = this.listCopy
            let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
            const {flag, selectedRows} = this.checkForm(list, selectedRowKeys)
            if(flag){
                this.metaAction.toast('error','勾选的存货生产入库列数据为空，需补充')
                return
            }
            const params = this.composeParams()
            params.form.list = selectedRows
            if(params && params.form.list && params.form.list.length!==0){  
                Modal.confirm({
                    title: '确认',
                    content: '系统将根据此数据重新生成完工入库单，是否进行覆盖生成？',
                    okText: '确定',
                    cancelText: '取消',
                    onOk:()=> {
                        params.path = 'ttk-stock-app-completion-warehousing-sales'
                        this.component.props.onlyCloseContent 
                            && this.component.props.onlyCloseContent('ttk-stock-app-completion-warehousing-sales')
                        this.component.props.setPortalContent 
                            && this.component.props.setPortalContent('完工入库','ttk-stock-app-completion-warehousing-sales-list',{params: {...params}})
                    },
                    onCancel() {},
                })
            }
        }
    }


     /**
     * @description: 合计一列的数量或金额
     * @param {object} list 表格列表数据
     * @param {object} field 要合计的列的字段
     * @return {number} 返回列合计数额
     */
    renderTable=()=>{
        const data  = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || []
        
        return (
            <Table
                name = 'ttk-stock-app-completion-warehousing-sales-main-table'
                className = 'ttk-stock-app-completion-warehousing-sales-main-table mk-layout'
                dataSource = {data.list}
                delay= {200}
                scroll= {data.tableOption}
                key='inventoryId'
                rowKey='inventoryId'
                bordered= {true}
                pagination= {false}              
                emptyShowScroll={true}          
                rowSelection={this.rowSelection()}
                columns= {this.renderColumns()}
                footer={
                    (list)=>{
                        if(list && Object.prototype.toString.call(list)==='[object Array]' && list.length>0){
                            let initialQuantitySum = 0,     // 库存数量
                                initialAmountSum = 0,       // 库存金额 
                                salesNumSum = 0,            // 销售数量
                                salesVolumeSum = 0,         // 销售金额
                                numSum = 0,                 // 生产数量
                                ybbalanceSum = 0            // 生产成本金额
                            // 累计每一列的数目
                            for(const item of list){
                                initialQuantitySum += transToNum(item.initialQuantity)
                                initialAmountSum += transToNum(item.initialAmount)
                                salesNumSum += transToNum(item.salesNum)
                                salesVolumeSum += transToNum(item.salesVolume)
                                numSum += transToNum(item.num)
                                // ybbalanceSum += transToNum(item.ybbalance)
                            }
                            if(this.listCopy && this.listCopy.length>0){
                                ybbalanceSum = ybbalanceSum = this.listCopy.reduce((total, item)=>{
                                    return transToNum( (total + transToNum(item.ybbalance)).toFixed(2) )
                                },0)
                            }
                            // 格式化             
                            const initNum = utils.number.format(initialQuantitySum, 2),
                                initYb = utils.number.format(initialAmountSum, 2),
                                saleNum = formatSixDecimal(salesNumSum),
                                saleVol = utils.number.format(salesVolumeSum, 2),
                                proNum = formatSixDecimal(numSum),
                                proYba = utils.number.format(ybbalanceSum, 2)
                                
                            return <div className="table-summary">
                                <div className="table-summary-cell-1">合计</div>
                                <div className="table-summary-cell-2"/>
                                <div className="table-summary-cell-3"/>
                                <div className="table-summary-cell-4"></div>
                                <div className="table-summary-cell-5"></div>
                                <div className="table-summary-cell-6" title={initNum}> <div title={initNum}>{ initNum }</div> </div>
                                <div className="table-summary-cell-7" title={initYb} > <div title={initYb}> { initYb  }</div> </div>
                                <div className="table-summary-cell-8" title={saleNum}> <div title={saleNum}>{ saleNum }</div> </div>
                                <div className="table-summary-cell-9" title={saleVol}> <div title={saleVol}>{ saleVol }</div> </div>
                                <div className="table-summary-cell-10"></div>
                                <div className="table-summary-cell-11" title={proNum}> <div title={ proNum }>{ proNum }</div> </div>
                                <div className="table-summary-cell-12" title={proYba}> <div title={ proYba }>{ proYba }</div> </div>
                            </div>
                        }
                        
                    }
                }
            />
        )
    }

    getTableScroll=(e)=>{
        let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || []
        const tableEle = document.querySelector('.ttk-stock-app-completion-warehousing-sales-table')
        const tableHead = document.querySelector('.ant-table-header')
        const tableFooter = document.querySelector('.ant-table-footer')
        const realTable = document.querySelector('.ant-table-tbody')

        const height = tableEle && tableEle.offsetHeight || 0
        const width = tableEle && tableEle.offsetWidth || 0
        const headHeight = tableHead && tableHead.offsetHeight || 0
        const footerHeight = tableFooter && tableFooter.offsetHeight || 0
        const realHeight = realTable && realTable.offsetHeight || 0

        const sclHeight = height - headHeight - footerHeight

        if (tableEle && tableHead && tableFooter) {

            delete tableOption.y
            let tableH = 400
            
            if(realHeight!=0 ){
                tableH = sclHeight+ 6

            }else{
                tableH = 0
            }
            this.metaAction.sf(
                'data.tableOption',fromJS({
                    ...tableOption,
                    x: width - 20 ,
                    y: tableH,
                })
            )
        }   
    }

    // 列表高度自适应浏览器大小，出现滚动条
    // getTableScroll = (e) => {
    //     try {
    //         let tableOption = this.metaAction.gf('data.tableOption') && this.metaAction.gf('data.tableOption').toJS() || []
    //         let appDom = document.getElementsByClassName('ttk-stock-app-completion-warehousing-sales')[0]; //以app为检索范围
    //         let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
    //         if (!tableWrapperDom) {
    //             if (e) { return}
    //             setTimeout(() => { this.getTableScroll()}, 100)
    //             return
    //         }
    //         //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
    //         let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
    //         let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

    //         // const tableEle = document.querySelector('.ttk-stock-app-completion-warehousing-sales-table')
    //         // const tableHead = document.querySelector('.ant-table-header')
    //         // const tableFooter = document.querySelector('.ant-table-footer')

    //         if (tbodyDom && tableWrapperDom && theadDom) {
    //             let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
    //             const width = tableWrapperDom.offsetWidth;
    //             const height = tableWrapperDom.offsetHeight;
    //             if (num < 0) {

    //                 delete tableOption.y
    //                 this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
    //                     ...tableOption,
    //                     x: width - 20 ,
    //                     y: height - theadDom.offsetHeight - tfooterHeight,
    //                 })})     
    //             } else {
    //                 if(tbodyDom.offsetHeight + 14 > tableOption.y){
    //                     tableOption.y = tbodyDom.offsetHeight + 14

    //                 }else if(tbodyDom.offsetHeight===0){
    //                     tableOption.y = height - theadDom.offsetHeight - tfooterHeight
    //                 }

    //                 this.injections.reduce('updateSfs', { ['data.tableOption'] :fromJS({
    //                     ...tableOption,
    //                     x: width - 20 ,
    //                     y: tableOption.y,
    //                 })})
    //             }
    //         }
    //     } catch (err) {}
    // }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

