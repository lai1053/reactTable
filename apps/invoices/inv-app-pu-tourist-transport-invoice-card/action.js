import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import utils from 'edf-utils'
import { fromJS } from 'immutable';
import moment from 'moment';
import { type } from 'os';

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
            { swVatTaxpayer, vatTaxpayerNum: nsrsbh, name: nsrmc, id: qyId } = currentOrg,
            nsrxz = swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS',
            defaultLength = this.metaAction.gf('data.other.defaultLength'),
            fpzlDm = '18',
            skssq = this.component.props.nsqj || '',
            initData = {
                dkyf: skssq,
                nsrsbh,
                nsrmc,
                bdzt: '1',
                fpzlDm,
                skssq,
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
            if (!this.mounted) return
            if (res) {
                res.kprq = res.kprq ? moment(res.kprq, 'YYYYMMDD') : null; //开票日期
                res.bdzt = '1' //认证状态
                res.dkyf = !res.dkyf && res.bdzt ? '' : res.dkyf // 抵扣月份返回为空时
                res.nsrsbh = res.nsrsbh ? res.nsrsbh : nsrsbh
                res.nsrmc = res.nsrmc ? res.nsrmc : nsrmc
                while (res.mxDetailList.length < defaultLength) {
                    res.mxDetailList.push({})
                }
                res.mxDetailList.forEach((val) => {
                    val.mxsf01 = val.mxsf01 ? moment(val.mxsf01, 'YYYYMMDD') : undefined
                    if (!val.je) val.je = val.mxlx && val.mxlx === '1001' ? '0.00' : undefined
                    if (!val.se) val.se = val.mxlx && val.mxlx === '1001' ? '0.00' : undefined
                    if (!val.slv) val.slv = undefined
                    if (!val.mxlx) val.mxlx = undefined
                    if (!val.mxsf02) val.mxsf02 = undefined
                    if (!val.mxnf01) val.mxnf01 = val.mxlx && val.mxlx === '1001' ? '0.00' : undefined
                    if (!val.mxnf02) val.mxnf02 = val.mxlx && val.mxlx === '1001' ? '0.00' : undefined
                    if (!val.mxnf03) val.mxnf03 = val.mxlx && val.mxlx === '1001' ? '0.00' : undefined
                })
                error.mxDetailList = new Array(res.mxDetailList.length).fill({})
                initData = res;
            }
        } else {
            let gfinfo = await this.webapi.invoice.initiateAddOfJxfp({ nsrsbh, qyId,fpzlDm:'18',skssq});
            if (!this.mounted) return
            if (gfinfo) {
                initData = {
                    ...initData,
                    gfmc: gfinfo.gfmc,
                    gfsbh: gfinfo.gfsbh,
                    fphm:gfinfo.fphm,
                    fphmVisible:gfinfo.fphm?true:false,
                    fplyLx: '2',
                    bdlyLx: '1',
                }
            }

        }
        let ticketType_taxRate = await this.webapi.invoice.getKplxcsList(`nsrxz=YBNSRZZS&fplx=jxfp`) //获取客票类型与税率
        let ticketTypes = [],
            types = {}
        let taxRates = [],
            rates = {}
        ticketType_taxRate.forEach((item, index) => {
            const { kplxDm: mxlx, kplxMc: mxlxMc, mrslv, slv } = item
            if (!types[mxlx]) {
                ticketTypes.push({ mxlx, mxlxMc, slv, mrslv }) // 客票类型
                type[mxlx] = mxlx
            }
            if (!rates[mrslv]) {
                taxRates.push({ mrslv, slv }) // 税率
                rates[mrslv] = mrslv
            }
        })
        let sbytcsRes = [];
        if (this.isV2Component()) {
            sbytcsRes = await this.webapi.invoice.getSbytcsList(`nsrxz=YBNSRZZS&fplx=jxfp&fpzlDm=18`)
        }
        if (!this.mounted) return //组件已经卸载

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
            'data.cacheFplyLx': cacheFplyLx,
            'data.form.kjxh': kjxh,
            'data.other.defaultPickerValue': moment(skssq, 'YYYYMM'),
            'data.other.ticketType_taxRate': fromJS(ticketType_taxRate),
            'data.other.ticketTypes': fromJS(ticketTypes),
            'data.other.taxRates': fromJS(taxRates),
            'data.sbytcsList': fromJS(sbytcsRes),
            'data.form': fromJS(form),
            'data.error': fromJS(error),
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
        // let nsqj = this.component.props.nsqj || moment(new Date(), 'YYYYMM').subtract('month', 1);
        // if (nsqj) {
        //     const skssq = moment(nsqj, 'YYYYMM');
        //     const skssqString = skssq.format('YYYYMM');
        //     const selectArr = [<Option  title={ skssqString }  key={ skssqString }  value={ skssqString } > {skssqString} </Option>]
        //     let nextOption = skssq
        //     for (let i = 1; i < 12; i++) {
        //         nextOption = nextOption.add('month', 1)
        //         let nextOptionString = nextOption.format('YYYYMM')
        //         selectArr.push(<Option  title={ nextOptionString }  key={ nextOptionString }  value={ nextOptionString } > {nextOptionString} </Option>)
        //     }
        //     selectArr.push(<Option title='不抵扣' key='no' value='' >不抵扣</Option>)
        //     return selectArr
        // }
    }

    onOk = async () => {
        if(this.component.props.justShow === true){
        
        }else {
            let params = this.checkForm();
            if (!params) return false;
            const currentOrg = this.metaAction.context.get('currentOrg') || {};
            const { nsrmc, nsrsbh } = params
            let skssq = this.component.props.nsqj || ''; //税款所属期
            let kprq = params.kprq;
            params.kprq = kprq.format('YYYY-MM-DD HH:mm:ss'); //开票日期
    
            params.fpzlDm = '18'; //发票种类代码
            params.bdzt = '1'; //默认已认证
            params.skssq = skssq //税款所属期 已认证，税款所属期为：报税月份-1；未认证或者普票，税款所属期为：开票月份
            params.hjje = Number(this.sumColumn('je').replace(/,/g, '')); //合计金额
            params.hjse = Number(this.sumColumn('se').replace(/,/g, '')); //合计税额
    
            params.dkyf = params.dkyf ? moment(this.metaAction.gf('data.form.dkyf'), 'YYYYMM').format('YYYYMM') : ''
            let sehjDx = utils.number.moneySmalltoBig(params.hjse) //税额合计大写
            let jehj = Number(this.sumColumn('mxnf01').replace(/,/g, '')) //总金额合计
            let pjhj = Number(this.sumColumn('mxnf02').replace(/,/g, '')) //票价合计
            let ryfjf = Number(this.sumColumn('mxnf03').replace(/,/g, '')) //附加燃油费合计
    
            params.sf01 = sehjDx
            params.nf01 = jehj
            params.nf02 = pjhj
            params.nf03 = ryfjf
    
            params.mxDetailList.forEach(o => {
                if (o.je === undefined) o.je = ''
                if (o.se === undefined) o.se = ''
                if (o.slv === undefined) o.slv = 0
                if (o.mxlx === undefined) o.mxlx = ''
                o.mxsf01 = o.mxsf01 === undefined ? '' : moment(o.mxsf01, 'YYYYMMDD').format('YYYYMMDD')
                if (o.mxsf02 === undefined) o.mxsf02 = ''
                if (o.mxnf01 === undefined) o.mxnf01 = ''
                if (o.mxnf02 === undefined) o.mxnf02 = ''
                if (o.mxnf03 === undefined) o.mxnf03 = ''
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
            let res = await this.webapi.invoice[apiname](params); // 保存数据的请求
            if (!this.mounted) return
            this.injections.reduce('update', 'data.loading', false);
            if (this.component.props.kjxh && res === null) {
                this.listNeedLoad = true;
                this.metaAction.toast('success', '发票修改成功');
            } else if (res) {
                this.listNeedLoad = true;
                this.metaAction.toast('success', '新增发票成功');
                let initFormData = {
                    nsrmc,
                    nsrsbh,
                    gfmc: res.gfmc,
                    gfsbh: res.gfsbh,
                    fphm: res.fphm, //发票号码+1
                    bdzt: 'true', //认证状态 默认选中
                    dkyf: skssq, // 默认为当前属期
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
        return document.body
    }


    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS();
        let error = this.metaAction.gf('data.error').toJS();
        let defaultLength = this.metaAction.gf('data.other.defaultLength')
        error.mxDetailList = []
        let flag = true;
        let mark = true

        if (!form.kprq) {
            error.kprq = '开票日期不能为空'
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
                mxlx: true,
                mxnf01: true,
                mxnf02: true,
                mxnf03: true,
                slv: true,
            };
            flag = false;
        } else {
            mxDetailList.forEach((item, index) => {
                error.mxDetailList[index] = {};
                if (!item.mxlx) { // 客票类型不能为空
                    error.mxDetailList[index].mxlx = true;
                    flag = false
                }
                if (!item.mxnf01 && item.mxlx === '1001') { //总金额不能为空
                    error.mxDetailList[index].mxnf01 = true;
                    flag = false
                }
                if (!item.mxnf02) { //票价不能为空,不能为0
                    error.mxDetailList[index].mxnf02 = true;
                    flag = false
                }
                if (item.mxnf03 === undefined && item.mxlx === '1001') { //燃油附加不能为空,可以为0
                    error.mxDetailList[index].mxnf03 = true;
                    flag = false
                }
                if (item.slv === undefined) { // 税率
                    error.mxDetailList[index].slv = true;
                    flag = false
                }
                if (item.jzjtDm === undefined) { // 税率
                    item.jzjtDm = 'N'
                }
                // 当客票类型为“飞机票”时，检测总金额是否大于或等于票价加燃油附加费，否则不能保存
                if (item.mxlx === '1001') {
                    if (item.mxnf01 && item.mxnf02) {
                        if (Number(Math.abs(item.mxnf01)) < Number(Math.abs(item.mxnf02)) + Number(Math.abs(item.mxnf03))) {
                            flag = false
                            mark = false
                        }
                    }
                } else {
                    if (item.mxnf01 && item.mxnf02 && (Number(Math.abs(item.mxnf01)) < Number(Math.abs(item.mxnf02)))) {
                        flag = false
                        mark = false
                    }
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

        if (!flag && !mark) {
            this.metaAction.toast('error', '总金额应 大于或等于 票价+燃油附加费！')
        } else if (!flag) {
            this.metaAction.toast('error', '红框内必须有值！')
        }

        return flag ? form : false
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

    //客票类型改变
    kplxChange = (rowIndex, rowData, v) => {
        let tax = undefined
        let ticketTypes = this.metaAction.gf('data.other.ticketTypes').toJS()
        if (!!v) {
            ticketTypes.map((item, index) => {
                if (item['mxlx'] === v) {
                    tax = item.slv
                }
            })
        }
        let obj = {
            [`data.form.mxDetailList.${rowIndex}.mxlx`]: v, // 旅客票类型
            [`data.form.mxDetailList.${rowIndex}.slv`]: tax, //税率
            [`data.form.mxDetailList.${rowIndex}.mxnf03`]: undefined, // 燃油附加费
            [`data.error.mxDetailList.${rowIndex}.mxlx`]: false,
            [`data.error.mxDetailList.${rowIndex}.slv`]: false,
            [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false,
            [`data.error.mxDetailList.${rowIndex}.mxnf03`]: false,
        }
        this._calculateJsje(tax, rowData.mxnf02, 0, rowIndex) // 计算计税金额和税额
        this.injections.reduce('updateSfs', obj)
    }


    //总金额改变
    totalCashChange = (rowIndex, rowData, v) => {
        if (!Number(v)) {
            let obj = {
                [`data.form.mxDetailList.${rowIndex}.mxnf01`]: v,
                [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false,
            }
            this.injections.reduce('updateSfs', obj);
            return
        }

        let pj = rowData.mxnf02
        let ryfjf = rowData.mxnf03
        let zje = Number(v) ? Number(v) : undefined

        // 处理同为正负号
        if ((parseFloat(ryfjf) && parseFloat(ryfjf) < 0) || (parseFloat(pj) && parseFloat(pj) < 0)) {
            zje = zje !== undefined ? (0 - Math.abs(zje)) : undefined
        } else if ((parseFloat(ryfjf) && parseFloat(ryfjf) > 0) || (parseFloat(pj) && parseFloat(pj) > 0)) {
            zje = zje !== undefined ? Math.abs(zje) : undefined
        }

        let obj = {
            [`data.form.mxDetailList.${rowIndex}.mxnf01`]: zje,
            [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false,
        }
        this.injections.reduce('updateSfs', obj)
        this._isShowZjeTips(v, rowData.mxnf02, rowData.mxnf03, rowIndex)
    }

    //税额改变
    taxChange = (rowIndex, rowData, v) => {
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.se`]: Number(v) ? Number(v) : v,
            [`data.error.mxDetailList.${rowIndex}.se`]: false
        })
    }

    // 票价改变
    feeChange = (rowIndex, rowData, v) => {
        if (!Number(v)) {
            if (v !== '' || Number(v) !== 0) {
                this.injections.reduce('updateSfs', {
                    [`data.form.mxDetailList.${rowIndex}.mxnf02`]: v, // 票价
                    [`data.error.mxDetailList.${rowIndex}.mxnf02`]: false
                })
                if (this.isV2Component() && !this.notAllowEditNf06()) {
                    this.injections.reduce('updateSfs', {
                        'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                        'data.error.nf06': '',
                    })
                }
                return
            }
        }
        let slv = rowData.slv
        let pj = Number(v) ? Number(v) : undefined
        let ryfjf = rowData.mxnf03 ? Number(rowData.mxnf03) : 0 //燃油附加费
        let zje = rowData.mxnf01

        // 处理同为正负号
        if ((parseFloat(ryfjf) && parseFloat(ryfjf) < 0) || (parseFloat(zje) && parseFloat(zje) < 0)) {
            pj = pj !== undefined ? (0 - Math.abs(pj)) : undefined
        } else if ((parseFloat(ryfjf) && parseFloat(ryfjf) > 0) || (parseFloat(zje) && parseFloat(zje) > 0)) {
            pj = pj !== undefined ? Math.abs(pj) : undefined
        }

        let val = v ? Number(v) : 0
        let total = ryfjf !== undefined ? val + Number(ryfjf) : val // 总金额
        let flag = this.metaAction.gf(`data.form.mxDetailList.${rowIndex}.jeHasInput`)

        let obj = {
            [`data.form.mxDetailList.${rowIndex}.mxnf02`]: pj, // 票价
            [`data.form.mxDetailList.${rowIndex}.mxnf01`]: total, // 总金额
            [`data.error.mxDetailList.${rowIndex}.mxnf02`]: false,
            [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false // 总金额
        }
        if (flag) { // 如果总金额先填写，那么票价输入的时候，总金额不会跟着联动
            total = zje
            obj = {
                [`data.form.mxDetailList.${rowIndex}.mxnf02`]: pj, // 票价
                [`data.error.mxDetailList.${rowIndex}.mxnf02`]: false,
                [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false // 总金额
            }
        }
        this.injections.reduce('updateSfs', obj)
        this._calculateJsje(slv, pj, ryfjf, rowIndex)
        this._isShowZjeTips(total, pj, ryfjf, rowIndex)

    }

    // 燃油附加费
    ryfjfChange = (rowIndex, rowData, v) => {
        if (!Number(v)) {
            if (v !== '' || Number(v) !== 0) {
                this.injections.reduce('updateSfs', {
                    [`data.form.mxDetailList.${rowIndex}.mxnf03`]: v, // 票价
                    [`data.error.mxDetailList.${rowIndex}.mxnf03`]: false // 总金额
                })
                if (this.isV2Component() && !this.notAllowEditNf06()) {
                    this.injections.reduce('updateSfs', {
                        'data.form.nf06': this.sumColumn('se').replace(/,/g, ''),
                        'data.error.nf06': '',
                    })
                }
                return
            }
        }
        let slv = rowData.slv
        let pj = rowData.mxnf02 ? Number(rowData.mxnf02) : undefined //票价
        let zje = rowData.mxnf01
        let ryfjf = (Number(v) || Number(v) === 0) ? Number(v) : 0
        // 处理同为正负号
        ryfjf = (parseFloat(pj) && parseFloat(pj) < 0) || (parseFloat(zje) && parseFloat(zje) < 0) ? (0 - Math.abs(ryfjf)) : Math.abs(ryfjf)
        let total = (pj || ryfjf) ? (Number(pj || '0') + ryfjf) : undefined // 总金额
        let flag = this.metaAction.gf(`data.form.mxDetailList.${rowIndex}.jeHasInput`)
        let obj = {
            [`data.form.mxDetailList.${rowIndex}.mxnf03`]: ryfjf, // 燃油附加费
            [`data.form.mxDetailList.${rowIndex}.mxnf01`]: total, // 总金额
            [`data.error.mxDetailList.${rowIndex}.mxnf03`]: false,
            [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false
        }
        if (flag) {
            total = zje
            obj = {
                [`data.form.mxDetailList.${rowIndex}.mxnf03`]: ryfjf, // 票价
                [`data.error.mxDetailList.${rowIndex}.mxnf03`]: false,
                [`data.error.mxDetailList.${rowIndex}.mxnf01`]: false // 总金额
            }
        }
        this.injections.reduce('updateSfs', obj)
        this._calculateJsje(slv, pj, ryfjf, rowIndex)
        this._isShowZjeTips(total, pj, ryfjf, rowIndex)
    }

    //计算计税金额
    _calculateJsje = (slv, pjSum, ryfjfSum, rowIndex) => {
        let taxRate = slv
        let pj = pjSum ? pjSum : 0 // 票价
        let ryfjf = ryfjfSum ? ryfjfSum : 0 // 燃油附加费
        let amount = Number(pj) + Number(ryfjf)
        let jsjeTotal = (!taxRate || !amount) ? undefined : utils.number.round(amount / (1 + taxRate), 2)
        this._calculateSe(jsjeTotal, slv, rowIndex)
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.je`]: jsjeTotal, // 计税金额
            [`data.error.mxDetailList.${rowIndex}.je`]: false // 计税金额
        })
    }

    // 计算税额
    _calculateSe = (je, slv, rowIndex) => {
        let jsje = je || 0,
            rate = slv || 0;
        let se = (!jsje || !rate) ? undefined : utils.number.round(Number(jsje) * Number(rate), 2)
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.se`]: se, // 计税金额
            [`data.error.mxDetailList.${rowIndex}.se`]: false
        })
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
        let pj = rowData.mxnf02 //票价
        let ryfjf = rowData.mxnf03 //燃油附加费
        let obj = {
            [`data.form.mxDetailList.${rowIndex}.slv`]: v,
            [`data.error.mxDetailList.${rowIndex}.slv`]: false
        }
        this.injections.reduce('updateSfs', obj)
        this._calculateJsje(taxRate, pj, ryfjf, rowIndex)

    }

    // 是否给出提示
    _isShowZjeTips = (totalCash, pj, ryfjf, rowIndex) => {
        let totalSum = parseFloat(totalCash) ? parseFloat(totalCash) : 0
        let pjSum = parseFloat(pj) ? parseFloat(pj) : 0
        let ryfjfSum = parseFloat(ryfjf) ? parseFloat(ryfjf) : 0
        let mark = (Math.abs(totalSum) < Math.abs(pjSum) + Math.abs(ryfjfSum)) ? true : false
        this.injections.reduce('updateSfs', {
            [`data.form.mxDetailList.${rowIndex}.zjeFlag`]: mark
        })
    }

    sumColumnVal = (col, isPercent) => {
        let ret = this.sumColumn(col, isPercent)
        const hasPlanetTicket = this._hasPlanetTicket()
        let finalVal = parseFloat(ret) ? ret : hasPlanetTicket !== undefined ? '0.00' : undefined
        return finalVal
    }

    _hasPlanetTicket = () => {
        const list = this.metaAction.gf('data.form.mxDetailList').toJS()
        return list.find(v => v['mxlx'] === '1001' && v['mxnf03'] !== undefined)
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
        // 去除小数点
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }

    //求和
    sum = (mxDetailList, fn) => {
        if (!mxDetailList || mxDetailList.length == 0) return this.numberFormat(0, 2)

        return mxDetailList.reduce((a, b) => {
            let r = fn(a, b)
            return isNaN(r) ? a : r
        }, 0)
    }


    sehjDx = () => { //税额合计大写
        let sehj = Number(this.sumColumn('se').replace(/,/g, ''))
        return utils.number.moneySmalltoBig(sehj, 2);
    }

    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined && quantity !== null) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }

    // 是否可编辑，控制查看
    isReadOnly = () => {
        return this.component.props.readOnly || false
    }

    // 是否允许修改
    notAllowEdit = (path) => {
        //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        let kjxh = this.component.props.kjxh;
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        if (!kjxh) { return false; }
        if (Number(fplyLx) == 2) return false
        return true;
    }

    // 总金额和燃油附加费是否可编辑
    isAirPlaneTicket = (rowData) => {
        return !(rowData && rowData.mxlx && rowData.mxlx === '1001')
    }

    // 客票类型下拉
    renderTicketTypeSelectOption = () => {
        let data = this.metaAction.gf('data.other.ticketTypes') && this.metaAction.gf('data.other.ticketTypes').toJS()
        if (data && data instanceof Array) {
            return data.map((d, index) => <Option title={d.mxlxMc} key={d.mxlx} value={d.mxlx} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.mxlxMc}</Option>)
        }
    }

    // 税率下拉
    renderTaxRateSelectOption = () => {
        let data = this.metaAction.gf('data.other.taxRates') && this.metaAction.gf('data.other.taxRates').toJS()

        if (data && data instanceof Array) {
            return data.map((d, index) => <Option title={d.mrslv} key={d.slv} value={d.slv} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.mrslv}</Option>)
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

    // 开票日期可选限制
    disabledDateQ = (currentDate) => {
        let lkpqq = '20190401' //通行日期起
        let skssq = this.component.props.nsqj || ''; // 税款所属期
        if (skssq && currentDate) {
            skssq = moment(skssq, 'YYYYMM').endOf('month');
            lkpqq = moment(lkpqq, 'YYYYMMDD').startOf('day')
            return currentDate.valueOf() > skssq.valueOf() || currentDate.valueOf() < lkpqq.valueOf();
        }
        return false
    }

    // 如果输入的不是数字，则清空
    handleCellNumberBlur = (path, rowIndex, isAllowZero) => (e) => {
        let v = this.metaAction.gf(`data.form.mxDetailList.${rowIndex}.${path}`);

        if (!Number(v) && isAllowZero !== true) {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${path}`, undefined)
        }
        if (isAllowZero && v === '-') {
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.${path}`, undefined)
        }
        // 处理燃油附加费，鼠标经过不填值时默认为0
        if (path === 'mxnf03' && (v === undefined || v === '')) {
            this.injections.reduce('updateSfs', {
                [`data.form.mxDetailList.${rowIndex}.${path}`]: 0,
                [`data.error.mxDetailList.${rowIndex}.${path}`]: false,
            })
        }
        // 处理金额
        if (path === 'mxnf01') {
            let mark = Number(v) ? true : false
            this.injections.reduce('update', `data.form.mxDetailList.${rowIndex}.jeHasInput`, mark)
        }

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
        const nf06 = this.metaAction.gf('data.form.nf06');
        this.injections.reduce('updateSfs', {
            'data.form.bdlyLx': v,
            'data.form.dkyf': v != 1 ? null : this.component.props.nsqj,
            'data.error.dkyf': '',
            'data.error.bdlyLx': '',
            'data.form.nf06': nf06 || nf06 === 0 ? nf06 : this.sumColumn('se').replace(/,/g, ''),
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

}


export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}