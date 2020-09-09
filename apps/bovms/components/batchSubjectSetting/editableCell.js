
import React from "react";

import { Select } from "antd";
import SelectSubject from "../selectSubject/index";
import SelectStock from "../selectStock";
import {
    handleGetModalContainer,
    isObject
} from "../../utils/index";
import SelectAssist from "../selectAssist";
import { isArray } from "core-js/fn/array";

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
        // console.log('value',value)
        let acctFiled;
        let multiAcctFiled = this.module === "xs" ? "2" : "1";
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
                cacheData.isModifyAcct = true
                cacheData.acctMatchSource = 0
                cacheData.matchSource = 0
                cacheData[`multipleAcct${dataIndex === 'acct10Id' ? '1' : '2'}0Id`] = 0
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
                    cacheData.multipleStockId = 0
                    if (this.module === "cg") {
                        cacheData[`${acctFiled}0Id`] = undefined;
                        cacheData[`${acctFiled}0Code`] = undefined;
                        cacheData[`${acctFiled}0Name`] = undefined;
                        cacheData[`${acctFiled}0CiName`] = "";
                        cacheData[`multipleAcct${multiAcctFiled}0Id`] = 0

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
                cacheData.stockName = isObject
                    ? `${value.code}-${value.name}${
                    value.specification ? "-" : ""
                    }${value.specification || ""}${value.unitName ? `-${value.unitName}` : ''}`
                    : undefined;
                cacheData.propertyName = isObject
                    ? value.propertyName
                    : undefined;
                cacheData.multipleStockId = 0
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
                    cacheData.multipleAcct10Id = 0
                    cacheData.acctMatchSource = 0

                }
                cacheData.isModifyAcct = true
                cacheData.stockMatchSource = 0
                cacheData.matchSource = 0
                // _value = value;
                break;
            default:
                // target.detailList[mxKey][column]=!isObject?value:undefined
                break;
        }
        this.setState({ cacheData });
        handleSave && handleSave(cacheData);
    };

    save = () => {
        // const { handleSave } = this.props;
        // const { cacheData } = this.state;
        this.toggleEdit();
        // handleSave && handleSave(cacheData);
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
                if (record.multipleStockId && !record.stockId) {
                    return '已设置了多个档案'
                }
                return record.stockName;
            case "acct10Id": //借方科目
                if (record.multipleAcct10Id && !record.acct10Id) {
                    return '已设置多个科目'
                }
                obj = record.acct10CiName
                    ? JSON.parse(record.acct10CiName)
                    : {};
                assistList = obj.assistList;
                return `${record.acct10Code || ""} ${record.acct10Name || ""} ${
                    assistList ? "/" : ""
                    }${assistList ? assistList.map(m => m.name).join("/") : ""}`;
            case "acct20Id": //贷方科目
                if (record.multipleAcct20Id && !record.acct20Id) {
                    return '已设置多个科目'
                }
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
    getRowDataFormDimension(record, groupByRule, populatePriceToStockName) {
        if (!record) {
            return {};
        }
        let rowData = {};

        if (groupByRule === '1') {
            rowData.specification = undefined
        }
        if (groupByRule === '4' && populatePriceToStockName === '1') {
            rowData.goodsName = `${record.goodsName}${(typeof record.unitPrice === "number" && "-") || ""}${(typeof record.unitPrice === "number" && `单价${record.unitPrice}`) || ""}`;
        }
        return Object.assign({}, record, rowData);
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
            isReadOnly,
            selectType,
            groupByRule,
            populatePriceToStockName
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
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div className="editable-cell-input-wrap">
                                <Select
                                    key={`select-c-${record.uuId}-${dataIndex}`}
                                    ref={node => (this.myRef = node)}
                                    value={value}
                                    onBlur={this.save}
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
                                    onBlur={this.save}
                                    value={value}
                                    isStock={record.isStock}
                                    rowData={this.getRowDataFormDimension(record, groupByRule, populatePriceToStockName)}
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
                    codeAndName: `${record[dataIndex === "acct10Id" ? "acct10Code" : "acct20Code"]} ${record[dataIndex === "acct10Id" ? "acct10Name" : "acct20Name"]}`
                };
                const assistJSON = record[dataIndex === "acct10Id" ? "acct10CiName" : "acct20CiName"];
                const isCanSelectAssist = JSON.parse(assistJSON || "{}")
                    .assistList;
                const subjectDisabled =
                    module === "cg" &&
                        isStockMonth == 1 &&
                        dataIndex === "acct10Id" &&
                        record.isStock == 1
                        ? true
                        : false;

                let subjectName =
                    record[
                    module == "cg"
                        ? selectType == "jfkm"
                            ? "goodsName"
                            : "custName"
                        : selectType == "jfkm"
                            ? "custName"
                            : "goodsName"
                    ];
                if ((groupByRule === '2' || groupByRule === '3' || groupByRule === '4') && record.specification) {
                    subjectName += `-${record.specification}`;
                }
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div className="editable-cell-input-wrap">
                                <SelectSubject
                                    key={`select-subject-${record.indexNo}-${dataIndex}`}
                                    selectType={selectType}
                                    ref={node => (this.myRef = node)}
                                    autofocus
                                    module={module}
                                    metaAction={metaAction}
                                    store={store}
                                    webapi={webapi}
                                    onChange={value => this.handleChange(value)}
                                    onBlur={this.save}
                                    value={value}
                                    isStockMonth={isStockMonth}
                                    isStock={record.isStock}
                                    assistJSON={assistJSON}
                                    defaultItem={defaultItem}
                                    subjectName={subjectName}
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

export default EditableCell