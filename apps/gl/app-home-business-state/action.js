import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { List, fromJS, is } from 'immutable'
import { Echarts, Table } from 'edf-component'
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
        // injections.reduce('init')
        this.load()
        let addEventListener = this.component.props.addPanelEventListener
        if (addEventListener) {
            addEventListener('onMouseOver', 'app-home-business-state', (param) => {
                this.metaAction.sfs({
                    'data.other.MathRndom': Math.random(),
                    'data.other.action': param
                })
            })
        }
        
    }
    componentWillReceiveProps = (nextProps) => {
        // if(!is(nextProps.data, this.component.props.data) && nextProps.data){
        //     this.initData(nextProps.data)
        // }
    }
    
    load = async () => {
        let res = this.component.props.data
        let emptyData = this.component.props.hasData
        // this.metaAction.sfs({
        //     'data.other.emptyData': emptyData,
        //     'data.type':'chart'
        // })
        let data = this.component.props.data
        if(res){
            this.initData(res,emptyData)
        }else{
            this.injections.reduce('init', {emptyData})
        }
    }
    initData = (data,emptyData) => {
        delete data.empty
        let periodList = [],
        incomeSumAmout = [],
        expenditureSumAmount = [],
        profitAmount = [],
        tableSource = [],
        period,
        arr = [],
        newData = {},
        dataList = []
        for(let key in data){
            arr.push(parseInt(key.replace('-','')))
            arr.sort(function (x,y) {
                return x-y;
            });
            dataList.push({
                [key]: data[key]
            })
            data[key]['period'] = `${parseInt(key.split('-')[1])}月`
            data[key]['time'] = parseInt(key.replace('-',''))
            tableSource.push(data[key])
        }
        arr.map( o => {
            periodList.push(`${parseInt(`${o}`.slice(4))}月`)
        })
        tableSource.map(o => {
            o.incomeSumAmout = addThousandsPosition(o.incomeSumAmout.toFixed(2), true)
            o.expenditureSumAmount = addThousandsPosition(o.expenditureSumAmount.toFixed(2), true)
            o.profitAmount = addThousandsPosition(o.profitAmount.toFixed(2), true)
            return o
        })
        let list = tableSource.sort(this.compare('time'))
        list.map(o => {
            incomeSumAmout.push(clearThousandsPosition(o.incomeSumAmout,true))
            expenditureSumAmount.push(clearThousandsPosition(o.expenditureSumAmount, true))
            profitAmount.push(clearThousandsPosition(o.profitAmount, true))
            return o
        })
        newData.periodList = periodList
        newData.incomeSumAmout = incomeSumAmout
        newData.expenditureSumAmount = expenditureSumAmount
        newData.profitAmount = profitAmount
        newData.tableSource = tableSource
        newData.emptyData = emptyData
        this.injections.reduce('init', newData)
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
        _hmt && _hmt.push(['_trackEvent', '桌面', '经营状况', '刷新'])
        let data  = await this.webapi.business.query()
        let res = this.initData(data)
    }
   
    getContent = () => {
        let periodList = this.metaAction.gf('data.periodList') && this.metaAction.gf('data.periodList').toJS(),
            incomeSumAmout = this.metaAction.gf('data.incomeSumAmout') && this.metaAction.gf('data.incomeSumAmout').toJS(),
            expenditureSumAmount = this.metaAction.gf('data.expenditureSumAmount') && this.metaAction.gf('data.expenditureSumAmount').toJS(), 
            profitAmount = this.metaAction.gf('data.profitAmount') && this.metaAction.gf('data.profitAmount').toJS(),
            tableSource = this.metaAction.gf('data.tableSource') && this.metaAction.gf('data.tableSource').toJS(),
            columns = [
            {
                title: '月份',
                dataIndex: 'period',
                width: '10%',
                key: 'period'
            }, {
                title: '收入',
                dataIndex: 'incomeSumAmout',
                // width: '30%',
                key: 'incomeSumAmout',
            }, {
                title: '支出',
                dataIndex: 'expenditureSumAmount',
                // width: '30%',
                key: 'expenditureSumAmount',
            },
            {
                title: '利润',
                dataIndex: 'profitAmount',
                // width: '30%',
                key: 'profitAmount',
            }
        ]
        var yMax = 500;
        var dataShadow = [];
        var data = [220, 182, 191,300,20];
        for (var i = 0; i < data.length; i++) {
            dataShadow.push(yMax);
        }
        let option = {
            
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            color: ['#E48E58', '#2BB696', '#4cabce'],
            tooltip: {
                // trigger: 'axis',
                axisPointer: {
                    type: 'none',
                    
                },
            },
            
            legend: {
                data: ['收入', '支出', '利润']
            },
            
            calculable: true,
            xAxis: 
                {
                    type: 'category',
                    axisTick: {show: true},
                    data: periodList,
                    axisLine:{},
                    axisLabel:{}
                }
            ,
            yAxis: 
                {
                    type: 'value',
                    axisTick: {show: true},
                    scale: true,
                    axisLine:{},
                    axisLabel:{}
                }
            ,
            series: [
                
                {
                    name: '收入',
                    type: 'bar',
                    data: incomeSumAmout,
                    barMinHeight: `0`,
                    
                },
                {
                    name: '支出',
                    type: 'bar',
                    data: expenditureSumAmount,
                    barMinHeight: `0`,
                },
                {
                    name: '利润',
                    type: 'bar',
                    data: profitAmount,
                    barMinHeight: `0`,
                },
               
            ]
        
        }
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
        }else{
            this.metaAction.sf('data.fold',true)
            fold = 'open'
        }
        let index
        if(this.component.props.appIndex != undefined) {
            index = this.component.props.appIndex
        }
        this.component.props.callback && await this.component.props.callback(index, fold)
    }
    //移入移出样式
    moveIn = (option) => {
        option.xAxis.axisLine = {
            lineStyle: {
                color: '#333333'
            }
        }
        option.yAxis.axisLine = {
            lineStyle: {
                color: '#333333'
            }
        }
        option.xAxis.axisLabel.color = '#333333'
        option.yAxis.splitLine = {
            show:true,
            lineStyle:{
                color: '#d0cdc7'
            }
        }
        option.yAxis.axisLabel.color = '#333333'
        option.color = ['#E48E58', '#2BB696', '#4cabce']
        option.legend.textStyle = {
            color: '#333333'
        }
        return option
    }
    moveOut = (option) => {
        option.xAxis.axisLine = {
            lineStyle: {
                color: '#eceef1'
            }
        }
        option.yAxis.axisLine = {
            lineStyle: {
                color: '#eceef1'
            }
        }
        option.xAxis.axisLabel.color = '#e0e4e9'
        option.yAxis.splitLine = {
            show:true,
            lineStyle:{
                color: '#eceef1'
            }
        }
        option.yAxis.axisLabel.color = '#e0e4e9'
        option.color = ['#eceef1', '#eceef1', '#eceef1']
        option.legend.textStyle = {
            color: '#e0e4e9'
        }
        return option
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}