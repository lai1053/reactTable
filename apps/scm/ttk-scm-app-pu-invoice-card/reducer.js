import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator } from 'edf-component'
import index from './index'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        state = this.metaReducer.init(state, getInitState())
        return state
    }

    initLoad = (state, response) => {
        // state = this.metaReducer.sf(state, 'data.form.deductible', false)
        if (!response) {
            return this.metaReducer.sf(state, 'data', fromJS(getInitState().data))
        }

        const detailHeight = this.metaReducer.gf(state, 'data.other.detailHeight')
        let parsed = this.parseResponse(response, detailHeight)

        state = this.metaReducer.sf(state, 'data.form.details', fromJS(parsed.form.details))
        state = this.metaReducer.sf(state, 'data.other.defaultLength', parsed.form.details.length)

        state = this.metaReducer.sf(state, 'data.other.isChanged', false)

        if (response.isSignAndRetreat) { //新增的时候重置
            state = this.metaReducer.sf(state, 'data.form.signAndRetreat', 4000100002)
          //  state = this.metaReducer.sf(state, 'data.other.signAndRetreatCheck', true)
        }

        if (response.vatTaxpayer && response.vatTaxpayer == '2000010001') { //判断认证 认证月份 抵扣 是否显示
            if (parsed.form.invoiceTypeId == 4000010010 || parsed.form.invoiceTypeId == 4000010900) {
                state = this.metaReducer.sf(state, 'data.other.isShowAuth', false)
                state = this.metaReducer.sf(state, 'data.other.isShowDedu', false)
            } else {
                if (parsed.form.invoiceTypeId == 4000010030||parsed.form.invoiceTypeId == 4000010047) {
                    //农产品 旅客运输
                    state = this.metaReducer.sf(state, 'data.other.isShowAuth', false)//不显示认证
                    state = this.metaReducer.sf(state, 'data.other.isShowDedu', true)//显示抵扣
                } else {
                    state = this.metaReducer.sf(state, 'data.other.isShowAuth', true)
                    state = this.metaReducer.sf(state, 'data.other.isShowDedu', true)
                }
            }
        } else if (response.vatTaxpayer && response.vatTaxpayer == '2000010002') {
            state = this.metaReducer.sf(state, 'data.other.isShowAuth', false)
            state = this.metaReducer.sf(state, 'data.other.isShowDedu', false)
        }

        state = this.load(state, parsed.form)

        if (parsed.other) {
            let other = this.metaReducer.gf(state, 'data.other').toJS()
            Object.assign(other, parsed.other)
            state = this.metaReducer.sf(state, 'data.other', fromJS(other))
        }

        return state
    }

    load = (state, voucher, vatTaxpayer) => {
        if (voucher) {
            // state = this.metaReducer.sf(state, 'data.form', fromJS(voucher))
            // state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(voucher.attachments))

            if (voucher.settles && voucher.settles.length == 0) { //现结账户 金额
                const settles = [{
                    bankAccountId: '',
                    amount: '',
                    bankAccountName: ''
                }]
                voucher.settles = settles
                state = this.metaReducer.sf(state, 'data.form.settles', fromJS(settles))
            }

            let pageStatus = this.getPageStatus(voucher)
            state = this.metaReducer.sf(state, 'data.other.pageStatus', pageStatus)

            //如果行数太少,则用空行补足
            if (voucher.details) {
                // const details = this.metaReducer.gf(state, 'data.form.details').toJS()
                // while (voucher.details.length < details.length) {
                let detailHeight = this.metaReducer.gf(state, 'data.other.detailHeight')
                detailHeight = Number(detailHeight.replace('px', ''))
                const length = detailHeight <= 245 ? 245/35 : detailHeight/35
                while (voucher.details.length < length) {
                    voucher.details.push(blankDetail)
                }
            }

            // 上一张下一张凭证
            state = this.metaReducer.sf(state, 'data.other.prevDisalbed', false)
            state = this.metaReducer.sf(state, 'data.other.nextDisalbed', false)

            //是否抵扣 认证
            state = this.metaReducer.sf(state, 'data.form.deductible', voucher.deductible)
            state = this.metaReducer.sf(state, 'data.form.authenticated', voucher.authenticated)
            if (voucher.authenticated) { //若是已经认证，则认证月份 抵扣都是可改的
                state = this.metaReducer.sf(state, 'data.other.authMonthabled', false)
                state = this.metaReducer.sf(state, 'data.other.deductabled', false)
            } else {
                if (voucher.invoiceTypeId == 4000010030) {
                    state = this.metaReducer.sf(state, 'data.other.deductabled', false)
                } else {
                    state = this.metaReducer.sf(state, 'data.other.authMonthabled', true)
                    state = this.metaReducer.sf(state, 'data.other.deductabled', true)
                }
            }
            // 若有征收方式 确定哪个是选中的
            // if (voucher.signAndRetreat) {
            //     if (voucher.signAndRetreat == 4000100001) {
            //         state = this.metaReducer.sf(state, 'data.other.signAndRetreatCheck', false)
            //     } else if (voucher.signAndRetreat == 4000100002) {
            //         state = this.metaReducer.sf(state, 'data.other.signAndRetreatCheck', true)
            //     }
            // }

            state = this.metaReducer.sf(state, 'data.form.signAndRetreat', voucher.signAndRetreat)
            state = this.metaReducer.sf(state, 'data.form', fromJS(voucher))
            state = this.metaReducer.sf(state, 'data.form.attachmentFiles', fromJS(this.changeAttachmentData(voucher.attachments)))

            state = this.metaReducer.sf(state, 'data.other.accountStatus', voucher.accountStatus)

            if (voucher.id) {
                state = this.metaReducer.sf(state, 'data.other.auditVisible', true)
            }

            if (vatTaxpayer && vatTaxpayer == '2000010001') {
                if (voucher.invoiceTypeId == 4000010020 || voucher.invoiceTypeId == 4000010040 || voucher.invoiceTypeId == 4000010045 || voucher.invoiceTypeId == 4000010025) {
                    state = this.metaReducer.sf(state, 'data.other.isShowAuth', true)
                    state = this.metaReducer.sf(state, 'data.other.isShowDedu', true)
                } else {
                    if (voucher.invoiceTypeId == 4000010030||voucher.invoiceTypeId == 4000010047) {
                        //农产品 旅客
                        state = this.metaReducer.sf(state, 'data.other.isShowAuth', false)
                        state = this.metaReducer.sf(state, 'data.other.isShowDedu', true)
                    } else {
                        state = this.metaReducer.sf(state, 'data.other.isShowAuth', false)
                        state = this.metaReducer.sf(state, 'data.other.isShowDedu', false)
                    }
                }
            }

            // //是否为作废
            // if (voucher.discarded != undefined) {
            //     state = this.metaReducer.sf(state, 'data.form.discarded', voucher.discarded)
            // } else {
            //     state = this.metaReducer.sf(state, 'data.form.discarded', false)
            // }

            if (voucher.authenticatedMonth) {
                const authenticatedMonth = voucher.authenticatedMonth.slice(0,7)
                state = this.metaReducer.sf(state, 'data.form.authenticatedMonth', authenticatedMonth)
            }

            if (voucher.inventorys && voucher.inventorys.length != 0) {
                state = this.metaReducer.sf(state, 'data.other.inventorys', fromJS(this.getFullName(voucher.inventorys)))
            }
        }

        const isRed = voucher && voucher.isRed
        state = this.metaReducer.sf(state, 'data.other.isDisableBank', isRed ? true : false)
        // const purchaseTypeId = voucher && voucher.purchaseTypeId
        // state = this.metaReducer.sf(state, 'data.other.isDisableBank', purchaseTypeId == '4000020002' ? true : false)
        //state = this.metaReducer.sf(state, 'data.other.isRender', false)
        return state
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

    parseResponse = (response, detailHeight) => {
        let data = {
            form: response.voucher,
            other: {
                status: common.commonConst.PAGE_STATUS.ADD,
                invoiceType: response.invoiceTypes, //票据
                // inventory: response.inventory,//存货名称
                taxRate: response.taxRates, //税率
                isSignAndRetreat: response.isSignAndRetreat,//即征即退是否显示
                vatTaxpayer: response.vatTaxpayer, // 纳税人身份
                voucherSource: response.voucherSource,//单据来源
                signAndRetreat: response.signAndRetreats,//即征即退
                columnSetting: response.setting, //设置
                inventoryTypes: response.inventoryTypes, //货物类型
                accounts: response.accounts, //存货科目
                taxRateTypes: response.taxRateTypes, //计税方式
                beginDate: response.beginDate, //控制单据日期
                properties: response.properties, // 业务类型
                inventorys: response.inventorys, //所有的存货名称
                inventory: response.inventorys,//所有的存货名称初始的时候不进行过滤
                taxRateType: response.taxRateTypes,//计税方式 不进行过滤的
            }
        }

        //如果行数太少,则用空行补足
        if (data.form && data.form.details) {
            detailHeight = Number(detailHeight.replace('px', ""))
            const length = detailHeight <= 245 ? 245/35 : detailHeight/35
            // while (data.form.details.length < getInitState().data.form.details.length) {
            while (data.form.details.length < length) {
                data.form.details.push(blankDetail)
            }
        }
        return data
    }

    addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.auditVisible', false)
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.auditVisible', false)
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
    setrowsCount = (state, details, defaultLength) => {
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
        state = this.metaReducer.sf(state, 'data.other.defaultLength', defaultLength)
        return state
    }

    updateState = (state, name, value) => {
        state = this.metaReducer.sf(state, name, value)
        return state
    }

    renderFormRender = (state, status) => {
        state = this.metaReducer.sf(state, 'data.other.isRender', status)
        return state
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
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
