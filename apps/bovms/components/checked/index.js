import React from "react"
import BatchSubjectSetting from "../batchSubjectSetting"
import StepOne from "./stepOne"
import StepTwo from "./stepTwo"
import XsStepTwo from "./xsStepTwo"
import moment from "moment"
import NewXsStepTwo from "./newXsStepTwo"
import AutoMatchSetting from '../autoMatchSetting'

/*
 * module 进项或者销项 必传
 */
class quPiao extends React.Component { 
    constructor(props) {
        super(props)
        this.state = {
            date: moment(props.nsqj).subtract(0, "month") || "201908",
            nsrxz: props.vatTaxpayer === 2000010002, //2000010002:小规模 2000010001:一般纳税人
            stock: props.stock === 1 ? 1 : 0,
            startValue: null,
            endValue: null,
            tableLoadingL: false,
            resDate: "",
            step: 1
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }
    onCancel = e => {
        e && e.preventDefault && e.preventDefault()
        this.props.closeModal && this.props.closeModal()
    }

    closeModal = e => {
        this.props.closeModal && this.props.closeModal()
    }
    stepOneNext = async params => {
        this.params = params
        this.setState({
            step: 2
        })
    }

    stepTwoPrev = () => {
        this.setState({
            step: 1
        })
    }
    //进项入库发票
    async purchaseTakeSave(params, yearPeriod) {
        const { module } = this.props
        const { stock } = this.state

        //获取设置
        let settingRes = await this.props.webapi.bovms.queryAccountingSetupRule({
            yearPeriod,                 //当前会计期间（必传）
            module: module === 'xs' ? 1 : 2,                          //模块名称，1：销项；2：进项（必传）
            inventoryEnableState: stock       //存货启用状态，1：启用；0：没有启用（必传）
        })
        //判断是否【不再自动弹出】
        if (settingRes.noAutoPopup !== '1') {
            await this.props.metaAction.modal("show", {
                title: "核算精度和自动匹配设置",
                style: { top: 25 },
                width: 960,
                footer: null,
                children: (
                    <AutoMatchSetting
                        metaAction={this.metaAction}
                        webapi={this.webapi}
                        yearPeriod={yearPeriod}
                        module={module === 'xs' ? 1 : 2}
                        inventoryEnableState={stock}
                    />
                )
            })
        }

        let { accountList } = params
        //按照后台要求 去掉多余字段
        accountList = [].concat(accountList).map(e => {
            delete e.goodName
            delete e.goodNameList
            delete e.dljgId
            delete e.orgId
            delete e.acct20CiName
            delete e.vchState
            delete e.invKindName
            delete e.yearPeriod
            delete e.key
            e.detailList = e.detailList.map(de => {
                if (!de.qty) {
                    de.qty = null
                }
                if (!de.unitPrice) {
                    de.unitPrice = null
                }
                delete de.dljgId
                delete de.orgId
                delete de.indexNo
                delete de.acct10CiName
                delete de.isStock
                return de
            })
            return e
        })
        params.accountList = accountList
        params.insertType = 'take'
        let res = await this.props.webapi.bovms.batchSavePurchaseInvoice(params)

        this.stepThreeIds = res.billIds
        this.yearPeriod = yearPeriod
        this.setState({
            step: 3
        })
    }

    //销项入库发票
    async saleTakeSave(billList, toggleLoading) {
        const { module } = this.props
        const { stock } = this.state
        let yearPeriod = parseInt(moment(this.props.nsqj).subtract(0, "month").format("YYYYMM"))
        //获取设置
        let settingRes = await this.props.webapi.bovms.queryAccountingSetupRule({
            yearPeriod,                 //当前会计期间（必传）
            module: module === 'xs' ? 1 : 2,                          //模块名称，1：销项；2：进项（必传）
            inventoryEnableState: stock       //存货启用状态，1：启用；0：没有启用（必传）
        })
        //判断是否【不再自动弹出】
        if (settingRes.noAutoPopup != '1') {
            await this.metaAction.modal("show", {
                title: "核算精度和自动匹配设置",
                style: { top: 25 },
                width: 960,
                footer: null,
                children: (
                    <AutoMatchSetting
                        metaAction={this.metaAction}
                        webapi={this.webapi}
                        yearPeriod={yearPeriod}
                        module={module === 'xs' ? 1 : 2}
                        inventoryEnableState={stock}
                    />
                )
            })
        }

        let params = {}
        let arr = JSON.parse(JSON.stringify(billList))
        params.yearPeriod = yearPeriod
        params.insertType = 'take'
        params.billList = arr.map(e => {
            delete e.goodName
            delete e.goodNameList
            delete e.dljgId
            delete e.orgId
            delete e.acct10CiName
            delete e.vchState
            delete e.invKindName
            delete e.yearPeriod
            delete e.key
            e.detailList = e.detailList.map(de => {
                if (!de.qty) {
                    de.qty = null
                }
                if (!de.unitPrice) {
                    de.unitPrice = null
                }
                delete de.dljgId
                delete de.orgId
                delete de.indexNo
                delete de.acct20CiName
                delete de.isStock
                return de
            })
            return e
        })
        params.inventoryEnableState = stock
        let res = await this.props.webapi.bovms.batchInsertSaleBillInfo(params)
        toggleLoading()
        if (res) {
            this.yearPeriod = params.yearPeriod
            this.props.metaAction.toast("success", '取票成功')
            this.stepThreeIds = res
            this.setState({
                step: 3
            })
        }
    }

    nsqjChange() {
        this.props.nsqjChange()
        this.closeModal()
    }
    componentWillUnmount() {
        this.nsqjChange()
    }

    render() {
        const { step, nsrxz, date } = this.state
        const { module, webapi, metaAction } = this.props
        let imgClass = `bovms-app-guidePage-invoce-range-popup-img stepImg${step}`

        return (
            <div className="bovms-app-guidePage-invoce-range-popup">
                <div className={imgClass}>
                    {/* {step === 1 && (
                        <img src={module == "cg" ? stepImg1 : xsStepImg1}></img>
                    )}
                    {step === 2 && (
                        <img src={module == "cg" ? stepImg2 : xsStepImg2}></img>
                    )}
                    {step === 3 && (
                        <img src={module == "cg" ? stepImg3 : xsStepImg3}></img>
                    )} */}
                </div>

                {/* 步骤一用显示隐藏是为了不传参数保留住现在的状态 */}
                <div
                    style={
                        step === 1 ? { display: "block" } : { display: "none" }
                    }
                >
                    <StepOne
                        module={module}
                        nsrxz={nsrxz}
                        date={date}
                        onNext={this.stepOneNext}
                        metaAction={metaAction}
                        webapi={webapi}
                        onCancel={this.closeModal}
                    ></StepOne>
                </div>
                {/*进项选发票*/}
                {step === 2 && module === "cg" && (
                    <StepTwo
                        nsrxz={nsrxz}
                        date={date}
                        params={this.params}
                        webapi={this.props.webapi}
                        onPrev={this.stepTwoPrev}
                        onCancel={this.closeModal}
                        metaAction={metaAction}
                        onPurchaseTakeSave={this.purchaseTakeSave.bind(this)}
                    ></StepTwo>
                )}
                {/* 销项发票预览 */}
                {step === 2 && module === "xs" && (
                    <NewXsStepTwo
                        nsrxz={nsrxz}
                        date={date}
                        params={this.params}
                        webapi={this.props.webapi}
                        onPrev={this.stepTwoPrev}
                        onCancel={this.closeModal}
                        metaAction={metaAction}
                        onSaleTakeSave={this.saleTakeSave.bind(this)}
                    ></NewXsStepTwo>
                )}

                {/* {step === 2 && module === "xs" && (
                    <XsStepTwo
                        nsrxz={nsrxz}
                        date={date}
                        params={this.params}
                        webapi={this.props.webapi}
                        onPrev={this.stepTwoPrev}
                        onCancel={this.closeModal}
                        metaAction={this.props.metaAction}
                        onSaleTakeSave={this.saleTakeSave.bind(this)}
                    ></XsStepTwo>
                )} */}

                {step === 3 && (
                    <div className="bovms-batch-subject-setting">
                        <BatchSubjectSetting
                            ids={this.stepThreeIds}
                            yearPeriod={this.yearPeriod}
                            store={this.props.store}
                            webapi={this.props.webapi}
                            metaAction={this.props.metaAction}
                            nsqjChange={this.nsqjChange.bind(this)}
                            setCancelLister={this.props.setCancelLister}
                            module={module}
                            isStock={this.state.stock === 1 ? true : false}>

                        </BatchSubjectSetting>
                    </div>
                )}
            </div>
        )
    }
}
export default quPiao
