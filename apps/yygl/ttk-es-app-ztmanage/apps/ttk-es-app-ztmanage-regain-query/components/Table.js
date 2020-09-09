import React, { Component } from 'react'
import config from '../config';
import { Table, LoadingMask, Pagination } from 'edf-component'

class renderTableComponent extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            loading : false
        }
        this.config = config.current;
        this.webapi = this.config.webapi;
        this.metaAction = this.props.metaAction;
       
    }

    componentDidMount = async () => {
        // this.mounted = true;
    }
    componentWillUnmount = () => {
        // this.mounted = false;
    }

    renderColumns =()=> {
        const columns = this.metaAction.gf('data.other.tableColumns').toJS()
		const resArr = []
		columns.forEach((item, index) => {
			let obj = {
				name: item.fieldName,
                title:item.fieldTitle,
				dataIndex: item.fieldName,
                width: item.width,
                align: item.fieldName == 'financeOrgName' || item.fieldName == 'accountingStandards' ? 'left':'center',
				render: (text, v, index, record) => {return this.handleRenderText(item.fieldName, v, index,record)}
			}
                resArr.push(obj)
		})
		return resArr
    }
    
    handleRenderText = (name, rowData, index,record) => {
        // console.log(name, rowData, index)
        // accountingStandards
        if(name == 'financeOrgName') {
            return <div title={rowData[name]}
            style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow:'hidden'}}>{rowData[name]}</div>
        } else if(name == 'accountingStandards'){
            const accountingStandards = this.metaAction.gf('data.accountingStandards').toJS();
            let content = '';
            accountingStandards.map(item => {
                if(item.id == rowData[name]){
                    content = item.name;
                }
            })
            return <div title={content}
            style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow:'hidden'}}> {content} </div>
        } else if(name == 'restoreState'){
            let state = '';
            switch(rowData[name]) {
                case '001': 
                    state = '恢复中';
                    break;
                case '002': 
                    state = '恢复成功';
                    break;   
                case '003': 
                    state = '恢复失败';
                    break; 
            }
            return <span title={state}> {state} </span>
        } else {
            if (name == 'option') {
                return (
                    <div>
                        <a href='javascript:;' onClick={() => this.handleAClick(rowData)}>进入账套</a>
                        <span style={{margin: '0px 4px'}}>|</span>
                        <a href='javascript:;' onClick={() => this.delZt(rowData)}>删除</a>
                    </div>
                )
            } else {
                return <div title={rowData[name]}>{rowData[name]}</div>
            }
        }
    }

    //进入账套
    handleAClick = (rowData) => {
        let dzCustomerName = rowData.financeOrgName + '备份';
        this.props.setGlobalContent({
            name:dzCustomerName,
            appName:'edfx-app-portal',//edfx-app-portal
            params:{},
            orgId:rowData.id
            // showHeader:true
        })
    }

    //删除账套
    delZt = async (rowData) => {
        const ret = await this.metaAction.modal('confirm', {
            title: '删除账套',
            content: '删除后数据将无法进行恢复，确认是否删除？'
        });
        if (ret) {
            LoadingMask.show({background: 'rgba(230,247,255,0.5)'})
            let option = {
                "orgId":rowData.orgId,
                "id":rowData.id,
            }
            let response = await this.webapi.deleteFzt(option);
            if(response){
                this.metaAction.toast('success', '删除成功！');
                this.props.load();
            }else {
                this.metaAction.toast('warn', '删除失败！');
                this.props.load();
            }
        }
        LoadingMask.hide()
    }
    
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.props;
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
            }
        }
        // this.injections.reduce('tableLoading', true)
        // this.injections.reduce('update',{path:'data.pagination',value:pagination});
        this.props.setMea('data.pagination',pagination);
        // this.metaAction.sf('data.pagination', fromJS(pagination))
        this.props.load();
    }

    render = () => {
        const { pagination, list, name } = this.props,
              loading = this.metaAction.gf('data.loading'),
              _columns = this.renderColumns();
        return (
            <div className='ttk-es-app-ztmanage-regain-query-ward'>
                <div className='ttk-es-app-ztmanage-regain-query-top'>
                    {name}
                </div>
                <div className='ttk-es-app-ztmanage-regain-query-tablediv'>
                    <Table 
                        lazyTable={true}
                        emptyShowScroll={true}
                        loading={loading}
                        pagination={false}
                        scroll={{y:true}}
                        enableSequenceColumn={false}
                        bordered={true}
                        dataSource={list}
                        columns={_columns}
                        className={'ttk-es-app-ztmanage-regain-query-Body'}
                        />
                    <div className='ttk-es-app-ztmanage-regain-query-footer'>
                        <div className='right'>
                            <span> {"共" + pagination.totalCount + "条记录"} </span>
                            <Pagination 
                                pageSizeOptions={[ '50', '100', '200','300']}
                                pageSize={pagination.pageSize}
                                current={pagination.currentPage}
                                total={pagination.totalCount}
                                onChange={this.pageChanged}
                                onShowSizeChange={this.pageChanged}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default renderTableComponent