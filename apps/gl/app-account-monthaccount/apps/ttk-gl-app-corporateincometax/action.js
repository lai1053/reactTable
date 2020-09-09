import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import { FormDecorator, Input, Select } from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}
		this.load()
	}
	load = async (option) => {
		let params = { dto: { year: this.component.props.initData.period.year, period: this.component.props.initData.period.month } }
		let period = this.component.props.initData.period,
			queryData = await this.webapi.corporateincometax.query(params),
			// isDisabled = await this.webapi.corporateincometax.hasMaxPeriodSuperTaxDoc(period),
			isAccountedMonth = this.component.props.initData.isAccountedMonth,
			initData = {}
		initData.queryData = queryData
		initData.isAccountedMonth = isAccountedMonth
		// initData.isDisabled = isDisabled
		this.injections.reduce('load', initData)
		document.querySelector('.ant-modal-footer .ant-btn-primary').disabled = isAccountedMonth
	}

	renderCell = (columnName, index, value, record) => {
		if(columnName == 'rate' || columnName == 'proportion'){
			return (<EditableCell
			value={value}
			// disabled={isDisabled}
			// customAttribute = {this.customAttribute}
			onBlur={(value) => this.handleBlur(value, columnName, index, record)}
			onEnter={(e) => this.handleEnter()}
		/>)
		}
	}
	handleBlur = async (value, columnName, index, record) => {
		let list = this.metaAction.gf('data.list')
		list = list.update(index, item => item.set(columnName, value))
		this.metaAction.sf('data.list', fromJS(list))
	}
	//点击确定按钮
	onOk = async () => {
		return await this.save()
	}

	getDisplayErrorMSg = (msg) => {
		return <div style={{ display: 'inline-table' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
	}
	save = async () => {
		let list = this.metaAction.gf('data.list').toJS(),
			calcMode = this.metaAction.gf('data.calcMode'),
			period = this.component.props.initData.period,
			data, params = {}
		params.calcMode = calcMode
		params.rateList = list
		params.year = period.year
		params.period = period.month
		params.isReturnValue = true
		data = await this.webapi.corporateincometax.update(params)

		if (data && data.error && data.error.message) {
			this.metaAction.toast('error', data.error.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
		}
	}
}

class EditableCell extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: props.value
		}
	}

	handleChange = (value) => {
		if (value > 100) {
			value = 100
		}
		this.setState({
			value: value
		})
	}

	handleBlur = (e) => {
		const { onBlur } = this.props
		const { value } = this.state
		onBlur(value ? value : 0)
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.value
		})
	}

	render() {
		const { onBlur, onEnter, customAttribute, disabled } = this.props
		const value = this.state.value
		return (
			<div className="td_input_antNumber">
				<Input.AntNumber
					onChange={this.handleChange}
					value={value}
					onBlur={this.handleBlur}
					onPressEnter={(e) => onEnter(e)}
					style={{ 'textAlign': 'right', fontSize: '12px', height: '26px' }}
					disabled={disabled}
					// customAttribute = {customAttribute}
					// regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
					min={0}
					max={100}
					formatter={value => `${value}%`}
					parser={value => value.replace('%', '')}
				/>
			</div>
		)
	}
}
const ExtendEditableSelectCell = ({ dataSource, onChange, value, columnName, onClick, saveNewVlue, handleFocus, disabled }) => {
	let productChildren = []
	if (dataSource) {
		dataSource.forEach((item, index) => {
			productChildren.push(<Option key={item.id} title={item.codeAndName} _data={item} value={item.id}>{item.codeAndName}</Option>)
		})
		return (
			<div style={{ width: '100%' }}>
				<Select style={{ width: '100%', height: '26px' }}
					onSelect={(value) => onChange(value)}
					value={value}
					disabled={disabled}
					filterOptionExpressions="code,name,helpCode,helpCodeFull"
					dropdownClassName={'widthdrawing-select'}
					//   filterOption={filterOption}
					onFocus={handleFocus}>
					{productChildren}
				</Select>
			</div>
		)
	}
	else {
		return (
			<div style={{ width: '100%' }}>
				<Select style={{ width: '100%' }}
					onSelect={(value) => onChange(value)}
					value={''}
					disabled={disabled}
					// filterOption={(input, option) => filterOption(input, option)}
					filterOptionExpressions="code,name,helpCode,helpCodeFull"
					dropdownClassName={'cashflowstatementDistributionSelect'}
					// filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
					onFocus={handleFocus}>
					<Option value={''}>{''}</Option>
				</Select>
			</div>
		)
	}

}
export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o }
	metaAction.config({ metaHandlers: ret })
	return ret
}



