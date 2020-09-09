import React, { PureComponent } from 'react';

var replacement = [
  {
    reg: /\*/g,
    dest: '×'
  }, {
    reg: /\//g,
    dest: '÷'
  }
];


export default class ResultPanel extends PureComponent {
  constructor() {
    super();
  }
  render() {
    var exp = this.props.exp || 0;
    var cur,
      last;
    replacement.forEach((item) => {
      exp.cur = exp.cur.replace(item.reg, item.dest);
      exp.last = exp.last.replace(item.reg, item.dest);
    });
    return (
      <div className="result-panel">
        <div className="last-row">{exp.last}</div>
        <div className="cur-row">{exp.cur}</div>
      </div>
    );
  }
}
