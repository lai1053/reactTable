import React, { PureComponent } from "react"
import { Input, Select, DatePicker } from "antd"
import EditableCellTable from "../../components/EditableCellTable/index"
import isEqual from "lodash.isequal"
// import { addEvent, removeEvent, findDomFromParent } from "../../utils"

// import moment from "moment"
const dataSource = []
for (let i = 0; i < 2000; i++) {
    dataSource.push({
        key: String(i),
        name: "Edward King " + i,
        age: 18 + i,
        gender: i % 2,
        address: undefined,
        address1: undefined,
        address2: undefined,
        address3: undefined,
        // address: "London, Park Lane no. " + i
    })
}
const minWidth = 1060
export default class CRUModal extends PureComponent {
    constructor(props) {
        super(props)
        this.tableClass = "crum-" + new Date().valueOf()
        this.shortcutsClass = "crum-modal-container" + new Date().valueOf()
        const pX = props.width - 48
        const x = pX < minWidth ? minWidth : pX
        const y = 400 //props.height - 105 - 48
        const dateFormat = "YYYY-MM-DD"
        this.state = {
            editCellData: {
                dataSource: dataSource.map(d => ({ ...d })),
                count: dataSource.length,
                width: x,
                height: y + 11,
                scroll: { x, y: y - 37 },
                showFullClient: true,
                fluctuateCell: {
                    width: 60,
                    // flexGrow: "6%",
                    className: "inv-detail",
                },
            },
            errorList: [],
        }
        this.editCellColumns = [
            {
                title: "姓名1",
                dataIndex: "name",
                // width: 100,
                // editable: true,
                flexGrow: "10%",
                required: true,
                align: "center",
                className: "inv-detail",
            },
            {
                title: "姓名",
                dataIndex: "name",
                // width: 200,
                editable: true,
                flexGrow: "20%",
                onlyFlex: true,
                required: true,
                align: "center",
                className: "inv-detail",
                render: text => (
                    <div className="inv-select-pro-cell">
                        {text}
                        <a className="btn" onClick={e => this.handleSelectProduct(e, text)}>
                            ...
                        </a>
                    </div>
                ),
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList,
                    } = this.state
                    const disabled = dataSource[index].age > 160
                    const isError = (errorList.find(f => String(f.key) === String(record.key)) ||
                        {})["name"]
                    return disabled ? (
                        false
                    ) : (
                        <Input
                            allowClear
                            isError={isError}
                            onChange={e =>
                                this.handleChange(record.key, index, "name", e.target.value)
                            }
                        />
                    )
                },
            },
            {
                title: "年龄",
                dataIndex: "age",
                // width: 100,
                editable: true,
                required: true,
                flexGrow: "10%",
                className: "inv-detail",
                align: "right",
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList,
                    } = this.state
                    const isError = (errorList.find(f => String(f.key) === String(record.key)) ||
                        {})["age"]
                    return (
                        <Select
                            style={{ width: "100%" }}
                            getPopupContainer={this.getPopupContainer}
                            allowClear
                            isError={isError}
                            onChange={e => this.handleChange(record.key, index, "age", e)}>
                            {new Array(100).fill(null).map((item, i) => (
                                <Select.Option key={i}>{i}</Select.Option>
                            ))}
                        </Select>
                    )
                },
            },
            {
                title: "日期",
                dataIndex: "address",
                className: "inv-detail",
                // width: 120,
                flexGrow: "12%",
                editable: true,
                dateFormat,
                editEdCell: (text, record, index) => {
                    return (
                        <DatePicker
                            getCalendarContainer={this.getPopupContainer}
                            onChange={(a, b) => this.handleChange(record.key, index, "address", b)}
                        />
                    )
                },
            },
            {
                title: "月份",
                dataIndex: "address1",
                className: "inv-detail",
                // width: 120,
                flexGrow: "12%",
                editable: true,
                dateFormat: "YYYY-MM",
                editEdCell: (text, record, index) => {
                    return (
                        <DatePicker.MonthPicker
                            getCalendarContainer={this.getPopupContainer}
                            onChange={(a, b) => this.handleChange(record.key, index, "address1", b)}
                        />
                    )
                },
            },

            {
                title: "开始时间",
                dataIndex: "address2",
                className: "inv-detail",
                // width: 100,
                flexGrow: "10%",
                editable: true,
                dateFormat,
                render: text =>
                    Array.isArray(text) ? <span>{`${text[0]} ~ ${text[1]}`}</span> : text,
                editEdCell: (text, record, index) => {
                    return (
                        <DatePicker
                            getCalendarContainer={this.getPopupContainer}
                            onChange={(a, b) => this.handleChange(record.key, index, "address2", b)}
                        />
                    )
                },
            },
            {
                title: "结束时间",
                dataIndex: "address3",
                className: "inv-detail",
                // width: 100,
                flexGrow: "10%",
                editable: true,
                dateFormat,
                render: text =>
                    Array.isArray(text) ? <span>{`${text[0]} ~ ${text[1]}`}</span> : text,
                editEdCell: (text, record, index) => {
                    return (
                        <DatePicker
                            getCalendarContainer={this.getPopupContainer}
                            onChange={(a, b) => this.handleChange(record.key, index, "address3", b)}
                        />
                    )
                },
            },
            {
                title: "性别",
                dataIndex: "gender",
                // width: 100,
                flexGrow: "10%",
                className: "inv-detail",
                required: true,
                editable: true,
                render: (text, record) => (text !== undefined ? (text ? "男" : "女") : null),
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList,
                    } = this.state
                    const isError = (errorList.find(f => String(f.key) === String(record.key)) ||
                        {})["gender"]
                    return (
                        <Select
                            style={{ width: "100%" }}
                            getPopupContainer={this.getPopupContainer}
                            allowClear
                            isError={isError}
                            onChange={value =>
                                this.handleChange(
                                    record.key,
                                    index,
                                    "gender",
                                    value === undefined ? value : Number(value)
                                )
                            }>
                            <Select.Option key={1}>男</Select.Option>
                            <Select.Option key={0}>女</Select.Option>
                        </Select>
                    )
                },
            },
        ]
        this.summaryRows = {
            rows: null,
            rowsComponent: function (columns) {
                const colStyle = {
                    paddingLeft: "10px",
                    borderRight: "1px solid",
                }
                const nonFirstBorder = {
                    borderTop: "1px solid",
                }
                return (
                    <div className="vt-summary row" style={{ height: 34, flexWrap: "nowrap" }}>
                        <div
                            style={{
                                width: columns[0].width + columns[1].width,
                                ...colStyle,
                                textAlign: "center",
                                // flex: "16%",
                            }}
                            className="strong">
                            合计
                        </div>
                        <div style={{ flex: columns[2].flexGrow, ...colStyle }}></div>
                        <div
                            style={{
                                width: columns[3].width,
                                ...colStyle,
                                // flex: "10%",
                            }}></div>
                        <div
                            style={{
                                width:
                                    columns[4].width +
                                    columns[5].width +
                                    columns[6].width +
                                    columns[7].width,
                                ...colStyle,
                                // flex: "44%",
                            }}></div>
                        <div style={{ width: columns[8].width, ...colStyle }}></div>
                    </div>
                )
            },
            height: 34,
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.isReadOnly = props.isReadOnly
        props.setOkListener && props.setOkListener(this.onOk)
    }
    onOk = async () => {
        const {
            editCellData: { dataSource },
        } = this.state
        const errorList = []
        dataSource.forEach(item => {
            const errorItem = { key: item.key }
            if (!item.name) {
                errorItem.name = true
            }
            if (item.age === undefined) {
                errorItem.age = true
            }
            if (item.gender === undefined) {
                errorItem.gender = true
            }
            errorList.push(errorItem)
        })
        console.log("onOk:", dataSource)
        if (dataSource.find(f => !f.name || !f.age || f.gender === undefined)) {
            this.metaAction.toast("error", "红框内必须有值")
            this.setState({ errorList })
            return false
        }
        this.setState({ errorList })
        // const res = await this.webapi.invoices[apiFun](rowData);
        // if (res === null || res) {
        //     return { needReload: true };
        // }
        return false
    }
    handleSelectProduct(e, text) {
        this.metaAction.toast && this.metaAction.toast("info", text)
        e.stopPropagation && e.stopPropagation()
    }
    handleChange = (rowKey, rowIndex, field, value) => {
        // console.log("handleChange:", rowKey, rowIndex, field, value)
        const { errorList, editCellData } = this.state
        const record = editCellData.dataSource[rowIndex]
        const prevRecord = { ...record }
        record[field] = value
        const errorItem = errorList.find(f => String(f.key) === String(rowKey)) || {}
        const newErrorItem = { key: rowKey }
        if (value === "" || value === undefined) {
            newErrorItem[field] = true
        } else {
            newErrorItem[field] = false
        }
        if (!isEqual(record, prevRecord) || !isEqual(errorItem, newErrorItem)) {
            this.setState({
                editCellData,
                errorList: [
                    ...errorList.filter(f => String(f.key) !== String(rowKey)),
                    newErrorItem,
                ],
            })
        }
    }
    getPopupContainer = () => document.querySelector("." + this.shortcutsClass) || document.body
    //  .vt-body-scroll>div
    editCellChange = (dataSource, count, tableOptions = {}) => {
        const { width, height, scroll, isFullScreen, isFullClient, scrollTop } = tableOptions
        const editCellData = {
            ...this.state.editCellData,
            dataSource: [].concat(dataSource),
            count,
        }
        if (width !== undefined) editCellData.width = width < minWidth ? minWidth : width
        if (height !== undefined) editCellData.height = height
        if (scroll !== undefined) {
            const { x, y } = scroll
            editCellData.scroll = { x: x < minWidth ? minWidth : x, y }
        }
        if (isFullScreen !== undefined) editCellData.isFullScreen = isFullScreen
        if (isFullClient !== undefined) editCellData.isFullClient = isFullClient
        if (scrollTop !== undefined) editCellData.scrollTop = scrollTop
        this.setState({ editCellData })
    }

    render() {
        const { editCellData } = this.state
        const scrollX = editCellData.scroll.x
        const columns = this.editCellColumns.map((col, i) => {
            const m = { ...col }
            let width = m.width
            if (m.onlyFlex) {
                m.width && delete m.width
            } else if (m.flexGrow) {
                width = Number((m.flexGrow.replace("%", "") * scrollX) / 100)
                delete m.flexGrow
            }
            return { ...m, width }
        })

        return (
            <div className={this.shortcutsClass}>
                <EditableCellTable
                    {...editCellData}
                    addRowProps={record => ({ disabled: false, hide: false })}
                    deleteRowProps={record => ({
                        disabled: false,
                        hide: false,
                    })}
                    rowKey="key"
                    rowHeight={rowIndex => 34}
                    onChange={this.editCellChange}
                    columns={columns}
                    summaryRows={this.summaryRows}
                    minWidth={minWidth}
                    className={this.tableClass}
                    openShortcuts
                    shortcutsClass={this.shortcutsClass}
                    allowResizeColumn
                    scroll={{ ...editCellData.scroll, x: scrollX + 10 }}
                />
            </div>
        )
    }
}
