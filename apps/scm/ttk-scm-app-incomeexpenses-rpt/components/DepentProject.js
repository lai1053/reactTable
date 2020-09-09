import React from 'react'
import { Form, DatePicker, Radio, Button, Select } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const Option = Select.Option

class SortProofComponent extends React.Component{
    constructor(props){
        super(props)
        this.father = props.that
        this.state = {
            options: this.props.options,
            value: '',
            type: this.props.type
        }
    }

    componentDidMount = () => {
        
    }

    getValue= () => {
        return this.state
    }

    onFieldChange = (value) => {
        this.setState({ value: value })
    }

    cancel = () => {
        this.props.closeModal()
    }

    confirm = () => {
        if(!this.state.value){
            if(this.state.type == 'project'){
                this.father.metaAction.toast('warning', '请选择项目')
            }else{
                this.father.metaAction.toast('warning', '请选择部门')
            }
            return false
        }
        this.props.closeModal()
        // this.props.callBack(this)
        this.props.callBack(this.state.value,this.state.type == 'project' ? 'project' : 'department')
    }

    selectOption = () => {
        let list = this.state.options
        return list.map(item => {
            return <Option value={item.id} title={item.name}>{item.name}</Option>
        })
    }

    render(){
        const { value } = this.state
        return (
            <div className = 'ttk-scm-app-batch-orders-reddashed'>
                <Form>
                    <FormItem label='收支类型'>
                        <Select placeholder='收支类型' 
                            value={value}
                            style={{width: '200px'}}
                            onChange={(value) => this.onFieldChange(value)}
                            >
                            {this.selectOption()}
                        </Select>
                    </FormItem>
                </Form>
                <div style={{ width: '100%', textAlign: 'center',  padding: '10px 0', borderTop: '1px solid #e8e8e8'}}>
                    <Button style={{fontSize: '12px',padding:'0px 15px'}} onClick={this.cancel} >取消</Button>
                    <Button style={{marginLeft: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                </div>
            </div>
        )
    }
}

export default SortProofComponent
