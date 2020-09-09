import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'
import moment from 'moment'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }
    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }
    load = (state, res) => {
        state = this.metaReducer.sf(state, 'data.form.vatTaxpayer', fromJS(res.vatTaxpayer))
        state = this.metaReducer.sf(state, 'data.form.periodDate', fromJS(`${res.enabledYear}-${res.enabledMonth}`))
        state = this.metaReducer.sf(state, 'data.form.name', fromJS(res.name))
        state = this.metaReducer.sf(state, 'data.other.isMonthly', fromJS(res.isMonthly))
        state = this.metaReducer.sf(state, 'data.form.accountingStandards', fromJS(res.accountingStandards))
        state = this.metaReducer.sf(state, 'data.form.vatTaxpayerEnum', fromJS(res.vatTaxpayerEnum))
        state = this.metaReducer.sf(state, 'data.form.accountingStandardsEnum', fromJS(res.accountingStandardsEnum))
        state = this.metaReducer.sf(state, 'data.other.modifyStatus', fromJS(res.modifyStatus))
        state = this.metaReducer.sf(state, 'data.form.ts', fromJS(res.ts))
        state = this.metaReducer.sf(state, 'data.form.vatTaxpayerNum', fromJS(res.vatTaxpayerNum))
        if (res.queryExcelCheckedInfo && res.queryExcelCheckedInfo.flag == true) {
            state = this.metaReducer.sf(state, 'data.other.checkedResult', fromJS(res.queryExcelCheckedInfo))

            let key, name = res.queryExcelCheckedInfo.excelType == 'TTK' ? '标准模板' : res.queryExcelCheckedInfo.excelType,
                fiSoftTypeList = this.metaReducer.gf(state, 'data.form.templateData') && this.metaReducer.gf(state, 'data.form.templateData').toJS(),
                item
            if (fiSoftTypeList) {
                
                item = fiSoftTypeList.find(item => (item.name).replace(/\s+/g, "") == name)
                
                key = item && item.key
            }
            state = this.metaReducer.sf(state, 'data.form.templateType', key)
            if(res.queryExcelCheckedInfo.excelType=='标准模板'){
                state = this.metaReducer.sf(state,'data.downloadTempShow',true)
            }else{
                state = this.metaReducer.sf(state,'data.downloadTempShow',false)
            }
            state = this.metaReducer.sf(state, 'data.other.disabled', false)

            let checkedResult = res.queryExcelCheckedInfo
            if (checkedResult && checkedResult.flag == true) {
                state = this.metaReducer.sf(state, 'data.other.isCanNotToNextStep', false)
                state = this.metaReducer.sf(state, 'data.other.nextStepBtnType', 'primary')
            } else {
                state = this.metaReducer.sf(state, 'data.other.isCanNotToNextStep', true)
                state = this.metaReducer.sf(state, 'data.other.nextStepBtnType', '')
            }
        } else {
            state = this.metaReducer.sf(state, 'data.other.checkedResult', undefined)
        }
        return state
    }
    uploadFile = (state, value, checkedResult) => {
        state = this.metaReducer.sf(state, 'data.uploadFile', fromJS(value))
        state = this.metaReducer.sf(state, 'data.other.checkedResult', fromJS(checkedResult))
        state = this.metaReducer.sf(state, 'data.fileName', fromJS(value.originalName))
        state = this.metaReducer.sf(state, 'data.other.isUploaded', true)
        if (checkedResult && checkedResult.flag == true) {
            state = this.metaReducer.sf(state, 'data.other.isCanNotToNextStep', false)
            state = this.metaReducer.sf(state, 'data.other.nextStepBtnType', 'primary')
        } else {
            state = this.metaReducer.sf(state, 'data.other.isCanNotToNextStep', true)
            state = this.metaReducer.sf(state, 'data.other.nextStepBtnType', '')
        }

        return state
    }

    fiSoftChange = (state, path, value) => {
        if (path == 'data.form.templateType') {
            state = this.metaReducer.sf(state, 'data.other.disabled', false)
        }
        state = this.metaReducer.sf(state, path, value)
        state = this.metaReducer.sf(state, 'data.downloadTempShow', (value == 0))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
