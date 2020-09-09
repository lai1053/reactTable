import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import {fromJS } from 'immutable'
import { number } from 'edf-utils'
import moment from 'moment'
import UsedCarSaleForm from './components/usedCarSaleForm'
import OtherForm from './components/otherForm'
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
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init')
    }
    onCancel = () => {
        return {
            listNeedLoad: this.needReload,
            needReload: this.needReload,
        };
    }
    onOk = async () => {
        
        if(this.component.props.justShow === true){
            // 什么都不执行直接关闭
        }else {
            const form = this.checkForm();
            if (!form) {
                this.metaAction.toast('error', '红框内必须有值')
                return false;
            }
            this.injections.reduce('setState', 'data.loading', true)
            const currentOrg = this.metaAction.context.get("currentOrg") || {},
                { kjxh, fpzlDm, nsqj, fplx, readOnly, } = this.component.props,
                apiFunName = kjxh ? fplx === 'xxfp' ? 'updateXxfp' : 'updateJxfp' : fplx === 'xxfp' ? 'addXxfp' : 'addJxfp';
            if (!kjxh) {
                form.skssq = form.kprq.replace('-', '').slice(0, 6)
            }
            form.jshjDx = number.moneySmalltoBig(form.jshj)
            form.fpzlDm = fpzlDm
            if (fplx === 'jxfp' && fpzlDm === '07') {
                form.hjje = form.jshj
                form.bdzt = 0
            }
            if (fpzlDm === '07') {
                form.mxDetailList = [{
                    "jsfsDm": form.jsfsDm, //计税方式代码
                    "hwlxDm": '0004', //货物类型代码
                    "je": form.hjje,
                    'se': form.hjse ? form.hjse : 0,
                    'slv': form.zbslv ? form.zbslv : 0,
                    jzjtDm:form.jzjtbz
                }]
                delete form.jzjtbz
                if(!form.hjse || ! form.zbslv){
                    form.hjse = 0
                    form.zbslv = 0
                }
            }
            if (fpzlDm === '99') {
                form.jshj = form.hjje
                form.bdzt = 0
            }
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
                let slList = this.metaAction.gf('data.slListCache').toJS(),
                    jsfsList = this.metaAction.gf('data.jsfsListCache').toJS(),
                    initData = this.metaAction.gf('data.initData').toJS();
                this.injections.reduce('setStates', {
                    'data.form': fromJS({
                        ...initData,
                        fphm: res.fphm,
                        fpdm: res.fpdm,
                        sf03: res.fpdm,
                        sf04: res.fphm,
                
                    }),
                    'data.slList': fromJS(slList),
                    'data.jsfsList': fromJS(jsfsList),
                })
            }
            return false
        }
     
    }
    load = async () => {
        // 6779408971349114 增值税
        this.metaAction.sf('data.loading', true)
        const { kjxh, fpzlDm, nsqj, fplx, readOnly } = this.component.props
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
            nsrsbh = currentOrg.vatTaxpayerNum || '91441900065112839A', //东莞市松一自动化科技有限公司
            qyId = currentOrg.id || 7215202827592704,
            initData = {},
            minCount = this.metaAction.gf('data.other.minCount'),
            title = await this.getTitle(nsrxz, fplx, fpzlDm),
            option = {
                nsrxz: nsrxz,
                fplx,
                fpzlDm,
            },
            slRes = [],
            jsfsRes = [];
        if (kjxh) {
            let res
            if(this.component.props.justShow === true){
                let resdata= await this.webapi.invoices[fplx === 'jxfp' ? 'queryJxfpDto' : 'queryXxfpDto'](this.component.props.invArguments)
                if( fplx === 'jxfp'){
                    if(resdata.flag === true){
                        res = resdata.jxfp
                    }else {
                        const confirm = await this.metaAction.modal("error", {
                            content: <span>{resdata.msg}</span>,
                            width: 340,
                            okText:'确定',
                            mask:false
                        });
                        if(confirm){
                            this.component.props.closeModal()
                        }
                    }
                }else {
                    if(resdata.flag === true){
                       res = resdata.xxfp
                    }else {
                        const confirm = await this.metaAction.modal("error", {
                            content: <span>{resdata.msg}</span>,
                            width: 340,
                            okText:'确定',
                            mask:false
                        });
                        if(confirm){
                            this.component.props.closeModal()
                        }
                    }
                }
            }else {
                res = await this.webapi.invoices[fplx === 'jxfp' ? 'queryJxfp' : 'queryXxfp']({ kjxh })
            }
            if (res) {
                initData = res;
                if (res.mxDetailList instanceof Array) {
                    initData.mxDetailList = res.mxDetailList.map(m => ({ ...m, key: m.mxxh }))
                    if (fpzlDm === '07') {
                        initData.jsfsDm = res.mxDetailList[0].jsfsDm
                        initData.jzjtbz = res.mxDetailList[0].jzjtDm
                        delete initData.mxDetailList
                    } else if (res.mxDetailList.length < 5) {
                        let _mxxh = res.mxDetailList[res.mxDetailList.length - 1].mxxh;
                        while (res.mxDetailList.length < 5) {
                            _mxxh++;
                            res.mxDetailList.push({ mxxh: _mxxh })
                        }
                    }
                }
            }
        } else {
            let initInfo = await this.webapi.invoices[fplx === 'jxfp' ? 'initiateAddOfJxfp' : 'initiateAddOfXxfp']({ qyId, nsrsbh, fpzlDm,skssq:nsqj })
            if (initInfo) {
                initData = {
                    ...initInfo,
                    fplyLx: "2",
                }
            }
            if (fpzlDm === '07') {
                initData.hwlxDm = '0004'
                initData.jzjtbz = 'N'
                initData.fpztDm = '1'
            }
            if (fpzlDm === '99') {
                initData.mxDetailList = [{ mxxh: 0 }, { mxxh: 1 }, { mxxh: 2 }, { mxxh: 3 }, { mxxh: 4 }]
            }
        }
        if (fpzlDm === '07') {
            // 货物类型
            // let hwlxRes = await this.webapi.invoices.getHwlxcsList(option)
            // 税率
            slRes = await this.webapi.invoices.getSlvcsList(option)
            // 计税方式
            jsfsRes = await this.webapi.invoices.getJsfscsList(option)
        }

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
            'data.title': title,
            'data.cacheFplyLx': cacheFplyLx,
            'data.form': fromJS(form),
            'data.initData': fromJS(initData),
            'data.slList': fromJS(slRes || []),
            'data.jsfsList': fromJS(jsfsRes || []),
            'data.slListCache': fromJS(slRes || []),
            'data.jsfsListCache': fromJS(jsfsRes || []),
            'data.loading': false,
        })
    }

    getTitle = async (nsrxz, fplx, fpzlDm) => {
        if (!this.fpzlcsList) {
            this.fpzlcsList = await this.webapi.invoices.getFpzlcsList({ nsrxz, fplx })
        }
        return (this.fpzlcsList && this.fpzlcsList.find(f => f.fpzlDm === fpzlDm) || {}).fpzlMc
    }
    checkForm = () => {
        const { kjxh, fpzlDm, nsqj, fplx, readOnly } = this.component.props
        let form = this.metaAction.gf('data.form').toJS(),
            error = this.metaAction.gf('data.error').toJS(),
            flag = true,
            obj = {};
        error.mxDetailList = []
        if (fplx === 'xxfp' && fpzlDm === '07') {
            if (!form.gfmc) {
                error.gfmc = '购买方名称不能为空'
                flag = false
            }
        }
        if (fplx === 'jxfp' && fpzlDm === '07') {
            if (!form.xfmc) {
                error.xfmc = '销售方名称不能为空'
                flag = false
            }
        }
        if (fplx === 'xxfp' && fpzlDm === '07') {
            if (!form.gfsbh) {
                error.gfsbh = '单位代码/身份证不能为空'
                flag = false
            } else if (form.gfsbh && form.gfsbh.length < 15) {
                error.gfsbh = '单位代码/身份证长度最少15个字符，最多30个字符'
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
        }
        if (fplx === 'jxfp' && fpzlDm === '07') {
            if (!form.xfsbh) {
                error.xfsbh = '单位代码/身份证不能为空'
                flag = false
            } else if (form.xfsbh && form.xfsbh.length < 15) {
                error.xfsbh = '单位代码/身份证长度最少15个字符，最多30个字符'
                flag = false
            }
        }
        if (fpzlDm === '07') {
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
            if (!form.cllx) {
                error.cllx = '车辆类型不能为空'
                flag = false
            }
            if (!form.jshj) {
                error.jshj = '车价合计不能为空'
                flag = false
            }
        }
        if (fpzlDm === '99') {
            if (!form.kprq) {
                error.kprq = '开票日期不能为空'
                flag = false
            }
            if (form.mxDetailList && !form.mxDetailList.some(f => f.key > -1)) {
                flag = false
                error.mxDetailList[0] = {
                    hwmc: true,
                    je: true,
                }
            } else {
                form.mxDetailList && form.mxDetailList.forEach((item, index) => {
                    error.mxDetailList[index] = {}
                    if (item.key > -1) {
                        if (!item.hwmc) {
                            error.mxDetailList[index].hwmc = true
                            flag = false
                        }
                        if (item.je === undefined) {
                            error.mxDetailList[index].je = true
                            flag = false
                        }
                    }
                })
            }
        }

        obj = {
            'data.other.randomKey': Math.random(),
        }
        if (!flag) {
            obj['data.error'] = fromJS(error)
        } else if (form.mxDetailList) {
            form.mxDetailList = form.mxDetailList.filter(f => f.key > -1)
        }

        this.injections.reduce('setStates', obj)
        return flag ? form : false
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true || isNaN(Number(v))) return v
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }

    amountTotal = (path = 'je', t = true) => {
        let details = this.metaAction.gf('data.form.mxDetailList').toJS()
        let list = details.filter(f => f[path] !== undefined && f[path] !== null).map(item => Number(item[path]))
        let total = list[0] ? list.reduce((a, b) => a + b) : 0
        return total && parseFloat(total).toFixed(2) || (t ? 0 : undefined)
    }

    componentDidMount = () => {
        this.mounted = true;
        this.needReload = false;
        this.load();
    }
    componentWillUnmount = () => {
        this.mounted = false;
    }

    isReadOnly = () => {
        return this.component.props.readOnly || false
    }

    renderChildren = () => {
        // const { loading, title } = this.metaAction.gf('data').toJS();
        const { kjxh, fpzlDm, nsqj, fplx, readOnly } = this.component.props,
            currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS',
            comProps = {
                kjxh,
                fpzlDm,
                nsqj,
                fplx,
                readOnly,
                nsrxz,
                metaAction: this.metaAction,
            };
        if (fpzlDm === '07') {
            return <UsedCarSaleForm 
                        {...comProps}
                    />
        }
        if (fpzlDm === '99') {
            return <OtherForm 
                        {...comProps}
                    />
        }
        return null

    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}