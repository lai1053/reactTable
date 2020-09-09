import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch as fetchUtil} from 'edf-utils'
import {LoadingMask,Checkbox} from 'edf-component'

import {FormDecorator} from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections
        injections.reduce('init', component.props.list);
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.load();
    }

    load = async () =>{
        console.log(this.metaAction.gf('data.list').toJS(),'list');
        const enumList = await this.webapi.edit.batchQuery(['200030']);
        console.log(enumList,'enumList')
        if(enumList){
            this.injections.reduce('update',{path:'data.industrys',value:enumList['200030']});
        }

    }

    save = async () =>{
        // debugger
        if(this.handleCreate) return
        this.handleCreate = true
        let form = this.metaAction.gf('data.form').toJS(),
            isZtzg = this.metaAction.gf('data.isZtzg');
        // const ok = await this.check([
        //   {
        //     path: 'data.form.industrys', value: form.industrys
        // },{
        //     path: 'data.form.financeCreator', value: form.financeCreator
        // }, {
        //     path: 'data.form.financeAuditor', value: form.financeAuditor
        // }])
        // if (!ok) {
        //     this.handleCreate = false
        //     return false
        // }
        // let ztxx = this.metaAction.gf('data.list').toJS();
        let params = {
            financeCreator: form.financeCreator,
            financeAuditor: form.financeAuditor,
            ztzg: form.accountSupervisor,
            isZtzg:isZtzg,
            industry: form.industrys,
        }
        params.list = this.component.props.list
        LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
        const ret = await this.webapi.edit.editXX(params);
        LoadingMask.hide()
        this.handleCreate = false
        if(ret) {
            this.metaAction.toast('success', '批量修改成功！')
        }

    }
    fieldChange = async (fieldPath, value, operate) => {
        await this.check([{path: fieldPath, value}], operate)
    }
    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return
        let checkResults = []
        for (let o of fieldPathAndValues) {
            let r = {...o}

            if (o.path == 'data.form.industrys') {
                Object.assign(r, await this.checkIndustrys(o.value))
            }else if (o.path == 'data.form.financeCreator') {
                Object.assign(r, await this.checkFinanceCreator(o.value))
            } else if (o.path == 'data.form.financeAuditor') {
                Object.assign(r, await this.checkFinanceAuditor(o.value))
            }
            checkResults.push(r)
        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })
        this.metaAction.sfs(json)
        return hasError
    }

    checkIndustrys = async (industrys) => {
        var message
        if (!industrys) {
            message = '所属行业不能为空'
        }
        return {errorPath: 'data.other.error.industrys', message}
    }
    checkFinanceCreator = async (financeCreator) => {
        var message
        if (!financeCreator) {
            message = '制单人不能为空'
        }
        return { errorPath: 'data.other.error.financeCreator', message }
    }

    checkFinanceAuditor = async (financeAuditor) => {
        var message
        if (!financeAuditor) {
            message = '审核人不能为空'
        }
        return { errorPath: 'data.other.error.financeAuditor', message }
    }

    onOk = async () => {
        return await this.save()
    }
    getCheckLabel = () => {
        const isZtzg = this.metaAction.gf('data.isZtzg');
        return (
            <Checkbox 
                onChange={this.changeZTZG}
                checked={isZtzg?true:false}
            > 
            账套主管：
            </Checkbox>
        )
    }

    changeZTZG = (e) => {
        this.injections.reduce('update',{path:'data.isZtzg',value:e.target.checked});
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
