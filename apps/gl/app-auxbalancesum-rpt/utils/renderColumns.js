import React from 'react'

export default function renderColumns(renderTitle) {
    const accountColumns = [
        {
            title: <span title='科目编码'>科目编码</span>,            
            name: 'accountCode',
            dataIndex: 'accountCode',
            width: 80,
            key: 'accountCode'
        }, {
            title: <span title='科目名称'>科目名称</span>,            
            name: 'accountName',
            dataIndex: 'accountName',
            width: 198,
            key: 'accountName'
        },
    ]
    const baseColumns = [{       
        title: <span title='期初余额'>期初余额</span>,
        children: [{            
            title: <span title='借方'>借方</span>,
            name: 'periodBeginAmountDr',
            dataIndex: 'periodBeginAmountDr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'periodBeginAmountDr'
        }, {           
            title: <span title='贷方'>贷方</span>,
            name: 'periodBeginAmountCr',
            dataIndex: 'periodBeginAmountCr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'periodBeginAmountCr'
        }]
    }, {        
        title: <span title='本期发生额'>本期发生额</span>,
        children: [{            
            title: <span title='借方'>借方</span>,
            name: 'amountDr',
            dataIndex: 'amountDr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'amountDr'
        }, {           
            title: <span title='贷方'>贷方</span>,
            name: 'amountCr',
            dataIndex: 'amountCr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'amountCr'
        }]
    }, {        
        title: <span title='本年累计发生额'>本年累计发生额</span>,
        name: 'balance',
        children: [{           
            title: <span title='借方'>借方</span>,
            name: 'yearAmountDr',
            dataIndex: 'yearAmountDr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'yearAmountDr'
        }, {            
            title: <span title='贷方'>贷方</span>,
            name: 'yearAmountCr',
            dataIndex: 'yearAmountCr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'yearAmountCr'
        }]
    }, {        
        title: <span title='期末余额'>期末余额</span>,
        name: 'balance',
        children: [{           
            title: <span title='借方'>借方</span>,
            name: 'periodEndAmountDr',
            dataIndex: 'periodEndAmountDr',
            'render': renderTitle,
            width: '15%',
            className: 'amountColumnStyle',
            key: 'periodEndAmountDr'
        }, {           
            title: <span title='贷方'>贷方</span>,
            name: 'periodEndAmountCr',
            dataIndex: 'periodEndAmountCr',
            className: 'amountColumnStyle',
            width: '15%',
            'render': renderTitle,
            key: 'periodEndAmountCr'
        }]
    }]
    return [accountColumns, baseColumns]
}



