import { GridDecorator } from 'edf-component'

function getGridOption() {
    return {
        'details': {
            path: 'data.list',
            selectFieldName: 'selected',
            cellClassName: 'ttk-gl-app-accountrelationsset-cell',
            emptyRow: {},
            getColNames: () => {
                return ['inventoryAccount','incomeAccount','costAccount']
            }
        },
        'inventoryDetails': {
            path: 'data.inventoryList',
            selectFieldName: 'selected',
            cellClassName: 'ttk-gl-app-accountrelationsset-cell',
            emptyRow: {},
            getColNames: () => {
                return ['inventoryAccount', 'incomeAccount']
            }
        },
        'costDetails': {
            path: 'data.listSecond',
            selectFieldName: 'selected',
            cellClassName: 'ttk-gl-app-accountrelationsset-cell',
            emptyRow: {},
            getColNames: () => {
                return ['costAccount']
            }
        }

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
