import React from 'react'
import { Spin, Button, Select } from 'antd'
import moment from 'moment'
const { Option } = Select

export default class StockRecord extends React.Component{

    constructor (props){
        super(props)
        this.state = {
            InvSetInfo: {},
            kmSetting: {},
            loading: false
        }
    }

    componentWillMount () {
        this.reqInvSet(this.props.period)
    }

    async reqInvSet (periodTime){
        this.setState({loading: true})
        const setInfo = await this.props.webapi.init({'period': periodTime, 'opr': 1})
        const {km2202, km5001} = this.props && this.props.kmSet || {}
        const index = km2202.findIndex(v=>v.code==setInfo.preToFroAccount)
        const preToFroAccount = (km2202 && km2202[index] && km2202[index]['gradeName']) ? km2202[index]['gradeName']  : ''   // 暂估往来科目
        const kmSetting = {'preToFroAccount': preToFroAccount}
        km5001.map((item,idx)=>{
            if(item.code==setInfo.otherFee){  // 其他费用
                kmSetting.otherFee = item.gradeName || ''  
            }else if(item.code==setInfo.personCostAccount){  // 直接人工
                kmSetting.personCostAccount = item.gradeName || ''
            }else if(item.code==setInfo.factoryFee){  // 制造费用
                kmSetting.factoryFee = item.gradeName || ''
            }else if(item.code==setInfo.materialCostAccount){  // 直接材料
                kmSetting.materialCostAccount = item.gradeName || ''
            }
        })
        this.setState({InvSetInfo: setInfo, kmSetting: kmSetting, loading: false})
        return setInfo
    }

    selectMonth = (value) =>{
        // console.log(value)
        this.reqInvSet(value)
    }

    monthDisabled =(current)=>{
        return current && (current.isBefore(moment(this.props.period), 'month') || current.isAfter(moment(), 'month') )
    }

    onCancel = ()=>{
        this.props.closeModal()
    }

    render(){
        const { kmSetting, InvSetInfo, loading }= this.state || {}  // 账套基础信息
        const inveBusiness = InvSetInfo.inveBusiness   // 商业类型
        const that = this
        return(
            <div className='stock-config-record-container'>
                <div className ='stock-config-record-header'>
                    <div>
                        更改月份： 
                        <Select onChange={that.selectMonth} defaultValue={that.props.period}>
                            {that.props.periodList.map(item=>{
                                return <Option key={item}>{item}</Option>
                            })}
                        </Select>
                    </div>
                </div>
                <div className = 'stock-config-record-content-box'>
                    { loading ? 
                        <div className='ttk-stock-app-spin'>
                            <Spin 
                                className='ttk-stock-app-inventory-picking-fast-spin-icon'
                                wrapperClassName='spin-box add-stock-orders purchase-ru-ku-add-alert'
                                spinning={true} 
                                tip= '数据加载中......'
                                size='large'
                                delay= {10}
                            />
                        </div> : ''
                    }   
                    <div className = 'stock-config-record-content'>
                        <header>
                            <span>{`启用月份：${ InvSetInfo.startPeriod }`}</span>
                            <span>{`业务类型：${ inveBusiness == 1 ? '工业-自行生产' : '商业-纯商业' }`}</span>
                        </header>
                        <div className='stock-config-record-content-main'>
                            <div className='stock-config-record-content-main-item item1'>
                                <h4> <span>出库成本核算</span><i></i> </h4>
                                <div className="stock-config-record-content-main-item-detail">
                                    <p> <span>成本核算方式：</span> <span>全月加权</span> </p>
                                    <p> <span>是否进行负库存控制：</span> <span>{ (InvSetInfo.bInveControl) ? '是' : '否' }</span> </p>
                                </div>
                            </div>
                            {/* 生产核算方式为完工入库的时才显示-- start*/}
                            { inveBusiness == 1 ? 
                                    <div className='stock-config-record-content-main-item item2'>
                                    <h4> <span>生产成本核算</span><i></i> </h4>
                                    <div className="stock-config-record-content-main-item-detail">
                                        <p>
                                            <span>完工成本分摊方式：</span>
                                            <span> { (InvSetInfo.endCostType==1) ? '传统生产【产值百分比】' :  `以销定产【销售成本率-${InvSetInfo.automaticDistributionMark==1 ? '自动分配': '人工分配'} 本期结转和本期结余】` } </span>
                                        </p>
                                        <p><span>完工入库来源：</span><span>{ (InvSetInfo.endNumSource==1) ? '根据本期销售数确定完工入库数' : '手工录入'}</span></p>
                                        <p><span>是否启用BOM设置：</span><span>{ (InvSetInfo.enableBOMFlag==1) ? '是' : '否'}</span></p>
                                        <p><span>辅料是否分摊到BOM结构的产品中：</span><span>{ (InvSetInfo.auxiliaryMaterialAllocationMark==1) ? '是' : '否'}</span></p>
                                    </div>
                                </div> : ''
                            }   
                            {/* 生产核算方式为完工入库的时才显示-- end*/}

                            <div className='stock-config-record-content-main-item item3'>
                                <h4><span>科目来源</span><i></i> </h4>
                                <div className="stock-config-record-content-main-item-detail">
                                    <p> <span>暂估往来科目：</span><span>{kmSetting.preToFroAccount}</span> </p>
                                    { 
                                    /* 生产核算方式为完工入库的时才显示-- start*/
                                        inveBusiness == 1 ? 
                                        <div>
                                            <p><span>直接材料：</span><span>{kmSetting.materialCostAccount}</span></p>
                                            <p><span>直接人工：</span><span>{kmSetting.personCostAccount}</span></p>
                                            <p><span>制造费用：</span><span>{kmSetting.factoryFee}</span></p>
                                            <p><span>其他费用：</span><span>{kmSetting.otherFee}</span></p>
                                        </div> : ''
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className = 'stock-config-record-footer'>
                    <hr className="footer-top-border"/>
                    <Button onClick={that.onCancel}>取消</Button>                
                </div>
            </div>
        )
    }
}