import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import { consts } from 'edf-consts'
import { LoadingMask, FormDecorator, Steps, Popover } from 'edf-component'
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
        //查询初始化状态
        let initState = await this.webapi.financeinit.queryInitState()
        if (initState) {
            //初始化完成 直接跳转科目期初页面           
            if (initState.isFinish) {
                this.component.props.tabEdit('财务期初', 'remove')
                //app-account-beginbalance ttk-gl-app-finance-periodbegin
                setTimeout(() => {
                    this.component.props.setPortalContent &&
                        this.component.props.setPortalContent('财务期初', 'ttk-gl-app-finance-periodbegin', { key: 'beginbalance' })
                }, 20)
            } else {
                //缓存历史步骤
                const step = initState.step,
                    appList = this.metaAction.gf('data.other.appList').toJS(),
                    res = appList.filter((element) => {
                        return element && element.step == step
                    })[0]
                if (initState.dynParams) {
                    //第二步 科目  
                    if (res.step == 3) {
                        const preStep = 'app-account-subjects-financeinit', key = 'manualEentry'
                        this.setContent(res.name, res.appName, { preStep, key })
                    } else {
                        this.setContent(res.name, res.appName)
                    }
                } else {
                    //第二步 科目对照                    
                    if (res.step == 2) {
                        this.setContent('科目初始化', 'ttk-gl-app-financeinit-accountrelation')
                    } else if (res.step == 3) {
                        const preStep = 'ttk-gl-app-financeinit-accountrelation'
                        this.setContent(res.name, res.appName, { preStep })
                    }
                }
            }
        }
    }
    /**
     * 装载app
     */
    setContent = (name, appName, appProps = {}) => {        
        if (appProps && appProps.key && appProps.key == 'beginbalance') {
            //ttk-gl-app-finance-periodbegin app-account-beginbalance
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('财务期初', 'ttk-gl-app-finance-periodbegin')
        }
        //首页门户显示App
        if (appProps && appProps.key && appProps.key == 'portalShow') {
            this.component.props.setPortalContent &&
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



