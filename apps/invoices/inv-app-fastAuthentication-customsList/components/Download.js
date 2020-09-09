import React from 'react'
import { DatePicker, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'
import moment from "moment/moment";
import {Modal} from "antd/lib/index";

//下载认证结果
class Download extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date:moment(this.props.defaulDate, 'YYYY-MM'),
            dateString: null,
            error: {
                date: ''
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async () => {
      let date = this.state.date;
     /* let a = moment(date).startOf('month')
      let b = moment(date).endOf('month')
      if (!date) {
            this.setState({
                error: {
                    date: '请选择认证月份'
                }
            })
            return false;
        }
      let res = await this.props.webapi.person.downloadPdf4Rz({
            "sssqQ": a.format('YYYY-MM-DD'),
            "sssqZ": b.format('YYYY-MM-DD')
        })
      if (res) {
        this.props.getInvoiceList()
         /!* this.props.webapi.person.getInvoiceList()*!/
        /!*    return { url: res };*!/
        } else {
            return false
        }*/
      const skssqVal = moment(date).startOf('month').format('YYYYMM')
      const  periodDate  = this.props.currentOrg.periodDate
      let nsqj = periodDate
  
      const currentOrg = this.props.currentOrg
      const params = {
        "skssq": skssqVal,
        "qyxxList": [{ "qyId": currentOrg.id }]
      }
      let nsqxUnit = '月',
        nsqxdm = '06'
      if (currentOrg.swVatTaxpayer == 2000010002) {
        const resp = await this.webapi.invoices.batchQueryZzsNsqxdm(params)
        nsqxdm = resp && resp.length !== 0 ? resp[0].nsqxdm : '06'
        nsqxUnit = nsqxdm === '06' ? '月' : '季度'
      }
     let obj ={
        nsqxdm,
        nsqxUnit,
        nsqj: nsqj ? `${nsqj.slice(0,4)}-${nsqj.slice(4)}` : moment().format('YYYY-MM'),
      }
      this.handelSubmit(obj)
    }
    handelSubmit = async(obj) =>{
      this.props.lodingT()
      const bill_date = obj.nsqj
      const currentOrg = this.props.currentOrg
      const currentUser = this.props.currentUser
      const nsqxdm = obj.nsqxdm
      const res = await new Promise((resolve, reject) => {
        let option = {
          "yhId": currentUser.id,
          "qyId": currentOrg.id || '6678055875340288',
          "fplx": "1", //进项1，销项0
          "skssq": bill_date && bill_date.replace('-', '') || '201904',
          "nsrxz": currentOrg.swVatTaxpayer == 2000010001 ? "YBNSRZZS" : "XGMZZS",
          "nsrsbh": currentOrg.vatTaxpayerNum || '914401010506412529',
          "cjfs": "dhcj", //采集方式：plcj－批量，dhcj－单户
          nsqxdm, //纳税期限代码，必传：06月报；08季报；
        }
        const requestOption = {
          ...option,
          "dataList": [{
            ...option,
          }]
        }
        setTimeout(async () => {
          const response = await this.props.webapi.person.downInvoice(requestOption)
          if(response){
            this.props.lodingF()
            this.props.getInvoiceList()
          }
        }, 1000)
      })
      
      
      }

    onChange = (date, dateString) => {
        this.setState({
            date: date,
            dateString: dateString,
            error: {
                date: ''
            }
        })
    }
    render() {
        const { error, date } = this.state;
        return (
            <div style={{ height: 85, }}>
                <Form>
                    <Form.Item
                        label='下载发票月份'
                        validateStatus={error && error.date ? 'error' : 'success'}
                        required={true}
                        help={error.date}
                        labelCol={{ span: 9 }}
                        wrapperCol={{ span: 15 }}
                    >
                        <DatePicker.MonthPicker onChange={this.onChange} value={date} />
                    </Form.Item>
                </Form>
              <div style={{textAlign:'center',fontSize:'12PX',marginLeft: '-30px'}}>
                <span style={{color:'orange'}}>温馨提示：</span><span>包含本月抵扣发票和本月开具发票</span>
              </div>
            </div>
        )
    }
}

export default Download