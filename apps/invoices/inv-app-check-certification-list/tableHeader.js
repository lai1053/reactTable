const checkTableColumns = [
    {
        title: '发票号码',
        dataIndex: 'fphm',
        width: 100,
        align: 'center',
    }, {
        title: '开票日期',
        dataIndex: 'kprq',
        width: 160,
        align: 'center',
    }, {
        title: '金额',
        dataIndex: 'hjje',
        width: 160,
        align: 'center',
    }, {
        title: '税额',
        dataIndex: 'hjse',
        width: 120,
        align: 'center',
    }, {
        title: '销方名称',
        dataIndex: 'xfmc',
        // width: 190,
        align: 'center',
        // render: "{{function(text){return $renderTooltips(text,200,false)}}}",
    }, {
        title: '发票状态',
        dataIndex: 'fpztDm',
        width: 80,
        align: 'center',
        // render: "{{function(text){return $renderTooltips(text,100,true)}}}",
    }, {
        title: '勾选日期',
        dataIndex: 'gxrq',
        width: 200,
        align: 'center',
        // render: "{{function(text){return $renderTooltips(text,100,true)}}}",
    }, {
        title: '抵扣月份',
        dataIndex: 'dkyf',
        width: 90,
        align: 'center',
        // render: "{{function(text, record){return $renderAction(record);}}}",
    }, {
        title: '状态',
        dataIndex: 'rzzt',
        width: 100,
        align: 'center',
        // render: "{{function(text, record){return $renderAction(record);}}}",
    }
]

const certificTableColumns = [
    {
        title: '发票号码',
        dataIndex: 'fphm',
        width: 100,
        align: 'center',
    }, {
        title: '开票日期',
        dataIndex: 'kprq',
        width: 170,
        align: 'center',
    }, {
        title: '金额',
        dataIndex: 'hjje',
        width: 190,
        align: 'center',
    }, {
        title: '税额',
        dataIndex: 'hjse',
        width: 150,
        align: 'center',
    }, {
        title: '销方名称',
        dataIndex: 'xfmc',
        align: 'center',
        // render: "{{function(text){return $renderTooltips(text,200,false)}}}",
    },{
        title: '勾选日期',
        dataIndex: 'gxrq',
        width: 200,
        align: 'center',
        // render: "{{function(text){return $renderTooltips(text,100,true)}}}",
    },{
        title: '状态',
        dataIndex: 'rzzt',
        width: 100,
        align: 'center',
        // render: "{{function(text, record){return $renderAction(record);}}}",
    }
]

export default {
    checkTableColumns,
    certificTableColumns
}