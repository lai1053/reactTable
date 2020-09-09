import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { Select } from 'edf-component'
import utils from 'edf-utils'
import moment from 'moment'
import config from './config'
const Option = Select.Option
import { toJS } from 'immutable';
import extend from './extend'
import { moment as momentUtil } from 'edf-utils'
import StockConfigRecord from '../components/StockConfigRecord'
import {HelpIcon} from '../commonAssets/js/common'
import { deepClone } from '../commonAssets/js/common'
import StockInventoryConfigure from './component/StockInventoryConfigure'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
		this.km2202=[];
		this.km5001=[];
		this.extendAction = option.extendAction 
	}

	onInit = ({component, injections}) => {
		this.extendAction.gridAction.onInit({ component, injections }) 
		this.component = component
		this.injections = injections
		this.clickStatus = false
		this.selectOption = []
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}

		injections.reduce('init')
		// this.load()
	}

	renderPage = () => {
		const {xdzOrgIsStop} = this.metaAction.context.get('currentOrg') || {}
		return (
			<StockInventoryConfigure 
				xdzOrgIsStop={xdzOrgIsStop}
				webapi={this.webapi} 
				metaAction={this.metaAction} 
				component={this.component}
			/>
		)
	}

	// 初始化数据
	load= async () => {
		this.metaAction.sf('data.loading', true)
		const currentOrg = await this.webapi.initPeriod()
		this.motime = currentOrg.thisPeriod  // 最近一个结账月份
        const response = await this.webapi.init({'period': this.motime, 'opr': 0})
		const resplist = await this.webapi.initKmSet()
		let getInvSetByPeroid
		this.getInvSetByPeroid_period = moment().format('YYYY-MM')
		if(response && response.state !=0 ){  //存货开启后才能调用这个接口
			getInvSetByPeroid = await this.webapi.getInvSetByPeroid({'period': response.startPeriod})
			this.getInvSetByPeroid_period = getInvSetByPeroid.thisPeriod ? getInvSetByPeroid.thisPeriod : moment().format('YYYY-MM')
		}
		this.metaAction.sf('data.loading', false)
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
		if(response){
			list[0].name=response.preToFroAccount
			list[1].name=response.personCostAccount
			list[2].name=response.materialCostAccount
			list[3].name=response.factoryFee
			list[4].name=response.otherFee
			this.startperiod=response.startPeriod

			response.flag=response.state
			response.id=response.id?response.id:''
			response.startPeriod = response.startPeriod ? response.startPeriod : response.period //修改
			response.state=response.state
			response.inveBusiness=response.inveBusiness||response.inveBusiness==0?response.inveBusiness:''
			response.enableDate= response.enableDate ? response.enableDate: ''
			response.endCostType = response.endCostType||response.endCostType==0?response.endCostType:1
			response.endNumSource = response.endNumSource||response.endNumSource==0?response.endNumSource:1
			response.checkOutType = response.checkOutType||response.checkOutType==0?response.checkOutType:0
			response.bInveControl = (response.bInveControl||response.bInveControl==false) ? response.bInveControl:true
			response.isInput = response.isInput
			response.enableBOMFlag = response.enableBOMFlag || ((response.enableBOMFlag == 0 || response.enableBOMFlag == undefined ) ? response.enableBOMFlag : 1)  //--是否启用BOM设置：1是；0否；
			response.auxiliaryMaterialAllocationMark = response.auxiliaryMaterialAllocationMark || ((response.auxiliaryMaterialAllocationMark == 0 || response.auxiliaryMaterialAllocationMark == undefined ) ? response.auxiliaryMaterialAllocationMark : 1 )// --辅料是否分摊之BOM产品中：1是；0否；
			response.isConfigureBOM = response.isConfigureBOM || ((response.isConfigureBOM == 0 || response.isConfigureBOM == undefined)? response.isConfigureBOM : 1 )//是否有配置bom 结构 1 表示有 0表示没有
			response.automaticDistributionMark = response.automaticDistributionMark || response.automaticDistributionMark == 0 ? response.automaticDistributionMark : 1// 1为自动分配 0 为手工分配
		}
		this.listCopy = deepClone(list)  // 数据备份
		this.formCopy = deepClone(response)  // 数据备份
		const name = this.metaAction.context.get('currentOrg').name
		sessionStorage[`ttk-stock-app-inventory-config-state-${name}`] = response.state  // 写缓存
		sessionStorage[`ttk-stock-app-inventory-config-path-${name}`] = 'ttk-stock-app-inventory-config'
		this.injections.reduce('load',response, list, getInvSetByPeroid)
		this.km2202=resplist.km2202
		this.km5001=resplist.km4001?resplist.km4001:resplist.km5001
		this.renderSelectOption(this.km2202,this.km5001)
		
	}
	
	// 步骤：上一步，下一步的切换
	next = async () => {
		let tab = this.metaAction.gf('data.other.tab1')	
		if(tab){	
			if(this.metaAction.gf('data.form.inveBusiness')===''){
				this.metaAction.toast('error', '请选择存货业务')
			// }else if(!this.metaAction.gf('data.form.period')){
			}else if(!this.metaAction.gf('data.form.startPeriod')){
				this.metaAction.toast('error', '请选择启用时间')
			}else{
				this.metaAction.sf('data.other.tab1', false)
			}
		}else{
			this.metaAction.sf('data.other.tab1', true)
		}
	}

	// 保存
	onOk = async () => {
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [];
		let form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
		if(form.inveBusiness===null){
			return false
		}else{
			let reqlist = this.composeParams()
			if(form.inveBusiness==0){
				if(!list[0].name){
					this.metaAction.toast('error', '请选择科目来源')
					return false
				}
			}else{
				if(!list[0].name||!list[1].name||!list[2].name||!list[3].name||!list[4].name){
					this.metaAction.toast('error', '请选择科目来源')
					return false
				}
			}
			await this.webapi.createInveSet(reqlist)  // 2
			this.metaAction.toast('success', '保存成功')
			this.back()
		}	
	}

	// 参数
	composeParams = ( stateCode ) =>{
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
		let form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
		const sTime = this.metaAction.gf('data.setting.month') 
		const hasRecord = this.metaAction.gf('data.hasRecord') 
		let settingTime = hasRecord == 0 ? form.startPeriod : ( sTime && sTime || form.period ) 

		let reqlist={
			// period: this.motime,  // --2
			'period': settingTime,
			'startPeriod': form.startPeriod,
			'state': stateCode ? stateCode : form.state,
			'inveBusiness': form.inveBusiness,
			'bInveControl': form.bInveControl,
			'endCostType': form.endCostType,
			'endNumSource': form.endNumSource,
			'checkOutType': form.checkOutType,
			'enableBOMFlag': form.enableBOMFlag,
			'automaticDistributionMark': form.automaticDistributionMark,
			'auxiliaryMaterialAllocationMark': form.auxiliaryMaterialAllocationMark
		}
		if(form.id!==''){
			reqlist.id=form.id
		}
		reqlist.factoryFee=list[3].name 
		reqlist.materialCostAccount=list[2].name 
		reqlist.otherFee=list[4].name
		reqlist.personCostAccount=list[1].name
		reqlist.preToFroAccount=list[0].name

		return reqlist
	}

	// 更改前的校验
	diffChange = ()=>{
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || [];
		let form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
		let flag = false
		for(const o in form){
			if(form[o] != this.formCopy[o]){
				flag = true
			}
		}
		list.forEach((item,index)=>{
			if(item.name != this.listCopy[index]['name']){
				flag = true
			}
		})
		return flag
	}

	// 切换更改开关
	recordSwitchChange = async(checkVal, event)=>{
		const that = this
		const flag = this.diffChange()
		if(!checkVal && flag){ // 如果关闭
			const ret = await this.metaAction.modal('confirm',{
				content: '当前所选月存货参数有进行更改，请确认是否放弃此次更改?',
				onOk() { 
					that.metaAction.sfs({ 'data.setting.isChecked':checkVal })
					setTimeout(()=>{
						that.metaAction.sfs({
							'data.setting.isCheckedTag': checkVal,
							'data.setting.month': '' 
						})
						that.load()
					},550)
				},
				onCancel() {
					that.metaAction.sfs({
						'data.setting.isChecked': !checkVal,
						'data.setting.month': ''
					})
				},
			})
		}else{
			this.metaAction.sfs({'data.setting.isChecked': checkVal})
			let obj = {
				'data.setting.isCheckedTag': checkVal,
				'data.setting.month': ''
			}
			if(checkVal){
				obj['data.setting.tipsShow'] = true
			}
			setTimeout(()=>{
				that.metaAction.sfs(obj)
				if(checkVal){
					setTimeout(()=>{
						that.metaAction.sf('data.setting.tipsShow', false)
					},3000)
				}
			},550)
		}
		return
	}

	//月份切换
	recordMonthChange = async(date, dateString)=>{
		this.metaAction.sf('data.setting.month', dateString)
		const getInvSetByPeroid = await this.webapi.getInvSetByPeroid({'period': dateString})
		this.injections.reduce('initSetInfo', getInvSetByPeroid)
	}

	settingTips = ()=>{
		let text = <div>
			<div>1、须同时打开设置按钮和选择更改月份后才能进行更改 </div>
			<div>2、更改月份：本次更改设置的生效月份</div>
		</div>
		return text
	}
	// 帮助的图标和说明
	renderSettingHelp =()=>{
		let text = this.settingTips()
		return  HelpIcon(text, 'top')
	}

	// 可选月份范围
	monthDisabled=(current)=>{
		return current && (current.isBefore(moment(this.getInvSetByPeroid_period), 'month') || current.isAfter(moment(), 'month') )
	}

	// 不可选的日期
	disabledDate= (current) =>{
		let startperiod = this.motime > this.startperiod ? this.startperiod: this.motime  // --6
		return current < moment(startperiod);
	}

	// 控制能不能够选
	canChange = ()=>{
		const isOn = this.metaAction.gf('data.setting.isChecked') // 设置按钮是否开启
		const hasRecord = this.metaAction.gf('data.hasRecord')   // 是否有设置记录
		const currentState = this.metaAction.gf('data.form.state')  // 当前存货是未开启，已开启还是已停用
		const settingMonth = this.metaAction.gf('data.setting.month')
		let flag
		if(hasRecord != 0 ){ 
			flag = isOn && currentState != 2 && settingMonth ? false : true
		}else{
			flag = !(currentState == 1)
		}
		return flag
	}

	// 点击更改记录
	recordBtnClick= async()=>{
		const dataForm = this.metaAction.gf('data.limit') && this.metaAction.gf('data.limit').toJS() || {}
		const periods = dataForm.peroids || []
		const date = periods[0] || this.motime
		let option = {
            title: '存货设置记录',
            className: 'ttk-stock-app-config-record-modal',
            width: 800,
            centered: true,
			footer: null,
			closeModal: this.closeBom,
            closeBack: (back) => { this.closeTip = back },
            children: <StockConfigRecord
						store = {this.component.props.store}
						metaAction = {this.metaAction}
						component={this.component}
						webapi = {this.webapi}
						period = {date}  // --3
						periodList = {periods}
						kmSet = {{'km2202': this.km2202, 'km5001': this.km5001}}
                     >
                    </StockConfigRecord>
        }
       let com =  await this.metaAction.modal('show',option)
	}

	// 关闭弹窗
	closeBom = () =>{
		this.closeTip()
	}
	
	// 返回功能
	back = async () => {
		this.component.props.setPortalContent &&
		this.component.props.setPortalContent('存货管理','ttk-stock-Inventory-allocation')
        this.component.props.onlyCloseContent('ttk-stock-inventory-configure')
	}

	// 业务类型的切换
	inveBusinessChange=async (path,value) => {
		let form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
		let inveBusiness = this.metaAction.gf('data.form.inveBusiness')
		const limit = this.metaAction.gf('data.limit') && this.metaAction.gf('data.limit').toJS() || {}
		const {isGenVoucher, isMaterial, isCompletion} = limit
		if(isGenVoucher){
			this.metaAction.toast('warning', '当前月已结账，不能修改业务类型')

		}else if(inveBusiness== 1 && isCompletion && isMaterial){
			this.metaAction.toast('warning', '所选月已进行完工入库和领料出库，不能切换类型')

		}else if(inveBusiness== 1 && isMaterial){
			this.metaAction.toast('warning', '所选月已进行领料出库，不能切换类型')

		}else if(inveBusiness== 1 && isCompletion){
			this.metaAction.toast('warning', '所选月已进行完工入库，不能切换类型')

		}else{
			if(inveBusiness!==''&&form.flag!==0){
				const ret = await this.metaAction.modal('confirm', {
					title: '提示',
					content: '切换到其它业务类型时，您需重新进行存货参数设置，请确认！'
				})
				if(ret){
	
					let form = this.metaAction.gf('data.form')
					if(form.constructor !== Object){
						form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
					}
					form.inveBusiness=value;
					form.endCostType=1;
					form.endNumSource=1;
					form.checkOutType=0;
					form.bInveControl=true;
					let list= [{
							id:'1',
							code:'暂估往来科目',
							name:''
						},{
							id:'2',
							code:'直接人工',
							name:''
						},{
							id:'3',
							code:'直接材料',
							name:''
						},{
							id:'4',
							code:'制造费用',
							name:''
						},{
							id:'5',
							code:'其他费用',
							name:''
						}
					]
					this.injections.reduce('updata','data.list',list)
					this.injections.reduce('updata','data.form',form)
				}
			}else{
				this.injections.reduce('updata',path,value)
			}
		}
	}

	saveStock = async( stateCode ) => {
		let reqlist = this.composeParams( stateCode )
		await this.webapi.createInveSet(reqlist)  // 3
		this.metaAction.toast('success', '保存成功')
		this.load()
	}

	// 切换——是否启用存货
	switchChange = async (checked) => {
		if(checked==true){
			this.metaAction.sf('data.form.state', '1')
			if(!this.metaAction.gf('data.form.startPeriod')){
				this.metaAction.sf('data.form.startPeriod', this.motime)  // --4
			}
			// 已有记录直接开启 （即已停用的可以直接开启）
			const hasRecord = this.metaAction.gf('data.hasRecord')
			if(hasRecord == 2){
				this.saveStock( 1 )
			}
		}else{
			let form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
			let other = this.metaAction.gf('data.other') && this.metaAction.gf('data.other').toJS() || {}
			if( form.flag==1&&other.tab1){
				let ret = await this.metaAction.modal('confirm', {
					title: '提示',
					width: 400,
					bodyStyle: { padding: 24, fontSize: 12 },
					icon:'',
					content: (
						<div style={{margin: '0 auto',overflow: 'hidden' }}>
							<div style={{ color: '#515151', fontSize: '14px', lineHeight: '20px' }}>
								<p style={{ marginBottom: '20px' }}>您正在执行关闭存货模块，是否确定？</p>
								<p style={{ marginBottom: '20px' }}>1.存货关闭后不能生成单据</p>
								<p style={{ marginBottom: '20px' }}>2.存货中的数据只可查看不可操作</p>
							</div>
						</div>
					)
				})
				if(ret){
					this.saveStock( 2 )
				}else{
					return false
				}
			}else{
				this.metaAction.sf('data.form.state', '2')
			}
		}
	}

	// 是否进行负库存控制
	bInveControlChange= async (checked) => {
		this.metaAction.sf('data.form.bInveControl', checked)
	}

	// 完工入库单已创建的限制
	checkCompleteChange = ()=>{
		let inveBusiness = this.metaAction.gf('data.form.inveBusiness')
		const limit = this.metaAction.gf('data.limit') && this.metaAction.gf('data.limit').toJS() || {}
		const { isCompletion } = limit
		// 已创建完工入库单时，不能修改
		if(inveBusiness== 1 && isCompletion){
			this.metaAction.toast('warning', '所选月已进行完工入库，不能切换类型!')
			return true
		}
	}

	// 结转生产成本时的提示
	checkVoucherChange = ()=>{
		let inveBusiness = this.metaAction.gf('data.form.inveBusiness')
		const limit = this.metaAction.gf('data.limit') && this.metaAction.gf('data.limit').toJS() || {}
		const { isCarryOverProductCost } = limit
		//结转生产成本凭证已生成时，不能更改
		if(inveBusiness== 1 && isCarryOverProductCost){
			this.metaAction.toast('warning', '所选月已进行生成产本结转，不允许更改!')
			return true
		}
	}

	// 分摊方式改变
	endCostTypeChange = (e) => {
		const flag = this.checkCompleteChange()
		if (flag) { return }
		this.metaAction.sf('data.form.endCostType',e.target.value)
	}

	// 手工切换
	markChange =(e)=>{
		const flag = this.checkCompleteChange()
		if (flag) { return }
		this.metaAction.sf('data.form.automaticDistributionMark', parseFloat(e.target.value))
	}

	// 完工入库数来源
	endNumSourceChange = (e)=>{
		const flag = this.checkCompleteChange()
		if (flag) { return }
		this.metaAction.sf('data.form.endNumSource',e.target.value)
	}

	// 是否启用BOM设置
	enableBOMFlagChange = (value)=>{
		const flag = this.checkVoucherChange()
		if (flag) { return }
		if(value){
			this.metaAction.sfs({
				'data.form.auxiliaryMaterialAllocationMark': 1,
				'data.form.enableBOMFlag' : 1
			})
		}else{
			this.metaAction.sfs({
				'data.form.auxiliaryMaterialAllocationMark': 0,
				'data.form.enableBOMFlag' : 0
			})
		}
		// this.metaAction.sf('data.form.enableBOMFlag',(value && 1 || 0))
	}

	// 辅料是否分摊到有BOM结构的产品中
	auxiliaryChange = (e)=>{
		const flag = this.checkVoucherChange()
		if (flag) { return }
		this.metaAction.sf('data.form.auxiliaryMaterialAllocationMark',(e.target.checked && 1||0))
	}

	// 配置存货参数页签切换
	handleTabChange = async (activeKey) => {
        this.metaAction.sf('data.other.activeTabKey', activeKey) 
	}

	// 科目来源下拉选择框设置
    renderSelectOption = (data,data1) => {
		//2202——负债科目
        const arr = data.map(item => {
            return (
				<Option key={item.code} value={item.code}
					title={item.code+'   '+item.name}
					disabled={item.isEndNode?false:true}
				>
					{item.codeAndName}
                </Option>
            )
		})
		// 5001——成本科目
		const arr1 = data1.map(item => {
            return (
                <Option key={item.code} value={item.code}
					title={item.code+'   '+item.name}
					disabled={item.isEndNode?false:true}
				>
					{item.codeAndName}
                </Option>
            )
        })
		this.selectOption = arr
		this.selectOptionkm5001 = arr1
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
	}

	// 渲染合计数
	renderTotalAmount = (text, record, row) => {
		 const content = typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text
		 let span =<span title={ content }>{ content }</span>
		 return span
	}

	//过滤行业
	filterIndustry = (input, option) => {
		return option.props.children.indexOf(input) >= 0
	}

	// 科目来源——成本科目（成本）
	onFieldChange = (index, value, record) => {
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
		let flag =false;
		
		list.forEach((item,i)=>{
			if(item.name==value&&i>0&&index!==i){
				flag=true
			}
		})
		if(flag ==false){
			record.name=value;
			this.injections.reduce('updata','data.list.'+index, record)
		}else{
			this.metaAction.toast('error', '不能重复选择科目')
			record.name='';
			flag =false
			this.injections.reduce('updata','data.list.'+index, record)
		}
		
	}
	// 科目来源——暂估往来科目（负债）
	onFieldChangeCode = (index, value, record) => {
		record.name=value;
		this.injections.reduce('updata','data.list.'+index, record)
	}

	// 科目来源选项
	getDepartmentProject = (text, record, index) => {
		let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
		let inveBusiness = this.metaAction.gf('data.form.inveBusiness')
		let value=list[index].name
		if(record.code=='暂估往来科目'){
		
			return <div style={{ width: '95%' }}>
						<Select style={{ width: '100%' }} 
							value={value?value :undefined }
							showSearch
							placeholder='请选择暂估往来科目'
							onChange={(value) => this.onFieldChangeCode(index, value,record)}
							optionFilterProp="children"
							filterOption={this.filterIndustry}
						>
							{this.selectOption}
						</Select>
					</div>

		}else{
			let disable=false;
			let placeholder="请选择"+record.code
			if(inveBusiness==0){
				disable=true			
			}
			return <div style={{ width: '95%' }}>
					<Select style={{ width: '100%' }} 
						value={value?value :undefined }
						showSearch= 'true'
						disabled = {disable}
						placeholder={placeholder}
						onChange={(value) => this.onFieldChange(index, value,record)}
						optionFilterProp="children"
						filterOption={this.filterIndustry}
					>
					{this.selectOptionkm5001}
			</Select>
			</div>	
		
		}	
	}

	//渲染列
	renderColumns = () => {
        const columns = this.metaAction.gf('data.other.columnDto') && this.metaAction.gf('data.other.columnDto').toJS() || []//header
        const arr = [];
        columns.forEach(data => {
            if (data.isVisible) {
                arr.push({
                    title: data.caption,
                    key: data.fieldName,
					dataIndex: data.fieldName,
					align:data.align,
					width:data.width,
                    render: (text, record, index) => {
						if (data.fieldName == 'name') {
							return this.getDepartmentProject(text, record, index)
						} else {
							return this.renderTotalAmount(text, record, index)
						}
                    }
                })
            }
        })
        return arr
	}

	

	// 帮助的图标和说明
    renderHelp =()=>{
		let text = <div>
			<div>开启：存在负库存，不能结转主营业务成本</div>
			<div>关闭：存在负库存，可以结转主营业务成本</div>
		</div>
        return HelpIcon(text, 'bottomLeft')
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
