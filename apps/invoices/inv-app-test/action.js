import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {message} from "antd";
import moment from "moment";

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
    }

    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
    judgeIsChoseBill = async type => {
       let nsqj=moment().format('YYYYMM')
        let skssq = moment(`${nsqj}01`).subtract(1, "month")
        const height = document.body.clientHeight - 40 || 700
        const width = document.body.clientWidth - 50 || 1000
        
        const ret = await this.metaAction.modal("show", {
            title: type.title || "弹窗",
            className: "inv-app-new-invoices-card-modal",
            width: width,
            height: height,
            style: { top: 5 },
            footer:null,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: this.metaAction.loadApp(type.type, {
                store: this.component.props.store,
                metaAction:this.metaAction,
                data: {
                    ...this.getAppParams()
                },
                height,
                width,
                fplx : 'jxfp',
                fpzlDm:type.fpzl,
                fpName:type.name,
                nsqj: '20200619',
                //kjxh:260870997137408,
                readOnly:false
            })
        });
    };
    
    getAppParams() {
        let { appParams } = this.component.props;
        if (appParams && Object.keys(appParams).length) return appParams;
        if (sessionStorage["appParams"]) {
            appParams = JSON.parse(sessionStorage["appParams"]).appParams;
            if (appParams && Object.keys(appParams).length) return appParams;
        }
        return {};
    }
    
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

