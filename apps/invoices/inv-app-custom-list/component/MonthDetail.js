import React from 'react'
import { Spin, Button } from "antd";
import { Table } from "edf-component";
import utils from "edf-utils";


class MonthDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            list: []
        }
        this.webapi = props.webapi
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onOk = async () => {

    }
    componentDidMount() {
        this.getData()
    }
    close() {
        this.props.closeModal()
    }
    async getData() {
        this.setState({ loading: true })
        const { row } = this.props
        console.log('row', row);
        let params = {
            qyId: row.qyId,
            skssq: row.skssq,
            cxlx: row.cxlx,
            nsqxdm: row.nsqxdm,
            type: row.type
        }
        let res = await this.webapi.invoice.querySingleAccountList(params)
        console.log('res', res);

        if (res) {
            this.setState({
                ...res,
                loading: false
            })
        }

    }
    render() {
        const { loading, list, fpzs, hjje, hjse } = this.state
        const { row } = this.props

        let colStyle ={
            overflow:'hidden',
            textOverflow:'ellipsis',
            whiteSpace:'nowrap'
        }
        let columns = []

        if (row.cxlx === 2) {
            columns.push({
                title: '序号',
                dataIndex: 'xh',
                key: 'xh',
                width: 62,
                align: 'center'
            }, {
                title: '发票月份',
                dataIndex: 'skssq',
                key: 'skssq',
                width: 90,
                align: 'center'
            }, {
                title: '份数',
                dataIndex: 'fs',
                key: 'fs',
                width: 90,
            }, {
                title: '销售额',
                dataIndex: 'je',
                width: 90,
                key: 'je',
                className: 'align-right',
                render:(text,record)=>(utils.number.format(text, 2))
            })
        } else {
            columns.push({
                title: '发票月份',
                dataIndex: 'skssq',
                key: 'skssq',
                width: 90,
                align: 'center'
            }, {
                title: '份数',
                dataIndex: 'fs',
                key: 'fs',
                width: 90,
            }, {
                title: '金额',
                dataIndex: 'je',
                width: 90,
                key: 'je',
                className: 'align-right',
                render:(text,record)=>(utils.number.format(text, 2))
            }, {
                title: '税额',
                dataIndex: 'se',
                width: 90,
                key: 'se',
                className: 'align-right',
                render:(text,record)=>(utils.number.format(text, 2))
            })
        }


        return (
            <Spin spinning={loading} size='large'>
                <div className='inv-app-custom-list-month-detail-12month'>
                    <Table
                        className="inv-app-custom-list-month-detail-table"
                        columns={columns}
                        dataSource={list}
                        bordered

                        pagination={false}
                        style={row.cxlx === 2 ? { height: '480px' } : { height: '150px' }}>
                    </Table>
                    {row.cxlx === 2 ? <div className='inv-app-custom-list-month-detail-12month-row-summary'>
                        <div style={{ width: '173px', textAlign: 'center' }}>
                            合计
                        </div>
                        <div style={{ width: '101px', textAlign: 'left',...colStyle }}>
                            {fpzs}
                        </div>
                        <div title={utils.number.format(hjje, 2)} style={{ width: '102px', textAlign: 'right', borderRight: '1px solid #d9d9d9' ,...colStyle}}>
                            {utils.number.format(hjje, 2)}
                        </div>
                    </div> : <div className='inv-app-custom-list-month-detail-12month-row-summary'>
                            <div style={{ width: '101px', textAlign: 'center' }}>
                                合计
                            </div>
                            <div style={{ width: '101px', textAlign: 'left' ,...colStyle}}>
                                {fpzs}
                            </div>
                            <div title={utils.number.format(hjje, 2)} style={{ width: '102px', textAlign: 'right' ,...colStyle}}>
                                {utils.number.format(hjje, 2)}
                            </div>
                            <div title={utils.number.format(hjse, 2)} style={{ width: '101px', textAlign: 'right', borderRight: '1px solid #d9d9d9',...colStyle }}>
                                {utils.number.format(hjse, 2)}
                            </div>
                        </div>}
                </div>
                <div className='inv-app-custom-list-month-detail-footer'>
                    <Button onClick={this.close.bind(this)} type='primary'>关闭</Button>
                </div>
            </Spin>

        )
    }
}
export default MonthDetail