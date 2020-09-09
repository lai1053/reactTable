import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Select, Modal, Icon, Form, Button } from 'edf-component'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import moment from 'moment'

const FormItem = Form.Item
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', :: this.enlargeClick)
        }
        injections.reduce('init')
        this.initLoad()
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.getTableScroll)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.getTableScroll)
        }
    }

    componetWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.getTableScroll)
        } else if (window.detachEvent) {
            win.detachEvent('onresize', this.getTableScroll)
        }
    }

    enlargeClick = () => {
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    onTabFocus = async () => {
        const entity = this.metaAction.gf('data.searchValue').toJS()
        const page = this.metaAction.gf('data.page').toJS()
        const auth = this.metaAction.gf('data.other.authentication')

        if (auth) {
            entity.uncertFlag = true
        }
        delete page.totalCount
        delete page.totalPage

        this.load({ entity, page })
    }

    initLoad = async () => {
        const entity = this.metaAction.gf('data.searchValue').toJS()
        const page = this.metaAction.gf('data.page').toJS()
        this.load({ entity, page })
    }

    load = async (parmas) => {
        this.injections.reduce('loading', 'data.loading', true)
        // const res = await this.webapi.unauthorized.uncertifiedList(parmas)
        let list = [
            this.webapi.unauthorized.uncertifiedList(parmas),
            this.webapi.unauthorized.getAccountGrade()
        ]
        const result = await Promise.all(list)
        let res = result[0] ? result[0] : {}
        if (res) {
            res.loading = false
            res.gradeSetting = result[1] ? result[1] : {}
            this.injections.reduce('initLoad', res)
        } else {
            this.injections.reduce('loading', 'data.loading', false)
        }

        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    getTableScroll = () => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let dom = document.getElementsByClassName('ttk-scm-app-unauthorized-list-table')[0]
            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num < 74) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - 74
                    }
                    this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                } else { // 当数量太少 不用出现滚动条
                    delete tableOption.y
                    this.injections.reduce('update', { path: 'data.tableOption', value: tableOption })
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

    rowSelection = (text, row, index) => {
        return undefined
    }

    // 发票号码 发票代码
    renderText = (name, rowData, index) => {
        return <div key={index} title={rowData[name]}>{rowData[name]}</div>
    }

    // 金额 税额
    renderTextRight = (name, rowData, path, index) => {
        return <div style={{ textAlign: 'right' }} key={index} title={this.addThousandsPosition(rowData[name], true)}>{this.addThousandsPosition(rowData[name], true)}</div>
    }

    // 千分位格式化
    addThousandsPosition = (input, isFixed) => {
        if (isNaN(input)) return null
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
        return num.replace(regex, "$1,")
    }

    // 操作
    renderOption = (record, index) => {
        let disabled = false

        if (typeof record.sysDeductible === 'boolean') {
            disabled = true
        }
        return (
            <div className='option'>
                <Icon fontFamily='edficon'
                    type='dikou'
                    className='dikou'
                    title='抵扣'
                    disabled={disabled}
                    onClick={disabled ? () => { } : this.handleIsDeductible.bind(null, true, record, 'oneRow')}></Icon>
                <Icon fontFamily='edficon'
                    type='buyudikoutubiao'
                    title='不予抵扣'
                    className='buyudikoutubiao'
                    disabled={disabled}
                    onClick={disabled ? () => { } : this.handleIsDeductible.bind(null, false, record, 'oneRow')}></Icon>
                <Icon fontFamily='edficon'
                    type='chexiaorenzheng'
                    className='chexiaorenzheng'
                    title='撤销认证'
                    disabled={!disabled}
                    onClick={!disabled ? () => { } : this.reauthentication.bind(null, record, 'oneRow')}></Icon>
            </div>
        )
    }

    // 凭证字号
    renderCode = (record, index) => {
        if (record.uncertDocId) {
            return <a href="javascript:;" title={/已生成/.test(record.docCode) ? record.docCode : `${record.docType}-${record.docCode}`} onClick={() => this.openDocContent(record.uncertDocId, record.docCode)}>{/已生成/.test(record.docCode) ? record.docCode : `${record.docType}-${record.docCode}`}</a>
        } else {
            return ''
        }
    }

    openDocContent = (id, docCode) => {
        if (/已生成/.test(docCode)) {
            const code = docCode.replace(/[已生成|凭证]/g, '');
            this.metaAction.toast('error', `请在${code}凭证管理查看生成的凭证`)
        } else {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(
                    '填制凭证',
                    'app-proof-of-charge',
                    { accessType: 1, initData: { id } }
                )
        }
    }

    // 系统认证期间
    renderMoreStatus = (name, value, index) => {
        if (value[name]) {
            return value[name]
        } else {
            return '未认证'
        }
    }
    //税局认证状态
    renderAuthenticated = (name, value, index) => {
        if (value[name]) {
            switch (name) {
                case 'authenticated': return '已认证'
                case 'sysDeductible': return '已抵扣'
            }
        } else {
            if (value[name] == false) {
                switch (name) {
                    case 'authenticated': return '未认证'
                    case 'sysDeductible': return '不予抵扣'
                }
            } else {
                switch (name) {
                    case 'authenticated': return ''
                    case 'sysDeductible': return '未抵扣'
                }
            }
        }
    }

    // 认证状态
    handleChangeAuth = (key) => {
        // let entity = {},
        let entity = this.metaAction.gf('data.searchValue').toJS(),
            page = this.metaAction.gf('data.page').toJS()

        page = {
            currentPage: 1,
            pageSize: page.pageSize || 20
        }

        if (key) {
            delete entity.uncertFlag
            this.load({ entity, page })
        } else {
            entity.uncertFlag = true
            this.load({ entity, page })
        }

        // console.log(entity, page, 'entity')

        const auth = this.metaAction.gf('data.other.authentication')
        this.metaAction.sf('data.other.authentication', !auth)
    }
    //获取orgID
    getCurrentOrg = () => this.metaAction.context.get('currentOrg') || {}

    getOrgId = () => {
        const org = this.getCurrentOrg()
        if (org) {
            return org.id;
        }
        return ""
    }
    // 抵扣 不予抵扣
    handleIsDeductible = async (isDeductible, rowData, type) => {
        const tableCheckbox = this.metaAction.gf('data.tableCheckbox').toJS()
        let selectedOption = tableCheckbox.selectedOption
        const currentOrg = this.metaAction.context.get("currentOrg")
        let periodDate = currentOrg.periodDate
        if (type == 'oneRow') {
            const parmas = {}
            parmas.sysDeductible = isDeductible ? true : false
            parmas.id = rowData.id
            parmas.ts = rowData.ts
            parmas.sysAuthenticate = periodDate ? periodDate : null

            if (typeof rowData.sysDeductible === 'boolean') {
                if (isDeductible && rowData.sysDeductible === true) {
                    this.metaAction.toast('error', '当前没有可抵扣的数据')
                    return
                } else if (isDeductible === false && rowData.sysDeductible === false) {
                    this.metaAction.toast('error', '当前没有不予抵扣的数据')
                    return
                }
            }
            const rescer = await this.webapi.unauthorized.certified([parmas])

            if (rescer) {
                const linkConfig = this.metaAction.context.get('linkConfig');//是否link
                if (linkConfig) {

                    const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`
                    const softAppName = linkConfig.appName;
                    if (rescer.success.length == 0) {
                        //全部失败
                        this.metaAction.toast('error', `${rescer.fail[0].message}`);
                    }
                    if (rescer.success.length > 0) {
                        //获取成功的列表
                        const params = [];
                        rescer.success.forEach(item => {
                            try {
                                item.message = JSON.parse(item.message);
                            } catch (e) {
                                item.message = item.message;
                            }
                            if (typeof item.message === 'object') {
                                params.push(item.message)
                            }
                        });
                        if (params.length === 0) {
                            //税额全部为0
                            let entity = this.metaAction.gf('data.searchValue').toJS()
                            const page = this.metaAction.gf('data.page').toJS()
                            this.injections.reduce('loading', 'data.loading', true)

                            const auth = this.metaAction.gf('data.other.authentication')
                            if (auth) {
                                entity.uncertFlag = true
                            }
                            const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                            if (result) {
                                result.loading = false
                                this.injections.reduce('initLoad', result)
                                this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                            }
                            return
                        }
                        const options = {
                            headers: {
                                token: this.getOrgId()
                            }
                        }

                        const account = await this.webapi.unauthorized.common(`${baseUrl}/common/account/query`, {
                            year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
                        }, {
                                headers: {
                                    token: this.getOrgId()
                                }
                            })
                        await this.webapi.unauthorized.saveAccount(account.value);//saveAccount

                        const url = `${baseUrl}/common/doc/createBatch`;
                        const res = await this.webapi.unauthorized.common(url, params, options);//生成凭证
                        if (res && res.error) {
                            this.metaAction.sf('data.loading', false);
                            this.metaAction.toast('error', `${res.error.message}`);
                        } else if (res && res.result) {
                            if (!res.value.successItems) res.value.successItems = [];
                            if (!res.value.failItems) res.value.failItems = [];
                            //处理失败部分 已经存在视为成功
                            if (res.value.failItems.length > 0) {
                                if (/已经存在/.test(res.value.failItems[0])) {
                                    res.value.successItems.push(res.value.failItems[0].key)
                                } else {
                                    this.metaAction.toast('error', res.value.failItems[0].msg)
                                }
                            }
                            //处理成功部分 
                            if (res.value.successItems.length > 0) {

                                // let item = rescer.success.find(p => p.message.externalCode == res.value.successItems[0]);
                                const successItems = [
                                    {
                                        id: rowData.id,
                                        sysDeductible: isDeductible,
                                        ts: rowData.ts,
                                        uncertDocId: res.value.successItems[0],
                                        sysAuthenticate: periodDate || null
                                    }]
                                const updateres = await this.webapi.unauthorized.certifiedUpdate(successItems);
                                if (updateres.fail.length > 0) {
                                    this.metaAction.toast('error', updateres.fail[0].message)
                                } else {
                                    let entity = this.metaAction.gf('data.searchValue').toJS()
                                    const page = this.metaAction.gf('data.page').toJS()
                                    this.injections.reduce('loading', 'data.loading', true)

                                    const auth = this.metaAction.gf('data.other.authentication')
                                    if (auth) {
                                        entity.uncertFlag = true
                                    }
                                    const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                                    if (result) {
                                        result.loading = false
                                        this.injections.reduce('initLoad', result)
                                        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                        this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                                    }
                                }
                            }
                        } else {
                            this.metaAction.sf('data.loading', false);
                            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                        }
                    }
                } else {
                    if (rescer.success.length != 0) {
                        let entity = this.metaAction.gf('data.searchValue').toJS()
                        const page = this.metaAction.gf('data.page').toJS()
                        this.injections.reduce('loading', 'data.loading', true)

                        const auth = this.metaAction.gf('data.other.authentication')
                        if (auth) {
                            entity.uncertFlag = true
                        }

                        const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                        if (result) {
                            result.loading = false
                            this.injections.reduce('initLoad', result)
                            this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                            this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                        }
                    }
                    // else {
                    if (rescer.fail.length != 0) {
                        //
                        this.metaAction.toast('error', rescer.fail[0].message)
                        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                    }
                    // }
                }
            }

        } else {
            if (tableCheckbox.checkboxValue.length == 0 || tableCheckbox.selectedOption.length == 0) {
                if (isDeductible) {
                    this.metaAction.toast('error', '请选择要抵扣的数据')
                } else {
                    this.metaAction.toast('error', '请选择要不予抵扣的数据')
                }
            } else {

                let list = []
                let deductible = isDeductible ? true : false
                let flag = null
                selectedOption.forEach((item) => {


                    if (typeof item.sysDeductible === "undefined") {

                        //if (item.sysDeductible != deductible) {
                        flag = true
                        //}

                        let obj = { sysDeductible: deductible }
                        obj.id = item.id
                        obj.ts = item.ts
                        obj.sysAuthenticate = periodDate ? periodDate : null
                        list.push(obj)

                    }
                })

                if (!flag) {
                    if (deductible) {
                        this.metaAction.toast('error', '当前没有可抵扣的数据')
                        return
                    } else    /* if (isDeductible === false && rowData.sysDeductible === false || list.length == 0) */ {
                        this.metaAction.toast('error', '当前没有不予抵扣的数据')
                        return
                    }
                }

                const rescer = await this.webapi.unauthorized.certified(list)
                if (rescer) {
                    const linkConfig = this.metaAction.context.get('linkConfig');//是否link
                    if (linkConfig) {

                        const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`
                        const softAppName = linkConfig.appName;
                        let errorList = [];
                        if (rescer.success.length == 0) {
                            //全部失败
                            this.showError(isDeductible ? '抵扣结果' : '不予抵扣结果', rescer.success, rescer.fail)
                        }
                        if (rescer.fail.length > 0) {
                            errorList = errorList.concat(rescer.fail)
                        }
                        if (rescer.success.length > 0) {
                            //获取成功的列表
                            const params = [];
                            rescer.success.forEach(item => {
                                try {
                                    item.message = JSON.parse(item.message);
                                } catch (e) {
                                    item.message = item.message;
                                }

                                if (typeof item.message === 'object') {
                                    params.push(item.message)
                                }
                            });

                            if (params.length === 0) {
                                //税额全部为0
                                if (rescer.success.length != 0) {
                                    let entity = this.metaAction.gf('data.searchValue').toJS()
                                    const page = this.metaAction.gf('data.page').toJS()
                                    this.injections.reduce('loading', 'data.loading', true)

                                    const auth = this.metaAction.gf('data.other.authentication')
                                    if (auth) {
                                        entity.uncertFlag = true
                                    }

                                    const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                                    if (result) {
                                        result.loading = false
                                        this.injections.reduce('initLoad', result)
                                        this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                                        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                    }
                                }
                                // else {
                                if (rescer.fail.length != 0) {
                                    this.showError(isDeductible ? '抵扣结果' : '不予抵扣结果', rescer.success, rescer.fail)
                                    this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                }
                                return
                            }

                            const options = {
                                headers: {
                                    token: this.getOrgId()
                                }
                            }
                            this.injections.reduce('loading', 'data.loading', true)
                            const account = await this.webapi.unauthorized.common(`${baseUrl}/common/account/query`, {
                                year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
                            }, {
                                    headers: {
                                        token: this.getOrgId()
                                    }
                                })
                            await this.webapi.unauthorized.saveAccount(account.value);//saveAccount
                            const url = `${baseUrl}/common/doc/createBatch`;
                            const res = await this.webapi.unauthorized.common(url, params, options);//生成凭证
                            if (res && res.error) {
                                this.metaAction.sf('data.loading', false);
                                this.metaAction.toast('error', `${res.error.message}`);
                            } else if (res && res.result) {
                                if (!res.value.successItems) res.value.successItems = [];
                                if (!res.value.failItems) res.value.failItems = [];
                                //处理失败部分 已经存在视为成功
                                if (res.value.failItems.length > 0) {
                                    res.value.failItems.forEach(fa => {
                                        if (/已经存在/.test(fa.msg)) {
                                            res.value.successItems.push(fa.key);
                                        } else {
                                            errorList.push({
                                                message: `${fa.msg}`
                                            })
                                        }
                                    })
                                }
                                //处理成功部分 
                                if (res.value.successItems.length > 0) {
                                    let successItems = []
                                    res.value.successItems.forEach((o) => {
                                        //let item = list.find(p => p.id == o);
                                        let item = rescer.success.find(p => typeof p.message === 'object' && p.message.externalCode == o);
                                        if (item) {
                                            let ite = list.find(o => o.id == item.id);
                                            successItems.push({
                                                id: ite.id,
                                                sysDeductible: isDeductible,
                                                ts: ite.ts,
                                                uncertDocId: o,
                                                sysAuthenticate: periodDate || null
                                            })
                                        }
                                    })
                                    const updateres = await this.webapi.unauthorized.certifiedUpdate(successItems);
                                    if (updateres.fail.length > 0) {
                                        errorList = errorList.concat(updateres.fail)
                                    }
                                    if (updateres.success.length > 0) {

                                        let entity = this.metaAction.gf('data.searchValue').toJS()
                                        const page = this.metaAction.gf('data.page').toJS()

                                        const auth = this.metaAction.gf('data.other.authentication')
                                        if (auth) {
                                            entity.uncertFlag = true
                                        }

                                        const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                                        if (result) {
                                            result.loading = false
                                            this.injections.reduce('initLoad', result)

                                            this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                        }

                                    }
                                }
                                if (errorList.length > 0) {
                                    this.showError(isDeductible ? '抵扣结果' : '不予抵扣结果', rescer.success, errorList)
                                    this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                } else {
                                    this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                                }

                            } else {
                                this.metaAction.sf('data.loading', false);
                                this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                            }
                        }



                    } else {

                        if (rescer.success.length != 0) {
                            let entity = this.metaAction.gf('data.searchValue').toJS()
                            const page = this.metaAction.gf('data.page').toJS()
                            this.injections.reduce('loading', 'data.loading', true)

                            const auth = this.metaAction.gf('data.other.authentication')
                            if (auth) {
                                entity.uncertFlag = true
                            }

                            const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                            if (result) {
                                result.loading = false
                                this.injections.reduce('initLoad', result)
                                this.metaAction.toast('success', isDeductible ? '抵扣成功' : '不予抵扣成功')
                                this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                            }
                        }
                        // else {
                        if (rescer.fail.length != 0) {
                            this.showError(isDeductible ? '抵扣结果' : '不予抵扣结果', rescer.success, rescer.fail)
                            this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                        }
                        // }
                    }

                }

            }
        }
    }

    // 撤销认证
    reauthentication = async (rowData, type) => {
        const linkConfig = this.metaAction.context.get('linkConfig');//是否link

        if (type == 'oneRow') {
            //单行删除
            const parmas = {
                id: rowData.id,
                ts: rowData.ts
            }
            //删除凭证
            if (linkConfig && rowData.docCode === `已生成${linkConfig.appName}凭证`) {
                const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`
                const softAppName = linkConfig.appName;
                const restplus = await this.webapi.unauthorized.common(`${baseUrl}/common/doc/deleteBatch`,
                    [{
                        externalCode: rowData.uncertDocId
                    }]
                    , {
                        headers: {
                            token: this.getOrgId()
                        }
                    })
                if (restplus && restplus.error) {
                    // this.injections.reduce('tableLoading', false);
                    this.metaAction.toast('error', `${restplus.error.message}`);
                    return
                } else if (restplus && restplus.result) {
                    if (!restplus.value) return
                    let success1 = [];
                    if (!restplus.value.successItems) restplus.value.successItems = [];
                    if (!restplus.value.failItems) restplus.value.failItems = [];

                    if (restplus.value.failItems.length > 0) {
                        if (/不存在/.test(restplus.value.failItems[0].msg)) {
                            restplus.value.successItems.push(restplus.value.failItems[0].key);
                        } else {
                            this.metaAction.toast('error', restplus.value.failItems[0].msg);
                            return
                        }
                    }
                    if (restplus.value.successItems.length > 0) {
                        const res = await this.webapi.unauthorized.removeCertified([parmas])
                        if (res) {
                            if (res.success.length != 0) {
                                let entity = this.metaAction.gf('data.searchValue').toJS()
                                const page = this.metaAction.gf('data.page').toJS()
                                this.injections.reduce('loading', 'data.loading', true)

                                const auth = this.metaAction.gf('data.other.authentication')
                                if (auth) {
                                    entity.uncertFlag = true
                                }

                                const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                                if (result) {
                                    result.loading = false
                                    this.injections.reduce('initLoad', result)
                                    this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                                    this.metaAction.toast('success', '撤销认证成功')
                                }
                            }
                            // else {
                            if (res.fail.length != 0) {
                                this.metaAction.toast('error', res.fail[0].message)
                                this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                            }
                            // }
                        }
                    }
                } else {
                    this.injections.reduce('tableLoading', false);
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                    return
                }
            } else {
                const res = await this.webapi.unauthorized.removeCertified([parmas])
                if (res) {
                    if (res.success.length != 0) {
                        let entity = this.metaAction.gf('data.searchValue').toJS()
                        const page = this.metaAction.gf('data.page').toJS()
                        this.injections.reduce('loading', 'data.loading', true)

                        const auth = this.metaAction.gf('data.other.authentication')
                        if (auth) {
                            entity.uncertFlag = true
                        }

                        const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                        if (result) {
                            result.loading = false
                            this.injections.reduce('initLoad', result)
                            this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                            this.metaAction.toast('success', '撤销认证成功')
                        }
                    }
                    // else {
                    if (res.fail.length != 0) {
                        this.metaAction.toast('error', res.fail[0].message)
                        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                    }
                    // }
                }
            }
        } else {
            //批量删除
            const tableCheckbox = this.metaAction.gf('data.tableCheckbox').toJS()
            const selectedOption = tableCheckbox.selectedOption
            if (tableCheckbox.checkboxValue.length == 0 || tableCheckbox.selectedOption.length == 0) {
                this.metaAction.toast('error', '请选择要撤销认证的数据')
            } else {
                //分开删除
                let data = [];
                let externalCode = [];
                let datatplus = [];

                selectedOption.forEach(item => {
                    if (typeof item.sysDeductible === 'boolean') {
                        //分开删除
                        if (linkConfig && item.docCode === `已生成${linkConfig.appName}凭证`) {
                            datatplus.push(
                                {
                                    id: item.id,
                                    ts: item.ts
                                }
                            )
                            externalCode.push({
                                externalCode: item.uncertDocId
                            })
                        } else {
                            data.push(
                                {
                                    id: item.id,
                                    ts: item.ts
                                }
                            )
                        }
                    }
                })
                if (data.length == 0 && datatplus.length == 0) {
                    this.metaAction.toast('error', '当前没有可撤销认证的数据')
                    return
                }
                let success = [], fail = [];
                if (data.length > 0) {
                    // data = this.delRepeat(data, 'id');
                    const resdata = await this.webapi.unauthorized.removeCertified(data)
                    if (resdata) {
                        fail = fail.concat(resdata.fail);
                        success = success.concat(resdata.success);
                    } else {
                        return
                    }
                }
                if (linkConfig && datatplus.length > 0) {
                    const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`
                    const softAppName = linkConfig.appName;
                    // datatplus = this.delRepeat(datatplus, 'id');
                    //externalCode = this.delRepeat(externalCode, 'externalCode');
                    const restplus = await this.webapi.unauthorized.common(`${baseUrl}/common/doc/deleteBatch`,
                        externalCode
                        , {
                            headers: {
                                token: this.getOrgId()
                            }
                        })
                    if (restplus && restplus.error) {
                        this.injections.reduce('tableLoading', false);
                        this.metaAction.toast('error', `${restplus.error.message}`);
                        return
                    } else if (restplus && restplus.result) {
                        if (!restplus.value) return
                        let success1 = [];
                        if (!restplus.value.successItems) restplus.value.successItems = [];
                        if (!restplus.value.failItems) restplus.value.failItems = [];

                        if (restplus.value.failItems.length > 0) {
                            restplus.value.failItems.forEach(fa => {
                                if (/不存在/.test(fa.msg)) {
                                    restplus.value.successItems.push(fa.key);
                                } else {
                                    fail.push({
                                        message: `${fa.msg}`
                                    })
                                }
                            })
                        }
                        restplus.value.successItems.forEach(o => {
                            let item = selectedOption.find(p => p.uncertDocId == o);
                            success1.push({
                                id: item.id,
                                ts: item.ts
                            });
                        })
                        const res = await this.webapi.unauthorized.removeCertified(success1);
                        this.injections.reduce('loading', 'data.loading', false)
                        if (res) {
                            success = success.concat(res.success);
                            fail = fail.concat(res.fail);
                        }
                    } else {
                        this.injections.reduce('loading', 'data.loading', false)
                        this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                        return
                    }
                }
                if (success.length != 0) {
                    const entity = this.metaAction.gf('data.searchValue').toJS()
                    const page = this.metaAction.gf('data.page').toJS()
                    this.injections.reduce('loading', 'data.loading', true)
                    const result = await this.webapi.unauthorized.uncertifiedList({ entity, page })
                    if (result) {
                        result.loading = false
                        this.injections.reduce('initLoad', result)
                        this.metaAction.toast('success', '撤销认证成功')
                        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                    }
                }
                // else {
                if (fail.length != 0) {
                    this.showError('撤销认证结果', success, fail)
                    this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
                }
                // }


            }
        }
    }

    showError = (title, successArr, failArr) => {
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            // footer: null,
            bodyStyle: { padding: '2px 0 10px 24px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    // 发票号码搜索
    handleInputSearch = (value) => {
        let page = this.metaAction.gf('data.page').toJS()
        // const page = {pageSize: 20, currentPage: 1}
        page = { pageSize: page.pageSize || 20, currentPage: 1 }

        let entity = value ? { invoiceNumber: value } : {}
        const auth = this.metaAction.gf('data.other.authentication')
        if (auth) {
            entity.uncertFlag = true
        }

        // console.log(entity, page, 'search')

        this.load({ entity, page })

        this.metaAction.sf('data.searchValue', fromJS(entity))
    }

    // 高级搜索
    entityChange = (value) => {
        // const page = this.metaAction.gf('data.page').toJS()
        const page = { pageSize: 20, currentPage: 1 }
        let entity = {
            ...value,
            sysAuthenticate: this.metaAction.momentToString(value.sysAuthenticate, 'YYYY-MM-DD'),
        }
        for (let key in entity) {
            if (entity[key] === '') {
                delete entity[key]
            }
        }
        this.load({ entity, page })
        this.metaAction.sf('data.searchValue', fromJS(value))
    }
    // 刷新
    refreshBtnClick = () => {
        // this.initLoad()
        let entity = this.metaAction.gf('data.searchValue').toJS()
        const page = this.metaAction.gf('data.page').toJS()

        for (let key in entity) {
            if (entity[key] === '') {
                delete entity[key]
            }
        }
        this.load({ entity, page })
    }

    // 更多
    moreActionOpeate = (e) => {
        // console.log(e.key, 'e.key')
        if (e.key == 'reauthentication') {
            this.reauthentication && this.reauthentication()
        } else if (e.key == 'subjectSet') {
            this.subjectSet && this.subjectSet()
        }
    }

    // //生成新的科目编码
    // generateNewSubCode = (parentId, parentCode, subjectList) => {
    //     let newCode,
    //         newSubjectList = subjectList.filter(subItem => {
    //             return parseInt(subItem.parentId) == parseInt(parentId)
    //         })

    //     if (newSubjectList.length == 0) {
    //         newCode = '01'
    //     } else {
    //         let endGradeList = []
    //         for (var i = 0; i < newSubjectList.length; i++) {
    //             let code = newSubjectList[i].code
    //             endGradeList.push(code.substring(code.length - 2))
    //         }

    //         // endGradeList = endGradeList.sort(sortNumber)
    //         endGradeList = endGradeList.sort((a, b) => a-b)

    //         let maxCode = endGradeList[endGradeList.length - 1]
    //         if (maxCode == '99' && endGradeList.length < 98) {
    //             maxCode = endGradeList[endGradeList.length - 2]
    //             if (!isNaN(maxCode)) {
    //                 newCode = '00' + (parseInt(maxCode) + 1).toString()
    //                 newCode = newCode.substring(newCode.length - 2)
    //             } else {
    //                 newCode = '00'
    //             }
    //         } else if (maxCode != '99' && !isNaN(maxCode)) {
    //             newCode = '00' + (parseInt(maxCode) + 1).toString()
    //             newCode = newCode.substring(newCode.length - 2)
    //         } else {
    //             newCode = '00'
    //         }
    //     }
    //     return newCode
    // }

    //num传入的数字，n需要的字符长度
    PrefixInteger = (num, n) => {
        return (Array(n).join(0) + num).slice(-n);
    }
    // //生成新的科目编码
    generateNewSubCode = (parentId, parentCode, subjectList, parentGrade, gradeList) => {
        let newCode,
            grade = Object.keys(gradeList),
            newSubjectList = subjectList.filter(subItem => {
                return parseInt(subItem.parentId) == parseInt(parentId)
            }),
            item = grade.find(item => `${item}`.charAt(item.length - 1) == parentGrade + 1)
        if (newSubjectList.length == 0) {
            newCode = this.PrefixInteger('1', gradeList[item])
        } else {
            let endGradeList = []
            for (var i = 0; i < newSubjectList.length; i++) {
                let code = newSubjectList[i].code
                endGradeList.push(code.substring(code.length - parentGrade - 1))
            }
            endGradeList = endGradeList.sort((a, b) => a - b)
            let maxCode = endGradeList[endGradeList.length - 1]

            if (maxCode == (Array(maxCode.length).join(9) + '9') && endGradeList.length < Array(maxCode.length).join(9) + '9' - 1) {
                maxCode = endGradeList[endGradeList.length - 2]
                if (!isNaN(maxCode)) {
                    newCode = this.PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
                } else {
                    newCode = this.PrefixInteger('0', gradeList[item])
                }
            } else if (maxCode != '99' && !isNaN(maxCode)) {
                newCode = this.PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
            } else {
                newCode = this.PrefixInteger('0', gradeList[item])
            }
        }
        return newCode
    }

    // 新增科目
    addSubjects = async (type) => {
        let data = this.metaAction.gf('data.nodeSubject').toJS()
        let list = this.metaAction.gf('data.queryList').toJS()
        const { id, code, grade } = data
        const gradeList = this.metaAction.gf('data.gradeSetting').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'add',
                // columnCode: "subjects",
                newCode: this.generateNewSubCode(id, code, list, grade, gradeList),
                data: data,
            })
        })

        if (ret) {
            if (ret.isEnable && ret.isEndNode) {
                let certifiedList = this.metaAction.gf('data.certifiedList').toJS()
                if (type == 'taxs') {
                    certifiedList[0].accountCode = ret.code
                } else if (type == 'taxTurnover') {
                    certifiedList[1].accountCode = ret.code
                }
                list.push(ret)
                // this.injections.reduce('loading', 'data.certifiedList', fromJS(certifiedList))
                this.metaAction.sfs({
                    'data.certifiedList': fromJS(certifiedList),
                    'data.queryList': fromJS(list)
                })
                return ret
            } else {
                list.push(ret)
                this.metaAction.sfs({
                    'data.queryList': fromJS(list)
                })
            }
        }
    }

    // 科目设置
    subjectSet = async () => {

        const linkConfig = this.metaAction.context.get('linkConfig');//是否link
        if (linkConfig) {

            const baseUrl = `${document.location.protocol}//${linkConfig.foreseeClientHost}`
            const softAppName = linkConfig.appName;
            const requestList = [
                this.webapi.unauthorized.common(`${baseUrl}/common/account/query`, {
                    year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY')
                }, {
                        headers: {
                            token: this.getOrgId()
                        }
                    }),
                this.webapi.unauthorized.queryCertified(),
            ]
            const resList = await Promise.all(requestList)
            let list = []
            if (resList) {
                if (resList[0].result) {
                    list = resList[0].value;
                    list.forEach(o => {
                        o.codeAndName = o.code + " " + o.name
                    })
                } else if (resList[0].error) {
                    this.metaAction.toast('error', resList[0].error.message)
                } else {
                    this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
                }
                this.metaAction.sfs({
                    'data.certifiedList': fromJS(resList[1]),
                    'data.queryList': fromJS(list),
                    'data.nodeSubject': fromJS({})
                })
            }
            const certifiedList = resList[1] || []
            let defaultValueTaxs = !!certifiedList[0] && certifiedList[0].accountCode ? certifiedList[0].accountCode : '';
            let defaultValueTurnTax = !!certifiedList[1] && certifiedList[1].accountCode ? certifiedList[1].accountCode : '';
            if (defaultValueTaxs && !list.find(o => o.code == defaultValueTaxs)) {
                defaultValueTaxs = ''
            }
            if (defaultValueTurnTax && !list.find(o => o.code == defaultValueTurnTax)) {
                defaultValueTurnTax = ''
            }

            const ret = await this.metaAction.modal('show', {
                title: '自定义科目',
                width: 470,
                bodyStyle: { padding: 6, fontSize: 12 },
                wrapClassName: 'subjectSetClass',
                children: <TipContnet
                    defaultValueTaxs={defaultValueTaxs}
                    defaultValueTurnTax={defaultValueTurnTax}
                    onChange={this.handleOnChange}
                    addSubjects={this.addSubjects}
                    list={list}
                    hideAddButton={true}
                >
                </TipContnet>
            })

            if (ret) {
                let certifiedList = this.metaAction.gf('data.certifiedList').toJS()
                certifiedList.forEach(item => {
                    delete item.accountName
                })

                const response = await this.webapi.unauthorized.saveCertified(certifiedList)
                if (response) {
                    this.metaAction.toast('success', '设置成功')
                }
            }
        } else {
            const requestList = [
                // this.webapi.unauthorized.query({"isEndNode": true,"isEnable": true }),
                this.webapi.unauthorized.query({}),
                this.webapi.unauthorized.queryCertified(),
            ]

            const resList = await Promise.all(requestList)
            let list = []
            let nodeSubject = null
            if (resList) {
                const result = resList[0] && resList[0]
                let reg = new RegExp("^2221")
                let allList = []
                if (result) {
                    let glAccounts = result.glAccounts
                    allList = glAccounts
                    list = glAccounts.filter(obj => reg.test(obj.code))
                    nodeSubject = list[0]
                    list = list.filter(item => item.isEndNode && item.isEnable)
                }

                this.metaAction.sfs({
                    'data.certifiedList': fromJS(resList[1]),
                    'data.queryList': fromJS(allList),
                    'data.nodeSubject': fromJS(nodeSubject)
                })
            }

            const certifiedList = resList[1] || []
            let defaultValueTaxs = !!certifiedList[0] && certifiedList[0].accountCode ? certifiedList[0].accountCode : '';
            let defaultValueTurnTax = !!certifiedList[1] && certifiedList[1].accountCode ? certifiedList[1].accountCode : '';
            if (defaultValueTaxs && !list.find(o => o.code == defaultValueTaxs)) {
                defaultValueTaxs = ''
            }
            if (defaultValueTurnTax && !list.find(o => o.code == defaultValueTurnTax)) {
                defaultValueTurnTax = ''
            }
            const ret = await this.metaAction.modal('show', {
                title: '自定义科目',
                width: 470,
                bodyStyle: { padding: 6, fontSize: 12 },
                wrapClassName: 'subjectSetClass',
                children: <TipContnet
                    defaultValueTaxs={defaultValueTaxs}
                    defaultValueTurnTax={defaultValueTurnTax}
                    onChange={this.handleOnChange}
                    addSubjects={this.addSubjects}
                    list={list}>
                </TipContnet>
            })

            if (ret) {
                let certifiedList = this.metaAction.gf('data.certifiedList').toJS()
                certifiedList.forEach(item => {
                    delete item.accountName
                })

                const response = await this.webapi.unauthorized.saveCertified(certifiedList)
                if (response) {
                    this.metaAction.toast('success', '设置成功')
                }
            }
        }


    }

    handleOnChange = (value, type) => {
        let certifiedList = this.metaAction.gf('data.certifiedList').toJS(),
            queryList = this.metaAction.gf('data.queryList').toJS()

        if (type == 'taxs') {
            certifiedList[0].accountCode = value
            queryList.forEach(obj => {
                if (obj.code == value) {
                    certifiedList[0].accountId = obj.id
                }
            })

        } else if (type == 'taxTurnover') {
            certifiedList[1].accountCode = value
            queryList.forEach(obj => {
                if (obj.code == value) {
                    certifiedList[1].accountId = obj.id
                }
            })
        }
        this.injections.reduce('loading', 'data.certifiedList', fromJS(certifiedList))
        return certifiedList
    }

    // 触发高级搜索
    searchValueChange = (value) => {
        // console.log(value, '触发高级搜索');
        this.injections.reduce('update', { path: 'data.searchValue', value: value })
    }

    // 分页
    pageChanged = (current, size) => {
        let page = this.metaAction.gf('data.page').toJS()
        const length = this.metaAction.gf('data.list').toJS()
        let entity = this.metaAction.gf('data.searchValue').toJS()

        const auth = this.metaAction.gf('data.other.authentication')
        if (auth) {
            entity.uncertFlag = true
        } else {
            delete entity.uncertFlag
        }

        if (size) {
            page = {
                ...page,
                'currentPage': length ? current : 1,
                'pageSize': size
            }
        } else {
            page = {
                ...page,
                'currentPage': length ? current : 1
            }
        }
        this.load({ entity, page })
        this.injections.reduce('update', { path: 'data.tableCheckbox', value: { checkboxValue: [], selectedOption: [] } })
    }

    // 勾选
    checkboxChange = (arr, itemArr) => {
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: arr,
                selectedOption: itemArr
            }
        })
    }
}

