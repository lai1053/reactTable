import React from 'react'

export default function renderColumns (type, callBack) {
    let columns  =  [{
        title: <span title="期间">期间</span>,
        name: 'accountDate',
        dataIndex: 'accountDate',
        key: 'accountDate',
        align: 'center',
        width: 71,
        render: (text) => <a title={text} onClick={()=>callBack(text)}>{text}</a>
    },{
        title: <span title="摘要">摘要</span>,
        name: 'summary',
        dataIndex: 'summary',
        width:108,
        key: 'summary'
    },{
        title: <span title="借方">借方</span>,
        name: 'amountDr',
        dataIndex: 'amountDr',
        className:'amountColumnStyle',
        width: 108,
        key: 'amountDr'
    }, {
        title: <span title="贷方">贷方</span>,
        name: 'amountCr',
        dataIndex: 'amountCr',
        className:'amountColumnStyle',
        width: 108,
        key: 'amountCr'
    }, {
        title: <span title="方向">方向</span>,
        name: 'balanceDirection',
        dataIndex: 'balanceDirection',
        width: 70,
        className:'table_center',
        key: 'balanceDirection'
    }, {
        title: <span title="余额">余额</span>,
        name: 'balanceAmount',
        dataIndex: 'balanceAmount',
        className:'amountColumnStyle',
        width: 108,
        key: 'balanceAmount'
    }]

    return columns
}