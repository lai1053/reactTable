import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox, Popover, Button} from 'edf-component'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import RenderTree from './component/RenderTree'
import moment from 'moment'
import { fetch } from 'edf-utils'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.handleInputValChange = debounce(this.handleInputValChange, 1000);
        // this.handleInputValSecondChange = debounce(this.handleInputValSecondChange, 1000);
    }

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        //console.info(this.component.props)

        if (this.component.props.setCancelLister) {
            // this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

        this.load()
        this.getpermission()
    }

    load = ()=>{
        this.loadFirst()
    }
    loadFirst = async ()=>{
        let newList = []
        this.injections.reduce('updateObj', {
            'data.list' : fromJS(newList),
            'data.loading' : true,
        })
        // this.metaAction.sf('data.loading',true)
        let type = this.metaAction.gf('data.checkedKeys.checked')
        let types = 'self'
        let inputVal = this.metaAction.gf('data.inputVal')
        let applyType = this.metaAction.gf('data.applyType')
        let pagination = this.metaAction.gf('data.pagination').toJS()
        const params = {
            entity:{
                departments:type,
                type:types,
                name:inputVal,
                ktzssqzt:applyType,
                searchDateStart:'',
                searchDateEnd:'',
            },
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const resp = await this.webapi.plktList(params)

        if(resp){
            this.injections.reduce('updateObj', {
                'data.list' : fromJS(resp.list),
                'data.pagination' : fromJS(resp.page),
                'data.loading':false
            })
        }else{
            this.injections.reduce('updateSingle', 'data.loading',false)
        }
    }
    loadSecond = async ()=>{
        this.injections.reduce('updateSingle', 'data.loading',true)
        let type = this.metaAction.gf('data.checkedKeysSecond.checked')
        let types = 'self'
        let inputVal = this.metaAction.gf('data.inputValSecond')
        let applyType = this.metaAction.gf('data.formContent.applyStatus')
        let searchDateStart = this.metaAction.gf('data.formContent.debitStartDate')
        let searchDateEnd = this.metaAction.gf('data.formContent.debitEndDate')
        let pagination = this.metaAction.gf('data.secondPagination').toJS()
        const params = {
            entity:{
                departments:type,
                type:types,
                name:inputVal,
                ktzssqzt:applyType,
                searchDateStart:searchDateStart,
                searchDateEnd:searchDateEnd,
            },
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const resp = await this.webapi.plktList(params)

        if(resp){
            this.injections.reduce('updateObj', {
                'data.secondList' : fromJS(resp.list),
                'data.secondPagination' : fromJS(resp.page),
                'data.loadingSecond':false
            })
        }else{
            this.injections.reduce('updateSingle', 'data.loadingSecond',false)
        }
    }

    changeSelectedTab = (val) => {
        this.injections.reduce('updateSingle', 'data.activeNo',val)
        switch (val){
            case '1':this.loadFirst();break;
            case '2':this.loadSecond();break;
            default:console.info(val);
        }
    }
    //申请列表树筛选
    renderTree = () => {
        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        let buttonName = this.metaAction.gf('data.buttonNameFirst');
        let checked = this.metaAction.gf('data.checkedKeys.itemChecked')
        this.injections.reduce('updateSingle', 'data.ifgs',permission.all ? '公司的客户' : '部门的客户')

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            defaultName={buttonName}
            checked={checked}
            handleCheckChanged={this.handleCheckChanged}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }
    handleCheckChanged = (val) => {
        this.injections.reduce('updateSingle', 'data.checkedKeys.itemChecked',val)
    }
    //打印委托书树筛选
    renderSecondTree = () => {
        let permission = this.metaAction.gf('data.other.permissionSecond').toJS();
        let showbm = this.metaAction.gf('data.showbmSecond');
        let buttonName = this.metaAction.gf('data.buttonNameSecond');
        let checked = this.metaAction.gf('data.checkedKeysSecond.itemChecked')
        this.injections.reduce('updateSingle', 'data.ifgsSecond',permission.all ? '公司的客户' : '部门的客户')

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            defaultName={buttonName}
            checked={checked}
            handleCheckChanged={this.handleSecondCheckChanged}
            onConfirm={this.handleSecondConfirm}
            onReset={this.handleSecondReset} />
    }
    handleSecondCheckChanged = (val) => {
        this.injections.reduce('updateSingle', 'data.checkedKeysSecond.itemChecked',val)
    }

    handleConfirm = (data,defaultName) => {
        this.injections.reduce('updateObj', {
            'data.checkedKeys.checked':data,
            'data.buttonNameFirst':defaultName
        })
        this.checkboxChange([],[])
        this.loadFirst();
    }
    handleSecondConfirm = (data,defaultName) => {
        this.injections.reduce('updateObj', {
            'data.checkedKeysSecond.checked':data,
            'data.buttonNameSecond':defaultName
        })
        this.loadSecond();
    }
    handleReset = (data) => {
        this.injections.reduce('updateObj', {
            'data.checkedKeys.checked':data,
            'data.checkedKeys.itemChecked':data,
            'data.buttonNameFirst':'分配给我的客户'
        })
        this.checkboxChange([],[])
        this.loadFirst();
    }
    handleSecondReset = (data) => {
        this.injections.reduce('updateObj', {
            'data.checkedKeysSecond.checked':data,
            'data.checkedKeysSecond.itemChecked':data,
            'data.buttonNameSecond':'分配给我的客户'
        })
        this.loadSecond();
    }

    //提交申请筛选查询
    handleInputValChange = (val) => {
        this.injections.reduce('updateSingle', 'data.inputVal',val.target.value)
        this.checkboxChange([],[])
        this.loadFirst()
    }
    handleApplyTypeChange = (val) => {
        this.injections.reduce('updateSingle', 'data.applyType',val)
        this.checkboxChange([],[])
        this.loadFirst()
    }
    //提交申请
    handleApplyCommit = async () => {
        this.injections.reduce('updateSingle', 'data.loading',true)
        let items = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS()
        if(items.length===0){
            this.metaAction.toast('warning', '请先选择客户');
            this.metaAction.sf('data.loading',false)
            return
        }
        if(items.some(item=>item.ktzssqzt === '002')){
            this.metaAction.toast('error', '申请失败：客户已经提交了申请，请勿重复申请');
            this.metaAction.sf('data.loading',false)
            return
        }
        let params = items.map(item=>{
            return {
                id:item.id,
                orgid:item.orgId,
                vatTaxpayer:item.vatTaxpayer,
                nsrsbh:item.nsrsbh,
                oldNsrsbh:item.oldVatTaxpayerNum,
                nsrmc:item.name,
                qydm:item.areaCode,
            }
        })

        let resp = await this.webapi.plktzs({idList:params})
        //console.info(resp)
        if(resp){
            this.metaAction.toast('info', '申请正在提交中，请稍后刷新状态查看提交结果');
            this.loadFirst()
        }
        this.injections.reduce('updateSingle', 'data.loading',false)
    }
    //提交刷新状态
    handleApplyRefresh = () => {
        let newChecked = []
        this.injections.reduce('updateObj', {
            'data.checkedKeys.checked':newChecked,
            'data.checkedKeys.itemChecked':newChecked,
            'data.inputVal':'',
            'data.applyType':'000',
            'data.showbm':'分配给我的客户',
            'data.buttonNameFirst':'分配给我的客户',
        })
        this.loadFirst()
    }
    //打印委托书筛选查询
    handleInputValSecondChange = (val) => {
        this.loadSecond()
    }
    handleSecondPopoverCommit = () => {
        this.injections.reduce('updateSingle', 'data.showPopoverCard',false)
        this.loadSecond()
    }
    handleSecondPopoverReset = () => {
        this.injections.reduce('updateObj', {
            'data.formContent.applyStatus':'005',
            'data.formContent.debitStartDate':'',
            'data.formContent.debitEndDate':'',
            'data.showPopoverCard':false
        })
        this.loadSecond()
    }
    //打印委托书更新状态
    handleApplySecondRefresh = async () => {
        let newChecked = []
        this.injections.reduce('updateObj', {
            'data.spinLoading':true,
            'data.checkedKeys.checked':newChecked,
            'data.checkedKeys.itemChecked':newChecked,
            'data.inputVal':'',
            'data.applyType':'000',
            'data.showbm':'分配给我的客户',
            'data.buttonNameFirst':'分配给我的客户'
        })
        let res = await this.loadSecond()
        // setTimeout(()=>this.metaAction.sf('data.spinLoading',false),5000)
        this.injections.reduce('updateSingle', 'data.spinLoading',false)
    }
    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        //debugger
        const res = await this.webapi.getfpkh(params)
        this.injections.reduce('updateObj', {
            'data.other.permission.treeData':res.body.bmxx,
            'data.other.permissionSecond.treeData':res.body.bmxx,
            'data.other.permission.all':res.body.all,
            'data.other.permissionSecond.all':res.body.all,
            // 'data.other.permission.self':res.body.self
            'data.maxde':res.body.bmxx[0].bmdm,
            'data.maxdeSecond':res.body.bmxx[0].bmdm
        })
    }

    renderColumns = () => {//绘制表格
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()

        column.forEach((item, index) => {
            if (item.isVisible) {
                if (item.id === 'operation') {
                    const showTableSetting = this.metaAction.gf('data.showTableSetting')
                    arr.push({
                        title: '操作',
                        className: 'operation',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        // fixed: 'right',
                        render: (text, record) => (
                            <span>
                                <a href="javascript:void(0)" onClick={() => {this.doItOpen(record)}}> 开通</a>
                            </span>
                        )
                    })
                }else if(item.id === 'ktzssqzt'){
                    arr.push({
                        title: item.caption,
                        className: 'psb',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        render:(text,record) =>{
                            let textList = {
                                '000':'',
                                '001':'未申请',
                                '002':'提交中',
                                '003':'提交成功',
                                '004':'提交失败',
                            }
                            return (
                                text==='004'?<span>
                                    {textList[text]}
                                    <Popover placement="bottom" content={record.ktzssbyy?record.ktzssbyy:'申请失败！'} overlayClassName='ttk-es-app-customer-digital-certificate-icon-popover'>
                                        <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#red',marginLeft:'5px'}}></Icon>
                                    </Popover>
                                    </span>:<span>{textList[text]}</span>
                            )}
                    })
                } else if(item.id === 'vatTaxpayer'){
                    arr.push({
                        title: item.caption,
                        className: 'nsrxx',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        render:(text,record) =>{
                            let textList = {
                                '2000010002':'小规模',
                                '2000010001':'一般纳税人'
                            }
                            return (
                                <span>{textList[text]}</span>
                            )}
                    })
                }
                else {
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => (this.renderTotalAmount(text, record, item)),
                        fixed: item.isFixed
                    })
                }
            }
        })
        return arr
    }
    renderSecondColumns = () => {//绘制表格
        const arr = []
        const column = this.metaAction.gf('data.secondColumns').toJS()

        column.forEach((item, index) => {
            if (item.isVisible) {
                if (item.id === 'operation') {
                    const showTableSetting = this.metaAction.gf('data.showTableSetting')
                    arr.push({
                        title: '操作',
                        className: 'operation',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        // fixed: 'right',
                        render: (text, record) => (
                            <span>
                                <a href="javascript:void(0)" onClick={() => {this.downloadPDFSimple(record)}}> 下载</a>
                                <a href="javascript:void(0)" onClick={() => {this.openViewApply(record)}}> 打印</a>
                            </span>
                        )
                    })
                }else if(item.id === 'ktzssqzt'){
                    arr.push({
                        title: item.caption,
                        className: 'psb',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        render:(text,record) =>{
                            let textList = {
                                '000':'',
                                '003':'申请中',
                                '006':'申请中',
                                '007':'已开通',
                                '008':'开通失败'
                            }
                            return (
                                text==='008'?<span>
                                    {textList[text]}
                                    <Popover placement="bottom" content={record.ktzssbyy?record.ktzssbyy:'开通失败！'} overlayClassName='ttk-es-app-customer-digital-certificate-icon-popover'>
                                        <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#red',marginLeft:'5px'}}></Icon>
                                    </Popover>
                                    </span>:<span>{textList[text]}</span>
                            )}
                    })
                }else if(item.id === 'psbState'){
                    arr.push({
                        title:(<span>票税宝</span>),
                        className: 'psb',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        render:(text,record) =>{
                            let txt = '';
                            if(text === '0'){
                                txt = '未开通'
                            }else {
                                txt = '已开通'
                            }
                            return (
                                <span>

                                    {
                                        <a href="javascript:"//查看
                                           onClick={() =>this.psbSetting(record.name,record.nsrsbh,record.orgId)}
                                        >
                                            {txt}</a>
                                    }

                            </span>
                            )}
                    })
                } else if(item.id === 'infoState'){
                    arr.push({
                        title:(<span>纳税人信息</span>),
                        className: 'nsrxx',
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        render:(text,record) =>{
                            let txt = '';
                            if(text === '0'){
                                txt = '未下载'
                            }else if(text === '2'){
                                txt = '下载失败'
                            }else {
                                txt = '查看'
                            }
                            return (
                                <span>

                                    {
                                        text === '0' ?//未下载
                                            <a href="javascript:"
                                               style={{color:'#666',cursor:'default',textDecoration:'none'}}
                                                // className={text === '查看'?'watchNS':''}
                                            >
                                                {txt}</a> :text === '2' ?//下载失败
                                            <a href="javascript:"
                                               style={{color:'red',cursor:'default',textDecoration:'none'}}
                                            >
                                                {txt}</a>:
                                            <a href="javascript:"//查看
                                               onClick={() =>this.openSetting(record.orgId)}
                                            >
                                                {txt}</a>
                                    }

                            </span>
                            )}
                    })
                }
                else {
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => (this.renderTotalAmount(text, record, item)),
                        fixed: item.isFixed
                    })
                }
            }
        })
        return arr
    }
    renderTotalAmount = (text, record, row) => {
        return <span title={text && row.amount ? utils.number.addThousPos(text, true, true) : text}>{text && row.amount ? utils.number.addThousPos(text, true, true) : text}</span>
    }
    pageChanged = (current, pageSize) => {
        this.injections.reduce('updateObj', {
            'data.pagination.currentPage': current || this.metaAction.gf('data.pagination.currentPage'),
            'data.pagination.pageSize': pageSize || this.metaAction.gf('data.pagination.pageSize')
        })
        this.loadFirst()
    }
    pageSecondChanged = (current, pageSize) => {
        this.injections.reduce('updateObj', {
            'data.secondPagination.currentPage': current || this.metaAction.gf('data.secondPagination.currentPage'),
            'data.secondPagination.pageSize': pageSize || this.metaAction.gf('data.secondPagination.pageSize')
        })
        this.loadSecond()
    }

    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        //console.info(arr)
        //console.info(itemArr)
        let argID = []
        arr.forEach(item => {
            if (item) {
                argID.push(item)
            }
        });
        let newItemArr = []

        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: argID,
                selectedOption: newItemArr
            }
        })
    }
    checkboxChangeSecond = (arr, itemArr) => {
        //console.info(arr)
        //console.info(itemArr)
        let argID = []
        arr.forEach(item => {
            if (item) {
                argID.push(item)
            }
        });
        let newItemArr = []

        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckboxSecond',
            value: {
                checkboxValue: argID,
                selectedOption: newItemArr
            }
        })
    }

    handlePopoverVisibleChange = (visible) => {
        // debugger
        // if (visible) {
        //     const { filterForm } = this.metaAction.gf('data').toJS()
        //     this.metaAction.sf('data.formContent', fromJS(filterForm))
        // }
        this.injections.reduce('updateSingle', 'data.showPopoverCard',visible)
    }

    disabledFirstDate = (current) => {
        let debitEndDate = this.metaAction.gf('data.formContent.debitEndDate')
        if(debitEndDate){
            return current > moment(debitEndDate).endOf('day');
        }else{
            return false
        }
    }
    disabledEndDate = (current) => {
        let debitStartDate = this.metaAction.gf('data.formContent.debitStartDate')
        if(debitStartDate){
            return current < moment(debitStartDate).endOf('day');
        }else{
            return false
        }
    }

    openViewApply = (record) => {
        const w = window.open('about:blank');
        w.location.href=record.zsxx;
    }
    openViewApplyBatch = (record) => {
        let records = this.metaAction.gf('data.tableCheckboxSecond.selectedOption').toJS()
        if(records.length===0){
            this.metaAction.toast('warning', '请选择需要打印委托书的客户');
            return
        }
        const w = window.open('about:blank');
        w.location.href=record.zsxx;
    }

    downloadPDFBatch = () => {
        let records = this.metaAction.gf('data.tableCheckboxSecond.selectedOption').toJS()
        if(records.length===0){
            this.metaAction.toast('warning', '请选择需要下载委托书的客户');
            return
        }
        // let files = ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png']
        let files = records.map(item=>item.zsxx)
        files.forEach(url => {
            // if (this.isIE()) { // IE
            //     console.info('IE')
            //     window.open(url, '_blank')
            // } else {
                let a = document.createElement('a') // 创建a标签
                let e = document.createEvent('MouseEvents') // 创建鼠标事件对象
                e.initEvent('click', false, false) // 初始化事件对象
                a.href = url // 设置下载地址
                a.download = '' // 设置下载文件名
                a.dispatchEvent(e)
            // }
        })
    }
    downloadPDFSimple = (record) => {
        if (record.zsxx) {
            // var iframeObject = document.getElementById('downloadPDF');
            // if (iframeObject) {
            //     iframeObject.src = record.zsxx;
            // }
            // else {
            //     var iframe = document.createElement('iframe');
            //     iframe.id = 'downloadPDF';
            //     iframe.frameborder = "0";
            //     iframe.style.width = "0px"
            //     iframe.style.height = "0px"
            //     iframe.src = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
            //     document.body.appendChild(iframe);
            // }
            // window.open(record.zsxx,'_blank')
            // this.downloadFile('https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png')
            this.downloadFile2(record.zsxx,'111.pdf')
        }
    }
    isIE = () => {
        return !!window.ActiveXObject || 'ActiveXObject' in window;
    }

    downloadBlob = (url) => {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest()
            xhr.open('GET', url)
            xhr.responseType = 'blob'

            xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve(xhr.response)
                } else {
                    reject(new Error(xhr.statusText || 'Download failed.'))
                }
            }
            xhr.onerror = function() {
                reject(new Error('Download failed.'))
            }
            xhr.send()
        })
    }
    downloadFile = (url, fileName = '') => {
        return this.downloadBlob(url, fileName)
            .then(resp => {
                if (resp.blob) {
                    return resp.blob()
                } else {
                    return new Blob([resp])
                }
            })
            .then(blob => URL.createObjectURL(blob))
            .then(url => {
                this.downloadURL(url, fileName)
                URL.revokeObjectURL(url)
            })
            .catch(err => {
                throw new Error(err.message)
            })
    }
    downloadURL = (url, name = '') => {
        const link = document.createElement('a')
        link.download = name
        link.href = url
        if ('download' in document.createElement('a')) {
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            // 对不支持download进行兼容
            this.click(link, (link.target = '_blank'))
        }
    }
    click = (node) => {
        try {
            node.dispatchEvent(new MouseEvent('click'))
        } catch (e) {
            var evt = document.createEvent('MouseEvents')
            evt.initMouseEvent(
                'click',
                true,
                true,
                window,
                0,
                0,
                0,
                80,
                20,
                false,
                false,
                false,
                false,
                0,
                null
            )
            node.dispatchEvent(evt)
        }
    }

    downPDF = (record) => {
        let a = document.createElement('a')
        a.herf = 'void(0)'
        var pdf = record.zsxx;
        document.getElementById('links').href = record.zsxx;
    }

    downloadFile1 = (fileurl, filename) => {
        var a = document.createElement('a');     
        a.download = filename;
        a.style.display = 'none';
        var  blob = new Blob(fileurl);                            // 字符内容转变成blob地址
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();                                                       // 触发点击
        document.body.removeChild(a);                  // 然后移除
    };
    downloadFile2 = (fileurl, filename) => {
        var form = document.createElement("form");
        document.getElementsByTagName('body')[0].appendChild(form);
        form.setAttribute('style', 'display:none');
        form.setAttribute('target', '');
        form.setAttribute('method', 'get');
        form.setAttribute('action', fileurl);//下载文件的请求路径
        var input1 = document.createElement('input');
        input1.setAttribute('type', 'hidden');
        input1.setAttribute('name', 'clinicId');
        input1.setAttribute('value', 'value');
        form.appendChild(input1);
        form.submit();
    };
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}