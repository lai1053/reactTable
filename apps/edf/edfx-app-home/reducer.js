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
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    resize = (state, option) => {
        state = this.metaReducer.sf(state, 'data.ratio', option)
        return state
    }

    setGray = (state, appName, movement) => {
        let listener = listeners.get(`onMouseOver_${appName}`)
        if (listener) {
            setTimeout(() => listener('out'), 16)
        }
        return state
    }

    setHighlight = (state, appName, movement) => {
        let listener = listeners.get(`onMouseOver_${appName}`)
        if (listener) {
            setTimeout(() => listener('hover'), 16)
        }
        return state
    }

    enterScreen = (state, appList) => {
        for(let i = 0 ; i < appList.length ; i++) {
            let listener = listeners.get('onEnter' + '_' +  appList[i])
            if (listener) {
                setTimeout(() => listener(), 16)
            }
        }
        return state
    }
    addEventListener = (state, eventName, appName, handler) => {
        eventName = eventName + '_' + appName
        if (!listeners.get(eventName)) {
            listeners = listeners.set(eventName, handler)
        }
        return state
    }

    removeEventListener = (state, name) => {
        listeners = Map()
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}