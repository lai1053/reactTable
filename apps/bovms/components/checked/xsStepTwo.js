import React from "react"
import { Row, Col, Button, Spin, Popover, Icon } from "antd"
import { Input, DataGrid, TableSort } from "edf-component"
import renderDataGridCol from "../column/index"
import SimplePagination from "../SimplePagenation"
import { quantityFormat } from "../../utils/index"

class XsStepTwo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            keyword: "", // 销方名称或者商品服务名称
            page: 1, // 当前页
            pageSize: 50, // 页设置
            sourceData: [],
            resultData: [],
            tableData: [], // 分页显示数据
            amountData: "", // 合计数据
            sort: null,
            filterParams: {
                fpzlDm: null,
                rzzt: null,
                minAmount: "",
                maxAmount: ""
            },
            inCompleteList: [],
            term: 1
        }
        this.cachaData = []
    }
    componentDidMount() {
        this.querySaleInvoice()
    }

    inputOnChange = val => {
        this.setState({
            keyword: val.target.value
        })
    }

    // 输入框查询
    initData = () => {
        const { keyword, page, pageSize, inCompleteList, term } = this.state
        let start = (page - 1) * pageSize
        let data = term === 1 ? this.cachaData : inCompleteList
        if (keyword == "") {
            this.setState({
                sourceData: data,
                resultData: data,
                tableData: data.slice(start, pageSize)
                //selectedRowKeys: []
            })
        } else {
            let newData = []
            data.map(e => {
                if (
                    e.goodName.includes(keyword) ||
                    e.custName.includes(keyword)
                ) {
                    newData.push(e)
                } else {
                    e.detailList.some(d => {
                        if (
                            (d.goodsName && d.goodsName.includes(keyword)) ||
                            (d.custName && d.custName.includes(keyword))
                        ) {
                            newData.push(e)
                        }
                    })
                }
            })
            this.setState({
                page: 1,
                resultData: newData,
                tableData: newData.slice(start, pageSize)
            })
        }
    }

    async querySaleInvoice() {
        this.setState({
            loading: true
        })
        let res = await this.props.webapi.bovms.querySaleInvoice(
            this.props.params
        )
        let { inCompleteList, saleList } = res
        if (inCompleteList) {
            this.setState({
                inCompleteList: inCompleteList
            })
        }
        if (res && saleList && saleList.length) {
            this.cachaData = res.saleList
            this.initData()
            this.setState({
                negativeAmount: res.negativeAmount,
                negativeTaxAmount: res.negativeTaxAmount,
                positiveAmount: res.positiveAmount,
                positiveTaxAmount: res.positiveTaxAmount,
                loading: false
            })
        } else {
            let dom = document.getElementsByClassName("mk-nodata")[0]
            let tip = document.createElement("div")
            tip.style.lineHeight = "28px"
            tip.innerText = "可能是票据模块还未采集发票哦~"
            dom.appendChild(tip)
            this.setState({
                sourceData: [],
                tableData: [],
                loading: false
            })
        }
    }

    onPageChange = page => {
        this.setState({
            page: page,
            tableData: this.state.resultData.slice(
                (page - 1) * this.state.pageSize,
                page * this.state.pageSize
            )
        })
    }
    //每页显示条数
    onSizeChange(current, size) {
        this.setState(
            {
                pageSize: size,
                page: 1
            },
            () => {
                this.setState({
                    tableData: this.state.resultData.slice(
                        (this.state.page - 1) * this.state.pageSize,
                        this.state.page * this.state.pageSize
                    )
                })
            }
        )
    }

    // 合计
    renderFooterAmount = () => {
        let {
            negativeAmount = 0,
            positiveAmount = 0,
            negativeTaxAmount = 0,
            positiveTaxAmount = 0,
            sourceData
        } = this.state

        let content = (
            <span className="footer-amount-item-span">
                <span className="count-item">合计 &nbsp;&nbsp;</span>
                <span className="count-item">
                    <span className="bold-text inv-number">
                        发票：<strong>{sourceData.length}</strong>
                    </span>
                    张 &nbsp;&nbsp;
                </span>
                <span className="count-item">
                    <span className="bold-text inv-number">
                        价税合计：
                        <strong>
                            {positiveAmount != 0
                                ? quantityFormat(
                                      positiveAmount,
                                      2,
                                      false,
                                      false
                                  ) + "(元)"
                                : ""}
                            {negativeAmount != 0
                                ? quantityFormat(
                                      negativeAmount,
                                      2,
                                      false,
                                      false
                                  ) + "(元)"
                                : ""}
                            {positiveAmount == 0 &&
                                negativeAmount == 0 &&
                                "0.00(元)"}
                        </strong>
                    </span>{" "}
                    &nbsp;&nbsp;
                </span>
                <span className="count-item">
                    税额：
                    <strong>
                        {positiveTaxAmount != 0
                            ? quantityFormat(
                                  positiveTaxAmount,
                                  2,
                                  false,
                                  false
                              ) + "(元)"
                            : ""}
                        {negativeTaxAmount != 0
                            ? quantityFormat(
                                  negativeTaxAmount,
                                  2,
                                  false,
                                  false
                              ) + "(元)"
                            : ""}
                        {positiveTaxAmount == 0 &&
                            negativeTaxAmount == 0 &&
                            "0.00(元)"}
                    </strong>
                </span>
            </span>
        )
        return (
            <Popover
                content={<div className="footer-amount">{content}</div>}
                overlayClassName="inv-tool-tip-normal tool-tip-footer-amount"
            >
                <div className="footer-amount  ellipsis-text">{content}</div>
            </Popover>
        )
    }

    /*
     * 取票页面逻辑
     * */
    //表头渲染
    getColumns = () => {
        let nsrxz = this.props.nsrxz
        let { tableData, selectedRowKeys, term, sort } = this.state,
            dataSource = tableData,
            colOption = {
                dataSource,
                selectedRowKeys,
                width: 100,
                fixed: false,
                align: "center",
                className: "",
                flexGrow: 0,
                lineHeight: 37,
                isResizable: false,
                noShowDetailList: true
            }
        let columns = [
            {
                width: 90,
                dataIndex: "invNo",
                title: "发票号码",
                className: "inv-type",
                textAlign: "left"
            },
            {
                width: 130,
                dataIndex: "invKindName",
                title: "发票类型",
                className: "inv-type",
                textAlign: "left"
            },
            {
                width: 100,
                dataIndex: "billDate",
                title: (
                    <TableSort
                        title="开票日期"
                        sortOrder={sort || null}
                        handleClick={e => this.sortChange(e)}
                    />
                ),
                className: "inv-type"
            },
            {
                flexGrow: 1,
                dataIndex: "custName",
                title: "购方名称",
                className: "inv-type",
                textAlign: "left"
            },
            {
                flexGrow: 1,
                dataIndex: "goodName",
                title: "商品或服务名称",
                textAlign: "left",
                className: "inv-type"
            },
            {
                width: 100,
                dataIndex: "amount",
                title: "价税合计",
                textAlign: "right",
                className: "inv-type"
            }
        ]

        if (term === 2) {
            columns.push({
                flexGrow: 1,
                dataIndex: "mark",
                title: "问题描述",
                textAlign: "left"
            })
        }
        //nsrxz ? columns = columns.concat(columnDataXguiMo) : columns = columns.concat(columnDataYiBan)
        columns = columns
            .map((item, index) => {
                return {
                    ...item,
                    render: (text, record) =>
                        this.renderColumnsDetail(text, record, item.dataIndex)
                }
            })
            .map(m => renderDataGridCol({ ...colOption, ...m }))
        return columns
    }
    //表格明细渲染
    renderColumnsDetail = (text, row, type) => {
        if (type === "rzzt") {
            return row.rzzt === "0"
                ? "未认证"
                : row.rzzt === "1"
                ? "已认证"
                : row.rzzt === "2"
                ? "待抵扣"
                : "-"
        } else if (type === "billDate") {
            return row.billDate ? row.billDate.substring(0, 10) : ""
        } else if (type === "goodName") {
            if (row.detailList && Array.isArray(row.detailList)) {
                let dom = (
                    <div>
                        {row.detailList.map((e, i) => {
                            if (i < 6) {
                                return <div>{e.goodsName}</div>
                            }
                        })}{" "}
                        {row.detailList.length > 6 && <div>...</div>}
                    </div>
                )

                return (
                    <Popover placement="right" content={dom}>
                        <span
                            style={{
                                display: "inline-block",
                                width: "100%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                            title={text}
                        >
                            {text}
                        </span>
                    </Popover>
                )
            } else {
                return <span title={text}>{text}</span>
            }
        } else if (type == "amount") {
            return quantityFormat(text, 2, false, false)
        } else {
            return <span title={text}>{text}</span>
        }
    }

    // 保存入账数据
    saleTakeSave = async () => {
        this.setState({
            loading: true
        })

        let data = {
            saleList: this.cachaData
        }
        //传递参数到父页面请求
        this.props.onSaleTakeSave(data)
    }
    onTabChange(index) {
        this.setState(
            {
                term: index
            },
            () => {
                this.initData()
            }
        )
    }
    sortChange(e) {
        let { tableData } = this.state
        this.setState({
            sort: e
        })
        if (e === "asc") {
            tableData.sort((a, b) => (a.billDate > b.billDate ? 1 : -1))
        } else {
            tableData.sort((a, b) => (a.billDate < b.billDate ? 1 : -1))
        }
    }
    render() {
        const {
            keyword,
            tableData,
            loading,
            resultData,
            sourceData,
            inCompleteList,
            page,
            pageSize,
            term
        } = this.state

        return (
            <div
                className="bovms-app-guidePage-range-step-two"
                style={{ paddingTop: "16px" }}
            >
                <div className="bovms-app-guidePage-popup-content">
                    <Spin
                        spinning={loading}
                        delay={1}
                        wrapperClassName="spin-box"
                        size="large"
                        tip="数据加载中"
                    >
                        <div class="ant-tabs-bar ant-tabs-top-bar">
                            <div class="ant-tabs-nav-container">
                                <div class="ant-tabs-nav">
                                    <div
                                        class={
                                            term === 1
                                                ? "ant-tabs-tab-active ant-tabs-tab"
                                                : "ant-tabs-tab"
                                        }
                                        onClick={this.onTabChange.bind(this, 1)}
                                    >
                                        本期入账({sourceData.length})
                                    </div>
                                    {inCompleteList.length != 0 && (
                                        <div
                                            class={
                                                term === 2
                                                    ? "ant-tabs-tab-active ant-tabs-tab"
                                                    : "ant-tabs-tab"
                                            }
                                            onClick={this.onTabChange.bind(
                                                this,
                                                2
                                            )}
                                        >
                                            问题票 ({inCompleteList.length})
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bovms-app-guidePage-range-step-two-filter">
                            <div className="bovms-common-actions-header">
                                <Input
                                    placeholder="请输入购方名称或商品服务名称"
                                    style={{
                                        width: "250px",
                                        marginRight: "4px"
                                    }}
                                    value={keyword}
                                    onChange={this.inputOnChange}
                                    onPressEnter={this.initData}
                                    prefix={<Icon type="search" />}
                                />
                            </div>
                        </div>
                        <div>
                            <DataGrid
                                className="bovms-common-table-style"
                                headerHeight={37}
                                rowHeight={37}
                                footerHeight={0}
                                rowsCount={(tableData || []).length}
                                columns={this.getColumns()}
                                style={{ width: "100%", height: "350px" }}
                                ellipsis
                            />

                            <Row className="bovms-common-table-style-footer">
                                <Col span="15">
                                    {term != 2 ? (
                                        <span>{this.renderFooterAmount()}</span>
                                    ) : (
                                        <span className="footer-amount-item-span">
                                            <span className="count-item">
                                                合计 &nbsp;&nbsp;
                                            </span>
                                            <span className="count-item">
                                                <span className="bold-text inv-number">
                                                    发票：
                                                    <strong>
                                                        {inCompleteList.length}
                                                    </strong>
                                                </span>
                                                张 &nbsp;&nbsp;
                                            </span>
                                        </span>
                                    )}
                                </Col>
                                <Col span="9">
                                    <SimplePagination
                                        showSizeChanger
                                        showQuickJumper
                                        pageSize={pageSize}
                                        pageSizeOptions={[
                                            "50",
                                            "100",
                                            "200",
                                            "300"
                                        ]}
                                        current={page}
                                        style={{ textAlign: "right" }}
                                        total={resultData.length}
                                        onChange={this.onPageChange.bind(this)}
                                        onShowSizeChange={this.onSizeChange.bind(
                                            this
                                        )}
                                        showTotal={total => `共${total}条记录`}
                                    ></SimplePagination>
                                </Col>
                            </Row>
                        </div>
                    </Spin>
                </div>
                <div className="bovms-app-actions-footer">
                    <div class="bovms-app-actions-footer-tip">
                        {term === 1 && (
                            <p>
                                <span>温馨提示：</span>
                                请将需列表中的发票生成为单据
                            </p>
                        )}
                        {term === 2 && (
                            <p>
                                <span>温馨提示：</span>
                                问题票不能生成单据，请按原因在发票模块补充数据或者重新采集
                            </p>
                        )}
                    </div>
                    <div>
                        <Button onClick={this.props.onPrev}> 上一步</Button>
                        {!!sourceData.length && term === 1 && (
                            <Button
                                type="primary"
                                onClick={this.saleTakeSave}
                                loading={loading}
                            >
                                生成单据
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                this.props.onCancel()
                            }}
                        >
                            取消
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default XsStepTwo
