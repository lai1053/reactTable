import React, { PureComponent } from "react"
import { DataGrid } from "edf-component"
import { Divider, Tag, Tooltip } from "antd"
import renderDataGridCol from "../../../bovms/components/column/index"

const vtSimpleColumns = [
    {
        title: "name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left",
        resizeAble: true,
        render: text => <a>{text}</a>,
    },
    {
        title: "name1",
        dataIndex: "name1",
        key: "name1",
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
        title: "Action1",
        key: "action1",
        width: 100,
        // fixed: "right",
        render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
        title: "Action",
        key: "action",
        width: 250,
        // fixed: "right",
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

export default function ColResizeDataGrid(props) {
    const colOption = {
        dataSource: vtData,
        width: 100,
        fixed: false,
        align: "center",
        className: "",
        flexGrow: 0,
        lineHeight: 37,
        isResizable: true,
    }
    const columns = vtSimpleColumns.map(m => renderDataGridCol({ ...colOption, ...m }))
    return (
        <React.Fragment>
            <DataGrid
                className="column-resize-table"
                columns={columns}
                headerHeight={37}
                rowHeight={37}
                footerHeight={0}
                rowsCount={vtData.length}
                width={1000}
                height={500}
                allowResizeColumn
            />
            <br />
        </React.Fragment>
    )
}
