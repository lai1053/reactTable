export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-chooselx',
		children: [
			{
				name: 'list',
				component: '::div',
				style:{height:'200px'},
				className: 'ttk-es-app-chooselx-list',
                // children: '{{$renderStatement(data.list)}}'
                children: [
                    {
                        name: 'gsfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'工商服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'注册'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'变更'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'注销'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'官费'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'其他'
                                    }
                                ]
                            }

						]
                    },
                    {
                        name: 'csfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'财税服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'代理记账'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'发票相关服务'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'财务服务'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'税务服务'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'其他'
                                    }
                                ]
                            }

                        ]
                    },
                    {
                        name: 'hyzzxkz',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'行业资质许可证'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'电商'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'建筑'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'人力资源'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'网络游戏'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'文化出版运营'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'医疗'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'食品餐饮'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'其他'
                                    }
                                ]
                            }

                        ]
                    },
                    {
                        name: 'rsfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'人事服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'社保公积金'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'劳务招聘'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'居住证户口'
                                    }
                                ]
                            }

                        ]
                    },
                    {
                        name: 'yhfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'银行服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[

                                ]
                            }

                        ]
                    },
                    {
                        name: 'flfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'法律服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[

                                ]
                            }

                        ]
                    },
                    {
                        name: 'zscq',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'知识产权'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'商标'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'著作权'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'专利'
                                    }
                                ]
                            }

                        ]
                    },
                    {
                        name: 'px',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'培训'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'职业技能培训'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'业务培训'
                                    }
                                ]
                            }

                        ]
                    },
                    {
                        name: 'qtfw',
                        component: '::div',
                        className: 'ttk-es-app-chooselx-list-wrap',
                        children:[
                            {
                                name: 'icon',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-icon',
                                children:[

                                ]
                            },
                            {
                                name: 'span',
                                component: '::span',
                                className: 'ttk-es-app-chooselx-list-wrap-title',
                                children:'其他服务'
                            },
                            {
                                name: 'wrap',
                                component: '::ul',
                                className: 'ttk-es-app-chooselx-list-wrap-bottom clearfix',
                                children:[
                                    {
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'加急'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'刻章'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'遗失补办'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'异常处理'
                                    },{
                                        name: 'item',
                                        component: '::li',
                                        className: 'ttk-es-app-chooselx-list-wrap-bottom-item',
                                        children:'其他'
                                    }
                                ]
                            }

                        ]
                    },



                ]
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
		}
	}
}
