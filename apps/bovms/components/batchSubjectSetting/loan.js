import React from "react"
import { Button, Input, Row, Col, Pagination, DataGrid } from "edf-component"
import { Select, Icon, Spin, Switch } from "antd"
import SelectSubject from "../selectSubject/index"
import SetSameSubject from "../setSameSubject"
import BatchAddAidSubject from "../batchAddAidSubject"
import BatchAddSubject from "../batchAddSubject"
import SelectAssist from "../selectAssist"
import renderDataGridCol from "../column/index"
import moment from "moment"
import EditableCell from "./editableCell"
import MatchOptions from './matchOptions' 
import AutoMatchSetting from '../autoMatchSetting'

class Loan extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
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
            multiKey: props.selectType === 'jfkm' ? 'multipleAcct10Id' : 'multipleAcct20Id',
            assistKey:
                props.selectType == "jfkm" ? "acct10CiName" : "acct20CiName",
            title: props.selectType == "jfkm" ? "借方科目" : "贷方科目",
            keyword: "",
            spinning: false,
            isSetting: null,
            columnSwitchValue: true
        }
        this.acctFiled = props.selectType == "jfkm" ? "1" : "2"
        this.webapi = props.webapi
        this.metaAction = props.metaAction
    }

    componentWillReceiveProps(props) {
        if (props.data.length) {
            //初始化数据
            this.initData(props.data)
        } else {
            return false
        }
    }

    initData(propsData) {
        const { page, pageSize } = this.state
        let start = (page - 1) * pageSize
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
                e["custName"].includes(keyword)
            )
            this.setState({
                page: 1,
                resultData: newArr,
                tableData: newArr.slice(0, this.state.pageSize),
                total: newArr.length
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
    async autoMatch() {
        const { module, yearPeriod, isStock, selectType } = this.props
        const { selectedRowKeys, sourceData, dataKey } = this.state
        let optionRes = await this.metaAction.modal("show", {
            title: `自动匹配${selectType === 'jfkm' ? '借方科目' : '贷方科目'}`,
            style: { top: 25 },
            width: 460,
            children: selectedRowKeys.length ? <MatchOptions /> : <MatchOptions defaultValue={2} />
        })
        if (optionRes) {

            let idKey = 'billIdList'
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
                billIdList: ids
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
                        if (!dItem[`${acct}Id`]) {
                            item[`${acct}Id`] = undefined
                            item[`${acct}Code`] = undefined
                            item[`${acct}Name`] = undefined
                            item[`${acct}CiName`] = undefined
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
    async handleMenuClick(key) {
        switch (key) {
            case "autoMatch":
                this.autoMatch()
                break
            case "setSameSubject":
                this.openSetSameSubject()
                break
            case "batchSetAidProject":
                this.addBatchSetAidProject()
                break
            case "batchSetSubject":
                this.openBatchSetSubject()
                break
            case "autoMatchSetting":
                this.autoMatchSetting()
                break
        }
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
    async openSetSameSubject() {
        let {
            selectedRowKeys,
            sourceData,
            dataKey,
            idKey,
            codeKey,
            nameKey,
            assistKey
        } = this.state
        if (!selectedRowKeys.length) {
            return this.props.metaAction.toast("error", "请选择需要操作的数据")
        }
        let res = await this.props.metaAction.modal("show", {
            title: "批量设置",
            width: 400,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-set-same-subject",
            children: (
                <SetSameSubject
                    webapi={this.props.webapi}
                    metaAction={this.props.metaAction}
                    module={this.props.module}
                    subjectType={this.props.selectType}
                    isStock={this.props.isStock}
                />
            )
        })
        if (res) {
            selectedRowKeys.forEach(e => {
                let dItem = sourceData.find(f => f.uuId === e)
                dItem[idKey] = res.id
                dItem[codeKey] = res.code
                dItem[nameKey] = res.gradeName
                dItem[assistKey] =
                    res.assistList && res.assistList.length
                        ? JSON.stringify({ assistList: res.assistList })
                        : ""
                dItem.isModify = true
                dItem.acctMatchSource = 0
                dItem.isModifyAcct = true
                dItem.matchSource = 0
                dItem[`multipleAcct${this.acctFiled}0Id`] = 0
                this.changeSwitchState(dItem)
            })

            this.props.onSave(dataKey, sourceData)
            this.props.metaAction.toast("success", "设置成功")
        }
    }
    async addBatchSetAidProject() {
        let {
            selectedRowKeys,
            sourceData,
            dataKey,
            idKey,
            codeKey,
            nameKey,
            assistKey
        } = this.state
        //取数据

        if (!selectedRowKeys.length) {
            return this.props.metaAction.toast("error", "请选择需要操作的数据")
        }

        let propData = selectedRowKeys.map(e => {
            let dItem = sourceData.find(f => f.uuId === e)
            return dItem.custName
        })

        let res = await this.props.metaAction.modal("show", {
            title: "批量新增辅助项目",
            width: 600,
            okText: "确定",
            style: { top: 25 },
            wrapClassName: "bovms-batch-add-aid-subject",
            footer: false,
            children: (
                <BatchAddAidSubject
                    webapi={this.props.webapi}
                    metaAction={this.props.metaAction}
                    module={this.props.module}
                    subjectType={this.props.selectType}
                    subjectItems={propData}
                />
            )
        })

        if (res) {
            selectedRowKeys.forEach((e, i) => {
                let dItem = sourceData.find(f => f.uuId === e)
                if (res.aidSubject[i]) {
                    dItem[idKey] = res.subject.id
                    dItem[codeKey] = res.subject.code
                    dItem[nameKey] = res.subject.gradeName
                    dItem[assistKey] = `{"assistList":[{"id":"${
                        res.aidSubject[i].id
                        }","name":"${res.aidSubject[i].name}","type":"${
                        res.code
                        }"}]}`
                    dItem.acctMatchSource = 0
                    dItem.isModify = true
                    dItem.isModifyAcct = true
                    dItem.matchSource = 0
                    dItem[`multipleAcct${this.acctFiled}0Id`] = 0
                    this.changeSwitchState(dItem)
                }
            })
            this.setState({
                selectedRowKeys: []
            })
            this.props.onSave(dataKey, sourceData)
        }
    }

    async openBatchSetSubject() {
        let {
            selectedRowKeys,
            sourceData,
            dataKey,
            idKey,
            codeKey,
            nameKey,
            assistKey
        } = this.state

        if (!selectedRowKeys.length) {
            return this.props.metaAction.toast("error", "请选择需要操作的数据")
        }

        let propData = selectedRowKeys.map(e => {
            let dItem = sourceData.find(f => f.uuId === e)
            let _SubjectItem = dItem[
                this.props.module == "cg"
                    ? this.props.selectType == "jfkm"
                        ? "goodsName"
                        : "custName"
                    : this.props.selectType == "jfkm"
                        ? "custName"
                        : "goodsName"
            ]

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
                />
            )
        })
        if (res) {
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
                    dItem.matchSource = 0
                    dItem[`multipleAcct${this.acctFiled}0Id`] = 0
                    this.changeSwitchState(dItem)
                }
            })

            this.props.onSave(dataKey, sourceData)
        }
    }

    onChangeSelectedRowKeys(keys) {
        this.setState({
            selectedRowKeys: keys
        })
    }
    // 输入框
    inputOnChange = val => {
        this.setState({
            keyword: val.target.value
        })
    }

    dataFilter(data) {
        const { isSetting, idKey, nameKey, multiKey } = this.state
        const { settingData, module } = this.props
        let arr = [].concat(data)
        if (isSetting) {
            if (module === 'cg' ?
                settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
                settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
                switch (isSetting) {
                    case '1':
                        arr = data.filter(e => {
                            if (!e[idKey]) {
                                return e
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
                    arr = data.filter(e => {
                        if (e[idKey]) {
                            return e
                        }
                    })
                } else {
                    arr = data.filter(e => {
                        if (!e[idKey]) {
                            return e
                        }
                    })
                }
            }
        }
        return arr
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

            let newArr = filterData.filter(e => e.custName.includes(keyword))
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
                selectedRowKeys: [],
                page: 1
            },
            () => {
                this.onPressEnter(1)
            }
        )
    }

    async handleSelectClick(key, data, selectedRowKeys) {
        switch (key) {
            case "selectPage":
                selectedRowKeys = data.map(m => m.uuId)
                this.setState({ selectedRowKeys })
                return
            case "selectAll":
                let { resultData } = this.state
                this.setState({
                    selectedRowKeys: resultData.map(e => e.uuId)
                })
                return
            case "cancelSelect":
                this.setState({
                    selectedRowKeys: []
                })
                return
        }
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
    onCellChange(row) {
        row.isModify = true
        let { module, settingData } = this.props
        let { sourceData, dataKey } = this.state
        const rowIndex = sourceData.findIndex(
            f => f.uuId === row.uuId
        );
        const rowItem = sourceData[rowIndex];
        //判断按钮是否显示
        if (module === 'cg' ? settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' : settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
            this.changeSwitchState(row)
        }
        sourceData.splice(rowIndex, 1, { ...rowItem, ...row });
        this.props.onSave(dataKey, sourceData)
    }

    changeSwitchState(row) {
        const { isStock, module } = this.props
        const { assistKey } = this.state
        
        let assis = row[assistKey]
        let json = assis ? JSON.parse(assis).assistList : null
        row.needMemory = 1
        row.showSwitch = true
        //科目未设置不显示开关
        if (module === 'cg' ? !row.acct20Id : !row.acct10Id) {
            row.needMemory = 0
            row.showSwitch = false
        }
        //科目已设置，但带有2个或2个以上的辅助核算不显示开关
        if (Array.isArray(json) && json.length > 1) {
            row.needMemory = 0
            row.showSwitch = false
        }

    }
    onCellSwitchChange(row, e) {
        let { sourceData, dataKey } = this.state
        const rowIndex = sourceData.findIndex(
            f => f.uuId === row.uuId
        );
        const rowItem = sourceData[rowIndex];

        rowItem.needMemory = e ? 1 : 0
        if (sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {
            this.setState({ columnSwitchValue: true })
        } else if (sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 0)) {
            this.setState({ columnSwitchValue: false })
        }
        this.props.onSave(dataKey, sourceData)
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
                isResizable: false,
                noShowDetailList: true
            }
        const { selectType, module, metaAction, store, webapi, isStock, settingData } = this.props
        let columns = [
            {
                width: 60,
                dataIndex: "uuId",
                columnType: "allcheck",
                onMenuClick: e =>
                    this.handleSelectClick(e.key, tableData, selectedRowKeys),
                onSelectChange: keys => this.setState({ selectedRowKeys: keys })
            },
            {
                width: 60,
                title: '序号',
                dataIndex: "xh",
                key: "xh",
                render: (text, record, index) => {
                    return (index + 1) + ((page - 1) * pageSize)
                }
            },
            {
                flexGrow: 1,
                title: module == "cg" ? "销方名称" : "购方名称",
                dataIndex: "custName",
                key: "custName",
                textAlign: "left"
            },
            {
                title: title,
                dataIndex: idKey,
                key: idKey,
                textAlign: "left",
                flexGrow: 1,
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
                        />
                    )
                }
            }
        ]

        let switchClassName = ''
        //判断总开关是否显示半开状态
        if (sourceData && sourceData.filter(f => f.showSwitch).every(e => e.needMemory === 1)) {

        } else if (sourceData && sourceData.filter(f => f.showSwitch).every(e => e.needMemory != 1)) {

        } else {
            switchClassName = 'bovms-app-auto-match-setting-switch-style ant-switch-checked'
        }

        if (module === 'cg' ?
            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') {
            columns.push({
                title: "匹配来源",
                dataIndex: "matchSource",
                width: 100,
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
            settingData.account20MatchDto && settingData.account20MatchDto.useAndSaveMemoryData === '1' :
            settingData.account10MatchDto && settingData.account10MatchDto.useAndSaveMemoryData === '1') {
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
    getCount(type) {
        let { sourceData, idKey, nameKey } = this.state
        let { module } = this.props
        let count = 0
        if (type == "matched") {
            sourceData.forEach(e => {
                if (e[idKey]) {
                    count++
                }
            })
            return count
        }

        if (type == "unMatched") {
            sourceData.forEach(e => {
                if (!e[idKey]) {
                    count++
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
                if (!e[idKey]) {
                    count++
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
            tableData,
            page,
            pageSize,
            sourceData,
            resultData,
            selectedRowKeys
        } = this.state
        const { module, loading, spinning, settingData } = this.props

        return (
            <div className="bovms-batch-subject-setting-debit">
                <Row className="bovms-common-actions-header">
                    <Col span={12}>
                        <Input
                            placeholder={
                                module == "cg"
                                    ? "请输入销方名称"
                                    : "请输入购方名称"
                            }
                            style={{
                                width: "230px",
                                transform: "translateY(-1px)"
                            }}
                            value={keyword}
                            onChange={this.inputOnChange.bind(this)}
                            onPressEnter={this.onPressEnter.bind(this, 1)}
                            prefix={<Icon type="search" />}
                        />
                        {settingData && (module === 'cg' ?
                            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
                            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') ?
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
                                "setSameSubject"
                            )}
                        >
                            批量设置
                            </Button>
                        {settingData && (module === 'cg' ?
                            settingData.account20MatchDto && settingData.account20MatchDto.systemAutoMatchAccountAndStock === '1' :
                            settingData.account10MatchDto && settingData.account10MatchDto.systemAutoMatchAccountAndStock === '1') &&
                            <Button type="primary" onClick={this.handleMenuClick.bind(this, "autoMatch")}>自动匹配</Button>}
                        <Button
                            onClick={this.handleMenuClick.bind(
                                this,
                                "batchSetSubject"
                            )}
                        >
                            批增会计科目
                            </Button>
                        <Button
                            onClick={this.handleMenuClick.bind(
                                this,
                                "batchSetAidProject"
                            )}
                        >
                            批增辅助项目
                            </Button>
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
                    ellipsis
                />

                <div className="bovms-common-table-style-footer">
                    <div>
                        已选择
                            <strong>{selectedRowKeys.length}</strong>条
                        </div>
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        onChange={this.onPageChange.bind(this)}
                        pageSizeOptions={["50", "100", "200", "300"]}
                        onShowSizeChange={this.onSizeChange.bind(this)}
                        style={{ textAlign: "right" }}
                        total={resultData.length}
                        showTotal={total => `共${total}条记录`}
                    />
                </div>
            </div>
        )
    }
}

export default Loan
