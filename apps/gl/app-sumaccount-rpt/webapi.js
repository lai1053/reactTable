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
        // reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        reInitByUser: (option) => fetch.post('/v1/gl/report/glsumrpt/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),  //查询栏目
        // updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option), //更新栏目
        init: (option) => fetch.post('/v1/gl/report/glsumrpt/init', option),
        save: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细 
        updateWithDetail: (option) => fetch.post('/v1/gl/report/glsumrpt/updateWithDetail', option), //更新栏目

        getList: (option) => fetch.post('/v1/gl/report/glsumrpt/getDataNew', option),
        // getList: (option) => fetch.post('/v1/gl/report/glsumrpt/query', option),
        queryForRpt: (option) => fetch.post('/v1/gl/account/queryForRpt', option),
        export: (option) => fetch.formPost('/v1/gl/report/glsumrpt/exportNew', option),
        print: (option) => fetch.printPost('/v1/gl/report/glsumrpt/printNew', option),
        weixinShare: (option) => fetch.post('/v1/gl/report/glsumrpt/shareNew', option),
        getDisplayDate: (option) => fetch.post('/v1/gl/report/queryDate', {}),
        mailShare: (option) => fetch.post('/v1/gl/report/glsumrpt/sendShareMailNew', option),
        getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
        haveData: (option) => fetch.post('/v1/gl/report/glsumrpt/haveData', option),
        queryAccountList: (option) => fetch.post('/v1/gl/account/queryForAccountBooks', option), 
        getPrintConfig: (option) => fetch.post('/v1/gl/report/glsumrpt/getPrintConfig', option),
        getExportConfig: (option) => fetch.post('/v1/gl/report/glsumrpt/getExportConfig', option),
        savePrintConfig: (option) => fetch.post('/v1/gl/report/glsumrpt/savePrintConfig', option), 
        saveExportConfig: (option) => fetch.post('/v1/gl/report/glsumrpt/saveExportConfig', option), 
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        queryCalcUsage: () => fetch.post('v1/gl/account/queryCalcUsage'),  
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