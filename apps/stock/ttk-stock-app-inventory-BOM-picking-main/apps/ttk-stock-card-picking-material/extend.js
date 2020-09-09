import {GridDecorator} from 'edf-component'
function getGridOption() {
    
    const gridArr = [
        // 'num',//0
        // 'pices',//1
        // 'taxRate',//3
        // 'taxAmount',//4
        // 'fees',//5
        // 'pices',
        // 'quantity',
        'inventoryCode',  //存货编码
        'inventoryName',    //存货名称
        'inventoryUnit',    //单位
        'inventoryGuiGe',    //规格型号
        'inventoryId',   //存货id
        'inventoryClassName',   //存货类型名称
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'ttk-scm-app-proceeds-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return gridArr
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                
                let flag = getColumnVisible(gridArr[cellPosition.x], gf)
                let form = gf(`data.form.details`).toJS()
                //当第一项没有选中值得时候第二项不可选，所以跳过
                if (!flag || (cellPosition.x == 1 && !form[cellPosition.y].calcObject)) {
                    return true
                }
                return false
            },
            needBreak: () => {
                let dom = document.querySelector('.ttk-scm-app-proceeds-card-Cascader')
                if( dom && !dom.className.includes('ant-cascader-menus-hidden')) {
                    return true
                }else{
                    return false
                }
            }
        },
    }
}

function getColumnVisible(params, gf) {
    let columnSetting = gf('data.other.columnSetting'), visible = true
    columnSetting = columnSetting && columnSetting.toJS()
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
