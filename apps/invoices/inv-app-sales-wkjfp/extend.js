import { GridDecorator } from 'edf-component'

function getGridOption() {
    const gridArr = [
        "hwmc", //服务名称
        "spbm", //编码
        "ggxh", //规格
        "dw", //单位
        "sl", //数量
        "dj", //单价
        "hsje", //含税金额
        "je", //金额
        "slv", //税率
        "se", // 税额
        "hwlxDm", // 货物类型
        "jsfsDm", // 计税方式
        "jzjtDm" // 即征即退标识
    ]
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'inv-app-sales-zzsfp-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return gridArr
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