import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import extend from './extend';
import config from './config';
import RenderTree from './component/RenderTree'
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

		this.getpermission();
	};

	componentDidMount = () => {
        let domain = document.domain;
		if (domain == "localhost" || 
			domain == "dev-xdz.bj.jchl.com" || 
			domain == "xdz.bj.jchl.com" || 
			domain == "xdzdemo.jchl.com") {
			this.injections.reduce('update',{path:'data.isShow',value:true});
        }else{
			this.injections.reduce('update',{path:'data.isShow',value:false});
		}
    }

	load = async (page) => {
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
		}
		//const params = this.metaAction.gf('data.entity.fuzzyCondition')

		///////2019-07-23  begin///////
		const customerName = this.metaAction.gf('data.entity.seachtext')//输入的客户名称或是助记码

		let type = this.metaAction.gf('data.checkedKeys.checked'),
		    maxde = this.metaAction.gf('data.maxde'),
			types = 'self',
			all = this.metaAction.gf('data.other.permission.all')

		if(type.length != 0 && type.length){
				types = 'dept'
		}
		for (let i = 0;i<type.length;i++){
			if(type[i] == maxde  && all=="all"){
				types = 'all'
			}
		}

		const params = {
				"departments":type,
				 bs: types,
				 seachtext:customerName,
		}


		///////2019-07-23  end///////

		this.metaAction.sf('data.other.loading', true);
		let orgIdList = [];
		this.getData(page,params)
			.then(async (res) => {
				if(res.list.length){
					res.list.map(item=>{
						item.reportFlag = false;
						orgIdList.push(item.orgId);
					})
				}
				this.injections.reduce('load', res);
				this.metaAction.sf('data.other.loading', false);
				const ret = await this.webapi.ztlj.reportSetFlagAsync(orgIdList);
				if(ret){
					const retp = await this.webapi.ztlj.reportSetFlagResp(ret,2000);
					if(retp && retp.length>0){
						retp.map(key=>{
							res.list.map(item=>{
								if(key == item.orgId) item.reportFlag = true;
							})
						})
					}
					this.injections.reduce('load', res);
				}
			});
	};

	search = () => this.load()


	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
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
			entity = this.metaAction.gf('data.entity').toJS()//获取
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage;
			page.pageSize = pageInfo.pageSize;
		}

		if(params) {
			//entity.fuzzyCondition = params;
			entity = params;
		}

		response = await this.webapi.ztlj.queryList({ page, entity });
		return response;
	};

    //操作按钮状态，如果财务软件显示为空则表示未连接，默认只显示连接按钮
	opreationState = (btnState) =>{
		if(btnState==""){
			return false;//财务软件为空则不显示报表设置、断开连接
		}
		else{
			return true;
		}
	}

	 //账套连接点击事件
     ztljStatusClick = (name, index) => (e) => {
		 if(name.accountState=="001"){//如果已经创建账套，则不允许点击连接
             return false;
		 }
         else{
			if (name.cwrj == '' && (name.bszlxl == '' || name.bsqj=='')) {
				this.metaAction.toast('warning', '“资料报送小类”和“报送期间”不能为空，暂无法连接。')
				return
			}
			this.setZtStatus(name, index);
		 }
	};

	//是否创建账套
	isZtSate=(state)=>{
		if(state.accountState=='001'){
			return "btnztlj1";//账套已经连接则不需要显示创建账套按钮(按钮置灰)
		}
		else{
			return  "btnztlj2";
		}
	}


     //账套连接状态
	setZtStatus = async (option, index) => {
		// debugger
	        // console.table(option);
            if (option.cwrj!="") {
                let response = await this.webapi.ztlj.delete(option);
                if (response === null) {
					this.metaAction.toast('success', '断开连接成功');
					// response.isLj = false
					this.injections.reduce('enable', {isLj: false}, index);
					this.load();//修改状态后刷新列表页面
                }
            } else {
				let orgId=option.orgId;//客户ID
				let SID =  this.metaAction.context.get('currentUser')
				console.log(SID.id,9999)
				console.log("客户ID:::"+orgId);
				let a = document.querySelector('#exeType');
				a.setAttribute('href', `Foresees://EtlParams:{'AppID':'BB','FuncID':'GetAcctList','ConID':'CSY','orgID':${orgId},'Data':'','SID':${SID.id}}`)
				a.click()
				console.log(a,'haha')
			}
			// this.load();//修改状态后刷新列表页面
	};

    //报表设置
    reportSet = (rowData) => async (e) => {
		if (!rowData.bszlxl) {
			this.metaAction.toast('warning', '未设置会计制度，请前往【客户资料-纳税人信息】中设置')
			return
		}

		if (!rowData.kjzz || (rowData.bszlxl != 'ZL1001001' && rowData.bszlxl != 'ZL1001002' && rowData.bszlxl != 'ZL1001003')) {
			this.metaAction.toast('warning', '不支持此会计制度的报表设置')
			return
		}
		// if(isShow){
			const ret = await this.metaAction.modal('show', {
				title: '报表设置',
				width: 720,
				className: 'ttk-es-app-ztconnetlist-personModal',
				style: { top: 5 },
				height: 550,
				footer: null,
				children: this.metaAction.loadApp('ttk-gl-app-report-batchSetting', {
					store: this.component.props.store,
					params:{
						source:'2', //1账套管理 2，账套链接
						type: '1', //类型 1.单户  2批量
						orgIds: rowData.orgId, //选中用户的组织id
					}
				})
			});
		// }else{
		// 	let areaFlag = 1;
		// 	if(rowData.areaCode){
		// 		const areaCode = rowData.areaCode.substring(0,2);
		// 		areaFlag = areaCode == '44' ? 1 : 0;
		// 	}else{
		// 		areaFlag = 1;
		// 	}
		// 	const ret = await this.metaAction.modal('show', {
		// 	    title: '报表设置',
		// 	    width: 720,
		// 	    className: 'ttk-es-app-ztconnetlist-personModal',
		// 		height: 550,
		// 		footer: null,
		// 	    children: this.metaAction.loadApp('ttk-gl-app-report-setting', {
		// 	        store: this.component.props.store,
		// 			params:{
		// 				reportSetType:1, //单户-1，批量设置-2
		// 				orgDtosList:[
		// 					{
		// 						orgId:rowData.orgId, //组织id
		// 						software:"QT", //财务软件，金财管家-TTK，其它-QT
		// 						areaFlag:areaFlag //是否属于广东地区客户，1-是，0-否
		// 					}
		// 				]
		// 			}
		// 	    })
		// 	});
		// }
    };

    handleConfirm = (data) => {
        //权限管理点击确认
		this.metaAction.sf('data.checkedKeys.checked',data)
        let checked=this.metaAction.gf('data.checkedKeys.checked');
        let ifgs = this.metaAction.gf('data.ifgs')
        this.load();
	}

    handleReset = (data) => {
		//权限管理点击重置
        console.log("重置:::"+data)
		this.metaAction.sf('data.checkedKeys.checked',data)
		let checked=this.metaAction.gf('data.checkedKeys.checked');
		this.load();
    }

	pageTotal = () => {
		return `共 ` + this.metaAction.gf('data.pagination.total') + ` 条 `
	}

    //分配给我的、公司的客户、部门的客户
    renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.metaAction.sf('data.ifgs',permission.all ? '公司的客户' : '部门的客户')

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }


    //转换工具下载
    downZhgj = () => {
        var iframe = document.createElement('iframe')
        iframe.id = 'downloadForeseeClient'
        iframe.frameborder = "0"
        iframe.style.width = "0px"
        iframe.style.height = "0px"
        iframe.src = "https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/财务账套链接工具.exe"
        document.body.appendChild(iframe)
	}

	 //批量报表设置
	 reportPlSet = async () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),
			connetInfo = [] 
		selectedArrInfo.map(item=>{
			if(item.cwrj != ""){
				connetInfo.push(item.orgId)
			}
		})
		// console.log(connetInfo)
		if ((selectedArrInfo && !selectedArrInfo.length) || !selectedArrInfo || connetInfo.length==0) {
			this.metaAction.toast('warn', '请选择已连接了账套的企业')
			return false
		}
		const ret = await this.metaAction.modal('show', {
			title: '批量报表设置',
			width: 720,
			className: 'ttk-es-app-ztconnetlist-personModal',
			style: { top: 5 },
			height: 550,
			footer: null,
			children: this.metaAction.loadApp('ttk-gl-app-report-batchSetting', {
				store: this.component.props.store,
				params:{
					source:'2', //1账套管理 2，账套链接
					type: '2', //类型 1.单户  2批量
					orgIds: connetInfo, //选中用户的组织id
				}
			})
		});
		// console.log(ret);
		if(ret){
			this.load();
		}
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}

	getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        //debugger
		const res = await this.webapi.ztlj.getfpkh(params)
		if(res && res.body){
			this.metaAction.sfs({
				'data.other.permission.treeData':res.body.bmxx,
				'data.other.permission.all':res.body.all,
				// 'data.other.permission.self':res.body.self
			})
			if(res.body.bmxx && Array.isArray(res.body.bmxx) && res.body.bmxx.length > 0){
				let maxdeValue = res.body.bmxx[0].bmdm || '';
				this.injections.reduce('update',{path:'data.maxde',value:maxdeValue});
			}
		}
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
