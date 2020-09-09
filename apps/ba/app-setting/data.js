import * as action from './action'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-setting',
		children:[
			getHeaderMeta(),
			getContentMeta()
		]
	}
}
export function getHeaderMeta() {
	return {
		name: 'header',
		component: '::div',
		className: 'mk-list-header-right',
		children: {
			name:'recover',
			component:'Button',
			onClick:'{{$handleRecover}}',
			type:'showy',
			children:'恢复默认'
		}
	}
}

export function getContentMeta() {
	return {
		name: 'content',
		component: 'Layout',
		className: 'mk-list-content',
		children:getTabMeta()
	}
}
export function getTabMeta() {
	return {
		name: 'headTabList',
		component: 'Tabs',
		animated: false,
		defaultActiveKey:'{{data.isVoucher? "1":"0"}}',
		children: [{
				name: 'list',
				tab: '列表',
				key: "0",
				component: 'Tabs.TabPane',
				_visible:'{{!data.isVoucher}}',
				children: '{{{return !data.isVoucher ? $getListChildren(data.form,"list"):""}}}'
			},{
				name: 'voucherHead',
				tab: '表头',
				key: "1",
				component: 'Tabs.TabPane',
				_visible:'{{data.isVoucher}}',
				children: '{{{return data.isVoucher ? $getListChildren(data.form,"head"):""}}}'
			}, {
				name: 'voucherBody',
				tab: '表体',
				key: "2",
				component: 'Tabs.TabPane',
				_visible:'{{data.isVoucher}}',
				children: '{{{return data.isVoucher ? $getListChildren(data.form,"body"):""}}}'
			}]
	}
}

export function getInitState() {
	return {
		data: {
			content: 'hello world',
			isVoucher:true
		}
	}
}
