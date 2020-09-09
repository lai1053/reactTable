import React from 'react'
import { Table, TableSort, Input, Select, Tooltip, Icon, TableSettingCard } from 'edf-component';
import { fromJS, toJS } from 'immutable';
import SelectSubject from './selectSubject/index';
import SelectStock from './selectStock';
import { number } from 'edf-utils';
import { setListEmptyVal, handleGetTableContainer } from '../utils/index';

export default class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.cacheData = ((props.data || {}).tableSource || []).map(item => ({ ...item }));
        this.module = props.module;
        this.defaultTableSetting = [
            { id: 'invNo', caption: '发票号码', isVisible: true, isMustSelect: true, width: 110, },
            { id: 'invCode', caption: '发票代码', isVisible: false, isMustSelect: false, width: 110, },
            { id: 'invKindName', caption: '发票类型', isVisible: true, isMustSelect: false, width: 100, },
            { id: 'billDate', caption: '开票日期', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'rzztDesc', caption: '认证状态', isVisible: true, isMustSelect: true, width: 80, },
            { id: 'dkyf', caption: '抵扣月份', isVisible: false, isMustSelect: false, width: 80, },
            { id: 'amount', caption: '价税合计', isVisible: true, isMustSelect: false, width: 100, },
            { id: 'custName', caption: this.module === 'xs' ? '购方名称' : '销方名称', isVisible: true, isMustSelect: true, width: 150, },
            { id: 'goodsName', caption: '商品或服务名称', isVisible: true, isMustSelect: true, width: 150, },
            { id: 'specification', caption: '规格型号', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'unitName', caption: '单位', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'qty', caption: '数量', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'unitPrice', caption: '单价', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'exTaxAmount', caption: '金额', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'taxRate', caption: '税率', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'taxAmount', caption: '税额', isVisible: false, isMustSelect: false, width: 100, },
            { id: 'isStock', caption: '是否存货', isVisible: true, isMustSelect: true, width: 80, },
            { id: 'stockId', caption: '存货档案', isVisible: true, isMustSelect: true, width: 150, },
            { id: 'acct10Id', caption: '借方科目', isVisible: true, isMustSelect: true, width: 200, },
            { id: 'acct20Id', caption: '贷方科目', isVisible: true, isMustSelect: true, width: 200, },
            { id: 'vchNum', caption: '凭证号', isVisible: true, isMustSelect: true, width: 110, },
            { id: 'inventoryCode', caption: this.module === 'xs' ? '出库单号' : '入库单号', isVisible: true, isMustSelect: true, width: 130, },
            { id: 'operation', caption: '操作', isVisible: true, isMustSelect: true, width: 170, },
        ];
        this.state = {
            // editingKey: '',
            tableSetting: false,
            cacheSelectKeys: [],
            // tableSettingData: JSON.parse(JSON.stringify(this.defaultTableSetting)),
        };
    }
    async componentDidMount() {
        this.onResize();
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize.bind(this), false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize.bind(this))
        } else {
            window.onresize = this.onResize.bind(this)
        }
        // console.log('table componentDidMount')
        // await this.getTableSettingData();
    }
    componentWillUnmount() {
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }
    onSelectChange = (selectedRowKeys) => {
        this.metaAction.sfs && this.metaAction.sfs({
            'data.tableData.selectedRowKeys': fromJS(selectedRowKeys)
        })
    }
    getTableSettingData() {
        let tableSettingData = this.metaAction.gf('data.tableData.tableSettingData') && this.metaAction.gf('data.tableData.tableSettingData').toJS() || [];
        if (Array.isArray(tableSettingData) && tableSettingData.length < 1) {
            tableSettingData = this.defaultTableSetting;
        }
        if (this.module == 'xs' || this.metaAction.gf('data.accountInfo.vatTaxpayer') == '2000010002') {
            tableSettingData = tableSettingData.filter(f => f.id !== 'rzztDesc' && f.id !== 'dkyf');
        } else {
            // 解决小规模存储了，切换到一般纳税人时，两个列丢失问题
            this.defaultTableSetting.filter(f => f.id === 'rzztDesc' || f.id === 'dkyf').forEach(item => {
                let index = tableSettingData.findIndex(ff => ff.id === (item.id === 'dkyf' ? 'rzztDesc' : 'billDate'));
                if (!tableSettingData.find(fff => fff.id === item.id)) {
                    tableSettingData.splice(index + 1, 0, item);
                }
            })
        }
        if (this.props.data.isStock == 0 || this.props.data.isStock == 2) {
            // 1启用，0未启用，2关闭
            tableSettingData = tableSettingData.filter(f => f.id !== 'isStock' && f.id !== 'stockId' && f.id !== 'inventoryCode');
        } else if (this.props.data.isStock == 1) {
            // 解决未启用存货存储了，切换到启用存货，这些列丢失问题
            this.defaultTableSetting.filter(f => f.id === 'isStock' || f.id === 'stockId' || f.id === 'inventoryCode').forEach(item => {
                let index = 0,
                    fieldName = '';
                switch (item.id) {
                    case 'isStock':
                        fieldName = 'taxAmount';
                        break;
                    case 'stockId':
                        fieldName = 'isStock';
                        break;
                    case 'inventoryCode':
                        fieldName = 'vchNum';
                        break;
                }
                index = tableSettingData.findIndex(ff => ff.id === fieldName);
                if (!tableSettingData.find(fff => fff.id === item.id)) {
                    tableSettingData.splice(index + 1, 0, item);
                }
            })
        }
        return tableSettingData
        // this.setState({ tableSettingData });
    }
    getCellByColumn = ({ column, value, mxKey, row, onChange }) => {
        const { metaAction, store, webapi, module } = this.props;
        switch (column) {
            case 'acct10Id': //借方科目
            case 'acct20Id': //贷方科目
                let assistJSON = '{}',
                    defaultItem = {
                        id: value,
                    },
                    subjectName = null,
                    subjectDisabled = false;
                if (module === 'xs') {
                    defaultItem.codeAndName = column === 'acct10Id' ? `${row['acct10Code']} ${row['acct10Name']}` : `${row.detailList[mxKey]['acct20Code']} ${row.detailList[mxKey]['acct20Name']}`;
                    assistJSON = column === 'acct10Id' ? row['acct10CiName'] : row.detailList[mxKey]['acct20CiName'];
                    subjectName = column === 'acct10Id' ? row['custName'] : row.detailList[mxKey]['goodsName'];
                } else {
                    defaultItem.codeAndName = column === 'acct10Id' ? `${row.detailList[mxKey]['acct10Code']} ${row.detailList[mxKey]['acct10Name']}` : `${row['acct20Code']} ${row['acct20Name']}`;
                    assistJSON = column === 'acct10Id' ? row.detailList[mxKey]['acct10CiName'] : row['acct20CiName'];
                    subjectName = column === 'acct10Id' ? row.detailList[mxKey]['goodsName'] : row['custName'];
                    subjectDisabled = this.props.data.isStock == 1 && column === 'acct10Id' && row.detailList[mxKey].isStock == 1 ? true : false;
                }
                return (
                    <SelectSubject 
                        key={`table-${row.key}-${column}-${mxKey||'0'}-col-cell-select-subject`} 
                        selectType={column==='acct10Id'?'jfkm':'dfkm'}
                        module={module}
                        metaAction={metaAction}
                        store={store}
                        value={value}
                        webapi={webapi}
                        assistJSON={assistJSON}
                        isStockMonth={this.props.data.isStock}
                        isStock={row.detailList[mxKey].isStock}
                        onChange={value => onChange(value)} 
                        defaultItem={defaultItem}
                        subjectName={subjectName}
                        disabled={subjectDisabled}
                        getPopupContainer={handleGetTableContainer}
                    ></SelectSubject>
                );
            case 'isStock': //是否存货
                return (
                    <Select 
                        key={`table-${row.key}-${column}-${mxKey||'0'}-col-cell-select`}
                        value={value} 
                        onChange={val=>onChange(val)} 
                        style={{width:'100%'}} >
                        <Select.Option key="1" value="1">是</Select.Option>
                        <Select.Option key="0" value="0">否</Select.Option>
                    </Select>
                );
            case 'stockId': //存货档案
                return (
                    <SelectStock
                        key={`table-${row.key}-${column}-${mxKey||'0'}-col-cell-select-stock`} 
                        module={module}
                        metaAction={metaAction}
                        store={store}
                        value={value}
                        webapi={webapi}
                        rowData={row.detailList[mxKey]}
                        isStock={row.detailList[mxKey].isStock}
                        onChange={value => onChange(value)} 
                        getPopupContainer={handleGetTableContainer}
                    />
                );
            default:
                return (
                    <Input key={`${row.key}-${column}-${mxKey||'0'}-col-cell-input`} 
                        value={value}
                        onChange={e => onChange(e.target.value)} 
                    />
                );
        }
    }

    getTableWidth() {
        const _columns = this.getColumns();
        // width += _columns.filter(f => !f.width).length * 100;
        let width = _columns.reduce((a, b) => ((a.width !== undefined ? a.width : (a || 0)) + (b.width || 0))),
            fixedCol = _columns.filter(f => f.fixed),
            fixedWidth = fixedCol.length > 1 ? fixedCol.reduce((a, b) => ((a.width || 0) + (b.width || 0))) : fixedCol[0].width;
        // console.log('fixedWidth:', width, fixedWidth, _columns)
        return width + fixedWidth
    }
    onResize(e) {
        // console.log('bovms-app-table-container 1:', document.getElementsByClassName('bovms-app-table-container')[0].offsetHeight)
        setTimeout(() => {
            const cn = `bovms-app-${this.module==='xs'?'sale':'purchase'}-list`
            let table = document.getElementsByClassName(cn)[0];
            // console.log('bovms-app-table-container 2:', document.getElementsByClassName('bovms-app-table-container')[0].offsetHeight)
            // theadDom = table && table.getElementsByClassName('ant-table-thead')[0];//bovms-editable-table
            if (table) {
                let h = table.offsetHeight - 101 - 38 - 12, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = this.getTableWidth() + 120,
                    scroll = { y: h, x: width };

                if (w > width) {
                    delete scroll.x
                }
                this.setState({ scroll: scroll })
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
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
        if (!row.detailList) {
            return null
        }
        let colLen = row.detailList && row.detailList.length || 0;
        colLen = colLen >= 4 ? 4 : colLen;
        return (
            <div className={`bovms-editable-table-cell-row ${row.editable?'no-padding':''}`} style={{height:colLen*37+'px'}}>
                {
                    row.detailList.map((item,mxxh)=>{
                        if(mxxh>3){
                            return null
                        }
                        if(row.detailList.length>4&&mxxh>=3){
                            return <div key={`${index}-${mxxh}-${cellName}`} className="bovms-cell"><span className="cell-span">...</span></div>
                        }
                        return (
                            <div 
                            key={`${index}-${mxxh}-${cellName}`} 
                            className="bovms-cell">
                                {
                                    cellEditable?
                                    this.renderColumns(item[cellName], row, cellName,mxxh)
                                    :<span className="cell-span" title={item[cellName]}>
                                        {
                                            this.getCellText(item[cellName],cellType)
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
    getColumns() {
        const { sortOptin, isStock, editingKey } = this.props.data;
        const module = this.module;
        // const { editingKey } = this.state;
        let columns = [{
                title: <TableSort 
                    title="发票号码" 
                    sortOrder={ sortOptin.inv_no || null}
                    handleClick={(e)=>this.sortChange('inv_no',e)}
                    />,
                dataIndex: 'invNo',
                fixed: 'left',
                width: 110,
                render: (text, record) => ({
                    children: (
                        <div style={{paddingLeft:record.infoRequiredForVoucher==null?'24px':'0px'}} title={text}>
                            {record.infoRequiredForVoucher!=null?
                                <Tooltip arrowPointAtCenter={true}
                                         placement="bottomLeft" title={record.infoRequiredForVoucher==1?'存货档案、借方或贷方科目设置未完成':'借方或贷方科目设置未完成'}
                                         overlayClassName='inv-tool-tip-warning'>
                                    <Icon style={{marginRight:'8px'}} type="exclamation-circle" className='inv-custom-warning-text warning-icon'/>
                                </Tooltip>
                                :null
                            }
                            {text}
                        </div>
                    ),
                    props: {
                        colSpan: 1,
                        style: { maxWidth: '110px' },
                        className: record.detailList.length >= 4 ? 'row4' : 'row' + record.detailList.length,
                    },
                })
            },
            {
                title: '发票代码',
                dataIndex: 'invCode',
                width: 100,
            },
            {
                title: <TableSort 
                    title="发票类型" 
                    sortOrder={ sortOptin.inv_kind_code_for_sort || null}
                    handleClick={(e)=>this.sortChange('inv_kind_code_for_sort',e)}
                    />,
                dataIndex: 'invKindName',
                align: 'center',
                width: 100,
            },
            {
                title: '开票日期',
                dataIndex: 'billDate',
                width: 100,
            },
            {
                title: <TableSort 
                    title="认证状态" 
                    sortOrder={ sortOptin.rzzt_for_sort || null}
                    handleClick={(e)=>this.sortChange('rzzt_for_sort',e)}
                    />,
                dataIndex: 'rzztDesc',
                align: 'center',
                width: 80,
            },
            {
                title: '抵扣月份',
                dataIndex: 'dkyf',
                align: 'center',
                width: 80,
            },
            {
                title: '价税合计',
                dataIndex: 'amount',
                width: 100,
                align: 'right',
                render: text => this.quantityFormat(text, 2, false, false),
            },
            {
                title: <TableSort 
                title={module === 'xs' ? '购方名称' : '销方名称'} 
                sortOrder={ sortOptin.cust_name || null}
                handleClick={(e)=>this.sortChange('cust_name',e)}
                />,
                dataIndex: 'custName',
                width: 150,
            },
            {
                title: '商品或服务名称',
                dataIndex: 'goodsName',
                width: 150,
                className: 'no-padding',
                render: (value, row, index) => this.renderCell(row, index, 'goodsName', false),
            },
            {
                title: '规格型号',
                dataIndex: 'specification',
                width: 100,
                className: 'no-padding',
                render: (value, row, index) => this.renderCell(row, index, 'specification', false),
            },
            {
                dataIndex: 'unitName',
                title: '单位',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => this.renderCell(row, index, 'unitName', false),
            },
            {
                dataIndex: 'qty',
                title: '数量',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => this.renderCell(row, index, 'qty', false),
            },
            {
                dataIndex: 'unitPrice',
                title: '单价',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => {
                    // row.cellType = 'amount'
                    return this.renderCell(row, index, 'unitPrice', false, 'amount')
                }

            },
            {
                dataIndex: 'exTaxAmount',
                title: '金额',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => {
                    // row.cellType = 'amount'
                    return this.renderCell(row, index, 'exTaxAmount', false, 'amount')
                }

            }, {
                dataIndex: 'taxRate',
                title: '税率',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => {
                    // row.cellType = 'percent'
                    return this.renderCell(row, index, 'taxRate', false, 'percent')
                }

            }, {
                dataIndex: 'taxAmount',
                title: '税额',
                width: 100,
                align: 'right',
                className: 'no-padding',
                render: (value, row, index) => {
                    // row.cellType = 'amount'
                    return this.renderCell(row, index, 'taxAmount', false, 'amount')

                },
            }, {
                title: '是否存货',
                dataIndex: 'isStock',
                width: 80,
                className: 'no-padding',
                align: 'center',
                render: (value, row, index) => this.renderCell(row, index, 'isStock', true),
            }, {
                title: '存货档案',
                dataIndex: 'stockId',
                width: 150,
                className: 'no-padding',
                render: (value, row, index) => this.renderCell(row, index, 'stockId', true),
            }, {
                title: '借方科目',
                dataIndex: 'acct10Id',
                width: 200,
                className: 'no-padding',
                render: (value, row, index) => module === 'xs' ? this.renderColumns(value, row, 'acct10Id', 0) : this.renderCell(row, index, 'acct10Id', true),
            }, {
                title: '贷方科目',
                dataIndex: 'acct20Id',
                width: 200,
                className: 'no-padding',
                render: (text, record, index) => module === 'xs' ? this.renderCell(record, index, 'acct20Id', true) : this.renderColumns(text, record, 'acct20Id', 0),
            }, {
                title: <TableSort 
                    title="凭证号" 
                    sortOrder={ sortOptin.vch_num || null}
                    handleClick={(e)=>this.sortChange('vch_num',e)}
                    />,
                dataIndex: 'vchNum',
                width: 110,
                render: (text, record) => (
                    <div className="bovms-cell-hover-show">
                        {record.vchState==3?'生成失败':<a onClick={()=>this.openVch(record.vchId)}>{text}</a>}
                        {record.vchState==3?
                            <Tooltip arrowPointAtCenter={true}
                                     placement="left" title={record.vchStateDesc || ''}
                                     overlayClassName='inv-tool-tip-warning'>
                                <Icon type="exclamation-circle" className='inv-custom-warning-text warning-icon'/>
                            </Tooltip>:null
                        }
                        {record.vchState!=3?<Icon type="close-circle" className="del-icon" onClick={()=>this.delVch(record)}/>:null}
                    </div>
                )
            }, {
                title: module === 'xs' ? '出库单号' : '入库单号',
                dataIndex: 'inventoryCode',
                width: 130,
                render: (text, record) => (
                    <div>
                        {!record.inventoryId&&record.inventoryMsg?`生成失败 `:<a onClick={()=>this.openInventory(record.inventoryId)}>{text}</a>}
                        {!record.inventoryId&&record.inventoryMsg?
                            <Tooltip arrowPointAtCenter={true}
                                     placement="left" title={record.inventoryMsg || ''}
                                     overlayClassName='inv-tool-tip-warning'>
                                <Icon type="exclamation-circle" className='inv-custom-warning-text warning-icon'/>
                            </Tooltip>:null
                        }
                    </div>
                )
            }, {
                title: <div className="bovms-app-table-operation">操作<Icon className='table-setting' type='setting' name='setting' onClick={()=>{this.setState({tableSetting:true})}}/></div>,
                dataIndex: 'operation',
                key: 'voucherState',
                width: 170,
                align: 'center',
                fixed: 'right',
                render: (text, row, index) => {
                    const { editable } = row;
                    return {
                        children: (
                            <div className="editable-row-operations">
                                {
                                  editable ?
                                    <span>
                                      <a onClick={(e) => this.save(row.id,e)}>保存</a>
                                      <a onClick={(e) => this.cancel(row.id,e)}>取消</a>
                                    </span>
                                    :
                                    <span> 
                                        {row.vchState!=2?
                                        <a disabled={editingKey !== ''} onClick={(e) => this.edit(row,index,false,e)}>
                                        {row.detailList && row.detailList.length > 4?'弹窗编辑':'编辑'}
                                        </a>
                                        :null}
                                        {row.vchState!=2 && row.detailList && row.detailList.length <= 4?
                                        <a disabled={editingKey !== ''} onClick={(e) => this.edit(row,index,false,e,true)}>弹窗编辑</a>
                                        :null}
                                        {row.vchState!=2?<a disabled={editingKey !== ''} onClick={(e)=>this.createVoucher(row.id)}>生成凭证</a>:null}
                                        {row.vchState==2?<a disabled={editingKey !== ''} onClick={(e)=>this.edit(row,index,true,e)}>查看单据</a>:null}
                                    </span>
                                }
                            </div>
                        ),
                        props: {
                            colSpan: 1,
                            className: row.detailList.length >= 4 ? 'row4' : 'row' + row.detailList.length,
                        },
                    };
                },
            },
        ];

        if (this.module == 'xs' || this.metaAction.gf('data.accountInfo.vatTaxpayer') == '2000010002') {
            columns = columns.filter(f => f.dataIndex !== 'rzztDesc' && f.dataIndex !== 'dkyf');
        }
        if (isStock === 0 || isStock === 2) {
            // 1启用，0未启用，2关闭
            columns = columns.filter(f => f.dataIndex !== 'isStock' && f.dataIndex !== 'stockId' && f.dataIndex !== 'inventoryCode');
        }
        const tableSettingData = this.getTableSettingData();
        if (Array.isArray(tableSettingData) && tableSettingData.length > 0) {
            let cols = []
            columns.forEach(item => {
                let cell = item.dataIndex === 'operation' ? item : tableSettingData.find(f => f.id === item.dataIndex && f.isVisible);
                if (cell) {
                    item.width = cell.width || item.width;
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
    delVch = async (rowData) => {
        const confirm = await this.metaAction.modal('confirm', {
            content: `确定要删除凭证吗？`,
            width: 340
        });
        if (confirm) {
            const apiFun = this.module === 'xs' ? 'deleteSaleVoucher' : 'deletePurchaseVoucher';
            this.metaAction.sfs({
                'data.loading': true,
                'data.initPage': true,
            })
            const res = await this.webapi.bovms[apiFun]({ vchIds: [rowData.vchId], isReturnValue: true })
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
    openInventory = async (inventoryId) => {
        // inventoryId 存货出（入）库单ID，purchase-ru-ku-add-alert
        const { store, module } = this.props;
        const ret = await this.metaAction.modal('show', {
            style: { top: 5 },
            title: `查看${module==='xs'?'出':'入'}库单`,
            width: 1000,
            height: 520,
            children: this.metaAction.loadApp('app-purchase-look', {
                store: store,
                // formName: `${module==='xs'?'销售出':'采购入'}库单`,
                id: inventoryId,
                serviceTypeCode: module === 'xs' ? 'XSCK' : 'CGRK',
                flag: false,
                type: 0,
                titleName: `${module==='xs'?'销售出':'采购入'}库单`,
            })
        })
    }
    openVch = async (vchId) => {
        // vchId 凭证ID
        if (!vchId) {
            return
        }
        const { store, module } = this.props;
        const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            style: { top: 5 },
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
        const module = this.module;
        let obj, assistList;
        switch (column) {
            case 'isStock': //是否存货
                return text === '1' ? '是' : text === '0' ? '否' : '-';
            case 'stockId': //存货档案
                return record.detailList[mxKey].stockName;
            case 'acct10Id': //借方科目
                if (module === 'xs') {
                    obj = record.acct10CiName ? JSON.parse(record.acct10CiName) : {};
                    assistList = obj.assistList;
                    return `${record.acct10Code || ''} ${record.acct10Name || ''} ${assistList?'/':''}${assistList?assistList.map(m=>m.name).join('/'):''}`;
                }
                obj = record.detailList[mxKey].acct10CiName ? JSON.parse(record.detailList[mxKey].acct10CiName) : {};
                assistList = obj.assistList;
                return `${record.detailList[mxKey].acct10Code || ''} ${record.detailList[mxKey].acct10Name || ''} ${assistList?'/':''}${assistList?assistList.map(m=>m.name).join('/'):''}`;
            case 'acct20Id': //贷方科目
                if (module === 'xs') {
                    obj = record.detailList[mxKey].acct20CiName ? JSON.parse(record.detailList[mxKey].acct20CiName) : {};
                    assistList = obj.assistList;
                    return `${record.detailList[mxKey].acct20Code || ''} ${record.detailList[mxKey].acct20Name || ''} ${assistList?'/':''}${assistList?assistList.map(m=>m.name).join('/'):''}`;
                }
                obj = record.acct20CiName ? JSON.parse(record.acct20CiName) : {};
                assistList = obj.assistList;
                return `${record.acct20Code || ''} ${record.acct20Name || ''} ${assistList?'/':''}${assistList?assistList.map(m=>m.name).join('/'):''}`;
            default:
                return text;
        }
    }
    renderColumns = (text, record, column, mxKey) => {

        if (column === 'stockId' && record.editable && record.detailList && record.detailList[mxKey] && record.detailList[mxKey].isStock === '0') {
            // 不是存货时，存货档案不能编辑
            return <span className="cell-span" title={this.getColText(text, record, column, mxKey)}>{this.getColText(text, record, column, mxKey)}</span>
        }
        // if (this.module === 'cg' && column === 'acct10Id' && record.editable && record.detailList && record.detailList[mxKey] && record.detailList[mxKey].isStock === '1') {
        //     // 进项，是存货时，借方科目不能编辑－－－因为档案带回的科目辅助核算可能存在多个值， 暂时先放开编辑
        //     return <span className="cell-span" title={this.getColText(text, record, column, mxKey)}>{this.getColText(text, record, column, mxKey)}</span>
        // }

        return (
            record.editable ? this.getCellByColumn({
                column,
                value: text,
                mxKey,
                row: record,
                onChange: value => this.handleChange(value, record.id, column, mxKey)
            }) : <span className="cell-span" title={this.getColText(text, record, column, mxKey)}>{this.getColText(text, record, column, mxKey)}</span>
        )
    }
    setTargetVal(target, column, mxKey, value) {
        const isObject = Object.prototype.toString.call(value) === "[object Object]";
        const json = isObject && value.assistList ? JSON.stringify({ assistList: value.assistList }) : "{}"
        const module = this.module;
        switch (column) {
            case 'acct10Id': //借方科目
                if (module === 'xs') {
                    target.acct10Id = isObject ? value.id : undefined;
                    target.acct10Code = isObject ? value.code : undefined;
                    target.acct10Name = isObject ? value.gradeName : undefined;
                    target.acct10CiName = isObject ? json : undefined;
                } else {
                    target.detailList[mxKey].acct10Id = isObject ? value.id : undefined;
                    target.detailList[mxKey].acct10Code = isObject ? value.code : undefined;
                    target.detailList[mxKey].acct10Name = isObject ? value.gradeName : undefined;
                    target.detailList[mxKey].acct10CiName = isObject ? json : undefined;
                }
                break;
            case 'acct20Id': //贷方科目
                if (module === 'xs') {
                    target.detailList[mxKey].acct20Id = isObject ? value.id : undefined;
                    target.detailList[mxKey].acct20Code = isObject ? value.code : undefined;
                    target.detailList[mxKey].acct20Name = isObject ? value.gradeName : undefined;
                    target.detailList[mxKey].acct20CiName = isObject ? json : undefined;
                } else {
                    target.acct20Id = isObject ? value.id : undefined;
                    target.acct20Code = isObject ? value.code : undefined;
                    target.acct20Name = isObject ? value.gradeName : undefined;
                    target.acct20CiName = isObject ? json : undefined;
                }
                break;
            case 'isStock': //是否存货
                // 是否存货，由是－>否，否－>是切换，清空存货档案和借方科目-----待处理
                if ((target.detailList[mxKey][column] === '0' && value === '1') ||
                    (target.detailList[mxKey][column] === '1' && value === '0')) {
                    target.detailList[mxKey].stockId = null;
                    target.detailList[mxKey].stockName = null;

                    target.detailList[mxKey].acct10Id = undefined;
                    target.detailList[mxKey].acct10Code = undefined;
                    target.detailList[mxKey].acct10Name = undefined;
                    target.detailList[mxKey].acct10CiName = "{}";
                }
                target.detailList[mxKey][column] = !isObject ? value : undefined
                break;
            case 'stockId': //存货档案
                if (value === undefined) return;
                target.detailList[mxKey][column] = isObject ? value.id : undefined;
                target.detailList[mxKey].stockName = isObject ? `${value.code}-${value.name}${value.specification?'-':''}${value.specification || ''}` : undefined;
                // 在进项，如果档案的科目绑定
                if (module === 'cg') {
                    target.detailList[mxKey].acct10Id = isObject ? value.inventoryRelatedAccountId : undefined;
                    target.detailList[mxKey].acct10Code = isObject ? value.inventoryRelatedAccountCode : undefined;
                    target.detailList[mxKey].acct10Name = isObject ? value.inventoryRelatedAccountName : undefined;
                    target.detailList[mxKey].acct10CiName = isObject ? json : undefined;
                    // target.detailList[mxKey].acct10CiName = value.assistList ? json : undefined;
                }
                // this.setStockAndSubject(value,target.detailList[mxKey],module === 'cg' && isObject &&target.detailList[mxKey] || null, 'acct10');
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
        const { id, detailList } = row;
        if (isReadOnly || isModalEdit || (detailList && detailList.length > 4)) {
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
                'data.tableData.selectedRowKeys': fromJS([]),
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
            const { isStock } = this.props.data,
                module = this.module,
                listFiled = module === 'xs' ? 'saleDetailDtoList' : 'purchaseDetailDtoList',
                apiFun = module === 'xs' ? 'updateBillSaleInformation' : 'updateBillPurchaseInformation';
            if (!this.checkForm(target)) {
                const errorMsg = isStock ? '会计科目、存货档案不能为空' : '会计科目不能为空';
                this.metaAction.toast('error', errorMsg);
                return false;
            }
            delete target.editable;
            const rowData = {
                ...target,
                [listFiled]: setListEmptyVal(target.detailList),
                stockEnable: isStock === 1 ? 'Y' : 'N',
            }
            delete rowData.detailList;
            this.metaAction.sfs({
                'data.loading': true,
                'data.initPage': true,
            })
            const res = await this.webapi.bovms[apiFun](rowData);
            this.metaAction.sfs({
                'data.loading': false,
                'data.initPage': false,
            })
            if (res === null || res) {
                // this.metaAction.sfs && this.metaAction.sfs({
                //     'data.tableData.tableSource': fromJS(newData),
                //     'data.tableData.editingKey': '',
                // });
                this.cacheData = newData.map(item => ({ ...item }));
                this.props.reLoad && this.props.reLoad();
                this.setState({ cacheSelectKeys: [], isCheckDisabled: false });
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
            Object.assign(target, this.cacheData.filter(item => key === item.id)[0]);
            delete target.editable;
            // this.setState({ editingKey: '' });
            this.metaAction.sfs && this.metaAction.sfs({
                'data.tableData.tableSource': fromJS(newData),
                'data.tableData.editingKey': '',
                'data.tableData.selectedRowKeys': fromJS(this.state.cacheSelectKeys || [])
            })
            this.setState({ cacheSelectKeys: [], isCheckDisabled: false });
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
        const module = this.module;
        if (!item) {
            return false;
        }
        // console.log('checkForm:', item)
        if (module === 'cg') {
            // 进项，贷方科目不能为空；acct20Id：贷方，acct10Id：借方
            if (item.acct20Id === undefined || item.acct20Id < 0) {
                return false;
            }
            // 进项，借方科目、
            if (item.detailList.some(s => s.acct10Id === undefined || s.acct10Id < 0)) {
                return false;
            }
            // 存货档案不能为空
            if (item.detailList.some(ss => ss.isStock == 1 && !(typeof ss.stockId === 'number' || ss.stockId > 0))) {
                return false;
            }
        }
        if (module === 'xs') {

            // 销项，借方科目不能为空
            if (item.acct10Id === undefined || item.acct10Id < 0) {
                return false
            }
            // 销项，借方科目、
            if (item.detailList.some(s => s.acct20Id === undefined || s.acct20Id < 0)) {
                return false
            }
            // 存货档案不能为空
            if (item.detailList.some(ss => ss.isStock == 1 && !(typeof ss.stockId === 'number' || ss.stockId > 0))) {
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
        const res = await this.webapi.bovms.saveBillColumnSetup({
            module: this.module == 'xs' ? 1 : 2,
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
        if (this.module == 'xs' || this.metaAction.gf('data.accountInfo.vatTaxpayer') == '2000010002') {
            list = list.filter(f => f.id !== 'rzztDesc' && f.id !== 'dkyf');
        }
        if (this.props.data.isStock == 0 || this.props.data.isStock == 2) {
            // 1启用，0未启用，2关闭
            list = list.filter(f => f.id !== 'isStock' && f.id !== 'stockId' && f.id !== 'inventoryCode');
        }
        this.saveTableSettingData(list);
    }
    onResizeEnd(params) {
        let data = (this.metaAction.gf('data.tableData.tableSettingData').toJS() || []).map(item => {
            let cell = (params.columnDetails || []).find(f => f.fieldName === item.id)
            if (cell)
                item.width = cell.width
            return item
        })
        this.saveTableSettingData(data);
    }
    render() {
        // console.log('this.props:', this.props.store.getState())
        const { scroll, tableSetting, isCheckDisabled } = this.state;
        const { selectedRowKeys, tableSource } = this.props.data;
        // console.log('this.tableSettingData:', this.tableSettingData)
        const _columns = this.getColumns();
        const className = `bovms-editable-table ${this.props.className}`;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [{
                    key: 'all-data',
                    text: '选择全部',
                    onSelect: async () => {
                        this.metaAction.sfs({
                            'data.loading': true,
                            'data.initPage': true,
                        })
                        const apiFun = this.module === 'xs' ? 'getAllBillIdSale' : 'getAllBillIdPurchase';
                        const { yearPeriod, custName, invKindCode, rzzt, goodsName, minAmount, maxAmount, vchStateCode, accountMatchState } = this.metaAction.gf('data.filterData').toJS();
                        const { sortOptin } = this.metaAction.gf('data.tableData').toJS();
                        let orders = []
                        Object.keys(sortOptin || {}).some(key => {
                            if (sortOptin && sortOptin[key]) {
                                orders.push({ name: key, asc: sortOptin[key] === 'desc' ? false : true })
                            }
                        })
                        const res = await this.webapi.bovms[apiFun]({
                            entity: {
                                yearPeriod: yearPeriod.replace('-', ''),
                                custName: custName,
                                invKindCode: invKindCode,
                                rzzt: rzzt,
                            },
                            goodsName: goodsName,
                            minAmount: minAmount,
                            maxAmount: maxAmount,
                            vchStateCode: vchStateCode,
                            accountMatchState: accountMatchState,
                            invenState: this.props.data.isStock,
                            orders,
                        });
                        if (res && res.billBaseDtoList) {
                            this.metaAction.sfs && this.metaAction.sfs({
                                'data.tableAllList': fromJS(res.billBaseDtoList),
                                'data.tableData.selectedRowKeys': fromJS(res.billBaseDtoList.map(m => m.id)),
                                'data.totalData': fromJS({
                                    totalFpInDB: res.totalFpInDB || res.totalFpNum, //数据库发票总数
                                    totalFpNum: res.totalFpNum, // 总的发票张数
                                    positiveAmount: res.positiveAmount, // 正价税合计总数
                                    positiveTaxAmount: res.positiveTaxAmount, // 正税额总数
                                    negativeAmount: res.negativeAmount, // 负价税合计总数
                                    negativeTaxAmount: res.negativeTaxAmount, // 负税额总数
                                    nonVchState2FpNum: res.nonVchState2FpNum, // 未记账（未生成凭证或者生成凭证失败）发票数
                                }),
                            });
                        }
                        this.metaAction.sfs({
                            'data.loading': false,
                            'data.initPage': false,
                        })
                        // [...tableSource.keys()].join().split(',')
                    },
                },
                {
                    key: 'no-data',
                    text: '取消选择',
                    onSelect: () => {
                        this.metaAction.sfs && this.metaAction.sfs({
                            'data.tableData.selectedRowKeys': fromJS([]),
                            'data.tableAllList': fromJS([]),
                        })
                    },
                },
            ],
            getCheckboxProps: record => ({
                ...record,
                disabled: isCheckDisabled && !record.editable ? true : false,
            })
        };
        const tableSettingData = this.getTableSettingData();
        return (
            <React.Fragment>
                <Table 
                    rowSelection={rowSelection}
                    className={className}
                    bordered 
                    dataSource={tableSource}
                    scroll={scroll} 
                    columns={_columns} 
                    pagination={false}
                    rowKey='id'
                    onRow={this.onRow}
                    allowColResize
                    onResizeEnd={::this.onResizeEnd}
                    rowClassName={record=>{
                        if(isCheckDisabled&&!record.editable)
                            return 'bovms-row-disabled'
                        if(isCheckDisabled && record.editable)
                            return 'ant-table-row-selected'
                        return ''
                    }}
                    // remberName={'bovms-app-table-'+this.module}
                />
                <TableSettingCard 
                    showTitle={false}
                    data={tableSettingData||[]}
                    positionClass={className}
                    visible={tableSetting}
                    confirmClick={::this.tableSettingOk}
                    cancelClick={::this.tableSettingCancel}
                    resetClick={::this.tableSettingReset}
                />
            </React.Fragment>
        );
    }
}