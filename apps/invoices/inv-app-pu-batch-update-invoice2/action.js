import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import moment from 'moment'

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
    if (this.component.props.setCancelLister) {
      this.component.props.setCancelLister(this.onCancel)
    }

    injections.reduce('init')
  }
  componentDidMount = () => {
    this.mounted = true
    let swVatTaxpayer = this.component.props.swVatTaxpayer
    this.metaAction.sf('data.swVatTaxpayer',swVatTaxpayer)
    this.load()
  }

  componentWillUnmount = () => {
    this.mounted = false
  }

  load = async () => {
    let skssq = this.component.props.nsqj
    let getNsrZgrdXx = await this.webapi.invoice.getNsrZgrdXx({
      skssq
    })
    let uniformOrAricultural = this.component.props.uniformOrAricultural
    let uniformOrAriculturalVato = this.component.props.uniformOrAriculturalVato
    let vato = this.component.props.vato

    if (!this.mounted) return //组件已经卸载
    let isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod
    this.injections.reduce('updateSfs', {
      'data.other.isTutorialPeriod': isTutorialPeriod,
      'data.form.dkyf': undefined, //抵扣月份
      'data.other.uniformOrAricultural': uniformOrAricultural,
      'data.other.isShenBaoYongTu':uniformOrAriculturalVato== true ? false : true,
      'data.other.vato': vato,
      'data.enableBdzt': uniformOrAricultural ? true : false, //统一、农产品
      'data.form.bdzt': uniformOrAricultural ? '1' : undefined, //统一、农产品 已认证
      'data.loading': false
    })
  }

  onOk = async () => {
    let currentOrg = this.metaAction.context.get('currentOrg') || {},
      { vatTaxpayerNum: nsrsbh, id: qyId } = currentOrg
    let skssq = this.component.props.nsqj || ''
    let { bdzt, dkyf, dkzt } = this.metaAction.gf('data.form').toJS()
    let kjxhList = this.component.props.kjxhList
    let enableDkyf = this.metaAction.gf('data.enableDkyf')
    let enableBdzt = this.metaAction.gf('data.enableBdzt')
    let shenBaoYongTu = this.metaAction.gf('data.shenBaoYongTu')
    let uniformOrAricultural = this.component.props.uniformOrAricultural
    let uniformOrAriculturalVato = this.component.props.uniformOrAriculturalVato
    let swVatTaxpayer = this.component.props.swVatTaxpayer
    let newFlag = false
    let data = this.metaAction.gf('data').toJS()
    let dkyfFlag = false //抵扣月份必须大于等于开票日期
    let params
    if(swVatTaxpayer === "0"){
      if (!enableBdzt || uniformOrAricultural) {
        bdzt = undefined
      }
      if (bdzt === undefined && dkyf === undefined && uniformOrAriculturalVato === false && data.immediateWithdrawal === false) {
        this.metaAction.toast('error', '请选择要修改的状态')
        return false
      }
      if (!data.shenBaoYongTu && !data.enableBdzt && !data.immediateWithdrawalRadio) {
        this.metaAction.toast('error', '请选择要修改的状态')
        return false
      }
      let selectedOption = this.component.props.selectedOption
      let itemFlga = true
      selectedOption.forEach(item=>{
        if( item.fpzlDm !== '01' ) itemFlga = false
        //if(item.fpzlDm === '07' || item.fpzlDm === '99' || item.fpzlDm === '04'){
        if(item.fpzlDm === '07' || item.fpzlDm === '99' || item.fpzlDm === '04' || item.fpzlDm === '14' || item.fpzlDm === '18'){
          newFlag = true
        }
        if(skssq < item.skssq){
          dkyfFlag = true
        }
      })
      if(dkyfFlag == true){
        this.metaAction.modal('warning', {
          title: '批量修改进项发票失败！',
          okText: '确定',
          content:
              `您只能在当期或往后属期中将发票修改为抵扣，请先将发票属期大于${skssq}的记录取消勾选，再操作！`
        })
        return false
      }
      if(shenBaoYongTu){
        if(itemFlga === false && (dkzt === '2' || dkzt === '3') ){
          this.metaAction.modal('warning', {
            title: '',
            okText: '确定',
            content:
                '申报用途“退税/代办退税”，只有【增值税专用发票】才能选择，请取消其他票种再操作！'
          })
          return false
        }
    
    
      }
      if (newFlag === true && !data.immediateWithdrawal) {
        this.metaAction.modal('warning', {
          title: '批量修改进项发票失败！',
          okText: '确定',
          content:
              '普通发票、农产品发票、旅客票、二手车发票、其他票据不允许修改认证状态，请取消勾选此类发票，再操作！'
        })
        return false
      }
  
      if(uniformOrAricultural){
        bdzt = '1'
      }
      params = {
        kjxhList,
        bdzt,
        dkyf,
        nsrsbh,
        skssq,
        bdlyLx: dkzt,
        newJzjtDm:data.immediateWithdrawalRadio
      }
    }else {
      if (!data.immediateWithdrawalRadio) {
        this.metaAction.toast('error', '请选择要修改的状态')
        return false
      }
      params={
        dkyf,
        kjxhList,
        nsrsbh,
        newJzjtDm:data.immediateWithdrawalRadio
      }
    }
 
    
    this.injections.reduce('update', 'data.loading', true)
    let res = await this.webapi.invoice.batchUpdateJxfp(params)
    if (!this.mounted) return
    this.injections.reduce('update', 'data.loading', false)
    if (res || res === null) {
      this.metaAction.toast('success', '批量修改成功')
      return {
        listNeedLoad: true
      }
    }
    return false
  }
  onCancel = () => {
    return {
      listNeedLoad: false
    }
  }
  // 抵扣月份
  handleFieldChangeV = (path, v) => {
    this.injections.reduce('update', path, v)
  }
  // 已认证未认证
  handleFieldChangeE = (path, e) => {
    let nsqj = this.component.props.nsqj
    let selectedOption = this.component.props.selectedOption
    let flag = false
    let newFlag = false
    let fivFlag = false
    selectedOption.forEach(item => {
      if (item.fplyLx === '1' && item.bdzt === '1'&&(item.sf11!== 'Y' || !item.sf11)) {
        flag = true
      }
      if(item.fpzlDm === '07' || item.fpzlDm === '99' || item.fpzlDm === '04' || item.fpzlDm === '14' || item.fpzlDm === '18'){
        newFlag = true
      }
      if(item.fpzlDm !== '01' || item.fpzlDm !== '03' ||item.fpzlDm !== '13' || item.fpzlDm !== '12' || item.fpzlDm !== '17'){
        fivFlag = true
      }
    })
   /* if (flag === true && e.target.value === '0') {
      this.metaAction.modal('warning', {
        title: '批量修改进项发票失败！',
        okText: '确定',
        content:
          '一键读取的已认证发票，不允许修改认证状态，请取消勾选此类发票，再操作！'
      })
      return
    }*/
  /*   if (fivFlag === true && e.target.value === '0') {
    this.metaAction.modal('warning', {
      title: '批量修改进项发票失败！',
      okText: '确定',
      content:
        '此类发票不允许修改认证状态，请取消勾选此类发票，再操作！'
    })
    return
  }*/
    if (newFlag === true && e.target.value === '0') {
      this.metaAction.modal('warning', {
        title: '批量修改进项发票失败！',
        okText: '确定',
        content:
            '普通发票、农产品发票、旅客票、二手车发票、其他票据不允许修改认证状态，请取消勾选此类发票，再操作！'
      })
      return
    }
    
    let enableDkyf = this.metaAction.gf('data.enableDkyf')
    let obj = {}
    if (e.target.value === '1') {
      obj['data.form.dkyf'] = nsqj
      obj['data.shenBaoYongTu'] = true
      obj['data.form.dkzt'] = '1'
      obj['data.other.isShenBaoYongTu'] = false
      obj['data.enableDkyf'] = false
    } else {
      obj['data.shenBaoYongTu'] = false
      obj['data.other.isShenBaoYongTu'] = true
      obj['data.form.dkzt'] = undefined
      obj['data.form.dkyf'] = undefined
      obj['data.enableDkyf'] = true
    }
    obj[path] = e.target.value
    this.injections.reduce('updateSfs', obj)
  }
  //认证状态勾选
  handleFieldChangeC = (path, e) => {
    if (e.target.checked === false) {
      let obj = {}
      obj['data.shenBaoYongTu'] = false
      obj['data.other.isShenBaoYongTu'] = true
      obj['data.form.dkzt'] = undefined
      obj['data.form.dkyf'] = undefined
      obj['data.enableDkyf'] = true
      obj[path] = e.target.value
      this.injections.reduce('updateSfs', obj)
    }
    if (path === 'data.enableDkyf' && !e.target.checked) {
      this.injections.reduce('update', 'data.form.dkyf', undefined)
    } else if (path === 'data.enableDkyf' && e.target.checked) {
      let nsqj = this.component.props.nsqj
      let bdzt = this.metaAction.gf('data.form.bdzt')
      if (bdzt === '1') {
        this.injections.reduce('update', 'data.form.dkyf', nsqj)
      }
    }
    if (path === 'data.enableBdzt' && !e.target.checked) {
      this.injections.reduce('update', 'data.form.bdzt', undefined)
    }
    this.injections.reduce('update', path, e.target.checked)
  }
  // 申报用途勾选
  handleFieldChangeCC = (path, e) => {
    if (path === 'data.enableDkyf' && !e.target.checked) {
      this.injections.reduce('update', 'data.form.dkyf', undefined)
    } else if (path === 'data.enableDkyf' && e.target.checked) {
      let nsqj = this.component.props.nsqj
      let bdzt = this.metaAction.gf('data.form.bdzt')
      if (bdzt === '1') {
        this.injections.reduce('update', 'data.form.dkyf', nsqj)
      }
    }
    if (path === 'data.shenBaoYongTu' && !e.target.checked) {
      this.injections.reduce('update', 'data.form.dkzt', undefined)
    }
    this.injections.reduce('update', path, e.target.checked)
  }
  // 申报用途
  handleFieldChangeEE = (path, e) => {
    let nsqj = this.component.props.nsqj
    let selectedOption = this.component.props.selectedOption
    let enableDkyf = this.metaAction.gf('data.enableDkyf')
    let sf18Flag = false
    selectedOption.forEach(item => {
      if (item.sf18 && item.sf18 !== '1' && item.fplyLx === '1') {
        sf18Flag = true
      }
    })
    /*
    * 2020年一月三日被华艳解除此条件
    * author：binlonglai
    * */
 /*   if (sf18Flag === true && e.target.value !== '1') {
      this.metaAction.modal('warning', {
        title: '批量修改进项发票失败！',
        okText: '确定',
        content:
          '申报用途不是用于“抵扣”或“待抵扣”的，不允许修改申报用途，请取消勾选此类发票，再操作！'
      })
      return
    }*/
    let obj = {}
    if (e.target.value === '1') {
      obj['data.form.dkyf'] = nsqj
      obj['data.enableBdzt'] = true
      obj['data.form.bdzt'] = '1'
    } else {
      obj['data.form.dkyf'] = undefined
    }
    obj[path] = e.target.value
    this.injections.reduce('updateSfs', obj)
  }

  renderDkyf = () => {
    let nsqj = this.component.props.nsqj
    let isTutorialPeriod = this.metaAction.gf('data.other.isTutorialPeriod')
    let uniformOrAricultural = this.component.props.uniformOrAricultural //
    if (nsqj) {
      if (!uniformOrAricultural) {
        let skssq = moment(nsqj, 'YYYYMM')
        let skssqString = skssq.format('YYYYMM')

        if (isTutorialPeriod === 'Y') {
          let nextskssq = skssq.add('month', 1) //下月
          let nextskssqString = nextskssq.format('YYYYMM')
          return [
            <Option title={skssqString} key={skssqString} value={skssqString}>
              {skssqString}
            </Option>,
            <Option
              title={nextskssqString}
              key={nextskssqString}
              value={nextskssqString}>
              {nextskssqString}
            </Option>
            // <Option title="不抵扣" key="no" value="">
            //   不抵扣
            // </Option>
          ]
        }
        return [
          <Option title={skssqString} key={skssqString} value={skssqString}>
            {skssqString}
          </Option>
          // <Option title="不抵扣" key="no" value="">
          //   不抵扣
          // </Option>
        ]
      } else {
        let skssq = moment(nsqj, 'YYYYMM')
        let skssqString = skssq.format('YYYYMM')
        let arr = [
          <Option title={skssqString} key={skssqString} value={skssqString}>
            {skssqString}
          </Option>
        ]
        let nextskssq = skssq
        for (let i = 0; i < 11; i++) {
          nextskssq = nextskssq.add('month', 1) //下月
          let nextskssqString = nextskssq.format('YYYYMM')
          arr.push(
            <Option
              title={nextskssqString}
              key={nextskssqString}
              value={nextskssqString}>
              {nextskssqString}
            </Option>
          )
        }
        // arr.push(
        //   <Option title="不抵扣" key="no" value="">
        //     不抵扣
        //   </Option>
        // )

        return arr
      }
    }
  }
  handerImmediateWithdrawalOrCargoType=(checked, t)=>{
    this.metaAction.sf(t == 1 ? 'data.immediateWithdrawal' : 'data.cargoType', checked)
  }
}

export default function creator(option) {
  const metaAction = new MetaAction(option),
    o = new action({ ...option, metaAction }),
    ret = { ...metaAction, ...o }

  metaAction.config({ metaHandlers: ret })

  return ret
}
