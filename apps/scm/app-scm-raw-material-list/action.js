import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import utils from 'edf-utils';
import { Map, fromJS, toJS } from 'immutable'
import extend from './extend'
import config from './config'
import moment from 'moment'
class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
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
		this.metaAction.sf('data.loading', true);
		const search = this.metaAction.gf('data.search');
		const list = await this.webapi.queryBOM({ search });
		this.metaAction.sf('data.loading', false);
		const colmns = [
			{
				title: '产成品',
				children: [
					{
						title: '存货编码',
						dataIndex: 'code',
						key: 'code',
						width: 90
					},
					{
						title: '存货名称',
						dataIndex: 'name',
						key: 'name',
						className: 'table_td_align_left',
						//align: 'left',
					},
					{
						title: '计量单位',
						dataIndex: 'unitName',
						key: 'unitName',
						width: 90
					},
					{
						title: '规格型号',
						dataIndex: 'specification',
						key: 'specification',
						//align: 'left',
						className: 'table_td_align_left',
					},
					{
						title: '配置原料（BOM）编码',
						dataIndex: 'BOMCode',
						key: 'BOMCode',
						width: 160,
						render: (text, record) => {
							const { id, BOMCode = null, code: inventoryCode, name: inventoryName } = record;
							return <a onClick={() => this.handleClick(id, BOMCode, inventoryCode, inventoryName)}>{text}</a>
						}
					},
				]
			},
			{
				title: '操作',
				dataIndex: 'id',
				key: 'id',
				render: (text, record) => {
					const { id, BOMCode = null, code: inventoryCode, name: inventoryName } = record;
					return <div>
						<a style={{ marginRight: 10 }} onClick={() => this.handleClick(id, BOMCode, inventoryCode, inventoryName)}>配置原料</a>
						{BOMCode ? <a onClick={() => this.handleClear(id, BOMCode)}>清空</a> : <span className='clear-not-allowed'>清空</span>}
					</div>
				}
			}
		];
		this.injections.reduce('load', { list, colmns });

		setTimeout(() => {
			this.onResize()
		}, 20)
	}
	handleClear = async (id, BOMCode) => {
		const res = await this.webapi.updateIngredient({
			id,
			BOMCode,
			price: null,
			number: null,
			ingredientList: []
		});
		if (res) {
			this.metaAction.toast('success', '清空成功');
		}
		this.refresh();
	}

	onTabFocus = async () => {
		//切换页面

		this.metaAction.sf('data.loading', true);
		const search = this.metaAction.gf('data.search');
		const list = await this.webapi.queryBOM({ search });
		this.metaAction.sf('data.loading', false);
		this.injections.reduce('request', list);
		setTimeout(() => {
			this.onResize()
		}, 20)
	}
	refresh = async () => {

		//切换页面
		this.metaAction.sf('data.loading', true);
		const search = this.metaAction.gf('data.search');
		const list = await this.webapi.queryBOM({ search });
		this.metaAction.sf('data.loading', false);
		this.injections.reduce('request', list);
		setTimeout(() => {
			this.onResize()
		}, 20)
	}
	handleClick = async (id, BOMCode, inventoryCode, inventoryName) => {
		const list = this.metaAction.gf('data.list').toJS();
		let codeList = [];
		list.forEach(o => {
			if (o.BOMCode && o.BOMCode !== BOMCode) {
				codeList.push(o.BOMCode)
			}
		});
		const res = await this.metaAction.modal('show', {
			title: '配置原料',
			width: 900,
			okText: '保存',
			cancleText: '取消',
			//	bodyStyle: { padding: '10px 12px' },
			children: this.metaAction.loadApp('app-scm-raw-material-card', {
				store: this.component.props.store,
				id,
				BOMCode,
				inventoryCode,
				inventoryName,
				codeList
			})
		})
		this.refresh()

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
			let appDom=document.getElementsByClassName('app-scm-raw-material-list')[0];//以app为检索范围
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
						x: width - 20
					})
				} else {
					delete tableOption.y
					this.injections.reduce('setTableOption', {
						...tableOption,
						x: width-20
					})
				}
			}
		} catch (err) {
			// console.log(err)
		}
	}

	addInventory = async () => {
		// const ret = await this.metaAction.modal('show', {
		// 	title: '新增存货',
		// 	width: 750,
		// 	//height: 530,
		// 	children: this.metaAction.loadApp('app-card-inventory', {
		// 		store: this.component.props.store,
		// 	})
		// })
		// if (ret) {
		// 	this.refresh()
		// }

		this.component.props.setPortalContent &&
			this.component.props.setPortalContent(
				'存货及服务',
				'app-list-inventory',
				{ accessType: 1 }
			)

	}

	handleChangeSearch = (e) => {
		let value = e.target.value || null;
		if (value) value = value.trim();
		this.metaAction.sf('data.search', value);
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o }
	metaAction.config({ metaHandlers: ret })
	return ret
}
