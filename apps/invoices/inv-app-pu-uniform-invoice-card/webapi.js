/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoice: {
        addJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/addJxfp', option),
        getSlvcsList: (option) => fetch.post('/v1/biz/invoice/getSlvcsList', option), //获取税率
        initiateAddOfJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/initiateAddOfJxfp', option), //初始化页面
        queryJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfp', option), //初始化页面
        updateJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/updateJxfp', option), //修改
        getNsrZgrdXx: (option) => fetch.post('/v1/biz/invoice/getNsrZgrdXx', option), //是否辅导期纳税人
        getSpbmList: (option) => fetch.post('/v1/biz/invoice/getSpbmList', option),
        getSbytcsList: (option) => fetch.get(`/v1/biz/invoice/getSbytcsList?${option || ''}`), //申报用途
        queryJxfpDto: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfpDto', option), //其它模块查看票据页面
        queryJxfpByFphmAndFpdm: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfpByFphmAndFpdm', option), //红冲发票明细清单查询
    }
}