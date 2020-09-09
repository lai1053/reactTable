import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import { Map, fromJS } from 'immutable'
import extend from './extend'
import { LoadingMask, FormDecorator, Menu, Checkbox, DataGrid, Icon } from 'edf-component'
import { moment as momentUtil } from 'edf-utils'
import { formatNumbe } from './../common'
const colKeys = ['code', 'name', 'number', 'work', 'size','monery','pices']

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi=this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        this.ids= this.component.props.ids;
        injections.reduce('init')
    }
    onOk = async () => {
        return await this.save()
    }
    save = async () => {
        var value = this.metaAction.gf('data.exportType')
        return value
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