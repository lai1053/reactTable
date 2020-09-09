import React from "react"
import VirtualTable from "../../components/VirtualTable/index"
import { Divider, Tag } from "antd"
const vtSimpleColumns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 100,
        fixed: "left",
        render: text => <a>{text}</a>,
    },
    {
        title: "Age",
        dataIndex: "age",
        key: "age",
        width: 100,
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        width: 200,
    },
    {
        title: "Tags",
        key: "tags",
        dataIndex: "tags",
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
export default function FixedRightTable() {
    const vtFixedRightColumns = vtSimpleColumns.map(m => ({ ...m }))
    const lastItem = vtFixedRightColumns[vtFixedRightColumns.length - 1]
    lastItem.fixed = "right"
    return (
        <React.Fragment>
            <div style={{ color: "#666" }}>注意：固定列，IE 11 会降级成横向滚动</div>
            <VirtualTable
                style={{ width: "1000px", margin: "10px 0" }}
                columns={vtFixedRightColumns}
                dataSource={vtData}
                width={1000}
                height={500}
                scroll={{ y: 400, x: 1500 }}
                bordered
                allowResizeColumn
            />
        </React.Fragment>
    )
}
