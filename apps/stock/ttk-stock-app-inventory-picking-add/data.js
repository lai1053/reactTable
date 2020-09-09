export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-inventory-picking-add',
        children: '{{$renderPage()}}',
	}
}

export function getInitState() {
	return {
        loading: false,
        isEdit: false,
		data: {
            isAdd: false,
			form: {
				code: '',
                cdate: '',
                contactUnit: '',
                invNum: '',
                contactSubject: '',
				operater: 'liucp',
			},
			columns: [],
			list: [
				blankDetail,
				blankDetail,
				blankDetail,
				blankDetail,
				blankDetail
            ],
            cacheData: [],
			other: {
				error: {},
			},
			basic: {
				enableDate:''
			}
		}
	}
}
export const blankDetail = {
	inventoryName: '',
	inventoryCode: '',
	inventoryGuiGe: '',
	inventoryUnit: '',
	num: '',
	price: '',
	ybbalance: '',
}
