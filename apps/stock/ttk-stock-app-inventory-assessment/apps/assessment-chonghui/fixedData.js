
export const columnField = [
{
    title: "业务日期",
    key: 'billTitleCdate',
    dataIndex: 'billTitleCdate',
    align: 'alignLeft',
    width: 120,
}, {
    title: "业务号",
    key: 'billTitleCode',
    dataIndex: 'billTitleCode',
    align: 'alignLeft',
    // width: 200,
    flexGrow: 1
}, {
    title: "待冲回数量",
    key: 'num',
    dataIndex: 'num',
    align: 'alignLeft',
    width: 130,
    // flexGrow: 1,
    sum: true,
    format: 6
}, {
    title: "待冲回单价",
    key: 'price',
    dataIndex: 'price',
    align: 'alignRight',
    // flexGrow: 1,
    width: 130,
},{
    title: "待冲回金额",
    key: 'ybbalance',
    dataIndex: 'ybbalance',
    align: 'alignRight',
    width: 130,
    // flexGrow: 1,
    sum: true,
    format: 6
},{
    title: "冲回数量",
    key: 'number',
    dataIndex: 'number',
    align:'alignLeft',
    // flexGrow: 1,
    width: 130,
},{
    title: "冲回金额",
    key: 'monery',
    dataIndex: 'monery',
    align: 'alignRight',
    width: 130,
    // flexGrow: 1,
    sum: true,
    format: 2,
}]
        