import React from "react";
import { Pagination,Table } from "edf-component";
import {
    Input,
    Icon,
    Button,
    Select,
    Form,
} from "antd";

class ComfirmDelete extends React.Component {
    onOk = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal("ok");
    };
    onCancel = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal("cancel");
    };
    render() {
        return (
            <div>
                <div
                    className="bovms-app-popup-content no-top-padding"
                    style={{
                        padding: "0 30px 20px 30px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start"
                    }}
                >
                    <Icon
                        type="exclamation-circle"
                        style={{
                            fontSize: "20px",
                            color: "#fa7c63",
                            marginTop: "4px"
                        }}
                    />
                    <span
                        style={{
                            fontSize: "14px",
                            marginLeft: "8px",
                            lineHeight: "27px"
                        }}
                    >
                        {" "}
                        确定要删除该换算比率？
                    </span>
                </div>
                <div className="bovms-app-actions-footer-not-tip">
                    <div>
                        <Button type="primary" onClick={this.onOk}>
                            确定
                        </Button>
                        <Button onClick={this.onCancel}>取消</Button>
                    </div>
                </div>
            </div>
        );
    }
}

class ConversionRatio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            loading: false,
            disabled: false,
            selectedRowKeys: [],
            page: 1,
            pageSize: 50,
            goodsName: "",
            total: 0,
            sourceType: null,
            editingKey: "",
        };
        this.cachaData = "";
        if (props.setOkListener) {
            props.setOkListener(this.onOk);
        }
    }
    componentDidMount() {
        this.getData();
    }
    async getData() {
        this.setState({
            loading: true
        });
        let { page, pageSize, goodsName, sourceType } = this.state;
        let params = {
            entity: {
                goodsName: goodsName,
                sourceType: sourceType
            },
            page: {
                currentPage: page,
                pageSize: pageSize
            }
        };
        let res = await this.props.webapi.bovms.queryUnitChangeRatioPageList(
            params
        );

        this.setState({
            tableData: res.list.map((e, i) => {
                e.isEditing = false;
                e.key = i;
                return e;
            }),
            total: res.totalRecordNum,
            loading: false
        });
    }
    isEditing = record => record.key === this.state.editingKey;

    save(key) {
        this.props.form.validateFields((error, row) => {
            if (error) {
                return;
            }
            row.originalUnitNum = parseFloat(row.originalUnitNum);
            row.destinationUnitNum = parseFloat(row.destinationUnitNum);
            //不可小于等于0
            if (row.originalUnitNum < 0 || row.destinationUnitNum < 0) {
                return this.props.metaAction.toast("error", "不可小于0");
            }
            if (row.originalUnitNum === 0 || row.destinationUnitNum === 0) {
                return this.props.metaAction.toast("error", "不可输入0");
            }

            if (row.originalUnitNum > 1000000) {
                return this.props.metaAction.toast("error", "不可大于1000000");
            }

            const newData = [...this.state.tableData];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                this.setState({ tableData: newData, editingKey: "" }, () => {
                    this.saveUnitChangeRatioRecords();
                });
            } else {
                newData.push(row);
                this.setState({ tableData: newData, editingKey: "" }, () => {
                    this.saveUnitChangeRatioRecords();
                });
            }
        });
    }
    cancel(key) {
        this.setState({ editingKey: "" });
    }
    edit(key) {
        this.setState({ editingKey: key });
    }
    async delete(key) {
        let res = await this.props.metaAction.modal("show", {
            title: "删除确认",
            style: { top: 5 },
            width: 400,
            footer: false,
            wrapClassName: "bovms-batch-subject-setting",
            children: <ComfirmDelete />
        });
        if (res === "ok") {
            let { tableData } = this.state;
            let dItem = tableData.find(f => f.key == key);
            let params = {
                sourceType: dItem.sourceType,
                goodsName: dItem.goodsName,
                specification: dItem.specification,
                originalUnitName: dItem.originalUnitName,
                destinationUnitName: dItem.destinationUnitName
            };
            let res = await this.props.webapi.bovms.deleteUnitChangeRatioRecords(
                [params]
            );
            if (res === null) {
                this.props.metaAction.toast("success", "删除成功");
                this.getData();
            }
        }
    }
    onChange(index) {
        let { tableData } = this.state;
        let item = tableData[index].needToMemorize;
        tableData[index].needToMemorize = item === 1 ? 0 : 1;
        this.setState({ tableData });
    }
    onCancel = async e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    };

    onSelectChange = val => {
        this.setState({
            selectedRowKeys: val
        });
    };
    onPageChange(page) {
        this.setState(
            {
                page
            },
            () => {
                this.getData();
            }
        );
    }
    onSizeChange(current, size) {
        this.setState(
            {
                page: current,
                pageSize: size
            },
            () => {
                this.getData();
            }
        );
    }
    async saveUnitChangeRatioRecords() {
        let { tableData } = this.state;
        let res = await this.props.webapi.bovms.saveUnitChangeRatioRecords(
            tableData
        );
        if (res === null) {
            this.props.metaAction.toast("success", "保存成功");
        }
    }
    inputOnChange(e) {
        this.setState({
            goodsName: e.target.value
        });
    }
    onSelect(val) {
        this.setState(
            {
                sourceType: val
            },
            () => {
                this.getData();
            }
        );
    }

    render() {
        const {
            tableData,
            loading,
            page,
            pageSize,
            goodsName,
            sourceType,
            total
        } = this.state;
        const { getFieldDecorator } = this.props.form;
        const columns = [
            {
                title: "商品或服务名称",
                dataIndex: "goodsName",
                key: "goodsName",
                onCell: this.onCell
            },
            {
                title: "规格型号",
                dataIndex: "specification",
                key: "specification",
                width: 140,
                onCell: this.onCell
            },
            {
                title: "用途",
                dataIndex: "sourceType",
                key: "sourceType",
                width: 120,
                render: (text, record, index) => {
                    return text == "1" ? "数量核算" : "存货核算";
                },
                onCell: this.onCell
            },
            {
                title: "原单位（发票）",
                dataIndex: "originalUnitNum",
                key: "originalUnitNum",
                width: 140,
                render: (text, record, index) => {
                    const editing = this.isEditing(record);
                    return editing ? (
                        <div className="conversion-ratio-editble-wrap">
                            <Form.Item
                                style={{
                                    marginRight: "8px",
                                    marginBottom: "0"
                                }}
                            >
                                {getFieldDecorator("originalUnitNum", {
                                    rules: [
                                        {
                                            required: true,
                                            message: `不可为空`
                                        }
                                    ],
                                    normalize: (value, prevValue, allValues) => {
                                        if (value == "") {
                                            return value;
                                        }
                                        if (String(value).match(/^[0-9||.]*$/) &&
                                            parseFloat(value) <= 1000000
                                        ) {
                                            return value;
                                        } else {
                                            return prevValue;
                                        }
                                    },
                                    initialValue: record["originalUnitNum"]
                                })(<Input />)}
                            </Form.Item>
                            <span>{record["originalUnitName"]}</span>
                        </div>
                    ) : (
                            <div className="conversion-ratio-editble-wrap">
                                <span>{record["originalUnitNum"]}</span>
                                <span>{record["originalUnitName"]}</span>
                            </div>
                        );
                }
            },
            {
                title: "=",
                align: "center",
                render: () => "=",
                width: 60,
                onCell: this.onCell
            },
            {
                title: "目标单位",
                dataIndex: "destinationUnitNum",
                key: "destinationUnitNum",
                width: 140,
                render: (text, record, index) => {
                    const editing = this.isEditing(record);
                    return editing ? (
                        <div className="conversion-ratio-editble-wrap">
                            <Form.Item
                                style={{
                                    marginRight: "8px",
                                    marginBottom: "0"
                                }}
                            >
                                {getFieldDecorator("destinationUnitNum", {
                                    rules: [
                                        {
                                            required: true,
                                            message: `不可为空`
                                        }
                                    ],
                                    normalize: (
                                        value,
                                        prevValue,
                                        allValues
                                    ) => {
                                        if (value == "") {
                                            return value;
                                        }
                                        if (
                                            String(value).match(
                                                /^[0-9||.]*$/
                                            ) &&
                                            parseFloat(value) <= 1000000
                                        ) {
                                            return value;
                                        } else {
                                            return prevValue;
                                        }
                                    },
                                    initialValue: record["destinationUnitNum"]
                                })(<Input />)}
                            </Form.Item>
                            <span>{record["destinationUnitName"]}</span>
                        </div>
                    ) : (
                            <div className="conversion-ratio-editble-wrap">
                                <span>{record["destinationUnitNum"]}</span>
                                <span>{record["destinationUnitName"]}</span>
                            </div>
                        );
                }
            },
            {
                title: "操作",
                width: 100,
                render: (text, record, index) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable ? (
                        <span className="conversion-ratio-oparate">
                            <a onClick={this.save.bind(this, record.key)}>
                                保存
                            </a>
                            <a onClick={this.cancel.bind(this, record.key)}>
                                取消
                            </a>
                        </span>
                    ) : (
                            <span className="conversion-ratio-oparate">
                                <a
                                    disabled={editingKey !== ""}
                                    onClick={this.edit.bind(this, record.key)}
                                >
                                    编辑
                            </a>
                                <a
                                    disabled={editingKey !== ""}
                                    onClick={this.delete.bind(this, record.key)}
                                >
                                    删除
                            </a>
                            </span>
                        );
                }
            }
        ];
        
        return (
            <div className="bovms-unit-conversion">
                <div className="bovms-app-popup-content">
                    <div className="conversion-ratio-filter">
                        <Input
                            placeholder="请输入商品或服务名称"
                            style={{ width: "230px" }}
                            value={goodsName}
                            onChange={this.inputOnChange.bind(this)}
                            onPressEnter={this.getData.bind(this)}
                            prefix={<Icon type="search" />}
                        />
                        <Select
                            onChange={this.onSelect.bind(this)}
                            style={{ width: "100px", marginLeft: "8px" }}
                            value={sourceType}
                        >
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key="1" value="1">
                                数量核算 
                            </Select.Option>
                            <Select.Option key="2" value="2">
                                存货核算
                            </Select.Option>
                        </Select>
                    </div>
                    <Table
                        loading={loading}
                        className="bovms-common-table-style"
                        columns={columns}
                        dataSource={tableData}
                        pagination={false}
                        bordered
                        style = {{ width: "950px", height: "456px"}}
                        scroll={{ y: 410, x: 945 }}
                    />
                    <div className="bovms-common-table-style-footer" style={{ width : "950px"}}>
                        <div></div>
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            onChange={this.onPageChange.bind(this)}
                            pageSizeOptions={["50", "100", "200", "300"]}
                            onShowSizeChange={this.onSizeChange.bind(this)}
                            total={total}
                            showTotal={total => `共${total}条记录`}
                        />
                    </div>
                </div>
                <div className="bovms-app-actions-footer">
                    <div class="bovms-app-actions-footer-tip">
                        共{total}条记录
                    </div>
                    <div>
                        <Button onClick={this.onCancel}>关闭</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Form.create({ name: "bovms_app_conversion-ratio" })(
    ConversionRatio
);
