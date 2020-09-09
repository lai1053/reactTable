import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import { consts } from 'edf-consts'
import { LoadingMask, FormDecorator, Popover } from 'edf-component'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }        
        //判断企业列表是否带入orgId
        if(!!this.component.props.organization) {
            this.organization = this.component.props.organization
            this.sourceType = this.component.props.sourceType
        }

        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }
        this.load()
    }
    onTabFocus = () => {
        sessionStorage['_isReTabInitData'] = ''
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.onTabFocus)
        }
    }
    load = async () => {        
        let getIsInit = await this.webapi.importapi.getIsInit()
        if(getIsInit){
            //缓存历史步骤 导账入口：organization：(2直接导账) 其他：企业列表导账
            if(this.organization && this.organization != 2 && this.sourceType != 0){
                let step = await this.webapi.importapi.getImpAccountStep()                               
                if(step){
                    const appList = this.metaAction.gf('data.other.appList').toJS(),
                        res = appList.filter((element) => {
                            return element && element.step == step
                        })[0]
                    this.setContent(res.name, res.appName)
                }               
            }else{                
                this.setContent('创建账套', 'ttk-edf-app-manage-import')
            }
        }else{
            this.setContent('创建账套', 'ttk-edf-app-manage-import')
        }
        
    }
    /**
     * 装载app
     */
    setContent = async (name, appName, appProps = {}) => {
        //首页门户显示App
        const appList = this.metaAction.gf('data.other.appList').toJS(),
            res = appList.filter((element) => {
                return element && element.appName == appName
            })
        if(appName == 'edfx-app-portal') {
            this.component.props.onPortalReload && await this.component.props.onPortalReload('noReloadTplus')
        }
        if (res.length < 1) {
            this.component.props.setPortalContent(name, appName, appProps)
        } else {
            this.injections.reduce('setContent', name, appName, appProps)
        }
    }
    /**
    * 记录app页面的缓存    
    */
    reInitContent = (type = '', content) => {
        let stepContent = this.metaAction.gf('data.content').toJS()
        if (type == 'get') {
            return stepContent
        }
        this.injections.reduce('reInitContent', { ...stepContent, ...content })
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}



