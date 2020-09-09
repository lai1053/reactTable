// import React from 'react'
// import { action as MetaAction } from 'edf-meta-engine'
// import config from './config'
// import { Modal, message } from 'antd'
// import { toJS, fromJS} from 'immutable'
// import utils from 'edf-utils'
// import { getList, dealWithData, formatSixDecimal, getInfo, HelpIcon, transToNum , getVoucherDate} from '../commonAssets/js/common'
// import { mainBusinessTable } from './staticField'
// import moment from 'moment'

import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { mainBusinessTable, mainBusinessTableTotal } from './staticField'
import StockAppCarryOverMainBusinessCost from '../components/StockAppCarryOverMainBusinessCost'
  /*
        @params: {
            "state": 0, --状态 0未开，1开启
			"bInveControl": 0, --是否进行负库存控制 0否 1是
			"endNumSource": 0, 完工入库数据来源 0 手工 1以销定产
		    "endCostType":0, 以销定产0、传统生产1
		    "isGenVoucher":true, 是否结账，未生成 false 生成 true
		    "isCompletion":true,是否本月有完工入库单 有 true 没有 false
		    "startPeriod":"2019-09", 启用月份
		    "isCarryOverMainCost":false, 结转主营成本凭证 未生成 false 生成 true
		    "isCarryOverProductCost":false, 结转生产成本凭证，未生成 false 生成 true
		    "isProductShare":true, 是否进行成本分配，未生成 false 生成 true
		    "inveBusiness",1 --1工业自行生产，0 存商业
        }
     */
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.rowCount = 0
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = config.current.webapi
        this.params = this.component.props.params || {}
        // this.defaultPeriod = moment().format('YYYY-MM')
        // this.load()
        // let addEventListener = this.component.props.addEventListener
        // if (addEventListener) {
        //     addEventListener('onTabFocus', async()=>{ 
        //         this.params = this.component.props.params || {}
        //         const newInfo = await getInfo({ period: (this.params.period || this.defaultPeriod)})
        //         Object.assign(this.params, newInfo)
        //         this.load()
        //     })
        // }     
        this.lastState = null
        injections.reduce('init')
    }

    renderPage = () => {
        return (
            <StockAppCarryOverMainBusinessCost
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                params={this.params}
                extendAction={this.extendAction}
                component={this.component}
                mainBusinessTable={mainBusinessTable}
                mainBusinessTableTotal={mainBusinessTableTotal}
                setOkListener={this.component.props.setOkListener}
                lastState={this.lastState}
                saveLastData={this.saveLastData}
            >
            </StockAppCarryOverMainBusinessCost>
        )
    }
    saveLastData = (lastState) => {
        this.lastState = lastState
    }
    componentWillUnmount = () => {
        this.lastState = null
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

