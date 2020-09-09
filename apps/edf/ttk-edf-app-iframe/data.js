export function getMeta() {
	return {
		name: 'root',
        className: '{{data.other.bsgztAccess == 1 ? (data.dzgl ? "ttk-edf-app-iframe dzgl topImportant" : "ttk-edf-app-iframe topImportant") : (data.dzgl ? "ttk-edf-app-iframe dzgl" : "ttk-edf-app-iframe")}}',
		component: '::div',
		children: [{
			name: 'iframeContainer',
			component: '::div',
			className: 'iframeContainer',
			style: "{{ data.other.showBackBtn ? {bottom: '50px'} : {bottom: '0px'} }}",
			children: {
				name: 'ttkIframe',
				id: 'ttkIframe',
				key: '{{data.random}}',
				className: 'ttk-edf-app-iframe-iframe',
				onload: '{{$changeFrameHeight}}',
				component: '::iframe',
				height: '600',
				scrolling: 'auto',
				src: '{{data.src}}',
			}
		}, {
			name: 'backBtn',
			component: '::div',
			_visible: '{{data.appVersion == 105 && data.other.showBackBtn}}',
			style: {position: 'absolute', bottom: '0px', left: '0', width: '100%', height: '50px', textAlign: 'center', paddingTop: '10px'},
			children: {
				name: 'btn',
				component: 'Button',
				onClick: '{{$backBtnClick}}',
				type: 'primary',
				children: '返回清册'
			}
		}]
	}
}

export function getInitState() {
    //判断是否是报税工作台
    let bsgztAccess = sessionStorage['thirdPartysourceType'] == 'bsgzt' ? 1 : 0
	return {
		data: {
			src: '',
			random: Math.random(),
			other: {
                bsgztAccess, //办税工作台对接
				showBackBtn: false
			},
			dzgl:false
		}
	}
}
