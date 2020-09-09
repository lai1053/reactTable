import React from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import md5 from 'md5'
import {Carousel, Toast ,Radio} from 'edf-component'
import { Popover, Button, Link, Checkbox } from 'antd'
import { Base64, path, string, environment } from 'edf-utils'
import { consts } from 'edf-consts'
import {tableColumnsField} from './staticField'
import { toJS, fromJS} from 'immutable'
import RadioTable from './radioTable.js'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        let props = this.component.props
        this.callBack=this.component.props.callBack
        this.visible=false
        this.list=[]
        //删除打点存储信息
        let info = { mobile: '', password: '', remember: false }
        injections.reduce('init', info)
        this.load()
         //绑定回车事件
         this.bindEnter()
    }
    load= async () => {
        let props = this.component.props
        let queryresult=''   
        this.metaAction.sf('data.loading', true)
        let interval = setInterval(async()=> {    //代码B
            queryresult=await this.webapi.importapi.queryresult({taskid:props.id,task:"Login"});
            if (queryresult) {
                this.list=JSON.parse(queryresult).Data.AcctList
                this.injections.reduce('load', props.reqlist,JSON.parse(queryresult).Data.AcctList)
                clearInterval(interval);    //终止循环
                this.metaAction.sf('data.loading', false)
                setTimeout(() => {
                    this.onResize()
                }, 20)
            }
        }, 2000);
      
    }
    setData= async(id,task) => {
        let queryresult=await this.webapi.importapi.queryresult({taskid:id,task:task});
        return queryresult
    }
    bindEnter = () => {
        let that = this
        document.onkeydown = function (e) {
            let keyCode = e.keyCode
            if (keyCode !== 13) return
            that.query()
        }
    }
    changeSelectTimeTitle =  () => {
        //this.component.props.closeModal()
        let closeBtn = document.getElementsByClassName('ant-modal-close')
        if (closeBtn && closeBtn.length > 0) {
            if(closeBtn.length>2){
                closeBtn[closeBtn.length-1].click()
                closeBtn[closeBtn.length-1].click()
            }else{
                closeBtn[closeBtn.length-1].click()
            }
            
        }
    }
    export = async () => {
        let list = this.metaAction.gf('data.list').toJS()
        //用户登录接口
        let reqlist={
            user:this.component.props.reqlist.user,     
            password:this.component.props.reqlist.password, 
            softType:this.component.props.reqlist.softType,     
            verType:this.component.props.reqlist.verType,   
            qyId:this.component.props.reqlist.qyId, 
            task:"CollectData",
            softName:this.component.props.reqlist.softName, 
            orgName:"",
            orgCode:"",
            tYear:''
        }
        if(list.length>0){
            list.forEach(item=>{
                if(item.checked){
                    reqlist.orgName=item.OrgName
                    reqlist.orgCode=item.OrgCode
                    reqlist.tYear=Number(item.ZTYear)
                }
            })
            if(!reqlist.orgName){
                this.metaAction.toast('warning', '请选择导入的数据')
            }else{
                //接口
                let daoshangModalShow=sessionStorage['daoshangModalShow']
                let createTask= this.webapi.importapi.createTask(reqlist)
                if(!daoshangModalShow){
                    let ret =  this.metaAction.modal('show', {
                        title: '提示',
                        width: 550,
                        closable: false,
                        closeModal: this.handleOk,
			            closeBack: (back) => { this.closeTip = back },
                        footer:[
                            <Button type="primary"  onClick={this.handleOk}>
                                确定  
                            </Button>],
                        className: 'currency-modal-container',
                        children: (
                            <div>
                                <div style={{marginBottom: '10px'}}>正在为您采集账套，请关注该客户的导账状态。采集成功后请点击“继续导账”。</div>
                                <div>
                                    <Checkbox
                                        onChange={this.handleChange}
                                    >不再提示
                                </Checkbox>
                                </div>
                            </div>
                        )
                    })
                }else{
                    this.component.props.closeModal()
                }
            }
        }else{
            this.metaAction.toast('warning', '当前没有可导入数据')
        }
       
    }
    
	handleOk = (ret) => {
        this.closeTip()
        this.component.props.closeModal()
	}
    handleChange = (e) => {
        sessionStorage.setItem('daoshangModalShow', e.target.checked)
    }
    query=(record,index,e)=> {
        let mobile=this.metaAction.gf('data.form.mobile')
        let listdata=[]
        this.list.filter(item => {
            if(item.OrgName.indexOf(mobile)>-1){
                listdata.push(item)
            }
        })
        this.metaAction.sf('data.list',fromJS(listdata))
        setTimeout(() => {
            this.onResize()
        }, 20)
    }
    renderTotalAmount = (text) => {
		return (
			<span title={text}>{text}</span> 
        )
    }
    onChange=(record,index,e)=> {
        let list = this.metaAction.gf('data.list').toJS()
        if(list.length>0){
            list.forEach(item=>{
                item.checked=false
            })
            list[index].checked=true
            this.metaAction.sf('data.list',fromJS(list))
        }

    }
    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        column.forEach((item, index) => {
            if (item.dataIndex=='id'){
                arr.push({
                    title: item.title,
                    dataIndex: item.dataIndex,
                    key: item.dataIndex,
                    width: 50,
                    align:item.align,
                    render: (text, record, index) => {
                        const obj = {
                          children:  <div>
                                        <Radio  onChange={this.onChange.bind(this,record,index)} checked={record.checked}></Radio>
                                    </div>, 
                        };
                        return obj;
                      },                      
                })
            }else if (item.dataIndex=='index'){
                arr.push({
                    title: item.title,
                    dataIndex: item.dataIndex,
                    key: item.dataIndex,
                    width: 50,
                    align:item.align,
                    render:(text, record, index) => {
                        return <span >{index+1} </span>
                    }                    
                })
            }else{
                arr.push({
                    title: item.title,
                    dataIndex: item.dataIndex,
                    key: item.dataIndex,
                    // width:item.width,
                    align:item.align,
                    render: (value, item) => this.renderTotalAmount(value)
                     
                })
            }
        })
        return arr
	}
    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('ttk-gl-app-importdata-login-list-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
               
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
                }, 500)
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
    rowCallback = (arr) => {
        console.log(arr)
        this.metaAction.sf('data.selectedRowKeys', fromJS(arr))
    }
    renderModal = () => {
        //this.metaAction.gf('data.spbmList').toJS()
        const list = this.metaAction.gf('data.list').toJS()
        const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys').toJS()
        const loading = this.metaAction.gf('data.loading')
        // console.log(spbm, 'spbm')
        return <div className="-body">
                <div className="-radio-table">
                    <RadioTable className="-table" loading={loading} data={list} selectedRowKeys={selectedRowKeys} callback={this.rowCallback} />
                </div>
            </div>
    }
    //检查是否要置灰登录
    checkLogin = () => {
        let list = this.metaAction.gf('data.list').toJS()
        let reqlist={}
        if(list.length>0){
            list.forEach(item=>{
                if(item.checked){
                    reqlist.list=item
                }
            })
        }
        
        if(reqlist.list){
            return false
        }else{
            return true
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
