import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import config from './config'
import {Tree} from 'edf-component'
import { FormDecorator,Checkbox } from 'edf-component'
import extend from './extend'

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
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let res = await this.webapi.detailedHabit.queryDocGenerateHabit()

        if(res){       
            this.injections.reduce('load',res)
            this.metaAction.sf('data.other.loading',false)
        }
    }
    
    checkBoxChange = (path, v) => {
        this.metaAction.sf(path,v)
    }

    onOk = async() => {
        let data = this.metaAction.gf('data').toJS()

        let arr = [{
            id : data.id1,
            mergeRule : data.form.mergeRule1,
            ts: data.ts1
        },{
            id : data.id2,
            mergeRule : data.form.mergeRule2,
            ts: data.ts2
        }]
        
        let res = await this.webapi.detailedHabit.saveDocGenerateHabit(arr)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	
	return ret

}