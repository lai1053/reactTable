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
    auxBalanceSumRpt: {       
        queryRptList: (option) => fetch.post('/v1/gl/report/balanceauxrpt/query', option),
        queryAccountList: (option) => fetch.post('/v1/gl/account/queryForAccountBooks', option),
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
        export: (option) => fetch.formPost('/v1/gl/report/balanceauxrpt/export', option),
        print: (option) => fetch.printPost('/v1/gl/report/balanceauxrpt/print', option),
        query: (option) => fetch.post('/v1/gl/report/glauxsumrpt/query', option),       
        getDocVoucherDate: () => fetch.post('/v1/gl/doc/findMaxDocVoucherDate', {}),  
        getDisplayDate: () => fetch.post('/v1/gl/report/queryDate', {}),           
        queryBaseArchives: (option) => fetch.post('/v1/ba/basearchive/queryBaseArchives', option),        
        share: (option) => fetch.post('/v1/gl/report/balanceauxrpt/share', option),
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口
        getPrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/getPrintConfig', option),
        savePrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/savePrintConfig', option), 
        
    }
}