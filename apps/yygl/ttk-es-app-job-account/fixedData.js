export const jdTableColumns = [
    {
        id: 'personName',
        caption: '姓名',
        fieldName: 'personName',
        isFixed: false,
        isVisible: true,
        width: 120,
        isMustSelect: false,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },{
        id: 'fwCustCount',
        caption: '服务客户数',
        fieldName: 'fwCustCount',
        isFixed: false,
        isVisible: true,
        width: 120,
        isMustSelect: false,
        align: 'center',
        className: 'table_td_align_right',
        amount: true
      },{
        id: 'createAccountCount',
        caption: '建账客户数',
        fieldName: 'createAccountCount',
        isFixed: false,
        isVisible: true,
        width: 120,
        isMustSelect: false,
        align: 'center',
        amount: true
      },{
        id: 'jzjd',
        caption: '记账进度',
        fieldName: 'jzjd',
        isVisible: true,
        isMustSelect: true,
        align: 'center',
        // width: 400,
        children: [
          {
            caption: '无任务',
            fieldName: 'jz_wrw',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 120,
            align: 'center'
          },{
            caption: '未完成',
            fieldName: 'jz_wwc',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 120,
            align: 'center'
          },{
            caption: '已完成',
            fieldName: 'jz_ywc',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            width: 120,
            align: 'center'
          }
        ]
    },{
      id: 'option',
      caption: '操作',
      fieldName: 'option',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: 'center',
      amount: true
    }
]

export const gzTableColumns = [
  {
      id: 'personName',
      caption: '姓名',
      fieldName: 'personName',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: '',
      className: 'table_td_align_right',
      amount: true
    },{
      id: 'fwCustCount',
      caption: '服务客户数',
      fieldName: 'fwCustCount',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: 'center',
      className: 'table_td_align_right',
      amount: true
    },{
      id: 'createAccountCount',
      caption: '建账客户数',
      fieldName: 'createAccountCount',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: 'center',
      className: 'table_td_align_right',
      amount: true
    },{
      id: 'xxfp',
      caption: '含导账',
      fieldName: 'xxfp',
      isVisible: true,
      isMustSelect: true,
      align: 'center',
      // width: 400,
      children: [
        {
          caption: '凭证数',
          fieldName: 'voucherAmountWithImport',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        },{
          caption: '分录数',
          fieldName: 'journalizingWithImport',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        }
      ]
  },{
      id: 'xxfp',
      caption: '不含导账',
      fieldName: 'xxfp',
      isVisible: true,
      isMustSelect: true,
      align: 'center',
      // width: 400,
      children: [
        {
          caption: '凭证数',
          fieldName: 'voucherAmountWithoutImport',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        },{
          caption: '分录数',
          fieldName: 'journalizingWithoutImport',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        }
      ]
  }
]

export const sbTableColumns = [
  {
      id: 'personName',
      caption: '姓名',
      fieldName: 'personName',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: '',
      className: 'table_td_align_right',
      amount: true
    },{
      id: 'fwCustCount',
      caption: '服务客户数',
      fieldName: 'fwCustCount',
      isFixed: false,
      isVisible: true,
      width: 120,
      isMustSelect: false,
      align: 'center',
      className: 'table_td_align_right',
      amount: true
    },{
      id: 'sbjd',
      caption: '申报进度',
      fieldName: 'sbjd',
      isVisible: true,
      isMustSelect: true,
      align: 'center',
      // width: 400,
      children: [
        {
          caption: '无任务',
          fieldName: 'wrw',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        },{
          caption: '未完成',
          fieldName: 'wsb',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        },{
          caption: '已完成',
          fieldName: 'ywc',
          isFixed: false,
          isVisible: true,
          isSubTitle: true,
          width: 120,
          align: 'center'
        }
      ]
  },{
    id: 'option1',
    caption: '操作',
    fieldName: 'option1',
    isFixed: false,
    isVisible: true,
    width: 120,
    isMustSelect: false,
    align: 'center',
    amount: true
  }
]