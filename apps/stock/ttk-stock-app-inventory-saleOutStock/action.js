// import React from 'react'
// import ReactDOM from 'react-dom'
// import { action as MetaAction, AppLoader } from 'edf-meta-engine'
// import { LoadingMask, FormDecorator, Menu, Checkbox, DataGrid, Icon } from 'edf-component'
// import config from './config'
// import utils from 'edf-utils'
// import extend from './extend'
// import { Map, fromJS } from 'immutable'
// import { moment as momentUtil } from 'edf-utils'
// import { formatNumbe } from './../common'
// import moment, { relativeTimeRounding } from 'moment'
// import SubjectSetting from '../../bovms/components/subjectSetting'
// import { HelpIcon } from '../commonAssets/js/common'

import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { FormDecorator } from 'edf-component'
import StockAppInventorySaleOutStock from '../components/StockAppInventorySaleOutStock' 
// class action {
//     constructor(option) {
//         this.metaAction = option.metaAction
//         this.extendAction = option.extendAction
//         this.voucherAction = option.voucherAction
//         this.config = config.current
//         this.webapi=this.config.webapi
//     }

    
//     onInit = ({ component, injections }) => {
//         this.extendAction.gridAction.onInit({component, injections})
//         this.component = component
//         this.injections = injections
//         injections.reduce('init')
//         let addEventListener = this.component.props.addEventListener
//         if (addEventListener) {
//             addEventListener('onTabFocus', this.load)
//         }
//         this.load()
//     }
//     load = async (falg) => {
//         // LoadingMask.show()
//         this.metaAction.sf('data.loading', true)
//         let page = {}
//         const form = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS() || {}
//         page = { currentPage: form.current, pageSize: form.pageSize }
//         let name = this.metaAction.context.get('currentOrg').name
//         const currentOrg = sessionStorage['stockPeriod' + name]
//         this.period = currentOrg
//         const reqData = await this.webapi.operation.init({'period':currentOrg, 'opr': 0})
//         this.startPeriod = reqData.startPeriod//启用时间
//         if (this.metaAction.gf('data.inputVal')) {
//             page.currentPage = 1
//         }
//         let reqList = {
//             'serviceTypeCode':'XSCK',
//             'period':currentOrg,
//             'code':this.metaAction.gf('data.inputVal'),
//             'customerName':this.metaAction.gf('data.form.constom'),
//             'startPeriod':this.metaAction.gf('data.form.strDate'),
//             'endPeriod':this.metaAction.gf('data.form.endDate'),
//             'type': this.metaAction.gf('data.form.type'),
//             'voucherIds': this.metaAction.gf('data.form.voucherIds'),
//             page
//         }
//         const response = await this.webapi.operation.querylist(reqList)
//         let getInvSetByPeroid= await this.webapi.operation.getInvSetByPeroid({'period': currentOrg})
//         this.injections.reduce('load', response, getInvSetByPeroid)
//         let data = await this.webapi.operation.findCustomerList({})
//         this.selectList = data
//         let listdada = [{customerName:'全部'}].concat(data)
//         this.renderSelectOption(listdada)
//         // LoadingMask.hide()
//         this.metaAction.sf('data.loading', false)
//     }
//     reload = async (falg) => {
//         // LoadingMask.show()
//         this.metaAction.sf('data.loading', true)
//         let page = {}
//         if (falg) {
//             page = { currentPage: falg.currentPage, pageSize: falg.pageSize }
//         } else {
//             const form = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS() || {}
//             page = { currentPage: form.current, pageSize: form.pageSize }
//         }
//         let name = this.metaAction.context.get('currentOrg').name
//         const currentOrg = sessionStorage['stockPeriod' + name]
//         this.period = currentOrg
//         if (this.metaAction.gf('data.inputVal')) {
//             page.currentPage = 1
//         }
//         let reqList = {
//             'serviceTypeCode': 'XSCK',
//             'period': currentOrg,
//             'code': this.metaAction.gf('data.inputVal'),
//             'customerName': this.metaAction.gf('data.form.constom') == '全部' ? '' : this.metaAction.gf('data.form.constom'),
//             'startPeriod': this.metaAction.gf('data.form.strDate'),
//             'endPeriod': this.metaAction.gf('data.form.endDate'),
//             'type': this.metaAction.gf('data.form.type') == null ? null : this.metaAction.gf('data.form.type'),
//             'voucherIds': this.metaAction.gf('data.form.voucherIds') == null ? null : this.metaAction.gf('data.form.voucherIds'),
//             page
//         }
//         const response = await this.webapi.operation.querylist(reqList)
//         this.injections.reduce('reload', response)
//         this.metaAction.sf('data.loading', false)
//         // LoadingMask.hide()
//     }
//     // 确认是一般纳税人 还是小规模
//     confirmType = () => {
//         return this.metaAction.context.get('currentOrg').vatTaxpayer === 2000010001 ? "22210107" : "22210199"
//     }
//     // 生成凭证
//     generateVoucher = async() => {      
//         let name = this.metaAction.context.get('currentOrg').name
//         let list = this.extendAction.gridAction.getSelectedInfo('dataGrid')  // 这个结转列表的数据
//         if (!list || list.length == 0) {
//             this.metaAction.toast('error', '请选择需生成凭证单据')
//             return false
//         }
//         list = list.filter(item => (!item.voucherIds)) 
//         if (list.length < 1) return this.metaAction.toast("error", '所选单据均已生成凭证')
//         let reqData = {
//             module: 1,    //1代表是销项，2代表进项
//             acctCode: this.confirmType()  //22210107代表销项的一般纳税人,22210199代表销项的小规模纳税人,22210101代表是进项
//         }
//         let res = await this.webapi.operation.getDestAcctId(reqData)
//         if (res) {
//             this.createPz(list, res)
//         } else {
//             let confirm = await this.metaAction.modal('confirm', {
//                 content: '税额科目未设置，请选进行设置，再生成凭证。',
//                 iconType: 'exclamation-circle',
//                 okText: '现在设置',
//             })
//             if (confirm) {
//                 let response = await this.setSubject()
//                 if (response) {
//                     let res = await this.webapi.operation.getDestAcctId(reqData)
//                     if (res) this.createPz(list, res)
//                 }
//             }
//         }
//     }
//     // 最终生成凭证
//     createPz = async (list, res) => {
//         list.forEach((item) => {
//             let newList = JSON.parse(item.billBodys)
//             let taxRateT = 0
//             newList.forEach((item) => {
//                 taxRateT = item.taxRate + taxRateT
//             })
//             if (taxRateT === 0) {
//                 item.hasTaxRate = false
//             } else {
//                 item.hasTaxRate = true
//             }
//         })
//         list = list.map(item => ({
//             taxAmountSubject: item.hasTaxRate ? res : null,
//             serviceTypeCode: "XSCK",
//             period: this.period,
//             id: item.id
//         }))
//         let ret = await this.webapi.operation.createPz(list)
//         if (ret) {
//             this.metaAction.toast('success', ret)
//             this.reload()  
//         }
//     }
//     // 税务科目设置
//     setSubject = async () => {
//         const ret = await this.metaAction.modal('show', {
//             title: '科目设置',
//             style: { top: 5 },
//             width: 800,
//             okText: '保存',
//             wrapClassName: 'bovms-app-purchase-list-subject-setting',
//             children: <SubjectSetting
//                 store={this.component.props.store}
//                 metaAction={this.metaAction}
//                 webapi={this.webapi}
//                 module='stockXs'
//             />
//         })
//         if (ret) {
//             return true
//         } else {
//             return false
//         }
//     }
//     changeTypeSelect = (value) => {
//         let select = this.typeSelectOption.find(item => item.typeName === value)
//         this.metaAction.sf("data.form.type", select.typeId)
//         this.metaAction.sf("data.form.typeName", select.typeName)
//     }
//     changeVoucherSelect = (value) => {
//         let select = this.voucherIdsSelectOption.find(item => item.voucherName === value)
//         this.metaAction.sf("data.form.voucherIds", select.voucherIds)
//         this.metaAction.sf("data.form.voucherName", select.voucherName)
//     }
//     renderHelp = () => {
//         let text = <div style={{padding: '5px 10px', lineHeight: '25px'}}>
//                         <div>可删除单据范围：</div>
//                         <div>1、发票生成的单据</div>
//                         <div>2、手工新增但未生成凭证的单据</div>
//                     </div>         
//         return  HelpIcon(text, 'bottomRight')
//     }
//     disabledDate = (current) => {
//         let startperiod = this.startPeriod
//         return current < moment(startperiod)
//     }
//     renderSelectOption = (data) => {
//         const arr = data.map(item => {
//             return (
//                 <Option key={item.customerId} value={item.customerName}>
//                 {item.customerName}
//                 {/* {item.code&nbsp&nbsp&nbspitem.name&nbsp&nbsp&nbspitem.guige&nbsp&nbsp&nbspitem.unit} */}
//                 </Option>
//             )
//         })
//         this.selectOption = arr
//         this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
//     }
//     renderTypeSelectOption = () => {
//         let arr = [
//             {
//                 typeId: null,
//                 typeName: "全部" 
//             },
//             {
//                 typeId: 0,
//                 typeName: "发票生成" 
//             },
//             {
//                 typeId: 1,
//                 typeName: "手工新增" 
//             },
//             {
//                 typeId: 2,
//                 typeName: "导入"
//             }
//         ]
//         this.typeSelectOption = arr.slice()
//         arr = arr.map(item => {
//             return (
//                 <Option key={item.typeId} value={item.typeName}
//                         title={item.typeName}
//                 >
//                     {item.typeName}
//                 </Option>
//             )
//         })
//         return arr
//     }
//     renderVoucherIdsSelectOption = () => {
//         let arr = [
//             {
//                 voucherIds: null,
//                 voucherName: "全部" 
//             },
//             {
//                 voucherIds: 0,
//                 voucherName: "未生成" 
//             },
//             {
//                 voucherIds: 1,
//                 voucherName: "已生成" 
//             }
//         ]
//         this.voucherIdsSelectOption = arr.slice()
//         arr = arr.map(item => {
//             return (
//                 <Option key={item.voucherIds} value={item.voucherName}
//                         title={item.voucherName}
//                 >
//                     {item.voucherName}
//                 </Option>
//             )
//         })
//         return arr
//     }
//     // 过滤行业
//     filterIndustry = (input, option) => {     
//         return option.props.children.indexOf(input) >= 0
//     }
//     getSelectOption = () => {
//         return this.selectOption
//     }
//     // 分页修改
//     pageChanged = (currentPage, pageSize) => {
//         if (pageSize == null || pageSize == undefined) {
// 			pageSize = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS().pageSize || 0;
// 		}
// 		let page = { currentPage, pageSize }
// 		this.reload(page)
//     }
//     back = async () => {
// 		this.component.props.setPortalContent &&
// 		this.component.props.setPortalContent('存货核算','ttk-stock-app-inventory')
//         this.component.props.onlyCloseContent('ttk-stock-app-inventory-saleOutStock')
//     }
//     filterList = () => {
//         this.metaAction.sf('data.showPopoverCard', false)
//         this.reload()
//     }
//     handlePopoverVisibleChange = (visible) => {
//         if (visible) {
//             const { form } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
//             this.metaAction.sf('data.form', fromJS(form))
//         }
//         this.metaAction.sf('data.showPopoverCard', visible)
//     }
//     resetForm = () => {
//         this.metaAction.sf('data.form.enableDate', '')
//         this.metaAction.sf('data.form.constom', '')
//         this.metaAction.sf('data.form.voucherName', '')
//         this.metaAction.sf('data.form.voucherIds', null)
//         this.metaAction.sf('data.form.typeName', '')
//         this.metaAction.sf('data.form.type', null)
//     }
//     addType = async () => {
//         const name = '销售出库单'
//         const ret = await this.metaAction.modal('show', {
//             title: '新增',
//             width: 1000,
//             height: 520,
//             footer: null,
//             children: this.metaAction.loadApp('purchase-ru-ku-add-alert', {
//                 store: this.component.props.store, 
//                 formName: '销售出库单'
//             })
//         })
//         if (ret) {
//             this.reload()
//         }
//     }
//     lock = (id, invNo, voucherIds, type) => (e) => {
//         let personId = id ? id : null
//         this.lookDtile(personId, invNo, voucherIds, type)
//     }
//     lookDtile = async (id, invNo, voucherIds, type) => {
//         let ret = ''
//         let flag = this.metaAction.gf('data.limit.stateNow') ? true : false
//         if (invNo || flag || voucherIds) {
//              ret = await this.metaAction.modal('show', {
//                 title: '查看',
//                 width: 1000,
//                 height: 520,
//                 children: this.metaAction.loadApp('app-purchase-look', {
//                     store: this.component.props.store, 
//                     id: id,
//                     serviceTypeCode: 'XSCK',
//                     flag: invNo ? false : flag,
//                     titleName: '销售出库单',
//                     type: type,
//                 })
//             })
//         } else {
//             let name = '销售出库单'
//              ret = await this.metaAction.modal('show', {
//                 title: '编辑',
//                 width: 1000,
//                 height: 520,
//                 footer: null,
//                 children: this.metaAction.loadApp('purchase-ru-ku-add-alert', {
//                     store: this.component.props.store, 
//                     formName: '销售出库单',
//                     id: id,
//                     type: type,               
//                 })
//             })
//         }
//         if (ret) {
//             this.reload()
//         }
//     }
//     moreActionOpeate = (e) => {
//         this[e.key] && this[e.key]()
//     }
//     // 删除单据(多条)
//     settlement = async () => {
//         let list = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
//         if (list.length == 0) {
//             this.metaAction.toast('error', '请先选择数据')
//             return false
//         }
//         const ret = await this.metaAction.modal('confirm', {
//             title: '提示',
//             width: 400,
//             content: (
//                 <div>所选单据中若存在由发票自动生成的单据，删除单据时会同步删除对应的凭证，请确认是否删除！</div>
//             )
//         })
//         if (ret) {
//             list = list.map(item => ({
//                 invNo: item.invNo || "",
//                 voucherIds: item.voucherIds || "",
//                 serviceTypeCode: "XSCK",
//                 period: this.period,
//                 id: item.id
//             }))
//             this.metaAction.sf('data.loading', true)
//             const response = await this.webapi.operation.deleteBillAndPz(list)
//             this.metaAction.sf('data.loading', false)
//             if (response) {
//                 this.metaAction.toast('success', response)
//                 this.reload()
//             }
//         }
//     }
//     // 删除凭证
//     delectPz = async() => {
//         let list = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
//         if (list.length == 0) {
//             this.metaAction.toast('error', '请先选择数据')
//             return false
//         }
//         const ret = await this.metaAction.modal('confirm', {
//             title: '提示',
//             width: 400,
//             content: (
//                 <div>所选单据中若存在由发票自动生成的单据，删除凭证时会同步删除对应的入库单据，请确认是否删除！</div>
//             )
//         })
//         if (ret) {
//             list = list.filter(item => (!!item.voucherIds)).map(item => ({
//                 invNo: item.invNo || "",
//                 voucherIds: item.voucherIds,
//                 serviceTypeCode: "XSCK",
//                 period: this.period,
//                 id: item.id
//             }))
//             this.metaAction.sf('data.loading', true)
//             const response = await this.webapi.operation.deletePz(list)
//             this.metaAction.sf('data.loading', false)
//             if (response) {
//                 this.metaAction.toast('success', response)
//                 this.reload()
//             }
//         }
//     }

