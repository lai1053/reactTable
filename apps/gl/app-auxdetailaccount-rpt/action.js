import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import config from './config'
import { TableOperate, Select, Button, Modal, Checkbox, ActiveLabelSelect, Timeline, Icon } from 'edf-component'
// import sortSearchOption from './utils/sortSearchOption'
import moment from 'moment'
import utils from 'edf-utils'
import { FormDecorator } from 'edf-component'
import changeToOption from './utils/changeToOption'
import PrintOption2 from './components/PrintAllComponent'
const Option = Select.Option
import { consts } from 'edf-consts'
import renderColumns from './utils/renderColumns'
import { LoadingMask } from 'edf-component'
import sortBaseArchives from './utils/sortBaseArchives'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
        this.selectedOption = []
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf('month'),
            date_end: moment(currentOrg.periodDate).endOf('month')
        }
        injections.reduce('init', data)
        this.load(null, this.component.props.linkInSearchValue)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
    }

    componentDidMount = () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        let data = {
            date_start: moment(currentOrg.periodDate).startOf('month'),
            date_end: moment(currentOrg.periodDate).endOf('month')
        }
        this.renderTimeLine(data)
        this.onResize()
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
    }

    onTabFocus = async (params) => {
        const data = this.metaAction.gf('data.assistForm.assistFormOption') && this.metaAction.gf('data.assistForm.assistFormOption').toJS()
        params = params.toJS()
        const fromLoad = this.metaAction.gf('data.other.fromLoad')
        const searChValue = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        if (fromLoad == 'highSearchClick') {
            //高级查询
            delete searChValue.accountCode
        } else {
            delete searChValue.accountCodeList
            delete searChValue.beginAccountGrade
            delete searChValue.endAccountGrade
        }
        const pagination = this.metaAction.gf('data.pagination') && this.metaAction.gf('data.pagination').toJS()
        // if (params.accessType == 0) {
        //     this.sortParmas({ ...searChValue }, pagination)
        // } else {
        //     this.load(true, params.linkInSearchValue, params.linkInAccountName)
        // }
        if(searChValue.accountCode&&params.accessType == 0){
            this.sortParmas({ ...searChValue }, pagination)
        } else {
            if(params.accessType == 1){
                params.linkInSearchValue.accountCode=''
                this.load(true, params.linkInSearchValue, params.linkInAccountName)
            }else{
                this.load(true, '', params.linkInAccountName)
            }
            
        }
        const res = await this.webapi.person.getExistsDataScope()
        this.metaAction.sfs({
            'data.other.currentTime': '',
            'data.other.timePeriod': fromJS(res || {})
        })
        // this.metaAction.sf('data.other.currentTime', '')
    }

    load = async (formTab, initSearchValue) => {
        let pageParam = {
            moduleKey: 'app-auxdetailaccount-rpt',
            resourceKey: 'app-auxdetailaccount-rpt-table',
        }

        let list = [
            this.webapi.person.getPageSetting(pageParam),
            this.webapi.person.getExistsDataScope()
        ]
        const result = await Promise.all(list)

        if (result) {
            let response = result[0]
            let page = this.metaAction.gf('data.pagination').toJS()
            if (response.pageSize) {
                page.pageSize = response.pageSize
            }
            let timePeriod = result[1] || {}
            this.metaAction.sfs({
                'data.pagination': fromJS(page),
                'data.other.timePeriod': fromJS(timePeriod)
            })
        }

        await this.getEnableDate(formTab)
        const res = await this.webapi.person.queryBaseArchives()
        const accountDepthList = await this.webapi.person.queryAccountDepth()
        const currencyListRes = await this.webapi.person.queryForCurrency(
            { isContainComprehensiveCurrency: true, isAllCurrency: false }
        )
        this.metaAction.sf('data.other.currencylist', fromJS(changeToOption(currencyListRes, 'name', 'id')))
        this.injections.reduce('initOption', accountDepthList)
        this.injections.reduce('tableLoading', false)
        const group = sortBaseArchives(res)
        if (formTab) {
            this.updateBaseArchives(group)
        } else {
            this.initBaseArchives(group, formTab)
        }
        if (initSearchValue) {
            this.initSearchValue(initSearchValue)
        }
        // const prevValue=this.metaAction.gf('data.searchValue').toJS()

        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        // 
        const assistFormSelectValue = this.metaAction.gf('data.assistForm.assistFormSelectValue') && this.metaAction.gf('data.assistForm.assistFormSelectValue').toJS()
        const whereStr = searchValue.whereStr || ''
        const groupStr = searchValue.groupStr || assistFormSelectValue.join(',')
        await this.searchValueChange({
            ...searchValue,
            groupStr: groupStr,
            whereStr: whereStr
        }, null, initSearchValue ? initSearchValue.accountCode : null, true)
       
        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    filterAccountOption1 = (inputValue, option) => {
        if (option && option.props && option.props.value) {
            let accountingSubjects = this.metaAction.gf('data.other.accountlist')
            let itemData = accountingSubjects.find(o => o.get('code') == option.props.value)
            let accountName = ''

            if (itemData.get('codeAndName') && itemData.get('code')) {
                accountName = itemData.get('codeAndName').replace(itemData.get('code'), '')
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

    // 支持联查传递参数。
    initSearchValue = (searChValue) => {
        const { accountCode, date_end, date_start, assitForm } = searChValue
        const { assistFormOption, initOption } = this.metaAction.gf('data.assistForm') && this.metaAction.gf('data.assistForm').toJS()
        const assistFormSelectValue = []
        let whereStrArr = []

        for (let [key, value] of Object.entries(assitForm)) {
            // 判断带过来的值数据中是否存在
            if (typeof (value) != 'object') {
                const findOne = assistFormOption.find(item => item.key == key)

                if (findOne) {
                    const flag = findOne.children.find(item => item.value == value)
                    if (!flag) {
                        value = null
                    }
                }
            }
            assistFormSelectValue.push(key)
            if (value) {
                if (typeof (value) == 'object' && value.length > 0) {
                    whereStrArr.push(`${key}:${value}`)
                } else if (typeof (value) != 'object') {
                    whereStrArr.push(`${key}:${value}`)
                }
            }
            assistFormOption.forEach((item, index) => {
                if (item.key == key) {
                    assistFormOption[index].value = typeof (value) == 'object' ? value : [`${value}`]
                }
            })
        }
        const whereStr = whereStrArr.join(';')

        this.injections.reduce('updateArr', [
            {
                path: 'data.searchValue',
                value: {
                    accountCode,
                    date_end,
                    date_start,
                    whereStr
                }
            },
            {
                path: 'data.assistForm.assistFormSelectValue',
                value: assistFormSelectValue
            },
            {
                path: 'data.assistForm.assistFormOption',
                value: assistFormOption
            }
        ])
    }

    updateBaseArchives = (data) => {
        const { assistFormOption, initOption, assistFormSelectValue, activeValue } = this.metaAction.gf('data.assistForm') && this.metaAction.gf('data.assistForm').toJS()
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
        arrAssitForm.sort((a, b) => {
            let a1 = assistFormOption.findIndex(index => a.key == index.key)
            let b1 = assistFormOption.findIndex(index => b.key == index.key)
            if (a1 == -1) {
                a1 = 1000
            }
            if (b1 == -1) {
                b1 = 1000
            }
            return a1 > b1
        })
        const arrAssitFormSelectValue = []

        assistFormSelectValue.forEach(item => {
            const flag = data.find(index => index.key == item)

            if (flag) {
                arrAssitFormSelectValue.push(item)
            }
        })
        if(assistFormOption&&assistFormSelectValue){
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
        }else{
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: data
                }, {
                    path: 'data.assistForm.assistFormOption',
                    value: arrAssitForm
                }, {
                    path: 'data.assistForm.assistFormSelectValue',
                    value: assistFormSelectValue
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
        }

    }

    initBaseArchives = (data) => {
        this.injections.reduce('updateArr', [
            {
                path: 'data.assistForm.initOption',
                value: data
            }, {
                path: 'data.assistForm.assistFormOption',
                value: data
            }, {
                path: 'data.assistForm.assistFormSelectValue',
                value: ['customerId']
            }, {
                path: 'data.assistForm.activeValue',
                value: ''
            }
        ])
    }
    filterAccountOption = (inputValue, option, code = 'value', name = 'label', datalist = 'data.other.auxAccountList') => {
        if (option && option.props && option.props.value) {
            let accountingSubjects = this.metaAction.gf(datalist)
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
    // searchCardDidMount = (target) => {
    //     this.searchCardDet = target
    // }
    getSearchCard = (childrenRef) => {
        this.searchCardDet = childrenRef
    }
    clearValueChange = async(value) => {
        const searchValue = this.metaAction.gf('data.searchValue') && this.metaAction.gf('data.searchValue').toJS()
        const other = this.metaAction.gf('data.other').toJS()
        console.log(searchValue, other)
        const res = await this.webapi.person.queryBaseArchives()
        const group = sortBaseArchives(res)
        this.initBaseArchives(group)
        this.metaAction.sfs({
            'data.searchValue.date_start': other.init_date_start,
            'data.searchValue.date_end': other.init_date_end,
            'data.searchValue.groupStr': 'customerId',
            'data.searchValue.whereStr': '',
            'data.searchValue.beginAccountGrade': 1,
            'data.searchValue.endAccountGrade': 5,
            'data.searchValue.accountCodeList': [],            
        })

    }
    setSearchField = (array) => {
        let accountCodeList = this.searchCardDet.form.getFieldValue('accountCodeList')
        if (array && array.length == 1) {
            //勾选末级科目置灰科目级次
            this.injections.reduce('showOptionsChange', {
                path: 'data.other.gradeStyleStatus',
                value: true
            })
        } else {
            this.injections.reduce('showOptionsChange', {
                path: 'data.other.gradeStyleStatus',
                value: false
            })
        }
        this.metaAction.sf('data.searchValue.onlyShowEndAccount', fromJS(array))
        setTimeout(() => {
            this.searchCardDet.form.setFieldsValue({ 'accountCodeList': accountCodeList })
            this.searchCardDet.form.setFieldsValue({ 'beginAccountGrade': '1' })
            this.searchCardDet.form.setFieldsValue({ 'endAccountGrade': '5' })
        }, 10)
    }
    renderCheckBox1 = () => {
        return (
            <Checkbox.Group className="app-proof-of-list-accountQuery-search-checkbox" onChange={this.setSearchField}>
                <Checkbox value="1" >仅显示末级科目</Checkbox>
            </Checkbox.Group>
        )
    }
    renderActiveSearch = () => {
        let { assistFormSelectValue, assistFormOption, activeValue } = this.metaAction.gf('data.assistForm') && this.metaAction.gf('data.assistForm').toJS()
        let fromLoad = this.metaAction.gf('data.other.fromLoad')
        let one
        one = assistFormOption.find(item => {
            return assistFormSelectValue.includes(item.key)
        })

        return <ActiveLabelSelect
            option={assistFormOption}
            selectLabel={one && one.key ? one.key : ''}
            value={activeValue}
            onChange={this.activeLabelSelectChange}
        />
    }

    getEnableDate = async (formTab) => {
        const { DisplayDate, EnableDate } = await this.webapi.person.getDisplayDate()
        let { date_end, date_start } = this.metaAction.gf('data.searchValue').toJS()
        const momentEnableDate = utils.date.transformMomentDate(EnableDate)
        let date_start2 = utils.date.transformMomentDate(DisplayDate)
        let date_end2 = utils.date.transformMomentDate(DisplayDate)
        this.injections.reduce('updateArr', [{
            path: 'data.other.enableddate',
            value: utils.date.transformMomentDate(EnableDate)
        }, {
            path: 'data.searchValue.date_end',
            value: !date_end ? date_end2 : this.transformDateToNum(date_end) >= this.transformDateToNum(momentEnableDate) ? date_end : date_end2
        }, {
            path: 'data.searchValue.date_start',
            value: !date_start ? date_start2 : this.transformDateToNum(date_start) >= this.transformDateToNum(momentEnableDate) ? date_start : date_start2
        },
        {
            path: 'data.other.init_date_end',
            value: !date_end ? date_end2 : this.transformDateToNum(date_end) >= this.transformDateToNum(momentEnableDate) ? date_end : date_end2
        }, {
            path: 'data.other.init_date_start',
            value: !date_start ? date_start2 : this.transformDateToNum(date_start) >= this.transformDateToNum(momentEnableDate) ? date_start : date_start2
        }
        ])

        return
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

    // 简单搜索条件发生变化仅限时间
    normalSearchChange = (path, value) => {
        if (path == 'date') {
            this.onPanelChange(value)
        }
    }

    // 简单搜索辅助项选择发生改变
    activeLabelSelectChange = async (label, value) => {
        let { initOption, assistFormOption } = this.metaAction.gf('data.assistForm') && this.metaAction.gf('data.assistForm').toJS()
        // 保持原来的顺序不变
        let sortInitOption = assistFormOption.map(item => {
            return initOption.find(index => index.key == item.key)
        })
        const init = JSON.parse(JSON.stringify(initOption))
        let assistFormSelectValue = []
        // this.searchCardDet.form.setFieldsValue({'accountCodeList': undefined})
        assistFormSelectValue.push(label)
        const index = initOption.findIndex(item => item.key == label)
        if (index != -1) {
            if (value) {
                initOption[index].value = [value]
            } else {
                initOption[index].value = []
            }
        }
        this.injections.reduce('update', {
            path: 'data.assistForm',
            value: {
                initOption: init,
                assistFormOption: sortInitOption,
                assistFormSelectValue: assistFormSelectValue,
                activeValue: value
            }
        })

        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.groupStr = label
        if (value) {
            searchValue.whereStr = `${label}:${value}`
        } else {
            searchValue.whereStr = ``
        }
        this.metaAction.sf('data.other.fromLoad', 'simpleSearch')
        await this.searchValueChange(searchValue, null, null, 'simpleSearch')
    }

    // 高级搜索组件搜索条件发生变化 和辅助总账不同 改账目在请求科目的时候可以将列表信息统一带回来
    searchValueChange = async (value, assitForm, preAccountCode, fromLoad) => {
        let { accountCode, needRepeatSend ,falg} = await this.getAccountList(value, preAccountCode, fromLoad)
        const arr = [],
            pages = this.metaAction.gf('data.pagination').toJS()

        this.injections.reduce('updateSearchValue', {
            ...value,
            accountCode
        })
        if (assitForm && assitForm.selectValue) {
            arr.push({
                path: 'data.assistForm.assistFormSelectValue',
                value: assitForm.selectValue
            }, {
                path: 'data.assistForm.assistFormOption',
                value: assitForm.option
            }, {
                path: 'data.assistForm.activeValue',
                value: ''
            })
        }
        this.injections.reduce('updateArr', arr)
        const accountList = this.metaAction.gf('data.other.accountlist').toJS()
        const item = accountList.find(item => {
            return item.code == accountCode
        })
        if (fromLoad && fromLoad.currentPath == 'root.children.accountQuery.searchClick') {
            params.accountCode = undefined
            params.whereStr = ''
            this.metaAction.sf('data.assistForm.activeValue', undefined)
            this.metaAction.sf('data.other.fromLoad', 'highSearchClick')
            const res = await this.webapi.person.queryBaseArchives()
            const group = sortBaseArchives(res)
            this.injections.reduce('updateArr', [
                {
                    path: 'data.assistForm.initOption',
                    value: group
                }, {
                    path: 'data.assistForm.assistFormOption',
                    value: group
                }, {
                    path: 'data.assistForm.activeValue',
                    value: ''
                }
            ])
            // this.initBaseArchives(group)
        }
        this.showCheckboxInit(item)
        if (accountCode && needRepeatSend) {
            this.sortParmas(value)

        }
        await this.getAuxAccountList(value)
        if(!falg){
            this.accountlistChange(undefined)
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助明细账', '高级查询' + value.groupStr])
        this.metaAction.sf('data.other.currentTime', '')
    }
    // 搜索条件发生改变，先请求科目列表
    getAuxAccountList = async (params) => {
        const searchType = this.metaAction.gf('data.showOption.searchType')
        // if (searchType == 1) {
        let result = []
        const res = await this.webapi.person.queryAccountList({
            isCalc: true,
            isEndNode: true
        })

        let initAccountArray = [{ code: '0000', codeAndName: '所有科目' }]
        if (!res || !res.glAccounts) {
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.other.sigleAccountList',
                    value: initAccountArray
                }])
            this.injections.reduce('update', [
                {
                    path: 'data.searchValue.accountCodeList',
                    value: []
                }])
        } else {
            result = [...initAccountArray, ...res.glAccounts]
            this.injections.reduce('updateBathState', [
                {
                    path: 'data.other.sigleAccountList',
                    value: result
                }])
            this.injections.reduce('update', { path: 'data.other.auxAccountList', value: fromJS(changeToOption(res.glAccounts, 'codeAndName', 'code')) })
        }
        // }
    }
    getAccountList = async (value, accountCode, fromLoad) => {
        const params = this.sortParmas(value, null, 'get')
        
        const preAccountCode = this.metaAction.gf('data.searchValue.accountCode')
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (!fromLoad) {
            params.page.currentPage = 1
        }
        if (fromLoad == true) {
            delete params.beginAccountGrade
            delete params.endAccountGrade
        }
        if (fromLoad == 'simpleSearch') {
            // //简单查询 清空高级查询条件
            // delete searchValue.accountCodeList
            delete params.beginAccountGrade
            delete params.endAccountGrade
            // delete searchValue.onlyShowEndAccount
        }
        params.currencyId = null
        params.accountCode = accountCode ? accountCode : preAccountCode

        if (params.accountCodeList) {
            let accountCodeList = params.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            this.metaAction.sf('data.other.accountCodeArr', fromJS(accountCodeArr))
            params.accountCodeList = accountCodeArr            
        }
        if (fromLoad && fromLoad.currentPath == 'root.children.accountQuery.searchClick') {
            finalAccountCode = undefined
            params.accountCode = undefined
        }
        // params.onlyShowEndAccount = params.onlyShowEndAccount && params .onlyShowEndAccount.length > 0 ? 'true' : 'false'
        const res = await this.webapi.person.queryForAuxRpt(params)
        const { accountList, dataList } = res
        const page = dataList.page
        if (fromLoad && fromLoad.currentPath != 'root.children.accountQuery.searchClick' || !fromLoad) {
            this.injections.reduce('update', {
                path: 'data.other.accountlist',
                value: accountList
            })
        }


        if (!dataList.data) {
            dataList.data = []
            this.injections.reduce('updateArr', [
            {
                path: 'data.list',
                value: dataList.data ? dataList.data : []
            }, 
            {
                path: 'data.style',
                value: this.getRowSpan(dataList.style),
            },
             {
                path: 'data.pagination',
                value: {
                    currentPage: !page ? 1 : page.currentPage,
                    totalCount: !page ? 0 : page.totalCount,
                    pageSize: !page ? params.page.pageSize : page.pageSize,
                    totalPage: !page ? 0 : page.totalCount
                }
            }
        ])
        }
        

        const haveInAccountList = accountList.find(item => {
            return item.code == preAccountCode
        })
        let finalAccountCode = accountCode ? accountCode : (haveInAccountList ? preAccountCode : null)
        let needRepeatSend = !accountCode && !haveInAccountList && preAccountCode ? true : false
        if (fromLoad && fromLoad.currentPath == 'root.children.accountQuery.searchClick') {
            finalAccountCode = undefined
        } else {
            finalAccountCode = finalAccountCode
            // this.metaAction.sf('data.searchValue.accountcode', accountList[0].code)
        }
        setTimeout(() => {
            this.onResize()
        }, 20)
        return {
            falg:dataList.data.length==0?true:false,
            accountCode: finalAccountCode,
            needRepeatSend: needRepeatSend
        }
    }

    // 科目搜索条件发生变化 点击左右按钮进行改变
    accountlistBtn = (type) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        
        const accountCode = this.metaAction.gf('data.searchValue.accountCode')
        let index = accountlist.findIndex(item => item.code == accountCode)
        let code

        switch (type) {
            case 'right':
                if (accountCode) {
                    code = accountlist[index + 1] && accountlist[index + 1].code ? accountlist[index + 1].code : accountCode
                } else {
                    code = accountlist[0].code
                }

                break
            case 'left':
                if (accountCode) {
                    code = accountlist[index - 1] && accountlist[index - 1].code ? accountlist[index - 1].code : accountCode
                } else {
                    code = accountlist[accountlist.length - 1].code
                }

                break
            default:
                code = accountCode
                break
        }
        // if( index == -1 ){
        //     code = accountlist[0]
        // }
        console.log(code)
        this.accountlistChange(code)
    }

    //科目发生改变直接点击搜索项
    accountlistChange = (value) => {
        // this.searchCardDet.form.setFieldsValue({'accountCodeList': undefined})
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const item = accountlist.find(index => {
            return index.code == value
        })
        let auxAccountList = this.metaAction.gf('data.other.auxAccountList').toJS(), accountCodeList = []
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        
        this.injections.reduce('update', { path: 'data.searchValue.accountCode', value })
        // this.metaAction.sf('data.searchValue.accountCodeList', undefined)
        this.showCheckboxInit(item)
        searchValue.accountCode = value
        if (!value) {
            if(!searchValue.accountCodeList||searchValue.accountCodeList.length==0){
                auxAccountList.map(o => {
                    if (o.isEndNode == true) {
                        accountCodeList.push(o)
                    }
                })
                searchValue.accountCodeList = accountCodeList
            }else{
                auxAccountList.map(o => {
                    searchValue.accountCodeList.map(item => {
                        if (o.code == item) {
                            accountCodeList.push(o)
                        }
                    })
                })
                searchValue.accountCodeList = accountCodeList
            }
        } else {
            // searchValue.accountCodeList = null
            delete searchValue.accountCodeList
        }
        delete searchValue.beginAccountGrade
        delete searchValue.endAccountGrade
        delete searchValue.onlyShowEndAccount
        this.metaAction.sf('data.other.fromLoad', 'simpleSearch')
        this.sortParmas(searchValue, null, null, 'fromaccountlistChange')

    }

    // 组装搜索条件
    sortParmas = (search, pages, type, from) => {
        let searchValue
        if (!search) {
            search = this.metaAction.gf('data.searchValue').toJS()
        }
        const changeData = {
            'date_start': {
                'beginDate': (data) => data ? data.format('YYYY-MM') : null,
            },
            'date_end': {
                'endDate': (data) => data ? data.format('YYYY-MM') : null,
            }
        }
        if (!search.beginDate) {
            searchValue = utils.sortSearchOption(search, changeData)
        } else {
            searchValue = search
        }
        if (search.date_start) {
            search.beginDate = search.date_start.format('YYYY-MM')
        }
        if (search.date_end) {
            search.endDate = search.date_end.format('YYYY-MM')
        }


        if (!pages) {
            pages = this.metaAction.gf('data.pagination').toJS()
        }
        if (type == 'get') {
            return { ...searchValue, page: { currentPage: pages.currentPage, pageSize: pages.pageSize } }
        }
        this.requestData({ ...searchValue, page: { currentPage: pages.currentPage, pageSize: pages.pageSize } }, from)
    }

    // 发送请求
    requestData = async (params, from) => {
        let loading = this.metaAction.gf('data.loading'), response
        let accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        if (from == 'fromaccountlistChange') {
            //点击科目列表时调用query，其余情况调用queryForAuxRpt接口
            response = await this.webapi.person.query(params)
            this.injections.reduce('tableLoading', false)
            const { page } = response
            this.injections.reduce('updateArr', [
                {
                    path: 'data.list',
                    value: response.data ? response.data : []
                }, {
                    path: 'data.style',
                    value: this.getRowSpan(response.style),
                }, {
                    path: 'data.pagination',
                    value: {
                        currentPage: page ? page.currentPage : 1,
                        totalCount: page.totalCount,
                        pageSize: page.pageSize,
                        totalPage: page.totalCount
                    }
                }, {
                    path: 'data.other.accountlist',
                    value: response.accountList ? response.accountList : accountlist
                }
            ])
        } else {
            response = await this.webapi.person.queryForAuxRpt(params)
            this.injections.reduce('tableLoading', false)
            const { page } = response.dataList
            this.injections.reduce('updateArr', [
                {
                    path: 'data.list',
                    value: response.dataList.data ? response.dataList.data : []
                }, {
                    path: 'data.style',
                    value: this.getRowSpan(response.dataList.style),
                }, {
                    path: 'data.pagination',
                    value: {
                        currentPage: page ? page.currentPage : 1,
                        totalCount: page.totalCount,
                        pageSize: page.pageSize,
                        totalPage: page.totalCount
                    }
                }, {
                    path: 'data.other.accountlist',
                    value: response.dataList.accountList ? response.dataList.accountList : accountlist
                },
                // {
                //     path: 'data.searchValue.accountCode',
                //     value: response.dataList.accountList?response.dataList.accountList[0].code:undefined
                // }
            ])
        }

        setTimeout(() => {
            this.onResize()
        }, 20)
    }

    getRowSpan = (data) => {
        let result = {}
        if (!data) {
            return result
        }
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

    // render辅助选项
    renderFormList = () => {
        return <AssistForm />
    }

    // 点击刷新按钮
    refreshBtnClick = () => {
        const fromLoad = this.metaAction.gf('data.other.fromLoad')
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (searchValue.accountCodeList) {
            let accountCodeList = searchValue.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            this.metaAction.sf('data.other.accountCodeArr', fromJS(accountCodeArr))
            searchValue.accountCodeList = accountCodeArr
        }
        if (fromLoad == 'highSearchClick') {
            //高级查询
            delete searchValue.accountCode
        } else {
            delete searchValue.accountCodeList
            delete searchValue.beginAccountGrade
            delete searchValue.endAccountGrade
        }
        this.getAuxAccountList(searchValue)
        if(searchValue.accountCode){
            this.sortParmas({ ...searchValue })
        }else{
            this.accountlistChange(undefined)
            // this.sortParmas(searchValue, null, null, 'fromaccountlistChange')
        }
        
    }

    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.date_start)
        arr.push(data.date_end)
        return arr
    }

    onPanelChange = async (value) => {
        // 
        let date = {
            date_end: value[1],
            date_start: value[0]
        }
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.beginAccountGrade = 1
        searchValue.endAccountGrade = 5
        this.injections.reduce('searchUpdate', { ...searchValue, ...date })
        this.injections.reduce('update',
            {
                path: 'data.searchValue.accountCodeList',
                value: []
            })
        //简单查询 清空高级查询条件
        delete searchValue.accountCodeList
        delete searchValue.beginAccountGrade
        delete searchValue.endAccountGrade
        // delete searchValue.accountCode
        this.metaAction.sf('data.other.fromLoad', 'simpleSearch')
        // this.sortParmas({ ...searchValue, ...date })
        this.getAuxAccountList(searchValue)
        let accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        // let { accountCode, needRepeatSend } = await this.getAccountList(searchValue)
        
        // if (accountlist.length > 0) {
        //     this.metaAction.sf('data.searchValue.accountCode', accountlist[0].code)
        // }
        this.accountlistChange(undefined)

        this.metaAction.sf('data.other.currentTime', '')
    }

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [data.date_start, data.date_end]
        return { date }
    }
    pageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (searchValue.accountCodeList) {
            let accountCodeList = searchValue.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            this.metaAction.sf('data.other.accountCodeArr', fromJS(accountCodeArr))
            searchValue.accountCodeList = accountCodeArr
        }
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })
        if(searchValue.accountCode){
            this.sortParmas({ ...searchValue }, page, null, 'fromaccountlistChange')
            // this.sortParmas({ ...searchValue }, page)
        }else{
            this.accountlistChange(undefined)
            // this.sortParmas(searchValue, null, null, 'fromaccountlistChange')
        }
       
    }
    //分页发生变化
    sizePageChanged = async (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        const searchValue = this.metaAction.gf('data.searchValue').toJS()
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (searchValue.accountCodeList) {
            let accountCodeList = searchValue.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            this.metaAction.sf('data.other.accountCodeArr', fromJS(accountCodeArr))
            searchValue.accountCodeList = accountCodeArr
        }
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        this.injections.reduce('update', {
            path: 'data.pagination',
            value: page
        })

        // this.sortParmas({ ...searchValue }, page)
        if(searchValue.accountCode){
            this.sortParmas({ ...searchValue }, page, null, 'fromaccountlistChange')
            // this.sortParmas({ ...searchValue }, page)
        }else{
            this.accountlistChange(undefined)
            // this.sortParmas(searchValue, null, null, 'fromaccountlistChange')
        }
        let request = {
            moduleKey: 'app-auxdetailaccount-rpt',
            resourceKey: 'app-auxdetailaccount-rpt-table',
            settingKey: "pageSize",
            settingValue: pageSize
        }
        await this.webapi.person.setPageSetting([request])
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
        let data = await this.sortParmas(null, null, 'get')
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        let params = {
            beginDate: data.beginDate,
            endDate: data.endDate,
            accountCode: data.accountCode || '',
            groupStr: data.groupStr,
            whereStr: data.whereStr
        }
        // if(!params.accountCode || params.accountCode == ''){
        //     this.metaAction.toast('warning', '暂时仅支持单一科目的微信/QQ分享功能，后续陆续优化，敬请谅解')
        //     return
        // }
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/gldetailauxrpt/share',
                params: params
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助明细账', '分享微信/QQ'])
    }

    mailShare = async () => {
        let data = await this.sortParmas(null, null, 'get')
        if (this.metaAction.gf('data.list').toJS().length == 0) {
            this.metaAction.toast('warning', '当前暂无数据可分享')
            return
        }
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        data.isMultiCalc = currency
        data.isQuantityCalc = num
        // if(!data.accountCode){
        //     this.metaAction.toast('warning', '暂时仅支持单一科目的邮件分享功能，后续陆续优化，敬请谅解')
        //     return
        // }

        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: data,
                shareUrl: '/v1/gl/report/gldetailauxrpt/share',
                mailShareUrl: '/v1/gl/report/gldetailauxrpt/sendShareMail',
                printShareUrl: '/v1/gl/report/gldetailauxrpt/print',
                period: `${data.beginDate.replace('-', '.')}-${data.endDate.replace('-', '.')}`,
            })
        })
        _hmt && _hmt.push(['_trackEvent', '财务', '辅助明细账', '邮件分享'])
    }

    rowSpan = (text, row, index) => {
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(row.docId, 'docId', index),
            },
        }

        return obj
    }

    export = async () => {
        let list = this.metaAction.gf('data.list').toJS()
        let fromLoad = this.metaAction.gf('data.other.fromLoad')
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }
        const params = await this.sortParmas(null, null, 'get')
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        if (params.accountCodeList) {
            let accountCodeList = params.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            params.accountCodeList = accountCodeArr
        }
        // if(!params.accountCode){
        //     this.metaAction.toast('warning', '暂时仅支持单一科目的打印导出功能，后续陆续优化，敬请谅解')
        //     return
        // }
        if (fromLoad != 'highSearchClick') {
            delete params.beginAccountGrade
            delete params.endAccountGrade
        }
        params.isMultiCalc = currency
        params.isQuantityCalc = num
        let data = await this.webapi.person.export(params)
    }
    exportAllAccount = async () => {
        const _this = this
        const currency = this.metaAction.gf('data.other.currencylist').toJS()
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2 currency={currency} type="导出" callBack={_this.submitExportOption} />
        })
    }
    submitExportOption = async (form) => {
        // let tempWindow = window.open()
        // let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        // if(forwardingFlag){
        //     this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        //     tempWindow.close()
        //     return
        // }else{

        let { num, currency, currencyId, isOnlyEndNode, isContinuous } = form.getValue()
        if (currencyId == '0') {
            currency = false
        } else {
            currency = true
        }
        const params = this.sortParmas(null, null, 'get')
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList').toJS(),
            accountCodeList = [],
            endDate = params.endDate
        let response = await this.webapi.person.hasAuxRecords({ year: endDate.split('-')[0], period: endDate.split('-')[1] })
        if (response == false) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            // tempWindow.close()
            return
        }
        auxAccountList.map(o => accountCodeList.push(o.value))
        params.currencyId = currencyId
        params.isCalcMulti = currency
        params.isCalcQuantity = num
        params.exportAll = true
        params.isContinuous = isContinuous
        params.isOnlyEndNode = isOnlyEndNode
        // params.tempWindow = tempWindow
        if (isContinuous == true) {
            params.accountCodeList = accountCodeList
        }
        await this.webapi.person.export(params)
        // }

    }
    print = async () => {
        let list = this.metaAction.gf('data.list').toJS()
        let fromLoad = this.metaAction.gf('data.other.fromLoad')
        const auxAccountList = this.metaAction.gf('data.other.auxAccountList') && this.metaAction.gf('data.other.auxAccountList').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        const params = this.sortParmas(null, null, 'get')
        if (params.accountCodeList) {
            let accountCodeList = params.accountCodeList,
                accountCodeArr = []
            for (let i = 0; i < auxAccountList.length; i++) {
                for (let j = 0; j < accountCodeList.length; j++) {
                    if (auxAccountList[i].code == accountCodeList[j]) {
                        accountCodeArr.push({ grade: auxAccountList[i].grade, code: auxAccountList[i].code, isEndNode: auxAccountList[i].isEndNode })
                    }
                }
            }
            params.accountCodeList = accountCodeArr
        }
        // if(!params.accountCode){
        //     this.metaAction.toast('warning', '暂时仅支持单一科目的打印导出功能，后续陆续优化，敬请谅解')
        //     return
        // }
        if (fromLoad != 'highSearchClick') {
            delete params.beginAccountGrade
            delete params.endAccountGrade
        }
        let tempWindow = window.open()
        const { num, currency } = this.metaAction.gf('data.showOption').toJS()
        params.isMultiCalc = currency
        params.isQuantityCalc = num
        params.tempWindow = tempWindow
        console.log(params)
        let data = await this.webapi.person.print(params)
    }
    printAllAccount = async () => {

        const _this = this
        const currency = this.metaAction.gf('data.other.currencylist').toJS()
        this.metaAction.modal('show', {
            title: '选择格式',
            width: 500,
            footer: null,
            iconType: null,
            children: <PrintOption2 currency={currency} type="打印" callBack={_this.submitPrintOption} />
        })
    }
    submitPrintOption = async (form) => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.person.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        } else {

            let { num, currency, currencyId, isOnlyEndNode, isContinuous } = form.getValue()
            if (currencyId == '0') {
                currency = false
            } else {
                currency = true
            }
            const params = this.sortParmas(null, null, 'get')
            const auxAccountList = this.metaAction.gf('data.other.auxAccountList').toJS(),
                accountCodeList = [],
                endDate = params.endDate
            let response = await this.webapi.person.hasAuxRecords({ year: endDate.split('-')[0], period: endDate.split('-')[1] })
            if (response == false) {
                this.metaAction.toast('warning', '当前没有可打印数据')
                tempWindow.close()
                return
            }
            auxAccountList.map(o => accountCodeList.push(o.value))
            params.currencyId = currencyId
            params.tempWindow = tempWindow
            params.isCalcMulti = currency
            params.isCalcQuantity = num
            params.printAll = true
            params.isContinuous = isContinuous
            params.isOnlyEndNode = isOnlyEndNode
            console.log(params)
            if (isContinuous == true) {
                params.accountCodeList = accountCodeList
            }
            await this.webapi.person.print(params)
        }

    }
    showCheckboxInit = (item) => {
        this.injections.reduce('update', {
            path: 'data.showCheckbox',
            value: {
                quantity: false,
                multi: false
            }
        })
        this.injections.reduce('update', {
            path: 'data.showOption',
            value: {
                num: false,
                currency: false
            }
        })
    }

    showOptionsChange = (key, value) => {
        this.injections.reduce('showOptionsChange', {
            path: `data.showOption.${key}`,
            value: value
        })
    }

    checkBoxisShow = (key) => {
        const showCheckbox = this.metaAction.gf('data.showCheckbox').toJS()
        return { display: showCheckbox[key] ? 'inline-block' : 'none' }
    }

    rowSpan2 = (text, row, index) => {
        const num = this.calcRowSpan(row.accountDate, 'accountDate', index)
        const tmpstr = typeof (text) == 'string' && text ? text.replace(/\s/g, '') : ''
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf('data.list')
        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == list.getIn([currentRowIndex - 1, columnKey])) {
            return 0
        }

        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }

    checkShowSpan = (index, data) => {
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

    renderColSpan = (text, key, index) => {
        const style = this.metaAction.gf('data.style').toJS()
        let num = 1

        if (style[key] && style[key][index]) {
            num = style[key][index]
        } else if (style[key]) {
            num = this.checkShowSpan(index, style[key])
        }

        const tmpstr = typeof (text) == 'string' && text ? text.replace(/\s/g, '') : ''

        return {
            children: <div className='ellipsis' title={text}>{text}</div>,
            props: {
                rowSpan: num
            }
        }
    }

    openMoreContent = async (docId) => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: docId } })
    }

    tableColumns = () => {
        const showOption = this.metaAction.gf('data.showOption').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        let type

        if (showOption.num && showOption.currency) {
            type = 3
        } else if (showOption.num && !showOption.currency) {
            type = 2
        } else if (!showOption.num && showOption.currency) {
            type = 1
        } else {
            type = 0
        }
        let arr = renderColumns(this.openMoreContent, type)
        let arrleft = []
        const { assistFormOption, assistFormSelectValue } = this.metaAction.gf('data.assistForm') && this.metaAction.gf('data.assistForm').toJS()
        const count = assistFormSelectValue.length
        assistFormOption.forEach(item => {
            if (assistFormSelectValue.includes(item.key)) {
                if (item.key.includes('isExCalc')) {
                    let keyStr = item.key ? `e${item.key.slice(3)}Name` : item.key
                    arrleft.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: keyStr,
                        dataIndex: keyStr,
                        key: keyStr,
                        width: 138,
                        fixed: count < 5? 'left' : '',
                        render: (text, record, index, ) => this.renderColSpan(text, item.key, index)
                    })
                } else {
                    arrleft.push({
                        title: <span title={item.name}>{item.name}</span>,
                        name: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        dataIndex: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        key: item.key ? item.key.replace(/Id/, 'Name') : item.key,
                        width: 138,
                        fixed: count < 5 ? 'left' : '',
                        render: (text, record, index, ) => this.renderColSpan(text, item.key, index)
                    })
                }
            }
        })
        let arrCenter = [
            {
                title: '科目编码',
                name: 'accountCode',
                dataIndex: 'accountCode',
                width: 138,
                fixed: count < 5 ? 'left' : '',
                key: 'accountCode',
                render: (text, record, index, ) => this.renderColSpan(text, 'accountCode', index)
            },
            {
                title: '科目名称',
                name: 'accountName',
                dataIndex: 'accountName',
                width: 138,
                fixed: count < 5? 'left' : '',
                key: 'accountName',
                render: (text, record, index, ) => this.renderColSpan(text, 'accountName', index)
            }, {
                title: '日期',
                name: 'accountDate',
                dataIndex: 'accountDate',
                width: count < 5 ? 180 : 89,
                align: 'center',
                key: 'accountDate'
            }
        ]
        let listWidth=[...arrleft, ...arrCenter, ...arr]
        if( count < 3){
            delete listWidth[listWidth.length-1].width
        }
        return listWidth
        // let listWidthNumber=0
        // listWidth.forEach(item=>{
        //     listWidthNumber=listWidthNumber+Number(item.width)
        // })
        // this.metaAction.sf('data.tableOption.x', listWidthNumber)
        // return [...arrleft, ...arrCenter, ...arr]
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.other.enableddate')

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
            time = moment(date)
        }
        return parseInt(`${time.year()}${time.month() < 10 ? `0${time.month()}` : `${time.month()}`}`)
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('app-auxdetailaccount-rpt-Body', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
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
                }, 500)
                return
            }

            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
           if (bodyHeight > y && y != pre.y) {
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '-16px' });
                }
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                if (!!window.ActiveXObject || "ActiveXObject" in window){
                    $(tableCon.getElementsByClassName('ant-table-fixed-left')).find('.ant-table-body-inner').css({ "margin-bottom": '' });
                }
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {
            console.log(err)
        }
    }

    handleTimeLineItem = async (time, disabled) => {
        // this.metaAction.sf('data.other.currentTime', time)
        if (disabled) return
        let month = time.slice(4)
        let year = time.slice(0, 4)
        let now = utils.date.transformMomentDate(`${year}-${month}`)

        this.metaAction.sfs({
            'data.searchValue.date_end': now,
            'data.searchValue.date_start': now
        })

        this.onPanelChange([moment(`${year}-${month}`), moment(`${year}-${month}`)])
        this.metaAction.sf('data.other.currentTime', time)
    }

    renderTimeLineVisible = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()

        let startDate = moment(data.date_start).format('YYYY-MM')
        let endDate = moment(data.date_end).format('YYYY-MM')
        let endDateYear = endDate.replace(/-/g, '')

        let diffMonth = moment(endDate).diff(moment(startDate), 'month')
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

        let diffMonth = moment(endDate).diff(moment(startDate), 'month')
        if (diffMonth > 36) return

        let initCurrentTime = currentOrg.periodDate.replace(/-/g, '')
        let currentTime = parmasData ? initCurrentTime : this.metaAction.gf('data.other.currentTime')

        // 初始时间和结束时间在同年同月
        let timeArr = []
        if (startDate == endDate) {
            let year = moment(startDate).format('YYYY')
            let list = [+year - 1, +year, +year + 1]

            if (parmasData || !currentTime) {
                list.forEach(item => {
                    for (let i = 0; i < 12; i++) {
                        let num = i < 9 ? '0' + (i + 1) : String(i + 1)
                        timeArr.push(item + num)
                    }
                })
                this.timeLineYearList = timeArr
            } else {
                timeArr = this.timeLineYearList
            }
        } else {

            let beforeDate = moment(moment(startDate).subtract(Math.floor((36 - diffMonth) / 2), 'month')).format('YYYY-MM')
            let afterDate = moment(moment(endDate).add(Math.ceil((36 - diffMonth) / 2), 'month')).format('YYYY-MM')

            for (let i = 0; i < 36; i++) {
                let time = moment(beforeDate).add(i + 1, 'month').format('YYYY-MM')
                time = time.replace(/-/g, '')
                timeArr.push(time)
            }
            this.timeLineYearList = timeArr
        }

        // let currentTime = this.metaAction.gf('data.other.currentTime')

        if (parmasData || !currentTime) {
            clearTimeout(this.renderTime)
            this.renderTime = setTimeout(() => {
                try {
                    var height = 0;
                    var domList = document.getElementsByClassName('ant-timeline-item')
                    let yearNum = 0
                    timeArr.forEach(item => {
                        if (item < endDateYear) {
                            let month = item.slice(4)
                            if (Number(month) == 1) {
                                yearNum += 1
                            }
                        }
                    })

                    for (let i in domList) {
                        if (i < (timeArr.indexOf(endDateYear) + 1 + yearNum)) {
                            height += domList[i].offsetHeight
                        }
                    }
                    document.querySelector('.app-auxdetailaccount-rpt-body-left').scrollTop = height - document.querySelector('.app-auxdetailaccount-rpt-body-left').offsetHeight / 2
                } catch (e) {

                }
            }, 5)
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
                        let isTrue = currentTime ? currentTime == item ? true : false : startDate == endDate && item == endDateYear

                        // let color = currentTime ?
                        // item < currentTime ? '#FF913A': '#0066B3' : 
                        // startDate == endDate ? 
                        // item < endDateYear ? '#FF913A': '#0066B3' :'#0066B3'

                        let timePeriod = this.metaAction.gf('data.other.timePeriod').toJS()
                        let { minDataPeriod, maxDataPeriod } = timePeriod
                        // let disabled = (!minDataPeriod && !maxDataPeriod) || (Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod))
                        let disabled = Number(item) < Number(enabledDate)

                        let color = '#666'
                        if (minDataPeriod && maxDataPeriod) {
                            if (Number(item) < Number(minDataPeriod) || Number(item) > Number(maxDataPeriod)) {
                                if (disabled) {
                                    color = '#D9D9D9'
                                } else {
                                    color = '#666'
                                }
                            } else {
                                color = '#0066B3'
                            }
                        }

                        let dot = isTrue ?
                            <div className='nodeDiv'>{title}</div> :
                            item == enabledDate ? <Icon
                                type="qiyongriqi"
                                fontFamily='edficon'
                                style={{ fontSize: '16px', zIndex: 222 }}
                                title='启用日期' /> : null

                        if (Number(month) == 1) {
                            return [<Timeline.Item
                                className='ant-timeline-item ant-timelineItemYear'
                                dot={<div className={disabled ? 'yearLabelDis' : 'yearLabel'}><span>{year}</span><Icon type='arrow-down' /></div>}
                            ></Timeline.Item>,
                            <Timeline.Item
                                className={disabled ? 'ant-timelineItemDis' : isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled' : ''}
                                dot={dot}
                                color={disabled ? '#D9D9D9' : color}
                                onClick={() => this.handleTimeLineItem(item, disabled)}
                            ><span title={title}>{isTrue ? '' : month}</span></Timeline.Item>]
                        }

                        return <Timeline.Item
                            className={disabled ? 'ant-timelineItemDis' : isTrue ? 'ant-timelineItem' : item == enabledDate ? 'ant-timelineEnabled' : ''}
                            dot={dot}
                            color={disabled ? '#D9D9D9' : color}
                            onClick={() => this.handleTimeLineItem(item, disabled)}
                        ><span title={title}>{isTrue ? '' : month}</span></Timeline.Item>
                    })
                }
                <div></div>
            </Timeline>
        </div></div>
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
