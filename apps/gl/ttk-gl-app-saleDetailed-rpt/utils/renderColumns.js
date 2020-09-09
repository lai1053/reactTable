import React from 'react'

export default function renderColumns () {
  let columns = [{
    title: '日期',
    name: 'accountCode',
    dataIndex: 'date',
    className:'AmountColumnStyle',
    key: 'accountCode'
  }, {
    title: '凭证字号',
    name: 'accountName',
    dataIndex: 'docNo',
    className:'AmountColumnStyle',
    key: 'accountName'
  }, {
    title: '摘要',
    name: 'amountDr',
    dataIndex: 'summary',
    className:'AmountColumnStyle',
    key: 'amountDr'
  }, {
    title: '销售数量',
    name: 'amountCr',
    dataIndex: 'saleCount',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '单位销售收入',
    name: 'amountCr',
    dataIndex: 'perSaleProduct',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '单位销售成本',
    name: 'amountCr',
    dataIndex: 'perSaleCost',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '销售收入',
    name: 'amountCr',
    dataIndex: 'saleProduct',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '销售成本',
    name: 'amountCr',
    dataIndex: 'saleCost',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '销售费用',
    name: 'amountCr',
    dataIndex: 'saleExpense',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '销售税金及附加',
    name: 'amountCr',
    dataIndex: 'saleTax',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }, {
    title: '销售利润',
    name: 'amountCr',
    dataIndex: 'saleProfit',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }]

  return columns
}
