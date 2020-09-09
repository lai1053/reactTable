/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    ztgl: {
        queryList: (option) => fetch.post('/v1/yygl/accountconnect/queryPageListZt', option),//查询客户列表
        toBdz: (option) => fetch.post('/v1/dzgl/toBdz', option),//进入客户
        toDz: () => fetch.post('/v1/dzgl/toDz'),//进入代理机构
        deleteZt:(option) => fetch.post('/v1/yygl/cusAccountManager/deleteAccount', option),//删除账套
        // sendSms: (option) => fetch.post('/v1/edf/org/canModifyEnterprisePropertyForOrgManage', option),//导账判断是否有业务、财务数据
        sendSms: (option) => fetch.post('/v1/edf/org/judgeXdzGuideAccountIsPrompt', option),//导账判断是否有业务、财务数据
        init: () => fetch.post('/v1/edf/portal/init'),
        portal: () => fetch.post('/v1/edf/portal/initPortal'),
        queryUserData: () => fetch.post('/v1/yygl/cusAccountManager/getDebiter'),//
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        cancelImportAccount: (option) => fetch.post('/v1/edf/dzgl/cancelImportAccount',option),
        cancelImportAccountState: (option) => fetch.post('/v1/yygl/cusAccountManager/cancelDebitl',option),
        isCSH:(option) => fetch.post('/v1/yygl/cusAccountManager/ztcshpd',option),
        querysfxs:(option) => fetch.post('/v1/yygl/cusAccountManager/querysfxcts',option),
        getIsNeedTip:() => fetch.post('/v1/imp/auto/getIsNeedTip'),//查询是否有批量导账的操作
        plCirculation: () => fetch.post('/v1/imp/auto/getImportProgress'),//轮循批量导账处理结果
        plDelet: (option) => fetch.post('/v1/yygl/cusAccountManager/plsczt',option),//批量删除
        editCZLX: (option) => fetch.post('/v1/yygl/cusAccountManager/updateczlx',option),//修改操作类型
        upDateTip:(option) => fetch.post('/v1/yygl/cusAccountManager/updatetipzt',option),//导账成功提示不显示
        backupZt:(option) => fetch.post('/v1/yygl/account/restore/backup',option),//账套备份
        restore:(option) => fetch.post('/v1/yygl/account/restore/restore',option),//账套恢复
        reportSetFlagAsync:(option) => fetch.post('/v1/yygl/accountconnect/getCompleteStateOfReportSetFlagAsync',option),//报表未设置异步调用
        reportSetFlagResp:(option,data) => fetch.post2('/v1/yygl/accountconnect/getCompleteStateOfReportSetFlagResp',option,data),//报表未设置结果获取
        promptAsync:(option) => fetch.post('/v1/yygl/cusAccountManager/batchJudgeXdzGuideAccountIsPromptAsync',option),//批量导入判断企业是否有数据异步调用
        promptResp:(option,data) => fetch.post2('/v1/yygl/cusAccountManager/batchJudgeXdzGuideAccountIsPromptResp',option,data),//批量导入判断企业是否有数据结果获取
        batchQuery:(option) => fetch.post('/v1/edf/enumDetail/batchQuery',option),//会计制度
    }
}