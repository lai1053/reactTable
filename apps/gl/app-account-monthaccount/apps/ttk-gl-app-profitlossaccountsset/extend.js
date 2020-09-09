import { GridDecorator } from 'edf-component'

function getGridOption() {
    return {        
        'profitlossDetails': {
            path: 'data.profitLossList',
            selectFieldName: 'selected',
            cellClassName: 'ttk-gl-app-profitlossaccountsset-cell',
            emptyRow: {},
            getColNames: () => {
                return ['profitlossAccount']
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
