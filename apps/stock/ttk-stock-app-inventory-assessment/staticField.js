const zgrkFields = [{
    title: '选择',
    dataIndex: 'selected',
    align: 'center',
    width: 34
},{
    title: '单据编号',
    dataIndex: 'code',
    align: 'left',
    width: 115
},{
    title: '入库日期',
    dataIndex: 'cdate',
    align: 'left',
    width: 90,
},{
    title: '往来单位',
    dataIndex: 'supplierName',
    align: 'left',
    width: 120,
    flexGrow: 1
},{
    title: '存货编号',
    dataIndex: 'inventoryCode',
    type:'detail',
    align: 'left',
    width: 110,
},{
    title: '存货名称',
    dataIndex: 'inventoryName',
    type:'detail',
    align: 'left',
    width: 150,
    flexGrow: 1
},{
    title: '规格型号',
    dataIndex: 'inventoryGuiGe',
    type:'detail',
    align: 'left',
    width: 120,
},{
    title: '单位',
    dataIndex: 'inventoryUnit',
    type:'detail',
    align: 'left',
    width: 65,
},{
    title: '数量',
    dataIndex: 'num',
    type:'detail',
    align: 'left',
    width: 100,
    precise: 6,
    flexGrow: 1
},{
    title: '单价',
    dataIndex: 'price',
    type:'detail',
    align: 'right',
    width: 100,
    precise: 6,
    flexGrow: 1
},{
    title: '金额',
    dataIndex: 'ybbalance', 
    type:'detail',
    align: 'right',
    width: 100,
    precise: 2,
    flexGrow: 1
},{
    title: '冲回数量',
    dataIndex: 'billBodyChNumCopy', 
    align: 'center',
    width: 100,
    precise: 6,
    flexGrow: 1
},{
    title: '凭证号',
    dataIndex: 'voucherCodes',
    align: 'left',
    width: 100,
    flexGrow: 1
},{
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 100,
}]


const zgchFields = [{
    title: '选择',
    dataIndex: 'selected',
    align: 'center',
    width: 34
},{
    title: '单据编号',
    dataIndex: 'code',
    align: 'left',
    width: 115
},{
    title: '冲回日期',
    dataIndex: 'cdate',
    align: 'left',
    width: 90,
},{
    title: '往来单位',
    dataIndex: 'supplierName',
    align: 'left',
    width: 120,
    flexGrow: 1
},{
    title: '存货编号',
    dataIndex: 'inventoryCode',
    type: 'detail',
    align: 'left',
    width: 110,
},{
    title: '存货名称',
    dataIndex: 'inventoryName',
    type: 'detail',
    align: 'left',
    width: 150,
    flexGrow: 1
},{
    title: '规格型号',
    dataIndex: 'inventoryGuiGe',
    type: 'detail',
    align: 'left',
    width: 120,
},{
    title: '单位',
    dataIndex: 'inventoryUnit',
    type: 'detail',
    align: 'left',
    width: 65,
},{
    title: '数量',
    dataIndex: 'num',
    type: 'detail',
    align: 'left',
    width: 100,
    precise: 6,
    flexGrow: 1
},{
    title: '单价',
    dataIndex: 'price',
    type: 'detail',
    align: 'right',
    width: 100,
    precise: 6,
    flexGrow: 1
},{
    title: '金额',
    dataIndex: 'ybbalance', 
    type: 'detail',
    align: 'right',
    width: 100,
    precise: 2,
    flexGrow: 1
},{
    title: '凭证号',
    dataIndex: 'voucherCodes',
    align: 'left',
    width: 100,
    flexGrow: 1
},{
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 100,
}]


export default {
    zgrkFields,
    zgchFields
}