import React, {Fragment} from 'react'
// import { DatePicker } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { Input, Form, Button, Select, Modal, Icon, Popover, Checkbox, Row, Col } from 'antd'
import {Select as EdfSelect, } from 'edf-component'
import SelectAssist from "./selectAssist";
// import CheckBox from 'rc-checkbox';
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
            accounting: false
        }
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
    }

    handleSubmit = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let selectedValues, { errorList, formItemsKey, formItems, optionList, accounting, unitNameObj, disabledParent } = this.state;
        if (!formItems || (formItems && formItems.length < 1)) {
            this.metaAction.toast('warning', '没有可以新增的会计科目')
            return
        }

        this.props.form.validateFieldsAndScroll((err, values) => {
            let noErr = false;
            // 检查传入的科目名
            // if (!err && Object.keys(values).some(s => s !== 'parentId' && values[s] && values[s].length > 100)) {
            //     Object.keys(values).forEach(key => {
            //         if (key !== 'parentId') {
            //             if (values[key] && values[key].length > 100) {
            //                 const item = errorList.find(f => f.key == key.replace('name', ''))
            //                 if (item)
            //                     item.errorMsg = '科目名称长度不能超过100个字符';
            //             }
            //         }
            //     })
            // }
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
                if (key !== 'parentId' && !formItems.find(el => el.key == key).data) {
                    glXdzAccountDtoList.push({
                        parentId: selectedValues.parentId,
                        name: selectedValues[key].name,
                        isCalcQuantity: accounting,
                        unitId: accounting ? unitNameObj[selectedValues[key].unit] : '',
                        key,
                    })
                }
            })
            let optionItem = optionList.find(f => f.id === selectedValues.parentId)

            //带辅助核算弹出提示
            if (optionItem.isCalc) {
                const comfirm = await this.metaAction.modal("confirm", {
                    content: "所选择的上级科目带有辅助核算，确定要为其增加下级科目吗？"
                })
                //取消直接返回上级界面
                if (!comfirm) {
                    return
                }
            }
            this.setState({ loading: true });

            // isReturnValue: true
            let res = await this.webapi.bovms.batchAddAccountCode({ glXdzAccountDtoList, isReturnValue: 0 });
            // console.log('selectedValues:', res)
            if (res) {
                if(res.successList && res.successList.length) {
                    formItems.forEach(el => {
                        res.successList.forEach(v => {
                            if(el.key == v.key) {
                                el.hide = true
                                el.data = v
                            }
                        })
                    })
                }
                if (res.code === '0' && res.successList && res.successList.length == glXdzAccountDtoList.length) {
                    this.metaAction.toast('success', `成功新增了${res.successList.length}个科目`);
                    // res.successList = this.sortSuccessList(glXdzAccountDtoList, res.successList)
                    res.successList = formItems.map(el => el.data)
                    //选择了带辅助核算科目
                    if (optionItem.isCalc) {
                        let assistRes = await this.openStockModal(optionItem)
                        if (assistRes && assistRes.assistList) {
                            res.successList = res.successList.map(e=>{
                                e.assistList = assistRes.assistList
                                return e
                            })
                            closeModal && closeModal(this.backFillList(res.successList, subjectItems));
                        }else{
                            closeModal && closeModal();
                        }
                    }else{
                        closeModal && closeModal(this.backFillList(res.successList, subjectItems));
                    }
                    return res.successList;
                } else if (res.code === '1' && res.failedList && res.failedList[0]) {
                    // this.metaAction.toast('error', res.failedList[0])
                    let _errorList = JSON.parse(res.failedList[0])
                    _errorList.forEach(item => {
                        let er = errorList.find(f => f.key == item.key)
                        // if (er) er.errorMsg = 'item.errorMsg';
                        if (er) er.errorMsg = item.errorMsg;
                    })
                    this.metaAction.toast('error', '批增会计科目失败')
                } else if (res.message) {
                    this.metaAction.toast('error', res.message)
                } else if(res.code === '0' && res.failedList.length) {
                    this.metaAction.toast('success', `成功新增${res.successList.length}个科目,失败${res.failedList.length}个科目`);

                    let failedKey = res.failedList.map(el => {
                        let temp = glXdzAccountDtoList.find(f => el.indexOf(f.name) != -1)
                        return +temp.key
                    })
                    errorList.forEach(el => {
                        if(failedKey.includes(el.key)) {
                            el.errorMsg = '会计科目同级名称有重复'
                        }
                    })
                    this.setState({
                        formItems,
                        errorList,
                        disabledParent: true,
                        hideErrorBtn: true
                    })
                } else {
                    this.metaAction.toast('error', res)
                }
            }
        } else {
            this.metaAction.toast('error', '批增会计科目失败')
        }
        // console.log('handleSubmit:', errorList, errorForFormItems)
        this.setState({ loading: false, errorList });

    }

    openStockModal = async (item) => {
        const {
            metaAction,
            store,
            webapi,
            disabled
        } = this.props;
        const res = await metaAction.modal("show", {
            title: "选择辅助项目",
            width: 450,
            style: { top: 5 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: (
                <SelectAssist
                    item={item}
                    store={store}
                    metaAction={metaAction}
                    webapi={webapi}
                    disabledInventory={disabled}
                ></SelectAssist>
            )
        });

        return Promise.resolve(res)
        // if (res && res.assistList) {
        //     console.log('res', res)
        // }else{
            
        // }
    };
    backFillList(list, formItems) {
        if (list.length == formItems.length) {
            return list;
        }
        const noDuplicateItem = this.state.formItems;
        const result = [];
        formItems.forEach((item) => {
            const index = noDuplicateItem.findIndex(f => f.name == item.name);
            result.push(list[index]);
        })
        return result;
    }
    sortSuccessList(req, res) {
        let arr = []
        req.forEach(el => {
            arr.push(res.find(f => f.name == el.name))
        })
        return arr
    }
    componentDidMount() {
        this.props.setCancelLister(this.onCancal)
        // this.initKjkm();
        let formItems = this.deDuplicateItem(this.props.subjectItems || []),
            formItemsKey = {},
            errorList = [];
        formItems.forEach((item, index) => {
            item.key = index
            formItemsKey[item.name] = index
            errorList.push({
                key: index,
                errorMsg: '',
            })
        })
        this.setState({ formItems, formItemsKey, errorList })
        this.queryUnitList()
    }
    // 上级科目,进项默认空
    sjkmFocus = async () => {
        const { webapi, subjectType, module, metaAction, isStock } = this.props;
        // console.log('webapi:', webapi, this.props)
        if (webapi && webapi.bovms && subjectType && module) {
            const debitOrCredit = subjectType === 'jfkm' ? 'debit' : 'credit';
            const res = await webapi.bovms.getParentCodeList({
                module,
                isStock: module === 'cg' && isStock == 1 ? '0' : undefined, //当前会计月份，是否启用存货
                [debitOrCredit]: debitOrCredit,
            });
            if (res) {
                this.setState({ optionList: res })
            }

        }
    }
    onCancal = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let res = this.state.formItems.filter(el => el.data)
        if(res.length) {
            const temp = [];
            let optionItem = this.state.optionList.find(f => f.id === res[0].data.parentId)
            //选择了带辅助核算科目
            if (optionItem.isCalc) {
                let assistRes = await this.openStockModal(optionItem)
                if (assistRes && assistRes.assistList) {
                    res = res.map(e=>{
                        e.data.assistList = assistRes.assistList
                        return e
                    })
                    this.props.subjectItems.forEach((item) => {
                        const index = res.findIndex(f => f.name == item.name);
                        temp.push(res[index] && res[index].data || null);
                    })
                    this.props.closeModal && this.props.closeModal(temp);
                    // closeModal && closeModal(this.backFillList(res.successList, subjectItems));
                }else{
                    this.props.closeModal && this.props.closeModal();
                }
            }else{
                // 回填
                this.props.subjectItems.forEach((item) => {
                    const index = res.findIndex(f => f.name == item.name);
                    temp.push(res[index] && res[index].data || null);
                })
                this.props.closeModal && this.props.closeModal(temp);
                // closeModal && closeModal(this.backFillList(res.successList, subjectItems));
            }
            
        } else {
            this.props.closeModal && this.props.closeModal();
        }
    }
    deDuplicateItem(formItems) {
        let obj = {}, res = []
        formItems.forEach(el => {
            if(!obj[el.name]) {
                obj[el.name] = {
                    unit: el.unit ? [el.unit] : []
                }
                res.push(el)
            } else {
                let u = obj[el.name].unit
                if(el.unit && !u.includes(el.unit)) {
                    u.push(el.unit)
                }
            }
        })
        res.forEach(el => {
            let u = obj[el.name].unit
            if(u.length) {
                el.unit = u.join('、')
            }
        })
        return res
    }
    del(item) {
        let { formItems, errorList, formItemsKey } = this.state;
        if (errorList && formItems) {
            formItems = formItems.filter(f => f.name !== item.name);
            errorList.map(er => {
                if (er.key === formItemsKey[item.name])
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
                    formItems = formItems.filter(f => f.name !== key);
                    item.errorMsg = '';
                }
                return item
            })
            this.setState({ formItems, errorList })
        }
    }
    parentIdChange(value, e) {
        let { errorList, form, optionList } = this.state;
        if (form.parentId !== value) {
            errorList.map(item => {
                item.errorMsg = '';
                return item
            })
            // let parent = optionList.find(el => el.id == value)
            let parent = e.props.item
            this.setState({
                errorList,
                accounting: parent.isCalcQuantity,
                disabledAccounting: parent.isCalcQuantity,
            },() => {
                if(parent.isCalcQuantity) {
                    let form = this.props.form.getFieldsValue()
                    Object.keys(form).forEach(key => {
                        if(key != 'parentId') {
                            let el = form[key]
                            el.unit = parent.unitName
                            this.props.form.setFieldsValue({[key]: el})
                        }
                    })
                }
            });
        }
    }
    CheckboxChange = (e) => {
        let {unitNameObj, formItems} = this.state
        this.setState({
            accounting: e.target.checked
        }, () => {
            let form = this.props.form.getFieldsValue()
            if(form.parentId && e.target.checked) {
                formItems.forEach((v, i) => {
                    let el = form[i]
                    if(v.unit) {
                        if(v.unit in unitNameObj) {
                            el.unit = v.unit
                        } else {
                            el.unit = ''
                        }
                    } else {
                        el.unit = ''
                    }
                    this.props.form.setFieldsValue({[i]: el})
                })
            }
        })
    }
    queryUnitList = async () => {
        let params = {
            "page": {"currentPage": 1, "pageSize": 500},
            "entity": {"fuzzyCondition": ""}
        }, unitNameObj = {}
        const {list = []} = await this.props.webapi.bovms.queryUnitList(params)
        if(list.length) {
            list.forEach((el) => {
                unitNameObj[el.name] = el.id
            })
        }
        this.setState({
            unitList: list,
            unitNameObj
        })
    }

    addUnit = (key) => async () => {
		const ret = await this.metaAction.modal('show', {
			title: '新增计量单位',
			wrapClassName: 'card-archive',
            width: 720,
            footer: null,
			className: 'ttk-app-unit-card-add',
			children: this.metaAction.loadApp('ttk-app-unit-card', {
				store: this.props.store,
			})
        })

        console.log(ret, this.props.store) 
		if (ret && ret.res) {
			this.queryUnitList()
            this.metaAction.toast('success', '新增成功')
            let form = this.props.form.getFieldsValue()
            form[key].unit = ret.res.name
            this.props.form.setFieldsValue({[key]: form[key]})
        }
    }

    showBtn = () => {
        const {errorList, hideErrorBtn} = this.state;
        let flag1 = errorList && errorList.some(f => f.errorMsg)
        return flag1 && !hideErrorBtn
        // let flag2 = formItems.some(f => f.data)
        // return flag1 && !flag2
    }

    render() {
        const { optionList, form, loading, errorList, formItems, formItemsKey, unitList = [], accounting, disabledAccounting, disabledParent } = this.state;
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
                            disabled={disabledParent}
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
                        <div>上级科目最大为4级</div>
                    }>
                        <Icon type="question" className="bovms-help-icon" />
                    </Popover>
                    </Form.Item>
                    {
                        disabledAccounting &&
                        <Form.Item label="" {...formItemLayoutWithOutLabel}>
                            <Checkbox onChange={this.CheckboxChange} checked={accounting} disabled={disabledAccounting || disabledParent}>新科目启用数量核算</Checkbox>
                        </Form.Item>
                    }
                <h4 className="h2">{!accounting ? '即将新增的科目：' : '新增科目列表：'}<i></i></h4>
                {
                    !accounting ?
                    formItems.map((item, i) => {

                        let errorItem = errorList && errorList.find(f => f.key === (formItemsKey || {})[item.name]);
                        let layout = !i ? formItemLayout : formItemLayoutWithOutLabel
                        return (
                            <Form.Item key={formItemsKey[item.name]} label={!i ? '科目名称' : ''}
                                {...layout}
                                validateStatus={errorItem && errorItem.errorMsg ? 'error' : undefined}
                                help={(errorItem || {}).errorMsg || undefined}
                                style={{display: item.hide ? 'none' : ''}}
                            >
                                {getFieldDecorator(`${formItemsKey[item.name]}.name`, {
                                    rules: [{ required: true, message: `科目名称不能为空！` }],
                                    initialValue: form[item.name] || item.name,
                                })(<Input maxLength={100} onChange={e => this.inputChange(item.name)} />)}
                                <Icon type="close-circle" className="del-icon" onClick={e => this.del(item)} />
                            </Form.Item>
                        )
                    }) :
                    (<Fragment>
                        <Row className='add-list-title'>
                            <Col span={10} offset={4}><span>*</span>科目名称</Col>
                            <Col span={4}>发票单位</Col>
                            <Col span={6}>
                                <span>*</span>科目单位
                                <Popover content={
                                    <Fragment>
                                        <p>上级科目启用数量核算时，默认为上级科目单位</p>
                                        <span>未启用时，默认为发票单位</span>
                                    </Fragment>
                                }>
                                    <Icon type="question" className="add-list-title-help-icon" />
                                </Popover>
                            </Col>
                        </Row>
                        {
                            formItems.map((item, i) => {
                                let errorItem = errorList && errorList.find(f => f.key === (formItemsKey || {})[item.name]);
                                return (
                                    <Row className='add-list-content' style={{display: item.hide ? 'none' : ''}}>
                                        <Col span={10} offset={4}>
                                            <Form.Item key={formItemsKey[item.name]} label=''
                                                validateStatus={errorItem && errorItem.errorMsg ? 'error' : undefined}
                                                help={(errorItem || {}).errorMsg || undefined}
                                            >
                                                {getFieldDecorator(`${formItemsKey[item.name]}.name`, {
                                                    rules: [{ required: true, message: `科目名称不能为空！` }],
                                                    initialValue: form[item.name] || item.name,
                                                })(<Input maxLength={100} onChange={e => this.inputChange(item.name)} />)}
                                            </Form.Item>
                                        </Col>
                                        <Col span={4} title={item.unit}>{item.unit}</Col>
                                        <Col span={6}>
                                            <Form.Item key={formItemsKey[item.name]+'unit'} label=''
                                                wrapperCol={{ xs: { span: 20 } }}
                                            >
                                                {getFieldDecorator(`${formItemsKey[item.name]}.unit`, {
                                                    rules: [{ required: true, message: `科目单位不能为空！` }],
                                                })(
                                                    <EdfSelect
                                                        style={{ width: '100%' }}
                                                        dropdownMatchSelectWidth={true}
                                                        notFoundContent='无匹配结果'
                                                        showSearch
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                        }
                                                        dropdownFooter={
                                                            (
                                                                <div className="stock-app-select-add-btn" onClick={this.addUnit(`${formItemsKey[item.name]}`)}>
                                                                    <i className="add-img" type="xinzengkemu"></i>
                                                                    科目单位
                                                                </div>
                                                            )
                                                        }
                                                    >
                                                        {
                                                            unitList.map(item => (
                                                                <EdfSelect.Option value={item.name} key={item.id} item={item}>{item.name}</EdfSelect.Option>
                                                            ))
                                                        }
                                                    </EdfSelect>
                                                )}
                                                <Icon type="close-circle" className="del-icon" onClick={e => this.del(item)} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            })
                        }
                    </Fragment>)
                }
                </Form>
            <div className="footer">
                <div>共{` ${formItems.length} `}条记录
                        <span style={{ marginLeft: '8px', color: '#ff9300', fontSize: '9px' }}>温馨提示：</span>
                    <span style={{ fontSize: 'xx-small' }}>输入科目名称、批量新增会计科目</span>
                </div>
                <div>
                    {this.showBtn() && <Button className="btn" type="primary" onClick={::this.delError}>删除错误记录</Button>}
                        <Button className="btn" type="primary" loading={loading} onClick={this.handleSubmit}>保存</Button>
                <Button onClick={this.onCancal}>取消</Button>
            </div>
                </div >
            </div >
        )
    }
}

export default Form.create({ name: 'bovms_app_batch_add_subject' })(BatchAddSubject);