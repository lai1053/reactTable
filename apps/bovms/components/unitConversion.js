import React from 'react'
import { Table } from 'edf-component'
import { Input, Icon, Button, Tooltip, Switch } from 'antd'


class EditableCell extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            localeValue: ''
        }
    }
    componentWillReceiveProps(props) {
        if (props.value) {
            this.setState({
                localeValue: props.value
            })
        }
    }
    componentDidMount() {
        //初始值
        if (this.props.value) {
            this.setState({
                localeValue: this.props.value
            })
        }
        this.props.selectedRom(this.props.index, this.input, this.props.comeFrom);
    }
    onChange(e) {
        if ((e.target.value.match(/^[0-9||.]*$/) && parseFloat(e.target.value) <= 1000000) || e.target.value.match(/^\s*$/)) {
            this.setState({
                localeValue: e.target.value
            })
        }
    }
    render() {
        let { onSave, autoFill, index, comeFrom } = this.props
        const currentValue = this.state.localeValue == '' ? '' : parseFloat(this.state.localeValue)
        return (
            <div>
                <Input
                    ref={node => (this.input = node)}
                    onChange={this.onChange.bind(this)}
                    value={this.state.localeValue}
                    onFocus={autoFill.bind(this, index, comeFrom)}
                    onBlur={onSave.bind(this, index, comeFrom, currentValue)}
                    style={{ width: '80px', marginRight: '8px' }} />
                <span style={{ display: 'inline-block', width: '30px', textAlign: 'left' }}>{this.props.unit}</span>
            </div>
        )

    }
}

