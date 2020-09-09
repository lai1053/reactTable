import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import utils, { fetch, history } from 'edf-utils'
import extend from './extend'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
import InventorySubjectSet from './components/InventorySubjectSet'

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
        }
        let addTabsCloseListen = this.component.props.addTabsCloseListen
        if (addTabsCloseListen) {
            addTabsCloseListen('ttk-scm-app-warehouse-beginning', () => this.isEditing)
        }
        injections.reduce('init')
        let tabEdit = this.component.props.tabEdit
        this.load(tabEdit)
        this.renderNum = 1
        this.isEditing = false
    }

    load = async (tabEdit) => {
        let query = await this.webapi.warehouseBegin.query()
        if (query == '0') {
            // 未启用,获取开账时间
            const currentOrg = this.metaAction.context.get("currentOrg")
            const enabledPeriod = currentOrg.enabledYear + '-' + `${currentOrg.enabledMonth}`.padStart(2, '0') //'2018-01'
            const appNames = 'beginning'
            const ret = await this.metaAction.modal('show', {
                title: '存货核算',
                wrapClassName: 'inventory-card',
                width: 490,
                okText: '确定',
                bodyStyle: { padding: '10px 40px' },
                children: this.metaAction.loadApp('ttk-scm-app-inventory-card', {
                    store: this.component.props.store,
                    enabledPeriod,
                    tabEdit,
                    appNames
                }),
            })
            if (ret) {
                this.initLoad(null, query)
                this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
            }
        } else {
            this.initLoad(null, query)  // 启用存货核算
        }
    }

    initLoad = async (value, query) => {
        this.metaAction.sf('data.loading', true)
        if (!value) {
            value = {
                id: undefined,
                rate: undefined,
                conds: ''
            }
        }
        let initPeriodBegin
        if (value.id || value.conds) {
            initPeriodBegin = await this.webapi.warehouseBegin.initPeriodBegin({ inventoryPropertyId: value.id, conds: value.conds })
        } else {
            initPeriodBegin = await this.webapi.warehouseBegin.initPeriodBegin() //初始化
        }
        this.metaAction.sf('data.loading', false)
        initPeriodBegin.propertyId = value.id
        initPeriodBegin.rate = value.rate
        if (initPeriodBegin.rdRecordDetailDtos) {
            if (value.oldValue && Array.isArray(value.oldValue)) {
                initPeriodBegin.rdRecordDetailDtos.map(item => {
                    value.oldValue.map(items => {
                        if (item.inventoryId == items.id) {
                            if (items.amount) item.amount = items.amount
                            if (items.price) item.price = items.price
                            if (items.quantity) item.quantity = items.quantity
                        }
                    })
                })
            }
        }
        if (query) initPeriodBegin.paramValue = query.paramValue
        this.injections.reduce('load', initPeriodBegin)
    }

    onTabFocus = async (props) => {
        let query = await this.webapi.warehouseBegin.query()
        if (query == '0') {
            let tabEdit = this.component.props.tabEdit
            this.load(tabEdit)
            return false
        }
        let oldValue = this.metaAction.gf('data.form.details').toJS()
        this.refresh(oldValue, 'onTabFocus')
    }
    refresh = (oldValue, onTabFocus) => {
        let id = this.metaAction.gf('data.form.inventoryProperty'),
            rate = this.metaAction.gf('data.form.typeRate'),
            conds = this.metaAction.gf('data.other.searchInput')
        this.initLoad({ id, rate, conds, oldValue })

        if(onTabFocus != 'onTabFocus'){
            let details = this.metaAction.gf('data.form.details').toJS()
            details.map((item, index)=>{
                this.metaAction.sfs({
                    [`data.form.style.${index}.priceStyle`]: false,
                    [`data.form.style.${index}.quantityStyle`]: false,
                    [`data.form.style.${index}.amountStyle`]: false,
                })
            })
        }
    }

    save = async () => {
        let isMonthlyClosed = this.metaAction.gf('data.other.isMonthlyClosed')
        if(isMonthlyClosed) return false
        if (!this.checkForSave()) return
        let details = this.metaAction.gf('data.form.details')
        details = details.size ? details.toJS() : details
        let inventoryProperty = this.metaAction.gf('data.form.inventoryProperty')

        let filterDetail = []
        details.map(item => {
            filterDetail.push({
                inventoryId: item.id,
                quantity: item.quantity ? item.quantity : 0,
                price: item.price ? item.price : 0,
                amount: item.amount ? item.amount : 0,
                periodBeginIsSync: item.periodBeginIsSync ? item.periodBeginIsSync : null
            })
        })
        let filter = {
            businessTypeId: inventoryProperty, //--业务类型
            details: filterDetail
        }
        this.metaAction.sf('data.loading', true)
        const ret = await this.webapi.warehouseBegin.savePeriodBegin(filter)
        this.metaAction.sf('data.loading', false)
        this.metaAction.sf('data.other.change', false)
        this.editCloseTips(false)
        if (ret) this.metaAction.toast('success', '保存成功')
    }

    checkForSave = () => {
        let details = this.metaAction.gf('data.form.details')
        details = details.size ? details.toJS() : details
        let errorArr = []
        this.metaAction.sf('data.other.isSaved', false)  // 记录是否点过保存
        details.map((item, index) => {
             
            if (item.quantity && !item.amount && !item.price) {  // 只有数量，单价和金额为0
                this.metaAction.sfs({
                    [`data.form.details.${index}.amount`]: 0,
                    [`data.form.details.${index}.price`]: 0
                })
            }
            if (!item.periodBeginIsSync) { // 只有没有同步过 或者同步过之后又修改了 这种情况下才去加 数量和单价的控制
                if (!item.quantity && item.amount) {    // 没数量，有金额
                    this.metaAction.sf(`data.form.style.${index}.quantityStyle`, true)
                    if (!item.price) this.metaAction.sf(`data.form.style.${index}.priceStyle`, true)
                    errorArr.push(item.code)
                } else if ((item.price < 0 && item.quantity < 0 && item.amount > 0) || (item.price < 0 && item.quantity > 0 && item.amount < 0)) {
                    this.metaAction.sfs({
                        [`data.form.style.${index}.priceStyle`]: true,
                        [`data.form.style.${index}.quantityStyle`]: true,
                        [`data.form.style.${index}.amountStyle`]: true,
                    })
                    errorArr.push(item.code)
                } else if (!item.quantity && !item.amount && item.price) {
                    this.metaAction.sfs({
                        [`data.form.style.${index}.quantityStyle`]: true,
                        [`data.form.style.${index}.amountStyle`]: true,
                    })
                    errorArr.push(item.code)
                }
            }
        })
        if (errorArr.length) {
            let code
            errorArr.map((item, index) => {
                if (code) {
                    if (errorArr[index + 1]) code = code + ',' + errorArr[index + 1]
                } else {
                    if (errorArr.length == 1) {
                        code = item
                    } else {
                        code = item + ',' + errorArr[index + 1]
                    }
                }
            })
            this.metaAction.toast('error', `存货编码${code}的存货，数量未录入或单价小于0，请检查调整`)
            this.metaAction.sf('data.other.isSaved', true)
            return false
        } else {
            return true
        }
    }

    getBeginList = (value) => {
        let details = this.metaAction.gf('data.form.details'), otherDetail, nowList
        let propertyId = this.metaAction.gf('data.form.inventoryProperty')
        switch (propertyId) {
            case 1:
                otherDetail = 'otherFormB'
                break;
            case 2:
                otherDetail = 'otherFormA'
                break;
            case 3:
                otherDetail = 'otherFormD'
                break;
            case 4:
                otherDetail = 'otherFormC'
                break;
            default:
                otherDetail = 'otherFormAll'
        }
        let isChangepre = this.metaAction.gf(`data.other.${otherDetail}Change`)
        if (isChangepre) {
            this.metaAction.sf(`data.${otherDetail}.details`, details)  // 保存上一次修改
        }

        if (value && value.id) {
            switch (value.id) {
                case 1:
                    otherDetail = 'otherFormB'
                    break;
                case 2:
                    otherDetail = 'otherFormA'
                    break;
                case 3:
                    otherDetail = 'otherFormD'
                    break;
                case 4:
                    otherDetail = 'otherFormC'
                    break;
            }
            let isChanged = this.metaAction.gf(`data.other.${otherDetail}Change`)
            if (isChanged) {
                nowList = this.metaAction.gf(`data.${otherDetail}.details`)  // 此时选中的属性，是否修改过未保存，拿到未保存的值
                value['details'] = nowList
            }
        } else {
            let isChanged = this.metaAction.gf('data.other.otherFormAllChange')
            if (isChanged) {
                nowList = this.metaAction.gf(`data.otherFormAll.details`)  // 全部时
                value = { details: nowList }
            }
        }

        if (value && value.id) {
            this.metaAction.sf('data.form.inventoryProperty', value.id)
            this.metaAction.sf('data.form.typeRate', value.rate)
            let conds = this.metaAction.gf('data.other.searchInput')
            value.conds = conds
            this.initLoad(value)
        } else {
            let values = {}
            this.metaAction.sf('data.form.inventoryProperty', undefined)
            this.metaAction.sf('data.form.typeRate', undefined)
            let conds = this.metaAction.gf('data.other.searchInput')
            values.conds = conds
            if (!value) {
                this.initLoad(values)
            } else {
                values.details = value.details
                this.initLoad(values)
            }
        }
    }
    // 模糊查询
    searchList = async (value) => {
        let inventoryPropertyId = this.metaAction.gf('data.form.inventoryProperty'),
            rate = this.metaAction.gf('data.form.typeRate')
        this.metaAction.sf('data.other.searchInput', value)
        let filter = {
            id: inventoryPropertyId ? inventoryPropertyId : undefined,
            rate: rate ? rate : '',
            conds: value
        }
        this.initLoad(filter)
    }
    // 导出
    export = async () => {
        let id = this.metaAction.gf('data.form.inventoryProperty'),
            conds = this.metaAction.gf('data.other.searchInput'),
            list = this.metaAction.gf('data.form.details').toJS()

        if (!list.length) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return false
        } else {
            let res = await this.webapi.warehouseBegin.export({ inventoryPropertyId: id , conds})
        }
    }
    //打印
    print = async () => {
        let id = this.metaAction.gf('data.form.inventoryProperty'),
            conds = this.metaAction.gf('data.other.searchInput'),
            list = this.metaAction.gf('data.form.details').toJS()
        if (!list.length) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return false
        } else {
            let res = await this.webapi.warehouseBegin.print({ inventoryPropertyId: id, conds })
        }

    }

    // 导入
    imports = async () => {
        let propertyId = this.metaAction.gf('data.form.inventoryProperty'),
            rate = this.metaAction.gf('data.form.typeRate'),
            conds = this.metaAction.gf('data.other.searchInput'),
            isMonthlyClosed = this.metaAction.gf('data.other.isMonthlyClosed')  // 已经月结不允许导入
        const ret = await this.metaAction.modal('show', {
            title: '存货期初导入',
            width: 560,
            okText: '导入',
            children: this.metaAction.loadApp('ttk-scm-app-warehouse-import', {
                store: this.component.props.store,
                propertyId,
                rate,
                isMonthlyClosed
            }),
        })
        if (ret) {
            this.initLoad({ id: propertyId, rate, conds })  // 应该调用属性筛选接口
        }
    }

    // 计算 不反算数量
    calc = (fieldName, rowIndex, rowData, params) => (v) => {
        this.editCloseTips(true)
        let propertyId = this.metaAction.gf('data.form.inventoryProperty'), otherDetail
        switch (propertyId) {
            case 1:
                otherDetail = 'otherFormBChange'
                break;
            case 2:
                otherDetail = 'otherFormAChange'
                break;
            case 3:
                otherDetail = 'otherFormDChange'
                break;
            case 4:
                otherDetail = 'otherFormCChange'
                break;
            default:
                otherDetail = 'otherFormAllChange'
        }
        this.metaAction.sf('data.other.change', true)
        this.metaAction.sf(`data.other.${otherDetail}`, true)
        if (fieldName === 'price') {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
            this.priceChange(rowIndex, rowData, v)
        } else if (fieldName === 'amount') {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.99
            }
            this.amountChange(rowIndex, rowData, v)
        } else if (fieldName === 'quantity') {
            if (Number(v) > 9999999999.99) {
                v = 9999999999.999999
            }
            this.quantityChange(rowIndex, rowData, v)
        }
        // 保存过有错误才去检查
        let isSaved = this.metaAction.gf('data.other.isSaved')
        // if(isSaved) this.checkIsValue(rowIndex,rowData,v,fieldName)
        if (isSaved) {
            this.metaAction.sfs({
                [`data.form.style.${rowIndex}.amountStyle`]: false,
                [`data.form.style.${rowIndex}.priceStyle`]: false,
                [`data.form.style.${rowIndex}.quantityStyle`]: false,
            })
        }
    }
    // 检验是否有值，去掉红框
    checkIsValue = (rowIndex, rowData, v, fieldName) => {
        let priceStyle = this.metaAction.gf(`data.form.style.${rowIndex}.priceStyle`),
            price = this.metaAction.gf(`data.form.details.${rowIndex}.price`),
            amountStyle = this.metaAction.gf(`data.form.style.${rowIndex}.amountStyle`),
            amount = this.metaAction.gf(`data.form.details.${rowIndex}.amount`),
            quantityStyle = this.metaAction.gf(`data.form.style.${rowIndex}.quantityStyle`),
            quantity = this.metaAction.gf(`data.form.details.${rowIndex}.quantity`)

        if ((amount && amountStyle == true) || fieldName === 'amount') {
            this.metaAction.sf(`data.form.style.${rowIndex}.amountStyle`, false)
            this.metaAction.sf(`data.form.style.${rowIndex}.priceStyle`, false)
        }
        if ((price && priceStyle == true) || fieldName === 'price') {
            this.metaAction.sf(`data.form.style.${rowIndex}.amountStyle`, false)
            this.metaAction.sf(`data.form.style.${rowIndex}.priceStyle`, false)
        }
        if ((quantity && quantityStyle == true) || fieldName === 'quantity') {
            this.metaAction.sf(`data.form.style.${rowIndex}.quantityStyle`, false)
            this.metaAction.sf(`data.form.style.${rowIndex}.priceStyle`, false)
        }
    }
    priceChange = (rowIndex, rowData, v) => {
        let price = utils.number.round(v, 6),
            quantity = utils.number.round(rowData.quantity, 6),
            amount = utils.number.round(rowData.amount, 2)

        if (quantity) amount = utils.number.round(quantity * price, 2)
        this.metaAction.sfs({
            [`data.form.details.${rowIndex}.price`]: price,
            [`data.form.details.${rowIndex}.amount`]: amount,
            [`data.form.details.${rowIndex}.periodBeginIsSync`]: null
        })
    }
    amountChange = (rowIndex, rowData, v) => {
        let amount = utils.number.round(v, 2),
            quantity = utils.number.round(rowData.quantity, 6),
            price = utils.number.round(rowData.price, 6)

        if (quantity != 0) {
            price = utils.number.round(amount / quantity, 6)
        }
        this.metaAction.sfs({
            [`data.form.details.${rowIndex}.amount`]: amount,
            [`data.form.details.${rowIndex}.price`]: price,
            [`data.form.details.${rowIndex}.periodBeginIsSync`]: null
        })
    }
    quantityChange = (rowIndex, rowData, v) => {
        let quantity = utils.number.round(v, 6),
            price = utils.number.round(rowData.price, 6),
            amount = utils.number.round(rowData.amount, 2)

        if (amount) price = utils.number.round(amount / quantity, 6)
        if (price) amount = utils.number.round(price * quantity, 2)
        this.metaAction.sfs({
            [`data.form.details.${rowIndex}.quantity`]: quantity,
            [`data.form.details.${rowIndex}.amount`]: amount,
            [`data.form.details.${rowIndex}.price`]: price,
            [`data.form.details.${rowIndex}.periodBeginIsSync`]: null
        })
    }

    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity) {
            return this.voucherAction.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    
    btnInvAccount = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('存货台账', 'ttk-scm-app-inventory')
    }

    // 关闭页面
    editCloseTips = (istip) => {
        this.isEditing = istip
    }

    addInventory = async(id) => {
		let option = { title: '', appName: '', id: undefined };
		option.title = '存货';
        option.appName = 'app-card-inventory';
        
        //获取生成凭证设置
		await this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
        .then((res) => this.queryByparamKeys = res)
        const res = await this.addModel(option);
        if (res) {
            let oldValue = this.metaAction.gf('data.form.details').toJS()
            oldValue.push(res)
            this.refresh(oldValue)
        }
    }
    addModel = async (option) => {
        // debugger
		let className = 'app-list-inventory-modal'
		//把生成凭证设置传入 card
		let queryByparamKeyNum = 0
		this.queryByparamKeys.forEach(function (data) {
			if(data.paramValue != 'default') queryByparamKeyNum = queryByparamKeyNum + 1
		})
		if(queryByparamKeyNum > 0){
			className = 'app-list-inventory-modalLong'
        }
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: className,
			wrapClassName: 'card-archive',
			width: 800,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id,
			})
		});
		if (ret) {
            return ret
		}
    };

    handSynchronous = async () => {
        // console.log('同步')

        //是否月结
        const isHasSettle = this.metaAction.gf('data.other.isMonthlyClosed')
        const beginDate = this.metaAction.gf('data.other.beginDate')
        let year = beginDate.split('-')[0]
        let month = beginDate.split('-')[1]
        if (isHasSettle) {
            this.metaAction.toast('error', `${year}年${month}月已结账，无法进行此操作`)
            return 
        }

        // 判断是否有可同步的数据
        const details = this.metaAction.gf('data.form.details').toJS()
        if (details && details.length == 0) {
            this.metaAction.toast('error','没有存货档案，无法同步科目期初余额')
            return 
        }
        
        //生成凭证设置-----存货科目是否启用明细科目
        const isEnable = this.metaAction.gf('data.other.flag')
        if (isEnable && isEnable == "NEED_SET_INVENTORYACCOUNT") {
            const isSet = await this.metaAction.modal('confirm',{
                width: 450,
                content: '请先设置存货科目启用明细科目，才可以期初同步对应科目',
                okText: '生成凭证设置',
                bodyStyle: { padding: 24, fontSize: 12 },
            })

            if (isSet) {
                this.component.props.setPortalContent &&
                this.component.props.setPortalContent('生成凭证设置', 
                    'ttk-ba-app-basetting', {accessType: 1})
            }
        } else {
            this.metaAction.sf('data.loading', true)
            const isTongBu = await this.metaAction.modal('confirm', {
                width: 450,
                content: `${year}年${month}月的科目期初余额将自动同步到存货期初，是否确定同步？`
            })
            if (isTongBu) {
                // 商品，半成品，原材料，周转材料四种存货分类的，存货档案的对应科目是否有值
                const res = await this.webapi.warehouseBegin.synchronization({year, month})
                this.metaAction.sf('data.loading', false)
                if (res) {
                    let unSetRelateAccountsInventorys = res.unSetRelateAccountsInventorys || []
                    let glAccounts = res.glAccountDtos || []
                    if (unSetRelateAccountsInventorys && unSetRelateAccountsInventorys.length) {
                        const result = await this.metaAction.modal('show',{
                            title: '存货档案对应科目设置',
                            width: 700,
                            wrapClassName: 'subjectSetCss',
                            children: <InventorySubjectSet 
                            handleLoad={this.handleLoad} 
                            addSubject={this.addSubject}
                            glAccounts={fromJS(glAccounts).toJS()}
                            unSetRelateAccountsInventorys={fromJS(unSetRelateAccountsInventorys).toJS()}
                            handleOk={this.handleOk}/>
                        })
                        if (!result) {
                            this.refresh()
                            this.metaAction.toast('success', '同步成功')
                        }
                    } else {
                        this.refresh()
                        this.metaAction.toast('success', '同步成功')
                    }
                }
            }
        }

    }

    //新增科目
	addSubject = async (str) => {
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
			let account = await this.webapi.warehouseBegin.account(),arg = {}
			arg.glAccounts = account.glAccounts
			arg.addItem = ret
            return arg
		}
    }
    
    handleOk = async(isHave, list) => {
        if (isHave) {
            this.metaAction.toast('error', '全部设置后才能同步科目期初')
            return false
        }

        if (list && list.length) {
            let parmasList = list.map(item => {
                let obj = {}
                obj.id = item.inventoryId
                obj.inventoryRelatedAccountId = item.inventoryRelatedAccountId
                return obj
            })

            const res = await this.webapi.warehouseBegin.inventorySubject(parmasList)
            if (res) {
                this.refresh()
                this.metaAction.toast('success', '同步成功')
            }
        }
    }

    // 暂估期初
    handleAccountRadioValueChange = async() => {
        let start = this.metaAction.gf('data.start')

        if(start) {
           //进入暂估期初
           let date = this.metaAction.gf('data.other.beginDate')
           let form = this.metaAction.gf('data.form').toJS()

           let filter = {}
           filter.beginDate = moment(date).startOf('month').format('YYYY-MM-DD')
           filter.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
           filter.initData = true
           filter.propertyId = form.estimateInventoryProperty ? form.estimateInventoryProperty : ''
           filter.search = form.searchInputEstimate ? form.searchInputEstimate : ''
           
           
           const queryList = await this.webapi.warehouseBegin.queryList(filter)
        //    const supplier = await this.webapi.warehouseBegin.supplier()
        //    const inventory = await this.webapi.warehouseBegin.inventory()

        //    queryList.supplier = supplier
        //    queryList.inventory = inventory

           this.injections.reduce('estimateLoad', queryList)
           this.metaAction.sf('data.addSave', false)
        }else {
           //进入存货期初
        }
        this.metaAction.sf('data.start', !start)
    }

    //新增
    addClick = () => {
        let form = this.metaAction.gf('data.form').toJS()
        let date = this.metaAction.gf('data.other.beginDate')
        let addSave = this.metaAction.gf('data.addSave')//addSave   新增开关，防止新增两条

        if(addSave) {
            this.metaAction.toast('error', '有未保存的新增数据，请先保存')
            return false
        }

        let beginDate = moment(date).startOf('month').format('YYYY-MM-DD')
        let newArr = {
            businessDate : beginDate,
            codePrefix: 'ZQ',
            supplierId: '',
            inventoryId: "",
            amount: "",
            quantity: '',
            price: '',
        }
   
        form.estimateList.push(newArr)
        this.metaAction.sf('data.form', fromJS(form))

        this.metaAction.sfs({
            'data.form' : fromJS(form),
            'data.addSave' : true
        })
    }

    getBeginListEstimate = (value) => {
        if(value == undefined) {
            this.metaAction.sf('data.form.estimateInventoryProperty', '')
        }else {
            this.metaAction.sf('data.form.estimateInventoryProperty', value.id)
        }
        this.refreshEstimate()
    }

    searchListEstimate = (value) => {
        this.metaAction.sf('data.form.searchInputEstimate', value)
        this.refreshEstimate()
    }

    //刷新
    refreshEstimate = async() => {
        let date = this.metaAction.gf('data.other.beginDate')
        let form = this.metaAction.gf('data.form').toJS()

        let filter = {}
        filter.beginDate = moment(date).startOf('month').format('YYYY-MM-DD')
        filter.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
        filter.initData = true
        filter.propertyId = form.estimateInventoryProperty ? form.estimateInventoryProperty : ''
        filter.search = form.searchInputEstimate ? form.searchInputEstimate : ''
        
        
        const queryList = await this.webapi.warehouseBegin.queryList(filter)
        this.injections.reduce('estimateLoad', queryList)
        this.metaAction.sf('data.addSave', false)
    }

    onFieldChangeEstimate = (name, index, value) => {
        if (name == "propertyId") {
            // this.metaAction.sf(`data.form.estimateList.${index}.propertyId`, value)
            this.metaAction.sfs({
                [`data.form.estimateList.${index}.propertyId`]: value,
                [`data.form.estimateList.${index}.propertyNameStyle`]: false,
                [`data.form.estimateList.${index}.inventoryId`]: '',
                [`data.form.estimateList.${index}.inventoryCode`]: '',
                [`data.form.estimateList.${index}.specification`]: '',
                [`data.form.estimateList.${index}.unitName`]: '',
            })
        }else if(name == 'inventoryId') {
            let inventory = this.metaAction.gf('data.other.inventory').toJS()
            let arr = inventory.find(v => v.id == value)
           
            this.metaAction.sfs({
                [`data.form.estimateList.${index}.inventoryId`]: value,
                [`data.form.estimateList.${index}.propertyId`]: arr.propertyId,
                [`data.form.estimateList.${index}.inventoryCode`]: arr.code,
                [`data.form.estimateList.${index}.specification`]: arr.specification,
                [`data.form.estimateList.${index}.unitName`]: arr.unitName,
                [`data.form.estimateList.${index}.propertyNameStyle`]: false,
                [`data.form.estimateList.${index}.name1Style`]: false,
            })
        }else if(name == 'supplierId') {
            // this.metaAction.sf(`data.form.estimateList.${index}.supplierId`, value)
            this.metaAction.sfs({
                [`data.form.estimateList.${index}.supplierId`]: value,
                [`data.form.estimateList.${index}.supplierStyle`]: false,
            })
        }
    }

    //保存
    saveEstimate = async() => {
        let form = this.metaAction.gf('data.form').toJS()
        let addSave = this.metaAction.gf('data.addSave')

        if(form.estimateList.length) {
            for (var i = 0; i<form.estimateList.length;i++){
                if(form.estimateList[i].propertyId == '' || form.estimateList[i].propertyId == undefined) {
                    this.metaAction.sf(`data.form.estimateList.${i}.propertyNameStyle`, true)
                    this.metaAction.toast('error', '存货分类不能为空')
                    return false
                }else if(form.estimateList[i].inventoryId == '') {
                    this.metaAction.sf(`data.form.estimateList.${i}.name1Style`, true)
                    this.metaAction.toast('error', '存货名称不能为空')
                    return false
                }else if(form.estimateList[i].supplierId == '') {
                    this.metaAction.sf(`data.form.estimateList.${i}.supplierStyle`, true)
                    this.metaAction.toast('error', '供应商不能为空')
                    return false
                }
            }
        } else {
            this.metaAction.toast('error', '当前没有数据')
            return false
        }

        //判断新增数据是否重复
        if(addSave && form.estimateList.length != 1) {
            let lastcode = form.estimateList[form.estimateList.length-1].inventoryCode,
                lastId = form.estimateList[form.estimateList.length-1].inventoryId,
                lastSupplierId = form.estimateList[form.estimateList.length-1].supplierId

            for (var i=0;i<form.estimateList.length-1;i++) {
                if(form.estimateList[i].inventoryCode == lastcode && form.estimateList[i].inventoryId == lastId && form.estimateList[i].supplierId == lastSupplierId) {
                    this.metaAction.toast('error', '已有相同数据，不能重复保存')
                    return false
                }
            }
        }

        const batchCreateAndUpdate = await this.webapi.warehouseBegin.batchCreateAndUpdate(form.estimateList)
        if (batchCreateAndUpdate) {
            this.metaAction.toast('success', '保存成功')
            this.metaAction.sf('data.addSave', false)

            this.refreshEstimate()
        }
    }

    calcEstimate = (fieldName, rowIndex, rowData) => (v) => {
        if (fieldName === 'price') {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
            this.priceChangeEstimate(rowIndex, rowData, v)
        } else if (fieldName === 'amount') {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.99
            }
            this.amountChangeEstimate(rowIndex, rowData, v)
        } else if (fieldName === 'quantity') {
            if (Number(v) > 9999999999.99) {
                v = 9999999999.999999
            }
            this.quantityChangeEstimate(rowIndex, rowData, v)
        }
    }

    priceChangeEstimate = (rowIndex, rowData, v) => {
        let price = utils.number.round(v, 6),
            quantity = utils.number.round(rowData.quantity, 6),
            amount = utils.number.round(rowData.amount, 2)

        if (quantity) amount = utils.number.round(quantity * price, 2)
        this.metaAction.sfs({
            [`data.form.estimateList.${rowIndex}.price`]: price,
            [`data.form.estimateList.${rowIndex}.amount`]: amount,
            [`data.form.estimateList.${rowIndex}.periodBeginIsSync`]: null
        })
    }
    amountChangeEstimate = (rowIndex, rowData, v) => {
        let amount = utils.number.round(v, 2),
            quantity = utils.number.round(rowData.quantity, 6),
            price = utils.number.round(rowData.price, 6)

        if (quantity != 0) {
            price = utils.number.round(amount / quantity, 6)
        }
        this.metaAction.sfs({
            [`data.form.estimateList.${rowIndex}.amount`]: amount,
            [`data.form.estimateList.${rowIndex}.price`]: price,
            [`data.form.estimateList.${rowIndex}.periodBeginIsSync`]: null
        })
    }
    quantityChangeEstimate = (rowIndex, rowData, v) => {
        let quantity = utils.number.round(v, 6),
            price = utils.number.round(rowData.price, 6),
            amount = utils.number.round(rowData.amount, 2)

        if (amount) price = utils.number.round(amount / quantity, 6)
        if (price) amount = utils.number.round(price * quantity, 2)
        this.metaAction.sfs({
            [`data.form.estimateList.${rowIndex}.quantity`]: quantity,
            [`data.form.estimateList.${rowIndex}.amount`]: amount,
            [`data.form.estimateList.${rowIndex}.price`]: price,
            [`data.form.estimateList.${rowIndex}.periodBeginIsSync`]: null
        })
    }

    //select获得焦点
    getFocusInventory = (index, list) => {
        const inventoryAll = this.metaAction.gf('data.other.inventorys').toJS();
        const propertyId = this.metaAction.gf(`data.form.estimateList.${index}.propertyId`)
        if (propertyId) {
            const inventory = inventoryAll.filter(o => o.propertyId == propertyId);
            this.metaAction.sf('data.other.inventory', fromJS(inventory));
        } else {
            this.metaAction.sf('data.other.inventory', fromJS(inventoryAll));
        }
    }

    redCellBorder = (cell, index) => {
        let _redCellStyle = this.metaAction.gf(`data.form.estimateList.${index}.${cell}`)
        if (_redCellStyle) {
            return 'redBorder'
        }
        return ''
    }

    // 导出
    exportEstimate = async () => {
        let date = this.metaAction.gf('data.other.beginDate')
        let form = this.metaAction.gf('data.form').toJS()

        let filter = {}
        filter.beginDate = moment(date).startOf('month').format('YYYY-MM-DD')
        filter.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
        filter.initData = true
        filter.propertyId = form.estimateInventoryProperty ? form.estimateInventoryProperty : ''
        filter.search = form.searchInputEstimate ? form.searchInputEstimate : ''

        if (!form.estimateList.length) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return false
        } else {
            let res = await this.webapi.warehouseBegin.exportEstimate(filter)
        }
    }
    //打印
    printEstimate = async () => {
        let date = this.metaAction.gf('data.other.beginDate')
        let form = this.metaAction.gf('data.form').toJS()

        let filter = {}
        filter.beginDate = moment(date).startOf('month').format('YYYY-MM-DD')
        filter.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
        filter.initData = true
        filter.propertyId = form.estimateInventoryProperty ? form.estimateInventoryProperty : ''
        filter.search = form.searchInputEstimate ? form.searchInputEstimate : ''

        if (!form.estimateList.length) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return false
        } else {
            let res = await this.webapi.warehouseBegin.printEstimate(filter)
        }
    }

    // 导入
    importsEstimate = async () => {
        let isMonthlyClosed = this.metaAction.gf('data.other.isMonthlyClosed')  // 已经月结不允许导入
        const ret = await this.metaAction.modal('show', {
            title: '暂估期初导入',
            width: 560,
            okText: '导入',
            children: this.metaAction.loadApp('ttk-scm-app-estimate-import', {
                store: this.component.props.store,
                isMonthlyClosed
            }),
        })
        if (ret) {
            this.refreshEstimate()
            // const supplier = await this.webapi.warehouseBegin.supplier()
            // const inventory = await this.webapi.warehouseBegin.inventory()

            // this.metaAction.sfs({
            //     'data.other.supplier': fromJS(supplier),
            //     'data.other.inventory': fromJS(inventory),
            //     'data.other.inventorys': fromJS(inventory),
            // })
        }
    }

    addArchive = async (fieldName ,index) => {
        switch (fieldName) {
            case 'supplier':
                await this.voucherAction.addSupplier(`data.other.${fieldName}s`)
                this.addItemToState(fieldName, index)
                break;
            case 'inventory':
                let inventoryItem = await this.voucherAction.addInventory('inventoryItem', 'get')
                let inventory = this.metaAction.gf('data.other.inventory').toJS()

                if (inventoryItem) {
                    inventory.push(inventoryItem)

                    this.metaAction.sfs({
                        [`data.form.estimateList.${index}.inventoryId`]: inventoryItem.id,
                        [`data.form.estimateList.${index}.propertyId`]: inventoryItem.propertyId,
                        [`data.form.estimateList.${index}.inventoryCode`]: inventoryItem.code,
                        [`data.form.estimateList.${index}.specification`]: inventoryItem.specification,
                        [`data.form.estimateList.${index}.unitName`]: inventoryItem.unitName,
                        [`data.form.estimateList.${index}.propertyNameStyle`]: false,
                        [`data.form.estimateList.${index}.name1Style`]: false,
                        'data.other.inventory': fromJS(inventory),
                        'data.other.inventorys': fromJS(inventory),
                    })
                }
                break;
            default:
                break;
        }
    }

    addItemToState = (fieldName,index) => {
        const res = this.metaAction.gf(`data.other.${fieldName}s`) && this.metaAction.gf(`data.other.${fieldName}s`).toJS()
        if (res) {
            const list = this.metaAction.gf(`data.other.${fieldName}`).toJS()
            list.push(res)
            
            this.metaAction.sfs({
                [`data.form.estimateList.${index}.supplierId`]: res.id,
                [`data.form.estimateList.${index}.supplierStyle`]: false,
                'data.other.supplier': fromJS(list),
            })
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        // voucherActionG = GridDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
