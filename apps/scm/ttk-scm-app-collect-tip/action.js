import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'
import { fetch } from 'edf-utils'
import utils from 'edf-utils'
import { trimExt } from 'upath'
import moment from 'moment'
import { Map, fromJS, toJS } from 'immutable'

import { Carousel } from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}
		injections.reduce('init')
	}
	onChange = (e) => {
		this.injections.reduce('onChange', e.target.checked);
	}
	onOk = async () => {
		const checked = this.metaAction.gf('data.checked');

		if (checked) {
			const { id, ts } = this.component.props;
			await this.webapi.updateNoDisplay({ "noDisplaySet": 1, id, ts });
		}
		this.component.props.closeModal();
	}
	onCancel = async () => {

		const checked = this.metaAction.gf('data.checked')
		if (checked) {
			const { id, ts } = this.component.props;
			await this.webapi.updateNoDisplay({ "noDisplaySet": 1, id, ts });
		}

		return true
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