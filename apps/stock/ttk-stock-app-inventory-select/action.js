import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Button, Modal } from 'antd'
// import debounce from 'lodash.debounce'
import { Map, fromJS } from 'immutable'
// 
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.list=[];
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.selectOption = []
        this.selectOptionList=[]
        // console.log(this.component.props.path, '-onInit:', this.component.props.key)
        const { init, inputValue, error, disabled } = component.props || {}
        injections.reduce('init', {
            init,
            value: inputValue,
            error,
            disabled,
        })
        this.load()
    }
    load= async () => {
        this.selectNameList=sessionStorage['inventoryNameList']
        if(this.selectOption.length==0){
            const response = await this.webapi.invoices.findInventoryList({})
            response.forEach(item=>{
                item.disabled=this.selectNameList.indexOf(item.inventoryId)>-1?true:false
            })
            this.selectOptionList = response
            console.log(response)
            this.renderSelectOption(response)
        }
    }
    renderSelectOption = (data) => {
        const arr = data.map(item => {
            return (
                <Option width={200} key={item.inventoryId} value={item.inventoryCode} 
                title={item.inventoryCode+'  '+item.inventoryName+'  '+item.inventoryGuiGe}
                disabled={item.disabled}
                >
                    {/* {item.name} */}
                    <span className='selectSpanStyle' style={{ 'width': '15%' }} >{item.inventoryCode}</span>
                    <span className='selectSpanStyle' style={{  'width': '65%' }}>{item.inventoryName}</span>
                    <span className='selectSpanStyle'   style={{  'width': '20%' }} >{item.inventoryGuiGe}</span>
                    {/* {item.code&nbsp&nbsp&nbspitem.name&nbsp&nbsp&nbspitem.guige&nbsp&nbsp&nbspitem.unit} */}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }
    componentWillReceiveProps = (nextProps) => {
        // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
        let inputValue = this.metaAction.gf('data.value')
        if (inputValue !== nextProps.inputValue) {
            this.metaAction.sf('data.value', nextProps.inputValue)
        }
        const error = this.metaAction.gf('data.error')
        const value = this.metaAction.gf('data.value')
        const disabled = this.metaAction.gf('data.disabled')
        if (error === nextProps.error && value === nextProps.inputValue && disabled === nextProps.disabled) return
        this.metaAction.sfs({
            'data.error': nextProps.error,
            'data.value': nextProps.inputValue,
            'data.disabled': nextProps.disabled,
        })
    }
    //过滤行业
    filterIndustry = (input, option) => {
        
        let flag = false;
        option.props.children.forEach(item=>{
            if(item.props.children.indexOf(input) >= 0){
                flag = true
            }
        })
        return flag
    }
    getSelectOption = () => {
        return this.selectOption
    }
    onChange = (v) => {
        const value = this.component.props.inputValue //this.metaAction.gf('data.value')
        const newValue = v.target.value
        if (value !== newValue && this.component.props.callback) {
            this.metaAction.sf('data.value', newValue)
            this.component.props.callback(newValue)
        }
    }
    onCancel = () => {
        this.metaAction.sf('data.visible', false)
    }
    rowCallback = (arr) => {
        this.metaAction.sf('data.selectedRowKeys', fromJS(arr))
    }
    btnClick =async ()  => {
        console.log(this.component.props.store.toJS)
        // const type = this.metaAction.gf('data.other.filter.columnId')
        const ret = await this.metaAction.modal('show', {
                title: '存货名称选择',
                width: 950,
                height: 520,
                style: { top: 50 },
                children: this.metaAction.loadApp('ttk-stock-app-inventory-intelligence', {
                    store: this.component.props.store,                    
                })
        })
        if (ret) {
            this.reload(ret)
        }
    }
    selectOption =async (e) => {
        
        let list = []
        this.selectOptionList.forEach(item => {
            if(item.inventoryCode==e){
                list.push(item)
                return
            }
        })
        if (this.list && this.component.props.callback) {
            this.metaAction.sfs({ 'data.value': e, 'data.visible': false })
            this.component.props.callback(list)
        }
    }
    reload = async (ret) => {
        this.list = ret;
        if (this.list && this.component.props.callback) {
            this.metaAction.sfs({ 'data.value': this.list[0].name, 'data.visible': false })
            this.component.props.callback(this.list)
        }
    }
   
    // debounce((v) => {
    // }, 150, {
    //     'leading': true,
    //     'trailing': false,
    //     'maxWait': 1000,
    // })

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}