import React from "react"
import { Table } from 'edf-component'
import { Spin } from 'antd'
import utils from 'edf-utils'
import { stockLoading } from '../commonAssets/js/common'

class CompletionOfWarehousingLook extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            list: [], // 表格数据
            code: '',  // 单据编码
            period: '',  // 生成日期
            loading: false // 表格loading
        }
        this.webapi = props.webapi || {}
    }

    componentWillMount () {
        this.load()
    }
    /**
     * @description: 初始化数据
     */
    load = async() => {
        this.setState({ loading: true })
        let mainList = []
        const { period, inventoryId } = this.props, 
        res = await this.webapi.getWipCompleteBillList({period: period || '', inventoryId: inventoryId || ''})   // 存货列表
        if (res) {
            if (res.billBodyDtoList.length !== 0) {
                mainList = res.billBodyDtoList.map((item, index) => {
                    item.idx = index + 1
                    item.num = item.num && item.num || ''//utils.number.format(item.num, 2) || ''  // 数量
                    item.ybbalance = item.ybbalance && utils.number.format(item.ybbalance, 2) || ''  // 金额
                    return item
                })
            }
        }
        this.setState({
            loading: false,
            list: mainList,
            code: res.code,
            period: res.period,
        })
    }
    /**
     * @description: 定义表格columns数组
     * @return: {array} columns数组
     */
    getColumns() {
        const { endCostType } = this.props
        let columns = [
            {
                title: "序号",
                dataIndex: "idx",
                width: 50,
                align: "center"
            },
            {
                title: "存货编号",
                dataIndex: "inventoryCode",
                width: 100,
                align: "left"
            },
            {
                title: "存货名称",
                dataIndex: "inventoryName",
                width: 200,
                align: "left"
            },
            {
                title: "规格型号",
                dataIndex: "inventoryGuiGe",
                width: 100,
                align: "left"
            },
            {
                title: "单位",
                dataIndex: "inventoryUnit",
                width: 85,
                align: "left"
            }
        ]
        if (endCostType === 0) {
            columns.push(
                {
                    title: "生产数量",
                    dataIndex: "num",
                    width: 100,
                    align: "right"
                },
                {
                    title: "生产成本金额",
                    dataIndex: "ybbalance",
                    width: 150,
                    align: "right"
                }
            )
        } else {
            columns.push(
                {
                    title: "入库数",
                    dataIndex: "num",
                    width: 100,
                    align: "right"
                },
                {
                    title: "材料分配系数",
                    dataIndex: "matDisCof",
                    width: 150,
                    align: "right"
                }
            )
        }
        return columns
    }
    /**
     * @description: 表格渲染
     * @return: {JSX} 返回本组件UI
     */
    render() {
        const { list, code, period, loading } = this.state

        return (
            <div className="completion-of-warehousing-look">
                <div className="completion-of-warehousing-look-title">
                    完工入库单
                </div>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                    <div className="completion-of-warehousing-look-code">
                        单据号：{code}
                    </div>
                    <div className="completion-of-warehousing-look-period">
                        入库日期：{period}
                    </div>
                </div>
                 
                <div style={{height: '283px'}}> 
                    {
                        loading && <Spin
                            // tip='加载中...'
                            delay={500}
                            spinning={true}
                            style={{
                                display: 'flex', 
                                position: 'absolute', 
                                top: "0", 
                                left: "0", 
                                bottom:"0", 
                                right: "0",
                                zIndex: 10, 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: 'rgba(0,0,0,0.05)'
                            }}
                            wrapperClassName='spin-box add-stock-orders purchase-ru-ku-add-alert'
                        />
                    }
                    <Table
                        columns={this.getColumns()}
                        dataSource={list}
                        bordered={true}
                        showHeader={true}
                        pagination={false}
                        scroll={{y: 245}}
                        footer={null}
                    /> 
                </div>
            </div>
        )
    }
}

export default CompletionOfWarehousingLook
