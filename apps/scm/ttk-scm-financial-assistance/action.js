import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, Tree, Form, Select, Switch } from 'edf-component'
import config from './config'
import extend from './extend'
import moment from 'moment'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'

const Option = Select.Option
const FormItem = Form.Item

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

        /*this.component.props.sfybnsr = '0'
        this.component.props.skssqq = '20180801'
        this.component.props.skssqz = '20180831'*/

        let currentOrg = this.metaAction.context.get("currentOrg"),
            date = moment().format('YYYY-MM')
        if (currentOrg.periodDate) {
            date = currentOrg.periodDate
        }
        let sfybnsr = '1', isCurrent = true,
            generalTaxPayer = consts.VATTAXPAYER_generalTaxPayer,
            smallScaleTaxPayer = consts.VATTAXPAYER_smallScaleTaxPayer,
            props = this.component.props

        if (currentOrg.vatTaxpayer == generalTaxPayer) {
            sfybnsr = '1'
        } else if (currentOrg.vatTaxpayer == smallScaleTaxPayer) {
            sfybnsr = '0'
        }

        if (props.sfybnsr) {
            isCurrent = false
            sfybnsr = props.sfybnsr
        }
        if (props.skssqq) {
            date = this.getBeginUseTime(props.skssqq)
        }

        let option = {
            date: date,
            isVATTAXPAYER_generalTaxPayer: sfybnsr == 1 ? true : false,
            isCurrent: isCurrent
        }

        if (typeof (gio) == "function") {
            gio('track', 'sfjkgy')
        }
        _maq && _maq.push(['_trackEvent', 'sfjkgy', '税负监控-概要', '税负监控-概要'])

        injections.reduce('init', option)
    }

    setFilters = (type, value) => {
        if (type == 'outline') {
            this.metaAction.sfs({
                'data.typeoutline': type,
                'data.valueoutline': value
            })
        }
        if (type == 'entry') {
            this.metaAction.sfs({
                'data.typeentry': type,
                'data.valueentry': value
            })
        }
        if (type == 'sales') {
            this.metaAction.sfs({
                'data.typesales': type,
                'data.valuesales': value
            })
        }
    }

    handletabchange = (key) => {
        const incomeexpensesTab = this.metaAction.gf('data.other.incomeexpensesTab').toJS()
        const item = incomeexpensesTab.find(o => o.id == key)
        let currentOrg = this.metaAction.context.get("currentOrg")

        switch (key) {
            case '1':
                if (typeof (gio) == "function") { gio('track', 'sfjkgy') }
                _maq && _maq.push(['_trackEvent', 'sfjkgy', '税负监控-概要', '税负监控-概要'])
                break;
            case '2':
                if (typeof (gio) == "function") { gio('track', 'sfjkjxfpmx') }
                _maq && _maq.push(['_trackEvent', 'sfjkjxfpmx', '税负监控-进项发票明细', '税负监控-进项发票明细'])
                break;
            case '3':
                if (typeof (gio) == "function") { gio('track', 'sfjkxxfpmx') }
                _maq && _maq.push(['_trackEvent', 'sfjkxxfpmx', '税负监控-销项发票明细', '税负监控-销项发票明细'])
                break;
            case '4':
                if (typeof (gio) == "function") { gio('track', 'sfjkzzssbay') }
                _maq && _maq.push(['_trackEvent', 'sfjkzzssbay', '税负监控-增值税申报（按月）', '税负监控-增值税申报（按月）'])
                break;
            case '5':
                if (typeof (gio) == "function") { gio('track', 'sfjkzzssblj') }
                _maq && _maq.push(['_trackEvent', 'sfjkzzssblj', '税负监控-增值税申报（累计）', '税负监控-增值税申报（累计）'])
                break;
            default:
                if (typeof (gio) == "function") { gio('track', 'sfjkgy') }
                _maq && _maq.push(['_trackEvent', 'sfjkgy', '税负监控-概要', '税负监控-概要'])
        }

        this.injections.reduce('handletabchange', key)
    }

    addTabChangeListener = (eventName, handler) => {
        this.injections.reduce('addTabChangeListener', eventName, handler)
    }

    removeTabChangeListener = (eventName) => {
        this.injections.reduce('removeTabChangeListener', eventName)
    }

    getBeginUseTime = (beginUseTime) => {
        if (!beginUseTime) return ''
        let year = beginUseTime.substring(0, 4), mounth = beginUseTime.substring(4, 6)
        return `${year}-${mounth}`
    }

    openJchl = () => {
        let activeKey = this.metaAction.gf('data.other.activeKey')
        if (activeKey == '1') {

        } else if (activeKey == '2') {

        } else if (activeKey == '3') {

        } else if (activeKey == '4') {

        } else if (activeKey == '5') {

        }

        let currentOrg = this.metaAction.context.get("currentOrg")
        if (typeof (gio) == "function") { gio('track', 'sfjkljty') }
        _maq && _maq.push(['_trackEvent', 'sfjkljty', '税负监控-立即体验', '税负监控-立即体验'])

        let url = location.origin + "/" + location.hash + '?ttk-token=' + sessionStorage.getItem('_accessToken')
        url = url.replace("ttk-edf-app-simple-portal", "edfx-app-portal")
        let params = {
            "appid": "JCGJ",
            "appName": "NotifyCallApplication",
            "isExecute": "6",
            "appAddress": url,
            "appRegRoot": "",
            "appRegPath": "",
            "appRegName": "",
            "appParam": "title=金财管家"
        }
        _omni.container.sendmessagetocontainer(JSON.stringify(params))

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