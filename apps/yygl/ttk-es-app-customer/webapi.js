/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'


export default {
    customer: {
        queryCustomer: (option) => fetch.post('/v1/yygl/khzl/getPtkhxxList', option),//查询客户列表
        downLoadNSRXX:(option) => fetch.post('/v1/yygl/khzl/getNsrxx',option),//下载纳税人信息
        getNsrxxState:(option,date) => fetch.post2('/v1/yygl/khzl/getNsrxxAsyncStatus',option,date),//下载纳税人信息状态
        areaQuery: (option) => fetch.post('/v1/edf/area/query', option),//地区查询
        stopCustomer:(option) => fetch.post('/v1/yygl/khzl/enable',option),//启用停用客户
        delCustomer:(option) => fetch.post('/v1/yygl/khzl/delete',option),//删除客户
        queryPSB:(option) => fetch.post('/v1/dataapi/jcdz/enableTicketHolder',option),
        queryDZSWJ: (option) => fetch.post('/v1/tax/ysdj/getDzsjUrl ',option),//电子税局接口
        exportCustomer:(option) => fetch.formPost('/v1/yygl/khzl/exportOrgInfo',option),//导出客户
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        getNsrxx: (option) => fetch.post('/v1/yygl/khzl/getNsrxx',option),
        getNsrxxAsyncStatusHasReturn: (option) => fetch.post('/v1/yygl/khzl/getNsrxxAsyncStatusHasReturn',option),
        cxgpzszt: (option) => fetch.post('/v1/yygl/khzl/cxgpzszt',option),
        getImportAsyncStatusNew: (option) => fetch.post('/v1/yygl/khzl/getImportAsyncStatusNew',option),
        querySB:(option) => fetch.post('/v1/tax/ysdj/getSbfglUrl',option),//社保管理接口
        getCustomerForZljj:(option) => fetch.post('/v1/jcymsync/getCustomerForZljj',option),//资料交接接口
        getUserMenuBtnAuthByToken:(option) => fetch.post('/v1/yygl/roleAuth/getUserMenuBtnAuthByToken',option),//资料交接接口
        checkOutGSMM:(option) => fetch.post('/v1/yygl/khzl/checkPwd4PrivateTax',option),//个税密码校验
        updateGSMMStatus:() => fetch.post('/v1/yygl/khzl/getCheckResult4PrivateTax'),//更新个税密码状态
        queryCustomerZtCnt:() => fetch.post('/v1/yygl/khzl/getCustomerZtCnt'),//查询机构下的正常客户数量
        query: (id) => fetch.post('/v1/yygl/khzl/queryById', id),
    }
}