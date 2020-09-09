import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Menu, Checkbox, DataGrid, Icon } from 'edf-component'
import extend from './extend'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}
	
	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		
		injections.reduce('init')
		this.load()
	}
	
	load = async () => {
		let tabKey = 'customer',
			column = this.getColumns(tabKey)
		
		this.getData(tabKey).then((res)=> {
			this.injections.reduce('load', tabKey, column, res)
		})
	}
	
	//渲染表格列
	getListColumns = () => {
		let { Column, Cell } = DataGrid
		const columns = this.metaAction.gf('data.columns').toJS(),
			list = this.metaAction.gf('data.list').toJS()
		let cols = [
			<Column name='select' columnKey='select' width={40}
			        header={<Cell name='cb'><Checkbox checked={this.extendAction.gridAction.isSelectAll()} onChange={this.extendAction.gridAction.selectAll()}></Checkbox></Cell>}
			        cell={(ps) => {
				        return <Cell name='cell'><Checkbox onChange={this.selectRow(ps.rowIndex)}></Checkbox></Cell>
			        }}
			/>,
			<Column name='operation' columnKey='operation' width={60}
			        header={<Cell name='cb'>操作</Cell>}
			        cell={(ps) => {
				        return <Cell name='cell'><Icon type="delete" className='del' onClick = {this.delClick(list[ps.rowIndex].id)} /></Cell>
			        }}
			/>
		]
		columns.forEach(op => {
			let col = <Column name={op.id} isResizable={true} columnKey={op.id} flexGrow={1} width={100}
              header={<Cell name='header'>{op.columnName}</Cell>}
              cell={(ps) => {
                  if(op.link){
	                  return <Cell><a onClick={this.modifyDetail(list[ps.rowIndex].id)}>{list[ps.rowIndex][op.name]}</a></Cell>
                  }
                  if(op.name == 'isBaseCurrency' || op.name == 'isDefault'){
	                  return <Cell>{list[ps.rowIndex][op.name] ? <Icon type="check" /> : null}</Cell>
                  }else if(op.name == 'isEnable') {
	                  return <Cell>{list[ps.rowIndex][op.name] ? <Icon type="check" /> : null}</Cell>
                  }
                  return <Cell>{list[ps.rowIndex][op.name]}</Cell>
              }}
			/>
			cols.push(col)
		})
		return cols
	}
	
	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}
	
	refresh = (page) => {
		const tabKey = this.metaAction.gf('data.tabKey'),
				column = this.getColumns(tabKey)
		this.getData(tabKey, page).then((res)=> {
			this.injections.reduce('load', tabKey, column, res)
		})
	}
	
	//删除档案
	delClick = (id) => (e) => {
		this.del([{id}])
	}
	
	//批量删除
	delClickBatch = () => {
		let selectedArr = this.extendAction.gridAction.getSelected('details')
		this.del(selectedArr)
	}
	
	del = async (list) => {
		let tabKey = this.metaAction.gf('data.tabKey')
		
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		
		if(ret){
			let response = await this.webapi.delete[tabKey](list)
			
			if (response) {
				this.metaAction.toast('success', '删除成功')
				this.refresh()
				return response
			}
		}
	}
	
	//修改档案
	modifyDetail = (id) => (e) => {
		let personId = id ? id :null
		
		this.add(personId)
	}
	
	//新增档案
	addClick = () => {
		this.add()
	}
	
	add = (id) => {
		let tabKey = this.metaAction.gf('data.tabKey'),
			option = {title: '', appName: '', id: id}
			
		switch (tabKey) {
			case 'customer':
				option.title = '客户'
				option.appName = 'app-card-customer'
				break;
			case 'supplier':
				option.title = '供应商'
				option.appName = 'app-card-vendor'
				break;
			case 'inventory':
				option.title = '存货'
				option.appName = 'app-card-inventory'
				break;
			case 'project':
				option.title = '项目'
				option.appName = 'app-card-project'
				break;
			case 'currency':
				option.title = '币种'
				option.appName = 'app-card-currency'
				break;
			case 'unit':
				option.title = '计量单位'
				option.appName = 'app-card-unit'
				break;
			case 'bankAccount':
				option.title = '账户'
				option.appName = 'app-card-bankaccount'
				break;
		}
		
		this.addModel(option)
	}
	
	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			width: 400,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				columnCode: "common",
				personId: option.id
			}),
		})
		
		if (ret) {
			this.refresh()
		}
	}
	
	//页签切换
	tabChange = (v) => {
		let column = this.getColumns(v)
		this.getData(v).then((res)=> {
			this.injections.reduce('load', v, column, res)
		})
	}
	
	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}
	
	//分页修改
	pageChanged = (currentPage, pageSize) => {
		currentPage = currentPage + 1
		let page = { currentPage, pageSize }
		this.refresh(page)
	}
	
	//获取列表内容
	getData = async (tabKey, pageInfo) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize
			}
		
		if(pageInfo) {
			page.currentPage = pageInfo.currentPage
			page.pageSize = pageInfo.pageSize
		}
		
		response = await this.webapi.query[tabKey](page)
		
		return response
	}
	
	//获取列数据
	getColumns =(tabKey) => {
		if(tabKey == 'customer' || tabKey == 'supplier') {
			return [{
				columnName: '编码',
				id: 'code',
				name: 'code',
				link: true
			},{
				columnName: '名称',
				id: 'name',
				name: 'name',
			},{
				columnName: '期初余额',
				id: 'beginningBalance',
				name: 'beginningBalance',
			},{
				columnName: '当前余额',
				id: 'currentBalance',
				name: 'currentBalance',
			},{
				columnName: '停用',
				id: 'isEnable',
				name: 'isEnable',
			}]
		}else if(tabKey == 'inventory') {
			return [{
				columnName: '编码',
				id: 'code',
				name: 'code',
				link: true
			},{
				columnName: '名称',
				id: 'name',
				name: 'name',
			},{
				columnName: '规格型号',
				id: 'specification',
				name: 'specification'
			},{
				columnName: '计量单位',
				id: 'unit',
				name: 'unit'
			},{
				columnName: '属性',
				id: 'property',
				name: 'property'
			},{
				columnName: '属性细分',
				id: 'propertyDetail',
				name: 'propertyDetail'
			},{
				columnName: '停用',
				id: 'isEnable',
				name: 'isEnable',
			}]
		}else if(tabKey == 'project') {
			return [{
				columnName: '编码',
				id: 'code',
				name: 'code',
				link: true
			},{
				columnName: '名称',
				id: 'name',
				name: 'name',
			},{
				columnName: '停用',
				id: 'isEnable',
				name: 'isEnable',
			}]
		}else if(tabKey == 'currency') {
			return [{
				columnName: '货币编码',
				id: 'currencyCode',
				name: 'code',
				link: true
			},{
				columnName: '货币名称',
				id: 'currencyName',
				name: 'name',
			},{
				columnName: '汇率',
				id: 'exchangeRate',
				name: 'exchangeRate'
			},{
				columnName: '本位币',
				id: 'isBaseCurrency',
				name: 'isBaseCurrency'
			},{
				columnName: '停用',
				id: 'isEnable',
				name: 'isEnable',
			}]
		}else if(tabKey == 'unit') {
			return [{
				columnName: '编码',
				id: 'code',
				name: 'code',
				link: true
			},{
				columnName: '名称',
				id: 'name',
				name: 'name',
			}]
		}else if(tabKey == 'bankAccount') {
			return [{
				columnName: '账号',
				id: 'accountNumber',
				name: 'code'
			},{
				columnName: '账户名称',
				id: 'userName',
				name: 'name',
				link: true
			},{
				columnName: '账户类型',
				id: 'accountType',
				name: 'bankAccountTypeName'
			},{
				columnName: '开户银行',
				id: 'depositBank',
				name: 'bankName'
			},{
				columnName: '默认账户',
				id: 'defaultAccount',
				name: 'isDefault'
			},{
				columnName: '期初余额',
				id: 'openinBalance',
				name: 'beginningBalance',
			},{
				columnName: '当前余额',
				id: 'currentBalance',
				name: 'currentBalance',
			},{
				columnName: '停用',
				id: 'isEnable',
				name: 'isEnable',
			}]
		}
	}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
	    extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
