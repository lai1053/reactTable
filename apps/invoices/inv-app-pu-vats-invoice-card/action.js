import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import utils from 'edf-utils'
import { fromJS } from 'immutable';
import moment from 'moment';
import InvRedDetail from '../component/invRedDetail'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = ({ component, injections }) => {

        this.extendAction.gridAction.onInit({ component, injections })
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
    load = async (kjxh,redDate) => {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            { swVatTaxpayer, vatTaxpayerNum: nsrsbh, id: qyId } = currentOrg,
            nsrxz = swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS',
            defaultLength = this.metaAction.gf('data.other.defaultLength'),
            skssq = this.component.props.nsqj || '',
            initData = {
                dkyf: skssq,
                bdzt: true,
            },
            error = { mxDetailList: new Array(defaultLength).fill({}) }

        if (kjxh) {
            let res ,oldSkssq
            if(this.component.props.justShow === true){
                let dataRes = await this.webapi.invoice.queryJxfpDto(this.component.props.invArguments); // 其他模块查看
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
                if(res) oldSkssq = res.skssq
            }
            if (!this.mounted) return
            if (res) {
                res.kprq = res.kprq ? moment(res.kprq) : null; //开票日期
                res.bdzt = res.bdzt === '1' ? true : false; //认证状态
                // res.dkyf = !res.dkyf && res.bdzt ? '' : res.dkyf // 抵扣月份返回为空时
                //res.bdlyLx     // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
                //res.bdjg      //发票的状态, 0-正常， 1-异常
                // res.nf06 = res.nf06 && res.nf06 || '' // 有效抵扣税额
                res.oldNf06 = res.nf06
                res.kpr = !res.kpr ? '' : res.kpr //开票人
                res.mxDetailList.forEach(o => {
                    if (!Number(o.sl)) o.sl = undefined
                    if (!Number(o.dj)) o.dj = undefined
                })
                if(redDate){
                    res.mxDetailList = redDate.mxDetailList
                    res.hjje = redDate.hjje
                    res.hjse = redDate.hjse
                    res.jshjDx = redDate.jshjDx
                    res.gfHcfpdm = redDate.gfHcfpdm
                    res.gfHcfphm = redDate.gfHcfphm
                }
                while (res.mxDetailList.length < defaultLength) {
                    res.mxDetailList.push({})
                }
                error.mxDetailList = new Array(res.mxDetailList.length).fill({})
                initData = res;
            }
        } else {
            let gfinfo = await this.webapi.invoice.initiateAddOfJxfp({ nsrsbh, qyId ,fpzlDm:'01',skssq});
            if (!this.mounted) return
            if (gfinfo) {
                initData = {
                    ...initData,
                    gfmc: gfinfo.gfmc,
                    gfsbh: gfinfo.gfsbh,
                    gfdzdh: gfinfo.gfdzdh,
                    gfyhzh: gfinfo.gfyhzh,
                    fplyLx: '2',
                    bdlyLx: '1', // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
                    // bdjg: gfinfo.bdjg,    //发票的状态, 0-正常， 1-异常
                    // nf06:gfinfo.nf06,    // 有效抵扣税额
                    // kpr: gfinfo.kpr     //开票人
                }
            }

        }

      /*  let taxRates = await this.webapi.invoice.getSlvcsList({
            nsrxz,
            fplx: 'jxfp',
            fpzlDm: '01'
        })*/
        let taxRates = []
        if(this.component.props.justShow != true)taxRates = await this.webapi.invoice.getSlvcsList({nsrxz, fplx: 'jxfp', fpzlDm: '01'})
        if (!this.mounted) return
        let isTutorialPeriod;
        if (this.notXaoGuiMo()) {
            let getNsrZgrdXx = {}
            if(this.component.props.justShow != true) getNsrZgrdXx= await this.webapi.invoice.getNsrZgrdXx({skssq});
            if (!this.mounted) return //组件已经卸载
            isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod;
        }
        let spbmRes = []
        if(this.component.props.justShow != true)spbmRes = await this.webapi.invoice.getSpbmList();
        let sbytcsRes = [];
        if (this.isV2Component() && this.component.props.justShow != true) {
            sbytcsRes = await this.webapi.invoice.getSbytcsList(`nsrxz=YBNSRZZS&fplx=jxfp&fpzlDm=01`)
        }
        if (!this.mounted) return //组件已经卸载
        let form = this.metaAction.gf('data.form').toJS();
        form = {
            ...form,
            ...initData,
            ...this.formDataV2(initData),
        }
        if (this.component.props.fromModule === 'InvoiceAuthentication') {
            // 来自发票认证模块
            form.bdzt = 0
            form.dkyf = null
            form.bdlyLx = null
        }
        if(form.fplyLx === '3'){
            form.oldfplyLx = '3'
            form.fplyLx = '2'
        }
        let cacheFplyLx = form.fplyLx;
        if (form.fplyLx != 2 && form.fplyLx != 1) {
            // 将  4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx;
            form.fplyLx = '1'
        }
        form.mxDetailList.forEach((t)=>{
            if(t.je === null)  return  t.je = undefined
            if(t.se === null) return t.se = undefined
        })
        this.injections.reduce('updateSfs', {
            'data.other.taxRates': fromJS(taxRates),
            'data.cacheFplyLx': cacheFplyLx,
            'data.form': fromJS(form),
            'data.error': fromJS(error),
            'data.other.isTutorialPeriod': isTutorialPeriod,
            'data.spbmList': fromJS((spbmRes || []).map(item => ({ ...item, key: item.spbm, title: item.spmc }))),
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
    onOk = async () => {
        if(this.component.props.justShow === true){
            // 什么都不执行 直接关闭
        }else {
            let params = this.checkForm();
            if (!params) return false;
            let tipFlag = false
            let mxDetailList = params.mxDetailList
            mxDetailList.forEach((item) => {
                let sl = Number(item.sl)
                let je = Number(item.je)
                if ((sl > 0 && je < 0) || (sl < 0 && je > 0)) {
                    tipFlag = true
                }
            })
            if (tipFlag == true) {
                this.metaAction.toast('error', '数量和金额应同为正数或负数')
                return false;
            }
            const currentOrg = this.metaAction.context.get('currentOrg') || {};
            let skssq = this.component.props.nsqj || ''; //税款所属期
            let oldSkssq = this.metaAction.gf("data.form.skssq")
            if(oldSkssq){
                skssq = oldSkssq
            }
        
            let hj = Number(this.sumColumn('je').replace(/,/g, '')) + Number(this.sumColumn('se').replace(/,/g, '')); //合计
            let jshj = this.numberFormat(hj, 2, true); //价税合计小写
            let jshjDX = utils.number.moneySmalltoBig(hj); //价税合计大写
    
            let kprq = params.kprq;
            params.kprq = kprq.format('YYYY-MM-DD HH:mm:ss'); //开票日期
    
            params.bdzt = params.bdzt ? 1 : 0; //认证状态 1 已认证 0未认证
            params.fpzlDm = '01'; //发票种类代码
            params.skssq = params.bdzt ? skssq : kprq.format('YYYYMM') //税款所属期 已认证，税款所属期为：报税月份-1；未认证或者普票，税款所属期为：开票月份
            params.hjje = this.sumColumn('je').replace(/,/g, ''); //合计金额
            params.hjse = this.sumColumn('se').replace(/,/g, ''); //合计税额
            params.jshj = jshj; //价税合计小写
            params.jshjDx = jshjDX; //价税合计大写
            params.mxDetailList.forEach(o => {
                if (o.ggxh === undefined) o.ggxh = ''
                if (o.dw === undefined) o.dw = ''
                if (o.sl === undefined) o.sl = 0
                if (o.dj === undefined) o.dj = 0
            })
            this.injections.reduce('update', 'data.loading', true);
            let apiname = this.component.props.kjxh ? 'updateJxfp' : 'addJxfp'
            if (!this.component.props.kjxh && currentOrg.swVatTaxpayer == 2000010002) {
                // 小规模，新增发票,bdzt=0 默认是未认证 dkyf=空 skssq=选择开票月份
                params.bdzt = 0;
                params.dkyf = null;
                params.skssq = kprq.format('YYYYMM');
            }
            const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
            if (cacheFplyLx > -1 && cacheFplyLx != params.fplyLx) {
                params.fplyLx = cacheFplyLx
            }
            if(params.oldfplyLx){
                params.fplyLx = params.oldfplyLx
            }
            let res = await this.webapi.invoice[apiname](params);
            if (!this.mounted) return
            this.injections.reduce('update', 'data.loading', false);
            if (this.component.props.kjxh && res === null) {
                this.listNeedLoad = true;
                this.metaAction.toast('success', '发票修改成功');
            } else if (res) {
                this.listNeedLoad = true;
                this.metaAction.toast('success', '新增发票成功');
                let initFormData = {
                    fpdm: params.fpdm, //发票代码
                    fphm: res.fphm, //发票号码+1
                    bdzt: this.component.props.fromModule === 'InvoiceAuthentication' ? false : true, //认证状态 发票采集默认选中 其它模块默认不选中
                    dkyf: skssq, // 默认为当前属期
                    gfmc: params.gfmc, //购方名称
                    gfsbh: params.gfsbh, //购方识别号
                    gfdzdh: params.gfdzdh, //购方地址电话
                    gfyhzh: params.gfyhzh, //购方银行账号
                    mxDetailList: [{}, {}, {}], //明细
                    gfHcfpdm:params.gfHcfpdm,
                    gfHcfphm:params.gfHcfphm,
                    fplyLx: '2',
                    //哈哈
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
        return document.body
        //return document.querySelector(".ant-modal")
        // return document.getElementById('inv-app-pu-vats-invoice-card')
    }

    handleHwClick = (rowIndex, rowData) => async () => {
        if (this.notAllowEdit()) return
        const spbmList = this.metaAction.gf('data.spbmList')
        const res = await this.metaAction.modal('show', {
            title: '商品选择',
            className: 'inv-app-select-product-modal',
            width: 1000,
            top: 20,
            okText: '确定',
            centered: true,
            footer: null,
            bodyStyle: { padding: '0px', borderTop: '1px solid #e9e9e9' },
            children: this.metaAction.loadApp('inv-app-select-product', {
                store: this.component.props.store,
                spbmList,
            }),
        })


        if (res instanceof Object) {

            let { spmc: hwmc, spbm, slv } = res;

            let obj = {
                [`data.form.mxDetailList.${rowIndex}.hwmc`]: hwmc, //商品名称
                [`data.form.mxDetailList.${rowIndex}.spbm`]: spbm, //商品编码
                [`data.error.mxDetailList.${rowIndex}.hwmc`]: false,
            }
            if (slv || slv == 0) {
                let taxRates = this.metaAction.gf('data.other.taxRates').toJS();
                if (!taxRates.find(o => o.slv == slv)) {
                    //不存在选择的slv清空
                    slv = undefined
                }
                obj[`data.form.mxDetailList.${rowIndex}.slv`] = slv;
                obj[`data.error.mxDetailList.${rowIndex}.slv`] = false;
            }
            this.injections.reduce('updateSfs', obj)
            this.taxRateChange(rowIndex, rowData, slv);
            // if (slv && slv != -1 && slv.indexOf('%') > -1) {
            //     let index = slv.indexOf('%');
            //     slv = slv.slice(0, index);
            //     obj[`data.form.mxDetailList.${rowIndex}.slv`] = Number(slv) / 100;
            //     obj[`data.error.mxDetailList.${rowIndex}.slv`] = false;
            // }


        }
    }

    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS();
        let error = this.metaAction.gf('data.error').toJS();
        let defaultLength = this.metaAction.gf('data.other.defaultLength')
        error.mxDetailList = []
        let flag = true;
        if (!form.fpdm) {
            error.fpdm = '发票号码不能为空'
            flag = false
        } else if (form.fpdm.length !== 10) {
            error.fpdm = '发票代码长度应为10个字符'
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

        if (!form.xfsbh) {
            error.xfsbh = '销售方纳税人识别号不能为空'
            flag = false
        } else if (form.xfsbh.length < 15 || form.xfsbh.length > 30) {
            error.xfsbh = '纳税人识别号长度最少15个字符，最多30个字符'
            flag = false
        }

        if (!form.xfmc) {
            error.xfmc = '销售方名称不能为空'
            flag = false
        }


        if (form.sf12 && form.sf12.length < 21) {
            error.sf12 = '密码最少21个字符'
            flag = false
        } else if (form.sf12 && form.sf12.length > 36) {
            error.sf12 = '密码最多36个字符'
            flag = false
        }
        if (form.sf13 && form.sf13.length < 21) {
            error.sf13 = '密码最少21个字符'
            flag = false
        } else if (form.sf13 && form.sf13.length > 36) {
            error.sf13 = '密码最多36个字符'
            flag = false
        }
        if (form.sf14 && form.sf14.length < 21) {
            error.sf14 = '密码最少21个字符'
            flag = false
        } else if (form.sf14 && form.sf14.length > 36) {
            error.sf14 = '密码最多36个字符'
            flag = false
        }
        if (form.sf15 && form.sf15.length < 21) {
            error.sf15 = '密码最少21个字符'
            flag = false
        } else if (form.sf15 && form.sf15.length > 36) {
            error.sf15 = '密码最多36个字符'
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
        form.mxDetailList = form.mxDetailList.filter(obj => JSON.stringify(obj) !== "{}");
        let mxDetailList = [...form.mxDetailList];
        if (!mxDetailList.length) {
            error.mxDetailList[0] = {
                hwmc: true,
                je: true,
                slv: true,
                se: true,
            };
            flag = false;
        } else {
            mxDetailList.forEach((item, index) => {
                error.mxDetailList[index] = {};
                if (!item.hwmc) {
                    error.mxDetailList[index].hwmc = true;
                    flag = false
                }
                if (item.je === undefined) {
                    error.mxDetailList[index].je = true;
                    flag = false
                }
                if (item.slv === undefined) {
                    error.mxDetailList[index].slv = true;
                    flag = false
                }
                if (item.se === undefined) {
                    error.mxDetailList[index].se = true;
                    flag = false
                }
                if (item.jzjtDm === undefined) {
                    // error.mxDetailList[index].jzjtDm = true;
                    // flag = false
                    item.jzjtDm = 'N'
                }
            })
        }

        while (mxDetailList.length < defaultLength) {
            mxDetailList.push({})
        }
        let obj = {
            'data.form.mxDetailList': fromJS(mxDetailList),
            'data.other.randomKey': Math.random(),
        }

        if (!flag) {
            obj['data.error'] = fromJS(error);
        }
        this.injections.reduce('updateSfs', obj);
        if (!flag) {
            this.metaAction.toast('error', '红框内必须有值！')
        }
        return flag ? form : false
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
    handleFieldChangeV = (path, v, must,jzjt) => {
   
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
        if(jzjt){
            let obj ={
                [`data.form.mxDetailList.${path}.jzjtDm`]:v ,
                [`data.error.mxDetailList.${path}.jzjtDm`]:''
            }
            this.injections.reduce('updateSfs', obj)
        }
        
    }

    //cell中
    handleCellFieldChangeE = (col, rowIndex, e, must) => {
        if (must) {
            let obj = {
                [`data.form.mxDetailList.${rowIndex}.${col}`]: e.target.value,
                [`data.error.mxDetailList.${rowIndex}.${col}`]: false
            }
            this.injections.reduce('updateSfs', obj)
        } else {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${col}`, e.target.value)
        }
    }

    //cell中
    handleCellFieldChangeV = (col, rowIndex, v, must) => {
        if (must) {
            let obj = {
                [`data.form.mxDetailList.${rowIndex}.${col}`]: v,
                [`data.error.mxDetailList.${rowIndex}.${col}`]: false
            }
            this.injections.reduce('updateSfs', obj)
        } else {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${col}`, v)
        }

    }

    handleChangeHwmc = (rowIndex, v) => {
        let obj;
        if (v instanceof Object) {
            let { spmc: hwmc, spbm, zzssl: slv } = v;

            obj = {
                [`data.form.mxDetailList.${rowIndex}.hwmc`]: hwmc, //商品名称
                [`data.form.mxDetailList.${rowIndex}.spbm`]: spbm, //商品编码
                [`data.error.mxDetailList.${rowIndex}.hwmc`]: false,
            }
            if (slv && slv != -1 && slv.indexOf('%') > -1) {
                let index = slv.indexOf('%');
                slv = slv.slice(0, index);
                obj[`data.form.mxDetailList.${rowIndex}.slv`] = Number(slv) / 100;
                obj[`data.error.mxDetailList.${rowIndex}.slv`] = false;
            }
        } else {
            obj = {
                [`data.form.mxDetailList.${rowIndex}.hwmc`]: v,
                [`data.error.mxDetailList.${rowIndex}.hwmc`]: false,
            }
        }
        this.injections.reduce('updateSfs', obj)
    }

    //金额改变
    amountChange = (rowIndex, rowData, v) => {

        if (!Number(v)) {
            let obj = {
                [`data.form.mxDetailList.${rowIndex}.je`]: v,
                [`data.form.mxDetailList.${rowIndex}.se`]: undefined,
                [`data.form.mxDetailList.${rowIndex}.dj`]: undefined,
                [`data.error.mxDetailList.${rowIndex}.je`]: false,
                [`data.error.mxDetailList.${rowIndex}.se`]: false
            }
            this.injections.reduce('updateSfs', obj);
            if (this.isV2Component() && !this.notAllowEditNf06()) {
                this.injections.reduce('updateSfs', {
                    'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                    'data.error.nf06': '',
                })
            }
            return
        }

        // 税额＝金额×税率
        // 如果数量为0 ，单价为0
        // 如果数量不为0，单价＝金额÷数量
        let taxRate = rowData.slv || 0

        let amount = Number(v), //金额
            quantity = utils.number.round(rowData.sl, 6), //数量
            tax = utils.number.round(amount * taxRate, 2) //税额=金额*税率
        const price = quantity ? utils.number.round(amount / quantity, 4) : 0;

        let obj = {
            [`data.form.mxDetailList.${rowIndex}.je`]: v === '' ? undefined : amount,
            [`data.form.mxDetailList.${rowIndex}.se`]: v === '' || rowData.slv === undefined ? undefined : tax,
            [`data.form.mxDetailList.${rowIndex}.dj`]: v === '' || rowData.sl === undefined ? undefined : price,
            [`data.error.mxDetailList.${rowIndex}.je`]: false,
            [`data.error.mxDetailList.${rowIndex}.se`]: false
        }

        this.injections.reduce('updateSfs', obj)
        if (this.isV2Component() && !this.notAllowEditNf06()) {
            this.injections.reduce('updateSfs', {
                'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                'data.error.nf06': '',
            })
        }

    }
    //税率改变
    taxRateChange = (rowIndex, rowData, v) => {

        let taxRate = v || 0; //税率
        let amount = utils.number.round(rowData.je, 2); //金额
        let tax = utils.number.round(amount * taxRate, 2); //税额=金额*税率
        let obj = {
            [`data.form.mxDetailList.${rowIndex}.slv`]: v,
            [`data.form.mxDetailList.${rowIndex}.se`]: v === undefined ? undefined : tax,
            [`data.error.mxDetailList.${rowIndex}.slv`]: false,
            [`data.error.mxDetailList.${rowIndex}.se`]: false
        }

        this.injections.reduce('updateSfs', obj)
        if (this.isV2Component() && !this.notAllowEditNf06()) {
            this.injections.reduce('updateSfs', {
                'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                'data.error.nf06': '',
            })
        }
    }

    //数量改变 
    quantityChange = (rowIndex, rowData, v) => {
        // console.log(rowIndex, rowData, v);
        // console.log(!Number(v));
        if (!Number(v)) {
            this.injections.reduce('updateSfs', {
                [`data.form.mxDetailList.${rowIndex}.sl`]: v,
                [`data.form.mxDetailList.${rowIndex}.dj`]: undefined
            })
            return
        }

        let quantity = Number(v)
        let amount = utils.number.round(rowData.je, 2)
        let price = quantity ? utils.number.round(amount / quantity, 4) : 0
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.sl`]: v === '' ? undefined : quantity,
            [`data.form.mxDetailList.${rowIndex}.dj`]: v === '' || rowData.je === undefined ? undefined : price
        })

    }

    //税额改变
    taxChange = (rowIndex, rowData, v) => {
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.se`]: Number(v) ? Number(v) : v,
            [`data.error.mxDetailList.${rowIndex}.se`]: false
        })
        if (this.isV2Component() && !this.notAllowEditNf06()) {
            this.injections.reduce('updateSfs', {
                'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                'data.error.nf06': '',
            })
        }
    }


    //合计行
    sumColumn = (col, isPercent) => {
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        let currentSumCol = col,
            mxDetailList = this.metaAction.gf('data.form.mxDetailList')
        if (currentSumCol == 'sl') {
            let val = this.numberFormat(this.sum(mxDetailList, (a, b) => a + b.get(`${currentSumCol}`)), 6)
            if (typeof val === 'string') {
                let [a, b] = val.split('.');
                return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
            }
            return val;
        } else if (isPercent == 'isPercent') {
            return `${this.numberFormat(this.sum(mxDetailList, (a, b) => a + b.get(`${currentSumCol}`)), 2)}%`
        } else if (currentSumCol === 'je' && fplyLx === '1') {
            return `${isNaN(data.hjje)?'':data.hjje}`
        } else if (currentSumCol === 'se' && fplyLx === '1') {
            return `${isNaN(data.hjse)?'':data.hjse}`
        } else {
            const _hj = this.sum(mxDetailList, (a, b) => a + b.get(`${currentSumCol}`))
            return this.numberFormat(_hj, 2)
        }
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

    //求和
    sum = (mxDetailList, fn) => {
        if (!mxDetailList || mxDetailList.length == 0)
            return this.numberFormat(0, 2)

        return mxDetailList.reduce((a, b) => {
            let r = fn(a, b)
            return isNaN(r) ? a : r
        }, 0)
    }

    jshj = () => {
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        if (fplyLx === '1') {
            return `${data.jshj}`
        }
        //价税合计
        let hj = Number(this.sumColumn('je').replace(/,/g, '')) + Number(this.sumColumn('se').replace(/,/g, ''))
        return this.numberFormat(hj, 2); //价税合计  
    }
    jshjDx = () => {
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        if (fplyLx === '1') {
            return `${data.jshjDx}`
        }
        //价税合计大写
        let hj = Number(this.sumColumn('je').replace(/,/g, '')) + Number(this.sumColumn('se').replace(/,/g, ''))
        return utils.number.moneySmalltoBig(hj, 2);
    }


    quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
        if (quantity !== undefined) {
            if (autoDecimals && quantity) {
                let [a, b] = String(quantity).split('.');
                decimals = Math.max(decimals, b !== undefined && b.length || 0)
            }
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    notXaoGuiMo = () => {
        //小规模不显示
        let swVatTaxpayer = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").swVatTaxpayer;
        return swVatTaxpayer !== 2000010002;
    }
    isReadOnly = () => {
        let data = this.metaAction.gf('data.form').toJS()
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
    notAllowEditBdzt = () => {
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

    renderSelectOption = (key) => {

        let data = this.metaAction.gf('data.other.taxRates') && this.metaAction.gf('data.other.taxRates').toJS()
        let jzjtDmList = this.metaAction.gf('data.jzjtDmList').toJS()
        if(key === 'jzjtDm'){
            // 即征即退Option
            if(jzjtDmList && jzjtDmList instanceof Array){
                return jzjtDmList.map((item,index)=> <Option title={item.value} key={item.jzjtDm} value={item.jzjtDm} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{item.value}</Option> )
            }
        }else {
            if (data && data instanceof Array) {
                return data.map((d, index) => <Option title={d.slvMc} key={d.slv} value={d.slv} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.slvMc}</Option>)
            }
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

    handleCellNumberBlur = (path, rowIndex) => (e) => {
        let v = this.metaAction.gf(`data.form.mxDetailList.${rowIndex}.${path}`);
        if (!Number(v)) {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${path}`, undefined)
        }
    }
    // 认证状态修改
    handleBdztChangeC = (path, e) => {
        let nsqj = this.component.props.nsqj || ''
        let { bdlyLx, bdjg, nf06 } = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
        let obj = {
            [path]: e.target.checked,
            'data.form.dkyf': e.target.checked ? nsqj : null, // 默认为当前属期
            'data.form.bdlyLx': e.target.checked ? (bdlyLx || '1') : null, // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
            'data.form.bdjg': e.target.checked ? bdjg : null, //发票的状态, 0-正常， 1-异常
            'data.form.nf06': e.target.checked ? (nf06 || nf06 === 0 ? nf06 : this.sumColumn('se').replace(/,/g, '')) : null, // 有效抵扣税额
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
        let hjse = Number(this.sumColumn("se").replace(/,/g, ''));
        if (!hjse) {
            hjse = 0;
        }
        // console.log('v="" 或者 isNaN:', v, hjse, v == '' || isNaN(Number(v)))
        if (v == '' || isNaN(Number(v))) {
            this.injections.reduce('update', 'data.error.nf06', '有效税额不能为空')
            return '有效税额不能为空'
        }
        v = Number(v);
        // console.log('hjse=0,v=0:', v, hjse, hjse == 0 && v != 0)
        if (hjse == 0 && v != 0) {
            this.injections.reduce('update', 'data.error.nf06', '有效税额应该=0')
            return '有效税额应该=0'
        }
        if (hjse >= 0) {
            // console.log('v < 0 || v > hjse:', v, hjse, v < 0 || v > hjse)
            if (v < 0 || v > hjse) {
                this.injections.reduce('update', 'data.error.nf06', '有效税额应该≥0 且 ≤' + hjse)
                return '有效税额应该≥0 且 ≤' + hjse
            }
        } else {
            // console.log('v > 0 || v < hjse:', v, hjse, v > 0 || v < hjse)
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
        //'data.form.nf06': nf06 || nf06 === 0 ? nf06 : this.sumColumn('se').replace(/,/g, ''),
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
    //明细清单
    redDetail = async()=>{
        const {gfHcfpdm,gfHcfphm } = this.metaAction.gf('data.form').toJS()
        let data ={
            gfHcfpdm,
            gfHcfphm,
            fpzlDm:'01',
            justShow:this.component.props.justShow
        }
        let redDate = await this.metaAction.modal('show',{
            title: "明细清单",
            className: 'inv-app-invReadDetail-card-modal',
            width:420,
            hidden:550,
            style: { top: 50 },
            okText: "确定",
            children: (
               <InvRedDetail
                   metaAction={this.metaAction}
                   webapi={this.webapi}
                   data={data}
               />
            )
        })
        // console.log(redDate);
        if(typeof redDate === "object"){
            let defaultLength = this.metaAction.gf('data.other.defaultLength')
            while (redDate.mxDetailList.length < defaultLength) {
                redDate.mxDetailList.push({})
            }
                this.injections.reduce('updateSfs', {
                    'data.form.mxDetailList': redDate.mxDetailList,
                    'data.form.hjje':redDate.hjje,
                    'data.form.hjse':redDate.hjse,
                    'data.form.jshj':redDate.jshj,
                    'data.form.jshjDx':redDate.jshjDx,
                    'data.form.gfHcfpdm':redDate.gfHcfpdm,
                    'data.form.gfHcfphm':redDate.gfHcfphm,
            })
            // console.log(redDate);
            // this.load(this.component.props.kjxh,redDate)
        }
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