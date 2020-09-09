import React from 'react'
import { DatePicker, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'
import moment from 'moment';

//选择日期
class ChooseDateComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.defaultVale,
            error: {
                date: ''
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)

        }
    }

    onOk = async () => {
        let { value } = this.state;
        if (!value.date) {
            this.setState({
                error: {
                    date: '请选择日期'
                }
            })
            return false;
        }
        let res = await this.props.webapi.expenseList.importFromPsb({
            yf: moment(value.date).format('YYYYMM')
        })
        if (res || res === '') {


            return 'true';



        } else {
            // this.props.toast('error', '发送认证通知失败！请重新发送认证！')
            return false;
        }

    }
    handleChangeDate = (date, dateString) => {
        this.setState({
            value: {
                date: date,
                dateString: dateString,
            },
            error: {
                date: ''
            }
        })
    }
    render() {
        const { error, value } = this.state;
        return (
            <div style={{ height: 55, color: '#333333', fontSize: '12px' }}>
                {/* 172 */}
                {/* <div style={{ marginLeft: 40, marginTop: 6, fontSize: 12 }}>确认发送认证后不能撤销，请确认是否发送认证？</div> */}
                <Form>
                    <Form.Item
                        label='日期'
                        validateStatus={error && error.date ? 'error' : 'success'}
                        required={true}
                        help={error.date}
                        labelCol={{ span: 9 }}
                        wrapperCol={{ span: 15 }}
                    >
                        <DatePicker.MonthPicker onChange={this.handleChangeDate} value={value.date} />
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

export default ChooseDateComponent