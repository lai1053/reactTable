import React from 'react'

export default function renderColumns(callBack, type) {
    let result
    switch (type) {
        case 0:
            result = [
                {
                    title: '凭证',
                    name: 'docTypeAndCode',
                    dataIndex: 'docTypeAndCode',
                    width: 85,
                    key: 'docTypeAndCode',
                    render: (text, record) => <a onClick={(e) => callBack(record.docId)}>{text}</a>
                }, {
                    title: '摘要',
                    name: 'summary',
                    dataIndex: 'summary',
                    width: 198,
                    key: 'summary'
                }, {
                    title: '借方',
                    name: 'amountDr',
                    dataIndex: 'amountDr',
                    className: 'amountColumnStyle',
                    width: 115,
                    key: 'amountDr'
                }, {
                    title: '贷方',
                    name: 'amountCr',
                    dataIndex: 'amountCr',
                    className: 'amountColumnStyle',
                    width: 115,
                    key: 'amountCr'
                }, {
                    title: '方向',
                    name: 'balanceDirection',
                    dataIndex: 'balanceDirection',
                    className: 'table_center',
                    width: 60,
                    key: 'balanceDirection'
                }, {
                    title: '余额',
                    name: 'balanceAmount',
                    dataIndex: 'balanceAmount',
                    className: 'amountColumnStyle',
                    width: 115,
                    key: 'balanceAmount'
                }]
            break
        case 1:
            result = [
                {
                    title: '凭证',
                    name: 'docTypeAndCode',
                    dataIndex: 'docTypeAndCode',
                    width: 85,
                    key: 'docTypeAndCode',
                    render: (text, record) => <a onClick={(e) => callBack(record.docId)}>{text}</a>
                }, {
                    title: '摘要',
                    name: 'summary',
                    dataIndex: 'summary',
                    width: 198,
                    key: 'summary'
                }, {
                    title: '借方',
                    children: [{
                        title: '原币金额',
                        dataIndex: 'origAmountDr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'origAmountDr'
                    }, {
                        title: '本币金额',
                        dataIndex: 'amountDr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'amountDr'
                    }]
                }, {
                    title: '贷方',
                    children: [{
                        title: '原币金额',
                        dataIndex: 'origAmountCr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'origAmountCr'
                    }, {
                        title: '本币金额',
                        dataIndex: 'amountCr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'amountCr'
                    }]
                }, {
                    title: '余额',
                    name: 'balance',
                    children: [{
                        title: '方向',
                        dataIndex: 'balanceDirection',
                        className: 'table_center',
                        width: 60,
                        key: 'balanceDirection'
                    }, {
                        title: '原币金额',
                        dataIndex: 'balanceOrigAmount',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'balanceOrigAmount'
                    }, {
                        title: '本币金额',
                        dataIndex: 'balanceAmount',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'balanceAmount'
                    }]
                }]
            break
        case 2:
            result = [
                {
                    title: '凭证',
                    name: 'docTypeAndCode',
                    dataIndex: 'docTypeAndCode',
                    width: 85,
                    key: 'docTypeAndCode',
                    render: (text, record) => <a onClick={(e) => callBack(record.docId)}>{text}</a>
                }, {
                    title: '摘要',
                    name: 'summary',
                    dataIndex: 'summary',
                    width: 198,
                    key: 'summary'
                }, {
                    title: '借方',
                    name: 'debit',
                    children: [{
                        title: '数量',
                        dataIndex: 'quantityDr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'quantityDr'
                    }, {
                        title: '金额',
                        dataIndex: 'amountDr',
                        className: 'amountColumnStyle',
                        width: '115',
                        key: 'amountDr'
                    }]
                }, {
                    title: '贷方',
                    name: 'credit',
                    children: [{
                        title: '数量',
                        dataIndex: 'quantityCr',
                        className: 'amountColumnStyle',
                        width: 90,
                        key: 'quantityCr'
                    }, {
                        title: '金额',
                        dataIndex: 'amountCr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'amountCr'
                    }]
                }, {
                    title: '余额',
                    name: 'balance',
                    key: 'balance',
                    children: [{
                        title: '方向',
                        key: 'balanceDirection',
                        dataIndex: 'balanceDirection',
                        width: 60,
                        className: 'table_center'
                    }, {
                        title: '数量',
                        key: 'balanceQuantity',
                        className: 'amountColumnStyle',
                        width: 90,
                        dataIndex: 'balanceQuantity'
                    }, {
                        title: '单价',
                        key: 'price',
                        className: 'amountColumnStyle',
                        width: 115,
                        dataIndex: 'price'
                    }, {
                        title: '金额',
                        key: 'balanceAmount',
                        className: 'amountColumnStyle',
                        width: 115,
                        dataIndex: 'balanceAmount'
                    }]
                }]
            break
        case 3:
            result = [
                {
                    title: '凭证',
                    name: 'docTypeAndCode',
                    dataIndex: 'docTypeAndCode',
                    width: 85,
                    key: 'docTypeAndCode',
                    render: (text, record) => <a onClick={(e) => callBack(record.docId)}>{text}</a>
                }, {
                    title: '摘要',
                    name: 'summary',
                    dataIndex: 'summary',
                    width: 198,
                    key: 'summary'
                }, {
                    title: '借方',
                    name: 'debit',
                    key: 'debit',
                    children: [{
                        title: '数量',
                        dataIndex: 'quantityDr',
                        className: 'amountColumnStyle',
                        width: 90,
                        key: 'quantityDr'
                    }, {
                        title: '原币金额',
                        dataIndex: 'origAmountDr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'origAmountDr'
                    }, {
                        title: '本币金额',
                        dataIndex: 'amountDr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'amountDr'
                    }]
                }, {
                    title: '贷方',
                    name: 'credit',
                    key: 'credit',
                    children: [{
                        title: '数量',
                        dataIndex: 'quantityCr',
                        className: 'amountColumnStyle',
                        width: 90,
                        key: 'quantityCr'
                    }, {
                        title: '原币金额',
                        dataIndex: 'origAmountCr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'origAmountCr'
                    }, {
                        title: '本币金额',
                        dataIndex: 'amountCr',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'amountCr'
                    }]
                }, {
                    title: '余额',
                    name: 'balance',
                    key: 'balance',
                    children: [{
                        title: '方向',
                        dataIndex: 'balanceDirection',
                        key: 'balanceDirection',
                        width: 60,
                        className: 'table_center'
                    }, {
                        title: '数量',
                        key: 'balanceQuantity',
                        className: 'amountColumnStyle',
                        width: 90,
                        dataIndex: 'balanceQuantity'
                    }, {
                        title: '单价',
                        dataIndex: 'price',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'price'
                    }, {
                        title: '原币金额',
                        dataIndex: 'balanceOrigAmount',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'balanceOrigAmount'
                    }, {
                        title: '本币金额',
                        dataIndex: 'balanceAmount',
                        className: 'amountColumnStyle',
                        width: 115,
                        key: 'balanceAmount'
                    }]
                }]
            break
        default:
            break
    }
    return result
}