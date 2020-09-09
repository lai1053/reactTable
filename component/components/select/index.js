import React, { PureComponent } from 'react'
import Select from 'ttk-rc-select'
import classNames from 'classnames'
import isequal from 'lodash.isequal'
import LazySelect from './lazySelect'
import { fromJS } from 'immutable'
export default class SelectComponent extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			props,
			defaultSelectRows: props.defaultSelectRows,
			selectRows: props.selectRows,
			currentRows: props.defaultSelectRows || 50,
			rowHeight: props.rowHeight || 36,
			isScrollBarTrigger: false,
			optionData: [],
			sourceData: [],
			defaultActiveFirstOption: undefined,//优化凭证科目选择效率,不录入默认不选择，筛选后，才选中
			optionDataFalg: false,
		}
	}
	assitShouldComponent = (target) => {
		let obj = {}
		for (const [key, value] of Object.entries(target)) {
			if (typeof (value) != 'function') {
				obj[key] = value
			}
		}
		return obj
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !(isequal(this.assitShouldComponent(this.props), this.assitShouldComponent(nextProps)) && isequal(this.state, nextState))
	}

	/**
	 * 当前组件render之前只执行一次
	 */
	componentWillMount = () => {
		if (this.props.selectPagination//启用select懒加载
			&& this.props.accountDataFromWindow) {	//标记凭证从windows对象获取科目数据		
			this.setState({
				optionData: this.getSelectOptions(window.accountingSubjectsAll || fromJS([]))
			})
		}
	}

	/**
	 * 
	 * @param {根据输入项进行筛选} props
	 */
	filterOption(props) {
		if (props.filterOption) {
			if (props.selectPagination && props.children) {
				const data = props.children
				if (data.length < 1) {
					return false
				}
			}
			return props.filterOption
		}
		let filterOptionExpressions = props.filterOptionExpressions
		if (filterOptionExpressions) {
			let filterFields = filterOptionExpressions.split(',')
			return (input, option) => {
				for (let f of filterFields) {
					let tmp = option.props.children
					if (tmp && tmp.toLowerCase().indexOf(input.toLowerCase()) != -1)
						return true
				}
				return false
			}
		}
		return undefined
	}

	/**
	 * 
	 * @param {下拉列表滚动时的回调} param0
	 */
	popupScroll({ event, selectRows, data }) {
		//data:总数据
		//defaultSelectRows：初始默认行数
		//selectRows:滚动一次加载的行数		

		if (this.state.props.selectPagination) {

			// console.log('scrollHeight:' + event.target.scrollHeight + '  scrollTop:' + event.target.scrollTop + '  offsetHeight:' + event.target.offsetHeight)

			if (event.target.scrollHeight - event.target.scrollTop - event.target.offsetHeight < 5) {
				const curIndex = data.findIndex(item => {
					return item.props && item.props.value == (this.state.props.value || this.props.value)
				})

				if (curIndex > this.state.currentRows) {
					this.setState({
						currentRows: curIndex + selectRows,
						isScrollBarTrigger: true
					})
				} else {
					this.setState({
						currentRows: this.state.currentRows + selectRows,
						isScrollBarTrigger: true
					})
				}

			}
			if ((this.state.props.value || this.props.value)
				&& event.target.scrollHeight > event.target.offsetHeight
				&& event.target.scrollTop < 1) {
				const curIndex = data.findIndex(item => {
					return item.props && item.props.value == (this.state.props.value || this.props.value)
				})
				const defaultCount = 3 * this.state.selectRows,
					startIndex = curIndex - defaultCount
				/**
				 * 当前查找行超过可视区域容纳行数后进行截取
				 */
				if (curIndex > defaultCount) {
					this.setState({
						currentRows: curIndex + this.state.selectRows,
						isScrollBarTrigger: true
					})
				}

			}
		} else {
			return false
		}
	}

	/**
	 * 
	 * @param {文本框值变化时回调} param0
	 */
	onSearch({ inputValue, data }) {
		if (this.props.accountingSubjectFlag) {
			const accountingSubjects = data

			let groupAccounts = []
			if (accountingSubjects) {
				if (inputValue && (!Number(inputValue) || Number(inputValue) > 10)) {
					accountingSubjects.forEach(item => {
						if (item.props.children.indexOf(inputValue) > -1) {
							groupAccounts.push(item)
						}
					})
				} else {
					accountingSubjects.forEach(item => {
						if (item.props.children.slice(0, 1).indexOf(inputValue) > -1) {
							groupAccounts.push(item)
						}
					})
				}
			}
			if (groupAccounts.length > 0) {
				this.setState({
					sourceData: groupAccounts,
					optionDataFalg: inputValue ? true : false
				})
			}
		} else {
			this.props.onSearch && this.props.onSearch(inputValue)
			if (this.props.selectPagination
				&& this.props.accountDataFromWindow) {
				this.setState({
					defaultActiveFirstOption: inputValue.length < 1 ? false : true,
					optionData: this.getSelectOptions(window.accountingSubjectOptions || fromJS([]))
				})
			}

		}

	}
	/**
	 * 凭证从windonw全局对象下面获取科目数据，
	 * 提升效率
	 */
	getSelectOptions = (options) => {
		const res = []
		if (options) {
			for (let index = 0; index < options.size; index++) {
				const element = options.get(index)
				res.push(
					<Option
						key={`subject${element.get('id')}`}
						value={element.get('id')}
						title={element.get('codeAndName')}
					>
						{element.get('codeAndName')}
					</Option>
				)
			}
		}
		return res
	}


	SelectComponent(props) {
		let { className, notFoundContent, optionLabelProp,
			mode, combobox, tags, multiple, isGetComboboxValue, size, defaultActiveFirstOption, onPopupScroll, ...otherProps } = props
		className = classNames({
			'ant-select': true,
			'mk-select': true,
			[`ant-select-lg`]: size === 'large',
			[`ant-select-sm`]: size === 'small',
			[className]: !!className
		})

		const isCombobox = mode === 'combobox' || combobox
		notFoundContent = notFoundContent || '无匹配结果'

		if (isCombobox) {
			notFoundContent = null;
			// children 带 dom 结构时，无法填入输入框
			optionLabelProp = optionLabelProp || 'value'
			if (isGetComboboxValue) {
				optionLabelProp = 'comboboxValue' //财务账簿、凭证需要支持拷贝、复制、粘贴功能，从option的此自定义属性取值
			}
		}

		const modeConfig = {
			multiple: mode === 'multiple' || multiple,
			tags: mode === 'tags' || tags,
			combobox: isCombobox,
		}

		let suffix = props.suffix
		if (props.suffix) {
			suffix = React.cloneElement(props.suffix, { style: { float: "right" } })

		}

		if (this.state.props.selectPagination) {
			let data = otherProps.children
			if (otherProps.accountDataFromWindow) {//凭证处理
				defaultActiveFirstOption = !this.state.defaultActiveFirstOption ? false : true
				data = this.state.optionData
			}
			if (this.state.optionDataFalg) {//财务账簿
				data = this.state.sourceData
			}
			if (props.value && !this.state.isScrollBarTrigger) {
				defaultActiveFirstOption = true
				const curIndex = data.findIndex(item => {
					return item.props && item.props.value == props.value
				})
				const defaultCount = 3 * this.state.selectRows
				if (curIndex > defaultCount) {
					const startIndex = curIndex - defaultCount,
						endIndex = curIndex + this.state.selectRows
					otherProps.children = data.slice(startIndex, endIndex)
				} else {
					otherProps.children = data.slice(0, defaultCount)
				}
			} else {
				otherProps.children = data.slice(0, this.state.currentRows)
			}
		}
		else {
			otherProps.children = props.children
		}
		if (this.props.lazyload) {
			return (
				<LazySelect
					{...otherProps}
					{...modeConfig}
					prefixCls='ant-select'
					className={className}
					notFoundContent={notFoundContent}
					suffix={suffix}
				/>
			)
		}
		return (<Select
			{...otherProps}
			{...modeConfig}
			prefixCls='ant-select'
			className={className}
			defaultActiveFirstOption={defaultActiveFirstOption == undefined ? true : defaultActiveFirstOption}//defaultActiveFirstOption=undefined代表调用没有这个属性,那么走系统默认值true
			optionLabelProp={optionLabelProp || 'children'}
			notFoundContent={notFoundContent}
			onSearch={(inputValue) => this.onSearch({ inputValue, data: props.accountDataFromWindow ? this.state.optionData : props.children })}
			filterOption={this.filterOption(this.state.props)}
			suffix={suffix}
			defaultSelectRows={this.state.props.defaultSelectRows || 10}  //select组件默认显示行数
			selectRows={this.state.props.selectRows || 10} //select组件滚动一次加载的行数
			selectPagination={this.state.props.selectPagination || false} //select组件是否支持分页加载
			onPopupScroll={(e) => this.popupScroll({ event: e, selectRows: this.props.selectRows, data: props.accountDataFromWindow ? this.state.optionData : props.children })}
		/>)
	}

	render() {
		return (
			this.SelectComponent(this.props)
		)
	}
}
SelectComponent.Option = Select.Option
SelectComponent.OptGroup = Select.OptGroup
