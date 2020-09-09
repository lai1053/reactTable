import React from "react"
import { Table, Button, Select, Layout, Input, Popover, Icon } from "edf-component"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import utils from "edf-utils"
// import { Spin } from "antd"
import { addEvent, removeEvent } from "../commonAssets/js/common"
import { stockLoading } from "../commonAssets/js/common"
import VirtualTable from "../../invoices/components/VirtualTable/index"

const columnData = [
    {
        id: "sequence",
        caption: "序号",
        fieldName: "sequence",
        isFixed: false,
        isVisible: true,
        width: 60,
        isMustSelect: false,
        align: "center",
        render: (text, record, index) => index + 1,
    },
    {
        caption: "存货类型",
        fieldName: "inventoryClassName",
        isFixed: false,
        isVisible: true,
        width: 150,
        isMustSelect: false,
    },
    {
        caption: "存货编号",
        fieldName: "inventoryCode",
        isFixed: false,
        isVisible: true,
        width: 140,
        isMustSelect: false,
        align: "center",
        flexGrow: 1,
    },
    {
        caption: "存货名称",
        fieldName: "inventoryName",
        isFixed: false,
        isVisible: true,
        width: 185,
        isMustSelect: false,
    },
    {
        caption: "规格型号",
        fieldName: "inventoryGuiGe",
        isFixed: false,
        isVisible: true,
        width: 185,
        isMustSelect: false,
    },
    {
        caption: "单位",
        fieldName: "inventoryUnit",
        isFixed: false,
        isVisible: true,
        width: 185,
        isMustSelect: false,
        align: "center",
    },
]

