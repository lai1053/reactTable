import {GridDecorator} from 'edf-component'
function getGridOption() {
	return {}
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