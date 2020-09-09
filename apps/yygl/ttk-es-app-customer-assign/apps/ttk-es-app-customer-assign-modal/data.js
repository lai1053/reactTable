import moment from 'moment';
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-customer-assign-modal',
		children: [
			{
				name: 'list',
				component: '::div',
				className: '{{data.type == "dg"?"ttk-es-app-customer-assign-modal-listdg":"ttk-es-app-customer-assign-modal-listpl"}}',
				children: [
                    {
                        name:'gwList',
                        component:'::div',
                        children:'{{data.type=="dg"?$renderDGData(data.list):$renderPLData(data.list)}}'
                    }
				],

			},
            {
                name:'title',
                component:'::div',
                _visible:'{{data.type=="pl"}}',
                style:{width:'85%',position:'relative',left:'8%',bottom:'-20px'},
                children:[{
                    name:'first',
                    component:'::span',
                    style:{color:'#fd9400'},
                    children:'温馨提示：'
                },{
                    name:'second',
                    component:'::span',
                    style:{color:'#666666'},
                    children:'请选择需要分配的岗位和人员，未勾选的岗位将保持原结果，勾选中的岗位如未选择人员则清空该岗位的分配数据'
                }]
            }
		]
	}
}

export function getInitState() {
	return {
		data: {
			percent: 0,
			list: [],
			loading: false,
            user: [],
            userId:[],
			customerList:[],//客户id
            saveData:{
			    fpxxs:{},
                customerList:[]
            },//保存数据
            valu:{},
            dis:{},
		}
	}
}
