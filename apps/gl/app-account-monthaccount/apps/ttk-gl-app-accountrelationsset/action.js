import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { FormDecorator, LoadingMask, DataGrid, Select } from 'edf-component'
import { fromJS } from "immutable"
import SubjectBatchSelect from '../../components/subjectBatchSelect'
const Option = Select.Option;
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        const { initData } = this.component.props
        injections.reduce('init', initData)
        this.injections.reduce('tableLoading', true)
        this.load(initData);
    }
    /**
     * 加载
     */
    load = async (initData) => {
        let response = await this.webapi.accountrelationsset.init(initData)
        const allArchiveDS = await this.webapi.accountrelationsset.allArchive({ isEnable: true })
        this.extendAction.gridAction.cellAutoFocus()
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('load', response, initData, allArchiveDS)
    }

    /**
     * 批量删除
     */
    batDelsClick = async () => {
        let { list, path } = this.getCurItems()
        let seletedList = list.filter(x => x.get('selected'))
        if (seletedList.size < 1) {
            this.metaAction.toast('warning', '请选择要删除的科目')
        }
        for (let index = 0; index < seletedList.size; index++) {
            seletedList = seletedList.set(index, seletedList.get(index).set('isDeleted', true))
        }
        this.injections.reduce('update', { path: `${path}Del`, value: seletedList })
        const mewLists = list.filter(x => !x.get('selected'))
        this.injections.reduce('setDelList', path, mewLists)
    }
    isbtnDisabled = (type) => {
        let { list, businessType } = this.getCurItems(),
            accountType = this.metaAction.gf('data.other.accountType')
        if (type == "batEdits"
            && businessType == 5000040024
            && accountType == '1') {
            return true
        }
        return (list.size > 0) ? false : true
    }
    isDisabled = () => {
        let { list, path } = this.getCurItems()
        const delList = this.metaAction.gf(`${path}Del`)
        return (list.size > 0 || delList.size > 0) ? false : true
    }

    filterOption = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }
    /**
     * 页签切换
     */
    tabChange = (path, value) => {
        this.metaAction.sf(path, value)
    }
    /**
     * 获取当前表格集合
     */
    getCurItems = () => {
        let list = fromJS({}),
            { initData } = this.component.props,
            type = this.metaAction.gf('data.other.accountType'),
            path = 'data.list',
            subjectTypes = this.metaAction.gf('data.batchTitles').toJS()

        if (initData.businessType == 5000040026
            || initData.businessType == 5000040005) {
            list = this.metaAction.gf('data.list')
        }
        if (initData.businessType == 5000040024) {
            if (type == '0') {
                list = this.metaAction.gf('data.inventoryList')
                path = 'data.inventoryList'
            } else {
                list = this.metaAction.gf('data.listSecond')
                path = 'data.listSecond'
            }

        }
        subjectTypes = subjectTypes[initData.businessType]
        return { list, path, subjectTypes, businessType: initData.businessType }
    }
    /**
     * 批量修改
     */
    batEditsClick = async () => {
        let accountList = this.metaAction.gf('data.other.accountList'),
            allArchiveDS = this.metaAction.gf('data.other.allArchiveDS')
        let { list, path, subjectTypes } = this.getCurItems()
        let seletedList = list.filter(x => x.get('selected'))
        if (seletedList.size < 1) {
            this.metaAction.toast('warning', '请选择要修改的科目')
            return
        }
        let data = { accountList, subjectTypes: fromJS(subjectTypes), allArchiveDS }
        let res = await this.metaAction.modal('show', {
            title: '批量修改',
            width: '400px',
            okText: '保存',
            cancelText: '取消',
            wrapClassName: 'batchedit',
            children: <SubjectBatchSelect
                data={data} />
        })
        if (res) {
            for (let index = 0; index < seletedList.size; index++) {
                seletedList = seletedList.update(index, item => item.set(`${res.subjectTypeId}ShowName`, res.isCalc ? res.subjectAndAuxName : res.codeAndName))
                seletedList = seletedList.update(index, item => item.set(`${res.subjectTypeId}Id`, res.accountId))
                if (res.subjectTypeId == 'inventoryAccount') {
                    seletedList = seletedList.update(index, item => item.set(`inventoryAuxDataId`, res.accountAuxId))
                } else if (res.subjectTypeId == 'incomeAccount') {
                    seletedList = seletedList.update(index, item => item.set(`incomeAuxDataId`, res.accountAuxId))
                } else {
                    seletedList = seletedList.update(index, item => item.set(`costAuxDataId`, res.accountAuxId))
                }
            }
            const noSelectList = list.filter(x => !x.get('selected'))
            let newList = [...noSelectList.toJS(), ...seletedList.toJS()]
            this.injections.reduce('update', { path: path, value: fromJS(newList) })
            this.metaAction.toast('success', '修改成功')
        }
    }

    /**
     * 取消
     */
    handleCancel = async () => {
        this.component.props.closeModal(true)
    }
    /**
     * 保存
     */
    handleSave = async () => {
        let { list, path, businessType } = this.getCurItems(),
            { initData } = this.component.props,
            delList = this.metaAction.gf(`${path}Del`)
                && this.metaAction.gf(`${path}Del`).toJS()
        let oldList = [], newList = [], optionData = {}
        if (businessType == 5000040024) {
            let inventoryList = this.metaAction.gf('data.inventoryList')
            let listSecond = this.metaAction.gf('data.listSecond')
            const delList1 = this.metaAction.gf(`data.inventoryListDel`) && this.metaAction.gf(`data.inventoryListDel`).toJS()
            const delList2 = this.metaAction.gf(`data.listSecondDel`) && this.metaAction.gf(`data.listSecondDel`).toJS()
            let filterList1 = inventoryList.filter(x => x.get('inventoryAccountId') || x.get('incomeAccountId'))
            if (filterList1.size > 0) {
                filterList1 = filterList1.set(0, filterList1.get(0).set('isDeleted', false))
            }

            let filterList2 = listSecond.filter(x => x.get('costAccountId'))
            if (filterList2.size > 0) {
                filterList2 = filterList2.set(0, filterList2.get(0).set('isDeleted', false))
            }

            let tmpList = fromJS([...filterList1.toJS(), ...delList1])
            if (tmpList && tmpList.size > 0) {
                const firstElement = tmpList.get(0)
                //补全数据结构，否则nodejs会过滤掉，导致后面有值的列无法接收到数据
                if (!firstElement.get('inventoryAuxDataId')) {
                    tmpList = tmpList.update(0, item => item.set(`inventoryAuxDataId`, null))
                }
                if (!firstElement.get('incomeAuxDataId')) {
                    tmpList = tmpList.update(0, item => item.set(`incomeAuxDataId`, null))
                }
                if (!firstElement.get('costAuxDataId')) {
                    tmpList = tmpList.update(0, item => item.set(`costAuxDataId`, null))
                }
                if (!firstElement.get('costAccountId')) {
                    tmpList = tmpList.update(0, item => item.set(`costAccountId`, null))
                }
                if (!firstElement.get('inventoryAccountId')) {
                    tmpList = tmpList.update(0, item => item.set(`inventoryAccountId`, null))
                }
                if (!firstElement.get('incomeAccountId')) {
                    tmpList = tmpList.update(0, item => item.set(`incomeAccountId`, null))
                }
            }
            optionData.list = tmpList.toJS()
            optionData.listSecond = [...filterList2.toJS(), ...delList2]
        } else {
            oldList = list.filter(x => x.get('inventoryAccountId') || x.get('incomeAccountId') || x.get('costAccountId'))
            if (oldList.size > 0) {
                oldList = oldList.set(0, oldList.get(0).set('isDeleted', false))
                newList = [...oldList.toJS()]
            }
            optionData.list = [...newList, ...delList]
        }
        const res = await this.webapi.accountrelationsset.save({ ...optionData, ...initData })
        if (res) {
            this.component.props.closeModal('save')
        }

    }
    /**
     * 选择行
     */
    selectRow = (rowIndex, path) => (e) => {
        this.injections.reduce('selectRow', path, rowIndex, e.target.checked)
    }
    /**
     * 科目选择
     */
    onSubjectSelect = (colType, rowIndex, accountingSubjects) => async (v) => {
        let { list, path } = this.getCurItems()
        let details = list,
            allArchiveDS = this.metaAction.gf('data.other.allArchiveDS'),
            curAccount = accountingSubjects.find(o => o.id == v)
        details = details.update(rowIndex, item => item.set(`${colType}Id`, curAccount.id))
        details = details.update(rowIndex, item => item.set(`${colType}Code`, curAccount.code))
        details = details.update(rowIndex, item => item.set(`${colType}ShowName`, curAccount.codeAndName))
        let firstName = colType.replace('Account', '')
        details = details.update(rowIndex, item => item.set(`${firstName}AuxDataId`, null))
        if (curAccount.isCalc) {
            let calcDict = {}
            if (allArchiveDS['自定义档案'] && allArchiveDS['自定义档案'].length > 0) {
                allArchiveDS['自定义档案'].map(item => {
                    return calcDict[`${item.calcName}`] = item.name
                })
            }
            const result = await this.metaAction.modal('show', {
                title: '辅助项',
                width: 450,
                okText: '确定',
                children: this.metaAction.loadApp(`ttk-gl-app-auxassistitem`, {
                    store: this.component.props.store,
                    initData: fromJS({ ...curAccount, calcDict })
                })
            })
            if (result) {
                details = details.update(rowIndex, item => item.set(`${colType}ShowName`, `${curAccount.codeAndName}${result.subjectWithAuxName}`))
                details = details.update(rowIndex, item => item.set(`${firstName}AuxDataId`, result.auxId))
            }
        }
        this.injections.reduce('update', { path: path, value: details })
    }
    /**
     * 辅助项
     */
    handlerCurRowAux = (colName, currentRow, index, accountSource) => async () => {
        let { list, path } = this.getCurItems(),
            firstName = colName.replace('Account', '')
        let details = list,
            allArchiveDS = this.metaAction.gf('data.other.allArchiveDS'),
            curAccount = accountSource.find(o => o.id == currentRow[`${colName}Id`])
        if (curAccount.isCalc) {
            let calcDict = {}
            if (allArchiveDS['自定义档案'] && allArchiveDS['自定义档案'].length > 0) {
                allArchiveDS['自定义档案'].map(item => {
                    return calcDict[`${item.calcName}`] = item.name
                })
            }
            const result = await this.metaAction.modal('show', {
                title: '辅助项',
                width: 450,
                okText: '确定',
                children: this.metaAction.loadApp(`ttk-gl-app-auxassistitem`, {
                    store: this.component.props.store,
                    initData: fromJS({ ...curAccount, calcDict, auxId: currentRow[`${firstName}AuxDataId`] })
                })
            })
            if (result) {
                details = details.update(index, item => item.set(`${colName}ShowName`, `${curAccount.codeAndName}${result.subjectWithAuxName}`))
                details = details.update(index, item => item.set(`${firstName}AuxDataId`, result.auxId))
            }
        }
        this.injections.reduce('update', { path: path, value: details })
    }  
        
    gridKeydown = (e) => {
        this.extendAction.gridAction.gridKeydown(e)
        if (e.keyCode == 40) {
            this.extendAction.gridAction.cellAutoFocus()
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction, extendAction }),
        ret = { ...metaAction, ...voucherAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}   