import moment from "moment"

export function getMeta() {
	return {
		name: "root",
		component: "::div",
		className: "inv-app-yunmeng-home",
		children: [
			{
				name: "inv-app-yunmeng-home-header",
				component: "::div",
				className: "inv-app-yunmeng-home-header",
				children: [
					{
						component: "::span",
						name: "inv-app-yunmeng-home-header-title",
						className: "inv-app-yunmeng-home-header-title",
						children: "发票统计"
					},
					{
						name: "inv-app-yunmeng-home-header-date-title",
						className: "inv-app-yunmeng-home-header-date-title",
						component: "::span",
						children: "报税月份："
					},
					{
						component: "DatePicker.MonthPicker",
						name: "inv-app-yunmeng-home-header-date",
						className: "inv-app-yunmeng-home-header-date",
						// value: '{{$stringToMoment(data.date)}}',
						value: "{{$getDate(data.type)}}",
						placeholder: "",
						style: {
							marginLeft: "8px",
							width: "100px"
						},
						onChange:
							"{{function(e){$changeDate($momentToString(e,'YYYY-MM'))}}}"
						// onChange: '{{$setDate}}'
					}
				]
			},
			{
				component: "Row",
				name: "inv-app-yunmeng-home-content",
				className: "inv-app-yunmeng-home-content",
				children: "{{$renderContent()}}"
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			state: -1,
			mathRandom: 0,
			date: moment().format("YYYY-MM"),
			type: "xxfp",
			xxfpoption: {
				tooltip: {
					trigger: "item",
					// formatter: "{b}: {c} 个"
					formatter: "{b}"
				},
				title: {
					text: "0 张",
					left: "center",
					top: "30%",
					textStyle: {
						color: "rgb(60,60,60)"
					}
				},
				// legend: {
				// 	orient: 'horizontal',
				// 	x: 'left',
				// 	bottom: 45,
				// 	left: 0,
				// 	data:['增值税专用发票','其他发票', '增值税普通发票', '无数据'],
				// 	icon: "circle"
				// },
				color: [
					"rgb(255,151,29)",
					"rgb(0,167,233)",
					"#00b38a",
					"rgb(245,244,243)"
				],
				series: [
					{
						name: "访问来源",
						type: "pie",
						radius: ["25%", "43%"],
						center: ["50%", "35%"],
						avoidLabelOverlap: false,
						label: {
							formatter: "{c} 张",
							emphasis: {
								formatter: "占比：{c} 张"
							}
						},
						// data:[{value:0, fplxDm: '01', name:'增值税专用发票'},{value:0, fplxDm: '100', name:'其他发票'},{value:0, fplxDm: '04', name:'增值税普通发票'},undefined]
						data: [
							undefined,
							undefined,
							undefined,
							{ value: 0, name: "无数据" }
						]
					}
				]
			},
			jxfpoption: {
				tooltip: {
					trigger: "item",
					// formatter: "{b}: {c} 个"
					formatter: "{b}"
				},
				title: {
					text: "0 张",
					left: "center",
					top: "30%",
					textStyle: {
						color: "rgb(60,60,60)"
					}
				},
				// legend: {
				// 	orient: 'horizontal',
				// 	x: 'left',
				// 	bottom: 45,
				// 	left: 0,
				// 	data:['增值税专用发票（已认证）', '增值税普通发票','增值税专用发票（未认证）', '其他发票','无数据'],
				// 	icon: "circle"
				// },
				color: [
					"rgb(255,151,29)",
					"rgb(8,137,241)",
					"#00b38a",
					"rgb(0,167,233)",
					"rgb(245,244,243)"
				],
				series: [
					{
						name: "访问来源",
						type: "pie",
						radius: ["25%", "43%"],
						center: ["50%", "35%"],
						avoidLabelOverlap: false,
						label: {
							formatter: "{c} 张",
							emphasis: {
								formatter: "占比：{c} 张"
							}
						},
						// data:[{value:0, fplxDm: '011', name:'增值税专用发票（已认证）'},{value:0, fplxDm: '04', name:'增值税普通发票'},{value:0, fplxDm: '010', name:'增值税专用发票（未认证）'},{value:0, fplxDm: '100', name:'其他发票'},undefined]
						data: [
							undefined,
							undefined,
							undefined,
							undefined,
							{ value: 0, name: "无数据" }
						]
					}
				]
			},
			xxfplist: [
				{
					type: "增值税专用发票",
					fplxDm: "01"
				},
				{
					type: "增值税普通发票",
					fplxDm: "04"
				},
				{
					type: "其他发票",
					fplxDm: "100"
				},
				{
					type: "合计"
				}
			],
			jxfplist: [
				{
					type: "增值税专用发票（已认证）",
					fplxDm: "011"
				},
				{
					type: "增值税专用发票（未认证）",
					fplxDm: "010"
				},
				{
					type: "增值税普通发票",
					fplxDm: "04"
				},
				{
					type: "其他发票",
					fplxDm: "100"
				},
				{
					type: "合计"
				}
			]
		}
	}
}
