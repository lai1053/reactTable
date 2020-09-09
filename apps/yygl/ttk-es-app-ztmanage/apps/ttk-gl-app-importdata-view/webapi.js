/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'
export default {
  importapi: {
    //获取当前步数
    getImpAccountStep: () => fetch.post('/v1/gl/imp/getImpAccountStep', {}),
    //基础档案
    // basearchive: () => fetch.post('/v1/ba/basearchive/importData'),
    importDataAsync: () => fetch.post('/v1/edf/basearchive/importDataAsync'),
    importDataStatus: (option) => fetch.post('/v1/edf/basearchive/importDataStatus', option),
    /**
     * 删除
     */
    delete: (option) => fetch.post('/v1/gl/account/delete', option),
    /**
     * 批量新增
     */
    batchAdd: (option) => fetch.post('/v1/gl/account/createBatchForSub', option),
    /**
     * 匹配界面初始化
     * 入参：{"onlyQuery":false --是否近查询（直接跳转匹配页面时传true）}
    返回：
    "autoMatch": 1,    --0:什么都不显示 1:已匹配科目 2:系统自动创建 3:系统自动创建（重新匹配） -3:系统自动创建（重新匹配/忽略） 4:重新匹配 -4:重新匹配/忽略 5:已匹配科目（重新匹配）
    */
    // matchInit: (option) => fetch.post('/v1/gl/imp/matchInit', option),
    matchInitAsync: (option) => fetch.post('/v1/gl/imp/matchInitAsync', option),
    getMatchInitStatus: (option) => fetch.post('/v1/gl/imp/getMatchInitStatus', option),
    /**
     * 忽略接口
     *{
        "AcctID":"1001", --原科目编码
      }
     */
    ignoreImpGlAccountRelation: (option) => fetch.post('/v1/gl/imp/ignoreImpGlAccountRelation', option),

    /**
     * 自动创建接口
     *{
        "AcctID":"1001", --原科目编码
      }
     */
    autoCreate: (option) => fetch.post('/v1/gl/imp/autoCreate', option),
    /**
     * 校验、把excel数据导入到期初
     */
    importData: () => fetch.post('/v1/gl/accountPeriodBegin/importData', {}),
    /**
     * 科目查询
     */
    accountQuery: (option) => fetch.post('/v1/gl/account/query', option),
    /**
     * 获取科目级次
     */
    getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}),
    /**
     * 设置步骤
     */
    setImpAccountStep: (option) => fetch.post('/v1/gl/imp/setImpAccountStep', option),

    //导入
    import: () => fetch.post('/v1/gl/imp/upgrade'),
    upgradeAsync: (option) => fetch.post('/v1/gl/imp/upgradeAsync', option),
    getUpgradeStatus: (option) => fetch.post('/v1/gl/imp/getUpgradeStatus', option),
    /**
     * 检查是否所有科目都已做重新匹配或忽略
     */
    isAllHandled: () => fetch.post('/v1/gl/imp/isAllHandled', {}),

    //导入完成更新org
    importAccountFinished: (option) => fetch.post('/v1/edf/sysOrg/ImportAccountFinished', option),
    afterOperateTargetGlAccount: (option) => fetch.post('/v1/gl/imp/afterOperateTargetGlAccount', option),
    /**
 * 批量忽略
 */
    ignoreImpGlAccountRelationBatch: () => fetch.post('/v1/gl/imp/ignoreImpGlAccountRelationBatch', {}),
    /**
     * 获取导入信息
     */
    getSuccessAndFailedCountForSJB: () => fetch.post('/v1/edf/importaccount/getSuccessAndFailedCountForSJB'),
    /**
     * 上传文件
     */
    saveImportAccountInfoForThirdParty: (option) => fetch.post('/v1/edf/importaccount/saveImportAccountInfoForThirdParty', option),

    /**
      * 获取财务余额表加密数据
      */
    getEncryptedData: (option) => fetch.post('/v1/gl/sjb/getData', option),
    /**
     * 获取密文对应的uuid
     */
    getEncryptedUuid: (option) => fetch.post('/v1/gl/sjb/getUuid', option),
    /**
     * 科目查询
     */
    accountQuery: (option) => fetch.post('/v1/gl/account/query', option),
    setAccountGrade: (option) => fetch.post('/v1/gl/account/setAccountGradeSetting', option),
    /**
     * 检验科目是否还存在未匹配的记录
     */
    queryUnMatch: () => fetch.post('/v1/gl/imp/queryUnMatch', {}),
    queryMatchData: (option) => fetch.post('/v1/gl/imp/queryMatchData', option),
    findFirstUnusedCode: (option) => fetch.post('/v1/gl/account/findFirstUnusedCode', option),
    checkBeforeDelete: (option) => fetch.post('/v1/gl/account/checkBeforeDelete', option), //删除科目前的校验
    getMaxSizeForBatchInsert: (option) => fetch.post('/v1/gl/account/getMaxSizeForBatchInsert', option),//获取批量插入时剩余可用的编码数
    /**
    * 判断上传文件中是否包含资产数据
    */
    assetIsExist: () => fetch.post('/v1/gl/asset/imp/assetIsExist')
  }

}