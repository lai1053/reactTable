
export const columnData = [
    {
        id: 'sqldse',
        caption: "存货编号",
        fieldName: 'inventoryCode',
        isFixed: false,
        isVisible: true,
        width: 80,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, 
    {
        id: 'sqldse',
        caption: "存货名称",
        fieldName: 'inventoryName',
        isFixed: false,
        isVisible: true,
        width: 120,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, 
    {
        id: 'sqldse',
        caption: "规格型号",
        fieldName: 'inventoryGuiGe',
        isFixed: false,
        isVisible: true,
        width: 80,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, 
    {
        id: 'sqldse',
        caption: "单位",
        fieldName: 'inventoryUnit',
        isFixed: false,
        isVisible: true,
        width: 80,
        isMustSelect: false,
        className: 'table_td_align_left',
        amount: true
    }, 
    {
        id: 'xxfp',
        caption: '待领料',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        children: [
            {
                caption: "数量",
                fieldName: 'num',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align: 'right'
            }, 
            {
                caption: "单价",
                fieldName: 'price',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align: 'right',
                className: 'table_td_align_right',
                amount: true
            }, 
            {
                caption: "金额",
                fieldName: 'ybbalance',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align:'right',
                className: 'table_td_align_right',
                amount: true
            }, 
        ]
    },   
    {
        id: 'xxfp',
        caption: '已领料',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        children: [
            {
                caption: "数量",
                fieldName: 'yscNum',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align: 'right'
            },
            {
                caption: "金额",
                fieldName: 'yscYbBalance',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align:'right',
                className: 'table_td_align_right',
                amount: true
            }, 
        ]
    },
    {
        id: 'jxfpwrz',
        caption: '本次领料',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        children: [
            {
                caption: "数量",
                fieldName: 'numberChange',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 95,
                className:'table_td_align_div table_td_align_right',
            }, 
            {
                caption: "金额",
                fieldName: 'moneryChange',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                align: 'right',
                className: 'table_td_align_right',
                amount: true
            }, 
        ]
    },
    {
        id: 'kucun',
        caption: '库存缺口',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        children: [
            {
                caption: "数量",
                fieldName: 'kucunnumber',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                width: 80,
                className:'table_td_align_right',
            }, 
            {
                caption: "金额",
                fieldName: 'kucunmonery',
                isFixed: false,
                isVisible: true,
                isSubTitle: true,
                // width: 80,
                align: 'right',
                className: 'table_td_align_right',
                amount: true
            }
        ]
    }
]