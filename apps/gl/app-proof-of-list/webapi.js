/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    docManage: {
        init: (option) => fetch.post('/v1/gl/docManage/init', option),
        query: (option) => fetch.post('/v1/gl/docManage/query', option),
        auditProof: (option) => fetch.post('/v1/gl/doc/auditBatch', option),
        reorganizeDocCode: (option) => fetch.post('/v1/gl/docManage/reorganizeDocCode', option),
        delProof: (option) => fetch.post('/v1/gl/doc/deleteBatch', option),
        unAuditBatch: (option) => fetch.post('/v1/gl/doc/unAuditBatch', option),
        initOption: (option) => fetch.post('/v1/gl/docManage/init', option),
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),
        updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option),
        delSingleDocId: (option) => fetch.post('/v1/gl/doc/delete', option),
        export: (option) => fetch.formPost('/v1/gl/docManage/export', option),
        print: (option) => fetch.printPost('/v1/gl/docManage/print', option),
        getDisplayDate: (option) => fetch.post('/v1/gl/report/queryDate', {}),
        getPrintConfig: () => fetch.post('/v1/gl/docManage/getPrintConfig', {}),
        savePrintConfig: (option) => fetch.post('v1/gl/docManage/savePrintConfig', option),
        updateNote: (option) => fetch.post('/v1/gl/doc/updateNote', option),
        initData: (option) => fetch.post('/v1/edf/column/initData', option),//初始化栏目数据
        reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细
        redRushDoc: (option) => fetch.post('/v1/gl/docManage/redRushDoc', option), //红冲凭证
        getRedRushDocPeriod: (option) => fetch.post('/v1/gl/docManage/getRedRushDocPeriod', option), //红冲默认期间
        copyDoc: (option) => fetch.post('/v1/gl/docManage/copyDoc', option), //复制凭证
        getExportConfig: (option) => fetch.post('/v1/gl/docManage/exportConfig', option),
        updateCreatorAndEditorByBatch: (option) => fetch.post('/v1/gl/doc/updateCreatorAndEditorByBatch', option),
        
    }
}
