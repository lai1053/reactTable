import { GridDecorator } from 'edf-component'

function getGridOption() {
    return {
        'dataGridCustomer': {
            path: 'data.form.customerList',
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
        'dataGridSupplier': {
            path: 'data.form.supplierList',
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
            path: 'data.form.inventoryList',
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
