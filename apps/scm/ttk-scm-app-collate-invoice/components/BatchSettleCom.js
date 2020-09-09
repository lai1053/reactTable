import React from 'react'
import { Select, Button, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

class BatchSettleCom extends React.Component {
    constructor(props){
        super(props)
        this.state={
            settleList: [],
            selectValue: ''
        }
        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    componentDidMount = () => {
        const {bankAccount, vatOrEntry} = this.props

        this.setState({
            settleList: bankAccount,
            selectValue: vatOrEntry ? 6: 5
        })
    }

    onOk = () => {
        const {selectValue, settleList} = this.state 
        let obj = settleList.find(item => item.id == selectValue)
        // console.log(obj, 'obj')
        return obj
    }

    handleSelectChange = (value) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        // const settleList = this.state.settleList
        // console.log(value, 'change value')
        
        // this.props.changeBatchSettle(value)

        this.setState({
            selectValue: value
        })

    }

     // 新增结算方式
     addSettle = async() => {
        let settleList = this.state.settleList
        const res = await this.props.handleAddSettle()
        if (res) {
            settleList.push(res) 
            this.setState({
                settleList: settleList,
                selectValue: res.id
            })
        }
    }

    render () {
        const {settleList, selectValue} = this.state
        const {vatOrEntry} = this.props
        return (
                <Form>
                <Form.Item label="结算方式" colon={false}>
                    <Select
                    // value={selectValue ? selectValue : vatOrEntry ? '暂未付款': '暂未收款'}
                    value={selectValue ? selectValue : vatOrEntry ? 6: 5}
                    onChange={(v) => this.handleSelectChange(v)}
                        dropdownFooter={
                            <Button type='primary'
                                style={{ width: '100%', borderRadius: '0' }}
                                onClick={() => this.addSettle()}>新增
                            </Button>
                        }>
                        {
                            settleList.map((item, index) => {
                                return <Option key={index} value={item.id}>{item.name}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
            </Form>
        )
    }
}

export default BatchSettleCom