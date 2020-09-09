import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import StockAppStatementsCkhz from "../components/StockAppStatementsCkhz"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.props = this.component.props
        this.params = this.props.params
        injections.reduce("init")
        // this.load(true)
        this.lastState = null
        this.lastParams = null
    }

    renderPage = () => {
        return (
            <StockAppStatementsCkhz
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                params={this.params}
                lastState={this.lastState}
                lastParams={this.lastParams}
                saveLastData={this.saveLastData}></StockAppStatementsCkhz>
        )
    }
    saveLastData = (lastState, lastParams) => {
        this.lastState = lastState
        this.lastParams = lastParams
    }
    componentWillUnmount = () => {
        this.lastState = null
        this.lastParams = null
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
