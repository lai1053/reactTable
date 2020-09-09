/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'

const mockData = fetch.mockData
function initMockData() {
}
export default {
    financeinit: {
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
        "sourceIsAuxAccCalc": false, --原科目是否启用辅助项
         "needMatchAuxAccCalc":false, --是否需要匹配辅助项
         */
        matchInit: (option) => fetch.post('/v1/gl/accountPeriodBegin/matchInit', option),
        matchInitAsync: (option) => fetch.post('/v1/gl/accountPeriodBegin/matchInitAsync', option),
        getMatchInitStatus: (option) => fetch.post('/v1/gl/accountPeriodBegin/getMatchInitStatus', option),
        getStatus: (option) => fetch.post('/v1/gl/accountPeriodBegin/getStatus', option),
        /**
         * 忽略接口
         * 入参：{
		        "id":4972832818065408 --对照关系ID
	        }
         */
        handMatchIgnore: (option) => fetch.post('/v1/gl/accountPeriodBegin/handMatchIgnore', option),
        /**
         * 辅助项匹配确定接口
         */
        /**
         * 重新匹配确定接口
         */
		reHandMatch: (option) => fetch.post('/v1/gl/accountPeriodBegin/reHandMatch', option),
        handMatchAux: (option) => fetch.post('/v1/gl/accountPeriodBegin/handMatchAux', option),
        //自动创建
        reAutoMatch: (option) => fetch.post('/v1/gl/accountPeriodBegin/reAutoMatch', option),
        /**
         * 校验、把excel数据导入到期初
         */
        importData: () => fetch.post('/v1/gl/accountPeriodBegin/importData', {}),
        importDataAsync: () => fetch.post('/v1/gl/accountPeriodBegin/importDataAsync', {}),
        // getImportDataStatus: (option) => fetch.post('/v1/gl/accountPeriodBegin/getStatus', option),
        /**
         * 科目查询
         */
        accountQuery: (option) => fetch.post('/v1/gl/account/query', option),
        findFirstUnusedCode: (option) =>  fetch.post('/v1/gl/account/findFirstUnusedCode', option),
        /**
		 * 财务初始化科目匹配界面，科目增删改后置操作
            参数:{"operateStatus":2, -- 1新增 2修改 3删除
            "id":5182286174095360 --匹配关系ID}
		 */
        afterAccountOption: (option) => fetch.post('/v1/gl/accountPeriodBegin/afterAccountOption', option),
        /**
        * 检验科目是否还存在未匹配的记录
        */
        queryUnMatching: () => fetch.post('/v1/gl/accountPeriodBegin/queryUnMatching', {}),
        getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}),
        handMatchIgnoreForAll: () => fetch.post('/v1/gl/accountPeriodBegin/handMatchIgnoreForAll'),
        setBatchIgnoreTabNotShowNextTime: () => fetch.post('/v1/gl/accountPeriodBegin/setBatchIgnoreTabNotShowNextTime'),
        getUnit: (option) => fetch.post('v1/ba/unit/queryList', option),
        find: (option) => fetch.post('/v1/gl/account/getById', option),
        update: (option) => fetch.post('/v1/gl/account/update', option),
        used: (option) => fetch.post('/v1/gl/account/isUsedInCertificate', option),
        afterAccountOption: (option) => fetch.post('/v1/gl/accountPeriodBegin/afterAccountOption', option),
        getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}),
        setAccountGrade: (option) => fetch.post('/v1/gl/account/setAccountGradeSetting', option),
        checkBeforeDelete: (option) =>  fetch.post('/v1/gl/account/checkBeforeDelete', option), //删除科目前的校验
        /**
         * 科目匹配筛选
         */
        queryMatchData: (option) => fetch.post('/v1/gl/accountPeriodBegin/queryMatchData', option),
        getMaxSizeForBatchInsert: (option) => fetch.post('/v1/gl/account/getMaxSizeForBatchInsert', option)//获取批量插入时剩余可用的编码数

    }

}