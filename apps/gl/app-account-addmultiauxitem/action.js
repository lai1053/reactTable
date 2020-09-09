import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import * as data from '../app-account-beginbalance/data'
import config from './config'
import { fromJS, List } from 'immutable'
import utils from 'edf-utils'
import { Select, Button, Modal, Input, Number, Checkbox, Icon, Popconfirm, FormDecorator} from 'edf-component'
const Option = Select.Option;

const ExtendEditableSelectCell = ({ dataSource, onChange, value, columnName, onClick, disabled, saveNewVlue, handleFoucus,_data}) => {
  let productChildren = []
  //新增按钮 实现新增档案
  const dropdownFooter = <Button type='primary' style={{ width: '100%', borderRadius: '0' }} onClick={onClick}>新增</Button>
  if (dataSource) {
    dataSource.forEach((item,index) => {
      productChildren.push(<Option title={item.name} _data={item} value={item.id}>{columnName=='department'||columnName=='person'?item.name:item.code+' '+item.name}</Option>)
    })
  }
  else{
    if(value && value.id==1){
      productChildren.push(<Option title={value.name} _data={value} value={value.id}>{value.name}</Option>)
    }else{

    }
  }
  return (
    <div style={{width: '100%'}}>
      <Select style={{ width: '100%' }}
      onChange={(value) => onChange(value)}
      filterOptionExpressions="code,name,helpCode,helpCodeFull"
      dropdownClassName = {'addmultiauxitemModal'}
      disabled={disabled}
      value={(value && value.id && value.id !=1) ? value.id  : value && value.id && value.id==1?value.name:''}
      // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      dropdownFooter={dropdownFooter} onFocus={handleFoucus}>
        {productChildren}
      </Select>
    </div>
  )
}

