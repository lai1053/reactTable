export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: '{{data.other.fromJRB==true?"ttk-gl-app-report-setting-root fromJRB":"ttk-gl-app-report-setting-root"}}',
		children: [{
			name: 'step',
			component: '::div',
			className: 'ttk-gl-app-report-setting-root-step',
			children:[{
				name: 'step1',
				component: '::div',
				className: 'step1',
				_visible: '{{data.other.tab1}}',
				children:[{
					name: 'num1',
					component: '::div',
					className: 'number',
					children: '1'
				},{
					name: 'text1',
					component: '::div',
					children: '科目匹配'
				}]
			},{
				name: 'stepsave',
				component: '::div',
				className: 'stepsave',
				_visible: '{{data.other.tab2}}',
				children:[/*{
					name: 'finish',
					component: '::div',
					children: {
						name: 'icon',
						component: 'Icon',
						type: 'check'
					}
				}*/{
					name: 'icon',
					component: 'Icon',
					type: 'check'
				},{
					name: 'text1',
					component: '::div',
					children: '科目匹配'
				},{
					name: 'fill',
					component: '::div',
					className: 'fill',
					children: ''
				}]
			},{
				name: 'step2',
				component: '::div',
				className: '{{data.other.tab1 ? "step2" : "stepSave2"}}',
				children:[{
					name: 'num2',
					component: '::div',
					className: 'number',
					children: '2'
				},{
					name: 'text2',
					component: '::div',
					children: '规则设置'
				}]
			}]
		},{
			name: 'radiodiv',
			component: '::div',
			_visible: '{{data.other.tab1}}',
			className: 'ttk-gl-app-report-setting-root-radio',
			children:[{
				name: 'radiogroup',
				component: 'Radio.Group',
				value:'{{data.other.match}}',
				onChange: '{{function(e) {return $handleMath(e, "match")}}}',
				children:[{
					name: 'radio1',
					component: 'Radio',
					value:'1',
					children: '全部'
				},{
					name: 'radio2',
					component: 'Radio',
					value:'0',
					children: '未匹配'
				}]
			},{
				name: 'rematch',
				component: 'Button',
				// type: 'primary',
				className: 'ttk-gl-app-report-setting-root-primaryBtn',
				onClick: '{{$handleMatch}}',
				children: '重新匹配'
			},{
				name: 'ttk',
				component: '::a',
				href: '#',
				style: { display: 'none' },
				id: 'exeType'
			}]
		},{
			name: 'tablediv',
			component: '::div',
			className: 'ttk-gl-app-report-setting-root-tablediv',
			children:[{
				name: 'table',
				component: 'Table',
				_visible: '{{data.other.tab1}}',
				lazyTable: true,
				emptyShowScroll: true,
				pagination: false,
				className: 'ttk-gl-app-report-setting-root-tablediv-table',
				allowColResize: false,
				enableSequenceColumn: false,
				loading: '{{data.other.loading}}',
				bordered: true,
				scroll: '{{data.tableOption}}',
				dataSource: '{{data.other.match === "0" ? data.other.noMapTableList:data.other.tableList}}',
				noDelCheckbox: true,
				columns: '{{$tableColumns()}}',
			},{
				name: 'div',
				component: '::div',
				_visible: '{{data.other.tab1}}',
				className: 'ttk-gl-app-report-setting-root-tablediv-totalFooter',
				children:[{
					name: 'heji',
					component: '::div',
					className: 'total',
					children: '合计'
				},{
					name:'num',
					component: '::div',
					className: 'numdiv',
					children:[{
						name: 'div1',
						component: '::div',
						children:['科目数：',{
							name: 's1',
							component: '::span',
							children: '{{data.other.aboutAccount.origAccountCount || 0}}'
						}]
					},{
						name: 'div2',
						component: '::div',
						children:['已匹配数：',{
							name: 's2',
							component: '::span',
							children: '{{data.other.aboutAccount.yesMappingCount || 0}}'
						}]
					},{
						name: 'div3',
						component: '::div',
						children:['未匹配数：',{
							name: 's3',
							component: '::span',
							children: '{{data.other.aboutAccount.noMappingCount || 0}}'
						}]
					}]
				}]
			}]
		},{
			name: 'content2',
			component: 'Form',
			_visible: '{{data.other.tab2}}',
			// className: 'ttk-gl-app-report-setting-root-content2',
			className:'{{data.other.showValueType ? "ttk-gl-app-report-setting-root-content2" : "ttk-gl-app-report-setting-root-content22"}}',
			children:[{
				name: 'row1',
				component: 'Form.Item',
				label: '报表重分类设置',
				colon: false,
				children:[{
					name: 'radiog',
					component: 'Radio.Group',
					value: '{{data.other.reClassType}}',
					onChange: '{{function(e) {return $handleMath(e, "reClassType")}}}',
					children:[{
						name: 'radio1',
						component: 'Radio',
						value: 'true',
						children: '全部'
					},{
						name: 'radio2',
						component: 'Radio',
						value: 'part',
						children: '部分'
					},{
						name: 'radio3',
						component: 'Radio',
						value: 'false',
						children: '无'
					}]
				}]
			},{
				name: 'row2',
				component: 'Form.Item',
				label: '报表公式设置',
				colon: false,
				children: [{
					name: 'adom',
					component: '::a',
					children: '报表公式',
					onClick: '{{$handleReportFormula}}'
				}]
			},{
				name: 'row3',
				component: 'Form.Item',
				label: '利润表【本月金额】取数',
				colon: false,
				_visible: '{{data.other.showValueType}}',
				children: [{
					name: 'radiogroup',
					component: 'Radio.Group',
					value: '{{data.other.valueType}}',
					onChange: '{{function(e) {return $handleMath(e, "valueType")}}}',
					children:[{
						name: 'radio1',
						component: 'Radio',
						value: 4,
						children: '取一个月数据'
					},{
						name: 'radio2',
						component: 'Radio',
						value: 3,
						children: '取一个季度数据'
					}]
				}]
			}]
		},{
			name: 'footer',
			component: '::div',
			className: 'ttk-gl-app-report-setting-root-footer',
			children:[/*{
				name: 'cancel',
				component: 'Button',
				style: {marginRight: '10px'},
				onClick: '{{$handleCancel}}',
				children: '取消'
			},*/{
				name: 'preStep',
				component: 'Button',
				_visible: '{{data.other.tab2}}',
				onClick: '{{$handlePre}}',
				children: '上一步'
			},{
				name: 'nextStep',
				component: 'Button',
				className: 'nextStep',
				// type: 'primary',
				className: 'primaryBtn',
				_visible: '{{data.other.tab1}}',
				onClick: '{{$handleNext}}',
				disabled: '{{!data.other.isCanNext || (data.other.tableList.length == 0)}}',
				children: '下一步'
			},{
				name: 'save',
				component: 'Button',
				_visible: '{{data.other.tab2}}',
				// type: 'primary',
				className: 'primaryBtn',
				style: {marginLeft: '10px'},
				onClick: '{{$handleSave}}',
				children: '保存'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			other: {
				loading: true,
				tableList: [],
				noMapTableList: [],
				accountList:[],
				tab1: true,
				tab2: false,
				match: '1',
				reClassType: 'true',
				valueType: 4,
				showValueType: false, //是否显示“利润表【本月金额】取数”
				// noMappingCount: 0, //未匹配科目数
				// origAccountCount: 0, //全部科目数
				// yesMappingCount: 0, //未匹配科目数
				aboutAccount: {
					noMappingCount: 0, //未匹配科目数
					origAccountCount: 0, //全部科目数
					yesMappingCount: 0, //未匹配科目数
				},
				isCanNext: true,
				orgIds: []
			},
			tableOption: {}
		}
	}
}