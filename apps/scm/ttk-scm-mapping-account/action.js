import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import { fromJS } from 'immutable';

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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')
        this.indexArr = [];
        this.load()
    }

    load = async () => {
        let { ruleRes: res } = this.component.props  // delivery 销项 
        this.metaAction.sf('data.other.loading', true);
        let inventory = await this.webapi.handleRule.queryInventory();
        let account = await this.webapi.handleRule.accountQuery({ isEnable: true, isEndNode: true });
        account = account.glAccounts.filter(item => item.isEnable === true && item.isEndNode === true)
        let response = { res, inventory, account }
        if (res) {
            res.invoiceInventoryList.forEach((item, index) => {
                this.indexArr.push(index),
                    item.uuid = index//uuid就是allList的索引
            });
            this.metaAction.sf('data.allList', fromJS(res.invoiceInventoryList));
            this.metaAction.sf('data.other.loading', false)
            this.injections.reduce('load', response)
        }
    }
    refresh = async () => {
        const inventoryName = this.metaAction.gf('data.inventoryName');
        const allList = this.metaAction.gf('data.allList').toJS();
        let res = [];
        if (!inventoryName) {
            res = allList;
        } else {
            res = allList.filter(o => o.inventoryName.indexOf(inventoryName) !== -1)
        }
        this.indexArr = [];
        res.forEach(o => {
            this.indexArr.push(o.uuid)
        });
        this.metaAction.sf('data.form.details', fromJS(res))
    }
    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }
    onFieldChange = (value, index) => {

        //待优化
        const item = this.metaAction.gf(`data.form.details.${index}`).toJS();
        const uuid = item.uuid;

        if (!value) {
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryId`]: null,
                [`data.form.details.${index}.name`]: null,
                [`data.form.details.${index}.businessTypeId`]: null,
                [`data.form.details.${index}.businessTypeName`]: null,
                [`data.allList.${uuid}.inventoryId`]: null,
                [`data.allList.${uuid}.name`]: null,
                [`data.allList.${uuid}.businessTypeId`]: null,
                [`data.allList.${uuid}.businessTypeName`]: null,
            });
        } else {
            let detail = this.metaAction.gf('data.other.inventory').toJS()
            let inventory = detail.find(item => item.id == value)

            if (inventory.propertyId == 4001001) {
                this.injections.reduce('upDateSfs', {
                    [`data.form.details.${index}.businessTypeId`]: inventory.id,
                    [`data.form.details.${index}.businessTypeName`]: inventory.fullName,
                    [`data.form.details.${index}.inventoryId`]: null,
                    [`data.form.details.${index}.name`]: inventory.fullName,
                    [`data.allList.${uuid}.businessTypeId`]: inventory.id,
                    [`data.allList.${uuid}.businessTypeName`]: inventory.fullName,
                    [`data.allList.${uuid}.inventoryId`]: null,
                    [`data.allList.${uuid}.name`]: inventory.fullName,
                });
            } else {
                this.injections.reduce('upDateSfs', {
                    [`data.form.details.${index}.businessTypeId`]: null,
                    [`data.form.details.${index}.businessTypeName`]: null,
                    [`data.form.details.${index}.inventoryId`]: inventory.id,
                    [`data.form.details.${index}.name`]: inventory.fullName,
                    [`data.allList.${uuid}.businessTypeId`]: null,
                    [`data.allList.${uuid}.businessTypeName`]: null,
                    [`data.allList.${uuid}.inventoryId`]: inventory.id,
                    [`data.allList.${uuid}.name`]: inventory.fullName
                });
            }
        }
    }
    onAccountFieldChange = (value, index) => {
        //待优化
        const item = this.metaAction.gf(`data.form.details.${index}`).toJS();
        const uuid = item.uuid;
        if (!value) {
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryRelatedAccountId`]: value || null,
                [`data.form.details.${index}.inventoryRelatedAccountName`]: value || null,
                [`data.allList.${uuid}.inventoryRelatedAccountId`]: value || null,
                [`data.allList.${uuid}.inventoryRelatedAccountName`]: value || null,
            });
        } else {
            let account = this.metaAction.gf('data.other.account').toJS()
            let item = account.find(item => item.id == value);
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryRelatedAccountId`]: item.id,
                [`data.form.details.${index}.inventoryRelatedAccountName`]: item.codeAndName,
                [`data.allList.${uuid}.inventoryRelatedAccountId`]: item.id,
                [`data.allList.${uuid}.inventoryRelatedAccountName`]: item.codeAndName
            });
        }
    }
    //新增档案
    addRecordClick = async (index) => {

        const item = this.metaAction.gf(`data.form.details.${index}`).toJS();
        const uuid = item.uuid;
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

            const inventory = this.metaAction.gf('data.other.inventory').toJS();
            inventory.push(ret);

            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryId`]: ret.id,
                [`data.form.details.${index}.name`]: ret.name,
                [`data.form.details.${index}.propertyId`]: ret.propertyId,
                ['data.other.inventory']: fromJS(inventory),
                [`data.allList.${uuid}.inventoryId`]: ret.id,
                [`data.allList.${uuid}.name`]: ret.name,
                [`data.allList.${uuid}.propertyId`]: ret.propertyId
            })
        }
    }
    // 新增科目
    addSubjects = async (index) => {
        //待优化
        const item = this.metaAction.gf(`data.form.details.${index}`).toJS();
        const uuid = item.uuid;
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives'
            })
        })
        if (ret) {
            if (!ret.isEnable || !ret.isEndNode) {
                return
            }
            const account = this.metaAction.gf('data.other.account').toJS();
            account.push(ret);
            this.injections.reduce('upDateSfs', {
                [`data.form.details.${index}.inventoryRelatedAccountId`]: ret.id,
                [`data.form.details.${index}.inventoryRelatedAccountName`]: ret.codeAndName,
                ['data.other.account']: fromJS(account),
                [`data.allList.${uuid}.inventoryRelatedAccountId`]: ret.id,
                [`data.allList.${uuid}.inventoryRelatedAccountName`]: ret.codeAndName,
            })
        }
    }

    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) return false

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
        } else if (parmasName.indexOf('account') != -1) {
            parmasName = 'account'
        }
        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`),
            value = option.props.value
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }
        if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
            let regExp = new RegExp(inputValue, 'i')
            return paramsValue.get('code').search(regExp) != -1
        }
        let regExp = new RegExp(inputValue, 'i')
        if (paramsValue.get('fullName')) {
            return paramsValue.get('fullName').search(regExp) != -1
                || paramsValue.get('helpCode').search(regExp) != -1
                || paramsValue.get('helpCodeFull').search(regExp) != -1
        }

        if (paramsValue.get('codeAndName')) {
            return paramsValue.get('codeAndName').search(regExp) != -1
                || paramsValue.get('helpCode').search(regExp) != -1
                || paramsValue.get('helpCodeFull').search(regExp) != -1
        }

        // TODO 只支持助记码搜索，简拼
    }

    onOk = async () => {

        if (!this.check()) {
            this.metaAction.toast('error', '请完成所有科目选择');
            this.metaAction.sf('data.inventoryName', null);
            await this.refresh()
            return false;
        } else {
            return await this.save()
        }
    }

    onCancel = async () => {
        // if (!this.check()) {
        //     this.metaAction.toast('error', '请完成科目选择');
        //     return false;
        // }
        // await this.save();
        return 'false';
    }
    check = () => {

        const detail = this.metaAction.gf('data.allList').toJS();
        if (!detail || detail.length == 0) {
            return false;
        }
        let flag = true;
        detail.forEach(o => {
            if (!o.inventoryRelatedAccountId) {
                flag = false;
                return flag;
                //break;
            }
        })

        return flag;
    }
    handleChangeSearch = (e) => {
        let value = e.target.value || null;
        if (value) value = value.trim();
        this.metaAction.sf('data.inventoryName', value);
    }
    save = async () => {
        this.metaAction.sf('data.other.loading', true);
        let inventorySet = this.metaAction.gf('data.form.inventorySet'),
            customerSet = this.metaAction.gf('data.form.customerSet'),
            detail = this.metaAction.gf('data.form.details').toJS(),
            otherCustomerSet = this.metaAction.gf('data.form.otherCustomerSet'),
            id = this.metaAction.gf('data.form.id'),
            ts = this.metaAction.gf('data.form.ts')


        //接口返回数据没有propertyId所以出现bug
        detail.forEach((el) => {
            if (el.businessTypeId) {
                el.name = null
                el.inventoryId = null
            }

            if (el.inventoryId) {
                el.businessTypeName = null
                el.businessTypeId = null
            }
            if (!el.businessTypeId && !el.inventoryId) {
                el.name = null
                el.inventoryId = null
                el.businessTypeName = null
                el.businessTypeId = null
            }
            delete el.selected;
            delete el.uuid;
        })

        if (inventorySet) {
            inventorySet = 1
        } else {
            inventorySet = 0
        }
        if (customerSet) {
            customerSet = 1
        } else {
            customerSet = 0
        }
        let filter = {
            achivalRuleDto: {},
            invoiceInventoryList: detail
        }
        if (otherCustomerSet) {
            otherCustomerSet = 1
        } else {
            otherCustomerSet = 0
        }

        //进项
        filter.vatOrEntry = 1
        filter.achivalRuleDto = {
            inventorySet,
            supplierSet: customerSet,
            customerSet: otherCustomerSet,
            id, ts
        }
        let res = await this.webapi.handleRule.updateMatchingRule(filter)
        if (res.result) {
            // this.metaAction.toast('success', '更新成功');
            // this.component.props.closeModal('true')
            return 'true';
        } else {
            //this.metaAction.toast('error', '科目更新失败');
            // this.component.props.closeModal('false');
            return 'false';
        }
    }

    //批量修改
    updateBatchClick = async () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
        const inventory = this.metaAction.gf('data.other.inventory').toJS();
        const account = this.metaAction.gf('data.other.account').toJS();

        if (!selectedArrInfo.length) {
            this.metaAction.toast('warning', '请选择数据')
            return
        }
        const selectedOption = selectedArrInfo.map(o => o.uuid);
        const res = await this.metaAction.modal('show', {
            title: '批量修改存货名称及对应科目',
            width: 400,
            okText: '确定',
            wrapClassName: 'piliang',
            children: this.metaAction.loadApp('ttk-scm-batch-update-inventory-account', {
                store: this.component.props.store,
                selectedOption,
                account,
                inventory,
            }),
        })
        if (res === 'false') return

        let { businessTypeId, businessTypeName, inventoryId, name, inventoryRelatedAccountId, inventoryRelatedAccountName, inventory: newinventory, account: newaccount } = res;
        let arr = {
            'data.other.inventory': fromJS(newinventory),
            'data.other.account': fromJS(newaccount),
        }
        if (!businessTypeId && !businessTypeName && !inventoryId && !name) {
            selectedOption.forEach(item => {
                let uuid = item;
                let index = this.indexArr.indexOf(uuid);
                arr = {
                    ...arr,
                    [`data.form.details.${index}.inventoryRelatedAccountId`]: inventoryRelatedAccountId,
                    [`data.form.details.${index}.inventoryRelatedAccountName`]: inventoryRelatedAccountName,
                    [`data.allList.${uuid}.inventoryRelatedAccountId`]: inventoryRelatedAccountId,
                    [`data.allList.${uuid}.inventoryRelatedAccountName`]: inventoryRelatedAccountName
                };
            });
        } else {
            selectedOption.forEach(item => {
                let uuid = item;
                let index = this.indexArr.indexOf(uuid);
                arr = {
                    ...arr,
                    [`data.form.details.${index}.businessTypeId`]: businessTypeId,
                    [`data.form.details.${index}.businessTypeName`]: businessTypeName,
                    [`data.form.details.${index}.inventoryId`]: inventoryId,
                    [`data.form.details.${index}.name`]: name,
                    [`data.form.details.${index}.inventoryRelatedAccountId`]: inventoryRelatedAccountId,
                    [`data.form.details.${index}.inventoryRelatedAccountName`]: inventoryRelatedAccountName,
                    [`data.allList.${uuid}.businessTypeId`]: businessTypeId,
                    [`data.allList.${uuid}.businessTypeName`]: businessTypeName,
                    [`data.allList.${uuid}.inventoryId`]: inventoryId,
                    [`data.allList.${uuid}.name`]: name,
                    [`data.allList.${uuid}.inventoryRelatedAccountId`]: inventoryRelatedAccountId,
                    [`data.allList.${uuid}.inventoryRelatedAccountName`]: inventoryRelatedAccountName
                };
            });
        }

        this.injections.reduce('upDateSfs', arr);
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