import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, getNO} from './data'
import moment from 'moment'
import { moment as momentUtil } from 'edf-utils'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        initState.data.xdzOrgIsStop = option
        // console.log(option, initState.data, 'KKKK')
        return this.metaReducer.init(state, initState)
    }
    /**
     * @description: 页面初始化时赋值
     * @param {string} time 会计期间
     * @param {string} openFlag 是否开启存货
     * @param {string} typeFlag 存货类型id
     * @param {string} enableBOMFlag 是否启用了bom
     * @param {object} invSetInfo 账套信息 
     * @param {string} isIndustry 是否是工业型企业
     * @return: 无
    */
    load = (state, time, openFlag, typeFlag, enableBOMFlag, invSetInfo, isIndustry, pageTitle, isTips, xdzOrgIsStop) => {
        let enableDate = momentUtil.stringToMoment(time).format('YYYY-MM')
        state = this.metaReducer.sfs(state, {
            'data.form.enableDate': enableDate,
            'data.openFlag': openFlag,
            'data.typeFlag': typeFlag,
            'data.enableBOMFlag': enableBOMFlag,
            'data.currentState': fromJS(invSetInfo || {}),
            'data.Industry': isIndustry,
            'data.loading': false,
            'data.pageTitle': pageTitle,
            'data.isTips': !!isTips,
            // 'data.xdzOrgIsStop': xdzOrgIsStop
        })
        return state
    }

    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex,Map({
            id: list.size
        }))

        return this.metaReducer.sf(state, 'data.list', list)
    }

    delrow = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.list')
        const index = list.findIndex(o => {
           return  o.get('id') == id
        })
        
        if (index == -1)
            return state

        list = list.remove(index)
        return this.metaReducer.sf(state, 'data.list', list)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}