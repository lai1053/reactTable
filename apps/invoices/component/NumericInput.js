import React from 'react';
import { Input, Tooltip } from 'antd';



export default class NumericInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };
    }
    onChange = (value) => {
        // console.log('onChange:', value)
        // const value = e.target.value;
        const { onChange } = this.props;
        const myReg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        if ((!Number.isNaN(value) && myReg.test(value)) || value === '' || value === '-') {
            this.setState({ value })
            onChange(value);
        }
    }

    // '.' at the end or only '-' in the input box.
    onBlur = () => {
        let { onBlur, onChange, notZero } = this.props;
        let value = this.setState.value;
        if (notZero && Number(value) === 0) {
            value = undefined;
        } else if (value && value.charAt(value.length - 1) === '.' || value === '-') {
            value = value.slice(0, -1);
        }
        onChange(value)
        if (onBlur) {
            onBlur();
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value })
        }
    }
    render() {
        return (
            <Input
                {...this.props}
                value={this.state.value}
                onChange={e=>this.onChange(e.target.value)}
                // onBlur={this.onBlur}
            />
        )
    }
}