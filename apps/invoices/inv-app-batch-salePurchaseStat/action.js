import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import { Icon, Tooltip } from 'edf-component'
import config from './config'
import { generalBtnType, smallBtnType, Tips, tableColumns } from './fixedData'
import utils from "edf-utils";
import { addEvent, removeEvent } from "../../invoices/utils/index"
import moment from 'moment'
import VirtualTable from "../../invoices/components/VirtualTable/index"
import { Resizable } from "react-resizable"

const ResizeableTitle = props => {
    const { onResize, width, resizeAble, ...restProps } = props
    const children = <React.Fragment {...restProps} />
    if (!width || !resizeAble) {
        return children
    }

    return (
        <Resizable
            width={width}
            height={0}
            handle={resizeHandle => (
                <span
                    className={`resizable-handle-${resizeHandle}`}
                    onClick={e => {
                        e.stopPropagation()
                    }}
                />
            )}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
            children={children}
        />
    )
}
const getResizeTitle = (cols, handerResize) => {
    const result = []
    cols.forEach(col => {
        const item = {
            ...col,
            minWidth: col.width || 100,
            title: (
                <ResizeableTitle
                    resizeAble={col.resizeAble}
                    width={col.width}
                    onResize={handerResize(col.key)}
                    className={col.width ? "resizable" : ""}
                >
                    {col.title}
                </ResizeableTitle>
            )
        }
        if (col.children) {
            item.children = getResizeTitle(col.children, handerResize)
        }
        result.push(item)
    })
    return result
}
const resizeCols = (cols, key, size) => {
    const result = []
    cols.forEach(col => {
        if (col.key === key) {
            col = {
                ...col,
                width:
                    size.width < col.minWidth
                        ? col.minWidth
                        : col.maxWidth && size.width > col.maxWidth
                            ? col.maxWidth
                            : size.width
            }
        }
        if (col.children) {
            col.children = resizeCols(col.children, key, size)
        }
        result.push(col)
    })
    return result
}

