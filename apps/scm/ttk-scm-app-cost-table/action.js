import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { Select } from 'edf-component'
import renderColumns from './utils/renderColumns'
import { addThousPos, clearThousPos } from '../../../utils/number'
import utils from 'edf-utils'
import { fromJS } from 'immutable';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }

        injections.reduce('init')
        this.load()
    }

    load = async() => {
        const currentOrg = this.metaAction.context.get("currentOrg")
		let periodDate = currentOrg.periodDate
        let date = utils.date.monthStartEndDay(periodDate)
        
        const response = await Promise.all([
            this.webapi.queryCostAccount({
                beginDate: date.startDay + ' 00:00:00',
                endDate: date.endDay + ' 23:59:59',
                propertyId: null,
                paramName: null
            }),
            this.webapi.query()
        ])
      
        let res = response[0]
        res.periodDate = periodDate
        res.disabledTime =  response[1]

        if (res) {
            this.injections.reduce('load', res)
        }
        this.metaAction.sf('data.other.loading', false)
        setTimeout(() => {
            this.onResize()
        }, 50)
    }

    onTabFocus = async()=> {
        this.metaAction.sf('data.other.loading', true)
        const res = await this.handleLoad('change')

        let sfsObj = {}
        if (res) {
            sfsObj['data.other.tableList'] = fromJS(res.list || [])
        }
        sfsObj['data.other.loading'] = false

        this.metaAction.sfs(sfsObj)
        setTimeout(() => {
            this.onResize()
        }, 50)
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
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
            let appDom = document.getElementsByClassName('ttk-scm-app-costTable')[0];//以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];//table wrapper包含整个table,table的高度基于这个dom
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
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        y: height - theadDom.offsetHeight,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                    })
                }
            }
        } catch (err) {
        }
    }

    componentWillUnmount = () => {
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }
    
    tableColumns = () => {
        const tableList = this.metaAction.gf('data.other.tableList').toJS()
        return renderColumns(tableList)
    }   

    handleDisabledDate = (current) => {
        if (current) {
            let disabledTime = this.metaAction.gf('data.other.disabledTime').replace(/-/g, '')
            current = current.format('YYYYMM')

            return current < disabledTime
        }
    }

    handleChangeDate = async(v) => {
        let businessDate = this.metaAction.momentToString(v, 'YYYY-MM')

        // this.metaAction.sf('data.other.businessDate', businessDate)

        this.metaAction.sfs({
            'data.other.businessDate': businessDate,
            'data.other.loading': true
        })

        const res = await this.handleLoad('change')

        let sfsObj = {}
        if (res) {
            // this.metaAction.sf('data.other.tableList', fromJS(res.list || []))
            sfsObj['data.other.tableList'] = fromJS(res.list || [])
        }
        // this.metaAction.sf('data.other.loading', false)
        sfsObj['data.other.loading'] = false

        this.metaAction.sfs(sfsObj)
        setTimeout(() => {
            this.onResize()
        }, 100)
    }
    
    onFieldChange = async (e , type) => {

        let isOk = false, time = 100
        this.metaAction.sf('data.other.loading', true)
        if (type == 'type') {
            // this.metaAction.sfs({
            //     'data.other.propertyId': e,
            //     'data.other.loading': true
            // })
            this.metaAction.sf('data.other.propertyId', e)
            isOk = true
        } else {
            let value = null
            if (type == 'search') {
                value = e
                isOk = true
            } else {
                isOk = false
                value = e.target && e.target.value

                let keyRandom = Math.floor(Math.random()*10000000)
                this.keyRandom = keyRandom
                clearTimeout(this.time)
                this.time = setTimeout(async() => {
                    if (keyRandom == this.keyRandom) {
                        
                        let {propertyId, businessDate} = this.metaAction.gf('data.other').toJS()
                        let date = utils.date.monthStartEndDay(businessDate)
                        const res = await this.webapi.queryCostAccount({
                            beginDate: date.startDay + ' 00:00:00',
                            endDate: date.endDay + ' 23:59:59',
                            propertyId: propertyId,
                            paramName: value
                        })

                        if (res) {
                            this.metaAction.sf('data.other.tableList', fromJS(res.list || []))
                        }
                    }
                }, 150)
                time = 200
            }

            // this.metaAction.sfs({
            //     'data.other.paramName': value,
            //     'data.other.loading': true
            // })
            this.metaAction.sf('data.other.paramName', value)
        }

        let sfsObj = {}
        if (isOk) {
            const res = await this.handleLoad('change')
            if (res) {
                sfsObj['data.other.tableList'] = fromJS(res.list || [])
            }
        }

        sfsObj['data.other.loading'] = false
        this.metaAction.sfs(sfsObj)

        setTimeout(() => {
            this.onResize()
        }, time)
    }

    print = async() => {
        // let {businessDate, paramName, propertyId} = this.metaAction.gf('data.other').toJS()
        // let date = utils.date.monthStartEndDay(businessDate)
        // let params = {
        //     beginDate: date.startDay + ' 00:00:00',
        //     endDate: date.endDay + ' 23:59:59',
        //     paramName,
        //     propertyId
        // }
        // const res = await this.webapi.print(params)

        // console.log(res, 'res')
        let list = this.metaAction.gf('data.other.tableList').toJS()

        if (list && list.length) {
            const res = await this.handleLoad('print')
            if (res) {
                this.metaAction.toast('success', '打印成功')
            }
        } else {
            this.metaAction.toast('warning', '当前没有可打印数据')
        }
    }

    export = async() => {
        // let {businessDate, paramName, propertyId} = this.metaAction.gf('data.other').toJS()
        // let date = utils.date.monthStartEndDay(businessDate)
        // let params = {
        //     beginDate: date.startDay + ' 00:00:00',
        //     endDate: date.endDay + ' 23:59:59',
        //     paramName,
        //     propertyId
        // }
        // const res = await this.webapi.export(params)
        // console.log(res, 'res')

        let list = this.metaAction.gf('data.other.tableList').toJS()

        if (list && list.length) {
            const res = await this.handleLoad('export')
            if (res) {
                if (res) this.metaAction.toast('success', '导出成功')
            }
        } else {
            this.metaAction.toast('warning', '当前没有可导出数据')
        }
    }

    handleLoad = async(type) => {
        let {businessDate, paramName, propertyId} = this.metaAction.gf('data.other').toJS()
        let date = utils.date.monthStartEndDay(businessDate)
        let params = {
            beginDate: date.startDay + ' 00:00:00',
            endDate: date.endDay + ' 23:59:59',
            paramName,
            propertyId
        }

        let res = null
        switch(type) {
            case 'export': res = this.webapi.export(params); break;
            case 'print': res = this.webapi.print(params); break;
            case 'change': res = this.webapi.queryCostAccount(params); break;
            default: res = this.webapi.queryCostAccount(params);
        }
        return res
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}