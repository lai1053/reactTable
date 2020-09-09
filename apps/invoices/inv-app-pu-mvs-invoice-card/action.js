import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import moment from 'moment';
import utils from 'edf-utils'
import { fromJS } from 'immutable';
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
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init');

    }

    componentDidMount = () => {
        this.mounted = true;
        this.listNeedLoad = false;
        this.load(this.component.props.kjxh);
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }
    load = async (kjxh) => {

        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            { swVatTaxpayer, vatTaxpayerNum: nsrsbh, id: qyId } = currentOrg,
            nsrxz = swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS',
            skssq = this.component.props.nsqj || '',
            initData = {
                dkyf: skssq,
                bdzt: true,
            }
        if (kjxh) {
            let res
            if(this.component.props.justShow === true){
                let dataRes = await this.webapi.invoice.queryJxfpDto(this.component.props.invArguments);
                if(dataRes.flag === true){
                    res = dataRes.jxfp
                }else {
                    const confirm = await this.metaAction.modal("error", {
                        content: <span>{dataRes.msg}</span>,
                        width: 340,
                        okText:'确定',
                        mask:false
                    });
                    if(confirm){
                        this.component.props.closeModal()
                    }
                }
            }else {
                res = await this.webapi.invoice.queryJxfp({ kjxh });
            }
            if (res) {

                res.kprq = res.kprq ? moment(res.kprq) : null; //开票日期
                res.bdzt = res.bdzt === '1' ? true : false; //认证状态
                res.dkyf = !res.dkyf && res.bdzt ? '' : res.dkyf // 抵扣月份返回为空时
                if (res.fplyLx === '1') {
                    res.dkyf = res.dkyf ? res.dkyf : '不抵扣'
                }
                initData = res;
            }
        } else {
            let gfinfo = await this.webapi.invoice.initiateAddOfJxfp({
                nsrsbh, // -- 纳税人识别号
                qyId,
                fpzlDm:'03',
                skssq
            });
            if (gfinfo) {
                initData = {
                    ...initData,
                    gfmc: gfinfo.gfmc,
                    gfsbh: gfinfo.gfsbh,
                    fplyLx: '2',
                }
            }
        }
    
        let taxRates = []
        if(this.component.props.justShow != true)taxRates = await this.webapi.invoice.getSlvcsList({nsrxz, fplx: 'jxfp', fpzlDm: '03'})
        if (!this.mounted) return
        let isTutorialPeriod;
        if (this.notXaoGuiMo()) {
            let getNsrZgrdXx = {}
            if(this.component.props.justShow != true) getNsrZgrdXx= await this.webapi.invoice.getNsrZgrdXx({skssq});
            if (!this.mounted) return //组件已经卸载
            isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod;
        }
        let sbytcsRes = [];
        if (this.isV2Component()&&this.component.props.justShow != true) {
            sbytcsRes = await this.webapi.invoice.getSbytcsList(`nsrxz=YBNSRZZS&fplx=jxfp&fpzlDm=03`)
        }
        let form = this.metaAction.gf('data.form').toJS();
        form = {
            ...form,
            ...initData,
            ...this.formDataV2(initData),
        }
        if (this.component.props.fromModule === 'InvoiceAuthentication') {
            form.bdzt = 0;
            form.dkyf = null
            form.bdlyLx = null
        }
        let cacheFplyLx = form.fplyLx;
        if (form.fplyLx != 2 && form.fplyLx != 1) {
            // 将 3导入 4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx;
            form.fplyLx = '1'
        }
        form.oldNf06 = form.nf06
        this.injections.reduce('updateSfs', {
            'data.other.taxRates': fromJS(taxRates),
            'data.slListCache':fromJS(taxRates),
            'data.cacheFplyLx': cacheFplyLx,
            'data.form': fromJS(form),
            'data.other.isTutorialPeriod': isTutorialPeriod,
            'data.other.defaultPickerValue': moment(skssq, 'YYYYMM'),
            'data.sbytcsList': fromJS(sbytcsRes),
            'data.loading': false,
            'data.justShow':this.component.props.justShow
    
        });
    }
    renderDkyf = () => {
        let nsqj = this.component.props.nsqj;
        let isTutorialPeriod = this.metaAction.gf('data.other.isTutorialPeriod');
        if (nsqj) {
            let skssq = moment(nsqj, 'YYYYMM');
            let skssqString = skssq.format('YYYYMM');
            let _com = []
            if (isTutorialPeriod === 'Y') {
                let nextskssq = skssq.add('month', 1); //下月
                let nextskssqString = nextskssq.format('YYYYMM');
                _com = [
                    <Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>,
                    <Option title={nextskssqString} key={nextskssqString} value={nextskssqString} >{nextskssqString}</Option>,
                    <Option title='不抵扣' key='no' value=''>不抵扣</Option>
                ]
                return this.isV2Component() ? _com.slice(0, 2) : _com;
            }
            _com = [
                <Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>,
                <Option title='不抵扣' key='no' value=''>不抵扣</Option>
            ]
            return this.isV2Component() ? _com[0] : _com;
        }
    }
    //改变必填项的 e.target.value
    handleFieldChangeE = (path, e, must) => {
        if (must) {
            let errorPath = path.replace('form', 'error')
            let obj = {
                [path]: e.target.value,
                [errorPath]: ''
            }
            this.injections.reduce('updateSfs', obj)
        } else {
            this.injections.reduce('update', path, e.target.value)
        }
    }

    //直接改变value
    handleFieldChangeV = (path, v, must) => {

        if (must) {
            let errorPath = path.replace('form', 'error')
            let obj = {
                [path]: v,
                [errorPath]: ''
            }
            this.injections.reduce('updateSfs', obj)
        } else {
            this.injections.reduce('update', path, v)
        }
    }
    // 发票类型选择
    typeActionChange = (v) => {
        let slListCache = this.metaAction.gf('data.slListCache').toJS()
        let nsrxz = this.metaAction.gf('data.nsrxz')
        // console.log('');
        let slList = [],
            jsfsList = []
        if (v == 'Y') {
            // 专用发票，2019.7.5版本修改为不含免税
            slList = slListCache.filter(f => f.slv !== 0)
        } else {
            // 普通发票
            slList = slListCache
        }
        this.metaAction.sfs({
            'data.other.taxRates': fromJS(slList),
            'data.form.zbslv': nsrxz === 'XGMZZS' ? 0.03 : undefined,
            'data.form.jsfsDm': undefined,
            'data.form.hjse': undefined,
            'data.form.hjje': undefined,
            'data.form.sf01': v,
            // 'data.other.jzjtbzDisabled': false,
        })
    }

    //改变e.targie.checked
    handleFieldChangeC = (path, e) => {
        let nsqj = this.component.props.nsqj || ''
        let obj = {
            [path]: e.target.checked,
            'data.form.dkyf': e.target.checked ? nsqj : null // 默认为当前属期
        }
        this.injections.reduce('updateSfs', obj);
    }

    onOk = async () => {
        if(this.component.props.justShow === true){
            // 什么都不执行 直接关闭
        }else {
            let params = this.checkForm();
            if (!params) return false;
            const currentOrg = this.metaAction.context.get('currentOrg') || {};
            let skssq = this.component.props.nsqj || '';
            let kprq = params.kprq;
            params.kprq = kprq.format('YYYY-MM-DD HH:mm:ss'); //开票日期
            params.bdzt = params.bdzt ? 1 : 0; //认证状态 1 已认证 0未认证
            params.fpzlDm = '03'; //发票种类代码
            params.skssq = params.bdzt ? skssq : kprq.format('YYYYMM') //税款所属期 已认证，税款所属期为：报税月份-1；未认证或者普票，税款所属期为：开票月份
            params.sf03 = params.fpdm; //机打代码=发票代码
            params.sf04 = params.fphm; //机打号码=发票号码
            params.sf02 = params.gfsbh; //身份证/机构码=购方识别号
            this.injections.reduce('update', 'data.loading', true);
            let apiname = this.component.props.kjxh ? 'updateJxfp' : 'addJxfp'
            if (!this.component.props.kjxh && currentOrg.swVatTaxpayer == 2000010002) {
                // 小规模，新增发票,bdzt=0 默认是未认证 dkyf=空 skssq=选择开票月份
                params.bdzt = 0;
                params.dkyf = null;
                params.skssq = kprq.format('YYYYMM');
                delete params.mxDetailList
            }
            const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
            if (cacheFplyLx > -1 && cacheFplyLx != params.fplyLx) {
                params.fplyLx = cacheFplyLx
            }
            let res = await this.webapi.invoice[apiname](params);
            if (!this.mounted) return
            this.injections.reduce('update', 'data.loading', false);
            if (this.component.props.kjxh && res === null) {
                this.listNeedLoad = true;
                this.metaAction.toast('success', '发票修改成功');
            } else if (res) {
                this.metaAction.toast('success', '新增发票成功');
                this.listNeedLoad = true;
                let initFormData = {
                    fpdm: params.fpdm, //发票代码
                    fphm: res.fphm, //发票号码+1
                    bdzt: this.component.props.fromModule === 'InvoiceAuthentication' ? false : true, //认证状态 发票采集默认选中 其它模块默认不选中
                    dkyf: skssq, //默认为当前属期
                    gfmc: params.gfmc, //购方名称
                    gfsbh: params.gfsbh, //购方识别号
                    mxDetailList:[
                        {jzjtDm:'N'}
                    ],
                    fplyLx: '2',
                }
                this.injections.reduce('update', 'data.form', {
                    ...initFormData,
                    ...this.formDataV2(initFormData),
                });
            }
            return false; //点击确定不关闭弹框
        }
       
    }
    onCancel = () => {
        return {
            listNeedLoad: this.listNeedLoad
        };
    }
    handleGetPopupContainer = () => {
        return document.body;
        //return document.querySelector(".inv-app-pu-mvs-invoice-card")
    }
    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS();
        let error = this.metaAction.gf('data.error').toJS();
        error.mxDetailList = []
        let flag = true;
        if (!form.fpdm) {
            error.fpdm = '发票号码不能为空'
            flag = false
        } else if (form.fpdm.length !== 12) {
            error.fpdm = '发票代码长度应为12个字符'
            flag = false
        }

        if (!form.fphm) {
            error.fphm = '发票号码不能为空'
            flag = false
        } else if (form.fphm.length !== 8) {
            error.fphm = '发票号码长度应为8个字符'
            flag = false
        }

        if (!form.kprq) {
            error.kprq = '开票日期不能为空'
            flag = false
        }
        if (form.jshj === undefined) {
            error.jshj = '价税合计(小写)不能为空'
            flag = false
        }
        if (!form.xfmc) {
            error.xfmc = '销售方名称不能为空'
            flag = false
        }
        if (!form.xfsbh) {
            error.xfsbh = '销售方纳税人识别号不能为空'
            flag = false
        } else if (form.xfsbh.length < 15 || form.xfsbh.length > 30) {
            error.xfsbh = '纳税人识别号长度最少15个字符，最多30个字符'
            flag = false
        }
        if (form.zbslv === undefined) {
            error.zbslv = '税率不能为空'
            flag = false
        }
        if (form.hjse === undefined) {
            error.hjse = '税额不能为空'
            flag = false
        }
        if (form.hjje === undefined) {
            error.hjje = '不含税价不能为空'
            flag = false
        }
        if (!form.cllx) {
            error.cllx = '车辆类型不能为空'
            flag = false
        }
        if (form.sf12 && form.sf12.length < 21) {
            error.sf12 = '税控码最少21个字符'
            flag = false
        } else if (form.sf12 && form.sf12.length > 36) {
            error.sf12 = '税控码最多36个字符'
            flag = false
        }
        if (form.sf13 && form.sf13.length < 21) {
            error.sf13 = '税控码最少21个字符'
            flag = false
        } else if (form.sf13 && form.sf13.length > 36) {
            error.sf13 = '税控码最多36个字符'
            flag = false
        }
        if (form.sf14 && form.sf14.length < 21) {
            error.sf14 = '税控码最少21个字符'
            flag = false
        } else if (form.sf14 && form.sf14.length > 36) {
            error.sf14 = '税控码最多36个字符'
            flag = false
        }
        if (form.sf15 && form.sf15.length < 21) {
            error.sf15 = '税控码最少21个字符'
            flag = false
        } else if (form.sf15 && form.sf15.length > 36) {
            error.sf15 = '税控码最多36个字符'
            flag = false
        }
        if (this.isV2Component()) {

            if (!this.notAllowEditNf06()) {
                const nf06Flag = this.handleFormNumberBlur("nf06")();
                if (nf06Flag) {
                    flag = false
                    error.nf06 = nf06Flag
                }
            }
            if (form.fplyLx == 2 && form.bdzt == 1) {
                if (form.bdlyLx == null) {
                    error.bdlyLx = '申报用途不能为空'
                    flag = false;
                }
                if (form.bdlyLx == 1 && form.dkyf == null) {
                    error.dkyf = '抵扣月份不能为空'
                    flag = false;
                }
                if (!(form.nf06 || form.nf06 === 0)) { //form.bdlyLx == 1 &&
                    error.nf06 = '有效税额不能为空'
                    flag = false;
                }
            }
        }

        if (!flag) {
            this.injections.reduce('update', 'data.error', error);
        }
        if (!flag) {
            this.metaAction.toast('error', '红框内必须有值！')
        }
        return flag ? form : false
    }

    //价税合计改变
    amountChange = (v) => {
        if (!Number(v)) {
            this.injections.reduce('updateSfs', {
                [`data.form.jshj`]: v,
                [`data.form.jshjDx`]: undefined,
                [`data.form.hjse`]: undefined,
                [`data.form.hjje`]: undefined,
                [`data.error.jshj`]: false,
            })
            if (this.isV2Component() && !this.notAllowEditNf06()) {
                this.injections.reduce('updateSfs', {
                    'data.form.nf06': null,
                    'data.error.nf06': '',
                })
            }
            return
        }
        let taxRate = this.metaAction.gf('data.form.zbslv');
        taxRate = taxRate || 0;
        let jshj = Number(v), //金额
            jshjDx = utils.number.moneySmalltoBig(jshj, 2),
            hjje = utils.number.round(jshj / (1 + taxRate), 2), //
            hjse = utils.number.round(hjje * taxRate, 2) //


        this.injections.reduce('updateSfs', {
            [`data.form.jshj`]: v === '' ? undefined : jshj,
            [`data.form.jshjDx`]: v === undefined ? undefined : jshjDx,
            [`data.form.hjse`]: v === undefined || taxRate === undefined ? undefined : hjse,
            [`data.form.hjje`]: v === undefined || taxRate === undefined ? undefined : hjje,
            [`data.error.jshj`]: false,
        })
        if (this.isV2Component() && !this.notAllowEditNf06()) {
            this.injections.reduce('updateSfs', {
                'data.form.nf06': hjse || null,
                'data.error.nf06': '',
            })
        }
    }

    //税率改变
    taxRateChange = (v) => {
        let jshj0 = this.metaAction.gf('data.form.jshj');
        let jshj = utils.number.round(jshj0, 2); //价税合计
        let taxRate = v; //税率
        let hjje = utils.number.round(jshj / (1 + taxRate), 2), //不含税价
            hjse = utils.number.round(jshj - hjje, 2) //税额
        this.injections.reduce('updateSfs', {
            [`data.form.zbslv`]: v,
            [`data.form.hjse`]: v === undefined || jshj0 === undefined ? undefined : hjse,
            [`data.form.hjje`]: v === undefined || jshj0 === undefined ? undefined : hjje,
            [`data.error.zbslv`]: false,
        })
        if (this.isV2Component() && !this.notAllowEditNf06()) {
            this.injections.reduce('updateSfs', {
                'data.form.nf06': hjse || null,
                'data.error.nf06': '',
            })
        }
    }

    notXaoGuiMo = () => {
        //小规模不显示
        let swVatTaxpayer = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").swVatTaxpayer;
        return swVatTaxpayer !== 2000010002;
    }
    isReadOnly = () => {
        return this.component.props.readOnly || false
    }
    notAllowEdit = (path) => {
        //是否允许修改 编辑时 录入的发票都允许修改 
        //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        let kjxh = this.component.props.kjxh;
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        if (!kjxh) return false;
        if (fplyLx == 2) {
            return false
        }

        return true;
    }

    renderSelectOption = () => {
        let data = this.metaAction.gf('data.other.taxRates') && this.metaAction.gf('data.other.taxRates').toJS()
        if (data && data instanceof Array) {
            return data.map((d, index) => <Option title={d.slvMc} key={d.slv} value={d.slv} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.slvMc}</Option>)
        }
    }

    disabledDateQ = (currentDate) => {
        //通行日期起
        let skssq = this.component.props.nsqj || '';
        if (skssq && currentDate) {
            skssq = moment(skssq, 'YYYYMM').endOf('month');
          /*  if (this.component.props.fromModule === 'InvoiceAuthentication') {
                // 来自发票认证模块
                const currentOrg = this.metaAction.context.get("currentOrg") || {};
                let endDate = currentOrg.systemDateTime ? moment(currentOrg.systemDateTime) : moment();
                let startDate = moment(this.component.props.nsqj + '01', 'YYYY-MM-DD').subtract(360, 'days');
                if (skssq.valueOf() === moment(endDate.format('YYYY-MM-DD')).endOf('month').valueOf()) {
                    // 税款所属期=当月
                    skssq = moment(endDate.format('YYYY-MM-DD'))
                    startDate = endDate.subtract(1, 'months').endOf('month').subtract(360, 'days')
                }
                return currentDate.valueOf() >= skssq.valueOf() || currentDate.valueOf() < startDate.valueOf();
            }*/
            return currentDate.valueOf() > skssq.valueOf();
        }
        return false
    }

    handleCellNumberBlur = (path) => () => {
        let v = this.metaAction.gf(path);
        if (!Number(v)) {
            this.injections.reduce('update', path, undefined)
        }
    }
    notAllowEditBdzt = () => {
        // data.form.fplyLx==="1"&&data.form.bdzt=== true ? true : false
        //认证状态是否允许修改
        let kjxh = this.component.props.kjxh;
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let bdzt = this.metaAction.gf('data.form.bdzt');
        let sf11 = this.metaAction.gf('data.form.sf11');
        if (!kjxh) return false; //新增发票

        if (!bdzt || bdzt == '0' || (bdzt == '1' && sf11 == 'Y' && fplyLx == '1') || (bdzt == '1' && fplyLx !== '1')) {
            //（1）发票是采集来的，并且采集的时候是未认证。现在变成了已认证，这种情况可以改成未认证。
            //（2）发票不是采集来的。现在变成了已认证，这种情况可以改成未认证。
            //未认证可以修改为已认证
            return false;
        }

        return true;

    }
    // 认证状态修改
    handleBdztChangeC = (path, e) => {
        let nsqj = this.component.props.nsqj || ''
        let { bdlyLx, bdjg, nf06, hjse } = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
        let obj = {
            [path]: e.target.checked,
            'data.form.dkyf': e.target.checked ? nsqj : null, // 默认为当前属期
            'data.form.bdlyLx': e.target.checked ? (bdlyLx || '1') : null, // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
            'data.form.bdjg': e.target.checked ? bdjg : null, //发票的状态, 0-正常， 1-异常
            'data.form.nf06': e.target.checked ? (nf06 || nf06 === 0 ? nf06 : hjse) : null, // 有效抵扣税额
            // kpr: gfinfo.kpr     //开票人
        }
        this.injections.reduce('updateSfs', obj);
    }
    // 2.0值绑定
    formDataV2 = (form) => {
        if (!this.isV2Component() || this.component.props.kjxh) {
            return {}
        }
        if (!form.bdzt) {
            form.bdlyLx = null
            form.dkyf = null
            form.nf06 = null
            form.skssq = form.kprq && form.kprq.format && form.kprq.format('YYYYMM') || form.skssq;
        }
        if (form.bdzt && form.fplyLx == 2) {
            form.bdlyLx = form.bdlyLx || '1';
            form.dkyf = form.bdlyLx == 1 ? (form.dkyf || this.component.props.nsqj) : null;
            form.nf06 = form.nf06 || form.nf06 === 0 ? form.nf06 : form.hjse;
            form.skssq = this.component.props.nsqj;
        }
        return form
    }
    renderBdlyLX = () => {
        let sbytcsList = this.metaAction.gf('data.sbytcsList');
        if (sbytcsList) sbytcsList = sbytcsList.toJS();
        return (Array.isArray(sbytcsList) && sbytcsList || []).map(item => (
            <Option title={item.sbytMc} key={item.sbytDm} value={item.sbytDm}>{item.sbytMc}</Option>
        ))
    }
    // 有效税额
    handleFormNumberBlur = (path = 'nf06') => (e) => {
        let v = this.metaAction.gf(`data.form.${path}`);
        let hjse = Number(this.metaAction.gf('data.form.hjse'));
        if (!hjse) {
            hjse = 0;
        }
        if (v == '' || isNaN(Number(v))) {
            this.injections.reduce('update', 'data.error.nf06', '有效税额不能为空')
            return '有效税额不能为空'
        }
        v = Number(v);
        if (hjse == 0 && v != 0) {
            this.injections.reduce('update', 'data.error.nf06', '有效税额应该=0')
            return '有效税额应该=0'
        }
        if (hjse >= 0) {
            if (v < 0 || v > hjse) {
                this.injections.reduce('update', 'data.error.nf06', '有效税额应该≥0 且 ≤' + hjse)
                return '有效税额应该≥0 且 ≤' + hjse
            }
        } else {
            if (v > 0 || v < hjse) {
                this.injections.reduce('update', 'data.error.nf06', `有效税额应该≥${hjse} 且 ≤ 0`)
                return `有效税额应该≥${hjse} 且 ≤ 0`
            }
        }
        return ''
    }
    handleBdlylxChangeV = (v) => {
        let oldNf06 = this.metaAction.gf('data.form.oldNf06');
        let nf06 = this.metaAction.gf('data.form.nf06')
        let hjse = this.metaAction.gf('data.form.hjse');
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        if(fplyLx === '2'){
            if(oldNf06 === undefined){
                oldNf06 = nf06
                hjse = nf06
            }
        }
        this.injections.reduce('updateSfs', {
            'data.form.bdlyLx': v,
            'data.form.dkyf': v != 1 ? null : this.component.props.nsqj,
            'data.error.dkyf': '',
            'data.error.bdlyLx': '',
            'data.form.nf06': v === '1' ? oldNf06 : hjse,
            'data.error.nf06': '',
        })
    }
    // 陕西试点2.0版本
    isV2Component = () => {
        const { invoiceVersion, swVatTaxpayer } = this.metaAction.context.get("currentOrg") || {}
        if (swVatTaxpayer != 2000010002) { //&& invoiceVersion == 2
            return true
        }
        return false
    }
    // 申报用途是否可以编辑
    notAllowEditBdlyLx = () => {
        // let kjxh = this.component.props.kjxh;
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let bdzt = this.metaAction.gf('data.form.bdzt');
        let sf18 = this.metaAction.gf('data.form.sf18');
        if (!bdzt) {
            return true
        } else if (fplyLx == 1 && sf18 == 1) {
            // 读取的发票，原始申报用途为抵扣
            return false
        } else if (fplyLx == 2) {
            return false
        } else {
            return true
        }
    }
    // 抵扣月份不可编辑
    notAllowEditDkyf = () => {
        const { bdlyLx, bdzt } = this.metaAction.gf('data.form').toJS()
        if (bdzt == 1 && bdlyLx == 1) {
            return false
        }
        return true

    }
    notAllowEditNf06 = () => {
        const { fplyLx, bdzt, bdlyLx } = this.metaAction.gf('data.form').toJS()
        if (bdzt && fplyLx == 2) { //&& bdlyLx == 1
            return false
        }
        return true
    }
    //数量格式化
    numberFormat = (number, decimals, isFocus, clearZero) => {
        if (isFocus === true) return number
        let val = utils.number.format(number, decimals);
        //去除小数点后面的0
        // return clearZero && typeof val === 'string' ? val.replace(/(\.)(0+)$|(?<=\.[1-9]*)(0+)$/g, "") : val
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined && quantity !== null) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    getCellClassName = (path, align, gridName) => {

        let clsName = this.metaAction.isFocus(path) ? `inv-app-pu-mvs-invoice-card editable-cell` : ''
        if (typeof(align) == "string") {
            clsName += ` ${defaultClsName}-${align}`
        }
        return clsName
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}