import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import qrcode from './qrcode'
import { LoadingMask } from 'edf-component'
import Container from './components/container'
import { Spin } from 'antd';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component 
        this.injections = injections 
         injections.reduce('init') 
         this.load()     
    }
    load = async () => {
       
        let data = await this.webapi.weixin.share(this.component.props.initData, this.component.props.params)   
        this.injections.reduce('load', data)
    }
    

    renderContainer = (url)=>{
        // url = ''
        if(url){
            return <Container data = {url}/>
        }else{
            return <Spin className="spin" tip="加载中..."/>
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