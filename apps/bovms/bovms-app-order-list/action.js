import React from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import config from "./config"
import OrderList from "./components/OrderList"
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
    }
    handleLoginOut = async () => {
        if (this.component.props.onRedirect && this.config.goAfterLogout) {
            let res = await this.webapi.user.logout()
            if (res) {
                this.metaAction.context.set("currentUser", "")
                this.metaAction.context.set("currentOrg", undefined)
                sessionStorage.removeItem("mobile")
                sessionStorage.removeItem("username")
                sessionStorage.removeItem("_accessToken")
                sessionStorage.removeItem("password")
                this.component.props.onRedirect(this.config.goAfterLogout)
            }
        }
    }
    handleGotoPortal = () => {
        if (this.component.props.onRedirect && this.config.goGlPortal) {
            this.component.props.onRedirect(this.config.goGlPortal)
        }
    }
    renderPage = () => {
        const { isPay, payUrl } = this.metaAction.gf("data").toJS()
        if (isPay) {
            return <iframe className="mk-layout bovms-app-order-list" src={payUrl} />
        }
        return (
            <OrderList
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                onLoginOut={this.handleLoginOut}
                onGotoPortal={this.handleGotoPortal}
            />
        )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
