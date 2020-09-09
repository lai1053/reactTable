import React from 'react' 
import { action as MetaAction, AppLoader } from 'edf-meta-engine' 
// import debounce from 'lodash.debounce'
import extend from './extend' 
import config from './config' 

class action {
	constructor(option) {
		this.metaAction = option.metaAction 
		this.extendAction = option.extendAction 
		this.config = config.current 
		this.webapi = this.config.webapi 
		// this.search = debounce(this.search, 800) 
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections }) 
		this.component = component 
		this.injections = injections 
		injections.reduce('init') 
		this.load() 
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener 
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load) 
		}
	} 

	load = async (page) => {
		let filter
		if(page && page.pageSize){
			filter = {
				page: {
					currentPage: page.currentPage,
					pageSize: page.pageSize
				},
				entity: {
					fuzzyCondition: ""
				}
			}
		}else{
			filter = {
				page: {
					currentPage: 1,
					pageSize: 50
				},
				entity: {
					fuzzyCondition: ""
				}
			}
		}
		const response = await this.webapi.queryList(filter)
		this.injections.reduce('load', response)
		setTimeout(() => {  
            this.onResize()              
        }, 20)
	}

	// componentWillUnmount = () => {
    //     if (window.removeEventListener) {
    //         window.removeEventListener('resize', this.onResize, false)
    //     } else if (window.detachEvent) {
    //         window.detachEvent('onresize', this.onResize)
    //     } else {
    //         window.onresize = undefined
    //     }
    // }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
	}
	
	onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }
	
	getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('ttk-app-unit-list')[0];//以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];//table wrapper包含整个table,table的高度基于这个dom

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        y: height - theadDom.offsetHeight,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                    })
                }
            }
        } catch (err) {
        }
    }

	del = async (record) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		}) 
		if (ret) {
			const filter = [{id: record.id, ts: record.ts}]
			const response = await this.webapi.delete(filter)
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message)
				})
			} else {
				this.load() 
				this.metaAction.toast('success', '删除成功')
			}
			
		}
	} 

	//新增档案
	addModel = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '新增计量单位',
			wrapClassName: 'card-archive',
			width: 720,
			className: 'ttk-app-unit-card-add',
			children: this.metaAction.loadApp('ttk-app-unit-card', {
				store: this.component.props.store,
			})
		}) 
		if (ret) {
			this.load() 
		}
	}
	editModel = async (text, record, index) => {
		const ret = await this.metaAction.modal('show', {
			title: '编辑计量单位',
			wrapClassName: 'card-archive',
			width: 720,
			className: 'ttk-app-unit-card-add',
			children: this.metaAction.loadApp('ttk-app-unit-card', {
				store: this.component.props.store,
				item: record
			})
		}) 
		if (ret) {
			this.load() 
		}
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked) 
	}

	//分页修改
	pageChanged = async (currentPage, pageSize) => {
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination')
				.toJS().pageSize 
		}
		let page = { currentPage, pageSize } 
		this.load(page) 
	}

	renderColumns = () => {
		// let list = this.metaAction.gf('data.list').toJS()
		let columns = [
			{
				name: 'code',
				title: '编号',
				dataIndex: 'code',
				align: 'center',
				width: '200px'
			},{
				name: 'groupName',
				title: '描述',
				dataIndex: 'groupName',
				align: 'center'
			}
		]
		columns.push({
			title: '操作',
			key: 'caozuo',
			dataIndex: 'caozuo',
			width: 100,
			className: 'center',
			render: (text, record, index) => {
				return <span>
					<a onClick={()=>this.editModel(text, record, index)}>编辑</a>
					<span style={{padding: '0px 5px'}}>|</span><a onClick={()=>this.del(record)}>删除</a>
				</span>
				
			}
		})
        return columns
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o } 
	metaAction.config({ metaHandlers: ret }) 
	return ret 
}
