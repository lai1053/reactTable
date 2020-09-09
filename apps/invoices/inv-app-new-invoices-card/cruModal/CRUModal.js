import React, { PureComponent } from "react"
import { Input, Select } from "antd"
import EditableCellTable from "../../components/EditableCellTable/index"

const dataSource = []
for (let i = 0; i < 500; i++) {
    dataSource.push({
        key: String(i),
        name: "Edward King " + i,
        age: 18 + i,
        gender: i % 2,
        address: "London, Park Lane no. " + i
    })
}
const minWidth = 1000
export default class CRUModal extends PureComponent {
    constructor(props) {
        super(props)
        this.tableClass = "crum-" + new Date().valueOf()
        const pX = props.width - 48
        const x = pX < minWidth ? minWidth : pX
        const y = 400 //props.height - 105 - 48
        this.state = {
            editCellData: {
                dataSource: dataSource,
                count: dataSource.length,
                width: x,
                height: y + 11,
                scroll: { x, y: y - 37 },
                showFullScreen: true,
                fluctuateCell: {
                    width: 60,
                    flexGrow: "6%",
                    className: "inv-detail"
                }
            },
            errorList: []
        }
        this.editCellColumns = [
            {
                title: <div className={this.isReadOnly?"ant-form-item-center":"ant-form-item-center ant-form-item-required"}>姓名</div>,
                dataIndex: "name",
                width: 300,
                editable: true,
                flexGrow: "30%",
                required: true,
                align: "center",
                className: "inv-detail",
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList
                    } = this.state
                    const disabled = dataSource[index].age > 22
                    const isError = (errorList.find(
                        f => String(f.key) === String(record.key)
                    ) || {})["name"]
                    return disabled ? (
                        false
                    ) : (
                        <Input allowClear isError={isError} />
                    )
                }
            },
            {
                title: "年龄",
                dataIndex: "age",
                width: 100,
                editable: true,
                required: true,
                flexGrow: "10%",
                className: "inv-detail",
                align: "right",
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList
                    } = this.state
                    const isError = (errorList.find(
                        f => String(f.key) === String(record.key)
                    ) || {})["age"]
                    return (
                        <Select
                            style={{ width: "100%" }}
                            getPopupContainer={this.getPopupContainer}
                            allowClear
                            isError={isError}
                        >
                            {new Array(100).fill(null).map((item, i) => (
                                <Select.Option key={i}>{i}</Select.Option>
                            ))}
                        </Select>
                    )
                }
            },
            {
                title: "地址",
                dataIndex: "address",
                className: "inv-detail",
                flexGrow: "44%"
            },
            {
                title: "性别",
                dataIndex: "gender",
                width: 100,
                flexGrow: "10%",
                className: "inv-detail",
                required: true,
                editable: true,
                render: (text, record) =>
                    text !== undefined ? (text ? "男" : "女") : null,
                editEdCell: (text, record, index) => {
                    const {
                        editCellData: { dataSource },
                        errorList
                    } = this.state
                    const isError = (errorList.find(
                        f => String(f.key) === String(record.key)
                    ) || {})["gender"]
                    return (
                        <Select
                            style={{ width: "100%" }}
                            getPopupContainer={this.getPopupContainer}
                            allowClear
                            isError={isError}
                        >
                            <Select.Option key={1}>男</Select.Option>
                            <Select.Option key={0}>女</Select.Option>
                        </Select>
                    )
                }
            }
        ]
        const colStyle = {
            paddingLeft: "10px",
            borderRight: "1px solid"
        }
        const nonFirstBorder = {
            borderTop: "1px solid"
        }
        this.summaryRows = {
            rows: (
                <div className="vt-summary row" style={{ height: 34 * 2 }}>
                    <div
                        style={{
                            width: 360,
                            ...colStyle,
                            textAlign: "center",
                            flex: "36%"
                        }}
                        className="strong"
                    >
                        合计
                    </div>
                    <div
                        style={{
                            width: 100,
                            ...colStyle,
                            flex: "10%",
                            textAlign: "right"
                        }}
                    >
                        123,456.01
                    </div>
                    <div style={{ width: 440, ...colStyle, flex: "44%" }}></div>
                    <div style={{ width: 100, flex: "10%", ...colStyle }}></div>
                    <div
                        style={{
                            width: 360,
                            ...colStyle,
                            textAlign: "center",
                            flex: "36%",
                            ...nonFirstBorder
                        }}
                        className="strong"
                    >
                        合计
                    </div>
                    <div
                        style={{
                            width: 100,
                            ...colStyle,
                            flex: "10%",
                            textAlign: "right",
                            ...nonFirstBorder
                        }}
                    >
                        123,456.01
                    </div>
                    <div
                        style={{
                            width: 440,
                            ...colStyle,
                            flex: "44%",
                            ...nonFirstBorder
                        }}
                    ></div>
                    <div
                        style={{
                            width: 100,
                            flex: "10%",
                            ...colStyle,
                            ...nonFirstBorder
                        }}
                    ></div>
                </div>
            ),
            height: 34 * 2
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.isReadOnly = props.isReadOnly
        props.setOkListener && props.setOkListener(this.onOk)
    }
    onOk = async () => {
        const {
            editCellData: { dataSource }
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
    getPopupContainer = () =>
        document.querySelector(
            `.table-container .${this.tableClass} .vt-body-scroll>div`
        )
    editCellChange = (dataSource, count, tableOptions = {}, newItem) => {
        const {
            width,
            height,
            scroll,
            isFullScreen,
            isFullClient,
            scrollTop
        } = tableOptions
        const editCellData = {
            ...this.state.editCellData,
            dataSource: [...dataSource],
            count
        }
        if (width !== undefined)
            editCellData.width = width < minWidth ? minWidth : width
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
        const { editCellData, editCellColumns } = this.state
        return (
            <React.Fragment>
                <EditableCellTable
                    {...editCellData}
                    rowHeight={rowIndex => 34}
                    onChange={this.editCellChange}
                    columns={this.editCellColumns}
                    summaryRows={this.summaryRows}
                    minWidth={minWidth}
                    className={this.tableClass}
                />
            </React.Fragment>
        )
    }
}
