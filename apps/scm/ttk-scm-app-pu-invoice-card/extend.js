import {GridDecorator} from 'edf-component'
function getGridOption() {
    const gridArr = [
        'propertyName',
        // 'code',//
        'inventoryName',//
        'inventoryRelatedAccountName',
        'inventoryCode',//
        'specification',//
        'unit',//
        'quantity', //
        'price',
        'amount',
        'taxRate',
        'tax',
        'taxInclusiveAmount',
        'inventoryType',
        // 'taxRateType'
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',

            cellClassName: 'ttk-scm-app-pu-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return gridArr
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                let flag = getColumnVisible(gridArr[cellPosition.x], gf)
                if (cellPosition.x == 3
                    || cellPosition.x == 4
                    || cellPosition.x == 5
                    || !flag)
                    return true

                return false
            }
        },
    }
}

function getColumnVisible(params, gf) {
    let columnSetting = gf('data.other.columnSetting'), visible = true
    columnSetting = columnSetting && columnSetting.toJS()
    // console.log(params)
    if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
        columnSetting.body.tables.forEach((item) => {
            if (item.details.length != 0) {
                const res = item.details.find(o => o.fieldName == params)
                if( res ) {
                    return visible = res.isVisible
                }else if( params == 'inventoryRelatedAccountName' ) { // 总有一些莫名其秒的东西，这个字段明明是来着后端，但有的时候他竟然还没有。 单独处理吧。
                    return visible = false
                }
            }
            
        })
    }
    return visible
}

function actionCreator(option) {
    return {
        gridAction: new GridDecorator.action({ ...option, gridOption: getGridOption() })
    }
}

function reducerCreator(option) {
    return {
        gridReducer: new GridDecorator.reducer({ ...option, gridOption: getGridOption() })
    }
}

export default {
    actionCreator,
    reducerCreator
}