import React, {useState, useEffect, memo, Fragment} from 'react';
import {Form, Button, Modal, Radio, DatePicker, Switch, Tooltip, Icon, Message, Input, Checkbox, Select} from 'edf-component'
import {InputNumber} from 'antd'
const {Item} = Form
const {Option} = Select

import { moment as momentUtil, fetch } from 'edf-utils'
import Spin from './Spin'
import {debounce} from './js/util'

export default memo((props) => {
    /*
        props: {
            printType: 0, // 0:单据  1:期初  2:报表
            params: {}, // 查询接口所需参数
            lrType,
            titleType,
        }
    */
    // 数据
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        "pageType":3,  // "纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5;"
        "maxLineNum":25, // "纸张模版,每版最大行数 32"
        "isLandscape":false, // "打印方向：横向=true,纵向=false"
        "contentTopPaddingInt":0, // "调整边距：上边距 0"
        "contentRightPaddingInt":12, // "调整边距：右边距 12"
        "contentBottomPaddingInt":0, // "调整边距：下边距 0"
        "contentLeftPaddingInt":12, // "调整边距：左边距 12"
        "contentFontSize":8,
        "headingFontSize":15,
        "printTime":false, // 显示=true，不显示=false"
        "printTimeType":1, // 当前操作时间=1，自定义=0
        "customPrintTime":"2020-07-20 17:10:37",
        "printCreator":true, // 显示打印制单人：显示=true，不显示=false
        "creatorType":2, // 制单人、制表人类型 原制单人=2,当前操作人=1,自定义=0
        "creator": "",
        "printVoucherCode":true,  // 显示打印凭证号：显示=true，不显示=false
        "accountName":"",
        "printAccountName":true, // 凭财务帐套(核算单位)：显示=true，不显示=false
        "printCustName":true, // 显示打印往来单位：显示=true，不显示=false
        "orgId": null,
        "userId": null
    })
    const [lineNum, setLineNum] = useState({
        1: 5,  // A4(3版)
        0: 10,  // A4(2版)
        3: 24,  // A4纸
        4: 10,  // A5
    })
    const [defaultForm, setDefaultForm] = useState({})

    const rowRangeA4 = [25, 26, 27, 28, 29, 30, 31, 32]
    const rowRangeA5 = [6, 7, 8, 9, 10, 11, 12, 13]
    const lrMax = props.lrType ? 20 : 12
    const titleMax = props.titleType ? 12 : 15

    // 方法

    // 确认与取消
    const handleConfirm = debounce(async () => {
        const data = {...form}
        data.maxLineNum = lineNum[data.pageType]

        if(!data.printCreator || data.creatorType) {
            data.creator = defaultForm.creator
        } else {
            if(!data.creator) {
                Message.error('请输入制单人')
                return
            }
        }
        if(!data.printTime || data.printTimeType) {
            data.customPrintTime = defaultForm.customPrintTime
        }

        setLoading(true)
        await fetch.post('/v1/biz/stock/print/param/config/addbovmsPrintParamConfig', data)
        setLoading(false)
        
        Message.success('设置成功')

        props.closeModal({ data })
    }, 500, true)

    const handleCancel = () => {
        props.closeModal()
    }

    // 初始化数据
    const initData = async () => {
        setLoading(true)
        const res = await fetch.post('/v1/biz/stock/print/param/config/queryInitbovmsPrintParam', props.params)
        setLoading(false)
        setForm(res)
        setDefaultForm(res)
        setLineNum({
            ...lineNum,
            [res.pageType]: res.maxLineNum
        })
    }

    // 设置区间选择范围
    const disabledDate = (date) => {
        let enabledDate = momentUtil.stringToMoment(props.motime || '2019-01')
        return date < enabledDate
    }

    // 更改日期
    const dateChange = (e) => {
        setForm({
            ...form,
            customPrintTime: momentUtil.momentToString(e, 'YYYY-MM-DD HH:mm:ss')
        })
    }

    // 更改单选
    const radioChange = async (e) => {
        const {value, name} = e.target
        if(name == 'isLandscape') { // 打印方向
            value ? form.pageType = 4 : form.pageType = 3
            form.headingFontSize = 15
        }
        if(name == 'pageType') { // 模板
            value == 1 ? form.headingFontSize = 12 : form.headingFontSize = 15
        }
        setForm({
            ...form,
            [name]: value
        })
    }

    const checkboxChange = (e) => {
        const {checked, name} = e.target
        setForm({
            ...form,
            [name]: checked
        })
    }

    const selectChange = (e, path) => {
        setLineNum({
            ...lineNum,
            [path]: e
        })
    }

    const inputChange = (e, path) => {
        if(path) {
            setForm({
                ...form,
                [path]: e
            })
        } else {
            const {value, name} = e.target
            setForm({
                ...form,
                [name]: value
            })
        }
    }


    // 生命周期
    useEffect(() => {
        initData()
    }, [])

    return (
        <Fragment>
            <Spin loading={loading}></Spin>
            <Form className='bovms-print-setting-content'>

                <Item label='打印方向'>
                    <Radio.Group value={form.isLandscape} onChange={radioChange} name='isLandscape'>
                        {props.printType != 2 && <Radio value={false}>纵向</Radio>}
                        {props.printType != 1 && <Radio value={true}>横向</Radio>}
                    </Radio.Group>
                </Item>

                <Item label='纸张模板' className='bovms-print-setting-content-item2'>
                    {
                        !props.printType ?
                        <Radio.Group value={form.pageType} onChange={radioChange} name='pageType'>
                            {
                            !form.isLandscape ?
                            <Fragment>
                            <div>
                                <Radio value={3}>A4一版(210*297毫米)</Radio>
                                <span>
                                    每版行数：
                                    <Select style={{width: '100px'}} onChange={e => selectChange(e, '3')} disabled={true || form.pageType != 3} value={form.pageType != 3 ? '' : lineNum['3']}>
                                        {
                                            rowRangeA4.map(el => <Option value={el} key={el}>{el}</Option>)
                                        }
                                    </Select>
                                </span>
                            </div>
                                
                            <div>
                                <Radio value={0}>A4二版(210*297毫米)</Radio>
                                <span>
                                    每版行数：
                                    <Select style={{width: '100px'}} onChange={e => selectChange(e, '0')} disabled={true || form.pageType != 0} value={form.pageType != 0 ? '' : lineNum['0']}>
                                        {
                                            rowRangeA5.map(el => <Option value={el} key={el}>{el}</Option>)
                                        }
                                    </Select>
                                </span>
                            </div>

                            <div>
                                <Radio value={1}>A4三版(210*297毫米)</Radio>
                            </div>
                            </Fragment> :
                            <div>
                                <Radio value={4}>A5(148*210毫米)</Radio>
                                <span>
                                    每版行数：
                                    <Select style={{width: '100px'}} onChange={e => selectChange(e, '4')} disabled={true || form.pageType != 4} value={form.pageType != 4 ? '' : lineNum['4']}>
                                        {
                                            rowRangeA5.map(el => <Option value={el} key={el}>{el}</Option>)
                                        }
                                    </Select>
                                </span>
                            </div>
                            }
                        </Radio.Group> :
                        <Radio.Group value={form.pageType} onChange={radioChange} name='pageType' value={lineNum['3']}>
                            <Radio value={3}>A4(210*297毫米)</Radio>
                        </Radio.Group>
                    }
                </Item>

                

                <Item label='边距调整'>
                    <div>
                        <span className='item3-span-l'>
                            左：<InputNumber style={{width: '100px'}} disabled value={form.contentLeftPaddingInt} name='contentLeftPaddingInt' onChange={e => inputChange(e, 'contentLeftPaddingInt')} precision={0} min={0} max={lrMax} /> 毫米
                        </span>
                        <span className='item3-span-r'>
                            右：<InputNumber style={{width: '100px'}} disabled value={form.contentRightPaddingInt} name='contentRightPaddingInt' onChange={e => inputChange(e, 'contentRightPaddingInt')} precision={0} min={0} max={lrMax} /> 毫米
                        </span>
                    </div>
                    {
                        props.printType &&
                        <div>
                            <span className='item3-span-l'>
                                上：<InputNumber style={{width: '100px'}} disabled value={form.contentTopPaddingInt} name='contentTopPaddingInt' onChange={e => inputChange(e, 'contentTopPaddingInt')} precision={0} min={0} max={30} /> 毫米
                            </span>
                            <span className='item3-span-r'>
                                下：<InputNumber style={{width: '100px'}} disabled value={form.contentBottomPaddingInt} name='contentBottomPaddingInt' onChange={e => inputChange(e, 'contentBottomPaddingInt')} precision={0} min={0} max={30} /> 毫米
                            </span>
                        </div>
                    }
                </Item>

                <Item label='字号调整' className='bovms-print-setting-content-item4'>
                    <span className='item4-span'>
                        标题：<InputNumber style={{width: '100px'}} disabled value={form.headingFontSize} name='headingFontSize' onChange={e => inputChange(e, 'headingFontSize')} precision={0} min={8} max={titleMax} />
                    </span>
                    <span className='item4-span-r'>
                        表格内容：<InputNumber style={{width: '100px'}} disabled value={form.contentFontSize} name='contentFontSize' onChange={e => inputChange(e, 'contentFontSize')} precision={0} min={6} max={10} />
                    </span>
                </Item>

                <Item>
                    <Checkbox checked={form.printCreator} onChange={checkboxChange} name='printCreator'>打印制单人</Checkbox>
                    <Radio.Group value={form.creatorType} onChange={radioChange} name='creatorType' disabled={!form.printCreator}>
                        <Radio value={2}>原制单人</Radio>
                        <Radio value={1}>当前操作人</Radio>
                        <Radio value={0}>
                            自定义&nbsp;
                            <Input value={(!form.printCreator || form.creatorType) ? '' : form.creator} name='creator' onChange={inputChange} style={{width: '100px'}} disabled={!form.printCreator || form.creatorType} maxLength={20} />
                        </Radio>
                    </Radio.Group>
                </Item>

                <Item>
                    <Checkbox checked={form.printTime} name='printTime' onChange={checkboxChange}>显示打印时间</Checkbox>
                    <Radio.Group value={form.printTimeType} onChange={radioChange} name='printTimeType' disabled={!form.printTime}>
                        <Radio value={1}>当前操作时间</Radio>
                        <Radio value={0}>
                            自定义&nbsp;
                            <DatePicker
                                format="YYYY-MM-DD HH:mm:ss"
                                showTime
                                style={{width: '170px'}}
                                value={(!form.printTime || form.printTimeType) ? null : momentUtil.stringToMoment(form.customPrintTime)}
                                onChange={dateChange}
                                disabled={!form.printTime || form.printTimeType}
                            />
                        </Radio>
                    </Radio.Group>
                </Item>

                {
                    !props.printType &&
                    <Fragment>
                        <Item>
                            <Checkbox checked={form.printVoucherCode} name='printVoucherCode' onChange={checkboxChange}>打印凭证号</Checkbox>
                        </Item>
                        <Item>
                            <Checkbox checked={form.printAccountName} name='printAccountName' onChange={checkboxChange}>打印账套名称</Checkbox>
                        </Item>
                    </Fragment>
                }

                <div className='blank'></div>
            </Form>
            <div className='bovms-print-setting-footer'>
                <span className='bovms-print-setting-footer-tip'>温馨提示：<span>为了保证您正常打印，请预先下载Adobe PDF阅读器</span></span>
                <Button className='bovms-print-setting-footer-confirm' type='primary' onClick={handleConfirm}>确定</Button>
                <Button className='bovms-print-setting-footer-cancel' onClick={handleCancel}>取消</Button>
            </div>
        </Fragment>
    )
})