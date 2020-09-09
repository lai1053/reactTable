import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import utils from 'edf-utils';
import { Map, fromJS, toJS } from 'immutable'
import config from './config'
import moment from 'moment'
import Confirmsend from './components/Confirmsend'
import Download from './components/Download'
import { environment } from 'edf-utils'
import { Icon } from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {

		this.component = component
		this.injections = injections
		injections.reduce('init')

		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus);
			addEventListener('onResize', () => this.onResize())
		}

		this.load();
	}

	load = async () => {
		const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
		let enbledMoment = null, beginInvoiceDate = null, endInvoiceDate = null;
		//默认日期
		if (periodDate) {
			beginInvoiceDate = moment(periodDate).startOf('month');
			endInvoiceDate = moment(periodDate).endOf('month');
		}
		if (enabledMonth && enabledYear) {
			enbledMoment = utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
		}
		this.metaAction.sfs({
			'data.searchValue.beginInvoiceDate': beginInvoiceDate,
			'data.searchValue.endInvoiceDate': endInvoiceDate,
			'data.other.enableddate': enbledMoment,
			'data.other.periodDate': moment(periodDate)
		});
		let invoiceSum = await this.getInvoiceSum();
		await this.request({ invoiceSum });
	}

	onTabFocus = async () => {
		let invoiceSum = await this.getInvoiceSum();
		await this.request({ invoiceSum });
	}

	renderColumns = () => {
		const sort = this.metaAction.gf('data.sort').toJS();
		return [
			{
				title: '序号',
				dataIndex: 'seq',
				align: 'center',
				width: 43
			},
			{
				title: {
					name: 'sort',
					component: 'TableSort',
					sortOrder: sort.invoiceDate.order,
					handleClick: (e) => { this.sortChange("invoiceDate", e) },
					title: '开票日期'
				},
				dataIndex: 'invoiceDate',
				align: 'center',
				width: 90,
				render: (text, record, index) => {
					if (!record.id) {
						let totalCount = this.metaAction.gf('data.pagination.totalCount');
						return {
							children: <span className='ttk-table-app-list-td-con center' title={`份数：${totalCount}份`}>份数：{totalCount}份</span>,
							props: {
								colSpan: 3,
							},
						}
					} else {
						return <span title={text}>{text}</span>
					}
				}
			},
			{
				title: '发票号码',
				dataIndex: 'invoiceNumber',
				width: 78,
				align: 'center',
				render: (text, record, index) => {
					if (!record.id) {
						return {
							children: null,
							props: {
								colSpan: 0,
							},
						}
					} else {
						return <span title={text} className='ttk-table-app-list-td-con center'>{text}</span>
					}
				}
			},
			{
				title: '发票代码',
				dataIndex: 'invoiceCode',
				align: 'center',
				width: 102,
				render: (text, record, index) => {
					if (!record.id) {
						return {
							children: null,
							props: {
								colSpan: 0,
							},
						}
					} else {
						return <span title={text} className='ttk-table-app-list-td-con left'>{text}</span>
					}
				}
			},
			{
				title: '金额',
				width: 102,
				dataIndex: 'totalAmount',
				render: (text, record, index) => {
					text = utils.number.format(text, 2);
					return <span title={text} className='ttk-table-app-list-td-con right'>{text}</span>
				}
			},
			{
				title: '税额',
				width: 102,
				dataIndex: 'totalTax',
				render: (text, record, index) => {
					text = utils.number.format(text, 2);
					return <span title={text} className='ttk-table-app-list-td-con right'>{text}</span>
				}
			},
			{
				title: '销方名称',
				//width: 210,
				dataIndex: 'supplierName',
			},
			{
				title: {
					name: 'sort',
					component: 'TableSort',
					sortOrder: sort.authenticatedStatus.order,
					handleClick: (e) => { this.sortChange("authenticatedStatus", e) },
					title: '认证状态'
				},
				align: 'center',
				width: 96,
				dataIndex: 'authenticatedStatus',
				render: (text, record, index) => {
					if (text === 0) {
						return <span title='已提交,待认证'>已提交,待认证</span>
					} else if (text === -1) {
						return <span title='未认证'>未认证</span>
					} else if (text === 1) {
						return <span title='已认证'>已认证</span>
					} else {
						return null
					}
				}
			},
			{
				title: '提交日期',
				align: 'center',
				width: 90,
				dataIndex: 'submitDate',
			},
			{
				title: '认证月份',
				align: 'center',
				width: 72,
				dataIndex: 'authenticatedMonth',
			},
			{
				title: '认证建议',
				align: 'center',
				width: 66,
				dataIndex: 'suggest',
			}
		]
	}

	onResize = (e) => {
		let keyRandomTab = Math.floor(Math.random() * 10000)
		this.keyRandomTab = keyRandomTab
		setTimeout(() => {
			if (keyRandomTab == this.keyRandomTab) {
				this.getTableScroll()
			}
		}, 200)
	}

	getTableScroll = (e) => {
		try {
			let tableOption = this.metaAction.gf('data.tableOption').toJS()
			let appDom = document.getElementsByClassName('ttk-scm-app-authorized-invoice-list')[0];//以app为检索范围
			let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];//table wrapper包含整个table,table的高度基于这个dom

			if (!tableWrapperDom) {
				if (e) {
					return
				}
				setTimeout(() => {
					this.getTableScroll()
				}, 100)
				return
			}
			//ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
			let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
			let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

			if (tbodyDom && tableWrapperDom && theadDom) {
				let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
				const width = tableWrapperDom.offsetWidth;
				const height = tableWrapperDom.offsetHeight;
				if (num < 0) {
					this.injections.reduce('setTableOption', {
						...tableOption,
						y: height - theadDom.offsetHeight,
						x: width - 200
					})
				} else {
					delete tableOption.y
					this.injections.reduce('setTableOption', {
						...tableOption,
						x: width - 200
					})
				}
			}
		} catch (err) {
			// console.log(err)
		}
	}



	handleChangeRate = (value) => {
		if (typeof value === 'number' && value < -999999999.99) {
			let c = -999999999.99;
			this.metaAction.sf('data.cal.c', c);
			let { a, b, d } = this.metaAction.gf('data.cal').toJS();
			this.calculate({ a, b, c, d });
			return;
		}
		if (typeof value === 'number' && value > 999999999.99) {
			let c = 999999999.99;
			this.metaAction.sf('data.cal.c', c);
			let { a, b, d } = this.metaAction.gf('data.cal').toJS();
			this.calculate({ a, b, c, d });
			return;
		}
		this.metaAction.sf('data.cal.c', value);

		this.calculate();
	}

	handleChangeRest = (value) => {

		if (typeof value === 'number' && value < 0) {
			let d = 0.00;
			this.metaAction.sf('data.cal.d', d);
			let { a, b, c } = this.metaAction.gf('data.cal').toJS();
			this.calculate({ a, b, c, d });
			return;
		}
		if (typeof value === 'number' && value > 999999999.99) {
			let d = 999999999.99;
			this.metaAction.sf('data.cal.d', d);
			let { a, b, c } = this.metaAction.gf('data.cal').toJS();
			this.calculate({ a, b, c, d });
			return;
		}
		this.metaAction.sf('data.cal.d', value);
		this.calculate();
	}

	handleBlurRate = () => {
		let value = this.metaAction.gf('data.cal.c');
		if (value === undefined) {
			this.metaAction.sf('data.cal.c', 0);
			this.calculate();
		}
	}
	handleFocusRate = () => {
		let value = this.metaAction.gf('data.cal.c');
		if (value == 0) {
			this.metaAction.sf('data.cal.c', '');
		}
	}

	handleBlurRest = () => {
		let value = this.metaAction.gf('data.cal.d');
		if (value === undefined) {
			this.metaAction.sf('data.cal.d', 0);
			this.calculate();
		}
	}
	handleFocusRest = () => {
		let value = this.metaAction.gf('data.cal.d');
		if (value == 0) {
			this.metaAction.sf('data.cal.d', '');
		}
	}
	//计算
	calculate = (option, list) => {
		const { periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
		let { add, sub, mul, div } = utils.calculate;//加减乘除
		if (!option) {
			option = this.metaAction.gf('data.cal').toJS();
		}
		let { a, b, c, d, authenticatedTax } = option;
		//console.log(a, b, c, d);
		a = Number(`${a}`.replace(/,/g, '')) || 0;
		b = Number(`${b}`.replace(/,/g, '')) || 0;
		c = Number(`${c}`.replace(/,/g, '')) || 0;
		d = Number(`${d}`.replace(/,/g, '')) || 0;
		authenticatedTax = Number(`${authenticatedTax}`.replace(/,/g, '')) || 0;
		//计算公式：r=a-b*c/100-d
		var e = mul(b, c);
		var f = div(e, 100);
		var g = sub(a, f);
		var r = sub(g, d);
		var h = sub(r, authenticatedTax);//减去已认证

		if (!list) {
			list = this.metaAction.gf('data.list').toJS();
		}

		let value = Number(utils.number.format(h, 2).replace(/,/g, ''));
		list.forEach((o, index) => {
			if (value > 0) {
				if (!o.authenticated && o.invoiceDate && o.id && moment(o.invoiceDate).format('YYYY-MM') <= periodDate) {
					value = sub(value, o.totalTax);
					o.suggest = '建议认证'
				} else {
					o.suggest = null
				}
			} else {
				o.suggest = null
			}
		});
		this.metaAction.sf('data.list', fromJS(list));
		r = utils.number.format(r, 2);//格式化为两位

		//console.log(`${a} - ${b}*${c}/100-${d}=${r}`, '计算公式')
		this.metaAction.sfs({
			'data.cal.r': r,
			'data.list': fromJS(list),
			'data.listAll': fromJS(list),
		})
	}

	renderRowClassName = (record, index) => {
		if (!record.id) {
			return 'tr_heji'
		} else {
			return 'tr_normal'
		}
	}

	//弹出采集发票
	onCollectModal = async () => {

		const ret = await this.metaAction.modal('show', {
			title: '采集发票',
			width: 450,
			okText: '采集',
			//  footer: false,
			children: this.metaAction.loadApp('ttk-scm-app-collect', {
				store: this.component.props.store,
				collectOnOk: async (params) => {
					//打点统计
					if (typeof (gio) == "function") {
						gio('track', 'collectBills');
					}
					const domainName = location.host.split('.')
					// if (domainName[0].indexOf('localhost') >= 0 || domainName[0] == 'dev' || domainName[0] == 'test') {
					const seq = await this.webapi.collecteData1({ ...params, vatOrEntry: 1 });
					if (seq) {
						let asyncRequestResult
						return asyncRequestResult = await this.webapi.asyncRequestResult({ seq }, 2000);
					}
					// } else {
					//     return await this.webapi.collecteData({ ...params, vatOrEntry: 1 });
					// }
				},
				flag: 'authenticatedInvoice',
				authenticatedInvoice: true
			})
		})

		if (ret) {
			// ret.invoiceInventoryList=[
			//     {}
			// ]
			if (ret.cancel) {
				//点击取消
			} else if (ret.invoiceInventoryList && ret.invoiceInventoryList.length > 0) {
				//匹配存货
				const retss = await this.metaAction.modal('show', {
					title: '发票货物或劳务名称匹配档案存货名称',
					width: 600,
					okText: '确定',
					bodyStyle: { padding: '22px 24px 12px' },
					children: this.metaAction.loadApp('ttk-scm-matchInventory-card', {
						store: this.component.props.store,
						invoiceInventoryList: ret.invoiceInventoryList,
						invoice: ret.invoice,
						inventoryType: 'arrival',
					}),
				})
				if (retss) {
					this.metaAction.sfs({
						'data.searchValue.beginInvoiceDate': ret.collectDate[0],
						'data.searchValue.endInvoiceDate': ret.collectDate[1]
					})
					this.onCollectResultModal2(ret);
				}
			} else if (ret.list && ret.list.length > 0) {
				this.metaAction.toast('success', '发票采集成功')
				this.metaAction.sfs({
					'data.searchValue.beginInvoiceDate': ret.collectDate[0],
					'data.searchValue.endInvoiceDate': ret.collectDate[1]
				})
				this.onCollectResultModal2(ret);
			} else if (ret.message) {
				this.metaAction.toast('error', ret.message)
			}
		}
	}

	onCollectResultModal2 = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: '本次采集发票清单',
			width: 820,
			okText: '确认',
			footer: null,
			className: 'collect-result-modal',
			children: this.metaAction.loadApp('ttk-scm-app-collect-result', {
				store: this.component.props.store,
				dateVisible: false,
				resultData: option.list,
				crossCertificationNum: option.crossCertificationNum,
				vatOrEntry: 1,
				enableddate: this.metaAction.gf('data.other.enableddate')
			})
		})
		if (ret) {
			await this.request();
		}
	}

	//排序发生变化
	sortChange = (key, value) => {
		if (key === 'invoiceDate' && value === false) return;

		let sort = this.metaAction.gf('data.sort').toJS();
		sort[key].order = value == false ? null : value;
		const pages = this.metaAction.gf('data.pagination').toJS();
		this.metaAction.sf('data.sort', fromJS(sort))
		this.request({
			page: { ...pages, 'currentPage': 1 },
			sort
		});

	}

	//查询
	request = async (options = {}) => {
		let { page = null, sort = null, invoiceSum = null } = options && typeof options === 'object' ? options : {};
		let { beginInvoiceDate, endInvoiceDate, invoiceNumber = null, invoiceCode = null, supplierName = null, authenticated } = this.metaAction.gf('data.searchValue').toJS();
		let order;
		if (!page) {
			page = this.metaAction.gf('data.pagination').toJS();
		}
		if (!sort) {
			sort = this.metaAction.gf('data.sort').toJS();
		}
		if (authenticated === true) {
			//已认证
			order = [
				{
					name: "invoiceDate",
					asc: sort.invoiceDate.order == 'asc' ? true : false
				}
			]
		} else {
			//全部或未认证
			if (sort.authenticatedStatus.order) {
				order = [
					{
						name: "authenticatedStatus",
						asc: sort.authenticatedStatus.order == 'asc' ? true : false
					},
					{
						name: "invoiceDate",
						asc: sort.invoiceDate.order == 'asc' ? true : false
					}
				]
			} else {
				order = [
					{
						name: "invoiceDate",
						asc: sort.invoiceDate.order == 'asc' ? true : false
					}
				]
			}
		}
		let { currentPage = 1, pageSize = 20 } = page;
		let params = {
			isInit: true,
			beginInvoiceDate: `${beginInvoiceDate.format('YYYY-MM-DD')} 00:00:00`,
			endInvoiceDate: `${endInvoiceDate.format('YYYY-MM-DD')} 23:59:59`,
			entity: {
				invoiceNumber,
				invoiceCode,
				supplierName,
				authenticated,
			},
			orders: order,
			page: {
				currentPage,
				pageSize
			}
		}

		this.metaAction.sf('data.loading', true);

		const res = await this.webapi.init(params);
		this.metaAction.sf('data.loading', false);
		this.calculate(invoiceSum, res.list);

		//this.metaAction.sf('data.list', fromJS(res.list));
		//this.metaAction.sf('data.listAll', fromJS(res.list));
		this.metaAction.sfs({
			'data.pagination': fromJS(res.page),
			'data.tableCheckbox': fromJS({
				checkboxValue: [],
				selectedOption: []
			}),
			'data.statistics': fromJS({
				count: 0,
				totalAmount: 0,
				totalTax: 0,
			}),
			'data.other.onlyShowSelected': false
		});
		this.onResize();
	}

	getInvoiceSum = async () => {
		let sumres = await this.webapi.queryInvoiceSum();
		if (!sumres) {
			return null;
		}
		let { taxTotal: a, amountTotal: b, estimatedNegativeRateNoSign: c, authenticatedTax } = sumres;
		a = utils.number.format(a, 2);
		b = utils.number.format(b, 2);
		c = Number(c.replace(/,/g, '')) || 0;//接口返回的是带,的字符串
		authenticatedTax=utils.number.format(authenticatedTax, 2)
		let d = this.metaAction.gf('data.cal.d');
		this.metaAction.sfs({
			'data.cal.a': a,
			'data.cal.b': b,
			'data.cal.c': c,
			'data.cal.authenticatedTax': authenticatedTax
		})
		return {
			a,
			b,
			c,
			d,
			authenticatedTax
		};
	}

	antNubmerFromatter = (value) => {
		//格式化显示
		return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}

	antNubmerParser = (value) => {
		//反格式化
		return value.replace(/\$\s?|(,*)/g, '')
	}

	//分页发生变化
	pageChanged = (current, pageSize) => {
		let page = this.metaAction.gf('data.pagination').toJS();
		const len = this.metaAction.gf('data.listAll').toJS().length
		if (pageSize) {
			page = {
				...page,
				'currentPage': len == 0 ? 1 : current,
				'pageSize': pageSize
			}
		} else {
			page = {
				...page,
				'currentPage': len == 0 ? 1 : current
			}
		}
		this.request({ page })
	}

	handleOnlyShowSelected = (e) => {
		this.metaAction.sf('data.other.onlyShowSelected', e.target.checked);
		if (e.target.checked) {
			let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS();
			if (!selectedOption.length) {
				this.metaAction.sf('data.list', fromJS([]));
				this.onResize();
				return;
			}
			let listAll = this.metaAction.gf('data.listAll').toJS();
			if (selectedOption.length === listAll.length) return;
			//为了保证顺序
			let list = listAll.map(o => {
				return selectedOption.find(item => item.id === o.id);
			}).filter(a => a)

			this.metaAction.sf('data.list', fromJS(list));
			this.onResize()
		} else {
			let listAll = this.metaAction.gf('data.listAll').toJS();
			this.metaAction.sf('data.list', fromJS(listAll));
			this.onResize()
		}
	}

	handleSearchValueChange = async (v, name) => {
		v = v.target.value;
		if (typeof v === 'string') v = v.trim();
		if (name === 'authenticated') {
			let sort;
			if (v === true) {
				//已认证时间倒序
				sort = {
					authenticatedStatus: {
						order: null
					},
					invoiceDate: {
						order: 'desc'
					}
				}
			} else {
				sort = {
					authenticatedStatus: {
						order: null
					},
					invoiceDate: {
						order: 'asc'
					}
				}
			}
			this.metaAction.sfs({
				[`data.searchValue.${name}`]: v,
				'data.sort': fromJS(sort)
			})
			await this.request({ sort });
		} else {
			this.metaAction.sf(`data.searchValue.${name}`, v);
		}

	}

	oneKeyCollectClick = async () => {

		let hasReadSJInfo = await this.webapi.hasReadSJInfo({})
		if (!hasReadSJInfo) {
			// 打开企业信息中的纳税申报设置界面
			this.showPayTaxInfoSetPage()
		} else {
			const areaRule = this.metaAction.context.get('areaRule') //获取全局的启用日期
			if (areaRule && !areaRule.isGetInvoice) {
				this.metaAction.toast('error', '绑定的省市暂不支持采集发票')
			} else {
				//判断是否弹出温馨提示
				const tip = await this.webapi.getNoDisplay();
				if (tip.noDisplaySet === 1) {
					this.onCollectModal();
				} else {
					const tip = await this.webapi.getNoDisplay();
					const { id, ts } = tip;
					this.showTip(id, ts);
				}
			}
		}
	}

	showPayTaxInfoSetPage = async () => {
		const ret = await this.metaAction.modal('show', {
			height: 325,
			width: 440,
			//closable: false,
			okText: '设置',
			title: '纳税设置',
			wrapClassName: 'invoice-paytaxinfo-tip',
			children: this.getSetContent(),
		})
		if (ret == true) {
			this.component.props.setPortalContent &&
				this.component.props.setPortalContent('企业信息', 'edfx-app-org', { initData: { activeKey: '1' } })
		}
	}

	getSetContent = () => {
		return <div>
			<p className='jinggao'><Icon type="jinggao" fontFamily='edficon' /><span>请先设置网报帐号，并确认您的纳税人信息！</span></p >
		</div>
	}

	showTip = async (id, ts) => {
		const ret = await this.metaAction.modal('show', {
			title: '温馨提示',
			width: 500,
			footer: false,
			children: this.metaAction.loadApp('ttk-scm-app-collect-tip', {
				store: this.component.props.store,
				id,
				ts
			})
		})
		if (ret) {
			this.onCollectModal();
		}
	}

	//发送认证
	handleConfirmSend = async () => {
		let { beginInvoiceDate, endInvoiceDate } = this.metaAction.gf('data.searchValue').toJS();
		let { add, sub, mul, div } = utils.calculate;//加减乘除
		let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS();
		if (!selectedOption.length) {
			this.metaAction.toast('error', '请选择需要发送认证的数据');
			return
		}
		let totalAmount = 0;
		let totalTax = 0;
		let count = 0;
		let selectedArr = [];
		let arrivalList = [];
		let flag = true;
		selectedOption.forEach(item => {
			if (!item.authenticated) {
				totalAmount = add(totalAmount, item.totalAmount)
				totalTax = add(totalTax, item.totalTax)
				count++;
				let { id, invoiceCode, invoiceNumber, taxNumber, sellerNumber, creator, totalAmount: je, totalTax: se, fpmw, jqbh, supplierName, buyerName } = item;
				let arr = {
					id,
					dm: invoiceCode,
					hm: invoiceNumber,
					gf: taxNumber,
					xf: sellerNumber,
					kr: creator,
					je,
					se,
					mw: fpmw,
					jqbh: jqbh,
					xfmc: supplierName,
					gfmc: buyerName
				}
				Object.keys(arr).forEach(key => {
					if (!arr[key]) {
						this.metaAction.toast('error', '数据不完整');
						flag = false;
					}
				})
				selectedArr.push(arr);
				arrivalList.push({
					invoiceCode,
					invoiceNumber
				})
			}
		})
		let statistics = {
			count,
			totalAmount: utils.number.format(totalAmount, 2),
			totalTax: utils.number.format(totalTax, 2),
		}
		if (!count) {
			this.metaAction.toast('error', '请选择未认证的数据');
			return
		}
		if (!flag) {
			return;
		}
		const ret = await this.metaAction.modal('show', {
			title: '确认提交发送认证数据',
			width: 458,
			okText: '发送认证',
			wrapClassName: 'ttk-scm-app-authorized-invoice-list-confirm-send',
			children: <Confirmsend
				store={this.component.props.store}
				webapi={this.webapi}
				statistics={statistics}
				selectedArr={selectedArr}
				toast={this.metaAction.toast}
			/>
		})
		if (ret === 'true') {
			const ret1 = await this.metaAction.modal('success', {
				title: '数据提交发送认证成功！',
				okText: '关闭',
				width: 600,
				bodyStyle: { height: '300px', overflow: 'auto' },
				content: <div style={{ fontSize: 12, textIndent: '25px', lineHeight: 2 }}>温馨提示：发送认证成功后，系统会自动确认勾选，勾选认证成功后，认证状态会自动更新到发票上</div>
			})
			//更新
			let refres = await this.webapi.refreshResult({
				"beginInvoiceDate": beginInvoiceDate.format('YYYY-MM-DD'),
				"endInvoiceDate": endInvoiceDate.format('YYYY-MM-DD'),
				isSendSuccess: true,
				arrivalList
			})
			if (refres) {
				await this.request();//刷新列表
			}
		}
	}

	handleMoreOpeate = (e) => {
		this[e.key] && this[e.key]()
	}

	//上传密钥
	importKey = async () => {

		const { ret, file } = await this.metaAction.modal('show', {
			title: '设置密钥',
			width: 560,
			okText: '保存',
			children: this.metaAction.loadApp('ttk-scm-app-authorized-invoice-list-import-key', {
				store: this.component.props.store,
			}),
		})
		if (file) {
			this.metaAction.sf('data.file', fromJS(file));
		}

		if (ret) {

		}
	}

	//下载认证结果
	downloadPdf4Rz = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '选择认证月份',
			width: 350,
			wrapClassName: 'ttk-scm-app-authorized-invoice-list-download',
			children: <Download
				store={this.component.props.store}
				webapi={this.webapi}
			/>
		})
		if (typeof ret === 'object') {
			if (environment.isClientMode()) {
				window.open(res, "_self")
			} else {
				var iframeObject = document.getElementById('downloadPdf4Rz')
				if (iframeObject) {
					iframeObject.src = ret.url
				} else {
					var iframe = document.createElement('iframe')
					iframe.id = 'downloadPdf4Rz'
					iframe.frameborder = "0"
					iframe.style.width = "0px"
					iframe.style.height = "0px"
					iframe.src = ret.url
					document.body.appendChild(iframe)
				}
			}
		}


	}

	//刷新发票认证结果
	refreshResult = async () => {

		const beginInvoiceDate = this.metaAction.gf('data.searchValue.beginInvoiceDate');
		const endInvoiceDate = this.metaAction.gf('data.searchValue.endInvoiceDate');
		if (!beginInvoiceDate || !endInvoiceDate) {
			return;
		}
		this.metaAction.sf('data.iconLoading', true);
		let res = await this.webapi.refreshResult({
			"beginInvoiceDate": beginInvoiceDate.format('YYYY-MM-DD'),
			"endInvoiceDate": endInvoiceDate.format('YYYY-MM-DD'),
			isSendSuccess: false
		});
		this.metaAction.sf('data.iconLoading', false);
		if (res) {
			this.metaAction.toast('success', '更新成功')
			await this.request()
		}
	}

	beginInvoiceDateOnChange = (date, dateString) => {

		let endValue = this.metaAction.gf('data.searchValue.endInvoiceDate');
		if (date.valueOf() > endValue.valueOf()) {
			this.metaAction.sf('data.searchValue.endInvoiceDate', date);
		}
		this.metaAction.sf('data.searchValue.beginInvoiceDate', date);
	}

	//选择数据改变
	checkboxChange = (arr, itemArr) => {
		let { add, sub, mul, div } = utils.calculate;//加减乘除
		itemArr = itemArr.filter(o => o);
		let totalAmount = 0;
		let totalTax = 0;
		let newArr = itemArr.map(item => {
			totalAmount = add(totalAmount, item.totalAmount)
			totalTax = add(totalTax, item.totalTax)
			return item.id
		})
		let onlyShowSelected = this.metaAction.gf('data.other.onlyShowSelected');

		let obj = {
			'data.statistics': fromJS({
				count: itemArr.length,
				totalAmount: utils.number.format(totalAmount, 2),
				totalTax: utils.number.format(totalTax, 2),
			}),
			'data.tableCheckbox': fromJS({
				checkboxValue: newArr,
				selectedOption: itemArr
			})
		}
		if (onlyShowSelected) {
			let listAll = this.metaAction.gf('data.list').toJS();
			if (itemArr.length === listAll.length) return;
			//为了保证顺序
			let list = listAll.map(o => {
				return itemArr.find(item => item.id === o.id);
			}).filter(a => a)
			obj['data.list'] = fromJS(list);
		}
		// if (!itemArr.length) {
		// 	obj['data.other.onlyShowSelected'] = false
		// }
		this.metaAction.sfs(obj)
		if (onlyShowSelected) {
			this.onResize()
		}
	}

	endInvoiceDateOnChange = (date, dateString) => {
		this.metaAction.sfs({
			'data.searchValue.endInvoiceDate': date,
			'data.cal.d': 0
		});
	}

	handleStartOpenChange = (open) => {
		if (!open) {
			this.metaAction.sf('data.other.endOpen', true)
		}
	}

	handleEndOpenChange = async (open) => {
		this.metaAction.sf('data.other.endOpen', open)
		if (!open) {
			let invoiceSum = await this.getInvoiceSum();
			await this.request({ invoiceSum })
		}
	}

	disabledStartDate = (startValue) => {
		const enableddate = this.metaAction.gf('data.other.enableddate');
		const endValue = this.metaAction.gf('data.searchValue.endInvoiceDate');
		if (!startValue || !endValue || !enableddate) {
			return false;
		}
		return startValue.valueOf() < enableddate.valueOf();
	}

	disabledendInvoiceDate = (endValue) => {
		const startValue = this.metaAction.gf('data.searchValue.beginInvoiceDate');
		if (!endValue || !startValue) {
			return false;
		}
		return endValue.valueOf() < startValue.valueOf();
	}

}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		o = new action({ ...option, metaAction }),
		ret = { ...metaAction, ...o }
	metaAction.config({ metaHandlers: ret })
	return ret
}
