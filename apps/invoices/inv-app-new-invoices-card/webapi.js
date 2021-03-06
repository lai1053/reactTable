/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoices: {
        getHwlxcsList: (option) => fetch.post('/v1/biz/invoice/getHwlxcsList', option),
        getSlvcsList: (option) => fetch.post('/v1/biz/invoice/getSlvcsList', option),
        getSpbmList: (option) => fetch.post('/v1/biz/invoice/getSpbmList', option), // 获取商品编码
        getJsfscsList: (option) => fetch.post('/v1/biz/invoice/getJsfscsList', option),
        getFpzlcsList: (option) => fetch.get(`/v1/biz/invoice/getFpzlcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`),
        
        addJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/addJxfp', option),
        initiateAddOfJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/initiateAddOfJxfp', option), //初始化页面
        queryJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfp', option), //初始化页面
        updateJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/updateJxfp', option), //修改
        querXxfpByFphmAndFpdm: (option) => fetch.post('/v1/biz/invoice/xxfp/queryXxfpByFphmAndFpdm', option), //红冲发票明细清单查询
    
    
        addXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/addXxfp', option),
        initiateAddOfXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/initiateAddOfXxfp', option),
        updateXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/updateXxfp', option),
        queryXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/queryXxfp', option),
        getSbytcsList: (option) => fetch.get(`/v1/biz/invoice/getSbytcsList?${option || ''}`), //申报用途
        getNsrZgrdXx: (option) => fetch.post('/v1/biz/invoice/getNsrZgrdXx', option), //是否辅导期纳税人
        queryJxfpDto: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfpDto', option), //其它模块查看进项票据页面
        queryXxfpDto : (option) => fetch.post('/v1/biz/invoice/xxfp/queryXxfpDto', option), //其它模块查看销项票据页面
        queryJxfpByFphmAndFpdm: (option) => fetch.post('/v1/biz/invoice/jxfp/queryJxfpByFphmAndFpdm', option), //红冲发票明细清单查询
        getKplxcsList: (option) => fetch.get(`/v1/biz/invoice/getKplxcsList?${option}`), //获取客票类型参数列表
    
    }
}