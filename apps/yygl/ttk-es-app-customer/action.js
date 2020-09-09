import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS, toJS, is } from 'immutable'
import { Icon, Tooltip, Dropdown, Menu,Popover,LoadingMask} from 'edf-component'
import { message, Modal } from 'antd'
import LoadInvoice from './component/LoadInvoice'
import config from './config'
import { columns, generalBtnType, smallBtnType, Tips } from './fixedData'
import SetLimit from './component/SetLimit'
import RenderTree from './component/RenderTree'
import utils from "edf-utils";
import moment from 'moment'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        this.getpermission();
        this.initPage()
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener;
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.initPage);
        }
        this.getJCYMParam()
        // this.getCustomerPermission('all')
    }
    initPage = () => {
        // this.metaAction.sf('data.nsqj', '')
        let filterFormOld = this.metaAction.gf('data.filterFormOld').toJS()
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1

        this.injections.reduce('updateObj', {
            'data.serviceCode': '1',
            'data.filterForm': fromJS(filterFormOld),
            'data.pagination': fromJS(pagination),
            'data.inputVal': ''
        })
        this.getColumns()
        this.load()

    }
    handleConfirm = (data) => {
        //权限管理点击确认
        // console.log(data);
    }
    handleReset = (data) => {
        //权限管理点击重置
        // console.log(data)
    }
    //分配给我的、公司的客户、部门的客户
    renderTree = () => {
        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.injections.reduce('updateSingle', 'data.ifgs',permission.all ? '公司的客户' : '部门的客户')

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }
    handleConfirm = (data) => {
        //权限管理点击确认
        this.injections.reduce('updateSingle', 'data.checkedKeys.checked',data)
        let checked=this.metaAction.gf('data.checkedKeys.checked');
        let ifgs = this.metaAction.gf('data.ifgs')
        this.load();
    }
    handleReset = (data) => {
        //权限管理点击重置
        // console.log("11111111111111");
        this.injections.reduce('updateSingle', 'data.checkedKeys.checked',data)
        //console.log(data)
        this.load();
    }

    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        //debugger
        const res = await this.webapi.customer.getfpkh(params)

        this.injections.reduce('updateObj', {
            'data.other.permission.treeData':res.body.bmxx,
            'data.other.permission.all':res.body.all,
            // 'data.other.permission.self':res.body.self
            'data.maxde':res.body.bmxx[0].bmdm
        })
    }

    getColumns = () => {

        const serviceCode = this.metaAction.gf('data.serviceCode')
        // const pageID = serviceCode === '1' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // const resp = await this.webapi.invoice.queryColumnVo({
        //     pageID
        // })
        // if (!this.mounted) return
        const columnData = this.metaAction.gf('data.columnData').toJS()
        this.injections.reduce('updateSingle', 'data.columns', fromJS([]))
        let columns = null
        let orgDataSourceType = this.metaAction.context.get("currentOrg").orgDataSourceType;
        if(orgDataSourceType){
            if(orgDataSourceType == 'FZYM'){
                columns = columnData[serviceCode].columnsfzym
            }else {
                columns = columnData[serviceCode].columns
            }
        }else {
            columns =  columnData[serviceCode].columns
        }

        // this.metaAction.sf('data.visibleColumns', fromJS(columnData[serviceCode].columnsOld))
        // if (resp) {
        //     const data = JSON.parse(resp.columnjson)
            // this.metaAction.sf('data.visibleColumns', fromJS(data))
            // columns.forEach(item => {
            //     const idx = data.indexOf(item.id)
            //     item.isVisible = idx !== -1
            // })
        // }
        this.injections.reduce('updateSingle', 'data.columns', fromJS(columns))
        setTimeout(() => {
            this.onResize()
        }, 50)
    }
    load = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        const inputVal = this.metaAction.gf('data.inputVal')//输入的客户名称或是助记码
        const serviceCode = this.metaAction.gf('data.serviceCode')//正常客户和停用客户
        const filterForm = this.metaAction.gf('data.filterForm').toJS()//隐藏筛选条件
        const areaCode = this.metaAction.gf('data.area').toJS()//所属区域
        // const khRange = this.metaAction.gf('data.khRange')
        let areaQuery = await this.webapi.customer.areaQuery({})//地区选择
        if(areaQuery){//地区选择
            // console.log('......',areaQuery)
            this.injections.reduce('updateSingle', 'data.other.areaQueryArr', fromJS(areaQuery))
        }
        // console.log('我是筛选数据',filterForm.customerTypeStatus)
        let type = this.metaAction.gf('data.checkedKeys.checked'),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all')

        const btnType = serviceCode === '1' ? generalBtnType : smallBtnType
        this.injections.reduce('updateSingle', 'data.btnType', fromJS(btnType))

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde  && all=="all"){
                types = 'all'
            }
        }
        sessionStorage.setItem('qxType',types)
        const params = {
            entity:{
                "departments":type,
                type:types,
                serviceCode:serviceCode,
                vatTaxpayer:filterForm.customerTypeStatus,
                infoState:filterForm.nsrMessStatus,
                sfdm:filterForm.sfdm,
                csdm:filterForm.csdm,
                qxdm: filterForm.qxdm,
                name:inputVal,
                khsx: filterForm.serviceTypeStatus,
                sjhmlx:filterForm.fjbssjhyzStatus,
                gsmmjyjg:filterForm.gsmmjyStatus

            },
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        this.getCustomerPermission(types)
        const resp = await this.webapi.customer.queryCustomer(params)
        // const permission = await this.webapi.invoice.queryPermission();
        if (!this.mounted) return
        // if (permission) {
            //this.injections.reduce('update', 'data.other.permission', permission);
        // }
        if (resp) {
            // this.metaAction.sf('data.list',fromJS(resp.list));
            let downloadNSRXX = resp.list.filter(item=>item.infoState==='3').map(item=>item.id)
            console.info(downloadNSRXX)

            this.injections.reduce('updateObj', {
                'data.list' : fromJS(resp.list),
                'data.pagination' : fromJS(resp.page),
                'data.downloadNSRXX' : fromJS(downloadNSRXX),
                'data.tableCheckbox':fromJS({
                    checkboxValue: [],
                    selectedOption: []
                })
            })
            // console.log('我是查询数据',resp.list)
            // this.injections.reduce('update', {
            //     path: 'data.tableCheckbox',
            //     value: {
            //         checkboxValue: [],
            //         selectedOption: []
            //     }
            // })
            this.injections.reduce('load', resp)
            setTimeout(() => {
                this.onResize()
                this.injections.reduce('tableLoading', false)
            }, 50)
        } else {
            this.injections.reduce('tableLoading', false)
        }
        let currentOrg = this.metaAction.context.get("currentOrg");
        console.info(currentOrg,'currentOrg')
        if(currentOrg.quantity > 0){
            // let total = await this.webapi.customer.queryCustomerZtCnt();
            // console.info(total)
            // if(total){
                if(currentOrg.normalQuantity > currentOrg.quantity){
                    this.injections.reduce('updateObj', {
                        'data.excessStatus' : true,
                        'data.excess.normal' : currentOrg.normalQuantity,
                        'data.excess.number' : currentOrg.quantity,
                    })
                }
            // }
        }
    }
    tabChange = (e) => {//正常客户和 停用客户切换
        // console.log('我是e',e)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        const { filterFormOld } = this.metaAction.gf('data').toJS()
        const btnType = e === '1' ? generalBtnType : smallBtnType

        this.injections.reduce('updateObj', {
            'data.columns': fromJS([]),
            'data.loading': true,
            'data.serviceCode': e,
            'data.pagination': fromJS(pagination),
            'data.filterForm': fromJS(filterFormOld),
            'data.inputVal': '',
            'data.btnType': fromJS(btnType),
            'data.list': fromJS([]),
            'data.showTableSetting':false
        })
        this.load()
        this.getColumns()
        this.resetForm();
    }
    onSearch = () => {
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('updateObj', {
            'data.loading': true,
            'data.pagination': fromJS(pagination)
        })
        this.load()
    }

    // confirmRegisteredCounty = (code) => {
    //     let areaQueryMap = this.metaAction.gf('data.other.areaQueryMap').toJS()
    //     if(areaQueryMap[code]){
    //         console.log('颠三倒四',areaQueryMap[code].loginTypeArr)
    //         this.metaAction.sfs({
    //             'data.other.loginTypeRelation': fromJS(areaQueryMap[code].loginTypeArr),
    //             'data.form.dlfs': fromJS(areaQueryMap[code].loginTypeArr.length > 0 && areaQueryMap[code].loginTypeArr[0])
    //         });
    //     }else {
    //         this.confirmRegisteredCounty(code.slice(0,code.length - 2))
    //     }
    // }

    //设置地址
    setAddress = (e) => {
        // debugger
        let address = e.toJS()
        // this.confirmRegisteredCounty(address.districts)
        this.injections.reduce('updateObj', {
            'data.area.registeredProvincial': address.provinces,
            'data.area.registeredCity': address.citys,
            'data.area.registeredCounty': address.districts,
            'data.area.registeredAddress': address.text,
            'data.formContent.sfdm':address.provinces,
            'data.formContent.csdm':address.citys,
            'data.formContent.qxdm':address.districts,
        })
        // console.log('ddd',address)
    }
    handleMonthPickerChange = (e, strTime) => {
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('updateObj', {
            'data.loading': true,
            'data.nsqj': e,
            'data.pagination': fromJS(pagination)
        })
        this.load()
    }
    handlePopoverVisibleChange = (visible) => {
        // debugger
        if (visible) {
            const { filterForm } = this.metaAction.gf('data').toJS()
            this.metaAction.sf('data.formContent', fromJS(filterForm))
            this.injections.reduce('updateObj', {
                'data.formContent': fromJS(filterForm),
                'data.showPopoverCard': visible
            })
        }else{
            this.injections.reduce('updateSingle', 'data.showPopoverCard', visible)
        }
    }
    resetForm = () => {//重置
        const { filterFormOld, formContent } = this.metaAction.gf('data').toJS()
        Object.assign(formContent, filterFormOld)

        this.injections.reduce('updateObj', {
            'data.formContent': fromJS(formContent),
            'data.area.registeredProvincial': '',
            'data.area.registeredCity': '',
            'data.area.registeredCounty': '',
        })
    }
    filterList = () => {//查询
        this.injections.reduce('tableLoading', true)
        const { formContent } = this.metaAction.gf('data').toJS()
        this.injections.reduce('updateObj', {
            'data.filterForm': fromJS(formContent),
            'data.showPopoverCard': false,
            'data.pagination.currentPage': 1,
        })
        this.load()
    }
    judgeChoseBill = async(type) => {
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if (type !== 'addCustomer'
            && type !== 'importCustomer'
            && type !== 'exportCustomer'
            && type !== 'digitalCertificate'
            && type !== 'updateStatus'
            && checkboxValue && checkboxValue.length === 0) {
            message.warning('请先选择客户！')
            return
        }
        else if(type === 'addCustomer'){//新增客户
            this.add();
        }
        else if(type === 'importCustomer'){//导入客户
            const ret = await this.metaAction.modal('show', {
                title: '导入客户',
                width: 560,
                height: 330,
                cancelText: '取消',
                okText: '导入',
                children: this.metaAction.loadApp('ttk-es-app-import', {
                    store: this.component.props.store,
                    path: 'person'
                })
            });
            if (ret) {
                if(ret.seqNo){
                    let res = await this.webapi.customer.getImportAsyncStatusNew({seqNo:ret.seqNo})
                    console.info(res)
                    if(res){
                        if(res.exmsg){
                            this.metaAction.toast('warning', res.exmsg)
                        }else{
                            this.openImportProgress(ret.seqNo,res,ret.sessionNo)
                        }
                    }
                }else{
                    this.metaAction.toast('warning', '导入失败')
                }
            }
        }
        else if(type === 'exportCustomer'){
            this.exportCustomer()
        }
        else if(type === 'downloadNSRXX'){//下载纳税人信息

            // if (seq) {
            //     let asyncRequestResult
            //     return asyncRequestResult = await this.webapi.asyncRequestResult({ seq }, 2000);
            // }

            const ret = await this.metaAction.modal('confirm', {
                content: '确定下载'+checkboxValue.length+'个客户的纳税人信息吗？',
                cancelText:'取消',
                okText:'下载'
            })

            if (ret) {
                this.injections.reduce('tableLoading', true)
                let {selectedOption} = this.metaAction.gf('data.tableCheckbox').toJS()
                console.info(selectedOption)
                let data = {
                    idList:selectedOption.map(item=>{
                        return {
                            id:item.id,
                            orgId:item.orgId
                        }
                    })
                }
                let res =await this.webapi.customer.getNsrxx(data)
                console.info(res)

                // if(!res&&!res.error){
                    let tableList = this.metaAction.gf('data.list').toJS()
                    let newList = tableList.map(item=>{
                        if(checkboxValue.includes(item.id)){
                            return {
                                ...item,
                                infoState:'3'
                            }
                        }else{
                            return item
                        }
                    })
                    this.injections.reduce('updateObj', {
                        'data.downloadNSRXX':fromJS(checkboxValue),
                        'data.list':fromJS(newList)
                    })
                    this.checkboxChange([],[])
                    this.injections.reduce('tableLoading', false)

                let listRes = await this.webapi.customer.getNsrxxAsyncStatusHasReturn()
                console.info(listRes)
                let list = listRes?listRes.list:[]
                // let list = [
                //     {
                //         "success":'3',
                //         "customer":"XXXXX公司",
                //         "message":"下载成功"
                //     },
                //     {
                //         "success":'3',
                //         "customer":"XXXXX公司",
                //         "message":"用户名密码错误"
                //     }
                // ]
                if(listRes&&list.length>0){
                    if(list.every(item=>item.success!=='3')){
                        this.metaAction.toast('warning', '当前无下载纳税人信息的任务')
                        this.refreshCustomerList()
                    }else{
                        const ret = await this.metaAction.modal('show', {
                            title: '下载进度',
                            className: 'ttk-es-app-customer-download-progress-modal',
                            wrapClassName: 'card-archive',
                            width: 500,
                            height: 500,
                            footer:null,
                            // okText:'终止下载',
                            children: this.metaAction.loadApp('ttk-es-app-customer-download-progress', {
                                store: this.component.props.store,
                                list:list
                            })
                        });
                        if (ret) {
                            let nowRes = await this.webapi.customer.getNsrxxAsyncStatusHasReturn()
                            console.info(nowRes)
                            let nowList = nowRes?nowRes.list:[]
                            if(nowList.length>0){
                                this.metaAction.toast('warning', '后台正在下载纳税人信息，请稍后刷新界面查看')
                            }
                            this.load();
                        }
                    }
                }else if(listRes&&list.length===0){
                    this.metaAction.toast('warning', '当前无下载纳税人信息的任务')
                    this.refreshCustomerList()
                }

                // }
            }

            /*this.injections.reduce('tableLoading', true)
            let data = {};
            data.idList = this.metaAction.gf('data.nsrxx');
            // let res = await this.webapi.customer.downLoadNSRXX(data);

            let res =await this.webapi.customer.downLoadNSRXX(data)
            // console.log(res,'res')
            if (res) {
                let result = await this.webapi.customer.getNsrxxState({sequenceNo: res},5000)
                // console.log("------------");
                // console.log(result, 'result');
                // console.log("------------");
                this.injections.reduce('tableLoading', false)

                const ret = await this.metaAction.modal('show', {
                    title: '下载纳税人信息',
                    children: this.metaAction.loadApp('ttk-es-app-download-taxpayer-information', {
                        store: this.component.props.store,
                        //list: res.data
                        list: result
                    })
                });
                this.load();
            }*/
        }
        else if(type === 'updateStatus'){
            this.refreshCustomerList()
        }
        else if(type === 'startCustomer'){//启用客户
            // console.log(serviceCode,'1111')
            let serviceCode = this.metaAction.gf('data.serviceCode');
            let arr = this.metaAction.gf('data.checkChoosed');
            let orgArr = this.metaAction.gf('data.orgArr');
            this.stopMoreCustomer(serviceCode,arr,orgArr);
        }else if(type === 'delCustomer'){
            let arr = this.metaAction.gf('data.checkChoosed');
            let orgArr = this.metaAction.gf('data.orgArr');
            this.delCustomer(arr,orgArr)
        }
        else if(type === 'digitalCertificate'){//数字证书
            this.openDigitalCertificate()
        }
    }

    /**办税人员导入（北京）start***/

        bjTaxOfficerImport = async () => {
            let list = this.metaAction.gf('data.list').toJS();
            const ret = await this.metaAction.modal('show', {
                title: '导入办税人信息',
                width: 560,
                height: 330,
                cancelText: '取消',
                okText: '导入',
                children: this.metaAction.loadApp('ttk-es-app-customer-bjtaxofficer-import', {
                    store: this.component.props.store,
                    path: 'person',
                    list:fromJS(list)
                })
            });
            if (ret) {
                if(ret.seqNo){
                    let res = await this.webapi.customer.getImportAsyncStatusNew({seqNo:ret.seqNo})
                    console.info(res)
                    if(res){
                        if(res.exmsg){
                            this.metaAction.toast('warning', res.exmsg)
                        }else{
                            this.openTaxOfficerImportProgress(ret.seqNo,res,ret.sessionNo)
                        }
                    }
                }else{
                    this.metaAction.toast('warning', '导入失败')
                }
            }
        }
    /**办税人员导入（北京）end***/

    add = (id) => {//新增客户
        let option = { title: '', appName: '', id: id };
        option.title = '新增客户';
        option.appName = 'ttk-es-app-addcustomer';
        this.addModel(option);
    };

    addModel = async (option) => {//新增客户弹窗
        const ret = await this.metaAction.modal('show', {
            title: option.title,
            className: 'app-list-customer-modal',
            wrapClassName: 'card-archive',
            width: 800,
            height: 600,
            // footer:null,
            okText:'保存',
            children: this.metaAction.loadApp(option.appName, {
                store: this.component.props.store,
                personId: option.id
            })
        });
        if (ret) {
            this.load();
        }
    };

    exportCustomer = () => {
        const inputVal = this.metaAction.gf('data.inputVal')//输入的客户名称或是助记码
        const serviceCode = this.metaAction.gf('data.serviceCode')//正常客户和停用客户
        const filterForm = this.metaAction.gf('data.filterForm').toJS()//隐藏筛选条件
        // console.log(inputVal,'uuuu')
        // console.log(serviceCode,'yyyy')
        // console.log(filterForm,'ttttt')
        let type = this.metaAction.gf('data.checkedKeys.checked'),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all')

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde  && all=="all"){
                types = 'all'
            }
        }
        // return
        const params = {
            entity:{
                "departments":type,
                type:types,
                serviceCode:serviceCode,
                vatTaxpayer:filterForm.customerTypeStatus,
                infoState:filterForm.nsrMessStatus,
                sfdm:filterForm.sfdm,
                csdm:filterForm.csdm,
                qxdm: filterForm.qxdm,
                name:inputVal

            },
            page:{
                currentPage:1,
                pageSize:1
            }
        }

       this.webapi.customer.exportCustomer(params)
    }

    details = async (record) => {//客户弹窗
        const permissionIds = this.metaAction.gf('data.permissionIds').toJS()
        const serviceCode = this.metaAction.gf('data.serviceCode')
        let ret = null
        if((serviceCode==='1'&&permissionIds.includes('20010_300_1_500'))||(serviceCode==='0'&&permissionIds.includes('20010_300_0_700'))){
            ret = await this.metaAction.modal('show', {
                title: '详情',
                className: 'app-list-customer-modal',
                wrapClassName: 'card-archive',
                width: 800,
                height: 600,
                okText:'保存',
                children: this.metaAction.loadApp('ttk-es-app-addcustomer', {
                    store: this.component.props.store,
                    id: record.id,
                    active: 'details'
                })
            });
        }else{
            ret = await this.metaAction.modal('show', {
                title: '详情',
                className: 'app-list-customer-modal',
                wrapClassName: 'card-archive',
                width: 800,
                height: 600,
                okText:'保存',
                footer:null,
                children: this.metaAction.loadApp('ttk-es-app-addcustomer', {
                    store: this.component.props.store,
                    id: record.id,
                    active: 'details'
                })
            });
        }

        if (ret) {
            this.load();
        }
    }
    //三证合一弹窗
    syndromesCombine = async (record) => {
        const ret = await this.metaAction.modal('show', {
            title: '三证合一变更',
            className: 'ttk-es-app-customer-syndromes-modal',
            wrapClassName: 'card-archive',
            width: 500,
            height: 500,
            okText:'保存',
            children: this.metaAction.loadApp('ttk-es-app-card-syndromescombine', {
                store: this.component.props.store,
                id: record.id,
                active: 'details'
            })
        });
        if (ret) {
            this.load();
        }
    }
    //资料交接弹窗
    dataHandover = async (record) => {
        let appParams = JSON.parse(sessionStorage.getItem('appParams'))
        let currentOrg = this.metaAction.context.get("currentOrg")
        let params = {
            agencyId:currentOrg.id,
            nsrsbh:record.nsrsbh,
            token:appParams.appParams.jcymYhzxToken
        }
        let res = await this.webapi.customer.getCustomerForZljj(params)
        console.info(res.url)
        // document.getElementById("cusList").src=res.url
        // window.parent.frames['cusList'].src = res.url
        window.parent.postMessage({
            type:'cusList',
            url:res.url
        },'*')
    }

    //下载进度弹窗
    downloadProgress = async (record) => {
        // const downloadNSRXX = this.metaAction.gf('data.downloadNSRXX').toJS()
        let res = await this.webapi.customer.getNsrxxAsyncStatusHasReturn()
        console.info(res)
        let list = res?res.list:[]
        // let list = [
        //     {
        //         "success":'3',
        //         "customer":"XXXXX公司",
        //         "message":"下载成功"
        //     },
        //     {
        //         "success":'3',
        //         "customer":"XXXXX公司",
        //         "message":"用户名密码错误"
        //     }
        // ]
        if(res&&list.length>0){
            if(list.every(item=>item.success!=='3')){
                this.metaAction.toast('warning', '当前无下载纳税人信息的任务')
                this.refreshCustomerList()
            }else{
                const ret = await this.metaAction.modal('show', {
                    title: '下载进度',
                    className: 'ttk-es-app-customer-download-progress-modal',
                    wrapClassName: 'card-archive',
                    width: 500,
                    height: 500,
                    footer:null,
                    // okText:'终止下载',
                    children: this.metaAction.loadApp('ttk-es-app-customer-download-progress', {
                        store: this.component.props.store,
                        list:list
                    })
                });
                if (ret) {
                    this.load();
                }
            }
        }else if(res&&list.length===0){
            this.metaAction.toast('warning', '当前无下载纳税人信息的任务')
            this.refreshCustomerList()
        }
    }
    //批量下载弹窗
    batchCustomerUpdate = async (record) => {
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if(checkboxValue.length>0){
            const ret = await this.metaAction.modal('show', {
                title: '批量下载',
                className: 'ttk-es-app-customer-batch-update-modal',
                wrapClassName: 'card-archive',
                width: 500,
                height: 500,
                okText:'保存',
                children: this.metaAction.loadApp('ttk-es-app-customer-batch-update', {
                    store: this.component.props.store,
                    ids:checkboxValue
                })
            });
            if (ret) {
                this.load();
            }
        }else{
            this.metaAction.toast('warning', '请先选择客户')
        }
    }
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
    //数字证书弹窗
    openDigitalCertificate = async (record) => {
        const ret = await this.metaAction.modal('show', {
            title: '开通数字证书',
            className: 'ttk-es-app-customer-digital-certificate-modal',
            wrapClassName: 'card-archive',
            width: 1000,
            height: 600,
            // footer:null,
            // okText:'终止下载',
            children: this.metaAction.loadApp('ttk-es-app-customer-digital-certificate', {
                store: this.component.props.store,
                // list:list
            })
        });
        this.load()
    }
    //导入进度弹窗
    openImportProgress = async (seqNo,res,sessionNo) => {
        const ret = await this.metaAction.modal('show', {
            title: '导入客户',
            className: 'ttk-es-app-customer-import-progress-modal',
            wrapClassName: 'card-archive',
            width: 500,
            height: 500,
            footer:null,
            centered:true,
            // okText:'终止下载',
            children: this.metaAction.loadApp('ttk-es-app-customer-import-progress', {
                store: this.component.props.store,
                seqNo:seqNo,
                sessionNo:sessionNo,
                res:res,
            })
        });
        this.load()
    }

    //办税人员导入进度弹窗
    openTaxOfficerImportProgress = async (seqNo,res,sessionNo) => {
        const ret = await this.metaAction.modal('show', {
            title: '导入客户',
            className: 'ttk-es-app-customer-import-progress-modal',
            wrapClassName: 'card-archive',
            width: 500,
            height: 500,
            footer:null,
            centered:true,
            // okText:'终止下载',
            children: this.metaAction.loadApp('ttk-es-app-customer-bjtaxofficer-import-progress', {
                store: this.component.props.store,
                seqNo:seqNo,
                sessionNo:sessionNo,
                res:res,
            })
        });
        this.load()
    }

    componentDidMount = () => {
        this.mounted = true
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        this.mounted = false
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.metaAction.gf('data').toJS()
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
            }
        }
        this.injections.reduce('updateObj', {
            'data.loading':true,
            'data.pagination': fromJS(pagination)
        })
        this.load()

    }
    // 显示列设置
    showTableSetting = ({ value, data }) => {
        const columns = this.metaAction.gf('data.columns').toJS()
        this.injections.reduce('updateObj', {
            'data.other.columnDto': fromJS(columns),
            'data.showTableSetting': value
        })
    }
    upDateTableSetting = async ({ value, data }) => {
        const columns = []
        const serviceCode = this.metaAction.gf('data.serviceCode')
        const pageID = serviceCode === '1' ? 'batchCustomGeneral' : 'batchCustomSmall'
        for (const item of data) {
            item.isVisible ? columns.push(item.id) : null
        }
        const resp = await this.webapi.invoice.upDateColumn({
            pageID,
            columnjson: JSON.stringify(columns)
        })
        if (!this.mounted) return
        if (resp) {
            this.getColumns()
            this.injections.reduce('tableSettingVisible', { value })
        }

    }
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        const serviceCode = this.metaAction.gf('data.serviceCode')
        const pageID = serviceCode === '1' ? 'batchCustomGeneral' : 'batchCustomSmall'
        let res = await this.webapi.invoice.deleteColumn({ pageID })
        if (!this.mounted) return
        if (res) {
            this.injections.reduce('update', {
                path: 'data.showTableSetting',
                value: false
            })
            this.getColumns()
        }
    }
    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        this.metaAction.sf('data.test', itemArr)
        // console.log('數據ID',arr)
        // console.log('數據本身',itemArr)
        // debugger
        let newArr = []
        let argID = []//id
        let argOrgID = []//orgid
        arr.forEach(item => {
            if (item) {
                argID.push(item)
            }
        });

        itemArr.forEach( item => {
            if(item){
                argOrgID.push(item.orgId)
            }
        })
        // console.log('id',argID)
        // console.log('orgid',argOrgID)
        for (let i = 0;i < argID.length; i++){
            let arg = {};
            arg.id = argID[i];
            arg.orgId = argOrgID[i]
            newArr.push(arg)
        }
        // console.log('参数',newArr)

        let newItemArr = []

        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        // this.injections.reduce('update', {
        //     path: 'data.tableCheckbox',
        //     value: {
        //         checkboxValue: argID,
        //         selectedOption: newItemArr
        //     }
        // })
        this.injections.reduce('updateObj', {
            'data.checkChoosed':argID,
            'data.orgArr':argOrgID,
            'data.nsrxx':fromJS(newArr),
            'data.tableCheckbox':fromJS({
                checkboxValue: argID,
                selectedOption: newItemArr
            })
        })
        this.selectedOption = newItemArr
    }
    renderStatus = (record, type) => {
        let status, time, message
        if (type === 'jx') {
            status = record.jxcjzt
            time = record.jxtqsj
            message = record.jxcjztmsg
        } else {
            status = record.xxcjzt
            time = record.xxtqsj
            message = record.xxcjztmsg
        }
        return (
            status === 0 || status === 1 ? <Tooltip
                arrowPointAtCenter={true}
                placement={status === 0 ? 'top' : 'left'}
                overlayClassName={status === 0 ? 'inv-tool-tip-normal' : 'inv-tool-tip-warning'}
                title={status === 0 ? `采集时间：${time}` : message}>
                <Icon type={status === 1 ? 'exclamation-circle' : 'check-circle'} className={status === 1 ? 'inv-custom-warning-text' : 'inv-custom-success-text'} />
            </Tooltip> : null
        )

    }
    renderTaxAmount = (text, record, row) => {
        const serviceCode = this.metaAction.gf('data.serviceCode')
        if (serviceCode === '1' && row.isToolTip && record[`${row.type}SeMsg`]) {
            let message = record[`${row.type}SeMsg`] ? record[`${row.type}SeMsg`].split(';') : []
            let toolTipContent = message.map(item => <div>{item}</div>)
            return record[`${row.type}SeMsg`] ? <Tooltip
                arrowPointAtCenter={true}
                title={() => toolTipContent}
                overlayClassName="inv-tool-tip-normal">
                <span className="text-tax-amount">{text && row.amount ? utils.number.format(text, 2) : text}</span>
            </Tooltip> : <span className="text-tax-amount">{text}</span>
        } else {
            return <span>{text && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }
    renderTotalAmount = (text, record, row) => {
        if (row.fieldName === 'totalAmount' && record.limitRate) {
            return <span>
                <Tooltip
                    arrowPointAtCenter={true}
                    placement="top"
                    title={record.limitRate}
                    overlayClassName='inv-tool-tip-warning'>
                    <Icon type="exclamation-circle" className='inv-custom-warning-text' />
                </Tooltip>
                <span style={{ paddingLeft: '5px' }}>{text && row.amount ? utils.number.format(text, 2) : text}</span>
            </span>
        } else {
            return <span title={text && row.amount ? utils.number.format(text, 2) : text}>{text && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }


    //返回刷新列表
    closeRefresh = (ret) => {
        if(!ret){
            this.load()
        }
        this.closeTip()
    }
    openSetting = (option) => {//查看纳税人信息
        // debugger
        //北京、山东、青海、陕西、甘肃、、贵州、云南、广东、广西、福建、大连、青岛属于网报区
        let areaCode = option.areaCode;
        let areaCode1 = '';
        let areaCode2 = '';
        let areaType = null;// 1是网报区 0是非网报区
        if(areaCode){
            areaCode1 = areaCode.substr(0,4)
            areaCode2 = areaCode.substr(0,2)
            if(areaCode2 == '11' || areaCode2 == '37' || areaCode2 == '63' || areaCode2 == '61' || areaCode2 == '62' || areaCode2 == '52' || areaCode2 == '53' || areaCode2 == '44' || areaCode2 == '45' || areaCode2 == '35'){
                areaType = 1
            }else {
                if(areaCode1 == '3702' || areaCode1 =='2102' ){
                    areaType = 1
                }else {
                    areaType = 0
                }
            }
        }
        console.log(areaType,'我是区域类型')

        const permissionIds = this.metaAction.gf('data.permissionIds').toJS()
        const serviceCode = this.metaAction.gf('data.serviceCode')
        let nsrxxSave = (serviceCode==='1'&&permissionIds.includes('20010_300_1_600'))||(serviceCode==='0'&&permissionIds.includes('20010_300_0_800'))

        const ret =  this.metaAction.modal('show', {
                title: '纳税人信息',
                width: 1100,
                footer: '',
                style: { top: 40 },
                bodyStyle: { height: 550 },
                wrapClassName: 'ttk-es-app-org-model',
                closeBack: (back) => { this.closeTip = back },
                children: this.metaAction.loadApp('ttk-es-app-org', {
                    store: this.component.props.store,
                    initData:{
                        orgId:option.orgId,
                        changelinkman:option.changelinkman,
                        customerId:option.id,
                        areaType:areaType
                    },
                    fuc:this.closeRefresh,
                    canNSRXXSave:nsrxxSave?'100':'200'
                }),
        })
        if (ret){
            this.load()
        }
}

    psbSetting = async (khmc,nsrsbh,orgId) => {
        let data = {}
        data.khmc = khmc;
        data.nsrsbh = nsrsbh;
        data.orgId = orgId;
        let res = await this.webapi.customer.queryPSB(data);
        if(res){
            // console.log(',,,',res.PageUrl)
            let ret = await this.metaAction.modal("show", {
                title: "票税宝",
                width: 800,
                height: 600,
                wrapClassName: 'psb-modal-style',
                footer:null,
                children: this.metaAction.loadApp("ttk-edf-app-iframe", {
                    store: this.component.props.store,
                    src: res.PageUrl
                })
            })
            this.load()
        }
    }

    stopCustomer = async (serviceCode,id,orgId) => {//单个客户
        let data = {}
        data.idList = []
        let dd = {}
        dd.id = id;
        dd.orgId = orgId
        data.idList[0] =dd
        if(serviceCode === 1){
            const ret = await this.metaAction.modal('confirm', {
                title: '停止服务',
                content: '客户停用后将不再可进行发票下载、报税等操作。确定要停用吗？'
            })
            if(ret){
                // if (serviceCode === 0){//启用
                //     data.serviceCode = 1
                // }else if(serviceCode === 1){//停用
                    data.serviceCode = 0
                // }
                let res = await this.webapi.customer.stopCustomer(data)
                if(res){
                    this.load();
                    this.metaAction.toast('success', '停用客户成功');
                }
            }
        }else {
            // let data = {}
            // if (serviceCode === 0){//启用
                data.serviceCode = 1
            // }else if(serviceCode === 1){//停用
            //     data.serviceCode = 0
            // }
            // data.idList = []
            // let dd = {}
            // dd.id = id;
            // dd.orgId = orgId
            // data.idList[0] =dd
            let res = await this.webapi.customer.stopCustomer(data)
            if(res){
                this.load();
                this.metaAction.toast('success', '启用客户成功');
            }
        }



    }

    stopMoreCustomer = async (serviceCode,arr,orgArr) =>{//批量处理客户
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if ( checkboxValue && checkboxValue.length === 0) {
            message.warning('请先选择客户！')
            return
        }
        let data = {}
        let dd = [];
        for (let i = 0 ;i < arr.length; i++){
            let tem = {};
            tem.id = arr[i]
            tem.orgId = orgArr[i]
            dd.push(tem)
        }
        data.idList =dd
        if(serviceCode === '1'){
            const ret = await this.metaAction.modal('confirm', {
                title: '停止服务',
                content: '客户停用后将不再可进行发票下载、报税等操作。确定要停用吗？'
            })
            if (ret){
                // if(serviceCode === '1'){//停用
                    data.serviceCode = '0'
                // }else if(serviceCode === '0'){//启用
                //     data.serviceCode = '1'
                // }

                let res =  await this.webapi.customer.stopCustomer(data)
                if(res){
                    this.load();
                    this.metaAction.toast('success', '停用客户成功');
                }
            }
        }else {
            // let data = {}
            // if(serviceCode === '1'){//停用
            //     data.serviceCode = '0'
            // }else if(serviceCode === '0'){//启用
                data.serviceCode = '1'
            // }
            // data.idList =arr

            let res =  await this.webapi.customer.stopCustomer(data)
            if(res){
                this.load();
                this.metaAction.toast('success', '启用客户成功');
            }
        }


    }

    delCustomer = async (arr,orgArr) => {//删除客户
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if ( checkboxValue && checkboxValue.length === 0) {
            message.warning('请先选择客户！')
            return
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '删除客户',
            content: '确定要删除吗？'
        })
        if(ret){
            LoadingMask.show()
            let data = {}
            let dd = []
            for (let i = 0 ;i < arr.length; i++){
                let tem = {};
                tem.id = arr[i]
                tem.orgId = orgArr[i]
                dd.push(tem)
            }
            data.idList =dd
            let res = await this.webapi.customer.delCustomer(data)
            if(res){
                if(res.success){
                    LoadingMask.hide()
                    if(res.message.length >0){
                        const ret = await this.metaAction.modal('show', {
                            title: '删除失败',
                            width:400,
                            children: this.metaAction.loadApp('ttk-es-app-delete-info', {
                                store: this.component.props.store,
                                //list: res.data
                                list: res.message
                            })
                        });
                        if (ret){
                            this.load()
                        }
                    }else {
                        this.load()
                        this.metaAction.toast('success', '删除客户成功');
                    }

                }else {
                    // console.log(',,,',res.message)
                    this.metaAction.toast('error', '删除客户失败');
                }

            }else {
                LoadingMask.hide()
            }
        }else {
            LoadingMask.hide()
        }

    }

    gsmmjy = async(orgArr) => {//个税密码校验
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if ( checkboxValue && checkboxValue.length === 0) {
            message.warning('请选择需要校验的客户！')
            return
        }
        LoadingMask.show();
        let data = {}
        data.idList = orgArr
        let ret = await this.webapi.customer.checkOutGSMM(data);
        if(ret){
            if(ret.success){
                LoadingMask.hide();
                this.load();
                this.metaAction.toast('error', '提交成功，请稍后刷新界面查看结果');
            }else {
                LoadingMask.hide();
                this.load();
                this.metaAction.toast('error', ret.message);
            }
        }
    }

    updateGSMMStatus = async() => {//更新个税密码校验状态
        LoadingMask.show();
        let ret = await this.webapi.customer.updateGSMMStatus();
        if(ret){
            if(ret.success){
                LoadingMask.hide();
                this.load();
            }else {
                LoadingMask.hide();
                this.load();
                this.metaAction.toast('error', ret.message);
            }
        }
    }

    sbOpen = async(data) => {//社保
        const con = ( <div>
            <p style={{margin:'0',textAlign:'left',paddingLeft:'10px'}}>跳转中...</p>
            <p style={{margin:'0',paddingRight:'5px',textAlign:'left',paddingLeft:'10px'}}>一次仅可登录一个企业，如需切换，请先关闭已打开的页签</p>
        </div>)
        this.metaAction.toast('success', con)
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        let iframe = document.createElement('iframe');
        iframe.frameborder = "0";
        iframe.style.width = "0px"
        iframe.style.height = "0px"
        iframe.src = 'https://bdyw.guangdong.chinatax.gov.cn/etax/etax_logout.do';
        document.body.appendChild(iframe);
        setTimeout(async () => {
            let res = await this.webapi.customer.querySB({
                linkCode: 20,
                orgId:data.orgId,
                sbfgl:'sbfgl'
            })
            if(res){
                window.open(res)
                this.injections.reduce('tableLoading', false)
            }else {
                this.injections.reduce('tableLoading', false)
            }
        },3000)

    }

    //下载纳税人信息错误时点扫码下载
    errorMsg = (mes) => {
        const ret = this.metaAction.modal('show', {
            title: '',
            width: 500,
            className: 'ttk-es-app-addcustomer-copyimg-modal',
            footer: null,
            children: this.metaAction.loadApp('ttk-es-app-addcustomer-copyimg', {
                store: this.component.props.store,
                option:{
                    typeImg:2,
                    mes:mes
                }
            })
        })
    }


    toEnterpriseTerminal = async (dzCustomerOrgId, dzCustomerName) => {
        // console.log(this.component.props.setGlobalContent){

        // this.component.props.setGlobalContent(dzCustomerName, 'edfx-app-portal', {}, dzCustomerOrgId,null)
        this.component.props.setGlobalContent({
            name: dzCustomerName,
            appName: 'edfx-app-portal',
            params: {},
            orgId: dzCustomerOrgId
            // showHeader:true
        })
        this.injections.reduce('updateSingle', 'data.serviceCode', '0')
    }

    renderColumns = () => {//绘制表格
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        const permissionIds = this.metaAction.gf('data.permissionIds').toJS()
        const serviceCode = this.metaAction.gf('data.serviceCode');
        const excessStatus = this.metaAction.gf('data.excessStatus')
        let width = 0
        const alertKey = ({key}) =>{//更多下的停用和票税宝
            alert(key);
        }
        const dzswj = async (data) => {//电子税务局
            const con = ( <div>
                <p style={{margin:'0',textAlign:'left',paddingLeft:'10px'}}>跳转中...</p>
                <p style={{margin:'0',paddingRight:'5px',textAlign:'left',paddingLeft:'10px'}}>一次仅可登录一个企业，如需切换，请先关闭已打开的页签</p>
            </div>)
            // console.log('1111');
            this.metaAction.toast('success', con)
            let loading = this.metaAction.gf('data.loading')
            if (!loading) {
                this.injections.reduce('tableLoading', true)
            }
            if(data.areaCode.startsWith('2102')){//大连的电子税务局登录
                let isCEFWeb = window.checkCef4 && window.checkCef4();
                if(isCEFWeb != undefined){ //客户端
                    let rer = await this.webapi.customer.queryDZSWJ({
                        linkCode: 10,
                        orgId:data.orgId

                    })
                    if(rer){
                        let url = rer.split('/xxmh')
                        let item = await this.webapi.customer.query({ id: data.id})
                        let ret = (window.runJqrDlDldzswj && window.runJqrDlDldzswj('{"baseurl":"'+url[0]+'","nsrsbh":"'+item.orgDto.nsrsbh+'","yhzh":"'+item.dlxxDto.DLZH+'","yhmm":"'+item.dlmm+'","djxh":"","nsrmc":"","sjhm":"'+item.dlxxDto.sjhm+'","sflx":"","zgswjgmc":""}'));
                        let res = JSON.parse(ret);
                        if(res.replyCode == -1){
                            this.injections.reduce('tableLoading', false)
                            this.metaAction.toast('warning',res.replyMsg)
                        }else {
                            this.injections.reduce('tableLoading', false)
                            open(rer)
                            // this.injections.reduce('tableLoading', false)
                        }
                    }else {
                        this.injections.reduce('tableLoading', false)
                    }
                    // console.log(window.runJqrDlDldzswj && window.runJqrDlDldzswj('{"baseurl":"https://etax.dalian.chinatax.gov.cn:8443","nsrsbh":'+item.orgDto.nsrsbh+',"yhzh":'+item.dlxxDto.DLZH+',"yhmm":'+item.dlxxDto.DLMM+',"djxh":"","nsrmc":"","sjhm":'+item.dlxxDto.sjhm+',"sflx":"","zgswjgmc":""}'),'1111');
                }else {//网页版
                    setTimeout(async () => {
                        let res = await this.webapi.customer.queryDZSWJ({
                            linkCode: 10,
                            orgId:data.orgId

                        })
                        if(res){
                            open(res)
                            this.injections.reduce('tableLoading', false)
                        }else {
                            this.injections.reduce('tableLoading', false)
                        }
                    },2500)
                }

            }else {//其他地区
                setTimeout(async () => {
                    let res = await this.webapi.customer.queryDZSWJ({
                        linkCode: 10,
                        orgId:data.orgId

                    })
                    if(res){
                        open(res)
                        this.injections.reduce('tableLoading', false)
                    }else {
                        this.injections.reduce('tableLoading', false)
                    }
                },2500)
            }

        }
        if(serviceCode == 1){
            column.forEach((item, index) => {
                if (item.isVisible) {
                    // width += item.width
                    // if (item.children) {
                    //     const child = [] // 多表头
                    //     let col
                    //     item.children.forEach(subItem => {
                    //         if (subItem.isSubTitle) {
                    //             child.push({
                    //                 title: subItem.caption,
                    //                 dataIndex: subItem.fieldName,
                    //                 key: subItem.fieldName,
                    //                 width: subItem.width,
                    //                 align: subItem.align,
                    //                 className: subItem.className,
                    //                 render: (text, record) => (this.renderTaxAmount(text, record, subItem))
                    //             })
                    //         }
                    //         else {
                    //             const serviceCode = this.metaAction.gf('data.serviceCode')
                    //             if (!(serviceCode === '0' && column[index + 1].isVisible)) {
                    //                 col = {
                    //                     title: subItem.caption,
                    //                     dataIndex: subItem.fieldName,
                    //                     key: subItem.fieldName,
                    //                     width: subItem.width,
                    //                     align: subItem.align,
                    //                     className: subItem.className,
                    //                     render: (text, record) => (this.renderStatus(record, subItem.type))
                    //                 }
                    //             }
                    //         }
                    //     })
                    //     arr.push({
                    //         title: item.caption,
                    //         align: item.align,
                    //         children: child,
                    //         className: item.className,
                    //     })
                    //     if (col) {
                    //         arr.push(col)
                    //     }
                    // }
                    if (item.id === 'operation') {
                        let appParams = JSON.parse(sessionStorage.getItem('appParams'))
                        const showTableSetting = this.metaAction.gf('data.showTableSetting')
                        const content = (
                            <p style={{padding:'5px 6px',fontSize:'12px',margin:0}}>电子税务局、社保费系统仅支持操作一户企业<br/>
                                请不要同时打开多户。如需切换企业，<br/>
                                请先关闭已打开的电子税务局、社保费系统页面。
                            </p>
                        )

                        let containDetail = (serviceCode === '1' && permissionIds.includes('20010_200_1_100')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_200_0_100'));
                        let containDZSW = (serviceCode === '1' && permissionIds.includes('20010_300_1_700')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_400'));
                        let containSBFManage = (serviceCode === '1' && permissionIds.includes('20010_300_1_800')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_500'));
                        let containStopStart = (serviceCode === '1' && permissionIds.includes('20010_300_1_900')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_100'));
                        let containSZHY = (serviceCode === '1' && permissionIds.includes('20010_300_1_101')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_600'));
                        let containRowOthers = containStopStart || containSZHY;
                        let divisionDetail = containDetail && (containDZSW || containSBFManage || containRowOthers);
                        let divisionDZSW = containDZSW && (containSBFManage || containRowOthers);
                        let divisionSBFManage = containSBFManage && containRowOthers;

                        arr.push({
                            title: (
                                <div>
                                    操作
                                    {/*<div style={{float:'right'}}>*/}
                                    <Popover content={content} placement='bottom' overlayClassName='customer-info-state-not-control-popover'>
                                        <Icon
                                            type='XDZtishi'
                                            fontFamily='edficon'
                                            style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
                                        />
                                    </Popover>
                                    {/*</div>*/}
                                    {/*<div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'} onClick={() => this.showTableSetting({ value: true })}>*/}
                                    {/*<Icon*/}
                                    {/*type='setting'*/}
                                    {/*name='setting'*/}
                                    {/*/>*/}
                                    {/*{showTableSetting ? <span style={{ paddingLeft: '5px', display: 'inline' }}>列设置</span> : null}*/}
                                    {/*</div>*/}
                                </div>

                            ),

                            className: 'operation',
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            // fixed: 'right',
                            render: (text, record) => {
                                if(record.infoState === '3'){
                                    let content = (
                                        <span>正在下载纳税人信息</span>
                                    )
                                    return (
                                        <span class="customer-info-state-not-control">
                                        {containDetail?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                            <span> 详情</span>
                                        </Popover>:''}
                                            {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {(containDZSW&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                                <span> 电子税务局</span>
                                            </Popover>:''}
                                            {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
                                            {(containSBFManage&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                                <span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}}> 社保费管理</span>
                                            </Popover>:''}
                                            {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            <Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                          <span>更多 <Icon style={{color:'#999'}} type="down" /></span>
                                        </Popover>
                                    </span>
                                    )
                                }else if(appParams&&appParams.appParams&&appParams.appParams.jcymYhzxToken){
                                    return (
                                        <span>
                                        {containDetail?<Popover
                                            content={record.yzmxx}
                                            placement="left" overlayClassName='customer-info-state-not-control-popover'
                                        ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
                                            {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
                                            {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {
                                                (containDZSW&&!excessStatus)?
                                                    (record.infoState == '1'?(record.areaCode.startsWith('37')?<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>:<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>):<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)
                                                    :''
                                            }
                                            {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
                                            {(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}
                                            {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {containRowOthers?<Dropdown overlay={<Menu>
                                                {containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}
                                                {(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}
                                                <Menu.Item key="3" onClick={() => this.dataHandover(record)}>资料交接</Menu.Item>
                                                {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
                                            </Menu>}><a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}
                                    </span>
                                    )
                                }else{
                                    return (
                                        <span>
                                        {containDetail?<Popover
                                            content={record.yzmxx}
                                            placement="left" overlayClassName='customer-info-state-not-control-popover'
                                        ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
                                            {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
                                            {divisionDetail?<span style={record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702'?{display:'none'}:{ padding: '0 5px' }}>|</span>:''}
                                            {
                                                (containDZSW&&!excessStatus)?
                                                    ((record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702')?<a href="javascript:void(0)" style={{display:'none'}}> 电子税务局</a>:( record.infoState == '1'?<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>:<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)):
                                                    ''
                                            }
                                            {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
                                            {(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}
                                            {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {containRowOthers?<Dropdown overlay={<Menu>
                                                {containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}
                                                {(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}
                                                {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
                                            </Menu>}><a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}
                                    </span>
                                    )
                                }
                            }
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
                                        (serviceCode==='1'&&permissionIds.includes('20010_300_1_300')&&!excessStatus)||(serviceCode==='0'&&permissionIds.includes('20010_300_0_300')&&!excessStatus)?<a href="javascript:"//查看
                                                                                                                                                                                                        onClick={() =>this.psbSetting(record.name,record.nsrsbh,record.orgId)}
                                        >
                                            {txt}</a>:<span style={{color:'#d7d7d7'}}>{txt}</span>
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
                                let content = (
                                    <div style={{fontSize:'12px'}}>
                                        <span>{record.downloadmessage}</span><br/>
                                        <span>,请运行App，或者<a style={{textDecoration:'underline'}} onClick={() => {this.errorMsg(record.downloadmessage)}}>扫码下载</a>后安装运行</span>
                                    </div>

                                )
                                let context = (
                                    <Popover
                                        content={content}
                                        placement="bottom" overlayClassName='customer-info-state-not-control-popover'
                                    ><Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#ff0000'}}></Icon></Popover>
                                )
                                if(text === '0'){
                                    txt = '未下载'
                                }else if(text === '2'){
                                    txt = '下载失败'
                                }else if(text === '3'){
                                    txt = '下载中'
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
                                                {txt}</a> :(text === '2' ?//下载失败
                                            <a href="javascript:"
                                               style={{color:'red',cursor:'default',textDecoration:'none'}}
                                            >
                                                {txt}
                                                {record.downloadmessage&&record.downloadmessage.indexOf("机器人SMS") != -1 ? context: <Popover placement="right" content={record.downloadmessage?record.downloadmessage:'下载失败！'} overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
                                                    <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#red',marginLeft:'5px'}}></Icon>
                                                </Popover>}
                                            </a>
                                            :(text==='3'?
                                                <a href="javascript:"
                                                   style={{color:'#caaf87'}}
                                                    // style={{color:'#caaf87',cursor:'default',textDecoration:'none'}}
                                                    // className={text === '查看'?'watchNS':''}
                                                   onClick={() => {this.downloadProgress(record)}}
                                                >
                                                    <Popover placement="right" content='纳税人信息下载中' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
                                                        {txt}
                                                    </Popover></a>:((serviceCode==='1'&&permissionIds.includes('20010_200_1_200'))||(serviceCode==='0'&&permissionIds.includes('20010_200_0_200'))?(record.changelinkman == 0?<a href="javascript:"//信息不完整 需要去补充
                                                                                                                                                                                                                                 onClick={() =>this.openSetting(record)}
                                                                                                                                                                                                                                 style={{paddingLeft:'20px'}}>
                                                    {txt}
                                                    <Popover placement="right" content='数据不完整，请补充' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
                                                        <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#cc0000',marginLeft:'5px'}}></Icon>
                                                    </Popover>
                                                </a>:<a href="javascript:"//查看
                                                        onClick={() =>this.openSetting(record)}
                                                >
                                                    {txt}</a>):'')))
                                    }

                            </span>
                                )}
                        })
                    }else if(item.id === 'ktzssqzt'){
                        arr.push({
                            title:<div>
                            <span title={item.caption} style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow:'hidden'}}>{item.caption}</span>
                                <Popover placement="bottom" content='开通后可使用无盘认证等快捷功能' overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
                                    <Icon
                                        fontFamily="edficon"
                                        type='XDZtishi'
                                        style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
                                    />
                                </Popover>
                            </div>,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            className: item.className,
                            render:(text,record) => {
                                let textList = {
                                    '001': '未申请',
                                    '002': '未申请',
                                    '007': '已开通',
                                    '004': '开通失败',
                                    '008': '开通失败',
                                }
                                if (!text){
                                    return (
                                        <span>申请中</span>
                                    )
                                } else if (text === '004' || text === '008') {
                                    return (
                                        <span>
                                        {textList[text]}
                                            <Popover placement="right"
                                                     content={record.ktzssbyy ? record.ktzssbyy : '申请失败！'}
                                                     overlayClassName='ttk-es-app-customer-ktszzs-popover'>
                                            <Icon fontFamily="edficon" type='jinggao'
                                                  style={{fontSize: '14px', color: 'red', marginLeft: '5px'}}/>
                                        </Popover>
                                    </span>
                                    )
                                } else {
                                    return (
                                        <span>
                                        {textList[text]}
                                    </span>
                                    )
                                }
                            }
                        })
                    } else if(item.id === 'gsmmjyjg'){
                        arr.push({
                            title: item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            render:(text,record) =>{
                                let txt = '';
                                let color = '';
                                if(text === '000'){
                                    txt = '未校验';
                                    color = '#666';
                                }else if(text === '001'){
                                    txt = '校验中';
                                    color = '#fd9400';
                                }else if(text === '002'){
                                    txt = '通过';
                                    color = '#666';
                                }else if(text === '003'){
                                    txt = '密码错误';
                                    color = '#f5222d';
                                }
                                return (
                                    <span style={{color:color}}>{txt}</span>
                                )
                            }
                        })
                    }else if(item.id === 'khsx'){
                        arr.push({
                            title: item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            render:(text,record) =>{
                                let txt = '';
                                if(text === '001'){
                                    txt = '一次性服务'
                                }else if(text === '002'){
                                    txt = '周期性服务'
                                }else if(text === '003'){
                                    txt = '全部服务'
                                }
                                return (
                                    <span>{txt}</span>
                                )
                            }
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
        }else {
            column.forEach((item, index) => {
                if (item.isVisible) {
                    // width += item.width
                    // if (item.children) {
                    //     const child = [] // 多表头
                    //     let col
                    //     item.children.forEach(subItem => {
                    //         if (subItem.isSubTitle) {
                    //             child.push({
                    //                 title: subItem.caption,
                    //                 dataIndex: subItem.fieldName,
                    //                 key: subItem.fieldName,
                    //                 width: subItem.width,
                    //                 align: subItem.align,
                    //                 className: subItem.className,
                    //                 render: (text, record) => (this.renderTaxAmount(text, record, subItem))
                    //             })
                    //         }
                    //         else {
                    //             const serviceCode = this.metaAction.gf('data.serviceCode')
                    //             if (!(serviceCode === '0' && column[index + 1].isVisible)) {
                    //                 col = {
                    //                     title: subItem.caption,
                    //                     dataIndex: subItem.fieldName,
                    //                     key: subItem.fieldName,
                    //                     width: subItem.width,
                    //                     align: subItem.align,
                    //                     className: subItem.className,
                    //                     render: (text, record) => (this.renderStatus(record, subItem.type))
                    //                 }
                    //             }
                    //         }
                    //     })
                    //     arr.push({
                    //         title: item.caption,
                    //         align: item.align,
                    //         children: child,
                    //         className: item.className,
                    //     })
                    //     if (col) {
                    //         arr.push(col)
                    //     }
                    // }
                    if (item.id === 'operation') {
                        let appParams = JSON.parse(sessionStorage.getItem('appParams'))
                        const showTableSetting = this.metaAction.gf('data.showTableSetting')
                        const content = (
                            <p style={{padding:'5px 6px',fontSize:'12px',margin:0}}>电子税务局、社保费系统仅支持操作一户企业<br/>
                                请不要同时打开多户。如需切换企业，<br/>
                                请先关闭已打开的电子税务局、社保费系统页面。
                            </p>
                        )

                        let containDetail = (serviceCode === '1' && permissionIds.includes('20010_200_1_100')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_200_0_100'));
                        let containDZSW = (serviceCode === '1' && permissionIds.includes('20010_300_1_700')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_400'));
                        let containSBFManage = (serviceCode === '1' && permissionIds.includes('20010_300_1_800')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_500'));
                        let containStopStart = (serviceCode === '1' && permissionIds.includes('20010_300_1_900')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_100'));
                        let containSZHY = (serviceCode === '1' && permissionIds.includes('20010_300_1_101')) ||
                            (serviceCode === '0' && permissionIds.includes('20010_300_0_600'));
                        let dataSearch = serviceCode === '0' && permissionIds.includes('20010_200_0_400');//停用客户的数据查询按钮
                        let containRowOthers = containStopStart || containSZHY;
                        let divisionDetail = containDetail && (containDZSW || containSBFManage || containRowOthers);
                        let divisionDZSW = containDZSW && (containSBFManage || containRowOthers);
                        let divisionSBFManage = containSBFManage && containRowOthers;

                        arr.push({
                            title: (
                                <div>
                                    操作
                                    {/*<div style={{float:'right'}}>*/}
                                    <Popover content={content} placement='bottom' overlayClassName='customer-info-state-not-control-popover'>
                                        <Icon
                                            type='XDZtishi'
                                            fontFamily='edficon'
                                            style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
                                        />
                                    </Popover>
                                    {/*</div>*/}
                                    {/*<div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'} onClick={() => this.showTableSetting({ value: true })}>*/}
                                    {/*<Icon*/}
                                    {/*type='setting'*/}
                                    {/*name='setting'*/}
                                    {/*/>*/}
                                    {/*{showTableSetting ? <span style={{ paddingLeft: '5px', display: 'inline' }}>列设置</span> : null}*/}
                                    {/*</div>*/}
                                </div>

                            ),

                            className: 'operation',
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            // fixed: 'right',
                            render: (text, record) => {
                                if(record.infoState === '3'){
                                    let content = (
                                        <span>正在下载纳税人信息</span>
                                    )
                                    return (
                                        <span class="customer-info-state-not-control">
                                        {containDetail?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                            <span> 详情</span>
                                        </Popover>:''}
                                            {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {/*{(containDZSW&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>*/}
                                                {/*<span> 电子税务局</span>*/}
                                            {/*</Popover>:''}*/}
                                            {/*{(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}*/}
                                            {/*{(containSBFManage&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>*/}
                                                {/*<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}}> 社保费管理</span>*/}
                                            {/*</Popover>:''}*/}
                                            {/*{(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}*/}
                                            <Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
                                          <span>更多 <Icon style={{color:'#999'}} type="down" /></span>
                                        </Popover>
                                    </span>
                                    )
                                }else if(appParams&&appParams.appParams&&appParams.appParams.jcymYhzxToken){
                                    return (
                                        <span>
                                        {containDetail?<Popover
                                            content={record.yzmxx}
                                            placement="left" overlayClassName='customer-info-state-not-control-popover'
                                        ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
                                            {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
                                            {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {dataSearch? <a href="javascript:void(0)" onClick={() => this.toEnterpriseTerminal(record.orgId, record.name)}>数据查询</a>:''}
                                            {dataSearch?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {containStopStart?<a href="javascript:void(0)" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</a>:''}
                                            {/*{*/}
                                                {/*(containDZSW&&!excessStatus)?*/}
                                                    {/*(record.infoState == '1'?(record.areaCode.startsWith('37')?<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>:<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>):<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)*/}
                                                    {/*:''*/}
                                            {/*}*/}
                                            {/*{(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}*/}
                                            {/*{(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}*/}
                                            {/*{(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}*/}
                                            {/*{containRowOthers?<Dropdown overlay={<Menu>*/}
                                                {/*{containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}*/}
                                                {/*{(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}*/}
                                                {/*{*/}
                                                    {/*(containDZSW&&!excessStatus)?*/}
                                                        {/*(record.infoState == '1'?(record.areaCode.startsWith('37')?<Menu.Item key='4' style={{color:"#999"}}> 电子税务局</Menu.Item>:<Menu.Item key='4' onClick={()=>dzswj(record)}> 电子税务局</Menu.Item>):<Menu.Item key='4' style={{color:"#999"}}> 电子税务局</Menu.Item>)*/}
                                                        {/*:''*/}
                                                {/*}*/}
                                                {/*{(containSBFManage&&!excessStatus)?<Menu.Item key='5' style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} onClick={() => this.sbOpen(record)}>社保费管理</Menu.Item>:''}*/}
                                                // <Menu.Item key="3" onClick={() => this.dataHandover(record)}>资料交接</Menu.Item>
                                                {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
                                            {/*</Menu>}><a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}*/}
                                    </span>
                                    )
                                }else{
                                    return (
                                        <span>
                                        {containDetail?<Popover
                                            content={record.yzmxx}
                                            placement="left" overlayClassName='customer-info-state-not-control-popover'
                                        ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
                                            {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
                                            {divisionDetail?<span style={record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702'?{display:'none'}:{ padding: '0 5px' }}>|</span>:''}
                                            {dataSearch? <a href="javascript:void(0)" onClick={() => this.toEnterpriseTerminal(record.orgId, record.name)}>数据查询</a>:''}
                                            {dataSearch?<span style={{ padding: '0 5px' }}>|</span>:''}
                                            {containStopStart?<a href="javascript:void(0)" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</a>:''}
                                            {/*{*/}
                                                {/*(containDZSW&&!excessStatus)?*/}
                                                    {/*((record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702')?<a href="javascript:void(0)" style={{display:'none'}}> 电子税务局</a>:( record.infoState == '1'?<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>:<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)):*/}
                                                    {/*''*/}
                                            {/*}*/}
                                            {/*{(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}*/}
                                            {/*{(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}*/}
                                            {/*{(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}*/}
                                            {/*{containRowOthers?<Dropdown overlay={<Menu>*/}
                                                {/*{containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}*/}
                                                {/*{*/}
                                                    {/*(containDZSW&&!excessStatus)?*/}
                                                        {/*(record.infoState == '1'?(record.areaCode.startsWith('37')?<Menu.Item key='4' style={{color:"#999"}}> 电子税务局</Menu.Item>:<Menu.Item key='4' onClick={()=>dzswj(record)}> 电子税务局</Menu.Item>):<Menu.Item key='4' style={{color:"#999"}}> 电子税务局</Menu.Item>)*/}
                                                        {/*:''*/}
                                                {/*}*/}
                                                {/*{(containSBFManage&&!excessStatus)?<Menu.Item key='5' style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} onClick={() => this.sbOpen(record)}>社保费管理</Menu.Item>:''}*/}
                                                {/*{(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}*/}
                                                {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
                                            {/*</Menu>}>*/}
                                                {/*<a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}*/}
                                    </span>
                                    )
                                }
                            }
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
                                        (serviceCode==='1'&&permissionIds.includes('20010_300_1_300')&&!excessStatus)||(serviceCode==='0'&&permissionIds.includes('20010_300_0_300')&&!excessStatus)?<a href="javascript:"//查看
                                                                                                                                                                                                        onClick={() =>this.psbSetting(record.name,record.nsrsbh,record.orgId)}
                                        >
                                            {txt}</a>:<span style={{color:'#d7d7d7'}}>{txt}</span>
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
                                let content = (
                                    <div style={{fontSize:'12px'}}>
                                        <span>{record.downloadmessage}</span><br/>
                                        <span>,请运行App，或者<a style={{textDecoration:'underline'}} onClick={() => {this.errorMsg(record.downloadmessage)}}>扫码下载</a>后安装运行</span>
                                    </div>

                                )
                                let context = (
                                    <Popover
                                        content={content}
                                        placement="bottom" overlayClassName='customer-info-state-not-control-popover'
                                    ><Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#ff0000'}}></Icon></Popover>
                                )
                                if(text === '0'){
                                    txt = '未下载'
                                }else if(text === '2'){
                                    txt = '下载失败'
                                }else if(text === '3'){
                                    txt = '下载中'
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
                                                {txt}</a> :(text === '2' ?//下载失败
                                            <a href="javascript:"
                                               style={{color:'red',cursor:'default',textDecoration:'none'}}
                                            >
                                                {txt}
                                                {record.downloadmessage&&record.downloadmessage.indexOf("机器人SMS") != -1 ? context: <Popover placement="right" content={record.downloadmessage?record.downloadmessage:'下载失败！'} overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
                                                    <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#red',marginLeft:'5px'}}></Icon>
                                                </Popover>}
                                            </a>
                                            :(text==='3'?
                                                <a href="javascript:"
                                                   style={{color:'#caaf87'}}
                                                    // style={{color:'#caaf87',cursor:'default',textDecoration:'none'}}
                                                    // className={text === '查看'?'watchNS':''}
                                                   onClick={() => {this.downloadProgress(record)}}
                                                >
                                                    <Popover placement="right" content='纳税人信息下载中' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
                                                        {txt}
                                                    </Popover></a>:((serviceCode==='1'&&permissionIds.includes('20010_200_1_200'))||(serviceCode==='0'&&permissionIds.includes('20010_200_0_200'))?(record.changelinkman == 0?<a href="javascript:"//信息不完整 需要去补充
                                                                                                                                                                                                                                 onClick={() =>this.openSetting(record)}
                                                                                                                                                                                                                                 style={{paddingLeft:'20px'}}>
                                                    {txt}
                                                    <Popover placement="right" content='数据不完整，请补充' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
                                                        <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#cc0000',marginLeft:'5px'}}></Icon>
                                                    </Popover>
                                                </a>:<a href="javascript:"//查看
                                                        onClick={() =>this.openSetting(record)}
                                                >
                                                    {txt}</a>):'')))
                                    }

                            </span>
                                )}
                        })
                    }else if(item.id === 'ktzssqzt'){
                        arr.push({
                            title:<div>
                            <span title={item.caption} style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow:'hidden'}}>{item.caption}</span>
                                <Popover placement="bottom" content='开通后可使用无盘认证等快捷功能' overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
                                    <Icon
                                        fontFamily="edficon"
                                        type='XDZtishi'
                                        style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
                                    />
                                </Popover>
                            </div>,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            className: item.className,
                            render:(text,record) => {
                                let textList = {
                                    '001': '未申请',
                                    '002': '未申请',
                                    '007': '已开通',
                                    '004': '开通失败',
                                    '008': '开通失败',
                                }
                                if (!text){
                                    return (
                                        <span>申请中</span>
                                    )
                                } else if (text === '004' || text === '008') {
                                    return (
                                        <span>
                                        {textList[text]}
                                            <Popover placement="right"
                                                     content={record.ktzssbyy ? record.ktzssbyy : '申请失败！'}
                                                     overlayClassName='ttk-es-app-customer-ktszzs-popover'>
                                            <Icon fontFamily="edficon" type='jinggao'
                                                  style={{fontSize: '14px', color: 'red', marginLeft: '5px'}}/>
                                        </Popover>
                                    </span>
                                    )
                                } else {
                                    return (
                                        <span>
                                        {textList[text]}
                                    </span>
                                    )
                                }
                            }
                        })
                    } else if(item.id === 'gsmmjyjg'){
                        arr.push({
                            title: item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            render:(text,record) =>{
                                let txt = '';
                                let color = '';
                                if(text === '000'){
                                    txt = '未校验';
                                    color = '#666';
                                }else if(text === '001'){
                                    txt = '校验中';
                                    color = '#fd9400';
                                }else if(text === '002'){
                                    txt = '通过';
                                    color = '#666';
                                }else if(text === '003'){
                                    txt = '密码错误';
                                    color = '#f5222d';
                                }
                                return (
                                    <span style={{color:color}}>{txt}</span>
                                )
                            }
                        })
                    }else if(item.id === 'khsx'){
                        arr.push({
                            title: item.caption,
                            dataIndex: item.fieldName,
                            key: item.fieldName,
                            width: item.width,
                            align: item.align,
                            render:(text,record) =>{
                                let txt = '';
                                if(text === '001'){
                                    txt = '一次性服务'
                                }else if(text === '002'){
                                    txt = '周期性服务'
                                }else if(text === '003'){
                                    txt = '全部服务'
                                }
                                return (
                                    <span>{txt}</span>
                                )
                            }
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
        }
        // column.forEach((item, index) => {
        //     if (item.isVisible) {
        //         // width += item.width
        //         // if (item.children) {
        //         //     const child = [] // 多表头
        //         //     let col
        //         //     item.children.forEach(subItem => {
        //         //         if (subItem.isSubTitle) {
        //         //             child.push({
        //         //                 title: subItem.caption,
        //         //                 dataIndex: subItem.fieldName,
        //         //                 key: subItem.fieldName,
        //         //                 width: subItem.width,
        //         //                 align: subItem.align,
        //         //                 className: subItem.className,
        //         //                 render: (text, record) => (this.renderTaxAmount(text, record, subItem))
        //         //             })
        //         //         }
        //         //         else {
        //         //             const serviceCode = this.metaAction.gf('data.serviceCode')
        //         //             if (!(serviceCode === '0' && column[index + 1].isVisible)) {
        //         //                 col = {
        //         //                     title: subItem.caption,
        //         //                     dataIndex: subItem.fieldName,
        //         //                     key: subItem.fieldName,
        //         //                     width: subItem.width,
        //         //                     align: subItem.align,
        //         //                     className: subItem.className,
        //         //                     render: (text, record) => (this.renderStatus(record, subItem.type))
        //         //                 }
        //         //             }
        //         //         }
        //         //     })
        //         //     arr.push({
        //         //         title: item.caption,
        //         //         align: item.align,
        //         //         children: child,
        //         //         className: item.className,
        //         //     })
        //         //     if (col) {
        //         //         arr.push(col)
        //         //     }
        //         // }
        //         if (item.id === 'operation') {
        //             let appParams = JSON.parse(sessionStorage.getItem('appParams'))
        //             const showTableSetting = this.metaAction.gf('data.showTableSetting')
        //             const content = (
        //                 <p style={{padding:'5px 6px',fontSize:'12px',margin:0}}>电子税务局、社保费系统仅支持操作一户企业<br/>
        //             请不要同时打开多户。如需切换企业，<br/>
        //             请先关闭已打开的电子税务局、社保费系统页面。
        //                 </p>
        //             )
        //
        //             let containDetail = (serviceCode === '1' && permissionIds.includes('20010_200_1_100')) ||
        //                 (serviceCode === '0' && permissionIds.includes('20010_200_0_100'));
        //             let containDZSW = (serviceCode === '1' && permissionIds.includes('20010_300_1_700')) ||
        //                 (serviceCode === '0' && permissionIds.includes('20010_300_0_400'));
        //             let containSBFManage = (serviceCode === '1' && permissionIds.includes('20010_300_1_800')) ||
        //                 (serviceCode === '0' && permissionIds.includes('20010_300_0_500'));
        //             let containStopStart = (serviceCode === '1' && permissionIds.includes('20010_300_1_900')) ||
        //                 (serviceCode === '0' && permissionIds.includes('20010_300_0_100'));
        //             let containSZHY = (serviceCode === '1' && permissionIds.includes('20010_300_1_101')) ||
        //                 (serviceCode === '0' && permissionIds.includes('20010_300_0_600'));
        //             let containRowOthers = containStopStart || containSZHY;
        //             let divisionDetail = containDetail && (containDZSW || containSBFManage || containRowOthers);
        //             let divisionDZSW = containDZSW && (containSBFManage || containRowOthers);
        //             let divisionSBFManage = containSBFManage && containRowOthers;
        //
        //             arr.push({
        //                 title: (
        //                     <div>
        //                         操作
        //                        {/*<div style={{float:'right'}}>*/}
        //                            <Popover content={content} placement='bottom' overlayClassName='customer-info-state-not-control-popover'>
        //                                <Icon
        //                                    type='XDZtishi'
        //                                    fontFamily='edficon'
        //                                    style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
        //                                />
        //                            </Popover>
        //                        {/*</div>*/}
        //                         {/*<div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'} onClick={() => this.showTableSetting({ value: true })}>*/}
        //                             {/*<Icon*/}
        //                                 {/*type='setting'*/}
        //                                 {/*name='setting'*/}
        //                             {/*/>*/}
        //                             {/*{showTableSetting ? <span style={{ paddingLeft: '5px', display: 'inline' }}>列设置</span> : null}*/}
        //                         {/*</div>*/}
        //                     </div>
        //
        //                 ),
        //
        //                 className: 'operation',
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 // fixed: 'right',
        //                 render: (text, record) => {
        //                     if(record.infoState === '3'){
        //                         let content = (
        //                             <span>正在下载纳税人信息</span>
        //                         )
        //                         return (
        //                             <span class="customer-info-state-not-control">
        //                                 {containDetail?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
        //                                   <span> 详情</span>
        //                                 </Popover>:''}
        //                                 {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
        //                                 {(containDZSW&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
        //                                   <span> 电子税务局</span>
        //                                 </Popover>:''}
        //                                 {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
        //                                 {(containSBFManage&&!excessStatus)?<Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
        //                                   <span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}}> 社保费管理</span>
        //                                 </Popover>:''}
        //                                 {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
        //                                 <Popover content={content} placement="bottom" mouseEnterDelay="2" overlayClassName='customer-info-state-not-control-popover'>
        //                                   <span>更多 <Icon style={{color:'#999'}} type="down" /></span>
        //                                 </Popover>
        //                             </span>
        //                         )
        //                     }else if(appParams&&appParams.appParams&&appParams.appParams.jcymYhzxToken){
        //                         return (
        //                             <span>
        //                                 {containDetail?<Popover
        //                                      content={record.yzmxx}
        //                                      placement="left" overlayClassName='customer-info-state-not-control-popover'
        //                                  ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
        //                                 {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
        //                                 {divisionDetail?<span style={{ padding: '0 5px' }}>|</span>:''}
        //                                 {
        //                                     (containDZSW&&!excessStatus)?
        //                                         (record.infoState == '1'?(record.areaCode.startsWith('37')?<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>:<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>):<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)
        //                                         :''
        //                                 }
        //                                 {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
        //                                 {(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}
        //                                 {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
        //                                 {containRowOthers?<Dropdown overlay={<Menu>
        //                                     {containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}
        //                                     {(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}
        //                                     <Menu.Item key="3" onClick={() => this.dataHandover(record)}>资料交接</Menu.Item>
        //                                     {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
        //                                 </Menu>}><a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}
        //                             </span>
        //                         )
        //                     }else{
        //                         return (
        //                             <span>
        //                                 {containDetail?<Popover
        //                                      content={record.yzmxx}
        //                                      placement="left" overlayClassName='customer-info-state-not-control-popover'
        //                                  ><Icon fontFamily="edficon" type='jinggao' style={record.yzmxx&&record.yzmxx != "" ? {display: 'inlineBlock',fontSize:'13px',color:'#ff0000',marginRight:'4px'} : {display: 'none'}}></Icon></Popover>:''}
        //                                 {containDetail?<a href="javascript:void(0)" onClick={() => {this.details(record)}}> 详情</a>:''}
        //                                 {divisionDetail?<span style={record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702'?{display:'none'}:{ padding: '0 5px' }}>|</span>:''}
        //                                 {
        //                                     (containDZSW&&!excessStatus)?
        //                                         ((record.areaCode.startsWith('37')&&record.areaCode.substr(0,4) != '3702')?<a href="javascript:void(0)" style={{display:'none'}}> 电子税务局</a>:( record.infoState == '1'?<a href="javascript:void(0)" onClick={()=>dzswj(record)}> 电子税务局</a>:<a href="javascript:void(0)"style={{color:"#999"}}> 电子税务局</a>)):
        //                                         ''
        //                                 }
        //                                 {(divisionDZSW&&!excessStatus)?<span style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block',padding:'0 5px'}}>|</span>:''}
        //                                 {(containSBFManage&&!excessStatus)?<a style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'inline-block'}} href="javascript:void(0)" onClick={() => this.sbOpen(record)}>社保费管理</a>:''}
        //                                 {(divisionSBFManage&&!excessStatus)?<span style={{ padding: '0 5px' }}>|</span>:''}
        //                                 {containRowOthers?<Dropdown overlay={<Menu>
        //                                     {containStopStart?<Menu.Item key="1" onClick={() => this.stopCustomer(record.serviceCode,record.id,record.orgId)}>{record.serviceCode === 1 ?'停用':'启用'}</Menu.Item>:''}
        //                                     {(containSZHY&&!excessStatus)?<Menu.Item key="2" onClick={() => this.syndromesCombine(record)}>三证合一</Menu.Item>:''}
        //                                         {/*<Menu.Item key="3" onClick={() => this.sbOpen(record)} style={record.areaCode&&record.areaCode.substr(0,2) != '44'?{display:'none'}:{display:'block'}}>社保费管理</Menu.Item>*/}
        //                                     </Menu>}><a className="ant-dropdown-link" href="javascript:void(0)" style={{cursor:'pointer'}}>更多 <Icon style={{color:'#999'}} type="down" /></a></Dropdown>:''}
        //                             </span>
        //                         )
        //                     }
        //                 }
        //             })
        //         }else if(item.id === 'psbState'){
        //             arr.push({
        //                 title:(<span>票税宝</span>),
        //                 className: 'psb',
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 render:(text,record) =>{
        //                     let txt = '';
        //                     if(text === '0'){
        //                         txt = '未开通'
        //                     }else {
        //                         txt = '已开通'
        //                     }
        //                     return (
        //                         <span>
        //
        //                             {
        //                                 (serviceCode==='1'&&permissionIds.includes('20010_300_1_300')&&!excessStatus)||(serviceCode==='0'&&permissionIds.includes('20010_300_0_300')&&!excessStatus)?<a href="javascript:"//查看
        //                                        onClick={() =>this.psbSetting(record.name,record.nsrsbh,record.orgId)}
        //                                     >
        //                                         {txt}</a>:<span style={{color:'#d7d7d7'}}>{txt}</span>
        //                             }
        //
        //                     </span>
        //                     )}
        //             })
        //         } else if(item.id === 'infoState'){
        //             arr.push({
        //                 title:(<span>纳税人信息</span>),
        //                 className: 'nsrxx',
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 render:(text,record) =>{
        //                     let txt = '';
        //                     let content = (
        //                         <div style={{fontSize:'12px'}}>
        //                             <span>{record.downloadmessage}</span><br/>
        //                             <span>,请运行App，或者<a style={{textDecoration:'underline'}} onClick={() => {this.errorMsg(record.downloadmessage)}}>扫码下载</a>后安装运行</span>
        //                         </div>
        //
        //                     )
        //                     let context = (
        //                         <Popover
        //                             content={content}
        //                             placement="bottom" overlayClassName='customer-info-state-not-control-popover'
        //                         ><Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#ff0000'}}></Icon></Popover>
        //                     )
        //                     if(text === '0'){
        //                         txt = '未下载'
        //                     }else if(text === '2'){
        //                         txt = '下载失败'
        //                     }else if(text === '3'){
        //                         txt = '下载中'
        //                     }else {
        //                         txt = '查看'
        //                     }
        //                     return (
        //                         <span>
        //
        //                             {
        //                                 text === '0' ?//未下载
        //                                     <a href="javascript:"
        //                                        style={{color:'#666',cursor:'default',textDecoration:'none'}}
        //                                         // className={text === '查看'?'watchNS':''}
        //                                     >
        //                                         {txt}</a> :(text === '2' ?//下载失败
        //                                     <a href="javascript:"
        //                                        style={{color:'red',cursor:'default',textDecoration:'none'}}
        //                                     >
        //                                         {txt}
        //                                         {record.downloadmessage&&record.downloadmessage.indexOf("机器人SMS") != -1 ? context: <Popover placement="right" content={record.downloadmessage?record.downloadmessage:'下载失败！'} overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
        //                                             <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#red',marginLeft:'5px'}}></Icon>
        //                                         </Popover>}
        //                                        </a>
        //                                     :(text==='3'?
        //                                         <a href="javascript:"
        //                                            style={{color:'#caaf87'}}
        //                                            // style={{color:'#caaf87',cursor:'default',textDecoration:'none'}}
        //                                             // className={text === '查看'?'watchNS':''}
        //                                            onClick={() => {this.downloadProgress(record)}}
        //                                         >
        //                                             <Popover placement="right" content='纳税人信息下载中' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
        //                                                 {txt}
        //                                             </Popover></a>:((serviceCode==='1'&&permissionIds.includes('20010_200_1_200'))||(serviceCode==='0'&&permissionIds.includes('20010_200_0_200'))?(record.changelinkman == 0?<a href="javascript:"//信息不完整 需要去补充
        //                                        onClick={() =>this.openSetting(record)}
        //                                     style={{paddingLeft:'20px'}}>
        //                                         {txt}
        //                                             <Popover placement="right" content='数据不完整，请补充' overlayClassName='ttk-es-app-taxdeclaration-top-helpPopoverr'>
        //                                                 <Icon fontFamily="edficon" type='jinggao' style={{fontSize:'14px',color:'#cc0000',marginLeft:'5px'}}></Icon>
        //                                             </Popover>
        //                                         </a>:<a href="javascript:"//查看
        //                                                 onClick={() =>this.openSetting(record)}
        //                                         >
        //                                             {txt}</a>):'')))
        //                             }
        //
        //                     </span>
        //                     )}
        //             })
        //         }else if(item.id === 'ktzssqzt'){
        //             arr.push({
        //                 title:<div>
        //                     <span title={item.caption} style={{
        //                         whiteSpace: 'nowrap',
        //                         textOverflow: 'ellipsis',
        //                         overflow:'hidden'}}>{item.caption}</span>
        //                     <Popover placement="bottom" content='开通后可使用无盘认证等快捷功能' overlayClassName='ttk-zs-taxapply-app-taxlist-jinggaoPopover'>
        //                         <Icon
        //                             fontFamily="edficon"
        //                             type='XDZtishi'
        //                             style={{color:'#0066b3',fontSize:'18px',position:'relative',top:'2px'}}
        //                         />
        //                     </Popover>
        //                 </div>,
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 className: item.className,
        //                 render:(text,record) => {
        //                     let textList = {
        //                         '001': '未申请',
        //                         '002': '未申请',
        //                         '007': '已开通',
        //                         '004': '开通失败',
        //                         '008': '开通失败',
        //                     }
        //                     if (!text){
        //                         return (
        //                             <span>申请中</span>
        //                         )
        //                     } else if (text === '004' || text === '008') {
        //                         return (
        //                             <span>
        //                                 {textList[text]}
        //                                 <Popover placement="right"
        //                                          content={record.ktzssbyy ? record.ktzssbyy : '申请失败！'}
        //                                          overlayClassName='ttk-es-app-customer-ktszzs-popover'>
        //                                     <Icon fontFamily="edficon" type='jinggao'
        //                                           style={{fontSize: '14px', color: 'red', marginLeft: '5px'}}/>
        //                                 </Popover>
        //                             </span>
        //                         )
        //                     } else {
        //                         return (
        //                             <span>
        //                                 {textList[text]}
        //                             </span>
        //                         )
        //                     }
        //                 }
        //             })
        //         } else if(item.id === 'gsmmjyjg'){
        //             arr.push({
        //                 title: item.caption,
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 render:(text,record) =>{
        //                     let txt = '';
        //                     let color = '';
        //                     if(text === '000'){
        //                         txt = '未校验';
        //                         color = '#666';
        //                     }else if(text === '001'){
        //                         txt = '校验中';
        //                         color = '#fd9400';
        //                     }else if(text === '002'){
        //                         txt = '通过';
        //                         color = '#666';
        //                     }else if(text === '003'){
        //                         txt = '密码错误';
        //                         color = '#f5222d';
        //                     }
        //                     return (
        //                         <span style={{color:color}}>{txt}</span>
        //                     )
        //                 }
        //             })
        //         }else if(item.id === 'khsx'){
        //             arr.push({
        //                 title: item.caption,
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 render:(text,record) =>{
        //                     let txt = '';
        //                     if(text === '001'){
        //                         txt = '一次性服务'
        //                     }else if(text === '002'){
        //                         txt = '周期性服务'
        //                     }else if(text === '003'){
        //                         txt = '全部服务'
        //                     }
        //                     return (
        //                         <span>{txt}</span>
        //                     )
        //                 }
        //             })
        //         }
        //         else {
        //             arr.push({
        //                 title: item.caption,
        //                 dataIndex: item.fieldName,
        //                 key: item.fieldName,
        //                 width: item.width,
        //                 align: item.align,
        //                 className: item.className,
        //                 render: (text, record) => (this.renderTotalAmount(text, record, item)),
        //                 fixed: item.isFixed
        //             })
        //         }
        //     }
        // })
        // this.metaAction.sf('data.columnsWidth', width)
        //
        return arr
    }
    salesPurchaseClick = (record, t) => {
        const vatTaxpayer = this.metaAction.gf('data.serviceCode'),
            nsqj = this.metaAction.gf('data.nsqj').format('YYYYMM')
        let appName = `${t == 1 ? 'inv-app-batch-sale-list' : 'inv-app-batch-purchase-list'}?vatTaxpayer=${vatTaxpayer}&nsqj=${nsqj}&qyId=${record.qyId}&xgmJbOrYb=${record.cwbbType === '季报' ? '1' : '0'}`
        if (this.component.props.openDanhu) {
            this.component.props.openDanhu(record.qyId, appName, t==1 ? '销项发票' : '进项发票')
        } else if (this.component.props.onRedirect) {
            this.component.props.onRedirect({ appName })
        } else {
            this.metaAction.toast('error', '进入方式不对')
        }
    }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }
    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-custom-list')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                const tbodyWidth = tbodyDom.offsetWidth;
                const columnsWidth = this.metaAction.gf('data.columnsWidth')
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                       x: columnsWidth > width ? columnsWidth: 1,
                        y: height - theadDom.offsetHeight,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                       x: columnsWidth >  width  ? columnsWidth: 1
                    })
                }
            }
        } catch (err) { }
    }
    getCheckboxProps = record => {
        let downloadNSRXX = this.metaAction.gf('data.downloadNSRXX').toJS()
        return {
            disabled: false,
            // disabled: downloadNSRXX.includes(record.id),
            name: record.name,
        }
    }
    nsrMessStatusChange = (e) => {
        if(e===''||e==='1'){
            this.injections.reduce('updateSingle', 'data.formContent.nsrMessStatus',e)
        }else{
            this.injections.reduce('updateObj', {
                'data.formContent.nsrMessStatus':e,
                'data.formContent.messageWholeStatus':'',
            })
        }
    }
    refreshCustomerList = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const resp = await this.webapi.customer.cxgpzszt()
        if(resp){
            this.load()
        }
    }

    getJCYMParam = () => {

    }

    getCustomerPermission = async (rangeType) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let params = {
            menuid : '20010',
            range : rangeType?rangeType:'self',
            bs : '0'
        }
        const resp = await this.webapi.customer.getUserMenuBtnAuthByToken(params)
        if(resp){
            console.info(resp)
            let resPermission = resp.data&&resp.data.length>0?resp.data[0]:{
                btnqx:{
                    200:[],
                    300:[],
                    400:[]
                },
                operation:''
            }
            let resOperation = resPermission.operation
            let resOperationList = resOperation.split(',')
            let permission200 = resOperationList.includes('200')?resPermission.btnqx[200]:[]
            let permission300 = resOperationList.includes('300')?resPermission.btnqx[300]:[]
            let permission400 = resOperationList.includes('400')?resPermission.btnqx[400]:[]
            let permission200Id = permission200.map(item=>item.btnId)
            let permission300Id = permission300.map(item=>item.btnId)
            let permission400Id = permission400.map(item=>item.btnId)
            let permissionIds = [].concat(permission200Id,permission300Id,permission400Id)

            let containsOthers = permissionIds.includes('20010_300_1_102')||permissionIds.includes('20010_300_1_400')||
                permissionIds.includes('20010_400_1_100')||permissionIds.includes('20010_200_1_400')||permissionIds.includes('20010_200_1_500')||
                permissionIds.includes('20010_300_1_900')

            this.injections.reduce('updateObj', {
                'data.permission200Id' : fromJS(permission200Id),
                'data.permission300Id' : fromJS(permission300Id),
                'data.permission400Id' : fromJS(permission400Id),
                'data.permissionIds' : fromJS(permissionIds),
                'data.containsOthers' : fromJS(containsOthers)
            })
        }

        /*let permission200Id = []
        let permission300Id = []
        let permission400Id = []
        let permissionIds = ['20010_200_1_100','20010_200_1_200','20010_200_1_300','20010_300_1_100',
            '20010_300_1_200','20010_300_1_300','20010_300_1_400','20010_300_1_500','20010_300_1_600',
            '20010_300_1_700','20010_300_1_800','20010_300_1_900','20010_300_1_101','20010_300_1_102',
            '20010_200_0_100','20010_400_1_100','20010_200_0_200','20010_200_0_300','20010_300_0_100',
            '20010_300_0_200','20010_300_0_300','20010_300_0_400','20010_300_0_500','20010_300_0_600',
            '20010_300_0_700','20010_300_0_700']
        let containsOthers = permissionIds.includes('20010_300_1_102')||permissionIds.includes('20010_300_1_400')||
            permissionIds.includes('20010_400_1_100')||permissionIds.includes('20010_300_1_900')

        this.injections.reduce('updateObj', {
            'data.permission200Id' : fromJS(permission200Id),
            'data.permission300Id' : fromJS(permission300Id),
            'data.permission400Id' : fromJS(permission400Id),
            'data.permissionIds' : fromJS(permissionIds),
            'data.containsOthers' : fromJS(containsOthers)
        })*/
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
