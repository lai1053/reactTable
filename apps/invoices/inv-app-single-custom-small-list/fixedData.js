
export const smallBtnType = [
    {
        name: 'sale',
        className: 'header-btn',
        type: 'primary',
        children: '一键读取销项',
        key: 'loadSaleInvoice',
    }, {
        name: 'purchase',
        className: 'header-btn',
        type: 'primary',
        children: '一键读取进项',
        key: 'loadPurchaseInvoice',
    }, {
        name: 'limit',
        className: 'header-btn',
        type: 'primary',
        children: '上限预警',
        key: 'setLimitData'
    }
]
export const Tips = {
    '0': {
        loadSaleInvoice: [{
            title: '温馨提示：',
            content: '读取本月开具发票。'
        }],
        loadPurchaseInvoice: [{
            title: '温馨提示：',
            content: '读取本月认证发票和本月开具发票'
        }]
    },
    '1':{
        loadSaleInvoice: [{
            title: '温馨提示：',
            content: '读取所选月份开具发票\n'
        }],
        loadPurchaseInvoice: [{
            title: '温馨提示：',
            content: '读取所选月份开具或票税宝上传的发票。'
        }]
    },
}
export const columnData = [
    {
        id: 'cwbbType',
        caption: "纳税期限",
        fieldName: 'cwbbType',
        isFixed: false,
        isVisible: true,
        width: 100,
        isMustSelect: false,
        align: 'center'
    }, {
        id: 'xxfp',
        caption: '销项发票',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        width: 400,
        children: [{
            caption: "份数",
            fieldName: 'xxfpfs',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 80,
            align: ''
        }, {
            caption: "金额",
            fieldName: 'xxhjje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 43,
            align: '',
            className: 'table_td_align_right',
            amount: true
        }, {
            caption: "税额",
            fieldName: 'xxhjse',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 43,
            align: '',
            className: 'table_td_align_right',
            isToolTip: true,
            type: 'xx',
            amount: true
        }, {
            caption: "状态",
            fieldName: 'xxcjzt',
            isFixed: false,
            isVisible: true,
            isSubTitle: false,
            width: 60,
            align: 'center',
            type: 'xx'
        }]
    }, {
        id: 'totalAmount',
        caption: "连续12个月累计销售额",
        fieldName: 'totalAmount',
        isFixed: false,
        isVisible: true,
        width: 140,
        isMustSelect: false,
        align: '',
        className: 'table_td_align_right',
        amount: true
    }, {
        id: 'jxfpyrz',
        caption: '进项发票',
        isVisible: true,
        isMustSelect: true,
        align: '',
        width: 400,
        fieldName: 'jxfpyrz',
        children: [
            {
            caption: "份数",
            fieldName: 'jxfpfsyrz',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 80,
            align: ''
        }, {
            caption: "金额",
            fieldName: 'jxhjjeyrz',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 43,
            align: '',
            className: 'table_td_align_right',
            amount: true
        }, {
            caption: "税额",
            fieldName: 'jxhjseyrz',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 43,
            align: '',
            className: 'table_td_align_right',
            isToolTip: true,
            type: 'jx',
            amount: true
        }, {
            caption: "状态",
            fieldName: 'jxcjzt',
            isFixed: false,
            isVisible: true,
            isSubTitle: false,
            width: 60,
            align: 'center',
            type: 'jx'
        }]
    }, {
        id: 'operation',
        caption: "操作",
        fieldName: 'operation',
        isFixed: false,
        isVisible: true,
        isMustSelect: true,
        width:100,
        align: 'center',
        className: 'operation',
    }]