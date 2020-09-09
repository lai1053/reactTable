export const generalBtnType = [
   {
        name: 'add',
        className: 'header-btn',
        type: 'primary',
        children: '新增',
        key: 'addCustomer'
    },
    // {
    //     name: 'import',
    //     className: 'header-btn',
    //     type: 'primary',
    //     children: '导入',
    //     key: 'importCustomer'
    // },
    // {
    //     name: 'download',
    //     className: 'header-btn',
    //     type: 'primary',
    //     children: '下载纳税人信息',
    //     key: 'downloadNSRXX'
    // }
]
export const smallBtnType = [
    {
        name: 'start',
        className: 'header-btn',
        type: 'primary',
        children: '启用',
        key: 'startCustomer'
    },
    {
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
                caption: "联系人",
                fieldName: 'name',
                // isFixed: true,
                isVisible: true,
                width: '16%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'helpCode',
                caption: "联系方式",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '9%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "商机类型",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '13%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'areaName',
                caption: '商机状态',
                fieldName: 'areaName',
                isVisible: true,
                isMustSelect: true,
                align: '',
                width: '12%',
            }, {
                id: 'psbState',
                caption: '优先级',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'psbState',
                width: '9%',
            }, {
                id: 'infoState',
                caption: '来源',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'infoState',
                width: '9%',
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

}
