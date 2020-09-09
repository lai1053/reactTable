import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import { Select } from 'edf-component'
import moment from 'moment'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.initLoad()
    }

    onTabFocus = () => {
        this.initLoad()
    }
    
    initLoad = async () => {
        let res = await this.webapi.salescostaccount.queryParam() 
        this.injections.reduce('load', res)
    }

    handleJumpPage = (type) => {
        let businessId,
            enableTime = this.metaAction.gf('data.lastCalendar'),
            startDate = enableTime
            //debugger
        let currentOrg = this.metaAction.context.get("currentOrg")
        if(currentOrg.periodDate && moment(currentOrg.periodDate)>moment(enableTime)){
            startDate = currentOrg.periodDate
        }
        if (type == 'salesOutlet') {
            businessId = 5001001005
            //console.log({ accessType: 1, startDate, enableTime, businessId })
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('出入库明细表', 
                'ttk-scm-app-warehouse-detail', { accessType: 1, startDate, enableTime, businessId })
        } else if (type == 'procurement') {
            businessId = 5001001001
            //console.log({ accessType: 1, startDate, enableTime, businessId })
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('出入库明细表', 
                'ttk-scm-app-warehouse-detail', { accessType: 1, startDate, enableTime, businessId })
        }
    }
    
    //按比例自动计算销售成本
    salesAutomaticCalculation = async () => {
        let date = this.metaAction.gf('data.lastCalendar'),
            mode = this.metaAction.gf('data.mode'), title = '按比例自动计算销售成本'
        if(mode=='4') title = '按比例结转销售成本'
        const ret = await this.metaAction.modal('show', {
            title: title,
            wrapClassName: 'inventory-automaticcalculation',
            width: 900,
            okText: '确定',
            bodyStyle: { padding: '0' },
            closeModal: this.close,
			closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                store: this.component.props.store,
                initData: { date, type: mode=='4' ? 'costSaleRatio' : '' }
            }),
        })
    }

    close = (ret) => {
		this.closeTip()
	}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}