import React from 'react'
import { List, fromJS, Map} from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}
    onFieldChange = (path, v) => {
        this.metaAction.sf(path, v)
    }
	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		injections.reduce('init', component.props.list);
	}

	renderStatement = (data) => {
		return data&&data.map( item => {
			return <div>
					<span className='title'>{item.customer}：</span>
					<span className={item.success ? 'success': 'error'}>{item.message}</span>
				</div>
		})
	}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
