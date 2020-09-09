import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-inventory-accountingmethod',
        children: [{ 
            name: 'ttk-scm-app-inventory-accountingmethod-content',
            component: '::div',
            className: 'ttk-scm-app-inventory-accountingmethod-content',
            children: [{
                name: 'header',
                component: '::a',
                className: 'ttk-scm-app-inventory-accountingmethod-header',
                onClick: '{{function(){$openSetting()}}}',
                children: [{
                    name: 'icon',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    type: 'shezhi',
                }, {
                    name: 'setting',
                    component: '::span',
                    children: '产成品成本核算设置',
                }]
            }, {
                name: 'content',
                component: '::div',
                className: 'ttk-scm-app-inventory-accountingmethod-bottom',
                children: [{
                    name: 'traditional',
                    component: '::div',
                    _visible: '{{ data.type == "traditional" }}', 
                    className: 'traditional',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'title',
                        children: '传统生产流程'
                    }, {
                        name: 'btn1',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `进入材料出库单，手工录入材料出库单`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'xinzengcailiaochukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '新增材料出库单',
                            }]
                        }],
                        onClick: '{{function(){$addInventory("addInventoryOut")}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `成本核算可以自动取值，明细存货手工录入，计算产成品成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'rukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '新增产品入库单—成本核算自动取值',
                            }]
                        }],
                        onClick: '{{function(){$addInventory("addInventoryIn")}}}' 
                    },{
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    },{
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据计价核算方式，计算出存货的成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'cunhuo-chengbenjisuan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '成本计算',
                            }]
                        }],
                        onClick: '{{function(){$costCalculation()}}}' 
                    }]
                }, {
                    name: 'toSellProducts',
                    component: '::div',
                    _visible: '{{ data.type == "toSellProducts" }}', 
                    className: 'toSellProducts',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'title',
                        children: '以销定产流程'
                    }, {
                        name: 'btn1',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `为产成品存货配置原料(BOM)`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'peizhiyuanliao',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '配置原料',
                            }]
                        }],
                        onClick: '{{function(){$openMaterial()}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据销售出库单确定产成品数量，再根据每个产成品对应的配置原料，自动生成销售出库单`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'yixiaodingchanzidonglingliao',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '以销定产自动领料',
                            }] 
                        }],
                        onClick: '{{function(){$automaticPicking()}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: [{
                                name: 'tip1',
                                component: '::div',
                                children: '1、以销定产—自动算出产成品明细数量和分摊率'
                            },{
                                name: 'tip2',
                                component: '::div',
                                children: '2、成本核算自动取值—根据材料出库单和生产入库对方科目算出直接材料，制造费用，工人工资，其他费用'
                            }],
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'rukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '新增产品入库单—成本核算自动取值',
                            }]
                        }],
                        onClick: '{{function(){$addInventory("addInventoryIn")}}}' 
                    },{
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    },{
                        name: 'btn4',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据计价核算方式，计算出存货的成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'cunhuo-chengbenjisuan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '成本计算',
                            }]
                        }],
                        onClick: '{{function(){$costCalculation()}}}' 
                    }]
                },{
                    name: 'costIncomeRatio',
                    component: '::div',
                    _visible: '{{ data.type == "costIncomeRatio" }}', 
                    className: 'costIncomeRatio',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'title',
                        children:[{
                            name: 'span1',
                            component: '::span',
                            children: '以销定产—按成本占收入比例核算 '
                        },{
                            name: 'span2',
                            component: '::span',
                            children: '{{data.accountRatio}}'
                        }]
                    }, {
                        name: 'btn1',
                        component: '::a',
                        className: 'accountingmethod-btn costIncomeRatio-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `销项发票生成销售出库单，根据销项发票的金额和成本率，自动计算销售成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'cunhuo-chengbenjisuan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '按比例自动计算销售成本',
                            }]
                        }],
                        onClick: '{{function(){$handleSalesCost()}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据销售成本和期初数据，计算出需要多少产成品入库才可以满足销售出库`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'rukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '确认产成品入库单成本',
                            }]
                        }],
                        onClick: '{{function(){$handleWaEntryCost()}}}' 
                    },{
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    },{
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据产成品直接材料成本，确认需要多少材料才可以生成对应的产成品`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'xinzengcailiaochukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '根据产成品成本，录入材料出库单'
                                // children: '根据产成品直接材料的金额，录入材料出库单',
                            }]
                        }],
                        onClick: '{{function(){$handleAmountGen()}}}' 
                    }]
                },{
                    name: 'costSaleRatio',
                    component: '::div',
                    _visible: '{{ data.type == "costSaleRatio" }}', 
                    className: 'costSaleRatio',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'title',
                        children:[{
                            name: 'span1',
                            component: '::span',
                            children: '以销定产—按销售单价占比核算 '
                        },{
                            name: 'span2',
                            component: '::span',
                            children: '{{data.accountRatio}}'
                        }]
                    }, {
                        name: 'btn1',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `为产成品存货配置原料(BOM)`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'peizhiyuanliao',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '配置原料',
                            }]
                        }],
                        onClick: '{{function(){$openMaterial()}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据销售出库单确定产成品数量，再根据每个产成品对应的配置原料，自动生成销售出库单`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'yixiaodingchanzidonglingliao',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '以销定产自动领料',
                            }] 
                        }],
                        onClick: '{{function(){$automaticPicking()}}}' 
                    }, {
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    }, {
                        name: 'btn2',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `销项发票生成销售出库单，根据销项发票的金额和成本率，自动计算销售成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'cunhuo-chengbenjisuan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '以销定产确定销售成本',
                            }]
                        }],
                        onClick: '{{function(){$handleSalesCost("costSaleRatio")}}}' 
                    },{
                        name: 'jiantou',
                        component: '::span',
                        className: 'jiantou',
                        children: [{
                            name: 'line',
                            component: '::span',
                            className: 'line',
                        }, {
                            name: 'icon',
                            component: 'Icon',
                            fontFamily: 'edficon',
                            className: 'icon',
                            type: 'bumenrenyuanxialaguan',
                        }],
                    },{
                        name: 'btn4',
                        component: '::a',
                        className: 'accountingmethod-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `根据计价核算方式，计算出存货的成本`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'rukudan',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '确定产品入库成本',
                            }]
                        }],
                        onClick: '{{function(){$handleWaEntryCost("costSaleRatio")}}}' 
                    }]
                }]
            }]
        }]
    }
}

export function getInitState() {
	return {
		data: {
            type: "",
            //type: "toSellProducts",
            date: '',
            paramValue: '2018-01-01',
            isReturn: true,
            lastDay: '',
            accountRatio: '50%'
		}
	}
}
