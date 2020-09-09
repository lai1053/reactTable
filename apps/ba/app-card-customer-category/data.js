import moment from 'moment';

export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'app-card-customer-category',
        children: [{
			name: 'customerSort',
			component: 'Card',
			className: 'app-card-customer-category-content',
			title: '操作',
			extra: {
				name: 'header',
				component: '::div',
				children: [{
					name: 'add',
					component: 'Button',
					style: { marginRight: '8px' },
					icon: 'plus',
					onClick: '{{$addCat}}'
				}, {
					name: 'modify',
					component: 'Button',
					style: { marginRight: '8px' },
					icon: 'edit',
					onClick: '{{$editCat}}'
				}, {
					name: 'del',
					component: 'Button',
					icon: 'close',
					onClick: '{{$delCat}}'
				}]
			},
			children: {
				name: 'tree',
				component: 'Tree',
				className: 'edfx-deptPers-tree',
				defaultExpandedKeys: '{{["genid"]}}',
				selectedKeys: '{{data.treeSelectedKey}}',
				onSelect: '{{$selectType}}',
				children: '{{$renderTreeNodes(data.other.tree)}}'
			}
		}]
    }
}

export function getInitState() {
	return {
		data: {
			linkT:true,
			form: {
				code: '',
				name: '',
				isEnable: true,
				glAccounts:''
			},
			baseArchiveType:'',
			persName: '人员',
			user: {},
			list: [],
			entity:{
				fuzzyCondition:""
			},
			departId:'',
			departCode:'',
			isDelDept: true,
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			filter: {},
			other: {},
			status: {
				isDeptCreater: ''
			},
			expandedKeys: [],
			treeSelectedKey: [],
			
		}
	};
}
