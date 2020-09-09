import React from 'react'
import { Checkbox } from 'edf-component'
import {stockLoading} from '../../commonAssets/js/common'
import { Button } from 'antd'
// 领料范围三个默认选中项
const OPTIONS = [{
    "id": 2,
    "code": "YCL",
    "name": "原材料",
    "isSelect": true
},{
    "id": 4,
    "code": "ZZCL",
    "name": "周转材料",
    "isSelect": true
},{
    "id": 23,
    "code": "WTJG",
    "name": "委托加工物资",
    "isSelect": true
}]
const SELECTED = OPTIONS.map(v=>v.id)  // 选中项id集合

class PickingLimits extends React.Component{
    constructor(props){ 
        super(props)
        this.state={
            optionList: [...OPTIONS],
            selections: [] 
        }
        this.component = props.component
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }

    async componentWillMount(){
        this.setState({
            loading: true
        })
        this.options = await this.webapi.stock.queryPickRange()  //已经设置好的领料范围数据选项
        let { optionList=[], selections=[] }= this.state
        if(this.options && Array.isArray(this.options)){
            for(const v of this.options){
                if(v.isSelect){
                    selections.push(v.id)
                    selections = Array.from(new Set(selections))
                }
            }
            optionList = this.options
        }
        selections = selections.length > 0? selections : [...SELECTED]  // 如果已设置，用设置好的领料范围，如果未设置，采用默认领料范围
        
        this.setState({
            optionList: [...optionList],
            selections,
            loading: false
        })
    }

    save = async()=>{
        const { optionList=[]} = this.state
        const hasSelect = optionList.some(v=>v.isSelect)
        if(!hasSelect){
            this.metaAction.toast('error', '请选择存货类型')
            return 
        }
        this.setState({loading: true})
        const ret = await this.webapi.stock.savePickRange(optionList)
        this.setState({loading: false})
       return this.props.closeModal(ret)
    }

    cancel=()=>this.props.closeModal(false)

    onOk = async()=>  await this.save()

    /* 
    @description: checkbox改变触发的时间
    @params {array} checkedValues 选中的选项id集合
    */
    onChange=(checkedValues)=>{
        let {optionList=[]} = this.state
        optionList.forEach(v=>{
            v.isSelect = checkedValues.includes(v.id) 
        })
        this.setState({
            selections: checkedValues,
            optionList
        })
    }

    render(){
        const { optionList=[], selections=[], loading} = this.state
        const key = optionList.reduce((total,v)=>total+v.id, '')
        const list = optionList.map(v=>({
            label: v.name,
            value: v.id
        }))
        return(
            <React.Fragment>
                <div className="picking-limits-container">
                    {loading && stockLoading()}
                    <h4>请选择参与领料的存货类型：</h4>
                    <Checkbox.Group options={list} defaultValue={selections} onChange={this.onChange} key={key}/>
                </div>
                <div className="picking-limits-footer">
                    <Button type='primary' onClick={this.save}>保存</Button>
                    <Button type='default' onClick={this.cancel}>取消</Button>
                </div>
            </React.Fragment>
        )
    }
}

export default PickingLimits