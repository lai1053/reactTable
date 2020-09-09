import React from 'react'
import { Spin } from 'antd'
import { Select } from 'edf-component'
import { fetch } from 'edf-utils'
const { Option } = Select;

class SelectSubject  extends React.PureComponent{
    constructor(props){
        super(props)
        // this.lastFetchId = 0;
        this.state = {
            editable: false,
            label: props.text,  // select 的默认值
            data: [],
            value: [],
            fetching: false,
        }
        this.props = props
        this.store = this.props.store
        this.webapi = props.webapi
        this.changeCallback = props.changeCallback  // 回调
    }
    componentWillUpdate(){ this.setState({label:this.props.text}) }
   
    componentWillUnmount(){ }

    divClick = event => {
        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()
        if(this.input && this.input.onFocus) {
            this.input.onFocus()
            this.input.open = true
            this.handleFocus()
        } 
        this.setState({editable: true}) 
    }

    reqStockSubjectList =async()=>{
        let reqParams = this.props.reqParams || {}
        // let list = await this.webapi.stock.findEndSonListByPidList(reqParams)
        let list = await fetch.post('/v1/biz/bovms/stock/common/findEndSonListByPidList', reqParams)
        // 解析并去重
        const obj = {}
        let data = []
        if(list && Object.prototype.toString.call(list)==='[object Array]'){
            list.map(v => {
                if(!obj[v.inventoryRelatedAccountId]){
                    obj[v.inventoryRelatedAccountId] = v.inventoryRelatedAccountId
                    const value = v.inventoryRelatedAccountId
                    const label = `${v.accountCode} ${v.inventoryRelatedAccountName}`
                    const val = JSON.stringify({label, value})
                    data.push({label, value: val})
                } 
                return v 
            })
        }
        data = data && Object.prototype.toString.call(data)==='[object Array]' ? data : []
        this.setState({ data, fetching: false });
    }

    handleFocus = async(value) => {
        this.setState({ data: [], fetching: true});
        const data = await this.reqStockSubjectList()
      };

    handleBlur = ()=> this.setState({ editable: false }) 

    handleChange =(v)=>{
        const val = JSON.parse(v)
        this.setState({ label: val.label },()=>{
            this.setState({ editable : false})
            setTimeout(()=>{
                this.changeCallback && this.changeCallback(val)
            }, 500)
        })  
    }

    onAdd = async () => {
        const { metaAction, store, accountCode} = this.props;
        const sonListByPcodeList = [accountCode]
        let {data} = this.state
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
                this.reqStockSubjectList()
            }
        }
    }    

    render(){
        let {error,placeholder,text} = this.props
        const { fetching, data, value , editable, label} = this.state
        // const childCom = editable ? <Select/>: <span className="spanText"  style={{borderColor: error? '#ff4600':'#d9d9d9'}} title={text} >{text} </span>

        return(
            <div className="batchSelect">  {/* onClick={ this.divClick } */} 
                {/* {childCom} */}
                <Select
                    value={label}
                    title={label}
                    placeholder={text}
                    autoFocus={true}
                    key={this.props.key}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={true}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onChange={this.handleChange}
                    style={{ width: '100%' }}
                    autoFocus={true}
                    ref={refs=> {this.input = refs && refs.props }}
                    dropdownMenuStyle={{maxHeight: '170px',overfloatY:'scroll',overfloatX:'hidden'}}
                    dropdownFooter={
                        <div className="add" onMouseDown={(e)=>{e.preventDefault()}} onClick={()=>{this.onAdd()}} 
                            className="stock-app-select-add-btn"> <i className="add-img"></i> <span>新增</span> </div>
                    }
                >
                    { 
                        data.map(v=>{
                            let {label, value, disabled} = v
                            disabled = disabled ? true : false
                            const labelContent = <span> { label.split(' ').map( v=> <span> {v} </span> )} </span>
                            return <Option className='selectNameOpts' value={value} key={label}   
                                        disabled={disabled} style={{textAlign:'left'}} title={label}> 
                                            {labelContent} 
                                    </Option>
                        }) 
                    }
                </Select>

            </div>
        )
    }
}

export default SelectSubject