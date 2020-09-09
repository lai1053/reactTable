import React from 'react'
import {message, Input, Spin} from 'antd'
export default class SetLimit extends React.Component{
    constructor (props) {
        super(props)
        this.state = {
            inputVal: this.props.ratio,
            loading: false
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    onOk = async () => {
        this.setState({
            loading: true
        })
        const inputVal = this.state.inputVal
        if (!inputVal) {
            this.setState({
                isEmpty: true,
            })
            this.setState({
                loading: false
            })
           message.warning('上限预警值不能为空')
            return false

        } else {
            this.setState({
                isEmpty: false
            })
            let res = await this.props.webapi.invoice.saveUpperLimitRatio({
                ratio: this.state.inputVal
            })
            if (!res) {
                return false
            }else {
                return res
            }
        }
    }
    handleInputChange = (e) => {
        const reg =  /^(?:[1-9][0-9]?|100)$/
        if (!e.target.value || reg.test(e.target.value)) {
            this.setState({
                inputVal: e.target.value
            })
        }
    }
    render () {
        return (
            <Spin spinning={this.state.loading} size='large'>
                <div className='content'>
                    <div>
                        <p>
                            <label>小规模上限标准：</label> <span style={{fontWeight: 'bold'}}>500万</span>
                        </p>
                        <div className="input-content">
                            <div>
                                <span style={{paddingRight: '5px'}}>达到上限</span>
                                <Input value={this.state.inputVal} onChange={this.handleInputChange}/>
                                <span style={{paddingLeft: '5px'}}>%进行提醒</span>
                            </div>
                            {
                                this.state.isEmpty ? <div className='warning-text'>
                                    上限预警值不能为空。
                                </div> : null
                            }

                        </div>
                        <p>
                            <span className='tips-color'>温馨提示：</span>
                            <span className='tip-text'>同时经营“货物和劳务”及“应税服务”，销售额合并计算。</span></p>
                    </div>
                </div>
            </Spin>)
    }
}