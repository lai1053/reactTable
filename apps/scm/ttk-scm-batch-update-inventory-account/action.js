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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        const { account, inventory } = this.component.props;
        this.metaAction.sfs({
            'data.other.account': fromJS(account),
            'data.other.inventory': fromJS(inventory),
        })
    }
    fieldChange = (path, value) => {
        value = value || null;
        if (path === 'data.form.inventoryId') {
            if (!value) {
                this.injections.reduce('upDateSfs', {
                    [`data.form.inventoryId`]: null,
                    [`data.form.name`]: null,
                    [`data.form.businessTypeId`]: null,
                    [`data.form.businessTypeName`]: null,
                });
            } else {

                let { id, fullName, propertyId } = value
                if (propertyId == 4001001) {
                    this.injections.reduce('upDateSfs', {
                        [`data.form.businessTypeId`]: id,
                        [`data.form.businessTypeName`]: fullName,
                        [`data.form.inventoryId`]: null,
                        [`data.form.name`]: fullName,
                    });
                } else {
                    this.injections.reduce('upDateSfs', {
                        [`data.form.businessTypeId`]: null,
                        [`data.form.businessTypeName`]: null,
                        [`data.form.inventoryId`]: id,
                        [`data.form.name`]: fullName,
                    });
                }
            }
        } else {
            if (!value) {
                this.injections.reduce('upDateSfs', {
                    [`data.form.inventoryRelatedAccountId`]: null,
                    [`data.form.inventoryRelatedAccountName`]: null,
                });
            } else {

                let { id, codeAndName } = value;
                this.injections.reduce('upDateSfs', {
                    [`data.form.inventoryRelatedAccountId`]: id,
                    [`data.form.inventoryRelatedAccountName`]: codeAndName,
                });
            }
        }
    }
    //新增档案
    addRecordClick = async () => {
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
                [`data.form.inventoryId`]: ret.id,
                [`data.form.name`]: ret.name,
                [`data.form.propertyId`]: ret.propertyId,
                ['data.other.inventory']: fromJS(inventory)
            })
        }
    }
    // 新增科目
    addSubjects = async () => {
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
                [`data.form.inventoryRelatedAccountId`]: ret.id,
                [`data.form.inventoryRelatedAccountName`]: ret.codeAndName,
                ['data.other.account']: fromJS(account)
            })
        }
    }

    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\");
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
    onOk = () => {

        const { inventory, account } = this.metaAction.gf('data.other').toJS()
        const {
            businessTypeId,
            businessTypeName,
            inventoryId,
            name,
            inventoryRelatedAccountId,
            inventoryRelatedAccountName
        } = this.metaAction.gf('data.form').toJS();
        if (!inventoryRelatedAccountId) {
            this.metaAction.toast('error', '请选择科目');
            return false;
        }
        return {
            businessTypeId,
            businessTypeName,
            inventoryId,
            name,
            inventoryRelatedAccountId,
            inventoryRelatedAccountName,
            inventory,
            account
        }
    }
    onCancel = () => {
        return 'false'
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