import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import StockAppStatementsSalesGrossPro from "../components/StockAppStatementsSalesGrossPro"
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.extendAction = option.extendAction
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
        // let addEventListener = this.component.props.addEventListener;
        // if (addEventListener) {
        //  addEventListener('onTabFocus', this.load);
        // }
        // this.load()
        this.lastState = null
    }

    renderPage = () => {
        return (
            <StockAppStatementsSalesGrossPro
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                component={this.component}
                lastState={this.lastState}
                saveLastData={this.saveLastData}></StockAppStatementsSalesGrossPro>
        )
    }
    saveLastData = lastState => {
        this.lastState = lastState
    }
    componentWillUnmount = () => {
        this.lastState = null
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