class TipContnet extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: props.list,
            defaultValueTaxs: props.defaultValueTaxs,
            defaultValueTurnTax: props.defaultValueTurnTax,
        }
    }
    handleClick = async (type) => {
        const { addSubjects } = this.props
        const res = await addSubjects(type)
        if (res) {
            let { list, defaultValueTaxs, defaultValueTurnTax } = this.state
            list.push(res)

            if (type == 'taxs') {
                defaultValueTaxs = res.code
            } else if (type == 'taxTurnover') {
                defaultValueTurnTax = res.code
            }

            this.setState({
                list: list,
                defaultValueTaxs: defaultValueTaxs,
                defaultValueTurnTax: defaultValueTurnTax
            })
        }
    }

    handleChange = (value, type) => {
        const result = this.props.onChange(value, type)
        let { defaultValueTaxs, defaultValueTurnTax } = this.state
        if (type == 'taxs') {
            defaultValueTaxs = result[0].accountCode
            this.setState({
                defaultValueTaxs: defaultValueTaxs
            })
        } else if (type == 'taxTurnover') {
            defaultValueTurnTax = result[1].accountCode
            this.setState({
                defaultValueTurnTax: defaultValueTurnTax
            })
        }
    }

    filterOption = (inputValue, option) => {
        inputValue = inputValue.replace(/\\/g, "\\\\")
        if (!option || !option.props) {
            return false
        }
        const { list } = this.state
        let paramsValue = list.find(item => item.code == (option.key))
        if (!paramsValue) {
            return false
        }
        let regExp = new RegExp(inputValue, 'i')
        return paramsValue.name.search(regExp) != -1
            || (paramsValue.code && paramsValue.code.search(regExp) != -1)
            || (paramsValue.helpCode && paramsValue.helpCode.search(regExp) != -1) // TODO 只支持助记码搜索，简拼
            || (paramsValue.helpCodeFull && paramsValue.helpCodeFull.search(regExp) != -1)
    }
    render() {
        const { onChange, addSubjects } = this.props
        const { defaultValueTaxs, defaultValueTurnTax, list } = this.state

        return <div>
            <Form>
                <FormItem label='未认证进项税额'>
                    <Select
                        value={defaultValueTaxs}
                        // onChange={(e) => onChange(e, 'taxs')}
                        onChange={(e) => this.handleChange(e, 'taxs')}
                        filterOption={(v, option) => this.filterOption(v, option)}
                        dropdownFooter={
                            !this.props.hideAddButton && <Button type='primary'
                                onClick={() => this.handleClick('taxs')}
                                // onClick={() => addSubjects('taxs')}
                                style={{ width: '100%', borderRadius: '0' }}>新增
                        </Button>}>
                        {
                            list.map((item, index) => {
                                return <Option key={item.code} title={item.codeAndName}>{item.codeAndName}</Option>
                            })
                        }
                    </Select>
                </FormItem>
                <div>
                    <div style={{ display: 'inline-block' }}></div>
                    <span className='decritionSpan'>注：系统预制 应交税费-待认证进项税额</span>
                </div>
                <FormItem label='进项税额转出'>
                    <Select
                        value={defaultValueTurnTax}
                        // onChange={(e) => onChange(e, 'taxTurnover')}
                        onChange={(e) => this.handleChange(e, 'taxTurnover')}
                        filterOption={(v, option) => this.filterOption(v, option)}
                        dropdownFooter={
                            !this.props.hideAddButton && <Button type='primary'
                                // onClick={() => addSubjects('taxTurnover')}
                                onClick={() => this.handleClick('taxTurnover')}
                                style={{ width: '100%', borderRadius: '0' }}>新增
                        </Button>}>
                        {
                            list.map((item, index) => {
                                return <Option key={item.code} title={item.codeAndName}>{item.codeAndName}</Option>
                            })
                        }
                    </Select>
                </FormItem>
                <div style={{ height: '24px' }}>
                    <div style={{ display: 'inline-block' }}></div>
                    <span className='decritionSpan'>注：系统预制 应交税费-应交增值税-进项税额转出</span>
                </div>
            </Form>
        </div>
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}