/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'

export default {
    init: (option) => fetch.post('/v1/gl/accountPeriodBegin/init', option),
    query: (option) => fetch.post('/v1/gl/accountPeriodBegin/query', option),
    createAndUpdateBatch: (option) => fetch.post('/v1/gl/accountPeriodBegin/saveBatch', option),
    deleteAuxItem: (option) => fetch.post('/v1/gl/accountPeriodBegin/delete', option),
    updatePeriod: (option) => fetch.post('/v1/edf/org/checkAndUpdateOrgInfo', option),
    updateGuide: (option) => fetch.post('/v1/edf/menuguide/update', option),
    clearImportDate: (option) => fetch.post('/v1/gl/accountPeriodBegin/clearImportDate', option),
    batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细
    setFinish: () => fetch.post('/v1/gl/accountPeriodBegin/setFinish', {}),
  	cashflowstatement: {
    		save: (option) => fetch.post('/v1/gl/report/cashFlowStatement/savePeriodBegin', option),
    		init: (option) => fetch.post('/v1/gl/report/cashFlowStatement/init', option),
    		periodBeginInit: () => fetch.post('/v1/gl/report/cashFlowStatement/periodBeginInit', {}),
        resetCashFlowPeriodBegin: () => fetch.post('/v1/gl/report/cashFlowStatement/resetCashFlowPeriodBegin', {})
    },
    setNotShowNextTime : () => fetch.post('/v1/gl/accountPeriodBegin/setNotShowNextTime'),//设置期初试算平衡提示框下次不在显示接口
    export: (option) => fetch.formPost('/v1/gl/accountPeriodBegin/export', option),
    getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
    setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option)
}
