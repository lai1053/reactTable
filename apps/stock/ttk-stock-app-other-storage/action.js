import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import OrtherStorageMainContent from './components/mainContent'

class action {
    constructor(option) {
        this.metaAction = option.metaAction;
        this.config = config.current;
        this.webapi = this.config.webapi;
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
    }
    renderChildren = () => {
        return <OrtherStorageMainContent
            store={this.component.props.store}
            webapi={this.webapi}
            metaAction={this.metaAction}
            component={this.component}
        ></OrtherStorageMainContent>
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

