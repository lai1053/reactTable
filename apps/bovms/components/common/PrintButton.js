import React, {memo, useState} from 'react'
import {Button, Modal} from 'edf-component'
const {Group} = Button

import PrintSetting from './PrintSetting'
import PrintPreview from './PrintPreview'
import {debounce} from './js/util'
import { fetch, environment } from 'edf-utils'
import {post, printPost} from './js/fetch'

export default memo((props) => {

    const [btnloading, setBtnLoading] = useState(false)

    const toPrintSetting = debounce(async () => {
        const res = await Modal.show({
            title: '打印设置',
            width: 700,
            footer: null,
            className: 'ttk-bovms-print-setting-modal',
            children: <PrintSetting {...props} />,
        })

        if(res && res.data) {
        }
    }, 500, true)

    const toPreview = async (url) => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if(modalWidth > 1920) { modalWidth = 1920 }

        await Modal.show({
            title: '打印预览',
            width: modalWidth,
            height: modalHeight,
            footer: null,
            style: { top: 25 },
            bodyStyle: {
                height: modalHeight - 47 + "px",
                // maxHeight: modalHeight - 102 + 'px',
                overflow: 'auto',
            },
            className: 'ttk-bovms-print-preview-modal',
            children: <PrintPreview url={url} />,
        })

        URL.revokeObjectURL(url)
    }

    const onPrint = debounce(async () => {
        let dataList
        props.dealData && (dataList = props.dealData())
        if(!dataList) { return }
        setBtnLoading(true)

        let browserType = environment.getBrowserVersion(),isClientMode = environment.isClientMode()
        if(isClientMode || browserType.ie || browserType.edge || browserType.wechat) {
            await printPost('/v1/biz/bovms/stock/print/printbovmsBillDataPdf', {
                dataList,
                codeType: props.params.codeType,
                // tempWindow: window.open()
            })
        } else {
            const blob = await post('/v1/biz/bovms/stock/print/printbovmsBillDataPdf', {
                dataList,
                codeType: props.params.codeType,
                blob: true
            })
            let url = URL.createObjectURL(blob)
            // toPreview(url)
            let win = window.open(url, '_blank')
            win.onload = () => {
                win.onbeforeunload = () => {
                    URL.revokeObjectURL(url)
                }
            }
        }

        setBtnLoading(false)
    }, 500, true)

    return (
        <Group className={props.className}>
            <Button onClick={onPrint} loading={btnloading}>打印</Button>
            <Button
                icon="setting"
                onClick={toPrintSetting}
            />
        </Group>
    )
})