import React from "react"
import {
    Select,
    Button,
    Pagination,
    Layout
} from "edf-component"
import moment from "moment"
import { Spin, Icon } from "antd"
import { quantityFormat, addEvent, removeEvent } from "../../utils/index"
import { Switch } from 'antd';
import VirtualTable from "../../../invoices/components/VirtualTable/index"
import FilterForm from './filter'
import { baseKpxmColumns, commonColumns, baseLwdwColumns } from './columnsData'


const scrollBarWidth = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
    ? 18
    : /Edge\/(\S+)/.test(navigator.userAgent)
        ? 18
        : 12


export default class BovmsAppMemoryBank extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            scroll: {
                x:
                    (
                        document.querySelector(
                            ".edfx-app-portal-content-main"
                        ) || document.body
                    ).offsetWidth
            },
            loading: false,
            selectedRowKeys: [],
            tableSource: [],
            pageSize: 50,
            currentPage: 1,
            totalCount: 0,
            memoryCategory: 1,
            typeOpts: [],
            selectedAll: 0,
            params: {
                keyword: '',
                date: null,
                status: null
            },
            enabledYearAndMonth: '',
            tableSize: {
                width: 2000,
                height:
                    (
                        document.querySelector(`.${this.tableParentClass}`) ||
                        document.body
                    ).offsetHeight -
                    104 -
                    this.scrollHeight || 0
            }
        }

        this.menuClick = {
            createVoucher: false
        }
        this.tableParentClass = 'bovms-app-memory-bank'
        this.period = ''
        this.webapi = props.webapi
        this.metaAction = props.metaAction || {}
        this.store = props.store
        this.component = props.component
        this.scrollHeight = !/AppleWebKit\/(\S+)/.test(navigator.userAgent)
            ? 20
            : 12
        this.dataGridKey = `other-storage-datagrid-${new Date().valueOf()}`;
        this.tableScrollWidth = 0
    }
    async componentDidMount() {
        this.initPage()
        this.onResize()
        this.queryMemoryCategoryList()
        let accountInfo = await this.webapi.bovms.queryAccount()
        this.setState({
            enabledYearAndMonth: accountInfo.enabledYear
                ? `${accountInfo.enabledYear}-${(
                    "0" + accountInfo.enabledMonth
                ).slice(-2)}`
                : null
        })
        addEvent(window, "resize", :: this.onResize)

    }
    componentWillUnmount() {
        removeEvent(window, 'resize', this.onResize);
    }
    async initPage() {
        const { params, memoryCategory, pageSize, currentPage } = this.state
        this.setState({
            loading: true
        })
        let obj = {
            entity: {
                name: params.keyword,       //往来单位名称、商品名称或者规格型号（非必传）
                enableState: params.status,      //是否启用。0：没有启用；1：启用（非必传）
                // startPeriod: "2020-02-08",      //开启时间（非必传）
                // endPeriod: "2020-02-10"         //结束时间（非必传）
            },
            memoryCategory: memoryCategory,       //记忆类别，包括：开票项目-存货档案-采购(1)、开票项目-会计科目-采购(2)、开票项目-存货档案-销售(3)、开票项目-会计科目-销售(4)、往来单位-结算科目-付款(5)、往来单位-辅助核算-付款(6)、往来单位-结算科目-收款(7)、往来单位-辅助核算-收款(8)（必传）
            page: {              //分页信息（必传）
                currentPage: currentPage,    //当前页
                pageSize: pageSize       // 每页大小
            }
        }
        //选择了日期就传
        if (params.date && params.date.length) {
            obj.entity.startPeriod = moment(params.date[0]).format("YYYY-MM-DD")
            obj.entity.endPeriod = moment(params.date[1]).format("YYYY-MM-DD")
        }

        const res = await this.webapi.bovms.queryMemoryPageList(obj)
        if (res) {
            let list = res.list.map(e => {
                e.id = this.generatorRandomNum()
                return e
            })
            this.setState({
                loading: false,
                tableSource: list,
                allTableData: list,
                selectedRowKeys: [],
                totalCount: res.page && res.page.totalCount,
                ...res
            })
        }

    }
    generatorRandomNum() {
        let s = []
        let hexDigits = "0123456789"
        for (let i = 0; i < 16; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        return parseInt(s.join(""))
    }
    async queryMemoryCategoryList() {
        let res = await this.webapi.bovms.queryMemoryCategoryList()
        this.setState({
            typeOpts: res
        })
    }

    renderFooter = () => {
        const { pageSize, currentPage, totalCount } = this.state
        return (
            <div className="bovms-app-purchase-list-footer" style={{ justifyContent: 'flex-end' }}>
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
                    )}
                ></Pagination>
            </div>
        )
    }


    pageChanged = (page, pageSize) => {
        this.setState(
            {
                currentPage: page || this.state.currentPage,
                pageSize: pageSize || this.state.pageSize
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
                const index = selectedRowKeys.findIndex(
                    f => String(f) === String(record.kjxh)
                )
                if (index > -1) {
                    selectedRowKeys.splice(index, 1)
                } else {
                    selectedRowKeys.push(record.kjxh)
                }
                this.setState({
                    selectedRowKeys
                })
            } // 点击行
        }
    }

    onResize(e) {
        setTimeout(() => {
            const cn = `bovms-app-memory-bank`
            let table = document.getElementsByClassName(cn)[0]
            if (table) {
                let h = table.offsetHeight - 176, //头＋尾＋表头＋滚动条
                    w = table.offsetWidth,
                    width = w,
                    scroll = { y: h, x: w > width ? w : width }
                if (w > width) {
                    const tableCols = this.state.tableCols
                    item.width = w
                    item.minWidth = w
                    this.setState({ scroll, tableCols })
                } else {
                    this.setState({ scroll })
                }
            } else {
                setTimeout(() => {
                    this.onResize()
                }, 100)
                return
            }
        }, 100)
    }
    async switch(record, value) {
        let { tableSource, memoryCategory } = this.state
        this.setState({ loading: true })
        let dItem = tableSource.find(f => f.id === record.id)
        dItem.enableState = value ? 1 : 0
        let obj = {
            memoryCategory,
            memoryBaseList: [dItem],
        }
        const res = await this.webapi.bovms.disableMemoryState(obj)
        this.metaAction.toast('success', '操作成功')
        this.setState({
            tableSource,
            loading: false
        })
    }
    getColumns() {
        const { selectedRowKeys, tableSource, memoryCategory } = this.state
        let columns = []
        switch (memoryCategory) {
            case 1:
            case 2:
            case 3:
            case 4:
                if (memoryCategory === 3) {
                    columns = columns.concat(baseKpxmColumns).concat(commonColumns[1])
                } else {
                    columns = columns.concat(baseKpxmColumns).concat(commonColumns[memoryCategory])
                }
                break
            case 5:
            case 6:
            case 7:
            case 8:
                if (memoryCategory === 5 || memoryCategory === 7) {
                    columns = columns.concat(baseLwdwColumns).concat(commonColumns[5])
                }
                if (memoryCategory === 6 || memoryCategory === 8) {
                    columns = columns.concat(baseLwdwColumns).concat(commonColumns[6])
                }
                break

        }
        columns = columns.concat([{
            dataIndex: "createDatetime",
            title: "记忆日期",
            width: 120,
            align: 'center'
        },
        {
            dataIndex: "sourceModuleName",
            title: "来源模块",
            width: 90,
            align: 'center'
        },
        {
            dataIndex: "useModulesName",
            title: "使用模块",
            width: 90,
            align: 'center'
        }, {
            dataIndex: "action",
            title: "操作",
            width: 70,
            align: 'center',
            render: (text, record, index) => {
                return <Switch checked={record.enableState ? true : false} onChange={this.switch.bind(this, record)}></Switch>
            }
        }])
        return columns;
    }

    onSearch(values) {
        const { params } = this.state
        this.setState(
            {
                params: values,
                currentPage:1
            },
            () => {
                this.initPage()
            }
        )
    }

    // 按钮事件
    handleMenuClick = type => {
        switch (type) {
            case 'batchEnabled':
                this.batchEnabled(1)
                break
            case 'batchDisabled':
                this.batchEnabled(0)
                break
            case 'batchDelete':
                this.batchDelete()
                break
        }
    };
    async batchEnabled(state) {
        let { selectedRowKeys, tableSource, memoryCategory, allTableData } = this.state
        //是否有选择数据
        if (selectedRowKeys.length) {
            let list = []
            selectedRowKeys.forEach(e => {
                let dItem = allTableData.find(f => f.id === e)
                dItem.enableState = state
                list.push(dItem)
            })

            let obj = {
                memoryCategory,
                memoryBaseList: list,
                isReturnValue: true
            }
            const res = await this.webapi.bovms.disableMemoryState(obj)
            this.initPage()
            this.metaAction.toast('success', state ? '启用成功' : '停用成功')
        } else {
            this.metaAction.toast('error', state ? '请选择需要启用的记录' : '请选择需要停用的记录')
        }
    }
    async batchDelete() {
        let { selectedRowKeys, tableSource, memoryCategory, allTableData } = this.state
        //是否有选择数据
        if (selectedRowKeys.length) {
            const comfirm = await this.metaAction.modal("confirm", {
                content: "确定要删除记录吗?"
            })
            if (comfirm) {
                let list = []
                selectedRowKeys.forEach(e => {
                    let dItem = allTableData.find(f => f.id === e)
                    dItem.enableState = e.state
                    list.push(dItem)
                })

                let obj = {
                    memoryCategory,
                    memoryBaseList: list,
                    isReturnValue: true
                }
                const res = await this.webapi.bovms.deleteMemoryList(obj)
                this.initPage()
                this.metaAction.toast('success', '删除成功')
            }

        } else {
            this.metaAction.toast('error', '请选择需要删除的记录')
        }
    }

    handleTypeChange(e) {
        this.setState({
            memoryCategory: e,
            currentPage:1
        }, () => {
            this.initPage()
        })
    }

    onRowClick(e, index) {
        const columnKey = e && e.target && e.target.attributes['columnKey'];
        if (columnKey && columnKey.value) {
            let { selectedRowKeys, tableSource } = this.state,
                key = tableSource[index]['id'];
            if (selectedRowKeys.includes(Number(key))) {
                selectedRowKeys = selectedRowKeys.filter(f => f !== Number(key))
            } else {
                selectedRowKeys.push(Number(key));
            }
            this.setState({
                selectedRowKeys
            })
        }
    }
    onSelectChange = arr => {
        this.setState({
            selectedRowKeys: arr
        })
    }
    render() {
        const {
            params,
            loading,
            tableSource,
            selectedRowKeys,
            memoryCategory,
            tableSize,
            scroll,
            typeOpts,
            enabledYearAndMonth
        } = this.state
        const className = `bovms-editable-table iancc-table bovms-common-table-style`
        const _columns = this.getColumns();
        let placeholder = ''
        const rowSelection = {
            columnWidth: 60,
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            // selections: [{
            //     key: 'all-data',
            //     text: '选择全部',
            //     onSelect: async () => {
            //         const { params, memoryCategory, pageSize, currentPage } = this.state
            //         this.setState({
            //             loading: true
            //         })
            //         let obj = {
            //             entity: {
            //                 name: params.keyword,       //往来单位名称、商品名称或者规格型号（非必传）
            //                 enableState: params.status,      //是否启用。0：没有启用；1：启用（非必传）
            //             },
            //             memoryCategory: memoryCategory,       //记忆类别，包括：开票项目-存货档案-采购(1)、开票项目-会计科目-采购(2)、开票项目-存货档案-销售(3)、开票项目-会计科目-销售(4)、往来单位-结算科目-付款(5)、往来单位-辅助核算-付款(6)、往来单位-结算科目-收款(7)、往来单位-辅助核算-收款(8)（必传）

            //         }
            //         //选择了日期就传
            //         if (params.date && params.date.length) {
            //             obj.entity.startPeriod = moment(params.date[0]).format("YYYY-MM-DD")
            //             obj.entity.endPeriod = moment(params.date[1]).format("YYYY-MM-DD")
            //         }

            //         const res = await this.webapi.bovms.queryAllMemoryPageList(obj)
            //         if (res) {
            //             let selectedRowKeys = []
            //             let list = []
            //             res.list.map(e => {
            //                 e.id = this.generatorRandomNum()
            //                 selectedRowKeys.push(e.id)
            //                 list.push(e)
            //             })

            //             this.setState({
            //                 loading: false,
            //                 allTableData: list,
            //                 tableSource: list.filter((e, i) => i <= 50),
            //                 selectedRowKeys: selectedRowKeys,
            //             })
            //         }
            //     },
            // },
            // {
            //     key: 'no-data',
            //     text: '取消选择',
            //     onSelect: () => {
            //         this.setState({
            //             selectedRowKeys: []
            //         })
            //     },
            // },
            // ],
        };
        switch (memoryCategory) {
            case 1:
            case 2:
            case 3:
            case 4:
                placeholder = '请输入商品名称或规格型号'
                break
            case 5:
            case 6:
            case 7:
            case 8:
                placeholder = '请输入往来单位名称'
                break
        }

        let tableWidth = (document.querySelector(".edfx-app-portal-content-main") || document.body).offsetWidth
        return (
            <Layout className='other-storage-main app-purchase-backgroundColor' >
                <Spin spinning={loading}>
                    <div className='other-storage-main-head' style={{ paddingTop: '8px' }}>
                        <div className='other-storage-main-head-l'>
                            <Select style={{ width: '220px' }} dropdownClassName='other-storage-main-select' value={memoryCategory} onChange={this.handleTypeChange.bind(this)}>
                                {typeOpts.map(e => (<Select.Option key={e.memoryCategory} value={e.memoryCategory} title={e.memoryName}>
                                    {e.memoryName}
                                </Select.Option>))}
                            </Select>
                            <FilterForm
                                wrappedComponentRef={form => (this.form = form)}
                                onSearch={this.onSearch.bind(this)}
                                placeholder={placeholder}
                                enabledYearAndMonth={enabledYearAndMonth}
                                params={this.state.params}
                            ></FilterForm>
                            <span style={{ color: '#fa954c', marginLeft: '8px' }}>温馨提示：记忆数据可用于业务模块的智能匹配</span>
                        </div>
                        <div className='other-storage-main-head-r'>
                            <Button
                                onClick={this.handleMenuClick.bind(this, 'batchEnabled')}
                                type="primary"
                                style={{ marginRight: "8px" }}
                            >启用
                                </Button>
                            <Button
                                onClick={this.handleMenuClick.bind(this, 'batchDisabled')}
                                type="primary"
                                style={{ marginRight: "8px" }}
                            >停用
                                </Button>
                            <Button
                                onClick={this.handleMenuClick.bind(this, 'batchDelete')}
                                type="primary"
                                style={{ marginRight: "8px" }}
                            >删除
                                </Button>
                        </div>
                    </div>
                    <div>
                        <VirtualTable
                            rowSelection={rowSelection}
                            className={className}
                            width={tableWidth}
                            bordered
                            dataSource={tableSource}
                            columns={_columns}
                            scroll={{x:scroll.x-10,y:scroll.y}}
                            pagination={false}
                            rowKey="id"
                        // onRow={this.onRow}
                        >
                        </VirtualTable>
                    </div>

                    {this.renderFooter()}
                </Spin>
            </Layout>
        )
    }
}
