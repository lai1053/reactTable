import React from 'react'

export default function renderColumns (reportType) {
    let columns

    if (reportType == 0) {
        columns = [{
          title: '客户',
          name: 'name',
          dataIndex: 'name',
          key: 'name'
        }, {
          title: '期初应收款',
          name: 'beginAmount',
          dataIndex: 'beginAmount',
          key: 'beginAmount',
          className:'AmountColumnStyle'
        }, {
            title: '本期发生',
            children: [{
                title: '本期增加',
                name: 'addAmount',
                dataIndex: 'addAmount',
                key: 'addAmount',
                className:'AmountColumnStyle'
            }, {
                title: <span title='本期收回'>本期收回</span>,
                name: 'subAmount',
                dataIndex: 'subAmount',
                key: 'subAmount',
                className:'AmountColumnStyle'
            }]
        }, {
            title: <span title='累计发生'>累计发生</span>,
            children: [{
              title: <span title='年度累计增加'>年度累计增加</span>,
              name: 'addAmountSum',
              dataIndex: 'addAmountSum',
              key: 'addAmountSum',
              className:'AmountColumnStyle'
            }, {
              title: <span title='年度累计收回'>年度累计收回</span>,
              name: 'subAmountSum',
              dataIndex: 'subAmountSum',
              key: 'subAmountSum',
              className:'AmountColumnStyle',
            }]
        }, {
          title: '期末应收款',
          name: 'endAmount',
          dataIndex: 'endAmount',
          key: 'endAmount',
          className:'AmountColumnStyle'
        }]
    } else if (reportType == 1) {
        columns = [{
          title: '客户',
          name: 'name',
          dataIndex: 'name',
          key: 'name'
        }, {
          title: '期初预收款',
          name: 'beginAmount',
          dataIndex: 'beginAmount',
          key: 'beginAmount',
          className:'AmountColumnStyle'
        }, {
            title: '本期发生',
            children: [{
                title: '本期增加',
                name: 'addAmount',
                dataIndex: 'addAmount',
                key: 'addAmount',
                className:'AmountColumnStyle'
            }, {
                title: <span title='本期冲抵'>本期冲抵</span>,
                name: 'subAmount',
                dataIndex: 'subAmount',
                key: 'subAmount',
                className:'AmountColumnStyle'
            }]
        }, {
            title: <span title='累计发生'>累计发生</span>,
            children: [{
              title: <span title='年度累计增加'>年度累计增加</span>,
              name: 'addAmountSum',
              dataIndex: 'addAmountSum',
              key: 'addAmountSum',
              className:'AmountColumnStyle'
            }, {
              title: <span title='年度累计冲抵'>年度累计冲抵</span>,
              name: 'subAmountSum',
              dataIndex: 'subAmountSum',
              key: 'subAmountSum',
              className:'AmountColumnStyle',
            }]
        }, {
          title: '期末预收款',
          name: 'endAmount',
          dataIndex: 'endAmount',
          key: 'endAmount',
          className:'AmountColumnStyle'
        }]
    } else if (reportType == 2) {
        columns = [{
          title: '供应商',
          name: 'name',
          dataIndex: 'name',
          key: 'name'
        }, {
          title: '期初应付款',
          name: 'beginAmount',
          dataIndex: 'beginAmount',
          key: 'beginAmount',
          className:'AmountColumnStyle'
        }, {
            title: '本期发生',
            children: [{
                title: '本期增加',
                name: 'addAmount',
                dataIndex: 'addAmount',
                key: 'addAmount',
                className:'AmountColumnStyle'
            }, {
                title: <span title='本期归还'>本期归还</span>,
                name: 'subAmount',
                dataIndex: 'subAmount',
                key: 'subAmount',
                className:'AmountColumnStyle'
            }]
        }, {
            title: <span title='累计发生'>累计发生</span>,
            children: [{
              title: <span title='年度累计增加'>年度累计增加</span>,
              name: 'addAmountSum',
              dataIndex: 'addAmountSum',
              key: 'addAmountSum',
              className:'AmountColumnStyle'
            }, {
              title: <span title='年度累计归还'>年度累计归还</span>,
              name: 'subAmountSum',
              dataIndex: 'subAmountSum',
              key: 'subAmountSum',
              className:'AmountColumnStyle',
            }]
        }, {
          title: '期末应付款',
          name: 'endAmount',
          dataIndex: 'endAmount',
          key: 'endAmount',
          className:'AmountColumnStyle'
        }]
    } else if (reportType == 3) {
        columns = [{
          title: '供应商',
          name: 'name',
          dataIndex: 'name',
          key: 'name'
        }, {
          title: '期初预付款',
          name: 'beginAmount',
          dataIndex: 'beginAmount',
          key: 'beginAmount',
          className:'AmountColumnStyle'
        }, {
            title: '本期发生',
            children: [{
                title: '本期增加',
                name: 'addAmount',
                dataIndex: 'addAmount',
                key: 'addAmount',
                className:'AmountColumnStyle'
            }, {
                title: <span title='本期冲抵'>本期冲抵</span>,
                name: 'subAmount',
                dataIndex: 'subAmount',
                key: 'subAmount',
                className:'AmountColumnStyle'
            }]
        }, {
            title: <span title='累计发生'>累计发生</span>,
            children: [{
              title: <span title='年度累计增加'>年度累计增加</span>,
              name: 'addAmountSum',
              dataIndex: 'addAmountSum',
              key: 'addAmountSum',
              className:'AmountColumnStyle'
            }, {
              title: <span title='年度累计冲抵'>年度累计冲抵</span>,
              name: 'subAmountSum',
              dataIndex: 'subAmountSum',
              key: 'subAmountSum',
              className:'AmountColumnStyle',
            }]
        }, {
          title: '期末应收款',
          name: 'endAmount',
          dataIndex: 'endAmount',
          key: 'endAmount',
          className:'AmountColumnStyle'
        }]
    }

    return columns
}
