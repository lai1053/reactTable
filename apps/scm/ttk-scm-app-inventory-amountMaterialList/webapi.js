/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dateCard: {
        queryInventory: (option) => fetch.post('/v1/ba/inventory/queryList', option), // 存货分类（选择原料生成/选择产成品生成)
        totalAndAmount: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/totalAndAmount', option), // 产成品直接材料合计
        selectMaterial: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/loadSelectedMaterialsDetail', option), // 选择原材料
        produceToSales: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/produceAccordToSales', option), //配置原料
        loadPeriodEndData: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/loadPeriodEndData', option),// 选择存货带出期末库存金额和数量
        raAcCrMaterials: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/ratioAccountCreateMaterials', option), // 按比例核算创建材料出库单    确定
        queryMaterialPro: (option) => fetch.post('v1/biz/scm/st/rdrecord/loadMaterialInventoryList', option),// 存货分类（选择原料生成/）
    },
    queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option)
}