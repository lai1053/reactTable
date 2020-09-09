import React from 'react'
import { Select, Input, Button, Table, Radio,Form, Icon, Menu, Dropdown } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改收入类型
class BatchUpdateChangeRate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            parentRevenueAccounts: [],
            text: '',
            error: {
                text: null
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
        const { parentRevenueAccounts, text } = this.state;
        if (!text) {
            this.setState({
                error: {
                    text: '请填写数量'
                }
            })
            return false
        }
        
        return text;
    }

    handleChangeRate = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            text: value,
        })
    }

    render() {
        const { parentRevenueAccounts, text, error } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label="数量"
                    validateStatus={error && error.text ? 'error' : 'success'}
                    required={true}
                    help={error.text}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Input.Number
                        style={{ width: 170, margin: '0 8px', fontSize: '12px', textAlign: 'right' }}
                        value={text}
                        onChange={(v) => this.handleChangeRate(v)}
                        minValue={0}
                        precision={6}
                    />
                </Form.Item>
            </Form>
        )
    }
}

export default BatchUpdateChangeRate