import React, { PureComponent } from 'react'
import { Icon } from 'edf-component'
import moment from 'moment'
import { is, fromJS } from 'immutable';
// import './TimeLineComponent.less'
class TimeLineComponent extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            type: 'month',//按什么查询
            endDate: '', //结束日期
            startDate: '',//开始日期
            disabled: '', //控制条件
            currentDate: moment().format('YYYY-MM'),//当前日期
            timeArr: [],//时间轴列表
            enabledDate: '',//企业启用期间
            selectTimeData: [], // 选择框内容
            queryData: '', //选择框所选的内容（查询条件）
            haveDataRang: null,//有数据的日期范围
            maxEndDate: '',//最大日期限制
        }
    }

    componentDidMount = () => {
        const { handleSelectData, ...props } = this.props
        this.handleList(props)
        //this.setState(Object.assign({}, this.state, props), this.handleList)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !is(fromJS(this.props), fromJS(nextProps)) || !is(fromJS(this.state), fromJS(nextState))
    }

    componentWillReceiveProps = (nextProps) => {
        const { handleSelectData, ...nprops } = nextProps
        const { handleSelectData: select, ...tprops } = this.props

        if (!is(fromJS(nprops), fromJS(tprops))) {
            this.handleList(nprops)
            //this.setState(Object.assign({}, this.state, nprops), this.handleList)
        }
    }

    handleList = (props) => {
        let stateObj = {
            ...this.state,
            ...props
        }
        let timeArr = [],
            { startDate, endDate, currentDate, type, enabledDate, selectTimeData, queryData, haveDataRang, maxEndDate } = stateObj,
            chargeNum = undefined
        // 展示的内容
        if (type == 'month') {
            // if (startDate && endDate) {
            if (startDate && endDate && startDate.indexOf('季度') == -1 && startDate.indexOf('年') == -1) {
                let diffMonth = moment(endDate).diff(moment(startDate), 'month')
                if (diffMonth > 36) return null
                if (startDate == endDate) {
                    let year = moment(startDate).format('YYYY')
                    let list = [+year - 1, +year, +year + 1]
                    list.forEach(item => {
                        timeArr.push({ name: item, isTitle: true, id: item, value: item, isSelect: false })
                        for (let i = 0; i < 12; i++) {
                            let num = i < 9 ? '0' + (i + 1) : String(i + 1)
                            timeArr.push({ name: item + '-' + num, isTitle: false, id: item + num, value: num, isSelect: false })
                        }
                    })
                } else {
                    let beforeDate = moment(moment(startDate).subtract(Math.floor((36 - diffMonth) / 2), 'month')).format('YYYY-MM')
                    for (let i = 0; i < 36; i++) {
                        let time = moment(beforeDate).add(i + 1, 'month').format('YYYY-MM')
                        let month = moment(time).month()
                        let year = moment(time).year()

                        month = month < 9 ? '0' + (month + 1) : String(month + 1)
                        if (month == 12) {
                            timeArr.push({ name: time, isTitle: false, id: moment(time).format('YYYYMM'), value: month, isSelect: false })
                            timeArr.push({ name: Number(year) + 1, isTitle: true, id: Number(year) + 1, value: Number(year) + 1, isSelect: false })
                        } else {
                            timeArr.push({ name: time, isTitle: false, id: moment(time).format('YYYYMM'), value: month, isSelect: false })
                        }

                    }
                }
            } else {
                let year = moment(currentDate).year()
                if (queryData) {
                    year = queryData.slice(0, 4)
                }

                let list = [+year - 1, +year, +year + 1]
                list.forEach(item => {
                    timeArr.push({ name: item, isTitle: true, id: item, value: item, isSelect: false })
                    for (let i = 0; i < 12; i++) {
                        let num = i < 9 ? '0' + (i + 1) : String(i + 1)
                        timeArr.push({ name: item + '-' + num, isTitle: false, id: item + num, value: num, isSelect: false })
                    }
                })
            }
        } else if (type == 'quarter') {
            let year = moment(currentDate).year()
            if (queryData) {
                year = queryData.slice(0, 4)
            }
            let list = [+year - 1, +year, +year + 1]
            list.forEach(item => {
                timeArr.push({ name: item, isTitle: true, id: item, value: item, isSelect: false })
                for (let i = 0; i < 4; i++) {
                    timeArr.push({ name: `${item}年第${i + 1}季度`, isTitle: false, id: item + '' + (i + 1), value: `${i + 1}季度`, isSelect: false })
                }
            })

        } else if (type == 'halfYear') {
            let year = moment(currentDate).year()
            // let list = [+year-1, +year, +year+1]
            if (queryData) {
                year = queryData.slice(0, 4)
            }
            let list = [+year - 2, +year - 1, +year, +year + 1, +year + 2]

            list.forEach(item => {
                timeArr.push({ name: item, isTitle: true, id: item, value: item })
                for (let i = 0; i < 2; i++) {
                    let tip = i % 2 == 0 ? '上半年' : '下半年'
                    timeArr.push({ name: `${item}年${tip}`, isTitle: false, id: item + '' + (i + 1), value: tip, isSelect: false })
                }
            })
        }
        //控制启用日期之前的不能选
        if (enabledDate) {
            timeArr.forEach((item, index) => {
                item.disabled = false
                let month = enabledDate.slice(4)
                let year = enabledDate.slice(0, 4)
                if (type == 'month') {
                    if (Number(item.id) < Number(enabledDate)) {
                        item.disabled = true
                    }

                    if (startDate && endDate) {
                        if (startDate == endDate) {
                            if (item.name == startDate) {
                                item.isSelect = true
                                chargeNum = index
                            } else {
                                item.isSelect = false
                            }
                        } else {
                            if (item.name == startDate) {
                                chargeNum = index
                            }
                        }
                    }
                    if (selectTimeData.length) {
                        let obj = selectTimeData.find(ele => {
                            let mon = ele.period < 10 ? `0${ele.period}` : ele.period + ''
                            let date = ele.year + mon
                            if (date == item.id) return true
                        })

                        // if(obj) item.isHaveData = true //哪些有数据
                        if (obj) {
                            item.isHaveData = true //哪些有数据(哪些是下拉选里的可选择的)
                        } else {
                            item.disabled = true //（下拉选里没有的这里控制它不能选择）
                        }

                        let selectObj = selectTimeData.find(e => e.name == queryData)
                        if (selectObj) {
                            let mon = selectObj.period < 10 ? `0${selectObj.period}` : selectObj.period + ''
                            let date = selectObj.year + mon

                            if (item.id == date) {
                                item.isSelect = true
                                chargeNum = index
                            } else {
                                item.isSelect = false
                            }
                        }
                    }

                    if (haveDataRang && (+haveDataRang.minDataPeriod <= +item.id && item.id <= +haveDataRang.maxDataPeriod)) {
                        item.isHaveData = true
                    }

                    if (maxEndDate && item.name > maxEndDate) item.disabled = true

                } else {
                    let fm = type == 'halfYear' ? 7 : 4
                    let quarter = parseInt(month / fm) + 1
                    if (Number(item.id) < Number('' + year + quarter)) {
                        item.disabled = true
                    }

                    if (selectTimeData.length) {
                        let obj = selectTimeData.find(ele => ele.name == item.name)
                        // if(obj) item.isHaveData = true
                        if (obj) {
                            item.isHaveData = true //哪些有数据(哪些是下拉选里的可选择的)
                        } else {
                            item.disabled = true //（下拉选里没有的这里控制它不能选择）
                        }

                        let selectObj = selectTimeData.find(e => e.name == queryData)
                        if (selectObj) {
                            if (item.name == selectObj.name) {
                                item.isSelect = true
                                chargeNum = index
                            } else {
                                item.isSelect = false
                            }
                        }
                    }
                }
                if (item.isTitle) {
                    if (item.name < +year) {
                        item.disabled = true
                    } else {
                        item.disabled = false
                    }
                }
            })
        }
        this.setState({
            ...stateObj, timeArr
        })
        this.scrollTop(chargeNum)
    }

    scrollTop = (chargeNum) => {
        if (typeof chargeNum != undefined) {
            clearTimeout(this.renderTime)
            this.renderTime = setTimeout(() => {
                try {
                    let domList = document.getElementsByClassName('ant-timeline-itemLi'),
                        height = 0

                    for (let i in domList) {
                        if (i < chargeNum + 1) {
                            height += domList[i].offsetHeight
                        }
                    }

                    let leftLineDom = document.getElementsByClassName('mk-timeline-componentwrap')[0]
                    leftLineDom.scrollTop = height - leftLineDom.offsetHeight / 2 + 10 //(当为选中状态时高度比较高所以为了更居中加10)
                    leftLineDom = null
                } catch (e) {

                }
            }, 10)
        }
    }

    handleLiClick = (currentLi) => {
        if (currentLi.disabled) return
        this.handleList({
            queryData: currentLi.name,
            startDate: currentLi.name,
            endDate: currentLi.name,
        })
        // let { timeArr, type, enabledDate, startDate, endDate, selectTimeData, queryData, haveDataRang } = this.state, chargeNum = undefined

        // let newTimeArr = []
        // if (type == 'month') {
        //     let year = moment(currentLi.name).format('YYYY')
        //     let list = [+year - 1, +year, +year + 1]
        //     list.forEach(item => {
        //         newTimeArr.push({ name: item, isTitle: true, id: item, value: item, isSelect: false })
        //         for (let i = 0; i < 12; i++) {
        //             let num = i < 9 ? '0' + (i + 1) : String(i + 1)
        //             newTimeArr.push({ name: item + '-' + num, isTitle: false, id: item + num, value: num, isSelect: false })
        //         }
        //     })
        // } else if (type == 'quarter') {
        //     let year = moment(currentLi.name).year()
        //     let list = [+year - 1, +year, +year + 1]
        //     list.forEach(item => {
        //         timeArr.push({ name: item, isTitle: true, id: item, value: item, isSelect: false })
        //         for (let i = 0; i < 4; i++) {
        //             timeArr.push({ name: `${item}年第${i + 1}季度`, isTitle: false, id: item + '' + (i + 1), value: `${i + 1}季度`, isSelect: false })
        //         }
        //     })

        // } else if (type == 'halfYear') {
        //     let year = moment(currentLi.name).year()
        //     let list = [+year - 2, +year - 1, +year, +year + 1, +year + 2]

        //     list.forEach(item => {
        //         timeArr.push({ name: item, isTitle: true, id: item, value: item })
        //         for (let i = 0; i < 2; i++) {
        //             let tip = i % 2 == 0 ? '上半年' : '下半年'
        //             timeArr.push({ name: `${item}年${tip}`, isTitle: false, id: item + '' + (i + 1), value: tip, isSelect: false })
        //         }
        //     })
        // }

        // newTimeArr.forEach((item, index) => {
        //     if (item.id == currentLi.id) {
        //         item.isSelect = true
        //         chargeNum = index
        //     } else {
        //         item.isSelect = false
        //     }
        // })

        //控制启用日期之前的不能选
        // if (enabledDate) {
        //     newTimeArr.forEach((item, index) => {
        //         item.disabled = false
        //         let month = enabledDate.slice(4)
        //         let year = enabledDate.slice(0, 4)
        //         if (type == 'month') {
        //             if (Number(item.id) < Number(enabledDate)) {
        //                 item.disabled = true
        //             }

        //             if (startDate && endDate && startDate == endDate) {
        //                 if (item.name == startDate) {
        //                     item.isSelect = true
        //                     chargeNum = index
        //                 }
        //             }

        //             if (selectTimeData.length) {
        //                 let obj = selectTimeData.find(ele => {
        //                     let mon = ele.period < 10 ? `0${ele.period}` : ele.period + ''
        //                     let date = ele.year + mon
        //                     if (date == item.id) return true
        //                 })

        //                 // if(obj) item.isHaveData = true //哪些有数据
        //                 if (obj) {
        //                     item.isHaveData = true //哪些有数据(哪些是下拉选里的可选择的)
        //                 } else {
        //                     item.disabled = true //（下拉选里没有的这里控制它不能选择）
        //                 }

        //                 let selectObj = selectTimeData.find(e => e.name == queryData)
        //                 if (selectObj) {
        //                     let mon = selectObj.period < 10 ? `0${selectObj.period}` : selectObj.period + ''
        //                     let date = selectObj.year + mon

        //                     if (item.id == date) {
        //                         item.isSelect = true
        //                         chargeNum = index
        //                     }
        //                 }
        //                 // let mon = selectTimeData[0].period < 10 ? `0${selectTimeData[0].period}` : selectTimeData[0].period+''
        //                 // let date = selectTimeData[0].year + mon
        //                 // if(item.id == date) {
        //                 //     item.isSelect = true  
        //                 //     chargeNum = index
        //                 // }
        //             }

        //             if (haveDataRang && (+haveDataRang.minDataPeriod <= +item.id && item.id <= +haveDataRang.maxDataPeriod)) {
        //                 item.isHaveData = true
        //             }

        //         } else {
        //             let fm = type == 'halfYear' ? 7 : 4
        //             let quarter = parseInt(month / fm) + 1
        //             if (Number(item.id) < Number('' + year + quarter)) {
        //                 item.disabled = true
        //             }

        //             if (selectTimeData.length) {
        //                 let obj = selectTimeData.find(ele => ele.name == item.name)
        //                 // if(obj) item.isHaveData = true
        //                 if (obj) {
        //                     item.isHaveData = true //哪些有数据(哪些是下拉选里的可选择的)
        //                 } else {
        //                     item.disabled = true //（下拉选里没有的这里控制它不能选择）
        //                 }

        //                 // if(item.name == selectTimeData[0].name) {
        //                 //     item.isSelect = true
        //                 //     chargeNum = index
        //                 // }
        //                 let selectObj = selectTimeData.find(e => e.name == queryData)
        //                 if (selectObj) {
        //                     if (item.name == selectObj.name) {
        //                         item.isSelect = true
        //                         chargeNum = index
        //                     }
        //                 }
        //             }
        //         }
        //         if (item.isTitle) {
        //             if (item.name < +year) {
        //                 item.disabled = true
        //             } else {
        //                 item.disabled = false
        //             }
        //         }
        //     })
        // }

        // if (typeof chargeNum != undefined) {
        //     clearTimeout(this.renderTime)
        //     this.renderTime = setTimeout(() => {
        //         try {
        //             let domList = document.getElementsByClassName('ant-timeline-itemLi'),
        //                 height = 0

        //             for (let i in domList) {
        //                 if (i < chargeNum + 1) {
        //                     height += domList[i].offsetHeight
        //                 }
        //             }

        //             let leftLineDom = document.getElementsByClassName('mk-timeline-componentwrap')[0]
        //             leftLineDom.scrollTop = height - leftLineDom.offsetHeight / 2 + 10 //(当为选中状态时高度比较高所以为了更居中加10)
        //             leftLineDom = null
        //         } catch (e) {

        //         }
        //     }, 10)
        // }
        // this.setState({ timeArr: newTimeArr })

        //调查询接口
        this.props.handleSelectData(currentLi.name)
    }

    render() {
        let { timeArr, type, enabledDate } = this.state
        if (timeArr.length) {
            return <div className='mk-timeline-componentwrap' style={{ width: '80px' }}>
                <ul className='ulCss'>
                    <li class="ant-timeline-item ant-timeline-itemLi">
                        <div className='ant-timeline-item-tail-title-head'></div>
                    </li>
                    {
                        timeArr.map(item => {
                            if (item.isTitle) {
                                return <li key={item.name} class={item.disabled ? "ant-timeline-itemDis ant-timeline-itemLi" : "ant-timeline-item ant-timeline-itemLi"}>
                                    <div className='ant-timeline-item-tail-title'></div>
                                    {/* <span className='title'>{item.value}年</span> */}
                                    <span className='title'>{item.value}</span>
                                    <Icon type='arrow-down' />
                                </li>
                            }
                            return <li key={item.name} class={item.disabled ? "ant-timeline-itemDis ant-timeline-itemLi" : "ant-timeline-item ant-timeline-itemLi"} onClick={() => this.handleLiClick(item)}>
                                <div className='ant-timeline-item-tail'></div>
                                {/* <div className='ant-timeline-item-head ant-timeline-item-head-blue'></div> */}
                                {/* <div className='ant-timeline-item-head'></div> */}
                                {
                                    type == 'month' && item.id == enabledDate ?
                                        <Icon
                                            type="qiyongriqi"
                                            fontFamily='edficon'
                                            style={{ fontSize: '16px', position: "absolute", top: '-3px', left: '-2px' }}
                                            title='启用日期' />
                                        :
                                        <div className={item.isHaveData ? 'ant-timeline-item-head ant-timeline-item-head-blue' : 'ant-timeline-item-head'} style={item.isSelect ? { display: 'none' } : {}}></div>
                                }

                                <div class={item.isSelect ?
                                    "ant-timeline-item-content ant-timeline-item-selectItem" :
                                    "ant-timeline-item-content"}
                                    style={item.isSelect ? { width: '65px', padding: 0, textAlign: 'center' } : {}}>
                                    {item.isSelect && type == 'month' ? item.name : item.value}
                                </div>
                            </li>
                        })
                    }
                </ul>
            </div>
        } else {
            return null
        }
    }
}

export default TimeLineComponent