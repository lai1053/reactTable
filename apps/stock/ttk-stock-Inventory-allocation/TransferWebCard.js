import React, { useEffect, useState } from "react"
import { Radio, Modal, DatePicker, Form } from "antd"
import moment from "moment"

function TransferWebCard({ form, ...props }) {
    const { webapi, metaAction } = props
    const importType = 2
    const [transferInfo, setTransferInfo] = useState({
        monthType: 1,
        rangeType: 1,
        enableMonth: null,
        hasError: false,
    })
    const { monthType, rangeType, enableMonth, hasError } = transferInfo
    const handleTransfer = async () => {
        let err = false
        form.validateFields((error, values) => {
            if (error) {
                err = true
            }
        })
        if (monthType === 2 && err) {
            return false
        }
        const period = (metaAction.context.get("currentOrg") || {}).periodDate
        const res = await webapi.operation.stockDataMigration({
            period: (monthType === 2 && enableMonth) || undefined,
            migrationType: importType,
            operator: sessionStorage["username"],
            type: rangeType,
            isReturnValue: true,
        })
        if (res && !res.result && res.error && res.error.message) {
            const msg = res.error.message.split("\\n")
            if (msg.length && res.error.code === "778899") {
                Modal.error({
                    title: <div>{msg[0]}</div>,
                    content: (
                        <React.Fragment>
                            {msg.slice(1).map((m, i) => (
                                <div key={i}>{m}</div>
                            ))}
                        </React.Fragment>
                    ),
                    okText: "知道了",
                })
            } else {
                metaAction.toast("error", res.error.message)
            }
            return true
        } else {
            return {
                needReload: true,
            }
        }
    }

    const handleMonthRadioChange = e => {
        const value = e.target.value
        setTransferInfo({
            ...transferInfo,
            rangeType: value === 1 ? 1 : 0,
            monthType: value,
            enableMonth: null,
            hasError: false,
        })
    }
    const handleRangeRadioChange = e => {
        const value = e.target.value
        setTransferInfo({
            ...transferInfo,
            rangeType: value,
        })
    }
    const handleMonthChange = (date, dateString) => {
        setTransferInfo({
            ...transferInfo,
            enableMonth: dateString,
            hasError: false,
        })
    }
    const disabledDate = current => {
        const startperiod = props.startPeriod
        return current < moment(startperiod)
    }
    useEffect(() => {
        props.setOkListener(handleTransfer)
    }, [monthType, rangeType, enableMonth, hasError])
    // console.log("transfer:", transferInfo)
    const radioStyle = {
        display: "block",
        height: "30px",
        lineHeight: "30px",
    }
    const rangeTypeOptions = [
        <Radio style={radioStyle} value={0} key={0}>
            存货期初
        </Radio>,
    ]
    if (monthType !== 2) {
        rangeTypeOptions.push(
            <Radio style={radioStyle} value={1} key={1}>
                存货期初+所有存货单据
            </Radio>
        )
    }

    return (
        <React.Fragment>
            <div className="title">
                <strong>数据来源：</strong>
            </div>
            <Radio.Group value={importType}>
                <Radio style={radioStyle} value={2}>
                    金财代账（web版）存货数据
                </Radio>
            </Radio.Group>
            <div style={{ marginLeft: 20 }}>
                <div className="title">
                    <strong>存货启用月份：</strong>
                </div>
                <Radio.Group onChange={handleMonthRadioChange} value={monthType}>
                    <Radio style={radioStyle} value={1}>
                        原系统存货启用月份
                    </Radio>
                    <Radio style={radioStyle} value={2}>
                        选择系统启用月份
                    </Radio>
                </Radio.Group>
                {monthType === 2 ? (
                    <Form.Item className="enable-month" label="启用月份">
                        {form.getFieldDecorator("enableMonth", {
                            rules: [{ required: true, message: "请选择存货启用月份" }],
                            initialValue: undefined,
                        })(
                            <DatePicker.MonthPicker
                                placeholder="请选择月份"
                                className={hasError ? "has-error" : ""}
                                disabledDate={disabledDate}
                                onChange={handleMonthChange}
                            />
                        )}
                    </Form.Item>
                ) : null}
                <div className="title">
                    <strong>迁移范围：</strong>
                </div>
                <Radio.Group onChange={handleRangeRadioChange} value={rangeType}>
                    {rangeTypeOptions}
                </Radio.Group>
            </div>
            <div className="tip">
                <span>温馨提示：</span>存货报表不迁移，迁移后存货报表按新系统规则重新计算！
            </div>
        </React.Fragment>
    )
}
export default Form.create()(TransferWebCard)
