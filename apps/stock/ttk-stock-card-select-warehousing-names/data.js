export function getMeta() {
	return {
		name: "root",
		component: "::div",
		children: "{{$renderPage()}}",
	}
}

export function getInitState() {
	return {
		data: {
			searchType: "",
			tableOption: {
				y: 240,
				x: "100%",
			},
			selectOptions: [],
			selectedRowKeys: [],
			visible: false,
			list: [
				{
					inventoryId: "12313127",
					inventoryCode: "KC005",
					inventoryName: "数据采集主模块 KCTSV-008",
					inventoryGuiGe: "MX100-MWEK-1SQ",
					inventoryType: "库存商品",
					inventoryUnit: "台",
					checked: true,
				},
			],
		},
	}
}
