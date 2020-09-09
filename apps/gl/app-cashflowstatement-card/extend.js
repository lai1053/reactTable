import {GridDecorator} from 'edf-component'

function getGridOption() {
	return {
		'dataGrid': {
			path: 'data.list',
			selectFieldName: 'selected',
			cellClassName: 'app-archives-list-cell',
			emptyRow: {},
			getColNames: (gf) => {
				return ["voucherDate", "cashFlowItem", "cashFlowDirectionName", "amount"]
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
