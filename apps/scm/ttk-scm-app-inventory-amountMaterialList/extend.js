import {GridDecorator} from 'edf-component'

function getGridOption() {
	const gridArr = [
		'tg1.children.inventoryCode',//0
        'tg1.children.inventoryName',//1
        'tg1.children.specification',//2
		'tg1.children.unit',//3
		'tg2.children.periodEndQuantity', //4
		'tg2.children.periodEndAmount',//5
        'tg3.children.quantity',//6
        'tg3.children.price',//7
		'tg3.children.amount',//8
		'tg4.children.gapQuantity',//9
        'tg4.children.gapAmount',//10
    ]
	return {
		'dataGrid': {
			path: 'data.form.details',
			selectFieldName: 'selected',
			cellClassName: 'ttk-scm-app-inventory-amountMaterialList-cell',
			emptyRow: {},
			getColNames: (gf) => {
				return gridArr
			},
			cellIsReadonly: (cellPosition, path, gf) => {
				if (cellPosition.x == 2
                    || cellPosition.x == 3
					|| cellPosition.x == 4
					|| cellPosition.x == 5
					|| cellPosition.x == 7
					|| cellPosition.x == 9
					|| cellPosition.x == 10)
                    return true

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
