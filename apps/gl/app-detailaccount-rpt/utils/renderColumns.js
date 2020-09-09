import React from 'react'

const isTotalData = (record) => {
    return record.summary == '本月合计' || record.summary == '本年累计' ? 'total_data_weight' : ''
    // return ''
}

export default function renderColumns (type, callBack) {
    let columns 
    switch (type){
        case 1:
            columns = [{
                title: '日期',
                name: 'accountDate',
                dataIndex: 'accountDate',
                key: 'accountDate',
                width: 89,
                render: (text, record, index) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '凭证字号',
                width: 86,
                align:'center',
                name: 'docTypeAndCode',
                dataIndex: 'docTypeAndCode',
                key: 'docTypeAndCode',
                render: (text, record) => {
                    return <span className={isTotalData(record)}> <a href="javascript:;" onClick={()=>callBack(record.docId)} title={text}>{text}</a></span>
                } 
            }, {
                title: '摘要',
                name: 'summary',
                width: 198,
                dataIndex: 'summary',
                key: 'summary',
                render: (text, record, index) => <span title={text} className={isTotalData(record)} title={text}>{text}</span>
            },{
                title: '借方',
                name: 'amountDr',
                dataIndex: 'amountDr',
                className:'amountColumnStyle',
                key: 'amountDr',
                render: (text, record, index) => <span title={text} className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '贷方',
                name: 'amountCr',
                dataIndex: 'amountCr',
                className:'amountColumnStyle',
                key: 'amountCr',
                render: (text, record, index) => <span title={text} className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '方向',
                width: 70,
                name: 'balanceDirection',
                dataIndex: 'balanceDirection',
                key: 'balanceDirection',
                className: 'table_center',
                render: (text, record, index) => <span title={text} className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '余额',
                name: 'balanceAmount',
                dataIndex: 'balanceAmount',
                className:'amountColumnStyle',
                key: 'balanceAmount',
                render: (text, record, index) => <span title={text} className={isTotalData(record)} title={text}>{text}</span>
            }]
            break;
        case 2:
            columns = [{
                title: '日期',
                width: 89,
                name: 'accountDate',
                dataIndex: 'accountDate',
                key: 'accountDate',
                render: (text, record, index) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '凭证字号',
                width: 86,
                align:'center',
                name: 'docTypeAndCode',
                dataIndex: 'docTypeAndCode',
                key: 'docTypeAndCode',
                render: (text, record) => {
                    return <span className={isTotalData(record)}><a href="javascript:;" title={text} onClick={()=>callBack(record.docId)}>{text}</a></span>
                } 
            }, {
                title: '摘要',
                name: 'summary',
                width: 198,
                dataIndex: 'summary',
                key: 'summary',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            }, {
                title: '币别/汇率',
                align:'center',
                width: 107,
                name: 'currencyAndExchangeRate',
                dataIndex: 'currencyAndExchangeRate',
                key: 'currencyAndExchangeRate',
                render: (text, record, index) => <span  title={text} className={isTotalData(record)}>{text}</span>
            }, {
                title: '借方',
                children:[{
                    title: '原币金额',
                    name: 'origAmountDr',
                    dataIndex: 'origAmountDr',
                    className:'amountColumnStyle',
                    key: 'origAmountDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '本币金额',
                    name: 'amountDr',
                    dataIndex: 'amountDr',
                    className:'amountColumnStyle',
                    key: 'origAmountDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            }, {
                title: '贷方',
                children: [{
                    title: '原币金额',
                    name: 'origAmountCr',
                    dataIndex: 'origAmountCr',
                    className:'amountColumnStyle',
                    key: 'origAmountCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }, {
                    title: '本币金额',
                    name: 'amountCr',
                    dataIndex: 'amountCr',
                    className:'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            }, {
                title: '余额',
                name: 'balance',
                key: 'balance',
                children: [{
                    title: '方向',
                    width: 70,
                    name: 'balanceDirection',
                    dataIndex: 'balanceDirection',
                    key: 'balanceDirection',
                    className: 'table_center',
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }, {
                    title: '原币金额',
                    name: 'balanceOrigAmount',
                    dataIndex: 'balanceOrigAmount',
                    className:'amountColumnStyle',
                    key: 'balanceOrigAmount',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }, {
                    title: '本币金额',
                    name: 'balanceAmount',
                    dataIndex: 'balanceAmount',
                    className:'amountColumnStyle',
                    key: 'balanceAmount',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            }]
            break;
        case 3:
            columns = [{
                title: '日期',
                width: 89,
                name: 'accountDate',
                dataIndex: 'accountDate',
                key: 'accountDate',
                render: (text, record, index) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '凭证字号',
                width: 86,
                align:'center',
                name: 'docTypeAndCode',
                dataIndex: 'docTypeAndCode',
                key: 'docTypeAndCode',
                render: (text, record) => {
                    return <span className={isTotalData(record)}><a href="javascript:;" title={text} onClick={()=>callBack(record.docId)}>{text}</a></span>
                } 
            },{
                title: '摘要',
                name: 'summary',
                width: 198,
                dataIndex: 'summary',
                key: 'summary',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            },
            {
                title: '单位',
                name: 'unit',
                width: 86,
                dataIndex: 'unit',
                key: 'unit',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            },
            {
                title: '借方',
                name: 'debit',
                children: [{
                    title: '数量',
                    name: 'quantityDr',
                    dataIndex: 'quantityDr',
                    className:'amountColumnStyle',
                    key: 'quantityDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '单价',
                    name: 'priceDr',
                    dataIndex: 'priceDr',
                    className:'amountColumnStyle',
                    key: 'priceDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '金额',
                    name: 'amountDr',
                    dataIndex: 'amountDr',
                    className:'amountColumnStyle',
                    key: 'amountDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            },{
                title: '贷方',
                name: 'credit',
                children: [{
                    title: '数量',
                    name: 'quantityCr',
                    dataIndex: 'quantityCr',
                    className:'amountColumnStyle',
                    key: 'quantityCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '单价',
                    name: 'priceCr',
                    dataIndex: 'priceCr',
                    className:'amountColumnStyle',
                    key: 'priceCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '金额',
                    name: 'amountCr',
                    dataIndex: 'amountCr',
                    className:'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            },{
                title: '余额',
                name: 'balance',
                key: 'balance',
                children:[{
                    title: '方向',
                    width: 70,
                    name: 'balanceDirection',
                    key: 'balanceDirection',
                    dataIndex: 'balanceDirection',
                    className: 'table_center',
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '数量',
                    name: 'balanceQuantity',
                    key: 'balanceQuantity',
                    className:'amountColumnStyle',
                    dataIndex: 'balanceQuantity',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '单价',
                    name: 'balancePrice',
                    key: 'balancePrice',
                    className:'amountColumnStyle',
                    dataIndex: 'balancePrice',
                    width: 132,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '金额',
                    name: 'balanceAmount',
                    key: 'balanceAmount',
                    className:'amountColumnStyle',
                    dataIndex: 'balanceAmount',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            }]
            break;
        case 4:
            columns = [{
                title: '日期',
                width: 89,
                name: 'accountDate',
                dataIndex: 'accountDate',
                key: 'accountDate',
                render: (text, record, index) => <span className={isTotalData(record)}>{text}</span>
            }, {
                title: '凭证字号',
                width: 86,
                align:'center',
                name: 'docTypeAndCode',
                dataIndex: 'docTypeAndCode',
                key: 'docTypeAndCode',
                render: (text, record) => {
                    return <span className={isTotalData(record)}> <a href="javascript:;" title={text} onClick={()=>callBack(record.docId)}>{text}</a></span>
                } 
            },{
                title: '摘要',
                name: 'summary',
                width: 164,
                dataIndex: 'summary',
                key: 'summary',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            }, 
            {
                title: '单位',
                name: 'unit',
                width: 86,
                dataIndex: 'unit',
                key: 'unit',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            },{
                title: '币别/汇率',
                align:'center',
                width: 107,
                name: 'currencyAndExchangeRate',
                dataIndex: 'currencyAndExchangeRate',
                key: 'currencyAndExchangeRate',
                render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
            }, {
                title: '借方',
                name: 'debit',
                key: 'debit',
                children: [{
                    title: '数量',
                    name: 'quantityDr',
                    dataIndex: 'quantityDr',
                    className:'amountColumnStyle',
                    key: 'quantityDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '单价',
                    name: 'priceDr',
                    dataIndex: 'priceDr',
                    className:'amountColumnStyle',
                    key: 'priceDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '原币金额',
                    name: 'origAmountDr',
                    dataIndex: 'origAmountDr',
                    className:'amountColumnStyle',
                    key: 'origAmountDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '本币金额',
                    name: 'amountDr',
                    dataIndex: 'amountDr',
                    className:'amountColumnStyle',
                    key: 'amountDr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            },{
                title: '贷方',
                name: 'credit',
                key: 'credit',
                children: [{
                    title: '数量',
                    name: 'quantityCr',
                    dataIndex: 'quantityCr',
                    className:'amountColumnStyle',
                    key: 'quantityCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '单价',
                    name: 'priceCr',
                    dataIndex: 'priceCr',
                    className:'amountColumnStyle',
                    key: 'priceCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },
                {
                    title: '原币金额',
                    name: 'origAmountCr',
                    dataIndex: 'origAmountCr',
                    className:'amountColumnStyle',
                    key: 'origAmountCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '本币金额',
                    name: 'amountCr',
                    dataIndex: 'amountCr',
                    className:'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            },{
                title: '余额',
                name: 'balance',
                key: 'balance',
                children: [{
                    title: '方向',
                    width: 46,
                    name: 'balanceDirection',
                    dataIndex: 'balanceDirection',
                    key: 'balanceDirection',
                    className: 'table_center',
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '数量',
                    name: 'balanceQuantity',
                    className:'amountColumnStyle',
                    dataIndex: 'balanceQuantity',
                    key: 'balanceQuantity',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '单价',
                    name: 'balancePrice',
                    dataIndex: 'balancePrice',
                    className:'amountColumnStyle',
                    key: 'balancePrice',
                    width: 132,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '原币金额',
                    name: 'balanceOrigAmount',
                    dataIndex: 'balanceOrigAmount',
                    className:'amountColumnStyle',
                    key: 'balanceOrigAmount',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                },{
                    title: '本币金额',
                    name: 'balanceAmount',
                    dataIndex: 'balanceAmount',
                    className:'amountColumnStyle',
                    key: 'balanceAmount',
                    width: 108,
                    render: (text, record, index) => <span title={text} className={isTotalData(record)}>{text}</span>
                }]
            }]
            break;
        default: 
            break
    }
    return columns
}