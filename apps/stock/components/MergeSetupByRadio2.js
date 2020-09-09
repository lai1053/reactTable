import React from 'react'
import { Radio } from 'edf-component'
// 高阶组件
function HOC(WrappedComponent) {
    return class extends React.PureComponent {
        constructor(props) {
            super(props)
            this.state = {
                value: props.defaultValue,
            }
            this.props = props
            props.setOkListener(this.onOk)
            this.onRadioChange = this.onRadioChange.bind(this)
        }

        shouldComponentUpdate = (nextProps, nextState) => {
            return nextState.value !== this.state.value 
        }

        onOk = () => {
            this.props.onOk && this.props.onOk(this.state.value)
        }
        
        onRadioChange = (e) => {
            this.setState({
                value: e.target.value
            })
        }
        
        render() {
            const { value } = this.state
            return <WrappedComponent {...this.props.initData} value={value} onRadioChange={this.onRadioChange} />
        }
    }
}

// 使用
// @HOC
// class MergeSetupByRadio extends React.PureComponent {
//     constructor(props) {
//         super(props)
//         this.props = props        
//     }
//     render() {
//         console.log('this.props2', this.props)
//         const radioStyle = { display: 'block', height: '30px', lineHeight: '30px' }
//         // const { onRadioChange } = this.props
//         const { firstValue, secondValue, firstText, secondText, onRadioChange, value } = this.props
//         return (
//             <div style={{padding: '20px 10px 30px'}}>
//                 <Radio.Group onChange={onRadioChange} value={value}>
//                     <Radio style={radioStyle} value={firstValue}>
//                         {firstText}
//                     </Radio>
//                     <Radio style={radioStyle} value={secondValue}>
//                         {secondText}
//                     </Radio>
//                 </Radio.Group>
//             </div>
//         )
//     }
// }
// export default MergeSetupByRadio

function MergeSetupByRadio(props) {
    const radioStyle = { display: 'block', height: '30px', lineHeight: '30px' }
    const { firstValue, secondValue, firstText, secondText, onRadioChange, value } = props
    return (
        <div style={{padding: '20px 10px 30px'}}>
            <Radio.Group onChange={onRadioChange} value={value}>
                <Radio style={radioStyle} value={firstValue}>
                    {firstText}
                </Radio>
                <Radio style={radioStyle} value={secondValue}>
                    {secondText}
                </Radio>
            </Radio.Group>
        </div>
    )
}

export default HOC(MergeSetupByRadio)