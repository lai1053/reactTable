export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-ztmanage-import-success',
		children: [
			{
				name:'title',
				component:'::div',
				style:{
					textAlign:'center',
					marginBottom:'10px'
				},
				children:[
					{
						name:'title1',
						component: 'Icon',
						fontFamily: 'edficon',
						className:'green',
						type:'XDZdanchuang-chenggong',
					},
					{
						name:'title2',
						component:'::span',
						className:'title',
						children:'导账成功',
					}
				]
			},
			{
				name:'title3',
				component:'::div',
				style:{color:'red',textAlign:'center',marginBottom:'5px'},
				children:'请及时核对财务期初数据、会计科目、基础档案及历史凭证是否正确。'
			},
			// {
			// 	name: 'list',
			// 	component: '::div',
			// 	style:{height:'200px'},
			// 	children: '{{$renderStatement(data.list)}}'
			// },
			{
				name: 'spin',
				component: 'Spin',
				tip: '请稍等,数据在导入中...',
				spinning: '{{data.loading}}',
				className: 'ant-spin-container',
				size: 'large',
				children: '{{$renderTips()}}'
			},
			{
				name:'checkbox',
				component:'::div',
				className:'ttk-es-app-ztmanage-import-success-checkbox',
				children:[
					{
						name:'checkbox1',
						component:'Checkbox',
						checked: '{{data.isEnable}}',
						onChange: "{{function(e){$sf('data.isEnable',e.target.checked)}}}"
					},
					{
						name:'checkbox2',
						component:'::span',
						children:'以后不再提示'
					}
				]
			}
		]
	}		
}

export function getInitState() {
	return {
		data: {
			percent: 0,
			orgId:'',
			// loading: false,
			isEnable:false,
			loading: false,
			other: {
				sucessinfos: [],
				converseInfo: {
					'SDVoucher': '凭证',
					'SDAcctAmount': '期初',
					'SDAccount': '科目',
					'SDCustomer': '客户',
					'SDdepartment': '部门',
					'SDEmployee': '人员',
					'SDSupply': '供应商',
					'SDUserItem': '自定义档案',
					'SDBankAccount': '银行账户',
					'SDCurrency': '币种',
					'SDInventory': '存货',
					'SDProject': '项目',
					'SDUnit': '计量单位'
				}
			}
		}
	}
}
