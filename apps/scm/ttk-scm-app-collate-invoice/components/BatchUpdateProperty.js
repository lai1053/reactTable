import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改业务类型
class BatchUpdateProperty extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            properties: [],
            propertyId: null,
            businessTypeId: null,
            businessTypes: [],
            error: {
                propertyId: null,
                businessTypeId: null
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    componentDidMount = () => {
        const { properties, businessTypes } = this.props
        this.setState({
            properties: properties,
            businessTypes: businessTypes
        })
    }

    onOk = async () => {
        const { propertyId, properties, businessTypes, businessTypeId } = this.state;
        if (!propertyId) {
            this.setState({
                error: {
                    propertyId: '请选择业务类型'
                }
            })
            return false
        }
        if (propertyId === 4001001 && !businessTypeId) {
            this.setState({
                error: {
                    businessTypeId: '请选择费用类型'
                }
            })
            return false
        }
        let property = properties.find(o => o.propertyId === propertyId);
        let business = businessTypes.find(o => o.id == businessTypeId);
        return {
            property,
            business
        };
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            propertyId: value,
            error: {
                propertyId: value ? null : '请选择业务类型'
            }
        })
    }
    handleChangeBusinessType = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            businessTypeId: value,
            error: {
                businessTypeId: value ? null : '请选择费用类型'
            }
        })
    }

    render() {
        const { properties, propertyId, error, businessTypes, businessTypeId } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label="业务类型"
                    validateStatus={error && error.propertyId ? 'error' : 'success'}
                    required={true}
                    help={error.propertyId}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Select
                        value={propertyId}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        onChange={(v) => this.handleSelectChange(v)}
                    >
                        {
                            properties.map((o, index) => {
                                return <Option key={index} value={o.propertyId} title={o.propertyName}>{o.propertyName}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
                {
                    propertyId === 4001001 && <Form.Item
                        label="费用类型"
                        validateStatus={error && error.businessTypeId ? 'error' : 'success'}
                        required={true}
                        help={error.businessTypeId}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 12 }}
                    >
                        <Select
                            value={businessTypeId}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            onChange={(v) => this.handleChangeBusinessType(v)}
                        >
                            {
                                businessTypes.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.name}>{o.name}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                }
            </Form>
        )
    }
}

export default BatchUpdateProperty