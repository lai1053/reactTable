import React, { useEffect, useState } from "react"
import { Radio, Modal } from "antd"
export default function TransferCard(props) {
    const { webapi, metaAction } = props
    const migrationType = metaAction.gf("data.migrationType")
    const [importType, setImportType] = useState(migrationType)
    const handleTransfer = async () => {
        const period = (metaAction.context.get("currentOrg") || {}).periodDate
        const res = await webapi.operation.stockDataMigration({
            period,
            migrationType: importType,
            operator: sessionStorage["username"],
            isReturnValue: true
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
                    okText: "知道了"
                })
            } else {
                metaAction.toast("error", res.error.message)
            }
            return true
        } else {
            return {
                needReload: true
            }
        }
    }

    const handleRadioChange = e => {
        const value = e.target.value
        metaAction.sf("data.migrationType", value)
        setImportType(value)
    }
    useEffect(() => {
        props.setOkListener(handleTransfer)
    }, [])
    return (
        <React.Fragment>
            <div className="title">
                <strong>数据来源：</strong>
            </div>
            <Radio.Group onChange={handleRadioChange} value={importType}>
                <Radio value={1}>一键导入金财代账（客户端）存货数据</Radio>
            </Radio.Group>
            <div className="title">
                <span>温馨提示：</span>迁移范围：
            </div>
            <div className="li">1、存货核算方法</div>
            <div className="li">2、存货期初数据</div>
            <div className="li">3、所有存货单据</div>
        </React.Fragment>
    )
}
// <Radio value={2}>一键导入金财代账（web版）存货数据</Radio>
