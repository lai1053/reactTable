import react from 'react'
import { Table, Input, DatePicker, Card, Icon, Tree, Button, Layout} from 'edf-component'
import utils from 'edf-utils'
import { AppLoader } from 'edf-meta-engine'
import moment from 'moment'
// import {getInfo, formatSixDecimal} from '../commonAssets/js/common'

const columnData = [
    {
        id: 'inventoryCode',
        caption: "存货编码",
        fieldName: 'inventoryCode',
        isVisible: true,
        fixed:'left',
        width: 75,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'inventoryName',
        caption: "存货名称",
        fieldName: 'inventoryName',
        isVisible: true,
        fixed:'left',
        width: 135,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'inventoryGuiGe',
        caption: "规格型号",
        fieldName: 'inventoryGuiGe',
        isVisible: true,
        fixed:'left',
        width: 80,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'inventoryUnit',
        caption: "单位",
        fieldName: 'inventoryUnit',
        fixed:'left',
        isVisible: true,
        width: 50,
        isMustSelect: false,
        className: 'table_td_align_center',
        amount: true
    }, {
        id: 'serviceTypeName',
        caption: "业务类型",
        fixed:'left',
        fieldName: 'serviceTypeName',
        isFixed: false,
        isVisible: true,
        width: 90,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'sheetDate',
        caption: "日期",
        fieldName: 'sheetDate',
        isFixed: false,
        isVisible: true,
        width: 90,
        isMustSelect: false,
        className: 'table_td_align_center',
        amount: true
    }, {
        id: 'sheetCode',
        caption: "单据号",
        fieldName: 'sheetCode',
        isFixed: false,
        isVisible: true,
        width: 90,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'relatedSheetCode',
        caption: "关联单据",
        fieldName: 'relatedSheetCode',
        isFixed: false,
        isVisible: true,
        width: 90,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, {
        id: 'zgrk',
        caption: '暂估入库',
        fieldName: 'zgrk',
        isVisible: true,
        isMustSelect: true,
        children: [{
            id: 'zgrkNum',
            caption: "数量",
            fieldName: 'zgrkNum',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            className: 'table_td_align_right',
            amount: true,
            width: 90,
        }, {
            id: 'zgrkPrice',
            caption: "单价",
            fieldName: 'zgrkPrice',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 90,
            className: 'table_td_align_right',
            amount: true
        }, {
            id: 'zgrkBalance',
            caption: "金额",
            fieldName: 'zgrkBalance',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 90,
            className: 'table_td_align_right',
            amount: true
        }, ]
    }, {
        id: 'zghc',
        caption: '暂估冲回',
        fieldName: 'zghc',
        isVisible: true,
        isMustSelect: true,
        children: [{
            id: 'zghcNum',
            caption: "数量",
            fieldName: 'zghcNum',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            className: 'table_td_align_right',
            amount: true,
            width: 90,
        }, {
            id: 'zghcPrice',
            caption: "单价",
            fieldName: 'zghcPrice',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 90,
            className: 'table_td_align_right',
            amount: true
        }, {
            id: 'zghcBalance',
            caption: "金额",
            fieldName: 'zghcBalance',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 90,
            className: 'table_td_align_right',
            amount: true
        }, ]
    },  {
        id: 'bqkc',
        caption: '本期库存',
        fieldName: 'bqkc',
        isVisible: true,
        isMustSelect: true,
        // align: '',
        children: [{
            id: 'bqkcNum',
            caption: "数量",
            fieldName: 'bqkcNum',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            className: 'table_td_align_right',
            width: 100,
        },{
            id: 'bqkcPrice',
            caption: "单价",
            fieldName: 'bqkcPrice',
            className: 'table_td_align_right',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 80,
        }, {
            id: 'bqkcBalance',
            caption: "金额",
            fieldName: 'bqkcBalance',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 80,
            className: 'table_td_align_right',
            amount: true
        }, ]
    },]
class StockAppStatementsZgDetail extends React.component{
    
    constructor(props){
        super(props)
        this.state = {
            imgbac: "",        // 箭头图标
            limit: {
				stateNow: '',  // 存货是否已开启
			},
			level: 1,          // 菜单层级
			columnData,        // 表格字段
			inputVal: '',
			isUnOpen: false,
			isVisible: false,
			loading: false,
			treeLoading: false,
			tableOption: {
				x: 1000,
				y: 340,
			},
			form:{
				enableDate:sessionStorage['stockPeriod'+name]
			},
			columns: [],
			list: [],
            expandedKeys: [],
			other: {
				tree:[]
			},
			treeSelectedKey: ['0'],//选中的数据
			expandedKeys:['0',]//哪些展开 第一层  ID
        }
        this.webapi = props.webapi || {}
        this.metaAction = props.metaAction || {}
        this.params = props.params || {}
    }
}

export default StockAppStatementsZgDetail