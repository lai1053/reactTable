import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import debounce from 'lodash.debounce'
import extend from './extend';
import config from './config';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

		this.load();
	};

	load = async () => {
		let txt = this.metaAction.gf('data.entity.fuzzyCondition')

		const res = await this.webapi.seluser.querylist({searchTxt:txt});
		// console.log(res, 'res')
		this.injections.reduce('load', res.body)

	};

    search = async() => {
    	await this.load()
	}

	heightCount = () => {
		let name = '';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = 'ttk-es-app-seluser-contentHeight';
		}
		return name;
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};

	isSelectAll = (gridName) => {
		return this.extendAction.gridAction.isSelectAll(gridName)
    }

    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }

    //确定
    onOk = ()=>{
		return this.extendAction.gridAction.getSelectedInfo('dataGrid');
	}

	//保存
	addClick = async () => {

	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };

	metaAction.config({ metaHandlers: ret });

	return ret;
}
