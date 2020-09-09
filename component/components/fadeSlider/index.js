import React, { PureComponent } from 'react'
import classNames from 'classnames'

class FadeSliderComponent extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            index: 0,
            totalPage: this.props.children.length,
            timer: null,
            zIndex: 1
        }
    }

    componentDidMount() {
        let timer = this.state.timer
        timer = setInterval(() => {
            if (location.href.indexOf("edfx-app-home") > -1) {
                this.turnToNextPage()
            }
            else {
                clearInterval(timer)
            }
        }, 8000)

    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    }

    turnToLastPage() {
        let index = this.state.index
        let totalPage = this.state.totalPage - 1
        if (index == 0) {
            index = totalPage
        } else if (index > 0) {
            index--
        }
        this.setState({
            index: index
        })
    }

    turnToNextPage() {
        let index = this.state.index
        let totalPage = this.state.totalPage - 1
        if (index == totalPage) {
            index = 0
        } else if (index < totalPage) {
            index++
        }
        this.setState({
            index: index
        })
    }

    handleImg(item, index) {
        let itemClass = classNames({
            "fadeIn": this.state.index == index,
            "imgBox": true,
            "animated": true
        })
        let style = {
            zIndex: this.state.index == index ? 10 : 0
        }
        let img = (
            <div key={`handle-img-${index}`} className={itemClass} style={style}>
                {item}
            </div>
        )
        return img
    }

    selectDot(index) {
        this.setState({
            index: index
        })
    }

    createDot = (item, index) => {
        let className = classNames({
            "highlight": this.state.index == index,
            "middleDot": index == 1
        })
        let span = (
            <span key={`create-dot-span-${index}`} className={className} onClick={this.selectDot.bind(this, index)}></span>
        )
        return span
    }

    render() {
        return (
            <div className={'fadeSlider'}>
                <div className={'sliderContainer'}>
                    {this.props.children.map((item, index) => {
                        return this.handleImg(item, index)
                    })}
                </div>
                <span className={'lastPage'} onClick={::this.turnToLastPage}>
                    <i className={'edficon edficon-zuo'} />
                </span>
            <span className={'nextPage'} onClick={:: this.turnToNextPage}>
                <i className={'edficon edficon-you'} />
                </span >
    <div className={'navDot'}>
        {this.props.children.map((item, index) => {
            return this.createDot(item, index)
        })}
    </div>
            </div >
        )
    }
}
export default FadeSliderComponent