import React, {useState, useEffect, memo} from 'react';
import {Layout as ALayout} from 'antd'
import {Button, DatePicker, Form, Modal, Message, Tooltip} from 'edf-component'
import moment from 'moment'
import Spin from '../../components/common/Spin'
const {Item} = Form

import StockRecord from './StockRecord'
import StockSetting from './StockSetting'

export default memo((props) => {

    // 数据
    const checkOutType = ['全月加权', '移动加权', '销售成本率', '先进先出']
    const [period, setPeriod] = useState('2019-01') // 当前会计月份
    const [form, setForm] = useState({
        period:'2019-01',
        startPeriod: '',
        state:'' || 1, //是否启用（1启用，0未启用，2关闭）
        id:'',
        inveBusiness:'',
        endCostType:1,
        endNumSource:1,
        checkOutType:0,
        bInveControl:true,
        enableBOMFlag: 0,  //是否启用bom 1是 0 否 默认不启用 0
        auxiliaryMaterialAllocationMark: 0, //辅料分摊标志：1是 0 否
        automaticDistributionMark: 1, //自动分配标志1 表示自动分配 0表示人工分配 默认为 1
    })
    const [limit, setLimit] = useState({
        isGenVoucher:'',
        isProductShare:'',
        isCarryOverMainCost:'',
        peroids: []
    })
    const [loading, setLoading] = useState(false)
    const [isManager, setIsManager] = useState(false) // 是否为管理岗--岗位类型（001管理岗；002业务岗；003系统管理岗）

    // 备注
    /*
    init接口{'opr': 0}，getInvSetByPeroid返回的inveBusiness均为最新月份，使用init接口{'opr': 1}的代替
    init接口{'opr': 1}，返回的state不正确，使用init接口{'opr': 0}，getInvSetByPeroid的代替
    init接口{'opr': 0}返回的automaticDistributionMark，enableBOMFlag，endCostType，id，period与init接口{'opr': 1}的不同
    */

    // 方法

    const getData = async (period) => {
        setLoading(true)

        const response = await props.webapi.init({period, 'opr': 1}) || {} // 存货基本信息
        const getInvSetByPeroid = await props.webapi.getInvSetByPeroid({period}) || {}

        setForm({ ...form, ...response, ...getInvSetByPeroid, inveBusiness: response.inveBusiness })
        setLimit(getInvSetByPeroid)
        
        setLoading(false)
    }

    const initPage = async () => {

        const currentOrg = props.metaAction.context.get('currentOrg')
        const name = currentOrg.name
        let currentPeriod = ''
        // 获取会计月份
        if(sessionStorage['stockPeriod'+name] != undefined && sessionStorage['stockPeriod'+name]) {
            currentPeriod = sessionStorage['stockPeriod'+name]
        } else {
            currentPeriod = currentOrg.periodDate
        }

        setLoading(true)
        const response = await props.webapi.init({period: currentPeriod, 'opr': 1}) || {} // 存货基本信息
        const getInvSetByPeroid = await props.webapi.getInvSetByPeroid({period: currentPeriod}) || {}

        const userInfo = await props.webapi.getUserDetail({"sysUserId": props.metaAction.context.get('currentUser').id})


        // 写缓存
		sessionStorage[`ttk-stock-app-inventory-config-state-${name}`] = response.state
        sessionStorage[`ttk-stock-app-inventory-config-path-${name}`] = 'ttk-stock-app-inventory-config'

        setPeriod(currentPeriod)
        if(!getInvSetByPeroid.startPeriod) {getInvSetByPeroid.startPeriod = response.startPeriod}
        setForm({...form, ...response, ...getInvSetByPeroid, inveBusiness: response.inveBusiness})
        setLimit(getInvSetByPeroid)
        if(userInfo && userInfo.role) {
            const isManager = userInfo.role.some((el) => {
                return el.postType === '001'
            })
            setIsManager(isManager)
        }
        setLoading(false)

    }

    // 设置区间选择范围
    const disabledDate = (date) => {
        let enabledDate = moment(form.startPeriod || '2019-01')
        return date < enabledDate
    }

    // 日期切换
    const dateChange = async (e) => {
        const date = e.format('YYYY-MM')
        setPeriod(date)
        getData(date)
    }

    // 停启按钮
    // const disabledSwitch = () => {
    //     return moment(limit.thisPeriod) > moment(period)
    // }

    // 设置按钮
    const disabledSetting = () => {
        const last = limit.peroids[0] || '2019-01'
        const date = Number(last.split('-')[1])
        const disabled = moment(last) > moment(period)
        if(disabled) {
            return `当前存货设置不是最新一条存货设置，请到${date}月或${date}月以后会计期间进行修改！`
        } else {
            return ''
        }
    }

    // 返回
    const back = () => {
        props.component.props.setPortalContent &&
		props.component.props.setPortalContent('存货管理','ttk-stock-Inventory-allocation')
        props.component.props.onlyCloseContent('ttk-stock-inventory-configure')
    }

    // 更改设置
    const setInfo =  async () => {
        // 设置id和企业orgId
        const id = form.id, orgId = limit.orgId

        const res = await Modal.show({
            title: '更改存货设置',
            width: 700,
            footer: null,
            className: 'ttk-stock-inventory-setting-modal',
            children: <StockSetting isEdit={true} webapi={props.webapi} form={form} id={id} orgId={orgId} period={period} />,
        })

        if(res && res.data) {
            getData(period)
        }
    }

    // 更改记录
    const setRecord =  async () => {
        // 设置id和企业orgId
        const orgId = limit.orgId

        const res = await Modal.show({
            title: '更改记录',
            footer: null,
            className: 'ttk-stock-inventory-configure-record-modal',
            getContainer: () => document.querySelector('.ttk-stock-inventory-configure'),
            children: <StockRecord record={limit.peroids} webapi={props.webapi} orgId={orgId} state={form.state} />,
        })

        if(res.length !== limit.peroids.length) {
            if(!res.length) {
                // Message.warning('存货记录已清空，存货转为未启用状态！')
                // const params = {...form, state: 0}
                // params.period = params.startPeriod
                // await props.webapi.createInveSet(params)
                // back()
                // return

                setLoading(true)
                const getInvSetByPeroid = await props.webapi.getInvSetByPeroid({period}) || {}
                setLoading(false)

                if(getInvSetByPeroid.state === 0) {
                    Message.warning('存货记录已清空，存货转为未启用状态！')
                    back()
                    return
                }

            }
            await getData(period)

        }
    }

    // 启/停用存货
    const toggoleIsOpen = (state) => async () => {
        const params = {
            ...form,
            state,
            period: form.thisPeriod
        }
        // const params = {
        //     automaticDistributionMark: form.automaticDistributionMark,
        //     auxiliaryMaterialAllocationMark: form.auxiliaryMaterialAllocationMark,
        //     bInveControl: form.bInveControl,
        //     checkOutType: form.checkOutType,
        //     enableBOMFlag: form.enableBOMFlag,
        //     endCostType: form.endCostType,
        //     endNumSource: form.endNumSource,
        //     factoryFee: form.factoryFee,
        //     id: form.id,
        //     inveBusiness: form.inveBusiness,
        //     materialCostAccount: form.materialCostAccount,
        //     otherFee: form.otherFee,
        //     personCostAccount: form.personCostAccount,
        //     preToFroAccount: form.preToFroAccount,
        //     startPeriod: form.startPeriod,
        //     state,
        //     period,
        // }
        if(!params.startPeriod || typeof(params.startPeriod) !== 'string') { // startPeriod没值，增加判断和处理
            Message.warning(
                '数据有误，请截图后联系服务人员！' + 'startPeriod' + params.startPeriod
                // '数据：' + JSON.stringify(params)
            )
            return
        }
        if(state === 1) {
            await props.webapi.createInveSet(params)
            Message.success('存货启用成功，您可接着上次存货数据继续使用！')
            getData(period)
        } else {
            const res = await Modal.confirm({
                content: (
                    <div>
                        <p>您正在执行关闭存货模块，是否确定？</p>
                        <p>1.存货关闭后不能生成单据</p>
                        <p>2.存货中的数据只可查看不可操作</p>
                    </div>
                )
            })
    
            if(res) {
                await props.webapi.createInveSet(params)
                Message.success('操作成功')
                getData(period)
            }
        }
    }

    // 初始化存货
    const initStock = async () => {
        const flag = await Modal.confirm({
            className: 'ttk-stock-inventory-configure-init-stock-modal',
            content: (
                <div>
                    <p>重新初始化将删除以下所有存货数据</p>
                    <p>1.存货期初及暂估期初数据</p>
                    <p>2.所有存货单据</p>
                    <p>3.所有存货报表</p>
                    <p><span>注意：</span>1.仅保留财务凭证！！！</p>
                    <p>2.删除后不能恢复！！！</p>
                </div>
            )
        })
        
        if(!flag) { return }

        if(!isManager) {
            Message.warning('当前用户岗位权限不是管理岗，无权限操作此功能！')
            return
        }

        const result = await props.webapi.initData()
        if(result && result.code === '0') {
            Message.success(result.message)
            back()
        } else if (result && result.code === '1') {
            Message.error(result.message)
        }

    }

    // 生命周期
    useEffect(() => {
        initPage()
    }, [])


    return (
        <React.Fragment>
            <Spin loading={loading}></Spin>
            {/* <ALayout> */}
                <ALayout.Header className='unset-layout-header ttk-stock-inventory-configure-header'>
                    <div className='header-left'>
                        <span>会计月份：</span>
                        <DatePicker.MonthPicker onChange={dateChange} value={moment(period)} disabledDate={disabledDate} />
                        <span className='back' onClick={back}></span>
                    </div>
                    {!props.xdzOrgIsStop &&
                        <div className='header-right'>
                            {   
                                form.state == 1 &&
                                <Tooltip title={disabledSetting()}
                                    placement='bottom' overlayClassName='helpIcon-tooltip'
                                >
                                    <span>
                                        <Button className='header-btn' type='primary' disabled={disabledSetting()} onClick={setInfo}>更改</Button>
                                    </span>
                                </Tooltip>
                            }
                            <Button className='header-btn' onClick={setRecord}>更改记录</Button>
                            {
                                form.state == 1 ? 
                                <Button className='header-btn' onClick={toggoleIsOpen(2)}>停用存货</Button> : 
                                <Button className='header-btn' type='primary' onClick={toggoleIsOpen(1)}>启用存货</Button>
                            }
                            <Button className='header-btn' onClick={initStock}>重新初始化</Button>
                        </div>
                    }
                    

                </ALayout.Header>

                <ALayout.Content className='ttk-stock-inventory-configure-content'>
                    <Form className='content-form'>
                        <Item label='存货启用月份' colon={false} labelCol={{span: 12}}>{form.startPeriod}</Item>
                        <Item label='企业类型' colon={false} labelCol={{span: 12}}>{form.inveBusiness ? '工业类(自行生产模式)' : '商业类(纯商业模式)'}</Item>
                        <Item label='出库成本核算方法' colon={false} labelCol={{span: 12}}>{checkOutType[form.checkOutType]}</Item>

                        {
                            form.inveBusiness === 1 &&
                            <React.Fragment>
                                <Item label='生产成本核算方法' colon={false} labelCol={{span: 12}}>{form.endCostType ? '传统生产' : '以销定产'}</Item>
                                {/* {   
                                    form.endCostType == 0 && 
                                    <Item label='结转与结余分配方式' colon={false} labelCol={{span: 12}}>{form.automaticDistributionMark ? '自动分配' : '手工分配'}</Item>
                                }
                                <Item label='完工入库数来源' colon={false} labelCol={{span: 12}}>{form.endNumSource ? '根据本期销售自动录入' : '手工录入'}</Item> */}
                            </React.Fragment>
                        }

                        {
                            !(form.checkOutType > 1) &&
                            <Item label='是否进行负库存控制' colon={false} labelCol={{span: 12}}>{form.bInveControl ? '是' : '否'}</Item>
                        }

                        {
                            form.inveBusiness === 1 &&
                            <React.Fragment>
                                <Item label='是否启用BOM设置' colon={false} labelCol={{span: 12}}>{form.enableBOMFlag ? '是' : '否'}</Item>
                                {/* {
                                    form.enableBOMFlag == 1 &&
                                    <Item label='辅料是否分到BOM结构的产品中' colon={false} labelCol={{span: 12}}>{form.auxiliaryMaterialAllocationMark ? '是' : '否'}</Item>
                                } */}
                            </React.Fragment>
                        }

                        {   
                            form.state !== 1 &&
                            <React.Fragment>
                                <p className='content-form-bg'>已停用</p>
                                <p className='content-form-bg'>已停用</p>
                                <p className='content-form-bg'>已停用</p>
                            </React.Fragment>
                        }
                    </Form>
                </ALayout.Content>
            {/* </ALayout> */}
        </React.Fragment>
    )
})