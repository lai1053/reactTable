import {GridDecorator} from 'edf-component'
function getGridOption() {
    const gridArr = [
        'propertyName',
        'inventoryCode',//0
        'inventoryName',//1
        'specification',//2
        'unit',//3
        'quantity',//4
        'price',//5
       // 'amount',//6
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'app-scm-raw-material-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return gridArr
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                let flag = getColumnVisible(gridArr[cellPosition.x], gf)
                if (cellPosition.x == 2
                    || cellPosition.x == 3 || !flag)
                    return true

                return false
            }
        },
    }
}

function getColumnVisible(params, gf) {
    let columnSetting = gf('data.setting'), visible = true
    columnSetting = columnSetting && columnSetting.toJS()
    console.log(params)
    if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
        columnSetting.body.tables.forEach((item) => {
            if (item.details.length != 0) {
                const res = item.details.find(o => o.fieldName == params)
                if( res ) {
                    return visible = res.isVisible
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