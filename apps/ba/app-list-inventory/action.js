import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import extend from './extend';
import config from './config';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
		this.search = debounce(this.search, 800);
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		this.load();
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load);
		}
	};

	load = async (page) => {
		let queryByparamKeys, paramKey = {}
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
            let request = {
                moduleKey: 'app-list-inventory',
                resourceKey: 'app-list-inventory-grid',
            }
            let response = await this.webapi.getSetting(request)
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
		}
		//获取生成凭证设置
		await this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
			.then((res) => queryByparamKeys = res)
		queryByparamKeys.forEach(function (data) {
			paramKey[data.paramKey] = data.paramValue
		})
		if(paramKey) this.metaAction.sf('data.queryByparamKeys', paramKey);
		const params = this.metaAction.gf('data.entity').toJS()
		this.metaAction.sf('data.other.loading', true);
		this.getData(page,params)
			.then((res) => {
				this.injections.reduce('load', res);
				this.metaAction.sf('data.other.loading', false);
			});
		//获取生成凭证设置
		this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
			.then((res) => this.queryByparamKeys = res)
        //获取存货及服务分类
        this.webapi.inventory.findEnumList()
            .then((res) => this.injections.reduce('findEnumListChange', res))
	};

	search = () => this.load()

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'app-list-inventory-contentHeight';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};

	//删除档案
	delClick = (inventory) => (e) => {
		this.del([inventory]);
	};

	//批量删除
	delClickBatch = () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
		if (!selectedArrInfo.length) {
			this.metaAction.toast('warning', '请选择存货');
			return;
		}
		this.del(selectedArrInfo);
	};

	del = async (list) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		});

		if (ret) {
			let listData = [],
				inventoryData = this.metaAction.gf('data.list')
					.toJS();
			list.forEach((data) => {
				inventoryData.forEach((obj) => {
					if (data.id == obj.id) {
						listData.push(obj);
					}
				});
			});
			let response = await this.webapi.inventory.delete(listData);
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message);
				});
			} else {
				this.metaAction.toast('success', '删除成功');
			}
			this.load();
		}
	};

	//修改档案
	modifyDetail = (id) => (e) => {
		let personId = id ? id : null;
		this.add(personId);
	};

	//新增档案
	addClick = () => {
		this.add();
	};

	add = (id) => {
		let option = { title: '', appName: '', id: id };
		option.title = '存货';
		option.appName = 'app-card-inventory';
		this.addModel(option);
	};

	addModel = async (option) => {
		let className = 'app-list-inventory-modal'
		//把生成凭证设置传入 card
		let queryByparamKeyNum = 0
		// let queryByparamKey = {}
		this.queryByparamKeys.forEach(function (data) {
			// queryByparamKey[data.paramKey] = data.paramValue
			if(data.paramValue != 'default') queryByparamKeyNum = queryByparamKeyNum + 1
		})
		if(queryByparamKeyNum > 0){
			className = 'app-list-inventory-modalLong'
		}
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: className,
			wrapClassName: 'card-archive',
			width: 790,
			height: 530,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id,
				// queryByparamKeys: queryByparamKey
			})
		});
		if (ret) {
			this.load();
		}
	};

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked);
	};

	//分页修改
	pageChanged = async (currentPage, pageSize) => {
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination')
				.toJS().pageSize;
		}
		let page = { currentPage, pageSize };
		this.load(page);
        let request = {
            moduleKey: 'app-list-inventory',
            resourceKey: 'app-list-inventory-grid',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        this.webapi.setSetting([request])
	};

	//获取列表内容
	getData = async (pageInfo,params) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize
			},
			entity = {
				fuzzyCondition:'',
                propertyId: ""
			};
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}
		if(params){
            entity.fuzzyCondition = params.fuzzyCondition;
            entity.propertyId = params.propertyId == undefined ? "" : params.propertyId;
        }
		response = await this.webapi.inventory.query({ page, entity });
		return response;
	};

	//人员的停用状态
	personStatusClick = (name, index) => (e) => {
		let status = this.metaAction.gf('data.status');
		this.setStatus(name, index);
	};

	setStatus = async (option, index) => {
		if (option.isEnable) {
			option.isEnable = false;
			let response = await this.webapi.inventory.update(option);
			if (response) {
				this.metaAction.toast('success', '停用存货成功');
				this.injections.reduce('enable', response, index);
			}
		} else {
			option.isEnable = true;
			let response = await this.webapi.inventory.update(option);
			if (response) {
				this.metaAction.toast('success', '启用存货成功');
				this.injections.reduce('enable', response, index);
			}
		}
	};

	//科目创建档案
    subjectsCreateInventory = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: '科目创建档案',
			className: 'app-list-inventory-modal-create',
			wrapClassName: 'card-archive',
			width: 800,
			height: 575,
			children: this.metaAction.loadApp('ttk-ba-app-subjects-create-inventory', {
				store: this.component.props.store,
				personId: option.id
			})
		});
		this.load();
	};
	//批量修改收入类型
	revenueTypeChange = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: '批量维护收入类型',
			className: 'app-list-inventory-modal-revenue',
			wrapClassName: 'card-archive',
			// okText: '修改新增存货收入类型',
			// cancelText: '修改已有存货收入类型',
			footer: null,
			width: 800,
			height: 700,
			okType: null,
			children: this.metaAction.loadApp('app-card-revenueType', {
				store: this.component.props.store,
				personId: option.id
			})
		});
		this.load();
	};

	//更多点击
	moreClick = async(key) => {
		switch (key.key){
			case 'batchChange':
				let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
				if (!selectedArrInfo.length) {
					this.metaAction.toast('warning', '请选择存货');
					return;
				}
				const ret = await this.metaAction.modal('show', {
					title: '批量修改存货',
					width: 450,
					height: 550,
					children: this.metaAction.loadApp('app-card-inventory-batch-change', {
						store: this.component.props.store,
						inventorySelect: selectedArrInfo
					})
				});
				if (ret) {
					this.load();
				}
				break;
		}
	}

	adddz1 = () => {
		this.component.props.setPortalContent &&
        this.component.props.setPortalContent('存货dz', 'ttk-app-inventory-list')
	}
	adddz2 = () => {
		this.component.props.setPortalContent &&
        this.component.props.setPortalContent('计量单位dz', 'ttk-app-unit-list')
	}

	//停用行置灰
	isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'

	clickCompent = (obj) => !!obj.isEnable ?  <a title={obj.code} onClick={this.modifyDetail(obj.id)}>{obj.code}</a> : <label className={'no-enable'}>{obj.code}</label>
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
