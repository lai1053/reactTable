import React from 'react'
import { DataGrid, Button, Input, Row, Col, Pagination } from 'edf-component'
import { Select } from 'antd'
const { Search } = Input
import SelectSubject from './selectSubject';
import SetSameSubject from './setSameSubject'
import BatchAddAidSubject from './batchAddAidSubject'
import BatchAddSubject from './batchAddSubject'
import SelectAssist from '../selectAssist';
const Cell = DataGrid.Cell;
import renderDataGridCol from '../column/index';
import { setListEmptyVal } from "../../utils/index";


class FundBatchSubjectSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sourceData: [], //源数据
            resultData: [], //搜索结果
            tableData: [], //表格数据
            partyAcctOrSummaryName: '',
            flowfundType: null,
            page: 1,
            pageSize: 50,
            loading: false,
            selectedRowKeys: []
        }
        this.cacheData = []
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {};
        //会计月份
        this.yearPeriod = parseInt(props.metaAction.gf('data.filterData.yearPeriod').replace(/-/, ''));
        //银行账号
        this.bankAcctId = props.bankAcctId || props.metaAction.gf('data.filterData.bankAcctId');
        this.idList = [];
        this.dataGridKey = `fund-datagrid-${new Date().valueOf()}`;
    }

    onCancel = (e) => {
        this.props.onCancel && this.props.onCancel();
        this.props.closeModal && this.props.closeModal();
    }

    onOk = async (e) => {
        let params = {
            yearPeriod: this.yearPeriod,
            bankAcctId: this.bankAcctId,
            list: setListEmptyVal(this.cacheData),
            idList: this.idList
        };
        let res = await this.webapi.funds.saveBankFlowsWhenBatchSetup(params);
        if (res === null) {
            this.props.metaAction.toast('success', '设置成功')
            this.props.onCancel && this.props.onCancel();
            this.props.closeModal && this.props.closeModal('needReload');
        }
    }


    async getData() {
        this.setState({
            loading: true
        })
        let selectedRowKeys = this.props.metaAction.gf('data.tableData.selectedRowKeys').toJS();
        let { partyAcctOrSummaryName, flowfundType, page, pageSize } = this.state;
        let { isSelectedAll } = this.props;
        let params = {
            isSelectedAll: isSelectedAll, //是否全选
            entity: {
                yearPeriod: this.yearPeriod,
                bankAcctId: this.bankAcctId,
            }
        }
        if (isSelectedAll === 'N') {
            params.ids = selectedRowKeys
        }

        let res = await this.webapi.funds.queryBankFlowsWhenBatchSetup(params);
        if (res) {
            this.cacheData = res.list.map((e, i) => {
                e.id = i
                return e
            })
            this.idList = res.idList;
            this.initData();
            this.setState({
                loading: false
            })
        }
    }


    initData() {
        let { page, pageSize } = this.state
        let start = (page - 1) * pageSize;
        this.setState({
            sourceData: this.cacheData,
            resultData: this.cacheData,
            tableData: this.cacheData.slice(start, start + pageSize)
        }, () => {
            this.onPressEnter();
        }
        );
    }

    componentDidMount() {
        this.getData()
    }


    async handleMenuClick(key) {
        switch (key) {
            case "setSameSubject":
                this.openSetSameSubject()
                break;
            case "batchAddSubject":
                this.openBatchAddSubject();
                break;
            case "batchAddAidProject":
                this.openBatchAddAidProject();
                break;
            default:
                break
        }
    }
    async openSetSameSubject() {
        let { selectedRowKeys } = this.state
        if (!selectedRowKeys.length) {
            return this.metaAction.toast("error", "请先选择需要设置的数据");
        }

        let res = await this.props.metaAction.modal("show", {
            title: "批量设置",
            width: 400,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-set-same-subject",
            children: (
                <SetSameSubject
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    module={this.module}
                />
            )
        }
        );
        if (res) {
            selectedRowKeys.forEach(e => {
                let dItem = this.cacheData.find(f => f.id === e);
                dItem.acct10Or20Id = res.id;
                dItem.acct10Or20Code = res.code;
                dItem.acct10Or20Name = res.gradeName;
                dItem.acct10Or20CiName = res.assistList && res.assistList.length ? JSON.stringify({ assistList: res.assistList }) : "";
            });
            this.initData()
            this.setState({
                selectedRowKeys: []
            });
            this.props.metaAction.toast("success", "设置成功");
        }
    }
    async openBatchAddSubject() {
        let { selectedRowKeys } = this.state
        if (!selectedRowKeys.length) {
            return this.metaAction.toast("error", "请先选择需要设置的数据");
        }

        let propData = selectedRowKeys.map(e => {
            let dItem = this.cacheData.find(f => f.id === e);
            return dItem.counterpartyName
        });

        let res = await this.props.metaAction.modal("show", {
            title: "批量新增往来科目",
            width: 700,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-set-same-subject",
            footer: false,
            children: (
                <BatchAddSubject
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    subjectItems={propData}
                />
            )
        }
        );
        if (res) {
            selectedRowKeys.forEach((e, i) => {
                let dItem = this.cacheData.find(f => f.id === e);
                if(res[i]){
                    dItem.acct10Or20Id = res[i].id;
                    dItem.acct10Or20Code = res[i].code;
                    dItem.acct10Or20Name = res[i].gradeName;
                    dItem.acct10Or20CiName = '';
                }
            })
            this.initData()
            this.setState({
                selectedRowKeys: []
            });
        }
    }
    async openBatchAddAidProject() {
        let { selectedRowKeys } = this.state
        if (!selectedRowKeys.length) {
            return this.metaAction.toast("error", "请先选择需要设置的数据");
        }

        let propData = selectedRowKeys.map(e => {
            let dItem = this.cacheData.find(f => f.id === e);
            return dItem.counterpartyName
        });

        let res = await this.props.metaAction.modal("show", {
            title: "批量新增辅助项目",
            width: 600,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-batch-add-aid-subject",
            footer: false,
            children: (
                <BatchAddAidSubject
                    webapi={this.props.webapi}
                    metaAction={this.props.metaAction}
                    selectedRowKeys={selectedRowKeys}
                    subjectItems={propData}
                />
            )
        });
        if (res) {
            selectedRowKeys.forEach((e, i) => {
                let dItem = this.cacheData.find(f => f.id === e);
                if(res.aidSubject[i]){
                    dItem.acct10Or20Id = res.subject.id;
                    dItem.acct10Or20Code = res.subject.code;
                    dItem.acct10Or20Name = res.subject.gradeName;
                    dItem.acct10Or20CiName = `{"assistList":[{"id":"${res.aidSubject[i].id}","name":"${res.aidSubject[i].name}","type":"${res.aidType}"}]}`;
                }
            })

            // res.selectedRowKeys.forEach((e, i) => {
            //     let dItem = this.cacheData.find(f => f.id === e);
            //     dItem.acct10Or20Id = res.subject.id;
            //     dItem.acct10Or20Code = res.subject.code;
            //     dItem.acct10Or20Name = res.subject.gradeName;
            //     dItem.acct10Or20CiName = `{"assistList":[{"id":"${res.aidSubject[i].id}","name":"${res.aidSubject[i].name}","type":"${res.aidType}"}]}`;
            // });
            this.initData()
            this.setState({
                selectedRowKeys: []
            });
        }
    }
    onChangeSelectedRowKeys(keys) {
        this.setState({
            selectedRowKeys: keys
        });
    }
    //搜索
    onSearch(val) {
        let { sourceData } = this.state
        let partyAcctOrSummaryName = val.trim();
        if (partyAcctOrSummaryName == '') {
            this.setState({
                resultData: sourceData,
                tableData: sourceData.slice(0, this.state.pageSize)
            })
        } else {
            let newArr = sourceData.filter(e => e['counterpartyName'].includes(partyAcctOrSummaryName))
            this.setState({
                page: 1,
                resultData: newArr,
                tableData: newArr.slice(0, this.state.pageSize),
                total: newArr.length
            })
        }
    }
    //分页
    onPageChange(page) {
        this.setState({
            page: page,
            tableData: this.state.resultData.slice((page - 1) * this.state.pageSize, page * this.state.pageSize),
        })
    }
    //每页显示条数
    onSizeChange(current, size) {
        this.setState({
            pageSize: size,
            page: 1
        }, () => {
            this.setState({
                tableData: this.state.resultData.slice((this.state.page - 1) * this.state.pageSize, this.state.page * this.state.pageSize),
            })
        })
    }
    //全选
    onSelectChange = (val) => {
        this.setState({
            selectedRowKeys: val
        })
    }
    onChangeSelectedRowKeys(keys) {
        this.setState({
            selectedRowKeys: keys
        })
    }

    // 输入框
    inputOnChange = val => {
        this.setState({
            partyAcctOrSummaryName: val.target.value
        })
    }


    dataFilter(data) {
        const { flowfundType } = this.state;
        let arr = [].concat(data)
        if (flowfundType) {
            arr = data.filter(e => e.flowfundType === flowfundType)
        }
        return arr
    }

    onPressEnter = () => {
        const { partyAcctOrSummaryName, sourceData, pageSize } = this.state;
        if (partyAcctOrSummaryName == '') {
            //根据过滤条件 过滤一遍数据
            let filterData = this.dataFilter(sourceData);
            this.setState({
                resultData: filterData,
                tableData: filterData.slice(0, pageSize),
                //selectedRowKeys: []
            })
        } else {
            //根据过滤条件 过滤一遍数据
            let filterData = this.dataFilter(sourceData);

            let newArr = filterData.filter(e => e.counterpartyName.includes(partyAcctOrSummaryName))
            this.setState({
                page: 1,
                resultData: newArr,
                tableData: newArr.slice(0, pageSize),
                // selectedRowKeys: []
            })
        }
    }
    onSelect(val) {
        this.setState({
            flowfundType: val,
            selectedRowKeys: []
        }, () => {
            this.onPressEnter()
        })
    }

    onCell = record => {
        return {
            onClick: event => {
                const { selectedRowKeys } = this.state;
                const index = selectedRowKeys.findIndex(f => f.toString() === record.id.toString())
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.id)
                }
                this.setState({ selectedRowKeys })
            }
        };
    }

    async handleSelectClick(key, selectedRowKeys) {
        let { tableData, sourceData } = this.state;
        switch (key) {
            case 'selectPage':
                this.setState({
                    selectedRowKeys: tableData.map(e => e.id)
                })
                return;
            case 'selectAll':
                let filterData = this.dataFilter(sourceData);
                console.log('filterData',filterData)
                this.setState({
                    selectedRowKeys: filterData.map(e => e.id)
                })
                return;
            case 'cancelSelect':
                this.setState({
                    selectedRowKeys: []
                })
                return;
        }
    }

    getColumns() {
        let { tableData, selectedRowKeys } = this.state,
            colOption = { dataSource: tableData, selectedRowKeys, width: 100, fixed: false, align: 'center', className: '', flexGrow: 0, lineHeight: 37, isResizable: false },
            { isSelectedAll } = this.props
        let columns = [{
            width: 60,
            dataIndex: 'id',
            columnType: 'allcheck',
            onMenuClick: e => this.handleSelectClick(e.key, selectedRowKeys),
            onSelectChange: keys => this.setState({ selectedRowKeys: keys })
        }, {
            width: 180,
            title: '对方户名',
            dataIndex: 'counterpartyName',
            textAlign: "left",
        }, {
            width: 180,
            title: '对方账号',
            dataIndex: 'counterpartyAcct',
            textAlign: "left",
        }, {
            width: 100,
            title: isSelectedAll === 'N' ? '支出流水' : '付款流水数',
            dataIndex: 'paymentFlow',
            render: (text, record) => record.flowfundType === 2 && record.flowTotalQty
        }, {
            width: 100,
            title: isSelectedAll === 'N' ? '收入流水' : '收款流水数',
            dataIndex: 'receiveFlow',
            render: (text, record) => record.flowfundType === 1 && record.flowTotalQty
        }, {
            title: '会计科目',
            dataIndex: 'subject',
            flexGrow: 1,
            textAlign: "left",
            render: (text, record, index) => this.renderCell(text, record, index)
        }]
        return columns.map(m => renderDataGridCol({ ...colOption, ...m }));
    }

    renderCell = (text, record, index) => {
        let assistJSON = record.acct10Or20CiName,
            defaultItem = {},
            value = record.acct10Or20Id,
            title = '',
            subjectName = record.acct10Or20Name,
            acctName = record.counterpartyName;


        //判断是否已设置多个科目
        if (subjectName === '已设置多个科目') {
            title = `${record['acct10Or20Name']}`
            value = ''
        } else {
            title = `${record['acct10Or20Code'] || ''} ${record['acct10Or20Name'] || ''}`;
        }

        //判断是否已设置多个辅助项目
        if (assistJSON != '已设置多个辅助项') {
            let assistListObj = assistJSON ? JSON.parse(assistJSON) : {};
            let assistList = assistListObj.assistList;
            //拼接辅助项到title
            title += ` ${assistList ? '/' : ''}${assistList ? assistList.map(m => m.name).join('/') : ''}`
        } else {
            assistJSON = ''
        }
        let isCanSelectAssist = JSON.parse(assistJSON || '{}').assistList;

        defaultItem.id = value;
        defaultItem.codeAndName = title
        return record.editing ? (
            <SelectSubject
                key={index}
                onBlur={this.toggleEdit.bind(this, index)}
                value={value}
                metaAction={this.metaAction}
                store={this.store}
                autoExpand={true}
                webapi={this.webapi}
                onChange={value => this.handleChange(value, record.id)}
                defaultItem={defaultItem}
                subjectName={acctName}
                noShowSelectAssist
            />
        ) : (
                <div className="editable-cell"
                    className={isCanSelectAssist ? "editable-cell-value-wrap bovms-select-subject-container no-right-padding" : "editable-cell-value-wrap"}
                    onClick={this.toggleEdit.bind(this, index)}
                    title={title}
                >
                    <span className={isCanSelectAssist ? "subject-value" : ''}>{title}</span>
                    {
                        isCanSelectAssist ?
                            <a className="assist-btn"
                                unSelectable="on"
                                onClick={e => this.openSelectAssist(e, value, assistJSON, record.counterpartyName, record)}>辅助</a>
                            : null
                    }
                </div>
            );
    }

    toggleEdit(index) {
        let { tableData } = this.state;
        tableData[index].editing = !tableData[index].editing
        this.setState({
            tableData
        })
    }

    handleChange(val, id) {
        let data = this.cacheData
        let dItem = data.find(f => f.id === id);
        dItem.acct10Or20Id = val.id;
        dItem.acct10Or20Code = val.code;
        dItem.acct10Or20Name = val.gradeName;
        dItem.acct10Or20CiName = val.assistList && val.assistList.length ? JSON.stringify({ assistList: val.assistList }) : '';
        this.initData()
    }

    onRowClick(e, index) {
        const columnKey = e && e.target && e.target.attributes["columnKey"];
        if (columnKey && columnKey.value) {
            let { selectedRowKeys, tableData } = this.state,
                key = tableData[index]["id"];
            if (selectedRowKeys.includes(Number(key))) {
                selectedRowKeys = selectedRowKeys.filter(
                    f => f !== Number(key)
                );
            } else {
                selectedRowKeys.push(Number(key));
            }
            this.setState({
                selectedRowKeys
            })
        }
    }

    async openSelectAssist(e, value, assistJSON, subjectName, record) {
        e && e.preventDefault && e.preventDefault();
        e && e.stopPropagation && e.stopPropagation();

        let item = {
            id: value,
            assistList: JSON.parse(assistJSON || '{}').assistList,
        }

        const res = await this.props.metaAction.modal('show', {
            title: '选择辅助项目',
            width: 450,
            style: { top: 25 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: (
                <SelectAssist
                    item={item}
                    store={this.store}
                    metaAction={this.metaAction}
                    module='funds'
                    webapi={this.webapi}
                    subjectName={subjectName}
                    isNeedQuerySubject
                >
                </SelectAssist>
            )
        });
        if (res && res.assistList) {
            this.handleChange({
                id: record['acct10Or20Id'],
                code: record['acct10Or20Code'],
                gradeName: record['acct10Or20Name'],
                assistList: res.assistList,
            }, record.id);
        } else {
            // 暂不做处理
        }
    }
    onVerticalScroll() {
        let { tableData } = this.state
        if (tableData.some(s => s.editing)) {
            return false;
        }
        return true;
    }
    render() {
        const { selectedRowKeys, loading, tableData, resultData, partyAcctOrSummaryName, flowfundType, page, pageSize } = this.state;

        const _columns = this.getColumns();
        return (
            <div className="bovms-batch-subject-setting-debit">
                <Row className='bovms-common-actions-header'>
                    <Col span={12} className='flex-start-center'>
                        <Search
                            placeholder='请输入对方名称'
                            style={{ width: '230px', transform: 'translateY(-1px)' }}
                            value={partyAcctOrSummaryName}
                            onChange={this.inputOnChange.bind(this)}
                            onPressEnter={this.onPressEnter.bind(this)}
                            onSearch={this.onPressEnter.bind(this)} />
                        <Select onChange={this.onSelect.bind(this)} style={{ width: '80px' }} value={flowfundType}>
                            <Select.Option key='null' value={null}>全部</Select.Option>
                            <Select.Option key='1' value={1}>收款</Select.Option>
                            <Select.Option key='2' value={2}>付款</Select.Option>
                        </Select>
                    </Col>
                    <Col span={12} className="bovms-batch-subject-setting-debit-right" style={{ textAlign: 'right' }}>
                        <Button type="primary" onClick={this.handleMenuClick.bind(this, 'setSameSubject')}>批量设置</Button>
                        <Button onClick={this.handleMenuClick.bind(this, 'batchAddSubject')}>批增会计科目</Button>
                        <Button onClick={this.handleMenuClick.bind(this, 'batchAddAidProject')}>批增辅助项目</Button>
                    </Col>
                </Row>

                <DataGrid
                    loading={loading}
                    key={this.dataGridKey}
                    headerHeight={37}
                    rowHeight={37}
                    footerHeight={0}
                    rowsCount={(tableData || []).length}
                    columns={_columns}
                    style={{ width: '100%', height: '350px' }}
                    onVerticalScroll={this.onVerticalScroll.bind(this)}
                    rowClassNameGetter={() => 'editable-row'}
                    ellipsis
                    onRowClick={this.onRowClick.bind(this)}
                />
                <div className='bovms-common-table-style-footer'>
                    <div>
                        已选择<strong>{selectedRowKeys.length}</strong>条
                    </div>
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        onChange={this.onPageChange.bind(this)}
                        pageSizeOptions={['50', '100', '200', '300']}
                        onShowSizeChange={this.onSizeChange.bind(this)}
                        style={{ textAlign: 'right' }}
                        total={this.state.resultData.length}
                        showTotal={total => `共${total}条记录`}
                    />
                </div>
                <div className='bovms-app-actions-footer'>
                    <div class='bovms-app-actions-footer-tip'>

                    </div>
                    <div>
                        <Button type="primary" onClick={this.onOk}>确定</Button>
                        <Button onClick={this.onCancel}>关闭</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default FundBatchSubjectSetting