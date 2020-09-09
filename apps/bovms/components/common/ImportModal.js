import React, { useState, useEffect, useCallback, memo, Fragment } from 'react';
import { Modal, Input, Icon, Radio, Tooltip, Message } from 'edf-component'
// import classNames from 'classnames'
// import { fetch } from 'edf-utils'
import SingleUpload from './SingleUpload.js'
import Spin from './Spin.js'


const ImportModalContent = memo((props) => {
    const step = ['一', '二', '三', '四', '五']
    // const [loading, setLoading] = useState(false)
    const [spinOption, setSpinOptin] = useState({})
    const [info, setInfo] = useState({ originalName: '' })
    const [type, setType] = useState(1)

    const radioChange = (e) => {
        setType(e.target.value)
    }

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
            Message.error('请选择要导入的文件')
            return false
        }
    }

    useEffect(() => {
        props.setOkListener && props.setOkListener(onBtnClick)
    }, [info])

    const tip = props.tip || []

    return (
        <div className='ttk-bovms-app-common-import-modal-content'>
            {/* <p>业务提示</p>
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
            } */}
            <p>1、选择范围并导出发票</p>
            <div className='ttk-bovms-app-common-import-modal-content-download'>
                <Radio.Group onChange={radioChange} value={type}>
                    <Radio value={1}>本期入账+待选择</Radio>
                    <Radio value={2}>本期入账</Radio>
                </Radio.Group>
                <span className='img' onClick={() => exportData()}></span>
            </div>
            <p>
                2、修改后导入，完成内容替换
                <Tooltip title={
                    <Fragment>
                        <p>1、导入的发票将被设置为本期入账</p>
                        <p>2、有对应发票号码的将替换商品或服务名称、规格型号、单位、数量、单价、金额、税额、价税合计</p>
                        <p style={{margin: 0}}>3、无对应发票号码不能导入</p>
                    </Fragment>
                }
                    placement='bottom' overlayClassName='helpIcon-tooltip'
                >
                    <Icon type='bangzhutishi' fontFamily='edficon' className='helpIcon'></Icon>
                </Tooltip>
            </p>
            <div className='ttk-bovms-app-common-import-modal-content-upload'>
                <Input value={info.originalName} readonly='readonly' addonAfter={
                    <SingleUpload onDone={onDone}></SingleUpload>
                }></Input>
            </div>
            <Spin loading={spinOption.loading} tip={spinOption.tip}></Spin>
        </div>
    )
})

export const onFileError = async ({ confirm, params }) => {
    const res = await Modal.show({
        okText: '下载失败文件',
        cancelText: '取消',
        width: 350,
        // iconType: 'exclamation-circle',
        className: 'ttk-bovms-app-common-import-modal-file-error-confirm',
        title: (
            <Fragment>
                <Icon type='exclamation-circle'  style={{margin: '0 10px 0 20px'}}></Icon>
                <span>导入失败</span>
            </Fragment>
        ),
        children: (
            <div style={{marginLeft: '20px'}}>
                <p>文件数据存在问题</p>
                <p style={{margin: 0}}>请下载失败文件，按提示修改后再次导入！</p>
            </div>
        )
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
        width: props.width || 450,
        okText: '导入',
        className: 'ttk-bovms-app-common-import-modal',
        children: <ImportModalContent {...other} />,
    })
    return res
}