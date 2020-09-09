import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
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
            this.component.props.setCancelLister(() => {
                // this.component.props.callback && this.component.props.callback()
                return true
            })
        }
        injections.reduce('init')
        this.pageInit()
    }
    pageInit = () => {
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            json = {}
        // 2000010001一般企业 2000010002 小规模企业
        if (currentOrg.swVatTaxpayer) {
            json['data.typeAction'] = currentOrg.swVatTaxpayer == 2000010002 ? 2 : 1
        }
        // 如果都是纳税检查调整发票，不允许修改计税方式
        const items = this.component.props.items || []
        if (items.every(f => f.fpzlDm == '08')) {
            json['data.taxWayDisable'] = true
            json['data.taxWaySmallDisable'] = true
        }
        this.metaAction.sfs(json)
    }
    // t:1即征即退 2:货物类型
    handerImmediateWithdrawalOrCargoType = (checked, t) => {
        if (checked) {
            const { typeAction } = this.metaAction.gf('data').toJS()
            // const { customType,items } = this.component.props.data || {}
            // customType:1,//客户类型，1:一般纳税人，2:小规模
            const items = this.component.props.items || []
            if (typeAction == 1) {
                // 一般纳税人
                // if (items.find(f => f.fpzlDm == '03')) {
                //     // 机动车销售发票，不允许修改即征即退标识
                //     this.metaAction.toast('error', '机动车销售发票，不能修改即征即退标识和货物类型，请先取消这类发票，再操作！')
                //     return;
                // }
                // if (items.find(f => f.fpzlDm == '07')) {
                //     // 机动车销售发票，不允许修改即征即退标识
                //     this.metaAction.toast('error', '二手车销售发票，不能修改即征即退标识和货物类型，请先取消这类发票，再操作！')
                //     return;
                // }
                // if (String(t) === '1' && items.find(f => f.fpzlDm == '08')) {
                //     // 纳税检查调整发票，不允许修改即征即退标识－2019.7.5
                //     this.metaAction.toast('error', '纳税检查调整发票，不能修改即征即退标识，请先取消这类发票，再操作！')
                //     return;
                // }
                if(String(t) === '2'&& items.find(f => f.fpzlDm == '07')){
                    this.metaAction.toast('error', '二手车销售发票，不能修改货物类型，请先取消这类发票，再操作！')
                    return;
                }
                if(String(t) === '2'&& items.find(f => f.fpzlDm == '03')){
                    this.metaAction.toast('error', '二手车销售发票，不能修改货物类型，请先取消这类发票，再操作！')
                    return;
                }
                
            }
            
            this.metaAction.sf(t == 1 ? 'data.immediateWithdrawal' : 'data.cargoType', checked)
        } else {
            
            this.metaAction.sf(t == 1 ? 'data.immediateWithdrawal' : 'data.cargoType', checked)
        }
    }
    // 计税方式
    handerTaxWay = (checked) => {
        if (checked) {
            const { typeAction } = this.metaAction.gf('data').toJS()
            // const { customType,items } = this.component.props.data || {}
            // customType:1,//客户类型，1:一般纳税人，2:小规模
            const items = this.component.props.items || []
            if (typeAction == 1) {
                // 一般纳税人
                if (items.find(f => f.zbslv == 1)) {
                    // 多税率的发票，不允许批量修改
                    this.metaAction.toast('error', '发票明细中存在多种税率，请选择相同税率的发票，再操作！')
                    return;
                }
                if ([...new Set(items.map(item => item.zbslv))].length > 1) {
                    // 勾选的发票中，如存在不同的税率
                    this.metaAction.toast('error', '发票明细中存在多种税率，请选择相同税率的发票，再操作！')
                    return;
                }
                if (items.find(f => f.fpzlDm == '01' || f.fpzlDm == '03' || f.fpzlDm == '07')) {
                    // 增值税专用发票和机动车销售发票，均属于专票，不能设置为免抵退或免税。选择的发票中包含此2类发票的，修改界面计税方式，只有“一般计税”和“简易征收”两种方式
                    this.metaAction.sfs({
                        'data.generalTaxation': true, //一般计税
                        'data.simpleExpropriation': true, //简易征收
                        'data.offsetFree': false, //免抵退
                        'data.dutyFree': false, //免税
                    })
                }
            }
            this.metaAction.sf('data.taxWay', checked)
        } else {
            this.metaAction.sf('data.taxWay', checked)
        }
    }
    // 计算方式单项
    handerTaxWayRadio = (value) => {
        // value 0:一般计税；1:简易征收；2:免抵退；3:免税
        // const { customType,items } = this.component.props.data || {}
        value = String(value)
        const items = this.component.props.items || []
        const taxRate = items[0].zbslv
        if (value == '1' && (taxRate == 0.17 || taxRate == 0.16 || taxRate == 0.13 || taxRate == 0.11 || taxRate == 0.10 || taxRate == 0.09)) {
            // 17%，16%，13%，11%，10%，9%税率的发票，只允许修改为一般计税或免抵退或免税
            this.metaAction.toast('error', `【${taxRate * 100}%】税率的发票，不能为【简易征收】方式！`)
            return;
        }
        if (value == '0' && (taxRate == 0.05 || taxRate == 0.04 || taxRate == 0.03 || taxRate == 0.02 || taxRate == 0.015)) {
            // 5%、4%、3%、2%、1.5%税率的发票，只允许修改为简易征收或免抵退或免税
            this.metaAction.toast('error', `【${taxRate * 100}%】税率的发票，不能为【一般计税】方式！`)
            return;
        }
        if ((value == '0' || value == '1') && (taxRate == 0)) {
            // 0税率的发票，只允许修改为免抵退或免税
            this.metaAction.toast('error', '【0】税率的发票，不能为【一般计税】和【简易征收】方式！')
            return;
        }

        this.metaAction.sf('data.taxWayRadio', value)

    }
    // 小规模－－－－－－－－－－－
    //计税方式 
    handerTaxWaySmall = (checked) => {
        if (checked) {
            const { typeAction } = this.metaAction.gf('data').toJS()
            // const { customType,items } = this.component.props.data || {}
            // customType:1,//客户类型，1:一般纳税人，2:小规模
            const items = this.component.props.items || []
            if (typeAction == 2) {
                if (items.find(f => f.zbslv == 1)) {
                    // 多税率的发票，不允许批量修改
                    this.metaAction.toast('error', '发票明细中存在多种税率，请选择相同税率的发票，再操作！')
                    return;
                }
                if ([...new Set(items.map(item => item.zbslv))].length > 1) {
                    // 勾选的发票中，如存在不同的税率
                    this.metaAction.toast('error', '发票明细中存在多种税率，请选择相同税率的发票，再操作！')
                    return;
                }
                // 小规模 01:增值税专用发票
                if (items.find(f => f.fpzlDm == '01' || f.fpzlDm == '07')) {
                    // 增值税专用发票，税率只能是5%和3%，均为简易征收，不能设置为免税，因此选择的发票中包含此增值税专票发票的，修改界面计税方式，只有 “简易征收”一种方式
                    this.metaAction.sf('data.dutyFreeSmall', false)
                }
             
            }
            this.metaAction.sf('data.taxWaySmall', checked)
        } else {
            this.metaAction.sf('data.taxWaySmall', checked)
        }
    }
    onOk = async () => {
        const res = await this.batchUpdateXxfp()
        return res && { needReload: true } || false
    }
    batchUpdateXxfp = async () => {
        const data = this.metaAction.gf('data').toJS()
        let currentOrg = this.metaAction.context.get("currentOrg") || {},
            // periodDate = currentOrg.periodDate || moment().format('YYYYMM'),
            skssq = this.component.props.nsqj, //moment(periodDate).subtract(1, 'month').format('YYYYMM'),
            nsrsbh = currentOrg.vatTaxpayerNum,
            kjxhList = this.component.props.kjxhList || [];
        let option = {
            "qyId": currentOrg.id || "1", // 企业Id
            "kjxhList": kjxhList,
            skssq,
            nsrsbh,
            newJzjtDm:data.immediateWithdrawalRadio
            // "newJsfsDm":"1",        // 发票明细：计税方式代码
            // "newHwlxDm":"1",        // 发票明细：货物类型代码
            // "jzjtbz":"Y",           // 即征即退标志：Y:是，N：否
            // newJzjtDm: "0"
        }
        if (data.typeAction == 1) {
            if (data.taxWay) {
                if (data.taxWayRadio === undefined) {
                    this.metaAction.toast('warning', '请选择具体的计税方式')
                    return
                }
                option.newJsfsDm = data.taxWayRadio
            }
            if (data.cargoType) {
                if (data.cargoTypeRadio === undefined) {
                    this.metaAction.toast('warning', '请选择具体的货物类型')
                    return
                }
                option.newHwlxDm = data.cargoTypeRadio
            }
            if (data.immediateWithdrawal) {
                if (data.immediateWithdrawalRadio === undefined) {
                    this.metaAction.toast('warning', '请选择具体的即征即退标识')
                    return
                }
                option.newJzjtDm = data.immediateWithdrawalRadio
            }
            if (!data.taxWay && !data.immediateWithdrawal && !data.cargoType) {
                this.metaAction.toast('warning', '请勾选要修改的选项')
                return
            }
        } else {
            if (data.taxWaySmall) {
                if (data.taxWaySmallRadio === undefined ) {
                    this.metaAction.toast('warning', '请选择具体的计税方式')
                    return
                }
                option.newJsfsDm = data.taxWaySmallRadio
            }
            if (data.cargoTypeSmall) {
                if (data.cargoTypeSmallRadio === undefined) {
                    this.metaAction.toast('warning', '请选择具体的货物类型')
                    return
                }
                option.newHwlxDm = data.cargoTypeSmallRadio
            }
            if (!data.taxWaySmall && !data.cargoTypeSmall && !data.immediateWithdrawal) {
                this.metaAction.toast('warning', '请勾选要修改的选项')
                return
            }
        }
        const response = await this.webapi.invoices.batchUpdateXxfp(option)
        // console.log('batchUpdateXxfp:', response);
        if (response == null) {
            this.metaAction.toast('success', '修改成功')
            // this.component.props.callback && this.component.props.callback()
            return true
        }
        return false
    }
    test = (e)=>{
        const items = this.component.props.items || []
        // 小规模纳税人
        if(e){
            if (items.find(f => f.fpzlDm == '07')) {
                // 机动车销售发票，不允许修改即征即退标识
                this.metaAction.toast('error', '二手车销售发票，不能修改货物类型，请先取消这类发票，再操作！')
                return ;
            }
            if (items.find(f => f.fpzlDm == '03')) {
                // 机动车销售发票，不允许修改即征即退标识
                this.metaAction.toast('error', '机动车销售发票，不能修改货物类型，请先取消这类发票，再操作！')
                return;
            }
            console.log(e);
            
        }
        this.metaAction.sf('data.cargoTypeSmall',e)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}