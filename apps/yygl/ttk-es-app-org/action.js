import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import isEquall from 'lodash.isequal'
import { fromJS } from 'immutable'
import { Select,DatePicker, Input, LoadingMask } from 'edf-component'
import { CryptoJS, string, environment } from 'edf-utils'
import utils from 'edf-utils'
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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init',component.props.initData)
        console.log('显示',component.props.initData)

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
            addTabsCloseListen('ttk-es-app-org', this.hasModify)
        }

        let addTabChangeListen = this.component.props.addTabChangeListen
        if (addTabChangeListen) {
            addTabChangeListen('ttk-es-app-org', this.hasModify)
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
                    'data.other.activeTabKey': '1',
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

    // verifyCA = async () => {
    //     if (!this.component) {
    //         this.component = bakComponentProps
    //     }
    //     if (!this.metaAction) {
    //         this.metaAction = bakMetaAction
    //     }

    //     let verifycaModal = document.querySelector('.ttk-edf-app-org-verifyca')
    //     if (verifycaModal) return
    //     let ret = await this.metaAction.modal("show", {
    //         title: "请输入北京一证通密码",
    //         width: 652,
    //         height: 311,
    //         children: this.metaAction.loadApp("ttk-edf-app-org-verifyca", {
    //             store: this.component.props.store
    //         })
    //     })

    //     if (typeof (ret) == undefined) {
    //         ret = false
    //     }
    //     this.metaAction.sf("data.other.activeTabKey", "1")
    //     //更新content部分
    //     if (ret) {
    //         //this.load(1)
    //         //this.component.props.onPortalReload && this.component.props.onPortalReload("noReloadTplus")

    //         if (ret.nsrsbh) {
    //             let vatTaxpayerNum = this.metaAction.gf('data.basic.vatTaxpayerNum')
    //             //let name = this.metaAction.gf('data.basic.name')
    //             //强制更新纳税人识别号 
    //             if (ret.nsrsbh != vatTaxpayerNum) {
    //                 this.metaAction.sf('data.basic.vatTaxpayerNum', ret.nsrsbh)
    //             }

    //             // if (orgName != name) {
    //             //     this.metaAction.sf('data.basic.name', orgName)
    //             // }
    //         }

    //         this.queryCAState()
    //         this.metaAction.sf('data.other.hasReadCA', true)
    //         this.readOrgInfoBtnState()
    //     }
    //     else {
    //         return
    //     }
    // }

    getSelectOption = () => {
        return this.selectOption
    }

    load = async (data) => {
        //验证是否能修改性质和准则
        // let canModify = await this.webapi.org.modify()
        // this.metaAction.sfs({
        //     'data.other.canModify': canModify
        // })
        //初始化数据
        const initData = await this.webapi.org.queryAllByOrgId({id:this.component.props.initData.orgId})

        // //data: 1 重新初始化  2 保存信息
        if (!!data && !data.size) {
            this.injections.reduce('load', initData[0], data)
        } else {
            this.injections.reduce('load', initData[0])
        }

        this.metaAction.sfs({
            'data.copyBasic': this.metaAction.gf('data.basic'),
            'data.copyNsxxDto': this.metaAction.gf('data.nsxxDto'),
            'data.copyZfjgInfo': this.metaAction.gf('data.zfjgInfo'),
        })
        // this.metaAction.sf('data.copyNsxxDto', this.metaAction.gf('data.nsxxDto'))

        if (!!data && data.size) {
            let key = data.toJS()
            this.metaAction.sf('data.other.activeTabKey', (key.initData && key.initData.activeKey) || '1')
            this.judgeBtnStatus(key)
        }
        this.metaAction.sf('data.inputReadOnly', false)
    }
    //判断界面是否有修改
    hasModify = () => {
        let activeTabIndex = this.metaAction.gf('data.other.activeTabKey'),
            basic = this.metaAction.gf('data.basic'),
            nsxxDto = this.metaAction.gf('data.nsxxDto'),
            copyBasic = this.metaAction.gf('data.copyBasic'),
            finance = this.metaAction.gf('data.finance'),
            copyNsxxDto = this.metaAction.gf('data.copyNsxxDto'),
            copyFinance = this.metaAction.gf('data.copyFinance'),
            zfjgInfo = this.metaAction.gf('data.zfjgInfo'),
            copyZfjgInfo = this.metaAction.gf('data.copyZfjgInfo')
    

        if (isEquall(zfjgInfo, copyZfjgInfo) && isEquall(basic, copyBasic) && isEquall(nsxxDto, copyNsxxDto) && isEquall(finance, copyFinance)) {
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
            copyBasic = this.metaAction.gf('data.copyBasic'),
            copyNsxxDto = this.metaAction.gf('data.copyNsxxDto'),
            copyFinance = this.metaAction.gf('data.copyFinance'),
            finance = this.metaAction.gf('data.finance'),
            zfjgInfo = this.metaAction.gf('data.zfjgInfo'),
            copyZfjgInfo = this.metaAction.gf('data.copyZfjgInfo')
        if (activeTabIndex == 3 || activeTabIndex == 2) {
            return false
        }
        if (activeTabIndex == 1) {
            return isEquall(nsxxDto, copyNsxxDto) ? false : true
        } else if( activeTabIndex == 4 ) {
            return isEquall(finance, copyFinance) ? false : true            
        } else if( activeTabIndex == 6 ) {
            return isEquall(zfjgInfo, copyZfjgInfo) ? false : true            
        }
    }
    initEnumData = async () => {
        // let bsxldms = await this.webapi.getEnumData.kjzzQuery({ })
        const enumIdList = {
            enumIdList: ['200001','200005','200013', '200034','200044', '200038','200039','200040','200041','200042','200043']
        }
        let types,subTypes,rules;
        let res = await this.webapi.getEnumData.basicEnum(enumIdList)
        let bsxldms = await this.webapi.getEnumData.queryReportSettingCode({ isEnabled: "1" })
        // let rules = await this.webapi.getEnumData.kjzzQueryKjzz({ })
        let durings = await this.webapi.getEnumData.enumDetailQuery({ "enumId":200027 })
        durings = durings.filter( item => {
            return (item.name.indexOf('季')>=0 || item.name.indexOf('月')>=0 )
        })
        rules = bsxldms.filter((item,index,self) =>
            index === self.findIndex((t)=>(
                t.accountingStandardCode === item.accountingStandardCode && t.accountingStandardName === item.accountingStandardName
            ))
        )
        types = bsxldms.filter((item,index,self) =>
            index === self.findIndex((t)=>(
                t.reportingCategoryCode === item.reportingCategoryCode && t.accountingStandardName === item.accountingStandardName
            ))
        )
        subTypes = bsxldms.filter((item,index,self) =>
            index === self.findIndex((t)=>(
                t.reportingSubCategoryCode === item.reportingSubCategoryCode && t.reportingCategoryName === item.reportingCategoryName
            ))
        )
        let basicEnum = {
            vatTaxpayer: res['200001'],
            'isSignAndRetreat': [{ id: '0', name: '是' ,code:true}, { id: '1', name: '否',code:false }],
            'ZFJGLX':res['200013'],
            'QYSDSYJFS':res['200034'],
            'QYSDSZSFS':res['200005'],
            'KDQSSZYQYLX':res['200038'],
            'HZNSQYJGLB':res['200039'],
            'JDJNBS':res['200040'],
            'HZQYFW':res['200041'],
            'HZQYLX':res['200042'],
            'SBJNFS':res['200043'],
            'HDZSFS':res['200044']
        }
        this.metaAction.sfs({
            'data.enumData.basic': fromJS(basicEnum)
        })
        this.metaAction.sfs({
            'data.other.types': fromJS(types),
            'data.other.copyTypes': fromJS(types),
            'data.other.subTypes': fromJS(subTypes),
            'data.other.CopySubTypes': fromJS(subTypes),
            'data.other.rules': fromJS(rules),
            'data.other.durings': fromJS(durings)
        })
        this.initTaxEnumData()
        console.log(types,'子类')
        console.log(subTypes,'小类')
        console.log(rules,'大类')
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
            this.metaAction.sf('data.nsxxDto', this.metaAction.gf('data.copyNsxxDto'))
        }
        if( activeKey == 2 ) {
            this.getTab2Data()
        }
        if( activeKey == 6 ) {
            this.metaAction.sf('data.zfjgInfo', this.metaAction.gf('data.copyZfjgInfo'))
        }
        if(activeKey == 4) {
            this.readFinanceInfo({hideMessage:true, activeKey} )
        
        } else {
            this.metaAction.sf('data.other.activeTabKey', activeKey)
        }
    }

    getTab2Data = async( zsxm, isInvalid, currentPage, pageSize ) => {
        let tab2Params = this.metaAction.gf('data.other.tab2Params').toJS()
            params = {
                id: this.component.props.initData.orgId,
                sfzqueryDto: {
                    entity: {
                        zsxm: zsxm === undefined ? tab2Params.zsxm :  ( zsxm === '' ? undefined : zsxm ),
                        isInvalid: isInvalid===undefined ? Number(tab2Params.isInvalid):Number(isInvalid),
                    },
                    page: {
                        currentPage: currentPage || tab2Params.page.currentPage,
                        pageSize: pageSize || tab2Params.page.pageSize,
                    }
                }
            }
        let res = await this.webapi.org.queryOrgAllBySfzCondition(params)
        if( zsxm !== undefined ) tab2Params.zsxm = ( zsxm === '' ? undefined : zsxm )
        if( isInvalid !== undefined ) tab2Params.isInvalid = isInvalid
        if( currentPage !== undefined ) tab2Params.page.currentPage = currentPage
        if( pageSize !== undefined ) tab2Params.page.pageSize = pageSize
        if(res) {
            tab2Params.page.total = res.sfzxxDtoPageResultDto.page.totalCount
            let data = {
                'data.sfzxxDtos': fromJS(res.sfzxxDtoPageResultDto.list || []),
                'data.other.tab2Params': fromJS( tab2Params ),
                'data.other.activeTabKey': '2'
            }
            this.metaAction.sfs( data )
        }
    }

    //分页修改
	pageChanged = ( currentPage, pageSize, slPage) => {
        this.getTab2Data( undefined, undefined, currentPage, pageSize )
    }

    changeCheck = ( checked ) => {
        this.getTab2Data( undefined, Number( checked ), 1 )
    }

    changeValue = ( value ) => {
        this.metaAction.sf('data.other.tab2Params.zsxm', value)
    }

    handleSfzxxSearch = () => {
        let value = this.metaAction.gf('data.other.tab2Params.zsxm')
        this.getTab2Data( value, undefined, 1 )
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
                    'data.basic.ss': initState.ss
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
            // }, {
            //     path: 'data.basic.dkswjgsh', value: basic.dkswjgsh
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

    fdfxrTel = (e) => {
        console.log(e.target.value)
        this.metaAction.sfs({
            'data.nsxxDto.FDFZR_TEL':e.target.value,
            'data.fdfzrEdit':true
        })
    }
    // changeCheckFDFZR = (str) =>{
    //     const nsxxDto = this.metaAction.gf('data.nsxxDto').toJS()
    //     switch (str){
    //         case 'FDFZR_TEL'://客户名称
    //             this.voucherAction.check([{
    //                 path: 'data.nsxxDto.FDFZR_TEL', value: nsxxDto.FDFZR_TEL
    //             }], this.checkValueName);
    //             break;
    //     }
    // }
    // checkValueName = async (option) => {
    //     if (option.path ==  'data.nsxxDto.FDFZR_TEL') {//联系人手机号
    //         return {errorPath: 'data.other.error.linkTel', message: option.value &&option.value.trim() ?( !/^1(3|4|5|6|7|8|9)\d{9}$/.test(option.value) ? '请输入正确的手机号' : "") : '请输入联系人手机号'}
    //     }
    // }
    //保存企业信息
    saveOrgInfo = async () => {
        let orgInfo = this.metaAction.gf('data.nsxxDto').toJS(),
            error = this.metaAction.gf('data.error.orgInfo').toJS(),
            fdfzrEdit = this.metaAction.gf('data.fdfzrEdit')
        for (let i in error) {
            if (error[i] != undefined) return
        }
        if(!!orgInfo.ZCZB) {
            orgInfo.ZCZB = this.clearThousandsPosition(orgInfo.ZCZB)
        }
        if(fdfzrEdit){
            if(orgInfo.FDFZR_TEL == ''){
                this.metaAction.toast('warning', '请输入法定负责人联系电话')
                return
            }else {
                if( !/^1(3|4|5|6|7|8|9)\d{9}$/.test(orgInfo.FDFZR_TEL)){
                    this.metaAction.toast('warning', '请输入正确的手机号')
                    return
                }
            }
        }
        const response = await this.webapi.org.updateNsxx(orgInfo)
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
            let r = { ...o }
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
                case 'data.finance.accountingStandardsId':
                    Object.assign(r, { errorPath: 'data.error.accountingStandardsId', message: o.value ? undefined  : '财务会计制度准则不能为空' })
                    break
                case 'data.finance.reportingCategoryCode':
                    Object.assign(r, { errorPath: 'data.error.reportingCategoryCode', message: o.value ? undefined  : '资料报送小类不能为空' })
                    break
                case 'data.finance.reportingSubCategoryCode':
                    Object.assign(r, { errorPath: 'data.error.reportingSubCategoryCode', message: o.value ? undefined  : '资料报送子类不能为空' })
                    break
                case 'data.finance.reportingPeriod':
                    Object.assign(r, { errorPath: 'data.error.reportingPeriod', message: o.value ? undefined  : '报送期间不能为空' })
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
    //校验非必填字段
    checkNotRequire = (length, str, value, field) => {
        let path = str.replace('error.orgInfo', 'nsxxDto')
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
                // this.changeDlfs(id)
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
                // this.changeDlfs(value)
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

    caToolsInfo = () => {
        return !this.ieEnv()
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
            let scrollCon = document.querySelector('.ttk-es-app-org .ant-tabs-content')
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
            children: this.metaAction.loadApp('ttk-es-app-org-reinit', {
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

    setTab4Field = ( path, value ) => {
        let data = {
            [path]: value
        },subTypes,types,
            rules = this.metaAction.gf('data.other.rules').toJS(),
        copyTypes = this.metaAction.gf('data.other.copyTypes').toJS(),
        CopySubTypes = this.metaAction.gf('data.other.CopySubTypes').toJS()
        data = this.setTab4Check( path, value, data )
        if( path == 'data.finance.accountingStandardsId' && value ){
            //过滤大类
            types = copyTypes.filter((item) =>
                item.accountingStandardCode === value
            )
            if(types.length == 1){
                data['data.finance.reportingCategoryCode'] = types[0].reportingCategoryCode
            }else{
                data['data.finance.reportingCategoryCode'] = ''
            }
            console.log(types,'types')
            data['data.other.types'] = fromJS(types)

            //过滤子类
            subTypes = CopySubTypes.filter((item) =>
                item.reportingCategoryCode === data['data.finance.reportingCategoryCode']
            )
            if(subTypes.length == 1){
                data['data.finance.reportingSubCategoryCode'] = subTypes[0].reportingSubCategoryCode
            }else{
                data['data.finance.reportingSubCategoryCode'] = ''
            }
            data['data.other.subTypes'] = fromJS(subTypes)


        }
        else if( path == 'data.finance.reportingCategoryCode' && value ) {
        //     types.map( item => {
        //         if( item.reportingCategoryCode == value ) {
        //             data['data.finance.accountingStandardsId'] = item.accountingStandardCode
        //             data = this.setTab4Check( 'data.finance.accountingStandardsId', item.accountingStandardCode, data )
        //
        //         }
        //     })
            //过滤子类
            subTypes = CopySubTypes.filter((item) => 
                item.reportingCategoryCode === value
            )
            if(subTypes.length == 1){
                data['data.finance.reportingSubCategoryCode'] = subTypes[0].reportingSubCategoryCode
            }else{
                data['data.finance.reportingSubCategoryCode'] = ''
            }
            data['data.other.subTypes'] = fromJS(subTypes)
        }
        this.metaAction.sfs(data)
        // console.log(rules,'rules')
        // console.log(copyTypes,'types')
    }

    setTab4Check = ( path, value, data ) => {
        let errors = {
            'data.finance.accountingStandardsId': {
                message: '财务会计制度准则不能为空',
                path: 'data.error.accountingStandardsId'
            },
            'data.finance.reportingCategoryCode': {
                message: '资料报送小类不能为空',
                path: 'data.error.reportingCategoryCode'
            },
            'data.finance.reportingSubCategoryCode': {
                message: '报送期间不能为空',
                path: 'data.error.reportingPeriod'
            },
            'data.finance.reportingPeriod': {
                message: '报送期间不能为空',
                path: 'data.error.reportingPeriod'
            },
           
        }
        if( !value ) {
            data[ errors[path].path ] = errors[path].message
        } else {
            data[ errors[path].path ] = ''

        }
        return data
    }


    //下载更新报表设置
    timer = null
    xiazaiNSRXX = async () => {
        const rel = await this.webapi.downLoad.getNsrxxAsyncStatusHasReturn()
        if(rel){
            rel.list.forEach(item =>{
                if(item.success == 3){

                }else if(item.success == 2){
                    if(this.timer){
                        clearInterval(this.timer)
                    }
                    LoadingMask.hide()
                    this.component.props.fuc()
                    this.metaAction.toast('error', '【下载纳税人信息失败：'+item.message+'】')

                }else if(item.success == 1){
                    if(this.timer){
                        clearInterval(this.timer)
                    }
                    LoadingMask.hide()
                    this.gxjm()
                    this.metaAction.toast('success', '【下载纳税人信息成功】')

                }
            })
        }
    }
    downLoadAndUpdate = async () => {
        let data = this.metaAction.gf('data.finance').toJS();;
        data.orgId = this.component.props.initData.orgId
        data.modified = false
        const res = await this.webapi.org.modifyReportSetting(data);
        if(res){
            LoadingMask.show()
            console.log('我是下载更新');
            let idList=[{
                id:this.component.props.initData.customerId,
                orgId:this.component.props.initData.orgId
            }]
            const ret = await this.webapi.downLoad.getNsrxx(idList);
            let that = this
            this.timer = setInterval(function() {
                that.xiazaiNSRXX()
            }, 10000)
        }

    }

    gxjm = async () => {
        let res = await this.webapi.org.queryReportSetting({orgId: this.component.props.initData.orgId}),
            data = {},
            itemLists = ['accountingStandardsId', 'reportingCategoryCode', 'reportingPeriod' ],
            form = {},
            subTypes,
            CopySubTypes = this.metaAction.gf('data.other.CopySubTypes').toJS()

        res.accountingStandardsId = res.accountingStandardsId ? res.accountingStandardsId + '' : res.accountingStandardsId
        data['data.finance']= fromJS(res || {})
        this.metaAction.sf('data.resport',fromJS(res));
        data['data.copyFinance']= fromJS(res || {})
        if(res.reportingCategoryCode){
            subTypes = CopySubTypes.filter((item) =>
                item.reportingCategoryCode === res.reportingCategoryCode
            )
            data['data.other.subTypes']= fromJS(subTypes)
        }
        itemLists.map( item => {
            this.setTab4Check( 'data.finance.'+item, res[item], data )
        })
        this.metaAction.sfs( data )
    }



    //保存企业信息
    saveFinanceInfo = async () => {
        if (this.isSaving) return
        this.isSaving = true
        let finance = this.metaAction.gf('data.finance').toJS();
        let resport = this.metaAction.gf('data.resport').toJS();
        let modifiedGF =this.metaAction.gf('data.modified')
        let modified =null
        console.log(modifiedGF,'modifiedGF')
        const info = await this.check([{
            path: 'data.finance.accountingStandardsId', value: finance.accountingStandardsId
        }, {
            path: 'data.finance.reportingCategoryCode', value: finance.reportingCategoryCode
        }, {
            path: 'data.finance.reportingSubCategoryCode', value: finance.reportingSubCategoryCode
        }, {
            path: 'data.finance.reportingPeriod', value: finance.reportingPeriod
        }], 'save')
        if (!info) {
            this.isSaving = false
            return
        }

        // if( errors.accountingStandardsId || errors.reportingCategoryCode || errors.reportingPeriod ) {
        //     return
        // }
        if(modifiedGF){
            modified = modifiedGF
        }else if(modifiedGF == false){
            if(resport.accountingStandardsId != finance.accountingStandardsId || resport.reportingCategoryCode != finance.reportingCategoryCode || resport.reportingSubCategoryCode != finance.reportingSubCategoryCode || resport.reportingPeriod != finance.reportingPeriod){
                modified = true
            }else {
                modified = false
            }
        }else if (modifiedGF == undefined){
            if(resport){
                if(resport.accountingStandardsId != finance.accountingStandardsId || resport.reportingCategoryCode != finance.reportingCategoryCode || resport.reportingSubCategoryCode != finance.reportingSubCategoryCode || resport.reportingPeriod != finance.reportingPeriod){
                    modified = true
                }else {
                    modified = false
                }
            }
        }else {
            if(resport){
                if(resport.accountingStandardsId != finance.accountingStandardsId || resport.reportingCategoryCode != finance.reportingCategoryCode || resport.reportingSubCategoryCode != finance.reportingSubCategoryCode || resport.reportingPeriod != finance.reportingPeriod){
                    modified = true
                }else {
                    modified = false
                }
            }
        }

        finance.orgId = this.component.props.initData.orgId
        finance.modified = modified
        const res = await this.webapi.org.modifyReportSetting(finance)
        if (res) {
            this.metaAction.sfs({
                'data.copyFinance':this.metaAction.gf('data.finance'),
                'data.resport':this.metaAction.gf('data.finance')
            })
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
        }
        this.isSaving = false
    }

    readFinanceInfo = async ({hideMessage, activeKey}) => {
        let res = await this.webapi.org.queryReportSetting({orgId: this.component.props.initData.orgId}),
            data = {},
            itemLists = ['accountingStandardsId', 'reportingCategoryCode', 'reportingPeriod' ],
            form = {},
            types,
            CopyTypes = this.metaAction.gf('data.other.copyTypes').toJS(),
            subTypes,
            CopySubTypes = this.metaAction.gf('data.other.CopySubTypes').toJS()

        res.accountingStandardsId = res.accountingStandardsId ? res.accountingStandardsId + '' : res.accountingStandardsId
        data['data.finance']= fromJS(res || {})
        this.metaAction.sf('data.resport',fromJS(res));
        if(res){
            this.metaAction.sf('data.modified',res.modified)
        }else {
            this.metaAction.sf('data.modified','null')
        }
        data['data.copyFinance']= fromJS(res || {})
        if(res.accountingStandardsId){
            types = CopyTypes.filter((item) =>
                item.accountingStandardCode === res.accountingStandardsId
            )
            data['data.other.types']= fromJS(types)
        }
        if(res.reportingCategoryCode){
            subTypes = CopySubTypes.filter((item) => 
                item.reportingCategoryCode === res.reportingCategoryCode
            )
            data['data.other.subTypes']= fromJS(subTypes)
        }
        if(activeKey) data['data.other.activeTabKey']= activeKey
        itemLists.map( item => {
            this.setTab4Check( 'data.finance.'+item, res[item], data )
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

    readFinanceInfo2 = async ({hideMessage, activeKey}) => {
        let resTime = await this.webapi.org.getSystemDate({}),
            resJd,
            data = {},
            itemLists = ['accountingStandardsId', 'reportingCategoryCode','reportingSubCategoryCode', 'reportingPeriod' ],
            form = {},
            reportingCategoryCodes,
            period;
            if( resTime ) {
                let year = resTime.split('-')[0],
                    month = parseInt(parseInt(resTime.split('-')[1])-1)
                if( month == 1 ) {
                    period = parseInt(year-1) + '-12' 
                } else {
                    period = year + '-' +(month<10?'0'+month:month)
                }
            }

            resJd = await this.webapi.org.getRecord4XDZ({ "sssqQ": period,"sssqZ":period,orgId: this.component.props.initData.orgId })

        // 1、	取数：从局端获取备案信息
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
        //按规则生成默认值(小类和子类)
        if(form.accountingStandardsId){
            let resSubCode = await this.webapi.org.getDefaultReportSettingCode({"accountingStandardCode":form.accountingStandardsId})
            if(resSubCode){
                form.reportingCategoryCode = resSubCode.reportingCategoryCode
                form.reportingSubCategoryCode = resSubCode.reportingSubCategoryCode
            }
        }
        data['data.finance']= fromJS(form || {})
        data['data.copyFinance']= fromJS(form || {})
        if(activeKey) data['data.other.activeTabKey']= activeKey
        itemLists.map( item => {
            this.setTab4Check( 'data.finance.'+item, form[item], data )
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

    getValue = ( list, value, key = 'code', resKey = 'name'  ) => {
        let itemName = ''
        if(list===undefined||value===undefined) {
            return ''
        }
        list.map( item => {
            if( item[ key ] == value ) {
                itemName = item[ resKey ]
            }
        })
        return <span title={itemName}>{itemName}</span>
    }

    getCanEditSS = () => {
        let ss = this.metaAction.gf('data.basic.ss'),
            canEdit = true
        // 广东44：不允许修改，接口返回什么就显示什么，返回空，也显示空。
		// 福建35，陕西61，贵州52，北京11，青海63：可修改。
        if( ss==35||ss==61||ss==52||ss==11||ss==63 ) {
            canEdit = true
        } else {
            canEdit = false
        }
        return canEdit
    }
    getVatTaxpayerName = (num)=>{
        if(!num) return ''
        let vatTaxpayerArr = this.metaAction.gf('data.enumData.basic.vatTaxpayer').toJS() ;
        for(let i = 0,len = vatTaxpayerArr.length;i<len;i++){
            if(vatTaxpayerArr[i].id == num){
                return vatTaxpayerArr[i].name
            }
        }
    }
     //保存总分机构
     saveBranchType = async () => {
        let zfjgInfo = this.metaAction.gf('data.zfjgInfo').toJS()
        zfjgInfo.orgId = this.component.props.initData.orgId
        const response = await this.webapi.org.updateZFJGInfo(zfjgInfo)
        if (response) {
            this.metaAction.sf('data.zfjgInfo', this.metaAction.gf('data.copyZfjgInfo'))
            this.metaAction.toast('success', '保存成功')
        } else {
            this.metaAction.toast('error', '保存失败')
        }
    }
    //获取分支机构列表
	getFZJGList = async () => {
        let response = await this.webapi.org.getFZJGList({orgId:this.component.props.initData.orgId});
        if(response&&response.length > 0){
            response.map(item=>{
                item.isEdit = false
            })
            this.injections.reduce('fzjgList', response);
        }else{
            this.injections.reduce('fzjgList', response);
        }
	};
    //底部保存按钮
    saveButton = () =>{
        let activeTabIndex = this.metaAction.gf('data.other.activeTabKey');
        switch (activeTabIndex) {
            case '1':
                this.saveOrgInfo()
                break
            case '4':
                this.saveFinanceInfo()
                break
            case '6':
                this.saveBranchType()
                break                   
            default:
                break
        }
    }
    //底部关闭按钮
    onCancel = () =>{
        // this.component.props.closeModal()
        this.component.props.fuc()
    }
    //显示隐藏企业信息
    hideInfo = () => {
        this.metaAction.sf('data.other.detailInfo', !this.metaAction.gf('data.other.detailInfo'))
        setTimeout(() => {
            let scrollCon = document.querySelector('.ttk-es-app-org .ant-tabs-content')
            scrollCon.scrollTop = 308
        }, 0)

    }
    //分支机构信息表格渲染
    renderColumns = () => {
        let columns = [
            {
                caption: "序列",
                colIndex: 10,
                columnId: 400005,
                fieldName: "id",
                id: 40000500001,
                isVisible: false,
                width: 43,
            }, 
            {
                caption: "分支机构纳税识别号",
                colIndex: 10,
                columnId: 400005,
                fieldName: "fzjgnssbh",
                id: 40000500001,
                isVisible: true,
                width: 110,
            }, {
                caption: "分支机构纳税人",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "fzjgnsr",
                id: 40000500001,
                width: 120,
            },{
                caption: "申报缴纳方式",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "sbjnfs",
                id: 40000500001,
                width: 140,
            },{
                caption: "汇总纳税有效期（起）",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "hznsyxqq",
                id: 40000500001,
                width: 100,
            },{
                caption: "汇总纳税有效期（止）",
                // colIndex: 10,
                columnId: 400006,
                isVisible: true,
                fieldName: "bznsyxqz",
                // id: 40000500002,
                width: 100,
            },{
                caption: "预征率",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "yzl",
                id: 40000500001,
                width: 50,
            },{
                caption: "定额税率",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "desl",
                id: 40000500001,
                width: 50,
            },{
                caption: "预征比率",
                colIndex: 10,
                columnId: 400005,
                isVisible: true,
                fieldName: "yzbl",
                id: 40000500001,
                width: 50,
            },

        ]
        const arr = [];
        columns.forEach(data => {
            if (data.isVisible) {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
                    className: `table_td_align_${this.needAlignType(data.fieldName)}`,
                    dataIndex: data.fieldName,
                    width: data.width,
                    render: (text, record, index) => {
                        return this.normalTdRender(text, record, index, data.fieldName)
                    }
                })
            }
        })
        //操作栏目列
        arr.push({
            title: '操作',
            key: 'status',
            dataIndex: 'status',
            className: 'table_fixed_width',
            width: 80,
            render: (text, record, index) => {
                return this.operateCol(text, record, index)
            }
        })
        return arr
    }
    //新增分支机构
    addClick = () => {
        let month = new Date().getMonth(),
            day = new Date().getDate();
        let nowTime = new Date().getFullYear() + '-' + (month < 10 ?'0'+ month:month ) + '-' + (day < 10 ?'0'+ day:day )
        let list = this.metaAction.gf('data.list').toJS()
        if (this.getListIsEdit()) return
        list = list.concat({
                id: list.length ? Number(list[list.length - 1].id) + 1 : 1,
                isNew: true,
                hznsyxqq:nowTime,
                bznsyxqz: nowTime,
                isEdit: true,
            })
        this.injections.reduce('update', { path: 'data.list', value: list })

        setTimeout(() => {
            let c = $('.keydown_auto_focus')[0]
            if (c) {
                if ($(c).find('input').length > 0) {
                    c = $(c).find('input')[0]
                }
                c.focus()
            }
        }, 10)

        // setTimeout(() => {
        //     this.getTableScroll(true)
        // }, 100)
    }

    rowSelection = (text, row, index) => {
        return undefined
    }
    //获取分支机构是否保存
    getListIsEdit = (record, ownEdit) => {
        let list = this.metaAction.gf('data.list').toJS()
        let editArr = list.filter(item => item.isEdit)

        if (ownEdit) {
            //有未保存的分支机构且未保存的分支机构不是是自己
            if (editArr.length) {
                if (editArr[0].pid != record.id) {
                    this.metaAction.toast('warning', '您有未保存的分支机构')
                    return true
                }
                return editArr
            }
            return false
        } else {
            //有未保存的分支机构
            if (editArr.length) {
                this.metaAction.toast('warning', '您有未保存的分支机构')
                return editArr
            }
            return false
        }
    }
    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr
            }
        })
        this.selectedOption = newItemArr
    }

    //对齐方式
    needAlignType = (key) => {
        const right = ['amount']
        const left = ['businessTypeName', 'remark', 'departmentName', 'projectName', 'accountName']
        const center = ['seq', 'businessDate']
        let className = right.includes(key) ? 'right' : left.includes(key) ? 'left' : 'center'
        return className
    }

    //序号列
    renderRowSpan = (text, record, index) => {
        const num = this.calcRowSpan(record.seq, 'seq', index)
        const obj = {
            children: text,
            props: {
                rowSpan: num,
            },
        }
        return obj
    }
    //输入框
    getInput = (text, record, index, fieldName) => {
        let _this = this
        if (fieldName == 'yzl' || fieldName == 'desl' || fieldName == 'yzbl') {
            return <Input.Number value={this.renderFixedNumber(record, fieldName)}
                className={record[`${fieldName}Error`] ? 'error amount keydown_auto_focus' : 'amount keydown_auto_focus'}
                precision={2}
                onBlur={function (e) { _this.amountChange(index, e, fieldName, record, 'amount') }} 
                />
        }
        return <Input.TextArea autosize value={record[fieldName]}
            className={record[`${fieldName}Error`] ? 'error keydown_auto_focus' : 'keydown_auto_focus'}
            onBlur={function (e) { _this.amountChange(index, e.target.value, fieldName, record,'text') }}
            onChange={(e) => this.onFieldChange(index, e.target.value, fieldName, record,'text')} 
            />
    }
    //输入校验
    amountChange = (index, value, fieldName, record, type) => {
        const titleMap = new Map([
            ['fzjgnsr',"分支机构纳税人"],
            ['fzjgnssbh',"分支机构纳税识别号"],
            ['yzl',"预征率"],
            ["desl","定额税率"],
            ["yzbl","预征比率"]
        ])
        if (type == 'amount' && typeof value == 'string') {
            value = Number(value.replace(',', ''))
        }
        let list = this.metaAction.gf('data.list').toJS()
        //长度校验
        if (type == 'amount') {
            if (value > 1) {
                this.metaAction.toast('warning', `${titleMap.get(fieldName)}不能大于1，请调整`)
                list[index][`${fieldName}Error`] = true
            } else if(value < 0) {
                this.metaAction.toast('warning', `${titleMap.get(fieldName)}不能小于0，请调整`)
                list[index][`${fieldName}Error`] = true
            }else{
                list[index][`${fieldName}Error`] = false
            }
        }else{
            if (value.length > 0) {
                list[index][`${fieldName}Error`] = false
            }
        }
        list[index][fieldName] = value
        this.injections.reduce('update', { path: 'data.list', value: list })
    }

    renderFixedNumber = (record, fieldName) => {
        let value = record[fieldName];
        if (!value) return ''
        if(value.toString().indexOf('%') >= 0){
            value = value.replace('%','')/100;
        }
        return utils.number.format(value, 2)
    }

     //保存或更新分支机构信息
     saveExpense = async (text, record, index) => {
        if (this.clickStatus) return
        this.clickStatus = true
        let list = this.metaAction.gf('data.list').toJS(), details = []
        if (!this.checkForSave(list, record)){
            this.clickStatus = false
            return false
        }
        list = list.filter(item =>item.id == record.id)
        let newItem = list[0];
        let option = {
            orgId:this.component.props.initData.orgId,
            fzjgnssbh:newItem.fzjgnssbh,
            fzjgnsr:newItem.fzjgnsr,
            sbjnfs:newItem.sbjnfs,
            hznsyxqq: this.metaAction.momentToString(newItem.hznsyxqq, 'YYYY-MM-DD'),
            bznsyxqz: this.metaAction.momentToString(newItem.bznsyxqz, 'YYYY-MM-DD'),
            yzl:newItem.yzl,
            desl:newItem.desl,
            yzbl:newItem.yzbl,
        }
        //编辑状态
        if (record.id && !record.isNew) {
            option.id = record.id
            const response = await this.webapi.org.updateFZJGItem(option)
            if (response && response.id) {
                this.metaAction.toast('success', '更新成功')                
            } else {
                this.metaAction.toast('error', '更新失败')
            }
            this.clickStatus =  false
            //新增状态
        } else {
            const response = await this.webapi.org.addFZJGItem(option)
            if (response && response.id) {
                this.metaAction.toast('success', '保存成功')
 
            } else {
                this.metaAction.toast('error', '更新失败')
                
            }
            this.clickStatus =  false
        }
        this.getFZJGList()
        
    }
    //保存校验
    checkForSave = (details, record) => {
        let msg = []
        details = details.filter(item => item.id == record.id)[0]
        if (!details.fzjgnssbh) {
            msg.push('分支机构纳税识别号不能为空')
        }
        if (!details.fzjgnsr) {
            msg.push('分支机构纳税人不能为空')
        }
        if (!details.sbjnfs) {
            msg.push('申报缴纳方式不能为空')
        }
        if (details.bznsyxqzError) {
            msg.push('汇总纳税有效期（止）日期不能小于开始日期')
        }
        let str1 = this.checkIsDecimal(details.yzl,'预征率'),
            str2 = this.checkIsDecimal(details.desl,'定额税率'),
            str3 = this.checkIsDecimal(details.yzbl,'预征比率');
        msg = [...msg,str1,str2,str3];
        msg = msg.filter(item=>item.length > 0);
        if (msg.length > 0) {
            this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
            return false
        }
        return true
    }

    checkIsDecimal=(value,text)=>{
        let str = ''
        if (!value) {
            str = `${str}${text}不能为空 `
        } else if (Number(value) <= 0) {
            str = `${str}${text}必须大于0 `
        } else if (Number(value) > 1) {
            str = `${str}${text}不能大于1 `
        }
        return str;
    }
    getDisplayErrorMSg = (msg) => {
        return <div style={{ display: 'inline-table', textAlign: 'left' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
    }
    //操作栏目列
    operateCol = (text, record, index) => {
        let _this = this, parentNode
        let list = this.metaAction.gf('data.list').toJS()
        parentNode = list.filter(item => item.id == record.id)
        if(parentNode[0].isEdit){
            return <span style={{display:'flex',justifyContent: 'space-between'}}>
                <a onClick={function () {_this.saveExpense(text, record, index)  }}>保存</a>
                <a onClick={function () {_this.cancelDatials(text, record, index) }}>取消</a>
            </span>
        }else{
            return <span style={{display:'flex',justifyContent: 'space-between'}}>
                <a onClick={function () {_this.editDatials(text, record, index)}}> 编辑 </a>
                <a onClick={function () {_this.delExpense(text, record, index)}}> 删除 </a>
            </span>
        }
        
    }

    //渲染内容
    normalTdRender = (text, record, index, fieldName) => {
        if (record.isEdit) {
            if (fieldName == 'hznsyxqq' || fieldName == 'bznsyxqz' ) {
                return this.getBusinessDate(text, record, index, fieldName)
            } else if (fieldName == 'sbjnfs') {
                return this.getDepartmentProject(text, record, index, fieldName)
            } else {
                return this.getInput(text, record, index, fieldName)
            }
        } else {
            if (fieldName == 'hznsyxqq' || fieldName == 'bznsyxqz' ) {
                return <p title={record[fieldName]} className='td_ellipsis'>{ this.metaAction.momentToString(record[fieldName], 'YYYY-MM-DD')}</p>
            } else if (fieldName == 'businessTypeName' || fieldName == 'projectName' || fieldName == 'departmentName') {
                if (record[fieldName]) {
                    return <p title={record[fieldName]} className='td_ellipsis'>{record[fieldName]}</p>
                }
                return ''
            } else if (fieldName == 'amount') {
                return this.renderFixedNumber(record, fieldName)
            }else if(fieldName == 'sbjnfs'){
                return this.rendersBjnfsName(record, fieldName)
            }
            return <p title={record[fieldName]} className='td_ellipsis'>{record[fieldName]}</p>
        }
    }

    rendersBjnfsName =(record, fieldName) =>{
        let list = this.metaAction.gf('data.enumData.basic.SBJNFS').toJS()
        for(let i=0,len= list.length;i<len;i++){
            if(list[i].code == record.sbjnfs){
                return  <p title={list[i].name} className='td_ellipsis'>{list[i].name}</p>
            }
        }
    }
    //编辑分支机构明细
    editDatials = (text, record, index) => {
        let list = this.metaAction.gf('data.list').toJS()
        this.metaAction.sf('data.copyList',fromJS(list))

        //保存状态点编辑明细需时，其他单据有编辑状态的则必须保存才能进入编辑状态
        if (!record.isEdit) {
            if (this.getListIsEdit()) return
        }

        list.map(item => {
            if (item.id == record.id) {
                item.isEdit = true
                return item
            }
        })

        this.injections.reduce('update', { path: 'data.list', value: list })
    }
     //取消编辑分支机构
     cancelDatials = (text, record, index) => {
        if(record.isNew){
            this.delExpense(text, record, index)
        }else{
            let list = this.metaAction.gf('data.copyList').toJS()
            this.injections.reduce('update', { path: 'data.list', value: list })
        }
    }

    //删除操作
    delExpense = async (text, record, index) => {
        //新增状态删除分支机构直接删除，不需要请求接口
        let list = this.metaAction.gf('data.list').toJS(), newArr = []
        if (record.isNew) {
            let list = this.metaAction.gf('data.list').toJS(), newArr = []
            list.map(item => {
                if (record.id != item.id) {
                    newArr.push(item)
                }
            })
            // this.deleteSelectOption(record)
            this.injections.reduce('update', { path: 'data.list', value: newArr })
        } else {
            let editList = this.getListIsEdit(record, true)
            if (editList === true) return
            const ret = await this.metaAction.modal('confirm', {
                title: '删除分支机构',
                content: '确定要删除吗？'
            })
            if (!ret) return
            list.map(item => {
                if (record.id != item.id) {
                    newArr.push(item)
                }
            })
            // this.deleteSelectOption(record)
            this.injections.reduce('update', { path: 'data.list', value: newArr })
            let option = {
                ids: [record.id],
                orgId:this.component.props.initData.orgId,
            }
            const response = await this.webapi.org.deleteFZJGItem(option)
            if (response) {
                this.metaAction.toast('success', '删除成功')
            } else {
                this.metaAction.toast('error','删除失败')  
            }
            this.getFZJGList()
        }
    }
       //批量删除
    delBatchClick = async () => {
        if (this.getListIsEdit()) return

        const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
        const checkboxValue = this.metaAction.gf('data.tableCheckbox.checkboxValue').toJS() 
        if (selectedOption.length == 0) {
            this.metaAction.toast('error', '请选择您要删除的数据')
            return
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '删除分支机构',
            content: '确定要删除吗？'
        })
        if (!ret) {
            return
        }
        let option = {
            ids: checkboxValue,
            orgId:this.component.props.initData.orgId,
        }
        const res = await this.webapi.org.deleteFZJGItem(option)

        if (res) {
            this.metaAction.toast('success', '删除成功')
        }
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        })
        // 重新请求列表数据
        this.getFZJGList()
    }
     //起止日期
     getBusinessDate = (text, record, index, fieldName) => {
        let _this = this,i=0;
        return <DatePicker
            className={record[`${fieldName}Error`] ? 'errorDate keydown_auto_focus auto_focus_datepicker' : 'keydown_auto_focus auto_focus_datepicker'}
            placeholder='选择日期'
            disabledDate={this.getDisabledDate}
            value={moment(record[fieldName])}
            onChange={(e) => {
                if(fieldName == 'bznsyxqz')  i = 1
                this.nextAutofocus($('.auto_focus_datepicker')[i])
                this.checkDate({ e, record, index,fieldName})
            }} />
    }
    checkDate = async (option) => {
        let list = this.metaAction.gf('data.list').toJS(),start,end;
        if(option.fieldName =='bznsyxqz'){
            start  = new Date(option.record.hznsyxqq),
            end = new Date(this.metaAction.momentToString(option.e, 'YYYY-MM-DD'));
        }else{
            start  = new Date(this.metaAction.momentToString(option.e, 'YYYY-MM-DD')),
            end = new Date(option.record.bznsyxqz);
        }
        let starttimes = start.getTime();
        let endTimes = end.getTime();    
        if (endTimes <= starttimes) {
            this.metaAction.toast('warning', '汇总纳税有效期（止）日期不能小于开始日期')
            list[option.index][`${option.fieldName}Error`] = true
            this.injections.reduce('update', { path: 'data.list', value: list })
        }else{
            list[option.index][`bznsyxqzError`] = false
            list[option.index][`hznsyxqqError`] = false
            this.injections.reduce('update', { path: 'data.list', value: list })
        }

        this.injections.reduce('accountDateChange',option)
    }
    //申报缴纳方式
    getDepartmentProject = (text, record, index, fieldName) => {
        let list = this.metaAction.gf('data.enumData.basic.SBJNFS').toJS()
        return <div style={{ width: '95%' }}>
                <Select
                    style={{ width: '100%' }}
                    placeholder='申报缴纳方式'
                    value={record[fieldName]}
                    className="keydown_auto_focus"
                    dropdownStyle={{
                        width: '300px'
                    }}
                    dropdownMatchSelectWidth={false}
                    onChange={(value) => this.onFieldChange(index, value, fieldName, record,true)}
                    optionFilterProp="children"
                    filterOption={this.filterOptionSummary}
                    onBlur={() => this.handleAccountBlur(record, index)}
                    onFocus={() => this.handleAccountFocus(record, index)}
                >
                    {
                        list.map(item => {
                            return <Option title={item.name} value={item.code}>{ item.name}</Option>
                        })
                    }
                </Select>
            </div>
        
    }
    handleAccountBlur = (record, index) => {
        delete record.accountFocus;
        this.metaAction.sf(`data.list.${index}`, fromJS(record))
    }
    handleAccountFocus = (record, index) => {
        this.metaAction.sf(`data.list.${index}.accountFocus`, true)
    }

    onFieldChange = (index, value, type, record,change) => {
        let list = this.metaAction.gf('data.list').toJS();
        let accounts = this.metaAction.gf('data.other.rules').toJS();
        let account = accounts.find(o => o.id == value);
        list[index][type] = value
        // list[index][type + 'change'] = change
        // list[index][type + 'Name'] = (account && account.gradeName) || '';
        this.injections.reduce('update', { path: 'data.list', value: list })
       
    }
    //自动获取编辑框焦点
    nextAutofocus = (ele) => {
        let dom = document.activeElement
        if (ele) {
            dom = ele
        } else {
            if (!dom) {
                return
            }
            if (dom.className && !dom.className.includes('keydown_auto_focus')) {
                dom = $(document.activeElement).parents('.keydown_auto_focus')[0]
            }
        }
        let flag
        const arr = $('.keydown_auto_focus')
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == dom) {
                flag = i
            }
        }
        if (flag >= 0) {
            setTimeout(() => {
                let c = $('.keydown_auto_focus')[flag + 1]
                if (c) {
                    if ($(c).find('input').length > 0) {
                        c = $(c).find('input')[0]
                    }
                    c.focus()
                    c.click()
                }
            }, 10)
        }
    }

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
