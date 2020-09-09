export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-postauthority',
		children: [{
			name: 'left',
			component: 'Card',
			className: 'ttk-es-app-postauthority-left',
			title: '岗位列表',
			children: [
				{
					name:'input',
					component:'Input',
					className:'ttk-es-app-postauthority-left-input',
					value: '{{data.inputSearch}}',
                    onChange: "{{function(e){$sf('data.inputSearch', e.target.value)}}}",
					onPressEnter:'{{$inputSearchEnter}}',
					prefix: {
						name: 'search',
						component: 'Icon',
						type: 'search'
					}
				},
				{
					name: 'tree',
					component: 'Tree',
					className: 'ttk-es-app-postauthority-tree',
					selectedKeys: '{{data.treeSelectedKey}}',
					expandedKeys: '{{data.treeExpandedKeys}}',
					onSelect: '{{$selectType}}',
					onExpand: '{{$treeExpand}}',
					children: '{{$renderTreeNodes(data.other.tree)}}'
				}
			]
		},{
			name: 'content',
			component: 'Card',
			className: 'ttk-es-app-postauthority-right',
			children:[{
				name: 'tabs',
				component: 'Tabs',
				className: 'ttk-es-app-postauthority-tabs',
				defaultActiveKey:"1",
				activeKey: '{{data.activeKey}}',
				// animated: false,
				onChange: '{{$handleTabChange}}',
				children:[{
					name: 'tab1',
					tab:"代账平台",
					component: 'Tabs.TabPane',
					key:"1",
					// children:'{{$renderTab1()}}'
				},{
					name: 'tab2',
					tab:"单户",
					component: 'Tabs.TabPane',
					key:"2",
				},{
					name: 'tab3',
					tab:"管理",
					component: 'Tabs.TabPane',
					key:"3",
				},{
                    name: 'tab4',
                    tab:"运营",
					_visible:'{{data.isOpenOperate}}',
                    component: 'Tabs.TabPane',
                    key:"4",
                }]
			},{
				name: 'body',
                component: '::div',
				className:'ttk-es-app-postauthority-right-body-div',
                // _visible: '{{data.activeKey == "1"}}',
                children: '{{$renderTab()}}'
			},{
				name:'box',
				component:'::div',
				_visible:'{{data.tabShadowVisible}}',
				className:'ttk-es-app-postauthority-right-msgbox',
				children:''
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			// treeSelectedKey: ['2'],
			isOpenOperate:false,
            code:'',
			tabShadowVisible:false,
			treeSelectedKey: [],
            treeExpandedKeys: [],
			inputSearch:'',
			activeKey: '1',
			other: {
				tree:[],
                oldData:[],
				gl:[],
				dh:[],
				plat:[],
				glCopy:[],
				dhCopy:[],
				platCopy:[],
				columns:[
					{filedName: 'modlue', filedTitle: '模块', filedParentName: null},
					// {filedName: 'content1', filedTitle: '模块1', filedParentName: 'modlue'},
					// {filedName: 'content2', filedTitle: '模块2', filedParentName: 'modlue'},
					// {filedName: 'content3', filedTitle: '模块3', filedParentName: 'modlue'},
					// {filedName: 'permissions', filedTitle: '功能权限', filedParentName: null}
				],
				flag: '',
				loading: true
			}
		}

	};
}
