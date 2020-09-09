import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import utils, { fetch, path } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let id = this.component.props.id
        this.loadgetGGxx(id)
    }

    loadgetGGxx = async (id) => {
        let option = {
            id:id
        }

        let response = await this.webapi.person.getGGxx(option)

        this.metaAction.sf('data.ggxx', fromJS(response))
    }
    getMessageContent = (content) => {
        return (
            <div id={'portalDetailMessage'} dangerouslySetInnerHTML={{ __html: content }}></div>
        )
    }
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
}


export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

