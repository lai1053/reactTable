import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = async({ component, injections }) => {
        this.component = component
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.injections = injections
        let detail = this.component.props.detail
	    let productList = await this.webapi.productList()
        injections.reduce('init', detail, productList && productList.list)
    }

    onOk = async () => {
        return true
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
