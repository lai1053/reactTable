import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//自动生成上级科目
class BatchGenerateRevenueAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            parentRevenueAccounts: [],
            parentRevenueAccount: '',
            error: {
                parentRevenueAccount: null
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
        // if (props.setCancelLister) {
        //     props.setCancelLister(this.onCancel)
        // }
    }

    componentDidMount = () => {
        const { parentRevenueAccounts } = this.props
        this.setState({
            parentRevenueAccounts: parentRevenueAccounts
        })
    }

    onOk = async () => {
        const { parentRevenueAccount } = this.state;
        const { invoiceInventoryList } = this.props;

        if (!parentRevenueAccount) {
            this.setState({
                error: {
                    parentRevenueAccount: '请选择上级科目'
                }
            })
            return false
        }
        const res = await this.props.generateRevenueAccount({
            invoiceInventoryList,
            parentRevenueAccount
        })
        if (res.invoiceInventoryList && res.invoiceInventoryList.length != 0) {
            return res
        } else {
            return false;
        }


    }

    // onCancel = async () => {
    //     return 'true'
    // }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        //debugger
        this.setState({
            parentRevenueAccount: value,
            error: {
                parentRevenueAccount: value ? null : '请选择上级科目'
            }
        })
    }

    //新增收入科目
    batchAddRevenueAccount = async () => {
        const ret = await this.props.batchAddRevenueAccount();
        if (ret) {
            this.setState({
                parentRevenueAccounts: ret.parentRevenueAccounts,
                parentRevenueAccount: ret.id,
                error: {
                    parentRevenueAccount: null
                }
            })
        }
    }

    //检索
    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\");
        if (!option || !option.props || !option.props.value) return false;
        const parentRevenueAccounts = fromJS(this.state.parentRevenueAccounts);
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
    render() {
        const { parentRevenueAccounts, parentRevenueAccount, error } = this.state;
        return (
            <div>
                <Form className='batch-inventory-content'>
                    <Form.Item
                        label='上级科目'
                        validateStatus={error && error.parentRevenueAccount ? 'error' : 'success'}
                        required={true}
                        help={error.parentRevenueAccount}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 12 }}
                    >
                        <Select
                            value={parentRevenueAccount}
                            filterOption={this.filterOption}
                            onChange={(v) => this.handleSelectChange(v)}
                            dropdownClassName= 'dropdownClassStyleLiPiao'
                            dropdownFooter={
                                <Button type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={this.batchAddRevenueAccount}>新增
                        </Button>
                            }
                        >
                            {
                                parentRevenueAccounts.map((item, index) => {
                                    return <Option key={index} value={item.id}>{item.codeAndName}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                </Form>
                <div style={{ fontSize: 12, color: '#fa954c' }}>
                    <div style={{ position: 'absolute' }}>注：</div>
                    <div style={{ marginLeft: 23 }}>
                        1）选择上级科目后，点击确定会按照存货名称自动生成上级科目下的末级科目
                    </div>
                    <div style={{ marginLeft: 23 }}>
                        2）如果上级科目有余额时，余额会自动转到第一个末级科目，原凭证上对应的上级科目也会更新为第一个末级科目
                    </div>
                </div>
            </div>

        )
    }
}

export default BatchGenerateRevenueAccount