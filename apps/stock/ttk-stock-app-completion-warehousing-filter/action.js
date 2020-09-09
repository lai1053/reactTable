import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Icon } from 'antd'
import { fromJS, toJS } from 'immutable'
import StockAppCompletionWarehousingFilter from '../components/StockAppCompletionWarehousing/StockAppCompletionWarehousingFilter'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.props = this.component.props
        this.webapi = this.config.webapi
        const {selectOptions} = component.props || []
        injections.reduce('init',{selectOptions})
    }

    renderPage = () => {
        return <StockAppCompletionWarehousingFilter 
            component={this.component} 
            webapi={this.webapi}
            store={this.component.props.store}
            metaAction={this.metaAction}
        />
    }
    

    load = async()=>{
        let options,
            requestParams = this.component.props.requestParams ||{}
        if(this.component.props.selectOptions===undefined || !this.component.props.selectOptions){
            let res = await this.webapi.stock.getInventoryTypesFromArchives(requestParams)//存货科目
            if(res && Object.prototype.toString.call(res)==='[object Array]'){
                options = this._parseSelectOption(res)
                options.splice(0, 0, {inventoryClassId: '',inventoryClassName: '全部', isCompletion: false})
            }else{
                this.metaAction.toast('error', res)
                options = []
            }
        }else{
            options = this.component.props.selectOptions || []
        }
        this.metaAction.sf('data.optionList',fromJS(options))
    }

    // 去重
    _parseSelectOption= (data)=>{
        const obj = {}, selectOptions = []
        data.map(v=>{     
            if(!obj[v.inventoryClassId]){
                obj[v.inventoryClassId] = v.inventoryClassId
                const {inventoryClassId, inventoryClassName} = v
                selectOptions.push({inventoryClassId, inventoryClassName}) 
            }
        })
        return selectOptions
    }
    // 输入框过滤
    handleInputChange=(e)=>{
        this.metaAction.sf('data.inputVal',e.target.value)
        this.component.props.callback && this.component.props.callback({name:e.target.value})
    }

    // 输入框回车事件
    handlePressEnter =(e)=> (this.component.props.callback && this.component.props.callback({name:e.target.value}))

    // 下拉框显示隐藏
    handleVisibleChange = (v)=>{ this.metaAction.sf('data.visible', v) }

    // 下拉列表选中
    selectChange = (v)=>{ this.metaAction.sf('data.form.inventoryType',v) }

    //渲染放大镜
    prefixIcon =()=> <Icon type="search" onClick={()=>{this.iconSearch()}}/> 

    // 放大镜点击事件
    iconSearch =()=>{
        const v = this.metaAction.gf('data.form.inventoryType')
        this.component.props.callback && this.component.props.callback({name:v})
    }
    // 重置
    handlePopoverReset =()=>{
        const inpVal = this.metaAction.gf('data.inputVal')
        this.metaAction.sf('data.form.inventoryType',undefined)
        this.component.props.callback && this.component.props.callback({name:inpVal, inventoryClassId:''})
        this.metaAction.sf('data.visible', false)
    }
    // 确定
    handlePopoverConfirm=()=>{
        const inventoryTypeVal = this.metaAction.gf('data.form.inventoryType')
        const inpVal = this.metaAction.gf('data.inputVal')
        this.component.props.callback && this.component.props.callback({name:inpVal, inventoryClassId:inventoryTypeVal})
        this.metaAction.sf('data.visible', false)
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