class StockAppInventoryIntelligence extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false, // 表格loading
            selectedRowKeys: [],
            tableOption: {
                x: 1,
                y: 272,
            },
            form: {
                constom: "全部",
                code: "",
                operater: "liucp",
                propertyDetailFilter: [
                    { name: "全部" },
                    {
                        name: "库存商品",
                    },
                    {
                        name: "原材料",
                    },
                    {
                        name: "周转材料",
                    },
                    {
                        name: "委托加工物资",
                    },
                ],
            },
            list: [],
            otherLoading: false,
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        // this.params = props.params || {}
        props.setOkListener(this.onOk)
    }

    componentWillMount() {
        this.load(true)
    }

    stockLoading = () => stockLoading()

    onSearch = data => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.setState({ inputVal: data })
            this.reload()
        }, 500)
    }
    resetForm = () => {
        this.setState({ form: { ...this.state.form, constom: "全部" } })
    }
    filterList = () => {
        this.setState({ showPopoverCard: false })
        this.reload()
    }
    load = async () => {
        this.selectNameList = sessionStorage["inventoryNameList"]
        this.setState({
            otherLoading: true,
            loading: true,
        })
        let reqList = {
            code: this.state.inputVal,
            name: this.state.form.constom.replace("全部", ""),
        }
        const response = await this.webapi.operation.query(reqList)
        let propertyDetailFilter = await this.webapi.operation.findInventoryEnumList()
        this.setState({
            list: response,
            form: {
                ...this.state.form,
                propertyDetailFilter,
            },
            // propertyDetailFilter,
            otherLoading: false,
            loading: false,
        })
    }
    reload = async () => {
        this.setState({
            otherLoading: true,
            loading: true,
        })
        let reqList = {
            code: this.state.inputVal,
            name: this.state.form.constom.replace("全部", ""),
        }
        const response = await this.webapi.operation.query(reqList)
        this.setState({
            list: response,
            selectedRowKeys: [],
            otherLoading: false,
            loading: false,
        })
    }
    renderTotalAmount = (text, record, row) => {
        return (
            <span
                title={
                    typeof text === "number" && row.amount ? utils.number.format(text, 2) : text
                }>
                {typeof text === "number" && row.amount ? utils.number.format(text, 2) : text}
            </span>
        )
    }
    renderColumns = () => {
        const arr = []
        // const column = this.metaAction.gf('data.columns') && this.metaAction.gf('data.columns').toJS() ||[]
        // column.forEach((item, index) => {
        columnData.forEach((item, index) => {
            if (item.isVisible) {
                const col = {
                    title: item.caption,
                    dataIndex: item.fieldName,
                    key: item.fieldName,
                    width: item.width,
                    align: item.align,
                    className: item.className,
                }
                if (item.flexGrow) {
                    col.flexGrow = item.flexGrow
                }
                if (col.key !== "sequence") {
                    // col.render = (text, record) => this.renderTotalAmount(text, record, item)
                } else {
                    col.render = item.render
                }
                arr.push(col)
            }
        })
        return arr
    }

    onSelectChange = selectedRowKeys => this.setState({ selectedRowKeys })

    rowSelection = () => {
        let selectedRowKeys = this.state.selectedRowKeys
        return {
            selectedRowKeys,
            columnWidth: 62,
            hideDefaultSelections: true,
            onChange: this.onSelectChange,
            getCheckboxProps: row => {
                return {
                    disabled:
                        this.selectNameList.indexOf(row.inventoryId) > -1 && !this.props.canRepeat
                            ? true
                            : false, // row是一行的数据，就是后台返回的list中的一条数据
                }
            },
        }
    }

    onOk = async () => await this.save()

    save = async () => {
        let { selectedRowKeys, list } = this.state
        let arr = []
        list.forEach(item => {
            selectedRowKeys.forEach(data => {
                if (data == item.inventoryId) {
                    arr.push(item)
                }
            })
        })

        return arr
    }

    getSelectOption = () => {
        let arr = this.state.form.propertyDetailFilter
        arr = arr.map(item => {
            return (
                <Option key={item.name} value={item.name} title={item.name}>
                    {item.name}
                </Option>
            )
        })
        return arr
    }

    handlePopoverVisibleChange = visible => {
        this.setState({ showPopoverCard: visible })
    }
    /**
     * @description: 本页面渲染
     * @return: 返回本页面组件JSX
     */
    render() {
        const {
            otherLoading,
            selectedRowKeys,
            loading,
            list,
            tableOption,
            form,
            showPopoverCard,
        } = this.state
        let content = (
            <div name="popover-content" className="inv-batch-custom-popover-content">
                <div name="filter-content" className="filter-content">
                    <div name="popover-number" className="inv-batch-custom-popover-item">
                        <span name="label" className="inv-batch-custom-popover-label">
                            存货类型：
                        </span>
                        <Select
                            name="bankAccountType"
                            placeholder="请选择"
                            className="inv-batch-custom-popover-select"
                            getPopupContainer={function (trigger) {
                                return trigger.parentNode
                            }}
                            value={form.constom}
                            onChange={v => {
                                this.setState({ form: { ...form, constom: v } })
                            }}
                            children={this.getSelectOption()}
                        />
                    </div>
                </div>
                <div name="filter-footer" className="filter-footer">
                    <Button name="search" type="primary" onClick={this.filterList}>
                        查询
                    </Button>
                    <Button name="reset" className="reset-btn" onClick={this.resetForm}>
                        重置
                    </Button>
                </div>
            </div>
        )
        return (
            <React.Fragment>
                {loading && <div className="ttk-stock-app-spin">{this.stockLoading()}</div>}
                <div name="header" className="ttk-stock-app-inventory-intelligence-header-title">
                    <div name="inv-app-batch-sale-header" className="inv-app-batch-sale-header">
                        <div name="header-left" className="header-left">
                            <Input
                                name="header-filter-input"
                                className="inv-app-batch-sale-header-filter-input"
                                type="text"
                                placeholder="请输入存货名称/存货编号"
                                prefix={<Icon name="search" type="search" />}
                                onChange={e => {
                                    this.onSearch(e.target.value)
                                }}
                            />
                            <Popover
                                name="popover"
                                popupClassName="inv-batch-sale-list-popover"
                                placement="bottom"
                                trigger="click"
                                visible={showPopoverCard}
                                content={content}
                                onVisibleChange={this.handlePopoverVisibleChange}>
                                <span
                                    name="filterSpan"
                                    className="inv-batch-custom-filter-btn header-item">
                                    <Icon name="filter" type="filter"></Icon>
                                </span>
                            </Popover>
                        </div>
                    </div>
                    <VirtualTable
                        // name="general-list-table"
                        className="inv-batch-custom-table-list"
                        columns={this.renderColumns()}
                        dataSource={list}
                        // key="table-small-custom"
                        rowSelection={this.rowSelection()}
                        rowKey="inventoryId"
                        // style={{ width: `925px` }}
                        width={930}
                        height={310}
                        scroll={{ y: 300 - 41, x: 940 }}
                        allowResizeColumn={true}
                        rowHeight={r => 37}
                        // bordered
                    />
                </div>
                <div name="footer" className="ttk-stock-app-inventory-intelligence-footer">
                    <div name="title">共有：</div>
                    <div name="title" className="sum-num">
                        {list.length}条
                    </div>
                    <div name="title">已选：</div>
                    <div name="title">{selectedRowKeys.length}条</div>
                </div>
            </React.Fragment>
        )
    }
}

export default StockAppInventoryIntelligence
