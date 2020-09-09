import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {FormDecorator, Icon, DatePicker, Button} from 'edf-component'
import config from './config'
// import { FormDecorator } from 'edf-component'
import { Map, fromJS } from 'immutable'
import extend from './extend'
import moment from 'moment'
import utils, { environment } from 'edf-utils'
import Productselect from './components/Productselect'
import { addThousPos, clearThousPos } from '../../../utils/number'
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

        injections.reduce('init')

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}

        this.load()
    }

    load = async () => {
       let initData = this.component.props.initData,
       totalAndAmount = initData.totalAndAmount,
       isCard = this.component.props.initData.isCard
       
       let list = [
            // await this.webapi.dateCard.totalAndAmount({businessDate: initData.lastDay}),
            this.webapi.dateCard.queryInventory({
                entity: {isEnable: true},
                notNeedPage: true 
            })
       ]

    //    console.log(isCard, 'isCard')
       if (isCard) {
            list.push(this.webapi.dateCard.totalAndAmount({businessDate: initData.lastDay}))
       }
        const res = await Promise.all(list)
       
        // let inventorys = res[1].list, 
        let inventorys = res[0].list, 
        currentOrg = this.metaAction.context.get("currentOrg")

        let propertyIdYCL = currentOrg.vatTaxpayer == '2000010001' ? 2 : 11
        let propertyIdZZCL = currentOrg.vatTaxpayer == '2000010001' ? 4 : 13

        inventorys = inventorys.filter(obj => obj.propertyId == propertyIdYCL  || obj.propertyId == propertyIdZZCL)
        inventorys = this.getFullName(inventorys)
       let parmasObj = {
           date: initData.lastDay.slice(0, 7),
        //    materialCost: addThousPos(res[0].materialCost || 0, true, null, 2),
        //    amount: addThousPos(res[0].amount || 0, true, null, 2),
            amount:  isCard ? addThousPos(res[1].amount || 0, true, null, 2) : addThousPos(totalAndAmount&&totalAndAmount.amount || 0, true, null, 2),
            productAmount:  isCard ? addThousPos(res[1].productAmount || 0, true, null, 2) : addThousPos(totalAndAmount&&totalAndAmount.productAmount || 0, true, null, 2),
           inventorys: inventorys,
           productionAccounting: this.component.props.productionAccounting
       }

       this.injections.reduce('load', parmasObj)
    }

    onTabFocus = async (params) => { 
        this.load()
    }

    onOk = async() => {
        let details = this.metaAction.gf('data.form.details').toJS(), date=this.metaAction.gf('data.date')

        let newDetails = fromJS(details).toJS()
        newDetails = details.filter(obj => obj.inventoryId || obj.inventoryName)

        if (newDetails && newDetails.length == 0) {
            this.metaAction.toast('error', '请至少填写一条数据')
            return false
        }
        const checkRes = await this.saveCheck(newDetails)
        if(!checkRes) return false

        newDetails.forEach(item => {
            if (item.errorQuantity != undefined) {
                delete item.errorQuantity
            }

            if (typeof item.amount == 'undefined') {
                item.amount = 0
            }
            if (typeof item.price == 'undefined') {
                item.price = 0
            }
            if (typeof item.gapAmount == 'undefined') {
                item.gapAmount = 0
            }
            if (typeof item.gapQuantity == 'undefined') {
                item.gapQuantity = 0
            }

            if (typeof item.periodEndAmount == 'undefined') {
                item.periodEndAmount = 0
            }
            if (typeof item.periodEndQuantity == 'undefined') {
                item.periodEndQuantity = 0
            }

        })

        newDetails = newDetails.filter(obj => obj.quantity)
     
        const parmasObj={
            businessDate: date,
            flag: checkRes,
            details: newDetails
        }
        const res = await this.webapi.dateCard.raAcCrMaterials(parmasObj)

        if (res) {
            if (!(this.component.props.initData && this.component.props.initData.isCard)) {
                this.metaAction.toast('success', `${res.code}保存成功`)
                return 
            }
        }
        return res
    }


    saveCheck = async(details) => {
        let amount = this.metaAction.gf('data.amount') || '0.00'
        let amountTotal = this.voucherAction.sumColumn('amount')

        // console.log(amount, amountTotal)
        if (typeof amount== 'string') {
            amount = amount.replace(',', '')
        }
        if (typeof amountTotal== 'string') {
            amountTotal = amountTotal.replace(',', '')
        }

        // 去掉金额必须相等的控制
        // if (Number(amount) != Number(amountTotal)) {
        //     this.metaAction.toast('error', '领料出库金额合计必须等于产成品入库直接材料余额')
        //     return false
        // }

        if (Number(amount) != Number(amountTotal)) {

            const tip = Number(amountTotal) > Number(amount) ? '领料出库金额合计大于产成品入库成本，是否继续?' 
            : '领料出库金额合计小于产成品入库成本，是否继续?'
            const res = await this.metaAction.modal('confirm',{
                width: 450,
                content: tip,
                bodyStyle: { padding: 24, fontSize: 12 },
            })

            if(!res) {
                return false
            }
        }

        let errorList = [], isHaveGap = false, errorPriceList=[]
        details.forEach((item, index) => {
            // 把数量必填去掉
            // if (!item.quantity) {
            //     errorList.push(index)
            // }

            if (item.price < 0) {
                errorPriceList.push(item)
            }

            // if (item.gapQuantity) {
            if (item.gapQuantity>0 && item.gapAmount>0) {
                isHaveGap = true
            }
        })

        if (errorList.length) {
            this.metaAction.toast('error', '领料出库数量不能为空或0')

            let detailsold = this.metaAction.gf('data.form.details').toJS()
            detailsold.map(item => {
                if (item.inventoryId && item.inventoryName && !item.quantity) {
                    item.errorQuantity = true
                }
                return item
            })
            this.metaAction.sf('data.form.details', fromJS(detailsold))

            return false
        }
        if (errorPriceList.length) {
            this.metaAction.toast('error', 
                <div>
                    {
                        errorPriceList.map((item, index) => {
                            return <p>{`${item.inventoryCode} ${item.inventoryName} 的期末结存单价为负数，无法领料出库，请修改库存单据使期末结存单价不为负数才可领料出库`}</p>
                        })
                    }
                </div>
            )
            return false
        }

        if (isHaveGap) {
            const res = await this.metaAction.modal('confirm',{
                content: '库存数量不足，是否按照库存缺口自动生成暂估入库单？'
            })

            if (res) {
                return 'yes'
            }

            return 'no'
        }

        return true
    }

    onCancel = () => {
        this.component.props.closeModal()
    }

    renderSelectOption = (index, data, name) => {
        // console.log(index, data, 'data ')
        const inventorys = this.metaAction.gf('data.other.inventorys').toJS()
        // console.log(inventorys, 'inventorys renderSelectOption')
        if (name == 'inventoryCode') {
            return inventorys.map((item) => {
                return <Option key={item.id} value={item.id} title={item.code}>{item.code}</Option>
            })
        }
        return inventorys.map((item) => {
            // const name = item.fullName ? item.fullName : `${item.code} ${item.name}`
            return <Option key={item.id} value={item.id} title={item.name}>{this.getFullNameChildren(item)}</Option>
        })
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

    // 新增存货
    addArchive = async(fieldName, index, rowData) => {
        const inventoryItemOld = this.metaAction.gf('data.other.inventoryItem') && this.metaAction.gf('data.other.inventoryItem').toJS()
        let inventoryItem = await this.voucherAction.addInventory('data.other.inventoryItem', 'get')
        let inventorys = this.metaAction.gf('data.other.inventorys').toJS(), sfsObj={},date=this.metaAction.gf('data.date')
        
        // console.log(inventorys, 'inventorys addArchive')
        if (inventoryItemOld && inventoryItemOld.id == inventoryItem.id) { // 若是取消状态
            inventoryItem = null
        }

        const currentOrg = this.metaAction.context.get("currentOrg")
        let propertyIdYCL = currentOrg.vatTaxpayer == '2000010001' ? 2 : 11
        let propertyIdZZCL = currentOrg.vatTaxpayer == '2000010001' ? 4 : 13
        
        if (inventoryItem && (inventoryItem.propertyId == propertyIdYCL || inventoryItem.propertyId == propertyIdZZCL)) {
            inventoryItem = this.getFullName([inventoryItem])[0]
            inventorys.push(inventoryItem)
            sfsObj['data.other.inventorys'] = fromJS(inventorys)

            let field = {
                id: `data.form.details.${index}.inventoryId`,
                name: `data.form.details.${index}.inventoryName`,
                code: `data.form.details.${index}.inventoryCode`,
                specification: `data.form.details.${index}.specification`,
                unitId: `data.form.details.${index}.unitId`,
                unitName: `data.form.details.${index}.unitName`
            }

            const value = fromJS(inventoryItem)
            Object.keys(field).forEach(key => {
                sfsObj[field[key]] = value.get(key)
            })

            if (inventoryItem.id) {
                const res = await this.webapi.dateCard.loadPeriodEndData({inventoryId: inventoryItem.id, businessDate: date})
                if (res) {
                    sfsObj["data.form.details."+index+".periodEndQuantity"] = res.periodEndQuantity
                    sfsObj["data.form.details."+index+".periodEndAmount"] = res.periodEndAmount
                    sfsObj["data.form.details."+index+".price"] = res.price
                }
            }

            this.metaAction.sfs(sfsObj)
        }
    }

    onFieldChange = (field, storeField,rowIndex,rowData) => async(id) => {
        if (!field || !storeField) return

        let store = this.metaAction.gf(storeField), value=null, sfsObj={}, date=this.metaAction.gf('data.date')
        if(store){
            value = store.find(o => o.get('id') == id)
        }
        if (value) {
            Object.keys(field).forEach(key => {
                // this.metaAction.sf(field[key], value.get(key))
                sfsObj[field[key]] = value.get(key)
            })
        }else{
            Object.keys(field).forEach(key => {
                // this.metaAction.sf(field[key], undefined)
                sfsObj[field[key]] = undefined
            })
        }
        this.metaAction.sfs(sfsObj)
        if (id) {
            const res = await this.webapi.dateCard.loadPeriodEndData({inventoryId: id, businessDate: date})
            let sfsObj2={},
            quantity = this.metaAction.gf("data.form.details."+rowIndex+".quantity") || 0,
            amount = this.metaAction.gf("data.form.details."+rowIndex+".amount") || 0

            if (res) {
                sfsObj2["data.form.details."+rowIndex+".periodEndQuantity"] = res.periodEndQuantity
                sfsObj2["data.form.details."+rowIndex+".periodEndAmount"] = res.periodEndAmount
                sfsObj2["data.form.details."+rowIndex+".price"] = res.price

                // sfsObj2["data.form.details."+rowIndex+".gapQuantity"] = utils.number.round(rowData.quantity-rowData.periodEndQuantity, 6)
                // sfsObj2["data.form.details."+rowIndex+".gapAmount"] = utils.number.round(rowData.amount-rowData.periodEndAmount, 2)
                sfsObj2["data.form.details."+rowIndex+".gapQuantity"] = utils.number.round(quantity-res.periodEndQuantity, 6)
                sfsObj2["data.form.details."+rowIndex+".gapAmount"] = utils.number.round(amount-res.periodEndAmount, 2)

                this.metaAction.sfs(sfsObj2)
            }
            // console.log(res, 'res 111111')
        } else {
            let details = this.metaAction.gf('data.form.details').toJS()
            // console.log(rowData, details[rowIndex], 'rowData') 

            if (rowData.errorQuantity) {
                details[rowIndex].errorQuantity = false
                this.metaAction.sf('data.form.details', fromJS(details))
            }
        }
        // this.metaAction.sfs(sfsObj)
    }

    quantityFormat = (quantity, decimals, isFocus, type) => {
        if(quantity) {
            if (type =="gap") {
                const res = this.voucherAction.numberFormat(quantity, decimals, isFocus)
                return Number(res) > 0 ? res : ''
            } else {
                return this.voucherAction.numberFormat(quantity, decimals, isFocus)
            }
        }
    }

    renderDisableAmount = (rowData, rowIndex) => {
        let periodEndQuantity = utils.number.round(rowData.periodEndQuantity, 2) ,
        periodEndAmount = utils.number.round(rowData.periodEndAmount, 2)

        let periodPrice = utils.number.round(periodEndAmount/periodEndQuantity, 2)

        if (periodPrice == 0) return false
        return true
    }

    handleProRata = () => {
        let details = this.metaAction.gf('data.form.details').toJS(),
        periodEndAmount = this.voucherAction.sumColumn('periodEndAmount'),
        amount = this.metaAction.gf('data.amount')

        details = details.filter(obj => obj.inventoryId || obj.inventoryName)
        if (details.length == 0) {
            this.metaAction.toast('error', '请先选择待出库的原料')
            return
        }

        if(typeof amount == 'string') amount = amount.replace(',', '')
        amount = utils.number.round(amount, 2)
        let totalAmount = 0
        periodEndAmount = typeof periodEndAmount == 'string' ? periodEndAmount.replace(',', '') : periodEndAmount
        periodEndAmount = utils.number.round(periodEndAmount, 2)
        details.map(item => {
            const amountRatio = utils.number.round(item.periodEndAmount/periodEndAmount, 2)
            item.amount = utils.number.round(amount * amountRatio, 2)
            item.quantity = item.price ? utils.number.round(item.amount/item.price, 6) : null

            if (!item.periodEndAmount || item.periodEndAmount == 0) {
                item.price = null
            }

            const amountItem = typeof item.amount == 'string' ? Number(item.amount.replace(',', '')): item.amount
            totalAmount = totalAmount + amountItem
            // totalAmount = utils.number.round(totalAmount + item.amount, 2)
            return item
        })

        // const totalAmount = this.voucherAction.sumColumn('amount')
        const syAmount = utils.number.round(amount-totalAmount, 2)
          
        if (syAmount) {

            let aboutLastRow = null,
            newDeatils = []

            if (details[details.length-1].periodEndAmount)  {
                aboutLastRow = details[details.length-1]
            } else {
                newDeatils = details.filter(obj => obj.periodEndAmount&&obj.periodEndAmount!=0)
                aboutLastRow = newDeatils[newDeatils.length-1]
            }

            if (aboutLastRow) {
                const lastRowAmount = aboutLastRow.amount||0,
                lastRowPrice = aboutLastRow.price||0
    
                aboutLastRow.amount = utils.number.round(lastRowAmount + syAmount, 2)
                aboutLastRow.quantity = lastRowPrice ? utils.number.round(aboutLastRow.amount/lastRowPrice, 6) : null
                
                // aboutLastRow.quantity = lastRowPrice ? utils.number.round(lastRowAmount/lastRowPrice, 6) : null
            }

            if (details[details.length-1].periodEndAmount == 0) {
                details.map(item => {
                    const obj = newDeatils.find(obj => obj.id == item.id)
                    if (obj) item = obj
                    return item
                })
            }
        }


        while(details.length<7){
            details.push(blankDetail)
        }

        this.metaAction.sf('data.form.details', fromJS(details))
    }

    calc = (name, rowIndex, rowData) => (v) => {
        // console.log(v, '66666')
        if (typeof v == 'string') {
            v = v.replace(',', '')
        }
        let sfsObj = {}, details = this.metaAction.gf('data.form.details').toJS(), isChange = false


        // let periodEndQuantity = utils.number.round(rowData.periodEndQuantity, 2) ,
        // periodEndAmount = utils.number.round(rowData.periodEndAmount, 2)

        // let periodPrice = utils.number.round(periodEndAmount/periodEndQuantity, 2)

        if (name == 'quantity') {
            let price = utils.number.round(rowData.price, 6),
            quantity =  Number(v),
            periodEndQuantity = rowData.periodEndQuantity || 0,
            periodEndAmount = rowData.periodEndAmount || 0,
            periodPrice = utils.number.round(periodEndAmount/periodEndQuantity, 2)

            if (periodPrice != 0) {
                if (price) {
                    let amount = utils.number.round(price * quantity, 2)
                    sfsObj[`data.form.details.${rowIndex}.quantity`]= quantity
                    sfsObj[`data.form.details.${rowIndex}.amount`]= amount
    
                    let gapQuantity = utils.number.round(quantity-periodEndQuantity, 6)
                    if (gapQuantity > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= gapQuantity
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(0, 6)
                    }
    
                    let gapAmount = utils.number.round(amount-periodEndAmount, 2)
                    if (gapAmount > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= gapAmount
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(0, 2)
                    }
    
                } else {
                    sfsObj[`data.form.details.${rowIndex}.quantity`]= quantity
                    if (utils.number.round(quantity-periodEndQuantity, 6) > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(quantity-periodEndQuantity, 6)
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(0, 6)
                    }
                }
            } else {
                let amount = utils.number.round(rowData.amount, 2)
                sfsObj[`data.form.details.${rowIndex}.quantity`]= quantity
                if (amount) {
                    sfsObj[`data.form.details.${rowIndex}.price`]= utils.number.round(amount/quantity, 6)
                }
                if (utils.number.round(quantity-periodEndQuantity, 6) > 0) {
                    sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(quantity-periodEndQuantity, 6)
                } else {
                    sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(0, 6)
                }
            }

            // if (quantity) sfsObj[`data.other.error.${rowIndex}.quantity`] = false
            if (quantity) {
                isChange = true
                details[rowIndex].errorQuantity = false
            }
        } else if (name == 'amount') {
            let price = utils.number.round(rowData.price, 6),
            amount = Number(v),
            periodEndAmount = rowData.periodEndAmount || 0,
            quantity = null,
            periodEndQuantity = rowData.periodEndQuantity || 0,
            periodPrice = utils.number.round(periodEndAmount/periodEndQuantity, 2)

            if (periodPrice != 0) {
                if (price) {
                    quantity = utils.number.round(amount/price, 6)
    
                    sfsObj[`data.form.details.${rowIndex}.quantity`]= quantity
                    sfsObj[`data.form.details.${rowIndex}.amount`]= amount
    
                    let gapAmount = utils.number.round(amount-periodEndAmount, 2)
                    if (gapAmount > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= gapAmount
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(0, 2)
                    }
    
                    let gapQuantity = utils.number.round(quantity-periodEndQuantity, 6)
                    if (gapQuantity > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= gapQuantity
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapQuantity`]= utils.number.round(0, 6)
                    }
                    
                } else {
                    sfsObj[`data.form.details.${rowIndex}.amount`]= amount
    
                    if (utils.number.round(amount-periodEndAmount, 2) > 0) {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(amount-periodEndAmount, 2)
                    } else {
                        sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(0, 2)
                    }
                }
            } else {
                quantity = utils.number.round(rowData.quantity, 2)
                
                sfsObj[`data.form.details.${rowIndex}.amount`]= amount
                if (quantity) {
                    sfsObj[`data.form.details.${rowIndex}.price`]= utils.number.round(amount/quantity, 6)
                }
                
                if (utils.number.round(amount-periodEndAmount, 2) > 0) {
                    sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(amount-periodEndAmount, 2)
                } else {
                    sfsObj[`data.form.details.${rowIndex}.gapAmount`]= utils.number.round(0, 2)
                }
            }


            // if (quantity) sfsObj[`data.other.error.${rowIndex}.quantity`] = false
            if (quantity) {
                isChange = true
                details[rowIndex].errorQuantity = false
            }
        }
       

        if (isChange) {
            this.metaAction.sf('data.form.details', fromJS(details))
        }
        this.metaAction.sfs(sfsObj)
    }

    filterOption = (inputValue, option, name) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props || !option.props.value) {
            return false
        }
        //需要确定部门项目这些是否也需要支持助记码这些的搜索
        let parmasName = null, parmasNameCode = null
        if (name.currentPath) {
            parmasName= name.currentPath
        }
        if (parmasName.indexOf('inventory') != -1) {
            parmasName = 'inventorys'
            parmasNameCode = 'inventoryCode'
        } 

        const paramsValues = this.metaAction.gf(`data.other.${parmasName}`)
        let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

        if (!paramsValue) {
            return false
        }

        let regExp = new RegExp(inputValue, 'i')
        if(parmasNameCode){
            return paramsValue.get('name').search(regExp) != -1
            || paramsValue.get('code').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        }else{
            return paramsValue.get('name').search(regExp) != -1
            // || paramsValue.get('helpCode').search(regExp) != -1 // TODO 只支持助记码搜索，简拼
        }
    }                            

    // 自动领料
    handleClickMenu = (e) => {
        this[e.key] && this[e.key](e.key)
    }

    /**
     * 选择原材料 start *******************
     */
    // 新增存货
    addInventory = async(id) => {
		let option = { title: '', appName: '', id: id };
		option.title = '存货';
		option.appName = 'app-card-inventory';
        let res = await this.addModel(option);

        const currentOrg = this.metaAction.context.get("currentOrg")
        let propertyIdYCL = currentOrg.vatTaxpayer == '2000010001' ? 2 : 11
        let propertyIdZZCL = currentOrg.vatTaxpayer == '2000010001' ? 4 : 13

        if (res && (res.propertyId == propertyIdYCL || res.propertyId == propertyIdZZCL)) {
            let inventorys = this.metaAction.gf('data.other.inventorys').toJS()
            res = this.getFullName([res])[0]
            inventorys.push(res)
            this.metaAction.sf('data.other.inventorys', fromJS(inventorys))
        }
        return res
	}

	addModel = async (option) => {
        let queryByparamKeys = []
        // //获取生成凭证设置
		// this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
        // .then((res) => {
        //     console.log(res, 'res')
        //     // this.queryByparamKeys = res
        //     queryByparamKeys= res || []
        // })

		let className = 'app-list-inventory-modal'
		//把生成凭证设置传入 card
		let queryByparamKeyNum = 0
		this.queryByparamKeys.forEach(function (data) {
        // queryByparamKeys.forEach(function (data) {
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
			// height: 530,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id,
				// queryByparamKeys: queryByparamKey
			})
		});
		if (ret) {
            return ret
		}
    };

    // 获取存货（选择产成品生成 选择原料生成）
    getInventory = async (parmas, type, searchContent, inventoryType, sort) => {
        // console.log(sort, 'sort')
        let fuzzyCondition, attributeList
        let option = ["原材料","周转材料"]
        
        if (type == 'search' && parmas != '') {
            fuzzyCondition = type == 'search' ? parmas : ''
            attributeList = inventoryType ? (inventoryType == '' ? option : [inventoryType]) : option
        } else if (parmas && type == 'change') {
            attributeList = parmas == '' ? option : [parmas]
            fuzzyCondition = searchContent ? searchContent : ''
        } else if(type == 'search' && parmas == '' && inventoryType){
            fuzzyCondition=''
            attributeList = inventoryType == '' ? option : [inventoryType]
        } else if(type == 'add' && parmas == ''){
            fuzzyCondition= searchContent ? searchContent : ''
            attributeList = inventoryType ? (inventoryType == '' ? option : [inventoryType]) : option
        } else{
            fuzzyCondition=''
            attributeList = option
        }

        let date = this.metaAction.gf('data.date')
        const list = [
            // this.webapi.dateCard.queryInventory({ 
            this.webapi.dateCard.queryMaterialPro({
                entity: {fuzzyCondition: fuzzyCondition, isEnable: true}, 
                attributeList: attributeList,
                businessDate: moment(date).format('YYYY-MM-DD'),
                orders:[{
                    name: sort.userOrderField ? sort.userOrderField : 'periodEndAmount', 
                    asc: sort.order ? sort.order == 'asc' ? true : false : false
                }]
            }),
            this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
        ]
        const res = await Promise.all(list)
        this.queryByparamKeys = res[1] || []
        if (res[0]) return res[0]
    }

    productSelectOk = async(arr) => {
        // console.log(arr, 'arr')
        const lastDay = this.component.props.initData.lastDay

        let details = arr.map(item => {
            let obj = {}
            obj.inventoryId = item.inventoryId
            obj.quantity = item.quantity
            return obj
        })
        const parmasObj={
            businessDate: lastDay,
            details: details
        }

        const res = await this.webapi.dateCard.selectMaterial(parmasObj)
        if (res && res.details.length) {
            while (res.details.length < 7) {
                res.details.push(blankDetail)
            }

            this.metaAction.sf('data.form.details', fromJS(res.details))
        }
    }

    handleTip = (arr, quantityEmp, type) => {
        let tip = ''
        if (type == 'picking') {
            tip = '请选择数据'
        } else if (type == 'pickingNum') {
            tip = '领料金额必须大于等于0'
        } else if (type == 'percentage') {
            tip = '百分比必须大于0'
        }else {
            if (arr && arr.length == 0) {
                tip = '请选择领料存货'
            } else if (quantityEmp) {
                tip = '请录入领料存货的数量'
            }
        }

        this.metaAction.toast('error', tip)
    }

    materialPro = async(key) => {
        // console.log('选择原材料')
        const selectList = [{id:2, name: '原材料'},{id:4, name: '周转材料'}]
        const amount = this.metaAction.gf('data.amount')
        const productAmount = this.metaAction.gf('data.productAmount')
        const productionAccounting = this.metaAction.gf('data.productionAccounting')
        const res =  await this.metaAction.modal('show',{
            title:'选择原料生成',
            width: '80%',
            className: 'productselectCss',
            children: <Productselect 
            addInventory={this.addInventory} 
            getInventory={this.getInventory}
            productSelectOk={this.productSelectOk}
            handleTip={this.handleTip} 
            productAmount={productAmount}
            amount={amount}
            title="领料存货"
            sumColumn={this.voucherAction.sumColumn}
            productionAccounting={productionAccounting}
            selectList={selectList}/>
        })
    }

    /**
     * 选择原材料 end **************
     */

    rawmMaterials = async() => {
        // console.log('按配置原料')
        const res = await this.webapi.dateCard.produceToSales()
        // console.log(res, '按配置原料')

        if (res) {

            if (res.inventoryDtos&&res.inventoryDtos.length) {
                const ret = await this.metaAction.modal('show',{
                    title: '以销定产流程',
                    wrapClassName: 'inventory-cardlc',
                    width: 490,
                    footer:'',
                    bodyStyle: {padding: '10px 50px'},
                    closeBack: (back) => { this.closeTip = back },
                    children: this.getInventoryDtos(res.inventoryDtos),
                })
            } else if (res.details && res.details.length) {
                while (res.details.length < 7) {
                    res.details.push(blankDetail)
                }
    
                this.metaAction.sf('data.form.details', fromJS(res.details))
            }
        }
    }

    getInventoryDtos = (inventoryDtos) => {
        return <div>
            <div className='content'>
                <Icon fontFamily='edficon' className='jinggaoIcon' type='jinggao'/>
                <div className='pdiv'>
                    {
                        inventoryDtos.map(item => {
                            return <p>{item.fullname+` 的存货尚未配置原料，无法自动领料，请先配置原料`}</p>
                        })
                    }
                </div>
            </div>
            <div className='footer'>
                <Button onClick={this.handleCancel}>取消</Button>
                <Button type='primary' onClick={this.handlePZYL}>配置原料</Button>
            </div>
        </div>
    }

    handlePZYL= () => {
        this.closeTip()
        this.onCancel()
        this.openMaterial()
    }
    handleCancel= () => {
        this.closeTip()
    }

     //跳转到配置原料界面
     openMaterial = async () => {
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('配置原料', 
            'app-scm-raw-material-list', { accessType: 1 })
    }

    renderSyAmount = () => {
        let amount = this.metaAction.gf('data.amount') || '0.00'
        let amountTotal = this.voucherAction.sumColumn('amount')
        amount = clearThousPos(amount, true)
        amountTotal = clearThousPos(amountTotal, true)
        return addThousPos(Number(amount)-Number(amountTotal), true, null, 2) || '0.00'
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	
	return ret

}