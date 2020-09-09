import React, { useState, useEffect, memo, Fragment } from "react"
import {
    Form,
    Button,
    Modal,
    Radio,
    DatePicker,
    Switch,
    Tooltip,
    Icon,
    Message,
    Input,
    Checkbox,
    Select,
} from "edf-component"
import { InputNumber } from "antd"
const { Item } = Form
const { Option } = Select

import { moment as momentUtil, fetch } from "edf-utils"
import Spin from "./Spin"
import { debounce } from "./js/util"
const rowRangeA4 = [25, 26, 27, 28, 29, 30, 31, 32]
const rowRangeA5 = [6, 7, 8, 9, 10, 11, 12, 13]
export default memo(props => {
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
        pageType: 3, // "纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5;"
        maxLineNum: 25, // "纸张模版,每版最大行数 32"
        isLandscape: false, // "打印方向：横向=true,纵向=false"
        contentTopPaddingInt: 0, // "调整边距：上边距 0"
        contentRightPaddingInt: 12, // "调整边距：右边距 12"
        contentBottomPaddingInt: 0, // "调整边距：下边距 0"
        contentLeftPaddingInt: 12, // "调整边距：左边距 12"
        contentFontSize: 8,
        headingFontSize: 15,
        printTime: false, // 显示=true，不显示=false"
        printTimeType: 1, // 当前操作时间=1，自定义=0
        customPrintTime: "2020-07-20 17:10:37",
        printCreator: true, // 显示打印制单人：显示=true，不显示=false
        creatorType: 2, // 制单人、制表人类型 原制单人=2,当前操作人=1,自定义=0
        creator: "",
        printVoucherCode: true, // 显示打印凭证号：显示=true，不显示=false
        accountName: "",
        printAccountName: true, // 凭财务帐套(核算单位)：显示=true，不显示=false
        printCustName: true, // 显示打印往来单位：显示=true，不显示=false
        orgId: null,
        userId: null,
    })
    const [lineNum, setLineNum] = useState({
        1: 5, // A4(3版)
        0: 10, // A4(2版)
        3: 24, // A4纸
        4: 10, // A5
    })
    const [defaultForm, setDefaultForm] = useState({})

    const lrMax = props.lrType ? 20 : 12
    const titleMax = props.titleType ? 12 : 15

    // 方法

    // 确认与取消
    const handleConfirm = debounce(
        async () => {
            const data = { ...form }
            data.maxLineNum = lineNum[data.pageType]

            if (!data.printCreator || data.creatorType) {
                data.creator = defaultForm.creator
            } else {
                if (!data.creator) {
                    Message.error("请输入制单人")
                    return
                }
            }
            if (!data.printTime || data.printTimeType) {
                data.customPrintTime = defaultForm.customPrintTime
            }

            setLoading(true)
            await fetch.post("/v1/biz/stock/print/param/config/addStockPrintParamConfig", data)
            setLoading(false)

            Message.success("设置成功")

            props.closeModal({ data })
        },
        500,
        true
    )

    const handleCancel = () => {
        props.closeModal()
    }

    // 初始化数据
    const initData = async () => {
        setLoading(true)
        const res =
            (await fetch.post(
                "/v1/biz/stock/print/param/config/queryInitStockPrintParam",
                props.params
            )) || {}
        setLoading(false)
        setForm(res)
        setDefaultForm(res)
        setLineNum({
            ...lineNum,
            [res.pageType]: res.maxLineNum,
        })
    }

    // 设置区间选择范围
    const disabledDate = date => {
        let enabledDate = momentUtil.stringToMoment(props.motime || "2019-01")
        return date < enabledDate
    }

    // 更改日期
    const dateChange = e => {
        setForm({
            ...form,
            customPrintTime: momentUtil.momentToString(e, "YYYY-MM-DD HH:mm:ss"),
        })
    }

    // 更改单选
    const radioChange = async e => {
        const { value, name } = e.target
        if (name == "isLandscape") {
            // 打印方向
            value ? (form.pageType = 4) : (form.pageType = 3)
            form.headingFontSize = 15
        }
        if (name == "pageType") {
            // 模板
            value == 1 ? (form.headingFontSize = 12) : (form.headingFontSize = 15)
        }
        setForm({
            ...form,
            [name]: value,
        })
    }

    const checkboxChange = e => {
        const { checked, name } = e.target
        setForm({
            ...form,
            [name]: checked,
        })
    }

    const selectChange = (e, path) => {
        setLineNum({
            ...lineNum,
            [path]: e,
        })
    }

    const inputChange = (e, path) => {
        if (path) {
            setForm({
                ...form,
                [path]: e,
            })
        } else {
            const { value, name } = e.target
            setForm({
                ...form,
                [name]: value,
            })
        }
    }
    const pageConfig = getPageConfig(props.printType || 0) || {}
    // 打印方向
    const renderPrintDirection = () => {
        if (!pageConfig.isLandscape) return null
        return (
            <Item label="打印方向">
                <Radio.Group value={form.isLandscape} onChange={radioChange} name="isLandscape">
                    {pageConfig.isLandscape.map(item => (
                        <Radio value={item.value} key={item.label}>
                            {item.label}
                        </Radio>
                    ))}
                </Radio.Group>
            </Item>
        )
    }
    // 纸张模板
    const renderPagerTemplate = () => {
        if (!pageConfig.pageType) return null
        return (
            <Item label="纸张模板" className="stock-print-setting-content-item2">
                <Radio.Group value={form.pageType} onChange={radioChange} name="pageType">
                    {pageConfig.pageType
                        .filter(f => f.isLandscape === form.isLandscape)
                        .map(item => (
                            <div key={item.label}>
                                <Radio value={item.value}>{item.label}</Radio>
                                {item.maxLineNum && (
                                    <span>
                                        每版行数：
                                        <Select
                                            style={{ width: "100px" }}
                                            onChange={e => selectChange(e, item.value)}
                                            disabled={item.maxLineNum.disabled}
                                            value={
                                                form.pageType != item.value
                                                    ? ""
                                                    : lineNum[item.value]
                                            }>
                                            {item.maxLineNum.rowRange.map(el => (
                                                <Option value={el} key={el}>
                                                    {el}
                                                </Option>
                                            ))}
                                        </Select>
                                    </span>
                                )}
                            </div>
                        ))}
                </Radio.Group>
            </Item>
        )
    }
    // 边距调整
    const renderPadding = () => {
        if (!pageConfig.padding) return null
        const children = pageConfig.padding.map((item, index) => (
            <span className={"item3-span-" + (index % 2 === 0 ? "l" : "r")} key={index}>
                {item.label}：
                <InputNumber
                    style={{ width: "100px" }}
                    disabled={item.disabled}
                    value={form[item.value]}
                    name={item.value}
                    onChange={e => inputChange(e, item.value)}
                    precision={0}
                    min={item.min || 0}
                    max={item.max || 50}
                />
                毫米
            </span>
        ))
        return (
            <Item label="边距调整">
                <div>{children.slice(0, 2)}</div>
                {children.length > 2 && <div>{children.slice(2)}</div>}
            </Item>
        )
    }
    // 字号调整
    const renderFontSize = () => {
        if (!pageConfig.fontSize) return null
        return (
            <Item label="字号调整" className="stock-print-setting-content-item4">
                {pageConfig.fontSize.map((item, index) => (
                    <span className={"item4-span" + (index % 2 === 0 ? "" : "-r")}>
                        {item.label}：
                        <InputNumber
                            style={{ width: "100px" }}
                            disabled={item.disabled}
                            value={form[item.value]}
                            name={item.value}
                            onChange={e => inputChange(e, item.value)}
                            precision={0}
                            min={item.min || 8}
                            max={item.max || 50}
                        />
                    </span>
                ))}
            </Item>
        )
    }
    // 制单人
    const renderCreator = () => {
        if (!pageConfig.printCreator) return null
        return (
            <Item>
                <Checkbox checked={form.printCreator} onChange={checkboxChange} name="printCreator">
                    打印制单人
                </Checkbox>
                <Radio.Group
                    value={form.creatorType}
                    onChange={radioChange}
                    name="creatorType"
                    disabled={!form.printCreator}>
                    {pageConfig.printCreator.map(item => (
                        <Radio value={item.value} key={item.value}>
                            {item.label}
                            {item.value === 0 && (
                                <Input
                                    value={
                                        form.printCreator && form.creatorType === 0
                                            ? form[item.name]
                                            : ""
                                    }
                                    name={item.name}
                                    onChange={inputChange}
                                    style={{ width: "100px", marginLeft: "4px" }}
                                    disabled={!form.printCreator || form.creatorType !== 0}
                                    maxLength={20}
                                />
                            )}
                        </Radio>
                    ))}
                </Radio.Group>
            </Item>
        )
    }
    //
    const renderPrintTime = () => {
        if (!pageConfig.printTime) return null
        return (
            <Item>
                <Checkbox checked={form.printTime} name="printTime" onChange={checkboxChange}>
                    显示打印时间
                </Checkbox>
                <Radio.Group
                    value={form.printTimeType}
                    onChange={radioChange}
                    name="printTimeType"
                    disabled={!form.printTime}>
                    {pageConfig.printTime.map(item => (
                        <Radio value={item.value} key={item.value}>
                            {item.label}
                            {item.value === 0 && (
                                <DatePicker
                                    format="YYYY-MM-DD HH:mm:ss"
                                    showTime
                                    style={{ width: "170px", marginLeft: "4px" }}
                                    value={
                                        !form.printTime || form.printTimeType !== 0
                                            ? null
                                            : momentUtil.stringToMoment(form[item.name])
                                    }
                                    onChange={dateChange}
                                    disabled={!form.printTime || form.printTimeType !== 0}
                                />
                            )}
                        </Radio>
                    ))}
                </Radio.Group>
            </Item>
        )
    }
    // 凭证号
    const renderVoucherCode = () => {
        if (!pageConfig.printVoucherCode) return null
        return (
            <Item>
                <Checkbox
                    checked={form.printVoucherCode}
                    name="printVoucherCode"
                    onChange={checkboxChange}>
                    打印凭证号
                </Checkbox>
            </Item>
        )
    }
    // 帐套名称
    const renderAccountName = () => {
        if (!pageConfig.printAccountName) return null
        return (
            <Item>
                <Checkbox
                    checked={form.printAccountName}
                    name="printAccountName"
                    onChange={checkboxChange}>
                    打印账套名称
                </Checkbox>
            </Item>
        )
    }
    // 生命周期
    useEffect(() => {
        initData()
    }, [])

    return (
        <Fragment>
            <Spin loading={loading}></Spin>
            <Form className="stock-print-setting-content">
                {renderPrintDirection()}
                {renderPagerTemplate()}
                {renderPadding()}
                {renderFontSize()}
                {renderCreator()}
                {renderPrintTime()}
                {renderVoucherCode()}
                {renderAccountName()}
                <div className="blank"></div>
            </Form>
            <div className="stock-print-setting-footer">
                <span className="stock-print-setting-footer-tip">
                    温馨提示：<span>为了保证您正常打印，请预先下载Adobe PDF阅读器</span>
                </span>
                <Button
                    className="stock-print-setting-footer-confirm"
                    type="primary"
                    onClick={handleConfirm}>
                    确定
                </Button>
                <Button className="stock-print-setting-footer-cancel" onClick={handleCancel}>
                    取消
                </Button>
            </div>
        </Fragment>
    )
})
const getPageConfig = printType => {
    let config = {}
    switch (printType) {
        case 0: //单据
            config = {
                isLandscape: [
                    { value: true, label: "横向" },
                    { value: false, label: "纵向" },
                ], //"打印方向：横向=true,纵向=false"
                // "纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5;"
                pageType: [
                    {
                        value: 3,
                        label: "A4一版(297*210毫米)",
                        maxLineNum: { disabled: true, rowRange: rowRangeA4 },
                        isLandscape: false,
                    },
                    {
                        value: 0,
                        label: "A4二版(297*210毫米)",
                        maxLineNum: { disabled: true, rowRange: rowRangeA4 },
                        isLandscape: false,
                    },
                    {
                        value: 1,
                        label: "A4三版(297*210毫米)",
                        isLandscape: false,
                    },
                    {
                        value: 4,
                        label: "A5(210*148毫米)",
                        maxLineNum: { disabled: true, rowRange: rowRangeA5 },
                        isLandscape: true,
                    },
                ], //纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5
                padding: [
                    {
                        value: "contentLeftPaddingInt",
                        label: "左",
                        min: 5,
                        max: 12,
                        disabled: true,
                    },
                    {
                        value: "contentRightPaddingInt",
                        label: "右",
                        min: 5,
                        max: 12,
                        disabled: true,
                    },
                ], //边距
                fontSize: [
                    {
                        value: "headingFontSize",
                        label: "标题",
                        disabled: true,
                    },
                    {
                        value: "contentFontSize",
                        label: "表格内容",
                        disabled: true,
                    },
                ], //字号
                printCreator: [
                    {
                        value: 2,
                        label: "原制单人",
                    },
                    {
                        value: 1,
                        label: "当前操作人",
                    },
                    {
                        value: 0,
                        label: "自定义",
                        name: "creator",
                    },
                ], // 制单人、制表人类型 原制单人=2,当前操作人=1,自定义=0
                printTime: [
                    { value: 1, label: "当前操作时间" },
                    { value: 0, label: "自定义", name: "customPrintTime" },
                ], //打印时间
                printVoucherCode: true, //打印凭证号
                printAccountName: true, //凭财务帐套(核算单位)
            }
            break
        case 1: //期初
            config = {
                isLandscape: [
                    { value: true, label: "横向" },
                    { label: "纵向", value: false },
                ], //"打印方向：横向=true,纵向=false"
                pageType: [
                    {
                        value: 0,
                        label: "A4一版(297*210毫米)",
                        maxLineNum: { disabled: true },
                    },
                    {
                        value: 1,
                        label: "A4二版(297*210毫米)",
                        maxLineNum: { disabled: true },
                    },
                    {
                        value: 2,
                        label: "A4三版(297*210毫米)",
                    },
                ], //纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5
                padding: [
                    {
                        value: "contentTopPaddingInt",
                        disabled: true,
                    },
                    {
                        value: "contentRightPaddingInt",
                        disabled: true,
                    },
                ], //边距
                fontSize: [
                    {
                        value: "headingFontSize",
                        disabled: true,
                    },
                    {
                        value: "contentFontSize",
                        disabled: true,
                    },
                ], //字号
                printCreator: [
                    {
                        value: 2,
                        label: "原制单人",
                    },
                    {
                        value: 1,
                        label: "当前操作人",
                    },
                    {
                        value: 0,
                        label: "自定义",
                    },
                ], // 制单人、制表人类型 原制单人=2,当前操作人=1,自定义=0
                printTime: [], //打印时间
                printVoucherCode: true, //打印凭证号
                printAccountName: true, //凭财务帐套(核算单位)
                printCustName: true, //打印往来单位
            }
            break
        case 2: //报表
            config = {
                isLandscape: [{ value: true, label: "横向" }], //"打印方向：横向=true,纵向=false"
                pageType: [
                    {
                        value: 3,
                        label: "A4(297*210毫米)",
                        isLandscape: true,
                    },
                ], ///"纸张类型 pageType = 3 A4纸; 0 A4(2版); 1 A4(3版); 4 A5;"
                padding: [
                    {
                        value: "contentLeftPaddingInt",
                        label: "左",
                        min: 5,
                        max: 20,
                    },
                    {
                        value: "contentRightPaddingInt",
                        label: "右",
                        min: 5,
                        max: 20,
                    },
                    {
                        value: "contentTopPaddingInt",
                        label: "上",
                        min: 0,
                        max: 20,
                    },
                    {
                        value: "contentBottomPaddingInt",
                        label: "下",
                        min: 0,
                        max: 20,
                    },
                ], //边距
                fontSize: [
                    {
                        value: "headingFontSize",
                        label: "标题",
                        min: 10,
                        max: 15,
                    },
                    {
                        value: "contentFontSize",
                        label: "表格内容",
                        min: 8,
                        max: 10,
                    },
                ], //字号
                printCreator: [
                    {
                        value: 2,
                        label: "原制单人",
                    },
                    {
                        value: 1,
                        label: "当前操作人",
                    },
                    {
                        value: 0,
                        label: "自定义",
                        name: "creator",
                    },
                ], // 制单人、制表人类型 原制单人=2,当前操作人=1,自定义=0
                printTime: [
                    { value: 1, label: "当前操作时间" },
                    { value: 0, label: "自定义", name: "customPrintTime" },
                ], //打印时间
            }
            break
    }
    return config
}
