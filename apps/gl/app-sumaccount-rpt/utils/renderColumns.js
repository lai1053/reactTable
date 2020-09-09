import React from 'react'

/**
 * 
 * @param {number} type 展示类型 
 */

const isTotalData = (record) => {
    // return record.summary == '本月合计' || record.summary == '本年累计' ? 'total_data_weight' : ''
    return ''
}

export default function renderColumns(type, openMoreContent) {
    let columns
    switch (type) {
        case 1:
            columns = [
                {
                    title: '科目编码',
                    className: 'accountCode',
                    dataIndex: 'accountCode',
                    key: 'accountCode',
                    width: 120,
                    render: (text, record) => <a onClick={openMoreContent(text)} title={text} className={isTotalData(record)}>{text}</a>
                },
                {
                    title: '科目名称',
                    className: 'accountName',
                    dataIndex: 'accountName',
                    key: 'accountName',
                    width: 120,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                    title: '期间',
                    className: 'accountDate',
                    dataIndex: 'accountDate',
                    key: 'accountDate',
                    width: 71,
                    render: (text, record) => <a onClick={openMoreContent(text)} title={text} className={isTotalData(record)}>{text}</a>
                }, {
                    title: '摘要',
                    dataIndex: 'summary',
                    className: 'summary',
                    key: 'summary',
                    width: 70,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '借方',
                    dataIndex: 'amountDr',
                    className: 'amountColumnStyle',
                    key: 'amountDr',
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '贷方',
                    dataIndex: 'amountCr',
                    className: 'amountColumnStyle',
                    key: 'amountCr',
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '方向',
                    dataIndex: 'balanceDirection',
                    className: 'table_center',
                    width: 50,
                    key: 'balanceDirection',
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '余额',
                    dataIndex: 'balanceAmount',
                    className: 'amountColumnStyle',
                    key: 'balanceAmount',
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            break;
        case 2:
            columns = [
                {
                    title: '科目编码',
                    className: 'accountCode',
                    dataIndex: 'accountCode',
                    key: 'accountCode',
                    width: 120,
                    render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
                },
                {
                    title: '科目名称',
                    className: 'accountName',
                    dataIndex: 'accountName',
                    key: 'accountName',
                    width: 120,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                    title: '币种',
                    className: 'currencyName',
                    dataIndex: 'currencyName',
                    key: 'currencyName',
                    width: 90,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                title: '期间',
                dataIndex: 'accountDate',
                key: 'accountDate',
                width: 71,
                render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
            }, {
                title: '摘要',
                dataIndex: 'summary',
                key: 'summary',
                width: 70,
                render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '借方',
                children: [{
                    title: '原币金额',
                    dataIndex: 'origAmountDr',
                    className: 'amountColumnStyle',
                    key: 'origAmountDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'amountDr',
                    className: 'amountColumnStyle',
                    key: 'amountDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '贷方',
                children: [{
                    title: '原币金额',
                    dataIndex: 'origAmountCr',
                    className: 'amountColumnStyle',
                    key: 'origAmountCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'amountCr',
                    className: 'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '余额',
                name: 'balance',
                children: [{
                    title: '方向',
                    dataIndex: 'balanceDirection',
                    className: 'table_center',
                    key: 'balanceDirection',
                    width: 50,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '原币金额',
                    dataIndex: 'balanceOrigAmount',
                    className: 'amountColumnStyle',
                    key: 'balanceOrigAmount',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'balanceAmount',
                    className: 'amountColumnStyle',
                    key: 'balanceAmount',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }]
            break;
        case 3:
            columns = [
                {
                    title: '科目编码',
                    className: 'accountCode',
                    dataIndex: 'accountCode',
                    key: 'accountCode',
                    width: 120,
                    render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
                },
                {
                    title: '科目名称',
                    className: 'accountName',
                    dataIndex: 'accountName',
                    key: 'accountName',
                    width: 120,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                title: '期间',
                dataIndex: 'accountDate',
                key: 'accountDate',
                width: 71,
                render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
            }, {
                title: '摘要',
                dataIndex: 'summary',
                key: 'summary',
                width: 70,
                render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '借方',
                name: 'debit',
                children: [{
                    title: '数量',
                    dataIndex: 'quantityDr',
                    className: 'amountColumnStyle',
                    key: 'quantityDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '金额',
                    dataIndex: 'amountDr',
                    className: 'amountColumnStyle',
                    key: 'amountDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '贷方',
                name: 'credit',
                children: [{
                    title: '数量',
                    dataIndex: 'quantityCr',
                    className: 'amountColumnStyle',
                    key: 'quantityCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '金额',
                    dataIndex: 'amountCr',
                    className: 'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '余额',
                name: 'balance',
                key: 'balance',
                children: [{
                    title: '方向',
                    key: 'balanceDirection',
                    dataIndex: 'balanceDirection',
                    className: 'table_center',
                    width: 50,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '数量',
                    key: 'balanceQuantity',
                    className: 'amountColumnStyle',
                    dataIndex: 'balanceQuantity',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '单价',
                    key: 'price',
                    className: 'amountColumnStyle',
                    dataIndex: 'price',
                    width: 132,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '金额',
                    key: 'balanceAmount',
                    className: 'amountColumnStyle',
                    dataIndex: 'balanceAmount',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }]
            break;
        case 4:
            columns = [
                {
                    title: '科目编码',
                    className: 'accountCode',
                    dataIndex: 'accountCode',
                    key: 'accountCode',
                    width: 120,
                    render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
                },
                {
                    title: '科目名称',
                    className: 'accountName',
                    dataIndex: 'accountName',
                    key: 'accountName',
                    width: 120,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                    title: '币种',
                    className: 'currencyName',
                    dataIndex: 'currencyName',
                    key: 'currencyName',
                    width: 90,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                },
                {
                title: '期间',
                dataIndex: 'accountDate',
                key: 'accountDate',
                width: 71,
                render: (text, record) => <a onClick={openMoreContent(text)} className={isTotalData(record)} title={text}>{text}</a>
            }, {
                title: '摘要',
                dataIndex: 'summary',
                key: 'summary',
                width: 70,
                render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
            }, {
                title: '借方',
                name: 'debit',
                key: 'debit',
                children: [{
                    title: '数量',
                    dataIndex: 'quantityDr',
                    className: 'amountColumnStyle',
                    key: 'quantityDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '原币金额',
                    dataIndex: 'origAmountDr',
                    className: 'amountColumnStyle',
                    key: 'origAmountDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'amountDr',
                    className: 'amountColumnStyle',
                    key: 'amountDr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '贷方',
                name: 'credit',
                key: 'credit',
                children: [{
                    title: '数量',
                    dataIndex: 'quantityCr',
                    className: 'amountColumnStyle',
                    key: 'quantityCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '原币金额',
                    dataIndex: 'origAmountCr',
                    className: 'amountColumnStyle',
                    key: 'origAmountCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'amountCr',
                    className: 'amountColumnStyle',
                    key: 'amountCr',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }, {
                title: '余额',
                name: 'balance',
                key: 'balance',
                children: [{
                    title: '方向',
                    dataIndex: 'balanceDirection',
                    key: 'balanceDirection',
                    className: 'table_center',
                    width: 50,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '数量',
                    key: 'balanceQuantity',
                    className: 'amountColumnStyle',
                    dataIndex: 'balanceQuantity',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '单价',
                    dataIndex: 'price',
                    className: 'amountColumnStyle',
                    key: 'price',
                    width: 132,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '原币金额',
                    dataIndex: 'balanceOrigAmount',
                    className: 'amountColumnStyle',
                    key: 'balanceOrigAmount',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }, {
                    title: '本币金额',
                    dataIndex: 'balanceAmount',
                    className: 'amountColumnStyle',
                    key: 'balanceAmount',
                    width: 108,
                    render: (text, record) => <span className={isTotalData(record)} title={text}>{text}</span>
                }]
            }]
            break;
        default:
            break
    }
    return columns
}