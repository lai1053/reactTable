export const generalBtnType = [
  {
    name: 'sale',
    className: 'header-btn',
    type: 'primary',
    children: '一键读取销项',
    key: 'loadSaleInvoice'
  },
  {
    name: 'purchase',
    className: 'header-btn',
    type: 'primary',
    children: '一键读取进项',
    key: 'loadPurchaseInvoice'
  }
]
export const columnData = [
  {
    id: 'sqldse',
    caption: '上期留抵税额',
    fieldName: 'sqldse',
    isFixed: false,
    isVisible: true,
    width: 120,
    isMustSelect: false,
    align: '',
    className: 'table_td_align_right',
    amount: true
  },
  {
    id: 'xxfp',
    caption: '销项发票',
    fieldName: 'xxfp',
    isVisible: true,
    isMustSelect: true,
    align: '',
    width: 400,
    children: [
      {
        caption: '份数',
        fieldName: 'xxfpfs',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'xxhjje',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'xxhjse',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'xxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'xx'
      }
    ]
  },
  {
    id: 'jxfpyrz',
    caption: '进项发票（已认证）',
    isVisible: true,
    isMustSelect: true,
    align: '',
    fieldName: 'jxfpyrz',
    width: 400,
    children: [
      {
        caption: '份数',
        fieldName: 'jxfpfsyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'jxhjjeyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'jxhjseyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'jxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'jx'
      }
    ]
  },
  {
    id: 'jxfpwrz',
    caption: '进项发票（未认证）',
    isVisible: false,
    isMustSelect: false,
    align: '',
    fieldName: 'jxfpwrz',
    width: 320,
    children: [
      {
        caption: '份数',
        fieldName: 'jxfpfswrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'jxhjjewrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'jxhjsewrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'jxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'jx'
      }
    ]
  },
  {
    id: 'ygse',
    caption: '预估税额',
    fieldName: 'ygse',
    isFixed: false,
    isVisible: true,
    isMustSelect: false,
    width: 120,
    align: '',
    className: 'table_td_align_right',
    amount: true
  },
  {
    id: 'operation',
    caption: '操作',
    fieldName: 'operation',
    isFixed: false,
    isVisible: true,
    isMustSelect: true,
    width: 100,
    align: 'center',
    amount: false,
    className: 'operation'
  }
]

export const columnData2 = [
  {
    id: 'sqldse',
    caption: '上期留抵税额',
    fieldName: 'sqldse',
    isFixed: false,
    isVisible: true,
    width: 120,
    isMustSelect: false,
    align: '',
    className: 'table_td_align_right',
    amount: true
  },
  {
    id: 'xxfp',
    caption: '销项发票',
    fieldName: 'xxfp',
    isVisible: true,
    isMustSelect: true,
    align: '',
    width: 400,
    children: [
      {
        caption: '份数',
        fieldName: 'xxfpfs',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'xxhjje',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'xxhjse',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'xxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'xx'
      }
    ]
  },
  {
    id: 'jxfpyrz',
    caption: '进项发票（已认证）',
    isVisible: true,
    isMustSelect: true,
    align: '',
    fieldName: 'jxfpyrz',
    width: 400,
    children: [
      {
        caption: '份数',
        fieldName: 'jxfpfsyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'jxhjjeyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'jxhjseyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '有效税额',
        fieldName: 'jxhjseyxseyrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'jxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'jx'
      }
    ]
  },
  {
    id: 'jxfpwrz',
    caption: '进项发票（未认证）',
    isVisible: false,
    isMustSelect: false,
    align: '',
    fieldName: 'jxfpwrz',
    width: 320,
    children: [
      {
        caption: '份数',
        fieldName: 'jxfpfswrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        width: 80,
        align: ''
      },
      {
        caption: '金额',
        fieldName: 'jxhjjewrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '税额',
        fieldName: 'jxhjsewrz',
        isFixed: false,
        isVisible: true,
        isSubTitle: true,
        //width: 80,
        align: '',
        className: 'table_td_align_right',
        amount: true
      },
      {
        caption: '状态',
        fieldName: 'jxcjzt',
        isFixed: false,
        isVisible: true,
        isSubTitle: false,
        width: 60,
        align: 'center',
        type: 'jx'
      }
    ]
  },
  {
    id: 'ygse',
    caption: '预估税额',
    fieldName: 'ygse',
    isFixed: false,
    isVisible: true,
    isMustSelect: false,
    width: 120,
    align: '',
    className: 'table_td_align_right',
    amount: true
  },
  {
    id: 'operation',
    caption: '操作',
    fieldName: 'operation',
    isFixed: false,
    isVisible: true,
    isMustSelect: true,
    width: 100,
    align: 'center',
    amount: false,
    className: 'operation'
  }
]

export const Tips = {
  '0': {
    loadSaleInvoice: [
      {
        title: '温馨提示：',
        content: '读取本月开具发票。'
      }
    ],
    loadPurchaseInvoice: [
      {
        title: '温馨提示：',
        content: '读取本月认证发票和本月开具发票'
      }
    ]
  },
  '1': {
    loadSaleInvoice: [
      {
        title: '温馨提示：',
        content: '“季报”客户将读取本季度开具发票'
      },
      {
        title: '',
        content: '“月报”客户将读取本月开具发票。'
      }
    ],
    loadPurchaseInvoice: [
      {
        title: '温馨提示：',
        content: '“季报”客户将读取本季度开具发票'
      },
      {
        title: '',
        content: '“月报”客户将读取本月开具发票。'
      }
    ]
  }
}
