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
        //query: (option) => fetch.post('/v1/report/query', option)
        query: (option) => fetch.post('/v1/gl/report/gldetailauxrpt/query', option),
        queryForAuxRpt: (option) =>fetch.post('/v1/gl/report/gldetailauxrpt/queryForAccount', option),
        queryAccountList: (option) => fetch.post('/v1/gl/account/queryForAccountBooks', option),
        queryBaseArchives: (option) => fetch.post('/v1/ba/basearchive/queryBaseArchives',{'isContentEmpty': true}),
        share: (option) => fetch.post('/v1/gl/report/gldetailauxrpt/share', option),
        print: (option) => fetch.printPost('/v1/gl/report/gldetailauxrpt/print', option),
        export: (option) => fetch.formPost('/v1/gl/report/gldetailauxrpt/export', option),
        getDisplayDate: (option) => fetch.post('/v1/gl/report/queryDate', {}),
        getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
        queryForCurrency: (option) => fetch.post('/v1/gl/report/queryCurrency', option),
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        hasAuxRecords: (option) => fetch.post('/v1/gl/hasAuxRecords', option),//打印导出全部之前的校验接口
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
    }
}