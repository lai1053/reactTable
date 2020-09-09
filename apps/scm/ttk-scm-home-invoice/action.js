import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import { List, fromJS, is } from 'immutable'
import { Echarts, Table, FormDecorator } from 'edf-component'
import { addThousandsPosition,clearThousandsPosition } from './data'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        let addEventListener = this.component.props.addPanelEventListener
        if (addEventListener) {
            addEventListener('onMouseOver', 'ttk-scm-home-invoice', (param) => {
                this.metaAction.sf('data.other.MathRndom', Math.random())
                this.metaAction.sf('data.other.action', param)
            })
        }
        
        this.load()
    }
    
    load = async () => {
        let res = this.component.props.data
        let emptyData = this.component.props.hasData
        this.metaAction.sf('data.other.emptyData', emptyData)
        this.metaAction.sf('data.type','chart')
        this.metaAction.sf('data.period', `${this.component.props.period.year}.${this.component.props.period.period}`)
      
        let data = this.component.props.data
        if(res){
            let date = {}
            date.beginDate = res.beginDate
            date.endDate = res.endDate
            res.date = date

            let dateList = []
            dateList = res.periodList.map( o => {
                return o.replace('年', '.').replace('月', '')
            })
            res.dateList = dateList

            this.injections.reduce('load', res)
        }

        // const currentOrg = this.metaAction.context.get("currentOrg")
        // let periodDate = currentOrg.periodDate
        // let response = {}
        // if (periodDate) {
        //     const monthDate = utils.date.monthStartEndDay(periodDate)
        //     response.beginDate = monthDate.startDay ? monthDate.startDay : moment().format('YYYY-MM-DD')
        //     response.endDate = monthDate.endDay ? monthDate.endDay : moment().format('YYYY-MM-DD')
        //     // response.voucher.authenticatedMonth = monthDate.endDay ? monthDate.endDay.slice(0, 7) : moment().format('YYYY-MM')
        // }

        // let queryInvoiceSum  = await this.webapi.business.queryInvoiceSum(response)
        // let date = {}
        // date.beginDate = queryInvoiceSum.beginDate
        // date.endDate = queryInvoiceSum.endDate

        // queryInvoiceSum.date = date
        // this.injections.reduce('load', queryInvoiceSum)
    }

    setField = async (path, value) => {
        this.metaAction.sf('data.period', value)
        let dateNew =  value.replace('.', '-')
        let response = utils.date.monthStartEndDay(dateNew)
        
        let beginDate = response.startDay 
        let endDate = response.endDay 
        let Newresponse = {}
        Newresponse.beginDate = beginDate
        Newresponse.endDate = endDate

        let code = this.metaAction.gf('data.form.code')
        if(code == 'delivery') {
            let queryInvoiceSum  = await this.webapi.business.queryInvoiceSum(Newresponse)
            let date = {}
            date.beginDate = queryInvoiceSum.beginDate
            date.endDate = queryInvoiceSum.endDate

            queryInvoiceSum.date = date
            this.injections.reduce('load', queryInvoiceSum)
        }
        if(code == 'arrival') {
            let queryInvoiceSumpu  = await this.webapi.business.queryInvoiceSumpu(Newresponse)
            let date = {}
            date.beginDate = queryInvoiceSumpu.beginDate
            date.endDate = queryInvoiceSumpu.endDate

            queryInvoiceSumpu.date = date
            this.injections.reduce('load', queryInvoiceSumpu)
        }


    }
   
    compare = (property) => {
        return function(a,b){
            let value1 = a[property];
            let value2 = b[property];
            return value1 - value2;
        }
    }
    fieldChange = (path, value) => {
        if(value == '0'){
            this.metaAction.sf('data.type','chart')
        }else {
            this.metaAction.sf('data.type','table')
        }
    }
    refresh = async () => {
        let code = this.metaAction.gf('data.form.code')
        if(code == 'delivery') {
            let dates = this.metaAction.gf('data.form.date').toJS()
            let queryInvoiceSum  = await this.webapi.business.queryInvoiceSum(dates)
            let date = {}
            date.beginDate = queryInvoiceSum.beginDate
            date.endDate = queryInvoiceSum.endDate

            queryInvoiceSum.date = date
            this.injections.reduce('load', queryInvoiceSum)
        }
        if(code == 'arrival') {
            let dates = this.metaAction.gf('data.form.date').toJS()
            let queryInvoiceSumpu  = await this.webapi.business.queryInvoiceSumpu(dates)
            let date = {}
            date.beginDate = queryInvoiceSumpu.beginDate
            date.endDate = queryInvoiceSumpu.endDate

            queryInvoiceSumpu.date = date
            this.injections.reduce('load', queryInvoiceSumpu)
        }
    }

    getChart = () => {
        this.metaAction.sf('data.form.textDisplay',true)
    }

    getTable = () => {
        this.metaAction.sf('data.form.textDisplay',false)
    }

    changeTab = async () => {
        let code = this.metaAction.gf('data.form.code')
        if(code == 'delivery') {
            let dates = this.metaAction.gf('data.form.date').toJS()
            let queryInvoiceSumpu  = await this.webapi.business.queryInvoiceSumpu(dates)
            let date = {}
            date.beginDate = queryInvoiceSumpu.beginDate
            date.endDate = queryInvoiceSumpu.endDate

            queryInvoiceSumpu.date = date
            this.injections.reduce('load', queryInvoiceSumpu)
        }
        if(code == 'arrival') {
            let dates = this.metaAction.gf('data.form.date').toJS()
            let queryInvoiceSum  = await this.webapi.business.queryInvoiceSum(dates)
            let date = {}
            date.beginDate = queryInvoiceSum.beginDate
            date.endDate = queryInvoiceSum.endDate

            queryInvoiceSum.date = date
            this.injections.reduce('load', queryInvoiceSum)
        }
    }

    getPopoverContent = () => {
        const vatTaxpayer = this.metaAction.context.get("currentOrg").vatTaxpayer

        if(vatTaxpayer == 2000010001){
            return '税负率 =（本期销项税额 - 本期抵扣的进项税额 ）/ 销售收入'
        }

        if(vatTaxpayer == 2000010002){
            return '税负率 = 销项税额/销售收入'
        }
        
    }
   
    getContent = () => {
        let list = this.metaAction.gf('data.form.list') && this.metaAction.gf('data.form.list').toJS(),
        tableSource = this.metaAction.gf('data.form.list') && this.metaAction.gf('data.form.list').toJS(),
        invoiceTypeName = [],invoiceTypeSum = [],taxInclusiveAmount = []
        
        if(tableSource) {
            for(var x=0;x<tableSource.length;x++){
                tableSource[x].taxInclusiveAmount = addThousandsPosition(tableSource[x].taxInclusiveAmount.toFixed(2),true)
            }
            if(tableSource.length == 0){
                tableSource = [{invoiceTypeName:"增值税专用发票",invoiceTypeSum:0,taxInclusiveAmount:0},{invoiceTypeName:"增值税普通发票",invoiceTypeSum:0,taxInclusiveAmount:0},{invoiceTypeName:"合计",invoiceTypeSum:0,taxInclusiveAmount:0}]
            }
        } 

        if(list) {
            if(list.length == 0) {
                list = [{invoiceTypeName:"增值税专用发票",invoiceTypeSum:0,taxInclusiveAmount:0},{invoiceTypeName:"增值税普通发票",invoiceTypeSum:0,taxInclusiveAmount:0},{invoiceTypeName:"合计",invoiceTypeSum:0,taxInclusiveAmount:0}]
            }
            for(var i=0;i<list.length;i++){
                let pancakeObjet = {}
                invoiceTypeName.push(list[i].invoiceTypeName)
                invoiceTypeSum.push(list[i].invoiceTypeSum)
                taxInclusiveAmount.push(list[i].taxInclusiveAmount)
            }
        }

        let invoiceTypeNameChart = [],pancakeList = []

        if (list && list.length != 0) {
            invoiceTypeNameChart = []
            pancakeList = []
            for (var i = 0; i < list.length; i++) {
                if (list[i].invoiceTypeName != '合计') {
                    let pancakeObjet = {}
                    invoiceTypeNameChart.push(list[i].invoiceTypeName)
                    pancakeObjet.value = list[i].invoiceTypeSum
                    pancakeObjet.name = list[i].invoiceTypeName
                    pancakeList.push(pancakeObjet)
                }
            }
        }else {
            invoiceTypeNameChart = ['增值税专用发票','增值税普通发票']
            pancakeList = [{value:0, name:'增值税专用发票'},{value:0, name:'增值税普通发票'}]
        }
        
        let columns = [
            {
                title: '发票类型',
                dataIndex: 'invoiceTypeName',
                width: '33%',
                key: 'invoiceTypeName'
            }, {
                title: '份数',
                dataIndex: 'invoiceTypeSum',
                // width: '30%',
                key: 'invoiceTypeSum',
            }, {
                title: '价税合计',
                dataIndex: 'taxInclusiveAmount',
                // width: '30%',
                key: 'taxInclusiveAmount',
            }
        ]

        let invoiceSum = this.metaAction.gf('data.form.invoiceSum')
        invoiceSum = invoiceSum.toString() + '份'

        let option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c} 份"
            },
            legend: {
                orient: 'vertical',
                x: 'right',
                top: 45,
                right: -155,
                data:invoiceTypeNameChart,
            },
            color: ['#FEA772', '#1EC6F3', '#FFEB76','#6F77FC','#E75F6E','#93FF93'],
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    radius: ['40%', '73%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: true,
                            position: 'center',
                            fontSize: '22',
                            formatter: invoiceSum
                        },
                        emphasis: {
                            show: true,
                            // textStyle: {
                            //     fontSize: '30',
                            //     fontWeight: 'bold'
                            // }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:pancakeList
                }
            ]
        };
        let movement = this.metaAction.gf('data.other.action')
        let emptyData = this.metaAction.gf('data.other.emptyData')
        if(emptyData) {
            if(movement == 'out') {
                option = this.moveOut(option)
            }else if(movement == 'hover'){
                option = this.moveIn(option)
            }
        }else {
            option = this.moveIn(option)
        }
       
        let type = this.metaAction.gf('data.type'),
        onEvents = {
            'click': this.chartClick,
            'mouseover': this.chartmouseover,
            'timelinechanged': this.chartClick
          }
        if(type == 'chart'||!type){
            return <Echarts option={option} className="rcchart" onEvents={onEvents}/>
            
        }else if(type == 'table'){
            return <Table columns={columns} bordered={true} dataSource = { tableSource } pagination ={false} className="rctable"/>
        }
    }
    fold = async (option) => {
        this.metaAction.sf('data.mathRandom', Math.random())
        let fold
        if(this.metaAction.gf('data.fold') == true){
            this.metaAction.sf('data.fold',false)
            fold = 'close'
            let DOM = document.querySelector('.rcchart')
            
        }else{
            this.metaAction.sf('data.fold',true)
            fold = 'open'
            let DOM = document.querySelector('.rcchart')
        }
        let index
        if(this.component.props.appIndex != undefined) {
            index = this.component.props.appIndex
        }
        this.component.props.callback && await this.component.props.callback(index, fold)
    }
    //移入移出样式
    moveIn = (option) => {
        option.color =['#FEA772', '#1EC6F3', '#FFEB76','#6F77FC','#E75F6E','#93FF93']
        option.legend.textStyle = {
            color: '#333333'
        }
        return option
    }
    moveOut = (option) => {
        option.color = ['#eceef1', '#eceef1']
        option.legend.textStyle = {
            color: '#e0e4e9'
        }
        return option
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