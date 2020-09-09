import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS, is } from 'immutable'
import config from './config'
import moment from 'moment'
import utils from 'edf-utils'

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
        let period  = `${this.component.props.period.year}.${this.component.props.period.period}`;
        let isExpire = this.component.props.isExpire
        if(res){
            this.initData(res.periodList,res.certificateCount,period,isExpire)
        }else{
            this.injections.reduce('init',{period,isExpire})
        }
    }

    componentWillReceiveProps = (nextProps) => {
        // if((!is(nextProps.periodList, this.component.props.periodList) || !is(nextProps.data, this.component.props.data)) && nextProps.data){
        //         this.initData(nextProps.periodList, nextProps.data.certificateCount)
        // }
    }

    initData = (periodList, certificateCount,period,isExpire) => {
        let list = periodList.map( o => {
            return o.replace('年', '.').replace('月', '')
        }),
        data = {
            periodList: list,
            certificateCount: certificateCount,
            period:period,
            isExpire:isExpire
        };
        this.injections.reduce('init',data)
    }

    setField = async (path, value) => {
        this.metaAction.sf('data.period', value)
        let params = {year: value.split('.')[0], period: value.split('.')[1]}
        let data = await this.webapi.query(params)
        this.metaAction.sf('data.certificateCount', data.certificateCount)
    }

    openList = async () => {
        let isExpire = this.metaAction.gf('data.isExpire')
        if(isExpire) return
        _hmt && _hmt.push(['_trackEvent', '桌面', '凭证', '凭证数'])
            //凭证管理
            let value = this.metaAction.gf('data.period')
			this.component.props.setPortalContent &&
			this.component.props.setPortalContent('凭证管理', 'app-proof-of-list',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM')
                }               
            })
    }

    openCharge = async () => {
        //填制凭证
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('填制凭证',
        'app-proof-of-charge',
        { 
            accessType: 1,
            initData: { newCertificate: true } })
    }

    openBalancesum = async () => {
        //余额表
        let value = this.metaAction.gf('data.period')
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
            accessType: 1,
            initSearchValue: {
                date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM')
            }               
        })
    }

    refresh = async () => {
        let value = this.metaAction.gf('data.period'),
		    params = {year: value.split('.')[0], period: value.split('.')[1]},
            data = await this.webapi.query(params)
        this.metaAction.sf('data.certificateCount', data.certificateCount)
	}

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}