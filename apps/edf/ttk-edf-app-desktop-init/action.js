import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import one from './img/one.png'
import two from './img/two.png'
import three from './img/three.png'
import finishOne from './img/finish_one.png'
import finishTwo from './img/finish_two.png'
import finishThree from './img/finish_three.png'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        // injections.reduce('init')

        // this.metaAction.sf('data.isExpire', this.component.props.isExpire)
    }
    componentDidMount = () => {
        let currentOrg = this.metaAction.context.get('currentOrg')
        this.metaAction.sfs({
            'data.isExpire': this.component.props.isExpire,
            'data.currentOrg':currentOrg
        })
    }
    getBg = (state, step) => {
        let imgs = [one, two, three]
        let finishImgs = [finishOne, finishTwo, finishThree]
        return !state ? imgs[step] : finishImgs[step]
    }

    SBJKopen = () => {
        let currentOrg = this.metaAction.context.get('currentOrg')
        // if(currentOrg.uploadType == 0){
        //     this.openApp('申报缴款', 'ttk-taxapply-app-taxlist')
        // }else
        if(currentOrg.uploadType == 1){
            this.openApp('申报缴款', 'ttk-tax-app-robot-declare-payment')
        }else{
            this.openApp('申报缴款', 'ttk-taxapply-app-taxlist')
        }
    }

    openApp = (name, appName, appProps) => {
        let isExpire = this.metaAction.gf('data.isExpire')
        if(isExpire) return
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent(name, appName, appProps)
    }

    hideInit = async () => {
        let params = []
        params[0] = {
            appName: 'ttk-edf-app-desktop-init',
            isClose: true
        }
        let response = await this.webapi.desktop.saveAppList(params)
        if(response) {
            this.component.props.load()
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
