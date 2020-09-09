import React from 'react'
import { DatePicker, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
//刷新认证结果
class Suaxin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      date: moment(this.props.defaulDate, 'YYYY-MM'),
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
    let a = moment(date).startOf('month')
        a = a.format('YYYY-MM')
        a = a.substring(5,7)
        a = Number(a)
    let b = moment(date).startOf('month')
        b = b.format('YYYYMM')
    if (!date) {
      this.setState({
        error: {
          date: '请选择税款所属期'
        }
      })
      return false;
    }
    
   
    let res = await this.props.webapi.person.refreshs({
      "sbrq": a,
      "rzyf":b
    })
    if (res) {
      this.props.webapi.person.initList()
    } else {
      return false
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
    const { error, date } = this.state;
    return (
      <div style={{ height: 80 }}>
        <Form>
          <Form.Item
            label='税款所属期'
            validateStatus={error && error.date ? 'error' : 'success'}
            required={true}
            help={error.date}
            labelCol={{ span: 9 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.MonthPicker onChange={this.onChange} value={date} />
          </Form.Item>
        </Form>
        <div style={{textAlign:'center',fontSize:'12PX',marginBottom:'100px'}}>
          <span style={{color:'orange'}}>温馨提示：</span><span>请选择需要刷新认证结果的月份</span>
        </div>
      </div>
    )
  }
}

export default Suaxin