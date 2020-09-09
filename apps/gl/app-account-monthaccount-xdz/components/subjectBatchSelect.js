import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Map } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Form, Select, Popover, Button } from 'edf-component'
const FormItem = Form.Item
const Option = Select.Option
import { fromJS } from 'immutable';
class subjectBatchSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accountId: props.accountId || null,
            subjectTypeId: props.subjectTypeId || null,
            accountAuxId: props.accountAuxId || null,
            data: props.data,
            visible: false,
            error: {
                accountId: null,
                subjectTypeId: null,
                accountAuxId: null
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    /**
     * 批量修改保存
     */
    onOk = async () => {
        let { accountId, subjectTypeId, accountAuxId, data } = this.state
        const { accountList, allArchiveDS } = data
        if (!accountId || !subjectTypeId) {
            this.setState({
                error: {
                    subjectTypeId: !subjectTypeId ? '请选择要修改的项目' : null,
                    accountId: !accountId ? '请选择要调整后的科目' : null
                }
            })
            return false
        }
        let accountingSubject = accountList.filter(x => x.get('id') == accountId).first(),
            { title, auxList } = this.getAuxData(accountingSubject.toJS(), allArchiveDS)

        if (accountingSubject.get('isCalc') && !accountAuxId) {

            this.setState({
                error: {
                    accountId: `科目启用了${title}辅助项,请调整`
                }
            })
            return false
        }
        let res = { subjectTypeId, accountId, codeAndName: accountingSubject.get('codeAndName') }
        if (accountingSubject.get('isCalc')) {
            const auxName = fromJS(auxList).filter(x => x.get('id') == accountAuxId).first()
            res.subjectAndAuxName = accountingSubject.get('codeAndName') + '_' + auxName.get('name')
            res.accountAuxId = accountAuxId
            res.isCalc = true
        }
        return res
    }
    /**
     * 辅助项保存
     */
    handleOK = async (title) => {
        let { accountAuxId } = this.state
        if (!accountAuxId) {
            this.setState({
                error: {
                    accountAuxId: !accountAuxId ? `${title}不能为空` : null,
                }
            })
            return false
        } else {
            this.setState({ accountAuxId, visible: false })
        }
    }
    /**
     * 辅助项取消
     */
    handleCancel = async () => {
        let { accountId, subjectTypeId } = this.state
        this.setState({ accountId, subjectTypeId, accountAuxId: null, visible: false })

    }
    /**
     * 辅助核算的界面
     */
    getEditAuxAccountContent = (accountingSubject) => {
        let { accountAuxId, error, data } = this.state,
            { allArchiveDS } = data
        const { title, auxList } = this.getAuxData(accountingSubject.toJS(), allArchiveDS)
        return (
            <div id='assistDiv' style={{ width: '335px', height: '96px', display: 'flex', flexDirection: 'column', paddingLeft: '0px', paddingBottom: '0px', 'z-index': 99999999999, overflow: 'hidden' }}>
                <FormItem
                    label={title}
                    required={true}
                    validateStatus={error.accountAuxId ? 'error' : 'success'}
                    style={{ width: '335px', display: 'flex', marginLeft: '10px', marginTop: '10px', marginBottom: '15px', fontSize: '12px' }}
                    help={error.accountAuxId}>

                    <Select
                        style={{ width: '270px', marginLeft: '5px' }}
                        showSearch={true}
                        value={accountAuxId}
                        filterOption={this.filterOptionSubject}
                        className='editselect'
                        onChange={(value) => this.onSubjectTypeChange('auxType', value)}
                    >
                        {auxList.map(item => {
                            return (
                                <Option key={item.code + " " + item.name}
                                    value={item.id}>
                                    {item.code + " " + item.name}
                                </Option>
                            )
                        })}
                    </Select>
                </FormItem>

                <div style={{
                    width: '335px', position: 'absolute', top: '90px', textAlign: 'right'
                }}>
                    <Button
                        type="primary"
                        style={{ marginRight: '10px' }}
                        onClick={() => this.handleOK(title)}
                    >
                        确定
                        </Button>
                    <Button type="ghost"
                        onClick={this.handleCancel}
                        style={{ fontSize: '12px' }}>取消</Button>
                </div>
            </div>
        )
    }
    /**
     * 获取显示辅助数据
     */
    getAuxData = (option, allArchiveDS) => {
        let curAuxData = {}
        if (!!option.isCalcCustomer) {
            curAuxData['title'] = '客户'
            curAuxData['auxList'] = allArchiveDS['客户']
        }
        if (!!option.isCalcSupplier) {
            curAuxData['title'] = '供应商'
            curAuxData['auxList'] = allArchiveDS['供应商']
        }
        if (!!option.isCalcProject) {
            curAuxData['title'] = '项目'
            curAuxData['auxList'] = allArchiveDS['项目']
        }
        if (!!option.isCalcDepartment) {
            curAuxData['title'] = '部门'
            curAuxData['auxList'] = allArchiveDS['部门']
        }
        if (!!option.isCalcPerson) {
            curAuxData['title'] = '人员'
            curAuxData['auxList'] = allArchiveDS['人员']
        }
        if (!!option.isCalcInventory) {
            curAuxData['title'] = '存货'
            curAuxData['auxList'] = allArchiveDS['存货']
        }
        for (var i = 1; i <= 10; i++) {
            if (!!option[`isExCalc${i}`]) {
                const { title, userDefineDS } = this.getUserdefineDS(`isExCalc${i}`, allArchiveDS)
                curAuxData['title'] = title
                curAuxData['auxList'] = userDefineDS
                //目前只支持一个辅助项，这块直接跳出循环
                break
            }
        }
        return curAuxData
    }
    /**
     * 获取自定义项
     */
    getUserdefineDS = (archiveName, allArchiveDS) => {
        let dsArray = allArchiveDS['自定义档案'],
            userDefineDS = [], title
        for (var i = 0; i < dsArray.length; i++) {
            if (dsArray[i].calcName == archiveName) {
                userDefineDS = dsArray[i].userDefineArchiveDataList
                title = dsArray[i].name
                //目前只支持一个辅助项，这块直接跳出循环
                break
            }
        }
        return { title, userDefineDS }
    }
    /**
     * change事件
     */
    onSubjectTypeChange = async (type, value) => {
        let { error, visible, data } = this.state
        if (type == 'subjectType') {
            if (value) {
                error.subjectTypeId = null
            }
            if (!visible) {
                visible = false
            }
            this.setState({ subjectTypeId: value, visible, error })
        } else if (type == 'auxType') {
            if (value) {
                error.accountAuxId = null
                error.accountId = null
            }
            this.setState({ accountAuxId: value, error })
        } else {
            if (value) {
                error.accountId = null
            }
            let { accountList } = data
            const accountingSubject = accountList.filter(x => x.get('id') == value).first()
            this.setState({ accountId: value, visible: accountingSubject.get('isCalc') ? true : false, error })
        }
    }
    /**
     * 科目过滤
     */
    filterOptionSubject = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    render() {
        let { accountId, subjectTypeId, error, data } = this.state,
            { accountList, subjectTypes } = data,
            accountingSubject = accountList.filter(x => x.get('id') == accountId).first()
        let content = accountingSubject && accountingSubject.get('isCalc') ? this.getEditAuxAccountContent(accountingSubject) : ''
        return (
            <Form>
                <FormItem label='请选择需要修改的项目:' required={true}
                    validateStatus={error.subjectTypeId ? 'error' : 'success'}
                    help={error.subjectTypeId}>
                    <Select
                        showSearch={true}
                        value={subjectTypeId}
                        filterOption={this.filterOptionSubject}
                        className='editselect'
                        onChange={(value) => this.onSubjectTypeChange('subjectType', value)}
                    >
                        {subjectTypes.map(item => {
                            return (
                                <Option key={item.get('key')}
                                    value={item.get('key')}>
                                    {item.get('value')}
                                </Option>
                            )
                        })}
                    </Select>

                </FormItem>
                <FormItem label='调整后的科目为:' className='subSelect' required={true}
                    validateStatus={error.accountId ? 'error' : 'success'}
                    help={error.accountId}>
                    <Popover
                        content={content}
                        trigger="click"
                        placement="bottomLeft"
                        visible={this.state.visible}
                    >
                        <Select
                            showSearch={true}
                            value={accountId}
                            filterOption={this.filterOptionSubject}
                            className='editselect'
                            onChange={(value) => this.onSubjectTypeChange('account', value)}
                        >
                            {accountList.map(item => {
                                return (
                                    <Option key={item.get('id')}
                                        value={item.get('id')}>
                                        {item.get('codeAndName')}
                                    </Option>
                                )
                            })}
                        </Select>
                    </Popover>
                </FormItem>
            </Form>
        )
    }
}

export default subjectBatchSelect
