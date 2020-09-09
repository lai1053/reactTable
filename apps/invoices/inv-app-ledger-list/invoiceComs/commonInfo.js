import React, { PureComponent } from "react"
import { Form, Select, Input, Checkbox, Tooltip } from 'antd'
const Option = Select.Option;


class CommonInfo extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    //根据数据渲染dom
    getDom() {
        const { data, readOnly } = this.props
        const { getFieldDecorator } = this.props.form
        //组合dom
        const dom = data.map((e, i) => (
            <div className='invoice-common-info-row'>
                {e.map((se, si) => {
                    let html = []
                    //没传宽度自动填充
                    html.push(<div className='invoice-common-info-row-label' style={se.labelWidth ? { width: se.labelWidth } : { flex: 1 }}>
                        {se.required && <span className='required'>*</span>}&nbsp;{se.label}
                    </div>)

                    let control
                    //表单属性
                    let formItemOptions = {
                        rules: [{ required: se.required }],
                        initialValue: se.value,
                    }

                    switch (se.type) {
                        case 'select':
                            control = readOnly ? <div className='invoice-info-static-cell'>{se.value}</div> :
                                <Form.Item key={se.key}>
                                    {getFieldDecorator(`${se.key}`, formItemOptions)(<Select {...se}>
                                        {se.option.map(oe => (<Option key={oe.value} value={oe.value} title={oe.name}>{oe.name}</Option>))}
                                    </Select>)}
                                </Form.Item>
                            break
                        case 'input':
                            //是否传了校验
                            if (se.normalize) {
                                formItemOptions.normalize = se.normalize
                            }
                            delete formItemOptions.rules
                            control = readOnly ? <div className='invoice-info-static-cell'>{se.value}</div> :
                                <Tooltip
                                    overlayClassName='-sales-error-toolTip'
                                    title={se.errMsg || ''}
                                    visible={se.errMsg && se.errMsg.indexOf('不可为空') == -1 ? true : false}
                                    placement={se.placement || 'topLeft'}
                                >
                                    <Form.Item key={se.key} validateStatus={se.errMsg? 'error' : null}>
                                        {getFieldDecorator(`${se.key}`, formItemOptions)(<Input {...se}></Input>)}
                                    </Form.Item>
                                </Tooltip>
                            break
                        case 'checkbox':
                            formItemOptions.valuePropName = 'checked'
                            control = <Form.Item key={se.key}>
                                {getFieldDecorator(`${se.key}`, formItemOptions)(<Checkbox style={{ marginLeft: '8px' }} {...se} disabled={readOnly}>{se.checkBoxLabel}</Checkbox>)}
                            </Form.Item>
                            break
                    }
                    html.push(<div className='invoice-common-info-row-control' style={se.controlWidth ? { width: se.controlWidth } : { flex: 1 }}>
                        {control}
                    </div>)
                    return html
                })}
            </div>
        ))


        return dom

    }
    render() {
        const { className } = this.props;
        return (
            <Form autocomplete="off">
                <div className={`invoice-common-info ${className}`}>
                    {this.getDom()}
                </div>
            </Form>
        )
    }
}


export default Form.create({ name: 'invoice-common-info' })(CommonInfo);