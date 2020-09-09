import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, is } from 'immutable'
import config from './config'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import { consts } from 'edf-consts'
import { Select } from 'edf-component'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.menuList = {}
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component

        this.injections = injections

        let option = {
            isGuide: this.component.props.isGuide,
            menuKey: this.component.props.isMenuCode
        }

        this.menuList = option
        injections.reduce('init', option)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.load()
    }
    selectRow = (rowIndex) => (e) => {
        this.metaAction.sf('data.other.searchFlag', false)
        this.injections.reduce('selectRow', rowIndex, e.target.checked);
    }
    delBatchSubjects = async (data) => {
        //批量删除科目
        let list = this.metaAction.gf('data.list'),
            subjectIds = [],
            selectedList = list.filter(item => item.get('selected') == true)

        if (data && data.id) {
            subjectIds.push(data.id)
        } else {
            selectedList.map(o => subjectIds.push(o.get('id')))
        }
        if (subjectIds.length == 0) {
            this.metaAction.toast('warning', '请选择要删除的科目')
            return
        }
        //走批量删除的逻辑
        let checkResponse = await this.webapi.checkBeforeDeleteWithBatch({ accountIds: subjectIds })
        let checkIds = []
        let hasDataArr = []
        let noDataArr = []
        let copyNoDataArr = [...subjectIds]
        let temp01 = []
        checkResponse.map(item => {
            if (item.status == 2) {
                checkIds.push(item.accountId)
            }

        })
        for (let i in checkIds) {
            temp01[checkIds[i]] = true
            hasDataArr.push(checkIds[i])
        }
        for (var k in copyNoDataArr) {
            if (!temp01[copyNoDataArr[k]]) {
                noDataArr.push(copyNoDataArr[k])
            }
        }

        if (hasDataArr.length == 0) {
            //选择的科目是没有数据的
            let delResponse = await this.webapi.deleteWithBatch({ accountIds: subjectIds, isReturnValue: true })
            //判断后端是否删除成功
            if (delResponse && delResponse.error && delResponse.error.code == 'UsedInTemplateOrGlTable') {
                //校验通过，可以删除
                const ret1 = await this.metaAction.modal('show', {
                    title: '提示',
                    children: this.getError(delResponse.error.message),
                    cancelText: '取消',
                    okText: '确定',
                    width: 400,
                    height: 250
                })
                if (ret1) {
                    let delResponse1 = await this.webapi.deleteWithBatch({ accountIds: subjectIds, confirmFlag: true, isReturnValue: true })
                    if (delResponse1 && delResponse1.error) {
                        this.metaAction.toast('error', delResponse1.error.message)
                        this.changeSubjects()

                    } else {
                        this.metaAction.toast('success', '删除成功')
                        this.changeSubjects()
                    }
                }
            } else {
                this.metaAction.toast('success', '删除成功')
                this.changeSubjects()
            }
        } else {
            let selectedSubjectCodes = []
            //批量选择的科目存在有数据的
            for (let i = 0; i < list.size; i++) {
                for (let j = 0; j < hasDataArr.length; j++) {
                    if (hasDataArr[j] == list.get(i).get('id')) {
                        list = list.update(i, item => item.set('selected', false))
                        selectedSubjectCodes.push(list.get(i).get('codeAndName'))
                    }
                }
            }
            const ret2 = await this.metaAction.modal('show', {
                title: '提示',
                children: this.getMessage(selectedSubjectCodes),
                cancelText: '取消',
                okText: '关闭',
                width: 500,
                // height: 250,
                wrapClassName: 'delBatchSubjects-modal'

            })
            // if(ret2){
            if (noDataArr.length == 0) {
                // this.metaAction.toast('warning', '请选择要删除的科目')
                this.metaAction.sf('data.list', fromJS(list))
                return
            }
            let delResponse2 = await this.webapi.deleteWithBatch({ accountIds: noDataArr, isReturnValue: true })
            if (delResponse2 && delResponse2.error && delResponse2.error.code == 'UsedInTemplateOrGlTable') {
                const ret3 = await this.metaAction.modal('show', {
                    title: '提示',
                    children: this.getError(delResponse2.error.message),
                    cancelText: '取消',
                    okText: '确定',
                    width: 400,
                    height: 250
                })
                if (ret3) {
                    let delResponse3 = await this.webapi.deleteWithBatch({ accountIds: noDataArr, confirmFlag: true, isReturnValue: true })
                    if (delResponse3 && delResponse3.error) {
                        this.metaAction.toast('error', delResponse3.error.message)
                        this.changeSubjects()
                    } else {
                        this.metaAction.toast('success', '删除成功')
                        this.changeSubjects()
                    }
                }
            } else {
                this.metaAction.toast('success', '删除成功')
                this.changeSubjects()
            }

            this.metaAction.sf('data.list', fromJS(list))
        }
    }
    getError = (message) => {
        let messArr = message.split('<br/>')
        return (
            <div>
                {
                    messArr.map(item => {
                        return (<div>
                            {item}
                        </div>)
                    })
                }
            </div>
        )
    }
    getMessage = (message) => {
        return (
            <div>
                {
                    message.map((item, index) => {
                        if (index == message.length - 1) {
                            return (
                                <div>{item}</div>
                            )
                        } else {
                            return (
                                <div>{item}、</div>
                            )
                        }

                    })
                }
                <div>科目已经产生数据，请确认后逐一删除</div>
            </div>
        )
    }
    load = () => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            accountingStandards = currentOrg.accountingStandards

        this.metaAction.sf('data.other.accountingStandards', accountingStandards)
        const appExtendParams = this.component.props && this.component.props.appExtendParams
        if (appExtendParams) {
            this.injections.reduce('financeInitBtnShow', appExtendParams)
            const dynParams = 'subjects'
            this.webapi.handEnteringStateTwo({ dynParams })
        }
        this.changeSubjects()
    }

    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = () => {
        this.metaAction.sf('data.other.matchBacktoZero', true)
        this.metaAction.sf('data.other.matchIndex', -1)
        this.metaAction.sf('data.other.searchFlag', false)
        let currentOrg = this.metaAction.context.get("currentOrg"),
            accountingStandards = currentOrg.accountingStandards

        let data = this.metaAction.gf('data') ? this.metaAction.gf('data').toJS() : ''
        if (data) {
            if (accountingStandards != data.other.accountingStandards && data.filter.targetList == '5000010003') {
                this.metaAction.sf('data.other.accountingStandards', accountingStandards)
                this.tabChange('all')
            } else {
                this.metaAction.sf('data.other.accountingStandards', accountingStandards)
                let targetList = this.metaAction.gf('data.filter.targetList')
                this.changeSubjects(targetList)
            }
        }

    }

    //修改科目编码规则
    setSubjectCode = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '科目编码设置',
            width: 650,
            bodyStyle: { padding: 6, fontSize: 12 },

            children: this.metaAction.loadApp('app-account-subjects-code', {
                store: this.component.props.store
            })
        })
        if (ret) {
            this.changeSubjects()
        }
    }

    //新增按钮是否可用
    disabledState = (subject) => {
        let state = false,
            { code, grade, cashTypeId, maxGrade} = subject
        if(grade >= maxGrade){
            state = true
        }
        // if (
        //     (code.slice(0, 4).indexOf('1012') != -1 && grade != 1 && grade != 2)
        //     // || (code.indexOf('1001') != -1 && grade == 1)
        //     || (cashTypeId == consts.CASHTYPE_033 && grade != 1)
        //     || ((cashTypeId == consts.CASHTYPE_034 || cashTypeId == consts.CASHTYPE_035 || cashTypeId == consts.CASHTYPE_036 || cashTypeId == consts.CASHTYPE_037) && grade != 2)
        //     || (code == '22210109')
        //     || (cashTypeId == consts.CASHTYPE_005) || (grade == 5)) {
        //     state = true
        // }
        return state
    }

    addSubject = (data) => async () => {
        //新增
        let { id, code, grade, cashTypeId } = data,
            gradeList = this.metaAction.gf('data.gradeSetting') && this.metaAction.gf('data.gradeSetting').toJS()
        if (grade == 5) {
            this.metaAction.toast('warning', '已经是第五级科目，无法再增加下级科目')
            return
        }
        if ((code.slice(0, 4).indexOf('1012') != -1 && grade != 1 && grade != 2)
            || (code == '22210401')
            // || (code.indexOf('1001') != -1 && grade == 1)
            || (cashTypeId == consts.CASHTYPE_033 && grade != 1)
            || ((cashTypeId == consts.CASHTYPE_034 || cashTypeId == consts.CASHTYPE_035 || cashTypeId == consts.CASHTYPE_036 || cashTypeId == consts.CASHTYPE_037) && grade != 2)
            || (code == '22210109')
            || (cashTypeId == consts.CASHTYPE_005)) {
            return
        }
        const oldData = this.metaAction.gf('data').toJS()
        let { list, other } = oldData,
            findFirstUnusedCode = await this.webapi.findFirstUnusedCode({ id: id, code: code, grade: grade }),
            newCode = findFirstUnusedCode.newCode.substr(code.length),
            gradeArr = Object.keys(gradeList),
            item = gradeArr.find(item => `${item}`.charAt(item.length - 1) == grade + 1)
        if (findFirstUnusedCode && findFirstUnusedCode.newCode == '') {//编码长度超过了原编码位数的最大值
            const ret = await this.metaAction.modal('show', {
                title: '设置',
                children: (
                    <div >
                        {code}科目下级科目编码已经超过了{findFirstUnusedCode.maxCodeSize9}位，请确认是否要增加对应科目级次的编码长度
                    </div>
                ),
                cancelText: '取消',
                okText: '确定',
                width: 400,
                height: 250
            })
            if (ret) {
                let gradeResponse = await this.webapi.getAccountGrade()
                gradeResponse[item] += 1
                let parmas = {
                    ...gradeResponse,
                    isReturnValue: true
                }
                const res = await this.webapi.setAccountGrade(parmas)
                if (res) {
                    if (res.error && res.error.message) {
                        this.metaAction.toast('error', res.error.message)
                        return false
                    } else {
                        this.metaAction.toast('success', '科目编码设置成功')
                        this.changeSubjects()
                    }
                    // return true
                }
            } else {
                return
            }

        }
        // let findFirstUnused = await this.webapi.findFirstUnusedCode({ id: id, code: code, grade: grade }),
        //     firstUnusedCode = findFirstUnused.newCode.substr(code.length)
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'add',
                newCode: newCode,
                data: data,
            })
        })
        if (ret) {
            this.changeSubjects()
            //本地刷新
            // this.injections.reduce('addSubject', ret, data.id)
        }
    }

    batchAddSubject = (data) => async () => {
        //批量新增
        let { id, code, grade, cashTypeId } = data
        if (grade == 5) {
            this.metaAction.toast('warning', '已经是第五级科目，无法再增加下级科目')
            return
        }
        if ((code.slice(0, 4).indexOf('1012') != -1 && grade != 1 && grade != 2)
            || (code == '22210401')
            // || (code.indexOf('1001') != -1 && grade == 1)
            || (cashTypeId == consts.CASHTYPE_033 && grade != 1)
            || ((cashTypeId == consts.CASHTYPE_034 || cashTypeId == consts.CASHTYPE_035 || cashTypeId == consts.CASHTYPE_036 || cashTypeId == consts.CASHTYPE_037) && grade != 2)
            || (code == '22210109')
            || (cashTypeId == consts.CASHTYPE_005)) {
            return
        }
        const ret = await this.metaAction.modal('show', {
            title: '可粘贴科目名称，多个科目请换行',
            width: 400,
            okText: '确定',
            style: { top: 140 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-account-subjects-batch-add', {
                store: this.component.props.store,
                parentId: id
            })
        })
        if (ret) {
            let maxSizeForBatchInsert = await this.webapi.getMaxSizeForBatchInsert({ id: id })
            let option = {
                parentId: id,
                accountNameList: ret.list
            },
                tip = '',
                isSyncBaseArchive
            if (ret.list.length > maxSizeForBatchInsert.maxSize) {
                // this.metaAction.sf('data.other.loading', true)
                const result = await this.metaAction.modal('show', {
                    title: '设置',
                    children: (
                        <div >
                            {code}科目下级科目编码已经超过了{maxSizeForBatchInsert.maxCodeSize9}位，请确认是否要增加对应科目级次的编码长度
                        </div>
                    ),
                    cancelText: '取消',
                    okText: '确定',
                    width: 400,
                    height: 250
                })
                if (result) {
                    let setGradeResponse = await this.webapi.setAccountGrade(maxSizeForBatchInsert.gradeSettingDto)
                    if (!setGradeResponse) {
                        // this.metaAction.sf('data.other.loading', false)
                        return
                    }
                } else {
                    if (maxSizeForBatchInsert.maxSize == 0) {
                        // this.metaAction.sf('data.other.loading', false)
                        return
                    }
                }
            }
            if (code.slice(0, 4) == '1122' || code.slice(0, 4) == '2202') {
                const res = await this.webapi.getSyncBABatch(option)
                if (res.syncBADtoUnExists.isParentEndNode && res.syncBADtoUnExists.hasRelationRecord) {
                    tip = `注：原创建${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${code.slice(0, 4) == '1122' ? '应收' : '应付'}科目变为非末级，请档案内对应科目。`
                }
                if (res.nameListUnExists.length !== 0) {//无与此下级科目同名称的客户档案
                    if (res.syncBADtoUnExists.isParentEndNode && res.syncBADtoUnExists.hasRelationRecord) {
                        tip = `注：原创建${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${code.slice(0, 4) == '1122' ? '应收' : '应付'}科目变为非末级，请档案内对应科目。`
                    }
                    const ret = await this.metaAction.modal('confirm', {
                        // title: '新增科目',
                        content: `是否生成同名${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}，并关联${code.slice(0, 4) == '1122' ? '应收' : '应付'}科目？${tip}`
                    })
                    if (ret) {
                        isSyncBaseArchive = true
                    } else {
                        isSyncBaseArchive = false
                    }
                    this.metaAction.sf('data.other.loading', true)
                    res.syncBADtoExists.isSyncBaseArchive = null
                    res.syncBADtoUnExists.isSyncBaseArchive = isSyncBaseArchive != undefined ? isSyncBaseArchive : null
                    option.batchSyncBADto = res
                    const response = await this.webapi.createBatchForSubSyncBA(option)
                    if (response) {
                        this.metaAction.toast('success', this.message(response.message), response.message.indexOf('<br>') != -1 ? 3 : 1)
                        // this.changeSubjects()
                    }
                }

                if (res.nameListExists.length !== 0) {//有与此下级科目同名称的客户档案
                    if (res.syncBADtoExists.isParentEndNode && res.syncBADtoExists.hasRelationRecord) {
                        tip = `注：原创建${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${code.slice(0, 4) == '1122' ? '应收' : '应付'}科目变为非末级，请档案内对应科目。`
                    }
                    const ret = await this.metaAction.modal('confirm', {
                        // title: '新增科目',
                        content: `${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}有与此科目名称相同的档案，是否关联同名${code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${code.slice(0, 4) == '1122' ? '应收' : '应付'}科目?${tip}`
                    })
                    if (ret) {
                        isSyncBaseArchive = true
                    } else {
                        isSyncBaseArchive = false
                    }
                    this.metaAction.sf('data.other.loading', true)
                    res.syncBADtoUnExists.isSyncBaseArchive = null
                    res.syncBADtoExists.isSyncBaseArchive = isSyncBaseArchive != undefined ? isSyncBaseArchive : null
                    option.batchSyncBADto = res
                    const response = await this.webapi.createBatchForSubSyncBA(option)
                    if (response) {
                        this.metaAction.toast('success', this.message(response.message), response.message.indexOf('<br>') != -1 ? 3 : 1)
                        // this.changeSubjects()
                    }
                }

            } else {
                this.metaAction.sf('data.other.loading', true)
                const response = await this.webapi.createBatchForSubSyncBA(option)
                if (response) {
                    this.metaAction.toast('success', this.message(response.message), response.message.indexOf('<br>') != -1 ? 3 : 1)
                    // this.changeSubjects()
                }
            }
            this.changeSubjects()

        }

    }
    message = (message) => {
        message = message.split('<br>')
        return (
            <div>
                {
                    message.map((o, i) => {
                        return (
                            <div>{o}</div>
                        )
                    })
                }
            </div>
        )
    }
    delmessage = (message) => {
        message = message.split('<br/>')
        return (
            <div>
                {
                    message.map((o, i) => {
                        return (
                            <div>{o}</div>
                        )
                    })
                }
            </div>
        )
    }
    //编辑
    editSubject = (data) => async () => {
        const list = this.metaAction.gf('data.list').toJS()
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            style: { top: 40 },
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'edit',
                data: data,
                parentSubject: getParentSubject(list, data.parentId),
            })
        })
        if (ret) {
            this.changeSubjects()
            //本地刷新
            // this.injections.reduce('updateSubject', ret)
        }
    }

    deleteSubject = async (data) => {
        if (!(!(data.isSystem && !data.isAllowDel) && data.isEndNode) || !data.isEnable)
            return
        let deleteAccountsResponse = await this.webapi.availableDeleteAccounts({ deleteAccountId: data.id, isReturnValue: true })
        if (deleteAccountsResponse && deleteAccountsResponse.length > 0) {
            const ret1 = await this.metaAction.modal('show', {
                title: '删除科目',
                children: this.availableDeleteAccounts(deleteAccountsResponse),
                cancelText: '取消',
                okText: '确定',
                width: 500,
                height: 250
            })
            if (ret1) {
                let selectedAccountId = this.metaAction.gf('data.other.selectedAccountId')
                let hasDataDeleteReponse = await this.webapi.deleteWithOne({ deleteAccountId: data.id, selectedAccountId: selectedAccountId, isReturnValue: true })
                if (hasDataDeleteReponse == true) {
                    this.metaAction.toast('success', '删除成功')
                    this.changeSubjects()

                } else if (hasDataDeleteReponse && hasDataDeleteReponse.error && hasDataDeleteReponse.error.code == 'UsedInTemplateOrGlTable') {
                    //删除科目已经在报表公式中使用过或者有凭证模板等，需要提示异常信息进行交互
                    const ret3 = await this.metaAction.modal('show', {
                        title: '删除科目',
                        children: this.delmessage(hasDataDeleteReponse.error.message),
                        cancelText: '取消',
                        okText: '确定',
                        width: 500,
                        height: 250
                    })
                    if (ret3) {
                        let hasDataDeleteReponseFlag = await this.webapi.deleteWithOne({ deleteAccountId: data.id, selectedAccountId: selectedAccountId, isReturnValue: true, confirmFlag: true })
                        if (hasDataDeleteReponseFlag == true) {
                            this.metaAction.toast('success', '删除成功')
                            this.changeSubjects()
                        } else if (hasDataDeleteReponseFlag && hasDataDeleteReponseFlag.error) {
                            this.metaAction.toast('error', hasDataDeleteReponseFlag.error.message)
                            return
                        }
                    }
                } else if (hasDataDeleteReponse && hasDataDeleteReponse.error && !hasDataDeleteReponse.error.code) {
                    this.metaAction.toast('error', hasDataDeleteReponse.error.message)
                    return
                }
            }
        } else if (deleteAccountsResponse && deleteAccountsResponse.length == 0) {
            //无数据
            let noDataDeleteReponse = await this.webapi.deleteWithOne({ deleteAccountId: data.id, isReturnValue: true })
            if (noDataDeleteReponse == true) {
                this.metaAction.toast('success', '删除成功')
                this.changeSubjects()
            } else if (noDataDeleteReponse && noDataDeleteReponse.error && noDataDeleteReponse.error.code == 'UsedInTemplateOrGlTable') {
                const ret2 = await this.metaAction.modal('show', {
                    title: '删除科目',
                    children: this.delmessage(noDataDeleteReponse.error.message),
                    cancelText: '取消',
                    okText: '确定',
                    width: 500,
                    height: 250
                })
                if (ret2) {
                    let noDataDeleteReponseFlag = await this.webapi.deleteWithOne({ deleteAccountId: data.id, isReturnValue: true, confirmFlag: true })
                    if (noDataDeleteReponseFlag == true) {
                        this.metaAction.toast('success', '删除成功')
                        this.changeSubjects()
                    } else if (noDataDeleteReponseFlag && noDataDeleteReponseFlag.error) {
                        this.metaAction.toast('error', noDataDeleteReponseFlag.error.message)
                        return
                    }
                }
            } else if (noDataDeleteReponse && noDataDeleteReponse.error && !noDataDeleteReponse.error.code) {
                this.metaAction.toast('error', noDataDeleteReponse.error.message)
                return
            }
        } else if (deleteAccountsResponse && deleteAccountsResponse.result == false) {
            //有数据，但是没有符合条件的可选科目
            this.metaAction.toast('error', '同级科目内找不到相同核算属性的可用科目')
            return
        }

    }
    availableDeleteAccounts = (deleteAccountsResponse) => {
        let accountChildren = []
        if (deleteAccountsResponse.length > 1) {
            deleteAccountsResponse.forEach((item, index) => {
                accountChildren.push(<Option title={item.codeAndName} _data={item} value={item.id}>{item.codeAndName}</Option>)
            })
        }
        this.metaAction.sf('data.other.selectedAccountId', deleteAccountsResponse[0].id)
        let selectedAccountId = this.metaAction.gf('data.other.selectedAccountId') ? this.metaAction.gf('data.other.selectedAccountId') : deleteAccountsResponse[0].id

        return (
            <div style={{ fontSize: '12px' }} className="availableDelete-modal">
                <span>删除科目后，原科目的历史数据将会更新至 </span>
                {deleteAccountsResponse.length == 1 ?
                    <span>{deleteAccountsResponse[0].codeAndName}</span>
                    :
                    <Select
                        defaultValue={deleteAccountsResponse[0].id}
                        // value={Number(selectedAccountId)}
                        filterOption={(inputValue, option) => this.filterOption(inputValue, option, fromJS(deleteAccountsResponse))}
                        onSelect={(value, ) => this.handleSelectChange(value)}
                        dropdownClassName={'accounts-availableDelete'}
                    >{accountChildren}</Select>
                }
                <div>是否确认修改?</div>
                <div style={{ color: '#FA954C', marginTop: '20px' }}>注：删除过程不可逆，请确认后删除</div>
            </div>
        )
    }
    handleSelectChange = async (value) => {
        this.metaAction.sf('data.other.selectedAccountId', value)
    }
    filterOption = (inputValue, option, dataSource) => {
        if (option && option.props && option.props.value) {
            let itemData = dataSource.find(o => o.get('id') == option.props.value)
            if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
                || (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
                || (itemData.get('codeAndName') && itemData.get('codeAndName').indexOf(inputValue) == 0)
                || (itemData.get('helpCode') && itemData.get('helpCode').toUpperCase().indexOf(inputValue.toUpperCase()) != -1)
                || (itemData.get('helpCodeFull') && itemData.get('helpCodeFull').indexOf(inputValue) != -1)) {

                return true
            }
            else {
                return false
            }
        }
        return true
    }
    getMsgContent = (text) => {
        let arr = text && text.split('\n')
        return (
            <div className="declareState-content">
                {arr.map(o => {
                    return (<div>{o}</div>)
                })}
            </div>
        )
    }
    isTabDisplay = (tabName) => {
        let accountingStandards = this.metaAction.gf('data.other.accountingStandards'),
            isDisplay = true

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            // 共同 权益 成本 损益
            if (tabName == 'common' || tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
                isDisplay = true
                // 净资产 收入 费用
            } else if (tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
                isDisplay = false
            }
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
            // 权益 成本 损益
            if (tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
                isDisplay = true
                // 共同 净资产 收入 费用
            } else if (tabName == 'common' || tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
                isDisplay = false
            }
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            // 共同 权益 成本 损益
            if (tabName == 'common' || tabName == 'rightsInterests' || tabName == 'cost' || tabName == 'profitLoss') {
                isDisplay = false
                // 净资产 收入 费用
            } else if (tabName == 'netAssets' || tabName == 'income' || tabName == 'expenses') {
                isDisplay = true
            }
        }

        return isDisplay
    }

    getErrorMessage = (message) => {
        return (
            <div>
                {
                    message.map(item => {
                        return (
                            <div>{item}</div>
                        )
                    })
                }
            </div>
        )
    }
    getClassName = (rowIndex, item) => {
        let className = '',
            scrollRow = this.metaAction.gf('data.other.detailsScrollToRow')
        let columns = []

        if (rowIndex == 4) {
            if (rowIndex == scrollRow) {
                className = 'app-account-subjects-cell-left-coderange currentScrollRow'
            } else {
                className = 'app-account-subjects-cell-left-coderange'
            }

        } else {
            if (rowIndex == scrollRow) {
                className = 'app-account-subjects-cell-left currentScrollRow'
            } else {
                className = 'app-account-subjects-cell-left'
            }
        }
        return className
    }
    changeSubjects = async (activeKey) => {
        // this.metaAction.sf('data.other.loading', true)
        this.metaAction.sf('data.other.searchFlag', false)
        const newData = this.metaAction.gf('data').toJS()
        let option = {},
            key = activeKey || newData.filter.targetList
        if (key !== 'all') {
            option.accountTypeId = key
        }
        if (activeKey && !newData.other.loading) {
            this.metaAction.sf('data.other.loading', true)
        }

        const response = await this.webapi.query(option)
        newData.list = response.glAccounts
        newData.other.calcDict = { ...response.calcDict }
        newData.other.loading = false
        newData.gradeSetting = response.gradeSetting
        this.injections.reduce('load', newData)
    }

    onExit = (tour) => {
        const intro = tour
        if (intro.action == 'skip' || intro.status == 'finished') {
            let stepEnabled = this.metaAction.gf('data.other.stepEnabled')
            if (stepEnabled == true) {
                this.metaAction.sf('data.other.stepEnabled', false)
                let params = { "menuId": this.menuList.menuKey, "isVisible": false }
                this.webapi.updateGuide(params)
                this.component.props.closeGuide &&
                    this.component.props.closeGuide(this.component.props.appName)
            }
        }
    }
    /**
     * 财务期初-上一步
     */
    preStep = async () => {
        if (this.component.props) {
            const appParams = this.component.props && this.component.props.appExtendParams
            this.component.props.setPortalContent('上传数据', 'ttk-gl-app-financeinit-uploaddata', appParams)
        }
    }
    /**
    * 财务期初-下一步
    */
    nextStep = async () => {
        if (this.component.props) {
            let appParams = this.component.props && this.component.props.appExtendParams,
                preStep = 'app-account-subjects-financeinit'
            appParams.key = 'manualEentry'
            //ttk-gl-app-finance-periodbegin app-account-beginbalance
            this.component.props.setPortalContent('确认数据', 'ttk-gl-app-finance-periodbegin', { preStep, ...appParams })
        }
    }
    tabChange = async (key) => {
        this.metaAction.sf('data.other.searchFlag', true)
        this.metaAction.sf('data.filter.targetList', key)
        this.metaAction.sf('data.other.loading', true)
        this.metaAction.sf('data.other.matchBacktoZero', true)
        this.metaAction.sf('data.other.matchIndex', -1)

        this.changeSubjects(key)
        window['app-account-subjects-content-grid'] = 0
    }
    pressEnter = (e) => {

    }

    fixPosition = (condition, e) => {
        let cond = sessionStorage.getItem('searchValue')
        this.injections.reduce('fixPosition', cond)
    }
    searchChange = (value) => {
        sessionStorage.setItem('searchValue', value)
    }
    addPrimarySubject = async () => { //新增一级科目
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'addPrimarySubject',
                setPortalContent: this.component.props.setPortalContent && this.component.props.setPortalContent
            })
        })
        if (ret) {
            this.changeSubjects()
            
        }
    }

    componentDidMount = () => {
        const win = window
        if (win.addEventListener) {
            document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (win.attachEvent) {
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
        }
    }

    componentWillUnmount = () => {
        window['app-account-subjects-content-grid'] = 0
        const win = window
        if (win.removeEventListener) {
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
            win.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (win.detachEvent) {
            win.detachEvent('onTabFocus', this.onTabFocus)
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
        }
        sessionStorage.removeItem("searchValue")
    }

    bodyKeydownEvent = (e) => {
        const dom = document.getElementsByClassName('app-account-subjects')
        if (dom && dom.length > 0) {
            this.keyDownCickEvent({ event: e })
        }
    }

    //监听键盘事件
    keyDownCickEvent = (keydown) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            const editStatus = this.metaAction.gf('data.other.editStatus')

            if (e.key == "Enter" || e.keyCode == 13) {
                if (document.activeElement && document.activeElement.placeholder == '请输入编码/名称') {
                    if (e.preventDefault) {
                        e.preventDefault()
                    }
                    if (e.stopPropagation) {
                        e.stopPropagation()
                    }
                }
                let condition = this.metaAction.gf('data.other.positionCondition')
                this.fixPosition(condition)
            }
        }
    }

    numberFormat = utils.number.format
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction })

    const ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

