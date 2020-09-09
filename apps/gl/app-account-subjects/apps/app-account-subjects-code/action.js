import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {Input} from 'edf-component'
import { fromJS } from 'immutable'
let AntNumber = Input.AntNumber
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener)
        this.component.props.setOkListener(this.onOk)

        injections.reduce('init')
        this.initLoad()    
    }
    returnNumber = () => {
        return <AntNumber min='1' max='4'/>
    }

    initLoad = async() => {
        const res = await this.webapi.subjectCode.getAccountGrade()

        if (res) {
            this.injections.reduce('updateDate', 'data.form',fromJS(res))
        }
    }

    fieldChange = (name, value) => {
        if (value < 2 || value > 10) {
            return
        }
        this.injections.reduce('updateDate', name, value)
    }
    getsample = () => {
        let form = this.metaAction.gf('data.form').toJS()
        return `1001 ${"0".repeat(form.grade2 - 1)}1 ${"0".repeat(form.grade3 -1)}1 ${"0".repeat(form.grade4 -1)}1 ${"0".repeat(form.grade5 -1)}1`
    }
    onOk = async () => {
        let parmas = this.metaAction.gf('data.form').toJS()
        parmas = {
            ...parmas,
            isReturnValue: true
        }
        const res = await this.webapi.subjectCode.setAccountGrade(parmas)
        if (res) {
            if (res.error && res.error.message) {
                this.metaAction.toast('error', res.error.message)
                // const response = await this.webapi.subjectCode.getAccountGrade()
                // console.log(response)
                // this.injections.reduce('updateGrade', response)
                
                return false
            } else {
                this.metaAction.toast('success', '科目编码设置成功')
            }
            return true
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}