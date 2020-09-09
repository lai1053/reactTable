import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//批量修改收入类型
class BatchUpdateRevenueType extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            revenueTypes: [],
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
        const { revenueTypes } = this.props
        this.setState({
            revenueTypes: revenueTypes
        })
    }

    onOk = async () => {
        const { revenueTypes, revenueType } = this.state;
        if (!revenueType) {
            this.setState({
                error: {
                    revenueType: '请选择收入类型'
                }
            })
            return false
        }
        let obj = revenueTypes.find(o => o.id === revenueType)
        return obj;
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        this.setState({
            revenueType: value,
            error: {
                revenueType: value ? null : '请选择收入类型'
            }
        })
    }

    // 新增收入类型
    batchAddRevenueType = async () => {

        let ret = await this.props.batchAddRevenueType();
        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let { revenueTypes } = this.state;
            revenueTypes.push(ret);
            this.setState({
                'revenueType': ret.id,
                'revenueTypes': revenueTypes
            })
        }
    }

    render() {
        const { revenueTypes, revenueType, error } = this.state;
        return (
            <Form className='batch-inventory-content'>
                <Form.Item
                    label="收入类型"
                    validateStatus={error && error.revenueType ? 'error' : 'success'}
                    required={true}
                    help={error.revenueType}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                >
                    <Select
                        value={revenueType}
                        onChange={(v) => this.handleSelectChange(v)}
                        dropdownClassName= 'dropdownClassStyleLiPiao'
                        dropdownFooter={
                            <Button type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={() => this.batchAddRevenueType()}>新增
                            </Button>
                        }>
                        {
                            revenueTypes.map((o, index) => {
                                return <Option key={index} value={o.id} title={o.name}>{o.name}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Form>
        )
    }
}

export default BatchUpdateRevenueType