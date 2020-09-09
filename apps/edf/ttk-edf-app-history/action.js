import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'

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

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.onTabFocus)
        }

        this.load()
    }

    onTabFocus = () => {
        let position = this.metaAction.gf('data.other.position')
        let selector = document.querySelector('.ttk-edf-app-history .timetree .content')
        selector.scrollTop = position
    }

    handleScroll = () => {
        //计算当前滚动条的高度
        let selector = document.querySelector('.ttk-edf-app-history .timetree .content')
        this.metaAction.sf('data.other.position', selector.scrollTop)
    }

    load = async () => {
        let params = {
            entity: {
                messagetype: 2
            }
        }
        let messages = await this.webapi.getMsg(params)
        let msgList = messages.list
        let history = {}
        for(let i = 0 ; i < msgList.length ; i++) {
            if(msgList[i].messageType == 2) {
                let year = msgList[i].sendTime.slice(0,4)
                if(!history.hasOwnProperty(year)) {
                    history[year] = []
                }
                history[year].push(msgList[i])
            }
        }
        this.metaAction.sf('data.history', history)
    }

    openLink = (target, url, content) => {
        if(target == '_self') {
            if(url == 'ttk-edf-app-history') {
                content = '历史更新'
            }
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent(content, url)
        }else if(target == '_blank') {
            window.open(url)
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