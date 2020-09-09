import { consts } from 'edf-consts'
export function getMeta() {
    return {
        name: 'root',
        component: 'Layout',
        className: 'ttk-gl-app-importdata-success',
        children: [{
            name: 'content',
            component: '::div',
            className: 'ttk-gl-app-importdata-success-content',
            children: [{
                name: 'container',
                component: '::div',
                _visible: '{{data.other.title?true:false}}',
                className: 'bgImgContainer',
                children: [{
                    name: 'success',
                    component: 'Icon',
                    fontFamily: 'edficon',
                    className: 'success',
                    type: 'chenggongtishi',
                }, {
                    component: '::div',
                    className: 'tips',
                    children: '{{data.other.title}}',
                }]
            },
            {
                name: 'spin',
                component: 'Spin',
                tip: '请稍等,数据在导入中...',
                spinning: '{{data.loading}}',
                className: 'ant-spin-container',
                size: 'large',
                children: '{{$renderTips()}}'
            }, {
                component: 'Button',
                children: '确定',
                type: 'primary',
                _visible: '{{!data.other.title?false: !((data.appVersion == 107 && sessionStorage["dzSource"] == 1) || data.appVersion == 114)}}',
                className: 'btn',
                onClick: '{{$close}}'
            }]
        }]
    }
}

export function getInitState() {
    return {
        data: {
            loading: false,
            other: {
                title: '',
                sucessinfos: [],
                converseInfo: {
                    'SDVoucher': '凭证',
                    'SDAcctAmount': '期初',
                    'SDAccount': '科目',
                    'SDCustomer': '客户',
                    'SDdepartment': '部门',
                    'SDEmployee': '人员',
                    'SDSupply': '供应商',
                    'SDUserItem': '自定义档案',
                    'SDBankAccount': '银行账户',
                    'SDCurrency': '币种',
                    'SDInventory': '存货',
                    'SDProject': '项目',
                    'SDUnit': '计量单位'
                }
            }
        }
    }
}
