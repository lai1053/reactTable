import React from 'react'
import { Form, DatePicker, Radio, Button,Icon,Tooltip } from 'edf-component'
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

class VoucherSettingsComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            generateDocCodeModel: props.data.generateDocCodeModel ? props.data.generateDocCodeModel :'',
            docManagerSortModel: props.data.docManagerSortModel ? props.data.docManagerSortModel :'',
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
    changeState = (e, nameStr ) => {
        this.setState({
            [nameStr]: e
        })
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
                <div className="item" style={{paddingBottom:'8px',height:'80px',lineHeight:'75px'}} >
                    <span style={{ paddingRight: '8px',width: '100px',display: 'inline-block'}} >新增凭证:</span>
                    <RadioGroup value={this.state.generateDocCodeModel}  onChange={(e) => { this.changeState(e.target.value, 'generateDocCodeModel') }} style={{}} >
                        <Radio value={'1'} style={{ marginRight: '5px', lineHeight: '32px' }}>断号自动插入</Radio>
                        <Tooltip placement="right" title='系统内有凭证删除产生凭证号断号时，新增凭证（不区分系统自动生成或手工新增）优先补齐断号' overlayClassName='helpIcon-tooltip'>
                            <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                        </Tooltip> 
                        <Radio value={'0'} style={{ marginLeft: '20px',lineHeight: '32px',marginRight:'5px'  }} >顺序依次新增</Radio>
                        <Tooltip placement="right" title='新增凭证号规则为现有最大凭证号+1，不会自动补齐断号' overlayClassName='helpIcon-tooltip'>
                            <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                        </Tooltip>                        
                    </RadioGroup>
                </div>
                <div className="item" style={{paddingBottom:'8px',height:'60px',lineHeight:'30px'}} >
                    <span style={{ paddingRight: '8px',width: '100px',display: 'inline-block'}} >凭证管理排序:</span>
                    <RadioGroup value={this.state.docManagerSortModel}  onChange={(e) => { this.changeState(e.target.value, 'docManagerSortModel') }} style={{}} >
                        <Radio value={'1'} style={{ marginRight: '5px', lineHeight: '32px' }}>月份+凭证号排序</Radio>
                        <Tooltip placement="right" title='凭证号将在本月份内按照凭证号排序，不考虑具体日期，调整后记录排序规则，仅影响展示排序，不影响凭证本身的字号' overlayClassName='helpIcon-tooltip'>
                            <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                        </Tooltip> 
                        <Radio value={'0'} style={{ marginLeft: '20px',lineHeight: '32px',marginRight:'5px'  }} >日期+凭证号排序</Radio>
                        <Tooltip placement="right" title='凭证号将在本月份按照日期的先后顺序优先排序，再按照凭证号排序，考虑具体日期，调整后记录排序规则，仅影响展示排序，不影响凭证本身的字号' overlayClassName='helpIcon-tooltip'>
                            <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                        </Tooltip>                        
                    </RadioGroup>
                </div>
                
               <div style={{ width: '100%', textAlign: 'right' ,paddingTop:'12px', paddingRight:'12px', borderTop: '1px solid #ddd'}}>
                    <Button className='button' style={{marginRight: '8px',fontSize: '13px',padding:'0px 15px'}} type='primary'  onClick={this.confirm}>确定</Button>
                    <Button onClick={this.cancel} style={{fontSize: '13px',padding:'0px 15px'}}>取消</Button>
                </div>
            </div>
        )
    }
}

export default VoucherSettingsComponent
