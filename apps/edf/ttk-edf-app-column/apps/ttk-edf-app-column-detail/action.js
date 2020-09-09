import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        if(this.component.props.actionType == 'add') {
            this.metaAction.sf('data.other.type', 'add')
        }else if(this.component.props.actionType == 'modify') {
            this.metaAction.sf('data.other.type', 'modify')
            this.injections.reduce('load', this.component.props.data)
        }
        this.getEnum()
    }

    getEnum = async () => {
        //批量获取枚举数据
        let mainData = []
        let enumList = {
            FIELDTYPE: '100004',
            ALIGNTYPE: '100005',
            ORDERMODE: '100006'
        }
        for(let i in enumList) {
            mainData.push(enumList[i])
        }
        //初始化枚举
        const enumDetail = await this.webapi.enum.enumDetail({enumIdList: mainData})
        let obj = {}
        for(let i in enumList) {
            if(i == 'FIELDTYPE') {
                this.metaAction.sf('data.other.fieldTypes', fromJS(enumDetail[enumList[i]]))
            }else if(i == 'ALIGNTYPE') {
                this.metaAction.sf('data.other.alignTypes', fromJS(enumDetail[enumList[i]]))
            }else if(i == 'ORDERMODE'){
                this.metaAction.sf('data.other.orderModes', fromJS(enumDetail[enumList[i]]))
            }
        }
    }

    onOk = async () => {
        return await this.save()
    }

    save = async () => {
        let type = this.metaAction.gf('data.other.type')
        const form = this.metaAction.gf('data.form').toJS()
        const ok = await this.check([{
            path: 'data.form.caption', value: form.caption
        }, 
        {
            path: 'data.form.fieldName', value: form.fieldName
        }])

        if (!ok) return false

        form.isFixed = form.isFixed == true ? 1 : 0
        form.isVisible = form.isVisible == true ? 1 : 0
        form.isMustSelect = form.isMustSelect == true ? 1 : 0
        form.isSystem = form.isSystem == true ? 1 : 0
        form.isHeader= form.isHeader == true ? 1 : 0
        form.isTotalColumn= form.isTotalColumn == true ? 1 : 0
        form.columnId = this.component.props.nodeId
        if(type == 'add'){
            const response = await this.webapi.columnDetail.create(form)
            this.metaAction.toast('success', '新增成功')
            return response
        } else if(type == 'modify'){
            const response = await this.webapi.columnDetail.update(form)
            this.metaAction.toast('success', '修改成功')
            return response
        }
    }



    fieldChange = async (fieldPath, value) => {
        await this.check([{ path: fieldPath, value }])
    }

    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.caption') {
                Object.assign(r, await this.checkName(o.value))
            }
            else if (o.path == 'data.form.fieldName') {
                Object.assign(r, await this.checkCode(o.value))
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

    checkCode = async (code) => {
        var message

        if (!code)
            message = '请录入编码'

        return { errorPath: 'data.other.error.fieldName', message }
    }

    checkName = async (name) => {
        var message

        if (!name)
            message = '请录入名称'

        return { errorPath: 'data.other.error.caption', message }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}