

export const generalBtnType = [
  // {
  //   name: 'sale',
  //   className: 'header-btn',
  //   type: 'primary',
  //   children: '一键读取销项',
  //   key: 'loadSaleInvoice',
  //   disabled: false,
  // }, {
  //   name: 'purchase',
  //   className: 'header-btn',
  //   type: 'primary',
  //   children: '一键读取进项',
  //   key: 'loadPurchaseInvoice',
  //   disabled: false,
  // },
  {
    name: 'purchase',
    className: 'header-btn',
    type: '',
    children: '导出',
    key: 'export',
    disabled: false,
  }
]
export const smallBtnType = [
  // {
  //   name: 'sale',
  //   className: 'header-btn',
  //   type: 'primary',
  //   children: '一键读取销项',
  //   key: 'loadSaleInvoice',
  //   disabled: false,
  // }, {
  //   name: 'purchase',
  //   className: 'header-btn',
  //   type: 'primary',
  //   children: '一键读取进项',
  //   key: 'loadPurchaseInvoice',
  //   disabled: false,
  // },
  {
    name: 'purchase',
    className: 'header-btn',
    type: '',
    children: '导出',
    key: 'export',
    disabled: false,
  }
]
export const Tips = {
  '0': {
    loadSaleInvoice: [{
      title: '温馨提示：',
      content: '读取所选月份开具发票。'
    }],
    loadPurchaseInvoice: [{
      title: '温馨提示：',
      content: '读取所选月份认证发票和开具发票',
    },{
      title:'',
      content: '读取票税宝所选月份上传发票',
    }]
  },
  '1': {
    loadSaleInvoice: [{
      title: '温馨提示：',
      content: '读取所选月份开具发票'
    }],
    loadPurchaseInvoice: [{
      title: '温馨提示：',
      content: '读取所选月份开具或票税宝上传的发票。'
    }]
  },
}

