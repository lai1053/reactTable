import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator, Select, Checkbox, Form, DatePicker, Button, Input, Icon, Popover, ColumnsSetting } from 'edf-component'
import { blankDetail } from './data'
const Option = Select.Option
const FormItem = Form.Item

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
            addTabsCloseListen('ttk-scm-app-pu-invoice-card', () => this.isEditing)
        }
        injections.reduce('init')
        this.initLoad(this.component.props.id || null)
        this.renderNum = 1
        this.isEditing = false
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
                isChange = false,
                details = form.details

            let list = [
                this.webapi.arrival.init({ id: form.id }),
                this.webapi.arrival.queryInventory(),
            ]
            const res = await Promise.all(list)
            if (res) {
                let result = res[0]
                if (res[1]) res[1] = this.getFullName(res[1]);
                if (!result.voucher) {
                    this.initLoad(null)
                    return
                }

                if (result.vatTaxpayer != other.vatTaxpayer) {
                    result = this.handleDefalutDate(result)
                    this.injections.reduce('initLoad', result)
                    return
                }
                if (!result.voucher || result.voucher.accountStatus != 4000140002) {
                    const inventorys = res[1]
                    const baseArchive = await this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" })
                    let auditVisible = this.metaAction.gf('data.other.auditVisible')
                    if (form.id && auditVisible) {
                        let detailHeight = this.metaAction.gf('data.other.detailHeight')
                        if (result.voucher.details) {
                            detailHeight = Number(detailHeight.replace('px', ""))
                            const length = detailHeight <= 245 ? 245 / 35 : detailHeight / 35
                            while (result.voucher.details.length < length) {
                                result.voucher.details.push(blankDetail)
                            }
                        }
                        this.metaAction.sfs({
                            'data.form.deductible': result.voucher.deductible,
                            'data.form.details': fromJS(result.voucher.details),
                            'data.form.signAndRetreat': result.voucher.signAndRetreat,
                            //'data.other.signAndRetreatCheck': result.voucher.signAndRetreat == 4000100002 ? true : false
                        })
                        details = result.voucher.details
                        data.form.details = details
                    }
                    await this.handleCheckisEnable(result, form, other, data, isChange, details, inventorys, "onTabFocus")

                    this.metaAction.sfs({
                        'data.other.isSignAndRetreat': result.isSignAndRetreat,
                        'data.other.inventorys': fromJS(inventorys),
                        'data.form.status': result.voucher.status,
                        'data.other.accountStatus': result.voucher.accountStatus,
                        'data.other.vatTaxpayer': result.vatTaxpayer,
                        'data.form.ts': result.voucher.ts,
                        'data.other.supplier': fromJS(baseArchive['供应商']),
                        'data.other.department': fromJS(baseArchive['部门']),
                        'data.other.project': fromJS(baseArchive['项目']),
                        // 'data.other.bankAccount': fromJS(baseArchive['账号']),
                    })
                    this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
                } else {
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

                    this.injections.reduce('load', result.voucher)
                    this.injections.reduce('updateState', 'data.other.allMessage', fromJS(result))
                }
            }
        }
    }


    initLoad = async (id, type) => {
        let list = [
            this.webapi.arrival.init({ id: id }),
            this.webapi.arrival.queryInventory()
        ]

        if (id) {
            // list.push(this.voucherAction.getSupplier({ entity: { isEnable: true } }, 'data.other.supplier'))
            // list.push(this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`))
            // list.push(this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`))
            // list.push(this.voucherAction.getBankAccount({entity: { isEnable: true }}, `data.other.bankAccount`))
            list.push(this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" }))
        }

        const res = await Promise.all(list)
        if (res) {
            let response = res[0]
            if (res[1]) res[1] = this.getFullName(res[1])
            response.inventorys = res[1] && res[1]
            let sfObj = {}

            if (id) {
                let data = this.metaAction.gf('data').toJS(),
                    other = data.other,
                    form = response.voucher,
                    isChange = false,
                    details = response.voucher.details,
                    result = response,
                    baseArchive = res[2] ? res[2] : []

                if (!result.voucher || result.voucher.accountStatus != 4000140002) {
                    const inventorys = res[1]

                    this.metaAction.sfs({
                        'data.other.supplier': fromJS(baseArchive['供应商']),
                        'data.other.department': fromJS(baseArchive['部门']),
                        'data.other.project': fromJS(baseArchive['项目']),
                        //'data.other.bankAccount': fromJS(baseArchive['账号'])
                    })

                    this.handleCheckisEnable(result, form, other, data, isChange, details, inventorys, "initLoad")
                    this.handleRequireCheck(form, details, inventorys)
                    sfObj['data.other.inventorys'] = fromJS(res[1])
                } else {
                    sfObj['data.error'] = fromJS({})
                }

            } else {


                if (response.vatTaxpayer === 2000010001) {
                    //新增时一般企业征收方式默认一般项目
                    response.voucher.signAndRetreat = 4000100002;
                }

                //response.voucher.signAndRetreat=4000100001;

                response = this.handleDefalutDate(response)
                sfObj['data.error'] = fromJS({})
            }
            sfObj['data.other.auditVisible'] = false
            sfObj['data.other.pageKey'] = Math.random()
            this.metaAction.sfs(sfObj)

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

            this.injections.reduce('initLoad', response)
        }
        this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
    }

    handleRequireCheck = (form, details, inventorys) => {
        const param = form.supplierId
        const sfObj = {}
        sfObj[`data.error`] = fromJS({})

        if (form.accountStatus != 4000140002) {
            if (!form.supplierName && !form.supplierId) {
                if (!param) {
                    sfObj[`data.error.supplier`] = '请选择销方名称'
                } else {
                    let voucherList = this.metaAction.gf(`data.other.supplier`)
                    if (voucherList) {
                        voucherList = voucherList.toJS()
                        let selected = voucherList.find(o => {
                            if (o.id == param) {
                                return true
                            } else {
                                return false
                            }
                        })

                        if (!selected) {
                            sfObj[`data.error.supplier`] = '请选择销方名称'
                        } else {
                            sfObj[`data.error.supplier`] = undefined
                        }
                    }
                }
            }
            // if (details && details.length != 0) {
            //     let selecteds = null
            //     let currentIndex = null
            //     details = details.filter(o => o.amount || o.taxRateId || o.inventoryId || o.businessTypeId)
            //     details.forEach((obj, index) => {

            //         if (!obj.propertyName) {
            //             sfObj[`data.error.${index}.propertyName`] = '请选择业务类型'
            //         } else {
            //             sfObj[`data.error.${index}.propertyName`] = undefined
            //         }

            //         if (!obj.inventoryId && !obj.businessTypeId) {
            //             sfObj[`data.error.${index}.inventory`] = '请选择存货名称'
            //         } else {
            //             if (obj.inventoryId || obj.businessTypeId) {
            //                 if (inventorys && inventorys.length != 0) {
            //                     inventorys.find((item, key) => {
            //                         if (item.id == obj.inventoryId || item.id == obj.businessTypeId) {
            //                             selecteds = true
            //                             return true
            //                         } else {
            //                             currentIndex = index
            //                             selecteds = false
            //                             return false
            //                         }
            //                     })
            //                 }
            //             }
            //             if (!selecteds) {
            //                 if (currentIndex != null) {
            //                     sfObj[`data.error.${currentIndex}.inventory`] = '请选择存货名称'
            //                 } else {
            //                     sfObj[`data.error.${currentIndex}.inventory`] = undefined
            //                 }
            //             }
            //         }
            //     })
            // }
        }
        this.metaAction.sfs(sfObj)
    }

    handleDefalutDate = (params) => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let periodDate = currentOrg.periodDate
        if (periodDate) {
            let monthDate = utils.date.monthStartEndDay(periodDate)
            params.voucher.businessDate = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM-DD')
            params.voucher.invoiceDate = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM-DD')
            params.voucher.authenticatedMonth = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM')
        } else {
            params.voucher.businessDate = moment().format('YYYY-MM-DD')
            params.voucher.invoiceDate = moment().format('YYYY-MM-DD')
            params.voucher.authenticatedMonth = moment().format('YYYY-MM')
        }

        return params
    }

    handleCheckisEnable = async (result, form, other, data, isChange, details, inventorys, type) => {
        const fileArr = [
            { label: 'supplier', name: 'Supplier' },
            { label: 'department', name: 'Department' },
            { label: 'project', name: 'Project' },
            { label: 'bankAccount', name: 'BankAccount' },
        ]

        if (result.beginDate && other.beginDate && result.beginDate.replace(/-/g, '') != other.beginDate.replace(/-/g, '')) {
            isChange = true
            other.beginDate = result.beginDate
        }
        for (let i = 0; i < fileArr.length; i++) {
            const item = fileArr[i]
            const param = item.label == 'bankAccount' ? other[item.label] : other[item.label] && form[`${item.label}Id`]
            if (param) { //找出点击并选择了的档案这样就可以减少没有必要的更新
                // if (type != 'initLoad') {
                //     await this.voucherAction[`get${item.name}`]({ entity: { isEnable: true } }, `data.other.${item.label}`)
                // }

                let voucherList = this.metaAction.gf(`data.other.${item.label}`)

                if (voucherList) {
                    voucherList = voucherList.toJS()
                    let selected = voucherList.find(o => {
                        if (o.id == form[`${item.label}Id`]) {
                            return true
                        } else {
                            return false
                        }
                    })

                    if (item.label == 'bankAccount') {
                        form.settles.forEach(obj => {
                            voucherList.find(item => {
                                if (obj.bankAccountId == item.id) {
                                    selected = true
                                    return true
                                } else {
                                    selected = false
                                    return false
                                }
                            })

                            if (!selected) {
                                obj.bankAccountId = ''
                            }
                        })
                    }
                    if (!selected) {
                        other[item.label] = voucherList
                        delete form[`${item.label}Id`]
                        delete form[`${item.label}Name`]
                        data.other = other
                        if (result.voucher.ts) form.ts = result.voucher.ts
                        if (result.voucher.accountStatus) form.accountStatus = result.voucher.accountStatus
                        data.form = form
                        // result.voucher = form
                        isChange = true
                    } else {
                        other[item.label] = voucherList
                    }
                }
            }
            if (details && details.length != 0) {
                let selecteds = null
                let currentIndex = null
                details.forEach((obj, index) => {
                    if (obj.inventoryId || obj.businessTypeId) {
                        if (inventorys && inventorys.length != 0) {
                            inventorys.find((item, key) => {
                                if (item.id == obj.inventoryId || item.id == obj.businessTypeId) {
                                    selecteds = true
                                    if (!form.id) {
                                        if (item.specification != obj.specification) {
                                            obj.specification = item.specification
                                            isChange = true
                                        }
                                        if (item.unitId != obj.unitId) {
                                            obj.unitId = item.unitId
                                            obj.unitName = item.unitName
                                            isChange = true
                                        }
                                    }
                                    return true
                                } else {
                                    currentIndex = index
                                    selecteds = false
                                    return false
                                }

                            })
                        }
                    }
                    if (!selecteds) {
                        if (currentIndex != null) {
                            if (details[currentIndex].inventoryId) {
                                delete details[currentIndex].inventoryId
                            } else if (details[currentIndex].businessTypeId) {
                                delete details[currentIndex].businessTypeId
                            }

                            if (details[currentIndex].inventoryName) {
                                delete details[currentIndex].inventoryName
                            } else if (details[currentIndex].businessTypeName) {
                                delete details[currentIndex].businessTypeName
                            }
                            data.form.details = details
                            isChange = true
                        }
                    }
                })
            }
        }
        isChange && this.injections.reduce('updateState', 'data', fromJS(data))

    }

    enlargeClick = async (params) => {
        // this.getDom(true)
        this.getDom()
    }

    load = (voucher, vatTaxpayer) => {
        this.injections.reduce('load', voucher, vatTaxpayer)
    }

    getDom = (isNotInit) => {
        let content = document.getElementsByClassName("edfx-app-portal-content-main"),
            detailsDom = document.getElementsByClassName("ttk-scm-app-pu-invoice-card-form-details")[0],
            cardFormHead = document.getElementsByClassName("ttk-scm-app-pu-invoice-card-form-header")[0],
            card = content[0],
            cardHeight = card.clientHeight,
            value = [],
            data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS(),
            details = data && data.form.details ? data.form.details : [],
            length = details.length

        // const cardFormHeadHeight = cardFormHead&&cardFormHead.clientHeight ? cardFormHead&&cardFormHead.clientHeight : 106

        let cardFormHeadHeight = cardFormHead && cardFormHead.clientHeight
        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        columnSetting = columnSetting && columnSetting.toJS()
        // let height = cardHeight - 220 - cardFormHeadHeight
        let height = cardHeight - 223 - cardFormHeadHeight

        // 因为需要前端自己从数组里面过滤哪些显示和不显示会有个时间
        // 如果这个数组还没拿过来就已经渲染了表格高度，这个高度就会计算错误
        if (!detailsDom || !cardFormHeadHeight || !columnSetting) {
            setTimeout(() => {
                this.renderNum = this.renderNum + 1
                return this.getDom()
            }, 100)
        } else {
            if (height < 110) { // 打开控制台的时候防止明细行数太少
                height = 109
            }
            const detailHeight = this.metaAction.gf('data.other.detailHeight')
            this.injections.reduce('updateState', 'data.other.detailHeight', height + 'px')

            if (!isNotInit) {
                if (card.length != 0) {
                    length = Math.ceil(height / 35) > 5 ? Math.ceil(height / 35) : 5
                    let details = this.metaAction.gf('data.form.details').toJS()

                    while (details.length < length - 2) {
                        details.push(blankDetail)
                    }
                    this.injections.reduce('setrowsCount', details, details.length)
                }
            }
        }
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
            win.addEventListener('resize', this.getDom, false)
        } else if (win.attachEvent) {
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
            win.attachEvent('onresize', this.getDom)
        }

        setTimeout(() => {
            let header = document.getElementsByClassName('ttk-scm-app-pu-invoice-card-form-header')[0] //ReactDOM.findDOMNode(thisStub.refs.auxItem)
            let footer = document.getElementsByClassName('app-pu-invoice-card-form-footer-settlement')[0]
            if (header && footer) {
                if (header.addEventListener) {
                    header.addEventListener('keydown', (e) => this.handleKeyDown(e, null, 'ttk-scm-app-pu-invoice-card-form-header'), false)
                    footer.addEventListener('keydown', (e) => this.handleKeyDown(e, null, 'app-pu-invoice-card-form-footer-settlement'), false)
                } else if (header.attachEvent) {
                    header.attachEvent('onkeydown', (e) => this.handleKeyDown(e, null, 'ttk-scm-app-pu-invoice-card-form-header'))
                    footer.attachEvent('onkeydown', (e) => this.handleKeyDown(e, null, 'app-pu-invoice-card-form-footer-settlement'))
                } else {
                    header.onKeyDown = (e) => this.handleKeyDown(e, null, 'ttk-scm-app-pu-invoice-card-form-header')
                    footer.onKeyDown = (e) => this.handleKeyDown(e, null, 'app-pu-invoice-card-form-footer-settlement')
                }
            }
        }, 0)
    }

    componetWillUnmount = () => {
        const win = window
        if (win.removeEventListener) {
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
            win.removeEventListener('resize', this.getDom, false)
        } else if (win.detachEvent) {
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
            win.detachEvent('onresize', this.getDom)
        }
    }

    bodyKeydownEvent = (e) => {
        const dom = document.getElementById('ttk-scm-app-pu-invoice-card')
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
            else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) { //保存
                this.save(false)
                if (e.preventDefault) {
                    e.preventDefault()
                }
                if (e.stopPropagation) {
                    e.stopPropagation()
                }
            }
            else if (e.ctrlKey && !e.altKey && (e.key == '/' || e.keyCode == 191)) {//保存并新增
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
        let list = [
            this.webapi.arrival.previous({ code, isReturnValue: true }),
            // this.voucherAction.getSupplier({ entity: { isEnable: true } }, 'data.other.supplier'),
            // this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`),
            // this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`),
            // this.voucherAction.getBankAccount({entity: { isEnable: true }}, `data.other.bankAccount`)
            this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" })
        ]
        // const other = this.metaAction.gf('data.other').toJS()

        const res = await Promise.all(list)
        let response = res[0], sfObj = {}
        if (response) {
            if (response.result == false && response.error) {
                sfObj['data.other.prevDisalbed'] = true
                sfObj['data.other.nextDisalbed'] = false
                this.metaAction.toast('error', response.error.message)
            } else {
                const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
                let details = response.details,
                    settles = response.settles,
                    data = this.metaAction.gf('data').toJS(),
                    // other = data.other,
                    inventorys = this.metaAction.gf('data.other.inventorys').toJS(),
                    baseArchive = res[1] ? res[1] : []

                this.metaAction.sfs({
                    'data.other.supplier': fromJS(baseArchive['供应商']),
                    'data.other.department': fromJS(baseArchive['部门']),
                    'data.other.project': fromJS(baseArchive['项目']),
                    // 'data.other.bankAccount': fromJS(baseArchive['账号'])
                })
                const other = this.metaAction.gf('data.other').toJS()
                if (response.accountStatus != 4000140002) {
                    response = await this.handleCheckisEnableEasy(response, details, settles, other, inventorys, 'prev')
                }

                // this.injections.reduce('updateState', 'data.other.nextDisalbed', false)
                sfObj['data.other.nextDisalbed'] = false
                // sfObj['data.other.supplier'] = fromJS(baseArchive['供应商'] || [])
                // sfObj['data.other.department'] = fromJS(baseArchive['部门'] || [])
                // sfObj['data.other.project'] = fromJS(baseArchive['项目'] || [])
                // sfObj['data.other.bankAccount'] = fromJS(baseArchive['账号'] || [])
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
                this.load(response, vatTaxpayer)
                this.handleRequireCheck(response, details, inventorys)
                sfObj['data.other.pageKey'] = Math.random()
            }

            this.metaAction.sfs(sfObj)
        }
        this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
    }

    next = async () => {
        const code = this.metaAction.gf('data.form.code')

        let list = [
            this.webapi.arrival.next({ code, isReturnValue: true }),
            // this.voucherAction.getSupplier({ entity: { isEnable: true } }, 'data.other.supplier'),
            // this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`),
            // this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`),
            // this.voucherAction.getBankAccount({entity: { isEnable: true }}, `data.other.bankAccount`)
            this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" })
        ]
        const other = this.metaAction.gf('data.other').toJS()

        const res = await Promise.all(list)
        let response = res[0], sfObj = {}
        if (response) {
            if (response.result == false && response.error) {
                sfObj['data.other.prevDisalbed'] = false
                sfObj['data.other.nextDisalbed'] = true
                this.metaAction.toast('error', response.error.message)
            } else {
                const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
                let details = response.details,
                    settles = response.settles,
                    data = this.metaAction.gf('data').toJS(),
                    other = data.other,
                    inventorys = this.metaAction.gf('data.other.inventorys').toJS(),
                    baseArchive = res[1] ? res[1] : []

                this.metaAction.sfs({
                    'data.other.supplier': fromJS(baseArchive['供应商']),
                    'data.other.department': fromJS(baseArchive['部门']),
                    'data.other.project': fromJS(baseArchive['项目']),
                    //'data.other.bankAccount': fromJS(baseArchive['账号'])
                })
                if (response.accountStatus != 4000140002) {
                    response = await this.handleCheckisEnableEasy(response, details, settles, other, inventorys, 'next')
                }
                // this.injections.reduce('updateState', 'data.other.prevDisalbed', false)
                sfObj['data.other.prevDisalbed'] = false
                // sfObj['data.other.supplier'] = fromJS(baseArchive['供应商'] || [])
                // sfObj['data.other.department'] = fromJS(baseArchive['部门'] || [])
                // sfObj['data.other.project'] = fromJS(baseArchive['项目'] || [])
                // sfObj['data.other.bankAccount'] = fromJS(baseArchive['账号'] || [])
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
                this.load(response, vatTaxpayer)
                this.handleRequireCheck(response, details, inventorys)
                sfObj['data.other.pageKey'] = Math.random()
            }

            this.metaAction.sfs(sfObj)
        }
        this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
    }

    setting = async () => {
        let setting = this.metaAction.gf('data.other.columnSetting')
        let initOption = []
        setting = setting && setting.toJS()
        if (setting && setting.body) {
            let obj = {
                key: setting.code,
                name: setting.name
            }

            if (setting.header) {
                obj.option = setting.header.cards
            }

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
            width: 500,
            iconType: null,
            footer: null,
            bodyStyle: { fontFamily: 'Microsoft YaHei' },
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
            await this.handleConfirmSet(res.option)
            this.getDom(true)
        } else if (res && res.type == 'reset') {
            await this.handleResetSet(setting.code)
            this.getDom(true)
        }

    }
    //设置 恢复默认设置
    handleResetSet = async (code) => {
        if (code) {
            const result = await this.webapi.arrival.reInitByUser({ code: code })
            this.injections.reduce('updateState', 'data.other.columnSetting', fromJS(result))
            this.getDom(true)
        }
    }
    //设置 确定
    handleConfirmSet = async (params) => {
        if (params) {
            const setting = this.metaAction.gf('data.other.columnSetting').toJS()
            const cards = params[0] && params[0].option
            const tables = params[1] && params[1].option

            if (setting) {
                setting.header.cards = cards
                setting.body.tables[0].details = tables
            }
            const result = await this.webapi.arrival.updateWithDetail(setting)
            this.injections.reduce('updateState', 'data.other.columnSetting', fromJS(result))
        }
    }


    add = async () => {
        const res = await this.metaAction.modal('confirm', {
            title: '放弃',
            content: '点击放弃会重置你所有的操作，确定要放弃吗？',
        })
        if (res) {
            this.initLoad()
        }
    }

    handleCheckisEnableEasy = async (response, details, settles, other, inventorys, type) => {
        const fileArr = [
            { label: 'supplier', name: 'Supplier' },
            { label: 'department', name: 'Department' },
            { label: 'project', name: 'Project' },
            { label: 'bankAccount', name: 'BankAccount' },
        ]

        for (let i = 0; i < fileArr.length; i++) {
            const item = fileArr[i]
            const param = item.label == 'bankAccount' ? other[item.label] : other[item.label] && response[`${item.label}Id`]
            if (param) {
                // if (type == 'audit') {
                //     await this.voucherAction[`get${item.name}`]({ entity: { isEnable: true } }, `data.other.${item.label}`)
                // }

                let voucherList = this.metaAction.gf(`data.other.${item.label}`)
                if (voucherList) {
                    voucherList = voucherList.toJS()
                    let selected = voucherList.find(o => {
                        if (o.id == response[`${item.label}Id`]) {
                            return true
                        } else {
                            return false
                        }
                    })

                    if (item.label == 'bankAccount') {
                        settles.forEach(obj => {
                            voucherList.find(item => {
                                if (obj.bankAccountId == item.id) {
                                    selected = true
                                    return true
                                } else {
                                    selected = false
                                    return false
                                }
                            })

                            if (!selected) {
                                obj.bankAccountId = ''
                            }
                        })
                    }
                    if (!selected) {
                        other[item.label] = voucherList
                        delete response[`${item.label}Id`]
                        delete response[`${item.label}Name`]
                    }
                }
            }
        }

        if (details && details.length != 0) {
            let selecteds = null
            let currentIndex = null
            details.forEach((obj, index) => {
                if (obj.inventoryId || obj.businessTypeId) {
                    if (inventorys && inventorys.length != 0) {
                        inventorys.find((item, key) => {
                            if (item.id == obj.inventoryId || item.id == obj.businessTypeId) {
                                selecteds = true
                                return true
                            } else {
                                currentIndex = index
                                selecteds = false
                                return false
                            }
                        })
                    }
                }
                // console.log(selecteds, currentIndex)
                if (!selecteds) {
                    if (currentIndex != null) {
                        if (details[currentIndex].inventoryId) {
                            delete details[currentIndex].inventoryId
                        } else if (details[currentIndex].businessTypeId) {
                            delete details[currentIndex].businessTypeId
                        }

                        if (details[currentIndex].inventoryName) {
                            delete details[currentIndex].inventoryName
                        } else if (details[currentIndex].businessTypeName) {
                            delete details[currentIndex].businessTypeName
                        }
                        response.details = details
                    }

                }
            })
        }

        return response
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

    renderPZZH = () => {
        const docCode = this.metaAction.gf('data.form.docCode')

        if (/已生成/.test(docCode)) {
            return docCode ? docCode : ''
        } else {
            return docCode ? `记-${docCode}` : ''
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

        const response = await this.webapi.queryAccountEnable({ entranceFlag: 'arrival' })
        let aaa = 'pu'
        if (response.isShow) {
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
                        vatOrEntry: 1,
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
                    vatOrEntry: 1,
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
            uncertDocId = this.metaAction.gf('data.form.uncertDocId'),
            docId = this.metaAction.gf('data.form.docId'),
            supplierId = this.metaAction.gf('data.form.supplierId'),
            docCode = this.metaAction.gf('data.form.docCode'),
            docSourceTypeName = this.metaAction.gf('data.form.docSourceTypeName'),
            details = this.metaAction.gf('data.form.details').toJS();
        if (!id && !ts) {
            this.metaAction.toast('error', '请保存单据')
            return
        }
        const { baseUrl, softAppName } = this.getBaseUrl();
        if (status == consts.consts.VOUCHERSTATUS_NotApprove || status == consts.consts.VOUCHERSTATUS_Rejected) {
            if (! await this.checkForSave()) return
            if (!supplierId) {
                const queryAchivalAccount = await this.webapi.queryAchivalAccount();
                if (queryAchivalAccount) {
                    const confirm = await this.metaAction.modal('confirm', {
                        title: '提示',
                        width: 500,
                        okText: '是',
                        cancelText: '否',
                        content: queryAchivalAccount
                    })
                    const supplierAccountSet = confirm ? 1 : 0;
                    await this.webapi.saveAchivalAccount({ supplierAccountSet });
                }
            }

            if (!baseUrl) {

                let param = {}
                let accountEnableDto = {}
                accountEnableDto.entranceFlag = 'arrival'
                param.accountEnableDto = accountEnableDto

                let responseNew = await this.webapi.queryAccountEnable(param)
                let aaa = 'pu'
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
                        let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                        if (checkAccountIsUsed) {
                            const ret = await this.metaAction.modal('confirm', {
                                content: '上级科目已存在发生额，新增下级科目会把发生额自动结转到第一个下级科目上，是否继续生成'
                            })
                            if (!ret) {
                                this.metaAction.toast('warning', '请到会计科目中把余额结转到下级科目中，再批量生成凭证')
                                return
                            }
                        }
                    }
                } else {
                    let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
                    if (checkAccountIsUsed) {
                        const ret = await this.metaAction.modal('confirm', {
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
                    isArrival: true,
                    isDelivery: false,
                    arrivalIdList: [id],
                    deliveryIdList: []
                });

                if (getInvoiceInvMatch.allMatched !== true) {
                    return await this.collateInvoice({ data: [{ id, ts }], idList: [id] });
                }

                // const ruleRes = await this.webapi.getMatchingRule({ onlyNotMatch: true, arrivalIdList: [id] });
                // if (ruleRes.invoiceInventoryList.length > 0) {
                //     const mappingAccountRes = await this.metaAction.modal('show', {
                //         title: '科目匹配',
                //         width: 920,
                //         children: this.metaAction.loadApp('ttk-scm-mapping-account', {
                //             store: this.component.props.store,
                //             inventoryType: 'arrival',
                //             ruleRes
                //         }),
                //     })
                //     if (mappingAccountRes === 'false') return
                // }



                const aanyyya = await this.webapi.arrival.audit({ id, ts })
                if (aanyyya) {
                    this.metaAction.toast('success', '单据生成凭证成功')
                    this.load(aanyyya)
                }
            } else {

                //生成T+凭证
                // const inventoryIdList = [];

                // details.forEach(d => {
                //     if (d.inventoryId && inventoryIdList.indexOf(d.inventoryId) == -1) {
                //         inventoryIdList.push(d.inventoryId);
                //     }
                // })

                // let param = {}
                // let accountEnableDto = {}
                // accountEnableDto.entranceFlag = 'arrival'
                // param.accountEnableDto = accountEnableDto

                // let responseNew = await this.webapi.queryAccountEnable(param)
                // let aaa = 'pu'
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
                //         let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
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
                //     let checkAccountIsUsed = await this.webapi.checkAccountIsUsed({ entranceFlag: 'arrival' })
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
                        vatOrEntry: 1,
                        selectedData: {
                            id,
                            ts
                        },
                        baseUrl,
                        softAppName,
                        //  supplierIdList: supplierId ? [supplierId] : [],//供应商IDlist
                        // inventoryIdList,//存货IDlist
                        entity: 'card',
                        arrivalIdList: [id]
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
                        this.metaAction.toast('success', '单据生成凭证成功')
                        this.load(response)
                        this.metaAction.sf('data.form.attachmentStatus', 1)
                    }
                }
            }
        } else {
            if (uncertDocId) {
                let ret = await this.metaAction.modal('confirm', {
                    content: '删除凭证会同时删除跨月认证对应的进项税额凭证，是否删除？'
                })
                if (!ret) {
                    return
                }
            }

            if (baseUrl && docSourceTypeName === `${softAppName}凭证`) {

                //删除T+凭证
                const restplus = await this.webapi.tplus.common(`${baseUrl}/common/doc/deleteBatch`,
                    [{
                        externalCode: docId
                    }]
                    , {
                        headers: {
                            token: this.getOrgId()
                        }
                    })

                if (uncertDocId) {
                    const rest2 = await this.webapi.tplus.common(`${baseUrl}/common/doc/deleteBatch`,
                        [{
                            externalCode: uncertDocId
                        }]
                        , {
                            headers: {
                                token: this.getOrgId()
                            }
                        })
                }

                if (restplus && restplus.error) {
                    this.metaAction.toast('error', `${restplus.error.message}`);
                    return
                } else if (restplus && restplus.result) {
                    if (!restplus.value) return
                    if (restplus.value.failItems && restplus.value.failItems.length > 0) {
                        if (!/不存在/.test(restplus.value.failItems[0].msg)) {
                            this.metaAction.toast('error', `${restplus.value.failItems[0].msg}`);
                            return
                        }
                    }
                    const list = [
                        this.webapi.arrival.unaudit({ id, ts }),
                        this.webapi.arrival.queryInventory(),
                        this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" })
                    ]

                    const res = await Promise.all(list)
                    let response = res[0]
                    if (res[1]) res[1] = this.getFullName(res[1])
                    const inventorys = res[1] || []
                    if (response) {
                        let form = response,
                            details = response.details,
                            settles = response.settles,
                            data = this.metaAction.gf('data').toJS(),
                            other = data.other,
                            sfObj = {},
                            baseArchive = res[2] ? res[2] : []
                        this.metaAction.sfs({
                            'data.other.supplier': fromJS(baseArchive['供应商']),
                            'data.other.department': fromJS(baseArchive['部门']),
                            'data.other.project': fromJS(baseArchive['项目']),
                            //'data.other.bankAccount': fromJS(baseArchive['账号']),
                        })

                        response = await this.handleCheckisEnableEasy(response, details, settles, other, inventorys, 'audit')
                        this.metaAction.toast('success', '单据删除凭证成功')

                        this.load(response)
                        this.handleRequireCheck(response, details, inventorys)
                        sfObj['data.other.inventorys'] = fromJS(inventorys)

                        // sfObj['data.other.supplier'] = fromJS(baseArchive['供应商'] || [])
                        // sfObj['data.other.department'] = fromJS(baseArchive['部门'] || [])
                        // sfObj['data.other.project'] = fromJS(baseArchive['项目'] || [])
                        // sfObj['data.other.bankAccount'] = fromJS(baseArchive['账号'] || [])

                        const allMessage = this.metaAction.gf('data.other.allMessage') && this.metaAction.gf('data.other.allMessage').toJS()
                        if (allMessage) {
                            sfObj['data.other.isSignAndRetreat'] = allMessage.isSignAndRetreat
                        }

                        this.metaAction.sfs(sfObj)
                    }
                    this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
                } else {
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                    return
                }
            }
            else {
                const list = [
                    this.webapi.arrival.unaudit({ id, ts }),
                    this.webapi.arrival.queryInventory(),
                    this.webapi.arrival.queryBaseArchives({ "isEnable": true, "baseArchiveNames": "supplier,dept,project" })
                ]
                const res = await Promise.all(list)
                if (res[1]) res[1] = this.getFullName(res[1])
                let response = res[0]
                const inventorys = res[1] || []
                if (response) {
                    let form = response,
                        details = response.details,
                        settles = response.settles,
                        data = this.metaAction.gf('data').toJS(),
                        other = data.other,
                        sfObj = {},
                        baseArchive = res[2] ? res[2] : []
                    this.metaAction.sfs({
                        'data.other.supplier': fromJS(baseArchive['供应商']),
                        'data.other.department': fromJS(baseArchive['部门']),
                        'data.other.project': fromJS(baseArchive['项目']),
                        // 'data.other.bankAccount': fromJS(baseArchive['账号']),
                    })

                    response = await this.handleCheckisEnableEasy(response, details, settles, other, inventorys, 'audit')
                    this.metaAction.toast('success', '单据删除凭证成功')

                    this.load(response)
                    this.handleRequireCheck(response, details, inventorys)
                    sfObj['data.other.inventorys'] = fromJS(inventorys)

                    // sfObj['data.other.supplier'] = fromJS(baseArchive['供应商'] || [])
                    // sfObj['data.other.department'] = fromJS(baseArchive['部门'] || [])
                    // sfObj['data.other.project'] = fromJS(baseArchive['项目'] || [])
                    // sfObj['data.other.bankAccount'] = fromJS(baseArchive['账号'] || [])

                    const allMessage = this.metaAction.gf('data.other.allMessage') && this.metaAction.gf('data.other.allMessage').toJS()
                    if (allMessage) {
                        sfObj['data.other.isSignAndRetreat'] = allMessage.isSignAndRetreat
                    }

                    this.metaAction.sfs(sfObj)
                }
                this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)
            }

        }
    }

    getAuditBtnText = () => {
        const { baseUrl, softAppName } = this.getBaseUrl()
        const accountStatus = this.metaAction.gf('data.other.accountStatus')
        // if (!baseUrl) {
        //     return accountStatus == 4000140002 ? '删除凭证' : '生成凭证'
        // } else {
        //     return accountStatus == 4000140002 ? '删除T+凭证' : '生成T+凭证'
        // }
        return accountStatus == 4000140002 ? '删除凭证' : (!baseUrl ? '生成凭证' : `生成${softAppName}凭证`)
    }

    history = async () => {
        this.component.props.setPortalContent('进项', 'ttk-scm-app-pu-invoice-list')
    }

    addSubject = async (index) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            // let accounts = this.metaAction.gf('data.other.accounts').toJS()
            // accounts.push(ret)
            const response = await this.webapi.arrival.getSubject()
            this.metaAction.sf('data.other.accounts', fromJS(response.glAccounts))
            this.onFieldChange(null, "data.other.accounts", index, 'data.form.details[_rowIndex]', null, null, null, ret.id)
        }
    }

    moreMenuClick = (e) => {
        switch (e.key) {
            case 'del':
                this.del()
                break
            // case 'generateReturn':
            //     this.generateReturn()
            //     break
            case 'pay':
                this.pay()
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
            if (id) {
                const response = await this.webapi.arrival.del({ id, ts })
                if (response) {
                    this.metaAction.toast('success', '删除单据成功')
                    this.initLoad()
                }
            } else {
                this.initLoad()
                this.metaAction.toast('success', '删除单据成功')
            }
        }
    }

    generateReturn = async () => {
        let id = this.metaAction.gf(`data.form.id`),
            ts = this.metaAction.gf(`data.form.ts`)
        if (!id && !ts) {
            this.metaAction.toast('error', '请保存单据!')
            return
        }
    }

    pay = () => {
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
            // bankAccountId: data.form.bankAccountId,
            summary: null,
            remark: data.form.remark,
            details: details,
            attachments: data.form.attachments
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '付款单',
                'ttk-scm-app-payment-card',
                { accessType: 1, obj }
            )
    }

    save = async (isNew) => {
        if (! await this.checkForSave()) return
        let ok = this.metaAction.gf('data.ok')
        if (!ok) return false
        this.metaAction.sf('data.ok', false)
        let form = this.metaAction.gf('data.form').toJS()
        if (form.details) {
            form.details = form.details.filter(detail => {
                return (detail.inventoryId || detail.taxRate || detail.amount)
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

        //控制单价 数量 为零时为null
        for (var i = 0; i < params.details.length; i++) {
            if (params.details[i].price == 0 || !params.details[i].price) {
                params.details[i].price = null
            }
            if (params.details[i].quantity == 0 || !params.details[i].quantity) {
                params.details[i].quantity = null
            }
            if (params.details[i].taxInclusiveAmount == 0 || !params.details[i].taxInclusiveAmount) {
                params.details[i].taxInclusiveAmount = null
            }
            if (params.details[i].inventoryRelatedAccountId == undefined && params.details[i].inventoryRelatedAccountName == undefined) {
                params.details[i].inventoryRelatedAccountId = null
                params.details[i].inventoryRelatedAccountName = null
            }
            if (params.details[i].propertyDetailId == undefined) {
                params.details[i].propertyDetailId = null
            }

            if (params.details[i].invoiceInvName == undefined) {
                params.details[i].invoiceInvName = null
            }

            if (params.details[i].businessTypeId) {
                params.details[i].inventoryId = null

                params.details[i].inventoryName = null
                params.details[i].inventoryCode = null
            } else {
                params.details[i].businessTypeId = null

                params.details[i].businessTypeName = null
                params.details[i].businessTypeCode = null

            }

            if (!params.details[i].unitId) {
                params.details[i].unitId = null
            }

            if (!params.details[i].specification) {
                params.details[i].specification = null
            }

            if (!(params.details[i].businessTypeName || params.details[i].inventoryName)) {
                params.details[i].businessTypeId = null
                params.details[i].inventoryId = null
            }
        }
        // const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
        // if (vatTaxpayer == 2000010001 && !params.signAndRetreat) {
        //     params.signAndRetreat = 4000100002
        // }
        delete params.inventorys
        if (params.id || params.id == 0) {
            const response = await this.webapi.arrival.update(params)
            if (response) {
                let result = await this.webapi.arrival.queryInventory()
                if (result) {
                    result = this.getFullName(result)
                    response.inventorys = result
                }
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
        } else {
            const response = await this.webapi.arrival.create(params)

            if (response) {
                let result = await this.webapi.arrival.queryInventory()

                if (result) {
                    result = this.getFullName(result)
                    response.inventorys = result
                }
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

    // 存货名称
    renderSelectOption = (index, data) => {
        const inventorys = this.metaAction.gf('data.other.inventorys') && this.metaAction.gf('data.other.inventorys').toJS() || []
        const propertyId = data.propertyId
        const propertyName = data.propertyName
        let list = []
        if (propertyId || propertyName) {
            list = inventorys.filter(o => (o.propertyId == propertyId || o.propertyName == propertyName))
            return (
                list.map((item) => {
                    const name = item.fullName ? item.fullName : `${item.code} ${item.name}`
                    return <Option key={item.id} value={item.id} title={item.fullName}>{this.getFullNameChildren(item)}</Option>
                })
            )
        } else {
            return (
                inventorys.map((item) => {
                    const name = item.fullName ? item.fullName : `${item.code} ${item.name}`
                    return <Option key={item.id} value={item.id} title={item.fullName}>{this.getFullNameChildren(item)}</Option>
                })
            )
        }

        const resList = list.length != 0 ? list : inventorys
        this.metaAction.sf('data.other.inventory', fromJS(resList))
    }

    getList = ({ vatTaxpayer, taxRate, taxRateName, taxRateTypeList }) => {
        let list = vatTaxpayer == '2000010001' ? taxRateTypeList : [{ id: 3000070002, name: "简易征收", code: "simple" }]
        if (vatTaxpayer == '2000010001' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                list = [{ id: 3000070005, name: "免税", code: "mianshui" },
                { id: 3000070004, name: "免抵退", code: "mdt" }]

            } else if (taxRate > 0.06) {
                list = [{ id: 3000070001, name: "一般计税", code: "general" }]
            } else if (taxRate > 0 && taxRate <= 0.06) {
                if (taxRate == 0.06 || (taxRate == 0.03 && taxRateName == '3%')) {
                    list = [{ id: 3000070002, name: "简易征收", code: "simple" }, { id: 3000070001, name: "一般计税", code: "general" }]
                } else {
                    list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
                }
            }
        } else if (vatTaxpayer == '2000010002' && (taxRate || taxRate == 0)) {
            if (taxRate == 0) {
                list = [{ id: 3000070002, name: "简易征收", code: "simple" }, { id: 3000070005, name: "免税", code: "mianshui" }]
            } else {
                list = [{ id: 3000070002, name: "简易征收", code: "simple" }]
            }
        }
        return list
    }
    // 计税方式
    renderTaxRateTypesSelect = (index, data, isChange) => {
        const taxRate = this.metaAction.gf(`data.form.details.${index}.taxRate`)
        const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
        const taxRateTypeList = this.metaAction.gf('data.other.taxRateType') && this.metaAction.gf('data.other.taxRateType').toJS()
        const taxRateName = this.metaAction.gf(`data.form.details.${index}.taxRateName`)
        let list = []
        if (taxRate || taxRate == 0) {
            if (isChange) {
                if (vatTaxpayer == '2000010001' && (taxRate || taxRate == 0)) {
                    if (taxRate == 0) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070005,
                            [`data.form.details.${index}.taxRateTypeName`]: '免税'
                        })
                    } else if (taxRate > 0.06) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070001,
                            [`data.form.details.${index}.taxRateTypeName`]: '一般计税'
                        })
                    } else if (taxRate > 0 && taxRate <= 0.06) {
                        this.metaAction.sfs({
                            [`data.form.details.${index}.taxRateType`]: 3000070002,
                            [`data.form.details.${index}.taxRateTypeName`]: '简易征收'
                        })
                    }
                } else if (vatTaxpayer == '2000010002' && (taxRate || taxRate == 0)) {
                    this.metaAction.sfs({
                        [`data.form.details.${index}.taxRateType`]: 3000070002,
                        [`data.form.details.${index}.taxRateTypeName`]: '简易征收'
                    })
                }
            } else {
                list = this.getList({ vatTaxpayer, taxRate, taxRateName, taxRateTypeList })
            }
        } else {
            // list = taxRateTypeList
            list = vatTaxpayer == '2000010001' ? taxRateTypeList : [{ id: 3000070002, name: "简易征收", code: "simple" }]
        }
        return list.map((item) => {
            return <Option key={item.id} value={item.id}>{item.name}</Option>
        })
    }
    //是否为民非性质企业（民非性不显示生成凭证）
    notMinfei = () => {
        let accountingStandards = this.metaAction.context.get('currentOrg').accountingStandards;
        return accountingStandards !== 2000020008 && this.component.props.bsgztAccessTaxlist !== 1 ? true : false
    }
    getFocusInventory = async (index, data) => {
        const propertyId = data.propertyId
        const propertyName = data.propertyName
        const id = this.component.props.id || null

        if (!propertyId && !propertyName) {
            let res = await this.webapi.arrival.queryInventory({ id: id })
            if (res) {
                res = this.getFullName(res);
                this.metaAction.sfs({
                    'data.other.inventorys': fromJS(res),
                    'data.other.inventory': fromJS(res)
                })
            }
        } else {
            const inventoryId = data.inventoryId || data.businessTypeId
            let inventoryList = this.metaAction.gf('data.other.inventorys') && this.metaAction.gf('data.other.inventorys').toJS() || []
            inventoryList = inventoryList.filter(o => (o.propertyId == propertyId || o.propertyName == propertyName))
            let sfObj = {}, formId = this.metaAction.gf('data.form.id')
            // if (inventoryId) {
            if (inventoryId && !formId) {
                const isHave = inventoryList.find(obj => {
                    if (obj.id == inventoryId) {
                        return true
                    } else {
                        return false
                    }
                })

                if (!isHave) {
                    const obj = fromJS(blankDetail).toJS()
                    obj.propertyId = propertyId ? propertyId : null
                    obj.propertyName = data.propertyName ? data.propertyName : null
                    sfObj[`data.form.details.${index}`] = fromJS(obj)
                }
            }
            sfObj['data.other.inventory'] = fromJS(inventoryList)

            this.metaAction.sfs(sfObj)
        }
    }

    renderPayDiv = () => {
        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []

        const bankAccount = this.metaAction.gf('data.other.bankAccount'),
            bankAccountName = this.metaAction.gf('data.form.bankAccountName'),
            paymentAmount = this.metaAction.gf('data.form.paymentAmount'),
            isDisableBank = this.metaAction.gf('data.other.isDisableBank'),
            error = this.metaAction.gf('data.error') && this.metaAction.gf('data.error').toJS(),
            form = this.metaAction.gf('data.form').toJS()

        return settles.map((item, index) => {
            const errorObj = error[index] ? error[index] : {}
            const customAttribute = this.metaAction.gf('data.other.customAttribute')
            return <div key={index}>
                <Form className='app-pu-invoice-card-form-footer-settlement'>
                    <FormItem label='结算方式' validateStatus={errorObj.bankAccount ? 'error' : 'success'}>
                        <Select
                            className="autoFocus_item"
                            showSearch={false}
                            allowClear={item.bankAccountId && String(item.bankAccountId) ? true : false}
                            disabled={this.getDisable()}
                            placeholder='请选择账户'
                            getPopupContainer={() => document.querySelector('.edfx-app-portal-content-main')}
                            // value={item.bankAccountId ? String(item.bankAccountId) : undefined}
                            value={this.renderInventoryName(String(item.bankAccountId), `data.other.bankAccount`, item.bankAccountName)}
                            onFocus={() => this.voucherAction.getBankAccount({ entity: { isEnable: true }, attributeList: ["3000050001", "3000050002", "3000050003", "3000050004", "3000050010"] }, `data.other.bankAccount`)}
                            onChange={(value) => this.onFieldChange({ id: `data.form.bankAccountId`, name: `data.form.bankAccountName` }, `data.other.bankAccount`, null, null, index, null, null, value)}
                        >
                            {this.handleSelect(bankAccount)}
                        </Select>
                    </FormItem>
                    <FormItem label='结算金额' validateStatus={errorObj.amount ? 'error' : 'success'} style={{ marginLeft: '15px' }}>
                        <Input.Number
                            className="autoFocus_item"
                            disabled={this.getDisable()}
                            // value={item.amount}
                            value={item.amount && Number(item.amount).toFixed(2)}
                            precision={2}
                            executeBlur={true}
                            customAttribute={customAttribute}
                            onBlur={(v) => this.handlePayBlur(v, index)}
                        ></Input.Number>
                    </FormItem>
                    <div className='app-pu-invoice-card-form-footer-paymentAmount-iconDiv'>
                        <Icon
                            type='plus'
                            title='新增'
                            className='app-pu-invoice-card-form-footer-paymentAmount-iconDiv-iconAdd'
                            disabled={this.getDisable()}
                            style={{ cursor: 'pointer' }}
                            onClick={this.addPaymentAmount}></Icon>
                        <Icon
                            type='minus'
                            title='删除'
                            // disabled={(index == 0) ? true : false} 
                            disabled={(settles.length == 1 ? true : false) || this.getDisable()}
                            style={{ cursor: 'pointer' }}
                            className='app-pu-invoice-card-form-footer-paymentAmount-iconDiv-iconDel'
                            onClick={this.delPaymentAmount.bind(null, index)}></Icon>
                    </div>
                </Form>
            </div>
        })
    }

    //添加千分位
    addThousandsPosition = (input, isFixed) => {
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

    //结算金额失去焦点 才改变剩余金额
    handlePayBlur = (v, index) => {
        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []
        let sfObj = {}
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
            sfObj[`data.error.${index}.amount`] = undefined
        }

        sfObj["data.form.paymentAmount"] = v
        sfObj["data.form.settles"] = fromJS(settles)
        sfObj["data.other.auditVisible"] = false
        sfObj["data.other.customAttribute"] = Math.random()

        this.metaAction.sfs(sfObj)
    }

    handleComCheck = (checkArr, errorList, ishasError) => {
        const authenticated = this.metaAction.gf('data.form.authenticated')
        const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
        const invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
        const form = this.metaAction.gf('data.form').toJS()

        for (let obj of checkArr) {
            if (obj.path == 'data.form.supplierId') {
                if (!form.supplierName) {
                    if (!obj.value) {
                        errorList.push({
                            errorPath: 'data.error.supplier', message: '请选择销方名称'
                        })
                        ishasError = true
                    } else {
                        errorList.push({
                            errorPath: 'data.error.supplier', message: undefined
                        })
                    }
                }
            } else if (obj.path == 'data.form.businessDate') {
                if (!obj.value) {
                    errorList.push({
                        errorPath: 'data.error.businessDate', message: '请选择单据日期'
                    })
                    ishasError = true
                } else {
                    errorList.push({
                        errorPath: 'data.error.businessDate', message: undefined
                    })
                }
            } else if (obj.path == 'data.form.invoiceTypeId') {
                if (!obj.value) {
                    errorList.push({
                        errorPath: 'data.error.invoiceType', message: '请选择发票类型'
                    })
                    ishasError = true
                } else {
                    errorList.push({
                        errorPath: 'data.error.invoiceType', message: undefined
                    })
                }
            } else if (obj.path == 'data.form.authenticatedMonth') {
                // 4000010900 其他发票
                // 4000010010 增值税普通发票
                //4000010030 农产品发票
                //4000010047 旅客运输服务发票
                if (authenticated && vatTaxpayer == '2000010001' && (invoiceTypeId != 4000010030 && invoiceTypeId != 4000010047 && invoiceTypeId != 4000010010 && invoiceTypeId != 4000010900)) {
                    if (!obj.value) {
                        errorList.push({
                            errorPath: 'data.error.authenticatedMonth', message: '请选择认证月份'
                        })
                        ishasError = true
                    } else {
                        errorList.push({
                            errorPath: 'data.error.authenticatedMonth', message: undefined
                        })
                    }
                }
            } else if (obj.path == 'data.form.invoiceNumber') {
                if (!authenticated && vatTaxpayer == '2000010001' && (invoiceTypeId != 4000010030 && invoiceTypeId != 4000010047 && invoiceTypeId != 4000010010 && invoiceTypeId != 4000010900)) {
                    if (!obj.value) {
                        errorList.push({
                            errorPath: 'data.error.invoiceNumber', message: '请填写发票号码'
                        })
                        ishasError = true
                    } else {
                        errorList.push({
                            errorPath: 'data.error.invoiceNumber', message: undefined
                        })
                    }
                }
            } else if (obj.path == 'data.form.invoiceCode') {
                if (!authenticated && vatTaxpayer == '2000010001' && (invoiceTypeId != 4000010030 && invoiceTypeId != 4000010047 && invoiceTypeId != 4000010010 && invoiceTypeId != 4000010900)) {
                    if (!obj.value) {
                        errorList.push({
                            errorPath: 'data.error.invoiceCode', message: '请填写发票代码'
                        })
                        ishasError = true
                    } else {
                        errorList.push({
                            errorPath: 'data.error.invoiceCode', message: undefined
                        })
                    }
                }
            }
        }

        return { errorList, ishasError }
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
            const objRet = await this.handleComCheck(checkArr, errorList, ishasError)
            errorList = objRet.errorList ? objRet.errorList : errorList
            ishasError = objRet.ishasError != undefined ? objRet.ishasError : ishasError

            if (form.invoiceNumber && (form.invoiceNumber.length != 8) && (form.invoiceTypeId != 4000010040)) {
                errorList.push({
                    errorPath: 'data.error.invoiceNumber', message: '发票号码位数错误'
                })
                ishasError = true
            }

            if (form.invoiceCode && form.invoiceCode.length != 10 && form.invoiceCode.length != 12 && (form.invoiceTypeId != 4000010040)) {
                errorList.push({
                    errorPath: 'data.error.invoiceCode', message: '发票代码位数错误'
                })
                ishasError = true
            }

            if (form.settles && form.settles.length != 0) {
                form.settles = form.settles.filter((item) => {
                    return item.bankAccountId || item.amount
                })
                for (let i = 0; i < form.settles.length; i++) {
                    if (!form.settles[i].bankAccountId && Number(form.settles[i].amount)) {
                        errorList.push({
                            errorPath: `data.error.${i}.bankAccount`, message: '请选择结算方式'
                        })
                        ishasError = true
                    }

                    if (form.settles[i].bankAccountId && !Number(form.settles[i].amount)) {
                        errorList.push({
                            errorPath: `data.error.${i}.amount`, message: '请输入结算金额'
                        })
                        ishasError = true
                    }

                    if (!form.settles[i].bankAccountId && form.settles[i].amount == 0) {
                        errorList.push({
                            errorPath: `data.error.${i}.amount`, message: '结算金额不能为零'
                        })
                        ishasError = true
                    }
                }
            }
        } else {

            const objRet = await this.handleComCheck(checkArr, errorList, ishasError)
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

    checkForSave = async () => {
        let form = this.metaAction.gf('data.form').toJS(),
            chargeAmount = this.metaAction.gf('data.other.chargeAmount'),
            isDisableBank = this.metaAction.gf('data.other.isDisableBank'),
            taxInclusiveAmount = this.metaAction.gf('data.other.taxInclusiveAmount'),
            payAmount = this.metaAction.gf('data.other.payAmount'),
            other = this.metaAction.gf('data.other').toJS()

        let isPassCheck = await this.handleCheck([{
            path: 'data.form.supplierId', value: form.supplierId
        }, {
            path: 'data.form.businessDate', value: form.businessDate
        }, {
            path: 'data.form.invoiceTypeId', value: form.invoiceTypeId
        }, {
            path: 'data.form.authenticatedMonth', value: form.authenticatedMonth
        }, {
            path: 'data.form.invoiceNumber', value: form.invoiceNumber
        }, {
            path: 'data.form.invoiceCode', value: form.invoiceCode
        }], form, 'save')

        // if (isPassCheck) {
        //     return false
        // }

        let msg = this.voucherAction.checkSaveInvoice(form, 'pu', other)
        if (msg.length > 0) {
            // this.voucherAction.showMsg(msg)
            this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
            return false
        }

        let otherErrorMsg = this.voucherAction.checkSaveOtherInvoice(form)
        if (otherErrorMsg.length > 0) {

            this.metaAction.toast('error', this.getDisplayErrorMSg(otherErrorMsg))
            return false
        }
        if (taxInclusiveAmount * payAmount < 0) {
            this.metaAction.toast('error', '结算金额和明细金额正负不一致')
            return false
        }

        // if (Number(chargeAmount) < 0 && !isDisableBank) { //当不是退货 剩余金额小于0时
        //     this.metaAction.toast('error', '结算金额不能大于价税合计金额')
        //     return false
        // }
        taxInclusiveAmount = this.voucherAction.sumColumn('taxInclusiveAmount')
        if (payAmount > taxInclusiveAmount && taxInclusiveAmount > 0 && payAmount > 0) {
            this.metaAction.toast('error', '结算金额不能大于价税合计金额')
            return false
        }

        if (payAmount < taxInclusiveAmount && taxInclusiveAmount < 0 && payAmount < 0) {
            this.metaAction.toast('error', '结算金额不能小于价税合计金额')
            return false
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

    cancel = () => {
        this.injections.reduce('init')
    }

    onFieldChangePro = (field, storeField, rowIndex, rowData, label) => (id) => {
        if (storeField == 'data.other.properties') {
            field = {
                propertyId: `data.form.details.${rowIndex}.propertyId`,
                propertyName: `data.form.details.${rowIndex}.propertyName`,
            }
        }
        if (!field || !storeField) return
        label = label || 'id'
        let value = this.metaAction.gf(storeField).find(o => o.get(label) == id),
            formId = this.metaAction.gf('data.form.id')
        let sfObj = {}

        if (value) {
            Object.keys(field).forEach(key => {
                sfObj[field[key]] = value.get(key)
            })

            // if (value.get('propertyId') == 4001001 && rowData.inventoryId) {
            // 切换成费用时也不清空
            // if (value.get('propertyId') == 4001001 && rowData.inventoryId && !formId) {
            //     sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
            //     sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
            //     sfObj[`data.form.details.${rowIndex}.inventoryCode`] = null
            //     sfObj[`data.form.details.${rowIndex}.taxRate`] = null
            //     sfObj[`data.form.details.${rowIndex}.taxRateId`] = null
            //     sfObj[`data.form.details.${rowIndex}.taxRateName`] = null
            // }
            if (value.get('propertyId') == 4001001 && rowData.inventoryId && !formId) {
                sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
                sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
                sfObj[`data.form.details.${rowIndex}.inventoryCode`] = null
                sfObj[`data.form.details.${rowIndex}.taxRate`] = null
                sfObj[`data.form.details.${rowIndex}.taxRateId`] = null
                sfObj[`data.form.details.${rowIndex}.taxRateName`] = null
            } else if (value.get('propertyId') == 4001001 && formId) {
                sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
                sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
                sfObj[`data.form.details.${rowIndex}.inventoryCode`] = null
            }

            if (storeField == 'data.other.properties') {
                const inventorys = this.metaAction.gf('data.other.inventorys').toJS()
                const filterInventory = inventorys.filter(o => o.propertyId == value.get('propertyId'))

                sfObj['data.other.inventory'] = fromJS(filterInventory)
                sfObj[`data.error.${rowIndex}.propertyName`] = undefined
            }
        } else {
            Object.keys(field).forEach(key => {
                sfObj[field[key]] = null
            })
        }


        sfObj['data.other.auditVisible'] = false
        this.editCloseTips(true)
        this.metaAction.sfs(sfObj)

        let details = this.metaAction.gf('data.form.details').toJS()
        if (details.length - 1 == rowIndex) {
            details.push(blankDetail)
            // sfObj['data.form.details'] = fromJS(details)
            this.metaAction.sf('data.form.details', fromJS(details))
        }
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

    renderInventoryName = (value, name, nameValue) => {
        // if(name == "data.other.supplier") {
        //     if(value && value != 'undefined') return value
        //     if(value == 'undefined' && nameValue != 'undefined') {
        //         return nameValue
        //     }
        // }
        // return nameValue;
        const inventory = this.metaAction.gf(name) && this.metaAction.gf(name).toJS()
        const accountStatus = this.metaAction.gf('data.other.accountStatus')
        if (accountStatus == 4000140002 && value) {
            return nameValue
        } else {
            //let isHave = false
            if (!value) {
                return nameValue
            } else {
                if (inventory && inventory.length) {
                    let obj = inventory.find(obj => obj.id == value);
                    if (obj) {
                        return value
                    }
                    // inventory.find(obj => {
                    //     if (obj.id == value) {
                    //         isHave = true
                    //         return true
                    //     } else {
                    //         isHave = false
                    //         return false
                    //     }
                    // })
                }
                return undefined
                // if (isHave) {
                //     return value
                // } else {
                //     return undefined
                // }
            }
        }
    }
    onFieldChange = (field, storeField, rowIndex, rowData, index, type, paramsObj, id) => {
        if (storeField == "data.other.accounts") {
            let details = this.metaAction.gf('data.form.details').toJS()
            let newinventoryCode = details[rowIndex].inventoryCode
            for (var i = 0; i < details.length; i++) {
                if (i != rowIndex) {
                    if (details[i].inventoryCode == newinventoryCode && newinventoryCode != undefined && details[i].inventoryCode != undefined) {
                        this.newonFieldChange(null, "data.other.accounts", i, 'data.form.details[_rowIndex]', null, null, null, id)
                    }
                }
            }
        }
        switch (storeField) {
            case 'data.other.inventory':
                if (!field) {
                    field = {
                        id: `data.form.details.${rowIndex}.inventoryId`,
                        name: `data.form.details.${rowIndex}.inventoryName`,
                        code: `data.form.details.${rowIndex}.inventoryCode`,
                        unitId: `data.form.details.${rowIndex}.unitId`,
                        unitName: `data.form.details.${rowIndex}.unitName`,
                        revenueType: `data.form.details.${rowIndex}.revenueType`,
                        revenueTypeName: `data.form.details.${rowIndex}.revenueTypeName`,
                        accountId: `data.form.details.${rowIndex}.inventoryRelatedAccountId`,
                        accountName: `data.form.details.${rowIndex}.inventoryRelatedAccountName`,
                        inventoryType: `data.form.details.${rowIndex}.inventoryType`,
                        inventoryTypeName: `data.form.details.${rowIndex}.inventoryTypeName`,
                        taxRateType: `data.form.details.${rowIndex}.taxRateType`,
                        taxRateTypeName: `data.form.details.${rowIndex}.taxRateTypeName`,
                        propertyId: `data.form.details.${rowIndex}.propertyId`,
                        propertyName: `data.form.details.${rowIndex}.propertyName`,
                        propertyDetailName: `data.form.details.${rowIndex}.propertyDetailName`,
                        specification: `data.form.details.${rowIndex}.specification`,
                    }
                }
                break
            case "data.other.inventoryTypes":
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
            case 'data.other.accounts':
                field = {
                    id: `data.form.details.${rowIndex}.inventoryRelatedAccountId`,
                    name: `data.form.details.${rowIndex}.inventoryRelatedAccountName`,
                }
                break
            case "data.other.taxRateTypes":
                if (rowData.taxRate || rowData.taxRate == 0) {
                    storeField = "data.other.taxRateTypes"
                }
                else {
                    storeField = "data.other.taxRateType"
                }
                break

        }

        if (!field || !storeField) return

        let sfObj = {}
        let value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
        let invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
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
                sfObj[`data.error.${index}.bankAccount`] = undefined
            } else {
                let settles = this.metaAction.gf('data.form.settles')
                settles = settles ? settles.toJS() : []

                settles[index].bankAccountId = null
                settles[index].bankAccountName = null

                sfObj['data.form.settles'] = fromJS(settles)
            }
        }
        if (value) {
            if (storeField == 'data.other.inventory') { //当改变存货名称或编码时以下数据也要发生更改
                field.id = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryId` : `data.form.details.${rowIndex}.businessTypeId`
                field.name = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryName` : `data.form.details.${rowIndex}.businessTypeName`
                field.code = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryCode` : `data.form.details.${rowIndex}.businessTypeCode`
                if (!value.get('isInventory')) {
                    this.metaAction.sfs({
                        [`data.form.details.${rowIndex}.inventoryId`]: null,
                        [`data.form.details.${rowIndex}.inventoryName`]: null,
                        [`data.form.details.${rowIndex}.inventoryCode`]: null,
                    })
                }

                // this.handleChangeInventory(field, sfObj, value, rowData, rowIndex)
                let formId = this.metaAction.gf('data.form.id')
                if (formId && (rowData.taxRate || rowData.taxRate == 0)) {
                    let fieldObj = {
                        id: field.id,
                        name: field.name,
                        code: field.code
                    }
                    if (value.get('isInventory')) {
                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.businessTypeId`]: null,
                            [`data.form.details.${rowIndex}.businessTypeName`]: null,
                            [`data.form.details.${rowIndex}.businessTypeCode`]: null
                        })
                    }
                    Object.keys(fieldObj).forEach(key => {
                        sfObj[fieldObj[key]] = value.get(key)
                    })
                } else {
                    this.handleChangeInventory(field, sfObj, value, rowData, rowIndex)
                }

            } else {
                Object.keys(field).forEach(key => {
                    sfObj[field[key]] = value.get(key)
                    this.handleCheck([{ path: field[key], value: value.get(key) }])
                })
            }
        } else {
            Object.keys(field).forEach(key => {
                if (storeField == 'data.other.inventory') {
                    sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
                    sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeId`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeName`] = null

                } else {
                    sfObj[field[key]] = null
                    this.handleCheck([{ path: field[key], value: null }])
                }
            })
        }

        //征收方式，认证抵扣判断
        const vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
        if (storeField == 'data.other.invoiceType') {

            if (id == 4000010030) { //农产品
                const details = this.metaAction.gf('data.form.details').toJS() || []
                details.forEach((item, index) => {
                    if (item.taxInclusiveAmount) {
                        this.voucherAction.calc('taxInclusiveAmount', index, item, { value: null }, true)
                    }
                })

                if (vatTaxpayer == '2000010001') {
                    this.metaAction.sfs({
                        'data.form.deductible': true,
                        'data.other.isShowAuth': false,
                        'data.other.deductabled': false,
                        'data.other.isShowDedu': true,
                        'data.error.invoiceNumber': undefined,
                        'data.error.invoiceCode': undefined,
                        'data.form.authenticated': false,
                        'data.form.authenticatedMonth': null
                    })
                } else {
                    sfObj['data.error.invoiceNumber'] = undefined
                    sfObj['data.error.invoiceCode'] = undefined
                }
            } else if (id == 4000010047) {
                if (vatTaxpayer == '2000010001') {
                    this.metaAction.sfs({
                        'data.form.deductible': true,//已抵扣
                        'data.other.isShowAuth': false,
                        'data.other.deductabled': false,
                        'data.other.isShowDedu': true,
                        'data.error.invoiceNumber': undefined,
                        'data.error.invoiceCode': undefined,
                        'data.form.authenticated': false,//未认证
                        'data.form.authenticatedMonth': null//认证月份
                    })
                } else {
                    sfObj['data.error.invoiceNumber'] = undefined
                    sfObj['data.error.invoiceCode'] = undefined
                }
            } else {

                if (invoiceTypeId == '4000010030') {
                    const details = this.metaAction.gf('data.form.details').toJS() || []
                    details.forEach((item, index) => {
                        if (item.amount) {
                            this.voucherAction.calc('amount', index, item, { value: null }, false)
                        }
                    })
                }
                if (id == 4000010020 || id == 4000010040 || id == 4000010045 || id == 4000010025) {//专用，海关，通行费,机动车
                    if (vatTaxpayer == '2000010001') {
                        this.metaAction.sfs({
                            'data.form.deductible': true,
                            'data.other.isShowAuth': true,
                            'data.other.isShowDedu': true,
                            'data.form.authenticated': true,
                            'data.other.authMonthabled': false,
                            'data.other.deductabled': false,
                            'data.error.invoiceNumber': undefined,
                            'data.error.invoiceCode': undefined
                        })
                    }
                } else {

                    if (vatTaxpayer == '2000010001') {
                        this.metaAction.sfs({
                            'data.other.isShowDedu': false,
                            'data.other.isShowAuth': false,
                            'data.form.authenticated': false,
                            'data.form.deductible': true,
                            'data.other.authMonthabled': false,
                            'data.other.deductabled': false,
                            'data.error.invoiceNumber': undefined,
                            'data.error.invoiceCode': undefined,
                            'data.form.authenticatedMonth': null
                        })
                    } else {
                        sfObj['data.error.invoiceNumber'] = undefined
                        sfObj['data.error.invoiceCode'] = undefined
                    }
                }

                const businessDate = this.metaAction.gf("data.form.businessDate")
                const authenticated = this.metaAction.gf('data.form.authenticated')
                if (businessDate && authenticated) {
                    const value = businessDate && businessDate.slice(0, 7)
                    let authenticatedMonth = this.metaAction.gf('data.form.authenticatedMonth')
                    if (authenticatedMonth == undefined) {
                        sfObj['data.form.authenticatedMonth'] = value
                    }
                }
            }
        }

        this.editCloseTips(true)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)
    }

    newonFieldChange = (field, storeField, rowIndex, rowData, index, type, paramsObj, id) => {
        switch (storeField) {
            case 'data.other.accounts':
                field = {
                    id: `data.form.details.${rowIndex}.inventoryRelatedAccountId`,
                    name: `data.form.details.${rowIndex}.inventoryRelatedAccountName`,
                }
                break
        }

        if (!field || !storeField) return

        let sfObj = {}
        let value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
        let invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')

        if (value) {
            if (storeField == 'data.other.inventory') { //当改变存货名称或编码时以下数据也要发生更改
                field.id = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryId` : `data.form.details.${rowIndex}.businessTypeId`
                field.name = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryName` : `data.form.details.${rowIndex}.businessTypeName`
                field.code = value.get('isInventory') ? `data.form.details.${rowIndex}.inventoryCode` : `data.form.details.${rowIndex}.businessTypeCode`
                if (!value.get('isInventory')) {
                    this.metaAction.sfs({
                        [`data.form.details.${rowIndex}.inventoryId`]: null,
                        [`data.form.details.${rowIndex}.inventoryName`]: null,
                        [`data.form.details.${rowIndex}.inventoryCode`]: null,
                    })
                }

                this.handleChangeInventory(field, sfObj, value, rowData, rowIndex)
            } else {
                Object.keys(field).forEach(key => {
                    sfObj[field[key]] = value.get(key)
                    this.handleCheck([{ path: field[key], value: value.get(key) }])
                })
            }
        } else {
            Object.keys(field).forEach(key => {
                if (storeField == 'data.other.inventory') {
                    sfObj[`data.form.details.${rowIndex}.inventoryId`] = null
                    sfObj[`data.form.details.${rowIndex}.inventoryName`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeId`] = null
                    sfObj[`data.form.details.${rowIndex}.businessTypeName`] = null

                } else {
                    sfObj[field[key]] = null
                    this.handleCheck([{ path: field[key], value: null }])
                }
            })
        }

        //征收方式，认证抵扣判断
        this.editCloseTips(true)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)
    }

    //认证月份
    renderauthMonth = () => {
        const authenticatedMonth = this.metaAction.gf('data.form.authenticatedMonth')

        if (!authenticatedMonth) {
            const businessDate = this.metaAction.gf("data.form.businessDate")
            const authenticated = this.metaAction.gf('data.form.authenticated')
            if (businessDate && authenticated) {
                const value = businessDate && businessDate.slice(0, 7)
                return this.metaAction.stringToMoment(value && value)
            }
        } else {
            return this.metaAction.stringToMoment(authenticatedMonth && authenticatedMonth)
        }
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

    editCloseTips = (istip) => {
        this.isEditing = istip
    }

    filterOptionSubject = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
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
        }

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`),
            value = option.props.value
        // let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        let paramsValue = paramsValues.find(item => item.get('id') == (option.key))

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
            || (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1)
    }

    //计算
    calc = (col, rowIndex, rowData, params) => (v) => {

        let sfObj = {}
        if (col == 'quantity' || col == 'price' || col == 'amount' || col == 'tax' || col == 'taxInclusiveAmount') {
            // if (v && Number(v) > 9999999999.99) {
            //     v = 9999999999.99
            // }

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
        //以下两个if 是为了区分 是否修改了价税合计 
        // 修改了价税合计之后在修改税率 算法是不一样的
        // if (col === 'taxInclusiveAmount') {
        //     this.opertionTaxAmount = true
        //     this.oldIndex = rowIndex
        // }
        // if (col === 'taxRateName' && rowIndex == this.oldIndex && this.opertionTaxAmount) {
        //     params = Object.assign(params, {
        //         hasChangeTaxAmount: true
        //     })
        // }
        if ((v == null || v == undefined) && col == 'taxRateName') {
            sfObj[`data.form.details.${rowIndex}.taxRateName`] = null
            sfObj[`data.form.details.${rowIndex}.taxRateId`] = null
            sfObj[`data.form.details.${rowIndex}.taxRate`] = null
        } else {
            const invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
            const isNCPFP = invoiceTypeId == '4000010030' ? true : false

            this.voucherAction.calc(col, rowIndex, rowData, params, isNCPFP)

            // const details = this.metaAction.gf('data.form.details').toJS()
            // details.find((item) => { //为了判断是否为退货
            //     if (item.amount < 0 || item.quantity < 0 || item.quantity < 0 || item.taxInclusiveAmount < 0) {
            //         sfObj['data.other.isDisableBank'] = true 
            //         return true
            //     } else {
            //         sfObj['data.other.isDisableBank'] = false 
            //         return false
            //     }
            // })

            if (col == 'taxRateName') {
                this.renderTaxRateTypesSelect(rowIndex, rowData, true)
            }
        }

        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)

        //有差额税发票时，修改单价，数量，金额，税录
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
                    if (details[i].amount != undefined && details[i].taxRateName != undefined && i == rowIndex) {
                        let newTax = ((details[rowIndex].amount - deductionAmount) * (details[rowIndex].taxRateName.replace("%", "") / 100)).toFixed(2)
                        let newTaxInclusiveAmount = (details[rowIndex].amount + Number(newTax))

                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.tax`]: newTax,
                            [`data.form.details.${rowIndex}.taxInclusiveAmount`]: newTaxInclusiveAmount
                        })
                    } else {
                        if (details[i].amount != undefined && details[i].taxRateName != undefined) {
                            return
                        }
                    }
                }
            }
        }

        //有差额税发票时，修改税额
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

                    if (details[i].amount != undefined && details[i].taxRateName != undefined && i == rowIndex) {
                        let newAmount = Number((details[rowIndex].tax / (details[rowIndex].taxRateName.replace("%", "") / 100)).toFixed(2)) + Number(deductionAmount)
                        let newPrice = (newAmount / Number(details[rowIndex].quantity)).toFixed(6)
                        let newTaxInclusiveAmount = (newAmount + Number(details[rowIndex].tax))
                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.amount`]: newAmount,
                            [`data.form.details.${rowIndex}.price`]: newPrice,
                            [`data.form.details.${rowIndex}.taxInclusiveAmount`]: newTaxInclusiveAmount
                        })
                    } else {
                        if (details[i].amount != undefined && details[i].taxRateName != undefined) {
                            return
                        }
                    }
                }
            }
        }

        //有差额税发票时，修改价税合计
        //先求金额， 新金额 = （加税合计+差额*税率） /1+税率
        //再求税额 税额 = （新金额 - 差额 ）* 税率
        //再求单价 税额 = 新金额 / 数量
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
                    if (details[i].amount != undefined && details[i].taxRateName != undefined && i == rowIndex) {
                        let newAmount = (details[rowIndex].taxInclusiveAmount + Number(deductionAmount * (details[rowIndex].taxRateName.replace("%", "") / 100))) / (1 + Number(details[0].taxRateName.replace("%", "") / 100))
                        let newTax = (newAmount - deductionAmount) * (details[rowIndex].taxRateName.replace("%", "") / 100)
                        let newPrice = (newAmount / Number(details[rowIndex].quantity)).toFixed(6)

                        this.metaAction.sfs({
                            [`data.form.details.${rowIndex}.amount`]: newAmount,
                            [`data.form.details.${rowIndex}.price`]: newPrice,
                            [`data.form.details.${rowIndex}.tax`]: newTax
                        })
                    } else {
                        if (details[i].amount != undefined && details[i].taxRateName != undefined) {
                            return
                        }
                    }
                }
            }
        }
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


    //计算剩余金额
    calcBalance = (data) => {
        const taxInclusiveAmount = this.voucherAction.sum(data.form.details, (a, b) => a + b.taxInclusiveAmount)
        let paymentAmount = this.metaAction.gf('data.form.paymentAmount')
        paymentAmount = utils.number.round(paymentAmount, 2) || 0
        let payAmount = 0,
            settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []

        settles.forEach((item, index) => {
            payAmount = Number(payAmount) + Number(item.amount)
        })

        const chargeAmount = this.voucherAction.numberFormat(taxInclusiveAmount - payAmount, 2)
        this.metaAction.sfs({
            'data.other.chargeAmount': chargeAmount,
            'data.other.taxInclusiveAmount': taxInclusiveAmount,
            'data.other.payAmount': payAmount,
        })
        return chargeAmount
    }

    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity) {
            return this.voucherAction.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }

    isRowOperation = () => {
        return this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED
    }

    getColumnVisible = (params) => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'), visible = false
        columnSetting = columnSetting && columnSetting.toJS()

        if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
            columnSetting.body.tables.forEach((item) => {
                if (item.details.length != 0) {
                    if (item.details.filter(o => o.fieldName == params).length == 0) return false
                    visible = item.details.filter(o => o.fieldName == params).length != 0 ? item.details.filter(o => o.fieldName == params)[0].isVisible : false
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
                    if (item.details.filter(o => o.fieldName == params).length == 0) return false
                    caption = item.details.filter(o => o.fieldName == params)[0].caption
                }
            })
        }
        return caption
    }

    // 切换征收方式
    settlementChange = (value) => {
        //let signAndRetreatCheck = this.metaAction.gf('data.other.signAndRetreatCheck')
        this.metaAction.sfs({
            //'data.other.signAndRetreatCheck': !signAndRetreatCheck,
            'data.form.signAndRetreat': value,
            'data.other.auditVisible': false
        })
        this.editCloseTips(true)
    }

    //抵扣 不给予抵扣
    deductibleChange = () => {
        let deductible = this.metaAction.gf('data.form.deductible')
        this.metaAction.sfs({
            'data.form.deductible': !deductible,
            'data.other.auditVisible': false
        })
        this.editCloseTips(true)
    }

    // 勾选认证
    authenticationChange = () => {
        const voucherSource = this.metaAction.gf('data.form.voucherSource')
        if (voucherSource == 4000090002) return
        const authenticated = this.metaAction.gf('data.form.authenticated')

        let sfObj = {}
        if (!authenticated) {
            const businessDate = this.metaAction.gf('data.form.businessDate')
            if (businessDate) {
                sfObj['data.form.authenticatedMonth'] = businessDate.slice(0, 7)
            }
            sfObj['data.other.authMonthabled'] = false
            sfObj['data.other.deductabled'] = false
            sfObj['data.form.deductible'] = true
            sfObj['data.error.invoiceCode'] = undefined
            sfObj['data.error.invoiceNumber'] = undefined
        } else {
            sfObj['data.other.authMonthabled'] = true
            sfObj['data.other.deductabled'] = true
            sfObj['data.form.deductible'] = undefined
            sfObj['data.form.authenticatedMonth'] = null
        }

        sfObj['data.form.authenticated'] = !authenticated
        sfObj['data.other.auditVisible'] = false

        this.metaAction.sfs(sfObj)
        this.editCloseTips(true)
    }

    //认证还是比对
    rendeRauthentication = () => {
        let authenticated = '认证',
            invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
        if (invoiceTypeId) {
            if (invoiceTypeId == consts.consts.INVOICETYPE_specialVATInvoice) {
                authenticated = '认证'
            } else if (invoiceTypeId == consts.consts.INVOICETYPE_hgjkzzszyjks) {
                authenticated = '比对'
            }
        }
        return authenticated
    }

    //点击增加 结算方式
    addPaymentAmount = () => {
        if (this.getDisable()) {
            return
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
        this.editCloseTips(true)
    }

    //点击删除 结算方式金额
    delPaymentAmount = (index) => {
        if (this.getDisable()) {
            return
        }
        let settles = this.metaAction.gf('data.form.settles')
        settles = settles ? settles.toJS() : []
        let error = this.metaAction.gf('data.error').toJS()
        if (settles.length != 1) {
            settles.splice(index, 1)
            for (let item in error) {
                if (typeof error[item] == 'object') {
                    if (item >= index) {
                        if (error[item].amount) error[item].amount = undefined
                        if (error[item].bankAccount) error[item].bankAccount = undefined
                    }
                }
            }

            this.metaAction.sfs({
                'data.form.settles': fromJS(settles),
                'data.other.auditVisible': false,
                'data.error': fromJS(error)
            })

        }

        this.editCloseTips(true)
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
        const status = data.consts.VOUCHERSTATUS_Approved
        if (status == data.form.status) {
            return false
        } else {
            this.voucherAction.delFile(index, 'vouchers', this.updateEnclosure)
        }
    }

    updateEnclosure = async (res) => {
        res.ts = ''
        const result = await this.webapi.arrival.updateEnclosure(res)
        return result
    }

    attachmentChange = (info) => {
        const isLt10M = this.metaAction.gf('data.other.isLt10M')
        if (isLt10M) {
            return
        }
        this.voucherAction.attachmentChange(info, 'vouchers', this.updateEnclosure)
    }

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

    getDisable = () => {
        let pageStatus = this.metaAction.gf('data.other.pageStatus')
        let disabled = pageStatus == common.commonConst.PAGE_STATUS.READ_ONLY
        const accountStatus = this.metaAction.gf('data.other.accountStatus')
        let status = this.metaAction.gf('data.form.status')
        if (accountStatus == 4000140002) {
            return true
        }
        if (status == 1000020003) {
            return false
        }
        if (status == 1000020001) {
            //未审核
            return false
        }
        if (status == 1000020002) {
            return true
        }
        return disabled
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
    handleSelect = (params, isCodeSeach) => {
        params = params && params.toJS()
        if (params) {
            return params.map((item, index) => {
                return isCodeSeach ? <Option key={item && item.id} title={item && item.name} >{item && `${item.code} ${item.name}`}</Option> :
                    <Option key={item && item.id} title={item && item.name}>{item && item.name}</Option>
            })
        }
    }

    addArchive = async (fieldName, index, rowData) => {
        switch (fieldName) {
            case 'supplier':
                await this.voucherAction.addSupplier(`data.other.${fieldName}s`)
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
                const isInventory = rowData.propertyId == '4001001' || rowData.propertyName == '费用'
                let inventory = [], inventorys = [], inventoryItem = null
                let sfObj = {}, vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
                if (isInventory) {
                    let result = await this.metaAction.modal('show', {
                        title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
                        width: 400,
                        height: 500,
                        footer: '',
                        children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                            store: this.component.props.store,
                            columnCode: "common",
                            incomeexpensesTabId: '4001001'
                        }),
                    })
                    if (typeof result == 'object') {
                        result.propertyId = 4001001
                        result.propertyName = '费用'
                        inventoryItem = result
                    }
                } else {
                    const inventoryItemOld = this.metaAction.gf('data.other.inventoryItem') && this.metaAction.gf('data.other.inventoryItem').toJS()
                    inventoryItem = await this.voucherAction.addInventory('data.other.inventoryItem', 'get')

                    if (inventoryItemOld && inventoryItemOld.id == inventoryItem.id) { // 若是取消状态
                        inventoryItem = null
                    }
                }

                inventory = this.metaAction.gf('data.other.inventory') && this.metaAction.gf('data.other.inventory').toJS() || []
                inventorys = this.metaAction.gf('data.other.inventorys') && this.metaAction.gf('data.other.inventorys').toJS() || []
                if (inventoryItem) {

                    inventoryItem.isInventory = isInventory ? false : true
                    let list = inventorys.filter(o => (o.propertyId == inventoryItem.propertyId || o.propertyName == inventoryItem.propertyName))
                    inventoryItem = this.getFullName([inventoryItem])
                    list.push(inventoryItem[0])
                    inventorys.push(inventoryItem[0])

                    let field = {
                        id: isInventory ? `data.form.details.${index}.businessTypeId` : `data.form.details.${index}.inventoryId`,
                        name: isInventory ? `data.form.details.${index}.businessTypeName` : `data.form.details.${index}.inventoryName`,
                        code: isInventory ? `data.form.details.${index}.businessTypeCode` : `data.form.details.${index}.inventoryCode`,
                        specification: `data.form.details.${index}.specification`,
                        unitId: `data.form.details.${index}.unitId`,
                        unitName: `data.form.details.${index}.unitName`,
                        taxRateId: `data.form.details.${index}.rate`,
                        rateName: `data.form.details.${index}.taxRateName`,
                        inventoryType: `data.form.details.${index}.inventoryType`,
                        inventoryTypeName: `data.form.details.${index}.inventoryTypeName`,
                        taxRateType: `data.form.details.${index}.taxRateType`,
                        taxRateTypeName: `data.form.details.${index}.taxRateTypeName`,
                        propertyId: `data.form.details.${index}.propertyId`,
                        propertyName: `data.form.details.${index}.propertyName`
                    }
                    const value = fromJS(inventoryItem[0])
                    // this.handleChangeInventory(field, sfObj, value, rowData, index, vatTaxpayer)
                    let formId = this.metaAction.gf('data.form.id')
                    if (formId && (rowData.taxRate || rowData.taxRate == 0)) {
                        let fieldObj = {
                            id: field.id,
                            name: field.name,
                            code: field.code,
                            propertyId: field.propertyId,
                            propertyName: field.propertyName,
                        }
                        if (value.get('isInventory')) {
                            this.metaAction.sfs({
                                [`data.form.details.${index}.businessTypeId`]: null,
                                [`data.form.details.${index}.businessTypeName`]: null,
                                [`data.form.details.${index}.businessTypeCode`]: null
                            })
                        }

                        Object.keys(fieldObj).forEach(key => {
                            sfObj[fieldObj[key]] = value.get(key)
                        })
                    } else {
                        this.handleChangeInventory(field, sfObj, value, rowData, index, vatTaxpayer)

                    }

                    sfObj['data.other.inventory'] = fromJS(list)
                    sfObj[`data.other.inventorys`] = fromJS(inventorys)

                    sfObj['data.other.auditVisible'] = false
                    this.metaAction.sfs(sfObj)
                }
                break;
            default:
                break;
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
            option.fullNameArr && option.fullNameArr.map((item, index) => {
                return <span className={`fullname${index}`}>{item}</span>
            })
        }</div>
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
            sfObj[`data.error.${fieldName}`] = undefined

            sfObj['data.other.auditVisible'] = false
            this.metaAction.sfs(sfObj)
        }
    }

    //新增档案
    /*addRecordClick = async (add, params, index, rowData) => {
        let sfObj = {}, vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
        if (params == 'inventory') {
            const isInventory = rowData.propertyId == '4001001' || rowData.propertyName == '费用'
            let inventory = [], inventorys = [], inventoryItem = null

            if (isInventory) {
                let result = await this.metaAction.modal('show', {
                    title: <div style={{ fontSize: '16px', fontWeight: '500' }}>新增费用类型</div>,
                    width: 400,
                    height: 500,
                    footer: '',
                    children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                        store: this.component.props.store,
                        columnCode: "common",
                        incomeexpensesTabId: '4001001'
                    }),
                })
                if (typeof result == 'object') {
                    result.propertyId = 4001001
                    result.propertyName = '费用'
                    inventoryItem = result
                }
            } else {
                const inventoryItemOld = this.metaAction.gf('data.other.inventoryItem') && this.metaAction.gf('data.other.inventoryItem').toJS()
                inventoryItem = await this.voucherAction[add]('data.other.inventoryItem', 'get')
                // inventoryItem = this.metaAction.gf('data.other.inventoryItem') && this.metaAction.gf('data.other.inventoryItem').toJS()
                
                if (inventoryItemOld && inventoryItemOld.id == inventoryItem.id) { // 若是取消状态
                    inventoryItem = null
                }
            }

            inventory = this.metaAction.gf('data.other.inventory') && this.metaAction.gf('data.other.inventory').toJS() || []
            inventorys = this.metaAction.gf('data.other.inventorys') && this.metaAction.gf('data.other.inventorys').toJS() || []
            if (inventoryItem) {

                inventoryItem.isInventory = isInventory ? false : true
                let list = inventorys.filter(o => (o.propertyId == inventoryItem.propertyId || o.propertyName == inventoryItem.propertyName))
                list.push(inventoryItem)
                inventorys.push(inventoryItem)

                let field = {
                    id: `data.form.details.${index}.inventoryId`,
                    name: `data.form.details.${index}.inventoryName`,
                    code: `data.form.details.${index}.inventoryCode`,
                    specification: `data.form.details.${index}.specification`,
                    unitId: `data.form.details.${index}.unitId`,
                    unitName: `data.form.details.${index}.unitName`,
                    taxRateId: `data.form.details.${index}.rate`,
                    rateName: `data.form.details.${index}.taxRateName`,
                    inventoryType: `data.form.details.${index}.inventoryType`,
                    inventoryTypeName: `data.form.details.${index}.inventoryTypeName`,
                    taxRateType: `data.form.details.${index}.taxRateType`,
                    taxRateTypeName: `data.form.details.${index}.taxRateTypeName`,
                    propertyId: `data.form.details.${index}.propertyId`,
                    propertyName: `data.form.details.${index}.propertyName`
                }
                const value = fromJS(inventoryItem)
                this.handleChangeInventory(field,sfObj,value,rowData,index,vatTaxpayer)
                sfObj['data.other.inventory'] = fromJS(list)
                sfObj[`data.other.inventorys`] = fromJS(inventorys)
            }
        } else {
            await this.voucherAction[add](`data.other.${params}s`)
            const res = this.metaAction.gf(`data.other.${params}s`).toJS()
            const list = this.metaAction.gf(`data.other.${params}`).toJS()
            list.push(res)
            sfObj[`data.other.${params}`] = fromJS(list)
            sfObj[`data.form.${params}Id`] = res.id
            sfObj[`data.form.${params}Name`] = res.name
            sfObj[`data.error.${params}`] = undefined
        }

        this.editCloseTips(true)
        sfObj['data.other.auditVisible'] = false
        this.metaAction.sfs(sfObj)
    }

    //新增档案
    handleAddRecord = (paramsU, params, index, rowData) => {
        const add = `add${paramsU}`
        return <Button type='primary'
            style={{ width: '100%', borderRadius: '0' }}
            // onClick={() => this.voucherAction[add]({ id: `data.form.${params}Id`, name: `data.form.${params}Name`})}
            onClick={this.addRecordClick.bind(null, add, params, index, rowData)}
        >新增</Button>
    }*/

    handleChangeInventory = (field, sfObj, value, rowData, index, vatTaxpayer) => {
        const invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
        const isNCPFP = invoiceTypeId == '4000010030' ? true : false

        Object.keys(field).forEach(key => {
            sfObj[field[key]] = value.get(key)
        })
        let amount = utils.number.round(rowData.amount, 2),
            tax = utils.number.round(amount * value.get('taxRate'), 2),
            taxInclusiveAmount = utils.number.round(amount + tax, 2)

        if (isNCPFP) {
            taxInclusiveAmount = utils.number.round(amount / (1 - value.get('taxRate')), 2)
            tax = utils.number.round(taxInclusiveAmount - amount, 2)
        }

        const taxRateIds = value.get('taxRateId') || value.get('taxRateId') == 0 ? value.get('taxRateId') : value.get('rate')
        sfObj[`data.form.details.${index}.taxRateId`] = taxRateIds
        sfObj[`data.form.details.${index}.taxRateName`] = value.get('taxRateName') || value.get('rateName')
        sfObj[`data.form.details.${index}.taxRate`] = value.get('taxRate')
        sfObj[`data.form.details.${index}.tax`] = tax
        sfObj[`data.form.details.${index}.taxInclusiveAmount`] = taxInclusiveAmount
        sfObj[`data.error.${index}.inventory`] = undefined
        sfObj[`data.error.${index}.propertyName`] = undefined
    }

    ///控制显示
    handleVisible = (params) => {
        // let columnSetting = this.metaAction.gf('data.other.columnSetting')
        // columnSetting = columnSetting && columnSetting.toJS()
        // if (columnSetting) {
        //     return !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == params)[0].isVisible
        // }
        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        if (columnSetting) {
            columnSetting = columnSetting && columnSetting.toJS()
            let isVisible = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == params)[0].isVisible
            return isVisible
        }
        return false
    }

    //单据日期控制
    handleDisabledDate = (current) => {
        // Can not select days before today and today
        if (current) {
            let beginDate = this.metaAction.gf('data.other.beginDate'), currentDate = current.format('YYYY-MM-DD')
            let invoiceDate = this.metaAction.gf('data.form.invoiceDate')

            beginDate = beginDate && beginDate.replace(/-/g, '')
            currentDate = currentDate && currentDate.replace(/-/g, '')

            // if (invoiceDate) {
            //     invoiceDate = invoiceDate.replace(/-/g, '')
            //     return (currentDate && currentDate < beginDate) || (currentDate && currentDate < invoiceDate)
            // } else {
            return currentDate && currentDate < beginDate
            // }
        }
    }

    //开票日期控制
    handleDisInvoiceDate = (current) => {
        if (current) {
            let beginDate = this.metaAction.gf('data.other.beginDate'), currentDate = current.format('YYYYMMDD')
            let businessDate = this.metaAction.gf('data.form.businessDate')

            beginDate = beginDate && beginDate.replace(/-/g, '')
            if (businessDate) {
                businessDate = businessDate.replace(/-/g, '')
                // return (currentDate && currentDate < beginDate) || (currentDate && currentDate > businessDate)
                return currentDate && currentDate > businessDate
            }
            // else {
            //     return currentDate && currentDate < beginDate
            // }
        }
    }

    //认证月份控制
    handleDisAuthMonthDate = (current) => {
        if (current) {
            let invoiceDate = this.metaAction.gf('data.form.invoiceDate'),
                currentDate = current.format('YYYYMM'),
                businessDate = this.metaAction.gf('data.form.businessDate'),
                beginDate = this.metaAction.gf('data.other.beginDate')

            beginDate = beginDate && beginDate.slice(0, 7).replace(/-/g, "")
            businessDate = businessDate && businessDate.slice(0, 7).replace(/-/g, "")
            invoiceDate = invoiceDate && invoiceDate.slice(0, 7).replace(/-/g, "")

            if (businessDate && invoiceDate) {
                return currentDate && currentDate < invoiceDate
            } else {
                if (businessDate) {
                    return currentDate && currentDate < businessDate
                } else if (invoiceDate) {
                    return currentDate && currentDate < invoiceDate
                } else {
                    return currentDate && currentDate < beginDate
                }
            }
        }
    }

    //认证月份
    autMonthChange = (d) => {
        this.editCloseTips(true)

        let sfObj = {}
        if (d) {
            sfObj['data.error.authenticatedMonth'] = undefined
        }
        sfObj['data.form.authenticatedMonth'] = this.metaAction.momentToString(d, 'YYYY-MM')
        sfObj['data.other.auditVisible'] = false

        this.metaAction.sfs(sfObj)
    }

    filterOptionArchives = (name, inputValue, option) => {
        const namePrmas = {
            currentPath: name
        }
        // inputValue = inputValue.replace(/\\/g, "\\\\")
        return this.filterOption(inputValue, option, namePrmas)
    }

    /*renderArchives = () => {
        let columnSetting = this.metaAction.gf('data.other.columnSetting'),
            departmentName = this.metaAction.gf('data.form.departmentId') ? this.metaAction.gf('data.form.departmentId') : undefined,
            purchasePersonName = this.metaAction.gf('data.form.purchasePersonName') ? this.metaAction.gf('data.form.purchasePersonName') : undefined,
            projectName = this.metaAction.gf('data.form.projectId') ? this.metaAction.gf('data.form.projectId') : undefined,
            department = this.metaAction.gf('data.other.department') && this.metaAction.gf('data.other.department'),
            purchasePerson = this.metaAction.gf('data.other.purchasePerson') && this.metaAction.gf('data.other.purchasePerson'),
            project = this.metaAction.gf('data.other.project') && this.metaAction.gf('data.other.project'),
            form = this.metaAction.gf('data.form').toJS()

        columnSetting = columnSetting && columnSetting.toJS()
        // let aaa = !!columnSetting.header && columnSetting.header.cards.filter(o=> o.fieldName == item.name )[0].caption
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
                                allowClear={ item.value && String(item.value) ? true : false}
                                filterOption={this.filterOptionArchives.bind(null, item.name)}
                                placeholder='按名称/拼音/编码搜索'
                                disabled={this.getDisable()}
                                // value={item.value && String(item.value)}
                                value={this.renderInventoryName(String(item.value), `data.other.${item.name}`, form[`${item.name}Name`])}
                                onFocus={() => this.voucherAction[`get${item.upName}`]({entity:{isEnable:true}}, `data.other.${item.name}`)}
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
    }*/

    handleChange = (name, value) => {
        let obj = {
            'data.other.auditVisible': false
        }
        obj[name] = value

        if (name == "data.form.businessDate" && value) {
            obj['data.error.businessDate'] = undefined
        } else if (name == "data.form.invoiceCode") {
            obj['data.error.invoiceCode'] = undefined
        } else if (name == "data.form.invoiceNumber") {
            obj['data.error.invoiceNumber'] = undefined
        }

        if (name == "data.form.businessDate") {
            obj[`data.form.authenticatedMonth`] = value && value.slice(0, 7)

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
        this.metaAction.sfs(obj)
        this.editCloseTips(true)
    }

    handleInvioceRequire = (vatTaxpayer, authenticated, invoiceTypeId) => {
        if (vatTaxpayer == 2000010001 && (invoiceTypeId == 4000010020 || invoiceTypeId == 4000010040 || invoiceTypeId == 4000010045)) {
            if (!authenticated) {
                return true
            }
            return false
        }
    }

    //渲染表头
    /*renderFormContent = () => {
        const businessDate = this.metaAction.gf('data.form.businessDate'),
            invoiceTypeName = this.metaAction.gf('data.form.invoiceTypeName'),
            invoiceType = this.metaAction.gf('data.other.invoiceType'),
            supplierName = this.metaAction.gf('data.form.supplierName'),
            supplier = this.metaAction.gf('data.other.supplier'),
            invoiceCode = this.metaAction.gf('data.form.invoiceCode'),
            invoiceNumber = this.metaAction.gf('data.form.invoiceNumber'),
            invoiceDate = this.metaAction.gf('data.form.invoiceDate'),
            remark = this.metaAction.gf('data.form.remark'),
            error = this.metaAction.gf('data.error') && this.metaAction.gf('data.error').toJS(),
            vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')

        let form = this.metaAction.gf('data.form').toJS(), other = this.metaAction.gf('data.other').toJS()
        let columnSetting = this.metaAction.gf('data.other.columnSetting')
        columnSetting = columnSetting && columnSetting.toJS()
        let defaultContentArr = [
            <FormItem className="businessDate_container" label='单据日期' required={true} validateStatus={error.businessDate ? 'error' : 'success'}>
                <DatePicker
                    className="autoFocus_item"
                    allowClear={true}
                    autoFocus={true}
                    value={this.metaAction.stringToMoment(businessDate)}
                    getCalendarContainer={() => document.getElementsByClassName('businessDate_container')[0]}
                    onChange={(d) => this.handleChange("data.form.businessDate", this.metaAction.momentToString(d, 'YYYY-MM-DD'))}
                    disabled={this.getDisable()}
                    disabledDate={this.handleDisabledDate}
                >
                </DatePicker>
            </FormItem>,
            <FormItem label='发票类型' required={true} validateStatus={error.invoiceType ? 'error' : 'success'}>
                <Select
                    className="autoFocus_item"
                    // allowClear={true}
                    disabled={this.getDisable()}
                    // value={invoiceTypeName}
                    value={form.invoiceTypeId && String(form.invoiceTypeId)}
                    onFocus={() => this.voucherAction.getTaxRate({}, `data.other.invoiceType`)}
                    onChange={this.onFieldChange({ id: `data.form.invoiceTypeId`, name: `data.form.invoiceTypeName` }, `data.other.invoiceType`)}
                >
                    {this.handleSelect(invoiceType)}
                </Select>
                <Popover content='增值税专用发票，机动车销售发票，税局代开增值税发票归类到增值税专用发票中，农产品销售发票，统一收购发票归类到农产品销售发票中' placement='rightTop' overlayClassName='ttk-scm-app-sa-invoice-card-helpPopover'>
                    <Icon fontFamily='edficon' type='bangzhutishi' className='helpIcon'>
                    </Icon>
                </Popover>,
            </FormItem>,
            <FormItem label='销方名称' required={true} validateStatus={error.supplier ? 'error' : 'success'}>
                <Select
                    className="autoFocus_item"
                    showSearch={true}
                    // allowClear={true}
                    filterOption={this.filterOptionArchives.bind(null, 'supplier')}
                    placeholder='按名称/拼音/编码搜索'
                    disabled={this.getDisable()}
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ width: '225px' }}
                    // value={form.supplierId && String(form.supplierId)}
                    value={this.renderInventoryName(String(form.supplierId), `data.other.supplier`, form.supplierName)}
                    onFocus={() => this.voucherAction.getSupplier({ entity: { isEnable: true } }, `data.other.supplier`)}
                    dropdownFooter={this.handleAddRecord('Supplier', 'supplier')}
                    onChange={this.onFieldChange({ id: `data.form.supplierId`, name: `data.form.supplierName` }, `data.other.supplier`)}
                >
                    {this.handleSelect(supplier, true)}
                </Select>
            </FormItem>,
            // this.handleVisible('invoiceCode') ?
            // <FormItem label='发票代码' required={this.handleInvioceRequire(vatTaxpayer, form.authenticated, form.invoiceTypeId)} validateStatus={error.invoiceCode ? 'error' : 'success'}>
            <FormItem label='发票代码' validateStatus={error.invoiceCode ? 'error' : 'success'}>
                <Input
                    className="autoFocus_item"
                    value={invoiceCode}
                    maxLength={12}
                    onChange={(e) => this.handleChange("data.form.invoiceCode", e.target.value)}
                    timeout={true}
                    disabled={this.getDisable()}>
                </Input>
            </FormItem>,
            // this.handleVisible('invoiceNumber') ? 
            <FormItem label='发票号码' validateStatus={error.invoiceNumber ? 'error' : 'success'}>
                <Input
                    className="autoFocus_item"
                    value={invoiceNumber}
                    maxLength={8}
                    timeout={true}
                    onChange={(e) => this.handleChange("data.form.invoiceNumber", e.target.value)}
                    disabled={this.getDisable()}>
                </Input>
            </FormItem>
            ,
            // this.handleVisible('invoiceDate') ?
            <FormItem className="invoiceDate_container" label='开票日期'>
                <DatePicker
                    className="autoFocus_item"
                    getCalendarContainer={() => document.getElementsByClassName('invoiceDate_container')[0]}
                    value={this.metaAction.stringToMoment(invoiceDate)}
                    onChange={(d) => this.handleChange("data.form.invoiceDate", this.metaAction.momentToString(d, 'YYYY-MM-DD'))}
                    disabledDate={this.handleDisInvoiceDate}
                    disabled={this.getDisable()}>
                </DatePicker>
            </FormItem>
        ]

        if (this.renderArchives()) { //档案类
            const archives = this.renderArchives().filter(o => o)
            archives.forEach((item) => {
                defaultContentArr.push(item)
            })
        }

        if (this.handleVisible('remark')) {
            let caption = !!columnSetting.header && columnSetting.header.cards.filter(o => o.fieldName == 'remark')[0].caption
            defaultContentArr.push(
                <FormItem label={caption}
                    className='app-pu-invoice-card-form-header-remark'
                >
                    <Input
                        className="autoFocus_item"
                        value={remark}
                        timeout={true}
                        onChange={(e) => this.handleChange("data.form.remark", e.target.value)}
                        disabled={this.getDisable()}>
                    </Input>
                </FormItem>
            )
        }

        return defaultContentArr
    }*/

    handleKeyDown(e, index, className) {
        if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
            let dom = document.getElementsByClassName(className)[0]  //ReactDOM.findDOMNode(this.refs.auxItem)

            if (dom) {
                setTimeout(() => {
                    let nextFocusIndex = this.getNextFocusIndex(className)
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

    getNextFocusIndex(className) {
        let nextFocusIndex
        nextFocusIndex = $(document.activeElement).parents('.ant-row').index()
        const length = $(document.activeElement).parents('.ant-row').siblings().length

        nextFocusIndex++
        if (nextFocusIndex == length + 1) {
            let dom = document.getElementsByClassName(className)[0]
            if (dom) {
                let c = dom.children[nextFocusIndex - 1].children[1].getElementsByClassName('autoFocus_item')[0]
                if (c) {
                    c.blur()
                }
            }
            if (className = 'ttk-scm-app-pu-invoice-card-form-header') {
                setTimeout(() => {
                    this.metaAction.sf('data.other.focusFieldPath', 'root.children.content.children.details.columns.propertyName.cell.cell,0')
                    setTimeout(() => {
                        let a = $('.ttk-scm-app-pu-invoice-card-form-details').find('.ant-select-selection')
                        a.focus()
                        a.click()
                    }, 0)
                }, 16)
            }
        }
        return nextFocusIndex > length ? -1 : nextFocusIndex
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
