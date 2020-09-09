import React, { Component } from 'react'
import config from '../config';
import { Table } from 'edf-component'

class renderTableComponent extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            loading : false,
            onece : true,
        }
        this.config = config.current;
        this.webapi = this.config.webapi;
        this.metaAction = this.props.metaAction;
       
    }

    componentDidMount = async () => {
        this.mounted = true;
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }
    //暂无数据的提示
    getEmptyText = () => {
        const accountCode = this.metaAction.gf('data.accountCode')
        return (
            <div>
                <div style={{marginBottom:'10px'}}>暂无统计数据</div>
                <div style={{display:accountCode=='2'?'block':'none'}}>请每月2号进行查看相关数据！</div>
            </div>)
    }

    renderColumns =()=> {
        const columns = this.metaAction.gf('data.other.tableColumns').toJS()
		const resArr = []
		columns.forEach((item, index) => {
            if (item.children) {
                const child = [] // 多表头
                item.children.forEach(subItem => {
                    child.push({
                        title: subItem.caption,
                        dataIndex: subItem.fieldName,
                        key: subItem.fieldName,
                        width: subItem.width,
                        align: subItem.align,
                        // className: subItem.className,
                        // render: (text, record) =>
                        // this.renderTaxAmount(text, record, subItem)
                    })
                })
                resArr.push({
                    title: item.caption,
                    align: item.align,
                    children: child
                })
            }else{
                let obj = {
                    name: item.fieldName,
                    title:item.caption,
                    dataIndex: item.fieldName,
                    width: item.width,
                    align: item.fieldName == 'personName'? 'left':'center',
                    render: (text, v, index, record) => {return this.handleRenderText(item.fieldName, v, index,record)}
                }
                resArr.push(obj)
            }
		})
		return resArr
    }
    
    handleRenderText = (name, rowData, index,record) => {
        // console.log(name, rowData, index)
        if(name == 'personName') {
            return <div title={rowData[name]}
            style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow:'hidden'}}>{rowData[name]}</div>
        }else if(name == 'option') {
            return <a href='javascript:;' onClick={() => this.goList(rowData,'1')}>查看</a>
        }else if(name == 'option1') {
            return <div>
                        <a href='javascript:;' onClick={() => this.goList(rowData,'2')}>进度详情</a>
                        <span style={{margin: '0px 4px'}}>|</span>
                        <a href='javascript:;' onClick={() => this.goList(rowData,'3')}>台账详情</a>
                  </div>
        }else{
            return <span title={rowData[name]}>{rowData[name]}</span>
        }
    }

    goList = (rowData,type) => {
        const year = this.metaAction.gf('data.year'),
              month = this.metaAction.gf('data.month'),
              userId = rowData.userId,
              isTypesAll = true,
              orgId = this.props.orgId;
        let appName = '',
            title = '';
            params = {
                year:year,
                month: month,
                userId: userId,
                isTypesAll: isTypesAll
            }
        switch (type) {
            case '1' :
                appName = "ttk-es-app-jzjdlist";
                title = "记账进度";
                break;
            case '2' :
                appName = "ttk-es-app-taxdeclaration";
                title = "申报进度";
                break;
            case '3' :
                appName = "ttk-es-app-sbselist";
                title = "申报台账";
                break;
        } 
        // this.props.setGlobalContent({ appName, params })
        this.props.setGlobalContent({
			name: title,
			appName: appName,
			params: params,
            orgId: orgId,
            token:true
        });
    }

    render = () => {
        // console.log(this.state);
        const list = this.props.list,
              _columns = this.renderColumns(),
              _emptyText = this.getEmptyText();
        return (
            <Table 
                lazyTable={true}
                emptyText={_emptyText}
                emptyShowScroll={true}
                // loading={loading}
                pagination={false}
                scroll={{y:true}}
                enableSequenceColumn={false}
                bordered={true}
                dataSource={list}
                columns={_columns}
                className={'ttk-es-app-job-account-Body'}
            />
        )
    }
}

export default renderTableComponent