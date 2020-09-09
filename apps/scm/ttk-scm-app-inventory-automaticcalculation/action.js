import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import moment from 'moment'
import extend from './extend';
import config from './config';
import utils from 'edf-utils'
import { Map, fromJS } from 'immutable'

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;

		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}

		injections.reduce('init');
		this.load();
	}

	load = async (page) => {
		let initData = this.component.props.initData, date

		const { periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
		let searchTime
		if (periodDate) {
			let a = initData.date.replace('-', ''), b = periodDate.replace('-', '')
			if (a < b) {
				searchTime = periodDate
			} else {
				searchTime = initData.date
			}
		}
		date = this.getYearMonth(searchTime)
		this.metaAction.sf('data.period', searchTime)

		this.metaAction.sf('data.other.loading', true)
		let res = await this.webapi.automaticcalculation.initRatioAccountList({ year: date.year, month: date.month  })
		if(res.flag == 'has_month_closed' || res.flag == "record_has_generate_doc"){
			let title = "当前月已有库存单据生成凭证，无法成本计算，请删除相关凭证再进行此操作!"
			if(res.flag == 'has_month_closed') title = "已期末结账，无法计算成本！"
			const ret = await this.metaAction.modal('confirm', {
				title: '',
				className: 'ttk-scm-app-inventory-automaticcalculation-confirm',
				width: 400,
				content: <p>{title}</p>
			})
			if(ret){
				this.component.props.closeModal()
				return
			}
		}
		
		this.metaAction.sf('data.other.loading', false)
		this.injections.reduce('load', res, initData)
	}

	//月份查询
	periodChange = async (e) => {
		let value = utils.moment.momentToString(e, 'YYYY-MM'),
			initData = this.component.props.initData
		this.metaAction.sf('data.period', value)
		this.metaAction.sf('data.search', '')
		let date = this.getYearMonth(value)
		let res = await this.webapi.automaticcalculation.initRatioAccountList({ year: date.year, month: date.month  })
		if(res.flag == 'has_month_closed' || res.flag == "record_has_generate_doc"){
			let title = "当前月已有库存单据生成凭证，无法成本计算，请删除相关凭证再进行此操作!"
			if(res.flag == 'has_month_closed') title = "已期末结账，无法计算成本！"
			const ret = await this.metaAction.modal('confirm', {
				title: '',
				className: 'ttk-scm-app-inventory-automaticcalculation-confirm',
				width: 400,
				content: <p>{title}</p>
			})
		}
		this.injections.reduce('load', res, initData)
	}

	fixPosition = (condition) => {
        this.injections.reduce('fixPosition', condition)
    }

	handleChangeSearch = (e) => {
		let value = e.target.value
		this.injections.reduce("searchChange", value)
	}

	//金额和成本率计算
	amountBlur = (currentRow, type, e, _rowIndex) => {
		let amount = Number(currentRow.amount) || 0,
			costRate = Number(currentRow.costRate) || 0,
			tempAmount = Number(currentRow.tempAmount) || 0,
			list = this.metaAction.gf('data.list').toJS(),
			datatype = this.metaAction.gf('data.type')

		if(type=='costRate'){
			costRate = e
			if(datatype=="costSaleRatio"){
				list[_rowIndex].tempAmount = (Math.round(Number(amount*(costRate/100))*1000000)/1000000).toFixed(6)
			}else{
				list[_rowIndex].tempAmount = Number(amount*(costRate/100)).toFixed(2)
			}
			list[_rowIndex].costRate = Number(costRate).toFixed(2)
		}else if(type=='tempAmount'){
			tempAmount = e
			list[_rowIndex].costRate = Number(tempAmount/amount*100).toFixed(2)
			if(datatype=="costSaleRatio"){
				list[_rowIndex].tempAmount = (Math.round(Number(tempAmount)*1000000)/1000000).toFixed(6)
			}else{
				list[_rowIndex].tempAmount = Number(tempAmount).toFixed(2)
			}
		}
		
		if(list[_rowIndex].costRate>100){
			this.metaAction.toast('warning', '成本率不能大于100')
			list[_rowIndex].costRateError = true
		}else if(list[_rowIndex].costRate<=0){
			this.metaAction.toast('warning', '成本率不能小于或等于0')
			list[_rowIndex].costRateError = true
		}else{
			list[_rowIndex].costRateError = false
		}
		
		this.injections.reduce('amountBlur', list, _rowIndex)
	}

	onOk = async () => {
		let list = this.metaAction.gf('data.list').toJS(), details = [], error = false,
			period = this.metaAction.gf('data.period'), option = {
				businessDate: period
			}, type = this.metaAction.gf('data.type')
		if(!list.length){
			this.metaAction.toast('warning', '当前没有任何可计算的数据')
			return false
		}
		list.map(m=>{
			if(m.costRateError){
				if(m.costRate>100){
					this.metaAction.toast('warning', '成本率不能大于100')
				}else if(m.costRate<=0){
					this.metaAction.toast('warning', '成本率不能小于或等于0')
				}
				error = true
				return false
			}

			let itemData = {
				inventoryId: m.inventoryId,
				tempAmount: Number(m.tempAmount) ? Number(m.tempAmount) : 0,
				costRate: null,
				quantity: m.quantity,
			}, defaultCostRate = this.metaAction.gf('data.defaultCostRate')
			if(Number(m.costRate) != Number(defaultCostRate).toFixed(2)) itemData.costRate = m.costRate

			if(type == 'costSaleRatio'){
				itemData.tempPrice = itemData.tempAmount
				delete itemData.tempAmount
			}
			details.push(itemData)
		})

		if(error) return false

		option.details = details
		let res = await this.webapi.automaticcalculation.ratioAccount(option)
		//console.log(res)
		//res = [{},{},{}]
		if(res.length){
			let failArr = []
			res.map((item, index) => {
				failArr.push({
					message: `${item.code} ${item.name}的单价为0或负数，无法自动计算销售成本`
				})
			})
			const ret = await this.metaAction.modal('show', {
				title: "计算结果",
				width: 585,
				closable: false,
				wrapClassName: 'ttk-scm-app-inventory-automaticcalculation-modal',
				children: this.getContent(failArr)
			})
		}
		this.metaAction.toast('success', '计算成功')
		return res
	}

	getContent = (failArr) => {
		return <div>{ failArr.map(item=>{ return <p>{item.message}</p> }) }</div>
	}

	//控制可选择的日期
    disabledDate = (current) => {
		// const { periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        if(current){
            // let date = this.metaAction.gf('data.date')
			let lastDayOfUnEndingClosingCalendar = this.metaAction.gf('data.lastDayOfUnEndingClosingCalendar')
			if(lastDayOfUnEndingClosingCalendar.size) lastDayOfUnEndingClosingCalendar = lastDayOfUnEndingClosingCalendar.toJS()
			lastDayOfUnEndingClosingCalendar = lastDayOfUnEndingClosingCalendar.replace(/-/g, '').slice(0, 6)
			lastDayOfUnEndingClosingCalendar = Number(`${lastDayOfUnEndingClosingCalendar}01`)
			// let enableDateNum = parseInt(moment(date).format('YYYYMMDD'))
			let currentNum = parseInt(current.format('YYYYMMDD'))

			return currentNum < lastDayOfUnEndingClosingCalendar ? true : false
        }
	}

	getYearMonth = (date) => {
		let year = date.slice(0, 4), month = Number(date.slice(5, 7)).toString()
		return { year, month }
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	}

	componentDidMount = () => {
        const win = window
        if (win.addEventListener) {
            document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.attachEvent) {
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
        }
    }

    componentWillUnmount = () => {
        window['app-account-subjects-content-grid'] = 0
        const win = window
        if (win.removeEventListener) {
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.detachEvent) {
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
        }
    }

    bodyKeydownEvent = (e) => {
        const dom = document.getElementsByClassName('ttk-scm-app-inventory-automaticcalculation')

        if (dom && dom.length > 0) {
            this.keyDownCickEvent({ event: e })
        }
    }

    //监听键盘事件
    keyDownCickEvent = (keydown) => {
        if (keydown && keydown.event) {
            let e = keydown.event

            if (e.key == "Enter" || e.keyCode == 13) {
                if (document.activeElement && document.activeElement.placeholder == '名称/规格型号/编码') {
                    if (e.preventDefault) {
                        e.preventDefault()
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation()
                    }
                }
                let condition = this.metaAction.gf('data.search')

                this.fixPosition(condition)
            }
        }
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
