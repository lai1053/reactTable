import React from "react"
import { DataGrid } from "edf-component"
import { Input, Form, Select, Spin } from "antd"
import renderDataGridCol from "../../../bovms/components/column/index"
import { setListEmptyVal } from "../../../bovms/utils/index"
import SelectSubject from "./selectSubject"
const Cell = DataGrid.Cell
import { generatorRandomNum } from "../../../bovms/utils/index"
import SelectAssist from "../../../bovms/components/selectAssist"
import { isNumber, isBoolean } from "util"

class EditableCell extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value,
            editable: false,
            cacheData: props.record || {},
        }
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]"
    }

    save = () => {
        const { handleSave } = this.props
        const { cacheData } = this.state
        this.toggleEdit()
        handleSave && handleSave(cacheData)
    }
    toggleEdit = () => {
        const editable = !this.state.editable
        if (this.props.record) this.props.record["editable"] = editable
        this.setState({ editable }, () => {
            if (editable) {
                if (this.props.dataIndex === "acctId" || this.props.dataIndex === "invoiceType") {
                    try {
                        this.myRef._reactInternalFiber.firstEffect.stateNode.click()
                    } catch (err) {}
                } else {
                    this.myRef && this.myRef.focus && this.myRef.focus()
                }
            }
        })
    }
    getColText(text, record, column) {
        let obj, assistList
        switch (column) {
        }
    }
    handleChange(value) {
        const { dataIndex, handleSave } = this.props
        const { cacheData } = this.state
        const isObject = this.isObject(value)
        const json =
            isObject && value.assistList ? JSON.stringify({ assistList: value.assistList }) : ""
        switch (dataIndex) {
            case "invoiceType":
                cacheData["invoiceType"] = value
                break
            case "serviceTypeName":
                if (value.target.value.length <= 10) {
                    cacheData["serviceTypeName"] = value.target.value
                }
                break
            case "summary":
                if (value.target.value.length <= 20) {
                    cacheData["summary"] = value.target.value
                }
                break
            case "acctId":
                cacheData[`acctId`] = isObject ? value.id : undefined
                cacheData[`acctCode`] = isObject ? value.code : undefined
                cacheData[`acctName`] = isObject ? value.gradeName : undefined
                cacheData[`assistCiName`] = isObject ? json : undefined
                break
        }
        this.setState({ cacheData })
        handleSave && handleSave(cacheData)
    }
    async openSelectAssist(e, value, assistJSON, subjectName, rowIsStock) {
        e && e.preventDefault && e.preventDefault()
        e && e.stopPropagation && e.stopPropagation()

        let item = {
            id: value,
            assistList: JSON.parse(assistJSON || "{}").assistList,
        }

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
                    module={"api"}
                    disabledInventory={rowIsStock == 1 ? true : false}></SelectAssist>
            ),
        })
        if (res && res.assistList) {
            const { dataIndex, handleSave } = this.props
            const { cacheData } = this.state
            cacheData.assistCiName = JSON.stringify({
                assistList: res.assistList,
            })
            this.setState({ cacheData })
            handleSave && handleSave(cacheData)
        } else {
            // 暂不做处理
        }
    }

    render() {
        const { value, record, key, handleSave, dataIndex, webapi, metaAction, store } = this.props
        const { editable } = this.state
        switch (dataIndex) {
            case "invoiceType":
                if (record.statementState === 0) {
                    return (
                        <div className="editable-cell">
                            <div
                                class="editable-cell-value-wrap"
                                onClick={this.toggleEdit.bind(this)}>
                                {value === 1 ? "其他出库" : "其他入库"}
                            </div>
                        </div>
                    )
                }
                return (
                    <div className="editable-cell">
                        {" "}
                        {editable ? (
                            <Select
                                ref={node => (this.myRef = node)}
                                style={{ width: "100%" }}
                                key={`${record.key}-${dataIndex}`}
                                value={value}
                                onChange={this.handleChange.bind(this)}
                                onBlur={this.save}>
                                <Select.Option key={1} value={1}>
                                    其他出库
                                </Select.Option>
                                <Select.Option key={2} value={2}>
                                    其他入库
                                </Select.Option>
                            </Select>
                        ) : (
                            <div
                                class="editable-cell-value-wrap"
                                onClick={this.toggleEdit.bind(this)}>
                                {value != null ? (value === 1 ? "其他出库" : "其他入库") : ""}
                            </div>
                        )}
                    </div>
                )
            case "serviceTypeName":
                //statementState --是否自定义,0代表不自定义，1代表自定义
                if (record.statementState === 0) {
                    return (
                        <div className="editable-cell">
                            <div
                                class="editable-cell-value-wrap"
                                onClick={this.toggleEdit.bind(this)}>
                                {value}
                            </div>
                        </div>
                    )
                }

                return (
                    <div className="editable-cell">
                        {" "}
                        {editable ? (
                            <Input
                                ref={node => (this.myRef = node)}
                                key={`${record.key}-${dataIndex}`}
                                value={value}
                                onBlur={this.save}
                                onChange={this.handleChange.bind(this)}></Input>
                        ) : (
                            <div
                                class="editable-cell-value-wrap"
                                title={value}
                                onClick={this.toggleEdit.bind(this)}>
                                {value}
                            </div>
                        )}
                    </div>
                )
            case "acctId":
                let assistJSON = "{}",
                    defaultItem = {
                        id: value,
                    },
                    subjectName = null,
                    obj = record.assistCiName ? JSON.parse(record.assistCiName) : {},
                    assistList = obj.assistList
                defaultItem.codeAndName = `${record["acctCode"] || " "} ${
                    record["acctName"] || " "
                }`
                assistJSON = record["assistCiName"]
                subjectName = record["acctName"]

                const isCanSelectAssist = JSON.parse(assistJSON || "{}").assistList

                let fullName = `${record.acctCode || ""} ${record.acctName || ""} ${
                    assistList ? "/" : ""
                }${assistList ? assistList.map(m => m.name).join("/") : ""}`
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <div>
                                <SelectSubject
                                    ref={node => (this.myRef = node)}
                                    key={`table-${record.key}-col-cell-select-subject`}
                                    value={value}
                                    allowClear
                                    autofocus
                                    metaAction={metaAction}
                                    store={store}
                                    webapi={webapi}
                                    assistJSON={assistJSON}
                                    serviceTypeCode={record.serviceTypeCode}
                                    onChange={value => this.handleChange(value)}
                                    onBlur={this.save}
                                    defaultItem={defaultItem}
                                    // subjectName={subjectName}
                                ></SelectSubject>
                            </div>
                        ) : (
                            <div
                                className={
                                    isCanSelectAssist
                                        ? "editable-cell-value-wrap bovms-select-subject-container no-right-padding"
                                        : "editable-cell-value-wrap"
                                }
                                onClick={this.toggleEdit.bind(this)}
                                title={fullName}>
                                <span className={isCanSelectAssist ? "subject-value" : ""}>
                                    {fullName}
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
                                                record.goodsName
                                            )
                                        }>
                                        辅助
                                    </a>
                                ) : null}
                            </div>
                        )}
                    </div>
                )

            case "summary":
                return (
                    <div className="editable-cell">
                        {editable ? (
                            <Input
                                ref={node => (this.myRef = node)}
                                key={`${record.key}-${dataIndex}`}
                                value={value}
                                onBlur={this.save}
                                onChange={this.handleChange.bind(this)}></Input>
                        ) : (
                            <div
                                class="editable-cell-value-wrap"
                                onClick={this.toggleEdit.bind(this)}
                                title={value}>
                                {value}
                            </div>
                        )}
                    </div>
                )
        }
    }
}

class OrtherStorageTypeSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            tableSource: [],
        }
        this.blankData = {
            serviceTypeId: "", //--类型id
            serviceTypeName: "", // --类型名称
            serviceTypeCode: "", // 类型编码
            invoiceType: 1, //--单据类型类别,1代表其他出库，2代办其他入库
            invoiceTypeName: "", //--单据类型
            summary: "", //--摘要
            state: 1, //--是否禁用,0代表不禁用，1代表禁用
            statementState: 1, //--是否自定义,0代表不自定义，1代表自定义
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.store = props.store
        this.dataGridKey = `other-storage-datagrid-${new Date().valueOf()}`
        if (props.setOkListener) {
            props.setOkListener(::this.onOk)
        }
    }

    componentDidMount() {
        this.initPage()
        this.dom = document.querySelector(".orther-storage-set-type")
    }

    async onOk() {
        let { tableSource } = this.state

        for (let i = 0; i < tableSource.length; i++) {
            if (!tableSource[i]["invoiceType"]) {
                this.metaAction.toast("error", "单据类型不能为空")
                return false
            }
            if (!tableSource[i]["serviceTypeName"]) {
                this.metaAction.toast("error", "业务类型不能为空")
                return false
            }
            if (!tableSource[i]["summary"]) {
                this.metaAction.toast("error", "凭证摘要不能为空")
                return false
            }
        }
        let reg = /[^\u4E00-\u9FA5]/g
        let invalidValue = tableSource.some(s => reg.test(s.serviceTypeName))
        let nameArr = tableSource.map(e => e.serviceTypeName)

        if (invalidValue) {
            this.metaAction.toast("error", "业务类型只支持中文")
            return false
        }
        let nameSet = new Set(nameArr)
        if (nameArr.length != nameSet.size) {
            this.metaAction.toast("error", "业务类型不能重复")
            return false
        }

        let res = await this.webapi.api.saveOtherServiceType({
            serviceTypeList: setListEmptyVal(tableSource),
            isReturnValue: true,
        })
        if (res && !res.result && res.error && res.error.message) {
            this.metaAction.toast("error", res.error.message)
            return false
        }
        this.metaAction.toast("success", "设置成功")
    }

    async initPage() {
        this.setState({
            loading: true,
        })
        let res = await this.webapi.api.queryOtherBillServiceType({
            inveBusiness: this.props.inveBusiness,
        })
        this.setState({
            tableSource: res.map(e => {
                e.key = generatorRandomNum()
                return e
            }),
            loading: false,
        })
    }
    onCellChange(row) {
        const { tableSource } = this.state
        const rowIndex = tableSource.findIndex(f => f.key === row.key)
        const rowItem = tableSource[rowIndex]
        tableSource.splice(rowIndex, 1, { ...rowItem, ...row })
        this.setState({
            tableSource,
        })
    }

    //表头渲染
    getColumns = () => {
        let { tableSource } = this.state,
            dataSource = tableSource,
            colOption = {
                dataSource,
                width: 100,
                fixed: false,
                align: "center",
                className: "",
                flexGrow: 0,
                lineHeight: "37px",
                isResizable: true,
                noShowDetailList: true,
            }
        let columns = [
            {
                width: 130,
                dataIndex: "invoiceType",
                key: "invoiceType",
                title: (
                    <Cell>
                        <span style={{ color: "red", verticalAlign: "middle" }}>*</span>&nbsp;
                        单据类型
                    </Cell>
                ),
                textAlign: "left",
                render: (text, record, index) => {
                    return (
                        <EditableCell
                            key={`editableCell-invoiceType-${record.key}`}
                            value={text}
                            record={record}
                            dataIndex="invoiceType"
                            handleSave={row => this.onCellChange(row)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}></EditableCell>
                    )
                },
            },
            {
                width: 130,
                dataIndex: "serviceTypeName",
                key: "serviceTypeName",
                title: (
                    <Cell>
                        <span style={{ color: "red", verticalAlign: "middle" }}>*</span>&nbsp;
                        业务类型
                    </Cell>
                ),
                textAlign: "left",
                render: (text, record, index) => {
                    return (
                        <EditableCell
                            key={`editableCell-serviceTypeName-${record.key}`}
                            value={text}
                            record={record}
                            dataIndex="serviceTypeName"
                            handleSave={row => this.onCellChange(row)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}></EditableCell>
                    )
                },
            },
            {
                flexGrow: 1,
                dataIndex: "acctId",
                title: "对方科目",
                textAlign: "left",
                render: (text, record, index) => {
                    return (
                        <EditableCell
                            key={`editableCell-acctId-${record.key}`}
                            value={text}
                            record={record}
                            dataIndex="acctId"
                            handleSave={row => this.onCellChange(row)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}></EditableCell>
                    )
                },
            },
            {
                flexGrow: 1,
                dataIndex: "summary",
                key: "summary",
                title: (
                    <Cell>
                        <span style={{ color: "red", verticalAlign: "middle" }}>*</span>&nbsp;
                        凭证摘要
                    </Cell>
                ),
                textAlign: "left",
                render: (text, record, index) => {
                    return (
                        <EditableCell
                            key={`editableCell-summary-${record.key}`}
                            value={text}
                            record={record}
                            dataIndex="summary"
                            handleSave={row => this.onCellChange(row)}
                            webapi={this.webapi}
                            metaAction={this.metaAction}
                            store={this.store}></EditableCell>
                    )
                },
            },
            {
                dataIndex: "state",
                key: "state",
                width: 80,
                title: "状态",
                render: (text, record, index) => <span>{text ? "已启用" : "已停用"}</span>,
            },
            {
                width: 80,
                dataIndex: "opration",
                title: "操作",
                render: (text, row, index) => {
                    return (
                        <div className="editable-row-operations">
                            <a onClick={e => this.switch(row, index)}>
                                {row.state ? "停用" : "启用"}
                            </a>
                        </div>
                    )
                },
            },
        ]

        columns = columns.map(m => renderDataGridCol({ ...colOption, ...m }))
        return columns
    }
    async switch(row, index) {
        let { tableSource } = this.state
        let state = row.state ? 0 : 1

        if (row.id) {
            let res = await this.webapi.api.disableOtherServiceTypeState({
                id: row.id,
                state,
                isReturnValue: true,
            })
            if (res && res.error) {
                return this.metaAction.toast("error", res.error.message)
            }
        }
        tableSource[index].state = state
        this.setState({
            tableSource,
        })

        // this.metaAction.toast('success', '更新成功')
        // this.initPage()
    }
    addRow(e) {
        let { tableSource } = this.state
        tableSource = tableSource.concat({
            key: generatorRandomNum(),
            serviceTypeId: "",
            serviceTypeName: "",
            serviceTypeCode: "",
            invoiceType: null,
            invoiceTypeName: "",
            summary: "",
            state: 1,
            statementState: 1,
        })
        this.setState({
            tableSource,
        })
    }
    async delRow(e) {
        let { tableSource } = this.state
        let row = tableSource[e.rowIndex],
            serviceTypeId = row.serviceTypeId

        if (serviceTypeId) {
            let res = await this.webapi.api.deleteOtherServiceType({
                serviceTypeId,
                isReturnValue: true,
            })
            if (res && res.error) {
                return this.metaAction.toast("error", res.error.message)
            }
            tableSource.splice(e.rowIndex, 1)
            this.setState({ tableSource })
        } else {
            tableSource.splice(e.rowIndex, 1)
            this.setState({ tableSource })
            return
        }
    }
    rowClassNameGetter(idx) {
        let { tableSource } = this.state
        let row = tableSource[idx]
        if (row && isNumber(row.statementState) && row.statementState === 0) {
            return "editable-row no-show-delete-btn"
        }
        return "editable-row"
    }
    onRowMouseEnter(idx) {
        this.dom.setAttribute("class", "ant-modal-wrap orther-storage-set-type")
    }
    onRowMouseLeave(idx) {
        this.dom.setAttribute("class", "ant-modal-wrap orther-storage-set-type default-show-btn")
    }
    render() {
        const { tableSource, loading } = this.state
        return (
            <Spin
                spinning={loading}
                delay={0.1}
                wrapperClassName="spin-box other-storage-type-setting-table-row-edit"
                size="large"
                tip="数据加载中">
                <DataGrid
                    ellipsis={true}
                    className="bovms-common-table-style"
                    headerHeight={37}
                    rowHeight={37}
                    footerHeight={0}
                    rowsCount={(tableSource || []).length}
                    enableSequence={true}
                    startSequence={1}
                    enableSequenceAddDelrow={true}
                    key={this.dataGridKey}
                    onRowMouseEnter={::this.onRowMouseEnter}
                    onRowMouseLeave={::this.onRowMouseLeave}
                    readonly={false}
                    style={{ width: "100%", height: "350px" }}
                    onAddrow={this.addRow.bind(this)}
                    onDelrow={this.delRow.bind(this)}
                    columns={this.getColumns()}
                    rowClassNameGetter={::this.rowClassNameGetter}
                    allowResizeColumn></DataGrid>
            </Spin>
        )
    }
}

export default Form.create({
    name: "orther_storage_type_setting",
})(OrtherStorageTypeSetting)
