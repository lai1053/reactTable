import React from 'react'
import { Row, Icon, Checkbox, Popover, Form } from "antd";
import { purchaseTransType, saleTransType } from './typeSettingData';

class typeSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            transTypeValue: []
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk);
        }
    }
    componentWillMount() {
        const { typesSettingArr } = this.props;
        if (typesSettingArr.length > 0) {
            this.setState({
                transTypeValue: typesSettingArr
            })
        }
    }
    onOk = (e) => {
        e && e.preventDefault && e.preventDefault();
        const { transTypeValue } = this.state;
        this.props.typesCheckboxOk(transTypeValue);
    }
    checkboxGroupChange(checkedValue) {
        if (checkedValue.length > 0) {
            this.setState({
                transTypeValue: checkedValue
            })
        }
    }
    render() {
        const { module } = this.props;
        const { transTypeValue } = this.state;
        return (
            <div className="bovms-app-habit-type-setting" style={{ padding: '20px' }}>
                {
                    module !== 'cg' ? (
                        <Checkbox.Group
                            style={{ width: '100%' }}
                            onChange={(checkedValue) => { this.checkboxGroupChange(checkedValue) }}
                            defaultValue={transTypeValue}
                        >
                            {
                                saleTransType.map(item => {
                                    return (item.value !== "other" ?
                                        <Row style={{ marginBottom: '20px' }}>
                                            <Checkbox value={item.value}> {item.name} </Checkbox>
                                        </Row> :
                                        <Row style={{ marginBottom: '20px' }}>
                                            <Checkbox checked={true} disabled={true} value={item.value}>
                                                {item.name}
                                            </Checkbox>
                                            <Popover
                                                className="habit-setting-tooltip"
                                                content={
                                                    <div>
                                                        <div>包括：</div>
                                                        <div>1）未勾选中的类型，例如销售无形资产</div>
                                                        <div>2）不能归类为其他类型的销售类型</div>
                                                    </div>
                                                }
                                            >
                                                <Icon type="question" className="bovms-help-icon" />
                                            </Popover>
                                        </Row>
                                    )
                                })
                            }
                        </Checkbox.Group>
                    ) : (
                            <Checkbox.Group
                                style={{ width: '100%' }}
                                onChange={(checkedValue) => { this.checkboxGroupChange(checkedValue) }}
                                defaultValue={transTypeValue}
                            >
                                {
                                    purchaseTransType.map(item => {
                                        return (item.value !== "other" ?
                                            <Row style={{ marginBottom: '20px' }}>
                                                <Checkbox value={item.value}> {item.name} </Checkbox>
                                            </Row> :
                                            <Row style={{ marginBottom: '20px' }}>
                                                <Checkbox checked={true} disabled={true} value={item.value}>
                                                    {item.name}
                                                </Checkbox>
                                                <Popover
                                                    className="habit-setting-tooltip"
                                                    content={
                                                        <div>
                                                            <div>包括：</div>
                                                            <div>1）未勾选中的类型，例如采购无形资产</div>
                                                            <div>2）不能归类为其他类型的采购类型</div>
                                                        </div>
                                                    }
                                                >
                                                    <Icon type="question" className="bovms-help-icon" />
                                                </Popover>
                                            </Row>
                                        )
                                    })
                                }
                            </Checkbox.Group>)}
                <span style={{ color: 'rgb(254, 148, 0)' }}>温馨提示：</span>
                {
                    module !== 'cg' ? <span>请勾选需要专门设置摘要的销售类型。</span> : <span>请勾选需要专门设置摘要的采购类型。</span>
                }
            </div>
        )
    }
}

export default Form.create({ name: "bovms_app_habit_setting" })(typeSetting);