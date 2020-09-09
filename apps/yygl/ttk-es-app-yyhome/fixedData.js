export const generalBtnType = [
   {
        name: 'add',
        className: 'header-btn',
        type: 'primary',
        children: '新增',
        key: 'addCustomer'
    }, {
        name: 'import',
        className: 'header-btn',
        type: 'primary',
        children: '导入',
        key: 'importCustomer'
    }, {
        name: 'download',
        className: 'header-btn',
        type: 'primary',
        children: '下载纳税人信息',
        key: 'downloadNSRXX'
    }
]
export const smallBtnType = [
    {
        name: 'start',
        className: 'header-btn',
        type: 'primary',
        children: '启用',
        key: 'startCustomer'
    }, {
        name: 'export',
        className: 'header-btn',
        // type: '',
        children: '导出',
        key: 'exportCustomer'
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
            content: '“季报”客户将读取本季度开具发票'
        }, {
            title: '',
            content: '“月报”客户将读取本月开具发票。'
        }],
        loadPurchaseInvoice: [{
            title: '温馨提示：',
            content: '“季报”客户将读取本季度开具发票'
        }, {
            title: '',
            content: '“月报”客户将读取本月开具发票。'
        }]
    },
}
export const columnData = {
    1: {
        columns: [
            {
                id: 'name',
                caption: "客户名称",
                fieldName: 'name',
                // isFixed: true,
                isVisible: true,
                width: '18%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '9%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '13%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'sfdm',
                caption: '所属区域',
                fieldName: 'sfdm',
                isVisible: true,
                isMustSelect: true,
                align: '',
                width: '12%',
                // children: [
                //     {
                //     caption: "份数",
                //     fieldName: 'xxfpfs',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     width: 80,
                //     align: '',
                //     amount: false
                // }, {
                //     caption: "金额",
                //     fieldName: 'xxhjje',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "税额",
                //     fieldName: 'xxhjse',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "状态",
                //     fieldName: 'xxcjzt',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: false,
                //     width: 60,
                //     align: 'center',
                //     type: 'xx'
                // }]
            }, {
                id: 'psb',
                caption: '票税宝',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'psb',
                width: '9%',
                // children: [
                //     {
                //     caption: "份数",
                //     fieldName: 'jxfpfsyrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     width: 80,
                //     align: '',
                //     amount: false
                // }, {
                //     caption: "金额",
                //     fieldName: 'jxhjjeyrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "税额",
                //     fieldName: 'jxhjseyrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "状态",
                //     fieldName: 'jxcjzt',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: false,
                //     width: 60,
                //     align: 'center',
                //     type: 'jx',
                // }]
            }, {
                id: 'infoState',
                caption: '纳税人信息',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'infoState',
                width: '9%',
                // children: [
                //     {
                //     caption: "份数",
                //     fieldName: 'jxfpfswrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     width: 80,
                //     align: '',
                //     amount: false
                // }, {
                //     caption: "金额",
                //     fieldName: 'jxhjjewrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "税额",
                //     fieldName: 'jxhjsewrz',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "状态",
                //     fieldName: 'jxcjzt',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: false,
                //     width: 60,
                //     align: 'center',
                //     type: 'jx'
                // }]
            },
            // {
            //     id: 'ygse',
            //     caption: "预估税额",
            //     fieldName: 'ygse',
            //     isFixed: false,
            //     isVisible: true,
            //     isMustSelect: false,
            //     width: 120,
            //     align: '',
            //     className: 'table_td_align_right',
            //     amount: true
            // },
            {
                id: 'operation',
                caption: "操作",
                fieldName: 'operation',
                isFixed: 'right',
                isVisible: true,
                isMustSelect: true,
                width: 235,
                align: 'center',
                className: 'operation',
                amount: false
            }],
        columnsOld: ['khmc', 'mneCode', 'nsrsbh', 'ssqy', 'psb','nsrxx', 'operation'],
        pageId: '正常客户'
    },
    0: {
        columns: [
            {
                id: 'name',
                caption: "客户名称",
                fieldName: 'name',
                // isFixed: true,
                isVisible: true,
                width: 290,
                isMustSelect: true,
                align: ''
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: 130,
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: 200,
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'sfdm',
                caption: '所属区域',
                fieldName: 'sfdm',
                isVisible: true,
                isMustSelect: true,
                align: '',
                width: 200,
                // children: [
                //     {
                //     caption: "份数",
                //     fieldName: 'xxfpfs',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     width: 80,
                //     align: '',
                //     amount: false
                // }, {
                //     caption: "金额",
                //     fieldName: 'xxhjje',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "税额",
                //     fieldName: 'xxhjse',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: true,
                //     //width: 120,
                //     align: '',
                //     className: 'table_td_align_right',
                //     amount: true
                // }, {
                //     caption: "状态",
                //     fieldName: 'xxcjzt',
                //     isFixed: false,
                //     isVisible: true,
                //     isSubTitle: false,
                //     width: 60,
                //     align: 'center',
                //     type: 'xx'
                // }]
            }, {
                id: 'psb',
                caption: '票税宝',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'psb',
                width: 130,
            }, {
                id: 'infoState',
                caption: '纳税人信息',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'infoState',
                width: 130,
            },
            {
                id: 'operation',
                caption: "操作",
                fieldName: 'operation',
                isFixed: 'right',
                isVisible: true,
                isMustSelect: true,
                width: 235,
                align: 'center',
                className: 'operation',
                amount: false
            }],
        columnsOld: ['khmc', 'mneCode', 'nsrsbh', 'ssqy', 'psb','nsrxx', 'operation'],
        pageId: '停用客户'
    }
}
