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

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, response) => {
        if (!response) {
            return this.metaReducer.sf(state, 'data', fromJS(getInitState().data))
        }
        // 启用时间
        if(response.orgParameterDto) state = this.metaReducer.sf(state, 'data.other.beginDate', fromJS(response.orgParameterDto.paramValue))
        if(response.inventoryPropertyDtos) {
            state = this.metaReducer.sf(state, 'data.other.inventoryProperty', fromJS(response.inventoryPropertyDtos))
            state = this.metaReducer.sf(state, 'data.form.inventoryProperty', response.propertyId)
            state = this.metaReducer.sf(state, 'data.form.typeRate', response.rate)
        }
        if(response.rdRecordDetailDtos) {
            let details = []   
            if(response.details){
                state = this.metaReducer.sf(state, 'data.form.details', response.details)
            } else{
                response.rdRecordDetailDtos.map(item=>{
                    item.inventory.price = item.price,
                    item.inventory.quantity = item.quantity,
                    item.inventory.amount = item.amount,
                    item.inventory.propertyName = item.propertyName
                    item.inventory.periodBeginIsSync = item.periodBeginIsSync
                    details.push(item.inventory)
                })
                state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
            }
        }
        state = this.metaReducer.sf(state, 'data.other.isMonthlyClosed', fromJS(response.monthlyClosed))
        state = this.metaReducer.sf(state, 'data.other.flag', fromJS(response.flag))
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
    
    updateState = (state, name, value) => {
        state = this.metaReducer.sf(state, name , value)
		return state
    }
    selectRow = (state, rowIndex, checked) => {
        state = this.metaReducer.sf(state, `data.form.details.${rowIndex}.selected`, checked)
        return state
    }

    //暂估期初
    estimateLoad = (state, response) => {
        if(response.estimateList) {
            state = this.metaReducer.sf(state, 'data.form.estimateList',fromJS(response.estimateList))
        }
        if(response.supplierDtoList) {
            state = this.metaReducer.sf(state, 'data.other.supplier',fromJS(response.supplierDtoList))
        }
        if(response.inventoryDtoList) {
            state = this.metaReducer.sf(state, 'data.other.inventory',fromJS(response.inventoryDtoList))
            state = this.metaReducer.sf(state, 'data.other.inventorys',fromJS(response.inventoryDtoList))
        }
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
