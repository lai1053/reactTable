import React from "react"
import { Select, Modal, Table } from "edf-component"
import { Spin } from "antd"
import webapi from "../webapi.js"
import { formatSixDecimal } from "../../commonAssets/js/common"
import utils from "edf-utils"

// import balanceImg from "../../commonAssets/img/balance.png"
// import noBalanceImg from "../../commonAssets/img/no-balance.png"

// const balanceImg = require('../../commonAssets/img/balance.png')
// const noBalanceImg = require('../../commonAssets/img/no-balance.png')

class QcBom extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tableData: {},
            queryData: {},
            loading: false,
            // scrollProp: 537
        }
    }
    componentDidMount() {
        this.initData()
    }

    render() {
        return (
            <Spin delay={10} spinning={this.state.loading}>
                <div className="modal-chyzz-header" style={{ marginBottom: "10px" }}>
                    差额：
                    <Select defaultValue={0} onChange={this.diffChange}>
                        <Option value={0}>全部</Option>
                        <Option value={1}>有差额</Option>
                        <Option value={2}>无差额</Option>
                    </Select>
                </div>
                <div className="ttk-stock-inventory-earlyStage-modal-table-wrapper">
                    {this.renderTable()}
                </div>
            </Spin>
        )
    }

    async initData() {
        await this.setState({ ...this.props })
        this.diffChange(0)
    }

    // 差额筛选
    diffChange = diff => {
        let queryData = { ...this.state.queryData, diff }
        this.setState({
            queryData,
            loading: true,
        })
        // let queryData = {
        //     "orgId": 236624632772864, //--企业id，必填
        //     "natureOfTaxpayers": 2000010001, //--纳税人性质，必填
        //     "queryType": 1,// 0：全部；1：期初
        //     "period": "2019-11",
        //     "diff": diff // 0：全部；1有差额；2无差额
        // }
        this.getTableData(queryData)
    }

    // 数据获取
    getTableData = async queryData => {
        let tableData = (await webapi.operation.queryReport(queryData)) || {}
        this.setState({
            tableData,
            loading: false,
        })
        // console.log(queryData)
        // this.renderTable()
    }

    // 表格渲染
    renderTable = () => {
        // console.log(this.metaAction.gf('data.tableData').toJS())
        // let { inventoryClassList, allRecTotal } = this.metaAction.gf('data.res').toJS()

        let { checkAccountDetailList, allRecTotal } = this.state.tableData
        checkAccountDetailList = checkAccountDetailList ? checkAccountDetailList : []
        allRecTotal = allRecTotal ? [allRecTotal] : []
        let colName = [
                { title: "存货科目", key: "accountName" },
                { title: "存货类型", key: "inventoryClassList" },
                { title: "存货", key: "qcBalance" },
                { title: "总账", key: "qcGla" },
                { title: "差额", key: "qcDiff" },
                // { title: '存货', key: 'rkBalance' },
                // { title: '总账', key: 'rkGla' },
                // { title: '差额', key: 'rkDiff' },
                // { title: '存货', key: 'ckBalance' },
                // { title: '总账', key: 'ckGla' },
                // { title: '差额', key: 'ckDiff' },
                // { title: '存货', key: 'qmBalance' },
                // { title: '总账', key: 'qmGla' },
                // { title: '差额', key: 'qmDiff' }
            ],
            list = [],
            columns = [],
            fColumns = []

        // inventoryClassList.forEach(el => {
        //   el.checkAccountDetailList[0] = {
        //     ...el.checkAccountDetailList[0],
        //     inventoryClassName: el.inventoryClassName,
        //     inventoryClassId: el.inventoryClassId,
        //     span: el.checkAccountDetailList.length
        //   }

        //   list = [...list, ...el.checkAccountDetailList]
        // })

        // 表格列
        colName.forEach((el, i) => {
            columns.push({
                title: el.title,
                dataIndex: el.key,
                width: i == 0 ? 200 : 150,
                // width: 150,
                // align: 'center',
                // fixed: i < 2 ? true : '',
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: {
                            // rowSpan: row.inventoryClassList && row.inventoryClassList.length || 1
                        },
                    }

                    if (i === 0) {
                        // 存货类型行合并
                        // if (row.span) {
                        //   obj.props.rowSpan = row.checkAccountDetailList.length || 1
                        // } else {
                        //   obj.props.rowSpan = 0
                        // }
                        obj.props.style = { maxWidth: "200px" }
                        obj.props.title = text
                    } else {
                        if (i === 1) {
                            obj.props.style = { maxWidth: "150px", padding: 0, margin: 0 }
                            // obj.props.title = text
                            // obj.props.rowSpan = 1
                            if (row.inventoryClassList) {
                                const domList = row.inventoryClassList.map((el, i) => {
                                    const length = row.inventoryClassList.length - 1
                                    const style = {
                                        display: "block",
                                        lineHeight: "37px",
                                        borderBottom: i == length ? "0 none" : "1px solid #d9d9d9",
                                        padding: "0 4px",
                                    }
                                    return (
                                        <div style={style} title={el.inventoryClassName}>
                                            {el.inventoryClassName}
                                        </div>
                                    )
                                })
                                obj.children = <div>{domList}</div>
                            } else {
                                obj.children = ""
                            }
                        }
                        if (i > 1) {
                            // 数据显示处理
                            if (text) {
                                // obj.children = text.toFixed(2)
                                obj.children = utils.number.format(text, 2)
                                obj.props.style = { textAlign: "right" }
                            } else {
                                obj.children = ""
                            }
                        }
                        if (i === 2 && row.accountName !== "合计") {
                            // 存货列穿透功能
                            // obj.props = {
                            //   onClick: this.showDetailModal(row, idx),
                            //   style: { cursor: 'pointer', textAlign: 'right' }
                            // }
                            obj.props.onClick = this.showDetailModal(row, idx)
                            obj.props.style = {
                                cursor: "pointer",
                                textAlign: "right",
                                color: "#0066B3",
                            }
                        }
                        // if (row.accountName === '合计') { // 合计行样式
                        //   obj.props.style = { backgroundColor: '#fff6ea', fontWeight: 700, textAlign: 'right' }
                        //   if(i === 1) { obj.props.style.textAlign = 'left' }
                        // }
                    }
                    return obj
                },
            })
            // 底部表格列
            fColumns.push({
                title: el.title,
                dataIndex: el.key,
                width: i == 0 ? 200 : 150,
                // width: 150,
                align: i == 0 ? "center" : "",
                // fixed: i < 2 ? true : '',
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: { style: { backgroundColor: "#fff6ea", fontWeight: 700 } },
                    }
                    if (i === 0) {
                        // 列合并
                        obj.children = "总计"
                        obj.props.colSpan = 2
                        // obj.props.style.width = '200px'
                    } else if (i === 1) {
                        obj.props.colSpan = 0
                    } else if (i > 1) {
                        // 数据显示处理
                        obj.children = utils.number.format(text, 2)
                        obj.props.style.textAlign = "right"
                    }
                    return obj
                },
            })
        })
        // let group = [
        //     { title: '期初', children: [] },
        //     { title: '入库', children: [] },
        //     { title: '出库', children: [] },
        //     { title: '期末', children: [] },
        // ], count = 0, columnGroup = []
        // columns.forEach((el, i) => {
        //     if (i < 2) {
        //         columnGroup.push(el)
        //     } else {
        //         group[count].children.push(el)
        //         if (group[count].children.length === 3) {
        //             count++
        //             columnGroup.push(group[count - 1])
        //         }
        //     }
        // })

        // 数据是否平衡
        let noBlance = checkAccountDetailList.some(el => {
            return el.qcDiff != 0
        })

        let imgPath = noBlance ? 'noBalanceImg' : 'balanceImg'
        return (
            <React.Fragment>
                {checkAccountDetailList.length ? (
                    // <img
                    //     src={imgPath}
                    //     className="modal-chyzz-header-img"
                    //     style={{
                    //         position: "absolute",
                    //         right: "10px",
                    //         top: "0px",
                    //         zIndex: 1,
                    //     }}></img>
                        <span className={"modal-chyzz-header-img " + imgPath} />
                ) : null}
                <div className="first-table">
                    <Table
                        columns={columns}
                        dataSource={checkAccountDetailList}
                        bordered
                        pagination={false}
                        // scroll={{ y: true }}
                        scroll={{ y: this.props.bodyHeight - 37 - 32 - 36 - 37, x: '100%' }}
                        style={{height: this.props.bodyHeight - 32 - 36 - 37 + 'px'}}
                    />
                </div>

                <div
                    className="footer-table"
                    style={{ height: checkAccountDetailList.length ? "auto" : "0" }}>
                    <Table
                        bordered
                        columns={fColumns}
                        showHeader={false}
                        dataSource={allRecTotal}
                        pagination={false}
                    />
                </div>
            </React.Fragment>
        )
    }

    // 穿透-筛出数据
    showDetailModal = (row, idx) => () => {
        // console.log(row)
        // let list = this.metaAction.gf('data.list').toJS()
        let list = this.state.list
        let temp = []
        list.forEach(el => {
            if (el.accountId === row.accountId) {
                temp.push(el)
            }
        })
        // console.log(temp)
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if(modalWidth > 1920) { modalWidth = 1920 }
        Modal.show({
            title: <span style={{ fontWeight: 700 }}>存货与总账对账表</span>,
            // width: 941, // 宽度要略大于表个宽度
            footer: null,
            width: modalWidth,
            height: modalHeight,
            style: { top: 25 },
            bodyStyle: {
                height: modalHeight - 47 + "px",
                // maxHeight: modalHeight - 102 + 'px',
                overflow: 'auto',
            },
            children: <div>{this.renderStockTable(temp)}</div>,
        })
    }

    // 穿透-表格渲染
    renderStockTable = list => {
        // let list = this.metaAction.gf('data.list').toJS()
        list = list.filter(el => {
            return el.num || el.price || el.ybBalance
        })
        let colName = [
            { title: "存货编号", key: "inventoryCode" },
            { title: "存货名称", key: "inventoryName" },
            { title: "规格型号", key: "specification" },
            { title: "存货类型", key: "propertyName" },
            { title: "单位", key: "unitName" },
            { title: "数量", key: "num" },
            { title: "单价", key: "price" },
            { title: "金额", key: "ybBalance" },
        ]

        let columns = colName.map((el, i) => {
            return {
                title:
                    i > 4 ? (
                        <React.Fragment>
                            <span style={{ color: "red" }}>*</span>
                            {el.title}
                        </React.Fragment>
                    ) : (
                        el.title
                    ),
                dataIndex: el.key,
                width: i === 1 ? 200 : 100,
                // align: 'center',
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: { style: { maxWidth: "100px" } },
                    }
                    if (i > 4) {
                        // 数据显示处理
                        if (text) {
                            // obj.children =
                            //     el.key === "num" || el.key === "price"
                            //         ? parseFloat(text.toFixed(6))
                            //         : text.toFixed(2)
                            obj.children =
                                el.key === "num" || el.key === "price"
                                    ? formatSixDecimal(text)
                                    : utils.number.format(text, 2)
                        } else {
                            obj.children = ""
                        }
                        obj.props.style.textAlign = "right"
                        if(i == 5) {
                            obj.props.style.textAlign = "left"
                        }
                    }
                    if (i === 0 || i === 4) {
                        obj.props.style.textAlign = "center"
                    }
                    if (i === 1) {
                        obj.props.style = { maxWidth: "200px" }
                    }
                    if (i < 4) {
                        obj.props.title = text
                    }
                    return obj
                },
            }
        })

        return (
            <Table
                className="ttk-stock-inventory-earlyStage-modal-filter-table"
                columns={columns}
                dataSource={list}
                bordered
                pagination={false}
                // scroll={{ y: 400, x: false }}
                scroll={{ y: this.props.bodyHeight - 37 - 32, x: '100%' }}
                style={{height: this.props.bodyHeight - 32 + 'px'}}
            />
        )
    }
}

export default QcBom
