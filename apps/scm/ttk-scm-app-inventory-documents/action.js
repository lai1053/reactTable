import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch, number } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import {FormDecorator, Select, Form, DatePicker, Button, Input, ColumnsSetting} from 'edf-component'
import gridItemVis from './utils/gridItem'
import { blankDetail } from './data'
import Productselect from './components/Productselect'
import CostIncomeRatioModel from './components/costIncomeRatio'
import CompleteMaticModal from './components/completeMatic'
import CompleteMaticSetting from './components/completeMaticSetting'
import TemporaryInventoryDetail from './utils/TemporaryInventoryDetail'
import { addThousPos, clearThousPos} from '../../../utils/number'

const bussinessTypePrefix = [{
    prefix: 'CW',
    name: '材料出库',
    id: '5001001007'
}, {
    prefix: 'CP',
    name: '产品入库',
    id: '5001001003'
}, {
    prefix: 'PY',
    name: '盘盈入库',
    id: '5001001002'
}, {
    prefix: 'PK',
    name: '盘亏出库',
    id: '5001001006'
}, {
    prefix: 'CT',
    name: '成本调整',
    id: '5001001009'
}, {
    prefix: 'CG',
    name: '采购入库',
    id: '5001001001'
}, {
    prefix: 'XS',
    name: '销售出库',
    id: '5001001005'
}, {
    prefix: 'ZR',
    name: '暂估入库',
    id: '5001001004'
}, {
    prefix: 'ZH',
    name: '暂估回冲',
    id: '5001001008'
}]

