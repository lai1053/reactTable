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
		let data,category,option={};
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
            let request = {
                moduleKey: 'app-list-supplier',
                resourceKey: 'app-list-supplier-grid',
            }
            let response = await this.webapi.getSetting(request)
			//获取客户分类
			let requestCats = {
				"baseArchiveType": 3000160002
			}
			category =  await this.webapi.supplier.cats(requestCats)
			if(category) option.category = category;
			if(response.pageSize){
                page.pageSize = response.pageSize
            }
		}
		const params = this.metaAction.gf('data.entity')
		this.metaAction.sf('data.other.loading', true);
		data = await this.getData(page,params);
		if(data) option.data = data;
		this.injections.reduce('load', option);
		this.metaAction.sf('data.other.loading', false);
	};

	search = () => this.load()

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && this.component.props.modelStatus == 1) {
			name = 'app-list-supplier-contentHeight1';
		} else if (this.component.props.modelStatus && this.component.props.modelStatus == 2) {
			name = 'app-list-supplier-contentHeight2';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};


	//删除档案
	delClick = (obj) => (e) => {
		this.del([obj]);
	};

	//批量删除
	delClickBatch = () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
		if (!selectedArrInfo.length) {
			this.metaAction.toast('warning', '请选择供应商');
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
			let response = await this.webapi.supplier.delete(list);
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
		option.title = '供应商';
		option.appName = 'app-card-vendor';
		this.addModel(option);
	};

	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: 'app-list-supplier-modal',
			wrapClassName: 'card-archive',
			width: 690,
			height: 600,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id
			})
		});
		if (ret) {
			this.load();
		}
		//更新分类
		let requestCats = {
			baseArchiveType: 3000160002
		},cats;
		cats =  await this.webapi.supplier.cats(requestCats)
		this.injections.reduce('glCats', cats)
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
            moduleKey: 'app-list-supplier',
            resourceKey: 'app-list-supplier-grid',
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
				fuzzyCondition:null,
				categoryHierarchyCode:null,
			};
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}
		if (params) entity = params;
		response = await this.webapi.supplier.query({ page, entity });
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
			let response = await this.webapi.supplier.update(option);
			if (response) {
				this.metaAction.toast('success', '停用供应商成功');
				this.injections.reduce('enable', response, index);
			}
		} else {
			option.isEnable = true;
			let response = await this.webapi.supplier.update(option);
			if (response) {
				this.metaAction.toast('success', '启用供应商成功');
				this.injections.reduce('enable', response, index);
			}
		}
	};

	importPerson = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '导入',
			width: 560,
			height: 330,
			cancelText: '取消',
			okText: '导入',
			children: this.metaAction.loadApp('app-card-import', {
				store: this.component.props.store,
				path: 'supplier'
			})
		});
		if (ret) {
			this.load();
		}
	};

	//停用行置灰
	isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'

	clickCompent = (obj) => !!obj.isEnable ?  <a title={obj.code} onClick={this.modifyDetail(obj.id)}>{obj.code}</a> : <label className={'no-enable'}>{obj.code}</label>

    //科目创建档案
    subjectsCreateCustomer = async (option) => {
        const ret = await this.metaAction.modal('show', {
            title: '科目创建档案',
            className: 'app-list-inventory-modal-create',
            wrapClassName: 'card-archive',
            width: 800,
            height: 575,
            children: this.metaAction.loadApp('ttk-ba-app-subjects-create-supplier', {
                store: this.component.props.store,
                personId: option.id
            })
        });
        this.load();
	};

	hasLinkConfig = () => {
		return this.metaAction.context.get('linkConfig') ? false : true
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
