import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'
import { number, moment } from 'edf-utils'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.extendReducer = option.extendReducer
		this.config = config.current
	}

	init = (state, option) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}

	load = (state, data ) => {
		let len = data.zzsSbListByTotal.length
		data.zzsSbListByTotal = data.zzsSbListByTotal.map( (item , index) => {
			item.seq = index+1
			// item.zyxsesfl = (item.zyxsesfl == '--') ? item.zyxsesfl : ( ( ( item.zyxsesfl || 0 ) - 0 ) * 100 ).toFixed(2) + '%'
			// item.zxsesfl = (item.zxsesfl == '--') ? item.zxsesfl : ( ( ( item.zxsesfl || 0 ) - 0 ) * 100 ).toFixed(2) + '%'
			item.ynse = number.format((item.ynse? item.ynse-0 : 0), 2)
			item.bqyjse = number.format((item.bqyjse? item.bqyjse-0 : 0), 2)
			item.asysljsxse = number.format((item.asysljsxse? item.asysljsxse-0 : 0), 2)
			item.ajybfjsxse = number.format((item.ajybfjsxse? item.ajybfjsxse-0 : 0), 2)
			item.mdtbfckxse = number.format((item.mdtbfckxse? item.mdtbfckxse-0 : 0), 2)
			item.msxse = number.format((item.msxse? item.msxse-0 : 0), 2)
			item.xxse = number.format((item.xxse? item.xxse-0 : 0), 2)
			item.jxse = number.format((item.jxse? item.jxse-0 : 0), 2)
			item.sqldse = number.format((item.sqldse? item.sqldse-0 : 0), 2)
			item.jxsezc = number.format((item.jxsezc? item.jxsezc-0 : 0), 2)
			item.mdtytse = number.format((item.mdtytse? item.mdtytse-0 : 0), 2)
			item.qmldse = number.format((item.qmldse? item.qmldse-0 : 0), 2)
			item.jybfYnse = number.format((item.jybfYnse? item.jybfYnse-0 : 0), 2)
			return item
		})
		// data.zzsSbListByTotal.push({//hjByTotal
		// 	seq: '合计',
		// 	"ssyf": " ",
		// 	"ynse": number.format((data.hjByTotal.ynsehj? data.hjByTotal.ynsehj-0 : 0), 2),
		// 	"bqyjse": number.format((data.hjByTotal.bqyjsehj? data.hjByTotal.bqyjsehj-0 : 0), 2),
		// 	"zyxsesfl": ' ',
		// 	"zxsesfl": ' ',
		// 	"asysljsxse": number.format((data.hjByTotal.asysljsxsehj? data.hjByTotal.asysljsxsehj-0 : 0), 2),
		// 	"ajybfjsxse": number.format((data.hjByTotal.ajybfjsxsehj? data.hjByTotal.ajybfjsxsehj-0 : 0), 2),
		// 	"mdtbfckxse": number.format((data.hjByTotal.mdtbfckxsehj? data.hjByTotal.mdtbfckxsehj-0 : 0), 2),
		// 	"msxse": number.format((data.hjByTotal.msxsehj? data.hjByTotal.msxsehj-0 : 0), 2),
		// 	"xxse": number.format((data.hjByTotal.xxsehj? data.hjByTotal.xxsehj-0 : 0), 2),
		// 	"jxse": number.format((data.hjByTotal.jxsehj? data.hjByTotal.jxsehj-0 : 0), 2),
		// 	"sqldse": number.format((data.hjByTotal.sqldsehj? data.hjByTotal.sqldsehj-0 : 0), 2),
		// 	"jxsezc": number.format((data.hjByTotal.jxsezchj? data.hjByTotal.jxsezchj-0 : 0), 2),
		// 	"mdtytse": number.format((data.hjByTotal.mdtytsehj? data.hjByTotal.mdtytsehj-0 : 0), 2),
		// 	"qmldse": number.format((data.hjByTotal.qmldsehj? data.hjByTotal.qmldsehj-0 : 0), 2),
		// 	"jybfYnse": number.format((data.hjByTotal.jybfYnsehj? data.hjByTotal.jybfYnsehj-0 : 0), 2)
		// })
		let sksqStr = data.sksq.replace('年','-').replace('月','')
		sksqStr = sksqStr ? moment.stringToMoment(sksqStr) : ''
		let skszStr = data.sksz.replace('年','-').replace('月','')
		skszStr = skszStr ? moment.stringToMoment(skszStr) : ''
		state = this.metaReducer.sf(state, `data.list`, fromJS(data.zzsSbListByTotal))
		state = this.metaReducer.sf(state, `data.sksq`, data.sksq)
		state = this.metaReducer.sf(state, `data.sksz`, data.sksz)
		state = this.metaReducer.sf(state, `data.sksqStr`, sksqStr)
		state = this.metaReducer.sf(state, `data.skszStr`, skszStr)
		state = this.metaReducer.sf(state, `data.isFromOneself`, data.isFromOneself)
		if(data.start) state = this.metaReducer.sf(state, `data.start`, data.start)
		if(data.end) state = this.metaReducer.sf(state, `data.end`, data.end)
		return state
	}

	setStatus = (state, path, value) => {
		state = this.metaReducer.sf(state, path, value)
		return state
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }

	return { ...ret }
}