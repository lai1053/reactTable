import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import clonedeep from 'lodash.clonedeep'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {//初始化
        let initState = getInitState()
        initState.data.periodData = option.periodData
        return this.metaReducer.init(state, initState)
    }

    load = (state, value) => {//初始数据加载 caseFlowItems cashFlowDetails
        let tableList = this.getTableList( value.cashFlowDetails ),datas,defaulCaseFlowItem = {
            accountingStandardsId : '',
            cashFlowDirection:'',
            id:'',
            itemType:'',
            lineNum:'',
            name:''
        },
        noItemName =value.caseFlowItems 
        // let newnoItemName = noItemName.splice(0,0,defaulCaseFlowItem)
        datas = {
            'data.list' : fromJS( tableList),
            // 'data.currentList': fromJS(tableList.slice(0,10)),
            'data.dataSource' : fromJS( noItemName ),
            'data.entryMaxUpdateTime': fromJS(value.entryMaxUpdateTime),
            'data.rows': fromJS(value.rows),
            'data.monthClosingFlag': fromJS(value.monthClosingFlag),
            'data.cashFlowInfoIds': fromJS(value.cashFlowInfoIds),
            // 'data.pagination.totalCount': fromJS(tableList?tableList.length:0),
            // 'data.pagination.pageSize': fromJS()
        }
        
        // state = this.metaReducer.sf(state, 'data.list', fromJS(tableList))
        state = this.metaReducer.sfs(state, datas )
    	return state
    }

    getTableList = ( voucherList ) => {
        
        let tableList = []
        if(voucherList){
            voucherList.map( item => {
                tableList.push( {
                    summary: `凭证号：${item.docCode} 日期：${item.voucherDate.split(' ')[0]}`,
                    docCode: item.docCode,
                    voucherDate: item.voucherDate,
                    orgId: item.orgId,
                    docId: item.docId,
                    isNameRow: true
                })
    
                item.details = item.details.map( row => {
                    
                    row.docAmount = row.docAmount? this.addThousandsPosition( row.docAmount, true ) : '0.00'
                    row.allotAmount = row.allotAmount? this.addThousandsPosition( row.allotAmount, true ) : '0.00'
                    return row
                })
                tableList = tableList.concat( item.details )
            })
            
            return tableList
        }
        
    }
    
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    //去除千分位
    clearThousandsPosition = (num) => {
        if (num && num.toString().indexOf(',') > -1) {
            let x = num.toString().split(',')
            return parseFloat(x.join(""))
        } else {
            return num
        }
    }

    //添加千分位
    addThousandsPosition = (input, isFixed) => {
        if (isNaN(input)) return ''
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

        return num.replace(regex, "$1,")
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}