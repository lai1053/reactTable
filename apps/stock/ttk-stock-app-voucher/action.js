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
        this.metaAction.sf('data.loading', true)
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
        
        let reqList={
            serviceTypeCode:'ZGHC',
            code:'',
            cdate:'',
            supplierId:'1',
            supplierName:'温州东旭阀门铸造有限公司',
            operater:'liucp',
            billBodys:''
        }
        var form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
        
        const ok = await this.check([
        {
            path: 'data.form.cdate', value: form.cdate
        }])
        if (!ok) {
            // LoadingMask.hide()
            this.metaAction.sf('data.loading', false)
            return false
           
        }
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        reqList.billBodys=JSON.stringify(list);
        reqList.code=form.code;
        reqList.cdate=form.cdate;
        reqList.supplierName=form.supplierName;
        reqList.operater=form.operater;
        reqList.supplierId=form.supplierId;
        let res=''
        if(form.ids){
            reqList.ids=JSON.stringify(form.ids);
            const currentOrg = sessionStorage['stockPeriod']
            reqList.period=currentOrg;
            res = await this.webapi.operation.createBillTitleZGHCByFirst(reqList)
        }else{
             res = await this.webapi.operation.createBillTitle(reqList)
        }
        if(res){
            this.metaAction.toast('success', '保存成功')
            return res
        }else{
            this.metaAction.toast('error', '保存失败')
            return res;
        }

    }

    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return
        
        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.cdate') {
                Object.assign(r, await this.checkCdate(o.value))
            }
            else if (o.path == 'data.form.supplierName') {
                Object.assign(r, await this.checkSupplierName(o.value))
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

    checkCdate = async (code) => {
        var message

        if (!code)
            message = '请选择入库日期'

        return { errorPath: 'data.other.error.cdate', message }
    }
    selectRow = (rowIndex) => (e) => {
        
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
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
    selectOption =async (path,data) => {
        this.metaAction.sf(path, data)
    }
    batch= async (path,data) => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid') //选中
        if (selectedArrInfo.length == 0||!selectedArrInfo) {
            return this.metaAction.toast('error', '请选择数据')
        }
        const  ret = await this.metaAction.modal('show', {
            title: '批设存货科目',
            children: this.metaAction.loadApp('ttk-stock-app-voucher-batch', {
                store: this.component.props.store,
            })
        })
        if (ret) {
            this.injections.reduce('updateSfs', ret,selectedArrInfo)
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