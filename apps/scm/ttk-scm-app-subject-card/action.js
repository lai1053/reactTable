import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon } from 'edf-component'
import config from './config'
import { Tree } from 'edf-component'
import { FormDecorator } from 'edf-component'
import extend from './extend'
import moment from 'moment'
import utils from 'edf-utils'
import { Map, fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
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
        injections.reduce('init')

        this.load()
    }

    load = async () => { 
        if(this.component.props.aaa == 'sa') {
            let param = {}
            let accountEnableDto = {}
            accountEnableDto.entranceFlag = 'delivery'
            param.accountEnableDto = accountEnableDto

            let res = await this.webapi.dateCard.queryAccountEnable(param)
            let customer = await this.webapi.dateCard.queryAccountByNameAutomatic(["应收账款", "预收账款"])
            
            this.metaAction.sfs({
                'data.other.sales': true,
                'data.other.customer': fromJS(customer),
                'data.form.entranceFlag': 'delivery'
            })
            if (res) this.injections.reduce('load', res)
        }else if(this.component.props.aaa == 'pu') {
            let param = {}
            let accountEnableDto = {}
            accountEnableDto.entranceFlag = 'arrival'
            param.accountEnableDto = accountEnableDto

            let res = await this.webapi.dateCard.queryAccountEnable(param)
            let supplier = await this.webapi.dateCard.queryAccountByNameAutomatic(["应付账款", "预付账款", "其他应收款", "其他应付款"])

            this.metaAction.sfs({
                'data.other.sales': false,
                'data.other.supplier': fromJS(supplier),
                'data.form.entranceFlag': 'arrival'
            })
            if (res) this.injections.reduce('load', res)
        }

        

        if(this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
            let newrevenueAccountClass = [{
                value: 1,
                label: '是（例：500101 主营业务收入-销售收入）'
            },{
                value: 0,
                label: '否'
            }]
            let newsaleAccountClass = [{
                value: 1,
                label: '是（例：540101 主营业务成本-销售成本）'
            },{
                value: 0,
                label: '否'
            }]
            this.metaAction.sfs({
                'data.other.revenueAccountClass': newrevenueAccountClass,
                'data.other.saleAccountClass': newsaleAccountClass
            })
        } 
    }

    checkBoxChange = (path, v) => {
        if(path == 'data.form.currentAccount' && v == 1) {
            this.metaAction.sf('data.other.flag', true) 
        }else if(path == 'data.form.currentAccount' && v == 0) {
            this.metaAction.sf('data.other.flag', false) 

            if (this.component.props.aaa == 'pu') {
                this.metaAction.sfs({
                    'data.achivalRuleDto.supplierAccountSet': 0,
                    'data.other.supplierAccountSetVisible': true,
                    'data.achivalRuleDto.supplierUpperAccount': null
                })
            } else if (this.component.props.aaa == 'sa') {
                this.metaAction.sfs({
                    'data.achivalRuleDto.accountSet': 0,
                    'data.other.accountSetVisible': true,
                    'data.achivalRuleDto.customerUpperAccount': null
                })
            }
        }
        this.metaAction.sf(path, v)
    }

    settlementChange = (name,v) => {
        if(v.target.checked) {
            if(name == 'data.form.customer') {
                this.metaAction.sfs({
                    'data.achivalRuleDto.accountSet': 1,
                    'data.other.accountSetVisible': false
                })
            }else if(name == 'data.form.supplier') {
                this.metaAction.sfs({
                    'data.achivalRuleDto.supplierAccountSet': 1,
                    'data.other.supplierAccountSetVisible': false
                })
            }
        }else {
            if(name == 'data.form.customer') {
                this.metaAction.sf('data.achivalRuleDto.accountSet', 0) 
                this.metaAction.sfs({
                    'data.achivalRuleDto.accountSet': 0,
                    'data.other.accountSetVisible': true,
                    'data.achivalRuleDto.customerUpperAccount': null
                })
            }else if(name == 'data.form.supplier') {
                this.metaAction.sfs({
                    'data.achivalRuleDto.supplierAccountSet': 0,
                    'data.other.supplierAccountSetVisible': true,
                    'data.achivalRuleDto.supplierUpperAccount': null
                })
            }
        }
    }

    fieldChange = (name,value) => {
        if(name == 'data.form.customer') {
            this.metaAction.sf('data.achivalRuleDto.customerUpperAccount', value) 
        }else if(name == 'data.form.supplier') {
            this.metaAction.sf('data.achivalRuleDto.supplierUpperAccount', value) 
        }
    }

    //确定
    save = async () => {
        let form = this.metaAction.gf('data.form').toJS()
        let achivalRuleDto = this.metaAction.gf('data.achivalRuleDto').toJS()

        if(this.component.props.aaa == 'sa') {
            if (form.currentAccount == undefined) {
                this.metaAction.toast('error', '往来科目未确认是否启用明细科目')
                return false
            } else if (form.revenueAccount == undefined) {
                this.metaAction.toast('error', '收入科目未确认是否启用明细科目')
                return false
            }else if (achivalRuleDto.accountSet == 1 && form.currentAccount == 1) {
                if(achivalRuleDto.customerUpperAccount == null) {
                    this.metaAction.toast('error', '请选择上级科目')
                    return false
                }
            }
        }

        if(this.component.props.aaa == 'pu') {
            if (form.currentAccount == undefined) {
                this.metaAction.toast('error', '往来科目未确认是否启用明细科目')
                return false
            }else if (form.inventoryAccount == undefined) {
                this.metaAction.toast('error', '存货科目未确认是否启用明细科目')
                return false
            }else if (achivalRuleDto.supplierAccountSet == 1 && form.currentAccount == 1) {
                if(achivalRuleDto.supplierUpperAccount == null) {
                    this.metaAction.toast('error', '请选择上级科目')
                    return false
                }
            }
            // else if (form.saleAccount == undefined) {
            //     this.metaAction.toast('error', '销售成本科目未确认是否启用明细科目')
            //     return false
            // }
        }
        let param = {}
        let accountEnableDto = {}
        accountEnableDto = form
        param.accountEnableDto = accountEnableDto
        param.achivalRuleDto = achivalRuleDto
        
        let create = await this.webapi.dateCard.create(param)
        if(create) {
             this.component.props.closeModal(create);
        }
    }

    // 关闭弹框和页面
    onCancel = () => {
        // console.log('onCancel')
    }

    moreClick = async () => {
		let moreInfo = this.metaAction.gf('data.other.moreInfo')
		if (moreInfo !== undefined) {
            this.metaAction.sf('data.other.moreInfo', !moreInfo)
        }
	}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret

}