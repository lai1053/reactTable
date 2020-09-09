import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import { consts } from 'edf-consts'
import { LoadingMask, Icon, Upload, Button, FormDecorator } from 'edf-component'
import { fetch } from 'edf-utils'
import img from '../../../../vendor/img/gl/noFile.png'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.beforeLoad = option.voucherAction.excelbeforeUpload
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let currentOrg = this.metaAction.context.get("currentOrg")
        injections.reduce('init', {
            isPop: this.component.props.isPop,
            accountingStandards: currentOrg.accountingStandards
        })
        this.load()
    }
    load = async (option) => {
        // LoadingMask.show()
        this.metaAction.sf('data.loading', true)
        await this.webapi.financeinit.setStep({ step: "1" })
        let queryData = await this.webapi.financeinit.queryAll(), isMonthly
        const enumIdList = {
            enumIdList: ['200001', '200002']
        }
        let res = await this.webapi.financeinit.enum(enumIdList),
            getDisplayPeriod = await this.webapi.financeinit.getDisplayPeriod(),
            isCanModifyEnterpriseProperty = await this.webapi.financeinit.isCanModifyEnterpriseProperty(),
            queryExcelCheckedInfo = await this.webapi.financeinit.queryExcelCheckedInfo()
        if (Number(queryData.enabledMonth) < Number(getDisplayPeriod.month)) {
            isMonthly = true
        } else {
            isMonthly = false
        }
        const accountingStandardMap = new Map([
            [2000020001, 2000020016],
            [2000020002, 2000020032]
        ])
        if (queryData[0].applySimplyAccountingStandards) queryData[0].accountingStandards = accountingStandardMap.get(queryData[0].accountingStandards)
        queryData[0].vatTaxpayerEnum = res['200001']
        queryData[0].accountingStandardsEnum = res['200002']
        queryData[0].modifyStatus = isCanModifyEnterpriseProperty
        queryData[0].isMonthly = isMonthly
        queryData[0].queryExcelCheckedInfo = queryExcelCheckedInfo
        this.injections.reduce('load', queryData[0])
        this.metaAction.sf('data.loading', false)
        // LoadingMask.hide()
    }

    setField = async (path, value) => {
        
        if (path == 'data.form.periodDate') {
            let year = value.split('-')[0],
                month = value.split('-')[1]
            if (value == this.metaAction.gf('data.form.periodDate')) {
                return
            }
            let periodRes = await this.webapi.financeinit.checkCanUpdatePeriod({ toYear: year, toMonth: month })
            console.log(periodRes)
            if (periodRes && periodRes.error) {
                return
            }
        }
        if (path == 'data.form.vatTaxpayer' || path == 'data.form.accountingStandards') {
            let enterprisePropertyRes = await this.webapi.financeinit.isCanModifyEnterpriseProperty()
            if (enterprisePropertyRes && enterprisePropertyRes.error) {
                return
            }
        }
        if (path == 'data.form.templateType') {
            this.metaAction.sf('data.other.disabled', false)
        }
        this.metaAction.sf(path, value)
    }

    fiSoftChange = (path, value) => {
        this.injections.reduce('fiSoftChange', path, value)
    }

    edit = async () => {

        let enabledYear = this.metaAction.gf('data.form.periodDate').split('-')[0],
            enabledMonth = this.metaAction.gf('data.form.periodDate').split('-')[1],
            isCanModifyEnterpriseProperty = await this.webapi.financeinit.isCanModifyEnterpriseProperty()

        this.metaAction.sfs({
            'data.other.isEdit': true,
            'data.other.modifyStatus': isCanModifyEnterpriseProperty
        })
    }

    editSave = async () => {
        let enabledYear = this.metaAction.gf('data.form.periodDate').split('-')[0],
            enabledMonth = this.metaAction.gf('data.form.periodDate').split('-')[1],
            accountingStandards = this.metaAction.gf('data.form.accountingStandards'),
            vatTaxpayer = this.metaAction.gf('data.form.vatTaxpayer'),
            contextObj = this.metaAction.context.get('currentOrg'),
            vatTaxpayerNum = this.metaAction.gf('data.form.vatTaxpayerNum'),
            ts = this.metaAction.gf('data.form.ts'),
            accountingStandardsEnum = this.metaAction.gf('data.form.accountingStandardsEnum'),
            vatTaxpayerEnum = this.metaAction.gf('data.form.vatTaxpayerEnum'),
            isCanModifyEnterpriseProperty = await this.webapi.financeinit.isCanModifyEnterpriseProperty(),
            params = {
                enabledYear, enabledMonth, accountingStandards, vatTaxpayer, ts, vatTaxpayerNum
            }
        // isUpdatePeriodAndProperty = await this.webapi.financeinit.isUpdatePeriodAndProperty({enabledYear: enabledYear,enabledMonth: enabledMonth})
        // if(!isUpdatePeriodAndProperty){
        //     this.metaAction.sf('data.other.isEdit', false)
        //     return
        // }
        contextObj.enabledMonth = enabledMonth
        contextObj.enabledYear = enabledYear
        contextObj.accountingStandards = accountingStandards
        contextObj.vatTaxpayer = vatTaxpayer
        
        let res = await this.webapi.financeinit.updatePeriodAndProperty(params)
        if (!res.error) {
            this.metaAction.toast('success', '修改成功')
            this.component.props.onPortalReload && this.component.props.onPortalReload()
            this.metaAction.context.set("currentOrg", contextObj)
            this.metaAction.sfs({
                'data.other.isEdit': false,
                // 'data.other.modifyStatus':checkCanUpdatePeriod
            })
            const accountingStandardMap = new Map([
                [2000020001, 2000020016],
                [2000020002, 2000020032]
            ])
            if (res.applySimplyAccountingStandards){
                res.accountingStandards = accountingStandardMap.get(res.accountingStandards)
            }            
            res.modifyStatus = isCanModifyEnterpriseProperty
            res.accountingStandardsEnum = accountingStandardsEnum
            res.vatTaxpayerEnum = vatTaxpayerEnum
            this.injections.reduce('load', res)
        } else if (res.error) {
            this.metaAction.sf('data.other.isEdit', true)
            this.metaAction.toast('error', res.error.message)
            // return false
        }

    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return { token }
    }
    handwork = async () => {
        let isMonthly = this.metaAction.gf('data.other.isMonthly')
        if (isMonthly) {
            this.metaAction.toast('error', '该账套已存在结账月份，需要反结账后才能进行初始化录入')
            return
        }
        //手工录入
        this.nextStep('manualEentry')
    }

    getNoDataPic = () => {
        return noFile
    }

    getCheckedResultContent = (checkType, checkedValue, checkedValue1) => {
        if (this.metaAction.gf('data.other.checkedResult') == undefined) return ''
        let content

        switch (checkType) {
            case 'checkTaxpayer':
                if (checkedValue == 0) {
                    content = '纳税人性质：未识别'
                } else if (checkedValue == 1) {
                    content = '纳税人性质：一般纳税人'
                } else if (checkedValue == 2) {
                    content = '纳税人性质：小规模纳税人'
                }
                break;
            case 'excelType':
                content = '模板类型：' + checkedValue
                break;
            case 'accountStandard':
                if (checkedValue == -1) {
                    content = '会计准则：未识别'
                } else if (checkedValue == '2000020002') {
                    content = '会计准则：小企业会计准则'
                } else if (checkedValue == '2000020001') {
                    content = '会计准则：企业会计准则'
                }
                break;
            case 'checkExistDataInExcel':
                content = '有无数据：' + checkedValue
                break;
            case 'checkSameCodeOrName':
                if (checkedValue && checkedValue.length > 0 || checkedValue && checkedValue1.length > 0) {
                    content = '科目是否重复：重复'
                } else {
                    content = '科目是否重复：正常'
                }
                break;
            case 'checkDataFormat':
                if (checkedValue && checkedValue.length > 0) {
                    content = '数据格式检查：不匹配'
                } else {
                    content = '数据格式检查：正常'
                }
                break;
            default:

        }

        return content
    }

    // 导入模板
    leadInTemplate = async (e) => {
        console.log(e.key)
        await this.webapi.financeinit.downloadTemplate({ "type": e.key })
        this.metaAction.toast('success', '下载成功')
    }
    handleUpload = async () => {
        let isMonthly = this.metaAction.gf('data.other.isMonthly')
        if (isMonthly) {
            this.metaAction.sf('data.loading', false)
            this.metaAction.toast('error', '该账套已存在结账月份，需要反结账后才能进行初始化录入')
            return
        }
    }

    // 渲染选择文件
    renderUpload = () => {
        let dataFile = this.metaAction.gf('data.file'),
            selectFileText = dataFile ? "重选文件" : "选择文件", requestUrl,
            disabled = this.metaAction.gf('data.other.disabled')

        const token = fetch.getAccessToken()
        requestUrl = location.protocol + '//' + location.host + '/v1/edf/file/upload?token=' + token

        const props = {
            action: requestUrl,
            showUploadList: false,
            accept: '.xls, .xlsx'
        }

        return (
            <Upload onChange={this.handleOnChange()} {...props} beforeUpload={this.excelbeforeUpload} disabled={disabled}>
                <Button className={disabled ? 'disabledUploadFile' : 'uploadFile'} >{selectFileText}</Button>
            </Upload>
        )
    }

    handleOnChange = () => {
        return async (info) => {
            // LoadingMask.show()
            this.metaAction.sf('data.loading', true)
            if (info.file.status == 'done') {
                // LoadingMask.hide()
                this.metaAction.sf('data.loading', false)
                if (info.file.response.result && info.file.response.value) {
                    let templateType = this.metaAction.gf('data.form.templateType')
                    const checkedResult = await this.webapi.financeinit.importAccountBalance({ type: templateType, fileId: info.file.response.value.id })
                    let tipContent = this.getImportTip(checkedResult)
                    if (tipContent.result == true) {
                        this.metaAction.toast('success', '文件导入成功')
                    } else {
                        let checkStyle = { textAlign: 'left', fontSize: '14px', display: 'inline-block', verticalAlign: 'top' }

                        this.metaAction.toast('error',
                            <div style={checkStyle}>
                                {
                                    tipContent.message.map((o, index) => <p style={{ marginBottom: '0' }}>{index == 0 ? o : (index) + '.' + o}</p>)
                                }
                            </div>
                        )
                    }
                    this.injections.reduce('uploadFile', info.file.response.value, checkedResult)
                }
            } else if (info.file.status === 'error') {
                // LoadingMask.hide()
                this.metaAction.sf('data.loading', false)
                this.metaAction.toast('warning', '文件上传失败')
            }
        }
    }

    excelbeforeUpload = (file) => {
        let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "MacIntel" && navigator.userAgent.toLowerCase().indexOf('chrome') < 0)
        if (!isWin) return

        let type = file.type ? file.type : 'application/vnd.ms-excel'
        if (!(type == 'application/vnd.ms-excel'
            || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            this.metaAction.toast('error', '仅支持上传Excel格式的文件')
            return false
        }
        return this.beforeUpload(file)
    }

    beforeUpload = (file, filetype) => {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (file.size && !isLt10M) {
            this.metaAction.toast('warning', '文件过大，请上传小于10MB的附件')
            return false
        }
    }

    getImportTip = (response) => {
        let message = [], tip = {}

        if (!!response.flag) {
            tip = {
                result: true
            }
        } else {
            message.push('导入失败')
            if (response.checkExistDataInExcel == '导入余额表内无数据') {
                message.push(response.checkExistDataInExcel)
            }
            if (response.checkSameCodeOrName && response.checkSameCodeOrName.length > 0) {
                for (var i = 0; i < response.checkSameCodeOrName.length; i++) {
                    message.push(response.checkSameCodeOrName[i])
                }
            }
            if (response.checkDataFormat && response.checkDataFormat.length > 0) {
                for (var i = 0; i < response.checkDataFormat.length; i++) {
                    message.push(response.checkDataFormat[i])
                }
            }
            tip = {
                result: false,
                message: message
            }
        }
        return tip
    }

    //下一步
    nextStep = (key) => {
        //根据当前页面的参数跳转不同的app key:uploadExcel(上传excel)、manualEentry(手工录入)
        //上传跳转科目初始化对照页面、下载模板和手工录入跳转科目页面
        if (key == 'manualEentry') {
            this.component.props && this.component.props.setPortalContent('科目', 'app-account-subjects-financeinit', { key })
        } else {
            this.component.props && this.component.props.setPortalContent('科目映射', 'ttk-gl-app-financeinit-accountrelation', { key: 'uploadExcel', isUploaded: this.metaAction.gf('data.other.isUploaded') })
            sessionStorage['_isReTabInitData'] = this.metaAction.gf('data.other.isUploaded')
        }
    }

    getaccountingStandardsText = () => {
        
        let accountingStandards = this.metaAction.gf('data.form.accountingStandards'),
            accountingStandardsEnum = this.metaAction.gf('data.form.accountingStandardsEnum') && this.metaAction.gf('data.form.accountingStandardsEnum').toJS(),
            accountingStandardsText
        accountingStandardsText = accountingStandardsEnum.find(item => item.id == accountingStandards)
        // if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
        //     accountingStandardsText = '企业会计准则'
        // } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
        //     accountingStandardsText = '小企业会计准则'
        // } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
        //     accountingStandardsText = '民间非营利组织会计制度'
        // }

        return accountingStandardsText ? accountingStandardsText.name : ''
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
