import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { toJS } from 'immutable'
import { Icon } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.load(this.component.props.successArr, this.component.props.failArr);
    }
    load = (success, fail) => {
        this.injections.reduce('load', { success, fail });
    }
    onOk = () => {
        this.component.props.closeModal();
    }

    getClassName = () => {
        let fail = this.component.props.failArr
        if (fail.length <= 3) {
            return '120px'
        } else if (fail.length > 3 && fail.length < 14) {
            let length = 120 + (fail.length - 3) * 21
            return `${length}px`
        } else {
            return '375px'
        }
    }
    renderLi = () => {
        let fail = this.metaAction.gf('data.fail').toJS();
        let success = this.metaAction.gf('data.success').toJS();
        let arr = [
            <p className='error-list-item error-list-success jinggao'>
                <Icon type="jinggao" fontFamily='edficon' />
                <span>成功{success.length}条，失败{fail.length}条，失败原因如下：</span>
            </p>
        ]
        let liarr=[]
        fail.forEach(item => {
            liarr.push(<li className='itemP'>{item.message ? item.message : item}</li>)
        });
        arr.push(<ul style={{listStylePosition:'outside',listStyleType:'disc',margin:0,marginLeft: '-18px'}}>
            {liarr}
        </ul>)

        return arr;
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

