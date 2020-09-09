import React from 'react'
import {action as MetaAction} from 'edf-meta-engine'
import {fromJS} from 'immutable'
import {Icon, Tooltip} from 'edf-component'
import config from './config'
import SetLimit from './component/SetLimit'
import moment from "moment";
import utils from "edf-utils";
import {smallBtnType} from './fixedData'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    
    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        const nsqj = (this.metaAction.context.get("currentOrg") || {}).periodDate;
        // this.metaAction.sf('data.nsqj', moment(new Date()))
        this.metaAction.sf('data.nsqj', nsqj && moment(nsqj, 'YYYY-MM').add(1, 'months') || moment())
        this.getColumns()
        this.load()
        this.queryDetail()
        //debugger
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.load)
        }
    }
    // 获取权限
    queryDetail = async () => {
        let res = await this.webapi.invoice.queryUserDetail('')
        this.metaAction.sf('data.userDetail', res.rolePreset)
        let btnType = smallBtnType
        if (res.rolePreset === 2) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = true
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else if (res.rolePreset === 1) {
            btnType.forEach((item) => {
                if (item.key !== 'setLimitData') item.disabled = false
            })
            this.metaAction.sf('data.btnType', fromJS(btnType))
        } else {
            this.metaAction.sf('data.btnType', fromJS(btnType))
        }
        
        
    }
    getColumns = async () => {
        const currentOrg = this.metaAction.context.get('currentOrg') || {}
        const {invoiceVersion} = currentOrg
        this.metaAction.sf('data.helpTooltip', invoiceVersion === 2 ? '可以读取税务发票、远程提取发票和票税宝上传发票' : '可以读取税务发票、远程提取发票和票税宝上传发票，并对导入发票补全明细')
        const pageID = 'singleSmallCustom'
        const resp = await this.webapi.invoice.queryColumnVo({
            pageID
        })
        if (!this.mounted) return
        const columns = this.metaAction.gf('data.columnData').toJS()
        if (resp) {
            const data = JSON.parse(resp.columnjson)
            columns.forEach(item => {
                const idx = data.indexOf(item.id)
                item.isVisible = idx !== -1
            })
        }
        this.metaAction.sf('data.columns', fromJS(columns))
    }
    load = async () => {
        const qyId = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").id
        const nsrsbh = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").vatTaxpayerNum
        
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const nsqj = this.metaAction.gf('data.nsqj')
        const params = {
            nsqj: nsqj && nsqj.format('YYYYMM'),
            TaxpayerNature: '1',
            qyId: qyId,
            nsrsbh: nsrsbh
        }
        const resp = await this.webapi.invoice.queryAccountById(params)
        const psbResp = null //await this.webapi.invoice.getPsbInvoiceUrl({ orgId: qyId })
        if (!this.mounted) return
        this.injections.reduce('tableLoading', false)
        if (psbResp) {
            if (psbResp.resCode === '1000' && psbResp.enable) {
                this.metaAction.sfs({
                    'data.externalUrl': psbResp.pageUrl,
                    'data.externalUrlDisable': false,
                })
            } else {
                this.metaAction.sfs({
                    'data.externalUrl': null,
                    'data.externalUrlDisable': true,
                })
            }
        }
        if (resp) {
            this.injections.reduce('load', resp)
            setTimeout(() => {
                this.onResize()
            }, 50)
        }
        
        
    }
    externalUrlClick = () => {
        const url = this.metaAction.gf('data.externalUrl'),
            qyId = (this.metaAction.context.get("currentOrg") || {}).id
        if (url && this.component.props.setPortalContent) {
            this.component.props.setPortalContent(
                '票税宝录票',
                'ttk-edf-app-iframe?rt=psb', {accessType: 1, orgId: qyId, src: url}
            )
        }
    }
    handleMonthPickerChange = (e, strTime) => {
        // const time = moment(strTime, 'YYYY-MM')
        this.metaAction.sf('data.nsqj', e)
        this.load()
    }
    judgeChoseBill = (type) => {
        this[type](type)
    }
    loadSaleInvoice = async (type) => {
        // let { nsqj } = this.component.props.qyId ? this.component.props : this.component.props.appParams
        let nsqj = this.metaAction.gf('data.nsqj') && this.metaAction.gf('data.nsqj').format('YYYY-MM-DD')
        nsqj = moment(nsqj).subtract(1, "month").format('YYYYMM').substr(0, 6)
        
        const res = await this.metaAction.modal('show', {
            title: '一键读取销项',
            className: 'inv-app-sales-collect-card-modal',
            width: 500,
            top: 10,
            okText: '确定',
            centered: true,
            bodyStyle: {padding: '0px'},
            children: this.metaAction.loadApp('inv-app-sales-collect-card', {
                store: this.component.props.store,
                data: {},
                // callback: this.load,
                nsqj,
            }),
        })
        if (res && res.needReload) {
            this.load()
        }
    }
    loadPurchaseInvoice = async (type) => {
        // let { nsqj } = this.component.props.qyId ? this.component.props : this.component.props.appParams
        let nsqj = this.metaAction.gf('data.nsqj') && this.metaAction.gf('data.nsqj').format('YYYY-MM-DD')
        nsqj = moment(nsqj).subtract(1, "month").format('YYYYMM').substr(0, 6)
        
        const res = await this.metaAction.modal('show', {
            title: '一键读取进项',
            // className: 'inv-app-sales-collect-card-modal',
            width: 420,
            top: 10,
            okText: '确定',
            centered: true,
            bodyStyle: {padding: '0px'},
            children: this.metaAction.loadApp('inv-app-pu-collect-card', {
                store: this.component.props.store,
                data: {},
                callback: this.load,
                nsqj,
            }),
        })
        if (res) {
            this.load()
        }
    }
    setLimitData = () => {
        let userDetail = this.metaAction.gf('data.userDetail')
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        this.getLimitData().then(async (resp) => {
            this.injections.reduce('tableLoading', false)
            if (resp) {
                let ret = await this.metaAction.modal('show', {
                    title: '上限预警设置',
                    width: 500,
                    height: 300,
                    footer: userDetail === 2 ? null : true,
                    className: 'small-modal-class inv-custom-list-limit-modal',
                    children: <SetLimit
                        ratio={resp.ratio}
                        webapi={this.webapi}
                    />
                })
                if (ret) {
                    this.load()
                }
            }
        }).finally(() => {
            this.injections.reduce('tableLoading', false)
        })
        
        
    }
    getLimitData = async () => {
        return await this.webapi.invoice.queryRatio()
    }
    
    
    // 显示列设置
    showTableSetting = ({value, data}) => {
        const columns = this.metaAction.gf('data.columns').toJS()
        this.metaAction.sf('data.other.columnDto', fromJS(columns))
        this.injections.reduce('tableSettingVisible', {value})
    }
    upDateTableSetting = async ({value, data}) => {
        const columns = []
        const pageID = 'singleSmallCustom'
        for (const item of data) {
            item.isVisible ? columns.push(item.id) : null
        }
        const resp = await this.webapi.invoice.upDateColumn({
            pageID,
            columnjson: JSON.stringify(columns)
        })
        if (resp) {
            this.getColumns()
            this.injections.reduce('tableSettingVisible', {value})
        }
        
    }
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', {value: false})
    }
    resetTableSetting = async () => {
        const pageID = 'singleSmallCustom'
        let res = await this.webapi.invoice.deleteColumn({pageID})
        if (res) {
            this.injections.reduce('update', {
                path: 'data.showTableSetting',
                value: false
            })
            this.getColumns()
        }
    }
    
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
                <Icon type={status === 1 ? 'exclamation-circle' : 'check-circle'}
                      className={status === 1 ? 'inv-custom-warning-text' : 'inv-custom-success-text'}/>
            </Tooltip> : null
        )
        
    }
    renderTaxAmount = (text, record, row) => {
        if (row.isToolTip) {
            let message = record[`${row.type}SeMsg`] ? record[`${row.type}SeMsg`].split(';') : []
            let toolTipContent = message.map(item => <div>{item}</div>)
            return record[`${row.type}SeMsg`] ? <Tooltip
                arrowPointAtCenter={true}
                title={() => toolTipContent}
                overlayClassName="inv-tool-tip-normal">
                <span
                    className="text-tax-amount">{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
            </Tooltip> : <span
                className="text-tax-amount">{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
        } else {
            return <span>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }
    renderTotalAmount = (text, record, row) => {
        if (row.fieldName === 'totalAmount' && record.limitRate) {
            return <span>
                <Tooltip
                    arrowPointAtCenter={true}
                    placement="top"
                    title={record.limitRate}
                    overlayClassName='inv-tool-tip-warning'>
                    <Icon type="exclamation-circle" className='inv-custom-warning-text'/>
                </Tooltip>
                <span
                    style={{paddingLeft: '5px'}}>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
            </span>
        } else {
            return <span
                title={typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }
    
    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        let width = 0
        column.forEach((item, index) => {
            if (item.isVisible) {
                width += item.width
                if (item.children) {
                    const child = [] // 多表头
                    let col
                    item.children.forEach(subItem => {
                        if (subItem.isSubTitle) {
                            child.push({
                                title: subItem.caption,
                                dataIndex: subItem.fieldName,
                                key: subItem.fieldName,
                                width: subItem.width,
                                align: subItem.align,
                                className: subItem.className,
                                render: (text, record) => (this.renderTaxAmount(text, record, subItem))
                            })
                        } else {
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
                    })
                    arr.push({
                        title: item.caption,
                        align: item.align,
                        className: item.className,
                        children: child
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
                                <div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'}
                                     onClick={() => this.showTableSetting({value: true})}>
                                    <Icon
                                        type='setting'
                                        name='setting'
                                    />
                                    {showTableSetting ?
                                        <span style={{paddingLeft: '5px', display: 'inline'}}>列设置</span> : null}
                                </div>
                            </div>
                        
                        ),
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        fixed: 'right',
                        render: (text, record) => (
                            <span>
                    <a href="javascript:void(0)" onClick={() => this.salesPurchaseClick(record, 1)}> 销项</a>
                    <span style={{padding: '0 5px'}}>|</span><a href="javascript:void(0)"
                                                                onClick={() => this.salesPurchaseClick(record, 2)}> 进项</a>
                </span>
                        )
                    })
                } else {
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => (this.renderTotalAmount(text, record, item))
                        // fixed: item.isFixed
                    })
                }
            }
        })
        this.metaAction.sf('data.columnsWidth', width)
        return arr
    }
    salesPurchaseClick = (record, t) => {
        let nsqj = this.metaAction.gf('data.nsqj').format('YYYYMM')
        const userDetail = this.metaAction.gf('data.userDetail')
        if (this.component.props.setPortalContent) {
            this.component.props.setPortalContent(
                t == 1 ? '销项发票' : '进项发票',
                t == 1 ? 'inv-app-batch-sale-list' : 'inv-app-batch-purchase-list', {
                    accessType: 1,
                    swVatTaxpayer: '1',
                    nsqj,
                    userDetail,
                    xzqhdm:record.xzqhdm.substring(0,2),
                    qyId: record.qyId,
                    xgmJbOrYb: record.cwbbType === '季报' ? '1' : '0'
                }
            )
        } else if (this.component.props.onRedirect) {
            let appName = `${t == 1 ? 'inv-app-batch-sale-list' : 'inv-app-batch-purchase-list'}?swVatTaxpayer=1&nsqj=${nsqj}&userDetail=${userDetail}&qyId=${record.qyId}&xgmJbOrYb=${record.cwbbType === '季报' ? '1' : '0'}`
            this.component.props.onRedirect({appName})
        } else {
            this.metaAction.toast('error', '进入方式不对')
        }
    }
    componentDidMount = () => {
        this.mounted = true
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
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
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-single-custom-small-list')[0]; //以app为检索范围
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
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : 1,
                        y: height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth : 1
                    })
                }
            }
        } catch (err) {
        }
    }
    
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    
    metaAction.config({metaHandlers: ret})
    
    return ret
}