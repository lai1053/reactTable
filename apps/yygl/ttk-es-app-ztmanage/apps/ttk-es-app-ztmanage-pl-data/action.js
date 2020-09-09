import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch as fetchUtil} from 'edf-utils'
import {LoadingMask} from 'edf-component'

import {FormDecorator} from 'edf-component'
import {message} from "antd/lib/index";

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    timer = null;

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init',component.props.batchId)
        this.load1();

        let that = this;
        let batchFinished = this.metaAction.gf('data.batchFinished')
        if(!batchFinished){
            this.timer = setInterval(function () {
                that.load()
            },10000)
        }
    }

    componentWillUnmount = () => {
		if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
		}
    }

    onCancel = () => {
        // debugger
        if(this.timer){
            clearInterval(this.timer)
        }
        this.component.props.fuc()
        this.component.props.fuc1()
        // this.component.props.closeModal();
    }
    load1 = async() =>{
        let batchId = this.metaAction.gf('data.batchId')
        let ret = await this.webapi.plData.plCirculation({batchId:batchId});
        if(ret){
            if(ret.failMsg != 'success'){
                if(this.timer){
                    clearInterval(this.timer)
                }
                this.component.props.fuc()
                this.component.props.fuc1()
                this.component.props.closeModal();
                message.warning(ret.failMsg)
                return

            }else {
                this.metaAction.sfs({
                    'data.success':ret.totalCount,
                    'data.detail':ret.finishCount,
                    'data.batchFinished':ret.batchFinished
                })
            }

        }
    }
    tt = (t,s,f,m) =>{
        return(
            <div>
            <p style={{marginBottom:'8px'}}>批量导账完成，其中：</p>
            <p style={{lineHeight:'25px'}}>总数{t}户，已处理{(s+f)}户（成功{s}户，失败{f}户），未匹配到导账文件{m}户</p>
                <div><span style={{color:'#FA954C'}}>温馨提示：</span><span>未匹配到导账文件的账套，您可以使用采集工具采集账套文件后，重新导入。</span></div>
            </div>

        )
    }
    load = async() =>{
        let batchId = this.metaAction.gf('data.batchId')
        let ret = await this.webapi.plData.plCirculation({batchId:batchId});
        if(ret){
            if(ret.failMsg != 'success'){
                if(this.timer){
                    clearInterval(this.timer)
                }
                this.component.props.fuc()
                this.component.props.fuc1()
                this.component.props.closeModal();
                message.warning(ret.failMsg)
                return

            }else {
                this.metaAction.sfs({
                    'data.success':ret.totalCount,
                    'data.detail':ret.finishCount,
                    'data.batchFinished':ret.batchFinished
                })

                if(ret.batchFinished){
                    if(this.timer){
                        clearInterval(this.timer)
                    }
                    this.component.props.fuc()
                    this.component.props.fuc1()
                    this.component.props.closeModal()
                    let res = await this.metaAction.modal('success', {
                        // title: '提示',
                        content:this.tt(ret.totalCount,ret.finishSuccessCount,ret.finishFailedCount,ret.unMatchCount),
                        okText: '确定',
                    });

                }
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}
