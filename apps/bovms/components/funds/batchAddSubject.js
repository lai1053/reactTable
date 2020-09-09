import React from 'react'
// import { DatePicker } from 'edf-component'
import { Input, Select, Form, Button,  Icon, Popover } from 'antd'
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
        }
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
    }

    handleSubmit = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let selectedValues, { errorList, formItemsKey, formItems } = this.state;
        if (!formItems || (formItems && formItems.length < 1)) {
            this.metaAction.toast('warning', '没有可以新增的会计科目')
            return
        }
        this.setState({ loading: true });
        this.props.form.validateFieldsAndScroll((err, values) => {
            let noErr = false;
            if (!err && Object.keys(values).some(s => s !== 'parentId' && values[s] && values[s].length > 100)) {
                Object.keys(values).forEach(key => {
                    if (key !== 'parentId') {
                        if (values[key] && values[key].length > 100) {
                            const item = errorList.find(f => f.key == key.replace('name', ''))
                            if (item)
                                item.errorMsg = '科目名称长度不能超过100个字符';
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
            const { closeModal, subjectItems } = this.props;
            let glXdzAccountDtoList = [];
            Object.keys(selectedValues).forEach(key => {
                if (key !== 'parentId') {
                    glXdzAccountDtoList.push({
                        parentId: selectedValues.parentId,
                        name: selectedValues[key],
                        key: key.replace('name', ''),
                    })
                }
            })
            // isReturnValue: true
            let res = await this.webapi.funds.batchAddAccountCode({ glXdzAccountDtoList, isReturnValue: true });
            // console.log('selectedValues:', res)
            if (res && (res.successList || res.failedList || res.message)) {
                if (res.successList) {
                    this.metaAction.toast('success', `成功新增了${res.successList.length}个科目`);
                    closeModal && closeModal(this.backFillList(res.successList, subjectItems));
                    return res.successList;
                } else if (res.failedList && res.failedList[0]) {
                    this.metaAction.toast('error', res.failedList[0])
                } else if (res.message) {
                    this.metaAction.toast('error', res.message)
                }
            }
            if (res && !res.result && res.error && res.error.message) {
                let _errorList = res.error.message.indexOf('{') > -1 ? JSON.parse(res.error.message) : []
                _errorList.forEach(item => {
                    let er = errorList.find(f => f.key == item.key)
                    // if (er) er.errorMsg = item.errorMsg;
                    if (er) er.errorMsg = '有重名的记录，请检查';
                })
                this.metaAction.toast('error', res.error.message.indexOf('{') > -1 ? '批增会计科目失败' : res.error.message)
            }
            // return { ...kjkmItem, assistList: result };
        } else {
            this.metaAction.toast('error', '批增会计科目失败')
        }
        // console.log('handleSubmit:', errorList, errorForFormItems)
        this.setState({ loading: false, errorList });

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
        const { webapi, metaAction } = this.props;
        // console.log('webapi:', webapi, this.props)
        if (webapi) {
            const res = await webapi.funds.getFundListParentCodeId({
                module: "fund",
            });
            if (res) {
                this.setState({ optionList: res })
            }

        }
    }
    onCancal = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }
    deDuplicateItem(formItems) {
        return [...new Set(formItems)];
    }
    del(item) {
        let { formItems, errorList, formItemsKey } = this.state;
        if (errorList && formItems) {
            formItems = formItems.filter(f => f !== item);
            errorList.map(er => {
                if (er.key === formItemsKey[item])
                    er.errorMsg = '';
                return er
            })
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
    delError() {
        let { formItems, errorList, formItemsKey } = this.state;
        if (errorList && errorList.some(e => e.errorMsg) && formItems) {
            errorList.map(item => {
                if (item.errorMsg) {
                    let key = Object.keys(formItemsKey).find(f => formItemsKey[f] === item.key)
                    formItems = formItems.filter(f => f !== key);
                    item.errorMsg = '';
                }
                return item
            })
            this.setState({ formItems, errorList })
        }
    }
    parentIdChange(value) {
        let { errorList, form } = this.state;
        if (form.parentId !== value) {
            errorList.map(item => {
                item.errorMsg = '';
                return item
            })
            this.setState({ errorList });
        }
    }
    render() {
        const { optionList, form, loading, errorList, formItems, formItemsKey } = this.state;
        // const formItems = this.deDuplicateItem(this.props.subjectItems || []); //科目列表);
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="bovms-app-purchase-list-set-same-subject has-bottom-padding">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="上级科目" {...formItemLayout}>
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
                            onChange={::this.parentIdChange}
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
                <Popover className='bovms-bactch-aid-setting-tooltip' content={
                            <div>可选择不带辅助核算的往来科目。</div>
                            }>
                            <Icon type="question" className="bovms-help-icon" />
                        </Popover>
                    </Form.Item>
                <h4 className="h2">即将新增的科目：<i></i></h4>
                {
                    formItems.map((item) => {

                        let errorItem = errorList && errorList.find(f => f.key === (formItemsKey || {})[item]);
                        return (
                            <Form.Item key={formItemsKey[item]} label=''
                                {...formItemLayoutWithOutLabel}
                                validateStatus={errorItem && errorItem.errorMsg ? 'error' : undefined}
                                help={(errorItem || {}).errorMsg || undefined}
                            >
                                {getFieldDecorator(`name${formItemsKey[item]}`, {
                                    rules: [{ required: true, message: `科目名称不能为空！` }],
                                    initialValue: form[item] || item,
                                })(<Input maxLength={100} onChange={e => this.inputChange(item)} />)}
                                <Icon type="close-circle" className="del-icon" onClick={e => this.del(item)} />
                            </Form.Item>
                        )
                    })
                }
                </Form>
            <div className="footer">
                <div>共{` ${formItems.length} `}条记录
                        <span style={{ marginLeft: '8px', color: '#ff9300', fontSize: '9px' }}>温馨提示：</span>
                    <span style={{ fontSize: 'xx-small' }}>输入科目名称、批量新增往来科目</span>
                </div>
                <div>
                    {errorList && errorList.some(f => f.errorMsg) && <Button className="btn" type="primary" onClick={::this.delError}>删除错误记录</Button>}
                        <Button className="btn" type="primary" loading={loading} onClick={this.handleSubmit}>保存</Button>
                <Button onClick={this.onCancal}>取消</Button>
            </div>
                </div >
            </div >
        )
    }
}

export default Form.create({ name: 'bovms_app_batch_add_subject' })(BatchAddSubject);