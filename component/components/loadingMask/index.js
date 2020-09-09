import React, { Component, PropTypes, PureComponent } from 'react'
import { Spin } from 'antd'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

class LoadingMaskComponent extends PureComponent {
    state = {
        background: ''
    }

    constructor(props) {
        super(props)
        this.state = { background: props.background }
    }

    componentDidMount() {
        let _this = this,
            delay = this.props.delay || 2000,
            showBackground = (this.props.showBackground === false ? false : true)

        if (showBackground) {
            this.backTimeout = window.setTimeout(function () {
                return _this.setState({ background: 'mk-loadingMask-3' })
            }, delay)
        }
    }

    componentWillUnmount() {
        if (this.backTimeout) {
            clearTimeout(this.backTimeout)
        }
    }

    render() {
        let mask
        if (this.props.background) {
            mask = { background: this.props.background }
        }
        let wrapperClassName = this.props.wrapperClassName || ''
        let className = classNames({
            'mk-loadingMask': true
        })
        let tip = this.props.content || '正在处理中...',
            showBackground = (this.props.showBackground === false ? false : true)

        let backGroundClassName = this.state.background

        return showBackground ?
            <div className={'mk-loadingMask-1 ' + wrapperClassName + ' ' + backGroundClassName} style={mask}>
                <Spin size="large" tip={tip} delay={this.props.delay || 2000} />
            </div>
            :
            <div className={'mk-loadingMask-2'}>
            </div>
    }
}

LoadingMaskComponent.newInstance = function newLoadingMaskInstance() {
    let divContainer = document.createElement('div');
    return {
        show(properties) {
            if (!divContainer) {
                divContainer = document.createElement('div');
            }
            const props = properties || {}
            document.body.appendChild(divContainer)
            ReactDOM.render(<LoadingMaskComponent {...props} />, divContainer)
        },
        hide() {
            ReactDOM.unmountComponentAtNode(divContainer)
            try {
                document.body.removeChild(divContainer)
            } catch (e) {

            }
            divContainer = null;
        }
    }
}

let loadingMask = window.LoadingMask

if (!loadingMask) {
    loadingMask = LoadingMaskComponent.newInstance()
    window.LoadingMask = loadingMask
}



export default loadingMask
