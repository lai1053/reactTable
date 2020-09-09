export const generalBtnType = [
   {
        name: 'add',
        className: 'header-btn',
        type: 'primary',
        children: '新增',
        btnId:'20010_300_1_100',
        key: 'addCustomer'
    },
    {
        name: 'import',
        className: 'header-btn',
        type: 'primary',
        children: '导入',
        btnId:'20010_300_1_200',
        key: 'importCustomer'
    },
    {
        name: 'download',
        className: 'header-btn',
        type: 'primary',
        children: '下载纳税人信息',
        btnId:'20010_200_1_300',
        key: 'downloadNSRXX'
    },
    // {
    //     name: 'digitalCertificate',
    //     className: 'header-btn',
    //     type: 'primary',
    //     children: '开通数字证书',
    //     key: 'digitalCertificate'
    // },
    // {
    //     name: 'updateStatus',
    //     className: 'header-btn',
    //     type: 'primary',
    //     children: '更新状态',
    //     key: 'updateStatus'
    // }
]
export const smallBtnType = [
    {
        name: 'start',
        className: 'header-btn',
        type: 'primary',
        children: '启用',
        btnId:'20010_300_0_100',
        key: 'startCustomer'
    },
    {
        name: 'delete',
        className: 'header-btn',
        type: 'primary',
        children: '删除',
        btnId:'20010_400_0_200',
        key: 'delCustomer'
    },
    {
        name: 'export',
        className: 'header-btn',
        // type: '',
        children: '导出',
        btnId:'20010_300_0_200',
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
                width: '24%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '7%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '18%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'areaName',
                caption: '所属区域',
                fieldName: 'areaName',
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
                id: 'khsx',
                caption: '服务类型',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'khsx',
                width: '9%',
            }, {
                id: 'psbState',
                caption: '票税宝',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'psbState',
                width: '5%',
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
            },
            // {
            //     id: 'ktzssqzt',
            //     caption: '数字证书',
            //     isVisible: true,
            //     isMustSelect: true,
            //     align: 'center',
            //     fieldName: 'ktzssqzt',
            //     width: '9%',
            // },
            {
                id: 'infoState',
                caption: '纳税人信息',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'infoState',
                width: '9%',
            },
            {
                id: 'gsmmjyjg',
                caption: '个税密码校验',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'gsmmjyjg',
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
                width: 260,
                align: 'center',
                className: 'operation',
                amount: false
            }],
        columnsfzym: [
            {
                id: 'name',
                caption: "客户名称",
                fieldName: 'name',
                // isFixed: true,
                isVisible: true,
                width: '24%',
                isMustSelect: true,
                align: '',
                className:'',
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '7%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '18%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'areaName',
                caption: '所属区域',
                fieldName: 'areaName',
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
                id: 'khsx',
                caption: '服务类型',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'khsx',
                width: '9%',
            },
            // {
            //     id: 'psbState',
            //     caption: '票税宝',
            //     isVisible: true,
            //     isMustSelect: true,
            //     align: 'center',
            //     fieldName: 'psbState',
            //     width: '9%',
            // },
            // {
            //     id: 'ktzssqzt',
            //     caption: '数字证书',
            //     isVisible: true,
            //     isMustSelect: true,
            //     align: 'center',
            //     fieldName: 'ktzssqzt',
            //     width: '9%',
            // },
            {
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
            {
                id: 'gsmmjyjg',
                caption: '个税密码校验',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'gsmmjyjg',
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
                width: 260,
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
                width: '24%',
                isMustSelect: true,
                align: ''
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '7%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '18%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'areaName',
                caption: '所属区域',
                fieldName: 'areaName',
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
                id: 'khsx',
                caption: '服务类型',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'khsx',
                width: '9%',
            }, {
                id: 'psbState',
                caption: '票税宝',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'psbState',
                width: '5%',
            }, {
                id: 'infoState',
                caption: '纳税人信息',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'infoState',
                width: '9%',
            },
            {
                id: 'gsmmjyjg',
                caption: '个税密码校验',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'gsmmjyjg',
                width: '9%',
            },
            {
                id: 'operation',
                caption: "操作",
                fieldName: 'operation',
                isFixed: 'right',
                isVisible: true,
                isMustSelect: true,
                width: 260,
                align: 'center',
                className: 'operation',
                amount: false
            }],
        columnsfzym: [
            {
                id: 'name',
                caption: "客户名称",
                fieldName: 'name',
                // isFixed: true,
                isVisible: true,
                width: '24%',
                isMustSelect: true,
                align: ''
            }, {
                id: 'helpCode',
                caption: "助记码",
                fieldName: 'helpCode',
                isFixed: false,
                isVisible: true,
                width: '7%',
                isMustSelect: false,
                align: ''
            }, {
                id: 'nsrsbh',
                caption: "纳税人识别号",
                fieldName: 'nsrsbh',
                isFixed: false,
                isVisible: true,
                width: '18%',
                isMustSelect: false,
                align: '',
                className: '',
            }, {
                id: 'areaName',
                caption: '所属区域',
                fieldName: 'areaName',
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
                id: 'khsx',
                caption: '服务类型',
                isVisible: true,
                isMustSelect: true,
                align: 'center',
                fieldName: 'khsx',
                width: '9%',
            },
            // {
            //     id: 'psbState',
            //     caption: '票税宝',
            //     isVisible: true,
            //     isMustSelect: true,
            //     align: 'center',
            //     fieldName: 'psbState',
            //     width: '9%',
            // },
            {
                id: 'infoState',
                caption: '纳税人信息',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'infoState',
                width: '9%',
            },
            {
                id: 'gsmmjyjg',
                caption: '个税密码校验',
                isVisible: true,
                isMustSelect: false,
                align: 'center',
                fieldName: 'gsmmjyjg',
                width: '9%',
            },
            {
                id: 'operation',
                caption: "操作",
                fieldName: 'operation',
                isFixed: 'right',
                isVisible: true,
                isMustSelect: true,
                width: 260,
                align: 'center',
                className: 'operation',
                amount: false
            }],
        columnsOld: ['khmc', 'mneCode', 'nsrsbh', 'ssqy', 'psb','nsrxx', 'operation'],
        pageId: '停用客户'
    }
}
