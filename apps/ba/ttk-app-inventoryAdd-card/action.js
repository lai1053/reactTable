import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { FormDecorator, Icon, DatePicker, Button } from 'edf-component'
import config from './config'
// import { FormDecorator } from 'edf-component'
import { Map, fromJS } from 'immutable'
import extend from './extend'
import moment from 'moment'
import utils, { environment } from 'edf-utils'
import { addThousPos, clearThousPos } from '../../../utils/number'
import { blankDetail } from './data'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        injections.reduce('init')

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', ::this.onTabFocus)
        }

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }

        this.load()
    }

    load = async () => {
        let findEnumList = await this.webapi.findEnumList(),
            queryAll = await this.webapi.queryAll(),
            getAccount = await this.webapi.getAccount(),
            newAccount = []

        getAccount.glAccounts.forEach(item => {
            if (item.codeGrade1 == '1403' || item.codeGrade1 == '1405' || item.codeGrade1 == '1411' || item.codeGrade1 == '1408') {
                newAccount.push(item)
            }
        })
        // let roductDtoList = this.metaAction.gf('data.form.details').toJS() 

        // let autoMatch = await this.webapi.autoMatch( {
        //     roductDtoList
        //   })

        if (this.component.props.details) {
            let roductDtoList = this.component.props.details
            let autoMatch = await this.webapi.autoMatch({
                roductDtoList
            })
            if (autoMatch.length != 0) {
                this.component.props.details.forEach((item, index) => {
                    autoMatch.forEach((value, num) => {
                        if (this.component.props.details[index].name == autoMatch[num].name && this.component.props.details[index].specification == autoMatch[num].specification) {
                            this.component.props.details[index].supplement = true
                            this.component.props.details[index] = autoMatch[num]
                        }
                    })
                })
                this.metaAction.sfs({
                    'data.other.unit': fromJS(findEnumList.unitList),
                    'data.other.property': fromJS(queryAll),
                    'data.other.subject': fromJS(newAccount),
                    'data.other.subjects': fromJS(newAccount),
                    'data.form.details': fromJS(this.component.props.details),
                })
            } else {
                this.metaAction.sfs({
                    'data.other.unit': fromJS(findEnumList.unitList),
                    'data.other.property': fromJS(queryAll),
                    'data.other.subject': fromJS(newAccount),
                    'data.other.subjects': fromJS(newAccount),
                    'data.form.details': fromJS(this.component.props.details),
                })
            }

        } else {
            this.metaAction.sfs({
                'data.other.unit': fromJS(findEnumList.unitList),
                'data.other.property': fromJS(queryAll),
                'data.other.subject': fromJS(newAccount),
                'data.other.subjects': fromJS(newAccount),
            })
        }
    }

    onTabFocus = async (params) => {
        this.load()
    }

    onFieldChanges = async (index, value, name, all) => {
        let details = this.metaAction.gf('data.form.details').toJS()
        let property = this.metaAction.gf('data.other.property').toJS()
        if (all.supplement) {
            details[index].supplement = false
        }

        details[index][name] = value

        if (name == 'name' || name == 'specification') {
            if (all.msg && all.msg != '') {
                details[index].msg = ''
            }
        }

        if (name == 'inventoryRelatedAccountId') {
            let subjects = this.metaAction.gf('data.other.subjects').toJS()
            let inventoryRelatedAccountName = subjects.find(o => o.id == value)
            details[index].inventoryRelatedAccountName = inventoryRelatedAccountName.codeAndName
        }

        if (name == 'propertyId') {
            let pIdList = []
            const item = property.filter(o => o.id == value)[0]
            pIdList.push(item.accountId)
            let option = {
                pIdList,
                isEndNode: true,
                isEnable: true,
                isForInventory: true
            }
            let getSonListByPIdOrPCodeList = await this.webapi.getSonListByPIdOrPCodeList(option)

            this.metaAction.sf('data.other.subject', fromJS(getSonListByPIdOrPCodeList))

            if (all.inventoryRelatedAccountId) {
                details[index].inventoryRelatedAccountId = ''
                details[index].inventoryRelatedAccountName = ''
            }
        }

        this.metaAction.sf(`data.form.details`, fromJS(details))
    }

    getFocusName = async (index, value) => {
        if (value.propertyId) {
            let pIdList = [],
                property = this.metaAction.gf('data.other.property').toJS()
            const item = property.filter(o => o.id == value.propertyId)[0]

            pIdList.push(item.accountId)
            let option = {
                pIdList,
                isEndNode: true,
                isEnable: true,
                isForInventory: true
            }

            let getSonListByPIdOrPCodeList = await this.webapi.getSonListByPIdOrPCodeList(option)
            this.metaAction.sf('data.other.subject', fromJS(getSonListByPIdOrPCodeList))
            this.metaAction.sf('data.other.subjects', fromJS(getSonListByPIdOrPCodeList))
        }
    }

    onOk = async () => {
        let details = this.metaAction.gf('data.form.details').toJS()

        for (let i = 0; i < details.length; i++) {
            if (details[i].alias) {
                let archiveAliasList = [{ "sequenceNo": 1, "name": details[i].alias }]
                details[i].archiveAliasList = archiveAliasList
            }

            if (!details[i].name) {
                this.metaAction.toast('warning', `第${i+1}行存货名称不能为空`)
                return false
            }
            if (!details[i].propertyId) {
                this.metaAction.toast('warning', `第${i+1}行存货类型不能为空`)
                return false
            }
            if (!details[i].inventoryRelatedAccountId) {
                this.metaAction.toast('warning', `第${i+1}行存货科目不能为空`)
                return false
            }
            if (!details[i].unitId) {
                this.metaAction.toast('warning', `第${i+1}行计量单位不能为空`)
                return false
            }
            if (details[i].alias && details[i].alias.length > 20) {
                this.metaAction.toast('warning', `第${i+1}行别名不能超过20位`)
                return false
            }
            details[i].isEnable = true
        }

        let createDtos = details
        let checkRecords = await this.webapi.checkRecords({
            createDtos
        })

        for (let i = 0; i < checkRecords.length; i++) {
            if (checkRecords[i].msg && checkRecords[i].msg != '') {
                this.metaAction.toast('warning', `请根据提示修改`)
                this.metaAction.sf(`data.form.details`, fromJS(checkRecords))
                return false
            }
        }

        let createBatch = await this.webapi.codeHandlerCreateBatch(details)

        // console.log('createBatch:', createBatch)
        if (Array.isArray(createBatch)) {
            createBatch.some(s => !s.key) && createBatch.forEach((item, index) => {
                details.forEach((data, number) => {
                    if (item.name == data.name && item.specification == data.specification) {
                        createBatch[index].key = details[number].key
                    }
                })
            })
            return createBatch
        }
        return false
    }

    onCancel = () => {
        this.component.props.closeModal()
    }

    isSelectAll = () => {
        let lst = this.metaAction.gf('data.form.details')
        if (!lst || lst.size == 0)
            return false
        return lst.every(o => o.get('selected'))
    }

    selectAll = (e) => {
        this.injections.reduce('selectAll', e.target.checked)
    }

    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }

    addAccount = async (index) => {
        let details = this.metaAction.gf('data.form.details').toJS()
        let sonListByPcodeList = [],
            subject = this.metaAction.gf('data.other.subject').toJS()
        // sonListByPcodeList.push(subject[0].codeGrade1)
        if (subject[0] && subject[0].codeGrade1) {
            sonListByPcodeList.push(subject[0].codeGrade1)
        } else {
            this.metaAction.toast('error', '当前存货类型所设定的科目己停用，不能新增下级')
            return false
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
                    sonListByPcodeList,
                    isOnlyEndNode: false,
                    isEnable: true
                }
            })
        })
        // if(ret && ret.isEnable) {
        //  subject.push(ret)
        //     details[index].inventoryRelatedAccountName = ret.codeAndName
        //     details[index].inventoryRelatedAccountId = ret.id
        //     this.metaAction.sfs({
        //         'data.other.subject': fromJS(subject),
        //         'data.form.details': fromJS(details),
        //     })
        // }

        if (ret && ret.isEnable) {
            let isTrue = false
            if (ret.isCalcMulti) {
                return false
            } else if (!ret.isCalc) {
                isTrue = true
            } else if (ret.isCalcInventory && !ret.isCalcDepartment && !ret.isCalcPerson &&
                !ret.isCalcCustomer && !ret.isCalcSupplier && !ret.isCalcProject &&
                !ret.isExCalc1 && !ret.isExCalc2 && !ret.isExCalc3 &&
                !ret.isExCalc4 && !ret.isExCalc5 && !ret.isExCalc6 &&
                !ret.isExCalc7 && !ret.isExCalc8 && !ret.isExCalc9 &&
                !ret.isExCalc10) {
                isTrue = true
            } else {
                return false
            }
            if (isTrue) {
                subject.push(ret)
                details[index].inventoryRelatedAccountName = ret.codeAndName
                details[index].inventoryRelatedAccountId = ret.id
                this.metaAction.sfs({
                    'data.other.subject': fromJS(subject),
                    'data.other.subjects': fromJS(subject),
                    'data.form.details': fromJS(details),
                })
            }
        }
    }

    delete = async () => {
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            let details = this.metaAction.gf('data.form.details').toJS(),
                num = 0
            for (let i = 0; i < details.length; i++) {
                if (details[i].selected) {
                    num += 1
                    details.splice(i, 1)
                    i = i - 1;
                }
            }
            this.metaAction.toast('success', `删除${num}条单据成功`)
            this.metaAction.sf(`data.form.details`, fromJS(details))
        }
    }

    addUnit = async (index) => {
        let details = this.metaAction.gf('data.form.details').toJS()

        const ret = await this.metaAction.modal('show', {
            title: '新增计量单位',
            width: 720,
            className: 'ttk-app-unit-card-add',
            children: this.metaAction.loadApp('ttk-app-unit-card', {
                store: this.component.props.store,
            })
        })
        if (ret) {
            let oldArr = this.metaAction.gf('data.other.unit').toJS()
            oldArr.push(ret)
            details[index].unitId = ret.id
            this.metaAction.sfs({
                'data.other.unit': fromJS(oldArr),
                'data.form.details': fromJS(details),
            })
        }
    }

    set = async () => {
        let details = this.metaAction.gf('data.form.details').toJS(),
            selected = []
        for (let i = 0; i < details.length; i++) {
            if (details[i].selected) {
                selected.push(details[i])
            }
        }
        if (selected.length == 0) {
            this.metaAction.toast('error', '请选择您要批量修改的数据')
            return
        }
        const res = await this.metaAction.modal('show', {
            title: '批量修改',
            width: 400,
            okText: '确定',
            wrapClassName: 'piliang',
            bodyStyle: { padding: '10px 45px' },
            children: this.metaAction.loadApp('ttk-app-batch-card', {
                store: this.component.props.store,
            }),
        })
        if (res) {
            details.forEach((item, index) => {
                if (item.selected) {
                    details[index].propertyId = res.propertyId
                    if (res.inventoryRelatedAccountId != '') {
                        details[index].inventoryRelatedAccountId = res.inventoryRelatedAccountId
                        details[index].inventoryRelatedAccountName = res.inventoryRelatedAccountName
                    }
                    if (res.unitId != '') {
                        details[index].unitId = res.unitId
                    }
                }
            })

            let findEnumList = await this.webapi.findEnumList(),
                getAccount = await this.webapi.getAccount(),
                newAccount = []

            getAccount.glAccounts.forEach(item => {
                if (item.codeGrade1 == '1403' || item.codeGrade1 == '1405' || item.codeGrade1 == '1411' || item.codeGrade1 == '1408') {
                    newAccount.push(item)
                }
            })

            this.metaAction.sfs({
                'data.other.unit': fromJS(findEnumList.unitList),
                'data.other.subject': fromJS(newAccount),
                'data.other.subjects': fromJS(newAccount),
                'data.form.details': fromJS(details),
            })
        }
    }

    //跨行
    renderRowSpanCode = (record, index) => {
        return <span className="ttk-table-app-list-td-con">
            <span className="number" style={{ display: 'inline-block', height: '16px', minWidth: '53px' }} title={Number(index) + 1}>{Number(index) + 1}</span>
            {
                record.msg ? <span className='state_box1'><Icon className='lanmuicon_bkd' fontFamily='edficon' type="jinggao" title={record.msg} /></span> : null
            }
            {
                record.supplement ? <span class="vertical_left_top" title="自动补充" ></span> : null
            }
    </span>
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret

}