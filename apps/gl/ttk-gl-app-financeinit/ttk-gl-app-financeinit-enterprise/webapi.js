/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'

export default {
    financeinit: {
        /**
         * 查询初始化状态接口
         * 返回：
            "isFinish": false, --true:完成 false:未完成
            "step": 1 --步骤
         */
        queryInitState: () => fetch.post('/v1/gl/accountPeriodBegin/queryInitState', {})
    }    
}