import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import { Map, fromJS } from 'immutable'
import config from './config'
import { Tree } from 'edf-component'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import moment from 'moment'
import utils, { environment } from 'edf-utils'
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
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        const res = await this.webapi.dateCard.getCalcMode()
        if (this.component.props.initData) {
            if (this.component.props.initData.periodBeginDate) res.periodBeginDate = this.component.props.initData.periodBeginDate
            // if(this.component.props.initData.paramValue) res.paramValue = this.component.props.initData.paramValue
        }
        if (res) this.injections.reduce('load', res)
    }
    handleCloseInventory = async () => {
        let dateRes = await this.webapi.dateCard.getNeedMonthlyClosingPeriod();
        if (!dateRes) return
        dateRes = utils.date.transformMomentDate(`${dateRes.year}-${dateRes.month}`).format('YYYY-MM');//需要接账的日期

        let enableTime = this.metaAction.gf('data.form.paramValue');//启用日期
        
        if (moment(dateRes).valueOf()> moment(enableTime).valueOf()) {
            this.metaAction.toast('error', `存货启用月份${enableTime.slice(0, 4)}年${enableTime.slice(5)}月已结账，无法关闭存货`);
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '确认',
            width: 550,
            content: <div>
                <div>存货关闭将清空以下数据，是否确定关闭存货？</div>
                <ul style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                    marginTop: 10,
                    //listStylePosition:'inside'
                }}>
                    <li>(1)将清空存货期初相关数据</li>
                    <li>(2)将清空凭证科目设置----库存业务科目设置相关的科目对应关系</li>
                    <li>(3)将清空存货单据中所有单据及存货报表数据</li>
                </ul>
            </div>
        })
        if (ret) {
            let res = await this.webapi.dateCard.disableInventory();
            if (res === null) {
                this.component.props.resetPortal('门户首页', 'edfx-app-portal', {
                    isShowMenu: false,
                    isTabsStyle: false
                })
                this.component.props.closeModal();
            }
        }
    }
    selectMethod = (path, v, type) => {
        let sfsObj={}
        sfsObj["data.accountRatioError"] = false
        if (type == "valuationMethod") {
            let {production, accountRatio}= this.metaAction.gf('data.other').toJS()
            if (v == "1") {
                delete production[0].disabled
                delete production[2].disabled
                production[1].disabled = "disabled"
                sfsObj["data.form.productionId"] = "1"
                sfsObj["data.form.inputNumber"] = 100
                sfsObj["data.form.costId"] = '1'
                // sfsObj["data.accountRatioError"] = false
                // this.metaAction.sf("data.form.productionId", "1")
                // this.metaAction.sf("data.accountRatioError", false)
            } else if (v == "2"||v=='3') {
                production[0].disabled = "disabled"
                production[2].disabled = "disabled"
                delete production[1].disabled
                sfsObj["data.form.productionId"] = "3"
                sfsObj["data.form.inputNumber"] = null
                sfsObj["data.form.costId"] = '1'
                // this.metaAction.sf("data.form.productionId", "3")
                // this.metaAction.sf("data.form.inputNumber", 100)
            } 
            // else if (v == "3") {
            //     production[0].disabled = "disabled"
            //     production[1].disabled = "disabled"
            //     delete production[2].disabled
            //     sfsObj["data.form.productionId"] = ""
            //     sfsObj["data.form.inputNumber"] = null
            //     sfsObj["data.form.costId"] = '2'
            //     // this.metaAction.sf("data.form.productionId", "")
            //     // this.metaAction.sf("data.form.inputNumber", 100)
            // }
            sfsObj["data.other.production"] = fromJS(production)
            // this.metaAction.sf('data.other.production', fromJS(production))
        }
        // this.metaAction.sf(path, v)
        sfsObj[path] = v
        this.metaAction.sfs(sfsObj)
    }

    accountRatioBlur = (path, v) => {
        if (v > 100 || v <= 0 || v==null) {
            let message = '成本占收入比例不能大于100'
            if (v === "" || !v) {
                message = '请填写成本占收入比例'
            } else if (v <= 0) {
                message = '成本占收入比例不能小于或等于0'
            }
            this.metaAction.toast('warning', message)
            this.metaAction.sf("data.accountRatioError", true)
        } else {
            this.metaAction.sf("data.accountRatioError", false)
        }
        this.metaAction.sf(path, v)
    }

    //确定
    onOk = async () => {
        let form = this.metaAction.gf('data.form').toJS()
        //     accountRatioError = this.metaAction.gf('data.accountRatioError')
        // if (accountRatioError) {
            let message = ''
            if(form.valuationMethodId != 1) {
                if (form.inputNumber === "" || form.inputNumber == null) {
                    message = '请填写成本占收入比例'
                } else if (form.inputNumber <= 0) {
                    message = '成本占收入比例不能小于或等于0'
                }else if(form.inputNumber>100){
                    message = '成本占收入比例不能大于100'
                }
    
            }
            
            if(message) {
                this.metaAction.toast('warning', message)
                this.metaAction.sf('data.accountRatioError', true)
                return false
            }
        // }
        let productionAccounting = 0,
            paramValue = this.metaAction.gf('data.form.paramValue'),
            option = {
                mode: form.methodId,
                productionAccounting,
                paramValue
            }
        if(form.inputNumber) option.accountRatio = form.inputNumber
        if (form.valuationMethodId == '2') {
            option.mode = '3'
        } else if (form.valuationMethodId == '3') {
            option.mode = '4'
        }

        if (form.productionId == 1) {
            option.productionAccounting = 0
        } else if (form.productionId == 2 && form.costId == 1) {
            option.productionAccounting = 1
        } else if (form.productionId == 2 && form.costId == 2) {
            option.productionAccounting = 2
        } else if (form.productionId == 3) {
            option.productionAccounting = 3
        } else if (form.productionId == "") {
            option.productionAccounting = ''
        }

        if (option.productionAccounting != 3 && this.component.props.initData.tabEdit) {
            this.component.props.initData.tabEdit('销售成本核算', 'remove')
        }
        if (option.productionAccounting == 0 && this.component.props.initData.tabEdit) {
            this.component.props.initData.tabEdit('配置原料', 'remove')
        }

        option.recoilMode = form.recoilModeId

        // debugger
        const res = await this.webapi.dateCard.updateCalcMode(option)
        this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
        if (res) return { paramValue, option }
    }

    handleDisabledDate = (current) => {
        if (current) {
            let enableTime = this.metaAction.gf('data.other.enableTime'), currentDate = current.format('YYYY-MM')
            if (enableTime) enableTime = enableTime.replace(/-/g, '')
            if (currentDate) currentDate = currentDate.replace(/-/g, '')
            return currentDate && currentDate < enableTime
        }
    }

    handleDateChange = async (v) => {
        const value = this.metaAction.momentToString(v, "YYYY-MM")
        const res = await this.webapi.dateCard.changeSatrtDate({ paramValue: value })

        if (res) {
            if (!res.dateChangeFlag) {
                const ret = await this.metaAction.modal('confirm', {
                    title: '确认',
                    width: 400,
                    content: '存在已生成凭证的进项/销项发票，修改后将自动生成库存单据，是否修改启用日期?'
                })

                if (ret) {
                    this.metaAction.sf('data.form.paramValue', this.metaAction.momentToString(v, "YYYY-MM"))
                }
            } else {
                this.metaAction.sf('data.form.paramValue', this.metaAction.momentToString(v, "YYYY-MM"))
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret

}