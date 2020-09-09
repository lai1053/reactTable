export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "inv-app-riskControl",
		children: [
			{
				name: "mail",
				component: "Spin",
				tip: "{{data.tip}}",
				spinning: "{{data.loading}}",
				delay: 0.01,
				children: [
					{
						name: "body1",
						component: "::div",
						className: "inv-app-riskControl-hede",
						children: [
							{
								name: "icon",
								className: "hede-icon",
								component: "::div",
								children: "",
							},
							{
								name: "h1",
								className: "hede-h1",
								component: "::span",
								children: "立即检查",
							},
							{
								name: "h2",
								className: "hede-h2",
								component: "::div",
								children: "先检查再申报，降低财税风险，助力企业健康成长！",
							},
							{
								name: "date",
								className: "hede-date",
								component: "::span",
								children: [
									{
										name: "label",
										component: "::label",
										children: "报税月份：",
									},
									{
										name: "tax-date-picker",
										component: "DatePicker.MonthPicker",
										value: "{{data.date}}",
										format: "YYYY-MM",
										//disabledDate:"{{function(current){ return current && current < moment().endOf('month')}}}",
										onChange: "{{$handleMonthPickerChange}}",
									},
								],
							},
						],
					},
					{
						name: "body2",
						component: "::div",
						className: "inv-app-riskControl-body",
						children: [
							{
								name: "icon",
								className: "body-icon",
								component: "::div",
								children: "",
							},
							{
								name: "h1",
								className: "body-h1",
								component: "::span",
								children: "发票风险扫描",
							},
							{
								name: "h2",
								className: "body-h2",
								component: "::div",
								children: "{{$rendertis()}}",
							},
							{
								name: "btnTooltip",
								component: "Tooltip",
								placement: "topLeft",
								title: "没有操作权限",
								overlayClassName: "bovms-app-footer-tool",
								_visible:
									"{{data.isTijian === 1 && !(data.menuAuth&&data.menuAuth.indexOf('300')>-1)}}",
								children: {
									name: "span",
									component: "::span",
									className: "body-buttom",
									style: "{{data.startBtnDisabledSpanStyle}}",
									children: "开始检查",
								},
							},
							{
								name: "buttom1",
								className: "body-buttom",
								component: "Button",
								_visible:
									"{{data.isTijian === 1 && data.menuAuth&&data.menuAuth.indexOf('300')>-1}}",
								onClick: "{{$check}}",
								type: "primary",
								size: "large",
								children: "开始检查",
							},
							{
								name: "buttom2",
								_visible: "{{data.isTijian === 2}}",
								className: "body-buttom222",
								component: "::div",
								children: [
									{
										name: "tooltip",
										component: "Tooltip",
										placement: "topLeft",
										_visible:
											"{{!(data.menuAuth&&data.menuAuth.indexOf('300')>-1)}}",
										title: "没有操作权限",
										overlayClassName: "bovms-app-footer-tool",
										children: {
											name: "span",
											component: "::span",
											className: "body-buttom2",
											style: "{{data.disabledSpanStyle}}",
											children: "重新体检",
										},
									},
									{
										name: "buttom1",
										className: "body-buttom2",
										component: "Button",
										_visible:
											"{{data.menuAuth&&data.menuAuth.indexOf('300')>-1}}",
										onClick: "{{$check}}",
										type: "primary",
										size: "large",
										children: "重新体检",
									},
									{
										name: "buttom2",
										className: "body-buttom3",
										component: "Button",
										onClick: "{{$report}}",
										size: "large",
										children: "体检报告",
									},
								],
							},
							{
								name: "fenxiang",
								className: "body-fenxiang",
								id: "10085",
								onClick: "{{$fenxiang}}",
								component: "::div",
							},
							{
								name: "rendeQQ",
								_visible: "{{data.rendeQQ === 1}}",
								component: "::div",
								children: "{{$rendeqq()}}",
							},
						],
					},
				],
			},
		],
	}
}

export function getInitState() {
	return {
		data: {
			date: "", // 报税月份
			isTijian: 1, // 1 未体检 2 已经体检
			rendeQQ: 2, // 1显示二维码 2隐藏
			swtjUrl: "", //税务体检url
			wdbgUrl: "", //二维码url
			jxfpData: undefined, //进项发票数据
			xxfpData: undefined, // 销项发票数据
			isCaoshi: true, // 是否超时
			qyid: "", //
			djid: "", //
			swfxLog: "", //
			bgid: "",
			loading: false,
			tip: "正在检测您的发票信息请稍后",
			startBtnDisabledSpanStyle: {
				border: "1px solid #d9d9d9",
				textAlign: "center",
				lineHeight: "40px",
				borderRadius: "4px",
				cursor: "not-allowed",
				color: "rgba(0, 0, 0, 0.25)",
				backgroundColor: "#f5f5f5",
				borderColor: "#d9d9d9",
			},
			disabledSpanStyle: {
				border: "1px solid #d9d9d9",
				padding: "11px 20px",
				lineHeight: "40px",
				borderRadius: "4px",
				cursor: "not-allowed",
				color: "rgba(0, 0, 0, 0.25)",
				backgroundColor: "#f5f5f5",
				borderColor: "#d9d9d9",
			},
		},
	}
}
