import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import renderColumns from './utils/renderColumns'
import config from './config'
import {Tree, Form, Select, Input} from 'edf-component'
import extend from './extend'
import { fromJS } from 'immutable'
import utils from 'edf-utils'
import TemporaryInventoryDetail from './utils/TemporaryInventoryDetail'

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
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
		}
        injections.reduce('init')
        this.load()
    }

	load = async () => {
        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //初始化 获取全局的启用日期
        let startDate = this.component.props.startDate, detailDate
        let enableTime = this.component.props.enableTime
        if(startDate){
            detailDate = utils.date.transformMomentDate(startDate) 
            this.injections.reduce('upDateStart', 'data.other.searchValue.startDate', detailDate)
        }else {
            let query = await this.webapi.inventoryDetail.queryenabletime()

            if (query == '0') {   // 未启用,获取开账时间
                const currentOrg = this.metaAction.context.get("currentOrg")
                const enabledPeriod = currentOrg.enabledYear + '-' + `${currentOrg.enabledMonth}`.padStart(2, '0') //'2018-01'
                const appNames = 'inventory'
                const ret = await this.metaAction.modal('show', {
                    title: '存货核算',
                    wrapClassName: 'inventory-card',
                    width: 490,
                    okText: '确定',
                    bodyStyle: { padding: '10px 35px' },
                    children: this.metaAction.loadApp('ttk-scm-app-inventory-card', {
                        store: this.component.props.store,
                        enabledPeriod,
                        tabEdit,
                        appNames
                    }),
                })
                if (ret) {
                    this.queryTime = ret.beginDate
                }
            } else {
                this.queryTime = query
            }

            let a = this.queryTime.replace('-', ''), b = periodDate.replace('-', '')
            if (a < b) {
                startDate = periodDate
            } else {
                startDate = this.queryTime
            }
        }
        
        const inventoryId = this.component.props.detailId  // 存货id
        const businessId = this.component.props.businessId  // 业务类型
        let filter = {
            beginAccountingYear: startDate && startDate.slice(0,4),
            beginAccountingPeriod: startDate && startDate.substring(5),
            endAccountingYear: startDate && startDate.slice(0,4),
            endAccountingPeriod: startDate && startDate.substring(5),
            inventoryId,
            businessTypeId: businessId,
            page:{
                currentPage: 1,
                pageSize: 20
            }
        }
        this.metaAction.sf('data.other.loading', true)
        let res = await this.webapi.inventoryDetail.initDetail(filter)
        this.metaAction.sf('data.other.loading', false)
        if(res){
            this.metaAction.sf('data.tableKey', Math.random())
            let enableTime = this.component.props.enableTime ? this.component.props.enableTime : res.setupDto.paramValue
     
            this.injections.reduce('load', {res, inventoryId, enableTime})
        }
        this.metaAction.sfs({
            'data.form.typeId': this.component.props.propertyId,
            'data.form.businessId': this.component.props.businessId,
            'data.other.searchValue.type': this.component.props.propertyId,
            'data.other.searchValue.business': this.component.props.businessId,
            'data.other.conds': this.component.props.inventoryName,
        })
        this.selectedOption = []
        setTimeout(() => {  
            this.onResize()              
        }, 20)
    }
    componentWillUnmount = () => {
        let removeEventListener = this.component.props.removeEventListener

        if (removeEventListener) {
            removeEventListener('onTabAdd')
        }
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                let dom = document.getElementsByClassName('ttk-scm-app-warehouseDetail-table')[0]
                if (!dom) {
                    setTimeout(() => {
                        this.onResize()
                    }, 20)
                } else {
                    let tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
                    let num = dom.offsetHeight - tableDom.offsetHeight
                    let tableOption = this.metaAction.gf('data.tableOption').toJS()
                    if (num < 45) {
                        const width = dom.offsetWidth
                        const height = dom.offsetHeight   
                        this.injections.reduce('setTableOption', { ...tableOption, y: height - 75, containerWidth: width - 100 })
                    } else {
                        delete tableOption.y
                        this.injections.reduce('updateOption', { path: 'data.tableOption', value: tableOption })
                    }
                                  
                }
            }
        }, 100)
    }

    onTabFocus = async(props) => {
        let query = await this.webapi.inventoryDetail.query()
        if(query == '0'){
            this.metaAction.toast(error, '存货核算未启用')
            return false
        }
        props = props.toJS()
        if(props && props.accessType) {
            this.metaAction.sfs({
                'data.other.inventoryId': fromJS(props.detailId),
                'data.other.conds': fromJS(props.inventoryName),
                'data.other.searchValue.type': fromJS(props.propertyId),
                'data.other.searchValue.business': fromJS(props.businessId),
                'data.form.typeId': fromJS(props.propertyId),
                'data.form.businessId': fromJS(props.businessId)
            })
            if(props.startDate) {
                const startDate = utils.date.transformMomentDate(props.startDate)
                this.injections.reduce('upDateStart', 'data.other.searchValue.startDate', startDate)
            }
        }
        this.getDetail(null, props.detailId )
    }
    refresh = () => {
        this.getDetail()
    }
	//获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.other.searchValue').toJS()
        return data.startDate
    }
    handleDisabledDate = (current) => {
        if (current) {
            let enableTime = this.metaAction.gf('data.other.enableTime'), currentDate = current.format('YYYY-MM')
            if (enableTime) enableTime = String(enableTime).replace(/-/g, '')
            if (currentDate) currentDate = currentDate.replace(/-/g, '')
            return currentDate && currentDate < enableTime
        }
    }

    // 查询搜索
    getDetail = async (v, detailId, page) => {
        let searchValue = this.metaAction.gf('data.other.searchValue').toJS()
        const date = this.changeDate(searchValue.startDate)
        const inventoryPropertyId = searchValue.type 
        const businessTypeId = searchValue.business
        const generateDocFlag = searchValue.state
        const inventoryId = this.metaAction.gf('data.other.inventoryId') // 存货id

        let conds
        if(v) {
            conds = v   
        }else{
            conds = this.metaAction.gf('data.other.conds')
            conds = conds && conds.size ? conds.toJS() : conds
        }

        let oldPage = this.metaAction.gf('data.page'), currentPage, pageSize
        oldPage = oldPage.size ? oldPage.toJS() : oldPage
        if(!page) {
            currentPage = oldPage.currentPage
            pageSize = oldPage.pageSize
        }else{
            currentPage = page.currentPage
            pageSize = page.pageSize
        }
        let filter = {
            beginAccountingYear: date.slice(0,4),
            beginAccountingPeriod: date.substring(5),
            endAccountingYear: date.slice(0,4),
            endAccountingPeriod: date.substring(5),
            inventoryPropertyId,
            inventoryId,
            businessTypeId,
            conds,
            generateDocFlag: generateDocFlag ? generateDocFlag : 0,
            page:{
                currentPage,
                pageSize
            }
        }
        this.metaAction.sf('data.other.loading', true)
        let res = await this.webapi.inventoryDetail.getInventoryDetail(filter)
        let enableTime = this.component.props.enableTime
        if(res) this.injections.reduce('load', {res, enableTime})
        this.metaAction.sf('data.other.loading', false)
        setTimeout(() => {  
            this.onResize()              
        }, 20)
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
          return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }
    getSearchCard = (childrenRef) => {
		this.searchCard = childrenRef
    }
    changeDate = (value) => {
        const value1 = this.metaAction.momentToString(value,'YYYY-MM')
        return value1
    }
    // 高级查询
    searchValueChange = (value) => {
        this.metaAction.sfs({
            'data.other.inventoryId': undefined,
            "data.other.isClear": false
        })
        this.injections.reduce('searchUpdate', value)
        this.getDetail()
    }
    clearValueChange = (value) => {
        this.metaAction.sf('data.other.isClear', true)
        let typeId = this.metaAction.gf('data.form.typeId'),
            businessId = this.metaAction.gf('data.form.businessId'),
            searchValue = this.metaAction.gf('data.other.searchValue').toJS()
        this.metaAction.sfs({
            'data.other.oldSearchValue.type': typeId,
            'data.other.oldSearchValue.business': businessId,
            'data.other.oldSearchValue.state': searchValue.state
        })
        this.searchCard.clearValue()
        this.metaAction.sfs({
            'data.other.searchValue.state': 0,
            'data.other.searchValue.type': undefined,
            'data.other.searchValue.business': undefined,
        })
    }
    //高级查询取消操作
	searchCancelChange = (value) => {
        let isClear = this.metaAction.gf('data.other.isClear')
        if(isClear){
            let oldSearchValue = this.metaAction.gf('data.other.oldSearchValue').toJS()
            this.metaAction.sfs({
                'data.other.searchValue.state': oldSearchValue.state,
                'data.other.searchValue.type': oldSearchValue.type,
                'data.other.searchValue.business': oldSearchValue.business
            })
        }
	}
    getSearchCard = (childrenRef) => {
		this.searchCard = childrenRef
	}
    changeStartDate = (value) => {
        let date = utils.moment.stringToMoment(value).endOf('month')
        this.metaAction.sf('data.other.searchValue.startDate',date)
        this.getDetail()
    }

    moreMenuClick = (e) => {
        this[e.key] && this[e.key]()
    }

    //生成凭证
    getVoucher = async () => {
        //勾选
        let flag = this.metaAction.gf('data.flag')
        if(!flag) return
 
        this.metaAction.sfs({
            'data.other.loading': true,
            'data.flag': false,
        })
        if(this.selectedOption.length) {
            let rdRecordDtos = []
            this.selectedOption.forEach(item => {
                rdRecordDtos.push(
                    {id : item.voucherId}
                )
            })
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                rdRecordDtos
            }

            let res = await this.webapi.inventoryDetail.auditBatch(filter) 

            if(res && res.message == "MODE_1_2_NEEDRECALCCOST") {
                let resConirm = await this.metaAction.modal('confirm', {
                    content: `存在未成本计算的库存单据，无法生成凭证，请先成本计算再进行此操作`,
                    okText: '成本计算',
                    className: 'ttk-scm-app-warehouse-detail-confirm',
                    bodyStyle: { padding: 24, fontSize: 12 },
                })
               
                if(resConirm) {
                    let newFilter = {}
                    newFilter.month = filter.beginAccountingPeriod
                    newFilter.year = filter.beginAccountingYear
                    let reCalcCost = await this.webapi.inventoryDetail.reCalcCost(newFilter)
                    
                    if (reCalcCost && reCalcCost.length == 0) {
                        let newResConirm = await this.metaAction.modal('confirm', {
                            content: `成本计算成功，是否继续生成凭证？`,
                            okText: '生成凭证',
                            className: 'ttk-scm-app-warehouse-detail-confirm',
                            bodyStyle: { padding: 24, fontSize: 12 },
                        })
                        if(newResConirm) {
                            res = await this.webapi.inventoryDetail.auditBatch(filter) 
                            if (res) {
                                this.metaAction.toast('success', '生成凭证成功')
                            }
                        }
                    } else if (reCalcCost && reCalcCost.length) {
                        reCalcCost.map((item, index) => {
                            res[index] = `存货编码${item}`
                        })
                        let modals = await this.metaAction.modal('warning', {
                            content: `${reCalcCost.join('、')}的出库成本为0或负数，请进行暂估入库或产品入库`,
                            okText: '确定',
                            className: 'ttk-scm-app-inventory-confirm',
                            bodyStyle: { padding: 24, fontSize: 12 },
                        })
                        if(modals) {
                            res = await this.webapi.inventoryDetail.auditBatch(filter) 
                            if (res && res.fail && res.fail.length) {
                                this.showErrorVoucher('生成凭证结果', res.success, res.fail)
                            } else if (res) {
                                this.metaAction.toast('success', '生成凭证成功')
                            }
                        }
                    }
                }
            }else if(res && res.message == "MODE_3_4_NEEDRECALCCOST") {
                let resConirm = await this.metaAction.modal('confirm', {
                    content: `存在销项发票生成的销售出库单，尚未按比例自动计算销售成本，请先按比例自动计算销售成本才可生成凭证`,
                    okText: '按比例自动计算销售成本',
                    className: 'ttk-scm-app-warehouse-detail-confirm',
                    bodyStyle: { padding: 24, fontSize: 12 },
                })
 
                if(resConirm) {
                    // let date = await this.webapi.inventoryDetail.query()
                    let other = this.metaAction.gf('data.other').toJS()
                    let date = this.metaAction.momentToString(other.searchValue.startDate, 'YYYY-MM')

                    let automaticcalculation = await this.metaAction.modal('show', {
                        title: '按比例自动计算销售成本',
                        wrapClassName: 'inventory-automaticcalculation',
                        width: 900,
                        okText: '确定',
                        bodyStyle: { padding: '0' },
                        closeModal: this.close,
                        closeBack: (back) => { this.closeTip = back },
                        children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                            store: this.component.props.store,
                            initData: {
                                date,
                                lastDayOfUnEndingClosingCalendar: other.lastDayOfUnEndingClosingCalendar,
                                type: other.mode == '4' ? 'costSaleRatio' : undefined
                            }
                        }),
                    })
                    if(automaticcalculation) {
                        res = await this.webapi.inventoryDetail.auditBatch(filter) 
                        if(res && res.message == "MODE_3_4_NEEDRECALCCOST") {
                            return
                        }else if (res && res.fail && res.fail.length) {
                            this.showErrorVoucher('生成凭证结果', res.success, res.fail)
                        } else if (res) {
                            this.metaAction.toast('success', '生成凭证成功')
                        }
                    }
                }
            }else if (res && res.fail && res.fail.length) {
                this.showErrorVoucher('生成凭证结果', res.success, res.fail)
            } else if (res) {
                this.metaAction.toast('success', '生成凭证成功')
            }
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            this.selectedOption = []
        }else {
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5)
            }

            let textContent = `是否生成${startDate.slice(0, 4)}年${startDate.substring(5)}月全部库存单据的凭证`

            let one = await this.metaAction.modal('confirm', {
                content: textContent,
                okText: '确定',
                className: 'ttk-scm-app-warehouse-detail-confirm',
                bodyStyle: { padding: 24, fontSize: 12 },
            })

            if(!one)  {
                this.metaAction.sfs({
                    'data.other.loading': false,
                    'data.flag': true,
                })
                return
            }

            let res = await this.webapi.inventoryDetail.auditBatch(filter) 

            if(res && res.message == "MODE_1_2_NEEDRECALCCOST") {
                let resConirm = await this.metaAction.modal('confirm', {
                    content: `存在未成本计算的库存单据，无法生成凭证，请先成本计算再进行此操作`,
                    okText: '成本计算',
                    className: 'ttk-scm-app-warehouse-detail-confirm',
                    bodyStyle: { padding: 24, fontSize: 12 },
                })
               
                if(resConirm) {
                    let newFilter = {}
                    newFilter.month = filter.beginAccountingPeriod
                    newFilter.year = filter.beginAccountingYear
                    let reCalcCost = await this.webapi.inventoryDetail.reCalcCost(newFilter)
                    
                    if (reCalcCost && reCalcCost.length == 0) {
                        let newResConirm = await this.metaAction.modal('confirm', {
                            content: `成本计算成功，是否继续生成凭证？`,
                            okText: '生成凭证',
                            className: 'ttk-scm-app-warehouse-detail-confirm',
                            bodyStyle: { padding: 24, fontSize: 12 },
                        })
                        if(newResConirm) {
                            res = await this.webapi.inventoryDetail.auditBatch(filter) 
                            if (res && res.fail && res.fail.length) {
                                this.showErrorVoucher('生成凭证结果', res.success, res.fail)
                            } else if (res) {
                                this.metaAction.toast('success', '生成凭证成功')
                            }
                        }
                    } else if (reCalcCost && reCalcCost.length) {
                        reCalcCost.map((item, index) => {
                            res[index] = `存货编码${item}`
                        })
                        let modals = await this.metaAction.modal('warning', {
                            content: `${reCalcCost.join('、')}的出库成本为0或负数，请进行暂估入库或产品入库`,
                            okText: '确定',
                            className: 'ttk-scm-app-inventory-confirm',
                            bodyStyle: { padding: 24, fontSize: 12 },
                        })
                        if(modals) {
                            res = await this.webapi.inventoryDetail.auditBatch(filter) 
                            if (res && res.fail && res.fail.length) {
                                this.showErrorVoucher('生成凭证结果', res.success, res.fail)
                            } else if (res) {
                                this.metaAction.toast('success', '生成凭证成功')
                            }
                        }
                    }
                }
            }else if(res && res.message == "MODE_3_4_NEEDRECALCCOST") {
                let resConirm = await this.metaAction.modal('confirm', {
                    content: `存在销项发票生成的销售出库单，尚未按比例自动计算销售成本，请先按比例自动计算销售成本才可生成凭证`,
                    okText: '按比例自动计算销售成本',
                    className: 'ttk-scm-app-warehouse-detail-confirm',
                    bodyStyle: { padding: 24, fontSize: 12 },
                })
  
                if(resConirm) {
                    // let date = await this.webapi.inventoryDetail.query()
                    let other = this.metaAction.gf('data.other').toJS()
                    let date = this.metaAction.momentToString(other.searchValue.startDate, 'YYYY-MM')

                    let automaticcalculation = await this.metaAction.modal('show', {
                        title: '按比例自动计算销售成本',
                        wrapClassName: 'inventory-automaticcalculation',
                        width: 900,
                        okText: '确定',
                        bodyStyle: { padding: '0' },
                        closeModal: this.close,
                        closeBack: (back) => { this.closeTip = back },
                        children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                            store: this.component.props.store,
                            initData: {
                                date,
                                lastDayOfUnEndingClosingCalendar: other.lastDayOfUnEndingClosingCalendar,
                                type: other.mode == '4' ? 'costSaleRatio' : undefined
                            }
                        }),
                    })
                    if(automaticcalculation) {
                        res = await this.webapi.inventoryDetail.auditBatch(filter) 
                        if(res && res.message == "MODE_3_4_NEEDRECALCCOST") {
                            return
                        }else if (res && res.fail && res.fail.length) {
                            this.showErrorVoucher('生成凭证结果', res.success, res.fail)
                        } else if (res) {
                            this.metaAction.toast('success', '生成凭证成功')
                        }
                    }
                }
            }else if (res && res.fail && res.fail.length) {
                this.showErrorVoucher('生成凭证结果', res.success, res.fail)
            } else if (res) {
                this.metaAction.toast('success', '生成凭证成功')
            }
        }
        
        this.metaAction.sfs({
            'data.other.loading': false,
            'data.flag': true,
        })
        this.refresh()
    }

    // 凭证习惯
    voucherHabit = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '凭证习惯设置',
            width: 380,
            okText: '确定',
            bodyStyle: { padding: '8px 24px' },
            children: this.metaAction.loadApp('ttk-scm-detailedHabit-card', {
                store: this.component.props.store,
                type: 'rdrecord',
            }),
        })
         if (ret) this.metaAction.toast('success', '设置成功')
    }

    close = (ret) => {
        this.closeTip()
    }

    showErrorVoucher = (title, successArr, oldFailArr) => {
        let failArr = []
        if (oldFailArr && oldFailArr.length) {
            oldFailArr.map(item => {
                failArr.push({
                    message: item.errorMsg
                })
            })
        }
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            bodyStyle: { padding: '2px 0 10px 11px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    subjectSetting = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=inventory', { accessType: 'inventory' })
    }

    delBatch = async () => {
        let flag = this.metaAction.gf('data.flag')
        if(!flag) return
 
        this.metaAction.sfs({
            'data.other.loading': true,
            'data.flag': false,
        })
        if(this.selectedOption.length) {
            let rdRecordDtos = []
            this.selectedOption.forEach(item => {
                rdRecordDtos.push(
                    {id : item.voucherId}
                )
            })
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                rdRecordDtos
            }

            let res = await this.webapi.inventoryDetail.unauditBatch(filter)

            if (res && res.fail && res.fail.length) {
                this.showErrorVoucher('删除凭证结果', res.success, res.fail)
            } else if (res) {
                this.metaAction.toast('success', '删除凭证成功')
            }
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            this.selectedOption = []
        }else {
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5)
            }

            let textContent = `是否删除${startDate.slice(0, 4)}年${startDate.substring(5)}月全部库存单据的凭证`

            let one = await this.metaAction.modal('confirm', {
                content: textContent,
                okText: '确定',
                className: 'ttk-scm-app-warehouse-detail-confirm',
                bodyStyle: { padding: 24, fontSize: 12 },
            })

            if(!one) return

            let res = await this.webapi.inventoryDetail.unauditBatch(filter)

            if (res && res.fail && res.fail.length) {
                this.showErrorVoucher('删除凭证结果', res.success, res.fail)
            } else if (res) {
                this.metaAction.toast('success', '删除凭证成功')
            }
        }
        this.metaAction.sfs({
            'data.other.loading': false,
            'data.flag': true,
        })
        this.refresh()
    }

    delete = async() => {
        if(!this.selectedOption.length) {
            this.metaAction.toast('error', '请选择要删除的数据')
            return false
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确定删除所选明细？'
        })
        if(ret){
            let delArr = [], delObj = {}, res
            this.selectedOption.map(item=>{
                delArr.push({
                    id: item.voucherId,
                    ts: item.ts,
                    autoTempBill: item.autoTempBill
                })
            })
            res = await this.webapi.inventoryDetail.delDetails(delArr)
            
            if(res.falure) {
                let successArr = []
                if(res.sucess){
                    for(var i=0;i<res.sucess;i++){successArr.push(i)}
                }
                this.showError('删除单据结果', successArr, res.cause)
            }else{
                this.metaAction.toast('success', '删除成功')
            }
            this.refresh()
            this.selectedOption = []
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
        }
    }
    showError = (title, successArr, failArr) => {
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            bodyStyle: { padding: '2px 0 10px 11px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            })
        })
    }
    // 非 code
    cell = (text, row, index) => {
        let obj 
        return obj = {
            children: <span title={text}>{text}</span>,
        }
    }
    // 金额
    cellIsAmount = (text, row, index) => {
        let obj 
        if(!text) return
        text = utils.number.format(text,2)
        return obj = {
            children: <span title={text}>{text}</span>,
        }
    }
    // 非金额
    cellNoAmount = (text, row, index) => {
        let obj 
        if(!text) return
        text = utils.number.format(text,6)
        return obj = {
            children: <span title={text}>{text}</span>,
        }
    }
    // code
    cellA = (text, row, index) => {
        let obj 
        return obj = {
            children: <a onClick={()=>this.toInventory(row.voucherId, row.docCode, row.docId, row.businessTypeName)} title={text}>{text}</a>,
            props: {
				rowSpan: this.calcRowSpan(row.code, 'code', index),
			}
        }
    }
    // docCode
    docCode = (text, row, index) => {
        let obj ,type, isDocCode=false

        if(text) type = text.substring(0,2)
        if(row.docCode){
            if(text && type!='XX' && type!='JX') {
                if(row.sourceVoucherCode && row.sourceVoucherCode.substring(0,2)=='JX'){
                    text=''
                }else{
                    text = `记-${text}`
                    isDocCode = true   // 是否是凭证字号
                }
            }
        }
        
        return obj = {
            children: <a onClick={()=>this.toDocCode(row.docId, type, index, isDocCode)} title={text}>{text}</a>,
            props: {
				rowSpan: this.calcRowSpan(row.code, 'code', index),
			}
        }
    }
    toDocCode = (id, type, index, isDocCode) => {
        let tableList
        if(type == 'JX' || type == 'XX'){
            tableList = this.metaAction.gf('data.other.tableList').toJS()
            id = tableList[index].sourceVoucherId
        }
        if(type == 'JX' && !isDocCode){
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '进项发票',
                    'ttk-scm-app-pu-invoice-card',
                    { accessType: 1, id }
                )
        }else if(type == 'XX' && !isDocCode){
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '销项发票',
                    'ttk-scm-app-sa-invoice-card',
                    { accessType: 1, id }
                )
        }else if(isDocCode){
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '填制凭证',
                    'app-proof-of-charge',
                    { accessType: 1, initData: { id } }
                )
        }
    }
    // 类型、日期
    RowSpanB = (text, row, index) => {
        let obj 
        return obj = {
            children: <span title={text}>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(row.code, 'code', index),
            }
        }   
    }
    // 计算 row
    calcRowSpan = (text, columnKey, currentRowIndex) => {
		const list = this.metaAction.gf('data.other.tableList')
		if (!list) return
		const rowCount = list.size
		if (rowCount == 0 || rowCount == 1) return 1
		if (currentRowIndex > 0
			&& currentRowIndex <= rowCount
			&& text == list.getIn([currentRowIndex - 1, columnKey])) {
			return 0
		}
		let rowSpan = 1
		for (let i = currentRowIndex + 1; i < rowCount; i++) {
			if (text == list.getIn([i, columnKey]))
				rowSpan++
			else
				break
		}
		return rowSpan
    }
    
    renderRowClassName = (record, index) => {
        if (record && record.businessTypeName == '合计') {
            return 'tr_heji'
        } 
    }
    tableColumns = () => {
        let cellArr = [this.cell, this.cellA, this.cellIsAmount, this.cellNoAmount, this.RowSpanB, this.docCode]
        return renderColumns(...cellArr)
    }
    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if( item ){
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if( item ){
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
    rowSelection = (text, row, index) => {
        return undefined
    }
    // 存货分类
    selectType = (v) => {
        this.metaAction.sf('data.other.inventoryId', undefined)
        if(v){
            this.metaAction.sfs({
                'data.form.typeId': v.value,
                'data.other.searchValue.type': v.value
            })
        }else{
            this.metaAction.sfs({
                'data.form.typeId': undefined,
                'data.other.searchValue.type': undefined
            })
        }
        this.getDetail()
    }
    // 业务类型
    selectBusinessType = (v) => {
        this.metaAction.sf('data.other.inventoryId', undefined)
        if(v){
            this.metaAction.sfs({
                'data.form.businessId': v.value,
                'data.other.searchValue.business': v.value
            })
        }else{
            this.metaAction.sfs({
                'data.form.businessId': undefined,
                'data.other.searchValue.business': undefined
            })
        }
        this.getDetail()
    }
    // 模糊查询
    searchList = (v) => {
        this.metaAction.sf('data.other.inventoryId', undefined)
        this.injections.reduce('update', {path: 'data.other.conds', value: v})
        this.getDetail(v)
    }

    toInventory = async (voucherId, docCode, docId, businessTypeName) => { // 库存单据
        let proMethod = this.metaAction.gf('data.other.proMethod')
        let mode = this.metaAction.gf('data.other.mode')
        let recoilMode = this.metaAction.gf('data.other.recoilMode')

        // this.component.props.setPortalContent &&
        // this.component.props.setPortalContent('库存单据', 'ttk-scm-app-inventory-documents',
        //     {accessType: 1, inventoryId:voucherId, docCode, docId, proMethod, type: mode })
        let appName = businessTypeName.includes('出库') ? 'ttk-scm-app-inventory-documents?key=out' : 'ttk-scm-app-inventory-documents?key=in'
        let name = businessTypeName.includes('出库') ? '出库单' : '入库单'

        this.component.props.setPortalContent &&
        this.component.props.setPortalContent(name, appName,
            {accessType: 1, inventoryId:voucherId, docCode, docId, proMethod, type: mode, recoilMode })
    } 
    inventory = async (e) => { // 库存单据
        let proMethod = this.metaAction.gf('data.other.proMethod')
        let mode = this.metaAction.gf('data.other.mode')
        let recoilMode = this.metaAction.gf('data.other.recoilMode')
        if(e.key){
            let appName = e.key == 'addInventoryIn' ? 'ttk-scm-app-inventory-documents?key=in' : 'ttk-scm-app-inventory-documents?key=out'
            let name = e.key == 'addInventoryIn' ? '入库单' : '出库单'
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent(name, 
                appName, 
                {accessType: 1, inventoryId: 'NewInventory',inventoryType: e.key, proMethod, type: mode, recoilMode })
        }
    }

    linkToEstimateList = () => {
        let date =  this.metaAction.gf('data.other.searchValue').toJS().startDate
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('暂估存货', 'ttk-scm-app-estimate-list', { accessType: 1, date })
    }
    print = async() => {
        let list = this.metaAction.gf('data.other.tableList')
        list = list.size ? list.toJS() : list
        if(list.length){
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS()
            let conds = this.metaAction.gf('data.other.conds') 
            if(conds) conds = conds.size ? conds.toJS() : conds
            const date = this.changeDate(searchValue.startDate)
            const inventoryPropertyId = searchValue.type 
            const businessTypeId = searchValue.business
            const inventoryId = this.component.props.detailId  // 存货id
            let filter = {
                beginAccountingYear: date.slice(0,4),
                beginAccountingPeriod: date.substring(5),
                endAccountingYear: date.slice(0,4),
                endAccountingPeriod: date.substring(5),
                inventoryPropertyId,  // 存货分类
                inventoryId,   // 存货id
                businessTypeId,  // 业务类型
                conds
            }
            let res = await this.webapi.inventoryDetail.print(filter)
            if(res) this.metaAction.toast('success', '打印成功')
        }else{
            this.metaAction.toast('warning', '当前没有可打印数据')
			return false
        }
    }
    export = async() => {
        let list = this.metaAction.gf('data.other.tableList')
        list = list.size ? list.toJS() : list
        if(list.length){
            let searchValue = this.metaAction.gf('data.other.searchValue').toJS()
            let conds = this.metaAction.gf('data.other.conds') 
            if(conds) conds = conds.size ? conds.toJS() : conds
            const date = this.changeDate(searchValue.startDate)
            const inventoryPropertyId = searchValue.type 
            const businessTypeId = searchValue.business
            const inventoryId = this.component.props.detailId  // 存货id
            let filter = {
                beginAccountingYear: date.slice(0,4),
                beginAccountingPeriod: date.substring(5),
                endAccountingYear: date.slice(0,4),
                endAccountingPeriod: date.substring(5),
                inventoryPropertyId,
                inventoryId,
                businessTypeId,
                conds
            }
            let res = await this.webapi.inventoryDetail.export(filter)
            if(res) this.metaAction.toast('success', '导出成功')
        }else{
            this.metaAction.toast('warning', '当前没有可导出数据')
			return false
        }
    }

    //分页修改
	pageChanged = async (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.page').toJS().pageSize
        }
        this.getDetail(null,null,{currentPage, pageSize})
    }
    
    temporaryInventoryList = async() => {
        let data = this.metaAction.gf('data.other.searchValue').toJS()

        if(!this.selectedOption.length || this.selectedOption.length > 1 || this.selectedOption[0].businessTypeId != 5001001001) {
            this.metaAction.toast('error', '请选择一张采购入库单进行暂估回冲')
            return false
        } 
        const purchaseId = this.selectedOption[0].voucherId
        const ret = await this.getBackwashed({purchaseId})
        if(ret){
            this.metaAction.toast('error', '采购入库单已回冲')
            return false
        }

        const res = await this.metaAction.modal('show', {
            title: '暂估入库单列表',
            width: '80%',
            wrapClassName: 'temporary-inventory-css',
            children: <TemporaryInventoryDetail 
                        businessDate={data.startDate}
                        getRecoilPEList={this.getRecoilPEList}
                        purchaseId={purchaseId}
                        metaAction={this.metaAction}
                        toInventory={this.toInventory}/>
        }) 
        if(res && res.length){
            let filter = [], itemObj
            res.map((item, index)=> {
                if(item.thisAmount && item.thisQuantity){

                    let thisAmount = utils.number.format(Number(item.thisAmount), 2),
                    thisQuantity = utils.number.format(Number(item.thisQuantity), 6)
                    thisAmount = Number(thisAmount.replace(/,/g, ''))
                    thisQuantity = Number(thisQuantity.replace(/,/g, ''))

                    itemObj = {
                        inventoryId: item.inventoryId,
                        inventoryName: item.inventoryName,
                        propertyName: item.propertyName,
                        unitId: item.unitId,
                        unitName: item.unitName,	
                        amount: thisAmount,
                        quantity: thisQuantity,
                        price: item.price 
                    }
                    if(index>0 && item.id == res[index-1].id){
                        filter[index-1].details.push(itemObj)
                    }else{
                        filter.push({
                            businessDate: item.businessDate,
                            codePrefix: "ZH",
                            supplierId: item.supplierId,
                            purchaseId,
                            estimateId: item.id,
                            details: [itemObj]
                        })
                    }
                }
            })
            const create = await this.webapi.inventoryDetail.createRecoilBill(filter)
            if(create){
                this.metaAction.toast('success', '暂估回冲成功')
                this.refresh()
                this.selectedOption = []
                this.injections.reduce('update', {
                    path: 'data.tableCheckbox',
                    value: {
                        checkboxValue: [],
                        selectedOption: []
                    }
                })
            }
        }
    }

    getRecoilPEList = async(filter) => {
        const queryRecoilPEList = await this.webapi.inventoryDetail.queryRecoilPEList(filter)
        return queryRecoilPEList
    }   
    // 单据是否回冲
    getBackwashed = async(filter) => {
        const res = await this.webapi.inventoryDetail.queryPurchaseBackwashed(filter)
        return res
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o }
	
	metaAction.config({ metaHandlers: ret })

	return ret
}
