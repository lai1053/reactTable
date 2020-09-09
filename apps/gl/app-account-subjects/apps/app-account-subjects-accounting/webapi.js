/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    query: {
        //自定义档案列表
        userdefinearchive: (option) => fetch.post('v1/ba/userdefinearchive/queryListDataByCalcName', option),
        //系统预制辅助核算数据
        calcDict: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),

    }
}
