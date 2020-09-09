import React from "react"
import { Tabs } from "edf-component"
import { Button, Popover, Spin } from "antd"
const { TabPane } = Tabs
import { generatorRandomNum, setListEmptyVal } from "../../utils/index"
import moment from "moment"
import Debit from "./debit" //借方科目
import Loan from "./loan" //贷方科目
import { isArray } from "core-js/fn/array"


class BatchSubjectSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            creditSetupList: [],//借方数据
            debitSetupList: [],//贷方数据
            loading: false,
            settingData: {}
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
        props.setCancelLister(this.onCancel)
    }

    componentDidMount() {
        this.initData()
    }

    async initData() {
        const { ids, module, yearPeriod, isStock } = this.props
        this.setState({ loading: true })
        let params = {
            yearPeriod,
            billIds: ids,
            inventoryEnableState: isStock ? 1 : 0,
            billIdList: ids
        }
        let setupParams = {
            yearPeriod,                 //当前会计期间（必传）
            module: module === 'xs' ? 1 : 2,                          //模块名称，1：销项；2：进项（必传）
            inventoryEnableState: isStock ? 1 : 0       //存货启用状态，1：启用；0：没有启用（必传）
        }
        let res = await this.webapi.bovms[module === 'cg' ? 'queryBatchPurchaseInvoiceList' : 'queryBatchSetupSaleBillInfo'](params)
        //获取精度设置信息
        let setupRes = await this.webapi.bovms.queryAccountingSetupRule(setupParams)
        if (res) {
            this.setState({
                creditSetupList: res.creditSetupList.map(e => {
                    e.uuId = generatorRandomNum()
                    if (module === 'cg' && setupRes.account20MatchDto.systemAutoMatchAccountAndStock === '1') {
                        this.initLoanSwitchState(e)
                    }
                    if (module === 'xs' && setupRes.account20MatchDto.systemAutoMatchAccountAndStock === '1') {
                        this.initDebitSwitchState(e)
                    }
                    return e
                }),
                debitSetupList: res.debitSetupList.map(e => {
                    e.uuId = generatorRandomNum()
                    if (module === 'cg' && setupRes.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
                        this.initDebitSwitchState(e)
                    }
                    if (module === 'xs' && setupRes.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
                        this.initLoanSwitchState(e)
                    }

                    return e
                }),
                loading: false,
                settingData: { ...setupRes }
            })
        }
    }
    //初始化数据
    initDebitSwitchState(row) {
        const { isStock, module } = this.props
        let assis = row[module === 'cg' ? 'acct10CiName' : 'acct20CiName']
        let json = assis ? JSON.parse(assis).assistList : null
        row.needMemory = 1
        row.showSwitch = true
        if (isStock) {
            //进项
            if (module === 'cg') {
                //启用存货时，【是否存货】为【是】的记录，存货档案未设置时，不显示开关。
                if (row.isStock === '1') {
                    if (!row.stockId || (module === 'cg' ? !row.acct10Id : !row.acct20Id)) {
                        row.needMemory = 0
                        row.showSwitch = false
                    }
                } else { //启用存货时，【是否存货】为【否】的记录，借方科目未设置时，不显示开关。
                    if ((module === 'cg' ? !row.acct10Id : !row.acct20Id)) {
                        row.needMemory = 0
                        row.showSwitch = false
                    }
                }
            } else {//销项
                //存货档案和科目，其中一个未设置，不显示开关
                if (!row.stockId || (module === 'cg' ? !row.acct10Id : !row.acct20Id)) {
                    row.needMemory = 0
                    row.showSwitch = false
                }
            }

        } else {
            //未启用存货时，借方科目未设置时，不显示开关
            if ((module === 'cg' ? !row.acct10Id : !row.acct20Id)) {
                row.needMemory = 0
                row.showSwitch = false
            }
        }
        //借方科目带有【存货档案】之外的辅助核算时，不显示开关
        if (Array.isArray(json) && json.some(s => s.type.toLowerCase().indexOf('inventory') === -1)) {
            row.needMemory = 0
            row.showSwitch = false
        }
    }
    //初始化数据
    initLoanSwitchState(row) {
        const { isStock, module } = this.props
        let assis = row[module === 'cg' ? 'acct20CiName' : 'acct10CiName']
        let json = assis ? JSON.parse(assis).assistList : null
        row.needMemory = 1
        row.showSwitch = true
        //科目未设置，不显示开关
        if ((module === 'cg' ? !row.acct20Id : !row.acct10Id)) {
            row.needMemory = 0
            row.showSwitch = false
        }
        //科目已设置，但带有2个或2个以上的辅助核算，不显示开关
        if (Array.isArray(json) && json.length > 1) {
            row.needMemory = 0
            row.showSwitch = false
        }
    }

    onCancel = async e => {
        let { creditSetupList, debitSetupList } = this.state
        let modifed = false
        //判断数据是否被修改
        modifed = []
            .concat(creditSetupList)
            .concat(debitSetupList)
            .some(s => s.isModify)
        if (!modifed) {
            e && e.preventDefault && e.preventDefault()
            this.props.nsqjChange && this.props.nsqjChange()
            this.props.closeModal && this.props.closeModal('save')
            return
        }

        const confirm = await this.props.metaAction.modal("confirm", {
            content: `数据已经修改，请先确认后再关闭`,
            width: 340,
            okText: "确认并关闭",
            cancelText: "直接关闭"
        })
        if (confirm) {
            this.onOk("close")
            return false
        } else {
            e && e.preventDefault && e.preventDefault()
            this.props.nsqjChange && this.props.nsqjChange()
            this.props.closeModal && this.props.closeModal('save')
        }
        // return true
    }
    checkForm(item) {
        // const module = this.module
        const { isStock, module } = this.props
        if (!item) {
            return false
        }
        // console.log('checkForm:', item)
        if (module === "cg") {
            // 进项，贷方科目不能为空；acct20Id：贷方，acct10Id：借方
            // if (item.acct20Id === undefined || item.acct20Id < 0) {
            //     return false
            // }
            // 进项，借方科目、
            if (item.detailList.some(s => s.acct10Id === undefined || s.acct10Id < 0)) {
                return false
            }
            // 存货档案不能为空
            if (
                isStock == 1 &&
                item.detailList.some(
                    ss => ss.isStock == 1 && !(typeof ss.stockId === "number" || ss.stockId > 0)
                )
            ) {
                return false
            }
        }
        if (module === "xs") {
            // 销项，借方科目不能为空
            // if (item.acct10Id === undefined || item.acct10Id < 0) {
            //     return false
            // }
            // 销项，借方科目、
            if (item.detailList.some(s => s.acct20Id === undefined || s.acct20Id < 0)) {
                return false
            }
            // 存货档案不能为空
            if (
                isStock == 1 &&
                item.detailList.some(
                    ss => ss.isStock == 1 && !(typeof ss.stockId === "number" || ss.stockId > 0)
                )
            ) {
                return false
            }
        }
        return true
    }
    onOk = async type => {
        let { creditSetupList, debitSetupList } = this.state
        let { module, yearPeriod, isStock } = this.props
        let defaultData = {
            billIdList: null,
            billIdArray: null,
            acct10Id: null,
            acct10CiName: null,
            turnOnNeedMemoryFlagOnly: null,
            multipleAcct10Id: null,
            matchSource: null,
            needMemory: null,
            acctMultiMatchDtoList: null,
            isStock: null,
            stockId: null,
            multipleStockId: null,
            stockMatchSource: null,
            stockMultiMatchDtoList: null,
            acct20Id: null,
            acct20CiName: null,
            multipleAcct20Id: null,
            acctMatchSource: null,
        }

        let data = {}

        //删除对象
        data.creditSetupList = creditSetupList.map(e => {
            //判断是不是仅仅把记住结果开关打开了，而没有做科目等的修改
            if (!e.isModifyAcct && e.needMemory) {
                e.turnOnNeedMemoryFlagOnly = 1
            }
            e = Object.assign({}, defaultData, e)

            if (isArray(e.acctMultiMatchDtoList) && e.acctMultiMatchDtoList.length) {
                e.acctMultiMatchDtoList = e.acctMultiMatchDtoList.map(de => {
                    if (e.acct10Id) {
                        de.acct10Id = e.acct10Id
                        de.acct10Code = e.acct10Code
                        de.acct10Name = e.acct10Name
                        de.acct10CiName = e.acct10CiName
                    } else {
                        de.acct10Id = null
                        de.acct10Code = null
                        de.acct10Name = null
                        de.acct10CiName = null
                    }
                    if (e.acct20Id) {
                        de.acct20Id = e.acct20Id
                        de.acct20Code = e.acct20Code
                        de.acct20Name = e.acct20Name
                        de.acct20CiName = e.acct20CiName
                    } else {
                        de.acct20Id = null
                        de.acct20Code = null
                        de.acct20Name = null
                        de.acct20CiName = null
                    }
                    if (e.stockId) {
                        de.stockId = e.stockId
                    } else {
                        de.stockId = null
                    }
                    if (!isNaN(e.acctMatchSource)) {
                        de.acctMatchSource = e.acctMatchSource
                    } else {
                        de.acctMatchSource = null
                    }
                    if (!isNaN(e.stockMatchSource)) {
                        de.stockMatchSource = e.stockMatchSource
                    } else {
                        de.stockMatchSource = null
                    }
                    if (!isNaN(e.matchSource)) {
                        de.matchSource = e.matchSource
                    } else {
                        de.matchSource = null
                    }
                    de.isStock = e.isStock

                    return Object.assign({}, defaultData, de)
                })
            } else {
                e.acctMultiMatchDtoList = [defaultData]
            }

            if (isArray(e.stockMultiMatchDtoList) && e.stockMultiMatchDtoList.length) {
                e.stockMultiMatchDtoList = e.stockMultiMatchDtoList.map(de => {
                    if (e.acct10Id) {
                        de.acct10Id = e.acct10Id
                        de.acct10Code = e.acct10Code
                        de.acct10Name = e.acct10Name
                        de.acct10CiName = e.acct10CiName
                    } else {
                        de.acct10Id = null
                        de.acct10Code = null
                        de.acct10Name = null
                        de.acct10CiName = null
                    }
                    if (e.acct20Id) {
                        de.acct20Id = e.acct20Id
                        de.acct20Code = e.acct20Code
                        de.acct20Name = e.acct20Name
                        de.acct20CiName = e.acct20CiName
                    } else {
                        de.acct20Id = null
                        de.acct20Code = null
                        de.acct20Name = null
                        de.acct20CiName = null
                    }
                    if (e.stockId) {
                        de.stockId = e.stockId
                    } else {
                        de.stockId = null
                    }
                    if (!isNaN(e.acctMatchSource)) {
                        de.acctMatchSource = e.acctMatchSource
                    } else {
                        de.acctMatchSource = null
                    }
                    if (!isNaN(e.stockMatchSource)) {
                        de.stockMatchSource = e.stockMatchSource
                    } else {
                        de.stockMatchSource = null
                    }
                    if (!isNaN(e.matchSource)) {
                        de.matchSource = e.matchSource
                    } else {
                        de.matchSource = null
                    }
                    de.isStock = e.isStock

                    return Object.assign({}, defaultData, de)
                })
            } else {
                e.stockMultiMatchDtoList = [defaultData]
            }


            delete e.showSwitch
            return e
        })

        data.debitSetupList = debitSetupList.map(e => {
            //判断是不是仅仅把记住结果开关打开了，而没有做科目等的修改
            if (!e.isModifyAcct && e.needMemory) {
                e.turnOnNeedMemoryFlagOnly = 1
            }
            e = Object.assign({}, defaultData, e)
            if (isArray(e.acctMultiMatchDtoList) && e.acctMultiMatchDtoList.length) {
                e.acctMultiMatchDtoList = e.acctMultiMatchDtoList.map(de => {
                    if (e.acct10Id) {
                        de.acct10Id = e.acct10Id
                        de.acct10Code = e.acct10Code
                        de.acct10Name = e.acct10Name
                        de.acct10CiName = e.acct10CiName
                    } else {
                        de.acct10Id = null
                        de.acct10Code = null
                        de.acct10Name = null
                        de.acct10CiName = null
                    }
                    if (e.acct20Id) {
                        de.acct20Id = e.acct20Id
                        de.acct20Code = e.acct20Code
                        de.acct20Name = e.acct20Name
                        de.acct20CiName = e.acct20CiName
                    } else {
                        de.acct20Id = null
                        de.acct20Code = null
                        de.acct20Name = null
                        de.acct20CiName = null
                    }
                    if (e.stockId) {
                        de.stockId = e.stockId
                    } else {
                        de.stockId = null
                    }
                    if (!isNaN(e.acctMatchSource)) {
                        de.acctMatchSource = e.acctMatchSource
                    } else {
                        de.acctMatchSource = null
                    }
                    if (!isNaN(e.stockMatchSource)) {
                        de.stockMatchSource = e.stockMatchSource
                    } else {
                        de.stockMatchSource = null
                    }
                    if (!isNaN(e.matchSource)) {
                        de.matchSource = e.matchSource
                    } else {
                        de.matchSource = null
                    }
                    de.isStock = e.isStock

                    return Object.assign({}, defaultData, de)
                })

            } else {
                e.acctMultiMatchDtoList = [defaultData]
            }

            if (isArray(e.stockMultiMatchDtoList) && e.stockMultiMatchDtoList.length) {
                e.stockMultiMatchDtoList = e.stockMultiMatchDtoList.map(de => {
                    if (e.acct10Id) {
                        de.acct10Id = e.acct10Id
                        de.acct10Code = e.acct10Code
                        de.acct10Name = e.acct10Name
                        de.acct10CiName = e.acct10CiName
                    } else {
                        de.acct10Id = null
                        de.acct10Code = null
                        de.acct10Name = null
                        de.acct10CiName = null
                    }
                    if (e.acct20Id) {
                        de.acct20Id = e.acct20Id
                        de.acct20Code = e.acct20Code
                        de.acct20Name = e.acct20Name
                        de.acct20CiName = e.acct20CiName
                    } else {
                        de.acct20Id = null
                        de.acct20Code = null
                        de.acct20Name = null
                        de.acct20CiName = null
                    }
                    if (e.stockId) {
                        de.stockId = e.stockId
                    } else {
                        de.stockId = null
                    }
                    if (!isNaN(e.acctMatchSource)) {
                        de.acctMatchSource = e.acctMatchSource
                    } else {
                        de.acctMatchSource = null
                    }
                    if (!isNaN(e.stockMatchSource)) {
                        de.stockMatchSource = e.stockMatchSource
                    } else {
                        de.stockMatchSource = null
                    }
                    if (!isNaN(e.matchSource)) {
                        de.matchSource = e.matchSource
                    } else {
                        de.matchSource = null
                    }
                    de.isStock = e.isStock

                    return Object.assign({}, defaultData, de)

                })
            } else {
                e.stockMultiMatchDtoList = [defaultData]
            }

            delete e.showSwitch
            return e
        })
        // let detailList = module == 'cg' ? data.debitSetupList : data.creditSetupList, selectStock = false
        // selectStock = detailList.some(el => el.isStock == 1)
        // if (!this.checkForm({ detailList })) {
        //     let name = module == 'cg' ? '借方' : '贷方'
        //     const errorMsg = selectStock && isStock == 1 ? `${name}科目、存货档案不能为空` : `${name}科目不能为空`
        //     this.metaAction.toast("error", errorMsg)
        //     return false
        // }

        //只取改变的数据提交
        let modifedData = {}
        modifedData.creditSetupList = data.creditSetupList.filter(e => e.isModify || e.turnOnNeedMemoryFlagOnly)
        modifedData.debitSetupList = data.debitSetupList.filter(e => e.isModify || e.turnOnNeedMemoryFlagOnly)

        //如果是未设置数据 直接提示成功 不调用接口
        if (
            !modifedData.creditSetupList.length &&
            !modifedData.debitSetupList.length
        ) {
            if (type === "close") {
                this.props.metaAction.toast("success", "数据保存成功")
                this.props.nsqjChange && this.props.nsqjChange()
                this.props.closeModal && this.props.closeModal("save")
                return
            } else {
                return this.props.metaAction.toast("success", "数据保存成功")
            }
        }

        let res = ""
        let params = {
            updateType: 3,
            yearPeriod: yearPeriod,
            inventoryEnableState: isStock ? 1 : 0,
            ...modifedData
        }
        // console.log('modifedData', modifedData)
        if (this.props.module == "cg") {
            res = await this.props.webapi.bovms.batchUpdatePurchaseBillInfo(params)
        } else {
            res = await this.props.webapi.bovms.batchUpdateSaleBillInfo(params)
        }

        if (res === null) {
            this.props.metaAction.toast("success", "数据保存成功")
            if (type === "close") {
                this.props.nsqjChange && this.props.nsqjChange()
                this.props.closeModal && this.props.closeModal("save")
            } else {
                //如果不关闭弹窗 ， 将所有数据isModify置为false
                this.setState({
                    creditSetupList: creditSetupList.map(e => {
                        e.isModify = false
                        return e
                    }),
                    debitSetupList: debitSetupList.map(e => {
                        e.isModify = false
                        return e
                    })
                })
            }
        }
    }


    visibleChange(type, visible) {
        if (visible) {
            let dom = document.querySelector(`.${type}-count-content-num`)
            let popDom = document.querySelector(
                `.${type}-count-content-popover .ant-popover-inner-content`
            )
            popDom.innerHTML = `${dom.innerHTML}条记录未完成设置`
        }
    }
    handleSave(key, data) {
        this.setState({
            [key]: data
        })
    }
    handleChangeLoading(value) {
        this.setState({
            loading: value
        })
    }
    render() {
        const isStock = this.props.metaAction.gf("data.tableData.isStock")
        let {
            debitSetupList,
            creditSetupList,
            loading,
            kjxhs,
            test,
            settingData
        } = this.state
        return (
            <Spin spinning={loading}>
                <div>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        {/* {this.props.module === 'xs' && <img src={stepImg}></img>} */}
                    </div>
                    <Tabs
                        defaultActiveKey="1"
                        className="bovms-app-popup-content no-top-padding"
                    >
                        <TabPane
                            tab={
                                <div>
                                    借方科目
                                <Popover
                                        className="jfkm-count-content"
                                        onVisibleChange={this.visibleChange.bind(
                                            this,
                                            "jfkm"
                                        )}
                                        overlayClassName="jfkm-count-content-popover"
                                        content={"0条记录未完成设置"}
                                    >
                                        <span className="count-content-num jfkm-count-content-num">
                                            0
                                    </span>
                                    </Popover>
                                </div>
                            }
                            key="1"
                        >

                            {this.props.module == "cg" ? (
                                <Debit
                                    {...this.props}
                                    data={debitSetupList}
                                    selectType="jfkm"
                                    settingData={settingData}
                                    onInit={this.initData.bind(this)}
                                    changeLoading={this.handleChangeLoading.bind(this)}
                                    onSave={this.handleSave.bind(this)}
                                ></Debit>
                            ) : (
                                    <Loan
                                        {...this.props}
                                        data={debitSetupList}
                                        selectType="jfkm"
                                        settingData={settingData}
                                        onInit={this.initData.bind(this)}
                                        changeLoading={this.handleChangeLoading.bind(this)}
                                        onSave={this.handleSave.bind(this)}
                                    ></Loan>
                                )}
                        </TabPane>
                        <TabPane
                            tab={
                                <div>
                                    贷方科目
                                <Popover
                                        className="dfkm-count-content"
                                        onVisibleChange={this.visibleChange.bind(
                                            this,
                                            "dfkm"
                                        )}
                                        overlayClassName="dfkm-count-content-popover"
                                        content={"0条记录未完成设置"}
                                    >
                                        <span className="count-content-num dfkm-count-content-num">
                                            0
                                    </span>
                                    </Popover>
                                </div>
                            }
                            key="2"
                            forceRender={true}
                        >
                            {this.props.module == "cg" ? (
                                <Loan
                                    {...this.props}
                                    data={creditSetupList}
                                    selectType="dfkm"
                                    settingData={settingData}
                                    onInit={this.initData.bind(this)}
                                    changeLoading={this.handleChangeLoading.bind(this)}
                                    onSave={this.handleSave.bind(this)}
                                ></Loan>
                            ) : (
                                    <Debit
                                        {...this.props}
                                        data={creditSetupList}
                                        selectType="dfkm"
                                        onInit={this.initData.bind(this)}
                                        settingData={settingData}
                                        changeLoading={this.handleChangeLoading.bind(this)}
                                        onSave={this.handleSave.bind(this)}
                                    ></Debit>
                                )}
                        </TabPane>
                    </Tabs>
                    <div className="bovms-app-actions-footer">
                        <div class="bovms-app-actions-footer-tip">
                            <span>温馨提示：</span>批量设置单据的借方科目和贷方科目
                    </div>
                        <div>
                            <Button
                                type="primary"
                                onClick={this.onOk.bind(this, "close")}
                            >
                                确认并关闭
                        </Button>
                            <Button type="primary" onClick={this.onOk}>
                                确认
                        </Button>
                            <Button onClick={this.onCancel}> 关闭 </Button>
                        </div>
                    </div>
                </div>
            </Spin>
        )
    }
}

export default BatchSubjectSetting
