import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS, toJS, is } from 'immutable'
import { Icon, Tooltip, Dropdown, Menu} from 'edf-component'
import config from './config'
import utils from "edf-utils";

class action{
    constructor(option){
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')

        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener;
        if (addEventListener) {
            // addEventListener('onTabFocus', :: this.initPage);
        }

        this.onLoad()
    }

    onLoad = async ()=> {
        this.metaAction.sf('data.loading',true)
        let data = await this.webapi.mediation.fetchMediationList()
        let item = data.data
        console.info(item)
        if(item&&!item.error){
            if(item instanceof Array){
                let pagination = {
                    currentPage: 1,//-- 当前页
                    pageSize: 50,//-- 页大小
                    totalCount: item?item.length:0,
                    totalPage: 0
                }
                this.injections.reduce('updateObj', {
                    'data.list':fromJS(item),
                    'data.pagination':pagination
                })
            }else{
                this.metaAction.toast('error', '加载失败，请重试！！')
            }
        }else{
            this.metaAction.toast('error', '加载失败，请重试！！')
        }
        this.injections.reduce('updateSingle', 'data.loading',false)
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

    }
    doOpen = async (record) => {
        let _this = this
        const ret = await this.metaAction.modal('confirm', {
            title: '开通',
            content: '确定要开通该中介吗?',
        });
        if(ret){
            _this.doRecordOpen(record)
        }
    }
    doRecordOpen = async (record)=>{
        this.injections.reduce('updateSingle', 'data.loading',true)
        let params = {
            customerId:record.customerId
        }
        let response = await this.webapi.mediation.mediaOpen(params)
        if (response){
            if (response.success) {
                this.metaAction.toast('success', '开通成功！')
                this.onLoad();
                this.injections.reduce('updateSingle', 'data.loading',false)
                return response
            } else {
                this.metaAction.toast('error', '开通失败，请重试！！')
                this.injections.reduce('updateSingle', 'data.loading',false)
                return false
            }
        }
        this.injections.reduce('updateSingle', 'data.loading',false)
    }

    //删除部门
    doItOpen = (obj) => {
        this.doOpen(obj);//传入需要删除的部门ID
    };
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}