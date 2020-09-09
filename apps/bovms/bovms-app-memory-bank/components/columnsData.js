import React from "react"
import {
    Tooltip, Icon
} from "edf-component"

export const baseKpxmColumns = [
    {
        dataIndex: "transTypeName",
        title: "业务类型",
        className: "inv-type",
        align: 'center',
        width: 80,
    },
    {
        dataIndex: "kpxm",
        title: "开票项目",
        flexGrow: 1,
        className: "inv-type",
        children: [
            {
                dataIndex: "goodsName",
                title: "商品或服务名称",
                flexGrow: 1
            },
            {
                dataIndex: "specification",
                title: "规格型号",
                width: 80,
            },
            {
                dataIndex: "unitName",
                title: "单位",
                width: 60,
                align: 'center'
            },
        ]
    }
]

export const baseLwdwColumns = [
    {
        width: 90,
        dataIndex: "transTypeName",
        title: "业务类型",
        className: "inv-type",
        align: 'center'
    },
    {
        width: 130,
        dataIndex: "custName",
        title: "往来单位名称",
        className: "inv-type",
        flexGrow: 1
    },

]



export const commonColumns = {
    1: [
        {
            dataIndex: "chda",
            title: "存货档案",
            children: [
                {
                    dataIndex: "inventoryCode",
                    title: "档案编号",
                    width: 120,
                    render: (text, record, index) => {

                        if (record.inventoryCodeState === 0 || record.inventoryCodeState === 1) {
                            return (<div>{text}&nbsp;<Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={`记忆的档案已被${record.inventoryCodeState === 0 ? '删除' : '停用'}`}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                            </Tooltip></div>)
                        }
                        return (<div>{text}</div>)
                    }
                },
                {
                    dataIndex: "inventoryType",
                    title: "存货类型",
                    width: 80,
                    align: 'center'
                },
                {
                    dataIndex: "inventoryName",
                    title: "存货名称",
                    width: 100,
                    render: (text, record, index) => {
                        return <div className='ellipsis' title={text}>{text}</div>
                    }
                }, {
                    dataIndex: "inventorySpecification",
                    title: "规格型号",
                    width: 80,
                },
                {
                    dataIndex: "inventoryUnitName",
                    title: "单位",
                    width: 60,
                    align: 'center'
                },


            ]
        }
    ],
    2: [
        {
            dataIndex: "chda",
            title: "存货、成本、费用科目",
            children: [
                {
                    dataIndex: "accountCode",
                    title: "科目编号",
                    width: 140,
                    render: (text, record, index) => {
                        if (record.accountCodeState === 0 || record.accountCodeState === 1) {
                            return (<div>{text}&nbsp;<Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={`记忆的科目已被${record.accountCodeState === 0 ? '删除' : '停用'}`}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    style={{ marginRight: "8px" }}
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                            </Tooltip></div>)
                        }
                        return (<div>{text}</div>)
                    }
                },
                {
                    dataIndex: "accountName",
                    title: "科目名称",
                    width: 120,
                    render: (text, record, index) => {
                        return <div className='ellipsis' title={text}>{text}</div>
                    }
                },
                {
                    dataIndex: "assistTypeName",
                    title: "辅助核算",
                    width: 120,
                    align: 'center'
                },
            ]
        }
    ],
    4: [
        {
            dataIndex: "chda",
            title: "收入科目",
            children: [
                {
                    dataIndex: "accountCode",
                    title: "科目编号",
                    width: 140,
                    render: (text, record, index) => {
                        if (record.accountCodeState === 0 || record.accountCodeState === 1) {
                            return (<div>{text}&nbsp;<Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={`记忆的科目已被${record.accountCodeState === 0 ? '删除' : '停用'}`}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    style={{ marginRight: "8px" }}
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                            </Tooltip></div>)
                        }
                        return (<div>{text}</div>)
                    }
                },
                {
                    dataIndex: "accountName",
                    title: "科目名称",
                    width: 120,
                    render: (text, record, index) => {
                        return <div className='ellipsis' title={text}>{text}</div>
                    }
                },
                {
                    dataIndex: "assistTypeName",
                    title: "辅助核算",
                    width: 120,
                    align: 'center'
                },
            ]
        }
    ],
    5: [
        {
            dataIndex: "chda",
            title: "结算科目",
            children: [
                {
                    dataIndex: "accountCode",
                    title: "科目编号",
                    width: 140,
                    render: (text, record, index) => {
                        if (record.accountCodeState === 0 || record.accountCodeState === 1) {
                            return (<div>{text}&nbsp;<Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={`记忆的科目已被${record.accountCodeState === 0 ? '删除' : '停用'}`}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    style={{ marginRight: "8px" }}
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                            </Tooltip></div>)
                        }
                        return (<div>{text}</div>)
                    }
                },
                {
                    dataIndex: "accountName",
                    title: "科目名称",
                    width: 120,
                    render: (text, record, index) => {
                        return <div className='ellipsis' title={text}>{text}</div>
                    }
                },
                {
                    dataIndex: "assistTypeName",
                    title: "辅助核算",
                    width: 120,
                },
            ]
        }
    ],
    6: [
        {
            dataIndex: "chda",
            title: "辅助核算",
            children: [
                {
                    dataIndex: "assistTypeName",
                    title: "类别",
                    width: 120,
                },
                {
                    dataIndex: "assistItemCode",
                    title: "项目编码",
                    width: 140,
                    render: (text, record, index) => {
                        if (record.assistItemCodeState === 0 || record.assistItemCodeState === 1) {
                            return (<div>{text}&nbsp;<Tooltip
                                arrowPointAtCenter={true}
                                placement="bottomLeft"
                                title={`记忆的项目已被${record.assistItemCodeState === 0 ? '删除' : '停用'}`}
                                overlayClassName="inv-tool-tip-warning">
                                <Icon
                                    style={{ marginRight: "8px" }}
                                    type="exclamation-circle"
                                    className="inv-custom-warning-text warning-icon"
                                />
                            </Tooltip></div>)
                        }
                        return (<div>{text}</div>)
                    }
                },
                {
                    dataIndex: "assistItemName",
                    title: "项目名称",
                    width: 120,
                    render: (text, record, index) => {
                        return <div className='ellipsis' title={text}>{text}</div>
                    }
                },
            ]
        }
    ],
}


