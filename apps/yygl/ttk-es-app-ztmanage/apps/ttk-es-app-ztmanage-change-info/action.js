import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch} from 'edf-utils'
import {LoadingMask} from 'edf-component'

import {FormDecorator} from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi

    }

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
        injections.reduce('init');
        this.load();

    }

    load = async() => {
        let ret = await this.webapi.info.infoList({orgId:this.component.props.id});
        if(ret){
            this.injections.reduce('update',{path:'data.list',value:ret.data});
        }
    }

    firstOk = () => {
        this.component.props.closeModal();
    }
    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        // let width = 0
        console.log('111',column)
        column.forEach((item,index) => {
            arr.push({
                title: item.caption,
                dataIndex: item.fieldName,
                key: item.fieldName,
                width: item.width,
                align: item.align,
                className: item.className,
                render: (text, record) => {
                    console.log('sssssssss',text)
                    return (<span title={text}>{text}</span>)
                },
            })
        })
        return arr
    }



    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {token: token}
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
