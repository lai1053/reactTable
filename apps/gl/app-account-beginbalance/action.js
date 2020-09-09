import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { Input, Icon } from 'edf-component'
import { clearThousandsPosition, combineAuxItemContent, ACCOUNTTYPE_PROFITANDLOSS, ACCOUNTTYPE_ASSETS } from './data'
import { fromJS } from 'immutable'
import config from './config'
import utils from 'edf-utils'
import * as data from './data'
import { consts } from 'edf-consts'

class action {
    constructor(option) {

        this.metaAction = option.metaAction
        //this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.menuList = {}
        this.clickWraper = {}
        this.isHaveResult = false
    }

    componentDidMount = () => {
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
        } else {
            win.onresize = this.onResize
        }
    }

    componentWillUnmount = () => {
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }
    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                this.computeFun(e)
            }
        }, 100)
    }

    computeFun = (e) => {
        const wrapContent = document.getElementById('app-account-beginbalance-id')
        const headerContent = document.getElementById('app-account-beginbalance-header-id')
        const tabHeadContent = document.getElementById('app-account-beginbalance-tabHeaderDiv-id')
        const singleRowContent = document.getElementById("app-account-beginbalance-singleRowContent-id") ?
            document.getElementById("app-account-beginbalance-singleRowContent-id").getElementsByTagName('tbody')[0] : ''
        const doubleRowContent = document.getElementById("app-account-beginbalance-doubleRowContent-id")
            ? document.getElementById("app-account-beginbalance-doubleRowContent-id").getElementsByTagName('tbody')[0] : ''

        const isCalcQuantity = this.metaAction.gf('data.filter.isCalcQuantity')
        const isCalcMulti = this.metaAction.gf('data.filter.isCalcMulti')
        const isNotJanuary = this.metaAction.gf('data.other.isNotJanuary')
        if (isCalcQuantity || isCalcMulti) {
            if (!doubleRowContent) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.computeFun()
                }, 500)
            } else {
                const wrapContentHeight = wrapContent.offsetHeight
                const headerContentHeight = headerContent.offsetHeight
                const tabHeadContentHeight = tabHeadContent.offsetHeight
                const doubleRowContentHeight = doubleRowContent.offsetHeight
                const num = !isNotJanuary ? 85 : 83

                let tableDivHeight
                tableDivHeight = doubleRowContentHeight < wrapContentHeight - headerContentHeight - tabHeadContentHeight - num ? 0 : wrapContentHeight - headerContentHeight - tabHeadContentHeight - num

                const saveTabDivHeight = this.metaAction.gf('data.other.scrollY')
                if (saveTabDivHeight != tableDivHeight) {
                    this.injections.reduce('setScroll', tableDivHeight)
                }

            }
        } else {
            if (!singleRowContent) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.computeFun()
                }, 500)
            } else {
                const wrapContentHeight = wrapContent.offsetHeight
                const headerContentHeight = headerContent.offsetHeight
                const tabHeadContentHeight = tabHeadContent.offsetHeight
                const singleRowContentHeight = singleRowContent.offsetHeight

                let tableDivHeight
                tableDivHeight = singleRowContentHeight < wrapContentHeight - headerContentHeight - tabHeadContentHeight - 49 ? 0 : wrapContentHeight - headerContentHeight - tabHeadContentHeight - 49

                const saveTabDivHeight = this.metaAction.gf('data.other.scrollY')
                if (saveTabDivHeight != tableDivHeight) {
                    this.injections.reduce('setScroll', tableDivHeight)
                }
            }
        }

    }


    onInit = ({ component, injections }) => {
        //this.extendAction.gridAction.onInit({ component, injections })
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
            addEventListener('enlargeClick', () => this.onResize({}))
        }

        this.initBalanceView()
        //处理财务期初初始化按钮显示
        this.injections.reduce('isShowBtn',this.component.props && this.component.props.appExtendParams)
    }

    initBalanceView = async () => {
        // let accountTypeId = accountTypeEnum.ACCOUNT_ASSETS
        let accountTypeId = ACCOUNTTYPE_ASSETS
        let year = this.metaAction.context.get("currentOrg").enabledYear
        year = Number(year)
        let option = {
            accountTypeId: accountTypeId,
            year: year,
            isCalcQuantity: false,
            isCalcMulti: false
        }
        let currentOrg = this.metaAction.context.get("currentOrg"),
            accountingStandards = currentOrg.accountingStandards == consts.ACCOUNTINGSTANDARDS_2013
        // const response = await this.webapi.init({ accountTypeId: accountTypeId })
        const response = await this.webapi.init(option)
        this.metaAction.sf('data.other.isLoading', false)

        let enabledPeriod = { enabledYear: response.enabledYear ? response.enabledYear : '', enabledMonth: response.enabledMonth ? response.enabledMonth : '', ts: response.ts ? response.ts : '' },
            selectedYear,
            calcDict = response.calcDict, haveMonthlyClosing = response.haveMonthlyClosing,
            settedPeriod = `${response.enabledYear}-${response.enabledMonth}`

        this.injections.reduce('initBalanceView', response, year, settedPeriod, enabledPeriod, accountingStandards, accountTypeId, calcDict, haveMonthlyClosing)
        setTimeout(() => {
            this.computeFun()
        }, 20)
        // //启用期间为空时，系统弹出启用期间选择对话框，供操作员选择启用的期间；COMMENT START 0102 TODO
        if (!response.enabledYear) {
            // resetPeriodBegin('setStartMonth')
            this.changeEnabledPeriod()
        }
    }

    loadBalanceData = async (accountType, selectedYear) => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            accountingStandards = currentOrg.accountingStandards == consts.ACCOUNTINGSTANDARDS_2013
        let accountTypeNew = accountType
        // 若之前为企业准则而且选择的是共同这一项时 切到期初时默认显示资产这列
        if (accountTypeNew == 5000010003 && accountingStandards) {
            accountTypeNew = 5000010001
        }

        let year = this.metaAction.context.get("currentOrg").enabledYear
        year = Number(year)
        let option = {
            accountTypeId: accountTypeNew,
            // year: selectedYear,
            year: year,
            isCalcQuantity: !!this.metaAction.gf('data.filter.isCalcQuantity'),
            isCalcMulti: !!this.metaAction.gf('data.filter.isCalcMulti')
        }

        const response = await this.webapi.init(option)
        this.metaAction.sf('data.other.isLoading', false)
        let enabledPeriod = { enabledYear: response.enabledYear, enabledMonth: response.enabledMonth, ts: response.ts ? response.ts : '' },
            calcDict = response.calcDict, haveMonthlyClosing = response.haveMonthlyClosing,
            settedPeriod = `${response.enabledYear}-${response.enabledMonth}`

        this.injections.reduce('loadBalanceData', response, year, settedPeriod, enabledPeriod, accountingStandards, accountTypeNew, calcDict, haveMonthlyClosing)
        setTimeout(() => {
            this.computeFun()
        }, 20)
    }

    onTabFocus = () => {
        let accountType = this.metaAction.gf('data.filter.targetKey'),
            selectedYear = this.metaAction.gf('data.other.year').get('id')
        this.loadBalanceData(accountType, selectedYear)
    }

    tabChange = async (key) => {
        let selectedYear = this.metaAction.gf('data.other.year').get('id')
        this.loadBalanceData(key, selectedYear)
    }

    reload = async () => {
        const pagination = this.metaAction.gf('data.pagination').toJS()
        const filter = this.metaAction.gf('data.filter').toJS()
        this.load(pagination, filter)
    }
    getDisabledDate = (current) => {
        var disabledDate = new Date(this.metaAction.gf('data.other.settedPeriod'))
        return current && current.valueOf() < disabledDate
    }
    renderColumns = (columnName, v, path, rowIndex) => {

        let list = this.metaAction.gf('data.list'),
            // rowIndex = list.toJS().findIndex((x) => x.accountCode == v.accountCode),
            text = list ? list.get(rowIndex).get(columnName) : '',
            isEndNode = list ? !!list.get(rowIndex).get('isEndNode') : false,
            isCalc = list ? !!list.get(rowIndex).get('isCalc') : false,
            isDetailData = list ? !!list.get(rowIndex).get('isDetailData') : false,
            isCalcMulti = list ? !!list.get(rowIndex).get('isCalcMulti') : false,
            enabledYear = this.metaAction.gf('data.other.enabledYear'),
            selectedYear = this.metaAction.gf('data.other.year'),
            // haveMonthlyClosing = this.metaAction.gf('data.other.haveMonthlyClosing'), //是否月结

            // editable = enabledYear == selectedYear.get('id') ? (isEndNode && !(isCalc || isCalcMulti) && enabledYear == selectedYear.get('id')) || isDetailData : false,
            editable = (isEndNode && !(isCalc || isCalcMulti)) || isDetailData, //年份下拉选去掉 不再受年份控制
            // editable = !haveMonthlyClosing && ((isEndNode && !(isCalc || isCalcMulti)) || isDetailData), //年份下拉选去掉 不再受年份控制 已经月结的不能再进行操作

            accountCode = list ? list.get(rowIndex).get('accountCode') : '',
            oldValue = list ? list.get(rowIndex).get(columnName) : '',
            isResetVisible = this.metaAction.gf('data.other.isResetVisible'),
            customAttribute = this.metaAction.gf('data.other.customAttribute') //为了只有操作另一个input时才去render input

            if(!text){
                text = ''
              }else if(columnName == 'quantityDr'||columnName =='beginQuantity'||columnName=='quantityCr'||columnName=='yearBeginQuantity'){
                // console.log(text)
                text = text && text
                // text = utils.number.format(text,6)
              }else{
                  text = text && text
              }
            return (

            <EditableCell
                editable={editable}
                value={text}
                disabled={!isResetVisible}
                onBlur={(value) => this.handleBlur(rowIndex, columnName, value)}
                onEnter={(e) => this.handleEnter(e, rowIndex, columnName)}
                // onkeydown={(e) => this.handleKeyDown(e, rowIndex, columnName)}
                customAttribute={customAttribute}
                rowIndex={rowIndex}
                columnName={columnName}
            />
        )
    }

    handleKeyDown = (e, rowIndex, columnName) => {
        const inputs = document.getElementsByClassName('ant-input mk-input-number app-account-beginbalance-tableClass')
        let index = $(inputs).index(e.target),
            newValue = e.target.value,
            list = this.metaAction.gf('data.list', list),
            errorMessage = this.getErrorMessage(columnName)
        // 获取光标当前位置
        let cursorPosition = utils.dom.getCursorPosition(e.target)
        // let newValue = e.target.value,list = this.metaAction.gf('data.list', list),errorMessage = this.getErrorMessage(columnName)

        if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.key == 'Enter') {
            if (newValue && newValue.indexOf(',') > -1) {
                newValue = newValue.replace(/,/g, '')
            }
            if (newValue && newValue > 9999999999.99) {
                this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
                return
            }
            if (newValue && newValue < -9999999999.99) {
                this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
                return
            }
            if (newValue && isNaN(Number(parseFloat(newValue)))) {
                this.metaAction.toast('warning', '请输入数字')
                return
            }

            switch (e.keyCode) {
                case 38: //上
                    index = index - 3
                    if (index < 0) {
                        index = index + 3
                    }
                    break;
                case 40: // 下
                    index = index + 3
                    if (index > inputs.length - 1) {
                        index = index - 3
                    }
                    break;
                case 37: // 左
                    // if (cursorPosition == 1 || cursorPosition == 0) {
                    if (cursorPosition == 1) {
                        index = index - 1
                        if (index < 0) {
                            index = index + 1
                        }
                    }
                    break;
                case 39: //右
                    // if (cursorPosition == String(newValue).length + 1 || cursorPosition == String(newValue).length) {
                    if (cursorPosition == String(newValue).length + 1) {
                        index = index + 1
                        if (index > inputs.length - 1) {
                            index = index - 1
                        }
                    }
                    break;
                case 13: //ENTER
                    index = index + 1
                    break;
                case 108:
                    index = index + 1
                    break;
                default: return
            }
        }
        inputs[index].focus()
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
            if (appParams && !appParams.preStep){
                appParams.preStep ='app-account-subjects-financeinit'
            }
            this.component.props.setPortalContent('科目初始化', appParams.preStep, appParams)
        }
    }
    /**
    * 财务期初-完成
    */
    finish = async () => {
        if (this.component.props) {
            const appParams = this.component.props && this.component.props.appExtendParams
            this.component.props.setPortalContent('完成', 'ttk-gl-app-financeinit-success', appParams)
        }
    }

    handleEnter = (e, rowIndex, columnName) => { //enter键切换input框
        if (e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108) {
            const inputs = document.getElementsByClassName('ant-input mk-input-number app-account-beginbalance-tableClass')
            const index = $(inputs).index(e.target)
            let newValue = e.target.value, list = this.metaAction.gf('data.list', list), errorMessage = this.getErrorMessage(columnName)
            if (newValue && newValue > 9999999999.99) {
                this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
                return
            }
            if (newValue && newValue < -9999999999.99) {
                this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
                return
            }
            if (newValue && newValue.indexOf(',') > -1) {
                newValue = newValue.replace(/,/g, '')
            }
            if (isNaN(newValue)) {
                this.metaAction.toast('warning', '请输入数字')
                return
            }
            inputs[index + 1].focus()
        }
    }

    handleBlur = (rowIndex, columnName, value) => {
        // LoadingMask.show()
        let list = this.metaAction.gf('data.list'),
            oldValue = list.get(rowIndex).get(columnName),
            newValue = value,
            errorMessage = this.getErrorMessage(columnName)
        list = list.update(rowIndex, item => item.set(columnName, newValue))
        // newValue = value ? parseFloat(value).toFixed(2) : value
        if (newValue && newValue.indexOf && newValue.indexOf(',') > -1) { //对于修改格式化好的数字 避免isNaN为true
            newValue = newValue.replace(/,/g, '')
        }
        if (newValue > 9999999999.99) {
            newValue = undefined
            list = list.update(rowIndex, item => {
                item = item.set(columnName, newValue)
                return item
            })
            this.metaAction.sf('data.list', list)
            this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整`)
            return
        }
        if (newValue < -9999999999.99) {
            newValue = undefined
            list = list.update(rowIndex, item => {
                item = item.set(columnName, newValue)
                return item
            })
            this.metaAction.sf('data.list', list)
            this.metaAction.toast('warning', `${errorMessage}不能小于9,999,999,999.99，请调整`)
            return
        }
        if (isNaN(newValue)) {
            this.metaAction.toast('warning', '请输入数字')
            return
        }
        list = list.update(rowIndex, item => item.set(columnName, newValue))
        this.metaAction.sf('data.list', list)

        const customAttribute = Math.random()
        this.metaAction.sf('data.other.customAttribute', customAttribute)
        this.onFieldChange(columnName + ',' + rowIndex, oldValue, rowIndex)(newValue)

    }
    setField = async (path, value) => {
        let res = await this.changeEnabledPeriod(value)

    }
    onFieldChange = (path, oldValue, rowIndex) => (newValue) => {

        let accountType = this.metaAction.gf('data.filter.targetKey'),
            selectedYear = this.metaAction.gf('data.other.year').get('id'),
            errorMessage
        //if(oldValue.toString() === newValue) return
        if (oldValue == newValue) return

        //数量、金额、外币变更时，上级科目及年初余额计算
        if (path.indexOf('beginQuantity') > -1 ||
            path.indexOf('beginAmount') > -1 ||
            path.indexOf('beginOrigAmount') > -1 ||
            path.indexOf('quantityDr') > -1 ||
            path.indexOf('amountDr') > -1 ||
            path.indexOf('origAmountDr') > -1 ||
            path.indexOf('quantityCr') > -1 ||
            path.indexOf('amountCr') > -1 ||
            path.indexOf('origAmountCr') > -1) {

            // let rowIndex = path.split(',')[1],
            let curEditField = path.split(',')[0], curYearTotalAmountField, beginAmountField,
                accountType = this.metaAction.gf('data.other.accountType'),
                errorMessage = this.getErrorMessage(curEditField),
                list = this.metaAction.gf('data.list')

            // newValue = clearThousandsPosition(newValue)

            if (newValue && newValue.toString().indexOf(',') > -1) {
                newValue = newValue.replace(/,/g, '')
            }


            let dataName = 'list'
            let curBeginBalance = (this.metaAction.gf('data.list')).toJS()[rowIndex] //当前期初余额行
            // console.log(curBeginBalance, rowIndex, '当前行')
            // 如果是本位币是人民币 填写期初余额时本位币金额和外币保持一致
            const isBaseCurrency = curBeginBalance.isBaseCurrency
            if (isBaseCurrency) {
                switch (curEditField) {
                    case 'beginOrigAmount':
                        beginAmountField = 'beginAmount'
                        break;
                    case 'beginAmount':
                        beginAmountField = 'beginOrigAmount'
                        break;
                    case 'origAmountDr':
                        beginAmountField = 'amountDr'
                        break;
                    case 'amountDr':
                        beginAmountField = 'origAmountDr'
                        break;
                    case 'amountCr':
                        beginAmountField = 'origAmountCr'
                        break;
                    case 'origAmountCr':
                        beginAmountField = 'amountCr'
                        break;
                    default: beginAmountField = curEditField
                }
            }

            let isPositiveNum = false

            //在期初余额，在录入【财务费用-利息收入】的【借方累计、贷方累计】录入时，提示用户请录入负值，包含数量、外币、金额
            if ((path.indexOf('quantityDr') > -1 ||
                path.indexOf('origAmountDr') > -1 ||
                path.indexOf('amountDr') > -1 ||
                path.indexOf('quantityCr') > -1 ||
                path.indexOf('origAmountCr') > -1 ||
                path.indexOf('amountCr') > -1) &&
                curBeginBalance.cashTypeId == 203 &&  //203：利息收入
                parseFloat(newValue) > 0) {

                isPositiveNum = true
                newValue = -parseFloat(newValue)
            }

            //损益类科目时，填写了借方（贷方）累计金额后，贷方（借方）累计金额自动取相同值
            //为了保持年初余额为零
            if (accountType == ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'amountDr') {
                curYearTotalAmountField = 'amountCr'
            } else if (accountType == ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'amountCr') {
                curYearTotalAmountField = 'amountDr'
            }

            if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'origAmountCr') {
                curYearTotalAmountField = 'origAmountDr'
            } else if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'origAmountDr') {
                curYearTotalAmountField = 'origAmountCr'
            }
            //本年借方和贷方的数量也要保持一致
            if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'quantityDr') {
                curYearTotalAmountField = 'quantityCr'
            } else if (accountType == data.ACCOUNTTYPE_PROFITANDLOSS && curEditField == 'quantityCr') {
                curYearTotalAmountField = 'quantityDr'
            }
            let listBalance = [],
                // curEditBeginBalance = this.getBalanceItem(curBeginBalance, curEditField, newValue, curYearTotalAmountField)
                curEditBeginBalance = this.getBalanceItem(curBeginBalance, curEditField, newValue, curYearTotalAmountField, beginAmountField)
            // curEditBeginBalance.year = this.getSelectedYear()
            curEditBeginBalance.year = this.metaAction.gf('data.other.enabledYear'), //不在受年份控制
                listBalance.push(curEditBeginBalance)
            // 期初余额的计算工作放入后端，所以以下三行注释掉 0105 haozhao
            // let curAccountGrade = curBeginBalance.accountGrade
            // listBalance = caculateTopGrade(curEditField, curEditBeginBalance, curAccountGrade, curYearTotalAmountField)
            // let saveUseList = generateSaveUseList(listBalance)
            // 保存期初余额

            this.createAndUpdateBatch(listBalance, curEditField, isPositiveNum, curYearTotalAmountField, beginAmountField) //初始
            //数量CheckBox变更时列的控制
        } else if (path == 'root.children.header.children.right.children.isCalcQuantity') {
            this.metaAction.sf('data.filter.isCalcQuantity', !this.metaAction.gf('data.filter.isCalcQuantity'))
            // this.injections.reduce('changeShowQuanMulti', this.metaAction.gf('data.filter.isCalcQuantity'), 1);

            // this.computeFun(1)

            this.loadBalanceData(accountType, selectedYear)
            //外币CheckBox变更时列的控制
        } else if (path == 'root.children.header.children.right.children.isCalcMulti') {
            this.metaAction.sf('data.filter.isCalcMulti', !this.metaAction.gf('data.filter.isCalcMulti'))
            this.loadBalanceData(accountType, selectedYear)
            // this.computeFun(2)
            //年度变化时，重新加载期初余额
        } else if (path == 'root.children.header.children.left.children.year.children.year') {
            let yearList = this.metaAction.gf('data.other.yearList'),
                hit = yearList.find(o => o.get('id') == newValue)

            if (hit) {
                this.metaAction.sf('data.other.year', fromJS(hit))
                selectedYear = hit.get('id')
            }

            this.loadBalanceData(accountType, selectedYear)
        }
    }


    getErrorMessage = (curEditField) => {
        let errorMessage

        if (curEditField === 'beginQuantity') {
            // errorMessage = `期初余额-数量`
            errorMessage = `期初余额数量`
        } else if (curEditField === 'beginOrigAmount') {
            // errorMessage = `期初余额-外币`
            errorMessage = `期初余额外币`
        } else if (curEditField === 'beginAmount') {
            // errorMessage = `期初余额-金额`
            errorMessage = `期初余额金额`
        } else if (curEditField === 'quantityDr') {
            // errorMessage = `本年借方累计-数量`
            errorMessage = `本年借方累计数量`
        } else if (curEditField === 'origAmountDr') {
            // errorMessage = `本年借方累计-外币`
            errorMessage = `本年借方累计外币`
        } else if (curEditField === 'amountDr') {
            // errorMessage = `本年借方累计-金额`
            errorMessage = `本年借方累计金额`
        } else if (curEditField === 'quantityCr') {
            // errorMessage = `本年贷方累计-数量`
            errorMessage = `本年贷方累计数量`
        } else if (curEditField === 'origAmountCr') {
            // errorMessage = `行本年贷方累计-外币`
            errorMessage = `行本年贷方累计外币`
        } else if (curEditField === 'amountCr') {
            // errorMessage = `本年贷方累计-金额`
            errorMessage = `本年贷方累计金额`
        }

        return errorMessage
    }

    //新增修改合并处理
    createAndUpdateBatch = async (listBalance, curEditField, isPositiveNum, curYearTotalAmountField, beginAmountField) => {
            listBalance.map(item => {
                if(!item.beginAmountDr) item.beginAmountDr = null
                if(!item.beginOrigAmountDr) item.beginOrigAmountDr = null
                if(!item.beginQuantityDr) item.beginQuantityDr = null
                if(!item.beginAmountCr) item.beginAmountCr = null
                if(!item.beginOrigAmountCr) item.beginOrigAmountCr = null
                if(!item.beginQuantityCr) item.beginQuantityCr = null
                if(!item.amountCr) item.amountCr = null
                if(!item.amountDr) item.amountDr = null
                if(!item.origAmountCr) item.origAmountCr = null
                if(!item.origAmountDr) item.origAmountDr = null
                if(!item.quantityCr) item.quantityCr = null
                if(!item.quantityDr) item.quantityDr = null
                return item
            })
        const data = await this.webapi.createAndUpdateBatch(listBalance)
        let accountType = this.metaAction.gf('data.other.accountType')
        const curIsCalcMulti = this.metaAction.gf('data.filter.isCalcMulti')

        if (data) {
            data.dataList.map(subItem => {
                if (subItem.currencyId) {
                    subItem.accountCode = combineAuxItemContent(subItem, 'accountCode') + '_' + subItem.currencyCode
                    // subItem.accountCode = ''
                } else {
                    subItem.accountCode = combineAuxItemContent(subItem, 'accountCode')
                }

                if (subItem[curEditField]) {
                    // if (curEditField == 'beginQuantity' ||
                    //     curEditField == 'quantityDr' ||
                    //     curEditField == 'quantityCr') {
                    //     subItem[curEditField] = subItem[curEditField].toFixed(2)
                    // } else {
                    // subItem[curEditField] = subItem[curEditField].toFixed(2)
                    if(curEditField!='beginQuantity'&&curEditField!='quantityDr'&&curEditField!='quantityCr'&&curEditField!='yearBeginQuantity'){
                        subItem[curEditField] = subItem[curEditField] ? parseFloat(subItem[curEditField]).toFixed(2) : undefined
                    }else{
                        subItem[curEditField] = subItem[curEditField] ? parseFloat(subItem[curEditField]).toFixed(6) : undefined
                    }

                    if (curYearTotalAmountField) {
                        // subItem[curYearTotalAmountField] = subItem[curYearTotalAmountField].toFixed(2)
                        subItem[curYearTotalAmountField] = subItem[curYearTotalAmountField] ? parseFloat(subItem[curYearTotalAmountField]).toFixed(2) : undefined
                    }
                    if (beginAmountField && curIsCalcMulti) {
                        if (accountType == ACCOUNTTYPE_PROFITANDLOSS) {
                            switch (beginAmountField) {
                                case 'origAmountDr':
                                    subItem['origAmountDr'] = parseFloat(subItem['origAmountDr']).toFixed(2)
                                    subItem['amountDr'] = parseFloat(subItem['origAmountDr']).toFixed(2)
                                    subItem['origAmountCr'] = parseFloat(subItem['origAmountDr']).toFixed(2)
                                    subItem['amountCr'] = parseFloat(subItem['origAmountDr']).toFixed(2)
                                    break;
                                case 'amountDr':
                                    subItem['amountDr'] = parseFloat(subItem['amountDr']).toFixed(2)
                                    subItem['origAmountDr'] = parseFloat(subItem['amountDr']).toFixed(2)
                                    subItem['origAmountCr'] = parseFloat(subItem['amountDr']).toFixed(2)
                                    subItem['amountCr'] = parseFloat(subItem['amountDr']).toFixed(2)
                                    break;
                                case 'origAmountCr':
                                    subItem['amountDr'] = parseFloat(subItem['origAmountCr']).toFixed(2)
                                    subItem['origAmountDr'] = parseFloat(subItem['origAmountCr']).toFixed(2)
                                    subItem['origAmountCr'] = parseFloat(subItem['origAmountCr']).toFixed(2)
                                    subItem['amountCr'] = parseFloat(subItem['origAmountCr']).toFixed(2)
                                    break;
                                case 'amountCr':
                                    subItem['amountDr'] = parseFloat(subItem['amountCr']).toFixed(2)
                                    subItem['origAmountDr'] = parseFloat(subItem['amountCr']).toFixed(2)
                                    subItem['origAmountCr'] = parseFloat(subItem['amountCr']).toFixed(2)
                                    subItem['amountCr'] = parseFloat(subItem['amountCr']).toFixed(2)
                                    break;
                                // default: subItem[beginAmountField] = subItem[beginAmountField].toFixed(2)
                                default:
                                    if (beginAmountField.toLowerCase().indexOf('quantity') > -1) {
                                        subItem[beginAmountField] = subItem[beginAmountField] ? parseFloat(subItem[beginAmountField]).toFixed(6) : undefined
                                    } else {
                                        subItem[beginAmountField] = subItem[beginAmountField] ? parseFloat(subItem[beginAmountField]).toFixed(2) : undefined
                                    }
                            }
                        } else {
                            if (beginAmountField.toLowerCase().indexOf('quantity') > -1) {
                                subItem[beginAmountField] = subItem[beginAmountField] ? parseFloat(subItem[beginAmountField]).toFixed(6) : undefined
                            } else {
                                subItem[beginAmountField] = subItem[beginAmountField] ? parseFloat(subItem[beginAmountField]).toFixed(2) : undefined
                            }
                        }
                    }
                    // }
                }
                // subItem['yearBeginQuantity'] = subItem['yearBeginQuantity'].toFixed(2)
                subItem['yearBeginQuantity'] = subItem['yearBeginQuantity'] ? subItem['yearBeginQuantity'].toFixed(6) : undefined
                subItem['yearBeginOrigAmount'] = subItem['yearBeginOrigAmount'] ? subItem['yearBeginOrigAmount'].toFixed(2) : undefined
                // subItem['yearBeginAmount'] = subItem['yearBeginAmount'].toFixed(2)
                subItem['yearBeginAmount'] = subItem['yearBeginAmount'] ? subItem['yearBeginAmount'].toFixed(2) : undefined

                return subItem
            })
            this.injections.reduce('updateBeginBalanceRows', data.dataList, curEditField, data.PeriodBeginDto, curYearTotalAmountField, beginAmountField)
            // this.injections.reduce('updateBeginBalanceRows', data.dataList, curEditField, data.PeriodBeginDto, curYearTotalAmountField)
            if (isPositiveNum) {
                this.metaAction.toast('success', '期初余额更新成功！财务费用下的利息收入是借方科目，[本年借方累计][本年贷方累计]列应该录入负数')
            } else {
                //    this.controlTip()
                this.metaAction.toast('success', '期初余额更新成功')
            }

        }

        // this.reload();
    }

    controlTip = () => {
        let getRandom = Math.floor(Math.random() * 10000)
        this.getRandom = getRandom

        setTimeout(() => {
            if (this.getRandom == getRandom) {
                this.metaAction.toast('success', '期初余额更新成功')
            }
        }, 1000)
    }


    getSelectedYear = () => {
        let selectedYear
        if (this.metaAction.gf('data.other.year')) {
            selectedYear = this.metaAction.gf('data.other.year').get('id')
        }
        return selectedYear
    }

    // getBalanceItem = (balanceFromServer, curEditField, newValue, curYearTotalAmountField) => {
    getBalanceItem = (balanceFromServer, curEditField, newValue, curYearTotalAmountField, beginAmountField) => {
        if (!balanceFromServer) {
            return {}
        }

        let retBalance = {
            id: balanceFromServer.id,    //  期初余额id
            year: balanceFromServer.currentYear,    //	年度
            origAmountDr: clearThousandsPosition(balanceFromServer.origAmountDr),    //	本年借方累计(外币)
            origAmountCr: clearThousandsPosition(balanceFromServer.origAmountCr),    //	本年贷方累计（外币）
            amountDr: clearThousandsPosition(balanceFromServer.amountDr),    //	本年借方累计（本币）
            amountCr: clearThousandsPosition(balanceFromServer.amountCr),    //	本年贷方累计（本币）
            quantityDr: clearThousandsPosition(balanceFromServer.quantityDr),    //	本年借方累计（数量）
            quantityCr: clearThousandsPosition(balanceFromServer.quantityCr),    //	本年贷方累计（数量）
            beginOrigAmount: clearThousandsPosition(balanceFromServer.beginOrigAmount),    //	期初余额（外币）
            beginAmount: clearThousandsPosition(balanceFromServer.beginAmount),    //	期初余额（本币）
            beginQuantity: clearThousandsPosition(balanceFromServer.beginQuantity),    //	期初余额（数量）
            // isAuxAccCalc: balanceFromServer.isAuxAccCalc,    //	是否辅助明细数据
            // isAuxAccCalc:balanceFromServer.isDetailData,    //	是否辅助明细数据
            isDetailData: balanceFromServer.isDetailData,    //	是否辅助明细数据
            unitId: balanceFromServer.unitId,    //	计量单位ID
            currencyId: balanceFromServer.currencyId,    //	币种ID
            currencyCode: balanceFromServer.currencyCode,    //	币种编码
            accountId: balanceFromServer.accountId,    //	科目ID
            accountCode: balanceFromServer.accountCode,    //	科目编码
            direction: balanceFromServer.direction,    //	方向编码
            departmentId: balanceFromServer.departmentId,    //	部门ID
            personId: balanceFromServer.personId,    //	人员ID
            customerId: balanceFromServer.customerId,    //	客户ID
            supplierId: balanceFromServer.supplierId,    //	供应商ID
            inventoryId: balanceFromServer.inventoryId,    //	存货ID
            projectId: balanceFromServer.projectId,    //	项目ID
            bankAccountId: balanceFromServer.bankAccountId,    //	账号ID
            levyAndRetreatId: balanceFromServer.levyAndRetreatId,    //    即征即退ID
            inputTaxId: balanceFromServer.inputTaxId                    //    即征即退ID
        }, accountType = this.metaAction.gf('data.other.accountType')

        if (newValue != undefined) {
            retBalance[curEditField] = newValue
        }
        if (curYearTotalAmountField && newValue != undefined) {
            retBalance[curYearTotalAmountField] = newValue
        }
        if (beginAmountField && newValue != undefined) {
            if (accountType == ACCOUNTTYPE_PROFITANDLOSS) {
                switch (beginAmountField) {
                    case 'origAmountDr':
                        retBalance['origAmountDr'] = newValue
                        retBalance['amountDr'] = newValue
                        retBalance['origAmountCr'] = newValue
                        retBalance['amountCr'] = newValue
                        break;
                    case 'amountDr':
                        retBalance['amountDr'] = newValue
                        retBalance['origAmountDr'] = newValue
                        retBalance['origAmountCr'] = newValue
                        retBalance['amountCr'] = newValue
                        break;
                    case 'origAmountCr':
                        retBalance['amountDr'] = newValue
                        retBalance['origAmountDr'] = newValue
                        retBalance['origAmountCr'] = newValue
                        retBalance['amountCr'] = newValue
                        break;
                    case 'amountCr':
                        retBalance['amountDr'] = newValue
                        retBalance['origAmountDr'] = newValue
                        retBalance['origAmountCr'] = newValue
                        retBalance['amountCr'] = newValue
                        break;
                    default: retBalance[beginAmountField] = newValue
                }
            } else {
                retBalance[beginAmountField] = newValue
            }
        }
        return retBalance
    }



    operateCol = (record, rowIndex) => {
        let obj,
            enabledYear = this.metaAction.gf('data.other.enabledYear'),
            selectedYear = this.metaAction.gf('data.other.year').get('id')

        // if (record && (record.isCalcMulti || record.isCalc) && !record.isDetailData && record.isEndNode && enabledYear == selectedYear) {
        if (record && (record.isCalcMulti || record.isCalc) && !record.isDetailData && record.isEndNode) {
            obj = {
                children: (
                    <span>
                        <Icon type="xinzengkemu" fontFamily='edficon' className='table_fixed_width-addIcon' title='新增' onClick={() => this.addAuxItem(record, rowIndex)} />
                    </span>
                )
            }
            // } else if (record && record.isDetailData && enabledYear == selectedYear) {
        } else if (record && record.isDetailData) {
            obj = {
                children: (
                    <span>
                        <Icon type="shanchu" fontFamily='edficon' className='table_fixed_width-deleteIcon' title='删除' onClick={() => this.deleteAuxItem(record, rowIndex)} />
                    </span>
                )
            }
        }

        return obj
    }

    deleteItem = async (selectObj, selectIndex) => {
        // const year = selectObj.year
        let year = this.metaAction.context.get("currentOrg").enabledYear
        year = Number(year)
        const id = selectObj.id
        const result = await this.webapi.deleteAuxItem({ id, year })
        if (result) {
            this.injections.reduce('deleteAuxItemRows', result.dataList, selectIndex, result.PeriodBeginDto)
            this.metaAction.toast('success', '期初余额删除成功')
            this.computeFun()
        }
    }

    //删除辅助明细确认弹框
    deleteAuxItem = async (record, rowIndex) => {
        const _this = this
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '你确定要删除吗？',
            onOk() {
                _this.deleteItem(record, rowIndex)
            },
            onCancel() { }
        })

    }

    // 新增辅助明细
    addBatch = async (listBalance, rowIndex, isSelectCurrency, accountId) => {
        if (this.isHaveResult) return
        listBalance.isReturnValue = true
        this.isHaveResult = true
        listBalance.map(item => {
            if(!item.beginAmountDr) item.beginAmountDr = null
            if(!item.beginOrigAmountDr) item.beginOrigAmountDr = null
            if(!item.beginQuantityDr) item.beginQuantityDr = null
            if(!item.beginAmountCr) item.beginAmountCr = null
            if(!item.beginOrigAmountCr) item.beginOrigAmountCr = null
            if(!item.beginQuantityCr) item.beginQuantityCr = null
            if(!item.amountCr) item.amountCr = null
            if(!item.amountDr) item.amountDr = null
            if(!item.origAmountCr) item.origAmountCr = null
            if(!item.origAmountDr) item.origAmountDr = null
            if(!item.quantityCr) item.quantityCr = null
            if(!item.quantityDr) item.quantityDr = null
            return item
        })
        const data = await this.webapi.createAndUpdateBatch(listBalance)

        if (data.result == false) {
            this.isHaveResult = false
            this.metaAction.toast('warning', data.error.message)
            return false
        } else {
            this.isHaveResult = false
            for (let auxItem of data.dataList) {
                // let filteredItem = data.dataList.filter(subItem => {
                //     if (subItem.isDetailData) {
                //         return combineAuxItemContent(subItem, 'accountCode') + '_' + subItem.currencyCode == auxItem.accountCode + '_' + auxItem.currencyCode
                //     } else {
                //         return subItem.accountCode == auxItem.accountCode
                //     }
                // })
                // if (filteredItem && filteredItem.length > 0) {
                //     console.log(filteredItem)
                //     // auxItem.id = filteredItem[0].id
                //     auxItem.yearBeginQuantity = filteredItem[0].yearBeginQuantity ?
                //     addThousandsPosition(parseFloat(filteredItem[0].yearBeginQuantity).toFixed(2)) == 0 ? undefined :
                //     addThousandsPosition(parseFloat(filteredItem[0].yearBeginQuantity).toFixed(2)) : undefined

                //     auxItem.yearBeginOrigAmount = filteredItem[0].yearBeginOrigAmount ?
                //     addThousandsPosition(parseFloat(filteredItem[0].yearBeginOrigAmount).toFixed(2)) == 0 ? undefined :
                //     addThousandsPosition(parseFloat(filteredItem[0].yearBeginOrigAmount).toFixed(2)) : undefined
                //     console.log(filteredItem[0].yearBeginAmount, 'filteredItem[0].yearBeginAmount4444444444')
                //     if (filteredItem[0].yearBeginAmount && filteredItem[0].yearBeginAmount.toString().indexOf(',') > -1) {
                //         auxItem.yearBeginAmount = filteredItem[0].yearBeginAmount ? filteredItem[0].yearBeginAmount : undefined
                //     } else {
                //         auxItem.yearBeginAmount = filteredItem[0].yearBeginAmount ?
                //         addThousandsPosition(parseFloat(filteredItem[0].yearBeginAmount).toFixed(2)) == 0 ? undefined :
                //         addThousandsPosition(parseFloat(filteredItem[0].yearBeginAmount).toFixed(2)) : undefined
                //     }

                // }

                const attributArr = ['yearBeginQuantity', 'yearBeginAmount', 'yearBeginOrigAmount', 'amountDr', 'amountCr', 'origAmountDr', 'origAmountCr', 'quantityDr', 'quantityCr', 'beginAmount', 'beginOrigAmount', 'beginQuantity']

                attributArr.forEach((item) => {
                    if(item == 'yearBeginQuantity'||item=='quantityDr'||item=='quantityCr'||item=='beginQuantity'){
                        // auxItem[item] = auxItem[item] ? utils.number.format(auxItem[item],6) == 0 ? '' : utils.number.format(auxItem[item],6) : ''
                        auxItem[item] = auxItem[item]&&utils.number.format(auxItem[item],6)
                        // console.log(auxItem[item])
                    }else{
                        auxItem[item] = addThousandsPosition(auxItem[item],true) ? addThousandsPosition(auxItem[item],true) == 0 ? '' : addThousandsPosition(auxItem[item],true) : ''

                    }
                })
                // console.log(auxItem)
            }
            this.injections.reduce('addAuxCalcItemRows', data.dataList, rowIndex, isSelectCurrency, accountId, data.PeriodBeginDto)

            this.metaAction.toast('success', '期初余额新增成功')
            this.computeFun()
            return true
        }

    }
    handlerResult = async (result, accountingSubject, rowIndex) => {
        // console.log(result.value.toJS())
        if (result) {
            let selectedYear = this.metaAction.gf('data.other.enabledYear'), //不在受年份控制
                list = this.metaAction.gf('data.list'),
                auxItems = [],
                accountId = accountingSubject.accountId,
                accountCode = accountingSubject.accountCode,
                direction = accountingSubject.direction,
                cashTypeId = accountingSubject.cashTypeId

            const resultList = result.value.toJS()
            for (let i = 0; i < resultList.length; i++) {
                let item = resultList[i],
                    auxItem = this.addFileToBalance(item, selectedYear, accountId, accountCode, direction, cashTypeId, accountingSubject)
                auxItems.push(auxItem)
            }

            let arrAuxItems = list.filter(subItem => {
                return subItem.get('accountId') == accountId &&
                    subItem.get('isDetailData') == true
            })

            for (let i = 0; i < auxItems.length; i++) {
                let filterItem = arrAuxItems.filter(subItem => {
                    if (auxItems[i].currencyId) {
                        return subItem.get('accountCode') + '_' + subItem.get('currencyCode') == auxItems[i].accountCode + '_' + auxItems[i].currencyCode
                    } else {
                        return subItem.get('accountCode') == auxItems[i].accountCode
                    }
                })

                if (filterItem.size > 0) {
                    // setMessage({ type: 'warning', mode: 'message', content: '辅助项不能重复添加！' })
                    this.metaAction.toast('warning', '辅助项不能重复添加')
                    return
                }
            }

            let addAuxItems = []
            for (let i = 0; i < auxItems.length; i++) {
                if (auxItems[i].addFlg != 0) {
                    addAuxItems.push(auxItems[i])
                }
            }

            if (addAuxItems.length == 0) {
                clearMessage()
                return
            }

            // 若当前期初余额还未入库，则逐级次找出上级科目期初余额数据准备入库
            // let id = getterByField(`list.${rowIndex}.id`), //期初余额id
            //     accountGrade = getterByField(`list.${rowIndex}.accountGrade`)


            // 判断是否有选择了币种
            let isSelectCurrency = false

            for (let i = 0; i < result.value.length; i++) {
                let auxItem = result.value[i]
                if (!!auxItem.currencyId && (!!auxItem.currencyId.code || auxItem.currencyId.id || auxItem.currencyId.name)) {
                    isSelectCurrency = true
                    break
                }
            }

            const res = this.addBatch(addAuxItems, rowIndex, isSelectCurrency, accountId)

            return res
            //this.reload()
        }

    }

    //增加辅助项弹框
    addAuxItem = async (accountingSubject, rowIndex) => {
        accountingSubject.accountType = this.metaAction.gf('data.other.accountType')
        // const isNotJanuary = this.metaAction.gf('data.other.isNotJanuary')
        const enabledMonth = this.metaAction.gf('data.other.enabledMonth')
        const isNotJanuary = enabledMonth != 1
        const calcDict = this.metaAction.gf('data.other.calcDict')

        let width,
            valueTrueNum = 0,
            colums, title = '外币期初余额'

        for (let key in accountingSubject) {
            if (accountingSubject.hasOwnProperty(key) && typeof (accountingSubject[key]) == 'boolean' && accountingSubject[key] == true) {
                if (key == 'isMultiCalc') {
                    valueTrueNum = valueTrueNum + 1
                } else {
                    valueTrueNum += 1
                }
            }
        }
        switch (valueTrueNum) {
            case 1:
                width = 500
                break;
            case 2:
                width = 500
                break;
            case 3:
                width = 600
                break;
            case 4:
                width = 600
                break;
            case 5:
                width = 700
                break;
            case 6:
                width = 800
                break;
            case 7:
                width = 900
                break;
            case 8:
                width = 1000
                break;
            case 9:
                width = 1100
                break;
            case 10:
                width = 1200
                break;
            default:
                width = (valueTrueNum + 3) * 100
                break;
        }

        if (enabledMonth > 1) {
            // width += 300
            width += 200
            if (accountingSubject.isCalcMulti == true) {
                // width += 600
                width += 400
            }
            if (accountingSubject.isCalcQuantity == true) {
                // width += 300
                width += 200
            }
        } else {
            if (accountingSubject.isCalcMulti == true) {
                // width += 200
                width += 100
            }
            if (accountingSubject.isCalcQuantity == true) {
                // width += 100
            }
        }

        colums = width

        if (width > 1200) {
            // width = 1200
            width = '80%'
        }

        if (width > 700 && width < 1000) {
            width = '60%'
        }

        if (width > 1000 && width < 1200) {
            width = '70%'
        }

        for (let item in accountingSubject) {
            for (let key in calcDict) {
                if (item == key && accountingSubject[item] == true) {
                    title = '辅助核算期初余额'
                    break
                }
            }
        }
        const result = await this.metaAction.modal('show', {
            // title: '新增辅助核算明细',
            title: title,
            width: width,
            height: 500,
            children: this.metaAction.loadApp('app-account-addmultiauxitem', {
                store: this.component.props.store,
                columnCode: "common",
                initData: { accountingSubject, isNotJanuary, calcDict, rowIndex, colums },
                callbackAction: this.handlerResult
            })
        })


    }


    addFileToBalance = (selectedFiles, currentYear, accountId, accountCode, direction, cashTypeId, accountingSubject) => {
        // return injectFuns => {
        const calcDict = this.metaAction.gf('data.other.calcDict')
        let assistList = []

        let customer = selectedFiles.customer,
            department = selectedFiles.department,
            person = selectedFiles.person,
            inventory = selectedFiles.inventory,
            supplier = selectedFiles.supplier,
            project = selectedFiles.project,
            currency = selectedFiles.currency
        let auxItem = {
            // currentYear: currentYear,
            year: currentYear,
            accountId: accountId,
            direction: direction,
            directionName: direction == 0 ? '借' : '贷',
            accIsAuxAccCalc: true,  //会计科目，是否启用辅助核算
            // isAuxAccCalc: true,     //期初余额，是否辅助核算项目
            isDetailData: true,     //期初余额，是否辅助核算项目
            accountCode: accountCode,
            accountName: '',
            isEndNode: true,
            cashTypeId: cashTypeId
        }

        for (let item in calcDict) {
            if (calcDict.hasOwnProperty(item) === true) {
                if (item.includes('isExCalc') && accountingSubject[item]) {
                    // console.log(item,accountingSubject, calcDict,accountingSubject[item])
                    assistList.push(item)
                }
            }
        }

        assistList.sort((a, b) => { //科目期初名称自定义档案排序
            let aNumber = parseInt(a.slice(8))
            let bNumber = parseInt(b.slice(8))
            return a > b
        })

        if (currency) {
            auxItem.currencyId = currency.id
            auxItem.currencyCode = currency.code
            auxItem.currencyName = currency.name
            auxItem.isMultiCalc = true
        }

        // auxItem = this.combineItem(auxItem, customer, 'customerId')
        // auxItem = this.combineItem(auxItem, department, 'departmentId')
        // auxItem = this.combineItem(auxItem, person, 'personId')
        // auxItem = this.combineItem(auxItem, inventory, 'inventoryId')
        // auxItem = this.combineItem(auxItem, supplier, 'supplierId')
        // auxItem = this.combineItem(auxItem, project, 'projectId')
        auxItem = this.combineItem(auxItem, customer, 'customerId')
        auxItem = this.combineItem(auxItem, supplier, 'supplierId')
        auxItem = this.combineItem(auxItem, project, 'projectId')
        auxItem = this.combineItem(auxItem, department, 'departmentId')
        auxItem = this.combineItem(auxItem, person, 'personId')
        auxItem = this.combineItem(auxItem, inventory, 'inventoryId')

        if (assistList.length != 0) {
            for (let i = 0; i < assistList.length; i++) {
                // console.log(assistList[i],selectedFiles[assistList[i]],parseInt(assistList[i]), 'selectedFiles[assistList[i]]')
                const num = assistList[i].replace(/[^0-9]/ig, "")
                auxItem = this.combineItem(auxItem, selectedFiles[assistList[i]], `exCalc${num}`)
            }
        }

        if (auxItem.accountCode.substring(0, 1) == '_') {
            auxItem.accountCode = auxItem.accountCode.substring(1)
        }
        if (auxItem.accountName.substring(0, 1) == '_') {
            auxItem.accountName = auxItem.accountName.substring(1)
        }

        if (!!selectedFiles.beginAmount) {
            auxItem.beginAmount = selectedFiles.beginAmount
        }
        if (!!selectedFiles.beginOrigAmount) {
            auxItem.beginOrigAmount = selectedFiles.beginOrigAmount
        }
        if (!!selectedFiles.beginQuantity) {
            auxItem.beginQuantity = selectedFiles.beginQuantity
        }
        if (!!selectedFiles.quantityCr) {
            auxItem.quantityCr = selectedFiles.quantityCr
        }
        if (!!selectedFiles.quantityDr) {
            auxItem.quantityDr = selectedFiles.quantityDr
        }
        if (!!selectedFiles.origAmountCr) {
            auxItem.origAmountCr = selectedFiles.origAmountCr
        }
        if (!!selectedFiles.origAmountDr) {
            auxItem.origAmountDr = selectedFiles.origAmountDr
        }
        if (!!selectedFiles.amountCr) {
            auxItem.amountCr = selectedFiles.amountCr
        }
        if (!!selectedFiles.amountDr) {
            auxItem.amountDr = selectedFiles.amountDr
        }
        /*if(!!selectedFiles.sequence){
          auxItem.sequence = selectedFiles.sequence
        }*/

        return auxItem
        //   }
    }

    combineItem = (auxItem, resourceAuxItems, fieldId) => {
        if (resourceAuxItems) {
            if (fieldId == 'personId' || fieldId == 'bankAccountId') {
                auxItem[fieldId] = resourceAuxItems.id
                auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.name
                auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.name
            } else if (fieldId == 'levyAndRetreatId') {
                auxItem[fieldId] = resourceAuxItems.enumItemId
                auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.enumItemId
                auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.enumItemName
            } else if (fieldId == 'inputTaxId') {
                auxItem[fieldId] = resourceAuxItems.enumItemId
                auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.enumItemId
                auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.enumItemName
            } else {
                auxItem[fieldId] = resourceAuxItems.id
                auxItem.accountCode = auxItem.accountCode + '_' + resourceAuxItems.code
                auxItem.accountName = auxItem.accountName + '_' + resourceAuxItems.name
                // auxItem.accountName =  auxItem.accountName ? resourceAuxItems.name + '_' + auxItem.accountName : resourceAuxItems.name

            }
        }

        return auxItem
    }

    //平衡
    renderBanlace = (num) => {
        const tryCacuBalance = this.metaAction.gf('data.other.tryCacuBalance').toJS()
        const beginAmountCr = tryCacuBalance.beginAmountCr ? tryCacuBalance.beginAmountCr : 0
        const beginAmountDr = tryCacuBalance.beginAmountDr ? tryCacuBalance.beginAmountDr : 0
        const yearBeginAmountCr = tryCacuBalance.yearBeginAmountCr ? tryCacuBalance.yearBeginAmountCr : 0
        const yearBeginAmountDr = tryCacuBalance.yearBeginAmountDr ? tryCacuBalance.yearBeginAmountDr : 0

        if (num == 1) {
            if (parseFloat(beginAmountDr) > parseFloat(beginAmountCr)) {
                const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span style={{ color: 'red' }}>&gt;</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
                return value
            } else {
                if (parseFloat(beginAmountDr) == parseFloat(beginAmountCr)) {
                    const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span>=</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
                    return value
                } else {
                    const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span style={{ color: 'red' }}>&lt;</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
                    // const value = <span>期初: 借{addThousandsPosition(beginAmountDr.toFixed(2))} <span style={{color: '#00B38A'}}>&lt;</span> 贷{addThousandsPosition(beginAmountCr.toFixed(2))}</span>
                    return value
                }
            }
        } else if (num == 2) {
            if (parseFloat(yearBeginAmountDr) > parseFloat(yearBeginAmountCr)) {
                const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span style={{ color: 'red' }}>&gt;</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
                return value
            } else {
                if (parseFloat(yearBeginAmountDr) == parseFloat(yearBeginAmountCr)) {
                    const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span>=</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
                    // const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span style={{color: '#00B38A'}}>=</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
                    return value
                } else {
                    const value = <span>年初: 借{addThousandsPosition(yearBeginAmountDr.toFixed(2))} <span style={{ color: 'red' }}>&lt;</span> 贷{addThousandsPosition(yearBeginAmountCr.toFixed(2))}</span>
                    return value
                }
            }
        }
    }

    //点击导入
    onClickLeadIn = async () => {
        const result = await this.metaAction.modal('show', {
            title: <div style={{ fontSize: '16px', fontWeight: '500' }}>导入</div>,
            width: 400,
            height: 500,
            okText: '导入期初',
            children: this.metaAction.loadApp('app-account-beginbalance-leadIn', {
                store: this.component.props.store,
                columnCode: "common",
                callbackAction: this.handlerLeadInResult
            }),
        })
        if (result) {
            let accountType = this.metaAction.gf('data.filter.targetKey'),
                selectedYear = this.metaAction.gf('data.other.year').get('id')

            this.injections.reduce('isShowLoading', true)

            this.metaAction.sf('data.filter.isCalcMulti', false)
            this.metaAction.sf('data.filter.isCalcQuantity', false)

            const res = this.loadBalanceData(accountType, selectedYear)

            // const res = this.initBalanceView();

            res.then(() => {
                this.injections.reduce('isShowLoading', false)
            })
        }
    }

    handlerLeadInResult = () => {
        let accountType = this.metaAction.gf('data.filter.targetKey'),
            selectedYear = this.metaAction.gf('data.other.year').get('id')

        this.injections.reduce('isShowLoading', true)

        this.metaAction.sf('data.filter.isCalcMulti', false)
        this.metaAction.sf('data.filter.isCalcQuantity', false)

        const res = this.loadBalanceData(accountType, selectedYear)

        // const res = this.initBalanceView();

        res.then(() => {
            this.injections.reduce('isShowLoading', false)
        })
    }

    // 点击调整启用月份
    changeEnabledPeriod = async (value) => {
        // const enabledYear = this.metaAction.gf('data.other.enabledYear') ? this.metaAction.gf('data.other.enabledYear') : ''
        // const enabledMonth = this.metaAction.gf('data.other.enabledMonth') ? this.metaAction.gf('data.other.enabledMonth') + '月' : ''
        // const ts = this.metaAction.gf('data.other.ts') ? this.metaAction.gf('data.other.ts') : ''
        // // const accountTypeId = ACCOUNTTYPE_ASSETS
        // const result = await this.metaAction.modal('show', {
        //     title: <div>启用月份设置</div>,
        //     width: 450,
        //     height: 400,
        //     children: this.metaAction.loadApp('app-account-beginbalance-changePeriod', {
        //         store: this.component.props.store,
        //         columnCode: "common",
        //         initData: { enabledYear, enabledMonth, ts }
        //     }),
        // })

        // if (result) {
        //     let accountType = this.metaAction.gf('data.filter.targetKey'),
        //     // selectedYear = this.metaAction.gf('data.other.year').get('id')
        //     selectedYear = result //这里是因为年份选择那个下拉选去掉了
        //     this.injections.reduce('isShowLoading', true)

        //     this.metaAction.sf('data.filter.isCalcMulti', false)
        //     this.metaAction.sf('data.filter.isCalcQuantity', false)
        //     // console.log(selectedYear, 'selectedYear-----------')
        //     const res = this.loadBalanceData(accountType, selectedYear)
        //     // const res = this.initBalanceView();
        //     res.then(() => {
        //         this.injections.reduce('isShowLoading', false)
        //     })
        // }

        const selectYear = value.split('-')[0]
        const selectMonth = value.split('-')[1]
        const ts = this.metaAction.gf('data.other.ts') ? this.metaAction.gf('data.other.ts') : ''
        const obj = {}

        obj.year = selectYear
        obj.period = Number(selectMonth.split('月')[0])
        obj.isReturnValue = true
        obj.ts = ts
        const res = await this.webapi.updatePeriod(obj)
        // console.log(res)
        if (!res.error) {
            this.metaAction.toast('success', '启用期间调整成功')
            //
            this.metaAction.sf('data.other.ts', res.ts)
            const obj = this.metaAction.context.get("currentOrg")
            obj.enabledMonth = Number(selectMonth.split('月')[0])
            obj.enabledYear = selectYear
            this.metaAction.context.set("currentOrg", obj)
            this.metaAction.sf('data.other.settedPeriod', `${res.enabledYear}-${res.enabledMonth}`)
            let accountType = this.metaAction.gf('data.filter.targetKey')
            this.injections.reduce('isShowLoading', true)
            this.metaAction.sf('data.filter.isCalcMulti', false)
            this.metaAction.sf('data.filter.isCalcQuantity', false)
            this.component.props.onPortalReload && this.component.props.onPortalReload()
            const data = this.loadBalanceData(accountType, selectYear)
            data.then(() => {
                this.injections.reduce('isShowLoading', false)
            })
            return selectYear
        } else if(res.error){
            this.metaAction.toast('error', res.error.message)
            return false
        }
    }

    renderSpan = (name, value) => {
        // console.log(value)
        switch (name) {
            case 'yearBeginQuantity':
                return <div className='app-account-beginbalance-tableClass' title={value}>{value}</div>
            case 'yearBeginOrigAmount':
                return <div className='app-account-beginbalance-tableClass' title={value}>{value}</div>
            case 'yearBeginAmount':
                return <div className='app-account-beginbalance-tableClass' title={value}>{value}</div>
            default: return ''
        }
    }

    // 名称列
    renderNameColumn = (value, index) => {
        switch (value.accountGrade) {
            case 1:
                return <div className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            case 2:
                return <div style={{ paddingLeft: '15px' }} className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            case 3:
                return <div style={{ paddingLeft: '30px' }} className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            case 4:
                return <div style={{ paddingLeft: '45px' }} className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            case 5:
                return <div style={{ paddingLeft: '60px' }} className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            case '':
                return <div className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
            default: return <div className='app-account-beginbalance-renderNameDiv' title={value.accountName}>{value.accountName}</div>
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        //extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction })

    const ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
const EditableCell = ({ editable, value, onBlur, onEnter, onkeydown, customAttribute, disabled, rowIndex, columnName }) => {
    let regex
    if(columnName == 'beginQuantity' || columnName =='quantityDr'||columnName =='quantityCr'){
        regex = '^(-?[0-9]+)(?:\.[0-9]{1,6})?$'
      }else{
        regex = '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
      }
    return (
        <div style={{ textAlign: 'right' }}>
            {editable
                ? <Input.Number
                    // key={Math.random()}
                    style={{ margin: '-5px 0' }}
                    customAttribute={customAttribute}
                    className={(columnName == 'beginAmount' && rowIndex == 2) ? 'app-account-beginbalance-tableClass stepShowRowIndex' : 'app-account-beginbalance-tableClass'}
                    onPressEnter={(e) => onEnter(e)}
                    // disabled = {}
                    // onKeyDown={(e) =>{onkeydown(e)} }
                    value={value}
                    disabled={disabled}
                    onBlur={(value) => onBlur(value)}
                    regex={regex}
                    />

                : <div className='app-account-beginbalance-tableClass' title={value}>{value}</div>
            }
        </div>
    )
}


const addThousandsPosition = (input, isFixed) => {
    if (isNaN(input)) return null
    // if(isNaN(input)) return ''
    let num

    if (isFixed) {
        num = parseFloat(input).toFixed(2)
    } else {
        num = input.toString()
    }
    let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

    return num.replace(regex, "$1,")
}
