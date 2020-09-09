import React, { PureComponent } from "react"
import VirtualTable from "../../components/VirtualTable/index"
import { Divider, Tag } from "antd"
import { Resizable } from "react-resizable"

const vtSimpleColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left",
        resizeAble: true,
        render: text => <a>{text}</a>,
    },
    {
        title: "Age",
        dataIndex: "age",
        key: "age",
        resizeAble: true,
        width: 100,
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        resizeAble: true,
        width: 200,
    },
    {
        title: "Tags",
        key: "tags",
        dataIndex: "tags",
        width: 100,
        flexGrow: 1,
        render: tags => (
            <span>
                {tags.map(tag => {
                    let color = tag.length > 5 ? "geekblue" : "green"
                    if (tag === "loser") {
                        color = "volcano"
                    }
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    )
                })}
            </span>
        ),
    },
    {
        title: "Action",
        key: "action",
        width: 250,
        render: (text, record) => (
            <span>
                <a>Invite {record.name}</a>
                <Divider type="vertical" />
                <a>Delete</a>
            </span>
        ),
    },
]
const vtData = []
for (let i = 0; i < 300; i++) {
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

export default class ColResizeTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            scrollX: 1500,
            columns: [...vtSimpleColumns].map((col, index) => ({
                ...col,
                minWidth: col.width || 100,
                title: (
                    <ResizeableTitle
                        resizeAble={col.resizeAble}
                        width={col.width}
                        onResize={this.handerResize(index)}
                        className={col.width ? "resizable" : ""}>
                        {col.title}
                    </ResizeableTitle>
                ),
            })),
        }
    }
    handerResize = index => (e, { size }) => {
        this.setState(({ columns, scrollX }) => {
            const nextCols = [...columns]
            nextCols[index] = {
                ...nextCols[index],
                width:
                    size.width < nextCols[index].minWidth ? nextCols[index].minWidth : size.width,
            }
            const x = nextCols.map(m => m.width).reduce((a, b) => a + b, 0)
            return { columns: nextCols, scrollX: x > scrollX ? x : scrollX }
        })
    }
    render() {
        const { columns, scrollX } = this.state
        return (
            <VirtualTable
                className="column-resize-table"
                style={{ width: "1000px", margin: "10px 0" }}
                columns={vtSimpleColumns}
                dataSource={vtData}
                width={1000}
                height={500}
                scroll={{ y: 400, x: scrollX }}
                bordered
                allowResizeColumn
            />
        )
    }
}
