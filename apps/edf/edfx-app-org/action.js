import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import isEquall from 'lodash.isequal'
import { fromJS } from 'immutable'
import { Select, LoadingMask } from 'edf-component'
import { CryptoJS, string, environment } from 'edf-utils'
import { consts } from 'edf-consts'
import moment from 'moment'

const Option = Select.Option
let bakMetaAction = {}
let bakComponentProps = {}
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        if (option.metaAction) bakMetaAction = option.metaAction
        this.webapi = this.config.webapi
        this.getOrgForDevice = this.getOrgForDevice.bind(this)
    }


    onInit = async ({ component, injections }) => {
        this.component = component
        if (this.component) {
            bakComponentProps = this.component
        }
        this.injections = injections
        LoadingMask.show()
        injections.reduce('init')

        await this.initEnumData()
        this.onLoadReadDevice()
        
        this.load()

        this.selectOption = []
        this.timer = null

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.load)
        }

        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if (addTabsCloseListen) {
            addTabsCloseListen('edfx-app-org', this.hasModify)
        }

        let addTabChangeListen = this.component.props.addTabChangeListen
        if (addTabChangeListen) {
            addTabChangeListen('edfx-app-org', this.hasModify)
        }

        this.isSaving = false
        //判断是否需要跳转到第二个页签
        if (this.component.props.initData && this.component.props.initData.activeKey) {
            this.metaAction.sf('data.other.activeTabKey', this.component.props.initData.activeKey)
        }

        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        if (!!this.component.props.extraParams) {
            this.judgeBtnStatus({
                extraParams: this.component.props.extraParams
            })
        } else {
            this.metaAction.sf('data.other.batchDeclaration', undefined)
        }

        let urlParams = sessionStorage['appParams']
        if (urlParams) {
            let params = JSON.parse(sessionStorage['appParams'])['appParams']
            //判断是否从批量申报跳转过来
            if (params && params.extraParams && params.extraParams == 'fromBatchDeclaration') {
                this.metaAction.sf('data.other.batchDeclaration', 'fromBatchDeclaration')
            }
            // 判断是否从金财代账跳转过来
            if (params && params.sourceType == 'jcdz') {
                this.metaAction.sfs({
                    'data.other.isShowFirstTab': false,
                    'data.other.activeTabKey': '2',
                })
            }
        }
    }
    //判断返回批量申报和返回清册按钮的显示
    judgeBtnStatus = (data) => {
        this.metaAction.sf('data.other.batchDeclaration', data.extraParams)
    }

    renderSelectOption = (data) => {
        const arr = data.map(item => {
            return (
                <Option key={item.id} value={item.code}>
                    {item.name}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }

    onLoadReadDevice = () => {
        let _ieEnv = this.ieEnv()
        if (_ieEnv) {
            let usbDeviceID = document.querySelector("#usbDeviceID")
            if (!usbDeviceID) {
                var l = document.createElement("script")
                l.id = "usbDeviceID"
                l.src = "./vendor/plugin/XTXSuite_login.js"
                document.body.appendChild(l)
            }
        }

        //如果已验证过,不需要再次验证
    }

    /*弹出条件：北京，CA证书登录 */

    verifyCA = async () => {
        if (!this.component) {
            this.component = bakComponentProps
        }
        if (!this.metaAction) {
            this.metaAction = bakMetaAction
        }

        let verifycaModal = document.querySelector('.ttk-edf-app-org-verifyca')
        if (verifycaModal) return
        let ret = await this.metaAction.modal("show", {
            title: "请输入北京一证通密码",
            width: 652,
            height: 311,
            children: this.metaAction.loadApp("ttk-edf-app-org-verifyca", {
                store: this.component.props.store
            })
        })

        if (typeof (ret) == undefined) {
            ret = false
        }
        this.metaAction.sf("data.other.activeTabKey", "1")
        //更新content部分
        if (ret) {
            //this.load(1)
            //this.component.props.onPortalReload && this.component.props.onPortalReload("noReloadTplus")

            if (ret.nsrsbh) {
                let vatTaxpayerNum = this.metaAction.gf('data.basic.vatTaxpayerNum')
                //let name = this.metaAction.gf('data.basic.name')
                //强制更新纳税人识别号
                if (ret.nsrsbh != vatTaxpayerNum) {
                    this.metaAction.sf('data.basic.vatTaxpayerNum', ret.nsrsbh)
                }

                // if (orgName != name) {
                //     this.metaAction.sf('data.basic.name', orgName)
                // }
            }

            this.queryCAState()
            this.metaAction.sf('data.other.hasReadCA', true)
            this.readOrgInfoBtnState()
        }
        else {
            return
        }
    }

    getSelectOption = () => {
        return this.selectOption
    }

    load = async (data) => {
        const accountingStandardMap = new Map([
            [2000020001,2000020016 ],
            [2000020002, 2000020032]
        ])
        //验证是否能修改性质和准则
        let canModify = await this.webapi.org.modify()
        this.metaAction.sfs({
            'data.other.canModify': canModify
        })
        //初始化数据
        const initData = await this.webapi.org.query()
        //会计准则精简处理
        if(initData[0].applySimplyAccountingStandards) initData[0].accountingStandards = accountingStandardMap.get(initData[0].accountingStandards)
        //判断登录方式是否需要调取读取CA接口
        if (initData[0] && initData[0].dlxxDto && initData[0].dlxxDto.DLFS && initData[0].dlxxDto.DLFS == 1) {
            let res = await this.webapi.CAState.queryCAState()
            initData[0].dlxxDto.caState = res

            initData[0].ieEnv = this.ieEnv()
        }
        //ca过期参数
        let caExpireDate = this.component.props.caExpireDate
        if (!!caExpireDate) {
            let appVersion = this.metaAction.gf('data.appVersion')
            this.metaAction.sf('data.other.caExpireDate', moment(caExpireDate).format('LL'))
            if (appVersion == 105) {
                if (new Date(caExpireDate).getTime() - Date.now() < 2592000000) {
                    this.metaAction.sf('data.other.caExpire', true)
                }
            }
        }
        //data: 1 重新初始化  2 保存信息
        if (!!data && !data.size) {
            this.injections.reduce('load', initData[0], data)
        } else {
            this.injections.reduce('load', initData[0])
        }

        //山东判断时候读取过CA
        if (initData[0] && initData[0].dlxxDto  && initData[0].dlxxDto.SS == 37) {
            let res = await this.webapi.CAState.queryCAState()
            if(true) {
                this.metaAction.sfs({
                    'data.other.CAStep': false,
                    'data.other.hasReadCA': true
                })
            }
        }

        this.metaAction.sf('data.copyBasic', this.metaAction.gf('data.basic'))
        this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
        this.metaAction.sf('data.copyNsxxInfo', this.metaAction.gf('data.nsxxInfo'))
        this.metaAction.sf('data.copyFinanceReportSettingDto', this.metaAction.gf('data.financeReportSettingDto'))
        this.metaAction.sf('data.orgId',  initData[0].id)

        if (!!data && data.size) {
            let key = data.toJS()
            this.metaAction.sf('data.other.activeTabKey', (key.initData && key.initData.activeKey) || '1')
            this.judgeBtnStatus(key)
        }
        this.metaAction.sf('data.inputReadOnly', false)
        this.getSfzxx();
        LoadingMask.hide()
    }
    //判断界面是否有修改
    hasModify = () => {
        let activeTabIndex = this.metaAction.gf('data.other.activeTabKey'),
            basic = this.metaAction.gf('data.basic'),
            nsxxDto = this.metaAction.gf('data.nsxxDto'),
            copyBasic = this.metaAction.gf('data.copyBasic'),
            copyNsxxDto = this.metaAction.gf('data.copyNsxxDto')

        if (isEquall(basic, copyBasic) && isEquall(nsxxDto, copyNsxxDto) ) {
            return false
        } else {
            return true
        }
    }
    //判断界面是否有修改
    hasModifyInside = () => {
        let activeTabIndex = this.metaAction.gf('data.other.activeTabKey'),
            basic = this.metaAction.gf('data.basic'),
            nsxxDto = this.metaAction.gf('data.nsxxDto'),
            nsxxInfo = this.metaAction.gf('data.nsxxInfo'),
            financeReportSettingDto = this.metaAction.gf('data.financeReportSettingDto'),
            copyBasic = this.metaAction.gf('data.copyBasic'),
            copyNsxxDto = this.metaAction.gf('data.copyNsxxDto'),
            copyNsxxInfo = this.metaAction.gf('data.copyNsxxInfo'),
            copyFinanceReportSettingDto = this.metaAction.gf('data.copyFinanceReportSettingDto');

        // if(copyBasic==undefined){
        //     return true
        // }
        if (activeTabIndex == 3 || activeTabIndex == 4) {
            return false
        }
        if (activeTabIndex == 1) {
            return isEquall(basic, copyBasic) ? false : true
        } else if (activeTabIndex == 2) {
            return isEquall(nsxxDto, copyNsxxDto) ? false : true
        } else if (activeTabIndex == 5) {
            return isEquall(financeReportSettingDto, copyFinanceReportSettingDto) ? false : true
        } else if (activeTabIndex == 6) {
            return isEquall(nsxxInfo, copyNsxxInfo) ? false : true
        }
    }
     //证件类型：200031；城建税类型：200032；企业类型：200033；预缴方式：200034；纳税期限：200022；税种：200035
    initEnumData = async () => {
        const enumIdList = {
            enumIdList: ['200001', '200002','200022', '200035','200016','200027','200036']
        }
        let res = await this.webapi.getEnumData.basicEnum(enumIdList)
        let ss = await this.webapi.getEnumData.ss({ visible: true })
        let basicEnum = {
            vatTaxpayer: res['200001'],
            accountingStandards: res['200002'],
            'SS': ss,
            'DLFS': [{ id: '1', name: 'CA证书' }, { id: '2', name: '用户名密码登录' }, { id: '3', name: '实名制登录' }, { id: '4', name: '证件登录' }, { id: '5', name: '手机号密码登录' }, { id: '6', name: '手机号验证码登录' }],
            'NSQX':res['200022'],
            'SZ':res['200035'],
            IDType:res['200016'],
            durings:res['200027'],
            sfType:res['200036']
        }
        this.metaAction.sfs({
            'data.enumData.basic': fromJS(basicEnum)
        })
        this.metaAction.sf('data.enumIdList', fromJS({'NSQX':res['200022'],'SZ':res['200035']}))
        let bsxldms = await this.webapi.getEnumData.queryReportSettingCode({ isEnabled: "1" })
        let rules = await this.webapi.getEnumData.kjzzQueryKjzz({ })
        let durings = res['200027']
        let IDType = res['200016']//证件类型
        durings = durings.filter( item => {
            return (item.name.indexOf('季')>=0 || item.name.indexOf('月')>=0 )
        })
        this.metaAction.sfs({
            'data.other.types': fromJS(bsxldms),
            'data.other.rules': fromJS(rules),
            'data.other.durings': fromJS(durings),
            'data.other.IDType':fromJS(IDType)
        })
        this.initTaxEnumData()
    }

    getLoginMode = (loginType) => {
        //登录方式
        let loginModeList = [],
            arr = loginType.split(',')
        for (let i = 0; i < arr.length; i++) {
            switch (arr[i]) {
                case '1':
                    loginModeList.push({ id: '1', name: 'CA证书' })
                    break
                case '2':
                    loginModeList.push({ id: '2', name: '用户名密码登录' })
                    break
                case '3':
                    loginModeList.push({ id: '3', name: '实名制登录' })
                    break
                case '4':
                    loginModeList.push({ id: '4', name: '证件登录' })
                    break
                case '5':
                    loginModeList.push({ id: '5', name: '手机号密码登录' })
                    break
                case '6':
                    loginModeList.push({ id: '6', name: '手机号验证码登录' })
                    break
                default:
                    break
            }
        }
        return loginModeList;
    }

    initTaxEnumData = async () => {
        let taxEnum = await this.webapi.getEnumData.taxEnum()
        this.metaAction.sfs({
            'data.enumData.tax': fromJS(taxEnum)
        })
        this.renderSelectOption(taxEnum.SSHY.enumDetails)
    }
    handleTabChange = async (activeKey) => {
        let isModify = this.hasModifyInside(),
            currentKey = this.metaAction.gf('data.other.activeTabKey')
        if (isModify) {
            const ret = await this.metaAction.modal('confirm', {
                title: '提示',
                content: `当前数据尚未保存，还要切换页签吗？`,
            })
            if (!ret) {
                return
            }
        }
        if (currentKey == 1) {
            this.metaAction.sf('data.basic', this.metaAction.gf('data.copyBasic'))
        }
        if (currentKey == 2) {
            this.metaAction.sf('data.nsxxDto', this.metaAction.gf('data.copyNsxxDto'))
        }
        if(activeKey == 5) {
            this.metaAction.sf('data.financeReportSettingDto', this.metaAction.gf('data.copyFinanceReportSettingDto'))
        }
        if(activeKey == 6) {
            this.metaAction.sfs({
                'data.nsxxInfo': this.metaAction.gf('data.copyNsxxInfo'),
                'data.error.taxInfo':fromJS({})
            });
            
        }
        this.metaAction.sf('data.other.activeTabKey', activeKey)
    }
    //保存基本信息
    saveBasicInfo = async () => {
        if (this.isSaving) return
        this.isSaving = true
        let basic = this.metaAction.gf('data.basic').toJS()
        let initState = this.metaAction.gf('data.initState').toJS()
        let isShowOtherMsg = this.metaAction.gf('data.other.isShowOtherMsg')
        if (isShowOtherMsg && initState.vatTaxpayerNum != basic.vatTaxpayerNum) {
            const res = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '修改纳税人识别号，纳税信息页签需要重新读取企业信息，是否确认修改？',
            })
            if (!res) {
                //还原值
                this.metaAction.sfs({
                    'data.basic.name': initState.name,
                    'data.basic.accountingStandards': initState.accountingStandards,
                    'data.basic.enableDate': initState.enableDate,
                    'data.basic.vatTaxpayer': initState.vatTaxpayer,
                    'data.basic.vatTaxpayerNum': initState.vatTaxpayerNum,
                    'data.basic.isSignAndRetreat': initState.isSignAndRetreat,
                    'data.basic.ss': initState.ss,
                    'data.basic.isTutorialDate': initState.isTutorialDate,
                    'data.basic. tutorialBeginDate': initState. tutorialBeginDate,
                    'data.basic.tutorialEndDate': initState.tutorialEndDate
                })
                this.isSaving = false
                return
            }
        }
        const info = await this.check([{
            path: 'data.basic.name', value: basic.name
        }, {
            path: 'data.basic.enableDate', value: basic.enableDate
        }, {
            path: 'data.basic.vatTaxpayerNum', value: basic.vatTaxpayerNum
        }, {
            path: 'data.basic.ss', value: basic.ss
        }, {
            path: 'data.basic.tutorialBeginDate', value: basic.tutorialBeginDate
        }, {
            path: 'data.basic.tutorialEndDate', value: basic.tutorialEndDate
        }], 'save')
        if (!info) {
            this.isSaving = false
            return
        }

        this.saveInfo(basic, 'reload')
    }
    saveInfo = async (basic, str) => {
        let params = {}
        params.name = basic.name.trim()
        params.accountingStandards = basic.accountingStandards
        params.enabledYear = basic.enableDate.split('-')[0]
        params.enabledMonth = basic.enableDate.split('-')[1]
        params.vatTaxpayerNum = basic.vatTaxpayerNum.trim()
        params.vatTaxpayer = basic.vatTaxpayer
        params.oldVatTaxpayerNum = basic.oldVatTaxpayerNum
        params.isTutorialDate = basic.isTutorialDate
        params.tutorialBeginDate = basic.tutorialBeginDate
        params.tutorialEndDate = basic.tutorialEndDate
        // params.isSignAndRetreat = basic.isSignAndRetreat
        // params.SS = basic.ss
        // let dkswjgshEnum = this.metaAction.gf('data.enumData.dkswjgshEnum')
        // if (dkswjgshEnum.indexOf(basic.ss) > -1) {
        //     params.dkswjgsh = basic.dkswjgsh
        // } else {
        //     params.dkswjgsh = ''
        // }
        //个税申报密码
        params.dlxxDto = {
            gssbmm: basic.gssbmm ? this.encryptByDES(basic.gssbmm, '3kingdom') : '',
            SS: basic.ss
        }
        if(basic.gssbmm) {
            let gssbmm = this.metaAction.gf('data.initState.gssbmm')
            if(gssbmm !== basic.gssbmm) {
                params.dlxxDto.gssbmm = this.encryptByDES(basic.gssbmm, '3kingdom')
            }else {
                params.dlxxDto.gssbmm = basic.gssbmm
            }
        }
        if (params.vatTaxpayer == '2000010002') {
            params.isSignAndRetreat = false
        } else if (params.vatTaxpayer == '2000010001') {
            params.isSignAndRetreat = true
        }
        params.ts = basic.ts
        const response = await this.webapi.org.saveBasicInfo(params)
        if (response) {
            if (str == 'reload') {
                this.metaAction.toast('success', '保存成功')
                this.load(2)
                this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
            }
            this.metaAction.sf('data.initState.name', params.name)
        } else {
            this.metaAction.toast('error', '保存失败')
        }
        this.isSaving = false
    }
    readFinanceInfo2 = async ({hideMessage, activeKey}) => {
        let resTime = await this.webapi.org.getSystemDate({}),
            resJd,
            data = {},
            itemLists = ['accountingStandardsId', 'reportingCategoryCode', 'reportingPeriod' ],
            form = {},
            reportingCategoryCodes,
            period,
            orgId = this.metaAction.gf('data.orgId')
            if( resTime ) {
                let year = resTime.split('-')[0],
                    month = parseInt(parseInt(resTime.split('-')[1])-1)
                if( month == 1 ) {
                    period = parseInt(year-1) + '-12' 
                } else {
                    period = year + '-' +(month<10?'0'+month:month)
                }
            }
            LoadingMask.show()
            resJd = await this.webapi.org.getRecord4XDZ({ "sssqQ": period,"sssqZ":period,orgId: orgId })
            LoadingMask.hide()
        //                 1、	取数：从局端获取备案信息
        // 如接口有返回会计制度准则，但是资料报送小类返回的是空值，则根据资料报送小类对照表带出。
        // 资料报送小类对照表，以电局的为准。
        let cwkjzdGridlb = resJd && resJd.cwkjzdGrid && resJd.cwkjzdGrid.cwkjzdGridlb && resJd.cwkjzdGrid.cwkjzdGridlb.length && resJd.cwkjzdGrid.cwkjzdGridlb[0]
        if( this.getCanEditSS() ) {//可编辑
            if( resJd ) {//取到局端数据
                if( cwkjzdGridlb &&  cwkjzdGridlb.kjzdzzDm ) {
                    //返回 财务会计制度准则
                    form.accountingStandardsId = cwkjzdGridlb.kjzdzzDm
                }
                if( cwkjzdGridlb && cwkjzdGridlb.zlbsxlDm ) {
                    //返回 资料报送小类
                    form.reportingCategoryCode = cwkjzdGridlb.zlbsxlDm
                }
            }
        } else { // 不可编辑
            if( resJd ) {//取到局端数据
                if( cwkjzdGridlb &&  cwkjzdGridlb.kjzdzzDm ) {
                    //返回 财务会计制度准则
                    form.accountingStandardsId = cwkjzdGridlb.kjzdzzDm
                }
                if( cwkjzdGridlb && cwkjzdGridlb.zlbsxlDm ) {
                    //返回 资料报送小类
                    form.reportingCategoryCode = cwkjzdGridlb.zlbsxlDm
                }
            }
        }
        form.accountingStandardsId = form.accountingStandardsId ? form.accountingStandardsId + '' : form.accountingStandardsId
        data['data.financeReportSettingDto']= fromJS(form || {})
        data['data.copyFinanceReportSettingDto']= fromJS(form || {})
        if(activeKey) data['data.other.activeTabKey']= activeKey
        itemLists.map( item => {
            this.setTab4Check( 'data.financeReportSettingDto.'+item, form[item], data )
        })
        this.metaAction.sfs( data )
        if( !hideMessage ) {
            if( !resJd ) {
                this.metaAction.toast('error', '刷新失败')
            } else {
                this.metaAction.toast('success', '刷新成功')
            }
        }
    }

    setTab4Field = ( path, value ) => {
        let data = {
            [path]: value
        },
        types = this.metaAction.gf('data.other.types').toJS()
        data = this.setTab4Check( path, value, data )
        if( path == 'data.financeReportSettingDto.reportingCategoryCode' && value ) {
            types.map( item => {
                if( item.reportingCategoryCode == value ) {
                    data['data.financeReportSettingDto.accountingStandardsId'] = item.accountingStandardCode
                    data = this.setTab4Check( 'data.financeReportSettingDto.accountingStandardsId', item.accountingStandardCode, data )

                }
            })
        }
        this.metaAction.sfs(data)        
    }

    setTab4Check = ( path, value, data ) => {
        let errors = {
            'data.financeReportSettingDto.accountingStandardsId': {
                message: '财务会计制度准则不能为空',
                path: 'data.error.accountingStandardsId'
            },
            'data.financeReportSettingDto.reportingCategoryCode': {
                message: '资料报送小类不能为空',
                path: 'data.error.reportingCategoryCode'
            },
            'data.financeReportSettingDto.reportingPeriod': {
                message: '报送期间不能为空',
                path: 'data.error.reportingPeriod'
            }
        }
        if( !value ) {
            data[ errors[path].path ] = errors[path].message
        } else {
            data[ errors[path].path ] = ''

        }
        return data
    }

    // 读取财务报表信息
    readFinanceInfo = async ({hideMessage, activeKey}) => {
        let orgId = this.metaAction.gf('data.orgId')
        let res = await this.webapi.org.queryReportSetting({orgId: orgId}),
            data = {},
            itemLists = ['accountingStandardsId', 'reportingCategoryCode', 'reportingPeriod' ],
            form = {};
        res.accountingStandardsId = res.accountingStandardsId ? res.accountingStandardsId + '' : res.accountingStandardsId
        data['data.financeReportSettingDto']= fromJS(res || {})
        data['data.copyFinanceReportSettingDto']= fromJS(res || {})
        if(activeKey) data['data.other.activeTabKey']= activeKey
        itemLists.map( item => {
            this.setTab4Check( 'data.financeReportSettingDto.'+item, res[item], data )
        })
        this.metaAction.sfs( data )
        if( !hideMessage ) {
            if( !res ) {
                this.metaAction.toast('error', '刷新失败')
            } else {
                this.metaAction.toast('success', '刷新成功')
            }
        }
    }
    //保存财务报表信息
      saveFinanceInfo = async () => {
        let finance = this.metaAction.gf('data.financeReportSettingDto').toJS(),
            errors = this.metaAction.gf('data.error').toJS(),
            orgId = this.metaAction.gf('data.orgId')

        if( errors.accountingStandardsId || errors.reportingCategoryCode || errors.reportingPeriod ) {
            return
        }
        finance.orgId = orgId;
        const res = await this.webapi.org.modifyReportSetting(finance)
        if (res) {
            this.metaAction.sf('data.copyFinanceReportSettingDto', this.metaAction.gf('data.financeReportSettingDto'))
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
        }
    }

    //保存企业信息
    saveOrgInfo = async () => {
        let orgInfo = this.metaAction.gf('data.nsxxDto').toJS(),
            error = this.metaAction.gf('data.error.orgInfo').toJS(),
            orgId = this.metaAction.gf('data.orgId');
        for (let i in error) {
            if (error[i] != undefined) return
        }
        if(!!orgInfo.ZCZB) {
            orgInfo.ZCZB = this.clearThousandsPosition(orgInfo.ZCZB)
        }
        orgInfo.orgId = orgInfo.orgId ? orgInfo.orgId : orgId;
        const response = await this.webapi.org.saveOrgInfo(orgInfo)
        if (response) {
            this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
        }
    }
    fieldChange = (fieldPath, value, operate) => {
        this.check([{ path: fieldPath, value }], operate)
    }
    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        let checkResults = []
        for (let o of fieldPathAndValues) {
            let r = { ...o },
            isDigit = /^[0-9]*$/;
            switch (o.path) {
                case 'data.basic.name':
                    Object.assign(r, await this.checkOrgName(o.value, operate))
                    break
                case 'data.basic.enableDate':
                    Object.assign(r, await this.enableDate(o.value))
                    break
                case 'data.basic.vatTaxpayerNum':
                    Object.assign(r, await this.vatTaxpayerNum(o.value, operate))
                    break
                case 'data.basic.ss':
                    Object.assign(r, this.ss(o.value))
                    break
                case 'data.basic.dkswjgsh':
                    Object.assign(r, this.dkswjgsh(o.value))
                    break
                case 'data.basic.isTutorialDate':
                    Object.assign(r, { errorPath: 'data.error.fdq', message: o.value ? this.metaAction.gf('data.error.fdq')  : undefined })
                    break
                case 'data.basic.tutorialBeginDate':
                    Object.assign(r,await this.checkFDQdateStart(o.value))
                    break
                case 'data.basic.tutorialEndDate':
                    Object.assign(r,await this.checkFDQdateEnd(o.value))
                    break
                case 'data.basic.sjhm':
                    Object.assign(r,await this.checkMobile(o.value))
                    break
                case 'data.basic.sflx':
                    Object.assign(r, { errorPath: 'data.error.sflx', message: o.value ? undefined  : '请选择身份类型' })
                    break 
                case 'data.nsxxInfo.YHZH':
                    Object.assign(r, { errorPath: 'data.error.taxInfo.YHZH', message: (o.value && (o.value.length > 20  || !(isDigit.test(o.value)))) ? '只能为数字长度为20' : undefined })
                    break
                case 'data.nsxxInfo.BSY_SFZJHM':
                    Object.assign(r, await this.checkID(o.value,o.path))
                    break
                case 'data.nsxxInfo.FDFZR_SFZJHM':
                    Object.assign(r, await this.checkID(o.value,o.path))
                    break
                case 'data.nsxxInfo.BSY_TEL':
                    Object.assign(r,await this.checkConact(o.value,o.path))
                    break
                case 'data.nsxxInfo.FDFZR_TEL':
                    Object.assign(r,await this.checkConact(o.value,o.path))
                    break
                default:
                    break
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
    checkOrgName = async (name, operate) => {
        var message
        let currentName = this.metaAction.gf('data.initState.name')
        if ((name && name.trim()) == currentName)
            return { errorPath: 'data.error.name', message }
        if (operate && (operate == 'save' || operate == 'blur')) {
            if (!name) {
                message = '请输入企业名称'
            } else if (await this.webapi.org.existsSysOrg({ 'name': name.trim() })) {
                return { errorPath: 'data.error.name', message: "该企业名称已注册" }
            }
        }
        if (name.length <= 200 && name != '')
            return { errorPath: 'data.error.name', message }
        else if (!name)
            message = '请输入企业名称'
        else if (name.length > 200)
            message = "企业名称不能超过200个字"
        return { errorPath: 'data.error.name', message }
    }
    enableDate = async (enableDate) => {
        var message
        let currentEnableDate = this.metaAction.gf('data.initState.enableDate')
        if (enableDate == currentEnableDate) {
            return { errorPath: 'data.error.enableDate', message }
        }
        if (!enableDate) {
            return { errorPath: 'data.error.enableDate', message: '请选择启用时间' }
        }

        const obj = {}
        obj.toYear = enableDate.split('-')[0]
        obj.toMonth = Number(enableDate.split('-')[1])
        const res = await this.webapi.org.updatePeriod(obj)
        if (res.result) {
            message
        } else if (!res.result) {
            message = res.error.message
        }
        return { errorPath: 'data.error.enableDate', message }
    }
    vatTaxpayerNum = async (vatTaxpayerNum, operate) => {
        var message
        vatTaxpayerNum = vatTaxpayerNum && vatTaxpayerNum.trim()
        if (!vatTaxpayerNum) {
            message = '请输入纳税人识别号'
            return { errorPath: 'data.error.vatTaxpayerNum', message }
        }
        let res = await this.webapi.org.validevatTaxpayerNum({ vatTaxpayerNum })
        if (res.state) {
            message = ''
        } else {
            message = res.message
        }

        // if (!vatTaxpayerNum)
        //     message = '请输入纳税人识别号'
        // else if (vatTaxpayerNum.length <=14) {
        //     if(operate && (operate == 'save')) {
        //         message = "纳税人识别号位数错误"
        //     }else {
        //         message = undefined
        //     }
        // }else if(vatTaxpayerNum.length > 14 && vatTaxpayerNum.length !== 15 && vatTaxpayerNum.length !== 18 && vatTaxpayerNum.length !== 20)
        //     message = "纳税人识别号位数错误"
        // else if(vatTaxpayerNum.length > 20)
        //     message = "纳税人识别号不能超过20个字"
        return { errorPath: 'data.error.vatTaxpayerNum', message }
    }
    checkMobile = async (mobile) => {
        var message;
        if(!mobile) {
            message =  '请输入手机号'
            return { errorPath: 'data.error.sjhm', message }
        } 
        mobile = string.trim(mobile)
        if (mobile.length != 11) {
            message = '请输入正确的手机号'
        } else if (mobile.length == 11) {
            if (!/^1[3456789]\d{9}$/.test(mobile)) {
                message = '请输入正确的手机号'
                return { errorPath: 'data.error.sjhm', message }
            }
        }
        return { errorPath: 'data.error.sjhm', message }
    }
    ss = (name) => {
        let message
        if (!name)
            message = '请选择省市'
        return { errorPath: 'data.error.ss', message }
    }
    dkswjgsh = (dkswjgsh) => {
        let message
        if (/[`~!@#$%^&*()_\-=+<>?:"{},.\/;'[\] ]|[\u4e00-\u9fa5]/.test(dkswjgsh) || /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im.test(dkswjgsh))
            message = "代开税务机关税号格式错误"
        return { errorPath: 'data.error.dkswjgsh', message }
    }
    checkID = (value,path) =>{
        let message;
        if (value.length > 18 || !(/^[A-Za-z0-9]+$/.test(value)))
            message = "1-18位必须是字母或数字"
        return { errorPath: 'data.error.taxInfo.' + path.split('.')[2], message }
    }
    checkConact = (value,path) => {
        let message;
        if (value.length > 15 || !(/^1[3456789]\d{9}$/.test(value) || /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value)))
            message = "联系方式格式有误"
        return { errorPath: 'data.error.taxInfo.' + path.split('.')[2], message }
    }
    //校验非必填字段
    checkNotRequire = (length, str, value, field) => {
        let path;
       if(str.indexOf('orgInfo') > -1){
            path = str.replace('error.orgInfo', 'nsxxDto')
       }else{
            path = str.replace('error.taxInfo', 'nsxxInfo')
       }
        var message
        if (value.length > length)
            message = field + "不能超过" + length + "个字"
        this.metaAction.sfs({
            [path]: value,
            [str]: message
        });
    }
    zczb = (value) => {
        value = this.clearThousandsPosition(value)
        value = this.addThousandsPosition(value, true)
        this.metaAction.sf('data.nsxxDto.ZCZB', value)
    }
    //判断读取按钮状态
    readOrgInfoBtnState = () => {
        let dlfs = this.metaAction.gf('data.basic.dlfs'),
            ss = this.metaAction.gf('data.basic.ss')
        if (!ss || !dlfs) {
            this.metaAction.sf('data.other.readOrgInfoBtn', true)
            return
        }
        if (dlfs != 1) {
            let wbzh = this.metaAction.gf('data.basic.wbzh'),
                wbmm = this.metaAction.gf('data.basic.wbmm')
            if (!wbzh || !wbmm) {
                this.metaAction.sf('data.other.readOrgInfoBtn', true)
            } else {
                this.metaAction.sf('data.other.readOrgInfoBtn', false)
            }
        } else {
            let hasReadCA = this.metaAction.gf('data.other.hasReadCA')
            //client下不需要判断是不是read ca
            //if (environment.isClientMode()) hasReadCA = true
            if (hasReadCA) {
                this.metaAction.sf('data.other.readOrgInfoBtn', false)
            } else {
                this.metaAction.sf('data.other.readOrgInfoBtn', true)
            }
        }
    }
    //改变纳税人识别号
    handleNsrsbhChange = (value) => {
        //同步改变网报账号
        // this.metaAction.sfs({
        //     'data.basic.wbzh': value
        // })
        // this.check([{path: 'data.basic.vatTaxpayerNum', value}])
        this.metaAction.sf('data.basic.vatTaxpayerNum', value)
    }
    //失去焦点，改变ss
    handleNsrsbhBlur = async (value) => {
        let copyBasic = this.metaAction.gf('data.copyBasic').toJS()
        // if(copyBasic.vatTaxpayerNum != value && this.metaAction.gf('data.basic.oldVatTaxpayerNum')){
        //     const ret = await this.metaAction.modal('confirm', {
        //         width: 400,
        //         title: '提示',
        //         content: `修改纳税人识别号，将清空旧税号，是否继续`,
        //     })
        //     if (ret) {
        //         this.metaAction.sf('data.basic.oldVatTaxpayerNum', '')
        //     }else {
        //         this.metaAction.sf('data.basic.vatTaxpayerNum', copyBasic.vatTaxpayerNum)
        //         return false
        //     }
        // }
        if(copyBasic.vatTaxpayerNum != value){
            this.metaAction.sf('data.basic.oldVatTaxpayerNum', '')
        }
        if (!value) return
        value = string.trim(value)
        let res = await this.webapi.org.validevatTaxpayerNum({ vatTaxpayerNum: value })
        if (res.state) {
            this.metaAction.sf('data.error.vatTaxpayerNum', undefined)
        } else {
            this.metaAction.sf('data.error.vatTaxpayerNum', res.message)
            return
        }
        if (res && res.ss) {
            let ssEnumData = this.metaAction.gf('data.enumData.basic.SS').toJS()
            let id = null
            for (let i = 0; i < ssEnumData.length; i++) {
                if (ssEnumData[i].code == res.ss) {
                    id = ssEnumData[i].code
                    break
                }
            }
            if (!!id) {
                this.metaAction.sf('data.basic.ss', id)
                // let dkswjgshEnum = this.metaAction.gf('data.enumData.dkswjgshEnum')
                // if (dkswjgshEnum.indexOf(id) > -1) {
                //     this.metaAction.sfs({
                //         'data.other.showDkswjgsh': true,
                //         'data.basic.dkswjgsh': null,
                //     })
                // } else {
                //     this.metaAction.sf('data.other.showDkswjgsh', false)
                // }
                this.changeDlfs(id)
            }
        }
        // let wbzh = this.metaAction.gf('data.basic.wbzh')
        // if(!wbzh) {
        //     let dlfs = this.metaAction.gf('data.basic.dlfs')
        //     if(dlfs != 3) {
        //         this.metaAction.sf('data.basic.wbzh', value)
        //     }
        // }
        // let code = null
        // if(value.length == 15) {
        //     code = value.substr(0,2)
        // }else if(value.length == 18) {
        //     code = value.substr(2,2)
        // }
        // if(!!code) {
        //     let ss = this.metaAction.gf('data.enumData.basic.SS').toJS()
        //     let area = ss.find(o => o.code.substr(0,2) == code)
        //     if(!!area) {
        //         this.metaAction.sf('data.basic.ss', area.id)
        //         this.changeDlfs(area.id)
        //     }
        // }
    }
    //Select改变事件
    handleSelectChange = (path, value) => {
        switch (path) {
            case 'data.basic.dlfs':
                this.checkReadCAState(value)
                break
            case 'data.basic.ss':
                this.metaAction.sfs({
                    [path]: value,
                    'data.error.ss': undefined
                })
                this.changeDlfs(value)
                break
            default:
                break
        }
    }
    //获取省市code
    getSSCode = (value) => {
        let ss = this.metaAction.gf('data.enumData.basic.SS').toJS()
        let loginType = null
        for (let i = 0; i < ss.length; i++) {
            if (ss[i].code == value) {
                loginType = ss[i].loginType
                break
            }
        }
        return loginType
    }
     //获取上报方式类别
     getUploadType = (value) => {
        let ss = this.metaAction.gf('data.enumData.basic.SS').toJS()
        let uploadType = null
        for (let i = 0; i < ss.length; i++) {
            if (ss[i].code == value) {
                uploadType = ss[i].uploadType
                break
            }
        }
        return uploadType
    }
    //根据省市改变登录方式及上报方式
    changeDlfs = (value) => {
        let unNetAccountArea = []  //32
        if (unNetAccountArea.indexOf(value) > -1) {
            this.metaAction.sf('data.other.isNetAccount', true)
        } else {
            this.metaAction.sf('data.other.isNetAccount', false)
        }
        clearTimeout(this.timer)
        let loginType = this.getSSCode(value)
        let uploadType = this.getUploadType(value)
        //登录方式
        let loginModeList = this.getLoginMode(loginType)
        let id = this.metaAction.gf('data.basic.dlfs')
        let flag = {}
        if (!!id) {
            flag = loginModeList.find(o => o.id == id) || {}
        }
        this.metaAction.sfs({
            'data.enumData.basic.DLFS': fromJS(loginModeList),
            'data.basic.dlfs': flag.id || (value == '44' && '3') || (value == '11' && '1'),
            'data.uploadType':uploadType
        })
        if (!id && value == '11')
            this.checkReadCAState(1)
        this.readOrgInfoBtnState()
    }
    //隐藏打开CA登录步骤
    changeCAStep = () => {
        this.metaAction.sf('data.other.CAStep', !this.metaAction.gf('data.other.CAStep'))
    }

    caToolsInfo = () => {
        return !this.ieEnv()
    }

    getOrgListByDevice = () => {
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
                    }
                }
            }
        }
        return usbKeyDevice
    }

    //设备插拔时的回调函数
    getOrgForDevice = () => {
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
                    }

                }
            }
        }
        if (this.metaAction.gf('data.basic.dlfs') == 1 && this.ieEnv()) {
            if (usbKeyDevice.length > 0) {
                let hasReadCA = this.metaAction.gf('data.other.hasReadCA')
                if (!hasReadCA) {
                    this.verifyCA()
                    //清除提示语
                }
            } else {
                let hasReadCA = this.metaAction.gf('data.other.hasReadCA')
                if (!hasReadCA) {
                    this.metaAction.toast('error', '请插入北京数字一证通')
                }

            }
        }

    }

    InstallCA = () => {
        if (this.ieEnv()) {
            let orgList = this.getOrgListByDevice(),
                dlfs = this.metaAction.gf('data.basic.dlfs') == 1,
                hasReadCA = this.metaAction.gf('data.other.hasReadCA')
            if (hasReadCA) {
                return true
            }
            if (orgList && dlfs) {
                if (orgList.length == 0) {
                    return false
                }
            }
        }
        return true
    }

    IsChangeCA = () => {
        let readCA = this.metaAction.gf('data.other.hasReadCA')
        return readCA

        // if (this.ieEnv()) {
        //     readCA = this.InstallCA()
        // }
        // return readCA

    }
    //检查是否读取过CA
    checkReadCAState = async (value) => {
        clearTimeout(this.timer)
        if (value != 1) {
            this.metaAction.sf('data.basic.dlfs', String(value))
            this.readOrgInfoBtnState()
            return
        }
        let res = await this.webapi.CAState.queryCAState()

        let _ieEnv = this.ieEnv()
        if (_ieEnv) {
            this.metaAction.sfs({
                'data.basic.dlfs': '1',
                'data.basic.ieEnv': true,
                'data.other.CAStep': false,
                'data.other.hasReadCA': res
            })
            //alert(this.metaAction.gf('data.basic.dlfs'))
            if (this.InstallCA()) {
                this.verifyCA()
            }

        }
        else {
            this.metaAction.sfs({
                'data.basic.dlfs': '1',
                'data.other.CAStep': !res,
                'data.other.hasReadCA': res
            })
        }
        this.readOrgInfoBtnState()
    }
    //下载CA证书
    downloadCACertifacate = async () => {
        let platform = window.navigator.platform
        if (platform.toUpperCase().indexOf("WIN") == -1) {
            await this.metaAction.modal('warning', {
                content: 'CA登录只支持windows系统',
                title: '提示',
                okText: '确定'
            })
            return
        }
        let url = await this.webapi.CAState.getToolUrl()
        // if (url) {
        //     window.open(url)
        // }
        if (url) {
            var iframeObject = document.getElementById('downloadExe');
            if (iframeObject) {
                iframeObject.src = url;
            }
            else {
                var iframe = document.createElement('iframe');
                iframe.id = 'downloadExe';
                iframe.frameborder = "0";
                iframe.style.width = "0px"
                iframe.style.height = "0px"
                iframe.src = url;
                document.body.appendChild(iframe);
            }

        }

        // window.open("https://ttk-dev.oss-cn-beijing.aliyuncs.com/DOWNLOAD/CATool.exe")
    }
    //打开dlfs判断省市
    onDlfsSelectChange = () => {
        let ss = this.metaAction.gf('data.basic.ss')
        let loginType = this.getSSCode(ss)
        //登录方式
        let loginModeList = this.getLoginMode(loginType)
        this.metaAction.sf('data.enumData.basic.DLFS', fromJS(loginModeList))
    }
    //更换ca证书
    changeCA = async () => {
        let platform = window.navigator.platform
        if (platform.toUpperCase().indexOf("WIN") == -1) {
            await this.metaAction.modal('warning', {
                content: 'CA登录只支持windows系统',
                title: '提示',
                okText: '确定'
            })
            return
        }
        const result = await this.metaAction.modal('confirm', {
            title: '提示',
            content: 'CA证书已读取，更换证书将清空之前读取的企业信息，是否确认更换CA证书？',
        })
        if (result) {
            if (this.ieEnv()) {
                this.verifyCA()
            }
            else {
                this.openCATool()
            }

        }
    }

    ieEnv = () => {
        //return false
        // if (environment.isClientMode()) {
        //     return true
        // }
        let browser = getBrowserVersion();
        if (browser.ie && browser.version > 9) {
            return true
        }
        return false
    }

    openClientCATool = () => {
        let getCAINfo = {
            "appid": "JCGJWEB",
            "appName": "GetCAInfo"
        }
        let loginparam = JSON.stringify(getCAINfo)
        let CAInfo = _omni.container.sendmessagetocontainer(loginparam)
        //console.log(CAInfo)
        //CAInfo = { "appid": "JCGJKHD", "cainfo": "xxxxxxxxxxxxxxxxxxxxx" }
    }
    //唤起CA工具
    openCATool = async () => {
        clearTimeout(this.timer)

        let basic = this.metaAction.gf('data.basic').toJS()
        const info = await this.check([{
            path: 'data.basic.name', value: basic.name
        }, {
            path: 'data.basic.vatTaxpayerNum', value: basic.vatTaxpayerNum
        }, {
            path: 'data.basic.ss', value: basic.ss
        }], 'save')
        if (!info) {
            if (!basic.name || !basic.vatTaxpayerNum) {
                const res = await this.metaAction.modal('warning', {
                    title: '提示',
                    content: '请录入正确的纳税人识别号或企业名称',
                    okText: '确定'
                })

            }
            return
        }
        let vatTaxpayerNum = this.metaAction.gf('data.basic.vatTaxpayerNum'),
            ss = this.metaAction.gf('data.basic.ss'),
            areaCode = this.metaAction.gf('data.enumData.basic.SS').toJS(),
            name = this.metaAction.gf('data.basic.name'),
            area = null
        for (let i = 0; i < areaCode.length; i++) {
            if (ss == areaCode[i].code) {
                area = areaCode[i].name
                break
            }
        }
        // let a = document.createElement('a')
        // a.setAttribute('href', `ttk://nsrsbh:${vatTaxpayerNum}&qymc:${name}&token:${sessionStorage.getItem('_accessToken')}&shengshi:${area}`)
        // a.click()
        let a = document.querySelector('#caHype')
        let env = appBasicInfo.apiDomain + '/v1'
        if(env.indexOf('https') > -1) {
            env = env.replace('https', 'http')
        }
        a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}`)
        a.click()
        this.queryCAState()
    }

    queryCAState = async () => {
        //如果当前的登录方式为CA登录时轮询
        let result = await this.webapi.CAState.queryCAState()
        if (!result) {
            this.timer = setTimeout(this.queryCAState, 2000)
        } else {
            this.metaAction.sfs({
                'data.other.CAStep': false,
                'data.other.hasReadCA': true
            })
            this.readOrgInfoBtnState()
        }
    }
    //读取企业信息
    readOrgInfo = async (canChange) => {
        let isShowOtherMsg = this.metaAction.gf('data.other.isShowOtherMsg')
        if (isShowOtherMsg) {
            const result = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '重新读取企业信息后，采集发票或申报将以新读取的企业信息为准，是否确认修改？',
            })

            if (!result) {
                return
            }
        }
        let basic = this.metaAction.gf('data.basic').toJS()
        //处理四川数据
        if(basic.ss == 51){
            const scInfo = await this.check([{
                path: 'data.basic.sjhm', value: basic.sjhm
            }, {
                path: 'data.basic.sflx', value: basic.sflx
            },], 'save')
            if (!scInfo) return
        }
        const info = await this.check([{
            path: 'data.basic.name', value: basic.name
        }, {
            path: 'data.basic.enableDate', value: basic.enableDate
        }, {
            path: 'data.basic.vatTaxpayerNum', value: basic.vatTaxpayerNum
        }, {
            path: 'data.basic.ss', value: basic.ss
            // }, {
            //     path: 'data.basic.dkswjgsh', value: basic.dkswjgsh
        }], 'save')
        if (!info) return
        let params = {
            DLFS: basic.dlfs,
            NSRSBH: basic.vatTaxpayerNum.trim(),
            QYMC: basic.name,
            SS: basic.ss,
        }
        if(basic.ss == 51){
            params.sflx = basic.sflx,
            params.sjhm = basic.sjhm
        }
        params.canChange = typeof canChange != 'object' ? canChange : false
        if (basic.isAuthorization != null) {
            params.isAuthorization = basic.isAuthorization
        }
        if (basic.dlfs != 1) {
            params.DLZH = basic.wbzh.trim()
            let pwd = this.metaAction.gf('data.initState.pwd')
            if (pwd != basic.wbmm) {
                params.DLMM = this.encryptByDES(basic.wbmm, '3kingdom')
            } else {
                params.DLMM = basic.wbmm
            }
        }
        LoadingMask.show()
        //判断基本信息是否保存
        let isSave = this.isSaveBasicInfo(basic)
        if (!isSave) {
            await this.saveInfo(basic, 'notReload')
        }
        let res = null
        try {
            // let dkswjgshEnum = this.metaAction.gf('data.enumData.dkswjgshEnum')
            // if (dkswjgshEnum.indexOf(basic.ss) > -1) {
            //     res = await this.webapi.org.readOrgMessage({ dlxxDto: params, isReturnValue: true, dkswjgsh: basic.dkswjgsh })
            // } else {
            res = await this.webapi.org.readOrgMessage({ dlxxDto: params, isReturnValue: true })
            // }
        } catch (e) {
            this.metaAction.toast('error', '读取失败')
            this.metaAction.sf('data.copyBasic', this.metaAction.gf('data.basic'))
            this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
            LoadingMask.hide()
            this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
        }
        // const res = await this.webapi.org.readOrgMessage({dlxxDto: params, isReturnValue: true})
        LoadingMask.hide()
        if (res && !res.error) {
            if (this.metaAction.gf('data.other.isNetAccount')) {
                this.metaAction.toast('success', '验证成功，请手工完善企业信息')
            } else {
                if(basic.name != res.dlxxDto.QYMC) {
                    const result = await this.metaAction.modal('confirm', {
                        title: '提示',
                        content: '您读取的纳税人名称与企业名称不一致，是否自动修改企业名称使其与纳税人名称保持一致？',
                    })
                    if(result) {
                        const nameJudge = await this.webapi.org.existsSysOrg({ 'name': res.dlxxDto.QYMC.trim() })
                        if(nameJudge) {
                            await this.metaAction.modal('warning', {
                                content: '企业名称重复，无法修改',
                                title: '提示',
                                okText: '确定'
                            })
                        }else {
                            let params = {}
                            params.name = res.dlxxDto.QYMC
                            // params.ts = this.metaAction.gf('data.basic.ts')
                            await this.webapi.org.updateOrg(params)
                        }
                    }
                }
                this.metaAction.toast('success', '读取成功')
            }
            this.component.props.onPortalReload && await this.component.props.onPortalReload('noReloadTplus')
            this.component.props.onlyCloseContent('ttk-access-app-tranreport')
            this.load()
        } else if (!res.result) {
            if (res.error && res.error.code == "502021") {
                const result = await this.metaAction.modal('confirm', {
                    title: '提示',
                    content: '税局登记的纳税人性质与产品录入的纳税人性质必须一致才可读取企业信息，是否修改产品的纳税人性质使其一致？',
                })

                if (result) {
                    this.readOrgInfo(true)
                } else {
                    const result = await this.metaAction.modal('warning', {
                        title: '提示',
                        content: '税局登记的纳税人性质与产品录入的纳税人性质不一致，无法读取企业信息',
                        okText: '确定'
                    })
                    this.metaAction.sfs({
                        'data.other.isShowOtherMsg': false,
                        'data.nsxxDto': fromJS({})
                    })
                    this.metaAction.sf('data.copyBasic', this.metaAction.gf('data.basic'))
                    this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
                }
            } else if (res.error && res.error.code == "502022") {
                await this.metaAction.modal('error', {
                    content: '税局登记的纳税人性质与产品录入的纳税人性质不一致，请检查并修改登录账号或产品的纳税人性质',
                    title: '提示',
                    okText: '确定'
                })
                this.metaAction.sfs({
                    'data.other.isShowOtherMsg': false,
                    'data.nsxxDto': fromJS({})
                })
                this.metaAction.sf('data.copyBasic', this.metaAction.gf('data.basic'))
                this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
                return
            } else {
                this.metaAction.toast('error', res.error.message)
                this.metaAction.sfs({
                    'data.other.isShowOtherMsg': false,
                    'data.nsxxDto': fromJS({})
                })
                this.metaAction.sf('data.copyBasic', this.metaAction.gf('data.basic'))
                this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))
                this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
            }
        }
    }
    //判断基本信息是否保存
    isSaveBasicInfo = (basic) => {
        let initState = this.metaAction.gf('data.initState').toJS()
        let state = (basic.name == initState.name) &&
            (basic.accountingStandards == initState.accountingStandards) &&
            (basic.enableDate == initState.enableDate) &&
            (basic.vatTaxpayer == initState.vatTaxpayer) &&
            (basic.vatTaxpayerNum == initState.vatTaxpayerNum) &&
            (basic.ss == initState.ss) &&
            (basic.gssbmm == initState.gssbmm)

        // let dkswjgshEnum = this.metaAction.gf('data.enumData.dkswjgshEnum')
        // if (dkswjgshEnum.indexOf(basic.ss) > -1) {
        //     state = state && (basic.dkswjgsh == initState.dkswjgsh)
        // }
        return state
    }

    //加密
    encryptByDES = (message, key) => {
        let keyHex = CryptoJS.enc.Utf8.parse(key);
        let encrypted = CryptoJS.DES.encrypt(message, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }
    hideInfo = () => {
        this.metaAction.sf('data.other.detailInfo', !this.metaAction.gf('data.other.detailInfo'))
        setTimeout(() => {
            let scrollCon = document.querySelector('.edfx-app-org .ant-tabs-content')
            scrollCon.scrollTop = 308
        }, 0)

    }
    //资格认定，税费种信息
    //添加千分位
    addThousandsPosition = (input, isFixed) => {
        if (!input) return null
        if (isNaN(input)) return null
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
        return num.replace(regex, "$1,")
    }
    //去除千分位
    clearThousandsPosition(num) {
        if (num && num.toString().indexOf(',') > -1) {
            let x = num.toString().split(',')
            return parseFloat(x.join(""))
        } else {
            return num
        }
    }
    //时间格式化
    renderDate = (value) => {
        if (value) {
            let newDate = /\d{4}-\d{1,2}-\d{1,2}/g.exec(value)
            return newDate
        }
    }
    //列表中列字典项
    renderColValue = (value, list) => {
        const currentObj = list.find(o => o.code == value)
        return currentObj && currentObj.name
    }
    //重新初始化
    reinit = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '重新初始化',
            width: 652,
            height: 311,
            children: this.metaAction.loadApp('edfx-app-org-reinit', {
                store: this.component.props.store,
                origin: 'org'
            })
        })
        this.metaAction.sf('data.other.activeTabKey', '1')
        //更新content部分
        if (ret) {
            this.load(1)
            this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
            let closeApps = ['ttk-access-app-tranreport', 'ttk-taxcheckup-app-entrance', 'ttk-taxcheckup-app-checkresult', 'ttk-taxcheckup-app-checkresult', 'ttk-taxapply-app-taxlist', 'ttk-tax-app-additional', 'ttk-tax-app-generalvattaxpayer', 'ttk-tax-app-vattaxpayer']
            for (let i = 0; i < closeApps.length; i++) {
                this.component.props.onlyCloseContent(closeApps[i])
            }
        }
    }
    //过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
     //资料报送小类
    filterTypes = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    //帮助提示
    showHelpModal = async () => {
        const res = await this.metaAction.modal('show', {
            title: '代开税务机关税号提示',
            wrapClassName: 'dkswjgshHelp',
            children: (
                <div>
                    <p>1 录入代开税务机关税号以后，采集发票时将会采集该税务机关代开的发票</p>
                    <p>2 代开税务机关税号，具体取值见下图：</p>
                    <img style={{ width: '100%', height: '100%' }} src='./vendor/img/org/remind.jpg' />
                </div>
            ),
            // width: 500,
            // height: 250,
            okText: '关闭',
        })
    }
    //修改纳税人性质提示
    openConfirmInfo = async () => {
        const vatTaxpayer = this.metaAction.gf('data.basic.vatTaxpayer')
        const ret = await this.metaAction.modal('show', {
            title: '转换纳税人性质',
            width: 510,
            height: 314,
            wrapClassName: 'modifyNatureModal',
            okText: "下一步",
            children: this.metaAction.loadApp('ttk-edf-app-modify-nature', {
                store: this.component.props.store,
                vatTaxpayer,
            })
        })
        if(ret) {
            console.log('转换')
            LoadingMask.show()
            let params = {}
            if(vatTaxpayer == '2000010001') {
                params = {vatTaxpayer: '2000010002', isSignAndRetreat: false}
                params.ts = this.metaAction.gf('data.basic.ts')
                params.vatTaxpayerChangeState = 2
            }else if(vatTaxpayer == '2000010002') {
                params = {vatTaxpayer: '2000010001', isSignAndRetreat: true}
                params.ts = this.metaAction.gf('data.basic.ts')
                params.vatTaxpayerChangeState = 1
            }
            const result = await this.webapi.org.updateVat(params)
            if(result) {
                LoadingMask.hide()
                await this.load(2)
                this.component.props.onPortalReload && await this.component.props.onPortalReload('noReloadTplus')
                this.metaAction.toast('success','修改成功')
            }else {
                LoadingMask.hide()
                this.metaAction.toast('error','修改失败')
            }
        }
    }
    //返回清册
    backToTaxlist = () => {
        this.component.props.setPortalContent('申报缴款', 'ttk-taxapply-app-taxlist')
    }
    //返回批量申报
    backToBatchDeclaration = () => {
        this.component.props.setPortalContent('批量申报', 'ttk-dz-app-batchdeclaration', { extraParams: 'fromOrg' })
    }

    oldVatTaxpayerNum = async () => {
        const vatTaxpayerNum = this.metaAction.gf('data.basic.vatTaxpayerNum')
        if(!vatTaxpayerNum || vatTaxpayerNum && vatTaxpayerNum.length != 18){
            this.metaAction.toast('warning', '纳税人识别号为18位时，才可以录入旧税号');
            return false
        }
        let value = '按时打算'
        const ret = await this.metaAction.modal('show', {
            title: '请输入旧税号',
            children: this.metaAction.loadApp('app-card-oldTaxNum', {
                store: this.component.props.store,
                oldTaxNum: this.metaAction.gf('data.basic.oldVatTaxpayerNum'),
                vatTaxpayerNum
            }),
            width: 500,
            height: 350
        })
        if (ret) {
            if(ret === true){
                this.metaAction.sf('data.basic.oldVatTaxpayerNum', '')
            }else{
                this.metaAction.sf('data.basic.oldVatTaxpayerNum', ret)
            }

        }
    }

    // 网报账号 label
    internetAccountLabel = (dlfs) => {
        if(dlfs == 5){
            return '实名手机号'
        }
        return '网报账号'
    }

    // 网报 密码 label
    internetPasswordLabel = (dlfs) => {
        if(dlfs == 5){
            return '密码'
        }
        return '网报密码'
    }
    
    getCanEditSS = () => {
        let ss = this.metaAction.gf('data.basic.ss'),
            isShowOtherMsg = this.metaAction.gf('data.other.isShowOtherMsg'),
            canEdit = false;
        // 广东44：不允许修改，接口返回什么就显示什么，返回空，也显示空。
		// 福建35，陕西61，贵州52，北京11，青海63：可修改。
        if( ss == 44 && isShowOtherMsg) {
            canEdit = true
        } else {
            canEdit = false
        }
        return canEdit
    }
    //税种信息自动同步
    autoGetData = async()=>{
        let time = new Date();
        let year = time.getFullYear();
        let month = time.getMonth() > 10 ? time.getMonth() : '0' + time.getMonth();
        var myDate = new Date(year, month, 0).getDate()
        let firstDate = `${time.getFullYear()}-${month}-01`
        let lastDay = `${time.getFullYear()}-${month}-${myDate}`
        const ret = await this.metaAction.modal('confirm', {
			title: '自动同步',
			content: '正在同步需要申报的税费种信息，请等待结果，不要重复点击同步按钮！'
        });
        if (ret) {
            let option =  {
                  "sssqq":firstDate, //,--税款所属期起
                  "sssqz":lastDay, //--税款所属期止
                  isReturnValue:true
                },res;
            LoadingMask.show()
            try {
                res = await this.webapi.org.autoGetSfz(option)
                LoadingMask.hide()
            } catch (e) {
                this.metaAction.toast('error', '自动同步失败')
                LoadingMask.hide()
            }
            if(res&&res.error){
                this.metaAction.toast('error', '自动同步失败,请先同步企业信息')
            }else{
                this.getSfzxx()
            }
            // if(res&&res.list.length > 0 ){
                
            // }
        }
    }
    	//删除档案
	delClick = (name,id) => (e) => {
		this.del(name,id);
	};

	//批量删除
	// delClickBatch = () => {
	// 	let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
	// 	if (!selectedArrInfo.length) {
	// 		this.metaAction.toast('warning', '请选择客户');
	// 		return;
	// 	}
	// 	this.del(selectedArrInfo);
	// };

	del = async (name,id) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		});
		if (ret) {
            // let SBXM = list.SBXM;
            let response = await this.webapi.org.delNsxxInfo({'sbbDm':name,'id':id});
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message);
				});
			} else {
				this.metaAction.toast('success', '删除成功');
			}
			this.getSfzxx()
		}
	};
	//修改税务
	modifyDetail = (name,id) => (e) => {
		let taxTypeId = id ? id : null;
		this.add(name,taxTypeId);
	};

	//新增税务
	addClick = () => {
		this.add();
	};

	add = (name,id) => {
		let option = { title: '', appName: '', id: id, name: name };
		option.title = '税务信息';
        option.appName = 'ttk-edf-app-tax-type-change';
       
		this.addModel(option);
	};

	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			width:800,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
                taxTypeId: option.id,
                taxTypename: option.name
            })
            
        });
		if (ret) {
			this.getSfzxx()
		}
	};
    //保存税务信息
    saveTaxInfo = async () => {
        let taxInfo = this.metaAction.gf('data.nsxxInfo').toJS(),
            error = this.metaAction.gf('data.error.taxInfo').toJS()
        for (let i in error) {
            if (error[i] != undefined) {
                this.metaAction.toast('error', '请按页面提示修改信息后才可提交')
                return
            }
        }
        const response = await this.webapi.org.updateNsxxInfo(taxInfo)
        if (response) {
            this.metaAction.sf('data.copyNsxxInfo', this.metaAction.gf('data.nsxxInfo'))

            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
        }
    }
    //获取税种名称
    getIdName = (key,value) => {
        if(value == undefined || value == '') return;
        const enumIdList = this.metaAction.gf('data.enumIdList').toJS()
        let referList = enumIdList[key];
        let name = ''
        for (let i = 0; i < referList.length; i++) {
            if (value == referList[i].code ) {
                name = referList[i].name
                break
            }
        }
        return name
    }
    formatList = async (list) => {
        if(list.length > 0){
            list.map( item => {
               item.time = this.getIdName('NSQX',item.NSQXDM);
               item.name = this.getIdName('SZ',item.sbbDm);
            })
        } 
        list  = list.filter(item=>{
            return (item.name != ''&& item.name != undefined)
        })
        return list
    }
    //税务信息
    getSfzxx = async (page) => {
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
		}
		// const params = this.metaAction.gf('data.entity.fuzzyCondition')
		this.metaAction.sf('data.other.loading', true);
        let res = await this.getData(page, params);
        res.list = await this.formatList(res.list)
        this.injections.reduce('nsxxInfo', res);
        this.metaAction.sf('data.other.loading', false);
    };
    //获取税费种列表内容
	getData = async (pageInfo,params) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize
			},
			entity = {
                // SBXM:'',
                // SBPM:'',
                // id:''
			};
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}
		// if(params){
        //     entity.fuzzyCondition = params.fuzzyCondition;
        //     entity.propertyId = params.propertyId == undefined ? "" : params.propertyId;
        // }
        response = await this.webapi.org.querySfzxx({ page, entity });
		return response;
	};
    //分页修改
	// pageChanged = async (currentPage, pageSize) => {
	// 	if (pageSize == null || pageSize == undefined) {
	// 		pageSize = this.metaAction.gf('data.pagination')
	// 			.toJS().pageSize;
	// 	}
	// 	let page = { currentPage, pageSize };
	// 	this.getSfzxx(page);
        // let request = {
        //     moduleKey: 'app-list-inventory',
        //     resourceKey: 'app-list-inventory-grid',
        //     settingKey:"pageSize",
        //     settingValue:pageSize
        // }
        // this.webapi.setSetting([request])
	// };
    heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'app-list-customer-contentHeight';
		}
		return name;
    };
    
	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
    };
    // 检测辅导期开始日期
    checkFDQdateStart = async (start) => {
        var message
        let isEnable = this.metaAction.gf('data.basic.isTutorialDate')
        if(isEnable){
            if(!start){
                message = '辅导期开始日期不能为空'
            }
            return {errorPath: 'data.error.fdq', message}
        }
    }
    checkFDQdateEnd = async (end) => {
        var message
        // debugger
        let isEnable = this.metaAction.gf('data.basic.isTutorialDate')
        if(isEnable){
            if(!end){
                message = '辅导期截止日期不能为空'
            }
            // function duibi(a, b,flag) {
            let start = this.metaAction.gf('data.basic.tutorialBeginDate')
            // var arr = start.split("-");
            var starttime = new Date(start);
            var starttimes = starttime.getTime();
            // var arrs = end.split("-");
            var endTime = new Date(end);
            var endTimes = endTime.getTime();
            // 进行日期比较
            if (endTimes <= starttimes) {
                message = '辅导期截止日期不能小于或等于开始日期'
            }
            return {errorPath: 'data.error.fdq', message}
        }
    }
    // 清除定时器
    componentWillUnmount=()=>{
        clearTimeout(this.timer)
    }
    //停用行置灰
	isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'
}

//防止窗口弹出后，再关闭，会触发usb callback
//alert(SetOnUsbKeyChangeParentCallBack)

window.setTimeout(function () {
    if (typeof (SetOnUsbKeyChangeParentCallBack) == 'function' && !document.querySelector('.ttk-edf-app-org-verifyca')) {
        SetOnUsbKeyChangeParentCallBack(function () {
            const notifyParentClass = new action({})
            if (notifyParentClass) {
                notifyParentClass.getOrgForDevice()
            }
        })
    }
}, 2000)

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
