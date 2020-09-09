export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-subjects-accounting',
		component: 'Layout',
		children: [{
			name: 'info',
			component: 'Alert',
			className: 'app-account-subjects-accounting-info',
			type: 'info',
			description: [{
					name: 'title1',
					component: '::span',
					className: 'app-account-subjects-accounting-info-alert',
					children: '新增辅助核算，科目的历史数据需要结转给指定的辅助核算项，此操作不可恢复。'
				}]
		},{
			name: 'accounting',
			component: 'Form',
			className: 'app-account-subjects-accounting-form',
			children: '{{$loopFormItem(data.value)}}'
		},{
			name: 'footer',
			className: 'app-account-subjects-accounting-footer',
			component: '::span',
			children: '此操作不能恢复，是否继续？'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			//每个下拉框的可选值
			list: {},
			//所有的辅助核算对应的title
			other:{},
			//显示新增的辅助核算
			value:[],
			//每个辅助核算的选择内容
			selectValue: {},
			//下拉新增按钮新增的辅助核算项
			addValue: {},
			//必填项错误存储
			error:{}
		}
	}
}