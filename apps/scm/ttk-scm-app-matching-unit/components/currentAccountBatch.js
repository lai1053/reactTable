import React from 'react'
import { Form, Radio, Button, Table, Input, Select } from 'edf-component'
const FormItem = Form.Item

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            webapi: props.webapi,
            batchSelect: props.vatOrEntry ? "2202 应付账款" : "1122 应收账款",
            vatOrEntry: props.vatOrEntry,
            list: props.list,
            selectObj: {}
        }
        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
        if( props.setCancelLister ) {
            props.setCancelLister(this.onCancel)
        }
    }

    onOk = async() => {
        let selectObj = this.state.selectObj
        // debugger
        if (selectObj.id) {
            return selectObj
        } else {
            const list = this.state.list
            let obj = list.find(o=> {
                const value = this.props.vatOrEntry ? "2202 应付账款" : "1122 应收账款"
                if (o.codeAndName == value) {
                    return true
                } 
            })
            return obj
        }
    }
    onCancel = async() => {
        // console.log('onCancel')
    }

    changeSelect = (value) => {
        const list = this.state.list
        // debugger
        const selectObj = list.find(o=> {
            if (o.codeAndName == value) {
                return true
            } 
        })
        this.setState({
            batchSelect: value,
            selectObj: selectObj ? selectObj : {}
        })
    }

    getSelectOption = (vatOrEntry) => {
        let optionA = this.state.list
        // if(vatOrEntry){
        //     optionA = [{
        //         id: 3000150004,
        //         name: '2202 应付账款'
        //     },{
        //         id: 3000150005,
        //         name: '1123 预付账款'
        //     }]
        // }else{
        //     optionA = [{
        //         id: 3000150001,
        //         name: '1122 应收账款'
        //     },{
        //         id: 3000150002,
        //         name: '2203 预收账款'
        //     }]
        // }
        return optionA.map(item => {
            return <Option title={item.codeAndName} value={item.codeAndName}>{item.codeAndName}</Option>
        })
    }

    render(){
        const {vatOrEntry, batchSelect} = this.state
        return (
            <div className="subject">
                <span>上级科目 </span>
                <Select style={{ width: '100%' }}
                    value={batchSelect}
                    onChange={(value) => this.changeSelect(value)}>
                    {this.getSelectOption(vatOrEntry)}
                </Select>
            </div>
        )
    }
}

export default currentAccount
