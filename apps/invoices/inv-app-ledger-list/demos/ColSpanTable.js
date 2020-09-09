import React from "react"
import VirtualTable from "../../components/VirtualTable/index"
// import { Divider, Tag } from "antd"
const renderContent = (value, row, index) => {
    const obj = {
        children: value,
        props: {
            colSpan: 1,
        },
    }
    if (index % 4 === 0) {
        obj.props.colSpan = 0
    }
    return obj
}
const colSpanColumns = [
    {
        title: "Name",
        dataIndex: "name",
        width: 300,
        render: (text, row, index) => ({
            children: <a>{text}</a>,
            props: {
                colSpan: index % 4 === 0 ? 5 : 1,
            },
        }),
    },
    {
        title: "Age",
        dataIndex: "age",
        width: 300,
        render: renderContent,
    },
    {
        title: "Home phone",
        flexGrow: 1,
        dataIndex: "number",
        render: renderContent,
    },
    {
        title: "Phone",
        flexGrow: 1,
        dataIndex: "street",
        render: renderContent,
    },
    {
        title: "Address",
        width: 300,
        dataIndex: "address",
        render: renderContent,
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
export default function ColSpanTable() {
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0", minHeight: "400px" }}
            columns={colSpanColumns}
            dataSource={vtData.slice(0, 100)}
            rowKey="key"
            width={1000}
            height={600}
            scroll={{ y: 400, x: 1500 }}
            bordered
            allowResizeColumn
        />
    )
}
