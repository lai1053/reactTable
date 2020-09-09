import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import { TableOperate, Select, Button, Modal, Checkbox, ActiveLabelSelect,Timeline,Icon, PrintOption3 } from 'edf-component'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
const Option = Select.Option
import { consts } from 'edf-consts'
import renderColumns from './utils/renderColumns'
import { sortBaseArchives, sortSearchOption, changeToOption } from './utils/app-auxbalancesum-rpt-common'
import { LoadingMask } from 'edf-component'
import utils from 'edf-utils'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
        this.handleTimeLineItem = utils.throttle(this.handleTimeLineItem, 800)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }
        injections.reduce('init', data)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        this.load()
    }
    //页签切换
    onTabFocus = () => {
        this.load('tab')
        this.metaAction.sf('data.other.currentTime', '')
    }

    // 初始化基础信息选项
    getInitOption = async (type = 'load') => {
        //级次
        const accountDepthList = await this.webapi.auxBalanceSumRpt.queryAccountDepth()
        //初始化查询界面辅助项
        const auxBaseArchives = await this.webapi.auxBalanceSumRpt.queryBaseArchives({ isContentEmpty: true })
        const auxGroupList = sortBaseArchives(auxBaseArchives)
        const maxDocPeriod = await this.getMaxDocPeriod()
        //从上下文获取财务开账期间
        const currentOrg = this.metaAction.context.get("currentOrg")
        const enabledPeriod = currentOrg.enabledYear + '-' + `${currentOrg.enabledMonth}`.padStart(2, '0')
        let res = { accountDepthList, enabledPeriod }
        const isChangeSipmleDate = this.metaAction.gf('data.other.changeSipmleDate')
        if (type == 'tab') {
            //页签切换，判断简单日期是否修改过。
            if (!isChangeSipmleDate) {
                res[3] = { maxDocPeriod }
            }
            this.updateBaseArchives(auxGroupList)
        } else {
            res = { accountDepthList, enabledPeriod, maxDocPeriod, auxGroupList }
        }
        
        const result = await this.webapi.auxBalanceSumRpt.getExistsDataScope()
        this.injections.reduce('initOption', { ...res, timePeriod: result||{}})
        // this.metaAction.sf('data.other.timePeriod', fromJS(result||{}))
    }
    getSearchCard = (childrenRef) => {
        this.searchCardDet = childrenRef
    }
    clearValueChange =async (value) => {
        const searchValue = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        const other = this.metaAction.gf('data.other').toJS()
        const auxBaseArchives = await this.webapi.auxBalanceSumRpt.queryBaseArchives({ isContentEmpty: true })
        const auxGroupList = sortBaseArchives(auxBaseArchives)
        this.initBaseArchives(auxGroupList)
        this.metaAction.sfs({
            'data.searchValue.date_start': other.date_start,
            'data.searchValue.date_end': other.date_end,
            'data.searchValue.groupStr': 'customerId',
            'data.searchValue.whereStr': '',
            'data.searchValue.beginAccountGrade': 1,
            'data.searchValue.endAccountGrade': 5,
            'data.searchValue.accountCodeList': [],
            'data.searchValue.showZero': ['1']
        })
    }
    initBaseArchives = (data) => {
        this.injections.reduce('updateBathState', [
            {
                path: 'data.assistForm.initOption',
                value: data
            }, {
                path: 'data.assistForm.assistFormOption',
                value: data
            }, {
                path: 'data.assistForm.assistFormSelectValue',
                value: ['customerId']
            }
        ])
    }
    load = (type = 'load') => {
        this.getInitOption(type).then(() => {
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            const { assistFormOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm').toJS()
            const whereStr = searchValue.whereStr || assistFormSelectValue.join(',')
            const groupStr = searchValue.groupStr || assistFormSelectValue.join(',')
            let tmpstr = ''
            if (whereStr != groupStr) {
                tmpstr = whereStr
            }
            this.searchValueChange({
                ...searchValue,
                groupStr: groupStr,
                whereStr: tmpstr
            })
            setTimeout(() => {
                this.onResize()
            }, 20)
        })
    }
    updateBaseArchives = (data) => {
        const { assistFormOption, initOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm').toJS()
        const arrAssitForm = []
        data.forEach(item => {
            const oldItem = assistFormOption.find(index => index.key == item.key)
            if (oldItem) {
                const oldValue = oldItem.value
                if (oldValue) {
                    // 附上刚才选择的值
                    const newArr = oldValue.filter(x => {
                        const flag = item.children.find(y => y.value == x)
                        return flag ? true : false
                    })
                    item.value = newArr
                }
            }
            arrAssitForm.push(item)
        })
        const arrAssitFormSelectValue = []
        assistFormSelectValue.forEach(item => {
            const flag = data.find(index => index.key == item)
            if (flag) {
                arrAssitFormSelectValue.push(item)
            }
        })
        if(arrAssitForm&&assistFormSelectValue){
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }
            ])
        }else{
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.assistFormOption',
                    value: arrAssitForm
                }, {
                    path: 'data.assistForm.assistFormSelectValue',
                    value: assistFormSelectValue
                }
            ])
        }

    }
    queryAccountSubjects = async () => {
        let res = await this.webapi.auxBalanceSumRpt.queryAccountList()
        if (res) {
            window.auxBalanceSumAccountList = res.glAccounts
            this.metaAction.sf('data.other.isQueryAccountSubjects', Math.random())
        }  
    }
    //1、渲染查询条件
    renderCheckBox = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox">
                <Checkbox value="1">显示余额为0，发生额不为0的记录</Checkbox>
            </Checkbox.Group>
        )
    }
    //2、渲染查询条件
    renderAuxSearchItem = () => {
        const { assistFormOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm').toJS()
        const { accountList, startAccountDepthList, endAccountDepthList } = this.metaAction.gf('data.other').toJS()
        const searchType = this.metaAction.gf('data.showOption.searchType')
        let auxSearchItem;
        switch (searchType) {
            case 0:
                auxSearchItem = [
                    {
                        name: 'date',
                        range: true,
                        label: '会计期间',
                        centerContent: '－',
                        isTime: true,
                        pre: {
                            name: 'date_start',
                            type: 'DatePicker.MonthPicker',
                            mode: ['month', 'month'],
                            format: 'YYYY-MM',
                            allowClear: false,
                            decoratorDate: (value, value2) => { return this.disabledDate(value, value2, "pre") }
                        },
                        next: {
                            name: 'date_end',
                            type: 'DatePicker.MonthPicker',
                            mode: ['month', 'month'],
                            format: 'YYYY-MM',
                            allowClear: false,
                            decoratorDate: (value, value2) => { return this.disabledDate(value, value2, "next") }
                        }
                    }, {
                        name: 'assitform',
                        type: 'AssistForm',
                        assistFormOption: assistFormOption,
                        assistFormSelectValue: assistFormSelectValue
                    }, {
                        name: 'accountCodeList',
                        label: '会计科目',
                        type: 'Select',
                        mode: 'multiple',                        
                        onMouseEnter: () => this.onFieldFocus(window.auxBalanceSumAccountList),
                        allowClear: true,
                        childType: 'Option',
                        showSearch: '{{true}}',
                        optionFilterProp: "children",
                        filterOption: (inputValue, option) => { return this.filterAccountOption(inputValue, option) },
                        option: this.metaAction.gf('data.other.accountList').toJS()//this.getAccountOptionList()
                    }, {
                        name: 'accountDepth',
                        range: true,
                        label: '科目级次',
                        centerContent: '－',
                        pre: {
                            name: 'beginAccountGrade',
                            type: 'Select',
                            childType: 'Option',
                            option: startAccountDepthList,
                            allowClear: false
                        },
                        next: {
                            name: 'endAccountGrade',
                            type: 'Select',
                            childType: 'Option',
                            option: endAccountDepthList,
                            allowClear: false
                        }
                    },
                    {
                        name: 'showZero',
                        label: '',
                        type: 'Checkbox.Group',
                        render: this.renderCheckBox,
                        allowClear: false
                    }
                ]
                break
            case 1:
                auxSearchItem = [
                    {
                        name: 'date',
                        range: true,
                        label: '会计期间',
                        centerContent: '－',
                        isTime: true,
                        pre: {
                            type: 'DatePicker.MonthPicker',
                            mode: ['month', 'month'],
                            format: 'YYYY-MM',
                            allowClear: false,
                            decoratorDate: (value, value2) => { return this.disabledDate(value, value2, "pre") }
                        },
                        next: {
                            type: 'DatePicker.MonthPicker',
                            mode: ['month', 'month'],
                            format: 'YYYY-MM',
                            allowClear: false,
                            decoratorDate: (value, value2) => { return this.disabledDate(value, value2, "next") }
                        }
                    }, {
                        name: 'accountCodeList',
                        label: '会计科目',
                        type: 'Select',
                        mode: 'multiple',                       
                        onMouseEnter: () => this.onFieldFocus(window.auxBalanceSumAccountList),
                        allowClear: true,
                        childType: 'Option',
                        filterOption: (inputValue, option) => { return this.filterAccountOption(inputValue, option) },
                        option: this.metaAction.gf('data.other.accountList').toJS()
                    }, {
                        name: 'accountDepth',
                        range: true,
                        label: '科目级次',
                        centerContent: '－',
                        pre: {
                            name: 'beginAccountGrade',
                            type: 'Select',
                            childType: 'Option',
                            option: startAccountDepthList,
                            allowClear: false
                        },
                        next: {
                            name: 'endAccountGrade',
                            type: 'Select',
                            childType: 'Option',
                            option: endAccountDepthList,
                            allowClear: false
                        }
                    }, {
                        name: 'assitform',
                        type: 'AssistForm',
                        assistFormOption: assistFormOption,
                        assistFormSelectValue: assistFormSelectValue
                    },
                    {
                        name: 'showZero',
                        label: '',
                        type: 'Checkbox.Group',
                        render: this.renderCheckBox,
                        allowClear: false
                    }
                ]
                break
            default:
                break
        }
        return [...auxSearchItem]
    }
    onFieldFocus = (sourceData = []) => {
        let targetData = this.metaAction.gf('data.other.accountList').toJS()
        if (targetData.length != sourceData.length) {
            this.injections.reduce('update', { path: 'data.other.accountList', value: fromJS(changeToOption(sourceData, 'codeAndName', 'code')) })
        }
    }
    filterAccountOption = (inputValue, option, code = 'value', name = 'label', datalist = 'data.other.accountList') => {
        if (option && option.props && option.props.value) {
            let accountingSubjects = fromJS(window.auxBalanceSumAccountList)
            let itemData = accountingSubjects.find(o => o.get('code') == option.props.value)
            let accountName = ''
            if (itemData.get('label') && itemData.get('code')) {
                accountName = itemData.get('label').replace(itemData.get('code'), '')
            }
            if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
                || (accountName.indexOf(inputValue) != -1)) {
                //将滚动条置顶
                let select = document.getElementsByClassName('ant-select-dropdown-menu')
                if (select.length > 0 && select[0].scrollTop > 0) {
                    select[0].scrollTop = 0
                }
                return true
            }
            else {
                return false
            }
        }
        return true
    }
    filterSingleAccountOption = (inputValue, option) => {
        return this.filterAccountOption(inputValue, option, 'code', 'name', 'data.other.sigleAccountList')
    }
    sigleAccountIsShow = () => {
        const accountSimpleStyle = this.metaAction.gf('data.other.accountSimpleStyle')
        return { display: accountSimpleStyle ? 'inline-block' : 'none' }
    }
    //渲染简单查询条件
    renderActiveSearch = () => {
        const { assistFormSelectValue, assistFormOption } = this.metaAction.gf('data.assistForm').toJS()
        // 找到排名靠前的并且选中的辅助项
        const one = assistFormOption.find(item => {
            return assistFormSelectValue.includes(item.key)
        })
        return <ActiveLabelSelect
            option={assistFormOption}
            selectLabel={one && one.key ? one.key : ''}
            value={''}
            onChange={this.activeLabelSelectChange}
        />
    }
    //获取凭证所在的最大期间座位默认日期
    getMaxDocPeriod = async () => {
        // const docVoucherDate = await this.webapi.balanceSumRpt.getDocVoucherDate()
        // const maxDocPeriod = docVoucherDate.year + '-' + `${docVoucherDate.period}`.padStart(2, '0')
        const res = await this.webapi.auxBalanceSumRpt.getDisplayDate()
        // console.log(maxDocPeriod)
        return res.DisplayDate
    }

    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.other.enabledDate')
        if (type == 'pre') {
            let currentMonth = this.transformDateToNum(current)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < enableddateMonth
        } else {
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            let enableddateMonth = this.transformDateToNum(enableddate)
            return currentMonth < pointTimeMonth || currentMonth < enableddateMonth
        }

    }
    transformDateToNum = (date) => {
        if (!date) {
            return 0
        }
        let time = date
        if (typeof date == 'string') {
            time = moment(new Date(date))
        }
        return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
    }

    // 简单搜索辅助项选择发生改变
    activeLabelSelectChange = (label, value) => {
        let { initOption } = this.metaAction.gf('data.assistForm').toJS()
        const init = JSON.parse(JSON.stringify(initOption))
        let assistFormSelectValue = []
        assistFormSelectValue.push(label)
        const index = initOption.findIndex(item => item.key == label)
        if (index != -1) {
            if (value) {
                initOption[index].value = [value]
            } else {
                initOption[index].value = []
            }

        }
        // this.injections.reduce('update', {
        //     path: 'data.assistForm',
        //     value: {
        //         initOption: init,
        //         assistFormOption: initOption,
        //         assistFormSelectValue: assistFormSelectValue
        //     }
        // })
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const showOption = this.metaAction.gf('data.showOption').toJS()
        searchValue.groupStr = label
        if (value) {
            searchValue.whereStr = `${label}:${value}`
        } else {
            searchValue.whereStr = ``
        }
        //更新查询条件辅助项是否显示
        this.injections.reduce('updateBathState', [
            {
                path: 'data.other.accountSimpleStyle',
                value: showOption.searchType == 0 ? false : true
            },
            {
                path: 'data.assistForm',
                value: {
                    initOption: init,
                    assistFormOption: initOption,
                    assistFormSelectValue: assistFormSelectValue
                }
            }
        ])
        this.searchValueChange(searchValue)
    }
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
            window.removeEventListener('enlargeClick', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onTabFocus', this.onTabFocus)
            window.detachEvent('enlargeClick', () => this.onResize({}))
        } else {
            window.onresize = undefined
        }
        window.auxBalanceSumAccountList = null
    }
    componentDidMount = () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start:moment(currentOrg.periodDate).startOf('month'),
            date_end:moment(currentOrg.periodDate).endOf('month')
        }
        this.renderTimeLine(data)
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    componentWillReceiveProps = ({ keydown }) => {
        if (keydown && keydown.event) {
            let e = keydown.event
            if (e.keyCode == 39 || e.keyCode == 40) {
                this.accountlistBtn('right')
            } else if (e.keyCode == 37 || e.keyCode == 38) {
                this.accountlistBtn('left')
            }
        }
    }

    // 高级搜索组件搜索条件发生变化
    searchValueChange = async (value, assitForm) => {
        const { accountList, startAccountDepthList, endAccountDepthList, sigleAccountList } = this.metaAction.gf('data.other').toJS()
        const arr = []
        arr.push(
            {
                path: 'data.searchValue',
                value: {
                    ...value
                }
            }
        )
        if (assitForm && assitForm.selectValue) {
            arr.push({
                path: 'data.assistForm.assistFormSelectValue',
                value: assitForm.selectValue
            }, {
                    path: 'data.assistForm.assistFormOption',
                    value: assitForm.option
                })
        }
        arr.push({
            path: 'data.other.accountList',
            value: accountList
        }, {
                path: 'data.other.startAccountDepthList',
                value: startAccountDepthList
            }, {
                path: 'data.other.endAccountDepthList',
                value: endAccountDepthList
            })
        if (value.accountCodeList && value.accountCodeList.length == 1) {
            this.injections.reduce('update', { path: 'data.other.sigleAccountCode', value: value.accountCodeList[0] })
        } else {
            this.injections.reduce('update', { path: 'data.other.sigleAccountCode', value: '0000' })
        }
        const searchType = this.metaAction.gf('data.showOption.searchType')
        if (searchType == 0) {
            if (value && value.showZero && value.showZero.length > 0) {
                _hmt && _hmt.push(['_trackEvent', '财务', '辅助科目余额表', '高级查询选择显示余额为0，发生额不为0的记录'])
            }
            _hmt && _hmt.push(['_trackEvent', '财务', '辅助科目余额表', '高级查询' + value.groupStr])

        } else {
            if (value && value.showZero && value.showZero.length > 0) {
                _hmt && _hmt.push(['_trackEvent', '财务', '科目辅助余额表', '高级查询选择显示余额为0，发生额不为0的记录'])
            }
            _hmt && _hmt.push(['_trackEvent', '财务', '科目辅助余额表', '高级查询' + value.groupStr])
        }
        this.injections.reduce('updateBathState', arr)
        this.sortParmas({ ...value })
        this.getAuxAccountList(value)
        this.metaAction.sf('data.other.currentTime', '')
    }

    // 科目简单搜索条件发生变化 点击左右按钮进行改变
    accountlistBtn = (type) => {
        //简单查询科目集合
        const accountlist = this.metaAction.gf('data.other.sigleAccountList').toJS()
        //当前选择科目对于的code
        const accountCode = this.metaAction.gf('data.other.sigleAccountCode')
        //查找在accountlist中存在并且选择了的对于科目
        let index = accountlist.findIndex(item => item.code == accountCode)
        let code
        switch (type) {
            case 'right':
                code = accountlist[index + 1] && accountlist[index + 1].code ? accountlist[index + 1].code : accountCode
                break
            case 'left':
                code = accountlist[index - 1] && accountlist[index - 1].code ? accountlist[index - 1].code : accountCode
                break
            default:
                code = accountCode
                break
        }
        this.accountlistChange(code)
    }
    //日期切换
    onPanelChange = (value) => {
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        //记录是否变更过日期
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.injections.reduce('updateBathState', [
            {
                path: 'data.searchValue',
                value: { ...searchValue, ...date }
            },
            {
                path: 'data.other.changeSipmleDate',
                value: true
            }
        ])
        this.sortParmas({ ...searchValue, ...date })
        this.metaAction.sf('data.other.currentTime', '')
    }
    //科目发生改变直接点击搜索项
    accountlistChange = (value) => {
        const accountlist = this.metaAction.gf('data.other.sigleAccountList').toJS()
        const item = accountlist.find(index => {
            return index.code == value
        })
        this.injections.reduce('updateBathState', [
            {
                path: 'data.other.sigleAccountCode',
                value: value
            },
            {
                path: 'data.searchValue.accountCodeList',
                value: value == '0000' ? [] : [value]
            }
        ])
        // this.injections.reduce('update', { path: 'data.other.sigleAccountCode', value: value })
        // this.injections.reduce('update', { path: 'data.searchValue.accountCodeList', value: value == '0000' ? [] : [value] })
        this.sortParmas()
    }

    //查询类型按钮切换-科目辅助余额表
    searchTypeRptChange = (key, value) => {
        //searchType=0 查询类型，0 为辅助科目余额表， 1 为科目辅助余额表
        const searchType = [
            { lable: "辅助科目余额表", value: 0 },
            { lable: "科目辅助余额表", value: 1 }
        ]
        let tmpRpt, currentValue
        for (let item of searchType) {
            if (item.lable != value) {
                tmpRpt = item

            }
            else {
                currentValue = item.value
            }
        }
        this.injections.reduce('updateBathState', [
            {
                path: 'data.showOption.searchType',
                value: currentValue 
            },
            {
                path: `data.showOption.${key}`,
                value: tmpRpt.lable
            },
            {
                path: 'data.other.accountSimpleStyle',
                value: currentValue == "0" ? false : true
            }
        ])
        //当前页面证实得查询类型
        // this.injections.reduce('showOptionsChange', {
        //     path: 'data.showOption.searchType',
        //     value: currentValue
        // })
        // //下个页面得标题
        // this.injections.reduce('showOptionsChange', {
        //     path: `data.showOption.${key}`,
        //     value: tmpRpt.lable
        // })
        //更新查询条件辅助项是否显示
        // this.injections.reduce('updateBathState', [
        //     {
        //         path: 'data.other.accountSimpleStyle',
        //         value: currentValue == "0" ? false : true
        //     }
        // ])
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.getAuxAccountList(searchValue)
        this.sortParmas()
    }

    //组装搜索条件
    sortParmas = async (search, type) => {
        //辅助余额表查询，
        //具体参数：* @apiParam {Number} beginYear 起始年份
        //  * @apiParam {Number} beginPeriod 起始期间
        //  * @apiParam {Number} endYear 结束年份
        //  * @apiParam {Number} endPeriod 结束期间
        //  * @apiParam {Array} accountCodeList 科目编码列表
        //  * @apiParam {Number} beginAccountGrade 起始科目级次
        //  * @apiParam {Number} endAccountGrade 结束科目级次
        //  * @apiParam {Array} auxInfo 辅助核算信息
        //  *                   示例 ["departmentId:1,2", "personId:1,2", "customerId:1,2", "supplierId:1,2", "inventoryId:1,2", "projectId:1,2", "bankAccountId:1,2"]
        //  *                   分别对应部门、人员、客户、供应商、存货、项目、银行账号
        //  *                   如果勾选对应辅助核算，则数组中传入对应字符串"xxId:"，如果选择了辅助核算进行过滤，同时把 id （以,分隔）传入
        //  * @apiParam {Boolean} showZero=true 余额为 0 是否显示
        //  * @apiParam {Number} searchType=0 查询类型，0 为辅助科目余额表， 1 为科目辅助余额表
        //  * @apiParam {Boolean} includeSum=true 查询结果是否包含小计
        // 处理搜索参数

        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        const changeData = {
            'date_start': {
                'beginYear': (data) => data ? data.format('YYYY') : null,
                'beginPeriod': (data) => data ? data.format('MM') : null,
            },
            'date_end': {
                'endYear': (data) => data ? data.format('YYYY') : null,
                'endPeriod': (data) => data ? data.format('MM') : null,
            }
        }

        const searchValue = sortSearchOption(search, changeData)
        //获取辅助项
        searchValue.auxInfo = this.getAux(search)
        searchValue.showZero = searchValue.showZero && searchValue.showZero.length > 0 ? 'true' : 'false'
        const searchType = this.metaAction.gf('data.showOption.searchType')
        searchValue.printType = searchType == '0' ? 4 : searchType
        const sigleAccountCode = this.metaAction.gf('data.other.sigleAccountCode')
        if (searchType == '1' && sigleAccountCode != '0000') {
            searchValue.sigleAccountCode = sigleAccountCode
            searchValue.accountCodeList = []
        }

        searchValue.searchType = searchType
        searchValue.isIncludeAllTotal = this.metaAction.gf('data.showOption.isIncludeAllTotal')
        searchValue.includeSum = this.metaAction.gf('data.showOption.includeSum')

        if (type == 'get') {
            return { ...searchValue }
        }
        this.requestData({ ...searchValue }).then((res) => {
            const searchType = this.metaAction.gf('data.showOption.searchType')
            const sigleAccountCode = this.metaAction.gf('data.other.sigleAccountCode')
            let details = null
            // if (searchType == 1 && sigleAccountCode != '0000' && res && res.details) {
                //todo 此处代码特殊处理，科目辅助余额表选择对应科目后，返回的小计多一行数据，前台特殊处理
            if (res.auxType && res.auxType.length > 2) {
                const startIndex = res.details.findIndex(item => item.accountName == '小计')
                if (startIndex != -1) {
                    res.details.splice(startIndex, 1)
                }
            }
            // this.injections.reduce('load', res.details)
            // } else {
            //     this.injections.reduce('load', res && res.details ? res.details : [])
            // }
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.style',
                    value: this.getRowStyle(res && res.style ? res.style : ''),
                },
                {
                    path: 'data.list',
                    value: res && res.details ? res.details : []
                }
            ])
            // this.injections.reduce('update', {
            //     path: 'data.style',
            //     value: this.getRowStyle(res && res.style ? res.style : ''),
            // })
            setTimeout(() => {
                this.onResize()
            }, 20)
        })
    }
    //获取辅助项
    getAux = (searchValue) => {
        let aux = []
        const groupStr = searchValue.groupStr && searchValue.groupStr.split(',')
        const whereStr = searchValue.whereStr && searchValue.whereStr.split(';')
        if (groupStr) {
            groupStr.forEach(item => {
                if (!whereStr) {
                    aux.push(`${item}:`)
                } else {
                    const tmpStr = whereStr.find(x => x.indexOf(item) > -1)
                    if (tmpStr) {
                        aux.push(`${item}`)
                    } else {
                        aux.push(`${item}:`)
                    }
                }
            })
        }
        return aux
    }
    // 发送请求
    requestData = async (params) => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        //清理无用属性
        delete params.groupStr
        delete params.whereStr
        const response = await this.webapi.auxBalanceSumRpt.queryRptList(params)
        this.injections.reduce('tableLoading', false)
        return response
    }

    getAuxAccountList = async (params) => {
        const searchType = this.metaAction.gf('data.showOption.searchType')
        if (searchType == 1) {
            let result = []
            const res = await this.webapi.auxBalanceSumRpt.queryAccountList({
                isCalc: true
            })

            let initAccountArray = [{ code: '0000', codeAndName: '所有科目' }]
            if (!res || !res.glAccounts) {
                
                this.injections.reduce('updateBathState', [
                    {
                        path: 'data.other.sigleAccountList',
                        value: initAccountArray
                    },
                    {
                        path: 'data.searchValue.accountCodeList',
                        value: []
                    }
                ])
                // this.injections.reduce('update', [
                //     {
                //         path: 'data.searchValue.accountCodeList',
                //         value: []
                //     }])
            } else {
                result = [...initAccountArray, ...res.glAccounts]
                this.injections.reduce('updateBathState', [
                    {
                        path: 'data.other.sigleAccountList',
                        value: result
                    }])
                window.auxBalanceSumAccountList = res.glAccounts
                // this.injections.reduce('update', { path: 'data.other.accountList', value: fromJS(changeToOption(res.glAccounts, 'codeAndName', 'code')) })
            }
        }
    }

    // 点击刷新按钮
    refreshBtnClick = () => {
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        this.getAuxAccountList(searchValue)
        this.sortParmas()
    }

    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }
    //简单查询日期改变搜索
    normalSearchChange = (path, value) => {
        if (path == 'date') {
            let date = {
                date_end: value[1],
                date_start: value[0]
            }
            //记录是否变更过日期
            // this.metaAction.sf('data.other.changeSipmleDate', true)
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.other.changeSipmleDate',
                    value: true
                },
                {
                    path: 'data.searchValue',
                    value: { ...searchValue, ...date }
                }
            ])
            // this.injections.reduce('searchUpdate', { ...searchValue, ...date })
            this.getAuxAccountList(searchValue)
        }
    }
    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date, query: data.query }
    }

    shareClick = (e) => {
        switch (e.key) {
            case 'weixinShare':
                this.weixinShare()
                break;
            case 'mailShare':
                this.mailShare()
                break;
        }
    }

    weixinShare = async () => {

        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, 'get')
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/balanceauxrpt/share',
                params: data
            })
        })
        const searchType = this.metaAction.gf('data.showOption.searchType')
        if (searchType == 0) {
            _hmt && _hmt.push(['_trackEvent', '财务', '辅助科目余额表', '分享微信/QQ'])
        } else {
            _hmt && _hmt.push(['_trackEvent', '财务', '科目辅助余额表', '分享微信/QQ'])
        }
    }

    mailShare = async () => {
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let data = await this.sortParmas(null, 'get')
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: data,
                shareUrl: '/v1/gl/report/balanceauxrpt/share',
                mailShareUrl: '/v1/gl/report/balanceauxrpt/sendShareMail',
                printShareUrl: '/v1/gl/report/balanceauxrpt/print',
                period: `${data.beginYear}.${data.beginPeriod}-${data.endYear}.${data.endPeriod}`
            })
        })
        const searchType = this.metaAction.gf('data.showOption.searchType')
        if (searchType == 0) {
            _hmt && _hmt.push(['_trackEvent', '财务', '辅助科目余额表', '邮件分享'])
        } else {
            _hmt && _hmt.push(['_trackEvent', '财务', '科目辅助余额表', '邮件分享'])
        }
    }

    //导出
    export = async () => {
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        const parmas = await this.sortParmas(null, 'get')
        await this.webapi.auxBalanceSumRpt.export(parmas)

    }
    //打印
    print = async () => {
        
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        let tempWindow = window.open()
        const parmas = await this.sortParmas(null, 'get')
        parmas.tempWindow = tempWindow
        await this.webapi.auxBalanceSumRpt.print(parmas)
    }
    //小计
    showOptionsChange = (key, value) => {
        this.injections.reduce('showOptionsChange', {
            path: `data.showOption.${key}`,
            value: value
        })
        const searchType = this.metaAction.gf('data.showOption.searchType')
        if (searchType == 0) {
            _hmt && _hmt.push(['_trackEvent', '财务', '辅助科目余额表', '显示小计'])
        } else {
            _hmt && _hmt.push(['_trackEvent', '财务', '科目辅助余额表', '显示小计'])
        }
        this.sortParmas()
    }

    getRowStyle = (data) => {
        let result = {}
        const arr = data.split(';')
        arr.forEach(item => {
            if (!item) {
                return
            }
            const str = item.replace(/\]\[/g, '\];\[')
            let [key, valueArr] = str.split(':')
            if (!result[key]) {
                result[key] = {}
            }
            const arr2 = valueArr.split(';')
            arr2.forEach(x => {
                const y = JSON.parse(x)
                result[key][y[0]] = y[1] - y[0] + 1
            })
        })
        return result
    }
    checkRowSpan = (index, data) => {
        let num = 1
        if (!data) {
            return num
        }
        for (const [key, value] of Object.entries(data)) {
            if (index > parseInt(key) && index <= key + value) {
                num = 0
            }
        }
        return num
    }
    renderRowSpan = (text, row, index, key, colNum = 1, isdisplay = false) => {
        let rowNum = 1
        if (this.metaAction.gf('data.style')) {
            const style = this.metaAction.gf('data.style').toJS()

            if (style[key] && style[key][index]) {
                rowNum = style[key][index]
            } else if (style[key]) {
                rowNum = this.checkRowSpan(index, style[key])
            }
        }
        let obj = {
            children: <span title={text}>{text}</span>,
            props: {
                rowSpan: rowNum,
                colSpan: 1
            }
        }
        if (row && row.accountName == '合计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
            obj.props.colSpan = colNum
        }
        if (row && row.accountName == '小计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
            obj.props.colSpan = colNum
        }
        if (isdisplay && row && row.accountName == '小计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
        }
        return obj
    }
    renderColSpan = (text, row, index, num, isdisplay) => {
        const obj = {
            children: <span title={text}>{text}</span>,
            props: { colSpan: 1 },
        }
        if (row && row.accountName == '合计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
            obj.props.colSpan = num
        }
        if (row && row.accountName == '小计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
            obj.props.colSpan = num
        }
        if (isdisplay && row && row.accountName == '小计') {
            obj.children = <span title={row.accountName}>{row.accountName}</span>
        }
        return obj
    }
    rowShowTitle = (text, row, index) => {
        let obj = {
            children: <span title={text}>{text}</span>
        }
        return obj
    }

    //表格列处理
    tableColumns = () => {
        const [accountColumns, baseColumns] = renderColumns(this.rowShowTitle)
        let auxColumns = []
        const searchType = this.metaAction.gf('data.showOption.searchType')
        const includeSum = this.metaAction.gf('data.showOption.includeSum')
        const sigleAccountCode = this.metaAction.gf('data.other.sigleAccountCode')
        const { assistFormOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm').toJS()
        assistFormOption.forEach(item => {
            if (assistFormSelectValue.includes(item.key)) {
                if (item.key.includes('isExCalc')) {
                    let keyStr = item.key ? `e${item.key.slice(3)}Name` : item.key
                    auxColumns.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: keyStr,
                        dataIndex: keyStr,
                        key: keyStr,
                        width: '20%'
                    })
                } else {
                    auxColumns.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        dataIndex: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        key: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        width: '20%'
                    })
                }
            }
        })
        // searchType = 0 查询类型，0 为辅助科目余额表， 1 为科目辅助余额表
        if (searchType == 0) {
            if (accountColumns && auxColumns && auxColumns.length > 0) {
                accountColumns.forEach(element => {
                    element.render = (text, record, index) => this.renderColSpan(text, record, index, 0)
                })
                auxColumns.forEach(item => {
                    let auxId
                    if (item.key.includes('exCalc')) {
                        auxId = `isE${item.key.replace(/Name/, '').slice(1)}`
                    } else {
                        auxId = item.key.replace(/Name/, 'Id')
                    }
                    item.render = (text, record, index) => this.renderRowSpan(text, record, index, auxId, 0)
                })
                const num = auxColumns.length + 2
                let fisrtAuxId
                if (auxColumns[0].key.includes('exCalc')) {
                    fisrtAuxId = `isE${auxColumns[0].key.replace(/Name/, '').slice(1)}`
                } else {
                    fisrtAuxId = auxColumns[0].key.replace(/Name/, 'Id')
                }
                auxColumns[0].render = (text, record, index) => this.renderRowSpan(text, record, index, fisrtAuxId, num)
            }
            return [...auxColumns, ...accountColumns, ...baseColumns]
        }
        //科目辅助余额表
        if (searchType == 1 && sigleAccountCode == '0000') {
            if (accountColumns && auxColumns && auxColumns.length > 0) {
                if (includeSum) {
                    accountColumns.forEach(item => {
                        item.render = (text, record, index) => this.renderRowSpan(text, record, index, 'accountId', 0)
                    })
                    auxColumns.forEach(item => {
                        let auxId
                        if (item.key.includes('exCalc')) {
                            auxId = `isE${item.key.replace(/Name/, '').slice(1)}`
                        } else {
                            auxId = item.key.replace(/Name/, 'Id')
                        }
                        item.render = (text, record, index) => this.renderRowSpan(text, record, index, auxId, 0)
                    })
                    const num = auxColumns.length + 2
                    accountColumns[0].render = (text, record, index) => this.renderRowSpan(text, record, index, 'accountId', num)
                } else {
                    accountColumns.forEach(item => {
                        item.render = (text, record, index) => this.renderColSpan(text, record, index, 0)
                    })
                    auxColumns.forEach(item => {
                        item.render = (text, record, index) => this.renderColSpan(text, record, index, 0)
                    })
                    const num = auxColumns.length + 2
                    accountColumns[0].render = (text, record, index) => this.renderColSpan(text, record, index, num)
                }

            }
            return [...accountColumns, ...auxColumns, ...baseColumns]
        } else {
            if (auxColumns && auxColumns.length > 1) {
                auxColumns.forEach(item => {
                    item.render = (text, record, index) => this.renderColSpan(text, record, index, 0)
                })
                let fisrtAuxId
                if (auxColumns[0].key.includes('exCalc')) {
                    fisrtAuxId = `isE${auxColumns[0].key.replace(/Name/, '').slice(1)}`
                } else {
                    fisrtAuxId = auxColumns[0].key.replace(/Name/, 'Id')
                }
                const num = auxColumns.length
                auxColumns[0].render = (text, record, index) => this.renderRowSpan(text, record, index, fisrtAuxId, num, true)
            } else {
                auxColumns.forEach(item => {
                    item.render = (text, record, index) => this.renderColSpan(text, record, index, 1, true)
                })
            }
            return [...auxColumns, ...baseColumns]
        }

    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('app-auxbalancesum-rpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
            }
        }, 20)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 200)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if (bodyHeight > y && y != pre.y) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {

        }
    }

    handleTimeLineItem = async(time,disabled) => {
        // this.metaAction.sf('data.other.currentTime', time)
        if(disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)
        // this.metaAction.sfs({
        //     'data.other.currentTime': time,
        //     'data.searchValue.date_end' : now,
        //     'data.searchValue.date_start' : now
        // })

        let date = {
            date_end: moment(`${year}-${month}`),
            date_start: moment(`${year}-${month}`)
        }
        //记录是否变更过日期
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // this.injections.reduce('searchUpdate', { ...searchValue, ...date })
        this.sortParmas({ ...searchValue, ...date })
        this.metaAction.sfs({
            'data.other.currentTime': time,
            'data.searchValue.date_end' : now,
            'data.searchValue.date_start' : now
        })
    }

    renderTimeLineVisible = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return false
        return true
    }

    renderTimeLine = (parmasData) => {
        const data = parmasData || this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')
        const currentOrg = this.metaAction.context.get("currentOrg")
        let enabledDate = `${currentOrg.enabledYear}${currentOrg.enabledMonth}`

        let diffMonth = moment(endDate).diff(moment(startDate),'month')
        if (diffMonth > 36) return
        
        let initCurrentTime = currentOrg.periodDate.replace(/-/g,'')
        let currentTime = parmasData ? initCurrentTime : this.metaAction.gf('data.other.currentTime') 

        // 初始时间和结束时间在同年同月
        let timeArr = []
        if(startDate == endDate) {
            let year = moment(startDate).format('YYYY')
            let list = [+year-1, +year, +year+1]

             if (parmasData || !currentTime) {
                list.forEach(item => {
                    for(let i=0; i<12;i++){
                        let num = i<9 ? '0'+(i+1) : String(i+1)
                        timeArr.push(item+num)
                    }
                })
                this.timeLineYearList = timeArr
            } else {
                timeArr = this.timeLineYearList
            }
        } else {

            let beforeDate = moment(moment(startDate).subtract(Math.floor((36-diffMonth)/2), 'month')).format('YYYY-MM')
            let afterDate = moment(moment(endDate).add(Math.ceil((36-diffMonth)/2), 'month')).format('YYYY-MM')

            for(let i=0; i<36;i++){
                let time = moment(beforeDate).add(i+1, 'month').format('YYYY-MM')
                time = time.replace(/-/g, '')
                timeArr.push(time) 
            }
            this.timeLineYearList = timeArr
        }

        // let currentTime = this.metaAction.gf('data.other.currentTime')
        
        if(parmasData || !currentTime){
            clearTimeout(this.renderTime)
            this.renderTime = setTimeout(() => {
                try {
                    var height = 0;
                    var domList = document.getElementsByClassName('ant-timeline-item')
                    let yearNum = 0
                    timeArr.forEach(item => {
                        if(item < endDateYear) {
                            let month = item.slice(4)
                            if (Number(month) == 1) {
                                yearNum+=1
                            }
                        }
                    })
                    
                    for (let i in domList) {
                        if (i < (timeArr.indexOf(endDateYear) + 1 + yearNum)) {
                            height += domList[i].offsetHeight
                        }
                    }
                    document.querySelector('.app-auxbalancesum-rpt-body-left').scrollTop = height - document.querySelector('.app-auxbalancesum-rpt-body-left').offsetHeight / 2
                } catch (e) {
    
                }
            }, 10) 
        }

        return <div className='TimeWrap'><div className='TimelineDiv'>
            <Timeline className='Timeline'>
                <div className='ant-timeline-item line'></div>
                {
                    timeArr.map(item => {
                        let month = item.slice(4)
                        let year = item.slice(0, 4)
                        let title = `${year}-${month}`

                        // let isTrue = currentTime ? currentTime == item ? true : false: item == endDateYear
                        let isTrue = currentTime ? currentTime == item ? true : false: startDate == endDate && item == endDateYear
                        
                        // let color = currentTime ?
                        // item < currentTime ? '#FF913A': '#0066B3' : 
                        // startDate == endDate ? 
                        // item < endDateYear ? '#FF913A': '#0066B3' :'#0066B3'

                        let timePeriod = this.metaAction.gf('data.other.timePeriod').toJS()
                        let {minDataPeriod, maxDataPeriod} = timePeriod
                        // let disabled = (!minDataPeriod && !maxDataPeriod) || (Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod))
                        let disabled = Number(item) < Number(enabledDate) 

                        let color = '#666'
                        if (minDataPeriod && maxDataPeriod) {
                            if(Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod)) {
                                if(disabled) {
                                    color = '#D9D9D9' 
                                } else {
                                    color = '#666'
                                }
                            } else {
                                color = '#0066B3'
                            }
                        }

                        let dot = isTrue? 
                        <div className='nodeDiv'>{title}</div> : 
                        item == enabledDate ? <Icon 
                        type="qiyongriqi" 
                        fontFamily='edficon'
                        style={{fontSize : '16px', zIndex: 222}} 
                        title='启用日期'/> : null

                        if (Number(month) == 1) {
                            return [<Timeline.Item
                                className='ant-timeline-item ant-timelineItemYear'
                                dot={<div className={disabled ? 'yearLabelDis':'yearLabel'}><span>{year}</span><Icon type='arrow-down'/></div>}
                            ></Timeline.Item>,
                            <Timeline.Item
                                className={ disabled ? 'ant-timelineItemDis': isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled':''}
                                dot={dot}
                                color={ disabled ? '#D9D9D9': color}
                                onClick={() => this.handleTimeLineItem(item,disabled)}
                            ><span title={title}>{isTrue? '' : month}</span></Timeline.Item>]
                        }

                        return <Timeline.Item
                            className={ disabled ? 'ant-timelineItemDis': isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled':''}
                            dot={dot}
                            color={ disabled ? '#D9D9D9': color}
                            onClick={()=>this.handleTimeLineItem(item,disabled)}
                        ><span title={title}>{isTrue? '' : month}</span></Timeline.Item>
                    })
                }
                <div></div>
            </Timeline>
        </div></div>
    }

    moreActionOpeate = async () => {
        this.setupClick()
    }

    setupClick = async () => {
        return
        let _this = this
        LoadingMask.show()
        const {
            height,
            printTime,
            landscape,
            type,
            width,
            leftPadding,
            rightPadding,
            topPadding,
            bottomPadding,
            contentFontSize,
            isPrintCover,
            samePage
        } = await this.webapi.auxBalanceSumRpt.getPrintConfig()
        LoadingMask.hide()        
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-auxbalancesum-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                landscape={landscape}
                type={type}
                width={width}
                samePage = {samePage}
                topPadding = {topPadding}
                bottomPadding = {bottomPadding}
                contentFontSize = {contentFontSize}
                isPrintCover = {isPrintCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                callBack={_this.submitPrint}
                from = 'auxbalancesum'
            />
        })
    }

    submitPrint = async (form) => {
        let res = await this.webapi.auxBalanceSumRpt.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')            
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
