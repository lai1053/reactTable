import React from "react"
import {
    Select,
    Button,
    Dropdown,
    Menu,
    Tooltip,
    Pagination,
    Layout,
    DataGrid,
} from "edf-component"
import moment from "moment"
import { Spin, Icon } from "antd"
import { quantityFormat, addEvent, removeEvent } from "../../../bovms/utils/index"
import FilterForm from "./filterForm"
import TypeSetting from "./typeSetting"
import HabitSetting from "../../components/HabitSetting"
import AddStockOrrders from "./addStockOrders"
import renderDataGridCol from "../../../bovms/components/column/index"
import { formatNumbe } from "../utils"
import importModal, { onFileError } from "../../components/common/ImportModal"
import { formatSixDecimal } from "../../commonAssets/js/common"
import PrintButton from "../../components/common/PrintButton"
const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 18
    : /Edge\/(\S+)/.test(navigator.userAgent)
    ? 18
    : 12

export default class OtherStorageMainContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            type: 1000,
            selectedRowKeys: [],
            tableSource: [],
            pageSize: 50,
            currentPage: 1,
            params: {
                keyword: "",
                date: null,
                status: null,
            },
            getInvSetByPeroid: {},
            serviceType: 1000,
            serviceOpt: [],
            tableSize: {
                width: 2000,
                height:
                    (document.querySelector(`.${this.tableParentClass}`) || document.body)
                        .offsetHeight -
                        104 -
                        this.scrollHeight || 0,
            },
            notAutoAdjust: false, // 智能调整显示
        }
        this.tableParentClass = "ttk-stock-app-other-storage"
        this.period = ""
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.store = props.store
        this.component = props.component
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent) ? 20 : 12
        this.dataGridKey = `other-storage-datagrid-${new Date().valueOf()}`
        this.tableScrollWidth = 0
    }
    async componentDidMount() {
        addEvent(window, "resize", ::this.onResize)
        this.onResize()
        const { name, xdzOrgIsStop } = this.metaAction.context.get("currentOrg") || {}
        this.name = name
        const currentOrg = sessionStorage["stockPeriod" + this.name]
        this.period = currentOrg
        //获取存货设置信息
        const getInvSetByPeroid = await this.webapi.api.getInvSetByPeroid({ period: currentOrg })

        this.setState(
            {
                inveBusiness: getInvSetByPeroid.inveBusiness,
                getInvSetByPeroid,
                isCarryOverMainCost: getInvSetByPeroid.isCarryOverMainCost,
                isGenVoucher: getInvSetByPeroid.isGenVoucher,
                xdzOrgIsStop,
            },
            () => {
                this.initPage()
                this.getOtherBillServiceType()
            }
        )
    }
    componentWillUnmount() {
        removeEvent(window, "resize", this.onResize)
    }
    async initPage() {
        const { params, type, pageSize, currentPage, inveBusiness } = this.state
        this.setState({
            loading: true,
        })
        let obj = {
            serviceTypeId: type, //业务类型id,默认是全部传1000(必须)
            period: this.period, //当前月份(必须)
            inveBusiness, //1代表工业,0代表商业(必须)
            inventoryName: params.keyword, //存货名称或者单据编号
            vchStateCode: params.status, //凭证状态：未生成0、已生成1',默认全部
            page: {
                currentPage: currentPage, //页数(必须)
                pageSize: pageSize, //每页大小(必须)
            },
        }
        //选择了日期就传
        if (params.date && params.date.length) {
            obj.startPeriod = moment(params.date[0]).format("YYYY-MM-DD")
            obj.endPeriod = moment(params.date[1]).format("YYYY-MM-DD")
        }

        const res = await this.webapi.api.findOtherBillTitleList(obj)
        this.setState({
            loading: false,
            tableSource: res.list,
            selectedRowKeys: [],
            totalCount: res.totalFpNum,
            ...res,
        })
    }
    //-- dealTableSource = (list) => {
    //     const {defaultServiceType} = this.state
    //     return list.map(row => {
    //         if(row.accountId) {return row}
    //         // 无科目--导入的数据
    //         const type = defaultServiceType[row.serviceTypeId]
    //         if(type && type.acctId) { // 有默认
    //             row.defaultServiceType = type
    //             row.accountCode = type.acctCode
    //             row.accountId = type.acctId
    //             row.accountName = type.acctName
    //         }
    //         return row
    //     })
    // }
    //获取业务类型
    async getOtherBillServiceType() {
        const { inveBusiness, isCarryOverMainCost, isGenVoucher } = this.state
        let res = await this.webapi.api.getOtherBillServiceType({
            serviceTypeId: 1000,
            inveBusiness,
        })
        let serviceTypeCBTZ = res.find(el => el.code == "CBTZ")
        this.setState({
            serviceOpt: res,
            serviceTypeCBTZ,
            notAutoAdjust: !serviceTypeCBTZ || isCarryOverMainCost || isGenVoucher,
        })
    }
    renderFooter = () => {
        const { pageSize, currentPage, totalCount } = this.state
        return (
            <div className="bovms-app-purchase-list-footer">
                {this.renderFooterTotal()}
                <Pagination
                    pageSizeOptions={["50", "100", "200", "300"]}
                    pageSize={pageSize}
                    current={currentPage}
                    total={totalCount}
                    onChange={this.pageChanged}
                    onShowSizeChange={this.pageChanged}
                    showTotal={total => (
                        <span>
                            共<strong>{total}</strong>条记录
                        </span>
                    )}></Pagination>
            </div>
        )
    }
    renderFooterTotal = () => {
        const { totalFpNum, positiveAmount, negativeAmount, positiveNum, negativeNum } = this.state
        let content = (
            <div className="footer-total-content">
                <span>合计</span>
                <span>
                    数量：<strong>{positiveNum}</strong> &nbsp;
                    {negativeNum ? <strong>{negativeNum}</strong> : ""}
                </span>
                <span>
                    金额：
                    <strong>{quantityFormat(positiveAmount, 2, false, false)}</strong>(元) &nbsp;
                    {negativeAmount ? (
                        <strong>{`${quantityFormat(negativeAmount, 2, false, false)}(元)`}</strong>
                    ) : (
                        ""
                    )}
                </span>
            </div>
        )
        return (
            <Tooltip placement="topLeft" title={content} overlayClassName="bovms-app-footer-tool">
                <div className="footer-total">{content}</div>
            </Tooltip>
        )
    }

    pageChanged = (page, pageSize) => {
        this.setState(
            {
                currentPage: page || this.state.currentPage,
                pageSize: pageSize || this.state.pageSize,
            },
            () => {
                this.initPage()
            }
        )
    }
    onRow = record => {
        return {
            onClick: event => {
                const dom = document.querySelector(
                    `.${this.tableClass} .ant-table-body .virtual-grid-main-scrollbar`
                )
                if (dom) dom.style.opacity = 0
                const { selectedRowKeys, tableSource } = this.state
                const index = selectedRowKeys.findIndex(f => String(f) === String(record.kjxh))
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.kjxh)
                }
                this.setState({
                    selectedRowKeys,
                })
            }, // 点击行
        }
    }
    onSelectChange = arr => {
        this.setState({
            selectedRowKeys: arr,
        })
    }
    onResize(e) {
        setTimeout(() => {
            const table = document.getElementsByClassName(this.tableParentClass)[0]
            if (table) {
                let h = table.offsetHeight - 104 - this.scrollHeight, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth
                this.setState({ tableSize: { width: w, height: h } })
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    rowHeightGetter(index, row) {
        if (!row) {
            row = this.state.tableSource[index]
        }
        const detailList = (row && row.billBodyDtoList) || []
        return 37 * ((detailList.length > 5 ? 6 : detailList.length) + 1)
    }
    renderMultiLine = (field, align, lookMore, footer, precision, notClearZero) => (
        text,
        row,
        rowIndex
    ) => {
        if (!row) return null
        const detailList = (row && row.billBodyDtoList) || []
        const len = detailList.length
        let footerText = footer && typeof footer === "boolean" ? row["billBody" + field] : footer
        footerText =
            footer === true && precision
                ? notClearZero
                    ? formatNumbe(footerText, precision)
                    : formatSixDecimal(formatNumbe(footerText, precision))
                : footerText
        return (
            <React.Fragment>
                {detailList.slice(0, 5).map((item, i) => {
                    const text = precision
                        ? notClearZero
                            ? formatNumbe(item[field.toLowerCase()], precision)
                            : formatSixDecimal(formatNumbe(item[field.toLowerCase()], precision))
                        : item[field]
                    return (
                        <div
                            align={align}
                            key={i}
                            className="stock-table-cell-multil-row"
                            title={text}>
                            {precision ? text || null : text}
                        </div>
                    )
                })}

                {len > 5 && (
                    <div align={align} className="stock-table-cell-multil-row more">
                        {lookMore ? (
                            <a onClick={() => this.openInventory(row)}>查看更多...</a>
                        ) : null}
                    </div>
                )}
                <div align={align} className="stock-table-cell-multil-row" title={footerText}>
                    {footerText}
                </div>
            </React.Fragment>
        )
    }
    getColumns() {
        const { selectedRowKeys, tableSource, getInvSetByPeroid, xdzOrgIsStop } = this.state,
            dataSource = tableSource,
            colOption = {
                dataSource,
                selectedRowKeys,
                width: 100,
                fixed: false,
                align: "center",
                className: "",
                // flexGrow: 0,
                isResizable: true,
                detailListName: "mxDtoList",
            }

        let columns = [
            {
                width: 40,
                dataIndex: "id",
                fixed: "left",
                columnType: "check",
                onSelectChange: keys => {
                    this.setState({
                        selectedRowKeys: keys,
                    })
                },
            },
            {
                width: 130,
                title: "单据编号",
                dataIndex: "code",
                key: "code",
                fixed: "left",
                textAlign: "left",
                render: (text, record, index) => (
                    <div className="code-cell">
                        <a
                            className="codeText"
                            onClick={() => this.openInventory(record)}
                            style={{
                                width: `calc(100% - ${record.accountId ? 0 : 20}px)`,
                            }}>
                            {text}
                        </a>
                        {!record.accountId && (
                            <Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={"单据信息不全"}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    type="exclamation-circle"
                                    theme="filled"
                                    className="warning-tip"
                                />
                            </Tooltip>
                        )}
                    </div>
                ),
            },
            {
                title: "业务类型",
                dataIndex: "serviceTypeName",
                key: "serviceTypeName",
                minWidth: 80,
                width: 85,
                flexGrow: 1,
                textAlign: "left",
                render: (text, record, index) => (
                    <div title={text} className="ellipsis">
                        {text}
                    </div>
                ),
            },

            {
                title: "日期",
                dataIndex: "cdate",
                key: "cdate",
                minWidth: 100,
                width: 100,
                render: (text, record, index) => {
                    return <div className="text-center">{moment(text).format("YYYY-MM-DD")}</div>
                },
            },
            {
                title: "存货编号",
                dataIndex: "inventoryCode",
                key: "inventoryCode",
                minWidth: 100,
                width: 100,
                textAlign: "left",
                className: "no-padding",
                render: this.renderMultiLine("inventoryCode", "left", true, "合计"),
            },
            {
                title: "存货名称",
                dataIndex: "inventoryName",
                key: "inventoryName",
                minWidth: 120,
                width: 120,
                textAlign: "left",
                className: "no-padding",
                render: this.renderMultiLine("inventoryName", "left", false, ""),
            },
            {
                title: "规格型号",
                dataIndex: "inventoryGuiGe",
                key: "inventoryGuiGe",
                minWidth: 100,
                width: 100,
                textAlign: "left",
                className: "no-padding",
                render: this.renderMultiLine("inventoryGuiGe", "left", false, ""),
            },
            {
                title: "单位",
                dataIndex: "inventoryUnit",
                key: "inventoryUnit",
                minWidth: 60,
                width: 80,
                textAlign: "left",
                className: "no-padding",
                render: this.renderMultiLine("inventoryUnit", "left", false, ""),
            },
            {
                title: "数量",
                dataIndex: "billBodyNum",
                key: "billBodyNum",
                minWidth: 100,
                width: 100,
                textAlign: "left",
                className: "no-padding",
                render: this.renderMultiLine("Num", "left", false, true, 6),
            },
            {
                title: "单价",
                dataIndex: "billBodyPrice",
                key: "billBodyPrice",
                minWidth: 100,
                width: 100,
                textAlign: "right",
                className: "no-padding",
                render: this.renderMultiLine("price", "right", false, "", 6),
            },
            {
                title: "金额",
                dataIndex: "billBodyYbBalance",
                key: "billBodyYbBalance",
                minWidth: 100,
                width: 100,
                textAlign: "right",
                className: "no-padding",
                render: this.renderMultiLine("YbBalance", "right", false, true, 2, true),
            },
            {
                title: "凭证号",
                dataIndex: "voucherCodes",
                key: "voucherCodes",
                minWidth: 110,
                width: 110,
                render: (text, record, index) => (
                    <div className="bovms-cell-hover-show">
                        {record.isDelete ? (
                            <a
                                onClick={
                                    xdzOrgIsStop ? undefined : () => this.openVch(record.voucherIds)
                                }>
                                {text}
                            </a>
                        ) : (
                            ""
                        )}

                        {!xdzOrgIsStop && record.isDelete ? (
                            <Icon
                                type="close-circle"
                                className="del-icon"
                                onClick={() => this.delVch(record)}
                            />
                        ) : null}
                    </div>
                ),
            },
            {
                title: "操作",
                dataIndex: "opration",
                key: "opration",
                minWidth: 80,
                fixed: "right",
                width: 80,
                render: (text, row, index) => {
                    const cond = getInvSetByPeroid.isGenVoucher
                        ? true
                        : getInvSetByPeroid.isCarryOverMainCost
                        ? true
                        : false
                    return cond ? (
                        <div className="editable-row-operations">
                            <a
                                href="javascript:return false;"
                                style={{ opacity: 0.3, cursor: "not-allowed" }}>
                                删除
                            </a>
                        </div>
                    ) : (
                        <div className="editable-row-operations">
                            {row.isDelete ? (
                                <a
                                    href="javascript:return false;"
                                    style={{ opacity: 0.3, cursor: "not-allowed" }}>
                                    删除
                                </a>
                            ) : (
                                <a onClick={e => this.delSingle(row, e)}>删除</a>
                            )}
                        </div>
                    )
                },
            },
        ]
        if (xdzOrgIsStop) {
            columns = columns.filter(f => f.key !== "opration")
        }
        columns = columns.map(m =>
            renderDataGridCol({ ...colOption, ...m, rowHeightGetter: ::this.rowHeightGetter })
        )
        return columns
    }
    openVch = async vchId => {
        // vchId 凭证ID
        if (!vchId) {
            return
        }
        const { store } = this.props
        const ret = await this.metaAction.modal("show", {
            title: "查看凭证",
            style: { top: 5 },
            width: 1200,
            bodyStyle: { padding: "20px 30px" },
            className: "batchCopyDoc-modal",
            okText: "保存",
            children: this.metaAction.loadApp("app-proof-of-charge", {
                store: store,
                initData: {
                    type: "isFromXdz",
                    id: vchId,
                },
            }),
        })
    }
    async openInventory(row) {
        const { inveBusiness, getInvSetByPeroid, xdzOrgIsStop } = this.state
        //销售出入库序时簿已生成凭证，已结账为true，只能查看
        let isReadOnly =
            xdzOrgIsStop || getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost
        let type = ""

        if (row.type && row.type === 4) {
            type = row.oldCode
        } else {
            type = row.code.substr(0, 4)
        }
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const ret = await this.metaAction.modal("show", {
            title: isReadOnly || row.isDelete ? "查看" : "编辑",
            style: { top: 25 },
            height: 520,
            width: modalWidth,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: false,
            children: (
                <AddStockOrrders
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={inveBusiness}
                    type={type}
                    id={row.id}
                    isPZ={row.isDelete}
                    isReadOnly={isReadOnly}
                    checkOutType={getInvSetByPeroid.checkOutType}
                    //-- defaultServiceType={row.defaultServiceType}
                />
            ),
        })
        if (ret) {
            this.initPage()
        }
    }
    delVch = async rowData => {
        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除凭证吗？`,
            width: 340,
        })
        if (confirm) {
            this.setState({
                loading: true,
            })
            const res = await this.webapi.api.deletePz({
                vchIds: [parseInt(rowData.voucherIds)],
                isReturnValue: true,
            })
            this.setState({
                loading: false,
            })
            // 如果失败，返回结果格式为：{"result":false,"error":{"message":"凭证已审核，不可删除"}}
            // 如果成功，返回结果格式为：{"result":true,"value":null}
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "凭证删除成功")
                this.initPage()
            }
            return
        }
    }
    async delSingle(row) {
        const { getInvSetByPeroid } = this.state
        //判断是否生成凭证
        if (row.isDelete) {
            return this.metaAction.toast("error", "已生成凭证，不支持删除")
        }
        let id = row.id
        let res = await this.webapi.api.deleteOtherBillTitle({
            ids: [id],
            checkOutType: getInvSetByPeroid.checkOutType,
            isReturnValue: true,
        })
        //后台报错 提示错误信息
        // console.log("res", res)
        if (res && res.error) {
            return this.metaAction.toast("error", res.error.message)
        }
        this.metaAction.toast("success", "删除成功")
        this.initPage()
    }
    async delBatch() {
        let { selectedRowKeys, tableSource, getInvSetByPeroid } = this.state
        if (!selectedRowKeys || !selectedRowKeys[0]) {
            return this.metaAction.toast("error", "请选择需要操作的数据")
        }

        if (tableSource.some(s => selectedRowKeys.findIndex(f => f == s.id) > -1 && s.isDelete)) {
            this.metaAction.toast("error", "单据已经生成了凭证，请先删除凭证")
            return
        }
        // let ids = []
        let res = await this.webapi.api.deleteOtherBillTitle({
            ids: selectedRowKeys,
            checkOutType: getInvSetByPeroid.checkOutType,
            isReturnValue: true,
        })

        if (res && res.error) {
            return this.metaAction.toast("error", res.error.message)
        }
        this.metaAction.toast("success", "删除成功")
        this.initPage()
    }

    back = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
        this.component.props.onlyCloseContent("ttk-stock-app-other-storage")
    }
    onSearch(values) {
        const { params } = this.state
        this.setState(
            {
                params: values,
            },
            () => {
                this.initPage()
            }
        )
    }
    reset() {
        this.form.props.form.resetFields()
    }
    // 按钮事件
    handleMenuClick = type => {
        if (this.handleMenuClickDoing) return false
        this.handleMenuClickDoing = true
        switch (type) {
            case "createVoucher": //生成凭证
                this.createVoucher()
                break
            case "delVoucher":
                this.delVoucher()
                break
            case "setType":
                this.setType()
                break
            case "merge":
                this.setHabit()
                break
            case "otherStockOut":
                this.addotherStockOutOrder()
                break
            case "otherStockIn":
                this.addotherStockInOrder()
                break
            case "deleteBill":
                this.delBatch()
                break
            case "export":
                this.export()
                break
            case "import":
                this.dataImport()
                break
        }
        this.handleMenuClickDoing = false
    }

    // 导入弹窗
    dataImport = () => {
        const { getInvSetByPeroid } = this.state
        const tipDom = [
            <span>
                导出<span style={{ color: "#0066B3" }}>其他入库单模板</span>
            </span>,
        ]
        const doubleTempData = ["QTRK"]

        if (getInvSetByPeroid.checkOutType != 3) {
            tipDom.push(
                <span>
                    和<span style={{ color: "#0066B3" }}>其他出库单模板</span>
                </span>
            )
            doubleTempData.push("QTCK")
        }
        importModal({
            title: "其他出入库单导入",
            tip: [
                tipDom,
                "根据要求补充模板数据",
                "导入补充后的单据数据",
                "暂不支持在模板中新增系统外的存货档案和供应商档案",
            ],
            export: this.templateExport,
            import: this.dataUpload,
            doubleTemp: getInvSetByPeroid.checkOutType != 3 ? true : false,
            doubleTempData: doubleTempData,
        })
    }

    // 模板导出
    templateExport = async templateName => {
        const { inveBusiness } = this.state
        await this.webapi.api.templateExport({
            period: this.period, //会计期间
            orgName: this.name, //企业名称
            templateName, // QTCK代表其他出库,QTRK代表其他入库
            inveBusiness, // 1工业，0商业
        })
    }

    // 导入文件
    dataUpload = async info => {
        const res = await this.webapi.api.uploadFile({
            period: this.period,
            fileId: info.id,
            fileName: info.originalName,
            fileSuffix: info.suffix,
            fileSize: info.size,
            operator: sessionStorage["username"],
        })

        if (res && !res.uploadSuccess) {
            return await onFileError({
                confirm: data => {
                    window.open(data)
                },
                params: res.fileUrlWithFailInfo,
            })
        }
        this.pageChanged(1)
        return true
    }

    async export() {
        const { params, type, inveBusiness } = this.state
        this.setState({
            loading: true,
        })
        let obj = {
            serviceTypeId: type, //业务类型id,默认是全部传1000(必须)
            period: this.period, //当前月份(必须)
            inveBusiness, //1代表工业,0代表商业(必须)
            inventoryName: params.keyword, //存货名称或者单据编号
            vchStateCode: params.status, //凭证状态：未生成0、已生成1',默认全部
        }
        //选择了日期就传
        if (params.date && params.date.length) {
            obj.startPeriod = moment(params.date[0]).format("YYYY-MM-DD")
            obj.endPeriod = moment(params.date[1]).format("YYYY-MM-DD")
        }

        const res = await this.webapi.api.exportOtherStock(obj)

        this.setState({
            loading: false,
        })
    }
    setType = async option => {
        const ret = await this.metaAction.modal("show", {
            title: "业务类型设置",
            style: { top: 5 },
            okText: "保存",
            bodyStyle: { padding: "20px 30px" },
            wrapClassName: "orther-storage-set-type default-show-btn",
            width: 1000,
            children: (
                <TypeSetting
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={this.state.inveBusiness}
                />
            ),
        })
        this.getOtherBillServiceType()
    }
    setHabit = async option => {
        const ret = await this.metaAction.modal("show", {
            title: "凭证合并",
            style: { top: 5 },
            bodyStyle: { padding: "20px 30px" },
            width: 500,
            children: (
                <HabitSetting
                    module="other"
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                />
            ),
        })
    }
    //新增其他出库
    addotherStockOutOrder = async option => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const { inveBusiness, getInvSetByPeroid } = this.state
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            style: { top: 25 },
            height: 520,
            width: modalWidth,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: false,
            children: (
                <AddStockOrrders
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={inveBusiness}
                    checkOutType={getInvSetByPeroid.checkOutType}
                    type="QTCK"
                />
            ),
        })
        if (ret) {
            this.initPage()
        }
    }
    addotherStockInOrder = async option => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const { inveBusiness, getInvSetByPeroid } = this.state
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            style: { top: 25 },
            height: 520,
            width: modalWidth,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: false,
            children: (
                <AddStockOrrders
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={inveBusiness}
                    checkOutType={getInvSetByPeroid.checkOutType}
                    type="QTRK"
                />
            ),
        })
        if (ret) {
            this.initPage()
        }
    }
    async createVoucher(id) {
        const { selectedRowKeys, tableSource } = this.state

        if (selectedRowKeys.length < 1) {
            this.metaAction.toast("error", "请选择需要操作的数据")
            return
        }

        let ids = (id && [id]) || []

        let existStocks = true
        // // ids要根据列表顺序传递
        if (ids && ids.length === 0) {
            tableSource.forEach(item => {
                if (selectedRowKeys.findIndex(f => f == item.id) > -1) {
                    //检查存货科目是否设置
                    if (existStocks) {
                        existStocks = item.billBodyDtoList.every(s => s.inventoryRelatedAccountId)
                    }
                    //没生成凭证并且设置了科目
                    if (!item.isDelete && item.accountId) {
                        ids.push(item.id)
                    }
                }
            })
        }

        if (ids.length === 0) {
            this.metaAction.toast("error", "没有需要生成凭证的单据")
            return
        }

        if (!existStocks) {
            this.metaAction.toast("error", "存货科目未设置，请先进入【存货档案】设置科目")
            return
        }
        this.setState({
            loading: true,
        })
        const res = await this.webapi.api.generateOtherBillVoucher({
            period: this.period,
            ids,
            isReturnValue: true,
        })

        this.setState({
            loading: false,
        })

        if (res && !res.result && res.error && res.error.message) {
            this.metaAction.toast("error", res.error.message)
            this.initPage()
            return false
        }
        this.metaAction.toast("success", res)
        this.initPage()
    }
    // 删除凭证
    delVoucher = async () => {
        const { selectedRowKeys, tableSource } = this.state
        if (!selectedRowKeys || !selectedRowKeys[0]) {
            this.metaAction.toast("error", "请选择需要操作的数据")
            return
        }
        let vchIds = []

        tableSource.forEach(item => {
            if (
                selectedRowKeys.findIndex(f => f == item.id) > -1 &&
                item.voucherIds > -1 &&
                item.isDelete
            ) {
                vchIds.push(parseInt(item.voucherIds))
            }
        })
        if (vchIds.length === 0) {
            this.metaAction.toast("error", "没有可删除的凭证")
            return
        }

        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除凭证吗？`,
            width: 340,
        })
        if (confirm) {
            this.setState({
                loading: true,
            })
            let vchIdsDisdinct = Array.from(new Set(vchIds))
            const res = await this.webapi.api.deletePz({
                vchIds: vchIdsDisdinct,
                isReturnValue: true,
            })
            this.setState({
                loading: false,
            })
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "凭证删除成功")
                this.initPage()
            }
            return
        }
    }

    handleTypeChange(e) {
        this.setState(
            {
                type: e,
            },
            () => {
                this.initPage()
            }
        )
    }
    onRowClick(e, index) {
        const columnKey = e && e.target && e.target.attributes["columnKey"]
        if (columnKey && columnKey.value) {
            let { selectedRowKeys, tableSource } = this.state,
                key = tableSource[index]["id"]
            if (selectedRowKeys.includes(Number(key))) {
                selectedRowKeys = selectedRowKeys.filter(f => f !== Number(key))
            } else {
                selectedRowKeys.push(Number(key))
            }
            this.setState({
                selectedRowKeys,
            })
        }
    }

    // 智能调整---开始
    toAutoAdjust = async () => {
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 50
        if (modalWidth > 1920) modalWidth = 1920
        const { inveBusiness, getInvSetByPeroid, serviceTypeCBTZ } = this.state
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            style: { top: 25 },
            height: 520,
            width: modalWidth,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                padding: "20px 30px",
                overflow: "auto",
            },
            footer: false,
            children: (
                <AddStockOrrders
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    inveBusiness={inveBusiness}
                    checkOutType={getInvSetByPeroid.checkOutType}
                    type="QTCK"
                    isAutoAdjust
                    isPZ
                    serviceTypeId={serviceTypeCBTZ && serviceTypeCBTZ.id}
                />
            ),
        })
        if (ret) {
            this.initPage()
        }
    }
    // 智能调整---结束

    // 打印数据处理
    dealData = () => {
        let list = this.state.tableSource,
            res = [],
            selectedRowKeys = this.state.selectedRowKeys
        list.forEach((x, i) => {
            if (selectedRowKeys.includes(x.id)) {
                let temp = [],
                    data = x.billBodyDtoList
                data.forEach((y, j) => {
                    temp.push({
                        accountName: this.name,
                        amount: y.ybbalance,
                        billCode: x.code,
                        billNname: x.serviceTypeName + "单",
                        creator: x.operater,
                        custName: x.supplierName,
                        indexNo: j + 1,
                        number: y.num,
                        remarks: "",
                        specification: y.inventoryGuiGe,
                        stockCode: y.inventoryCode,
                        stockName: y.inventoryName,
                        storageDate: x.cdate,
                        unit: y.inventoryUnit,
                        unitPrice: y.price,
                        voucherCode: x.voucherCodes,
                    })
                    if (j == data.length - 1) {
                        res.push(temp)
                    }
                })
            }
        })
        if (!res.length) {
            this.metaAction.toast("error", "请勾选单据")
            return
        }
        return res
    }
    async openHelp() {
        const ret = await this.metaAction.modal("show", {
            title: "",
            className: "ttk-edf-app-help-modal-content",
            wrapClassName: "ttk-edf-app-help-modal",
            footer: null,
            width: 840, //静态页面宽度840小于会有横向滚动条
            children: this.metaAction.loadApp("ttk-edf-app-help", {
                store: this.component.props.store,
                code: "stock-app-other-records", // 查询页面对应参数
            }),
        })
    }
    render() {
        const {
            params,
            loading,
            tableSource,
            selectedRowKeys,
            type,
            tableSize,
            serviceOpt,
            getInvSetByPeroid,
            notAutoAdjust,
            xdzOrgIsStop,
        } = this.state
        const className = `bovms-editable-table iancc-table`
        const _columns = this.getColumns()

        const cond = getInvSetByPeroid.isGenVoucher
            ? true
            : getInvSetByPeroid.isCarryOverMainCost
            ? true
            : false

        const addMenu = (
            <Menu onClick={e => this.handleMenuClick(e.key)}>
                <Menu.Item key="otherStockOut" disabled={cond}>
                    其他出库
                </Menu.Item>
                <Menu.Item key="otherStockIn" disabled={cond}>
                    其他入库
                </Menu.Item>
            </Menu>
        )
        const moerMenu = (
            <Menu onClick={e => this.handleMenuClick(e.key)}>
                {!xdzOrgIsStop && (
                    <Menu.Item key="import" disabled={cond}>
                        导入
                    </Menu.Item>
                )}
                <Menu.Item key="export">导出</Menu.Item>
                {!xdzOrgIsStop && (
                    <Menu.Item key="deleteBill" disabled={cond}>
                        删除单据
                    </Menu.Item>
                )}
                {!xdzOrgIsStop && (
                    <Menu.Item key="delVoucher" disabled={getInvSetByPeroid.isGenVoucher}>
                        删除凭证
                    </Menu.Item>
                )}
                {!xdzOrgIsStop && (
                    <Menu.Item key="setType" disabled={cond}>
                        业务类型设置
                    </Menu.Item>
                )}
            </Menu>
        )

        return (
            <Layout className="other-storage-main app-purchase-backgroundColor">
                <Spin spinning={loading}>
                    <div className="other-storage-main-head">
                        <div className="other-storage-main-head-l">
                            <span className="back" onClick={this.back}></span>
                            <FilterForm
                                wrappedComponentRef={form => (this.form = form)}
                                onSearch={this.onSearch.bind(this)}
                                params={this.state.params}></FilterForm>
                            <Select
                                style={{ width: "120px" }}
                                dropdownClassName="other-storage-main-select"
                                value={type}
                                placeholder="存货类型"
                                onChange={this.handleTypeChange.bind(this)}>
                                <Select.Option key="1000" value={1000}>
                                    全部
                                </Select.Option>
                                {serviceOpt.map(e => (
                                    <Select.Option key={e.id} value={e.id} title={e.name}>
                                        {e.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className="other-storage-main-head-r">
                            <Icon
                                type="question-circle"
                                theme="filled"
                                style={{
                                    color: "#fe9400",
                                    fontSize: "16px",
                                    marginRight: "8px",
                                    cursor: "pointer",
                                }}
                                onClick={::this.openHelp}
                            />
                            {!xdzOrgIsStop && (
                                <Button.Group style={{ marginRight: "8px" }}>
                                    <Button
                                        onClick={this.handleMenuClick.bind(this, "createVoucher")}
                                        type="primary"
                                        disabled={getInvSetByPeroid.isGenVoucher}>
                                        生成凭证
                                    </Button>
                                    <Button
                                        type="primary"
                                        disabled={getInvSetByPeroid.isGenVoucher}
                                        icon="setting"
                                        style={{ marginLeft: "1px" }}
                                        onClick={this.handleMenuClick.bind(this, "merge")}
                                    />
                                </Button.Group>
                            )}
                            {!xdzOrgIsStop && (
                                <Dropdown overlay={addMenu} trigger={["click"]} disabled={cond}>
                                    <Button type="primary" style={{ marginRight: "8px" }}>
                                        新增
                                        <Icon type="down" />
                                    </Button>
                                </Dropdown>
                            )}
                            {!xdzOrgIsStop && (
                                <Button
                                    disabled={notAutoAdjust}
                                    type="primary"
                                    style={{ marginRight: "8px" }}
                                    onClick={this.toAutoAdjust}>
                                    智能成本调整
                                </Button>
                            )}
                            <PrintButton
                                className="print-btn"
                                params={{ codeType: "QTCRK" }}
                                dealData={this.dealData}
                            />
                            <Dropdown overlay={moerMenu} trigger={["click"]}>
                                <Button>
                                    更多
                                    <Icon type="down" />
                                </Button>
                            </Dropdown>
                        </div>
                    </div>
                    <DataGrid
                        loading={false}
                        className={className}
                        key={this.dataGridKey}
                        headerHeight={37}
                        // groupHeaderHeight={37}
                        rowHeight={37}
                        footerHeight={0}
                        rowsCount={(tableSource || []).length}
                        onRowClick={::this.onRowClick}
                        width={tableSize.width}
                        height={tableSize.height}
                        style={{ width: "100%", height: tableSize.height + "px" }}
                        columns={_columns}
                        rowHeightGetter={::this.rowHeightGetter}
                        allowResizeColumn
                    />
                    {this.renderFooter()}
                </Spin>
            </Layout>
        )
    }
}
