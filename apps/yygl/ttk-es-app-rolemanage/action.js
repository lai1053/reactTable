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
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
		}
		const params = this.metaAction.gf('data.entity.fuzzyCondition')
		this.injections.reduce('updateLoading', true)
		this.getData(page,params)
			.then((res) => {
				this.injections.reduce('load', res);
				this.injections.reduce('updateLoading', false)
			});
	};

	search = () => this.load()

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'app-list-role-contentHeight';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};

	//删除岗位
	delClick = (obj) => (e) => {
		this.del(obj.id);//传入需要删除的岗位ID
	};


	del = async (list) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除岗位',
			content: '岗位删除后将不能恢复，确定要删除该岗位吗?'
		});
		if (ret) {

			let response = await this.webapi.role.delete(list);

			if(response.errorCode=="0"){
			   // debugger
				this.metaAction.toast('warn', response.message);
			}else {
				this.metaAction.toast('success', '删除成功');
			}
			this.load();
		}
	};

	//修改岗位
	modifyDetail = (id) => (e) => {
		let personId = id ? id : null;
		this.add(personId);
	};

	//新增岗位
	addClick = () => {
		this.add();
	};

	add = (id) => {
		let option = { title: '', appName: '', id: id};
		option.title = '岗位';
		option.appName = 'ttk-es-app-card-role';
		this.addModel(option);
	};

	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: 'ttk-es-app-card-role-modal',
			wrapClassName: 'card-archive',
			width: 400,
			height: 330,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id
			})
		});
		//console.table(ret,"新增岗位");
		if (ret.success) {
			this.load();//新增成功
		}
		else{
			return false;
		}
	};

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked);
	};

	//分页修改
	pageChanged = (currentPage, pageSize) => {
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination')
				.toJS().pageSize;
		}
		let page = { currentPage, pageSize };
		this.load(page);
	};

	//获取列表内容
	getData = async (pageInfo,params) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize
			},
			entity = {
				fuzzyCondition:''
			};
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}
		if(params) entity.fuzzyCondition = params;
		response = await this.webapi.role.query({ page, entity });
		return response;
	};

	//岗位的停用状态
	personStatusClick = (name, index) => (e) => {
		//let status = this.metaAction.gf('data.status');
        this.setStatus(name, index);
	};

    //设置岗位状态
	setStatus = async (option, index) => {
		let roleTitle;
		console.log("更新状态：：："+option.postState);
        if(option.postState==="1"){
            roleTitle="停用";
        }
        else{
            roleTitle="启用";
        }
        const ret = await  this.metaAction.modal('confirm', {
			title: roleTitle+'岗位',
			content: '确定要'+roleTitle+'该岗位吗?'
        });
        if(ret){
            if (option.postState=="1") {
				option.postState = "0";

				console.table(option);
				console.log("岗位停用状态："+option.postState);
                let response = await this.webapi.role.update(option);
                if (response) {
                    this.metaAction.toast('success', '停用岗位成功');
                    this.injections.reduce('enable', response, index);
                }
            } else {
				option.postState = "1";
				console.log("岗位启用状态："+option.postState);

                let response = await this.webapi.role.update(option);
                if (response) {
                    this.metaAction.toast('success', '启用岗位成功');
                    this.injections.reduce('enable', response, index);
                }
			}
			this.load();//修改状态后刷新列表页面
        }
	};

	//停用行置灰
	roleStateStop = (postState) =>{
		if(postState!="1" ){
			return 'no-enable'
		}
	}

	//岗位名称
	roleTypeInfo = (postType) =>{
		if(postType=="001"){
			return '管理岗位'
		}else if(postType=="002"){
			return '业务岗位'
		}else if(postType=="003"){
			return '系统管理员'
		}
	}

	//按钮显示状态
	btnShowInfo = (postName) =>{

		const arr = ["系统管理岗","系统管理员",'中介老板',"业务主管岗",'发票岗',"报税岗",'记账岗','查询岗','记账审核岗','财务总监','出纳','销售经理','外勤']

		const flag = arr.includes(postName);
		return !flag
		// if(postName=="系统管理岗"||postName=="系统管理员"||postName=='中介老板'
		// 	|| postName=="主管岗"|| postName=='发票岗'||postName=="报税岗"||postName=='记账岗'
		// 	||postName=='查询岗'||postName=='记账审核岗'){
		// 	return false
		// }
		// else{
		// 	return true
		// }
	}

	//启用状态按钮控制
	btnEnable = (postName) =>{
		if(postName=="系统管理岗"||postName=="系统管理员"||postName=='中介老板'){
			return false
		}
		else{
			return true
		}
	}


	//点击名称打开效果,暂时屏蔽
	//clickCompent = (obj) => !!obj.postState ?  <a title={obj.postName} onClick={this.modifyDetail(obj.id)}>{obj.postName}</a> : <label className={'no-enable'}>{obj.postName}</label>
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
