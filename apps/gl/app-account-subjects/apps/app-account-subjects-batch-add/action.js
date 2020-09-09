import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {Input} from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener)
			this.component.props.setOkListener(this.onOk)
        injections.reduce('init')    
    }
   
    onOk = async () => {
        let item = this.component.props.item
        let nameList = this.metaAction.gf('data.name').split("\n")
        let list = []
        nameList.filter(name =>{
            if(name != '' && name.trim()){
                list.push(name.trim())
                return true
            }
        } )
        if(list.length == 0){
            this.metaAction.toast('warning', '请至少录入1个科目名称')
            return false
        }
        return {list: list, item: item}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}