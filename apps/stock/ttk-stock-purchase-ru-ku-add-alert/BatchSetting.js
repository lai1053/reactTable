import React, { useEffect, useState } from "react"
import { Select, Form } from "antd"
import SuperSelect from "../../invoices/component/SuperSelect"
const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 17 },
    },
}

function BatchSetting({ form, ...props }) {
    const { webapi, metaAction, store, options, sonListByPidList } = props
    const [state, setState] = useState({ subjectList: options, value: undefined })
    const onOk = async () => {
        let err = false
        let value = null
        let ret = {}
        form.validateFields((error, values) => {
            if (error) {
                err = true
            }
            value = values.subject
        })
        if (err) {
            return false
        }
        // 如果当前选择项是新增科目，保存后，需要调用页面从新获取可选科目列表
        if (value === state.value) {
            ret = {
                value,
                id: state.newAddSubject.id,
                codeAndName: state.newAddSubject.codeAndName,
            }
        } else {
            ret = {
                value,
                codeAndName: state.subjectList.find(f => String(f.id) == String(value)).codeAndName,
            }
        }
        return ret
    }
    const addSubject = async () => {
        const ret = await metaAction.modal("show", {
            title: "新增科目",
            width: 450,
            okText: "保存",
            bodyStyle: { padding: "20px 30px", fontSize: 12 },
            children: metaAction.loadApp("app-proof-of-charge-subjects-add", {
                store: store,
                columnCode: "subjects",
                active: "certificate",
                initData: {
                    sonListByPidList,
                },
            }),
        })
        if (ret && ret.id) {
            options.push(ret)
            setState({
                subjectList: options,
                value: ret.id,
                newAddSubject: ret,
            })
        }
    }

    useEffect(() => {
        props.setOkListener(onOk)
    }, [state])

    return (
        <Form layout="horizontal">
            <Form.Item label="贷方科目" {...formItemLayout}>
                {form.getFieldDecorator("subject", {
                    rules: [{ required: true, message: "贷方科目不能为空" }],
                    initialValue: state.value,
                })(
                    <SuperSelect
                        placeholder="请选择科目"
                        showSearch
                        isNeedAdd
                        optionFilterProp="children"
                        footerClick={addSubject}
                        style={{ width: "100%" }}>
                        {state.subjectList
                            ? state.subjectList.map(item => (
                                  <Select.Option value={item.id}>{item.codeAndName}</Select.Option>
                              ))
                            : null}
                    </SuperSelect>
                )}
            </Form.Item>
        </Form>
    )
}
export default Form.create()(BatchSetting)