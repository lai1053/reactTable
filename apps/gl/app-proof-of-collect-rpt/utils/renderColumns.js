import React from 'react'

export default function renderColumns () {
  let columns = [{
    title: '科目编码',
    name: 'accountCode',
    dataIndex: 'accountCode',
         
    key: 'accountCode'
  }, {
    title: '科目名称',
    name: 'accountName',
   
    dataIndex: 'accountName',
    key: 'accountName'
  }, {
    title: '借方金额',
    name: 'amountDr',
    dataIndex: 'amountDr',
    
    className:'AmountColumnStyle',
    key: 'amountDr'
  }, {
    title: '贷方金额',
    name: 'amountCr',
    dataIndex: 'amountCr',    
    className:'AmountColumnStyle',
    key: 'amountCr'
  }]

  return columns
}
