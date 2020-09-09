/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    periodExpenseRpt: {
        init: (option) => fetch.post('/v1/gl/report/costOfPeriod/init', option),
        query: (option) => fetch.post('/v1/gl/report/costOfPeriod/query', option),
        export: (option) => fetch.formPost('/v1/gl/report/costOfPeriod/export', option),
        print: (option) => fetch.printPost('/v1/gl/report/costOfPeriod/print', option)
    }

}
