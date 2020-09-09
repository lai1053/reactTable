import React, { Component } from 'react'
import config from '../config';
import CustomerClass from './CustomerClass';
import TableComponent from './Table';
import { Pagination,Spin,Tabs } from 'edf-component'


class renderRightComponent extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            accountCode: '1',
            dateStr:''
        }
        this.config = config.current;
        this.webapi = this.config.webapi;
        this.metaAction = this.props.metaAction;
       
    }

    componentDidMount = async () => {
        this.setState({
            accountCode: this.props.accountCode
        })
    }
    componentWillUnmount = () => {
    }
    componentWillUpdate = (nextProps,nextState) => {
        // if(!isEqual(nextProps.accountCode, this.props.accountCode)){
        //     const year = this.metaAction.gf("data.year"),
        //           month = this.metaAction.gf("data.month"),
        //           dateStr = year+'-'+month;
        //     this.setState({
        //         date: moment(dateStr)
        //     })
        // }
        // console.log('finishmark',nextProps.finishmark)
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
        this.props.setMea('data.pagination',pagination);
		// this.injections.reduce('update',{path:'data.pagination',value:pagination});
        this.props.load();
    }

    tabChange = (e) => {
        this.setState({
            accountCode: e
        })
        let date=new Date();
        let years=date.getFullYear();
        let months=date.getMonth();
        if(e==3){
            // years = (months==0 ? years-1:years);
            months = ((months+1)<10 ? "0"+(months+1):(months+1));
        }else{
            years = (months==0 ? years-1:years);
            months = (months==0 ? 12:(months<10 ? "0"+months:months));
        }

      
        this.props.setMea('data.inputval','');
        this.props.setMea('data.year',years);
        this.props.setMea('data.month',months);
        this.props.setMea('data.accountCode',e);
        this.props.load();
    }

    getEnabledDate = (accountCode) => {
        let enabledDate = '';
        accountCode == 1 ? enabledDate = '2015-12' :
        accountCode == 2 ? enabledDate = '2020-01' :  enabledDate = '2018-12';
        return enabledDate;
    }

    getNewDate = () => {
        const accountCode = this.state.accountCode;
        let date=new Date();
        let years=date.getFullYear();
        let months=date.getMonth();
        
        years = (months==0 ? years-1:years);
        months = (months==0 ? 12:(months<10 ? "0"+months:months));
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        const dateStr = year+'-'+month;
        return dateStr;
    }

    render = () => {
        let { load, setMea, list, pagination, loading, setGlobalContent, finishmark, orgId } = this.props;
        let { accountCode } = this.state;
        let enabledYearAndMonth=this.getEnabledDate(accountCode);
        const dateStr = this.getNewDate();
        // console.log(accountCode);
        return (
            <div className='ttk-es-app-job-account-right'>
                <Spin spinning={loading} size={'large'} tip={'数据加载中...'} delay={1} wrapperClassName={'spin-box'}>
                    <Tabs className='account-batch-nav' onChange={this.tabChange} activeKey={accountCode}>
                        <Tabs.TabPane tab="记账统计" key={'1'}/>
                        <Tabs.TabPane tab="工作量统计" key={'2'}/>
                        <Tabs.TabPane tab="申报统计" key={'3'}/>
                    </Tabs>
                    <CustomerClass
                        load={load}
                        setMea={setMea}
                        enabledYearAndMonth={enabledYearAndMonth}
                        date={dateStr}
                        metaAction={this.metaAction}
                        accountCode={accountCode}
                        finishmark={finishmark}
                    />
                    <div className='ttk-es-app-job-account-tablediv'>
                        <TableComponent
                            list={list}
                            metaAction={this.metaAction}
                            setGlobalContent={setGlobalContent}
                            setMea={setMea}
                            orgId={orgId}
                        />
                        <div className='ttk-es-app-job-account-footer'>
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
                </Spin>
            </div>
        )
    }
}

export default renderRightComponent