import React, { useState, useEffect, useCallback, memo, Fragment } from 'react';
import { Modal, Input, Icon } from 'edf-component'
// import classNames from 'classnames'
// import { fetch } from 'edf-utils'
import SingleUpload from './SingleUpload.js'
import Spin from './Spin.js'




const ImportModalContent = memo((props) => {
    const step = ['一', '二', '三', '四', '五']
    // const [loading, setLoading] = useState(false)
    const [spinOption, setSpinOptin] = useState({})
    const [info, setInfo] = useState({ originalName: '' })

    // 模板导出
    const exportData = async (data) => {
        setSpinOptin({ loading: true, tip: '模版导出中......' })
        props.export && await props.export(data)
        setSpinOptin({ loading: false })

    }
    const onDone = useCallback((res) => {
        if (res) {
            setInfo(res)
        }
    }, [])

    const onBtnClick = async () => {
        if (info.originalName) {
            setSpinOptin({ loading: true, tip: '文件上传中......' })
            const res = props.import && await props.import(info)
            setSpinOptin({ loading: false })
            return !!res
        } else {
            return false
        }
    }

    useEffect(() => {
        props.setOkListener && props.setOkListener(onBtnClick)
    }, [info])

    const tip = props.tip || []

    return (
        <div className='ttk-stock-app-common-import-modal-content'>
            <p>业务提示</p>
            {   
                (tip).map((el, i) => {
                    if(i < tip.length - 1) {
                        const {doubleTemp, doubleTempData} = props
                        return (
                            <Fragment>
                                {
                                    (doubleTemp && !i) ?
                                    <p>
                                        第{step[i]}步：
                                        {tip[i][0]}
                                        <Icon type='export' className='p-icon-export' onClick={() => exportData(doubleTempData[0])} />
                                        {tip[i][1]}
                                        <Icon type='export' className='p-icon-export' onClick={() => exportData(doubleTempData[1])} />
                                    </p> :
                                    <p>
                                        第{step[i]}步：{el}
                                        {!i && <Icon type='export' className='p-icon-export' onClick={()=>exportData(Array.isArray(doubleTempData)?doubleTempData[0]:undefined)}></Icon>}
                                    </p>
                                }
                            </Fragment>
                        )
                    } else {
                        return <p><span className='warning-span'>温馨提示：</span>{el}</p>
                    }
                })
            }
            <div className='ttk-stock-app-common-import-modal-content-upload'>
                请选择文件：
                <Input value={info.originalName} readonly='readonly' addonAfter={
                    <SingleUpload onDone={onDone}></SingleUpload>
                }></Input>
            </div>
            <Spin loading={spinOption.loading} tip={spinOption.tip}></Spin>
        </div>
    )
})

export const onFileError = async ({ confirm, params }) => {
    const res = await Modal.confirm({
        okText: '下载',
        cancelText: '取消',
        width: 450,
        iconType: 'exclamation-circle',
        className: 'ttk-stock-app-common-import-modal-file-error-confirm',
        content: '导入文件中数据有误，请下载文件查看详情！'
    })

    if (res) {
        await confirm && confirm(params)
    }
    return res
}

export default async (props) => {
    const { title, width, ...other } = props

    const res = await Modal.show({
        title: props.title || '导入',
        width: props.width,
        className: 'ttk-stock-app-common-import-modal',
        children: <ImportModalContent {...other} />,
    })
    return res
}