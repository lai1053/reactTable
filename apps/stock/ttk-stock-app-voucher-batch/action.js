import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import { Map, fromJS } from 'immutable'
import extend from './extend'
import { LoadingMask, FormDecorator, Menu, Checkbox, DataGrid, Icon } from 'edf-component'
import { moment as momentUtil } from 'edf-utils'
import { formatNumbe } from './../common'
const colKeys = ['code', 'name', 'number', 'work', 'size','monery','pices']

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi=this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        this.ids= this.component.props.ids;
        injections.reduce('init')
        
        this.load()
    }

    load = async () => {
        // LoadingMask.show()
        this.metaAction.sf('data.loading',true)
        // const response = await this.webapi.operation.queryone({'serviceTypeCode':'ZGRK','id':id})
        // this.injections.reduce('load', response.billBodys,response,false)
        const data = await this.webapi.operation.findSupplierList({})
        this.selectList = data
        this.renderSelectOption(data)
        // const propertyDetailFilter=await this.webapi.operation.findInventoryEnumList()
        // this.injections.reduce('load', response,propertyDetailFilter)
        // LoadingMask.hide()
        this.metaAction.sf('data.loading', false)
    }
    onOk = async () => {
        return await this.save()
    }
    save = async () => {
        var value = this.metaAction.gf('data.value')
        return value
    }

    resetForm = () => {
        const form ={
            enableDate:'',
			constom:''
        }
        this.metaAction.sf('data.form', form)
    }
    filterList = () => {
        this.metaAction.sf('data.showPopoverCard', false)
        this.reload()
    }
    handlePopoverVisibleChange = (visible) => {
        
        if (visible) {
            const { form } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
            this.metaAction.sf('data.form', fromJS(form))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }
    renderSelectOption = (data) => {
        const arr = data.map(item => {
            return (
                <Option key={item.supplierId} value={item.supplierCode}>
                {item.supplierName}
                    {/* {item.code&nbsp&nbsp&nbspitem.name&nbsp&nbsp&nbspitem.guige&nbsp&nbsp&nbspitem.unit} */}
                </Option>
            )
           
        })
        this.selectOption = arr
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }
    //过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    getSelectOption = () => {
        return this.selectOption
    }
    batch = async (path, data) => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        if (selectedArrInfo.length == 0||!selectedArrInfo) {
            return this.metaAction.toast('error', '请选择数据')
        }
        const  ret = await this.metaAction.modal('show', {
            title: '批设存货科目',
            children: this.metaAction.loadApp('ttk-stock-app-voucher', {
                store: this.component.props.store,
                ids:arr
            })
        })
        if (ret) {
            this.reload()
        }   
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}