import React from 'react'
// import { DatePicker } from 'edf-component'
import { Input, Select, Form, Button, Icon, Popover } from 'antd'
const { Option } = Select;
const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 16 },
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 16, offset: 6 },
    },
};
class BatchAddSubject extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            optionList: [],
            form: {
                parentId: undefined, //父级科目id
            },
            loading: false,
            formItems: [],
            formItemsKey: {},
            errorList: [],
            typeName: '',
            typeId: '',
        }
        //供应商 3000160002  客户 3000160001
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
    }

    handleSubmit = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let selectedValues, { errorList, formItemsKey, formItems } = this.state;
        if (!formItems || (formItems && formItems.length < 1)) {
            this.metaAction.toast('warning', '没有可以增加的项目')
            return
        }
        this.setState({ loading: true });
        this.props.form.validateFieldsAndScroll((err, values) => {
            let noErr = false;
            if (!err && Object.keys(values).some(s => s !== 'parentId' && values[s] && values[s].length > 100)) {
                Object.keys(values).forEach(key => {
                    if (key !== 'parentId') {
                        if (values[key] && values[key].length > 100) {
                            const item = errorList.find(f => f.key == formItemsKey[key])
                            if (item)
                                item.errorMsg = '科目名称长度不能超过100个字符';
                        }
                    }
                })
            }
            if (err) {
                Object.keys(err).forEach(key => {
                    if (key !== 'parentId') {
                        const item = errorList.find(f => f.key == formItemsKey[key])
                        if (item) {
                            item.errorMsg = '科目名称不能为空！';
                        }
                    }
                })
            }

            if (errorList && errorList.every(f => !f.errorMsg)) {
                noErr = true
            }
            if (!err && noErr) {
                selectedValues = values;
            }
        });


        if (selectedValues) {
            let paramsArr = formItems.map(e => {
                return selectedValues[e]
            })
            const { closeModal, subjectItems, module } = this.props;
            let aidSubjectParams = {
                auxiliaryItemCategoryId: this.state.typeId,
                module: 'fund',
                auxiliaryItems: paramsArr
            };
            this.setState({ loading: true });
            //console.log('errorList', errorList, 'formItemsKey', formItemsKey, 'formItems', formItems)
            const res = await this.webapi.funds.saveAuxiliaryItems(aidSubjectParams);

            if (typeof res === 'object') {
                let subject = this.state.optionList.find(f => f.id == this.props.form.getFieldValue('parentId'));
                let hasError = false;
                res.forEach((e, i) => {
                    if (e.errMsg) {
                        errorList[i].errorMsg = e.errMsg
                        hasError = true
                    }
                })
                if (!hasError) {
                    let aidType = this.state.typeId === '3000160001' ? 'calcCustomer' : 'calcSupplier'
                    this.metaAction.toast('success', `成功新增了${aidSubjectParams.auxiliaryItems.length}个辅助项目`);

                    closeModal && closeModal({ subject: subject, aidSubject: this.backFillList(res, subjectItems), aidType });
                }
            }
        }
        this.setState({ loading: false, errorList });

    }



    componentDidMount() {
        // this.initKjkm();
        let formItems = this.deDuplicateItem(this.props.subjectItems || []),
            formItemsKey = {},
            errorList = [];
        formItems.forEach((item, index) => {
            formItemsKey[item] = index
            errorList.push({
                key: index,
                errorMsg: '',
            })
        })
        this.setState({ formItems, formItemsKey, errorList })
    }

    // 上级科目,进项默认空
    sjkmFocus = async () => {
        let res = await this.props.webapi.funds.getShopAccountList({ module: 'fund' });
        this.setState({
            optionList: res
        })
    }
    onCancal = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }
    deDuplicateItem(formItems) {
        return [...new Set(formItems)];
    }
    backFillList(list, formItems) {
        if (list.length == formItems.length) {
            return list;
        }
        const noDuplicateItem = this.state.formItems;
        const result = [];
        formItems.forEach((item) => {
            const index = noDuplicateItem.findIndex(f => f == item);
            result.push(list[index]);
        })
        return result;
    }
    del(item, index) {
        let { formItems, errorList, formItemsKey } = this.state;

        if (errorList && formItems) {
            formItems = formItems.filter(f => f !== item);

            errorList.map(er => {
                if (er.key === formItemsKey[item]) {
                    er.errorMsg = '';
                }
                return er
            })
            errorList.splice(index, 1);
            this.setState({ formItems, errorList })
        }
    }
    inputChange(item) {
        let { errorList, formItemsKey } = this.state;

        if (item && errorList) {
            errorList.map(er => {
                if (er.key === formItemsKey[item])
                    er.errorMsg = '';
                return er
            })
            this.setState({ errorList })
        }
    }
    onSubjectChange(e) {
        let { optionList } = this.state
        let dItem = optionList.find(f => f.id === e)

        if (dItem.isCalcCustomer) {
            this.props.form.setFieldsValue({ type: '客户' })
            this.setState({
                typeName: '客户',
                typeId: '3000160001'
            })
        }
        if (dItem.isCalcSupplier) {
            this.props.form.setFieldsValue({ type: '供应商' })
            this.setState({
                typeName: '供应商',
                typeId: '3000160002'
            })
        }


    }
    delError() {
        let { formItems, errorList, formItemsKey } = this.state;
        let arr = errorList.filter(e => e.errorMsg != '')
        let reDelIndexs = []
        if (arr && formItems) {
            arr.map(item => {
                let key = Object.keys(formItemsKey).find(f => formItemsKey[f] === item.key)
                let reDelIndex = Object.keys(formItemsKey).findIndex(f => formItemsKey[f] === item.key)
                formItems = formItems.filter(f => f !== key);
                reDelIndexs.push(reDelIndex)
                item.errorMsg = '';
                return item
            })

            this.setState({ formItems, errorList })
        }
    }
    render() {
        const { optionList, form, loading, errorList, formItems, formItemsKey, typeName } = this.state;
        // const formItems = this.deDuplicateItem(this.props.subjectItems || []); //科目列表);
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="bovms-app-purchase-list-set-same-subject has-bottom-padding">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="会计科目" {...formItemLayout}>
                        {getFieldDecorator('parentId', {
                            rules: [{ required: true, message: `上级科目不能为空！` }],
                            initialValue: form.parentId,
                        })(<Select
                            style={{ width: '100%' }}
                            dropdownMatchSelectWidth={true}
                            dropdownClassName="bovms-select-subject-dropdown no-add"
                            notFoundContent='无匹配结果'
                            showSearch
                            onFocus={this.sjkmFocus}
                            optionFilterProp="children"
                            onChange={this.onSubjectChange.bind(this)}
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {
                                optionList.map(item => (
                                    <Option value={item.id} key={item.id} item={item}>{item.codeAndName}</Option>
                                ))
                            }
                        </Select>
                        )
                        }
                        <Popover className='bovms-bactch-aid-setting-tooltip' content={<div>
                            可选择带有【客户】或【供应商】的往来科目
                                </div>}><Icon type="question" className="bovms-help-icon" /></Popover>
                    </Form.Item>
                    <Form.Item label="辅助项目类别：" {...formItemLayout}>
                        {getFieldDecorator('type', {
                            rules: [{ required: true, message: `辅助项目类别不能为空` }],
                            initialValue: typeName,
                        })(<Input readOnly disabled></Input>)
                        }
                        <Popover className='bovms-bactch-aid-setting-tooltip' content={<div>
                            所选择会计科目带有的辅助核算类别
                        </div>}><Icon type="question" className="bovms-help-icon" /></Popover>
                    </Form.Item>
                    <h4 className="h2">即将新增的辅助项目：<span style={{ color: '#999' }}>(共{`${formItems.length}`}条记录)</span><i></i></h4>
                    {
                        formItems.map((item, index) => {

                            let errorItem = errorList && errorList.find(f => f.key === (formItemsKey || {})[item]);
                            return (
                                <Form.Item key={item} label=''
                                    {...formItemLayoutWithOutLabel}
                                    validateStatus={errorItem && errorItem.errorMsg ? 'error' : undefined}
                                    help={(errorItem || {}).errorMsg || undefined}
                                >
                                    {getFieldDecorator(item, {
                                        rules: [{ required: true, message: `科目名称不能为空！` }],
                                        initialValue: form[item] || item,
                                    })(<Input maxLength={100} onChange={e => this.inputChange(item)} />)}
                                    <Icon type="close-circle" className="del-icon" onClick={e => this.del(item, index)} />
                                </Form.Item>
                            )
                        })
                    }
                </Form>
                <div className="footer">
                    <div style={{ fontSize: '12px' }}>
                        <span><span style={{ color: '#ff852d' }}>温馨提示：</span> 输入项目名称，新增辅助核算项目</span>
                    </div>
                    <div>
                        {errorList && errorList.some(f => f.errorMsg) && <Button className="btn" type="primary" onClick={this.delError.bind(this)}>删除错误记录</Button>}
                        <Button className="btn" type="primary" loading={loading} onClick={this.handleSubmit}>保存</Button>
                        <Button onClick={this.onCancal}>取消</Button>
                    </div>
                </div>
            </div >
        )
    }
}

export default Form.create({ name: 'bovms_app_batch_add_subject' })(BatchAddSubject);