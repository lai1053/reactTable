export const btnType = [{
    name: 'sale',
    className: 'header-btn',
    type: 'primary',
    children: '一键读取发票',
    title: '一键读取销项发票',
    key: 'inv-app-sales-collect-card',
},  {
    name: 'sales',
    className: 'header-btn',
    type: 'primary',
    children: '票税宝补票',
    title: '票税宝补票',
    key: 'psbbupiao'
},{
    name: 'sales',
    className: 'header-btn',
    type: 'primary',
    children: '打印电子票',
    title: '打印电子票',
    key: 'printprintInvoices'
}]
export const more = [
    {
        type: 'import',
        isDisabled: false,
        name: '导入',
        title: '导入销项发票',
    }, {
    type: 'inv-app-sales-export-card',
    name: '导出',
    title: '导出销项发票',
    isDisabled:true,
    hasSub: false
},
{
    type: 'addInvoice',
    name: '新增',
    isDisabled:false,
    hasSub: true,
    subItem: [{
        type: 'inv-app-new-invoices-card',
        name: '增值税专用发票',
        title: '增值税专用发票(销项)－新增',
        fpzl: '01',
        belong: 'common'
    },{
        type: 'inv-app-new-invoices-card',
        name: '增值税专用发票(代开）',
        title: '增值税专用发票(代开）(销项)－新增', //小规模专用
        fpzl: '10',
        belong: 'common'
    }, {
        type: 'inv-app-new-invoices-card',
        name: '机动车销售发票',
        title: '机动车销售发票(销项)-新增',
        fpzl: '03',
        belong: 'common'
    }, {
        type: 'inv-app-new-invoices-card',
        name: '增值税普通发票',
        title: '增值税普通发票(销项)-新增',
        fpzl: '04',
        sf01:'N', // 是否专票 N为普票
        belong: 'common'
    }, {
        type: 'inv-app-new-invoices-card',
        name: '二手车销售发票',
        title: '二手车销售发票(销项)-新增',
        fpzl: '07',
        sf01:'N',
        belong: 'common'
    },{
        type: 'inv-app-new-invoices-card',
        name: '普通机打发票',
        title: '普通机打发票(销项)-新增',
        fpzl: '05',
        sf01:'N',
        belong: 'common'
    }, {
        type: 'inv-app-new-invoices-card',
        name: '纳税检查调整',
        title: '纳税检查调整(销项)-新增',
        fpzl: '08',
        sf01:null, //既不是专票也不是普票
        belong: 'general'
    }, {
        type: 'inv-app-new-invoices-card',
        name: '未开具发票',
        title: '未开具发票(销项)-新增',
        fpzl: '09',
        sf01:'N',
        belong: 'common'
    }]
}, {
    type: 'deleteInvoice',
    isDisabled:false,
    name: '删除',
    hasSub: false,
}, {
    type: 'editInvoice',
    isDisabled:false,
    name: '修改',
    hasSub: false
}, {
    type: 'batchEditInvoice',
    isDisabled:false,
    name: '批量修改',
    hasSub: false
}]


export const columnData = [{
    sortTable: true,
    width: 100,
    id: 'fpzlMc',
    caption: '发票种类',
    align: '',
    className: 'inv-type',
    isVisible: true,
    isMustSelect: false,
    setting: false
},
//     {
//     sortTable: true,
//     width: 80,
//     id: 'showDzfp',
//     caption: '是否电子票',
//     align: 'center',
//     className: '',
//     isVisible: false,
//     isMustSelect: false,
//     setting: false
//
// },
    {
    sortTable: true,
    width: 80,
    id: 'showCheck',
    caption: '原始票',
    align: 'center',
    className: '',
    isVisible: false,
    isMustSelect: false,
    setting: false
    
},{
    sortTable: true,
    width: 100,
    id: 'formatedKprq',
    caption: '开票日期',
    align: 'center',
    className: '',
    isVisible: true,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 110,
    id: 'fpdm',
    caption: '发票代码',
    align: '',
    className: '',
    isVisible: false,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 80,
    id: 'fphm',
    caption: '发票号码',
    align: '',
    className: '',
    isVisible: true,
    isMustSelect: true,
    setting: false
}, {
    sortTable: true,
    width: 80,
    id: 'hjje',
    caption: '金额',
    align: '',
    className: 'table_td_align_right',
    isVisible: true,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 50,
    id: 'formatedZbslv',
    caption: '税率',
    align: '',
    className: 'table_td_align_right',
    isVisible: true,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 80,
    id: 'hjse',
    caption: '税额',
    align: '',
    className: 'table_td_align_right',
    isVisible: true,
    isMustSelect: true,
    setting: false
}, {
    sortTable: true,
    width: 180,
    id: 'gfmc',
    caption: '购方名称',
    align: '',
    className: '',
    isVisible: true,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 60,
    id: 'fpztDm',
    caption: '发票状态',
    align: 'center',
    className: '',
    isVisible: true,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 60,
    id: 'fplyLx',
    caption: '来源',
    align: 'center',
    className: '',
    isVisible: false,
    isMustSelect: false,
    setting: false
}, {
    sortTable: true,
    width: 110,
    id: 'df05',
    caption: '上传日期',
    align: 'center',
    className: '',
    isVisible: false,
    isMustSelect: false,
    setting: false
}, {
    sortTable: false,
    width: 110,
    id: 'skssq',
    caption: '发票属期',
    align: 'center',
    className: 'operation',
    isVisible: true,
    isMustSelect: true,
    setting: true
}]
export const filterFormOld = {
    invType: '',
    invCode: '',
    invNumber: '',
    customCode: '',
    taxRate: '',
    strDate: '',
    endDate: '',
    uploadStarDate:'',
    uploadEndDate:'',
    statusValue:['normal','hcfp'],
    goodsType: '-0001',
    taxFlag: '',
    normalFpzs: '',
    scopeType:1,
    isDzfp:'全部',
    showCheck:'全部'
}