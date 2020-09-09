import React from 'react'
import { Radio } from 'edf-component'

class MergeSetupByRadio extends React.PureComponent {
    constructor(props){
        super(props)
        this.state = {
            value: props.defaultValue
        }
        this.props = props
        props.setOkListener(this.onOk)
    }

    async componentWillMount () {

    }

    onRadioChange = (e) => {
        this.setState({
            value: e.target.value
        })
    }

    onOk = async() => {
        this.props.onOk && this.props.onOk(this.state.value)
    }

    render () {
        let { firstText, secondText, firstValue, secondValue } = this.props.initData
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        }
        return (
            <div style={{padding: '20px 10px 30px'}}>
                <Radio.Group onChange={this.onRadioChange} value={this.state.value}>
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
}

export default MergeSetupByRadio