import React from 'react'
import { Checkbox } from 'edf-component'

class NegativeStockReminder extends React.PureComponent{
    constructor(props){
        super(props)
        this.state = {
            checked: true
        }
        this.props = props
        this.webapi = props.webapi || {}
        this.module = props.module || ''
        this.metaAction = props.metaAction || {}
        props.setOkListener(this.onOk)
    }

    async componentWillMount () {
        // const res = await this.webapi.operation.getVoucherRule({module: this.module})
        // this.setState({value: res.stockRule.merge})
    }

    onCheckboxChange = (e) => {
        // console.log("e.target.checked", e.target.checked)
        this.setState({
            checked: e.target.checked
        })
    }

    onOk = async() => {
        // let obj = {
        //     module: this.module,    // 模块名
        //     stockRule: {     // 单据合并生成凭证规则
        //         merge: this.state.value  // 1代表选中单据合并成一张,0代表一张单据一张凭证
        //     }
        // }
        // const res = await this.webapi.operation.updateVoucherRuleByModule(obj)
        // if (res === null) {
        //     return this.metaAction.toast('success', '设置成功')
        // } else {
        //     return this.metaAction.toast('error', '设置失败')
        // }
    }

    render () {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        }
        return (
            <div style={{padding:'10px 15px 20px'}}>
                <div>
                    <Checkbox onChange={this.onCheckboxChange} checked={this.state.checked}></Checkbox>
                    <span>启用负库存提醒</span>
                </div>
                <div style={{padding: '15px 0 10px'}}>
                    说明:
                </div>
                <div>
                    1、当前会计期间，销售出库单未生成凭证，有负库存，会弹出提醒
                </div>
                <div>
                    2、负库存范围：当前会计期间，数量＜0所有存货
                </div>
            </div>
        )
    }
}

export default NegativeStockReminder