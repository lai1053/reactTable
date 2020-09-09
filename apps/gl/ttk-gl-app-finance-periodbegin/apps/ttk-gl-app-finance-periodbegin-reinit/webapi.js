/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    periodBegin: {
        reInitPeriodBegin: (option) => fetch.post('/v1/gl/accountPeriodBegin/reInitPeriodBegin', option),
        checkPassword: (option) => fetch.post('/v1/edf/user/reinitOrgVolidePassword', option)
    }
}
