import React from 'react'
import { Form, DatePicker, Radio, Button,Input,Checkbox } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker
import utils from 'edf-utils'
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

class ChangeCreatorComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            toDate: props.toDate ? props.toDate : moment(),
            fromDate:props.fromDate ? props.fromDate : moment(),
            modifyCreator:props.modifyCreator ? props.modifyCreator:false,
            modifyEditor:props.modifyEditor ? props.modifyEditor:false,
            creatorType: 'operator',
            creatorName: props.creatorName ? props.creatorName:'',
            editorType: 'operator',
            editorName: props.editorName ? props.editorName:'',
            enableddate: props.enableddate ? props.enableddate : '',
        }
    }

    dateChange =( key, value ) => {
        if(key=='fromDate'){
            if (this.trantoNumber(value) > this.trantoNumber(this.state.toDate)) {
                this.setState({
                    toDate: value
                })
            }
        }
        this.setState({
            [key]: value
        })
    }
    trantoNumber = (num) => {
        if (!num) {
            return 0
        }
        try {
            return parseInt(num.format('YYYYMMDD'))
        } catch (err) {
            console.log(err)
            return 0
        }
    }
    changeCustom= (e,nameStr ) => {
        this.setState({
            [nameStr]: e.target.value,
        })
    }
    disabledDate = (time,type) => {
        const enableddate = this.state.enableddate
        if (type == 'pre') {
            let currentMonth = this.transformDateToNum(time)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < enableddateMonth
        } else {
            let currentMonth = this.transformDateToNum(time)
            let pointTimeMonth = this.transformDateToNum(this.state.fromDate)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < pointTimeMonth || currentMonth < enableddateMonth
        }

    }
    transformDateToNum = (date) => {
        try {
            if (!date) {
                return 0
            }
            let time = date
            if (typeof date == 'string') {
                time = utils.date.transformMomentDate(date)
            }
            return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
        } catch (err) {
            return 0
        }

    }

    changeState = (e, nameStr ) => {
        if(nameStr=='creatorType'&&e!='customer'){
            this.setState({
                creatorCustom: ''
            })
        }
        if(nameStr=='editorType'&&e!='customer'){
            this.setState({
                auditorCustom: ''
            })
        }
        this.setState({
            [nameStr]: e
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
        const { fromDate, toDate } = this.state
        return (
            <div className="mk-app-proof-of-list-sort" id="mk-app-proof-of-list-sort-modal">
                <div className="item" style={{paddingBottom:'8px',height:'40px',lineHeight:'40px'}}>
                    <span style={{color:'#d0601f'}}>注意:修改后将对凭证制单人等进行修改，修改后不可逆，请谨慎修改！</span>
                </div>
                <div className="item" style={{paddingBottom:'8px',height:'40px',lineHeight:'40px'}}>
               <span style={{    paddingRight: '10px'}}>修改时间:</span>
               <DatePicker 
                    style={{ width: '185px'  }}
                    allowClear={false} 
                    value={ fromDate }
                    format="YYYY-MM-DD"
                    disabledDate  = {(current) =>this.disabledDate(current,'pre')}
                    onChange={(value)=>this.dateChange('fromDate', value)} 
                />
                <span style={{padding: '0 3px', lineHeight: '30px'}}>-</span>
                <DatePicker 
                    style={{ width: '185px'  }}
                    allowClear={false} 
                    value={ toDate }
                    format="YYYY-MM-DD"
                    disabledDate  = {(current) => this.disabledDate(current)}
                    onChange={(value)=>this.dateChange('toDate', value)} 
                />
                </div>
                <div className="item" style={{paddingBottom:'8px',height:'40px',lineHeight:'40px'}}>
                    <Checkbox checked = {this.state.modifyCreator} onChange = {(e) => {this.changeState(e.target.checked, 'modifyCreator')}}>修改制单人</Checkbox>
                    {this.state.modifyCreator?
                    <RadioGroup value={this.state.creatorType} onChange={(e) => { this.changeState(e.target.value, 'creatorType') }} style={{}} >
                        <Radio value={'operator'} style={{ marginRight: '15px', lineHeight: '32px' }}>现系统操作人</Radio>
                        <Radio value={'customer'} style={{ lineHeight: '32px',marginRight:'0px'  }} >自定义</Radio>
                        <Input className="input"  value={this.state.creatorName} disabled={this.state.creatorType=='operator'?true:false} style={{width:80, marginRight: '5px'}} onChange = {(e) => {this.changeCustom(e,'creatorName')}}/>
                    </RadioGroup>:null}
                </div>
                <div className="item" style={{paddingBottom:'8px',height:'40px',lineHeight:'40px',marginBottom: '20px'}}>
                    <Checkbox checked = {this.state.modifyEditor} onChange = {(e) => {this.changeState(e.target.checked, 'modifyEditor')}}>修改审核人</Checkbox>
                    {this.state.modifyEditor?
                    <RadioGroup value={this.state.editorType} onChange={(e) => { this.changeState(e.target.value, 'editorType') }} style={{}} >
                        <Radio value={'operator'} style={{ marginRight: '15px', lineHeight: '32px' }}>现系统操作人</Radio>
                        <Radio value={'customer'} style={{ lineHeight: '32px',marginRight:'0px'  }} >自定义</Radio>
                        <Input className="input" value={this.state.editorName}  disabled={this.state.editorType=='operator'?true:false} style={{width:80, marginRight: '5px'}} onChange = {(e) => {this.changeCustom(e,'editorName')}}/>
                    </RadioGroup>:null}
                </div>
               <div style={{ width: '100%', textAlign: 'right' ,paddingTop:'12px', paddingRight:'12px', borderTop: '1px solid #ddd'}}>
                    <Button style={{marginRight: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                    <Button onClick={this.cancel} style={{fontSize: '12px',padding:'0px 15px'}}>取消</Button>
                </div>
            </div>
        )
    }
}

export default ChangeCreatorComponent
