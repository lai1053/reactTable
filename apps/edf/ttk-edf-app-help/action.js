import React from 'react'
import {
    action as MetaAction
} from 'edf-meta-engine'
import config from './config'
import isEqual from 'lodash.isequal'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({component, injections}) => {
        this.component = component
        this.injections = injections
        this.metaAction.sf('data.other.loading',true);
        this.onResize()
        let option = {},response;
        if (this.component.props.code) {
            option.resourceKey = this.component.props.code
            response = await this.webapi.getUrl(option)
            if(response&&response.length > 0){
                const src = `https://erpdoc.jchl.com/UserManual/${response[0].filename}`
                injections.reduce('init', {src})
            }else{
                this.metaAction.toast('error', '页面加载失败！')
                return false
            }
        }

    }


    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.changeFrameHeight()
            }
        }, 50)
    }

    isShow = async()=>{
        this.metaAction.sf('data.other.loading',false)
    }

    changeFrameHeight = () => {
        var ifm = document.getElementById("ttkIframe")
        if (ifm.attachEvent){
            ifm.attachEvent("onload", this.isShow);
        } else {
            ifm.onload = this.isShow
        }
        if (ifm) {
            //ifm.height = parseInt(document.documentElement.clientHeight) + 100
            //ifm.setAttribute('isReload', true)
            window.setTimeout(function () {
                ifm.setAttribute('name', 'ttkIframe')
            }, 0)

        }
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({
            ...option,
            metaAction
        }),
        ret = {
            ...metaAction,
            ...o
        }

    metaAction.config({
        metaHandlers: ret
    })

    return ret
}
