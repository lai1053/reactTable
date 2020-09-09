import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {fromJS} from 'immutable'
import config from './config'
import {FormDecorator} from 'edf-component'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        this.component.props.setOkListener && this.component.props.setOkListener(this.onOk)
        this.clickStatus = false
        injections.reduce('init')
        this.load()
        let org = this.metaAction.context.get('currentOrg') || {}
        this.metaAction.sf('data.vatTaxpayer', org.vatTaxpayer)
        this.metaAction.sf('data.form.sbbDm', org.vatTaxpayer == '2000010001' ? 'ZZSYBNSRSB':'ZZSXGMSB')
    }

    load = async () => {
        await this.findEnumList()
        if (this.component.props.taxTypeId) {
            this.metaAction.sf('data.other.isDisableTaxType',true)
            let option = {};
            option.id = this.component.props.taxTypeId;
            option.sbbDm = this.component.props.taxTypename;
            let response = await this.webapi.tax.query(option);
            let res = response[0];
      
            //是否禁用期限
            let TaxTimeType = res.NSQXDM == '10' ? 1 : 0
            this.metaAction.sf('data.other.TaxTimeType',TaxTimeType)
       
            this.injections.reduce('load', res) 
        }
    }

    //获取枚举属性
    findEnumList = async () => {
        //证件类型：200031；城建税类型：200032；企业类型：200033；预缴方式：200034；纳税期限：200022；税种：200035
        let res = await this.webapi.tax.findEnumList({enumIdList: [200031, 200032, 200033, 200034, 200022, 200035]});
        let vatTaxpayer =  this.metaAction.gf('data.vatTaxpayer');
        let durings = res['200022'],taxTypes = res['200035'];
        let bsxldms = await this.webapi.tax.queryReportSettingCode({ isEnabled: "1" })
        let rules = await this.webapi.tax.kjzzQueryKjzz({ })
        durings = durings.filter( item => {
            return (['年','月','季'].includes(item.name))
        })
        let _durings = durings.filter( item => {
            return (['月','季'].includes(item.name))
        })
        taxTypes = taxTypes.filter( item => {
            return (item.code != (vatTaxpayer =='2000010001' ? 'ZZSXGMSB': 'ZZSYBNSRSB') && item.code != (vatTaxpayer =='2000010001' ? 'CWBBXQYSB': 'CWBBYBQYSB'))
        })
        bsxldms = bsxldms.filter(item =>{
            return (item.reportingCategoryCode == 'ZL1001003' || item.reportingCategoryCode == 'ZL1001001')
        })
        this.metaAction.sfs({
            'data.other.types': fromJS(bsxldms),
            'data.other.rules': fromJS(rules)
        })
        res['200035'] = taxTypes;
        res['200022'] = durings;
        res['200022_1'] = _durings; 
        res && this.metaAction.sf('data.enumIdList', fromJS(res))
    }

    selectOption = (key) => {
        const enumIdList = this.metaAction.gf('data.enumIdList').toJS()
        return enumIdList[key].map(d => <Option title={d.name} key={d.id} value={d.id} style={{
            'font-size': '12px',
            'height': '36px',
            'line-height': '26px'
        }}>{d.name}</Option>)
    }
    selectOptionCode = (key) => {
        const enumIdList = this.metaAction.gf('data.enumIdList').toJS();
        let isDisableTaxType =  this.metaAction.gf('data.other.isDisableTaxType'),
        TaxTimeType = this.metaAction.gf('data.other.TaxTimeType');
        if(isDisableTaxType && TaxTimeType === 0 && key == '200022' ) key = '200022_1'
        return enumIdList[key].map(d => <Option title={d.name} key={d.code} value={d.code} style={{
            'font-size': '12px',
            'height': '36px',
            'line-height': '26px'
        }}>{d.name}</Option>)
    }

    taxType = (sbbDm) => {
        console.log(sbbDm)
        let NSQXDM = this.metaAction.gf('data.form.NSQXDM'),
            option = {
                sbbDm,
                NSQXDM,
                isJCKQY: false,
                isJJDJ: false,
                isCEKC: false,
                isGXJSQY: false,
                isKJXZXQY: false,
                isJSRGYNSS: false,
                isGJXZHJZHY: false,
                isCZXFZFZ:false,
                isGGY:false,
                isYLY:false,
                isJCLB:true,
                
            }
        if (sbbDm == "FJSSB") {
            option.CJSLX = 2000320001
        } else if (sbbDm == "QYSDSASB") {
            option.QYLX = 2000330001
            option.YJFS = 2000340001
        }
        this.injections.reduce('taxType', option)
    }

    fieldChange = (path, value) => this.voucherAction.fieldChange(path, value)
     //资料报送小类
    filterTypes = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    onOk = async () => {
        let message;
        if (this.clickStatus) return
        this.clickStatus = true
        let form = this.metaAction.gf('data.form').toJS(), response
        form.isReturnValue = true
        if(form.sbbDm =='WHSYJSFSB' && !(form.isYLY || form.isGGY)){
            this.metaAction.toast('error', '文化事业建设的娱乐业与广告业必须至少选择一项')
            this.clickStatus = false
            return false 
        }
       
        if (this.component.props.taxTypeId) {
            response = await this.webapi.tax.update(form)
            message='修改成功'
        } else {
            // form.sbbDm = form.SBXM;
            response = await this.webapi.tax.create(form)
            message='添加成功'
        }
        this.clickStatus = false
        if (response && response.error) {
            this.metaAction.toast('error', response.error.message)
            return false
        } else {
            this.metaAction.toast('success', message)
            return response
        }
    }
    setTab4Field = ( path, value ) => {
        let data = {
            [path]: value
        },
        types = this.metaAction.gf('data.other.types').toJS()
        data = this.setTab4Check( path, value, data )
        if( path == 'data.form.ZLBSXL' && value ) {
            
            types.map( item => {
                if( item.reportingCategoryCode == value ) {
                    data['data.form.CSKJZZ'] = item.accountingStandardCode
                    data = this.setTab4Check( 'data.form.CSKJZZ', item.accountingStandardCode, data )

                }
            })
        }
        this.metaAction.sfs(data)        
    }

    setTab4Check = ( path, value, data ) => {
        let errors = {
            'data.form.CSKJZZ': {
                message: '财务会计制度准则不能为空',
                path: 'data.error.accountingStandardsId'
            },
            'data.form.ZLBSXL': {
                message: '资料报送小类不能为空',
                path: 'data.error.reportingCategoryCode'
            },
            'data.financeReportSettingDto.reportingPeriod': {
                message: '报送期间不能为空',
                path: 'data.error.reportingPeriod'
            }
        }
        if( !value ) {
            data[ errors[path].path ] = errors[path].message
        } else {
            data[ errors[path].path ] = ''

        }
        return data
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}