class BatchSetRadio extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            original: '',
            target: ''
        }
    }
    onOk = e => {
        let { original, target } = this.state;
        if (!original || !target) {
            return this.props.metaAction.toast('error', '不可为空')
        }
        if (parseFloat(original) === 0 || parseFloat(target) === 0) {
            return this.props.metaAction.toast('error', '不可输入0')
        }
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal({ original: original, target: target });
    }
    onCancel = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }
    originalChange(e) {
        if (e.target.value.match(/^[0-9||.]*$/) && parseFloat(e.target.value) <= 1000000) {
            this.setState({
                original: e.target.value
            })
        }
    }
    targetChange(e) {
        if (e.target.value.match(/^[0-9||.]*$/) && parseFloat(e.target.value) <= 1000000) {
            this.setState({
                target: e.target.value
            })
        }
    }
    render() {
        return (
            <div>
                <div
                    className='bovms-app-popup-content no-top-padding'
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0 16px' }}
                >
                    <div className=''>
                        <Input value={this.state.original} onChange={this.originalChange.bind(this)} style={{ width: '120px' }}></Input>
                        &nbsp;&nbsp;&nbsp;<span>原单位</span>
                    </div>
                    <span style={{ padding: '0 16px' }}>=</span>
                    <div>
                        <Input value={this.state.target} onChange={this.targetChange.bind(this)} style={{ width: '120px' }}></Input>
                        &nbsp;&nbsp;&nbsp;<span>目标单位</span>
                    </div>
                </div>
                <div className='bovms-app-actions-footer-not-tip'>
                    <div>
                        <Button type="primary" onClick={this.onOk}>确定</Button>
                        <Button onClick={this.onCancel}>取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}


//下载认证结果
class UnitConversion extends React.Component {
    constructor(props) {
        super(props)
        this.selectedRom = {},
            this.state = {
                unitChangeList: [],
                loading: false,
                disabled: false,
                selectedRowKeys: [],
                mainSwitchValue: true,

            }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    handleMainSwitchChange(e) {
        const { unitChangeList, mainSwitchValue } = this.state
        unitChangeList.forEach(item => {
            item.needToMemorize = e ? 1 : 0
        })
        this.setState({
            unitChangeList,
            mainSwitchValue: e
        })


    }
    componentDidMount() {
        let unitChangeList = this.props.unitChangeList.map((e, i) => {
            e.needToMemorize = 1
            e.index = i
            return e
        })
        this.setState({
            unitChangeList: unitChangeList
        })
    }
    onChange(index) {
        let { unitChangeList } = this.state;
        let item = unitChangeList[index].needToMemorize;
        unitChangeList[index].needToMemorize = item === 1 ? 0 : 1

        if (unitChangeList && unitChangeList.every(e => e.needToMemorize === 1)) {
            this.setState({ unitChangeList, mainSwitchValue: true })
        } else if (unitChangeList && unitChangeList.every(e => e.needToMemorize != 1)) {
            this.setState({ unitChangeList, mainSwitchValue: false })
        } else {
            this.setState({ unitChangeList })
        }

    }

    onCell = record => {
        return {
            onClick: event => {
                const { selectedRowKeys } = this.state;
                const index = selectedRowKeys.findIndex(f => f.toString() === record.index.toString())
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.index)
                }
                this.setState({ selectedRowKeys })
            },
        };
    }
    async batchSetRadio() {
        let { selectedRowKeys, unitChangeList } = this.state;
        if (!selectedRowKeys.length) {
            return this.props.metaAction.toast('error', '请先选择要设置的记录')
        }
        let res = await this.props.metaAction.modal('show', {
            footer: false,
            title: '批设比率',
            children: <BatchSetRadio
                metaAction={this.props.metaAction}
            />
        })
        if (typeof res === 'object') {
            selectedRowKeys.forEach(e => {
                unitChangeList[e].originalUnitNum = parseFloat(res.original);
                unitChangeList[e].destinationUnitNum = parseFloat(res.target);
            })
            this.setState({
                unitChangeList: unitChangeList,
                selectedRowKeys: []
            })
        }
    }

    async batchSetAll() {
        const confirm = await this.props.metaAction.modal("confirm", {
            content: `确定要将所有商品的换算比率设为1:1吗？`,
            width: 380
        });
        if (confirm) {
            let { unitChangeList } = this.state;
            for (let i = 0; i < unitChangeList.length; i++) {
                unitChangeList[i].destinationUnitNum = 1
            }
            for (let i = 0; i < unitChangeList.length; i++) {
                unitChangeList[i].originalUnitNum = 1
            }
            this.setState({
                unitChangeList: unitChangeList
            })
        }
    }

    onOk = async () => {
        let { unitChangeList, selectedRom } = this.state;
        let cell = true;
        for (let i = 0; i < unitChangeList.length; i++) {

            if (!unitChangeList[i].destinationUnitNum || !unitChangeList[i].originalUnitNum) {
                unitChangeList[i].unWrite = true;
                cell = false
                this.props.metaAction.toast("error", "请输入完整的换算比率");
            }
            if (
                unitChangeList[i].destinationUnitNum == "0" ||
                unitChangeList[i].originalUnitNum == "0"
            ) {
                this.props.metaAction.toast("error", "不可输入0");
                return;
            }
        }
        if (cell) {
            cell = true;
            this.submit(0);
        } else {
            this.setState({
                unitChangeList: unitChangeList
            })
        }

    };

    async submit(val) {
        let { yearPeriod, ids } = this.props;
        let { unitChangeList } = this.state
        this.setState({
            loading: true,
            disabled: true
        })
        let res = await this.props.webapi.bovms.createVoucher({ yearPeriod, ids, unitChangeList, bypassUnitChange: val });
        this.setState({
            loading: false,
            disabled: false
        })
        if (res && res.state == 0) {
            this.props.metaAction.toast('success', '生成凭证成功')
            this.props.closeModal && this.props.closeModal();
            return
        }
        if (res && res.state == 1 && res.errMessage) {
            this.props.metaAction.toast('error', res.errMessage)
            this.props.closeModal && this.props.closeModal();
            return
        }
    }

    handleSave = (index, comeFrom, value) => {
        const newData = this.state.unitChangeList;
        const item = newData[index];
        if (value == '0') {
            this.props.metaAction.toast('error', '不可输入0')
        }
        if (comeFrom == 'target') {
            item.destinationUnitNum = value
        } else {
            item.originalUnitNum = value
        }

        this.setState({ unitChangeList: newData });
    }
    onAutoFill = (index, comeFrom) => {
        const newData = this.state.unitChangeList;
        const item = newData[index];
        if (item.destinationUnitNum && item.originalUnitNum) {
            return
        }

        if (comeFrom == 'target' && !item.originalUnitNum) {
            item.originalUnitNum = '1'
            this.setState({ unitChangeList: newData });
            return
        }

        if (comeFrom == 'original' && !item.destinationUnitNum) {
            item.destinationUnitNum = '1'
            this.setState({ unitChangeList: newData });
            return
        }
    }

    selectedDom = (index, ref, comeFrom) => {
        this.selectedRom[index + comeFrom] = ref;
    }

    // 关闭按钮：2019
    onCancel = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    };

    onSelectChange = (val) => {
        this.setState({
            selectedRowKeys: val
        })
    }

    render() {
        const { unitChangeList, loading, disabled, selectedRowKeys } = this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
        };
        let switchClassName = ''
        //判断总开关是否显示半开状态
        if (unitChangeList && unitChangeList.every(e => e.needToMemorize === 1)) {

        } else if (unitChangeList && unitChangeList.every(e => e.needToMemorize != 1)) {

        } else {
            switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
        }

        let columns = [
            {
                title: '商品或服务名称',
                dataIndex: 'goodsName',
                key: 'goodsName',
                onCell: this.onCell
            },
            {
                title: '规格型号',
                dataIndex: 'specification',
                key: 'specification',
                width: '140px',
                onCell: this.onCell
            },
            {
                title: '用途',
                dataIndex: 'sourceType',
                key: 'sourceType',
                width: '120px',
                render: (text, record, index) => {
                    return text == '1' ? '数量核算' : '存货核算'
                },
                onCell: this.onCell
            },
            {
                title: '原单位（发票）',
                dataIndex: 'originalUnitId',
                key: 'originalUnitId',
                width: '160px',
                render: (text, record, index) => {
                    return (
                        <div>
                            <div class={record.unWrite ? 'aaa' : ''}>
                                <EditableCell
                                    index={index}
                                    comeFrom='original'
                                    value={record.originalUnitNum}
                                    unit={record.originalUnitName}
                                    onSave={this.handleSave}
                                    autoFill={this.onAutoFill.bind(this)}
                                    selectedRom={this.selectedDom.bind(this)}
                                ></EditableCell>
                            </div>
                        </div>
                    )
                },
            },
            {
                title: '=',
                align: 'center',
                render: () => '=',
                width: '60',
                onCell: this.onCell
            },
            {
                title: '目标单位',
                dataIndex: 'targetValue',
                key: 'targetValue',
                width: '160px',
                render: (text, record, index) => {
                    let props = Object.assign({}, record, { index, index, comeFrom: 'target', value: record.targetValue, handleSave: this.handleSave })
                    return (
                        <div>
                            <div class={record.unWrite ? 'aaa' : ''}>
                                <EditableCell
                                    index={index}
                                    comeFrom='target'
                                    value={record.destinationUnitNum}
                                    unit={record.destinationUnitName}
                                    onSave={this.handleSave}
                                    autoFill={this.onAutoFill.bind(this)}
                                    selectedRom={this.selectedDom.bind(this)}
                                ></EditableCell>
                            </div>
                        </div>
                    )
                },

            },
            {
                title: <div>
                    <div>
                        记住比率
                        <Tooltip title="记住换算比率，用于相同名称、规格型号和用途的货品的换算">
                            <Icon type="question" className="bovms-help-icon" />
                        </Tooltip>
                    </div>
                    <Switch checked={this.state.mainSwitchValue} className={switchClassName} onChange={this.handleMainSwitchChange.bind(this)}></Switch>
                </div>,
                dataIndex: 'needToMemorize',
                key: 'needToMemorize',
                width: '100',
                render: (text, record, index) => {
                    return <Switch checked={text} onChange={this.onChange.bind(this, index)} />
                }

            },

        ]
        return (
            <div className="bovms-unit-conversion">
                <div className='bovms-app-popup-content'>
                    <div class='bovms-unit-conversion-btn'>
                        <Button type="primary" onClick={this.batchSetRadio.bind(this)}>批设比率</Button>
                        <Button type="primary" onClick={this.batchSetAll.bind(this)}>全部1:1</Button>
                    </div>
                    <Table
                        className='bovms-common-table-style'
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={unitChangeList}
                        pagination={false}
                        bordered
                        style={{ height: "420px" }}
                        scroll={{ y: 370, x: 930 }}
                    />
                </div>
                <div className='bovms-app-actions-footer'>
                    <div class='bovms-app-actions-footer-tip'>
                        共{unitChangeList.length}条记录
                        <span style={{ marginLeft: '24px' }}>温馨提示：</span>发票上的单位与存货档案、数量核算的单位不同，请输入比率，生成凭证。
                    </div>
                    <div>
                        <Button type="primary" onClick={this.onOk} loading={loading}>确定</Button>
                        <Button onClick={this.onCancel} disabled={disabled}>取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default UnitConversion