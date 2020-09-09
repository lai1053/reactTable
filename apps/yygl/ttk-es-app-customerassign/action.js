import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS, toJS, is } from 'immutable'
import {Icon, Tooltip, Dropdown, Menu, Select,Popover} from 'edf-component'
import { message, Modal } from 'antd'
import config from './config'
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
    }

    initPage = () => {
        let filterFormOld = this.metaAction.gf('data.filterFormOld').toJS()
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('updateObj', {
            'data.filterForm': fromJS(filterFormOld),
            'data.pagination': fromJS(pagination),
            'data.inputVal': ''
        })
        // this.getColumns()
        this.load();
        this.customer();

    }

    /*queryTableHead = async () =>{//动态表头
        const res = await this.webapi.assign.queryTableHead()
        console.log('我是数据',res)
        // this.metaAction.sf('data.columns',fromJS([]))
        if(res){
            this.metaAction.sf('data.columns',fromJS(res))

        }

    }*/



    resetForm = () => {//重置
        const { filterFormOld, formContent } = this.metaAction.gf('data').toJS()
        Object.assign(formContent, filterFormOld)
        this.injections.reduce('updateSingle', 'data.formContent',fromJS(formContent))
    }
    filterList = () => {//查询
        this.injections.reduce('tableLoading', true)
        const { formContent } = this.metaAction.gf('data').toJS()
        this.injections.reduce('updateObj', {
            'data.filterForm': fromJS(formContent),
            'data.showPopoverCard': false,
            'data.pagination.currentPage': 1
        })
        this.load()
    }


    //导入进度弹窗
    openAssignImportProgress = async (seqNo,res,sessionNo) => {
        const ret = await this.metaAction.modal('show', {
            title: '导入分配数据',
            className: 'ttk-es-app-customerassign-import-progress-modal',
            wrapClassName: 'card-archive',
            width: 500,
            height: 500,
            footer:null,
            centered:true,
            // okText:'终止下载',
            children: this.metaAction.loadApp('ttk-es-app-customerassign-import-progress', {
                store: this.component.props.store,
                seqNo:seqNo,
                sessionNo:sessionNo,
                res:res,
            })
        });
        this.load()
    }

    judgeChoseBill = async (type) => {
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if (type !== 'importAssign'&&
            checkboxValue && checkboxValue.length === 0) {
            message.warning('请先选择客户！')
            return
            //批量客户分配
        }else if(type === 'assignCustomer'){
            let result = this.metaAction.gf('data.job').toJS()
            let customerList = this.metaAction.gf('data.customerList').toJS()
            // let isLD = this.metaAction.gf('data.isLD')
            let columns = this.metaAction.gf('data.columns');
            const ret = await this.metaAction.modal('show', {
                title: '批量分配：已选择' + checkboxValue.length +'个客户',
                className:'customerassign-style',
                children: this.metaAction.loadApp('ttk-es-app-customerassign-modal', {
                    store: this.component.props.store,
                    params:{
                        list: result,
                        customerList:customerList,
                        type:'pl',
                        // isLD:isLD,
                        // columns:columns,
                    }
                })
            });
            this.load();
        }else if(type === 'importAssign'){
            const ret = await this.metaAction.modal('show', {
                title: '导入分配',
                width: 460,
                height: 330,
                cancelText: '取消',
                okText: '导入',
                children: this.metaAction.loadApp('ttk-es-app-customerassign-import', {
                    store: this.component.props.store,
                    path: 'person'
                })
            });

            if (ret) {
                if(ret.seqNo){
                    let res = await this.webapi.assign.getImportAsyncStatusNew({seqNo:ret.seqNo})
                    console.info(res)
                    if(res){
                        if(res.exmsg){
                            this.metaAction.toast('warning', res.exmsg)
                        }else{
                            this.openAssignImportProgress(ret.seqNo,res,ret.sessionNo)
                        }
                    }
                }else{
                    this.metaAction.toast('warning', '导入失败')
                }
            }

        }
    }



    customer = async (option) => {
        this.injections.reduce('updateObj', {
            'data.user':fromJS([]),
            'data.formContent.customerName':fromJS('')
        })
        // console.log(';;;;',option)
        let data = {};
        data.roleId = option
        let res = await this.webapi.assign.queryJobUser(data);
       if(res){
           console.log('....',res)
           this.injections.reduce('updateSingle', 'data.user',fromJS(res))
       }
    }

    userData = (data) =>{
        if(!data) return null
        let arr = []
        data.forEach((option) => arr.push(<Select.Option value={option.sysUserId}>{option.name}</Select.Option>))
        return arr
    }

    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        const res = await this.webapi.assign.getfpkh(params)
        // debuggercheckboxChange
        this.injections.reduce('updateObj', {
            'data.other.permission.treeData':res.body.bmxx,
            'data.other.permission.all':res.body.all,
            // 'data.other.permission.self':res.body.self
            'data.maxde':res.body.bmxx[0].bmdm
        })
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
            setData = {this.setData}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }

    handleConfirm = (data) => {
        //权限管理点击确认
        this.injections.reduce('updateSingle', 'data.checkedKeys.checked',data)
        let checked=this.metaAction.gf('data.checkedKeys.checked');
        let ifgs = this.metaAction.gf('data.ifgs');
        this.load();
    }
    handleReset = (data) => {
        //权限管理点击重置
        console.log("11111111111111");
        this.injections.reduce('updateSingle', 'data.checkedKeys.checked',data)
        //console.log(data)
        this.load();
    }

    setData = (path,val) =>{
        this.injections.reduce('updateSingle', path,val)
    }

    load = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        this.queryQX();
        this.setHeader();
        /********判断是否有理单岗 start*********************************/
        // let gwDefault = [
        //     {
        //         id: 'customerName',
        //         caption: "客户名称",
        //         fieldName: 'customerName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        //     {
        //         id: 'helpCode',
        //         caption: "助记码",
        //         fieldName: 'helpCode',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'fpgUserName',
        //         caption: "发票岗",
        //         fieldName: 'fpgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'bsgUserName',
        //         caption: "报税岗",
        //         fieldName: 'bsgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'jzgUserName',
        //         caption: "记账岗",
        //         fieldName: 'jzgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'cxgUserName',
        //         caption: "查询岗",
        //         fieldName: 'cxgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        //     {
        //         id: 'jzshUserName',
        //         caption: "记账审核岗",
        //         fieldName: 'jzshUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        // ]//没有理单岗位
        // let gwLD = [
        //     {
        //         id: 'customerName',
        //         caption: "客户名称",
        //         fieldName: 'customerName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        //     {
        //         id: 'helpCode',
        //         caption: "助记码",
        //         fieldName: 'helpCode',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'fpgUserName',
        //         caption: "发票岗",
        //         fieldName: 'fpgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'bsgUserName',
        //         caption: "报税岗",
        //         fieldName: 'bsgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'jzgUserName',
        //         caption: "记账岗",
        //         fieldName: 'jzgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },{
        //         id: 'cxgUserName',
        //         caption: "查询岗",
        //         fieldName: 'cxgUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        //     {
        //         id: 'jzshUserName',
        //         caption: "记账审核岗",
        //         fieldName: 'jzshUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        //     {
        //         id: 'ldUserName',
        //         caption: "理单岗",
        //         fieldName: 'ldUserName',
        //         // isFixed: true,
        //         isVisible: true,
        //         // width: '18%',
        //         // isMustSelect: true,
        //         align: '',
        //         className:'',
        //     },
        // ]//有理单岗位
        // let res =  await this.webapi.assign.getLD()
        // // console.log(res,'res')
        // if(res){
        //     this.metaAction.sf('data.columns',fromJS(gwLD));
        //     this.metaAction.sf('data.isLD',1);
        // }else {
        //     this.metaAction.sf('data.columns',fromJS(gwDefault));
        // }
        /********判断是否有理单岗 end*********************************/
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        const customerName = this.metaAction.gf('data.inputVal')//输入的客户名称或是助记码
        const filterForm = this.metaAction.gf('data.filterForm').toJS()//隐藏筛选条件
        const js = this.metaAction.gf('data.js')
        console.log('我是筛选数据',filterForm.customerTypeStatus)
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
        const params = {
            entity:{
                "departments":type,
                customerName:customerName,
                roleId:filterForm.jobTypeStatus === '' ? 0 : filterForm.jobTypeStatus,
                userId:filterForm.customerName === '' ? 0 : filterForm.customerName,
                vatTaxpayer:filterForm.customerTypeStatus === '' ? 0 : filterForm.customerTypeStatus,
                searchType:types,
                // status:filterForm.assignTypeStatus === '' ? 'all' : filterForm.assignTypeStatus,
                status:js == 1 ? filterForm.assignTypeStatus = 'all': filterForm.assignTypeStatus===''?'all':filterForm.assignTypeStatus,
                khsx:'000'

            },
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        sessionStorage.setItem('importData',JSON.stringify(params))
        const resp = await this.webapi.assign.queryUserData(params)
        if (resp) {
            this.injections.reduce('updateObj', {
                'data.list':fromJS(resp.list),
                'data.tableCheckbox':fromJS({
                    checkboxValue: [],
                    selectedOption: []
                })
            })
            this.injections.reduce('load', resp)
            setTimeout(() => {
                this.onResize()
                this.injections.reduce('tableLoading', false)
            }, 50)
        } else {
            this.injections.reduce('tableLoading', false)
        }

    }

    //查询数据权限
    queryQX = async() => {
        let qx = await this.webapi.assign.queryQX();
        this.injections.reduce('updateSingle', 'data.qx',qx)
    }

    //查询动态表头
    setHeader = async () => {
        let getHeader = await this.webapi.assign.getTableHeader({sfbt:1});
        if(getHeader){
            getHeader.push({
                        id: 'operation',
                        caption: "操作",
                        fieldName: 'operation',
                        // isFixed: true,
                        isVisible: true,
                        // width: '18%',
                        // isMustSelect: true,
                        align: '',
                        className:'',
                    },)
            this.injections.reduce('updateSingle', 'data.columns',fromJS(getHeader))
        }
        let jobList = this.metaAction.gf('data.columns').toJS();
        let jobType = [{caption: '全部', roleId: ''}]
        if (jobList){
            jobList.forEach(item => {
                if(item.roleId){
                    jobType.push(item)
                }
            })
            this.injections.reduce('updateSingle', 'data.jobType',fromJS(jobType))
        }

    }

    onSearch = () => {
        this.injections.reduce('tableLoading', true)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('updateSingle', 'data.pagination', fromJS(pagination))
        this.load()
    }
