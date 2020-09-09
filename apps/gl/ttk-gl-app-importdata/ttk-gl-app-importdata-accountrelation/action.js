import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import utils from 'edf-utils'
import extend from './extend'
import { consts } from 'edf-consts'
import { InfiniteListScroller, Icon, Popover } from 'edf-component'
import { debug } from 'util';
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.enadble = true
    }
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        const params = this.component.props
        this.load(params)
    }

    load = async (params) => {
        if (params.param) {//税检宝
            console.log('sjb参数', params.param)
            this.injections.reduce('initsjb', params.param)
            const { fileId, qyid } = params.param
            if (!fileId) {
                this.metaAction.toast('warning', 'url缺少参数,fileId不能为空')
                this.metaAction.sf('data.other.display', false)
                return
            }
            if (!qyid) {
                this.metaAction.toast('warning', 'url缺少参数,qyid不能为空')
                this.metaAction.sf('data.other.display', false)
                return
            }
            this.metaAction.sf('data.other.loading', true)
            const uploadfile = await this.webapi.importapi.saveImportAccountInfoForThirdParty({ fileId })
            this.metaAction.sf('data.other.loading', false)
            if (!uploadfile) {
                this.metaAction.sf('data.other.display', false)
                return
            }
        }
        let screenWidth = window.screen.width   //小分辨率去掉目标科目币种、计量单位列
        if (screenWidth <= 1280) {
            this.metaAction.sf('data.other.colvisible', false)
        } else {
            this.metaAction.sf('data.other.colvisible', true)
        }
        this.changeSubjects('init')
    }
    /**
     * 停用
    */
    isEnableTitle = (type, option) => {
        if (type == 'sourceStatus') {
            return option && option.glAccountId
                ? option && option[type]
                    ? '否' : '是' : ''
        } else if (type == 'isEnable') {
            return option && option.accountDto.id
                ? option.accountDto[type]
                    ? '否' : '是' : ''
        }
    }
    /**
      * 渲染辅助项
      */
    renderNameAndAux = (item) => {
        if (!item) {
            return ''
        }
        return (
            <span title={item.sourceName} style={{ display: 'flex', 'justify-content': 'space-between', paddingRight: '2px', 'align-items': 'center' }}>
                <span style={{
                    'text-overflow': 'ellipsis',
                    'overflow': 'hidden',
                    'white-space': 'nowrap'
                }}>
                    {item.sourceName}
                </span>
                {

                    item.sourceCalcNames ?
                        <Popover placement="topLeft" content={item.sourceCalcNames} overlayClassName='accountrelation-popover'>
                            <Icon className='souceauxaccounttips' fontFamily='edficon' type="fuzhuxiang" />
                        </Popover>
                        :
                        ''
                }
            </span>
        )
    }
    /**
     * 渲染操作列
     */
    renderOperate = (item, rowIndex) => {
        if (!item) {
            return ''
        }
        if (!item.accountDto) {
            return ''
        }

        let params = item.accountDto, isDisabledAdd = this.disabledState(params),
            isDisabledDel = !(!(params.isSystem && !params.isAllowDel) && params.isEndNode && params.isEnable),
            isDisabledEdit = params && params.id ? false : true,
            id = item && item.id
        return (
            <span>
                <Icon name='add' disabled={isDisabledAdd} type="xinzengkemu" onClick={!isDisabledAdd ? this.addAccount(item, params, rowIndex, id) : null} fontFamily="edficon" title='新增' style={{ fontSize: '24px', color: '#0066B3' }} />
                <Icon name='batchadd' disabled={isDisabledAdd} type="piliangzengjia" onClick={!isDisabledAdd ? this.batchAddSubject(item, params, rowIndex, id) : null} fontFamily="edficon" title='批量新增' style={{ fontSize: '24px' }} />
                <Icon name='edit' type="bianji" disabled={isDisabledEdit} onClick={!isDisabledEdit ? this.editAccount(item, params, id) : null} fontFamily="edficon" title='编辑' style={{ fontSize: '24px' }} />
                <Icon name='del' disabled={isDisabledDel} onClick={!isDisabledDel ? this.deleteAccount(item, params, id) : null} type="shanchu" fontFamily="edficon" title='删除' style={{ fontSize: '24px' }} />
            </span>
        )
    }
    /**
     * 科目 增删改 后置处理
     */
    changeSubjects = async (params) => {
        this.metaAction.sf('data.other.loading', true)
        let step = await this.webapi.importapi.getImpAccountStep()
        switch (step) {
            case 1:
                //需要请求基础档案数据和科目初始化
                await this.firstStep()
                break;
            case 2:
                //这一步是导入科目
                await this.secondStep()
                break;
            case 3:
                //这一步是科目对照
                await this.thirdStep()
                break;
            case 4:
                //这一步是科目对照
                await this.thirdStep()
                break;
        }
        if (params == 'init') {
            return
        }
        let condition = this.metaAction.gf('data.other.positionCondition')
        this.injections.reduce('fixPosition', condition)
    }
    /**
     * 数据定位
     */
    fixPosition = (condition) => {
        this.injections.reduce('fixPosition', condition)
        const sjbData = this.metaAction.gf('data.sjb')
        if (sjbData) {
            this.injections.reduce('setScroll', condition)
        }

    }
    searchChange = (value) => {
        this.injections.reduce('searchChange', value)
    }
    /**
     * 选择匹配类型
     */
    selectMatchType = async (value, option) => {
        this.metaAction.sf('data.other.matchType', value)
        this.pageChanged(1) //切换匹配类型，需求要求按第一页重新查找
        //计算滚动条
        setTimeout(() => {
            this.onResize()
        }, 20)
    }
    getMatchInitAsync = async (param) => {
        let matchInitSeq = await this.webapi.importapi.matchInitAsync(param), matchInitStatus
        if (matchInitSeq) {
            let matchInittimer = setInterval(async () => {
                matchInitStatus = await this.webapi.importapi.getMatchInitStatus({ sequenceNo: matchInitSeq, isReturnValue: true })
                if (matchInitStatus.matchInitState == 'STATUS_RESPONSE') {
                    clearTimeout(matchInittimer)
                    const param = await this.sortParmas(null, null, 'get'),
                        accountList = await this.webapi.importapi.accountQuery('all'),
                        accountGrade = await this.webapi.importapi.getAccountGrade()
                    let matchList = await this.webapi.importapi.queryMatchData(param)
                    if (matchList) {
                        const isCanNotToNextStep = matchList && matchList.data.length < 1 ? true : false
                        await this.webapi.importapi.setImpAccountStep({ step: 3 })
                        this.injections.reduce('load', matchList, accountList, isCanNotToNextStep, accountGrade)
                    }
                    this.metaAction.sf('data.other.loading', false)
                } else if (matchInitStatus.matchInitState == 'STATUS_EXCEPTION') {
                    clearTimeout(matchInittimer)
                    this.metaAction.sf('data.other.loading', false)
                    const ret = await this.metaAction.modal('show', {
                        title: '设置',
                        children: (
                            <div >
                                {matchInitStatus.matchInitMessage}
                            </div>
                        ),
                        cancelText: '取消',
                        okText: '确定',
                        width: 400,
                        height: 250
                    })
                    if (ret) {
                        this.metaAction.sf('data.other.loading', true)
                        await this.getMatchInitAsync({ newGradeSetting: matchInitStatus.newGradeSetting })
                    } else {
                        this.metaAction.sf('data.other.loading', true)
                        await this.getMatchInitAsync({ isIgnoreNoEnoughCode: true })
                    }
                } else if (matchInitStatus.error && matchInitStatus.error.message) {
                    clearTimeout(matchInittimer)
                    this.metaAction.sf('data.other.loading', false)
                    this.metaAction.toast('error', `${matchInitStatus.error.message}`)
                }
            }, 3000)
        } else {
            this.metaAction.sf('data.other.loading', false)
        }
    }
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })
        this.sortParmas(null, page)
    }
    /**
    * 组装搜索条件
    */
    sortParmas = async (search, pages, type) => {
        if (!search) {
            search = this.metaAction.gf('data.other.matchType')
        }
        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        let page = utils.sortSearchOption(pages, null, ['total', 'totalCount', 'totalPage'])
        if (type == 'get') {
            return { 'type': search, page }
        }
        const loading = this.metaAction.gf('data.other.loading')
        if (!loading) {
            this.injections.reduce('loading', true)
        }
        const res = await this.webapi.importapi.queryMatchData({ 'type': search, page })
        this.injections.reduce('loading', false)
        if (res) {
            let condition = this.metaAction.gf('data.other.positionCondition'), sfsData = {}
            sfsData['data.list'] = fromJS(res.data)
            sfsData['data.pagination'] = fromJS(res.page)
            this.metaAction.sfs(sfsData)
            this.injections.reduce('fixPosition', condition)
        }
    }

    firstStep = async () => {
        //新代账edf 管家 ba
        let appVersion = this.component.props.appVersion
        let importDataSeq = appVersion == 114 ? await this.webapi.importapi.importDataAsyncXdz() : await this.webapi.importapi.importDataAsync(),
            importDataStatus
        if (importDataSeq) {
            let basearchivetimer = setInterval(async () => {
                importDataStatus = appVersion == 114 ? await this.webapi.importapi.importDataStatusXdz({ sequenceNo: importDataSeq, isReturnValue: true }) : await this.webapi.importapi.importDataStatus({ sequenceNo: importDataSeq, isReturnValue: true })
                if (importDataStatus.error && importDataStatus.error.message) {
                    clearTimeout(basearchivetimer)
                    this.metaAction.sf('data.other.loading', false)
                    const ret = await this.metaAction.modal('error', {
                        title: '提示',
                        content: (
                            <div>
                                {importDataStatus.error.message}
                            </div>
                        ),
                        okText: '确定',
                        width: 400,
                        height: 250
                    })
                    if (ret) {
                        this.component.props.closeModal(true)
                        return
                    }
                }
                if (importDataStatus == 1) {
                    clearTimeout(basearchivetimer)
                    await this.webapi.importapi.setImpAccountStep({ step: 2 })
                    await this.getMatchInitAsync()
                }
            }, 3000)
        } else {
            this.metaAction.sf('data.other.loading', false)
        }
    }

    secondStep = async () => {
        const param = await this.sortParmas(null, null, 'get')
        let matchList = await this.webapi.importapi.queryMatchData(param)
        if (matchList && matchList.needMatch) {
            await this.getMatchInitAsync()
        } else {
            const accountList = await this.webapi.importapi.accountQuery('all'),
                accountGrade = await this.webapi.importapi.getAccountGrade()
            const isCanNotToNextStep = matchList && matchList.data.length < 1 ? true : false
            await this.webapi.importapi.setImpAccountStep({ step: 3 })
            this.injections.reduce('load', matchList, accountList, isCanNotToNextStep, accountGrade)
        }
        this.metaAction.sf('data.other.loading', false)
    }

    thirdStep = async () => {
        const param = await this.sortParmas(null, null, 'get'),
            accountList = await this.webapi.importapi.accountQuery('all'),
            accountGrade = await this.webapi.importapi.getAccountGrade(),
            matchList = await this.webapi.importapi.queryMatchData(param)
        if (matchList) {
            const isCanNotToNextStep = matchList.data.length < 1 && (param.type != 2 && param.type != 3) ? true : false
            this.injections.reduce('load', matchList, accountList, isCanNotToNextStep, accountGrade)
            //计算滚动条
            setTimeout(() => {
                this.onResize()
            }, 20)
        }
        this.metaAction.sf('data.other.loading', false)

    }

    /**
     * 判断操作按钮的状态
     */
    disabledState = (subject) => {
        let state = false,
            { code, grade, cashTypeId, id } = subject
        if (!code || !id) {
            return true
        }
        if ((code.indexOf('1012') != -1 && grade != 1 && grade != 2)
            || (code == '22210401')
            // || (code.indexOf('1001') != -1 && grade == 1)
            || (cashTypeId == 5000020033 && grade != 1)
            || ((cashTypeId == 5000020034 || cashTypeId == 5000020035 || cashTypeId == 5000020036 || cashTypeId == 5000020037) && grade != 2)
            || (code == '22210109')
            || (cashTypeId == 5000020005) || grade == 5) {
            state = true
        }
        return state
    }

    /**
     * 新增
     */
    addAccount = (item, data, rowIndex, relationId) => async () => {
        console.log(item, data, rowIndex, relationId)
        let { id, code, grade, cashTypeId, accountTypeId } = data
        let gradeList = this.metaAction.gf('data.other.gradeList').toJS()
        if (grade == 5) {
            this.metaAction.toast('warning', '已经是第五级科目，无法再增加下级科目。')
            return
        }
        if ((code.indexOf('1012') != -1 && grade != 1 && grade != 2)
            || (code == '22210401')
            // || (code.indexOf('1001') != -1 && grade == 1)
            || (cashTypeId == 5000020033 && grade != 1)
            || ((cashTypeId == 5000020034 || cashTypeId == 5000020035 || cashTypeId == 5000020036 || cashTypeId == 5000020037) && grade != 2)
            || (code == '22210109')
            || (cashTypeId == 5000020005)) {
            return
        }
        const accountList = await this.webapi.importapi.accountQuery({ "accountTypeId": accountTypeId })
        const list = accountList && accountList.glAccounts
        const sjbData = this.metaAction.gf('data.sjb')
        let findFirstUnusedCode = await this.webapi.importapi.findFirstUnusedCode({ id: id, code: code, grade: grade }),
            newCode = findFirstUnusedCode.newCode.substr(code.length),
            gradeArr = Object.keys(gradeList),
            option = gradeArr.find(item => `${item}`.charAt(item.length - 1) == grade + 1)
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
                let gradeResponse = await this.webapi.importapi.getAccountGrade()
                gradeResponse[option] += 1
                let parmas = {
                    ...gradeResponse,
                    isReturnValue: true
                }
                const res = await this.webapi.importapi.setAccountGrade(parmas)
                if (res) {
                    if (res.error && res.error.message) {
                        this.metaAction.toast('error', res.error.message)
                        return false
                    } else {
                        this.metaAction.toast('success', '科目编码设置成功')
                        this.changeSubjects(undefined, true)
                    }
                    // return true
                }
            } else {
                return
            }

        }
        let findFirstUnused = await this.webapi.importapi.findFirstUnusedCode({ id: id, code: code, grade: grade }),
            firstUnusedCode = findFirstUnused.newCode.substr(code.length)
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            okText: '保存',
            style: sjbData ? { top: 10 } : { top: 40 },
            bodyStyle: sjbData ? { padding: 0, paddingLeft: 24, paddingBottom: 24, paddingRight: 24, fontSize: 12 } : { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'add',
                newCode: firstUnusedCode,
                data: data,
                item: item
            })
        })
        if (ret) {
            await this.changeSubjects()
        }
    }

    /**
     * 批量新增
     */
    batchAddSubject = (item, data, rowIndex, relationId) => async () => {
        let { id, code, grade, cashTypeId } = data
        if (grade == 5) {
            this.metaAction.toast('warning', '已经是第五级科目，无法再增加下级科目')
            return
        }
        if ((code.indexOf('1012') != -1 && grade != 1 && grade != 2)
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
                parentId: id,
                item: item
            })
        })
        if (ret) {
            let maxSizeForBatchInsert = await this.webapi.importapi.getMaxSizeForBatchInsert({ id: id })
            let option = {
                parentId: id,
                accountNameList: ret.list
            }
            if (ret.list.length > maxSizeForBatchInsert.maxSize) {
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
                    let setGradeResponse = await this.webapi.importapi.setAccountGrade(maxSizeForBatchInsert.gradeSettingDto)
                    if (!setGradeResponse) {
                        return
                    }
                } else {
                    if (maxSizeForBatchInsert.maxSize == 0) {
                        return
                    }
                }
            }
            // LoadingMask.show()
            this.metaAction.sf('data.other.loading', true)
            const response = await this.webapi.importapi.batchAdd(option)
            // LoadingMask.hide()
            if (response) {
                if (ret.item) {
                    await this.afterOperateDataModal({ ...ret.item, operateType: '0', isReturnValue: true })

                }
                this.metaAction.toast('success', this.message(response.message), response.message.indexOf('<br>') != -1 ? 3 : 1)
                this.changeSubjects()
            }
        }
    }

    afterOperateDataModal = async (param) => {
        let importdata
        importdata = await this.webapi.importapi.afterOperateTargetGlAccount(param)
        if (importdata.error && importdata.error.message) {
            return
        }
        if (importdata && importdata.status == false) {
            const importRet = await this.metaAction.modal('show', {
                title: '设置',
                children: (
                    <div >
                        {importdata.errMessage}
                    </div>
                ),
                cancelText: '取消',
                okText: '确定',
                width: 400,
                height: 250
            })
            if (importRet) {
                await this.afterOperateDataModal({ ...param, newGradeSetting: importdata.newGradeSetting, isReturnValue: true })
            } else {
                await this.afterOperateDataModal({ ...param, isIgnoreNoEnoughCode: true, isReturnValue: true })
            }
        }
    }

    /**
     * 编辑
     */
    editAccount = (item, data, relationId) => async () => {
        const list = this.metaAction.gf('data.list').toJS()
        const sjbData = this.metaAction.gf('data.sjb')
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            style: sjbData ? { top: 10 } : { top: 40 },
            bodyStyle: sjbData ? { padding: 0, paddingLeft: 24, paddingBottom: 24, paddingRight: 24, fontSize: 12 } : { padding: 24, fontSize: 12 },
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'edit',
                data: data,
                parentSubject: getParentSubject(list, data.parentId),
            })
        })
        if (ret) {
            await this.changeSubjects()
        }
    }

    /**
     * 删除
     */
    deleteAccount = (item, data, relationId) => async () => {
        if (!(!(data.isSystem && !data.isAllowDel) && data.isEndNode) || !data.isEnable)
            return
        let { id, parentId, ts, code } = data, option = {}
        option.id = id
        option.ts = ts
        let checkResponse = await this.webapi.importapi.checkBeforeDelete({ accountId: id })
        if (checkResponse == '') {
            const ret = await this.metaAction.modal('confirm', {
                content: '确认删除?'
            })
            if (ret) {

                const response = await this.webapi.importapi.delete(option)
                let isDelCurSubject
                //判断后端是否删除成功
                if (response == '') {
                    isDelCurSubject = true
                    let data = await this.webapi.importapi.afterOperateTargetGlAccount({ sourceCode: item.sourceCode, operateType: '1', sourceGrade: item.sourceGrade, targetIsEndNode: item.accountDto.isEndNode })
                    if (!data) {
                        return
                    }
                    this.metaAction.toast('success', '删除成功')
                    await this.changeSubjects()
                } else {
                    isDelCurSubject = false  //科目已经被使用，不能删除，只能更改状态
                    this.injections.reduce('deleteAccount', id, parentId, isDelCurSubject, rowIndex)
                }
            }
        } else {
            //校验没通过
            const result = await this.metaAction.modal('show', {
                title: '提示',
                children: (
                    <div >
                        {this.getMsgContent(checkResponse)}
                    </div>
                ),
                cancelText: '取消',
                okText: '确定',
                width: 400,
                height: 250
            })
            if (result) {

                const response = await this.webapi.importapi.delete(option)
                let isDelCurSubject
                //判断后端是否删除成功
                if (response == '') {
                    isDelCurSubject = true
                    let data = await this.webapi.importapi.afterOperateTargetGlAccount({ sourceCode: item.sourceCode, operateType: '1', sourceGrade: item.sourceGrade, targetIsEndNode: item.accountDto.isEndNode })
                    if (!data) {
                        return
                    }
                    this.metaAction.toast('success', '删除成功')
                    await this.changeSubjects()
                } else {
                    isDelCurSubject = false  //科目已经被使用，不能删除，只能更改状态
                    this.injections.reduce('deleteAccount', id, parentId, isDelCurSubject, rowIndex)
                }
            }
        }

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

    /**
     * 内容提醒
     */
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

    //表格拖宽
    onColumnResizeEnd = async (newColumnWidth, columnKey) => {
    }

    /**
     * 渲染错误提示cell单元格内容
     */
    renderMsgColumns = (currentRow, index) => {
        if (!currentRow) {
            return
        }
        const { res, resdesc } = this.getAhrefAutoMatch(currentRow, index),
            msglength = (resdesc && resdesc.length) || 100
        const isMulLine = 12 * msglength < 178
        return (
            <div className={isMulLine ? "accountrelation-content-msgcell" : "accountrelation-content-msgcell accountrelation-content-lineheight"}>
                {res}
            </div>
        )
    }
    /**
     * 根据返回的状态，重新加载界面的展现内容
     */
    getAhrefAutoMatch = (currentRow, index) => {
        /**
        * "autoMatch": 1,    
        * 0:什么都不显示 
        * 1:已匹配科目 
        * 2:系统自动创建 
        * 3:系统自动创建（重新匹配） 
        * -3:系统自动创建（重新匹配/确认） 
        * 4:重新匹配 
        * -4:重新匹配/确认 
        * 5:已匹配科目（重新匹配）
        * -5：重新匹配        
        */
        let res, resdesc
        if (!currentRow) {
            return res
        }
        let autoMatch = currentRow.autoMatch
        switch (autoMatch) {
            case 0:
                res = <span></span>
                resdesc = ''
                break;
            case 1:
                res = <Icon type="XDZzhuangtai-yiwancheng" fontFamily='edficon' className='yiwancheng' />
                resdesc = '已匹配科目'
                break;
            case 2:
                res = <span>
                    系统创建
                </span>
                resdesc = '系统创建'
                break;
            case 3:
                res = <span>
                    系统创建(
                <a href="javascript:;"
                        // style={{ color: '#E74040' }}
                        onClick={() => this.reReplace(currentRow)}
                        title='重新匹配'>
                        重新匹配
                    </a>
                    )
                </span>
                resdesc = '系统创建(重新匹配)'
                break;
            case -3:
                res = <span>
                    系统创建（
                    <a href="javascript:;"
                        style={{ color: '#E74040' }}
                        onClick={() => this.reReplace(currentRow)}
                        title='重新匹配'>
                        重新匹配
                    </a>
                    <span>/</span>
                    <a href="javascript:;"
                        onClick={() => this.handlerCurRowIgnore(currentRow, index)}
                        style={{ color: '#E74040' }}
                        title='确认'>
                        确认
                    </a>
                    ）</span>
                resdesc = '系统创建（ 重新匹配/确认）'
                break;
            case 4:
                res = <span>
                    <a href="javascript:;"
                        onClick={() => this.reReplace(currentRow)}
                        title='重新匹配'>
                        重新匹配
                    </a>
                </span>
                resdesc = '重新匹配'
                break;
            case -4:
                res = <span>
                    <a href="javascript:;"
                        onClick={() => this.reReplace(currentRow)}
                        style={{ color: '#E74040' }}
                        title='重新匹配'>
                        重新匹配
                    </a>
                    <span>/</span>
                    <a href="javascript:;"
                        onClick={() => this.handlerCurRowIgnore(currentRow, index)}
                        style={{ color: '#E74040' }}
                        title='确认'>
                        确认
                    </a>
                </span>
                resdesc = '重新匹配/确认'
                break;
            case 5:
                res =
                    <span>
                        已匹配科目（
                    <a href="javascript:;"
                            // style={{ color: '#E74040' }}
                            onClick={() => this.reReplace(currentRow)}
                            title='重新匹配'>
                            重新匹配
                    </a>
                        ）</span>
                resdesc = '已匹配科目（重新匹配）'
                break;
            case -5:
                res =
                    <span>
                        <a href="javascript:;"
                            style={{ color: '#E74040' }}
                            onClick={() => this.reReplace(currentRow)}
                            title='重新匹配'>
                            重新匹配
                    </a>
                        <span>/</span>
                        <a href="javascript:;"
                            onClick={() => this.autoCreate(currentRow, index)}
                            style={{ color: '#E74040' }}
                            title='自动创建'>
                            自动创建
                    </a>
                    </span>
                resdesc = '重新匹配/自动创建'
                break;
            case 6:
                res = <span>无需匹配</span>
                resdesc = '无需匹配'
                break;
            default:
                res = <span></span>
                break;
        }
        return { res, resdesc }
    }
    /**
     * 自动创建
     */
    autoCreate = async (currentRow) => {
        this.metaAction.sf('data.other.loading', true)
        let res = await this.webapi.importapi.autoCreate({ AcctID: currentRow.sourceCode })
        this.metaAction.sf('data.other.loading', false)
        if (res) {
            await this.sortParmas()
        }
    }
    /**
    * 确认
    */
    handlerCurRowIgnore = async (currentRow, index) => {
        this.metaAction.sf('data.other.loading', true)
        const handMatchIgnoreData = await this.webapi.importapi.ignoreImpGlAccountRelation({ "AcctID": currentRow.sourceCode, autoMatch: currentRow.autoMatch })
        this.metaAction.sf('data.other.loading', false)
        if (handMatchIgnoreData) {
            await this.sortParmas()
        }
    }
    /**
     * 批量确认
     */
    batchIgnore = async () => {
        this.metaAction.sf('data.other.loading', true)
        let matchList = await this.webapi.importapi.ignoreImpGlAccountRelationBatch()
        this.metaAction.sf('data.other.loading', false)
        if (matchList) {
            await this.sortParmas()
        }
    }
    /**
     * 重新匹配
     */
    reReplace = async (currentRow) => {
        const res = await this.metaAction.modal('show', {
            title: '科目匹配',
            width: 580,
            cancelText: '取消',
            okText: '保存',
            children: this.metaAction.loadApp('ttk-gl-app-importdata-accountrereplace', {
                store: this.component.props.store,
                accountDto: currentRow
            }),
        })
        if (res) {
            await this.sortParmas()
        }
    }
    /**
    * 财务期初-上一步
    */
    preStep = async () => {
        if (this.component.props) {
            console.log(this.component.props.appName)
            const appParams = this.component.props.appName
            this.component.props.setPortalContent('创建账套', 'ttk-edf-app-manage-import', appParams)
            sessionStorage['_isReTabInitData'] = ''
        }
    }
    /**
     * 新增一级科目
     */
    addPrimarySubject = async () => {
        let _this = this
        const sjbData = _this.metaAction.gf('data.sjb')
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            okText: '保存',
            style: sjbData ? { top: 10 } : { top: 40 },
            bodyStyle: sjbData ? { padding: 0, paddingLeft: 24, paddingBottom: 24, paddingRight: 24, fontSize: 12 } : { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'addPrimarySubject',
                type: 'importData',
                setPortalContent: this.component.props.setPortalContent && this.component.props.setPortalContent
            })
        })
        if (ret) {
            await this.changeSubjects()
        }
    }
    /**
    * 发送post请求,
    */
    contentPost = (url, data) => {
        //创建form表单
        let temp_form = document.createElement("form")
        temp_form.action = url
        //如需打开新窗口，form的target属性要设置为'_blank'
        temp_form.target = "_self"
        temp_form.method = "post"
        temp_form.style.display = "none"
        //添加参数
        let opt = document.createElement("textarea")
        opt.name = 'data'
        opt.value = data
        temp_form.appendChild(opt)
        document.body.appendChild(temp_form)
        //提交数据
        temp_form.submit()
    }
    // 渲染成功导入信息
    renderTips = (infos) => {
        if (!infos) {
            return ''
        } else {
            return (
                <div>
                    {infos.length > 0 &&
                        infos.map(element => {
                            return (
                                <div className='successinfos-row'>
                                    <div className='successinfos-row-left'>
                                        <span className='successinfos-row-label'
                                            title={element ? `${element.typeName} : ` : ''}>
                                            {element ? `${element.typeName} : ` : ''}
                                        </span>
                                    </div>
                                    <div className='successinfos-row-right'>
                                        <span className='successinfos-row-label'
                                            title={element ? ` 成功确认${element.successCount ? element.successCount : 0}条,失败${element.failedCount ? element.failedCount : 0}条` : ''}>
                                            {element ? `成功确认${element.successCount ? element.successCount : 0}条,失败${element.failedCount ? element.failedCount : 0}条` : ''}
                                        </span>
                                    </div>
                                </div>
                            )
                        }
                        )
                    }
                </div>
            )
        }

    }
    /**
     * 导入
     */
    nextStep = async () => {
        const isAllHandled = await this.webapi.importapi.isAllHandled()
        if (!isAllHandled) return

        let isNoDispose = this.metaAction.gf('data.other.isCanNotToNextStep'),
            sjbData = this.metaAction.gf('data.sjb')
        if (isNoDispose) return
        this.metaAction.sf('data.other.isCanNotToNextStep', true)
        let currentOrg = this.metaAction.context.get("currentOrg")
        this.metaAction.sf('data.other.loading', true)
        const queryUnMatch = await this.webapi.importapi.queryUnMatch()
        if (queryUnMatch && queryUnMatch.length > 0) {
            const newList = queryUnMatch.map((item, index) => {
                return { id: item.glAccountId, content: `● ${item.sourceCode} ${item.sourceName} 未匹配新科目` }
            })
            const checkMatch = await this.metaAction.modal('show', {
                title: '原科目未匹配记录',
                okText: '确定',
                cancelText: '返回',
                style: sjbData ? { top: 10 } : { top: 140 },
                width: 480,
                wrapClassName: 'auxiliary-setting',
                children: <InfiniteListScroller
                    count={newList.length}
                    care='注：未匹配科目数据无取值，继续匹配请“返回”'
                    dataSource={newList}
                />
            })
            if (!checkMatch) {
                this.metaAction.sf('data.other.loading', false)
                this.metaAction.sf('data.other.isCanNotToNextStep', false)
                return
            }
        }
        let upgradeSeq = await this.webapi.importapi.upgradeAsync()
        let upgradeStatus
        if (upgradeSeq) {
            let upgradetimer = setInterval(async () => {
                upgradeStatus = await this.webapi.importapi.getUpgradeStatus({ sequenceNo: upgradeSeq })
                if (upgradeStatus == true) {
                    clearTimeout(upgradetimer)                   
                    const stepData = await this.webapi.importapi.setImpAccountStep({ step: 4 })
                    if (!stepData) {
                        this.metaAction.sf('data.other.loading', false)
                        this.metaAction.sf('data.other.isCanNotToNextStep', false)
                        return
                    }

                    if (sjbData && sjbData.joinsource == 'sjb') {//税检宝                   
                        let infos = await this.webapi.importapi.getSuccessAndFailedCountForSJB()
                        const exceptAssetsInfo = infos.filter(item => {
                            return item.type != 'SDAssetCard'
                        })
                        let reslabels = this.renderTips(exceptAssetsInfo)
                        const url = getUrls(location.host)
                        const { year, periodType, period, kjzz, qyid, nsrsf } = sjbData
                        const encryptId = await this.webapi.importapi.getEncryptedUuid({ year, periodType, period, kjzz, qyid, nsrsf })
                        this.metaAction.sf('data.other.loading', false)
                        if (reslabels) {
                            this.metaAction.sf('data.other.isCanNotToNextStep', false)
                            const ret = await this.metaAction.modal('show', {
                                title: '确认信息',
                                bodyStyle: { fontSize: 12, height: 170 },
                                wrapClassName: 'successinfos',
                                children: <div>{
                                    reslabels
                                }</div>
                            })
                            if (ret) {
                                this.metaAction.sf('data.other.loading', true)
                                let _that = this
                                const p = new Promise(function (resolve, reject) {
                                    let interval = setInterval(async () => {
                                        //异步操作       
                                        const queryDto = { year, periodType, period, kjzz, qyid, nsrsf }
                                        let encryptedData = await _that.webapi.importapi.getEncryptedData({ queryDto, 'msgId': encryptId })
                                        if (encryptedData && encryptedData.error) {
                                            clearTimeout(interval)
                                            reject(encryptedData.error)
                                        } else if (encryptedData && encryptedData.state) {
                                            clearTimeout(interval)
                                            resolve(encryptedData.data)
                                        }
                                    }, 5000);
                                });
                                p.then((encryptedData) => {
                                    _that.metaAction.sf('data.other.loading', false)
                                    _that.contentPost(url, encryptedData)
                                }).catch(function (reason) {
                                    _that.metaAction.sf('data.other.loading', false)
                                    _that.metaAction.toast('warning', reason)
                                });
                            }
                        }
                        await this.webapi.importapi.importAccountFinished({ orgId: currentOrg.id })
                    } else {
                        this.metaAction.sf('data.other.loading', false)
                        this.metaAction.sf('data.other.isCanNotToNextStep', false)
                        let assetIsExist = await this.webapi.importapi.assetIsExist()
                        if (assetIsExist) {
                            this.component.props.setPortalContent('资产确认', 'ttk-gl-app-asset-list', {})
                        } else {
                            const ret = await this.metaAction.modal('show', {
                                title: '导入',
                                // width: 400,
                                // okText: '确定',
                                // style: { top: 140 },
                                bodyStyle: { padding: 24, fontSize: 12 },
                                wrapClassName: 'account-import',
                                children: <div>导账成功，请核实财务期初数据、会计科目、基础档案及历史凭证是否准确</div>
                            })
                            this.component.props.setPortalContent('导入完成', 'ttk-gl-app-importdata-success', {})
                            await this.webapi.importapi.importAccountFinished({ orgId: currentOrg.id })
                        }
                    }
                }
            }, 3000)
        } else {
            this.metaAction.sf('data.other.loading', false)
            this.metaAction.sf('data.other.isCanNotToNextStep', false)
            return
        }
    }

    /**
     * sjb 渲染列
     */
    renderColumns = (col, element, _ctrlPath, index) => {
        if (col == 'sourceName') {
            return this.renderNameAndAux(element)
        } else if (col == 'code' || col == 'balanceDirectionName' || col == 'name') {
            return <span title={
                element && element.accountDto
                    ? element.accountDto[col]
                    : ''}>
                {element && element.accountDto ? element.accountDto[col] : ''}
            </span>
        }
    }
    /**
     * getrow
     */
    getRow = (record, index) => {
        let matchIndex = this.metaAction.gf('data.other.matchIndex')
        if (record.glAccountId) {
            if (matchIndex == index) {
                return { className: " currentScrollRow" }
            } else {
                return { className: '' }
            }
        }
    }
    /**
    * 组件从界面上移除触发
    */
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
        } else {
            window.onresize = undefined
        }
    }
    /**
     * 在初始化render之后只执行一次
     */
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
            document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
            document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
        } else {
            window.onresize = this.onResize
        }
    }
    /**
     * 计算table滚动条
     */
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('accountrelation-sjbgrid', 'ant-table-thead', 1, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
    }
    /**
    * 计算table滚动条
    */
    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if (bodyHeight > y && y != pre.y && tableDivHeight > 0) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {
            console.log(err)
        }
    }
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
function generateNewSubCode(parentId, parentCode, subjectList, parentGrade, gradeList) {
    // debugger   
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
                    console.log(i + 1)
                    maxCode = endGradeList[i]
                    break;
                }
            }

            // if (!isNaN(maxCode)) {
            newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
            // newCode = '00' + (parseInt(maxCode) + 1).toString()
            // newCode = newCode.substring(newCode.length - 2)
            // } 
        } else {
            return false
        }
    }
    console.log(newCode)
    return newCode
}
// //生成新的科目编码
// function generateNewSubCode(parentId, parentCode, subjectList, parentGrade, gradeList) {
//     // gradeList = {grade1:4, grade2:2, grade3: 4, grade4:3, grade5:2}
//     let newCode,
//         grade = Object.keys(gradeList),
//         newSubjectList = subjectList.filter(subItem => {
//             return parseInt(subItem.parentId) == parseInt(parentId)
//         }),
//         item = grade.find(item => `${item}`.charAt(item.length - 1) == parentGrade + 1)
//     if (newSubjectList.length == 0) {
//         newCode = PrefixInteger('1', gradeList[item])
//     } else {
//         let endGradeList = []
//         for (var i = 0; i < newSubjectList.length; i++) {
//             let code = newSubjectList[i].code
//             endGradeList.push(code.substring(code.length - parentGrade - 1))
//         }
//         endGradeList = endGradeList.sort(sortNumber)
//         let maxCode = endGradeList[endGradeList.length - 1]

