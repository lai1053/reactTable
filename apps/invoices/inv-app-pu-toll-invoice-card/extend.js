import {GridDecorator} from 'edf-component'
function getGridOption() {

    return {
        'mxDetailList': {
            path: 'data.form.mxDetailList',
            selectFieldName: 'selected',
            cellClassName: 'inv-app-pu-toll-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'hwmc',//项目名称
                    'cph',//车牌号
                    'ggxh',//规格型号
                    'mxlx',//类型
                    'txrqq',//通行日期起
                    'txrqz',//通行日期止
                    'je',//金额
                    'slv',//税率
                    'se',//税额
                    'jzjtDm'
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