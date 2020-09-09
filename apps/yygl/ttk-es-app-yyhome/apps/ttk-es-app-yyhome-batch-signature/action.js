import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    timer = null

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setCancelLister) {
            // this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

    }

    load = async ()=>{

    }

    // onCancel = () => {
    //     if(this.timer){
    //         clearInterval(this.timer)
    //     }
    //     console.info('cancel')
    // }

    renderChildren = () =>{
        // return (
        //     <iframe
        //         title="resg"
        //         srcDoc={data}
        //         style={{ width: '100%', border: '0px', height: '700px' }}
        //         sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        //         scrolling="auto"
        //     />
        // )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}