import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import Message from './components/Message.js'

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

    load = async (pageInfo) => {
        let params = {
            page: {
                pageSize: (pageInfo && pageInfo.pageSize) || 50,
                currentPage: (pageInfo && pageInfo.currentPage) || 1
            }
        }
        let messages = await this.webapi.getMsg(params)
        this.injections.reduce('load', messages)
    }

    //全选事件
    checkAll = (e) => {
        let status = e.target.checked,
            messages = this.metaAction.gf('data.messages')
        messages = messages.map(v => {
            let u = v.update('checked', () => status)
            return u
        })
        this.metaAction.sfs({
            'data.checkedAll': status,
            'data.messages': messages
        })
    }

    //标记已读
    markRead = async (msgId) => {
        let params =[]
        if(msgId && (typeof msgId != 'object')) {
            params.push({messageId: msgId})
        }else {
            //获取标记的id
            let messages = this.metaAction.gf('data.messages')
            messages = messages.map(v => {
                let id = v.get('id')
                if(v.get('checked')) {
                    params.push({messageId: id})
                }
            })
        }
        if(params.length == 0) {
            this.metaAction.toast('warning', '请选择需要标记的数据')
            return
        }
        let response = await this.webapi.markRead(params)
        let messages = this.metaAction.gf('data.messages')
        messages = messages.map(v => {
            if(v.get('checked')) {
                let u = (v.update('isRead', () => true)).update('checked', () => false)
                return u
            }else {
                return v
            }
        })
        this.metaAction.sfs({
            'data.messages': messages
        })
        this.component.props.getMsgNum()
    }

    //勾选事件
    markCheck = (e,index) => {
        let messages = this.metaAction.gf('data.messages')
        messages = messages.updateIn([index, 'checked'], o => e.target.checked)
        this.metaAction.sf('data.messages', messages)
    }

    //删除
    deleteMsg = async () => {
        let params = []
        let messages = this.metaAction.gf('data.messages')
        messages = messages.map(v => {
            let id = v.get('id')
            if(v.get('checked')) {
                params.push({messageId: id, state: v.get('isRead') ? 1 : 0})
            }
        })
        if(params.length == 0) {
            this.metaAction.toast('warning', '请选择要删除的数据')
            return
        }
        let response = await this.webapi.delMsg(params)
        //获取当前的分页信息
        let page = this.metaAction.gf('data.pagination')
        this.load(page)
        this.component.props.getMsgNum()
    }

    //显示modal
    showModal = (index) => {
        let messages = this.metaAction.gf('data.messages')
        //获取内容
        let msgContent = messages.getIn([index, 'content'])
        let type = messages.getIn([index, 'messageType'])
        if(type == 2) {
            msgContent += '<p><br/></p><p>查看更多历史版本更新内容点击---<a href="ttk-edf-app-history" target="_self">更多</a></p>'
        }
        let msgTitle = messages.getIn([index, 'title'])
        messages = messages.updateIn([index, 'isRead'], o => true)
        this.metaAction.sfs({
            'data.showModal': true,
            'data.messages': messages,
            'data.msgContent': msgContent,
            'data.msgTitle': msgTitle
        })
        // 标记已读
        let msgId = messages.getIn([index, 'id'])
        this.markRead(msgId)
    }

    //隐藏modal
    hideModal = () => {
        this.metaAction.sf('data.showModal', false)
    }

    //消息详情
    getMessageContent = () => {
        let msgContent = this.metaAction.gf('data.msgContent')
        let setContent = this.component.props.setPortalContent
        let content = <Message setContent={setContent} msgText={msgContent} />
        return content
    }

    getMessageType = (type) => {
        if(type == 1) {
            return '系统通告'
        }else if(type == 2) {
            return '新功能更新'
        }else if(type == 3) {
            return '预警消息'					
        }else if(type == 4) {
            return '提醒信息'					
        }
    }

    //切换currentpage、pagesize
    pageChanged = (currentPage, pageSize) => {
        let page = {
            currentPage, pageSize
        }
        this.load(page)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}