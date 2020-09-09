/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import {
    fetch
} from 'edf-utils'


/*
const mockData = fetch.mockData

function initMockData(option) {
    let response = {}

    return response
}*/

export default {
    init: (option) => fetch.post('/v1/gl/accountPeriodBegin/init', option),
    query: (option) => fetch.post('/v1/gl/accountPeriodBegin/query', option),
    createAndUpdateBatch: (option) => fetch.post('/v1/gl/accountPeriodBegin/saveBatch', option),
    deleteAuxItem: (option) => fetch.post('/v1/gl/accountPeriodBegin/delete', option),
    updatePeriod: (option) => fetch.post('/v1/edf/org/checkAndUpdateOrgInfo', option),
    updateGuide: (option) => fetch.post('/v1/edf/menuguide/update', option)
}
