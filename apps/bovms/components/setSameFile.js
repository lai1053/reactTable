import React from 'react'
import { Table, Pagination } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { Input } from 'antd'
const { Search } = Input;

class SetSameFile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {
                currentPage: 1, //-- 当前页
                pageSize: 50, //-- 页大小
                totalCount: 50, //-- 总计
                totalPage: 1, //-- 总页数
            },
            tableData: [],
            columns: [{
                    title: '档案编号',
                    align: 'center',
                    key: 'code',
                    dataIndex: 'code',
                    width: 100,
                },
                {
                    title: '档案名称',
                    align: 'center',
                    key: 'name',
                    dataIndex: 'name',
                    width: 120,
                },
                {
                    title: '规格型号',
                    align: 'center',
                    key: 'specification',
                    dataIndex: 'specification',
                    width: 100,
                },
                {
                    title: '计量单位组',
                    align: 'center',
                    key: 'unitName',
                    dataIndex: 'unitName',
                    width: 80,
                }, {
                    title: '存货类型',
                    align: 'center',
                    key: 'propertyName',
                    dataIndex: 'propertyName',
                    width: 100,
                }, {
                    title: '存货科目',
                    align: 'center',
                    key: 'inventoryRelatedAccountName',
                    dataIndex: 'inventoryRelatedAccountName',
                    width: 120,
                }
            ],
            selectedRowKeys: [],
            cacheData: [],
        }
        this.webapi = props.webapi || {};
        this.metaAction = props.metaAction || {};
        this.module = props.module;
        props.setOkListener && props.setOkListener(this.onOk)
    }
    componentDidMount = async () => {
        const res = await this.webapi.bovms.queryInventoryDtoList({ isEnable: true });
        if (res) {
            this.setState({ cacheData: res, filterData: null }, () => {
                this.pageChanged();
            })
        }
    }
    onOk = async () => {
        const { selectedRowKeys, dataSource } = this.state;
        // console.log('selectedRowKeys:', selectedRowKeys)
        if (selectedRowKeys[0] > -1) {
            const item = dataSource.find(f => f.id == selectedRowKeys[0])
            if (item && item.inventoryRelatedAccountId) {
                const res = await this.webapi.bovms.getAccountById({ id: item.inventoryRelatedAccountId })
                if (res && res.glAccount && res.glAccount.id) {
                    // 如果只有存货核算项目的，则添加，否则科目置空
                    const calcList = Object.keys(res.glAccount).filter(f => (f !== 'isCalc' && f.indexOf('Calc') > 0 && res.glAccount[f] === true)).map(m => m.replace('isCalc', '').toLocaleLowerCase()) || []
                    if (!res.glAccount.isCalc || (
                            res.glAccount.isCalc && calcList.length === 1 && calcList[0] === 'inventory'
                        )) {
                        item.inventoryRelatedAccountCode = res.glAccount.code;
                        item.inventoryRelatedAccountName = res.glAccount.gradeName;
                        if (res.glAccount.isCalc) {
                            // 只有存货核算项目，则辅助核算项目为当前的存货档案
                            item.isCalcInventory = true;
                            item.assistList = [{ id: item.id, name: item.name, type: 'calcInventory' }]
                        }
                    } else {
                        item.inventoryRelatedAccountId = undefined;
                        item.inventoryRelatedAccountCode = undefined;
                        item.inventoryRelatedAccountName = undefined;
                    }
                }
                return item;
            }
            return item
        }
        this.metaAction.toast('error', '请选择存货档案');
        return false;
    }

    onSearch(val) {
        // console.log(val);
        let { pagination, cacheData, filterData } = this.state;
        val = val ? val.toLocaleLowerCase() : val;
        filterData = val ? cacheData.filter(f => (f.name && f.name.toLocaleLowerCase().indexOf(val) > -1) || (f.specification && f.specification.toLocaleLowerCase().indexOf(val) > -1)) : null;
        this.setState({ filterData }, () => {
            this.pageChanged(1);
        })
    }

    pageChanged = (current, pgSize) => {
        let { pagination, cacheData, filterData } = this.state;
        const detailList = filterData || cacheData;
        let { currentPage, pageSize, totalCount, totalPage } = (pagination || {});
        let dataSource = [];
        pageSize = pgSize || pageSize || 50; //-- 页大小
        totalCount = detailList.length || 0;
        totalPage = Math.ceil(totalCount / pageSize);
        currentPage = current || currentPage || 1; //-- 当前页
        if (currentPage > totalPage) {
            currentPage = totalPage;
        }
        dataSource = detailList.slice(currentPage - 1, currentPage * pageSize);
        pagination = { currentPage, pageSize, totalCount, totalPage };

        this.setState({
            pagination,
            dataSource,
            selectedRowKeys: [],
        });
    }
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
    }
    render() {
        const { dataSource, pagination, selectedRowKeys, columns } = this.state;
        const rowSelection = {
            type: 'radio',
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
        };
        return (
            <div className="bovms-app-set-same-file">
                <Search  className="-search" placeholder="请输入档案名称或规格型号" onSearch={this.onSearch.bind(this)} style={{ width: 230 }} />
                <Table 
                    className='bovms-app-purchase-list-table'
                    rowSelection={rowSelection}
                    columns={columns} 
                    dataSource={dataSource} 
                    bordered 
                    rowKey="id"
                    scroll={{y:385}} 
                    pagination={false}
                    style={{minHeight:'385px'}}
                    onRow = { record => {
                            return {
                                onClick: event => { 
                                    this.setState({selectedRowKeys:[record.id]})
                                }
                            }
                        }
                    }
                >
                </Table>
                <Pagination
                    pageSizeOptions={['50', '100', '200', '300']}
                    pageSize= {pagination.pageSize}
                    current= {pagination.currentPage}
                    total= {pagination.totalCount}
                    onChange= {this.pageChanged}
                    onShowSizeChange= {this.pageChanged}
                    showTotal={total=><span>共{total}条记录</span>}
                />
            </div>
        )
    }
}

export default SetSameFile