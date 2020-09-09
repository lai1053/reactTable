import React from 'react'
import {DatePicker, Spin} from "antd";
const {MonthPicker} = DatePicker
class LoadInvoice extends React.Component{
    constructor(props) {
        super(props)
        this.state= {
            date: this.props.date,
            tips: this.props.tips,
            loading: false,
            fplx: this.props.type,
            nsrxz: this.props.TaxpayerNature === '0' ? 'YBNSRZZS' : ' XGMZZS',
            selectList: this.props.list,
            loadTitle: this.props.type ? '进' : '销'

        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        this.setState({
            loading: true
        })
        const {fplx, nsrxz, selectList, date} = this.state
        let arr = []
        for (let item of selectList) {
            arr.push({
                qyId: item.qyId,
                nsrsbh: item.nsrsbh
            })
        }
        const params = {
            fplx,
            skssq: date.format('YYYYMM'),
            nsrxz: nsrxz,
            qyxxList: arr
        }
        const resp = await this.props.webapi.invoice.batchReadInvoice(params)
        this.setState({
            loading: false
        })
        if(!resp){
            return false
        }else {
            return resp
        }
    }
    getInvoiceList = async() =>{

    }
    loadInvoiceTimeChange=(e)=>{
        this.setState({
            date: e
        })
    }

    render () {
        return (
            <Spin spinning={this.state.loading} tip={`正在读取${this.state.loadTitle}项发票，请稍后…`}>
                <div className="content">
                    <p>
                        <label className="label">发票月份：</label><MonthPicker format="YYYY-MM" onChange={this.loadInvoiceTimeChange} placeholder="请选择月份" value={this.state.date}/></p>
                    {this.state.tips.map(item =>{
                        return <li className="list-item">
                            <span className="tips-color">{item.title}</span>
                            <span className="tip-text">{item.content}</span>
                        </li>})
                    }
                </div>
            </Spin>

        )
    }
}
export default LoadInvoice