import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import md5 from 'md5'
import {LoadingMask} from 'edf-component'
import { Base64 } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.injections = injections
        injections.reduce('init')

        const vatTaxpayer = this.component.props.vatTaxpayer
        if(!!vatTaxpayer) {
            this.metaAction.sf('data.vatTaxpayer', vatTaxpayer)
        }
    }
    onOk = async () => {
        let data = this.metaAction.gf('data').toJS()
        if(data.step == 1) {
            this.metaAction.sf('data.step', 2)
            document.querySelectorAll('.modifyNatureModal .ant-modal-footer button')[1].children[0].innerHTML = '确定'
            return false
        }else if(data.step == 2) {
            return
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
