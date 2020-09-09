import React from "react"
import {
    Button,
    Input,
    Row,
    Col,
    Pagination,
    DataGrid,
    TableSort,
    Tooltip
} from "edf-component"
import { Form, Select, Popover, Icon, Switch } from "antd"
import SelectSubject from "../selectSubject/index"
import BatchAddSubject from "../batchAddSubject"
import { subjectIncludeAssist, quantityFormat } from "../../utils/index"
import SelectStock from "../selectStock"
import { isNumber, isBoolean } from "util"
import SelectAssist from "../selectAssist"
import BatchSetting from "../batchSetting"
import renderDataGridCol from "../column/index"
import EditableCell from "./editableCell"
import AutoMatchSetting from '../autoMatchSetting'
import MatchOptions from './matchOptions'
import { isArray } from "core-js/fn/array"
const { Option } = Select

class PopoverFilter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props.params
        }
    }

    onOk = e => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                Object.keys(values).forEach(key => {
                    if (values.key === "null") {
                        values[key] = null
                    }
                })
                this.handleSearch(values)
            }
        })
    }

    handleSearch(values) {
        const { onFilter } = this.props
        setTimeout(() => {
            onFilter(values)
            this.props.close && this.props.close()
        }, 100)
    }

    reset = () => {
        const { form } = this.props
        if (form) {
            form.resetFields()
            const values = form.getFieldsValue()
            this.handleSearch(values)
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form
        let { isRowStock } = this.state
        const formItemLayout = {
            labelCol: {
                xs: { span: 6 }
            },
            wrapperCol: {
                xs: { span: 18 }
            }
        }
        return (
            <Form className="ttk-filter-form-popover-content">
                <Form.Item label="是否存货:" {...formItemLayout}>
                    {getFieldDecorator("isRowStock", {
                        initialValue: isRowStock
                    })(
                        <Select style={{ width: "100%" }}>
                            <Select.Option key="null" value={null}>
                                全部
                            </Select.Option>
                            <Select.Option key="1" value="1">
                                是
                            </Select.Option>
                            <Select.Option key="0" value="0">
                                否
                            </Select.Option>
                        </Select>
                    )}
                </Form.Item>

                <div className="footer">
                    <Button type="primary" onClick={this.onOk}>
                        查询
                    </Button>
                    <Button onClick={this.reset}>重置</Button>
                </div>
            </Form>
        )
    }
}
const PopoverFilterForm = Form.create({
    name: "bovms_batch_subject_setting_popover_filter_form"
})(PopoverFilter)

