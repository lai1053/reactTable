import React from 'react'
import { Select, Spin } from 'antd'
const { Option } = Select

class SelectName  extends React.PureComponent{
    constructor(props){
        super(props)
        this.state = {
            editable: false,
            text: props.text,
            fetching: false
        }
        this.options = props.optionList ? props.optionList : []
        this.changeCallback = props.changeCallback
    }

    componentWillReceiveProps(nextProps){
        const {text} = nextProps
        this.setState({text: text})
    }
    componentWillUpdate(){
        this.setState({'fetching': true})
        this.optionList = this.props.optionList.length===0 ? [] : this.props.optionList.map(v=>{
            const {inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit} = v
            const arr = [inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit]
            const contentText = arr.filter(v=>!!v).join('-')
            const titleTxt = inventoryName
            const content = <span>{contentText}</span>
            const param = {...v}
            const paramStr = JSON.stringify(param)
            return  <Option 
                        className="selectNameOpts" 
                        key={titleTxt} 
                        contentText={titleTxt} 
                        value={paramStr}  
                        disabled={v.disabled} 
                        title={contentText}> 
                            {content} 
                    </Option>
        })
        this.setState({'fetching': false})
    }
    componentWillUnmount(){
        this.optionList = []
        this.timer = null
    }

    divClick = (event)=>
        this.setState({editable:true})    
    
   
    handleBlur = ()=>
        this.setState({ editable: false })

    handleChange =(v)=>{
        const val = JSON.parse(v)
        this.setState({ text: val.inventoryName},()=>{
            this.timer = setTimeout(()=>{
                this.changeCallback && this.changeCallback(v)
            },500)
        })
    }

    render(){
        const {text, editable, fetching} = this.state
        const childCom = editable ? 
                <Select 
                    showSearch
                    ref={node=>(this.mySef=node)}
                    mode="mutiple"
                    style={{width: '100%'}}
                    filterOption={true}
                    autoFocus={true}
                    dropdownMenuStyle={{height: '170px'}}
                    key={this.props.key}
                    notFoundContent={fetching ? <Spin size="small"/> : []}
                    dropdownClassName="selectNameDivDropdown"
                    value={text} 
                    placeholder="请选择商品名称"
                    onBlur={this.handleBlur} 
                    onChange={this.handleChange}>
                        {this.optionList}
                </Select>  : <span className="spanText" title={text}>{text}</span>

        return<div onClick={this.divClick} className="selectNameDiv">
            {childCom}
        </div>
    }
}

export default SelectName