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

    }

    firstOk = () => {
        let visible = this.metaAction.gf('data.conVisible');
        this.injections.reduce('update',{path:'data.conVisible',value:!visible});
    }
    firstCancel = () => {
        this.component.props.closeModal();
    }
    secondOk = async() => {
        LoadingMask.show();
        let ret = await this.webapi.changeInfo.saveInfo(this.component.props.params)
        if (ret){
            if (ret.success){
                LoadingMask.hide();
                this.component.props.closeModal();
                this.component.props.fun();
            }else {
                LoadingMask.hide();
            }
        }else {
            LoadingMask.hide();
        }

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
