import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {  DataGrid, LoadingMask, Icon } from 'edf-component'
import { List, fromJS } from 'immutable'
import renderColumns from './utils/renderColumns'
import moment from 'moment'
import utils from 'edf-utils'
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
		this.stringToMoment = utils.moment.stringToMoment
		//this.component.props.tabchange('tab1',this.onTabFocus);
		let addEventListener = this.component.props.addTabChangeListener
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
		}
		injections.reduce('init')
		this.load()
	}

	load = async (msg) => {
		
		let currentOrg = this.metaAction.context.get('currentOrg')||{},
			orgId = currentOrg.id,
			appId = currentOrg.appId,
			enabledMonth = currentOrg.enabledMonth,
			enabledYear = currentOrg.enabledYear,
			// isFromOneself = ( appId == 100 )
			isFromOneself = ( !this.component.props.isOnlyContent )
		this.metaAction.sf('data.isFromOneself', isFromOneself)
		let date = this.component.props.initData ? this.component.props.initData.date : undefined
		let systemDate = await this.webapi.addTax.getSystemDate({})
		if(systemDate && !date) {
			let monthArr = systemDate.split('-')
			date = monthArr[0]+'-'+monthArr[1]
		}
		let beginDate
		if( parseInt(date.split('-')[1]) > 11 ) {
			beginDate = parseInt(date.split('-')[0])+'-'+ '01'
		}else {
			let mon = parseInt(date.split('-')[1]) + 1
			if(mon < 10){
				mon = '0' + mon
			}
			beginDate = parseInt(date.split('-')[0]-1) +'-'+ mon
		}
		let endYearMonth = date.replace('-','')
		let beginYearMonth = beginDate.replace('-','')
		LoadingMask.show()
		let res = await this.webapi.addTax.query({ isFromOneself, beginYearMonth, endYearMonth })
		LoadingMask.hide()		
		if(res) {
			// res.start = enabledYear+'-'+enabledMonth		
			res.end = date
			res.isFromOneself = isFromOneself
			this.injections.reduce('load', res)		
			if(res.needTaxBureauInfo) {
				this.showPayTaxInfoSetPage()
			}
		}

	}

	//弹出设置企业信息弹窗
	showPayTaxInfoSetPage = async () => {
        const ret = await this.metaAction.modal('show', {
            height: 325,
            width: 440,
            //closable: false,
            okText: '设置',
            title: '纳税设置',
            wrapClassName: 'paytaxinfo-tip',
            children: this.getSetContent(),
        })

        if (ret == true) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('企业信息', 'edfx-app-org', { initData: { activeKey: '2' } })
        }
    }

    getSetContent = () => {
        return <div>
            <p className='jinggao'><Icon type="jinggao" fontFamily='edficon' /><span>请先设置网报帐号，并确认您的纳税人信息！</span></p >
        </div>
    }

	//获取时间选项
    getNormalDateValue = () => {
		let sksqStr = this.metaAction.gf('data.sksqStr')
		let skszStr = this.metaAction.gf('data.skszStr')
        const arr = []
        arr.push(sksqStr)
        arr.push(skszStr)
        return arr
    }

	onPanelChange = (value) => {
		this.metaAction.sfs({
			'data.skszStr': value[1],
			'data.sksqStr': value[0]
		})
		this.update(undefined)
    }

	update = async (msg) => {
		let getParmas = this.getParmas()
		LoadingMask.show()			
		let res = await this.webapi.addTax.query(getParmas)
		LoadingMask.hide()		
		if(res) {
			res.isFromOneself = getParmas.isFromOneself
			this.injections.reduce('load', res)	
			if(res.needTaxBureauInfo) {
				this.showPayTaxInfoSetPage()
			}			
		}
		
	}

	//当前app的 "tab被点击" (从其他app切换到当前app)
	onTabFocus = async (props) => {
		this.load()
	}

	downloadText = async () => {
		this.update(true)
	}

	getColumns = (option) => {
		let data = this.metaAction.gf('data').toJS()
		return renderColumns(data, option, this)
	}

	getParmas = () => {
		let isFromOneself = this.metaAction.gf('data.isFromOneself')
		let skszStr = this.metaAction.gf('data.skszStr')
		let sksqStr = this.metaAction.gf('data.sksqStr')
		let beginYearMonth = moment(sksqStr).format('YYYY-MM').replace('-','')
		let endYearMonth = moment(skszStr).format('YYYY-MM').replace('-','')

		return {
			isFromOneself, beginYearMonth, endYearMonth
		}
	}

	disabledStartDate = (currentValue) => {
		let dateEnd = this.metaAction.gf('data.end')
        if( !dateEnd ){
            return false
		}
		return currentValue >= moment(dateEnd).endOf('day')
		
	}

	//导出
    export = async () => {
        if (this.metaAction.gf('data.list').toJS().length < 2) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
		}
		let getParmas = this.getParmas()
		getParmas.querytype = 'month'
        await this.webapi.addTax.export(getParmas)

    }
    //打印
    print = async () => {
		if (this.metaAction.gf('data.list').toJS().length < 2) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
		}
		let getParmas = this.getParmas()
		getParmas.querytype = 'month'
		// console.log(getParmas)
        
		
        await this.webapi.addTax.print(getParmas)
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
