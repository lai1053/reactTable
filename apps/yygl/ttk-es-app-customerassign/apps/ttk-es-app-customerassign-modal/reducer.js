import { List, Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

const DEFAULT_COL_COUNT = 3

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        initState.data.list = option.result
        initState.data.customerList = option.customerList
        initState.data.type = option.type
        initState.data.dt = option.dt
        // initState.data.isLD = option.isLD
        // initState.data.columns = option.columns
        return this.metaReducer.init(state, initState)
    }

    // checkboxStatus = (state,rowIndex,value) => {
    //     // debugger
    //     let l = null;
    //     switch (rowIndex) {
    //         case '0':
    //             l = 0;
    //             break;
    //         case '1':
    //             l = 1;
    //             break;
    //         case '2':
    //             l = 2;
    //             break;
    //         case '3':
    //             l = 3;
    //             break;
    //     }
    //     return this.metaReducer.sf(state, 'data.list['+ l +'].isEdit',value)
    // }

    checkboxStatus1 = (state,name,value) => {
        // debugger
        let ll = null;
        switch (name) {
            case 'fp':
                ll = 'data.fpLoding'
                break;
            case 'bs':
                ll = 'data.bsLoding'
                break;
            case 'jz':
                ll = 'data.jzLoding'
                break;
            case 'cx':
                ll = 'data.cxLoding'
                break;
            case 'jzsh':
                ll = 'data.jzshLoding'
                break;
            case 'ld':
                ll = 'data.ldLoding'
                break;
        }
        return this.metaReducer.sf(state, ll, value);
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
