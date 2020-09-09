import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { consts } from 'edf-consts'
import renderColumns from './utils/renderDataGridColumns';
import RedDashed from './components/RedDashed'
import { InfiniteListScroller, Icon, LoadingMask } from 'edf-component'
import { fromJS, Map } from 'immutable'
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
        const params = this.component.props && this.component.props.appExtendParams,
            isReTabInitData = sessionStorage['_isReTabInitData']
        this.load(params && params.isUploaded && isReTabInitData)
    }

    load = async (params) => {
        console.log(params)
        this.changeSubjects(params == false ? undefined : 'init')
        if (params) {
            sessionStorage['_isReTabInitData'] = ''
        }
    }
    /**
     * 组件从界面上移除触发
     */
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
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
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    /**
     * 调整页面布局
     */
    onResize = () => {
        let targetAccountWidth,
            screenWidth = document.getElementsByClassName("fixedDataTableLayout_rowsContainer"),
            screenCurWidth = this.metaAction.gf('data.other.screenCurWidth'),
            detailsScrollToRow = this.metaAction.gf('data.other.detailsScrollToRow'),
            list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS()
        if (screenWidth && screenWidth.length > 0) {
            targetAccountWidth = screenWidth[0].style.width.replace('px', '')
            if (targetAccountWidth != screenCurWidth) {
                this.metaAction.sf('data.other.screenCurWidth', targetAccountWidth)
                const params = [this.renderMsgColumns, this.sourceAccountAux, this.disabledState, this.addAccount, this.batchAddSubject, this.editAccount, this.deleteAccount]
                return renderColumns(list, targetAccountWidth, detailsScrollToRow, ...params)
            }
        }
    }
    fixPosition = (condition) => {
        this.injections.reduce('fixPosition', condition)
    }
    searchChange = (value) => {
        this.injections.reduce('searchChange', value)
    }
    /**
     * 设置科目后置的状态
     */
    setAfterAccountOption = async (operateStatus, id) => {
        LoadingMask.show()
        const response = await this.webapi.financeinit.afterAccountOption({ operateStatus, id })
        LoadingMask.hide()
        return response
    }
    getMatchInitAsync = async (isInit, param) => {
        let matchInitAsync = await this.webapi.financeinit.matchInitAsync(param ? param : { isIgnoreNoEnoughCode: false }),
            matchInitStatus
        if (matchInitAsync) {
            let matchInitTimer = setInterval(async () => {
                matchInitStatus = await this.webapi.financeinit.getMatchInitStatus({ sequenceNo: matchInitAsync, isReturnValue: true })
                if (matchInitStatus.matchInitState == 'STATUS_RESPONSE') {
                    clearTimeout(matchInitTimer)
                    const response = await this.webapi.financeinit.matchInit({ "onlyQuery": true })
                    const accountList = await this.webapi.financeinit.accountQuery('all')
                    const accountGrade = await this.webapi.financeinit.getAccountGrade()
                    if (response) {
                        const isCanNotToNextStep = response.matchList && response.matchList.length < 1 ? true : false
                        this.injections.reduce('load', response, accountList, isCanNotToNextStep, accountGrade)
                        if (isInit == 'init') {
                            this.metaAction.sf('data.other.loading', false)
                            return
                        }
                    }
                    this.metaAction.sf('data.other.loading', false)
                } else if (matchInitStatus.matchInitState == 'STATUS_EXCEPTION') {
                    clearTimeout(matchInitTimer)
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
                        await this.getMatchInitAsync(isInit, { newGradeSetting: matchInitStatus.newGradeSetting, isIgnoreNoEnoughCode: false })
                    } else {
                        this.metaAction.sf('data.other.loading', true)
                        await this.getMatchInitAsync(isInit, { isIgnoreNoEnoughCode: true })
                    }
                } else if (matchInitStatus.error && matchInitStatus.error.message) {
                    clearTimeout(matchInitTimer)
                    this.metaAction.sf('data.other.loading', false)
                    this.metaAction.toast('error', `${matchInitStatus.error.message}`)
                }
            }, 3000)
        } else {
            this.metaAction.sf('data.other.loading', false)
        }
    }
    changeSubjects = async (isInit) => {
        //参数取反,只有第一步上传文件onlyQuery：false 匹配和映射 否则都是true 直接查询
        // LoadingMask.show()
        this.metaAction.sf('data.other.loading', true)
        this.metaAction.sf('data.other.searchFlag', false)
        if (isInit == 'init') {
            await this.getMatchInitAsync(isInit)

        } else {
            const response = await this.webapi.financeinit.matchInit({ "onlyQuery": true })
            const accountList = await this.webapi.financeinit.accountQuery('all')
            const accountGrade = await this.webapi.financeinit.getAccountGrade()
            if (response) {
                const isCanNotToNextStep = response.matchList && response.matchList.length < 1 ? true : false
                this.injections.reduce('load', response, accountList, isCanNotToNextStep, accountGrade)

                let matchType = this.metaAction.gf('data.other.matchType'),
                    option
                if (matchType == 1) {//已匹配
                    option = 'matched'
                } else if (matchType == 2) {
                    option = 'unMatched'
                } else {
                    option = 'all'
                }
                await this.selectMatchType(option)
                // this.metaAction.sf('data.other.loading', false)
            }
            this.metaAction.sf('data.other.loading', false)
        }

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
    addAccount = (data, rowIndex, relationId) => async () => {
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
        const accountList = await this.webapi.financeinit.accountQuery({ "accountTypeId": accountTypeId })
        const list = accountList && accountList.glAccounts
        let findFirstUnusedCode = await this.webapi.financeinit.findFirstUnusedCode({ id: id, code: code, grade: grade }),
            newCode = findFirstUnusedCode.newCode.substr(code.length),
            // let newCode = generateNewSubCode(id, code, list, grade, gradeList),
            gradeArr = Object.keys(gradeList),
            item = gradeArr.find(item => `${item}`.charAt(item.length - 1) == grade + 1)
        //     maxCode = Array(gradeList[item]).join(9) + '9'
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
                let gradeResponse = await this.webapi.financeinit.getAccountGrade()
                gradeResponse[item] += 1
                let parmas = {
                    ...gradeResponse,
                    isReturnValue: true
                }
                const res = await this.webapi.financeinit.setAccountGrade(parmas)
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
        let findFirstUnused = await this.webapi.financeinit.findFirstUnusedCode({ id: id, code: code, grade: grade }),
            firstUnusedCode = findFirstUnused.newCode.substr(code.length)
        const ret = await this.metaAction.modal('show', {
            title: '科目',
            width: 450,
            okText: '保存',
            style: { top: 40 },
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                active: 'add',
                newCode: firstUnusedCode,
                data: data,
            })
        })
        if (ret) {
            await this.setAfterAccountOption("1", relationId)
            await this.changeSubjects(undefined, true)
        }

    }

    /**
     * 批量新增
     */
    batchAddSubject = (data, rowIndex, relationId) => async () => {
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
                parentId: id
            })
        })
        if (ret) {
            let maxSizeForBatchInsert = await this.webapi.financeinit.getMaxSizeForBatchInsert({ id: id })
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
                    let setGradeResponse = await this.webapi.financeinit.setAccountGrade(maxSizeForBatchInsert.gradeSettingDto)
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
            const response = await this.webapi.financeinit.batchAdd(option)
            // LoadingMask.hide()
            if (response) {
                this.metaAction.sf('data.other.loading', false)
                this.metaAction.toast('success', this.message(response.message), response.message.indexOf('<br>') != -1 ? 3 : 1)
                await this.setAfterAccountOption("1", relationId)
                this.changeSubjects(undefined, true)
            }
        }
    }
    /**
     * 编辑
     */
    editAccount = (data, relationId) => async () => {
        console.log(data)
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
            await this.setAfterAccountOption("2", relationId)
            await this.changeSubjects(undefined, true)
        }
    }
    /**
     * 删除
     */
    deleteAccount = (data, relationId) => async () => {
        if (!(!(data.isSystem && !data.isAllowDel) && data.isEndNode) || !data.isEnable)
            return

        let { id, parentId, ts, code } = data, option = {}
        option.id = id
        option.ts = ts
        let checkResponse = await this.webapi.financeinit.checkBeforeDelete({accountId: id})
        if(checkResponse == ''){
            const ret = await this.metaAction.modal('confirm', {
                content: '确认删除?'
            })
            if (ret) {
                
                const response = await this.webapi.financeinit.delete(option)
                let messageText, isDelCurSubject
                //判断后端是否删除成功
                if (response == '') {
                    isDelCurSubject = true
                    this.metaAction.toast('success', '删除成功')
                    await this.setAfterAccountOption("3", relationId)
                    await this.changeSubjects(undefined, true)
                } else {
                    isDelCurSubject = false  //科目已经被使用，不能删除，只能更改状态
                    this.injections.reduce('deleteAccount', id, parentId, isDelCurSubject, rowIndex)
                }
            }
        }else{
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
            if(result){
                const response = await this.webapi.financeinit.delete(option)
                let messageText, isDelCurSubject
                //判断后端是否删除成功
                if (response == '') {
                    isDelCurSubject = true
                    this.metaAction.toast('success', '删除成功')
                    await this.setAfterAccountOption("3", relationId)
                    await this.changeSubjects(undefined, true)
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

    /**
     * 渲染表格列
     */
    tableColumns = (list) => {
        let targetAccountWidth, rowsContainerHeight, fixedDataTableMainHeight, rowsContainer = document.getElementsByClassName("fixedDataTableLayout_rowsContainer"),
            screenCurWidth = this.metaAction.gf('data.other.screenCurWidth'),
            detailsScrollToRow = this.metaAction.gf('data.other.detailsScrollToRow'),
            fixedDataTableMain = document.getElementsByClassName("public_fixedDataTable_main"),
            differ = 60
        if (rowsContainer && rowsContainer.length > 0) {
            targetAccountWidth = rowsContainer[0].style.width.replace('px', '')
            rowsContainerHeight = rowsContainer[0].style.height.replace('px', '')
            fixedDataTableMainHeight = rowsContainer[0].style.height.replace('px', '')
            rowsContainer[0].style.height = `${parseInt(rowsContainerHeight) + differ}px`
            fixedDataTableMain[0].style.height = `${parseInt(fixedDataTableMainHeight) + differ}px`
            if (targetAccountWidth != screenCurWidth) {
                this.metaAction.sf('data.other.screenCurWidth', targetAccountWidth)
            }
        }
        if (list) {
            setTimeout(() => {
                this.onResize()
            }, 20);
        }
        const params = [this.renderMsgColumns, this.sourceAccountAux, this.disabledState, this.addAccount, this.batchAddSubject, this.editAccount, this.deleteAccount]
        return renderColumns(list, targetAccountWidth, detailsScrollToRow, ...params)

    }

    /**
     * 渲染错误提示cell单元格内容
     */
    renderMsgColumns = (width, index) => {

        let list = this.metaAction.gf('data.list')
        if (list && list.size > 0) {
            let currentRow = list.get(index) ? list.get(index).toJS() : list.get(index)
            const cellElement = this.getAhrefAutoMatch(currentRow, index)
            const msglength = cellElement ? this.getEmentLength(cellElement) : 100
            const isMulLine = 13 * msglength < width
            return (
                <div className={isMulLine ? "ttk-gl-app-financeinit-accountrelation-content-msgcell" : "ttk-gl-app-financeinit-accountrelation-content-msgcell lineheight"}>
                    {cellElement}
                </div>
            )
        }
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
        * -3:系统自动创建（重新匹配/忽略）
        * 4:重新匹配
        * -4:重新匹配/忽略
        * 5:已匹配科目（重新匹配）
        * -5：重新匹配
           "sourceIsAuxAccCalc": false, --原科目是否启用辅助项
           "needMatchAuxAccCalc":false, --是否需要匹配辅助项
        */
        let res
        if (!currentRow) {
            return res
        }
        let autoMatch = currentRow.autoMatch,
            sourceIsAuxAccCalc = currentRow.sourceIsAuxAccCalc,
            needMatchAuxAccCalc = currentRow.needMatchAuxAccCalc,
            needMatchCalcQuantity = currentRow.needMatchCalcQuantity,
            isCalcQuantity = currentRow.isCalcQuantity
        const auxspan = <a href="javascript:;"
            onClick={() => this.auxSetting(currentRow, index)}
            style={needMatchAuxAccCalc ? { color: '#E74040' } : {}}
            title='辅助核算设置'>
            辅助核算设置
        </a>
        const unitSetting = <a href="javascript:;"
            onClick={() => this.openUnitSetting(currentRow, index)}
            style={needMatchCalcQuantity ? { color: '#E74040' } : {}}
            title='单位设置'>
            单位设置
        </a>
        switch (autoMatch) {
            case 0:
                res = <span></span>
                break;
            case 1:
                res = <span>
                    已匹配科目
                    {sourceIsAuxAccCalc ? '（' : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity && !sourceIsAuxAccCalc ? '（' : ''}
                    {isCalcQuantity && sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                    {isCalcQuantity && !sourceIsAuxAccCalc ? '）' : ''}
                    {sourceIsAuxAccCalc ? '）' : ''}
                </span>
                break;
            case 2:
                res = <span>
                    系统自动创建
                    {sourceIsAuxAccCalc ? '（' : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity && !sourceIsAuxAccCalc ? '（' : ''}
                    {isCalcQuantity && sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                    {isCalcQuantity && !sourceIsAuxAccCalc ? '）' : ''}
                    {sourceIsAuxAccCalc ? '）' : ''}
                </span>
                break;
            case 3:
                res = <span>
                    系统自动创建(
                <a href="javascript:;"
                        // style={{ color: '#E74040' }}
                        onClick={() => this.reReplace(currentRow)}
                        title='重新匹配'>
                        重新匹配
                    </a>
                    {sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                    )
                </span>
                break;
            case -3:
                res = <span>
                    系统自动创建（
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
                    {sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                    ）</span>
                break;
            case 4:
                res = <span>
                    <a href="javascript:;"
                        onClick={() => this.reReplace(currentRow)}
                        title='重新匹配'>
                        重新匹配
                    </a>
                    {sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                </span>
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
                    {sourceIsAuxAccCalc ? <span>/</span> : ''}
                    {sourceIsAuxAccCalc ? auxspan : ''}
                    {isCalcQuantity ? <span>/</span> : ''}
                    {isCalcQuantity ? unitSetting : ''}
                </span>
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
                        {sourceIsAuxAccCalc ? <span>/</span> : ''}
                        {sourceIsAuxAccCalc ? auxspan : ''}
                        {isCalcQuantity ? <span>/</span> : ''}
                        {isCalcQuantity ? unitSetting : ''}
                        ）</span>
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
                        {sourceIsAuxAccCalc ? <span>/</span> : ''}
                        {sourceIsAuxAccCalc ? auxspan : ''}
                        {isCalcQuantity ? <span>/</span> : ''}
                        {isCalcQuantity ? unitSetting : ''}
                    </span>
                break;
            default:
                res = <span></span>
                break;
        }
        return res
    }
    selectMatchType = async (value, option) => {
        //筛选匹配类型
        let sfsData = {}, res,
            condition = this.metaAction.gf('data.other.positionCondition'),
            list = this.metaAction.gf('data.list')

        switch (value) {
            case 'all':
                res = await this.webapi.financeinit.queryMatchData({ type: 0 })
                this.metaAction.sf('data.other.matchType', 0)
                break;
            case 'unMatched':
                res = await this.webapi.financeinit.queryMatchData({ type: 2 })
                this.metaAction.sf('data.other.matchType', 2)
                break;
            case 'matched':
                res = await this.webapi.financeinit.queryMatchData({ type: 1 })
                this.metaAction.sf('data.other.matchType', 1)
                break;
        }

        if (res) {
            sfsData['data.list'] = fromJS(res.matchList)
            this.metaAction.sfs(sfsData)
            this.injections.reduce('fixPosition', condition)
        }

    }
    /**
     * 获取当前元素的长度
     */
    getEmentLength = (element) => {
        let resmsg = ''
        const array = element.props && element.props.children
        if (array) {
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element.props) {
                    resmsg += `${element.props.children}`
                } else {
                    resmsg += `${element}`
                }
            }
        }
        return resmsg.length
    }
    //自动创建
    autoCreate = async (currentRow) => {
        let list = this.metaAction.gf('data.list'), sfsData = {}
        let res = await this.webapi.financeinit.reAutoMatch({ id: currentRow.id })
        const matchList = res.matchList
        for (let index = 0; index < matchList.length; index++) {
            const reElement = matchList[index]
            for (let _rowIndex = 0; _rowIndex < list.size; _rowIndex++) {
                const element = list.get(_rowIndex).toJS()
                if (element.id == reElement.id) {
                    list = list.update(_rowIndex, item => item.set('autoMatch', reElement.autoMatch))
                    list = list.update(_rowIndex, item => item.set('sourceIsAuxAccCalc', reElement.sourceIsAuxAccCalc))
                    list = list.update(_rowIndex, item => item.set('needMatchAuxAccCalc', reElement.needMatchAuxAccCalc))
                    list = list.update(_rowIndex, item => item.set('accountId', reElement.accountId))
                    list = list.update(_rowIndex, item => item.set('accountDto', reElement.accountDto))
                }
            }
        }
        this.metaAction.toast('success', '自动创建成功')
        sfsData['data.list'] = list
        this.metaAction.sfs(sfsData)
        let matchType = this.metaAction.gf('data.other.matchType'),
            option
        if (matchType == 1) {//已匹配
            option = 'matched'
        } else if (matchType == 2) {
            option = 'unMatched'
        } else {
            option = 'all'
        }
        await this.selectMatchType(option)
    }

    getPopover = () => {
        return (
            <div>
                <div style={{ textAlign: "right" }}><Icon type="close" onClick={this.closeBatchTip} /></div>
                <div style={{ width: '300px' }}>您认可系统自动创建的明细科目及与原科目的对应科目时，可以逐条"确认"，也可以通过右上角的"批量确认"按钮批量操作</div>
            </div>
        )
    }
    closeBatchTip = async () => {
        let response = await this.webapi.financeinit.setBatchIgnoreTabNotShowNextTime()
        this.metaAction.sf('data.other.batchPopShow', false)
    }
    /**
         * 财务期初-上一步
         */
    preStep = async () => {
        if (this.component.props) {
            const appParams = this.component.props.appExtendParams
            this.component.props.setPortalContent('上传数据', 'ttk-gl-app-financeinit-uploaddata', appParams)
            sessionStorage['_isReTabInitData'] = ''
        }
    }
    //批量忽略
    batchIgnore = async () => {
        let list = this.metaAction.gf('data.list'), sfsData = {}
        let response = await this.webapi.financeinit.handMatchIgnoreForAll()
        if (response) {

            const matchList = response.matchList
            for (let index = 0; index < matchList.length; index++) {
                const reElement = matchList[index]
                for (let _rowIndex = 0; _rowIndex < list.size; _rowIndex++) {
                    const element = list.get(_rowIndex).toJS()
                    if (element.id == reElement.id) {
                        list = list.update(_rowIndex, item => item.set('autoMatch', reElement.autoMatch))
                        list = list.update(_rowIndex, item => item.set('sourceIsAuxAccCalc', reElement.sourceIsAuxAccCalc))
                        list = list.update(_rowIndex, item => item.set('needMatchAuxAccCalc', reElement.needMatchAuxAccCalc))
                        list = list.update(_rowIndex, item => item.set('accountId', reElement.accountId))
                        list = list.update(_rowIndex, item => item.set('accountDto', reElement.accountDto))
                    }
                }
            }
            this.metaAction.toast('success', '批量确认成功')
            sfsData['data.list'] = list
            this.metaAction.sfs(sfsData)
            let matchType = this.metaAction.gf('data.other.matchType'),
                option
            if (matchType == 1) {//已匹配
                option = 'matched'
            } else if (matchType == 2) {
                option = 'unMatched'
            } else {
                option = 'all'
            }
            await this.selectMatchType(option)
        }
    }
    addPrimarySubject = async () => {//新增一级科目
        let _this = this
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
            this.changeSubjects(undefined, true)
        }
    }
    /**
    * 财务期初-下一步
    */
    nextStep = async () => {
        if (this.component.props) {
            this.metaAction.sf('data.other.isCanNotToNextStep', true)
            this.metaAction.sf('data.other.loading', true)
            const queryUnMatch = await this.webapi.financeinit.queryUnMatching()
            if (queryUnMatch && queryUnMatch.matchList.length > 0) {
                const vaildateList = queryUnMatch.matchList
                const newList = vaildateList.map((item, index) => {
                    return { id: item.glAccountId, content: `● ${item.sourceCode} ${item.sourceName} 未匹配新科目` }
                })
                const checkMatch = await this.metaAction.modal('show', {
                    title: '原科目未匹配记录',
                    okText: '确定',
                    cancelText: '返回',
                    width: 480,
                    wrapClassName: 'auxiliary-setting',
                    children: <InfiniteListScroller
                        count={newList.length}
                        care='注：未匹配科目数据无取值，继续匹配请“返回”'
                        dataSource={newList}
                    />
                })
                if (!checkMatch) {
                    this.metaAction.sf('data.other.isCanNotToNextStep', false)
                    this.metaAction.sf('data.other.loading', false)
                    return
                }
            }
            let importDataAsync = await this.webapi.financeinit.importDataAsync(),
                importDataStatus
            if (importDataAsync) {
                let importDataTimer = setInterval(async () => {
                    importDataStatus = await this.webapi.financeinit.getStatus({ sequenceNo: importDataAsync, isReturnValue: true })
                    if (importDataStatus == true) {
                        clearTimeout(importDataTimer)
                        // const response = await this.webapi.financeinit.importData()
                        // if (response) {
                        const appParams = this.component.props.appExtendParams,
                            preStep = 'ttk-gl-app-financeinit-accountrelation'
                        this.component.props.setPortalContent('确认数据', 'ttk-gl-app-finance-periodbegin', { preStep, ...appParams })
                        sessionStorage['_isReTabInitData'] = ''
                        // }
                        this.metaAction.sf('data.other.isCanNotToNextStep', false)
                        this.metaAction.sf('data.other.loading', false)
                    } else if (importDataStatus.error && importDataStatus.error.message) {
                        clearTimeout(importDataTimer)
                        this.metaAction.sf('data.other.loading', false)
                        this.metaAction.sf('data.other.isCanNotToNextStep', false)
                        this.metaAction.toast('error', importDataStatus.error.message)
                    }
                }, 3000)
            } else {
                this.metaAction.sf('data.other.isCanNotToNextStep', false)
                this.metaAction.sf('data.other.loading', false)
            }
        }
    }
    /**
         * 忽略
         */
    handlerCurRowIgnore = async (currentRow, index) => {
        // LoadingMask.show()
        this.metaAction.sf('data.other.loading', true)
        const handMatchIgnore = await this.webapi.financeinit.handMatchIgnore({ "id": currentRow.id })
        // LoadingMask.hide()
        this.metaAction.sf('data.other.loading', false)
        let list = this.metaAction.gf('data.list'), sfsData = {}
        if (handMatchIgnore && handMatchIgnore.matchList) {
            const matchIgnore = handMatchIgnore.matchList[0]
            list = list.update(index, item => item.set('autoMatch', matchIgnore.autoMatch))
            list = list.update(index, item => item.set('sourceIsAuxAccCalc', matchIgnore.sourceIsAuxAccCalc))
            list = list.update(index, item => item.set('needMatchAuxAccCalc', matchIgnore.needMatchAuxAccCalc))
            list = list.update(index, item => item.set('accountId', matchIgnore.accountId))
            list = list.update(index, item => item.set('auxOrder', matchIgnore.auxOrder))
            if (matchIgnore.accountDto) {
                list = list.update(index, item => item.set('accountDto', matchIgnore.accountDto))
            }
            sfsData['data.list'] = list
            this.metaAction.sfs(sfsData)
            let matchType = this.metaAction.gf('data.other.matchType'),
                option
            if (matchType == 1) {//已匹配
                option = 'matched'
            } else if (matchType == 2) {
                option = 'unMatched'
            } else {
                option = 'all'
            }
            await this.selectMatchType(option)
        }

    }
    /**
     * 重新匹配
     */
    reReplace = async (currentRow) => {
        let list = this.metaAction.gf('data.list'), sfsData = {}
        const res = await this.metaAction.modal('show', {
            title: '科目匹配',
            width: 580,
            cancelText: '取消',
            okText: '保存',
            children: this.metaAction.loadApp('ttk-gl-app-account-rereplace', {
                store: this.component.props.store,
                id: currentRow && currentRow.id
            }),
        })
        console.log(res)
        if (res && res.reHandMatch && res.reHandMatch.matchInitMessage) {
            await this.matchInitModal(res)
        } else {
            await this.getReplaceData({matchList: res.reHandMatch.matchList })
        }

    }
    matchInitModal = async (res) => {
        // if (res && res.reHandMatch && res.reHandMatch.matchInitMessage) {
        const ret = await this.metaAction.modal('show', {
            title: '设置',
            children: (
                <div >
                    {res.reHandMatch.matchInitMessage}
                </div>
            ),
            cancelText: '取消',
            okText: '确定',
            width: 400,
            height: 250
        })
        let response
        if (ret) {

            response = await this.webapi.financeinit.reHandMatch({ id: res.id, accountId: res.accountId, isIgnoreNoEnoughCode: false, newGradeSetting: res.reHandMatch.newGradeSetting })
            if (response && response.matchInitMessage) {
                await this.matchInitModal(response)
            } else if(response && response.matchList){
                await this.getReplaceData({ matchList: response.matchList })
            }else {
                return
            }
        } else {
            response = await this.webapi.financeinit.reHandMatch({ id: res.id, accountId: res.accountId, isIgnoreNoEnoughCode: true })
            if (response && response.matchInitMessage) {
                await this.matchInitModal(response)
            } else if(response && response.matchList){
                await this.getReplaceData({ matchList: response.matchList })
            }else {
                return
            }
        }
    }
    getReplaceData = async (res) => {
        let list = this.metaAction.gf('data.list'), sfsData = {}
        if (res && res.matchList ) {
            const matchList = res.matchList
            for (let index = 0; index < matchList.length; index++) {
                const reElement = matchList[index]
                for (let _rowIndex = 0; _rowIndex < list.size; _rowIndex++) {
                    const element = list.get(_rowIndex).toJS()
                    if (element.id == reElement.id) {
                        list = list.update(_rowIndex, item => item.set('autoMatch', reElement.autoMatch))
                        list = list.update(_rowIndex, item => item.set('sourceIsAuxAccCalc', reElement.sourceIsAuxAccCalc))
                        list = list.update(_rowIndex, item => item.set('needMatchAuxAccCalc', reElement.needMatchAuxAccCalc))
                        list = list.update(_rowIndex, item => item.set('accountId', reElement.accountId))
                        list = list.update(_rowIndex, item => item.set('accountDto', reElement.accountDto))
                    }
                    /**
                 * 已经匹配，需要删除集合中新增的科目
                 */
                    if (reElement.accountDto.id == element.accountDto.id && !element.accountId) {
                        list = list.delete(_rowIndex)
                    }
                }
            }
            sfsData['data.list'] = list
            this.metaAction.sfs(sfsData)
            let matchType = this.metaAction.gf('data.other.matchType'),
                option
            if (matchType == 1) {//已匹配
                option = 'matched'
            } else if (matchType == 2) {
                option = 'unMatched'
            } else {
                option = 'all'
            }
            await this.selectMatchType(option)
            /*
            原表内有辅助核算
                对应科目未启用辅助核算，在匹配科目后需要弹框提示，xxx科目是否启用辅助核算？
                是，则弹出科目辅助核算设置页面，让其勾选核算，多核算项目的，
                提示，将按照启用核算项目的先后顺序对应科目核算项目
            */
            // let confirmTips = await this.metaAction.modal('confirm', {
            //     content: this.getDisplayConfirmMSg(`${currentRow.sourceCode}${currentRow.sourceName}`, `${currentRow.accountDto.code}${currentRow.accountDto.name}`),
            //     cancelText: '否',
            //     okText: '是'
            // })
            // if (confirmTips) {

            // }
            setTimeout(() => {
                this.onResize()
            }, 20);
        }

    }
    /**
     * 辅助核算项目设置
     */
    auxSetting = async (currentRow, index) => {

        if (currentRow && (currentRow.autoMatch < 0) || JSON.stringify(currentRow.accountDto) == '{}') {
            this.metaAction.toast('warning', '请重新匹配科目后再设置辅助项！')
            return
        }
        const ret = await this.metaAction.modal('show', {
            title: '辅助核算设置',
            width: 580,
            cancelText: '取消',
            okText: '保存',
            wrapClassName: 'auxiliary-setting',
            children: this.metaAction.loadApp('ttk-gl-app-auxiliary-setting', {
                store: this.component.props.store,
                initData: { rowIndex: index, ...currentRow },
                callbackAction: this.saveAux
            }),
        })
    }

    /**
     * 辅助核算单位设置
     */
    openUnitSetting = async (currentRow, index) => {
        if (currentRow && (currentRow.autoMatch < 0) || JSON.stringify(currentRow.accountDto) == '{}') {
            this.metaAction.toast('warning', '请重新匹配科目后再进行单位设置！')
            return
        }
        let subject = await this.webapi.financeinit.find({ id: currentRow.accountId })
        let used = await this.webapi.financeinit.used({ id: currentRow.accountId })

        const ret = await this.metaAction.modal('show', {
            title: '单位设置',
            width: 420,
            cancelText: '取消',
            onOk: this.onOk,
            okText: '保存',
            footer: '',
            wrapClassName: 'ttk-gl-unit-setting',
            children: <RedDashed that={this}
                subject={subject}
                used={used}
                currentRow={currentRow}
                index={index}
                callBack={this.submitRedDashed} />
        })
    }

    submitRedDashed = async (form) => {
        const data = form.getValue()
        let option = {
            glAccountDto: data.subject.glAccount,
            isUpdateSelf: 1,
            purpose: 1
        }

        option.glAccountDto.unitId = data.unit.id
        option.glAccountDto.isCalcQuantity = true
        let res = await this.webapi.financeinit.update(option)
        if (res) {
            let afterAccountOption = await this.webapi.financeinit.afterAccountOption({
                id: data.currentRow.id,
                operateStatus: "2"
            })
            if (afterAccountOption) {
                let index = data.index
                let list = this.metaAction.gf('data.list'),
                    sfsData = {}

                // data.currentRow.accountDto.unitName = data.unit.name
                // data.currentRow.accountDto.unitId = data.unit.id
                let newData = { ...data.currentRow.accountDto }
                newData['unitName'] = data.unit.name
                newData['unitId'] = data.unit.id
                list = list.update(index, item => item.set('accountDto', newData))
                list = list.update(index, item => item.set('isCalcQuantity', 1))
                list = list.update(index, item => item.set('needMatchCalcQuantity', 0))
                sfsData['data.list'] = list
                this.metaAction.sfs(sfsData)
                this.metaAction.toast('success', '更新成功')
            }
            let matchType = this.metaAction.gf('data.other.matchType'),
                option
            if (matchType == 1) {//已匹配
                option = 'matched'
            } else if (matchType == 2) {
                option = 'unMatched'
            } else {
                option = 'all'
            }
            await this.selectMatchType(option)
        }
    }

    /**
     * 查看原科目辅助核算项
     */
    sourceAccountAux = (currentRow, index) => async () => {
        const ret = await this.metaAction.modal('show', {
            title: '原科目辅助核算项',
            width: 580,
            okText: '关闭',
            wrapClassName: 'souceaccount-auxlist',
            children: this.metaAction.loadApp('ttk-gl-app-sourceaccount-auxlist', {
                store: this.component.props.store,
                id: currentRow && currentRow.id
            })
        })
    }
    /**
     * 保存辅助核算
     */
    saveAux = async (params) => {
        if (params) {
            let list = this.metaAction.gf('data.list'),
                sfsData = {}
            // LoadingMask.show()
            this.metaAction.sf('data.other.loading', true)
            let handMatchAux = await this.webapi.financeinit.handMatchAux({ "id": params.id, "auxNameList": params.auxNameList })
            // LoadingMask.hide()

            if (handMatchAux) {
                const auxMatch = handMatchAux.matchList[0]
                list = list.update(params.rowIndex, item => item.set('autoMatch', auxMatch.autoMatch))
                list = list.update(params.rowIndex, item => item.set('sourceIsAuxAccCalc', auxMatch.sourceIsAuxAccCalc))
                list = list.update(params.rowIndex, item => item.set('needMatchAuxAccCalc', auxMatch.needMatchAuxAccCalc))
                list = list.update(params.rowIndex, item => item.set('auxOrder', auxMatch.auxOrder))
                list = list.update(params.rowIndex, item => item.set('accountDto', auxMatch.accountDto))
                sfsData['data.list'] = list
                this.metaAction.sfs(sfsData)
            }
            let matchType = this.metaAction.gf('data.other.matchType'),
                option
            if (matchType == 1) {//已匹配
                option = 'matched'
            } else if (matchType == 2) {
                option = 'unMatched'
            } else {
                option = 'all'
            }
            await this.selectMatchType(option)
            this.metaAction.sf('data.other.loading', false)
        }

    }
    /**
     * 提示内容封装
     */
    getDisplayConfirmMSg = (sourceAccount, targetAccount) => {
        return (
            <div style={{ display: 'inline-table' }}>
                <div style={{ 'fontSize': '12px', color: '#484848' }}>{`原表${sourceAccount}科目、${targetAccount}科目有辅助核算，是否启用辅助核算项目？`}</div>
            </div>)
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
    // gradeList = {grade1:4, grade2:2, grade3: 4, grade4:3, grade5:2}
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
//                 // newCode = '00' + (parseInt(maxCode) + 1).toString()
//                 // newCode = newCode.substring(newCode.length - 2)
//             } else {
//                 newCode = PrefixInteger('0', gradeList[item])
//             }
//         } else if (maxCode != '99' && !isNaN(maxCode)) {
//             newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
//             // newCode = '00' + (parseInt(maxCode) + 1).toString()
//             // newCode = newCode.substring(newCode.length - 2)
//         } else {
//             newCode = PrefixInteger('0', gradeList[item])
//             // newCode = '00'
//         }
//     }
//     console.log(newCode)
//     return newCode
// }

function sortNumber(a, b) {
    return a - b
}
