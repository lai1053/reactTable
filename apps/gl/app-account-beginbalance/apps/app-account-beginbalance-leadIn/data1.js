export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-beginbalance-leadin',
		component: 'Layout',
		children: [{
			name: 'topTipDiv',
			component: '::div',
			className: 'app-account-beginbalance-leadin-whileDiv',
			children: [{
				name: 'bottomDiv',
				component: '::div',
				className: 'app-account-beginbalance-leadin-bottomDiv',
				children: [{
					name: 'bottomTitle',
					component: '::div',
					style: {marginBottom: '12px'},
					children: '1. 如果您有用友金蝶等产品的科目余额表，请选择对应产品：'
				},{
					name: 'selectDiv',
					component: '::div',
					className: 'app-account-beginbalance-leadin-bottomRedioDiv',
					children: '{{$renderRadioDiv()}}'
				}]
			}]
		},{
			name: 'middleDiv',
			component: '::div',
			className: 'app-account-beginbalance-leadin-middleDiv',
			children: [{
				name: 'leftTip2',
				component: '::span',
				children: '2. 您也可以'
			}, {
				name: 'tipA2',
				component: '::a',
				className: 'app-account-beginbalance-leadin-leadInA',
				children: '下载模板',
				onClick: '{{$leadInModle}}'
			},{
				name: 'rightTip2',
				component: '::span',
				children: '，填好数据后导入。不选择产品，将认为采用此模板',
			}]
		},{
			name: 'button',
			component: '::div',
			type: 'primary',
			// children: '选择文件',
			className: 'app-account-beginbalance-leadin-buttonDiv',
			// onClick: '$selectFile'
			children: '{{$renderUpload()}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tagValue: '',
			uploadFile:{}
		}
	}
}