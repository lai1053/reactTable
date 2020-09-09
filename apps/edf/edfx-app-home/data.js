export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-home',
		children: [{
			name: 'scrollBar',
			component:'::div',
			className: 'edfx-app-home-scrollBar',
			children: [{
				name: 'content',
				component: '::div',
				key: '{{data.other.mathRandom}}',
				className: 'edfx-app-home-content',
				// onScroll: '{{$desktopScroll}}',
				children: [{
					name: 'panel',
					component: '::div',
					className: '{{(data.other.dataState[data.desktopAppList[_rowIndex].appName].empty || false) && $isFilterNeeded()}}',
					cust_appname: '{{data.desktopAppList[_rowIndex].appName}}',
					cust_ratio: '2',
					style: "{{$calculateWidth(data.desktopAppList[_rowIndex].widthRatio)}}",
					children: {
						name: 'card',
						component: 'Card',
						onMouseOver: '{{(data.other.dataState[data.desktopAppList[_rowIndex].appName].empty || false) && function() {$mouseOverEvent(data.other.dataState[data.desktopAppList[_rowIndex].appName].empty, data.desktopAppList[_rowIndex].appName)}}}',
						onMouseLeave: '{{(data.other.dataState[data.desktopAppList[_rowIndex].appName].empty || false) && function() {$mouseLeaveEvent(data.other.dataState[data.desktopAppList[_rowIndex].appName].empty, data.desktopAppList[_rowIndex].appName)}}}',
						children: [{
							name: 'app',
							component: 'AppLoader',
							callback:'{{$zoom}}',
							isExpire: '{{data.other.isExpire}}',
							appName: '{{data.desktopAppList[_rowIndex].appName}}',
							hasData: '{{data.other.dataState[data.desktopAppList[_rowIndex].appName].empty || false}}',
							appIndex: '{{data.desktopAppList[_rowIndex].showIndex}}',
							enterScreen: '{{data.desktopAppList[_rowIndex].enterScreen}}',
							data: '{{data.data[data.desktopAppList[_rowIndex].appName]}}',
							period: '{{data.other.period}}',
							systemDate: '{{data.other.systemDate}}'
						}]
					},
					_power: 'for in data.desktopAppList'
				}, {
					name: 'clear',
					component: '::div',
					style: {clear: 'both', height: '0', padding: '0', margin: '0'},
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			zoom: false,
			periodList:[],
			zoomValue: undefined,
			animation: 'in',
			showPanel: 'none',
			hotSearch:'',
			sale:'',
			visit:'',
			periodList: [],
			other: {
				mathRandom: Math.random(),
				isMax: false
			}
		}
	}
}