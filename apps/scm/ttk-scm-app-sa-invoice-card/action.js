import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator, Form, Select, Button, DatePicker, Input, Checkbox, CheckboxGroup, Icon, Popover, ColumnsSetting } from 'edf-component'
import { blankDetail } from './data'
const FormItem = Form.Item
const Option = Select.Option



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
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', :: this.enlargeClick)
        }
        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if (addTabsCloseListen) {
            addTabsCloseListen('ttk-scm-app-sa-invoice-card', () => this.isEditing)
        }


        injections.reduce('init')

        /*
        let _appInfo = this.appInfo

        _appInfo.meta.children[1].children[1].children[0].children["disabled"] = true

        this.metaAction.setMeta(_appInfo)
        */


        this.initLoad(this.component.props.id || null)
        this.renderNum = 1
        this.isEditing = false
    }

    initLoad = async (id) => {
        const response = await this.webapi.delivery.init({ id: id })
        const { baseUrl, softAppName } = this.getBaseUrl()

        if (response.voucher.docId && response.voucher.docSourceTypeName && response.voucher.docSourceTypeName != '系统凭证' && baseUrl) {
            let arrT = []
            arrT.push(response.voucher.docId)
            if (arrT.length) {
                const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                    arrT
                    , {
                        headers: {
                            token: this.getOrgId()
                        }
                    })
                if (restplus.result && restplus.value[0].code) {
                    response.voucher.docCode = restplus.value[0].code
                }
            }
        }
        let sfObj = {}

        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010001) {
            // this.metaAction.sf('data.form.issuedByTax', false)
            sfObj['data.form.issuedByTax'] = false
        }
        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
            // this.metaAction.sf('data.form.issuedByTax', false)
            sfObj['data.form.issuedByTax'] = false
            if (response.voucher.invoiceTypeId == 4000010020) {
                // this.metaAction.sf('data.form.issuedByTax', true)
                sfObj['data.form.issuedByTax'] = true
            }
        }
        if (!id) {
            const currentOrg = this.metaAction.context.get("currentOrg")
            let periodDate = currentOrg.periodDate
            if (periodDate) {
                const monthDate = utils.date.monthStartEndDay(periodDate)
                response.voucher.businessDate = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM-DD')
                response.voucher.invoiceDate = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM-DD')
                response.voucher.authenticatedMonth = monthDate.endDay ? monthDate.endDay.slice(0, 7) : moment().format('YYYY-MM')
            } else {
                response.voucher.businessDate = moment().format('YYYY-MM-DD')
                response.voucher.invoiceDate = moment().format('YYYY-MM-DD')
                response.voucher.authenticatedMonth = moment().format('YYYY-MM')
            }
            if (this.metaAction.context.get("currentOrg").vatTaxpayer === 2000010001) {
                //新增时一般企业和民非企业征收方式默认一般项目
                response.voucher.signAndRetreat = 4000100002;
            }
        }
        // this.metaAction.sf('data.other.auditVisible', false)
        sfObj['data.other.auditVisible'] = false
        sfObj['data.other.pageKey'] = Math.random()

        this.metaAction.sfs(sfObj)
        this.injections.reduce('initLoad', response)

        if (id) {
            await this.archivesObtain(response.voucher.status)
        } else {
            await this.inventoryObtain()
        }

        if (id) {
            // this.getRevenueType()
        }
        if (response.voucher.status) {
            this.newRenderArchives(response.voucher.status)
        }
    }

    inventoryObtain = async () => {
        await this.voucherAction.getInventory({ entity: { isEnable: true } }, `data.other.inventory`)
        let inventory = this.getFullName(this.metaAction.gf(`data.other.inventory`).toJS())
        this.metaAction.sf(`data.other.inventory`, fromJS(inventory))
    }
    renderInventoryTitle = (value, name, nameValue) => {
        const inventory = this.metaAction.gf(name) && this.metaAction.gf(name).toJS()
        const accountStatus = this.metaAction.gf('data.other.accountStatus')
        if ((accountStatus == 4000140002 && value) || !value) {
            return nameValue || ''
        }
        if (inventory && inventory.length) {
            let obj = inventory.find(obj => obj.id == value);
            if (obj) {
                return obj.fullName
            }
        }
        return ''
    }

    /**待优化 */
    archivesObtain = async (status) => {
        this.getBankAccount();
        if (status == 1000020001 || status == 1000020003) {
            const res = await this.webapi.delivery.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "customer,dept,project,inventory" })
            let inventory = this.getFullName(res['存货'])
            this.metaAction.sfs({
                'data.other.customer': fromJS(res['客户']),
                'data.other.department': fromJS(res['部门']),
                'data.other.project': fromJS(res['项目']),
                // 'data.other.bankAccount': fromJS(res['账号']),
                'data.other.inventory': fromJS(inventory),
            })
        } else if (status == 1000020002) {
            const res = await this.webapi.delivery.queryBaseArchives({ "baseArchiveNames": "customer,dept,project,inventory" })
            let inventory = this.getFullName(res['存货'])
            this.metaAction.sfs({
                'data.other.customer': fromJS(res['客户']),
                'data.other.department': fromJS(res['部门']),
                'data.other.project': fromJS(res['项目']),
                //  'data.other.bankAccount': fromJS(res['账号']),
                'data.other.inventory': fromJS(inventory),
            })
        }
    }

    getFullName = (list) => {
        list.map(item => {
            item.fullName = `${item.code} ${item.name} ${item.propertyName} ${item.unitName ? item.unitName : ''}`
            let arr = [item.code, item.name, item.propertyName];
            if (item.unitName) arr.push(item.unitName)
            item.fullNameArr = arr
            return item;
        })
        return list
    }

    getFullNameChildren = (option) => {
        return <div>{
            option.fullNameArr.map((item, index) => {
                return <span className={`fullname${index}`}>{item}</span>
            })
        }</div>
    }

    newRenderArchives = async (status) => {
        let form = this.metaAction.gf('data.form').toJS(), other = this.metaAction.gf('data.other').toJS(),
            projectName = this.metaAction.gf('data.form.projectId') ? this.metaAction.gf('data.form.projectId') : undefined,
            departmentName = this.metaAction.gf('data.form.departmentId') ? this.metaAction.gf('data.form.departmentId') : undefined
        // bankAccountName = this.metaAction.gf('data.form.bankAccountId') ? this.metaAction.gf('data.form.bankAccountId') : undefined
        if (status == 1000020001) {

            if (form.departmentId && form.departmentName) {
                let projectArr = this.metaAction.gf('data.other.project'), projectNow
                if (projectArr) {
                    projectArr = projectArr.size ? projectArr.toJS() : projectArr
                    projectArr.map(item => {
                        if (item.id == projectName && item.isEnable) {
                            projectNow = item.id
                        }
                    })
                    projectName = projectNow ? projectName : undefined
                    if (!projectNow) {
                        this.metaAction.sfs({
                            'data.form.projectName': '',
                            'data.form.projectId': ''
                        })
                    }
                }
            }

            if (form.departmentId && form.departmentName) {
                let departmentArr = this.metaAction.gf('data.other.department'), departmentNow = false
                if (departmentArr) {
                    departmentArr = departmentArr.size ? departmentArr.toJS() : departmentArr
                    departmentArr.map(item => {
                        if (item.id == departmentName) departmentNow = true
                    })
                    departmentName = departmentNow ? departmentName : undefined
                    if (!departmentNow) {
                        this.metaAction.sfs({
                            'data.form.departmentId': '',
                            'data.form.departmentName': ''
                        })
                    }
                }
            }

            let bankAccount = this.metaAction.gf('data.other.bankAccount')
            let settles = form.settles
            let arr = []
            if (bankAccount) {
                bankAccount = bankAccount.size ? bankAccount.toJS() : bankAccount
                if (form.status == 1000020001) {
                    bankAccount.map((i, _index) => {
                        arr.push(i.id)
                    })
                    settles.map((item, index) => {
                        if (item.id) {
                            if (arr.indexOf(item.bankAccountId) == -1) {
                                this.metaAction.sfs({
                                    [`data.form.settles.${index}.bankAccountId`]: '',
                                    [`data.form.settles.${index}.bankAccountName`]: '',
                                })
                            }
                        }
                    })
                }
            }

            if (form.customerId && form.customerName) {
                let customerArr = this.metaAction.gf('data.other.customer'), customerNow
                if (customerArr) {
                    customerArr = customerArr.size ? customerArr.toJS() : customerArr
                    customerArr.map(item => {
                        if (item.id == form.customerId && item.isEnable) {
                            customerNow = item.id
                        }
                    })
                    form.customerId = customerNow ? form.customerId : ''
                    if (!customerNow) {
                        this.metaAction.sfs({
                            'data.form.customerId': '',
                            'data.form.customerName': '',
                            'data.form.customerNameError': true
                        })
                    }
                }
            }
        }
    }

    load = async (voucher) => {
        this.injections.reduce('load', voucher)
    }

    enlargeClick = async (params) => {
        this.getDom()
    }

    onTabFocus = async (params) => {
        params = params.toJS()
        if (params.accessType != 0) {
            if (params.id) {
                this.initLoad(params.id)
            } else {
                this.initLoad(null)
            }
        } else {
            let data = this.metaAction.gf('data').toJS(),
                other = data.other,
                form = data.form,
                isChange = false

            const result = await this.webapi.delivery.init({ id: form.id })

            const { baseUrl, softAppName } = this.getBaseUrl()

            if (result.voucher.docId && result.voucher.docSourceTypeName && result.voucher.docSourceTypeName != '系统凭证' && baseUrl) {
                let arrT = []
                arrT.push(result.voucher.docId)
                if (arrT.length) {
                    const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                        arrT
                        , {
                            headers: {
                                token: this.getOrgId()
                            }
                        })
                    if (restplus.result && restplus.value[0].code) {
                        result.voucher.docCode = restplus.value[0].code
                    }
                }
            }

            if (result.voucher.status == 1000020003) {
                this.metaAction.sf('data.other.voucherStatus', false)
            }
            if (!result.voucher) {
                this.initLoad(null)
            } else {
                let auditVisible = this.metaAction.gf('data.other.auditVisible')
                let discarded = this.metaAction.gf('data.form.discarded')
                if (result.voucher.accountStatus != 4000140002 && form.id && (auditVisible || !discarded)) {
                    let detailHeight = this.metaAction.gf('data.other.detailHeight')
                    if (result.voucher.details) {
                        detailHeight = Number(detailHeight.replace('px', ""))
                        const length = detailHeight <= 245 ? 245 / 35 : detailHeight / 35
                        while (result.voucher.details.length < length) {
                            result.voucher.details.push(blankDetail)
                        }
                    }
                    this.metaAction.sfs({
                        'data.form.issuedByTax': result.voucher.issuedByTax,
                        'data.form.signAndRetreat': result.voucher.signAndRetreat,
                        'data.form.details': fromJS(result.voucher.details)
                    })
                }
                this.metaAction.sfs({
                    'data.form.docCode': result.voucher.docCode,
                    'data.form.ts': result.voucher.ts,
                    'data.form.status': result.voucher.status
                })
            }
            this.metaAction.sfs({
                'data.other.isSignAndRetreat': result.isSignAndRetreat,
                'data.other.revenueType': fromJS(result.businessTypes)
            })

            if (result.beginDate && other.beginDate && result.beginDate.replace(/-/g, '') != other.beginDate.replace(/-/g, '')) {
                isChange = true
                other.beginDate = result.beginDate
            }
            // this.getRevenueType()
            await this.archivesObtain(result.voucher.status)
            this.newRenderArchives(result.voucher.status)
            isChange && this.metaAction.sf('data', fromJS(data))

        }
    }

    getRevenueType = async () => {
        let businessTypes = this.metaAction.gf('data.other.revenueType')
        let inventory = this.metaAction.gf('data.other.inventory')
        inventory = inventory && inventory.toJS()
        businessTypes = businessTypes && businessTypes.toJS()

        let form = this.metaAction.gf('data.form').toJS()
        let detail = form.details
        let arr = [], brr = []

        if (form.status == 1000020001) {
            businessTypes.map((i, _index) => {
                arr.push(i.id)
            })
            inventory.map((i, _index) => {
                brr.push(i.id)
            })

            detail.map((item, index) => {
                if (item.id) {
                    if (arr.indexOf(item.revenueType) == -1) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.revenueType`]: '',
                            [`data.form.details.${index}.revenueTypeName`]: '',
                            [`data.form.style.${index}.revenueTypeStyle`]: true,
                        })
                    }
                    if (brr.indexOf(item.inventoryId) == -1) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.inventory`]: '',
                            [`data.form.details.${index}.inventoryId`]: '',
                            [`data.form.details.${index}.inventoryName`]: '',
                            [`data.form.style.${index}.inventoryStyle`]: true,
                        })
                    }
                }
            })
        }
    }

    getDom = (isNotInit) => {
        let content = document.getElementsByClassName("edfx-app-portal-content-main"),
            detailsDom = document.getElementsByClassName("ttk-scm-app-sa-invoice-card-form-details")[0],
            cardFormHead = document.getElementsByClassName("ttk-scm-app-sa-invoice-card-form-header")[0],
            card = content[0],
            cardHeight = card.clientHeight,
            value = [],
            data = this.metaAction.gf('data').toJS(),
            details = data.form.details,
            length = details.length

        // const cardFormHeadHeight = cardFormHead&&cardFormHead.clientHeight ? cardFormHead&&cardFormHead.clientHeight : 106
        const cardFormHeadHeight = cardFormHead && cardFormHead.clientHeight
        let height = cardHeight - 223 - cardFormHeadHeight

        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        columnSetting = columnSetting && columnSetting.toJS()

        if (!detailsDom || !cardFormHeadHeight || !columnSetting) {
            setTimeout(() => {
                this.renderNum = this.renderNum + 1
                return this.getDom()
            }, 100)
        } else {
            if (height < 110) {
                height = 109
            }
            const detailHeight = this.metaAction.gf('data.other.detailHeight')
            this.metaAction.sf('data.other.detailHeight', height + 'px')

            if (!isNotInit) {
                if (card.length != 0) {
                    length = Math.ceil(height / 35) > 5 ? Math.ceil(height / 35) : 5
                    const blankDetail = {
                        warehouseId: null,
                        inventoryId: null,
                        unitId: null,
                        quantity: null,
                        price: null,
                        taxInclusivePrice: null,
                        taxRateId: null,
                        tax: null,
                        amount: null,
                        taxInclusiveAmount: null
                    }
                    value = Array(length - 5).fill(blankDetail);
                }
                details = details.concat(value)
                this.injections.reduce('setrowsCount', details, details.length)
            }
        }
    }

    handleKeyDown(e, index) {
        if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
            let dom = document.getElementsByClassName('ttk-scm-app-sa-invoice-card-form-header')[0]  //ReactDOM.findDOMNode(this.refs.auxItem)

            if (dom) {
                setTimeout(() => {
                    let nextFocusIndex = this.getNextFocusIndex()
                    if (index) {
                        nextFocusIndex = index
                    }
                    if (nextFocusIndex > -1) {
                        let c = dom.children[nextFocusIndex].children[1].getElementsByClassName('autoFocus_item')[0]
                        if (c) {
                            if (c.className && c.className.includes('ant-calendar-picker')) {
                                c = $(c).find('input')[0]
                            }
                            c.tabIndex = 0
                            c.focus()
                            c.click()
                        }
                    }
                }, 0)
            }
        }
    }

    getNextFocusIndex() {
        let nextFocusIndex
        nextFocusIndex = $(document.activeElement).parents('.ant-row').index()
        const length = $(document.activeElement).parents('.ant-row').siblings().length

        nextFocusIndex++
        if (nextFocusIndex == length + 1) {
            let dom = document.getElementsByClassName('ttk-scm-app-sa-invoice-card-form-header')[0]
            if (dom) {
                let c = dom.children[nextFocusIndex - 1].children[1].getElementsByClassName('autoFocus_item')[0]
                if (c) {
                    c.blur()
                }
            }

            setTimeout(() => {
                this.metaAction.sf('data.other.focusFieldPath', 'root.children.content.children.details.columns.inventoryName.cell.cell,0')
                setTimeout(() => {
                    let a = $('.ttk-scm-app-sa-invoice-card-form-details').find('.ant-select-selection')
                    a.focus()
                    a.click()
                }, 0)
            }, 16)
        }
        return nextFocusIndex > length ? -1 : nextFocusIndex
    }

    renderKey = () => {
        const detailHeight = this.metaAction.gf('data.other.detailHeight').replace('px', '')
        const pageKey = this.metaAction.gf('data.other.pageKey')
        return Number(detailHeight) * pageKey
    }

    componentDidMount = () => {
        this.getDom()
        const win = window
        if (win.addEventListener) {
            document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.attachEvent) {
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
        }

        if (window.addEventListener) {
            window.addEventListener('resize', this.getDom, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.getDom)
        } else {
            window.getDom = this.getDom
        }
        let thisStub = this
        setTimeout(() => {
            let win = document.getElementsByClassName('ttk-scm-app-sa-invoice-card-form-header')[0] //ReactDOM.findDOMNode(thisStub.refs.auxItem)
            if (win) {
                if (win.addEventListener) {
                    win.addEventListener('keydown', :: thisStub.handleKeyDown, false)
                } else if (win.attachEvent) {
                    win.attachEvent('onkeydown', :: thisStub.handleKeyDown)
                } else {
                    win.onKeyDown = :: thisStub.handleKeyDown
                }
            }
        }, 0)
    }

    componentWillUnmount = () => {

        const win = window
        if (win.removeEventListener) {
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.detachEvent) {
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
        }

        let removeEventListener = this.component.props.removeEventListener

        if (removeEventListener) {
            removeEventListener('onTabAdd')
        }
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.getDom, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.getDom)
        } else {
            window.onresize = undefined
        }
    }

    bodyKeydownEvent = (e) => {
        const dom = document.getElementById('ttk-scm-app-sa-invoice-card')
        const modalBody = document.getElementsByClassName('ant-modal-body')
        if (dom && modalBody && modalBody.length < 1) {
            this.keyDownCickEvent({ event: e })
        }
    }

    keyDownAdd = async () => {
        const editing = this.metaAction.gf('data.other.auditVisible')
        if (!editing) {
            const ret = await this.metaAction.modal('confirm', {
                content: '当前界面存在未保存数据，是否保存？'
            })
            if (ret) {
                this.save(true)
            } else {
                this.initLoad()
                this.editCloseTips(false)
            }
        } else {
            this.initLoad()
            this.editCloseTips(false)
        }

    }

    //监听键盘事件
    keyDownCickEvent = (keydown) => {
        if (keydown && keydown.event) {
            let e = keydown.event

            if (e.ctrlKey && e.altKey && (e.key == 'n' || e.keyCode == 78)) { //新增
                // this.add()
                this.keyDownAdd()
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) { // 保存
                this.save(false)
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == '/' || e.keyCode == 191)) { // 保存并新增
                this.save(true)
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == 'y' || e.keyCode == 89)) {
                //审核
                this.audit()
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            //判断设备是否为mac
            else if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 219)) {
                    //上一张
                    this.prev()
                }

                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 221)) {
                    //下一张
                    this.next()
                }
            } else {
                if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 37 || e.keyCode == 219)) {
                    //219 win7 IE11下的keyCode
                    //上一张
                    this.prev()
                }
                else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 39 || e.keyCode == 221)) {
                    //221 win7 IE11下的keyCode
                    //下一张
                    this.next()
                }
            }
        }
    }

    prev = async () => {
        const code = this.metaAction.gf('data.form.code')
        const response = await this.webapi.delivery.previous({ code, isReturnValue: true })


        if (response) {
            if (response.result == false && response.error) {
                this.metaAction.sfs({
                    'data.other.prevDisalbed': true,
                    'data.other.nextDisalbed': false
                })
                this.metaAction.toast('error', response.error.message)
            } else {
                // this.metaAction.sf('data.other.nextDisalbed', false)

                this.metaAction.sfs({
                    'data.other.nextDisalbed': false,
                    'data.other.pageKey': Math.random()
                })

                const { baseUrl, softAppName } = this.getBaseUrl()

                if (response.docId && response.docSourceTypeName && response.docSourceTypeName != '系统凭证' && baseUrl) {
                    let arrT = []
                    arrT.push(response.docId)
                    if (arrT.length) {
                        const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                            arrT
                            , {
                                headers: {
                                    token: this.getOrgId()
                                }
                            })
                        if (restplus.result && restplus.value[0].code) {
                            response.docCode = restplus.value[0].code
                        }
                    }
                }
                this.load(response)
            }
            // this.getRevenueType()
            await this.archivesObtain(response.status)
            this.newRenderArchives(response.status)
        }
    }

    next = async () => {
        const code = this.metaAction.gf('data.form.code')
        const response = await this.webapi.delivery.next({ code, isReturnValue: true })

        if (response) {
            if (response.result == false && response.error) {
                this.metaAction.sfs({
                    'data.other.prevDisalbed': false,
                    'data.other.nextDisalbed': true
                })
                this.metaAction.toast('error', response.error.message)
            } else {

                // this.metaAction.sf('data.other.prevDisalbed', false)
                this.metaAction.sfs({
                    'data.other.prevDisalbed': false,
                    'data.other.pageKey': Math.random()
                })
                const { baseUrl, softAppName } = this.getBaseUrl()

                if (response.docId && response.docSourceTypeName && response.docSourceTypeName != '系统凭证' && baseUrl) {
                    let arrT = []
                    arrT.push(response.docId)
                    if (arrT.length) {
                        const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                            arrT
                            , {
                                headers: {
                                    token: this.getOrgId()
                                }
                            })
                        if (restplus.result && restplus.value[0].code) {
                            response.docCode = restplus.value[0].code
                        }
                    }
                }
                this.load(response)
            }
            // this.getRevenueType()
            await this.archivesObtain(response.status)
            this.newRenderArchives(response.status)
        }
    }

    getTotal = (details) => {
        return '合计'
    }

    setting = async () => {
        // this.metaAction.toast('error', '请实现设置功能')
        let setting = this.metaAction.gf('data.other.columnSetting')
        setting = setting && setting.toJS()
        let initOption = []

        if (setting) {
            let obj = {
                key: setting.code,
                name: setting.name
            }
            obj.option = setting.header && setting.header.cards

            let detailObj = {}
            const objItem = setting.body.tables[0]
            if (objItem) {
                detailObj.key = objItem.name
                detailObj.name = objItem.caption
                detailObj.option = objItem.details
            }
            initOption.push(obj)
            initOption.push(detailObj)
        }

        const res = await this.metaAction.modal('show', {
            title: '显示设置',
            width: 420,
            iconType: null,
            footer: null,
            bodyStyle: { paddingBottom: '10px', fontFamily: 'Microsoft YaHei' },
            children: <ColumnsSetting
                option={initOption}
                singleKey='id'
                sort={false}
                editName={false}
                checkedKey='isVisible'
                labelKey="caption"
            />
        })

        if (res && res.type == 'confirm') {
            this.handleConfirmSet(res.option)
            this.getDom(true)
        } else if (res && res.type == 'reset') {
            this.handleResetSet(setting.code)
            this.getDom(true)
        }
    }

    //设置 恢复默认设置
    handleResetSet = async (code) => {
        if (code) {
            const result = await this.webapi.delivery.reInitByUser({ code: code })
            this.metaAction.sf('data.other.columnSetting', fromJS(result))
            this.getDom(true)
        }
    }

    handleConfirmSet = async (params) => {
        if (params) {
            const setting = this.metaAction.gf('data.other.columnSetting').toJS()

            const cards = params[0] && params[0].option
            const tables = params[1] && params[1].option

            if (setting) {
                setting.header.cards = cards
                setting.body.tables[0].details = tables
            }

            const result = await this.webapi.delivery.updateWithDetail(setting)
            this.metaAction.sf('data.other.columnSetting', fromJS(result))
            this.getDom(true)
        }
    }

    add = async () => {
        const res = await this.metaAction.modal('confirm', {
            title: '放弃',
            content: '点击放弃会重置你所有的操作，确定要放弃吗？',
        })
        if (res) {
            this.initLoad()
            this.editCloseTips(false)
        }
    }

    getBaseUrl = () => {
        const linkConfig = this.metaAction.context.get('linkConfig');
        if (linkConfig) {
            return {
                baseUrl: `${document.location.protocol}//${linkConfig.foreseeClientHost}`,
                softAppName: linkConfig.appName
            }
        } else {
            return {

            }
        }
    }
    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id;
        }
        return ""
    }

    collateInvoice = async ({ data, idList }) => {

        const response = await this.webapi.queryAccountEnable(({ entranceFlag: 'delivery' }))
        if (response.isShow) {
            let aaa = 'sa'
            const resNew = await this.metaAction.modal('show', {
                title: '生成凭证设置',
                width: 405,
                footer: null,
                bodyStyle: { padding: '15px 0px 0px' },
                children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                    store: this.component.props.store,
                    aaa,
                }),
            })
            if (resNew) {
                const ret = await this.metaAction.modal('show', {
                    title: '理票',
                    width: 920,
                    footer: null,
                    bodyStyle: { padding: '10px 12px' },
                    children: this.metaAction.loadApp('ttk-scm-app-collate-invoice', {
                        store: this.component.props.store,
                        vatOrEntry: 0,
                        selectedOption: data,
                        checkboxValue: idList,
                        accountEnableDto: resNew.accountEnableDto,
                        formCard: true
                    }),
                })
                if (ret) {
                    if (ret == 1) return
                    this.metaAction.toast('success', '单据生成凭证成功')
                    this.load(ret)
                }
            }
        } else {
            const ret = await this.metaAction.modal('show', {
                title: '理票',
                width: 920,
                footer: null,
                bodyStyle: { padding: '10px 12px' },
                children: this.metaAction.loadApp('ttk-scm-app-collate-invoice', {
                    store: this.component.props.store,
                    vatOrEntry: 0,
                    selectedOption: data,
                    checkboxValue: idList,
                    accountEnableDto: response.accountEnableDto,
                    formCard: true
                }),
            })
            if (ret) {
                if (ret == 1) return
                this.metaAction.toast('success', '单据生成凭证成功')
                this.load(ret)
            }
        }
    }
    audit = async () => {


        const id = this.metaAction.gf('data.form.id'),
            ts = this.metaAction.gf('data.form.ts'),
            status = this.metaAction.gf('data.form.status'),
            docId = this.metaAction.gf('data.form.docId'),
            customerId = this.metaAction.gf('data.form.customerId'),
            docCode = this.metaAction.gf('data.form.docCode'),
            docSourceTypeName = this.metaAction.gf('data.form.docSourceTypeName'),
            details = this.metaAction.gf('data.form.details').toJS();

        if (!id && !ts) {
            this.metaAction.toast('error', '请保存单据')
            return
        }
        const { baseUrl, softAppName } = this.getBaseUrl();
        if (status == consts.consts.VOUCHERSTATUS_NotApprove || status == consts.consts.VOUCHERSTATUS_Rejected) {
            if (!this.checkForSave()) return
            if (!customerId) {
                const queryAchivalAccount = await this.webapi.queryAchivalAccount();
                if (queryAchivalAccount) {
                    const confirm = await this.metaAction.modal('confirm', {
                        title: '提示',
                        width: 500,
                        okText: '是',
                        cancelText: '否',
                        content: queryAchivalAccount
                    })
                    const accountSet = confirm ? 1 : 0;
                    await this.webapi.saveAchivalAccount({ accountSet });
                }
            }

            if (!baseUrl) {

                let param = {}
                let accountEnableDto = {}
                accountEnableDto.entranceFlag = 'delivery'
                param.accountEnableDto = accountEnableDto

                const responseNew = await this.webapi.queryAccountEnable(param)
                let aaa = 'sa'
                if (responseNew.isShow) {
                    const resNew = await this.metaAction.modal('show', {
                        title: '生成凭证设置',
                        width: 405,
                        footer: null,
                        bodyStyle: { padding: '15px 0px 0px' },
                        children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                            store: this.component.props.store,
                            aaa,
                        }),
                    })
                    if (resNew) {
                        let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'delivery' })
                        if (checkAccountIsUsed) {
                            const ret = await this.metaAction.modal('confirm', {
                                // title: '',
                                content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                            })
                            if (!ret) {
                                this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                                return
                            }
                        }
                    }
                } else {
                    let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'delivery' })
                    if (checkAccountIsUsed) {
                        const ret = await this.metaAction.modal('confirm', {
                            // title: '',
                            content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                        })
                        if (!ret) {
                            this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                            return
                        }
                    }
                }

                //存在未匹配存货弹出理票弹框
                const getInvoiceInvMatch = await this.webapi.getInvoiceInvMatch({
                    type: 'generateDoc',
                    isArrival: false,
                    isDelivery: true,
                    arrivalIdList: [],
                    deliveryIdList: [id]
                });

                if (getInvoiceInvMatch.allMatched !== true) {
                    return await this.collateInvoice({ data: [{ id, ts }], idList: [id] });
                }

                const response = await this.webapi.delivery.audit({ id, ts })
                if (response) {
                    if (response.result == false && response.error) {
                        this.metaAction.toast('error', response.error.message)
                    } else {
                        this.metaAction.toast('success', '单据生成凭证成功')
                        this.load(response)
                        this.metaAction.sf('data.form.attachmentStatus', 1)
                    }
                }
            } else {
                //生成T+凭证
                // const inventoryIdList = [];

                // details.forEach(d => {
                //     if (d.inventoryId && inventoryIdList.indexOf(d.inventoryId) == -1) {
                //         inventoryIdList.push(d.inventoryId)
                //     }
                // })

                // let param = {}
                // let accountEnableDto = {}
                // accountEnableDto.entranceFlag = 'delivery'
                // param.accountEnableDto = accountEnableDto

                // const responseNew = await this.webapi.queryAccountEnable(param)
                // let aaa = 'sa'
                // if (responseNew.isShow) {
                //     const resNew = await this.metaAction.modal('show', {
                //         title: '生成凭证设置',
                //         width: 405,
                //         footer: null,
                //         bodyStyle: { padding: '15px 0px 0px' },
                //         children: this.metaAction.loadApp('ttk-scm-app-subject-card', {
                //             store: this.component.props.store,
                //             aaa,
                //         }),
                //     })
                //     if (resNew) {
                //         let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'delivery' })
                //         if (checkAccountIsUsed) {
                //             const ret = await this.metaAction.modal('confirm', {
                //                 // title: '',
                //                 content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                //             })
                //             if (!ret) {
                //                 this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                //                 return
                //             }
                //         }
                //     }
                // } else {
                //     let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'delivery' })
                //     if (checkAccountIsUsed) {
                //         const ret = await this.metaAction.modal('confirm', {
                //             // title: '',
                //             content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                //         })
                //         if (!ret) {
                //             this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                //             return
                //         }
                //     }
                // }


                const response = await this.metaAction.modal('show', {
                    title: '生成凭证',
                    width: 720,
                    okText: '确定',
                    footer: null,
                    bodyStyle: { padding: '10px 12px' },
                    children: this.metaAction.loadApp('ttk-scm-get-voucher-to-tj', {
                        store: this.component.props.store,
                        vatOrEntry: 0,
                        selectedData: {
                            id,
                            ts
                        },
                        baseUrl,
                        softAppName,
                        // customerIdList: customerId ? [customerId] : [],//客户IDlist
                        // inventoryIdList,//存货IDlist
                        entity: 'card',
                        deliveryIdList: [id]
                    }),
                })
                if (response == 'false') {
                    return
                }
                if (response) {
                    if (response.result == false && response.error) {
                        this.metaAction.toast('error', response.error.message)
                    } else {

                        const { baseUrl, softAppName } = this.getBaseUrl()

                        if (response.docId && response.docSourceTypeName && response.docSourceTypeName != '系统凭证' && baseUrl) {
                            let arrT = []
                            arrT.push(response.docId)
                            if (arrT.length) {
                                const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/externalDocQuery`,
                                    arrT
                                    , {
                                        headers: {
                                            token: this.getOrgId()
                                        }
                                    })
                                if (restplus.result && restplus.value[0].code) {
                                    response.docCode = restplus.value[0].code
                                }
                            }
                        }

                        this.metaAction.toast('success', '生成凭证成功')
                        this.load(response)
                        this.metaAction.sf('data.form.attachmentStatus', 1)
                    }
                }
            }
        } else {
            if (baseUrl && docSourceTypeName === `${softAppName}凭证`) {
                //删除Tplus凭证
                const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/deleteBatch`,
                    [{
                        externalCode: docId
                    }]
                    , {
                        headers: {
                            token: this.getOrgId()
                        }
                    })
                //Tplus成功的数据返回给云平台
                if (restplus && restplus.error) {
                    this.metaAction.toast('error', `${restplus.error.message}`);
                    return
                } else if (restplus && restplus.result) {
                    if (restplus.value.failItems && restplus.value.failItems.length > 0) {
                        if (!/不存在/.test(restplus.value.failItems[0].msg)) {
                            this.metaAction.toast('error', `${restplus.value.failItems[0].msg}`);
                            return
                        }
                    }
                    const response = await this.webapi.delivery.unaudit({ id, ts, isReturnValue: true })
                    if (response) {
                        if (response.result == false && response.error) {
                            this.metaAction.toast('error', response.error.message)
                        } else {
                            this.metaAction.toast('success', '单据删除凭证成功')
                            this.load(response)
                            this.metaAction.sf('data.form.attachmentStatus', 0)
                            // this.getRevenueType()
                            await this.archivesObtain(response.status)
                            this.newRenderArchives(1000020001)
                        }
                    }
                } else {
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                    return
                }
            } else {
                const response = await this.webapi.delivery.unaudit({ id, ts, isReturnValue: true })
                if (response) {
                    if (response.result == false && response.error) {
                        this.metaAction.toast('error', response.error.message)
                    } else {
                        this.metaAction.toast('success', '删除凭证成功')
                        this.load(response)
                        this.metaAction.sf('data.form.attachmentStatus', 0)
                        // this.getRevenueType()
                        await this.archivesObtain(response.status)
                        this.newRenderArchives(1000020001)
                    }
                }

            }
        }
    }

    //是否为民非性质企业（民非性不显示生成凭证）
    notMinfei = () => {
        let accountingStandards = this.metaAction.context.get('currentOrg').accountingStandards;
        return accountingStandards !== 2000020008 && this.component.props.bsgztAccessTaxlist !== 1 ? true : false
    }
    getAuditBtnText = () => {
        const { baseUrl, softAppName } = this.getBaseUrl()
        const status = this.metaAction.gf('data.form.status')
        // if (!baseUrl) {
        //     return status == consts.consts.VOUCHERSTATUS_Approved ? '删除凭证' : '生成凭证'
        // } else {
        //     return status == consts.consts.VOUCHERSTATUS_Approved ? '删除T+凭证' : '生成T+凭证'
        // }

        return status == consts.consts.VOUCHERSTATUS_Approved ? '删除凭证' : (!baseUrl ? '生成凭证' : `生成${softAppName}凭证`)
    }

    history = async () => {
        this.component.props.setPortalContent('销项', 'ttk-scm-app-sa-invoice-list')
    }

    moreMenuClick = (e) => {
        switch (e.key) {
            case 'del':
                this.del()
                break
            // case 'generateReturn':
            //     this.generateReturn()
            //     break
            case 'receive':
                this.receive()
                break
            case 'deductions':
                this.deductions()
                break
            case 'antiAudit':
                this.audit()
                break
        }
    }

    del = async () => {
        const id = this.metaAction.gf('data.form.id'),
            ts = this.metaAction.gf('data.form.ts')
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            const response = await this.webapi.delivery.del({ id, ts })
            this.metaAction.toast('success', '删除单据成功')
            this.initLoad()
        }
    }

    generateReturn = async () => {
        //生成红字销售订单

        let id = this.metaAction.gf(`data.form.id`),
            ts = this.metaAction.gf(`data.form.ts`)
        if (!id && !ts) {
            voucher.toast('请保存单据!')
            return
        }

        let response = await this.webapi.delivery.init({ "deliveryTypeId": 133 })
        if (response) {
            let responseValue = this.metaAction.gf('data.form').toJS()
            let data = {
                form: {
                    code: responseValue.code,
                    enclosures: responseValue.enclosures,
                    businessDate: responseValue.businessDate,
                    orgId: responseValue.orgId,
                    invoiceNumber: responseValue.invoiceNumber,
                    invoiceCode: responseValue.invoiceCode,
                    creatorName: responseValue.creatorName,
                    //invoiceType: responseValue.invoiceType,
                    invoiceTypeId: responseValue.invoiceType.enumItemId,
                    invoiceTypeName: responseValue.invoiceType.enumItemName,
                    //responseValue.defaultInvoiceTypeName
                    titleText: '红字销售订单',
                    deliveryTypeId: 133,
                    settledAmount: responseValue.settledAmount,
                    totalAmount: responseValue.totalAmount,
                    totalAmountWithTax: responseValue.totalAmountWithTax,
                    totalSettleAmount: responseValue.totalSettleAmount,
                    receiveAmount: responseValue.receiveAmount,
                    remark: responseValue.remark,
                    customerId: responseValue.customer.id,
                    customerName: responseValue.customer.name,
                    departmentId: responseValue.department.id,
                    departmentName: responseValue.department.name,
                    salesPersonId: responseValue.person.id,
                    salesPersonName: responseValue.person.name,
                    bankAccountId: responseValue.bankAccount.id,
                    bankAccountName: responseValue.bankAccount.name,
                    projectId: responseValue.project.id,
                    projectName: responseValue.project.name,
                    details: [

                    ],
                    other: {
                        status: consts.status.VOUCHER_STATUS_ADD,
                    }
                }
            }
            data.form.details = responseValue.details.map(o => {
                if (o.inventory && o.inventory.id) {
                    return {
                        voucherId: o.voucherId,
                        createTime: o.createTime ? moment(o.createTime).format('YYYY-MM-DD HH:mm:ss') : '',
                        amount: -(o.amount),
                        amountWithTax: -(o.amountWithTax),
                        status: o.status,
                        orderNumber: o.orderNumber,
                        inventoryId: o.inventory.id,
                        inventoryName: o.inventory.name,
                        inventoryCode: o.inventory.code,
                        codeAndName: o.inventory.codeAndName,
                        specification: o.inventory.specification,
                        unit: o.inventory.unit,
                        quantity: -(o.quantity),
                        price: o.price,
                        tax: -(o.tax),
                        taxRateId: o.taxRate.id,
                        taxRateName: o.taxRate.name,
                        taxRate: o.taxRate.value,
                        creator: o.creator
                    }
                }
            })

            this.injections.reduce('load', data.form)
        }
    }

    receive = () => {
        // 收款
        const data = this.metaAction.gf('data').toJS()
        data.form.details = data.form.details.filter(o => o.amount)
        let details = data.form.details.map((item) => {
            return {
                businessTypeId: 3001002001001,
                supplierId: data.form.supplierId,
                departmentId: data.form.departmentId,
                personId: data.form.personId,
                projectId: data.form.projectId,
                amount: item.amount,
                fees: null,
                remark: null
            }
        })
        const obj = {
            businessDate: data.form.businessDate,
            summary: null,
            remark: data.form.remark,
            details: details,
            attachments: data.form.attachments
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '收款单',
                'ttk-scm-app-proceeds-card',
                { accessType: 1, obj }
            )
    }

    getControlVisible = () => {
        let v = true,
            invoiceType = this.metaAction.gf('data.form.invoiceType')
        if (invoiceType) {
            if (invoiceType.get('enumItemId') === consts.ticketType.pp.id) return false
        }
        return v
    }

    save = async (isNew) => {
        if (!this.checkForSave()) return
        let ok = this.metaAction.gf('data.ok')
        if (!ok) return false
        this.metaAction.sf('data.ok', false)
        let form = this.metaAction.gf('data.form').toJS()

        if (form.details) {
            form.details = form.details.filter(detail => {
                return (detail.inventoryId || detail.quantity || detail.price || detail.amount)
            })
        }

        if (form.settles.length != 0) {
            form.settles = form.settles.filter((item) => {
                return item.bankAccountId
            })
            form.settles = form.settles.map((item) => { //去除多余的字段
                if (item.bankAccountName) {
                    delete item.bankAccountName
                }
                return item
            })
        }

        let { attachmentFiles, ...otherParmas } = form
        let params = {
            ...otherParmas,
            attachments: attachmentFiles
        }
        //控制单价为零时为null
        for (var i = 0; i < params.details.length; i++) {
            if (params.details[i].price == 0) {
                params.details[i].price = null
            }
        }
        //控制数量为零时为null
        for (var i = 0; i < params.details.length; i++) {
            if (params.details[i].quantity == 0) {
                params.details[i].quantity = null
            }
            if (params.details[i].propertyDetailId == undefined) {
                params.details[i].propertyDetailId = null
            }
            if (params.details[i].invoiceInvName == undefined) {
                params.details[i].invoiceInvName = null
            }

            if (!params.details[i].inventoryName) {
                params.details[i].inventoryId = null
            }
        }

        // const isDisableBank = this.metaAction.gf('data.other.isDisableBank')
        // if (isDisableBank) { //退货业务不支持现结
        //     params.settles = []
        // }

        // let signAndRetreat = this.metaAction.gf('data.form.signAndRetreat')
        // if (signAndRetreat) {
        //     params.signAndRetreat = 4000100002
        // } else {
        //     params.signAndRetreat = 4000100001
        // }
        // params.signAndRetreat=signAndRetreat
        if (params.id || params.id == 0) {
            const response = await this.webapi.delivery.update(params)
            if (response) {
                this.metaAction.toast('success', '保存更新成功')
                this.metaAction.sf('data.ok', true)
                if (!isNew) {
                    this.load(response)
                } else {
                    this.initLoad()
                }
            } else {
                this.metaAction.sf('data.ok', true)
            }
        }
        else {
            const response = await this.webapi.delivery.create(params)
            if (response) {
                this.metaAction.toast('success', '保存单据成功')
                this.metaAction.sf('data.ok', true)
                if (!isNew) {
                    this.load(response)
                } else {
                    this.initLoad()
                }
            } else {
                this.metaAction.sf('data.ok', true)
            }
        }
        this.editCloseTips(false)
    }

    checkForSave = () => {
        //this.metaAction.sf('data.other.focusFieldPath', 'root.children.content.children.formHeader.c4')
        const form = this.metaAction.gf('data.form').toJS()

        //控制金额为零时为null
        for (var i = 0; i < form.details.length; i++) {
            if (form.details[i].amount == 0) {
                this.metaAction.toast('error', `明细第${i + 1}行金额不能为空`)
                return false
            }
        }

        let msg = this.voucherAction.checkSaveInvoice(form, 'sa')

        for (var j = 0; j < form.settles.length; j++) {
            if (form.settles[j].amount < 0) {
                let moneys = 0
                for (var i = 0; i < form.details.length; i++) {
                    if (form.details[i].taxInclusiveAmount != null) {
                        moneys += Number(form.details[i].taxInclusiveAmount);
                    }
                }
                let paymentAmount = 0
                for (var x = 0; x < form.settles.length; x++) {
                    paymentAmount += Number(form.settles[x].amount);
                }
                if (moneys > 0) {
                    this.metaAction.toast('error', '结算金额和明细金额正负不一致')
                    return false
                }
                if (paymentAmount < moneys.toFixed(2)) {
                    this.metaAction.toast('error', '结算金额不能小于价税合计金额')
                    return false
                }
            }

            if (form.settles[j].amount > 0) {
                let moneys = 0
                for (var i = 0; i < form.details.length; i++) {
                    if (form.details[i].taxInclusiveAmount != null) {
                        moneys += Number(form.details[i].taxInclusiveAmount);
                    }
                }
                let paymentAmount = 0
                for (var x = 0; x < form.settles.length; x++) {
                    paymentAmount += Number(form.settles[x].amount);
                }
                if (moneys < 0) {
                    this.metaAction.toast('error', '结算金额和明细金额正负不一致')
                    return false
                }
                if (paymentAmount > moneys.toFixed(2)) {
                    this.metaAction.toast('error', '结算金额不能大于价税合计金额')
                    return false
                }
            }
        }

        // for (var i = 0; i < form.details.length; i++) {
        //     if (form.details[i].taxInclusiveAmount > 0) {
        //         for (var j = 0; j < form.details.length; j++) {
        //             if (form.details[j].taxInclusiveAmount < 0) {
        //                 this.metaAction.toast('error', '销项发票蓝字时，全部为正数，红字时，全部为负数，不支持正负混录')
        //                 return false
        //             }
        //         }
        //     }
        //     if (form.details[i].taxInclusiveAmount < 0) {
        //         for (var j = 0; j < form.details.length; j++) {
        //             if (form.details[j].taxInclusiveAmount > 0) {
        //                 this.metaAction.toast('error', '销项发票蓝字时，全部为正数，红字时，全部为负数，不支持正负混录')
        //                 return false
        //             }
        //         }
        //     }
        // }

        if (form.invoiceDate) {
            if (form.businessDate) {
                let businessDate = Number(form.businessDate.replace(/-/g, ''))
                let invoiceDate = Number(form.invoiceDate.replace(/-/g, ''))
                if (businessDate < invoiceDate) {
                    this.metaAction.sf('data.form.dateError', true)
                    this.metaAction.toast('error', '单据日期不能小于开票日期')
                    return false
                }
            }
        }
        let errorList = {}
        for (var i = 0; i < msg.length; i++) {
            if (msg[i] == "单据日期不能为空") {
                errorList['data.form.businessDateError'] = true
                //this.metaAction.sf('data.form.businessDateError', true)
            }
            if (msg[i] == "购方名称不能为空") {
                errorList['data.form.customerNameError'] = true
                //this.metaAction.sf('data.form.customerNameError', true)
            }
            if (msg[i] == "发票号码长度必须为8位") {
                errorList['data.form.invoiceNumberError'] = true
                //this.metaAction.sf('data.form.invoiceNumberError', true)
            }
            if (msg[i] == "发票代码长度必须为10位或者12位") {
                errorList['data.form.invoiceCodeError'] = true
                //this.metaAction.sf('data.form.invoiceCodeError', true)
            }

            this.metaAction.sfs(errorList)
        }



        if (msg.length > 0) {
            this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
            return false
        }

        let otherErrorMsg = this.voucherAction.checkSaveOtherInvoice(form)

        if (otherErrorMsg[0] == "结算方式不能为空") {
            this.metaAction.sf('data.form.bankAccountNameError', true)
        }
        if (otherErrorMsg[0] == "结算金额不能为空或零") {
            this.metaAction.sf('data.form.amountError', true)
        }
        if (otherErrorMsg.length > 0) {
            this.metaAction.toast('error', this.getDisplayErrorMSg(otherErrorMsg))
            return false
        }
        if (form.attachmentFiles.length > 20) {
            this.metaAction.toast('error', '附件上传最多为20个')
            return false
        }
        for (var y = 0; y < form.settles.length; y++) {
            if (form.settles[y].amount == "0.00") {
                this.metaAction.sf('data.form.amountError', true)
                this.metaAction.toast('error', '结算金额不能为零')
                return false
            }
            if (form.settles[y].bankAccountId == null) {
                this.metaAction.sf('data.form.bankAccountNameError', true)
                this.metaAction.toast('error', "结算方式不能为空")
                return false
            }
        }

        // 差额发票控制
        let deductionAmount = this.metaAction.gf('data.form.deductionAmount')
        if (deductionAmount && deductionAmount != undefined) {
            for (var i = 0; i < form.details.length; i++) {
                if (form.details[i].amount) {
                    if (form.details[i].amount == deductionAmount) {
                        this.metaAction.toast('error', '扣除额不能等于金额')
                        return false
                    }
                    if (form.details[i].amount > 0) {
                        if (deductionAmount < 0) {
                            this.metaAction.toast('error', '扣除额应该大于等于0')
                            return false
                        }
                        if (form.details[i].amount < deductionAmount) {
                            this.metaAction.toast('error', '扣除额大于金额，不能保存')
                            return false
                        }
                    }
                    if (form.details[i].amount < 0) {
                        if (deductionAmount > 0) {
                            this.metaAction.toast('error', '扣除额应该小于等于0')
                            return false
                        }
                        if (form.details[i].amount > deductionAmount) {
                            this.metaAction.toast('error', '扣除额小于金额，不能保存')
                            return false
                        }
                    }
                    return true
                }
            }
        }

        const error = this.metaAction.gf('data.error').toJS()
        for (let key in error) {
            if (error[key] instanceof Object) {
                for (let name in error[key]) {
                    if (error[key]['quantity'] && error[key]['price']) {
                        const dom = <div><div>数量不能大于9999999999.999999,请调整</div><div>单价不能大于9999999999.999999,请调整</div></div>
                        this.metaAction.toast('error', dom)
                        return false
                    }
                    if (name == 'quantity' && error[key][name]) {
                        this.metaAction.toast('error', `数量不能大于9999999999.999999,请调整`)
                        return false
                    }
                    if (name == 'price' && error[key][name]) {
                        this.metaAction.toast('error', `单价不能大于9999999999.999999,请调整`)
                        return false
                    }
                }
            }
        }

        return true
    }

    getDisplayErrorMSg = (msg) => {
        return <div style={{ display: 'inline-table' }}>{msg.map(item => <div style={{ textAlign: 'left' }}>{`· ${item}`}<br /></div>)}</div>
    }

    getCustomer = () => {
        this.voucherAction.getCustomer({ entity: { isEnable: true } }, 'data.other.customer')
    }
    getDepartment = () => {
        this.voucherAction.getDepartment({ entity: { isEnable: true } }, 'data.other.department')
    }
    getProject = () => {
        this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project')
    }

    getBankAccount = () => {
        this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050009"] }, 'data.other.bankAccount')
    }

    cancel = () => {
        this.injections.reduce('init')
    }

    onFieldChange = (field, storeField, rowIndex, rowData, index, id) => {
        switch (storeField) {
            case 'data.other.taxRateTypes':
                if (rowData.taxRate || rowData.taxRate == 0) {
                    storeField = "data.other.taxRateTypes"
                }
                else {
                    storeField = "data.other.taxRateType"
                }
                field = {
                    id: 'data.form.details.' + rowIndex + '.taxRateType',
                    name: 'data.form.details.' + rowIndex + '.taxRateTypeName'
                }
                break
            case 'data.other.customer':
                this.metaAction.sf('data.form.customerNameError', false)
                break
            case 'data.other.bankAccount':
                this.metaAction.sf('data.form.bankAccountNameError', false)
                break
            case 'data.other.inventory':
                let inventoryStyle = this.metaAction.gf(`data.form.style.${rowIndex}.inventoryStyle`)
                if (inventoryStyle) {
                    this.metaAction.sf(`data.form.style.${rowIndex}.inventoryStyle`, false)
                    this.metaAction.sf(`data.form.style.${rowIndex}.revenueTypeStyle`, false)
                }
                field = {
                    id: `data.form.details.${rowIndex}.inventoryId`,
                    name: `data.form.details.${rowIndex}.inventoryName`,
                    code: `data.form.details.${rowIndex}.inventoryCode`,
                    unitId: `data.form.details.${rowIndex}.unitId`,
                    unitName: `data.form.details.${rowIndex}.unitName`,
                    revenueType: `data.form.details.${rowIndex}.revenueType`,
                    revenueTypeName: `data.form.details.${rowIndex}.revenueTypeName`,
                    inventoryType: `data.form.details.${rowIndex}.inventoryType`,
                    inventoryTypeName: `data.form.details.${rowIndex}.inventoryTypeName`,
                    taxRateType: `data.form.details.${rowIndex}.taxRateType`,
                    taxRateTypeName: `data.form.details.${rowIndex}.taxRateTypeName`,
                    propertyName: `data.form.details.${rowIndex}.propertyName`,
                    propertyDetailName: `data.form.details.${rowIndex}.propertyDetailName`,
                    specification: `data.form.details.${rowIndex}.specification`,
                }
                if (id == undefined) {
                    this.metaAction.sfs({
                        [`data.form.details.${rowIndex}.amount`]: null,
                        [`data.form.details.${rowIndex}.inventoryCode`]: null,
                        [`data.form.details.${rowIndex}.inventoryId`]: null,
                        [`data.form.details.${rowIndex}.inventoryName`]: null,
                        [`data.form.details.${rowIndex}.inventoryType`]: null,
                        [`data.form.details.${rowIndex}.inventoryTypeName`]: null,
                        [`data.form.details.${rowIndex}.price`]: null,
                        [`data.form.details.${rowIndex}.propertyDetailName`]: null,
                        [`data.form.details.${rowIndex}.propertyName`]: null,
                        [`data.form.details.${rowIndex}.quantity`]: null,
                        [`data.form.details.${rowIndex}.revenueType`]: null,
                        [`data.form.details.${rowIndex}.invoiceInvName`]: null,
                        [`data.form.details.${rowIndex}.revenueTypeName`]: null,
                        [`data.form.details.${rowIndex}.specification`]: null,
                        [`data.form.details.${rowIndex}.tax`]: null,
                        [`data.form.details.${rowIndex}.taxInclusiveAmount`]: null,
                        [`data.form.details.${rowIndex}.taxRate`]: null,
                        [`data.form.details.${rowIndex}.taxRateId`]: null,
                        [`data.form.details.${rowIndex}.taxRateName`]: null,
                        [`data.form.details.${rowIndex}.taxRateType`]: null,
                        [`data.form.details.${rowIndex}.taxRateTypeName`]: null,
                        [`data.form.details.${rowIndex}.unitId`]: null,
                        [`data.form.details.${rowIndex}.unitName`]: null,
                    })
                }
                break
            case 'data.other.revenueType':
                let revenueTypeStyle = this.metaAction.gf(`data.form.style.${rowIndex}.revenueTypeStyle`)
                if (revenueTypeStyle) {
                    this.metaAction.sf(`data.form.style.${rowIndex}.revenueTypeStyle`, false)
                }
                field = {
                    id: `data.form.details.${rowIndex}.revenueType`,
                    name: `data.form.details.${rowIndex}.revenueTypeName`,
                }
                break

            case 'data.other.inventoryTypes':
                field = {
                    id: `data.form.details.${rowIndex}.inventoryType`,
                    name: `data.form.details.${rowIndex}.inventoryTypeName`,
                }
                break

            case 'data.other.taxRateTypes':
                field = {
                    id: `data.form.details.${rowIndex}.taxRateType`,
                    name: `data.form.details.${rowIndex}.taxRateTypeName`,
                }
                break
        }
        let value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
        let sfObj = {}
        const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer
        if (!field || !storeField) return
        if (value) {
            // Object.keys(field).forEach(key => {
            //     // this.metaAction.sf(field[key], value.get(key))
            //     sfObj[field[key]] = value.get(key)
            // })
            if (storeField == 'data.other.inventory') {
                let formId = this.metaAction.gf('data.form.id')
                if (formId && (rowData.taxRate || rowData.taxRate == 0)) {
                    let fieldObj = {
                        id: field.id,
                        name: field.name,
                        code: field.code
                    }
                    Object.keys(fieldObj).forEach(key => {
                        sfObj[fieldObj[key]] = value.get(key)
                    })
                } else {
                    this.handleChangeInventory(field, value, sfObj, rowData, rowIndex, vatTaxpayer)
                }
            } else {
                Object.keys(field).forEach(key => {
                    sfObj[field[key]] = value.get(key)
                })
            }

            // if (storeField == 'data.other.inventory') {

            //     this.handleChangeInventory(field, value, sfObj, rowData, rowIndex, vatTaxpayer)
            // }

        } else {
            Object.keys(field).forEach(key => {
                if (storeField == 'data.other.inventory') {
                    sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
                    sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeId`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeName`] = null
                } else {
                    sfObj[field[key]] = null
                }
            })
        }
        if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
            if (storeField == "data.other.invoiceType") {
                if (id == 4000010020) {
                    sfObj['data.form.issuedByTax'] = true
                } else {
                    sfObj['data.form.issuedByTax'] = false
                }
            }
        }


        if (storeField == 'data.other.bankAccount') {
            if (value) {
                let settles = this.metaAction.gf('data.form.settles')
                settles = settles ? settles.toJS() : []
                const id = value.toJS().id, name = value.toJS().name, amount = this.metaAction.gf('data.form.paymentAmount')

                if (settles.length == 0) {
                    const obj = {
                        bankAccountId: id,
                        amount: '',
                        bankAccountName: name,
                    }
                    settles.push(obj)
                } else {
                    settles[index].bankAccountId = id
                    settles[index].bankAccountName = name
                }
                sfObj['data.form.settles'] = fromJS(settles)
            } else {
                let settles = this.metaAction.gf('data.form.settles')
                settles = settles ? settles.toJS() : []

                settles[index].bankAccountId = null
                settles[index].bankAccountName = null
                sfObj['data.form.settles'] = fromJS(settles)
            }
        }
        this.editCloseTips(true)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)

        //最后一行修改时自动添加一行
        if (storeField == "data.other.inventory") {
            let details = this.metaAction.gf('data.form.details').toJS()
            if (details.length - 1 == rowIndex) {
                let details = this.metaAction.gf('data.form.details').toJS()
                details.push(blankDetail)
                // sfObj['data.form.details'] = fromJS(details)
                this.metaAction.sf('data.form.details', fromJS(details))
            }
        }
    }

    handleChangeInventory = (field, value, sfObj, rowData, rowIndex, vatTaxpayer) => {
        Object.keys(field).forEach(key => {
            sfObj[field[key]] = value.get(key)
        })
        const amount = utils.number.round(rowData.amount, 2),
            tax = utils.number.round(amount * value.get('taxRate'), 2),
            taxInclusiveAmount = utils.number.round(amount + tax, 2),
            taxRate = value.get('taxRate')

        sfObj[`data.form.details.${rowIndex}.taxRateId`] = value.get('rate')
        sfObj[`data.form.details.${rowIndex}.taxRateName`] = value.get('rateName')
        sfObj[`data.form.details.${rowIndex}.taxRate`] = value.get('taxRate')
        sfObj[`data.form.details.${rowIndex}.tax`] = tax
        sfObj[`data.form.details.${rowIndex}.taxInclusiveAmount`] = taxInclusiveAmount

        if (vatTaxpayer == '2000010001' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                sfObj[`data.form.details.${rowIndex}.taxRateType`] = 3000070005
                sfObj[`data.form.details.${rowIndex}.taxRateTypeName`] = '免税'
            } else if (taxRate >= 0.06) {
                sfObj[`data.form.details.${rowIndex}.taxRateType`] = 3000070001
                sfObj[`data.form.details.${rowIndex}.taxRateTypeName`] = '一般计税'
            } else if (taxRate > 0 && taxRate < 0.06) {
                sfObj[`data.form.details.${rowIndex}.taxRateType`] = 3000070002
                sfObj[`data.form.details.${rowIndex}.taxRateTypeName`] = '简易征收'
            }
        }
        if (vatTaxpayer == '2000010002' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                sfObj[`data.form.details.${rowIndex}.taxRateType`] = 3000070005
                sfObj[`data.form.details.${rowIndex}.taxRateTypeName`] = '免税'
            } else {
                sfObj[`data.form.details.${rowIndex}.taxRateType`] = 3000070002
                sfObj[`data.form.details.${rowIndex}.taxRateTypeName`] = '简易征收'
            }
        }
    }

    handleCheck = async (checkArr, form, operate) => {
        if (checkArr && checkArr.length == 0) {
            return
        }
        let ishasError = false
        let errorList = []
        const forms = this.metaAction.gf('data.form').toJS()
        form = form ? form : forms
        if (operate == 'save') {
            // const objRet = await this.handleComCheck(checkArr, errorList, ishasError)
            errorList = objRet.errorList ? objRet.errorList : errorList
            ishasError = objRet.ishasError != undefined ? objRet.ishasError : ishasError

            if (form.settles && form.settles.length != 0) {
                form.settles = form.settles.filter((item) => {
                    return item.bankAccountId || item.amount
                })
                for (let i = 0; i < form.settles.length; i++) {
                    if (!form.settles[i].bankAccountId) {
                        errorList.push({
                            errorPath: `data.error.${i}.bankAccount`, message: '请选择结算方式'
                        })
                        ishasError = true
                    }
                    if (form.settles[i].amount == '') {
                        errorList.push({
                            errorPath: `data.error.${i}.amount`, message: '请输入结算金额'
                        })
                        ishasError = true
                    }
                }
            }
        } else {
            // const objRet = await this.handleComCheck(checkArr, errorList, ishasError)
            errorList = objRet.errorList ? objRet.errorList : errorList
            ishasError = objRet.ishasError != undefined ? objRet.ishasError : ishasError
        }
        if (errorList.length != 0) {
            let json = {}
            errorList.forEach(item => {
                json[item.errorPath] = item.message
            })
            this.metaAction.sfs(json)
        }
        return ishasError
    }

    openDocContent = async () => {
        const docCode = this.metaAction.gf('data.form.docCode')
        const docId = this.metaAction.gf('data.form.docId')
        const docSourceTypeName = this.metaAction.gf('data.form.docSourceTypeName')

        if (docId && docSourceTypeName && docSourceTypeName != '系统凭证') {
            // const code = docCode.replace(/[已生成|凭证]/g, '');
            this.metaAction.toast('error', `请在${docSourceTypeName}管理查看生成的凭证`)
        } else {
            let data = this.metaAction.gf('data.form').toJS()
            let id = data.docId
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '填制凭证',
                    'app-proof-of-charge',
                    { accessType: 1, initData: { id } }
                )
        }
    }

    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.children) {
            return false
        }
        //需要确定部门项目这些是否也需要支持助记码这些的搜索
        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('supplier') != -1) {
            parmasName = 'supplier'
        } else if (parmasName.indexOf('inventoryCode') != -1) {
            parmasName = 'inventory'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
        } else if (parmasName.indexOf('department') != -1) {
            parmasName = 'department'
        } else if (parmasName.indexOf('project') != -1) {
            parmasName = 'project'
        } else if (parmasName.indexOf('purchasePerson') != -1) {
            parmasName = 'purchasePerson'
        } else if (parmasName.indexOf('customer') != -1) {
            parmasName = 'customer'
        } else if (parmasName.indexOf('revenueType') != -1) {
            parmasName = 'revenueType'
        }

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`)

        let value
        if (option.props.value) {
            value = option.props.value
        } else if (option.props.children) {
            value = option.props.children
        }

        let paramsValue
        if (option._owner.key == "inventoryName" || option._owner.key == "revenueType") {
            paramsValue = paramsValues.find(item => item.get('id') == value)
        } else {
            paramsValue = paramsValues.find(item => item.get('id') == (option.key))
        }

        if (!paramsValue) {
            return false
        }

        if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
            let regExp = new RegExp(inputValue, 'i')
            return paramsValue.get('code').search(regExp) != -1
        }

        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.get('name').search(regExp) != -1
            || (paramsValue.get('code') && paramsValue.get('code').search(regExp) != -1)
            || (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) // TODO 只支持助记码搜索，简拼
    }

    getColumnVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'), visible = false
        columnSetting = columnSetting && columnSetting.toJS()

        if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
            columnSetting.body.tables.forEach((item) => {
                if (item.details.length != 0) {
                    visible = item.details.filter(o => o.fieldName == params)[0].isVisible
                }
            })
        }
        return visible
    }

    getColumnCaption = (params) => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'), caption = ''
        columnSetting = columnSetting && columnSetting.toJS()

        if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
            columnSetting.body.tables.forEach((item) => {
                if (item.details.length != 0) {
                    caption = item.details.filter(o => o.fieldName == params)[0].caption
                }
            })
        }
        return caption
    }

    editCloseTips = (istip) => {
        this.isEditing = istip
    }

    customerChange = async (value) => {

        let customerId = value && value.toJS().id
        const response = await this.webapi.delivery.queryByCustomer({ customerId })

        let settles = this.metaAction.gf('data.form.settles')
        settles = settles && settles.toJS()
        // 若在选择客户之前添加了结算方式，将改动第一个
        settles.splice(0, 1, {
            bankAccountId: response.bankAccountId,
            bankAccountName: response.bankAccountName,
            amount: ''
        })

        if (response) {
            this.metaAction.sf('data.form.settles', fromJS(settles))
        }
    }

    taxSeleter = (index) => {
        return {
            name: 'option',
            component: 'Select.Option',
            value: '{{data.other.taxRateTypes && data.other.taxRateTypes[_lastIndex].id}}',
            children: '{{data.other.taxRateTypes && data.other.taxRateTypes[_lastIndex].name}}',
            _power: 'for in data.form.details.${index}.taxRateTypes'
        }
    }

    // 计税方式
    renderTaxRateTypesSelect = (index, data, isChange) => {
        const aa = this.metaAction.gf('data.form.details').toJS()
        const taxRate = this.metaAction.gf(`data.form.details.${index}.taxRate`)
        const taxRateName = this.metaAction.gf(`data.form.details.${index}.taxRateName`)
        const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer
        const taxRateTypeList = this.metaAction.gf('data.other.taxRateType').toJS()
        let list = taxRateTypeList
        if (taxRate || taxRate == 0) {
            if (isChange) {
                if (vatTaxpayer == '2000010001' && (taxRate || taxRate == 0)) {
                    if (taxRate == 0) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070005,
                            [`data.form.details.${index}.taxRateTypeName`]: '免税'
                        })
                    } else if (taxRate >= 0.06) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070001,
                            [`data.form.details.${index}.taxRateTypeName`]: '一般计税'
                        })
                    } else if (taxRate > 0 && taxRate < 0.06) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070002,
                            [`data.form.details.${index}.taxRateTypeName`]: '简易征收'
                        })
                    }
                }
                if (vatTaxpayer == '2000010002' && (taxRate || taxRate == 0)) {
                    if (taxRate == 0) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070005,
                            [`data.form.details.${index}.taxRateTypeName`]: '免税'
                        })
                    } else {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070002,
                            [`data.form.details.${index}.taxRateTypeName`]: '简易征收'
                        })
                    }
                }
            } else {
                list = this.getList({ vatTaxpayer, taxRate, taxRateName, taxRateTypeList })
            }
        } else {
            list = taxRateTypeList
        }
        return list.map((item) => {
            return <Option key={item.id} value={item.id}>{item.name}</Option>
        })
    }

    getList = ({ vatTaxpayer, taxRate, taxRateName, taxRateTypeList }) => {
        let list = taxRateTypeList || []
        if (vatTaxpayer == '2000010001' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                list = [{ id: 3000070005, name: "免税", code: "mianshui" },
                { id: 3000070004, name: "免抵退", code: "mdt" }]

            } else if (taxRate > 0.06) {
                list = [{ id: 3000070001, name: "一般计税", code: "general" }]
            } else if (taxRate > 0 && taxRate <= 0.06) {
                if (taxRate == 0.06 || taxRate == 0.03) {
                    list = [{ id: 3000070002, name: "简易征收", code: "simple" }, { id: 3000070001, name: "一般计税", code: "general" }]
                } else {
                    list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
                }
            }
            if (taxRateName == '3%减按2%') {
                list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
            }
        }
        if (vatTaxpayer == '2000010002' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                list = [{ id: 3000070005, name: "免税", code: "mianshui" },
                { id: 3000070002, name: "简易征收", code: "simple" }]

            } else {
                list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
            }
            if (taxRateName == '3%减按2%') {
                list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
            }
        }
        return list
    }

    calc = (col, rowIndex, rowData, params) => (v) => {
        let sfObj = {}
        let index = Number(params.rowIndex)

        //单价输入控制
        // if (col == "price" || col == "amount" || col == "quantity" || col == "taxInclusiveAmount" || col == "tax") {
        //     if (Number(v) > 9999999999.99) {
        // if(col == "quantity") {
        //     if (Number(v) > 9999999999.99) {
        //         this.metaAction.sf(`data.form.style.${rowIndex}.quantityTypeStyle`, true)
        //         this.metaAction.toast('error', `明细第${rowIndex + 1}行数量不能超过12位`)
        //     }else {
        //         this.metaAction.sf(`data.form.style.${rowIndex}.quantityTypeStyle`, false)
        //     }
        // }
        // }
        // }
        if (col == 'quantity' || col == 'price' || col == 'amount' || col == 'tax' || col == 'taxInclusiveAmount') {

            if (v && Number(v) > 9999999999.999999) {
                sfObj[`data.error.${rowIndex}.${col}`] = true
                switch (col) {
                    case 'quantity':
                        this.metaAction.toast('error', `数量不能大于9999999999.999999,请调整`)
                        break;
                    case 'price':
                        this.metaAction.toast('error', `单价不能大于9999999999.999999,请调整`)
                        break;
                    case 'amount':
                        this.metaAction.toast('error', `金额不能大于9999999999.999999,请调整`)
                        break;
                    case 'tax':
                        this.metaAction.toast('error', `税额不能大于9999999999.999999,请调整`)
                        break;
                    case 'taxInclusiveAmount':
                        this.metaAction.toast('error', `价税合计不能大于9999999999.999999,请调整`)
                        break;
                }

            } else {
                const error = this.metaAction.gf(`data.error.${rowIndex}.${col}`)
                if (error) sfObj[`data.error.${rowIndex}.${col}`] = undefined
            }
        }

        params = Object.assign(params, {
            value: v
        })



        if ((v == null || v == undefined) && col == 'taxRateName') {
            // this.metaAction.sfs({
            //     [`data.form.details.${rowIndex}.taxRateName`]: null,
            //     [`data.form.details.${rowIndex}.taxRateId`]: null,
            //     [`data.form.details.${rowIndex}.taxRate`]: null,
            // })

            sfObj[`data.form.details.${rowIndex}.taxRateName`] = null
            sfObj[`data.form.details.${rowIndex}.taxRateId`] = null
            sfObj[`data.form.details.${rowIndex}.taxRate`] = null
        } else {
            const invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
            const isNCPFP = invoiceTypeId == '4000010030' ? true : false
            this.voucherAction.calc(col, rowIndex, rowData, params, isNCPFP)
            const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer
            const details = this.metaAction.gf('data.form.details').toJS()
            details.find((item) => { //为了判断是否为退货
                if (item.amount < 0 || item.quantity < 0 || item.quantity < 0 || item.taxInclusiveAmount < 0) {
                    // this.metaAction.sf('data.other.isDisableBank', true)
                    sfObj['data.other.isDisableBank'] = true
                    return true
                } else {
                    // this.metaAction.sf('data.other.isDisableBank', false)
                    sfObj['data.other.isDisableBank'] = false
                    return false
                }
            })
            if (col == 'taxRateName') {
                this.renderTaxRateTypesSelect(rowIndex, rowData, true)
            }
        }

        this.editCloseTips(true)
        // this.metaAction.sf('data.other.auditVisible', false)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)

        // 有差额税发票时，修改单价，数量，金额，税录
        // 先求税额 税额 = 金额- 差额    *     税率
        // 再求加税合计
        if (col == "quantity" || col == "price" || col == "amount" || col == "taxRateName") {
            let deductionAmount = this.metaAction.gf('data.form.deductionAmount')
            if (deductionAmount && deductionAmount != undefined) {

                let details = this.metaAction.gf('data.form.details').toJS()
                // if (details[0].amount && details[0].taxRateName) {
                //     let newTax = ((details[0].amount - deductionAmount) * (details[0].taxRateName.replace("%", "") / 100)).toFixed(2)
                //     let newTaxInclusiveAmount = (details[0].amount + Number(newTax))

                //     this.metaAction.sfs({
                //         [`data.form.details.${0}.tax`]: newTax,
                //         [`data.form.details.${0}.taxInclusiveAmount`]: newTaxInclusiveAmount
                //     })
                // }
                for (var i = 0; i < details.length; i++) {
                    if (details[i] && details[i].amount && details[i].taxRateName != null && i == rowIndex) {
                        let newTax = ((details[rowIndex].amount - deductionAmount) * (details[rowIndex].taxRateName.replace("%", "") / 100)).toFixed(2)
                        let newTaxInclusiveAmount = (details[rowIndex].amount + Number(newTax))

                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.tax`]: newTax,
                            [`data.form.details.${rowIndex}.taxInclusiveAmount`]: newTaxInclusiveAmount
                        })
                    } else {
                        if (details[i].amount != null && details[i].taxRateName != null) {
                            return
                        }
                    }
                }
            }
        }

        // 有差额税发票时，修改税额
        // 先求新金额 新金额 = 税额/税率 + 差额
        // 再求单价 单价 = 新金额/数量
        // 再求价税合计 价税合计 = 新金额 + 税额
        if (col == "tax") {
            let deductionAmount = this.metaAction.gf('data.form.deductionAmount')
            if (deductionAmount && deductionAmount != undefined) {

                let details = this.metaAction.gf('data.form.details').toJS()
                // if (details[0].amount && details[0].taxRateName) {
                //     let newAmount = Number((details[0].tax / (details[0].taxRateName.replace("%", "") / 100)).toFixed(2)) + Number(deductionAmount)
                //     let newPrice = (newAmount / Number(details[0].quantity)).toFixed(6)
                //     let newTaxInclusiveAmount = (newAmount + Number(details[0].tax))
                //     this.metaAction.sfs({
                //         [`data.form.details.${0}.amount`]: newAmount,
                //         [`data.form.details.${0}.price`]: newPrice,
                //         [`data.form.details.${0}.taxInclusiveAmount`]: newTaxInclusiveAmount
                //     })
                // }

                for (var i = 0; i < details.length; i++) {
                    if (details[i].amount != null && details[i].taxRateName != null && i == rowIndex) {
                        let newAmount = Number((details[rowIndex].tax / (details[rowIndex].taxRateName.replace("%", "") / 100)).toFixed(2)) + Number(deductionAmount)
                        let newPrice = (newAmount / Number(details[rowIndex].quantity)).toFixed(6)
                        let newTaxInclusiveAmount = (newAmount + Number(details[rowIndex].tax))
                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.amount`]: newAmount,
                            [`data.form.details.${rowIndex}.price`]: newPrice,
                            [`data.form.details.${rowIndex}.taxInclusiveAmount`]: newTaxInclusiveAmount
                        })
                    } else {
                        if (details[i].amount != null && details[i].taxRateName != null) {
                            return
                        }
                    }
                }
            }
        }

        // 有差额税发票时，修改价税合计
        // 先求金额， 金额 = （加税合计+差额*税率） /1+税率
        // 再求税额 税额 = （新金额 - 差额 ）* 税率
        // 再求单价 税额 = 新金额 / 数量
        if (col == "taxInclusiveAmount") {
            let deductionAmount = this.metaAction.gf('data.form.deductionAmount')
            if (deductionAmount && deductionAmount != undefined) {

                let details = this.metaAction.gf('data.form.details').toJS()
                // if (details[0].amount && details[0].taxRateName) {
                //     let newAmount = (details[0].taxInclusiveAmount + Number(deductionAmount * (details[0].taxRateName.replace("%", "") / 100))) / (1 + Number(details[0].taxRateName.replace("%", "") / 100))
                //     let newTax = (newAmount - deductionAmount) * (details[0].taxRateName.replace("%", "") / 100)
                //     let newPrice = (newAmount / Number(details[0].quantity)).toFixed(6)

                //     this.metaAction.sfs({
                //         [`data.form.details.${0}.amount`]: newAmount,
                //         [`data.form.details.${0}.price`]: newPrice,
                //         [`data.form.details.${0}.tax`]: newTax
                //     })
                // }

                for (var i = 0; i < details.length; i++) {
                    if (details[i].amount != null && details[i].taxRateName != null && i == rowIndex) {
                        let newAmount = (details[rowIndex].taxInclusiveAmount + Number(deductionAmount * (details[rowIndex].taxRateName.replace("%", "") / 100))) / (1 + Number(details[0].taxRateName.replace("%", "") / 100))
                        let newTax = (newAmount - deductionAmount) * (details[rowIndex].taxRateName.replace("%", "") / 100)
                        let newPrice = (newAmount / Number(details[rowIndex].quantity)).toFixed(6)

                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.amount`]: newAmount,
                            [`data.form.details.${rowIndex}.price`]: newPrice,
                            [`data.form.details.${rowIndex}.tax`]: newTax
                        })
                    } else {
                        if (details[i].amount != null && details[i].taxRateName != null) {
                            return
                        }
                    }
                }
            }
        }
    }

    calcBalance = (data) => {
        const taxInclusiveAmount = this.voucherAction.sum(data.form.details, (a, b) => a + b.taxInclusiveAmount)
        let paymentAmount = this.metaAction.gf('data.form.paymentAmount'), payAmount = 0
        paymentAmount = utils.number.round(paymentAmount, 2) || 0

        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []

        settles.forEach((item, index) => {
            payAmount += Number(item.amount)
        })

        const chargeAmount = this.voucherAction.numberFormat(taxInclusiveAmount - payAmount, 2)
        this.metaAction.sf('data.other.chargeAmount', chargeAmount)
        return chargeAmount
    }

    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity) {
            return this.voucherAction.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }

    getControlVisible = () => {
        let visible = true,
            invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
        if (invoiceTypeId) {
            visible = invoiceTypeId != consts.consts.INVOICETYPE_generalVATInvoice
        }
        return visible
    }

    //点击增加 结算方式
    addPaymentAmount = () => {
        const data = this.metaAction.gf('data').toJS()
        const bb = data.consts.VOUCHERSTATUS_Approved
        if (bb == data.form.status) {
            return false
        }
        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []
        const obj = {
            bankAccountId: '',
            amount: '',
            bankAccountName: '',
        }
        if (settles.length == 0) settles.push(obj)
        settles.push(obj)
        this.metaAction.sfs({
            'data.form.settles': fromJS(settles),
            'data.other.auditVisible': false
        })
        // this.metaAction.sf('data.form.settles', fromJS(settles))
        // this.metaAction.sf('data.other.auditVisible', false)
    }

    isTvoucher = () => {
        let currentOrg = this.metaAction.context.get('currentOrg'),
            appKey = currentOrg.appKey
        if (appKey == 10001004) {
            return false
        }

        const linkConfig = this.metaAction.context.get('linkConfig');
        if (linkConfig) {
            return false
        } else {
            return true
        }
        let docCode = this.metaAction.gf('data.form.docCode')
        if (/已生成/.test(docCode)) {
            return false
        } else {
            return true
        }
    }

    doCode = () => {
        let docCode = this.metaAction.gf('data.form.docCode')
        if (/已生成/.test(docCode)) {
            return docCode ? docCode : ''
        } else {
            return docCode ? `记-${docCode}` : ''
        }
    }

    handlePayBlur = (v, index) => {
        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []
        // v = this.addThousandsPosition(v, true)
        if (v !== '') {
            v = v.toFixed(2)
        }
        if (settles.length == 0) {
            const obj = {
                bankAccountId: '',
                amount: v,
                bankAccountName: '',
            }
            settles.push(obj)
        } else {
            settles[index].amount = v

            // if (v) {
            this.metaAction.sf(`data.error.${index}.amount`, undefined)
            // }
        }

        // this.metaAction.sf("data.form.paymentAmount", v)
        // this.metaAction.sf("data.form.settles", fromJS(settles))
        this.metaAction.sfs({
            "data.form.paymentAmount": v,
            "data.form.settles": fromJS(settles),
            "data.other.auditVisible": false,
            'data.other.customAttribute': Math.random()
        })
    }

    //扣除额
    deductions = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '扣除额',
            width: 400,
            children: this.metaAction.loadApp(
                'ttk-scm-deductions-card', {
                    store: this.component.props.store
                }
            )
        })

        if (ret) {
            let remark = `差额征税：${ret}`

            this.metaAction.sfs({
                "data.form.remark": remark,
                "data.form.deductionAmount": ret,
                "data.other.auditVisible": false
            })

            let details = this.metaAction.gf('data.form.details').toJS()
            // if (details[0].amount && details[0].taxRateName) {
            //     let newTax = ((details[0].amount - ret) * (details[0].taxRateName.replace("%", "") / 100)).toFixed(2)
            //     let newTaxInclusiveAmount = (details[0].amount + Number(newTax))

            //     this.metaAction.sfs({
            //         [`data.form.details.${0}.tax`]: newTax,
            //         [`data.form.details.${0}.taxInclusiveAmount`]: newTaxInclusiveAmount
            //     })
            // }

            for (var i = 0; i < details.length; i++) {
                if (details[i].amount && details[i].taxRateName) {
                    let newTax = ((details[i].amount - ret) * (details[i].taxRateName.replace("%", "") / 100)).toFixed(2)
                    let newTaxInclusiveAmount = (details[i].amount + Number(newTax)).toFixed(2)

                    this.metaAction.sfs({
                        [`data.form.details.${i}.tax`]: newTax,
                        [`data.form.details.${i}.taxInclusiveAmount`]: newTaxInclusiveAmount
                    })
                    return
                }
            }
        }
    }

    //点击删除 结算方式金额
    delPaymentAmount = (index) => {
        const data = this.metaAction.gf('data').toJS()
        const bb = data.consts.VOUCHERSTATUS_Approved
        if (bb == data.form.status) {
            return false
        }

        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []
        if (settles.length == 1) {
            return false
        }
        settles.splice(index, 1)
        this.metaAction.sfs({
            'data.form.settles': fromJS(settles),
            'data.other.auditVisible': false
        })
        // this.metaAction.sf('data.form.settles', fromJS(settles))
        // this.metaAction.sf('data.other.auditVisible', false)
    }

    //附件的下载操作
    download = (ps) => {
        const form = this.metaAction.gf('data.form').toJS()
        if (form.id) {
            ps = ps.file ? ps.file : ps
        }
        this.voucherAction.download(ps)
    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return { token: token }
    }

    delFile = (index) => {
        const data = this.metaAction.gf('data').toJS()
        const aa = data.consts.VOUCHERSTATUS_Approved
        if (aa == data.form.status) {
            return false
        } else {
            this.voucherAction.delFile(index, 'vouchers', this.updateEnclosure)
        }
    }

    updateEnclosure = async (res) => {
        res.ts = ''
        const result = await this.webapi.delivery.updateEnclosure(res)
        return result
    }

    attachmentChange = (info) => {
        const isLt10M = this.metaAction.gf('data.other.isLt10M')
        if (isLt10M) {
            return
        }
        this.voucherAction.attachmentChange(info, 'vouchers', this.updateEnclosure)
    }

    // //附件上传之前检查
    // beforeUpload = (info,infoList) => {        
    //     this.voucherAction.beforeUpload(info,infoList)
    // }

    //附件上传之前检查
    beforeUpload = async (info, infoList) => {
        this.injections.reduce('updateState', 'data.other.isLt10M', false)
        const isLt10M = info.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            //LoadingMask.hide()            
            this.metaAction.toast('warning', '文件过大，请上传小于10兆的附件')
            this.injections.reduce('attachmentLoading', false)
            this.injections.reduce('updateState', 'data.other.isLt10M', true)
            return
        }

        let attachmentFiles = this.metaAction.gf('data.form.attachmentFiles').toJS() || []
        return new Promise((resolve, reject) => {
            if (attachmentFiles.length + infoList.length > 20) {
                this.metaAction.toast('warning', `当前凭证的附件数为${attachmentFiles.length}，只能继续上传${20 - attachmentFiles.length}个附件`)
                reject(info);
            } else {
                resolve(info);
            }
        });

    }

    signChange = (id) => {
        const signAndRetreat = this.metaAction.gf('data.other.signAndRetreat').toJS()
        signAndRetreat.map((obj) => {
            if (obj.id == id) {
                obj.visible = true
            } else {
                obj.visible = false
            }
        })
        // this.metaAction.sf('data.other.signAndRetreat', fromJS(signAndRetreat))
        this.metaAction.sfs({
            'data.other.signAndRetreat': fromJS(signAndRetreat),
            'data.other.auditVisible': false
        })
    }
    /*废弃*/
    getVoucherStatus = () => {
        // console.log('---------------')
        let discarded = this.metaAction.gf('data.form.discarded')
        if (discarded) {
            return true
        }

        let status = this.metaAction.gf('data.form.status')

        if (status == 1000020002) {
            return true
        }

        if (status == 1000020003 || status == 1000020001) {
            return false
        }

        let pageStatus = this.metaAction.gf('data.other.pageStatus')
        return pageStatus == common.commonConst.PAGE_STATUS.READ_ONLY
    }

    getDiscarded = () => {
        const discarded = this.metaAction.gf('data.form.discarded')
        const status = this.metaAction.gf('data.form.status')
        if (discarded) {
            if (status == consts.consts.VOUCHERSTATUS_Approved) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }


    //下拉选 票据类型 供应商

    /*
    handleSelect = (params, isCodeSeach) => {
        params = params && params.toJS()
        if (params) {
            return params.map((item, index) => {
                return isCodeSeach ? <Option key={item && item.id}>{item && `${item.code} ${item.name}`}</Option> :
                    <Option key={item && item.id}>{item && item.name}</Option>
            })
        }
    }*/

    addArchive = async (fieldName, rowIndex, rowData) => {
        switch (fieldName) {
            case 'customer':
                await this.voucherAction.addCustomer(`data.other.${fieldName}s`)
                this.addItemToState(fieldName)
                break;
            case 'department':
                await this.voucherAction.addDepartment(`data.other.${fieldName}s`)
                this.addItemToState(fieldName)
                break;
            case 'project':
                await this.voucherAction.addProject(`data.other.${fieldName}s`)
                this.addItemToState(fieldName)
                break;
            case 'inventory':
                let inventoryItem = await this.voucherAction.addInventory('inventoryItem', 'get')
                let inventory = this.metaAction.gf('data.other.inventory').toJS()
                inventoryItem = this.getFullName([inventoryItem])
                inventory.push(inventoryItem[0])
                let sfObj = {}
                let field = {
                    id: `data.form.details.${rowIndex}.inventoryId`,
                    name: `data.form.details.${rowIndex}.inventoryName`,
                    code: `data.form.details.${rowIndex}.inventoryCode`,
                    unitId: `data.form.details.${rowIndex}.unitId`,
                    unitName: `data.form.details.${rowIndex}.unitName`,
                    taxRateName: `data.form.details.${rowIndex}.taxRateName`,
                    specification: `data.form.details.${rowIndex}.specification`,
                    revenueType: `data.form.details.${rowIndex}.revenueType`,
                    revenueTypeName: `data.form.details.${rowIndex}.revenueTypeName`,
                    inventoryType: `data.form.details.${rowIndex}.inventoryType`,
                    inventoryTypeName: `data.form.details.${rowIndex}.inventoryTypeName`,
                    taxRateType: `data.form.details.${rowIndex}.taxRateType`,
                    taxRateTypeName: `data.form.details.${rowIndex}.taxRateTypeName`,
                }
                const value = fromJS(inventoryItem[0])
                const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer
                // this.handleChangeInventory(field, value, sfObj, rowData, rowIndex, vatTaxpayer)
                let formId = this.metaAction.gf('data.form.id')
                if (formId && (rowData.taxRate || rowData.taxRate == 0)) {
                    let fieldObj = {
                        id: field.id,
                        name: field.name,
                        code: field.code
                    }
                    Object.keys(fieldObj).forEach(key => {
                        sfObj[fieldObj[key]] = value.get(key)
                    })
                } else {
                    this.handleChangeInventory(field, value, sfObj, rowData, rowIndex, vatTaxpayer)
                }


                sfObj['data.other.inventory'] = fromJS(inventory)
                sfObj['data.other.auditVisible'] = false
                this.metaAction.sfs(sfObj)
                break;
            case 'revenueType':
                let ret = await this.voucherAction.addRevenueType(`data.other.${fieldName}`)
                let sfObj2 = {}
                if (ret) {
                    let revenueType = this.metaAction.gf('data.other.revenueType').toJS()
                    if (ret != true) {
                        revenueType.push(ret)
                    }
                    sfObj2[`data.form.details.${rowIndex}.revenueType`] = fromJS(ret.id)
                    sfObj2[`data.form.details.${rowIndex}.revenueTypeName`] = fromJS(ret.name)
                    sfObj2['data.other.revenueType'] = fromJS(revenueType)
                }
                sfObj2['data.other.auditVisible'] = false
                this.metaAction.sfs(sfObj2)
                break;
            default:
                break;
        }
    }

    addItemToState = (fieldName) => {
        const res = this.metaAction.gf(`data.other.${fieldName}s`) && this.metaAction.gf(`data.other.${fieldName}s`).toJS()

        if (res) {
            const list = this.metaAction.gf(`data.other.${fieldName}`).toJS()
            list.push(res)

            let sfObj = {}

            sfObj[`data.other.${fieldName}`] = fromJS(list)
            sfObj[`data.form.${fieldName}Id`] = res.id
            sfObj[`data.form.${fieldName}Name`] = res.name

            sfObj['data.other.auditVisible'] = false
            this.metaAction.sfs(sfObj)
        }
    }

    renderSelectOption = () => {
        const inventorys = this.metaAction.gf('data.other.inventory').toJS() || []
    
        return (
            inventorys && inventorys.map((item) => {
                const name = item.fullName ? item.fullName : `${item.code} ${item.name}`
                return <Option key={item.id} value={item.id} title={item.fullName}>{this.getFullNameChildren(item)}</Option>
            })
        )
    }

    //新增档案
    /*
    addRecordClick = async (add, params, index, rowData) => {
        let sfObj = {}
        if (params == 'inventory') { //新增存货 明细表要带出对应的数据
            // await this.voucherAction[add]('data.other.inventoryItem')

            // let inventory = this.metaAction.gf('data.other.inventory').toJS()
            // const inventoryItem = this.metaAction.gf('data.other.inventoryItem').toJS()
            // inventory.push(inventoryItem)
            // this.metaAction.sf('data.other.inventory', fromJS(inventory))

            let inventoryItem = await this.voucherAction[add]('data.other.inventoryItem', 'get')
            let inventory = this.metaAction.gf('data.other.inventory').toJS()

            inventory.push(inventoryItem)

            let field = {
                id: `data.form.details.${index}.inventoryId`,
                name: `data.form.details.${index}.inventoryName`,
                code: `data.form.details.${index}.inventoryCode`,
                unitId: `data.form.details.${index}.unitId`,
                unitName: `data.form.details.${index}.unitName`,
                taxRateName: `data.form.details.${index}.taxRateName`,
                specification: `data.form.details.${index}.specification`,
                revenueType: `data.form.details.${index}.revenueType`,
                revenueTypeName: `data.form.details.${index}.revenueTypeName`,
                inventoryType: `data.form.details.${index}.inventoryType`,
                inventoryTypeName: `data.form.details.${index}.inventoryTypeName`,
                taxRateType: `data.form.details.${index}.taxRateType`,
                taxRateTypeName: `data.form.details.${index}.taxRateTypeName`,
            }

            // this.onFieldChange(field, 'data.other.inventory', index, rowData, null, inventoryItem.id)
            const value = fromJS(inventoryItem)
            const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer
            this.handleChangeInventory(field, value, sfObj, rowData, index, vatTaxpayer)

            sfObj['data.other.inventory'] = fromJS(inventory)
        } else if (params == 'revenueType') {
            const ret = await this.metaAction.modal('show', {
                title: '新增收入类型',
                width: 450,
                height: 280,
                footer: null,
                children: this.metaAction.loadApp(
                    'scm-incomeexpenses-setting-card', {
                        store: this.component.props.store,
                        incomeexpensesTabId: 2001003
                    }
                )
            })

            if (ret) {
                let revenueType = this.metaAction.gf('data.other.revenueType').toJS()
                if (ret != true) {
                    revenueType.push(ret)
                }
                sfObj[`data.form.details.${index}.revenueType`] = fromJS(ret.id)
                sfObj[`data.form.details.${index}.revenueTypeName`] = fromJS(ret.name)
                sfObj['data.other.revenueType'] = fromJS(revenueType)
                // this.metaAction.sfs({
                //     [`data.form.details.${index}.revenueType`]: fromJS(ret.id),
                //     [`data.form.details.${index}.revenueTypeName`]: fromJS(ret.name),
                //     'data.other.revenueType': fromJS(revenueType),
                // })
                // // this.metaAction.sf(`data.form.details.${index}.revenueType`, fromJS(ret.id))
                // // this.metaAction.sf(`data.form.details.${index}.revenueTypeName`, fromJS(ret.name))
                // // this.metaAction.sf('data.other.revenueType', fromJS(revenueType))
            }
        } else {
            await this.voucherAction[add](`data.other.${params}s`)

            const res = this.metaAction.gf(`data.other.${params}s`).toJS()
            const list = this.metaAction.gf(`data.other.${params}`).toJS()
            list.push(res)
            // this.metaAction.sfs({
            //     [`data.other.${params}`]: fromJS(list),
            //     [`data.form.${params}Id`]: res.id,
            //     [`data.form.${params}Name`]: res.name
            // })
            sfObj[`data.other.${params}`] = fromJS(list)
            sfObj[`data.form.${params}Id`] = res.id
            sfObj[`data.form.${params}Name`] = res.name
        }

        // this.metaAction.sf('data.other.auditVisible', false)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)
    }

    */


    //新增档案
    /*
    handleAddRecord = (paramsU, params, index, rowData) => {
        const add = `add${paramsU}`
        return <Button type='primary'
            style={{ width: '100%', borderRadius: '0' }}
            onClick={this.addRecordClick.bind(null, add, params, index, rowData)}
        >新增</Button>
    }*/

    //控制显示
    handleVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        columnSetting = columnSetting && columnSetting.toJS()
        if (columnSetting) {
            return !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == params)[0].isVisible
        }
    }

    //单据日期控制
    handleDisabledDate = (current) => {
        if (current) {
            let beginDate = this.metaAction.gf('data.other.beginDate'), currentDate = current.format('YYYY-MM-DD')
            let invoiceDate = this.metaAction.gf('data.form.invoiceDate')

            if (beginDate) beginDate = beginDate.replace(/-/g, '')
            if (currentDate) currentDate = currentDate.replace(/-/g, '')

            // if(invoiceDate) {
            //     invoiceDate = invoiceDate.replace(/-/g, '')
            //     return (currentDate && currentDate < beginDate) || (currentDate && currentDate < invoiceDate)
            // }else {
            return currentDate && currentDate < beginDate
            // }
        }
    }

    handleDisabledDates = (current) => {
        if (current) {
            let beginDate = this.metaAction.gf('data.other.beginDate'), currentDate = current.format('YYYY-MM-DD')
            let businessDate = this.metaAction.gf('data.form.businessDate')

            if (beginDate) beginDate = beginDate.replace(/-/g, '')
            if (currentDate) currentDate = currentDate.replace(/-/g, '')


            if (businessDate) {
                businessDate = businessDate.replace(/-/g, '')
                return (currentDate && currentDate > businessDate)
            }
        }
    }

    filterOptionArchives = (name, inputValue, option) => {
        if (option.props.add && option.props.children) {
            option.props = {
                children: option.props.children
            }
        }
        const namePrmas = {
            currentPath: name
        }
        return this.filterOption(inputValue, option, namePrmas)
    }

    getInvenValue = (code, name) => { return code + ` ` + name }

    /**待优化 */
    renderPayDiv = () => {
        let settles = this.metaAction.gf('data.form.settles'),
            voucherStatus = this.metaAction.gf('data.other.voucherStatus')

        settles = settles ? settles.toJS() : []

        const bankAccount = this.metaAction.gf('data.other.bankAccount'),
            bankAccountNameError = this.metaAction.gf('data.form.bankAccountNameError'),
            amountError = this.metaAction.gf('data.form.amountError')
        let bankAccountOption = [], params = bankAccount && bankAccount.toJS()

        if (params) {
            params.forEach((item, index) => {
                bankAccountOption.push(<Option key={item && item.id}>{item && item.name}</Option>)
            })
        }

        return settles.map((item, index) => {
            const customAttribute = this.metaAction.gf('data.other.customAttribute')
            return <div key={index}>
                <Form className='ttk-scm-app-sa-invoice-card-form-footer-settlement'>
                    <FormItem label='结算方式' validateStatus={!bankAccountNameError ? 'success' : 'error'}
                    >
                        <Select
                            className="autoFocus_item"
                            showSearch={false}
                            allowClear={true}
                            disabled={voucherStatus}
                            placeholder='请选择账户'
                            value={item.bankAccountId ? String(item.bankAccountId) : undefined}
                            onFocus={() => this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050009"] }, `data.other.bankAccount`)}
                            onChange={(value) => this.onFieldChange({ id: `data.form.bankAccountId`, name: `data.form.bankAccountName` }, `data.other.bankAccount`, null, null, index, value)}
                        >
                            {bankAccountOption}
                        </Select>
                    </FormItem>
                    <FormItem validateStatus={!amountError ? 'success' : 'error'}
                        label='结算金额'
                    >
                        <Input.Number
                            className="autoFocus_item"
                            disabled={voucherStatus}
                            value={item.amount && Number(item.amount).toFixed(2)}
                            precision={2}
                            customAttribute={customAttribute}
                            onBlur={(v) => this.handlePayBlur(v, index)}
                        ></Input.Number>
                    </FormItem>
                    <div className='ttk-scm-app-sa-invoice-card-form-footer-paymentAmount-iconDiv'>
                        <Icon
                            type='plus'
                            title='新增'
                            disabled={voucherStatus}
                            className='ttk-scm-app-sa-invoice-card-form-footer-paymentAmount-iconDiv-iconAdd'
                            onClick={this.addPaymentAmount}></Icon>
                        <Icon
                            type='minus'
                            title='删除'
                            disabled={(settles.length == 1 ? true : false) || voucherStatus}
                            className='ttk-scm-app-sa-invoice-card-form-footer-paymentAmount-iconDiv-iconDel'
                            onClick={this.delPaymentAmount.bind(null, index)}></Icon>
                    </div>
                </Form>
            </div>
        })
    }

    authenticationChange = (v) => {
        // let signAndRetreat = this.metaAction.gf('data.form.signAndRetreat')
        this.metaAction.sfs({
            'data.form.signAndRetreat': v,
            'data.other.auditVisible': false,
        })
    }

    issuedByTaxonChange = (v) => {
        let issuedByTax = this.metaAction.gf('data.form.issuedByTax')
        this.metaAction.sfs({
            'data.form.issuedByTax': !issuedByTax,
            'data.other.auditVisible': false,
        })
    }

    dataFoucs = () => {
        this.metaAction.sf('data.other.dataOpen', flase)
    }

    redCellBorder = (cell, index) => {
        let _redCellStyle = this.metaAction.gf(`data.form.style.${index}.${cell}`)
        if (_redCellStyle) {
            return 'redBorder'
        }
        return ''
    }

    handleChanges = (name, value) => {
        this.metaAction.sfs({
            'data.form.remark': value,
            'data.other.auditVisible': false,
        })
    }

    handleChange = (name, value) => {
        this.editCloseTips(true)
        let obj = {}
        if (this.metaAction.gf('data.other.auditVisible') != false) {
            obj['data.other.auditVisible'] = false
        }
        if (name == "data.form.businessDate") {
            obj['data.form.businessDateError'] = false
            obj['data.form.dateError'] = false
            obj['data.form.dataOpen'] = false


            let invoiceDate = this.metaAction.gf('data.form.invoiceDate')
            if (invoiceDate == undefined) {
                obj['data.form.invoiceDate'] = value
            } else {
                if (value) {
                    let values = value.replace(/-/g, '')
                    let newinvoiceDate = invoiceDate.replace(/-/g, '')
                    if (newinvoiceDate > values) {
                        obj['data.form.invoiceDate'] = value
                    }
                }
            }
        }
        if (name == "data.form.invoiceCode") {
            obj['data.form.invoiceCodeError'] = false
        }
        if (name == "data.form.invoiceNumber") {
            obj['data.form.invoiceNumberError'] = false
        }
        if (name == "data.form.invoiceDate") {
            obj['data.form.dateError'] = false
        }

        obj[name] = value
        this.metaAction.sfs(obj)
    }

    getSelectIndex = (type) => {
        if (!type) return ''
        let returnVal = ''
        let selectArray = this.metaAction.gf(`data.other.${type}`)
        if (selectArray) {
            selectArray = selectArray.size ? selectArray.toJS() : selectArray
            let currentSelectId = this.metaAction.gf(`data.form.${type}Id`)
            selectArray.map(item => {
                // && item.isEnable
                if (item.id == currentSelectId) {
                    returnVal = item.id
                    return false
                }
            })
        }
        return returnVal

    }
    /*
    renderFormContent = () => {
        return []
        const invoiceTypeName = this.metaAction.gf('data.form.invoiceTypeName'),
            invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId'),
            businessDate = this.metaAction.gf('data.form.businessDate'),
            invoiceType = this.metaAction.gf('data.other.invoiceType'),
            invoiceCode = this.metaAction.gf('data.form.invoiceCode'),
            invoiceNumber = this.metaAction.gf('data.form.invoiceNumber'),
            invoiceDate = this.metaAction.gf('data.form.invoiceDate'),
            customerName = this.metaAction.gf('data.form.customerName'),
            customer = this.metaAction.gf('data.other.customer'),
            commonlyProject = this.metaAction.gf('data.form.commonlyProject'),
            signProject = this.metaAction.gf('data.form.signProject'),
            remark = this.metaAction.gf('data.form.remark'),
            isSignAndRetreat = this.metaAction.gf('data.other.isSignAndRetreat'),
            businessDateError = this.metaAction.gf('data.form.businessDateError'),
            customerNameError = this.metaAction.gf('data.form.customerNameError'),
            invoiceNumberError = this.metaAction.gf('data.form.invoiceNumberError'),
            invoiceCodeError = this.metaAction.gf('data.form.invoiceCodeError'),
            dateError = this.metaAction.gf('data.form.dateError'),
            dataOpen = this.metaAction.gf('data.other.dataOpen')

        let signAndRetreat = this.metaAction.gf('data.other.signAndRetreat')//即征即退列表
        signAndRetreat = signAndRetreat && signAndRetreat.toJS()

        let form = this.metaAction.gf('data.form').toJS(), other = this.metaAction.gf('data.other').toJS()
        let customerArr = this.metaAction.gf('data.other.customer'), customerNow
        if (customerArr) {
            customerArr = customerArr.size ? customerArr.toJS() : customerArr
            customerArr.map(item => {
                if (item.id == form.customerId && item.isEnable) {
                    customerNow = item.id
                }
            })
            form.customerId = customerNow ? form.customerId : ''
            if (!customerNow) {
                this.metaAction.sf('data.form.customerId', '')
                this.metaAction.sf('data.form.customerName', '')
            }
        }


        let defaultContentArr = [
            <FormItem label='单据日期'
                className="businessDate_container"
                validateStatus={!businessDateError ? 'success' : 'error'}
                required={true}>
                <DatePicker
                    className="autoFocus_item"
                    value={this.metaAction.stringToMoment(businessDate)}
                    autoFocus={true}
                    onChange={(d) => this.handleChange("data.form.businessDate", this.metaAction.momentToString(d, 'YYYY-MM-DD'))}
                    disabled={this.getVoucherStatus()}
                    disabledDate={this.handleDisabledDate}
                    getCalendarContainer={() => document.getElementsByClassName('businessDate_container')[0]}
                >
                </DatePicker>
            </FormItem>,
            <FormItem label='发票类型' required={true}>
                <Select
                    className="autoFocus_item"
                    disabled={this.getVoucherStatus()}
                    value={form.invoiceTypeId && String(form.invoiceTypeId)}
                    // dropdownMatchSelectWidth = {false}     
                    // dropdownStyle = {{width:'225px'}}     
                    autoFocus={true}
                    onChange={this.onFieldChange({ id: `data.form.invoiceTypeId`, name: `data.form.invoiceTypeName` }, `data.other.invoiceType`)}
                >
                    {this.handleSelect(invoiceType)}
                </Select>
                <Popover content='增值税专用发票，货物运输增值税专用发票，机动车销售发票类型归类到增值税专用发票中' placement='rightTop' overlayClassName='ttk-scm-app-sa-invoice-card-helpPopover'>
                    <Icon fontFamily='edficon' type='bangzhutishi' className='helpIcon'>

                    </Icon>
                </Popover>,
            </FormItem>,

            <FormItem label='购方名称'
                validateStatus={!customerNameError ? 'success' : 'error'}
                required={true}>
                <Select
                    className="autoFocus_item"
                    showSearch={true}
                    filterOption={this.filterOptionArchives.bind(null, 'customer')}
                    placeholder='按名称/拼音/编码搜索'
                    disabled={this.getVoucherStatus()}
                    value={form.customerName && String(form.customerId)}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: '225px' }}
                    onFocus={() => this.voucherAction.getCustomer({ entity: { isEnable: true } }, `data.other.customer`)}
                    dropdownFooter={this.handleAddRecord('Customer', 'customer')}
                    onChange={this.onFieldChange({ id: `data.form.customerId`, name: `data.form.customerName` }, `data.other.customer`)}
                >
                    {this.handleSelect(customer, true)}
                </Select>
            </FormItem>,
            <FormItem label='发票代码' validateStatus={!invoiceCodeError ? 'success' : 'error'}>
                <Input
                    className="autoFocus_item"
                    value={invoiceCode}
                    maxLength={12}
                    onChange={(e) => this.handleChange("data.form.invoiceCode", e.target.value)}
                    disabled={this.getVoucherStatus()}>
                </Input>
            </FormItem>,
            <FormItem label='发票号码' validateStatus={!invoiceNumberError ? 'success' : 'error'}>
                <Input
                    className="autoFocus_item"
                    value={invoiceNumber}
                    maxLength={8}
                    // onChange={(e)=>this.metaAction.sf("data.form.invoiceNumber",e.target.value)}
                    onChange={(e) => this.handleChange("data.form.invoiceNumber", e.target.value)}
                    disabled={this.getVoucherStatus()}>
                </Input>
            </FormItem>,
            <FormItem className="invoiceDate_container" label='开票日期' validateStatus={!dateError ? 'success' : 'error'}>
                <DatePicker
                    className="autoFocus_item"
                    value={this.metaAction.stringToMoment(invoiceDate)}
                    // onChange={(d) => this.metaAction.sf('data.form.invoiceDate', this.metaAction.momentToString(d, 'YYYY-MM-DD'))}
                    onChange={(d) => this.handleChange('data.form.invoiceDate', this.metaAction.momentToString(d, 'YYYY-MM-DD'))}
                    disabledDate={this.handleDisabledDates}
                    getCalendarContainer={() => document.getElementsByClassName('invoiceDate_container')[0]}
                    disabled={this.getVoucherStatus()}>
                </DatePicker>
            </FormItem>
        ]
        let renderArchives = this.renderArchives(),
            renderArchives1 = this.renderArchives1()
        if (renderArchives) {
            const archives = renderArchives.filter(o => o)
            archives.forEach((item) => {
                defaultContentArr.push(item)
            })
        }
        if (renderArchives1) {
            const archives = renderArchives1.filter(o => o)
            archives.forEach((item) => {
                defaultContentArr.push(item)
            })
        }

        return defaultContentArr
    }

    */

    getVisible = (field) => {

        /*优化*/
        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        if (columnSetting) {
            columnSetting = columnSetting && columnSetting.toJS()
            let isVisible = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == field)[0].isVisible
            return isVisible
        }
        return false

    }

    /*
    renderArchives1 = () => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'),
            remarkName = this.metaAction.gf('data.form.remarkName') ? this.metaAction.gf('data.form.remarkName') : undefined,
            remark = this.metaAction.gf('data.form.remark') && this.metaAction.gf('data.form.remark')

        columnSetting = columnSetting && columnSetting.toJS()
        const archivesArr = [
            { label: '备注', name: 'remark', upName: 'Remark', value: remarkName, optionArr: remark },
        ]

        if (columnSetting) {
            let domArr = archivesArr.map((item) => {
                let isVisible = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].isVisible
                let caption = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].caption
                if (isVisible) {
                    return (
                        <FormItem label={caption} className={'app-sa-delivery-card-form-header-remark1'}>
                            <Input
                                className="autoFocus_item"
                                value={remark}
                                // onChange={(e) => this.metaAction.sf("data.form.remark", e.target.value)}
                                onChange={(e) => this.handleChange("data.form.remark", e.target.value)}
                                disabled={this.getVoucherStatus()}>
                            </Input>
                        </FormItem>
                    )
                } else {
                    return null
                }
            })
            return domArr
        }
    }

    renderArchives = () => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'),
            departmentName = this.metaAction.gf('data.form.departmentId') ? this.metaAction.gf('data.form.departmentId') : undefined,
            salesPersonName = this.metaAction.gf('data.form.salesPersonName') ? this.metaAction.gf('data.form.salesPersonName') : undefined,
            projectName = this.metaAction.gf('data.form.projectId') ? this.metaAction.gf('data.form.projectId') : undefined,
            department = this.metaAction.gf('data.other.department') && this.metaAction.gf('data.other.department'),
            salesPerson = this.metaAction.gf('data.other.salesPerson') && this.metaAction.gf('data.other.salesPerson'),
            project = this.metaAction.gf('data.other.project') && this.metaAction.gf('data.other.project')

        let projectArr = this.metaAction.gf('data.other.project'), projectNow
        if (projectArr) {
            projectArr = projectArr.size ? projectArr.toJS() : projectArr
            projectArr.map(item => {
                if (item.id == projectName && item.isEnable) {
                    projectNow = item.id
                }
            })
            projectName = projectNow ? projectName : undefined
        }
        if (!projectNow) {
            this.metaAction.sf('data.form.projectName', '')
            this.metaAction.sf('data.form.projectId', '')
        }
        let departmentArr = this.metaAction.gf('data.other.department'), departmentNow = false
        if (departmentArr) {
            departmentArr = departmentArr.size ? departmentArr.toJS() : departmentArr
            departmentArr.map(item => {
                if (item.id == departmentName) departmentNow = true
            })
            departmentName = departmentNow ? departmentName : undefined
        }
        if (!departmentNow) {
            this.metaAction.sf('data.form.departmentId', '')
            this.metaAction.sf('data.form.departmentName', '')
        }

        columnSetting = columnSetting && columnSetting.toJS()
        const archivesArr = [
            { label: '部门', name: 'department', upName: 'Department', value: departmentName, optionArr: department },
            { label: '项目', name: 'project', upName: 'Project', value: projectName, optionArr: project },
        ]

        if (columnSetting) {
            let domArr = archivesArr.map((item) => {
                let isVisible = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].isVisible
                let caption = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == item.name)[0].caption
                if (isVisible) {
                    return (
                        <FormItem label={caption}>
                            <Select
                                className="autoFocus_item"
                                showSearch={true}
                                allowClear={true}
                                filterOption={this.filterOptionArchives.bind(null, item.name)}
                                placeholder='按名称/拼音/编码搜索'
                                disabled={this.getVoucherStatus()}
                                value={item.value && String(item.value)}
                                onFocus={() => this.voucherAction[`get${item.upName}`]({ entity: { isEnable: true } }, `data.other.${item.name}`)}
                                dropdownFooter={this.handleAddRecord(`${item.upName}`, `${item.name}`)}
                                onChange={this.onFieldChange({ id: `data.form.${item.name}Id`, name: `data.form.${item.name}Name` }, `data.other.${item.name}`)}
                            >
                                {this.handleSelect(item.optionArr, true)}
                            </Select>
                        </FormItem>
                    )
                } else {
                    return null
                }
            })
            return domArr
        }
    }

    */

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
