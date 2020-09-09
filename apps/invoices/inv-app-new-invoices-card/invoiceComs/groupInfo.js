import React, { PureComponent } from "react"
import { Input, Icon, Tooltip } from "edf-component"
import { Form } from "antd"

class GroupInfo extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            extended: false,
        }
    }

    //根据数据渲染dom
    getDom() {
        const { data, extendable, readOnly, placement } = this.props
        const { getFieldDecorator } = this.props.form
        const { extended } = this.state
        const dom = data.map((e, i) => (
            <div
                className={
                    i === 0 ? "no-border-right invoice-group-info-item" : "invoice-group-info-item"
                }>
                <div className="invoice-group-info-item-label">
                    <span>{e.title}</span>
                </div>
                <div className="invoice-group-info-item-sub">
                    {e.subItem.map((subEle, subI) => {
                        let html = (
                            <div
                                className={
                                    !extendable
                                        ? "invoice-group-info-item-sub-item"
                                        : !extended && subI > 1
                                        ? "invoice-group-info-item-sub-item hidden"
                                        : "invoice-group-info-item-sub-item"
                                }
                                style={subEle.adjustHeight ? { flex: 1 } : {}}>
                                <div className="invoice-group-info-item-sub-item-label">
                                    {subEle.required && <span className="required">*</span>}&nbsp;
                                    {subEle.label}
                                </div>
                                <div className="invoice-group-info-item-sub-item-control">
                                    {readOnly ? (
                                        <div className="invoice-info-static-cell">
                                            {subEle.value}
                                        </div>
                                    ) : (
                                        <Tooltip
                                            overlayClassName="-sales-error-toolTip"
                                            title={subEle.errMsg || ""}
                                            getPopupContainer={trigger => trigger.parentNode}
                                            visible={
                                                subEle.errMsg &&
                                                subEle.errMsg.indexOf("不可为空") == -1
                                                    ? true
                                                    : false
                                            }
                                            placement={subEle.placement || "topLeft"}>
                                            <Form.Item
                                                key={subEle.key}
                                                validateStatus={subEle.errMsg ? "error" : null}>
                                                {getFieldDecorator(`${subEle.key}`, {
                                                    initialValue: subEle.value,
                                                })(<Input {...subEle} />)}
                                            </Form.Item>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        )
                        return html
                    })}
                </div>
            </div>
        ))
        return dom
    }
    extendToggle() {
        const { extended } = this.state
        this.setState({
            extended: !extended,
        })
    }

    validateFields() {}
    render() {
        const { data, extendable, className } = this.props
        const { extended } = this.state
        return (
            <Form autocomplete="off">
                <div className={`invoice-group-info ${className}`}>
                    {extendable && (
                        <a
                            href="javascript:;"
                            className="invoice-group-info-extend"
                            title="显示更多信息"
                            onClick={this.extendToggle.bind(this)}>
                            {extended ? "收起" : "展开"}
                            <Icon type="down"></Icon>
                        </a>
                    )}
                    {this.getDom()}
                </div>
            </Form>
        )
    }
}

export default Form.create({ name: "invoice-group-info" })(GroupInfo)
