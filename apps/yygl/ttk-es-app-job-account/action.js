import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import {jdTableColumns, gzTableColumns, sbTableColumns} from './fixedData';
import RenderTree from './component/RenderTree';
import RightContent from './component/rightContent';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
		injections.reduce('update',{path:'data.pagination',value:pagination});
        // this.metaAction.sf('data.pagination', fromJS(pagination))
		this.load()
        this.getpermission()
        // console.log(this.component.props.appParams.orgId);
    };
    
    componentWillReceiveProps = async (nextProps) => {
        if(this.component.props._notRender){
            let accountCode = this.metaAction.gf('data.accountCode'),
                finishmark = this.metaAction.gf('data.finishmark');
            if(accountCode == '1'){
                let res = await this.webapi.queryfinish();
                if(res.finishmark != finishmark){
                    this.injections.reduce('update',{path:'data.finishmark',value:res.finishmark});
                    // this.metaAction.sf('data.finishmark',res.finishmark);
                    this.load();
                }
            }
        }
    }

	load = async() => {
        this.injections.reduce('tableLoading', true);
        this.getFinishValue();
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth();
        years = (months==0 ? years-1:years);
        months = (months==0 ? 12:(months<10 ? "0"+months:months));
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
	    let inputval= this.metaAction.gf('data.inputval'),//人员名称
            bmdm= this.metaAction.gf('data.bmdm'),
            accountCode = this.metaAction.gf('data.accountCode');

        // this.injections.reduce('update',{path:'data.other.tableColumns',value:[]});
        let res = {};
        if(accountCode==2){
            // this.injections.reduce('update',{path:'data.other.tableColumns',value:gzTableColumns});
            let option =  {
                entity:{
                    year: year,    // 年份（必传）
                    bmdm:bmdm,    // 部门代码
                    month:month,  // 月份
                    name:inputval,
                },
                page:{
                    currentPage:pagination.currentPage,
                    pageSize:pagination.pageSize
                }
              }
            //获取表格数据
            res = await this.webapi.getOrgGztjList(option);
        }else{
            let from = accountCode == 1 ? 'jzjd' : 'sbjd';
            if(accountCode == 1){
                from = 'jzjd';
                // this.injections.reduce('update',{path:'data.other.tableColumns',value:jdTableColumns});
            }else{
                from = 'sbjd';
                // this.injections.reduce('update',{path:'data.other.tableColumns',value:sbTableColumns});
            }
            let option =  {
                entity:{
                    year: year,    // 年份（必传）
                    departmentCode:bmdm,    // 部门代码
                    month:month,  // 月份
                    personName:inputval,
                    from:from //来源（ jzjd ：记账进度  sbjd:申报进度）
                },
                page:{
                    currentPage:pagination.currentPage,
                    pageSize:pagination.pageSize
                }
              }
            //获取表格数据
            res = await this.webapi.getSbtjList(option);
        }

        this.injections.reduce('tableLoading', false)
		this.injections.reduce('update',{path:'data.list',value:res.list});
        this.injections.reduce('update',{path:'data.pagination',value:res.page});
        this.injections.reduce('update',{path:'data.other.tableColumns',value:[]});
        if(accountCode==1){
            this.injections.reduce('update',{path:'data.other.tableColumns',value:jdTableColumns});
        }else if(accountCode==2){
            this.injections.reduce('update',{path:'data.other.tableColumns',value:gzTableColumns});
        }else if(accountCode==3){
            this.injections.reduce('update',{path:'data.other.tableColumns',value:sbTableColumns});
        }
        this.injections.reduce('update',{path:'data.year',value:year});
        this.injections.reduce('update',{path:'data.month',value:month});
    };

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }

	getTableScroll = (type) => {
        try {
			let activeKey = this.metaAction.gf(`data.activeKey`)
			// let tableOption = this.metaAction.gf(`data.table${activeKey}.tableOption`).toJS()

            let dom = document.getElementsByClassName(`table${activeKey}`)[0]
            let tableDom,tableOption={}
            if (!dom) {
                // if (type) {
                //     return
                // }
                setTimeout(() => {
                    this.getTableScroll()
                }, 20)
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;

            let tableHeadDom = dom.getElementsByClassName('ant-table-thead')[0];
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight

                let number = tableHeadDom.offsetHeight
                if (num < (number+2)) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - (number+2)
                    }
					// this.metaAction.sf(`data.tab${activeKey}.tableOption`, fromJS(tableOption))
					return tableOption
                } else { // 当数量太少 不用出现滚动条
					delete tableOption.y
					return tableOption
                    // this.metaAction.sf(`data.tab${activeKey}.tableOption`, fromJS(tableOption))
                }
            }
        } catch (err) {
            // console.log(err)
        }
	}
    
	setMea = (path,val) =>{
		this.injections.reduce('update',{path:path,value:val});
    }
    
    renderChildren = () => {
        return (
            <div className='ttk-es-app-job-account-ward'>
                {this.renderTree()}
                {this.renderRight()}
            </div>
        )
    }

    //部门列表
    renderTree = () => {
        let permission = this.metaAction.gf('data.other.permission').toJS();
        return <RenderTree
            treeData={permission.treeData || []}
            setMea = {this.setMea}
            load={this.load}
            onReset={this.handleReset} />
    }
    //右边表格
    renderRight = () => {
        const list= this.metaAction.gf('data.list').toJS(),
              pagination = this.metaAction.gf('data.pagination').toJS(),
              loading = this.metaAction.gf('data.loading'),
              finishmark = this.metaAction.gf('data.finishmark'),
              accountCode = this.metaAction.gf('data.accountCode'),
              orgId = this.component.props.appParams.orgId;
        return <RightContent
            load={this.load}
            setMea={this.setMea}
            metaAction={this.metaAction}
            list={list}
            pagination={pagination}
            loading={loading}
            finishmark={finishmark}
            setGlobalContent={this.component.props.setGlobalContent}
            accountCode={accountCode}
            orgId={orgId}
        />
    }

    //获取部门列表
    getpermission = async () =>{
        const res = await this.webapi.getfpkh()
        if(res && res.body){
			if(res.body.bmxx && Array.isArray(res.body.bmxx) && res.body.bmxx.length > 0){
                this.injections.reduce('update',{path:'data.other.permission.treeData',value:res.body.bmxx});
			}
		}
    }

    //获取完成标志
    getFinishValue = async() =>{
        let res = await this.webapi.queryfinish()
        this.metaAction.sf('data.finishmark',res.finishmark);
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
