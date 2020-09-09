import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { history } from 'edf-utils'
import { getInitState } from './data'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {

        this.component = component
        this.injections = injections
        const initState = getInitState(),
            defaultAppName = initState.data.currentAppName

        injections.reduce('init', { initState })

        history.listen('edfx-app-root', this.listen)
        this.onRedirect({ appName: history.getChildApp('edfx-app-root') || defaultAppName })
    }

    listen = (childApp, location, action) => {
        const defaultAppName = getInitState().data.currentAppName
        const currentAppName = this.metaAction.gf('data.currentAppName') || defaultAppName
        const targetAppName = childApp || defaultAppName
        //解决从浏览器地址栏录入url地址后，转到对应的app应用，和金财管家对接用，url里面包含from=jcgj
        // if (action == 'POP' && location) {
        //     const url = location.pathname,
        //         index = url.lastIndexOf("\/"),
        //         appName = url.slice(index + 1);
        //     this.injections.reduce('redirect', appName)
        // }
        if (targetAppName == currentAppName) {
            return
        }


        this.injections.reduce('redirect', targetAppName)
    }

    onRedirect = ({ appName }, params) => {
        history.pushChildApp('edfx-app-root', appName, params)
    }

    componentWillUnmount = () => {
        history.unlisten('edfx-app-root', this.listen)
    }

    setDzInfo = (obj) => {
        this.metaAction.sf('data.dzglInfo', obj)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
