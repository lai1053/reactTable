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

    load = async () => {
        let { inventoryAccount: account } = this.component.props;
        this.metaAction.sf('data.other.account', fromJS(account));
    }

    check = async (checkArr) => {
        let sfsObj = {}, isError = false
        checkArr.forEach(option => {
            if (!option || !option.path) return true
            if (option.path == 'data.form.inventoryAccount') {
                if (!option.value) {
                    sfsObj['data.other.error.inventoryAccount'] = '请选择存货科目'
                    isError = true
                }
            }
        });
        if (isError) this.metaAction.sfs(sfsObj)
        return isError
    }

    //保存
    onOk = async (type) => {
        return await this.save(type)
    }
    onCancel = async () => {

    }
    batchAddInventoryAccount = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增存货科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let inventoryAccount = this.metaAction.gf('data.other.account').toJS();
            inventoryAccount.push(ret);
            this.metaAction.sfs({
                'data.form.inventoryAccount': ret.id,
                'data.other.account': fromJS(inventoryAccount)
            })
        }
    }
    save = async (type) => {
        // let { inventoryAccount } = this.component.props;
        let form = this.metaAction.gf('data.form').toJS();

        let checkArr = [
            {
                path: 'data.form.inventoryAccount', value: form.inventoryAccount,
            }
        ]

        const ok = await this.check(checkArr)
        if (ok) {
            this.metaAction.toast('warning', '请按页面提示修改信息后才可提交')
            return false
        }
        let inventoryAccount = this.metaAction.gf('data.other.account')
        inventoryAccount = inventoryAccount.size ? inventoryAccount.toJS() : inventoryAccount
        let obj = inventoryAccount.find(o => o.id === form.inventoryAccount)
        return obj;
    }

    handleInventoryAccount = (v) => {
        if (!isNaN(Number(v))) {
            v = Number(v)
        }
        this.metaAction.sfs({
            'data.form.inventoryAccount': v,
            'data.other.error.inventoryAccount': false
        })
    }
    //检索
    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\");
        if (!option || !option.props || !option.props.value) return false;
        const parentRevenueAccounts = this.metaAction.gf('data.other.account');
        let regExp = new RegExp(inputValue, 'i');
        let paramsValue = parentRevenueAccounts.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }

        if (paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('fullname') && paramsValue.get('fullname').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('codeAndName') && paramsValue.get('codeAndName').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1) {
            return true
        }

        return false;

    }

    renderAccountSelectOption = (docName) => {

        let data = this.metaAction.gf(`data.other.${docName}`) 
        data = data.size ? data.toJS() : data
        if (data) {
            return data.map((d, index) => <Option title={d.codeAndName} key={index} value={d.id} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.codeAndName}</Option>)
        }
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