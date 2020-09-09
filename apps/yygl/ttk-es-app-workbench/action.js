import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox, Popover, Button, Echarts} from 'edf-component'
import { fromJS } from 'immutable'
import { consts } from 'edf-consts'
import moment from 'moment'
import { fetch } from 'edf-utils'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
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
    }

    load = ()=>{
        this.loadFirst()
    }

    setChartBusinessRate = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        const option = {
            color: ['#e9e9e9', '#3291d8'],
            legend: {
                x : 'center',
                y:'center',
                data:['直接访问']
            },
            series : [
                {
                    name:'',
                    type:'pie',
                    hoverAnimation:false,
                    radius : ['55%', '80%'],
                    itemStyle : {
                        normal : {
                            label : {
                                show : false
                            },
                            labelLine : {
                                show : false
                            }
                        },
                    },
                    data:[
                        { value: 90, name: '已转化', itemStyle: { color: '#3291d8' }, emphasis:{itemStyle: { color: '#3291d8' }} },
                        { value: 10, name: '未转化', itemStyle: { color: '#e9e9e9' }, emphasis:{itemStyle: { color: '#e9e9e9' }} },
                    ]
                }
            ]
        }

        return <Echarts option={option} />
    }
    setChartBudgetLine = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        const option = {
            color:['#108ee9','#1f94e9','#ff9902'],
            legend:{
                data:['应收','实收','支出'],
                icon:'pin',
                itemWidth:8,
                itemHeight:4,
                left:'right'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid:{
                containLabel:true,
                left:10,
                right:10,
                top:30,
                bottom:10
            },
            xAxis: {
                type: 'category',
                data: ['201901', '201902', '201903', '201904',
                    '201905', '201906', '201907'],
                axisTick:{
                    alignWithLabel:true,
                    lineStyle:{
                        color:'#d7d7d7'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#d7d7d7'
                    }
                },
                axisLabel:{
                    color:'#5a5a5a'
                }
            },
            yAxis: {
                type: 'value',
                name:'金额（元）',
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                }
            },
            series: [
                {
                    name:'应收',
                    data: [44, 192, 191, 194, 320, 230, 230],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
                {
                    name:'实收',
                    data: [20, 32, 1, 34, 290, 330, 320],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
                {
                    name:'支出',
                    data: [82, 93, 90, 93, 129, 133, 132],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
            ]
        }

        return <Echarts option={option} />
    }
    setChartChargeBar = () =>{
        let chargeBarLoading = this.metaAction.gf('data.chargeBarLoading')
        let chargeBarData = this.metaAction.gf('data.chargeBarData').toJS()
        let chargeBarOption = {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: ['a', 'b', 'c', 'd', 'e', 'f', 'g','h','i','j'],
                    axisTick:{
                        alignWithLabel:true,
                        lineStyle:{
                            color:'#d7d7d7'
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#d7d7d7'
                        }
                    },
                    axisLabel:{
                        color:'#5a5a5a'
                    }
                }
            ],
            yAxis: {
                type: 'value',
                name:'金额（元）',
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                }
            },
            series: [
                {
                    name: '收费金额',
                    type: 'bar',
                    barWidth: '60%',
                    data: chargeBarData
                }
            ]
        }
        let loadingOption = {
            color: '#4cbbff',
            text:''
        }

        return <Echarts option={chargeBarOption} loadingOption={loadingOption} showLoading={chargeBarLoading}/>
    }
    setChartBusinessPie = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        let pieRate = {
            '无来源':'5.55%',
            '内部介绍':'19.45%',
            '转介绍':'15%',
            '网络':'30%',
            '金财互联':'10%',
            '其他':'20%',
        }
        const option = {
            color:['#9fa8bd','#3ba1ff','#4fcb74','#fbd438','#f04864','#9860e5','#37cbcb'],
            title: {
                text: '来源分析',
                textStyle:{
                    color:'#2b2b2b',
                    fontSize:12,
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: '60%',
                top: 'middle',
                // itemGap:4,
                icon:'pin',
                itemWidth:8,
                itemHeight:4,
                data: ['无来源', '内部介绍', '转介绍', '网络', '金财互联','其他'],
                formatter: function (name) {
                    return '{a|'+name+'} {b|'+pieRate[name]+'}'
                },
                textStyle:{
                    rich: {
                        a: {
                            width:70,
                            fontSize:12,
                            align: 'left'
                        },
                        b: {
                            width:30,
                            fontSize: 12,
                            align: 'right'
                        }
                    }
                }
            },
            series: [
                {
                    name: '商机来源',
                    type: 'pie',
                    center: ['30%', '50%'],
                    radius: ['40%', '60%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle:{
                        normal:{
                            borderWidth: 3,
                            borderColor: '#fff'
                        }
                    },
                    data: [
                        {value: 335, name: '无来源'},
                        {value: 310, name: '内部介绍'},
                        {value: 234, name: '转介绍'},
                        {value: 135, name: '网络'},
                        {value: 1548, name: '金财互联'},
                        {value: 158, name: '其他'}
                    ]
                }
            ]
        }

        return <Echarts option={option} />
    }
    setChartBusinessTypePie = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        let pieCount = {
            '工商服务':'20',
            '财税服务':'120',
            '人事服务':'220',
            '银行服务':'210',
            '法律服务':'201',
            '培训':'2022',
            '行业资质许可证':'203',
            '知识产权':'2',
            '其他服务':'11'
        }
        const option = {
            color:['#9fa8bd','#3ba1ff','#4fcb74','#fbd438','#f04864','#9860e5','#37cbcb','#dddddd'],
            title: {
                text: '商机类型',
                textStyle:{
                    color:'#2b2b2b',
                    fontSize:12,
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: '60%',
                top: 'middle',
                // itemGap:4,
                icon:'pin',
                itemWidth:8,
                itemHeight:4,
                data: ['工商服务', '财税服务', '人事服务', '银行服务', '法律服务','培训',
                    '行业资质许可证', '知识产权','其他服务'],
                formatter: function (name) {
                    return '{a|'+name+'} {b|'+pieCount[name]+'}'
                },
                textStyle:{
                    rich: {
                        a: {
                            width:85,
                            fontSize:12,
                            align: 'left'
                        },
                        b: {
                            width:30,
                            fontSize: 12,
                            align: 'right'
                        }
                    }
                }
            },
            series: [
                {
                    name: '商机类型',
                    type: 'pie',
                    radius: ['0', '60%'],
                    center: ['30%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle:{
                        normal:{
                            borderWidth: 3,
                            borderColor: '#fff'
                        }
                    },
                    data: [
                        {value: 335, name: '工商服务'},
                        {value: 310, name: '财税服务'},
                        {value: 234, name: '人事服务'},
                        {value: 135, name: '银行服务'},
                        {value: 1548, name: '法律服务'},
                        {value: 158, name: '培训'},
                        {value: 135, name: '行业资质许可证'},
                        {value: 1548, name: '知识产权'},
                        {value: 158, name: '其他服务'}
                    ]
                }
            ]
        }

        return <Echarts option={option} />
    }
    setChartCustomerRador = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        const option = {
            color:['#1890ff','#facc14','#2fc25b'],
            title: [
                {
                    text: '客户体检情况',
                    textStyle:{
                        color:'#2b2b2b',
                        fontSize:12,
                    }
                },
                {
                    text: '参与体检 370 户',
                    bottom:10,
                    left:'center',
                    textStyle:{
                        // color:'#2b2b2b',
                        fontSize:14,
                        fontWeight:'normal'
                    }
                }
            ],
            tooltip: {},
            legend: {
                show:false,
                data: ['A', 'B', 'C']
            },
            radar: {
                // shape: 'circle',
                radius:'60%',
                name: {
                    formatter: '{value}',
                    textStyle: {
                        color: '#5a5a5a',
                        borderRadius: 3,
                        padding: [3, 5]
                    }
                },
                indicator: [
                    { name: '涉税风险 24户', max: 100},
                    { name: '惠税商机\n45户', max: 100},
                    { name: '购买报表 40户', max: 100},
                    { name: '信用风险 4户', max: 100},
                    { name: '发票风险\n60户', max: 100},
                ],
                splitArea:{
                    areaStyle:{
                        color:'rgba(0,0,0,0)'
                    }
                },
                splitLine:{
                    lineStyle:{
                        color:'#ececec'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#ececec'
                    }
                },
            },
            series: [{
                name: '客户体检情况',
                type: 'radar',
                symbol:'rect',
                // areaStyle: {normal: {}},
                data: [
                    {
                        value: [55, 44, 33, 22, 77, 66],
                        name: 'A'
                    },
                    {
                        value: [33, 88, 66, 99, 22, 11],
                        name: 'B'
                    },
                    {
                        value: [34, 45, 56, 67, 78, 89],
                        name: 'C'
                    }
                ]
            }]
        }

        return <Echarts option={option} />
    }
    setChartCustomerLine = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        const option = {
            color:['#108ee9','#1f94e9','#ff9902'],
            title: {
                text: '客户趋势',
                textStyle:{
                    color:'#2b2b2b',
                    fontSize:12,
                }
            },
            legend:{
                data:['周期客户','一次客户','停止客户'],
                icon:'pin',
                itemWidth:8,
                itemHeight:4,
                top:25,
                right:30
            },
            tooltip: {
                trigger: 'axis'
            },
            grid:{
                containLabel:true,
                left:10,
                right:30,
                top:60,
                bottom:10
            },
            xAxis: {
                type: 'category',
                data: ['201901', '201902', '201903', '201904',
                    '201905', '201906', '201907', '201908', '201909',
                    '201910', '201911', '201912'],
                axisTick:{
                    alignWithLabel:true,
                    lineStyle:{
                        color:'#d7d7d7'
                    }
                },
                axisLine:{
                    lineStyle:{
                        color:'#d7d7d7'
                    }
                },
                axisLabel:{
                    color:'#5a5a5a'
                }
            },
            yAxis: {
                type: 'value',
                name:'户数',
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                },
                splitLine:{
                    lineStyle:{
                        type:'dashed'
                    }
                }
            },
            series: [
                {
                    name:'周期客户',
                    data: [44, 192, 191, 194, 320, 230, 230, 192, 191, 194, 320, 230],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
                {
                    name:'一次客户',
                    data: [20, 32, 1, 34, 290, 330, 320, 32, 1, 34, 290, 330],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
                {
                    name:'停止客户',
                    data: [82, 93, 90, 93, 129, 133, 132, 93, 90, 93, 129, 133],
                    type: 'line',
                    showSymbol: false,
                    smooth: true
                },
            ]
        }

        return <Echarts option={option} />
    }
    setChartCustomerPie = () =>{
        // let data = this.metaAction.gf('data.bsxx').toJS()
        let bfb = 0
        const option = {
            color:['#9fa8bd','#3ba1ff','#4fcb74','#fbd438','#f04864','#9860e5','#37cbcb'],
            title: {
                text: '客户行业分析',
                textStyle:{
                    color:'#2b2b2b',
                    fontSize:12,
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                show:false,
                orient: 'vertical',
                left: '60%',
                top: 'middle',
                // itemGap:4,
                icon:'pin',
                itemWidth:8,
                itemHeight:4,
                data: ['无来源', '内部介绍', '转介绍', '网络', '金财互联','其他'],
                formatter: '{a|{name}} {b|20%}',
                textStyle:{
                    rich: {
                        a: {
                            width:60,
                            fontSize:12,
                            align: 'left'
                        },
                        b: {
                            fontSize: 12,
                        }
                    }
                }
            },
            series: [
                {
                    name: '客户行业',
                    type: 'pie',
                    center: ['50%', '50%'],
                    radius: ['40%', '60%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: true,
                            color: '#5a5a5a',
                            position: 'outside'
                        },
                        emphasis: {
                            show: true,
                            color: '#5a5a5a',
                            position: 'outside'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: true
                        },
                        emphasis: {
                            show: true,
                        }
                    },
                    itemStyle:{
                        normal:{
                            borderWidth: 3,
                            borderColor: '#fff'
                        }
                    },
                    data: [
                        {value: 335, name: '房地产'},
                        {value: 310, name: '建筑安装'},
                        {value: 234, name: '国内贸易'},
                        {value: 135, name: '传统制造业'},
                        {value: 1548, name: '生活服务'},
                        {value: 158, name: '信息产业服务'},
                        {value: 158, name: '其他'}
                    ]
                }
            ]
        }

        return <Echarts option={option} />
    }

    chargeBarTabChange = (val) => {
        this.metaAction.sfs({
            'data.currentChangeBarActive':val,
            'data.chargeBarLoading':true
        })
        let newChargeBarData = [(100*Math.random()).toFixed(0), 152, 100, (100*Math.random()).toFixed(0), 190, 130,120,133,122,145]
        this.metaAction.sfs({
            'data.chargeBarData':fromJS(newChargeBarData),
            'data.chargeBarLoading':false
        })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}