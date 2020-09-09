import React, { PureComponent } from "react"
import { Input, DatePicker, Select } from "antd"
import moment from "moment"

const jzjtDmList = [
    { name: "是", value: "Y" },
    { name: "否", value: "N" },
]
// 销项 默认 明细配置
const xxfpDetailsDefault = function (disbFlag, bgFlag, fpzldm, optionList) {
    let hwlxRes = this.props.metaAction.gf("data.hwlxRes").toJS()
    return [
        {
            title: (
                <div className={this.isReadOnly ? "" : "ant-form-item-required"}>
                    货物或应税劳务服务名称
                </div>
            ),
            dataIndex: "hwmc",
            width: 240,
            editable: disbFlag,
            flexGrow: "24%",
            //required: true,
            align: "left",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => (
                <div className="inv-select-pro-cell" title={text}>
                    <div style={{ width: "90%" }}>{text}</div>
                    <span
                        className="btn"
                        onClick={e => this.handleSelectProduct(e, text, record, index)}>
                        <div className="btnText"> ...</div>
                    </span>
                </div>
            ),
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "规格型号",
            dataIndex: "ggxh",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "ggxh"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        //isError={isError}
                        onChange={e => this.handleChange(record.key, index, "ggxh", e.target.value)}
                    />
                )
            },
        },
        {
            title: "单位",
            dataIndex: "dw",
            width: 50,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dw"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dw", e.target.value)}
                    />
                )
            },
        },
        {
            title: "数量",
            dataIndex: "sl",
            width: 50,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "sl"
                ]
                return (
                    <Input
                        allowClear
                        //isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "sl",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(6)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "单价",
            dataIndex: "dj",
            width: 50,
            editable: false,
            //required: false,
            flexGrow: "5%",
            className: "tablBc",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dj"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dj", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>金额</div>,
            dataIndex: "je",
            width: 100,
            editable: disbFlag,
            //required: true,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                //const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        //value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            //required: true,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state

                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        isError={isError}
                        onBlur={() => this.test()}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className={this.isReadOnly ? "" : "jzjtColums ant-form-item-required"}>
                    货物类型
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            left: "-1rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "hwlxDm")}>
                        {hwlxRes &&
                            hwlxRes.map((item, i) => {
                                return (
                                    <Select.Option key={i} value={item.hwlxDm}>
                                        {item.hwlxMc}
                                    </Select.Option>
                                )
                            })}
                    </Select>
                </div>
            ),
            dataIndex: "hwlxDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                let a =
                    optionList.hwlxRes &&
                    optionList.hwlxRes.find(item => {
                        if (item.hwlxDm == text) {
                            return item
                        }
                    })
                if (a) {
                    return <span title={a.hwlxMc}>{a.hwlxMc}</span>
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwlxDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].hwlxDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwlxDm", e)}>
                        {record.hwlxRes &&
                            record.hwlxRes.map((item, i) => (
                                <Select.Option key={i} value={item.hwlxDm}>
                                    {item.hwlxMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>计税方式</div>,
            dataIndex: "jsfsDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "0") {
                    return "一般计税"
                } else if (text === "1") {
                    return "简易征收"
                } else if (text === "2") {
                    return "免抵退"
                } else if (text === "3") {
                    return "免税"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jsfsDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jsfsDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jsfsDm", e)}>
                        {record.jsfsList &&
                            record.jsfsList.map((item, i) => (
                                <Select.Option key={item.jsfsDm} value={item.jsfsDm}>
                                    {item.jsfsMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.5rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 销项 fpzldm=05 pzldm=09 明细配置
const xxfpDetails05or09 = function (disbFlag, bgFlag, fpzlDm, optionList) {
    let hwlxRes = this.props.metaAction.gf("data.hwlxRes").toJS()
    return [
        {
            title: (
                <div className={fpzlDm === "05" ? "ant-form-item-required" : ""}>
                    货物或应税劳务服务名称
                </div>
            ),
            dataIndex: "hwmc",
            width: 170,
            editable: disbFlag,
            flexGrow: "17%",
            //required: true,
            align: "left",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => (
                <div className="inv-select-pro-cell" title={text}>
                    <div style={{ width: "90%" }}>{text}</div>
                    <span
                        className="btn"
                        onClick={e => this.handleSelectProduct(e, text, record, index)}>
                        <div className="btnText"> ...</div>
                    </span>
                </div>
            ),
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={fpzlDm === "05" ? isError : false}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "规格型号",
            dataIndex: "ggxh",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "ggxh"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "ggxh", e.target.value)}
                    />
                )
            },
        },
        {
            title: "单位",
            dataIndex: "dw",
            width: 50,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dw"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dw", e.target.value)}
                    />
                )
            },
        },
        {
            title: "数量",
            dataIndex: "sl",
            width: 50,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "left",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "sl"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "sl",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(6)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "单价",
            dataIndex: "dj",
            width: 50,
            editable: false,
            required: false,
            flexGrow: "5%",
            className: "tablBc",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dj"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dj", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>含税金额</div>,
            dataIndex: "hsje",
            width: 190,
            editable: disbFlag,
            //required: true,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hsje"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "hsje",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>不含税金额</div>,
            dataIndex: "je",
            width: 90,
            editable: disbFlag,
            // required: true,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            align: "right",
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        //value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税额</div>,
            dataIndex: "se",
            width: 90,
            editable: disbFlag,
            //required: true,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className={this.isReadOnly ? "" : "jzjtColums ant-form-item-required"}>
                    货物类型
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-30%",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "hwlxDm")}>
                        {hwlxRes &&
                            hwlxRes.map((item, i) => {
                                return (
                                    <Select.Option key={i} value={item.hwlxDm}>
                                        {item.hwlxMc}
                                    </Select.Option>
                                )
                            })}
                    </Select>
                </div>
            ),
            dataIndex: "hwlxDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                let a =
                    optionList.hwlxRes &&
                    optionList.hwlxRes.find(item => {
                        if (item.hwlxDm == text) {
                            return item
                        }
                    })
                if (a) {
                    return <span title={a.hwlxMc}>{a.hwlxMc}</span>
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwlxDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].hwlxDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwlxDm", e)}>
                        {record.hwlxRes &&
                            record.hwlxRes.map((item, i) => (
                                <Select.Option key={i} value={item.hwlxDm}>
                                    {item.hwlxMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>计税方式</div>,
            dataIndex: "jsfsDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "0") {
                    return "一般计税"
                } else if (text === "1") {
                    return "简易征收"
                } else if (text === "2") {
                    return "免抵退"
                } else if (text === "3") {
                    return "免税"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jsfsDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jsfsDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jsfsDm", e)}>
                        {record.jsfsList &&
                            record.jsfsList.map((item, i) => (
                                <Select.Option key={item.jsfsDm} value={item.jsfsDm}>
                                    {item.jsfsMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.5rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 80,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "8%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 销项 fpzldm=08 明细配置
const xxfpDetails08 = function (disbFlag, bgFlag, fpzlDm, optionList) {
    let hwlxRes = this.props.metaAction.gf("data.hwlxRes").toJS()
    return [
        {
            title: (
                <div className={this.isReadOnly ? "" : "jzjtColums ant-form-item-required"}>
                    货物类型
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            left: "-1rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "hwlxDm")}>
                        {hwlxRes &&
                            hwlxRes.map((item, i) => {
                                return (
                                    <Select.Option key={i} value={item.hwlxDm}>
                                        {item.hwlxMc}
                                    </Select.Option>
                                )
                            })}
                    </Select>
                </div>
            ),
            dataIndex: "hwlxDm",
            width: 200,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "20%",
            className: bgFlag === true ? "tablBc" : "",
            align: "center",
            render: text => {
                let a =
                    optionList.hwlxRes &&
                    optionList.hwlxRes.find(item => {
                        if (item.hwlxDm == text) {
                            return item
                        }
                    })
                if (a) {
                    return <span title={a.hwlxMc}>{a.hwlxMc}</span>
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwlxDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].hwlxDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwlxDm", e)}>
                        {record.hwlxRes &&
                            record.hwlxRes.map((item, i) => (
                                <Select.Option key={i} value={item.hwlxDm}>
                                    {item.hwlxMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>计税方式</div>,
            dataIndex: "jsfsDm",
            width: 200,
            editable: this.props.isReadOnly === true ? false : true,
            // required: true,
            flexGrow: "17%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "0") {
                    return "一般计税"
                } else if (text === "1") {
                    return "简易征收"
                } else if (text === "2") {
                    return "免抵退"
                } else if (text === "3") {
                    return "免税"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jsfsDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jsfsDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jsfsDm", e)}>
                        {record.jsfsList &&
                            record.jsfsList.map((item, i) => (
                                <Select.Option key={item.jsfsDm} value={item.jsfsDm}>
                                    {item.jsfsMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.5rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 150,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "15%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: (
                <div className={this.isReadOnly ? "" : "ant-form-item-required"}>不含税金额</div>
            ),
            dataIndex: "je",
            width: 150,
            editable: disbFlag,
            // required: true,
            flexGrow: "15%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税率</div>,
            dataIndex: "slv",
            width: 150,
            editable: disbFlag,
            required: false,
            flexGrow: "15%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税额</div>,
            dataIndex: "se",
            width: 150,
            editable: disbFlag,
            //required: true,
            flexGrow: "15%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
    ]
}

// 进项 默认 明细配置
const jxfpDetailsDefault = function (disbFlag, bgFlag, fpzlDm) {
    return [
        {
            title: (
                <div className={this.isReadOnly ? "" : "ant-form-item-required"}>
                    货物或应税劳务服务名称
                </div>
            ),
            dataIndex: "hwmc",
            width: 240,
            editable: disbFlag,
            flexGrow: "24.2%",
            //required: true,
            align: "center",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => {
                return (
                    <div className="inv-select-pro-cell" title={text}>
                        {text}
                        <span
                            className="btn"
                            onClick={e => this.handleSelectProduct(e, text, record, index)}>
                            <div className="btnText"> ...</div>
                        </span>
                    </div>
                )
            },
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "规格型号",
            dataIndex: "ggxh",
            width: 119,
            editable: disbFlag,
            // required: false,
            flexGrow: "11.9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "ggxh"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "ggxh", e.target.value)}
                    />
                )
            },
        },
        {
            title: "单位",
            dataIndex: "dw",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "7%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dw"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dw", e.target.value)}
                    />
                )
            },
        },
        {
            title: "数量",
            dataIndex: "sl",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "7%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "sl"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "sl",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(6)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "单价",
            dataIndex: "dj",
            width: 119,
            editable: false,
            required: false,
            flexGrow: "9.9%",
            className: "tablBc",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dj"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dj", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>金额</div>,
            dataIndex: "je",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "12%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            required: false,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 进项 fpzldm=12 明细配置
const jxfpDetails12 = function (disbFlag, bgFlag, fpzlDm) {
    const dateFormat = "YYYYMMDD"
    return [
        {
            title: "原凭证号",
            dataIndex: "cph",
            width: 150,
            editable: disbFlag,
            required: false,
            flexGrow: "14.4%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "cph"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "cph", e.target.value)}
                    />
                )
            },
        },
        {
            title: "税种",
            dataIndex: "mxlx",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "10.6%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxlx"
                ]
                return (
                    <Input
                        allowClear
                        onChange={e => this.handleChange(record.key, index, "mxlx", e.target.value)}
                    />
                )
            },
        },
        {
            title: "品目名称",
            dataIndex: "mxsf02",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxsf02"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(record.key, index, "mxsf02", e.target.value)
                        }
                    />
                )
            },
        },
        {
            title: "税款所属期",
            dataIndex: "txrq",
            width: 250,
            editable: disbFlag,
            required: false,
            flexGrow: "24%",
            className: bgFlag === true ? "tablBc" : "",
            align: "center",
            dateFormat,
            render: text =>
                Array.isArray(text) ? (
                    <span title={`${text[0]} 至 ${text[1]}`}>{`${text[0]} 至 ${text[1]}`}</span>
                ) : (
                    text
                ),
            editEdCell: (text, record, index) => {
                return (
                    <DatePicker.RangePicker
                        disabledDate={this.disabledDateQ}
                        defaultPickerValue={[moment(this.props.nsqj).subtract(1), this.props.nsqj]}
                        open
                        onChange={(a, b) => this.handleChange(record.key, index, "txrq", b)}
                    />
                )
            },
        },
        {
            title: "入（退）库日期",
            dataIndex: "mxsf01",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "15%",
            className: bgFlag === true ? "tablBc" : "",
            align: "center",
            dateFormat: "YYYYMMDD",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                return (
                    <DatePicker
                        disabledDate={this.disabledDateQ}
                        defaultPickerValue={this.props.nsqj}
                        onChange={(a, b) => this.handleChange(record.key, index, "mxsf01", b)}
                    />
                )
            },
        },
        {
            title: (
                <div className={this.isReadOnly ? "" : "ant-form-item-required"}>
                    实缴（退）金额
                </div>
            ),
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            //required: false,
            flexGrow: "15%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 100,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "10%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 进项 fpzldm=13 明细配置
const jxfpDetails13 = function (disbFlag, bgFlag, fpzlDm) {
    return [
        {
            title: "税号",
            dataIndex: "cph",
            width: 119,
            editable: disbFlag,
            required: false,
            flexGrow: "11.9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "cph"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "cph", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>货物名称</div>,
            dataIndex: "hwmc",
            width: 240,
            editable: disbFlag,
            flexGrow: "24.2%",
            //required: true,
            align: "center",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => {
                return (
                    <div className="inv-select-pro-cell" title={text}>
                        {text}
                        <span
                            className="btn"
                            onClick={e => this.handleSelectProduct(e, text, record, index)}>
                            <div className="btnText"> ...</div>
                        </span>
                    </div>
                )
            },
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "数量",
            dataIndex: "sl",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "7%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "sl"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "sl",
                                (String(e.target.value).match(/^[0-9||.]*$/) * 1).toFixed(6)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "单位",
            dataIndex: "dw",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "7%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dw"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dw", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>完税金额</div>,
            dataIndex: "je",
            width: 100,
            editable: false,
            //required: false,
            flexGrow: "12%",
            className: "tablBc",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            //required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税款金额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            //required: true,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 进项 fpzldm=17 明细配置
const jxfpDetails17 = function (disbFlag, bgFlag, fpzlDm) {
    const dateFormat = "YYYYMMDD"
    return [
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>项目名称</div>,
            dataIndex: "hwmc",
            width: 240,
            editable: disbFlag,
            flexGrow: "24.2%",
            //required: true,
            align: "center",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => {
                return (
                    <div className="inv-select-pro-cell" title={text}>
                        {text}
                        <span
                            className="btn"
                            onClick={e => this.handleSelectProduct(e, text, record, index)}>
                            <div className="btnText"> ...</div>
                        </span>
                    </div>
                )
            },
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "车牌号",
            dataIndex: "cph",
            width: 119,
            editable: disbFlag,
            required: false,
            flexGrow: "8.8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "cph"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "cph", e.target.value)}
                    />
                )
            },
        },
        {
            title: "类型",
            dataIndex: "mxlx",
            width: 9,
            editable: disbFlag,
            required: false,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxlx"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "mxlx", e.target.value)}
                    />
                )
            },
        },
        {
            title: "通行日期起",
            dataIndex: "txrqq",
            width: 90,
            editable: disbFlag,
            required: false,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            dateFormat,
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                return (
                    <DatePicker
                        disabledDate={this.disabledDateQ}
                        defaultPickerValue={this.props.nsqj}
                        onChange={(a, b) => this.handleChange(record.key, index, "txrqq", b)}
                    />
                )
            },
        },
        {
            title: "通行日期止",
            dataIndex: "txrqz",
            width: 119,
            editable: disbFlag,
            required: false,
            flexGrow: "9%",
            className: bgFlag === true ? "tablBc" : "",
            dateFormat,
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                return (
                    <DatePicker
                        disabledDate={this.disabledDateQ}
                        defaultPickerValue={this.props.nsqj}
                        onChange={(a, b) => this.handleChange(record.key, index, "txrqz", b)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>金额</div>,
            dataIndex: "je",
            width: 100,
            editable: disbFlag,
            //required: true,
            flexGrow: "12%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>税额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            //required: true,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            // required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 进项 fpzldm=18 明细配置
const jxfpDetails18 = function (disbFlag, bgFlag, fpzlDm) {
    let ticketTypes = this.props.metaAction.gf("data.ticketTypes").toJS()
    const dateFormat = "YYYYMMDD"
    return [
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>客票类型</div>,
            dataIndex: "mxlx",
            width: 150,
            editable: disbFlag,
            flexGrow: "13.9%",
            //required: true,
            align: "center",
            className: bgFlag === true ? "tablBc" : "",
            render: text => {
                let str = ""
                if (text === "1001") {
                    str = "飞机票"
                } else if (text === "1002") {
                    str = "火车票"
                } else if (text === "1003") {
                    str = "公路 水路等其它客票"
                }
                return <span title={str}>{str}</span>
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxlx"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "mxlx", e)}>
                        {ticketTypes &&
                            ticketTypes.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: "旅客姓名",
            dataIndex: "mxsf02",
            width: 119,
            editable: disbFlag,
            // required: false,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxsf02"
                ]
                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(record.key, index, "mxsf02", e.target.value)
                        }
                    />
                )
            },
        },
        {
            title: "运输服务时间",
            dataIndex: "mxsf01",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "11.8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            dateFormat,
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                return (
                    <DatePicker
                        disabledDate={this.disabledDateQ()}
                        defaultPickerValue={moment(this.props.nsqj, "YYYYMMDD")}
                        onChange={(a, b) => this.handleChange(record.key, index, "mxsf01", b)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>票价</div>,
            dataIndex: "mxnf02",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "8.8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxnf02"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(record.key, index, "mxnf02", e.target.value)
                        }
                    />
                )
            },
        },
        {
            title: "燃油附加费",
            dataIndex: "mxnf03",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].mxlx === "1001"
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxnf03"
                ]
                return !disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "mxnf03",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "总金额",
            dataIndex: "mxnf01",
            width: 119,
            editable: disbFlag,
            required: false,
            flexGrow: "9.4%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "mxnf01"
                ]
                return (
                    <Input
                        isError={isError}
                        allowClear
                        onChange={e =>
                            this.handleChange(record.key, index, "mxnf01", e.target.value)
                        }
                    />
                )
            },
        },
        {
            title: "计税金额",
            dataIndex: "je",
            width: 100,
            editable: false,
            required: false,
            flexGrow: "10%",
            className: "tablBc",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: false,
            required: false,
            flexGrow: "8%",
            className: "tablBc",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>税额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            required: false,
            flexGrow: "7.2%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}
// 进项 fpzldm=99 明细配置
const jxfpDetails99 = function (disbFlag, bgFlag, fpzlDm) {
    return [
        {
            title: (
                <div className={this.isReadOnly ? "" : "ant-form-item-required"}>
                    货物或应税劳务服务名称
                </div>
            ),
            dataIndex: "hwmc",
            width: 240,
            editable: disbFlag,
            flexGrow: "24.2%",
            //required: true,
            align: "center",
            className: bgFlag === true ? "tablBc" : "",
            render: (text, record, index) => {
                return (
                    <div className="inv-select-pro-cell" title={text}>
                        {text}
                        <span
                            className="btn"
                            onClick={e => this.handleSelectProduct(e, text, record, index)}>
                            <div className="btnText"> ...</div>
                        </span>
                    </div>
                )
            },
            editEdCell: (text, record, index) => {
                const { errorList } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hwmc"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "hwmc", e.target.value)}
                    />
                )
            },
        },
        {
            title: "规格型号",
            dataIndex: "ggxh",
            width: 119,
            editable: disbFlag,
            required: false,
            flexGrow: "7.9%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "ggxh"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "ggxh", e.target.value)}
                    />
                )
            },
        },
        {
            title: "单位",
            dataIndex: "dw",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dw"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dw", e.target.value)}
                    />
                )
            },
        },
        {
            title: "数量",
            dataIndex: "sl",
            width: 70,
            editable: disbFlag,
            required: false,
            flexGrow: "5%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (isNaN(text) ? undefined : <span title={text}>{text}</span>),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "sl"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "sl",
                                (String(e.target.value).match(/^[0-9||.]*$/) * 1).toFixed(6)
                            )
                        }
                    />
                )
            },
        },
        {
            title: "单价",
            dataIndex: "dj",
            width: 119,
            editable: false,
            required: false,
            flexGrow: "6.9%",
            className: "tablBc",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const disabled = dataSource[index].age > 22
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "dj"
                ]
                return disabled ? (
                    false
                ) : (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e => this.handleChange(record.key, index, "dj", e.target.value)}
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : "ant-form-item-required"}>含税金额</div>,
            dataIndex: "hsje",
            width: 190,
            editable: disbFlag,
            // required: true,
            flexGrow: "11%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "hsje"
                ]
                return (
                    <Input
                        allowClear
                        isError={isError}
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "hsje",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>不含税金额</div>,
            dataIndex: "je",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "12%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "je"
                ]
                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "je",
                                (String(e.target.value).match(/^[0-9||.||-]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>税率</div>,
            dataIndex: "slv",
            width: 80,
            editable: disbFlag,
            required: false,
            flexGrow: "8%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => (text != undefined ? text * 100 + "%" : undefined),
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "slv"
                ]
                return (
                    <Select
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        value={this.state.editCellData.dataSource[index].slv}
                        onChange={e => this.handleChange(record.key, index, "slv", e)}>
                        {record.slList &&
                            record.slList.map((item, i) => (
                                <Select.Option key={item.id} value={item.slv}>
                                    {item.slvMc}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
        {
            title: <div className={this.isReadOnly ? "" : ""}>税额</div>,
            dataIndex: "se",
            width: 100,
            editable: disbFlag,
            required: false,
            flexGrow: "10%",
            className: bgFlag === true ? "tablBc" : "",
            align: "right",
            render: text => <span title={text}>{text}</span>,
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "se"
                ]

                return (
                    <Input
                        allowClear
                        onChange={e =>
                            this.handleChange(
                                record.key,
                                index,
                                "se",
                                (String(e.target.value).match(/^[0-9||.|| -]*$/) * 1).toFixed(2)
                            )
                        }
                    />
                )
            },
        },
        {
            title: (
                <div className="jzjtColums">
                    即征即退
                    <Select
                        style={{
                            width: "100px",
                            position: "absolute",
                            right: "-1.2rem",
                            top: "20%",
                        }}
                        onChange={e => this.handleChangeColumns(e, "jzjtDm")}>
                        {jzjtDmList.map((item, i) => {
                            return (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
            ),
            dataIndex: "jzjtDm",
            width: 70,
            editable: this.props.isReadOnly === true ? false : true,
            //required: true,
            flexGrow: "7%",
            className: this.props.isReadOnly === true ? "tablBc" : "",
            align: "center",
            render: text => {
                if (text === "Y") {
                    return "是"
                } else if (text === "N") {
                    return "否"
                }
            },
            editEdCell: (text, record, index) => {
                const {
                    editCellData: { dataSource },
                    errorList,
                } = this.state
                const isError = (errorList.find(f => String(f.key) === String(record.key)) || {})[
                    "jzjtDm"
                ]
                return (
                    <Select
                        value={this.state.editCellData.dataSource[index].jzjtDm}
                        style={{ width: "100%" }}
                        getCalendarContainer={this.getPopupContainer}
                        allowClear
                        onChange={e => this.handleChange(record.key, index, "jzjtDm", e)}>
                        {record.jzjtDmList &&
                            record.jzjtDmList.map((item, i) => (
                                <Select.Option key={i} value={item.value}>
                                    {item.name}
                                </Select.Option>
                            ))}
                    </Select>
                )
            },
        },
    ]
}

const editCellColumns = function (optionList) {
    let fplx = this.props.fplx
    let fplyLx = this.props.form.fplyLx
    let fpzlDm = this.props.fpzlDm
    let disbFlag = true,
        bgFlag = false
    if (fplyLx != 2 || this.props.isReadOnly === true) disbFlag = false
    if (fplyLx != 2 || this.props.isReadOnly === true) {
        bgFlag = true
    }
    if (fplx === "xxfp") {
        switch (fpzlDm) {
            case "05":
            case "09":
                return xxfpDetails05or09.call(this, disbFlag, bgFlag, fpzlDm, optionList)
            case "08":
                return xxfpDetails08.call(this, disbFlag, bgFlag, fpzlDm, optionList)
            default:
                return xxfpDetailsDefault.call(this, disbFlag, bgFlag, fpzlDm, optionList)
        }
    } else {
        switch (fpzlDm) {
            case "12":
                return jxfpDetails12.call(this, disbFlag, bgFlag, fpzlDm)
            case "13":
                return jxfpDetails13.call(this, disbFlag, bgFlag, fpzlDm)
            case "17":
                return jxfpDetails17.call(this, disbFlag, bgFlag, fpzlDm)
            case "18":
                return jxfpDetails18.call(this, disbFlag, bgFlag, fpzlDm)
            case "99":
                return jxfpDetails99.call(this, disbFlag, bgFlag, fpzlDm)
            default:
                return jxfpDetailsDefault.call(this, disbFlag, bgFlag, fpzlDm)
        }
    }
}
export default {
    editCellColumns,
}
