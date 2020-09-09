import React from 'react'
import { Form, DatePicker, Radio, Button } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker

const formItemLayout = {
    labelCol: {
      xs: { span: 24},
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
    },
  };

class CollectionModal extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            date: props.time ? props.time : moment(),
            radio: 0
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

    render(){
        const { date, radio } = this.state
        return (
            <div className="mk-ttk-table-app-list-sort" id="mk-ttk-table-app-list-sort-modal">
               <FormItem {...formItemLayout} label={<span><em style={{
                   color: '#f00', 
                   marginRight: '8px', 
                   position: 'relative', 
                   top: '3px'
                }}>*</em>采集发票月份</span>}>
                   <MonthPicker
                        style={{marginLeft: '8px'}}
                        allowClear={false} 
                        placeholder="" 
                        value={date}
                        getCalendarContainer={()=> document.getElementById('mk-ttk-table-app-list-sort-modal')}
                        onChange={(value)=>this.dateChange('date', value)} 
                    />
               </FormItem>
               <FormItem>
                <div>注：在发票列表中存在的发票，不重复采集</div> 
               </FormItem>
               <div style={{ width: '100%', textAlign: 'center' }}>
                    <Button onClick={this.cancel}>取消</Button>
                    <Button style={{marginLeft: '8px'}} type='primary' onClick={this.confirm}>采集发票</Button>
                </div>
            </div>
        )
    }
}

export default CollectionModal
