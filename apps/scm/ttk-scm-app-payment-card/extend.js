import {GridDecorator} from 'edf-component'
function getGridOption() {
    const gridArr = [
        'proceedsType',//0
        'deptPerson',//1
        'department',//2
        'project',//3
        'amount',//4
        'quantity',//5
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'ttk-scm-app-payment-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return gridArr
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                let flag = getColumnVisible(gridArr[cellPosition.x], gf)
                let form = gf(`data.form.details`).toJS()
                //当第一项没有选中值得时候第二项不可选，所以跳过
                if (!flag || (cellPosition.x == 1 && !form[cellPosition.y].calcObject)) {
                    console.log('跳过')
                    return true
                }
                    

                return false
            },
            needBreak: () => {
                let dom = document.querySelector('.ttk-scm-app-payment-card-Cascader')
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
