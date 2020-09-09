import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'

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
        const reHandMatchList = await this.webapi.financeinit.reHandMatchInit({ "id": id })
        LoadingMask.hide()
        if (reHandMatchList) {            
            this.injections.reduce('load', reHandMatchList)
        }
        this.injections.reduce('tableLoading', false)
    }
    /**
     * 选择当前行数据
     */
    selectRow = (value,index) => {        
        let newList = this.metaAction.gf('data.list'),
            sourceList = this.metaAction.gf('data.sourceList'),
            curItem = newList.get(index).toJS(),
            sfsData = {}
        //反选择旧选项
        for (let _rowIndex = 0; _rowIndex < newList.size; _rowIndex++) {
            let rowData = newList.get(_rowIndex).toJS()
            if (rowData.selected) {
                newList = newList.update(_rowIndex, item => item.set('selected', false))
            }
        }
        //选中新选项
        newList = newList.update(index, item => item.set('selected', value))
        sfsData['data.list'] = newList
        //处理查询结果集，更新查询结果列表
        for (let _rowIndex = 0; _rowIndex < sourceList.size; _rowIndex++) {
            let oldData = sourceList.get(_rowIndex).toJS()
            if (oldData.selected) {
                sourceList = sourceList.update(_rowIndex, item => item.set('selected', false))
            }
            if (oldData.id == curItem.id) {
                sourceList = sourceList.update(_rowIndex, item => item.set('selected', true))
            }
        }
        sfsData['data.sourceList'] = sourceList
        this.metaAction.sfs(sfsData)
    }
    /**
     * 获取表格行得数量
     */
    getRowsCount = () => {
        return this.metaAction.gf('data.list') && this.metaAction.gf('data.list').size
    }

    /**
     * 高级查询
     */
    onSearch = (inputValue) => {
        let sourceList = this.metaAction.gf('data.sourceList'),
            accountingList = sourceList,
            sfsData = {}
        if (inputValue) {
            let filterItem = accountingList.filter(o => (o.get('code').indexOf(inputValue) == 0) || (o.get('name').indexOf(inputValue) != -1))
            if (!filterItem) {
                sfsData['data.list'] = accountingList
            } else {
                sfsData['data.list'] = filterItem
            }

        } else {
            sfsData['data.list'] = accountingList
        }
        this.metaAction.sfs(sfsData)
    }

    /**
     * 确定按钮
     */
    onOk = async () => {
        return await this.save()
    }
    /**
     * 保存
     */
    save = async () => {
        let sourceList = this.metaAction.gf('data.sourceList'),
            selectData = this.getSlectItem(sourceList)
        if (!selectData) {
            this.metaAction.toast('warning', '请选中后再保存！')
            return false
        }
        const id = this.component.props && this.component.props.id
        LoadingMask.show()
        const reHandMatch = await this.webapi.financeinit.reHandMatch({ "id": id, isIgnoreNoEnoughCode: false, "accountId": selectData && selectData.id })
        LoadingMask.hide()
        if (reHandMatch) {
            
            return {reHandMatch, accountId:selectData && selectData.id,id:id}
        }
        return false
    }
    /**
     * 校验列表是否存在选中项
     */
    getSlectItem = (list) => {
        let item
        //处理查询结果集，更新查询结果列表
        for (let _rowIndex = 0; _rowIndex < list.size; _rowIndex++) {
            let oldData = list.get(_rowIndex).toJS()
            if (oldData.selected) {
                item = oldData
                break;
            }
        }
        return item
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
