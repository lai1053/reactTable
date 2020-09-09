import { GridDecorator } from 'edf-component'

function getGridOption() {   
    return {
        'details': {
            path: 'data.list',            
            getColNames: (gf) => {
                return [
                    'sourceAccount.children.sourceCode',
                    'sourceAccount.children.sourceName',
                    'sourceAccount.children.sourceBalance',
                    'sourceAccount.children.sourceCurrency',
                    'sourceAccount.children.sourceUnit',
                    'sourceAccount.children.sourceStatus',
                    'targetAccount.children.code',
                    'targetAccount.children.name',
                    'targetAccount.children.balanceDirectionName',
                    'targetAccount.children.AuxAccCalcInfo',
                    'targetAccount.children.currencyName',
                    'targetAccount.children.unitName',
                    'targetAccount.children.isEnable',
                    'moreAction.children.msg',
                    'moreAction.children.operation',
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