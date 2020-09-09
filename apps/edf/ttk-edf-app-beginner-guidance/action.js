import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import flow_chart from './img/flow-chart.png'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init', this.config.data)
    }

    getFlowChart = () => {
        return flow_chart
    }

    openApp = (name, appName, appProps) => {
        if(name == null || appName == null) return
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent(name, appName, appProps)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}