const Option = Select.Option
const FormItem = Form.Item

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.isEditing = false
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.getDom({}))
        }
        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if( addTabsCloseListen ) {
            let {inventoryType} = this.component.props

            if (inventoryType == 'addInventoryIn') {
                addTabsCloseListen('ttk-scm-app-inventory-documents?key=in', () => this.isEditing)	
            } else if (inventoryType == 'addInventoryOut') {
                addTabsCloseListen('ttk-scm-app-inventory-documents?key=out', () => this.isEditing)	
            }
        }

        this.billType = this.component.props.billType || 'product'

        injections.reduce('init')
        localStorage.setItem(`oldBusinessTypeId`, '')
        this.initLoad(this.component.props.inventoryId ,this.component.props.docCode) //4445862265978880
        this.renderNum = 1
    }

    initLoad = async (id, docCode, newType, isOnTab, isSaveAndAdd) => {
        let code = null, findRes = {}
        this.noDel = false
        let {inventoryType, proMethod, lastDay, type, recoilMode} = this.component.props

        this.metaAction.sfs({
            'data.other.proMethod': proMethod == '0' ? false : true,
            'data.other.isNew': proMethod == '3' ? true : false,  // 显示分摊
            'data.other.type': type,
            'data.other.recoilMode': recoilMode
        })
        // 查看
        if(id && id != 'NewInventory') {
            findRes = await this.webapi.inventoryDoc.findById({id})
            
            findRes.businessDate = moment(findRes.businessDate)
            let result = this.repairGetData(findRes)

            this.isDisAble(findRes)

            let isManualCost = false
            if(result) localStorage.setItem(`oldBusinessTypeId`, JSON.stringify(result.businessTypeId))
            if(result.businessTypeId == 5001001001 || result.businessTypeId == 5001001005) {  // 采购入库/销售出库
                if(result.sourceVoucherCode){
                    if(result.sourceVoucherCode.slice(0,2) == 'XX' || result.sourceVoucherCode.slice(0,2) == 'JX') isManualCost = true
                }
            }else if(result.autoTempBill && (result.businessTypeId == 5001001008 || result.businessTypeId == 5001001004)){    // 自动生成的暂估入库、回冲，不可修改
                this.noDel = true
                isManualCost = true
            }
            if(findRes.docCode) isManualCost = true  // 生成凭证
            if(findRes.businessTypeName == '采购入库' || findRes.businessTypeName == '盘盈入库' || findRes.businessTypeName == '暂估入库' || findRes.businessTypeName == '暂估回冲') {
                this.metaAction.sf('data.other.listFlag', true)
            }
            this.metaAction.sfs({
                'data.form': fromJS(result),
                'data.other.oldFormId': id,  // 查看时，当前页面的单据id
                'data.other.typeName': `${result.businessTypeName}单`,
                'data.other.isSaved': false,
                'data.other.isAdd': isManualCost,  // 是否可编辑，采购入库/销售出库
                'data.other.typeAble': true,  // 业务类型是否可编辑
                'data.form.attachmentStatus': isManualCost ? 1 : 0,  // 附件查看状态
                'data.other.recoilFlag': result.recoilFlag,
                'data.other.oldCode': findRes.sourceVoucherCode ? findRes.sourceVoucherCode : '', // 销项进项自动生成的采购销售单
            })
            if(result.businessTypeId == 5001001001 && isOnTab != 'isOnTab'){
                this.voucherAction.getSupplier({ entity: { isEnable: true } }, 'data.other.supplier')
            }
            if(result.businessTypeId == 5001001005 && isOnTab != 'isOnTab'){
                this.voucherAction.getCustomer({ entity: { isEnable: true } }, 'data.other.customer')
            }
            if(isOnTab != 'isOnTab'){
                this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`)
                this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`)
            }
            
            if (result.businessTypeId == 5001001007 && proMethod == 3) {
                const res = await this.webapi.inventoryDoc.totalAndAmount({businessDate: result.businessDate.format('YYYY-MM-DD')})
                let detailAmountTotal = this.voucherAction.sumColumn("amount")
                console.log(res, 'res')
                if (res) {
                    this.metaAction.sfs({
                        'data.other.materialCost': addThousPos(res.materialCost || 0, true, null, 2),
                        'data.other.amountyu': addThousPos(res.amount || 0, true, null, 2),
                        'data.other.detailAmountTotal': detailAmountTotal,
                        'data.other.productAmount': addThousPos(res.productAmount || 0, true, null, 2)
                    })
                }

            }
        }
        const initCreate = await this.webapi.inventoryDoc.initCreate()
        // 出库单、入库单 业务类型
        if(initCreate && initCreate.businessTypeDtos){
            let newArr = [], inId = [5001001001, 5001001002, 5001001003, 5001001004, 5001001008, 5001001009],
                outId = [5001001005, 5001001006, 5001001007]
            if(newType) inventoryType = newType
            if(inventoryType == 'addInventoryIn' || inventoryType == undefined){
                initCreate.businessTypeDtos.map(item => {
                    if(inId.indexOf(item.id) > -1) newArr.push(item)
                })
            }else if(inventoryType == 'addInventoryOut'){
                initCreate.businessTypeDtos.map(item => {
                    if(outId.indexOf(item.id) > -1) newArr.push(item)
                })
            }
            initCreate.businessTypeDtos = newArr
        }
        
        this.injections.reduce('initLoad', { initCreate, code, findRes, id, lastDay})

        // 流程图 跳转过来, 或新增ontab过来  //点击保存并新增时 这里不能在进行
        if(this.component.props.accountingmethod && !isSaveAndAdd){   
            // 按成本比例，，流程图跳转   生成产品入库单
            if(this.component.props.detail){
                let newArr = this.component.props.detail
                if(this.component.props.type) this.metaAction.sf('data.other.type', this.component.props.type)
                this.getSaleProRatioArr(newArr)
            }
            if(inventoryType == 'addInventoryIn'){
                this.onFieldChange({ id: `data.form.businessTypeId`, name: `data.form.businessTypeName` }, `data.other.bussinessType`)('5001001003', true)
            }else if(inventoryType == 'addInventoryOut'){
                this.onFieldChange({ id: `data.form.businessTypeId`, name: `data.form.businessTypeName` }, `data.other.bussinessType`)('5001001007', true)
            }
        }

        if(isOnTab != 'isOnTab'){
            await this.voucherAction.getInventory({entity:{isEnable:true}}, `data.other.inventory`)
        }
        
        setTimeout(()=>{
            this.getDom({})
        }, 10)
    }

    load = (voucher) => {
        this.injections.reduce('load', voucher)
    }
    getBillTypeName = () => {
        let billTypeName
        switch (this.billType) {
            case 'arrival':
                billTypeName = '采购入库单'
                break
            case 'manufacturCost':
                billTypeName = '销售出库单'
                break
            case 'temporary':
                billTypeName = '暂估单'
                break
            case 'otherBill':
                billTypeName = '库存其他单据'
                break
            case 'product':
                billTypeName = '产品入库单'
                break
        }
        return billTypeName
    }

    // 产品入库单 表体显示  / 材料出库
    getProVisible = (type, isColumn) => {
        const businessTypeId = this.metaAction.gf('data.form.businessTypeId')
        const isNew = this.metaAction.gf('data.other.isNew')  // 单据列是否显示成本项目,生单下拉框内容
        const typeMode = this.metaAction.gf('data.other.type') 

        if(type == 5001001003 && isNew && isColumn == 'isColumn'){
            // 单据列，不包括成本项目
            return false
        }else if(typeMode == 4 && type == 5001001003 && isColumn== 'isColumn'){
            return false
        }else{
            if( businessTypeId && businessTypeId == type){
                return true
            }else{
                return false
            }
        }
    }

    renderStyle = () => {
        const detailHeight = this.metaAction.gf('data.other.detailHeight')
        return {height: detailHeight}
    }

    // 金额 数量 单价 必填
    renderClass = () => {
        let name = this.metaAction.gf('data.form.businessTypeId')
        if(name == '5001001005' || name == '5001001006' || name == '5001001007'){
            return ''
        }else{
            return 'ant-form-item-required'
        }
    }

    getDom = (e) => {
		const dom = document.querySelector('.ttk-scm-app-inventory-documents-form-details')
		if( !dom ) {
			if( e ) {
				return 
			}
			return setTimeout(() => {
				return this.getDom()
			}, 200)
		}
		const count = Math.floor(dom.offsetHeight/34) - 2
        const details = this.metaAction.gf('data.form.details').toJS()
		while (details.length < count) {
			details.push(blankDetail);
		}
		this.metaAction.sfs({
			'data.other.detailHeight': count,
			'data.form.details': fromJS(details)
		})
		
		// this.injections.reduce('setrowsCount', details, details.length)
	}
    componentDidMount = () => {
        this.getDom()
		const win = window
		if (win.addEventListener) {
			document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
			window.addEventListener('resize', this.getDom, false)
		} else if (win.attachEvent) {
			document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
			window.attachEvent('onresize', this.getDom)
		}

        if (window.addEventListener) {
            window.addEventListener('resize', this.getDom, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.getDom)
        } else {
            window.getDom = this.getDom
        }
		let thisStub = this
        setTimeout(() => {
            let dom = document.getElementsByClassName('ttk-scm-app-inventory-documents-content')[0] //ReactDOM.findDOMNode(thisStub.refs.auxItem)
            if (dom) {
                if (dom.addEventListener) {
                    dom.addEventListener('keydown', :: thisStub.handleKeyDown, false)
                } else if (dom.attachEvent) {
                    dom.attachEvent('onkeydown', :: thisStub.handleKeyDown)
                } else {
                    dom.onKeyDown = :: thisStub.handleKeyDown
                }
			}
        }, 0)
    }

    handleKeyDown(e, index) {
        if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
            let dom = document.getElementsByClassName('ttk-scm-app-inventory-documents-content')[0]  //ReactDOM.findDOMNode(this.refs.auxItem)

            if (dom) {
                setTimeout(() => {
                    let nextFocusIndex = this.getNextFocusIndex()
                    if (index) {
                        nextFocusIndex = index
                    }
                    if (nextFocusIndex > -1) {
                        let arr = dom.getElementsByClassName('autoFocus_item')

                        if( nextFocusIndex >= arr.length ) {
                            if (this.getGridVisible("inventoryCode")) {
                                this.metaAction.sf('data.other.focusFieldPath', "root.children.content.children.details.columns.inventoryCode.cell.cell,0")
                            } else {
                                this.metaAction.sf('data.other.focusFieldPath', "root.children.content.children.details.columns.inventoryName.cell.cell,0")
                            }
                            setTimeout(() => {
                                let a = $('.ttk-scm-app-inventory-documents-form-details').find('.ant-select-selection')
                                a.focus()
                                a.click()
                            }, 0)
                        }else{
                            let c = arr[nextFocusIndex]
                            if(c){
                                if( $(c).find('input').length > 0 ) {
                                    c = $(c).find('input')[0]
                                }
                                c.tabIndex = 0
                                c.focus()
                                c.click()
                            }
                        }
                    }
                }, 0)
            }
        }
    }
    
    getNextFocusIndex() {
        const arr = document.getElementsByClassName('autoFocus_item')
        let focusDom = document.activeElement
        let obj
        if( focusDom.className &&  focusDom.className.indexOf('autoFocus_item') > -1) {
            obj = focusDom
        }else{
            obj = $(focusDom).parents('.autoFocus_item')[0]
        }
        if ( !obj ) {
            return -1
        }
        let index = 0
        for( let i = 0; i < arr.length ; i++ ) {
            if( obj == arr[i] ) {
                index = i
                break
            }
        }
        index++
        return  index
    }
    componetWillUnmount = () => {
		const win = window
		if (win.removeEventListener) {
			document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
			window.removeEventListener('onresize', this.getDom, false)
		} else if (win.detachEvent) {
			document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
			window.detachEvent('onresize', this.getDom)
		}
	}

    bodyKeydownEvent = (e) => {
        const dom = document.getElementById('ttk-scm-app-inventory-documents')
        const modalBody = document.getElementsByClassName('ant-modal-body')
        if (dom && modalBody && modalBody.length<1){
            this.keyDownCickEvent({event:e})
        }
    }

    //监听键盘事件
    keyDownCickEvent = (keydown) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            if (e.ctrlKey && e.altKey && (e.key == 'n' || e.keyCode == 78)) { //新增
                this.newAction()
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) { //保存
                this.save(false)
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == '/' || e.keyCode == 191)) {//保存并新增
                this.save(true)
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 'y' || e.keyCode == 89)) {
                //审核
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            //判断设备是否为mac
            else if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 219)) {
                    //上一张
                    this.prev()
                }

                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 221)) {
                    //下一张
                    this.next()
                }
            } else {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 37 || e.keyCode == 219)) {
                    //219 win7 IE11下的keyCode
                    //上一张
                    this.prev()
                }
                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 39 || e.keyCode == 221)) {
                    //221 win7 IE11下的keyCode
                    //下一张
                    this.next()
                }
            }
        }
    }

    renderShortCut = () => {
        const shortCuts = [
            {
                code: 1,
                name: 'Ctrl + Alt + n',
                keyCode: [17, 18, 78],
                className: 'show_style1',
                detail: '新增'
            }, {
                code: 2,
                name: 'Ctrl + s',
                keyCode: [17, 83],
                className: 'show_style2',
                detail: '保存'
            }, {
                code: 3,
                name: 'Ctrl + /',
                keyCode: [17, 191],
                className: 'show_style3',
                detail: '保存并新增'
            }, {
                code: 6,
                name: 'Ctrl + 【',
                keyCode: [17, 219],
                className: 'show_style6',
                detail: '上一张单据'
            }, {
                code: 7,
                name: 'Ctrl + 】',
                keyCode: [17, 221],
                className: 'show_style7',
                detail: '下一张单据'
            }, {
                code: 8,
                name: 'Enter',
                keyCode: [13],
                className: 'show_style7',
                detail: '下一个/下一行'
            }
        ]
        return shortCuts
    }

    //生成凭证按钮
    getAuditBtn = () => {
        let a = this.metaAction.gf('data.other.isAdd')
        let data = this.metaAction.gf('data').toJS()
        
        let status = a ? (data.form.docId ? '删除凭证' : '生成凭证') : '生成凭证'
        return status
    }

    //生成凭证
    getAudit = async () => {
        let form = this.metaAction.gf('data.form').toJS()
        let other = this.metaAction.gf('data.other').toJS()
        //生成凭证
        if(!form.docCode) {
            let rdRecordDtos = []
            rdRecordDtos.push({id : form.id})

            let startDate = this.metaAction.momentToString(form.businessDate._i, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                rdRecordDtos
            }
            let auditBatch = await this.webapi.inventoryDoc.auditBatch(filter)
            if (auditBatch) {
                if (auditBatch.result == false && auditBatch.error) {
                    this.metaAction.toast('error', response.error.message)
                } else {
                    this.metaAction.toast('success', '单据生成凭证成功')
                    this.initLoad(form.id)
                }
            }
        }else{
            let rdRecordDtos = []
            rdRecordDtos.push({id : form.id})

            let startDate = this.metaAction.momentToString(form.businessDate._i, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                rdRecordDtos
            }
            let unauditBatch = await this.webapi.inventoryDoc.unauditBatch(filter)
            if (unauditBatch) {
                if (unauditBatch.result == false && unauditBatch.error) {
                    this.metaAction.toast('error', response.error.message)
                } else {
                    this.metaAction.toast('success', '单据删除凭证成功')
                    this.initLoad(form.id)
                }
            }
        }
        
    }

    onTabFocus = async (props) => {
        let query = await this.webapi.inventoryDoc.query()
        if(query == '0'){
            this.metaAction.toast(error, '存货核算未启用')
            return false
        }
        props = props.toJS()

        if (props.accessType) {
            if(props.inventoryId != 'NewInventory'){
                // 查看
                this.initLoad(props.inventoryId, props.docCode,null, 'isOnTab')
            } else if( (props.accessType || props.accountingmethod) && props.inventoryId == 'NewInventory'){
                // 新增跳转
                this.injections.reduce('init')
                this.initLoad(null,null, props.inventoryType, 'isOnTab')
            }
        }
        const calcMode = await this.webapi.inventoryDoc.getCalcMode()
        if(calcMode){
            this.metaAction.sfs({
                'data.other.proMethod': calcMode.productionAccounting == '0' ? false : true,
                'data.other.isNew': calcMode.productionAccounting == '3' ? true : false,
                'data.other.type': calcMode.mode
            })
        }

        if (!props.accessType) { // 切换页签的时候更新 本月产成品直接材料金额合计以及余额
            let businessTypeId = this.metaAction.gf('data.form.businessTypeId'),
            businessDate  = this.metaAction.gf('data.form.businessDate')
            if (businessTypeId == 5001001007 && props.proMethod == 3) {
                const res = await this.webapi.inventoryDoc.totalAndAmount({businessDate: businessDate.format('YYYY-MM-DD')})
                let oldFormId = this.metaAction.gf('data.other.oldFormId')

                let sfsObj = {}
                if (res) {
                    // this.metaAction.sfs({
                    //     'data.other.materialCost': addThousPos(res.materialCost || 0, true, null, 2),
                    //     'data.other.amountyu': addThousPos(res.amount || 0, true, null, 2)
                    // })
                    let detailAmountTotal = this.voucherAction.sumColumn("amount")
                    sfsObj['data.other.materialCost'] = addThousPos(res.materialCost || 0, true, null, 2)
                    sfsObj['data.other.amountyu'] = addThousPos(res.amount || 0, true, null, 2)
                    sfsObj['data.other.productAmount'] = addThousPos(res.productAmount || 0, true, null, 2)
                    if (oldFormId) sfsObj['data.other.detailAmountTotal'] = detailAmountTotal
                    this.metaAction.sfs(sfsObj)
                }

            }

            // 是否生成凭证状态,不显示保存按钮，则更新状态
            let isSaved = this.metaAction.gf('data.other.isSaved')
            let oldFormId = this.metaAction.gf('data.other.oldFormId')
            oldFormId = oldFormId && oldFormId.size ? oldFormId.toJS() : oldFormId
            if(!isSaved && oldFormId){
                const findRes = await this.webapi.inventoryDoc.findById({id: oldFormId})
                if(findRes.businessTypeName == '采购入库' || findRes.businessTypeName == '盘盈入库' || findRes.businessTypeName == '暂估入库' || findRes.businessTypeName == '暂估回冲') {
                    this.metaAction.sf('data.other.listFlag', true)
                }
                
                this.metaAction.sfs({
                    'data.other.docCode': findRes.docCode,
                    'data.other.recoilFlag': findRes.recoilFlag
                })
            }
            
        }

        this.getListAwait()
    }

    getListAwait = async () => {
        await this.voucherAction.getInventory({entity:{isEnable:true}}, `data.other.inventory`)
        await this.voucherAction.getSupplier({ entity: { isEnable: true } }, 'data.other.supplier')
        await this.voucherAction.getCustomer({ entity: { isEnable: true } }, 'data.other.customer')
        await this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`)
        await this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`)
    }
    setting = async () => {
        let setting = this.metaAction.gf('data.setting').toJS()
        let initOption = []
        // setting = setting && setting.toJS()
        let option1 = setting.body.tables[0]
        if( option1 ) {
            option1.option = option1.details
            option1.name = setting.body.name
        }else {
            option1 = {}
            option1.option = []
            option1.name = '表体'
        }
        
        let option2 = setting.header
        
        if( option2 ) {
            option2.option = option2.cards
        }else {
            option2 = {}
            option2.name = '表头'
            option2.option = []
        }
        const res =  await this.metaAction.modal('show',{
            title: '显示设置',
            width: 500,
            iconType: null,
            footer: null,
            className: 'ttk-scm-app-inventory-documents-set',
			bodyStyle: {paddingBottom: '10px'},
            children: <ColumnsSetting 
                option={[option2, option1]} 
                singleKey='id'
                sort={false}
                editName={false}
                checkedKey='isVisible' 
                labelKey="caption"
            />
        })
        if (res && res.type == 'confirm') {
            this.handleConfirmSet(res.option)
        } else if (res && res.type == 'reset') {
            this.handleResetSet(setting.code)
        }
    }

    handleResetSet = async (code) => {
        if (code) {
            const result = await this.webapi.inventoryDoc.reInitByUser({code: code})
            this.metaAction.sf('data.setting', fromJS(result))
            setTimeout(()=>{
                this.getDom({})
            }, 10)
        }
    }

    handleConfirmSet = async (params) => {
        if (params) {
            const setting = this.metaAction.gf('data.setting').toJS()
            const cards = params[0] && params[0].option
            const tables = params[1] && params[1].option
            if (setting) {
                setting.header.cards = cards
                if( setting.body.tables[0] ) {
                    setting.body.tables[0].details = tables
                }
            }
            const result = await this.webapi.inventoryDoc.updateWithDetail(setting)
            this.metaAction.sf('data.setting', fromJS(result))
            setTimeout(()=>{
                this.getDom({})
            }, 10)
        }
    }

    add = async() => {
        const res = await this.metaAction.modal('confirm', {
            title: '放弃',
            content: '点击放弃会重置你所有的操作，确定要放弃吗？',
        })
        if (res) {
            this.editCloseTips(false)
            this.injections.reduce('init')
            this.initLoad()
            this.metaAction.sfs({
                'data.form.flag': null,
                'data.other.setCompleteMatic': null,
                'data.other.oldCompleteMatic': null
            })
        }
    }
    editCloseTips = (istip) => {
        if(istip) {
            localStorage.setItem(`businessTypeId`, '')
        }
        this.isEditing = istip
    }

    audit = async () => {
        const id = this.metaAction.gf('data.form.id'),
              ts = this.metaAction.gf('data.form.ts'),
              status = this.metaAction.gf('data.form.status')
        if (!id && !ts) {
            this.metaAction.toast('error', '请保存单据')
            return
        }

        if (status == consts.consts.VOUCHERSTATUS_NotApprove || status == consts.consts.VOUCHERSTATUS_Rejected) {
            const response = await this.webapi.inventoryDoc.audit({ id, ts })
            this.metaAction.toast('success', '单据审核成功')
            this.load(response)
        } else {
            const response = await this.webapi.inventoryDoc.unaudit({ id, ts })
            this.metaAction.toast('success', '单据反审核成功')
            this.load(response)
        }
    }

    history = async () => {
        const enableDate = this.metaAction.gf('data.other.enableDate')
        const enableTime = parseInt(moment(enableDate).format('YYYY-MM'))
        let startDate
        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        if(periodDate) {
            let a =  String(enableTime).slice(0,5), b = periodDate.replace('-','')
            if(a < b){
                startDate = periodDate
            }else{
                startDate = String(enableTime)
            }
        }
        this.component.props.setPortalContent('出入库明细表', 'ttk-scm-app-warehouse-detail', 
                                {accessType: 1, enableTime: String(enableTime),startDate})
    }

    // moreMenuClick = (e) => {
    //     switch (e.key) {
    //         case 'del':
    //             this.del()
    //             break
    //         case 'pay':
    //             this.pay()
    //             break
    //         case 'antiAudit':
    //         this.audit()
    //         break
    //     }
    // }

    moreMenuClick = (e) => {
        this[e.key] && this[e.key]()
    }

    del = async () => {
        let businessType = this.metaAction.gf('data.form.businessTypeId'),
        isAdd = this.metaAction.gf('data.other.isAdd'),
        oldCode = this.metaAction.gf('data.other.oldCode')

        if(this.noDel && businessType == '5001001008'){  
            this.metaAction.toast('error', '自动生成的暂估回冲单不允许删除')
            return false
        }
        if(isAdd && oldCode){  // 销项进项生成的采购销售单不可以删
            if(businessType == 5001001001){
                this.metaAction.toast('error', `进项发票${oldCode}已生成凭证，无法删除对应的采购入库单`)
                return false 
            }else if(businessType == 5001001005){
                this.metaAction.toast('error', `销项发票${oldCode}已生成凭证，无法删除对应的销售出库单`)
                return false 
            }
        }

        const id = this.metaAction.gf('data.form.id'),
              ts = this.metaAction.gf('data.form.ts')
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            // this.editCloseTips(true)
            if(id){
                let businessTypeId = this.metaAction.gf('data.form.businessTypeId')
                const response = await this.webapi.inventoryDoc.del({ id, ts })
                if(response){
                    this.metaAction.toast('success', '删除单据成功')
                    this.injections.reduce('init')
                    await this.initLoad()
                    this.getCardCode(businessTypeId)
                    this.metaAction.sfs({
                        'data.form.businessTypeId': businessTypeId,
                        'data.other.setCompleteMatic': null,
                        'data.other.oldCompleteMatic': null
                    })
                }
            }else{
                // this.initLoad()
                this.metaAction.sf('data.other.isSaved', false)
                this.newAction('del')
                this.injections.reduce('init')
                await this.initLoad()
                this.metaAction.sfs({
                    'data.form.flag': null,
                    'data.other.setCompleteMatic': null,
                    'data.other.oldCompleteMatic': null
                })
                this.metaAction.toast('success', '删除单据成功')
            }
        }
    }

    pay = () => {
        this.metaAction.toast('error', 'TODO')
    }

    //检查基础项
    checkForm = (data) => {
        const businessTypeId = this.metaAction.gf('data.form.businessTypeId')
        let form = this.metaAction.gf('data.form').toJS()

        // 检查单据日期是否在可选的时间内
        if(form.businessDate){
            let businessDate = utils.moment.momentToString(form.businessDate, 'YYYY-MM-DD')
            const enableDate = this.metaAction.gf('data.other.enableDate')
            let enableDateNum = parseInt(moment(enableDate).format('YYYYMMDD'))
            
            if(businessDate) businessDate = String(businessDate).replace(/-/g,'')
            if(businessDate < enableDateNum){
                this.metaAction.toast('error', `单据日期在存货核算启用日期之前，请修改`)  
                this.injections.reduce('updateState', 'data.form.businessDateError', true)
                return false
            }
        }
        const requiredParams = [{
            key: 'businessDate',
            name: '单据日期'
        }, {
            key: 'businessTypeId',
            name: '业务类型'
        }]
        let message = []
        if( businessTypeId == 5001001001 || businessTypeId == 5001001004 || businessTypeId == 5001001008) {
            requiredParams.push({
                key: 'supplierId',
                name: '供应商'
            })
        }
        
        if( businessTypeId == 5001001005 ) {
            requiredParams.push({
                key: 'customerId',
                name: '客户'
            })
        }
        requiredParams.forEach(item =>  {
            if( !data[item.key] ) {
                message.push(item.name)
            }
        })

        if( message.length > 0 ){
            if(message[0] == '供应商'){
                this.injections.reduce('updateState', 'data.form.supplierError', true)
            }else if(message[0] == '客户'){
                this.injections.reduce('updateState', 'data.form.customerError', true)
            }else if(message[0] == '业务类型'){
                this.injections.reduce('updateState', 'data.form.businessTypeError', true)
            }
            this.metaAction.toast('error', `${message.join(',')}不能为空`)
            return false
        }

        let otherMsg = []
        // 单价不能小于0
        for (let i = 0; i < form.details.length; i++) {
            if (form.details[i].price < 0) otherMsg.push(i+1)
        }
        if (otherMsg.length > 0) {
            this.metaAction.toast('error', `第${otherMsg.join(',')}行明细单价不能为负数`)
            return false
        }
        return true
    }

    // 当时产品入库的时候校验
    checkProductSumAmount = (data) => {
        const { businessTypeId } = data
        const isNew = this.metaAction.gf('data.other.isNew')
        const type = this.metaAction.gf('data.other.type')

        if( businessTypeId == 5001001003 && !isNew && type != 4) {
            let { laborCost, manufacturCost, materialCost, details, otherCost } = data
            laborCost = laborCost ? Number(laborCost) : 0
            manufacturCost = manufacturCost ? Number(manufacturCost) : 0
            materialCost = materialCost ? Number(materialCost) : 0
            otherCost = otherCost ? Number(otherCost) : 0
            
            let sum1 = laborCost + manufacturCost + materialCost + otherCost, 
                    detailArr = [], allArr=[]
            let sum2 = 0, materialCostSum = 0, laborCostSum = 0, manufacturCostSum = 0, otherCostSum = 0
            details.forEach((item, index) => {
                sum2 = sum2 + Number(item.amount)
                materialCostSum = materialCostSum + Number(item.materialCost)
                laborCostSum = laborCostSum + Number(item.laborCost)
                manufacturCostSum = manufacturCostSum + Number(item.manufacturCost)
                otherCostSum = otherCostSum + Number(item.otherCost)

                if(item.amount != item.materialCost + item.laborCost + item.manufacturCost + item.otherCost){
                    detailArr.push(`序号${Number(index)+1}`)
                }
            })
            // 每条明细的金额  等于  后4个相加
            if(detailArr.length) {
                allArr.push(`${detailArr.join('、')}的存货，存货金额与成本项目金额合计不相等`)
            }
            // 上下 合计 相等
            if( utils.number.round(sum1, 2) != utils.number.round(sum2, 2) ) {
                allArr.push('存货金额合计≠直接材料+直接人工+制造费用+其他费用，请修改使其相等')
            }
            // 4种分别相等。。。
            let errorArr = []
            if(materialCostSum != Number(materialCost)) errorArr.push('直接材料')
            if(laborCostSum != Number(laborCost)) errorArr.push('直接人工（工资）')
            if(manufacturCostSum != Number(manufacturCost)) errorArr.push('制造费用')
            if(otherCostSum != Number(otherCost)) errorArr.push('其他费用')
            if(errorArr.length){
                allArr.push(`（成本项目----${errorArr.join('/')}合计） ≠ （成本核算----${errorArr.join('/')}的值）`)
            }
            if(allArr.length){
                allArr.map(item=>{
                    this.metaAction.toast('error', this.errorText(allArr))
                })
                return
            }
        }else if(businessTypeId == 5001001003 && (isNew || type == 4)){
            let { laborCost, manufacturCost, materialCost, details, otherCost } = data
            laborCost = laborCost ? Number(laborCost) : 0
            manufacturCost = manufacturCost ? Number(manufacturCost) : 0
            materialCost = materialCost ? Number(materialCost) : 0
            otherCost = otherCost ? Number(otherCost) : 0

            let sum1 = laborCost + manufacturCost + materialCost + otherCost, sum2 = 0
            details.forEach((item, index) => {
                sum2 = sum2 + Number(item.amount)
            })
            if(utils.number.round(sum1, 2) != utils.number.round(sum2, 2)){
                this.metaAction.toast('error', '存货金额合计≠直接材料+直接人工+制造费用+其他费用，请修改使其相等')
                return
            }
        }
        // 暂估入库不能为负。。。
        if(businessTypeId == 5001001004 || businessTypeId == 5001001008){
            const { details } = data
            let errorArr = []
            details.map(item => {
                if(item.quantity<0) errorArr.push(item)
            })
            if(errorArr.length){
                if(businessTypeId == 5001001004){
                    this.metaAction.toast('error', '暂估入库数量不能为负数')
                }else{
                    this.metaAction.toast('error', '暂估回冲数量不能为负数')
                }
                return false
            }
        }
        return true
    }
    errorText = (err)=>{
        return <div className='wrap'>{err.map(item => <div style={{textAlign: 'left' }}>· {item}</div>)}</div>
    }

    // 检查明细
    checkDetail = (data) => {
        let businessTypeId = this.metaAction.gf('data.form.businessTypeId'), requiredParams
        // 成本调整（无数量单价）
        requiredParams = [{
            key: 'inventoryCode',
            name: '存货编码'
        }, {
            key: 'inventoryName',
            name: '存货名称'
        },{
            key: 'amount',
            name: '金额'
        }] 
        if(businessTypeId != '5001001009' && businessTypeId != '5001001005' && businessTypeId != '5001001006' && businessTypeId != '5001001007'){
            requiredParams.push( {
                key: 'quantity',
                name: '数量'
            }, {
                key: 'price',
                name: '单价'
            })
        }else if(businessTypeId == '5001001005' || businessTypeId == '5001001006' || businessTypeId == '5001001007'){
            requiredParams = [{
                key: 'inventoryCode',
                name: '存货编码'
            }, {
                key: 'inventoryName',
                name: '存货名称'
            },{
                key: 'quantity',
                name: '数量'
            }] 
        }
        
        let newDetail = []
        let message = ''

        
        let itemDetail = ['inventoryCode', 'inventoryName', 'specification','unitName','quantity','price','amount']
        if(businessTypeId == '5001001003'){
            itemDetail.push('absorption')
            itemDetail.push('materialCost')
            itemDetail.push('laborCost')
            itemDetail.push('manufacturCost')
            itemDetail.push('otherCost')
        }
        
        data.forEach((item, index) => {
            let flag = false, flag1 = false
            for( const [key, value] of Object.entries(item) ) {
                if( !flag && !!value && key != 'seq') {
                    flag = true
                }
            }
            itemDetail.map(i=>{
                if(item[i]) flag1 = true
            })
            if( flag && flag1) {
                newDetail.push(item)
                let messageArr = []
                requiredParams.forEach(o => {
                    if( !item[o.key] ) {
                        messageArr.push(o.name)
                    }
                })
                if( messageArr.length > 0 ) {
                    message = `${message} 第${index+1}行${messageArr.join('、')}不能为空`
                }
            }
        })
        if( newDetail.length == 0 ) {
            this.metaAction.toast('error', '请至少填写一条数据')
        }
        if( message ) {
            this.metaAction.toast('error', message)
        }
        if( newDetail.length == 0 || message ) {
            return false
        }

        return newDetail
    }

    save = async (isNew) => {
        const formParams = this.metaAction.gf('data.form').toJS()
        const oldDeltailValue = this.metaAction.gf('data.oldDeltailValue') && this.metaAction.gf('data.oldDeltailValue').toJS()
        const isOk = this.metaAction.gf('data.other.isOk')
        const oldCode = this.metaAction.gf('data.other.oldCode')  // 销项发票生成的 销售出库单 单价和金额可以修改，再次保存时区分
        if(!isNew) {
            if(formParams.businessTypeName == '采购入库' || formParams.businessTypeName == '盘盈入库' || formParams.businessTypeName == '暂估入库' || formParams.businessTypeName == '暂估回冲') {
                this.metaAction.sf('data.other.listFlag', true)
            }
        }
        if( !this.checkForm(formParams) ) return false
        let newDetail = this.checkDetail(formParams.details)
        if( newDetail ) {
            if(!oldCode && !oldDeltailValue){ // 新增的（不是销进项过来的），传true
                if(formParams.businessTypeId == 5001001005 || formParams.businessTypeId == 5001001006 || formParams.businessTypeId == 5001001007){
                    // 新增时，出库 单价和金额都不填，为false
                    newDetail.map(item=> {
                        if(!item.price && !item.amount){
                            item.manualCost=false
                        }else{
                            item.manualCost=true
                        }
                    })
                }else{
                    newDetail.map(item=> item.manualCost=true)
                }
            }
            if(formParams.businessTypeId == 5001001005 || formParams.businessTypeId == 5001001006 || formParams.businessTypeId == 5001001007){ 
                // 三种出库单 manualCost返回为false时，如果单价 或 金额 变动了，则传true
                let detail
                if(oldDeltailValue && oldDeltailValue.length){
                    newDetail.map(item=>{
                        detail = oldDeltailValue.find(o => o.id == item.id)
                        if(detail && item.price && item.amount){
                            if(item.price != detail.price || item.amount != detail.amount) {
                                item.manualCost=true
                            }else if(item.price == detail.price && item.amount == detail.amount && item.manualCost && item.manualCost){
                                // 新增时，，就已经填了单价和金额，，而且单价和金额不是成本计算得来的
                                item.manualCost=true
                            }else{
                                item.manualCost=false
                            }
                        }else if(detail == undefined && item.amount && item.price){
                            item.manualCost=true
                        }else{
                            item.manualCost=false
                        }
                        if(!item.price)item.price= 0
                        if(!item.amount)item.amount= 0
                    })
                }
            }
            formParams.details = newDetail
        }else {
            return 
        }
        if( !this.checkProductSumAmount(formParams) ) return 

        let response
        formParams.details.map((item, index)=>{
            if(item.amount) formParams.details[index].amount = utils.number.round(item.amount, 2)
            if(item.price) formParams.details[index].price = utils.number.round(item.price, 6)
            if(item.quantity) formParams.details[index].quantity = utils.number.round(item.quantity, 6)
            if(item.inventoryCode && !item.price) formParams.details[index].price = 0
            if(item.inventoryCode && !item.quantity) formParams.details[index].quantity = 0
            if(item.inventoryCode && !item.amount) formParams.details[index].amount = 0
        })
        formParams.businessDate = formParams.businessDate.format('YYYY-MM-DD')
        formParams.attachments =  this.repairAttachment(formParams.attachmentFiles) 
        const item =  bussinessTypePrefix.find(o => formParams.businessTypeId == o.id)
        formParams.codePrefix = item.prefix
        
        if (!isOk) return false
        this.metaAction.sf('data.other.isOk', false)
        
        // 完工成本核算----设置
        let setCompleteMatic = this.metaAction.gf('data.other.setCompleteMatic')
        if (setCompleteMatic) formParams.influenceAmountDtos = setCompleteMatic 

        if( formParams.id && formParams.ts){
            let code = this.metaAction.gf('data.form.code')
            formParams.sourceVoucherCode = formParams.sourceVoucherCode
            formParams.code = code
            response = await this.webapi.inventoryDoc.update(formParams)
		    this.metaAction.sf('data.other.isOk', true)
        }else{
            response = await this.webapi.inventoryDoc.createApi(formParams)
            this.metaAction.sf('data.other.isOk', true)
        }
        if(response) {
            this.metaAction.sfs({
                'data.other.isSaved': false,
                'data.other.typeAble': true,
                'data.form.flag': null,
                'data.other.oldFormId': response.id,  // 保存后，当前页面的单据id
                'data.other.setCompleteMatic': null,
                'data.other.oldCompleteMatic': null,
                'data.other.recoilFlag': response.recoilFlag, // 是否回冲
            })
            this.metaAction.toast('success', '保存单据成功')
        }
        // 保存
        localStorage.setItem(`businessTypeId`, JSON.stringify(formParams.businessTypeId))
        if( isNew ) {
            this.injections.reduce('init')
            // 保存并新增
            let oldBusinessTypeId = localStorage.getItem(`oldBusinessTypeId`)
            let oldId = 'addInventoryOut', 
                inId = [5001001001, 5001001002, 5001001003, 5001001004, 5001001008, 5001001009]
            if(oldBusinessTypeId){
                // 过滤下拉框
                if(inId.indexOf(Number(oldBusinessTypeId)) > -1) oldId = 'addInventoryIn'
                await this.initLoad(null,null,oldId, null,isNew)

                this.metaAction.sf('data.form.businessTypeId', JSON.parse(oldBusinessTypeId))
                this.getCardCode(JSON.parse(oldBusinessTypeId))
            }else{
                if(inId.indexOf(Number(formParams.businessTypeId)) > -1) oldId = 'addInventoryIn'
                await this.initLoad(null,null,oldId,null, isNew)

                this.metaAction.sf('data.form.businessTypeId', formParams.businessTypeId)
                this.getCardCode(formParams.businessTypeId)

            }

            if (oldBusinessTypeId == 5001001007 && this.component.props.proMethod == 3) {
                const businessDate = this.metaAction.gf('data.form.businessDate')
                const res = await this.webapi.inventoryDoc.totalAndAmount({businessDate: businessDate.format('YYYY-MM-DD')})
                let detailAmountTotal = this.voucherAction.sumColumn("amount")
                if (res) {
                    this.metaAction.sfs({
                        'data.other.materialCost': addThousPos(res.materialCost || 0, true, null, 2),
                        'data.other.amountyu': addThousPos(res.amount || 0, true, null, 2),
                        'data.other.productAmount': addThousPos(res.productAmount || 0, true, null, 2),
                        'data.other.detailAmountTotal': detailAmountTotal
                    })
                }

            }

        }else {
            if(response){
                response.businessDate = moment(response.businessDate)
                this.metaAction.sf('data.form', fromJS(this.repairGetData(response)))

                setTimeout(()=>{
                    this.getDom({})
                }, 10)
            }
        }
        
        this.editCloseTips(false)
    }

    repairAttachment = (arr) => {
        if( !arr ) {
            return []
        }
        return arr.map(item =>{
            return {
                ...item,
                file: {
                    type: item.type,
                    id: item.fileId
                }
            }
        })
    }

    newAction = async(name) => {
        let editing = this.metaAction.gf('data.other.isSaved')
        if (editing) {
            const ret = await this.metaAction.modal('confirm', {
                content: '当前界面存在未保存数据，是否保存？'
            })
            if (ret) {
                this.save(false)
            } 
        } else{
            this.injections.reduce('init')
            this.noDel = false
            const initCreate = await this.webapi.inventoryDoc.initCreate()
            setTimeout(()=>{
                this.getDom({})
            }, 20)
            // 新增
            // 查看的时候，点新增，默认查看的那个业务类型
            // 普通新增，默认上次新增的业务类型
            let id = localStorage.getItem(`businessTypeId`)
            let oldBusinessTypeId = localStorage.getItem(`oldBusinessTypeId`)

            let newArr = [], inId = [5001001001, 5001001002, 5001001003, 5001001004, 5001001008, 5001001009],
                outId = [5001001005, 5001001006, 5001001007], nowId, oldId
            if(oldBusinessTypeId){
                this.metaAction.sf('data.form.businessTypeId', JSON.parse(oldBusinessTypeId))
                this.getCardCode(JSON.parse(oldBusinessTypeId))
                nowId = JSON.parse(oldBusinessTypeId)
                oldId = oldBusinessTypeId
            }else if(id) {
                this.metaAction.sf('data.form.businessTypeId', JSON.parse(id))
                this.getCardCode(JSON.parse(id))
                nowId = JSON.parse(id)
                oldId = id
            }

            // 生产核算方式
            if(oldId == '5001001003' || oldId == '5001001007'){
                this.handleAmount(oldId)
            }

            if(inId.indexOf(nowId) > -1){
                initCreate.businessTypeDtos.map(item => {
                    if(inId.indexOf(item.id) > -1) newArr.push(item)
                })
            }else if(outId.indexOf(nowId) > -1){
                initCreate.businessTypeDtos.map(item => {
                    if(outId.indexOf(item.id) > -1) newArr.push(item)
                })
            }
            initCreate.businessTypeDtos = newArr 
            this.injections.reduce('initLoad', { initCreate})
            // 点击新增，当前页面的单据id为null'
            this.metaAction.sf('data.other.oldFormId', null)
            this.getListAwait()
        }
    }

    prev = async () => {
        const type = this.metaAction.gf('data.form.businessTypeId')
        const code = this.metaAction.gf('data.form.code')
        const form = this.metaAction.gf('data.form').toJS()
        
        if( !type ) {
            return this.metaAction.toast('warn', '请选择一种业务类型')
        }
        const response = await this.webapi.inventoryDoc.previous({ code ,isReturnValue: true})
        
        if(response){
            if(response.businessTypeName == '采购入库' || response.businessTypeName == '盘盈入库' || response.businessTypeName == '暂估入库' || response.businessTypeName == '暂估回冲') {
                this.metaAction.sf('data.other.listFlag', true)
            }else {
                this.metaAction.sf('data.other.listFlag', false)
            }
            if (response.result == false && response.error) {
                this.metaAction.sfs({
                    'data.other.prevDisalbed': true,
                    'data.other.nextDisalbed': false
                })
                this.metaAction.toast('error', response.error.message)
                if(form.businessTypeName == '采购入库' || form.businessTypeName == '盘盈入库' || form.businessTypeName == '暂估入库' || form.businessTypeName == '暂估回冲') {
                    this.metaAction.sf('data.other.listFlag', true)
                }else {
                    this.metaAction.sf('data.other.listFlag', false)
                }
                return false
            } else {
                this.metaAction.sf('data.other.nextDisalbed', false)
            }

            this.getListAwait()
            response.businessDate = moment(response.businessDate)
            const result = this.repairGetData(response)
            localStorage.setItem(`oldBusinessTypeId`, response.businessTypeId)
            this.metaAction.sfs({
                'data.other.typeName': `${response.businessTypeName}单`,
                'data.form': fromJS(result),
            })
            this.isDisAble(response)
            
            if(response.businessTypeId == '5001001003' || response.businessTypeId == '5001001007'){
                this.handleAmount(response.businessTypeId)
            }

            setTimeout(()=>{
                this.getDom({})
            }, 10)
        }
    }

    handleAmount = async(id) => {
        const dateff  = this.metaAction.gf('data.form.businessDate')
        let list = [
            this.webapi.inventoryDoc.getCalcMode(),
        ]

        if (id == '5001001007' && this.component.props.proMethod == 3) {
            list.push(this.webapi.inventoryDoc.totalAndAmount({businessDate: dateff.format('YYYY-MM-DD')}))
        }

        const res =  await Promise.all(list)
        let sfsObj = {}
        if (res&& res[0]) {
            sfsObj['data.other.proMethod'] = res[0].productionAccounting == '0' ? false : true
            sfsObj['data.other.isNew'] = res[0].productionAccounting == '3' ? true : false
            sfsObj['data.other.type'] = res[0].mode
        }

        if (res&& res[1]) {
            let detailAmountTotal = this.voucherAction.sumColumn("amount")
            sfsObj['data.other.materialCost'] = addThousPos(res[1].materialCost || 0, true, null, 2)
            sfsObj['data.other.amountyu'] = addThousPos(res[1].amount || 0, true, null, 2)
            sfsObj['data.other.productAmount'] = addThousPos(res[1].productAmount || 0, true, null, 2)
            sfsObj['data.other.detailAmountTotal']= detailAmountTotal
        }
        this.metaAction.sfs(sfsObj)
    }

    next = async () => {
        const type = this.metaAction.gf('data.form.businessTypeId')
        const code = this.metaAction.gf('data.form.code')
        const form = this.metaAction.gf('data.form').toJS()
        if( !type ) {
            return this.metaAction.toast('warn', '请选择一种业务类型')
        }
        const response = await this.webapi.inventoryDoc.next({ code, isReturnValue: true })
        if(response){
            if(response.businessTypeName == '采购入库' || response.businessTypeName == '盘盈入库' || response.businessTypeName == '暂估入库' || response.businessTypeName == '暂估回冲') {
                this.metaAction.sf('data.other.listFlag', true)
            }else {
                this.metaAction.sf('data.other.listFlag', false)
            }
            if (response.result == false && response.error) {
                this.metaAction.sfs({
                    'data.other.prevDisalbed': false,
                    'data.other.nextDisalbed': true
                })
                this.metaAction.toast('error', response.error.message)
                if(form.businessTypeName == '采购入库' || form.businessTypeName == '盘盈入库' || form.businessTypeName == '暂估入库' || form.businessTypeName == '暂估回冲') {
                    this.metaAction.sf('data.other.listFlag', true)
                }else {
                    this.metaAction.sf('data.other.listFlag', false)
                }
                return false
            } else {
                this.metaAction.sf('data.other.prevDisalbed', false)
            }

            this.getListAwait()
            response.businessDate = moment(response.businessDate)
            const result = this.repairGetData(response)
            localStorage.setItem(`oldBusinessTypeId`, response.businessTypeId)
            this.metaAction.sfs({
                'data.other.typeName': `${response.businessTypeName}单`,
                'data.form': fromJS(result),
            })
            this.isDisAble(response)

            if(response.businessTypeId == '5001001003' || response.businessTypeId == '5001001007'){
                this.handleAmount(response.businessTypeId)
            }

            setTimeout(()=>{
                this.getDom({})
            }, 10)
        }
    }

    isDisAble = (result) => {
        let isManualCost = false
        if(result.businessTypeId == 5001001001 || result.businessTypeId == 5001001005) {  // 采购入库/销售出库
            if(result.sourceVoucherCode){
                if(result.sourceVoucherCode.slice(0,2) == 'XX' || result.sourceVoucherCode.slice(0,2) == 'JX') isManualCost = true
            }
        }else if(result.autoTempBill && (result.businessTypeId == 5001001008 || result.businessTypeId == 5001001004)){  // 暂估、回冲
            this.noDel = true
            isManualCost = true
        }
        if(result && result.docCode) isManualCost = true
        this.metaAction.sfs({
            'data.other.isSaved': false,
            'data.other.docCode': result.docCode,
            'data.other.docId': result.docId,
            'data.other.isAdd': isManualCost,  // 单据是否可编辑
            'data.other.typeAble': true,  // 业务类型不可编辑
            'data.form.attachmentStatus': isManualCost ? 1 : 0,  // 附件查看状态
            'data.other.oldCode': result.sourceVoucherCode ? result.sourceVoucherCode : '', // 销项进项自动生成的采购销售单
        })
    }

    getIsXX = () => {  // 销项发票生成的 销售出库单 单价和金额应该可以修改
        let oldCode = this.metaAction.gf('data.other.oldCode'),
        businessTypeId = this.metaAction.gf('data.form.businessTypeId'),
        docCode = this.metaAction.gf('data.other.docCode')
        if(docCode){
            return true
        }else if(oldCode && businessTypeId == 5001001005){
            return false
        }else{
            return true
        }
    }

    renderDel = ()=> {
        let id = this.metaAction.gf('data.form.businessTypeId')
        if(id == 5001001008 && this.noDel){  // 自动生成的暂估回冲，可以点，删不掉
            return false 
        }
    }

    repairGetData = (data) => {
        // deepClone 一个对象
        
        const result = fromJS(data).toJS()

        if(result.businessTypeId == '5001001003'){
            result.allCost = (result.materialCost||0) + (result.laborCost||0) + (result.manufacturCost||0) + (result.otherCost||0)
            result.allCost = utils.number.round(result.allCost, 2)
        }
        if( result.department ) {
            result.departmentName = result.department.name
            delete result.department
        }
        if( result.project ) {
            result.projectName = result.project.name
            delete result.project
        }
        if( result.customer ) {
            result.customerName = result.customer.name
            delete result.customer
        }
        if( result.supplierDto ) {
            result.supplierName = result.supplierDto.name
            delete result.supplierDto
        }

        if(result.attachments){
            result.attachments.map(item => {
                if (item) {
                    item.accessUrl = item.file.accessUrl
                    item.type = item.file.type
                }
            })
            result.attachmentFiles = result.attachments 
        }
        
        result.details = result.details.map((item) => {
            let inventory = item.inventory
            let obj = {
                inventoryCode: inventory.code,
                inventoryId: inventory.id,
                inventoryName: inventory.name,
                specification: inventory.specification,
                unitName: inventory.unitName
            }
            if(item.absorption) item.absorption = Number(item.absorption)
            delete item.inventory
            return {
                ...item,
                ...obj,
                amount: utils.number.round(item.amount||0, 2),
            }
        })

        const length = result.details.length
        for( let i = length; i < 8 ; i++ ) {
            result.details.push(blankDetail)
        }
        return result
    }

    getDisplayErrorMSg = (msg) => {
        return <div style={{ display: 'inline-table' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
    }

    cancel = () => {
        this.injections.reduce('init')
    }

    onFieldChange = (field, storeField,rowIndex,rowData,index ) => async(id, isFromInit) => {
        if (!field || !storeField) return

        if(id == 5001001001 || id == 5001001002 || id == 5001001004 || id == 5001001008) {
            this.metaAction.sf('data.other.listFlag', true)
        }else {
            this.metaAction.sf('data.other.listFlag', false)
        }

        if(id == '5001001003' && !isFromInit) {  // 产品入库单 
            const dateff  = this.metaAction.gf('data.form.businessDate')
            let filter = {
                businessDate: dateff.format('YYYY-MM-DD'),
                flag : 'yxdc',
                operateTriggerSource: 1
            }
            // const isNeed = await this.webapi.inventoryDoc.isNeedReCalcCost(filter)

            const response = await Promise.all([
                this.webapi.inventoryDoc.isNeedReCalcCost(filter),
                this.webapi.inventoryDoc.initRatioAccountList({
                    year: dateff.format('YYYY-MM').slice(0, 4),
                    month: dateff.format('YYYY-MM').substring(5),
                })
            ])

            let isNeed = response[0]
            let isHaveList = response[1]
            if(isNeed && isNeed != 'no' && isHaveList.details.length){
                // const retCalc = await this.metaAction.modal('confirm', {
                //     content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                //     okText: '成本计算',
                // })
                // if(retCalc) {
                //     let filter1 = {
                //         year: dateff.format('YYYY-MM').slice(0,4),
                //         month: dateff.format('YYYY-MM').substring(5),
                //     }
                //     const res = await this.webapi.inventoryDoc.reCalcCost(filter1)
                //     if(res) {
                //         this.metaAction.toast('success', '计算成功')
                //     }else{
                //         return false
                //     }
                // }else{
                //     return false
                // }

                const retCalc = await this.metaAction.modal('confirm', {
                    content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                    okText: '按比例自动计算销售成本',
                })

                if(retCalc) {
                    // let lastDayOfUnEndingClosingCalendar = this.component.props.lastDayOfUnEndingClosingCalendar
                    const ret = await this.metaAction.modal('show', {
                        title: '按比例自动计算销售成本',
                        wrapClassName: 'inventory-automaticcalculation',
                        width: 900,
                        okText: '确定',
                        bodyStyle: { padding: '0' },
                        closeModal: this.close,
                        closeBack: (back) => { this.closeTip = back },
                        children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                            store: this.component.props.store,
                            initData: {
                                date: dateff.format('YYYY-MM-DD'),
                                lastDayOfUnEndingClosingCalendar: isHaveList ? isHaveList.lastDayOfUnEndingClosingCalendar : '',
                                type: 'costSaleRatio',
                                isDoc: true
                            }
                        }),
                    })

                    if (ret) {
                        this.metaAction.toast('success', '计算成功')
                    } else {
                        return false
                    }
                } else {
                    return false
                }

            }
        }

        if(storeField == 'data.other.supplier'){
            this.injections.reduce('updateState', 'data.form.supplierError', false)
        }
        if(storeField == 'data.other.customer'){   
            this.injections.reduce('updateState', 'data.form.customerError', false)
        }   
        if(storeField == 'data.other.bussinessType'){   
            this.injections.reduce('updateState', 'data.form.businessTypeError', false)
        }

        // 其他类型改为产品入库/材料出库单时
        if((id == '5001001003' || id == '5001001007') && !isFromInit){  
            let details = this.metaAction.gf('data.form.details').toJS()
            if(details && details.length){
                let newDetail = [], isHave = false, namePro, namePros
                if(id == '5001001003') {
                    namePro = '商品'
                    namePros = '半成品'
                }else{
                    namePro = '原材料'
                    namePros = '周转材料'
                }
                details.map(item => {
                    if(item.inventoryName){  
                        if(item.propertyName == namePro || item.propertyName == namePros) {
                            newDetail.push(item)
                        }else{
                            isHave = true  // 存在别的商品属性
                        }
                    }else{
                        newDetail.push(item)
                    }
                })
                if(isHave){
                    let titName
                    if(id == '5001001003') {
                        titName = '产品入库单'
                    }else{
                        titName = '材料出库单'
                    }
                    const ret = await this.metaAction.modal('confirm', {
                        title: titName,
                        content: `${titName}的明细必须是存货分类为"${namePro}"或"${namePros}"的存货，其他存货分类的商品明细将自动清空，是否确认修改？`
                    })
                    if(ret){
                        this.metaAction.sf('data.form.details', fromJS(newDetail))
                    }else{
                        return
                    }
                }
            }
            
            this.handleAmount(id)
        }

        let store = this.metaAction.gf(storeField), value
        if(store){
            value = store.find(o => o.get('id') == id)
        }
        if (value) {
            Object.keys(field).forEach(key => {
                this.metaAction.sf(field[key], value.get(key))
            })
        }else{
            Object.keys(field).forEach(key => {
                this.metaAction.sf(field[key], undefined)
            })
        }
        if( storeField === 'data.other.bussinessType' && value) {
            this.getCardCode(value.get('id'))
        }

        // 带出结存数量和结存金额
        let businessTypeId = this.metaAction.gf('data.form.businessTypeId'),
        type = this.metaAction.gf('data.other.type'),
        date  = this.metaAction.gf('data.form.businessDate')
        if(date) date = date.format('YYYY-MM')
        if(storeField == 'data.other.inventory' && type == 4 && businessTypeId == 5001001003){
            const ret = await this.webapi.inventoryDoc.loadPeriodEndData({inventoryId: id, businessDate: date})
            if(ret){
                let periodEndQuantity 
                if(ret.periodEndQuantity) periodEndQuantity = utils.number.format(Number(ret.periodEndQuantity), 6)
                let periodEndAmount 
                if(ret.periodEndAmount) periodEndAmount = utils.number.format(Number(ret.periodEndAmount), 2)
                this.metaAction.sfs({
                    [`data.form.details.${rowIndex}.periodEndQuantity`]: periodEndQuantity || null,
                    [`data.form.details.${rowIndex}.periodEndAmount`]: periodEndAmount || null
                })
            }
        }

        if(!isFromInit){
            setTimeout(()=>{
                this.getDom({})
            }, 10)
            this.editCloseTips(true)
            this.metaAction.sf('data.other.isSaved', true)
        }
    }

    //获取单据编号
    getCardCode = async(id) => {
        const item =  bussinessTypePrefix.find(o => o.id == id)
        const date  = this.metaAction.gf('data.form.businessDate')
        // return 
        const code = await this.webapi.inventoryDoc.getcode({
            "businessDate": date.format('YYYY-MM-DD'),
            "codePrefix": item.prefix
        })
        this.metaAction.sfs({
            'data.form.code': code,
            'data.other.typeName': `${item.name}单`
        })
    }

    getFullName = (list) => {
        list.map(item => {
            item.fullName = `${item.code} ${item.name} ${item.propertyName} ${item.unitName ? item.unitName : ''}`
            let arr = [item.code, item.name, item.propertyName];
            if (item.unitName) arr.push(item.unitName)
            item.fullNameArr = arr
            return item;
        })
        return list
    }

    getFullNameChildren = (option) => {
        
        return <div>{
            option.fullNameArr && option.fullNameArr.map((item, index) => {
                return <span className={`fullname${index}`}>{item}</span>
            })
        }</div>
    }

    renderInventoryTitle = (value, name, nameValue) => {
        
        const inventory = this.metaAction.gf(name) && this.metaAction.gf(name).toJS()
        if (!value) {
            return nameValue || ''
        }
        if (inventory && inventory.length) {
            let obj = inventory.find(obj => obj.id == value);
            if (obj) {
                
                return obj.fullName
            }
        }
        return nameValue || ''
    }
    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) {
            return false
        }
        //需要确定部门项目这些是否也需要支持助记码这些的搜索
        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName= name.currentPath
        }
        if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('department') != -1) {
            parmasName = 'department'
        } else if (parmasName.indexOf('project') != -1) {
            parmasName = 'project'
        } 

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`)
        
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        if (!paramsValue) {
            return false
        }

        let regExp = new RegExp(inputValue, 'i')

        if(parmasNameCode){
            return paramsValue.get('name').search(regExp) != -1
            || paramsValue.get('code').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        }else{
            return paramsValue.get('name').search(regExp) != -1
            || paramsValue.get('code').search(regExp) != -1
            || paramsValue.get('helpCode').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        }
    }

    // 供应商搜索
    filterOptionArchives = (name,inputValue, option) => {
        const namePrmas = {
            currentPath: name
        }
        return this.filterOption(inputValue, option, namePrmas)
    }
    //存货编码
    filterOptionCode = (inputValue, option) => {
        if (!option || !option.props || !option.props.value) {
            return false
        }
        const paramsValues = this.metaAction.gf(`data.other.inventory`),
            value = option.props.value
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        if (!paramsValue) {
            return false
        }
        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.get('code').search(regExp) != -1
    }

    //附件的下载操作
    download = (ps) => {
        // this.voucherAction.download(ps)
        const form = this.metaAction.gf('data.form').toJS()
        if (form.id) {
            ps = ps.file ? ps.file : ps
        }
        this.voucherAction.download(ps)
    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return { token: token }
    }

    delFile = (index) => {
        let form = this.metaAction.gf('data.form').toJS()
        this.voucherAction.delFile(index, 'vouchers', this.updateEnclosure)
    }

    updateEnclosure = async (res) => {
        res.ts = ''
        const result = await this.webapi.inventoryDoc.updateEnclosure(res)
        return result
    }

    attachmentChange = (info) => {
        const isLt10M = this.metaAction.gf('data.other.isLt10M')
        if (isLt10M) {
            return
        }
        this.voucherAction.attachmentChange(info, 'vouchers', this.updateEnclosure)
    }

    //附件上传之前检查
    beforeUpload = async (info, infoList) => {
        this.injections.reduce('updateState', 'data.other.isLt10M', false)
        const isLt10M = info.size / 1024 / 1024 < 10
        if (!isLt10M) {
            this.metaAction.toast('warning', '文件过大，请上传小于10兆的附件')
            this.injections.reduce('attachmentLoading', false)
            this.injections.reduce('updateState', 'data.other.isLt10M', true)
            return 
        }

        let attachmentFiles = this.metaAction.gf('data.form.attachmentFiles') && this.metaAction.gf('data.form.attachmentFiles').toJS() || []
        return new Promise((resolve, reject) => {
            if (attachmentFiles.length + infoList.length > 20) {
                this.metaAction.toast('warning', `当前凭证的附件数为${attachmentFiles.length}，只能继续上传${20 - attachmentFiles.length}个附件`)
                reject(info)
            } else {
                resolve(info)
            }
        })

    }

    getDisable = (type) => {
        let isDocode = this.metaAction.gf('data.other.docCode')
        if(isDocode) {
            return true
        }else if(type == 'bussinessType'){
            let typeAble = this.metaAction.gf('data.other.typeAble')
            if(typeAble) return typeAble
        }else{
            let isAdd = this.metaAction.gf('data.other.isAdd')
            return isAdd
        }
    }
    renderPro = (isCost) =>{
        let isDocode = this.metaAction.gf('data.other.docCode')
        let type = this.metaAction.gf('data.other.type')
        if(isCost == 'isCost') return true
        if(isDocode) {
            return true
        }else{
            return false
        }
    }

    checkDisabled = () => {
        let isDocode = this.metaAction.gf('data.other.docCode')   //生成凭证
        return isDocode && (this.getProVisible("5001001003") || this.getProVisible("5001001007"))
    }

    isRecoil = () => {
        let recoilFlag = this.metaAction.gf('data.other.recoilFlag')   //已回冲
        return recoilFlag && (this.getProVisible("5001001001"))
    }

    //下拉选 票据类型 供应商
    handleSelect = (params, isName) => {
        params = params && params.toJS()
        if (params) {
            if(isName){
                return params.map((item,index) => {
                    return <Option key={item.id} value={item && item.id}>{item && `${item.code} ${item.name}`}</Option>
                })
            }else{
                return params.map((item,index) => {
                    return <Option key={item.id} value={item && item.id}>{item && item.name}</Option>
                })
            }
        }
    }

    //新增档案
    addRecordClick = async (add, params, index, rowData) => {
        if (params == 'inventory') {
            const resInventory = await this.voucherAction[add]('data.other.inventoryItem', 'get')
            if(!resInventory) return

            let inventory = this.metaAction.gf('data.other.inventory').toJS()
            // const inventoryItem = this.metaAction.gf('data.other.inventoryItem') && this.metaAction.gf('data.other.inventoryItem').toJS()
            let type = this.metaAction.gf('data.form.businessTypeId')
            if(resInventory){
                if(type == '5001001003' || type == '5001001007'){
                    let typeName, typeNames
                    if(type == '5001001003'){
                        typeName = '商品'
                        typeNames = '半成品'
                    }else{
                        typeName = '原材料'
                        typeNames = '周转材料'
                    }
                    if(resInventory.propertyName == typeName || resInventory.propertyName == typeNames){
                        let inventoryItem = this.getFullName([resInventory])
                        inventory.push(inventoryItem[0])
                        this.metaAction.sf('data.other.inventory', fromJS(inventory))

                        let filed = {
                            id:  `data.form.details.${index}.inventoryId`,
                            name: `data.form.details.${index}.inventoryName`,
                            code: `data.form.details.${index}.inventoryCode`,
                            unitId: `data.form.details.${index}.unitId`,
                            unitName: `data.form.details.${index}.unitName`,
                            propertyName: `data.form.details.${index}.propertyName`,
                            taxRateName: `data.form.details.${index}.taxRateName`,
                            specification: `data.form.details.${index}.specification`
                        }
                        this.onFieldChange(filed,'data.other.inventory',index,rowData)(resInventory.id)
                    }
                }else if(resInventory.propertyName == '商品' || resInventory.propertyName == '原材料' || resInventory.propertyName == '周转材料' || resInventory.propertyName == '半成品'){
                    let inventoryItem = this.getFullName([resInventory])
                    inventory.push(inventoryItem[0])
                    this.metaAction.sf('data.other.inventory', fromJS(inventory))

                    let filed = {
                        id:  `data.form.details.${index}.inventoryId`,
                        name: `data.form.details.${index}.inventoryName`,
                        code: `data.form.details.${index}.inventoryCode`,
                        unitId: `data.form.details.${index}.unitId`,
                        unitName: `data.form.details.${index}.unitName`,
                        propertyName: `data.form.details.${index}.propertyName`,
                        taxRateName: `data.form.details.${index}.taxRateName`,
                        specification: `data.form.details.${index}.specification`
                    }
                    this.onFieldChange(filed,'data.other.inventory',index,rowData)(resInventory.id)
                }
            }
        } else {
            await this.voucherAction[add](`data.other.${params}s`)

            if(params == 'supplier'){
                this.injections.reduce('updateState', 'data.form.supplierError', false)
            }
            if(params == 'customer'){   
                this.injections.reduce('updateState', 'data.form.customerError', false)
            }   

            const res = this.metaAction.gf(`data.other.${params}s`).toJS()
            const list = this.metaAction.gf(`data.other.${params}`).toJS()
            list.push(res)
            this.metaAction.sfs({
                [`data.other.${params}`]: fromJS(list),
                [`data.form.${params}Id`]: res.id,
                [`data.form.${params}Name`]: res.name
            })
        }
    }

    // 获取存货
    getInventorys = async(_rowIndex) => {
        let type = this.metaAction.gf('data.form.businessTypeId')
        await this.voucherAction.getInventory({entity:{isEnable:true}}, `data.other.inventory`)
        let inventory = this.metaAction.gf('data.other.inventory')
        inventory = inventory.size ? inventory.toJS() : inventory
        let newInventory = []
        if(type == '5001001003'){
            inventory.map(item=>{
                if(item.propertyName == '商品' || item.propertyName == '半成品') newInventory.push(item)
            })
        }else if(type == '5001001007'){
            inventory.map(item=>{
                if(item.propertyName == '原材料' || item.propertyName == '周转材料') newInventory.push(item)
            })
        }else{
            inventory.map(item=>{
                if(item.propertyName == '商品' || item.propertyName == '半成品' || item.propertyName == '原材料' || item.propertyName == '周转材料') newInventory.push(item)
            })
        }
        let invenList = this.metaAction.gf('data.form.details') && this.metaAction.gf('data.form.details').toJS()
        let oldId = this.metaAction.gf(`data.form.details.${_rowIndex}.inventoryId`) 
        let oldName = this.metaAction.gf(`data.form.details.${_rowIndex}.inventoryName`) 
        let nowId = invenList.find(item => oldName == item.inventoryName)
        if(oldName){
            let isHave = newInventory.find(item=> item.id == oldId)
            if(!isHave){
                this.metaAction.sf(`data.form.details.${_rowIndex}.inventoryId`, undefined)
            }
        }
        let inventoryArr = this.getFullName(newInventory)
        this.metaAction.sf('data.other.inventory', fromJS(inventoryArr))
    }

    //新增 部门 项目 供应商
    handleAddRecord = (paramsU,params,index,rowData) => {
        const add = `add${paramsU}`
        return <Button type='primary' 
        style={{ width: '100%', borderRadius: '0' }}
        onClick={this.addRecordClick.bind(null,add,params,index,rowData)}
        >新增</Button>
    }

    //控制显示
    handleVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.setting')
        columnSetting = columnSetting && columnSetting.toJS()
        if (columnSetting) {
            return !!columnSetting.header && columnSetting.header.cards.filter(o=> o.fieldName == params )[0].isVisible
        }
    }

    //控制可选择的日期
    disabledDate = (current) => {
        if(current){
            const enableDate = this.metaAction.gf('data.other.enableDate')
            let enableDateNum = parseInt(moment(enableDate).format('YYYYMMDD'))
            let currentNum = parseInt(current.format('YYYYMMDD'))
            return currentNum < enableDateNum ? true : false
        }
    }

    changeDate = async(path, value) => {
        
        if(path == 'data.form.businessDate'){
            let id = this.metaAction.gf('data.form.businessTypeId')
            if(id) this.getCardCode(id)

            // 日期校验
            const businessDateError = this.metaAction.gf('data.form.businessDateError')
            if(businessDateError) this.injections.reduce('updateState', 'data.form.businessDateError', false)

            if(id == 5001001007 && this.component.props.proMethod == 3) {
                const businessDate = this.metaAction.gf('data.form.businessDate').format('YYYY-MM-DD')
                const valueDate = moment(value).format('YYYY-MM-DD')

                if (businessDate.split('-')[1] != valueDate.split('-')[1]) {
                    let date = valueDate.slice(0,7)
                    date = `${date}-01`
                    // const res = await this.webapi.inventoryDoc.totalAndAmount({businessDate: valueDate})
                    const res = await this.webapi.inventoryDoc.totalAndAmount({businessDate: date})
                    // let detailAmountTotal = this.voucherAction.sumColumn("amount")
                    if (res) {
                        this.metaAction.sfs({
                            'data.other.materialCost': addThousPos(res.materialCost || 0, true, null, 2),
                            'data.other.amountyu': addThousPos(res.amount || 0, true, null, 2),
                            'data.other.productAmount': addThousPos(res.productAmount || 0, true, null, 2),
                            // 'data.other.detailAmountTotal': detailAmountTotal
                        })
                    }
                }
            }
        }

        this.metaAction.sf(path, value)
        this.metaAction.sf('data.other.isSaved', true)
        this.editCloseTips(true)
    }

    // 以销定产 材料出库单 余额
    handleAmountYu = (amount) => {
        let detailAmountTotal = this.voucherAction.sumColumn("amount"),
        id = this.metaAction.gf('data.form.id'),
        detailAmountTotalOld = this.metaAction.gf('data.other.detailAmountTotal')

        detailAmountTotal = clearThousPos(detailAmountTotal)
        detailAmountTotalOld = clearThousPos(detailAmountTotalOld)
        // console.log(this.isEditing, detailAmountTotal, detailAmountTotalOld, 'this.isEditing')
        if(id) {
            // if (!this.isEditing) {
            //     amount = clearThousPos(amount)
            //     return addThousPos(amount || 0, true, null, 2) ? addThousPos(amount || 0, true, null, 2) : '0.00'
            // } else 
            if (Number(detailAmountTotal) == Number(detailAmountTotalOld)) {
                const materialCost = this.metaAction.gf('data.other.materialCost')
                let oldFormId = this.metaAction.gf('data.other.oldFormId')

                // if ( Number(clearThousPos(materialCost)) == 0) {
                //     amount = clearThousPos(amount)
                //     const newAmount = Number(amount) - Number(detailAmountTotal)
                //     this.metaAction.sf('data.other.amountbj', newAmount ? addThousPos(newAmount || 0, true, null, 2) : '0.00')
                //     return  newAmount ? addThousPos(newAmount || 0, true, null, 2) : '0.00'
                // }
                if ( Number(clearThousPos(materialCost)) == 0 && !oldFormId) {
                    amount = clearThousPos(amount)
                    const newAmount = Number(amount) - Number(detailAmountTotal)
                    this.metaAction.sf('data.other.amountbj', newAmount ? addThousPos(newAmount || 0, true, null, 2) : '0.00')
                    return  newAmount ? addThousPos(newAmount || 0, true, null, 2) : '0.00'
                }

                amount = clearThousPos(amount)
                this.metaAction.sf('data.other.amountbj', addThousPos(amount || 0, true, null, 2) ? addThousPos(amount || 0, true, null, 2) : '0.00')
                return addThousPos(amount || 0, true, null, 2) ? addThousPos(amount || 0, true, null, 2) : '0.00'
            } else {
                amount = clearThousPos(amount)
                detailAmountTotal = clearThousPos(detailAmountTotal)

                const newAddAmount = Number(detailAmountTotal) - Number(detailAmountTotalOld)
                const value = addThousPos((Number(amount) - newAddAmount) || 0, true, null, 2) 
                this.metaAction.sf('data.other.amountbj', value ? value : '0.00')
                // const value = addThousPos((Number(amount) - Number(detailAmountTotal)) || 0, true, null, 2) 
                return value ? value : '0.00'
            }
        } else {
            amount = clearThousPos(amount)
            detailAmountTotal = clearThousPos(detailAmountTotal)

            const newAddAmount = Number(detailAmountTotal) - Number(detailAmountTotalOld)
            const value = addThousPos((Number(amount) - newAddAmount) || 0, true, null, 2) 
            this.metaAction.sf('data.other.amountbj', value ? value : '0.00')
            // const value = addThousPos((Number(amount) - Number(detailAmountTotal)) || 0, true, null, 2) 
            return value ? value : '0.00'
        }
        
    }
    
    //渲染表头
    renderFormContent = () => {
        let businessDate = this.metaAction.gf('data.form.businessDate'),
            remark = this.metaAction.gf('data.form.remark'),
            bussinessType = this.metaAction.gf('data.other.bussinessType'),
            bussinessTypeValue = this.metaAction.gf('data.form.businessTypeId'),
            businessTypeName = this.metaAction.gf('data.form.businessTypeName'),
            supplierName = this.metaAction.gf('data.form.supplierName'),
            supplierId = this.metaAction.gf('data.form.supplierId'),
            supplier = this.metaAction.gf('data.other.supplier'),
            customerName = this.metaAction.gf('data.form.customerName'),
            customerId = this.metaAction.gf('data.form.customerId'),
            customer = this.metaAction.gf('data.other.customer'),
            businessTypeId = this.metaAction.gf('data.form.businessTypeId'),
            supplierError = this.metaAction.gf('data.form.supplierError'),
            customerError = this.metaAction.gf('data.form.customerError'),
            businessType = this.metaAction.gf('data.form.businessTypeError'),
            businessDateError = this.metaAction.gf('data.form.businessDateError'),
            materialCost = this.metaAction.gf('data.other.materialCost'),
            amountyu = this.metaAction.gf('data.other.amountyu')

        let supplierArr = this.metaAction.gf('data.other.supplier'), supplierNow
        if (supplierArr) {
            supplierArr = supplierArr.size ? supplierArr.toJS() : supplierArr
            supplierArr.map(item => {
                if (item.id == supplierId && item.isEnable) {
                    supplierNow = item.id
                }
            })
            if (!supplierNow) supplierName = undefined
        }
        let customerArr = this.metaAction.gf('data.other.customer'), customerNow
        if (customerArr) {
            customerArr = customerArr.size ? customerArr.toJS() : customerArr
            customerArr.map(item => {
                if (item.id == customerId && item.isEnable) {
                    customerNow = item.id
                }
            })
            if (!customerNow) customerName = undefined
        }
        const archives = this.renderArchives()
        let bussinessTypeArr = bussinessType.toJS().filter(m=>m.id==bussinessTypeValue)

        let name = this.metaAction.gf('data.form.businessTypeId')
        const isShowYuE = this.component.props.proMethod == 3 && name == 5001001007 ? true : false 
        
        let defaultContentArr = [
            <FormItem label='单据日期' validateStatus={!businessDateError ? 'success' : 'error'}
                required={true}
            >
                <DatePicker
                    value={businessDate}
                    autoFocus={true}
                    className='businessDate_container'
                    getCalendarContainer={() => document.getElementsByClassName('businessDate_container')[0]}
                    onChange={(d) => this.changeDate('data.form.businessDate', d)}
                    disabled={this.getDisable()}
                    disabledDate={ this.disabledDate }
                >
                </DatePicker>
            </FormItem>,
            <FormItem label='业务类型' required={true} validateStatus={!businessType ? 'success' : 'error'}>
                <Select
                    className='autoFocus_item'
                    showSearch={false}
                    disabled={this.getDisable('bussinessType')}
                    value={bussinessTypeArr.length ? bussinessTypeValue : businessTypeName}
                    onChange={this.onFieldChange({ id: `data.form.businessTypeId`, name: `data.form.businessTypeName` }, `data.other.bussinessType`)}
                >
                    {this.handleSelect(bussinessType)}
                </Select>
            </FormItem>,
            <FormItem label='本月产成品入库直接材料合计' className='addAmountCss allCost' style={{display: isShowYuE ? 'flex' : 'none'}}>
                <span>{materialCost || '0.00'}</span>
            </FormItem>,
            <FormItem label='余额' style={{display: isShowYuE ? 'flex' : 'none'}} className='amountyuCss allCost'>
                {/* <span>{amountyu || '0.00'}</span> */}
                <span>{this.handleAmountYu(amountyu || '0.00')}</span>
            </FormItem>
        ]
        if( businessTypeId == 5001001001 || businessTypeId == 5001001004 || businessTypeId == 5001001008) {
            defaultContentArr.push(
                <FormItem label='供应商' required={true} validateStatus={!supplierError ? 'success' : 'error'}>
                    <Select
                        showSearch={true}
                        className='autoFocus_item'
                        key='supplier'
                        filterOption={this.filterOptionArchives.bind(null, 'supplier')}
                        placeholder='按名称/拼音搜索'
                        disabled={this.getDisable()}
                        value={supplierName}
                        onFocus={() => this.voucherAction.getSupplier({entity:{isEnable:true}}, `data.other.supplier`)}
                        dropdownFooter={this.handleAddRecord('Supplier', 'supplier')}
                        onChange={this.onFieldChange({ id: `data.form.supplierId`, name: `data.form.supplierName` }, `data.other.supplier`)}
                    >
                        {this.handleSelect(supplier)}
                    </Select>
                </FormItem>
            )
        }else if(businessTypeId == '5001001005'){
            defaultContentArr.push(
                <FormItem label='客户' required={true} validateStatus={!customerError ? 'success' : 'error'}>
                    <Select
                        showSearch={true}
                        className='autoFocus_item'
                        key='customer'
                        filterOption={this.filterOptionArchives.bind(null, 'customer')}
                        placeholder='按名称/拼音搜索'
                        disabled={this.getDisable()}
                        value={customerName}
                        onFocus={() => this.voucherAction.getCustomer({entity:{isEnable:true}}, `data.other.customer`)}
                        dropdownFooter={this.handleAddRecord('Customer', 'customer')}
                        onChange={this.onFieldChange({ id: `data.form.customerId`, name: `data.form.customerName` }, `data.other.customer`)}
                    >
                        {this.handleSelect(customer)}
                    </Select>
                </FormItem>
            )
        }
        if(archives){
            archives.map(item=>{
                if(item) defaultContentArr.push(item)
            })
        }
        this.handleVisible('remark') ? defaultContentArr.push(
            <FormItem label='备注' 
                className='ttk-scm-app-inventory-documents-form-header-remark'>
                <Input
                    value={remark}
                    className='autoFocus_item'
                    maxlength= {200}
                    onChange={(e) => this.changeDate('data.form.remark', e.target.value)}
                    disabled={this.getDisable()}>
                </Input>
            </FormItem>
        ) : ''
        return defaultContentArr
    }
    renderArchives = () => {
        let columnSetting = this.metaAction.gf('data.setting'),
            departmentName = this.metaAction.gf('data.form.departmentId') ? this.metaAction.gf('data.form.departmentId') : undefined,
            projectName = this.metaAction.gf('data.form.projectId') ? this.metaAction.gf('data.form.projectId') : undefined,
            department = this.metaAction.gf('data.other.department'),
            project = this.metaAction.gf('data.other.project') 

        let projectArr = this.metaAction.gf('data.other.project'), projectNow
        if (projectArr) {
            projectArr = projectArr.size ? projectArr.toJS() : projectArr
            projectArr.map(item => {
                if (item.id == projectName && item.isEnable) {
                    projectNow = item.id
                }
            })
            projectName = projectNow ? projectName : undefined
        }
        let departmentArr = this.metaAction.gf('data.other.department'), departmentNow 
        if (departmentArr) {
            departmentArr = departmentArr.size ? departmentArr.toJS() : departmentArr
            departmentArr.map(item => {
                if (item.id == departmentName) departmentNow = true
            })
            if (!departmentNow) departmentName = undefined
        }

        columnSetting = columnSetting && columnSetting.toJS()
        const archivesArr = [
            { label: '部门', name: 'department', upName: 'Department', value: departmentName, optionArr: department },
            { label: '项目', name: 'project', upName: 'Project', value: projectName, optionArr: project },
        ]

        if (columnSetting) {
            let domArr = archivesArr.map((item) => {
                let isVisible = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].isVisible
                let caption = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].caption
                if (isVisible) {
                    return (
                        <FormItem label={caption}>
                            <Select
                                className="autoFocus_item"
                                showSearch={true}
                                allowClear={true}
                                key={item.name}
                                filterOption={this.filterOptionArchives.bind(null, item.name)}
                                placeholder='按名称/拼音/编码搜索'
                                disabled={this.getDisable()}
                                value={item.value}
                                onFocus={() => this.voucherAction[`get${item.upName}`]({ entity: { isEnable: true } }, `data.other.${item.name}`)}
                                dropdownFooter={this.handleAddRecord(`${item.upName}`, `${item.name}`)}
                                onChange={this.onFieldChange({ id: `data.form.${item.name}Id`, name: `data.form.${item.name}Name` }, `data.other.${item.name}`)}
                            >
                                {this.handleSelect(item.optionArr, 'isName')}
                            </Select>
                        </FormItem>
                    )
                }else{
                    return null
                }
            })
            return domArr
        }
    }
    renderProduct = () => {
        const type = this.metaAction.gf('data.form.businessTypeId')
        return type == '5001001003' ? true : false
    }
    calc = (col, rowIndex, rowData, params) => (v) => {
        // 修改的时候，分隔符问题
        if(typeof v == "string"){
            v = v.replace(/,/g, '')
            v = Number(v)
        }
        // 分摊率  0-100
        if(col == 'absorption'){
            if (Number(v) > 100) {
                v = 100
            } else if(Number(v) < 0){
                v = 0
            }
        }
        if(col == 'amount'){
            if (Number(v) > 9999999999.99) {
                v = 9999999999.99
            }
        }else{
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
        }
        params = Object.assign(params, {
            value: v
        })   
        let isNew = this.metaAction.gf('data.other.isNew')
        let arr = ['absorption', 'materialCost', 'laborCost', 'manufacturCost', 'otherCost'], arrValue
        const radioArr = ['quantity', 'price', 'amount']
        const businessTypeId = this.metaAction.gf('data.form.businessTypeId')
        const type = this.metaAction.gf('data.other.type')
        let form = this.metaAction.gf('data.form.details').toJS()

        // 以销定产 产品入库单 反算
        if(arr.indexOf(col) > -1 && !isNew){  // 成本核算 4项
            arrValue = utils.number.round(Number(v), 2)
            this.metaAction.sf(`data.form.details.${rowIndex}.${col}`, fromJS(arrValue))

            if(arr.indexOf(col) > 0){
                // 反算金额
                form = this.metaAction.gf('data.form.details').toJS()
                if(form && form.length){
                    let item = form[rowIndex]
                    form[rowIndex].materialCost = item.materialCost ? Number(item.materialCost) : 0
                    form[rowIndex].laborCost = item.laborCost ? Number(item.laborCost) : 0
                    form[rowIndex].manufacturCost = item.manufacturCost ? Number(item.manufacturCost) : 0
                    form[rowIndex].otherCost = item.otherCost ? Number(item.otherCost) : 0
                    form[rowIndex].amount = item.materialCost + item.laborCost + item.manufacturCost + item.otherCost

                    if(form[rowIndex].quantity)form[rowIndex].price = form[rowIndex].amount/form[rowIndex].quantity
                    this.metaAction.sf('data.form.details', fromJS(form))
                }
            }
        }else if(radioArr.indexOf(col) > -1 && isNew && businessTypeId == 5001001003 && type != 4){
            // 以销定产 按比例生单 反算 总金额=成本核算合计  产品入库单
            // 修改明细
            this.voucherAction.calc(col, rowIndex, rowData, params)

            // let num=0
            // form = this.metaAction.gf('data.form.details').toJS()
            // if(form && form.length){
            //     form.map(item=> { if(item.amount) num = num + item.amount })
            //     let formCost = this.metaAction.gf('data.form').toJS()
            //     formCost.laborCost = formCost.laborCost + 0
            //     formCost.manufacturCost = formCost.manufacturCost + 0
            //     formCost.otherCost = formCost.otherCost + 0

            //     const materialCost = num - formCost.laborCost - formCost.manufacturCost - formCost.otherCost
            //     this.metaAction.sfs({
            //         'data.form.allCost': num,
            //         'data.form.materialCost': materialCost
            //     })
            // }

        }else if(radioArr.indexOf(col) > -1 && businessTypeId == 5001001003 && type == 4){
            // 按销售占比例核算，产品入库单，修改数量，反算金额
            if(col == 'quantity'){
                this.changeQuantity( rowIndex, rowData, params)
            }else if(col == 'price'){
                this.changePrice( rowIndex, rowData, params)
            }else if(col == 'amount'){
                this.changeAmount( rowIndex, rowData, params)
            }
        }else {
            this.voucherAction.calc(col, rowIndex, rowData, params)
        }
        
        this.editCloseTips(true)
        this.metaAction.sf('data.other.isSaved', true)
    }

    changeQuantity = ( rowIndex, rowData, params)=> {
        const quantity = Number(params.value)
        let price = utils.number.round(rowData.price, 6)

        // 修改数量，算金额
        if(price){
            this.metaAction.sfs({
                [`data.form.details.${rowIndex}.quantity`]: quantity,
                [`data.form.details.${rowIndex}.amount`]: utils.number.round(quantity*price, 2)
            })
        }else{
            this.metaAction.sf(`data.form.details.${rowIndex}.quantity`, quantity)
        }
    }
    changePrice = ( rowIndex, rowData, params)=> {
        const price = Number(params.value)
        let quantity = utils.number.round(rowData.quantity, 6), 
            amount = utils.number.round(rowData.amount, 2) 

        // 修改单价，算金额
        if(quantity){
            this.metaAction.sfs({
                [`data.form.details.${rowIndex}.price`]: price,
                [`data.form.details.${rowIndex}.amount`]: utils.number.round(price*quantity, 2)
            })
        }else {
            if(price) quantity = utils.number.round(amount / price, 6)
            this.metaAction.sfs({
                [`data.form.details.${rowIndex}.quantity`]: quantity,
                [`data.form.details.${rowIndex}.price`]: price,
            })
        }
    }
    changeAmount = ( rowIndex, rowData, params)=> {
        const amount = Number(params.value)
        let price = utils.number.round(rowData.price, 6),
            quantity = utils.number.round(rowData.quantity, 6)

        // 修改金额，算数量
        if(price){
            quantity = utils.number.round(amount / price, 6)
            this.metaAction.sfs({
                [`data.form.details.${rowIndex}.amount`]: amount,
                [`data.form.details.${rowIndex}.quantity`]: utils.number.round(amount / price, 6)
            })
        }else{
            this.metaAction.sfs({
                [`data.form.details.${rowIndex}.amount`]: amount
            })
        }
    }
        
    quantityFormat = (quantity, decimals, isFocus, isallCost,isClearZero) => {
        if(isallCost == 'isallCost' && !quantity){
            let allCost = this.metaAction.gf('data.form.allCost')
            if(!allCost) return '0.00'
        }else if(quantity) {
            if(typeof quantity == "string"){
                quantity = quantity.replace(/,/g, '')
                quantity = Number(quantity)
            }
            return this.voucherAction.numberFormat(quantity, decimals, isFocus,isClearZero)
        }
    }
    changeProNum = (path, value) => {
        this.editCloseTips(true)
        this.metaAction.sf('data.other.isSaved', true)
        if(typeof value == "string"){
            value = value.replace(/,/g, '')
            value = Number(value)
        }
        if(value){
            this.metaAction.sf(path, value)
        }else{
            this.metaAction.sf(path, 0)
        }

        let materialCost = this.metaAction.gf('data.form.materialCost'),
        laborCost = this.metaAction.gf('data.form.laborCost'),
        manufacturCost = this.metaAction.gf('data.form.manufacturCost'),
        otherCost = this.metaAction.gf('data.form.otherCost'), allCost = 0

        materialCost = materialCost ? materialCost : 0
        laborCost = laborCost ? laborCost : 0
        manufacturCost = manufacturCost ? manufacturCost : 0
        otherCost = otherCost ? otherCost : 0

        if(path == 'data.form.materialCost') materialCost = value
        if(path == 'data.form.laborCost') laborCost = value
        if(path == 'data.form.manufacturCost') manufacturCost = value
        if(path == 'data.form.otherCost') otherCost = value

        const isNew = this.metaAction.gf('data.other.isNew')
        if(!isNew){
            // 以销定产
            allCost = Number(materialCost) + Number(laborCost) + Number(manufacturCost) + Number(otherCost)
            this.metaAction.sfs({
                'data.other.isSaved': true,
                'data.form.allCost': allCost 
            })
        }else{
            // 以销定产 按比例
            if(path != 'data.form.materialCost'){
                let newMaterialCost 
                const all = this.metaAction.gf('data.form.allCost')
                newMaterialCost = Number(all) - Number(laborCost) - Number(manufacturCost) - Number(otherCost)
                
                this.metaAction.sf('data.form.materialCost', newMaterialCost)
            }else{
                allCost = Number(materialCost) + Number(laborCost) + Number(manufacturCost) + Number(otherCost)
                this.metaAction.sf('data.form.allCost', allCost)
            }
        }
    }
    
    getColumnVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.setting'), visible = false,
            formParams = this.metaAction.gf('data.form').toJS()
        columnSetting = columnSetting && columnSetting.toJS()
        
        if(formParams.businessTypeId=='5001001009' && (params == 'quantity' || params == 'price')){
            return false
        }
        if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
            columnSetting.body.tables.forEach((item) => {
                if (item.details.length != 0) {
                    visible = item.details.find(o => o.fieldName == params)
                    if(visible)visible = visible.isVisible
                }
            })
        }
        return visible
    }

    getGridVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.setting'), visible = false
        columnSetting = columnSetting && columnSetting.toJS()

        if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
            columnSetting.body.tables.forEach((item) => {
                if (item.details.length != 0) {
                    visible = item.details.filter(o => o.fieldName == params)[0].isVisible
                }
            })
        }
        return visible
    }

    openDocContent = () =>{
        // let id = this.component.props.docId
        let id = this.metaAction.gf('data.other.docId')
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '填制凭证',
                'app-proof-of-charge',
                { accessType: 1, initData: { id } }
            )
    }
    renderDoc = () => {
        let name = this.metaAction.gf('data.other.docCode')
        if(name){
            return `记-${name}`
        }else{
            return false
        }
    }

    addDetails = (e) => {
        let isNew = this.metaAction.gf('data.other.isNew')   // 单据列是否显示成本项目，生单下拉框内容
        if (e.key == 'materialPro' || e.key == 'finishedPro') {
            this.matershedPro(e.key)
        } else {
            this[e.key] && this[e.key]()
        }
    }

    handleConfirmTip = async() => {
        const resConirm = await this.metaAction.modal('warning', {
            content: '产成品入库成本数量≤0或单价<0的存货，无法自动生成产品入库单，请修改存货销售成本或期初结存后再以销定产',
            okText: '确定',
            className: 'ttk-scm-app-inventory-accountingmethod-confirm',
            bodyStyle: { padding: 24, fontSize: 12 },
        })
        return resConirm
    }

    // 入库 --以销定产按比例生单
    saleProRatio = async() => {
        let businessDate = this.metaAction.gf('data.form.businessDate')
        businessDate = this.metaAction.momentToString(businessDate, 'YYYY-MM')
        businessDate = moment(businessDate)

        // 校验是否需要成本计算
        let filter = {
            businessDate: businessDate.format('YYYY-MM-DD'),
            flag : 'yxdc',
            operateTriggerSource: 1
        }
        // const isNeed = await this.webapi.inventoryDoc.isNeedReCalcCost(filter)
        const response = await Promise.all([
            this.webapi.inventoryDoc.isNeedReCalcCost(filter),
            this.webapi.inventoryDoc.initRatioAccountList({
                year: businessDate.format('YYYY-MM').slice(0, 4),
                month: businessDate.format('YYYY-MM').substring(5),
            })
        ])

        let isNeed = response[0]
        let isHaveList = response[1]
        if(isNeed && isNeed != 'no'){
            // const retCalc = await this.metaAction.modal('confirm', {
            //     content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
            //     okText: '成本计算',
            // })

            const retCalc = await this.metaAction.modal('confirm', {
                content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                okText: '按比例自动计算销售成本',
            })

            if(retCalc) {
                // let filter1 = {
                //     year: businessDate.format('YYYY-MM').slice(0,4),
                //     month: businessDate.format('YYYY-MM').substring(5),
                // }
                // const res = await this.webapi.inventoryDoc.reCalcCost(filter1)
                // let lastDayOfUnEndingClosingCalendar = this.component.props.lastDayOfUnEndingClosingCalendar
                const res = await this.metaAction.modal('show', {
                    title: '按比例自动计算销售成本',
                    wrapClassName: 'inventory-automaticcalculation',
                    width: 900,
                    okText: '确定',
                    bodyStyle: { padding: '0' },
                    closeModal: this.close,
                    closeBack: (back) => { this.closeTip = back },
                    children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                        store: this.component.props.store,
                        initData: {
                            date: businessDate.format('YYYY-MM-DD'),
                            lastDayOfUnEndingClosingCalendar: isHaveList ? isHaveList.lastDayOfUnEndingClosingCalendar : '',
                            type: 'costSaleRatio',
                            isDoc: true
                        }
                    }),
                })

                if(res) {
                    this.metaAction.toast('success', '计算成功')
                    const produceAccord = await this.webapi.inventoryDoc.produceAccordToSales(filter)
                    if(produceAccord && !produceAccord.flag && produceAccord.details) {
                        const costIncomeRatio = await this.metaAction.modal('show', {
                            title: '以销定产生成产品入库单',
                            width: '80%',
                            wrapClassName: 'costIncomeRatioCss1',
                            children: <CostIncomeRatioModel
                            businessDate={businessDate}
                            detail={produceAccord.details} handleConfirmTip={this.handleConfirmTip}/>
                        })  
                        if(costIncomeRatio) {
                            let detalisList = produceAccord.details
                            detalisList = detalisList.filter(item => item.price >= 0)
                            this.getSaleProRatioArr(detalisList)
                        }
                    } else if(produceAccord && produceAccord.flag == 'deleteRecord'){   
                        // 已经生成过。。。
                        this.deleteAndProduce()
                    }
                }else{
                    return false
                }
            }else{
                return false
            }
        }else if(isNeed == 'no'){
            const produceAccords = await this.webapi.inventoryDoc.produceAccordToSales(filter)
            if(produceAccords && !produceAccords.flag && produceAccords.details) {
                const costIncomeRatios = await this.metaAction.modal('show', {
                    title: '以销定产生成产品入库单',
                    width: '80%',
                    wrapClassName: 'costIncomeRatioCss1',
                    children: <CostIncomeRatioModel
                            businessDate={businessDate}
                            detail={produceAccords.details} handleConfirmTip={this.handleConfirmTip}/>
                })  
                if(costIncomeRatios) {
                    let detalisList = produceAccords.details
                    detalisList = detalisList.filter(item => item.price >= 0)

                    this.getSaleProRatioArr(detalisList)
                } 
            } else if(produceAccords && produceAccords.flag == 'deleteRecord'){   
                // 已经生成过。。。
                this.deleteAndProduce()
            }
        }
    }

    // 入库 --以销定产按比例生单 -- 生成单子 统一处理
    getSaleProRatioArr = (detail, type) => {
        let newArr=[], num=0
        let typeSetting = this.metaAction.gf('data.other.type')
        // console.log('data.other.type', typeSetting)
        detail.map(item=>{   
            if(item.productQuantity > 0 && item.price >= 0){
                if(typeSetting == 4) {
                    newArr.push({
                        inventoryCode: item.inventoryCode,
                        inventoryName: item.inventoryName,
                        inventoryId: item.inventoryId,
                        propertyName: item.invPropName,   
                        specification: item.specification,
                        unitName: item.unitName,
                        quantity: item.productQuantity,
                        price: item.productPrice,   
                        amount: item.productAmount,
                        periodEndQuantity: item.periodEndQuantity,
                        periodEndAmount: item.periodEndAmount
                    })
                }else{
                    newArr.push({
                        inventoryCode: item.inventoryCode,
                        inventoryName: item.inventoryName,
                        inventoryId: item.inventoryId,
                        propertyName: item.invPropName,   
                        specification: item.specification,
                        unitName: item.unitName,
                        quantity: item.productQuantity,
                        price: item.price,
                        amount: item.productAmount
                    })
                }
                if(item.productAmount) num = num + item.productAmount
            }
        })

        if(newArr.length<8){
            for( let i = newArr.length; i < 8 ; i++ ) {
                newArr.push(blankDetail)
            }
        }

        // 按成本单价占销售单价比例核算  不带入成本核算的值  （typeSetting == 4）
        if (type == 'saleMaterialRatio' || typeSetting == 4) {
            this.metaAction.sfs({
                'data.form.flag': 'yxdc',
                'data.form.details': fromJS(newArr)
            })
        } else {
            this.metaAction.sfs({
                // 'data.form.materialCost': num,
                // 'data.form.allCost': num,
                // 'data.form.laborCost': 0,
                // 'data.form.manufacturCost': 0,
                // 'data.form.otherCost': 0,
                'data.form.flag': 'yxdc',
                'data.form.details': fromJS(newArr)
            })
        }
        this.editCloseTips(true)
        this.metaAction.sf('data.other.isSaved', true)
    }

    endQuantity = (value) => {
        if(value)return utils.number.format(value, 6)
    }
    endAmount = (value) => {
        if(value)return utils.number.format(value, 2)
    }

    // 入库 --以销定产按比例生单 -- 删除以前的，重新生成
    deleteAndProduce = async() =>{
        let businessDate = this.metaAction.gf('data.form.businessDate')
        businessDate = this.metaAction.momentToString(businessDate, 'YYYY-MM')
        businessDate = moment(businessDate)

        let filter = {
            businessDate: businessDate.format('YYYY-MM-DD'),
            flag : 'yxdc'
        } 

        const ret = await this.metaAction.modal('confirm', {
            content: '已存在产品入库单，重新生成将删除之前的单据，是否继续？',
        })
        if(ret){
            const response = await this.webapi.inventoryDoc.deleteAndProduceAccordToSales(filter)
            if(response && response.details){
                const costIncomeRatios = await this.metaAction.modal('show', {
                    title: '以销定产生成产品入库单',
                    width: '80%',
                    wrapClassName: 'costIncomeRatioCss',
                    children: <CostIncomeRatioModel
                            businessDate={businessDate}
                            detail={response.details} handleConfirmTip={this.handleConfirmTip}/>
                })  
                if(costIncomeRatios) {
                    let detalisList = response.details
                    detalisList = detalisList.filter(item => item.price >= 0)
                    this.getSaleProRatioArr(response.details)
                }
            }
        }
    }

    // 出库 --以销定产按比例生单
    saleMaterialRatio = async() => {
        const id = this.metaAction.gf('data.form.id'), 
        ts = this.metaAction.gf('data.form.ts'),
        proMethod = this.component.props.proMethod

        let amountbj = this.metaAction.gf('data.other.amountbj')
        amountbj = clearThousPos(amountbj)

        if (Number(amountbj) <= 0) {
            this.metaAction.toast('error', '本月产成品入库直接材料合计余额≤0，无法以销定产')
            return 
        }
        if (proMethod == 3) {
            if (id) {
                const ret = await this.metaAction.modal('confirm',{
                    content: '以销订产按直接材料生成，将删除当前已有的单据，是否确认修改？'
                })
    
                if (ret) {
                    const result = await this.webapi.inventoryDoc.del({ id, ts })
                    if (result) {
                        let businessDate = this.metaAction.gf('data.form.businessDate').format('YYYY-MM')

                        // const result = await this.webapi.dateCard.totalAndAmount({businessDate: `${businessDate}-01`})
                        // if (result && result.amount <= 0) {
                        //     this.metaAction.toast('error', '本月产成品入库直接材料合计余额≤0，无法以销定产')
                        //     return 
                        // }

                        const res = await this.metaAction.modal('show', {
                            title: '以销定产生成材料出库单',
                            width: '80%',
                            wrapClassName: 'amountGenerteCss',
                            children: this.metaAction.loadApp('ttk-scm-app-inventory-amountMaterialList', {
                                store: this.component.props.store,
                                setPortalContent:this.component.props.setPortalContent,
                                initData: {lastDay: businessDate, isCard: true}
                            }),
                        })
    
                        if (res&& res.id) {
                            // 自动更新当前明细，并且保存成功
                            this.initLoad(res.id)
                            this.metaAction.toast('success', '保存成功')

                        } else {
                            let businessTypeId = this.metaAction.gf('data.form.businessTypeId')
                            this.injections.reduce('init')
                            await this.initLoad()
                            this.getCardCode(businessTypeId)
                            this.metaAction.sf('data.form.businessTypeId', businessTypeId)
                        }
                    }
                }
            } else {
                const dateff  = this.metaAction.gf('data.form.businessDate')
                let filter = {
                    businessDate: dateff.format('YYYY-MM-DD'),
                    flag : 'yxdc',
                    operateTriggerSource: 1
                }
                // const isNeed = await this.webapi.inventoryDoc.isNeedReCalcCost(filter)
                const response = await Promise.all([
                    this.webapi.inventoryDoc.isNeedReCalcCost(filter),
                    this.webapi.inventoryDoc.initRatioAccountList({
                        year: dateff.format('YYYY-MM').slice(0, 4),
                        month: dateff.format('YYYY-MM').substring(5),
                    })
                ])
        
                let isNeed = response[0]
                let isHaveList = response[1]
                if(isNeed){
                    if (isNeed != 'no') {
                        // const retCalc = await this.metaAction.modal('confirm', {
                        //     content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                        //     okText: '成本计算',
                        // })
    
                        // if(retCalc) {
                        //     let filter1 = {
                        //         year: dateff.format('YYYY-MM').slice(0,4),
                        //         month: dateff.format('YYYY-MM').substring(5),
                        //     }
                        //     const res = await this.webapi.inventoryDoc.reCalcCost(filter1)
                        //     if(res) {
                        //         this.metaAction.toast('success', '计算成功')
                        //         this.handleSuccess()
                        //     }
                        // }

                        const retCalc = await this.metaAction.modal('confirm', {
                            content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                            okText: '按比例自动计算销售成本',
                        })
    
                        if(retCalc) {
                            // let lastDayOfUnEndingClosingCalendar = this.component.props.lastDayOfUnEndingClosingCalendar
                            const ret = await this.metaAction.modal('show', {
                                title: '按比例自动计算销售成本',
                                wrapClassName: 'inventory-automaticcalculation',
                                width: 900,
                                okText: '确定',
                                bodyStyle: { padding: '0' },
                                closeModal: this.close,
                                closeBack: (back) => { this.closeTip = back },
                                children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                                    store: this.component.props.store,
                                    initData: {
                                        date: dateff.format('YYYY-MM-DD'),
                                        lastDayOfUnEndingClosingCalendar: isHaveList?isHaveList.lastDayOfUnEndingClosingCalendar:'',
                                        type: 'costSaleRatio',
                                        isDoc: true
                                    }
                                }),
                            })

                            if (ret) {
                                this.handleSuccess()
                            }
                        }

                    } else {
                        this.handleSuccess()
                    }
                } 
            }
        }
    }

    handleSuccess = async() => {
        let businessDate = this.metaAction.gf('data.form.businessDate').format('YYYY-MM')

        const res = await this.metaAction.modal('show', {
            title: '以销定产生成材料出库单',
            width: '80%',
            wrapClassName: 'amountGenerteCss',
            children: this.metaAction.loadApp('ttk-scm-app-inventory-amountMaterialList', {
                store: this.component.props.store,
                setPortalContent:this.component.props.setPortalContent,
                initData: {lastDay: businessDate, isCard: true}
            }),
        })

        if (res && res.id) {
            // 自动更新当前明细，并且保存成功
            this.initLoad(res.id)
            this.metaAction.toast('success', '保存成功')
        }
    }
    
    // 入库 以销定产生成   
    salePro = async () =>{
        const date  = this.metaAction.gf('data.form.businessDate')
        let flags = this.metaAction.gf('data.form.flag')
        let filter = {
            businessDate: date.format('YYYY-MM-DD'),
            flag : 'yxdc'
        }
        const res = await this.webapi.inventoryDoc.produceAccordToSales(filter)
        if(res && !res.flag && res.details) {
            let newArr = this.getArr(res.details)
            this.metaAction.sfs({
                'data.form.details': fromJS(newArr),
                'data.form.flag': 'yxdc',
                'data.other.isSaved': true,
            })
            this.editCloseTips(true)
        }else if(res && res.flag == 'deleteRecord'){
            const ret = await this.metaAction.modal('confirm', {
                content: '已存在产品入库单，重新生成将删除之前的单据，是否继续？',
            })
            if(ret){
                const response = await this.webapi.inventoryDoc.deleteAndProduceAccordToSales(filter)
                if(response && response.details){
                    let newArrs = this.getArr(response.details)
                    this.metaAction.sfs({
                        'data.form.details': fromJS(newArrs),
                        'data.form.flag': 'yxdc',
                        'data.other.isSaved': true,
                    })
                    if(flags == 'yxdc'){
                        this.metaAction.sfs({
                            'data.form.id': null,
                            'data.form.ts': null
                        })
                    }
                    this.editCloseTips(true)
                }
            }
        }
    }
    // 出库 以销定产生成
    saleMaterial = async() => {
        const date  = this.metaAction.gf('data.form.businessDate')
        let flags = this.metaAction.gf('data.form.flag')
        let filter = {
            businessDate: date.format('YYYY-MM-DD'),
            flag : 'yxdc'
        }
        const res = await this.webapi.inventoryDoc.produceAccordToSalesMaterial(filter)
        if(res.details && res.details.length) {
            let newArr = this.getArr(res.details)
            this.metaAction.sfs({
                'data.form.details': fromJS(newArr),
                'data.form.flag': 'yxdc',
                'data.other.isSaved': true,
            })
            this.editCloseTips(true)
            this.metaAction.toast('success', '生成成功')
        }else if(res && res.flag == 'deleteRecord'){
            const ret = await this.metaAction.modal('confirm', {
                content: '已存在材料出库单，重新生成将删除之前的单据，是否继续？',
            })
            if(ret){
                const response = await this.webapi.inventoryDoc.deleteAndProduceAccordToSalesMaterial(filter)
                if(response.details && response.details.length){
                    this.metaAction.toast('success', '生成成功')
                    let newArrs = this.getArr(response.details)
                    this.metaAction.sfs({
                        'data.form.details': fromJS(newArrs),
                        'data.form.flag': 'yxdc',
                        'data.other.isSaved': true,
                    })
                    if(flags == 'yxdc'){
                        this.metaAction.sfs({
                            'data.form.id': null,
                            'data.form.ts': null
                        })
                    }
                    this.editCloseTips(true)
                }else if(response.inventoryDtos && response.inventoryDtos.length){
                    const textss = []
                    response.inventoryDtos.map((item,index) => {
                        textss[index] = `${item.code}${item.name}`
                    })
                    const ret = await this.metaAction.modal('confirm', {
                        content: `${textss.join('、')}的存货尚未配置原料，无法以销定产生成对应的单据，请先配置原料`,
                        okText: '配置原料'
                    })
                    if(ret){
                        // 配置原料
                        this.component.props.setPortalContent &&
                            this.component.props.setPortalContent('配置原料', 'app-scm-raw-material-list')
                    }
                }
            }
        }else if(res && !res.flag && res.inventoryDtos){
            const texts = []
            res.inventoryDtos.map((item,index) => {
                texts[index] = `${item.code}${item.name}`
            })
            const ret = await this.metaAction.modal('confirm', {
                content: `${texts.join('、')}的存货尚未配置原料，无法以销定产生成对应的单据，请先配置原料`,
                okText: '配置原料'
            })
            if(ret){
                // 配置原料
                this.component.props.setPortalContent &&
                    this.component.props.setPortalContent('配置原料', 'app-scm-raw-material-list')
            }
        }
    }

    getArr = (arr, isYxdc)=>{
        if(isYxdc){
            arr.map((item, index)=>{
                arr[index].quantity = item.productQuantity
                arr[index].price = item.productPrice
                arr[index].amount = item.productAmount
                if(item.absorption) arr[index].absorption = Number(item.absorption)
            })
        }
        arr.map((item, index)=>{
            if(item.absorption) arr[index].absorption = Number(item.absorption)
        })
        if(arr.length<8){
            for( var i=0; arr.length<8; i++){
                arr.push({
                    inventoryCode: undefined,
                    inventoryName: undefined,
                    inventoryId: null,
                    unitId: null,
                    quantity: null,
                })
            }
        }
        return arr
    }

    // 新增存货
    addInventory = async(id) => {
		let option = { title: '', appName: '', id: id };
		option.title = '存货';
        option.appName = 'app-card-inventory';
        
        //获取生成凭证设置
		await this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
        .then((res) => this.queryByparamKeys = res)
        const res = await this.addModel(option);
        return res
	}

	addModel = async (option) => {
		let className = 'app-list-inventory-modal'
		//把生成凭证设置传入 card
		let queryByparamKeyNum = 0
		this.queryByparamKeys.forEach(function (data) {
			if(data.paramValue != 'default') queryByparamKeyNum = queryByparamKeyNum + 1
		})
		if(queryByparamKeyNum > 0){
			className = 'app-list-inventory-modalLong'
        }
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: className,
			wrapClassName: 'card-archive',
			width: 800,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id,
			})
		});
		if (ret) {
            return ret
		}
    };

    // 获取存货（选择产成品生成 选择原料生成）
    getInventory = async (parmas, type, searchContent, inventoryType, sort) => {
        let fuzzyCondition, 
        attributeList,
        businessTypeId = this.metaAction.gf('data.form.businessTypeId'),
        option = [],
        businessDate = this.metaAction.gf('data.form.businessDate')
        
        if (businessTypeId == 5001001007) {
            option = ["原材料","周转材料"]
        } else if(businessTypeId == 5001001003){
            option = ["商品","半成品"]
        }
        
        if (type == 'search' && parmas != '') {
            fuzzyCondition = type == 'search' ? parmas : ''
            attributeList = inventoryType ? (inventoryType == '' ? option : [inventoryType]) : option
        } else if (parmas && type == 'change') {
            attributeList = parmas == '' ? option : [parmas]
            fuzzyCondition = searchContent ? searchContent : ''
        } else if(type == 'search' && parmas == '' && inventoryType){
            fuzzyCondition=''
            attributeList = inventoryType == '' ? option : [inventoryType]
        } else if(type == 'add' && parmas == ''){
            fuzzyCondition= searchContent ? searchContent : ''
            attributeList = inventoryType ? (inventoryType == '' ? option : [inventoryType]) : option
        } else if (type == 'change' && !parmas && searchContent) {
            fuzzyCondition= searchContent
            attributeList = option
        } else{
            fuzzyCondition=''
            attributeList = option
        }

        

        let res = null
        // // if (businessTypeId == 5001001007) { 
        //     res = await this.webapi.inventoryDoc.queryMaterialPro({
        //         entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
        //         attributeList: attributeList,
        //         businessDate: moment(businessDate).format('YYYY-MM-DD')
        //     })
        // // } else {
        // //     res = await this.webapi.inventoryDoc.queryInventory({
        // //         entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
        // //         attributeList: attributeList
        // //     })
        // // }

        // // const res = await this.webapi.inventoryDoc.queryInventory({
        // //     entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
        // //     attributeList: attributeList
        // // })

        let params = {
            entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
            attributeList: attributeList,
            businessDate: moment(businessDate).format('YYYY-MM-DD')
        }

        if (businessTypeId == 5001001007){
            params.orders=[{
                name: sort.userOrderField ? sort.userOrderField : 'periodEndAmount', 
                asc: sort.order ? sort.order == 'asc' ? true : false : false
            }]
        }

        res = await this.webapi.inventoryDoc.queryMaterialPro({
            entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
            attributeList: attributeList,
            businessDate: moment(businessDate).format('YYYY-MM-DD')
        })

        if (res) return res
    }

    productSelectOk = (arr) => {
        let newArr = this.getArr(arr)
        this.metaAction.sfs({
            'data.form.details': fromJS(newArr),
            'data.form.flag': null,
        })

        this.editCloseTips(true)
        this.metaAction.sf('data.other.isSaved', true)
    }

    handleTip = (arr, quantityEmp, type) => {
        let tip = '', businessTypeId = this.metaAction.gf('data.form.businessTypeId')

        if (type == 'picking') {
            tip = '请选择数据'
        } else if (type == 'pickingNum') {
            tip = '领料金额必须大于等于0'
        } else if (type == 'percentage') {
            tip = '百分比必须大于0'
        }else {
            if (businessTypeId == 5001001007) {
                if (arr && arr.length == 0) {
                    tip = '请选择领料存货'
                } else if (quantityEmp) {
                    tip = '请录入领料存货的数量'
                }
                
            } else if(businessTypeId == 5001001003){
                if (arr && arr.length == 0) {
                    tip = '请选择产成品'
                } else if (quantityEmp) {
                    tip = '请录入产成品的数量'
                }
            }
        }

        this.metaAction.toast('error', tip)
    }

    // 直接选择产成品生成 选择原料生成
    matershedPro = async(key) => {
        const title= key == 'materialPro' ? "领料存货" : "产成品"
        const selectList = key == 'materialPro' ? [{id:2, name: '原材料'},{id:4, name: '周转材料'}] : [{id:1, name: '商品'},{id:3, name: '半成品'}]
        const {productAmount, materialCost, amountyu, proMethod} = this.metaAction.gf('data.other').toJS()
        const res =  await this.metaAction.modal('show',{
            title: key == 'materialPro' ? '选择原料生成' : '选择产成品生成',
            width: key == 'materialPro' ? '80%' : 780,
            className: 'productselectCss',
            children: <Productselect 
            addInventory={this.addInventory} 
            getInventory={this.getInventory}
            productSelectOk={this.productSelectOk}
            handleTip={this.handleTip} 
            title={title}
            sumColumn={this.voucherAction.sumColumn}
            type={key}
            materialCost={materialCost}
            productAmount={productAmount} 
            amountyu={amountyu}  
            proMethod={proMethod}
            selectList={selectList}/>
        })
    }

    // 如果产成品成本核算没有勾选以销定产，则不出现“以销定产生成”字段。
    saleProVisible = (type) => {
        let proMethod = this.metaAction.gf('data.other.proMethod')
        let isNew = this.metaAction.gf('data.other.isNew')   // 单据列是否显示成本项目，生单下拉框内容
        if(proMethod) {
            return true
        }else{
            return false
        }
    }
    // 成本核算自动取值
    automaticValue = async(automaticValueType, types) => {
        const formParams = this.metaAction.gf('data.form').toJS()
        
        if( formParams.id && formParams.ts){
            const dateff  = this.metaAction.gf('data.form.businessDate')
            let filter = {
                businessDate: dateff.format('YYYY-MM-DD'),
                flag : 'yxdc',
                operateTriggerSource: 1
            }
            const isNeed = await this.webapi.inventoryDoc.isNeedReCalcCost(filter)
            if(isNeed != 'no'){
                const retCalc = await this.metaAction.modal('confirm', {
                    content: '存在未参与成本计算的库存单据，请先成本计算，才可进行产品入库核算',
                    okText: '成本计算',
                })
                if(retCalc) {
                    let filter1 = {
                        year: dateff.format('YYYY-MM').slice(0,4),
                        month: dateff.format('YYYY-MM').substring(5),
                    }
                    const res = await this.webapi.inventoryDoc.reCalcCost(filter1)
                    if(res) {
                        this.metaAction.toast('success', '计算成功')
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            }
        }

        const date  = this.metaAction.gf('data.form.businessDate')
        let filter = {
            businessDate: date.format('YYYY-MM-DD'),
            flag : 'yxdc',
            catchValSource: types == 'btn' ? '2' : '1'
        }

        const type = this.metaAction.gf('data.other.type')
        if(automaticValueType){
            filter={ 
                businessDate: date.format('YYYY-MM-DD'),
                flag : 'yxdc',
                inventoryId: automaticValueType ,
                catchValSource: types == 'btn' ? '2' : '1'
            }
        }
        const res = await this.webapi.inventoryDoc.getCostKeeping(filter)
        if(res) return res

    }
    // 分摊
    shareValue = () => {
        let list = this.metaAction.gf('data.form.details').toJS(), partCost = [], absorption
        const data = this.metaAction.gf('data.form').toJS()
        
        let materialCostSum=0, laborCostSum=0, manufacturCostSum=0, otherCostSum=0, absorptionSum=0
        if(list && list.length){
            list.map((item, index)=>{
                if(item.absorption){
                    absorption = Number(item.absorption/100)

                    const attribute = ['materialCost','laborCost','manufacturCost','otherCost']
                    attribute.forEach(item => {
                        if (data[item]) {
                            if (data[item] < 0) {
                                list[index][item]=Number('-'+utils.number.round(Math.abs(data[item]) * absorption, 2))
                            } else {
                                list[index][item]=utils.number.round(data[item] * absorption, 2)
                            }
                        } else {
                            list[index][item]=0
                        }
                    })
                    // 反算金额，单价
                    list[index].amount = list[index].materialCost + list[index].laborCost + list[index].manufacturCost + list[index].otherCost
                    list[index].price = utils.number.round(list[index].amount/list[index].quantity, 6)

                    // 分摊误差
                    materialCostSum = materialCostSum + item.materialCost
                    laborCostSum = laborCostSum + item.laborCost
                    manufacturCostSum = manufacturCostSum + item.manufacturCost
                    otherCostSum = otherCostSum + item.otherCost
                    absorptionSum = utils.number.round(absorptionSum, 6) + Number(item.absorption)
                }
            })
            let newArrList = [], allSum = materialCostSum + laborCostSum + manufacturCostSum + otherCostSum

            if((data.materialCost != materialCostSum || data.laborCost != laborCostSum ||
                data.manufacturCost != manufacturCostSum || data.otherCost != otherCostSum) && absorptionSum == 100){
                    list.map(item=>{
                        if(item.inventoryCode) newArrList.push(item)
                    })
                    // 出去最后一条明细的合计
                    let nolastCost1 = 0, nolastCost2 = 0, nolastCost3 = 0, nolastCost4 = 0  
                    
                    newArrList.map((item,index)=>{
                        if(index<newArrList.length-1){  
                            nolastCost1 = nolastCost1 + item.materialCost
                            nolastCost2 = nolastCost2 + item.laborCost
                            nolastCost3 = nolastCost3 + item.manufacturCost
                            nolastCost4 = nolastCost4 + item.otherCost
                        }
                    })

                    // 分摊率存在的最后一条数据下标
                    let lastHaveAbsorption = newArrList.length-1    
                    if(allSum != data.allCost){
                        for(let i=newArrList.length-1; i>-1; i-- ){
                            if(newArrList[i].absorption){
                                lastHaveAbsorption = i
                                break
                            }
                        }
                    }
                    if(data.materialCost != materialCostSum){
                        newArrList[lastHaveAbsorption].materialCost = Math.abs((data.materialCost||0)-nolastCost1)
                    }
                    if(data.laborCost != laborCostSum){
                        newArrList[lastHaveAbsorption].laborCost = Math.abs((data.laborCost||0)-nolastCost2)
                    }
                    if(data.manufacturCost != manufacturCostSum){
                        newArrList[lastHaveAbsorption].manufacturCost = Math.abs((data.manufacturCost||0)-nolastCost3)
                    }
                    if(data.otherCost != otherCostSum){
                        newArrList[lastHaveAbsorption].otherCost = Math.abs((data.otherCost||0)-nolastCost4)
                    }

                    newArrList.map((item, index)=>{
                        if(item.absorption){
                            // 反算金额，单价
                            newArrList[index].amount = newArrList[index].materialCost + newArrList[index].laborCost + newArrList[index].manufacturCost + newArrList[index].otherCost
                            newArrList[index].price = utils.number.round(newArrList[index].amount/newArrList[index].quantity, 6)
                        }
                    })
                    
                    if(newArrList.length<8){
                        for( var i=0; newArrList.length<8; i++) {
                            newArrList.push(blankDetail)
                        }
                    }
                    list = newArrList
                }
            
            this.metaAction.sfs({
                'data.form.details': fromJS(list),
                'data.other.isSaved': true
            })
            this.editCloseTips(true)
            this.metaAction.toast('success', '分摊成功')
        }
    }

    // 完工成本核算
    completeMaticValue = async() =>{
        let list = this.metaAction.gf('data.form.details').toJS(), amount = 0,
            oldCompleteMatic = this.metaAction.gf('data.other.oldCompleteMatic'),
            oldFormId = this.metaAction.gf('data.other.oldFormId')
            
        list.map(item=>{
            if(item.amount) amount = amount + item.amount
        })

        const retArr = await this.metaAction.modal('show', {
            title: '完工成本核算',
            width: '60%',
            wrapClassName: 'completeMaticCss',
            children: <CompleteMaticModal 
                        automaticValue = {(filter, type)=>this.automaticValue(filter, type)}
                        amount = {amount}
                        setting = {this.relationSetting}
                        webapi={this.webapi.inventoryDoc}
                        metaAction={this.metaAction}
                        oldCompleteMatic={oldCompleteMatic}
                        oldFormId={oldFormId}/>
        })  
        if(retArr) { 
            let materialCost=0, laborCost=0, manufacturCost=0, otherCost=0, allCost=0
            const ret = await this.webapi.inventoryDoc.getInfluenceRelation()
            if(ret && ret.length){
                ret.map((item,index)=>{
                    if(index > retArr.length-1) return
                    const finishedCost = Number(retArr[index].finishedCost.replace(/,/g, ''))
                    if(item.influenceIdVal == 5001002001) materialCost= materialCost + finishedCost
                    if(item.influenceIdVal == 5001002002) laborCost= laborCost + finishedCost
                    if(item.influenceIdVal == 5001002003) manufacturCost= manufacturCost + finishedCost
                    if(item.influenceIdVal == 5001002004) otherCost= otherCost + finishedCost
                })
            }else{
                materialCost= retArr[0].finishedCost.replace(/,/g, ''),
                laborCost = retArr[1].finishedCost.replace(/,/g, ''),
                manufacturCost = retArr[2].finishedCost.replace(/,/g, ''),
                otherCost = retArr[3].finishedCost.replace(/,/g, '')
            }
                
            allCost = Number(materialCost) + Number(laborCost) + Number(manufacturCost) + Number(otherCost)

            const influenceAmountDtos = []
            let code = this.metaAction.gf('data.form.code')
            let oldFormId = this.metaAction.gf('data.other.oldFormId')

            retArr.map((item, index)=>{
                retArr[index].accountBeginBalance = Number(item.accountBeginBalance.replace(/,/g, ''))
                retArr[index].accountOccurrenceAmount = Number(item.accountOccurrenceAmount.replace(/,/g, ''))
                retArr[index].accountEndBalance = Number(item.accountEndBalance.replace(/,/g, ''))
                influenceAmountDtos.push({
                    influenceId: item.influenceValue, // -- 影响因素ID
                    voucherId: oldFormId,    //-- 单据ID
                    voucherCode: code,  //-- 单据编码
                    accountBeginBalance: item.accountBeginBalance,   //-- 期初
                    accountOccurrenceAmount:  item.accountOccurrenceAmount,  // -- 发生额
                    accountEndBalance: item.accountEndBalance   //-- 期末
                })
            })

            this.metaAction.sfs({
                [`data.form.materialCost`]: materialCost,
                [`data.form.laborCost`]: laborCost,
                [`data.form.manufacturCost`]: manufacturCost,
                [`data.form.otherCost`]: otherCost,
                [`data.form.allCost`]: allCost,
                [`data.other.setCompleteMatic`]: influenceAmountDtos,
                [`data.other.isSaved`]: true,
                [`data.other.oldCompleteMatic`]: retArr
            })
            this.editCloseTips(true)
        }
    }

    // setting
    relationSetting = async(detail) => {
        const ret = await this.webapi.inventoryDoc.getInfluenceRelation()
        const setArr = await this.metaAction.modal('show', {
            title: '设置成本明细项目和成本大类对照关系',
            width: '40%',
            wrapClassName: 'completeMaticCss2',
            children: <CompleteMaticSetting 
                        detail = {detail}
                        influenceRelation = {ret}
                        metaAction={this.metaAction}/>
        }) 
        if(setArr){
            const dtos = []
            setArr.map(item=>{
                dtos.push({
                    influenceIdKey: item.influenceIdKey,
                    influenceIdVal: item.accountValues
                })
            })
            const save = await this.webapi.inventoryDoc.saveInfluenceRelation(dtos)
            if(save) {
                this.metaAction.toast('success', '设置成功')
            }
        } 
    }

    // 采购入库单  暂估回冲
    recoil = async() => {
        let data = this.metaAction.gf('data.form.businessDate')   

        const purchaseId = this.metaAction.gf('data.other.oldFormId')
        if(purchaseId){
            const ret = await this.getBackwashed({purchaseId})
            if(ret){
                this.metaAction.toast('error', '采购入库单已回冲')
                return false
            }
        }else{
            // this.metaAction.toast('error', '当前没有采购入库单。。。。置灰')
            return false
        }

        const res = await this.metaAction.modal('show', {
            title: '暂估入库单列表',
            width: '80%',
            wrapClassName: 'temporary-inventory-css',
            children: <TemporaryInventoryDetail 
                        businessDate={data}
                        getRecoilPEList={this.getRecoilPEList}
                        purchaseId={purchaseId}
                        metaAction={this.metaAction}
                        toInventory={this.toInventory}/>
        }) 
        if(res && res.length){
            let filter = [], itemObj
            res.map((item, index)=> {
                if(item.thisAmount && item.thisQuantity){
                    let thisAmount = utils.number.format(Number(item.thisAmount), 2),
                    thisQuantity = utils.number.format(Number(item.thisQuantity), 6)
                    thisAmount = Number(thisAmount.replace(/,/g, ''))
                    thisQuantity = Number(thisQuantity.replace(/,/g, ''))

                    itemObj = {
                        inventoryId: item.inventoryId,
                        inventoryName: item.inventoryName,
                        propertyName: item.propertyName,
                        unitId: item.unitId,
                        unitName: item.unitName,	
                        amount: thisAmount,
                        quantity: thisQuantity,
                        price: item.price 
                    }
                    if(index>0 && item.id == res[index-1].id){
                        filter[index-1].details.push(itemObj)
                    }else{
                        filter.push({
                            businessDate: item.businessDate,
                            codePrefix: "ZH",
                            supplierId: item.supplierId,
                            purchaseId,
                            estimateId: item.id,
                            details: [itemObj]
                        })
                    }
                }
            })
            const create = await this.webapi.inventoryDoc.createRecoilBill(filter)
            if(create){
                this.metaAction.toast('success', '暂估回冲成功')
                this.refresh()
                this.selectedOption = []
                this.injections.reduce('update', {
                    path: 'data.tableCheckbox',
                    value: {
                        checkboxValue: [],
                        selectedOption: []
                    }
                })
            }
        }
    }

    getRecoilPEList = async(filter) => {
        const queryRecoilPEList = await this.webapi.inventoryDoc.queryRecoilPEList(filter)
        return queryRecoilPEList
    }   
    // 单据是否回冲
    getBackwashed = async(filter) => {
        const res = await this.webapi.inventoryDoc.queryPurchaseBackwashed(filter)
        return res
    }

    renderInventoryNameCode = (_rowIndex, _ctrlPath, type) => {
        const { isAdd, inventory } = this.metaAction.gf('data.other').toJS()
        const { details } = this.metaAction.gf('data.form').toJS()

        const title = type == 'name' ? (
            details[_rowIndex] && details[_rowIndex].inventoryId && this.renderInventoryTitle(details[_rowIndex].inventoryId,
                 "data.other.inventory", details[_rowIndex].inventoryName)
        ): 
        (isAdd ? details[_rowIndex].inventoryCode : 
            (this.metaAction.isFocus(_ctrlPath) ? details[_rowIndex] && details[_rowIndex].inventoryId : 
            details[_rowIndex].inventoryCode) )
        
        const value = type == 'name' ? (isAdd ? details[_rowIndex].inventoryName : (this.metaAction.isFocus(_ctrlPath) ? 
        details[_rowIndex] && details[_rowIndex].inventoryId : 
        details[_rowIndex].inventoryName)) : (
            isAdd ? details[_rowIndex].inventoryCode : (this.metaAction.isFocus(_ctrlPath) ? 
            details[_rowIndex] && details[_rowIndex].inventoryId :
             details[_rowIndex].inventoryCode)
        )
        
            return <Select disabled={isAdd}
                className={this.extendAction.gridAction.getCellClassName(_ctrlPath)}
                showSearch={true}
                allowClear={true}
                // lazyload={true}
                // dropdownClassNameCopy= {type == 'name' ? 'ttk-scm-app-inventory-documents-inventoryDropdowncopy' : 'ttk-scm-app-inventory-documents-inventoryDropdowncodecopy'}
                // dropdownClassName= {type == 'name' ? 'ttk-scm-app-inventory-documents-inventoryDropdown' : 'ttk-scm-app-inventory-documents-inventoryDropdowncode'}
                lazyload={inventory&&inventory.length > 200 ? true : false}
                dropdownClassName= {type == 'name' ? 
                inventory&&inventory.length > 200 ? 'ttk-scm-app-inventory-documents-inventoryDropdown' : 'ttk-scm-app-inventory-documents-inventoryDropdowncopy':
                inventory&&inventory.length > 200 ? 'ttk-scm-app-inventory-documents-inventoryDropdowncode' : 'ttk-scm-app-inventory-documents-inventoryDropdowncodecopy'}
                dropdownClassNameCopy= {type == 'name' ? 'ttk-scm-app-inventory-documents-inventoryDropdowncopy' : 'ttk-scm-app-inventory-documents-inventoryDropdowncodecopy'}
                dropdownStyle={type == 'name' ? { width: '300px' } : {}}
                enableTooltip={false}
                filterOption={type == 'name' ? this.filterOptionArchives.bind(null, 'inventory') : this.filterOptionCode}
                dropdownFooter={this.handleAddRecord('Inventory', 'inventory', _rowIndex, details[_rowIndex])}
                addFooterClick={this.addRecordClick.bind(null, 'addInventory', 'inventory', _rowIndex, details[_rowIndex])}
                title={title}
                value={value}
                isNeedAdd={true}
                onFocus={() => this.getInventorys(_rowIndex)}
                onChange={this.onFieldChange({
                    id: "data.form.details." + _rowIndex + ".inventoryId",
                    name: "data.form.details." + _rowIndex + ".inventoryName",
                    code: "data.form.details." + _rowIndex + ".inventoryCode",
                    unitId: "data.form.details." + _rowIndex + ".unitId",
                    unitName: "data.form.details." + _rowIndex + ".unitName",
                    propertyName: "data.form.details." + _rowIndex + ".propertyName",
                    propertyDetailName: "data.form.details." + _rowIndex + ".propertyDetailName",
                    taxRateName: "data.form.details." + _rowIndex + ".taxRateName",
                    specification: "data.form.details." + _rowIndex + ".specification"
                }, "data.other.inventory", _rowIndex, details[_rowIndex])}
            >
                {
                    inventory && inventory.map((item, index) => {
                        return <Option value={this.metaAction.isFocus(_ctrlPath) ? item.id : item[type]} title={ type == 'name' ? item.fullName : item.code}>
                           {type == 'name'? this.metaAction.isFocus(_ctrlPath) ? this.getFullNameChildren(item) : item.name : item.code}
                        </Option>
                    })
                }
            </Select>
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        // voucherActionG = GridDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
