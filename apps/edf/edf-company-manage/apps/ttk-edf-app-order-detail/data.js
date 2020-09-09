export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-order-detail',
		children: [{
			name: 'head',
			component: '::div',
			className: 'ttk-edf-app-order-detail-head',
			children: [{
				name: 'title',
				component: '::div',
				className: 'ttk-edf-app-order-detail-head-title',
				children: [{
					name: 'item',
					component: '::span',
					style: {color: '#888888'},
					children: '订单号：'
				}, {
					name: 'num',
					component: '::span',
					style: {color: '#333333'},
					children: '{{data.orderNo || ""}}'
				}]
			}, {
				name: 'status',
				component: '::div',
				className: 'ttk-edf-app-order-detail-head-status',
				style: "{{data.orderStatus == 4 ? {color: '#1EB5AD'} : {color: '#FA954C'}}}",
				children: [{
					name: 'icon',
					component: 'Icon',
					fontFamily: 'edficon',
					style: {fontSize: '30px'},
					type: 'chenggongtishi'
				}, {
					name: 'content',
					component: '::span',
					children: ['订单状态：', {
						name: 'item',
						component: '::span',
						children: "{{data.orderStatus == 4 ? '交易完成' : (data.orderStatus == 1 ? '待支付': '已取消')}}"
					}]
				}]
			}]
		}, {
			name: 'info',
			component: '::div',
			className: 'ttk-edf-app-order-detail-info',
			children: [{
				name: 'orderInfo',
				component: '::div',
				children: [{
					name: 'infoTitle',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-title ttk-edf-app-order-detail-info-title-order',
					children: '订单信息'
				}, {
					name: 'content',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-content',
					children: [{
						name: 'item1',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '订单类型：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.orderType == 1 ? "新购订单" : (data.orderType == 2 ? "续购订单" : "") }}'
						}]
					}, {
						name: 'item2',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '下单人：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.creatorName || ""}}'
						}]
					}, {
						name: 'item3',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '下单时间：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.createTime || ""}}'
						}]
					}, {
						name: 'item4',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '企业名称：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.orgName || ""}}'
						}]
					}, {
						name: 'item5',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '产品套餐：'
						}, {
							name: 'info',
							component: '::span',
							// children: '{{data.productId == 1 ? "金财管家-标准版" : ""}}'
							children: `{{function(){
								var name = '';
								data.productListKey.forEach(function(productListKeyData){
									if(productListKeyData.id == data.productId){
										name = productListKeyData.name
									}
								});
								return '金财管家-' + name
							}()}}`
						}]
					}, {
						name: 'item6',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '起止时间：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.beginDate.slice(0,10) + " - " + data.endDate.slice(0,10) || ""}}'
						}]
					}]
				}]
			}, {
				name: 'invoiceInfo',
				component: '::div',
				_visible: '{{data.invoiceStatus != 1}}',
				children: [{
					name: 'infoTitle',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-title ttk-edf-app-order-detail-info-title-invoice',
					children: '电子发票（普票）信息'
				}, {
					name: 'content',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-content ttk-edf-app-order-detail-info-content-invoice',
					children: [{
						name: 'item1',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '发票内容：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.orderInvoice.content || ""}}'
						}]
					}, {
						name: 'item2',
						component: '::div',
						style: {overflow: 'hidden'},
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							style: {float: 'left'},
							children: '发票抬头：'
						}, {
							name: 'info',
							component: '::span',
							style: {float: 'right', width: '140px'},
							children: '{{data.orderInvoice.title}}'
						}]
					},
					// {
					// 	name: 'item3',
					// 	component: '::div',
					// 	_visible: '{{!!data.orderInvoice.titleType == 2}}',
					// 	className: 'ttk-edf-app-order-detail-info-content-item',
					// 	children: [{
					// 		name: 'label',
					// 		component: '::span',
					// 		children: '手机号：'
					// 	}, {
					// 		name: 'info',
					// 		component: '::span',
					// 		children: '新购订单'
					// 	}]
					// },
					 {
						name: 'item4',
						component: '::div',
						_visible: '{{!!data.orderInvoice.titleType == 1}}',
						_visible: '{{data.orderInvoice.titleType == 1 ? true : false}}',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '纳税人识别号/税号：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.orderInvoice.vatTaxpayerNum || ""}}'
						}]
					},
					// {
					// 	name: 'item5',
					// 	component: '::div',
					// 	_visible: '{{!!data.orderInvoice.titleType == 2}}',
					// 	className: 'ttk-edf-app-order-detail-info-content-item',
					// 	children: [{
					// 		name: 'label',
					// 		component: '::span',
					// 		children: '收件人邮箱：'
					// 	}, {
					// 		name: 'info',
					// 		component: '::span',
					// 		children: '1000998983887438'
					// 	}]
					// }
				]
				}]
			}, {
				name: 'payInfo',
				component: '::div',
				children: [{
					name: 'infoTitle',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-title ttk-edf-app-order-detail-info-title-pay',
					children: '支付方式'
				}, {
					name: 'content',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-content',
					children: [{
						name: 'item1',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '支付方式：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{!!data.payType ? (data.payType == 1 ? "中国银联" : (data.payType == 2 ? "微信支付" : "支付宝")) : ""}}'
						}]
					}, {
						name: 'item2',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '订单总额：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{"¥" + (data.amount || "")}}'
						}]
					}, {
						name: 'item3',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '优惠金额：'
						}, {
							name: 'info',
							component: '::span',
							children: '¥0'
						}]
					}, {
						name: 'item4',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '应付金额：'
						}, {
							name: 'info',
							component: '::span',
							style: {color: '#FA7c63', fontSize: '20px'},
							children: '{{"¥" + (data.amount || "")}}'
						}]
					}]
				}]
			}, {
				name: 'serviceInfo',
				component: '::div',
				children: [{
					name: 'infoTitle',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-title ttk-edf-app-order-detail-info-title-service',
					children: '服务商'
				}, {
					name: 'content',
					component: '::div',
					className: 'ttk-edf-app-order-detail-info-content',
					children: [{
						name: 'item1',
						component: '::div',
						className: 'ttk-edf-app-order-detail-info-content-item',
						children: [{
							name: 'label',
							component: '::span',
							children: '服务商：'
						}, {
							name: 'info',
							component: '::span',
							children: '{{data.serviceProviderName}}'
						}]
					}]
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {

		}
	}
}
