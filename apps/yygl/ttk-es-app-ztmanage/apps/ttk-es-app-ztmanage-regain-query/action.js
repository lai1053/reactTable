import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
// import debounce from 'lodash.debounce'
// import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import RegainQueryTable from './components/Table';

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
        // this.metaAction.sf('data.pagination', fromJS(pagination))
		injections.reduce('update',{path:'data.pagination',value:pagination});
		injections.reduce('update',{path:'data.name',value:this.component.props.ztName});

        // this.metaAction.sf('data.name', fromJS(this.component.props.ztName));
		this.load()
	};

	load = async() => {
	    const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
	    let option ={
            entity: {
                orgId: this.component.props.appParams.orgId,     //企业id
                agencyId: this.component.props.agencyId   //中介id
            },
            page: {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
           
        }
        // const res = await this.webapi.getOrgJzjdList(option)
        let res = await this.webapi.queryRestoreList(option)
       
        if(res.list.length>0){
            res.list.map(item => {
                let year = item.enabledYear;
                let month = item.enabledMonth;
                month = (month<10 ? "0"+month:month)
                let str = year+'-'+month;
                item.enabledYearAndMonth = str
            })
        }
        // console.log(res.list);
        
        this.injections.reduce('tableLoading', false)
		this.injections.reduce('update',{path:'data.list',value:res.list});
		this.injections.reduce('update',{path:'data.pagination',value:res.page});

        // this.metaAction.sf('data.list',res.list)
        // this.metaAction.sf('data.pagination' ,fromJS(res.page))

        let tableColumns =  [
            {id:'financeOrgName', fieldName: 'financeOrgName', fieldTitle: '账套名称', caption: '账套名称', isVisible:true, isMustSelect:true, width: 300},
            {id:'accountingStandards', fieldName: 'accountingStandards', fieldTitle: '会计制度', caption: '会计制度', isVisible:true, width: 260},
            {id:'enabledYearAndMonth', fieldName: 'enabledYearAndMonth', fieldTitle: '启用时间', caption: '启用时间', isVisible:true, width: 220},
            {id:'restorerName', fieldName: 'restorerName', fieldTitle: '恢复人', caption: '恢复人', isVisible:true, width: 220},
            {id:'restoreDate', fieldName: 'restoreDate', fieldTitle: '恢复时间', caption: '恢复时间', isVisible:true, width: 240},
            {id:'restoreState', fieldName: 'restoreState', fieldTitle: '状态', caption: '状态', isVisible:true, width: 200},
            {id:'option', fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 240},
        ]
		this.injections.reduce('update',{path:'data.other.tableColumns',value:tableColumns});

        // this.metaAction.sf('data.other.tableColumns',fromJS(tableColumns))
    };

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
    
    //渲染子元素
    renderChildren = () => {
        const list= this.metaAction.gf('data.list').toJS(),
              pagination = this.metaAction.gf('data.pagination').toJS(),
              ztName = this.metaAction.gf('data.name')
        return (
           <RegainQueryTable 
            metaAction={this.metaAction}
            load={this.load}
            setMea={this.setMea}
            list={list}
            pagination={pagination}
            name={ztName}
            setGlobalContent={this.component.props.setGlobalContent}
           />
        )
    }

    setMea = (path,val) =>{
		this.injections.reduce('update',{path:path,value:val});
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
