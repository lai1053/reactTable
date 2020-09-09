import React, {memo, useState, useMemo} from 'react';
import {Modal, Button, Upload, Message} from 'edf-component'
import { fetch } from 'edf-utils'

export default memo((props) => {

    const [canUpload, setCanUpload] = useState(false)
    const [loading, setLoading] = useState(false)

    // 上传必须发送的token
    const getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {
            token
        }
    }

    // 文件改变触发的回调
    const uploadChange = (info) => {
        const file = info.file
        if (!file.status) return
        if (!canUpload) return
        if (file.status === 'done') {
            setCanUpload(false)
            setLoading(false)
            const response = file.response
            if (response.error && response.error.message) {
                Message.error(response.error.message)
            } else if (response.result && response.value) {
                props.onDone && props.onDone(response.value, info)
            }
        } else if (info.file.status === 'error') {
            Message.error('上传失败')
            setCanUpload(false)
            setLoading(false)
        }
    }
    // 上传文件前的回调
    const beforeUpload = async(file) => {
        let isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "MacIntel" && navigator.userAgent.toLowerCase().indexOf('chrome') < 0)
        if (!isWin) return
        let type = file.type ? file.type : 'application/vnd.ms-excel'
        let mode = file.name.substr(file.name.length - 4, 4)
        if (!(type == 'application/vnd.ms-excel'
            || type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mode.indexOf('xls') > -1)) {
            Modal.error({
                okText:'确定',
                content: props.typeErrorTip || '当前系统仅支持Excel格式（xls  xlsx），请检查后重新导入！'
            })
            return false
        }
        fileSizeJudge(file)       
    }
    // 校验文件大小
    const fileSizeJudge = async(file) => {
        const size = props.size || 3
        const isOverSize = file.size / 1024 / 1024 > size;
        if (file.size && isOverSize) {
            setCanUpload(false)
            Modal.info({
                title: '导入',
                okText: '确定',
                content: (
                    <div>导入文件过大，请分拆后再导入。</div>
                )
            })
            return false
        }
        setCanUpload(true)
        setLoading(true)
    }

    return useMemo(() => {
        return (
            <Upload 
                showUploadList={false}
                action='/v1/edf/file/upload'
                headers={getAccessToken()}
                onChange={uploadChange}
                beforeUpload={beforeUpload}
                accept='.xls, .xlsx'
                {...props}
            >
                {
                    props.children || 
                    <Button type='primary' style={{borderRadius: 0}} loading={loading}>选择文件</Button>
                }
            </Upload>
        )
    }, [loading])
})