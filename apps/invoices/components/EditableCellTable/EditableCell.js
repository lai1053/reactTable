import React, { cloneElement, createContext } from "react"
import { Button, Form, Icon } from "antd"
import moment from "moment"

const EditableContext = createContext()
// let rowCellEditing = false

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={{ form, index }}>
        <div {...props} />
    </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            editing: false,
        }
        this.inputRef = React.createRef()
    }

    toggleEdit = () => {
        const editing = !this.state.editing
        this.setState({ editing }, () => {
            this.props.setEditing(editing)
            if (editing) {
                // this.inputRef.current.focus()
                try {
                    const dom = this.inputRef.current
                    if (dom.rcSelect !== undefined || dom.savePicker !== undefined) {
                        dom._reactInternalFiber.firstEffect.stateNode.click &&
                            dom._reactInternalFiber.firstEffect.stateNode.click()
                    } else dom.focus()
                } catch (ex) {}
            }
        })
    }

    save = e => {
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return
            }
            // console.log("save:", this.props.dataIndex, values, e.type, e)
            this.toggleEdit()
        })
    }
    handleOpenChange = s => {
        const { dateFormat } = this.props
        if (dateFormat && s === false) {
            this.toggleEdit()
        }
    }
    renderCell = ({ form, index }) => {
        this.form = form
        const { children, dataIndex, record, title, editEdCell, required, dateFormat } = this.props
        const { editing } = this.state
        const text = record[dataIndex]
        const reactDom = editEdCell(text, record, index)
        if (!reactDom) {
            return <React.Fragment>{children}</React.Fragment>
        }
        if (editing) {
            const initialValue = dateFormat && text ? moment(text, dateFormat) : text
            return (
                <Form.Item style={{ margin: 0 }} className="edited-cell">
                    {form.getFieldDecorator(dataIndex, {
                        rules: [{ required }],
                        initialValue,
                    })(
                        cloneElement(reactDom, {
                            ref: this.inputRef,
                            onPressEnter: this.save,
                            onBlur: this.save,
                            onOpenChange: this.handleOpenChange,
                        })
                    )}
                </Form.Item>
            )
        } else {
            const isError = reactDom.props.isError
            return (
                <div
                    className={`editable-cell-value-wrap ${isError ? "has-error" : ""}`}
                    // tabindex="1"
                    onClick={this.toggleEdit}>
                    {children}
                </div>
            )
        }
    }

    render() {
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            children,
            editEdCell,
            ...restProps
        } = this.props
        return (
            <div {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
                ) : (
                    children
                )}
            </div>
        )
    }
}
export default {
    EditableFormRow,
    EditableCell,
}
