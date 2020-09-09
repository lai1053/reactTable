import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import debounce from 'lodash.debounce'

import {FormDecorator} from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.formNameChange = debounce(this.formNameChange, 500);
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.clickStatus = false
        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.injections.reduce('updateSingle', 'data.appVersion',this.component.props.appVersion)
        }

        this.load()
        this.ggxqxx()
    }

    load = async () => {
        let queryData = await this.webapi.person.load()

        // let payload = {}, response, roleResponse
        // let queryData = await this.webapi.person.queryData()
        // if (queryData) payload.queryData = queryData
        // if (this.component.props.personId || this.component.props.personId == 0) {
        //     response = await this.webapi.person.query(this.component.props.personId)
        //     //判断是否修改当前用户
        //     if(response && response.userId == this.metaAction.context.get('currentUser').id) {
        //         this.metaAction.sf('data.other.oldRole', fromJS(response.roleDtoList))
        //     }
        //     if (response) payload.person = response
        // } else if (this.component.props.deptId && this.component.props.deptName) {
        //     payload.parentPerson = {
        //         id: this.component.props.deptId,
        //         name: this.component.props.deptName
        //     }
        // }
        // roleResponse = await this.webapi.role.query()
        // if (roleResponse && roleResponse.length > 0) {
        //     roleResponse.forEach((data) => {
        //         data.label = data.name
        //         data.value = data.id
        //     })
        // }
        // let account = await this.webapi.person.account()
        // if (account && account.glAccounts) payload.glAccounts = account.glAccounts
        // this.injections.reduce('load', payload, roleResponse)
        // const form = this.metaAction.gf('data.form').toJS()
    }

    onOk = async () => {
        return await this.save()
    }

    ggxqxx = async (id) => {
        // let option = [{"messageId":id}]
        let response = await this.webapi.person.getxx()
        if(!response){
            return false
        }
        this.injections.reduce('updateObj', {
            'data.form':response,
            'data.name':response.name,
            'data.contactsName':response.contactsName,
            'data.contactsAddress':response.contactsAddress,
            'data.contactsPhone':response.contactsPhone,
            'data.contactsMail':response.contactsMail,
            'data.area.registeredCounty': response.xzqhdm,
            'data.area.registeredProvincial': response.ts,
            'data.area.registeredCity': response.areaCode,
        })

    }
    // save = async () => {
    //     if (this.clickStatus) return
    //     this.clickStatus = true
    //     const form = this.metaAction.gf('data.form').toJS()
    //     const ok = await this.voucherAction.check([{
    //         path: 'data.form.contactsMail', value: form.contactsMail
    //     }, {
    //         path: 'data.form.jgmc', value: form.jgmc
    //     }, {
    //         path: 'data.form.password', value: form.password
    //     }, , {
    //         path: 'data.form.mobile', value: form.mobile
    //     }], this.check)
    //     if (!ok) {
    //         this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
    //         this.clickStatus = false
    //         return false
    //     }
    //     if (form.userId) {
    //         if (form.roleDtoList.length <= 0) {
    //             this.metaAction.toast('warning', '已经邀请的用户不允许清空角色')
    //             return false
    //         }
    //     }
    //     let response
    //     let VatTaxpayer = Object.assign({},this.metaAction.context.get("currentOrg"))|| {}
    //     VatTaxpayer.id = 'genid'
    //     form.creator = VatTaxpayer.creator
    //
    //     if (form.mobile) {
    //         form.mobile = form.mobile.toString()
    //     }
    //     form.jgmc = form.jgmc ? form.jgmc.trim() : ''
    //     form.password = form.password ? form.password.trim() : ''
    //     form.otherReceivableAccountId = form.otherReceivableAccountId ? form.otherReceivableAccountId : ''
    //     form.otherPayableAccountId = form.otherPayableAccountId ? form.otherPayableAccountId : ''
    //     form.isReturnValue = true
    //     form.isLoadingDefaultAccount = false
    //     if (this.component.props.personId || this.component.props.personId == 0) {
    //         form.personId = this.component.props.personId
    //         response = await this.webapi.person.update(form)
    //     } else {
    //         form.isEnable = true
    //         response = await this.webapi.person.create(form)
    //     }
    //     this.clickStatus = false
    //     if (response && response.error) {
    //         this.metaAction.toast('error', response.error.message)
    //         return false
    //     } else {
    //         let oldRoleId = this.metaAction.gf('data.other.oldRole') && this.metaAction.gf('data.other.oldRole').toJS()
    //         if(oldRoleId) {
    //             if(response.roleDtoList.length != oldRoleId.length) {
    //                 response.refreshMenu = true
    //             }else {
    //                 let arr = new Array(oldRoleId.length)
    //                 for(let i = 0 ; i < oldRoleId.length; i ++) {
    //                     for(let j = 0 ; j < response.roleDtoList.length; j++) {
    //                         if(oldRoleId[i].roleId == response.roleDtoList[j].roleId) {
    //                             arr[i] = true
    //                             break
    //                         }else {
    //                             arr[i] = false
    //                         }
    //                     }
    //                 }
    //                 for(let i = 0 ; i < arr.length ; i++) {
    //                     if(arr[i]) {
    //                         response.refreshMenu = false
    //                     }else {
    //                         response.refreshMenu = true
    //                     }
    //                 }
    //             }
    //         }else {
    //             response.refreshMenu = false
    //         }
    //         this.metaAction.toast('success', '保存成功')
    //         return response
    //     }
    // }
    save = async () => {
        // if (this.clickStatus) return
        // this.clickStatus = true
        // const form = this.metaAction.gf('data.form').toJS()
        const formData = this.metaAction.gf('data.form')
        const name = this.metaAction.gf('data.name')
        const contactsAddress = this.metaAction.gf('data.contactsAddress')
        const contactsName = this.metaAction.gf('data.contactsName')
        const contactsPhone = this.metaAction.gf('data.contactsPhone')
        const contactsMail = this.metaAction.gf('data.contactsMail')
        let area = {}
        area = this.metaAction.gf('data.area').toJS()

        if(name == '' ){
           // ti = ''
           let ti = '请输入机构名称'
           if(name.trim() == '' ){
           }
           this.metaAction.toast('warning', ti )
           return false
       }
        // 校验是否存在同名机构
        let trimName = name ? name.trim() : ''
        if(trimName!==''){
            let response = await this.webapi.person.checkOrgName({name:trimName})
            if(!response.success){
                this.metaAction.toast('warning', '已经存在同名机构' )
                return false
            }
        }

        if(contactsName == ''){
            let ti = ''
            if(contactsName.trim() == '' ){
                ti = '请输入机构联系人'
            }
            // if(contactsName.trim().length > 100 ){
            //     ti = '机构名称最大长度为100个字符'
            // }
            this.metaAction.toast('warning', ti )
            return false
        }
        if(contactsPhone == ''){
            this.metaAction.toast('warning', '请输入手机号' )
            return false
        }
        let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
        if(!mobileReg.test(contactsPhone)){
            this.metaAction.toast('warning', '请输入11位的手机号' )
            return false
        }
        let emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/ // /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
        if(contactsMail == ''){
            this.metaAction.toast('warning', '请输入邮箱' )
            return false
        }
        if(!emailReg.test(contactsMail)){
            this.metaAction.toast('warning', '请输入正确邮箱' )
            return false
        }
        // const ok = await this.voucherAction.check([{
        //     path: 'data.form.name', value: formData.name
        // }, {
        //     path: 'data.contactsName', value: contactsName
        // }, {
        //     path: 'data.contactsPhone', value: contactsPhone
        // }, , {
        //     path: 'data.contactsMail', value: contactsMail
        // }], this.check)
        // if (!ok) {
        //     this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
        //     this.clickStatus = false
        //     return false
        // }
        const form = {} //this.metaAction.gf('data.form').toJS()
        // name=李茂飞我要测试公司&
        // xzqhdm=370201&
        // contactsAddress=市南区宁夏路288号&
        // contactsName=李茂飞&
        // contactsPhone=13808981291
        form.name = name ? name.trim() : ''
        form.xzqhdm = area.registeredCounty ? area.registeredCounty.trim() : ''
        form.contactsAddress = contactsAddress ? contactsAddress : ''
        form.contactsName = contactsName ? contactsName : ''
        form.contactsPhone = contactsPhone ? contactsPhone : ''
        form.contactsMail = contactsMail ? contactsMail : ''
        form.isReturnValue = true;

        let response = await this.webapi.person.create(form)
        console.log("我是服务器返回值：",response)
        if (response && response.error) {
            this.metaAction.toast('error', response.error.message);
            return false;
        } else {
            this.metaAction.toast('success', '保存成功');
            return response;
        }
        // if (response && !response.success) {
        //     this.metaAction.toast('error', response.message)
        //     return false
        // }else{
        //     this.metaAction.toast('success', '保存成功')
        // }
       
        //return response
    }

    changeCheck = (str) => {
        const form = this.metaAction.gf('data.form')
        const contactsPhone = this.metaAction.gf('data.contactsPhone')
        switch (str){
            case 'name':
                this.voucherAction.check([{
                    path: 'data.name', value: name
                }], this.check);
                break;
            case 'contactsAddress':
                this.voucherAction.check([{
                    path: 'data.form.contactsAddress', value: form.contactsAddress
                }], this.check);
                break;
            case 'contactsMail':
                this.voucherAction.check([{
                    path: 'data.form.contactsMail', value: form.contactsMail
                }], this.check);
                break;
            case 'contactsPhone':
                this.voucherAction.check([{
                    path: 'data.contactsPhone', value: contactsPhone
                }], this.check);
                break;
        }
    }

    check = async (option) => {
        if (!option || !option.path)
            return
        let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            identityReg = /^\d{17}(\d|x)$/i,
            response
        if (option.path == 'data.form.contactsPhone') {
            if (option.value && mobileReg.test(option.value)) {
                if (this.metaAction.gf('data.phoneStatus') == false) {
                    response = await this.webapi.user.existsMobile(option.value)
                    return { errorPath: 'data.other.error.contactsPhone', message: response ? '手机号已注册' : '' }
                }
            } else if (option.value && !mobileReg.test(option.value)) {
                return { errorPath: 'data.other.error.contactsPhone', message: (option.value && !(mobileReg.test(option.value))) ? '请输入11位的手机号' : '' }
            }
        } else if (option.path == 'data.form.contactsMail') {
            return { errorPath: 'data.other.error.contactsMail', message: option.value && !(emailReg.test(option.value)) ? '请输入正确格式的邮箱' : '' }
        } else if (option.path == 'data.name') {
            // return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入机构名称'}
            let ti = option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入机构名称'
            // this.metaAction.toast('warning',  )
            let name = this.metaAction.gf('data.name')
            let trimName = name ? name.trim() : ''
            if(trimName!==''){
                let response = await this.webapi.person.checkOrgName({name:trimName})
                return {errorPath: 'data.other.error.name', message:  response.success?'':'已经存在同名机构'}
            }else{
                return {errorPath: 'data.other.error.name', message:  ''}
            }
            // return
            // return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入机构名称'}
        }  else if (option.path == 'data.form.password') {
            return {errorPath: 'data.other.error.password', message: option.value && option.value.trim() && option.value.trim().length > 50 ? '请输入正确的密码格式' : ''}
        }
    }

    checkNoSave = async (option) => {
        if (!option || !option.path)
            return
        let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            identityReg = /^\d{17}(\d|x)$/i,
            response

        if (option.path == 'data.form.mobile') {
            if (option.value) {
                if (mobileReg.test(option.value)) {
                    response = await this.webapi.user.existsMobile(option.value)
                    return { errorPath: 'data.other.error.mobile', message: response ? '手机号已注册' : '' }
                } else if (option.value.length > 11) {
                    return { errorPath: 'data.other.error.mobile', message: '请输入正确位数的手机号' }
                } else if (option.value.length > 1 && option.value.length < 11 && !/^1[3|4|5|6|7|8|9]/.test(option.value)) {
                    return { errorPath: 'data.other.error.mobile', message: '请输入正确的手机号' }
                } else if (option.value.length == 1 && option.value != '1') {
                    return { errorPath: 'data.other.error.mobile', message: '请输入正确的手机号' }
                } else {
                    return {errorPath: 'data.other.error.mobile', message: '' }
                }
            }
        } else if (option.path == 'data.form.contactsMail') {
            return { errorPath: 'data.other.error.contactsMail', message: '' }
        } else if (option.path == 'data.name') {
            return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入姓名'}
        } else if (option.path == 'data.form.password') {
            return { errorPath: 'data.other.error.password', message: (option.value && option.value.length > 18) ? '请输入正确的的手机号' : '' }
        }
    }

    checkBoxChange = (data) => {
        this.injections.reduce('roleChange', data)
    }

    //设置地址
    setAddress = (e) => {
        let address = e.toJS()
        // this.confirmRegisteredCounty(address.districts)
        // let aa = this.metaAction.gf('data.area')
        // console.log('ddd',aa)
        this.injections.reduce('updateObj', {
            'data.area.registeredProvincial': address.provinces,
            'data.area.registeredCity': address.citys,
            'data.area.registeredCounty': address.districts,
            // 'data.form.areaCode':address.districts,
        })
    }

    confirmRegisteredCounty = (code) => {
        let areaQueryMap = this.metaAction.gf('data.other.areaQueryMap').toJS()
        if(areaQueryMap[code]){
            // console.log('颠三倒四',areaQueryMap[code].loginTypeArr)
            // this.metaAction.sfs({
                // 'data.other.loginTypeRelation': fromJS(areaQueryMap[code].loginTypeArr),
                // 'data.form.dlfs': fromJS(areaQueryMap[code].loginTypeArr.length > 0 && areaQueryMap[code].loginTypeArr[0])
            // });
        }else {
            this.confirmRegisteredCounty(code.slice(0,code.length - 2))
        }
    }

    roleDisable = () => {
        let appVersion = this.metaAction.gf('data.appVersion')
        if((appVersion == 107 && sessionStorage["dzSource"] == 1)) return true
        let data = this.metaAction.gf('data').toJS();
        let form = data.form,
            roleStatus = data.roleStatus,
            status = false
        if (form && form.isOrgCreator == true) {
            status = true
        }
        return status
    }

    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.checkNoSave)
    }
    // xqChange = (e) => {
    //     this.metaAction.sf('data.contactsAddress',e)
    // }


    roleMenuClick = (e) => {
        switch (e.key) {
            case 'viewrole':
                this.viewRole()
                break;
        }
    }

    viewRole = async () => {

    }


    subjectListOption = () => {
        let data = this.metaAction.gf('data.other.glAccounts') && this.metaAction.gf('data.other.glAccounts').toJS()

        if (data) {
            return data.map(d => <Option title={d.codeAndName} key={d.id} value={d.id} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.codeAndName}</Option>)
        }
    }

    formNameChange = (e) => {
        this.injections.reduce('updateSingle', 'data.name',e.target.value)
        this.changeCheck('name')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}
