/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, fetchCors, tree} from 'edf-utils'

export default {
    plData:{
        plCirculation: (option) => fetch.post('/v1/imp/auto/getImportProgress',option)//处理结果接口
    }
}
