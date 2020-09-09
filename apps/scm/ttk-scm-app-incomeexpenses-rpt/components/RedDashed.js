import React from 'react'
import { Form, DatePicker, Radio, Button, Cascader } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item

class SortProofComponent extends React.Component{
    constructor(props){
        super(props)
        this.father = props.that
        this.state = {
            options: this.props.options,
            businessTypeId: '',
            list: this.props.list
        }
    }

    componentDidMount = () => {
        
    }

    getValue= () => {
        return this.state
    }

    onFieldChange = (value) => {
        this.setState({ businessTypeId: value })
    }

    filter = (inputValue, path) => {
        return (path.some(option => (option.label).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }

    cancel = () => {
        this.props.closeModal()
    }

    confirm = () => {
        if(!this.state.businessTypeId){
            this.father.metaAction.toast('warning', '请选择收支类型')
            return false
        }
        this.props.closeModal()
        // this.props.callBack(this)
        this.props.callBack(this.state.businessTypeId, 'businessTypeId')
    }

    render(){
        const { options, businessTypeId } = this.state
        return (
            <div className = 'ttk-scm-app-batch-orders-reddashed'>
                <Form>
                    <FormItem label='收支类型'>
                        <Cascader placeholder='收支类型' 
                            value={businessTypeId}
                            options={options}
                            expandTrigger='hover'
                            popupClassName= "ttk-scm-app-batch-orders-Cascader"
                            allowClear={false}
                            showSearch = {this.filter}
                            onChange={(value) => this.onFieldChange(value)}
                            >
                        </Cascader>
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
