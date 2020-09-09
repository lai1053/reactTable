function initColumn(column, _this) {
    let resColumns = []
    column.map((item, index) => {
        if (item.fieldName == 'categoryName') {
            item.render = _this.getLargeClassColumn
        } else if (item.fieldName == 'code') {
            item.render = _this.getCode
        } else if (item.fieldName == 'oper') {
            item.render = _this.getOperColumn
        } else {
            item.render = _this.getOtherContent
        }
        resColumns.push(item)
    })
    return resColumns
}

export default function renderColumns(tableList, incomeexpensesTabId, _this, baseUrl, bigScaleTaxPayer, softAppName) {

    let columns = [
        { fieldName: 'code', title: '编码', dataIndex: 'code', key: 'code', width: 120 },
        { fieldName: 'name', title: '', dataIndex: 'name', key: 'name', width: 250 },
        { fieldName: 'accountName', title: '默认关联科目', dataIndex: 'accountName', key: 'accountName', },
        { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
    ]
    if (!baseUrl) {
        if (incomeexpensesTabId == '2001003') {
            columns[1].title = '收入类型'
        } else if (incomeexpensesTabId == '4001001') {
            columns[1].title = '费用类型'
        } else if (incomeexpensesTabId == '3001002') {
            columns[1].title = '收款类型'
            columns.unshift({ fieldName: 'categoryName', title: '收款大类', dataIndex: 'categoryName', key: 'categoryName', width: 150 })
        } else if (incomeexpensesTabId == '3001001') {
            columns[1].title = '付款类型'
            columns.unshift({ fieldName: 'categoryName', title: '付款大类', dataIndex: 'categoryName', key: 'categoryName', width: 150 })
        }
    }
    else {
        //tplus
        if (incomeexpensesTabId == '2001003') {
            columns = [
                { fieldName: 'code', title: '编码', dataIndex: 'code', key: 'code', width: 120 },
                { fieldName: 'name', title: '收入类型', dataIndex: 'name', key: 'name', width: 250 },
                { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName' },
                { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
            ]
        }
        else if (incomeexpensesTabId == '4001001') {
            columns = [
                { fieldName: 'code', title: '编码', dataIndex: 'code', key: 'code', width: 120 },
                { fieldName: 'name', title: '费用类型', dataIndex: 'name', key: 'name', width: 250 },
                { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName' },
                { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
            ]
        }
        else if (incomeexpensesTabId == '1000000') {
            columns = [

                { fieldName: 'archiveName', title: '结算方式', dataIndex: 'archiveName', key: 'archiveName', width: 250 },
                { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName', },
                { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
            ]
        }
        else if (incomeexpensesTabId == '2000000') {
            columns = [
                // { fieldName: 'code', title: '编码', dataIndex: 'code', key: 'code', width: 120 },
                { fieldName: 'name', title: '存货类别', dataIndex: 'name', key: 'name', width: 250 },
                { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName', },
                { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
            ]
        }
        else if (incomeexpensesTabId == '3000000') {
            if (bigScaleTaxPayer) {
                columns = [
                    { fieldName: 'businessName', title: '业务名称', dataIndex: 'businessName', key: 'businessName', width: 250 },
                    { fieldName: 'name', title: '计税方式', dataIndex: 'name', key: 'name', width: 250 },
                    { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName', },
                    { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
                ]
            } else {
                columns = [
                    { fieldName: 'businessName', title: '业务名称', dataIndex: 'businessName', key: 'businessName', width: 250 },
                    { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName', },
                    { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
                ]
            }
        }
        else if (incomeexpensesTabId == '4000000') {
            columns = [
                { fieldName: 'businessName', title: '资产属性', dataIndex: 'businessName', key: 'businessName', width: 250 },
                { fieldName: 'name', title: '资产分类', dataIndex: 'name', key: 'name', width: 250 },
                { fieldName: 'accountName', title: `${softAppName}科目`, dataIndex: 'accountName', key: 'accountName', },
                { fieldName: 'oper', title: '操作', dataIndex: 'oper', key: 'oper', width: 99 },
            ]
        }
    }
    //if (tableList) 
    return initColumn(columns, _this)
}
