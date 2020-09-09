import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import utils from 'edf-utils'
import { fromJS } from 'immutable';
import moment from 'moment';


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
    load = async (kjxh) => {
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
                res.mxDetailList.forEach(o => {
                    //日期格式转化
                    if (o.txrqq) o.txrqq = moment(o.txrqq, 'YYYYMMDD');
                    if (o.txrqz) o.txrqz = moment(o.txrqz, 'YYYYMMDD');
                    if (o.mxsf01) o.mxsf01 = moment(o.mxsf01, 'YYYYMMDD');
                })
                while (res.mxDetailList.length < defaultLength) {
                    res.mxDetailList.push({})
                }
                error.mxDetailList = new Array(res.mxDetailList.length).fill({})
                initData = res;
            }
        } else {
            let gfinfo = await this.webapi.invoice.initiateAddOfJxfp({
                nsrsbh, // -- 纳税人识别号
                qyId,
                fpzlDm:'12',
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
        if(this.component.props.justShow != true)taxRates = await this.webapi.invoice.getSlvcsList({nsrxz, fplx: 'jxfp', fpzlDm: '12'})
        if (!this.mounted) return //组件已经卸载

        let isTutorialPeriod;
        if (this.notXaoGuiMo()) {
            let getNsrZgrdXx = {}
            if(this.component.props.justShow != true) getNsrZgrdXx= await this.webapi.invoice.getNsrZgrdXx({skssq});
            if (!this.mounted) return //组件已经卸载
            isTutorialPeriod = getNsrZgrdXx && getNsrZgrdXx.isTutorialPeriod;
        }
        let sbytcsRes = [];
        if (this.isV2Component() && this.component.props.justShow != true) {
            sbytcsRes = await this.webapi.invoice.getSbytcsList(`nsrxz=YBNSRZZS&fplx=jxfp&fpzlDm=12`)
        }
        if (!this.mounted) return //组件已经卸载
        //接口还在加载，就关闭弹框，data变为undefined，toJS()就会报错,但是下面这种写法会使data丢失其它参数，报更多的错
        let form = this.metaAction.gf('data.form').toJS();
        form = {
            ...form,
            ...initData,
            ...this.formDataV2(initData),
        }
        let cacheFplyLx = form.fplyLx;
        if (form.fplyLx != 2 && form.fplyLx != 1) {
            // 将 3导入 4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx;
            form.fplyLx = '1'
        }
        this.injections.reduce('updateSfs', {
            'data.other.taxRates': fromJS(taxRates),
            'data.cacheFplyLx': cacheFplyLx,
            'data.form': fromJS(form),
            'data.error': fromJS(error),
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
    onOk = async () => {
        if(this.component.props.justShow === true){
            // 什么都不执行 直接关闭
        }else {
            let params = this.checkForm();
            if (!params) return false;
            const currentOrg = this.metaAction.context.get('currentOrg') || {};
    
            let skssq = this.component.props.nsqj || ''; //税款所属期
            let hj = Number(this.sumColumn('se').replace(/,/g, '')); //合计
            let hjse = this.numberFormat(hj, 2, true); //价税合计小写
            let jshjDx = utils.number.moneySmalltoBig(hj); //价税合计大写
    
            let kprq = params.kprq;
            params.kprq = kprq.format('YYYY-MM-DD HH:mm:ss'); //开票日期
    
            params.bdzt = params.bdzt ? 1 : 0; //认证状态 1 已认证 0未认证
            params.fpzlDm = '12'; //发票种类代码
            params.skssq = params.bdzt ? skssq : kprq.format('YYYYMM') //税款所属期 已认证，税款所属期为：报税月份-1；未认证或者普票，税款所属期为：开票月份
    
            params.jshj = hjse; //价税合计
            params.jshjDx = jshjDx; //实缴金额合计大写
            params.hjse = hjse;
            params.mxDetailList.forEach(o => {
                //日期格式转化
                if (o.txrqq) o.txrqq = o.txrqq.format('YYYYMMDD');
                if (o.txrqz) o.txrqz = o.txrqz.format('YYYYMMDD');
                if (o.mxsf01) o.mxsf01 = o.mxsf01.format('YYYYMMDD');
                if (o.cph === undefined) o.cph = ''
                if (o.mxlx === undefined) o.mxlx = ''
                if (o.mxsf02 === undefined) o.mxsf02 = ''
                if (o.txrqq === undefined) o.txrqq = ''
                if (o.txrqz === undefined) o.txrqz = ''
                if (o.mxsf01 === undefined) o.mxsf01 = ''
            })
            this.injections.reduce('update', 'data.loading', true);
            let apiname = this.component.props.kjxh ? 'updateJxfp' : 'addJxfp'
            if (!this.component.props.kjxh && currentOrg.swVatTaxpayer == 2000010002) {
                // 小规模，新增发票,bdzt=0 默认是未认证 dkyf=空 skssq=选择开票月份
                params.bdzt = 0;
                params.dkyf = null;
                params.skssq = kprq.format('YYYYMM');
            }
            if (params.bdzt) { //&& params.bdlyLx == 1
                params.nf06 = hjse;
            } else {
                params.nf06 = null;
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
                this.listNeedLoad = true;
                this.metaAction.toast('success', '新增发票成功');
        
                let initFormData = {
                    fpdm: params.fpdm, //发票代码
                    fphm: res.fphm, //发票号码+1
                    bdzt: true, //认证状态 默认选中
                    dkyf: skssq, //默认为当前属期
                    gfmc: params.gfmc, //购方名称
                    gfsbh: params.gfsbh, //购方识别号
                    mxDetailList: [{}, {}, {}], //明细
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
        //  return document.querySelector(".inv-app-pu-withhold-invoice-card")
    }

    checkForm = () => {

        let form = this.metaAction.gf('data.form').toJS();
        let error = this.metaAction.gf('data.error').toJS();
        let defaultLength = this.metaAction.gf('data.other.defaultLength');
        let message = [];
        error.mxDetailList = []
        let flag = true;
        if (!form.fphm) {
            error.fphm = '缴款书号码不能为空'
            flag = false
        } else if (form.fphm.length !== 18) {
            error.fphm = '缴款书号码长度应为18个字符'
            flag = false
        }

        if (!form.kprq) {
            error.kprq = '开票日期不能为空'
            flag = false
        }
        if (this.isV2Component() && form.fplyLx == 2 && form.bdzt == 1) {
            if (form.bdlyLx == null) {
                error.bdlyLx = '申报用途不能为空'
                flag = false;
            }
            if (form.bdlyLx == 1 && form.dkyf == null) {
                error.dkyf = '抵扣月份不能为空'
                flag = false;
            }
        }
        form.mxDetailList = form.mxDetailList.filter(obj => JSON.stringify(obj) !== "{}");
        let mxDetailList = [...form.mxDetailList]
        if (!mxDetailList.length) {
            error.mxDetailList[0] = {
                se: true,
            }
            flag = false;
        } else {
            mxDetailList.forEach((item, index) => {
                error.mxDetailList[index] = {};
                if (!Number(item.se)) {
                    error.mxDetailList[index].se = true;
                    flag = false
                }
                if (item.jzjtDm === undefined) {
                    item.jzjtDm = 'N'
                }

                if (item.txrqq && item.txrqz && (item.txrqz.valueOf() < item.txrqq.valueOf())) {
                    error.mxDetailList[index].txrqz = true;
                    message.push(`明细第${index + 1}行，‘税款所属时期’的终止时间应大于或等于‘税款所属时期’的起始时间`)
                    flag = false
                }

                if (item.mxsf01 && item.txrqq && (item.mxsf01.valueOf() < item.txrqq.valueOf())) {
                    //入库日期大于起始日期
                    error.mxDetailList[index].mxsf01 = true;
                    message.push(`明细第${index + 1}行，‘入(退)库日期’应大于或等于“税款所属时期”起始时间`)
                    flag = false
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

        if (message.length) {
            this.metaAction.toast('error', message.join('、'))
        } else if (!flag) {
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


    //改变e.targie.checked
    handleFieldChangeC = (path, e) => {
        let nsqj = this.component.props.nsqj || ''
        let obj = {
            [path]: e.target.checked,
            'data.form.dkyf': e.target.checked ? nsqj : null // 默认为当前属期
        }
        this.injections.reduce('updateSfs', obj);
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
                [`data.error.mxDetailList.${rowIndex}.mxsf01`]: false,
                [`data.error.mxDetailLisst.${rowIndex}.txrqz`]: false,
            }
            this.injections.reduce('updateSfs', obj)
        } else {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${col}`, v)
        }

    }

    //金额改变
    amountChange = (rowIndex, v) => {
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.se`]: Number(v) ? Number(v) : v,
            [`data.error.mxDetailList.${rowIndex}.se`]: false,
        })
    }


    //合计行
    sumColumn = (col, isPercent) => {
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
        } else {
            return this.numberFormat(this.sum(mxDetailList, (a, b) => a + b.get(`${currentSumCol}`)), 2)
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

    hjse = () => {
        //价税合计
        let hj = Number(this.sumColumn('se').replace(/,/g, ''))
        return this.numberFormat(hj, 2); //价税合计  
    }
    jshjDx = () => {
        //价税合计大写
        let hj = Number(this.sumColumn('se').replace(/,/g, ''))
        return utils.number.moneySmalltoBig(hj, 2);
    }

    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
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
    disabledDateQ = (currentDate) => {
        //通行日期起
        let skssq = this.component.props.nsqj || '';
        if (skssq && currentDate) {
            skssq = moment(skssq, 'YYYYMM').endOf('month');
            return currentDate.valueOf() > skssq.valueOf();
        }
        return false
    }
    disabledDateZ = (currentDate, txrqq) => {
        //通行日期止
        let skssq = this.component.props.nsqj || '';
        if (currentDate && txrqq && skssq) {
            skssq = moment(skssq, 'YYYYMM').endOf('month');
            return currentDate.valueOf() > skssq.valueOf() || currentDate.valueOf() < txrqq.valueOf();
        } else if (skssq && currentDate) {
            skssq = moment(skssq, 'YYYYMM').endOf('month');
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
    //改变e.targie.checked
    handleBdztChangeC = (path, e) => {
        let nsqj = this.component.props.nsqj || ''
        let { bdlyLx, bdjg, nf06, hjse } = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS() || {}
        let obj = {
            [path]: e.target.checked,
            'data.form.dkyf': e.target.checked ? nsqj : null, // 默认为当前属期
            'data.form.bdlyLx': e.target.checked ? (bdlyLx || '1') : null, // 1-抵扣， 2-退税， 3-代办退税， 4-不抵扣自
            'data.form.bdjg': e.target.checked ? bdjg : null, //发票的状态, 0-正常， 1-异常
            // 'data.form.nf06': hjse, // 有效抵扣税额
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
            form.nf06 = form.hjse;
            form.skssq = form.kprq && form.kprq.format && form.kprq.format('YYYYMM') || form.skssq;
        }
        if (form.bdzt && form.fplyLx == 2) {
            form.bdlyLx = form.bdlyLx || '1';
            form.dkyf = form.dkyf || this.component.props.nsqj;
            form.nf06 = form.hjse;
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

    handleBdlylxChangeV = (v) => {
        this.injections.reduce('updateSfs', {
            'data.form.bdlyLx': v,
            'data.form.dkyf': v != 1 ? null : this.component.props.nsqj,
            'data.error.dkyf': '',
            'data.error.bdlyLx': '',
            'data.form.nf06': v != 1 ? null : this.sumColumn('se').replace(/,/g, ''),
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
        if (bdzt && bdlyLx == 1) {
            return false
        }
        return true

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