import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { List, fromJS, is } from 'immutable'
import { Echarts, Table } from 'edf-component'
import { addThousandsPosition , clearThousandsPosition} from './data'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        
        this.component = component
        this.injections = injections
        this.load()
        let addEventListener = this.component.props.addPanelEventListener
        if (addEventListener) {
            addEventListener('onMouseOver', 'app-home-receive-pay', (param) => {
                this.metaAction.sfs({
                    'data.other.MathRndom': Math.random(),
                    'data.other.action': param
                })
            })
        }

        
    }
    componentWillReceiveProps = (nextProps) => {
        // if((!is(nextProps.periodList, this.component.props.periodList) || !is(nextProps.data, this.component.props.data)) && nextProps.data){
        //         this.initData(nextProps.periodList, nextProps.data)
        // }
    }
    load = async () => {
        let res = this.component.props.data
        let emptyData = this.component.props.hasData
        let period = `${this.component.props.period.year}.${this.component.props.period.period}`
        if(res){
            this.initData(res.periodList, res, emptyData, period)
        }else{
            this.injections.reduce('init', {emptyData, period})
        }
    }
    initData = (periodList, aRAP,emptyData,period) => {
        let rarpList = [],
        list = periodList.map( o => {
            return o.replace('年', '.').replace('月', '')
        });
        
        let data = {
            periodList: list,
            emptyData: emptyData,
            period:period
        };
        this.injections.reduce('init',data)
        this.convertData(aRAP);
    }

    setField = async (path, value) => {
        this.metaAction.sf('data.period', value)
        let params = {year: value.split('.')[0], period: value.split('.')[1]}
        let data = await this.webapi.receive.query(params)
        this.convertData(data)
    }
    refresh = async () => {
        let data  = await this.webapi.receive.query(this.metaAction.gf('data.period'))
        this.convertData(data)
    }
    convertData = (data) => {
        delete data.periodList
        let tableSource = [],item = {}
        for(let key in data){
            for(let i in data[key]){
                data[key]['code'] = i
                data[key]['value'] = data[key][i].toFixed(2)
                item[key] = {
                    value: data[key][i].toFixed(2),
                    code: i
                }
                
            }
        }
        tableSource.push(item)
        this.injections.reduce('setData', {data: data, tableSource: tableSource})
        
    }
    fieldChange = (path, value) => {
        if(value == '0'){
            this.metaAction.sf('data.type','chart')
        }else {
            this.metaAction.sf('data.type','table')
        }
    }
    
    fold = async (option) => {
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
   
    chartClick = (e) => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS()
        let value = this.metaAction.gf('data.period')
        switch (e.dataIndex) {
            case 3 :
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '应收'])
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToAccountsReceivableMap.code,
                    endAccountCode: list.accountToAccountsReceivableMap.code
                }               
            })
            break;
            case 2 :
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '其他应收'])
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToOtherAccountsReceivableMap.code,
                    endAccountCode: list.accountToOtherAccountsReceivableMap.code
                }               
            })
            break;
            case 1 :
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '应付'])
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToAccountsPayableMap.code,
                    endAccountCode: list.accountToAccountsPayableMap.code
                }               
            })
            break;
            case 0 :
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '其他应收'])
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToOtherAccountsPayableMap.code,
                    endAccountCode: list.accountToOtherAccountsPayableMap.code
                }               
            })
            break;
        }
        switch (e.value) {
            case '应收':
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToAccountsReceivableMap.code,
                    endAccountCode: list.accountToAccountsReceivableMap.code
                }               
            })
            break;
            case '其他应收' :
            
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToOtherAccountsReceivableMap.code,
                    endAccountCode: list.accountToOtherAccountsReceivableMap.code
                }               
            })
            break;
            case '应付' :
            
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToAccountsPayableMap.code,
                    endAccountCode: list.accountToAccountsPayableMap.code
                }               
            })
            break;
            case '其他应付' :
            
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                    beginAccountCode: list.accountToOtherAccountsPayableMap.code,
                    endAccountCode: list.accountToOtherAccountsPayableMap.code
                }               
            })
            break;
        }
    }
    chartmouseover = (params) => {
        switch (params) {
            case '应收': 
            params.event.target.style.textFill = 'red'
                // this.metaAction.sf('data.setColor', '#eee')
        }
    }
    tableClick = (type, code) => {
        if(type == 'accountToAccountsReceivableMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '应收'])
        }else if(type == 'accountToOtherAccountsReceivableMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '其他应收'])
        }else if(type == 'accountToAccountsPayableMap'){
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '应付'])
        }else {
            _hmt && _hmt.push(['_trackEvent', '桌面', '应收应付', '其他应付'])
        }
        let value = this.metaAction.gf('data.period')
        this.component.props.setPortalContent &&
        this.component.props.setPortalContent('余额表', 'app-balancesum-rpt',{
            accessType: 1,
            initSearchValue: {
                date_end: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                date_start: this.metaAction.stringToMoment((value.replace('.', "-")),'YYYY-MM'),
                beginAccountCode: code,
                endAccountCode: code
            }               
        })
    }
    getContent = () => {
        let cl = this.metaAction.gf('data.setColor'),
            list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS(),
            tableSource = this.metaAction.gf('data.tableSource') && this.metaAction.gf('data.tableSource').toJS(),
            columns = [
            {
                title: '应收',
                dataIndex: 'accountToAccountsReceivableMap',
                key: 'accountToAccountsReceivableMap',
                render: (text,record) => {
                    return (<a className="link" onClick={() =>this.tableClick('accountToAccountsReceivableMap',text.code)}>{text.value}</a>)
                }
            }, {
                title: '其他应收',
                dataIndex: 'accountToOtherAccountsReceivableMap',
                key: 'accountToOtherAccountsReceivableMap',
                render: (text,record) => {
                    
                    return (<a className="link" onClick={() =>this.tableClick('accountToOtherAccountsReceivableMap',text.code)}>{text.value}</a>)
                }
            }, {
                title: '应付',
                dataIndex: 'accountToAccountsPayableMap',
                key: 'accountToAccountsPayableMap',
                render: (text,record) => {
                    return (<a className="link" onClick={() =>this.tableClick('accountToAccountsPayableMap',text.code)}>{text.value}</a>)
                }
            },
            {
                title: '其他应付',
                dataIndex: 'accountToOtherAccountsPayableMap',
                key: 'accountToOtherAccountsPayableMap',
                render: (text,record) => {
                    return (<a className="link" onClick={() =>this.tableClick('accountToOtherAccountsPayableMap',text.code)}>{text.value}</a>)
                }
            }
        ]
        let defaultColor, format = false, id

        let option = {
            
            tooltip: {
                // trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
            },
            
            grid: {
                left: '3%',
                right: '5%',
                bottom: '3%',
                containLabel: true,
                show:false
            },
            xAxis: {
                type: 'value',
                axisTick: {show: true},
                boundaryGap: [0, 0.01],
                axisLabel: {
                    formatter: function (value, index) {
                        if(value == 0){
                            id = index
                        }
                        if((index == id + 1 && value > 10000) || (index == id - 1 && value < -10000)){
                            format = true
                        }
                        if(format){
                            value = (value/10000).toString()
                            .replace(new RegExp('(\\d)(?=(\\d{3})+$)','ig'),"$1,")
                            return value+'万'
                        }
                        return value.toString()
                        .replace(new RegExp('(\\d)(?=(\\d{3})+$)','ig'),"$1,")
                    }
                },
                splitLine:{}
            },
            yAxis: {
                triggerEvent:true,
                axisTick: {show: true},
                // type: 'category',
                data: ['其他应付','应付','其他应收','应收'],
                // minInterval: 1,
                maxInterval: 3,
                interval: 0,
                splitLine:{
                    show:false
                },
                axisLabel: {}
            },
            
            series: [{
                data: [
                    {
                    value: list.accountToOtherAccountsPayableMap?list.accountToOtherAccountsPayableMap.value:0,
                    itemStyle:{
                      normal:{color:'#2BB696'},
                      
                  }
                }, {
                    value:list.accountToAccountsPayableMap?list.accountToAccountsPayableMap.value:0,
                    itemStyle:{
                        
                      normal:{color:'#339ED5'},
                      
                  }
                }, {
                    value:list.accountToOtherAccountsReceivableMap?list.accountToOtherAccountsReceivableMap.value:0,
                    itemStyle:{
                      normal:{color:'#CD5D93'},
                      
                  }
                }, {
                    value:list.accountToAccountsReceivableMap?list.accountToAccountsReceivableMap.value:0,
                    itemStyle:{
                      normal:{color:'#E48E58'},
                    //   emphasis: {
                    //     label:{
                    //         color: function(params){
                    //             return green
                    //         }
                    //     }
                    // }
                  } 
                }],
                type: 'bar',
                barWidth: '25',
                // barMinHeight: '4',
            }]
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
        
        let type = this.metaAction.gf('data.type')
        let onEvents = {
            'click': this.chartClick,
            'mouseover': this.chartmouseover,
            'timelinechanged': this.chartClick
          }
        if(type == 'chart'||!type){
            
            return <Echarts 
                        option={option} 
                        className="rcchart" 
                        onEvents={onEvents}
                    />
        }else if(type == 'table'){
            return <Table 
                        columns={columns} 
                        bordered={true} 
                        dataSource = { tableSource } 
                        pagination ={false} 
                        className="rctable"
                            // scroll = {{y:200}}
                    />
        }
        
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
        option.xAxis.splitLine = {
            show:true,
            lineStyle:{
                color: '#d0cdc7'
            }
        }
        option.yAxis.axisLabel.color = '#333333'
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
        option.xAxis.splitLine = {
            show:true,
            lineStyle:{
                color: '#eceef1'
            }
        }
        option.yAxis.axisLabel.color = '#e0e4e9'
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