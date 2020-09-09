//import 'babel-polyfill'
import 'url-polyfill'
//import FastClick from 'fastclick'
import { config, start, componentFactory } from 'edf-meta-engine'
import * as edfComponents from 'edf-component'
import raf from 'raf'
import myConfig from './config'
//import registerServiceWorker from './registerServiceWorker'
// import promise from 'es6-promise'
raf.polyfill()

if (typeof(_hmt) == 'undefined') window._hmt = []
if (typeof(_maq) == 'undefined') window._maq = []

import './global/global.js'

//note-start
//note-start和note-end之间的内容用脚手架匹配，请不要再该区域书写内容，在执行ttk reset过程中会被删除
//note-end

import useBA from 'useBA'
import useEDF from 'useEDF'
import useINVOICES from 'useINVOICES'
import useSCM from 'useSCM'
import useSTOCK from 'useSTOCK'
//yygl模块
import useYYGL from 'useYYGL'
//bovms模块
import useBOVMS from 'useBOVMS'
//gl模块
import useGL from 'useGL'
const arr = [useGL, useBOVMS, useYYGL, useBA, useEDF, useINVOICES, useSCM, useSTOCK]
Promise.all(arr).then((res) => {
    let apps = {}
    // console.log('index.js---', res)
    res.forEach((item) => {
        apps = { ...apps, ...item }
    })
    if (window.singleApp) {
        const singleApp = window.singleApp
        apps = { ...apps, ...singleApp }
    }

    apps.config = (options) => {
        Object.keys(options).forEach(key => {
            const reg = new RegExp(`^${key == '*' ? '.*' : key}$`)
            Object.keys(apps).forEach(appName => {
                if (appName != 'config') {
                    if (reg.test(appName) && apps[appName].config) {
                        apps[appName].config(options[key])
                    }
                }
            })
        })
    }


    // promise.polyfill()

    apps.config({ '*': { apps } })

    config(myConfig({ apps }))

    Object.keys(edfComponents).forEach(key => {
        componentFactory.registerComponent(key, edfComponents[key])
    })

    start()
})