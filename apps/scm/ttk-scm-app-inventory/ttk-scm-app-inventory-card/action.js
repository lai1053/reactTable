import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import config from './config'
import {Tree} from 'edf-component'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import moment from 'moment'
import utils from 'edf-utils'
import { fromJS } from 'immutable';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        // 默认时间和会计期间时间一致
        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        if(periodDate) this.metaAction.sf('data.other.beginDate', periodDate)

        let res = await this.webapi.dateCard.getMaxMonthlyClosingPeriod()
        if(res) this.injections.reduce('load', res)
    }

    disabledBeginDate = (current) => {
        let endDate = this.component.props.enabledPeriod
        let monthlyClosing = this.metaAction.gf('data.other.monthlyClosing')
        if(monthlyClosing){
            if(current){
                return parseInt(current.format('YYYYMM')) <= parseInt(moment(monthlyClosing).format('YYYYMM'))
            }
        }else if(current){
            return parseInt(current.format('YYYYMM')) < parseInt(moment(endDate).format('YYYYMM'))
        }
    }
    changeDate = (value) => {
        this.injections.reduce('update', 'data.other.beginDate', value)
    }

    checkBoxChange = (path, v, type) => {
        let sfsObj={}
        sfsObj["data.accountRatioError"] = false
        if(type=="valuationMethod"){
            let production = this.metaAction.gf('data.other.production').toJS()
            if(v==1){
                delete production[0].disabled
                delete production[2].disabled
                production[1].disabled = "disabled"
                sfsObj["data.form.productionId"] = 1
                sfsObj["data.form.inputNumber"] = 100
                sfsObj["data.form.costId"] = 1
                // sfsObj["data.accountRatioError"] = false
                // this.metaAction.sf("data.form.productionId", 1)
                // this.metaAction.sf("data.accountRatioError", false)
            }else if(v==2||v=='3'){
                production[0].disabled = "disabled"
                production[2].disabled = "disabled"
                delete production[1].disabled
                sfsObj["data.form.productionId"] = 3
                sfsObj["data.form.inputNumber"] = null
                sfsObj["data.form.costId"] = 1
                // this.metaAction.sf("data.form.productionId", 3)
                // this.metaAction.sf("data.form.inputNumber", 100)
            }
            // else if(v=="3"){
            //     production[0].disabled = "disabled"
            //     production[1].disabled = "disabled"
            //     delete production[2].disabled
            //     sfsObj["data.form.productionId"] = ''
            //     sfsObj["data.form.inputNumber"] = null
            //     sfsObj["data.form.costId"] = 2
            //     // this.metaAction.sf("data.form.productionId", "")
            //     // this.metaAction.sf("data.form.inputNumber", 100)
            // }
            sfsObj["data.other.production"] = fromJS(production)
            // this.metaAction.sf('data.other.production', fromJS(production))
        }
        sfsObj[path] = v
        this.metaAction.sfs(sfsObj)
        // this.metaAction.sf(path, v)
    }

    accountRatioBlur = (path, v) => {
        if(v>100 || v<=0 || !v){
            let message = '成本占收入比例不能大于100'
            if(v==="" || v==null) {
                message = '请填写成本占收入比例'
            }else if(v<=0) {
                message = '成本占收入比例不能小于或等于0'
            }
            this.metaAction.toast('warning', message)
            this.metaAction.sf("data.accountRatioError", true)
        }else{
            this.metaAction.sf("data.accountRatioError", false)
        }
        this.metaAction.sf(path, v)
    }

    //确定
	onOk = async () => {
        let value = this.metaAction.gf('data.other.beginDate'),
            form = this.metaAction.gf('data.form').toJS()
            // accountRatioError = this.metaAction.gf('data.accountRatioError')
        // if(accountRatioError){
            let message = ''
            if(form.inputNumber==="" || form.inputNumber == null) {
                message = '请填写成本占收入比例'
            }else if(form.inputNumber<=0) {
                message = '成本占收入比例不能小于或等于0'
            }else if(form.inputNumber>100){
                message = '成本占收入比例不能大于100'
            }
            if (message) {
                this.metaAction.toast('warning', message)
                this.metaAction.sf('data.accountRatioError', true)
                return false
            }
        // }
        
        let productionAccounting = 0,
            option = {
                paramValue: value,
                mode: form.methodId,
                productionAccounting
            }
        if(form.inputNumber) option.accountRatio = form.inputNumber
        if(form.valuationMethodId=='2') {
            option.mode = '3'
        }else if(form.valuationMethodId=='3'){
            option.mode = '4'
        }

        if(form.productionId==1){
            option.productionAccounting = 0
        }else if(form.productionId==2 && form.costId==1) {
            option.productionAccounting = 1
        }else if(form.productionId==2 && form.costId==2) {
            option.productionAccounting = 2
        }else if(form.productionId==3){
            option.productionAccounting = 3
        }else if(form.productionId==""){
            option.productionAccounting = ''
        }

        option.recoilMode = form.recoilModeId

        const res = await this.webapi.dateCard.createDate(option)
        // const ret = await this.webapi.dateCard.updateCalcMode({mode: modeId})
        let response = {beginDate: value, mode: form.methodId, productionAccounting}
        return response
    }

    // 关闭弹框和页面
    onCancel = () => {
        if(this.component.props.tabEdit){
            if(this.component.props.appNames == 'beginning'){
                this.component.props.tabEdit('存货期初','remove')
            }else{
                this.component.props.tabEdit('存货','remove')
                this.component.props.tabEdit('存货台账','remove')
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret

}
