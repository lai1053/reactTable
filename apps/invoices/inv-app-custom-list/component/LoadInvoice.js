import React from 'react'
import { Spin} from "antd";
import {DatePicker} from "edf-component";
const {MonthPicker,RangePicker } = DatePicker
import moment from 'moment'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
class LoadInvoice extends React.Component{
    constructor(props) {
        super(props)
      this.state= {
            changeDate:'',
            date: this.props.TaxpayerNature === '1' && this.props.type === 0 ? moment(this.props.date).subtract(1).startOf('quarter') :moment(this.props.date).subtract(1, "month"),//
            date2:this.props.TaxpayerNature === '1' && this.props.type === 0 ? moment(this.props.date).subtract(1).endOf('quarter') : moment(this.props.date).subtract(1, "month"), //
            tips: this.props.tips,
            loading: false,
            fplx: this .props.type,
            nsrxz: this.props.TaxpayerNature === '0' ? 'YBNSRZZS' : ' XGMZZS',
            selectList: this.props.list,
            loadTitle: this.props.type ? '进' : '销',
            currentUser : this.props.currentUser,
            currentOrg : this.props.currentOrg,
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    getAll=(begin, end)=>{
        if(!begin || !end){
		return false;
        }else {
            let z = moment(end).subtract(1,"months");
            z = z.format("YYYYMM")*1
            let arr = [];
            begin = begin.format("YYYYMM")*1
            end =  end.format("YYYYMM")*1
            if(begin < end && z !==begin){
                arr.push(begin,z,end)
            }else if( begin < end && z ==begin){
                arr.push(begin,end)
            }else if(begin = z){
                arr.push(end)
            }
            return arr

        }
    }
    
    onOk = async() => {
        this.setState({
            loading: true
        })
      let {fplx, nsrxz, selectList, date,date2,currentUser,currentOrg} = this.state
        let dateArr = this.getAll(date,date2)
        fplx = parseInt(fplx)
              fplx = fplx.toString()
              nsrxz =  nsrxz.replace(/\s*/g,"");
              let arr = []
              let allArr = []
              dateArr.forEach( i=>{
                  selectList.forEach( j =>{
                      let k = {}
                    /*  j.skssq =  i+''
                      j.nsqxdm = j.cwbbType === "季报" ? '08' : '06',*/
                      k.skssq = i+''
                      k.qyId = j.qyId
                      k.fplx = fplx
                      k.nsqxdm = j.cwbbType === "季报" ? '08' : '06'
                      k.nsrxz = nsrxz
                      k.nsrsbh = j.nsrsbh
                      k.xzqhdm = j.xzqhdm, //--行政区划代码；
                      k.psbState = j.psbState //--票税宝开通标志， 1开通，0未开通；"	
                      allArr.push({...k})
                  })
              })
      /*  for (let item of selectList) {  11月12日舍弃
                  arr.push({
                        qyId: item.qyId,
                        fplx,
                        skssq:'201910',
                        nsqxdm: item.cwbbType === "季报" ? '08' : '06',
                        nsrxz: nsrxz,
                        nsrsbh: item.nsrsbh
                    })
                }*/
                const params2 = {
                  yhId: currentUser.id,
                  dljgId: currentOrg.id,//--代理机构ID 必传	
                  qyId:'',
                  fplx: '',
                  skssq:'',
                  nsqxdm:'',
                  nsrxz: nsrxz,
                  nsrsbh:'',
                  cjfs: "plcj",
                  dataList: allArr
                }
                let resp = ''
                // 连接超时提示
                // let timer = setTimeout(() => {
                //     if ((resp&& resp.code !== '200') || (resp && resp.code !== '400')) {
                //         return {
                //             showTip: 'showTip'
                //         }
                //     } else {
                //         return true
                //     }
                // }, 60000)
                const loadApiName = this.props.loadApiName
                const reqMethod = loadApiName ? loadApiName : 'fpxxCollection'
                resp = await this.props.webapi.invoice[reqMethod](params2)
                return resp
               
    }
    getInvoiceList = async () =>{

    }
    loadInvoiceTimeChange=(e)=>{
        this.setState({
            date: e,
        })
        let{date2} = this.state
        let a = e.format("YYYYMM")*1
        let b = date2.format("YYYYMM")*1
        if(b-a > 2 || a > b){
            this.setState({
                date2: e,
            })
        }
    }
    loadInvoiceTimeChange2=(e)=>{
        this.setState({
            date2: e
        })
    }
    handleChange = value => {
        this.setState({ value });
    };
    disabledDate = (time)=>{
        const {date} = this.state
        const minus = date.clone().add(2, "months");
        return time.valueOf() < date.valueOf() || time.valueOf() >moment(minus).endOf('month')
    }
   
    render () {
        const { value, mode,date } = this.state
        return (
            <Spin className="islongding" spinning={this.state.loading} tip={`正在读取${this.state.loadTitle}项发票，请稍后…`} size='large'>
                <div className="content">
                    <p>
                        <label className="label">发票月份：</label>
                        <span><MonthPicker format="YYYY-MM"
                                           style={{ width: '100px'}}
                                           onChange={this.loadInvoiceTimeChange}
                                           placeholder="请选择月份"
                                           value={this.state.date}/>-
                            <MonthPicker format="YYYY-MM"
                                         style={{ width: '100px'}}
                                         disabledDate = {this.disabledDate}
                                         onChange={this.loadInvoiceTimeChange2}
                                         placeholder="请选择月份"
                                         value={this.state.date2}/></span>
                    </p>
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