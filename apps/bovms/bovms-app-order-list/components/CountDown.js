import React from "react"
import moment from "moment"

export default class CountDown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            temp: moment("2020-01-01 00:00:00").valueOf(),
            endTime: moment(Number(props.startTime) || new Date())
                .add(24, "h")
                .valueOf(),
            hours: 23,
            minutes: 59,
            seconds: 59,
        }
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.timerID)
    }

    tick() {
        const { endTime, temp } = this.state,
            diff = endTime - moment().valueOf()
        if (diff <= 0 && this.props.reload) {
            clearInterval(this.timerID)
            this.props.reload()
            return
        }
        /*
        //方法一
        const hours = Math.floor(diff / 3600 / 1000),
            minutes = Math.floor((diff - hours * 3600 * 1000) / 60 / 1000),
            seconds = Math.floor((diff - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000)
        */
        // 方法二
        const [hours, minutes, seconds] = moment(temp + diff)
            .format("HH:mm:ss")
            .split(":")
        this.setState({
            hours,
            minutes,
            seconds,
        })
    }

    render() {
        const { hours, minutes, seconds } = this.state
        return (
            <span className="-count-down">
                {hours}小时{minutes}分{seconds}秒取消
            </span>
        )
    }
}
