export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-dzgl-app-frame',
		children: [{
			name: 'top',
			component: '::div',
			className: 'ttk-dzgl-app-frame-top',
			children: [{
				name: 'logoContainer',
				component: '::div',
				className: 'ttk-dzgl-app-frame-top-logoContainer',
				children: [{
					name: 'logo',
					component: '::img',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_erp.png'}}"
				}]
			}, {
				name: 'org',
				component: '::div',
				className: 'ttk-dzgl-app-frame-top-orgName',
				children: {
					name: 'currentOrg',
					component: '::span',
					title: '{{data.orgName}}',
					children: '{{data.orgName}}'
				}
			}]
		}, {
			name: 'content',
			component: '::div',
			className: 'ttk-dzgl-app-frame-content',
			_visible: '{{!!data.appName}}',
			children: {
				name: 'app',
				component: 'AppLoader',
				appName: '{{data.appName}}',
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			orgName: '',
			appName: null
		}
	}
}