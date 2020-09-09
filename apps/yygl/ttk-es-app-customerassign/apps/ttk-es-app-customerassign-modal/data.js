import moment from 'moment';
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-customerassign-modal',
		children: [
			{
				name: 'list',
				component: '::div',
				style:{height:'200px',position:'relative'},
				className: 'ttk-es-app-customerassign-modal-list',
				children: [
					/*{
						name:'jobList',
						component:'::div',
						style:{marginBottom:'18px'},
						children:[
							{
								name:'checkbox',
								component:'Checkbox',
								style:{margin:'0 8px 0 56px'},
								onChange:'{{function(e){$changeStatus(e,_rowIndex),$showUser(e,data.list[_rowIndex].id)}}}'

							},
							{
								name:'span',
								component:'::span',
								style:{color:'#333',fontSize:'12px',},
								children:'{{data.list[_rowIndex].name + "："}}'
							},
							{
								name:'select',
								component:'Select',
								disabled:'{{data.list[_rowIndex].isEdit}}',
								style:{width:'260px'},
								getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
								value:'{{$changeSelect}}',
								onChange:'{{}}',
								// children: {
								// 	name: 'option',
								// 	component: 'Select.Option',
								// 	children: '{{data.user[_rowIndex].name}}',
								// 	value: '{{data.user[_rowIndex].sysUserId}}',
								// 	_power: 'for in data.user'
								// }
								children:'{{$userData(data.user)}}'

							}
						],
						_power: "for in data.list",

					},*/

					{
						name:'plDiv',
						component:'::div',
                        _visible:'{{data.type == "pl"}}',
						children:[
                            //发票岗
                            {
                                name:'jobList1',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.fp}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"fp"),$showUser(e,100003)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'发票岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // mode:'multiple',
                                        disabled:'{{data.fpLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.fpgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.fpgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.fpUser[_rowIndex].name}}',
                                        // 	value: '{{data.fpUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.fpUser'
                                        // }
                                        children:'{{$userData(data.fpUser)}}'
                                    },
                                ],
                            },
                            //报税岗
                            {
                                name:'jobList2',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.bs}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"bs"),$showUser(e,100004)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'报税岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        disabled:'{{data.bsLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.bsgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.bsgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.bsUser[_rowIndex].name}}',
                                        // 	value: '{{data.bsUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.bsUser'
                                        // }
                                        children:'{{$userData(data.bsUser)}}'
                                    },
                                ],
                            },
                            //记账岗
                            {
                                name:'jobList3',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.jz}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"jz"),$showUser(e,100005)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'记账岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        disabled:'{{data.jzLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.jzgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.jzgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.jzUser[_rowIndex].name}}',
                                        // 	value: '{{data.jzUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.jzUser'
                                        // }
                                        children:'{{$userData(data.jzUser)}}'
                                    },
                                ],
                            },
                            //查询岗
                            {
                                name:'jobList4',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.cx}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"cx"),$showUser(e,100006)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'查询岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        disabled:'{{data.cxLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.cxgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.cxgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.cxUser)}}'
                                    },
                                ],
                            },
                            //记账审核岗
                            {
                                name:'jobList5',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.jzsh}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"jzsh"),$showUser(e,100007)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'记账审核岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        disabled:'{{data.jzshLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.jzshUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.jzshUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.jzshUser)}}'
                                    },
                                ],
                            },
                            //理单岗
                            {
                                name:'jobList6',
                                component:'::div',
                                style:{marginBottom:'18px'},
                                _visible:'{{data.ld}}',
                                children:[
                                    {
                                        name:'checkbox',
                                        component:'Checkbox',
                                        className:'ttk-es-app-customerassign-modal-list-checkbox',
                                        onChange:'{{function(e){$changeStatus1(e,"ld"),$showUser(e,100008)}}}'

                                    },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'理单岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        disabled:'{{data.ldLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.ldUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.ldUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.ldUser)}}'
                                    },
                                ],
                            },
                            {
                                name:'title',
                                component:'::div',
                                style:{width:'85%',position:'absolute',bottom:'-130px',left:'8%'},
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
					},
					{
						name:'dgDiv',
						component:'::div',
                        _visible:'{{data.type == "dg"}}',
						children:[
                            //发票岗
                            {
                                name:'jobList1',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.fp}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"fp"),$showUser(e,100003)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'发票岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // mode:'multiple',
                                        // disabled:'{{data.fpLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.fpgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.fpgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.fpUser[_rowIndex].name}}',
                                        // 	value: '{{data.fpUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.fpUser'
                                        // }
                                        children:'{{$userData(data.fpUser)}}'
                                    },
                                ],
                            },
                            //报税岗
                            {
                                name:'jobList2',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.bs}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"bs"),$showUser(e,100004)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'报税岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // disabled:'{{data.bsLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.bsgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.bsgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.bsUser[_rowIndex].name}}',
                                        // 	value: '{{data.bsUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.bsUser'
                                        // }
                                        children:'{{$userData(data.bsUser)}}'
                                    },
                                ],
                            },
                            //记账岗
                            {
                                name:'jobList3',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.jz}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"jz"),$showUser(e,100005)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'记账岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // disabled:'{{data.jzLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.jzgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.jzgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.jzUser[_rowIndex].name}}',
                                        // 	value: '{{data.jzUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.jzUser'
                                        // }
                                        children:'{{$userData(data.jzUser)}}'
                                    },
                                ],
                            },
                            //查询岗
                            {
                                name:'jobList4',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.cx}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"cx"),$showUser(e,100006)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'查询岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // disabled:'{{data.cxLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.cxgUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.cxgUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.cxUser)}}'
                                    },
                                ],
                            },
                            //记账审核岗
                            {
                                name:'jobList5',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.jzsh}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"jzsh"),$showUser(e,100007)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'记账审核岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // disabled:'{{data.jzshLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.jzshUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.jzshUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.jzshUser)}}'
                                    },
                                ],
                            },
                            //理单岗
                            {
                                name:'jobList6',
                                component:'::div',
                                style:{textAlign:'center',marginBottom:'18px'},
                                _visible:'{{data.ld}}',
                                children:[
                                    // {
                                    //     name:'checkbox',
                                    //     component:'Checkbox',
                                    //     className:'ttk-es-app-customerassign-modal-list-checkbox',
                                    //     onChange:'{{function(e){$changeStatus1(e,"ld"),$showUser(e,100008)}}}'
                                    //
                                    // },
                                    {
                                        name:'span',
                                        component:'::span',
                                        className:'ttk-es-app-customerassign-modal-list-span',
                                        children:'理单岗：'
                                    },
                                    {
                                        name:'select',
                                        component:'Select',
                                        // disabled:'{{data.ldLoding}}',
                                        style:{width:'260px'},
                                        getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                        value:'{{data.ldUserId}}',
                                        placeholder:'请选择担任该岗位的人员',
                                        optionFilterProp: 'children',
                                        showSearch:true,
                                        filterOption:true,
                                        allowClear:true,
                                        onChange:'{{function(e){$sf("data.ldUserId",e)}}}',
                                        // children: {
                                        // 	name: 'option',
                                        // 	component: 'Select.Option',
                                        // 	children: '{{data.cxUser[_rowIndex].name}}',
                                        // 	value: '{{data.cxUser[_rowIndex].sysUserId}}',
                                        // 	_power: 'for in data.cxUser'
                                        // }
                                        children:'{{$userData(data.ldUser)}}'
                                    },
                                ],
                            },
						]
					}
				],

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
			customerList:[],//客户id
			// isLD:0,//是否有理单岗
			listArr:[],//包含的业务岗位
			fpgUserId:'',//发票
			fpgUserName:'',//发票
			bsgUserId:'',//报税
			bsgUserName:'',//报税
			jzgUserId:'',//记账
			jzgUserName:'',//记账
			cxgUserId:'',//查询
			cxgUserName:'',//查询
			jzshUserId:'',//记账审核
			jzshUserName:'',//记账审核
			ldUserId:'',//理单
			ldUserName:'',//理单
			fpUser:[],
			bsUser:[],
			jzUser:[],
			cxUser:[],
			jzshUser:[],
			ldUser:[],
			fpLoding:true,
			bsLoding:true,
			jzLoding:true,
			cxLoding:true,
			jzshLoding:true,
			ldLoding:true,
			fp:false,
			bs:false,
			jz:false,
			cx:false,
			jzsh:false,
			ld:false,

		}
	}
}
