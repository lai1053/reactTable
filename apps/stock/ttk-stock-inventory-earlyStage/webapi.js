/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    operation: {
        findInventoryList: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryList', list),
        findSupplierList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findSupplierList',option),
        findInventoryEnumList: () => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryEnumList'),
        initBln: (option) => fetch.post('/v1/biz/bovms/stock/qcye/initBln',option),
        initQcye: (option) => fetch.post('/v1/biz/bovms/stock/qcye/init',option), 
        updateQcye: (option) => fetch.post('/v1/biz/bovms/stock/qcye/updateQcye',option),
        cleanQcye: (option) => fetch.post('/v1/biz/bovms/stock/qcye/cleanQcye', option),
        deleteQcye: (option) => fetch.post('/v1/biz/bovms/stock/qcye/deleteQcye', option),
        init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option),
        initPeriod: () => fetch.post('/v1/biz/bovms/stock/inveset/initPeriod'),
        getInvSetByPeroid: (list) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', list),
        queryReport: (option) => fetch.post('/v1/biz/bovms/stock/report/checkaccount/query', option),
        export: (option) => fetch.formPost('/v1/biz/bovms/stock/qcye/exportZg', option), //暂估期初导出 
        templateExport: (option) => fetch.formPost('/v1/biz/bovms/stock/qcye/exportZgqcTemplate', option), //导出 
        uploadFile: (option) => fetch.post('/v1/biz/bovms/stock/qcye/importZgqcData', option), // 导入数据
    }
}