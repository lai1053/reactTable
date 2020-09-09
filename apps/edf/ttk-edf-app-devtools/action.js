import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import utils from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
    }

    getApps = () => {
        const keys = Object.keys(this.config && this.config.apps)
        var ret = {}
        keys.forEach(k => {
            if (k != 'config') {
                if(this.config && this.config.apps){
                    ret[k] = { ...this.config.apps[k], _notParse: true }
                }
                
            }
        })
        
        return ret
    }

    tabChange = (key) => {
        this.metaAction.sf('data.tabKey', key)
    }

    getState = () => {
        return window.reduxStore.getState().toJS()
    }

    getMockData = () => {
        return utils.fetch.mockData
    }

    getAPIs = () => {
        return utils.fetch.mockApi
    }

    isExistsApp = (appName) => {
        if(this.config && this.config.apps){
            return !!this.config.apps[appName]
        }
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