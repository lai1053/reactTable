/*

// 传参
handleChange, // 函数，接收结果，数组
disabledDate, // 禁用期间
periodRange, // 数组，初始值

*/

import React, {PureComponent} from 'react'
import moment from 'moment'
import { DatePicker } from 'antd';
const {MonthPicker} = DatePicker

import {debounce} from './js/util'

export default class MonthRangePicker extends PureComponent {
  state = {
    startValue: null,
    endValue: null,
  };

  componentDidMount() {
    const {periodRange} = this.props
    if(periodRange && periodRange[0] && periodRange[1]) {
        this.setState({
            startValue: moment(periodRange[0]),
            endValue: moment(periodRange[1])
        })
    } else if(periodRange && !periodRange.length) {
        this.setState({
            startValue: null,
            endValue: null
        })
    }
  }

  componentWillReceiveProps(nextProps) {
    const {startValue, endValue} = this.state
    const nextStartValue = nextProps.periodRange && nextProps.periodRange[0]
    const nextEndValue = nextProps.periodRange && nextProps.periodRange[1]
    if(nextStartValue && nextEndValue && (startValue !== nextStartValue || endValue !== nextEndValue)) {
      this.setState({
        startValue: moment(nextProps.periodRange[0]),
        endValue: moment(nextProps.periodRange[1])
      })
    }
  }

  disabledStartDate = startValue => {
    const { endValue } = this.state;
    const { disabledDate } = this.props
    if(!disabledDate) {
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    } else {
        const date = (moment(disabledDate)).valueOf()
        return startValue.valueOf() < date
    }
  };

  disabledEndDate = endValue => {
    const { startValue } = this.state;
    const { disabledDate } = this.props
    if(!disabledDate) {
        if (!endValue || !startValue) {
            return false;
          }
          return endValue.valueOf() < startValue.valueOf();
    } else {
        const date = (moment(disabledDate)).valueOf()
        if(!startValue) {
            return endValue.valueOf() < date
        } else {
            return endValue.valueOf() < date
            const lastMonth = moment(startValue).add(1, 'y').startOf('year')
            return startValue.valueOf() > endValue.valueOf() || endValue >= lastMonth.valueOf()
        }
    }
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    }, () => {
        const { startValue, endValue } = this.state;
        if(startValue && endValue) {
            this.onSubmit([startValue, endValue])
        }
    });
  };

  onSubmit = debounce(([startValue, endValue]) => {
    this.props.handleChange && this.props.handleChange([startValue.format('YYYY-MM'), endValue.format('YYYY-MM')])
  }, 300, true)

  onStartChange = value => {
    const { startValue, endValue } = this.state;
    if(startValue && startValue.valueOf() === value.valueOf()) {return}
    this.onChange('startValue', value);
    if(value.valueOf() > endValue.valueOf() || !value.isSame(endValue, 'year')) {
      this.onChange('endValue', value);
    }
  };

  onEndChange = value => {
    const { startValue, endValue } = this.state;
    if(endValue && endValue.valueOf() === value.valueOf()) {return}
    this.onChange('endValue', value);
    if(value.valueOf() < startValue.valueOf() || !value.isSame(startValue ,'year')) {
      this.onChange('startValue', value);
    }
  };

  render() {
    const { startValue, endValue } = this.state;
    const {style, className} = this.props
    return (
      <div className={'ttk-bovms-app-common-statements-month-range-picker' + ' ' + className} style={style}>
        <MonthPicker
          className='single-picker'
          disabledDate={this.disabledStartDate}
          format="YYYY-MM"
          value={startValue}
          onChange={this.onStartChange}
        />
        <span> - </span>
        <MonthPicker
          className='single-picker'
          disabledDate={this.disabledEndDate}
          format="YYYY-MM"
          value={endValue}
          onChange={this.onEndChange}
          disabled={!startValue}
        />
      </div>
    );
  }
}