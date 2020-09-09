import React from "react";
// import { findDOMNode } from 'react-dom'
import {
    DataGrid,
    Button,
    Row,
    Col,
    Dropdown,
    Menu,
    Pagination,
    Spin
} from "edf-component";
import { fromJS, toJS } from "immutable";
import { Input, Select, Icon, Switch } from "antd";
import { number } from "edf-utils";
import SelectSubject from "./selectSubject/index";
import SetSameSubject from "./setSameSubject";
import SelectStock from "./selectStock";
import SetSameFile from "./setSameFile";
import BatchAddSubject from "./batchAddSubject";
import SimplePagination from "./SimplePagenation";
import {
    setListEmptyVal,
    subjectIncludeAssist,
    handleGetModalContainer
} from "../utils/index";
import SelectAssist from "./selectAssist";
import BatchSetting from "./batchSetting";
import renderDataGridCol from "./column/index";
import AutoMatchSetting from "./autoMatchSetting"
import MatchOptions from './batchSubjectSetting/matchOptions'
const Option = Select.Option


export default class RowEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            dataSource: [],
            pagination: {
                currentPage: 1, //-- 当前页
                pageSize: 50, //-- 页大小
                totalCount: 50, //-- 总计
                totalPage: 1 //-- 总页数
            },
            cacheData: props.data || {},
            loading: true,
            filterValue: null,
            settingData: {},
            columnSwitchValue: true
        };
        this.scroll = this.getTableScroll();
        this.webapi = props.webapi || {};
        this.metaAction = props.metaAction || {};
        this.module = props.module;
        this.isReadOnly = props.isReadOnly;
        props.setOkListener && props.setOkListener(this.onOk);
        this.dataGridKey = "bovms-" + this.module + "-row-edit-table";
    }
    componentDidMount() {
        this.init()
    }
    async init() {
        this.setState({ loading: true });
        const apiFun =
            this.module == "xs"
                ? "getBillSaleInformation"
                : "getBillPurchaseInformation";
        const rowRes = await this.webapi.bovms[apiFun]({ id: this.props.id });

        if (!rowRes) {
            console.error("错误:", apiFun);
            this.setState({ loading: false });
            return;
        }
        //初始化ID
        let detailList = (rowRes.purchaseDetailDtoList || rowRes.saleDetailDtoList).map(e => {
            e.billIdArray = [`${rowRes.id};${e.indexNo}`]
            e.billIdList = null
            return e
        })
        rowRes.billIdList = [rowRes.id]
        rowRes.billIdArray = null

        let rowData = {
            ...rowRes,
            needMemory: 1,
            detailList: detailList
        };
        if (rowData.purchaseDetailDtoList) {
            delete rowData.purchaseDetailDtoList;
        }
        if (rowData.saleDetailDtoList) {
            delete rowData.saleDetailDtoList;
        }
        this.setState({ cacheData: rowData }, () => {
            this.getSetting()
            this.pageChanged();
        });
    }
    async getSetting() {
        const { module, isStock, metaAction } = this.props
        const { cacheData } = this.state
        let yearPeriod = parseInt(metaAction.gf(
            "data.accountInfo.yearPeriod"
        ).replace("-", ""));
        let params = {
            yearPeriod,                 //当前会计期间（必传）
            module: module === 'cg' ? 2 : 1,                          //模块名称，1：销项；2：进项（必传）
            inventoryEnableState: isStock        //存货启用状态，1：启用；0：没有启用（必传）
        }
        let res = await this.webapi.bovms.queryAccountingSetupRule(params)
        if (res) {
            //判断是否开启自动匹配,如果开启自动匹配 初始化数据
            if (module === 'xs' ? res.account20MatchDto.systemAutoMatchAccountAndStock === '1' : res.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
                cacheData.detailList = cacheData.detailList.map(e => {
                    this.isShowSwitch(e)
                    return e
                })
                this.setState({
                    settingData: res,
                    cacheData,
                    loading: false
                })
            } else {
                this.setState({
                    settingData: res,
                    loading: false
                })
            }
        }

    }
    isShowSwitch(row) {
        const { isStock, module } = this.props
        let assis = row[module === 'cg' ? 'acct10CiName' : 'acct20CiName']
        let json = assis ? JSON.parse(assis).assistList : null
        row.needMemory = 1
        row.showSwitch = true
        //进项
        if (module === 'cg') {
            //是否启用存货
            if (isStock) {
                //启用存货时，【是否存货】为【是】的记录
                if (row.isStock === '1') {
                    //存货档案未设置时，不显示开关。
                    if (!row.stockId || !row.acct10Id) {
                        row.needMemory = 0
                        row.showSwitch = false
                    }
                } else {//启用存货时，【是否存货】为【否】的记录，借方科目未设置时，不显示开关。
                    if (!row.acct10Id) {
                        row.needMemory = 0
                        row.showSwitch = false
                    }
                }
            } else {
                //未启用存货时，借方科目未设置时，不显示开关
                if (!row.acct10Id) {
                    row.needMemory = 0
                    row.showSwitch = false
                }
            }
            //明细细中借方科目带有【存货档案】之外的辅助核算时，显示了‘记住结果’开关；
            if (Array.isArray(json) && json.some(s => s.type != 'calcInventory')) {
                row.needMemory = 0
                row.showSwitch = false
            }
        } else {//销项
            //是否启用存货
            if (isStock) {
                //存货档案和科目，其中一个未设置，不显示开关
                if (!row.stockId || !row.acct20Id) {
                    row.needMemory = 0
                    row.showSwitch = false
                }
            } else {
                //未启用存货时，科目未设置时，不显示开关
                if (!row.acct20Id) {
                    row.needMemory = 0
                    row.showSwitch = false
                }
            }
            //细中借方科目带有【存货档案】之外的辅助核算时，显示了‘记住结果’开关；
            if (Array.isArray(json) && json.some(s => s.type != 'calcInventory')) {
                row.needMemory = 0
                row.showSwitch = false
            }
        }

    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    }
    onCellChange = row => {
        const { module } = this.props
        const { settingData } = this.state
        let newCacheData = this.state.cacheData;
        const newCacheDList = [...newCacheData.detailList];
        const rowIndex = newCacheDList.findIndex(
            f => f.indexNo === row.indexNo
        );
        const rowItem = newCacheDList[rowIndex];
        //判断按钮是否显示
        if (module === 'xs' ? settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' : settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
            this.isShowSwitch(row)
        }
        newCacheDList.splice(rowIndex, 1, { ...rowItem, ...row });
        this.setState({ cacheData: {...newCacheData, detailList: newCacheDList} });
    };
    onCellSwitchChange = (row, e) => {
        const newCacheData = this.state.cacheData;
        const newCacheDList = [...newCacheData.detailList];
        const rowIndex = newCacheDList.findIndex(
            f => f.indexNo === row.indexNo
        );
        newCacheData.detailList[rowIndex].needMemory = e ? 1 : 0;
        //全部开关打开，总开关打开，全部开关关闭,总开关关闭
        if (newCacheData.detailList.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {
            this.setState({ cacheData: newCacheData, columnSwitchValue: true })
        } else if (newCacheData.detailList.filter(f => f.showSwitch).every(e => e.needMemory === 0)) {
            this.setState({ cacheData: newCacheData, columnSwitchValue: false })
        } else {
            this.setState({ cacheData: newCacheData })
        }
    }
    checkForm(item) {
        const module = this.module
        const { isStock } = this.props
        if (!item) {
            return false
        }
        // console.log('checkForm:', item)
        if (module === "cg") {
            // 进项，贷方科目不能为空；acct20Id：贷方，acct10Id：借方
            // if (item.acct20Id === undefined || item.acct20Id < 0) {
            //     return false
            // }
            // 进项，借方科目、
            if (item.detailList.some(s => s.acct10Id === undefined || s.acct10Id < 0)) {
                return false
            }
            // 存货档案不能为空
            if (
                isStock == 1 &&
                item.detailList.some(
                    ss => ss.isStock == 1 && !(typeof ss.stockId === "number" || ss.stockId > 0)
                )
            ) {
                return false
            }
        }
        if (module === "xs") {
            // 销项，借方科目不能为空
            // if (item.acct10Id === undefined || item.acct10Id < 0) {
            //     return false
            // }
            // 销项，借方科目、
            if (item.detailList.some(s => s.acct20Id === undefined || s.acct20Id < 0)) {
                return false
            }
            // 存货档案不能为空
            if (
                isStock == 1 &&
                item.detailList.some(
                    ss => ss.isStock == 1 && !(typeof ss.stockId === "number" || ss.stockId > 0)
                )
            ) {
                return false
            }
        }
        return true
    }
    onOk = async (e) => {
        
        const { cacheData, settingData } = this.state;
        const isStock = this.props.isStock,
            module = this.module,
            listFiled =
                module === "xs" ? "saleDetailDtoList" : "purchaseDetailDtoList",
            apiFun =
                module === "xs"
                    ? "batchUpdateSaleBillInfo"
                    : "batchUpdatePurchaseBillInfo";
        let defaultData = {
            billIdList: null,
            billIdArray: null,
            acct10Id: null,
            acct10CiName: null,
            turnOnNeedMemoryFlagOnly: null,
            multipleAcct10Id: null,
            matchSource: null,
            needMemory: null,
            acctMultiMatchDtoList: null,
            isStock: null,
            stockId: null,
            multipleStockId: null,
            stockMatchSource: null,
            stockMultiMatchDtoList: null,
            acct20Id: null,
            acct20CiName: null,
            multipleAcct20Id: null,
            acctMatchSource: null,
        }
        let selectStock = false
        //补全全参数
        cacheData.detailList = cacheData.detailList.map(e => {
            if (!e.isModifyAcct && e.needMemory) {
                e.turnOnNeedMemoryFlagOnly = 1
            }
            e = Object.assign({}, defaultData, e)
            e.isStock == 1 && (selectStock = true)
            return e
        })
        // if (!this.checkForm({detailList: cacheData.detailList})) {
        //     let name = module == 'cg' ? '借方' : '贷方'
        //     const errorMsg = selectStock && isStock == 1 ? `${name}科目、存货档案不能为空` : `${name}科目不能为空`
        //     this.metaAction.toast("error", errorMsg)
        //     return false
        // }

        let assis = cacheData[module === 'cg' ? 'acct20CiName' : 'acct10CiName']
        let json = assis ? JSON.parse(assis).assistList : null
        //1.【进项】贷方科目为空时不显示开关，【销项】借方科目为空时不显示开关
        //2.【进项】【贷方科目匹配-自动根据记忆库进行匹配（智能记忆）】开关为开启时才显示，【销项】【借方科目匹配-自动根据记忆库进行匹配（智能记忆）】开关为开启时才显示。
        //3.科目带有2个或2个以上辅助核算时不显示
        if (!((module === "xs" ? cacheData.acct10Id : cacheData.acct20Id) &&
            (module === "xs" ? settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') &&
            !(Array.isArray(json) && json.length > 1))) {
            cacheData.needMemory = 0
        }

        const yearPeriod = parseInt(this.metaAction.gf("data.accountInfo.yearPeriod").replace("-", ""))

        const rowData = {
            yearPeriod: yearPeriod,
            updateType: 2,
            inventoryEnableState: isStock === 1 ? 1 : 0
        }

        if (module === 'cg') {
            rowData.debitSetupList = setListEmptyVal(cacheData.detailList)
            delete cacheData.detailList
            rowData.creditSetupList = [{ ...cacheData }]
        } else {
            rowData.creditSetupList = setListEmptyVal(cacheData.detailList)
            delete cacheData.detailList
            rowData.debitSetupList = [{ ...cacheData }]
        }

        const res = await this.webapi.bovms[apiFun](rowData);
        if (res === null || res) {
            return { needReload: true };
        }
        return true;
    };
    handleMenuClick = (e, key) => {
        e && e.preventDefault && e.preventDefault();
        // console.log('handleMenuClick:', e.key);
        if (key === "patchAddSubject") {
            this.openBatchAddSubject();
        }
        if (key === "patchAddArchives") {
            this.openBatchAddArchives();
        }
        if (key === 'autoMatchSetting') {
            this.autoMatchSetting()
        }
    };
    async autoMatchSetting() {
        const { module, isStock } = this.props
        const { settingData } = this.state
        const yearPeriod = parseInt(
            this.metaAction.gf("data.accountInfo.yearPeriod").replace("-", "")
        )
        let res = await this.metaAction.modal("show", {
            title: "核算精度和自动匹配设置",
            style: { top: 25 },
            width: 960,
            footer: null,
            children: (
                <AutoMatchSetting
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    data={settingData}
                    yearPeriod={yearPeriod}
                    defaultActiveKey={'2'}
                    module={module === 'cg' ? 2 : 1}
                    inventoryEnableState={isStock === 1 ? 1 : 0}
                />
            )
        })
        if (typeof res != "boolean") {
            this.setState({
                settingData: res
            })
        }
    }
    pageChanged = (current, pgSize) => {
        let { pagination, cacheData, filterValue, settingData } = this.state;
        let { module, isStock } = this.props
        let detailList = cacheData.detailList || [];
        let { currentPage, pageSize, totalCount, totalPage } = pagination || {};
        let dataSource = [];
        pageSize = pgSize || pageSize || 50; //-- 页大小
        totalCount = detailList.length || 0;
        totalPage = Math.ceil(totalCount / pageSize);
        currentPage = current || currentPage || 1; //-- 当前页
        if (currentPage > totalPage) {
            currentPage = totalPage;
        }
        let idKey = module === 'cg' ? 'acct10Id' : 'acct20Id'
        //根据筛选条件过滤数据

        if (module === 'xs' ?
            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
            if (filterValue != null) {
                //未设置的逻辑
                if (filterValue === 4) {
                    detailList = detailList.filter(e => {
                        //启用存货
                        if (isStock === 1) {
                            //是否存货
                            if (e.isStock == "1") {
                                //未设置科目或未设置存货档案
                                if (!e[idKey] || !e["stockId"]) {
                                    return e
                                }
                            } else {
                                //未设置科目
                                if (!e[idKey]) {
                                    return e
                                }
                            }
                        } else {//未启用存货
                            //未设置科目
                            if (!e[idKey]) {
                                return e
                            }
                        }
                    })
                } else {
                    detailList = detailList.filter(f => f.matchSource === filterValue)
                }

            }
        } else {
            if (filterValue != null) {
                //未设置的逻辑
                if (filterValue === 4) {
                    detailList = detailList.filter(e => {
                        //启用存货
                        if (isStock === 1) {
                            //是否存货
                            if (e.isStock == "1") {
                                //未设置科目或未设置存货档案
                                if (!e[idKey] || !e["stockId"]) {
                                    return e
                                }
                            } else {
                                //未设置科目
                                if (!e[idKey]) {
                                    return e
                                }
                            }
                        } else {
                            //未设置科目
                            if (!e[idKey]) {
                                return e
                            }
                        }
                    })
                } else {
                    //已设置的逻辑
                    detailList = detailList.filter(e => {
                        //启用存货
                        if (isStock === 1) {
                            //是否存货
                            if (e.isStock == "1") {
                                //设置了科目并设置了存货档案
                                if (e[idKey] && e["stockId"]) {
                                    return e
                                }
                            } else {
                                //设置了科目
                                if (e[idKey]) {
                                    return e
                                }
                            }
                        } else {
                            //设置了科目
                            if (e[idKey]) {
                                return e
                            }
                        }
                    })
                }
            }
        }
        dataSource = detailList.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
        pagination = { currentPage, pageSize, totalCount, totalPage };
        this.setState({
            selectedRowKeys: [],
            pagination,
            dataSource
        });
    };
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    getTableScroll() {
        let _columns = this.getColumn(this.props.isReadOnly);
        if (this.props.isStock !== 1) {
            _columns = _columns.filter(
                f => f.dataIndex !== "isStock" && f.dataIndex !== "stockId"
            );
        }
        let width = _columns.reduce(
            (a, b) =>
                (a && a.width !== undefined ? a.width : a || 0) +
                ((b && b.width) || 0)
        ),
            fixedCol = _columns.filter(f => f.fixed),
            fixedWidth =
                fixedCol.length > 1
                    ? fixedCol.reduce(
                        (a, b) =>
                            ((a && a.width) || 0) + ((b && b.width) || 0)
                    )
                    : (fixedCol[0] && fixedCol[0].width) || 0;
        return { y: 319, x: width + fixedWidth };
    }
    onCell = record => {
        return {
            onClick: event => {
                const { selectedRowKeys, editable } = this.state;
                const index = selectedRowKeys.findIndex(
                    f => f.toString() === record.indexNo.toString()
                );
                if (index > -1) {
                    selectedRowKeys.splice(index, 1);
                } else {
                    selectedRowKeys.push(record.indexNo);
                }
                this.setState({ selectedRowKeys });
            } // 点击行
        };
    };
    onRowClick(e, index) {
        if (this.props.isReadOnly) return;
        const columnKey = e && e.target && e.target.attributes["columnKey"];
        if (columnKey && columnKey.value) {
            let { selectedRowKeys, dataSource } = this.state,
                key = dataSource[index]["indexNo"];
            if (selectedRowKeys.includes(Number(key))) {
                selectedRowKeys = selectedRowKeys.filter(
                    f => f !== Number(key)
                );
            } else {
                selectedRowKeys.push(Number(key));
            }
            this.setState({ selectedRowKeys });
        }
    }
    calcTotal = () => {
        const { selectedRowKeys, cacheData } = this.state;
        let field = "amount",
            details = (cacheData && cacheData.detailList) || [];
        details =
            selectedRowKeys && selectedRowKeys.length > 0
                ? details.filter(
                    f => selectedRowKeys.findIndex(ff => ff == f.indexNo) > -1
                )
                : details;
        let list = details
            .filter(f => f[field] !== undefined && f[field] !== null)
            .map(item => Number(item[field])),
            total = !isNaN(list[0]) ? list.reduce((a, b) => a + b) : undefined,
            _total = !isNaN(total) ? parseFloat(total).toFixed(2) : undefined;
        return this.quantityFormat(_total, 2, false, false);
    };
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true) return v;
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === "string") {
            let [a, b] = val.split(".");
            return b && Number(b)
                ? `${a}.${Number(`0.${b}`)
                    .toString()
                    .slice(2)}`
                : a;
        }
        return val;
    };
    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero);
        }
    };
    rounding(val) {
        if (!val) return ''
        let [a, b] = val.split(".")
        return b && Number(b)
            ? `${a}.${((Math.round(Number(`0.${b}`) * 100) / 100) + '').slice(2)}`
            : a
    }
    // 修改函数
    handerChange = (value, dataIndex) => {
        if (dataIndex === "acct20Id" || dataIndex === "acct10Id") {
            //贷方科目－进项:acct20Id，借方科目－销项：acct10Id
            const isObject = this.isObject(value),
                json =
                    isObject && value.assistList
                        ? JSON.stringify({ assistList: value.assistList })
                        : "",
                { cacheData, settingData } = this.state,
                { module, isReadOnly } = this.props,
                field = dataIndex.substr(0, 5);
            cacheData[`${field}0Id`] = isObject ? value.id : undefined;
            cacheData[`${field}0Code`] = isObject ? value.code : undefined;
            cacheData[`${field}0Name`] = isObject ? value.gradeName : undefined;
            cacheData[`${field}0CiName`] = isObject ? json : undefined;
            cacheData.acctMatchSource = 0
            cacheData.matchSource = 0
            this.setState({ cacheData });
        }
    };
    // 设置借方科目值
    setJfkmOrDfkmValue(item, ret) {
        const { isStock } = this.props,
            json =
                ret.assistList && ret.assistList.length > 0
                    ? JSON.stringify({ assistList: ret.assistList })
                    : "",
            module = this.module,
            filed = module === "xs" ? "acct2" : "acct1";
        item[`${filed}0Id`] = ret.id;
        item[`${filed}0Code`] = ret.code;
        item[`${filed}0Name`] = ret.gradeName;
        item[`${filed}0CiName`] = json;
        item.matchSource = 0
        item.acctMatchSource = 0
        item.isModifyAcct = true
        if (isStock === 1) {
            // 如果该月度启用了存货，将对应项目的【是否存货】设置为【否】
            item.isStock = "0";
            // 请掉存货数据
            item.stockId = undefined;
            item.stockName = undefined;
            item.stockMatchSource = 0
        }
        this.isShowSwitch(item)
    }
    // 设置档案和进项的借方科目
    setArchivesAndSubjectValue(item, ret) {
        const isObject = this.isObject(ret);
        const json = isObject
            ? JSON.stringify({ assistList: ret.assistList })
            : "";
        item.stockId = isObject ? ret.id : undefined;
        item.propertyName = isObject ? ret.propertyName : undefined;
        item.stockName = isObject
            ? `${ret.code && ret.code}-${ret.name}${
            ret.specification ? "-" : ""
            }${ret.specification || ""}`
            : undefined;
        item.isStock = isObject ? "1" : item.isStock;
        item.stockMatchSource = 0
        item.isModifyAcct = true
        item.matchSource = 0
        // 在进项，如果档案的科目有辅助核算，则将其设为借方科目，否则，将借方科目置空
        if (this.module === "cg" && isObject) {
            item.acct10Id = ret.inventoryRelatedAccountId;
            item.acct10Code = ret.inventoryRelatedAccountCode;
            item.acct10Name = ret.inventoryRelatedAccountName;
            item.acct10CiName = ret.assistList ? json : undefined;
            item.acctMatchSource = 0
        }
        this.isShowSwitch(item)
    }
    // 设为相同科目
    openSetSameSubject = async () => {
        const { webapi, metaAction, store, module, isStock } = this.props;
        const { selectedRowKeys, cacheData, dataSource } = this.state;
        if (selectedRowKeys.length <= 0) {
            this.metaAction.toast("error", "请选择需要操作的数据");
            return;
        }
        const ret = await this.metaAction.modal("show", {
            title: "设为相同科目",
            style: { top: 5 },
            width: 400,
            // wrapClassName: 'bovms-app-purchase-list-habit-setting',
            children: (
                <SetSameSubject
                    metaAction={metaAction}
                    store={store}
                    webapi={webapi}
                    selectedRowKeys={selectedRowKeys}
                    module={module}
                    isStockMonth={isStock}
                    subjectType={module === "xs" ? "dfkm" : "jfkm"}
                />
            )
        });
        if (ret && ret.id) {
            cacheData.detailList.forEach(item => {
                if (
                    item &&
                    selectedRowKeys &&
                    selectedRowKeys.findIndex(f => f == item.indexNo) > -1
                ) {
                    this.setJfkmOrDfkmValue(item, ret);
                }
            });
            this.setState({ cacheData });
        }
    };
    //自动匹配
    async autoMatch() {
        let { selectedRowKeys, cacheData } = this.state
        let { metaAction, module, isStock } = this.props
        let ids = []
        let yearPeriod = metaAction.gf("data.accountInfo.yearPeriod").replace("-", "");
        let optionRes = await this.metaAction.modal("show", {
            title: `自动匹配${module === 'cg' ? '借方科目' : '贷方科目'}`,
            style: { top: 25 },
            width: 460,
            children: (
                <MatchOptions defaultValue={2} />
            )
        })
        if (optionRes) {
            if (optionRes === 2) {
                cacheData.detailList.forEach(e => {
                    ids = ids.concat(e['billIdArray'])
                })
            } else {
                cacheData.detailList.forEach(e => {
                    if (e.matchSource != 0) {
                        ids = ids.concat(e['billIdArray'])
                    }
                })
                if (!ids.length) {
                    return this.metaAction.toast('error', '无需要匹配的数据')
                }
            }

            let params = {
                yearPeriod: yearPeriod,                    // 会计期间，格式：yyyymm，如：201909（必传）
                inventoryEnableState: isStock,          // 存货启用状态，1：启用；0：没有启用（必传）
                autoMatchType: 1,                       // 自动科目匹配类型，1：单张发票匹配；2：批量设置科目，借方匹配；3：批量设置科目，贷方匹配（必传）
                billIdArray: ids
            }
            this.setState({ loading: true })
            let res = await this.props.webapi.bovms[module === 'cg' ? 'purchaseAutoMatchAccount' : 'saleAutoMatchAccount'](params)
            if (res) {
                cacheData.detailList.forEach(item => {
                    let dItem = (res.creditSetupList || res.debitSetupList).find(f => f.billIdArray.toString() == item.billIdArray.toString())
                    if (dItem) {
                        item.isModifyAcct = true
                        //接口未返回matchSource，赋值null
                        if (!dItem.matchSource) {
                            item.matchSource = null
                        }
                        //接口未返回acctMatchSource，赋值null
                        if (!dItem.acctMatchSource) {
                            item.acctMatchSource = null
                        }
                        //接口未返回stockMatchSource，赋值null
                        if (!dItem.stockMatchSource) {
                            item.stockMatchSource = null
                        }
                        //接口未返回stockId，赋值null
                        if (!dItem.stockId) {
                            item.stockId = null
                            item.stockName = null
                        }

                        if (module === 'cg') {
                            //接口未返回借方科目
                            if (!dItem.acct10Id) {
                                item.acct10Id = null
                                item.acct10Code = null
                                item.acct10Name = null
                                item.acct10CiName = null
                            }
                        }
                        if (module === 'xs') {
                            //接口未返回贷方科目
                            if (!dItem.acct20Id) {
                                item.acct20Id = null
                                item.acct20Code = null
                                item.acct20Name = null
                                item.acct20CiName = null
                            }
                        }
                        Object.keys(dItem).forEach(keys => {
                            item[keys] = dItem[keys]
                        })
                        this.isShowSwitch(item)
                    }

                })

                this.props.metaAction.toast('success', '自动匹配完毕')
                this.setState({ cacheData, loading: false });
            }
        }

    }
    // 设为相同档案
    openSetSameFile = async () => {
        const { webapi, metaAction, store, module, isStock } = this.props;
        const { selectedRowKeys, cacheData, dataSource } = this.state;
        if (selectedRowKeys.length <= 0) {
            this.metaAction.toast("error", "请选择需要操作的数据");
            return;
        }
        const ret = await this.metaAction.modal("show", {
            title: "设为相同档案",
            style: { top: 5 },
            width: 1200,
            children: (
                <SetSameFile
                    metaAction={metaAction}
                    store={store}
                    webapi={webapi}
                    module={module}
                    isStock={isStock}
                />
            )
        });
        if (ret && ret.id) {
            cacheData.detailList.forEach(item => {
                if (
                    item &&
                    selectedRowKeys &&
                    selectedRowKeys.findIndex(f => f == item.indexNo) > -1
                ) {
                    this.setArchivesAndSubjectValue(item, ret);
                }
            });
            this.setState({ cacheData });
        }
    };
    // 批增科目
    openBatchAddSubject = async () => {
        const { webapi, metaAction, store, module, isStock } = this.props;
        const { selectedRowKeys, cacheData, dataSource, settingData } = this.state;
        if (selectedRowKeys.length <= 0) {
            this.metaAction.toast("error", "请选择需要操作的数据");
            return;
        }
        const subjectItems = [];
        // 按选择的顺序传值
        
        // let { groupByRule } = settingData.businessAccountingDto.accountingDto

        selectedRowKeys.forEach(key => {
            let item = dataSource.find(f => f.indexNo === key);
            if (item) {
                // if ((groupByRule === '2' || groupByRule === '3' || groupByRule === '4') && item["specification"]) {
                //     subjectItems.push({
                //         name: item.goodsName + `-${item["specification"]}`,
                //         unit: item.unitName
                //     });
                // } else {
                    // 按商品或服务名称
                    subjectItems.push({
                        name: item.goodsName,
                        unit: item.unitName
                    });
                // }
            }
        });
        //isStock，会计月份，是否启用存货
        //subjectItems，已选待新增的科目名称数组,如：［'购方名称1','购方名称2'］
        const ret = await this.metaAction.modal("show", {
            title: "批增会计科目",
            width: 700,
            style: { top: 5 },
            footer: null,
            closeModal: this.close,
            closeBack: back => {
                this.closeTip = back;
            },
            children: (
                <BatchAddSubject
                    metaAction={metaAction}
                    store={store}
                    webapi={webapi}
                    module={module}
                    isStock={isStock}
                    subjectType={module === "xs" ? "dfkm" : "jfkm"}
                    subjectItems={subjectItems}
                ></BatchAddSubject>
            )
        });
    };
    getArchivesByBatchRule(selectedRowKeys, dataSource, batchsetupRule) {
        let archives = [];
        selectedRowKeys.forEach(s => {
            let dItem = dataSource.find(f => f.indexNo == s),
                aItem = archives.find(
                    a =>
                        a.name === dItem.goodsName &&
                        a.specification === dItem.specification
                );
            if (aItem) {
                if (dItem.unitName) {
                    if (aItem.invoiceUnit)
                        aItem.invoiceUnit += "," + dItem.unitName;
                    else aItem.invoiceUnit = dItem.unitName;
                }
                aItem.key += "," + s;
            } else {
                archives.push({
                    key: String(s),
                    name: dItem.goodsName,
                    specification: dItem.specification,
                    invoiceUnit:
                        (dItem.unitName && String(dItem.unitName)) || "",
                    unitPrice: dItem.unitPrice
                });
            }
        });
        archives.map(item => {
            item.key = [...new Set(item.key.split(","))].join();
            item.invoiceUnit =
                item.invoiceUnit &&
                [...new Set(item.invoiceUnit.split(","))].join();
            delete item.unitPrice;
        });
        return archives;
    }
    // 批增存货档案
    openBatchAddArchives = async () => {
        const { webapi, metaAction, store, module, isStock } = this.props;
        const { selectedRowKeys, cacheData, dataSource } = this.state;
        if (selectedRowKeys.length <= 0) {
            this.metaAction.toast("error", "请选择需要操作的数据");
            return;
        }
        const archives = this.getArchivesByBatchRule(
            selectedRowKeys,
            dataSource,
            null
        );
        // archives.some(er=>er.key===undefined) && console.error('openBatchAddArchives archives error:', archives)
        //isStock，会计月份，是否启用存货
        //archives，已选待新增的科目名称数组,如：［'购方名称1','购方名称2'］
        const ret = await this.metaAction.modal("show", {
            title: "批增存货档案",
            width: 1200,
            height: 520,
            style: { top: 5 },
            children: this.metaAction.loadApp("ttk-app-inventoryAdd-card", {
                store: store,
                details: archives
            })
        });
        if (Array.isArray(ret)) {
            this.metaAction.toast(
                "success",
                `成功新增了 ${ret.length} 条存货档案`
            );
            // 查找存货档案所带科目
            const subjectIds = ret.map(m => m.inventoryRelatedAccountId);
            if (subjectIds) {
                const subjectList = await this.webapi.bovms.getAccountCodeByIds(
                    { ids: [...new Set(subjectIds)] }
                );
                // 如果只有存货核算项目的，则添加，否则科目置空
                if (Array.isArray(subjectList)) {
                    subjectList.forEach(sbItem => {
                        let calcList = subjectIncludeAssist(sbItem, true);
                        ret.forEach(re => {
                            if (
                                re &&
                                re.inventoryRelatedAccountId == sbItem.id
                            ) {
                                re.inventoryRelatedAccountCode = sbItem.code;
                                re.inventoryRelatedAccountName =
                                    sbItem.gradeName;
                                // 场景1：选择的存货档案的存货科目不为空，且存货科目不带有辅助核算
                                if (calcList.length === 0) {
                                    re.assistList = null;
                                }
                                // 场景2：选择的存货档案的存货科目不为空，存货科目带有且仅带有【存货档案】辅助核算
                                if (
                                    calcList.length === 1 &&
                                    calcList[0] === "inventory"
                                ) {
                                    re.isCalcInventory = true;
                                    re.assistList = [
                                        {
                                            id: re.id,
                                            name: re.name,
                                            type: "calcInventory"
                                        }
                                    ];
                                }
                            }
                        });
                    });
                }
            }
            selectedRowKeys.forEach(key => {
                const dtItem = cacheData.detailList.find(f => f.indexNo == key);
                if (dtItem) {
                    const item = ret.find(
                        ff =>
                            ff.key &&
                            String(ff.key)
                                .split(",")
                                .includes(String(key))
                    );
                    item && this.setArchivesAndSubjectValue(dtItem, item);
                }
            });
            // console.log('openBatchAddArchives:', ret, cacheData)
            this.setState({ cacheData });
        }
    };
    close = ret => {
        this.closeTip && this.closeTip();
        if (ret && Array.isArray(ret)) {
            const { selectedRowKeys, cacheData, dataSource } = this.state;
            // 按选择的顺序回填
            selectedRowKeys.forEach((rk, index) => {
                const item = cacheData.detailList.find(f => f.indexNo == rk);
                if (item && ret[index]) {
                    this.setJfkmOrDfkmValue(item, ret[index]);
                }
            });
            // console.log('BatchAddSubject close:', selectedRowKeys, ret)
            this.setState({ cacheData });
        }
    };
    onColumnSwitchChange(e) {
        let { cacheData } = this.state
        cacheData.detailList = cacheData.detailList.map(item => {
            if (item.showSwitch) {
                item.needMemory = e ? 1 : 0
            }
            return item
        })
        this.setState({
            cacheData,
            columnSwitchValue: e
        })
    }
    getColumn(isReadOnly) {
        const { currentPage, pageSize } = this.state.pagination
        const { module } = this.props
        const { selectedRowKeys, cacheData, dataSource, settingData } = this.state,
            colOption = {
                dataSource,
                selectedRowKeys,
                width: 100,
                fixed: false,
                align: "left",
                className: "",
                flexGrow: 0,
                lineHeight: 37,
                isResizable: false
            };
        let columns = [
            {
                width: 50,
                title: '序号',
                dataIndex: "xh",
                textAlign: 'center',
                key: "xh",
                render: (text, record, index) => {
                    return (index + 1) + ((currentPage - 1) * pageSize)
                }
            },
            {
                title: "商品或服务名称",
                dataIndex: "goodsName",
                // width: 200,
                onCell: isReadOnly ? null : this.onCell,
                textAlign: 'left',
                flexGrow: 1,
            },
            {
                title: "规格型号",
                dataIndex: "specification",
                // width: 150,
                onCell: isReadOnly ? null : this.onCell,
                textAlign: 'left'
            },
            {
                title: "单位",
                dataIndex: "unitName",
                width: 60,
                onCell: isReadOnly ? null : this.onCell,
            },
            {
                title: "数量",
                dataIndex: "qty",
                width: 60,
                textAlign: "right",
                onCell: isReadOnly ? null : this.onCell
            },
            {
                title: "单价",
                dataIndex: "unitPrice",
                width: 80,
                textAlign: "right",
                onCell: isReadOnly ? null : this.onCell,
                render: text => this.rounding(this.quantityFormat(text, 3, false, false))
            },
            {
                title: "金额",
                dataIndex: "exTaxAmount",
                width: 100,
                textAlign: "right",
                onCell: isReadOnly ? null : this.onCell,
                render: text => this.quantityFormat(text, 2, false, false)
            },
            {
                title: "税额",
                dataIndex: "taxAmount",
                width: 100,
                textAlign: "right",
                onCell: isReadOnly ? null : this.onCell,
                render: text => this.quantityFormat(text, 2, false, false)
            },
            {
                title: "是否存货",
                dataIndex: "isStock",
                width: 70,
                fixed: isReadOnly ? false : "right",
                className: isReadOnly ? "" : "no-padding",
                render: (text, record) => {
                    const { webapi, metaAction, store, module } = this.props;
                    return (
                        <EditableCell
                            key={`EditableCell-isStock-${record.indexNo}`}
                            value={text}
                            record={record}
                            dataIndex="isStock"
                            handleSave={row => this.onCellChange(row)}
                            webapi={webapi}
                            metaAction={metaAction}
                            store={store}
                            module={module}
                            isReadOnly={isReadOnly}
                        />
                    );
                }
            },
            {
                title: "存货档案",
                dataIndex: "stockId",
                width: 200,
                fixed: isReadOnly ? false : "right",
                textAlign: "left",
                className: isReadOnly ? "" : "no-padding",
                render: (text, record) => {
                    const { webapi, metaAction, store, module } = this.props;
                    return (
                        <EditableCell
                            key={`EditableCell-stockId-${record.indexNo}`}
                            value={text}
                            record={record}
                            dataIndex="stockId"
                            handleSave={row => this.onCellChange(row)}
                            webapi={webapi}
                            metaAction={metaAction}
                            store={store}
                            module={module}
                            isReadOnly={isReadOnly}
                        />
                    );
                }
            },
            {
                title: this.props.module === "xs" ? "贷方科目" : "借方科目",
                dataIndex: this.props.module === "xs" ? "acct20Id" : "acct10Id",
                width: 250,
                textAlign: "left",
                fixed: isReadOnly ? false : "right",
                className: isReadOnly ? "" : "no-padding",
                render: (text, record) => {
                    const {
                        webapi,
                        metaAction,
                        store,
                        module,
                        isStock
                    } = this.props;
                    return (
                        <EditableCell
                            key={`EditableCell-${
                                this.props.module === "xs"
                                    ? "acct20Id"
                                    : "acct10Id"
                                }-${record.indexNo}`}
                            value={text}
                            record={record}
                            dataIndex={
                                module === "xs" ? "acct20Id" : "acct10Id"
                            }
                            handleSave={row => this.onCellChange(row)}
                            webapi={webapi}
                            metaAction={metaAction}
                            store={store}
                            module={module}
                            isStockMonth={isStock}
                            isReadOnly={isReadOnly}
                        />
                    );
                }
            },
        ];

        let switchClassName = ''
        //判断总开关是否显示半开状态
        if (cacheData.detailList && cacheData.detailList.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {

        } else if (cacheData.detailList && cacheData.detailList.filter(f => f.showSwitch).every(e => e.needMemory != 1)) {

        } else {
            switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
        }

        if (module === 'xs' ?
            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
            columns.push({
                title: "匹配来源",
                dataIndex: "matchSource",
                width: 100,
                textAlign: "center",
                fixed: isReadOnly ? false : "right",
                className: isReadOnly ? "" : "no-padding",
                render: (text, record, index) => {
                    let t = ''
                    if (text === 0) {
                        t = '手动匹配'
                    } else if (text === 3) {
                        t = '智能记忆'
                    } else if (text === 2) {
                        t = '精确查找'
                    } else if (text === 1) {
                        t = '模糊查找'
                    }
                    return t
                }
            })


        }
        if (module === 'xs' ?
            settingData.account20MatchDto && settingData.account20MatchDto.useAndSaveMemoryData === '1' :
            settingData.account10MatchDto && settingData.account10MatchDto.useAndSaveMemoryData === '1') {
            columns.push({
                title: (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', marginRight: '2px', marginTop: '1px' }}>
                        <span style={{ lineHeight: 'normal' }}>记住</span>
                        <span style={{ lineHeight: 'normal' }}>结果</span>
                    </div>
                    {cacheData.detailList && cacheData.detailList.filter(f => f.showSwitch).length ?
                        <Switch checked={this.state.columnSwitchValue} className={switchClassName} onChange={this.onColumnSwitchChange.bind(this)}></Switch> :
                        <Switch checked={false}></Switch>
                    }
                </div>),
                dataIndex: "needMemory",
                width: 100,
                textAlign: "center",
                fixed: isReadOnly ? false : "right",
                className: isReadOnly ? "" : "no-padding",
                render: (text, record, index) => {
                    return record.showSwitch ? (
                        <Switch checked={record.needMemory} onChange={this.onCellSwitchChange.bind(this, record)}></Switch>
                    ) : ''

                }
            })
        }

        if (!isReadOnly) {
            columns.splice(0, 0, {
                width: 60,
                dataIndex: "indexNo",
                align: "center",
                columnType: "check",
                onSelectChange: this.onSelectChange
            });
        }
        columns = columns.map(m => renderDataGridCol({ ...colOption, ...m }));
        if (this.props.isStock !== 1) {
            return columns.filter(
                f => f.key !== "isStock" && f.key !== "stockId"
            );
        }
        return columns;
    }
    async openBatchSetting() {
        const { webapi, metaAction, store, module, isStock } = this.props;
        const { selectedRowKeys, cacheData, dataSource } = this.state;
        if (selectedRowKeys.length <= 0) {
            this.metaAction.toast("error", "请选择需要操作的数据");
            return;
        }
        const ret = await this.metaAction.modal("show", {
            title: "批量设置",
            style: { top: 5 },
            width: 400,
            // wrapClassName: 'bovms-app-purchase-list-habit-setting',
            children: (
                <BatchSetting
                    metaAction={metaAction}
                    store={store}
                    webapi={webapi}
                    module={module}
                    isStockMonth={isStock}
                    subjectType={module === "xs" ? "dfkm" : "jfkm"}
                // goodsName={}
                // specification={}
                />
            )
        });
        if (ret) {
            cacheData.detailList.forEach(item => {
                if (
                    item &&
                    selectedRowKeys &&
                    selectedRowKeys.findIndex(f => f == item.indexNo) > -1
                ) {
                    this.setRowsFormBatchSetting(item, ret);
                }
            });
            this.setState({ cacheData });
        }
    }
    setRowsFormBatchSetting(target, ret) {
        // const {isStock} = this.props;
        const isObject = this.isObject(ret),
            stock = (isObject && this.isObject(ret.stock) && ret.stock) || {},
            kjkm = (isObject && this.isObject(ret.kjkm) && ret.kjkm) || {},
            acct = this.module === "cg" ? "acct10" : "acct20";

        if (this.module === 'cg') {
            //是否存货为是
            if (ret.isStock === '1') {
                //未选中勾选框【存货档案】时
                if (!ret.stockCheckboxValue) {
                    //【是否存货】为【否】的记录，清空原【存货档案】和【借方科目】的值。
                    if (target.isStock === '0') {
                        target.isStock = ret.isStock
                        target.stockId = undefined
                        target.stockName = undefined
                        target.propertyName = undefined
                        target[`${acct}Id`] = undefined
                        target[`${acct}Code`] = undefined
                        target[`${acct}Name`] = undefined
                        target[`${acct}CiName`] = undefined
                        target.acctMatchSource = 0
                        target.stockMatchSource = 0
                        target.matchSource = 0
                        target.isModifyAcct = true
                        target.isModify = true
                    }
                } else { //批量设置前【是否存货】为【是】的记录，保持其原【存货档案】和【借方科目】不变
                    target.isStock = ret.isStock
                    target.stockId = isObject && stock.id
                    target.propertyName = isObject && stock.propertyName
                    target.stockName =
                        isObject &&
                        stock.id &&
                        `${stock.code && stock.code}-${stock.name}${
                        stock.specification ? "-" : ""
                        }${stock.specification || ""}`
                    target[`${acct}Id`] = kjkm.id
                    target[`${acct}Code`] = kjkm.code
                    target[`${acct}Name`] = kjkm.name
                    target[`${acct}CiName`] = kjkm.assistJSON || null
                    target.isModifyAcct = true
                    target.acctMatchSource = 0
                    target.stockMatchSource = 0
                    target.matchSource = 0
                    target.isModify = true
                }
            } else {//是否存货为否
                //未选中时【借方科目】时
                if (!ret.subjectCheckboxValue) {
                    //批量设置前【是否存货】为【否】的记录，保持其原【借方科目】不变。
                    if (target.isStock === '1') {
                        target.isStock = ret.isStock
                        target.stockId = undefined
                        target.stockName = undefined
                        target.propertyName = undefined
                        target[`${acct}Id`] = undefined
                        target[`${acct}Code`] = undefined
                        target[`${acct}Name`] = undefined
                        target[`${acct}CiName`] = undefined
                        target.isModifyAcct = true
                        target.stockMatchSource = 0
                        target.acctMatchSource = 0
                        target.matchSource = 0
                        target.isModify = true
                    }
                } else {//【是否存货】为【是】的记录，清空原【存货档案】和【借方科目】的值。
                    target.isStock = ret.isStock
                    target.stockId = isObject && stock.id
                    target.propertyName = isObject && stock.propertyName
                    target.stockName =
                        isObject &&
                        stock.id &&
                        `${stock.code && stock.code}-${stock.name}${
                        stock.specification ? "-" : ""
                        }${stock.specification || ""}`
                    target[`${acct}Id`] = kjkm.id
                    target[`${acct}Code`] = kjkm.code
                    target[`${acct}Name`] = kjkm.name
                    target[`${acct}CiName`] = kjkm.assistJSON || null
                    target.acctMatchSource = 0
                    target.stockMatchSource = 0
                    target.matchSource = 0
                    target.isModifyAcct = true
                    target.isModify = true


                }
            }
        } else {
            if (ret.isStock) {
                target.isStock = ret.isStock;
                target.stockId = isObject && stock.id;
                target.propertyName = isObject && stock.propertyName
                target.stockName =
                    isObject &&
                    stock.id &&
                    `${stock.code && stock.code}-${stock.name}${
                    stock.specification ? "-" : ""
                    }${stock.specification || ""}`;
                target.stockMatchSource = 0
            }

            if (ret.kjkm && kjkm.id) {
                target[`${acct}Id`] = kjkm.id;
                target[`${acct}Code`] = kjkm.code;
                target[`${acct}Name`] = kjkm.name;
                target[`${acct}CiName`] = kjkm.assistJSON || undefined;
                target.isModify = true;
                target.acctMatchSource = 0
                target.isModifyAcct = true
            }
        }
        this.isShowSwitch(target)
        target.matchSource = 0
    }
    onVerticalScroll() {
        const { cacheData } = this.state;
        if (
            cacheData.detailList &&
            cacheData.detailList.some(s => s["editable"])
        ) {
            return false;
        }
        return true;
    }
    filterChange(e) {
        this.setState({
            filterValue: e
        }, () => {
            this.pageChanged()
        })
    }
    mainAcctOnChange(e) {
        const { cacheData } = this.state
        cacheData.needMemory = e ? 1 : 0
        this.setState({
            cacheData
        })
    }
    getCount(type) {
        let { cacheData } = this.state
        const { isStock, module } = this.props
        let idKey = module === 'cg' ? 'acct10Id' : 'acct20Id'
        let count = 0
        let typeValue = {
            'sdsz': 0,
            'znjy': 3,
            'mhpp': 1,
            'jqpp': 2
        }[type]

        //未设置
        if (type === 'wsz') {
            cacheData.detailList ? cacheData.detailList.forEach(e => {
                //已启用存货
                if (isStock === 1) {
                    //是否存货
                    if (e.isStock == "1") {
                        //未设置科目或未设置存货档案
                        if (!e[idKey] || !e["stockId"]) {
                            count++
                        }
                    } else {
                        //未设置科目
                        if (!e[idKey]) {
                            count++
                        }
                    }
                } else {//未启用存货
                    //未设置科目
                    if (!e[idKey]) {
                        count++
                    }
                }
            }) : ''
            //已设置
        } else if (type === 'ysz') {
            cacheData.detailList ? cacheData.detailList.forEach(e => {
                //启用存货
                if (isStock === 1) {
                    //是否存货
                    if (e.isStock == "1") {
                        //设置科目并设置存货档案
                        if (e[idKey] && e["stockId"]) {
                            count++
                        }
                    } else {
                        //设置了科目
                        if (e[idKey]) {
                            count++
                        }
                    }
                } else {
                    //设置了科目
                    if (e[idKey]) {
                        count++
                    }
                }
            }) : ''
        } else {
            count = cacheData.detailList ? cacheData.detailList.filter(r => r.matchSource === typeValue).length : 0
        }
        return count
    }
    render() {
        const {
            dataSource,
            pagination,
            selectedRowKeys,
            cacheData,
            loading,
            filterValue,
            settingData
        } = this.state,
            {
                webapi,
                metaAction,
                store,
                module,
                isStock,
                isReadOnly
            } = this.props,
            formItem = cacheData || {},
            columns = this.getColumn(isReadOnly);

        // const moreMenu = (
        //     <Menu onClick={(e) => this.handleMenuClick(e)}>
        //         {module === 'cg' ? <Menu.Item key="patchAddSubject" >批增会计科目</Menu.Item> : null}
        //         {isStock == 1 ? <Menu.Item key="patchAddArchives">批增存货档案</Menu.Item> : null}
        //     </Menu>
        // );
        // const rowSelection = {
        //     selectedRowKeys,
        //     onChange: this.onSelectChange,
        //     hideDefaultSelections: true,
        // };


        const defaultItem = {
            id: module === "xs" ? formItem.acct10Id : formItem.acct20Id,
            codeAndName:
                module === "xs"
                    ? `${formItem.acct10Code || ""} ${formItem.acct10Name ||
                    ""}`
                    : `${formItem.acct20Code || ""} ${formItem.acct20Name ||
                    ""}`
        };
        const assistJSON =
            module === "cg" ? formItem.acct20CiName : formItem.acct10CiName;
        const obj = assistJSON ? JSON.parse(assistJSON) : {},
            assistList = obj.assistList
        const subjectName = `${defaultItem.codeAndName}${assistList ? assistList.map(m => m.name).join("/") : ""}`
        let json = assistJSON ? JSON.parse(assistJSON).assistList : null
        const vatTaxpayer = this.metaAction.gf("data.accountInfo.vatTaxpayer");
        let showRemember = false
        //1:只读状态不显示开关
        //2.【进项】贷方科目为空时不显示开关，【销项】借方科目为空时不显示开关
        //3.【进项】【贷方科目匹配-自动根据记忆库进行匹配（智能记忆）】开关为开启时才显示，【销项】【借方科目匹配-自动根据记忆库进行匹配（智能记忆）】开关为开启时才显示。
        //4.贷方科目带有2个或2个以上辅助核算时不显示
        if (!isReadOnly &&
            (module === "xs" ? formItem.acct10Id : formItem.acct20Id) &&
            (module === "xs" ?
                settingData.account10MatchDto && settingData.account10MatchDto.useAndSaveMemoryData === '1' :
                settingData.account20MatchDto && settingData.account20MatchDto.useAndSaveMemoryData === '1') &&
            (!(Array.isArray(json) && json.length > 1))) {
            showRemember = true
        }

        return (
            <Spin
                tip="加载中..."
                delay={500}
                spinning={loading}
                wrapperClassName={
                    isReadOnly
                        ? "bovms-app-purchase-list-table-row-edit read-only"
                        : "bovms-app-purchase-list-table-row-edit"
                }
            >
                <Row>
                    <Col span="3" className="bg">
                        发票号码：
                    </Col>
                    <Col span="4">{formItem.invNo || ""}</Col>
                    <Col span="3" className="bg">
                        开票日期：
                    </Col>
                    <Col span="5">
                        {(formItem.billDate &&
                            formItem.billDate.substr(0, 10)) ||
                            ""}
                    </Col>
                    <Col span="3" className="bg">
                        发票类型：
                    </Col>
                    <Col span="6">{formItem.invKindName || ""}</Col>
                    {module === "cg" && vatTaxpayer != "2000010002" ? (
                        <Col span="3" className="bg">
                            认证状态：
                        </Col>
                    ) : null}
                    {module === "cg" && vatTaxpayer != "2000010002" ? (
                        <Col span="4">{formItem.rzztDesc || ""}</Col>
                    ) : null}
                    <Col span="3" className="bg">
                        {module === "cg" ? "销方名称：" : "购方名称："}
                    </Col>
                    <Col
                        span={
                            module === "cg" && vatTaxpayer != "2000010002"
                                ? 5
                                : 12
                        }
                        title={formItem.custName}
                    >
                        {formItem.custName}
                    </Col>
                    <Col span="3" className="bg">
                        {module === "cg" ? "贷方科目：" : "借方科目："}
                    </Col>
                    <Col
                        span="6"
                        className="no-padding"
                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                        title={(isReadOnly && subjectName) || ""}
                    >
                        {isReadOnly ? (
                            subjectName
                        ) : (
                                <div style={{ width: `${showRemember ? '86%' : '100%'}` }}>
                                    <SelectSubject
                                        selectType={module === "xs" ? "jfkm" : "dfkm"}
                                        module={module}
                                        metaAction={metaAction}
                                        store={store}
                                        webapi={webapi}
                                        onChange={value =>
                                            this.handerChange(
                                                value,
                                                module === "xs"
                                                    ? "acct10Id"
                                                    : "acct20Id"
                                            )
                                        }
                                        value={
                                            module === "xs"
                                                ? formItem.acct10Id
                                                : formItem.acct20Id
                                        }
                                        defaultItem={defaultItem}
                                        assistJSON={assistJSON}
                                        subjectName={formItem.custName}
                                        getPopupContainer={handleGetModalContainer}
                                    />
                                </div>

                            )}

                        {showRemember &&
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '8px' }}>
                                <span style={{ fontSize: 'xx-small', lineHeight: '15px', marginTop: '2px' }}>记住</span>
                                <Switch size="small" checked={formItem.needMemory} onChange={this.mainAcctOnChange.bind(this)}></Switch>
                            </div>}
                    </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* 【系统自动匹配贷方科目】开关为关闭时，保持不变：全部、已设置、未设置
                【系统自动匹配贷方科目】开关为开启时，下拉选项变更为：全部、未设置、手动匹配、智能记忆、精确查找、模糊查找 */}
                    {settingData && (module === 'cg' ?
                        settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                        settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') ?
                        <Select onChange={this.filterChange.bind(this)} value={filterValue} style={{ width: '150px' }}>
                            <Option key={null} value={null}>全部{` (${formItem.detailList ? formItem.detailList.length : 0})`}</Option>
                            <Option key={4} value={4}>未设置{` (${this.getCount("wsz")})`}</Option>
                            <Option key={0} value={0}>手动匹配{` (${this.getCount("sdsz")})`}</Option>
                            <Option key={3} value={3}>智能记忆{` (${this.getCount("znjy")})`}</Option>
                            <Option key={2} value={2}>精确查找{` (${this.getCount("mhpp")})`}</Option>
                            <Option key={1} value={1}>模糊查找{` (${this.getCount("jqpp")})`}</Option>
                        </Select> :
                        <Select onChange={this.filterChange.bind(this)} value={filterValue} style={{ width: '150px' }}>
                            <Option key={null} value={null}>全部{` (${formItem.detailList ? formItem.detailList.length : 0})`}</Option>
                            <Option key={4} value={4}>未设置{` (${this.getCount("wsz")})`}</Option>
                            <Option key={1} value={1}>已设置{` (${this.getCount("ysz")})`}</Option>
                        </Select>}
                    {isReadOnly ? (
                        <div style={{ height: "60px" }}></div>
                    ) : (
                            <div className="btns">
                                <Button
                                    type="primary"
                                    onClick={::this.openBatchSetting}
                >
                    批量设置
                        </Button>
                        {/* 启用了【借方科目自动匹配】时显示该按钮 */}
                    {settingData && (module === 'cg' ?
                        settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                        settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') && <Button
                            type="primary"
                            onClick={::this.autoMatch}
                >
                    自动匹配
                        </Button>}
                {module == "cg" && (
                    <Button
                        onClick={e =>
                            this.handleMenuClick(e, "patchAddSubject")
                        }
                    >
                        批增会计科目
                    </Button>
                )}
                {isStock == 1 && (
                    <Button
                        onClick={e =>
                            this.handleMenuClick(e, "patchAddArchives")
                        }
                    >
                        批增存货档案
                    </Button>
                )}
                <Button
                    icon="setting"
                    onClick={e =>
                        this.handleMenuClick(e, "autoMatchSetting")
                    }
                />
                </div>
        )
    }
                </div>

    <DataGrid
        // loading={loading}
        key={this.dataGridKey}
        headerHeight={37}
        rowHeight={37}
        footerHeight={0}
        rowsCount={(dataSource || []).length}
        onRowClick={:: this.onRowClick}
        columns={columns}
        height={319}
        style={{ width: "100%", height: "319px" }}
        ellipsis
        onVerticalScroll={:: this.onVerticalScroll }
        rowClassNameGetter={() => "editable-row"}
        className="bovms-app-purchase-list-table"
    />
    <div className="footer">
        <div className="total">
            <span>
                {selectedRowKeys && selectedRowKeys.length > 0
                    ? "已选"
                    : ""}
                合计
                        </span>
            <span>
                明细数量：
                            <strong>
                    {(selectedRowKeys && selectedRowKeys.length) ||
                        (formItem.detailList &&
                            formItem.detailList.length) ||
                        0}
                </strong>
                条
                        </span>
            <span>
                价税合计：<strong>{this.calcTotal()}</strong>元
                        </span>
        </div>

        <SimplePagination
            pageSizeOptions={["50", "100", "200", "300"]}
            pageSize={pagination.pageSize}
            current={pagination.currentPage}
            total={pagination.totalCount}
            onChange={this.pageChanged}
            onShowSizeChange={this.pageChanged}
            showTotal={total => <span>共{total}条记录</span>}
        />
    </div>
{
    isReadOnly ? (
        <div className="modal-footer">
            <Button
                type="primary"
                onClick={() => {
                    this.props.closeModal &&
                        this.props.closeModal();
                }}
            >
                关闭
                        </Button>
        </div>
    ) : null
}
            </Spin >
        );
    }
}
class EditableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            editable: false,
            cacheData: props.record || {}
        };
        this.module = props.module;
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    }
    handleChange = value => {
        const { dataIndex, handleSave } = this.props;
        const { cacheData } = this.state;
        const isObject = this.isObject(value);
        const json =
            isObject && value.assistList
                ? JSON.stringify({ assistList: value.assistList })
                : "";
        let acctFiled;
        switch (dataIndex) {
            case "acct10Id": //借方科目
            case "acct20Id": //贷方科目
                acctFiled = dataIndex.substr(0, 5);
                cacheData[`${acctFiled}0Id`] = isObject ? value.id : undefined;
                cacheData[`${acctFiled}0Code`] = isObject
                    ? value.code
                    : undefined;
                cacheData[`${acctFiled}0Name`] = isObject
                    ? value.gradeName
                    : undefined;
                cacheData[`${acctFiled}0CiName`] = isObject ? json : undefined;
                cacheData.isModifyAcct = isObject ? true : undefined
                cacheData.acctMatchSource = isObject ? 0 : undefined
                cacheData.matchSource = isObject ? 0 : undefined
                // _value = value.id;
                break;
            case "isStock": //是否存货
                // 是否存货，由是－>否，否－>是切换，清空存货档案和借方科目-----待处理
                if (
                    (cacheData[dataIndex] === "0" && value === "1") ||
                    (cacheData[dataIndex] === "1" && value === "0")
                ) {
                    acctFiled = this.module === "xs" ? "acct2" : "acct1";
                    cacheData.stockId = null;
                    cacheData.stockName = null;
                    cacheData.propertyName = null
                    if (this.module === "cg") {
                        cacheData[`${acctFiled}0Id`] = undefined;
                        cacheData[`${acctFiled}0Code`] = undefined;
                        cacheData[`${acctFiled}0Name`] = undefined;
                        cacheData[`${acctFiled}0CiName`] = "";
                    }
                }
                cacheData[dataIndex] = !isObject ? value : undefined;
                cacheData.isModifyAcct = true
                cacheData.matchSource = 0
                // _value = value;
                break;
            case "stockId": //存货档案
                if (value === undefined) return;
                cacheData[dataIndex] = isObject ? value.id : undefined;
                cacheData.propertyName = isObject
                    ? value.propertyName
                    : undefined;
                cacheData.stockName = isObject
                    ? `${value.code}-${value.name}${
                    value.specification ? "-" : ""
                    }${value.specification || ""}`
                    : undefined;
                // 在进项，1)如果档案的科目有辅助核算，则将其设为借方科目，否则，将借方科目置空;2)如果档案的科目没有辅助核算，则将科目设置到借方科目中；
                if (this.module === "cg") {
                    cacheData.acct10Id = isObject
                        ? value.inventoryRelatedAccountId
                        : undefined;
                    cacheData.acct10Code = isObject
                        ? value.inventoryRelatedAccountCode
                        : undefined;
                    cacheData.acct10Name = isObject
                        ? value.inventoryRelatedAccountName
                        : undefined;
                    cacheData.acct10CiName = isObject ? json : undefined;
                    cacheData.acctMatchSource = 0
                }
                cacheData.stockMatchSource = 0
                cacheData.isModifyAcct = true
                cacheData.matchSource = 0
                // _value = value;
                break;
            default:
                // target.detailList[mxKey][column]=!isObject?value:undefined
                break;
        }
        this.setState({ cacheData }, () => { this.save() });
        // handleSave && handleSave(cacheData);
    };

    save = () => {
        const { handleSave } = this.props;
        const { cacheData } = this.state;
        this.toggleEdit();
        handleSave && handleSave(cacheData);
    };
    toggleEdit = () => {
        const editable = !this.state.editable;
        if (this.props.record) this.props.record["editable"] = editable;
        this.setState({ editable }, () => {
            if (editable) {
                if (this.props.dataIndex === "isStock") {
                    try {
                        this.myRef._reactInternalFiber.firstEffect.stateNode.click();
                    } catch (err) { }
                } else {
                    this.myRef && this.myRef.focus && this.myRef.focus();
                }
            }
        });
    };
    getColText(text, record, column) {
        let obj, assistList;
        switch (column) {
            case "isStock": //是否存货
                return text === "1" ? "是" : text === "0" ? "否" : "-";
            case "stockId": //存货档案
                return record.stockName;
            case "acct10Id": //借方科目
                obj = record.acct10CiName
                    ? JSON.parse(record.acct10CiName)
                    : {};
                assistList = obj.assistList;
                return `${record.acct10Code || ""} ${record.acct10Name || ""} ${
                    assistList ? "/" : ""
                    }${assistList ? assistList.map(m => m.name).join("/") : ""}`;
            case "acct20Id": //贷方科目
                obj = record.acct20CiName
                    ? JSON.parse(record.acct20CiName)
                    : {};
                assistList = obj.assistList;
                return `${record.acct20Code || ""} ${record.acct20Name || ""} ${
                    assistList ? "/" : ""
                    }${assistList ? assistList.map(m => m.name).join("/") : ""}`;
            default:
                return text;
        }
    }
    async openSelectAssist(e, value, assistJSON, subjectName, rowIsStock) {
        e && e.preventDefault && e.preventDefault();
        e && e.stopPropagation && e.stopPropagation();

        let item = {
            id: value,
            assistList: JSON.parse(assistJSON || "{}").assistList
        };

        const res = await this.props.metaAction.modal("show", {
            title: "选择辅助项目",
            width: 450,
            style: { top: 5 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: (
                <SelectAssist
                    item={item}
                    store={this.props.store}
                    metaAction={this.props.metaAction}
                    webapi={this.props.webapi}
                    subjectName={subjectName}
                    isNeedQuerySubject
                    disabledInventory={rowIsStock == 1 ? true : false}
                ></SelectAssist>
            )
        });
        if (res && res.assistList) {
            const { dataIndex, handleSave } = this.props;
            const { cacheData } = this.state;
            let acctFiled = dataIndex.substr(0, 5);
            cacheData[`${acctFiled}0CiName`] = JSON.stringify({
                assistList: res.assistList
            });
            cacheData.isModifyAcct = true
            this.setState({ cacheData });
            handleSave && handleSave(cacheData);
        } else {
            // 暂不做处理
        }
    }
    render() {
        const {
            value,
            record,
            handleSave,
            dataIndex,
            webapi,
            metaAction,
            store,
            module,
            isStockMonth,
            isReadOnly
        } = this.props;
        const { editable } = this.state;
        // console.log('rowEdit:', dataIndex, value, )
        if (dataIndex === "stockId" && record.isStock === "0") {
            // 不是存货时，存货档案不能编辑
            return (
                <div
                    style={{ width: "100%" }}
                    title={this.getColText(value, record, dataIndex)}
                >
                    {this.getColText(value, record, dataIndex)}
                </div>
            );
        }
        // if (module==='cg' && dataIndex === 'acct10Id' && record.isStock === '1') {
        //     // 是存货时，借方科目不能编辑－－因为档案带回的科目辅助核算可能存在多个值，暂时先放开编辑
        //     return <div title={this.getColText(value,record,dataIndex)}>{this.getColText(value,record,dataIndex)}</div>
        // }
        switch (dataIndex) {
            case "isStock":
                if (isReadOnly)
                    return (
                        <div title={this.getColText(value, record, dataIndex)}>
                            {this.getColText(value, record, dataIndex)}
                        </div>
                    );
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div className="editable-cell-input-wrap">
                                <Select
                                    key={`select-c-${record.indexNo}-${dataIndex}`}
                                    ref={node => (this.myRef = node)}
                                    value={value}
                                    // onBlur={this.save}
                                    onChange={val => this.handleChange(val)}
                                    style={{ width: "100%" }}
                                >
                                    <Select.Option key="1" value="1">
                                        是
                                    </Select.Option>
                                    <Select.Option key="0" value="0">
                                        否
                                    </Select.Option>
                                </Select>
                            </div>
                        ) : (
                                <div
                                    className="editable-cell-value-wrap"
                                    onClick={this.toggleEdit.bind(this)}
                                >
                                    {this.getColText(value, record, dataIndex)}
                                </div>
                            )}
                    </div>
                );
            case "stockId":
                if (isReadOnly)
                    return (
                        <div title={this.getColText(value, record, dataIndex)}>
                            {this.getColText(value, record, dataIndex)}
                        </div>
                    );
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div className="editable-cell-input-wrap">
                                <SelectStock
                                    key={`select-stock-${record.indexNo}-${dataIndex}`}
                                    ref={node => (this.myRef = node)}
                                    autofocus
                                    module={module}
                                    metaAction={metaAction}
                                    store={store}
                                    webapi={webapi}
                                    onChange={value => this.handleChange(value)}
                                    // onBlur={this.save}
                                    value={value}
                                    isStock={record.isStock}
                                    rowData={record}
                                    autoExpand={true}
                                    getPopupContainer={handleGetModalContainer}
                                />
                            </div>
                        ) : (
                                <div
                                    style={{ width: "100%" }}
                                    className="editable-cell-value-wrap"
                                    onClick={this.toggleEdit.bind(this)}
                                    title={this.getColText(
                                        value,
                                        record,
                                        dataIndex
                                    )}
                                >
                                    {this.getColText(value, record, dataIndex)}
                                </div>
                            )}
                    </div>
                );
            case "acct10Id":
            case "acct20Id":
                const defaultItem = {
                    id: value,
                    codeAndName: `${
                        record[
                        dataIndex === "acct10Id"
                            ? "acct10Code"
                            : "acct20Code"
                        ]
                        } ${
                        record[
                        dataIndex === "acct10Id"
                            ? "acct10Name"
                            : "acct20Name"
                        ]
                        }`
                };
                const assistJSON =
                    record[
                    dataIndex === "acct10Id"
                        ? "acct10CiName"
                        : "acct20CiName"
                    ];
                const isCanSelectAssist = JSON.parse(assistJSON || "{}")
                    .assistList;
                const subjectDisabled =
                    module === "cg" &&
                        isStockMonth == 1 &&
                        dataIndex === "acct10Id" &&
                        record.isStock == 1
                        ? true
                        : false;
                if (isReadOnly)
                    return (
                        <div title={this.getColText(value, record, dataIndex)}>
                            {this.getColText(value, record, dataIndex)}
                        </div>
                    );
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div className="editable-cell-input-wrap">
                                <SelectSubject
                                    key={`select-subject-${record.indexNo}-${dataIndex}`}
                                    selectType={
                                        module === "xs" ? "dfkm" : "jfkm"
                                    }
                                    ref={node => (this.myRef = node)}
                                    autofocus
                                    module={module}
                                    metaAction={metaAction}
                                    store={store}
                                    webapi={webapi}
                                    onChange={value => this.handleChange(value)}
                                    // onBlur={this.save}
                                    value={value}
                                    isStockMonth={isStockMonth}
                                    isStock={record.isStock}
                                    assistJSON={assistJSON}
                                    defaultItem={defaultItem}
                                    subjectName={record.goodsName}
                                    autoExpand={true}
                                    noShowSelectAssist
                                    disabled={subjectDisabled}
                                    getPopupContainer={handleGetModalContainer}
                                />
                            </div>
                        ) : (
                                <div
                                    style={{ width: "100%" }}
                                    className={
                                        isCanSelectAssist
                                            ? "editable-cell-value-wrap bovms-select-subject-container no-right-padding"
                                            : "editable-cell-value-wrap"
                                    }
                                    onClick={this.toggleEdit.bind(this)}
                                    title={this.getColText(
                                        value,
                                        record,
                                        dataIndex
                                    )}
                                >
                                    <span
                                        className={
                                            isCanSelectAssist ? "subject-value" : ""
                                        }
                                    >
                                        {this.getColText(value, record, dataIndex)}
                                    </span>
                                    {isCanSelectAssist ? (
                                        <a
                                            className="assist-btn"
                                            unSelectable="on"
                                            onClick={e =>
                                                this.openSelectAssist(
                                                    e,
                                                    value,
                                                    assistJSON,
                                                    record.goodsName,
                                                    record.isStock
                                                )
                                            }
                                        >
                                            辅助
                                        </a>
                                    ) : null}
                                </div>
                            )}
                    </div>
                );
        }
    }
}
