import React from 'react'
import {Select} from 'edf-component'
const { Option } = Select

export default class BatchSelect extends React.Component{
    constructor(props){
        super(props)
        this.state={
            label: props.text ||'',
            value: '',
            optionList: []
        }
        this.props = props
        this.metaAction = props.metaAction
        props.setOkListener && props.setOkListener(()=>{
            return this.onOK()
        })
    }

    onOK = ()=> this.state.value && JSON.parse(this.state.value)

    handleFocus=()=>{
        this.requestList()
    }

    handleChange =(v)=>{
        const obj = JSON.parse(v)
        this.setState({label:obj.label, value: obj.value}) 
    }

    requestList = async()=>{
        const { webapi, batchType, propertyId } = this.props
        let list = []
        if(batchType==='cost'){
            let costList = await webapi.stock.acquisitionCostSubjectList()
            list = costList.map(v=>{
                const label = `${v.accountCode} ${v.salesCostAccountName}`
                const value = v.salesCostAccountId
                const val = JSON.stringify({label, value})
                return {label, value: val, disabled: (v.grade == 1 && costList.length>1)}
            })
        }else{
            let inventoryList = await webapi.stock.findEndSonListByPidList({propertyId}) || []
            let data = [], obj = {}
            inventoryList.map(v => {
                if(!obj[v.inventoryRelatedAccountId]){
                    obj[v.inventoryRelatedAccountId] = v.inventoryRelatedAccountId
                    const value = v.inventoryRelatedAccountId
                    const label = `${v.accountCode} ${v.inventoryRelatedAccountName}`
                    const val = JSON.stringify({label, value})
                    data.push({label, value: val, disabled: false})
                }  
            })
            list = data && Object.prototype.toString.call(data)==='[object Array]' ? data : []
        }
        this.setState({optionList: list})
    }

    onAdd = async () => {
        const { metaAction, store, accountCode } = this.props
        const sonListByPcodeList = accountCode
        if (metaAction) {
            const ret = await metaAction.modal('show', {
                title: '新增科目',
                width: 450,
                okText: '保存',
                style: { top: 5 },
                bodyStyle: { padding: 24, fontSize: 12 },
                children: metaAction.loadApp('app-proof-of-charge-subjects-add', {
                    store: store,
                    columnCode: "subjects",
                    active: 'archives',
                    initData: {
                        sonListByPcodeList, //父级codeId（数组）
                        isOnlyEndNode: false, //是否是末级科目
                        isEnable: true //过滤停用科目，true为过滤后 
                    }
                })
            })
            if (ret && ret.id) {
                this.requestList()
            }
        }
    }    

    render(){
        const {placeholder, spanText} = this.props
        let { optionList } = this.state
        optionList = optionList.map(v=>{
            const item = {}
            item.label = v.label
            item.value = JSON.stringify({ label:v.label, value: v.value })
            item.disabled = v.disabled ? true : false
            return item
        })

        return <div style={{textAlign: 'center'}}>
                <span>{spanText}</span>
                <Select
                    placeholder={placeholder}
                    style = {{marginLeft: '15px',maxWidth: '200px',width: '50%'}}
                    onChange = {this.handleChange}
                    onFocus = {this.handleFocus}
                    filterOption={(input, option) =>{
                            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        } 
                    }
                    dropdownMenuStyle={{maxHeight: '150px',overfloatY:'scroll',overfloatX:'hidden'}}
                    dropdownFooter={
                        <div 
                            className="add" 
                            onMouseDown={(e)=>{e.preventDefault()}}
                            onClick={()=>{this.onAdd()}} 
                            className="stock-app-select-add-btn">
                                <i className="add-img"/>
                                <span>新增</span>
                        </div>
                    }>
                        {
                            optionList.map(v=><Option style={{TextAlign:'left'}} value={v.value} >
                                    {v.label}
                            </Option>)
                        }
                </Select>
            </div>
    }
}          