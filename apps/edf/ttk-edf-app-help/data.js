export function getMeta() {
	return {
		name: 'root',
        className: 'ttk-edf-app-help',
		component: '::div',
		children: [
		// 	{
		// 	name: 'Spin',
		// 	component: '::div',
		// 	_visible:'{{data.other.loading}}',
		// 	// _visible:true,
		// 	className:'iframeLoading',
		// 	children: {
		// 		component: 'Spin',
		// 		delay:100,
		// 		size:'large',
		// 		spinning:'{{data.other.loading}}',
		// 		tip:'正在加载...'
		// 	// 	name: 'userIcon',
		// 	// 	className: 'refresh-btn',
		// 	// 	component: 'Icon',
		// 	// 	style:{fontSize:'28px',color:'#0066B3'},
		// 	// 	type: 'loading-3-quarters',
		// 	// 	spin:true,
		// 	}
		// },
		{
			name: 'iframeContainer',
			component: '::div',
			className: 'iframeContainer',
			style: "{{ data.other.showBackBtn ? {bottom: '50px'} : {bottom: '0px'} }}",
			children: {
				name: 'ttkIframe',
				id: 'ttkIframe',
				key: '{{data.random}}',
				className: 'ttk-edf-app-help-iframe',
				onload: '{{$changeFrameHeight}}',
				component: '::iframe',
				readystatechange : '{{$changeFrameHeight}}',
				scrolling: 'auto',
				src:'{{data.src}}'
				// src:'https://erpdoc.jchl.com/UserManual/7231587313084416.html'
			}
		}, 
	]
	}
}

export function getInitState() {
	return {
		data: {
			src: '',
			random: Math.random(),
			other:{
				loading:true
			}
		}
	}
}
