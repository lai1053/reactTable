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
        this.initPage()
    }
    initPage = () => {
        const currentOrg = this.metaAction.context.get("currentOrg"),
            nsrxz = currentOrg && currentOrg.swVatTaxpayer || '';
        // 2000010001 一般企业 2000010002 小规模企业
        console.log(nsrxz);
        if (nsrxz) {
            const currentAppName = nsrxz != 2000010002 ? 'inv-app-single-custom-general-list' : 'inv-app-single-custom-small-list'
            this.metaAction.sf('data.currentAppName', currentAppName)
        } else {
            console.error('inv-app-single-custom-list-for-simple-portal:', '上下文值错误');
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