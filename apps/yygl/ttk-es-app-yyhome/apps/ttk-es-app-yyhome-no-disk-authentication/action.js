import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    timer = null

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

    }

    load = async ()=>{

    }

    renderAuthenticationChildren = () =>{
        return (
            <div className="wrapper">
                <div className="banner">
                    <img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/no-disk.png" alt=""/>
                </div>
                <h2 style={{height:'40px'}}>重磅好消息！！！</h2>
                <p className="p1">金财代账，无盘认证上线，一键免登录、不插盘、快捷认证！</p>
                <p className="p2">广东区域现已上线，其他区域即将提供，敬请期待…</p>
                <div className="step"><h3 style={{height:'auto'}}>操作步骤</h3></div>
                <dl>
                    <dt><span>1</span>登录金财代账</dt>
                    <dd><span></span>路径一：进入【首页-批量-勾选认证】，选择对应客户，点击【无盘认证】</dd>
                    <dd><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/pic1.png" alt=""/></dd>
                    <dd><span></span>路径二：您也可以进入【单户-税务申报-发票认证】点击【无盘认证】</dd>
                    <dd><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/pic2.png" alt=""/></dd>
                    <dt className="dt2"><span>2</span>一键登录发票综合服务平台</dt>
                    <dd><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/pic3.png" alt=""/></dd>
                    <dd><b>全程不用插盘！！！</b>直接进行抵扣勾选、统计、签名</dd>
                    <dd className="dd2" style={{height:'29px'}}>划重点</dd>
                    <dd>本月发票综合服务平台升级，先进行确认密码维护再签名，具体路径如下</dd>
                    <dd><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/pic4.png" alt=""/></dd>
                    <dd className="dd3"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/jiantou2.gif" alt="" className="img2"/>您还在等什么，快来试试吧！<img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/noDisk/jiantou2.gif" alt=""/></dd>
                </dl>
            </div>
        )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}