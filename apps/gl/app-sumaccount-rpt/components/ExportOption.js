import React from 'react'
import moment from 'moment'
import { Radio,Select,Checkbox, Button, InputNumber } from 'antd'
const Option = Select.Option;
const RadioGroup = Radio.Group;
const maxLineNum = [5,6,7]
const width = [190, 195, 200, 205, 210, 215, 220]
const height = [100, 105, 110, 115, 120, 125, 130]
class PrintOptionComponent3 extends React.Component{
    constructor(props){
        super(props)
        const { samePage } = props
        this.state = {
           
            samePage: samePage || false
        }
    }
    componentWillReceiveProps(nextProps){
        const { samePage } = nextProps

        this.setState({
            samePage: samePage || false
        })
    }
    changeRadioState = (e) => {
        this.setState({
            value: e.target.value,
        })
    }
    changeAccount = (e) => {
        this.setState({
            printAccountChecked: e.target.checked,
        })
    }
    changeQuantity = (e) => {
        this.setState({
            printQuantityChecked: e.target.checked,
        })
    }
    changeMultiCurrency = (e) => {
        this.setState({
            printMultiChecked: e.target.checked,
        })
    }

    changePageSize = (e) => {
        this.setState({
            pageSize: e
        })
    }
    changeWidth = (e) => {

        this.setState({
            width: e
        })
    }
    changeHeight = (e) => {
        this.setState({
            height: e
        })
    }

    changeState = (e, nameStr ) => {
        this.setState({
            [nameStr]: e
        })
    }

    confirm = () => {
        this.props.closeModal()
        this.props.callBack(this.state)
    }
    cancel = () => {
        this.props.closeModal()
    }

    render(){
        console.log(this.state.samePage)
        return (
            <div className="printOption" style={{padding: '12px 0px'}}>

              <form>
                <div className="ant-form-item ant-form-item-compact" style={{padding: '0px 12px'}}>
                    <div className="col-18"> 
                       
                        <div clssName="printOption2-contaienr-item" style={{ marginTop: '14px'}}>
                        <RadioGroup  onChange={(e) => this.changeState(e.target.value, 'samePage')} value={this.state.samePage}>
                            <Radio value={false} style={{fontSize:'12px'}}>不同科目分页签导出</Radio>
                            <Radio value={true} style={{fontSize:'12px'}}>不同科目同页签连续导出</Radio>
                        </RadioGroup>
                        </div> 
                    </div>
                </div>
              </form>
                <div style={{ width: '100%', textAlign: 'right', paddingTop:'12px',paddingRight:'12px',borderTop: '1px solid #e8e8e8' }}>
                    <Button style={{marginRight: '8px',fontSize:'12px'}} type='primary' onClick={this.confirm}>保存</Button>
                    <Button style={{fontSize:'12px'}} onClick={this.cancel}>取消</Button>
                </div>
            </div>
        )
    }
}

export default PrintOptionComponent3
