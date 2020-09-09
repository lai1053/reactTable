import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { consts } from 'edf-consts'
import { fetch, moment as momentUtil, environment } from 'edf-utils'
import { LoadingMask, FormDecorator } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.beforeLoad = option.voucherAction.zipBeforeUpload
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.voucherAction.onInit({ component, injections })

        injections.reduce('init')

        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        //计数器 每次上传文件时累加
        // this.count = 0
        //判断是否是继续导账或者返回
        if (this.component.props.appExtendParams == 'ttk-gl-app-importdata-accountrelation' || (this.component.props.organization != 2 && this.component.props.sourceType != 0)) {
            this.lastStep = true
            // this.count = 1
        } else {
            this.lastStep = false
        }
        //判断对接代账
        if ((appVersion == 107 && sessionStorage["dzSource"] == 1) || appVersion == 114) {
            this.lastStep = false
        }
        this.load()
    }

    load = async (option) => {
        let appVersion = this.metaAction.gf('data.appVersion')
        await this.loadSelect()
        let payload = await this.getPropertyList()
        this.injections.reduce('load', payload)
        if (this.lastStep || this.component.props.sourceType == 0 || (appVersion == 107  && sessionStorage["dzSource"] == 1) || appVersion == 114) {
            let info = await this.webapi.org.query()
            let org = info[0]
            this.metaAction.sfs({
                'data.form.name': sessionStorage['appId'] == 114 ? org.financeOrgName : org.name,
                'data.form.vatTaxpayer': org.vatTaxpayer || '',
                'data.form.enabledDate': momentUtil.stringToMoment(org.enabledYear + '-' + org.enabledMonth).format('YYYY-MM'),
                'data.form.accountingStandards': org.accountingStandards || '',
                'data.form.ts': org.ts,
                'data.form.orgId': org.id
            })
        }
    }
    loadSelect = async () => {
        let arr = []
        //纳税人身份
        arr.push(consts.enum.VATTAXPAYER)
        //企业会计准则
        arr.push(consts.enum.ACCOUNTINGSTANDARDS)
        const enumList = await this.webapi.enumDetail.batchQuery(arr)
        //系统时间
        const date = new Date().getFullYear() + '-01'
        this.injections.reduce('loadSelect', enumList[consts.enum.VATTAXPAYER], enumList[consts.enum.ACCOUNTINGSTANDARDS], date)
    }
    getPropertyList = async () => {
        return {
            list: [
                { enumId: consts.VATTAXPAYER_generalTaxPayer, name: '一般纳税人' },
                { enumId: consts.VATTAXPAYER_smallScaleTaxPayer, name: '小规模纳税人' }
            ]
        }
    }

    create = async () => {//新建企业
        let form = this.metaAction.gf('data.form').toJS()
        let user = this.metaAction.context.get('currentUser') || {}
        let appVersion = this.metaAction.gf('data.appVersion')
        form = Object.assign(form, { creator: user.id })
        if (!!(this.metaAction.gf('data.other.error.fileName'))) return false
        const ok = await this.check([{
            path: 'data.form.fileName', value: form.fileName
        }, {
            path: 'data.form.name', value: form.name
        }, {
            path: 'data.form.vatTaxpayer', value: form.vatTaxpayer
        }, {
            path: 'data.form.enabledDate', value: form.enabledDate
        }, {
            path: 'data.form.accountingStandards', value: form.accountingStandards
        }], 'create')
        if (!ok) return false
        let params = {
            name: form.name,
            vatTaxpayer: form.vatTaxpayer,
            enabledYear: form.enabledDate.split('-')[0],
            enabledMonth: form.enabledDate.split('-')[1],
            accountingStandards: form.accountingStandards,
            id: form.orgId
        }
        if (params.vatTaxpayer == '2000010002') {
            params.isSignAndRetreat = false
        } else if (params.vatTaxpayer == '2000010001') {
            params.isSignAndRetreat = true
        }
        LoadingMask.show()
        //从下一步返回
        if (this.lastStep) {
            let org = this.metaAction.context.get("currentOrg")
            let form = this.metaAction.gf('data.form').toJS()
            if ((org.vatTaxpayer != form.vatTaxpayer) || (org.accountingStandards != form.accountingStandards) || (org.name != form.name)) {
                params.ts = form.ts
                let response = await this.webapi.updateOrg(params)
                if (response) {
                    this.metaAction.context.set('currentOrg', response)
                    let result = await this.webapi.init({ orgId: form.orgId })
                    if (result) {
                        if ((org.vatTaxpayer != form.vatTaxpayer) || (org.accountingStandards != form.accountingStandards)) {
                            await this.webapi.setImpAccountStep({ step: 1 })
                        }
                        LoadingMask.hide()
                        this.nextStep(true)
                    } else {
                        LoadingMask.hide()
                        this.metaAction.toast('error', '初始化账套失败')
                    }
                }
            } else {
                LoadingMask.hide()
                this.nextStep(true)
            }
            //直接从列表点击导账
        } else if (this.component.props.sourceType == 0 || (appVersion == 107 && sessionStorage["dzSource"] == 1) || appVersion == 114) {

            const filePath = this.metaAction.gf('data.other.fileName') || null
            const reinit = await this.webapi.org.reinit()
            if (reinit !== true) {
                LoadingMask.hide()
                this.metaAction.toast('error', '重新初始化失败')
                return false
            }
            //埋点
            _hmt && _hmt.push(['_trackEvent', '系统管理', '导账', '重新初始化'])
            const response = await this.webapi.org.updateOrgDto({ fileName: filePath, orgDto: params })
            if (response) {
                LoadingMask.hide()
                this.nextStep(true)
            } else {
                LoadingMask.hide()
                this.metaAction.toast('error', '初始化账套失败')
            }
        } else {
            let filePath = this.metaAction.gf('data.other.fileName') || null
            let response = await this.webapi.org.create({ fileName: filePath, orgDto: params })
            if (response) {
                // this.metaAction.context.set('currentOrg', response)
                await this.webapi.org.updateCurrentOrg({ orgId: response.id })
                this.metaAction.context.set('currentOrg', response)
                let result = await this.webapi.init({ orgId: response.id })

                if (result) {
                    // await this.webapi.setImpAccountStep({step: 1})
                    LoadingMask.hide()
                    this.nextStep(false)
                } else {
                    LoadingMask.hide()
                    this.metaAction.toast('error', '初始化账套失败')
                }
            } else {
                LoadingMask.hide()
            }
        }
    }
    //下一步
    nextStep = async (isDeleteAsset) => {

        //重置currentOrgStatus，使当前企业没有默认企业
        sessionStorage['currentOrgStatus'] = 1
        //修改企业名称
        if (!!document.querySelector('.currentOrgName')) {
            document.querySelector('.currentOrgName').innerHTML = this.metaAction.gf('data.form.name')
        }
        if (isDeleteAsset) {
            await this.webapi.deleteAssetTmpLst()
        }
        this.component.props && this.component.props.setPortalContent('数据导入', 'ttk-gl-app-importdata-accountrelation', {})
    }
    cancel = async () => {
        this.component.props.setPortalContent('企业管理', 'edf-company-manage')
    }
    fieldChange = async (fieldPath, value, operate) => {
        await this.check([{ path: fieldPath, value }], operate)
    }
    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues)
            return

        let checkResults = []

        for (let o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.name') {
                Object.assign(r, await this.checkName(o.value, operate))
            } else if (o.path == 'data.form.vatTaxpayer') {
                Object.assign(r, await this.checkVatTaxpayer(o.value))
            } else if (o.path == 'data.form.enabledDate') {
                Object.assign(r, await this.checkEnableDate(o.value))
            } else if (o.path == 'data.form.accountingStandards') {
                Object.assign(r, await this.checkAccountingStandards(o.value))
            } else if (o.path == 'data.form.fileName') {
                Object.assign(r, await this.checkFileName(o.value, operate))
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
    checkFileName = (fileName) => {
        var message
        if (this.lastStep) {
            return { errorPath: 'data.other.error.fileName', message }
        }
        if (!fileName) {
            message = '导账文件不能为空'
        }
        return { errorPath: 'data.other.error.fileName', message }
    }
    checkName = async (org, operate) => {
        var message
        if (this.lastStep) {
            let orgInfo = this.metaAction.context.get("currentOrg")
            if (orgInfo.name == org) {
                return { errorPath: 'data.other.error.name', message }
            }
        }
        // let importName = this.metaAction.gf('data.other.importName')
        // if(org && org == importName) {
        //     return { errorPath: 'data.other.error.name', message }
        // }
        if (operate && operate == 'create') {
            if (sessionStorage['appId'] == 114) {
                let orgInfo = this.metaAction.context.get("currentOrg")
                if (await this.webapi.org.financeNameIsExists({ financeOrgName: org, orgId: orgInfo.id }))
                    return { errorPath: 'data.other.error.name', message: "该企业名称已注册" }
            }else if (!!this.component.props.sourceType == 0) {
                let orgInfo = this.metaAction.context.get("currentOrg")
                if (await this.webapi.org.existsSysOrg({ name: org, orgId: orgInfo.id }))
                    return { errorPath: 'data.other.error.name', message: "该企业名称已注册" }
            } else {
                if (await this.webapi.org.existsSysOrg({ name: org }))
                    return { errorPath: 'data.other.error.name', message: "该企业名称已注册" }
            }

        }
        if (!org)
            message = '请输入企业名称'
        else if (org.length > 200)
            message = "企业名称不能超过200个字"
        return { errorPath: 'data.other.error.name', message }
    }
    checkVatTaxpayer = async (vatTaxpayer) => {
        var message
        if (!vatTaxpayer) {
            message = '纳税人性质不能为空'
        }
        return { errorPath: 'data.other.error.vatTaxpayer', message }
    }
    checkEnableDate = async (enableDate) => {
        var message
        if (!enableDate) {
            message = '启用日期不能为空'
        }
        return { errorPath: 'data.other.error.enableDate', message }
    }
    checkAccountingStandards = async (accountingStandards) => {
        var message
        if (!accountingStandards) {
            message = '会计准则不能为空'
        }
        return { errorPath: 'data.other.error.accountingStandards', message }
    }
    uploadChange = async (info) => {
        if (!info.file.status) {
            this.metaAction.toast('error', '仅支持上传zip格式的文件')
            return
        }
        this.metaAction.sf('data.other.error.fileName', undefined)
        LoadingMask.show()
        if (info.file.status === 'done') {
            if (info.file.response.error && info.file.response.error.message) {
                LoadingMask.hide()
                this.metaAction.toast('error', info.file.response.error.message)
            } else if (info.file.response.result && info.file.response.value) {
                this.metaAction.sf('data.form.fileName', info.file.response.value.originalName)
                this.getFileInfo(info.file.response.value.id)
            }
        } else if (info.file.status === 'error') {
            LoadingMask.hide()
            this.metaAction.sf('data.loading', false)
            this.metaAction.toast('error', '上传失败')
        }
    }
    getFileInfo = async (id) => {
        // let info = await this.webapi.upload({fileDto: {id}, isReturnValue: true})
        let info = await this.webapi.upload({ fileDto: { id } })
        // if(info && info.error && info.error.code && info.error.code == 502024) {
        //     this.metaAction.toast('error', info.error.message)
        //     this.metaAction.sfs({
        //         'data.form.fileName': '',
        //         'data.form.name': '',
        //         'data.form.vatTaxpayer': '',
        //         'data.form.enabledDate': momentUtil.stringToMoment(new Date().getFullYear() + '-01').format('YYYY-MM'),
        //         'data.form.accountingStandards': '',
        //         'data.form.orgId': '',
        //         'data.form.ts': '',
        //         'data.other.importName': ''
        //     })
        //     return
        // }
        LoadingMask.hide()
        if (info == null) {
            this.metaAction.toast('error', '导入账套失败')
            this.metaAction.sf('data.other.error.fileName', '上传文件内容错误，请重新上传')
            return
        }

        if (this.lastStep) {
            //如果是已有企业导账，从第二步返回到第一步重新上传文件不删除企业，再点击下一步的时候可以走更新接口
            if (this.component.props.sourceType != 0) {
                let id = this.metaAction.gf('data.form.orgId')
                await this.webapi.org.del({ orgId: id })
            }
            this.lastStep = false
        }
        // this.count++
        // await this.webapi.org.updateCurrentOrg({"orgId": info.id})
        this.metaAction.sfs({
            'data.form.name': info.orgDto.name,
            'data.form.vatTaxpayer': info.orgDto.vatTaxpayer || '',
            'data.form.enabledDate': momentUtil.stringToMoment(info.orgDto.enabledYear + '-' + info.orgDto.enabledMonth).format('YYYY-MM'),
            'data.form.accountingStandards': info.orgDto.accountingStandards || '',
            'data.other.importName': info.orgDto.name,
            'data.other.fileName': info.fileName
        })
    }
    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return token
    }
    downloadTool = () => {
        let url = 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E8%B4%A2%E5%8A%A1%E6%95%B0%E6%8D%AE%E6%99%BA%E8%83%BD%E5%90%88%E8%A7%84%E8%BD%AC%E6%8D%A2%E5%B7%A5%E5%85%B7.exe'
        // let a = document.querySelector('#toolLink')
        // a.setAttribute('href', url)
        // a.click()

        //client open
        if (environment.isClientMode()) {
            window.open(url, "_self")
        }
        else {
            var iframeObject = document.getElementById('downloadForeseeClient')
            if (iframeObject) {
                iframeObject.src = url
            }
            else {
                var iframe = document.createElement('iframe')
                iframe.id = 'downloadForeseeClient'
                iframe.frameborder = "0"
                iframe.style.width = "0px"
                iframe.style.height = "0px"
                iframe.src = url
                document.body.appendChild(iframe)
            }
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
