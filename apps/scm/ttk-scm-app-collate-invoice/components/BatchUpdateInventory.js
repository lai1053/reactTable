import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改存货
class BatchInventory extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inventoryList: [],
            inventory: '',
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    componentDidMount = () => {
        const { inventoryList } = this.props
        this.setState({
            inventoryList: inventoryList
        })
    }

    onOk = async () => {
        const { inventory, inventoryList } = this.state
        let item = inventoryList.filter(o => o.id == inventory)
        if (item) return item[0]
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            inventory: value,
        })
    }

    //新增
    batchAddInventoryAdd = async () => {
        const { data } = this.props
        const ret = await this.props.batchAddInventoryAdd(data)
       
        let { inventoryList } = this.state
        if (ret && ret.isEnable) {
            let retArr = this.getFullName([ret])
            inventoryList.push(retArr[0])
            this.setState({
                inventory: retArr[0].id,
                inventoryList
            })
        }
    }
    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\");
        if (!option || !option.props || !option.props.value) return false;
        const parentRevenueAccounts = fromJS(this.state.inventoryList);
        let regExp = new RegExp(inputValue, 'i');
        let paramsValue = parentRevenueAccounts.find(item => item.get('id') == option.props.value)
        if (!paramsValue) {
            return false
        }

        if (paramsValue.get('name') && paramsValue.get('name').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('fullname') && paramsValue.get('fullname').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('codeAndName') && paramsValue.get('codeAndName').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) {
            return true
        }
        if (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1) {
            return true
        }

        return false;

    }

    getFullName = (list) => {
        let arr
        list.map(item => {
            item.fullName = `${item.code} ${item.name} ${item.propertyName} ${item.unitName ? item.unitName : ""}`
            arr = [item.code, item.name, item.propertyName]
            if(item.unitName) arr.push(item.unitName)
            item.fullNameArr = arr
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

    render() {
        const { inventory, inventoryList } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label='存货'
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Select
                        value={inventory}
                        filterOption={this.filterOption}
                        onChange={(v) => this.handleSelectChange(v)}
                        dropdownClassName='ttk-scm-app-collate-invoice-inventoryDropdown'
                        dropdownFooter={
                            <Button type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={this.batchAddInventoryAdd}>新增
                            </Button>}>
                        {
                            inventoryList.map((item, index) => {
                                return <Option key={index} value={item.id} title={item.fullname}>{this.getFullNameChildren(item)}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Form>

        )
    }
}

export default BatchInventory
