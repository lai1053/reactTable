import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon} from 'edf-component'
import config from './config'
import renderColumns from './utils/renderColumns'
import {Tree, Form,Button, Select} from 'edf-component'
import extend from './extend'
import { fromJS } from 'immutable'
import AddSub from './utils/addSubject'
import { message } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

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
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
		}
        injections.reduce('init')
        this.load()
       
    }
    scrollTable = () => {
        let scrollTop = document.getElementsByClassName('ant-table-body')[0].scrollTop
        // localStorage.setItem('scrollTop', JSON.stringify(scrollTop))
        this.scrollTop = scrollTop
    }
    componentWillUnmount = () => {
        let removeEventListener = this.component.props.removeEventListener

        if (removeEventListener) {
            removeEventListener('onTabAdd')
        }
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('edfx-business-subject-manage-table', 'ant-table-thead', 1, 'ant-table-body', 'data.tableOption', e)
            }
        }, 50)
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
                }, 100)
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
            console.log(err)
        }
    }
    load = async (filterObj, props) => {
        let response,isReloadTree = true,resAccountList,pageArr,filter,influenceList,accountList,
        accessType, activeKey, resTreeList=[],resTreeListAll=[], expandedKeys=[], autoAccount, option={}, classify

        this.metaAction.sf('data.loading', true)
        if (filterObj) isReloadTree = filterObj.isReloadTree

        // 资产-生成凭证设置
        // let proArr = []
        // proArr.push(await this.webapi.accountType.getAutoAccount({paramKey: 'assetAccount'}))
        // Promise.all()
        

        if(isReloadTree){  //初始化
            if(props && props.accessType) {
                accessType = props.accessType  
            }else if(props && props.openType == "menu"){
                accessType = '' 
            }else{
                accessType = this.component.props.accessType
            }
            if(accessType){
                resTreeList = await this.webapi.accountType.getAccountTree({businessCode: accessType}) 
            }else{
                resTreeListAll = await this.webapi.accountType.getAccountTree() 
            }
            if(resTreeList.length){
                if(accessType == "inventory") {
                    activeKey = '99999'  // 存货科目设置，默认选中第一个‘99999’
                }else{
                    activeKey = resTreeList[0].defaultChildrenId + ''  // 默认选中
                }
                expandedKeys = [resTreeList[0].id+'']  // 默认展开
            }else if(resTreeListAll.length){
                activeKey = resTreeListAll[0].children[0].id + ''
                expandedKeys = [resTreeListAll[0].id+'']  
                resTreeList = resTreeListAll   
            }
            resTreeList.map((item,index)=>{
                if(item.id == '5001' && item.children) {
                    resTreeList[index].children[0].id = "99999"
                }
            })
            // 新代账 屏蔽采销和库存  2001  5001
            if(this.component.props.appVersion === 114){
                let newList = []
                resTreeList.forEach(o=>{
                    if(o.id != '2001' && o.id != '5001') newList.push(o)
                })
                resTreeList = newList
            }
            let reduceArr = {
                'data.other.resTreeList':  fromJS(resTreeList),
                'data.other.treeSelectedKey': fromJS([activeKey]),
                'data.other.expandedKeys': fromJS(expandedKeys)
            }
            this.injections.reduce('updateArr', reduceArr)

            filter = {
                entity:{
                    templateAccountTypeId: activeKey,
                    influenceValue: '',
                },
                page: {
                    currentPage: 1,
                    pageSize: 50
                }
            }
            this.injections.reduce('update', 'data.filter', filter)
            if(filter.entity.templateAccountTypeId == '99999') {
                filter.entity.templateAccountTypeId = '2001001'
                this.metaAction.sf('data.other.isInvnetory', true)
            }else{
                this.metaAction.sf('data.other.isInvnetory', false)
            }

            // 资产科目
            let activeKeyArr = ['4000080001', '4000080002', '4000080003']

            if(activeKeyArr.indexOf(filter.entity.templateAccountTypeId)>-1){
                const isAutoAccount = await this.webapi.accountType.getAutoAccount({paramKey: 'assetAccount'})
                if(isAutoAccount.length && isAutoAccount[0].paramValue === 'true'){
                    this.metaAction.sf('data.other.isAutoAccount', true)
                    autoAccount = true
                }else{
                    this.metaAction.sf('data.other.isAutoAccount', false)
                    autoAccount = false
                }
            }else{
                this.metaAction.sf('data.other.isAutoAccount', false)
                autoAccount = false
            }
            if(autoAccount && activeKeyArr.indexOf(filter.entity.templateAccountTypeId)>-1){
                if(activeKey == '4000080001'){
                    classify = 'charge'
                }else if(activeKey == '4000080002'){
                    classify = 'depreciation'
                }else{
                    classify = 'assetClass'
                }
                
                option = {
                    classify,
                    page: {
                        currentPage: 1,
                        pageSize: 50
                    }
                }
                accountList = await this.webapi.accountType.queryAccountList(option) 
            }else{
                accountList = await this.webapi.accountType.queryPageByAccountType(filter)
            }
            
            this.metaAction.sf('data.other.treeId', activeKey)
        }else{    
            resTreeList = this.metaAction.gf('data.other.resTreeList')
            resTreeList = resTreeList.size ? resTreeList.toJS() : resTreeList
            resTreeList.map((item,index)=>{
                if(item.id == '5001' && item.children) {
                    resTreeList[index].children[0].id = "99999"
                }
            })
            if(filterObj.filter){
                // 修改分页
                filter = filterObj.filter
            }else{
                // 切换左侧树 或者 筛选
                filter = {
                    entity:{
                        templateAccountTypeId: filterObj.accountType,
                        influenceValue: filterObj.influenceValue
                    },
                    page: {
                        currentPage: 1,
                        pageSize: 50
                    }
                }
            }
            
            this.metaAction.sf('data.filter', fromJS(filter))
            if(filter.entity.templateAccountTypeId == '99999') {
                filter.entity.templateAccountTypeId = '2001001'
                this.metaAction.sfs({
                    'data.other.treeId': filterObj.accountType, 
                    'data.other.treeSelectedKey': fromJS([filterObj.accountType]),
                    'data.other.isInvnetory': true
                })
            }else{
                this.metaAction.sfs({
                    'data.other.treeId': filterObj.accountType, 
                    'data.other.treeSelectedKey': fromJS([filterObj.accountType]),
                    'data.other.isInvnetory': false
                })
            }

            let activeKeyArr = ['4000080001', '4000080002', '4000080003']

            if(activeKeyArr.indexOf(filter.entity.templateAccountTypeId)>-1){
                const isAutoAccount = await this.webapi.accountType.getAutoAccount({paramKey: 'assetAccount'})
                if(isAutoAccount.length && isAutoAccount[0].paramValue === 'true'){
                    this.metaAction.sf('data.other.isAutoAccount', true)
                    autoAccount = true
                }else{
                    this.metaAction.sf('data.other.isAutoAccount', false)
                    autoAccount = false
                }
            }else{
                this.metaAction.sf('data.other.isAutoAccount', false)
                autoAccount = false
            }
            if(autoAccount && activeKeyArr.indexOf(filter.entity.templateAccountTypeId)>-1){
                if(filter.entity.templateAccountTypeId == '4000080001'){
                    classify = 'charge'
                }else if(filter.entity.templateAccountTypeId == '4000080002'){
                    classify = 'depreciation'
                }else{
                    classify = 'assetClass'
                }

                option = filterObj
                delete option.isHaveSelect
                delete option.isReloadTree
                delete option.accountType
                option['classify'] = classify
                if(!option.page){
                    option['page'] = {
                        currentPage: 1,
                        pageSize: 50
                    }
                }
                accountList = await this.webapi.accountType.queryAccountList(option) 
            }else{
                accountList = await this.webapi.accountType.queryPageByAccountType(filter)
            }
        }
        
        let isInvnetory = this.metaAction.gf('data.other.isInvnetory')
        let isBatch 
        if(accountList) {
            resAccountList = accountList.list
            influenceList = accountList.searchList
            pageArr = accountList.page
            isBatch = accountList.inventoryRelatedAccountEnable
            if(isInvnetory && !isBatch){
                resAccountList = resAccountList.slice(0,4)
                influenceList[0].influenceClassList = influenceList[0].influenceClassList.slice(0,4)
            }
        }
        let resTableList = [], num
        resAccountList.map((item, index)=>{
            resTableList[index] = {}
            item.influenceList.map((v, i) => {
                num = 'influence'+i
                resTableList[index][num] = (resAccountList[index].influenceList)[i].influenceValue
            })
            resTableList[index]['key'] = index+1
            resTableList[index]['assetCardId'] = resAccountList[index].assetCardId
            resTableList[index]['assetId'] = resAccountList[index].assetId
            if(resAccountList[index].accountName){
                if(resAccountList[index].accountCode){
                    resTableList[index]['subject'] = resAccountList[index].accountCode +'-'+ resAccountList[index].accountName 
                } else{
                    resTableList[index]['subject'] = resAccountList[index].accountName 
                }
            }else{
                resTableList[index]['subject'] = ''
            }
            
        })
        response = {resTreeList, resAccountList, resTableList, filter, influenceList,pageArr, isBatch}
	    if(response){
            this.injections.reduce('load', response)
        }
        setTimeout(() => {  
            this.onResize()              
        }, 100)
        this.metaAction.sfs({
            'data.tableKey': Math.random(),
            'data.loading': false
        })

        this.injections.reduce('updateSelect', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: [],   
                selectedOption: []
            }
        })
        this.selectedOption = []

        let subjectListParameter = {
            isEndNode : true,
            isEnable : true
        }

        let subjectList = await this.webapi.accountType.getSubject(subjectListParameter)

        let newSubject = []
            subjectList.glAccounts.map(item=>{
                newSubject.push({
                    value: item.id,
                    label: item.codeAndName,
                    code: item.code
                })
            })

        this.metaAction.sf('data.subjectList', fromJS(newSubject))
    }

    refresh = async (isChange) => {
        let resTreeList = this.metaAction.gf('data.other.resTreeList').toJS()
        let filter = this.metaAction.gf('data.filter').toJS()
        let isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
        
        if(filter.entity.templateAccountTypeId == '99999') {
            filter.entity.templateAccountTypeId = '2001001'
            this.metaAction.sfs({
                'data.other.isInvnetory': true,
                'data.loading': true
            })
        }else{
            this.metaAction.sfs({
                'data.other.isInvnetory': false,
                'data.loading': true
            })
        }

        // 资产科目 按明细生成凭证
        let accountList, classify
        let activeKeyArr = ['4000080001', '4000080002', '4000080003']
        if(isAutoAccount && activeKeyArr.indexOf(filter.entity.templateAccountTypeId)>-1){
            if(filter.entity.templateAccountTypeId == '4000080001'){
                classify = 'charge'
            }else if(filter.entity.templateAccountTypeId == '4000080002'){
                classify = 'depreciation'
            }else{
                classify = 'assetClass'
            }
            let option = {
                classify,
                page: filter.page
            }, influenceArr = []
            let influenceList = this.metaAction.gf('data.other.influenceList').toJS()
            let influenceValue = this.metaAction.gf('data.other.option') && this.metaAction.gf('data.other.option').toJS()
            if(influenceValue){
                influenceValue.map(item => {
                    if(item!=undefined && item!=0 && item!='') influenceArr.push(item)
                })

                if(influenceArr.length){
                    influenceList.map((i,j)=>{
                        if(influenceValue[j] != 0 && influenceValue[j] != ''){
                            option[i.code] = influenceValue[j]
                        }
                    })
                }
            }
            accountList = await this.webapi.accountType.queryAccountList(option) 
        }else{
            accountList = await this.webapi.accountType.queryPageByAccountType(filter)
        }
        
        let pageArr = accountList.page, influenceList = accountList.searchList
        let resTableList = [], num

        let resAccountList = accountList.list
        let isBatch = accountList.inventoryRelatedAccountEnable

        let isInvnetory = this.metaAction.gf('data.other.isInvnetory')
        if(isInvnetory && !isBatch){
            resAccountList = resAccountList.slice(0,4)
            influenceList[0].influenceClassList = influenceList[0].influenceClassList.slice(0,4)
        }

        resAccountList.map((item, index)=>{
            resTableList[index] = {}
            item.influenceList.map((v, i) => {
                num = 'influence'+i
                resTableList[index][num] = (resAccountList[index].influenceList)[i].influenceValue
            })
            resTableList[index]['key'] = index+1
            resTableList[index]['assetCardId'] = resAccountList[index].assetCardId
            resTableList[index]['assetId'] = resAccountList[index].assetId
            if(resAccountList[index].accountName){
                if(resAccountList[index].accountCode){
                    resTableList[index]['subject'] = resAccountList[index].accountCode +'-'+ resAccountList[index].accountName 
                } else{
                    resTableList[index]['subject'] = resAccountList[index].accountName 
                }
            }else{
                resTableList[index]['subject'] = '' 
            }
        })
        
        let response = {resTreeList, resAccountList, resTableList, filter, pageArr, influenceList, isBatch}

        this.metaAction.sf('data.loading', false)
	    if(response){
		    this.injections.reduce('load', response)
        }
        if(!isChange){
            this.scrollTop = 0
            document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop
        }
        if(isBatch){
            this.injections.reduce('updateSelect', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],   
                    selectedOption: []
                }
            })
            this.selectedOption = []
        }
	}
	
	//当前app的 "tab被点击" (从其他app切换到当前app)
	onTabFocus = async (props) => {
        props = props.size? props.toJS() : props

        if((props && props.accessType) || (props && props.openType == "menu")){
            this.load(null, props)
        }else{
            this.refresh(true) 
        }
        document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop

        let subjectListParameter = {
            isEndNode : true,
            isEnable : true
        }

        let subjectList = await this.webapi.accountType.getSubject(subjectListParameter)
        let newSubject = []
        subjectList.glAccounts.map(item => {
            newSubject.push({
                value: item.id,
                label: item.codeAndName,
                code: item.code
            })
        })

        this.metaAction.sf('data.subjectList', fromJS(newSubject))
    }

    onExpand = (expandedKeys) => {
        this.metaAction.sf('data.other.expandedKeys', fromJS(expandedKeys))
    }
    //选择科目设置树
    selectType = (selectedKeys, info) => {
        if(info.selected == false) return
        if(info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.children) return
            
        let accountType = info.selectedNodes[0] && info.selectedNodes[0].key

        // 切换左侧树，更新右边筛选框
        this.metaAction.sfs({
            'data.other.treeSelectedKey': fromJS([accountType]),
            'data.other.isSelected': false,
            'data.other.itemStr': fromJS(''),
            'data.other.option': fromJS([])
        })
        // 清空
        let influenceList = this.metaAction.gf('data.other.influenceList') 
        if(influenceList){
            influenceList = influenceList.size ?  influenceList.toJS() : influenceList
            influenceList.map((item,index)=> {
                this.metaAction.sfs({
                    [`data.form.${item.code}.influenceName`]: '',
                    [`data.form.${item.code}.influenceId`]: ''
                })
            })
        }
        
        let filterObj = {
                isReloadTree: false,
                accountType,
                influenceValue:'',
                noGetInfluence:false
            }
        this.load( filterObj)
        this.scrollTop = 0
        document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop
    }

    refreshBtn = () => {
        this.refresh() 
    }

    //展示树
    renderTreeNodes = (data) => {
        if(!data) return <div></div>
        return data.map((item) => {
            if (item.children) {
                return (
                    <Tree.TreeNode title={item.name} key={item.id} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </Tree.TreeNode>
                )
            }
            return <Tree.TreeNode title={item.name} key={item.id} dataRef={item}/>
        })
    }

    influenceFactorSpan = (text, row, index) => {
        let obj 
        return obj = {
            children: <span title={text}>{text}</span>,
        }
    }

    subjectSpanChange = async (index,value) => {
        let filter = {}
        this.metaAction.sf(`data.other.list.${index}.glAccountId`, value);

        let resAccountList = this.metaAction.gf('data.other.list').toJS()
        filter.accountCode = resAccountList[index].accountCode
        filter.templateAccountTypeId = resAccountList[index].templateAccountTypeId
        resAccountList[index].templateUserId ? filter.templateUserId = resAccountList[index].templateUserId : ''
        filter.influence = resAccountList[index].influence
        filter.influenceValue = resAccountList[index].influenceValue
        resAccountList[index].ts ? filter.ts = resAccountList[index].ts : ''
        filter.accountId = value

        let response = await this.webapi.accountType.saveAccountType(filter)
        if(response.result) {
            this.metaAction.toast('success', '科目更新成功')
            this.metaAction.sfs({
                [`data.other.list.${index}.accountId`]: response.accountId,
                [`data.other.list.${index}.influence`]: response.influence,
                [`data.other.list.${index}.influenceValue`]: response.influenceValue,
                [`data.other.list.${index}.templateAccountTypeId`]: response.templateAccountTypeId,
                [`data.other.list.${index}.ts`]: response.ts,
            })
        }else {
            this.metaAction.toast('success', '科目更新成功')
        }
        
    }

    subjectSpan = (text, row, index) => {
        let _this = this
        let id = this.metaAction.gf('data.id')
        let resAccountList = this.metaAction.gf('data.other.list').toJS()
        
        if(id== 2001001 || id == 5001005) {
            let obj
            return <div style={{width: '95%'}}>
            <Select style={{width: '100%'}} 
                value={resAccountList[index].glAccountId} 
                onChange={(value) => this.subjectSpanChange(index, value)}
                filterOption={this.filterOptionSubject}
                dropdownClassName='edfx-business-subject-manage-selects'
                dropdownFooter={
                    <Button type='primary' 
                        style={{ width: '100%', borderRadius: '0' }}
                        onClick={function(){_this.addSubject(index)} }>新增科目
                    </Button>
                }
            >
            {this.selectOption()}
            </Select>
        </div>
        }else {          
            let obj
            return obj = {
                children: <span title={text}>{text}</span>,
                props: { colSpan: 1 }
            }
        }
    }

    selectOption = () => {
        let subjectList = this.metaAction.gf('data.subjectList')
        subjectList ? subjectList = subjectList.toJS() : ''

        if(!subjectList) return 
        return subjectList.map(item => {
            return <Option title={item.label} value={item.value}>{item.label}</Option>
        })
    }

    addSubject = async(index) => {
		const ret = await this.metaAction.modal('show', {
			title: '新增科目',
			width: 450,
			okText: '保存',
			bodyStyle: { padding: 24, fontSize: 12 },
			children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
				store: this.component.props.store,
				columnCode: "subjects",
				active: 'archives'
			})
		})
		if(ret){
            let subjectListParameter = {
                isEndNode : true,
                isEnable : true
            }
            let subjectList = await this.webapi.accountType.getSubject(subjectListParameter)
                // subjectList = subjectList.glAccounts.filter((item)=> item.isEndNode == true && item.isEnable == true)
            let newSubject = []
                subjectList.glAccounts.map(item=>{
                    newSubject.push({
                        value: item.id,
                        label: item.codeAndName,
                        code: item.code
                    })
                })
            this.metaAction.sfs({
                [`data.other.list.${index}.glAccountId`]: ret.id,
                [`data.other.list.${index}.accountCode`]: ret.code,
                'data.subjectList': fromJS(newSubject),
            })

            let filter = {}
            let resAccountList = this.metaAction.gf('data.other.list').toJS()
            filter.accountCode = resAccountList[index].accountCode
            filter.templateAccountTypeId = resAccountList[index].templateAccountTypeId
            resAccountList[index].templateUserId ? filter.templateUserId = resAccountList[index].templateUserId : ''
            filter.influence = resAccountList[index].influence
            filter.influenceValue = resAccountList[index].influenceValue
            resAccountList[index].ts ? filter.ts = resAccountList[index].ts : ''
            filter.accountId = ret.id
    
            let response = await this.webapi.accountType.saveAccountType(filter)
            // this.metaAction.sfs({
            //     [`data.other.list.${index}.accountId`]: response.accountId,
            //     [`data.other.list.${index}.influence`]: response.influence,
            //     [`data.other.list.${index}.influenceValue`]: response.influenceValue,
            //     [`data.other.list.${index}.templateAccountTypeId`]: response.templateAccountTypeId,
            //     [`data.other.list.${index}.ts`]: response.ts,
            // })
            if(response) {
                this.refresh(true)
            }
            
		}
    }
    
    filterOptionSubject = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}

    getSubject = async() => {
        const ret = await this.webapi.accountType.getSubject({isEndNode: true,isEnable: true})
        let newSubject=[]
        if(ret){
            newSubject = ret.glAccounts
        }
        return newSubject
    }
    addSub = async() =>{
        const getSubject = await this.getSubject()
        let addSubArr
        if(getSubject){
            addSubArr = await this.metaAction.modal('show', {
                title: '新增',
                width: '400px',   
                wrapClassName: 'addSubCss',
                children: <AddSub 
                            newSubject={getSubject}/>
            }) 
        }
        if(addSubArr){
            const filter ={
                accountCode: addSubArr.accountCode,
                accountId: addSubArr.accountId,
                name: addSubArr.name,
                pid: 5001002,
            }
            const ret = await this.webapi.accountType.create(filter)
            this.refresh() 
            setTimeout(() => {  
                this.onResize()              
            }, 100)
        }
    }
    delSubject = async(text, row, index) =>{
        const res = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })   
        let list = this.metaAction.gf('data.other.list').toJS()
        if(res){
            const ret = await this.webapi.accountType.delete({id: list[index].influenceValue})
            if(ret) this.metaAction.toast('success', '删除成功')
            this.refresh() 
            setTimeout(() => {  
                this.onResize()              
            }, 100)
        }
    }
    editSubject = async(text, row, index) =>{
        let list = this.metaAction.gf('data.other.list').toJS()
        const getSubject = await this.getSubject()

        if(getSubject){
            const addSubArr = await this.metaAction.modal('show', {
                title: '编辑',
                width: '400px',
                wrapClassName: 'addSubCss',
                children: <AddSub 
                            name={row.influence0}
                            subId={list[index].accountId}
                            accountCode={list[index].accountCode}
                            newSubject={getSubject}/>
            }) 
            if(addSubArr){
                const filter = {
                    accountCode: addSubArr.accountCode, 
                    accountId: addSubArr.accountId,
                    id: list[index].influenceValue ,    //influenceValue 的值
                    name: addSubArr.name,
                }
                const ret = await this.webapi.accountType.update(filter)
                this.refresh() 
                setTimeout(() => {  
                    this.onResize()              
                }, 100)
            }
        }
    }
    addIsVisible = () => {
        let key = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0]
        if(key == "5001003"){
            return true
        }else{
            return false
        }
    }
    handle = (text, row, index) => {
        let obj
        let key = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0]
        if(key == "5001003" && index>3){
            obj={           
                children: (
                    <span>
                        <a>
                            <Icon fontFamily="edficon" type='bianji' title='编辑' style={{fontSize:'24px'}} 
                                onClick={()=>{return this.editSubject(text, row, index)}}></Icon> 
                        </a>
                        <a>
                            <Icon fontFamily="edficon" type='shanchu' title='删除' style={{fontSize:'24px'}} 
                                onClick={()=>{return this.delSubject(text, row, index)}}></Icon> 
                        </a>   
                    </span>
                )
            }
        }else{
            obj={           
                children: (
                    <a href="javascript:;">                   
                        <Icon fontFamily="edficon" type='bianji' title='编辑' style={{fontSize:'24px'}} 
                            onClick={()=>{return this.openCard(text, row, index)}}></Icon> 
                    </a>                  
                )
            }
        }
        return obj
    }

    //分页修改
	pageChanged = async (currentPage, pageSize) => {
        let filter = this.metaAction.gf('data.filter').toJS()
        let resAccountList = this.metaAction.gf('data.other.list').toJS()
        let accountType = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0];
        let page = this.metaAction.gf('data.page').toJS();
        let influenceValue = this.metaAction.gf('data.other.itemStr')
        let influenceList = this.metaAction.gf('data.other.influenceList').toJS()

		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.page').toJS().pageSize
        }
        if(!influenceValue) influenceValue = ''
        filter = {
            page: {currentPage, pageSize},
            entity:{
                templateAccountTypeId: resAccountList[0].templateAccountTypeId,
                influenceValue:influenceValue
            }
        }
        let filterObj = {
            isReloadTree: false,
            accountType,
            filter,
            noGetInfluence: true
        }

        let option = {
            isReloadTree:false,
            accountType,
            isHaveSelect: influenceValue ? true:false,
            page: {currentPage, pageSize}
        }
        let otherOption = this.metaAction.gf('data.other.option') && this.metaAction.gf('data.other.option').toJS()
        if(influenceValue){
            influenceList.map((i,j)=>{
                if(otherOption[j] != 0 && otherOption[j] != ''){
                    option[i.code] = otherOption[j]
                }
            })
        }

        let isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
        let activeKeyArr = ['4000080001', '4000080002', '4000080003']
        if(isAutoAccount && activeKeyArr.indexOf(accountType)>-1){
            this.load( option )
        }else{
            this.load( filterObj )
        }
        this.scrollTop = 0
        document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop
	}

    handleSelect = (arr) => {
        if (arr) {
            arr.unshift({ influenceValueId: 0, influenceValue: '全部' })
            return arr.map((item,index) => {
                if(item.influenceValue) return <Option value={item && item.influenceValue} title={item && item.influenceValue}>{item && item.influenceValue}</Option>
            })
        }
    }
    
    onFieldChange = (index, list) => (id) => {
        let storeField = list.influenceClassList
        this.metaAction.sf('data.other.isSelected',true)
        let value = storeField.filter(function(o){return o.influenceValue == id})[0]
        if (value) {
            this.metaAction.sfs({
                ['data.form.'+list.code+'.influenceName']: fromJS(value.influenceValue),
                ['data.form.'+list.code+'.influenceId']: fromJS(value.influenceValueId)
            })
        }

        let accountType = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0];
        let influenceList = this.metaAction.gf('data.other.influenceList').toJS()
        let influenceValue = []
        if(influenceList.length) {
            length = influenceList.length
            influenceList.map((item,i)=> {
                if(index == i){
                    influenceValue.push(value.influenceValueId)
                }else {
                    let influence = item.code+'.influenceId' 
                    let str = this.metaAction.gf('data.form.'+influence)
                    influenceValue.push(str)
                }
            })
        }
        let itemStr, influenceArr=[]
        influenceValue.map(item => {
            if(item!=undefined && item!=0 && item!='') influenceArr.push(item)
        })

        // 资产科目
        let option = {
            isReloadTree:false,
            accountType,
            isHaveSelect: influenceArr.length ? true:false
        }
        if(influenceArr.length){
            influenceList.map((i,j)=>{
                if(influenceValue[j] != 0 && influenceValue[j] != ''){
                    option[i.code] = influenceValue[j]
                }
            })
        }
        this.metaAction.sf('data.other.option', fromJS(influenceValue))
        
        if(influenceArr.length == 4){
            itemStr = influenceArr[0] +';'+ influenceArr[1] +';'+ influenceArr[2] +';'+ influenceArr[3]
        }else if(influenceArr.length == 3){
            itemStr = influenceArr[0] +';'+ influenceArr[1] +';'+ influenceArr[2]
        }else if(influenceArr.length == 2){
            itemStr = influenceArr[0] +';'+ influenceArr[1]
        }else if(influenceArr.length == 1){
            itemStr = influenceArr[0]
        }else{
            itemStr = ''
        }

        let isBatch = this.metaAction.gf('data.other.isBatch')
        let conds = this.metaAction.gf('data.other.conds')
        if(isBatch && conds) {
            if(itemStr){
                itemStr = `${itemStr};${conds}`
            }else{
                itemStr = `;${conds}`
            }
        }

        this.metaAction.sf('data.other.itemStr', fromJS(itemStr))
        let filter = {
            isReloadTree:false,
            accountType,
            influenceValue:itemStr,
            noGetInfluence: true
        }

        let isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
        let activeKeyArr = ['4000080001', '4000080002', '4000080003']
        if(isAutoAccount && activeKeyArr.indexOf(accountType)>-1){
            this.load( option )
        }else{
            this.load( filter )
        }

        this.scrollTop = 0
        document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop
    }
    renderSelect = () => {
        let factorArr = [],factorItem, nameArr=[]
        let influenceList = this.metaAction.gf('data.other.influenceList')
        let isSelected = this.metaAction.gf('data.other.isSelected')

        if(influenceList){
            influenceList = influenceList.size ?  influenceList.toJS() : influenceList
            influenceList.map((item, index) => {
                let name = item.code+'.influenceName'  

                let influenceName = this.metaAction.gf('data.form.'+name)
                if(!isSelected) influenceName = ''
                factorItem = <FormItem label={item.name}>
                                <Select
                                    showSearch={true}
                                    filterOption={this.filterOption}
                                    value={influenceName ? influenceName : '全部'}
                                    onChange={this.onFieldChange( index, item)}
                                >
                                    {this.handleSelect(item.influenceClassList)}
                                </Select>
                            </FormItem>
                factorArr.push(factorItem)
            })
        }
        
        return factorArr
    }
    filterOption = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}
    
    openCard = async (text, row, index) => {
        let isBatch = this.metaAction.gf('data.other.isBatch'), tableCheckbox, initButtionValue={}
        let influenceArr = [],influencetitArr = [], subject
        let isAutoAccount = this.metaAction.gf('data.other.isAutoAccount')
        let treeSelectedKey = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0]

        if(text == 'isBatch' && isBatch){  //批量
            tableCheckbox = this.metaAction.gf('data.tableCheckbox').toJS()
            let resAccountList = this.metaAction.gf('data.other.list').toJS(), accountList=[]
            if(!tableCheckbox.selectedOption.length) {
                this.metaAction.toast('error', '请选择需要批量修改的数据')
                return false
            }

            tableCheckbox.selectedOption.map((item,i)=>{
                accountList.push(resAccountList[item.key-1])
            })
            initButtionValue = {
                selectedOption: tableCheckbox.selectedOption,
                accountList,
                isBatch
            }
        }else{
            if('influence3' in row) influenceArr.push(row.influence3)
            if('influence2' in row) influenceArr.push(row.influence2)
            if('influence1' in row) influenceArr.push(row.influence1)
            if('influence0' in row) influenceArr.push(row.influence0) 
    
            let resAccountList = this.metaAction.gf('data.other.list').toJS()
            let {templateUserId, templateAccountTypeId, accountCode, influence, influenceValue, ts} = resAccountList[index]
            let glAccountId = ''
            if(resAccountList){
                resAccountList[0].influenceList.map((item)=>{
                    influencetitArr.push(item.influence)
                })
            }
            subject = row.subject 
            if(resAccountList[index].glAccountId) glAccountId = resAccountList[index].glAccountId
            initButtionValue = {
                influencetitArr,
                influenceArr,
                subject,
                templateUserId,
                templateAccountTypeId,
                accountCode,
                influence,
                influenceValue,
                ts,
                glAccountId,
                assetCardId: row.assetCardId,
                assetId: row.assetId,
                isAutoAccount: isAutoAccount,
                treeSelectedKey
            }
        }
        
		const ret =  await this.metaAction.modal('show', {
			title: '影响因素',
			wrapClassName: 'asset-card',
			width: 400,
			okText: '确定',
			bodyStyle: {padding: '10px 24px'},
			children: this.metaAction.loadApp('edfx-business-subject-card', {
				store: this.component.props.store,
                initButtionValue
			}),
        })
        if(ret){
            this.refresh(true) 
        }
    }

    BatchGenerateRevenueAccount = async () => {
        let tableCheckbox = this.metaAction.gf('data.tableCheckbox').toJS()
        let resAccountList = this.metaAction.gf('data.other.list').toJS(), accountList = []
        let data = this.metaAction.gf('data').toJS()
  
        if (!tableCheckbox.selectedOption.length) {
            this.metaAction.toast('error', '请选择需要批量修改的数据')
            return false
        }

        tableCheckbox.selectedOption.map((item, i) => {
            accountList.push(resAccountList[item.key - 1])
        })
        const ret =  await this.metaAction.modal('show', {
			title: '自动生成存货科目',
			wrapClassName: 'asset-card',
			width: 400,
			okText: '确定',
			bodyStyle: {padding: '10px 24px'},
			children: this.metaAction.loadApp('edfx-inventory-subject-card', {
                store: this.component.props.store,
                accountList: accountList
			}),
        })
        if(ret){
            if (ret.error && ret.error.message) {
                message.error(ret.error.message, 5)
                return
            }
            this.refresh(true)
            let subjectListParameter = {
                isEndNode : true,
                isEnable : true
            }
    
            let subjectList = await this.webapi.accountType.getSubject(subjectListParameter)
            let newSubject = []
            subjectList.glAccounts.map(item => {
                newSubject.push({
                    value: item.id,
                    label: item.codeAndName,
                    code: item.code
                })
            })
    
            this.metaAction.sf('data.subjectList', fromJS(newSubject))
            this.metaAction.toast('success', '自动生成存货科目成功')
        }
    }

    tableColumns = () => {
        let arr,id
        let pams = [this.influenceFactorSpan, this.subjectSpan, this.handle, this.getCalcRowSpanContent]
        this.injections.reduce('normalSearchChange', {
            path: 'colSpan',
            value: 2
        })

        let tableList = this.metaAction.gf('data.other.list')   //表格信息
        let influenceLabel = this.metaAction.gf('data.other.influenceList')  // select-label
        let isBatch = this.metaAction.gf('data.other.isBatch')
        let resAccountList = this.metaAction.gf('data.other.list')
        resAccountList ? (resAccountList.toJS().length == 0 ? id = 0 : id = resAccountList.toJS()[0].templateAccountTypeId) : id = 0
        this.metaAction.sf('data.id', id)
        if(tableList){
            return arr = renderColumns(id,isBatch,influenceLabel,tableList,...pams)
        }
    }

    // 合并行 
    getCalcRowSpanContent = (text, record, index) => {
        const num = this.calcRowSpan(record.influence0, 'influence0', index)
        const obj = {
            children: (
                <span title={text}>{text}</span>
            ),
            props: {
                rowSpan: num,
            },
        }
        return obj
    }
    calcRowSpan = (text, columnKey, currentRowIndex) => {
        let list = this.metaAction.gf('data.other.tableList')
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

    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if( item ){
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if( item ){
                newItemArr.push(item)
            }
        })
        this.injections.reduce('updateSelect', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: newArr,   
                selectedOption: newItemArr
            }
        })
        this.selectedOption = newItemArr
    }
    searchInventory = (v) => {
        this.metaAction.sf('data.other.conds', v)
        let itemStr = ''
        let accountType = this.metaAction.gf('data.other.treeSelectedKey').toJS()[0]
        let influenceName = this.metaAction.gf('data.form.inventoryProperty.influenceName')
        let influenceId = this.metaAction.gf('data.form.inventoryProperty.influenceId')
        
        if(influenceId!=undefined && influenceId!=0 && influenceId!=''){
            if(v){
                itemStr = `${influenceId};${v}`
            }else{
                itemStr = influenceId
            }
        }else if(v){
            itemStr = `;${v}`
        }
        let filter = {
            isReloadTree:false,
            accountType,
            influenceValue:itemStr,
            noGetInfluence: true
        }
        this.load( filter)
        this.scrollTop = 0
        document.getElementsByClassName('ant-table-body')[0].scrollTop = this.scrollTop
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	
	return ret
}