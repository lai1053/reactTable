import {GridDecorator} from 'edf-component'

function getGridOption() {
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'app-proof-of-charge-common-edit-cell',
            emptyRow: {},
            getColNames: (gf) => {
                return [
                    'summary',
                    'accountingSubject',
                    'debitAmount',
                    'creditAmount',
                ]
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
