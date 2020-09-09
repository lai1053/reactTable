import React from 'react'
import {fromJS} from 'immutable'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { number } from 'edf-utils'
import moment from 'moment'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

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
            this.component.props.setCancelLister(() => {
                if (this.needReload)
                    return { needReload: true }
                // component.props.callback && component.props.callback()
                return true
            })
        }
        injections.reduce('init')
    }
    load = async (kjxh) => {
        this.injections.reduce('setState', 'data.loading', true)
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
            nsrsbh = currentOrg.vatTaxpayerNum || '91441300303888019Q',
            qyId = currentOrg.id || 1,
            initData = {},
            option = {
                nsrxz: nsrxz,
                fplx: 'xxfp',
                fpzlDm: '03',
            };
        if (kjxh) {
            let res
            if(this.component.props.justShow === true){
                let dataRes = await this.webapi.invoices.queryXxfpDto(this.component.props.invArguments);
                if(dataRes.flag === true){
                    res = dataRes.xxfp
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
                res = await this.webapi.invoices.queryXxfp({ kjxh });
            }
            if (res) {
                res.kprq = res.kprq ? moment(res.kprq).format('YYYY-MM-DD') : null;
                initData = res;
                if (res.mxDetailList instanceof Array) {
                    initData.jsfsDm = res.mxDetailList[0].jsfsDm
                    delete initData.mxDetailList
                }
            }
        } else {
            let initInfo = await this.webapi.invoices.initiateAddOfXxfp({ qyId, nsrsbh, fpzlDm: '03',skssq:this.component.props.nsqj })
            if (initInfo) {
                initData = {
                    xfmc: initInfo.xfmc, //销货方名称
                    xfsbh: initInfo.xfsbh, //销货方纳税人识别号
                    xfdzdh: initInfo.xfdzdh, //销货方地址电话
                    sf05: initInfo.sf05, //销货方电话
                    sf06: initInfo.sf06, //销货方银行账号
                    xfyhzh: initInfo.xfyhzh, //销货方开户银行
                    fplyLx: "2",
                }
            }
        }
        // 货物类型
        let hwlxRes = []
        if(this.component.props.justShow != true)hwlxRes = await this.webapi.invoices.getHwlxcsList(option)
        // 税率
        let slRes = []
        if(this.component.props.justShow != true) slRes = await this.webapi.invoices.getSlvcsList(option)
        // 计税方式
        let jsfsRes = []
        if(this.component.props.justShow != true) jsfsRes = await this.webapi.invoices.getJsfscsList(option)
        let hwlxList = hwlxRes || [],
            slList = slRes || [],
            // slListCache = slList,
            jsfsList = jsfsRes || [];
        if (!this.mounted) return
        let form = this.metaAction.gf('data.form').toJS();
        nsrxz ===  'XGMZZS' ? form.sf01 = 'N' : form.sf01 = 'Y'
        if(nsrxz ===  'XGMZZS' )form.zbslv = 0.03
        form = {
            ...form,
            ...initData,
        }
        let cacheFplyLx = form.fplyLx;
        if (form.fplyLx != 2 && form.fplyLx != 1) {
            // 将 3导入 4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx;
            form.fplyLx = '1'
        }
        this.injections.reduce('setStates', {
            'data.form': fromJS(form),
            'data.cacheFplyLx': cacheFplyLx,
            'data.hwlxList': fromJS(hwlxList),
            'data.slList': fromJS(form.sf01 == 'N' ? slList : slList.filter(f => f.slv > 0)),
            'data.slListCache': fromJS(slList),
            'data.jsfsList': fromJS(form.sf01 == 'N' ? jsfsList : jsfsList.filter(f => f.jsfsDm !== '2' && f.jsfsDm !== '3')),
            'data.jsfsListCache': fromJS(jsfsList),
            // 'data.other.jzjtbzDisabled': false,
            'data.loading': false,
            'data.justShow':this.component.props.justShow,
            'data.nsrxz':nsrxz
        })
    }
    onOk = async () => {
        if(this.component.props.justShow === true){
            //什么都不做直接关闭
        }else {
            const form = this.checkForm();
            if (!form) {
                this.metaAction.toast('error', '红框内必须有值')
                return false;
            }
            this.injections.reduce('setState', 'data.loading', true)
            const currentOrg = this.metaAction.context.get("currentOrg") || {};
            // let periodDate = currentOrg.periodDate || moment().format('YYYYMM'),
            let kjxh = this.component.props.kjxh,
                apiFunName = kjxh ? 'updateXxfp' : 'addXxfp';
            if (!kjxh) {
                form.skssq = form.kprq.replace('-', '').slice(0, 6)
            }
            // moment(periodDate).subtract(1, 'month').format('YYYYMM')
            form.fpzlDm = '03'
            form.mxDetailList = [{
                "jsfsDm": form.jsfsDm, //计税方式代码
                "hwlxDm": '0004', //货物类型代码
                jzjtDm:form.jzjtbz
            }]
            const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
            if (cacheFplyLx > -1 && cacheFplyLx != form.fplyLx) {
                form.fplyLx = cacheFplyLx
            }
            delete form.jzjtbz
            let res = await this.webapi.invoices[apiFunName](form);
            if (!this.mounted) return
            this.injections.reduce('setState', 'data.loading', false)
            if (kjxh && res === null) {
                this.needReload = true
                this.metaAction.toast('success', '修改成功')
            } else if (res) {
                this.needReload = true
                this.metaAction.toast('success', '新增成功')
                let slList = this.metaAction.gf('data.slListCache').toJS(),
                    jsfsList = this.metaAction.gf('data.jsfsListCache').toJS()
                this.injections.reduce('setStates', {
                    'data.form': fromJS({
                        xfmc: form.xfmc, //销货方名称
                        xfsbh: form.xfsbh, //销货方纳税人识别号
                        xfdzdh: form.xfdzdh, //销货方地址电话
                        sf05: form.sf05, //销货方电话
                        sf06: form.sf06, //销货方银行账号
                        xfyhzh: form.xfyhzh, //销货方开户银行
                        fplyLx: "2",
                        fphm: res.fphm,
                        fpdm: res.fpdm,
                        // kprq: moment().format('YYYY-MM-DD'),
                        sf01: form.sf01,
                        sf03: res.fpdm,
                        sf04: res.fphm,
                        jzjtbz: 'N',
                        fpztDm: '1',
                        jsfsDm: undefined,
                    }),
                    'data.slList': fromJS(form.sf01 == 'N' ? slList : slList.filter(f => f.slv > 0)),
                    'data.jsfsList': fromJS(form.sf01 == 'N' ? jsfsList : jsfsList.filter(f => f.jsfsDm !== '2' && f.jsfsDm !== '3')),
            
                })
            }
            return false
        }
      
    }
    getDefaultPickerValue = () => {
        let nsqj = this.metaAction.gf('data.form.kprq') || this.component.props.nsqj;
        nsqj = nsqj && `${nsqj.slice(0,4)}-${nsqj.slice(4,6)}-01` || moment().format('YYYY-MM-DD')
        return moment(nsqj, 'YYYY-MM-DD')
    }
    disabledDate = (current) => {
        const nsqj = this.component.props.nsqj || moment().format('YYYYMM')
        return current && current > moment(nsqj + '01').subtract(-1, 'month')
    }
    // 价税合计
    jshjxxChange = (v) => {
        let dx = number.moneySmalltoBig(v, 2)
        this.metaAction.sfs({
            'data.form.jshj': v,
            'data.form.jshjDx': dx,
            'data.error.jshj': '',
        })
    }
    jshjxxBlur = () => {
        let v = parseFloat(this.metaAction.gf('data.form.jshj'))
        let dx = number.moneySmalltoBig(v, 2)
        let sl = parseFloat(this.metaAction.gf('data.form.zbslv'))
        let bhsj = 0,
            se = 0
        if (sl > -1 && !isNaN(v)) {
            bhsj = v / (1 + sl)
            se = v / (1 + sl) * sl
        }
        this.metaAction.sfs({
            'data.form.jshj': !isNaN(v) ? v.toFixed(2) : undefined,
            'data.form.jshjDx': !isNaN(v) ? dx : undefined,
            'data.form.hjje': !isNaN(v) && sl > -1 ? bhsj.toFixed(2) : undefined,
            'data.form.hjse': !isNaN(v) && sl > -1 ? se.toFixed(2) : undefined,
            'data.error.jshj': '',
        })
    }

    // 计税方式修改
    jsfsChange = (v) => {
        let slList = this.metaAction.gf('data.slListCache').toJS()
        let slListNew = [],
            // jzjtbzDisabled = false,
            kjxh = this.component.props.kjxh,
            // jzjtbz = this.metaAction.gf('data.form.jzjtbz'),
            zbslv = this.metaAction.gf('data.form.zbslv'),
            fplyLx = this.metaAction.gf('data.form.fplyLx'); //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        // console.log('sjfsChange:', v);
        // v = String(v)
        if (kjxh && fplyLx == 1) {
            this.metaAction.sfs({
                'data.form.jsfsDm': v,
                'data.error.jsfsDm': '',
                // 'data.other.jzjtbzDisabled': v == '2' || v == '3' ? true : false,
            })
            return
        }
        switch (v) {
            case "0":
                //一般计税
                // 当计税方式选中“一般计税”，税率选择项为
                // 一般纳税人：“17%，16%，13%，11%，10%，9%，6%”
                slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.06)
                break
            case "1":
                //简易征收
                // “6%，5%，4%，3%，2%，1.5%”
                slListNew = slList.filter(f => f.slv <= 0.06 && f.slv >= 0.01)
                zbslv = 0.03 || 0.01
                break
            case "2":
            case "3":
                //免抵退
                //免税
                slListNew = slList.filter(f => f.slv == 0)
                zbslv = 0
                // jzjtbz = 'N'
                // jzjtbzDisabled = true
                break
        }
        let jshjxx = this.metaAction.gf('data.form.jshj'),
            se = 0,
            bhsj = 0
        if (parseFloat(jshjxx) && parseFloat(zbslv) > -1) {
            bhsj = jshjxx / (1 + zbslv)
            se = jshjxx / (1 + zbslv) * zbslv
        }
        this.metaAction.sfs({
            'data.slList': fromJS(slListNew),
            'data.form.jsfsDm': v,
            'data.form.zbslv': slListNew.find(f => f.slv == zbslv) ? zbslv : undefined,
            'data.form.hjse': !isNaN(zbslv) && !isNaN(jshjxx) ? se.toFixed(2) : undefined,
            'data.form.hjje': !isNaN(zbslv) && !isNaN(jshjxx) ? bhsj.toFixed(2) : undefined,
            'data.error.zbslv': '',
            'data.error.jsfsDm': '',
            // 'data.other.jzjtbzDisabled': jzjtbzDisabled,
            // 'data.form.jzjtbz': jzjtbz,
        })
    }
    // 税率选择
    zbslvChange = (v) => {
        v = parseFloat(v)
        let jsfs = this.metaAction.gf('data.form.jsfsDm')
        // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
        if (v == 0.17 || v == 0.16 || v == 0.13 || v == 0.11 || v == 0.1 || v == 0.09) {
            // 一般纳税人：当税率选择“17%，16%，13%，11%，10%，9%”其中一种时 计税方式自动选中“一般计税”
            jsfs = "0"
        }
        if (v == 0.05 || v == 0.04 || v == 0.03 || v == 0.02 || v == 0.015) {
            // 一般纳税人：当税率选择“5%，4%，3%，2%，1.5%”其中一种时 计税方式自动选中“简易征收”
            jsfs = "1"
        }
        if (v == 0.06) {
            // 当税率选择“6%”时，计税方式为空白
            jsfs = undefined
        }

        if (v == 0) {
            jsfs = '3'
        }
        let jshjxx = this.metaAction.gf('data.form.jshj'),
            se = 0,
            bhsj = 0
        if (parseFloat(jshjxx) && parseFloat(v) > -1) {
            bhsj = jshjxx / (1 + v)
            se = jshjxx / (1 + v) * v
        }
        this.metaAction.sfs({
            'data.form.jsfsDm': jsfs,
            'data.form.zbslv': !isNaN(v) ? v : undefined,
            'data.form.hjse': !isNaN(v) ? se.toFixed(2) : undefined,
            'data.form.hjje': !isNaN(v) ? bhsj.toFixed(2) : undefined,
            'data.error.zbslv': '',
        })
    }
    // 发票类型选择
    typeActionChange = (v) => {
        let slListCache = this.metaAction.gf('data.slListCache').toJS()
        let jsfsListCache = this.metaAction.gf('data.jsfsListCache').toJS()
        let nsrxz = this.metaAction.gf('data.nsrxz')
        // console.log('');
        let slList = [],
            jsfsList = []
        if (v == 'Y') {
            // 专用发票，2019.7.5版本修改为不含免税
            slList = slListCache.filter(f => f.slv !== 0)
            jsfsList = jsfsListCache.filter(f => f.jsfsDm !== '2' && f.jsfsDm !== '3')
        } else {
            // 普通发票
            slList = slListCache
            jsfsList = jsfsListCache
        }
        this.metaAction.sfs({
            'data.slList': fromJS(slList),
            'data.jsfsList': fromJS(jsfsList),
            'data.form.zbslv': nsrxz === 'XGMZZS' ? 0.03 : undefined,
            'data.form.jsfsDm': undefined,
            'data.form.hjse': undefined,
            'data.form.hjje': undefined,
            'data.form.sf01': v,
            // 'data.other.jzjtbzDisabled': false,
        })
    }
    componentDidMount = () => {
        this.needReload = false
        this.mounted = true;
        this.load(this.component.props.kjxh);
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }
    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS(),
            error = this.metaAction.gf('data.error').toJS(),
            flag = true,
            obj = {};
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
        if (!form.gfmc) {
            error.gfmc = '购方名称不能为空'
            flag = false
        }

        if (!form.jshj) {
            error.jshj = '价税合计不能为空'
            flag = false
        }
        if (!form.xfmc) {
            error.xfmc = '销方名称不能为空'
            flag = false
        }
        if (!form.xfsbh) {
            error.xfsbh = '销方设别号不能为空'
            flag = false
        }

        if (form.jsfsDm === undefined) {
            error.jsfsDm = '计税方式不能为空'
            flag = false
        }
        if (form.hjse === undefined) {
            error.hjse = '税额不能为空'
            flag = false
        }
        if (form.zbslv === undefined) {
            error.zbslv = '税率不能为空'
            flag = false
        }
        if (!form.sf02) {
            error.sf02 = '身份证/机构码不能为空'
            flag = false
        } else if (form.sf02.length < 15) {
            error.sf02 = '身份证/机构码长度不能小于15个字符'
            flag = false
        }
        if (!form.cllx) {
            error.cllx = '车辆类型不能为空'
            flag = false
        }
        if (form.sf12 && form.sf12.length < 21) {
            error.sf12 = '税控码最少21个字符'
            flag = false
        }
        if (form.sf13 && form.sf13.length < 21) {
            error.sf13 = '税控码最少21个字符'
            flag = false
        }
        if (form.sf14 && form.sf14.length < 21) {
            error.sf14 = '税控码最少21个字符'
            flag = false
        }
        if (form.sf15 && form.sf15.length < 21) {
            error.sf15 = '税控码最少21个字符'
            flag = false
        }
        if (!flag) {
            obj['data.error'] = fromJS(error)
        }
        this.injections.reduce('setStates', obj)
        return flag ? form : false
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

    //直接改变value
    handleFieldChangeV = (path, v, must) => {
        if (must) {
            let errorPath = path.replace('form', 'error')
            let obj = {
                [path]: v,
                [errorPath]: ''
            }
            this.injections.reduce('setStates', obj)
        } else {
            this.injections.reduce('setState', path, v)
        }
    }
    handleGetPopupContainer = () => {
        return document.querySelector(".ant-modal")
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true) return v
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
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