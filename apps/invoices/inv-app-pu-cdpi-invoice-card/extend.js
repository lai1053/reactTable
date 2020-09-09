import {GridDecorator} from 'edf-component'
function getGridOption() {

    return {
        'mxDetailList': {
            path: 'data.form.mxDetailList',
            selectFieldName: 'selected',
            cellClassName: 'inv-app-pu-cdpi-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'hwmc',//品名
                    'sl',//数量
                    'dw',//单位
                    'slv',//税率
                    'je',//完税金额
                    'se',//税款金额
                    "jzjtDm" // 即征即退标识
                ]
            },
        },
    }
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