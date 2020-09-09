import {GridDecorator} from 'edf-component'
function getGridOption() {

    return {
        'mxDetailList': {
            path: 'data.form.mxDetailList',
            selectFieldName: 'selected',
            cellClassName: 'inv-app-pu-vats-invoice-card-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'cph',//原凭证号
                    'mxlx',//税种
                    'mxsf02',//品目名称
                    'txrq',//税款所属期
                    'txrz',//税款所属期
                    'mxsf01',//入库日期
                    'se',//实缴金额
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