//         if (maxCode == (Array(maxCode.length).join(9) + '9') && endGradeList.length < Array(maxCode.length).join(9) + '9' - 1) {
//             maxCode = endGradeList[endGradeList.length - 2]
//             if (!isNaN(maxCode)) {
//                 newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
//             } else {
//                 newCode = PrefixInteger('0', gradeList[item])
//             }
//         } else if (maxCode != '99' && !isNaN(maxCode)) {
//             newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
//         } else {
//             newCode = PrefixInteger('0', gradeList[item])
//         }
//     }
//     console.log(newCode)
//     return newCode
// }
function sortNumber(a, b) {
    return a - b
}
/**
 * 获取url映射
 * @param {当前系统url} key 
 */
function getUrls(key) {
    const arrayUrls = [
        { key: 'erpdemo.jchl.com', value: 'http://qyswfxtest.jchl.com/web-qyswfx-desktop-gjb/jsp/swtj/swtj_qmtj_cstj.jsp' },
        { key: 'erp.jchl.com', value: 'http://qyswfx.jchl.com/web-qyswfx-desktop-gjb/jsp/swtj/swtj_qmtj_cstj.jsp' },
        { key: 'test', value: 'http://120.79.185.5:8080/web-qyswfx-desktop-gjb/jsp/swtj/swtj_qmtj_cstj.jsp' }
    ]
    const data = arrayUrls.find(item => {
        return item.key == key
    }) || arrayUrls[2];
    return data && data.value
}



