import React from "react"
import { Radio } from "antd"

class HabitSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: null,
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.store = props.store
        if (props.setOkListener) {
            props.setOkListener(::this.onOk)
        }
    }
    componentDidMount() {
        this.initPage()
    }
    async onOk() {
        let { value } = this.state
        let params = {
            module: this.props.module,
            stockRule: {
                merge: value,
            },
            isReturnValue: true,
        }
        let res = await this.webapi.api.updateVoucherRuleByModule(params)
        if (res && res.error) {
            this.metaAction.toast("error", res.error.message)
            return false
        }
        this.metaAction.toast("success", "设置成功")
    }
    async initPage() {
        let res = await this.webapi.api.getVoucherRule({ module: this.props.module })
        this.setState({
            value: res.stockRule.merge,
            params: res,
        })
    }
    onChange = e => {
        this.setState({
            value: e.target.value,
        })
    }
    render() {
        return (
            <Radio.Group
                className="orther-storage-habit"
                style={{ padding: "16px" }}
                onChange={this.onChange}
                value={this.state.value}>
                <Radio
                    className="orther-storage-habit-op"
                    style={{ display: "block", marginBottom: "12px" }}
                    key={"1"}
                    value={"1"}>
                    {this.props.module === "other"
                        ? "同业务类型合并一张凭证"
                        : "选中单据合并一张凭证"}
                </Radio>
                <Radio
                    className="orther-storage-habit-op"
                    style={{ display: "block" }}
                    key={"0"}
                    value={"0"}>
                    一张单据一张凭证
                </Radio>
            </Radio.Group>
        )
    }
}

export default HabitSetting
