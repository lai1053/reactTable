import React from "react";
// import { DatePicker } from 'edf-component'
import { Map, fromJS } from "immutable";
import { Input, Select, Form, Checkbox, Row, Col } from "antd";
import SelectStock from "./selectStock";
import SelectSubject from "./selectSubject/index";

const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 16 }
    }
};

class BatchSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                isStock:
                    props.isStockMonth !== undefined &&
                    String(props.isStockMonth),
                stock: {},
                kjkm: {}
            },
            isStockCheckboxValue: true,
            subjectCheckboxValue: true,
            stockCheckboxValue: true
        };
        if (props.setOkListener) {
            props.setOkListener(:: this.handleSubmit);
        }
        this.module = props.module;
        this.webapi = props.webapi || {};
    }
    isObject(value) {
        return Object.prototype.toString.call(value) === "[object Object]";
    }
    handleSubmit(e) {
        const { isStockCheckboxValue, subjectCheckboxValue, stockCheckboxValue, form } = this.state
        const { module } = this.props
        e && e.preventDefault && e.preventDefault();
        let isErr = true;
        if (!isStockCheckboxValue && !subjectCheckboxValue) {
            this.props.metaAction.toast('error', '请设置至少一个项目')
            return false
        }
        this.props.form.validateFieldsAndScroll((err, values) => {
            isErr = err;
        });

        form.stockCheckboxValue = stockCheckboxValue
        form.subjectCheckboxValue = subjectCheckboxValue
        return !isErr && form;
    }
    componentDidMount() { }
    onSubjectChange(value) {
        let kjkm = {};
        if (this.isObject(value)) {
            kjkm = {
                id: value.id,
                code: value.code,
                name: value.gradeName || value.name,
                assistJSON: value.assistList
                    ? JSON.stringify({ assistList: value.assistList })
                    : undefined,
                codeAndName:
                    value.codeAndName || `${value.code} ${value.gradeName}`
            };
        }
        this.setState({
            form: {
                ...this.state.form,
                kjkm
            }
        });
    }
    onStockChange(value) {
        this.setState({
            form: {
                // ...this.state.form,
                kjkm: undefined,
                stock: undefined,
                isStock: value
            },
            stockCheckboxValue: true
        });
    }
    onSelectStockChange(ret) {
        const isObject = this.isObject(ret);
        const json =
            isObject && ret.assistList
                ? JSON.stringify({ assistList: ret.assistList })
                : "",
            stock = {},
            kjkm = this.state.form.kjkm || {};
        stock.id = isObject && ret.id;
        stock.name = isObject && ret.name;
        stock.code = isObject && ret.code;
        stock.specification = isObject && ret.specification;
        stock.propertyName = isObject && ret.propertyName;
        // 在进项，科目绑值
        if (this.module === "cg") {
            kjkm.id = isObject && ret.inventoryRelatedAccountId;
            kjkm.code = isObject && ret.inventoryRelatedAccountCode;
            kjkm.name = isObject && ret.inventoryRelatedAccountName;
            kjkm.assistJSON = isObject ? json : undefined;
            kjkm.codeAndName = isObject && `${kjkm.code} ${kjkm.name}`;
        }
        this.setState(
            {
                form: {
                    ...this.state.form,
                    stock,
                    kjkm
                }
            },
            () => {
                this.props.form.setFieldsValue({ kjkm: kjkm.id });
            }
        );
    }
    isStockCheckboxValueChange(e) {
        let checked = e.target.checked
        let obj = {
            isStockCheckboxValue: checked,
            form: {
                ...this.state.form,
                stock: undefined,
            }
        }
        if (checked) {
            obj.form = {
                ...this.state.form,
                stock: undefined,
                isStock: "1",
            }
            this.props.form.setFieldsValue({ isStock: '1' })
            this.setState(obj)
        } else {
            obj.form = {
                ...this.state.form,
                stock: undefined,
                isStock: undefined,
            }
            this.props.form.setFieldsValue({ isStock: undefined })
            this.setState(obj)
        }
    }
    stockCheckboxValueChange(e) {
        if (this.props.module === 'cg') {
            let checked = e.target.checked
            let obj = {
                stockCheckboxValue: checked,
                form: {
                    ...this.state.form,
                    stock: undefined,
                    kjkm: undefined
                }
            }
            this.props.form.resetFields()
            this.setState(obj)
        }
    }
    subjectCheckboxValueChange(e) {
        this.setState({
            subjectCheckboxValue: e.target.checked,
            form: {
                ...this.state.form,
                kjkm: undefined,
            }
        })
        this.props.form.setFieldsValue({ kjkm: undefined })
    }
    render() {
        const { form, isStockCheckboxValue, subjectCheckboxValue, stockCheckboxValue } = this.state;
        const { getFieldDecorator } = this.props.form;
        const {
            module,
            subjectType,
            isStockMonth,
            metaAction,
            store,
            webapi,
            goodsName,
            specification
        } = this.props;
        const assistJSON = this.isObject(form.kjkm) && form.kjkm.assistJSON,
            defaultItem = {
                id: this.isObject(form.kjkm) && form.kjkm.id,
                code: this.isObject(form.kjkm) && form.kjkm.code,
                name: this.isObject(form.kjkm) && form.kjkm.name,
                codeAndName: this.isObject(form.kjkm) && form.kjkm.codeAndName
            };
        return (
            <div className="bovms-app-purchase-list-set-same-subject">
                <Form>
                    {isStockMonth == 1 ? (
                        <div className={'bovms-app-purchase-list-set-same-subject-section hide-start'} style={{ display: 'flex', alignItems: 'center' }}>
                            {module === 'xs' && <Checkbox style={{ marginTop: '-18px' }} checked={isStockCheckboxValue} onChange={this.isStockCheckboxValueChange.bind(this)} />}
                            <Form.Item label="是否存货" {...formItemLayout} style={{ width: '100%', paddingLeft: module === 'cg' ? '18px' : '0' }}>
                                {getFieldDecorator("isStock", {
                                    rules: [
                                        {
                                            required: module === 'cg' ? true : isStockCheckboxValue,
                                            message: `是否存货不能为空！`
                                        }
                                    ],
                                    initialValue: form.isStock
                                })(
                                    <Select
                                        key="isStock"
                                        disabled={!isStockCheckboxValue}
                                        onChange={::this.onStockChange}
>
                                        <Select.Option key="1" value="1">
                                    是
                                        </Select.Option>
                                <Select.Option key="0" value="0">
                                    否
                                        </Select.Option>
                                    </Select>
                            )}
                            </Form.Item>
                        </div>

                ) : null}
                {form.isStock == 1 ? (
                    <div className='bovms-app-purchase-list-set-same-subject-section hide-start' style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox checked={stockCheckboxValue} onChange={this.stockCheckboxValueChange.bind(this)} style={{ marginTop: '-18px', opacity: module === 'xs' ? '0' : '1' }} />
                        <Form.Item label="存货档案" {...formItemLayout} style={{ width: '100%' }}>
                            {getFieldDecorator("stock", {
                                rules: [
                                    {
                                        required: module === 'cg' ? stockCheckboxValue : true,
                                        message: `存货档案不能为空！`
                                    }
                                ],
                                initialValue: (this.isObject(form.stock) && form.stock.id) || undefined
                            })(
                                <SelectStock
                                    key="stock"
                                    // value={(this.isObject(form.stock) && form.stock.id) || undefined}
                                    module={module}
                                    metaAction={metaAction}
                                    store={store}
                                    webapi={webapi}
                                    disabled={!stockCheckboxValue}
                                    rowData={{
                                        goodsName,
                                        specification
                                    }}
                                    isStock={form.isStock}
                                    onChange={::this.onSelectStockChange}
                                    getPopupContainer={trigger => trigger.parentNode}
                            />
                        )}
                        </Form.Item>
                    </div>
                ) : null}

                <div className={'bovms-app-purchase-list-set-same-subject-section hide-start'} style={{ display: 'flex', alignItems: 'center' }}>
                    {((isStockMonth == 1 && module === 'xs') || (module === 'cg' && form.isStock === '0')) && <Checkbox style={{ marginTop: '-18px' }} checked={subjectCheckboxValue} onChange={this.subjectCheckboxValueChange.bind(this)} />}
                    <Form.Item
                        label={subjectType === "jfkm" ? "借方科目" : "贷方科目"}
                        {...formItemLayout}
                        style={{ width: '100%', paddingLeft: module === 'cg' && form.isStock === '1' ? '18px' : '0' }}
                    >
                        {getFieldDecorator("kjkm", {
                            rules: [
                                {
                                    required: module === 'cg' ? form.isStock === '1' ? stockCheckboxValue : subjectCheckboxValue : subjectCheckboxValue,
                                    message: `${
                                        subjectType === "jfkm"
                                            ? "借方科目"
                                            : "贷方科目"
                                        }不能为空！`
                                }
                            ],
                            initialValue:
                                (this.isObject(form.kjkm) && form.kjkm.id) ||
                                undefined
                        })(
                            <SelectSubject
                                key="kjkm"
                                // value={this.isObject(form.kjkm) && form.kjkm.id || undefined }
                                selectType={subjectType}
                                module={module}
                                metaAction={metaAction}
                                store={store}
                                webapi={webapi}
                                assistJSON={assistJSON}
                                isStockMonth={isStockMonth}
                                isStock={form.isStock}
                                onChange={::this.onSubjectChange}
                                defaultItem={defaultItem}
                                subjectName={goodsName}
                                disabled={
                            module == "cg"
                                ? form.isStock == 1
                                    ? true
                                    : !subjectCheckboxValue
                                : subjectCheckboxValue
                                    ? false
                                    : true
                            // module == "cg" && form.isStock == 1
                            //     ? true
                            //     : false
                        }
                                getPopupContainer={trigger =>
                            trigger.parentNode
                        }
                        />
                    )}
                    </Form.Item>
                </div>
                </Form>
              { isStockMonth == 1 && module === 'xs' && <p><span style={{ color: '#ff852d' }}>温馨提示：</span>未选中的项目将会不被设置</p> } 
            </div >
        );
    }
}

export default Form.create({ name: "bovms_app_batch_settting" })(BatchSetting);
