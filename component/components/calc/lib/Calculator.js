import React, { PureComponent } from 'react';
import ResultPanel from './ResultPanel';
import ButtonPanel from './ButtonPanel';
import { Button } from 'antd'
import { math } from 'edf-utils'
export default class Calculator extends PureComponent {
  constructor() {
    super();
    this.state = {
      last: '',
      cur: '0'
    };
    this.onButtonClick = this.onButtonClick.bind(this);
  }
  onButtonClick(type) {
    var cur;
    var lastLetter;
    switch (type) {
      case 'c':
        this.setState({
          last: '',
          cur: '0'
        });
        break;
      case 'back':
        this.setState({
          cur: this.state.cur === '0' ? this.state.cur : this.state.cur.slice(0, -1) || '0'
        });
        break;
      case '=':
        try {
          this.setState({
            last: this.state.cur + '=',
            cur: this.mathRound(eval(this.state.cur), 2) + ''
          });
        } catch (e) {
          this.setState({
            last: this.state.cur + '=',
            cur: 'NaN'
          });
        }
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        cur = this.state.cur;
        lastLetter = cur.slice(-1);
        if (lastLetter === '+' || lastLetter === '-' || lastLetter === '*' || lastLetter === '/')
          this.setState({
            cur: cur.slice(0, -1) + type
          });
        else
          this.setState({
            cur: this.state.cur + type
          });
        break;
      case '.':
        cur = this.state.cur;
        lastLetter = cur.slice(-1);
        if (lastLetter !== '.') {
          this.setState({
            cur: this.state.cur + type
          });
        }
        break;
      default:
        this.setState({
          cur: this.state.cur === '0' ? type : this.state.cur + type
        });
        break;
    }
  }
  mathRound = (num, digit = 2) => {
    return math(math(num, 4), digit)
  }
  confirm = () => {
    this.props.closeModal()
    if (!this.state.last) {
      try {
        this.state.cur = this.mathRound(eval(this.state.cur), 2) + ''
      } catch (e) {
        this.state.cur = 0
      }
    }
    this.props.callBack(this.state.cur ? this.state.cur : 0)
  }
  cancel = () => {
    this.props.closeModal()
  }

  render() {
    var exp = {
      cur: this.state.cur,
      last: this.state.last
    };
    return (
      <div className="react-calculator">
        <ResultPanel exp={exp} />
        <ButtonPanel onClick={this.onButtonClick} confirm={this.confirm} />
        <div style={{ width: '100%', textAlign: 'right', paddingTop: '12px', paddingRight: '12px', paddingBottom: '12px', borderTop: '1px solid #ddd' }}>
          <Button className='button' style={{ marginRight: '8px', fontSize: '13px', padding: '0px 15px' }} type='primary' onClick={this.confirm}>确定</Button>
          {/* <Button onClick={this.cancel} style={{fontSize: '13px',padding:'0px 15px'}}>取消</Button> */}
        </div>
      </div>
    );
  }
}
