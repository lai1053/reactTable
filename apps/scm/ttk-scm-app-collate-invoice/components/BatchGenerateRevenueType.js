import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改收入类型
class BatchGenerateRevenueType extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            parentRevenueAccounts: [],
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
        const { parentRevenueAccounts } = this.props
        this.setState({
            parentRevenueAccounts: parentRevenueAccounts
        })
    }

    onOk = async () => {
        const { parentRevenueAccounts, revenueType } = this.state;
        if (!revenueType) {
            this.setState({
                error: {
                    revenueType: '请选择收入科目'
                }
            })
            return false
        }
        let obj = parentRevenueAccounts.find(o => o.id === revenueType)
        return obj;
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            revenueType: value,
            error: {
                revenueType: value ? null : '请选择收入科目'
            }
        })
    }

    // 新增收入科目
    batchAddRevenuesubject = async () => {

        let ret = await this.props.batchAddRevenuesubject();
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let { parentRevenueAccounts } = this.state;
            parentRevenueAccounts.push(ret);
            this.setState({
                'revenueType': ret.id,
                'parentRevenueAccounts': parentRevenueAccounts
            })
        }
    }

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
        const { parentRevenueAccounts, revenueType, error } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label="收入科目"
                    validateStatus={error && error.revenueType ? 'error' : 'success'}
                    required={true}
                    help={error.revenueType}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Select
                        value={revenueType}
                        onChange={(v) => this.handleSelectChange(v)}
                        filterOption={this.filterOption}
                        dropdownClassName= 'dropdownClassStyleLiPiao'
                        dropdownFooter={
                            <Button type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={() => this.batchAddRevenuesubject()}>新增
                            </Button>
                        }>
                        {
                            parentRevenueAccounts.map((o, index) => {
                                return <Option key={index} value={o.id} title={o.name}>{o.codeAndName}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Form>
        )
    }
}

export default BatchGenerateRevenueType