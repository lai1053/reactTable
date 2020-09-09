import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
import extend from './extend'
import { fromJS } from 'immutable'
import moment from 'moment'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
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
    isTplus = () => {
        if (this.component.props.baseUrl) {
            return true
        } else {
            return false
        }
    }
    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id
        }
        return ""
    }
    load = async () => {

        let { baseUrl, softAppName, incomeexpensesTabId , record} = this.component.props;
        let option = {
            incomeexpensesTabId,
            softAppName
        }, parentId = this.component.props.parentId
        //有record时为编辑状态
        if (this.component.props.record) {
            option.form = this.component.props.record
        }
        if (!baseUrl) {
            const initDate = await this.webapi.incomeexpensesCard.init({
                parentId: option.incomeexpensesTabId
            })
            if (initDate) {
                option.code = initDate.code
                option.subjectList = initDate.glAccounts
                if (initDate.categories) option.largeClass = initDate.categories
            }
        } else {
            //重新获取account
            const tplusconfig = this.metaAction.context.get('linkConfig');
            let account = await this.webapi.tplus.common(`${document.location.protocol}//${tplusconfig.foreseeClientHost}/common/account/query`, {
                year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
            }, {
                    headers: {
                        token: this.getOrgId()
                    }
                });
            if (account && account.result) {
                account = account.value
            } else if (account && account.error) {
                this.metaAction.toast('error', account.error.message)
                return
            } else {
                this.metaAction.toast('error', `连接${tplusconfig.appName}服务失败：请检查配置软件是否正常启动`)
                return
            }
            account.forEach((o) => {
                o.codeAndName = o.code + " " + o.name
            })
            option.subjectList = account

            if(!record){  // 新增
                const queryCode = await this.webapi.incomeexpensesCard.getQueryCode({ parentId: incomeexpensesTabId})
                if(queryCode) option.code = queryCode
            }
        }
        if(parentId) option.parentId = parentId
        this.injections.reduce('load', option)
    }

    //编辑大类按钮跳到收支大类列表界面
    editClick = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '收支大类',
            wrapClassName: 'incomeexpenses-type-list',
            width: 600,
            okText: '确定',
            bodyStyle: { padding: '12px' },
            children: this.metaAction.loadApp('scm-incomeexpenses-type-list', {
                store: this.component.props.store,
                record: this.component.props.record,
                incomeexpensesTabId: this.component.props.incomeexpensesTabId
            }),
        })
        if (ret) {
            this.load()
        }
    }

    getTypeName1 = () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (incomeexpensesTabId == '4000000') {
            return '资产属性'
        } else {
            return '业务名称'
        }
    }
    //获取类型名称
    getTypeName = () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (incomeexpensesTabId == '4001001') {
            return '费用类型'
        } else if (incomeexpensesTabId == '3001002') {
            return '收款类型'
        } else if (incomeexpensesTabId == '3001001') {
            return '付款类型'
        } else if (incomeexpensesTabId == '1000000') {
            return '结算方式'
        } else if (incomeexpensesTabId == '2000000') {
            return '存货类别'
        } else if (incomeexpensesTabId == '3000000') {
            return '计税方式'
        } else if (incomeexpensesTabId == '4000000') {
            return '资产分类'
        }
        return '收入类型'
    }
    taxMethod = () => {
        let bigScaleTaxPayer = false
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010001) bigScaleTaxPayer = true
        if (incomeexpensesTabId == '3000000' && !bigScaleTaxPayer) {
            return false
        } else {
            return true
        }
    }
    getCodeVisible = () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (incomeexpensesTabId == "2001003" || incomeexpensesTabId == "4001001" || incomeexpensesTabId == '3001002' || incomeexpensesTabId == '3001001') {
            return true
        } else {
            return false
        }
    }
    getAddOrEdit = () => {
        if (this.component.props.record && this.component.props.baseUrl) {
            return true
        } else {
            return false
        }
    }
    //是否显示取消按钮
    getCancleVisible = () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (incomeexpensesTabId == "2001003" || incomeexpensesTabId == "4001001") {
            return true
        }
        if (this.component.props.record) {
            return true
        }
        return false
    }

    //是否显示保存并新增按钮
    getSaveAndNewVisible = () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
        if (incomeexpensesTabId == "3001002" || incomeexpensesTabId == "3001001") { //!this.component.props.record
            if (this.component.props.record) return false
            return true
        }
        return false
    }

    filterOption = (inputValue, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
        }
        return true

    }

    //取消
    onCancel = () => {
        let isSaveAndNew = this.metaAction.gf('data.other.isSaveAndNew');
        const {baseUrl}=this.component.props;
        if (isSaveAndNew||baseUrl) {
            this.component.props.closeModal(true)
        } else {
            this.component.props.closeModal(false)
        }
    }

    //保存
    onOk = async (type) => {
        let save = await this.save(type)
        if (save) this.component.props.closeModal(save)
    }

    save = async (type) => {
        let form = this.metaAction.gf('data.form').toJS(), option = {}
        let intabId = this.component.props.incomeexpensesTabId,
            record = this.component.props.record, res, filter
        let checkArr = [{
            path: 'data.form.name', value: form.name
        }, {
            path: 'data.form.defaultProject', value: form.defaultProject
        }]
        if (intabId == '2001003' || intabId == '4001001') checkArr.push({
            path: 'data.form.code', value: form.code
        })
        if (intabId == '3001002' || intabId == '3001001') {
            checkArr.push({
                path: 'data.form.receivables', value: form.receivables
            })
        }
        if (intabId == '3000000') {
            checkArr = [{
                path: 'data.form.businessName', value: form.businessName
            }, {
                path: 'data.form.defaultProject', value: form.defaultProject
            }]
        }
        const ok = await this.voucherAction.check(checkArr, this.check)
        if (!ok) return

        option.code = form.code
        option.name = form.name
        if (form.defaultProject) {
            // console.log(form.defaultProject)
            option.accountCode = form.defaultProject.code
        }

        //新增
        if (!record) {
            //有大类的时候pid取的是大类的id, 没有大类的时候pid取的是收入类型的id
            if (intabId != '3001002' && intabId != '3001001') {
                option.pid = intabId
            } else {
                option.pid = form.receivables.id
            }
            if (form.defaultProject && form.defaultProject.id) option.accountId = form.defaultProject.id
            res = await this.webapi.incomeexpensesCard.create(option)
            if (!res) return false
            this.metaAction.toast('success', '新增成功')
            if (type == 'saveAndNew') {
                this.injections.reduce('saveAndNew', res)
                this.load()
                return false
            }
            //编辑
        } else if (intabId == '1000000') {
            filter = {
                ...record,
                //bankAccountTypeId: record.bankAccountTypeId,
                accountCode: form.accountCode
            }
            res = await this.webapi.incomeexpensesCard.saveSettleTemplate([filter])
            this.metaAction.toast('success', '编辑成功')
        } else if (intabId == '2000000' || intabId == '4000000') {
            filter = {
                accountCode: form.accountCode,
                id: record.templateUserId,
                influence: record.influence,
                influenceValue: record.influenceValue,
                templateAccountTypeId: record.templateAccountTypeId,
                ts: record.ts
            }
            res = await this.webapi.incomeexpensesCard.saveOrUpdate(filter)
            this.metaAction.toast('success', '编辑成功')
        } else if (intabId == '3000000') {
            filter = {
                influence: record.influence,
                influenceValue: record.influenceValue,
                accountCode: form.accountCode,
                templateAccountTypeId: record.templateAccountTypeId
            }
            res = await this.webapi.incomeexpensesCard.updateTaxTemplate(filter)
            this.metaAction.toast('success', '编辑成功')
        } else {
            if (form.defaultProject && form.defaultProject.id) option.accountId = form.defaultProject.id
            option.id = this.component.props.record.id
            option.ts = this.component.props.record.ts
            res = await this.webapi.incomeexpensesCard.update(option)
            if (!res) return false
            this.metaAction.toast('success', '编辑成功')
        }
        if (res) {
            return res
        } else {
            return true
        }
    }

    //保存校验
    check = async (option) => {
        if (!option || !option.path)
            return
        const { softAppName } = this.component.props;
        if (option.path == 'data.form.code') {
            return { errorPath: 'data.other.error.code', message: !(option.value && option.value.trim()) ? '请录入编码' : (option.value.length > 50 ? '编码不能超过50个字' : '') }
        }
        else if (option.path == 'data.form.name') {
            let incomeexpensesTabId = this.component.props.incomeexpensesTabId
            if (incomeexpensesTabId == '4001001') {
                return { errorPath: 'data.other.error.name', message: !(option.value && option.value.trim()) ? '请录入费用类型' : (option.value.length > 100 ? '费用类型不能超过100个字' : '') }
            } else if (incomeexpensesTabId == '2001003') {
                return { errorPath: 'data.other.error.name', message: !(option.value && option.value.trim()) ? '请录入收入类型' : (option.value.length > 100 ? '收入类型不能超过100个字' : '') }
            } else {
                return { errorPath: 'data.other.error.name', message: !(option.value && option.value.trim()) ? '请录入名称' : (option.value.length > 100 ? '名称不能超过100个字' : '') }
            }
        }
        else if (option.path == 'data.form.receivables') {
            return { errorPath: 'data.other.error.receivables', message: option.value ? '' : '请选择大类' }
        }
        else if (option.path == 'data.form.defaultProject') {
            const isPlus = this.isTplus()
            return { errorPath: 'data.other.error.defaultProject', message: option.value ? '' : (isPlus ? `请选择${softAppName}科目` : '请选择默认关联科目') }
        }
    }

    fieldChange = (path, value) => {
        let dd = this.metaAction.gf('data.other.defaultProject')
        const id = this.component.props.incomeexpensesTabId
        if (id == '1000000' || id == '2000000' || id == '3000000' || id == '4000000') {
            this.metaAction.sf('data.form.accountCode', fromJS(value.code))
        }
        this.voucherAction.fieldChange(path, value, this.check)
    }

    subjectListOption = () => {
        const data = this.metaAction.gf('data.other.defaultProject') && this.metaAction.gf('data.other.defaultProject').toJS()
        if (data) {
            return data.map(d => <Option title={d.codeAndName} key={d.code} value={d.code} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.codeAndName}</Option>)
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
