import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import { FormDecorator } from 'edf-component'

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
		this.onWriteBackAuxItem = component.props.onWriteBackAuxItem

		let accountingSubject = this.component.props.initData ? this.component.props.initData.toJS() : {}

		injections.reduce('init', accountingSubject)
		this.load(accountingSubject)
	}

	load = async (accountingSubject) => {
		const allArchiveDS = await this.webapi.query.allArchive({ isEnable: true})
		this.injections.reduce('load', accountingSubject, allArchiveDS)
		this.writeBackAuxItem()
	}

	componentDidMount = () => {
	    let thisStub = this
	    setTimeout(()=> {
	        let win = document.getElementsByClassName('app-proof-of-charge-assistitem')[0] //ReactDOM.findDOMNode(thisStub.refs.auxItem)
	        if (win) {
	            if (win.addEventListener) {
	                win.addEventListener('keydown', ::thisStub.handleKeyDown, false)
	            } else if (win.attachEvent) {
	                win.attachEvent('onkeydown', ::thisStub.handleKeyDown)
	            } else {
	                win.onKeyDown = ::thisStub.handleKeyDown
	            }
	        }
	    }, 0)
	}

  componentDidUpdate = () => {
      let isSetFocus = this.metaAction.gf('data.other.isSetFocus')

      //只在初次调用componentDidUpdate时设置默认焦点
      if(isSetFocus){
          let dom = document.getElementsByClassName('app-proof-of-charge-assistitem')[0] //ReactDOM.findDOMNode(this.refs.auxItem)

          if(dom){
              setTimeout(()=>{
                  let c = dom.children[0].children[1].getElementsByClassName('ant-select-selection')[0]
                  if(c){
                      c.tabIndex = 0
                      c.focus()
                  }
              }, 0)
          }

					this.metaAction.sf('data.other.isSetFocus', false)
      }
  }

  componentWillUnmount() {
      let win = document.getElementsByClassName('app-proof-of-charge-assistitem')[0] //ReactDOM.findDOMNode(this.refs.auxItem)

      if (win) {
          if (win.removeEventListener) {
              win.removeEventListener('keydown', ::this.handleKeyDown, false)
          } else if (win.detachEvent) {
              win.detachEvent('onkeydown', ::this.handleKeyDown)
          } else {
              win.onKeyDown = undefined
          }
      }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
        let dom = document.getElementsByClassName('app-proof-of-charge-assistitem')[0]  //ReactDOM.findDOMNode(this.refs.auxItem)

        if(dom){
            setTimeout(()=>{
                let nextFocusIndex = this.getNextFocusIndex()

                if (nextFocusIndex > -1) {
                    let c = dom.children[nextFocusIndex].children[1].getElementsByClassName('ant-select-selection')[0]
                    if(c){
                        c.tabIndex = 0
                        c.focus()
                    }
                }else if(nextFocusIndex == -1){
                    setTimeout(() => {
                        let btnConfirm = document.getElementById('auxItemConfirm')

                        if (btnConfirm) {
                            btnConfirm.click()
                        }
                    }, 0)
                }
            }, 0)
        }
    }
  }

  getNextFocusIndex(){
      let nextFocusIndex

      if (document.activeElement.className.indexOf('ant-select-selection--single') > -1) {
          let auxItems = this.metaAction.gf('data.other.auxItems').toJS()

          let curAuxItem = document.activeElement.parentElement.parentElement.parentElement.parentElement.parentElement,
              curAuxText = curAuxItem.children[0].children[0].innerText,
              curFocusIndex = auxItems.indexOf(curAuxText),
              auxItemCount = curAuxItem.parentElement.parentElement.children[0].children.length

          if (curFocusIndex < auxItemCount - 1) {
              nextFocusIndex = curFocusIndex + 1
          }else{
              nextFocusIndex = -1
          }
      }

      return nextFocusIndex
  }

	writeBackAuxItem = () => {
		let auxAccountSubjects = this.metaAction.gf('data.form.auxAccountSubjects') ? this.metaAction.gf('data.form.auxAccountSubjects').toJS() : undefined
		this.onWriteBackAuxItem(auxAccountSubjects)
	}

	addArchive = async (fieldName, userDefineTag) => {
		switch (fieldName) {
			case 'customer':
				await this.voucherAction.addCustomer('data.form.auxAccountSubjects.customer')
				this.addItemtoList('data.other.customer', 'data.form.auxAccountSubjects.customer')
				break;
			case 'department':
				await this.voucherAction.addDepartment('data.form.auxAccountSubjects.department')
				this.addItemtoList('data.other.department', 'data.form.auxAccountSubjects.department')
				break;
			case 'person':
				await this.voucherAction.addPerson('data.form.auxAccountSubjects.person')
				this.addItemtoList('data.other.person', 'data.form.auxAccountSubjects.person')
				break;
			case 'inventory':
				await this.voucherAction.addInventory('data.form.auxAccountSubjects.inventory')
				this.addItemtoList('data.other.inventory', 'data.form.auxAccountSubjects.inventory')
				break;
			case 'supplier':
				await this.voucherAction.addSupplier('data.form.auxAccountSubjects.supplier')
				this.addItemtoList('data.other.supplier', 'data.form.auxAccountSubjects.supplier')
				break;
			case 'project':
				await this.voucherAction.addProject('data.form.auxAccountSubjects.project')
				this.addItemtoList('data.other.project', 'data.form.auxAccountSubjects.project')
				break;
			default:
				this.openUserDefineCard(fieldName, userDefineTag)
		}
		this.writeBackAuxItem()
	}

	addItemtoList = (listName, itemName) => {
		let list = this.metaAction.gf(listName),
				item = this.metaAction.gf(itemName)

	  list = list.push(item)
		this.metaAction.sf(listName, list)
	}

	openUserDefineCard = async (fieldName, userDefineTag) => {
		const ret = await this.metaAction.modal('show', {
				title: `新增${fieldName}`,
				width: 400,
				children: this.metaAction.loadApp('app-card-userdefinecard', {
					store: this.component.props.store,
					activeKey: fieldName
        }),
		})

		if (ret && ret.isEnable) {
			let address = `data.form.auxAccountSubjects.${userDefineTag}`
			this.injections.reduce('setUserDefineItem', address, ret)
			this.addItemtoList(`data.other.${userDefineTag}`, address)
			this.writeBackAuxItem()  //解决自定义项无法写入session问题
		}
	}

	archiveFocus = async (archiveName) => {
		let params

		if (archiveName == 'department') {
			params={entity: {isEnable:true, isEndNode: true}}
		} else {
			params={entity: {isEnable:true}} //获取没有停用基础档案
		}

		if (archiveName.indexOf('exCalc') > -1) {
			let index = archiveName.substr(archiveName.length-1, 1)
			const parmasObj = {entity: {calcName: `isExCalc${index}`,isEnable:true}}
			const response = await this.webapi.query.userDefineItem(parmasObj)

			this.metaAction.sf(`data.other.${archiveName}`, fromJS(response.list))
		} else {
			const response = await this.webapi.query.fixedArchive(params, archiveName)

			this.metaAction.sf(`data.other.${archiveName}`, fromJS(response.list))
		}
	}

	onFieldChange = (src, fieldName) => (v) => {
		const hit = src.find(o => o.id == v)
		if (hit)
			this.metaAction.sf(fieldName, fromJS(hit))
		else
			this.metaAction.sf(fieldName, v)

		let auxAccountSubjects = this.metaAction.gf('data.form.auxAccountSubjects').toJS()

		this.onWriteBackAuxItem(auxAccountSubjects)
	}

	getDisplayValue = (curArchiveObj, archiveList) => {
			if(!curArchiveObj) return ''

			let ret = '',
			 		filterResult = archiveList.filter(item => {
					return item.id == curArchiveObj.id
			})

			if (filterResult && filterResult.length > 0) {
					ret = curArchiveObj.id
			} else {
					ret = curArchiveObj.name
			}

			return ret
	}

	openContent = async (value, activeKey) => {
		_hmt && _hmt.push(['_trackEvent', '财务', '填制凭证', '辅助核算编辑'])
		let app, title = '自定义档案',
		appId = sessionStorage['appId']
		if( value == 'department' || value == 'person' ) {
			this.component.props.setPortalContent &&
			this.component.props.setPortalContent('部门人员', 'app-list-department-personnel', {})
			return
		}else {
			app = `app-list-${value}?from=certificate` //增加[?from=certificate]参数，解决TTK-2560档案空白问题
			if(value !== 'userdefinecard'){
				title = activeKey
			}
			if(appId == 114 && activeKey == '存货'){
				app = 'ttk-app-inventory-list?from=certificate'
			}
		}
		const ret = await this.metaAction.modal('show', {
			title: <span style={{fontWeight: 'bold'}}>{title}</span>,
			className: 'app-proof-of-charge-modal',
			width: 900,
			footer: null,
			bodyStyle: {height: 450},
			children: this.metaAction.loadApp(app, {
				store: this.component.props.store,
				activeKey: activeKey,
				modelStatus: 2
			}),
		})
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
