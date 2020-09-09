import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-scm-app-inventory-salescostaccount',
        children: [{ 
            name: 'ttk-scm-app-inventory-salescostaccount-content',
            component: '::div',
            className: 'ttk-scm-app-inventory-salescostaccount-content',
            children: [{
                name: 'content',
                component: '::div',
                className: 'ttk-scm-app-inventory-salescostaccount-bottom',
                children: [{
                    name: 'incomeRatio',
                    component: '::div',
                    className: 'incomeRatio',
                    children: [{
                        name: 'title',
                        component: '::div',
                        className: 'title',
                        children: '{{ "成本占收入比例核算 " + (data.accountRatio).toFixed(2) + " %" }}'
                    }, {
                        name: 'btn1',
                        component: '::a',
                        className: 'accountingmethod-btn traditional-btn',
                        children: [{
                            name: 'popover',
                            component: 'Popover',
                            content: `进项发票生成凭证自动生成采购入库单，确定采购入库数据`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'jinxiangfapiaozhijieruku',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '进项发票直接入库',
                            }]
                        }],
                        onClick: '{{function(){$handleJumpPage("procurement")}}}' 
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
                            content: `销项发票生成凭证自动生成销售出库单，确定销售出库数据`,
                            placement: 'bottom',
                            overlayClassName: 'helpPopover',
                            children: [{
                                name: 'icon',
                                component: 'Icon',
                                fontFamily: 'edficon',
                                type: 'xiaoxiangfapiaozidongchuku-1',
                            }, {
                                name: 'word',
                                component: '::span',
                                children: '销项发票自动出库',
                            }]
                        }],
                        onClick: '{{function(){$handleJumpPage("salesOutlet")}}}' 
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
                            content: `销售出库单按照比例自动计算成本，根据成本回写销售出库单单价`,
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
                        onClick: '{{function(){$salesAutomaticCalculation()}}}' 
                    }]
                }]
            }]
        }]
    }
}

export function getInitState() {
	return {
		data: {
            lastCalendar: '',
            accountRatio: 100
		}
	}
}
