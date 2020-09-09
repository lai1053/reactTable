import React, { memo, useState } from "react"
import { Button, Modal, Toast } from "edf-component"
const { Group } = Button

import PrintSetting from "./PrintSetting"
import PrintPreview from "./PrintPreview"
import { debounce } from "./js/util"
import { fetch, environment } from "edf-utils"
import { post, printPost } from "./js/fetch"
const getApiUrl = codeType => {
    switch (codeType) {
        case "RKHZ": //入库汇总表
            return "/v1/biz/bovms/stock/report/insummary/print"
        case "ZGHZ": //暂估汇总表
            return "/v1/biz/bovms/stock/report/zgsummary/print"
        case "CKHZ": //出库汇总表
            return "/v1/biz/bovms/stock/report/outsummary/print"
        case "SCCBJS": //生产成本计算表
            return "/v1/biz/bovms/stock/report/cost/print"
        case "XSMLFX": //销售毛利分析表
            return "/v1/biz/bovms/stock/report/profit/print"
        case "SFCMX": //收发存明细表
            return "/v1/biz/bovms/stock/report/detail/print"
        case "SFCHZ": //收发存汇总表
            return "/v1/biz/bovms/stock/report/collect/print"
        case "ZGMX": //暂估明细表
            return "/v1/biz/bovms/stock/report/zgdetail/print"
        case "XSHZ": //销售汇总表
            return "/v1/biz/bovms/stock/carrymainsheet/print"
        default:
            return "/v1/biz/bovms/stock/print/printStockBillDataPdf"
    }
}
const getPrintTitle = codeType => {
    switch (codeType) {
        case "RKHZ":
            return "入库汇总表"
        case "ZGHZ":
            return "暂估汇总表"
        case "CKHZ":
            return "出库汇总表"
        case "SCCBJS":
            return "生产成本计算表"
        case "XSMLFX":
            return "销售毛利分析表"
        case "SFCMX":
            return "收发存明细表"
        case "SFCHZ":
            return "收发存汇总表"
        case "ZGMX":
            return "暂估明细表"
        case "XSHZ":
            return "销售出库汇总表"
        case "XSCB":
            return "销售出库单"
        case "XSCK":
            return "销售收入单"
        case "CGRK":
            return "采购入库"
        case "QTCRK":
            return "其他出入库"
        case "WGRK":
            return "完工入库单"
        case "SCLL":
            return "生产领料单"
        case "ZGRK":
            return "暂估入库单"
        case "ZGHC":
            return "暂估冲回单"
        default:
            return "出入库单据"
    }
}
export default memo(props => {
    const [btnloading, setBtnLoading] = useState(false)

    const toPrintSetting = debounce(
        async () => {
            const res = await Modal.show({
                title: "打印设置",
                width: 700,
                footer: null,
                className: "ttk-stock-print-setting-modal",
                children: <PrintSetting {...props} />,
            })

            if (res && res.data) {
            }
        },
        500,
        true
    )

    const toPreview = async url => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) {
            modalWidth = 1920
        }

        await Modal.show({
            title: "打印预览",
            width: modalWidth,
            height: modalHeight,
            footer: null,
            style: { top: 25 },
            bodyStyle: {
                height: modalHeight - 47 + "px",
                // maxHeight: modalHeight - 102 + 'px',
                overflow: "auto",
            },
            className: "ttk-stock-print-preview-modal",
            children: <PrintPreview url={url} />,
        })

        URL.revokeObjectURL(url)
    }
    const onPrint = async () => {
        const printType = props.printType //0:单据  1:期初  2:报表
        const codeType = props.params.codeType
        let dataList
        props.dealData && (dataList = props.dealData())
        if (printType !== 2 && !dataList) {
            return
        }
        if (printType == 2 && props.disabled) {
            return await Toast.error("暂无可打印的数据")
        }
        setBtnLoading(true)

        let browserType = environment.getBrowserVersion(),
            isClientMode = environment.isClientMode()

        if (isClientMode || browserType.ie || browserType.edge || browserType.wechat) {
            printType !== 2
                ? await printPost("/v1/biz/bovms/stock/print/printStockBillDataPdf", {
                      dataList,
                      codeType,
                      // tempWindow: window.open()
                  })
                : await props.onPrint()
        } else {
            const options =
                printType !== 2
                    ? {
                          dataList,
                          codeType,
                          blob: true,
                      }
                    : { ...props.getSearchParams(), blob: true }
            const blob = await post(getApiUrl(codeType), options)
            let url = URL.createObjectURL(blob)
            // toPreview(url)
            let win = window.open(url, "_blank")
            win.onload = () => {
                setTimeout(() => {
                    win.document.title = getPrintTitle(codeType)
                }, 1000)
                win.onbeforeunload = () => {
                    URL.revokeObjectURL(url)
                }
            }
        }

        setBtnLoading(false)
    }
    const debounceOnPrint = debounce(onPrint, 500, true)

    return (
        <Group className={props.className}>
            <Button onClick={debounceOnPrint} loading={btnloading}>
                打印
            </Button>
            <Button icon="setting" onClick={toPrintSetting} />
        </Group>
    )
})
