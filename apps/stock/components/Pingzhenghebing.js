import React from 'react'
import { Radio } from 'edf-component'

class Pingzhenghebing extends React.PureComponent {
    constructor(props){
        super(props)
        this.state = {
            value: ''
        }
        this.props = props
        this.webapi = props.webapi || {}
        this.module = props.module || ''
        this.metaAction = props.metaAction || {}
        props.setOkListener(this.onOk)
    }

    async componentWillMount () {
        const res = await this.webapi.operation.getVoucherRule({module: this.module})
        this.setState({value: res.stockRule.merge})
    }

    onRadioChange = (e) => {
        this.setState({
            value: e.target.value
        })
    }

    onOk = async() => {
        let obj = {
            module: this.module,    // 模块名
            stockRule: {     // 单据合并生成凭证规则
                merge: this.state.value  // 1代表选中单据合并成一张,0代表一张单据一张凭证
            }
        }
        const res = await this.webapi.operation.updateVoucherRuleByModule(obj)
        if (res === null) {
            return this.metaAction.toast('success', '设置成功')
        } else {
            return this.metaAction.toast('error', '设置失败')
        }
    }

    render () {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        }
        return (
            <div style={{padding:'20px 10px 30px'}}>
                <Radio.Group onChange={this.onRadioChange} value={this.state.value}>
                    <Radio style={radioStyle} value={'1'}>
                        选中单据合并一张凭证
                    </Radio>
                    <Radio style={radioStyle} value={'0'}>
                        一张单据一张凭证
                    </Radio>
                </Radio.Group>
            </div>
        )
    }
}

export default Pingzhenghebing