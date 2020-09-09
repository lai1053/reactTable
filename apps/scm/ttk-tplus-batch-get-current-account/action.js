import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
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

        const periodDate = this.metaAction.context.get("currentOrg").periodDate
        const newPeriodDate = periodDate.slice(0, 4)
        const newOptions = { 'year': newPeriodDate }
        const { baseUrl, type, docName } = this.component.props;

        const res = await this.webapi.tplus.common(`${baseUrl}/common/account/queryNotEndNode`, newOptions, this.getOrgId());

        let account = [], sfsObj = {}

        if (res && res.value) {
            account = res.value
            account.forEach(
                o => o.name = o.code + " " + o.name
            )
            sfsObj['data.other.account'] = fromJS(account)
        }
        if (docName) {
            sfsObj['data.other.docName'] = docName
        }
        sfsObj['data.other.type'] = type

        // let selectObj = {}
        // if (type == 'inventoryAccount') {

        //     selectObj = account.find((o) => o.code == '1405')
        //     if (selectObj) sfsObj['data.form.accountCode'] = '1405'

        //     // sfsObj['data.form.accountName'] = '1405 库存商品'
        //     // sfsObj['data.other.selectObj'] = fromJS({name:'1405 库存商品'})
        // } else if (type == 'incomeAccount') {

        //     selectObj = account.find(o => o.code == '5001')
        //     if (selectObj) sfsObj['data.form.accountCode'] = '5001'

        //     // sfsObj['data.form.accountName'] = '5001 主营业务收入'
        //     // sfsObj['data.other.selectObj'] = fromJS({name:'5001 主营业务收入'})
        // }else {

        //     selectObj = account.find(o => o.code == '5001')
        //     if (selectObj) sfsObj['data.form.accountCode'] = '1122'

        //     // sfsObj['data.form.accountName'] = '1122 应收账款'
        //     // sfsObj['data.other.selectObj'] = fromJS({name:'1122 应收账款'})
        // }
        // if(selectObj) {
        //     sfsObj['data.form.accountName'] = selectObj.name
        //     sfsObj['data.other.selectObj'] = fromJS(selectObj)
        // }
        this.metaAction.sfs(sfsObj)
    }

    handleChange = (value, index) => {
        const account = this.metaAction.gf('data.other.account').toJS()

        let obj = account.find(o => o.code == value)

        this.metaAction.sfs({
            'data.form.accountCode': value,
            'data.other.selectObj': fromJS(obj)
        })
    }

    // 销项发票 生成收入科目 修改科目名称
    handleAccountChange = (e) => {
        this.metaAction.sf('data.other.accountName', e.target.value)
    }

    filterOptionName = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    // 进项发票 生成存货科目 数量启用
    handleCheckChange = (e) => {
        const checked = e.target.checked
        this.metaAction.sf('data.form.isCalcQuantity', checked)
    }


    //保存
    onOk = async (type) => {
        return await this.save(type)
    }
    onCancel = async () => {

    }

    save = async (type) => {

        const ok = this.metaAction.gf('data.form.accountCode'),
            isCalcQuantity = this.metaAction.gf('data.form.isCalcQuantity'),
            selectObj = this.metaAction.gf('data.other.selectObj').toJS(),
            accountName = this.metaAction.gf('data.other.accountName')

        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示修改信息后才可提交')
            return false
        }

        return { code: ok, isCalcQuantity, name: selectObj.name, accountName }
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