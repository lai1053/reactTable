import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator } from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        return this.metaReducer.init(state, getInitState())
    }

    getVoucherStatus = (state) => {
        let discarded = this.metaReducer.gf(state, 'data.form.discarded')
        if (discarded) {
            return true
        }

        let status = this.metaReducer.gf(state, 'data.form.status')

        if (status == 1000020002) {
            return true
        }

        if (status == 1000020003 || status == 1000020001) {
            return false
        }

        let pageStatus = this.metaReducer.gf(state, 'data.other.pageStatus')
        return pageStatus == common.commonConst.PAGE_STATUS.READ_ONLY
    }

    initLoad = (state, response) => {
        if (!response) {
            let data = getInitState().data
            data.other.voucherStatus = this.getVoucherStatus(state)
            return this.metaReducer.sf(state, 'data', fromJS(data))
        }
        let parsed = this.parseResponse(response)

        state = this.load(state, parsed.form)

        let updateStateList = {
            'data.other.isChanged': false,
            'data.other.dataOpen': true
        }

        state = this.metaReducer.sfs(state, updateStateList)
        if (parsed.other) {
            let other = this.metaReducer.gf(state, 'data.other').toJS()
            parsed.other.voucherStatus = this.getVoucherStatus(state)
            Object.assign(other, parsed.other)

            state = this.metaReducer.sf(state, 'data.other', fromJS(other))
        }


        return state
    }

    load = (state, voucher) => {
        let updateStateList = {}

        if (voucher) {
            let pageStatus = this.getPageStatus(voucher)

            updateStateList['data.other.pageStatus'] = pageStatus

            //如果行数太少,则用空行补足
            if (voucher && voucher.details) {
                const details = this.metaReducer.gf(state, 'data.form.details').toJS()
                while (voucher.details.length < details.length) {
                    voucher.details.push(blankDetail)
                }
            }
            updateStateList = {
                'data.other.prevDisalbed': false,
                'data.other.nextDisalbed': false,
                'data.form': fromJS(voucher)
            }

            if (voucher.settles.length == 0) {
                const settles = [{
                    bankAccountId: '',
                    amount: '',
                    bankAccountName: ''
                }]
                voucher.settles = settles
                updateStateList['data.form.settles'] = fromJS(settles)
                //state = this.metaReducer.sf(state, 'data.form.settles', fromJS(settles))
            }

            if (voucher.status && voucher.status == 1000020001) {

                updateStateList['data.form.attachmentStatus'] = 0
                //state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 0)
            }
            if (voucher.status && voucher.status == 1000020002) {
                updateStateList['data.form.attachmentStatus'] = 1
                //state = this.metaReducer.sf(state, 'data.form.attachmentStatus', 1)
            }

            if (voucher.attachments) {
                voucher.attachments.map(item => {
                    if (item) {
                        item.accessUrl = item.file.accessUrl
                        item.type = item.file.type
                    }
                })
                updateStateList['data.form.attachmentFiles'] = fromJS(voucher.attachments)
            }

            updateStateList['data.form.signAndRetreat'] = voucher.signAndRetreat;

            if (voucher.discarded !== undefined) {
                updateStateList['data.form.discarded'] = fromJS(voucher.discarded)
                //state = this.metaReducer.sf(state, 'data.form.discarded', fromJS(voucher.discarded))
            }

            if (voucher.id) {
                updateStateList['data.other.auditVisible'] = true
            }
            else {
                updateStateList['data.other.auditVisible'] = false
            }

            

            // if (voucher.signAndRetreat == 4000100001) {
            //     updateStateList['data.form.signAndRetreat'] = false
            // } else {
            //     updateStateList['data.form.signAndRetreat'] = true
            // }
        }

        const saleTypeId = voucher && voucher.saleTypeId

        if (saleTypeId == '4000050002') {
            updateStateList['data.other.isDisableBank'] = true
        }
        else {
            updateStateList['data.other.isDisableBank'] = false
        }

        state = this.metaReducer.sfs(state, updateStateList)

        updateStateList['data.other.voucherStatus'] = this.getVoucherStatus(state)

        return this.metaReducer.sfs(state, updateStateList)

    }

    getPageStatus = (voucher) => {
        let status = voucher.status
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
                invoiceType: response.invoiceTypes,
                taxRate: response.taxRates,
                signAndRetreat: response.signAndRetreats,
                isSignAndRetreat: response.isSignAndRetreat,
                beginDate: response.beginDate,
                columnSetting: response.setting, //设置
                inventoryTypes: response.inventoryTypes, //货物类型
                taxRateTypes: response.taxRateTypes, //计税方式
                revenueType: response.businessTypes,
                taxRateType: response.taxRateTypes,//计税方式 不进行过滤的
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

    addRowBefore = (state) => {
        return this.metaReducer.sf(state, 'data.other.auditVisible', false)
    }

    delRowBefore = (state) => {
        return this.metaReducer.sf(state, 'data.other.auditVisible', false)
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
        let updateStateList = {
            'data.form.details': fromJS(details),
            'data.other.defaultLength': defaultLength
        }
        state = this.metaReducer.sfs(state, updateStateList)
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
