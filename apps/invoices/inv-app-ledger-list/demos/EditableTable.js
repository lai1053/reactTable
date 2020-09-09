import React from "react"
import VirtualTable from "../../components/VirtualTable/index"
import { Input, InputNumber, Popconfirm, Form, Divider } from "antd"

const data = []
for (let i = 0; i < 100; i++) {
    data.push({
        key: i.toString(),
        name: `Edrward ${i}`,
        age: 32,
        address: `London Park no. ${i}`,
    })
}
const EditableContext = React.createContext()

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === "number") {
            return <InputNumber />
        }
        return <Input />
    }

    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props
        return (
            <div {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                    children
                )}
            </div>
        )
    }

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = { data, editingKey: "" }
        this.columns = [
            {
                title: "name",
                dataIndex: "name",
                width: 250,
                editable: true,
            },
            {
                title: "age",
                dataIndex: "age",
                width: 150,
                editable: true,
            },
            {
                title: "gender",
                dataIndex: "gender",
                width: 150,
                editable: true,
            },
            {
                title: "address",
                dataIndex: "address",
                flexGrow: 1,
                // width: 360,
                editable: true,
            },

            {
                title: "operation",
                dataIndex: "operation",
                width: 100,
                render: (text, record) => {
                    const { editingKey } = this.state
                    const editable = this.isEditing(record)
                    return editable ? (
                        <span>
                            <EditableContext.Consumer>
                                {form => (
                                    <a
                                        onClick={() => this.save(form, record.key)}
                                        style={{ marginRight: 8 }}>
                                        Save
                                    </a>
                                )}
                            </EditableContext.Consumer>
                            <Popconfirm
                                title="Sure to cancel?"
                                onConfirm={() => this.cancel(record.key)}>
                                <a>Cancel</a>
                            </Popconfirm>
                        </span>
                    ) : (
                        <a disabled={editingKey !== ""} onClick={() => this.edit(record.key)}>
                            Edit
                        </a>
                    )
                },
            },
        ]
    }

    isEditing = record => record.key === this.state.editingKey

    cancel = () => {
        this.setState({ editingKey: "" })
    }

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return
            }
            const newData = [...this.state.data]
            const index = newData.findIndex(item => key === item.key)
            if (index > -1) {
                const item = newData[index]
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                })
                this.setState({ data: newData, editingKey: "" })
            } else {
                newData.push(row)
                this.setState({ data: newData, editingKey: "" })
            }
        })
    }

    edit(key) {
        this.setState({ editingKey: key })
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        }

        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === "age" ? "number" : "text",
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            }
        })

        return (
            <EditableContext.Provider value={this.props.form}>
                <VirtualTable
                    components={components}
                    bordered
                    dataSource={this.state.data}
                    columns={columns}
                    rowClass={i => "editable-row"}
                    rowKey="key"
                    width={1000}
                    height={500}
                    scroll={{ x: 1010, y: 400 }}
                    pagination={{
                        onChange: this.cancel,
                    }}
                    allowResizeColumn
                />
            </EditableContext.Provider>
        )
    }
}

const EditableFormTable = Form.create()(EditableTable)

export default EditableFormTable
