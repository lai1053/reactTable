import React from 'react'
import {Form, Button, Input} from 'edf-component'
import webapi from '../webapi'

class ApplyForInvoice extends React.Component {
    constructor(props) {
        super()
        if (props.setOkListener) {
            // props.setOkListener(function() {
            //     let check = this.checkFields()
            //     if(check) {

            //         return true
            //     }else {
            //         return false
            //     }
            // }.bind(this))
            props.setOkListener(this.checkFields.bind(this))
        }
        this.state = {
            invoiceHead: 1,
            name: '',
            vatTaxpayerNum: '',
            nameCheck: undefined,
            vatTaxpayerNumCheck: undefined,
            headCheck: undefined,
        }
    }

    changeInvoiceHead(key) {
        this.setState({
            invoiceHead: key
        })
    }

    handleNameChange(e) {
        let value = e.target.value
        this.setState({
            name: value
        })
    }

    handleNumChange(e) {
        let value = e.target.value
        this.setState({
            vatTaxpayerNum: value
        })
    }

    handleHeadChange(e) {
        let value = e.target.value
        this.setState({
            head: value
        })
    }
    
    // 校验字段
    checkFields = async () => {
        let name = this.state.name,
            vatTaxpayerNum = this.state.vatTaxpayerNum,
            head = this.state.head,
            invoiceHead = this.state.invoiceHead
        if(invoiceHead == 1) {
            if(!name) {
                this.setState({
                    nameCheck: '企业名称不能为空'
                })
            }
            // if(!vatTaxpayerNum) {
            //     this.setState({
            //         vatTaxpayerNumCheck: '纳税人识别号不能为空'
            //     })
            // }
            let message
            let res = await webapi.org.validevatTaxpayerNum({vatTaxpayerNum})
            if(res.state){
                message = undefined
            }else{
                message = res.message
            }
            this.setState({
                vatTaxpayerNumCheck: message
            })
            if(!name || message) {
                return false
            }else {
                let res = await webapi.invoice.applyForInvoice({
                    id: this.props.order.id,
                    orderInvoice: {
                        titleType:invoiceHead,
                        title: name,
                        vatTaxpayerNum: vatTaxpayerNum,
                    }
                })
                if(!res) {
                    return false
                }
                return true
            }
        }else {
            if(!head) {
                this.setState({
                    headCheck: '发票抬头不能为空'
                })
            }
            if(!head) {
                return false
            }else {
                let res = await webapi.invoice.applyForInvoice({
                    id: this.props.order.id,
                    orderInvoice: {
                        titleType:invoiceHead,
                        title: head,
                        vatTaxpayerNum: '',
                    }
                    
                })
                if(!res) {
                    return false
                }
                return true
            }
        }
    }

    render() {
        let data = this.state
        return (
            <div style={{width: '516px'}} className="applyForInvoiceModal">
                <Form.Item label="发票内容">
                    <span style={{width: '270px', display: 'block'}}>服务费</span>
                </Form.Item>
                <Form.Item label="发票金额">
                    <span style={{width: '270px', display: 'block'}}>{'¥' + this.props.order.amount}</span>
                </Form.Item>
                <Form.Item label="发票抬头" required={true} style={{marginBottom: '12px'}}>
                    <div style={{width: '270px'}} className="invoiceHead">
                        <Button style={{marginRight: '8px'}} onClick={this.changeInvoiceHead.bind(this, 1)} className={data.invoiceHead == 1 ? 'active' : ''}>企业</Button>
                        <Button onClick={this.changeInvoiceHead.bind(this, 2)} className={data.invoiceHead == 2 ? 'active' : ''}>个人</Button>
                    </div>
                </Form.Item>
                {data.invoiceHead == 1 ?
                <span><Form.Item label="企业名称" style={{marginBottom: '14px'}} required={true} validateStatus={!!data.nameCheck ? 'error' : ''} help={data.nameCheck}>
                    <Input style={{width: '270px'}} onChange={this.handleNameChange.bind(this)} value={data.name} onFocus={() => {this.setState({nameCheck: undefined})}}/>
                </Form.Item>
                <Form.Item label="纳税人识别号" style={{marginBottom: '14px'}} required={true} validateStatus={!!data.vatTaxpayerNumCheck ? 'error' : ''} help={data.vatTaxpayerNumCheck}>
                    <Input style={{width: '270px'}} onChange={this.handleNumChange.bind(this)} value={data.vatTaxpayerNum} onFocus={() => {this.setState({vatTaxpayerNumCheck: undefined})}}/>
                </Form.Item></span>
                
                :
                <Form.Item label="发票抬头" style={{marginBottom: '14px'}} required={true} validateStatus={!!data.headCheck ? 'error' : ''} help={data.headCheck}>
                    <Input style={{width: '270px'}} onChange={this.handleHeadChange.bind(this)} value={data.head} onFocus={() => {this.setState({headCheck: undefined})}}/>
                </Form.Item>
                }
            </div>
        )
    }
}

export default ApplyForInvoice