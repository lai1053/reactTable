/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'

const mockData = fetch.mockData

function initMockData() {

}

export default {

    person: {
        save: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细 
       
        reInitByUser: (option) => fetch.post('/v1/gl/report/gldetailrpt/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        // reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),  //查询栏目
        // updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option), //更新栏目
        updateWithDetail: (option) => fetch.post('/v1/gl/report/gldetailrpt/updateWithDetail', option), //更新栏目
        init: () => fetch.post('/v1/gl/report/glsumrpt/init',{}),
        getList: (option) => fetch.post('/v1/gl/report/gldetailrpt/query', option),
        getEnableDate: (option) => fetch.post('/v1/gl/report/gldetailrpt/getEnabledDate', {}),
        queryForCurrency: (option) => fetch.post('/v1/gl/report/gldetailrpt/queryForCurrency', option),
        queryForAccount: (option) => fetch.post('/v1/gl/report/gldetailrpt/queryForAccount', option),
        export: (option) => fetch.formPost('/v1/gl/report/gldetailrpt/export', option),
        print: (option) => fetch.printPost('/v1/gl/report/gldetailrpt/print', option),
        share: (option) => fetch.post('/v1/gl/report/gldetailrpt/share', option),
        mailShare: (option) => fetch.post('/v1/gl/report/gldetailrpt/sendShareMail', option),
        getDisplayDate: (option) => fetch.post('/v1/gl/report/queryDate', {}),
        getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
        queryBaseArchives: (option) => fetch.post('/v1/gl/account/queryBaseArchives', option),
        getPrintConfig: (option) => fetch.post('/v1/gl/report/gldetailrpt/getPrintConfig', option),
        savePrintConfig: (option) => fetch.post('/v1/gl/report/gldetailrpt/savePrintConfig', option),
        queryCalcUsage: () => fetch.post('v1/gl/account/queryCalcUsage'),
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        queryAccountList: (option) => fetch.post('/v1/gl/account/queryForAccountBooks', option),
        exportAsync: (option) => fetch.post('/v1/gl/report/gldetailrpt/exportAsync', option),
        exportAsyncStatus: (option) => fetch.post('/v1/gl/report/gldetailrpt/exportAsyncStatus', option),
        exportAsyncResult: (option) => fetch.formPost('/v1/gl/report/gldetailrpt/exportAsyncResult', option),
        printAsync: (option) => fetch.post('/v1/gl/report/gldetailrpt/printAsync', option),
        printAsyncStatus: (option) => fetch.post('/v1/gl/report/gldetailrpt/printAsyncStatus', option),
        PrintAsyncResult: (option) => fetch.printPost('/v1/gl/report/gldetailrpt/printAsyncResult', option),
        queryAccountDepth: () => {
            return {
                result: true,
                values: [
                    { key: '1', value: '1' },
                    { key: '2', value: '2' },
                    { key: '3', value: '3' },
                    { key: '4', value: '4' },
                    { key: '5', value: '5' }
                ]

            }
        },
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口
        orgparameter: (option) => fetch.post('/v1/edf/orgparameter/query', option),
		orgparameterCreate: (option) => fetch.post('/v1/edf/orgparameter/createAutoSetId', option),
        orgparameterUpdate: (option) => fetch.post('/v1/edf/orgparameter/update', option),

    }
}