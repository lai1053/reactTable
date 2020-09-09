import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch as fetchUtil} from 'edf-utils'
import {LoadingMask} from 'edf-component'

import {FormDecorator} from 'edf-component'
import { Checkbox } from '../../../../../node_modules/antd';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        //sourceType: 0创建账套 1账套信息
        injections.reduce('init', {
            isPop: this.component.props.isPop,
            sourceType: this.component.props.sourceType,
        })
        if( 0 == this.component.props.sourceType){
            // this.loadSelect()
        }

        // let availableOrg = sessionStorage.getItem('currentOrgStatus')
        // //用户登录，无绑定企业,创建企业打点
        // if (typeof (gio) == "function") {
        //     if (sessionStorage['currentOrgStatus'] == 2) {
        //         if (sessionStorage['jchlRecord']) {
        //             gio('track', 'createOrgLoad_' + sessionStorage['jchlRecord']);
        //         } else {
        //             gio('track', 'createOrgLoad_jcgj');
        //         }
        //     }
        // }
        // if (availableOrg == 1 || availableOrg == 2) {
        //     return
        // }
        this.load()
        //标识是否正在处理创建事件
        this.handleCreate = false
    }

    load = async (option) => {
        this.loadSelect()
        let item = await this.webapi.portal.init({orgId: this.component.props.id})
        let bg = await this.webapi.portal.sfxsbgan({orgId: this.component.props.id})
        // console.log('bg',bg)
        this.injections.reduce('update',{path:'data.viewVisible',value:bg});
        let payload = await this.GetPropertyList()
        this.injections.reduce('load', payload, item, this.metaAction.context.get('currentUser').nickname)
    }
    loadSelect = async () => {
        let arr = []
        //纳税人身份
        arr.push(consts.enum.VATTAXPAYER)
        //企业会计准则
        arr.push(consts.enum.ACCOUNTINGSTANDARDS)
        //所属行业
        arr.push('200030')

        const enumList = await this.webapi.enumDetail.batchQuery(arr)
        //系统时间
        // const date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1)
        // let date=new Date;
        // let year=date.getFullYear();
        // let month=date.getMonth();
        //     month =(month<10 ? "0"+month:month);
        // let cdate =  (year.toString()+"-"+month.toString());

        this.injections.reduce('loadSelect', enumList[consts.enum.VATTAXPAYER], enumList[consts.enum.ACCOUNTINGSTANDARDS],enumList['200030'])
    }
    GetPropertyList = async () => {
        return {
            list: [
                {enumId: consts.VATTAXPAYER_generalTaxPayer, name: '一般纳税人'},
                {enumId: consts.VATTAXPAYER_smallScaleTaxPayer, name: '小规模纳税人'}
            ]
        }
    }

    save = async () => {
        if(this.handleCreate) return
        this.handleCreate = true
        let form = this.metaAction.gf('data.form').toJS(),
            isZtzg = this.metaAction.gf('data.isZtzg');
        const ok = await this.check([{
            path: 'data.form.name', value: form.name
        }, {
            path: 'data.form.financeCreator', value: form.financeCreator
        }, {
            path: 'data.form.financeAuditor', value: form.financeAuditor
        }, {
            path: 'data.form.industrys', value: form.industrys
        }], 'edit')
        if (!ok) {
            this.handleCreate = false
            return false
        }
        let params = {
            financeOrgName: form.name.trim(),
            financeCreator: form.financeCreator,
            financeAuditor: form.financeAuditor,
            ztzg: form.accountSupervisor,
            isZtzg:isZtzg,
            industry: form.industrys,
        }
        params.id = this.component.props.id
        LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
        let response = await this.webapi.org.updateAccountInfo(params)
        LoadingMask.hide()
        this.handleCreate = false
        if(response) {
            this.metaAction.toast('success', '保存成功！')
            this.component.props.closeModal(true)
        }
    }

    create = async () => {//新建企业
        if(this.handleCreate) return
        this.handleCreate = true
        let form = this.metaAction.gf('data.form').toJS(),
            isZtzg = this.metaAction.gf('data.isZtzg');
        const ok = await this.check([{
            path: 'data.form.name', value: form.name
        }, {
            path: 'data.form.vatTaxpayer', value: form.vatTaxpayer
        }, {
            path: 'data.form.enabledDate', value: form.enabledDate
        }, {
            path: 'data.form.accountingStandards', value: form.accountingStandards
        }, {
            path: 'data.form.industrys', value: form.industrys
        },
        //     {
        //     path: 'data.form.financeCreator', value: form.financeCreator
        // },
        //     {
        //     path: 'data.form.financeAuditor', value: form.financeAuditor
        // },
            {
            path:'data.form.tutorialBeginDate',value:form.tutorialBeginDate
        },
            {
            path:'data.form.tutorialEndDate',value:form.tutorialEndDate
        }], 'create')
        if (!ok) {
            this.handleCreate = false
            return false
        }
        let params = {
            financeOrgName: form.name.trim(),
            vatTaxpayer: form.vatTaxpayer,
            enabledYear: form.enabledDate.split('-')[0],
            enabledMonth: form.enabledDate.split('-')[1],
            accountingStandards: form.accountingStandards,
            industry: form.industrys,
            financeCreator: form.financeCreator,
            financeAuditor: form.financeAuditor,
            ztzg: form.accountSupervisor,
            isZtzg:isZtzg,
            //2019-08-07
            isTutorialDate: form.isEnable,
            tutorialBeginDate: form.tutorialBeginDate,
            tutorialEndDate: form.tutorialEndDate,

        }
        // params.requestUrl = location.hostname
        // if(/^127.|^172.|^192./.test(location.hostname)) {
        //     params.requestUrl = 'localhost'
        // }
        // if(params.vatTaxpayer == '2000010002') {
        //     params.isSignAndRetreat = false
        // }else if(params.vatTaxpayer == '2000010001'){
        //     params.isSignAndRetreat = true
        // }
        params.id = this.component.props.id
        LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
        let response = await this.webapi.org.create(params)
        LoadingMask.hide()
        this.handleCreate = false
        if(response) {
            if(this.component.props.page == "home"){
                this.metaAction.toast('success', '建账成功，请到【客户】-【账套管理】模块查看账套信息');
            }else if(this.component.props.page == "ztmanage"){
                this.metaAction.toast('success', '创建账套成功！')
            }
            this.component.props.closeModal(true)
        }
    }

    cancel = async () => {
        this.component.props.closeModal()
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
            if (o.path == 'data.form.name') {
                Object.assign(r, await this.checkName(o.value, operate))
            } else if (o.path == 'data.form.vatTaxpayer') {
                Object.assign(r, await this.checkVatTaxpayer(o.value))
            } else if (o.path == 'data.form.enabledDate') {
                Object.assign(r, await this.checkEnableDate(o.value))
            } else if (o.path == 'data.form.accountingStandards') {
                Object.assign(r, await this.checkAccountingStandards(o.value))
            } else if (o.path == 'data.form.industrys') {
                Object.assign(r, await this.checkIndustrys(o.value))
            }
            // else if (o.path == 'data.form.financeCreator') {
            //     Object.assign(r, await this.checkFinanceCreator(o.value))
            // }
            // else if (o.path == 'data.form.financeAuditor') {
            //     Object.assign(r, await this.checkFinanceAuditor(o.value))
            // }
            else if(o.path == 'data.form.tutorialBeginDate'){
                Object.assign(r,await this.checkFDQdateStart(o.value))
            }
            else if(o.path == 'data.form.tutorialEndDate'){
                Object.assign(r,await this.checkFDQdateEnd(o.value))
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
    checkName = async (org, operate) => {
        var message
        if(operate && operate == 'create') {
            // if(await this.webapi.org.existsSysOrg({'name':org.trim(),'orgId':this.component.props.id}))
            if(await this.webapi.org.existsSysOrg({'financeOrgName':org.trim(),'orgId':this.component.props.id}))
                return { errorPath: 'data.other.error.name', message:"该代理机构已存在相同的账套名称"}
        }else if(operate && operate == 'edit'){
            let oldZTname = this.metaAction.gf('data.ztName');
            let newZTname = this.metaAction.gf('data.form.name');
            if(oldZTname != newZTname){
                if(await this.webapi.org.existsSysOrg({'financeOrgName':org.trim()}))
                    return { errorPath: 'data.other.error.name', message:"该代理机构已存在相同的账套名称"}
            }
        }

        if(!org)
            message = '请输入账套名称'
        else if(org.length > 200)
            message = "账套名称不能超过200个字"
        return { errorPath: 'data.other.error.name', message }
    }
    checkVatTaxpayer = async (vatTaxpayer) => {
        var message
        if (!vatTaxpayer) {
            message = '纳税人性质不能为空'
        }
        return {errorPath: 'data.other.error.vatTaxpayer', message}
    }
    checkEnableDate = async (enableDate) => {
        var message
        if (!enableDate) {
            message = '启用日期不能为空'
        }
        return {errorPath: 'data.other.error.enableDate', message}
    }
    checkFDQdateStart = async (start) => {
        // debugger
        let message
        console.log('我是开始日期',start)
        let isEnable = this.metaAction.gf('data.form.isEnable')
        let end = this.metaAction.gf('data.form.tutorialEndDate')
        console.log('我是true',isEnable)
        if(isEnable){
            if(!start && !end){
                message = '辅导期开始日期不能为空'
            }else if(!start && end){
                message = '辅导期开始日期不能为空'
            }else if(start && !end){
                message = '辅导期截止日期不能为空'
            }
            return {errorPath: 'data.other.error.fdq', message}
        }
    }
    checkFDQdateEnd = async (end) => {
        var message
        // debugger
        console.log('我是截止日期',end)
        let isEnable = this.metaAction.gf('data.form.isEnable')
        let start = this.metaAction.gf('data.form.tutorialBeginDate')
        let ztqyrq = this.metaAction.gf('data.form.enabledDate')
        if(isEnable){
            if(!start && !end){
                message = '辅导期开始日期不能为空'
            }else if(!start && end){
                message = '辅导期开始日期不能为空'
            }else if(start && !end){
                message = '辅导期截止日期不能为空'
            }

            let starttime = new Date(start);//辅导期开始时间
            let starttimes = starttime.getTime();
            let endTime = new Date(end);//辅导期结束时间
            let endTimes = endTime.getTime();
            let ztStart = new Date(ztqyrq);//账套启用日期
            let ztStarts = ztStart.getTime()
            // 进行日期比较
            if (endTimes <= starttimes) {
                // debugger
                message = '辅导期截止日期不能小于开始日期'
            }
            else if(ztStarts > starttime){
                message = '有效期起不得小于账套启用期间'
            }
            return {errorPath: 'data.other.error.fdq', message}
        }
    }
    checkAccountingStandards = async (accountingStandards) => {
        var message
        if (!accountingStandards) {
            message = '会计准则不能为空'
        }
        return {errorPath: 'data.other.error.accountingStandards', message}
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

    setField = async (path, value) => {
        this.voucherAction.fieldChange(path, value)
    }
    checkOrg = async (option) => {
        let res = await this.webapi.enumDetail.checkOrg({name: option})
    }
    changeDateState = () => {
        let state = this.metaAction.gf('data.other').toJS().editDate
        this.injections.reduce('update',{path:'data.other.editDate',value:!state});
    }
    changeStandardState = () => {
        let state = this.metaAction.gf('data.other').toJS().editStandard
        this.injections.reduce('update',{path:'data.other.editStandard',value:!state});
    }
    //选择创建企业
    toAddCompany = () => {
        let showAdd = this.metaAction.gf('data.showAdd');
        this.injections.reduce('update',{path:'data.showAdd',value:!showAdd});
    }
    //导入企业
    importCompany = () => {
        //this.component.props.setPortalContent('凭证管理', 'ttk-access-app-tranreport')
    }

    getFormItemValue = (value, dataSource, sourceType ) => {
        let res = ''
        if( sourceType === 0 ) return res
        if(dataSource) {
            dataSource.map( item => {
                if( item.id = value ) {
                    res = item.name
                }
            })
        }
        return res
    }

    changeFDQ = (e) =>{
        console.log('我是辅导期',e.target.checked)
        this.injections.reduce('update',{path:'data.form.isEnable',value:e.target.checked});
        // this.injections.reduce('updateENABLE', e.target.checked)

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

    //是否选择辅导期
    // checkTutorial = (data) => {
    //     this.metaAction.sf('data.form.isEnable', data)
    // }

    //是否辅导期
    // isTutorialInfo = () => {
    //     let isTutoral = this.metaAction.gf('data.form.isEnable');
    //     if(isTutoral){
    //         return true;
    //     }
    //     else{
    //         return false;
    //     }
    // }
    /*****************补充纳税人身份 start****************************/

    //     //辅导期有效期开始时间：
    // disabledFDQStart = (current) => {
    //     let time = this.metaAction.gf('data.enabledDate')
    //         return  current <= moment(time)
    // }


    //辅导期有效期开始时间：
    // disabledFDQEnd = (current) => {
    //     let fdq = this.metaAction.gf('data.fdq')
    //     let time = this.metaAction.gf('data.enabledDate')
    //     let date=new Date;
    //     let year=date.getFullYear();
    //     let month=date.getMonth()+1;
    //     month =(month<10 ? "0"+month:month);
    //     let cdate =  (year.toString()+"-"+month.toString());
    //     if(fdq == 0){
    //         return  current < moment(time) || current > moment(this.getNextMonth(cdate));
    //     }
    // }



    //变更
    editVatTaxPayer = async(name) => {
        console.log(name,'我是变更')
        const ret = await this.metaAction.modal('show', {
            title: '变更纳税人身份',
            width:500,
            // closeModal: this.closeImport,
            // closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-es-app-ztmanage-change-vattaxpayer', {
                store: this.component.props.store,
                params:{
                    vattaxpayer:name,
                    id:this.component.props.id

                },
                fun:this.load
            })
        })
    }


    //查看
    viewVatTaxPayer = async() => {
        const ret = await this.metaAction.modal('show', {
            title: '变更纳税人身份',
            width:500,
            // closeModal: this.closeImport,
            // closeBack: (back) => { this.closeTip = back },
            footer:null,
            children: this.metaAction.loadApp('ttk-es-app-ztmanage-change-info', {
                store: this.component.props.store,
                id:this.component.props.id,
            })
        })
    }

    /*****************补充纳税人身份 end****************************/
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}
