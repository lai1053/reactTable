export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className:'ttk-edf-app-modify-nature',
		children: [{
			name: 'message1',
			component: '::div',
			_visible: '{{data.vatTaxpayer == "2000010002" && data.step == 1}}',
			children: [{
				name: 'content',
				component: '::p',
				children: '根据税法规定，您需要到税务机关办理完成增值税一般纳税人资格登记，才可进行身份转换，请确认是否进行身份转换？'
			}]
		}, {
			name: 'message2',
			component: '::div',
			_visible: '{{data.vatTaxpayer == "2000010002" && data.step == 2}}',
			children: [{
				name: 'item1',
				component: '::p',
				children: '转换成一般纳税人，请注意一下几点：'
			}, {
				name: 'item2',
				component: '::p',
				children: '1、系统自动新增一套一般纳税人会计科目：应交税费-应交增值税（一般纳税人）及其下级科目，一般纳税人增值税业务请使用此科目进行核算'
			}, {
				name: 'item3',
				component: '::p',
				children: '2、变更后，业务生成凭证、期末凭证、报表等都将按照一般纳税人规则处理（注：以前自动生成的凭证，如再次点生成将会按照一般纳税人规则处理且不可自动恢复，可手工调整）'
			}, {
				name: 'item4',
				component: '::p',
				children: '3、期末凭证变更成一般纳税人规则后，请确认设置科目、比例等是否正确'
			}, {
				name: 'item5',
				component: '::span',
				children: '是否确认转换？'
			}]
		}, {
			name: 'message3',
			component: '::div',
			_visible: '{{data.vatTaxpayer == "2000010001" && data.step == 1}}',
			children: [{
				name: 'content',
				component: '::p',
				children: '根据税法规定，您需要到税务机关办理完成增值税小规模资格登记，才可进行身份转换，请确认是否进行身份转换？'
			}]
		}, {
			name: 'message4',
			component: '::div',
			_visible: '{{data.vatTaxpayer == "2000010001" && data.step == 2}}',
			children: [{
				name: 'item1',
				component: '::p',
				children: '转换成小规模纳税人，请注意以下几点：'
			}, {
				name: 'item2',
				component: '::p',
				children: '1、系统自动新增小规模纳税人会计科目：应交税费-应交增值税（小规模），小规模纳税人增值税业务请使用此科目进行核算'
			}, {
				name: 'item3',
				component: '::p',
				children: '2、变更后，业务生成凭证、期末凭证、报表等都将在转登记日下期开始按照小规模纳税人规则处理（注：以前自动生成的凭证，如再次点生成将会按照小规模纳税人规则处理且不可自动恢复，可手工调整）'
			}, {
				name: 'item4',
				component: '::p',
				children: '3、期末凭证变更成小规模纳税人规则后，请确认设置科目、比例等是否正确'
			}, {
				name: 'item5',
				component: '::span',
				children: '是否确认转换？'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			step: 1,
			vatTaxpayer: null
		}
	}
}
