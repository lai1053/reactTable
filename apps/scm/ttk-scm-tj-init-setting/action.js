import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Button } from 'edf-component'
import config from './config'
import { FormDecorator } from 'edf-component'
import { environment } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    //初始化数据
    onInit = ({
        component,
        injections
    }) => {
        this.voucherAction.onInit({
            component,
            injections
        })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        this.changeSipmleDate = false
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        if (this.reLoginTimer) {
            clearInterval(this.reLoginTimer);
            this.reLoginTimer = null;
        }
        injections.reduce('init');
        this.load()

        //打点统计
        if (typeof (gio) == "function") {
            gio('track', 'connectToOtherSoftware');
        }
    }

    onTabFocus = () => {
        this.load()
    }

    getOrgId = () => {
        const org = this.metaAction.context.get('currentOrg') || {}
        return org ? org.id : ''
    }
    getToken = () => {
        const org = this.metaAction.context.get('currentOrg') || {}
        return org ? {
            headers: {
                token: org.id
            }
        } : {
                headers: {
                    token: ""
                }
            }
    }
    load = async () => {
        const res = await this.webapi.tplus.configExist(); //是否已绑定
        const config = await this.webapi.tplus.configQuery(); //查询配置信息
        this.metaAction.sf('data.other.action', 'add');
        if (res && config) {
            const appVersionArr = this.metaAction.gf('data.other.app').toJS();
            let foreseeClientHost = config.foreseeClientHost;
            let params = foreseeClientHost.split(':');
            foreseeClientHost = params[0];
            let foreseeClientPort = params[1];
            if (!config.appVersion) {
                config.appVersion = null;
                config.dbVersion = null;
            }
            const form = {
                ...config,
                foreseeClientHost,
                foreseeClientPort,
                // appAccountName: `[00${config.appAccountNumber}]${config.appAccountName}`,
                appAccountName: !isNaN(parseInt(config.appAccountNumber)) ? (config.appAccountNumber.length == 1 ? `[00${config.appAccountNumber}]${config.appAccountName}` : (config.appAccountNumber.length == 2 ? `[0${config.appAccountNumber}]${config.appAccountName}` : `[${config.appAccountNumber}]${config.appAccountName}`)) : `[${config.appAccountNumber}]${config.appAccountName}`
            }

            const newappVersion = appVersionArr.find(a => a.value == config.appName).appVersion;
            let newdbVersion = [];
            if (config.appVersion) {
                let getAppVersion = newappVersion.find(a => a.value == config.appVersion)
                if (getAppVersion) newdbVersion = getAppVersion.dbVersion;
            }


            this.injections.reduce('load', {
                'data.other.step': 3,
                'data.other.hasbind': true,
                'data.form': fromJS(form),
                'data.appAccountNumber': form.appAccountNumber,
                'data.other.appVersion': fromJS(newappVersion),
                'data.other.dbVersion': fromJS(newdbVersion),
                'data.other.accoutList': fromJS([
                    {
                        accName: config.appAccountName,
                        accNum: config.appAccountNumber,
                        dsName: config.databaseName,
                    }
                ]),
                'data.other.foreseeClientDownloadAddress': config.foreseeClientDownloadAddress,
                'data.loading': false
            })
        } else {
            if (config.foreseeClientDownloadAddress) {
                this.injections.reduce('load', {
                    'data.other.foreseeClientDownloadAddress': config.foreseeClientDownloadAddress,
                })
            }
            this.metaAction.sf('data.loading', false);
        }
    }
    dbTest = async (type) => {
        const form = this.metaAction.gf('data.form').toJS();
        const loading = this.metaAction.gf('data.loading');
        if (loading) return
        let {
            dbHost,
            dbPort,
            dbUsername,
            dbPassword,
            foreseeClientHost,
            foreseeClientPort,
            appName,
            appVersion,
            dbVersion,
            bsAppHost,
            bsAppPort
        } = form;
        const checkArr = [{
            path: 'data.form.appName',
            value: appName
        },
        {
            path: 'data.form.appVersion',
            value: appVersion
        },
        {
            path: 'data.form.dbVersion',
            value: dbVersion
        },
        {
            path: 'data.form.foreseeClientHost',
            value: foreseeClientHost
        },
        {
            path: 'data.form.foreseeClientPort',
            value: foreseeClientPort
        },
        {
            path: 'data.form.dbUsername',
            value: dbUsername
        },
        {
            path: 'data.form.dbPassword',
            value: dbPassword
        },
        {
            path: 'data.form.bsAppPort',
            value: bsAppPort
        }, {
            path: 'data.form.dbPort',
            value: dbPort
        }
        ]
        const ok = await this.voucherAction.check(checkArr, this.check)
        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示修改信息后才可提交')
            return false
        }
        if (!dbHost) {
            dbHost = foreseeClientHost;
        }
        if (!bsAppHost) {
            bsAppHost = foreseeClientHost;
        }

        if (type == 'next') {
            const nexturl = `${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/config/checkHostAndPort`;

            const nextparms = {
                appName,
                appVersion,
                dbVersion,
                foreseeClientHost: `${foreseeClientHost}:${foreseeClientPort}`,
                dbUsername,
                dbPassword,
                bsAppHost,
                bsAppPort,
                dbHost,
                dbPort
            }
            this.metaAction.sf('data.loading', true);
            const res = await this.webapi.tplus.common(nexturl, nextparms, this.getToken());
            this.metaAction.sf('data.loading', false);
            if (res && res.error) {
                this.metaAction.toast('error', res.error.message)
                return false;
            } else if (res && res.result && res.value && res.value.result === false) {
                this.metaAction.toast('error', res.value.message);
                return false;
            } else if (res && res.result && res.value && res.value.result === true) {
                return true
            } else {
                this.metaAction.toast('error', '连接失败：请检查配置软件是否正常启动以及配置软件IP地址、端口号是否填写正确');
                return false;
            }
        } else {
            const url = `${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/config/dbConnect`;
            const params = {
                dbHost,
                dbPort,
                dbUsername,
                dbPassword,
                dbVersion,
                appName,
                appVersion
            }
            this.metaAction.sf('data.loading', true);
            let res = await this.webapi.tplus.common(url, params, this.getToken());
            // console.log(url, res);
            this.metaAction.sf('data.loading', false);
            if (res && res.error) {
                this.metaAction.toast('error', res.error.message)
            } else if (res && res.result && res.value && res.value.result === false) {
                this.metaAction.toast('error', res.value.message);
            } else if (res && res.result && res.value && res.value.result === true) {
                this.metaAction.toast('success', '连接成功');
            } else {
                this.metaAction.toast('error', '连接失败：请检查配置软件是否正常启动以及配置软件IP地址、端口号是否填写正确');
            }
        }
    }
    nextStep = async () => {

        const loading = this.metaAction.gf('data.loading');
        if (loading) return
        const step = this.metaAction.gf('data.other.step');
        if (step === 1) {
            await this.goToStepTwo()
        } else if (step === 2) {
            const action = this.metaAction.gf('data.other.action');
            if (action == 'add') {
                await this.saveConfig();
            } else {
                //获取账套
                const a = await this.handleBlur();

                if (a) {
                    //保存
                    await this.saveConfig();
                }
            }
            // await this.saveConfig();
        } else if (step === 3) {
            //this.returnPortal();
            if (this.reLoginTimer) {

                clearInterval(this.reLoginTimer)
                this.reLoginTimer = null;
                this.returnPortal();
            } else {

                this.component.props.tabEdit('对接财务账套', 'remove')
            }
        }
    }

    //跳转到第二步
    goToStepTwo = async () => {
        const form = this.metaAction.gf('data.form').toJS();
        let {
            appName,
            foreseeClientHost
        } = form;


        const testResult = await this.dbTest('next');
        if (!testResult) return;
        if (foreseeClientHost == '127.0.0.1') {
            const ret1 = await this.metaAction.modal('confirm', {
                title: '提示',
                width: 500,
                content: `不建议配置"127.0.0.1"内部地址，会存在远程访问不到"${/Tplus/.test(appName) ? 'T+' : appName}凭证管理"！ 点击"确定"继续使用"127.0.0.1"，否则重新填写`
            })
            if (!ret1) return
        }
        this.metaAction.sf('data.other.step', 2);
    }

    //保存
    saveConfig = async () => {
        const other = this.metaAction.gf('data.other').toJS();
        const form = this.metaAction.gf('data.form').toJS();

        let {
            appName,
            appVersion,
            dbVersion,
            dbHost,
            dbPort,
            dbUsername,
            dbPassword,
            appUserName,
            appPassword,
            appAccountNumber,
            ttkUserName,
            ttkPassword,
            foreseeClientHost,
            foreseeClientPort,
            bsAppHost,
            bsAppPort
        } = form;

        if (other.action == 'update') {
            //重新获取下账套和原账套进行比较
            const eq = await this.handleBlur();

            if (!eq) return
        }


        let dsName, accName;
        if (appAccountNumber && other.accoutList.length > 0) {
            const selectacc = other.accoutList.find(item => item.accNum == appAccountNumber);
            accName = selectacc.accName;
            dsName = selectacc.dsName;
            let fullAppAccountName = !isNaN(parseInt(appAccountNumber)) ? (appAccountNumber.length == 1 ? `[00${appAccountNumber}]${accName}` : (appAccountNumber.length == 2 ? `[0${appAccountNumber}]${accName}` : `[${appAccountNumber}]${accName}`)) : `[${appAccountNumber}]${accName}`;

            // if (appAccountNumber && !isNaN(parseInt(appAccountNumber))) {
            //     fullAppAccountName = appAccountNumber.length == 1 ? `[00${appAccountNumber}]${accName}` : appAccountNumber.length == 2 ? `[0${appAccountNumber}]${accName}` : `[${appAccountNumber}]${accName}`
            // }

            this.metaAction.sf('data.form.appAccountName', fullAppAccountName)
        }
        const orgId = this.getOrgId();
        const date = moment().format('YYYY/MM/DD');
        if (!dbHost) {
            dbHost = foreseeClientHost;
            this.metaAction.sf('data.form.dbHost', dbHost)
        }
        if (!bsAppHost) {
            bsAppHost = foreseeClientHost;
            this.metaAction.sf('data.form.bsAppHost', bsAppHost)
        }
        const checkArr = [{
            path: 'data.form.appUserName',
            value: appUserName
        },
        {
            path: 'data.form.appAccountNumber',
            value: appAccountNumber
        }
        ]
        const ok = await this.voucherAction.check(checkArr, this.check)
        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示修改信息后才可提交')

            return false
        }


        const parms = {
            dbHost,
            dbPort,
            dbUsername,
            dbPassword,
            appName,
            appVersion,
            dbVersion,
            bsAppHost,
            bsAppPort,
            foreseeClientHost: `${foreseeClientHost}:${foreseeClientPort}`,
            appUserName,
            appPassword: appPassword ? appPassword : '',
            appAccountNumber: appAccountNumber,
            databaseName: dsName,
            appAccountName: accName,
            appLoginDate: date,
            ttkUserName,
            ttkPassword,
            ttkOrgId: orgId,
            ttkLoginDate: date,
            isReturnValue: true
        }

        const url = `${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/config/save`;
        let isCommon = this.metaAction.gf('data.other.isCommon')
        if (!isCommon) return
        this.metaAction.sf('data.other.isCommon', false)
        this.metaAction.sf('data.loading', true);
        const res1 = await this.webapi.tplus.common(url, parms, this.getToken());
        this.metaAction.sf('data.other.isCommon', true);
        this.metaAction.sf('data.loading', false);
        if (res1 && res1.error) {
            this.metaAction.toast('error', res1.error.message);
        } else if (res1 && res1.value == 'true') {
            const res2 = await this.webapi.tplus.configSave(parms);
            if (res2 && res2.result == false) {
                this.metaAction.toast('error', res2.error.message)
            } else {
                if (other.action == 'add') {
                    const queryAll = await this.webapi.tplus.common(`${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/account/queryAll`, {}, this.getToken());
                    if (queryAll && queryAll.value) {
                        const syncAccount = await this.webapi.tplus.syncAccount({
                            "externalAccounts": queryAll.value
                        });
                    }
                }
                this.metaAction.toast('success', '绑定成功');
                this.countFive();
                this.metaAction.sf('data.other.step', 3)

            }
        } else {
            this.metaAction.toast('error', '连接服务失败：请检查配置软件是否正常启动')
            return
        }
    }
    countFive = () => {
        let t = 5
        this.reLoginTimer = setInterval(() => {
            t--
            this.metaAction.sf('data.reRefreshTime', t)
            if (t <= 0) {
                if (this.reLoginTimer) {
                    clearInterval(this.reLoginTimer);
                    this.reLoginTimer = null;
                }
                this.returnPortal();
                //this.component.props.resetPortal('门户首页', 'edfx-app-portal', { isShowMenu: false, isTabsStyle: false })
            }
        }, 1000)
    }

    //返回门户
    returnPortal = () => {
        if (this.reLoginTimer) {
            clearInterval(this.reLoginTimer)
            this.reLoginTimer = null;
        }
        this.component.props.resetPortal('门户首页', 'edfx-app-portal', {
            isShowMenu: false,
            isTabsStyle: false
        })
    }

    //返回上一步
    backLastStep = async () => {
        let step = this.metaAction.gf('data.other.step'),
            form = this.metaAction.gf('data.form').toJS(),
            {
                foreseeClientHost,
                foreseeClientPort
            } = form,
            action = this.metaAction.gf('data.other.action');
        if (step == 2) {
            if (action == 'add') {
                this.metaAction.sfs({
                    'data.other.step': 1,
                    'data.form.appUserName': null,
                    'data.form.appPassword': null,
                    'data.form.appAccountNumber': null,
                    'data.other.accoutList': fromJS([]),
                    'data.other.error.appAccountNumber': null,
                    'data.other.error.appUserName': null
                })
            } else {
                this.metaAction.sf('data.other.step', step - 1);
            }
        } else if (step == 3) {
            const data = await this.webapi.tplus.queryExternalDoc();
            if (data) {
                const ret = await this.metaAction.modal('confirm', {
                    title: '取消绑定',
                    content: '已生成过凭证,是否取消绑定?'
                })
                if (!ret) return
            } else {
                const ret1 = await this.metaAction.modal('confirm', {
                    title: '取消绑定',
                    content: '是否取消绑定?'
                })
                if (!ret1) return
            }
            // const href = window.location.href;

            //解除绑定
            const url = `${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/config/delete`
            const res1 = await this.webapi.tplus.common(url, {}, this.getToken())
            // if (res1 && res1.error) {
            //     this.metaAction.toast('error', `${res1.error.message}`)
            // } else if (res1 && res1.value == 'true') {
            const res = await this.webapi.tplus.configDelete()
            if (res) {
                this.metaAction.sfs({
                    'data.other.hasbind': false,
                    'data.form': fromJS({}),
                    'data.other.step': 1
                })
                this.returnPortal();
                // this.component.props.resetPortal('门户首页', 'edfx-app-portal', { isShowMenu: false, isTabsStyle: false })
            }
            // } else {
            //     this.metaAction.toast('error', '连接服务失败：请检查配置软件是否正常启动')
            // }

        }
    }

    //检查是否要置灰下一步按钮
    checkNext = () => {
        return false
    }
    fieldotherChange = (path, value) => {

        if (value) value = value.trim();
        const appVersionArr = this.metaAction.gf('data.other.app').toJS();
        const action = this.metaAction.gf('data.other.action');

        if (path == 'data.form.appName') {
            const newappVersion = appVersionArr.find(a => a.value == value).appVersion;
            let arr = {
                'data.other.dbVersion': fromJS([]),
                'data.form.dbVersion': undefined,
                'data.form.appVersion': undefined,
                'data.other.appVersion': fromJS(newappVersion),
            }

            if (action == 'add') {
                arr = {
                    ...arr,
                    'data.form.appUserName': null,
                    'data.form.appPassword': null,
                    'data.form.appAccountNumber': null,
                    'data.other.accoutList': fromJS([])
                }
            }

            this.injections.reduce('sfs', arr)
        } else if (path == 'data.form.appVersion') {

            //改变dbVersion
            const appVersion = this.metaAction.gf('data.other.appVersion').toJS();
            const db = appVersion.find(a => a.value == value).dbVersion;
            let arr = {
                'data.other.dbVersion': fromJS(db),
                'data.form.dbVersion': undefined,
            }

            if (action == 'add') {
                arr = {
                    ...arr,
                    'data.form.appUserName': null,
                    'data.form.appPassword': null,
                    'data.form.appAccountNumber': null,
                    'data.other.accoutList': fromJS([])
                }
            }
            this.injections.reduce('sfs', arr)

        }
        this.fieldChange(path, value)
    }
    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check)
    }
    check = async (option) => {

        if (!option || !option.path)
            return
        if (option.path == 'data.form.appName') {
            return {
                errorPath: 'data.other.error.appName',
                message: !option.value ? '请选择对接产品' : ""
            }
        } else if (option.path == 'data.form.appVersion') {
            return {
                errorPath: 'data.other.error.appVersion',
                message: !option.value ? '请选择版本号' : ""
            }
        } else if (option.path == 'data.form.dbVersion') {
            return {
                errorPath: 'data.other.error.dbVersion',
                message: !option.value ? '请选择数据库版本' : ""
            }
        } else if (option.path == 'data.form.dbHost') {
            return {
                errorPath: 'data.other.error.dbHost',
                message: !option.value ? '请录入数据库IP地址' : ""
            }
        } else if (option.path == 'data.form.dbPort') {
            return {
                errorPath: 'data.other.error.dbPort',
                message: !option.value ? '' : !/^\d+$/.test(option.value) ? "请输入数字" : (option.value > 65535 || option.value < 1) ? '范围1~65535' : ''
            }
        } else if (option.path == 'data.form.dbUsername') {
            return {
                errorPath: 'data.other.error.dbUsername',
                message: option.value ? '' : '请录入数据库账号'
            }
        } else if (option.path == 'data.form.dbPassword') {
            return {
                errorPath: 'data.other.error.dbPassword',
                message: option.value ? '' : '请录入数据库密码'
            }
        }
        if (option.path == 'data.form.bsAppHost') {
            return {
                errorPath: 'data.other.error.bsAppHost',
                message: !option.value ? '请录入服务IP地址' : ""
            }
        } else if (option.path == 'data.form.bsAppPort') {
            return {
                errorPath: 'data.other.error.bsAppPort',
                message: !option.value ? '' : !/^\d+$/.test(option.value) ? "请输入数字" : (option.value > 65535 || option.value < 1) ? '范围1~65535' : ''
            }
        }
        if (option.path == 'data.form.foreseeClientHost') {
            return {
                errorPath: 'data.other.error.foreseeClientHost',
                message: !option.value ? '请录入客户端IP地址' : ""
            }
        } else if (option.path == 'data.form.foreseeClientPort') {
            return {
                errorPath: 'data.other.error.foreseeClientPort',
                message: !option.value ? '必填' : !/^\d+$/.test(option.value) ? "请输入数字" : (option.value > 65535 || option.value < 1) ? '范围1~65535' : ''
            }
        } else if (option.path == 'data.form.appUserName') {
            return {
                errorPath: 'data.other.error.appUserName',
                message: option.value ? '' : '请录入登录账号'
            }
        }
        /*else if (option.path == 'data.form.appPassword') {
            return { errorPath: 'data.other.error.appPassword', message: option.value ? '' : '请录入登录密码' }
        }*/
        else if (option.path == 'data.form.appAccountNumber') {
            return {
                errorPath: 'data.other.error.appAccountNumber',
                message: option.value ? '' : '请选择登录账套号'
            }
        }
    }

    //点击更多
    moreClick = () => {
        const moreInfo = this.metaAction.gf('data.other.moreInfo');
        this.metaAction.sf('data.other.moreInfo', !moreInfo);
    }

    //查询账套
    handleBlur = async (e) => {
        const form = this.metaAction.gf('data.form').toJS();
        const action = this.metaAction.gf('data.other.action');
        const loading = this.metaAction.gf('data.loading');
        if (loading) return false

        if (action == 'add') {
            this.metaAction.sf('data.form.appAccountNumber', null);
        }

        let {
            dbHost,
            dbPort,
            dbUsername,
            dbPassword,
            appUserName,
            appPassword,
            foreseeClientHost,
            foreseeClientPort,
            bsAppHost,
            bsAppPort,
            appName,
            appVersion,
            dbVersion,
            appAccountNumber
        } = form;
        if (!appUserName) {
            this.metaAction.sfs({
                'data.form.appPassword': null,
                'data.other.accoutList': fromJS([]),
                'data.form.appAccountNumber': null,
            })
            return false
        }
        if (!dbHost) {
            dbHost = foreseeClientHost;
        }
        if (!bsAppHost) {
            bsAppHost = foreseeClientHost
        }
        this.metaAction.sf('data.loading', true);
        //获取账套
        let res = await this.webapi.tplus.common(`${document.location.protocol}//${foreseeClientHost}:${foreseeClientPort}/common/accountBooks/query`, {
            dbHost,
            dbPort,
            bsAppHost,
            bsAppPort,
            dbUsername,
            dbPassword,
            dbVersion,
            appName,
            appVersion,
            appUserName,
            appPassword: appPassword ? appPassword : '',
        }, this.getToken());
        this.metaAction.sf('data.loading', false);
        if (res && res.error) {
            this.metaAction.toast('error', res.error.message);

            return false
        } else if (res && res.result) {
            res.value = res.value || [];
            if (action == 'add') {
                this.injections.reduce('sfs', {
                    'data.other.accoutList': fromJS(res.value),
                    'data.form.appAccountNumber': res.value.length > 0 ? res.value[0].accNum : null
                })
                if (res.value.length > 0) {
                    this.metaAction.sf('data.other.error.appAccountNumber', null)
                }

                return true
            } else {
                const checkaccount = res.value.find(r => r.accNum == appAccountNumber);
                if (!checkaccount) {
                    const ret1 = await this.metaAction.modal('confirm', {
                        title: '提示',
                        width: 500,
                        // okText: '重新填写',
                        // cancelText: '取消修改',
                        content: <div>未查到绑定的原账套！请检查服务器地址是否正确</div>
                        ,
                    })

                    return false;
                }

                return true
            }
        } else {
            this.metaAction.toast('error', '连接服务失败：请检查配置软件是否正常启动');

            return false
        }

    }

    //下载软件
    downloadSoftware = () => {
        let foreseeClientDownloadAddress = this.metaAction.gf('data.other.foreseeClientDownloadAddress')
        if (foreseeClientDownloadAddress) {
            //client open
            if (environment.isClientMode()) {
                window.open(foreseeClientDownloadAddress, "_self")
            }
            else {
                var iframeObject = document.getElementById('downloadForeseeClient')
                if (iframeObject) {
                    iframeObject.src = foreseeClientDownloadAddress
                }
                else {
                    var iframe = document.createElement('iframe')
                    iframe.id = 'downloadForeseeClient'
                    iframe.frameborder = "0"
                    iframe.style.width = "0px"
                    iframe.style.height = "0px"
                    iframe.src = foreseeClientDownloadAddress
                    document.body.appendChild(iframe)
                }
            }
        }
    }

    //查看使用说明
    settingClick = async () => {
        const {
            appName
        } = this.metaAction.gf('data.form').toJS();
        const checkArr = [{
            path: 'data.form.appName',
            value: appName
        }]
        const ok = await this.voucherAction.check(checkArr, this.check)
        if (!ok) {
            this.metaAction.toast('warning', '请先选择财务软件')
            return false
        }

        if (appName == 'Tplus') {
            this.metaAction.modal('show', {
                title: 'T+对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-card', {
                    store: this.component.props.store,
                }),
            })
        } else if (appName == 'K3WISE') {
            this.metaAction.modal('show', {
                title: 'K3WISE对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-kthree', {
                    store: this.component.props.store,
                }),
            })
        } else if (appName == 'U8') {
            this.metaAction.modal('show', {
                title: 'U8对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-ueight', {
                    store: this.component.props.store,
                }),
            })
        } else if (appName === 'T3标准版') {
            this.metaAction.modal('show', {
                title: 'T3标准版对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-tthree', {
                    store: this.component.props.store,
                }),
            })
        }
        else if (appName === 'T3普及版') {
            this.metaAction.modal('show', {
                title: 'T3普及版对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-tthree-universal', {
                    store: this.component.props.store,
                }),
            })
        }
        else if (appName === 'T6') {
            this.metaAction.modal('show', {
                title: 'T6对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-tsix', {
                    store: this.component.props.store,
                }),
            })
        }
        else if (appName === 'KIS旗舰版') {
            this.metaAction.modal('show', {
                title: 'KIS旗舰版对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-kis-flagshipversion', {
                    store: this.component.props.store,
                }),
            })
        }
        else if (appName === 'KIS专业版') {
            this.metaAction.modal('show', {
                title: 'KIS专业版对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-kis-professionalversion', {
                    store: this.component.props.store,
                }),
            })
        }
        else if (appName === 'KIS商贸版') {
            this.metaAction.modal('show', {
                title: 'KIS商贸版对接财务账套使用说明',
                width: 600,
                wrapClassName: 'accountdescription',
                okText: '关闭',
                bodyStyle: {
                    padding: '5px 0',
                    fontSize: '12px'
                },
                children: this.metaAction.loadApp('app-scm-accountdescription-kis-businessversion', {
                    store: this.component.props.store,
                }),
            })
        }


        else {
            this.metaAction.toast('warning', `暂无${appName}使用说明`)
        }

    }

    updateIp = () => {
        this.metaAction.sf('data.other.step', 1);
        this.metaAction.sf('data.other.action', 'update');
    }
    cancelUpdate = () => {
        this.metaAction.sf('data.other.step', 3);
        this.metaAction.sf('data.other.action', 'add');
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({
            ...option,
            metaAction
        }),
        o = new action({
            ...option,
            metaAction,
            voucherAction
        }),
        ret = {
            ...metaAction,
            ...voucherAction,
            ...o
        }
    metaAction.config({
        metaHandlers: ret
    })

    return ret
}