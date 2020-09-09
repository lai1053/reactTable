import {GridDecorator} from 'edf-component'

function getGridOption() {
	return {
		'details': {
			path: 'data.list',
			//selectFieldName: 'selected',
			cellClassName: 'app-archives-list-cell',
			emptyRow: {},
			getColNames: (gf) => {
				return []
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
// if(periodData.type=="month"){
    
//     if( current == periodData.name&&periodData.period != 1){
//         this.metaAction.sf('data.isBeginningPeriodShow',true)
//     }else{
//         this.metaAction.sf('data.isBeginningPeriodShow',false)
//     }
// }else if(periodData.type=="quarter"){
//     if(parseInt(currentMonth)!=1&&periodData.name==periodList[periodList.length-1]['name']){
//         this.metaAction.sf('data.isBeginningPeriodShow',true)
//     }else{
//         this.metaAction.sf('data.isBeginningPeriodShow',false)
//     }
// }