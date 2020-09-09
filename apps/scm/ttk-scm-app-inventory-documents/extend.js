import { GridDecorator } from 'edf-component'
function getGridOption() {
    const gridArr = [
        'tg1.children.inventoryCode',//0
        'tg1.children.inventoryName',//1
        'tg1.children.specification',//2
        'tg1.children.unit',//3
        'tg1.children.quantity',//4
        'tg1.children.price',//5
        'tg1.children.amount',//6
        'tg2.children.absorption',
        'tg2.children.materialCost',
        'tg2.children.laborCost',
        'tg2.children.manufacturCost',
        'tg2.children.otherCost',
    ]
    const gridArr1 = [
        'inventoryCode',//0
        'inventoryName',//1
        'specification',//2
        'unit',//3
        'quantity',//4
        'price',//5
        'amount',//6
        // 'allocationRate',
        // 'directMaterials',
        // 'directLabor',
        // 'manufacturingCost',
        // 'otherCost',
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',

            cellClassName: 'ttk-scm-app-inventory-documents-cell',
            emptyRow: {},
            getColNames: (gf) => {
                let dd = gf('data.form.businessTypeId')
                let isNew = gf('data.other.isNew')
                let type = gf('data.other.type')

                if(dd == '5001001003' && !isNew && type != 4){
                    return gridArr
                }else{
                    return gridArr1
                }
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
                if (res) {
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