class Debit extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            selectedRowKeys: [],
            pageSize: 50,
            page: 1,
            sourceData: [], //源数据
            resultData: [], //搜索结果
            tableData: [], //表格数据
            dataKey: props.selectType == "jfkm" ? 'debitSetupList' : 'creditSetupList',
            idKey: props.selectType == "jfkm" ? "acct10Id" : "acct20Id",
            codeKey: props.selectType == "jfkm" ? "acct10Code" : "acct20Code",
            nameKey: props.selectType == "jfkm" ? "acct10Name" : "acct20Name",
            assistKey: props.selectType == "jfkm" ? "acct10CiName" : "acct20CiName",
            multiKey: props.selectType === 'jfkm' ? 'multipleAcct10Id' : 'multipleAcct20Id',
            title: props.selectType == "jfkm" ? "借方科目" : "贷方科目",
            purchaseBatchsetupRule: 0, //进项维度
            saleBatchsetupRule: 0, //销项维度
            popVisible: false,
            keyword: "",
            isSetting: null,
            columnSwitchValue: true,
            filterParams: {
                isRowStock: null
            }
        }
        this.acctFiled = props.selectType == "jfkm" ? "1" : "2"
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }

    componentWillReceiveProps(props) {
        const { settingData, data } = props
        if (settingData.businessAccountingDto && data.length) {
            //初始化数据
            this.initData(props.data)
        } else {
            return false
        }
    }

    changeSwitchState(row) {
        const { isStock, module } = this.props
        const { assistKey } = this.state
        let assis = row[assistKey]
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
                } else {//启用存货时，【是否存货】为【否】的记录，借方科目未设置时，不显示开关。
                    if (module === 'cg' ? !row.acct10Id : !row.acct20Id) {
                        row.needMemory = 0
                        row.showSwitch = false
                    }
                }
            } else {//销项
                //存货档案和科目，其中有一个未设置，不显示开关
                if (!row.stockId || (module === 'cg' ? !row.acct10Id : !row.acct20Id)) {
                    row.needMemory = 0
                    row.showSwitch = false
                }
            }
        } else {
            //未启用存货时，借方科目未设置时，不显示开关
            if (module === 'cg' ? !row.acct10Id : !row.acct20Id) {
                row.needMemory = 0
                row.showSwitch = false
            }
        }
        //细中借方科目带有【存货档案】之外的辅助核算时，显示了‘记住结果’开关；
        if (Array.isArray(json) && json.some(s => s.type.toLowerCase().indexOf('inventory') === -1)) {
            row.needMemory = 0
            row.showSwitch = false
        }
    }

    initData(propsData) {
        const { page, pageSize, sort } = this.state
        let start = (page - 1) * pageSize
        if (sort === "asc") {
            propsData.sort((a, b) => a.goodsName.localeCompare(b.goodsName))
        } else {
            propsData.sort((a, b) => b.goodsName.localeCompare(a.goodsName))
        }
        this.setState(
            {
                sourceData: propsData,
                resultData: propsData,
                tableData: propsData.slice(start, start + pageSize)
            },
            () => {
                this.onPressEnter(page)
            }
        )
    }
    //搜索
    onSearch(val) {
        let keyword = val.trim()
        if (keyword == "") {
            this.setState({
                resultData: this.props.data,
                tableData: this.props.data.slice(0, this.state.pageSize)
            })
        } else {
            let newArr = this.state.sourceData.filter(e =>
                e.goodsName.includes(keyword)
            )
            this.setState({
                page: 1,
                resultData: newArr,
                tableData: newArr.slice(0, this.state.pageSize)
            })
        }
    }
    //分页
    onPageChange(page) {
        this.setState({
            page: page,
            tableData: this.state.resultData.slice(
                (page - 1) * this.state.pageSize,
                page * this.state.pageSize
            )
        })
    }
    //每页显示条数
    onSizeChange(current, size) {
        this.setState(
            {
                pageSize: size,
                page: 1
            },
            () => {
                this.setState({
                    tableData: this.state.resultData.slice(
                        (this.state.page - 1) * this.state.pageSize,
                        this.state.page * this.state.pageSize
                    )
                })
            }
        )
    }
    //全选
    onSelectChange = val => {
        this.setState({
            selectedRowKeys: val
        })
    }
    //存货
    selectHandleChange(e) { }

    handleSearch(values) {
        const { sourceData } = this.state
        if (!sourceData.length) {
            return
        }
        this.setState(
            {
                filterParams: values
            },
            () => {
                this.onPressEnter(1)
            }
        )
    }
    hide = () => {
        this.setState({
            popVisible: false
        })
    }

    handlePopChange = visible => {
        this.setState({
            popVisible: visible
        })
    }

    // 输入框
    inputOnChange = val => {
        this.setState({
            keyword: val.target.value
        })
    }

    dataFilter(data) {
        const { isSetting, idKey, nameKey } = this.state
        const { settingData, module, isStock } = this.props
        const { isRowStock } = this.state.filterParams
        let arr = [].concat(data)

        if (isRowStock) {
            arr = arr.filter(f => f.isStock === isRowStock)
        }
        if (isSetting) {
            //【进项】且【借方自动匹配开启】；【销项】且【贷方自动匹配开启】
            if (module === 'cg' ?
                settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') {
                switch (isSetting) {
                    case '1':
                        arr = arr.filter(e => {
                            //进项
                            if (module === 'cg') {
                                //【是否存货】
                                if (e.isStock == "1") {
                                    //未设置科目或未设置存货
                                    if (!e[idKey] || !e["stockId"]) {
                                        return e
                                    }
                                } else {
                                    //未设置科目
                                    if (!e[idKey]) {
                                        return e
                                    }
                                }
                            } else {//销项
                                //未设置科目或未设置存货
                                if (e.isStock == "1") {
                                    if (!e[idKey] || !e["stockId"]) {
                                        return e
                                    }
                                } else {
                                    //未设置科目
                                    if (!e[idKey]) {
                                        return e
                                    }
                                }
                            }
                        })
                        break
                    case '2':
                        arr = arr.filter(e => e.matchSource === 0)
                        break
                    case '3':
                        arr = arr.filter(e => e.matchSource === 3)
                        break
                    case '4':
                        arr = arr.filter(e => e.matchSource === 1)
                        break
                    case '5':
                        arr = arr.filter(e => e.matchSource === 2)
                        break
                }
            } else {
                if (isSetting === "1") {
                    arr = arr.filter(e => {
                        //【是否存货】
                        if (e.isStock == "1") {
                            //已设置科目且已设置存货
                            if (e[idKey] && e["stockId"]) {
                                return e
                            }
                        } else {
                            //已设置科目
                            if (e[idKey]) {
                                return e
                            }
                        }
                    })
                } else {
                    arr = arr.filter(e => {
                        //进项
                        if (module === 'cg') {
                            //是否启用存货
                            if (e.isStock == "1") {
                                //未设置科目或未设置存货
                                if (!e[idKey] || !e["stockId"]) {
                                    return e
                                }
                            } else {
                                //未设置科目
                                if (!e[idKey]) {
                                    return e
                                }
                            }
                        } else {//销项
                            //未设置科目或未设置存货
                            if (e.isStock == "1") {
                                if (!e[idKey] || !e["stockId"]) {
                                    return e
                                }
                            } else {
                                //未设置科目
                                if (!e[idKey]) {
                                    return e
                                }
                            }
                        }
                    })
                }
            }
        }
        return arr
    }

    onPressEnter = page => {
        const { keyword, sourceData, pageSize } = this.state
        const { data } = this.props
        let start = (page - 1) * pageSize
        if (keyword == "") {
            //根据过滤条件 过滤一遍数据
            let filterData = this.dataFilter(data)
            this.setState({
                resultData: filterData,
                tableData: filterData.slice(start, start + pageSize),
                selectedRowKeys: []
            })
        } else {
            //根据过滤条件 过滤一遍数据
            let filterData = this.dataFilter(data)

            let newArr = filterData.filter(e => e.goodsName.includes(keyword))
            this.setState({
                page: 1,
                resultData: newArr,
                tableData: newArr.slice(start, start + pageSize),
                selectedRowKeys: []
            })
        }
    }

    onSelect(val) {
        this.setState(
            {
                isSetting: val,
                selectedRowKeys: []
            },
            () => {
                this.onPressEnter(1)
            }
        )
    }

    async handleMenuClick(key) {
        switch (key) {
            case "autoMatch":
                this.autoMatch()
                break
            case "batchSetting":
                this.openBatchSetting()
                break
            case "autoMatchSetting":
                this.autoMatchSetting()
                break
            case "setDimansion":
                this.openSetDimansion()
                break
            case "batchSetSubject":
                this.openBatchSetSubject()
                break
            case "batchAddArchives":
                this.openBatchAddArchives()
                break

            default:
                break
        }
    }
    async openBatchSetSubject() {
        const {
            selectedRowKeys,
            sourceData,
            dataKey,
            idKey,
            codeKey,
            nameKey,
            assistKey
        } = this.state
        const { settingData } = this.props
        let { groupByRule } = settingData.businessAccountingDto.accountingDto

        if (!selectedRowKeys.length) {
            return this.props.metaAction.toast("error", "请选择需要操作的数据")
        }

        let propData = selectedRowKeys.map(e => {
            let dItem = sourceData.find(f => f.uuId === e)
            let _SubjectItem =
                dItem[
                this.props.module == "cg"
                    ? this.props.selectType == "jfkm"
                        ? "goodsName"
                        : "custName"
                    : this.props.selectType == "jfkm"
                        ? "custName"
                        : "goodsName"
                ]
            if ((groupByRule === '2' || groupByRule === '3' || groupByRule === '4') && dItem["specification"]) {
                _SubjectItem += `-${dItem["specification"]}`
            }
            return {
                name: _SubjectItem,
                unit: dItem.unitName || ''
            }
        })
        let res = await this.props.metaAction.modal("show", {
            title: "批增科目",
            width: 700,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-set-same-subject",
            footer: false,
            children: (
                <BatchAddSubject
                    webapi={this.props.webapi}
                    metaAction={this.props.metaAction}
                    module={this.props.module}
                    store={this.props.store}
                    subjectType={this.props.selectType}
                    subjectItems={propData}
                    isStock={this.props.isStock ? 1 : 0}
                />
            )
        })
        selectedRowKeys.forEach((e, i) => {
            let dItem = sourceData.find(f => f.uuId === e)
            if (res[i]) {
                dItem[idKey] = res[i].id
                dItem[codeKey] = res[i].code
                dItem[nameKey] = res[i].gradeName
                dItem[assistKey] = res[i].assistList
                    ? JSON.stringify({ assistList: res[i].assistList })
                    : ""
                dItem.acctMatchSource = 0
                dItem.isModify = true
                dItem.isModifyAcct = true
                dItem[`multipleAcct${this.acctFiled}0Id`] = 0
                if (this.props.module == "cg" && this.props.isStock) {
                    dItem.stockId = null
                    dItem.stockName = null
                    dItem.isStock = "0"
                    dItem.stockMatchSource = 0
                    dItem.multipleStockId = 0
                    dItem.propertyName = null
                }
                dItem.matchSource = 0
                this.changeSwitchState(dItem)
            }
        })
        this.props.onSave(dataKey, sourceData)
    }
    isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]"
    }
    getArchivesByBatchRule(selectedRowKeys, dataSource, groupByRule, populatePriceToStockName) {
        let archives = []
        selectedRowKeys.forEach(s => {
            let dItem = dataSource.find(f => f.uuId == s)
            archives.push({
                key: String(s),
                name: dItem.goodsName,
                specification: dItem.specification,
                invoiceUnit: dItem.unitName,
                unitPrice: dItem.unitPrice
            })
        })
        archives.map(item => {
            // item.key = [...new Set(item.key.split(','))].join();
            // item.invoiceUnit = item.invoiceUnit && [...new Set(item.invoiceUnit.split(','))].join();
            // 根据匹配设置处理档案内容

            if (groupByRule === "1") {
                item.specification = ""
            }
            if (groupByRule === "4" && populatePriceToStockName === '1') {
                item.name = `${item.name}${(typeof item.unitPrice ===
                    "number" &&
                    "-") ||
                    ""}${(typeof item.unitPrice === "number" &&
                        `单价${item.unitPrice}`) ||
                    ""}`
            }
            delete item.unitPrice
        })
        return archives
    }
    openBatchAddArchives = async () => {
        const {
            sourceData,
            purchaseBatchsetupRule,
            saleBatchsetupRule,
            selectedRowKeys,
            dataKey
        } = this.state
        const { webapi, metaAction, store, module, isStock, settingData } = this.props
        if (selectedRowKeys.length) {
            const { groupByRule, populatePriceToStockName } = settingData.businessAccountingDto.accountingDto,
                archives = this.getArchivesByBatchRule(
                    selectedRowKeys,
                    sourceData,
                    groupByRule,
                    populatePriceToStockName
                )
            //isStock，会计月份，是否启用存货
            //archives，已选待新增的科目名称数组,如：［'购方名称1','购方名称2'］
            const ret = await metaAction.modal("show", {
                title: "批量新增存货档案",
                width: 1200,
                style: { top: 25 },
                children: metaAction.loadApp("ttk-app-inventoryAdd-card", {
                    store: store,
                    module: module,
                    details: archives
                })
            })

            // metaAction.toast('success',`成功新增了${ret.length}条存货档案`)
            if (Array.isArray(ret)) {

                this.props.metaAction.toast(
                    "success",
                    `成功新增了 ${ret.length} 条存货档案`
                )
                // 查找存货档案所带科目
                const subjectIds = ret.map(m => m.inventoryRelatedAccountId)
                if (subjectIds) {
                    const subjectList = await this.props.webapi.bovms.getAccountCodeByIds(
                        { ids: [...new Set(subjectIds)] }
                    )
                    // 如果只有存货核算项目的，则添加，否则科目置空
                    if (Array.isArray(subjectList)) {
                        subjectList.forEach(sbItem => {
                            let calcList = subjectIncludeAssist(sbItem, true)
                            ret.forEach(re => {
                                if (
                                    re &&
                                    re.inventoryRelatedAccountId == sbItem.id
                                ) {
                                    re.inventoryRelatedAccountCode = sbItem.code
                                    re.inventoryRelatedAccountName =
                                        sbItem.gradeName
                                    // 场景1：选择的存货档案的存货科目不为空，且存货科目不带有辅助核算
                                    if (calcList.length === 0) {
                                        re.assistList = null
                                    }
                                    // 场景2：选择的存货档案的存货科目不为空，存货科目带有且仅带有【存货档案】辅助核算
                                    if (
                                        calcList.length === 1 &&
                                        calcList[0] === "inventory"
                                    ) {
                                        re.isCalcInventory = true
                                        re.assistList = [
                                            {
                                                id: re.id,
                                                name: re.name,
                                                type: "calcInventory"
                                            }
                                        ]
                                    }
                                }
                            })
                        })
                    }
                }

                selectedRowKeys.forEach(key => {
                    const dtItem = sourceData.find(f => f.uuId == key)
                    if (dtItem) {
                        const item = ret.find(
                            ff =>
                                ff.key &&
                                String(ff.key)
                                    .split(",")
                                    .includes(String(key))
                        )
                        item && this.setArchivesAndSubjectValue(dtItem, item)
                    }
                })
                this.props.onSave(dataKey, sourceData)
            }
        } else {
            this.props.metaAction.toast("error", "请选择需要操作的数据")
            return false
        }
    }
    // 设置档案和进项的借方科目
    setArchivesAndSubjectValue(item, ret) {
        const isObject =
            Object.prototype.toString.call(ret) === "[object Object]"
        const json = isObject
            ? JSON.stringify({ assistList: ret.assistList })
            : ""
        item.stockId = isObject ? ret.id : null
        item.propertyName = isObject ? ret.propertyName : null
        item.stockName = isObject
            ? `${ret.code && ret.code}-${ret.name}${
            ret.specification ? "-" : ""
            }${ret.specification || ""}`
            : null
        item.isStock = isObject ? "1" : item.isStock
        item.isModify = true
        item.isModifyAcct = true
        item.stockMatchSource = 0
        item.multipleStockId = 0
        // 在进项，如果档案的科目有辅助核算，则将其设为借方科目，否则，将借方科目置空
        if (this.props.module === "cg" && isObject) {
            item.acct10Id = ret.inventoryRelatedAccountId
            item.acct10Code = ret.inventoryRelatedAccountCode
            item.acct10Name = ret.inventoryRelatedAccountName
            item.acct10CiName = ret.assistList ? json : null
            item.acctMatchSource = 0
            item[`multipleAcct${this.acctFiled}0Id`] = 0
        }
        item.matchSource = 0
        this.changeSwitchState(item)

    }
    async openBatchSetting() {
        let {
            selectedRowKeys,
            sourceData,
            dataKey
        } = this.state
        const {
            webapi,
            metaAction,
            store,
            module,
            isStock,
            selectType
        } = this.props
        if (selectedRowKeys.length <= 0) {
            metaAction.toast("error", "请选择需要操作的数据")
            return
        }
        const ret = await metaAction.modal("show", {
            title: "批量设置",
            style: { top: 25 },
            width: 400,
            children: (
                <BatchSetting
                    metaAction={metaAction}
                    store={store}
                    webapi={webapi}
                    module={module}
                    isStockMonth={isStock ? "1" : "0"}
                    subjectType={selectType}
                />
            )
        })
        if (ret) {
            sourceData.forEach(item => {
                if (
                    item &&
                    selectedRowKeys &&
                    selectedRowKeys.findIndex(f => f == item.uuId) > -1
                ) {
                    this.setRowsFormBatchSetting(item, ret)
                }
            })
            this.props.onSave(dataKey, sourceData)
            // this.setState({ sourceData })
        }
    }

    setRowsFormBatchSetting(target, ret) {
        const { module } = this.props;
        const isObject = this.isObject(ret),
            stock = (isObject && this.isObject(ret.stock) && ret.stock) || {},
            kjkm = (isObject && this.isObject(ret.kjkm) && ret.kjkm) || {},
            acct = this.props.selectType == "jfkm" ? "acct10" : "acct20"
        //销项逻辑不变
        if (module === "cg") {
            //是否存货为是
            if (ret.isStock === '1') {
                //未选中勾选框【存货档案】时
                if (!ret.stockCheckboxValue) {
                    //【是否存货】为【否】的记录，清空原【存货档案】和【借方科目】的值。
                    if (target.isStock === '0') {
                        target.isStock = ret.isStock
                        target.stockId = undefined
                        target.stockName = undefined
                        target.propertyName = undefined
                        target.multipleStockId = 0
                        target[`multipleAcct${this.acctFiled}0Id`] = 0
                        target[`${acct}Id`] = undefined
                        target[`${acct}Code`] = undefined
                        target[`${acct}Name`] = undefined
                        target[`${acct}CiName`] = undefined
                        target.acctMatchSource = 0
                        target.stockMatchSource = 0
                        target.matchSource = 0
                        target.isModifyAcct = true
                        target.isModify = true
                    }
                } else { //批量设置前【是否存货】为【是】的记录，保持其原【存货档案】和【借方科目】不变
                    target.isStock = ret.isStock
                    target.stockId = isObject && stock.id
                    target.stockName =
                        isObject &&
                        stock.id &&
                        `${stock.code && stock.code}-${stock.name}${
                        stock.specification ? "-" : ""
                        }${stock.specification || ""}`
                    target.propertyName = isObject && stock.propertyName
                    target.multipleStockId = 0
                    target[`multipleAcct${this.acctFiled}0Id`] = 0
                    target[`${acct}Id`] = kjkm.id
                    target[`${acct}Code`] = kjkm.code
                    target[`${acct}Name`] = kjkm.name
                    target[`${acct}CiName`] = kjkm.assistJSON || null
                    target.isModifyAcct = true
                    target.acctMatchSource = 0
                    target.stockMatchSource = 0
                    target.matchSource = 0
                    target.isModify = true
                }
            } else {//是否存货为否
                //未选中时【借方科目】时
                if (!ret.subjectCheckboxValue) {
                    //批量设置前【是否存货】为【否】的记录，保持其原【借方科目】不变。
                    if (target.isStock === '1') {
                        target.isStock = ret.isStock
                        target.stockId = undefined
                        target.stockName = undefined
                        target.propertyName = undefined
                        target.multipleStockId = 0
                        target[`multipleAcct${this.acctFiled}0Id`] = 0
                        target[`${acct}Id`] = undefined
                        target[`${acct}Code`] = undefined
                        target[`${acct}Name`] = undefined
                        target[`${acct}CiName`] = undefined
                        target.isModifyAcct = true
                        target.stockMatchSource = 0
                        target.acctMatchSource = 0
                        target.matchSource = 0
                        target.isModify = true
                    }
                } else {//【是否存货】为【是】的记录，清空原【存货档案】和【借方科目】的值。
                    target.isStock = ret.isStock
                    target.stockId = isObject && stock.id
                    target.propertyName = isObject && stock.propertyName
                    target.stockName =
                        isObject &&
                        stock.id &&
                        `${stock.code && stock.code}-${stock.name}${
                        stock.specification ? "-" : ""
                        }${stock.specification || ""}`
                    target.multipleStockId = 0
                    target[`multipleAcct${this.acctFiled}0Id`] = 0
                    target[`${acct}Id`] = kjkm.id
                    target[`${acct}Code`] = kjkm.code
                    target[`${acct}Name`] = kjkm.name
                    target[`${acct}CiName`] = kjkm.assistJSON || null
                    target.acctMatchSource = 0
                    target.stockMatchSource = 0
                    target.matchSource = 0
                    target.isModifyAcct = true
                    target.isModify = true


                }
            }
        } else {
            if (ret.isStock) {
                target.isStock = ret.isStock
                target.stockId = isObject && stock.id
                target.propertyName = isObject && stock.propertyName
                target.stockName =
                    isObject &&
                    stock.id &&
                    `${stock.code && stock.code}-${stock.name}${
                    stock.specification ? "-" : ""
                    }${stock.specification || ""}`
                target.stockMatchSource = 0
                target.multipleStockId = 0
            }
            if (ret.kjkm && kjkm.id) {
                target[`${acct}Id`] = kjkm.id
                target[`${acct}Code`] = kjkm.code
                target[`${acct}Name`] = kjkm.name
                target[`${acct}CiName`] = kjkm.assistJSON || undefined
                target.isModifyAcct = true
                target[`multipleAcct${this.acctFiled}0Id`] = 0
                target.acctMatchSource = 0
            }
            target.isModify = true
        }
        this.changeSwitchState(target)
    }
    async autoMatch() {
        const { module, yearPeriod, isStock, selectType } = this.props
        let { selectedRowKeys, sourceData, dataKey } = this.state
        let optionRes = await this.metaAction.modal("show", {
            title: `自动匹配${selectType === 'jfkm' ? '借方科目' : '贷方科目'}`,
            style: { top: 25 },
            width: 460,
            children: selectedRowKeys.length ? <MatchOptions /> : <MatchOptions defaultValue={2} />
        })
        if (optionRes) {
            let idKey = 'billIdArray'
            let ids = []
            if (optionRes === 2) {
                sourceData.forEach(e => {
                    ids = ids.concat(selectType === 'jfkm' ? e[idKey] : e[idKey])
                })
            } else if (optionRes === 1) {
                selectedRowKeys.forEach(e => {
                    let dItem = sourceData.find(f => f.uuId === e)
                    ids = ids.concat(selectType === 'jfkm' ? dItem[idKey] : dItem[idKey])
                })
            } else {
                sourceData.forEach(e => {
                    if (e.matchSource != 0) {
                        ids = ids.concat(selectType === 'jfkm' ? e[idKey] : e[idKey])
                    }
                })
                if (!ids.length) {
                    return this.metaAction.toast('error', '无需要匹配的数据')
                }
            }
            let params = {
                yearPeriod: yearPeriod,                    // 会计期间，格式：yyyymm，如：201909（必传）
                inventoryEnableState: isStock ? 1 : 0,          // 存货启用状态，1：启用；0：没有启用（必传）
                autoMatchType: selectType === 'jfkm' ? 2 : 3,                       // 自动科目匹配类型，1：单张发票匹配；2：批量设置科目，借方匹配；3：批量设置科目，贷方匹配（必传）
                billIdArray: ids
            }
            this.props.changeLoading(true)
            let res = await this.props.webapi.bovms[module === 'cg' ? 'purchaseAutoMatchAccount' : 'saleAutoMatchAccount'](params)
            if (res) {
                let acct = selectType == "jfkm" ? "acct10" : "acct20";
                sourceData.forEach(item => {
                    let dItem = (res.creditSetupList || res.debitSetupList).find(f => f[idKey].toString() === item[idKey].toString())
                    if (dItem) {
                        item.isModify = true
                        item.isModifyAcct = true
                        if (!dItem.matchSource) {
                            item.matchSource = null
                        }
                        if (!dItem.stockId) {
                            item.stockId = null
                            item.stockName = null
                            item.propertyName = null
                        }
                        if (!dItem[`${acct}Id`]) {
                            item[`${acct}Id`] = null
                            item[`${acct}Code`] = null
                            item[`${acct}Name`] = null
                            item[`${acct}CiName`] = null
                        }
                        Object.keys(dItem).forEach(keys => {
                            item[keys] = dItem[keys]
                        })
                        this.changeSwitchState(item)
                    }
                })

                if (sourceData.filter(f => f.showSwitch).every(e => e.needMemory)) {
                    this.setState({
                        columnSwitchValue: true
                    })
                }
                this.props.onSave(dataKey, sourceData)
                this.props.changeLoading(false)
                this.props.metaAction.toast('success', '自动匹配完毕')
            }
            this.setState({
                selectedRowKeys: []
            })
        }
    }

    handleSelectClick(key, data, selectedRowKeys) {
        switch (key) {
            case "selectPage":
                selectedRowKeys = data.map(e => e.uuId)
                this.setState({ selectedRowKeys })
                return
            case "selectAll":
                let { resultData } = this.state
                selectedRowKeys = resultData.map(e => e.uuId)
                this.setState({
                    selectedRowKeys
                })
                return
            case "cancelSelect":
                this.setState({
                    selectedRowKeys: []
                })
                return
        }
    }
    sortChange(e) {
        let { sourceData, tableData } = this.state
        this.setState({
            sort: e
        },()=>{
            this.initData(sourceData)
        })
    }
    onCellChange(row) {
        row.isModify = true
        let { module, settingData } = this.props
        let { sourceData, dataKey } = this.state
        const rowIndex = sourceData.findIndex(
            f => f.uuId === row.uuId
        );
        const rowItem = sourceData[rowIndex];
        //判断按钮是否显示
        if (module === 'cg' ? settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' : settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') {
            this.changeSwitchState(row)
        }
        sourceData.splice(rowIndex, 1, { ...rowItem, ...row });
        this.props.onSave(dataKey, sourceData)
    }
    onCellSwitchChange(row, e) {
        let { sourceData, dataKey } = this.state
        const rowIndex = sourceData.findIndex(
            f => f.uuId === row.uuId
        );
        const rowItem = sourceData[rowIndex];

        rowItem.needMemory = e ? 1 : 0
        //全部开关打开，总开关打开，全部开关关闭,总开关关闭
        if (sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {
            this.setState({ columnSwitchValue: true })
        } else if (sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 0)) {
            this.setState({ columnSwitchValue: false })
        }
        this.props.onSave(dataKey, sourceData)
    }
    onColumnSwitchChange(e) {
        let { sourceData, dataKey } = this.state
        sourceData.forEach(item => {
            if (item.showSwitch) {
                item.needMemory = e ? 1 : 0
            }
        })
        this.setState({
            columnSwitchValue: e
        }, () => {
            this.props.onSave(dataKey, sourceData)
        })
    }
    async autoMatchSetting() {
        const { module, yearPeriod, isStock } = this.props
        let res = await this.metaAction.modal("show", {
            title: "核算精度和自动匹配设置",
            style: { top: 25 },
            width: 960,
            footer: null,
            children: (
                <AutoMatchSetting
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    yearPeriod={yearPeriod}
                    module={module === 'cg' ? 2 : 1}
                    inventoryEnableState={isStock ? 1 : 0}
                />
            )
        })
        if (res) {
            this.props.onInit()
        }

    }
    rounding(val) {
        if (!val) return ''
        let [a, b] = val.split(".")
        return b && Number(b)
            ? `${a}.${((Math.round(Number(`0.${b}`) * 100) / 100) + '').slice(2)}`
            : a
    }
    getColumns() {
        let {
            selectedRowKeys,
            dataKey,
            idKey,
            codeKey,
            nameKey,
            assistKey,
            title,
            tableData,
            sort,
            page,
            pageSize,
            columnSwitchValue,
            sourceData
        } = this.state,
            dataSource = tableData,
            colOption = {
                dataSource,
                selectedRowKeys,
                width: 100,
                fixed: false,
                align: "center",
                className: "",
                flexGrow: 0,
                lineHeight: 37,
                isResizable: true,
                noShowDetailList: true
            }
        let { selectType, module, metaAction, store, webapi, isStock, settingData } = this.props
        let { groupByRule, displayPrice, populatePriceToStockName } = settingData.businessAccountingDto ? settingData.businessAccountingDto.accountingDto : { groupByRule: '1', displayPrice: '0', populatePriceToStockName: '0' }


        let columns = [
            {
                width: 60,
                isResizable: false,
                dataIndex: "uuId",
                columnType: "allcheck",
                onMenuClick: e =>
                    this.handleSelectClick(e.key, tableData, selectedRowKeys),
                onSelectChange: keys => this.setState({ selectedRowKeys: keys })
            },
            {
                width: 60,
                isResizable: false,
                title: '序号',
                dataIndex: "xh",
                key: "xh",
                render: (text, record, index) => {
                    return (index + 1) + ((page - 1) * pageSize)
                }
            },
            {
                flexGrow: 1,
                isResizable: true,
                title: (
                    <TableSort
                        title="商品或服务名称"
                        sortOrder={sort || null}
                        handleClick={e => this.sortChange(e)}
                    />
                ),
                dataIndex: "goodsName",
                key: "goodsName",
                textAlign: "left"
            }
        ]

        if (groupByRule === "2" || groupByRule === "3" || groupByRule === '4') {
            columns.push({
                title: "规格型号",
                dataIndex: "specification",
                key: "specification",
                width: 150,
                isResizable: true,
                textAlign: "left"
            })
        }
        if (groupByRule === "3" || groupByRule === '4') {
            columns.push({
                title: "单位",
                dataIndex: "unitName",
                key: "unitName",
                width: 60,
                isResizable: true,
                textAlign: "left"
            })
        }
        if ((groupByRule === "3" && displayPrice === '1')) {
            columns.push({
                title: "单价",
                dataIndex: "unitPriceList",
                key: "unitPriceList",
                width: 100,
                isResizable: true,
                textAlign: "right",
                render: (text, record, index) => {
                    if (isArray(text) && text[0] !== null) {
                        text = text.map(e => this.rounding(quantityFormat(e, 3, false, false, false)))
                        let dom = (
                            <div>
                                {text.map((e, i) => <div>{e}</div>)}
                            </div>
                        )

                        return (
                            <Popover placement="right" content={dom}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "100%",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {text.map((e, i) => {
                                        if (i === 0) {
                                            return e
                                        } else {
                                            return `、${e}`
                                        }
                                    })}
                                </span>
                            </Popover>
                        )

                    } else {
                        return ''
                    }
                }
            })
        }
        if (groupByRule === '4') {
            columns.push({
                title: "单价",
                dataIndex: "unitPrice",
                key: "unitPrice",
                width: 100,
                isResizable: true,
                textAlign: "right",
                render: text => this.rounding(quantityFormat(text, 3, false, false, false))
            })
        }

        if (this.props.isStock) {
            columns.push(
                {
                    title: "是否存货",
                    dataIndex: "isStock",
                    key: "isStock",
                    width: 80,
                    isResizable: true,
                    render: (text, record, index) => {
                        return (
                            <EditableCell
                                key={`EditableCell-isStock-${record.uuId}`}
                                value={text}
                                record={record}
                                dataIndex="isStock"
                                handleSave={row => this.onCellChange(row)}
                                webapi={webapi}
                                metaAction={metaAction}
                                store={store}
                                module={module}
                            ></EditableCell>
                        )
                    }
                }
            )
            if (settingData.businessAccountingDto && settingData.businessAccountingDto.inventoryDisplayDto.displayInventoryType === '1') {
                columns.push({
                    title: "存货类型",
                    dataIndex: "propertyName",
                    key: "propertyName",
                    width: 120,
                    isResizable: true,

                })
            }

            columns.push(
                {
                    title: "存货档案",
                    dataIndex: "stockId",
                    key: "stockId",
                    flexGrow: 1,
                    textAlign: "left",
                    isResizable: true,
                    render: (text, record, index) => {
                        return (
                            <EditableCell
                                key={`EditableCell-stockId-${record.uuId}`}
                                value={text}
                                record={record}
                                dataIndex="stockId"
                                handleSave={row => this.onCellChange(row)}
                                webapi={webapi}
                                metaAction={metaAction}
                                store={store}
                                module={module}
                                groupByRule={groupByRule}
                                populatePriceToStockName={populatePriceToStockName}
                            />
                        )
                    }
                },
                {
                    title: (
                        <div>
                            {title}&nbsp;&nbsp;
                            {module === "cg" && this.props.isStock && (
                                <Tooltip title="存货的借方科目由档案确定，非存货的借方科目可直接编辑。批增会计科目成功会将【是否存货】设置为【否】">
                                    <Icon
                                        type="question"
                                        className="bovms-help-icon"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    ),
                    dataIndex: idKey,
                    key: idKey,
                    textAlign: "left",
                    flexGrow: 1,
                    isResizable: true,
                    render: (text, record, index) => {
                        return (
                            <EditableCell
                                key={`EditableCell-${idKey}-${record.uuId}`}
                                value={text}
                                record={record}
                                dataIndex={idKey}
                                handleSave={row => this.onCellChange(row)}
                                webapi={webapi}
                                metaAction={metaAction}
                                store={store}
                                module={module}
                                selectType={selectType}
                                isStockMonth={isStock}
                                groupByRule={groupByRule}
                            />
                        )
                    }
                }
            )
        } else {
            columns.push({
                title: (
                    <div>
                        {title}&nbsp;&nbsp;
                        {module === "cg" && this.props.isStock && (
                            <Tooltip title="存货的借方科目由档案确定，非存货的借方科目可直接编辑。批增会计科目成功会将【是否存货】设置为【否】">
                                <Icon
                                    type="question"
                                    className="bovms-help-icon"
                                />
                            </Tooltip>
                        )}
                    </div>
                ),
                textAlign: "left",
                dataIndex: idKey,
                key: idKey,
                flexGrow: 1,
                isResizable: true,
                render: (text, record, index) => {
                    return (
                        <EditableCell
                            key={`EditableCell-${idKey}-${record.uuId}`}
                            value={text}
                            record={record}
                            dataIndex={idKey}
                            handleSave={row => this.onCellChange(row)}
                            webapi={webapi}
                            metaAction={metaAction}
                            store={store}
                            module={module}
                            selectType={selectType}
                            isStockMonth={isStock}
                            groupByRule={groupByRule}
                        />
                    )
                }
            })
        }

        let switchClassName = ''
        //判断总开关是否显示半开状态
        if (sourceData && sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {

        } else if (sourceData && sourceData.filter(f => f.showSwitch).every(e => e.needMemory != 1)) {

        } else {
            switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
        }

        if (module === 'cg' ?
            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') {
            columns.push({
                title: "匹配来源",
                dataIndex: "matchSource",
                width: 100,
                isResizable: true,
                textAlign: "center",
                render: (text, record, index) => {
                    let t = ''
                    if (text === 0) {
                        t = '手动匹配'
                    } else if (text === 3) {
                        t = '智能记忆'
                    } else if (text === 2) {
                        t = '精确查找'
                    } else if (text === 1) {
                        t = '模糊查找'
                    }
                    return t
                }
            })
        }
        if (module === 'cg' ?
            settingData.account10MatchDto && settingData.account10MatchDto.useAndSaveMemoryData === '1' :
            settingData.account20MatchDto && settingData.account20MatchDto.useAndSaveMemoryData === '1') {
            columns.push({
                title: (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', marginRight: '2px', marginTop: '1px' }}>
                        <span style={{ lineHeight: 'normal' }}>记住</span>
                        <span style={{ lineHeight: 'normal' }}>结果</span>
                    </div>
                    {sourceData.filter(f => f.showSwitch).length ?
                        <Switch checked={columnSwitchValue} className={switchClassName} onChange={this.onColumnSwitchChange.bind(this)}></Switch> :
                        <Switch checked={false}></Switch>
                    }

                </div>),
                dataIndex: "needMemory",
                width: 100,
                isResizable: false,
                textAlign: "center",
                render: (text, record, index) => {
                    return record.showSwitch ? (
                        <Switch checked={record.needMemory} onChange={this.onCellSwitchChange.bind(this, record)}></Switch>
                    ) : ''
                }
            })
        }


        columns = columns.map(m => renderDataGridCol({ ...colOption, ...m }))
        return columns
    }

    onRowClick = (e, index) => {
        let { selectedRowKeys, tableData } = this.state
        const columnKey = e && e.target && e.target.attributes["columnKey"]
        if (columnKey && columnKey.value) {
            let key = tableData[index]["uuId"]
            if (selectedRowKeys.includes(key)) {
                selectedRowKeys = selectedRowKeys.filter(f => f !== key)
            } else {
                selectedRowKeys.push(key)
            }
            this.setState({
                selectedRowKeys
            })
        }
    }
    getCount(type) {
        let { sourceData, idKey, nameKey } = this.state
        let { module, isStock } = this.props
        let count = 0
        if (type == "matched") {
            sourceData.forEach(e => {
                //是否存货
                if (e.isStock == "1") {
                    //设置科目并设置存货
                    if (e[idKey] && e["stockId"]) {
                        count++
                    }
                } else {
                    //设置科目
                    if (e[idKey]) {
                        count++
                    }
                }
            })
            return count
        }

        if (type == "unMatched") {
            sourceData.forEach(e => {
                //进项
                if (module === 'cg') {
                    //是否存货
                    if (e.isStock == "1") {
                        //未设置科目并且未设置存货
                        if (!e[idKey] && !e["stockId"]) {
                            count++
                        }
                    } else {
                        //未设置科目
                        if (!e[idKey]) {
                            count++
                        }
                    }
                } else {//销项
                    //是否存货
                    if (e.isStock == "1") {
                        //未设置科目或未设置存货档案
                        if (!e[idKey] || !e["stockId"]) {
                            count++
                        }
                    } else {
                        //未设置科目
                        if (!e[idKey]) {
                            count++
                        }
                    }

                }
            })

            let dom = document.querySelector(
                `.${this.props.selectType}-count-content-num`
            )
            if (dom) {
                if (count) {
                    dom.innerHTML = count > 99 ? "99+" : count
                    dom.style.display = "block"
                } else {
                    dom.style.display = "none"
                }
            }
            return count
        }
        let typeValue = {
            'sdsz': 0,
            'znjy': 3,
            'mhpp': 1,
            'jqpp': 2
        }[type]
        if (type === 'wsz') {
            sourceData.forEach(e => {
                //进项
                if (module === 'cg') {
                    //是否存货
                    if (e.isStock == "1") {
                        //未设置科目并且未设置存货
                        if (!e[idKey] && !e["stockId"]) {
                            count++
                        }
                    } else {
                        //未设置科目
                        if (!e[idKey]) {
                            count++
                        }
                    }
                } else {//销项
                    //是否存货
                    if (e.isStock == "1") {
                        //未设置科目或未设置存货档案
                        if (!e[idKey] || !e["stockId"]) {
                            count++
                        }
                    } else {
                        //未设置科目
                        if (!e[idKey]) {
                            count++
                        }
                    }
                }

            })
            let dom = document.querySelector(`.${this.props.selectType}-count-content-num`)
            if (dom) {
                if (count) {
                    dom.innerHTML = count > 99 ? "99+" : count
                    dom.style.display = "block"
                } else {
                    dom.style.display = "none"
                }
            }
        } else {
            count = sourceData.filter(r => r.matchSource === typeValue).length
        }


        return count
    }

    render() {
        const {
            keyword,
            isSetting,
            filterParams,
            tableData,
            resultData,
            sourceData,

        } = this.state
        const { module, loading, isStock, spinning, settingData } = this.props

        return (
            <div className="bovms-batch-subject-setting-debit">
                <Row className="bovms-common-actions-header">
                    <Col span={12} className="flex-start-center">
                        <Input.Group compact={!!this.props.isStock}>
                            <Input
                                placeholder="请输入商品或服务名称"
                                style={{ width: "230px" }}
                                value={keyword}
                                onChange={this.inputOnChange.bind(this)}
                                onPressEnter={this.onPressEnter.bind(this, 1)}
                                prefix={<Icon type="search" />}
                            />
                            {this.props.isStock && (
                                <Popover
                                    overlayClassName="ttk-filter-form-popover"
                                    content={
                                        <PopoverFilterForm
                                            wrappedComponentRef={form =>
                                                (this.form = form)
                                            }
                                            params={filterParams}
                                            onFilter={this.handleSearch.bind(
                                                this
                                            )}
                                            close={this.hide}
                                        />
                                    }
                                    placement="bottom"
                                    trigger="click"
                                    visible={this.state.popVisible}
                                    onVisibleChange={this.handlePopChange}
                                >
                                    <Button icon="filter" />
                                </Popover>
                            )}
                        </Input.Group>
                        {settingData && (module === 'cg' ?
                            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') ?
                            <Select
                                onChange={this.onSelect.bind(this)}
                                style={{ width: "120px" }}
                                value={isSetting}
                            >
                                <Select.Option key="null" value={null}>
                                    全部{` (${sourceData.length})`}
                                </Select.Option>
                                <Select.Option key="1" value="1">
                                    未设置{` (${this.getCount("wsz")})`}
                                </Select.Option>
                                <Select.Option key="2" value="2">
                                    手动设置{` (${this.getCount("sdsz")})`}
                                </Select.Option>
                                <Select.Option key="3" value="3">
                                    智能记忆{` (${this.getCount("znjy")})`}
                                </Select.Option>
                                <Select.Option key="4" value="4">
                                    模糊匹配{` (${this.getCount("mhpp")})`}
                                </Select.Option>
                                <Select.Option key="5" value="5">
                                    精确匹配{` (${this.getCount("jqpp")})`}
                                </Select.Option>
                            </Select> :
                            <Select
                                onChange={this.onSelect.bind(this)}
                                style={{ width: "120px" }}
                                value={isSetting}
                            >
                                <Select.Option key="null" value={null}>
                                    全部{` (${sourceData.length})`}
                                </Select.Option>
                                <Select.Option key="1" value="1">
                                    已设置{` (${this.getCount("matched")})`}
                                </Select.Option>
                                <Select.Option key="2" value="2">
                                    未设置{` (${this.getCount("unMatched")})`}
                                </Select.Option>
                            </Select>
                        }


                        {/* <Search placeholder="请输入商品或服务名称" onSearch={this.onSearch.bind(this)} style={{ width: 200 }} allowClear /> */}
                    </Col>
                    <Col
                        span={12}
                        className="bovms-batch-subject-setting-debit-right"
                        style={{ textAlign: "right" }}
                    >
                        <Button
                            type="primary"
                            onClick={this.handleMenuClick.bind(
                                this,
                                "batchSetting"
                            )}
                        >
                            批量设置
                            </Button>
                        {settingData && (module === 'cg' ?
                            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1' :
                            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1') &&
                            <Button type="primary" onClick={this.handleMenuClick.bind(this, "autoMatch")}>自动匹配</Button>}
                        <Button
                            onClick={this.handleMenuClick.bind(
                                this,
                                "batchSetSubject"
                            )}
                        >
                            批增会计科目
                            </Button>
                        {isStock ? (
                            <Button
                                onClick={this.handleMenuClick.bind(
                                    this,
                                    "batchAddArchives"
                                )}
                            >
                                批增存货档案
                            </Button>
                        ) : module == "cg" ? (
                            <Button
                                onClick={this.handleMenuClick.bind(
                                    this,
                                    "batchAddArchives"
                                )}
                            >
                                批增存货档案
                            </Button>
                        ) : (
                                    ""
                                )}
                        <Button
                            icon="setting"
                            onClick={this.handleMenuClick.bind(
                                this,
                                "autoMatchSetting"
                            )}
                        />
                    </Col>
                </Row>
                <DataGrid
                    loading={loading}
                    className="bovms-common-table-style"
                    headerHeight={37}
                    rowHeight={37}
                    footerHeight={0}
                    rowsCount={(tableData || []).length}
                    onRowClick={this.onRowClick.bind(this)}
                    rowClassNameGetter={() => "editable-row"}
                    columns={this.getColumns()}
                    style={{ width: "100%", height: "350px" }}
                    ellipsis allowResizeColumn
                />

                <div className="bovms-common-table-style-footer">
                    <div>
                        已选择
                            <strong>{this.state.selectedRowKeys.length}</strong>
                            条
                        </div>
                    <Pagination
                        current={this.state.page}
                        pageSize={this.state.pageSize}
                        onChange={this.onPageChange.bind(this)}
                        pageSizeOptions={["50", "100", "200", "300"]}
                        onShowSizeChange={this.onSizeChange.bind(this)}
                        style={{ textAlign: "right" }}
                        total={this.state.resultData.length}
                        showTotal={total => `共${total}条记录`}
                    />
                </div>
            </div>
        )
    }
}
export default Debit
