import React from 'react'
import { DatePicker } from 'antd'
import {fromJS} from 'immutable'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import {Button,Icon} from 'antd'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        // 下面的代码无法赋值成功
        injections.reduce('init',{
            fpzlcsVoList: this.component.props.data.fpzlcsVoList,
            gxbzList: this.component.props.data.gxbzList,
            rzztList: this.component.props.data.rzztList
        })
    }
    componentWillReceiveProps = ( nextProps ) => {
        // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
        const fpzlcsVoList= this.metaAction.gf('data.fpzlcsVoList')
        const rzztList= this.metaAction.gf('data.rzztList')
        const gxbzList= this.metaAction.gf('data.gxbzList')
 
        const { data } = nextProps
        // if(isEquall(fpzlcsVoList,data.fpzlcsVoList)) return
        // this.metaAction.sfs({
        // //     'data.fpzlcsVoList': data.fpzlcsVoList,
        //     'data.gxbzList': data.gxbzList,
        // //     // 'data.rzztList': fromJS(data.rzztList),
        // })
    }
    // 高级筛选框的显示与隐藏切换
    handleVisibleChange = (visible)=>{
        if (visible) {
            const filterForm = this.metaAction.gf('data.filterForm').toJS()
            this.metaAction.sf('data.form', fromJS(filterForm))
        }
        this.metaAction.sf('data.visible',visible)
    }
    
    handerReset = () =>{
        const formOld ={
            kprqq: undefined,  // 开票日期起
            kprqz: undefined,  // 开票日期止
            fpzlDm: undefined,   //发票类型代码
            fphm: undefined,  //发票号码
            gxbz: undefined,  //勾选状态
            rzzt: undefined,  //认证状态
            gfsbh: ""	
        }
        // formOld.fphm = this.metaAction.gf('data.form.fphm')
        this.metaAction.sf('data.form',fromJS(formOld))
        // *需确认 点击重置按钮需要重新请求页面数据吗*
    }
    handerSearch = ()=>{
        const {form, filterForm, xfmc }= this.metaAction.gf('data').toJS()
        Object.assign(filterForm, form)
        const params = {xfmc, ...form}
        console.log('.........params',params)
        // 触发父组件的事件，把参数传递出去
        if(this.component.props.onChange){
            this.component.props.onChange(params)
        }
        this.metaAction.sfs({
            'data.visible': false,
            'data.filterForm': fromJS(filterForm)  // 备份form的数据
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

    // 关闭会话框
    destroyDialog = (wrapClassName) => {
        const dialog = document.getElementsByClassName(wrapClassName)[0].parentNode.parentNode
        document.body.removeChild(dialog)
    }

    // 勾选发票——“保存”按钮
    onClickSave = (event) =>{
        this.metaAction.modal('show', {
            width: 500,
            height: 200,
            okText: '确定',
            footer: 
                <Button type="primary" onClick={this.onOkClick}>确定</Button>
            ,
            centered: true,
            wrapClassName: 'check-num-sure',
            children: <div style={{padding: '0 25px 30px'}}>
                <h4 style={{height: "24px",lineHeight: "24px",fontSize: "16px",marginBottom: "15px"}}> <Icon type="question-circle" style={{color: '#53bdbd',fontSize: "22px","verticalAlign":"middle",marginTop:"-3px",marginRight: "8px"}}/>请确认</h4>
                <ul style={{textIndent: "2em",listStyle:"none",padding:0,margin: 0,fontSize:"14px",lineHeight: '26px'}}>
                    <li>本次勾选发票汇总如下：</li>
                    <li>本次勾选 <span className="confirm_invoice_sum" style={{color: '#f28e49',fontWeight: '700'}}>1</span> 份，金额合计: <span className="confirm_cash_sum" style={{color: '#f28e49',fontWeight: '700'}}>1029.39</span> 元，税额合计：<span className="confirm_tax_sum" style={{color: '#f28e49',fontWeight: '700'}}>30.87</span> 元</li>
                    <li>请确认是否提交？</li>
                </ul>
            </div>
        })
    }

    // 确认提交操作
    onOkClick = () => {
        this.destroyDialog('check-num-sure')
        this.metaAction.modal('show', {
            width: 480,
            height: 100,
            closable: false,
            footer: null,
            allowDrag: false,
            wrapClassName: 'check-save-success-tip',
            children: <div>
                <h4 style={{height: "24px",lineHeight: "24px",fontSize: "16px"}}><Icon type="check-circle" style={{color: '#1ab394',fontSize: "22px","verticalAlign":"middle",marginTop:"-3px",marginRight: "8px"}}/>勾选成功！</h4>
                <div style={{position: 'relative',lineHeight: '26px',padding: '5px 0 0px 40px',marginLeft: '30px'}}>
                    <span style={{position: 'absolute',top:'5px',left: 0}}>提示：</span>
                    对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票勾选认证！
                </div>
            </div>
        })

        const _this = this
        setTimeout(() => {
            _this.destroyDialog('check-save-success-tip')
        }, 1500);
    }

    // 下载发票
    onloadInvoice = () => {

        
        this.metaAction.modal('show', {
            width: 450,
            height: 200,
            title: '下载发票',
            wrapClassName: 'check-download-invoices',
            bodyStyle: {borderTop:'1px solid #d9d9d9'},
            footer:  <Button type="primary" onClick={()=>{this.destroyDialog('check-download-invoices')}}>确定</Button>,
            children: <div style={{padding: '40px 40px'}}>
                <div style={{marginBottom: '18px'}}>
                    <span>发票下载月份：</span>
                    <DatePicker.MonthPicker format="YYYY-MM" onChange={this.onloadInvoiceMonth} placeholder="请选择下载月份"/>
                </div>
                <p><span style={{color:'#ffc000'}}>温馨提示：</span>包含本月抵扣发票和本月开具发票</p>
            </div>
        })
    }

    // 选择下载月份的值的变化
    onloadInvoiceMonth = (month) => {
        // console.log(month)
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

