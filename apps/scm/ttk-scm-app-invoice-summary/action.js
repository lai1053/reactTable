import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS } from 'immutable'
import { LoadingMask, TableOperate } from 'edf-component'
import extend from './extend'
import config from './config'
import moment from 'moment'
import renderColumns from './utils/renderColumns'

class action {

    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    //初始化
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init')
        this.load()
    }
    load = async () => {
        this.getEnableDate().then((parmas) => {
            this.sortParmas()
        })
    }
    onTabFocus = () => {
        this.getEnableDate().then((parmas) => {
            this.sortParmas()
        })
    }

     //渲染列
	getColumns = () => {
        let arr = []
        let dataArr = [{title:'开票总份数',fieldName:'name'},
                        {title:'蓝字发票份数',fieldName:'blue'},
                        {title:'红字发票份数',fieldName:'red'},
                        {title:'作废发票份数',fieldName:'aa'},
                        {title:'金额汇总',fieldName:'num'},
                        {title:'税额汇总',fieldName:'rate'},
                        {title:'价税合计金额',fieldName:'sum'}]
        dataArr.map((data,index)=>{
            arr.push({
                title: data.title,
                key: data.fieldName,
                name: data.fieldName,
                // width: data.width,
                dataIndex: data.fieldName,
                // render: (text, record, index) => this.normalTdRender(text, record, index, data.fieldName)
                render: (text, record, index) => <span>{text}</span>
            })
        })
        debugger
        return arr
    }
    operateCol = (text, record, index) => {
        // const { voucherState, docId } = record
        // const num = this.calcRowSpan(docId, 'docId', index)
        const obj = {
            children: (
                <span>
                    <TableOperate
                        // viewClick={() => this.openMoreContent(docId, false)}
                        // editClick={() => this.openMoreContent(docId, true)}
                        // deleteClick={() => this.delModal(docId, record.ts)}
                        // noteClick = {() => this.operateNote(record.note?record.note:'')}
                        // submitNote = {(value) => this.submitNote(docId, record.ts, value)}
                        // status={voucherState == consts.VOUCHERSTATUS_Approved ? 1 : 2}
                    />
                </span>
            ),
            props: {
                // rowSpan: num,
                rowSpan: 3,
            }
        }
        return obj
    }

    normalTdRender = (text, record, index, key) => {
        return <span className="app-proof-of-list-td-con" title={text}>{text}</span>
    }
    normalTdRender2 = (text) => {
        return <span title={text} className="app-proof-of-list-td-con" title={text}>{text}</span>
    }
    
    //销项发票
    handleSa = () => {
        this.component.props.setPortalContent && this.component.props.setPortalContent('销项','ttk-scm-app-sa-invoice-list',{accessType: 1,})
    }

    //进项发票
    handlePu = () => {
        this.component.props.setPortalContent && this.component.props.setPortalContent('进项','ttk-scm-app-pu-invoice-list',{accessType: 1})
    }

    // //获取开账期间
    getEnableDate = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        const enabledPeriod = currentOrg.enabledYear + '-' + `${currentOrg.enabledMonth}`.padStart(2, '0')
        this.metaAction.sf('data.enableDate', enabledPeriod)
        const isChangeSipmleDate = this.metaAction.gf('data.changeSipmleDate')
        if (!isChangeSipmleDate) {
            const docVoucherDate = await this.webapi.apocRptStatement.getDocVoucherDate()
            const maxDocPeriod = docVoucherDate.year + '-' + `${docVoucherDate.period}`.padStart(2, '0')
            this.metaAction.sf('data.period', maxDocPeriod)
        }
    }
    //日期选择
    onDatePickerChange = (value) => {
        this.metaAction.sf('data.period', value)
        this.metaAction.sf('data.changeSipmleDate', true)
        this.sortParmas()
    }

    //刷新
    refresh = (value) => {
        this.sortParmas()
    }
    //导出
    export = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return
        }

        this.sortParmas('get').then((parmas) => {
            this.webapi.apocRptStatement.export(parmas)
        })
    }
    //打印
    print = async () => {
        if (this.metaAction.gf('data.list').length == 0) {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return
        }
        this.sortParmas('get').then((parmas) => {
            this.webapi.apocRptStatement.print(parmas)
        })
    }

    sortParmas = async (type) => {
        const voucherMoment = moment(this.metaAction.gf('data.period'))
        let date = voucherMoment.format('YYYY-MM');//当前月份
        let begin = moment(date).startOf('month')//起始日期
        let end = moment(date).endOf('month')//结束日期
        begin = begin.format('YYYY-MM-DD');
        end = end.format('YYYY-MM-DD');
        let params = {
            countFlag: 1,
            begin,
            end
        }
        if (type == 'get') {
            return { ...params }
        }

        this.metaAction.sf('data.loading',true)
        const response = await this.webapi.queryInvoiceSum(params)
        this.metaAction.sf('data.loading',false)
        this.injections.reduce('load', response)
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({
            ...option,
            metaAction
        }),
        o = new action({
            ...option,
            metaAction,
            extendAction
        }),
        ret = {
            ...metaAction,
            ...extendAction.gridAction,
            ...o
        }
    metaAction.config({ metaHandlers: ret })
    return ret
}