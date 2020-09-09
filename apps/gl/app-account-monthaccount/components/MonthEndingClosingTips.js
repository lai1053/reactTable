import React from 'react'
import { Input, Button, Icon } from 'edf-component'

class ExchangeGainOrLoss extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
      collapseDisplay: false,
      collapseKey: ''
    }
  }

  cancel = () => {
    this.props.closeModal()
  }

  collapseTips = (key, index) => {
    let { collapseKey } = this.state
    this.setState({
      collapseKey: this.state.collapseKey == key ? '' : key
    })
  }
  getItemIcon = (content) => {
    let redItem,
      yellowItem,
      greenItem
    if(content){
      redItem = content.checkListMsg.find(item => item.isWarning == false)
      if(redItem){
        return {
          className: 'redIcon',
          type: 'jinggao'
        }
      }else{
        yellowItem = content.checkListMsg.find(item => item.isWarning == true)
        if(yellowItem){
          return {
            className: 'yellowIcon',
            type: 'jinggao'
          }
        }else{
          return {
            className: 'greenIcon',
            type: 'chenggongtishi'
          }
        }
      }
    }
  }
  render() {
    let { data, collapseKey } = this.state
    let { currentYear, currentMonth, monthlyClosingYear, monthlyClosingMonth, warningFlag } = this.props
    let warningItem = data.find(item => item.content == '固定资产异常' || '无形资产异常')
    return (
      <div >
        <div className='tip-title' style={{ display: warningFlag == true ? 'none' : 'flex' }}>
          <Icon type='chenggongtishi' fontFamily='edficon' />
          {currentYear == monthlyClosingYear && currentMonth == monthlyClosingMonth ?
            <div>{currentYear}年{currentMonth}月结账成功</div> :
            <div>{currentYear}年{currentMonth}月-{monthlyClosingYear}年{monthlyClosingMonth}月结账成功</div>
          }
        </div>
        <div style={{ padding: '12px' }}>
          {
            data.map((item, index) => {
              let iconClass = this.getItemIcon(item).className
              let icontype = this.getItemIcon(item).type
              return (
                <div key={item.key}>
                  <div className='month-header'>
                    <div className='month-header-title'>{item.title}</div>
                    <div className='month-header-line'><div className='top-line'></div></div>
                    <div className='month-header-icon'><Icon className={iconClass} type={icontype} fontFamily='edficon'/></div>
                    <div className='month-header-action' onClick={() => this.collapseTips(item.key, index)}><Icon type={collapseKey == item.key && item.checkListMsg.length > 0 ? 'up' : 'down'} className={item.checkListMsg.length > 0 ? 'hasData-icon' : 'noData-icon'}></Icon></div>
                  </div>
                  <div className='month-body' style={{ display: `${collapseKey == item.key ? 'block' : 'none'}` }}>
                    {
                      item.checkListMsg && item.checkListMsg.map((option, i) => {
                        return (
                          <div className='item-content'>
                            {warningItem && (option && (option.content.slice(0, 4) == '1601') || option && (option.content.slice(0, 4) == '1701')) ? null :<Icon fontFamily='edficon' type='jinggao' style={{color:option.isWarning==false?'#e94033':'#fa954c'}}></Icon>}
                            <div style={{ paddingLeft: warningItem && (option && (option.content.slice(0, 4) == '1601') || option && (option.content.slice(0, 4) == '1701')) ? '15px' : '0px' }}>{option.content}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className="btnContainer">
          <Button onClick={this.cancel} style={{ fontSize: '12px', padding: '0px 15px' }} type='primary'>关闭</Button>
          {/* <Button style={{ marginLeft: '8px', fontSize: '12px', padding: '0px 15px' }} type='primary' onClick={this.confirm}>调汇</Button> */}
        </div>
      </div>
    )
  }
}

export default ExchangeGainOrLoss