import React from 'react'
import { Select } from 'edf-component'
import { Spin } from 'antd'
// import img from '../commonAssets/add.png'
import { fetch } from 'edf-utils'
const { Option } = Select;

class SelectCost  extends React.PureComponent{
    constructor(props){
        super(props)
        this.state = {
            editable: false,
            label: props.text,
            optionList: [],
            fetching: false
        }
        this.props = props
        this.changeCallback = props.changeCallback
    }

    componentWillUnmount(){
        this.optionList = []
    }

    divClick = (event)=>{
        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()
        this.setState({editable:true})
    }
    
    requestList = async ()=>{
        const {webapi} = this.props
        // let costList = await webapi.stock.acquisitionCostSubjectList() || []
        let costList = await fetch.post('/v1/biz/bovms/stock/common/acquisitionCostSubjectList') || []
        let optionList = costList.map(v=>{
            const label = `${v.accountCode} ${v.salesCostAccountName}`
            const value = v.salesCostAccountId
            const val = JSON.stringify({label, value})
            return {label, value: val, disabled: (v.grade == 1 && costList.length>1)}
        })
        this.setState({ optionList, fetching: false });
    }

    handleFocus = (event)=>{
        this.setState({fetching: true})
        this.requestList()
    }
   
    handleBlur = ()=>{
        this.setState({ editable: false, optionList: [] })
    }

    handleChange =(v)=>{
        const val = JSON.parse(v)
        this.setState({ label: val.label},()=>{
            this.setState({editable: false })
            setTimeout(()=>{
                this.changeCallback && this.changeCallback(val)
            },100)
        })
    }

    onAdd = async () => {
        const { metaAction, store} = this.props;
        const currentOrg = metaAction.context.get('currentOrg')
        const sonListByPcodeList = currentOrg.accountingStandards == '2000020001' ? ['6401', '6402'] : ['5401', '5402']  // 企业会计准则不同，编码不同
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
        const label = this.state.label
        const {optionList, fetching} = this.state
        // const {error,text} = this.props
        // const childCom = this.state.editable ? <Select></Select> : <span className="spanText" style={{borderColor: error? '#ff4600':'#d9d9d9'}} title={text}> {text} </span>

        return (
            <div onClick={this.divClick} className="batchSelect">
                {/* {childCom} */}
                <Select 
                    showSearch
                    ref={node=>(this.mySef=node)}
                    mode="mutiple"
                    style={{width: '100%'}}
                    filterOption={true}
                    autoFocus={true}
                    key={this.props.key}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    filterOption={true}
                    value={label} 
                    title={label}
                    placeholder="请选择商品名称"
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur} 
                    onChange={this.handleChange}
                    dropdownMenuStyle={{maxHeight: '170px',overfloat:'scroll'}}
                    dropdownFooter={
                        <div className="add" onMouseDown={(e)=>{e.preventDefault()}} onClick={()=>{this.onAdd()}} className="stock-app-select-add-btn">
                            <i className="add-img"/>  <span>新增</span>
                        </div>
                    }>
                        {
                            optionList.map(v=>{
                                if(v && v!==null && v!==undefined && v.label ){
                                    let {label,value,disabled} = v
                                    const labelArr = label && label.split(' ')
                                    const content = <span> { labelArr.map( v=> <span> {v} </span>) } </span>
                                    disabled = disabled && optionList.length > 1 ? true : false  // 处理为undefined的情况
                                    return <Option className="selectNameOpts" key={label} contentText={label} value={value}  title={label}> 
                                                {content} 
                                            </Option>
                                }
                            })
                        }
                </Select>
            </div>
        )
    }
}

export default SelectCost