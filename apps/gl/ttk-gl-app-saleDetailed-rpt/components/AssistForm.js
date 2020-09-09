import React from 'react'
import { Checkbox, Icon, Select } from 'edf-component'

const Option = Select.Option


class FormList extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            itemList: [{
                name: '部门',
                children: '相关信息',
                key: '1'
            },{
                name: '人员',
                children: '人员',
                key: '2'
            },{
                name: '客户',
                children: '客户',
                key: '3'
            },{
                name: '供应商',
                children: '供应商',
                key: '4'
            },{
                name: '存货',
                children: '存货',
                key: '5'
            },{
                name: '项目',
                children: '项目',
                key: '6'
            }],
            selectValue: [],
            expandKey: ''
        }
    }

    changeList = (a, b) => {
        const { itemList } = this.state 
        const item1 = itemList[a]
        const item2 = itemList[b]
        itemList[a] = item2
        itemList[b] = item1
        return itemList
    }

    moveToUp = (key) => {
        const { itemList } = this.state
        const index = itemList.findIndex(item => item.key == key)
        if( index == 0) {
            return 
        }
        const data = this.changeList(index-1, index)
        this.setState({
            itemList: data
        })
    }

    moveToDown = (key) => {
        const { itemList } = this.state
        const index = itemList.findIndex(item => item.key == key)
        if( index == itemList.length - 1) {
            return 
        }
        const data = this.changeList(index, index+1)
        this.setState({
            itemList: data
        })
    }

    checkboxChange = (key) => {
        const { selectValue } = this.state
        const pre = selectValue.length
        const flag = selectValue.filter(item =>  item != key)
        const next = flag.length
        if( pre == next ) {
            flag.push(key)
        }
        this.setState({
            selectValue: flag
        })
    }

    expandItem = (key) => {
        this.setState({
            expandKey: this.state.expandKey == key ? '' : key
        })
    }

    renderList = (data) => {
        const children = []
        for (let i = 10; i < 36; i++) {
        children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
        }
        const { selectValue, expandKey } = this.state
        return data.map(item => {
            return (
                <div className="item-list" key={item.key}>
                    <div className="item-list-top">
                        <div className="item-list-top-title">
                            <Checkbox 
                                checked={selectValue.includes(item.key)}
                                onClick={() => this.checkboxChange(item.key)}
                            />
                            <span>{item.name}</span>
                        </div>
                        <div className="item-list-top-line"></div>
                        <div className="item-list-top-line-action">
                            <span onClick={ ()=> this.expandItem(item.key) }><Icon type="down" /></span>
                            <span onClick={() => this.moveToUp(item.key)}><Icon type="arrow-up" /></span>
                            <span onClick={() => this.moveToDown(item.key)}><Icon type="arrow-down" /></span>
                        </div>
                    </div>
                    <div 
                        className="item-list-bottom"
                        style={{
                            display: `${expandKey == item.key ? 'block' : 'none'}`
                        }}
                    >
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                        >
                            {children}
                        </Select>
                    </div>
                </div>
            ) 
        })
    }

    render(){
        const { itemList } = this.state
        return (
            <div className="FormList">
                {this.renderList(itemList)}
            </div>
        )
    }

    getValue = () => {
        return this.state
    }
}
export default FormList