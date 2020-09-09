import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改收入类型
class BatchUpdateInventoryAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inventoryAccount: [],
            revenueType: '',
            error: {
                revenueType: null
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    componentDidMount = () => {
        const { inventoryAccount } = this.props
        this.setState({
            inventoryAccount: inventoryAccount
        })
    }

    onOk = async () => {
        const { inventoryAccount, revenueType } = this.state;
        if (!revenueType) {
            this.setState({
                error: {
                    revenueType: '请选择存货科目'
                }
            })
            return false
        }
        let obj = inventoryAccount.find(o => o.id === revenueType)
        return obj;
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            revenueType: value,
            error: {
                revenueType: value ? null : '请选择存货科目'
            }
        })
    }

    // 新增收入科目
    batchAddInventoryAccount = async () => {
        let ret = await this.props.batchAddInventoryAccount();

        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let { inventoryAccount } = this.state;
            inventoryAccount.push(ret);
            this.setState({
                'revenueType': ret.id,
                'inventoryRelatedAccountName': inventoryAccount
            })
        }
    }

    render() {
        const { inventoryAccount, revenueType, error } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label="存货科目"
                    validateStatus={error && error.revenueType ? 'error' : 'success'}
                    required={true}
                    help={error.revenueType}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Select
                        value={revenueType}
                        onChange={(v) => this.handleSelectChange(v)}
                        dropdownFooter={
                            <Button type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={() => this.batchAddInventoryAccount()}>新增
                            </Button>
                        }>
                        {
                            inventoryAccount.map((o, index) => {
                                return <Option key={index} value={o.id} title={o.name}>{o.codeAndName}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Form>
        )
    }
}

export default BatchUpdateInventoryAccount