//隐藏的筛选条件
    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { filterForm } = this.metaAction.gf('data').toJS()
            this.injections.reduce('updateObj', {
                'data.formContent': fromJS(filterForm),
                'data.showPopoverCard': visible
            })
        }else{
            this.injections.reduce('updateSingle', 'data.showPopoverCard', visible)
        }
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
        console.log('确认',data)
        // const columns = []
        // const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        // const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // for (const item of data) {
        //     item.isVisible ? columns.push(item.id) : null
        // }
        // const resp = await this.webapi.invoice.upDateColumn({
        //     pageID,
        //     columnjson: JSON.stringify(columns)
        // })
        // if (!this.mounted) return
        // if (resp) {
        //     this.getColumns()
        //     this.injections.reduce('tableSettingVisible', { value })
        // }

    }

    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        alert('重置')
        // const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        // const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // let res = await this.webapi.invoice.deleteColumn({ pageID })
        // if (!this.mounted) return
        // if (res) {
        //     this.injections.reduce('update', {
        //         path: 'data.showTableSetting',
        //         value: false
        //     })
        //     this.getColumns()
        // }
    }
    //单个客户分配
    openAssign = async(data) =>{
        console.log(data,'data')
        let result = this.metaAction.gf('data.job').toJS()
        let customerList = [];
        customerList.push(data.customerId)
        // let isLD = this.metaAction.gf('data.isLD')
        let columns = this.metaAction.gf('data.columns');
        const ret = await this.metaAction.modal('show', {
            title: '客户分配：' + data.customerName,
            className:'customerassign-style',
            children: this.metaAction.loadApp('ttk-es-app-customerassign-modal', {
                store: this.component.props.store,
                params:{
                    list: result,
                    customerList:customerList,
                    type:'dg',
                    dt:data,
                    // isLD:isLD,
                    // columns:columns,
                }
            })
        });
        this.load();
    }

    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        // let width = 0
        // console.log('111',column)
        const qx = this.metaAction.gf('data.qx')
        column.forEach((item,index) => {
            if(item.id === 'operation'){
                const content = (
                    <p style={{padding:'5px 6px',fontSize:'12px',margin:0}}>数据权限类型为【机构】和【部门】可进行客户分配，<br/>
                        数据权限类型为【个人】不可进行客户分配</p>
                )
                arr.push({
                    title:(
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
                    dataIndex: item.fieldName,
                    key: item.fieldName,
                    // width: item.width,
                    align: 'center',
                    className: item.className,
                    render:(text,record) =>{
                        return (
                           <span>
                               {
                                   qx == 0 ?
                                       <a href="javascript:" style={{color:'#999'}}>分配</a>:
                                       <a href="javascript:" style={{cursor:'pointer'}} onClick={() => this.openAssign(record)}>分配</a>
                               }
                           </span>
                        )}
                })
            }
            // if(item.isVisible){
            //     width += item.width;
            //     if(index === column.length-1){
            //         const showTableSetting = this.metaAction.gf('data.showTableSetting')
            //         arr.push({
            //             title: (
            //                 <div>
            //                     {item.caption}
            //                     <div className={showTableSetting ? 'setting-box setting-active' : 'setting-box setting'} onClick={() => this.showTableSetting({ value: true })}>
            //                         <Icon
            //                             type='setting'
            //                             name='setting'
            //                         />
            //                         {showTableSetting ? <span style={{ paddingLeft: '5px', display: 'inline' }}>列设置</span> : null}
            //                     </div>
            //                 </div>
            //
            //             ),
            //             className: 'operation',
            //             dataIndex: item.fieldName,
            //             key: item.fieldName,
            //             width: item.width,
            //             align: item.align,
            //             render: (text, record) => (<span>{text}</span>),
            //             fixed: item.isFixed
            //         })
            //     }
            else{
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        // width: item.width,
                        align: item.align,
                        className: item.className,
                        render: (text, record) => {
                            // if(typeof text == 'object'){
                            //     console.log('3333',text)
                            //     let txt = ''
                            //     if (text.length > 0){
                            //         text.forEach((data) => txt = txt+',' +data.zymc)
                            //         return (<span>{txt.substring(1,txt.length)}</span>)
                            //     }else {
                            //         txt = ''
                            //         return (<span>{txt}</span>)
                            //     }
                            //
                            // }
                            // console.log('sssssssss',text)
                            return (<span title={text}>{text}</span>)








                        },
                        // fixed: item.isFixed
                    })
                }

            // }
        })
        // this.metaAction.sf('data.columnsWidth', width)
        // debugger
        return arr
    }

    //选择数据改变
    checkboxChange = (arr, itemArr,e) => {
        // debugger
        console.log(e)
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('updateObj', {
            'data.customerList':fromJS(arr),
            'data.tableCheckbox':fromJS({
                checkboxValue: newArr,
                selectedOption: newItemArr
            })
        })
        //this.selectedOption = newItemArr
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

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }

    btnClick = () => {
        this.injections.reduce('modifyContent')
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
}



export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

