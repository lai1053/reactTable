import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { TableOperate, Table, Select, Button, Modal, Input, Number, Checkbox, Icon, Popconfirm, FormDecorator, LoadingMask } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.customAttribute = Math.random()
        injections.reduce('init', component.props)
        let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', :: this.onTabFocus)
        // }
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.load(this.component.props && this.component.props.id)
    }
    /**
     * 页签切换
     */
    onTabFocus = (data) => {
        return null;
    }
    /**
     * 初始化load
     */
    load = async (id) => {
        this.injections.reduce('tableLoading', true)
        LoadingMask.show()
        const response = await this.webapi.financeinit.queryExcelAux({ "id": id })
        LoadingMask.hide()
        if (response) {
            this.injections.reduce('tableLoading', false)
            this.injections.reduce('load', response)
        }      
    }
    /**
     * 获取表格行得数量
     */
    getRowsCount = () => {
        return this.metaAction.gf('data.list') && this.metaAction.gf('data.list').size
    }
    /**
     * 确定按钮
     */
    onOk = async () => {
        return true
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
