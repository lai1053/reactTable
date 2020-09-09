export const BILLORIGIN = {
    0: '发票生成',
    1: '新增',  //手工新增
    2: '迁移',  //数据迁移
    3: '导入',
    4: '迁移', //老代账再次数据迁移
    5: '迁移',  //web代账迁移
    6: '退货',
    7: 'bom领料',
    8: '新增',  // 领料新增
    9: '快速领料'
}

//票据来源类型
export const ORIGINTYPE = [{
    key: null,
    value: "全部" 
},{
    key: 8,
    value: "新增" 
},{
    key: 9,
    value: "快速领料" 
},{
    key: 7,
    value: "BOM领料" 
},{
    key: 245,
    value: "迁移" 
}]


export const VOUCHERSTATUS = [{
    key: null,
    value: "全部" 
},{
    key: 0,
    value: "未生成" 
},{
    key: 1,
    value: "已生成" 
}]

export const columnKeyArr = [
    {
        dataIndex: 'selected',
        width: 34,
        align: 'center',
        fixed: 'left',
    },{
        dataIndex: 'code',
        fixed: 'left',
        width: 110,
        align: 'left',
        title: '单据编号',
    },{
        dataIndex: 'cdate',
        width: 85,
        align: 'left',
        title: '出库日期'
    },{
        dataIndex: 'inventoryCode',
        type: 'detail',
        width: 105,
        align: 'left',
        title: '存货编号',
    },{
        dataIndex: 'inventoryName',
        type: 'detail',
        width: 150,
        flexGrow: 1,
        align: 'left',
        title: '存货名称',
    },{
        dataIndex: 'inventoryGuiGe',
        type: 'detail',
        width: 95,
        align: 'left',
        title: '规格型号',
    },{
        dataIndex: 'inventoryUnit',
        type: 'detail',
        width: 65,
        align: 'left',
        title: '单位',
    },{
        dataIndex: 'num',
        type: 'detail',
        width: 125,
        flexGrow: 1,
        align: 'right',
        precise: 6,
        title: '数量',
    },{
        dataIndex: 'price',
        type: 'detail',
        width: 125,
        flexGrow: 1,
        precise: 6,
        align: 'right',
        title: '单价',
    },{
        dataIndex: 'ybbalance',
        type: 'detail',
        width: 125,
        flexGrow: 1,
        precise: 2,
        align: 'right',
        title: '金额',
    },{
        dataIndex: 'type',
        width: 85,
        align: 'center',
        title: '来源',
        className:'titledelect'
    },{
        dataIndex: 'voucherCodes',
        width: 100,
        align: 'center',
        title: '凭证号',
        className:'titledelect'
    },{
        dataIndex: 'operationBtn',
        width: 70,
        align: 'center',
        title: '操作',
        fixedRight: true,
        className:'ttk-stock-app-inventory-picking-content-del'
    }
]