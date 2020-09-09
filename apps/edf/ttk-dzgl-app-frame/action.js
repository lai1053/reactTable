import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import isEqual from 'lodash.isequal'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        await this.webapi.init()
        const response = await this.webapi.portal()
        if(response) {
            this.metaAction.context.set('currentUser', response.user)
            let periodDate = response.periodDate || { periodDate : '9999-01' }
            let month = periodDate.periodDate.split('-')[1]
            if(month < 10) {
                month = '0' + Number(month)
            }
            response.org.periodDate = periodDate.periodDate.split('-')[0] + '-' + month
            response.org.maxClosingPeriod = periodDate.maxClosingPeriod
            if(response.areaRule){
                response.org.areaCode = response.areaRule.areaCode
                response.org.invoiceVersion = response.areaRule.invoiceVersion
            }
            this.metaAction.context.set('currentOrg', response.org)

            this.metaAction.sfs({
                'data.orgName': response.org.name,
                'data.appName': this.component.props.targetAppName.indexOf('?') == -1 ? this.component.props.targetAppName + '?orgId=' + response.org.id :  this.component.props.targetAppName + '&orgId=' + response.org.id,
            })
        }
    }

    componentWillReceiveProps = async (nextProps) => {
        if(!isEqual(nextProps.isRefresh,  this.component.props.isRefresh)) {
            this.load()
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