function flatCol(cols) {
    cols = cols.flatMap(item => {
        if (item.children) {
            item = flatCol(item.children)
        }
        return item
    })
    return cols
}

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        //const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.nsqj = '' //currentOrg.periodDate;
        this.initColunms()

        // const { invoiceVersion } = currentOrg
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener;
        // if (addEventListener) {
        //     addEventListener('onTabFocus', ::this.initPage);
        // }
    }
    initColunms = () => {
        const mode = this.metaAction.gf('data.mode')
        let xfmcWidth = (
            document.querySelector(".edfx-app-portal-content-main") ||
            document.body
        ).offsetWidth
        let tableCols = Object.assign(tableColumns, {})

        if (mode === 1) {
            tableCols = tableCols.filter((item) => {
                return item.dataIndex !== 'ggxh' && item.dataIndex !== 'dw'
            })
        } else if (mode === 2) {
            tableCols = tableCols.filter((item) => {
                return item.dataIndex !== 'dw'
            })
        }
        // this.cachaTableColumns = getResizeTitle(tableCols, this.handerResize)
        // tableCols = tableCols.filter((item) => {
        //     return item.dataIndex !== 'ggxh' && item.dataIndex !== 'dw'
        // })

        //动态计算商品名称宽度
        tableCols.forEach(e => {
            if (e.dataIndex != 'hwmc') {
                if (e.width) {
                    xfmcWidth -= e.width
                }
            }
            if (e.children) {
                e.children.forEach(se => {
                    if (se.width) {
                        xfmcWidth -= se.width
                    }
                    se.render = (text, record) => (this.renderTaxAmount(text, record, se))
                })
            }
        })
        xfmcWidth -= 10
        tableCols = tableCols.map((col, index) => ({
            ...col,
            width:
                col.dataIndex === "hwmc"
                    ? xfmcWidth < 0
                        ? 100
                        : xfmcWidth
                    : col.width,
            minWidth:
                col.dataIndex === "hwmc"
                    ? xfmcWidth < 0
                        ? 100
                        : xfmcWidth
                    : col.minWidth,
            onHeaderCell: column => ({
                width: column.width,
                onResize: throttle(this.handerResize(index), 100)
            })
        }))

        const cols = getResizeTitle(tableCols, this.handerResize)
        this.initColsWidth = flatCol(cols)
            .map(m => m.width || m.minWidth || 0)
            .reduce((a, b) => a + b, 0)
        this.metaAction.sf('data.tableColumns', cols)

    }
    // componentWillReceiveProps = async (nextProps) => {
    //     if (!isEqual(nextProps.isRefresh, this.component.props.isRefresh)) {
    //         this.initPage()
    //     }
    // }
    // 获取权限
    queryDetail = async () => {
        //let res = await this.webapi.invoice.queryUserDetail('')
        let rolePreset = '1'
        if (rolePreset) {
            this.metaAction.sf('data.userDetail', rolePreset)
        }
        //  权限控制按钮
        const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        let btnType = TaxpayerNature === '0' ? generalBtnType : smallBtnType
        if (rolePreset === 2) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = true
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else if (rolePreset === 1) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = false
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else {
            this.metaAction.sf('data.btnType', fromJS(btnType))
        }
    }
    initPage = () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        this.metaAction.sfs({
            'data.TaxpayerNature': '0',
            'data.nsqj': moment().subtract(1, "months"),
            'data.nsqj2': moment().subtract(1, "months"),
            'data.inputVal': '',
        })
        let filterFormOld = this.metaAction.gf('data.filterFormOld').toJS()
        this.metaAction.sf('data.filterForm', fromJS(filterFormOld))
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.metaAction.sf('data.pagination', fromJS(pagination))
        this.getColumns()
        this.load()
    }

    handleReset = (data) => {
        this.metaAction.sfs({
            'data.khRange': 'self',
            'data.departments': undefined,
        })
        setTimeout(() => {
            this.load();
        }, 100);
    }
    setmda = (path, val) => {
        this.metaAction.sf(path, val)
    }
    handleConfirm = async (data) => {
        // khRange
        let checked = data,
            maxde = this.metaAction.gf('data.maxde'),
            khRange = 'self',
            permissionAll = this.metaAction.gf('data.other.permission.all');
        if (checked && checked.length > 0) {
            khRange = 'dept'
        }
        if (Array.isArray(checked) && checked.findIndex(f => f == maxde) > -1 && permissionAll === 'all') {
            khRange = 'all'
        }
        this.metaAction.sfs({
            'data.checkedKeys.checked': data,
            'data.khRange': khRange,
            'data.departments': checked || undefined,
        });
        setTimeout(() => {
            this.load();
        }, 100);
    }
    getColumns = async () => {
        const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // const resp = await this.webapi.invoice.queryColumnVo({
        //     pageID
        // })
        const resp = {}
        // console.log(resp);
        //if (!this.mounted) return
        // columnsData(封装了小规模和一般纳税人列数据)
        // columns（当前要显示的列数据）
        // const currentOrg = this.metaAction.context.get("currentOrg") || {}
        // const { invoiceVersion } = currentOrg
        const columnData = this.metaAction.gf('data.columnData').toJS()
        this.metaAction.sf('data.columns', fromJS([]))
        let columns = columnData[TaxpayerNature].columns
        // console.log(columns, 12);
        // if (resp) {
        //     const data = JSON.parse(resp.columnjson)
        //     // 处理每一列的显示状态
        //     columns.forEach(item => {
        //         const idx = data.indexOf(item.id)
        //         item.isVisible = idx !== -1
        //     })
        // }
        //console.log(columns);
        let mode = this.metaAction.gf('data.mode')
        if (mode == 1) {
            columns = columns.filter((itme) => {
                return itme.id !== "ggxh" && itme.id !== "dw"
            })
        }
        this.metaAction.sf('data.columns', fromJS(columns))
        setTimeout(() => {
            this.onResize()
        }, 50)
    }
    // 获取页面数据
    load = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
        }
        const pagination = this.metaAction.gf('data.pagination').toJS(),
            inputVal = this.metaAction.gf('data.inputVal'),
            nsqj = this.metaAction.gf('data.nsqj'),
            nsqj2 = this.metaAction.gf('data.nsqj2'),
            mode = this.metaAction.gf('data.mode'),
            filterForm = this.metaAction.gf('data.filterForm').toJS(),
            params = {
                spmc: inputVal,
                kpyfq: moment(nsqj).format('YYYYMM'),
                kpyfz: moment(nsqj2).format('YYYYMM'),
                mode,
                ...filterForm,
                page: {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize
                }
            }
        const resp = await this.webapi.invoice.fptjXxfpJxfpMxsjPageList(params)
        let permission = {},
            tempPermissionTreedata = this.metaAction.gf('data.other.permission.treeData');
        // if (!(tempPermissionTreedata && tempPermissionTreedata.length > 0)) {
        //     //permission = await this.webapi.invoice.queryPermission();
        // }
        if (!this.mounted) return
        if (permission && permission.body && !(JSON.stringify(permission.body.bmxx) == '{}')) {
            this.metaAction.sfs({
                'data.other.permission.treeData': permission.body.bmxx,
                'data.other.permission.all': permission.body.all,
                // 'data.other.permission.self':permission.body.self
                'data.maxde': Array.isArray(permission.body.bmxx) && permission.body.bmxx[0].bmdm
            })
            // this.injections.reduce('update', 'data.other.permission', permission);
        }
        if (resp) {
            if (resp.list.length === 0) {
                this.injections.reduce('tableLoading', false)
            }
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })

            this.metaAction.sfs({
                'data.fpzs': resp.fpzs || '',
                'data.hjxxsl': resp.hjxxsl || '',
                'data.hjxxje': resp.hjxxje || '',
                'data.hjjxsl': resp.hjjxsl || '',
                'data.hjjxje': resp.hjjxje || '',
                'data.hjcesl': resp.hjcesl || '',
                'data.hjceje': resp.hjceje || '',
                'data.dljgId': resp.dljgId || '',
                'data.userId': resp.userId || '',
                'data.qyId': resp.qyId || '',
            })


            this.metaAction.sf('data.list', fromJS([]))
            this.injections.reduce('load', resp)
            setTimeout(() => {
                this.onResize()
                this.injections.reduce('tableLoading', false)
            }, 50)
        } else {
            this.injections.reduce('tableLoading', false)
        }

    }
    // 切换纳税人身份
    tabChange = (e) => {
        const userDetail = this.metaAction.gf('data.userDetail')
        //this.metaAction.sf('data.columns', fromJS([]))
        this.injections.reduce('tableLoading', true)
        //this.metaAction.sf('data.TaxpayerNature', e)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        //this.metaAction.sf('data.pagination', fromJS(pagination))
        const { filterFormOld } = this.metaAction.gf('data').toJS()
        // this.metaAction.sf('data.filterForm', fromJS(filterFormOld))
        //this.metaAction.sf('data.inputVal', '')
        this.injections.reduce('tableSettingVisible', { value: false })
        //this.metaAction.sf('data.list', fromJS([]))
        this.metaAction.sfs({
            'data.columns': fromJS([]),
            'data.TaxpayerNature': e,
            'data.pagination': fromJS(pagination),
            'data.filterForm': fromJS(filterFormOld),
            'data.inputVal': '',
            'data.list': fromJS([])
        })
        let btnType = e === '0' ? generalBtnType : smallBtnType
        if (userDetail === 2) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = true
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else if (userDetail === 1) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = false
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else {
            this.metaAction.sf('data.btnType', fromJS(btnType))
        }

        this.load()
        this.getColumns()
    }
    // 输入框搜索
    onSearch = () => {
        this.injections.reduce('tableLoading', true)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.metaAction.sf('data.pagination', fromJS(pagination))
        this.load()
    }
    // 切换报税月份
    handleMonthPickerChange = (e) => {
        this.injections.reduce('tableLoading', true)
        //this.metaAction.sf('data.nsqj', e)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        // this.metaAction.sf('data.pagination', fromJS(pagination))
        this.metaAction.sfs({
            'data.nsqj2': e,
            'data.pagination': fromJS(pagination)
        })
        this.load()
    }
    // 禁止选择月份
    disabledDate = (current) => {
        let nsqj2 = this.metaAction.gf('data.nsqj2')
        //console.log(moment(nsqj2).format('YYYYMM'));
        return current && current > nsqj2;

    }
    disabledDate2 = (current) => {
        let nsqj = this.metaAction.gf('data.nsqj')
        return current && current > moment().endOf('month') || current && current < nsqj

    }

    // 商品名称改变
    modeChange = (e = 1) => {
        this.injections.reduce('tableLoading', true)

        this.metaAction.sf('data.mode', e)
        this.initColunms()
        // this.metaAction.sf('data.columns', fromJS(columns))

        this.load()
    }
    // 点击搜索，初始化高级搜索
    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { filterForm } = this.metaAction.gf('data').toJS()
            this.metaAction.sf('data.formContent', fromJS(filterForm))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }
    //  点击高级搜索重置
    resetForm = () => {
        const { filterFormOld, formContent } = this.metaAction.gf('data').toJS()
        Object.assign(formContent, filterFormOld)
        this.metaAction.sf('data.formContent', fromJS(formContent))
    }
    // 点击高级搜索进项搜索
    filterList = () => {
        this.injections.reduce('tableLoading', true)
        const { formContent } = this.metaAction.gf('data').toJS()
        this.metaAction.sfs({
            'data.filterForm': fromJS(formContent),
            'data.showPopoverCard': false,
            'data.pagination.currentPage': 1
        })
        this.load()
    }

    renderTable = () => {
        let { list, scroll, mode, fpzs, hjxxsl, hjxxje, hjjxsl, hjjxje, hjcesl, hjceje, tableColumns } = this.metaAction.gf('data').toJS()
        let expendedData = flatCol(tableColumns)

        let ggxhW = expendedData.find(f => f.dataIndex === 'ggxh') ? expendedData.find(f => f.dataIndex === 'ggxh').width : '100px'
        let dwW = expendedData.find(f => f.dataIndex === 'dw') ? expendedData.find(f => f.dataIndex === 'dw').width : '80px'
        let xxslW = expendedData.find(f => f.dataIndex === 'xxsl') ? expendedData.find(f => f.dataIndex === 'xxsl').width : '150px'
        let xxjeW = expendedData.find(f => f.dataIndex === 'xxje') ? expendedData.find(f => f.dataIndex === 'xxje').width : '150px'
        let jxslW = expendedData.find(f => f.dataIndex === 'jxsl') ? expendedData.find(f => f.dataIndex === 'jxsl').width : '150px'
        let jxjeW = expendedData.find(f => f.dataIndex === 'jxje') ? expendedData.find(f => f.dataIndex === 'jxje').width : '150px'
        let ceslW = expendedData.find(f => f.dataIndex === 'cesl') ? expendedData.find(f => f.dataIndex === 'cesl').width : '150px'
        let cejeW = expendedData.find(f => f.dataIndex === 'ceje') ? expendedData.find(f => f.dataIndex === 'ceje').width : '150px'

        const colStyle = {
            padding: "0 10px",
            borderRight: "1px solid #d9d9d9",
            fontSize: '13px',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'right',
            backgroundColor: '#f8f8f8'
        },
            summaryRows = {
                rows: (
                    <div className="vt-summary row">
                        <div
                            style={{
                                ...colStyle,
                                width: tableColumns.find(f => f.dataIndex === 'hwmc').width,
                            }}
                            className=""
                        >
                            合计
                    </div>
                        {(mode === 2 || mode === 3) && <div style={{ width: ggxhW, ...colStyle }}></div>}
                        {mode === 3 && <div style={{ width: dwW, ...colStyle }}></div>}
                        <div style={{ ...colStyle, width: xxslW, textAlign: 'left' }}>{hjxxsl}</div>
                        <div style={{ ...colStyle, width: xxjeW }}>{hjxxje}</div>
                        <div style={{ ...colStyle, width: jxslW, textAlign: 'left' }}>{hjjxsl}</div>
                        <div style={{ ...colStyle, width: jxjeW }}>{hjjxje}</div>
                        <div style={{ ...colStyle, width: ceslW, textAlign: 'left' }}>{hjcesl}</div>
                        <div style={{ ...colStyle, width: cejeW, paddingRight: '20px' }}>{hjceje}</div>
                    </div>
                ),
                height: 37
            }

        let sumTableWidth = this.getTableWidth(),
            tableWidth =
                (
                    document.querySelector(".edfx-app-portal-content-main") ||
                    document.body
                ).offsetWidth - 10
        const diffWidth = flatCol(tableColumns)
            .map(m => m.width || m.minWidth || 0)
            .reduce((a, b) => a + b, 0) - this.initColsWidth
        const scrollX = diffWidth > 0 ? diffWidth + tableWidth +4: tableWidth+4
        return <VirtualTable
            className='ttk-stock-app-salePurchaseStat mk-layout'
            loading={false}
            columns={tableColumns}
            dataSource={list}
            // key={tableKey}
            rowKey='id'
            width={tableWidth}
            style={{ width: tableWidth + "px" }}
            scroll={{ y: scroll.y, x: scrollX }}
            summaryRows={summaryRows}
            bordered
        />
    }

    handerResize = key => (e, { size }) => {
        let { tableColumns } = this.metaAction.gf('data').toJS()
        this.metaAction.sf('data.tableColumns', resizeCols(tableColumns, key, size))
    }

    // 更多
    judgeChoseBill = (type) => {
        // const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        // if (type !== 'setLimitData' && type !== 'invoiceManagement' && checkboxValue && checkboxValue.length === 0) {
        //     message.warning('请先选择客户！')
        //     return
        // }
        this[type](type)
    }
    //导出
    export = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
        }
        const {userId,dljgId,qyId} = this.metaAction.gf('data').toJS()
        const pagination = this.metaAction.gf('data.pagination').toJS(),
            inputVal = this.metaAction.gf('data.inputVal'),
            nsqj = this.metaAction.gf('data.nsqj'),
            nsqj2 = this.metaAction.gf('data.nsqj2'),
            mode = this.metaAction.gf('data.mode'),
            filterForm = this.metaAction.gf('data.filterForm').toJS(),
            params = {
                entity:{
                    userId,dljgId,qyId
                },
                spmc: inputVal,
                kpyfq: moment(nsqj).format('YYYYMM'),
                kpyfz: moment(nsqj2).format('YYYYMM'),
                mode,
                ...filterForm,
                page: {
                    currentPage: pagination.currentPage,
                    pageSize: pagination.pageSize
                }
            }
        await this.webapi.invoice.exportFptjXxfpJxfpMxsjList(params)
    }

    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
    componentDidMount = () => {
        this.mounted = true
        this.initPage()
        this.queryDetail()
        this.onResize()
        addEvent(window, "resize", :: this.onResize)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.load)
        }
    }
    componentWillUnmount = () => {
        this.mounted = false
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.metaAction.gf('data').toJS()
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
            }
        }
        this.injections.reduce('tableLoading', true)
        this.metaAction.sf('data.pagination', fromJS(pagination))
        this.load()
    }
    // 显示列设置
    showTableSetting = ({ value, data }) => {
        const columns = this.metaAction.gf('data.columns').toJS()
        this.metaAction.sf('data.other.columnDto', fromJS(columns))
        this.injections.reduce('tableSettingVisible', { value })
    }
    // 保存列设置
    upDateTableSetting = async ({ value, data }) => {
        const columns = []
        const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        for (const item of data) {
            item.isVisible ? columns.push(item.id) : null
        }
        const resp = await this.webapi.invoice.upDateColumn({
            pageID,
            columnjson: JSON.stringify(columns)
        })
        if (!this.mounted) return
        if (resp) {
            this.getColumns()
            this.injections.reduce('tableSettingVisible', { value })
        }
    }
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    // 重置列
    resetTableSetting = async () => {
        const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        let res = await this.webapi.invoice.deleteColumn({ pageID })
        if (!this.mounted) return
        if (res) {
            this.injections.reduce('update', {
                path: 'data.showTableSetting',
                value: false
            })
            this.getColumns()
        }
    }
    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr
            }
        })
        //this.selectedOption = newItemArr
    }
    /**
     *
     * @param record 当前列数据
     * @param type   进项|| 销项
     * @returns {null}
     */
    renderStatus = (record, type) => {
        let status, time, message
        if (type === 'jx') {
            status = record.jxcjzt
            time = record.jxtqsj
            message = record.jxcjztmsg
        } else {
            status = record.xxcjzt
            time = record.xxtqsj
            message = record.xxcjztmsg
        }
        return (
            status === 0 || status === 1 ? <Tooltip
                arrowPointAtCenter={true}
                placement={status === 0 ? 'top' : 'left'}
                overlayClassName={status === 0 ? 'inv-tool-tip-normal' : 'inv-tool-tip-warning'}
                title={status === 0 ? `采集时间：${time}` : message}>
                <Icon type={status === 1 ? 'exclamation-circle' : 'check-circle'} className={status === 1 ? 'inv-custom-warning-text' : 'inv-custom-success-text'} />
            </Tooltip> : null
        )

    }
    /**
     *
     * @param text
     * @param record
     * @param row 当前表头fixedData
     * @returns {*}
     */
    renderTaxAmount = (text, record, row) => {
        const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        if (TaxpayerNature === '1' && row.isToolTip && record[`${row.type}SeMsg`]) {
            let message = record[`${row.type}SeMsg`] ? record[`${row.type}SeMsg`].split(';') : []
            let toolTipContent = message.map(item => <div>{item}</div>)
            return record[`${row.type}SeMsg`] ? <Tooltip arrowPointAtCenter={true} title={() => toolTipContent} overlayClassName="inv-tool-tip-normal" >
                <span className="text-tax-amount">{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span> </Tooltip> : <span className="text-tax-amount">{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span >
        } else if (row.amountSix) {
            return <span>{text}</span>
        } else {
            return <span>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span> // 除小规模以外的信息不需要特殊处理
        }
    }

    renderTotalAmount = (text, record, row) => {
        if (row.fieldName === 'totalAmount' && record.limitRate) { // record.limitRate 判断是否超过预警值
            return <span>
                <Tooltip
                    arrowPointAtCenter={true}
                    placement="top"
                    title={record.limitRate}
                    overlayClassName='inv-tool-tip-warning'>
                    <Icon type="exclamation-circle" className='inv-custom-warning-text' />
                </Tooltip>
                <span style={{ paddingLeft: '5px' }}>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
            </span>
        } else {
            return <span title={typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }

    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        let width = 0
        const fixedTable = this.metaAction.gf('data.fixedTable')
        column.forEach((item, index) => {
            if (item.isVisible) {
                width += item.width
                if (item.children) { // 判断是否进入了有多级表头的分支
                    const child = [] // 多表头
                    let col //  一级表头是否要显示 *** 状态栏显示
                    item.children.forEach(subItem => {
                        if (subItem.isSubTitle) { // 二级表头渲染方式
                            child.push({
                                title: subItem.caption,
                                dataIndex: subItem.fieldName,
                                key: subItem.fieldName,
                                width: subItem.width,
                                align: subItem.align,
                                className: subItem.className,
                                render: (text, record) => (this.renderTaxAmount(text, record, subItem))
                            })
                        } else { // 状态一级表头渲染方式
                            const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature') // 纳税人方式  小规模 无已认证未认证区分
                            if (!(TaxpayerNature === '0' && item.fieldName === 'jxfpyrz' && column[index + 1].isVisible)) { //正常状态显示
                                col = {
                                    title: subItem.caption,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width,
                                    align: subItem.align,
                                    className: subItem.className,
                                    render: (text, record) => (this.renderStatus(record, subItem.type))
                                }
                            }
                        }
                    })
                    arr.push({ // 表头数据
                        title: item.caption,
                        align: item.align,
                        children: child,
                        className: item.className,
                    })
                    if (col) {
                        arr.push(col)
                    }
                } else if (item.id === 'operation') {
                    const showTableSetting = this.metaAction.gf('data.showTableSetting')
                    arr.push({
                        title: (
                            <div>
                                操作
                                <div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'} onClick={() => this.showTableSetting({ value: true })}>
                                    <Icon
                                        type='setting'
                                        name='setting'
                                    />
                                    {showTableSetting ? <span style={{ paddingLeft: '5px', display: 'inline' }}>列设置</span> : null}
                                </div>
                            </div>

                        ),

                        className: 'operation',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        fixed: fixedTable ? 'right' : '',
                        render: (text, record) => (
                            <span>
                                <a href="javascript:void(0)" onClick={() => this.salesPurchaseClick(record, 1)}> 销项</a>
                                <span style={{ padding: '0 5px' }}>|</span><a href="javascript:void(0)" onClick={() => this.salesPurchaseClick(record, 2)}> 进项</a>
                            </span>
                        )
                    })
                } else { // 常规操作
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => (this.renderTotalAmount(text, record, item)), // 特殊字段处理
                        fixed: fixedTable ? item.isFixed : ''
                    })
                }
            }
        })
        this.metaAction.sf('data.columnsWidth', width)
        return arr
    }
    // 点击进销项
    salesPurchaseClick = (record, t) => {
        const userDetail = this.metaAction.gf('data.userDetail')
        const swVatTaxpayer = this.metaAction.gf('data.TaxpayerNature'),
            nsqj = this.metaAction.gf('data.nsqj').format('YYYYMM')
        let appName = `${t == 1 ? 'inv-app-batch-sale-list' : 'inv-app-batch-purchase-list'}?swVatTaxpayer=${swVatTaxpayer}&nsqj=${nsqj}&qyId=${record.qyId}&xgmJbOrYb=${record.cwbbType === '季报' ? '1' : '0'}`
        // let title = record.khmc //t === 1 ? '销项发票' : '进项发票'
        let title = t === 1 ? '销项发票' : '进项发票'
        let app = t === 1 ? 'inv-app-batch-sale-list' : 'inv-app-batch-purchase-list'
        let params = {
            userDetail,
            swVatTaxpayer,
            nsqj,
            xzqhdm: record.xzqhdm.substring(0, 2),
            qyId: record.qyId,
            xgmJbOrYb: record.cwbbType === '季报' ? '1' : '0'
        }
        // setGlobalContent，setGlobalContentWithDanhuMenu
        if (this.component.props.setGlobalContent) {
            this.component.props.setGlobalContent({
                name: title,
                appName: app + '?djxh=' + record.djxh,
                params,
                orgId: record.qyId,
                showHeader: true,
            })
        } else if (this.component.props.openDanhu) {
            this.component.props.openDanhu(record.qyId, appName, title)
        } else if (this.component.props.onRedirect) {
            this.component.props.onRedirect({ appName })
        } else {
            this.metaAction.toast('error', '进入方式不对')
        }
    }
    getTableWidth() {
        let { tableColumns } = this.metaAction.gf('data').toJS()
        return tableColumns.map(m => m.width || 0)
            .reduce((a, b) => a + b, 0)
    }
    // handerResize = index => (e, { size }) => {
    //     this.setState(
    //         ({ tableCols }) => {
    //             const nextCols = [...tableCols]
    //             nextCols[index] = {
    //                 ...nextCols[index],
    //                 width:
    //                     size.width < nextCols[index].minWidth
    //                         ? nextCols[index].minWidth
    //                         : size.width
    //             }
    //             return { tableCols: nextCols }
    //         },
    //         () => {
    //             const dom = document.querySelector(
    //                 `.${this.tableClass} .ant-table-body`
    //             )
    //             if (dom && dom.scrollLeft > 0) {
    //                 dom.scrollLeft =
    //                     dom.scrollLeft + dom.scrollWidth - this.tableScrollWidth
    //                 this.tableScrollWidth = dom.scrollWidth
    //             }
    //         }
    //     )
    // }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        // setTimeout(() => {
        //     if (keyRandomTab == this.keyRandomTab) {
        //         this.getTableScroll()
        //     }
        // }, 200)
        setTimeout(() => {
            const cn = `inv-app-custom-list`
            let table = document.getElementsByClassName(cn)[0]
            if (table) {
                let h = table.offsetHeight - 190, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = this.getTableWidth(),
                    scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    let { tableColumns } = this.metaAction.gf('data').toJS(),
                        item = tableColumns.find(f => f.dataIndex === "hwmc")

                    tableColumns.forEach(e => {
                        if (e.dataIndex != 'hwmc') {
                            if (e.width) {
                                w -= e.width
                            }
                        }
                        if (e.children) {
                            e.children.forEach(se => {
                                if (se.width) {
                                    w -= se.width
                                }
                            })
                        }
                    })
                    w -= 10
                    item.width = w
                    item.minWidth = w
                    this.metaAction.sfs({
                        'data.scroll': scroll,
                        'data.tableColumns': tableColumns
                    })
                } else {
                    this.metaAction.sf('data.scroll', scroll)
                }
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    renderFooterPagination = (total) => {
        return <span>共<span style={{ fontWeight: 'bold' }}>{total}</span>条记录</span>
    }
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-custom-list')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                const tbodyWidth = tbodyDom.offsetWidth;
                const columnsWidth = this.metaAction.gf('data.columnsWidth')
                this.metaAction.sf('data.fixedTable', columnsWidth > width)
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : width - 12,
                        y: columnsWidth > width ? height - theadDom.offsetHeight - 2 : height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : width - 2
                    })
                }
            }
        } catch (err) { }
    }
    ceChange = (e,sl) => {
        let a = e.replace(/^-/g, '')
        a = Number(a)
        if(sl === 'sl'){
            this.metaAction.sf('data.formContent.slcejdz', a)
        }else {
    
            this.metaAction.sf('data.formContent.jecejdz', a)
        }
    }


}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}