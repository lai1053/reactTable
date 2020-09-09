import React from 'react'
import { Button, Popover } from "antd"
import { Table } from 'edf-component'
import { number } from 'edf-utils'

class StepTwo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            billTotalNum: props.billTotalNum,
            collectTotalAmount: props.collectTotalAmount,
            payTotalAmount: props.payTotalAmount,
            flowfundList: props.flowfundList,
            loading: false
        }
    }

    componentDidMount() {

    }

    getColums() {
        return [
            {
                title: '交易日期',
                width: 120,
                dataIndex: 'billDate',
                align: 'left',
            }, {
                title: '对方户名',
                width: 120,
                dataIndex: 'counterpartyName',
                align: 'left',
            }, {
                title: '对方账号',
                width: 120,
                dataIndex: 'counterpartyAcct',
                align: 'left',
            }, {
                title: '交易摘要',
                dataIndex: 'summary',
                align: 'left',
            },
            {
                title: '收款金额',
                width: 120,
                dataIndex: 'collectAmount',
                align: 'right',
                render: (text, record) => (record.flowfundType === 1 && this.quantityFormat(record.amount, 2, false, false))
            }, {
                title: '付款金额',
                width: 120,
                dataIndex: 'paymentAmount',
                align: 'right',
                render: (text, record) => (record.flowfundType === 2 && this.quantityFormat(record.amount, 2, false, false))
            }
        ]
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true) return v
        let val = number.format(v, decimals);
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === 'string') {
            let [a, b] = val.split('.');
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val;
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero, autoDecimals) => {
        if (quantity !== undefined) {
            if (autoDecimals && quantity) {
                let [a, b] = String(quantity).split('.');
                decimals = Math.max(decimals, b !== undefined && b.length || 0)
            }
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }
    // 合计
    renderFooterAmount = () => {
        let { billTotalNum, collectTotalAmount, payTotalAmount } = this.state
        let content = <span className="footer-amount-item-span">
            <span className="count-item">合计 &nbsp;&nbsp;</span>
            <span className="count-item">
                <span className="bold-text inv-number">
                    交易流水：<strong>{billTotalNum}</strong>
                </span>条  &nbsp;&nbsp;</span>
            <span className="count-item">
                <span className="bold-text inv-number">
                    收款：<strong>{collectTotalAmount.toFixed(2)}</strong>
                </span>(元) &nbsp;&nbsp;</span>
            <span className="count-item">付款：<strong>{payTotalAmount.toFixed(2)}</strong>
                <span>(元) &nbsp;&nbsp;</span>
            </span>
        </span >
        return <Popover content={
            <div className="footer-amount">
                {content}
            </div>} overlayClassName="inv-tool-tip-normal tool-tip-footer-amount">
            <div className="footer-amount  ellipsis-text">
                {content}
            </div>
        </Popover>
    }
    async handleImport() {
        const { flowfundList } = this.state
        this.setState({
            loading: true
        })
        this.props.onImport(flowfundList)
    }

    render() {
        const { flowfundList } = this.state
        return (
            <div className='bovms-app-guidePage-range-step-one'>
                <div className='bovms-app-guidePage-popup-content' style={{ margin: '16px 0' }}>
                    <Table

                        style={{ height: '350px' }}
                        className='bovms-common-table-style'
                        columns={this.getColums()}
                        dataSource={flowfundList}
                        bordered="true"
                        scroll={{ y: 312 }}
                        pagination={
                            false
                        }
                    />
                    <div className='bovms-common-table-style-footer'>
                        <span>{this.renderFooterAmount()}</span>
                    </div>
                </div>
                <div className='bovms-app-actions-footer'>
                    <div></div>
                    <div>
                        <Button onClick={this.props.onPrev}> 上一步</Button>
                        <Button type="primary" loading={this.state.loading} onClick={this.handleImport.bind(this)}>导入</Button>
                        <Button onClick={() => { this.props.onCancel() }}>取消</Button>
                    </div>

                </div>
            </div>
        )
    }
}

export default StepTwo 