import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import { TableOperate2, Select, Button, Modal, Icon, PrintOption, FormDecorator, Popover } from 'edf-component';
import utils from 'edf-utils';
import { fromJS } from 'immutable';
import moment from 'moment';
import config from './config';

const Option = Select.Option;
import { consts } from 'edf-consts';
import table from '../../../component/components/table/table';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
		this.voucherAction = option.voucherAction;
	}

	onInit = ({ component, injections }) => {
		this.component = component;
		this.injections = injections;
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.refresh);
		}
		injections.reduce('init');
		this.changeSipmleDate = false;
		this.load();
		this.initDate()
	};

	initDate = () => {
		const { periodDate } = this.metaAction.context.get('currentOrg')
		console.log(periodDate)
		this.metaAction.sfs({
			'data.searchValue.beginDate': moment(periodDate).startOf('month'),
			'data.searchValue.endDate': moment(periodDate).endOf('month'),
		})
	}

	componentDidMount = () => {
		this.onResize();
		const win = window;
		if (win.addEventListener) {
			win.addEventListener('resize', this.onResize, false);
		} else if (win.attachEvent) {
			win.attachEvent('onresize', this.onResize);
		} else {
			win.onresize = this.onResize;
		}
	};

	componentWillUnmount = () => {
		if (this.dateDom) {
			this.dateDom.removeEventListener('click', this.rangePickerClick);
		}
		if (this.props && this.props.isFix === true) return;
		const win = window;
		if (win.removeEventListener) {
			win.removeEventListener('resize', this.onResize, false);
		} else if (win.detachEvent) {
			win.detachEvent('onresize', this.onResize);
		} else {
			win.onresize = undefined;
		}
	};

	onResize = (type) => {
		let keyRandom = Math.floor(Math.random() * 10000);
		this.keyRandom = keyRandom;
		const tableOption = this.metaAction.gf('data.tableOption')
			.toJS();
		setTimeout(() => {
			if (this.keyRandom == keyRandom) {
				let dom = document.getElementsByClassName('ttk-scm-app-proceeds-list-Body')[0];
				if (!dom) {
					if (type) {
						return;
					}
					setTimeout(() => {
						this.onResize();
					}, 20);
				} else {
					let tableOption = this.metaAction.gf('data.tableOption')
						.toJS();
					const width = dom.offsetWidth;
					const height = dom.offsetHeight;
					this.injections.reduce('setTableOption', {
						...tableOption,
						y: height - 39,
						containerWidth: width - 20
					});
				}
			}
		}, 100);
	};

	load = (params) => {
		this.sortParmas(null, null, null, 'init');
	};

	refresh = async () => {
		await this.initOption()
		let search = this.metaAction.gf('data.searchValue').toJS(),
			page = this.metaAction.gf('data.pagination').toJS()

		search.beginDate = this.metaAction.momentToString(search.beginDate, 'YYYY-MM-DD');
		search.endDate = this.metaAction.momentToString(search.endDate, 'YYYY-MM-DD');
		this.requestData({ ...search, page })
	}

	initOption = async () => {
		const params = await this.sortParmas(null, null, null, 'get')
		console.log(params)
		const [response, account] = await Promise.all([this.webapi.proceeds.init(params), this.webapi.proceeds.bankAccount()])
		const { businessTypes } = response
		let obj = {}
		if (businessTypes) {
			let arr = []
			businessTypes.forEach(function (data) {
				let result = { value: data.id, label: data.name }, resultArr = []
				if (data.children) {
					data.children.forEach(function (dataChildren) {
						resultArr.push({ value: dataChildren.id, label: dataChildren.name })
					})
				}
				result.children = resultArr
				arr.push(result)
			})
			const paramsBusinessTypes = params.businessTypes,
				paramsBusinessTypeId = params.businessTypeId
			const haveBusinessTypes = arr.find(item => item.value == paramsBusinessTypes)
			if (!haveBusinessTypes) {
				obj['data.searchValue.businessTypes'] = null
				obj['data.searchValue.businessTypeId'] = null
				obj['data.searchValue.entity.businessTypeId'] = null
			} else {
				const option = haveBusinessTypes.children
				const haveBusinessTypeId = option.find(item => item.value == paramsBusinessTypeId)
				if (!haveBusinessTypeId) {
					obj['data.searchValue.businessTypeId'] = null
					obj['data.searchValue.entity.businessTypeId'] = null
				}
				obj['data.other.businessTypesChildren'] = fromJS(option)
			}
			obj['data.other.businessTypes'] = fromJS(arr)
		}
		if (account && account.list) {
			if (params.bankAccountId) {
				const accountArr = []
				const flag = account.list.find(item => item.bankAccountTypeId == params.bankAccountId)
				if (!flag) {
					obj['data.searchValue.bankAccountId'] = null
					obj['data.searchValue.entity.bankAccountId'] = null
				}
				account.list.forEach(function (data) {
					accountArr.push({ label: data.name, value: data.id })
				})
				obj['data.other.account'] = fromJS(accountArr)
			}
		}
		this.metaAction.sfs(obj)
	}

	sortParmas = async (search, page, order, type, noInitDate) => {
		// 处理搜索参数
		if (!search) {
			search = this.metaAction.gf('data.searchValue')
				.toJS();
			search.beginDate = this.metaAction.momentToString(search.beginDate, 'YYYY-MM-DD');
			search.endDate = this.metaAction.momentToString(search.endDate, 'YYYY-MM-DD');
		}
		if (!page) {
			page = this.metaAction.gf('data.pagination')
				.toJS();
		}

		if (type != 'get') {
			//this.metaAction.sf('data.loading', true)
			let response = await this.webapi.proceeds.bankAccount(),
				account = [];
			response.list && response.list.forEach(function (data) {
				account.push({ label: data.name, value: data.id });
			});
			this.metaAction.sf('data.other.account', account);
		}

		if (type == 'get') {
			return { ...search, page, ...order };
		} else if (type == 'init') {
			const { periodDate } = this.metaAction.context.get('currentOrg')
			this.metaAction.sfs({
				'data.searchValue.datePreset': 'thisMonth',
				'data.searchValue.beginDate': moment(periodDate).startOf('month'),
				'data.searchValue.endDate': moment(periodDate).endOf('month')
			});
			search.beginDate = this.metaAction.momentToString(moment(periodDate).startOf('month'), 'YYYY-MM-DD');
			search.endDate = this.metaAction.momentToString(moment(periodDate).endOf('month'), 'YYYY-MM-DD');
			this.initData({ ...search, page, ...order }, noInitDate);
		} else {
			this.requestData({ ...search, page, ...order });
		}
	};

	initData = async (params, noInitDate) => {
		let loading = this.metaAction.gf('data.loading');
		if (!loading) {
			this.injections.reduce('tableLoading', true);
		}
		const response = await this.webapi.proceeds.init(params);
		this.injections.reduce('tableLoading', false);
		this.injections.reduce('load', { response, noInitDate });
		const searchValue = this.metaAction.gf('data.searchValue').toJS()
		this.metaAction.sfs({
			'data.tableKey': Math.random(),
			'data.other.oldSeachValue': fromJS(searchValue)
		})
		setTimeout(() => {
			this.getTableScroll();
		}, 100);
	};

	requestData = async (params) => {
		let loading = this.metaAction.gf('data.loading');
		if (!loading) {
			this.injections.reduce('tableLoading', true);
		}
		const response = await this.webapi.proceeds.init(params);
		this.injections.reduce('tableLoading', false);
		this.injections.reduce('load', { response });
		setTimeout(() => {
			this.getTableScroll();
		}, 100);
	};

	getTableScroll = () => {
		try {
			let tableOption = this.metaAction.gf('data.tableOption')
				.toJS();
			let dom = document.getElementsByClassName('ttk-scm-app-proceeds-list-Body')[0];
			let tableDom;
			if (!dom) {
				return;
			}
			if (tableOption.y) {
				tableDom = dom.getElementsByClassName('ant-table-fixed')[1];
			} else {
				tableDom = dom.getElementsByClassName('ant-table-fixed')[0];
			}
			if (tableDom && dom) {
				let num = dom.offsetHeight - tableDom.offsetHeight;
				// console.log(  num  )
				if ((num - 30) > 0 && tableOption.y) {
					delete tableOption.y;
					this.injections.reduce('update', {
						path: 'data.tableOption',
						value: tableOption
					});
				} else if (num < 0 && !tableOption.y) {
					const width = dom.offsetWidth;
					const height = dom.offsetHeight;
					this.injections.reduce('setTableOption', {
						...tableOption,
						y: height - 39,
						containerWidth: width - 20
					});
				}
			}
		} catch (err) {
			console.log(err);
		}
	};

	resizeEnd = async (params) => {
		const code = this.metaAction.gf('data').toJS().other.code
		params.code = code
		let res = await this.webapi.proceeds.batchUpdate(params)
		this.injections.reduce('resizeEnd', res[0])
	}

	needAlignType = (data) => {
		let className
		if (data.idAlignType == 1000050001) {
			className = 'left'
		} else if (data.idAlignType == 1000050002) {
			className = 'center'
		} else if (data.idAlignType == 1000050003) {
			className = 'right'
		}
		return className
	};

	renderColumns = () => {
		const tableSetting = this.metaAction.gf('data.other.columnDetails')
			.toJS();
		const tableOption = this.metaAction.gf('data.tableOption')
			.toJS();
		const arr = [];
		tableSetting.forEach(data => {
			let item;
			if (!data.isVisible) {
				return;
			}
			if (data.fieldName == 'code' || data.fieldName == 'docCode') {
				let obj = {
					title: data.caption,
					key: data.fieldName,
					className: `table_td_align_${this.needAlignType(data)}`,
					dataIndex: data.fieldName,
					width: data.width,
					render: (text, record, index) => this.rowSpan2(text, record, index, data.fieldName)
				}
				arr.push(obj);
			} else if (data.isHeader == true && data.fieldName != 'remark') {
				arr.push({
					title: data.caption,
					key: data.fieldName,
					className: `table_td_align_${this.needAlignType(data)}`,
					dataIndex: data.fieldName,
					width: data.width,
					render: (text, record, index) => this.rowSpan(text, record, index, data.fieldName)
				});
			} else if (data.fieldName == 'amount' || data.fieldName == 'receivePayAmount' || data.fieldName == 'fees') {
				arr.push({
					title: data.caption,
					key: data.fieldName,
					className: `table_td_align_${this.needAlignType(data)}`,
					dataIndex: data.fieldName,
					width: data.width,
					render: (text, record, index) => this.amountTdRender(text, record, index, data.fieldName)
				});
			} else {
				arr.push({
					title: data.caption,
					key: data.fieldName,
					className: `table_td_align_${this.needAlignType(data)}`,
					dataIndex: data.fieldName,
					width: data.width,
					render: (text, record, index) => this.normalTdRender(text, record, index, data.fieldName)
				});
			}
		});
		arr.push({
			title: (
				<Icon
					name="columnset"
					fontFamily='edficon'
					className='ttk-scm-app-proceeds-list-columnset'
					type="youcezhankailanmushezhi"
					onClick={() => this.showTableSetting({ value: true })}
				/>
			),
			key: 'voucherState',
			dataIndex: 'voucherState',
			fixed: 'right',
			className: 'table_fixed_width',
			width: 102,
			render: (text, record, index) => this.operateCol(text, record, index)
		});
		return arr;
	};

	transformThoundsNumber = (text, key) => {
		const arr = ['amountCr', 'amountDr', 'origAmount', 'price', 'amountSum', 'receivePayAmount'];

		if (arr.includes(key)) {
			if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
				return '';
			}
			if (key == 'price') {
				return utils.number.format(text, 6);
			} else {
				return utils.number.format(text, 2);
			}
		} else {
			return text;
		}
	};

	rowSpan = (text, row, index, key) => {
		// console.log('参数1',text)
		// console.log('参数2',row)
		// console.log('参数3',index)
		// console.log('参数4',key)
		const obj = {
			children: <span className="ttk-scm-app-proceeds-list-td-con"><span
				title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span></span>,
			props: {
				rowSpan: this.calcRowSpan(row.code, 'code', index)
			}
		};
		return obj;
	};

	rowSpan2 = (text, row, index, fieldName) => {
		const num = this.calcRowSpan(row.code, 'code', index);
		const obj = {
			children: (
				<span className="ttk-scm-app-proceeds-list-td-con">
					<a href="javascript:;"
						onClick={() => {
							fieldName == 'code' ? this.openMoreContent(row.id, false) : this.openDocCode(row)
						}}
						className="table-needDel"
						title={fieldName == 'code' ? text : (text ? /已生成/.test(text) ? text : '记-' + text : '')}
						data-rol={num}>
						{fieldName == 'code' ? text : (text ? /已生成/.test(text) ? text : '记-' + text : '')}
					</a>
				</span>
			),
			props: {
				rowSpan: num
			}
		};
		return obj;
	};

	openDocCode = (option) => {

		if (/已生成/.test(option.docCode)) {
			const code = option.docCode.replace(/[已生成|凭证]/g, '');
			this.metaAction.toast('error', `请在${code}凭证管理查看生成的凭证`)
		} else {
			this.component.props.setPortalContent &&
				this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: option.docId } })
		}
	}

	amountTdRender = (text, record, index, key) => {
		return <span className="ttk-scm-app-payment-list-td-con"
			title={utils.number.addThousPos(text)}>{utils.number.addThousPos(text)}</span>
	}

	normalTdRender = (text, record, index, key) => {
		return <span className="ttk-scm-app-proceeds-list-td-con"
			title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span>;
	};

	normalTdRender2 = (text) => {
		return <span title={text} className="ttk-scm-app-proceeds-list-td-con" title={text}>{text}</span>;
	};

	getNormalSearchValue = () => {
		const data = this.metaAction.gf('data.searchValue')
			.toJS();
		let date = [data.beginDate, data.endDate];
		return { date, simpleCondition: data.simpleCondition };
	};

	combineColumnProp = (data) => {
		if (!data) return [];
		let newDataArray = [];
		data.forEach((ele, index) => {
			newDataArray.push({
				'isVisible': ele.isVisible,
				'id': ele.id,
				'ts': ele.ts
			});
		});

		return newDataArray;
	};

	//更新栏目
	showTableSetting = async ({ value, data }) => {
		this.injections.reduce('update', {
			path: 'data.showTableSetting',
			value: false
		});
		const preData = this.metaAction.gf('data.other.columnDetails');
		if (value === false) {
			this.injections.reduce('update', {
				path: 'data.other.columnDetails',
				value: data
			});
			const columnSolution = await this.webapi.proceeds.findByParam({ code: 'receiveList' });
			if (columnSolution) {
				let columnSolutionId = columnSolution.id;
				const ts = this.metaAction.gf('data.other.ts');
				const columnDetail = await this.webapi.proceeds.updateWithDetail({
					'id': columnSolutionId,
					'columnDetails': this.combineColumnProp(data),
					ts: ts
				});

				if (columnDetail) {
					this.injections.reduce('settingOptionsUpdate', {
						visible: value,
						data: columnDetail.columnDetails
					});
				} else {
					this.metaAction.sf('data.other.columnDetails', preData);
				}
			} else {
				this.metaAction.sf('data.other.columnDetails', preData);
			}
		}
		else {
			this.injections.reduce('tableSettingVisible', { value, data: data });
		}
	};

	// 关闭栏目设置
	closeTableSetting = () => {
		this.injections.reduce('tableSettingVisible', { value: false });
	};

	// 高级搜索确定是简单搜索条件清除
	searchValueChange = (value) => {
		this.injections.reduce('update', { path: 'data.other.oldSeachValue', value: value })
		let prevValue = this.metaAction.gf('data.searchValue').toJS();
		this.injections.reduce('searchUpdate', { ...prevValue, ...value });
		const pages = this.metaAction.gf('data.pagination').toJS();
		if (value.beginDate) value.beginDate = this.metaAction.momentToString(value.beginDate, 'YYYY-MM-DD')
		if (value.endDate) value.endDate = this.metaAction.momentToString(value.endDate, 'YYYY-MM-DD')
		this.sortParmas({ ...prevValue, ...value }, { ...pages, 'currentPage': 1 });
		//this.clearClick(value, 'search');
		this.changeSipmleDate = true;
	};

	// 高级搜索清空
	clearClick = (value, key) => {
		let oldSeachValue = this.metaAction.gf('data.searchValue').toJS()
		this.injections.reduce('update', { path: 'data.other.oldSeachValue', value: oldSeachValue })

		const { periodDate } = this.metaAction.context.get('currentOrg')
		if (value && key == 'search') {
			value.bankAccountId = '';
			value.businessTypeId = '';
			value.businessTypes = '';
			this.metaAction.sf(
				'data.searchValue', fromJS(value)
			);
		} else {
			value.entity.bankAccountId = '';
			value.entity.businessTypeId = '';
			value.datePreset = 'today';
			value.beginDate = moment(periodDate).startOf('month');
			value.endDate = moment(periodDate).endOf('month');
			value.bankAccountId = ''
			value.businessTypes = ''
			value.businessTypeId = ''
			this.metaAction.sf(
				'data.searchValue', fromJS(value)
			);
		}
	};

	// 高级搜索取消
	searchCancelChange = () => {
		let oldSeachValueJS = this.metaAction.gf('data.other.oldSeachValue')
		let oldSeachValue
		if (oldSeachValueJS && oldSeachValueJS.toJS) {
			oldSeachValue = oldSeachValueJS.toJS()
		} else {
			oldSeachValue = this.metaAction.gf('data.searchValue').toJS()
		}
		this.injections.reduce('update', { path: 'data.searchValue', value: oldSeachValue })
	}

	//日期选择联动
	dateSelect = (key) => {
		let beginDate,
			endDate;
		switch (key) {
			case 'today':
				beginDate = moment();
				endDate = moment();
				break;
			case 'yesterday':
				beginDate = moment()
					.subtract(1, 'days');
				endDate = moment()
					.subtract(1, 'days');
				break;
			case 'thisWeek':
				beginDate = moment()
					.startOf('week');
				endDate = moment()
					.endOf('week');
				break;
			case 'thisMonth':
				beginDate = moment()
					.startOf('month');
				endDate = moment()
					.endOf('month');
				break;
			case 'thisYear':
				beginDate = moment()
					.startOf('year');
				endDate = moment()
					.endOf('year');
				break;
		}
		this.metaAction.sfs({
			'data.searchValue.datePreset': key,
			'data.searchValue.beginDate': beginDate,
			'data.searchValue.endDate': endDate
		});
		this.sortParmas();
	};

	dateSelectMoreSearch = (key) => {
		let beginDate,
			endDate;
		switch (key) {
			case 'today':
				beginDate = moment();
				endDate = moment();
				break;
			case 'yesterday':
				beginDate = moment()
					.subtract(1, 'days');
				endDate = moment()
					.subtract(1, 'days');
				break;
			case 'thisWeek':
				beginDate = moment()
					.startOf('week');
				endDate = moment()
					.endOf('week');
				break;
			case 'thisMonth':
				beginDate = moment()
					.startOf('month');
				endDate = moment()
					.endOf('month');
				break;
			case 'thisYear':
				beginDate = moment()
					.startOf('year');
				endDate = moment()
					.endOf('year');
				break;
		}
		this.metaAction.sfs({
			'data.searchValue.datePreset': key,
			'data.searchValue.beginDate': beginDate,
			'data.searchValue.endDate': endDate
		});
	};

	dataChange = () => {
		// this.metaAction.sfs({
		// 	'data.searchValue.datePreset': 'custom'
		// })
		this.injections.reduce('update', {
			path: 'data.searchValue.datePreset',
			value: 'custom'
		})
	}
	// 账号选择
	accountMoreSearch = (key) => {
		this.metaAction.sfs({
			'data.searchValue.entity.bankAccountId': key,
			'data.searchValue.bankAccountId': key
		});
	};

	businessSelectMoreSearch = (key) => {
		let other = this.metaAction.gf('data.other')
			.toJS();
		let businessChildren = other.businessTypes.filter(function (data) {
			return data.value == key;
		})[0];
		this.metaAction.sfs({
			'data.searchValue.businessTypeId': '',
			'data.searchValue.businessTypes': key,
			'data.other.businessTypesChildren': businessChildren && businessChildren.children
		});
	};

	businessChildMoreSearch = (key) => {
		this.metaAction.sfs({
			'data.searchValue.businessTypeId': key,
			'data.searchValue.entity.businessTypeId': key
		});
	};
	//分页发生变化
	pageChanged = (current, pageSize) => {
		let page = this.metaAction.gf('data.pagination')
			.toJS();
		let searchValue = this.metaAction.gf('data.searchValue')
			.toJS();
		const len = this.metaAction.gf('data.list')
			.toJS().length;
		if (pageSize) {
			page = {
				...page,
				'currentPage': len == 0 ? 1 : current,
				'pageSize': pageSize
			};
		} else {
			page = {
				...page,
				'currentPage': len == 0 ? 1 : current
			};
		}
		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: [],
				selectedOption: []
			}
		});
		this.sortParmas(searchValue, page);
	};

	// 全选
	checkboxChange = (arr, itemArr) => {
		let newArr = [],
			newItemArr = [];
		arr.forEach(item => {
			if (item) {
				newArr.push(item);
			}
		});
		itemArr.forEach(item => {
			if (item) {
				newItemArr.push(item);
			}
		});
		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: newArr,
				selectedOption: newItemArr
			}
		});
		this.selectedOption = newItemArr;
	};

	moreActionOpeate = (e) => {
		this[e.key] && this[e.key]();
	};


	getNewData = () => {
		const checkboxValue = this.metaAction.gf('data.tableCheckbox.checkboxValue')
			.toJS();
		const list = this.metaAction.gf('data.list')
			.toJS();
		let arr = [];
		list.map(item => {
			if (checkboxValue.includes(item.code)) {
				arr.push(item);
			}
		});
		return arr;
	};

	//去重
	delRepeat = (data, code) => {
		const arr = new Map();
		data.map(item => {
			if (!arr.has(item[code])) {
				arr.set(item[code], item);
			}
		});
		const sum = [];
		for (let value of arr.values()) {
			sum.push(value);
		}
		return sum;
	};

	// 生成凭证
	auditClick = async (id, ts) => {
		const res = await this.webapi.proceeds.audit({ id, ts });
		if (res) {
			this.metaAction.toast('success', `生成凭证成功`);
		}
		// 重新请求列表数据
		this.sortParmas();
	};
	allAuditClick = async () => {
		const selectedOption = this.getNewData();
		if (selectedOption.length == 0) {
			this.metaAction.toast('error', '请选择您要生成凭证的数据');
			return;
		}
		let flag = false;
		let data = selectedOption.map(item => {
			if (item.status != consts.VOUCHERSTATUS_Approved) {
				flag = true;
			}
			return {
				id: item.id,
				ts: item.ts
			};
		});
		if (!flag) {
			return this.metaAction.toast('warn', '当前没有可生成凭证数据');
		}
		this.metaAction.sf('data.loading', true)
		let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
		if (!isAuditEdit) return
		this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
		let loading = this.metaAction.gf('data.loading')
		if (!loading) {
			this.injections.reduce('tableLoading', true);
		}
		const res = await this.webapi.proceeds.allAudit(this.delRepeat(data, 'id'));
		this.injections.reduce('tableLoading', false);
		this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
		if (res) {
			if (res.fail && res.fail.length) {
				this.showError('生成凭证结果', res.success, res.fail);
			} else {
				this.metaAction.toast('success', '生成凭证成功')
			}
		}
		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: [],
				selectedOption: []
			}
		});
		// 重新请求列表数据
		this.sortParmas();
	};

	//删除凭证
	unauditClick = async (id, ts) => {
		const res = await this.webapi.proceeds.unaudit({ id, ts });
		if (res) {
			this.metaAction.toast('success', `删除凭证成功`);
		}
		// 重新请求列表数据
		this.sortParmas();
	};

	allVersaAuditClick = async () => {
		const selectedOption = this.getNewData();
		if (selectedOption.length == 0) {
			this.metaAction.toast('error', '请选择您要删除凭证的数据');
			return;
		}
		let flag = false;
		let data = selectedOption.map(item => {
			if (item.status == consts.VOUCHERSTATUS_Approved) {
				flag = true;
			}
			return {
				id: item.id,
				ts: item.ts
			};
		});
		if (!flag) {
			return this.metaAction.toast('warn', '当前没有删除凭证的数据');
		}
		let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
		if (!isAuditEdit) return
		this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
		let loading = this.metaAction.gf('data.loading')
		if (!loading) {
			this.injections.reduce('tableLoading', true);
		}
		const res = await this.webapi.proceeds.allUnaudit(this.delRepeat(data, 'id'));
		this.injections.reduce('tableLoading', false);
		this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
		if (res) {
			if (res.fail && res.fail.length) {
				this.showError('删除凭证结果', res.success, res.fail);
			} else {
				this.metaAction.toast('success', '删除凭证成功')
			}
		}

		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: [],
				selectedOption: []
			}
		});
		// 重新请求列表数据
		this.sortParmas();
	};

	showError = (title, successArr, failArr) => {
		const ret = this.metaAction.modal('show', {
			title,
			width: 585,
			// footer: null,
			bodyStyle: { padding: '2px 0 10px 11px' },
			children: this.metaAction.loadApp('ttk-scm-app-error-list', {
				store: this.component.props.store,
				successArr,
				failArr
			}),
		})
	}

	// 删除
	delModal = async (id, ts) => {
		const _this = this;
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '你确定要删除吗？',
			onOk() {
				return _this.delId(id, ts);
			}
		});
		if (ret) {
			console.log(ret);
		}
	};

	delId = async (id, ts) => {
		const res = await this.webapi.proceeds.delete({ id, ts });

		if (res) {
			this.metaAction.toast('success', '删除成功');
		}
		let { checkboxValue, selectedOption } = this.metaAction.gf('data.tableCheckbox')
			.toJS();
		checkboxValue = checkboxValue.filter(item => item != id);
		selectedOption = selectedOption.filter(item => item.id != id);
		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: checkboxValue,
				selectedOption: selectedOption
			}
		});
		this.sortParmas();
	};

	//批量删除
	allDel = async () => {
		const selectedOption = this.getNewData();
		if (selectedOption.length == 0) {
			this.metaAction.toast('error', '请选择您要删除的数据');
			return;
		}

		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '您确认要删除吗?'
		})

		if (!ret) return

		let data = selectedOption.map(item => {
			return {
				id: item.id,
				ts: item.ts
			};
		});
		const res = await this.webapi.proceeds.allDelete(this.delRepeat(data, 'id'));
		if (res) {
			//	this.metaAction.toast('success', `本次删除${this.delRepeat(data, 'id').length}条数据，删除成功${res.success && res.success.length}条数据`);
			if (res.fail.length > 0) {
				this.showError('删除结果', res.success, res.fail);
			} else {
				this.metaAction.toast('success', '删除成功')
			}
		}
		this.injections.reduce('update', {
			path: 'data.tableCheckbox',
			value: {
				checkboxValue: [],
				selectedOption: []
			}
		});
		// 重新请求列表数据
		this.sortParmas();
	};

	//科目设置
	subjectManage = async () => {
		this.component.props.setPortalContent &&
			this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=proceeds', { accessType: 'receipt' })
	}
	// 凭证习惯
	voucherHabit = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '凭证习惯设置',
			width: 480,
			okText: '确定',
			bodyStyle: { padding: '8px 24px' },
			children: this.metaAction.loadApp('ttk-scm-voucherHabit-card', {
				store: this.component.props.store,
				type: 'receive',
			}),
		})
		if (ret) this.metaAction.toast('success', '设置成功')
	}

	newAddProofClick = () => {
		this.component.props.setPortalContent &&
			this.component.props.setPortalContent(
				'收款单',
				'ttk-scm-app-proceeds-card',
				{}
			);
	};

	openMoreContent = (id) => {
		this.component.props.setPortalContent &&
			this.component.props.setPortalContent(
				'收款单',
				'ttk-scm-app-proceeds-card',
				{ id: id }
			);
	};

	operateCol = (text, record, index) => {
		const { status, code, id } = record;
		const num = this.calcRowSpan(code, 'code', index), _this = this;
		const obj = {
			children: (
				<div>
					{record.seq == '合计' ? null : <div style={{ textAlign: 'center' }}>
						<Icon type="shengchengpingzheng"
							fontFamily='edficon'
							className={status != consts.VOUCHERSTATUS_Approved ? "lanmuicon_pz" : "lanmuicon_scpz"}
							title={status != consts.VOUCHERSTATUS_Approved ? "生成凭证" : "删除凭证"}
							style={{ fontSize: 23, cursor: 'pointer' }}
							onClick={function () { status != consts.VOUCHERSTATUS_Approved ? _this.auditClick(id, record.ts) : '' }} />
						<Icon type="bianji"
							fontFamily='edficon'
							title="编辑"
							style={{ fontSize: 23, cursor: 'pointer' }}
							onClick={function () { _this.openMoreContent(id, true) }} />
						<Icon type="shanchu"
							fontFamily='edficon'
							title='删除'
							disabled={status == consts.VOUCHERSTATUS_Approved}
							style={{ fontSize: 23, cursor: 'pointer' }}
							onClick={function () { status == consts.VOUCHERSTATUS_Approved ? null : _this.delModal(id, record.ts) }} />
					</div>}
				</div>
			),
			props: {
				rowSpan: num
			}
		};
		return obj;
	};

	rangePickerClick = () => {
		this.injections.reduce('update', {
			path: 'data.showPicker',
			value: true
		});
	};

	//获取时间选项
	getNormalDateValue = () => {
		const data = this.metaAction.gf('data.searchValue')
			.toJS();
		const arr = [];
		arr.push(data.beginDate);
		arr.push(data.endDate);
		return arr;
	};

	normalSearchDateChange = (value) => {
		console.log('简单时间搜索');
		this.metaAction.sfs({
			'data.searchValue.datePreset': 'custom',
			'data.searchValue.beginDate': value && value[0],
			'data.searchValue.endDate': value && value[1]
		});
		this.sortParmas();
		this.changeSipmleDate = true;
	};

	// normalSearchDateOnChange = () => {
	// 	console.log('简单时间搜索')
	// }

	normalSearchChange = (path, value, initSearchValue, type) => {
		let params = this.metaAction.gf('data.searchValue')
			.toJS();
		if (initSearchValue) {
			params = { ...params, ...initSearchValue };
		}
		if (path == 'date') {
			params.beginDate = value[0];
			params.endDate = value[1];
		} else {
			params[path] = value;
		}

		this.injections.reduce('searchUpdate', params);
		const pages = this.metaAction.gf('data.pagination')
			.toJS();
		this.sortParmas(params, { ...pages, 'currentPage': 1 });
		// console.log('简单搜索')
		this.changeSipmleDate = true;
	};

	export = async () => {
		const params = await this.sortParmas(null, null, null, 'get');
		const list = this.metaAction.gf('data.list')
			.toJS();
		if (list.length == 0) {
			this.metaAction.toast('warn', '当前没有可导出数据');
			return;
		}
		// params.docIdsStr = this.getPrintDocId();
		await this.webapi.proceeds.export(params);
		this.metaAction.toast('success', '导出成功');
	};

	print = async () => {
		_hmt && _hmt.push(['_trackEvent', '财务', '凭证管理', '打印']);

		let ret,
			form;
		let _this = this;
		const list = this.metaAction.gf('data.list')
			.toJS();
		if (list.length == 0) {
			this.metaAction.toast('warn', '当前没有可打印数据');
			return;
		}
		const {
			height,
			maxLineNum,
			printAuxAccCalc,
			type,
			width
		} = await this.webapi.proceeds.getPrintConfig();
		this.metaAction.modal('show', {
			title: '打印',
			width: 400,
			footer: null,
			iconType: null,
			okText: '打印',
			className: 'mk-ttk-scm-app-proceeds-list-modal-container',
			children: <PrintOption
				height={height}
				maxLineNum={maxLineNum}
				printAuxAccCalc={printAuxAccCalc}
				type={type}
				width={width}
				callBack={_this.submitPrintOption}
			/>
		});
	};

	getPrintDocId = () => {
		const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption')
			.toJS();
		if (selectedOption.length == 0) {
			return '';
		}
		let arr = selectedOption.map(item => {
			return item.docId;
		});
		return arr.join(',');
	};

	submitPrintOption = async (form, target) => {
		let params = this.sortParmas(null, null, null, 'get');
		delete params.page;
		let option = {
			'type': parseInt(form.state.value),
			'printAuxAccCalc': form.state.printAccountChecked,
			'docIdsStr': this.getPrintDocId()
		};
		if (form.state.value == '0') {
			Object.assign(option, { 'maxLineNum': form.state.pageSize }, params);
		} else if (form.state.value == '2') {
			Object.assign(option, { 'height': form.state.height, 'width': form.state.width }, params);
		} else {
			Object.assign(option, params);
		}
		let res = await this.webapi.proceeds.print(option);
	};

	calcRowSpan(text, columnKey, currentRowIndex) {
		const list = this.metaAction.gf('data.list');
		if (!list) return;
		const rowCount = list.size;
		if (rowCount == 0 || rowCount == 1) return 1;

		if (currentRowIndex > 0
			&& currentRowIndex <= rowCount
			&& text == list.getIn([currentRowIndex - 1, columnKey])) {
			return 0;
		}

		let rowSpan = 1;
		for (let i = currentRowIndex + 1; i < rowCount; i++) {
			if (text == list.getIn([i, columnKey])) {
				rowSpan++;
			} else {
				break;
			}
		}

		return rowSpan;
	}

	checkSearchValue = (value, form) => {
		let flagCode = this.checkSearchValueCode(value, form);
		return flagCode;
	};

	checkSearchValueCode = (value, form) => {
		console.log('数据', value);
		const { endCode, startCode } = value;
		if (!endCode && !startCode) {
			form.setFields({
				startCode: {
					value: '',
					errors: null
				},
				endCode: {
					value: '',
					errors: null
				}
			});
			return true;
		}
		if ((!endCode && startCode)) {
			let startCodeNum = parseInt(value.startCode ? value.startCode : 0);
			if (isNaN(startCodeNum) || startCodeNum > 9999) {
				form.setFields({
					startCode: {
						errors: [new Error('请输入正确的凭证号')]
					}
				});
				return false;
			}
			form.setFields({
				startCode: {
					value: this.padStart(startCodeNum),
					errors: null
				},
				endCode: {
					value: 9999,
					errors: null
				}
			});
			value.startCode = this.padStart(startCodeNum);
			value.endCode = 9999;
			return true;
		} else {
			let startCodeNum = parseInt(value.startCode ? value.startCode : 0);
			let endCodeNum = parseInt(value.endCode);
			let flag = true;
			if (isNaN(startCodeNum) || startCodeNum > 9999) {
				flag = false;
				form.setFields({
					startCode: {
						errors: [new Error('请输入正确的凭证号')]
					}
				});
			}
			if (isNaN(endCodeNum) || endCodeNum > 9999) {
				flag = false;
				form.setFields({
					endCode: {
						errors: [new Error('请输入正确的凭证号')]
					}
				});
			}
			if (flag) {
				form.setFields({
					startCode: {
						value: endCodeNum > startCodeNum ? this.padStart(startCodeNum) : this.padStart(endCodeNum),
						errors: null
					},
					endCode: {
						value: endCodeNum > startCodeNum ? this.padStart(endCodeNum) : this.padStart(startCodeNum),
						errors: null
					}
				});
				value.startCode = endCodeNum > startCodeNum ? this.padStart(startCodeNum) : this.padStart(endCodeNum);
				value.endCode = endCodeNum > startCodeNum ? this.padStart(endCodeNum) : this.padStart(startCodeNum);
			}
			return flag;
		}
		return true;
	};

	padStart = (num) => {
		return num.toString()
			.padStart(4, '0');
	};


	/**
	 * current 每个月份
	 * pointTime 指定比较的时间
	 * type 'pre' 前 'next' 后
	 * return 返回 true 代表禁用
	 */
	disabledDate = (current, pointTime, type) => {
		const enableddate = this.metaAction.gf('data.other.enableddate');
		// const enableddateNum = this.transformDateToNum(enableddate)
		this.dataChange();
		if (type == 'pre') {
			let currentMonth = this.transformDateToNum(current);
			let enableddateMonth = this.transformDateToNum(enableddate);
			return currentMonth < enableddateMonth;
		} else {
			let currentMonth = this.transformDateToNum(current);
			let pointTimeMonth = this.transformDateToNum(pointTime);
			let enableddateMonth = this.transformDateToNum(enableddate);
			return currentMonth < pointTimeMonth || currentMonth < enableddateMonth;
		}

	};

	transformDateToNum = (date) => {
		try {
			if (!date) {
				return 0;
			}
			let time = date;
			if (typeof date == 'string') {
				time = utils.date.transformMomentDate(date);
			}
			return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`);
		} catch (err) {
			console.log(err);
			return 0;
		}

	};

	disabledRangePicker = (current) => {
		const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg');
		return true;
	};

	filterOptionSummary = (input, option) => {
		if (option && option.props && option.props.label) {
			return option.props.label.toLowerCase()
				.indexOf(input.toLowerCase()) >= 0;
		}
		return true;
	};

	renderRowClassName = (record, index) => {
		if (record.seq == '合计') {
			return 'tr_heji'
		}
	}

	resetClick = async () => {
		const code = this.metaAction.gf('data').toJS().other.code
		//重置栏目
		await this.webapi.proceeds.reInitByUser({ code: code })
		const columnSolution = await this.webapi.proceeds.findByParam({ code: 'receiveList' })
		this.injections.reduce('settingOptionsUpdate', { visible: false, data: columnSolution.columnDetails })
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
