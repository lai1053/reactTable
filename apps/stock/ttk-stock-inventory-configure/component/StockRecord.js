import React, {useState, useEffect, memo} from 'react';
import {Form, Select, Modal, Button, Message} from 'edf-component'
import Spin from '../../components/common/Spin'
const {Item} = Form

export default memo((props) => {
    // 数据
    const checkOutType = ['全月加权', '移动加权', '销售成本率','先进先出']
    const [record, setRecord] = useState([])
    const [form, setForm] = useState({})
    const [period, setPeriod] = useState('')
    const [loading, setLoading] = useState(false)

    // 方法

    const getData = async (date) => {
        setPeriod(date)
        setLoading(true)
        const form = await props.webapi.init({period: date, 'opr': 1}) || {}
        setForm(form)
        setLoading(false)
    }

    const recordChange = (e) => {
        getData(e)
    }

    const delRecord = async () => {

        const res = await Modal.confirm({
            content: '确定删除此记录？'
        })

        if(!res) { return }

        // const canDel = await props.webapi.checkIsDelete({orgId: props.orgId, period}) || {}
        // if(canDel.code === 1) {
        //     Message.warning(canDel.message)
        // } else if (canDel.code === 0) {
            const delRes = await props.webapi.deleteWithCheck({orgId: props.orgId, period, id: form.id}) || {}
            if(delRes.code === '1') {
                Message.warning(delRes.message)
            } else if(delRes.code === '0') {
                Message.success(delRes.message)
                const temp = record.slice()
                const idx = temp.indexOf(period)
                temp.splice(idx, 1)
                if(!temp.length) {
                    props.closeModal([])
                    return
                }
                await recordChange(temp[0])
                setRecord(temp)
            }

        // }
    }

    const handleCancel = () => {
        props.closeModal(record)
    }

    // 生命周期
    useEffect(() => {
        props.setCancelLister && props.setCancelLister(handleCancel)
        setRecord(props.record.slice())
        const len = props.record.length
        if(len) {
            getData(props.record[0])
        }
    }, [])

    return (
        <React.Fragment>
            <Spin loading={loading}></Spin>
            <Form className='record-content'>
                <Item label='生效月度' labelCol={{span: 11}} className='record-controller'>
                    <Select value={period} onChange={recordChange}>
                        {
                            record.map((el) => <Select.Option vakue={el} key={el}>{el}</Select.Option>)
                        }
                    </Select>
                    { props.state === 1 && period === record[0] && <span className='record-content-del-btn' onClick={delRecord}>删除记录</span>}
                </Item>
                <Item label='存货启用月份' labelCol={{span: 11}}>{form.startPeriod}</Item>
                <Item label='业务类型' labelCol={{span: 11}}>{form.inveBusiness ? '工业类(自行生产模式)' : '商业类(纯商业模式)'}</Item>
                <Item label='出库成本核算方法' labelCol={{span: 11}}>{checkOutType[form.checkOutType]}</Item>
                {
                    form.inveBusiness === 1 &&
                    <React.Fragment>
                        <Item label='生产成本核算方法' labelCol={{span: 11}}>{form.endCostType ? '传统生产' : '以销定产'}</Item>
                        {/* {
                            form.endCostType == 0 && 
                            <Item label='结转与结余分配方式' labelCol={{span: 11}}>{form.automaticDistributionMark ? '自动分配' : '手工分配'}</Item>
                        }
                        <Item label='完工入库数来源' labelCol={{span: 11}}>{form.endNumSource ? '根据本期销售自动录入' : '手工录入'}</Item> */}
                    </React.Fragment>
                }

                {
                    !(form.checkOutType > 1) &&
                    <Item label='是否进行负库存控制' labelCol={{span: 11}}>{form.bInveControl ? '是' : '否'}</Item>
                }

                {
                    form.inveBusiness === 1 &&
                    <React.Fragment>
                        <Item label='是否启用BOM设置' labelCol={{span: 11}}>{form.enableBOMFlag ? '是' : '否'}</Item>
                        {/* {
                            form.enableBOMFlag == 1 &&
                            <Item label='辅料是否分到BOM结构的产品中' labelCol={{span: 11}}>{form.auxiliaryMaterialAllocationMark ? '是' : '否'}</Item>
                        } */}
                    </React.Fragment>
                }
            </Form>
            <div className='record-footer'>
                <Button onClick={handleCancel}>取消</Button>
            </div>
        </React.Fragment>
    )
})
