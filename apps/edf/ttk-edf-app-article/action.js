import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { FadeSlider } from 'edf-component'
import moment from 'moment'
import { xml } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        const response = this.component.props.data
        // this.injections.reduce('load', response)
        injections.reduce('init',response)
    }

    load = async () => {
        const response = this.component.props.data
        this.injections.reduce('load', response)
    }

    handleClick = (url, requestType) => {
        let flag = url
        if(url == 'more')
            url = 'https://zsfw.jchl.com/portal/tk/training/page/1/video_course.html'
        xml('/v1/edf/connector/getcodefromuc', {type: 'training'}, (req) => {
            let param = JSON.parse(req)
            let ts = 'shipinkecheng'
            if(requestType == 1) {
                if(param.value == null){
                    window.open(url)
                }else {
                    if(flag == 'more') {
                        window.open(url+ '?' + param.value.replace('&', ''))
                    }else {
                        window.open(url + param.value)
                    }
                }
            }else {
                if(param.value == null){
                    this.component.props.setPortalContent('视频课程', 'ttk-edf-app-iframe?linkcode=' + ts, { 'src': url })
                }else {
                    if(flag == 'more') {
                        this.component.props.setPortalContent('视频课程', 'ttk-edf-app-iframe?linkcode=' + ts, { 'src': (url+ '?' + param.value.replace('&', '')) })
                    }else {
                        this.component.props.setPortalContent('视频课程', 'ttk-edf-app-iframe?linkcode=' + ts, { 'src': (url + param.value) })
                    }
                }
            }
        }, () => {
            this.metaAction.toast('error', '请求失败')
        })
    }

    getCarouselData = (data) => {
        data = data.slice(0,3)
        return (
            <FadeSlider>
                {
                    data.map(item => {
                        return (
                            <img src={item.listLogo} onClick={this.handleClick.bind(this, item.videoUrl, 0)}/>
                        )
                    })
                }
            </FadeSlider>
        )
    }
    parseTime = (v, format) => {
        return moment(v).format(format)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}