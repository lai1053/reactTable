import React from 'react'
import moment from 'moment'
// import Checkbox from '../checkbox/index'
// import Button from '../button/index'
// import Select from '../antdSelect/index'
// import Radio from '../radio/index'
import { Select, Button, Checkbox, Radio } from 'edf-component'
const RadioGroup = Radio.Group
const Option = Select.Option
class PrintOptionComponent2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isAllInOne: false,
      isOnlyEndNode: false
    }
  }

  onChange = (e, path) => {
    this.setState({
      [path]: e.target.checked
    })
  }

  confirm = () => {
    this.props.closeModal()
    this.props.callBack(this)
  }
  cancel = () => {
    this.props.closeModal()
  }

  getValue = () => {
    return this.state
  }

  radioChange = (e, path) => {
    this.setState({
      [path]: e.target.value
    })
  }
  render() {
    const { isAllInOne } = this.state
    return (
      <div className="printOption2">
        <div className="printOption2-contaienr">
          <div clssName="printOption2-contaienr-item" style={{ margin: '45px 0px', paddingLeft:'20px'}}>
            <RadioGroup onChange={(e) => this.radioChange(e, 'isAllInOne')} value={isAllInOne}>
              <Radio value={false} style={{ fontSize: '12px' }}>不同科目分页签导出</Radio>
              <Radio value={true} style={{ fontSize: '12px' }}>不同科目同页签连续导出</Radio>
            </RadioGroup>
          </div>
        </div>
        <div className="printOption-bottom" style={{ borderTop:'1px solid #e8e8e8',textAlign: 'right', marginTop: '20px', paddingRight: '8px', fontSize: '12px', paddingTop: '12px',paddingBottom:'12px'}}>
          <Button style={{ marginRight: '8px', padding: '0 15px', height: '32px', fontSize: '12px' }} type='primary' onClick={this.confirm}>确定</Button>
          <Button onClick={this.cancel} style={{ padding: '0 15px', height: '32px', fontSize: '12px' }}>取消</Button>
        </div>
      </div>
    )
  }
}

export default PrintOptionComponent2
