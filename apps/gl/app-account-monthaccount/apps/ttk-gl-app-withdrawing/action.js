import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import { FormDecorator, Icon, Input, Select } from 'edf-component'

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
		let params = {dto: {year: this.component.props.initData.period.year, period: this.component.props.initData.period.month}}
		let period = this.component.props.initData.period,
			// subjects = await this.webapi.widthdrawing.getAccountListForSupertaxSet(),
			queryData = await this.webapi.widthdrawing.query(params),
			isDisabled = await this.webapi.widthdrawing.hasMaxPeriodSuperTaxDoc(period),
			isAccountedMonth = this.component.props.initData.isAccountedMonth,
			initData = {}
		// initData.accountCrList = queryData.accountCrList
		initData.queryData = queryData
		initData.isAccountedMonth = isAccountedMonth
		initData.isDisabled = isDisabled
		this.injections.reduce('load', initData)
		document.querySelector('.ant-modal-footer .ant-btn-primary').disabled = isAccountedMonth
	}
	mouseEnter = (record) => {
		return {
			className: 'mouseRow'
		}
	}
	filterOption = (inputValue, option) => {
		if (option && option.props && option.props.value) {
			let accountingSubjects = this.metaAction.gf('data.accountingSubjects')
			let itemData = accountingSubjects.find(o => o.get('id') == option.props.value)

			if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
				|| (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
				|| (itemData.get('codeAndName') && itemData.get('codeAndName').indexOf(inputValue) == 0)
				|| (itemData.get('helpCode') && itemData.get('helpCode').toUpperCase().indexOf(inputValue.toUpperCase()) != -1)
				|| (itemData.get('helpCodeFull') && itemData.get('helpCodeFull').indexOf(inputValue) != -1)) {

				return true
			}
			else {
				return false
			}
		}

		return true
	}
	handleSelectChange = async (value, columnName, index, dataSource, record) => {
		let list = this.metaAction.gf('data.list'),
			newList = this.metaAction.gf('data.list').toJS(),
			sumProportion = 0,
			proportion = 0
		let item = dataSource && dataSource.find((item) => item.id == value)
		if (columnName == 'accountId') {//贷方科目
			newList.map((item, index) => {
				// if(item.accountId == value){
				sumProportion += Number(item.proportion)
				// }
				return sumProportion
			})
			if (list.get(index).get('isEditProportion') == true) {//如果先输入比例
				if (list.get(index).get('proportion') <= 100 - sumProportion) {
					list = list.update(index, item => item.set(columnName, value))
					// list = list.update(index, item => item.set('proportion', list.get(index).get('proportion')))					
				} else {
					this.metaAction.toast('warning', '所有贷方科目累计比例超过100%')
					list = list.update(index, item => item.set('proportion', 0))
				}
				list = list.update(index, item => item.set(columnName, value))
			} else {//没有先输入比例

				if (item.id == 99135 || item.id == 49228) {
					proportion = 7
					if (proportion + sumProportion > 100) {
						proportion = 100 - sumProportion
					}
				}
				if (item.id == 49233 || item.id == 99140) {
					proportion = 3
					if (proportion + sumProportion > 100) {
						proportion = 100 - sumProportion
					}
				}
				if (item.id == 49237 || item.id == 99144) {
					proportion = 1
					if (proportion + sumProportion > 100) {
						proportion = 100 - sumProportion
					}
				}
				list = list.update(index, item => item.set(columnName, value))
				list = list.update(index, item => item.set('proportion', proportion))
			}
		}
		if(columnName == 'debitAccountId'){ //借方科目
			list = list.update(index, item => item.set(columnName, value))
		}
		if (columnName == 'summary') {//摘要
			list = list.update(index, item => item.set(columnName, value))
		}
		this.metaAction.sf('data.list', fromJS(list))
	}
	//点击确定按钮
	onOk = async () => {
		// setTimeout(async () => {
		return await this.save()
		// },1000)

	}

	getDisplayErrorMSg = (msg) => {
		return <div style={{ display: 'inline-table' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
	}
	save = async () => {
		let list = this.metaAction.gf('data.list').toJS(),
			copylist = this.metaAction.gf('data.copylist').toJS(),
			calcMode = this.metaAction.gf('data.calcMode'),
			period = this.component.props.initData.period,
			data, arr = [], params = {},
			isModified,
			msgList = []//错误数据
			console.log(list)
		params.calcMode = calcMode
		for(let i = 0; i<copylist.length; i++){
			if(copylist[i] && list[i]){
				if( copylist[i].proportion !=  list[i].proportion){
					isModified = true
					break;
				}
					isModified = false
			}
		}
		list.map((item, index) => {
			if (!item.summary && !item.accountId) {
				list.splice(index, 1)
			}
		})
		params.dtos = list
		params.isModified = isModified
		let newParams = Object.assign({}, params, period),
			sumProportion = 0
		if (list.length != 0) {
			//保存校验
			list.map((item, index) => {
				if (!item.summary) {
					msgList.push(`摘要不能为空`)
				}
				if (!item.accountId) {
					msgList.push(`科目不能为空`)
				}

				if (item.proportion == undefined) {
					msgList.push(`比例不能为空`)
				}
				if (item.proportion) {
					sumProportion += Number(item.proportion)
				}

			})
			if (sumProportion > 100) {
				msgList.push(`所有科目累计比例不能超过100%`)
			}
			let newMsgList = []
			for (let i = 0; i < msgList.length; i++) {
				if (newMsgList.indexOf(msgList[i]) == -1) {
					newMsgList.push(msgList[i])
				}
			}

			if (newMsgList.length > 0) {
				this.metaAction.toast('error', this.getDisplayErrorMSg(newMsgList))
				return false
			}
		}
		//
		data = await this.webapi.widthdrawing.update(newParams)

		if (data) {
			this.metaAction.toast('success', '保存成功')
		} else {
			// this.metaAction.toast('warning', data.error.message)
			return false
		}
	}
	addRow = (type, record) => {
		let list = this.metaAction.gf('data.list').toJS(), arr

		if (type == 'row') {
			arr = list.find((item) => {
				return item.summaryNum == record.summaryNum && item.summary
			})
			let lastIndex = list.findIndex((item, index) => {
				if (item.summaryNum == record.summaryNum && (!list[index + 1] || list[index + 1].summaryNum != record.summaryNum)) {
					return true
				} else {
					return false
				}
			})
			let count = 0
			list.map((o, i) => {
				if (list[i + 1]) {
					if (o.summaryNum == record.summaryNum && o.summaryNum == list[i + 1].summaryNum) {
						count++
					}
				}

			})
			list.splice(lastIndex + 1, 0,
				{
					// index: list[lastIndex].summaryNum ,
					summaryNum: arr ? arr.summaryNum : list[lastIndex].summaryNum,
					summary: '',
					// debitAccountId: arr?arr.debitAccountId:'',
					// creditAccountIdNum: count+2,
					accountId: '',
					proportion: '0',
					rate: '100'
					// isEditProportion: false
				}
			)
		}
		else {

			// list.push({summaryNum: list[list.length-1].summaryNum+1,summary: '',debitAccountId:'',creditAccountIdNum:1,creditAccountId:'',proportion:'100', isEditProportion: false})
		}
		// list = this.sort(list)
		this.metaAction.sf('data.list', fromJS(list))
	}
	delRow = (type, record, index, disabledDelIcon) => {
		// if(disabledDelIcon){
		// 	return
		// }
		let list = this.metaAction.gf('data.list').toJS()
		list.splice(index, 1)
		if (list.length == 0) {
			list.push({
				summaryNum: '',
				summary: '',
				accountId: '',
				proportion: '0',
				rate: '100'
			})
		}
		this.metaAction.sf('data.list', fromJS(list))
	}

	handleBlur = async (value, columnName, index, record) => {
		let list = this.metaAction.gf('data.list'),
			newList = this.metaAction.gf('data.list').toJS(),
			accountId = list.get(index).get('accountId'),
			usedProportion = 0//除此行外相同贷方科目已经使用过的比例数量
		this.customAttribute = Math.random()
		if(columnName == 'proportion'){ //贷方科目的税率
			if (accountId) {//
				newList.splice(index, 1)
				newList.map((item, index) => {
					usedProportion += Number(item.proportion)
				})
	
				if (Number(value) + usedProportion > 100) {
					this.metaAction.toast('warning', '所有贷方科目累计比例超过100%')
					list = list.update(index, item => item.set(columnName, 0))
					this.metaAction.sf('data.list', fromJS(list))
					return
				}
			} else {
				if (value > 100) {
					this.metaAction.toast('warning', '所有贷方科目累计比例超过100%')
					list = list.update(index, item => item.set(columnName, 0))
					this.metaAction.sf('data.list', fromJS(list))
					return
				}
			}
			list = list.update(index, item => item.set('isEditProportion', true))
			list = list.update(index, item => item.set(columnName, value))
		}else if(columnName == 'rate'){//借方科目的比例
			if(Number(value) > 100){
				this.metaAction.toast('warning', '借方科目比例超过100%')
				list = list.update(index, item => item.set(columnName, 0))
				this.metaAction.sf('data.list', fromJS(list))
				return
			}
			list = list.update(index, item => item.set(columnName, value))
		}
		
		this.metaAction.sf('data.list', fromJS(list))
	}
	setField = async (path, value) => {
		this.metaAction.sf(path, value)
	}
	renderCell = (columnName, index, value, record) => {
		let accountCrList = this.metaAction.gf('data.accountCrList') && this.metaAction.gf('data.accountCrList').toJS(),//贷方科目
		accountDrList = this.metaAction.gf('data.accountDrList') && this.metaAction.gf('data.accountDrList').toJS(),//借方科目
			disabledDelIcon = this.metaAction.gf('data.list').size == 1 ? true : false,
			isDisabled = this.metaAction.gf('data.isDisabled') || this.metaAction.gf('data.isAccountedMonth')
		// isAccountedMonth = this.metaAction.gf('data.isAccountedMonth')
		if (columnName == 'summaryNum') {
			return (
				<div className="summary">
					<div className="num">{index + 1}</div>
					<div className="addAndMinus">
						<Icon type="plus-circle-o" className="addIcon" onClick={() => this.addRow('row', record)} />
						<Icon type="minus-circle-o" className="delIcon" onClick={() => this.delRow('row', record, index, disabledDelIcon)} />
					</div>
				</div>
			)
		} else if (columnName == 'summary') {
			return (
				<Input title={value} disabled={isDisabled} className='summaryInput' value={value} onChange={(e) => this.handleSelectChange(e.target.value, columnName, index)} />
			)
		} else if (columnName == 'accountId') {//贷方科目
			return (
				<ExtendEditableSelectCell
					onChange={(value) => this.handleSelectChange(value, columnName, index, accountCrList, record)}
					dataSource={accountCrList}
					value={value}
					disabled={isDisabled}
					columnName={columnName}
				// handleFocus={this.handleFocus}
				// filterOption = {(inputValue,option)=>this.filterOption(inputValue,option)}
				/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
				/>
			)
		}else if(columnName == 'debitAccountId'){ //借方科目
			return (
				<ExtendEditableSelectCell
					onChange={(value) => this.handleSelectChange(value, columnName, index, accountDrList, record)}
					dataSource={accountDrList}
					value={value}
					disabled={isDisabled}
					columnName={columnName}
				// handleFocus={this.handleFocus}
				// filterOption = {(inputValue,option)=>this.filterOption(inputValue,option)}
				/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
				/>
			)
		}else if (columnName == 'proportion' || columnName == 'rate') {//税率
				return (

					<EditableCell
						value={value}
						disabled={isDisabled}
						precision={2}
						// customAttribute = {this.customAttribute}
						onBlur={(value) => this.handleBlur(value, columnName, index, record)}
						onEnter={(e) => this.handleEnter()}
					/>
				)
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
					precision={2}
					onBlur={this.handleBlur}
					onPressEnter={(e) => onEnter(e)}
					style={{ 'textAlign': 'right', fontSize: '12px',height:'26px' }}
					disabled={disabled}
					// customAttribute = {customAttribute}
					regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
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
				<Select style={{ width: '100%' ,height:'26px'}}
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



