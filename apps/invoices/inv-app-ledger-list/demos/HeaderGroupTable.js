import React from "react"
import VirtualTable from "../../components/VirtualTable/index"
import { Divider, Tag, Button, Input } from "antd"
import { Resizable } from "react-resizable"

const vtColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        maxWidth: 300,
        resizeAble: true,
        fixed: "left",
    },
    {
        title: "Other",
        children: [
            {
                title: "Age",
                dataIndex: "age",
                key: "age",
                resizeAble: true,
                width: 150,
            },
            {
                title: "Address",
                children: [
                    {
                        title: <Tag color="blue">Street</Tag>,
                        dataIndex: "street",
                        key: "street",
                        width: 150,
                        resizeAble: true,
                        render: text => <Tag color="red">{text}</Tag>,
                    },
                    {
                        title: "Block",
                        children: [
                            {
                                title: "Building",
                                dataIndex: "building",
                                key: "building",
                                resizeAble: true,
                                width: 100,
                            },
                            {
                                title: "Door No.",
                                dataIndex: "number",
                                key: "number",
                                resizeAble: true,
                                width: 100,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        title: "Company",
        flexGrow: 1,
        children: [
            {
                title: "Company Address",
                dataIndex: "companyAddress",
                key: "companyAddress",
                resizeAble: true,
                width: 200,
            },
            {
                title: "Company Name",
                dataIndex: "companyName",
                key: "companyName",
                // width: 200
                flexGrow: 1,
            },
        ],
    },
    {
        title: "Person Gender",
        dataIndex: "gender",
        key: "gender",
        align: "center",
        width: 110,
        fixed: "right",
    },
]
const vtData = []
for (let i = 0; i < 10000; i++) {
    vtData.push({
        key: i,
        name: "John Brown",
        age: i + 1,
        street: "Lake Park",
        building: "C",
        number: 2035,
        companyAddress: "Lake Street 42",
        companyName: "SoftLake Co",
        gender: "M",
        address: "Lake Street " + i + 1,
        tags: [
            "nice",
            "developer",
            "loser",
            "cool",
            "teacher",
            "lake",
            "park",
            "co",
            "brwon",
            "fine",
        ].slice(0, Math.random() * 10),
    })
}
const ResizeableTitle = props => {
    const { onResize, width, resizeAble, ...restProps } = props
    const children = <React.Fragment {...restProps} />
    if (!width || !resizeAble) {
        return children
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={resizeHandle => (
                <span
                    className={`resizable-handle-${resizeHandle}`}
                    onClick={e => {
                        e.stopPropagation()
                    }}
                />
            )}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
            children={children}
        />
    )
}
const getResizeTitle = (cols, handerResize) => {
    const result = []
    cols.forEach(col => {
        const item = {
            ...col,
            minWidth: col.width || 100,
            title: (
                <ResizeableTitle
                    resizeAble={col.resizeAble}
                    width={col.width}
                    onResize={handerResize(col.key)}
                    className={col.width ? "resizable" : ""}>
                    {col.title}
                </ResizeableTitle>
            ),
        }
        if (col.children) {
            item.children = getResizeTitle(col.children, handerResize)
        }
        result.push(item)
    })
    return result
}
const resizeCols = (cols, key, size) => {
    const result = []
    cols.forEach(col => {
        if (col.key === key) {
            col = {
                ...col,
                width:
                    size.width < col.minWidth
                        ? col.minWidth
                        : col.maxWidth && size.width > col.maxWidth
                        ? col.maxWidth
                        : size.width,
            }
        }
        if (col.children) {
            col.children = resizeCols(col.children, key, size)
        }
        result.push(col)
    })
    return result
}

function flatCol(cols) {
    cols = cols.flatMap(item => {
        if (item.children) {
            item = flatCol(item.children)
        }
        return item
    })
    return cols
}
export default class HeaderGroupTable extends React.Component {
    constructor(props) {
        super(props)
        const cols = getResizeTitle(vtColumns, this.handerResize)
        this.state = {
            selectedRowKeys: [],
            loading: false,
            dataSource: vtData,
            rowIndex: 0,
            columns: cols,
        }
        this.initColsWidth = flatCol(cols)
            .map(m => m.width || m.minWidth || 0)
            .reduce((a, b) => a + b, 0)
        this.tableRef = React.createRef()
    }
    handerResize = key => (e, { size }) => {
        this.setState(({ columns }) => {
            return { columns: resizeCols(columns, key, size) }
        })
    }
    onSelectChange = (selectedRowKeys, record, checked) => {
        this.setState({
            selectedRowKeys,
        })
    }
    handerScrollToRow = () => {
        if (this.tableRef) {
            this.tableRef.current.scrollToRow(this.state.rowIndex)
        }
    }
    handerClick() {
        this.setState(preState => {
            return { loading: !preState.loading }
        })
    }
    handerDataClick() {
        this.setState(preState => {
            let dataSource = []
            let columns = []
            if (preState.dataSource.length > 0) {
                dataSource = []
                columns = [...vtColumns]
            } else {
                dataSource = [...vtData]
                columns = getResizeTitle(vtColumns, this.handerResize)
            }
            return {
                dataSource,
                columns,
            }
        })
    }
    render() {
        let { selectedRowKeys, loading, dataSource, rowIndex, columns } = this.state
        const rowSelection = {
            selectedRowKeys,
            columnWidth: 62,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [
                {
                    key: "all-data",
                    text: "选择全部",
                    onSelect: async () => {
                        this.setState({
                            selectedRowKeys: vtData.map(m => m.key),
                        })
                    },
                },
                {
                    key: "no-data",
                    text: "取消选择",
                    onSelect: () => {
                        this.setState({
                            selectedRowKeys: [],
                        })
                    },
                },
            ],
            getCheckboxProps: record => ({
                ...record,
                disabled: record.editable ? true : false,
            }),
        }
        const onRow = record => ({
            onClick: () => {
                let checked = false
                if (selectedRowKeys.some(s => s === record["key"])) {
                    selectedRowKeys = selectedRowKeys.filter(f => f !== record["key"])
                } else {
                    selectedRowKeys.push(record["key"])
                    checked = true
                }
                this.setState({
                    selectedRowKeys,
                })
            },
        })
        const diffWidth =
            flatCol(columns)
                .map(m => m.width || m.minWidth || 0)
                .reduce((a, b) => a + b, 0) - this.initColsWidth
        const scrollX = diffWidth > 0 ? diffWidth + 1500 : 1500
        return (
            <React.Fragment>
                <Button onClick={::this.handerClick}>loading {loading ? "true" : "false"}</Button>
                <Button onClick={::this.handerDataClick}>dataSource toggle</Button>
                <Input
                    style={{ display: "inline-block", width: 100 }}
                    value={rowIndex}
                    onChange={e => {
                        this.setState({ rowIndex: e.target.value })
                    }}
                    onPressEnter={::this.handerScrollToRow}
                    placeholder="Input a rowIndex"
                />
                <VirtualTable
                    ref={this.tableRef}
                    className="header-group-table"
                    onRow={onRow}
                    rowSelection={rowSelection}
                    style={{ width: "1000px", margin: "10px 0" }}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="key"
                    width={1000}
                    height={600}
                    headerHeight={160}
                    scroll={{ y: 400, x: scrollX }}
                    loading={loading}
                    initialScrollIndex={10}
                    rowHeight={r => 37}
                    bordered
                    // allowResizeColumn
                />
            </React.Fragment>
        )
    }
}