//     delectOnly = (item) => async(e) => {
//         const ret = await this.metaAction.modal('confirm', {
//             title: '提示',
//             width: 400,
//             content: (
//                 <div>所选单据中若存在由发票自动生成的单据，删除凭证时会同步删除对应的入库单据，请确认是否删除！</div>
//             )
//         })
//         if (ret) {
//             let list = []
//             list.push({
//                 invNo: item.invNo || "",
//                 voucherIds: item.voucherIds,
//                 serviceTypeCode: "XSCK",
//                 period: this.period,
//                 id: item.id
//             })
//             this.metaAction.sf('data.loading', true)
//             const response = await this.webapi.operation.deletePz(list)
//             this.metaAction.sf('data.loading', false)
//             if (response) {
//                 this.metaAction.toast('success', response)
//                 this.reload()
//             }
//         }
//     }

//     onSearch = (path, data) => {
//         clearTimeout(this.searchTimer)
//         this.searchTimer = setTimeout(() => {
//             this.metaAction.sf(path, data)
//             this.reload()
//         }, 500)
//     }
//     selectRow = (rowIndex) => (e) => {
// 		this.injections.reduce('selectRow', rowIndex, e.target.checked)
//     }
//     delClick = (id, invNo, voucherIds) => (e) => {
//         if (!this.metaAction.gf('data.limit.stateNow')) {
//             let personId = id ? id : null
//             let serviceTypeCode = 'XSCK'
//             this.delect(serviceTypeCode, personId, invNo, voucherIds)
//         }       
//     };
//     // 删除单据(单条)
//     delect = async (serviceTypeCode, id, invNo, voucherIds) => {
//         if (invNo) { // 发票过来的
//             const confirm = await this.metaAction.modal("confirm", {
//                 content: `该入库单据由发票生成，删除时会同步删除对应凭证，请确认是否删除！`,
//                 width: 340
//             })
//             if (confirm) {
//                 let list = []
//                 list.push({
//                     invNo: invNo,
//                     voucherIds: voucherIds,
//                     serviceTypeCode: serviceTypeCode,
//                     period: this.period,
//                     id: id
//                 })
//                 this.metaAction.sf('data.loading', true)
//                 const response = await this.webapi.operation.deleteBillAndPz(list)
//                 this.metaAction.sf('data.loading', false)
//                 if (response) {
//                     this.metaAction.toast("success", response)
//                     this.reload()
//                 }
//             }
//         } else {
//             if (voucherIds) { // 有凭证
//                 this.metaAction.modal("show", {
//                     title: "提示",
//                     width: 340,
//                     children: (
//                         <div style={{textAlign: "center"}}>请先删除凭证才能删除此单据！</div>
//                     )
//                 })
//             } else { // 没凭证
//                 const confirm = await this.metaAction.modal("confirm", {
//                     content: `确定删除该单据?`,
//                     width: 340
//                 })
//                 if (confirm) {
//                     let list = []
//                     list.push({
//                         invNo: invNo || "",
//                         voucherIds: "",
//                         serviceTypeCode: serviceTypeCode,
//                         period: this.period,
//                         id: id
//                     })
//                     this.metaAction.sf('data.loading', true)
//                     const response = await this.webapi.operation.deleteBillAndPz(list)
//                     this.metaAction.sf('data.loading', false)
//                     if (response) {
//                         this.metaAction.toast("success", response)
//                         this.reload()
//                     }
//                 }
//             }
//         }
//     }
//     quantityFormat = (quantity, decimals, isFocus) => {
// 		if (quantity) {
// 			return formatNumbe(quantity,decimals)
// 		}
//     }
//     checkoutVoucher = (id) => (e) => {
//         if (id) {
//             this.lookVoucher(id)
//         }       
//     };
//     lookVoucher = async(id) => {
//         const voucherId = id
//         const ret = await this.metaAction.modal('show', {
//             title: '查看凭证',
//             style: { top: 5 },
//             width: 1200,
//             bodyStyle: { paddingBottom: '0px' },
//             className: 'ttk-stock-pz-modal',
//             okText: '保存',
//             children: this.metaAction.loadApp('app-proof-of-charge', {
//                 store: this.component.props.store,
//                 initData: {
//                 type: 'isFromXdz',
//                 id: voucherId
//                 }
//             })
//         })
//     }
//     checkoutInvNo = (record) => (e) => {
//         if (record.invNo) {
//             this.lookInvNo(record)
//         }
//     };
//     lookInvNo = async(record) => {
//         let readOnly = true
//         let kjxh = record.invkjxh || Math.floor(Math.random()*10000000)
//         let obj = {
//             '01': {
//               title: '增值税专用发票(销项)-查看',
//               appName: 'inv-app-sales-zzsfp'
//             },
//             '03': {
//               title: '机动车销售发票(销项)-查看',
//               appName: 'inv-app-sales-jdcxsfp'
//             },
//             '04': {
//               title: '增值税普通发票(销项)-查看',
//               appName: 'inv-app-sales-zzsptfp'
//             },
//             '05': {
//               title: '普通机打发票(销项)-查看',
//               appName: 'inv-app-sales-ptjdfp'
//             },
//             '08': {
//               title: '纳税检查调整(销项)-查看',
//               appName: 'inv-app-sales-nsjctz'
//             },
//             '09': {
//               title: '未开具发票(销项)-查看',
//               appName: 'inv-app-sales-wkjfp'
//             },
//         }
//         let invArguments = {   // 查询票据的参数 三个key为必填项 如缺少参数请自行控制
//             fpzlDm: record.invType,
//             fpdm: record.invCode,
//             fphm: record.invNo
//         }
//         let option = {
//             title: obj[record.invType].title,
//             wrapClassName: `${obj[record.invType].appName}-modal`,
//             width: 1000,
//             style: { top: 5 },
//             okText: '保存',
//             allowDrag: false,
//             bodyStyle: { padding: '0px', borderTop: '1px solid #e8e8e8' },
//             children: this.metaAction.loadApp(obj[record.invType].appName, {
//                 store: this.component.props.store,
//                 nsqj: this.period,
//                 kjxh,
//                 fplx: 'xxfp',
//                 fpzlDm: record.invType,
//                 readOnly, // 只允许查看
//                 justShow : true,  //用于启动invArguments参数查询发票，否则会自动使用票据原有逻辑查票
//                 invArguments
//             }),
//         }
//         if (readOnly) {
//             option.footer = null
//             option.bodyStyle = { padding: '0px 0 12px 0', borderTop: '1px solid #e8e8e8' }
//         }
//         let ret = await this.metaAction.modal('show', option)
//     }
//     // 分页总页数
//     pageShowTotal = () => {
//         const total = this.metaAction.gf('data.pagination') ? this.metaAction.gf('data.pagination').toJS()['total'] : 0
//         return `共有 ${total} 条记录`
//     }
// }

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi=this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        injections.reduce('init')
        // let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', this.load)
        // }
        // this.load()
    }

    renderPage = () => {
        return (
            <StockAppInventorySaleOutStock
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                params={this.params}
                extendAction={this.extendAction}
                component={this.component}
            >
            </StockAppInventorySaleOutStock>
        )
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}

