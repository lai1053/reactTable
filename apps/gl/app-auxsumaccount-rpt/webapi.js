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
        query: (option) => fetch.post('/v1/gl/report/glauxsumrpt/query', option),
        getEnableDate: (option) => fetch.post('/v1/gl/report/gldetailrpt/getEnabledDate', {}),
        queryForAuxRpt: (option) =>fetch.post('/v1/gl/account/queryForAuxRpt', option),
        queryBaseArchives: (option) => fetch.post('/v1/ba/basearchive/queryBaseArchives',{'isContentEmpty': true}),
        share: (option) => fetch.post('/v1/gl/report/glauxsumrpt/share', option),
        print: (option) => fetch.printPost('/v1/gl/report/glauxsumrpt/print', option),
        export: (option) => fetch.formPost('/v1/gl/report/glauxsumrpt/export', option),
        getDisplayDate: (option) => fetch.post('/v1/gl/report/queryDate', {}),
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口
        getPrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/getPrintConfig', option),
        savePrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/savePrintConfig', option),
    }
}
