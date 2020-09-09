import React from 'react'
import {Form, Select, Input} from 'edf-component'
import webapi from '../webapi'
const Option = Select.Option

class ApplyForInvoice extends React.Component {
    constructor(props) {
        super()
        this.state = {
			// unitList: props.unitList || []
		}
		if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

	handleAddSelect = () => {
		const {unitList} = this.props
        return unitList && unitList.map((item, index) => {
            return <Option key={item.id} value={item.id} title={item.groupName}>{item.groupName}</Option>
        })
	}
	
	changeUnit = (v) => {
		this.setState({
			unitId: v
		})
	}

	onOk = () => {
		const {unitId} = this.state
		return unitId || 'noUnit'
	}

    render() {
        let {unitId} = this.state
        return (
			<Form.Item label="计量单位组">
				<Select
					showSearch={true}
					value={unitId}
					filterOptionExpressions='code,name,helpCode,helpCodeFull'
					dropdownStyle={{ width:'400px' }}
					// dropdownMatchSelectWidth={false}
					onChange={(e) => this.changeUnit(e)}
				>
					{this.handleAddSelect()}
				</Select>
			</Form.Item>
        )
    }
}

export default ApplyForInvoice