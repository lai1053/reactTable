import moment from "moment";
import { Spin, Row, Col } from 'antd';
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'bovms-app-guidePage',
		children: [{
			name: 'spin',
			component: 'Spin',
			delay: 0.01,
			spinning: '{{data.loading}}',
			children: [{
				name: 'demo',
				component: '::div',
				className: 'bovms-app-guidePage-upSecretKey',
				children: [
					{
						name: 'quPiao',
						component: '::div',
						children: [
							{
								name: 'head',
								component: '::div',
								className: 'bovms-app-guidePage-heda',
								children: [
									{
										name: 'year-period',
										component: '::span',
										className: 'label-item header-item',
										children: [{
											name: 'label',
											component: '::label',
											children: '会计月份：'
										}, {
											name: 'tax-date-picker',
											component: 'DatePicker.MonthPicker',
											value: '{{data.nsqj}}',
											format: 'YYYY-MM',
											disabledDate: '{{$disabledStartDate}}',
											onChange: "{{$handleMonthPickerChange}}"
										}, {
											name: "span",
											component: '::span',
											children: [
												{
													name: 'nasrxz',
													className: 'bovms-app-guidePage-heda-span',
													component: '::span',
													children: [{
														name: 'cunhuohesuan',
														component: '::span',
														children: '纳税人性质：',
													}, {
														name: 'qiYong',
														component: '::span',
														_visible: "{{data.vatTaxpayer == 2000010001 && data.fudaoqi !== 10086}}",
														children: '一般纳税人',
													}, {
														name: 'qiYong',
														component: '::span',
														_visible: "{{data.vatTaxpayer === 2000010002}}",
														children: '小规模纳税人',
													}, {
														name: 'qiYong',
														component: '::span',
														_visible: "{{data.fudaoqi === 10086}}",
														children: '一般纳税人辅导期',
													}]
												},
												{
													name: 'cunhuo',
													component: '::span',
													className: 'bovms-app-guidePage-heda-span',
													children: [{
														name: 'cunhuohesuan',
														component: '::span',
														children: '存货核算：',
													}, {
														name: 'qiYong',
														component: '::span',
														_visible: "{{data.stock === 1}}",
														children: '已启用',
													}, {
														name: 'qiYong',
														component: '::span',
														_visible: "{{data.stock !== 1}}",
														children: '未启用',
													}]
												}

											]
										}]
									},
									{
										component: '::div',
										className: '',
										children: [{
											name: 'help',
											className: 'bovms-app-guidePage-heda-help',
											component: 'Icon',
											theme: "filled",
											type: "question-circle",
											onClick: '{{$openHelp}}'
										},
										{
											name: 'buttom',
											className: 'bovms-app-guidePage-heda-button',
											component: 'Button',
											children: '查票',
											type: 'primary',
											onClick: '{{$caPiao}}'
										},]
									}

								]
							},

							{
								name: 'quPiaoWrap',
								component: '::div',
								className: 'bovms-app-guidePage-qupiao-wrap',
								children: [
									{
										name: 'quPiao',
										component: '::div',
										className: 'bovms-app-guidePage-upSecretKeyContent',
										onClick: '{{$quPiao}}',
										children: ''
									},
									{
										name: 'p',
										component: '::p',
										className: 'bovms-app-guidePage-upSecretKeyContent-span12',
										children: [
											{
												name: 'span1',
												component: '::span',
												_visible: "{{data.stock === 0}}",
												className: 'bovms-app-guidePage-upSecretKeyContent-span11',
												children: '温馨提示：'
											},
											{
												name: 'span2',
												component: '::span',
												_visible: "{{data.stock === 0}}",
												className: 'bovms-app-guidePage-upSecretKeyContent-span22',
												children: '如需进行存货核算，请先启用存货核算，再使用进、销项模块'
											},
											// {
											// 	name: 'span2',
											// 	component: '::span',
											// 	_visible: "{{data.type === '进项'}}",
											// 	className: 'bovms-app-guidePage-upSecretKeyContent-span22',
											// 	children: '如需进行存货核算，请先启用存货核算，再使用进、销项模块'
											// }
										]
									},
									{
										name: 'p2',
										component: '::p',
										className: 'bovms-app-guidePage-upSecretKeyContent-button',
										children: [{
											name: 'a',
											component: '::a',
											_visible: "{{data.stock === 0}}",
											onClick: '{{$goConfigure}}',
											children: '现在开启'
										}]
									},
									{
										name: 'imgDiv',
										className: 'bovms-app-guidePageImgdiv',
										component: '::div',
										_visible: "{{data.type == '进项' && data.stock === 0}}",
										children: ''
									},
									{
										name: 'imgDiv',
										className: 'bovms-app-guidePageImgdivSale',
										component: '::div',
										_visible: "{{data.type == '进项' && data.stock === 1}}",
										children: ''
									},
									{
										name: 'imgDiv',
										className: 'bovms-app-guidePageImgdiv',
										component: '::div',
										_visible: "{{data.type == '销项' && data.stock === 0}}",
										children: ''
									},
									{
										name: 'imgDiv',
										className: 'bovms-app-guidePageImgdivPuchase',
										component: '::div',
										_visible: "{{data.type == '销项' && data.stock === 1}}",
										children: ''
									}

								]
							}


							// {
							// 	name: 'imgDiv',
							// 	className: 'bovms-app-guidePageImgdivSale',
							// 	component: '::div',
							// 	_visible: "{{data.stock === '1' && data.type === '销项'}}",
							// 	children: ''
							// }, {
							// 	name: 'imgDiv',
							// 	className: 'bovms-app-guidePageImgdivPuchase',
							// 	component: '::div',
							// 	_visible: "{{data.stock === '1' && data.type === '进项'}}",
							// 	children: ''
							// }
						]
					}
				]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			vatTaxpayer: 2000010001, // 纳税人性质 2000010001为一般纳税人
			fudaoqi: '', // 一般纳税人辅导期
			nsqj: '',//报税期间
			stock: '1', //是否启用存货 1为启用存货
			type: '进项', // 销项或者进项
			loading: false,
			sobCheck: true, //账套信息验证
		}
	}
}