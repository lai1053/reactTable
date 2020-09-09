/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dateCard: {
        queryParam:  () => fetch.post('/v1/biz/scm/st/rdrecord/queryParam'),
        produceAccordToSalesAndCreateRecord: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/produceAccordToSalesAndCreateRecord', option), //以销定产生成材料出库单	
        deleteAndCreateRecord: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/deleteAndCreateRecord', option), //删除旧的(以销定产生成的)材料出库单，并（通过以销定产）生成新的材料出库单
        isNeedReCalcCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/product/isNeedReCalcCost', option),//是否需要成本计算
        reCalcCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/reCalcCost', option),
        isNeedMaterCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/isNeedReCalcCost', option), //是否需要成本计算 -- 产成品直接材料
        produceToSales: (option) => fetch.post('/v1/biz/scm/st/rdrecord/product/produceAccordToSales', option),// 是否已经存在以销定产入库单
        delProduceToSales: (option) => fetch.post('/v1/biz/scm/st/rdrecord/product/deleteAndProduceAccordToSales', option),// 删除已有的入库单
        totalAndAmount: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/totalAndAmount', option), // 产成品直接材料合计
    }
}