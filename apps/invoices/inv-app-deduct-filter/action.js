import React from 'react'
import {fromJS} from 'immutable'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import isEquall from 'lodash.isequal'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.metaAction.sfs({
            'data.fpzlcsVoList': fromJS(this.component.props.data.fpzlcsVoList),
            'data.dkyf': this.component.props.data.dkyf
        })
    }
    componentWillReceiveProps = ( nextProps ) => {
        // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
        const fpzlcsVoList= this.metaAction.gf('data.fpzlcsVoList').toJS()
        const { data } = nextProps
        if(isEquall(fpzlcsVoList,data.fpzlcsVoList)) return
        this.metaAction.sfs({
            'data.fpzlcsVoList': fromJS(data.fpzlcsVoList),
            'data.dkyf': data.dkyf
        })   
    }

    handleVisibleChange = (visible)=>{
        if (visible) {
            const filterForm = this.metaAction.gf('data.filterForm').toJS()
            this.metaAction.sf('data.form', fromJS(filterForm))
        }
        this.metaAction.sf('data.visible',visible)
    }
  
    handerReset = () =>{
        const formOld ={
            kprqq: undefined,
            kprqz: undefined,
            fpzlDm: undefined, //发票类型代码
            fphm: '', //发票号码
            fpdm: ''  //发票代码
        }
        this.metaAction.sf('data.form',formOld)
    }

    handerSearch = ()=>{
        const {form, filterForm, xfmc, dkyf}= this.metaAction.gf('data').toJS()
        let params = {xfmc, dkyf, form}
        if(this.component.props.onChange){
            this.component.props.onChange(params)  
        }
        this.metaAction.sfs({
            'data.visible': false,
            'data.filterForm': fromJS(filterForm)
        })
    }
    disabledStartDate = (startValue) => {
        const endValue = this.metaAction.gf('data.form.kprqz') 
        if (!startValue || !endValue) {
          return false;
        }
        return startValue.valueOf() > this.metaAction.stringToMoment(endValue,'YYYY-MM-DD').valueOf();
    }

    disabledEndDate = (endValue) => {
        const startValue = this.metaAction.gf('data.form.kprqq')
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= this.metaAction.stringToMoment(startValue,'YYYY-MM-DD').valueOf();
    }

    // 抵扣月份输入框改变
    dkyfChange = (month,monthStr) => { 
        this.metaAction.sf('data.dkyf', monthStr)
        this.handerSearch()
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

