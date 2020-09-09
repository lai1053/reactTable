import React from 'react'
import { Radio } from 'edf-component'
import { Map, fromJS } from 'immutable'

//自动生成上级科目
class InventoryAccountSet extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inventoryNameSet: props.inventoryNameSet
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    // componentDidMount = () => {
    //     const { parentRevenueAccounts } = this.props
    //     this.setState({
    //         parentRevenueAccounts: parentRevenueAccounts
    //     })
    // }

    onOk = async () => {
        const { inventoryNameSet } = this.state;
        const res = await this.props.webapi.getInvoiceInvSave({
            inventoryNameSet
        })
        if (res) {
            return res;
        }
        else {
            return false
        }
    }
    handleOnChangeSetType = (e) => {
        const value = e.target.value;
        this.setState({
            inventoryNameSet: value
        })
    }
    render() {
        const { inventoryNameSet } = this.state;
        let style = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            fontSize: '12px',
            marginRight: 0,
        }
        return (
            <div>
                <Radio.Group value={inventoryNameSet} onChange={this.handleOnChangeSetType}>
                    <Radio value={1} style={style}>按品名+规格型号自动生成存货名称</Radio>
                    <Radio value={0} style={style}>按品名自动生成存货名称</Radio>
                </Radio.Group>
            </div>
        )
    }
}

export default InventoryAccountSet