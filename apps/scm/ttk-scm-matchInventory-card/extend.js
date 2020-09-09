import {GridDecorator} from 'edf-component'

function getGridOption() {
	return {
		'details': {
			path: 'data.form.details',
			selectFieldName: 'selected',
			cellClassName: 'app-pu-arrival-card-cell',
			emptyRow: {},
			getColNames: (gf) => {
				return [
                    'name',
				]
			},
			cellIsReadonly: (cellPosition, path, gf) => {
				if (cellPosition.x == 1
                    || cellPosition.x == 2
                    || cellPosition.x == 3
                    || cellPosition.x == 9)
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