//获取父级科目信息
function getParentSubject(subjectList, parentSubjectId) {
    ////
    if (!parentSubjectId) {
        return { id: null, code: '无父级科目', name: '', codeAndName: null, accountTypeId: null }
    }

    let parentSubject = subjectList.filter(subItem => {
        return parseInt(subItem.id) == parseInt(parentSubjectId)
    })

    let ret
    if (parentSubject && parentSubject.length > 0)
        ret = {
            id: parentSubject[0].id,
            code: parentSubject[0].code,
            name: parentSubject[0].name,
            codeAndName: parentSubject[0].codeAndName,
            accountTypeId: parentSubject[0].accountTypeId
        }
    else
        ret = { id: null, code: '无父级科目', name: null, codeAndName: null, accountTypeId: null }

    return ret
}

//num传入的数字，n需要的字符长度
function PrefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}
// //生成新的科目编码

function generateNewSubCode(parentId, parentCode, subjectList, parentGrade, gradeList) {
   
    let newCode,
        grade = Object.keys(gradeList),
        newSubjectList = subjectList.filter(subItem => {
            return parseInt(subItem.parentId) == parseInt(parentId)
        }),
        item = grade.find(item => `${item}`.charAt(item.length - 1) == parentGrade + 1)
    if (newSubjectList.length == 0) {
        newCode = PrefixInteger('1', gradeList[item])
    } else {
        let endGradeList = []
        for (var i = 0; i < newSubjectList.length; i++) {
            let code = newSubjectList[i].code
            endGradeList.push(code.substr(-gradeList[item]))
        }
        endGradeList = endGradeList.sort(sortNumber)
        let maxCode = endGradeList[endGradeList.length - 1]

        if (endGradeList.length < Array(gradeList[item]).join(9) + '9') {

            for (let i = 0; i < endGradeList.length; i++) {
                if (endGradeList[i + 1] - endGradeList[i] > 1) {
                    maxCode = endGradeList[i]
                    break;
                }
            }

            newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
           
        } else {
            return false
        }
    }
    return newCode
}

function sortNumber(a, b) {
    return a - b
}
