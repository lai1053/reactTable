import React from 'react'
import { Form, Icon, Select, Input, Button } from 'edf-component'
import { Map, fromJS } from 'immutable'
const FormItem = Form.Item

class Settlement extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            initData: fromJS(props.initData),
            personListObj: {},
            bankAccounts: [],
            settleList:[],
            record: {},
            amount: 0,
        }
        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
        if( props.setCancelLister ) {
            props.setCancelLister(this.onCancel)
        }
    }

    componentWillMount = () => {
        // const initData = this.props.initData
        let {initData} = this.state
        initData = initData.toJS()
        let { expenseInitDto, record } = initData
        let {bankAccounts, ...personListObj} = expenseInitDto
        bankAccounts = bankAccounts.filter(o => o.name != '冲减预付款' && o.name != '冲减预收款')
        let settleList = []
        
        if (record.settles.length == 0) {
            settleList = [{
                bankAccountId: '', 
                amount: '', 
                bankAccountName: '', 
                personId: '', 
                supplierId: '', 
                customerId: '', 
                personName: '', 
                supplierName: '', 
                customerName: '', 
                error:{}}]
        } else {
            settleList = record.settles
        }
        
        if (personListObj && personListObj['suppliers'].length!=0) { // 为了区分供应商和客户
            personListObj['suppliers'].forEach((item) => {
                item.isSupplier = true
            })
        }
        // console.log(initData, 'initData')
        let amountCalc = 0
        settleList.forEach((item) => {
            const itemAmount = item.amount ? item.amount : 0
            amountCalc = Number(amountCalc) + Number(itemAmount)
            
            // amountCalc = Number(amountCalc) + Number(item.amount)
            if (item.personId) {
                item.isShowTwoLevel = 'person'
                item.twoLevelList = personListObj['persons']
                item.twoLevelId = item.personId
            } 
            if (item.customerId || item.supplierId) {
                item.isShowTwoLevel = 'supplier;customer'
                // item.twoLevelList = personListObj['suppliers'].concat(personListObj['customers'])
                item.twoLevelList = personListObj['suppliers']
                item.twoLevelId = item.supplierId || item.customerId
            }
            item.error={}
        })
        amountCalc = Number(record.amount) - Number(amountCalc)

        this.setState({
            bankAccounts: bankAccounts, 
            personListObj: personListObj, 
            record: record, 
            settleList: settleList,
            amount: amountCalc || 0
        })
    }

    onOk = () => {
        let { settleList, record, amount} = this.state

        settleList = settleList.filter(o => o.bankAccountId || o.amount)
        if (!this.handleSaveCheck(settleList)) return false
        if (amount != 0) {
            this.props.handleSettleTip()
            return false
        }
        settleList.forEach((item, index) => {
            if (typeof item.customerId == 'undefined') {
                item.customerId = ''
                item.customerName = ''
            }
            if (typeof item.personId == 'undefined') {
                item.personId = ''
                item.personName = ''
            }
            if (typeof item.supplierId == 'undefined') {
                item.supplierId = ''
                item.supplierName = ''
            }
            delete item.isShowTwoLevel
            delete item.twoLevelId
            delete item.twoLevelList
            delete item.error
        })
        record.settles = settleList
        return record
    }

    onCancel = () => {
        // console.log(22222)
    }
    
    handleSaveCheck = (settleList) => {
        let errorList = [], isHasError = false, bankAccounts = this.state.bankAccounts
        if (settleList.length != 0) {
            settleList.forEach((item, index) => {
                const selectObj = bankAccounts.find(o => o.id == item.bankAccountId)
                if (!item.bankAccountId && Number(item.amount)) {
                    item.error['bankAccount'] = '请选择结算账户'
                    isHasError = true
                }
                if (item.bankAccountId && !Number(item.amount)) {
                    item.error['amount'] = '请输入结算金额'
                    isHasError = true
                }
                if (!item.bankAccountId && item.amount == 0) {
                    item.error['amount'] = '结算金额不能为零'
                    isHasError = true
                }
                
                if (item.bankAccountId && selectObj.calcObject == 'person' && !item.personId) {
                    item.error['twoLevel'] = '请选择人员'
                    isHasError = true
                }
        
                if (item.bankAccountId && selectObj.calcObject == 'supplier;customer' && (!item.supplierId && !item.customerId)) {
                    // item.error['twoLevel'] = '请选择往来单位/个人'
                    item.error['twoLevel'] = '请选择往来单位'
                    isHasError = true
                }
            })
        }

        if (isHasError) {
            this.setState({settleList: settleList})
            return false
        }
        return true
    }

    handleAddRow = () => {
        let { settleList } = this.state
        const parmas = {
            bankAccountId: '',
            amount: '',
            bankAccountName: '',
            personId: '',
            supplierId: '',
            customerId: '',
            personName: '',
            supplierName: '',
            customerName: '',
            error: {}
        }

        // settleList.push(parmas)
        this.setState({ settleList: [...settleList,parmas] })
    }

    handleDelRow = (index) => {
        let { settleList, amount} = this.state
        let amountCalc = settleList[index].amount
        settleList.splice(index, 1)
        
        amount = Number(amount) + Number(amountCalc)
        this.setState({settleList : settleList, amount: amount})
    }

    handleChange = (type, value, index, name) => {
        let { settleList, bankAccounts, personListObj} = this.state

        if (type == 'settle') {
            const selectObj = bankAccounts.find(o => o.id == value)
            settleList[index].bankAccountId = selectObj.id
            settleList[index].bankAccountName = selectObj.name
            settleList[index].error.bankAccount = undefined

            if (selectObj.calcObject && (selectObj.calcObject == 'person' || selectObj.calcObject == 'supplier;customer')) {
                // settleList[index].isShowTwoLevel = true
                switch(selectObj.calcObject) {
                    case 'person': 
                        settleList[index].twoLevelList = personListObj['persons'] 
                        settleList[index].isShowTwoLevel = selectObj.calcObject
                        break
                    case 'supplier;customer':
                        // const newArr = personListObj['suppliers'].concat(personListObj['customers'])
                        const newArr = personListObj['suppliers']
                        settleList[index].isShowTwoLevel = selectObj.calcObject
                        settleList[index].twoLevelList = newArr
                        break
                }
            } else {
                settleList[index].isShowTwoLevel = false
                settleList[index].customerId = ''
                settleList[index].personId = ''
                settleList[index].supplierId = ''
                settleList[index].customerName = ''
                settleList[index].personName = ''
                settleList[index].supplierName = ''
                settleList[index].twoLevelId = ''
            }

        } else if (type == 'twoLevel') {

            let  selectList = []
            if (name == 'person') {
                selectList = personListObj['persons']
            } else if (name == 'supplier;customer') {
                // selectList = personListObj['suppliers'].concat(personListObj['customers'])
                selectList = personListObj['suppliers']
            }

            const selectObj = selectList.find(o => o.id == value)
            if (name == 'person') {
                settleList[index].personId = selectObj.id
                settleList[index].personName = selectObj.name
                settleList[index].customerId = '' // 每一行 不可能既有人员 又有客户 供应商
                settleList[index].supplierId = ''
                settleList[index].customerName = ''
                settleList[index].supplierName = ''
            } else if (name == 'supplier;customer') {
                if (selectObj.isSupplier) {
                    settleList[index].supplierId = selectObj.id
                    settleList[index].supplierName = selectObj.name
                    settleList[index].customerId = ''
                    settleList[index].personId = ''
                    settleList[index].customerName = ''
                    settleList[index].personName = ''
                } else {
                    settleList[index].customerId = selectObj.id
                    settleList[index].customerName = selectObj.id
                    settleList[index].supplierId = ''
                    settleList[index].personId = ''
                    settleList[index].personName = ''
                    settleList[index].supplierName = ''
                }
            }
            settleList[index].twoLevelId = selectObj.id
            settleList[index].error.twoLevel = undefined
        }

        this.setState({settleList : settleList})
    }

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

    handleBlur = (value, index) => {
        let { settleList, amount, record } = this.state
        // settleList[index].amount = value != '' ? this.addThousandsPosition(value, true) : value
        settleList[index].amount = value 
        settleList[index].error.amount = undefined
        let amountCalc = 0
        settleList.forEach(item => {
            item.amount = typeof item.amount == 'string' ? item.amount.replace(',','') : item.amount
            amountCalc = Number(amountCalc) + Number(item.amount)
        })
        amount = Number(record.amount) - Number(amountCalc)

        this.setState({settleList : settleList, amount : amount})
    }

    renderValue = (value, name, index) => {
        let { personListObj, bankAccounts, settleList} = this.state
        let  selectList = []
        if (name == 'person') {
            selectList = personListObj['persons']
        } else if (name == 'supplier;customer') {
            // selectList = personListObj['suppliers'].concat(personListObj['customers'])
            selectList = personListObj['suppliers']
        } 
        else if (name == 'bankAccounts') {
            selectList = bankAccounts
        }

        let result = ''
        if (selectList.length != 0) {
            selectList.find(obj => {
                if (obj.id == value) {
                    result = value
                    return true
                } 
            })
        }

        if (result == '') {
            if (name == 'person') {
                this.state.settleList[index].personId = ''
            } else if (name == 'supplier;customer') {
                this.state.settleList[index].supplierId = ''
            } else if (name == 'bankAccounts') {
                this.state.settleList[index].bankAccountId = ''
            }
        }
        return result
    }

    //新增档案
    handleAddRecord = (name, index) => {
        return <Button type='primary'
            style={{ width: '100%', borderRadius: '0' }}
            onClick={() =>this.addRecordClick(name, index)}
        >新增</Button>
    }

    addRecordClick = async (name, index) => {
        let { settleList, personListObj, record} = this.state
        const res = await this.props.addRecordClick(name)
        if (res) {
            let list = []
            if (name == 'person') {
                list = personListObj['persons']
                list.push(res)
                settleList[index].personId = res.id
                settleList[index].personName = res.name
                settleList[index].customerId = '' 
                settleList[index].supplierId = ''
                settleList[index].customerName = '' 
                settleList[index].supplierName = ''
                record.personList = list //为了下次点进结算弹框 有这个新增的
            
            } else if (name == 'supplier;customer') {
                list = personListObj['suppliers']
                list.push(res)
                settleList[index].supplierId = res.id
                settleList[index].supplierName = res.name
                settleList[index].personId = ''
                settleList[index].personName = ''
                settleList[index].customerId = '' 
                settleList[index].customerName = '' 
                record.supplierList = list //为了下次点进结算弹框 有这个新增的
            }

            settleList[index].twoLevelId = res.id
            settleList[index].twoLevelList = list
            settleList[index].error.twoLevel = undefined
            this.setState({settleList: settleList, record: record})
        }
    }

    render () {
        let { settleList, bankAccounts, amount} = this.state
        return(
            <div>
                {
                    settleList.map((item, index) => {
                        return <Form>
                            <FormItem label='结算账户' validateStatus={item.error&&item.error.bankAccount ? 'error' : 'success'} colon={false} >
                                <Select 
                                // value={String(item.bankAccountId)} 
                                value={this.renderValue(String(item.bankAccountId), 'bankAccounts', index)} 
                                onChange={(e) => this.handleChange('settle',e, index)}>
                                    {
                                        bankAccounts.map((obj, index) => {
                                            return <Option key={obj.id}>{obj.name}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                            <FormItem 
                            // label={ item.isShowTwoLevel == 'person' ? '人员' : '往来单位/个人'}
                            label={ item.isShowTwoLevel == 'person' ? '人员' : '往来单位'}
                            validateStatus={item.error&&item.error.twoLevel ? 'error' : 'success'} 
                            style={{display: item.isShowTwoLevel ? 'inline-flex' : 'none'}}
                            colon={false} 
                            className='personClass'>
                                <Select 
                                dropdownClassName='settlement-personclass'
                                value={this.renderValue(String(item.twoLevelId), item.isShowTwoLevel, index)}
                                // dropdownFooter={item.isShowTwoLevel == 'person' ? this.handleAddRecord(item.isShowTwoLevel, index): ''}
                                dropdownFooter={this.handleAddRecord(item.isShowTwoLevel, index)} 
                                onChange={(e) => this.handleChange('twoLevel',e, index, item.isShowTwoLevel)}>
                                    {
                                        item.twoLevelList&&item.twoLevelList.map((obj,index) => {
                                            return <Option key={obj.id} title={obj.name}>{obj.name}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                            <FormItem label='结算金额' validateStatus={item.error&&item.error.amount ? 'error' : 'success'} colon={false}>
                                <Input.Number
                                value={item.amount && this.addThousandsPosition(item.amount, true)} 
                                regex={/^\d+(\.\d{0,2})?$/}
                                style={{textAlign: 'right'}} 
                                onBlur={(e) => this.handleBlur(e, index)}></Input.Number>
                            </FormItem>
                            <div className='IconDiv'>
                                <Icon
                                    type='plus'
                                    title='新增'
                                    className='addIcon'
                                    style={{ cursor: 'pointer' }}
                                    onClick={()=> this.handleAddRow()}></Icon>
                                <Icon
                                    type='minus'
                                    title='删除'
                                    className='delIcon'
                                    disabled={settleList.length == 1 ? true : false}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => this.handleDelRow(index)}></Icon>
                            </div>
                        </Form>
                    })
                }
                <div className='amount'>
                    <span>剩余金额：</span><div>{this.addThousandsPosition(amount, true)}</div>
                </div>
            </div>
        )
    }
}

export default Settlement