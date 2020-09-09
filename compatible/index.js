import 'babel-polyfill'
import 'url-polyfill'
import 'es5-shim'
import 'es5-shim/es5-sham'
import 'console-polyfill'
import 'fetch-ie8'
import 'babel-polyfill'
import FastClick from 'fastclick'
import { config, start, componentFactory } from 'edf-meta-engine'
import * as edfComponents from 'edf-component'
// import raf from 'raf'
import myConfig from './config'
// raf.polyfill()

if (typeof (_hmt) == 'undefined') window._hmt = []
//note-start
//note-start和note-end之间的内容用脚手架匹配，请不要再该区域书写内容，在执行ttk reset过程中会被删除

import edfx_app_root from './apps/edf/edfx-app-root/index.js'
import simplelogin from './apps/operation/ttk-edf-app-simple-login'
import ttk_edf_app_portal_min from './apps/operation/ttk-edf-app-simple-portal'
import ttk_access_app_tranreport from './apps/access/ttk-access-app-tranreport/index.js'
import ttk_access_app_tranreport_projectadjust from './apps/access/ttk-access-app-tranreport/apps/ttk-access-app-tranreport-projectadjust/index.js'
import ttk_access_app_tranreport_import from './apps/access/ttk-access-app-tranreport/apps/ttk-access-app-tranreport-import/index.js'
import ttk_access_app_tranreport_rptselect from './apps/access/ttk-access-app-tranreport/apps/ttk-access-app-tranreport-rptselect/index.js'
import ttk_access_app_tranreport_A99 from './apps/access/ttk-access-app-tranreport-A99'
import ttk_access_app_tranreport_projectadjust_A99 from './apps/access/ttk-access-app-tranreport-A99/apps/ttk-access-app-tranreport-projectadjust-A99'


const apps = {
    [edfx_app_root.name]: edfx_app_root,
    [simplelogin.name]: simplelogin,
    [ttk_edf_app_portal_min.name]: ttk_edf_app_portal_min,
    [ttk_access_app_tranreport.name]: ttk_access_app_tranreport,
    [ttk_access_app_tranreport_projectadjust.name]: ttk_access_app_tranreport_projectadjust,
    [ttk_access_app_tranreport_import.name]: ttk_access_app_tranreport_import,
    [ttk_access_app_tranreport_rptselect.name]: ttk_access_app_tranreport_rptselect,
    [ttk_access_app_tranreport_A99.name]: ttk_access_app_tranreport_A99,
    [ttk_access_app_tranreport_projectadjust_A99.name]: ttk_access_app_tranreport_projectadjust_A99
}
//note-end

//EDF模块
//财务&资产模块
//税务模块



//业务模块

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


apps.config({ '*': { apps } })

config(myConfig({ apps }))

Object.keys(edfComponents).forEach(key => {
    componentFactory.registerComponent(key, edfComponents[key])
})



start()
FastClick.attach(document.body)
