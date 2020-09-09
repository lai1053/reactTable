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

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener)
			this.component.props.setOkListener(this.onOk)

		injections.reduce('init')
		this.load()
	}

	load = async () => {
		const response = await this.webapi.commonDoc.query()

		this.injections.reduce('load', response)
	}

	onOk = () => {
		let selectedCommon = this.metaAction.gf('data.selectedCommon')

		if (selectedCommon) {
			return { docTemplateId:selectedCommon }
		} else {
			this.metaAction.toast('warning', '请选择需要使用的模板')
			return false
		}
	}

	getList = (option) => {
		console.log(option)
		/*常用凭证借贷显示，为了防止出现滚动条,  最多显示4条记录，优先截取借，然后才是贷，
		数据只有一个方向得，另一个要默认带出科目方向，为空即可*/
		let drArrayList = [],crArrayList=[],result=[]
		option.entrys.map(item => {
			let myKey=`${item.directionName}`
			let accountCode=item.accountCode ? item.accountCode:''
			let accountName=item.accountName ? item.accountName:''
			if(myKey=='借'){
				if(drArrayList.length==0){
					drArrayList.push({
						tip: true,
						ellipsis: true,
						name: 'content',
						title: `借 : ${accountCode} ${accountName}`,
						component: '::div',
						className: 'content-list',
						children: `借 : ${accountCode} ${accountName}`,
					})
				}else{
					drArrayList.push({
						tip: true,
						ellipsis: true,
						name: 'content',
						title: `${accountCode} ${accountName}`,
						component: '::div',
						className: 'content-list-ll',
						children: `${accountCode} ${accountName}`,
					})
				}
			}else{
				if(crArrayList.length==0){
					crArrayList.push({
						tip: true,
						ellipsis: true,
						name: 'content',
						title: `贷 : ${accountCode} ${accountName}`,
						component: '::div',
						className: 'content-list',
						children: `贷 : ${accountCode} ${accountName}`,
					})
				}else{
					crArrayList.push({
						tip: true,
						ellipsis: true,
						name: 'content',
						title: `${accountCode} ${accountName}`,
						component: '::div',
						className: 'content-list-ll',
						children: `${accountCode} ${accountName}`,
					})
				}
			}
		})
		if(drArrayList.length==0){
			drArrayList.push({
				tip: true,
				ellipsis: true,
				name: 'content',
				component: '::div',
				className: 'content-list',
				children:'借:'
			})
		}
		if(crArrayList.length==0){
			crArrayList.push({
				tip: true,
				ellipsis: true,
				name: 'content',
				component: '::div',
				className: 'content-list',
				children:'贷:'
			})
		}
		if(drArrayList.length>2){
			result= [...drArrayList.slice(0,3),...crArrayList.slice(0,1)]
		}else if(crArrayList.length>2){
			let length=drArrayList.length
			result= [...drArrayList.slice(0,length),...crArrayList.slice(0,4-length)]
		}else{
			result= [...drArrayList,...crArrayList]
		}
		return result
	}

	modifyTemplate = async (template) => {
    const ret = await this.metaAction.modal('show', {
        title: '存为模板',
        width: 340,
        children: this.metaAction.loadApp('app-proof-of-charge-common-add', {
            store: this.component.props.store,
            columnCode: "common",
            initData: {template: Map(template), modify:true},
        }),
    })

		if (ret.result) {
			this.injections.reduce('modifyTemplate', fromJS(ret.editTemplate))
		}
	}

	deleteTemplate = async (template) => {
		const ret = await this.metaAction.modal('confirm', {
				title: '删除',
				content: '确认删除?'
		})

		if (ret) {
			this.webapi.commonDoc.delete({docTemplateId: template.docTemplateId})
			this.metaAction.toast('success', '删除常用凭证成功')
			this.injections.reduce('deleteTemplate', template)
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
