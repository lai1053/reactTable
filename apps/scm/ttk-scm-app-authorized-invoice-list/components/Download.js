import React from 'react'
import { DatePicker, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'

//下载认证结果
class Download extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            date: null,
            dateString: null,
            error: {
                date: ''
            }
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async () => {
        let date = this.state.date;
        if (!date) {
            this.setState({
                error: {
                    date: '请选择认证月份'
                }
            })
            return false;
        }
        let res = await this.props.webapi.downloadPdf4Rz({
            "sssqQ": date.format('YYYY-MM-DD'),
            "sssqZ": date.format('YYYY-MM-DD')
        })
        if (res) {
            return { url: res };
        } else {
            return false
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
        const { error, date } = this.state;
        return (
            <div style={{ height: 65 }}>
                <Form>
                    <Form.Item
                        label='认证月份'
                        validateStatus={error && error.date ? 'error' : 'success'}
                        required={true}
                        help={error.date}
                        labelCol={{ span: 9 }}
                        wrapperCol={{ span: 15 }}
                    >
                        <DatePicker.MonthPicker onChange={this.onChange} value={date} />
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

export default Download