import React from "react"
import { DatePicker, Checkbox, Tooltip, Icon, Button, Switch } from "antd"
import moment from "moment"
const CheckboxGroup = Checkbox.Group

const plainOptions = [
    "增值税专用发票",
    "机动车销售发票",
    "增值税普通发票",
    "通行费发票",
    "其他发票"
]
const plainKeys = [
    "wrzKpyf01",
    "wrzKpyf03",
    "wrzKpyf04",
    "wrzKpyf17",
    "wrzKpyf00"
]
const xgmOptions = [
    "增值税普通发票",
    "机动车销售发票",
    "通行费发票",
    "其他发票"
]
const defaultCheckedList = []

class StepOne extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            checkedList: defaultCheckedList,
            certifiedInvoice: true,
            indeterminate: false,
            checkAll: false,
            hideCategory: 1
        }
    }

    componentWillMount() {
        this.queryMemTakeInvoice().then(res => {
            if (res && res.isMemory) {
                if (this.props.module === "cg") {
                    let checkedList = Object.values(
                        JSON.parse(res.rangeJson)
                    ).map(e => plainOptions[plainKeys.indexOf(e)])
                    this.onCheckboxGroupChange(checkedList, res.hideCategory)
                } else {
                    this.setState({ hideCategory: res.hideCategory })
                }
            } else {
                //初始小规模默认值
                if (this.props.nsrxz) {
                    this.setState({
                        checkedList: ["增值税普通发票", "机动车销售发票"]
                    })
                }
            }
        })
    }

    async queryMemTakeInvoice() {
        const fn =
            this.props.module === "cg"
                ? "queryMemTakeInvoice"
                : "querySaleMemTakeInvoice"
        let res = await this.props.webapi.bovms[fn]()
        return Promise.resolve(res)
    }

    disabledStartDate = startValue => {
        return startValue.valueOf() > new Date(this.props.date).valueOf()
    }
    onCheckboxGroupChange = (checkedList, hideCategory) => {
        hideCategory =
            hideCategory !== undefined ? hideCategory : this.state.hideCategory
        this.setState({
            checkedList,
            indeterminate:
                !!checkedList.length &&
                checkedList.length < plainOptions.length,
            checkAll: checkedList.length === plainOptions.length,
            hideCategory
        })
    }
    //已认证发票checked change
    onCertifiedInvoiceChange(e) {
        this.setState({
            certifiedInvoice: e.target.checked
        })
    }
    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked ? plainOptions : [],
            indeterminate: false,
            checkAll: e.target.checked
        })
    }
    //下一步
    onNext() {
        let obj = {}
        let { nsrxz, module } = this.props
        let { checkedList, hideCategory } = this.state

        //销项
        if (module === "xs") {
            let params = {
                yearPeriod: moment(this.props.date).format("YYYYMM"),
                hideCategory
            }
            this.props.onNext(params)
            return
        }

        //如果是小规模 过滤掉增值税专用发票
        if (nsrxz) {
            checkedList = checkedList.filter(f => f != "增值税专用发票")
        }
        checkedList.map(e => {
            obj[plainKeys[plainOptions.indexOf(e)]] = this.refs[
                e
            ].picker.input.defaultValue.replace(/-/, "")
        })

        obj.yearPeriod = moment(this.props.date).format("YYYYMM")
        let data = {
            yearPeriod: "",
            wrzKpyf01: "",
            wrzKpyf03: "",
            wrzKpyf04: "",
            wrzKpyf17: "",
            wrzKpyf00: ""
        }
        let params = Object.assign(data, obj, { hideCategory })

        if (nsrxz) {
            delete data.wrzKpyf01
            //判断未填
            if (
                params.wrzKpyf00 == "" &&
                params.wrzKpyf03 == "" &&
                params.wrzKpyf04 == "" &&
                params.wrzKpyf17 == ""
            ) {
                this.props.metaAction.toast("error", "请至少选中一项")
                return false
            }
        }

        this.props.onNext(params)
    }
    handleHideCategory(checked) {
        this.setState({ hideCategory: checked ? 1 : 0 })
    }
    render() {
        const { nsrxz, date, module } = this.props
        const {
            checkedList,
            certifiedInvoice,
            indeterminate,
            checkAll,
            hideCategory
        } = this.state
        const categorySwitch = (
            <React.Fragment>
                <div className="bovms-app-guidePage-invoce-range-popup-checkebox empty"></div>
                <div className="bovms-app-guidePage-invoce-range-popup-checkebox-section" style={module === 'xs'?{paddingBottom:'330px'}:{}}>
                    隐藏商品或服务名称中的&nbsp;&nbsp;*品类*
                    <Switch
                        style={{ marginLeft: 8, marginRight: 8 }}
                        checkedChildren="开"
                        unCheckedChildren="关"
                        checked={hideCategory}
                        onChange={::this.handleHideCategory}
                    ></Switch>
                    <Tooltip
                        className="bovms-app-guidePage-invoce-range-tooltip"
                        title={
                            <React.Fragment>
                                <div>开启时，系统自动隐藏商品名称的品类。</div>
                                <div>
                                    例如：【*电子元件*二极管】将显示为【二极管】
                                </div>
                            </React.Fragment>
                        }
                        overlayStyle={{ maxWidth: 380 }}
                    >
                        <Icon type="question" className="bovms-help-icon" />
                    </Tooltip>
                </div>
            </React.Fragment>
        )
        //销项返回
        if (module === "xs") {
            return (
                <div className="bovms-app-guidePage-range-step-one">
                    <div className="bovms-app-guidePage-popup-content">
                        <div
                            style={{
                                marginBottom: "16px",
                                marginTop: "16px",
                                // height: "350px"
                            }}
                        >
                            <div className="bovms-app-guidePage-invoce-range-popup-checkebox">
                                <Checkbox
                                    onChange={this.onCertifiedInvoiceChange.bind(
                                        this
                                    )}
                                    checked={certifiedInvoice}
                                    disabled="false"
                                >
                                    <strong>已开具发票</strong>
                                </Checkbox>
                            </div>
                            <div className="bovms-app-guidePage-invoce-range-popup-checkebox-section">
                                <span
                                    style={{
                                        marginRight: "96px",
                                        paddingLeft: "8px"
                                    }}
                                >
                                    <Checkbox
                                        onChange={this.onCertifiedInvoiceChange.bind(
                                            this
                                        )}
                                        checked={certifiedInvoice}
                                        disabled="false"
                                    >
                                        <strong>所有类型</strong>
                                    </Checkbox>
                                    <Tooltip
                                        className="bovms-app-guidePage-invoce-range-tooltip"
                                        title="增值税专用发票、机动车销售发票、增值税普通发票、二手车统一销售发票"
                                    >
                                        <Icon
                                            type="question"
                                            className="bovms-help-icon"
                                        />
                                    </Tooltip>
                                </span>
                                <span style={{ marginLeft: "10px" }}>
                                    开票月份：
                                </span>
                                <DatePicker.MonthPicker value={date} disabled />
                            </div>
                        </div>
                        {categorySwitch}
                    </div>
                    <div className="bovms-app-actions-footer">
                        <div class="bovms-app-actions-footer-tip">
                            <span>温馨提示：</span>从发票模块获取发票，生成单据
                        </div>
                        <div>
                            <Button
                                type="primary"
                                onClick={this.onNext.bind(this)}
                            >
                                下一步
                            </Button>
                            <Button
                                onClick={() => {
                                    this.props.onCancel()
                                }}
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
        //进项返回
        return (
            <div className="bovms-app-guidePage-range-step-one">
                <div className="bovms-app-guidePage-popup-content">
                    {/*取票范围*/}
                    {nsrxz ? (
                        <div
                            className="bovms-app-guidePage-invoce-range-popup-checkebox-section"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                marginTop: "16px"
                            }}
                        >
                            <CheckboxGroup
                                options={xgmOptions}
                                value={checkedList}
                                onChange={this.onCheckboxGroupChange}
                                style={{ marginRight: "76px" }}
                            />
                            <div>
                                {xgmOptions.map((e, index, arr) => {
                                    return (
                                        <div>
                                            {arr.length == index + 1 && (
                                                <div
                                                    className="bovms-app-guidePage-invoce-range-tooltip"
                                                    style={{
                                                        marginLeft: "-120px",
                                                        marginTop: "14px",
                                                        position: "absolute"
                                                    }}
                                                >
                                                    <Tooltip
                                                        title="发票类型：增值税专用发票、农产品销售（收购）发票、旅客运输服务抵扣凭证、二手车销售发票"
                                                        placement="topLeft"
                                                    >
                                                        <Icon
                                                            type="question"
                                                            className="bovms-help-icon"
                                                        />
                                                    </Tooltip>
                                                </div>
                                            )}
                                            <div style={{ padding: "10px 0" }}>
                                                <span>开票月份：</span>
                                                <DatePicker.MonthPicker
                                                    defaultValue={date}
                                                    ref={e}
                                                    disabledDate={
                                                        this.disabledStartDate
                                                    }
                                                    disabled={
                                                        checkedList.includes(e)
                                                            ? false
                                                            : true
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div
                                style={{
                                    marginBottom: "16px",
                                    marginTop: "16px"
                                }}
                            >
                                <div className="bovms-app-guidePage-invoce-range-popup-checkebox">
                                    <Checkbox
                                        onChange={this.onCertifiedInvoiceChange.bind(
                                            this
                                        )}
                                        checked={certifiedInvoice}
                                        disabled="false"
                                    >
                                        <strong>已认证发票</strong>
                                    </Checkbox>
                                </div>
                                <div className="bovms-app-guidePage-invoce-range-popup-checkebox-section">
                                    <span
                                        style={{
                                            marginRight: "96px",
                                            paddingLeft: "8px"
                                        }}
                                    >
                                        <Checkbox
                                            onChange={this.onCertifiedInvoiceChange.bind(
                                                this
                                            )}
                                            checked={certifiedInvoice}
                                            disabled="false"
                                        >
                                            <strong>所有类型</strong>
                                        </Checkbox>
                                        <Tooltip
                                            className="bovms-app-guidePage-invoce-range-tooltip"
                                            title="发票类型：增值税专用发票、机动车销售发票、通行费发票、农产品销售（收购）发票、旅客运输服务抵扣凭证"
                                        >
                                            <Icon
                                                type="question"
                                                className="bovms-help-icon"
                                            />
                                        </Tooltip>
                                    </span>
                                    <span style={{ marginLeft: "10px" }}>
                                        抵扣月份：
                                    </span>
                                    <DatePicker.MonthPicker
                                        value={date}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="bovms-app-guidePage-invoce-range-popup-checkebox">
                                <Checkbox
                                    indeterminate={indeterminate}
                                    onChange={this.onCheckAllChange}
                                    checked={checkAll}
                                >
                                    <strong>未认证发票</strong>
                                </Checkbox>
                            </div>
                            <div
                                className="bovms-app-guidePage-invoce-range-popup-checkebox-section"
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "flex-start"
                                }}
                            >
                                <div class="bovms-app-guidePage-invoce-range-popup-checkebox-section-checkgroup">
                                    <Tooltip
                                        className="bovms-app-guidePage-invoce-range-popup-checkebox-section-checkgroup-tooltip"
                                        title="发票类型：农产品销售（收购）发票、旅客运输服务抵扣凭证、二手车销售发票"
                                    >
                                        <Icon
                                            type="question"
                                            className="bovms-help-icon"
                                        />
                                    </Tooltip>
                                    <CheckboxGroup
                                        options={plainOptions}
                                        value={checkedList}
                                        onChange={this.onCheckboxGroupChange}
                                        style={{ marginRight: "76px" }}
                                    />
                                </div>
                                <div>
                                    {plainOptions.map((e, index, arr) => {
                                        return (
                                            <div>
                                                <div
                                                    style={{
                                                        padding: "10px 0"
                                                    }}
                                                >
                                                    <span>开票月份：</span>
                                                    <DatePicker.MonthPicker
                                                        defaultValue={date}
                                                        disabledDate={
                                                            this
                                                                .disabledStartDate
                                                        }
                                                        ref={e}
                                                        disabled={
                                                            checkedList.includes(
                                                                e
                                                            )
                                                                ? false
                                                                : true
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {categorySwitch}
                </div>
                <div className="bovms-app-actions-footer">
                    <div class="bovms-app-actions-footer-tip">
                        <span>温馨提示：</span>
                        请选择要从发票采集模块获取的发票范围
                    </div>
                    <div>
                        <Button type="primary" onClick={this.onNext.bind(this)}>
                            下一步
                        </Button>
                        <Button
                            onClick={() => {
                                this.props.onCancel()
                            }}
                        >
                            取消
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}

export default StepOne
