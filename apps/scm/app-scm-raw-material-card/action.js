import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import extend from './extend'

import { FormDecorator, Button } from 'edf-component'
import { blankDetail } from './data'

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

        this.initLoad();

    }

    initLoad = async () => {
        const { id, BOMCode, inventoryCode, inventoryName } = this.component.props;
        let inventory = await this.webapi.queryInventory({ entity: { isEnable: true } });
        inventory = inventory.list.filter((item) => { return item.propertyName == '原材料' || item.propertyName == '周转材料' });

        //查看详情
        let findRes = await this.webapi.queryIngredient({ id, BOMCode });
        let result = this.repairGetData(findRes, inventory);
        inventory = this.getFullName(inventory)
        this.metaAction.sfs({
            'data.form': fromJS(result),
            'data.code': inventoryCode,
            'data.BOMCode': result.BOMCode,
            'data.name': inventoryName,
            'data.id': id,
            'data.other.inventory': fromJS(inventory)
        });
        // this.injections.reduce('initLoad', { initCreate, code, findRes, id })
        setTimeout(() => {
            this.getDom({})
        }, 20)
    }

    getDom = (e) => {
        const dom = document.querySelector('.app-scm-raw-material-card-form-details')
        if (!dom) {
            if (e) {
                return
            }
            return setTimeout(() => {
                return this.getDom()
            }, 200)
        }
        const count = Math.floor(dom.offsetHeight / 34) - 2
        const details = this.metaAction.gf('data.form.details').toJS()
        while (details.length < count) {
            details.push(blankDetail);
        }
        this.metaAction.sfs({
            'data.other.detailHeight': count,
            'data.form.details': fromJS(details)
        })

        // this.injections.reduce('setrowsCount', details, details.length)
    }
    componentDidMount = () => {
        // this.getDom()

        if (window.addEventListener) {
            window.addEventListener('resize', this.getDom, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.getDom)
        }
        if (window.addEventListener) {
            window.addEventListener('resize', this.getDom, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.getDom)
        } else {
            window.getDom = this.getDom
        }
    }
    componetWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onresize', this.getDom, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.getDom)
        } else {
            window.getDom = null;
        }
    }
    getInvenValue = (code, name) => { return code + ` ` + name }

    //检查基础项
    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS();
        let otherMsg = []
        // 单价不能小于0
        for (let i = 0; i < form.details.length; i++) {
            if (form.details[i].price < 0) otherMsg.push(i + 1)
        }
        if (otherMsg.length > 0) {
            this.metaAction.toast('error', `第${otherMsg.join(',')}行明细单价不能为负数`)
            return false
        }
        return true
    }

    // 检查明细
    checkDetail = (data) => {

        // 成本调整（无数量单价）
        let requiredParams = [
            {
                key: 'inventoryId',
                name: '存货'
            },
            {
                key: 'quantity',
                name: '数量'
            }
        ]
        let arrFireld = [

        ]

        let newDetail = []
        let message = ''
        data.forEach((item, index) => {
            let flag = false
            for (const value of Object.values(item)) {
                if (!!value) {
                    flag = true
                }
            }
            let { inventoryId, quantity, price } = item;
            if (!inventoryId && !quantity && !price) {
                flag = false;
            }
            if (flag) {
                newDetail.push(item)
                let messageArr = []
                requiredParams.forEach(o => {
                    if (!item[o.key]) {
                        messageArr.push(o.name)
                    }
                })
                if (messageArr.length > 0) {
                    message = `${message} 第${index + 1}行${messageArr.join('、')}不能为空\n`
                }
                if (item.quantity && item.quantity < 0) {
                    message = `${message} 第${index + 1}行数量不能小于0\n`
                }
                if (item.quantity === '0') {
                    message = `${message} 第${index + 1}行数量不能等于0\n`
                }
                if (item.price && item.price < 0) {
                    message = `${message} 第${index + 1}行单价不能小于0\n`
                }

            }
        })
        if (newDetail.length == 0) {
            this.metaAction.toast('error', '请至少填写一条数据')
        }
        if (message) {
            this.metaAction.toast('error', message)
        }
        if (newDetail.length == 0 || message) {
            return false
        }
        let idList = [];
        newDetail = newDetail.map(o => {
            let { inventoryId: id, quantity: number = null, price = null } = o;
            idList.push(id)
            return {
                id,
                number,
                price
            }
        })
        let set = new Set(idList);
        if (set.size != newDetail.length) {
            this.metaAction.toast('error', '存在存货相同的明细行，无法保存，请修改');
            return false
        }
        return newDetail
    }
    changeBOM = (e) => {
        var value = e.target.value;
        value = value.trim();
        this.metaAction.sf('data.BOMCode', value);
    }
    onOk = async () => {
        return await this.save();
    }
    onCancel = () => {
        return true;
    }
    save = async () => {
        const { codeList } = this.component.props;
        const { details: ingredientList } = this.metaAction.gf('data.form').toJS();
        let BOMCode = this.metaAction.gf('data.BOMCode') || null;
        if (!BOMCode) {
            this.metaAction.toast('error', 'BOM编码不能为空');
            return false;
        }
        BOMCode = BOMCode.trim();
        if (BOMCode.length > 50) {
            this.metaAction.toast('error', 'BOM编码长度不能超过50');
            return false;
        }
        if (codeList.indexOf(BOMCode) !== -1) {
            this.metaAction.toast('error', '已存在相同的配置原料(BOM)编码');
            return false;
        }
        const { id } = this.component.props;

        const formParams = {
            id,
            BOMCode,
            price: null,
            number: null
        }
        //  const isOk = this.metaAction.gf('data.other.isOk')
        // if (!this.checkForm(formParams)) return false
        let newDetail = this.checkDetail(ingredientList)
        if (!newDetail) return false;
        formParams.ingredientList = newDetail



        // if (!isOk) return false
        // this.metaAction.sf('data.other.isOk', false)

        let response = await this.webapi.updateIngredient(formParams)
        //this.metaAction.sf('data.other.isOk', true)

        if (response) {
            this.metaAction.toast('success', '保存成功');
        } else {
            //console.log(response);
            // this.metaAction.toast('error', response.message);
            return false;
        }

    }

    repairGetData = (data, inventory) => {
        // deepClone 一个对象
        const result = fromJS(data).toJS();
        result.details = result.ingredientList.map((item) => {
            let { propertyName = null, propertyId = null, price, number: quantity, code: inventoryCode, name: inventoryName, id: inventoryId, specification, unitName, unitId } = item;
            // let eq = inventory.find(o => o.id == inventoryId);//存货是否存在id
            // if (!eq) {
            //    // inventoryId = null;
            //    // inventoryCode = null;
            //    // inventoryName = null;
            //    // propertyId = null;
            //    // propertyName = null;
            // } else {
            //     propertyId = eq.propertyId;
            //     propertyName = eq.propertyName;
            // }
            return {
                propertyName,
                propertyId,
                inventoryCode,
                inventoryName,
                inventoryId,
                specification,
                unitName,
                unitId,
                price,
                quantity
            }
        })
        const blankDetail = {
            inventoryId: null,
            quantity: null,
            price: null
        }
        const length = result.details.length
        for (let i = length; i < 12; i++) {
            result.details.push(blankDetail)
        }
        return result
    }

    onFieldChange = (field, storeField, rowIndex, rowData, index) => async (id) => {
        if (!field || !storeField) return
        let value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
        if (value) {
            Object.keys(field).forEach(key => {
                this.metaAction.sf(field[key], value.get(key))
            })
        } else {
            Object.keys(field).forEach(key => {
                this.metaAction.sf(field[key], undefined)
            })
        }
        setTimeout(() => {
            this.getDom({})
        }, 10)
    }

    //支持搜索
    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) {
            return false
        }
        //需要确定部门项目这些是否也需要支持助记码这些的搜索
        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName = name.currentPath
        }
        if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventory'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('department') != -1) {
            parmasName = 'department'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('project') != -1) {
            parmasName = 'project'
            parmasNameCode = 'inventoryCode'
        } else if (parmasName.indexOf('purchasePerson') != -1) {
            parmasName = 'purchasePerson'
        }

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`)
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        if (!paramsValue) {
            return false
        }

        let regExp = new RegExp(inputValue, 'i')
        if (parmasNameCode) {
            return paramsValue.get('name').search(regExp) != -1
                || paramsValue.get('code').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        } else {
            return paramsValue.get('name').search(regExp) != -1
            // || paramsValue.get('helpCode').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        }
    }

    //存货编码
    filterOptionCode = (inputValue, option) => {
        if (!option || !option.props || !option.props.value) {
            return false
        }
        const paramsValues = this.metaAction.gf(`data.other.inventory`),
            value = option.props.value
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        if (!paramsValue) {
            return false
        }
        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.get('code').search(regExp) != -1
    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return { token: token }
    }

    //新增档案
    addRecordClick = async (add, params, index, rowData) => {

        await this.voucherAction[add]('data.other.inventoryItem')

        let inventory = this.metaAction.gf('data.other.inventory').toJS()
        let inventoryItem = this.metaAction.gf('data.other.inventoryItem').toJS()

        if (inventoryItem) {
            if (inventoryItem.propertyName == '原材料' || inventoryItem.propertyName == '周转材料') {
                inventoryItem = this.getFullName([inventoryItem])[0]
                inventory.push(inventoryItem)
                this.metaAction.sf('data.other.inventory', fromJS(inventory))

                let filed = {
                    id: `data.form.details.${index}.inventoryId`, 
                    name: `data.form.details.${index}.inventoryName`,
                    code: `data.form.details.${index}.inventoryCode`,
                    unitId: `data.form.details.${index}.unitId`,
                    unitName: `data.form.details.${index}.unitName`,
                    propertyName: `data.form.details.${index}.propertyName`,
                    taxRateName: `data.form.details.${index}.taxRateName`,
                    specification: `data.form.details.${index}.specification`
                }
                this.onFieldChange(filed, 'data.other.inventory', index, rowData)(inventoryItem.id)
            }
        }

    }

    // 获取存货
    getInventorys = async (_rowIndex) => {

        let newInventory = await this.webapi.queryInventory({ entity: { isEnable: true } });
        newInventory = inventory.list.filter((item) => { return item.propertyName == '原材料' || item.propertyName == '周转材料' });
        let oldId = this.metaAction.gf(`data.form.details.${_rowIndex}.inventoryId`);
        newInventory = this.getFullName(newInventory)
        let arr = {
            'data.other.inventory': fromJS(newInventory)
        }
        if (oldId) {
            let isHave = newInventory.find(item => item.id == oldId);
            if (!isHave) {
                arr = {
                    ...arr,
                    [`data.form.details.${_rowIndex}.inventoryId`]: null,
                    [`data.form.details.${_rowIndex}.inventoryName`]: null,
                    [`data.form.details.${_rowIndex}.inventoryCode`]: null,
                    [`data.form.details.${_rowIndex}.propertyName`]: null,
                    [`data.form.details.${_rowIndex}.propertyId`]: null,
                }
            }
        }
        this.metaAction.sfs(arr);
    }

    //新增 部门 项目 供应商
    handleAddRecord = (paramsU, params, index, rowData) => {
        const add = `add${paramsU}`
        return <Button type='primary'
            style={{ width: '100%', borderRadius: '0' }}
            onClick={this.addRecordClick.bind(null, add, params, index, rowData)}
        >新增</Button>
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

    calc = (col, rowIndex, rowData, params) => (v) => {
        if (Number(v) < 0) {
            v = -1 * v
        }
        if (col == 'amount') {
            if (Number(v) > 9999999999.99) {
                v = 9999999999.99
            }
        } else {
            if (Number(v) > 9999999999.999999) {
                v = 9999999999.999999
            }
        }
        params = Object.assign(params, {
            value: v
        })
        this.metaAction.sf(`data.form.details.${rowIndex}.${col}`, v);
        // this.voucherAction.calc(col, rowIndex, rowData, params);
    }
    quantityFormat = (quantity, decimals, isFocus,clearZero) => {
        if (quantity) {
            return this.voucherAction.numberFormat(quantity, decimals, isFocus,clearZero)
        }
    }

    check = async (option) => {
        if (!option || !option.path)
            return

        if (option.path == 'data.form.materialCost') {
            return { errorPath: 'data.other.error.materialCost', message: this.checkOrigValue(option) }
        } else if (option.path == 'data.form.laborCost') {
            return { errorPath: 'data.other.error.laborCost', message: this.checkOrigValue(option) }
        } else if (option.path == 'data.form.manufacturCost') {
            return { errorPath: 'data.other.error.manufacturCost', message: this.checkOrigValue(option) }
        }
    }

    checkOrigValue = (option) => {
        if (!this.checkIsNumber(option.value)) {
            return '请输入数字'
        } else {
            return ''
        }
    }
    //是否为数字
    checkIsNumber = (value) => {
        let reg = /^(\-|\+)?\d+(\.\d+)?$/
        if (value && !reg.test(value)) {
            return false
        }
        return true
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
