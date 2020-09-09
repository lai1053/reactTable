import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState, blankDetail} from './data'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import {consts, common} from 'edf-constant'
import {FormDecorator} from 'edf-component'
import index from './index'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.config = config.current
		this.voucherReducer = option.voucherReducer
	}

	init = (state, option) => {
		return this.metaReducer.init(state, getInitState())
	}

	// 返回的附件信息不符合格式需要处理下
    changeAttachmentData = (data) => {
		if( data && data.length > 0 && !data[0].accessUrl){
			return data.map(item => {
                if( item.file ) {
                    const { accessUrl, originalName, type } = item.file
                    return {
                        ...item,
                        accessUrl: accessUrl,
                        name: originalName,
                        alt:originalName,
                        type: type
                    }
                }else {
                    return item
                }
				
			})
		}else{
			return data
		}
	}

	initLoad = (state, response) => {
		if (!response) {
			state = this.metaReducer.sf(state, 'data', fromJS(getInitState().data))
			return state
		}
		let parsed = this.parseResponse(response, true, state)
		state = this.metaReducer.sf(state, 'data.other.isChanged', false)
		if (parsed.other) {
			let other = this.metaReducer.getField(state, 'data.other').toJS()
			Object.assign(other, parsed.other)
			state = this.metaReducer.sf(state, 'data.other', fromJS(other))
		}
		if(response.initId) {
			state = this.metaReducer.sf(state, 'data.other.isSaveSuccess', true)
		}else{
			state = this.metaReducer.sf(state, 'data.other.isSaveSuccess', false)
		}
		state = this.load(state, parsed.form)
		if(response.bankAccountId){
			state = this.metaReducer.sf(state, 'data.form.bankAccountId', response.bankAccountId)
		}
		if(response.accountList){
			state = this.metaReducer.sf(state, 'data.other.bankAccountList', fromJS(response.accountList))
		}
		return state
	}

	load = (state, voucher) => {
		if (voucher) {
			const businessTypes = this.metaReducer.gf(state, 'data.other.businessTypes')
				.toJS();
			// state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(voucher.attachments))
			let pageStatus = this.getPageStatus(voucher)
			state = this.metaReducer.sf(state, 'data.other.pageStatus', pageStatus)
			if( voucher.attachments ) {
				voucher.attachments = this.changeAttachmentData(voucher.attachments)
			}
			voucher.details.forEach(function(data,index){
				businessTypes.forEach(function (businessData) {
					if(`${data.businessTypeId}`.includes(`${businessData.id}`)){
						voucher.details[index].businessTypeArrName = [businessData.id, data.businessTypeId]
					}
				})
				if (data && data['customerName']) {
					voucher.details[index].deptPersonName = data['customerName'];
					voucher.details[index].calcObject = "customer";
				}else if (data && data['personName']) {
					voucher.details[index].deptPersonName = data['personName'];
					voucher.details[index].calcObject = "person";
				}else if (data && data['supplierName']) {
					voucher.details[index].deptPersonName = data['supplierName'];
					voucher.details[index].calcObject = "supplier";
				}else if (data && data['assetClassName']) {
					voucher.details[index].deptPersonName = data['assetClassName'];
					voucher.details[index].calcObject = "assetClass";
				}
			})
			//如果行数太少,则用空行补足
			if (voucher.details) {
				// const details = this.metaReducer.gf(state, 'data.form.details').toJS()
				const count = this.metaReducer.gf(state, 'data.other.detailHeight')
				while (voucher.details.length < count) {
					voucher.details.push(blankDetail)
				}
			}
			let sourceVoucherTypeId = voucher.sourceVoucherTypeId
			state = this.metaReducer.sf(state, 'data.other.sourceVoucherTypeId', sourceVoucherTypeId)
			state = this.metaReducer.sf(state, 'data.form', fromJS(voucher))
			state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(voucher.attachments ? voucher.attachments : []))
			return state
		}
		return state
	}

	getPageStatus = (voucher) => {
		let status = voucher.status,
			settleStatus = voucher.settleStatus
		if (status == consts.consts.VOUCHERSTATUS_Approved || status == consts.consts.SETTLESTATUS_settled) {
			return common.commonConst.PAGE_STATUS.READ_ONLY;
		}
		if (voucher.id) {
			return common.commonConst.PAGE_STATUS.EDIT
		} else {
			return common.commonConst.PAGE_STATUS.ADD
		}
	}

	parseResponse = (response, noDetails, state) => {
		response.businessTypes.forEach(function(data){
			data.label = data.name
			data.value = data.id
			data.children && data.children.forEach(function (childrenData) {
				childrenData.label = childrenData.name
				childrenData.value = childrenData.id
				childrenData.fatherName = data.name
				childrenData.fatherId = data.id
			})
		})
		//getInitState()
		let formDate = response.voucher ? response.voucher : getInitState().data.form
		let data = {
			form: formDate,
			other: {
				// businessType:[response.businessTypes],
				assetClassesList:response.assetClasses, //契税
				businessTypes: response.businessTypes, // 收款类型
				status: common.commonConst.PAGE_STATUS.ADD,
				invoiceType: response.invoiceTypes, //票据
				taxRate: response.taxRates, //税率
				isSignAndRetreat: response.isSignAndRetreat,//即征即退是否显示
				beginDate: response.beginDate, // 单据日期控制
				vatTaxpayer: response.vatTaxpayer, // 纳税人身份
				voucherSource: response.voucherSource,//单据来源
				signAndRetreat: response.signAndRetreats,//即征即退
				columnSetting: response.setting, //设置
				sourceVoucherTypeId: formDate.sourceVoucherTypeId//单据来源id
			}
		}
		//如果行数太少,则用空行补足
		if (data.form && data.form.details) {
			const count = this.metaReducer.gf(state, 'data.other.detailHeight')
			while (data.form.details.length < count ) {
				data.form.details.push(blankDetail)
			}
		}
		return data
	}

	addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.isSaveSuccess', false)
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.isSaveSuccess', false)
        return state
    }

	//附件上传状态
	attachmentLoading = (state, attachmentLoading) => {
		// return this.metaReducer.sf(state, 'data.form.attachmentLoading', attachmentLoading)
		return this.voucherReducer.attachmentLoading(state, attachmentLoading)
	}

	//附件显示状态
	attachmentVisible = (state, attachmentVisible) => {
		return this.metaReducer.sf(state, 'data.form.attachmentVisible', attachmentVisible)
	}

	upload = (state, file, ts, attachedNum) => {
		return this.voucherReducer.upload(state, file, ts, attachedNum)
	}

	moveRowToUpOrDown = (state, gridName, rowIndex, upOrDown) => {
		let details = this.metaReducer.gf(state, `data.form.${gridName}`).toJS()
		const MOVEROW_UP = this.metaReducer.gf(state, 'data.other.MOVEROW_UP')
		const MOVEROW_DOWN = this.metaReducer.gf(state, 'data.other.MOVEROW_DOWN')

		let curItem = details[rowIndex],
			targetItem = details[rowIndex - 1]

		if (upOrDown == MOVEROW_UP) {
			curItem = details[rowIndex]
			targetItem = details[rowIndex - 1]
			details[rowIndex - 1] = curItem
			details[rowIndex] = targetItem
		} else if (upOrDown == MOVEROW_DOWN) {
			curItem = details[rowIndex]
			targetItem = details[rowIndex + 1]
			details[rowIndex + 1] = curItem
			details[rowIndex] = targetItem
		}

		state = this.metaReducer.sf(state, `data.form.${gridName}`, fromJS(details))
		return state
	}

	//默认显示行数
	setrowsCount = (state, details, defaultLength) => {
		state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
		state = this.metaReducer.sf(state, 'data.other.defaultLength', defaultLength)
		return state
	}

	addUnitProject = (state, path, ret, index) => {
		if(path === 'project' && !ret.isEnable){
			return state
		}
		
		let form = this.metaReducer.gf(state, 'data.form').toJS()
		if(path=='project'){
			form.details[index].projectId = ret.id
			form.details[index].projectName = ret.name
		}else{
			form.details[index].departmentId = ret.id
			form.details[index].departmentName = ret.name
		}
		
		state = this.metaReducer.sf(state, 'data.form.details', fromJS(form.details))
		return state
	}

	addAccount = (state, ret) => {
		state = this.metaReducer.sf(state, 'data.form.bankAccountId', fromJS(ret.id))
		state = this.metaReducer.sf(state, 'data.form.bankAccountName', fromJS(ret.name))
		return state
	}

	addDeptPerson = (state, ret, rowIndex, name) => {
		let form = this.metaReducer.gf(state, 'data.form').toJS()

		if(name == "person"){
			form.details[rowIndex].personId = ret.id
			form.details[rowIndex].personName = ret.name
		}else if(name == "supplier"){
			form.details[rowIndex].supplierId = ret.id
			form.details[rowIndex].supplierName = ret.name
		}else {
			form.details[rowIndex].customerId = ret.id
			form.details[rowIndex].customerName = ret.name
		}

		form.details[rowIndex].deptPersonId = ret.id
		form.details[rowIndex].deptPersonName = ret.name

		state = this.metaReducer.sf(state, 'data.form.details', fromJS(form.details))
		return state
	}

	setSaveStatus = (state, value) => {
		state = this.metaReducer.sf(state, 'data.other.isSaveSuccess', value)
		return state
	}
	
	update = (state, {path, value}) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({...option, metaReducer}),
		voucherReducer = FormDecorator.reducerCreator({...option, metaReducer}),
		o = new reducer({...option, metaReducer, extendReducer, voucherReducer})

	return {...metaReducer, ...extendReducer.gridReducer, ...o}
}
