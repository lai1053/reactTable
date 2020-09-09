import {
    fetch
} from 'edf-utils'

export default {
    query: (option) => fetch.post('/v1/gl/account/query', option),
    delete: (option) => fetch.post('/v1/gl/account/delete', option),
    existAccountRelation: (option) => fetch.post('/v1/ba/basearchive/existAccountRelation', option),
    // batchAdd: (option) => fetch.post('/v1/gl/account/createBatchForSub', option),
    getSyncBABatch: (option) => fetch.post('/v1/gl/account/getSyncBABatch', option),
    createBatchForSubSyncBA: (option) => fetch.post('/v1/gl/account/createBatchForSubSyncBA', option),
    updateGuide: (option) => fetch.post('/v1/edf/menuguide/update', option),
    /**
     * 财务期初初始化设置状态接口
     * 参数：{"dynParams":"第二步的值"}
     */
    handEnteringStateTwo: (option) => fetch.post('/v1/gl/accountPeriodBegin/handEnteringStateTwo', option),
    afterOperateTargetGlAccount: (option) => fetch.post('/v1/gl/imp/afterOperateTargetGlAccount', option),
    getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}),
    setAccountGrade: (option) => fetch.post('/v1/gl/account/setAccountGradeSetting', option),
    findFirstUnusedCode: (option) => fetch.post('/v1/gl/account/findFirstUnusedCode', option),
    checkBeforeDelete: (option) => fetch.post('/v1/gl/account/checkBeforeDelete', option), //删除科目前的校验
    deleteWithBatch: (option) => fetch.post('/v1/gl/account/deleteWithBatch', option),
    checkBeforeDeleteWithBatch: (option) => fetch.post('/v1/gl/account/checkBeforeDeleteWithBatch', option), //批量删除科目前的校验
    getMaxSizeForBatchInsert: (option) => fetch.post('/v1/gl/account/getMaxSizeForBatchInsert', option),//获取批量插入时剩余可用的编码数
    availableDeleteAccounts: (option) => fetch.post('/v1/gl/account/queryAvailableAccountsWhenDeleteOneAccount', option),//获取删除科目后可流转的科目
    deleteWithOne: (option) => fetch.post('/v1/gl/account/deleteWithOne', option),//单个删除科目
}