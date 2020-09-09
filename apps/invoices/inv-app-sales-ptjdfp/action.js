import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import {fromJS } from 'immutable'
import { number } from 'edf-utils'
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
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
            nsrsbh = currentOrg.vatTaxpayerNum || '91441300303888019Q',
            qyId = currentOrg.id || 1,
            initData = {},
            editInitData = { other: { jzjtbzDisable: false } },
            option = {
                nsrxz: nsrxz,
                fplx: 'xxfp',
                fpzlDm: '05',
            };
        if (kjxh) {
            let res = await this.webapi.invoices.queryXxfp({ kjxh })
            if (res) {
                editInitData = this.getEditInfo(res)
                initData = {
                    ...res,
                    jzjtbz: editInitData.jzjtbz,
                    jsfsDm: res.mxDetailList && res.mxDetailList[0].jsfsDm || undefined,
                    hwlxDm: res.mxDetailList && res.mxDetailList[0].hwlxDm || undefined,
                }
            }
        } else {
            let initInfo = await this.webapi.invoices.initiateAddOfXxfp({ qyId, nsrsbh })
            if (initInfo) {
                initData = {
                    xfmc: initInfo.xfmc,
                    xfsbh: initInfo.xfsbh,
                    xfdzdh: initInfo.xfdzdh,
                    xfyhzh: initInfo.xfyhzh,
                    fpfs: 1,
                    jsfsDm: nsrxz === 'YBNSRZZS' ? '0' : '1',
                    fplyLx: '2',
                }
            }
        }
        // 货物类型
        const hwlxRes = await this.webapi.invoices.getHwlxcsList(option)
        // 税率
        const slRes = await this.webapi.invoices.getSlvcsList(option)
        // 计税方式
        const jsfsRes = await this.webapi.invoices.getJsfscsList(option)
        let hwlxList = fromJS(hwlxRes || []),
            slList = fromJS(slRes || []),
            slListCache = slList,
            jsfsList = jsfsRes || [];
        if (!this.mounted) return
        let form = this.metaAction.gf('data.form').toJS();
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
            'data.hwlxList': hwlxList,
            'data.slList': slList,
            'data.slListCache': slListCache,
            'data.jsfsList': fromJS(editInitData.noZero ? jsfsRes.filter(f => f.jsfsDm !== '2' && f.jsfsDm !== '3') : jsfsRes),
            'data.jsfsListCache': fromJS(jsfsList),
            'data.loading': false,
            'data.other.jzjtbzDisable': editInitData.other.jzjtbzDisable,
        })
        // this.jsfsChange(form, form.jsfsDm)
    }
    onOk = async () => {
        const form = this.checkForm();
        if (!form) {
            this.metaAction.toast('error', '红框内必须有值')
            return false;
        }
        this.injections.reduce('setState', 'data.loading', true)
        const currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS';
        // let periodDate = currentOrg.periodDate || moment().format('YYYYMM'),
        let kjxh = this.component.props.kjxh,
            apiFunName = kjxh ? 'updateXxfp' : 'addXxfp';
        if (!kjxh) {
            form.skssq = this.component.props.nsqj || moment().format('YYYYMM')
            form.kprq = moment(form.skssq + '01').format('YYYY-MM-DD')
        }
        // moment(periodDate).subtract(1, 'month').format('YYYYMM')
        form.jshjDx = number.moneySmalltoBig(form.jshj, 2)
        form.fpzlDm = '05'
        form.mxDetailList = [{
            "jsfsDm": form.jsfsDm, //计税方式代码
            "hwlxDm": form.hwlxDm, //货物类型代码
        }]
        const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
        if (cacheFplyLx > -1 && cacheFplyLx != form.fplyLx) {
            form.fplyLx = cacheFplyLx
        }
        let res = await this.webapi.invoices[apiFunName](form);
        this.injections.reduce('setState', 'data.loading', false)
        if (!this.mounted) return false
        if (kjxh && res === null) {
            this.needReload = true
            this.metaAction.toast('success', '修改成功')
        } else if (res) {
            this.needReload = true
            this.metaAction.toast('success', '新增成功')
            this.injections.reduce('setStates', {
                'data.form': fromJS({
                    xfmc: form.xfmc,
                    xfsbh: form.xfsbh,
                    xfdzdh: form.xfdzdh,
                    xfyhzh: form.xfyhzh,
                    jzjtbz: 'N',
                    jsfsDm: nsrxz === 'YBNSRZZS' ? '0' : '1',
                    fpfs: 1,
                }),
                'data.jsfsList': this.metaAction.gf('data.jsfsListCache'),
                'data.slList': this.metaAction.gf('data.slListCache'),
            })
        }
        return false
    }
    getEditInfo = (data) => {
        let jsfsDm = (data.mxDetailList || []).some(f => f.jsfsDm === '2' || f.jsfsDm === '3')
        let res = { jzjtbz: data.jzjtbz, other: { jzjtbzDisable: false } }
        if (data.jzjtbz === 'Y' && jsfsDm) {
            // 只有批量修改能将 即征＝是的时候，计税方式设置为免税或免抵退，因此，可以不做任何处理
            return res
        } else if (jsfsDm) {
            return { jzjtbz: 'N', other: { jzjtbzDisable: true } }
        } else if (data.jzjtbz === 'Y') {
            return { ...res, noZero: true }
        }
        return res
    }
    // 价税合计金额
    jshjChange = (form, v) => {
        let jshj = Number(v) || 0,
            zbslv = form.zbslv || 0,
            hjje = number.round(jshj / (1 + zbslv), 2),
            hjse = number.round(jshj / (1 + zbslv) * zbslv, 2);
        this.injections.reduce('setStates', {
            'data.form.jshj': v === '' ? undefined : parseFloat(number.round(jshj, 2)).toFixed(2),
            'data.form.hjje': v === '' ? undefined : parseFloat(number.round(hjje, 2)).toFixed(2),
            'data.form.hjse': v === '' || form.zbslv === undefined ? undefined : parseFloat(hjse).toFixed(2),
            'data.error.jshj': '',
            'data.error.hjse': '',
        })
    }
    // 税率选择
    zbslvChange = (form, v) => {
        const nsrxz = (this.metaAction.context.get("currentOrg") || {}).swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS'
        // 2000010001一般企业 2000010002 小规模企业
        let jshj = form.jshj || 0,
            jsfs = form.jsfsDm,
            zbslv = Number(v) || 0,
            hjje = number.round(jshj / (1 + zbslv), 2),
            hjse = number.round(jshj / (1 + zbslv) * zbslv, 2),
            jsfsList = this.metaAction.gf('data.jsfsList').toJS();
        // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
        if (nsrxz == 'YBNSRZZS') {
            if (v <= 0.17 && v >= 0.09) {
                // 一般纳税人：当税率选择“17%，16%，13%，11%，10%，9%”其中一种时 计税方式自动选中“一般计税”
                jsfs = "0"
            }
            if (v <= 0.05 && v >= 0.015) {
                // 一般纳税人：当税率选择“5%，4%，3%，2%，1.5%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }

        } else {
            if (v == 0.05 || v == 0.03) {
                // 小规模纳税人：当税率选择“5%、3%”其中一种时 计税方式自动选中“简易征收”
                jsfs = '1'
            }
        }
        if (v == 0.06) {
            // 计税方式保持原有计税方式（一般计税或简易计税）不变
            jsfs = undefined
        }
        if (v == 0) {
            jsfs = '3'
        }
        let _jsfsDm = jsfsList.find(f => f.jsfsDm === jsfs) ? jsfs : undefined,
            isZero = (_jsfsDm === '2' || _jsfsDm === '3') ? true : false;
        this.injections.reduce('setStates', {
            'data.form.jsfsDm': _jsfsDm,
            'data.form.zbslv': v,
            'data.form.hjje': form.jshj === undefined ? undefined : parseFloat(number.round(hjje, 2)).toFixed(2),
            'data.form.hjse': form.jshj === undefined ? undefined : parseFloat(hjse).toFixed(2),
            'data.error.hjse': '',
            'data.error.zbslv': '',
            'data.form.jzjtbz': isZero ? 'N' : form.jzjtbz,
            'data.other.jzjtbzDisable': isZero ? true : false,
        })
    }
    // 计税方式修改
    jsfsChange = (form, v) => {
        const nsrxz = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS'
        // 2000010001一般企业 2000010002 小规模企业
        let slListNew = this.metaAction.gf('data.slListCache').toJS(),
            kjxh = this.component.props.kjxh,
            jzjtbzDisable = false,
            jzjtbz = this.metaAction.gf('data.form.jzjtbz'),
            fplyLx = this.metaAction.gf('data.form.fplyLx');
        // v = String(v.target.value)
        if (kjxh && fplyLx == 1) {
            // 读取
            this.injections.reduce('setStates', {
                'data.form.jsfsDm': v,
            })
            return
        }
        switch (v) {
            case "0":
                //一般计税
                // 当计税方式选中“一般计税”，税率选择项为
                // 一般纳税人：“17%，16%，13%，11%，10%，9%，6%”
                if (nsrxz == 'YBNSRZZS') {
                    slListNew = slListNew.filter(f => f.slv <= 0.17 && f.slv >= 0.06)
                }
                break
            case "1":
                //简易征收
                if (nsrxz == 'YBNSRZZS') {
                    // “6%，5%，4%，3%，2%，1.5%”
                    slListNew = slListNew.filter(f => f.slv <= 0.06 && f.slv >= 0.015)
                } else {
                    // 5%、3%
                    slListNew = slListNew.filter(f => f.slv == 0.05 || f.slv == 0.03)
                }
                break
            case "2":
            case "3":
                //免抵退 //免税
                slListNew = slListNew.filter(f => f.slv == 0)
                form.zbslv = 0
                // 计税方式选择“免抵退”、“免税”的，即征即退为“否”，置灰，不可修改--2019.7.5
                jzjtbz = 'N'
                jzjtbzDisable = true
                break
        }
        let isInList = slListNew.find(f => f.slv == form.zbslv) ? true : false,
            zbslv = isInList ? form.zbslv : 0,
            jshj = Number(form.jshj),
            hjje = !isNaN(jshj) && number.round(jshj / (1 + zbslv), 2),
            hjse = !isNaN(jshj) && number.round(jshj / (1 + zbslv) * zbslv, 2);
        this.injections.reduce('setStates', {
            'data.slList': fromJS(slListNew),
            'data.form.zbslv': isInList ? form.zbslv : undefined,
            'data.form.hjse': isInList && !isNaN(jshj) ? parseFloat(hjse).toFixed(2) : undefined,
            'data.form.hjje': isInList && !isNaN(jshj) ? parseFloat(hjje).toFixed(2) : undefined,
            'data.form.jsfsDm': v,
            'data.error.zbslv': '',
            'data.error.hjse': '',
            'data.error.hjje': '',
            'data.form.jzjtbz': jzjtbz,
            'data.other.jzjtbzDisable': jzjtbzDisable,
        })
    }
    // 即征即退修改
    jzjtbzChange = (val) => {
        let jsfsList = val == 'N' ? this.metaAction.gf('data.jsfsListCache') : fromJS(this.metaAction.gf('data.jsfsList').toJS().filter(f => f.jsfsDm !== '2' && f.jsfsDm !== '3'))
        let jsfsDm = this.metaAction.gf('data.form.jsfsDm')
        this.injections.reduce('setStates', {
            'data.jsfsList': jsfsList,
            'data.form.jsfsDm': jsfsList.toJS().find(f => f.jsfsDm == jsfsDm) ? jsfsDm : undefined,
            'data.form.jzjtbz': val,
        })
    }
    componentDidMount = () => {
        this.needReload = false;
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
        if (!form.hwlxDm) {
            error.hwlxDm = '货物类型不能为空'
            flag = false
        }
        if (form.jshj === undefined) {
            error.jshj = '价税合计不能为空'
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
        if (form.jsfsDm === undefined) {
            error.jsfsDm = '计税方式不能为空'
            flag = false
        }
        if (form.fpfs <= 0) {
            error.fpfs = '开票张数不能小于1'
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