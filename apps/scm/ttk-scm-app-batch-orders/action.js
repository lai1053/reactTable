import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, Select, DatePicker, Cascader, Form, Button, LoadingMask } from 'edf-component'
import { fetch, date, number, environment } from 'edf-utils'
import { Map, fromJS, toJS } from 'immutable'
import moment from 'moment'
import utils from 'edf-utils'
import RedDashed from './components/RedDashed'

const browser = environment.getBrowserVersion()

const Option = Select.Option
const FormItem = Form.Item
let flag = true
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('enlargeClick', () => this.onResize({}))
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init')
        this.load()
    }

    onTabFocus = async (params) => {
        const allList = [
            this.webapi.customer({ entity: { isEnable: true } }),
            this.webapi.supplier({ entity: { isEnable: true } }),
            this.webapi.person({ entity: { isEnable: true } }),
            this.voucherAction.getDepartment({ entity: { isEnable: true } }, 'data.other.department'),
            this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project'),
        ]
        let [customerList, supplierList, personList] = await Promise.all(allList)
        const { department, project } = this.metaAction.gf('data.other').toJS()

        let { reconciliatioIds, bankAccountId } = params.toJS()
        let response = await this.webapi.getList({ reconciliatioIds, bankAccountId })
        let { bankReconciliatios } = response

        if (response.customers && response.customers.length) customerList.list = customerList.list.concat(response.customers)
        if (response.suppliers && response.suppliers.length) supplierList.list = supplierList.list.concat(response.suppliers)

        let list = [], oldBankReconciliatios = this.metaAction.gf('data.bankReconciliatios').toJS()
        //debugger
        if (params.toJS().openType == "tabChange") {
            oldBankReconciliatios.map(item => {
                let bankReconcArr = bankReconciliatios.filter(option => item.id == option.id)
                if (bankReconcArr.length) {
                    if(bankReconcArr[0].defaultCustomer) {
                        item.defaultCustomer = bankReconcArr[0].defaultCustomer
                        if(item.required == 'customer') {
                            item.supplierCustomerId = item.defaultCustomer.id
                            item.supplierCustomerList = customerList.list
                        }
                    }
                    if(bankReconcArr[0].defaultSupplier) {
                        item.defaultSupplier = bankReconcArr[0].defaultSupplier
                        if(item.required == 'supplier') {
                            item.supplierCustomerId = item.defaultSupplier.id
                            item.supplierCustomerList = supplierList.list
                        }
                    }
                    
                    list.push(item)
                }
            })
        } else {
            bankReconciliatios.map((item, index) => {
                item.accountDate = item.accountDate ? date.transformMomentDate(item.accountDate) : date.transformMomentDate(item.businessDate)
                if (item.defaultBusinessType) {
                    let pid = item.defaultBusinessType.pid, id = item.defaultBusinessType.id
                    if(pid){
                        item.businessTypeId = [pid, id]
                    }else{
                        item.businessTypeId = [id]
                    }

                    item = this.getDefaultSupplierCustomer(item, customerList, supplierList, personList, response.bankAccounts)
                }
                return list = list.concat(item, item)
            })

            list.forEach((item) => {
                let {
                    departmentId, departmentName, projectId, projectName,
                } = item
                item = this.checkDetailsOptionIsHave({
                    item,
                    arr: department,
                    id: departmentId,
                    name: departmentName,
                    key: 'department'
                })
                item = this.checkDetailsOptionIsHave({
                    item,
                    arr: project,
                    id: projectId,
                    name: projectName,
                    key: 'project'
                })
                if (item.supplierCustomerId) {
                    let arr = [], isHasValue
                    if (item.required == "person") {
                        arr = personList.list
                    } else if (item.required == "customer") {
                        arr = customerList.list
                    } else if (item.required == "supplier") {
                        arr = supplierList.list
                    }
                    arr.map(m => { if (m.id == item.supplierCustomerId) { isHasValue = true } })
                    if (!isHasValue) item.supplierCustomerId = ''
                }
            })
        }

        this.metaAction.sf('data.bankReconciliatios', fromJS(list))
        this.metaAction.sfs({
            'data.bankReconciliatios': fromJS(list),
            'data.defalutcustomers': fromJS(response.customers),
            'data.defalutsuppliers': fromJS(response.suppliers),
            'data.other.tableCheckbox.checkboxValue': fromJS([])
        })
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    checkDetailsOptionIsHave = ({ item, arr, id, name, key }) => {
        if (!id) return item
        let isHasValue
        arr.map(m => { if (m.id == item[key + 'Id']) isHasValue = true })
        if (!isHasValue) {
            item[key + 'Id'] = ''
            item[key + 'Name'] = ''
        }
        return item
    }

    load = async (props) => {
        LoadingMask.show()
        let { reconciliatioIds, bankAccountId } = props || this.component.props
        let response = await this.webapi.getList({ reconciliatioIds, bankAccountId })
        let { bankAccount, bankReconciliatios, payBusinessType, receiveBusinessType, EnableDate, SystemDate } = response
        let list = [],
            customerList = await this.webapi.customer({ entity: { isEnable: true } }),
            supplierList = await this.webapi.supplier({ entity: { isEnable: true } }),
            personList = await this.webapi.person({ entity: { isEnable: true } })

        const allList = [
            this.voucherAction.getDepartment({ entity: { isEnable: true } }, 'data.other.department'),
            this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project'),
        ]
        //debugger
        if (response.customers && response.customers.length) customerList.list = customerList.list.concat(response.customers)
        if (response.suppliers && response.suppliers.length) supplierList.list = supplierList.list.concat(response.suppliers)

        bankReconciliatios = bankReconciliatios.map((item, index) => {
            // item.index = index+1
            item.accountDate = item.accountDate ? date.transformMomentDate(item.accountDate) : date.transformMomentDate(item.businessDate)
            if (item.defaultBusinessType) {
                let pid = item.defaultBusinessType.pid, id = item.defaultBusinessType.id
                if(pid){
                    item.businessTypeId = [pid, id]
                }else{
                    item.businessTypeId = [id]
                }
                
                item = this.getDefaultSupplierCustomer(item, customerList, supplierList, personList, response.bankAccounts)
            }
            return list = list.concat(item, item)
        })
        payBusinessType = this.formatData(payBusinessType)
        receiveBusinessType = this.formatData(receiveBusinessType)

        let contextDate = SystemDate,
            currentOrg = this.metaAction.context.get("currentOrg")
        if (currentOrg.periodDate) {
            contextDate = moment(currentOrg.periodDate).endOf('month')
        }
        //debugger
        this.metaAction.sfs({
            'data.bankReconciliatios': fromJS(list),
            'data.payBusinessType': fromJS(payBusinessType),
            'data.receiveBusinessType': fromJS(receiveBusinessType),
            'data.name': bankAccount.name,
            'data.bankAccountId': bankAccount.id,
            'data.disabledDate': date.transformMomentDate(EnableDate),
            'data.systemDate': date.transformMomentDate(SystemDate),
            'data.businessDate': date.transformMomentDate(contextDate),
            'data.defalutcustomers': fromJS(response.customers),
            'data.defalutsuppliers': fromJS(response.suppliers),
            'data.bankAccounts': fromJS(response.bankAccounts)
        })
        setTimeout(() => {
            this.onResize()
        }, 20)
        LoadingMask.hide()
    }

    getDefaultSupplierCustomer = (item, customerList, supplierList, personList, bankAccounts) => {
        let supplierCustomer

        if (item.defaultBusinessType) {
            if(item.defaultBusinessType.calcObject){
                item.required = item.defaultBusinessType.calcObject
                if (item.required == 'customer') {
                    supplierCustomer = customerList
                    if(item.defaultCustomer) item['supplierCustomerId'] = item.defaultCustomer.id
                } else if (item.required == 'supplier') {
                    supplierCustomer = supplierList
                    if(item.defaultSupplier) item['supplierCustomerId'] = item.defaultSupplier.id
                } else if (item.required == 'person') {
                    supplierCustomer = personList
                    if(item.personId) item['supplierCustomerId'] = item.personId
                }
            }else if(item.defaultBusinessType.id == 3001003){
                item.required = 'accountBankAccount'
                supplierCustomer = { list: bankAccounts }
                if(item.accountBankAccountId) item['supplierCustomerId'] = Number(item.accountBankAccountId)
            }
        }
        if (supplierCustomer && supplierCustomer.list) {
            item.supplierCustomerList = supplierCustomer.list
        }
        return item
    }

    //日期组件不可用日期
    getDisabledDate = (current) => {
        var disabledDate = this.metaAction.gf('data.disabledDate')
        return current && current.valueOf() < disabledDate
    }

    returnSep = (record, index) => {
        let obj = {
            children: record.seq,
            props: {},
        };
        if (index % 2 == 0) {
            obj.props.rowSpan = 2;
        } else {
            obj.props.rowSpan = 0;
        }
        return obj
    }
    //单据日期
    accountDate = (record, index) => {
        let _this = this
        return <DatePicker
            placeholder='单据日期'
            disabledDate={this.getDisabledDate}
            value={record.accountDate}
            onChange={function (e) {
                _this.injections.reduce('accountDateChange', { e, record, index })
            }} />
    }

    changeDate = (date) => {
        let list = this.metaAction.gf('data.bankReconciliatios').toJS()
        list.map(item => item.accountDate = date)
        this.metaAction.sf('data.businessDate', date)
        this.injections.reduce('load', list)
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    //收支类型
    businessType = (record, index) => {
        let options = []
        if (record.inAmount) {
            options = this.metaAction.gf('data.receiveBusinessType').toJS()
        } else {
            options = this.metaAction.gf('data.payBusinessType').toJS()
        }
        let btnAdd = {
            label: '新增',
            value: 'add'
        }

        options.push(btnAdd)

        return <FormItem className='business-type-label' label={this.getBusinessType(record, options, index)} required={true}></FormItem>
    }

    getPopupContainer = () => {
        return document.querySelector('.ant-table-body table')
    }

    getBusinessType = (record, options, index) => {
        return <Cascader placeholder='收支类型'
            value={record.businessTypeId}
            options={options}
            expandTrigger='hover'
            getPopupContainer={this.getPopupContainer}
            popupClassName="ttk-scm-app-batch-orders-Cascader"
            allowClear={false}
            onChange={(value) => this.onFieldChange(record, index, value, 'businessType')}>
        </Cascader>
    }

    //部门、项目
    renderCell = (type, record, index) => {
        if (record.required == 'accountBankAccount') {
            return <div></div>
        }
        let placeholder = ''
        switch (type) {
            case 'department':
                placeholder = '部门'
                break;
            case 'project':
                placeholder = '项目'
                break;
        }
        return <div style={{ width: '95%' }}>
            <Select style={{ width: '100%' }} placeholder={placeholder}
                value={record[type + 'Id']}
                onFocus={() => this.getList(type)}
                onChange={(value) => this.onFieldChange(record, index, value, type)}
                optionFilterProp="children"
                filterOption={this.filterOptionSummary}
                dropdownClassName="ttk-scm-app-batch-orders-selectdropdown"
                dropdownFooter={
                    <Button type='primary'
                        style={{ width: '100%', borderRadius: '0' }}
                        onClick={this.addArchives(index, type)}>新增
                    </Button>
                }
            >
                {this.selectOption(type)}
            </Select>
        </div>
    }

    renderUnit = (record, index) => {
        return <div style={{ width: '95%' }}>
            <Select style={{ width: '100%' }} placeholder='往来单位及个人'
                value={record.required ? record['supplierCustomerId'] : ""}
                showSearch
                onFocus={() => this.getList(record.required, index)}
                disabled={!record.required}
                onChange={(value) => this.onFieldChange(record, index, value, record.required, true)}
                optionFilterProp="children"
                filterOption={this.filterOptionSummary}
                dropdownClassName="ttk-scm-app-batch-orders-selectdropdown"
                dropdownFooter={
                    <Button type='primary'
                        style={{ width: '100%', borderRadius: '0' }}
                        onClick={this.addArchives(index, record.required, true)}>新增
                    </Button>
                }
            >
                {record.required ? this.selectOption(record.required, true, index) : null}
            </Select>
        </div>
    }

    addArchives = (rowIndex, type, isSupplierCustomer) => async () => {
        let title = '客户', path = 'app-card-customer', width = 700
        if (type == 'supplier') {
            path = 'app-card-vendor'
            title = '供应商'
        } else if (type == 'department') {
            path = 'app-card-department'
            title = '部门'
            width = 400
        } else if (type == 'project') {
            path = 'app-card-project'
            title = '项目'
            width = 400
        } else if (type == 'person') {
            path = 'app-card-person'
            title = '人员'
            width = 720
        } else if (type == 'accountBankAccount') {
            path = 'app-card-bankaccount'
            title = '账户'
            width = 400
        }

        const ret = await this.metaAction.modal('show', {
            title: title,
            width: width,
            children: this.metaAction.loadApp(path, {
                store: this.component.props.store
            }),
        })

        if (type != 'department') {
            if (ret && ret.isEnable) {
                this.injections.reduce("addArchives", type, rowIndex, ret, isSupplierCustomer)
            }
        } else {
            if (ret) {
                this.injections.reduce("addArchives", type, rowIndex, ret, isSupplierCustomer)
            }
        }

    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    returnTitle = (title) => {
        return <span className="td_ellipsis" title={title}>{title}</span>
    }

    //修改选择数据
    onFieldChange = async (record, index, value, type, isSupplierCustomer) => {
        let list = this.metaAction.gf('data.bankReconciliatios').toJS(),
            defalutcustomers = this.metaAction.gf('data.defalutcustomers').toJS(),
            defalutsuppliers = this.metaAction.gf('data.defalutsuppliers').toJS(), oldBusinessTypeId
        if(list[index].businessTypeId){
            oldBusinessTypeId = list[index].businessTypeId
        }
        if (isSupplierCustomer) {
            list[index]['supplierCustomerId'] = value
            this.changeTableCheckbox(record)
        } else {
            list[index][type + 'Id'] = value
        }

        if (type == 'businessType') {
            if (Array.isArray(value)) {
                if (value[0] == 'add') {
                    let title = '', incomeexpensesTabId = '', parentId

                    if (list[index]['inAmount'] != undefined) {
                        title = '新增收款类型'
                        if(oldBusinessTypeId) parentId = oldBusinessTypeId[0]
                        incomeexpensesTabId = '3001002' //收款
                    }
                    else if (list[index]['outAmount'] != undefined) {
                        if(oldBusinessTypeId[0] == 4001001){
                            title = '新增费用类型'
                            incomeexpensesTabId = '4001001' //费用
                        }else{
                            title = '新增付款类型'
                            if(oldBusinessTypeId) parentId = oldBusinessTypeId[0]
                            incomeexpensesTabId = '3001001' //付款
                        }
                    }
                    
                    const ret = await this.metaAction.modal('show', {
                        title: title,
                        wrapClassName: 'income-expenses-card',
                        width: 410,
                        okText: '确定',
                        footer: '',
                        bodyStyle: { padding: '10px 0' },
                        //closeModal: this.close,
                        //closeBack: (back) => { this.closeTip = back },
                        children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                            store: this.component.props.store,
                            incomeexpensesTabId: incomeexpensesTabId,
                            parentId
                        }),
                    })
                
                    if (ret && ret.id) {
                        ret.label = ret.name
                        ret.value = ret.id
                        let receiveBusinessType = this.metaAction.gf('data.receiveBusinessType').toJS(),
                            payBusinessType = this.metaAction.gf('data.payBusinessType').toJS()
                        list[index].businessTypeId = [ret.pid, ret.id]
                        list[index-1].businessTypeId = [ret.pid, ret.id]

                        delete list[index].required
                        list[index]['supplierCustomerId'] = ''
                        list[index].supplierCustomerList = []

                        let loadBusinessTypes
                        if (list[index]['inAmount'] != undefined) {
                            loadBusinessTypes = await this.webapi.loadBusinessTypes({voucherType: 1})
                            this.injections.reduce('update', { path: 'data.receiveBusinessType', value: this.formatData(loadBusinessTypes) })
                        }else if (list[index]['outAmount'] != undefined) {
                            loadBusinessTypes = await this.webapi.loadBusinessTypes({voucherType: 2})
                            this.injections.reduce('update', { path: 'data.payBusinessType', value: this.formatData(loadBusinessTypes) })
                        }
                        this.injections.reduce('update', { path: 'data.bankReconciliatios', value: list })
                    }

                    return
                }
            }

            let record = list[index]
            let options = []

            list[index]['supplierCustomerId'] = ''
            if(list[index].required) delete list[index].required
            if (record.inAmount) {
                options = this.metaAction.gf('data.receiveBusinessType').toJS()
            } else {
                options = this.metaAction.gf('data.payBusinessType').toJS()
            }
            if (!options || !record.businessTypeId) return

            let option, supplierCustomer = [], bankAccounts = this.metaAction.gf('data.bankAccounts').toJS()
            if (value.length == 2) {
                option = options.filter(item => item.id == record.businessTypeId[0])[0].children.filter(o => o.id == record.businessTypeId[1])
                record.required = option[0].calcObject
            }else if(value[0] == 3001003) {
                record.required = 'accountBankAccount'
            }

            if (record.required == 'customer' && record.defaultCustomer) {
                supplierCustomer = await this.webapi.customer({ entity: { isEnable: true } })
                if (defalutcustomers && defalutcustomers.length) supplierCustomer.list = supplierCustomer.list.concat(defalutcustomers)
                list[index]['supplierCustomerId'] = record.defaultCustomer.id
            } else if (record.required == 'supplier' && record.defaultSupplier) {
                supplierCustomer = await this.webapi.supplier({ entity: { isEnable: true } })
                if (defalutsuppliers && defalutsuppliers.length) supplierCustomer.list = supplierCustomer.list.concat(defalutsuppliers)
                list[index]['supplierCustomerId'] = record.defaultSupplier.id
            } else if (record.required == 'person') {
                list[index]['supplierCustomerId'] = ''
                supplierCustomer = await this.webapi.person({ entity: { isEnable: true } })
            } else if (record.required == 'accountBankAccount') {
                list[index]['supplierCustomerId'] = ''
                if (list[index].departmentId) delete list[index].departmentId
                if (list[index].projectId) delete list[index].projectId
                supplierCustomer.list = bankAccounts
            } else {
                list[index]['supplierCustomerId'] = ''
            }
            if (supplierCustomer && supplierCustomer.list) {
                list[index].supplierCustomerList = supplierCustomer.list
            } else {
                list[index].supplierCustomerList = []
            }

            if (!record.required) this.changeTableCheckbox(record)
        }
        // console.log(list[index])
        this.metaAction.sf(`data.bankReconciliatios`, fromJS(list))
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    //摘要和对方户名列修改时自动勾上复选框
    changeTableCheckbox = (record) => {
        let tableCheckbox = this.metaAction.gf('data.other.tableCheckbox').toJS()
        let arr = tableCheckbox.checkboxValue.filter(item => item == record.id)
        //console.log(tableCheckbox.checkboxValue)
        if (!arr.length) {
            tableCheckbox.checkboxValue.push(record.id)
            this.injections.reduce('update', { path: 'data.other.tableCheckbox', value: tableCheckbox })
        }
    }

    //获取相应档案列表
    getList = async (type, index) => {
        let list = this.metaAction.gf('data.bankReconciliatios').toJS(),
            defalutcustomers = this.metaAction.gf('data.defalutcustomers').toJS(),
            defalutsuppliers = this.metaAction.gf('data.defalutsuppliers').toJS(), supplierCustomerList, res
        //debugger
        switch (type) {
            case 'customer':
                supplierCustomerList = []
                res = await this.webapi.customer({ entity: { isEnable: true } })
                if(defalutcustomers && defalutcustomers.length){
                    supplierCustomerList = defalutcustomers.concat(res.list)
                }else{
                    supplierCustomerList = res.list
                }
                
                list[index].supplierCustomerList = supplierCustomerList
                this.injections.reduce('update', { path: 'data.bankReconciliatios', value: list })
                break;
            case 'supplier':
                supplierCustomerList = []
                res = await this.webapi.supplier({ entity: { isEnable: true } })
                if(defalutsuppliers && defalutsuppliers.length){
                    supplierCustomerList = defalutsuppliers.concat(res.list)
                }else{
                    supplierCustomerList = res.list
                }
                
                list[index].supplierCustomerList = supplierCustomerList
                this.injections.reduce('update', { path: 'data.bankReconciliatios', value: list })
                break;
            case 'department':
                await this.voucherAction.getDepartment({ entity: { isEnable: true } }, `data.other.department`)
                break;
            case 'project':
                await this.voucherAction.getProject({ entity: { isEnable: true } }, `data.other.project`)
                break;
            case 'person':
                await this.voucherAction.getPerson({ entity: { isEnable: true } }, `data.bankReconciliatios.${index}.supplierCustomerList`)
                break;
            case 'accountBankAccount':
                await this.voucherAction.getBankAccount({ entity: { isEnable: true } }, `data.bankReconciliatios.${index}.supplierCustomerList`)
                break;
        }
    }

    selectOption = (path, isSupplierCustomer, index) => {
        let list = this.metaAction.gf(`data.bankReconciliatios`).toJS(),
            bankAccountId = this.metaAction.gf('data.bankAccountId')
        if (isSupplierCustomer) {
            list = list[index].supplierCustomerList
        } else {
            list = this.metaAction.gf(`data.other.${path}`).toJS()
        }
        if (!list) return
        return list.map(item => {
            return <Option disabled={path == 'accountBankAccount' && item.id == bankAccountId ? true : false} value={item.id} title={item.name}>{item.name}</Option>
        })
    }

    //格式化收付款类型数据
    formatData = (list) => {
        list.map(item => {
            item.value = item.id
            item.label = item.name
            if (item.children) {
                this.formatData(item.children)
            }
        })
        return list
    }

    getRowSelection = () => {
        return undefined
    }

    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let list = this.metaAction.gf(`data.bankReconciliatios`).toJS(), optionArr = []
        itemArr = itemArr.filter(o => o != undefined);
        let newArr = []
        itemArr.map(item => {
            if (item) {
                newArr.push(item.id)
            }
        })
        this.injections.reduce('update', {
            path: 'data.other.tableCheckbox',
            value: {
                checkboxValue: newArr,
            }
        })
    }

    //保存
    saveClick = async () => {
        let data = this.getChecked('save')
        if (!data) return false
        let option = data.reconciliatioBatchMaintenanceDtos
        LoadingMask.show()
        let res = await this.webapi.saveGenerateDocList({ dtos: option })
        LoadingMask.hide()
        this.metaAction.toast('success', '保存成功')
    }

    //下一步
    nextClick = async () => {
        let data = this.getChecked()
        if (!data) return false
        let option = data.reconciliatioBatchMaintenanceDtos
        LoadingMask.show()
        let res = await this.webapi.saveGenerateDocList({ dtos: option })

        //是否弹出往来单位确认
        let hasCorrespondentUnitsList = await this.webapi.hasCorrespondentUnitsList(option)

        if (hasCorrespondentUnitsList) {
            LoadingMask.hide()
            if (flag) {
                flag = false
                const ret = await this.metaAction.modal('show', {
                    title: '往来单位确认',
                    width: 900,
                    cancelText: '保存',
                    okText: '生成单据',
                    wrapClassName: 'correspondent-unit',
                    bodyStyle: {
                        height: 420,
                    },
                    closeModal: this.close,
                    closeBack: (back) => { this.closeTip = back },
                    footer: '',
                    children: this.metaAction.loadApp('ttk-scm-app-matching-unit', {
                        store: this.component.props.store,
                        initData: data,
                        defalutcustomers: this.metaAction.gf('data.defalutcustomers').toJS(),
                        defalutsuppliers: this.metaAction.gf('data.defalutsuppliers').toJS()
                    })
                })
                if (ret || ret == false) {
                    flag = true
                }
            }
        } else {
            //生成单据
            let response = await this.webapi.batchGenerateDocNew(data)
            LoadingMask.hide()
            if (response.fail && response.fail.length) {
                this.metaAction.toast('warning', this.getContent(response.fail))
            } else {
                this.metaAction.toast('success', '生成单据成功')
                this.component.props.onlyCloseContent('ttk-scm-app-batch-orders')
                this.component.props.setPortalContent('银行对账单', 'ttk-scm-add-bank-statement-list', { accessType: 1, initData: { type: 'orders' } })
            }
        }
    }

    close = (ret) => {
        this.closeTip()
        if (ret === true) {
            this.component.props.onlyCloseContent('ttk-scm-app-batch-orders')
            this.component.props.setPortalContent('银行对账单', 'ttk-scm-add-bank-statement-list', { accessType: 1, initData: { type: 'orders' } })
        } else if (ret === null) {
            this.load()
        }
    }

    getChecked = (name) => {
        let tableCheckbox = this.metaAction.gf('data.other.tableCheckbox').toJS(),
            bankReconciliatios = this.metaAction.gf(`data.bankReconciliatios`).toJS(), arr = [], list = [],
            businessType = [], correspondentUnits = [], zhCorrespondentUnits = [], reconciliatioBatchMaintenanceDtos = [],
            bankAccountId = this.metaAction.gf('data.bankAccountId')

        //保存时全部
        if (name == 'save') {
            bankReconciliatios.map((item, index) => {
                if (index % 2 == 1) list.push(item)
            })
            //下一步是选择的
        } else {
            bankReconciliatios.map((item, index) => {
                if (index % 2 == 1) {
                    arr = tableCheckbox.checkboxValue.find(m => m == item.id)
                    if (arr) list.push(item)
                }
            })
        }

        if (!list.length) {
            this.metaAction.toast('warning', '请选择要生单的数据')
            return false
        }

        list.map((item) => {
            let obj = {
                personId: null,
                customerId: null,
                customerName: null,
                supplierId: null,
                supplierName: null,
                departmentId: null,
                projectId: null,
                accountBankAccountId: null
            }
            item[`${item.required}Id`] = item.supplierCustomerId
            obj[`${item.required}Id`] = item.supplierCustomerId

            if (item.required == 'customer') {
                let customersArr = item.supplierCustomerList.filter(o => o.id == item[`${item.required}Id`])
                if (customersArr.length) obj.customerName = customersArr[0].name
            } else if (item.required == 'supplier') {
                let suppliersArr = item.supplierCustomerList.filter(o => o.id == item[`${item.required}Id`])
                if (suppliersArr.length) obj.supplierName = suppliersArr[0].name
            }
            obj.id = item.id
            obj.seq = item.seq

            // 收支类型未填处理及往来单位及个人未填
            if (!item.businessTypeId) {
                businessType.push(item.seq)
                return false
            }
            if (item.required && !item[`${item.required}Id`]) {
                if(item.businessTypeId && item.businessTypeId[0] == 3001003){
                    zhCorrespondentUnits.push(item.seq)
                }else{
                    correspondentUnits.push(item.seq)
                }
                return false
            }
            obj.accountDate = item.accountDate.format('YYYY-MM-DD')
            obj.businessTypeId = item.businessTypeId.slice(-1)[0]
            obj.departmentId = item.departmentId
            obj.projectId = item.projectId

            reconciliatioBatchMaintenanceDtos.push(obj)
        })

        if (businessType.length != 0) {
            this.metaAction.toast('warning', `第${this.getNumberFormat(businessType)}条收支类型未填`)
            return false
        }
        if (correspondentUnits.length != 0 || zhCorrespondentUnits.length != 0) {
            if(correspondentUnits.length != 0 && zhCorrespondentUnits.length != 0) {
                this.metaAction.toast('warning', `第${this.getNumberFormat(correspondentUnits)}条往来单位及个人未填, 第${this.getNumberFormat(zhCorrespondentUnits)}条账户未填`)
            }else if(correspondentUnits.length != 0){
                this.metaAction.toast('warning', `第${this.getNumberFormat(correspondentUnits)}条往来单位及个人未填`)
            }else{
                this.metaAction.toast('warning', `第${this.getNumberFormat(zhCorrespondentUnits)}条账户未填`)
            }
            return false
        }

        return { bankAccountId, reconciliatioBatchMaintenanceDtos }
    }

    getContent = (fail) => {
        if (fail.length) {
            return <div style={{ textAlign: 'left' }}>
                {
                    fail.map(item => {
                        return <p style={{ marginBottom: '0' }}>{item.message}</p>
                    })
                }
            </div>
        }
    }

    getNumberFormat = (data) => {
        const arr = data.map(item => parseInt(item))
        let a = -1
        let b = 0
        const sumArr = []
        if (arr.length == 1) return arr[0]
        arr.forEach((item, index) => {
            if (a == -1) {
                a = index
                b = 1
            } else {
                if (item == arr[index - 1] + 1 && index != arr.length - 1) {
                    b++
                } else {
                    if (index == arr.length - 1) {
                        b++
                    }
                    let lens = arr.slice(a, a + b)
                    if (lens.length > 1) {
                        sumArr.push(`${lens[0]}-${lens[lens.length - 1]}`)
                    } else if (lens.length == 1) {
                        sumArr.push(`${lens[0]}`)
                    }
                    a = index
                    b = 1
                }
            }
        })
        return sumArr.join(',')
    }

    onResize = (e) => {
        if (browser.edge) {
            const dom = document.querySelector('.ttk-scm-app-batch-orders-body')
            if (dom) {
                dom.style.overflow = 'auto'
            }
            return
        }
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('ttk-scm-app-batch-orders-body', 'ant-table-thead', 2, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }
            // const header = tableCon.getElementsByClassName(head)[0]
            // const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            // const pre = this.metaAction.gf(path).toJS()
            // const y = tableCon.offsetHeight - header.offsetHeight - num
            // const bodyHeight = body.offsetHeight
            // if (bodyHeight > y && y != pre.y) {
            //     this.metaAction.sf(path, fromJS({ ...pre, y }))
            // } else if (bodyHeight < y && pre.y != null) {
            //     this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            // } else {
            //     return false
            // }
            let tbody = document.getElementsByClassName('ant-table-tbody')[0]
            let tableOption = this.metaAction.gf('data.tableOption').toJS()

            if (tableCon && tbody) {
                const num = tableCon.offsetHeight - tbody.offsetHeight
                if (num < 36) {

                    const height = tableCon.offsetHeight - 36
                    tableOption = {
                        ...tableOption,
                        y: height
                    }

                    this.metaAction.sf(path, fromJS(tableOption))
                } else {
                    delete tableOption.y
                    this.metaAction.sf(path, fromJS(tableOption))
                }
            }
        } catch (err) {
            console.log(err)
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

    renderFixedNumber = (text) => {
        if (!text) return ''
        return <span className='td_ellipsis'>{number.format(text, 2)}</span>
    }

    renderColumns = () => {
        return [{
            title: '序号',
            dataIndex: 'sep',
            key: 'sep',
            rowSpan: 2,
            width: 43,
            className: 'table-seq',
            render: (text, record, index) => this.returnSep(record, index)
        }, {
            title: '交易日期',
            dataIndex: 'businessDate',
            key: 'businessDate',
            width: "15%",
            render: (text, record, index) => {
                return index % 2 == 0 ? record.businessDate : this.accountDate(record, index)
            }
        }, {
            title: '摘要',
            dataIndex: 'memo',
            key: 'memo',
            width: 218,
            render: (text, record, index) => {
                return index % 2 == 0 ? this.returnTitle(record.memo) : this.businessType(record, index)
            }
        }, {
            title: '对方户名',
            dataIndex: 'reciprocalAccountName',
            key: 'reciprocalAccountName',
            width: 222,
            render: (text, record, index) => {
                return index % 2 == 0 ? this.returnTitle(record.reciprocalAccountName) : this.renderUnit(record, index)
            }
        }, {
            title: '收入',
            dataIndex: 'inAmount',
            className: 'amount-right',
            key: 'inAmount',
            className: 'table-align-right',
            width: "15%",
            render: (text, record, index) => {
                return index % 2 == 0 ? this.renderFixedNumber(record.inAmount) : this.renderCell('department', record, index)
            }
        }, {
            title: '支出',
            dataIndex: 'outAmount',
            className: 'amount-right',
            key: 'outAmount',
            className: 'table-align-right',
            width: "15%",
            render: (text, record, index) => {
                return index % 2 == 0 ? this.renderFixedNumber(record.outAmount) : this.renderCell('project', record, index)
            }
        }, {
            title: '回单号',
            dataIndex: 'receiveCode',
            key: 'receiveCode',
            width: "20%",
            render: (text, record, index) => {
                return index % 2 == 0 ? record.receiveCode : ''
            }
        }]
    }

    /**
     * 收支类型修改
     */
    changeBussnisType = async () => {
        let tableCheckbox = this.metaAction.gf('data.other.tableCheckbox').toJS(),
            bankReconciliatios = this.metaAction.gf(`data.bankReconciliatios`).toJS(),
            arr = [], list = [], options = [], inAmount = [], outAmount = []

        tableCheckbox.checkboxValue.map(item => {
            arr = bankReconciliatios.filter(m => m.id == item)
            if (arr[1].inAmount && arr[1].inAmount > 0) {
                inAmount.push(arr[1])
            }
            if (arr[1].outAmount && arr[1].outAmount > 0) {
                outAmount.push(arr[1])
            }
            list.push(arr[1])
        })

        if (!list.length) {
            this.metaAction.toast('warning', '请选择要修改的数据')
            return false
        }

        if (tableCheckbox.checkboxValue.length == inAmount.length) {
            options = this.metaAction.gf('data.receiveBusinessType').toJS()
        } else if (tableCheckbox.checkboxValue.length == outAmount.length) {
            options = this.metaAction.gf('data.payBusinessType').toJS()
        } else {
            this.metaAction.toast('warning', '存在既有收入又有支出的对账单，不能匹配修改收支类型')
            return false
        }

        const ret = await this.metaAction.modal('show', {
            title: '收支类型',
            width: 420,
            cancelText: '取消',
            onOk: this.onOk,
            okText: '保存',
            footer: '',
            wrapClassName: 'ttk-scm-app-batch-orders-modal',
            children: <RedDashed that={this}
                options={options}
                list={list}
                callBack={this.submitRedDashed} />
        })
    }

    submitRedDashed = async (form) => {
        const data = form.getValue()
        let list = data.list, businessTypeId = data.businessTypeId, options = data.options, _index = undefined,
            bankReconciliatios = this.metaAction.gf(`data.bankReconciliatios`).toJS(),
            defalutcustomers = this.metaAction.gf('data.defalutcustomers').toJS(),
            defalutsuppliers = this.metaAction.gf('data.defalutsuppliers').toJS()
        const allList = [
            this.webapi.customer({ entity: { isEnable: true } }),
            this.webapi.supplier({ entity: { isEnable: true } }),
            this.webapi.person({ entity: { isEnable: true } })
        ]
        const [customer, supplier, person] = await Promise.all(allList)

        if (!options || !businessTypeId) return
        list.map((record) => {
            bankReconciliatios.map((m, n) => {
                if (m.id == record.id) {
                    _index = n
                    return
                }
            })

            bankReconciliatios[_index]['supplierCustomerId'] = ''
            bankReconciliatios[_index].businessTypeId = businessTypeId
            if(bankReconciliatios[_index].required) delete bankReconciliatios[_index].required

            let option, supplierCustomer = [], bankAccounts = this.metaAction.gf('data.bankAccounts').toJS()
            let businessTypeIdArr = options.filter(item => item.id == bankReconciliatios[_index].businessTypeId[0])
            if (businessTypeIdArr.length && businessTypeIdArr[0].children) {
                option = options.filter(item => item.id == bankReconciliatios[_index].businessTypeId[0])[0].children.filter(o => o.id == bankReconciliatios[_index].businessTypeId[1])
                bankReconciliatios[_index].required = option[0].calcObject
            }else if(businessTypeIdArr.length && businessTypeIdArr[0].id == 3001003) {
                bankReconciliatios[_index].required = 'accountBankAccount'
            }

            if (bankReconciliatios[_index].required == 'customer' && bankReconciliatios[_index].defaultCustomer) {
                if (defalutcustomers && defalutcustomers.length) {
                    supplierCustomer.list = customer.list.concat(defalutcustomers)
                }else{
                    supplierCustomer.list = customer.list
                }
                bankReconciliatios[_index]['supplierCustomerId'] = bankReconciliatios[_index].defaultCustomer.id
            } else if (bankReconciliatios[_index].required == 'supplier' && bankReconciliatios[_index].defaultSupplier) {
                if (defalutsuppliers && defalutsuppliers.length) {
                    supplierCustomer.list = supplier.list.concat(defalutsuppliers)
                }else{
                    supplierCustomer.list = supplier.list
                }
                bankReconciliatios[_index]['supplierCustomerId'] = bankReconciliatios[_index].defaultSupplier.id
            } else if (bankReconciliatios[_index].required == 'person') {
                supplierCustomer = person
            }
            if (supplierCustomer && supplierCustomer.list) {
                bankReconciliatios[_index].supplierCustomerList = supplierCustomer.list
            } else {
                bankReconciliatios[_index].supplierCustomerList = []
            }
        })

        this.injections.reduce('update', { path: "data.bankReconciliatios", value: bankReconciliatios })
        this.metaAction.toast('success', '修改成功')
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