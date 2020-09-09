/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    supplyData: {
        revenueType: (option) => fetch.post('/v1/biz/core/businessType/queryRevenueType', option),
        queryByCode: (option) => fetch.post('/v1/biz/core/docGenerateHabit/queryByCode', option),
        completeBatch: (option) => fetch.post('/v1/biz/scm/sa/delivery/completeBatch', option),
        completeBatchPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/completeBatch', option),
        inventory: (option) => fetch.post('/v1/ba/inventory/queryList', {}), //存货名称
        customer: (option) => fetch.post('/v1/ba/customer/queryList', option), //客户
        supplier: (option) => fetch.post('/v1/ba/supplier/queryList', option), //供应商
        queryInventory: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryInventory', option),
        department:(option) => fetch.post('/v1/ba/department/queryList', option),//部门
        project:(option) => fetch.post('/v1/ba/project/queryList', option),//项目
        findEnumList:(option) => fetch.post('/v1/ba/inventory/findEnumList', option),//获取明细
        taxRateTypes:(option) => fetch.post('/v1/edf/enumDetail/findByEnumDetailIdList', option),//获取明细
        findByEnumId:(option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option),//获取征收方式
    }
}