import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import {fromJS, toJS } from 'immutable'
import { GridInputDecorator } from '../../../components/index'
import { stockLoading, billDisabledDate, transToNum, getVoucherDateZGRK, formatSixDecimal} from '../../../commonAssets/js/common'
import utils from 'edf-utils'
import { moment as momentUtil } from 'edf-utils'
import { formatNumbe, formatprice } from '../../../common'
const colKeys = ['code', 'name', 'guige', 'unit', 'num', 'price', 'ybbalance']
import isEquall from 'lodash.isequal'
import extend from './extend'
import img from '../../../commonAssets/add.png'
import { blankDetail } from './data'
import { DataGrid, Icon, Select, Input } from 'edf-component'
import Column from 'antd/lib/table/Column'
import { Spin } from 'antd'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        if (extend.getGridOption()) {
            this.option = extend.getGridOption()
        }
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = async({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
		this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        this.unEditable = this.component.props.unEditable  // 是否结转出库凭证 
        this.voucherIds = this.component.props.voucherIds  // 是否已经生成凭证
        this.billBodyChNum = this.component.props.billBodyChNum
        this.chNum = this.component.props.chNum
        this.parentId = this.component.props.parentId
        this.id = this.component.props.id
        this.reqData = this.component.props.arr
        this.isFrom = (this.component.props.isFrom === 'StockAppCarryOverMainBusinessCost' ? true : false)
        this.selectList = []
        injections.reduce('init', this.parentId, this.isFrom)
        this.component.props.znzg && this.metaAction.sf("data.znzg", true)
        this.initData()
        this.load()
    }

    stockLoading=(param)=>stockLoading(param)
    
    // 是否生成凭证
    isVoucher = () => (!this.voucherIds)

    // 是否已结转出库凭证
    isCarryOver = ()=> this.unEditable

    /*@description: 一般表单是否可编辑 
    *   可编辑: (已经结转出库成本 或 已经生成凭证)
    *   不可编辑: (没有结转出库成本 && 并且没有生成凭证)
    * @return {boolen} true——可编辑； false——不可编辑
    */
    commonEditable = () =>{
        let condition = ( !this.isCarryOver() && this.isVoucher() )
        if(this.chNum){
            condition = (condition && !this.chNum)
        }
        return condition
        // return (!this.isCarryOver() && this.isVoucher() && this.billBodyChNum==0)  // 是否是既没有结转出库成本 && 也没生成凭证
    }

    /*@description: 日期是否可编辑 
    *   可编辑: (没有结转出库成本)
    *   不可编辑: (已经结转出库成本)
    * @return {boolen} true——可编辑； false——不可编辑
    */
    dateEditable = () =>(!this.isCarryOver())  // 没有结转主营成本

    // 六位小数
    formatSixFn=(num)=>{
        let ret = num ? formatSixDecimal(num) : ''  
        return ret
    }

    canInputStyle=()=> {
        const aa = (this.commonEditable() ? 'inputCell' : 'unInputCell')
        return aa
    }

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = (currentDate) => billDisabledDate(this, currentDate, 'data.formList.cdate')
    
    load = async() => {
        if (this.parentId) {
            let billBodyNum = 0
            let selectname = []
            let billBodyYbBalance = 0
            this.reqData.forEach((item, index) => {
                item.amount = formatNumbe(item.ybbalance)
                selectname.push(item.inventoryId)
                item.quantity = formatNumbe(item.num)
                billBodyNum = formatNumbe((formatNumbe(billBodyNum)+formatNumbe(item.num)),2)
                billBodyYbBalance = formatNumbe((formatNumbe(billBodyYbBalance)+formatNumbe(item.ybbalance)),2)
            })
            sessionStorage['inventoryNameList'] = selectname
            this.injections.reduce('load', this.reqData)
        } else if (this.id) {
            this.metaAction.sf('data.loading', true)
            let selectname = []
            const response = await this.webapi.operation.findBillTitleById({'serviceTypeCode': 'ZGRK', 'id': this.id})
            let data = []
            if(response && response.billBodys){
                data = JSON.parse(response.billBodys)
                data.forEach((item, index) => {
                    item.amount = item.ybbalance
                    item.quantity = item.num
                    selectname.push(item.inventoryId)
                })
            }
            
            this.injections.reduce('load', data, response)
            sessionStorage['inventoryNameList'] = selectname
            this.opstionList = await this.webapi.operation.findInventoryList({})
            this.renderSelectOptionInventory(this.opstionList, true)
            this.metaAction.sfs({
                'data.loading': false,
                'data.isEdit': 'readonly'
            })
        } else if (this.isFrom) {
            let billBodyNum = 0
            let selectname = []
            let billBodyYbBalance = 0
            this.reqData.forEach((item, index) => {
                selectname.push(item.inventoryId)
                item.amount = formatNumbe(item.qmBalance)
                item.quantity = formatNumbe(item.qmNum)
                item.price = formatNumbe(item.qmPrice)
                billBodyNum = formatNumbe((formatNumbe(billBodyNum) + formatNumbe(item.qmNum)), 2)
                billBodyYbBalance = formatNumbe((formatNumbe(billBodyYbBalance) + formatNumbe(item.ybbalance)), 2)
            })
            sessionStorage['inventoryNameList'] = selectname
            this.injections.reduce('load', this.reqData)
        } else {
            sessionStorage['inventoryNameList'] = []
            this.opstionList=await this.webapi.operation.findInventoryList({})
            this.renderSelectOptionInventory(this.opstionList, false)
        }
       
    }
    initData = async() => {
        const data = await this.webapi.operation.findSupplierList({})
        this.selectList = data
        this.renderSelectOption(data)
        if (!this.id) {
            let name = this.metaAction.context.get('currentOrg').name
            const currentMonth = sessionStorage['stockPeriod' + name]
            const cDate = getVoucherDateZGRK(currentMonth)
            this.enableDateChange('data.formList.cdate', cDate)
        }
        
    }
    renderSelectOption = (data) => {
        const arr = data.map(item => {
            return (
                <Option key={item.supplierId} value={item.supplierCode} title={item.supplierName}>
                   {item.supplierName}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
    }

    filterIndustry = (input, option) =>   
        option.props.children.indexOf(input) >= 0
    
    getSelectOption = () => this.selectOption
    
    addRow = (ps) => {
        let details = this.metaAction.gf('data.form.details').toJS(),
            index = ps.rowIndex + 1,
            item = blankDetail
        details.splice(index, 0, item)
        this.metaAction.sfs({'data.form.details': fromJS(details)})
    }
    onCancel = async() => {
        let list = this.metaAction.gf('data.form.details') && this.metaAction.gf('data.form.details').toJS() || []
        let cacheData = this.metaAction.gf('data.form.cacheData') && this.metaAction.gf('data.form.cacheData').toJS() || []
        let flag
        // 智能暂估的情况
        if (this.metaAction.gf("data.znzg")) flag = true
        // 新增的情况
        if (!this.id && !this.metaAction.gf("data.znzg")) {
            cacheData = []
            while (cacheData.length < 5) {
				cacheData.push(blankDetail)
			}
        }
        if (!isEquall(cacheData, list)) {
            const res = await this.metaAction.modal('confirm', {
                className: "haveData",
                content: (`当前界面有数据，请确认是否先进行保存`),
            })
            if (res) return false
        }
        this.component.props.closeModal && this.component.props.closeModal(flag)
    }

    onOk = async(type) => await this.save(type)
    
    save = async(type) => {
        this.metaAction.sf('data.loading', true)
        let reqList = {
            'serviceTypeCode': 'ZGRK',
            'code': '',
            'cdate': '',
            'supplierId': '1',
            'supplierName': '温州东旭阀门铸造有限公司',
            'operater': 'liucp',
            'billBodys': ''
        }
        var form = this.metaAction.gf('data.formList').toJS()
        const ok = await this.check([
            {
                path: 'data.formList.cdate', value: form.cdate
            },
            {
                path: 'data.formList.code', value: form.code
            }
        ])
        if (!ok) {
            this.metaAction.sf('data.loading', false)
            return false
        } 
        let list = this.metaAction.gf('data.form.details').toJS()
        let falg = true
        let falgName = true
        let NonNegative = true
        let arr = []
        list.forEach(item => {
            if(item.code){
                item.inventoryName=item.name
                item.inventoryId=item.id
                item.ybbalance=formatNumbe(item.amount)
                item.num=formatNumbe(item.quantity)
                item.price=formatNumbe(item.price)
                item.chNum=formatNumbe(item.chNum)
                arr.push(item)
                if (!(item.num && item.price && item.ybbalance)) {
                    falg = false
                }
                if (item.price < 0) {
                    NonNegative = false
                }
            }
        })
        
        if (arr.length == 0) {
            falgName = false
        }
        if (!falg) {
            this.metaAction.sf('data.loading', false)
            this.metaAction.toast('error', '数据有必填项未填写或数量金额为0')
            return false
        } 
        if (!NonNegative) {
            this.metaAction.toast('error', '单价不能为负数!')
            this.metaAction.sf('data.loading', false)
            return false
        } 
        if (!falgName) {
            this.metaAction.toast('error', '存货名称不能为空!')
            this.metaAction.sf('data.loading', false)
            return false
        }

        reqList.code=form.code
        reqList.cdate = form.cdate
        reqList.supplierName=form.supplierName
        reqList.supplierId=form.supplierId
        reqList.billBodys=JSON.stringify(arr)
        reqList.operater=form.operater
        let resp
        if (this.id) {
            reqList.id=this.id
            resp = await this.webapi.operation.updateBillTitle(reqList) 
        } else {
            resp = await this.webapi.operation.createBillTitle(reqList)
        }
        this.metaAction.sf('data.loading', false)
        if (resp) {
            if (type == 'saveAndNew') {
                if (this.id) this.id = ""
                this.injections.reduce('init')
                this.initData()
                this.metaAction.toast('success', '保存并新增成功')
				this.load()
			} else {
                this.metaAction.toast('success', '保存成功')
                this.component.props.closeModal(resp)
			}
        } else {
            return false
        }
    }
    check = async(fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return
        
        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.formList.cdate') {
                Object.assign(r, await this.checkCdate(o.value))
            }else{
                Object.assign(r, await this.checkSupplierName(o.value))
            }
            checkResults.push(r)
        }
        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)
        return hasError
    }

    checkCdate = async(code) => {
        var message

        if (!code)
            message = '请选择入库日期'

        return { errorPath: 'data.other.error.cdate', message }
    }
    checkSupplierName = async(name) => {
        var message

        if (!name)
            message = '请录入单据编号'

        return { errorPath: 'data.other.error.code', message }
    }
    handleChangeHwmc = (rowIndex, v) => {
        this.injections.reduce('updateSfs', v, rowIndex)
    }
    getCellClassName = (path) => {
        
        return this.metaAction.isFocus(path) ? 'ttk-edf-app-operation-cell editable-cell' : ''
    }
    enableDateChange = async(path, data) => {
        let enableDate = momentUtil.stringToMoment(data).format('YYYY-MM')
        const response = await this.webapi.operation.findBillTitleNum({'serviceTypeCode': 'ZGRK', 'period': enableDate})
        this.metaAction.sfs({
            [path]: data,
            'data.formList.code': response,
            'data.loading': false
        })
    }
    selectOption = async(path,data) => {
        let id=''
        this.selectList.forEach(item => {
            if(item.supplierCode==data){
                id=item.supplierId
                return
            }
        })
        this.metaAction.sf(path,data)
        this.metaAction.sf('data.formList.supplierId',id)
    }
    numChange = async(col, rowIndex,path, data,value,params) => {
        data.num=utils.number.format(value,2)
        if (data.price) {
            data.ybbalance=utils.number.format(data.price*data.num,2)
        }
        this.injections.reduce('update',path,data)
        params = Object.assign(params, {
            value: value
        })
        this.voucherAction.calc(col, rowIndex, data, params,2)
        let param=Object.assign(params, {
            value:formatNumbe( data.ybbalance)
        })
        this.voucherAction.calc('amount', rowIndex, data, param,2)
        
    }
    ybbalanceChange = async(col, rowIndex,path, data,value,params) => {
        data.ybbalance=utils.number.format(value,2)
        if (data.price) {
            data.num=utils.number.format(data.ybbalance/data.price,2)
        }
        this.injections.reduce('update',path,data)
        params = Object.assign(params, {
            value: value
        })
        this.voucherAction.calc(col, rowIndex, data, params,2)
        let param=Object.assign(params, {
            value:formatNumbe( data.num)
        })
        this.voucherAction.calc('quantity', rowIndex, data, param,2)
    }
    priceChange = async(rowIndex,path,data,value,params) => {
        data.price=utils.number.format(value,2)
        if(data.num){
            data.ybbalance=utils.number.format(data.price*data.num,2)
        }else{
            if(data.ybbalance){
                data.num=utils.number.format(data.ybbalance/data.price,2)
            }
        }
        this.injections.reduce('update',path,data)
        params = Object.assign(params, {
            value: formatNumbe( data.ybbalance)
        })
        this.voucherAction.calc('amount', rowIndex, data, params,2)
        let param=Object.assign(params, {
            value:formatNumbe( data.num)
        })
        this.voucherAction.calc('quantity', rowIndex, data, param,2)
        
    }
    calc = (col, rowIndex, rowData, params) => (v) => {
		params = Object.assign(params, {
			value: v
		})
		this.voucherAction.calc(col, rowIndex, rowData, params)
    }
    quantityFormat = (quantity, decimals, isFocus) => {
		if (quantity) {
            if(isFocus=='price'){
                return formatprice(quantity,decimals)
            }else{
                return formatNumbe(quantity,decimals)
            }
		}
    }
    btnClicklist = async(id)  => {
        const ret = await this.metaAction.modal('show', {
                title: '存货名称选择',
                width: 950,
                height: 520,
                style: { top: 50 },
                children: this.metaAction.loadApp('ttk-stock-app-inventory-intelligence', {
                    store: this.component.props.store,                    
                })
        })
        if (ret) {
            this.injections.reduce('updateSfs', ret, id, "btnClicklist")
            this.renderSelectOptionInventory(this.opstionList,true)
        }
    }
    btnClick = (id) => (e) => {
        this.btnClicklist(id)
    };
    selectOptionInventory = async(rowIndex,e,value) => {
        
        let list = []
        this.opstionList.forEach(item => {
            if(item.inventoryCode==e){
                item.disabled=true
                list.push(item)
                return
            }
            if(item.inventoryName==value){
                item.disabled=false
                return
            }
        })
        this.renderSelectOptionInventory(this.opstionList)
        this.injections.reduce('updateSfs', list, rowIndex)
        
    }
    renderSelectOptionInventory = (data,falg) => {
        this.metaAction.sf('data.fetching', true)
        if(sessionStorage['inventoryNameList'].length>0&&falg){
            data.forEach(item=>{
                item.disabled = (sessionStorage['inventoryNameList'].indexOf(item.inventoryId)>-1) ? true : false
            })
        }
        const arr = data.map(item => {
            const {inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit} = item
            const objArr = [inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit]
            const contentText = objArr.filter(v=>!!v).join('-')
            return (
                <Option width={200} key={item.inventoryId} value={item.inventoryCode} 
                        title={contentText} disabled={item.disabled?true:false}
                >
                    {contentText}
                </Option>
            )
        })
        this.selectOptionInventory = arr
        this.metaAction.sfs({
            'data.other.key': Math.floor(Math.random() * 10000),
            'data.fetching': false
        })
    }
    renderStockNameAdd = () => {
        return (
            <div className="stock-app-select-add-btn" onClick={this.addStockName}>
                <img src={img}/>
                <i className="add-img"></i>
                <span>新增</span>
            </div>
        )
    }
    addStockName = async() => {
        const ret = await this.metaAction.modal('show', {
			title: '新增存货档案',
			wrapClassName: 'card-archive',
			width: 700,
			height: 520,
			footer: '',
			children: this.metaAction.loadApp('ttk-app-inventory-card', {
				store: this.component.props.store,
				initData: null,  // 编辑/新增
			})
        })
        if (ret) {
            this.opstionList = await this.webapi.operation.findInventoryList({})
            const flag = this.id ? true : false
            this.renderSelectOptionInventory(this.opstionList, flag)
        }
    }
    //过滤行业
    filterIndustryInventory = (input, option) => (option.props.children.indexOf(input) >-1)

    getSelectOptionInventory = () => this.selectOptionInventory

    delRow = (gridName) => (ps) => {
        // debugger
        var list = this.metaAction.gf('data.form.details').toJS()
        let selectname=[] 
        list.forEach((item,index) => {
            if(item.id&&index!= ps.rowIndex){
                selectname.push(item.id)
            }
        })
        sessionStorage['inventoryNameList']=selectname
        this.renderSelectOptionInventory(this.opstionList,true)
        this.injections.reduce('delect', ps.rowIndex)
    }
    mousedown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path), path.indexOf('name') > -1 ? true : false)
        }
        else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }

    getCellInfo (path) {
        const parsedPath = utils.path.parsePath(path)
        const rowCount = this.metaAction.gf('data.form.details').size
        const colCount = 7
        // debugger
        var colKey = ''
        if (parsedPath.path.indexOf('name') > -1) {
            colKey = parsedPath.path
            .replace('root.children.content.children.details.columns.', '')
            .replace('.cell.cell', '')
            .replace('.children.input', '')
            .replace(/\s/g, '')
            this.flag = true
        } else {
            colKey = parsedPath.path
            .replace('root.children.content.children.details.columns.', '')
            .replace('.cell.cell', '')
            .replace(/\s/g, '')
            this.flag = false
        }

        return {
            x: colKeys.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }

    focusCell (position, falg) {
        if (falg) {
            this.metaAction.sfs({
                'data.other.focusFieldPath': `root.children.content.children.details.columns.${colKeys[position.x]}.cell.cell.children.input,${position.y}`,
                'data.other.scrollToRow': position.y,
                'data.other.scrollToColumn': position.x
            })
        } else {
            this.metaAction.sfs({
                'data.other.focusFieldPath': `root.children.content.children.details.columns.${colKeys[position.x]}.cell.cell,${position.y}`,
                'data.other.scrollToRow': position.y,
                'data.other.scrollToColumn': position.x
            })
        }
        setTimeout(this.cellAutoFocus, 16)
    }

    gridKeydown = (e) => {
        if (!this.option)
            return

        var path = ''

        if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40) {
            path = utils.path.findPathByEvent(e)
            if (!path || path.indexOf(',') == -1) return
        }

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, 'left')
            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {
            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            if (path) {
                let columnGetter = this.metaAction.gm(path)
                if (columnGetter) {
                    if (columnGetter.noTabKey == true) {
                        return
                    }
                }
            }

            this.moveEditCell(path, 'right')
            return
        }

        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(path, 'up')
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(path, 'down')
            return
        }

    }

    moveEditCell (path, action) {
        const cellInfo = this.getCellInfo(path)
        this.moveCell(cellInfo, action, path)
    }

    moveCell (cellInfo, action, path) {
        const position = utils.matrix.move(cellInfo.rowCount, cellInfo.colCount, { x: cellInfo.x, y: cellInfo.y }, action)
        this.focusCell({ ...cellInfo, ...position }, this.flag)
    }

    cellAutoFocus = () => {
        this.gridCellAutoFocus(this.component, '.inputSelectonClick')
    }

    gridCellAutoFocus (container, editCtrlClassName, position, path) {
        let containerObj = ReactDOM.findDOMNode(container)
        if (!containerObj) return
        let editorDOM = containerObj.querySelector(editCtrlClassName)

        if (!editorDOM) return
        // if (!editorDOM) {
        //     editorDOM = containerObj.querySelector(".tdChme")
        //     if (!editorDOM) return
        //     if (editorDOM.className.indexOf('tdChme') != -1) {
        //         const input = editorDOM.querySelector('.mk-datagrid-cellContent')
        //         input && input.click()
        //         return
        //     }
        // }
        
        if (editorDOM.className.indexOf('mk-select') != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector('.ant-select-selection')
            input && input.select()
            return
        }

        if (editorDOM.className.indexOf('input') != -1) {
            if (editorDOM.getAttribute('path')) {
                if (editorDOM.getAttribute('path').indexOf('creditAmount') > -1 || editorDOM.getAttribute('path').indexOf('debitAmount') > -1) {
                    window.setTimeout(function () {
                        editorDOM.blur()
                        editorDOM.select()
                        return
                    }, 10)
    
                }
            }
            if (editorDOM.select) {
                editorDOM.select();
            } else {
                const input = editorDOM.querySelector('input')
                input && input.select();
            }
            return
        }
    
        if (editorDOM.className.indexOf('select') != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector('input')
            input && input.select()
            return
        }
        
        if (editorDOM.className.indexOf('datepicker') != -1) {
            const input = editorDOM.querySelector('input')
            input.click()
            return
        }
    
        if (editorDOM.className.indexOf('checkbox') != -1) {
            const input = editorDOM.querySelector('input')
            input.focus()
            return
        }
    
        if (editorDOM.className.indexOf('cascader') != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector('input')
            input && input.select()
            return
        }
    }

    renderTable=()=>{
        const data = this.metaAction.gf('data') && this.metaAction.gf('data').toJS()
        const {form} = data
        this.listData = form.details
        const {Column, Cell} = DataGrid
        const cols = [
            <Column
                flexGrow={1}
                width={35}
                align='left'
                isResizable={false}
                header={<Cell className='dataGrid-tableHeaderNoBoder'>存货编号</Cell>}
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {code} = record[rowIndex]
                        return (
                            <Cell 
                                className="inputSelectClass"
                                value={code}
                                title={code}
                                onChange={(e)=>this.metaAction.sf('data.form.details.' + rowIndex + '.code', e.target.value)}
                            />
                        )
                    }
                }
            ></Column>,
            <Column
                flexGrow={1}
                width={180}
                align='left'
                header={<Cell className={this.commonEditable() && 'ant-form-item-required'}>存货名称</Cell>}
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {name} = record[rowIndex]
                        // if(this.metaAction.isFocus(_ctrlPath) && this.commonEditable()){
                        if( this.commonEditable()){
                            return(
                                <div className='tdChme editable'>
                                    <Select
                                        showSearch={true}
                                        className='selectName'
                                        dropdownMatchSelectWidth={false}
                                        dropdownClassName="selectNameDivDropdown"
                                        dropdownStyle={{width: 'auto'}}
                                        notFoundContent={
                                            <Spin size='small' spinning={data.fetching} delay={1}></Spin>
                                        }
                                        // _excludeProps= {this.metaAction.isFocus(_ctrlPath)? ['onClick'] : ['children'] }
                                        title= {name}
                                        value= {name}
                                        filterOption= {this.filterIndustryInventory}
                                        onSelect={function(e){this.selectOptionInventory(rowIndex, e, name)}}
                                        dropdownFooter= {
                                            <div className='ttk-stock-app-inventory-assessment-add-stockName-add'>
                                                {this.renderStockNameAdd()}
                                            </div>     
                                        }
                                    >
                                        {this.getSelectOptionInventory()}
                                    </Select>
                                    {
                                        this.commonEditable() &&
                                        <div className='selectMoreName' disabled={data.disabled} onClick={this.btnClick(rowIndex)} >
                                            <Icon type="ellipsis"  borderRadius='4px'></Icon>
                                        </div>
                                    }
                                </div>
                            )
                        }else{
                            return (
                                <div className='tdChme'>
                                    <Cell title={name} value={name}/>
                                </div>
                            )
                        }
                    }
                }
    
            ></Column>,
            <Column
                flexGrow={1}
                width={75}
                align='left'
                header={
                    <Cell className='dataGrid-tableHeader'>规格型号</Cell>
                }
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {guige} = record[rowIndex]
                        return(
                            <Cell
                                align='left'
                                className= 'inputSelectClass'
                                title={guige}
                                value={guige}
                            ></Cell>
                        )
                    }
                }
            ></Column>,
            <Column
                flexGrow={1}
                width={75}
                align='left'
                sResizable={false}
                header={
                    <Cell className='dataGrid-tableHeaderNoBoder'>单位</Cell>
                }
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {unit} = record[rowIndex]
                        return(
                            <Cell
                                align='left'
                                className= 'inputSelectClass'
                                title={unit}
                                value={unit}
                            ></Cell>
                        )
                    }
                }
    
            ></Column>,
            <Column
                flexGrow={1}
                width={75}
                align='center'
                header={
                    <Cell className={this.commonEditable() && 'ant-form-item-required'} >数量</Cell>
                }
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {quantity} = record[rowIndex]
                        if(this.commonEditable()){
                            return (
                                <Input.Number
                                    align='left'
                                    timeout={true}
                                    tip={true} 
                                    style={{
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '0'
                                    }}
                                    precision={6} 
                                    interceptTab={true}
                                    // className= { ( this.metaAction.isFocus(_ctrlPath) && this.commonEditable() ) ? 'inputSelectonClick' : 'inputSelectClass'}
                                    className= { ( this.commonEditable() ) ? 'inputSelectonClick alignLeft' : 'inputSelectClass alignLeft'}
                                    title={this.quantityFormat(quantity)}
                                    value={this.quantityFormat(quantity)}
                                    onBlur={this.voucherAction.calc("quantity", rowIndex, record)}
                                ></Input.Number>
                            )
                        }else{
                            return (
                                <Cell
                                    align='left'
                                    className='inputSelectClass'
                                    title={this.quantityFormat(quantity)}
                                    value={this.quantityFormat(quantity)}
                                ></Cell>
                            )
                        }
                    }
                }
                footer= {
                    <Cell
                        align='left'
                        className= 'alignLeft'
                        title={this.voucherAction.sumColumn("quantity")}
                        value={this.voucherAction.sumColumn("quantity")}
                    ></Cell>
                    
                }
            ></Column>,
            <Column
                flexGrow={1}
                width={75}
                align='center'
                header={ <Cell className={this.commonEditable() && 'ant-form-item-required'}>单价</Cell>}
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {price} = record[rowIndex]
                        if(this.commonEditable()){
                            return <Input
                                align='right'
                                precision={6}
                                style={{
                                    textAlign: 'right',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '0'
                                }} 
                                timeout={true}
                                tip={true}
                                regex= '^([0-9]+)(?:\.[0-9]{1,6})?$'
                                // className= {this.metaAction.isFocus(_ctrlPath) ? 'inputSelectonClick' : 'inputSelectClass'}
                                title={this.quantityFormat(price)}
                                value={this.quantityFormat(price)}
                                onBlur={this.voucherAction.calc("price", rowIndex,record)}
                                
                            ></Input>
                        }else{
                            return (
                                <Cell
                                    align='right'
                                    timeout={true}
                                    tip={true}
                                    className='inputSelectClass'
                                    title={this.quantityFormat(price)}
                                    value={this.quantityFormat(price)}
                                ></Cell>
                            )
    
                        }
                    }
                }
               
            >
            </Column>,
            <Column
                flexGrow={1}
                width={75}
                align='center'
                header={
                    <Cell className={this.commonEditable() && 'ant-form-item-required'}>金额</Cell>
                }
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {amount} = record[rowIndex]
                        if(this.commonEditable()){
                            return(
                                <Input.Number
                                    align='right'
                                    style={{
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '0'
                                    }}
                                    min={0}
                                    timeout={true}
                                    tip={true}
                                    precision={2}
                                    interceptTab={true}
                                    // className= { ( this.metaAction.isFocus(_ctrlPath) && this.commonEditable() ) ? 'inputSelectonClick' : 'inputSelectClass'}
                                    className= { (this.commonEditable() ) ? 'inputSelectonClick' : 'inputSelectClass'}
                                    value={this.quantityFormat(amount,2)}
                                    title={this.quantityFormat(amount,2)}
                                    onBlur={this.voucherAction.calc("amount", rowIndex, record)}
                                >
                                </Input.Number>
                            )
                        }else{
                            return(
                                <Cell
                                    align='right'
                                    tip= {true}
                                    className='inputSelectClass'
                                    value={this.quantityFormat(amount,2)}
                                    title={this.quantityFormat(amount,2)}
                                ></Cell>
                            )
                        }
                    }
                }
                footer={
                    <Cell
                        className = 'mk-datagrid-cellContent-right'
                        value ={this.voucherAction.sumColumn("amount")}
                        title= {this.voucherAction.sumColumn("amount")}
                    ></Cell>
                }
            ></Column>,
            <Column
                flexGrow={1}
                width={75}
                align='center'
                header={
                    <Cell className= {this.commonEditable() && 'ant-form-item-required'}>冲回数量</Cell>
                }
                cell={
                    ({rowIndex})=>{
                        const record = this.listData 
                        const {chNum} = record[rowIndex]
                        return (
                            <Cell
                                align='right'
                                style={{
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '0'
                                }}
                                timeout={true}
                                tip={ true }
                                interceptTab={true}
                                className='inputSelectClass'
                                value={this.quantityFormat(chNum,2)}
                                title={this.quantityFormat(chNum,2)}
                            ></Cell>
                        )
                    }  
                }
                footer={
                    <Cell 
                        className= 'mk-datagrid-cellContent-right'
                        value= {this.voucherAction.sumColumn("chNum")}
                        title= {this.voucherAction.sumColumn("chNum")}
                    ></Cell>
                }
            >
            </Column>
        ]
    
        return(
            <DataGrid
                scroll= {data.tableOption}
                ellipsis={true}
                className= 'ttk-stock-app-inventory-assessment-add-Body'
                rowsCount= {data.form.details.length}
                headerHeight= {35}
                rowHeight={35}
                footerHeight={35}
                enableSequence={true}
                readonly={false}
                startSequence={1}
                enableSequenceAddDelrow= {this.commonEditable()}
                onAddrow={this.addRow}
                onDelrow= {this.delRow}
                // onUprow={this.metaAction.upRow("details")}
                // onDownrow={this.metaAction.downRow("details")}
                onKeyDown={this.gridKeydown}
                sequenceFooter= { <Cell>合计</Cell> }
                key= {data.other.detailHeight}
                readonly= { false }
                columns={cols}
                scrollToColumn={data.other.detailsScrollToColumn}
                scrollToRow={data.other.detailsScrollToRow}
                allowResizeColumn 
            ></DataGrid>
        )
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = GridInputDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}