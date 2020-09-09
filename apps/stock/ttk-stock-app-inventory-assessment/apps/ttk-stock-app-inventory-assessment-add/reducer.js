import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
// import moment from 'moment'
import extend from './extend'
import { FormDecorator } from 'edf-component'
class reducer {
    constructor(option) {
		this.metaReducer = option.metaReducer
		this.config = config.current
		this.voucherReducer = option.voucherReducer
	}

    init = (state, option, isFrom) => {
        const initState = getInitState()
        
        if(option){
            initState.data.formstate = false
        }else{
            initState.data.formstate = true
        } 
        isFrom && (initState.data.isFrom = true)
        initState.data.formList.operater = sessionStorage['username']
        return this.metaReducer.init(state, initState)
    }

    load = (state, response, data) => {       
        let list = response
        list.forEach(item => {
            item.name = item.inventoryName
            item.id = item.inventoryId
            item.code = item.inventoryCode
            item.unit = item.inventoryUnit
            item.guige = item.inventoryGuiGe
        })
        let voucher = {
            'details': list
        }
        //如果行数太少,则用空行补足
		if (voucher.details) {
			// const details = this.metaReducer.gf(state, 'data.form.details').toJS()
			while (voucher.details.length < 7) {
				voucher.details.push(blankDetail)
			}
        }
        voucher.cacheData = voucher.details
        state = this.metaReducer.sf(state, 'data.form', fromJS(voucher))
        if (data) {
            data.billBodys = ''
            state = this.metaReducer.sf(state, 'data.formList', fromJS(data))
        }
        return state
    }
    updateSfs = (state, options, id, btnClicklist) => {
        var list = this.metaReducer.gf(state, 'data.form.details').toJS()
        let listdata = []
        if (options.length == 1) {
            if (btnClicklist === "btnClicklist") {
                let flag
                let haveFirst = id > 0 ? true : false
                if (haveFirst) flag = list[id-1].code
                if (!flag) {
                    list.forEach((item) => {
                        if(item.code != ''){
                            listdata.push(item)
                        }
                    })
                    options.forEach(item => {
                        item.id = item.inventoryId
                        item.code = item.inventoryCode
                        item.name = item.inventoryName
                        item.guige = item.inventoryGuiGe
                        item.unit = item.inventoryUnit
                    })
                    let selectname = [] 
                    var obj = listdata.concat(options)
                    obj.forEach(item => {
                        if(item.id){
                            selectname.push(item.id)
                        }
                    })
                    while (obj.length < 7) {
                        obj.push(blankDetail)
                    }
                    sessionStorage['inventoryNameList'] = selectname
                    return this.metaReducer.sf(state,'data.form.details', fromJS(obj))
                }
            }
            list[id].id = options[0].inventoryId
            list[id].code = options[0].inventoryCode
            list[id].name = options[0].inventoryName
            list[id].guige = options[0].inventoryGuiGe
            list[id].unit = options[0].inventoryUnit
            let selectname = [] 
            list.forEach(item => {
                if(item.id){
                    selectname.push(item.id)
                }
            })
            sessionStorage['inventoryNameList'] = selectname
            return this.metaReducer.sf(state,'data.form.details', fromJS(list))
        } else {
            list.forEach((item) => {
                if(item.code != ''){
                    listdata.push(item)
                }
            })
            options.forEach(item => {
                item.id = item.inventoryId
                item.code = item.inventoryCode
                item.name = item.inventoryName
                item.guige = item.inventoryGuiGe
                item.unit = item.inventoryUnit
            })
            let selectname = [] 
            var obj = listdata.concat(options)
            obj.forEach(item => {
                if(item.id){
                    selectname.push(item.id)
                }
            })
            while (obj.length < 7) {
				obj.push(blankDetail)
            }
            sessionStorage['inventoryNameList'] = selectname
            return this.metaReducer.sf(state,'data.form.details', fromJS(obj))
        }
    }

    update= (state, patch,data) => this.metaReducer.sf(state, patch, data)
    
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.form.details')
        list = list.insert(rowIndex,Map({
            id: list.size
        }))
        return this.metaReducer.sf(state, 'data.form.details', list)
    }
	addRowBefore = (state, gridName, rowIndex) => this.metaReducer.sf(state, 'data.other.isSaveSuccess', false)


    delRowBefore = (state, gridName, rowIndex) => this.metaReducer.sf(state, 'data.other.isSaveSuccess', false)


    delrow = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.form.details')
        const index = list.findIndex(o => {
           return  o.get('id') == id
        })
        
        if (index == -1)
            return state

        list = list.remove(index)
        return this.metaReducer.sf(state, 'data.form.details', list)
    }
    delect = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.form.details').toJS()
        list.splice(id,1)
        if (list) {
			while (list.length < 7) {
				list.push(blankDetail)
			}
		}
        return this.metaReducer.sf(state, 'data.form.details', fromJS(list))
    }
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })
	return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
