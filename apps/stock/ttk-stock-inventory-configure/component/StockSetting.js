import React, {useState, useEffect, memo} from 'react';
import {Form, Button, Modal, Radio, DatePicker, Switch, Tooltip, Icon, Message} from 'edf-component'
const {Item} = Form

import { moment as momentUtil } from 'edf-utils'
import Spin from '../../components/common/Spin'

export default memo((props) => {
    // 数据
    const [loading, setLoading] = useState(false)
    const [hasBom, setHasBom] = useState(0) // 0无1有
    const [limit, setLimit] = useState({
        isCompletion: false, // 完工入库
        isMaterial: false, // 生产领料
        isCarryOverProductCost: false, // 结转生产
    })
    const [form, setForm] = useState({
        period:'',
        startPeriod: '', // 启用月份
        state:'',
        id: props.id,
        inveBusiness:'',  // 业务类型
        endCostType:0,  // 完工成本分摊方式
        endNumSource:1,  // 完工入库数来源
        checkOutType:0, // 出库成本核算
        bInveControl:true, // 启用负库存控制
        enableBOMFlag: 0,  // 是否启用bom 1是 0 否 默认不启用 0
        auxiliaryMaterialAllocationMark: 1, // 辅料分摊标志：1是 0 否
        automaticDistributionMark: 1, // 自动分配标志1 表示自动分配 0表示人工分配 默认为 1
    })

    // 方法

    // 确认与取消
    const handleConfirm = async () => {
        form.auxiliaryMaterialAllocationMark = Number(form.auxiliaryMaterialAllocationMark)
        form.enableBOMFlag = Number(form.enableBOMFlag)
        if(!form.state) {
            form.state = 1
            form.startPeriod = form.period
        }

        if(form.checkOutType > 1) { // 先进先出、销售成本率关闭负库存
            form.bInveControl = false
        }

        if(form.inveBusiness === 0) { // 商业不显示用BOM，设为停用
            form.enableBOMFlag = 0
        }

        setLoading(true)

        if(!form.startPeriod || typeof(form.startPeriod) !== 'string') { // 偶尔出现传值为null，增加判断和处理
            if(props.isEdit) {
                const getInvSetByPeroid = await props.webapi.getInvSetByPeroid({period: props.period})
                if(getInvSetByPeroid && getInvSetByPeroid.startPeriod) {
                    form.startPeriod = getInvSetByPeroid.startPeriod.substring(0) 
                } else {
                    setLoading(false)
                    Message.warning(
                        '数据有误，请截图后联系服务人员！' + 
                        '日期：' + (form.startPeriod) + 'props:' + props.form.startPeriod // +
                        // '数据：' + JSON.stringify(getInvSetByPeroid)
                    )
                    return
                }
            } else {
                form.startPeriod = form.period.substring(0)
                setLoading(false)
                !form.startPeriod && Message.warning('请重新选择日期')
                return
            }
        }

        await props.webapi.createInveSet(form)
        setLoading(false)
        
        const text = props.isEdit ? '存货设置更改成功' : '存货启用成功！'
        Message.success(text)


        props.closeModal({
            data: form
        })
    }
    const handleCancel = () => {
        props.closeModal()
    }

    // 初始化数据
    const initData = async () => {
        if(props.isEdit) {
            setForm({
                ...props.form,
                period: props.period
            })

            setLoading(true)
            // const getInvSetByPeroid = await props.webapi.getInvSetByPeroid({period: props.period}) || {}
            // setLimit(getInvSetByPeroid)

            const res = await props.webapi.checkIsDelete({period: props.period, orgId: props.orgId})
            if(res) {
                setHasBom(res.code)
            }

            const isCompletion = await props.webapi.checkExistBill({
                serviceTypeCode: "'WGRK'",
                period: props.period,
                orgId: props.orgId
            })
            const isMaterial = await props.webapi.checkExistBill({
                serviceTypeCode: "'SCLL'",
                period: props.period,
                orgId: props.orgId
            })
            const isCarryOverProductCost = await props.webapi.checkExistBill({
                serviceTypeCode: "'ZZSCCB'",
                period: props.period,
                orgId: props.orgId
            })

            setLimit({isCompletion, isMaterial, isCarryOverProductCost})
            setLoading(false)

        } else {
            setForm({
                ...form,
                period: props.period,
            })
        }
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
            period: momentUtil.momentToString(e, 'YYYY-MM')
        })
    }

    // 更改单选
    const radioChange = async (e) => {
        const {value, name} = e.target

        if(props.isEdit) { //编辑根据单据状态限制
            if(name == 'inveBusiness') { // 业务类型
                if(hasBom == 1) {
                    Message.warning('所选会计月份或以后月份己存在存货单据,请删除后重新操作！')
                    return
                }
                const res = await Modal.confirm({
                    content: '切换到其它企业类型时，您需重新进行存货参数设置，请确认！'
                })
                if(!res) { return }
            }

            if(name == 'checkOutType') { // 成本核算
                if(hasBom == 1) {
                    Message.warning('所选会计月份或以后月份己存在存货单据,请删除后重新操作！')
                    return
                }
            }

            if(name == 'endCostType' || name == 'endNumSource') { // 完工成本分摊方式 和 完工入库数来源
                if(limit.isCompletion) {
                    Message.warning('所选月己存在完工入库单，不能更改！')
                    return
                }
            }
        }
        form[name] = value

        // 通用逻辑
        
        if(form.checkOutType == 3 && form.inveBusiness == 1) { // 工业无先进先出
            form.checkOutType = 0
        }

        setForm({
            ...form,
        })
    }

    // 更改开关
    const switchChange = (name) => async (e) => {

        if(props.isEdit) {
            if(name == 'enableBOMFlag') { // BOM设置
                if(limit.isMaterial) {
                    Message.warning('所选会计月份或以后会计月份己存在领料单，不能切换！')
                    return
                }
                if(limit.isCarryOverProductCost) {
                    Message.warning('所选会计月份或以后会计月份己存在结转生产成本表，不能切换！')
                    return
                }
            }

            if(name == 'auxiliaryMaterialAllocationMark') { // 辅料分摊
                if(limit.isCarryOverProductCost) {
                    Message.warning('所选会计月份或以后会计月份己存在结转生产成本表，不能切换！')
                    return
                }
            }
        }
        
        setForm({
            ...form,
            [name]: e
        })
    }

    // 提示渲染
    const renderTooltip = (title) => {
        return (
            <Tooltip title={title}
                placement='bottom' overlayClassName='helpIcon-tooltip'
            >
                <Icon type='bangzhutishi' fontFamily='edficon' className='helpIcon'></Icon>
            </Tooltip>
        )
    }

    // 生命周期
    useEffect(() => {
        initData()
    }, [])

    return (
        <React.Fragment>
            <Spin loading={loading}></Spin>
            <Form className='stock-setting-content'>
                <Item label={props.isEdit ? '生效月份' : '启用月份'} >
                    <DatePicker.MonthPicker className='mgr8 mgl8' value={momentUtil.stringToMoment(form.period)}
                        onChange={dateChange} disabled={props.isEdit} disabledDate={disabledDate}
                    ></DatePicker.MonthPicker>
                </Item>

                <Item label='企业类型' labelCol={{span: 7}}></Item>
                <Item wrapperCol={{offset: 1}} className='stock-setting-content-business'>
                    <Radio.Group value={form.inveBusiness} onChange={radioChange} name='inveBusiness'>
                        <Radio value={0}>
                            <span className='mgr8'>商业类(纯商业模式)</span>
                            {renderTooltip('纯商业模式：适用于买进再卖出库存商品的商业零售批发企业')}
                        </Radio>
                        <Radio value={1}>
                            <span className='mgr8'>工业类(自行生产模式)</span>
                            {renderTooltip('自行生产模式：适用于原材料自主采购、自行生产半成品、产成品的工业制造企业')}
                        </Radio>
                    </Radio.Group>
                </Item>

                {
                    form.inveBusiness !== '' && 
                    <React.Fragment>
                        <Item label='出库成本核算方法'>
                            {/* <Radio.Group value={form.checkOutType} onChange={radioChange} name='checkOutType'>
                                <Radio value={0} className='stock-setting-content-delivery-month'>全月加权</Radio>
                            </Radio.Group> */}
                        </Item>
                        <Item wrapperCol={{offset: 1}} className='stock-setting-content-delivery'>
                            <Radio.Group value={form.checkOutType} onChange={radioChange} name='checkOutType'>
                                <div className='stock-setting-content-delivery-radio-wrapper'>
                                    <Radio value={0}>全月加权</Radio>
                                    <Radio value={1}>移动加权</Radio>
                                    <Radio value={2}>销售成本率</Radio>
                                    {
                                        form.inveBusiness === 0 && 
                                        <Radio value={3} disabled={props.isEdit && form.period != form.startPeriod && props.form.checkOutType != 3 }>先进先出</Radio>
                                    }
                                </div>
                                {/* {   
                                    form.inveBusiness === 0 &&
                                    <div className='stock-setting-content-delivery-radio-wrapper'>
                                        <Radio value={3} disabled={props.isEdit && form.period != form.startPeriod}>先进先出</Radio>
                                        <Radio value={2}>销售成本率</Radio>
                                    </div>
                                } */}
                            </Radio.Group>
                        </Item>

                        {   
                            form.inveBusiness === 1 && 
                            <React.Fragment>
                                <Item label='生产成本核算方法' labelCol={{span: 7}}></Item>
                                <Item wrapperCol={{offset: 1}} className='stock-setting-content-production'>
                                    {/* <Item label='完工成本分摊方式' className='stock-setting-content-production-radio1'> */}
                                    <Item className='stock-setting-content-production-radio1'>
                                        <Radio.Group value={form.endCostType} onChange={radioChange} name='endCostType'>
                                            <Radio value={0}>以销定产(销售成本率)</Radio>
                                            <Radio value={1}>传统生产(产值百分比)</Radio>
                                        </Radio.Group>
                                    </Item>
                                    {/* {
                                        form.endCostType === 0 &&
                                        <Item label='成本分配方式' className='stock-setting-content-production-radio2'>
                                            <Radio.Group value={form.automaticDistributionMark} onChange={radioChange} name='automaticDistributionMark'>
                                                <Radio value={1}>自动分配</Radio>
                                                <Radio value={0}>手工分配</Radio>
                                            </Radio.Group>
                                        </Item>
                                    }
                                    <Item label='完工入库数来源' className='stock-setting-content-production-radio3'>
                                        <Radio.Group value={form.endNumSource} onChange={radioChange} name='endNumSource'>
                                            <Radio value={1}>根据本期销售数确定完工入库数</Radio>
                                            <Radio value={0}>手工录入</Radio>
                                        </Radio.Group>
                                    </Item> */}
                                </Item>
                            </React.Fragment>
                        }

                        {   !(form.checkOutType > 1) &&
                            <Item label='启用负库存控制'>
                                {/* {renderTooltip(
                                    <React.Fragment>
                                        <div>开启：存在负库存，不能结转主营业务成本</div>
                                        <div>关闭：存在负库存，可以结转主营业务成本</div>
                                    </React.Fragment>
                                )} */}
                                <Switch className={'stock-setting-content-negative' + form.inveBusiness} checked={form.bInveControl} onChange={switchChange('bInveControl')}></Switch>
                            </Item>
                        }

                        {
                            form.inveBusiness === 1 && 
                            <React.Fragment> 
                                <Item label='启用BOM设置'>
                                    <Switch className='stock-setting-content-bom' checked={!!form.enableBOMFlag} onChange={switchChange('enableBOMFlag')}></Switch>
                                </Item>
                            </React.Fragment> 
                        }

                        {/* {
                            form.enableBOMFlag == 1 && form.inveBusiness === 1 &&
                            <React.Fragment>
                                <Item label='辅料分摊到启用BOM的产品中'>
                                    <Switch className='stock-setting-content-bom-product' checked={!!form.auxiliaryMaterialAllocationMark} onChange={switchChange('auxiliaryMaterialAllocationMark')}></Switch>
                                </Item>
                            </React.Fragment>
                            
                        } */}
                        <div className='blank'></div>
                    </React.Fragment>
                }
            </Form>
            <div className='stock-setting-footer'>
                <span className='stock-setting-footer-tip'>温馨提示：<span>请设置需要修改的各项参数</span></span>
                <Button className='stock-setting-footer-confirm' type='primary'
                    onClick={handleConfirm} disabled={form.inveBusiness === ''}
                >确定</Button>
                <Button className='stock-setting-footer-cancel' onClick={handleCancel}>取消</Button>
            </div>
        </React.Fragment>
    )
})