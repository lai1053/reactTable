import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import moment from 'moment';

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

        injections.reduce('init');

    }

    componentDidMount = () => {
        this.mounted = true;
        this.load();
    }

    componentWillUnmount = () => {
        this.mounted = false;
    }

    load = async () => {
        let skssq = this.component.props.nsqj;
        let getNsrZgrdXx = await this.webapi.invoice.getNsrZgrdXx({
            skssq
        });
        let uniformOrAricultural = this.component.props.uniformOrAricultural;
        let vato = this.component.props.vato;

        if (!this.mounted) return //组件已经卸载
        let isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod;
        this.injections.reduce('updateSfs', {
            'data.other.isTutorialPeriod': isTutorialPeriod,
            'data.form.dkyf': skssq,//抵扣月份
            'data.other.uniformOrAricultural': uniformOrAricultural,
            'data.other.vato': vato,
            'data.enableBdzt': uniformOrAricultural ? true : false,//统一、农产品
            'data.form.bdzt': uniformOrAricultural ? '1' : undefined,//统一、农产品 已认证
            'data.loading': false
        });
    }

    onOk = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            { swVatTaxpayer, vatTaxpayerNum: nsrsbh, id: qyId } = currentOrg;
        let skssq = this.component.props.nsqj || '';
        let { bdzt, dkyf } = this.metaAction.gf('data.form').toJS();
        let kjxhList = this.component.props.kjxhList;
        let enableDkyf = this.metaAction.gf('data.enableDkyf');
        let enableBdzt = this.metaAction.gf('data.enableBdzt')
        let uniformOrAricultural = this.component.props.uniformOrAricultural;
        if (!enableDkyf) {
            dkyf = null
        }
        if (!enableBdzt || uniformOrAricultural) {
            bdzt = undefined
        }
        if (bdzt===undefined && dkyf===undefined) {
            this.metaAction.toast('error', '请选择要修改的项');
            return false
        }
        let bdlyLx = null
        if(dkyf === ''){
            bdlyLx  = '6'
        }else if ( dkyf === '10'){
            dkyf = ''
            bdlyLx = '10'
        }else if(dkyf !== '' &&  dkyf !== '10' ){
            bdlyLx = '1'
        }
        let params = {
            kjxhList,
            bdzt,
            dkyf,
            nsrsbh,
            skssq,
            bdlyLx:bdlyLx
        }
        console.log(params);
        this.injections.reduce('update', 'data.loading', true);
        let res = await this.webapi.invoice.batchUpdateJxfp(params);
        if (!this.mounted) return
        this.injections.reduce('update', 'data.loading', false);
        if (res || res === null) {
            this.metaAction.toast('success', '批量修改成功');
            return {
                listNeedLoad: true
            };
        }
        return false;
    }
    onCancel = () => {
        return {
            listNeedLoad: false
        };
    }
    handleFieldChangeV = (path, v) => {
        this.injections.reduce('update', path, v)
    }
    handleFieldChangeE = (path, e) => {
      let nsqj = this.component.props.nsqj;
      let selectedOption = this.component.props.selectedOption
      let flag = false
      selectedOption.forEach((item)=>{
          if(item.fplyLx === "1" &&  item.bdzt === "1"){
            flag = true
          }
      })
      if(flag === true && e.target.value === "0"){
        this.metaAction.modal('warning', {
          title: '批量修改进项发票失败！',
          okText: '确定',
          content: '一键读取的已认证发票，不允许修改认证状态，请取消勾选此类发票，再操作！'
        })
        return
      }
      let enableDkyf = this.metaAction.gf('data.enableDkyf')
      let obj = {}
        if (e.target.value === '1' && enableDkyf) {
            obj['data.form.dkyf'] = nsqj
        } else {
            obj['data.form.dkyf'] = null
        }
        obj[path] = e.target.value;
        this.injections.reduce('updateSfs', obj)
    }

    handleFieldChangeC = (path, e) => {

        if (path === 'data.enableDkyf' && !e.target.checked) {
            this.injections.reduce('update', 'data.form.dkyf', null);
        } else if (path === 'data.enableDkyf' && e.target.checked) {
            let nsqj = this.component.props.nsqj;
            let bdzt = this.metaAction.gf('data.form.bdzt');
            if (bdzt === '1') {
                this.injections.reduce('update', 'data.form.dkyf', nsqj);
            }
        }
        if (path === 'data.enableBdzt' && !e.target.checked) {
            this.injections.reduce('update', 'data.form.bdzt', undefined);
        }
        this.injections.reduce('update', path, e.target.checked)
    }

    renderDkyf = () => {
        let nsqj = this.component.props.nsqj;
        let isTutorialPeriod = this.metaAction.gf('data.other.isTutorialPeriod');
        let uniformOrAricultural = this.component.props.uniformOrAricultural;// 
        if (nsqj) {
            if (!uniformOrAricultural) {
                let skssq = moment(nsqj, 'YYYYMM');
                let skssqString = skssq.format('YYYYMM');

                if (isTutorialPeriod === 'Y') {
                    let nextskssq = skssq.add('month', 1); //下月
                    let nextskssqString = nextskssq.format('YYYYMM');
                    return [
                        <Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>,
                        <Option title={nextskssqString} key={nextskssqString} value={nextskssqString} >{nextskssqString}</Option>,
                        <Option title='待抵扣' key='ye' value='10'>待抵扣</Option>,
                        <Option title='不抵扣' key='no' value=''>不抵扣</Option>
                    ]
                }
                return [
                    <Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>,
                    <Option title='待抵扣' key='ye' value='10'>待抵扣</Option>,
                    <Option title='不抵扣' key='no' value=''>不抵扣</Option>
                ]
            } else {
                let skssq = moment(nsqj, 'YYYYMM');
                let skssqString = skssq.format('YYYYMM');
                let arr = [<Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>];
                let nextskssq = skssq;
                for (let i = 0; i < 11; i++) {
                    nextskssq = nextskssq.add('month', 1); //下月
                    let nextskssqString = nextskssq.format('YYYYMM');
                    arr.push(<Option title={nextskssqString} key={nextskssqString} value={nextskssqString} >{nextskssqString}</Option>)
                }
                arr.push( <Option title='待抵扣' key='ye' value='10'>待抵扣</Option>,
                    <Option title='不抵扣' key='no' value=''>不抵扣</Option>)

                return arr;
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}