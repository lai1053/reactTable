import React from 'react'
import StaticsCard from './components/staticsCard'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import {Icon, Button, Tooltip, DatePicker, message} from 'antd'
import {fromJS} from 'immutable'
import {getCjMonth} from './utils'
const RZZT = [
    {"0" : "未认证"},
    {"1" : "已认证"},
    {"2" : "认证中"},
    {"3" : "认证失败"}
]
const FPZT = [
    {"1" : '正常'},
    {"2" : '作废'},
    {"3" : '异常'},
    {"4" : '失控'},
    {"5" : '红冲'}
]
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.currentOrg = this.metaAction.context.get('currentOrg') || {}
        this.currentUser = this.metaAction.context.get('currentUser') || {}
        this.nsrxzVal = this.currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS'
        this.nsqxdm = await this.batchQueryZzsNsqxdm()
        const sbrq = await this.getSbrq()
        const skssq = `${sbrq.slice(0,4)}-${sbrq.slice(4)}`
        this.metaAction.sfs({
            'data.skssq': skssq,
            'data.sbrq': sbrq,
            'data.loadInvoiceMonth': getCjMonth(skssq)
        })
        this.queryCertificList()
        this.load()
        this.initSelectedRowKeys = []  // 页面加载进来没有进行保存操作的已勾选的数据的kjxhc
    }

    // 计算税款所属期
    calMonth = () => {
        const getMonth = (new Date()).getMonth()
        const getYear = (new Date()).getFullYear()
        const calMonth = parseInt(getMonth) === 0 ? 12 : (getMonth < 9 ? `0${getMonth}` : getMonth)
        const calYear = parseInt(getMonth) === 0 ? parseInt((getYear - 1)) : getYear
        const month = `${calYear}-${calMonth}`  
        return month 
    }
    // 帮助页面
    openHelp = async ()=>{
        const ret = await this.metaAction.modal('show', {
            title: '',
            className: 'ttk-edf-app-help-modal-content',
            wrapClassName: 'ttk-edf-app-help-modal',
            footer: null,
            width: 840,//静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp('ttk-edf-app-help', {
                store: this.component.props.store,
                code:'inv-app-check-certification-list', // 查询页面对应参数
            })
        });
        
    }
    // 获取纳税期限代码
    batchQueryZzsNsqxdm = async() => {
        const skssq = this.metaAction.gf('data.skssq')
        const skssqVal =  `${skssq}-01`
        const params = {
            "skssq": skssqVal,
            "qyxxList":[{"qyId":this.currentOrg.id}]
        }
        let nsqxUnit = '月', nsqxdm = '06'
        if(this.nsrxzVal==='XGMZZS'){
            const resp = await this.webapi.invoices.batchQueryZzsNsqxdm(params)
            nsqxdm = resp && resp.length !== 0 ? resp[0].nsqxdm : '06'
            nsqxUnit = nsqxdm === '06' ? '月' : '季'
        }  
        return nsqxdm               
    } 

    //获取税款所属期
    getSbrq = async()=>{
        const ret = await this.webapi.invoices.getSbrq()
        return ret
    }
    // 获取发票类型
    queryCertificList = async () => {
        const data = this.metaAction.gf('data').toJS()
        this.metaAction.sfs({
            'data.filter.fpzlcsVoList': fromJS([{fpzlDm:'',fpzlMc:'全部'}].concat(data.filter.fpzlcsVoList)) || [],
            'data.filter.rzztList': fromJS([{rzzt:'',rzztMc:'全部'}].concat(data.filter.rzztList)) || [],
            'data.filter.gxbzList': fromJS([{gxbz:'',gxbzMc:'全部'}].concat(data.filter.gxbzList)) || [],
        })
       return
    }

    // 加载页面
    load = async (param) => {
        const params = param || {}
        const selectedRow = []
        const selectedRowData = []
        if (!params.page) {
            const pagination = this.metaAction.gf('data.pagination').toJS()
            const page = { currentPage: pagination.currentPage, pageSize: pagination.pageSize }
            params.page = {page}
        }
        if(!params.entity){
            const entity = this.metaAction.gf('data.filter.form').toJS()
            params.entity = {...entity}
        }
        this.metaAction.sf('data.loading', true)
        this.getData(params).then((res) => {
            const resp = Object.assign({},res)
            if(res && res !== null && res.list.length!==0){
                resp.list = res.list.map((item, index, arr)=>{
                    for(const k of RZZT){
                        if(k[item['rzzt']]){
                            item['rzztMc'] = k[item['rzzt']]
                        }       
                    }
                    for(const v of FPZT){
                        if(v[item['fpztDm']]){
                            item['fpztMc'] = v[item['fpztDm']]
                        }       
                    }
                    item.kprq = item.kprq ? item.kprq.split(' ')[0] : '' // 开票日期格式化
                    item.hjje = this.metaAction.addThousPos(item.hjje,true,true,2)
                    item.hjse = this.metaAction.addThousPos(item.hjse,true,true,2)
                    // 处理自动打钩的行
                    // 1、自动打钩、可取消——  正常，认证失败，已勾选：(fpztDm ==='1' && rzzt=== '3' && gxbz ==="Y") || (gxbz ==="Y" && rzzt==="0"),
                    // 2、自动打钩、不可取消  已参与 （确认勾选 && 认证中） || （确认勾选 && 已认证）   (rzzt==='1'&&gxbz === "Y") || (rzzt==='2'&&gxbz === "Y")
                    if((item.fpztDm ==='1' && item.rzzt=== '3' && item.gxbz ==="Y") || (item.gxbz ==="Y" && item.rzzt==="0")){  // 可取消的
                        item.gxbz = 'Y'
                        selectedRow.push(item.kjxh)
                        selectedRowData.push(item)
                    }else if((item.rzzt==='1'&&item.gxbz === "Y") || (item.rzzt==='2'&&item.gxbz === "Y")){ // 不可取消的
                        item.gxbz = 'Y'
                        selectedRow.push(item.kjxh)
                        selectedRowData.push(item)
                    }
                    return item
                })
                this.metaAction.sfs({
                    'data.gfsbh': res.list[0].gfsbh,
                    'data.selectedRowKeysArr': fromJS((selectedRow && selectedRow.slice(0))),
                    'data.saveParams': fromJS(selectedRowData.slice(0)),
                    'data.originalParams': fromJS(selectedRowData.slice(0))
                })
                this.initSelectedRowKeys = (selectedRow && selectedRow.slice(0)) || []
                resp.ljje = this.metaAction.addThousPos(resp.ljje,true,true,2)
                resp.ljse = this.metaAction.addThousPos(resp.ljse,true,true,2)
            }
            this.injections.reduce('load', resp)
            this.metaAction.sf('data.loading', false)
        }).finally(() => {
            this.metaAction.sf('data.loading', false)
            setTimeout(() => {
                this.getTableScroll()
            }, 100)
        })
        
    }

    //获取列表内容
    getData = async (payload) => {
        const tabName = this.metaAction.gf('data.tabFilter.trans_catagory') // 获取当前的页签
        let response,
            req = {
                "entity": {
                    "xfmc": "", // -- 销售方名称 非必填
                    "fpzlDm": "", // -- 发票种类代码 01 增值税专用发票,03 机动车销售发票,10 税局代开增税发票,17 通行费发票 非必填
                    "fphm": "",   //"4400191130",   //-- 发票代码 非必填
                    "rzzt": "",  // --认证状态 默认未0 非必填
                    "kprqq": "",  //"2018-04-13",   //--开票日期起 非必填
                    "kprqz": "",  //"2018-04-13",   //--开票日期止 非必填
                    "gxbz": "",   // --勾选状态 Y 已勾选 N 未勾选 非必填
                    "gfsbh": ''
                },
                "page": {
                    "currentPage": 1,  // --当前页
                    "pageSize": 20   //--每页总数
                }
            }   
        
        const sbrq = this.metaAction.gf('data.sbrq')
        if(tabName==='check'){
            if (payload) {
                if(payload.page['currentPage']) req.page.currentPage = payload.page.currentPage
                if(payload.page['pageSize']) req.page.pageSize = payload.page.pageSize
                req.entity.xfmc = (payload['entity'] && payload.entity['xfmc']!== undefined && payload.entity['xfmc']!== '') ?  String(payload.entity.xfmc) : ""   
                req.entity.fpzlDm = (payload['entity'] && payload.entity['fpzlDm']!== undefined && payload.entity['fpzlDm']!== '') ? String(payload.entity.fpzlDm) : "" 
                req.entity.fphm = (payload['entity'] && payload.entity['fphm']!== undefined && payload.entity['fphm']!== '') ? String(payload.entity.fphm) : ""   
                req.entity.rzzt = (payload['entity'] && payload.entity['rzzt']!== undefined && payload.entity['rzzt']!== '') ? payload.entity.rzzt : ""
                req.entity.kprqq = (payload['entity'] && payload.entity['kprqq']) ? payload.entity.kprqq : ""
                req.entity.kprqz =(payload['entity'] && payload.entity['kprqz']) ? payload.entity.kprqz : ""
                req.entity.gxbz = (payload['entity'] && payload.entity['gxbz']!== undefined && payload.entity['gxbz']!== '') ? String(payload.entity.gxbz).trim():""
                req.entity.gfsbh = (payload['entity'] && payload.entity['gfsbh']!== undefined && payload.entity['gfsbh']!== '') ? String(payload.entity.gfsbh).trim() : ''
                req.entity.sbrq = sbrq
            }
            response = await this.webapi.invoices.queryGxfpList(req)  /// 发票勾选列表
        }else if(tabName==='certification'){
            response = await this.webapi.invoices.queryConfFprzList(req)
            this.detectSkpzt() // 检测税控盘状态
        }  
        return response
    }

    //分页修改
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            pageSize = this.metaAction.gf('data.pagination').toJS()['pageSize']
        }
        if(currentPage == null || currentPage == undefined) {
            currentPage = this.metaAction.gf('data.pagination').toJS()['currentPage']
        }
        let page = { currentPage, pageSize }
        this.load({page})
    }
    
    // 分页总页数
    pageShowTotal = () => {
        const total = this.metaAction.gf('data.pagination').toJS()? this.metaAction.gf('data.pagination').toJS()['totalCount'] : 0
        return `共有 ${total} 条记录`
    }

    // tab切换
    tabChange = (activeKey) => {
        this.handerReset()
        this.metaAction.sf('data.tabFilter.trans_catagory', activeKey)
        this.load({page:{currentPage:1,pageSize:20}})
    }

    // 重置
    handerReset = () =>{
        const formOld ={
            kprqq: undefined,  // 开票日期起
            kprqz: undefined,  // 开票日期止
            fpzlDm: undefined,   //发票类型代码
            fphm: undefined,  //发票号码
            gxbz: undefined,  //勾选状态
            rzzt: undefined,  //认证状态
            gfsbh: ""	
        }
        this.metaAction.sf('data.filter.form',fromJS(formOld))
    }

    // 发票状态勾选失败信息提示
    renderStatusTips = (text, rowData, rowIndex) =>{
        let childNode
        if(rowData.fprzsbbz && rowData.rzzt==='3'){
            childNode = <Tooltip placement="bottomRight" title={rowData.fprzsbbz}>
                    <span className="alarmText">{text}</span>
                </Tooltip>
        }else{
            childNode = <span>{rowData.rzztMc}</span>
        }
        return childNode
    }

    // 表格文字过长用省略号显示
    renderTips = (text,width,isMoney) => {
        const value=isMoney? this.metaAction.addThousPos(text,true,true,2) : text
        return {
            children:
                <div title={value} 
                    className="toolTipsDiv">
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
                </div>
        }
    }

    // 计算税控盘异常提示————状态显示是红色 
    calTipsClass = (className) => {
        const status = this.metaAction.gf('data.machineStatus')
        let classname = status === '0' ? `${className} alarmText` : classname = `${className}`
        return classname
    }
    
    // 高级查询方法
    handleFilter = (form)=>{
        if(form){ this.injections.reduce('initInfo','data.filter.form',form) }
        const gfsbh = this.metaAction.gf('data.gfsbh')
        const page = {currentPage:1, pageSize:20}
        const entity = {...form,gfsbh}
        this.load({entity, page}) // 查询默认从第一页开始
    }

    // 表格选项勾选列表事件
    rowSelection = () => {
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeysArr').toJS()
        let selectParams = [...this.metaAction.gf('data.saveParams').toJS()]
        // const originalSelected = this.metaAction.gf('data.originalParams').toJS()
        return {
            /* 设置勾选的条件:
                1、自动打钩、可取消————已勾选&&未认证 || 已勾选&&认证失败&&发票状态正常的发票 ：fpztDm ==='1' && rzzt=== '3' && gxbz === "Y",
                2、自动打钩、不可取消———— 已勾选&&已认证 || 已勾选&&认证中   rzzt==='0'
                3、勾选置灰————认证失败，已勾选的红冲、异常、作废、失控票： fpztDm!==='1' && rzzt === '3' && gxbz === 'Y'
                4、未勾选，可手动勾选   gxbz === 'N' 
            */
            selectedRowKeys,
            //设置勾选状态
            getCheckboxProps: row => {
                return({
                    disabled: row.fpztDm !=='1' && row.rzzt === '3' && row.gxbz === 'Y', // row是一行的数据，就是后台返回的list中的一条数据
                })
            },
            // 单选
            onSelect: (row, checkStatus, selectedRows) => {
                if ((row.rzzt==='1' && row.gxbz === "Y") || (row.rzzt==='2' && row.gxbz === "Y")) {
                    return
                } else {
                    let index = selectedRowKeys.indexOf(row.kjxh)
                    if (index > -1) {  // 如果已勾选的，则取消勾选
                        selectedRowKeys.splice(index, 1)
                        selectParams = selectParams.map(item=>{
                            if(item.kjxh === row.kjxh) item.gxbz = 'N'  // 取消勾选的数据改成未勾选            
                            return item
                        })
                    } else {  // 如果未勾选的
                        selectedRowKeys.push(row.kjxh)
                        const newRow = {...row}// 勾选状态改变
                        newRow.gxbz = 'Y'
                        const hasRow = selectParams.find((currentVal,index,arr)=> currentVal.kjxh === newRow.kjxh)
                        if(hasRow){
                            selectParams = selectParams.map((currentVal,index,arr)=> {
                                if(currentVal.kjxh === newRow.kjxh) currentVal.gxbz = 'Y'
                                return currentVal
                            })
                        }else{
                            selectParams.push(newRow)
                        }
                    }
                    this.metaAction.sf('data.selectedRowKeysArr', fromJS([...selectedRowKeys])) // 设置勾选列
                }
                this.metaAction.sf('data.saveParams', fromJS(selectParams))
            },
            // 全选
            onSelectAll: (checkStatus, selectedRows, changeRows) => {
                let saveRows = [],  keyArr = []
                if(checkStatus){
                    keyArr = selectedRows.map(o=>o.kjxh);
                    saveRows = selectedRows.map(item=>{
                        item.gxbz = 'Y'
                        return item
                    })
                }else{
                    let rowArr= [], cancelRowArr =[]
                    changeRows.forEach((row,i)=>{
                        if((row.rzzt==='1' && row.gxbz === "Y") || (row.rzzt==='2' && row.gxbz === "Y")) {
                            rowArr.push(row)
                        }else{
                            row.gxbz = 'N'
                        } 
                        cancelRowArr.push(row)
                    })
                    keyArr = rowArr.map(item=>item.kjxh);
                    saveRows = cancelRowArr 
                }
                this.metaAction.sfs(
                    'data.selectedRowKeysArr',fromJS(keyArr),
                    'data.saveParams',fromJS(saveRows)
                )
            },
        }
    }
    
    // 计算勾选条数
    calTotal = (arr) => {
        let gxHjje = 0 , gxHjse = 0
        for(let item of arr){
            if(item['hjje']){
                const hjje = item['hjje'].replace(/,/g,'')
                gxHjje = gxHjje + parseFloat(hjje)
            }
            if(item['hjse']){
                const hjse = item['hjse'].replace(/,/g,'')
                gxHjse = gxHjse + parseFloat(hjse)
            }
        }
        return {
            gxfs: arr.length || 0,   // 勾选份数
            gxHjje: this.metaAction.addThousPos(gxHjje,true,true,2) ||  0, // 勾选合计金额
            gxHjse: this.metaAction.addThousPos(gxHjse,true,true,2) || 0 // 勾选合计税额
        }
    }

    // 保存
    saveCheck = () => {
        const arr = this.metaAction.gf('data.saveParams').toJS()
        let selectedArr = [], cancelArr = [], statics = {}, selectStatics, cancelStatics;
        if(arr && arr.length!==0){
            arr.forEach((item,index)=>{
                if(item.gxbz==='Y' && this.initSelectedRowKeys.indexOf(item.kjxh)<=-1){
                    const ret = selectedArr.find((currentVal,index,arr)=> currentVal.kjxh === item.kjxh )
                    if(!ret) selectedArr.push(item)
                }else if(item.gxbz==='N' && this.initSelectedRowKeys.indexOf(item.kjxh)>-1){
                    const ret = cancelArr.find((currentVal,index,arr)=> currentVal.kjxh === item.kjxh )
                    if(!ret) cancelArr.push(item)   
                }
            })
            selectStatics = this.calTotal(selectedArr)
            cancelStatics = this.calTotal(cancelArr)
            statics.check = {...selectStatics}
            statics.cancel = {...cancelStatics}
            if(statics.check.gxfs ===0 && statics.cancel.gxfs ==0){
                message.warning('本次没有勾选的发票，请先勾选发票，再保存~', 2);
                return
            }
            this.sureSum(statics, this.saveCheckReq, this.cancelSaveCheck)
        }else{
            message.warning('本次没有勾选的发票，请先勾选发票，再保存~', 2);
        }  
    }

    renderFooter =(currentPageData)=>{
        const statics = this.metaAction.gf('data.statics').toJS() || {}
        return <div style={{background:'#fcfcfc',display:'block'}}>
            <div class="inv-app-checkCertification-footer-statics">
                <span>{'合计'}</span>
                <span>{" 共 " + statics.fpzs + " 张发票 "}</span>
                <span>{"金额:" + statics.ljje + "(元)"}</span>
                <span>{"税额:" + statics.ljse + "(元)"}</span>
            </div>
        </div>
    }

    // 保存请求
    saveCheckReq = async (args) => {
        const params = this.metaAction.gf('data.saveParams').toJS()
        this.metaAction.sf('data.loading',true)
        const ret = await this.webapi.invoices.saveFprzZtxx(params).then(async(res)=>{
            this.metaAction.sf('data.loading',false)
            if(res===null){ 
                await this.saveCheckSuccess(args)
                setTimeout(()=>{
                    this.load()  
                },2550)            
            }
        })
    }
    
    // 确认
    sureCheck = () => {
        this.metaAction.sf('data.loading',true)
        const arr = this.metaAction.gf('data.certificationList').toJS()
        const statics = {}
        statics.check = this.calTotal(arr)
        if(statics.check.gxfs){
            this.sureSum(statics,this.sureCheckReq)
        }else{
            message.warning('当前还未有勾选的发票，请返回发票勾选页面进行勾选与保存操作！', 2);
        }
        
    } 

    // 确认请求
    sureCheckReq = async () => {
        // this.destroyDialog('check-sum-sure-dialog')
        this.metaAction.sf('data.loading',true)
        const params = {}
        params.gfsbh = this.metaAction.gf('data.gfsbh')
        this.webapi.invoices.confimeFpztxx(params).then(res=>{
            this.metaAction.sf('data.loading',false)
            if(res===null){
                this.checkSuccessTips()
                this.load()
            }
        })
    }

    cancelSaveCheck = ()=>{
        this.metaAction.sfs({
            'data.selectedRowKeysArr':fromJS((this.initSelectedRowKeys)),
            'data.saveParams': this.metaAction.gf('data.originalParams')
        })
    }
    // 提交前的数据统计
    sureSum = async(statics, sureCbk, cancelCbk) =>{
        this.metaAction.sf('data.loading',false)
        if(statics===null || !statics || !Object.prototype.toString.call(statics)==='[object Object]') {
            this.metaAction.toast('统计数据有误')
            return
        }
        const ret = await this.metaAction.modal('show', {
                width: 650,
                height: 200,
                centered: true,
                wrapClassName: 'check-sum-sure-dialog',
                children: <StaticsCard 
                    store = {this.component.props.store}
                    statics = {statics}
                    okCallback = {sureCbk}
                    cancelCallback = {cancelCbk}
                />
            })
    }

    // 下载发票
    onloadInvoice = () => {  
        const skssq = this.metaAction.gf('data.loadInvoiceMonth')
        const loadInvoiceMonth = this.metaAction.stringToMoment(skssq)
        this.metaAction.modal('show', {
            width: 450,
            height: 200,
            title: '下载发票',
            wrapClassName: 'check-download-invoices',
            bodyStyle:{borderTop: '1px solid #e8e8e8'},
            footer:  
                <div style={{height: '30px'}}>
                    <div style={{float:'right'}}>
                        <Button type="primary" onClick={()=>{this.sureLoadInvoice()}}>确定</Button>
                        <Button onClick={()=>{this.destroyDialog('check-download-invoices')}}>取消</Button>
                    </div>
                </div>,
            children: 
                <div style={{padding: '40px 40px'}}>
                    <div style={{marginBottom: '18px'}}>
                        <span>发票下载月份：</span>
                        <DatePicker.MonthPicker format="YYYY-MM" onChange={this.onloadInvoiceMonth} defaultValue={loadInvoiceMonth}/>
                    </div>
                    <p><span style={{color:'#ffc000'}}>温馨提示：</span>包含本月抵扣发票和本月开具发票</p>
                </div>
        })
    }

    // 选择下载月份的值的变化
    onloadInvoiceMonth = (month) => {
        const loadInvoiceMonth = this.metaAction.momentToString(month,'YYYY-MM')
        this.metaAction.sf('data.loadInvoiceMonth',loadInvoiceMonth)
    }

    // 下载采集发票
    sureLoadInvoice = () => {
        this.destroyDialog('check-download-invoices')
        const month = this.metaAction.gf('data.loadInvoiceMonth').replace(/-/g,'')
        const params = {
            "fplx" : '1',  
            "cjfs" : "plcj", 
            "skssq" : month,
            "yhId" : this.currentUser.id, 
            "qyId" : this.currentOrg.id ,
            "nsrxz" : this.nsrxzVal,
            "nsrsbh" : this.currentOrg.vatTaxpayerNum,
            "nsqxdm": this.nsqxdm,
            "dljgId": "",
            "dataList": [
                {
                    "fplx": '1',    //进项发票——"1" 或者 销项发票——"0" 必传 string
                    "cjfs": 'plcj',    //采集方式  必传  string
                    "skssq": month,     // 税款所属期（采集月份） 必传  string
                    "qyId":  this.currentOrg.id  || "6678055875340288",   // 企业id，必传  string  
                    "nsrsbh": this.currentOrg.vatTaxpayerNum,  //--纳税人识别号  必传  string
                    "nsrxz": this.nsrxzVal,   // 纳税人性质 YBNSRZZS:一般纳税人增值税 XGMZZS 小规模增值税 必传 string
                    "nsqxdm": this.nsqxdm, //--纳税期限代码，必传：06月报；08季报；
                    "dljgId": "",
                }
            ] 
        }
        this.metaAction.sf('data.loading',true)
        this.webapi.invoices.fpxxCollection(params).then(res=>{
            this.metaAction.sf('data.loading',false)
            if(res.sfcjcg == true){
                message.success('发票下载成功', 10);
                this.load()
            }
        }).catch(err=>{
            this.metaAction.sf('data.loading',false)
            this.metaAction.toast(err)
        })
    }

     // 关闭弹窗
     destroyDialog = (wrapClassName) => {
        const dialog = document.getElementsByClassName(wrapClassName)[0].parentNode.parentNode
        document.body?document.body.removeChild(dialog): ''
    }

     //保存成功提示
     saveCheckSuccess = (statics) => { 
        const _this = this
        this.metaAction.sf('data.loading',true)
        let content, widthFlag = 480, waitTime = 2000
        if(statics.cancel.gxfs===0 && statics.check.gxfs){
            waitTime = 4000
            content = <div>
                            <h4 className="check-save-success-tip-title"><Icon className="check-save-success-tips-icon"  type="check-circle" />保存成功！</h4>
                            <div className="check-save-success-tips-content">
                                <span>提示：</span>对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票勾选认证！对于取消勾选的发票，无需进一步操作！
                            </div>
                      </div>
        }else if(statics.cancel.gxfs && statics.check.gxfs===0){
            widthFlag = 220
            content = <div><h4 className="check-save-success-tip-title"><Icon className="check-save-success-tips-icon"  type="check-circle" />取消勾选，保存成功！</h4></div>
        }else if(statics.cancel.gxfs && statics.check.gxfs){
            waitTime = 3500
            content = <div>
                        <h4 className="check-save-success-tip-title"><Icon className="check-save-success-tips-icon"  type="check-circle" />保存成功！</h4>
                        <div className="check-save-success-tips-content">
                            <span>提示：</span>对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票勾选认证！对于取消勾选的发票，无需进一步操作！
                        </div>
                    </div>
        }else{
            widthFlag = 160
            content = <div><h4 className="check-save-success-tip-title"><Icon className="check-save-success-tips-icon"  type="check-circle" />保存成功！</h4></div>
        }
        
        setTimeout(() => {
            _this.metaAction.sf('data.loading',false)
            _this.metaAction.modal('show', {
                width: widthFlag,
                height: 100,
                closable: false,
                footer: null,
                allowDrag: false,
                wrapClassName: 'check-save-success-tips',
                children: content
            })
        }, 700);
        setTimeout(() => {
            _this.destroyDialog('check-save-success-tips')
        }, waitTime);
    }

    // 确认成功提示
    checkSuccessTips = () => {
        const res = this.metaAction.modal('show', {
            width: 400,
            footer: null,
            allowDrag:false,
            closable:false,
            style: {marginTop: '110px'},
            wrapClassName: 'certification-check-submit',
            centered:true,
            children: <div> 
                    <h3>
                        <Icon type='sync' spin style={{fontSize: '20px',color: '#84d945'}}/> 
                        <span style={{marginLeft:'10px',color: '#333'}}>
                            勾选认证提交中，请稍后查询认证结果！
                        </span>
                    </h3>
                    <p style={{margin: '10px 0 5px 40px',fontSize: '12px', color: '#999'}}>
                        提示：请启动开票机，插入控盘，完成发票勾选认证。
                    </p>
                </div>,
        })

        const _this = this
        setTimeout(() => {
            _this.destroyDialog('certification-check-submit')
        }, 2000);
        
    }


    // 检测税控盘状态
    detectSkpzt = async()=>{
        const gfsbh = this.metaAction.gf('data.gfsbh')
        const params = { "gfsbh" : gfsbh}
        this.webapi.invoices.refreshSkpzt(params).then(res=>{
            this.metaAction.sf('data.machineStatus',res.skpzt)
            if(String(res.skpzt)==='0'){
                // 提示未开启税控盘
                this.metaAction.modal('show',{
                    width: 450,
                    height: 250,
                    footer:
                    <div style={{height: '30px'}}>
                        <div style={{float:'right'}}>
                            <Button type="primary" onClick={async()=>{await this.destroyDialog('certification-disconnect-dialog')}}>确定</Button>
                            <Button onClick={()=>{this.destroyDialog('certification-disconnect-dialog')}}>取消</Button>
                        </div> 
                    </div>,
                    iconType: "exclamation-circle",
                    wrapClassName: 'certification-disconnect-dialog',
                    children: <div style={{padding: '0 25px 30px'}}>
                        <h4 style={{height: "24px",lineHeight: "24px",fontSize: "16px",marginBottom: "15px"}}> 
                            <Icon type="exclamation-circle"
                                 style={{color: '#fa7c63',fontSize: "22px","verticalAlign":"middle",marginTop:"-3px",marginRight: "8px"}}
                            />
                            未连接
                        </h4>
                        <ul style={{textIndent: "2em",listStyle:"none",padding: '0px 0 50px',margin: 0,fontSize:"14px",lineHeight: '26px'}}>
                            <li>开票机未连接，请启动开票机，插入控盘！</li>
                        </ul>
                    </div>,
                })
            }
        }).catch(err=>{
            this.metaAction.toast(err)
        })       
    }

    componentDidMount = () => {
        this.onResize()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
            document.addEventListener('keydown', this.keyDown, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
            document.attachEvent('keydown', this.keyDown)
        } else {
            win.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }
    // 窗口大小调整
    onResize = (type) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                this.getTableScroll()
            }
        }, 100)
    }

    // 列表高度自适应浏览器大小，出现滚动条
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-check-certification-list')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                // console.log(height,theadDom.offsetHeight,'****************')
                
               
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: width - 20 ,
                        y: height - theadDom.offsetHeight - 1,
                    })
                    // console.log(height,theadDom.offsetHeight,'%%%%%%%%%%555555555')
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: width - 20
                    })
                    // console.log(height,theadDom.offsetHeight,'###########')
                }
            }
        } catch (err) {}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

