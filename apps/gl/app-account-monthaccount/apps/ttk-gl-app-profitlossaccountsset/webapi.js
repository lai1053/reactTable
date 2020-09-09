/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'
export default {
    profitlossaccountsset: {
        /**
         * 初始化方法         
         */
        init: (option) => fetch.post('/v1/gl/GlForeignExchangeGainOrLossSet/queryAccountSetInfo', option),
        /**
         * 科目设置保存
         */
        save: (option) => fetch.post('/v1/gl/GlForeignExchangeGainOrLossSet/saveAccountSetInfo', option),
        /**
         * 重置
         */
        reset: (option) => fetch.post('/v1/gl/GlForeignExchangeGainOrLossSet/resetAccountSet', option)
    }
   
}