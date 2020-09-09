import { GridDecorator } from 'edf-component'

function getGridOption() {
    return {
        'dataGridSupplier': {
            path: `data.table.0.list`,
            selectFieldName: 'selected',
            cellClassName: 'get-voucher-list-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return []
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                return false
            }
        },
        'dataGridCustomer': {
            path: `data.table.1.list`,
            selectFieldName: 'selected',
            cellClassName: 'get-voucher-list-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return []
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                return false
            }
        },
        'dataGridInventory': {
            path: `data.table.2.list`,
            selectFieldName: 'selected',
            cellClassName: 'get-voucher-list-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return []
            },
            cellIsReadonly: (cellPosition, path, gf) => {
                return false
            }
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
