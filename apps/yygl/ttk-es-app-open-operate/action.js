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
        let response = await this.webapi.ifManager()

        if(response){
            this.injections.reduce('updateSingle', 'data.showOpen',false)
        }else{
            this.injections.reduce('updateSingle', 'data.showOpen',true)
        }
    }

    openItOperate = async () => {
        let _this = this
        const ret = await this.metaAction.modal('confirm', {
            title: '开通',
            content: '您确定开通使用运营管理吗？',
        });
        if(ret){
            _this.checkCanOpen()
        }
    }
    checkCanOpen = async () => {
        this.injections.reduce('updateObj', {
            'data.loading':true,
            'data.operateText':'开通中'
        })
        let response = await this.webapi.ifUsedFerEs()
        if(response){
            if(response.res===false){
                // this.doRecordOpen()
                this.doApplyRecordOpen()
            }else{
                this.metaAction.toast('info', response.message)
                this.injections.reduce('updateObj', {
                    'data.loading':false,
                    'data.operateText':'立即使用'
                })
            }
        }else{
            this.injections.reduce('updateObj', {
                'data.loading':false,
                'data.operateText':'立即使用'
            })
        }
    }
    //异步开通接口 循环查询结果
    doRecordOpen = async (record)=>{
        // this.metaAction.sf('data.loading',true)
        // this.metaAction.sf('data.operateText','开通中')
        let response = await this.webapi.openOperate()
        if(response){
            this.doRecordOpenStatus(response)
        }
    }
    doRecordOpenStatus = async (sequenceNo) => {
        let response = await this.webapi.openOperateStatus({sequenceNo:sequenceNo})

        if (response){
            if (response.success) {
                this.metaAction.toast('success', '开通成功！')
                this.injections.reduce('updateObj', {
                    'data.loading':false,
                    'data.operateText':'立即使用'
                })

                this.component.props.closeCurrentContent()
                // const w = window.open('about:blank');
                // let code = await this.webapi.dzCode()
                // w.location.href=`http://test-jcyy.aierp.cn:8089/dzapi.jsp?code=${code}`;
                this.openJcyy()
                return response
            } else {
                this.metaAction.toast('error', '开通失败，请重试！！')
                this.injections.reduce('updateObj', {
                    'data.loading':false,
                    'data.operateText':'立即使用'
                })
                return false
            }
        }
    }
    //排队开通接口
    doApplyRecordOpen = async (record)=>{
        let response = await this.webapi.applyOpenOperate()
        if(response){
            this.metaAction.toast('info', response.message)
            this.injections.reduce('updateObj', {
                'data.loading':false,
                'data.showOpen':true,
                'data.operateText':'立即使用'
            })
        }
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

        if(newWindow==null) {
            this.metaAction.toast('info', '您的浏览器启用弹出窗口过滤功能！请暂时先关闭此功能！');
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