import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import utils from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
    }

    onFieldChange = (path, v) => {
        this.metaAction.sf(path, v)
    }

    parseJson = () => {
        let htmlCode = this.metaAction.gf('data.form.t1')
        let jsonCode = utils.parseHtml(htmlCode)
        this.metaAction.sf('data.form.t2', jsonCode)
    }

    onCopy = () => {
        //debugger
        const input = document.createElement('input');
        input.setAttribute('id', 'txtCopy');
        input.setAttribute('name', 'txtCopy');
        document.body.appendChild(input);
        input.setAttribute('value', this.metaAction.gf('data.form.t2'));
        input.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            console.log('复制成功');
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