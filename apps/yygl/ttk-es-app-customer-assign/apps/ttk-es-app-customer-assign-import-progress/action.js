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
        this.injections.reduce('updateSingle', 'data.downloads',fromJS(this.component.props.list))

        let that = this
        let newList  = this.component.props.res.message.filter(item=>item.fail==='1').map(item=>{
            return {
                rownum:item.rownum,
                gsmc:item.gsmc,
                errmsgs:item.errmsg,
                errmsg:item.errmsg.join(' ')
            }
        })
        if(this.component.props.res.isover!=='1'){
            this.injections.reduce('updateObj', {
                'data.downloads':fromJS(newList),
                'data.successCount':this.component.props.res.success,
                'data.failedCount':this.component.props.res.fail,
                'data.importTitle':'导入中…',
                'data.importEnd':false
            })
            this.timer = setInterval(function() {
                that.load()
            }, 5000)
        }else{
            if(this.component.props.res.fail=='0'){
                this.injections.reduce('updateObj', {
                    'data.downloads':fromJS(newList),
                    'data.successCount':this.component.props.res.success,
                    'data.failedCount':this.component.props.res.fail,
                    'data.downloadUrl':'',
                    'data.importTitle':'导入结束',
                    'data.importEnd':true
                })
            }else{
                let errorFile = eval("("+this.component.props.res.errorfile+")")
                this.injections.reduce('updateObj', {
                    'data.downloads':fromJS(newList),
                    'data.successCount':this.component.props.res.success,
                    'data.failedCount':this.component.props.res.fail,
                    'data.downloadUrl':errorFile.accessUrl,
                    'data.importTitle':'导入结束',
                    'data.importEnd':true
                })
            }
        }
    }

    load = async ()=>{
        let res =await this.webapi.getImportAsyncStatusNew({seqNo:this.component.props.seqNo})
        // let res = {
        //     "list":[
        //         {
        //             "success":'0',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
        //         },
        //         {
        //             "success":'1',
        //             "customer":"XXXXX公司",
        //             "message":"下载失败"
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
        console.info(res)
        if(res){
            let newList  = res.message.filter(item=>item.fail==='1').map(item=>{
                return {
                    rownum:item.rownum,
                    gsmc:item.gsmc,
                    errmsgs:item.errmsg,
                    errmsg:item.errmsg.join(' ')
                }
            })
            if(res.isover=='1'){
                if(this.timer){
                    clearInterval(this.timer)
                }
                if(res.exmsg){
                    this.metaAction.toast('warning', res.exmsg)
                }
                if(res.fail=='0'){
                    this.injections.reduce('updateObj', {
                        'data.downloads':fromJS(newList),
                        'data.successCount':res.success,
                        'data.failedCount':res.fail,
                        'data.downloadUrl':'',
                        'data.importTitle':'导入结束',
                        'data.importEnd':true
                    })
                }else{
                    let errorFile = eval("("+res.errorfile+")")
                    this.injections.reduce('updateObj', {
                        'data.downloads':fromJS(newList),
                        'data.successCount':res.success,
                        'data.failedCount':res.fail,
                        'data.downloadUrl':errorFile.accessUrl,
                        'data.importTitle':'导入结束',
                        'data.importEnd':true
                    })
                }
            }else{
                this.injections.reduce('updateObj', {
                    'data.downloads':fromJS(newList),
                    'data.successCount':res.success,
                    'data.failedCount':res.fail,
                    'data.importEnd':false
                })
            }

        }
    }

    stopProgress = async () => {
        const ret = await this.metaAction.modal('confirm', {
            // title: '终止下载',
            content: '正在导入客户数据，确定要中止导入吗？',
            okText:'返回',
            cancelText:'中止',
            className:'ttk-es-app-customer-assign-import-progress-stop-confirm'
        })

        if(ret){
            console.info('返回')
            return false
        }else{
            console.info('中止')
            let res = await this.webapi.stopImport({sessionNo:this.component.props.sessionNo})

            this.closeProgress()
        }
    }
    closeProgress = () => {
        if(this.timer){
            clearInterval(this.timer)
        }
        this.component.props.closeModal()
    }

    onCancel = async() => {
        // let importEnd = this.metaAction.gf('data.importEnd')
        // if(importEnd){
        //     if(this.timer){
        //         clearInterval(this.timer)
        //     }
        //     console.info('cancel')
        // }else{
        //     const ret = await this.metaAction.modal('confirm', {
        //         // title: '终止下载',
        //         content: '正在导入客户数据，确定要中止导入吗？',
        //         okText:'返回',
        //         cancelText:'中止',
        //         className:'ttk-es-app-customer-assign-import-progress-stop-confirm'
        //     })
        //
        //     if(ret){
        //         console.info('返回')
        //         return false
        //     }else{
        //         console.info('中止')
        //         let res = await this.webapi.stopImport({sessionNo:this.component.props.sessionNo})
        //         return true
        //     }
        // }
        this.component.props.closeModal()

    }

    downloadErrorList = () => {
        let url = this.metaAction.gf('data.downloadUrl')
        let iframeObject = document.getElementById('downloadExe');
        if (iframeObject) {
            iframeObject.src = url;
        }
        else {
            var iframe = document.createElement('iframe');
            iframe.id = 'downloadExe';
            iframe.frameborder = "0";
            iframe.style.width = "0px"
            iframe.style.height = "0px"
            iframe.src = url;
            document.body.appendChild(iframe);
        }
    }

    renderErrorList = (list) => {
        return(
            <div>
                {
                    list.map((item,index)=>{
                        return <div key={index}>{item}</div>
                    })
                }
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