import React from 'react'
import { DataGrid, TableSort, Input, Select, Tooltip, Icon, TableSettingCard, Checkbox, Dropdown, Menu } from 'edf-component';
import { fromJS, toJS } from 'immutable';
import SelectSubject from './selectSubject';
import { number } from 'edf-utils';
import { setListEmptyVal, addEvent, removeEvent } from '../../utils/index';
import renderDataGridCol from '../column/index';
import moment from 'moment'
const Cell = DataGrid.Cell;
import SplitStatement from './splitStatement'

import cancelIcon from '../../img/cancel-icon.png';
import certificateIcon from '../../img/certificate-icon.png';
import editIcon from '../../img/edit-icon.png';
import invoicesIcon from '../../img/invoices-icon.png';
import popEditIcon from '../../img/pop-edit-icon.png';
import saveIcon from '../../img/save-icon.png';
import splitIcon from '../../img/split-icon.png';

export default class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {};
        this.cacheData = ((props.data || {}).tableSource || []).map(item => ({ ...item }));
        this.defaultTableSetting = [
            { id: 'billDate', caption: '交易日期', isVisible: true, isMustSelect: true, width: 140, },
            { id: 'counterpartyName', caption: '对方户名', isVisible: true, isMustSelect: false, width: 180, },
            { id: 'counterpartyAcct', caption: '对方账号', isVisible: false, isMustSelect: false, width: 160, },
            { id: 'summary', caption: '交易摘要', isVisible: true, isMustSelect: false, width: 160 },
            { id: 'paymentAmount', caption: '付款金额', isVisible: true, isMustSelect: true, width: 100, },
            { id: 'collectAmount', caption: '收款金额', isVisible: true, isMustSelect: true, width: 100, },
            { id: 'subject', caption: '会计科目', isVisible: true, isMustSelect: true, width: 190, },
            { id: 'vchNum', caption: '凭证号', isVisible: true, isMustSelect: true, width: 80, },
            { id: 'operation', caption: '操作', isVisible: true, isMustSelect: true, width: 90, },
        ];
        this.dataGridKey = `fund-datagrid-${new Date().valueOf()}`;
        this.state = {
            // editingKey: '',
            tableSetting: false,
            cacheSelectKeys: [],
            tableSize: { width: 2000, height: document.body.offsetHeight - 244 || 0 },
            // tableSettingData: JSON.parse(JSON.stringify(this.defaultTableSetting)),
        };
    }
    componentDidMount() {
        addEvent(window, 'resize', :: this.onResize);
        this.onResize();
    }
    componentWillUnmount() {
        removeEvent(window, 'resize', this.onResize);
    }
    onResize(e) {
        setTimeout(() => {
            const cn = `bovms-app-purchase-list`,
                table = document.getElementsByClassName(cn)[0],
                scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent) ? 20 : 12;
            if (table) {
                let h = table.offsetHeight - 104 - scrollHeight, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth;
                this.setState({ tableSize: { width: w, height: h } })
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    getTableSettingData() {
        let tableSettingData = this.metaAction.gf('data.tableData.tableSettingData') && this.metaAction.gf('data.tableData.tableSettingData').toJS() || [];
        if (Array.isArray(tableSettingData) && tableSettingData.length < 1) {
            tableSettingData = this.defaultTableSetting;
        }
        return tableSettingData
        // this.setState({ tableSettingData });
    }
    getCellByColumn = ({ column, value, mxKey, row, onChange }) => {
        const { metaAction, webapi, store } = this.props;

        switch (column) {
            case 'acct10Id': //借方科目
            case 'acct20Id': //贷方科目
                let assistJSON = '{}',
                    defaultItem = {
                        id: value,
                    },
                    subjectName = null,
                    acctName = row.counterpartyName;
                //收款类型为1取贷方科目 为2取借方科目
                if (row.flowfundType === 1) {
                    defaultItem.codeAndName = `${row.mxDtoList[mxKey]['acct20Code']} ${row.mxDtoList[mxKey]['acct20Name']}`;
                    assistJSON = row.mxDtoList[mxKey]['acct20CiName'];
                    subjectName = row.mxDtoList[mxKey]['acct20Name']
                } else {
                    defaultItem.codeAndName = `${row.mxDtoList[mxKey]['acct10Code']} ${row.mxDtoList[mxKey]['acct10Name']}`;
                    assistJSON = row.mxDtoList[mxKey]['acct10CiName'];
                    subjectName = row.mxDtoList[mxKey]['acct10Name']
                }

                return (
                    <div>
                        <SelectSubject
                            key={`table-${row.key}-${column}-${mxKey || '0'}-col-cell-select-subject`}
                            value={value}
                            metaAction={metaAction}
                            store={store}
                            webapi={webapi}
                            assistJSON={assistJSON}
                            onChange={value => onChange(value)}
                            defaultItem={defaultItem}
                            subjectName={acctName}
                        ></SelectSubject>
                    </div>
                );
            default:
                // return (
                //     <Input key={`${row.key}-${column}-${mxKey || '0'}-col-cell-input`}
                //         value={value}
                //         onChange={e => onChange(e.target.value)}
                //     />
                // );
        }
    }

    sortChange = (path, e) => {
        let { sortOptin } = this.props.data;
        //目前只能单个字段排序
        Object.keys(sortOptin).forEach(key => {
            sortOptin[key] = null;
        })
        sortOptin[path] = e;
        this.metaAction.sfs && this.metaAction.sfs({
            'data.tableData.sortOptin': fromJS(sortOptin)
        })
        this.props.cancelTableEdit && this.props.cancelTableEdit();
        setTimeout(() => {
            this.props.reLoad && this.props.reLoad();
        }, 200);
    }
    // 渲染明细单元格
    renderCell = (row, index, cellName, cellEditable, cellType) => {
        if (!row.mxDtoList) {
            return null
        }
        let colLen = row.mxDtoList && row.mxDtoList.length || 0;
        colLen = colLen >= 4 ? 4 : colLen;
        //渲染多列金额
        if (cellName == 'amount') {
            return (
                <div className={`bovms-editable-table-cell-row no-padding`} style={{ height: colLen * 37 + 'px' }}>
                    {
                        row.mxDtoList.map((item, mxxh) => {
                            if (mxxh > 3) {
                                return null
                            }
                            if (row.mxDtoList.length > 4 && mxxh >= 3) {
                                return <div key={`${index}-${mxxh}-${cellName}`} className="bovms-cell" columnKey={cellName}><span className="cell-span">...</span></div>
                            }
                            return (
                                <div
                                    key={`${index}-${mxxh}-${cellName}`}
                                    className="bovms-cell">
                                    <span className="cell-span" title={item[cellName]} columnKey={cellName}>
                                        {
                                            this.getCellText(item[cellName], cellType)
                                        }
                                    </span>
                                </div>
                            )
                        })
                    }
                </div>
            )
        }
        if(cellName == 'emptyAmount'){
            <div className={`bovms-editable-table-cell-row no-padding`} style={{ height: colLen * 37 + 'px' }}>
                    {
                        row.mxDtoList.map((item, mxxh) => {
                            if (mxxh > 3) {
                                return null
                            }
                            if (row.mxDtoList.length > 4 && mxxh >= 3) {
                                return <div key={`${index}-${mxxh}-${cellName}`} className="bovms-cell" columnKey={cellName}><span className="cell-span"></span></div>
                            }
                            return (
                                <div
                                    key={`${index}-${mxxh}-${cellName}`}
                                    className="bovms-cell">
                                    <span className="cell-span" title={item[cellName]} columnKey={cellName}>
                                       
                                    </span>
                                </div>
                            )
                        })
                    }
                </div>
        }
        return (
            <div className={`bovms-editable-table-cell-row ${row.editable ? 'no-padding' : ''}`} style={{ height: colLen * 37 + 'px' }}>
                {
                    row.mxDtoList.map((item, mxxh) => {
                        if (mxxh > 3) {
                            return null
                        }
                        if (row.mxDtoList.length > 4 && mxxh >= 3) {
                            return <div key={`${index}-${mxxh}-${cellName}`} className="bovms-cell" columnKey={cellName}><span className="cell-span">...</span></div>
                        }
                        return (
                            <div
                                key={`${index}-${mxxh}-${cellName}`}
                                className="bovms-cell">
                                {
                                    cellEditable ?
                                        this.renderColumns(item[cellName], row, cellName, mxxh)
                                        : <span className="cell-span" title={item[cellName]} columnKey={cellName}>
                                            {
                                                this.getCellText(item[cellName], cellType)
                                            }
                                        </span>
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    getCellText(text, cellType) {
        switch (cellType) {
            case 'amount':
                return this.quantityFormat(text, 2, false, false, true);
            case 'percent':
                return !isNaN(text) && Number(text) * 100 + ' %' || '';
            default:
                return text;
        }
    }
    async handleMenuClick(key, data, selectedRowKeys) {
        switch (key) {
            case 'selectPage':
                selectedRowKeys = data.map(m => m.id);
                this.metaAction.sf('data.tableData.selectedRowKeys', fromJS(selectedRowKeys))
                return;
            case 'selectAll':
                this.metaAction.sfs({
                    'data.loading': true,
                    'data.initPage': true,
                })
                const { yearPeriod, bankAcctId, partyAcctOrSummaryName, vchStateCode, accountMatchState, flowfundType, startAmount, endAmount } = this.metaAction.gf('data.filterData').toJS();
                const { sortOptin } = this.metaAction.gf('data.tableData').toJS();
                let orders = []
                Object.keys(sortOptin || {}).some(key => {
                    if (sortOptin && sortOptin[key]) {
                        orders.push({ name: key, asc: sortOptin[key] === 'desc' ? false : true })
                    }
                })
                const res = await this.webapi.funds.queryFlowfundPageList({
                    isInit: false,
                    isSelectedAll: "Y",
                    entity: {
                        yearPeriod: yearPeriod.replace('-', ''),
                        bankAcctId: bankAcctId
                    },
                    partyAcctOrSummaryName: partyAcctOrSummaryName,
                    vchStateCode: vchStateCode,
                    accountMatchState: accountMatchState,
                    flowfundType: flowfundType,
                    startAmount: startAmount,
                    endAmount: endAmount,
                    orders: orders
                })
                if (res && res.list) {
                    this.metaAction.sfs && this.metaAction.sfs({
                        'data.tableAllList': fromJS(res.list),
                        'data.tableData.selectedRowKeys': fromJS(res.list.map(m => m.id)),
                        'data.totalData': fromJS({
                            flowTotalQty: res.flowTotalQty, //数据库对账单总数
                            totalPaymentAmount: res.totalPaymentAmount, // 付款总金额
                            totalCollectionAmount: res.totalCollectionAmount, // 收款总金额
                            nonVchState2FlowQty: res.nonVchState2FlowQty, // 未记账（未生成凭证或者生成凭证失败）流水数量
                        }),
                    });
                }
                this.metaAction.sfs({
                    'data.loading': false,
                    'data.initPage': false,
                })
                return;
            case 'cancelSelect':
                this.metaAction.sfs && this.metaAction.sfs({
                    'data.tableData.selectedRowKeys': fromJS([]),
                    'data.tableAllList': fromJS([]),
                });
                return;
        }
    }
    onVerticalScroll() {
        if (this.metaAction.gf("data.tableData.editingKey")) {
            return false;
        }
        return true;
    }
    getColumns() {
        const { sortOptin, editingKey, selectedRowKeys, tableSource, isCheckDisabled } = this.props.data,
            dataSource = tableSource,
            colOption = { dataSource, selectedRowKeys, width: 100, fixed: false, align: 'center', className: '', flexGrow: 0, lineHeight: 37, isResizable: true, detailListName: 'mxDtoList' };
        let columns = [{
            width: 60,
            dataIndex: 'id',
            fixed: "left",
            columnType: 'allcheck',
            onMenuClick: e => this.handleMenuClick(e.key, tableSource, selectedRowKeys),
            onSelectChange: keys => this.metaAction.sf('data.tableData.selectedRowKeys', fromJS(keys)),
            getCheckboxProps: (text, record, index) => (isCheckDisabled && !record.editable ? true : false),
        },
        {
            width: 140,
            dataIndex: 'billDate',
            title: <TableSort
                title="交易日期"
                sortOrder={sortOptin.tradeDate_for_sort || null}
                handleClick={(e) => this.sortChange('tradeDate_for_sort', e)}
            />,
            className: 'bovms-funds-list-table-center-cell',
            render: (text, record) => {
                let formatDate = moment(text).format('YYYY-MM-DD');
                return (
                    <div
                        columnKey='billDate'
                        style={{ paddingLeft: record.infoRequiredForVoucher == null ? '24px' : '0px' }}
                    >
                        {record.infoRequiredForVoucher != null ?
                            <Tooltip arrowPointAtCenter={true}
                                placement="bottomLeft" title={'会计科目未设置'}
                                overlayClassName='inv-tool-tip-warning'>
                                <Icon style={{ marginRight: '8px' }} type="exclamation-circle" className='inv-custom-warning-text warning-icon' />
                            </Tooltip>
                            : null
                        }
                        {formatDate || ''}
                    </div>
                )
            }
        }, {
            width: 180,
            dataIndex: 'counterpartyName',
            className: 'bovms-funds-list-table-center-cell',
            textAlign: "left",
            title: <TableSort
                title="对方户名"
                sortOrder={sortOptin.partyAcctName_for_sort || null}
                handleClick={(e) => this.sortChange('partyAcctName_for_sort', e)}
            />,
        },
        {
            width: 160,
            dataIndex: 'counterpartyAcct',
            title: '对方账号',
            textAlign: "left",
            className: 'bovms-funds-list-table-center-cell',
        }, {
            dataIndex: 'summary',
            flexGrow: 1,
            textAlign: "left",
            className: 'bovms-funds-list-table-center-cell',
            title: <TableSort
                title="交易摘要"
                sortOrder={sortOptin.summary_for_sort || null}
                handleClick={(e) => this.sortChange('summary_for_sort', e)}
            />
        }, {
            width: 100,
            dataIndex: 'paymentAmount',
            title: '付款金额',
            className: 'no-padding',
            render: (text, record, index) => (record.flowfundType === 2 ? this.renderCell(record, index, 'amount', true) : this.renderCell(record, index, 'emptyAmount', true)),
            align: 'right',
        }, {
            width: 100,
            dataIndex: 'collectAmount',
            className: 'no-padding',
            title: '收款金额',
            render: (text, record, index) => (record.flowfundType === 1 ? this.renderCell(record, index, 'amount', true) : this.renderCell(record, index, 'emptyAmount', true)),
            align: 'right',
        }, {
            width: 190,
            dataIndex: 'subject',
            className: 'no-padding',
            textAlign: "left",
            title: '会计科目',
            render: (text, record, index) => this.renderCell(record, index, record.flowfundType === 1 ? 'acct20Id' : 'acct10Id', true)
        }, {
            width: 80,
            dataIndex: 'vchNum',
            title: <TableSort
                title="凭证号"
                sortOrder={sortOptin.vch_num_for_sort || null}
                handleClick={(e) => this.sortChange('vch_num_for_sort', e)}
            />,
            render: (text, record, index) => (
                <div className="bovms-cell-hover-show">
                    {record.vchState == 3 ? '生成失败' : <a onClick={() => this.openVch(record.vchId)}>{text}</a>}
                    {record.vchState == 3 ?
                        <Tooltip arrowPointAtCenter={true}
                            placement="left" title={record.vchStateDesc || ''}
                            overlayClassName='inv-tool-tip-warning'>
                            <Icon type="exclamation-circle" className='inv-custom-warning-text warning-icon' />
                        </Tooltip> : null
                    }
                    {record.vchState != 3 ? <Icon type="close-circle" className="del-icon" onClick={() => this.delVch(record)} /> : null}
                </div>
            )
        }, {
            width: 90,
            dataIndex: 'operation',
            title: <Cell className="bovms-app-table-operation">操作<Icon className='table-setting' type='setting' name='setting' onClick={() => { this.setState({ tableSetting: true }) }} /></Cell>,
            render: (text, record, index) => {
                const { editable } = record;
                return (
                    <div className="editable-row-operations">
                        {
                            editable ?
                                <span>
                                    <a onClick={(e) => this.save(record.id, e)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="保存">
                                        <span className='table-action-icon saveIcon'></span>
                                            {/* <img src={saveIcon}></img> */}
                                        </Tooltip>
                                    </a>
                                    <a onClick={(e) => this.cancel(record.id, e)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="取消">
                                        <span className='table-action-icon cancelIcon'></span>
                                            {/* <img src={cancelIcon}></img> */}
                                        </Tooltip>
                                    </a>
                                </span>
                                :
                                <span>
                                    {record.vchState != 2 ? <a disabled={editingKey !== ''} onClick={record.mxDtoList.length > 1 ? (e) => this.split(record, index, false, e) : (e) => this.edit(record, index, false, e)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="编辑">
                                            {/* <img src={editIcon}></img> */}
                                            <span className='table-action-icon editIcon'></span>
                                        </Tooltip>
                                    </a> : null}
                                    {/* 拆分过就不显示拆分按钮 */}
                                    {record.vchState != 2 && record.mxDtoList.length <= 1 ? <a disabled={editingKey !== ''} onClick={(e) => this.split(record, index, false, e)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="拆分">
                                            {/* <img src={splitIcon}></img> */}
                                            <span className='table-action-icon splitIcon'></span>
                                        </Tooltip>

                                    </a> : null}
                                    {record.vchState != 2 ? <a disabled={editingKey !== ''} onClick={(e) => this.createVoucher(record.id)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="生成凭证">
                                            <span className='table-action-icon certificateIcon'></span>
                                            {/* <img src={certificateIcon}></img> */}
                                        </Tooltip>
                                    </a> : null}
                                    {record.vchState == 2 ? <a disabled={editingKey !== ''} onClick={(e) => this.split(record, index, true, e)}>
                                        <Tooltip arrowPointAtCenter={true} placement="top" title="查看单据">
                                        <span className='table-action-icon invoicesIcon'></span>
                                            {/* <img src={invoicesIcon}></img> */}
                                        </Tooltip>
                                    </a> : null}
                                </span>
                        }
                    </div>
                )
            },
            fixed: 'right',
        },
        ];

        columns = columns.map(m => renderDataGridCol({ ...colOption, ...m }));
        const tableSettingData = this.getTableSettingData();
        if (Array.isArray(tableSettingData) && tableSettingData.length > 0) {
            let cols = []
            columns.forEach(item => {
                let cell = (item.key === 'id' || item.key === 'operation') ? item : tableSettingData.find(f => f.id === item.key && f.isVisible);
                if (cell) {
                    item.props.width = cell.width || item.props.width;
                    cols.push(item)
                }
            })
            return cols;
        }
        return columns;
    }

    createVoucher = (id) => {
        // 生成凭证
        if (id) {
            this.props.createVoucher && this.props.createVoucher(id);
        }
    }
    split = async (row, index, isReadOnly, e, isModalEdit) => {
        let res = await this.metaAction.modal('show', {
            title: '交易流水拆分',
            style: { top: 25 },
            width: 800,
            okText: '保存',
            footer: false,
            wrapClassName: 'bovms-batch-subject-setting',
            children: <SplitStatement
                id={row.id}
                store={this.store}
                metaAction={this.metaAction}
                webapi={this.webapi}
                isReadOnly={isReadOnly}
            />
        })
        if (res == 'needReload') {
            this.props.reLoad && this.props.reLoad();
        }

    }
    delVch = async (rowData) => {
        const confirm = await this.metaAction.modal('confirm', {
            content: `确定要删除凭证吗？`,
            width: 340
        });
        if (confirm) {
            this.metaAction.sfs({
                'data.loading': true,
                'data.initPage': true,
            })
            const res = await this.webapi.funds.deleteFlowfundVoucher({ fundVchIds: [rowData.vchId], isReturnValue: true })
            this.metaAction.sfs({
                'data.loading': false,
                'data.initPage': false,
            })
            // 如果失败，返回结果格式为：{"result":false,"error":{"message":"凭证已审核，不可删除"}}
            // 如果成功，返回结果格式为：{"result":true,"value":null}
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast('error', res.error.message);
            } else {
                this.metaAction.toast('success', '凭证删除成功');
                this.props.reLoad && this.props.reLoad();
            }
            return
        }
    }

    openVch = async (vchId) => {
        // vchId 凭证ID
        if (!vchId) {
            return
        }
        const { store } = this.props;
        const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            style: { top: 25 },
            width: 1200,
            bodyStyle: { paddingBottom: '0px' },
            className: 'batchCopyDoc-modal',
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge', {
                store: store,
                initData: {
                    type: 'isFromXdz',
                    id: vchId,
                }
            })
        })
    }
    getColText(text, record, column, mxKey) {
        let obj, assistList;
        switch (column) {
            case 'acct10Id': //借方科目
                obj = record.mxDtoList[mxKey].acct10CiName ? JSON.parse(record.mxDtoList[mxKey].acct10CiName) : {};
                assistList = obj.assistList;
                return `${record.mxDtoList[mxKey].acct10Code || ''} ${record.mxDtoList[mxKey].acct10Name || ''} ${assistList ? '/' : ''}${assistList ? assistList.map(m => m.name).join('/') : ''}`;
            case 'acct20Id': //贷方科目
                obj = record.mxDtoList[mxKey].acct20CiName ? JSON.parse(record.mxDtoList[mxKey].acct20CiName) : {};
                assistList = obj.assistList;
                return `${record.mxDtoList[mxKey].acct20Code || ''} ${record.mxDtoList[mxKey].acct20Name || ''} ${assistList ? '/' : ''}${assistList ? assistList.map(m => m.name).join('/') : ''}`;
            default:
                return text;
        }
    }
    renderColumns = (text, record, column, mxKey) => {
        return (
            record.editable ? this.getCellByColumn({
                column,
                value: text,
                mxKey,
                row: record,
                onChange: value => this.handleChange(value, record.id, column, mxKey)
            }) : <span columnKey={column} className="cell-span" title={this.getColText(text, record, column, mxKey)}>{this.getColText(text, record, column, mxKey)}</span>
        )
    }
    setTargetVal(target, column, mxKey, value) {
        const isObject = Object.prototype.toString.call(value) === "[object Object]";
        // const json = isObject && value.assistList ? JSON.stringify({ assistList: value.assistList }) : "{}"
        const json = isObject && value.assistList ? JSON.stringify({ assistList: value.assistList }) : ""
        switch (column) {
            case 'acct10Id':
                target.mxDtoList[mxKey].acct10Id = isObject ? value.id : undefined;
                target.mxDtoList[mxKey].acct10Code = isObject ? value.code : undefined;
                target.mxDtoList[mxKey].acct10Name = isObject ? value.gradeName : undefined;
                target.mxDtoList[mxKey].acct10CiName = isObject ? json : undefined;
                break;
            case 'acct20Id':
                target.mxDtoList[mxKey].acct20Id = isObject ? value.id : undefined;
                target.mxDtoList[mxKey].acct20Code = isObject ? value.code : undefined;
                target.mxDtoList[mxKey].acct20Name = isObject ? value.gradeName : undefined;
                target.mxDtoList[mxKey].acct20CiName = isObject ? json : undefined;
                break;
            default:
                break;
        }
    }

    handleChange(value, key, column, mxKey) {
        const newData = [...this.props.data.tableSource];
        const target = newData.filter(item => key === item.id)[0];
        if (target) {
            // value 是{}时的处理
            this.setTargetVal(target, column, mxKey, value);
            this.metaAction.sfs && this.metaAction.sfs({
                'data.tableData.tableSource': fromJS(newData)
            });
        }
    }
    edit = async (row, index, isReadOnly, e, isModalEdit) => {
        // 滚动到编辑区域
        // this.getMousePosAndScroll(e, document.querySelector('.ant-table-body'))
        if (e && e.stopPropagation) {
            e.stopPropagation()
        }
        const { id, mxDtoList } = row;
        if (isReadOnly || isModalEdit || (mxDtoList && mxDtoList.length > 4)) {
            this.props.multipleRowEdit && this.props.multipleRowEdit(id, isReadOnly);
            return
        }
        const newData = [...this.props.data.tableSource];
        const target = newData.filter(item => id === item.id)[0];
        // const oldEditRow = newData.find(f => f.editable);
        if (target) {
            this.cacheData = JSON.parse(JSON.stringify(newData));
            target.editable = true;
            // this.setState({ editingKey: key });
            const cacheSelectKeys = this.metaAction.gf('data.tableData.selectedRowKeys');
            this.metaAction.sfs && this.metaAction.sfs({
                'data.tableData.tableSource': fromJS(newData),
                'data.tableData.editingKey': id,
                // 'data.tableData.selectedRowKeys': fromJS([]),
                'data.tableData.isCheckDisabled': true,
                'data.editingCachaData': fromJS(newData)
            })
            this.setState({ cacheSelectKeys, isCheckDisabled: true });
        }
    }

    getMousePosAndScroll(event, dom) {
        let e = event || window.event;
        let scrollX = dom.scrollLeft || document.body.scrollLeft;
        let scrollY = dom.scrollTop || document.body.scrollTop;
        let x = (e.pageX || e.clientX) + scrollX;
        let y = (e.pageY || e.clientY) + scrollY - 300;
        // console.log('getMousePosAndScroll:', e.pageY, e.clientY, x, y)
        setTimeout(() => {
            dom.scrollTo(x, y);
        }, 100);
    }
    save = async (key, e) => {
        if (e && e.stopPropagation) {
            e.stopPropagation()
        }
        const newData = [...this.props.data.tableSource];
        const target = newData.filter(item => key === item.id)[0];
        if (target) {
            const listFiled = 'mxDtoList';
            if (!this.checkForm(target)) {
                this.metaAction.toast('error', '会计科目不能为空');
                return false;
            }
            delete target.editable;
            const rowData = {
                ...target,
                [listFiled]: setListEmptyVal(target.mxDtoList),
            }
            delete rowData.mxDtoList;
            this.metaAction.sfs({
                'data.loading': true,
                'data.initPage': true,
            })
            const res = await this.webapi.funds.saveBankFlowsWhenUpdate(setListEmptyVal(target.mxDtoList));
            this.metaAction.sfs({
                'data.loading': false,
                'data.initPage': false,
                'data.editingCachaData': undefined
            })
            if (res === null || res) {
                this.metaAction.sfs && this.metaAction.sfs({
                    // 'data.tableData.tableSource': fromJS(newData),
                    // 'data.tableData.editingKey': '',
                    'data.tableData.isCheckDisabled': false,
                });
                this.cacheData = newData.map(item => ({ ...item }));
                this.props.reLoad && this.props.reLoad();
                // this.setState({ cacheSelectKeys: [] });
            }

        }
    }
    cancel(key, e) {
        if (e && e.stopPropagation) {
            e.stopPropagation()
        }
        const newData = [...this.props.data.tableSource];
        const target = newData.filter(item => key === item.id)[0];
        if (target) {
            // Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
            Object.assign(target, this.metaAction.gf('data.editingCachaData').toJS().filter(item => key === item.id)[0]);

            delete target.editable;
            // this.setState({ editingKey: '' });
            this.metaAction.sfs && this.metaAction.sfs({
                'data.tableData.tableSource': fromJS(newData),
                'data.tableData.editingKey': '',
                'data.tableData.isCheckDisabled': false,
                'data.editingCachaData': undefined
                // 'data.tableData.selectedRowKeys': fromJS(this.state.cacheSelectKeys || [])
            })
            // this.setState({ cacheSelectKeys: [] });
        }
    }

    onRow = record => {
        return {
            onClick: event => {
                const { selectedRowKeys, tableSource } = this.props.data;
                if (tableSource.find(ff => String(ff.id) === String(record.id) && ff.editable)) {
                    return
                }
                const index = selectedRowKeys.findIndex(f => String(f) === String(record.id))
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.id)
                }
                this.metaAction.sfs && this.metaAction.sfs({
                    'data.tableData.selectedRowKeys': fromJS(selectedRowKeys)
                })
            }, // 点击行
        };
    }
    checkForm(item) {
        if (!item) {
            return false;
        }
        // console.log('checkForm:', item)
        //收付款类型==1(收款) 则判断贷方科目是否为空 ,收付款类型==2付款 则判断借方科目是否为空
        if (item.flowfundType === 1) {
            if (item.mxDtoList.some(s => s.acct20Id === undefined || s.acct20Id < 0)) {
                return false;
            }
        } else {
            if (item.mxDtoList.some(s => s.acct10Id === undefined || s.acct10Id < 0)) {
                return false;
            }
        }
        return true
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true) return v
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
        if (quantity !== undefined) {
            if (autoDecimals && quantity) {
                let [a, b] = String(quantity).split('.');
                decimals = Math.max(decimals, b !== undefined && b.length || 0)
            }
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    async saveTableSettingData(data) {
        const res = await this.webapi.funds.saveBillColumnSetup({
            module: 4,
            columnJson: JSON.stringify(data)
        })
        if (res === null) {
            this.metaAction.sf('data.tableData.tableSettingData', fromJS(data));
            this.setState({ tableSetting: false });
        }
    }
    tableSettingOk(data) {
        this.saveTableSettingData(data);
    }
    tableSettingCancel() { this.setState({ tableSetting: false }) }
    tableSettingReset() {
        let list = this.defaultTableSetting;
        this.saveTableSettingData(list);
    }
    onColumnResizeEndCallback(newColumnWidth, columnKey) {
        // console.log('onColumnResizeEndCallback:', newColumnWidth, columnKey)
        let tableSettingData = this.metaAction.gf('data.tableData.tableSettingData').toJS();
        let data = []
        if(Array.isArray(tableSettingData) && tableSettingData.length > 0){
            data = (this.metaAction.gf('data.tableData.tableSettingData').toJS() || []).map(item => {
                if (item.id === columnKey) {
                    item.width = newColumnWidth;
                }
                return item
            })
        }else{
            data = this.defaultTableSetting.map(item => {
                if (item.id === columnKey) {
                    item.width = newColumnWidth;
                }
                return item
            })
        }
        
        this.saveTableSettingData(data);
    }
    rowHeightGetter(index) {
        const { tableSource } = this.props.data,
            row = tableSource[index] || { mxDtoList: [] };
        return 37 * (row.mxDtoList.length >= 4 ? 4 : row.mxDtoList.length);
    }
    rowClassNameGetter(index) {
        const { tableSource, selectedRowKeys, isCheckDisabled } = this.props.data,
            record = tableSource[index] || {};
        if (isCheckDisabled && !record.editable)
            return 'bovms-row-disabled';
        if (isCheckDisabled && record.editable || selectedRowKeys.some(s => s === Number(record['id'])))
            return 'ant-table-row-selected';
        return '';
    }
    onRowClick(e, index) {
        const columnKey = e && e.target && e.target.attributes['columnKey'];
        if (columnKey && columnKey.value) {
            let { selectedRowKeys, tableSource } = this.props.data,
                key = tableSource[index]['id'];
            if (selectedRowKeys.includes(Number(key))) {
                selectedRowKeys = selectedRowKeys.filter(f => f !== Number(key))
            } else {
                selectedRowKeys.push(Number(key));
            }
            this.metaAction.sf('data.tableData.selectedRowKeys', fromJS(selectedRowKeys));
        }
    }
    render() {
        const { scroll, tableSetting, tableSize } = this.state, { selectedRowKeys, tableSource, isCheckDisabled } = this.props.data,
            _columns = this.getColumns(),
            className = `bovms-editable-table ${this.props.className}`,
            tableSettingData = this.getTableSettingData(),
            loading = this.metaAction.gf('data.loading');
        return (
            <div style={{ width: '100%', flex: 1, height: tableSize.height ? tableSize.height + 'px' : +'100%' }}>
                <DataGrid
                    // loading={loading}
                    className={className}
                    key={this.dataGridKey}
                    headerHeight={37}
                    // groupHeaderHeight={37}
                    rowHeight={37}
                    footerHeight={0}
                    rowsCount={(tableSource || []).length}
                    onRowClick={::this.onRowClick}
                    width={tableSize.width}
                height={tableSize.height}
                style={{ width: '100%', height: tableSize.height + 'px' }}
                columns={_columns}
                onVerticalScroll={::this.onVerticalScroll}
                ellipsis
                    rowHeightGetter={::this.rowHeightGetter}
                    rowClassNameGetter={::this.rowClassNameGetter}
                    isColumnResizing={false}
                onColumnResizeEnd={::this.onColumnResizeEndCallback}
       />
                <TableSettingCard
                    showTitle={false}
                    data={tableSettingData || []}
                    positionClass={className}
                    visible={tableSetting}
                    confirmClick={::this.tableSettingOk}
                    cancelClick={::this.tableSettingCancel}
                    resetClick={::this.tableSettingReset}
/>
            </div>
        );

    }
}