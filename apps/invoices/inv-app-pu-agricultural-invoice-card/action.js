import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
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
                jzjtbz: 'N',
            },
            error = { mxDetailList: new Array(defaultLength).fill({}) }
        if (kjxh) {
            let res = await this.webapi.invoice.queryJxfp({ kjxh });
            if (res) {
                res.kprq = res.kprq ? moment(res.kprq) : null; //开票日期
                res.dkyf = !res.dkyf && res.bdzt ? '' : res.dkyf // 抵扣月份返回为空时
                res.mxDetailList.forEach(o => {
                    if (!Number(o.sl)) o.sl = undefined
                    if (!Number(o.dj)) o.dj = undefined
                })
                while (res.mxDetailList.length < defaultLength) {
                    res.mxDetailList.push({})
                }
                error.mxDetailList = new Array(res.mxDetailList.length).fill({})
                initData = res;
            }
        } else {

            let gfinfo = await this.webapi.invoice.initiateAddOfJxfp({ nsrsbh });
            if (gfinfo) {
                initData = {
                    ...initData,
                    gfmc: gfinfo.gfmc,
                    gfsbh: gfinfo.gfsbh,
                    gfdzdh: gfinfo.gfdzdh,
                    gfyhzh: gfinfo.gfyhzh,
                    fplyLx: '2',
                }
            }
        }

        let taxRates = await this.webapi.invoice.getSlvcsList({
            nsrxz,
            fplx: 'jxfp',
            fpzlDm: '15'
        })
        if (!this.mounted) return
        const spbmRes = await this.webapi.invoice.getSpbmList();
        if (!this.mounted) return //组件已经卸载

        let form = this.metaAction.gf('data.form').toJS();
        form = {
            ...form,
            ...initData
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
            'data.spbmList': fromJS((spbmRes || []).map(item => ({ ...item, key: item.spbm, title: item.spmc }))),
            'data.other.defaultPickerValue': moment(skssq, 'YYYYMM'),
            'data.loading': false
        });
    }

    onOk = async () => {
        let params = this.checkForm();
        if (!params) return false;
        const currentOrg = this.metaAction.context.get('currentOrg') || {};
        let skssq = this.component.props.nsqj || '';
        let hj = Number(this.sumColumn('je').replace(/,/g, '')) + Number(this.sumColumn('se').replace(/,/g, '')); //合计
        let jshj = this.numberFormat(hj, 2, true); //价税合计小写
        let jshjDX = utils.number.moneySmalltoBig(hj); //价税合计大写

        let kprq = params.kprq;
        params.kprq = kprq.format('YYYY-MM-DD HH:mm:ss'); //开票日期
        params.bdzt = this.notXaoGuiMo() ? 1 : 0; //认证状态 1 已认证 0未认证 一般企业1小规模0
        params.fpzlDm = '15'; //发票种类代码
        params.skssq = skssq; //税款所属期 已认证，税款所属期为：报税月份-1；未认证或者普票，税款所属期为：开票月份
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
                jzjtbz: 'N', //即征即退
                dkyf: skssq, //  默认为当前属期
                gfmc: params.gfmc, //购方名称
                gfsbh: params.gfsbh, //购方识别号
                gfdzdh: params.gfdzdh, //购方地址电话
                gfyhzh: params.gfyhzh, //购方银行账号
                mxDetailList: [{}, {}, {}], //明细
            }
            this.injections.reduce('update', 'data.form', initFormData);
        }
        return false; //点击确定不关闭弹框
    }

    onCancel = () => {
        return {
            listNeedLoad: this.listNeedLoad
        };
    }
    handleGetPopupContainer = () => {
        return document.body
        //return document.querySelector(".ant-modal")
        // return document.getElementById('inv-app-pu-agricultural-invoice-card')
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
        }
    }

    renderDkyf = () => {
        let nsqj = this.component.props.nsqj;
        if (nsqj) {
            let skssq = moment(nsqj, 'YYYYMM');
            let skssqString = skssq.format('YYYYMM');
            let arr = [<Option title={skssqString} key={skssqString} value={skssqString} >{skssqString}</Option>];
            let nextskssq = skssq;
            for (let i = 0; i < 11; i++) {
                nextskssq = nextskssq.add('month', 1); //下月
                let nextskssqString = nextskssq.format('YYYYMM');
                arr.push(<Option title={nextskssqString} key={nextskssqString} value={nextskssqString} >{nextskssqString}</Option>)
            }
            arr.push(<Option title='不抵扣' key='no' value=''>不抵扣</Option>)

            return arr;

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
        } else if (form.fpdm.length !== 10 && form.fpdm.length !== 12) {
            error.fpdm = '发票代码长度应为10或12个字符'
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
        form.mxDetailList = form.mxDetailList.filter(obj => JSON.stringify(obj) !== "{}");
        let mxDetailList = [...form.mxDetailList];
        if (!mxDetailList.length) {
            error.mxDetailList[0] = {
                hwmc: true,
                je: true,
                slv: true,
                se: true
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

            this.injections.reduce('updateSfs', obj)
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

    }

    //数量改变 
    quantityChange = (rowIndex, rowData, v) => {
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

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}