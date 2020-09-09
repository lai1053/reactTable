import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS, is } from 'immutable'
import config from './config'
import moment from 'moment'
import utils from 'edf-utils'
import { addThousandsPosition } from './data'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.load()
    }

    load = async () => {
        let res = this.component.props.data
        let period = `${this.component.props.period.year}.${this.component.props.period.period}`;
        if(res){
            this.initData(res.periodList, res, period)
        }else{
            this.injections.reduce('init', {period})
        }
    }

    componentWillReceiveProps = (nextProps) => {
        // if((!is(nextProps.periodList, this.component.props.periodList) || !is(nextProps.data, this.component.props.data)) && nextProps.data){
        //     this.initData(nextProps.periodList, nextProps.data)
        // }
    }

    initData = (periodList, capitalAccount,period) => {
        delete capitalAccount.periodList
        let list = periodList.map( o => {
            return o.replace('年', '.').replace('月', '')
        }),
        data = {},

        {accountSumAmount, ...value} = capitalAccount
        for(let obj in value){
            value[obj] = Object.entries(value[obj])[0]
        }
        data = {
            periodList: list,
            capitalAccount: value,
            accountSumAmount: accountSumAmount,
            period:period
        }
        this.injections.reduce('init', data)
    }

    setData = async (path, value) => {
        this.metaAction.sf('data.period', value)
        let params = {year: value.split('.')[0], period: value.split('.')[1]},
            data = await this.webapi.query(params)
        this.refreshData(data)
    }

    openBalancesum = (key) => async () => {

        if(key == 'accountToCashAccountAmountMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '资金账户', '现金账户'])
        }else if(key == 'accountToAlipayAmountMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '资金账户', '支付宝'])
        }else if(key == 'accountToWeChatAmountMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '资金账户', '微信'])
        }else if(key == 'accountToBankAccountAmountMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '资金账户', '银行账户'])
        }
        //余额表
        let value = this.metaAction.gf('data.capitalAccount').toJS(),
            dateValue = this.metaAction.gf('data.period')

        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
            accessType: 1,
            initSearchValue: {
                date_end: this.metaAction.stringToMoment((dateValue.replace('.', "-")),'YYYY-MM'),
                date_start: this.metaAction.stringToMoment((dateValue.replace('.', "-")),'YYYY-MM'),
                beginAccountCode: value[key][0].split(',')[0],
                endAccountCode: value[key][0].split(',').length==2?value[key][0].split(',')[1]:value[key][0].split(',')[0]
            }
        })
    }

    refresh = async () => {
        _hmt && _hmt.push(['_trackEvent', '桌面', '资金账户', '刷新'])
        let value = this.metaAction.gf('data.period'),
		    params = {year: value.split('.')[0], period: value.split('.')[1]},
            data = await this.webapi.query(params)
        this.refreshData(data)
	}

    refreshData = (capitalAccount) => {
        let {accountSumAmount, ...value} = capitalAccount
        for(let obj in value){
            value[obj] = Object.entries(value[obj])[0]
        }
        this.injections.reduce('refresh', value, accountSumAmount)
    }
    convertData = (type, value) => {//银行账户

        let newValue
        switch (type) {
        case "accountToBankAccountAmountMap" :
            newValue = addThousandsPosition(value.toFixed(2))
            break;
        case "accountToAlipayAmountMap" :
            newValue = addThousandsPosition(value.toFixed(2))
            break;
        case "accountToCashAccountAmountMap" :
            newValue = addThousandsPosition(value.toFixed(2))
            break;
        case "accountToWeChatAmountMap" :
            newValue = addThousandsPosition(value.toFixed(2))
            break;
        case "total" :
            newValue = addThousandsPosition(Number(value).toFixed(2))
            break;
        }
        return newValue
    }

    getPeriodDate = () =>  moment(this.metaAction.gf('data.period'))
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
