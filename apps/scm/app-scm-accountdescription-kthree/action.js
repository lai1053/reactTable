import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import { Map, fromJS, toJS } from 'immutable'
import { Tree } from 'edf-component'
import { FormDecorator, Button } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')

        //this.load()
    }

    load = async () => {

    }

    onOk = async () => {
        
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}