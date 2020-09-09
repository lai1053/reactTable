import React from 'react'
import { Form, Icon, Select, Input, Button } from 'edf-component'
import { Map, fromJS } from 'immutable'
const FormItem = Form.Item

class BatchUpdateModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            revenueTypeList: props.dataList,
            error: {
                revenueType: null
            },
            // revenueTypeId: props.type == 'inventory' ? '1405':null,
            revenueTypeId: null,
            type: props.type,
            accountId: null,
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
        if (props.setCancelLister) {
            props.setCancelLister(this.onCancel)
        }
    }

    componentWillMount = () => {
        // let { initData } = this.state
        // initData = initData.toJS();
    }

    onOk = () => {
        const { revenueTypeId, type } = this.state;
        if (!revenueTypeId) {
            this.setState({
                error: {
                    revenueType: type == 'inventory' ? '请选择存货科目' :'请选择收入类型'
                }
            })
            return false
        }

        return revenueTypeId
    }

    onCancel = () => {

    }

    handleChange = (value) => {
        const { type } = this.state;
        this.setState({
            revenueTypeId: value,
            error: {
                revenueType: value ? null : type == 'inventory' ? '请选择存货科目' :'请选择收入类型'
            }
        })
        // if ( type == 'inventory') {
        //     this.setState({
        //         accountId: value,
        //         error: {
        //             revenueType: value ? null : '存货科目'
        //         }
        //     })
        // } else {
        //     this.setState({
        //         revenueTypeId: value,
        //         error: {
        //             revenueType: value ? null :'请选择收入类型'
        //         }
        //     })
        // }
    }
    filterOptionName = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }

    addAccount = async() => {
        const res = await this.props.addAccount()
        if (res) {
            let {addItem={}, account=[]} = res
            this.setState({
                revenueTypeId: addItem.code ? addItem.code: '',
                revenueTypeList: account
            })
        }
    }

    render() {
        let { revenueTypeList, error, revenueTypeId, type, accountId} = this.state;
        return (
            <div>
                <Form>
                    <FormItem
                        label= {type == 'inventory' ? '存货科目' :'收入类型'}
                        validateStatus={error && error.revenueType ? 'error' : 'success'}
                        required={true}
                        help={error.revenueType}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                    >
                        <Select
                            // value={type == 'inventory' ? accountId : revenueTypeId }
                            value={ revenueTypeId }
                            onChange={this.handleChange}
                            filterOption= {this.filterOptionName}
                            dropdownFooter={
                                type == 'inventory' ? 
                                <Button name='add' type='primary' style={{ width: '100%', borderRadius: '0' }} onClick={() => this.addAccount()}>新增</Button>
                                : null
                            }>
                            {
                                revenueTypeList.map((obj, index) => {
                                    return <Option key={index} value={type == 'inventory' ? obj.code:obj.id}>{type == 'inventory' ? obj.codeAndName:obj.name}</Option>
                                })
                            }
                        </Select>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default BatchUpdateModal