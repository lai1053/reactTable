import React from 'react'

class OperateIframe extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            src:props.srcStr
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextProps.srcStr !== this.state.src;
    }

    render() {
        let {srcStr} = this.props
        return(
            <iframe src={srcStr}/>
        )
    }
}

export default OperateIframe