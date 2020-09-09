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
            this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        let finalNum = this.component.props.list.filter(item=>item.success!=='3').length
        let allNum = this.component.props.list.length
        let progressValue = finalNum*100 / allNum
        // console.info(progressValue)
        this.injections.reduce('updateObj', {
            'data.downloads':fromJS(this.component.props.list),
            'data.finalNum':finalNum,
            'data.allNum':allNum,
            'data.progressValue':Math.floor(progressValue)
        })

        let that = this
        if(this.component.props.list.some(item=>item.success==='3')){
            this.timer = setInterval(function() {
                that.load()
            }, 10000)
        }
    }

    load = async ()=>{
        let res =await this.webapi.download.getNsrxxAsyncStatusHasReturn()
        // let res = {
        //     "list":[
        //         {
        //             "success":'0',
        //             "customer":"XXXXX公司",
        //             "message":"下载成功"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         }
        //     ],
        //     "all":10,
        //     "success":5
        // }
        // console.info(res)
        if(res){
            if(res.list.every(item=>item.success!=='3')){
                if(this.timer){
                    clearInterval(this.timer)
                }
            }
            let finalNum = res.list.filter(item=>item.success!=='3').length
            let allNum = res.list.length
            let progressValue = finalNum*100 / allNum
            // console.info(progressValue)
            this.injections.reduce('updateObj', {
                'data.finalNum':finalNum,
                'data.allNum':allNum,
                'data.progressValue':Math.floor(progressValue),
                'data.downloads':fromJS(res.list)
            })
        }
    }

    massageClass = (item) => {
        switch (item){
            case '2':return 'ttk-es-app-customer-download-progress-list-item-massage-error';break;
            case '1':return 'ttk-es-app-customer-download-progress-list-item-massage-success';break;
            case '3':return 'ttk-es-app-customer-download-progress-list-item-massage-pending';break;
            default:return 'ttk-es-app-customer-download-progress-list-item-massage-pending'
        }
    }

    stopProgress = async () => {
        const ret = await this.metaAction.modal('confirm', {
            title: '终止下载',
            content: '确认要终止吗?'
        })

        if(ret){
            // let response = await this.webapi.delete[tabKey](list)
            //
            // if (response) {
            //     this.metaAction.toast('success', '删除成功')
            //     this.refresh()
            //     return response
            // }
            this.component.props.closeModal()
        }
    }
    closeProgress = () => {
        if(this.timer){
            clearInterval(this.timer)
        }
        this.component.props.closeModal()
    }

    onCancel = () => {
        if(this.timer){
            clearInterval(this.timer)
        }
        this.component.props.closeModal()
        console.info('cancel')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}