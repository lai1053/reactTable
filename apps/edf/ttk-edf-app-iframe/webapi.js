/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    getCode: (option) => fetch.post('/v1/edf/connector/getcodefromuc', option),
    individualQueryUrl: (option) => fetch.post('/v1/tax/sb/individual/queryUrl', option),
    getUcCode: () => fetch.post('/v1/edf/connector/getJcyyCodeFromUc'),
    init: () => fetch.post('/v1/edf/portal/init'),
    portal: () => fetch.post('/v1/edf/portal/initPortal')
}
