import React, { PureComponent, Fragment } from "react"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import VirtualTable from "../../../invoices/components/VirtualTable/index"
import { Input } from "edf-component"
import { tableColumnsField } from "./common/staticField"
import { stockLoading } from "../../commonAssets/js/common"

export default class StockAppCardSelectWarehousingNames extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            searchType: "",
            tableOption: {
                y: 240,
                x: "100%",
            },
            selectedRowKeys: [],
            disabledKeys: [],
            loading: false,
            visible: false,
            list: [
                {
                    inventoryId: "12313127",
                    inventoryCode: "KC005",
                    inventoryName: "数据采集主模块 KCTSV-008",
                    inventoryGuiGe: "MX100-MWEK-1SQ",
                    inventoryType: "库存商品",
                    inventoryUnit: "台",
                    checked: true,
                },
            ],
        }
        this.component = props.component || {}
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
    }

    componentDidMount() {
        this.initPage()
    }

    initPage = () => {
        this.component.props.setOkListener &&
            this.component.props.setOkListener(() => {
                const selectedRows = []
                const { selectedRowKeys = [], list = [] } = this.state || {}
                for (const item of list) {
                    for (const v of selectedRowKeys) {
                        if (v == item.inventoryId) {
                            selectedRows.push(item)
                        }
                    }
                }
                return selectedRows
            })

        this.load()
    }

    load = () => {
        this.setState({ loading: true })
        const list = this.component.props.selectNameList || [],
            disabledKeys = [],
            searchType = this.component.props.searchType

        list.map(v => {
            if (v.disabled) {
                disabledKeys.push(v.inventoryId)
            }
        })

        this.setState({
            list,
            searchType,
            allList: [...list],
            disabledKeys,
            searchPlaceholder: this.component.props.searchPlaceholder,
            loading: false,
        })
    }

    renderColumns = () => {
        const header = tableColumnsField.map(col => {
            const v = { ...col }
            v.title = <div className="td-header-text">{v.title}</div>
            if (v.dataIndex == "inventoryName") {
                v.render = (text, record, index) => {
                    return (
                        <div className="warehouse-txtOverflow" title={text}>
                            {text}
                        </div>
                    )
                }
            }
            return v
        })
        return header
    }

    rowSelection = () => {
        let selectedRowKeys = this.state.selectedRowKeys || []
        let selectedRowArr = this.state.selectedRows || []
        let disabledKeys = this.state.disabledKeys || []
        return {
            selectedRowKeys,
            getCheckboxProps: row => {
                const result = disabledKeys.some(v => v == row.inventoryId)
                return {
                    disabled: result,
                    name: result ? "tableUnChecked" : "canSelect",
                }
            },
            onSelect: (record, selected, selectedRows, nativeEvent) => {
                if (selected && !record.disabled) {
                    selectedRowKeys.push(record.inventoryId)
                    selectedRowArr.push(record)
                } else {
                    const deleteIndex = selectedRowArr.findIndex(v => {
                        return v.inventoryId === record.inventoryId
                    })
                    if (deleteIndex > -1) {
                        selectedRowArr.splice(deleteIndex, 1)
                        selectedRowKeys.splice(deleteIndex, 1)
                    }
                }

                this.setState({
                    selectedRowKeys: [...selectedRowKeys],
                    selectedRows: [...selectedRowArr],
                })
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                let copy = []
                if (selected) {
                    selectedRowKeys = selectedRows.map(v => {
                        if (!v.disabled) {
                            copy.push(v)
                            return v.inventoryId
                        }
                    })
                } else {
                    selectedRowKeys = []
                    copy = []
                }

                this.setState({
                    selectedRowKeys: [...selectedRowKeys],
                    selectedRows: [...copy],
                })
            },
        }
    }

    renderFooter = currentPageData => {
        const list = this.state.list || [],
            selectedRow = this.state.selectedRowKeys || []
        const total = list.length
        const selectedNum = selectedRow.length
        return (
            <div style={{ textAlign: "left" }}>
                <span>{`合计： ${total} 条`}</span>
                <span style={{ marginLeft: "20px" }}>{`已选中： ${selectedNum} 条`}</span>
            </div>
        )
    }

    // 输入框搜索
    handleInputSearch = e => {
        let val = e.target.value
        let allList = this.state.allList || []
        if (val && val.trim()) {
            allList = allList.filter(v => {
                if (v.inventoryName.indexOf(val) > -1 || v.inventoryCode.indexOf(val) > -1) {
                    return v
                }
            })
        }
        this.setState({ list: [...allList] })
    }

    // 搜索下拉框的change事件
    filterCallBack = v => {
        const { name, inventoryClassId } = v
        let allList = this.state.allList || []
        allList = allList.filter(v => {
            if (name && inventoryClassId) {
                return (
                    (v.inventoryName.indexOf(name) > -1 || v.inventoryCode.indexOf(name) > -1) &&
                    v.inventoryClassId.toString() === inventoryClassId.toString()
                )
            } else if (name && !inventoryClassId) {
                return v.inventoryName.indexOf(name) > -1 || v.inventoryCode.indexOf(name) > -1
            } else if (!name && inventoryClassId) {
                return v.inventoryClassId === inventoryClassId
            } else {
                return v
            }
        })
        this.setState({ list: [...allList] })
    }

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys: selectedRowKeys })
    }

    render() {
        const {
            searchType,
            searchPlaceholder,
            list = [],
            selectedRowKeys = [],
            tableOption = {},
            loading,
            disabledKeys = [],
        } = this.state
        const rowSelection = {
            selectedRowKeys,
            columnWidth: 62,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            getCheckboxProps: record => {
                const result = disabledKeys.some(v => v == record.inventoryId)
                return {
                    ...record,
                    disabled: result,
                    name: result ? "tableUnChecked" : "canSelect",
                }
            },
        }
        return (
            <React.Fragment>
                {loading && <div className="ttk-stock-app-spin">{stockLoading()}</div>}
                <div className="ttk-stock-app-header" style={{ padding: "0 0 10px 0" }}>
                    <div className="header-left">
                        <div className="filter-container">
                            {searchType === "input" ? (
                                <Input.Search
                                    className="filter-input"
                                    placeholder={searchPlaceholder}
                                    onChange={v => {
                                        this.handleInputSearch(v)
                                    }}
                                />
                            ) : (
                                <AppLoader
                                    className="filter-btn"
                                    name="ttk-stock-app-completion-warehousing-filter"
                                    callback={v => {
                                        this.filterCallBack(v)
                                    }}
                                    store={this.component.props.store}
                                    selectNameList={this.component.props.selectNameList}
                                    selectOptions={this.component.props.selectOptions}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <VirtualTable
                    className="ttk-stock-card-select-warehousing-names-div-mian-table"
                    key="id"
                    rowKey="inventoryId"
                    loading={loading}
                    rowSelection={rowSelection}
                    columns={this.renderColumns()}
                    dataSource={list}
                    style={{ width: `925px` }}
                    width={930}
                    height={310}
                    scroll={{ y: 300 - 41, x: 940 }}
                    allowResizeColumn
                />
                <div
                    name="footer"
                    className="ttk-stock-app-inventory-intelligence-footer"
                    style={{ float: "none", height: 40 }}>
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
