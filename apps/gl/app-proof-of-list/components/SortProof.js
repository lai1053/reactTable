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

class SortProofComponent extends React.Component{
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
            <div className="mk-app-proof-of-list-sort" id="mk-app-proof-of-list-sort-modal">
               <FormItem {...formItemLayout} style={{marginBottom:0}}>
               <span><em style={{
                   color: '#f00', 
                   marginRight: '8px', 
                   position: 'relative', 
                   top: '3px'
                }}>*</em>范围</span>
                   <MonthPicker
                        style={{marginLeft: '8px'}}
                        allowClear={false} 
                        placeholder="" 
                        value={date}
                        getCalendarContainer={()=> document.getElementById('mk-app-proof-of-list-sort-modal')}
                        onChange={(value)=>this.dateChange('date', value)} 
                    />
               </FormItem>
               <FormItem style={{marginBottom:'5px'}}>
                <RadioGroup onChange={(e)=>this.dateChange('radio', e.target.value)} value={radio}>
                        <Radio value={0} style={{fontSize:'12px'}}>断号整理</Radio>
                        <Radio value={1} style={{fontSize:'12px'}}>序时整理</Radio>
                    </RadioGroup>
               </FormItem>
               <div style={{ width: '100%', textAlign: 'right' ,paddingTop:'12px', paddingRight:'12px', borderTop: '1px solid #ddd'}}>
                    <Button style={{marginRight: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                    <Button onClick={this.cancel} style={{fontSize: '12px',padding:'0px 15px'}}>取消</Button>
                </div>
            </div>
        )
    }
}

export default SortProofComponent
