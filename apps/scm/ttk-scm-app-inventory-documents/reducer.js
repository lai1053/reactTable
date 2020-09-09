import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import {FormDecorator} from 'edf-component'
import index from './index'
import { parse } from 'path';

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        return this.metaReducer.init(state, getInitState())
    }

    initLoad = (state, {initCreate, code, findRes, id, lastDay}) => {
        if(findRes && findRes.attachments){
            findRes.attachments.map(item => {
                if (item) {
                    item.accessUrl = item.file.accessUrl
                    item.type = item.file.type
                }
            })
            state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(findRes.attachments))
        }

        // 三种出库单 manualCost返回为false时，如果单价 或 金额 变动了，保存时校验是否修改
        if(findRes){
            if(findRes.businessTypeId == 5001001005 || findRes.businessTypeId == 5001001006 || findRes.businessTypeId == 5001001007){
                if(findRes.details){
                    state = this.metaReducer.sf(state, 'data.oldDeltailValue', fromJS(findRes.details))
                }
            }
        }
        if(initCreate) {
            state = this.metaReducer.sfs(state, {
                'data.other.bussinessType': fromJS(initCreate.businessTypeDtos),
                'data.setting': fromJS(initCreate.voucherDto),
                'data.other.enableDate': initCreate.enabledtime,
                'data.form.creatorName': initCreate.userDto.nickname
            })
        }

        // let nowDateNum = parseInt(moment().format('YYYYMMDD')),enableDate = initCreate.enabledtime
        // let enableDateNum = enableDate ? parseInt(moment(enableDate).format('YYYYMMDD')) : parseInt(moment('1970-01-01').format('YYYYMMDD')) 
        
        if((!id || id == 'NewInventory') && initCreate){
            const currentOrg = this.metaReducer.context.get("currentOrg")
            let periodDate = currentOrg.periodDate, monthDate
            if (periodDate){
                let a =  initCreate.enabledtime.replace('-',''), b = periodDate.replace('-',''), searchTime
                if(a < b){
                    searchTime = periodDate
                }else{
                    searchTime = initCreate.enabledtime
                }
                monthDate = utils.date.monthStartEndDay(searchTime)
                if (lastDay&&moment(lastDay)) {
                    state = this.metaReducer.sf(state, 'data.form.businessDate', fromJS(moment(lastDay)))
                } else {
                    state = this.metaReducer.sf(state, 'data.form.businessDate', fromJS(moment(monthDate.endDay)))
                }
            } 
        }
        return state
    }

    load = (state, voucher) => {
        if (voucher) {
            let sfsObj = {}
            if(voucher.attachments){
                voucher.attachments.map(item => {
                    if (item) {
                        item.accessUrl = item.file.accessUrl
                        item.type = item.file.type
                    }
                })
                sfsObj['data.form.attachmentFiles'] = fromJS(voucher.attachments)
            }
            
            if (voucher.settles.length == 0) {
                const settles = [{
                        bankAccountId: '',
                        amount: '',
                        bankAccountName: ''
                    }]
                voucher.settles = settles
                sfsObj['data.form.settles'] = fromJS(settles)
            }

            let pageStatus = this.getPageStatus(voucher)
            sfsObj['data.other.pageStatus'] = pageStatus
 
            //如果行数太少,则用空行补足
            if (voucher.details) {
                const details = this.metaReducer.gf(state, 'data.form.details').toJS()
                while (voucher.details.length < details.length) {
                    voucher.details.push(blankDetail)
                }
            }
            sfsObj['data.form'] = fromJS(voucher)

            this.metaReducer.sfs(state, sfsObj)
            return state
        }
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

    parseResponse = (response) => {
        let data = {
            form: response.voucher,
            other: {
                status: common.commonConst.PAGE_STATUS.ADD,
                department: response.departments, //票据
                taxRate: response.taxRates, //税率
                isSignAndRetreat: response.isSignAndRetreat,//即征即退是否显示
                beginDate: response.beginDate, // 单据日期控制
                vatTaxpayer: response.vatTaxpayer, // 纳税人身份
                voucherSource: response.voucherSource,//单据来源
                signAndRetreat: response.signAndRetreats,//即征即退
                columnSetting: response.setting //设置
            }
        }

        //如果行数太少,则用空行补足
        if (data.form && data.form.details) {
            
            while (data.form.details.length < getInitState().data.form.details.length) {
                data.form.details.push(blankDetail)
            }
        }

        return data
    }

    addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.isSaved', true)
		return state
    }
    
    delRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.isSaved', true)
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

    //默认显示行数
	setrowsCount = (state, details, defaultLength) =>{
		state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
		state = this.metaReducer.sf(state, 'data.other.defaultLength', defaultLength)
		return state
    }
    
    updateState = (state, name, value) => {
        state = this.metaReducer.sf(state, name , value)
		return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
