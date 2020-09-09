import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { LoadingMask } from 'edf-component'
import { Spin } from 'antd';
import { fromJS } from 'immutable';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.load()
    }
    componentWillUnmount = () => {
		if (window.removeEventListener) {
				window.removeEventListener('resize', this.onResize, false)
		} else if (window.detachEvent) {
				window.detachEvent('onresize', this.onResize)
		} else {
				window.onresize = undefined
		}
	}
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
		setTimeout(()=>{
			if( keyRandomTab == this.keyRandomTab ){
					this.getTableScroll('app-proof-of-list-sort-content', 'ant-table-thead', 2 , 'ant-table-body', 'data.tableOption', e)
			}
		},200)
    }
    getTableScroll = (contaienr, head, num, target, path, e) => {
		try{
			const tableCon = document.getElementsByClassName(contaienr)[0]
			if( !tableCon ){
				if( e ){
						return
				}
				setTimeout(()=>{
						this.getTableScroll(contaienr, head, num, target, path)
				}, 500)
				return
			}
			const header = tableCon.getElementsByClassName(head)[0]
			const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
			const pre = this.metaAction.gf(path).toJS()
			const y = tableCon.offsetHeight - header.offsetHeight - num
			const bodyHeight = body.offsetHeight
			if( bodyHeight > y && y != pre.y ){
					this.metaAction.sf(path, fromJS({...pre, y}))
			}else if( bodyHeight < y && pre.y != null ){
					this.metaAction.sf(path, fromJS({...pre, y: null}))
			}else {
				return false
			}
		}catch(err){

		}
	}
    load = async () => {
        this.metaAction.sf('data.loading', true)
        let params = this.component.props.initData.params,
            list = [],
            response = await this.webapi.query({...params}),
            initList = response.dtoList
        for (let i = 0; i < initList.length; i++) {
            if (initList[i + 1] && initList[i].docTypeAndCode != initList[i + 1].docTypeAndCode || !initList[i + 1]) {
                list.push(initList[i])
            }
        }
        list.forEach(item => {
            item.summaryArr = []
            item.accountCodeNameArr = []
            item.amountDrArr = []
            item.amountCrArr = []
        })
        for (let i = 0; i < initList.length; i++) {
            for (let j = 0; j < list.length; j++) {

                if (initList[i].docTypeAndCode == list[j].docTypeAndCode) {
                    list[j].summaryArr.push(initList[i].summary)
                    list[j].accountCodeNameArr.push(initList[i].accountCodeName)
                    list[j].amountDrArr.push(initList[i].amountDr ? initList[i].amountDr : '0')
                    list[j].amountCrArr.push(initList[i].amountCr ? initList[i].amountCr : '0')
                }
            }
        }
        this.injections.reduce('load', list)
        this.metaAction.sf('data.loading', false)
        setTimeout(() => {
            this.onResize()
        }, 20)
    }
    renderColumns = () => {
        return [
            {
                title: '日期',
                key: 'voucherDate',
                width: 90,
                dataIndex: 'voucherDate',
            },
            {
                title: '凭证字号',
                key: 'docTypeAndCode',
                width: 90,
                dataIndex: 'docTypeAndCode',
            },
            {
                title: '摘要',
                key: 'summaryArr',
                width: 198,
                dataIndex: 'summaryArr',
                render: (text, record, index) => this.rowSpan(text, record, index)
            },
            {
                title: '会计科目',
                key: 'accountCodeNameArr',
                width: 258,
                dataIndex: 'accountCodeNameArr',
                render: (text, record, index) => this.rowSpan(text, record, index)
            },
            {
                title: '借方金额',
                key: 'amountDrArr',
                width: 108,
                dataIndex: 'amountDrArr',
                render: (text, record, index) => this.rowSpan(text, record, index)
            },
            {
                title: '贷方金额',
                key: 'amountCrArr',
                width: 108,
                dataIndex: 'amountCrArr',
                render: (text, record, index) => this.rowSpan(text, record, index)
            },
            {
                title: '附单据数',
                key: 'attachedNum',
                width: 78,
                dataIndex: 'attachedNum',
            },
            {
                title: '制单人',
                key: 'creator',
                width: 96,
                dataIndex: 'creator',
            },
        ]
    }
    rowSpan = (text, record, index) => {
        return (
            <div>
                {
                    text.map(item => {
                        return (
                            item == '0' ? <div className="text"></div> : <div className="text">{item}</div>
                        )
                    })
                }
            </div>
        )
    }

    onRow = (record, index) => {
        let currentId = this.metaAction.gf('data.other.id')
        if (record.id == currentId) {
            return {
                className: 'currentRow'
            }
        }
    }
    clickRow = (e, record, index) => {
        this.metaAction.sf('data.other.currentRow', record)
    }
    moveRow = (dataSource) => {
        console.log(dataSource)
        this.injections.reduce('load', dataSource)
    }
    movedown = () => {
        let list = this.metaAction.gf('data.list').toJS(),
            currentRow = this.metaAction.gf('data.other.currentRow'),
            newArr = []
        let index = list.findIndex(item => 
            item.docId == currentRow.docId
        )
        if(index == list.length - 1){
            this.metaAction.sf('data.other.movedownDisableld', true)
            this.metaAction.toast('warning', '当前已是最后一行')
            return
        }
  
        newArr = this.swapArray(list, index, index + 1);
        this.injections.reduce('load', newArr)
     }
     moveok = () => {
         this.onOk()
     }
     onOk = async () => { 
        let list = this.metaAction.gf('data.list').toJS(),
        date = this.component.props.initData.date,
        docIds = []
        list.map(item => {
            if(item.docId){
                docIds.push(item.docId)
            }
        })
        let response = await this.webapi.save({
            ...date,
            reorganizeType: 2,
            docIds
        })
        this.metaAction.toast('success', '自定义排序成功')
        this.component.props.closeModal()
    }

    swapArray=(arr, index1, index2)=> {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
         return arr;
     }

    moveup = () => {
        let list = this.metaAction.gf('data.list').toJS(),
            currentRow = this.metaAction.gf('data.other.currentRow'),
            newArr = []
        let index = list.findIndex(item => 
            item.docId == currentRow.docId
        )
        if(index == 0){
            this.metaAction.sf('data.other.moveupDisableld', true)
            this.metaAction.toast('warning', '当前已是第一行')
            return
        }
  
        newArr = this.swapArray(list, index, index - 1);
        this.injections.reduce('load', newArr)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}