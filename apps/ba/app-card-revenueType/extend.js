import {GridDecorator} from 'edf-component'

function getGridOption() {
	return {
		'details': {
			path: 'data.form.details',
			selectFieldName: 'selected',
			// cellClassName: 'app-card-revenueType-cell',
			cellClassName: 'noPadding',
			emptyRow: {},
			getColNames: (gf) => {
				return [
					'code',
					'operation'
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
