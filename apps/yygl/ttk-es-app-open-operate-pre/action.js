import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setCancelLister) {
            // this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        this.load()
    }

    load = async ()=>{
        let isShow = await this.webapi.ifShowYyMenu()
        // setTimeout(() => {
        //     this.metaAction.sf('data.isShow',true)
        // },5000)
        if(isShow){
            this.injections.reduce('updateSingle', 'data.isShow',false)
            this.component.props.closeCurrentContent()
            // this.goEs()
            this.openJcyy()
        }else{
            this.injections.reduce('updateSingle', 'data.isShow',true)
        }
    }

    goEs = async () => {
        const w = window.open('about:blank');
        let code = await this.webapi.dzCode()
        w.location.href=`http://test-jcyy.aierp.cn:8089/dzapi.jsp?code=${code}`;
    }

    openJcyy = async() => {
        // let newWindow
        // if(consts.XDZ_DEMO.includes(location.host)){
        //     newWindow = window.open(consts.JCYY_DEMO_DOMAIN_HTTPS);
        // }else
        // if(consts.XDZ_ONLINE.includes(location.host)){
        //     newWindow = window.open(consts.JCYY_ONLINE_DOMAIN);
        // }else{
        //     newWindow = window.open(consts.JCYY_TEST_DOMAIN);
        // }
        // let code = await this.webapi.dzCode()
        // if(consts.XDZ_DEMO.includes(location.host)){
        //     newWindow.location = `${consts.JCYY_DEMO_DOMAIN_HTTPS}/dzapi.jsp?code=${code}`;
        // }else if(consts.XDZ_ONLINE.includes(location.host)){
        //     newWindow.location = `${consts.JCYY_ONLINE_DOMAIN}/dzapi.jsp?code=${code}`;
        // }else{
        //     newWindow.location = `${consts.JCYY_TEST_DOMAIN}/dzapi.jsp?code=${code}`;
        // }
        let newWindow = window.open('about:blank');
        // if(consts.XDZ_ONLINE.includes(location.host)){
        //     newWindow = window.open(consts.JCYY_ONLINE_DOMAIN);
        // }else if(consts.XDZ_DEV == location.origin){
        //     newWindow = window.open(consts.JCYY_TEST_DOMAIN);
        // }else{
        //     newWindow = window.open(consts.JCYY_DEMO_DOMAIN_HTTPS);
        // }
        let code = await this.webapi.dzCode()
        if(consts.XDZ_ONLINE.includes(location.host)||consts.XDZ_ONLINE_NEW.includes(location.host)){
            newWindow.location = `${consts.JCYY_ONLINE_DOMAIN}/dzapi.jsp?code=${code}`;
        }else if(consts.XDZ_DEV == location.origin){
            newWindow.location = `${consts.JCYY_TEST_DOMAIN}/dzapi.jsp?code=${code}`;
        }else{
            newWindow.location = `${consts.JCYY_DEMO_DOMAIN_HTTPS}/dzapi.jsp?code=${code}`;
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}