import React from 'react'

import { Radio } from 'antd'

class MatchOptions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.defaultValue || 1
        }
        if (props.setOkListener) {
            props.setOkListener(:: this.ok);
        }
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
    }
    ok() {
        return this.state.value
    }
    componentDidMount() {

    }
    onChange(e) {
        this.setState({
            value: e.target.value
        })
    }
    render() {
        const { value } = this.state
        const { defaultValue } = this.props
        const radioStyle = {
            display: 'block',
            height: '40px',
            lineHeight: '40px',
        };
        return (
            <div className="bovms-app-match-options" style={{ padding: '16px 24px' }}>
                <Radio.Group onChange={this.onChange.bind(this)} value={value}>
                    {defaultValue != 2 && <Radio style={radioStyle} value={1}>匹配已选择数据</Radio>}
                    <Radio style={radioStyle} value={2}>匹配全部数据</Radio>
                    <Radio style={radioStyle} value={3}>匹配全部数据，已【手工匹配】的除外</Radio>
                </Radio.Group>
                <p style={{ marginTop: '16px', color: '#fa954c' }}><span>温馨提示：</span>请选择匹配的范围</p>
            </div >
        );
    }
}

export default MatchOptions;