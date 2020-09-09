/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    asset: {
        /**
         * 初始化
         */
        init: () => fetch.post('/v1/gl/asset/imp/init', {}),
        /**
         * 查询
         */
        queryList: () => fetch.post('/v1/gl/asset/imp/query', {}),  
        /**
         * 删除
         */
        delete: (option) => fetch.post('/v1/gl/asset/imp/delete', option),    
        /**
         * 资产导入
         * */    
        createList: (option) => fetch.post('/v1/gl/asset/imp/createList', option),       
        /**
            * 设置步骤
        */
        setImpAccountStep: (option) => fetch.post('/v1/gl/imp/setImpAccountStep', option),
        /**
         * 导入完成更新
         */
        importAccountFinished: (option) => fetch.post('/v1/edf/org/ImportAccountFinished', option),
        /**
         * 获取当前最大结账期间
         */
        getMaxClosingPeriod: () => fetch.post('/v1/edf/perioddate/getMaxClosingPeriod', {}),
        /**
         * 清理凭证期初数据
         */
        clearCertificate: () => fetch.post('/v1/gl/imp/clearCertificate', {}),
        
    }
}
