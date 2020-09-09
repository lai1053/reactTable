import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import { Map, fromJS, toJS } from 'immutable'
import { Tree } from 'edf-component'
import { FormDecorator, Button } from 'edf-component'
import extend from './extend'
import { Promise } from 'core-js';

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
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        this.metaAction.sf('data.other.loading', true)
        let { type, properties: property = [] } = this.component.props;
        let customer, supplier, inventory, detailList, taxRateTypes, impose, inventoryTypes, revenueType, department, project
        if (type == 'addCustomer') {
            //销项
            this.metaAction.sf('data.other.visible', false);
            const resall = await Promise.all([
                this.webapi.supplyData.customer(),
                this.webapi.supplyData.inventory(),
                this.webapi.supplyData.taxRateTypes([3000070001, 3000070002, 3000070004, 3000070005]),
                this.webapi.supplyData.revenueType({ parentId: "2001003" }),
                this.webapi.supplyData.findByEnumId({ "enumId": 400010 }),
                this.webapi.supplyData.project({ "entity": { "isEnable": true } }),
                this.webapi.supplyData.findByEnumId({ "enumId": 300013 }),
            ])
            customer = resall[0];//查询客户
            inventory = resall[1];//查询存货
            taxRateTypes = resall[2];//计税方式
            revenueType = resall[3];
            impose = resall[4];//征收方式
            project = resall[5] && resall[5].list;
            inventoryTypes = resall[6];//货物类型
            customer = customer.list.filter(item => item.isEnable == true)
            inventory = inventory.list.filter(item => item.isEnable == true)

        } else {
            //进项
            this.metaAction.sf('data.other.visible', true)
            const resall = await Promise.all([
                this.webapi.supplyData.supplier(),
                this.webapi.supplyData.queryInventory(),
                this.webapi.supplyData.findEnumList(),
                this.webapi.supplyData.department({ "option": { "entity": { "isEnable": true } } }),
                this.webapi.supplyData.project({ "entity": { "isEnable": true } }),
                this.webapi.supplyData.findByEnumId({ "enumId": 400010 }),
                this.webapi.supplyData.findByEnumId({ "enumId": 300013 }),
            ])
            supplier = resall[0];//查询供应商
            inventory = resall[1];//查询存货[]
            detailList = resall[2] && resall[2].detailList;
            department = resall[3] && resall[3].list;
            project = resall[4] && resall[4].list;
            supplier = supplier.list.filter(item => item.isEnable == true);
            impose = resall[5];//征收方式
            inventoryTypes = resall[6];//货物类型
        }

        let res = { customer, inventory, property, supplier, detailList, taxRateTypes, impose, inventoryTypes, revenueType, department, project }
        if (res) {
            this.metaAction.sf('data.other.loading', false)
            this.injections.reduce('load', res)
        }
    }

    //改变业务类型
    changeProperty = (path, value) => {
        if (!value) {
            this.injections.reduce('upDate', { path, value: null })
            let inventory = this.metaAction.gf('data.other.inventory').toJS();
            this.injections.reduce('upDate', { path: 'data.other.inventoryfilter', value: inventory })
        } else {
            this.injections.reduce('upDate', { path, value: value.propertyId });

            if (value.propertyId) {
                //过滤存货
                let inventory = this.metaAction.gf('data.other.inventory').toJS();
                let inventoryfilter = inventory.filter(item => item.propertyId == value.propertyId);
                this.injections.reduce('upDate', { path: 'data.other.inventoryfilter', value: inventoryfilter })
                //过滤明细
                let detailList = this.metaAction.gf('data.other.detailList').toJS();
                let detailListFilter = detailList.filter(item => item.propertyId == value.propertyId)
                this.injections.reduce('upDate', { path: 'data.other.detailListFilter', value: detailListFilter })

                let isFY, showCH;
                if (value.propertyId == 4001001) {
                    isFY = true;
                    showCH = false
                } else {
                    isFY = false
                    if (detailListFilter.length > 0) {
                        showCH = true
                    } else {
                        showCH = false
                    }
                }
                //改变业务类型时将选择的存货或费用清空
                this.injections.reduce('upDateSf', {
                    "data.form.inventoryName": null,
                    'data.form.inventoryType': null,
                    "data.form.inventoryId": null,
                    'data.form.businessTypeId': null,
                    'data.other.isFY': isFY,
                    'data.other.showCH': showCH,
                    'data.form.propertyDetailId': null,
                })
            }
        }
    }

    //新增档案
    addRecordClicks = async (add, params, index, rowData) => {
        this.metaAction.sf('data.other.auditVisible', false)
        if (params == 'inventory') { //新增存货 明细表要带出对应的数据
            await this.voucherAction[add]('data.other.inventoryItem')

            let inventory = this.metaAction.gf('data.other.inventory').toJS()
            const inventoryItem = this.metaAction.gf('data.other.inventoryItem').toJS()
            inventory.push(inventoryItem)
            this.metaAction.sf('data.other.inventory', fromJS(inventory))

            let filed = {
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

            this.onFieldChange(filed, 'data.other.inventory', index, rowData, null, inventoryItem.id)

        } else {
            await this.voucherAction[add](`data.other.${params}s`)
            const res = this.metaAction.gf(`data.other.${params}s`).toJS()
            const list = this.metaAction.gf(`data.other.${params}`).toJS()
            list.push(res)
            this.metaAction.sfs({
                [`data.other.${params}`]: fromJS(list),
                [`data.form.${params}Id`]: res.id,
                [`data.form.${params}Name`]: res.name
            })
        }
    }


    //新增档案
    handleAddRecord = (paramsU, params, index, rowData) => {
        const add = `add${paramsU}`
        return <Button type='primary'
            style={{ width: '100%', borderRadius: '0' }}
            onClick={this.addRecordClicks.bind(null, add, params, index, rowData)}
        >新增</Button>
    }

    fieldChange = (path, value) => {
        if (!value) {
            if (path == 'data.form.inventoryId') {
                //修改 存货 费用
                this.injections.reduce('upDateSf', {
                    "data.form.inventoryName": null,
                    'data.form.inventoryType': null,
                    "data.form.inventoryId": null,
                    'data.form.businessTypeId': null
                })
            } else {
                this.injections.reduce('upDate', { path, value: null })
            }
        } else {
            this.injections.reduce('upDate', { path, value: value.id })
            if (path == 'data.form.inventoryId') {
                this.injections.reduce('upDate', { path: "data.form.inventoryName", value: value.name })
                if (value.inventoryType) this.injections.reduce('upDate', { path: 'data.form.inventoryType', value: value.inventoryType })
                this.injections.reduce('upDate', { path: 'data.form.propertyId', value: value.propertyId })
                let inventory = this.metaAction.gf('data.other.inventory').toJS()
                let inventoryfilter = inventory.filter(item => item.propertyId == value.propertyId)
                this.injections.reduce('upDate', { path: 'data.other.inventoryfilter', value: inventoryfilter })
                if (value.propertyId == 4001001) {
                    //费用
                    this.injections.reduce('upDate', { path: 'data.form.businessTypeId', value: value.id })
                    this.injections.reduce('upDate', { path: 'data.other.isFY', value: true });
                } else {
                    //存货
                    this.injections.reduce('upDate', { path: 'data.form.businessTypeId', value: null })
                    this.injections.reduce('upDate', { path: 'data.other.isFY', value: false });
                }
            }
        }

    }
    //进项 新增存货/费用
    addRecordClick = async () => {
        let isFY = this.metaAction.gf('data.other.isFY');
        if (isFY) {
            let ret = await this.metaAction.modal('show', {
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
            if (typeof ret == 'object') {
                ret.propertyId = 4001001
                ret.propertyName = '费用'
                this.injections.reduce('upDateSf', {
                    'data.form.businessTypeId': ret.id,
                    'data.form.inventoryName': ret.name
                })
                let inventory = await this.webapi.supplyData.queryInventory();//查询存货
                if (inventory) {
                    let inventoryfilter = inventory.filter(item => item.propertyId == 4001001)
                    this.injections.reduce('upDateSf', {
                        'data.other.inventory': fromJS(inventory),
                        'data.other.inventoryfilter': fromJS(inventoryfilter),
                    })
                }
            }
        } else {
            const ret = await this.metaAction.modal('show', {
                title: '新增存货',
                width: 750,
                children: this.metaAction.loadApp(
                    'app-card-inventory', {
                        store: this.component.props.store
                    }
                )
            })
            if (ret) {
                if (!ret.isEnable) {
                    return
                }
                let updArr = {
                    'data.form.propertyId': ret.propertyId,
                    'data.form.inventoryId': ret.id,
                    'data.form.inventoryName': ret.name,
                    'data.form.inventoryType': ret.inventoryType ? ret.inventoryType : null
                }
                this.injections.reduce('upDateSf', updArr)

                let inventory = await this.webapi.supplyData.queryInventory();//更新存货列表
                if (inventory) {
                    let inventoryfilter = inventory.filter(item => item.propertyId == ret.propertyId)
                    this.injections.reduce('upDateSf', {
                        'data.other.inventory': fromJS(inventory),
                        'data.other.inventoryfilter': fromJS(inventoryfilter),
                    })
                }

            }
        }

    }

    //销项 新增存货
    addInventoryClick = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增存货',
            width: 750,
            children: this.metaAction.loadApp(
                'app-card-inventory', {
                    store: this.component.props.store
                }
            )
        })
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let updArr = {
                'data.form.inventoryId': ret.id,
                'data.form.inventoryName': ret.name,
                'data.form.inventoryType': ret.inventoryType ? ret.inventoryType : null
            }
            this.injections.reduce('upDateSf', updArr)
            let inventory = await this.webapi.supplyData.inventory();//更新存货列表
            if (inventory) {
                inventory = inventory.list.filter(item => item.isEnable == true)
                this.injections.reduce('upDate', { path: 'data.other.inventory', value: inventory })
            }
        }
    }

    addRevenueType = async () => {
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

            this.metaAction.sf('data.form.revenueType', fromJS(ret.id))
            this.metaAction.sf('data.other.revenueType', fromJS(revenueType))
        }
    }

    //新增供应商
    addSuppliers = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增供应商',
            width: 700,
            children: this.metaAction.loadApp(
                'app-card-vendor', {
                    store: this.component.props.store
                }
            )
        })

        if (ret) {
            if (!ret.isEnable) {
                return
            }
            this.injections.reduce('upDate', { path: 'data.form.supplierId', value: ret.id });
            let supplier = await this.webapi.supplyData.supplier();//查询供应商
            if (supplier) {
                supplier = supplier.list.filter(item => { return item.isEnable == true })
                this.injections.reduce('upDate', { path: 'data.other.supplier', value: supplier });
            }
        }

    }
    // 新增客户
    addCustomer = async (field) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增客户',
            width: 700,
            children: this.metaAction.loadApp(
                'app-card-customer', {
                    store: this.component.props.store
                }
            )
        })
        //if (ret) this.load()
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            this.injections.reduce('upDate', { path: 'data.form.customerId', value: ret.id });
            let customer = await this.webapi.supplyData.customer();//查询客户
            if (customer) {
                customer = customer.list.filter(item => { return item.isEnable == true })
                this.injections.reduce('upDate', { path: 'data.other.customer', value: customer });
            }
        }
        // if (ret && ret.isEnable) {
        //     if (typeof field === 'string') {
        //         this.metaAction.sfs({ [field]: fromJS(ret) })
        //     } else {
        //         Object.keys(field).forEach(key => {
        //             this.metaAction.sf(field[key], ret[key])
        //         })
        //     }
        // }
    }
    //新增费用
    addBussess = async (option) => {
        const ret = await this.metaAction.modal('show', {
            title: '新增费用类型',
            wrapClassName: 'income-expenses-card',
            width: 400,
            okText: '确定',
            footer: '',
            bodyStyle: { padding: '10px 0' },
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('scm-incomeexpenses-setting-card', {
                store: this.component.props.store,
                incomeexpensesTabId: '4001001',
                record: undefined
            }),
        })

    }

    close = (ret) => {
        this.closeTip()
        if (ret) {
            this.load()
        }
        return true;
    }

    filterOption2 = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    // getProject = () => {
    //     this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project')
    // }

    filterOptionArchives = (name, inputValue, option) => {

        if (option.props.add && option.props.children) {
            option.props = {
                children: option.props.children
            }
        }
        const namePrmas = {
            currentPath: name
        }
        return this.filterOptions(inputValue, option, namePrmas)
    }

    //支持搜索
    filterOptions = (inputValue, option, name) => {

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
        }

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`)

        let value
        if (option.props.value) {
            value = option.props.value
        } else if (option.props.children) {
            value = option.props.children
        }

        let paramsValue
        if (option._owner.key == "inventoryName") {
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
            || (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1)
            || (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1)
        // TODO 只支持助记码搜索，简拼
    }

    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false

        let parmasName = null, parmasNameCode = null, paramsValues = null, value = option.props.value
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('supplier') != -1) {
            parmasName = 'supplier'
        } else if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
        } else if (parmasName.indexOf('customer')) {
            parmasName = 'customer'
        } else if (parmasName.indexOf('property')) {
            parmasName = 'property'
        } else if (parmasName.indexOf('project')) {
            parmasName = 'project'
        } else if (parmasName.indexOf('revenueType')) {
            parmasName = 'revenueType'
        }

        paramsValues = this.metaAction.gf(`data.other.${parmasName}`)
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }
        if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
            let regExp = new RegExp(inputValue, 'i')
            return paramsValue.get('code').search(regExp) != -1
        }
        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.get('name').search(regExp) != -1
            || paramsValue.get('helpCode').search(regExp) != -1
            || paramsValue.get('helpCodeFull').search(regExp) != -1
    }

    onOk = async () => {
        let vouchers = this.component.props.selectedOption
        let { taxRateFlag, type } = this.component.props;
        let { inventoryId, inventoryType, supplierId, customerId, businessTypeId, propertyId, projectId, departmentId, revenueType, propertyDetailId, taxRateType, signAndRetreat, inventoryTypeSelect } = this.metaAction.gf('data.form').toJS();

        if (type == 'addCustomer') {
            let filter = {
                inventoryId, // 存货
                customerId,  // 往来单位
                inventoryType,//存货类型
                vouchers,
                projectId,
                revenueType,
                taxRateType,
                signAndRetreat,
                inventoryTypeSelect
            }
            if (!filter.inventoryId && !filter.customerId && !filter.projectId && !filter.revenueType && !filter.taxRateType && !signAndRetreat && !inventoryTypeSelect) {
                this.metaAction.toast('error', '存货名称、收入类型、项目、往来单位、计税方式、征收方式不能都为空')
                return false
            }

            //税率不相同，不能批量修改计税方式
            if (taxRateType) {
                if (taxRateFlag == 1) {
                    this.metaAction.toast('error', '所选数据税率不相同，不能批量修改计税方式')
                    return false
                } else if (taxRateFlag == 2) {
                    this.metaAction.toast('error', '所选数据不能批量修改计税方式')
                    return false
                }

            }

            this.metaAction.sf('data.other.loading', true)
            let res = await this.webapi.supplyData.completeBatch(filter)
            if (res) {
                this.metaAction.toast('success', '修改成功')
                this.metaAction.sf('data.other.loading', false)
                return res;
            } else {
                this.metaAction.sf('data.other.loading', false)
                return false
            }

        }
        else {
            let filter = {
                inventoryId: businessTypeId ? null : inventoryId, // 存货
                supplierId,  // 单位 供应商
                inventoryType,//存货分类
                businessTypeId,//类型
                propertyId,
                projectId,  // 项目
                departmentId, // 部门
                vouchers,
                propertyDetailId,
                signAndRetreat,
                inventoryTypeSelect
            }

            if (!filter.propertyId && !filter.supplierId && !filter.departmentId && !filter.projectId&&!filter.signAndRetreat&&!inventoryTypeSelect) {
                this.metaAction.toast('error', '业务类型、往来单位、项目、部门、征收方式、货物类型不能都为空')
                return false
            }
            if (filter.propertyId == 4001001 && !filter.businessTypeId) {
                this.metaAction.toast('error', '请选择费用类型')
                return false
            }
            if ((filter.propertyId == 7 || filter.propertyId == 8 || filter.propertyId == 19) && !filter.propertyDetailId) {
                this.metaAction.toast('error', '请选择明细分类')
                return false
            }
            this.metaAction.sf('data.other.loading', true)
            let res = await this.webapi.supplyData.completeBatchPu(filter)
            if (res) {
                this.metaAction.toast('success', '修改成功')
                this.metaAction.sf('data.other.loading', false)
                return res;
            } else {
                this.metaAction.sf('data.other.loading', false)
                return false
            }

        }


    }
    showImpose = () => {
      //  const { type } = this.component.props;
        const { vatTaxpayer } = this.metaAction.context.get("currentOrg");

        if (vatTaxpayer != 2000010002) {
            return true;
        }
        return false;
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