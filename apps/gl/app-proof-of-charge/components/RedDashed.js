import React from 'react'
import { Form, DatePicker, Radio, Button } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker

const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };

class RedDashedComponent extends React.Component{
    constructor(props){
        super(props)
        console.log(props.maxMonthlyClosing)
        this.state = {
            date: props.time ? props.time : moment(),
            radio: 0,
            maxMonthlyClosing: props.maxMonthlyClosing? props.maxMonthlyClosing:undefined
        }
    }

    dateChange =( key, value ) => {
        this.setState({
            [key]: value
        })
    }

    getValue= () => {
        return this.state
    }

    confirm = () => {
        this.props.closeModal()
        this.props.callBack(this)
    }
    cancel = () => {
        this.props.closeModal()
    }
    getDisabledDate = (current) => {
        if(this.state.maxMonthlyClosing){
            let maxMonthlyClosing = moment(this.state.maxMonthlyClosing,'YYYY-MM')
            return current && current <= maxMonthlyClosing
        }else{
            return false
        }
    }
    render(){
        const { date, radio } = this.state
        return (
            <div className="mk-app-proof-of-list-sort" id="mk-app-proof-of-list-sort-modal">
               <FormItem {...formItemLayout}>
                  <div>请选择红冲凭证的会计期间</div>
                   <MonthPicker
                        style={{marginLeft: '8px'}}
                        allowClear={false} 
                        placeholder="" 
                        value={date}
                        getCalendarContainer={()=> document.getElementById('mk-app-proof-of-list-sort-modal')}
                        onChange={(value)=>this.dateChange('date', value)} 
                        disabledDate = {(cur) => this.getDisabledDate(cur)}
                    />
               </FormItem>
               <div style={{ width: '100%', textAlign: 'right',borderTop: '1px solid #e8e8e8',paddingTop:'12px', paddingRight:'12px' }}>
                    <Button style={{marginRight: '8px',fontSize: '13px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                    <Button onClick={this.cancel} style={{fontSize: '13px',padding:'0px 15px'}}>取消</Button>
                </div>
            </div>
        )
    }
}

export default RedDashedComponent
