import { columnData } from './fixedData'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-stock-inventory-earlyStage',
        onMouseDown: '{{$mousedown}}',
		children: [
            {
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
                _visible: '{{data.loading}}',
                children: '{{$stockLoading()}}',
			},
			{
				name: 'back',
				component: '::div',
				className: "back earlyStage-back",
				onClick: '{{$back}}',
			},
			{
				name: 'main',
				component: 'Tabs',
				className: 'ttk-stock-inventory-earlyStage-main',
				animated: false,
				forceRender: false,
				activeKey: '{{data.other.activeTabKey}}',
				onChange: '{{$handleTabChange}}',
				children: [
					{
						name: 'tab1',
						component: 'Tabs.TabPane',
						_visible: '{{data.other.isShowFirstTab}}',
						tab: '存货期初',
						forceRender: false,
						className: 'ttk-stock-inventory-earlyStage-main-content',
						key: '1',
						children: ''
                    },
                    {
						name: 'tab1',
						component: 'Tabs.TabPane',
						_visible: '{{data.other.isShowFirstTab}}',
						tab: '暂估期初',
						forceRender: false,
						className: 'ttk-stock-inventory-earlyStage-main-content',
						key: '2',
						children: ''
					}
				]
			},
			{
				name: 'root-content',
				_visible: '{{data.other.activeTabKey == 1}}',
				component: 'Layout',
				className: 'ttk-stock-inventory-earlyStage-backgroundColor',
				children: [
                    {
                        name: 'header',
                        component: '::div',
                        className: 'ttk-stock-inventory-earlyStage-header',
                        children: [
                            {
                                name: 'content',
                                component: '::div',
                                className: 'ttk-stock-inventory-earlyStage-title',
                                children: [
                                    {
                                        name: 'inv-app-batch-sale-header',
                                        component: '::div',
                                        className: 'inv-app-batch-sale-header',
                                        children: [
                                            {
                                                name: 'header-left',
                                                className: 'header-left',
                                                component: '::div',
                                                children: [
                                                    {
                                                        name: 'header-filter-input',
                                                        component: 'Input',
                                                        className: 'inv-app-batch-sale-header-filter-input',
                                                        type: 'text',
                                                        value: '{{data.name}}',
                                                        placeholder: '请输入存货编号或存货名称',
                                                        onChange: "{{function (e) {$onSearch('data.name', e.target.value)}}}",
                                                        prefix: {
                                                            name: 'search',
                                                            component: 'Icon',
                                                            type: 'search'
                                                        }
                                                    },
                                                    {
                                                        name: 'popover',
                                                        component: 'Popover',
                                                        popupClassName: 'inv-batch-sale-list-popover',
                                                        placement: 'bottom',
                                                        title: '',
                                                        content: {
                                                            name: 'popover-content',
                                                            component: '::div',
                                                            className: 'inv-batch-custom-popover-content',
                                                            children: [
                                                                {
                                                                    name: 'filter-content',
                                                                    component: '::div',
                                                                    className: 'filter-content',
                                                                    children: [
                                                                        {
                                                                            name: 'popover-number',
                                                                            component: '::div',
                                                                            className: 'inv-batch-custom-popover-item',
                                                                            children: [
                                                                                {
                                                                                    name: 'label',
                                                                                    component: '::span',
                                                                                    children: '存货类型：',
                                                                                    className: 'inv-batch-custom-popover-label'
                                                                                }, 
                                                                                {
                                                                                    name: 'bankAccountType',
                                                                                    component: 'Select',
                                                                                    showSearch: false,
                                                                                    className: 'inv-batch-custom-popover-select',
                                                                                    style:{width: '180px'},
                                                                                    getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                                                    value: '{{data.form.constom}}',
                                                                                    onChange: "{{function(v){$sf('data.form.constom',v)}}}",
                                                                                    children: {
                                                                                        name: 'selectItem',
                                                                                        component: 'Select.Option',
                                                                                        value: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
                                                                                        children: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
                                                                                        _power: 'for in data.form.propertyDetailFilter'
                                                                                    },
                                                                                },
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, 
                                                                {
                                                                    name: 'filter-footer',
                                                                    component: '::div',
                                                                    className: 'filter-footer',
                                                                    children: [
                                                                        {
                                                                            name: 'search',
                                                                            component: 'Button',
                                                                            type: 'primary',
                                                                            children: '查询',
                                                                            onClick: '{{$filterList}}'
                                                                        },
                                                                        {
                                                                            name: 'reset',
                                                                            className: 'reset-btn',
                                                                            component: 'Button',
                                                                            children: '重置',
                                                                            onClick: '{{$resetForm}}'
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        trigger: 'click',
                                                        visible: '{{data.showPopoverCard}}',
                                                        onVisibleChange: "{{$handlePopoverVisibleChange}}",
                                                        children: {
                                                            name: 'filterSpan',
                                                            component: '::span',
                                                            className: 'inv-batch-custom-filter-btn header-item',
                                                            children: {
                                                                name: 'filter',
                                                                component: 'Icon',
                                                                type: 'filter'
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                    },
                                    {
                                        name: 'qiyong',
                                        component: '::span',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-qiyong',
                                        _visible: '{{data.other.activeTabKey == 1}}',
                                        children: '启用月份:'
                                    },
                                    {
                                        name: 'riqi',
                                        component: '::span',
                                        _visible: '{{data.other.activeTabKey == 1}}',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-riqi',
                                        children: '{{data.other.proid}}',
                                    },
                                    {
                                        name: 'query',
                                        disabled: '{{data.limit.stateNow}}',
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        component: 'Button',
                                        className: 'myhelloworld-button ttk-stock-inventory-earlyStage-subTitle-query',
                                        onClick: '{{$clean}}',
                                        children: '清空'
                                    },
                                    {
                                        name: 'import',
                                        component: 'Button',
                                        className: 'myhelloworld-button ttk-stock-inventory-earlyStage-subTitle-import',
                                        onClick: '{{$Import}}',
                                        children: '导入',
                                        disabled: '{{data.limit.stateNow}}',
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                    },
                                    {
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        name: 'reconciliation',
                                        type: 'primary',
                                        component: 'Button',
                                        className: 'myhelloworld-button ttk-stock-inventory-earlyStage-subTitle-reconciliation',
                                        onClick: '{{$showModal}}',
                                        children: '对账',
                                        disabled: '{{data.limit.stateNow}}'
                                    }
                                ]
                            },
					    ]
                    },
                    {
                        name: 'content',
                        component: 'Layout',
                        className: 'ttk-stock-inventory-earlyStage-content',
                        children: '{{$renderDatagrid()}}',
                    }
                ]
            },
            {
				name: 'footer',
				_visible: '{{data.other.activeTabKey == 1}}',
				component: '::div',
				className: 'ttk-stock-inventory-earlyStage-footer',
				children: [
					{
                        name: 'total',
                        component: '::div',
                        className: 'ttk-stock-inventory-earlyStage-footer-items',
                        children: [
                            {
                                name: 'totalTxt',
                                className: 'ttk-stock-inventory-earlyStage-footer-heji footer-paddingRight',
                                component: '::span',
                                children: '合计'
                            },
                            {
                                name: 'totalNum',
                                component: '::span',
                                children: '数量:   '
                            },
                            {
                                name: 'totalNumV',
                                component: '::span',
                                className: 'footer-paddingRight',
                                children: '{{data.listAll.billBodyNum}}'
                            },
                            {
                                name: 'totalPrice',
                                component: '::span',
                                children: '金额:  '
                            },
                            {
                                name: 'totalPriceV',
                                component: '::span',
                                children: '{{data.listAll.billBodyybBalance}}'
                            }
                        ]
                    }
			    ]
            },
            {
				name: 'root-content',
				_visible: '{{data.other.activeTabKey == 2}}',
				component: 'Layout',
				className: 'ttk-stock-inventory-earlyStage-backgroundColor',
				children: [
                    {
                        name: 'header',
                        component: '::div',
                        style: { position: 'relative', overflow: 'hidden' },
                        className: 'ttk-stock-inventory-earlyStage-header',
                        children: [
                            {
                                name: 'content',
                                component: '::div',
                                className: 'ttk-stock-inventory-earlyStage-title',
                                children: [
                                    {
                                        name: 'inv-app-batch-sale-header',
                                        component: '::div',
                                        style: {
                                            float: 'left'
                                        },
                                        className: 'inv-app-batch-sale-header',
                                        children: [
                                            {
                                                name: 'header-left',
                                                className: 'header-left',
                                                component: '::div',
                                                children: [
                                                    {
                                                        name: 'header-filter-input',
                                                        component: 'Input',
                                                        className: 'inv-app-batch-sale-header-filter-input',
                                                        type: 'text',
                                                        placeholder: '请输入存货编号或存货名称',
                                                        value: '{{data.input}}',
                                                        onChange: "{{function (e) {$onSearchReq('data.input', e.target.value)}}}",
                                                        prefix: {
                                                            name: 'search',
                                                            component: 'Icon',
                                                            type: 'search'
                                                        }
                                                    },
                                                    {
                                                        name: 'popover',
                                                        component: 'Popover',
                                                        popupClassName: 'inv-batch-sale-list-popover',
                                                        placement: 'bottom',
                                                        title: '',
                                                        content: {
                                                            name: 'popover-content',
                                                            component: '::div',
                                                            className: 'inv-batch-custom-popover-content',
                                                            children: [
                                                                {
                                                                    name: 'filter-content',
                                                                    component: '::div',
                                                                    className: 'filter-content',
                                                                    children: [
                                                                        {
                                                                            name: 'popover-number',
                                                                            component: '::div',
                                                                            style: { width: '100%' },
                                                                            className: 'inv-batch-custom-popover-item',
                                                                            children: [
                                                                                {
                                                                                    name: 'label',
                                                                                    component: '::span',
                                                                                    children: '存货类型：',
                                                                                    className: 'inv-batch-custom-popover-label'
                                                                                },
                                                                                {
                                                                                    name: 'bankAccountType',
                                                                                    component: 'Select',
                                                                                    showSearch: false,
                                                                                    getPopupContainer: '{{function(trigger) {return trigger.parentNode}}}',
                                                                                    value: '{{data.form.inventoryClassName}}',
                                                                                    style:{ width: '180px'},
                                                                                    onChange: "{{function(v){$sf('data.form.inventoryClassName',v)}}}",
                                                                                    children: {
                                                                                        name: 'selectItem',
                                                                                        component: 'Select.Option',
                                                                                        value: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
                                                                                        children: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
                                                                                        _power: 'for in data.form.propertyDetailFilter'
                                                                                    },
                                                                                    style: { width: '65%' }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }, 
                                                                {
                                                                    name: 'filter-footer',
                                                                    component: '::div',
                                                                    className: 'filter-footer',
                                                                    children: [
                                                                        {
                                                                            name: 'search',
                                                                            component: 'Button',
                                                                            type: 'primary',
                                                                            children: '查询',
                                                                            onClick: '{{$filterListReq}}'
                                                                        },
                                                                        {
                                                                            name: 'reset',
                                                                            className: 'reset-btn',
                                                                            component: 'Button',
                                                                            children: '重置',
                                                                            onClick: '{{$resetFormReq}}'
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        trigger: 'click',
                                                        visible: '{{data.showPopoverCardReq}}',
                                                        onVisibleChange: "{{$handlePopoverVisibleChangeReq}}",
                                                        children: {
                                                            name: 'filterSpan',
                                                            component: '::span',
                                                            className: 'inv-batch-custom-filter-btn header-item',
                                                            children: {
                                                                name: 'filter',
                                                                component: 'Icon',
                                                                type: 'filter'
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        ],
                                    },
                                    {
                                        name: 'qiyong',
                                        component: '::span',
                                        _visible: '{{data.other.activeTabKey == 2}}',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-qiyong subTitle-items',
                                        children: '启用月份:'
                                    },
                                    {
                                        name: 'riqi',
                                        component: '::span',
                                        _visible: '{{data.other.activeTabKey == 2}}',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-riqi subTitle-items',
                                        children: '{{data.other.proid}}',
                                    },
                                    {
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        name: 'shanchu',
                                        disabled: '{{data.limit.stateNow}}',
                                        component: 'Button',
                                        className: 'myhelloworld-button ttk-stock-inventory-earlyStage-subTitle-shanchu',
                                        onClick: '{{$delect}}',
                                        children: '删除'
                                    },
                                    {
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        name: 'daoru',
                                        component: 'Button',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-xinzeng',
                                        onClick: '{{$qcDataImport}}',
                                        children: '导入'
                                    },
                                    {
                                        name: 'daochu',
                                        component: 'Button',
                                        className: 'ttk-stock-inventory-earlyStage-subTitle-xinzeng',
                                        onClick: '{{$exportData}}',
                                        children: '导出'
                                    },
                                    {
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        name: 'xinzeng',
                                        component: 'Button',
                                        className: 'myhelloworld-button ttk-stock-inventory-earlyStage-subTitle-xinzeng',
                                        onClick: '{{$addzangu}}',
                                        type: 'primary',
                                        disabled: '{{data.limit.stateNow}}',
                                        children: '新增'
                                    },
                                    {
                                        _visible: '{{!data.xdzOrgIsStop}}',
                                        name: 'tooltip',
                                        component: 'Tooltip',
                                        placement: 'bottom',
                                        overlayStyle: {
                                            background: '#fff'
                                        },
                                        overlayClassName: 'helpIcon-tooltip',
                                        title: '暂估期初仅记录存货初始化以前的暂估，方便回冲，不会出现在存货报表和不参与成本计算',
                                        children: {
                                            name: 'helpIcon',
                                            component: 'Icon',
                                            fontFamily: 'edficon',
                                            type: 'bangzhutishi',
                                            className: 'helpIcon',
                                        },
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        name: 'content',
                        component: 'Layout',
                        className: 'ttk-stock-inventory-earlyStage-content',
                        children: '{{$renderZgTable()}}'
                    }
                ]
            },
            {
				name: 'footer',
				_visible: '{{data.other.activeTabKey == 2}}',
				component: '::div',
				className: 'ttk-stock-inventory-earlyStage-footer',
				children: [
                    {
                        name: 'total',
                        component: '::div',
                        className: 'ttk-stock-inventory-earlyStage-footer-items',
                        children: [
                            {
                                name: 'totalTxt',
                                component: '::span',
                                className: 'footer-paddingRight',
                                children: '合计'
                            },
                            {
                                name: 'totalNum',
                                component: '::span',
                                children: '数量:   '
                            },
                            {
                                name: 'totalNumV',
                                component: '::span',
                                className: 'footer-paddingRight',
                                children: '{{data.listAll.billBodyNum}}'
                            },
                            {
                                name: 'totalPrice',
                                component: '::span',
                                children: '金额:  '
                            },
                            {
                                name: 'totalPriceV',
                                component: '::span',
                                children: '{{data.listAll.billBodyybBalance}}'
                            }
                        ]
                    },
			    ]
			}
	    ]
	}
}

export function getInitState() {
	return {
		data: {
            loading: false,
            // importBtnDisabled: true, //默认应为true 调试改为false
			limit: {
				stateNow: ''
			},
			listAll: {
				billBodyNum: '0',
				billBodyybBalance: '0',
			},
			name: '',
			input: '',
			tableOption: { 
				x: 0
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			reqList: [
				{
					voucherId: 1,
					code: '',
					inventoryName: '',
					num: '',
					price: '',
					ybBalance: '',
					guige: '',
					unit: '',
					supplierName: ''
				}
			],
			tableKey: 1000,
			columnData,
            list: [],
            initialList: [],
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			other: {
				activeTabKey: '1',
				isShowFirstTab: true,
			},
			form: {
				propertyDetailFilter: [
					{
						name: '库存商品',
					},
					{
						name: '原材料',
					},
					{
						name: '周转材料',
					},
					{
						name: '委托加工物资',
					}
				],
				code: '',
				operater: 'liucp',
				enableDate: '',
				constom: '',
				inventoryClassName: ''
			},
            selectvalue: '按先进先出冲回',
		}
	}
}