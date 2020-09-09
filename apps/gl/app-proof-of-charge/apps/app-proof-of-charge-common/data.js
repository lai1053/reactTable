export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-charge-common',
		children: {
			name: 'card',
			component: 'Card',
			className: '{{data.selectedCommon == data.other.value[_rowIndex].docTemplateId ? "card card-checked" : "card"}}',
			title: '{{data.other.value[_rowIndex].docTemplateName}}',
			onClick: `{{function(v){$setField('data.selectedCommon', data.other.value[_rowIndex].docTemplateId)}}}`,
			extra: {
				name: 'header',
				component: '::div',
				children: [{
					name: 'modify',
					component: '::span',
					children: {
						name: 'bianji',
						component: 'Icon',
						showStyle: 'softly',
						fontFamily: 'edficon',
						type: 'bianji',
						style: {
							fontSize: 24
						},
						onClick: '{{function(){$modifyTemplate(data.other.value[_rowIndex])}}}'
					}

				}, {
					name: 'del',
					component: '::span',
					children: {
						name: 'guanbi',
						component: 'Icon',
						showStyle: 'softly',
						fontFamily: 'edficon',
						type: 'guanbi',
						style: {
							fontSize: 24,
							position: 'relative',
							top: '2px'
						},
						onClick: '{{function(){$deleteTemplate(data.other.value[_rowIndex])}}}'
					}
				}]
			},
			children:{
				name: 'content',
				component: '::div',
				children: '{{$getList(data.other.value[_rowIndex])}}'
			},
			_power: 'for in data.other.value'
		}
	}
}

export function getInitState() {
	return {
		data: {
			selectedCommon: undefined,
			other: {
				value: [{}]
			}
		}
	}
}
