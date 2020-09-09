import React from 'react'
import { Button, Table,  DatePicker, Input, Form, Select } from 'edf-component'
import utils from 'edf-utils'
const FormItem = Form.Item
const Option = Select.Option

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            name: props.name || null,
            subId: props.subId || undefined,
            newSubject: props.newSubject,
            accountCode: props.accountCode,
            error:{
                name:null,
                subId: null
            }
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {   
        let {name, subId, accountCode} = this.state
        if(!name || !subId){
            this.setState({
                error: {
                    name: !name ? '请填写业务类型' : null,
                    subId: !subId ? '请填写科目' : null
                }
            })
            console.log(this.state, 'this.state')
            return false
        }else{
            return {name, accountId: subId, accountCode: accountCode}
        }
    }

    componentDidMount = async() => {
    }

    handleAddSelect = () => {
        const {newSubject} = this.state
        return newSubject && newSubject.map((item, index) => {
            return <Option key={item.id} value={item.id}>{item.codeAndName}</Option>
        })
    }
    changeName = (value) => {
        this.setState({
            name: value
        })
        const {error} = this.state
        if(error.name && value){
            error.name = null
            this.setState({
                error
            })
        }
        if(!error.name && !value){
            error.name = '请填写业务类型'
            this.setState({
                error
            })
        }
    }
    changeSub = (value) => {
        const {newSubject} = this.state
        const item = newSubject.filter(o => o.id == value)
        this.setState({
            subId: value,
            accountCode: item[0].code
        })
        const {error} = this.state
        if(error.subId && value){
            error.subId = null
            this.setState({
                error
            })
        }
    }
    filterOptionSubject = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}

    render(){
        let { name , subId, error} = this.state
        
        return (
            <Form>
                <FormItem label='业务类型' required={true} 
                    validateStatus={error.name ? 'error':'success'}
                    help={error.name}>
                    <Input 
                        value={name}
                        maxlength= {200}
                        onChange={(e) => this.changeName(e.target.value)}
                        >
                    </Input>
                </FormItem>
                <FormItem label='科目' className='subSelect' required={true} 
                    validateStatus={error.subId ? 'error':'success'}
                    help={error.subId}>
                    <Select
                        showSearch={true}
                        value={subId}
                        filterOption={this.filterOptionSubject}
                        // dropdownClassName='unit_setting_select'
                        dropdownStyle={{ width:'400px' }}
                        dropdownMatchSelectWidth={false}
                        onChange={(e) => this.changeSub(e)}
                    >
                        {this.handleAddSelect()}
                    </Select>
                </FormItem>
            </Form>
        )
    }
}

export default currentAccount
