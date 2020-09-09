import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
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
            this.component.props.setOkListener(this.exportExcel)
        }
        injections.reduce('init')
    }
    // 获取纳税期限代码
    batchQueryZzsNsqxdm = async (skssqVal, qyId) => {
        skssqVal = skssqVal && `${skssqVal.slice(0,4)}-${skssqVal.slice(4)}-01` || moment().format('YYYY-MM-DD')
        const params = {
            "skssq": skssqVal,
            "qyxxList": [{ "qyId": qyId }]
        }
        const resp = await this.webapi.invoices.batchQueryZzsNsqxdm(params)
        return resp && resp.length !== 0 ? '1' : '0'
    }
    exportExcel = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {};
        const currentUser = this.metaAction.context.get("currentUser")
        const manageOrg = this.metaAction.context.get("manageOrg")
        console.log(currentOrg,currentUser,manageOrg);
        const nsqj  = moment(this.component.props.nsqj).format('YYYYMM')
        let filterForm = this.component.props.filterForm || {},
            nsrxz = currentOrg.swVatTaxpayer == 2000010002 ? 'XGMZZS' : 'YBNSRZZS';
        const typeAction = this.metaAction.gf('data.typeAction')
        let { gfmc, invType, invCode, invNumber, customCode, taxRate, strDate, endDate, statusValue, goodsType, taxFlag, uploadStarDate, uploadEndDate, scopeType,isDzfp ,dljgId,userId,pagination,sort,sortOrder,showCheck} = filterForm
        if(showCheck === '全部')showCheck = null
    
        let status = {
            normal:"0", //正常（"1"：选中；"0"或者null：没有选中）
            hcfp:"0",
            cancelled:"0",
        }
        statusValue.forEach((i)=>{
            status[i] = "1"
        })
        if (isDzfp === "全部") isDzfp = null;
        const option = {
            entity: {
                "qyId": currentOrg.id || "1", //企业ID
                "skssq": nsqj || "201904", //税款属期
                // 代理机构ID 用户ID dljgId  userId
                dljgId,
                userId:currentUser.id,
                gfmc,
                gfsbh: customCode,
                fpzlDm: invType,
                fpdm: invCode,
                fphm: invNumber,
                fpztDmValue:status,
                zbslv: taxRate,
                //xgmJbOrYb: swVatTaxpayer === "0" ? null : xgmJbOrYb,
                isDzfp: isDzfp,
                showCheck
            },
            //xgmJbOrYb: swVatTaxpayer === "0" ? null : xgmJbOrYb,
            kprqq: strDate,
            kprqz: endDate,
            uploadStarDate,
            uploadEndDate,
            scopeType,
            jzjtType: taxFlag,
            hwlxType: goodsType === '-0001' ? null : goodsType,
            
            page: {
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize
            },
            orders: sort.userOrderField
                ? [
                    {
                        name: sort.userOrderField
                            ? sortOrder[sort.userOrderField]
                            : "",
                        asc: sort.order ? sort.order === "asc" : ""
                    }
                ]
                : []
        }
        // if (nsrxz === 'XGMZZS') {
        //     let xgmJbOrYb = await this.batchQueryZzsNsqxdm(nsqj, currentOrg.id)
        //     option.entity.xgmJbOrYb = xgmJbOrYb
        // }
        let api = ''
        if (typeAction == 1) {
            // 导出明细发票数据(一条明细一条记录)
            api = 'exportXxfpInDetail';
        } else {
            // 导出汇总发票数据(一张发票一条记录)
            api = 'exportXxfpInSummary';
        }
        const res = await this.webapi.invoices[api](option)

        return true
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}