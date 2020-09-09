import React from "react"
import VirtualTable from "../../components/VirtualTable/index"

const columns = [
    { title: "Name", width: 200, dataIndex: "name", key: "name" },
    { title: "Age", width: 100, dataIndex: "age", key: "age" },
    { title: "Address", flexGrow: 1, dataIndex: "address", key: "address" },
    {
        title: "Action",
        dataIndex: "",
        key: "x",
        width: 100,
        render: () => <a>Delete</a>,
    },
]

const data = []
for (let i = 0; i < 300; i++) {
    data.push({
        key: String(i + 1),
        name: i % 5 === 0 ? "Not Expandable" : "Joe Black " + i,
        age: i + 1,
        address: "Sidney No. 1 Lake Park",
        description: "My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.",
    })
}
export default function ExpandableTable() {
    return (
        <VirtualTable
            style={{ width: "1000px", margin: "10px 0", minHeight: "400px" }}
            columns={[...columns]}
            dataSource={data}
            width={1000}
            height={500}
            scroll={{ y: 400, x: 1500 }}
            expandable={{
                expandedRowRender: record => (
                    <p style={{ margin: 0, padding: "0 10px" }}>{record.description}</p>
                ),
                rowExpandable: record => record.name !== "Not Expandable",
                rowExpandedHeight: rowIndex => 37,
            }}
            bordered
            allowResizeColumn
        />
    )
}
