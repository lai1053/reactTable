/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    //为了简化代码接口名称与T+接口保持一致
    configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
    configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
    common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用 自定义url
    supplierQueryMappingList: (option) => fetch.post('/v1/ba/supplier/queryMappingList', option),//查询列表数据
    supplierSetMapping: (option) => fetch.post('/v1/ba/supplier/setMapping', option),//修改
    
    consumerQueryMappingList: (option) => fetch.post('/v1/ba/customer/queryMappingList', option),//查询列表
    consumerSetMapping: (option) => fetch.post('/v1/ba/customer/setMapping', option),//修改
    
    departmentQueryMappingList: (option) => fetch.post('/v1/ba/department/queryMappingList', option),//查询配置
    departmentSetMapping: (option) => fetch.post('/v1/ba/department/setMapping', option),//查询配置
    
    inventoryQueryMappingList: (option) => fetch.post('/v1/ba/inventory/queryMappingList', option),//查询配置
    inventorySetMapping: (option) => fetch.post('/v1/ba/inventory/setMapping', option),//查询配置
    
    itemQueryMappingList: (option) => fetch.post('/v1/ba/project/queryMappingList', option),//查询配置
    itemSetMapping: (option) => fetch.post('/v1/ba/project/setMapping', option),//查询配置
    
    personQueryMappingList: (option) => fetch.post('/v1/ba/person/queryMappingList', option),//查询配置
    personSetMapping: (option) => fetch.post('/v1/ba/person/setMapping', option),//查询配置

    common: (url, option, options) => fetchCors.post(url, option, options),//带url的跨域通用接口
    ruleGet: (option) => fetch.post('/v1/biz/scm/archival/account/rule/get', option),//设置
    updateStarCode: (option) => fetch.post('/v1/biz/scm/archival/account/rule/updateStarCode', option),
    

}