export const tableColumns = [
  {
      dataIndex: 'hwmc',
      name: 'hwmc',
      key:"hwmc",
      title: "商品名称",
      isFixed: true, // 是否要固定
      isVisible: true,  // 根据后台返回值判断是否显示
      width: 250,
      isMustSelect: true, // 是否必选
      align: '',
      resizeAble: true,
  }, {
      dataIndex: 'ggxh',
      name: 'ggxh',
      key:"ggxh",
      title: "规格型号",
      isFixed: true,
      isVisible: true,
      width: 120,
      isMustSelect: true,
      align: '',
      resizeAble: true,
  }, {
      dataIndex: 'dw',
      name: 'dw',
      key:"dw",
      title: "单位",
      isFixed: true,
      isVisible: true,
      width: 80,
      isMustSelect: false,
      align: '',
      resizeAble: true,
      //className: 'table_td_align_right',
      //amount: true // 是否转千分位
      //amountSix:true // 是否转十万分位
  },
  {
      dataIndex: 'xxfp',
      name: 'xxfp',
      key:"xxfp",
      title: "销项发票",
      isVisible: true,
      isMustSelect: true,
      align: '',
      // flexGrow: 1,
      children: [
          {
              dataIndex: 'xxsl',
              name: 'xxsl',
              key:"xxsl",
              title: "数量",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              //className: 'table_td_align_right',
              amountSix: true

          },
          {
              dataIndex: 'xxje',
              name: 'xxje',
              key:"xxje",
              title: "金额",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              className: 'table_td_align_right',
              amount: true
          },
      ]
  },
  {
      dataIndex: 'jxfp',
      name: 'jxfp',
      key:"jxfp",
      title: "进项发票",
      isVisible: true,
      isMustSelect: true,
      align: '',
      // flexGrow: 1,
      children: [
          {
              dataIndex: 'jxsl',
              name: 'jxsl',
              key:"jxsl",
              title: "数量",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              //className: 'table_td_align_right',
              amountSix: true
          },
          {
              dataIndex: 'jxje',
              name: 'jxje',
              key:"jxje",
              title: "金额",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              className: 'table_td_align_right',
              amount: true
          },
      ]
  },
  {
      dataIndex: 'balance',
      name: 'balance',
      key:"balance",
      title: "差额",
      isVisible: true,
      isMustSelect: true,
      align: '',
      // flexGrow: 1,
      children: [
          {
              dataIndex: 'cesl',
              name: 'cesl',
              key:"cesl",
              title: "数量",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              //className: 'table_td_align_right',
              amountSix: true
          },
          {
              name: 'ceje',
              title: "金额",
              key:"ceje",
              dataIndex: "ceje",
              isFixed: false,
              isVisible: true,
              isSubTitle: true,
              width: 150,
              resizeAble: true,
              align: '',
              className: 'table_td_align_right',
              amount: true
          },
      ]
  }
]
export const columnData = {
  0: {
    columns: [
      {
        id: 'hwmc',
        caption: "商品名称",
        fieldName: 'hwmc',
        isFixed: true, // 是否要固定
        isVisible: true,  // 根据后台返回值判断是否显示
        width: 250,
        isMustSelect: true, // 是否必选
        align: ''
      }, {
        id: 'ggxh',
        caption: "规格型号",
        fieldName: 'ggxh',
        isFixed: true,
        isVisible: true,
        width: 120,
        isMustSelect: true,
        align: ''
      }, {
        id: 'dw',
        caption: "单位",
        fieldName: 'dw',
        isFixed: true,
        isVisible: true,
        width: 80,
        isMustSelect: true,
        align: '',
        //className: 'table_td_align_right',
        //amount: true // 是否转千分位
        //amountSix:true // 是否转十万分位
      },
      {
        id: 'xxfp',
        caption: '销项发票',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'xxsl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
            
          },
          {
            caption: "金额",
            fieldName: 'xxje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
          ]
      },
      {
        id: 'jxfp',
        caption: '进项发票',
        isVisible: true,
        isMustSelect: true,
        align: '',
        fieldName: 'jxfp',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'jxsl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
          },
         {
            caption: "金额",
            fieldName: 'jxje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
         ]
      },
      {
        id: 'balance',
        caption: '差额',
        isVisible: true,
        isMustSelect: true,
        align: '',
        fieldName: 'balance',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'cesl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
          },
          {
            caption: "金额",
            fieldName: 'ceje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
          ]
      }
    ],
    columnsOld: ['hwmc', 'ggxh', 'dw', 'xxfp', 'jxfp', 'balance'],
    pageId: '发票台账（一般纳税人）'
  },
  1: {
    columns: [
      {
        id: 'hwmc',
        caption: "商品名称",
        fieldName: 'hwmc',
        isFixed: true, // 是否要固定
        isVisible: true,  // 根据后台返回值判断是否显示
        width: 250,
        isMustSelect: true, // 是否必选
        align: ''
      }, {
        id: 'ggxh',
        caption: "规格型号",
        fieldName: 'ggxh',
        isFixed: true,
        isVisible: true,
        width: 80,
        isMustSelect: true,
        align: ''
      }, {
        id: 'dw',
        caption: "单位",
        fieldName: 'dw',
        isFixed: true,
        isVisible: true,
        width: 80,
        isMustSelect: false,
        align: '',
        //className: 'table_td_align_right',
        //amount: true // 是否转千分位
        //amountSix:true // 是否转十万分位
      },
      {
        id: 'xxfp',
        caption: '销项发票',
        fieldName: 'xxfp',
        isVisible: true,
        isMustSelect: true,
        align: '',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'xxsl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
          
          },
          {
            caption: "金额",
            fieldName: 'xxje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
        ]
      },
      {
        id: 'jxfp',
        caption: '进项发票',
        isVisible: true,
        isMustSelect: true,
        align: '',
        fieldName: 'jxfp',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'jxsl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
          },
          {
            caption: "金额",
            fieldName: 'jxje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
        ]
      },
      {
        id: 'balance',
        caption: '差额',
        isVisible: true,
        isMustSelect: true,
        align: '',
        fieldName: 'balance',
        width: 160,
        children: [
          {
            caption: "数量",
            fieldName: 'cesl',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            //className: 'table_td_align_right',
            amountSix:true
          },
          {
            caption: "金额",
            fieldName: 'ceje',
            isFixed: false,
            isVisible: true,
            isSubTitle: true,
            //width: 120,
            align: '',
            className: 'table_td_align_right',
            amount: true
          },
        ]
      }
    ],
    columnsOld: ['hwmc', 'ggxh', 'dw', 'xxfp', 'jxfp', 'balance'],
    pageId: '发票台账（一般纳税人）'
  },
}

