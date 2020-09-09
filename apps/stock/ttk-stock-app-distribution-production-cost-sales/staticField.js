const tableColumns = [
    {
        title: '成本费用',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 200,
    }, 
    {
        title: '期初余额',
        dataIndex: 'lastAmount',
        key: 'lastAmount',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期发生',
        dataIndex: 'currentAmount',
        key: 'currentAmount',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期结转',
        dataIndex: 'currentCost',
        key: 'currentCost',
        align: 'center',
        width: 200
    }, 
    {
        title: '本期结余',
        dataIndex: 'currentBalance',
        key: 'currentBalance',
        align: 'center',
        width: 200
    }
]

export default {
    tableColumns
}