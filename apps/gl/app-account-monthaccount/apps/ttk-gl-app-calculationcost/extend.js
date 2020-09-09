import { GridDecorator } from 'edf-component'

function getGridOption() {    
    return {
        'details': {
            path: 'data.form.details',
            selectFieldName: 'selected',
            cellClassName: 'tk-gl-app-calculationcost-cell',
            emptyRow: {},
            
            getColNames: (gf) => {
                // let headList = gf('data.other.headList'),
                //     res = []
                // if (headList && headList.size > 0) {
                //     res = headList.map(item => { return `tg14.children.${item.get('code')}` }).toJS()
                // } 
                return [
                    'tg0.children.code',
                    'tg0.children.name',
                    'tg1.children.beginQuantity',
                    'tg1.children.beginAmount',
                    'tg2.children.addQuantity',
                    'tg2.children.addAmount',
                    'tg3.children.preAddQuantity',
                    'tg3.children.preAddAmount',
                    'tg4.children.subPrice',
                    'tg4.children.subQuantity',
                    'tg4.children.subAmount',
                    'tg5.children.endQuantity',
                    'tg5.children.endAmount',
                    'tg12.children.saleQuantity',
                    'tg12.children.saleAmount',
                    'tg13.children.finishQuantity'                    
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
