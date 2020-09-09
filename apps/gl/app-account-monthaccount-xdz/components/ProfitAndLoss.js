import React from 'react'
import { Form, Radio, Button, Input, Icon, Popover } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group
import { message } from 'antd';
import utils from 'edf-utils'
class InventoryCostingComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      period: props.period,
      profitAmount: this.zeroProcess(props.editInfo, 'profitAmount'),
      lossAmount: this.zeroProcess(props.editInfo, 'lossAmount'),
      docProduceModel: props.editInfo?props.editInfo.docProduceModel:0,
      canEdit: props.editInfo?props.editInfo.canEdit: true 
    }
  }

  zeroProcess = (editInfo, fieldName) => {
      
      if (editInfo && editInfo[fieldName] && editInfo[fieldName] != 0) {
          return editInfo[fieldName]
      } else {
          return '0.00'
      }
  }

  confirm = () => {
    this.props.closeModal()
    this.props.callBack(this)
  }
  cancel = () => {
    this.props.closeModal()
  }
  radioChange = async (type, value) => {
    console.log(type, value)
      //结转方式
      this.setState({
        docProduceModel: value
      })
  }

  render() {
    let { profitAmount,lossAmount,docProduceModel,canEdit } = this.state

    console.log('lossAmount:' + lossAmount)

    return (
      <div>
        <div className="inventoryCosting" style={{ padding: '0px 15px', marginBottom: '25px' }}>
          <div style={{
            height: '137px', width: '350px', marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
          <div style={{marginBottom:'15px'}}>
            <span >收入：</span><span style={{marginRight:'25px'}}>{profitAmount}</span>
            <span>成本费用：</span><span>{lossAmount}</span>
          </div>
            <FormItem >
              <RadioGroup value={Number(docProduceModel)} disabled={!canEdit} onChange={(e) => this.radioChange('docProduceModel', e.target.value)}>
                <Radio value={0}>收入、成本费用科目合并结转</Radio>
                <Radio value={1}>收入、成本费用科目分开结转</Radio>
              </RadioGroup>
            </FormItem>
          </div>
        </div >
        <div className="btnContainer" style={{ PaddingRight: '10px',textAlign:'right' }}>
          <Button style={{ marginRight: '8px', fontSize: '12px', padding: '0px 15px' }} type='primary' onClick={this.confirm}>保存</Button>
          <Button onClick={this.cancel} style={{ fontSize: '12px', padding: '0px 15px' }}>取消</Button>
        </div>
      </div >
    )
  }
}

export default InventoryCostingComponent
