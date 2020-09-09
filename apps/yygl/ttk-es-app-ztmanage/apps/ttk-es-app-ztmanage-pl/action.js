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
        // this.beforeLoad = option.voucherAction.excelbeforeUpload

    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init', component.props.params);
        this.injections.reduce('update',{path:'data.plType',value:component.props.params.distype});

    }

    //选择账套类型后确定
    handelOK = async (type) =>{
        // debugger
        console.log(type,'type')

        if(type == 1){
            let isShow = this.metaAction.gf('data.isShow');
            this.injections.reduce('update',{path:'data.isShow',value:!isShow});
        }else {
            LoadingMask.show()
            console.log('我是旧版')
            let list = this.metaAction.gf('data.list').toJS();
            let list1 = [];
            let ztljzt = '';
            list.forEach(item =>{
                if(item.num > 0){
                    ztljzt = '1'
                }else {
                    ztljzt = '0'
                }
                list1.push({
                    id:item.id,
                    orgId:item.orgId,
                    src_id:item.srcid,
                    ztljzt:ztljzt,
                    khname:item.name
                })
            })
            let params = {
                bs:'0',
                list:list1
            }
            let res = await this.webapi.ztManagePL.oldZT(params);
            if(res){
                let result = await this.webapi.ztManagePL.getPldzAsyncStatus({sequenceNo:res},5000)
                if(result){
                    LoadingMask.hide();
                    console.info(res)
                    if(result.success != 0){
                        this.component.props.closeModal()
                        if(result.repetitionCount > 0){
                            let hh = await this.metaAction.modal('success', {
                                // title: '提示',
                                content:(
                                    <div>
                                        <p>选择了{list1.length}户，其中，重复提交{result.repetitionCount}户，已被拒绝。</p>
                                    </div>
                                ),
                                okText: '确定',
                            });
                            if(hh){
                                console.log('hhhh')
                                const ret = this.metaAction.modal('show', {
                                    title: '',
                                    width:300,
                                    className:'ttk-es-app-ztmanage-pl-data-modal',
                                    footer:null,
                                    children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-data', {
                                        store: this.component.props.store,
                                        batchId:result.seqno,
                                        fuc:this.component.props.fuc,
                                        fuc1:this.component.props.fuc1,
                                    })
                                })
                            }
                        }else{
                            const ret = this.metaAction.modal('show', {
                                title: '',
                                width:300,
                                className:'ttk-es-app-ztmanage-pl-data-modal',
                                footer:null,
                                children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-data', {
                                    store: this.component.props.store,
                                    batchId:result.seqno,
                                    fuc:this.component.props.fuc,
                                    fuc1:this.component.props.fuc1,
                                })
                            })
                        }
                    }else{
                        this.component.props.closeModal()
                        await this.metaAction.modal('success', {
                            // title: '提示',
                            content:(
                                <div>
                                    <p style={{marginBottom:'8px'}}>批量导账完成，其中：</p>
                                    <p>成功0户，失败{result.sbcount}户</p>
                                </div>
                            ),
                            okText: '确定',
                        });

                    }
                }else {
                    LoadingMask.hide();
                }
            }else {
                LoadingMask.hide();
            }
        }

    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {token: token}
    }

    uploadChange = (info) => {
        // debugger
        if (!info.file.status) {
            this.metaAction.toast('error', '仅支持上传RAR、ZIP格式的文件')
            return
        }
        LoadingMask.show()
        if (info.file.status === 'done') {
            LoadingMask.hide()
            if (info.file.response.error && info.file.response.error.message) {
                this.metaAction.toast('error', info.file.response.error.message)
            } else if (info.file.response.result && info.file.response.value) {
                this.injections.reduce('upload', info.file.response.value)
                let files = this.metaAction.gf('data.filesArr').toJS()
                    files.push(info.file.response.value)
                    this.injections.reduce('update',{path:'data.filesArr',value:files});
            }
        } else if (info.file.status === 'error') {
            LoadingMask.hide()
            this.metaAction.toast('error', '上传失败')
        }
    }

    //转换工具下载
    downZhgj = () => {
        var iframe = document.createElement('iframe')
        iframe.id = 'downloadForeseeClient'
        iframe.frameborder = "0"
        iframe.style.width = "0px"
        iframe.style.height = "0px"
        iframe.src = "https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/财务数据智能合规转换工具.exe"
        document.body.appendChild(iframe)
    }

    //取消按钮
    handelCancel = async () =>{
        this.component.props.closeModal()
    }

    //导入成功后
    handelImport = async () =>{
        LoadingMask.show()
        let file = this.metaAction.gf('data.filesArr').toJS()
        const originalName = 'originalName';
        const r = file.reduce((all, next) => all.some((atom) => atom[originalName] == next[originalName]) ? all : [...all, next],[]);
        console.log(r,'file')
        console.log('我是新版')
        let list = this.metaAction.gf('data.list').toJS();
        let list1 = [];
        let ztljzt = '';
        list.forEach(item =>{
            if(item.num > 0){
                ztljzt = '1'
            }else {
                ztljzt = '0'
            }
            list1.push({
                id:item.id,
                orgId:item.orgId,
                src_id:item.srcid,
                ztljzt:ztljzt,
                khname:item.name
            })
        })
        let params = {
            bs:'1',
            list:list1,
            files:r
        }
        let res = await this.webapi.ztManagePL.oldZT(params);
        if(res){
            let result = await this.webapi.ztManagePL.getPldzAsyncStatus({sequenceNo:res},5000)
            if(result){
                LoadingMask.hide();
                console.info(res)
                if(result.success != 0){
                    this.component.props.closeModal()
                    if(result.repetitionCount > 0){
                        let hh = await this.metaAction.modal('success', {
                            // title: '提示',
                            content:(
                                <div>
                                    <p>选择了{list1.length}户，其中，重复提交{result.repetitionCount}户，已被拒绝。</p>
                                </div>
                            ),
                            okText: '确定',
                        });
                    if(hh){
                        console.log('hhhh')
                        const ret = this.metaAction.modal('show', {
                            title: '',
                            width:300,
                            className:'ttk-es-app-ztmanage-pl-data-modal',
                            footer:null,
                            children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-data', {
                                store: this.component.props.store,
                                batchId:result.seqno,
                                fuc:this.component.props.fuc,
                                fuc1:this.component.props.fuc1,
                            })
                        })
                    }
                    }else{
                        const ret = this.metaAction.modal('show', {
                            title: '',
                            width:300,
                            className:'ttk-es-app-ztmanage-pl-data-modal',
                            footer:null,
                            children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-data', {
                                store: this.component.props.store,
                                batchId:result.seqno,
                                fuc:this.component.props.fuc,
                                fuc1:this.component.props.fuc1,
                            })
                        })
                    }
                }else{
                    this.component.props.closeModal()
                    await this.metaAction.modal('success', {
                        // title: '提示',
                        content:(
                            <div>
                                <p style={{marginBottom:'8px'}}>批量导账完成，其中：</p>
                                <p>成功0户，失败{result.sbcount}户</p>
                            </div>
                        ),
                        okText: '确定',
                    });

                }
            }else {
                LoadingMask.hide();
            }

        }else {
            LoadingMask.hide();
        }
        // this.component.props.closeModal(true)
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
