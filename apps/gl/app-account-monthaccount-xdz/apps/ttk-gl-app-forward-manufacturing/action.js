import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS, is } from 'immutable'
import { FormDecorator, Input, Select, Icon } from 'edf-component'

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
		this.customAttribute = Math.random()
		injections.reduce('init')
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		this.load()
	}

	load = async (data) => {
		this.metaAction.sf('data.other.loading', true)
		let params = {},
			item = this.component.props.initData.item,
			period = this.component.props.initData.period,
			businessType = this.component.props.initData.businessType,
			templateData
		params.year = period.split('-')[0]
		params.period = period.split('-')[1]
		params.templateType = 1
		if (businessType == 5000040022) {//结转制造费用
			templateData = await this.webapi.manufacturingCost.init({ ...item, ...params })
		} else if (businessType == 5000040007) {//结转研发成本
			templateData = await this.webapi.developmentCost.init({ ...item, ...params })
		}

		if (templateData && templateData.dtos) {
			this.metaAction.sfs({
				'data.templateData': fromJS(templateData.dtos),
				'data.list': fromJS(templateData.dtos),
				// 'data.title': templateData.dtos[0].title,
				'data.creditAccountDataSource': fromJS(templateData.accountCrList),//贷方
				'data.debitAccountDataSource': fromJS(templateData.accountDrList),//借方
				'data.accountCrFormulaList': fromJS(templateData.accountCrFormulaList),
				'data.type': this.component.props.type,
				'data.period': this.component.props.initData.period
			})

		} else {
			this.metaAction.sfs({
				'data.creditAccountDataSource': fromJS(templateData.accountCrList),
				'data.debitAccountDataSource': fromJS(templateData.accountDrList),
				'data.accountCrFormulaList': fromJS(templateData.accountCrFormulaList),
				'data.type': this.component.props.type,
				'data.period': this.component.props.initData.period
			})
		}
		this.metaAction.sf('data.other.loading', false)
	}
	componentWillReceiveProps = (nextProps) => {
		if (nextProps.initData) {
			this.metaAction.sf('data.other.isEdit', nextProps.initData.isEdit)
		}
	}

	componentWillUnmount = () => {
		if (window.removeEventListener) {
			window.removeEventListener('resize', this.onResize, false)
		} else if (window.detachEvent) {
			window.detachEvent('onresize', this.onResize)
		} else {
			window.onresize = undefined
		}
	}
	componentDidMount = () => {
		if (window.addEventListener) {
			window.addEventListener('resize', this.onResize, false)
		} else if (window.attachEvent) {
			window.attachEvent('onresize', this.onResize)
		} else {
			window.onresize = this.onResize
		}
	}
	onResize = (e) => {
		let keyRandomTab = Math.floor(Math.random() * 10000)
		this.keyRandomTab = keyRandomTab
		setTimeout(() => {
			if (keyRandomTab == this.keyRandomTab) {
				this.getTableScroll('app-account-cerficate-add-body', 'ant-table-thead', 2, 'ant-table-body', 'data.tableOption', e)
			}
		}, 200)
	}

	getTableScroll = (contaienr, head, num, target, path, e) => {
		try {
			const tableCon = document.getElementsByClassName(contaienr)[0]
			if (!tableCon) {
				if (e) {
					return
				}
				setTimeout(() => {
					this.getTableScroll(contaienr, head, num, target, path)
				}, 500)
				return
			}
			const header = tableCon.getElementsByClassName(head)[0]
			const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
			const pre = this.metaAction.gf(path).toJS()
			const y = tableCon.offsetHeight - header.offsetHeight - num
			const bodyHeight = body.offsetHeight
			if (bodyHeight > y && y != pre.y) {
				this.metaAction.sf(path, fromJS({ ...pre, y }))
			} else if (bodyHeight < y && pre.y != null) {
				this.metaAction.sf(path, fromJS({ ...pre, y: null }))
			} else {
				return false
			}
		} catch (err) {

		}
	}

	handleSelectChange = async (value, columnName, index, dataSource, record) => {
		let list = this.metaAction.gf('data.list'),
			newList = this.metaAction.gf('data.list').toJS(),
			templateData = this.metaAction.gf('data.templateData'),
			templateList = this.component.props.initData.list,
			periodDate = this.metaAction.gf('data.period').split('-'),
			getProportion,
			arr = {},
			arrList,
			sumProportion = 0,
			templateId = templateData ? templateData.get(0).get('templateId') : ''
		if (columnName == 'creditAccountId') {//贷方

			let getProportion = await this.webapi.manufacturingCost.getProportion({
				creditAccountId: value, templateId: templateId, year: periodDate[0], period: periodDate[1]
			})
			newList.map((item, index) => {
				if (item.creditAccountId == value) {
					sumProportion += Number(item.proportion)
				}
				return sumProportion
			})
			// console.log(item)
			if (list.get(index).get('isEditProportion') == true) {//如果先输入比例

				if (list.get(index).get('proportion') <= 100 - sumProportion - getProportion) {
					list = list.update(index, item => item.set(columnName, value))
				} else {
					this.metaAction.toast('warning', '此科目累计比例超过100%')
				}
				list = list.update(index, item => item.set(columnName, value))
			} else {//没有先输入比例
				list = list.update(index, item => item.set(columnName, value))
				list = list.update(index, item => item.set('proportion', 100 - Number(sumProportion) - Number(getProportion)))
			}
		} else
			if (columnName == 'summary') {
				arr = newList.find((item) => {
					return item.summaryNum == record.summaryNum
				})
				arrList = list.filter((item, index) => {
					return item.get('summaryNum') == record.summaryNum
				})

				arrList.map((item, index) => {
					let i = list.findIndex(o => {
						return o == item
					})
					list = list.update(i, item => item.set(columnName, value))
				})

			} else
				if (columnName == 'debitAccountId') {
					arr = newList.find((item) => {
						return item.summaryNum == record.summaryNum
					})
					arrList = list.filter((item, index) => {
						return item.get('summaryNum') == record.summaryNum
					})
					arrList.map((item, index) => {
						let i = list.findIndex(o => {
							return o == item
						})
						list = list.update(i, item => item.set(columnName, value))
					})

				} else {
					list = list.update(index, item => item.set(columnName, value))
				}
		this.metaAction.sf('data.list', fromJS(list))
	}

	mouseEnter = (record) => {
		return {
			className: 'mouseRow'
		}
	}

	rowSpan2 = (value, row, index, type, columnName) => {
		let isEdit = this.metaAction.gf('data.other.isEdit') != undefined ? this.metaAction.gf('data.other.isEdit') : true,
			num = this.calcRowSpan(row.summaryNum, 'summaryNum', index),
			dataSource = this.metaAction.gf('data.debitAccountDataSource') && this.metaAction.gf('data.debitAccountDataSource').toJS(),
			children,
			list = this.metaAction.gf('data.list').toJS(),
			disabledDelIcon,
			newList = []
		list.map((item, index) => {
			if (list[index + 1] && list[index].summaryNum != list[index + 1].summaryNum || !list[index + 1]) {
				newList.push(item)
			}
		})
		disabledDelIcon = newList.length == 1 ? true : false

		if (type == 'summaryNum') {
			children = (
				<div className="summary">
					<div className="num">{row.summaryNum}</div>
					<div className="addAndMinus">
						<Icon type="plus-circle-o" className="addIcon" onClick={() => this.addRow('tatalRow', row)} />
						<Icon type="minus-circle-o" className="delIcon" onClick={() => this.delRow('totalRow', row, index, disabledDelIcon)} disabled={disabledDelIcon} />
					</div>
				</div>
			)
		}
		if (type == 'summary') {
			children = (
				<Input title={value} className='summaryInput' timeout={true} value={value} disabled={!isEdit} onChange={(e) => this.handleSelectChange(e.target.value, columnName, index, dataSource, row)} />
			)
		}
		if (type == 'debitAccountId') {
			// let item = dataSource&&dataSource.find(item => item.id==value)
			children = (
				<ExtendEditableSelectCell
					onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource, row)}
					dataSource={dataSource}
					value={value}
					// value={item?value:''}
					columnName={columnName}
					handleFocus={this.handleFocus}
					disabled={!isEdit}
					filterOption={(inputValue, option) => this.filterOption(inputValue, option, this.metaAction.gf('data.debitAccountDataSource'))}
					isSubject={false}
				/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
				/>
			)
		}
		const obj = {
			children: children,
			props: {
				rowSpan: num,
			},
		}
		return obj
	}

	calcRowSpan(text, columnKey, currentRowIndex) {
		const list = this.metaAction.gf('data.list')
		if (!list) return
		const rowCount = list.size
		if (rowCount == 0 || rowCount == 1) return 1

		if (currentRowIndex > 0
			&& currentRowIndex <= rowCount
			&& text == list.getIn([currentRowIndex - 1, columnKey])) {
			return 0
		}

		var rowSpan = 1
		for (let i = currentRowIndex + 1; i < rowCount; i++) {
			if (text == list.getIn([i, columnKey]))
				rowSpan++
			else
				break
		}

		return rowSpan
	}

	renderCell = (columnName, index, value, record) => {
		let dataSource = this.metaAction.gf('data.creditAccountDataSource') && this.metaAction.gf('data.creditAccountDataSource').toJS(),
			isEdit = this.metaAction.gf('data.other.isEdit') != undefined ? this.metaAction.gf('data.other.isEdit') : true,
			accountCrFormulaList = this.metaAction.gf('data.accountCrFormulaList') && this.metaAction.gf('data.accountCrFormulaList').toJS(),
			creditAccountDataSource = this.metaAction.gf('data.creditAccountDataSource') && this.metaAction.gf('data.creditAccountDataSource').toJS(),
			disabledDelIcon = this.metaAction.gf('data.list').size == 1 ? true : false
		if (columnName == 'summaryNum') {//
			return this.rowSpan2(value, record, index, 'summaryNum', columnName)
		}
		if (columnName == 'summary') {//摘要
			return this.rowSpan2(value, record, index, 'summary', columnName)
		}
		if (columnName == 'debitAccountId') {//借方
			return this.rowSpan2(value, record, index, 'debitAccountId', columnName)
		}
		if (columnName == 'creditAccountIdNum') {
			return (
				<div className="summary">
					<div className="num">{record.creditAccountIdNum}</div>
					<div className="addAndMinus">
						<Icon type="plus-circle-o" className="addIcon" onClick={() => this.addRow('row', record)} />
						<Icon type="minus-circle-o" className="delIcon" onClick={() => this.delRow('row', record, index, disabledDelIcon)} disabled={disabledDelIcon} />
					</div>
				</div>
			)
		} else
			if (columnName == 'creditAccountId') {//贷方
				return (
					<ExtendEditableSelectCell
						onChange={(value) => this.handleSelectChange(value, columnName, index, creditAccountDataSource, record)}
						dataSource={creditAccountDataSource}
						// value={item?value:''}
						value={value}
						disabled={!isEdit}
						columnName={columnName}
						handleFocus={this.handleFocus}
						filterOption={(inputValue, option) => this.filterOption(inputValue, option, this.metaAction.gf('data.creditAccountDataSource'))}
						isSubject={true}
					/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
					/>
				)
			} else if (columnName == 'creditDataSources') { //贷方科目来源
				return (
					<ExtendEditableSelectCell
						onChange={(value) => this.handleSelectChange(value, columnName, index, accountCrFormulaList, record)}
						dataSource={accountCrFormulaList}
						// value={item?value:''}
						value={value}
						disabled={!isEdit}
						columnName={columnName}
						handleFocus={this.handleFocus}
						// filterOption = {(inputValue,option)=>this.filterOption(inputValue,option)}
						isSubject={false}
					/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
					/>
				)
			} else
				if (columnName == 'proportion') {//bili
					return (

						<EditableCell
							value={value}
							disabled={!isEdit}
							customAttribute={this.customAttribute}
							onBlur={(value) => this.handleBlur(value, columnName, index, record)}
							onEnter={(e) => this.handleEnter()}
						/>
					)
				}
	}

	handleBlur = async (value, columnName, index, record) => {
		let list = this.metaAction.gf('data.list'),
			newList = this.metaAction.gf('data.list').toJS(),
			templateData = this.metaAction.gf('data.templateData'),
			periodDate = this.metaAction.gf('data.period').split('-'),
			templateId = templateData ? templateData.get(0).get('templateId') : '',
			creditAccountId = list.get(index).get('creditAccountId'),
			templateList = this.component.props.initData.list,
			usedProportion = 0//除此行外相同贷方科目已经使用过的比例数量
		this.customAttribute = Math.random()
		if (creditAccountId) {
			let getProportion = await this.webapi.manufacturingCost.getProportion({
				creditAccountId: list.get(index).get('creditAccountId'), templateId: templateId, year: periodDate[0], period: periodDate[1]
			})
			newList.splice(index, 1)
			let arr = newList.filter((item, i) => {
				return item.creditAccountId == list.get(index).get('creditAccountId')
			})
			arr.map((item, index) => {
				usedProportion += Number(item.proportion)
			})
			if (Number(value) + usedProportion + getProportion > 100) {
				list = list.update(index, item => item.set(columnName, 0))
				this.metaAction.sf('data.list', fromJS(list))
				this.metaAction.toast('warning', '此科目累计比例超过100%')
				return
			}
		} else {
			if (value > 100) {
				list = list.update(index, item => item.set(columnName, 0))
				this.metaAction.sf('data.list', fromJS(list))
				this.metaAction.toast('warning', '此科目累计比例超过100%')
				return
			}
		}
		list = list.update(index, item => item.set('isEditProportion', true))
		list = list.update(index, item => item.set(columnName, value))
		this.metaAction.sf('data.list', fromJS(list))
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
					summary: arr ? arr.summary : '',
					debitAccountId: arr ? arr.debitAccountId : '',
					creditAccountIdNum: count + 2,
					creditAccountId: '',
					creditDataSources: '',
					proportion: '100',
					isEditProportion: false
				}
			)
		} else {

			list.push({ summaryNum: list[list.length - 1].summaryNum + 1, summary: '', creditDataSources: '', debitAccountId: '', creditAccountIdNum: 1, creditAccountId: '', proportion: '100', isEditProportion: false })
		}
		list = this.sort(list)
		this.metaAction.sf('data.list', fromJS(list))
	}

	delRow = (type, record, index, disabledDelIcon) => {
		if (disabledDelIcon) {
			return
		}
		let list = this.metaAction.gf('data.list').toJS()
		list.splice(index, 1)
		let sortList = this.sort(list)
		this.metaAction.sf('data.list', fromJS(sortList))
	}


	sort = (list) => {//断号排序
		const arr = []
		let num = 1
		let childNum = 1
		list.forEach((item, index) => {
			if (index == 0) {
				arr.push({
					...item,
					summaryNum: num,
					creditAccountIdNum: num
				})
				num++
				return
			} else {
				if (list[index - 1].summaryNum == list[index].summaryNum) {
					childNum++
					arr.push({
						...item,
						summaryNum: list[index - 1].summaryNum,
						creditAccountIdNum: childNum
					})
				} else {
					childNum = 1
					arr.push({
						...item,
						summaryNum: num,
						creditAccountIdNum: childNum
					})
					num++
				}
			}

		})
		return arr

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
			data, arr = [], params = {},
			period = this.metaAction.gf('data.period').split('-'),
			msgList = []//错误数据	
		params.year = period[0]
		params.month = period[1]
		params.dtos = list		
		//保存校验
		list.map((item, index) => {
			if (!item.summary) {
				msgList.push(`摘要不能为空`)
			}
			if (!item.debitAccountId) {
				msgList.push(`借方不能为空`)
			}
			if (!item.creditAccountId) {
				msgList.push(`贷方不能为空`)
			}
			if (!item.creditDataSources) {
				msgList.push(`贷方科目来源不能为空`)
			}
			if (item.proportion == undefined) {
				msgList.push(`比例不能为空`)
			}
		})
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
		let businessType = this.component.props.initData.businessType
		if (businessType == 5000040022) {//结转制造费用
			params.templateType = 1
			data = await this.webapi.manufacturingCost.update(params)
		} else if (businessType == 5000040007) {//结转研发成本
			data = await this.webapi.developmentCost.update(params)
		}		
		if (data) {
			this.metaAction.toast('success', '保存成功')
		} else {
			return false
		}
	}

	filterOption = (inputValue, option, dataSource) => {
		console.log(dataSource)
		if (option && option.props && option.props.value) {		
			let itemData = dataSource.find(o => o.get('id') == option.props.value)
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
					style={{ 'textAlign': 'right', fontSize: '12px' }}
					disabled={disabled}
					customAttribute={customAttribute}
					// regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
					min={0}
					max={100}
					precision={2}
					formatter={value => `${value}%`}
					parser={value => value.replace('%', '')}
				/>
			</div>
		)
	}
}

const ExtendEditableSelectCell = ({ dataSource, filterOption, onChange, value, columnName, onClick, saveNewVlue, handleFocus, disabled, isSubject }) => {
	let productChildren = []

	if (dataSource) {
		dataSource.forEach((item, index) => {
			productChildren.push(<Option key={item.id} title={item.codeAndName ? item.codeAndName : item.name} _data={item} value={item.id}>{item.codeAndName ? item.codeAndName : item.name}</Option>)
		})
		return (
			<div style={{ width: '100%' }}>
				<Select style={{ width: '100%' }}
					onSelect={(value) => onChange(value)}
					value={value}
					disabled={disabled}
					dropdownClassName={isSubject == true ? 'add-cerficate-select' : ''}
					filterOption={filterOption}
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
					filterOption={(input, option) => filterOption(input, option)}
					dropdownClassName={'cashflowstatementDistributionSelect'}
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
