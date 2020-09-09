import React from 'react'
import { Form, Radio, Button, Table, Input, Select } from 'edf-component'
import CurrentModel from './currentAccountModel'
import CurrentAccountBatch from './currentAccountBatch'
const RadioGroup = Radio.Group;
let oldArr = []

class currentAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            radio: props.queryAccount && props.queryAccount.noMachedList.length ? 0 : 1,
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            },
            tableOption: {
                x: 1,
                y: null
            },
            batchSelect: props.vatOrEntry ? 3000150004 : 3000150001,
            loading: false,
        }
    }
    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (keyRandom == this.keyRandom) {
                this.getTableScroll()
            }
        }, 200)
    }
    getTableScroll = (e) => {
        try {
            let tableOption = this.state.tableOption;
            let domContainer = document.getElementsByClassName('ttk-scm-app-collate-invoice-form-current')[0];
            let tableWrapperDom = domContainer.getElementsByClassName('ant-table-wrapper')[0];
            //table wrapper包含整个table,table的高度计算要基于这个dom，所以要设置好tableWrapperDom的高度

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table无滚动时有1个table包含theadDom和tbodyDom
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tableWrapperDom && theadDom && tbodyDom) {
                let num = tableWrapperDom.offsetHeight - theadDom.offsetHeight - tbodyDom.offsetHeight;

                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.setState({
                        tableOption: {
                            ...tableOption,
                            y: height - theadDom.offsetHeight,//9是由于theadDom tbodyDom与父元素的差值
                            x: width - 8
                        }
                    })
                } else {
                    delete tableOption.y;

                    this.setState({
                        tableOption: {
                            ...tableOption,
                            x: width
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        this.onResize()

        this.setState({
            ...this.props
        })

        oldArr = this.props.queryAccount
    }
    componentWillUnmount = () => {

        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined;
        }

    }

    //父组件点保存
    handleSave = async (isChange) => {
        const { queryAccount, vatOrEntry, webapi, wlneedList, metaAction } = this.state;
        const allList = queryAccount.allList
        let filter = []
        if (!allList.length) return true

        this.setState({
            loading: true
        })
        if (vatOrEntry) {
            allList.map(item => {
                if (item.accountId) {
                    if (item.accountTypeList.length == 2) {   // 两种结算方式
                        item.accountTypeList.map((m, n) => {
                            filter.push({
                                id: n == 1 ? item.puSupplierId : item.supplierId,
                                payableAccountId: item.accountId,
                                payableInAdvanceAccountId: item.accountId
                            })
                        })
                    } else if (item.accountTypeList.length == 1) {
                        for (var j = 0; j < 2; j++) {
                            if (item.accountTypeList[0] == 3000150004) {
                                filter.push({
                                    id: j == 1 ? item.puSupplierId : item.supplierId,
                                    payableAccountId: item.accountId
                                })
                            } else {
                                filter.push({
                                    id: j == 1 ? item.puSupplierId : item.supplierId,
                                    payableInAdvanceAccountId: item.accountId
                                })
                            }
                        }
                    }

                }
            })
        } else {
            allList.map(item => {
                if (item.accountId) {
                    if (item.accountTypeList.length == 2) {   // 两种结算方式
                        item.accountTypeList.map((m, n) => {
                            filter.push({
                                id: n == 1 ? item.saCustomerId : item.customerId,
                                receivableAccountId: item.accountId,
                                receivableInAdvanceAccountId: item.accountId,
                            })
                        })
                    } else if (item.accountTypeList.length == 1) {
                        for (var j = 0; j < 2; j++) {
                            if (item.accountTypeList[0] == 3000150001) {
                                filter.push({
                                    id: j == 1 ? item.saCustomerId : item.customerId,
                                    receivableAccountId: item.accountId
                                })
                            } else {
                                filter.push({
                                    id: j == 1 ? item.saCustomerId : item.customerId,
                                    receivableInAdvanceAccountId: item.accountId
                                })
                            }
                        }
                    }
                }
            })
        }
        let res
        if (vatOrEntry) {
            res = await webapi.saveSupplierAccountBatch(filter)
        } else {
            res = await webapi.saveCustomerAccountBatch(filter)
        }
        if (res) {
            // 未匹配数据不跳到全部
            if (isChange == 'isChange') {
                let query
                if (vatOrEntry) {
                    query = await webapi.queryAccountPu({ list: wlneedList })
                } else {
                    query = await webapi.queryAccountSa({ list: wlneedList })
                }
                if (query) {
                    this.setState({
                        queryAccount: query
                    })
                }
            } else {
                metaAction.toast('success', '保存成功')
            }
        }
        this.setState({
            loading: false
        })
        return true
    }
    //父组件点下一步
    handleNextStep = async (option) => {
        const { queryAccount, vatOrEntry, webapi, wlneedList, metaAction } = this.state
        const allList = queryAccount.allList;
        const noMachedList = queryAccount.noMachedList;
        if (allList.length > 0) {
            for (var i = 0; i < allList.length; i++) {
                if (allList[i].accountId == '') {
                    if (vatOrEntry) {
                        metaAction.toast('error', '请匹配销方名称对应的往来科目')
                    } else {
                        metaAction.toast('error', '请匹配购方名称对应的往来科目')
                    }
                    this.setState({
                        loading: false
                    })
                    return false
                }
            }
        }

        if (noMachedList.length > 0) {
            for (var i = 0; i < noMachedList.length; i++) {
                if (noMachedList[i].accountId == '') {
                    if (vatOrEntry) {
                        metaAction.toast('error', '请匹配销方名称对应的往来科目')
                    } else {
                        metaAction.toast('error', '请匹配购方名称对应的往来科目')
                    }
                    this.setState({
                        loading: false
                    })
                    return false
                }
            }
        }
        if (!allList.length) return true
        this.setState({
            loading: true
        })
        let filter = []
        this.isHave = false

        if (vatOrEntry) {
            allList.map(item => {
                if (item.accountId) {
                    if (item.accountTypeList.length == 2) {   // 两种结算方式
                        item.accountTypeList.map((m, n) => {
                            filter.push({
                                id: n == 1 ? item.puSupplierId : item.supplierId,
                                payableAccountId: item.accountId,
                                payableInAdvanceAccountId: item.accountId
                            })
                        })
                    } else if (item.accountTypeList.length == 1) {
                        for (var j = 0; j < 2; j++) {
                            if (item.accountTypeList[0] == 3000150004) {
                                filter.push({
                                    id: j == 1 ? item.puSupplierId : item.supplierId,
                                    payableAccountId: item.accountId
                                })
                            } else {
                                filter.push({
                                    id: j == 1 ? item.puSupplierId : item.supplierId,
                                    payableInAdvanceAccountId: item.accountId
                                })
                            }
                        }
                    }

                }
            })
        } else {
            allList.map(item => {
                if (item.accountId) {
                    if (item.accountTypeList.length == 2) {   // 两种结算方式
                        item.accountTypeList.map((m, n) => {
                            filter.push({
                                id: n == 1 ? item.saCustomerId : item.customerId,
                                receivableAccountId: item.accountId,
                                receivableInAdvanceAccountId: item.accountId,
                            })
                        })
                    } else if (item.accountTypeList.length == 1) {
                        for (var j = 0; j < 2; j++) {
                            if (item.accountTypeList[0] == 3000150001) {
                                filter.push({
                                    id: j == 1 ? item.saCustomerId : item.customerId,
                                    receivableAccountId: item.accountId
                                })
                            } else {
                                filter.push({
                                    id: j == 1 ? item.saCustomerId : item.customerId,
                                    receivableInAdvanceAccountId: item.accountId
                                })
                            }
                        }
                    }
                }
            })
        }
        let res
        if (vatOrEntry) {
            res = await webapi.saveSupplierAccountBatch(filter)
        } else {
            res = await webapi.saveCustomerAccountBatch(filter)
        }
        if (res) {
            let query
            if (vatOrEntry) {
                query = await webapi.queryAccountPu({ list: wlneedList })
            } else {
                query = await webapi.queryAccountSa({ list: wlneedList })
            }
            if (query) {
                this.setState({
                    queryAccount: query,
                    searchContent: null
                })
            }

            // 搜索后，，重新获取全部
            if (!query.allList.length) return true
            query.allList.map(item => {
                if (!item.accountId) this.isHave = true
            })

            if (this.isHave) {
                if (vatOrEntry) {
                    metaAction.toast('error', '请匹配销方名称对应的往来科目')
                } else {
                    metaAction.toast('error', '请匹配购方名称对应的往来科目')
                }
                this.setState({
                    loading: false
                })
                return false
            }
        }
        this.setState({
            loading: false
        })
        return true
    }

    // 列表修改科目
    changeAccount = (value, index) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        if (value == undefined) value = ''

        const { radio, queryAccount } = this.state
        if (radio) {
            queryAccount.allList[index].accountId = value
            queryAccount.noMachedList.map((i, x) => {
                if (queryAccount.allList[index].id == i.id) {
                    queryAccount.noMachedList[x].accountId = value
                }
            })
        } else {
            queryAccount.noMachedList[index].accountId = value
            queryAccount.allList.map((i, x) => {
                if (queryAccount.noMachedList[index].id == i.id) {
                    queryAccount.allList[x].accountId = value
                }
            })
        }

        if (value == '' && radio != 0) {
            queryAccount.noMachedList.push(queryAccount.allList[index])
        } else if (value && radio != 0) {
            let noId = queryAccount.allList[index].accountId
            for (var i = 0; i < queryAccount.noMachedList.length; i++) {
                if (queryAccount.noMachedList[i].accountId == noId) {
                    queryAccount.noMachedList.splice(i, 1);
                }
            }
        }

        oldArr = queryAccount
        this.setState({
            queryAccount: queryAccount
        })
    }
    // 新增科目
    addSubject = async (index) => {
        const { metaAction, store, vatOrEntry, webapi, queryAccount, radio } = this.state

        let sonListByPidList = []
        for (var i = 0; i < queryAccount.parentAccounts.length; i++) {
            sonListByPidList.push(queryAccount.parentAccounts[i].id)
        }
        const ret = await metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: store,
                columnCode: "subjects",
                active: 'archives',
                initData: {
                    sonListByPidList,
                }
            })
        })
        if (ret) {
            let subjectListParameter

            if (vatOrEntry) {
                //进项
                subjectListParameter = ["应付账款", "预付账款","其他应收款","其他应付款"]
            } else {
                subjectListParameter = ["应收账款", "预收账款", "其他应收款"]
            }
            const subject = await webapi.getSubject(subjectListParameter)

            this.setState({
                subject: subject,
            })
            let item = subject.find(o => o.id === ret.id);
            if (item) {
                //新增成功
                //this.changeAccount(ret.id, index)
                this.handleData(subject, index, ret.id);
            }

        }
    }

    handleData = (subject = [], index, v) => {
        //列表数据的处理
        let queryAccount = this.state.queryAccount
        let { allList, noMachedList } = queryAccount;
        let radio = this.state.radio;
        if (radio) {
            allList[index].accountId = v;
        } else {
            let id = noMachedList[index].id;
            let rowIndex = allList.findIndex(o => o.id == id);
            allList[rowIndex].accountId = v;
        }
        let list = []
        allList.forEach((o, index) => {
            let flag = subject.find(a => a.id == o.accountId);
            if (!flag) {
                o.accountId = null;
                list.push(o)
            }
        })
        queryAccount.allList = allList
        queryAccount.noMachedList = list
        this.setState({
            queryAccount
        })
    }

    getAccountOption = () => {
        const { subject } = this.state
        if (!subject) return

        return subject.map(item => {
            return <Option title={item.codeAndName} value={item.id}>{item.codeAndName}</Option>
        })
    }

    // 关联供应商档案
    toSupplier = async (index) => {
        const { metaAction, store, webapi, vatOrEntry, setCancelLister,
            setOkListener, queryAccount, radio, wlneedList } = this.state
        let ret, modelList, list, id, relationId, removeId

        if (radio) {
            list = queryAccount.allList
        } else {
            list = queryAccount.noMachedList
        }
        removeId = list[index].id
        if (vatOrEntry) {
            id = list[index].supplierId
            relationId = list[index].relationId
            ret = await webapi.getSupplierOption()
            modelList = await webapi.getSupplier({ supplierId: id })
        } else {
            id = list[index].customerId
            relationId = list[index].relationId
            ret = await webapi.getCustomerOption()
            modelList = await webapi.getCustomer({ customerId: id })
        }

        const res = await metaAction.modal('show', {
            title: vatOrEntry ? '关联供应商档案' : '关联客户档案',
            width: 550,
            wrapClassName: 'currentAccountCss',
            children: <CurrentModel
                metaAction={metaAction}
                store={store}
                webapi={webapi}
                selectOption={ret.list}
                list={modelList}
                vatOrEntry={vatOrEntry}
                setOkListener={setOkListener}
                setCancelLister={setCancelLister}
                id={id}
                relationId={relationId} />
        })
        if (res) {
            let update, filter, query
            res.map((item, index) => delete res[index].name)
            if (vatOrEntry) {
                update = await webapi.updateSupplier(res)
            } else {
                update = await webapi.updateCustomer(res)
            }
            if (update) {
                let subjectListParameter, subject
                if (vatOrEntry) {
                    filter = { list: wlneedList }
                    subjectListParameter = ["应付账款", "预付账款","其他应收款","其他应付款"]
                    query = await webapi.queryAccountPu(filter)
                    subject = await webapi.getSubject(subjectListParameter)
                } else {
                    filter = { list: wlneedList }
                    subjectListParameter = ["应收账款", "预收账款", "其他应收款"]
                    query = await webapi.queryAccountSa(filter)
                    subject = await webapi.getSubject(subjectListParameter)
                }
                // && oldArr.allList[i].id != removeId
                for (var i = 0; i < oldArr.allList.length; i++) {
                    for (var j = 0; j < query.allList.length; j++) {
                        if (oldArr.allList[i].id == query.allList[j].id) {
                            if (oldArr.allList[i].accountId == '') {
                                query.allList[j].accountId = ''
                                // query.noMachedList.push(query.allList[j])
                            }
                        }
                    }
                }

                query.noMachedList = []
                for (var y = 0; y < query.allList.length; y++) {
                    if (query.allList[y].accountId == undefined) {
                        query.allList[y].accountId = ''
                    }
                }
                for (var y = 0; y < oldArr.noMachedList.length; y++) {
                    for (var z = 0; z < query.allList.length; z++) {
                        if (oldArr.noMachedList[y].id == query.allList[z].id) {
                            query.allList[z].accountId = oldArr.noMachedList[y].accountId
                            query.noMachedList.push(query.allList[z])
                        }
                    }
                }
                // for(var y= 0;y<query.allList.length;y++) {
                //     if(query.allList[y].accountId == '') {
                //         query.noMachedList.push(query.allList[y])
                //     }
                // }
                oldArr = query
                this.setState({
                    subject: subject,
                    queryAccount: query
                })
            }
        }
    }
    getContent = (text, record, index, type) => {
        const { queryAccount, vatOrEntry } = this.state
        let obj
        if (type == 'accountId') {
            obj = {
                children:
                    <div style={{ width: '95%' }}>
                        <Select style={{ width: '100%' }}
                            value={record.accountId}
                            onChange={(value) => this.changeAccount(value, index)}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            dropdownClassName='accountSubjectClass'
                            allowClear={true}
                            className={record.accountId ? '' : 'has-error'}
                            dropdownFooter={
                                <Button type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.addSubject(index)}>新增科目
                            </Button>
                            }>
                            {this.getAccountOption()}
                        </Select>
                    </div>,
                props: { colSpan: 1 }
            }
        } else {
            obj = {
                children: <div>
                    <span className={(record[type] == record.supplierName || record[type] == record.customerName) ? 'relateSpan11' : 'relateSpan'}
                        title={record[type]}>
                        {record[type]}</span>
                    {vatOrEntry ? <span className='col-supplier relateSpan2' title={record[type] == record.supplierName ? '' : record.supplierName}>
                        {record[type] == record.supplierName ? '' : record.supplierName}</span> :
                        <span className='col-supplier relateSpan2' title={record[type] == record.customerName ? '' : record.customerName}>
                            {record[type] == record.customerName ? '' : record.customerName}</span>}
                    <a className='col-supplier relateSpan3'
                        onClick={() => this.toSupplier(index)}>{vatOrEntry ? '关联供应商档案' : '关联客户档案'}</a>
                </div>,
                props: { colSpan: 1 }
            }
        }
        return obj
    }

    // 搜索列表
    handleSearch = async (value) => {
        let filter = {}, searchAccount
        const { webapi, wlneedList, vatOrEntry } = this.state

        if (vatOrEntry) {
            filter = {
                invoiceSupplierName: value == undefined ? null : value,
                list: wlneedList
            }
            searchAccount = await webapi.queryAccountPu(filter)
        } else {
            filter = {
                invoiceCustomerName: value == undefined ? null : value,
                list: wlneedList
            }
            searchAccount = await webapi.queryAccountSa(filter)
        }

        for (var i = 0; i < oldArr.allList.length; i++) {
            for (var j = 0; j < searchAccount.allList.length; j++) {
                if (oldArr.allList[i].id == searchAccount.allList[j].id) {
                    searchAccount.allList[j] = oldArr.allList[i]
                }
            }
        }

        for (var i = 0; i < oldArr.noMachedList.length; i++) {
            for (var j = 0; j < searchAccount.allList.length; j++) {
                if (oldArr.noMachedList[i].id == searchAccount.allList[j].id) {
                    searchAccount.noMachedList.push(searchAccount.allList[j])
                }
            }
        }

        this.setState({
            queryAccount: searchAccount
        })

        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }
    handleInputChange = (e) => {
        let value = e.target.value
        this.setState({ searchContent: value })
        let keyRandom = Math.floor(Math.random() * 10000000)
        this.keyRandom = keyRandom
        clearTimeout(this.time)
        this.time = setTimeout(() => {
            if (keyRandom == this.keyRandom) {
                this.handleSearch(value)
            }
        }, 100)
    }

    checkboxChange = (arr, itemArr) => {
        this.setState({
            tableCheckbox: {
                checkboxValue: arr,
                selectedOption: itemArr,
            }
        })
    }
    // 自动生成往来科目
    getAutomaticAccount = async () => {
        const { vatOrEntry, metaAction, tableCheckbox, webapi, wlneedList } = this.state
        if (!tableCheckbox.checkboxValue.length) {
            metaAction.toast('error', '请选择自动生成往来科目的发票')
            return false
        }

        let parmas = vatOrEntry ? ["应付账款", "预付账款", "其他应收款", "其他应付款"] : ["应收账款", "预收账款"]

        const res = await webapi.queryAccountByNameAutomatic(parmas)
        const ret = await metaAction.modal('show', {
            title: '自动生成往来科目',
            width: 494,
            wrapClassName: 'currentBatchCss',
            children: <CurrentAccountBatch
                vatOrEntry={vatOrEntry} list={res || []} />
        })
        if (ret) {
            let filter = [], filter11, relating = [], list
            const selectedOption = tableCheckbox.selectedOption
            const { radio, queryAccount } = this.state

            if (radio) {
                list = queryAccount.allList
            } else {
                list = queryAccount.noMachedList
            }

            if (vatOrEntry) {
                selectedOption.map(item => {
                    // 明细 有两种结算方式
                    if (item.accountTypeList.length == 2) {
                        if (item.accountTypeList[0] == ret.accountTypeId) {
                            relating.push(item.accountTypeList[1])
                        } else {
                            relating.push(item.accountTypeList[0])
                        }
                        filter.push({
                            supplierId: item.supplierId,
                            accountClassificationId: ret.accountTypeId,
                            archiveName: item.supplierName,
                            relatingAccountClassificationIdList: relating
                        })
                    } else {
                        // 明细 有1种结算方式
                        if (item.accountTypeList[0] == ret.accountTypeId) {
                            filter.push({
                                supplierId: item.supplierId,
                                accountClassificationId: ret.accountTypeId,
                                archiveName: item.supplierName,
                            })
                        } else {
                            relating.push(item.accountTypeList[0])
                            filter.push({
                                supplierId: item.supplierId,
                                accountClassificationId: ret.accountTypeId,
                                archiveName: item.supplierName,
                                relatingAccountClassificationIdList: relating
                            })
                        }
                    }
                })
                let parmas = {
                    dtoList: filter,
                    specifiedAccountId: ret.id
                }
                const res = await webapi.setAccountSupplier(parmas)
                if (res) {
                    // 进项更新科目
                    const subjectListParameter = ["应付账款", "预付账款","其他应收款","其他应付款"]

                    const subject = await webapi.getSubject(subjectListParameter)
                    if (subject) {
                        this.setState({
                            subject: subject
                        })
                    }

                    if (res && res.length != 0) {
                        for (var x = 0; x < list.length; x++) {
                            for (var y = 0; y < res.length; y++) {
                                if (list[x].supplierId == res[y].supplierId) {
                                    this.changeAccount(res[y].accountId, x)
                                }
                            }
                        }
                    }
                    metaAction.toast('success', '自动生成往来科目成功')
                }
            } else {
                selectedOption.map(item => {
                    if (item.accountTypeList.length == 2) {
                        // 明细 有两种结算方式
                        if (item.accountTypeList[0] == ret.accountTypeId) {
                            relating.push(item.accountTypeList[1])
                        } else {
                            relating.push(item.accountTypeList[0])
                        }
                        filter.push({
                            customerId: item.customerId,
                            accountClassificationId: ret.accountTypeId,
                            archiveName: item.customerName,
                            relatingAccountClassificationIdList: relating
                        })
                    } else {
                        // 明细 有1种结算方式
                        if (item.accountTypeList[0] == ret.accountTypeId) {
                            filter.push({
                                customerId: item.customerId,
                                accountClassificationId: ret.accountTypeId,
                                archiveName: item.customerName,
                            })
                        } else {
                            relating.push(item.accountTypeList[0])
                            filter.push({
                                customerId: item.customerId,
                                accountClassificationId: ret.accountTypeId,
                                archiveName: item.customerName,
                                relatingAccountClassificationIdList: relating
                            })
                        }
                    }

                })
                let parmas = {
                    dtoList: filter,
                    specifiedAccountId: ret.id
                }
                const res = await webapi.setAccountCustomer(parmas)
                if (res) {
                    // 销项更新科目
                    const subjectListParameter = ["应收账款", "预收账款", "其他应收款"]
                    const subject = await webapi.getSubject(subjectListParameter)
                    if (subject) {
                        this.setState({
                            subject: subject
                        })
                    }

                    if (res && res.length != 0) {
                        for (var x = 0; x < list.length; x++) {
                            for (var y = 0; y < res.length; y++) {
                                if (list[x].customerId == res[y].customerId) {
                                    this.changeAccount(res[y].accountId, x)
                                }
                            }
                        }
                    }
                    metaAction.toast('success', '自动生成往来科目成功')
                }
            }

            this.setState({
                tableCheckbox: {
                    checkboxValue: [],
                    selectedOption: []
                },
                batchSelect: ret
            })
        }
    }

    // 单选框
    changeRadio = async (v) => {
        this.setState({
            radio: v
        })

        if (v == 1) {
            const { queryAccount } = this.state

            for (var i = queryAccount.noMachedList.length - 1; i >= 0; i--) {
                if (queryAccount.noMachedList[i].accountId) {
                    queryAccount.noMachedList.splice(i, 1);
                }
            }
            oldArr = queryAccount
            this.setState({
                queryAccount: queryAccount
            })

        }
        // this.handleSave('isChange')
        // setTimeout(() => {
        //     this.onResize()
        // }, 20)
    }

    getRowClassName = () => {
        return 'row-supplier'
    }

    render() {
        const { searchContent, radio, tableCheckbox, tableOption, queryAccount, vatOrEntry } = this.state

        let list = []
        if (queryAccount) {
            if (radio) {
                list = queryAccount.allList
            } else {
                list = queryAccount.noMachedList
            }
        }
        list.map((item, index) => {
            if (item) list[index].ids = index + 1
        })

        let columns = []
        if (vatOrEntry) {
            columns = [
                {
                    fieldName: 'puSupplierName',
                    title: '销方名称',
                    dataIndex: '1',
                    key: 'puSupplierName',
                    width: '328px',
                    render: (text, record, index) => this.getContent(text, record, index, 'puSupplierName')
                },
                {
                    fieldName: 'accountId',
                    dataIndex: '2',
                    title: '往来科目',
                    key: 'accountId',
                    width: '328px',
                    render: (text, record, index) => this.getContent(text, record, index, 'accountId')
                }
            ]
        } else {
            columns = [
                {
                    fieldName: 'saCustomerName',
                    title: '购方名称',
                    dataIndex: '1',
                    key: 'saCustomerName',
                    width: '328px',
                    render: (text, record, index) => this.getContent(text, record, index, 'saCustomerName')
                },
                {
                    fieldName: 'accountId',
                    dataIndex: '2',
                    title: '往来科目',
                    key: 'accountId',
                    width: '328px',
                    render: (text, record, index) => this.getContent(text, record, index, 'accountId')
                }
            ]
        }
        return (
            <div className='current-account'>
                <div className='current-account-header'>
                    <Input.Search
                        placeholder={vatOrEntry ? '按销方名称搜索' : '按购方名称搜索'}
                        onChange={this.handleInputChange}
                        value={searchContent}
                        showSearch={true}
                        onSearch={(v) => { this.handleSearch(v) }} />
                    <Button className='header-btn header-btn-color' onClick={() => this.getAutomaticAccount()}>自动生成往来科目</Button>
                    <RadioGroup className='header-radio' onChange={(e) => this.changeRadio(e.target.value)} value={radio == undefined || radio == 0 ? 0 : 1}>
                        <Radio value={0}>未匹配（{queryAccount && queryAccount.noMachedList.length || 0}）</Radio>
                        <Radio value={1}>全部（{queryAccount && queryAccount.allList.length || 0}）</Radio>
                    </RadioGroup>
                </div>

                <Table className='current-account-table'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    rowClassName={this.getRowClassName}
                    dataSource={list}
                    rowSelection={undefined}
                    checkboxKey='ids'
                    scroll={list.length > 0 ? tableOption : {}}
                    checkboxChange={(e, itemArr) => this.checkboxChange(e, itemArr)}
                    checkboxValue={tableCheckbox.checkboxValue}
                    Checkbox={false}
                    columns={columns}
                    loading={this.state.loading}
                    delay={0.01}
                >

                </Table>
            </div>
        )
    }
}

export default currentAccount
