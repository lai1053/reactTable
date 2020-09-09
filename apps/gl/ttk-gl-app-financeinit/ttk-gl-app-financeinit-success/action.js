import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import { consts } from 'edf-consts'
import { fetch } from 'edf-utils'
import { LoadingMask, Upload, FormDecorator } from 'edf-component'
import classNames from 'classnames'
import img from '../../../../vendor/img/gl/blank.png'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections        
        injections.reduce('init')
        this.load()
    }   

    load = async () => {       
    }
    getPhoto = () => {
        return blank
    }
    close = () =>{        
        this.component.props.tabEdit('财务期初', 'remove')
    }    

}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}



