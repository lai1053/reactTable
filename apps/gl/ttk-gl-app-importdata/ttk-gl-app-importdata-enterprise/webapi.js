/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'

export default {
    importapi: {
        /**
         * 获取当前在第几步
         * 返回：           
            "step": 1 --步骤
         */
        getImpAccountStep: () => fetch.post('/v1/gl/imp/getImpAccountStep', {}),
        getIsInit: () => fetch.post('/v1/edf/org/getIsInit')        
    }    
}