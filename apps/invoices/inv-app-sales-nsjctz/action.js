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
            option = {
                nsrxz: nsrxz,
                fplx: 'xxfp',
                fpzlDm: '08',
            };
        if (kjxh) {
            let res = await this.webapi.invoices.queryXxfp({ kjxh })
            if (res) {
                initData = {
                    ...res,
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
            jsfsList = fromJS(jsfsRes && jsfsRes.filter(f => f.jsfsDm == '0') || []);
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
            'data.jsfsList': jsfsList,
            'data.loading': false,
        })
    }

    onOk = async () => {
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
            form.skssq = this.component.props.nsqj || moment().format('YYYYMM')
            form.kprq = moment(form.skssq + '01').format('YYYY-MM-DD')
        }
        form.jshj = number.round(Number(form.hjje) + Number(form.hjse), 2)
        form.jshjDx = number.moneySmalltoBig(form.jshj, 2)
        form.fpzlDm = '08'
        form.mxDetailList = [{
            "jsfsDm": form.jsfsDm, //计税方式代码
            "hwlxDm": form.hwlxDm, //货物类型代码
        }]
        const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
        if (cacheFplyLx > -1 && cacheFplyLx != form.fplyLx) {
            form.fplyLx = cacheFplyLx
        }
        let res = await this.webapi.invoices[apiFunName](form);
        if (!this.mounted) return
        this.injections.reduce('setState', 'data.loading', false)
        if (kjxh && res === null) {
            this.needReload = true
            this.metaAction.toast('success', '修改成功')
        } else if (res) {
            this.needReload = true
            this.metaAction.toast('success', '新增成功')
            this.injections.reduce('setState', 'data.form', fromJS({
                xfmc: form.xfmc,
                xfsbh: form.xfsbh,
                xfdzdh: form.xfdzdh,
                xfyhzh: form.xfyhzh,
                hwlxDm: '0004',
                jzjtbz: 'N',
                jsfsDm: '0',
            }))
        }
        return false
    }
    hjjeChange = (form, v) => {
        let zbslv = form.zbslv || 0,
            hjje = Number(v),
            hjse = number.round(hjje / (1 + zbslv) * zbslv, 2); //税额=金额/（1+税率）*税率
        this.injections.reduce('setStates', {
            'data.form.hjje': v === '' ? undefined : parseFloat(number.round(hjje, 2)).toFixed(2),
            'data.form.hjse': v === '' || form.zbslv === undefined ? undefined : parseFloat(hjse).toFixed(2),
            'data.error.hjje': '',
            'data.error.hjse': '',
        })
    }
    // 税率选择
    zbslvChange = (form, v) => {
        let zbslv = Number(v) || 0,
            hjje = form.hjje || 0,
            hjse = number.round(hjje * zbslv, 2);
        this.injections.reduce('setStates', {
            'data.form.hjse': isNaN(Number(form.hjje)) || v === undefined ? undefined : parseFloat(hjse).toFixed(2),
            'data.form.zbslv': v,
            'data.error.zbslv': '',
            'data.error.hjse': '',
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
        if (form.hjje === undefined) {
            error.hjje = '不含税金额不能为空'
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