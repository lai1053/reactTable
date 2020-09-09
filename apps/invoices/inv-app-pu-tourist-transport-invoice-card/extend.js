import { GridDecorator } from 'edf-component'
function getGridOption() {
    return {
        'mxDetailList': {
            path: 'data.form.mxDetailList',
            cellClassName: 'inv-app-pu-tourist-transport-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'mxlx',//客票类型
                    'mxsf01',//数量
                    'mxsf02',
                    'mxnf01',
                    'mxnf02',//单价
                    'mxnf03',//单价
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