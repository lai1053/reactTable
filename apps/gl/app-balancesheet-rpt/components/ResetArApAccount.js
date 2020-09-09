import React from 'react'
import { Form, DatePicker, Radio, Button ,Icon,Tooltip,Modal} from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker
import { consts } from 'edf-consts'
const { confirm } = Modal;
class ResetArApAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            radio: 'true',
            templateCode:true,
            ShowTemplateCode:true,
            monthClosingFlag:'',
            resetTaxAmountAccount: 'false',
        }
    }
    componentDidMount = () => {
        if(this.props.initData){
            this.setState({
                radio: this.props.initData.resetArApAccount,
                templateCode: this.props.initData.templateCode,
                ShowTemplateCode: this.props.initData.ShowTemplateCode,
                resetTaxAmountAccount: this.props.initData.resetTaxAmountAccount,
                accountingStandards: this.props.initData.accountingStandards,
                monthClosingFlag:this.props.initData.monthClosingFlag,
            })
        }
    }
    handleOk =( key, value ) => {
        this.setState({
            [key]: value,
        });
    };
    dateChange =( key, value ) => {
        if(key=='templateCode'&&value=='1'&&Number(this.state.monthClosingFlag.split('-')[0])<=2019&&Number(this.state.monthClosingFlag.split('-')[1])<10){
            confirm({
                // title: '提示',
                content: '新财务报表模板建议开始实施期间为2019年10月，是否要继续切换模板？',
                okText: '是',
                cancelText: '否',
                onOk:() =>{
                    this.setState({
                        [key]: value
                    })
                },
                onCancel() {},
              });
        }else{
            this.setState({
                [key]: value
            })
        }
    }

    getValue= () => {
        return this.state
    }

    confirm = async () => {
        await this.props.closeModal()
        await this.props.callBack({ resetArApAccount: this.state.radio,templateCode:this.state.templateCode,ShowTemplateCode:this.state.ShowTemplateCode,resetTaxAmountAccount:this.state.resetTaxAmountAccount})
    }
    cancel = () => {
        this.props.closeModal()
    }

    render(){
        const { radio, accountingStandards,templateCode,ShowTemplateCode ,resetTaxAmountAccount} = this.state
        console.log(consts)
        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            return (
                <div className="resetArApAccount" id="resetArApAccount" >
                   <FormItem label={'往来项目重分类'} style={{display:'flex',paddingTop:'20px', paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={radio} onChange={(e)=>this.dateChange('radio', e.target.value)} >
                            <Radio value={'true'} >重分类</Radio>
                            <Radio value={'false'} >不重分类</Radio>
                        </RadioGroup>
                   </FormItem>
                   <FormItem  label={'导出报表样式'} style={{display:ShowTemplateCode?'flex':'none', paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={templateCode} onChange={(e)=>this.dateChange('templateCode', e.target.value)} >
                            <Radio value={'0'} >老报表模板</Radio>       
                            <Radio value={'1'} >新报表模板 </Radio>
                            <Tooltip placement="right" title='根据2019年11月开始实施的《企业会计准则第30号---财务报表列报》调整后的报表模板' overlayClassName='helpIcon-tooltip'>
                                <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                            </Tooltip>                 
                        </RadioGroup>
                   </FormItem>
                   <FormItem  label={'税金项目重分类'} style={{display:accountingStandards=='2000020008'?'none':'flex', paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={resetTaxAmountAccount} onChange={(e)=>this.dateChange('resetTaxAmountAccount', e.target.value)} >
                            <Radio value={'true'} >重分类</Radio>
                            <Radio value={'false'} >不重分类</Radio>             
                        </RadioGroup>
                   </FormItem>
                   <div style={{ width: '100%', textAlign: 'right' ,paddingTop:'12px', paddingRight: '12px', borderTop:'1px solid #e8e8e8'}}>
                        <Button style={{marginRight: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                        <Button onClick={this.cancel} style={{fontSize: '12px',padding:'0px 15px'}}>取消</Button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="resetArApAccount" id="resetArApAccount" >
                   <FormItem label={'往来项目重分类'} style={{display:'flex',paddingTop:'20px',paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={radio} onChange={(e)=>this.dateChange('radio', e.target.value)} >
                            <Radio value={'true'} >重分类</Radio>
                            <Radio value={'part'} >部分重分类</Radio>
                            <Radio value={'false'} >不重分类</Radio>
                        </RadioGroup>
                   </FormItem>
                   <FormItem  label={'导出报表样式'} style={{display:ShowTemplateCode?'flex':'none', paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={templateCode} onChange={(e)=>this.dateChange('templateCode', e.target.value)} >
                            <Radio value={'0'} >老报表模板</Radio>
                            <Radio value={'1'} >新报表模板 </Radio>
                            <Tooltip placement="right" title='根据2019年11月开始实施的《企业会计准则第30号---财务报表列报》调整后的报表模板' overlayClassName='helpIcon-tooltip'>
                                <Icon type='bangzhutishi' fontFamily='edficon' style={{fontSize:'22px',top:'4px', color:'#0066b3',position:'relative',left:'-10px'}} ></Icon>
                            </Tooltip> 
                        </RadioGroup>
                   </FormItem>
                   <FormItem  label={'税金项目重分类'} style={{display:accountingStandards=='2000020008'?'none':'flex', paddingLeft:'20px',marginBottom:'20px'}}>
                        <RadioGroup value={resetTaxAmountAccount} onChange={(e)=>this.dateChange('resetTaxAmountAccount', e.target.value)} >
                            <Radio value={'true'} >重分类</Radio>
                            <Radio value={'false'} >不重分类</Radio>             
                        </RadioGroup>
                   </FormItem>
                   <div style={{ width: '100%', textAlign: 'right' ,paddingTop:'12px', paddingRight: '12px', borderTop:'1px solid #e8e8e8'}}>
                        <Button style={{marginRight: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                        <Button onClick={this.cancel} style={{fontSize: '12px',padding:'0px 15px'}}>取消</Button>
                    </div>
                </div> 
            )
        }

    }
}

export default ResetArApAccount
