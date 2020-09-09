/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'
import webapi from 'webapi'
const mockData = fetch.mockData

function initMockData() {

}

export default {
    balanceSumRpt: { 
        reInitByUser: (option) => fetch.post('/v1/gl/report/balancesumrpt/reInitByUser', option),//栏目重新初始化，恢复成预置数据

        // reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),  //查询栏目
        updateWithDetail: (option) => fetch.post('/v1/gl/report/balancesumrpt/updateWithDetail', option), //更新栏目

        // updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option), //更新栏目
        queryRptList: (option) => fetch.post('/v1/gl/report/balancesumrpt/query', option),
        queryAccountList: (option) => fetch.post('/v1/gl/account/queryForAccountBooks', option),       
        queryForCurrency: (option) => fetch.post('/v1/gl/report/queryCurrency', option), 
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),    
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
        batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细 
        getDocVoucherDate: () => fetch.post('/v1/gl/doc/findMaxDocVoucherDate', {}),
        getDisplayDate: () => fetch.post('/v1/gl/report/queryDate', {}),     
        export: (option) => fetch.formPost('/v1/gl/report/balancesumrpt/export', option),
        print: (option) => fetch.printPost('/v1/gl/report/balancesumrpt/print', option),
        share: (option) => fetch.post('/v1/gl/report/balancesumrpt/share', option),
        mailShare: (option) => fetch.post('/v1/gl/report/balancesumrpt/sendShareMail', option),
        getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
        getPrintConfig: () => fetch.post('/v1/gl/report/balancesumrpt/getPrintConfig'),
        savePrintConfig: (option) => fetch.post('/v1/gl/report/balancesumrpt/savePrintConfig', option),
        queryCalcUsage: () => fetch.post('v1/gl/account/queryCalcUsage'),
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口
    }
}