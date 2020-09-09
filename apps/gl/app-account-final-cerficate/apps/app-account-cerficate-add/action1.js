import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import { FormDecorator,Input ,Select, Icon} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		injections.reduce('init')
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		this.load()
	}

	load = async () => {
		this.metaAction.sf('data.other.loading',true)
		if(this.component.props.initData){
			let templateData = await this.webapi.query.queryTemplate(this.component.props.initData)
			this.metaAction.sfs({
				'data.list': fromJS(templateData),
				'data.templateData': fromJS(templateData),
				'data.title': templateData[0].title,
				'data.type': this.component.props.type
			})		
		}
		let accountSubjects = await this.webapi.query.getBaseArchive()
		let findCost_ProfitAndLossAccounts = await this.webapi.query.findCost_ProfitAndLossAccounts()
		this.metaAction.sf('data.other.loading',false)
		this.injections.reduce('load', {
			accountSubjects: accountSubjects.glAccountQueryDto.glAccounts,
			findCost_ProfitAndLossAccounts: findCost_ProfitAndLossAccounts
		})
	}
	componentWillUnmount = () => {
		if (window.removeEventListener) {
				window.removeEventListener('resize', this.onResize, false)
		} else if (window.detachEvent) {
				window.detachEvent('onresize', this.onResize)
		} else {
				window.onresize = undefined
		}
	}
	componentDidMount = () => {
		if (window.addEventListener) {
				window.addEventListener('resize', this.onResize, false)
		} else if (window.attachEvent) {
				window.attachEvent('onresize', this.onResize)
		} else {
				window.onresize = this.onResize
		}
	}
	onResize = (e) => {
		let keyRandomTab = Math.floor(Math.random() * 10000)
		this.keyRandomTab = keyRandomTab
		setTimeout(()=>{
			if( keyRandomTab == this.keyRandomTab ){
					this.getTableScroll('app-account-cerficate-add-body', 'ant-table-thead', 2 , 'ant-table-body', 'data.tableOption', e)
			}
		},200)
	}
	getTableScroll = (contaienr, head, num, target, path, e) => {
		try{
			const tableCon = document.getElementsByClassName(contaienr)[0]
			if( !tableCon ){
				if( e ){
						return
				}
				setTimeout(()=>{
						this.getTableScroll(contaienr, head, num, target, path)
				}, 500)
				return
			}
			const header = tableCon.getElementsByClassName(head)[0]
			const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
			const pre = this.metaAction.gf(path).toJS()
			const y = tableCon.offsetHeight - header.offsetHeight - num
			const bodyHeight = body.offsetHeight
			if( bodyHeight > y && y != pre.y ){
					this.metaAction.sf(path, fromJS({...pre, y}))
			}else if( bodyHeight < y && pre.y != null ){
					this.metaAction.sf(path, fromJS({...pre, y: null}))
			}else {
				return false
			}
		}catch(err){

		}
	}

	handleEnter = () => {

	}
	handleSelectChange = async (value, columnName, index, dataSource,record) => {
		let list = this.metaAction.gf('data.list'),newList = this.metaAction.gf('data.list').toJS(), getProportion,arr = {}	,arrList
		if(columnName == 'creditAccountId'){
			getProportion = await this.webapi.query.getProportion(value)
			list = list.update(index, item => item.set('proportion', `${100-getProportion}`))
		}
		if(columnName == 'summary'){
			arr = newList.find((item) => {
				return item.summaryNum==record.summaryNum
			})
			arrList = list.filter((item,index) => {
				return item.get('summaryNum')==record.summaryNum
			})
			
			arrList.map((item, index) => {
				let i = list.findIndex( o => {
					return o == item
				})
				list = list.update(i, item => item.set(columnName, value))
			})
			
		}else
		if(columnName == 'debitAccountId'){
			arr = newList.find((item) => {
				return item.summaryNum==record.summaryNum
			})
			arrList = list.filter((item,index) => {
				return item.get('summaryNum')==record.summaryNum
			})
			arrList.map((item, index) => {
				let i = list.findIndex( o => {
					return o == item
				})
				list = list.update(i, item => item.set(columnName, value))
			})
	
		}else{
			list = list.update(index, item => item.set(columnName, value))
		}
		
		this.metaAction.sf('data.list', fromJS(list))
	}
	handleFocus = () => {

	}

	mouseEnter = (record) => {
		return {
			className: 'mouseRow'
		}
	}

	rowSpan2 = (value, row, index, type, columnName) => {
		
		const num = this.calcRowSpan(row.summaryNum, 'summaryNum', index)
		let dataSource = this.metaAction.gf('data.accountingSubjects')&&this.metaAction.gf('data.accountingSubjects').toJS()
		let children 
	if(type == 'summaryNum'){
		children = (
			<div className="summary">
				<div className="num">{row.summaryNum}</div>
				<div className="addAndMinus">
					<Icon fontFamily="edficon" type ="xinzengkemu" className="addIcon" onClick={() => this.addRow('tatalRow',row)}/>
					<Icon fontFamily="edficon" type ="xinzengkemu-jian" className="delIcon" onClick={() => this.delRow('totalRow', row,index)}/>
				</div>
			</div>
		)
		
	}
	if(type == 'summary'){
		// 	children = (
		// 		<Select
		// 			onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource,row)}
		// 			dataSource={dataSource}
		// 			value={value}
		// 			mode='combobox'				
		// 			// columnName={columnName}
		// 			handleFocus={this.handleFocus}
		// 			/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
		// 		>
				
		// 		</Select>
		// )
		children = (
			<Input value = {value} onChange = {(e) => this.handleSelectChange(e.target.value, columnName, index, dataSource,row)}/>
		) 
	}
	if(type == 'debitAccountId'){
			children = (
				<ExtendEditableSelectCell
				onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource,row)}
				dataSource={dataSource}
				value={value}
				columnName={columnName}
				handleFocus={this.handleFocus}
				/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
				/>
			)
	}
        const obj = {
            children: children,
            props: {
                rowSpan: num,
            },
        }

        return obj
	}
	
	calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf('data.list')
        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == list.getIn([currentRowIndex - 1, columnKey])) {
            return 0
        }

        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }
	fieldChange = (path, value) => {
		this.metaAction.sf(path, value)
	}
	renderCell = (columnName, index, value, record) => {
		let dataSource = this.metaAction.gf('data.accountingSubjects')&&this.metaAction.gf('data.accountingSubjects').toJS(),
		creditAccountDataSource = this.metaAction.gf('data.findCost_ProfitAndLossAccounts') && this.metaAction.gf('data.findCost_ProfitAndLossAccounts').toJS()
		if(columnName == 'summaryNum'){//
			return this.rowSpan2(value, record,  index, 'summaryNum', columnName)
		
		}
		if(columnName == 'summary'){//Zhaiyao
			return this.rowSpan2(value, record,  index, 'summary', columnName)
		}
		if(columnName == 'debitAccountId'){//借方
			return this.rowSpan2(value, record,  index, 'debitAccountId', columnName)
		}
		if(columnName == 'creditAccountIdNum'){
			return (
						<div className="summary">
							<div className="num">{record.creditAccountIdNum}</div>
							<div className="addAndMinus">
								<Icon fontFamily="edficon" type ="xinzengkemu" className="addIcon" onClick={() => this.addRow('row',record)}/>
								<Icon fontFamily="edficon" type ="xinzengkemu-jian" className="delIcon" onClick={() => this.delRow('row', record,index)}/>
							</div>
						</div>
			)
		}else
		if(columnName == 'creditAccountId'){//贷方
			return (
					<ExtendEditableSelectCell
					onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource,record)}
					dataSource={creditAccountDataSource}
					value={value}
					columnName={columnName}
					handleFocus={this.handleFocus}
					/* handleFoucus={() => this.handlerFoucus(columnName, index)} */
					/>
				)
		}else
		if(columnName == 'proportion'){//bili
			return (
					
					<EditableCell

						value={value?`${value}%`:''}
						// customAttribute = {this.customAttribute}
						onBlur={(value) => this.handleBlur(value, columnName, index, record)}
						onEnter={(e) => this.handleEnter()}
					/>
			)
		}
	}
	handleBlur = async (value, columnName, index, record) => {

		let list = this.metaAction.gf('data.list'),
		templateData = this.metaAction.gf('data.templateData'),
		getProportion = await this.webapi.query.getProportion(list.get(index).get('creditAccountId'))
		if((templateData&&!templateData.get(index).get('id'))||!templateData){//新增
			if(getProportion + value > 100){	
				list = list.update(index, item => item.set(columnName, undefined))
				this.metaAction.sf('data.list', fromJS(list))
				this.metaAction.toast('warning', '此科目累计比例超过100%')
				return
			}
		}else if(templateData&&templateData.get(index).get('id')){//编辑
			if(getProportion - templateData.get(index).get('proportion') + value > 100){
				list = list.update(index, item => item.set(columnName, undefined))
				this.metaAction.sf('data.list', fromJS(list))
				this.metaAction.toast('warning', '此科目累计比例超过100%')
				return
			}
		}
		
		list = list.update(index, item => item.set(columnName, `${value}`))
		this.metaAction.sf('data.list', fromJS(list))
	}
	addRow = (type, record) => {
		let list = this.metaAction.gf('data.list').toJS(),arr
		
		if( type == 'row' ) {
			arr = list.find((item) => {
				return item.summaryNum==record.summaryNum&&item.summary
			})
			let lastIndex = list.findIndex((item, index) => {
				if( item.summaryNum == record.summaryNum && (!list[index+1] || list[index+1].summaryNum != record.summaryNum) ) {
					return true
				}else{
					return false
				}
			})
			let count = 0
			list.map((o,i) => {
				if(list[i+1]){
					if(o.summaryNum == record.summaryNum &&o.summaryNum == list[i+1].summaryNum){
						count++
					}
				}
				
			})
			list.splice(lastIndex+1, 0, 
				{
					// index: list[lastIndex].summaryNum ,
					summaryNum: arr?arr.summaryNum:list[lastIndex].summaryNum,
					summary: arr?arr.summary:'',
					debitAccountId: arr?arr.debitAccountId:'',
					creditAccountIdNum: count+2,
					creditAccountId:'',
					proportion:'100'
				}
			)
		}else{
			
			list.push({summaryNum: list[list.length-1].summaryNum+1,summary: '',debitAccountId:'',creditAccountIdNum:1,creditAccountId:'',proportion:'100'})
		}
		this.metaAction.sf('data.list', fromJS(list))
	}
	delRow = (type , record, index) => {
		let list = this.metaAction.gf('data.list').toJS()
		if(type == 'totalRow'){
			list.splice(index,1)
			
		}else{
			let delItem = list.findIndex((item) => {
				return item == record
			})
			list.splice(delItem,1)
		}
		let sortList = this.sort(list)
		this.metaAction.sf('data.list', fromJS(list))
	}
	check = async (option) => {
		if (!option || !option.path)
			return

		if (option.path == 'data.title') {
			return {errorPath: 'data.error.title', message: option.value ? '' : '请填写凭证名称'}
		}
	}
	sort = (list) => {//断号排序
		// list = [{summaryNum:1},{summaryNum:2},{summaryNum:4}]
		
		for(let i= 0; i<list.length; i++){
			list[i].summaryNum = i+1
			// list[i].creditAccountIdNum = i+1
		}
		return list
		
	}
	    //点击确定按钮
	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		let params = this.metaAction.gf('data.list').toJS(),
		data,arr = [],
		title = this.metaAction.gf('data.title')
		params.map(o => {
			o.title = title

		})
		const ok = await this.voucherAction.check([{
			path: 'data.title', value: title
		}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			return false
		}
		if(this.metaAction.gf('data.type') == 'update'){
			data = await this.webapi.query.update(params)
		}else{
			data = await this.webapi.query.create(params)
		}
		if(data){		
			this.metaAction.toast('success', '保存成功')
		}else{
			return false
			// this.metaAction.toast('warning', '保存成功')
		}
	}
}
const EditableCell = ({ value, onBlur, onEnter ,customAttribute, disabled}) => {
    // '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
  return (
    <div>
      <Input.Number
        value={value}
        onBlur={(value) => onBlur(value)}
        onPressEnter={(e) => onEnter(e)} 
        style={{'textAlign':'right'}}
        disabled={disabled}
        customAttribute = {customAttribute}
        regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
				/>
    </div>
  )
}
const ExtendEditableSelectCell = ({ dataSource, onChange, value, columnName, onClick, saveNewVlue, handleFocus,disabled}) => {
	let productChildren = []
	//新增按钮 实现新增档案
  
	if (dataSource) {
	  dataSource.forEach((item,index) => {
		productChildren.push(<Option title={item.name} _data={item} value={item.id}>{item.codeAndName}</Option>)
	  })
	  // if(columnName == 'itemName' && value==undefined){
	  //     productChildren.splice(0,0,<Option title={''} value={''}>{''}</Option>)
	  // }
	}
	return (
	  <div style={{width: '100%'}}>
		<Select style={{ width: '100%' }}
			onChange={(value) => onChange(value)}
			value={ value }
			disabled = {disabled}
			filterOptionExpressions="code,name,helpCode,helpCodeFull"
			dropdownClassName={'cashflowstatementDistributionSelect'}
			filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
		 	onFocus={handleFocus}>
		  {productChildren}
		</Select>
	  </div>
	)
  }
export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}
