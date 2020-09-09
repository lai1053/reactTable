import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        const initData = this.component.props.initData
        injections.reduce('init', {...initData})

        this.initSelectView()
    }

    initSelectView = async () => {
        // const resYear = await this.webapi.initYearOption()
        // const resMonth = await this.webapi.initMonthOption()
        // if (resYear) {
           const yearList = [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019]
        //    yearList = yearList.forEach((item) => {
        //        return(<Option value={item}>{item}</Option>)
        //    })
           this.injections.reduce('initYearSelectView', yearList)
        // }
        // if (resYear) {
            const monthList = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
            this.injections.reduce('initMonthSelectView', monthList)
        // }
    }
    changeYearOption = (value) => {
        // console.log(value, 'year select 9999')
        this.injections.reduce('changeValue', value, 'year')
    }

    changeMonthOption = (value) => {
        // console.log(value, 'month select 9999')
        this.injections.reduce('changeValue', value, 'month')
    }

    onOk = async () => {
        return await this.save()
    }

    save = async () => {
        const selectYear = this.metaAction.gf('data.selectYear')
        const selectMonth = this.metaAction.gf('data.selectMonth')
        const ts = this.metaAction.gf('data.ts')
        //let currentOrg = this.metaAction.context.get("currentOrg")
        const obj ={}
        // obj.enabledYear = selectYear
        // obj.enabledMonth = selectMonth.split('月')[0]
        obj.year = selectYear
        obj.period = Number(selectMonth.split('月')[0])
        //obj.id = currentOrg && currentOrg.id
        obj.isReturnValue = true
        obj.ts = ts
        // const result = await this.webapi.updatePeriod(obj)
        const res = await this.webapi.updatePeriod(obj)
        // result.then((res) => {
            // if (res == null) {
            if (Object.prototype.toString.call(res).indexOf('String') != -1) {
                this.metaAction.toast('success', '启用期间调整成功')
                const obj = this.metaAction.context.get("currentOrg")
                obj.enabledMonth = Number(selectMonth.split('月')[0])
                obj.enabledYear = selectYear
                this.metaAction.context.set("currentOrg", obj)
                return selectYear
            } else if(!res.result){
                this.metaAction.toast('error', res.error.message)
                return false
            }
        // })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
