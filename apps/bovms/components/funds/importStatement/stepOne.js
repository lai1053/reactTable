import React from 'react'
import { Button, Input, Select, Form, Upload } from "antd"
import { fetch } from 'edf-utils'

const formItemLayout = {
    labelCol: {
        xs: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 16 },
    },

};

class StepOne extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            bankAcctId: '',
            optionList: [],
            loading: false
        }
        this.file = undefined;
        this.canUpload = false;
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {};
    }

    componentDidMount() {
        this.getBankAccountList();
    }
    async getBankAccountList() {
        let res = await this.props.webapi.funds.getBankAccountList({ "isEnable": true });
        this.setState({
            optionList: res
        })
    }

    //下一步
    onNext = async (e) => {
        e && e.preventDefault && e.preventDefault();
        let params = {}
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                let manageOrg = this.metaAction.context.get('manageOrg');
                let currentOrg = this.metaAction.context.get('currentOrg');
                params.dljgName = manageOrg.name;
                params.orgName = currentOrg.name;
                params.bankAcctId = values.bankAcctId;
                params.yearPeriod = parseInt(this.metaAction.gf('data.filterData.yearPeriod').replace('-', ''))
                params.fileId = this.file.id;
                params.fileName = this.file.originalName;
                params.fileSuffix = this.file.suffix;
                params.fileSize = this.file.size;
                this.setState({
                    loading: true
                })
                await this.props.onNext(params)
                this.setState({
                    loading: false
                })
            }
        });
    }
    onAdd = async (option) => {
        const ret = await this.metaAction.modal('show', {
            title: '账户',
            className: 'app-list-account-modal',
            wrapClassName: 'card-archive',
            width: 395,
            height: 500,
            children: this.metaAction.loadApp('app-card-bankaccount', {
                store: this.store,
                type: 'xdzzj',
                bankAccountTypeId: 3000050002
            })
        })
        if (ret) {
            this.getBankAccountList()
            this.props.form.setFieldsValue({ bankAcctId: ret.id })
        }
    }
    //上传文件前的回调
    beforeUpload = async (file) => {
        let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "MacIntel" && navigator.userAgent.toLowerCase().indexOf('chrome') < 0)
        if (!isWin) return

        let type = file.type ? file.type : 'application/vnd.ms-excel'
        let mode = file.name.substr(file.name.length - 4, 4)
        if (!(type == 'application/vnd.ms-excel'
            || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mode.indexOf('xls') > -1)) {

            this.metaAction.modal('error', {
                okText: '确定',
                content: '支持导入EXCEL 2003格式，及2003以上版本，请检查文件格式。'
            })
            return false
        }

        this.fileSizeJudge(file)
    }
    //校验文件大小
    fileSizeJudge = async (file) => {
        const isLt10M = file.size > 1024 * 1024 * 10;
        if (file.size && isLt10M) {
            this.canUpload = false
            this.metaAction.toast('error', '文件不可大于10M')
            return false
        }
        this.canUpload = true
    }
    //文件改变触发的回调
    uploadChange = (info) => {
        const file = info.file
        if (!file.status) return
        if (file.status === 'done') {
            this.setState({
                loading: false
            })
            const response = file.response
            if (response.error && response.error.message) {
                this.metaAction.toast('error', response.error.message)
            } else if (response.result && response.value) {
                this.file = response.value
                this.props.form.setFieldsValue({ file: response.value.originalName+'                   ' })
            }
        } else if (info.file.status === 'error') {
            this.metaAction.toast('error', '上传失败')
        }
    }
    //上传必须发送的token
    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {
            token
        }
    }

    downloadTemplate = async () => {
        await this.webapi.funds.downloadTemplate()

    }

    getLink() {
        return `/v1/biz/bovms/flowfund/downloadCommonTemplate?token=${sessionStorage.getItem('_accessToken')}`
    }
    render() {
        const { bankAcctId, optionList, loading } = this.state
        const { getFieldDecorator } = this.props.form;
        return (
            <div className='bovms-app-guidePage-range-step-one'>
                <div className='bovms-app-guidePage-popup-content' style={{ padding: '32px 160px 0' }}>
                    <Form >
                        <Form.Item label="银行账号:" {...formItemLayout}>
                            {getFieldDecorator('bankAcctId', {
                                rules: [{ required: true, message: '请选择银行账号' }],
                                normalize: (value, prevValue, allValues) => {
                                    if (value == 'add') {
                                        return prevValue
                                    } else {
                                        return value
                                    }
                                },
                                initialValue: ''
                            })(
                                <Select
                                    placeholder="请选择银行账号"
                                    dropdownClassName="bovms-select-subject-dropdown"
                                >
                                    {
                                        optionList.map(item => (
                                            <Option value={item.id} key={item.id} item={item}>{`${item.name} ${item.code}`}</Option>
                                        ))
                                    }
                                    <Option key="add" className="select-subject-add">
                                        <Button icon="plus" type="primary" onClick={this.onAdd.bind(this)}>新增</Button>
                                    </Option>
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="选择对账单:" {...formItemLayout}>
                            {getFieldDecorator('file', {
                                rules: [{ required: true, message: '请选择本地文件' }],
                            })(<Input
                                readOnly
                                suffix={
                                    <Upload onChange={this.uploadChange}
                                        accept='.xls, .xlsx'
                                        action='/v1/edf/file/upload'
                                        showUploadList={false}
                                        className='bomvs-app-funds-import-step-one-upload'
                                        beforeUpload={this.beforeUpload}
                                        headers={this.getAccessToken()}
                                        style={{
                                            display: "inline-block",
                                            verticalAlign: "middle"
                                        }}
                                    >
                                        <Button type="primary">浏览</Button>
                                    </Upload>

                                }
                            />
                            )}
                        </Form.Item>
                        <Form.Item label="温馨提示:" {...formItemLayout} className='bovms-app-guidePage-range-step-one-tip'>
                            <p style={{marginBottom:'-10px'}}>1.所有银行的xls、xlsx格式对账单可直接导入</p>
                            <p style={{marginBottom:'-10px'}}>2.仅导入xls、xlsx文件的第一个工作表</p>
                            <p style={{marginBottom:'0'}}>3.如导入不成功,可<a href='javascript:;' onClick={this.downloadTemplate.bind(this)}>下载通用模板</a>,按模板填写后导入。</p>
                        </Form.Item>
                    </Form>
                </div>
                <div className='bovms-app-actions-footer'>
                    <div></div>
                    <div>
                        <Button type="primary" loading={loading} onClick={this.onNext.bind(this)}>下一步</Button>
                        <Button onClick={() => { this.props.onCancel() }}>取消</Button>
                    </div>

                </div>
            </div>
        )
    }
}

export default Form.create({ name: 'bovms_app_funds_step_one' })(StepOne); 