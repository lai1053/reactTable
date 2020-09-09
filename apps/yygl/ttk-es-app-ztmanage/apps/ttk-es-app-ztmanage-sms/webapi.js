/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    msg: {
        sendMsg: (option) => fetch.post('/v1/edf/captcha/fetch', option),//发送短信，{"mobile":"13683194950","smsType":2,"requestUrl":"xdz.aierp.cn"}
        //validateMsg: (option) => fetch.post('/v1/edf/captcha/validate', option),//短信验证，{"captcha":"529212","mobile":18766393703,"sign":""}
        validateMsg: (option) => fetch.post('/v1/edf/connector/validateSmsCodeUc', option),//短信验证，参数{"mobile":"18801613981","smsCode":"610240"}
        getImgCode:()=>fetch.post('/v1/edf/captcha/generate')
    }
}