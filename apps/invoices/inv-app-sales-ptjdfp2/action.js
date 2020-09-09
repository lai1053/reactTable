import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { number } from 'edf-utils'
import { fromJS } from 'immutable'
import moment from 'moment'
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const getBlackDetail = () => {
    return {
        spbm: undefined, //编码
        ggxh: undefined, //规格
        dw: undefined, //单位
        sl: undefined, //数量
        dj: undefined, //单价
        je: undefined, //金额
        slv: undefined, //税率
        se: undefined, // 税额
        hwlxDm: undefined, // 货物类型
        jsfsDm: undefined, // 计税方式
    }
}

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
            this.component.props.setCancelLister(() => {
                if (this.needReload)
                    return { needReload: true }
                // component.props.callback && component.props.callback()
                return true
            })
        }
        injections.reduce('init')
        
    }
    componentDidMount = () => {
        this.needReload = false;
        this.mounted = true;
        this.load(this.component.props.kjxh);
    }
    
    componentWillUnmount = () => {
        this.mounted = false;
    }
    
    load = async (kjxh) => {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS', // 2000010001一般企业 2000010002 小规模企业
            nsrsbh = currentOrg.vatTaxpayerNum || '91441300303888019Q',
            qyId = currentOrg.id || 1,
            initData = {},
            editInitData = { other: { jzjtbzDisable: false } },
            minCount = this.metaAction.gf('data.other.minCount'),
            option = {
                nsrxz: nsrxz,
                fplx: 'xxfp',
                fpzlDm: '05',
            };
        if (kjxh) {
            let res = await this.webapi.invoices.queryXxfp({ kjxh })
            if (res) {
                res.kprq = res.kprq ? moment(res.kprq).format('YYYY-MM-DD') : null;
                while (res.mxDetailList.length < minCount) {
                    res.mxDetailList.push({})
                }
                editInitData = this.getEditInfo(res)
                initData = {
                    ...res,
                    jzjtbz: editInitData.jzjtbz,
                    details: res.mxDetailList,
                }
            }
        } else {
            let initInfo = await this.webapi.invoices.initiateAddOfXxfp({ qyId, nsrsbh,fpzlDm:'05',skssq:this.component.props.nsqj })
            if (initInfo) {
                initData = {
                    details: [{}, {}, {}, {}],
                    xfmc: initInfo.xfmc,
                    xfsbh: initInfo.xfsbh,
                    xfdzdh: initInfo.xfdzdh,
                    xfyhzh: initInfo.xfyhzh,
                    fphm:initInfo.fphm,
                    fphmVisible:initInfo.fphm ? true :false,
                    fplyLx: "2",
                    fpztDm: '1',
                }
            }
        }
        // 货物类型
        let hwlxRes = await this.webapi.invoices.getHwlxcsList(option)
        // 税率
        let slRes = await this.webapi.invoices.getSlvcsList(option)
        // 计税方式
        let jsfsRes = await this.webapi.invoices.getJsfscsList(option)
        let defaultItem = getBlackDetail();
        // 商品信息
        //const spbmRes = await this.webapi.invoices.getSpbmList()
        
        if (!this.mounted) return
        let form = this.metaAction.gf('data.form').toJS();
        // let tempList = initData.details || [blackDetail, blackDetail, blackDetail, blackDetail];
        let details = initData.details && initData.details.map(item => {
            return {
                ...defaultItem,
                ...item,
                hwlxList: fromJS(hwlxRes || []),
                slList: fromJS(slRes || []),
                jsfsList: fromJS(jsfsRes || []),
            }
        }) || [{}, {}, {}, {}];
        form = {
            ...form,
            ...initData,
            details,
        }
        if(form.fplyLx === '3'){
            form.fplyLx = '2'
        }
        let cacheFplyLx = form.fplyLx;
        if (form.fplyLx != 2 && form.fplyLx != 1) {
            // 将 4远程提取 5票税宝读取 设置为 1读取
            cacheFplyLx = form.fplyLx;
            form.fplyLx = '1'
        }
        this.injections.reduce('setStates', {
            'data.form': fromJS(form),
            'data.cacheFplyLx': cacheFplyLx,
            'data.error.details': fromJS([{}, {}, {}, {}]),
            'data.hwlxList': fromJS(hwlxRes || []),
            'data.slList': fromJS(slRes || []),
            'data.jsfsList': fromJS(jsfsRes || []),
           // 'data.spbmList': fromJS((spbmRes || []).map(item => ({ ...item, key: item.spbm, title: item.spmc }))),
            'data.loading': false,
            'data.other.jzjtbzDisable': editInitData.other.jzjtbzDisable,
        })
    }
    onOk = async () => {
        const params = this.checkForm();
        if (!params) {
            this.metaAction.toast('error', '红框内必须有值')
            return false;
        }
        let tipFlag = false
        let mxDetailList = params.details
        
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
        this.injections.reduce('setState', 'data.loading', true)
        const currentOrg = this.metaAction.context.get("currentOrg") || {};
        let kjxh = this.component.props.kjxh,
            apiFunName = kjxh ? 'updateXxfp' : 'addXxfp',
            amountTotal = Number(this.amountTotal(true)),
            taxAmountTotal = Number(this.taxAmountTotal(true)),
            jshj = (amountTotal + taxAmountTotal).toFixed(2);
        if (!params.kjxh) {
            params.skssq = params.kprq.replace('-', '').slice(0, 6)
        }
        params.fpzlDm = '05' //发票种类代码
        params.hjje = amountTotal.toFixed(2) //合计金额
        params.hjse = taxAmountTotal.toFixed(2)
        params.jshj = jshj //价税合计
        params.jshjDx = this.moneySmalltoBig(jshj, 2) //价税合计大写
        // params.fplyLx = "2" //  发票来源类型，1：读取，2：录入，3：导入
        params.sf01 = 'Y' //Y：专票，N：普票
        params.mxDetailList = params.details.filter(f => f.key > 0 || f.mxxh > -1).map((item, index) => {
            delete item.hwlxList
            delete item.slList
            delete item.jsfsList
            this.listValueEmptyChange(item)
            return {
                ...item,
                mxxh: item.mxxh || index,
            }
        })
        delete params.details
        const cacheFplyLx = this.metaAction.gf('data.cacheFplyLx');
        if (cacheFplyLx > -1 && cacheFplyLx != params.fplyLx) {
            params.fplyLx = cacheFplyLx
        }
        let res = await this.webapi.invoices[apiFunName](params);
        if (!this.mounted) return
        this.injections.reduce('setState', 'data.loading', false)
        if (kjxh && res === null) {
            this.needReload = true
            this.metaAction.toast('success', '修改成功')
        } else if (res) {
            this.needReload = true
            this.metaAction.toast('success', '新增成功')
            let blackDetail = this.newRowData()
            this.injections.reduce('setState', 'data.form', fromJS({
                xfmc: params.xfmc,
                xfsbh: params.xfsbh,
                xfdzdh: params.xfdzdh,
                xfyhzh: params.xfyhzh,
                fphm: res.fphm,
                fpdm: res.fpdm,
                jzjtbz: 'N',
                fpztDm: '1',
                fplyLx: '2',
                // kprq: moment().format('YYYY-MM-DD'),
                details: [blackDetail, blackDetail, blackDetail, blackDetail]
            }))
        }
        return false
    }
    getEditInfo = (data) => {
        let jsfsDm = (data.mxDetailList || []).some(f => f.jsfsDm === '2' || f.jsfsDm === '3')
        if (data.jzjtbz === 'Y' && jsfsDm) {
            // 只有批量修改能将 即征＝是的时候，计税方式设置为免税或免抵退，因此，可以不做任何处理
            return { jzjtbz: data.jzjtbz, other: { jzjtbzDisable: false } }
        } else if (jsfsDm) {
            return { jzjtbz: 'N', other: { jzjtbzDisable: true } }
        }
        return { jzjtbz: data.jzjtbz, other: { jzjtbzDisable: false } }
    }
    listValueEmptyChange = (item) => {
        Object.keys(item).forEach(key => {
            if (item[key] === undefined) {
                item[key] = null
            }
        })
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
    /**
     * 单元格change事件
     * @Author   weiyang.qiu
     * @DateTime 2019-05-20T20:34:36+0800
     * @param    {int   }                 index 行索引
     * @param    {string}                 field 单元格字段名
     * @param    {object}                 value 字段值
     * @return   {void  }                       无返回
     */
    onCellChange = (index, field, value) => {
        index = parseInt(index)
        let json = null,
            details = this.metaAction.gf('data.form.details').toJS(),
            item = details ? details[index] : {},
            quantity = Number(item.sl), //数量
            price = item.dj, //单价
            amount = Number(item.je), //金额
            taxRate = Number(item.slv), //税率
            taxAmount = Number(item.se), // 税额
            jsfsDm = item.jsfsDm, //计税方式
            temp = null,
            key = item.key || index + 1,
            // kjxh = this.component.props.kjxh,
            fplyLx = this.metaAction.gf('data.form.fplyLx'); //fplyLx 发票来源类型，1：读取，2：录入，3：导入
        switch (field) {
            case 'ggxh': //规格
            case 'dw': //单位
            case 'sl': //数量
                json = {
                    [`data.form.details.${index}.sl`]: !Number(value) ? undefined : value,
                }
            case 'price': //单价
            case 'je': //金额
            case 'se': // 税额
            case 'hwlxDm': // 货物类型
                json = {
                    [`data.form.details.${index}.${field}`]: value,
                    [`data.error.details.${index}.${field}`]: '',
                }
                break
            case 'slv': //税率
                if (item.slv !== Number(value)) {
                    json = {
                        [`data.form.details.${index}.slv`]: value > -1 ? Number(value) : undefined,
                        [`data.form.details.${index}.se`]: value > -1 && !isNaN(amount) ? this.calcSe(amount, value) : undefined,
                        [`data.form.details.${index}.jsfsDm`]: this.slChangeJsfs(value, jsfsDm),
                        [`data.error.details.${index}.slv`]: '',
                        [`data.error.details.${index}.se`]: '',
                        [`data.error.details.${index}.jsfsDm`]: '',
                    }
                }
                break
            case 'jsfsDm': // 计税方式
                if (item.jsfsDm !== value) {
                    json = {
                        [`data.form.details.${index}.jsfsDm`]: value,
                        [`data.error.details.${index}.jsfsDm`]: '',
                    }
                    if (fplyLx == 2) {
                        // 2：录入
                        temp = this.jsfsChangeSl(value)
                         if(temp.toJS().length === 1){
                             taxRate = 0
                         }
                        let _slv = temp.toJS().find(f => f.slv == taxRate) ? taxRate : undefined;
                        json[`data.form.details.${index}.slList`] = temp
                        json[`data.form.details.${index}.slv`] = _slv
                        json[`data.form.details.${index}.se`] = !isNaN(amount) && _slv > -1 ? this.calcSe(amount, _slv) : undefined
                        json[`data.error.details.${index}.slv`] = ''
                        json[`data.error.details.${index}.se`] = ''
                    }
                }
                break
        }
        if (json) {
            json['data.editRow'] = index
            json[`data.form.details.${index}.key`] = key
            this.metaAction.sfs(json)
        }
    }
    inputBlur = (index, field, v) => {
        index = parseInt(index)
        let json = null,
            details = this.metaAction.gf('data.form.details').toJS(),
            item = details ? details[index] : {},
            quantity = Number(item.sl), //数量
            price = item.dj, //单价
            amount = Number(item.je), //金额
            taxRate = item.slv, //税率
            taxAmount = Number(item.se), // 税额
            temp = null
        switch (field) {
            case 'sl': //数量
                if (!isNaN(quantity) && quantity !== 0 && !isNaN(amount)) {
                    temp = amount / quantity
                } else {
                    temp = undefined
                }
                json = {
                    [`data.form.details.${index}.sl`]: !quantity ? undefined : quantity,
                    [`data.form.details.${index}.dj`]: temp !== undefined ? parseFloat(temp).toFixed(4) : undefined,
                }
                break
            case 'je': //金额
                if (!isNaN(amount) && !isNaN(quantity) && quantity !== 0) {
                    temp = (amount / quantity)
                } else {
                    temp = undefined
                }
                json = {
                    [`data.form.details.${index}.je`]: !isNaN(amount) ? parseFloat(amount).toFixed(2) : undefined,
                    [`data.form.details.${index}.dj`]: temp !== undefined ? parseFloat(temp).toFixed(4) : undefined,
                    [`data.form.details.${index}.se`]: this.calcSe(amount, taxRate),
                }
                break
            case 'se': // 税额
                if (!isNaN(taxAmount)) {
                    json = {
                        [`data.form.details.${index}.se`]: parseFloat(taxAmount).toFixed(2),
                    }
                }
                break
        }
        if (json) {
            this.metaAction.sfs(json)
        }
    }
    
    newRowData = () => {
        let blackDetail = getBlackDetail()
        blackDetail.hwlxList = this.metaAction.gf('data.hwlxList').toJS()
        blackDetail.slList = this.metaAction.gf('data.slList').toJS()
        blackDetail.jsfsList = this.metaAction.gf('data.jsfsList').toJS()
        return blackDetail
    }
    
    addRow = (ps) => {
        if (this.notAllowEdit()) {
            return;
        }
        let details = this.metaAction.gf('data.form.details').toJS(),
            error = this.metaAction.gf('data.error.details').toJS(),
            index = ps.rowIndex + 1,
            item = this.newRowData()
        details.splice(index, 0, item)
        error.splice(index, 0, {})
        this.metaAction.sfs({
            'data.form.details': fromJS(details),
            'data.error.details': fromJS(error),
            'data.editRow': -1,
        })
    }
    delRow = (ps) => {
        if (this.notAllowEdit()) {
            return;
        }
        let details = this.metaAction.gf('data.form.details').toJS()
        let error = this.metaAction.gf('data.error.details').toJS()
        let index = ps.rowIndex
        let item = this.newRowData()
        if (details[index]) {
            details.splice(index, 1)
            error.splice(index, 1)
            if (details.length < 4) {
                details.push(item)
                error.push({})
            }
        }
        this.metaAction.sfs({
            'data.form.details': fromJS(details),
            'data.error.details': fromJS(error),
            'data.editRow': -1,
        })
    }
    moneySmalltoBig = (v) => number.moneySmalltoBig(v, 2)
    
    // 计税方式修改
    jsfsChangeSl = (jsfs) => {
        const nsrxz = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS'
        // 2000010001一般企业 2000010002 小规模企业
        let slList = this.metaAction.gf('data.slList').toJS(),
            slListNew = [];
        switch (jsfs) {
            case "0":
                //一般计税
                // 当计税方式选中“一般计税”，税率选择项为
                // 一般纳税人：“17%，16%，13%，11%，10%，9%，6%”
                if (nsrxz == 'YBNSRZZS') {
                    slListNew = slList.filter(f => f.slv <= 0.17 && f.slv >= 0.06)
                }
                break
            case "1":
                //简易征收
                if (nsrxz == 'YBNSRZZS') {
                    // “6%，5%，4%，3%，2%，1.5%”
                    slListNew = slList.filter(f => f.slv <= 0.06 && f.slv >= 0.015)
                } else {
                    // 5%、3%
                    slListNew = slList.filter(f => f.slv == 0.05 || f.slv == 0.03 || f.slv == 0.01)
                }
                break
            case "2":
                //免抵退
                slListNew = slList.filter(f => f.slv == 0)
                break
            case "3":
                //免税
                slListNew = slList.filter(f => f.slv == 0)
                break
            case undefined:
                //空白
                if (nsrxz == 'YBNSRZZS') {
                    slListNew = slList.filter(f => f.slv >= 0)
                } else {
                    slListNew = slList.filter(f =>f.slv >= 0 || f.slv == 0.05 || f.slv == 0.03)
                }
                break
        }
        return fromJS(slListNew)
        
    }
    // 税率选择
    slChangeJsfs = (sl, jsfs) => {
        let v = parseFloat(sl)
        const nsrxz = this.metaAction.context.get("currentOrg") && this.metaAction.context.get("currentOrg").swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS'
        // 2000010001一般企业 2000010002 小规模企业
        // "0":一般计税；"1":简易征收；"2":免抵退；"3":免税
        // let jsfs = undefined
        if (nsrxz == 'YBNSRZZS') {
            if (v <= 0.17 && v >= 0.09) {
                // 一般纳税人：当税率选择“17%，16%，13%，11%，10%，9%”其中一种时 计税方式自动选中“一般计税”
                jsfs = "0"
            }
            if (v <= 0.05 && v >= 0.015) {
                // 一般纳税人：当税率选择“5%，4%，3%，2%，1.5%”其中一种时 计税方式自动选中“简易征收”
                jsfs = "1"
            }
            if (v == 0) {
                // 一般纳税人：当税率选择“0%”时，计税方式为免税
                let data = this.metaAction.gf('data').toJS()
                let details = data.form.details
                jsfs = "3"
            }
            if (v == 0.06) {
                // 一般纳税人：当税率选择“6%”时，计税方式为空白
                jsfs = undefined
            }
        } else {
            if (v == 0.05 || v == 0.03) {
                // 小规模纳税人：当税率选择“5%、3%”其中一种时 计税方式自动选中“简易征收”
                jsfs = '1'
            }
            if (v == 0) {
                // 一般纳税人：当税率选择“0%”时，计税方式为免税
                jsfs = "3"
            }
        }
        return jsfs
    }
    // 根据商品信息计算货物类型
    calcHwlx = (spbm) => {
        if (!spbm) return undefined
        let hwlx = undefined;
        switch (spbm.slice(0, 1)) {
            case '1':
                hwlx = '0004'
                break
            case '2':
                hwlx = '0001'
                break
            case '4':
            case '6':
                hwlx = '0005'
                break
            case '5':
                hwlx = '0003'
                break
            default:
                hwlx = '0002'
                break
        }
        return hwlx
    }
    // 根据商品信息计算计税方法
    calcJsfs = (slv) => {
        if (isNaN(Number(slv))) {
            return undefined
        }
        if (slv == 0) {
            return '3'
        }
        if (slv >= 0.09 && slv <= 0.17) {
            return '0'
        }
        if (slv == 0.06) {
            return undefined
        }
        return '1'
    }
    // 计算税额
    calcSe = (je, sl) => {
        je = parseFloat(je)
        sl = parseFloat(sl)
        if (!isNaN(je) && sl > -1) {
            return (je * sl).toFixed(2)
        }
        return undefined
    }
    calcTotal = (field, t) => {
        
        let details = this.metaAction.gf('data.form.details').toJS()
        let list = details.filter(f => f[field] !== undefined && f[field] !== null).map(item => Number(item[field]))
        let total = !isNaN(list[0]) ? list.reduce((a, b) => a + b) : undefined
        return !isNaN(total) ? parseFloat(total).toFixed(2) : undefined
    }
    amountTotal = (t = true) => {
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        if (fplyLx === '1') {
            return `${isNaN(data.hjje)?'':data.hjje}`
        }
        return this.calcTotal('je', t)
    }
    taxAmountTotal = (t = true) => {
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        if (fplyLx === '1') {
            return `${isNaN(data.hjse)?'':data.hjse}`
        }
        return this.calcTotal('se', t)
    }
    moneyToBig = (t) => {
        
        let fplyLx = this.metaAction.gf('data.form.fplyLx');
        let data = this.metaAction.gf('data.form').toJS();
        if (fplyLx === '1' && t !== false) {
            return `${data.jshjDx}`
        } else if (fplyLx === '1' && t !== true) {
            return `${data.jshj}`
        }
        let a = this.amountTotal(true),
            b = this.taxAmountTotal(true),
            c = Number(a) + Number(b)
        if (t) {
            return c && this.moneySmalltoBig(c.toFixed(2)) || undefined
        }
        return c && parseFloat(c).toFixed(2) || undefined
    }
    
    checkForm = () => {
        let form = this.metaAction.gf('data.form').toJS(),
            error = this.metaAction.gf('data.error').toJS(),
            flag = true,
            obj = {};
        error.details = []
        if (!form.kprq) {
            error.kprq = '开票日期不能为空'
            flag = false
        }
        if(Number(form.fpfs)< 1  || form.fpfs === ''){
            error.fpfs = '开票张数不能小于1'
            flag = false
        }
        if (!form.details.some(f => f.key || f.mxxh > -1)) {
            flag = false
            error.details[0] = {
                je: true,
                se: true,
                slv: true,
                hwlxDm: true,
                jsfsDm: true,
            }
        } else {
            form.details.forEach((item, index) => {
                error.details[index] = {}
                if (item.key) {
                    if (item.je === undefined) {
                        error.details[index].je = true
                        flag = false
                    }
                    if (item.se === undefined) {
                        error.details[index].se = true
                        flag = false
                    }
                    if (item.slv === undefined) {
                        error.details[index].slv = true
                        flag = false
                    }
                    if (item.hwlxDm === undefined) {
                        error.details[index].hwlxDm = true
                        flag = false
                    }
                    if (item.jsfsDm === undefined) {
                        error.details[index].jsfsDm = true
                        flag = false
                    }
                }
            })
            
        }
        obj = {
            'data.other.randomKey': Math.random(),
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
    quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
        if (quantity !== undefined && quantity !== null) {
            if (autoDecimals && quantity) {
                let [a, b] = String(quantity).split('.');
                decimals = Math.max(decimals, b !== undefined && b.length || 0)
            }
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
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