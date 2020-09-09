/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    bovms: {
        // 获取分页智能记忆数据
        queryMemoryPageList: option =>
            fetch.post(
                "/v1/biz/bovms/memory/queryMemoryPageList",
                option
            ),
        //获取记忆结构类别
        queryMemoryCategoryList: option =>
            fetch.post(
                "/v1/biz/bovms/memory/queryMemoryCategoryList",
                option
            ),
        //开启或者停用记忆数据
        disableMemoryState: option =>
            fetch.post(
                "/v1/biz/bovms/memory/disableMemoryState",
                option
            ),
        // 获取客户的账套信息接口；vatTaxpayer，2000010001：一般纳税人，2000010002：小规模纳税人
        queryAccount: option =>
            fetch.post("/v1/biz/bovms/common/queryAccount", option),
        // 获取全部的智能记忆数据(吴道攀)
        queryAllMemoryPageList: option =>
            fetch.post("/v1/biz/bovms/memory/queryAllMemoryPageList", option),
        deleteMemoryList: option =>
            fetch.post("/v1/biz/bovms/memory/deleteMemoryList", option),
       
    }
}