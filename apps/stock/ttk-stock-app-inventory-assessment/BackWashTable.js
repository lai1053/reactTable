import React, {PureComponent, Fragment} from 'react'
import {Input, Icon} from 'edf-component'
import VirtualTable from '../../invoices/components/VirtualTable'


const BackWashColumn = [
    {
        title: "存货编号",
        dataIndex: "inventoryCode",
        key: "inventoryCode",
        width: 150,
        align: "left",
    },
    {
        title: "存货名称",
        dataIndex: "inventoryName",
        key: "inventoryName",
        width: 200,
        align: "left",
    },
    {
        title: "规格型号",
        dataIndex: "guiGe",
        key: "guiGe",
        width: 140,
        align: "left",
    },
    {
        title: "单位",
        dataIndex: "inventoryUnit",
        key: "inventoryUnit",
        width: 60,
        align: "center",
    },
    {
        title: "库存数量",
        dataIndex: "num",
        key: "num",
        width: 150,
        align: "right",
    },
    {
        title: "待冲回数量",
        dataIndex: "toBackNum",
        key: "toBackNum",
        width: 150,
        align: "right",
    },
    {
        title: "库存数量",
        dataIndex: "backNum",
        key: "backNum",
        width: 150,
        align: "right",
    },
]

export default class BackWashTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            list: [],
            scrollProps: {
                x:1000,
                y:350
            },
            sumData: {
                num: 0,
                toBackNum: 0,
                backNum: 0
            }
        }
    }

    componentDidMount() {
        this.setState({
            list: [...this.props.dataSource],
            sumData: this.getSumData(this.props.dataSource)
        })
    }

    onBlur = (e) => {
        const value = e.target.value
        const list = this.props.dataSource.filter((el) => {
            return el.inventoryCode.includes(value) || el.inventoryName.includes(value) 
        })
        this.setState({
            list,
            sumData: this.getSumData(list)
        })
    }

    getSumData = (list) => {
        let sumData = {
            num: 0,
            toBackNum: 0,
            backNum: 0
        }
        list.forEach(el => {
            sumData.num += +el.num
            sumData.toBackNum += +el.toBackNum
            sumData.backNum += +el.backNum
        })
        sumData.num = Number(sumData.num.toFixed(6))
        sumData.toBackNum = Number(sumData.toBackNum.toFixed(6))
        sumData.backNum = Number(sumData.backNum.toFixed(6))
        return sumData
    }

    renderSumRow = () => {
        let {num, toBackNum, backNum} = this.state.sumData
        let rows = (
            <div className='vt-summary row'>
                <div>合计</div>
                <div>{!!num && num}</div>
                <div>{!!toBackNum && toBackNum}</div>
                <div>{!!backNum && backNum}</div>
            </div>
        )
        return {
            height: 37,
            rows
        }
    }

    render() {
        const {list, scrollProps} = this.state
        return (
            <Fragment>
                <Input className='backwash-input' onBlur={this.onBlur} onPressEnter
                    prefix={<Icon type="search" />} placeholder='请输入存货编号或存货名称'
                />
                <VirtualTable className='ttk-stock-app-inventory-assessment-backwash-table'
                    dataSource={list} columns={BackWashColumn} scroll={{...scrollProps, x: 1000}} 
                    style={{width: scrollProps.x + 'px'}} width={scrollProps.x} 
                    summaryRows={this.renderSumRow()}
                />
            </Fragment>
        )
    }
}