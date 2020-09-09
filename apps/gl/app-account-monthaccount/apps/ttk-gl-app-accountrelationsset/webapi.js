/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'
export default {
    accountrelationsset: {
        /**
         * 科目对应设置，界面初始化方法
         * {"year":2019,"month":7}
         */
        init: (option) => fetch.post('/v1/gl/SalesCost/accountSetInit', option),
        /**
         * 科目对应设置保存
         */
        save: (option) => fetch.post('/v1/gl/SalesCost/accountSetSave', option),
        /**
         * 获取辅助项
         */
        allArchive: (option, title) => fetch.post('v1/ba/basearchive/queryBaseArchives', option)
    }
   
}