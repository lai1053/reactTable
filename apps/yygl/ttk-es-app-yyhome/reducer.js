import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

var listeners = Map()

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    initEchartList = (state, option) => {
        return this.metaReducer.sf(state, 'data.chartData', fromJS(option))
    }
    initTaxCalendar = (state, response) => {
        return this.metaReducer.sf(state, 'data.taxCalendar', fromJS(response))
    }

    loadPersonList = (state, personList) => {
        let list = fromJS(personList)

        let person = { id: -1, name: '全部' }

        list = list.insert(0, Map(person))

        return this.metaReducer.sf(state, 'data.other.userArr', list)
    }

    loadList = (state, list, page) => {
        let isShow = [];
        
        for (var i = 0; i < list.length; i++) {
            if(list[i].zq){
                let temp = {};
                if(list[i].zq != '未建账'){
                    // let year = list[i].zq.substr(0, 4),
                    // month = parseInt(list[i].zq.substr(4, list[i].zq.length - 4))
                    // list[i].zq = year + '年' + month + '月'
                    temp.isShow = true
                    isShow.push(temp)
                }else{
                    temp.isShow = false
                    isShow.push(temp)
                }
            }
        }
        // console.log('我是建账按钮',isShow)
        state = this.metaReducer.sf(state, 'data.list', fromJS(list))
        state = this.metaReducer.sf(state,'data.jzy',isShow)
        return this.metaReducer.sf(state, 'data.page', fromJS(page))
    }

    searchChange = (state, value) => {
        return this.metaReducer.sf(state, 'data.listSearchValue.orgName', value)
    }

    onPanelChange = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.calendarYM', value)
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
	}

    showChange = (state,index,value) => {
        // debugger
      let l = +index
        return this.metaReducer.sf(state, 'data.jzy['+ l +'].isShow',value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
