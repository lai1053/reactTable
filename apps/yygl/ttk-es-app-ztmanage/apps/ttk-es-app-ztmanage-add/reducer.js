import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'
import { moment as momentUtil } from 'edf-utils'
import { consts } from 'edf-consts'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        if(!!localStorage['thirdPartyOrgName']) {
            initState.data.form.name = localStorage['thirdPartyOrgName']
        }
        let sourceTpye = sessionStorage['thirdPartysourceType']
        if(sourceTpye && sourceTpye == 'zsbj') {
            initState.data.other.title = '添加企业，免费试用智能记账报税工具'
        }
        let sourceType = ( option && option.sourceType !== undefined ) ? option.sourceType: 0
        initState.data.sourceType = sourceType
        return this.metaReducer.init(state, initState)
    }

    load = (state, res, data, nickname ) => {
        let sourceType = this.metaReducer.gf(state, 'data.sourceType')
        if (res.list && res.list.length) {
            let propertyList = res.list.map(o => ({label: o.name, value: o.enumId}))
            state = this.metaReducer.sf(state, 'data.other.vatTaxpayer', fromJS(propertyList))

            if(data && data.financeOrgName) {
                state = this.metaReducer.sf(state, 'data.form.name', data.financeOrgName)
                state = this.metaReducer.sf(state, 'data.ztName', data.financeOrgName)
            }else {
                state = this.metaReducer.sf(state, 'data.form.name', data.name)
            }
            let vatTaxpayer 
            data && data.vatTaxpayer ? 
            vatTaxpayer = data.vatTaxpayer : 
            (data && data.swVatTaxpayer ? vatTaxpayer = data.swVatTaxpayer : vatTaxpayer = null) 
           if(vatTaxpayer){
                state = this.metaReducer.sf(state, 'data.form.vatTaxpayer', vatTaxpayer)
                if(vatTaxpayer == 2000010001){
                    state = this.metaReducer.sf(state,'data.form.isEnable',true)
                }else if(vatTaxpayer == 2000010002) {
                    state = this.metaReducer.sf(state,'data.form.isEnable',false)
                }
           }else{
                state = this.metaReducer.sf(state,'data.form.isEnable',false)
           }
            state = this.metaReducer.sf(state, 'data.form.tutorialBeginDate', data.tutorialBeginDate)
            state = this.metaReducer.sf(state, 'data.form.tutorialEndDate', data.tutorialEndDate)
            state = this.metaReducer.sf(state, 'data.dowloadNSRXX', data.dlxxDto.openSjState)
            state = this.metaReducer.sf(state, 'data.form.isEnable', data.isTutorialDate)
            state = this.metaReducer.sf(state, 'data.isTutorialDate', data.isTutorialDate)
            state = this.metaReducer.sf(state, 'data.form.industrys', data.industry)//所属行业
            // state = this.metaReducer.sf(state, 'data.applySimplyAccountingStandards', data.applySimplyAccountingStandards)
            if( sourceType == 0 ) {//创建账套
                if( nickname ) state = this.metaReducer.sf(state, 'data.form.financeCreator', nickname)
                if( nickname ) state = this.metaReducer.sf(state, 'data.form.financeAuditor', nickname)
                let  month = new Date().getMonth() + 1,
                    enabledDate = new Date().getFullYear() + '-' + (month<10?'0'+month:month )
                state = this.metaReducer.sf(state, 'data.form.enabledDate', this.getPreMonth(enabledDate))
            } else {//账套信息展示
                if( data ) {
                    // debugger
                    state = this.metaReducer.sf(state, 'data.form.accountingStandards', data.accountingStandards)
                    state = this.metaReducer.sf(state, 'data.form.financeCreator', data.financeCreator)
                    state = this.metaReducer.sf(state, 'data.form.financeAuditor', data.financeAuditor)
                    state = this.metaReducer.sf(state, 'data.form.accountSupervisor', data.ztzg)
                    let enabledMonth = data.enabledMonth
                    let enabledDate = data.enabledYear  + '-' +  (enabledMonth<10?'0'+ enabledMonth:enabledMonth )
                    state = this.metaReducer.sf(state, 'data.form.enabledDate', enabledDate)
                    let vatTaxpayerList = this.metaReducer.gf(state, 'data.vatTaxpayer'),
                        accountingStandardsList = this.metaReducer.gf(state, 'data.accountingStandards')
                    if( vatTaxpayerList ) {
                        vatTaxpayerList.toJS().map( item => {
                            if( data.vatTaxpayer == item.id ) {
                                state = this.metaReducer.sf(state, 'data.other.vatTaxpayerName', item.name)
                            }
                        })
                    }
                    if( accountingStandardsList ) {
                        if(data.applySimplyAccountingStandards){//精简会计准则显示判断
                                if(data.accountingStandards == 2000020001){
                                    state = this.metaReducer.sf(state, 'data.other.accountingStandardsName', '企业会计准则(一般企业)【精简】')
                                }
                                else if(data.accountingStandards == 2000020002){
                                    state = this.metaReducer.sf(state, 'data.other.accountingStandardsName', '小企业会计准则【精简】')
                                }
                        }else {
                            accountingStandardsList.toJS().map( item => {
                                if( data.accountingStandards == item.id ) {
                                    state = this.metaReducer.sf(state, 'data.other.accountingStandardsName', item.name)
                                }
                            })
                        }

                    }
                    if(data.industry){
                        let industryName = '';
                        switch (data.industry) {
                            case 2000300001:
                                industryName = '制造业';
                                break;
                            case 2000300002:
                                industryName = '商贸业';
                                break;
                            case 2000300003:
                                industryName = '服务业';
                                break;
                            case 2000300004:
                                industryName = '其他';
                                break;
                            default: industryName = '其他'
                        }
                        state = this.metaReducer.sf(state, 'data.other.industrysName', industryName)
                    }
                    if(data.isZtzg){
                        state = this.metaReducer.sf(state, 'data.isZtzg', data.isZtzg);
                    }else{
                        state = this.metaReducer.sf(state, 'data.isZtzg', false);
                    }
                }
            }
        }

        return state
    }
    loadSelect = (state, vatTaxpayer, accountingStandards,industrys,date) => {
        // let sourceType = this.metaReducer.gf(state, 'data.sourceType')
        state = this.metaReducer.sf(state, 'data.vatTaxpayer', fromJS(vatTaxpayer))//纳税人性质
        // if(accountingStandards){
        //     accountingStandards.forEach((item,index) =>{
        //         if(item.id == 2000020016){
        //             accountingStandards.splice(index,1)
        //         }
        //     })
        // }
        // if(accountingStandards){
        //     accountingStandards.forEach((item,index) =>{
        //         if(item.id == 2000020032){
        //             accountingStandards.splice(index,1)
        //         }
        //     })
        // }
        state = this.metaReducer.sf(state, 'data.accountingStandards', fromJS(accountingStandards))//会计准则
        let accountingStandardsName = '';
        //判断accountingStandardsName
        if(accountingStandards) {
            accountingStandards.forEach(o => {
                if(o.id == consts.ACCOUNTINGSTANDARDS_2013) {
                    accountingStandardsName = o.name;
                    return;
                }
            })
        }
        // state = this.metaReducer.sf(state, 'data.form.accountingStandards', Number(consts.ACCOUNTINGSTANDARDS_2013) )
        state = this.metaReducer.sf(state, 'data.form.accountingStandardsName', accountingStandardsName )
        state = this.metaReducer.sf(state, 'data.industrys', fromJS(industrys))//所属行业
        // let enabledDate = momentUtil.stringToMoment(date).format('YYYY-MM')
        // state = this.metaReducer.sf(state, 'data.form.vatTaxpayer', vatTaxpayer[0].id)
        // state = this.metaReducer.sf(state, 'data.form.enabledDate', enabledDate)
        return state       
    }

    updateENABLE = (state, value) => {
        return this.metaReducer.sf(state, 'data.form.isEnable', value)
    }

    update = (state, {path, value}) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}


    /**
     * 获取上一个月
     *
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    getPreMonth = (date) => {
        let arr = date.split('-');
        let year = arr[0]; //获取当前日期的年份
        let month = arr[1]; //获取当前日期的月份
        let day = arr[2]; //获取当前日期的日
        let days = new Date(year, month, 0);
        days = days.getDate(); //获取当前日期中月的天数
        let year2 = year;
        let month2 = parseInt(month) - 1;
        if (month2 == 0) {//如果是1月份，则取上一年的12月份
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }
        let day2 = day;
        let days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        if (day2 > days2) {//如果原来日期大于上一月的日期，则取当月的最大日期。比如3月的30日，在2月中没有30
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = '0' + month2;//月份填补成2位。
        }
        let t2 = year2 + '-' + month2 ;
        return t2;
    }


}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}