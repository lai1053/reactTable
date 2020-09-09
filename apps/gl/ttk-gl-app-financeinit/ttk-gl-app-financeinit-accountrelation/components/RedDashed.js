import React from 'react'
import { Form, DatePicker, Radio, Button, Select } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const Option = Select.Option

class SortProofComponent extends React.Component{
    constructor(props){
        super(props)
        //props.subject.glAccount.isCalcQuantity = true
        //props.used = true
        this.father = props.that
        this.state = {
            unit: props.currentRow && props.currentRow.accountDto && props.currentRow.accountDto.unitId ? {
                id: props.currentRow.accountDto.unitId,
                name: props.currentRow.accountDto.unitName
            } : '',
            unitList: [],
            subject: props.subject,
            currentRow: props.currentRow,
            index: props.index,
            isEnable: props.used && props.subject && props.subject.glAccount && props.subject.glAccount.isCalcQuantity
        }
    }

    componentDidMount = () => {
        this.getUnitList()
    }

    getValue= () => {
        return this.state
    }

    //编辑
    unitListEdit = async () => {
        const ret = await this.father.metaAction.modal('show', {
			title: '计量单位',
			width: 840,
			style:{ top: 40},
			bodyStyle: { height: 500, paddingTop: 0, },
            footer: '',
			className: 'app-proof-of-charge-modal',
			children: this.father.metaAction.loadApp(`app-list-unit?from=subjects`, {
				store: this.father.component.props.store,
				modelStatus: 1
			}),
        })
        
        this.getUnitList()
    }

    getUnitList = async () => {
        //编辑关闭后判断有没有这个id,没有就清除state.unit
        let res = await this.father.webapi.financeinit.getUnit()
        this.setState({unitList: res.list})
        if(this.state.unit.id){
            let option = res.list.filter(m => m.id == this.state.unit.id)
            if(!option.length){
                this.setState({ unit: "" })
            }
        }
    }

    //搜索
    filterOptionSummary = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}

    //下拉新增
    handleAddRecord = () => {
        const add = `addUnit`
        return <Button type='primary' 
        style={{ width: '100%', borderRadius: '0' }}
        onClick={this.addModel}
        >新增</Button>
    }

    //下拉选
    handleSelect = (params) => {
        return params.map((item,index) => {
            return <Option key={item.id} value={item && item.id}>{item && item.name}</Option>
        })
    }

    //新增计量单位
    addModel = async () => {
		const ret = await this.father.metaAction.modal('show', {
			title: '计量单位',
			className: 'app-list-unit-modal',
			wrapClassName: 'card-archive',
			width: 350,
			height: 280,
			children: this.father.metaAction.loadApp('app-card-unit', {
				store: this.father.component.props.store
			})
        })
		if (ret) {
            let unitList = this.state.unitList
            unitList.push(ret)
            this.setState({unitList: unitList })
            this.setState({unit: ret })
		}
    }
    
    //计量单位改变
    unitChange = (e) => {
        let unitList = this.state.unitList
        let option = unitList.filter(m => m.id == e)
        this.setState({unit: option[0] })
    }

    cancel = () => {
        this.props.closeModal()
    }

    confirm = () => {
        let unit = this.state.unit
        if(!unit.id){
            this.father.metaAction.toast('error', '请选择计量单位')
            return
        }
        this.props.closeModal()
        this.props.callBack(this)
    }

    render(){
        const { unitList, unit, isEnable } = this.state
        return (
            <div>
                <Form>
                    <FormItem label='计量单位'>
                        <Select
                            showSearch={true}
                            filterOption={this.filterOptionSummary}
                            value={unit && unit.name}
                            dropdownClassName='unit_setting_select'
                            onFocus = { this.getUnitList }
                            disabled = { isEnable }
                            dropdownFooter={this.handleAddRecord()}
                            onChange={(e) => this.unitChange(e)}
                        >
                            {this.handleSelect(unitList)}
                        </Select>
                        <a onClick={() => this.unitListEdit() }>编辑</a>
                    </FormItem>
                </Form>
                <div style={{ width: '100%', textAlign: 'center',  padding: '10px 0', borderTop: '1px solid #e8e8e8'}}>
                    <Button style={{fontSize: '12px',padding:'0px 15px'}} onClick={this.cancel} >取消</Button>
                    <Button style={{marginLeft: '8px',fontSize: '12px',padding:'0px 15px'}} type='primary' onClick={this.confirm}>确定</Button>
                </div>
            </div>
        )
    }
}

export default SortProofComponent
