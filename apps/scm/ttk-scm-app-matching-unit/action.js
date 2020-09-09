import React from 'react'
import { Map, List, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import extend from './extend';
import CurrentAccountBatch from './components/currentAccountBatch'
import { FormDecorator, Select, LoadingMask } from 'edf-component'
import {fetch} from 'edf-utils'

const Option = Select.Option
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
		this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction;
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.extendAction.gridAction.onInit({ component, injections });
        this.component = component
        this.injections = injections

        if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}

        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let initData = this.component.props.initData,
            defalutcustomers = this.component.props.defalutcustomers,
            defalutsuppliers = this.component.props.defalutsuppliers
        if(initData) {
            LoadingMask.show()
            let search = this.metaAction.gf('data.search')
            const allList = [
                this.webapi.getCorrespondentUnitsListNew(this.component.props.initData.reconciliatioBatchMaintenanceDtos),
                this.webapi.supplier({ entity: { isEnable: true } }), 
                this.webapi.customer({ entity: { isEnable: true } })
            ]
            let [ res, supplierList, customerList ] =  await Promise.all(allList)
            LoadingMask.hide()
            if(defalutsuppliers && defalutsuppliers.length) supplierList.list = supplierList.list.concat(defalutsuppliers)
            if(defalutcustomers && defalutcustomers.length) customerList.list = customerList.list.concat(defalutcustomers)
            this.injections.reduce('load', res, supplierList, customerList)
            if(search) this.fixPosition(search)
        }
    }

    refrash = async () => {
        let initData = this.component.props.initData,
            inventoryNameSet = this.metaAction.gf('data.inventoryNameSet'),
            search = this.metaAction.gf('data.search'),
            defalutcustomers = this.component.props.defalutcustomers,
            defalutsuppliers = this.component.props.defalutsuppliers
        if(initData) {
            initData.reconciliatioBatchMaintenanceDtos.map(item=>{
                if(item.customerId) item.customerId = null
                if(item.supplierId) item.supplierId = null
            })
            LoadingMask.show()
            let search = this.metaAction.gf('data.search')
            const allList = [
                this.webapi.getCorrespondentUnitsListNew(this.component.props.initData.reconciliatioBatchMaintenanceDtos),
                this.webapi.supplier({ entity: { isEnable: true } }), 
                this.webapi.customer({ entity: { isEnable: true } })
            ]
            let [ res, supplierList, customerList ] =  await Promise.all(allList)
            LoadingMask.hide()
            if(defalutsuppliers && defalutsuppliers.length) supplierList.list = supplierList.list.concat(defalutsuppliers)
            if(defalutcustomers && defalutcustomers.length) customerList.list = customerList.list.concat(defalutcustomers)
            this.injections.reduce('load', res, supplierList, customerList, { inventoryNameSet, search })
            if(search) this.fixPosition(search)
        }
    }

    fixPosition = (condition) => {
        let inventoryNameSet = this.metaAction.gf('data.inventoryNameSet'),
            list = this.metaAction.gf('data.allList').toJS(),
            notMatchList = this.metaAction.gf('data.notMatchList').toJS()
        if(inventoryNameSet==1){
            list = notMatchList
        }
        let arr = list
        if(condition){
            arr = list.filter(item=>{
                return item.name.indexOf(condition) > -1
            })
        }
        
        this.injections.reduce('updatefile',
            {
                path: 'data.list',
                value: arr
            }
        )
    }

    handleChangeSearch = (e) => {
        let value = e.target.value || null;
        if (value) value = value.trim();
        this.metaAction.sf('data.search', value);

        let keyRandom = Math.floor(Math.random() * 10000000)
        this.keyRandom = keyRandom
        clearTimeout(this.time)
        this.time = setTimeout(() => {
            if (keyRandom == this.keyRandom) {
                this.fixPosition(value)
            }
        }, 100)
    }
    
    selectChidren = (option, type) => {
        let optionArr = [], list = []
        if(type == '供应商'){
            list = this.metaAction.gf('data.other.supplier').toJS()
        }else if(type=='客户'){
            list = this.metaAction.gf('data.other.customer').toJS()
        }else if(type == 'subject'){
            let customerAccounts = this.metaAction.gf('data.customerAccounts').toJS(),
                supplierAccounts = this.metaAction.gf('data.supplierAccounts').toJS()
            if(option.archiveType=='供应商'){
                list = supplierAccounts
            }else if(option.archiveType=='客户'){
                list = customerAccounts
            }
        }
        if(list.length == 0) return
        list.map(item => {
            optionArr.push(<Option value={item && item.id}
                title = {item && type=="subject" ? item.codeAndName : item.name}
                >{item && type=="subject" ? item.codeAndName : item.name}</Option>)
        })
        return optionArr
    }

    onFieldChange = (value, index, name) => {
        let list = this.metaAction.gf('data.list').toJS()
        let item = list[index], allIndex, notMatchIndex

        let allList = this.metaAction.gf('data.allList').toJS(),
            notMatchList = this.metaAction.gf('data.notMatchList').toJS()

        allList.map((m, n)=>{
            if(m.id == item.id) allIndex = n
        })

        notMatchList.map((m, n)=>{
            if(m.id == item.id) notMatchIndex = n
        })
        
        if(name=='subject'){
            let selectList = this.metaAction.gf('data.customerAccounts').toJS()
            if(item.archiveType == '供应商') {
                selectList = this.metaAction.gf('data.supplierAccounts').toJS()
            }
            selectList.filter(o => {
                if(o.id == value) {
                    item.accountId = o.id
                }else if(value===undefined){
                    item.accountId = ''
                }
            })
            if(item.subjectError) delete item.subjectError
        }else{
            item.archiveId = value
            let selectList = this.metaAction.gf('data.other.customer').toJS()
            if(item.archiveType == '供应商') {
                selectList = this.metaAction.gf('data.other.supplier').toJS()
            }
            selectList.filter(o => {
                if(o.id == value) {
                    item.archiveName = o.name
                    item.ba = o
                }
            })
        }

        if(allIndex != undefined) allList[allIndex] = item
        if(notMatchIndex != undefined) notMatchList[notMatchIndex] = item

        this.injections.reduce('update',
            {
                'data.list': fromJS(list),
                'data.allList': fromJS(allList),
                'data.notMatchList': fromJS(notMatchList)
            }
        )
    }

    rptTypeChange = async(index, value) => {
        //改变性质时如果客户/供应商已经有值，判断对应档案是否存在，不存在时新建对应档案，已选项不清空
        let list = this.metaAction.gf('data.list').toJS()
        let item = list[index], allIndex, notMatchIndex

        let allList = this.metaAction.gf('data.allList').toJS(),
            notMatchList = this.metaAction.gf('data.notMatchList').toJS()
        item.accountId = ''
        allList.map((m, n)=>{
            if(m.id == item.id) allIndex = n
        })

        notMatchList.map((m, n)=>{
            if(m.id == item.id) notMatchIndex = n
        })

        item.archiveType = value
        if(value == '供应商') {
            //item.receiptAndDisbursementDirection = '支出'
            let selectList = this.metaAction.gf('data.other.supplier').toJS()
            let option = { archiveName: 'ba_supplier' }
            if( item.ba ) {
                item = await this.getSelectData(selectList, option, 'supplier', item)
            }
            
        }else {
            //item.receiptAndDisbursementDirection = '收入'
            let selectList = this.metaAction.gf('data.other.customer').toJS()
            let option = { archiveName: 'ba_customer' }
            if( item.ba ) {
                item = await this.getSelectData(selectList, option, 'customer', item)
            }
        }

        if(allIndex != undefined) allList[allIndex] = item
        if(notMatchIndex != undefined) notMatchList[notMatchIndex] = item

        //通过selectData替换当前选中值 ba为当前选中值所有项
        this.injections.reduce('update',
            {
                'data.list': fromJS(list),
                'data.allList': fromJS(allList),
                'data.notMatchList': fromJS(notMatchList)
            }
        )
    }

    getSelectData = async(selectList, option, type, item) => {
        if(selectList.length == 0) {
            let data = await this.webapi.fileList(type)
            selectList = data.list || []
        }
        let selectData = selectList.filter(o => o.name == item.archiveName)        
        if(selectData.length == 0 ){
            let code = await this.webapi.getCode(option)
            item.ba.code = code
            if(item.ba.ts) delete item.ba.ts
            if(item.ba.id) delete item.ba.id
            let select = await this.webapi.create(item.ba, type)
             selectData.push(select)
            let data = await this.webapi.fileList(type)
            selectList = data.list
        }

        item.archiveId = selectData[0].id
        item.archiveName = selectData[0].name
        this.injections.reduce('updatefile',
            {
                path: 'data.other.' + type,
                value: selectList
            }
        )
        return item
    }

    addSupplierCustomer = async(type, _rowIndex) => {
        let title = '客户', name = 'app-card-customer'
        if(type == 'supplier'){
            title = '供应商'
            name = 'app-card-vendor'
        }

        const ret = await this.metaAction.modal('show', {
            title: title,
            width: 700,
            children: this.metaAction.loadApp(
                name, {
                    store: this.component.props.store
                }
            )
        })

        if (ret) {
            if (!ret.isEnable) {
                return
            }
            let res = await this.webapi[type]()
            if (res) {
                let value = res.list.filter(item => { return item.isEnable == true }), obj = {},
                    allList = this.metaAction.gf('data.allList').toJS(),
                    notMatchList = this.metaAction.gf('data.notMatchList').toJS()
                if(type == 'supplier') {
                    obj['data.other.supplier'] = fromJS(value)
                }else{
                    obj['data.other.customer'] = fromJS(value)
                }

                let list = this.metaAction.gf('data.list').toJS()
                list[_rowIndex].archiveId = ret.id
                list[_rowIndex].archiveName = ret.name
                // 这个时候是不是要写ba
                list[_rowIndex].ba = ret
                
                allList.map((item, index) => {
                    if(item.id == list[_rowIndex].id) allList[index] = list[_rowIndex]
                })
                notMatchList.map((item, index) => {
                    if(item.id == list[_rowIndex].id) notMatchList[index] = list[_rowIndex]
                })
                
                obj['data.list'] = fromJS(list)
                obj['data.allList'] = fromJS(allList)
                obj['data.notMatchList'] = fromJS(notMatchList)

                this.injections.reduce('update', obj);
            }
        }
    }

    handleOnChangeSetType = (e) => {
        let list = this.metaAction.gf('data.list').toJS(),
            allList = this.metaAction.gf('data.allList').toJS(),
            notMatchList = this.metaAction.gf('data.notMatchList').toJS(),
            value = e.target.value,
            search = this.metaAction.gf('data.search')
        if(value==0){
            list = allList
        }else if(value==1){
            list = notMatchList
        }
        this.injections.reduce('update',{
            'data.list': fromJS(list),
            'data.inventoryNameSet': value
        })
        if(search) this.fixPosition(search)
    }

    //获取往来单位下拉列表
    archiveFocus = async () => {
        let defalutcustomers = this.component.props.defalutcustomers,
            defalutsuppliers = this.component.props.defalutsuppliers
        const allList = [
            this.webapi.supplier({ entity: { isEnable: true } }), 
            this.webapi.customer({ entity: { isEnable: true } })
        ]
        let [ supplierList, customerList ] =  await Promise.all(allList)
        if(defalutsuppliers && defalutsuppliers.length) supplierList.list = supplierList.list.concat(defalutsuppliers)
        if(defalutcustomers && defalutcustomers.length) customerList.list = customerList.list.concat(defalutcustomers)
        
        this.injections.reduce('update',
            {
                'data.other.customer': fromJS(customerList.list),
                'data.other.supplier': fromJS(supplierList.list),
            }
        )
    }

    //自动生成往来科目
    autoSubjectClick = async () => {
        let vatOrEntry, inItems = [], outItems = []

        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),
            customerParentAccounts = this.metaAction.gf('data.customerParentAccounts').toJS(),
            supplierParentAccounts = this.metaAction.gf('data.supplierParentAccounts').toJS()

        if (!selectedArrInfo.length) {
            this.metaAction.toast('error', '请选择自动生成往来科目的数据')
            return false
        }
        
        selectedArrInfo.map(item => {
            if(item.archiveType == '供应商'){
                outItems.push(item)
            }else if(item.archiveType == '客户'){
                inItems.push(item)
            }
        })

        if(selectedArrInfo.length != inItems.length && selectedArrInfo.length != outItems.length){
            this.metaAction.toast('warning', '存在收支方向即有收入又有支出的数据，不能自动生成往来科目')
            return false
        }
        if(outItems.length) vatOrEntry = true

        let parmas = vatOrEntry ? supplierParentAccounts : customerParentAccounts 
        const ret = await this.metaAction.modal('show', {
            title: '自动生成往来科目',
            width: 494,
            wrapClassName: 'currentBatchCss',
            children: <CurrentAccountBatch
                vatOrEntry={vatOrEntry} list={parmas||[]}/>
        })
        if (ret) {
            let filter = [], relating = []

            selectedArrInfo.map(item => {
                filter.push({
                    id: item.id,
                    archiveId: item.archiveId,
                    archiveName: item.archiveName,
                    accountTypeIdList: item.accountTypeIdList,
                    businessTypeIds: item.businessTypeIds ? item.businessTypeIds : null,
                    ts: item.ts
                })
            })
            let parmas = {
                dtos: filter,
                parentId: ret.id
            }
            const res = await this.webapi.generateCorrespondentUnitsAccount(parmas)
            if (res) {
                if(res.message) {
                    this.metaAction.toast('warning', res.message)
                }else{
                    this.metaAction.toast('success', '自动生成往来科目成功')
                }
                if(res.dtos){
                    let list = this.metaAction.gf('data.list').toJS(),
                        allList = this.metaAction.gf('data.allList').toJS(),
                        notMatchList = this.metaAction.gf('data.notMatchList').toJS()
                    res.dtos.map(item => {
                        list.map(o => {
                            if(o.id == item.id) {
                                o.accountId = item.accountId
                                if(item.accountId) o.subjectError = false
                            }
                        })
                        allList.map(o => {
                            if(o.id == item.id) {
                                o.accountId = item.accountId
                                if(item.accountId) o.subjectError = false
                            }
                        })
                        notMatchList.map(o => {
                            if(o.id == item.id) {
                                o.accountId = item.accountId
                                if(item.accountId) o.subjectError = false
                            }
                        })
                    })
                    this.injections.reduce('update',{
                        'data.list': fromJS(list),
                        'data.allList': fromJS(allList),
                        'data.notMatchList': fromJS(notMatchList),
                        'data.customerAccounts': fromJS(res.customerAccounts),
                        'data.supplierAccounts': fromJS(res.supplierAccounts),
                        'data.supplierRootAccounts': fromJS(res.supplierRootAccounts),
                        'data.customerRootAccounts': fromJS(res.customerRootAccounts),
                        'data.customerParentAccounts': fromJS(res.customerParentAccounts),
                        'data.supplierParentAccounts': fromJS(res.supplierParentAccounts),
                    })
                }
            }
        }
    }

    //获取往来科目
    onFieldFocus = async (option, index) => {
        let subjectListParameter,
            list = this.metaAction.gf('data.list').toJS(),
            customerAccounts = this.metaAction.gf('data.customerAccounts').toJS(),
            supplierAccounts = this.metaAction.gf('data.supplierAccounts').toJS()

        if (option.archiveType == "供应商") {
            subjectListParameter = supplierAccounts
        } else {
            subjectListParameter = customerAccounts
        }
        list[index].subjectList = subjectListParameter
        this.injections.reduce('update',{
            'data.list': fromJS(list)
        })
    }

    // 新增科目
    addSubject = async (option, index) => {
        let sonListByPidList = []
        if (option.archiveType == '供应商') {
            let supplierRootAccounts = this.metaAction.gf('data.supplierRootAccounts').toJS()
            for (var i = 0; i < supplierRootAccounts.length; i++) {
                sonListByPidList.push(supplierRootAccounts[i].id)
            }
        } else if (option.archiveType == '客户') {
            let customerRootAccounts = this.metaAction.gf('data.customerRootAccounts').toJS()
            for (var i = 0; i < customerRootAccounts.length; i++) {
                sonListByPidList.push(customerRootAccounts[i].id)
            }
        }

        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives',
                initData: {
                    sonListByPidList,
                }
            })
        })
        const aaa = await this.webapi.getCorrespondentUnitsAccount()

        this.injections.reduce('update', {
            'data.supplierAccounts': fromJS(aaa.supplierAccounts),
            'data.customerAccounts': fromJS(aaa.customerAccounts)
        })

        if (ret) {
            this.onFieldChange(ret.id, index, "subject")
            this.metaAction.toast('success', '新增成功');
        }
    }

    onCancel = async () => {
        this.component.props.closeModal(null)
    }

    //保存
    save = async (name) => {
        let inventoryNameSet = this.metaAction.gf('data.inventoryNameSet'),
            list = this.metaAction.gf('data.allList').toJS(),
            notMatchList = this.metaAction.gf('data.notMatchList').toJS(),
            currentAccountEnable = this.metaAction.gf('data.currentAccountEnable')

        if(inventoryNameSet==1){
            list = notMatchList
        }

        if(currentAccountEnable){
            let checked = this.saveChecked(list)
            if(!checked) return false
        }
        if(!list.length){
            this.metaAction.toast('warning', '暂无数据')
            return false
        }
        let option = list.map(item =>{
            return {
                id: item.id,
                name: item.name,
                archiveName: item.archiveName,
                archiveType: item.archiveType,
                archiveId: item.archiveId ? item.archiveId : null,
                accountTypeIdList: item.accountTypeIdList,
                accountId: item.accountId ? item.accountId : null,
                receiptAndDisbursementDirection: item.receiptAndDisbursementDirection
            }
        })
        LoadingMask.show()
        let save = await this.webapi.save(option)
        if(save && name!='next') {
            LoadingMask.hide()
            //this.refrash()
            this.metaAction.toast('success', '保存成功')
        }else {
            return true
        }
    }

    //上一步
    prev = async () => {
        this.component.props.closeModal(null)
    }

    //生成单据
    next = async () => {
        let initData = this.component.props.initData
        //保存
        let value = await this.save('next')
        if(!value) return false
        
        //生成单据
        let response = await this.webapi.batchGenerateDocNew(initData)
        LoadingMask.hide()
        if(response.fail && response.fail.length){
            this.metaAction.toast('warning', this.getMessage(response.fail))
        }else{
            this.metaAction.toast('success', '生成单据成功')
            this.component.props.closeModal(true)
        }
    }

    saveChecked = (list) => {
        let errorList = []
        list.map((item, index) => {
            if(!item.accountId) {
                item.subjectError = true
                errorList.push(index)
                return
            }
        })
        if(errorList.length){
            this.metaAction.toast('error', '往来科目不能为空')
            this.injections.reduce('update',{
                'data.list': fromJS(list)
            })
            return false
        }
        return true
    }

    isSelectAll = (gridName) => {
		return this.extendAction.gridAction.isSelectAll(gridName);
    }
    
    selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked);
    }
    
    selectAll = (gridName) => (e) => {
		this.injections.reduce('selectAll', e.target.checked, gridName);
    }
    
    getName = (name) => {
        let allList = this.metaAction.gf('data.allList') ? this.metaAction.gf('data.allList').toJS() : [],
            notMatchList = this.metaAction.gf('data.notMatchList') ? this.metaAction.gf('data.notMatchList').toJS() : [], 
            list = []

        if(name=='全部'){
            list = allList
        }else{
            list = notMatchList
        }

        if(list && list.length){
            return name + "（" +  list.length + "）"
        }else{
            return name + "（" +  0 + "）"
        }
    }

    getMessage = (fail) => {
        return <div>
            {
                fail.map(item => {
                    return <p>{item.message}</p>
                })
            }
        </div>
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction, extendAction }),
        ret = { ...metaAction, ...voucherAction, ...extendAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}