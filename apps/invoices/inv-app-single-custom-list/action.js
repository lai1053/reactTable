import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'

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
    componentWillReceiveProps = async (nextProps) => {

        let currentAppName = 'inv-app-single-custom-general-list'
        const currentOrg = await this.metaAction.context.get("currentOrg")
        const nsrxz = currentOrg && currentOrg.swVatTaxpayer || ''
        // 2000010001 一般企业 2000010002 小规模企业
        if (nsrxz == '2000010002') {
            currentAppName = 'inv-app-single-custom-small-list'
        }
        const appParams = await this.component.props.appParams
        // console.log('single-custom-list:', appParams.orgId, currentAppName, currentOrg.id)
        if (appParams && appParams.orgId && currentOrg && currentOrg.id && appParams.orgId == currentOrg.id) {
            const defaultCurrentAppName = this.metaAction.gf('data.currentAppName')
            currentAppName = currentAppName + '?orgId=' + appParams.orgId
            if (defaultCurrentAppName !== currentAppName) {
                this.metaAction.sf('data.currentAppName', currentAppName)
            }
        }
    }
    componentDidMount = async () => {

    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}