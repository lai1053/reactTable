import React from "react"
import { Spin, Input } from "antd"
class invRedDetail extends React.Component {
    constructor(props) {
        super(props)
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.state = {
            loading: false,
            fpdm: props.data.gfHcfpdm,
            fphm: props.data.gfHcfphm,
            fpzlDm: props.data.fpzlDm,
            oldFpdm: props.data.gfHcfpdm,
            oldFphm: props.data.gfHcfphm,
            fpzl: props.data.fpzl,
            justShow: props.data.justShow,
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onOk = async () => {
        const { fpdm, fphm, fpzlDm, oldFpdm, oldFphm, fpzl } = this.state
        if (!fpdm) {
            this.metaAction.toast("error", "发票代码不能为空")
            return false
        } else if (fpdm.length !== 10 && fpzlDm === "01") {
            this.metaAction.toast("error", "发票代码长度应为10个字符")
            return false
        } else if (fpdm.length !== 10 && fpdm.length !== 12 && fpzlDm !== "01") {
            this.metaAction.toast("error", "发票代码长度应为10或12个字符")
            return false
        }
        if (!fphm) {
            this.metaAction.toast("error", "发票号码不能为空")
            return false
        } else if (fphm.length !== 8) {
            this.metaAction.toast("error", "发票号码长度应为8个字符")
            return false
        }

        let res = await this.metaAction.modal("confirm", {
            okText: "确定",
            content: "确定带入当前明细清单吗？",
        })
        if (res === true) {
            let redData
            console.log(fpzl)
            if (fpzl === "xxfp") {
                redData = await this.webapi.invoices.querXxfpByFphmAndFpdm({ fpdm, fphm, fpzlDm })
            } else {
                redData = await this.webapi.invoices.queryJxfpByFphmAndFpdm({ fpdm, fphm, fpzlDm })
            }
            if (typeof redData === "object") {
                redData.gfHcfpdm = this.state.fpdm
                redData.gfHcfphm = this.state.fphm
                return this.dataDeal(redData)
            } else {
                return false
            }
        } else {
            return false
        }
    }
    //数据处理
    dataDeal = data => {
        data.mxDetailList.forEach(item => {
            if (item.sl > 0 || item.je > 0 || item.se > 0) {
                if (item.sl > 0) item.sl = -item.sl
                item.je = -item.je
                item.se = -item.se
            }
            if (item.sl === null || item.sl === "0") item.sl = undefined
            if (item.dj === null || item.dj === "0") item.dj = undefined
        })
        data.hjje = -data.hjje
        data.hjse = -data.hjse
        data.jshj = -data.jshj
        data.jshjDx = `负${data.jshjDx}`

        return data
    }

    handleInputChangeD = e => {
        this.setState({
            fpdm: e.target.value,
        })
    }
    handleInputChangeH = e => {
        this.setState({
            fphm: e.target.value,
        })
    }
    render() {
        return (
            <Spin spinning={this.state.loading} tip={`正在处理数据，请稍后…`}>
                <div className="content">
                    <p>
                        {" "}
                        <label className="label">发票代码：</label>{" "}
                        <Input
                            disabled={this.state.justShow}
                            style={{ width: "280px" }}
                            value={this.state.fpdm}
                            maxLength={12}
                            placeholder="请输入发票代码"
                            onChange={this.handleInputChangeD}></Input>
                    </p>
                    <p>
                        {" "}
                        <label className="label">发票号码：</label>{" "}
                        <Input
                            disabled={this.state.justShow}
                            style={{ width: "280px" }}
                            value={this.state.fphm}
                            maxLength={8}
                            placeholder="请输入发票号码"
                            onChange={this.handleInputChangeH}></Input>
                    </p>
                    <div className="container">
                        {" "}
                        <label className="label">
                            {" "}
                            <span style={{ color: "orange" }}>温馨提示： </span>
                        </label>
                        <span className="tip">
                            请录入正确的原正数发票信息，点击【确定】，将带入原正数发票明细清单，确认无误后，请点击发票界面的【保存】。
                        </span>
                    </div>
                </div>
            </Spin>
        )
    }
}

export default invRedDetail
