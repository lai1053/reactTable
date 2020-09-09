import {columnData}  from './staticField'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-importdata-login-list',
        // spinning: '{{data.other.loading}}',        
        children: [
			{
				name:'header',
				component:'::div',
				className: 'ttk-gl-app-importdata-login-list-content-form',
				children:[ {
                    name: 'form',
					component: 'Form',
					style:{
						height:'100px'
					},
					children: [{
						name: 'item1',
						component: 'Form.Item',
						className: 'ttk-gl-app-importdata-login-list-content-form-title',
						style:{
							color: '#4f55bf',
							fontSize: '22px'
						},
						children: '在线导账'
					}, {
						name: 'item1',
						component: 'Form.Item',
						label: '软件版本',
						style:{
							color: '#4f55bf'
						},
						className: 'ttk-gl-app-importdata-login-list-content-form-mobile',
						children: [{
							name: 'inquiryMode',
							component: '::span',
							style:{
								color:'#000',
								top: '-2px',
								position: 'relative'
							},
							className: 'headerDropDown',
							children:'{{data.selectTimeTitle}}'
						}]
					}, {
						name: 'item5',
						component: 'Form.Item',
						className: 'ttk-gl-app-importdata-login-list-content-form-login',
						children: [{
							name: 'loginBtn',
							component: 'Button',
							type: 'softly',
							children: '切换软件版本',
							onClick: "{{$changeSelectTimeTitle}}",
						}]
					}]
				}, 
				//  {
				// 	name: 'tabellist',
				// 	style: {
				// 		height: '280px'
				// 	},
				// 	className:'ttk-gl-app-importdata-login-list-list-content',
				// 	component: '::div',
				// 	children: '{{$renderModal()}}',
				// },  
				{
					name: 'tabellist',
					style: {
						height: '280px',
						padding:'0px 10px'

					},
					component: '::div',
					children: [{
						name: 'voucherItems',
						component: 'Table',
						pagination: false,
						loading: '{{data.loading}}',
						className: 'ttk-gl-app-importdata-login-list-table-tbody',
						scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
						allowColResize: false,
						enableSequenceColumn: false,
						bordered: true,
						dataSource: '{{data.list}}',
						columns: '{{$renderColumns()}}',
					}]
				},
				{
					name: 'form1',
					component: 'Form',
					style:{
						paddingTop: '10px'
					},
					children: [{
						name: 'item1',
						component: 'Form.Item',
						label: '账套名称：',
						style:{
							width: '70%'
						},
						className: 'ttk-gl-app-importdata-login-list-content-form-mobile',
						children: [{
							name: 'mobile',
							component: 'Input',
							placeholder: '请输入账套名称',
							value: '{{data.form.mobile}}',
							onChange: "{{function (e) {$sf('data.form.mobile', e.target.value)}}}",
						}]
					}, {
						name: 'item5',
						component: 'Form.Item',
						style:{
							width: '25%'
						},
						className: 'ttk-gl-app-importdata-login-list-content-form-login',
						children: [{
							name: 'loginBtn',
							component: 'Button',
							type: 'softly',
							style:{
								width: '70px'
							},
							children: '查询',
							onClick: '{{$query}}'
						}]
					}]
				},{
					name: 'form2',
					component: 'Form',
					children: [{
						name: 'item5',
						style:{
							width: '100%',
							right: '-40px'
						},
						component: 'Form.Item',
						className: 'ttk-gl-app-importdata-login-list-content-form-foot',
						children: [{
							name: 'loginBtn',
							disabled: '{{$checkLogin()}}',
							component: 'Button',
							type: 'softly',

							style:{
								width: '90px'
							},
							children: '采集导入',
							onClick: '{{$export}}'
						}]
					}]
				}]
			},
               
        ]
    }
}

export function getInitState() {
	return {
		data: {
			flag:true,
			selectTimeTitle:'',
			selectTimeData:[
				{
					name:'测试用例'
				},
				{
					name:'测试用例1'
				},
				{
					name:'测试用例2'
				},
				{
					name:'测试用例3'
				}
			],
			form: {
				account: '',
				password: '',
				mobile: '',
				remember: false,
			},
			other: {
				error: {},
				selectedImgIndex: 0,
				imgs: [],
				userInput: false,
				checkTips: false,
				version: '',
			},
			tableOption:{
				y: 200,
				x: '100%'
			},
			columns:columnData,
			selectOptions:[],
			selectedRowKeys: [],
			visible: false,
			spbmFilterList: [],
			list:[],
		}
	}
}



