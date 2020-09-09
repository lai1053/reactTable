import React from 'react'
import { DatePicker, Form } from 'edf-component'
import {Icon } from 'antd'
import { Map, fromJS } from 'immutable'

//自动生成上级科目
class Confirmsend extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date: null,
            dateString: null,
            statistics: props.statistics,
            selectedArr: props.selectedArr,
            error: {
                date: ''
            }
        }
        if (this.props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }


    onOk = async () => {
      let { selectedArr } = this.state;

        // if (!date) {
        //     this.setState({
        //         error: {
        //             date: '请选择本次认证税款所属期'
        //         }
        //     })
        //     return false;
        // }
      let res = await this.props.webapi.person.send(selectedArr)
      if (res) {
            return 'true';
        } else {
            // this.props.toast('error', '发送认证通知失败！请重新发送认证！')
            return false;
        }

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
        const { error, date, statistics: { count, totalAmount, totalTax } } = this.state;
        return (
            <div style={{ height: 123, color: '#333333', fontSize: '12px' }}>
              <Icon type="question-circle" style={{fontSize: 20,color:'#FAAD14',marginLeft:20}} />
              <div style={{marginLeft:60,marginTop:-25}}>
                <div><h2> 请确认</h2></div>
                <div style={{ fontSize: 12, marginTop: 8 }}>本次选取的发票汇中如下：</div>
                <div style={{ display: 'flex', marginTop: 8 }}>
                  <div>本次选取<span style={{color: 'orange'}}>{count}</span>份，金额合计：<span style={{color: 'orange'}}>{totalAmount}</span>元，税额合计：<span style={{color: 'orange'}}>{totalTax}</span>元</div>
                </div>
                <div style={{marginTop:8}}>
                  请确认是否发送认证？
                </div>
              </div>
              
            </div>
        )
    }
}

export default Confirmsend