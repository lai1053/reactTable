import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import config from './config'
import { FormDecorator, Button } from 'edf-component'
import AssistForm from './components/AssistForm'
import { sortBaseArchives } from './data'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        LoadingMask.show()
        let subjectItem = this.component.props.initData && this.component.props.initData
        let auxBaseArchives = await this.webapi.financeinit.queryBaseArchives({ isContentEmpty: true }),
            accountId = subjectItem.accountDto && subjectItem.accountDto.id,
            isUsed = await this.webapi.financeinit.used({ id: accountId }),
            findSubject = await this.webapi.financeinit.findSubject({ id: accountId })
        LoadingMask.hide()
        let auxGroupList = sortBaseArchives(auxBaseArchives),
            res = {}
        res.auxGroupList = auxGroupList
        res.isUsed = isUsed
        res.findSubject = findSubject
        res.subjectItem = subjectItem
        this.injections.reduce('load', res)

    }

    renderAux = () => {
        if (this.metaAction.gf('data.form.assistFormOption') == undefined ||
            this.metaAction.gf('data.form.calcDict') == undefined ||
            this.metaAction.gf('data.form.glAccount') == undefined ||
            this.metaAction.gf('data.form.subjectItem') == undefined) {
            return (<div></div>)
        }

        let assistFormOption = this.metaAction.gf('data.form.assistFormOption') && this.metaAction.gf('data.form.assistFormOption').toJS(),
            newData = [],
            calcDict = this.metaAction.gf('data.form.calcDict') && this.metaAction.gf('data.form.calcDict').toJS(),
            isUsed = this.metaAction.gf('data.form.isUsed'),
            glAccount = this.metaAction.gf('data.form.glAccount') && this.metaAction.gf('data.form.glAccount').toJS(),
            assistFormDisabledOption = [],//disabled的辅助项
            assistFormSelectValue = [],
            auxOrder

        if (this.metaAction.gf('data.form.subjectItem') &&
            this.metaAction.gf('data.form.subjectItem').get('auxOrder')) {
            auxOrder = this.metaAction.gf('data.form.subjectItem').get('auxOrder').toJS()

            let orderAuxList = [],
                allAuxList = assistFormOption.slice()

            for (var i = 0; i < auxOrder.length; i++) {
                if (auxOrder[i] == 'isCalcCustomer') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'customerId'))
                } else if (auxOrder[i] == 'isCalcDepartment') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'departmentId'))
                } else if (auxOrder[i] == 'isCalcInventory') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'inventoryId'))
                } else if (auxOrder[i] == 'isCalcPerson') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'personId'))
                } else if (auxOrder[i] == 'isCalcProject') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'projectId'))
                } else if (auxOrder[i] == 'isCalcSupplier') {
                    orderAuxList.push(this.getAuxItem(allAuxList, 'supplierId'))
                } else {
                    orderAuxList.push(this.getAuxItem(allAuxList, auxOrder[i]))
                }
            }

            for (var i = 0; i < allAuxList.length; i++) {
                let auxItem = orderAuxList.find(item => item.key == allAuxList[i].key)

                if (!auxItem) {
                    orderAuxList.push(allAuxList[i])
                }
            }
            assistFormOption = orderAuxList
        }

        let list = ['isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10']

        for (let i in list) {
            if (calcDict[list[i]]) {
                if (glAccount[list[i]] == true) {
                    assistFormSelectValue.push(this.getArchKeyByName(calcDict[list[i]], assistFormOption))
                    if (!!isUsed) {
                        assistFormDisabledOption.push(this.getArchKeyByName(calcDict[list[i]], assistFormOption))
                    }
                }
            }
        }
        return (
            <AssistForm
                assistFormOption={assistFormOption}
                disabledOption={assistFormDisabledOption}
                ref={form => this.assistForm = form}
                assistFormSelectValue={assistFormSelectValue}
            />
        )
    }

    getAuxItem = (allAuxList, auxItemId) => {
        return allAuxList.find(item => item.key == auxItemId)
    }

    getArchKeyByName = (name, assistFormOption) => {
        let key = ''

        let newItem = assistFormOption.find(item => item.name == name)

        if (newItem) {
            key = newItem.key
        }

        return key
    }

    onOk = async () => {
        let data = this.assistForm.getValue(),
            option = data.option,
            selectValue = data.selectValue,
            subjectItem = this.metaAction.gf('data.form.subjectItem').toJS(),
            id = subjectItem.id,
            rowIndex = subjectItem.rowIndex

        let params = { id: id, rowIndex: rowIndex }, auxNameList = []

        for (var i = 0; i < option.length; i++) {
            if (selectValue.includes(option[i].key)) {
                switch (option[i].key) {
                    case 'customerId':
                        auxNameList.push('isCalcCustomer')
                        break;
                    case 'supplierId':
                        auxNameList.push('isCalcSupplier')
                        break;
                    case 'projectId':
                        auxNameList.push('isCalcProject')
                        break;
                    case 'departmentId':
                        auxNameList.push('isCalcDepartment')
                        break;
                    case 'personId':
                        auxNameList.push('isCalcPerson')
                        break;
                    case 'inventoryId':
                        auxNameList.push('isCalcInventory')
                        break;
                    default:
                        auxNameList.push(option[i].key)
                        break;
                }
            }
        }
        params.auxNameList = auxNameList

        console.log('辅助核算设置回参如下：')
        console.dir(params)
        this.component.props.callbackAction && this.component.props.callbackAction(params)
    }

    getAccountContent = () => {
        let codeAndName

        if (this.metaAction.gf('data.form.subjectItem') &&
            this.metaAction.gf('data.form.subjectItem').get('accountDto')) {
            codeAndName = this.metaAction.gf('data.form.subjectItem').get('accountDto').get('codeAndName')
        }

        return (
            <div className='operateheader'>
                <div className='operateheader-codeAndName'>{codeAndName}</div>
                <Button className='operateheader-customerArchBtn' onClick={() => { this.addCustomeArch() }}>新增自定义档案</Button>
            </div>
        )
    }

    addCustomeArch = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '自定义档案',
            className: 'app-list-userdefinecard-modalTitle',
            wrapClassName: 'card-archive',
            width: 400,
            height: 170,
            children: this.metaAction.loadApp('app-card-userdefinecard', {
                store: this.component.props.store,
                archivesName: true
            }),
        })
        if (ret) {
            this.load()
        }
    }

}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
