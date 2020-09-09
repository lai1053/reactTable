import React from 'react'
import { Input, DatePicker, Button } from 'edf-component'
import moment, { months } from 'moment'
import { message } from 'antd'
import utils from 'edf-utils'
const MonthPicker = DatePicker.MonthPicker
const InputNumber = Input.Number

class ExchangeGainOrLoss extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            period: props.period,
            currencyList: [],
            disabledDate: props.disabledDate,
            isAccountedMonth: props.isAccountedMonth,
            comparePeriod: props.comparePeriod
        }
    }

    componentWillMount = async () => {
        const res = await this.props.initQuery()
        if (res) {
            this.setState({
                currencyList: this.format(res)
            })
        }
    }

    cancel = () => {
        this.props.closeModal()
    }

    confirm = async () => {
        let { currencyList, period } = this.state
        let pramas = {
            dtos: currencyList,
            year: Number(period.split('-')[0]),
            period: Number(period.split('-')[1])
        }
        let isHave = null
        currencyList.find(obj => {
            if (obj.exchangeRate < 0) {
                isHave = true
                return true
            }
        })

        if (isHave) {
            message.error('汇率不能小于零')
            return
        }

        this.props.closeModal()
        this.props.confirm(pramas)
    }
    format = (currencyList) => {
        currencyList = currencyList.map(item => {
            item.exchangeRate = utils.number.format(item.exchangeRate, 6)
            return item
        })
        return currencyList
    }
    handleChange = (e) => {
        this.setState({
            // period: e
            period: moment(e).format('YYYY-MM')
        })
    }

    handleDisabledDate = (current) => {
        let { disabledDate, comparePeriod } = this.state,
            currentDate = current.format('YYYY-MM')
        disabledDate = disabledDate.replace(/-/g, '')
        currentDate = currentDate.replace(/-/g, '')
        comparePeriod = comparePeriod.replace(/-/g, '')

        return currentDate && (currentDate < disabledDate || currentDate < comparePeriod)
    }

    handleBlur = (value, index) => {
        if (value > 9999999999.99) {
            message.warning('汇率不能超过9999999999.99')
            return
        }
        let { currencyList } = this.state
        currencyList[index].exchangeRate = utils.number.format(value, 6)
        this.setState({
            currencyList: currencyList
        })
    }
    render() {
        let { period, currencyList, isAccountedMonth } = this.state
        return (
            <div>
                <div className='tips'>注：期末集中结转汇兑损益方法</div>
                <div style={{ display: 'flex', flexDirection: 'row' }} >
                    <ul>
                        <li>
                            <span className='spanLable'>期间</span>
                            <MonthPicker
                                disabled={true}
                                defaultValue={moment(period, 'YYYY-MM')}
                                disabledDate={this.handleDisabledDate}
                                onChange={this.handleChange}></MonthPicker>
                        </li>
                        {
                            currencyList.map((item, index) => {
                                return <li key={index}>
                                    <span className='spanLable'>{item.currencyName}</span>
                                    <InputNumber
                                        value={item.exchangeRate ? item.exchangeRate : ''}
                                        onBlur={(v) => this.handleBlur(v, index)}
                                        disabled={isAccountedMonth}
                                        min="0"
                                        max='9999999999.99'>
                                    </InputNumber>
                                </li>
                            })
                        }
                    </ul>
                    <div style={{ width: "40%", display: 'flex', justifyContent:'center' }} >
                        <div style={{ borderRight: '1px solid #e8e8e8' }} />
                        <div style={{ display: 'flex', alignItems: 'center',marginLeft:'20px' }}>
                            <Button
                                className='rightbtns'
                                style={{ marginBottom: '10px' }}
                                disabled={isAccountedMonth}
                                onClick={(e) => this.props.accountSetClick(e)}
                            >
                                科目设置
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="btnContainer">
                    <Button onClick={this.cancel} style={{ fontSize: '12px', padding: '0px 15px' }}>取消</Button>
                    <Button style={{ marginLeft: '8px', fontSize: '12px', padding: '0px 15px' }} type='primary' onClick={this.confirm}>调汇</Button>
                </div>
            </div >
        )
    }
}

export default ExchangeGainOrLoss