import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import extend from './extend';
import config from './config';
import { Map, fromJS, toJS, is } from 'immutable';
import RenderTree from './component/RenderTree';
import BackupZtInfo from './component/BackupZtInfo';
import {Icon, Tooltip, Dropdown, Select, Input, DatePicker, Popover, LoadingMask, Upload} from 'edf-component'
import { fetch, moment as momentUtil, environment } from 'edf-utils';
import { message} from "antd";
class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
		this.search = debounce(this.search, 800);
	}
	timer1 = null;

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;

		injections.reduce('init');
		this.load();
        this.getIsNeedTip()
		let that = this;
		let batchFinished = this.metaAction.gf('data.pl.batchFinished')
		if(!batchFinished){
			this.timer1 = setInterval(function () {
				that.plDetail1()
			},10000)
		}
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load);
			// addEventListener('onTabFocus', :: this.getIsNeedTip);
		}

		this.getpermission();
	};

	load = async (page) => {
		if (!page) {
			const form = this.metaAction.gf('data.pagination')
				.toJS();
			page = { currentPage: form.current, pageSize: form.pageSize };
		}
		//*************搜索  begin*********** */
		//const params = this.metaAction.gf('data.entity.fuzzyCondition')
		const customerName = this.metaAction.gf('data.entity.seachtext')//输入的客户名称或是助记码
		const filterForm = this.metaAction.gf('data.filterForm').toJS()//隐藏筛选条件
		//const params = this.metaAction.gf('data.entity')
		let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
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
                debitState:filterForm.debitState === '' ? "" : filterForm.debitState,
                debiter: filterForm.debiter === '' ? "" : filterForm.debiter,
                debitStartDate:filterForm.debitStartDate === '' ? "" : filterForm.debitStartDate,
                debitEndDate:filterForm.debitEndDate === '' ? "" : filterForm.debitEndDate,
				accountState:filterForm.accountState === '' ? "" : filterForm.accountState,
				// accountingStandards:filterForm.accounStandard === '' ? "" : filterForm.accounStandard
		}
		//*************搜索  end*********** */

		this.injections.reduce('update',{path:'data.other.loading',value:true});
		let orgIdList = [];
		this.getData(page,params)
			.then( async (res) => {
				if(res.list.length){
					res.list.map(item=>{
						item.reportFlag = false;
						orgIdList.push(item.orgId);
					})
				}
				this.injections.reduce('load', res);
				this.injections.reduce('update',{path:'data.other.loading',value:false});
				const ret = await this.webapi.ztgl.reportSetFlagAsync(orgIdList);
				if(ret){
					const retp = await this.webapi.ztgl.reportSetFlagResp(ret,2000);
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
		
		//begin

		const result = await Promise.all([
			this.webapi.ztgl.queryUserData(),
			this.webapi.ztgl.batchQuery([200002]),
		])
		let userData = result[0], batchQuery = result[1];
		this.injections.reduce('load', null, userData, batchQuery);
		
		//end

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
    plDetail1 = async() =>{
        let ret = await this.webapi.ztgl.plCirculation();
        if(ret){
            if(ret.failMsg != 'success'){
                if(this.timer1){
                    clearInterval(this.timer1)
                }
				this.injections.reduce('update',{path:'data.pl.plVisible',value:false});
                this.load()
                message.warning(ret.failMsg)
                return

            }else {
				this.metaAction.sfs({
					'data.pl.importNum':ret.totalCount,
					'data.pl.detailNum':ret.finishCount,
					'data.pl.batchFinished':ret.batchFinished,
					'data.pl.plVisible':true
				})
				if(!this.timer1){
                	this.timer1 = setInterval(() => {
                		this.plDetail1();
					},10000)
				}
                if(ret.batchFinished){
                    if(this.timer1){
                        clearInterval(this.timer1)
                    }
					this.injections.reduce('update',{path:'data.pl.plVisible',value:false});
                    this.load();

                }
            }
        }
    }

	getIsNeedTip = async() => {
        let result =await this.webapi.ztgl.getIsNeedTip();
        if(result){
            // console.log(result,'pl')
			if(result == 1){
				this.injections.reduce('update',{path:'data.pl.plVisible',value:true});
                this.plDetail1();

			}else if (result == 0){
				this.injections.reduce('update',{path:'data.pl.plVisible',value:false});
                if(this.timer1){
                    clearInterval(this.timer1)
                }
                this.load()
			}
        }
	}

    getDisabled = (list) => {
		// console.log(list,'我是disabled')
		let arr = []
		list.forEach((item,index)=>{
			if(item.debitState == '001'&& item.czlx == '1'){
				arr.push(index)
			}

		})
		// console.log(arr,'arr')

        if (arr.length >0){
            return true
        }else {
            return false
        }
	}



	search = () => this.load()


	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};


	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked);
		// let sel = this.metaAction.gf('data.list').toJS()
		// console.log(sel,'99999999')
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
		// console.log("params::::"+params);
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

		response = await this.webapi.ztgl.queryList({ page, entity });
		return response;
	};

    //创建账套
    createZt = (obj) => (e) => {
		// console.log("num："+obj.num);
		if(obj.num>0){
			return false;
		}
		else{
			this.createZttInfo(obj.orgId);
		}
	};

	close = (ret) => {
        this.closeTip()
    }



    /******************批量导账 start***********************/


    popoverCon = (data) => {
        if(data.debitState == '002' && data.message != ''){//导账成功
            let str = data.message;
            if(str.indexOf("|") != -1 ){
                let arr = str.split('|')
                // console.log(arr,'arr')
                return <div>
                    <div>
                        {
                            arr&&arr.map((item,index) =>{
                                return <div>{index+1}、{item}</div>
                            })
                        }
                    </div>
                    <div style={{color:'red',textAlign:'center',cursor:'pointer'}} onClick={() => this.updateTip(data.orgId)}>【我已处理，以后不再提醒】</div>
                </div>

            }else {
                return <div>
                    	<div>{data.message}</div>
                        <div style={{color:'red',textAlign:'center',cursor:'pointer'}} onClick={() => this.updateTip(data.orgId)}>【我已处理，以后不再提醒】</div>
					</div>

            }


        }
        if(data.debitState == '003' && data.message != ''){//导账失败
            return <div>
                <div>{data.message}</div>
                <div style={{color:'red',textAlign:'center',cursor:'pointer'}} onClick={() => this.updateTip(data.orgId)}>【我知道了，不用再提示啦~】</div>
            </div>
        }
    }

    updateTip = async(id) => {
    	let data = {};
    	data.orgId = id;
    	data.xs = '0';
    	let ret = this.webapi.ztgl.upDateTip(data);
    	if(ret){
    		this.load();
		}
	}

		//批量导账按钮
	closeImport = (ret) => {
		if(ret){
			const ret = this.metaAction.modal('show', {
				title: '',
				width:300,
				className:'ttk-es-app-ztmanage-pl-data-modal',
				footer:null,
				children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-data', {
					store: this.component.props.store,
				})
			})
		}else {
			this.load()
		}
		this.closeTip()
	}

    //判断是否选择客户
		chooseCustomer = () =>{
			let sel = this.metaAction.gf('data.list').toJS();
			let len = [];
			let ztxx = [];
			sel.forEach((item,index)=>{
				if(item.selected){
					len.push(index);
					ztxx.push(item)
				}
			})
			this.metaAction.sfs({
				'data.chckBoxValue':len,
				'data.ztxx':fromJS(ztxx)
			})
		}
    //批量操作按钮
	handelClick = async (type) =>{
			this.chooseCustomer();
			let checkValue = this.metaAction.gf('data.chckBoxValue')
		// console.log(checkValue,999999)
		if(type != 'reportPlSet' && checkValue.length === 0){
			message.warning('请先选择客户！')
			return
		}else {
			if(type == 'import'){//批量导入
				let dz = [],//判断是否存在导账状态为导账成功的企业,
					orgIdList = [];
				let sel = this.metaAction.gf('data.ztxx').toJS();
				sel.forEach((item,index)=>{
					if(item.debitState == '002'){//导账成功
						dz.push(index)
					}
					orgIdList.push(item.orgId);
				})
				if(dz.length === 0){//没有导账成功的客户
					// const ret = await this.webapi.ztgl.promptAsync(orgIdList);//是否有财务、业务数据
					// if(ret){
					// 	let res = await this.webapi.ztgl.promptResp(ret, 2000);
					// 	console.log(res);
					// 	if(res && res.length>0){
					// 		let ret = await this.metaAction.modal('confirm', {
					// 			width: 360,
					// 			title: '提示',
					// 			content: '勾选账套中存在有数据的账套，不支持批量导账！请对已有数据账套进行单户导账！'
					// 		});
					// 		if(ret || !ret){
					// 			let list = this.metaAction.gf('data.list').toJS();
					// 			res.map(id=>{
					// 				list.map(item=>{
					// 					if(id == item.orgId) item.isNotpl = true;
					// 				})
					// 			})
					//      this.injections.reduce('load', {list:list});
					// 		}
					// 		return
					// 	}
					// }

					// let ztxx = this.metaAction.gf('data.ztxx').toJS();
					let list = [];
					let jzzt = '';
					let dzzt = '';
					let i = 0;
					// let k = 0;
					let disType = null;
					sel.forEach((item) => {
						if(item.accountState == '001'){
							jzzt = '1';
						}else {
							jzzt = '0'
						}
						if(item.debitState == '002'){
							dzzt = '1';
						}else {
							dzzt = '0';
						}
						if(item.srcid == 0 || item.srcid == ''){
							i++
						}else {
							// k++
						}
						list.push({
							jzzt:jzzt,
							dzzt:dzzt,
							orgid:item.orgId
						})
					})
					if (sel.length == i){//其他财务软件
						disType = 1
					}
					// else if(sel.length == k){//旧账套
					// 	disType = 0
					// }
					else {
						disType = 1
					}
					this.injections.reduce('update',{path:'data.other.loading',value:true});
					const res = await this.webapi.ztgl.isCSH({list:list});
					if(!res){
						this.injections.reduce('update',{path:'data.other.loading',value:false});
						this.load();
					}else {
						this.injections.reduce('update',{path:'data.other.loading',value:false});
						const ret = await this.metaAction.modal('show', {
							title: '批量导账',
							width:400,
							footer:null,
							// closeModal: this.closeImport,
							closeBack: (back) => { this.closeTip = back },
							children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl', {
								store: this.component.props.store,
                                params:{
                                    list:sel,
                                    distype:disType,
								},
								fuc:this.closeImport,
								fuc1:this.getIsNeedTip,
							})
						})

					}
				}else {
					await this.metaAction.modal('confirm', {
						title: '提示',
						content: '已导账企业，需要删除原账套后，再重新导入。请取消此类企业后，再进行批量导账。'
					});
				}
			}
			else if(type == 'edit'){//批量修改
				// console.log(type,'edit')
				let ztxx = this.metaAction.gf('data.ztxx').toJS();
				let editArr = [];
				let isDaozhang = false;
				ztxx.forEach(item =>{
					if(item.accountState == '001'){
						editArr.push({id:item.orgId});
					}
					if(item.debitState == '001' || item.debitState == '003'){
						isDaozhang = true
					}
				})
				if(editArr.length == 0){
					message.warning('没有可以修改的账套！')
					return
				}
				if(isDaozhang){
					message.warning('所选账套中存在导账中、导账失败账套，不允许进行批量修改!')
					return
				}
				// console.log(editArr,'editArr')
				const rel = await this.metaAction.modal('show', {
					title: '账套信息批量修改',
					width:400,
					children: this.metaAction.loadApp('ttk-es-app-ztmanage-pl-edit', {
						store: this.component.props.store,
						list:editArr
					})
				})
				if(rel){
					this.load();
				}
			}
			else if(type == 'del'){//批量删除
				// let list = [];
				// let sel = this.metaAction.gf('data.ztxx').toJS();
				// let isDaozhang = false;
                // sel.forEach(item => {
                // 	if(item.accountState == '001'){
				// 		list.push(item.orgId)
				// 		if(item.debitState == '001'){
				// 			isDaozhang = true;
				// 		}
				// 	}
				// })
				// if(list.length === 0){
                //     message.warning('没有可删除的账套！')
                //     return
				// }else if(isDaozhang){
				// 	message.warning('所选账套中存在导账中账套，不允许进行批量删除')
                //     return
				// }else {
                //     if(this.handleCreate) return
                //     this.handleCreate = true
                //     const plDet = await this.metaAction.modal('confirm', {
                //         title: '删除账套',
                //         content: (
                //             <div>
                //                 已选中{sel.length}户，账套删除后，账套下所有业务、财务、基础数据都将被删除，且无法恢复。确定要删除吗？
                //             </div>
                //         )
                //     });
                //     if(plDet){
                //         LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
				// 		let plRes = await this.webapi.ztgl.plDelet(list)
				// 		if(plRes && plRes.message && !plRes.flag){
				// 			this.metaAction.modal('warning', {
				// 						className: "ttk-es-app-ztmanage-delMessage",
				// 						width: 426,
				// 						content: <div>
				// 							<p>{plRes.message}</p>
				// 						</div>,
				// 						okText: '确定'
				// 				})
				// 		}else if(plRes && plRes.flag) {
				// 			this.metaAction.toast('success', '删除账套成功！');
				// 		}
				// 		// else{
				// 		// 	this.metaAction.toast('warn', '删除账套失败！');
				// 		// }
				// 	}
                //     LoadingMask.hide()
                //     this.handleCreate = false
                //     this.load();

				// }
			}else if(type == 'reportPlSet'){//批量报表设置
				let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),orgIdList = [];
				selectedArrInfo.map(item=>{
					if(item.accountState == '001' && (item.debitState == '000' || item.debitState == '002')){
						orgIdList.push(item.orgId)
					}
				})
				if ((selectedArrInfo && !selectedArrInfo.length) || !selectedArrInfo || orgIdList.length==0) {
					this.metaAction.toast('warn', '请选择已经建账或导账成功的企业')
					return false
				}
				const ret = await this.metaAction.modal('show', {
					title: '批量报表设置',
					width: 720,
					className: 'ttk-es-app-ztmanage-personModal',
					style: { top: 5 },
					height: 550,
					footer: null,
					children: this.metaAction.loadApp('ttk-gl-app-report-batchSetting', {
						store: this.component.props.store,
						params:{
							source:'1', //1账套管理 2，账套链接
							type: '2', //类型 1.单户  2批量
							orgIds: orgIdList, //选中用户的组织id
						}
					})
				});
				if(ret){
					this.load();
				}
			}else if(type == 'printSet'){//批量打印设置
				let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),
					orgIdList = [],
					isDaozhang = false,
					isJianzhang = false;
				selectedArrInfo.map(item=>{
					if(item.accountState == '001' ){
						isJianzhang = true;
						if(item.debitState == '001' || item.debitState == '003'){
							isDaozhang = true;
						}else{
							orgIdList.push(item.orgId);
						}
					}
				})
				if(!isJianzhang){
					message.warning('没有可设置账套！')
					return
				}
				if(isDaozhang){
					message.warning('所选账套中存在导账中、导账失败账套，不允许进行批量打印设置')
					return
				}
				const resBatch = await this.metaAction.modal('show', {
					title: '批量打印设置',
					style: { top: 5 },
					width: 900,
					footer: null,
					children: this.metaAction.loadApp('ttk-gl-batch-printing-setting', {
						store: this.component.props.store,
						orgIds:orgIdList//选中数据的orgId集合，是个数组
					})
				})
				if(resBatch){
					this.load();
				}
			}
		}

	}

	renderCell = (id) => {
		const accountingStandards = this.metaAction.gf('data.accountingStandards').toJS();
		let content = '';
		accountingStandards.map(item => {
			if(item.id == id){
				content = item.name;
			}
		})
		return <div title={content}
				style={{
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis',
				overflow:'hidden'}}
				> 
					{content} 
				</div>
	}

    /******************批量导账 end***********************/
    createZttInfo = async (id) => {
        const ret = await this.metaAction.modal('show', {
            title: '创建账套',
			width: 450,
			style: { top: 5 },
            // className: 'ttk-es-app-ztmanage-cjzt',
			// height: 540,
			footer: null,
			closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-es-app-ztmanage-add', {
                store: this.component.props.store,
				id: id,
				sourceType:'0',//0创建账套 1账套信息
				page:'ztmanage'
            })
		});

		//创建账套成功后刷新页面
		if(ret) {
		    // console.log(ret,'000000')
			this.load();
		}
    };

	 //导账  0: 对已有企业选择导账 1： 继续导账
	 importZt =  (obj,type) =>async (e) => {
		 const isImportZt = this.metaAction.gf('data.isImportZt');
		 if(isImportZt) return false
		 this.injections.reduce('update',{path:'data.isImportZt',value:true});
		// console.log(obj)
		// console.log("客户ID："+obj.orgId);
		 if(obj.num>0 || (obj.debitState == '001' && obj.czlx == '1')){
			 return false;
		 }
		 let result = await this.webapi.ztgl.editCZLX({orgid:obj.orgId});//改变操作类型
		let id=obj.orgId,
			debitState = obj.debitState,
			uploadFileId = obj.uploadFileId;

		let dzState= await this.webapi.ztgl.sendSms({orgId:id});//是否有财务、业务数据
		// console.log("dzState::::"+dzState);

        if(!dzState){//有财务数据
            this.sendMsginfo(id,type,debitState,uploadFileId);
		}else{
			let response = await this.webapi.ztgl.toBdz({orgId:id});
			this.importZtInfo(id,type,debitState,uploadFileId);


			//以下为重新设置上下文信息2019-07-18 杨舜鹏确认，需要新增判断
			await this.webapi.ztgl.init();
			const reps = await this.webapi.ztgl.portal();
			if(reps) {
				this.metaAction.context.set('currentUser', reps.user)
				this.metaAction.context.set('currentOrg', reps.org)
			}
		}

    };

	// toImportAccount = (id, type) => {
    //     this.component.props.setPortalContent('导账', 'ttk-gl-app-importdata-enterprise', { organization: id, sourceType: type,appVersion: 114 })
    // }

	//导账窗口
    importZtInfo = async (id,type,debitState,uploadFileId) => {
		// console.log("type:::"+type);
		// console.log('window',window.screen.width)
		let width = (document.querySelector('body').offsetWidth) - 60
        const ret = await this.metaAction.modal('show', {
            title: '导账',
            width: width,
            //className: 'ttk-es-app-ztmanage-personModal',
			// height: 550,
			style: { top: 5 },
			footer:null,
			// onCancel:function(e){
			// 	this.ztClose();
			// },
            //children: this.metaAction.loadApp('ttk-edf-app-manage-import', {
			// children: this.metaAction.loadApp('ttk-gl-app-importdata-enterprise', {
            //     store: this.component.props.store,
            //     id: id
			// })
			 children: this.metaAction.loadApp('ttk-gl-app-importdata-enterprise', {
				store: this.component.props.store,
                organization: id,
                sourceType:type,
				appVersion: 114,
				debitState,
				uploadFileId,
			})
		});
		
		if(!ret){
			this.ztClose();
		}
		//else{
		this.injections.reduce('update',{path:'data.isImportZt',value:false});
		this.load();//刷新窗口
		//}
	};

	//关闭导账窗口
	ztClose = async () => {
		// console.log('关闭导账窗口');
		let response = await this.webapi.ztgl.toDz();

		//以下为重新设置上下文信息2019-07-18 杨舜鹏确认，需要新增判断
		//调原来的那两个接口只是切换了token 没有切换前端上下文 那样token跟上下文不匹配了
		await this.webapi.ztgl.init();
		const reps = await this.webapi.ztgl.portal();
        if(reps) {
            this.metaAction.context.set('currentUser', reps.user)
			this.metaAction.context.set('currentOrg', reps.org)
		}
		this.load();//刷新窗口
	}

	//导账信息查看2019-07-23,rowData预留参数，暂时不使用
	 viewImportData = (rowData) => async (e) => {
         if(rowData.debitState == '001' && rowData.czlx == '1'){
             return false
         }
		let response = await this.webapi.ztgl.toBdz({orgId:rowData.orgId});

		let dzxx = await this.webapi.ztgl.querysfxs({orgId:rowData.orgId})
		if(dzxx == 1){
			const ret = await this.metaAction.modal('show', {
				title: '导账信息',
				width:500,
				style: { top: 5 },
				children: this.metaAction.loadApp('ttk-es-app-ztmanage-import-success', {
					store: this.component.props.store,
					orgId:rowData.orgId,
					fuc:this.ztClose,
				})
			})
			if (ret){
				this.load()
			}
		}else {
			const res = await this.metaAction.modal('show', {
			    title: '导账信息',
			    width: 1150,
				height: 500,
				style: { top: 5 },
				okText:'确定',
				bodyStyle:{paddingTop:'0px'},
				footer: null,
			    children: this.metaAction.loadApp('ttk-gl-app-importdata-view', {
			        store: this.component.props.store,
					orgId: rowData.orgId
			    })
			});
			if(!res){
				this.ztClose();
			}
		}
    };

	//发送短信窗口
	sendMsginfo = async (id,type,debitState,uploadFileId) => {
        const ret = await this.metaAction.modal('show', {
            title: '重新初始化',
            width: 435,
            //className: 'ttk-es-app-ztmanage-personModal',
			height: 300,
			//footer:null,
			 children: this.metaAction.loadApp('ttk-es-app-ztmanage-sms', {
				store: this.component.props.store,
				orgId: id,
			 })
		});

		if(ret){//短信验证通过进入导账页面
			let response = await this.webapi.ztgl.toBdz({orgId:id});
			this.importZtInfo(id,type,debitState,uploadFileId);

			//以下为重新设置上下文信息2019-07-18 杨舜鹏确认，需要新增判断
			await this.webapi.ztgl.init();
			const reps = await this.webapi.ztgl.portal();
			if(reps) {
				this.metaAction.context.set('currentUser', reps.user)
				this.metaAction.context.set('currentOrg', reps.org)
			}
		}
		this.injections.reduce('update',{path:'data.isImportZt',value:false});

	};

    handleConfirm = (data) => {
		//权限管理点击确认
		this.injections.reduce('update',{path:'data.checkedKeys.checked',value:data});
        this.load();
	}

    handleReset = (data) => {
		//权限管理点击重置
		// console.log("重置:::"+data)
		this.injections.reduce('update',{path:'data.checkedKeys.checked',value:data});
		this.load();
    }

	pageTotal = () => {
		return `共 ` + this.metaAction.gf('data.pagination.total') + ` 条 `
	}

    //分配给我的、公司的客户、部门的客户
	renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
		this.injections.reduce('update',{path:'data.ifgs',value:permission.all ? '公司的客户' : '部门的客户'});

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }

	//按钮状态
	//账套状态accountState（000未创建账套，001已创建账套，002已删除账套, 003账套恢复中）
	opreationState = (state,type) =>{
		// console.log("state::::"+state.accountState+"  type::::"+type);
		if(type=='1'){//账套创建按钮
			if(state.accountState=="000" || state.accountState=="002" || state.accountState=="003"){//未创建账套
				return true;
			}
			else{
				return false;
			}
		}
		else if(type=='99'){
			if(state.debitState=="001" || state.debitState=="002"){//已连接账套
				return true;
			}
			else{
				return false;
			}
		}
		// else if(type == '88'){
		// 	return false
		// }
			else if(type == '3'){
            if(state.debitState=="002" && state.accountState=="001" ){
                return false;
            }
		}
		else{
			if(state.accountState=="001"){
				return true;
			}
			else{
				return false;
			}
		}
	}

	//账套是否连接以及是否是批量导账中
	isZtlj=(itemInfo,type)=>{
		const state = itemInfo.num,
			  debiState = itemInfo.debitState,
			  czlx = itemInfo.czlx,
			  accountState = itemInfo.accountState;

		if(accountState && accountState == '003' && type == '1'){
			return "btncjzt4" //当主账套在恢复中状态时，【建账】和【导账】按钮置灰不可点击
		}
		if(accountState == '001' && (debiState=='001' || debiState=='003') && type == '2'){
			return "btncjzt4" //已建账  导账状态在导账中或导账失败时：【账套信息】、【报表设置】、【删除账套】、【账套备份】、【账套恢复】按钮置灰不可点击 
		}
		if(state>0 || (debiState=='001'&&czlx=='1')){
			return "btncjzt1";//账套已经连接则不需要显示创建账套按钮(按钮置灰)
		}
		if(accountState && accountState == '000' && debiState == '001' && type == '1' ){
			return "btncjzt4"
		}
		else{
			return  "btncjzt2";
		}
	}

	//当账套为主账套恢复中、导账中、导账失败时【账套恢复】按钮置灰且不可点击
	getRegainCon = (accountState,state,debitState) => {
		if(state == 1){
			return accountState == '003' || debitState == '001' || debitState == '003' ? 
					<div style={{color:'rgb(0, 0, 0, 0.25)',pointerEvents: 'none'}}>账套恢复</div>
					: <div>账套恢复</div>
		}else if(state == 2) {
			if(accountState == '003' || debitState == '001' || debitState == '003'){
				return true 
			}else{
				return false
			}
		}
	}

	menuButControl = (itemInfo,type) => {
		if(type == 'del' && itemInfo.debitState == '001'){
			return true
		}else if(type == 'backup' && (itemInfo.debitState == '001' || itemInfo.debitState == '003')){
			return true
		}else{
			false
		}
	}

	//批量导账中文字显示样式
	plDebiState = (data) => {
        if(data.debitState=='001'&&data.czlx=='1'){
            return "btncjzt1";//批量导账中
        }else {
        	return "btncjzt3";
		}
	}

	/**导账、导账信息按钮 */
	/**
	 * 导账状态debitState(000未导账，001导账中，002已导账，003导账失败)
	 * 客户已创建账套并且已导账 操作列按钮: 账套信息、导账信息、删除账套 
	 * 客户已创建账套但未导账   操作列按钮: 账套信息、导账、删除账套
	 * accountState:账套状态
	 * debitState:导账状态
	 **/
	opreationZtDzState = (state,type) =>{
		if(type=="1"){//显示导账按钮
			if(state.accountState=="001" && state.debitState=="000"){//已创建账套且未导账
				return true;
			}else if(state.accountState=="001" && state.debitState=="001"){//已创建账套且导账中
				return false;
			}else if(state.accountState=="001" && state.debitState=="002"){//已创建账套且导账中
                return false;
            }else if(state.accountState=="000" && state.debitState=="001"){
				return false;
			}
			else{
				return true;
			}
		}
	   else	if(type=="99"){//显示继续导账、取消导账按钮
			if(state.debitState=="001"){
				return true;
			}
			else{
				return false;
			}
		}
		else{//显示账套信息
			if(state.accountState=="001" && state.debitState=="002"){//已创建账套并已经导账
				return true;
			}
			else {
				return false;
			}
		}
	}

	//账套备份按钮的显示控制
	backupZtState = (state) => {
		if(state.debitState=="000" && (state.accountState=="000" || state.accountState=="002")){
			return false;
		}else if(state.accountState=='003'){
			return false;
		}else{
			return true;
		}
	}

	//删除账套
	delClick = (rowData) => {
        if(rowData.debitState == '001' && rowData.czlx == '1'){
            return false
        }
		this.del(rowData.orgId,rowData.name);//传入需要删除的orgid
	};

	del = async (id,name) => {
		if(this.handleCreate) return
		this.handleCreate = true
		const ret = await this.metaAction.modal('confirm', {
			title: '删除账套',
			width: 455,
			className:'delModal',
			content: (
				<div>
					<div 
					style={{fontSize: '15px',fontWeight: 'bold',marginBottom:'20px'
					}}>
						{`确认要删除【${name}】账套？`}
					</div>
					<div style={{lineHeight: '30px'}}>
						删除后该账套下所有
						<span style={{fontSize:'15px',color:'#fb7f66',fontWeight: 'bold'}}>
							业务、财务、基础数据将被删除且无法恢复！
						</span>
						建议
						<span style={{fontSize: '15px',fontWeight: 'bold'}}>
							先备份账套
						</span>
						后再进行删除！！！
					</div>
				</div>
			)
		});
		if (ret) {
			LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
			let response = await this.webapi.ztgl.deleteZt({orgId:id});
			if(response && response.message && !response.flag){
				this.metaAction.modal('warning', {
							className: "ttk-es-app-ztmanage-delMessage",
							width: 426,
							content: <div>
								<p>{response.message}</p>
							</div>,
							okText: '确定'
					})
			}else if(response && response.flag) {
				this.metaAction.toast('success', '删除账套成功！');
			}
			// else{
			// 	this.metaAction.toast('warn', '删除账套失败！');
			// }
			LoadingMask.hide()
		}
		this.handleCreate = false
		this.load();
	};

	//查看账套
	ztInfo = (list) => (e) => {
		// console.log("查看导账orgid:::"+list.orgId);
		if(list.debitState=='001'&&list.czlx=='1'){
			return false
		}else {
            this.showZt(list.orgId);
		}

	};

	showZt = async (id) => {
		const ret = await this.metaAction.modal('show', {
            title: '账套信息',
			width: 450,
			style: { top: 5 },
			// height: 540,
			footer: null,
            children: this.metaAction.loadApp('ttk-es-app-ztmanage-add', {
                store: this.component.props.store,
				id: id,
				sourceType:'1'//0创建账套 1账套信息
            })
		});
	}

	//备份账套
	backupZtInfo = async (rowData) => {
		var date = new Date();
		let year = this.timeAdd0(date.getFullYear());
		let month = this.timeAdd0(date.getMonth()+1);
		let date1 = this.timeAdd0(date.getDate());
		let fileName = rowData.name + year + month + date1 + "-备份";
		this.metaAction.modal("show", {
			title: '账套备份',
			className: "ttk-es-app-ztmanage-backup",
			width: 560,
			height: 540,
            okText: "确定",
			cancelText: "取消",
			children: (
				<BackupZtInfo
					metaAction={this.metaAction}
					store={this.component.props.store}
					webapi={this.webapi}
					inputVal={fileName}
					orgId={rowData.orgId}
				></BackupZtInfo>
			)
		})
	}
	timeAdd0 = (time) => {
		let str = time.toString();
		if(str.length<=1){
			str='0'+str;
		}
		return str
	}

	//恢复账套
	// regainZtInfo = async (rowData) => {
	// 	console.log("恢复账套")
	// 	console.log(rowData)
		
	// }
	getAccessToken = () => {
		let token = fetch.getAccessToken()
        return token
	}
	getUploadData = (rowData) => {
		let option = {
			agencyId: rowData.agencyId,
			orgId: rowData.orgId
		}
		return option;
	}
	 //文件改变触发的回调
	 uploadChange = async (info,rowData) => {
        if (!info.file.status) {
            this.metaAction.toast('error', '仅所选文件格式不符，只支持本系统备份文件的恢复')
            return
		}
		LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
		// LoadingMask.show({content:'账套恢复中，稍后请到【恢复账套查询】中进行查看！'});
        if (info.file.status === 'done') {
            if (info.file.response.error && info.file.response.error.message) {
				let that = this;
				setTimeout(function(){
					LoadingMask.hide()
					that.metaAction.toast('error', info.file.response.error.message)
				},2000)
            } else if (info.file.response.result && info.file.response.value) {
				info.file.response.value.orgId = rowData.orgId;
				let res = await this.webapi.ztgl.restore(info.file.response.value);
				if(res && res.message){
					this.metaAction.toast('success', res.message)
				}
				LoadingMask.hide();
				this.load();
            }
        } else if (info.file.status === 'error') {
            LoadingMask.hide()
			this.injections.reduce('update',{path:'data.loading',value:false});
            this.metaAction.toast('error', '上传失败')
        }
	};
	//上传文件前的回调
	beforeUpload = async file => {
		// console.log('beforeUpload',file);
	};

	//恢复账套查询
	regainZtQuery = async (rowData) => {
		let appName = "ttk-es-app-ztmanage-regain-query";
		// console.log(this.component.props.setPortalContent);
		this.component.props.setGlobalContent &&
		this.component.props.setGlobalContent({
			name: rowData.name+"-恢复账套查询",
			appName: appName,
			params: {ztName:rowData.name,agencyId: rowData.agencyId},
			orgId: rowData.orgId,
			// ztName: rowData.agencyId,
			// agencyId: rowData.name,
		});
	}

	// 表格操作按钮，更多 点击触发时间入口
	judgeIsChoseBill = async (type, rowData) => {
		if (type === "delZtInfo") {
            this.delClick(rowData);
            return;
        }else if(type === "backupZtInfo") {
			this.backupZtInfo(rowData);
            return;
		}else if(type === "regainZtInfo") {
			this.regainZtInfo(rowData);
            return;
		}else if(type === "regainZtQuery") {
			this.regainZtQuery(rowData);
            return;
		}
	}

	/**
	 * 导账状态debitState(000未导账，001导账中，002导账成功，003导账失败)
	 */
	getDzState= (code,czlx) =>{
		let str = null
		if(code=='000'){
            str =  '未导账';
		}else if(code=='001'){
			if(czlx == '1'){
                str = '批量导账中'
			}else {
                str = '导账中'
			}
		}else if(code =='002'){
            str = '已导账'
		}else if(code =='003'){
            str = '导账失败'
        }else if(code =='004'){
            str = '采集中'
        }else if(code =='005'){
            str = '采集成功'
        }else if(code =='006'){
            str = '采集失败'
        }
		// switch (code,czlx) {
		// 	case code =='000':
		// 		str =  '未导账';
		// 		break;
		// 	case code =='001' || czlx == '0':
		// 		str = '导账中';
		// 		break;
         //    case code =='001' && czlx == '1':
         //        str = '批量导账中';
         //        break;
		// 	case code =='002':
		// 		str = '导账成功';
		// 		break;
		// 	case code =='003':
		// 		str = '导账失败';
		// 		break;
		// 	case code =='004':
		// 		str = '采集中';
		// 		break;
		// 	case code =='005':
		// 		str = '采集成功';
		// 		break;
		// 	case code =='006':
		// 		str = '采集失败';
		// 		break;
		// 	default: str = '导账失败';
		// }
		return str;
	}


	//报表设置
    reportSet = (rowData) => async (e) => {
		const isShow = this.metaAction.gf('data.isShow');
		console.log(isShow);
		if(rowData.debitState == '001' && rowData.czlx == '1'){
		 	return false
		}

		//需要新增加报表设置的相关判断条件
		if (!rowData.bszlxl) {
			this.metaAction.toast('warning', '未设置会计制度，请前往【客户资料-纳税人信息】中设置')
			return
		}

		if (rowData.accountingStandards == 2000020008 || !rowData.kjzz || (rowData.bszlxl != 'ZL1001001' && rowData.bszlxl != 'ZL1001002' && rowData.bszlxl != 'ZL1001003')) {
			this.metaAction.toast('warning', '不支持此会计制度的报表设置')
			return
		}
		if(isShow){
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
						source:'1', //1账套管理 2，账套链接
						type: '1', //类型 1.单户  2批量
						orgIds: rowData.orgId, //选中用户的组织id
					}
				})
			});
		}else{
			let areaFlag = 1;
			if(rowData.areaCode){
				const areaCode = rowData.areaCode.substring(0,2);
				areaFlag = areaCode == '44' ? 1 : 0;
			}else{
				areaFlag = 1;
			}
			const ret = await this.metaAction.modal('show', {
				title: '报表设置',
				width: 720,
				className: 'ttk-es-app-ztconnetlist-personModal',
				style: { top: 5 },
				height: 550,
				footer: null,
				children: this.metaAction.loadApp('ttk-gl-app-report-setting', {
					store: this.component.props.store,
					params:{
						reportSetType:1, //单户-1，批量设置-2
						orgDtosList:[
							{
								orgId:rowData.orgId, //组织id
								software:"TTK", //财务软件，金财管家-TTK，其它-QT
								areaFlag:areaFlag //是否属于广东地区客户，1-是，0-否
							}
						]
					}
				})
			});
		}
	};

	//更多筛选条件
	handlePopoverVisibleChange = (visible) => {
        // debugger
        if (visible) {
            const { filterForm } = this.metaAction.gf('data').toJS()
			this.injections.reduce('update',{path:'data.entity',value:filterForm});
        }
		this.injections.reduce('update',{path:'data.showPopoverCard',value:visible});
	}


	//导账人员信息
	//data:后台获取的数据信息
	getDzUser = (data) =>{
		if(!data)
		return null
		let arr = []
		arr.push(<Select.Option value=''>全部</Select.Option>);//默认值设置
        data.forEach((option) => arr.push(<Select.Option value={option.debiter}>{option.name}</Select.Option>))
		return arr
	}

	//重置
	resetForm = () => {
        const { filterFormOld, entity } = this.metaAction.gf('data').toJS()
        Object.assign(entity, filterFormOld)
		this.injections.reduce('update',{path:'data.entity',value:entity});
	}

	//查询
    filterList = () => {
        //this.injections.reduce('data.other.loading', true)
		const { entity } = this.metaAction.gf('data').toJS()
		// console.log("info:::begin");
		// console.table(this.metaAction.gf('data').toJS());
		this.metaAction.sfs({
            'data.filterForm': fromJS(entity),
            'data.showPopoverCard': false,
            'data.pagination.currentPage': 1,
        })
		// console.log("info:::end");
        this.load()
	}

	getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        //debugger
		const res = await this.webapi.ztgl.getfpkh(params)
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

	//取消导账2019-07-23
	cancelImportAccount = (rowData) => async (e) => {
        if(rowData.debitState == '001' && rowData.czlx == '1'){
            return false
		}
		
		const ret = await this.metaAction.modal('confirm', {
			title: '取消导账',
			content: '取消导账将会清除您已经确认的导账数据，是否确认取消？'
		});
		if (ret) {
			LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
			let currentUser = this.metaAction.context.get('currentUser');
			let curentUserId=currentUser.id;

			//let response = await this.webapi.ztgl.cancelImportAccount({userId:curentUserId,orgId:rowData.orgId});
			let response = await this.webapi.ztgl.cancelImportAccount({orgId:rowData.orgId});
			if(!response){
				this.metaAction.toast('warn', '取消导账失败！');
			}else {
				let responseNew = await this.webapi.ztgl.cancelImportAccountState({customerOrgId:rowData.orgId});
				this.metaAction.toast('success', '取消导账成功！');
			}
			LoadingMask.hide();
			this.load();//刷新窗口
		}
    };
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
