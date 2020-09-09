import React from 'react'
import {action as MetaAction} from 'edf-meta-engine'
import config from './config'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    
    
    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        this.queryGxfpList()
    }
    
    // 请求列表
    queryGxfpList = async () => {
        this.metaAction.sf('data.loading', true)
        const {vatTaxpayerNum} = this.metaAction.context.get("currentOrg")
        let req = {
            entity: {
                rzzt: "0", // 认证状态 默认未0 必填
                gfsbh: vatTaxpayerNum
                
            },
            page: {
                "currentPage": 1,
                "pageSize": 20
            }
        }
        
        const response = await this.webapi.person.queryGxfpList(req)
        this.metaAction.sf('data.loading', false)
        if (!response) {
            this.metaAction.toast('error', '请求客户信息失败');
        }
        if (response.encryptedFileNeeded === true) {
            this.metaAction.sf('data.show.demo', '2')
        } else {
            this.metaAction.sf('data.show.demo', '1')
        }
    }
    
    
    //点击上传秘钥
    upSecretKey = () => {
        this.metaAction.modal('show', {
            title: '上传秘钥',
            className: 'inv-app-fastAuthentication-upsecret',
            width: 506,
            height: 500,
            style: {top: '30%'},
            /*footer:null,*/
            children: this.metaAction.loadApp('inv-app-fastAuthentication-upsecret', {
                store: this.component.props.store,
                queryGxfpList: this.queryGxfpList
            }),
        })
    }
    
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    
    metaAction.config({metaHandlers: ret})
    
    return ret
}

