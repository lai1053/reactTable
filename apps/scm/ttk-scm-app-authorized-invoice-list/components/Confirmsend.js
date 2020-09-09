import React from 'react'
import { DatePicker, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//自动生成上级科目
class Confirmsend extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date: null,
            dateString: null,
            statistics: props.statistics,
            selectedArr: props.selectedArr,
            error: {
                date: ''
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }


    onOk = async () => {
        let { date, selectedArr } = this.state;

        // if (!date) {
        //     this.setState({
        //         error: {
        //             date: '请选择本次认证税款所属期'
        //         }
        //     })
        //     return false;
        // }
        let res = await this.props.webapi.send(selectedArr)
        if (res) {
            return 'true';
        } else {
            // this.props.toast('error', '发送认证通知失败！请重新发送认证！')
            return false;
        }

    }
    onChange = (date, dateString) => {
        this.setState({
            date: date,
            dateString: dateString,
            error: {
                date: ''
            }
        })
    }
    render() {
        const { error, date, statistics: { count, totalAmount, totalTax } } = this.state;
        return (
            <div style={{ height: 123, color: '#333333', fontSize: '12px' }}>
                {/* 172 */}
                <div style={{ marginLeft: 40, marginTop: 6, fontSize: 12 }}>确认发送认证后不能撤销，请确认是否发送认证？</div>
                <Form style={{ display: 'none' }}>
                    <Form.Item
                        label='本次认证税款所属期'
                        validateStatus={error && error.date ? 'error' : 'success'}
                        required={true}
                        help={error.date}
                        labelCol={{ span: 9 }}
                        wrapperCol={{ span: 15 }}
                    >
                        <DatePicker.MonthPicker onChange={this.onChange} value={date} />
                    </Form.Item>
                </Form>
                <div style={{ marginLeft: 40, fontSize: 12, marginTop: 16 }}>本次认证发票：</div>
                <div style={{ display: 'flex', marginLeft: 65, marginTop: 16 }}>
                    <div style={{ marginRight: 25, fontSize: 12 }}>份数：<span style={{ fontWeight: 800 }}>{count}</span> 份</div>
                    <div style={{ marginRight: 25, fontSize: 12 }}>金额：<span style={{ fontWeight: 800 }}>{totalAmount}</span> 元</div>
                    <div style={{ marginRight: 21, fontSize: 12 }}>税额：<span style={{ fontWeight: 800 }}>{totalTax}</span> 元</div>
                </div>
                <div style={{marginTop:16,color:'red',marginLeft:40}}>
                    注：本月认证，下月申报时才能抵扣，同扫描认证！
                </div>
            </div>
        )
    }
}

export default Confirmsend