import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
import moment from 'moment'
import { Map, fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {

        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')
        this.load()
    }

    //获取orgID
    getOrgId = () => {
        const org = this.metaAction.context.get('currentOrg') || {}
        return {
            headers: {
                token: org.id || ''
            }
        }
    }

    load = async () => {
        let { baseUrl, softAppName } = this.component.props;
        let year = moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')

        const res = await this.webapi.tplus.common(`${baseUrl}/common/account/queryNotEndNode`,{year},this.getOrgId());

        if (res && res.error) {
            this.metaAction.toast('error', res.error.message)
        } else if (res && res.result) {
            let account = res.value.map(item => {
                item.name = item.code + ' ' + item.name
                return item
            })
            this.metaAction.sf('data.other.account', fromJS(account))
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
    }

    check = async (checkArr) => {
        let sfsObj = {}, isError = false
        checkArr.forEach(option => {
            if (!option || !option.path) return true
    
            if (option.path == 'data.form.topAccount') {
                if (!option.value) {
                    sfsObj['data.other.error.topAccount']='请选择上级科目'
                    isError = true
                }
            }
            if (option.path == 'data.form.accountName') {
                if (!option.value) {
                    sfsObj['data.other.error.accountName']= !option.value ? 
                    '请输入科目名称' : 
                    (option.value.length > 50 ? '科目名称不能超过50个字': '')
                    isError = true
                }
            }
            if (option.path == 'data.form.unitDto') {
                // return { errorPath: 'data.other.error.unitDto', message: !option.value ? '请输入计量单位' : (option.value.length > 50 ? '计量单位不能超过50个字' : '') }
                const isCalcQuantity = this.metaAction.gf('data.form.isCalcQuantity')
                if (!option.value && isCalcQuantity) {
                    sfsObj['data.other.error.unitDto']= !option.value ? 
                    '请输入计量单位' : 
                    (option.value.length > 50 ? '计量单位不能超过50个字': '')
                    isError = true
                }
            }
        });
        if(isError) this.metaAction.sfs(sfsObj)
        return isError
    }
 
    //保存
    onOk = async (type) => {
        return await this.save(type)
    }
    onCancel = async () => {

    }

    save = async (type) => {
        let { baseUrl, softAppName, inventory, isDangan } = this.component.props;
        let form = this.metaAction.gf('data.form').toJS();
        // console.log(form, 'form')
        let checkArr = [
            {
                path: 'data.form.topAccount', value: form.topAccount,
            },{
                path: 'data.form.accountName', value: form.accountName,
            },{
                path: 'data.form.unitDto',  value: form.unitDto.name
            }
        ]

        const ok = await this.check(checkArr)
        if (ok) {
            this.metaAction.toast('warning', '请按页面提示修改信息后才可提交')
            return false
        }
        let exportAccount = fromJS(inventory).toJS().filter(o=> new RegExp(`^${form.topAccount}`).test(o.code))
        // console.log(exportAccount, inventory, 'exportAccount inventoryList')
        let isHaveSame = exportAccount.find(o=> (isDangan ? o.names: o.name) == form.accountName)

        if (isHaveSame) {
            this.metaAction.toast('error', '存在相同名称的科目')
            return false
        }
        let parmasList = [
            {
                parentCode: form.topAccount,
                name: form.accountName,
                year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY'),
                aux:{
                    isCalcQuantity:form.isCalcQuantity,
                    unitDto:form.unitDto,
                    isCalcMulti:false
                }
            }
        ]
        const res = await this.webapi.tplus.common(`${baseUrl}/common/account/createBatch`, parmasList, this.getOrgId());
        if (res && res.error) {
            this.metaAction.toast('error', res.error.message)
        } else if (res && res.result) {

            if (res.value) {
                if (res.value.successItems && res.value.successItems.length) {
                    return res.value.successItems
                }

                if (!res.value.allSuccess && res.value.failItems) {
                    this.metaAction.toast('error', res.value.failItems[0].msg)
                }
            }
            
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
        return false
    }

    handleChangeInput = (value, type) => {
        let sfsObj = {}
        if(type == 'unitDto') {
            sfsObj['data.form.unitDto'] = {name: value}
            if (value) sfsObj['data.other.error.unitDto'] = false
        } else if (type == 'accountName') {
            sfsObj['data.form.accountName'] = value
            if (value) sfsObj['data.other.error.accountName'] = false
        }
        this.metaAction.sfs(sfsObj)
    }

    handleCheckChange = (e) => {
        const checked = e.target.checked
        this.metaAction.sf('data.form.isCalcQuantity', checked)
    }

    handleTopAccount = (v) => {
        this.metaAction.sfs({
            'data.form.topAccount': v,
            'data.other.error.topAccount': false
        })
    }

    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false
        let regExp = new RegExp(inputValue, 'i');

        const account = this.metaAction.gf('data.other.account')
        // console.log(account.toJS(), '*******')
        let paramsValue = account.find(item => item.get('code') == option.props.value)
        if (!paramsValue) {
            return false
        }

        return paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1 ||
        paramsValue.get('shorthand') && paramsValue.get('shorthand').search(regExp) != -1 ||
        paramsValue.get('code') && paramsValue.get('code').search(regExp) != -1

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