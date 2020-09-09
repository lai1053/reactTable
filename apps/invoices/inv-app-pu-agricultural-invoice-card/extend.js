import {GridDecorator} from 'edf-component'
function getGridOption() {

    return {
        'mxDetailList': {
            path: 'data.form.mxDetailList',
            selectFieldName: 'selected',
            cellClassName: 'inv-app-pu-agricultural-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'hwmc',//服务名称
                    'ggxh',//规格型号
                    'dw',//单位
                    'sl',//数量
                    //'dj',//单价
                    'je',//金额
                    'slv',//税率
                    'se',//税额
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