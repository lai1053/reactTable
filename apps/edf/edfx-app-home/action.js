import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {  Map, fromJS } from 'immutable'
import config from './config'
import Sortable from './Sortable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.listeners = Map()
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.isScroll = false
        // this.resize()
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', this.load)
        }
        this.sortable = null
        this.load()
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.load, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.load)
        } else {
            window.load = undefined
        }
    }

    componentDidMount = () => {
        // // IE中无CustomEvent
        // (function () {
        //     if (typeof window.CustomEvent === "function") return false;
        //     function CustomEvent(event, params) {
        //         params = params || {
        //             bubbles: false,
        //             cancelable: false,
        //             detail: undefined
        //         };
        //         var evt = document.createEvent('CustomEvent');
        //         evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        //         return evt;
        //     }
        //     CustomEvent.prototype = window.Event.prototype;
        //     window.CustomEvent = CustomEvent;
        // })();
        // (function () {
        //     var throttle = function (type, name, obj) {
        //         obj = obj || window;
        //         var running = false;
        //         var func = function () {
        //             if (running) {
        //                 return;
        //             }
        //             running = true;
        //             requestAnimationFrame(function () {
        //                 obj.dispatchEvent(new CustomEvent(name));
        //                 running = false;
        //             });
        //         };
        //         if (obj.addEventListener) {
        //             obj.addEventListener(type, func);
        //         } else if (obj.attachEvent) {
        //             obj.attachEvent(type, func);
        //         }
        //     };
        //     throttle("resize", "optimizedResize");
        // })();
        // // 注册 resize 事件
        // if (window.addEventListener) {
        //     window.addEventListener('optimizedResize', this.resize)
        // } else if (window.attachEvent) {
        //     window.attachEvent('optimizedResize', this.resize)
        // }
    }

    load = async (param) => {
        let dataState = {}
        let response = await this.webapi.desktop.initApp()
        let appList = this.metaAction.gf('data.desktopAppList')
        if(appList) appList = appList.toJS()
        response.sort(function(a, b) {
            return a.showIndex - b.showIndex
        })
        response.forEach((item, index) => {
                item.showIndex = index
                let nullData = {}
                // data[item.appName] = null
                dataState[item.appName] = {
                    empty: true
                }
        })
        //---loadData
        let period = this.transPeriod()
        let isExpire = this.component.props.isExpire
        // this.metaAction.sfs({
        //     'data.other.isExpire': isExpire,
        //     'data.other.period': period
        // })
        let data = await this.webapi.desktop.initAppData(period)
        // let dataState = this.metaAction.gf('data.other.dataState')
        let keys = Object.keys(dataState)
        for(let i = 0 ; i < keys.length ; i++) {
            if(keys[i] == 'ttk-edf-app-desktop-init') continue
            if(keys[i] == 'ttk-edf-app-article' || keys[i] == 'ttk-taxapply-app-desktop-electronic-tax') {
                dataState[keys[i]].empty = false
                continue
            }
            if(data[keys[i]]) {
                dataState[keys[i]].empty = data[keys[i]].empty || false
            }
        }
        // -----loadData
        // let data = {}
        // let dataState = {}
        // this.loadData()
        // let appList = this.metaAction.gf('data.desktopAppList')
        // if(appList) appList = appList.toJS()
        // response.sort(function(a, b) {
        //     return a.showIndex - b.showIndex
        // })
        // response.forEach((item, index) => {
        //     if(item.appName == 'ttk-edf-app-desktop-init'){
        //         item.showIndex = index
        //         let nullData = {}
        //         // data[item.appName] = null
        //         // dataState[item.appName] = {
        //         //     empty: true
        //         // }
        //     }
         
        // })
        // response = this.loadPanel(response)
        let json = {
            'data.desktopAppList': fromJS(response),
            'data.other.dataState': dataState,
            'data.other.mathRandom': Math.random(),
            'data.data': data,
            'data.other.isExpire': isExpire,
            'data.other.period': period
        }
        this.metaAction.sfs(json)
        // this.move()
    }

    loadData = async () => {
        let period = this.transPeriod()
        let systemDate = this.transSystemDate()
        this.metaAction.sfs({
            'data.other.period': period,
            'data.other.systemDate': systemDate
        })
        let data = await this.webapi.desktop.initAppData(period)
        let dataState = this.metaAction.gf('data.other.dataState')
        let keys = Object.keys(dataState)
        for(let i = 0 ; i < keys.length ; i++) {
            if(keys[i] == 'ttk-edf-app-desktop-init') continue
            if(keys[i] == 'ttk-edf-app-article' || keys[i] == 'ttk-taxapply-app-desktop-electronic-tax') {
                dataState[keys[i]].empty = false
                continue
            }
            if(data[keys[i]]) {
                dataState[keys[i]].empty = data[keys[i]].empty || false
            }
        }
        // dataState['app-home-business-state'].empty = true
        this.metaAction.sfs({
            'data.other.dataState': dataState,
            'data.data': data,
            'data.other.mathRandom': Math.random()
        })
        // this.move()
    }

    //判断app位置是否变化
    isReload = (appList, response) => {
        if(!appList) return false
        for(let i = 0 ; i < appList.length ; i++) {
            if(response[i] && (appList[i].appName != response[i].appName)) {
                return false
            }else if(!response[i]){
                return true
            }
        }
        return true
    }

    transPeriod = () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let periodParam = {}
        let arr = currentOrg.periodDate.split('-')
        periodParam.year = arr[0]
        periodParam.period = arr[1]
        // let currentOrgTime = new Date(currentOrg.enabledYear + '-' + currentOrg.enabledMonth).getTime()
        // let systemTime = new Date().getTime()
        // if(currentOrgTime > systemTime) {
        //     periodParam.period = currentOrg.enabledMonth
        //     periodParam.year = currentOrg.enabledYear
        // }else {
        //     periodParam.year = new Date().getFullYear()
        //     periodParam.period = new Date().getMonth() + 1
        // }
        return periodParam
    }

    transSystemDate = () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let systemDateParam = {}
        if( currentOrg.systemDate ) {
            let arr = currentOrg.systemDate.split('-')
            systemDateParam.year = arr[0]
            systemDateParam.period = arr[1]
        }
        return systemDateParam
    }

    //绑定move事件
    move = () => {
        let that = this
        let grid = document.querySelector('.edfx-app-home-content')
        if (!grid)
            return setTimeout(() => {
                this.move()
            }, 0)
        this.sortable = new Sortable(grid, {
            animation:500,
            onEnd: function(evt) {
                that.moveEnd(evt)
            }
        })
    }
    componentWillUpdate = () => {

    }
    //拖动结束事件
    moveEnd = async (evt) => {
        let newIndex = evt.newIndex
        let oldIndex = evt.oldIndex
        let appList = await this.metaAction.gf('data.desktopAppList').toJS()
        for(let i = 0; i < appList.length ; i++) {
            if(appList[i].showIndex == oldIndex) {
                appList[i].showIndex = newIndex
                continue
            }
            if(newIndex < oldIndex) {
                if(appList[i].showIndex >= newIndex && appList[i].showIndex < oldIndex) {
                    appList[i].showIndex++
                }
            }else if(newIndex > oldIndex) {
                if(appList[i].showIndex <= newIndex && appList[i].showIndex > oldIndex) {
                    appList[i].showIndex--
                }
            }
        }
        let response = await this.webapi.desktop.saveAppList(appList)
        appList = appList.sort((a, b) => {
            return a.showIndex - b.showIndex
        })
        this.metaAction.sfs({
            'data.desktopAppList': fromJS(appList),
            'data.other.mathRandom': Math.random()
        })
        // this.move()
        // this.testBorder()
    }
    // testBorder = () => {
    //     let DOM = document.querySelector('.edfx-app-home-content')
    //     if(!DOM) {
    //         return setTimeout(() => {this.testBorder()}, 500)
    //     }
    //     let base = 0
    //     let arr = []
    //     DOM = DOM.children
    //     for(let i = 0 ; i < DOM.length ; i++ ){
    //         let ratio = parseInt(DOM[i].getAttribute('cust_ratio'))
    //         if(base < 4) {
    //             base += ratio
    //             arr.push(i)
    //         }else if(base >= 4){
    //             base = ratio
    //             arr = []
    //             arr.push(i)
    //         }
    //     }
    //     for(let i = 0 ; i < DOM.length ; i++) {
    //         i < arr[0] ? DOM[i].style.paddingBottom = '10px' : DOM[i].style.paddingBottom = '0px'
    //     }
    // }
    //缩放
    zoom = async (index, type) => {
        if(type == 'open') {
            this.sortable.destroy()
        }else {
            // this.move()
        }
        let DOM = document.querySelector('.edfx-app-home-content')
        if(!DOM) return
        DOM = DOM.children
        if( type == 'open') {
            this.metaAction.sf('data.other.isMax', true)
            for(let i = 0 ; i < DOM.length ; i++ ){
                DOM[i].style.display = 'none'
                if(i == index) {
                    DOM[i].className = 'zoom'
                    DOM[i].style.display = 'block'
                }
            }
        }else {
            this.metaAction.sf('data.other.isMax', false)
            for(let i = 0 ; i < DOM.length ; i++ ){
                DOM[i].style.display = 'block'
                if(i == index) {
                    DOM[i].setAttribute('class', '')
                }
            }
        }
    }
    //resize判断分辨率
    resize = () => {
        let isMax = this.metaAction.gf('data.other.isMax')
        if(!isMax) {
            this.metaAction.sf('data.other.mathRandom', Math.random())
            // this.move()
        }
    }
    //计算宽度
    calculateWidth = (num) => {
        let base = window.innerWidth < 1270 ? 3 : 4
        let ratio = ''
        if (base == 4) {
            switch (num) {
                case 1:
                    ratio = '25%'
                    break;
                case 2:
                    ratio = '50%'
                    break;
                case 3:
                    ratio = '75%'
                    break;
                case 4:
                    ratio = '100%'
                    break;
            }
        } else if (base == 3) {
            switch (num) {
                case 1:
                    ratio = '33.3333333%'
                    break;
                case 2:
                    ratio = '66.666666%'
                    break;
                case 3:
                    ratio = '100%'
                    break;
                case 4:
                    ratio = '100%'
                    break
            }
        }
        // return { width: ratio}
       return { width: 'calc('+ratio+' - 10px)'}
    }
    addPanelEventListener = (eventName, appName, handler) => {
        this.injections.reduce('addEventListener', eventName, appName, handler)
        eventName = eventName + '_' + appName
        if (!this.listeners.get(eventName)) {
            this.listeners = this.listeners.set(eventName, handler)
        }
    }
    removePanelEventListener = (eventName) => {
        this.injections.reduce('removeEventListener', eventName)
        this.listeners = Map()
    }
    //判断panel是否已都占位
    loadPanel = (response) => {
        let top = 94,
            base = 320,
            screenHeight = document.body.clientHeight,
            line = Math.ceil((screenHeight - top) / base),
            // ratio = window.innerWidth < 1280 ? 3 : 4,
            ratio = 4,
            count = 0
        for(let i = 0 ; i < response.length ; i++) {
            count += 2 || response[i].widthRatio
            if(count <= (ratio * line)) {
                response[i].enterScreen = true
            }else {
                response[i].enterScreen = false
            }
        }
        return response
    }
    //懒加载
    desktopScroll = () => {
        if(this.isScroll) return
        this.isScroll = true
        this.isEnterScreen()
    }
    //判断Applist中APP是否在屏幕内
    isEnterScreen = async () => {
        let appList = this.metaAction.gf('data.desktopAppList')
        if(appList) {
            appList = appList.toJS()
        }
        let list = []
        let DOM = document.querySelector('.edfx-app-home-content')
        let screenHeight = document.documentElement.clientHeight
        if(!DOM) return
        DOM = DOM.children
        for(let i = 0 ; i < DOM.length ; i++ ){
            let appName = DOM[i].getAttribute('cust_appname')
            let top = DOM[i].getBoundingClientRect().top
            if(top < screenHeight) {
                let item = appList.find((o) => o.appName == appName)
                if(!item.enterScreen) {
                    item.enterScreen = true
                    list.push(appName)
                }
            }
        }
        this.injections.reduce('enterScreen', list)
        this.metaAction.sf('data.desktopAppList', fromJS(appList))
        this.isScroll = false
    }
    //判断是否需要滤镜
    isFilterNeeded = () => {
        return 'grayFilter'
    }
    //设置灰色
    mouseOverEvent = (empty,appName) => {
        if(!empty) return 
        if(appName == 'app-home-receive-pay' || appName == 'app-home-business-state' ||  appName == 'ttk-scm-home-invoice') {
            // this.injections.reduce('setHighlight', appName)
            this.setHighlight(appName)
        }else{
            return
        }
    }
    mouseLeaveEvent = (empty,appName) => {
        if(!empty) return 
        if(appName == 'app-home-receive-pay' || appName == 'app-home-business-state' ||  appName == 'ttk-scm-home-invoice') {
            // this.injections.reduce('setGray', appName)
            this.setGray( appName)
        }else{
            return
        }
    }
    //首页卡片遮罩
    setGray = (appName, movement) => {
        let listener = this.listeners.get(`onMouseOver_${appName}`)
        if (listener) {
            setTimeout(() => listener('out'), 16)
        }
    }

    setHighlight = (appName, movement) => {
        let listener =  this.listeners.get(`onMouseOver_${appName}`)
        if (listener) {
            setTimeout(() => listener('hover'), 16)
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
