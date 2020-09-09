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
    injections.reduce('init',{
      ticketTypeList:this.component.props.data.ticketTypeList
    })
    // injections.reduce('init')
  }
  componentWillReceiveProps = ( nextProps ) => {
    // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
    const ticketTypeList= this.metaAction.gf('data.ticketTypeList').toJS()
    const { data } = nextProps
    if(isEquall(ticketTypeList,data.ticketTypeList)) return
    
    this.metaAction.sfs({
      'data.ticketTypeList': fromJS(data.ticketTypeList),
    })
    
  }
  handleVisibleChange = (visible)=>{
    if (visible) {
      const filterForm = this.metaAction.gf('data.filterForm').toJS()
      this.metaAction.sf('data.form', fromJS(filterForm))
    }
    this.metaAction.sf('data.visible',visible)
    
  }
  inputSearch = (val)=>{
  
  }
  handerReset = () =>{
    const formOld ={
      bill_date_start:undefined,
      bill_date_end:undefined,
      inv_code:undefined, //发票号码
      inv_code2:undefined, //搜索框内的发票号码
      fpdm:undefined, //发票代码
      xfsbh:undefined // 销方识别号
    }
   /* formOld.inv_code = this.metaAction.gf('data.form.inv_code')
    this.metaAction.sf('data.form',fromJS(formOld))
    const {form}= this.metaAction.gf('data').toJS()
    this.metaAction.sfs('data.form',fromJS(Object.assign(form)))*/
    this.metaAction.sf('data.form',fromJS(formOld))
    this.metaAction.sf('data.filterForm',fromJS(formOld))
   
  }
  handerSearch = ()=>{
    const {form, filterForm }= this.metaAction.gf('data').toJS()
    Object.assign(filterForm, form)
    if(this.component.props.onChange){
      this.component.props.onChange(form)
    }
    this.metaAction.sfs({
      'data.visible': false,
      'data.filterForm': fromJS(filterForm)
    })
    
  }
  disabledStartDate = (startValue) => {
    const endValue = this.metaAction.gf('data.form.bill_date')
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > this.metaAction.stringToMoment(endValue,'YYYY-MM').valueOf();
  }
  
  disabledEndDate = (endValue) => {
    const startValue = this.metaAction.gf('data.form.bill_date_start')
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= this.metaAction.stringToMoment(startValue,'YYYY-MM').valueOf();
  }
  
}

export default function creator(option) {
  const metaAction = new MetaAction(option),
    o = new action({ ...option, metaAction }),
    ret = { ...metaAction, ...o }
  
  metaAction.config({ metaHandlers: ret })
  
  return ret
}
