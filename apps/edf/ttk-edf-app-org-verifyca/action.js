import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { LoadingMask } from 'edf-component'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import caImg from './img/rightca.png'

let bakMetaAction = {}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        if (option.metaAction) bakMetaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.getOrgForDevice = this.getOrgForDevice.bind(this)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.injections = injections
        this.okDown = false
        injections.reduce('init')
        this.getOrgListByDevice()
    }

    getOrgInfo = async () => {
        let params = {
            userCert: this.getCertInfoByCertID(),
            random: Math.random()
        }

        let paraObj = this.getParam()
        let url = paraObj.url,
            options = paraObj.options
        let response = await this.webapi.veryifyCA.getOrgIndoByCert(url, params, options)
        if (response) {
            if (typeof (response) == 'object' && response.body) {
                //IE9兼容问题
                response = response.body
            }
            response = JSON.parse(response)
            if (response.isSuccess) {
                if (response.data && response.data.forMsgData) {
                    let nsrsbh = response.data.forMsgData.union_code
                    return {
                        nsrsbh: nsrsbh
                    }
                }
            }
        }
        return {}
    }

    getToken = () => {
        return sessionStorage['_accessToken']
    }

    getParam = () => {
        let paramObj = {}, url, params = {}

        let env = appBasicInfo.apiDomain + '/v1'
        // if(env.indexOf('https') > -1) {
        //     env = env.replace('https', 'http')
        // }

        let options = {
            headers: {
                token: this.getToken()
            }
        }

        paramObj.params = params
        paramObj.options = options
        paramObj.url = env
        return paramObj
    }

    getCertInfoByCertID = (strCertID) => {
        if (!strCertID) strCertID = this.metaAction.gf('data.form.sequenceId')
        let strUserCert = GetSignCert(strCertID);
        if (strUserCert == null || strUserCert == "") {
            //this.metaAction.toast('error', '导出用户证书失败')
            return false
        }
        return strUserCert
        //return encodeURIComponent(strUserCert)
    }

    getOrgForDevice = () => {
        //读取设备
        if (document.querySelector('.ttk-edf-app-org-verifyca')) {
            this.getOrgListByDevice()
        }


        //插入新的CA提示
    }

    showPwdChange = (v) => {
        this.metaAction.sf('data.other.showpwd', !v)
    }

    getOrgListByDevice = () => {
        if (!this.metaAction && bakMetaAction) this.metaAction = bakMetaAction
        let XTXAPP = document.getElementById('XTXAPP')
        if (!XTXAPP) return
        let usbKeyList = GetUserList(),
            usbKeyDevice = []
        if (usbKeyList) {
            usbKeyList = usbKeyList.split('&&&');
            let sequenceId = '',
                orgName = ''
            if (usbKeyList) {
                for (var i = 0; i < usbKeyList.length; i++) {
                    var arr = usbKeyList[i];
                    if (arr != '' && arr != null) {
                        sequenceId = (arr.split('||')[1] && arr.split('||')[1].indexOf('/') > -1) ? arr.split('||')[1].split('/')[1] : ''
                        orgName = GetCertBasicinfo(GetExchCert(sequenceId), 14)

                        let formInfo = {
                            'name': orgName,
                            'id': sequenceId
                        }
                        usbKeyDevice.push(formInfo)

                        if (i == 0) {
                            this.metaAction.sf('data.form.sequenceId', formInfo.id)
                        }
                    }

                }
            }
            //let usbKeyDate = GetCertBasicinfo(GetExchCert(sequenceId), 11).substr(0, 8) + '至' + GetCertBasicinfo(GetExchCert(sequenceId), 12).substr(0, 8)
            //this.metaAction.sfs(formInfo)
        }


        if (usbKeyDevice.length > 0) {
            this.metaAction.sf('data.other.elist', fromJS(usbKeyDevice))
        } else {
            this.metaAction.sf('data.other.elist', fromJS([{
                id: '',
                name: ''
            }]))
            this.metaAction.toast('error', '请插入北京数字一证通')
        }
    }

    getCATips = () => {
        return caImg
    }
    IsEmptyCA = () => {
        let isEmptyCA = this.metaAction.gf('data.other.elist')

        if (isEmptyCA) {
            if (isEmptyCA.get(0).get('id') == '') {
                return false
            }
        }
        return true
    }

    formatCaValidDate = (caValidDate) => {
        var strNotBefore_year = GetCertValidYear(caValidDate);
        var strNotBefore_month = GetCertValidMonth(caValidDate);
        var strNotBefore_day = GetCertValidDay(caValidDate);
        return strNotBefore_year + '' + strNotBefore_month + '' + strNotBefore_day + '000000'
    }
    onOk = async () => {
        if (this.okDown) return
        //LoadingMask.show({ background: 'rgba(230,247,255,0.5)' })
        this.okDown = true
        let form = this.metaAction.gf('data.form').toJS()
        let password = form.password
        let flag = this.checkpassword(form.password)
        if (!flag) {
            LoadingMask.hide()
            return
        }


        if (form.password) {
            if (form.password == '') {
                return
            }
        } else {
            this.okDown = false
            return false
        }
        let sequenceId = form.sequenceId

        if (typeof (XTXAppLogin) == "function") {
            let loginStatus = XTXAppLogin(sequenceId, password)
            if (loginStatus) {
                this.okDown = false
                LoadingMask.hide()
                this.metaAction.toast('success', '信息验证成功')

                //写入读取到的CA信息
                let caValidDate = GetCertBasicinfo(this.getCertInfoByCertID(), 11)

                if (caValidDate && caValidDate.length != 14) {
                    caValidDate = this.formatCaValidDate(caValidDate)
                }
                let params = {
                    caContent: {
                        "RetCode": "0", "Result": this.getHashCode(sequenceId)
                    },
                    caExpire: caValidDate
                }

                let paraObj = this.getParam()
                let url = paraObj.url,
                    options = paraObj.options

                let response = await this.webapi.veryifyCA.saveCAContent(url, params, options)
                if (response) {
                    // if(response.head){
                    //     if(response.head.errorMsg !='success'){
                    //         this.metaAction.toast('error',response.head.)
                    //     }
                    // }
                }

                //带出纳税人识别号

                let orgInfo = this.getOrgInfo()
                return orgInfo
            } else {
                this.okDown = false
                let errorLoginNum = GetUserPINRetryCount() || 10
                LoadingMask.hide()
                this.metaAction.sf('data.error.password', 'CA密码输入错误，剩余' + Math.abs(errorLoginNum) + '次后一证通将被锁定！')
                return false
            }
        }

    }

    getHashCode = (sequenceId) => {
        let oneParm = GetSignCert(sequenceId)
        let twoParm = sequenceId
        let threeParm = SignedData(sequenceId, sequenceId)
        let result = oneParm + ';' + twoParm + ';' + threeParm
        return result
    }
    checkpassword = async (password) => {
        let message
        if (!password)
            message = '请输入密码'
        // else if(!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(password))
        //     message = '6-20位必须包含大写字母、小写字母和数字'
        this.metaAction.sf('data.error.password', message)
        this.metaAction.sf('data.form.password', password)
        if (message) return false
    }
}
//防止窗口弹出后，再关闭，会触发usb callback
if (typeof (SetOnUsbKeyChangeCallBack) != 'undefined') {
    SetOnUsbKeyChangeCallBack(function () {
        const notifyClass = new action({})
        if (notifyClass) {
            notifyClass.getOrgForDevice()
        }
    })

}


export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
