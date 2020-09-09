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
		let data;
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
            let request = {
                moduleKey: 'app-list-currency',
                resourceKey: 'app-list-currency-grid',
            }
            let response = await this.webapi.getSetting(request)
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
		}
		const params = this.metaAction.gf('data.entity.fuzzyCondition')
		this.metaAction.sf('data.other.loading', true);
		data = await this.getData(page,params);
		this.injections.reduce('load', data);
		this.metaAction.sf('data.other.loading', false);
	};

	search = () => this.load()

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'app-list-currency-contentHeight';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};


	//删除档案
	delClick = (obj) => (e) => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '币种', '删除']);
		if (obj.isBaseCurrency && obj.isBaseCurrency == true) {
			this.metaAction.toast('warning', '本位币不允许删除');
		} else {
			this.del([obj]);
		}
	};

	//批量删除
	delClickBatch = () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '币种', '批量删除']);
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
		if (!selectedArrInfo.length) {
			this.metaAction.toast('warning', '请选择币种');
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
			let response = await this.webapi.currency.delete(list);
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
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '币种', '新增']);
		this.add();
	};

	add = (id) => {
		let option = { title: '', appName: '', id: id };
		option.title = '币种';
		option.appName = 'app-card-currency';
		this.addModel(option);
	};

	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: 'app-list-currency-modal',
			wrapClassName: 'card-archive',
			width: 315,
			height: 350,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id
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
            moduleKey: 'app-list-currency',
            resourceKey: 'app-list-currency-grid',
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
				pageSize: pagination.toJS().pageSize},
			entity = {
				fuzzyCondition:''
			};
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}
		if(params) entity.fuzzyCondition = params;
		response = await this.webapi.currency.query({ page,entity });
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
			let response = await this.webapi.currency.update(option);
			if (response) {
				this.metaAction.toast('success', '停用币种成功');
				this.injections.reduce('enable', response, index);
			}
		} else {
			option.isEnable = true;
			let response = await this.webapi.currency.update(option);
			if (response) {
				this.metaAction.toast('success', '启用币种成功');
				this.injections.reduce('enable', response, index);
			}
		}
	};

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
