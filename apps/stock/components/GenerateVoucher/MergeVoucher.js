import React from 'react'
import { Radio } from 'edf-component'


class MergeVoucher extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            selectedValue: props.defaultVal
        }
        props.setOkListener && props.setOkListener(this.onOk)
    }

    radioChange=(e)=>{
        this.setState({
            selectedValue: e.target.value
        })
    }

    onOk=()=>{
        return (this.state.selectedValue+'')
    }

    render(){
        const lineStyle = {
            'height': '32px',
            'line-height': '32px',
            'display': 'block'
        }
        const choices = this.props && this.props.radioChoices || []
        const { selectedValue } = this.state
        return(
            <div style={{padding: '20px 10px 30px'}}>
                <Radio.Group value={selectedValue} onChange={this.radioChange}>
                    {
                        choices.map(v=>
                            <Radio value={v.value} style={lineStyle}>{ v.text }</Radio>
                        )
                    }
                </Radio.Group>
            </div>
        )
    }
}

export default MergeVoucher