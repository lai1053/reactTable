import React from 'react'
import ReactDOM from 'react-dom'
import { Spin } from 'antd'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import md5 from 'md5'
import {Carousel, Toast} from 'edf-component'
import { Base64, path, string, environment } from 'edf-utils'
import { consts } from 'edf-consts'

class action {
        constructor(option) {
            this.metaAction = option.metaAction
            this.config = config.current
            this.webapi = this.config.webapi
        }

        onInit = async ({ component, injections }) => {
            this.component = component
            let props = this.component.props
            injections.reduce('init', { mobile: '', password: '', remember: false })
        }

        register = () => {
            let appParams = this.component.props.appParams
            sessionStorage['dzglMobile'] = appParams && appParams.mobile
            sessionStorage['clearText'] = appParams && appParams.clearText
            this.component.props.onRedirect({
                appName: 'ttk-dzgl-app-register',},
                {...appParams,
                    step:2
                }
            )
        }
    }

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
