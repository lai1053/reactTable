import moment from 'moment'
const NOSAVE = -1  //未保存
const NODECLARE = 0//已保存 未申报
const DECLARE = 1//已申报
const PAID = 2//已缴款
const OVERDUE = true //OVERDUE 为true过期

export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-tax-app-declaration-tax-xdz',
		children: [{
			name: 'optionsLine',
			component: '::div',
			className: 'ttk-tax-app-declaration-tax-xdz-options',
			children: [
				{
					name: 'yearPicker',
					component: '::div',
					children: '{{$getYearPicker()}}',
					className: 'yearPicker',
				},
				{
					name: 'btns',
					component: '::div',
					className: 'btns',
					children: [{
						name: 'refresh',
						component: 'Button',
						children: '更新数据',
						type: 'primary',
						className: 'refreshBtn',
						onClick: '{{$refresh}}',
					},{
						name: 'refresh',
						component: 'Button',
						children: '导出',
						className: 'downloadBtn',
						onClick: '{{$exportExcel}}',
					}]
				}
			]
		},
		{
			name: 'content',
			component: 'Layout',
			className: 'ttk-tax-app-declaration-tax-xdz-content',
			children: [{
				pagination: false,
				className: 'app-transform-bottom-body',
				id: 'app-transform-bottom-body',
				name: 'rowreport',
				component: 'Table',
				pagination: false,
				allowColResize: false,
				enableSequenceColumn: true,
				bordered: true,
				dataSource: '{{ data.list }}',
				noCalculate: true,
				scroll: '{{ {y: data.other.scrollY,x:1404} }}',
				// loading: '{{data.other.isLoading}}',
				columns: [{
					title: '税款属期',
					dataIndex: 'period',
					key: 'period',
					align: 'center',
					width: 85,
                    fixed: 'left',
					// width: 150,
					// render: "{{ function(text, record, index){return $renderCell('sourceName', index, text, 'Row')} }}"
				},{
					title: '增值税',
					dataIndex: 'zzsse',
					key: 'zzsse',
					align: 'right',
					// width: '12.5%',
					width: 106,
					render: "{{ function(text, record, index){return $renderCell('zzs', index, text, record)} }}"
				}, {
					title: '附加税（费）',
					children:[{
						title: '城建税',
						dataIndex: 'cswhjsfYbtse',
						key: 'cswhjsfYbtse',
						align: 'right',
						width: 106,
						render: "{{ function(text, record, index){return $renderCell('cswhjsfYbt', index, text, record)} }}"
					},{
						title: '教育附加',
						dataIndex: 'jyffjYbtse',
						key: 'jyffjYbtse',
						align: 'right',
						width: 106,
						render: "{{ function(text, record, index){return $renderCell('jyffjYbt', index, text, record)} }}"
					},{
						title: '地方附加',
						dataIndex: 'dfjyffjYbtse',
						key: 'dfjyffjYbtse',
						align: 'right',
						width: 106,
						render: "{{ function(text, record, index){return $renderCell('dfjyffjYbt', index, text, record)} }}"
					}]
				}, {
					title: '印花税',
					dataIndex: 'yhsse',
					key: 'yhsse',
					align: 'right',
					// width: '12.5%',
					width: 106,
					// width: '160px',
					render: "{{ function(text, record, index){return $renderCell('yhs', index, text, record)} }}"
				}, {
					title: '文化事业建设费',
					// dataIndex: 'whsyjefse',
					// key: 'whsyjefse',
					// align: 'right',
					// width: '12.5%',
					// width: '160px',
					children: [
                        {
                            title: '广告',
                            dataIndex: 'whsyjsfggse',
							key: 'whsyjsfggse',
							align: 'right',
							// width: '12.5%',
							width: 106,
							render: "{{ function(text, record, index){return $renderCell('whsyjsfyl', index, text, record)} }}"
                            
                        },{
                            title: '娱乐',
                            dataIndex: 'whsyjsfylse',
							key: 'whsyjsfylse',
							align: 'right',
							// width: '12.5%',
							width: 106,
							render: "{{ function(text, record, index){return $renderCell('whsyjsfgg', index, text, record)} }}"

                        }
                    ]
				}, 
				 {
					title: '企业所得税',
					dataIndex: 'qysdsse',
					key: 'qysdsse',
					align: 'right',
					width: 106,
					// width: '12.5%',
					render: "{{ function(text, record, index){return $renderCell('qysds', index, text, record)} }}"
				}, {
					title: '个税',
					children:[{
						title: '代扣代缴',
						dataIndex: 'dkdjgrsdsse',
						key: 'dkdjgrsdsse',
						align: 'right',
						width: 106,
						render: "{{ function(text, record, index){return $renderCell('kjgrsds', index, text, record)} }}"
					},{
						title: '生产经营',
						dataIndex: 'scjygrsdsse',
						key: 'scjygrsdsse',
						align: 'right',
						width: 106,
						render: "{{ function(text, record, index){return $renderCell('scjygrsds', index, text, record)} }}"
					}]
				},{
					title: '消费税',
					dataIndex: 'xfsse',
					key: 'xfsse',
					align: 'right',
					width: 106,
					render: "{{ function(text, record, index){return $renderCell('xfs', index, text, record)} }}"
				}, {
					title: '残保金',
					dataIndex: 'cbjse',
					key: 'cbjse',
					align: 'right',
					width: 106,
					// width: '12.5%',
					render: "{{ function(text, record, index){return $renderCell('cbj', index, text, record)} }}"
				}, {
					title: '水利基金',
					dataIndex: 'sljjse',
					key: 'sljjse',
					align: 'right',
					width: 106,
					// width: '12.5%',
					render: "{{ function(text, record, index){return $renderCell('sljj', index, text, record)} }}"
				}, {
					title: '工会经费',
					dataIndex: 'ghjfse',
					key: 'ghjfse',
					align: 'right',
					width: 106,
					// width: '12.5%',
					render: "{{ function(text, record, index){return $renderCell('ghjf', index, text, record)} }}"
				}, {
					title: '总计',
					dataIndex: 'zese',
					key: 'zese',
					align: 'right',
                    fixed: 'right',
					// width: '160px',
					width: 106,
					// render: "{{ function(text, record, index){return $renderCell('sourceName', index, text, 'Row')} }}"
				}]
			}]
		}
		]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			other: {
				year: moment().format('YYYY'),
				scrollY: 0
			}
		}
	}
}