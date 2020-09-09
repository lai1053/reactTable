/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'
export default {
    calculationcost: {
        /**
         * 初始化
         */
        init: (option) => fetch.post('/v1/gl/SalesCost/calcCostAmountInit', option),
        /**
         * 保存
         */
        save: (option) => fetch.post('/v1/gl/SalesCost/saveCostAmount', option),
        /**
         * 重置
         */
        reset: (option) => fetch.post('/v1/gl/SalesCost/reCalcCostAmount', option),
        /**
        * 打印
        */
        print: (option) => fetch.printPost('/v1/gl/SalesCost/print', option),
        /**
        * 导出
        */
        export: (option) => fetch.formPost('/v1/gl/SalesCost/export', option),
    }
}