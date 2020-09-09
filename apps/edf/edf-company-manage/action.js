import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Form, DataGrid, Icon, Button, Input, LoadingMask } from 'edf-component'
import extend from './extend'
import config from './config'
import { consts } from 'edf-consts'
import { environment } from 'edf-utils'
import ApplyForInvoice from './component/ApplyForInvoice'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')

        let availableOrg = sessionStorage.getItem('currentOrgStatus')
        if (availableOrg != 1 && availableOrg != 2) {
            //隐藏返回按钮
            this.metaAction.sf('data.hideBackBtn', true)
        }

        let tabState = this.component.props.tabState
        if (!!tabState) {
            this.handleTabChange(String(tabState))
        }
        this.isCurrentOrg = false
        this.load()

        if (this.component.props.appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.load)
        }
        let currentOrg = this.metaAction.context.get('currentOrg')
        if (!!currentOrg) {
            this.metaAction.sf('data.other.accountingStandards', currentOrg.accountingStandards)
        }
    }

    load = async (option) => {
        this.metaAction.sf('data.other.loading', true)
        let column = this.getColumns()
        let list = await this.getData()

        //如果删除的是当前则更新token
        if (this.isCurrentOrg && list.length != 0) {
            await this.webapi.org.updateCurrentOrg({ "orgId": list[0].id })
            document.querySelector('.currentOrgName').innerHTML = list[0].name
            this.component.props.onPortalReload && await this.component.props.onPortalReload()
        }

        //如果企业都删除更新UI
        if (list.length == 0) {
            this.injections.reduce('load', column, list)
            this.injections.reduce('initQueryList', list)
            this.metaAction.sf('data.isShowSearch', false)
            sessionStorage['currentOrgStatus'] = 2
            //隐藏按钮
            this.metaAction.sf('data.hideBackBtn', false)
            this.component.props.hideHead()

            this.metaAction.sf('data.other.loading', false)
            return
        }

        this.injections.reduce('load', column, list)
        this.injections.reduce('initQueryList', list)
        this.metaAction.sf('data.isShowSearch', false)

        this.metaAction.sf('data.other.loading', false)
    }

    addManage = async () => {
        this.component.props.setPortalContent('新建企业', 'edf-company-manage-add')
    }

    goRegister = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }

        this.component.props.onRedirect({ appName: 'edf-company-manage-add' })

    }
    goCompanyManage = (e) => {
        if (e.preventDefault) {
            e.preventDefault()
        }
        if (e.stopPropagation) {
            e.stopPropagation()
        }
        this.component.props.onRedirect({ appName: 'edf-company-manage' })
    }


    fieldChange = (path, value) => {
        this.metaAction.sf(path, value)
        let form = this.metaAction.gf('data.form').toJS()
        let column = this.getColumns()
        let searchList = []
        let res = this.metaAction.gf('data.queryList').toJS()
        res.map((option, index) => {
            if (option.name.indexOf(value) > -1 || (option.helpCode&&option.helpCode.indexOf(value.toUpperCase()) > -1) ) {
                searchList.push(option)
            }
            return searchList
        })
        if (value == '') {
            console.log(res)
            this.injections.reduce('load', column, res)
        } else {
            this.injections.reduce('load', column, searchList)
        }
    }
    //渲染表格列
    getListColumns = () => {
        let { Column, Cell } = DataGrid
        const columns = this.metaAction.gf('data.columns').toJS();
        let list = []
        if (this.metaAction.gf('data.list')) {
            list = this.metaAction.gf('data.list').toJS()
        }
        let cols = []
        columns.forEach(op => {
            let col = <Column name={op.id} isResizable={false} columnKey={op.id} flexGrow={1} width={op.width}
                header={<Cell name='header'
                    className="edf-company-manage-headerBgColor">{op.columnName}</Cell>}
                cell={(ps) => {
                    if (op.name == "lastLoginTime") {
                        return <Cell>{`${list[ps.rowIndex]['lastLoginTime']}`}</Cell>
                    }
                    // if (op.name == "helpCode") {
                    //     return <Cell>{`${list[ps.rowIndex]['helpCode'] ? list[ps.rowIndex]['helpCode'] : '' }`}</Cell>
                    // }
                    if (op.name == 'contactNumber') {
                        if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_004) {
                            return <Cell style={{ color: '#e94033' }}>{`${list[ps.rowIndex]['createTime'].replace(/-/g, '.')} - ${list[ps.rowIndex]['expireTime'].replace(/-/g, '.')}`}</Cell>
                        } else if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_005) {
                            return <Cell style={{ color: '#e94033' }}>{`${list[ps.rowIndex]['createTime'].replace(/-/g, '.')} - ${list[ps.rowIndex]['expireTime'].replace(/-/g, '.')}`}</Cell>
                        }
                        return <Cell>{`${list[ps.rowIndex]['createTime'].replace(/-/g, '.')} - ${list[ps.rowIndex]['expireTime'].replace(/-/g, '.')}`}</Cell>
                    }
                    if (op.name == 'status') {
                        if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_004) {
                            return <Cell style={{ color: '#e94033' }}>{`未购买`}</Cell>
                        } else if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_005) {
                            return <Cell style={{ color: '#e94033' }}>{`未续费`}</Cell>
                        } else if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_003) {
                            return <Cell style={{ color: '#fa954c' }}>{`试用期`}</Cell>
                        } else if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_006) {
                            return <Cell style={{ color: '#333333' }}>{`已购买`}</Cell>
                        } else if (list[ps.rowIndex]['status'] == consts.ORGSTATUS_001) {
                            return <Cell style={{ color: '#333333' }}>{`正常`}</Cell>
                        } else {
                            return <Cell style={{ color: '#fa954c' }}>{`试用期`}</Cell>
                        }
                    }
                    if (op.name == 'remark') {
                        let isOtherUser = list[ps.rowIndex].isOtherUser
                        let className = isOtherUser ? 'deleteManage isOtherUser' : 'deleteManage'
                        let appVersion = this.metaAction.gf('data.appVersion')
                        let isExpire = list[ps.rowIndex]['status'] == consts.ORGSTATUS_004 || list[ps.rowIndex]['status'] == consts.ORGSTATUS_005
                        return <Cell>

                            <span className="edf-company-manage-font">
                                {
                                    (appVersion != 107) ?
                                        // ((list[ps.rowIndex]['status'] == consts.ORGSTATUS_003) ?
                                        (true ?
                                            <span onClick={this.goActivate.bind(this, list[ps.rowIndex])} className={'order'}>激活</span> : null)
                                        : null
                                }
                                {/*{*/}
                                {/*    (appVersion != 107 && appVersion != 104) ?*/}
                                {/*        ((list[ps.rowIndex]['status'] == consts.ORGSTATUS_003 || list[ps.rowIndex]['status'] == consts.ORGSTATUS_004) ?*/}
                                {/*            <span onClick={this.goBuy.bind(this, list[ps.rowIndex])} className={'order'}>购买</span> :*/}
                                {/*            <span onClick={this.goBuy.bind(this, list[ps.rowIndex])} className={'order'}>续购</span>)*/}
                                {/*        : null*/}
                                {/*}*/}
                                {
                                    // 精锐版、会计准则为民间非营利时不能导账
                                    (appVersion != 104) ?
                                        ((list[ps.rowIndex].importAccountStatus && list[ps.rowIndex].importAccountStatus == 1) ?
                                            (<span className='vessel'><span style={{ cursor: 'pointer' }} onClick={this.importAccount.bind(this, list[ps.rowIndex], 1)} className={isExpire ? 'importAccount disabledImportAccount' : 'importAccount'}>继续导账</span>
                                                <span style={{ cursor: 'pointer' }} onClick={this.cancelImportAccount.bind(this, list[ps.rowIndex])} className={isExpire ? 'importAccount disabledImportAccount' : 'importAccount'}>取消导账</span></span>)
                                            : <span onClick={this.importAccount.bind(this, list[ps.rowIndex], 0)} className={isExpire ? 'importAccount disabledImportAccount' : 'importAccount'}>导账</span>)
                                        : null
                                }
                                <span style={{ width: '24px' }} onClick={isOtherUser == true ? "" : this.delOrg.bind(this, list[ps.rowIndex].id)} className={className}>删除</span>
                            </span>

                        </Cell>
                    }
                    let name = list[ps.rowIndex][op.name]
                    if (list[ps.rowIndex].importAccountStatus && list[ps.rowIndex].importAccountStatus == 1) {
                        return <Cell style={{ textDecoration: 'none', cursor: 'default' }} title={name}><span style={{ color: '#cccccc', textDecoration: 'none' }}>{name}</span></Cell>
                    } else {
                        return <Cell className={'portalOrgName'} title={name} onClick={() => {
                            this.setCurrentOrg(list[ps.rowIndex])
                        }}> {name}</Cell>
                    }

                }}
            />
            cols.push(col)
        })

        return cols
    }
    //企业列表跳转到立即购买
    goBuy = async (data) => {
        if (!!data.unpaidOrderId) {
            const res = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
            })
            if (res) {
                // this.orderGoBuy({orderData: {id: data.unpaidOrderId}, origin: 1})
                this.handleTabChange("2")
            }
            return
        }
        this.component.props.setPortalContent('产品订购', 'ttk-edf-app-buy', { company: data })
    }
    //企业列表跳转到激活
    goActivate = async (data) => {
        if (!!data.unpaidOrderId) {
            const res = await this.metaAction.modal('confirm', {
                title: '提示',
                content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
            })
            if (res) {
                // this.orderGoBuy({orderData: {id: data.unpaidOrderId}, origin: 1})
                this.handleTabChange("2")
            }
            return
        }

        this.component.props.setPortalContent('产品激活', 'ttk-edf-app-org-activate', { company: data, activateSource: 'edf-company-manage' })
    }
    //导账
    importAccount = async (org, type) => {
        let isExpire = org['status'] == consts.ORGSTATUS_004 || org['status'] == consts.ORGSTATUS_005
        if (isExpire) return
        LoadingMask.show()
        const currentOrg = this.metaAction.context.get('currentOrg')
        if (!!currentOrg && currentOrg.id !== org.id) {
            let update = await this.webapi.org.updateCurrentOrg({ "orgId": org.id })
            if (!update) return
            this.component.props.onPortalReload && await this.component.props.onPortalReload()
        } else if (currentOrg === undefined) {
            let update = await this.webapi.org.updateCurrentOrg({ "orgId": org.id })
            if (!update) return
            this.component.props.onPortalReload && await this.component.props.onPortalReload()
        }
        LoadingMask.hide()
        // 0: 对已有企业选择导账 1： 继续导账
        if (type == 0) {
            let res = await this.webapi.org.modify({ orgId: org.id })
            //false提示重新初始化
            if (!res) {
                //打开重新初始化
                const ret = await this.metaAction.modal('show', {
                    title: '导账',
                    width: 652,
                    height: 311,
                    children: this.metaAction.loadApp('edfx-app-org-reinit', {
                        store: this.component.props.store,
                        origin: 'manageList',
                    })
                })

                //更新content部分
                if (ret) {
                    this.toImportAccount(org.id, type)
                }
            } else {
                //直接跳到导账
                this.metaAction.context.set('currentOrg', org)
                this.toImportAccount(org.id, type)
            }

        } else if (type == 1) {
            this.toImportAccount(org.id, type)
        }
    }
    cancelImportAccount = async (org) => {
        let isExpire = org['status'] == consts.ORGSTATUS_004 || org['status'] == consts.ORGSTATUS_005
        if (isExpire) return
        const res = await this.metaAction.modal('confirm', {
            title: '提示',
            content: '取消导账将会清除您已经确认的导账数据，是否确认取消？',
        })
        if (res) {
            this.isCurrentOrg = false
            let ret = await this.webapi.org.cancelImportAccount({ "orgId": org.id })
            this.load()
        }

    }
    toImportAccount = (id, type) => {
        this.component.props.setPortalContent('导账', 'ttk-gl-app-importdata-enterprise', { organization: id, sourceType: type })
    }

    getContent = () => {
        return (
            <div className="importAccountModalBody">
                <Icon fontFamily={'edficon'} type="jinggao" />
                <span>导账功能将会重新初始化账套，请确认是否确定导账！</span>
            </div>
        )
    }

    back = () => {	//返回到门户
        this.component.props.setPortalContent('门户首页', 'edfx-app-portal', { isShowMenu: false, isTabsStyle: false })
    }

    getListRowsCount = () => {
        let list = this.metaAction.gf('data.list')
        return list ? list.size : 0
    }

    isCurrentOrg = false    //判断删除的是否是当前企业
    delOrg = async (id) => {
        let data = this.metaAction.context.get('currentOrg')
        // const ret = await this.metaAction.modal('confirm', {
        //     title: '删除',
        //     content: '删除企业将永久删除该企业相关的数据，无法恢复，请谨慎操作。您确认要删除企业吗?',
        //     className: 'edf-company-manage-modal',
        // })
        const ret = await this.metaAction.modal('show', {
            title: '删除',
            width: 652,
            height: 311,
            children: this.metaAction.loadApp('edf-company-manage-delete', {
                store: this.component.props.store,
            })
        })
        if (ret) {
            let response = await this.webapi.org.del({ id })
            if (response) {
                this.component.props.updateOrgList()
                this.metaAction.toast('success', '删除成功')
                if (data && id == data.id) {
                    this.isCurrentOrg = true
                } else {
                    this.isCurrentOrg = false
                }
            }
            this.load()
        } else {
            return
        }
    }
    setCurrentOrg = async (option) => {
        let response = await this.webapi.org.updateCurrentOrg({ "orgId": option.id })
        sessionStorage['currentOrgStatus'] = null
        this.component.props.onPortalReload && await this.component.props.onPortalReload()
        // this.metaAction.context.set('currentOrg', option)
        this.component.props.setPortalContent('门户首页', 'edfx-app-portal', { isShowMenu: false, isTabsStyle: false })
    }
    //修改档案
    modifyDetail = (id) => (e) => {
        let personId = id ? id : null
        this.add(personId)
    }

    //获取列表内容
    getData = async (pageInfo) => {
        let response = await this.webapi.org.queryList()
        return response
    }
    //获取列数据
    getColumns = () => {
        return [{
            columnName: '企业名称',
            id: 'name',
            name: 'name',
            width: 212,
        },
        //  {
        //     columnName: '助记码',
        //     id: 'helpCode',
        //     name: 'helpCode',
        //     width: 80,
        // },
        {
            columnName: '使用状态',
            id: 'status',
            name: 'status',
            width: 80,
        }, {
            columnName: '最后登录日期',
            id: 'lastLoginTime',
            name: 'lastLoginTime',
            width: 150,
        }, {
            columnName: '授权日期',
            id: 'contactNumber',
            name: 'contactNumber',
            width: 150,
        }, {
            columnName: '操作',
            id: 'remark',
            name: 'remark',
            width: 278,
        }]
    }
    //切换页签
    handleTabChange = (key) => {
        this.metaAction.sf('data.other.activeTabKey', key)
        if (key == 2) {
            this.loadOrderList()
        }
    }
    //加载订单列表
    loadOrderList = async () => {
        let entity = {}
        if (this.metaAction.gf('data.payType') != 0) {
            entity.payType = this.metaAction.gf('data.payType')
        }
        if (this.metaAction.gf('data.orderStatus') != 0) {
            entity.orderStatus = this.metaAction.gf('data.orderStatus')
        }
        if (this.metaAction.gf('data.form.orderOrgName') && this.metaAction.gf('data.form.orderOrgName').trim().length > 0) {
            entity.orgName = this.metaAction.gf('data.form.orderOrgName')
        }
        let value = await this.webapi.order.query({ entity })
        this.injections.reduce('initOrderList', value.list)
        // console.log(list)
        // let list = this.getOrderList()
        // this.injections.reduce('initOrderList', list)
    }
    //获取行数
    getOrderListRowsCount = () => {
        let list = this.metaAction.gf('data.orderlist')
        return list ? list.size : 0
    }
    //切换筛选方式
    changePayType = async (key) => {
        this.metaAction.sf('data.payType', key)
        let entity = {}
        if (key != 0) {
            entity.payType = key
        }
        if (this.metaAction.gf('data.orderStatus') != 0) {
            entity.orderStatus = this.metaAction.gf('data.orderStatus')
        }
        if (this.metaAction.gf('data.form.orderOrgName') && this.metaAction.gf('data.form.orderOrgName').trim().length > 0) {
            entity.orgName = this.metaAction.gf('data.form.orderOrgName')
        }
        let value = await this.webapi.order.query({
            entity
        })
        this.injections.reduce('initOrderList', value.list)
    }
    changeStatus = async (key) => {
        this.metaAction.sf('data.orderStatus', key)
        let entity = {}
        if (key != 0) {
            entity.orderStatus = key
        }
        if (this.metaAction.gf('data.payType') != 0) {
            entity.payType = this.metaAction.gf('data.payType')
        }
        if (this.metaAction.gf('data.form.orderOrgName') && this.metaAction.gf('data.form.orderOrgName').trim().length > 0) {
            entity.orgName = this.metaAction.gf('data.form.orderOrgName')
        }
        let value = await this.webapi.order.query({
            entity
        })
        this.injections.reduce('initOrderList', value.list)
    }
    //订单列表
    getOrderColumns = () => {
        let { Column, Cell } = DataGrid,
            list = this.metaAction.gf('data.orderlist').toJS(),
            cols = [],
            columns = this.getOrderColumnsHead()
        columns.forEach(op => {
            let col = <Column name={op.id} isResizable={false} columnKey={op.id} flexGrow={1} width={op.width}
                header={<Cell name='header' className="edf-company-manage-headerBgColor">{op.columnName}</Cell>}
                cell={(ps) => {
                    let content = list[ps.rowIndex][op.name]
                    switch (op.name) {
                        case 'orgName':
                            return <Cell style={{ textDecoration: 'none', cursor: 'default' }} className={'portalOrgName'} title={content}>{content}</Cell>
                        case 'orderNo':
                            return <Cell onClick={this.orderDetail.bind(this, list[ps.rowIndex])} className={'orderNo'}>{content}</Cell>
                        case 'createTime':
                            return <Cell>{content}</Cell>
                        case 'payType':
                            return <Cell>{this.getPayType(content)}</Cell>
                        case 'orderStatus':
                            return <Cell>{this.getPayStatus(content)}</Cell>
                        case 'operate':
                            return <Cell>
                                {this.getOperate(list[ps.rowIndex])}
                            </Cell>
                        default:
                            break;
                    }
                }}
            />
            cols.push(col)
        })
        return cols
    }
    //获取支付方式
    getPayType = (type) => {
        if (!type) return ''
        return type == 1 ? '中国银联' : (type == 2 ? '微信支付' : '支付宝')
    }
    //获取支付状态
    getPayStatus = (type) => {
        if (!type) return ''
        return type == 1 ? '待支付' : (type == 4 ? '交易完成' : '交易取消')
    }
    //获取操作
    getOperate = (data) => {
        if (data.orderStatus == 4) {
            if (data.invoiceStatus == 3) {
                return (
                    <span className="edf-company-manage-font">
                        <span onClick={this.orderDetail.bind(this, data)}>订单详情</span>
                        {/* <span onClick={this.goBuy.bind(this)}>续购订单</span> */}
                        {
                            data.orderSource == 1 ? <span onClick={this.openInvoice.bind(this, data)}>查看发票</span> : null
                        }
                    </span>
                )
            } else if (data.invoiceStatus == 2) {
                return (
                    <span className="edf-company-manage-font">
                        <span onClick={this.orderDetail.bind(this, data)}>订单详情</span>
                        {/* <span onClick={this.goBuy.bind(this)}>续购订单</span> */}
                        {
                            data.orderSource == 1 ? <span title="开票中，请稍后" style={{ color: '#999999' }}>查看发票</span> : null
                        }
                    </span>
                )
            } else {
                return (
                    <span className="edf-company-manage-font">
                        <span onClick={this.orderDetail.bind(this, data)}>订单详情</span>
                        {/* <span onClick={this.goBuy.bind(this)}>续购订单</span> */}
                        {
                            data.orderSource == 1 ? <span onClick={this.applyForInvoice.bind(this, data)}>申请发票</span> : null
                        }
                    </span>
                )
            }

        } else if (data.orderStatus == 1) {
            return (
                <span className="edf-company-manage-font">
                    <span onClick={this.orderDetail.bind(this, data)}>订单详情</span>
                    <span onClick={this.orderGoBuy.bind(this, { orderData: data, origin: 1 })}>立即支付</span>
                    <span onClick={this.cancelOrder.bind(this, data)}>取消订单</span>
                    <span></span>
                </span>
            )
        } else if (data.orderStatus == 5) {
            return (
                <span className="edf-company-manage-font">
                    <span onClick={this.orderDetail.bind(this, data)}>订单详情</span>
                    <span onClick={this.deleteOrder.bind(this, data)}>删除订单</span>
                    <span></span>
                </span>
            )
        }
    }
    //查看发票
    openInvoice = async (data) => {
        let params = {
            businessOrderNo: data.id
        }
        // let result = await this.webapi.invoice.query(params)
        let src = data.orderInvoice.ordercenterInvoiceUrl
        let a = document.querySelector('#downloadInvoice')
        a.setAttribute('href', src)
        if (environment.isClientMode()) {
            a.setAttribute('target', '_self')
        }
        else {
            a.setAttribute('target', '_blank')
        }
        a.click()
        // let src = ''
        // if(result.erroMsg == "ok") {
        //     src = result.orderCenterInvoices[0].invoiceUrl
        // }else {
        //     this.metaAction.toast('error', result.erroMsg)
        //     return
        // }

        // const res = await this.metaAction.modal('show', {
        //     title: '查看发票',
        //     wrapClassName: 'checkInvoiceModal',
        //     children: this.renderIframe(src),
        //     cancelText: '关闭',
        //     className: 'tax-pdf',
        //     width: 940,
        //     height: 580
        // })
        // if(res) {
        //     console.log('res')
        // }
    }
    renderIframe = (src) => {
        return (
            <div style={{ position: 'relative' }}>
                <iframe style={{ margin: '0 auto', display: 'block' }} src={src} name="pdfIframe" width={673} height={458} id="pdfIframe" className='pdfIframe'></iframe>
                <Icon onClick={this.downloadInvoice.bind(this, src)} style={{ position: 'absolute', right: 0, top: 0 }} fontFamily="edficon" type="xiazai" className="downloadInvoice" />
            </div>
        )
    }
    downloadInvoice = (src) => {
        let a = document.querySelector('#downloadInvoice')
        a.setAttribute('href', src)
        if (environment.isClientMode()) {
            a.setAttribute('target', '_self')
        }
        else {
            a.setAttribute('target', '_blank')
        }
        a.click()
    }
    //申请发票
    applyForInvoice = async (data) => {
        console.log(data)
        const res = await this.metaAction.modal('show', {
            title: '申请发票',
            wrapClassName: 'applyForInvoiceModal',
            children: <ApplyForInvoice order={data} />,
            cancelText: '取消',
            okText: '确认提交',
            width: 540,
            height: 314
        })
        if (res) {
            this.loadOrderList()
        }
    }
    //查看订单信息
    orderDetail = async (data) => {
        let className = ''
        if (data.orderStatus == 1) {
            className = 'orderDetailModal'
        } else {
            className = 'orderDetailModal hidePayBtn'
        }
        const result = await this.metaAction.modal('show', {
            title: '订单详情',
            width: 715,
            height: 553,
            cancelText: '返回我的订单',
            okText: '立即支付',
            wrapClassName: className,
            children: this.metaAction.loadApp('ttk-edf-app-order-detail', {
                store: this.component.props.store,
                detail: data,
            })
        })
        console.log(result)
        if (result) {
            this.orderGoBuy({ orderData: data, origin: 1 })
        }
    }
    //立即支付
    payOrder = async (title) => {
        this.goBuy()
    }
    //取消订单
    cancelOrder = async (data) => {
        const res = await this.metaAction.modal('confirm', {
            title: '提示',
            content: '是否确定取消订单？',
        })
        if (res) {
            let value = await this.webapi.order.cancel({
                id: data.id,
            })
            if (value) {
                this.loadOrderList()
                //更新企业列表状态
                this.load()
                this.metaAction.sf('data.form.name', '')
            }
        }
    }
    //删除订单
    deleteOrder = async (data) => {
        const res = await this.metaAction.modal('confirm', {
            title: '提示',
            content: '是否确定删除订单？',
        })
        if (res) {
            let value = await this.webapi.order.delete({
                id: data.id,
            })
            if (value) {
                this.loadOrderList()
                //更新企业列表状态
                this.load()
                this.metaAction.sf('data.form.name', '')
            }
        }
    }
    //过滤订单
    orderFilter = async (path, value) => {
        this.metaAction.sf(path, value)
        let entity = {
            orgName: value
        }
        if (this.metaAction.gf('data.payType') != 0) {
            entity.payType = this.metaAction.gf('data.payType')
        }
        if (this.metaAction.gf('data.orderStatus') != 0) {
            entity.orderStatus = this.metaAction.gf('data.orderStatus')
        }
        let res = await this.webapi.order.query({ entity })
        this.injections.reduce('initOrderList', res.list)
    }
    //获取订单列表数据
    getOrderColumnsHead = () => {
        return [{
            columnName: '企业名称',
            id: 'orgName',
            name: 'orgName',
            width: 260
        }, {
            columnName: '订单号',
            id: 'orderNo',
            name: 'orderNo',
            width: 130
        }, {
            columnName: '下单日期',
            id: 'createTime',
            name: 'createTime',
            width: 100
        }, {
            columnName: '支付方式',
            id: 'payType',
            name: 'payType',
            width: 80
        }, {
            columnName: '订单状态',
            id: 'orderStatus',
            name: 'orderStatus',
            width: 80
        }, {
            columnName: '操作',
            id: 'operate',
            name: 'operate',
            width: 200
        }]
    }
    //订单列表跳转到立即购买
    orderGoBuy = (option) => {
        this.component.props.setPortalContent('产品订购', 'ttk-edf-app-buy', option)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