const EditableCell = ({ value, onBlur, onEnter , customAttribute, columnName,disabled}) => {
  let regex
  if(columnName == 'beginQuantityDr' || columnName == 'beginQuantityCr'|| columnName =='quantityDr'||columnName =='quantityCr'){
    regex = '^(-?[0-9]+)(?:\.[0-9]{1,6})?$'
  }else{
    regex = '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
  }
  return (
    <div>
      <Input.Number
        value={value}
        onBlur={(value) => onBlur(value)}
        onPressEnter={(e) => onEnter(e)} 
        disabled = {disabled}
        regex={regex}
        />
    </div>
  )
}

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
    this.customAttribute = Math.random()
    if (this.component.props.setOkListener)
      this.component.props.setOkListener(this.onOk)
    let initData = this.component.props.initData
    const calcDict = initData.calcDict
    let assistList = []
    for (const item in calcDict) {
      if (item.includes('isExCalc')) {
        assistList.push(item)
      }
    }
    this.loadArchive(initData.accountingSubject, assistList) //初始的时候加载每个下拉选的数据
    if(initData.type == 'edit'){
      let auxList = ['customer','department','person','inventory','project','supplier','currency', 'exCalc1', 'exCalc2','exCalc3','exCalc4','exCalc5','exCalc6','exCalc7','exCalc8','exCalc9','exCalc10']
      if(this.component.props.initData){
        let curItem = this.component.props.initData.curItem
        auxList.map(item => {
          if(curItem[`${item}Id`]){
            curItem[item] = {code: curItem[`${item}Code`], id: curItem[`${item}Id`], name: curItem[`${item}Name`]}
          }
          if(curItem[`${item}Dto`]){
            let str = `${item}`.substr(1)
            curItem[`isE${str}`]= {code: curItem[`${item}Dto`]['code'], id: curItem[`${item}Dto`]['id'], name: curItem[`${item}Dto`]['name']}
          }
        })
        initData.curItem = curItem
      }
    }else{
      initData.curItem = undefined
    }
    initData.type = this.component.props.initData.type
    injections.reduce('init', initData)
  }
  load = async () => {
    if(this.component.props.initData){
      this.metaAction.sf('data.other.type',this.component.props.initData.type)
      let curItem = this.component.props.initData.curItem
      if(curItem.customerName){
        curItem.customer = curItem.customerName
      }
      if(curItem.departmentName){
        curItem.department = curItem.departmentName
      }
      this.injections.reduce('load', [curItem])
    }
    
  }
  loadArchive = async (accountingSubject, assistList) => {
    if (accountingSubject.isCalcCustomer) {
      const response = await this.webapi.customer.queryList()
      this.metaAction.sf('data.other.customers', fromJS(response.list))
    }
    if (accountingSubject.isCalcDepartment) {
      const response = await this.webapi.department.queryList()
      this.metaAction.sf('data.other.departments', fromJS(response.list))
    }
    if (accountingSubject.isCalcPerson) {
      const response = await this.webapi.person.queryList()
      this.metaAction.sf('data.other.persons', fromJS(response.list))
    }
    if (accountingSubject.isCalcSupplier) {
      const response = await this.webapi.supplier.queryList()
      this.metaAction.sf('data.other.suppliers', fromJS(response.list))
    }
    if (accountingSubject.isCalcInventory) {
      const response = await this.webapi.inventory.queryList()
      this.metaAction.sf('data.other.inventorys', fromJS(response.list))
    }
    if (accountingSubject.isCalcProject) {
      const response = await this.webapi.project.queryList()
      this.metaAction.sf('data.other.projects', fromJS(response.list))
    }
    if (accountingSubject.isCalcMulti) {
      const response = await this.webapi.currency.queryList()
      this.metaAction.sf('data.other.currencys', fromJS(response.list))
    }
    if (assistList.length) {
      for (let i = 0; i < assistList.length; i++) {
        if (accountingSubject[assistList[i]]) {
          const parmasObj = {entity:{calcName: assistList[i]}}
          const response = await this.webapi.isExCalc.queryList(parmasObj)
          this.metaAction.sf(`data.other.${assistList[i]}`, fromJS(response.list))
        }
      }
    }
  }

  renderColumns = (noName, columnName, index, _ctrlPath) => {
    let list = this.metaAction.gf('data.list'),
    isResetVisible = this.component.props.initData.isResetVisible,
    beginDisabled = false,
        value = list ? list.get(index).get(columnName) : ''
    if(!value){
      value = ''
    }else if(columnName == 'beginQuantityDr'||columnName == 'beginQuantityCr'||columnName =='quantityDr'||columnName =='quantityCr'){
      if(this.component.props.initData.type == 'add'){
        value = utils.number.format(value,6)
      }else if(this.component.props.initData.type == 'edit'){
        let num = data.clearThousandsPosition(value)
        value = value && data.addThousandsPosition(num.toFixed(6))
      }else{
        value = utils.number.format(value,6)
      }
    }else{
      if(this.component.props.initData.type == 'add'){
        value = utils.number.format(value,2)
      }else if(this.component.props.initData.type == 'edit'){
      let num = data.clearThousandsPosition(value)
      value = value && data.addThousandsPosition(num.toFixed(2))
      }else{
        value = utils.number.format(value,2)
      }
    }
    if(this.metaAction.gf('data.other.accountingSubject.directionName') == '借' && columnName == 'beginAmountCr' || 
    this.metaAction.gf('data.other.accountingSubject.directionName') == '贷' && columnName == 'beginAmountDr' ||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '借' && columnName == 'beginQuantityCr'||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '借' && columnName == 'beginOrigAmountCr'||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '借' && columnName == 'beginAmountCr'||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '贷' && columnName == 'beginQuantityDr' ||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '贷' && columnName == 'beginOrigAmountDr'||
    this.metaAction.gf('data.other.accountingSubject.directionName') == '贷' && columnName == 'beginAmountDr'
    ){
      beginDisabled = true
  }
    return (
      <EditableCell
        value={value}
        columnName = {columnName}
        disabled={!isResetVisible?true:beginDisabled?true:false}
        customAttribute = {this.customAttribute}
        onBlur={(value) => this.handleBlur(value, columnName, index)}
        onEnter={(e) => this.handleEnter(e, index, columnName)}
      />
    )
  }
  quantityFormat = (quantity, decimals, isFocus) => {
    if (quantity) {
        return this.voucherAction.numberFormat(quantity, decimals, isFocus)
    }
  }
  handleEnter = (e, rowIndex, columnName) => {
    if (e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108) {
        const inputs = document.getElementsByClassName('ant-input mk-input-number')
        const index = $(inputs).index(e.target)
        let newValue = e.target.value,list = this.metaAction.gf('data.list', list),errorMessage = this.getErrorMessage(columnName)
        if (newValue && newValue > 9999999999.99) {
          this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
          return
        }
        if (newValue && newValue < -9999999999.99) {
          this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
          return
        }
        if (newValue && newValue.indexOf(',') > -1) {
          newValue = newValue.replace(/,/g, '')
        }
        if (isNaN(newValue)) {
            this.metaAction.toast('warning', '请输入数字')
            return
        }
        inputs[index+1].focus()
    }
}

  handleBlur = (value, columnName, index) => {
    let listInput = this.metaAction.gf('data.list'),
        errorMessage = this.getErrorMessage(columnName)
        this.customAttribute = Math.random()
    let values
    if (value) {
      if (value.toString().indexOf(',') > -1) {
        values = value.replace(/,/g, '')
      } else {
        values = parseFloat(value).toFixed(6)
      }
    }
    
    const accountType = this.metaAction.gf('data.other.accountingSubject').toJS().accountType
    if (values && isNaN(values)) {
      this.metaAction.toast('warning', '请输入数字')
      return
    }
    if (values > 9999999999.99) {
      this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
      return
    }
    if (values < -9999999999.99) {
      this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
      return
    }
    if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'amountDr') {
      listInput = listInput.update(index, item => item.set('amountCr', values))
    } else if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'amountCr') {
      listInput = listInput.update(index, item => item.set('amountDr', values))
    }

    if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'origAmountCr') {
      listInput = listInput.update(index, item => item.set('origAmountDr', values))
    } else if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'origAmountDr') {
      listInput = listInput.update(index, item => item.set('origAmountCr', values))
    }
    //本年借方和贷方的数量也要保持一致
    if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'quantityDr') {
      listInput = listInput.update(index, item => item.set('quantityCr', values))
    } else if ((accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) && columnName == 'quantityCr') {
      listInput = listInput.update(index, item => item.set('quantityDr', values))
    }
    if (this.metaAction.gf('data.other.currencys')) {
      const currencyList = this.metaAction.gf('data.other.currencys').toJS()
      const currency = listInput.get(index).get('currency') ? listInput.get(index).get('currency').toJS() : ''
  
      currencyList.forEach((item) => {
        if (item.id == currency.id && item.isBaseCurrency) {
          switch (columnName) {
            case 'beginOrigAmountDr':
              listInput = listInput.update(index, item => item.set('beginAmountDr', values))
              break;
            case 'beginOrigAmountCr':
            listInput = listInput.update(index, item => item.set('beginAmountCr', values))
            break;
            case 'beginAmount':
              listInput = listInput.update(index, item => item.set('beginOrigAmount', values))
              break;
            case 'beginAmountDr':
            listInput = listInput.update(index, item => item.set('beginOrigAmountDr', values))
            break;
            case 'beginAmountCr':
            listInput = listInput.update(index, item => item.set('beginOrigAmountCr', values))
            break;
            case 'origAmountDr':
              if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) {
                listInput = listInput.update(index, item => item.set('amountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountCr', values))
                listInput = listInput.update(index, item => item.set('amountCr', values))
              } else {
                listInput = listInput.update(index, item => item.set('amountDr', values))
              }
              break;
            case 'amountDr':
              if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) {
                listInput = listInput.update(index, item => item.set('amountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountCr', values))
                listInput = listInput.update(index, item => item.set('amountCr', values))
              } else {
                listInput = listInput.update(index, item => item.set('origAmountDr', values))
              }
              break;
            case 'amountCr':
              if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) {
                listInput = listInput.update(index, item => item.set('amountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountCr', values))
                listInput = listInput.update(index, item => item.set('amountCr', values))
              } else {
                listInput = listInput.update(index, item => item.set('origAmountCr', values))
              }
              break;
            case 'origAmountCr':
              if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS || accountType == data.ACCOUNTTYPE_income || accountType == data.ACCOUNTTYPE_expenses) {
                listInput = listInput.update(index, item => item.set('amountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountDr', values))
                listInput = listInput.update(index, item => item.set('origAmountCr', values))
                listInput = listInput.update(index, item => item.set('amountCr', values))
              } else {
                listInput = listInput.update(index, item => item.set('amountCr', values))
              }
              break;
            case 'quantityCr':
              listInput = listInput.update(index, item => item.set('quantityCr', values))
              break;
            case 'quantityDr':
              listInput = listInput.update(index, item => item.set('quantityDr', values))
              break;
            default: return ''
          }
        }
      })
    }
    
    listInput = listInput.update(index, item => item.set(columnName, values))
    this.metaAction.sf('data.list', listInput)
  }

  renderSelectColumns = (dataSource, columnName, index) => {
    let editable = true
    let list = this.metaAction.gf('data.list')
    const value = list.get(index).get(columnName) && list.get(index).get(columnName).toJS ? list.get(index).get(columnName).toJS() : list.get(index).get(columnName)
    let isResetVisible = this.component.props.initData.isResetVisible
    return (
      <ExtendEditableSelectCell
        editable={editable}
        onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource)}
        dataSource={dataSource}
        disabled = {!isResetVisible}
        value={value}
        columnName={columnName}
        onClick={() => {this.handleOnClickAdd(columnName, index)}}
        handleFoucus={() => this.handlerFoucus(columnName, index)}
      />
    )
  }
  handlerFoucus = async(columnName,index) => {
    let params={isEnable:true}  //获取没有停用基础档案
    let paramsNew={entity:{isEnable:true}}
		if (columnName == 'customer') {
			const response = await this.webapi.customer.queryList(paramsNew)
      this.metaAction.sf('data.other.customers', fromJS(response.list))

		} else if (columnName == 'department') {
			const response = await this.webapi.department.queryList({entity:{isEnable:true,isEndNode:true}})
      this.metaAction.sf('data.other.departments', fromJS(response.list))

		} else if (columnName == 'person') {
			const response = await this.webapi.person.queryList(paramsNew)
      this.metaAction.sf('data.other.persons', fromJS(response.list))
		} else if (columnName == 'inventory') {
			//存货
			const response = await this.webapi.inventory.queryList(paramsNew)
      this.metaAction.sf('data.other.inventorys', fromJS(response.list))

		} else if (columnName == 'supplier') {
			//供应商
			const response = await this.webapi.supplier.queryList(paramsNew)
      this.metaAction.sf('data.other.suppliers', fromJS(response.list))
		} else if (columnName == 'project') {
			//项目
      const response = await this.webapi.project.queryList(paramsNew)
      this.metaAction.sf('data.other.projects', fromJS(response.list))
    } else if (columnName == 'currency'){
      //币种
      const response = await this.webapi.currency.queryList(paramsNew)
      this.metaAction.sf('data.other.currencys', fromJS(response.list))
    } else if (columnName.indexOf('ExCalc') > -1) {
			let index = columnName.substr(columnName.length-1, 1)
      const parmasObj = {entity:{calcName: `isExCalc${index}`,isEnable:true}}
      const response = await this.webapi.isExCalc.queryList(parmasObj)
      this.metaAction.sf(`data.other.${columnName}`, fromJS(response.list))
    }
    
    let list = this.metaAction.gf('data.list')
    let newList = list.toJS()
    if (index == newList.length - 1 && this.component.props.initData.type == 'add') {
      const attributeArr = Object.keys(newList[0])
      let newObj = {}
      attributeArr.forEach((item) => {
        newObj[item] = undefined
      })
      newList.push(newObj)
    }
    list = fromJS(newList)
    this.metaAction.sf('data.list', list)
  }

  handleOnClickAdd = async (value, rowIndex) => {
    let list = this.metaAction.gf('data.list').toJS()
    switch (value) {
			case 'customer':
        await this.voucherAction.addCustomer(`data.list.${rowIndex}.customer`)
        this.resetListAdd(rowIndex, value)
				break;
			case 'department':
        await this.voucherAction.addDepartment(`data.list.${rowIndex}.department`)
        this.resetListAdd(rowIndex, value)
				break;
			case 'person':
        await this.voucherAction.addPerson(`data.list.${rowIndex}.person`)
        this.resetListAdd(rowIndex, value)
				break;
			case 'inventory':
        await this.voucherAction.addInventory(`data.list.${rowIndex}.inventory`)
        this.resetListAdd(rowIndex, value)
				break;
			case 'supplier':
        await this.voucherAction.addSupplier(`data.list.${rowIndex}.supplier`)
        this.resetListAdd(rowIndex, value)
				break;
			case 'project':
        await this.voucherAction.addProject(`data.list.${rowIndex}.project`)
        this.resetListAdd(rowIndex, value)
        break;
      case 'currency':
        await this.voucherAction.addCurrency(`data.list.${rowIndex}.currency`)
        this.resetListAdd(rowIndex, value)
        break;
			default:
        this.openUserDefineCard(value,rowIndex)
    }
  }

  resetListAdd = (rowIndex, columnName) => {
    if (this.metaAction.gf(`data.list.${rowIndex}.${columnName}`)) {
      const res = this.metaAction.gf(`data.list.${rowIndex}.${columnName}`).toJS()
      if (columnName.indexOf('ExCalc') > -1) {
        const value = this.metaAction.gf(`data.other.${columnName}`).toJS()
        value.push(res)
        this.metaAction.sf(`data.other.${columnName}`, fromJS(value))
      } else {
        const newValue = this.metaAction.gf(`data.other.${columnName}s`).toJS()
        newValue.push(res)
        this.metaAction.sf(`data.other.${columnName}s`, fromJS(newValue))
      }
    }
  }

  openUserDefineCard = async (fieldName, rowIndex) => {
    const assist = this.metaAction.gf('data.assist').toJS()
    const addName = assist[fieldName]

    const ret = await this.metaAction.modal('show', {
      title: `新增${addName}`,
      width: 400,
      children: this.metaAction.loadApp('app-card-userdefinecard', {
        store: this.component.props.store,
        activeKey: addName
      }),
    })

    if (ret && ret.isEnable) {
      let address = `data.list.${rowIndex}.${fieldName}`
      this.injections.reduce('setUserDefineItem', address, ret)
      this.resetListAdd(rowIndex, fieldName)
    }
  }

  handleSelectChange = (value, columnName, index, dataSource) => {
    let list = this.metaAction.gf('data.list'), accountType = this.metaAction.gf('data.other.accountingSubject').toJS().accountTypeId
    const selectObj = dataSource.filter((item) => item.id == value)
    const obj = {}
    obj.id = selectObj[0].id ? selectObj[0].id : ''
    obj.code = selectObj[0].code ? selectObj[0].code : ''
    obj.name = selectObj[0].name ? selectObj[0].name : ''
    list = list.update(index, item => item.set(columnName, fromJS(obj)))
      dataSource.forEach((objItem) => {
        if (objItem.id == obj.id && objItem.isBaseCurrency) {
          if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS) { //损益时 当贷方借方本位币有的得时候 外币要和本位币一致
                if (list.get(index).get('amountCr')) {
                  list = list.update(index, item => item.set('origAmountDr', list.get(index).get('amountCr')))
                  list = list.update(index, item => item.set('origAmountCr', list.get(index).get('amountCr')))
                }
              }
          } else {
            list = this.saveCheck(list, accountType)
          }
      })
    this.metaAction.sf('data.list', list)
    this.metaAction.sf('data.isShowScrollY', true)

  }

  onOk = async () => {
    let initData = this.metaAction.gf('data.other.accountingSubject'),
      dataList = this.metaAction.gf('data.list'),
      accountType = this.metaAction.gf('data.other.accountType'),
      enabledMonth = this.metaAction.gf('data.other.enabledMonth'),
      errorMsgList = this.checkAccFileMultiBeforeSave(dataList, initData),
      errorMsg = errorMsgList.errorMsg,
      isPeriodBeginAmount = errorMsgList.isPeriodBeginAmount
    for (let i = 0; i < dataList.size; i++) {
      let item = dataList.get(i)
      if (!item ||
        (!item.get('department')
          && !item.get('person')
          && !item.get('customer')
          && !item.get('supplier')
          && !item.get('inventory')
          && !item.get('project')
          && !item.get('currency')
          && !item.get('beginQuantityDr')
          && !item.get('beginQuantityCr')
          && !item.get('beginOrigAmountDr')
          && !item.get('beginOrigAmountCr')
          && !item.get('beginAmountDr')
          && !item.get('beginAmountCr')
          && !item.get('quantityDr')
          && !item.get('origAmountDr')
          && !item.get('amountDr')
          && !item.get('quantityCr')
          && !item.get('origAmountCr')
          && !item.get('amountCr'))
          && !item.get('isExCalc1')
          && !item.get('isExCalc2')
          && !item.get('isExCalc3')
          && !item.get('isExCalc4')
          && !item.get('isExCalc5')
          && !item.get('isExCalc6')
          && !item.get('isExCalc7')
          && !item.get('isExCalc8')
          && !item.get('isExCalc9')
          && !item.get('isExCalc10')
      ){

        dataList = dataList.delete(i)
        i--
      }
    }

    if (errorMsg && errorMsg.size > 0) {
      this.metaAction.toast('warning', this.getDisplayErrorMSg(errorMsg))
      return false
    }

    const addList = dataList.toJS()
    const newAddList = []
    addList.map((item) => {
      let obj = {}
      for (let value in item) {
        if (item[value]) {
          obj[value] = item[value]
        }
      }
      newAddList.push(obj)
    })

    if(accountType == data.ACCOUNTTYPE_PROFITANDLOSS && enabledMonth > 1 && isPeriodBeginAmount == true){
        const ret = this.metaAction.modal('confirm', {
          title: '',
          content: '损益类科目的期初数据录入有误，存在期初余额不为0的数据，是否继续保存？',
          onOk: async()=> {
            const {accountingSubject,rowIndex} = this.component.props.initData
            const list = this.saveCheck(dataList, rowIndex)
            const res = await this.component.props.callbackAction({result: true,value: list}, accountingSubject, rowIndex)
            if (!res) return false
          },
          onCancel() { }
      })

    }else{
      
        const {accountingSubject,rowIndex} = this.component.props.initData
        const res = await this.component.props.callbackAction({result: true,value: dataList}, accountingSubject, rowIndex, this.component.props.initData.type)
        if (!res) return false
    }
  }

  saveCheck = (dataList, accountType) => {
    if (this.metaAction.gf('data.other.currencys')) {
      const currencyList = this.metaAction.gf('data.other.currencys').toJS()
      const listData = dataList.toJS()
      let rowIndex
      currencyList.forEach((item) => {
        if (item.isBaseCurrency) {
          listData.forEach((key, keyIndex) => {
            if (key.currency && item.id == key.currency.id) {
              rowIndex = keyIndex
            }
          })
        }
        if (rowIndex == 0 || rowIndex) {
          const currency = dataList.get(rowIndex).get('currency') ? dataList.get(rowIndex).get('currency').toJS() : ''
          if (item.id == currency.id && item.isBaseCurrency) {
            const attributeArray=[[{key: 'beginAmountCr', value: ''},{key: 'beginOrigAmountCr', value: ''}],[{key: 'beginAmountDr', value: ''},{key: 'beginOrigAmountDr', value: ''}],[{key: 'beginAmount', value: ''},{key: 'beginOrigAmount', value: ''}],[{key: 'amountDr', value: ''},
            {key: 'origAmountDr', value: ''}],[{key: 'amountCr', value: ''},{key: 'origAmountCr', value: ''}]]
            let allTrue = false
            attributeArray.forEach((itemArr) => {
              itemArr.forEach((obj) => {
                if (dataList.get(rowIndex).get(obj.key)) {
                  obj.value = dataList.get(rowIndex).get(obj.key)
                }
              })
              
              if (itemArr[0].value && !itemArr[1].value) {
                dataList = dataList.update(rowIndex, item => item.set(itemArr[1].key, itemArr[0].value))
              } else if (!itemArr[0].value && itemArr[1].value) {
                dataList = dataList.update(rowIndex, item => item.set(itemArr[0].key, itemArr[1].value))
              } else if (itemArr[0].value && itemArr[1].value) {
                dataList = dataList.update(rowIndex, item => item.set(itemArr[1].key, itemArr[0].value))
              }
            })
          }
        }
      })
    }
    return dataList
  }

  getDisplayErrorMSg = (errorMsg) => {
    return <div style={{ display: 'inline-table' }}>{errorMsg.map(item => <div>{item}<br /></div>)}</div>
  }

  //保存前的数据校验sf
  checkAccFileMultiBeforeSave = (dataList, initData) => {
    let errorMsg = List(),
      accFileList = List(),
      allItemEmpty = true,
      isPeriodBeginAmount = false,
      isSelect = false

    for (let i = 0; i < dataList.size; i++) {
      let item = dataList.get(i),
        accFileItem = {}

      const calcDictList = this.metaAction.gf('data.calcDictList').toJS()
      const assistList = []
      if (calcDictList.length != 0) {
        for (const item in calcDictList) {
          if (item.includes('isExCalc')) {
            assistList.push({name: item, value: calcDictList[item]})
          }
        }
      }

      if (assistList.length != 0) {
        for (let i = 0; i < assistList.length; i++) {
          if (initData.get(assistList[i].name) && item.get(assistList[i].name)) {
            if (item.get(assistList[i].name).toJS().name){
              isSelect = true
            }
          }
        }
      }
      //跳过空行和只有摘要的行
      if (!item ||
        (!item.get('department')
          && !item.get('person')
          && !item.get('customer')
          && !item.get('supplier')
          && !item.get('inventory')
          && !item.get('project')
          && !item.get('currency')
          && !item.get('beginQuantityDr')
          && !item.get('beginQuantityCr')
          && !item.get('beginOrigAmountDr')
          && !item.get('beginOrigAmountCr')
          && !item.get('beginAmountDr')
          && !item.get('beginAmountCr')
          && !item.get('quantityDr')
          && !item.get('origAmountDr')
          && !item.get('amountDr')
          && !item.get('quantityCr')
          && !item.get('origAmountCr')
          && !item.get('amountCr') && !isSelect)) {
        continue
      }
      allItemEmpty = false
      isSelect = false

      // 辅助核算项是否为空
      let errorAccFile = ''

      if (initData.get('isCalcDepartment') && !item.get('department')) {
        errorAccFile += '，部门 '
      }
      if (initData.get('isCalcPerson') && !item.get('person')) {
        errorAccFile += '，人员 '
      }
      if (initData.get('isCalcCustomer') && !item.get('customer')) {
        errorAccFile += '，客户'
      }
      if (initData.get('isCalcSupplier') && !item.get('supplier')) {
        errorAccFile += '，供应商'
      }
      if (initData.get('isCalcInventory') && !item.get('inventory')) {
        errorAccFile += '，存货'
      }
      if (initData.get('isCalcProject') && !item.get('project')) {
        errorAccFile += '，项目'
      }
      if (initData.get('isCalcMulti') && !item.get('currency')) {
        errorAccFile += '，币种 '
      }
      if (assistList.length != 0) {
        for (let i = 0; i < assistList.length; i++) {
          if (initData.get(assistList[i].name) && !item.get(assistList[i].name)) {
            errorAccFile += `，${assistList[i].value} `
          }
        }
      }

      if (!!errorAccFile) {
        errorMsg = errorMsg.push("第" + (i + 1) + "行" + errorAccFile + "不能为空")
      }

      if (!!item.get('beginAmountDr') && item.get('beginAmountDr') != 0 && item.get('beginAmountDr') != '0' ||
       (!!item.get('beginAmountCr') && item.get('beginAmountCr') != 0 && item.get('beginAmountCr') != '0')) {
        isPeriodBeginAmount = true
      }
    }
    //5) 不能全为空行
    if (!!allItemEmpty) {
      errorMsg = errorMsg.push("请填写辅助明细!")
    }
    return { errorMsg: errorMsg, isPeriodBeginAmount: isPeriodBeginAmount }
  }

  getErrorMessage = (curEditField) => {
    let errorMessage

    if (curEditField === 'beginQuantity') {
      errorMessage = `期初余额数量`
    } else if(curEditField === 'beginQuantityCr'){
      errorMessage = `期初贷方余额数量`
    }else if(curEditField === 'beginQuantityDr'){
      errorMessage = `期初借方余额数量`
    }else if (curEditField === 'beginOrigAmount') {
      errorMessage = `期初余额外币`
    } else if (curEditField === 'beginOrigAmountCr') {
      errorMessage = `期初贷方余额外币`
    }else if (curEditField === 'beginOrigAmountDr') {
      errorMessage = `期初借方余额外币`
    }else if (curEditField === 'beginAmount') {
      errorMessage = `期初余额`
    }else if (curEditField === 'beginAmountDr') {
      errorMessage = `期初借方余额`
    } else if (curEditField === 'beginAmountCr') {
      errorMessage = `期初贷方余额`
    }else if (curEditField === 'quantityDr') {
      errorMessage = `本年借方累计数量`
    } else if (curEditField === 'origAmountDr') {
      errorMessage = `本年借方累计外币`
    } else if (curEditField === 'amountDr') {
      errorMessage = `本年借方累计金额`
    } else if (curEditField === 'quantityCr') {
      errorMessage = `本年贷方累计数量`
    } else if (curEditField === 'origAmountCr') {
      errorMessage = `行本年贷方累计外币`
    } else if (curEditField === 'amountCr') {
      errorMessage = `本年贷方累计金额`
    }

    return errorMessage
  }

  // 点击删除
  operateCol = (record, rowIndex) => {
    let obj
      obj = {
        children: (
          <span>
            <Icon type="shanchu" fontFamily= 'edficon' className='table_fixed_width-deleteIcon' title='删除'  onClick={() => this.deleteAuxItem(record, rowIndex)}/>
          </span>
        )
      }

    return obj
  }

  //删除某一行
  deleteAuxItem = (record, index) => {
    let list = this.metaAction.gf('data.list').toJS()
    
    const attributeArr = Object.keys(record)
    let newObj = {}
    attributeArr.forEach((item) => {
      newObj[item] = undefined
    })
    list.splice(index, 1)
    list.push(newObj)
    this.injections.reduce('deleteRows', list)
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
