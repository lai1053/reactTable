import React from "react"
// import { Spin } from 'antd';
import { Radio, Spin, NoData } from "edf-component"
import { Table, Column, Cell } from "fixed-data-table-2"

class RadioTable extends React.Component {
    state = {
        // selectedRowKeys: [], // Check here to configure the default column
    }

    onSelectChange = selectedRowKeys => {
        if (this.props.callback) {
            this.props.callback(selectedRowKeys)
        }
    }
    radioChange(v) {
        if (this.props.callback) {
            this.props.callback([v])
        }
    }
    onRowClick(e, index) {
        const { callback, data } = this.props
        if (callback && data[index]) {
            callback([data[index].key])
        }
        e && e.preventDefault && e.preventDefault()
    }
    render() {
        let { selectedRowKeys, data, loading } = this.props
        const columns = [
            <Column
                header={<Cell>{""}</Cell>}
                width={50}
                align="center"
                cell={({ rowIndex, ...props }) => (
                    <Cell {...props}>
                        <Radio
                            checked={
                                data[rowIndex] &&
                                selectedRowKeys[0] &&
                                data[rowIndex].key === selectedRowKeys[0]
                                    ? true
                                    : false
                            }
                            onChange={e =>
                                this.radioChange(data[rowIndex] && data[rowIndex].key)
                            }></Radio>
                    </Cell>
                )}
            />,
            <Column
                header={<Cell>商品名称</Cell>}
                width={200}
                align="center"
                cell={({ rowIndex, ...props }) => (
                    <div
                        {...props}
                        title={(data[rowIndex] && data[rowIndex].spmc) || ""}
                        className="-cell">
                        {(data[rowIndex] && data[rowIndex].spmc) || ""}
                    </div>
                )}
            />,
            <Column
                header={<Cell>简称</Cell>}
                width={120}
                align="center"
                cell={({ rowIndex, ...props }) => (
                    <div
                        {...props}
                        title={(data[rowIndex] && data[rowIndex].spmcJc) || ""}
                        className="-cell">
                        {(data[rowIndex] && data[rowIndex].spmcJc) || ""}
                    </div>
                )}
            />,
            <Column
                header={<Cell>商品编码</Cell>}
                width={200}
                align="center"
                cell={({ rowIndex, ...props }) => (
                    <Cell {...props}>{(data[rowIndex] && data[rowIndex].spbm) || ""}</Cell>
                )}
            />,
            <Column
                header={<Cell>适用税率(%)</Cell>}
                width={138}
                align="right"
                cell={({ rowIndex, ...props }) => (
                    <Cell {...props}>{(data[rowIndex] && data[rowIndex].zzssl) || ""}</Cell>
                )}
            />,
        ]

        return (
            <Spin delay={200} size="large" tip="数据加载中..." spinning={loading}>
                <Table
                    className="mk-datagrid mk-ellipsis"
                    key="radioTable"
                    headerHeight={37}
                    rowHeight={37}
                    height={370}
                    width={725}
                    rowsCount={(data || []).length}
                    allowResizeColumn
                    onRowClick={::this.onRowClick}>
                    {columns}
                </Table>
                {!loading && data && data.length < 1 && (
                    <NoData
                        style={{
                            position: "absolute",
                            height: "220px",
                            top: "50%",
                            marginTop: "-110px",
                        }}>
                        请在左侧选择具体的商品！
                    </NoData>
                )}
            </Spin>
        )
    }
}
export default RadioTable
